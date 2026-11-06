# OsGo/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo vision-lenguaje unificado desarrollado por WeChat Vision (Tencent Inc.) y distribuido en este repositorio como espejo no modificado del repositorio original. Se construye sobre Qwen3-VL y su objetivo es unificar la percepción a nivel de objeto (detección de objetos de vocabulario abierto, localización por referencia, conteo de objetos, pointing y OCR) y a nivel de píxel (segmentación por referencia y alpha matting con prompt) en un único modelo que emite salidas estructuradas mediante predicción del siguiente token.

El modelo combina un transformer Qwen3-VL de 2.441.744.384 parámetros con un decodificador de píxeles ligero de 9.511.460 parámetros (`mask_decoder.pt`), lo que permite generar cajas, puntos, máscaras de segmentación y mattes alpha de resolución completa a partir de instrucciones en lenguaje natural. Resulta relevante para investigación en grounding visual y segmentación, ya que un solo checkpoint cubre tareas que habitualmente requieren modelos especializados separados.

La licencia es Apache 2.0 para el código y componentes propios de Tencent, aunque los componentes de terceros conservan sus licencias originales. El repositorio tiene un tamaño de 4,9 GB y se distribuye en formato safetensors compatible con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje Qwen3-VL con decodificador de píxeles (9.511.460 parámetros) |
| Parametros totales | 2.441.744.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (componentes de terceros conservan su licencia original) |
| Formato de pesos | safetensors y mask_decoder.pt |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-VL como columna vertebral vision-lenguaje y añade un decodificador de píxeles separado. La percepción a nivel de objeto se realiza mediante predicción estructurada del siguiente token: el modelo usa tokens de coordenadas dedicados (`<0>` a `<1000>`) para representar cajas delimitadoras normalizadas y puntos, devuelve `None` cuando el objetivo consultado no está presente y emite un token de instancia especial (`<OBJ>`, ID de token 152678) tras cada caja predicha en tareas densas.

El decodificador de píxeles adjunto (`mask_decoder.pt`, 9.511.460 parámetros) es un componente central obligatorio que integra un adaptador de características visuales sobre las características del ViT de Qwen3-VL previas al merging, un decodificador de consultas guiado por caja con 6 bloques de atención cruzada deformable inicializados desde el estado oculto de `<OBJ>` y una codificación Fourier de la caja previa, y una cabeza de predicción densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina predicciones en S/4, S/2 y S/1 para producir mattes alpha continuos a resolución completa con stride 1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Detección de objetos de vocabulario abierto con salida de cajas delimitadoras normalizadas.
- Localización por referencia (referring expression comprehension) y pointing.
- Conteo de objetos en imágenes.
- OCR y localización de texto en imágenes.
- Segmentación por referencia (referring expression segmentation) con máscaras de instancia.
- Alpha matting con prompt para extracción de transparencias a resolución completa.
- Generación conversacional de texto sobre imágenes (pipeline image-text-to-text).
- Salida estructurada mediante tokens de coordenadas y token de instancia `<OBJ>`.
- Abstención explícita devolviendo `None` cuando el objetivo consultado no está en la imagen.
- Inferencia de un solo turno orientada a percepción de imagen; no se documenta soporte de tool calling, agentes ni modo thinking.

## Casos de uso

- Anotación automática de datasets de visión: el modelo puede generar cajas y máscaras de instancia a partir de consultas en lenguaje natural, reduciendo el etiquetado manual en pipelines de datos para detección y segmentación.
- Segmentación interactiva en edición de imágenes: con una consulta como "persona" y la tarea `matting`, el decodificador de píxeles produce mattes alpha continuos a resolución completa, útiles para composición y retoque.
- Extracción de recortes con transparencia: el alpha matting promptable permite separar sujetos del fondo conservando bordes finos, aplicable a generación de material gráfico.
- Localización y conteo en imágenes de inventario o escenas: el conteo de objetos y la detección de vocabulario abierto permiten responder consultas del tipo "cuántas sillas hay" con cajas asociadas.
- Digitalización de documentos con OCR localizado: el modelo devuelve texto y su posición, lo que facilita la extracción estructurada de campos en formularios o capturas.
- Investigación en grounding visual: al unificar detección, pointing, segmentación y matting en un solo checkpoint de 2,4B de parámetros, sirve como base para experimentos comparativos y ablaciones sobre percepción unificada.
- Asistentes de análisis de imágenes de un solo turno: para consultas puntuales sobre una imagen donde se requiere respuesta estructurada y abstención cuando el objeto no existe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.441.744.384 parámetros en bfloat16 el peso ronda los 4,9 GB, a lo que se suma el decodificador de píxeles de 9,5M de parámetros y las activaciones del ViT.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo con suficiente VRAM, aunque no se confirma compatibilidad con modelos concretos.
- Cabe en consumer GPU: previsiblemente sí por el número de parámetros, pero no hay datos oficiales de VRAM pico ni de GPUs verificadas.
- Opciones de despliegue: el autor indica el paquete de inferencia `wevisone_vl` desde GitHub con `device="auto"` y `dtype="bfloat16"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-2B | 2.441.744.384 | No disponible | Detección, grounding, conteo, pointing, OCR, segmentación, matting | Apache 2.0 | Hugging Face (espejo) y repo upstream |
| Qwen3-VL (base) | No disponible en esta ficha | No disponible | Vision-lenguaje general | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas en segmentación/matting | No disponible | No disponible | Tarea única | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los bordes finos de los mattes alpha son sensibles a la resolución de la imagen, a oclusiones severas, a transparencias complejas y a la formulación del prompt.
- El modelo genera salidas estructuradas sin razonamiento chain-of-thought explícito por eficiencia de inferencia, lo que puede afectar a consultas complejas.
- Está orientado a percepción de imagen de un solo turno; el decodificador de píxeles rechaza rejillas de vídeo.
- No está destinado a decisiones autónomas de alto impacto ni a la identificación de individuos.
- No se documentan idiomas soportados ni sesgos conocidos; el rendimiento multilingüe es incierto.
- El repositorio es un espejo no modificado; las actualizaciones, incidencias y soporte deben consultarse en el repositorio upstream.
- Aunque el código propio es Apache 2.0, los componentes de terceros conservan sus licencias originales y deben revisarse antes de uso comercial.
- No hay datos publicados de benchmarks, latencia ni requisitos de VRAM verificados, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/OsGo/WeVisOne-VL-2B
- Repositorio upstream: https://huggingface.co/tencent/WeVisOne-VL-2B
- GitHub del paquete de inferencia: https://github.com/Tencent/WeVisOne-VL
