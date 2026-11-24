# LTM-Lab/Inkling-2-Mini-Uncensored-V18

## Resumen

Inkling-2-Mini-Uncensored-V18 es un modelo multimodal de texto e imagen publicado por LTM-Lab, derivado mediante fine-tune de OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez parte de Thinking Machines' Inkling-2-Mini. Su particularidad no es el backbone, que permanece congelado, sino una capa de memoria externa persistente: el modelo puede archivar imagenes y texto en un banco de eventos en disco, cerrar la sesion, reabrir el banco posteriormente y responder preguntas usando las imagenes archivadas. Resuelve el problema de la memoria episodica entre sesiones en asistentes multimodales, algo que los transformers convencionales no cubren sin infraestructura adicional.

La arquitectura combina un transformer multimodal con mezcla de expertos (MoE) y un bucle recurrente de lenguaje en el que se inyectan evidencias recuperadas del banco, con tres pasadas por defecto. El entrenamiento se limita a 2.758.150 parametros de memoria en 14 tensores FP32, manteniendo congelados los pesos de vision y lenguaje. El checkpoint completo pesa 20,2 GB y contiene 26.391.404.590 parametros totales segun safetensors.

Es relevante ahora porque propone un patron poco habitual: separar el conocimiento parametrico del almacenamiento de eventos verificable, con trazabilidad explicita de que imagen se ha leido (`ctx.grounding`, `native_visual_consumed`). La licencia Apache 2.0 y el soporte de `transformers` con `trust_remote_code` facilitan su experimentacion, aunque el modelo solo declara soporte de ingles y su validacion publicada es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y bucle recurrente de lenguaje con memoria externa; identificador `inkling2_loop_v18` |
| Parametros totales | 26.391.404.590 |
| Parametros activos | no disponible (el tag indica MoE, pero no se publica el numero de parametros activos por token) |
| Longitud de contexto | no disponible como valor nominal; se han probado prompts de 8.226 a 32.097 tokens antes de la respuesta y una recarga con prompt de 8.679 tokens |
| Tipos de cuantizacion | BF16 para el backbone en el ejemplo oficial; tag `8-bit` y `modelopt`; no se detallan otros formatos |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-v18-memory.safetensors` como shard de memoria indexado aparte) |

## Arquitectura y entrenamiento

El backbone procede del fine-tune con ablacion direccional de OpenUncensored sobre Inkling-2-Mini de Thinking Machines. V18 congela los pesos de lenguaje y vision y entrena exclusivamente 2.758.150 parametros de memoria distribuidos en 14 tensores FP32. El lector inyecta la evidencia recuperada en el bucle recurrente del modelo de lenguaje, con tres pasadas por defecto. La arquitectura "grounded" se introdujo en la actualizacion acumulada 1.600 y el entrenamiento continuo desde ese checkpoint con sus pesos de memoria y estado de AdamW hasta 2.560 actualizaciones.

Cada epoca utilizo 4.096 episodios de texto derivados de FineWeb-Edu y 4.096 episodios de imagen derivados de imagenes y captions de COCO. Las tareas incluyeron busqueda de contenido archivado, seguimiento de una entrada de directorio, identificacion de un recorte dentro de una imagen historica y manejo de peticiones cuya fuente no estaba disponible en la revision de consulta. La primera epoca uso prompts mixtos originales con batch efectivo 8 y 1.024 actualizaciones del optimizador; las epocas 2 a 4 usaron prompts de 8.226 a 32.097 tokens antes de la respuesta, batch efectivo 16 y 1.536 actualizaciones. El merge final combina los shards originales del backbone con el shard de memoria entrenado.

## Capacidades

- Generacion de texto e imagen a texto (pipeline `image-text-to-text`), con torre de vision nativa del modelo upstream.
- Memoria episodica persistente: archivado de imagenes y texto en un banco de eventos en disco (`open_memory`, `remember`) reabrible entre sesiones.
- Recuperacion por referencia: resolucion de peticiones por numero de archivo o entrada de directorio (`occurrence_id`) en una revision concreta del banco.
- Grounding verificable: `ctx.grounding` registra la fuente y si se consumieron las caracteristicas visuales nativas (`native_visual_consumed`).
- Deteccion de evidencia insuficiente: puede lanzar `insufficient_evidence` antes de generar si la fuente solicitada no existe en la revision consultada.
- Localizacion de recortes dentro de imagenes historicas (region selection sobre preguntas de crop-localization).
- Conversacional multi-turno con plantilla de chat y `parse_response` del tokenizer.
- Modelo "uncensored": el fine-tune del backbone elimina parte de las restricciones de rechazo del modelo original.
- No se documenta soporte de tool calling, function calling ni modo thinking explicito.

## Casos de uso

- Archivado y consulta de imagenes entre sesiones: un asistente puede guardar fotografias con un identificador estable y, dias despues, responder preguntas sobre ellas reabriendo el mismo banco; el modelo esta entrenado especificamente para esta tarea de recuperacion.
- Auditoria de fuentes visuales: en flujos donde hay que demostrar que imagen se leyo, `ctx.grounding` y `native_visual_consumed` permiten registrar la evidencia exacta consumida por el modelo, util en entornos con requisitos de trazabilidad.
- Gestion documental con referencias por directorio: el modelo resuelve peticiones del tipo "que muestra el archivo 42" siguiendo entradas de directorio, adecuado para catalogos de imagenes con numeracion estable.
- Analisis de imagenes historicas con localizacion de regiones: las tareas de crop-localization permiten preguntar por un detalle concreto dentro de una fotografia ya archivada, aunque la precision publicada es del 37,5 por ciento en 16 preguntas.
- Control de calidad con evidencia ausente: usando `require_source="image"`, el sistema rechaza generar cuando la fuente no existe en la revision consultada, lo que sirve para evitar respuestas inventadas sobre documentos no disponibles.
- Investigacion sobre memoria externa en LLM: al mantener congelado el backbone y entrenar solo 2,76 millones de parametros, es una plataforma acotada para experimentar con recuperacion episodica sin reentrenar el modelo completo.
- Prototipos de asistentes personales de fotografia: con licencia Apache 2.0 y carga via `transformers`, se puede desplegar un asistente que recuerde un album concreto entre sesiones en una unica GPU de 96 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 128 episodios de validacion con teacher forcing. El denominador de eventos cuenta los saltos de recuperacion requeridos, por lo que una pregunta de dos saltos aporta dos oportunidades. La seleccion de region se mide sobre 16 preguntas de localizacion de recorte.

| Metrica | Resultado |
|---|---:|
| Evidencia correcta en primer lugar en un salto de recuperacion activo | 68 / 144 (47,2 %) |
| Region correcta seleccionada en pregunta de crop-localization | 6 / 16 (37,5 %) |
| Log-verosimilitud negativa por token supervisado | 1,4944 |

Prueba cualitativa del checkpoint fusionado: tras recargar con un prompt de 8.679 tokens y reabrir el banco, se pregunto por una fotografia archivada de una torre de reloj y genero "A tall brick clock tower with a white top." en 14 tokens nuevos, con `native_visual_consumed=True` registrado para el evento solicitado. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo oficial carga el backbone en BF16 sobre una RTX PRO 6000 Blackwell de 96 GB; con 26.391 millones de parametros, en BF16 se requiere roughly 53 GB solo para pesos, mas overhead de activaciones y cache.
- Cuantizacion: el tag `8-bit` y `modelopt` sugieren soporte de cuantizacion a 8 bits, lo que reduciria los pesos a unos 26 GB, aunque no se documentan recetas ni calidad resultante.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es el entorno probado; A100 80 GB o H100 80 GB son opciones plausibles por capacidad, no verificadas en la informacion disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 ni presumiblemente en 8 bits sin offloading; no se documenta soporte de cuantizaciones de 4 bits tipo GGUF.
- Despliegue: `transformers` con `trust_remote_code=True` (probado con la revision `be48e7a0b63d2ff22ce1ebccbccbd0374c1592ef` y Transformers 5.24.0.dev0), Python 3.12, PyTorch 2.10.0+cu130 y torchvision 0.25.0+cu130. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria externa | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-V18 | 26,39 B (MoE) | no disponible (probado hasta 32.097 tokens) | Si, banco de eventos persistente | Apache 2.0 | Fine-tune de memoria sobre backbone congelado |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | No | no disponible | Modelo base directo de V18, con ablacion direccional |
| Thinking Machines' Inkling-2-Mini | no disponible | no disponible | No | no disponible | Modelo original del que deriva la familia |

No se dispone de datos de benchmarks comparativos entre estos tres modelos en la informacion proporcionada, por lo que la comparacion se limita a linaje, licencia y funcionalidad de memoria.

## Limitaciones y advertencias

- Precision de recuperacion limitada: solo el 47,2 por ciento de los saltos de recuperacion colocan la evidencia correcta en primer lugar, y el 37,5 por ciento en localizacion de recortes; insuficiente para flujos de produccion sin verificacion humana.
- Solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Modelo "uncensored": el fine-tune del backbone reduce los rechazos, lo que aumenta el riesgo de generar contenido inapropiado o danino sin filtros adicionales.
- Riesgo de alucinacion: aunque el mecanismo `insufficient_evidence` bloquea fuentes ausentes cuando se activa, con `require_source="off"` el modelo genera sin esa proteccion y puede inventar contenido sobre imagenes no recuperadas.
- Requiere `trust_remote_code=True` y codigo Python personalizado (`custom_code`), lo que implica ejecutar codigo del autor y revisar su procedencia antes de desplegar.
- Entrenamiento muy acotado: 2.758.150 parametros de memoria y 2.560 actualizaciones totales sobre un dataset de 4.096 episodios de texto y 4.096 de imagen por epoca; la validacion se limita a 128 episodios.
- Dependencia de versiones concretas: el entorno probado usa Transformers 5.24.0.dev0 y PyTorch 2.10.0+cu130, versiones no estables que pueden romper la compatibilidad.
- Sin descargas ni likes en el momento de la consulta y sin resultados en benchmarks estandar, lo que limita la evaluacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones de atribucion ni de las responsabilidades sobre el contenido generado por un modelo sin censura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Inkling-2-Mini-Uncensored-V18
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset COCO captions: https://huggingface.co/datasets/jxie/coco_captions
- Revision de Transformers probada: https://github.com/huggingface/transformers/commit/be48e7a0b63d2ff22ce1ebccbccbd0374c1592ef
