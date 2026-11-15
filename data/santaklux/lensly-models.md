# santaklux/lensly-models

## Resumen

Lensly models es un repositorio de artefactos de inferencia, no un modelo entrenado por su autor. Contiene exportaciones en formato ExecuTorch (`.pte`) de dos sistemas preexistentes: los codificadores de imagen y texto de SigLIP2 (concretamente `google/siglip2-base-patch32-256`, de Google) y un extractor de embeddings faciales de OpenCV Zoo (SFace, version 2021dec). El proposito es servir de backend on-device a Lensly, una aplicacion privada de busqueda de fotos para Android que ejecuta todo el pipeline en el dispositivo sin enviar imagenes a la nube.

El interes tecnico esta en el empaquetado: los codificadores de SigLIP2 se han convertido a ExecuTorch con el backend XNNPACK y cuantizacion int8, apuntando a CPUs ARM64 de Android. El encoder de texto lleva un padding fijo de 64 tokens incrustado en el grafo, una decision de diseno habitual en despliegues moviles para evitar formas dinamicas. El repositorio ocupa unos 0,1 GB.

Por su naturaleza, no es un modelo de proposito general ni un LLM: no genera texto, no razona y no conversa. Es una pieza de infraestructura para recuperacion imagen-texto (CLIP-style) y reconocimiento facial, util para quien quiera replicar o auditar un pipeline multimodal on-device con ExecuTorch. La licencia Apache-2.0 hereda de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (transformer dual image/text encoder) + SFace (CNN de reconocimiento facial) |
| Parametros totales | no disponible (SigLIP2 base-patch32-256; cifra exacta no publicada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (padding fijo incrustado en el encoder de texto) |
| Tipos de cuantizacion | int8 (encoder de imagen y encoder de texto); fp32 (SFace) |
| Idiomas soportados | no disponibles (se incluye un tokenizer ingles podado y el tokenizer completo) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch, backend XNNPACK, arm64 Android); tokenizers en JSON |
| Tamano del repositorio | ~0,1 GB |
| Modelo base | google/siglip2-base-patch32-256 |
| Libreria | executorch |
| Resolucion de imagen | 256x256, patch 32 (inferido del nombre del modelo base) |

## Arquitectura y entrenamiento

El autor no entrena ningun componente: el repositorio es una coleccion de conversiones de formato. SigLIP2 es la evolucion de SigLIP de Google, un modelo de alineacion imagen-texto con funcion de perdida sigmoidea en lugar de softmax contrastivo, disenado originalmente para retrieval y clasificacion zero-shot. La variante `base-patch32-256` usa parches de 32x32 sobre entradas de 256x256, lo que reduce el coste computacional frente a variantes de mayor resolucion. El encoder de texto exportado tiene un padding fijo de 64 tokens, lo que limita las consultas a frases cortas.

El segundo componente, SFace (OpenCV Zoo, version 2021dec), es un embedder facial que produce vectores de 128 dimensiones, exportado en fp32. Se usa para identificar rostros en la busqueda local de fotos. Ambos modelos se han exportado con ExecuTorch y el delegado XNNPACK, orientado a CPUs ARM64 de Android. No hay informacion sobre datos de entrenamiento, tokens vistos, RLHF/DPO ni innovaciones de decodificacion, ya que el autor no entrena ni modifica los pesos mas alla de la conversion y cuantizacion.

## Capacidades

- Recuperacion imagen-texto: embedding de imagenes y de consultas textuales en un espacio comun para busqueda semantica de fotos.
- Similitud texto-imagen estilo CLIP/SigLIP para ranking de resultados.
- Extraccion de embeddings faciales de 128 dimensiones mediante SFace.
- Inferencia totalmente on-device y offline en Android (arm64, XNNPACK).
- Cuantizacion int8 de los encoders SigLIP2 para reducir huella de memoria y latencia en movil.
- Tokenizer ingles podado (y tokenizer completo alternativo) para consultas cortas.
- Verificacion de integridad mediante SHA-256 contra un manifiesto fijado en el codigo de la app.

