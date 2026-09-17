# paulbauriegel/fungitastic-dinov3-vits16-384

## Resumen

FungiTastic DINOv3 ViT-S/16 @ 384 px es un clasificador de imágenes de grano fino especializado en hongos y setas, publicado por el usuario paulbauriegel. Se construye fine-tuneando el backbone auto-supervisado DINOv3 ViT-S/16 (21,6 M de parámetros, preentrenado sobre LVD-1689M) para resolver el benchmark de conjunto cerrado FungiTastic, que cubre 2.827 especies. El resultado es un modelo de 22,7 M de parámetros que alcanza un 72,63 % de top-1 sobre el split de test completo (91.832 imágenes, 2.336 especies presentes), sin test-time augmentation y con una sola imagen de entrada.

La relevancia del modelo es de eficiencia: se queda a 2,7 puntos del mejor baseline publicado en el artículo del dataset (BEiT-Base/16 a 384 px, 75,3 % top-1) siendo aproximadamente cuatro veces más pequeño, y además lo supera en macro F1 (45,93 frente a 44,5). Esa combinación de tamaño reducido y precisión competitiva lo sitúa como una opción viable para despliegue en dispositivos: se distribuye tanto como checkpoint de PyTorch para timm como en formato TensorFlow Lite / LiteRT con el preprocesado integrado en el grafo, pensado para aplicaciones Android que reciben píxeles de cámara en bruto.

