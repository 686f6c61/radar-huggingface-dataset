# machinez/d3-NVFP4

## Resumen

d3 es un modelo fundacional de decisión multimodal de 27B desarrollado en el marco de Decision 3.0, la familia de modelos de decisión del proyecto vLLM Semantic Router. A diferencia de un LLM generativo, d3 no produce texto: recibe un estado de entrada (texto o JSON, opcionalmente con imágenes y vídeos) y un conjunto de preguntas de tres tipos (elección entre opciones, sí/no y puntuación en una escala), y devuelve en una sola llamada una probabilidad para cada respuesta. Cada pregunta se responde con su propio forward pass sobre la entrada, de modo que varias preguntas sobre el mismo input se resuelven conjuntamente.

La ficha que nos ocupa, `machinez/d3-NVFP4`, es una conversión cuantizada del modelo base `vllm-sr/d3`, a su vez derivado de `Qwen/Qwen3.8-27B`, y publicada en formato NVFP4 con tensores comprimidos. El model card declara 26,09B de parámetros (0,46B corresponden al codificador de visión), mientras que los safetensors del repositorio contienen 17.864.494.832 parámetros (~17,86B) en un repositorio de 25,2 GB; esta discrepancia entre lo declarado y lo efectivamente publicado no se explica en la información disponible. El modelo exige `trust_remote_code=True` y `transformers==5.17.0`.