No soporta generacion de texto, tool calling, agentes, vision generativa, audio ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica de fotos en el dispositivo: la app indexa las imagenes con el encoder SigLIP2 int8 y compara el embedding de la consulta textual con los vectores almacenados, sin salir del telefono. Adecuado por el bajo coste de un encoder base cuantizado.
- Clasificacion y etiquetado zero-shot de imagenes: usar los embeddings para asignar etiquetas a fotos mediante similitud con descripciones textuales, util en galerias personales.
- Agrupacion de rostros en albumes locales: SFace genera vectores de 128 dimensiones que permiten clustering de caras sin conexion.
- Deduplicacion y organizacion de bibliotecas fotograficas: comparar embeddings para detectar imagenes similares y agruparlas.
- Filtrado de contenido en apps de fotografia: puntuar imagenes contra consultas de texto para descartar o priorizar segun criterios.
- Referencia de exportacion para desarrolladores: sirve como ejemplo practico de conversion de SigLIP2 a ExecuTorch con XNNPACK e int8, reutilizable en otros proyectos Android.
- Auditoria de privacidad: al ejecutarse offline y verificar SHA-256 de cada artefacto, es util en escenarios donde no se permite enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el destino es CPU ARM64 de Android, no GPU.
- Memoria estimada: el repositorio completo ocupa ~0,1 GB, lo que da una idea del orden de magnitud de los artefactos; el consumo en ejecucion no esta documentado.
- GPU recomendadas: no aplica. El backend es XNNPACK sobre CPU.
- Dispositivos objetivo: telefonos Android arm64. No se especifican modelos ni versiones minimas de Android.
- Cabe en consumer GPU: no es el objetivo; el despliegue es movil.
- Opciones de despliegue: ExecuTorch (runtime oficial) con backend XNNPACK; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Lensly models (este repo) | SigLIP2 int8 + SFace, exportado | no disponible | 64 tokens de texto | Apache-2.0 | ExecuTorch `.pte`, Android |
| google/siglip2-base-patch32-256 | SigLIP2 original | no disponible | texto variable | Apache-2.0 | PyTorch/safetensors, servidor o GPU |
| OpenCV Zoo SFace | Embedder facial | no disponible | no aplica | Apache-2.0 | ONNX / OpenCV DNN |
| CLIP ViT-B/32 (OpenAI) | CLIP original | ~151M (cifra publica del modelo CLIP base) | 77 tokens | MIT | PyTorch, servidor |

La diferencia principal frente a los originales es el formato y el objetivo: este repositorio prioriza ejecucion offline en movil con cuantizacion int8, a costa de contexto de texto fijo y posibles perdidas de precision por la conversion.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es una conversion de formato; los meritos y sesgos corresponden a SigLIP2 y SFace.
- Contexto de texto fijo de 64 tokens: consultas largas se truncan y pueden degradar la recuperacion.
- Tokenizer podado en ingles: el soporte multilingue es limitado salvo que se use el tokenizer completo, y aun asi el modelo base no esta optimizado para todos los idiomas.
- Cuantizacion int8: puede introducir perdida de precision en los embeddings respecto al modelo fp32 original.
- Reconocimiento facial: SFace y cualquier embedder facial conllevan riesgos de sesgo demografico y problemas de privacidad; su uso en produccion exige evaluacion etica y legal (RGPD en la UE).
- Riesgo de falsos positivos en busqueda y clustering; conviene umbralizar y validar con datos propios.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribucion y las condiciones de los modelos base (SigLIP2 y SFace).
- Proyecto con 0 descargas y 0 likes: sin validacion comunitaria; la calidad del export no esta contrastada de forma independiente.
- El repositorio no incluye pipeline declarado ni documentacion de rendimiento; la integracion depende del codigo de la app Lensly.

## Enlaces

- Hugging Face: https://huggingface.co/santaklux/lensly-models
- Modelo base SigLIP2: https://huggingface.co/google/siglip2-base-patch32-256
- OpenCV Zoo (SFace): https://github.com/opencv/opencv_zoo
- ExecuTorch: https://github.com/pytorch/executorch
- Repositorio de la app Lensly (referenciado en la model card): https://github.com/
- Scripts de exportacion: `tools/model-export/` en el repositorio de la app (ruta indicada en la model card)