El modelo no es un modelo de lenguaje ni multimodal generativo: es un clasificador de visión puro con una entrada fija de 384x384 y una salida de 2.827 logits, uno por especie. Su limitación principal es la cola larga: la precisión cae hasta el 27,2 % top-1 en especies con menos de 20 imágenes de entrenamiento, frente al 82,9 % en especies con más de 500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/16) con backbone DINOv3, cabeza de clasificacion lineal sobre 2.827 clases |
| Parametros totales | 22,7 M (backbone base: 21,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 384x384 px (parche 16x16) |
| Tipos de cuantizacion | no disponibles; los artefactos publicados son float32 (91 MB en ambos formatos) |
| Idiomas soportados | no disponible (tarea de clasificacion de imagenes, sin componente de texto) |
| Licencia | dinov3-license (licencia personalizada de Meta, ver enlace) |
| Formato de pesos | PyTorch (`best.pt`, 91 MB, diccionario con `model_state`, `model_name`, `img_size`, `num_classes`, `labels`) y TensorFlow Lite / LiteRT (`mushroom_model_dynamic.tflite`, 91 MB, float32) |

Otros datos de despliegue: entrada `[1, 384, 384, 3]` en float32 NHWC (0-255, el preprocesado esta integrado en el grafo TFLite) y salida `[1, 2827]` en logits. El repositorio incluye `labels.txt` con los 2.827 nombres de especie alineados por indice con la salida y `export_info.json` con metadatos de exportacion.

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer pequeno (ViT-S/16) procedente del backbone DINOv3 `timm/vit_small_patch16_dinov3.lvd1689m`, auto-supervisado sobre el corpus LVD-1689M. Sobre ese backbone se anade una cabeza de clasificacion para 2.827 especies. El entrenamiento se planteo como una escalera de resolucion en tres etapas, cada una inicializada desde el mejor checkpoint de la anterior: etapa 1 con FungiTastic-Mini (214 especies) a 224 px, top-1 de validacion 0,731; etapa 2 con FungiTastic completo y cabeza nueva a 320 px, 0,719; y etapa 3 con FungiTastic completo a 384 px, 0,733. La etapa final entreno durante 4 epocas sobre 433.702 imagenes con AdamW, learning rate de 2,5e-4 para la cabeza y 1e-5 para el backbone con decaimiento por capa de 0,8, schedule coseno con warmup, weight decay 0,05, label smoothing 0,1 y clipping de gradiente en 1,0, con batch 16 y acumulacion de gradiente 2 en fp32 sobre Apple Silicon (MPS).

El aspecto tecnico mas destacable es el tratamiento del desbalance extremo de clases. Se aplico muestreo balanceado con pesos de frecuencia inversa con raiz cuadrada para la cola larga, y se mantuvo una media movil exponencial (EMA) de los pesos con decaimiento 0,9999 evaluada en cada epoca, publicando el mejor entre los pesos crudos y los EMA. La aumentacion incluyo random resized crop (escala 0,5-1,0), volteo horizontal, jitter suave de brillo y contraste, y Mixup 0,2 / CutMix 1,0 en la mitad de los lotes. Cabe senalar que el entrenamiento se realizo en un portatil con Apple M2, a unas 19 horas por epoca.

## Capacidades

- Clasificacion de imagenes de grano fino sobre 2.827 especies de hongos y setas (conjunto cerrado), devolviendo logits por clase.
- Salida top-k con probabilidades normalizadas mediante softmax (el modelo solo emite logits, la normalizacion corre a cargo del usuario).
- Integracion de preprocesado en el grafo TFLite: acepta pixeles en bruto en el rango 0-255 y realiza la normalizacion internamente, lo que simplifica el despliegue movil.
- Inferencia en CPU a baja latencia: aproximadamente 0,13 s por imagen en una CPU Apple M2 con XNNPACK y 4 hilos.
- Exportacion a Android mediante LiteRT (`ai_edge_litert.interpreter`), con entrada directa de buffers float desde un bitmap redimensionado a 384x384.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, soporte de agentes, capacidades multilingues, modo thinking, audio ni video.

## Casos de uso

- Identificacion de setas en aplicaciones moviles: el modelo se ejecuta integramente en el dispositivo a partir de la camara del telefono, con latencia de ~0,13 s por imagen en CPU, lo que permite dar una prediccion top-3 al usuario sin conexion ni envio de imagenes a un servidor.
- Herramientas de campo para micologos y aficionados: clasificacion asistida con top-3 (84,84 % de acierto en test) para acotar candidatas antes de una verificacion manual con guias taxonomicas.
- Catalogacion de biodiversidad: procesamiento por lotes de colecciones fotograficas de herbarios o inventarios de biodiversidad para preetiquetar especies y acelerar la anotacion manual, asumiendo que la revision humana sigue siendo necesaria en especies raras.
- Aplicaciones de ciencia ciudadana: preclasificacion automatica de imagenes subidas por usuarios (por ejemplo, en plataformas tipo iNaturalist) para sugerir una especie candidata y reducir la carga de moderacion experta.
- Filtrado y triaje en pipelines de vision: descarte rapido de imagenes que no corresponden a hongos o seleccion de las que requieren analisis posterior, dado el bajo coste computacional de 22,7 M de parametros.
- Educacion y divulgacion: aplicaciones didacticas que muestran las tres especies mas probables con sus probabilidades, utiles para ensenar taxonomia de hongos y advertir sobre especies toxicas.
- Investigacion en clasificacion de grano fino: servir de baseline ligero (22,7 M de parametros) para comparar tecnicas de manejo de cola larga, dado el desglose de precision por numero de imagenes por especie publicado por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test completo de FungiTastic en conjunto cerrado: 91.832 imagenes, 2.336 especies presentes, una sola imagen y sin test-time augmentation.

| Metrica | Valor |
|---|---|
| Top-1 | 0,7263 |
| Top-3 | 0,8484 |
| Macro F1 | 0,4593 |
| Perdida de entropia cruzada | 1,432 |

Validacion sobre un subconjunto fijo de 15.000 imagenes en la epoca seleccionada: top-1 0,7327, top-3 0,855, macro F1 0,482.

Precision en test segun el numero de imagenes de entrenamiento por especie, que ilustra el problema de cola larga:

| Imagenes de entrenamiento por especie | Especies | Top-1 en test |
|---|---|---|
| < 20 | 325 | 0,272 |
| 20-50 | 594 | 0,404 |
| 50-100 | 439 | 0,534 |
| 100-500 | 749 | 0,711 |
| > 500 | 227 | 0,829 |

Ejemplo de especie bien representada, *Imleria badia* (1437 imagenes de entrenamiento, 417 de test): precision 0,882, recall 0,861, F1 0,871.

Comparacion con el mejor baseline del articulo del dataset:

| Modelo | Top-1 | Macro F1 |
|---|---|---|
| fungitastic-dinov3-vits16-384 (22,7 M) | 0,7263 | 0,4593 |
| BEiT-Base/16 @ 384 px | 0,753 | 0,445 |

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 22,7 M de parametros en float32, los pesos ocupan aproximadamente 91 MB; el pico de memoria con activaciones a 384x384 es de unos pocos cientos de MB, por lo que cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU y en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) sin cuello de botella, y tambien en aceleradores integrados de moviles gracias a la ruta LiteRT.
- Compatibilidad con GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU. No se necesita A100 ni H100; seria un desperdicio de recursos.
- Opciones de despliegue: PyTorch con `timm` (carga directa del `best.pt`), TensorFlow Lite / LiteRT mediante `ai_edge_litert.interpreter`, y despliegue en Android con el modelo TFLite y XNNPACK. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: aproximadamente 0,13 s por imagen en una CPU Apple M2 con XNNPACK y 4 hilos en una maquina ociosa, segun el autor. En GPU el throughput seria muy superior, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Top-1 en FungiTastic (test) | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fungitastic-dinov3-vits16-384 | 22,7 M | 384 px | 0,7263 | 0,4593 | dinov3-license | HuggingFace (PyTorch + TFLite) |
| BEiT-Base/16 (baseline del paper) | ~86 M | 384 px | 0,753 | 0,445 | no disponible en esta informacion | baseline del articulo del dataset |
| DINOv3 ViT-S/16 (`timm/vit_small_patch16_dinov3.lvd1689m`) | 21,6 M | variable | no disponible (backbone auto-supervisado sin cabeza de clasificacion de hongos) | no disponible | dinov3-license | HuggingFace via timm |