Su relevancia es doble: por un lado, ocupa una categoría poco poblada, la de los modelos de decisión y clasificación zero-shot de propósito general en lugar de la generación; por otro, sirve como pieza de enrutado (semantic router) para decidir qué modelo o qué equipo debe atender una petición antes de invocar un LLM generativo. El model card reporta un Jev Decision Index 0.3.1 de 64,7 y 65,5 en el conjunto público, frente a los 56,97 de Decision 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (el quickstart instala `flash-linear-attention` para kernels rápidos en esas capas) y codificador de visión para imágenes y vídeo; modelo base `Qwen/Qwen3.8-27B` |
| Parametros totales | 26,09B según el model card (incluye 0,46B del codificador de visión); 17.864.494.832 según los safetensors del repositorio |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 según el nombre del repositorio; los tags adicionales indican `8-bit` y `compressed-tensors`. No se documenta el esquema exacto de cuantización ni qué capas quedan sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` |

Parámetros de entrada adicionales declarados: imágenes de hasta 1,6 megapíxeles por imagen (PNG, JPEG o WebP), vídeos leídos a 2 fotogramas por segundo con un máximo de 32 fotogramas por vídeo y hasta 0,2 megapíxeles por fotograma (MP4, WebM, MOV o MKV).

## Arquitectura y entrenamiento

La información disponible describe un modelo multimodal con dos componentes diferenciados: un codificador de visión de 0,46B de parámetros y un cuerpo de lenguaje de aproximadamente 25,6B. El quickstart menciona explícitamente capas de atención lineal, lo que apunta a una arquitectura híbrida entre atención completa y atención lineal, con kernels acelerados opcionales mediante la librería `flash-linear-attention`. No se especifica el número de capas, la dimensión oculta, el número de cabezas ni el mecanismo exacto de fusión de las modalidades.

El funcionamiento es discriminativo en lugar de generativo: la entrada se procesa y cada pregunta se resuelve con un forward pass propio que produce una distribución de probabilidad sobre las opciones. Las imágenes se colocan antes del texto de la petición y los vídeos después de las imágenes, y todas las preguntas de una misma llamada ven el conjunto completo de adjuntos. Los tipos de pregunta son `choice` (entre varias opciones con criterios descriptivos), `noul` (sí/no) y `score` (puntuación sobre una escala de criterios ordenados).

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos multimodales, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o calibración de probabilidades. Tampoco se documenta el proceso de conversión a NVFP4, el calibrado utilizado ni la pérdida de precisión respecto al modelo original.

## Capacidades

- Clasificación zero-shot con devolución de probabilidades por opción, sin generación de texto.
- Preguntas de elección múltiple (`choice`) con criterios textuales que describen cada categoría.
- Preguntas binarias sí/no (`noul`).
- Preguntas de puntuación (`score`) sobre escalas de criterios ordenados.
- Respuesta a múltiples preguntas heterogéneas en una sola llamada, cada una con su propio forward pass.
- Entrada de texto libre o JSON estructurado como estado de la petición.
- Lectura de múltiples imágenes por petición en PNG, JPEG y WebP, aceptadas como rutas locales, URLs HTTP(S), objetos PIL o data URLs en base64, con resolución de hasta 1,6 MP por imagen.
- Lectura de múltiples vídeos por petición en MP4, WebM, MOV y MKV, como rutas, URLs, data URLs en base64 o arrays de fotogramas, muestreados a 2 fps con un máximo de 32 fotogramas por vídeo.
- Integración como `pipeline("decision")` de Transformers y compatibilidad declarada con endpoints.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explícito, agentes multi-paso ni salida de audio.

## Casos de uso

- Enrutado de peticiones en un semantic router: el modelo decide a qué modelo, equipo o herramienta debe dirigirse una consulta antes de invocar un LLM generativo, devolviendo una probabilidad por ruta. Es el escenario de referencia del model card, con una latencia mediana declarada de 55 ms para texto.
- Triaje de tickets de atención al cliente con adjuntos: una reclamación con una foto de un producto dañado se clasifica simultáneamente por equipo responsable, existencia de recibo y urgencia, en una sola llamada y con la imagen disponible para todas las preguntas.
- Verificación documental sobre imagen: comprobar si un recibo, una factura o una etiqueta contiene un elemento concreto o determinar el método de pago, usando las preguntas `noul` y `choice` sobre la imagen adjunta, sin necesidad de OCR previo.
- Control de calidad en inspección visual automatizada: clasificar clips cortos de cámara (por ejemplo, dirección de movimiento o cambio de color de un objeto) mediante preguntas de elección múltiple sobre vídeo a 2 fps.
- Etiquetado automático de datasets: asignar categorías y puntuaciones de forma masiva a grandes volúmenes de texto e imágenes, aprovechando la devolución de probabilidades para filtrar casos ambiguos por umbral de confianza.
- Moderación y filtrado de contenido: decidir sí/no sobre políticas concretas y obtener una puntuación de severidad sobre la misma pieza de contenido, con varias políticas evaluadas en una única llamada.
- Enrutado dentro de pipelines agénticos: seleccionar la siguiente acción, herramienta o nivel de escalado a partir del estado de la conversación, sustituyendo llamadas a un LLM generativo por un forward pass discriminativo de menor coste.
- Clasificación multimodal en tiempo real: con 273 ms de mediana para peticiones con imagen y 553 ms para vídeo de 10 segundos en una MI325X, es viable en flujos interactivos que requieran decisión y no generación.

## Benchmarks y rendimiento

Resultados declarados en el model card para el índice Jev Decision Index 0.3.1 (texto):

| Modelo | Jev Decision Index ↑ | Publico ↑ | Same-skill tests ↑ | New-domain tasks ↑ |
|---|---:|---:|---:|---:|
| d3 | 64,7 | 65,5 | 62,8 | 56,6 |
| Perplexity Decider v1.1 (27B) | 62,8 | 62,3 | 61,1 | 55,6 |
| Fastino GLiDE | no disponible (tabla truncada en la información recibida) | no disponible | no disponible | no disponible |

Otros datos declarados por el autor:

- Jev Decision Index 0.3, conjunto público: 65,45 medido con el kit oficial 0.3 sobre los pesos publicados, con las 140.178 peticiones públicas respondidas y ninguna sin soporte. El texto de highlights usa la versión 0.3 mientras la tabla de evaluación usa la 0.3.1; la diferencia de cifras (65,45 frente a 65,5) procede del redondeo o de versiones distintas del índice.
- Mejora de +8,5 puntos en el conjunto público respecto a Decision 2.0, cuyo modelo de 27B obtiene 56,97 en el mismo panel.
- Perception Test (QA de vídeo de opción múltiple): 77,4 en evaluación interna.

Latencia declarada en una única AMD Instinct MI325X, con una petición a la vez:

| Tipo de peticion | Latencia mediana |
|---|---:|
| Texto | 55 ms |
| Texto con una imagen | 273 ms |
| Texto con vídeo de 10 segundos | 553 ms |

No hay datos de throughput, de consumo de memoria en inferencia ni de benchmarks independientes. Las cifras corresponden al modelo original `vllm-sr/d3` según el model card, y no se publican mediciones específicas de esta conversión NVFP4.

## Requisitos de hardware

- Tamaño del repositorio: 25,2 GB, lo que marca el mínimo de almacenamiento y de transferencia para descargar los pesos.
- Estimación de VRAM (propia, no confirmada por el autor): entre 12 y 16 GB si se sirve únicamente la parte cuantizada a 4 bits de los 17,86B de parámetros de los safetensors, y del orden de 28 a 32 GB si se carga el checkpoint completo en precisión mixta con el codificador de visión.
- GPU de centro de datos: el autor reporta mediciones en una AMD Instinct MI325X. Por tamaño, son adecuadas A100 de 40 o 80 GB, H100 de 80 GB, L40S de 48 GB y MI300X/MI325X.
- GPU de consumo: una RTX 4090 de 24 GB o una RTX 5090 podrían alojar la parte cuantizada a 4 bits, aunque no hay confirmación del autor ni mediciones en hardware consumer. En configuraciones de precisión mixta completa el modelo no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue documentadas: `transformers==5.17.0` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, el pipeline `decision`, y la librería opcional `flash-linear-attention` para kernels rápidos de las capas de atención lineal. El modelo está asociado al ecosistema vLLM Semantic Router. No se documentan instrucciones para llama.cpp, Ollama, TGI ni vLLM directo, ni la disponibilidad de GGUF.
- Dependencias del quickstart: `torch`, `torchvision`, `pillow`, `opencv-python-headless`, `safetensors` y `accelerate`.
- Latencia: mediana de 55 ms (texto), 273 ms (con imagen) y 553 ms (con vídeo de 10 s) en una MI325X con una petición concurrente. No se publica throughput con batching ni comportamiento bajo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Jev Decision Index 0.3.1 | Publico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3 / d3-NVFP4 | 26,09B declarados; 17,86B en safetensors | no disponible | 64,7 | 65,5 | Apache-2.0 | HuggingFace (`machinez/d3-NVFP4`, `vllm-sr/d3`) |
| Perplexity Decider v1.1 | 27B | no disponible | 62,8 | 62,3 | no disponible | no disponible en la información recibida |
| Decision 2.0 | 27B | no disponible | no disponible (el card cita 56,97 en el panel público) | 56,97 | no disponible | no disponible en la información recibida |
| Fastino GLiDE | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los tres modelos de decisión citados en el propio model card. Fuera de la categoría de modelos de decisión, no se dispone de alternativas comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre las opciones y criterios que se le facilitan. No sirve para tareas de redacción, resumen o diálogo.
- No se declaran los idiomas soportados. Todos los ejemplos y criterios del model card están en inglés, por lo que el comportamiento en castellano u otros idiomas no está verificado.
- No se publica la longitud de contexto máxima. Con entradas largas (muchas imágenes, vídeos o preguntas) el comportamiento es desconocido.
- Los benchmarks publicados corresponden a `vllm-sr/d3`, el modelo original, no a esta conversión NVFP4. No hay mediciones que cuantifiquen la degradación introducida por la cuantización a 4 bits ni por el esquema `compressed-tensors` etiquetado también como 8-bit.
- Existe una discrepancia no explicada entre los 26,09B de parámetros declarados en el model card y los 17.864.494.832 parámetros presentes en los safetensors. Antes de usarlo en producción conviene inspeccionar el checkpoint para determinar qué componentes faltan o están empaquetados de otra forma.
- El modelo requiere `trust_remote_code=True` y código personalizado del repositorio, lo que implica ejecutar código no auditado por el usuario.
- Depende de `transformers==5.17.0`, una versión muy concreta y reciente; otras versiones pueden no ser compatibles.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente de la comunidad ni informes de fallos en producción.
- No hay información sobre sesgos, sobre la calibración de las probabilidades devueltas ni sobre el comportamiento ante preguntas fuera de dominio. El autor afirma que las 140.178 peticiones públicas fueron respondidas sin casos no soportados, pero eso no garantiza una calibración correcta de la confianza.
- Límites multimodales concretos: imágenes de hasta 1,6 MP, vídeos a 2 fps con un máximo de 32 fotogramas y 0,2 MP por fotograma. Vídeos largos o de alta resolución quedan fuertemente submuestreados.
- La licencia declarada del derivado es Apache-2.0, pero no se indica la licencia de `Qwen/Qwen3.8-27B` ni si la conversión cuantizada respeta las condiciones del modelo base. Conviene verificarlo antes de un uso comercial.
- No se documentan requisitos de memoria, comportamiento con batching ni métricas de throughput, lo que dificulta dimensionar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/machinez/d3-NVFP4
- Modelo original referenciado en el quickstart: https://huggingface.co/vllm-sr/d3
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Blackwell: The Impact of NVFP4 For LLM Inference: https://www.edge-ai-vision.com/2025/10/nvidia-blackwell-the-impact-of-nvfp4-for-llm-inference/
- Bridging the Gap Between Promise and Performance for Microscaling Formats (análisis de NVFP4 y MXFP4): https://arxiv.org/pdf/2509.23202
