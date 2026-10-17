# Kairoi-LLC/siglip2-base-patch16-224-litert

## Resumen
SigLIP 2 B/16 image tower for LiteRT es una conversion a LiteRT/TFLite de la torre de vision (image tower) del modelo multimodal SigLIP 2 base patch16 a 224 px de Google. La conversion la firma Kairoi-LLC para el motor de busqueda de fotos en dispositivo de su aplicacion Woven. No es un modelo de generacion de texto ni un modelo completo de vision-lenguaje: contiene unicamente el codificador de imagen, sin la torre de texto, y su unica funcion es producir embeddings de imagen (image features) que despues se comparan con embeddings de texto generados aparte.

El artefacto es un unico fichero `.tflite` de pesos fp32 de unos 370 MB, con lote fijo de 8 imagenes de 224x224 y salida de vectores de 768 dimensiones. El objetivo del autor es ejecutar el modelo en el acelerador GPU de LiteRT en fp16 sin perder fidelidad respecto a los vectores fp32 originales, algo que requirio reescribir dos partes del grafo (las LayerNorm y la cabeza de attention pooling).

Su relevancia es practica: demuestra que un codificador SigLIP 2 puede correr con perdida minima de calidad en GPUs moviles (Apple Metal, Mali en Pixel) y en escritorio (WebGPU sobre Vulkan), con latencias de milisegundos por imagen, lo que habilita busqueda visual y clasificacion de imagenes totalmente local, sin subir datos a la nube.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) de SigLIP 2, torre de imagen; parche de 16, resolucion 224x224. Cabeza de attention pooling para obtener el embedding |
| Parametros totales | No disponible de forma oficial; el fichero de pesos fp32 ocupa ~370 MB, lo que sugiere del orden de 90 millones de parametros (inferencia, no confirmada por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: entrada de imagen fija de 224x224, lote fijo de 8 |
| Tipos de cuantizacion | Pesos en fp32; la ejecucion en GPU se hace en fp16 (la CPU de LiteRT da resultados identicos a fp32). No se distribuyen pesos int8 de este artefacto; la torre de texto con la que se empareja se uso cuantizada a int8 para medir el recall |
| Idiomas soportados | No disponible (el artefacto no incluye la torre de texto; el idioma lo determina la torre de texto con la que se empareje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT), un fichero `.tflite`; SHA-256 `16152dea21213077cc3202578d64ca73bac6c41ab6953c848b1d4526027e40e9` |

## Arquitectura y entrenamiento
El modelo base es `google/siglip2-base-patch16-224`, un sistema de vision-lenguaje de tipo dual-tower. Esta ficha cubre exclusivamente la conversion de su torre de imagen, un Vision Transformer base con parches de 16x16 sobre entradas de 224x224. El modelo produce, mediante una cabeza de attention pooling aprendida, un embedding agrupado y proyectado de 768 dimensiones por imagen (`get_image_features`), sin normalizar. El lote de entrada esta fijado en 8: `args_0` es un tensor f32 `[8, 3, 224, 224]` en formato NCHW, RGB, normalizado como `(pixel / 255 - 0.5) / 0.5` y redimensionado con interpolacion bilineal directa a 224x224. La salida `output_0` es f32 `[8, 768]`.

No se realizo entrenamiento ni ajuste fino: los pesos son los originales de Google (revision `75de2d55ec2d0b4efc50b3e9ad70dba96a7b2fa2`). La unica modificacion respecto al grafo original es funcional, orientada a que la GPU pueda ejecutar todo el modelo en fp16. Primero, cada LayerNorm escala su entrada por 1/64 (con epsilon reajustado en consecuencia), un cambio que no altera el resultado matematico pero evita desbordamientos de fp16, ya que a partir de la capa 10 el flujo residual de SigLIP alcanza valores en torno a 700 y las diferencias al cuadrado superan el limite de fp16 (65.504). Sin este ajuste, los vectores fp16 de la GPU daban una similitud coseno de 0,69-0,75 frente a fp32. Segundo, la cabeza de attention pooling se reescribio con operaciones en 4-D (la query de la sonda se proyecta una vez y las puntuaciones y la suma ponderada por cabeza son un producto broadcast y una suma), porque la `nn.MultiheadAttention` original generaba un reshape 5-D con `BROADCAST_TO` y una transposicion que el delegado GPU rechazaba, dejando 36 operaciones en CPU. La conversion se hizo con `litert-torch` 0.9.4, torch 2.13.0 y transformers 4.57.1, y el script comprueba previamente que la torre reescrita coincide con la original en fp32 (coseno >= 0,99999).

## Capacidades
- Extraccion de embeddings de imagen: genera un vector de 768 dimensiones por imagen, agrupado y proyectado, listo para busqueda por similitud.
- Recuperacion texto-imagen (retrieval): al emparejarse con la torre de texto de SigLIP 2 y normalizar ambos vectores a L2, permite calcular similitud entre imagenes y descripciones textuales.
- Procesamiento por lotes de 8 imagenes simultaneas (lote fijo; las posiciones sobrantes se rellenan y se descartan sus filas de salida).
- Ejecucion en dispositivo en aceleracion GPU mediante LiteRT: Apple Metal, Mali en Android y WebGPU sobre Vulkan en escritorio.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling ni capacidades de agente: es un codificador de vision puro.
- No incluye la torre de texto: la parte textual del pipeline hay que aportarla con otro artefacto compatible.
- No incluye capacidades de audio ni de video; la entrada es imagen fija a 224x224.

## Casos de uso
- Busqueda de fotos en dispositivo: indexar la fototeca del usuario calculando embeddings locales y buscar por descripcion textual una vez emparejado con la torre de texto, sin enviar imagenes a la nube. Es el escenario para el que el autor lo construyo.
- Deduplicacion y deteccion de copias casi identicas: las mediciones sobre INRIA Copydays (157 originales y sus ediciones fuertes, 386 imagenes) muestran que el modelo mantiene similitud alta frente a ediciones, util para detectar duplicados y modificaciones.
- Clasificacion de documentos escaneados: con RVL-CDIP (1.600 documentos, 16 clases) sirve como extractor para clasificar documentos por su representacion visual.
- Procesamiento de recibos y formularios: aplicado a CORD-v2 (100 recibos) y FUNSD (199 formularios) para tareas de extraccion y agrupacion visual.
- Busqueda visual en entornos sin conectividad o con requisitos de privacidad: al correr en GPU movil (iPhone, Pixel) con latencias de decenas de milisegundos, permite busqueda y agrupacion de imagenes totalmente offline.
- Clustering semantico y moderacion de contenido: agrupar imagenes por similitud o filtrar imagenes planas y anomalas; el autor verifico que ninguna salida es NaN, incluidas imagenes en negro, blanco, gris y rojo planas.
- Base para pipelines RAG multimodales: usar los embeddings de imagen como indice vectorial junto a un modelo de lenguaje que consuma los resultados recuperados.
- Preprocesado en capturas de pantalla: el autor midio sobre 300 capturas de la propia aplicacion, lo que lo hace aplicable a indexacion de pantallas o interfaces.

## Benchmarks y rendimiento
Evaluacion realizada por el autor sobre 9.089 imagenes (COCO val2017 5.000, Flickr30k test 1.000, RVL-CDIP test 1.600, CORD-v2 100, FUNSD 199, INRIA Copydays 157 originales mas 386 imagenes con ediciones, 300 capturas de la app, 500 copias editadas de fotos COCO y varias imagenes planas). Se compara contra el modelo original en fp32 (`vision_model.onnx` de onnx-community) sobre los mismos pixeles.

| Plataforma | Coseno min · p5 · mediana (peor conjunto) | Recall@1 / @5, COCO 5k · Flickr30k 1k | mAP de una palabra, COCO |
|---|---|---|---|
| fp32 original | — | 46,5 / 71,0 · 75,9 / 92,6 | 0,729 |
| LiteRT CPU (Mac) | 1,00000 · 1,00000 · 1,00000 (todos los conjuntos) | 46,5 / 71,0 · 75,9 / 92,6 | 0,729 |
| LiteRT GPU fp16, Apple M5 (Metal) | 0,9951 · 0,9986 · 0,9995 (RVL-CDIP) | 46,3 / 71,1 · 75,9 / 92,6 | 0,730 |
| LiteRT GPU fp16, Pixel 8 Pro (Mali) | 0,9882 · 0,9969 · 0,9992 (RVL-CDIP) | 46,5 / 71,2 · 75,9 / 92,6 | 0,734 |
| LiteRT GPU fp16, iPhone 13 mini (Metal) | min 0,9940 (COCO); mediana 0,9994-0,9998 por conjunto | 46,4 (COCO R@1) | 0,734 |
| LiteRT GPU fp16, NVIDIA RTX 3090 (WebGPU sobre Vulkan, Linux) | min 0,9967 (FUNSD); mediana 0,9997-0,99996 por conjunto | 46,3 (COCO R@1) | 0,730 |

Tiempos medidos con lote 8: 3,8 ms por imagen en Metal sobre Mac, 7-10 ms en RTX 3090, 36,6 ms en iPhone 13 mini, 44-54 ms en GPU de Pixel (aumenta al calentarse) y 16,7 ms en CPU de LiteRT sobre Mac. El primer arranque (lectura, compilacion y comprobacion de referencia) tardo 1,7 s en Mac, 3,0 s en RTX 3090, 5,1 s en Pixel y 8,0 s en iPhone.

## Requisitos de hardware
- VRAM: no disponible de forma explicita. El fichero de pesos fp32 ronda los 370 MB, por lo que la huella en memoria es moderada. El lote esta fijo en 8 imagenes de 224x224.
- GPU compatibles segun las pruebas del autor: Apple Metal (M5, iPhone 13 mini), Mali en Android (Pixel 8 Pro), NVIDIA RTX 3090 y WebGPU sobre Vulkan en Linux. Hay soporte de CPU LiteRT (Mac) con resultados identicos a fp32.
- Cabe en GPU de consumo y movil: si, es el objetivo del artefacto. Apple M5, Pixel 8 Pro, iPhone 13 mini y RTX 3090 estan validados.
- Opciones de despliegue: LiteRT con delegado GPU (Metal, Mali, WebGPU/Vulkan) o CPU. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- Latencia estimada a lote 8: 3,8 ms/imagen (Metal, Mac), 7-10 ms (RTX 3090), 36,6 ms (iPhone 13 mini), 44-54 ms (GPU Pixel), 16,7 ms (CPU Mac).
- Nota de integracion: conviene descargar el fichero por URL de commit (`/resolve/<40-hex>/<file>`) y verificar el SHA-256. El preprocesado de redimensionado importa: un reduccion por muestreo de punto sin antialiasing bajo la mediana de coseno a 0,89-0,98; hay que usar un resize bilineal suavizado como el de PIL.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kairoi-LLC/siglip2-base-patch16-224-litert | Torre de imagen SigLIP 2 convertida | No disponible (fichero ~370 MB fp32) | 224x224, lote fijo 8 | TFLite/LiteRT | Apache-2.0 | HuggingFace, GPU movil y escritorio |
| google/siglip2-base-patch16-224 | SigLIP 2 completo (vision + texto) | No disponible | 224x224 | PyTorch/safetensors | Apache-2.0 | HuggingFace |
| onnx-community/siglip2-base-patch16-224-ONNX | SigLIP 2 completo en ONNX | No disponible | 224x224 | ONNX | Apache-2.0 | HuggingFace; usado como referencia fp32 |
| CLIP ViT-B/16 | Vision-lenguaje dual-tower (alternativa clasica) | No disponible de forma oficial | 224x224 | safetensors, ONNX | MIT (CLIP original) | HuggingFace |

El elemento diferenciador de este artefacto no es la calidad bruta (equivalente a SigLIP 2 B/16) sino el formato y la ejecucion: peso optimizado para GPU en dispositivo con perdida de calidad minima, frente a los artefactos PyTorch/ONNX que no estan pensados para aceleracion movil.

## Limitaciones y advertencias
- Solo contiene la torre de imagen: sin la torre de texto no puede hacer retrieval texto-imagen por si solo; hay que emparejarlo con una torre de texto compatible (por ejemplo la de onnx-community) y normalizar ambos vectores a L2.
- Lote fijo de 8: no admite otros tamanos de lote sin rellenar y descartar filas, lo que complica su uso en serving variable.
- Sensibilidad al preprocesado: los resultados de similitud se degradan notablemente si el resize no es bilineal suavizado (medianas de coseno de 0,89-0,98 con muestreo de punto), por lo que hay que replicar exactamente el pipeline de normalizacion descrito.
- Deriva en documentos escaneados: los conjuntos de documentos (RVL-CDIP, FUNSD) son donde aparece la menor similitud frente a fp32 (minimo 0,9882-0,9967), aunque se mantenga alta.
- Desbordamiento fp16: el modelo funciona en fp16 en GPU solo gracias a la reescritura de las LayerNorm; no debe usarse el grafo stock en fp16 sin ese ajuste.
- No publica resultados de sesgos ni evaluaciones de equidad, ni datos de composicion del dataset de entrenamiento original.
- Sin datos de idiomas: cualquier limitacion linguistica depende de la torre de texto que se le acople.
- Uso comercial: la licencia Apache-2.0 lo permite, incluida la redistribucion como obra modificada, siempre que se conserve la licencia y los avisos; el autor indica que el repositorio original no tenia fichero NOTICE.
- Alucinacion: no aplica en sentido generativo (no produce texto), pero la similitud de embeddings puede dar falsos positivos en busquedas; conviene umbralizar y validar.
- Riesgo en produccion: la verificacion de integridad por SHA-256 es recomendable, dado que el artefacto es un binario compilado.

## Enlaces
- HuggingFace: https://huggingface.co/Kairoi-LLC/siglip2-base-patch16-224-litert
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Torre de texto compatible (ONNX): https://huggingface.co/onnx-community/siglip2-base-patch16-224-ONNX
- Repositorio Woven (script de conversion y metodologia): mencionado en la model card como `scripts/models/convert-siglip2-litert.py` y la documentacion `docs/brand/research/AI-RUNTIME-COMPARISON-2026-09.md` (seccion 9-10); URL no disponible.
- Herramienta de conversion: `litert-torch` 0.9.4 (Apache-2.0); URL no disponible.
- Licencia: Apache License 2.0, texto completo en el fichero `LICENSE` del repositorio.