La comparacion principal es con BEiT-Base/16 a 384 px: el modelo de esta ficha sacrifica 2,7 puntos de top-1 a cambio de ser aproximadamente cuatro veces mas pequeno y de mejorar el macro F1 en 1,4 puntos, lo que indica un comportamiento mas equilibrado en la cola larga. No se dispone de datos de otros clasificadores de hongos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Cola larga: la precision cae drasticamente en especies con pocas imagenes de entrenamiento (27,2 % top-1 con menos de 20 imagenes frente a 82,9 % con mas de 500). El macro F1 de 0,4593 refleja este desequilibrio y hace que el rendimiento global agregado sea enganoso.
- Conjunto cerrado: el modelo solo puede predecir entre las 2.827 especies de FungiTastic. Ante una imagen de una especie no incluida, o ante una imagen que no sea un hongo, devolvera igualmente una de las clases conocidas con una confianza potencialmente alta.
- Riesgo de confusion entre especies visualmente similares, especialmente entre hongos comestibles y toxicos. El uso del modelo para decidir si una seta es apta para consumo es peligroso y no debe contemplarse.
- Sin test-time augmentation ni informacion de contexto: solo una imagen por inferencia, sin metadatos de geolocalizacion, sustrato o estacion del ano, que son senales relevantes en micologia.
- Licencia dinov3-license: es una licencia personalizada (no una licencia estandar de codigo abierto) y hay que revisar sus terminos, incluidos los requisitos de atribucion y las restricciones de uso comercial, antes de integrar el modelo en un producto.
- Sesgos de dominio: el modelo se entreno sobre FungiTastic, por lo que su rendimiento puede degradarse fuera de las condiciones de captura, camara y distribucion geografica de ese dataset.
- Datos de benchmark no verificados: las metricas del model-index estan marcadas como `verified: false`, es decir, son declaraciones del autor sin validacion independiente.
- Modelo puramente de vision: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/paulbauriegel/fungitastic-dinov3-vits16-384
- Modelo base DINOv3 ViT-S/16: https://huggingface.co/timm/vit_small_patch16_dinov3.lvd1689m
- Dataset FungiTastic: https://huggingface.co/datasets/BohemianVRA/FungiTastic
- Articulo de referencia (arxiv:2508.10104): https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
