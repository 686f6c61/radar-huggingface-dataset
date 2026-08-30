# Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP8

## Resumen

Este modelo es una cuantización FP8 weight-only del modelo multimodal `Qwen3-VL-8B-Instruct`, al que se ha aplicado una técnica de "abliteration" (eliminación de la dirección de rechazo) mediante proyección ortogonal. El resultado es una versión "uncensored" del modelo, es decir, que no aplica los filtros de seguridad habituales de la versión original. El autor, Rin247, lo distribuye como parte de un proyecto denominado *Genesis of Aquarion*.

La relevancia de esta versión radica en dos aspectos: por un lado, reduce el tamaño del modelo a aproximadamente 8,8 GB gracias a la cuantización FP8, lo que facilita su ejecución en hardware con VRAM limitada; por otro, elimina las negativas del modelo ante solicitudes que la versión original rechazaría, lo que resulta atractivo para aplicaciones de generación de contenido sin restricciones. El modelo base, Qwen3-VL-8B-Instruct, es un transformer multimodal de 8 140 millones de parámetros que combina comprensión de texto e imágenes, y esta variante conserva su arquitectura y capacidades, aunque con una precisión potencialmente reducida por la cuantización.

No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto de esta versión específica. La model card del autor solo detalla el proceso de cuantización y abliteration, sin ofrecer benchmarks ni especificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal denso, vision-lenguaje) |
| Parametros totales | 8 144 793 840 (aprox. 8,14 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 weight-only (RTN, escalas almacenadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors con cuantizacion FP8 (archivos `model.safetensors`, `config.json` con `quantization_config`) |

## Arquitectura y entrenamiento

El modelo es una derivación directa de `Qwen3-VL-8B-Instruct`, un modelo multimodal de la serie Qwen3-VL desarrollado por Alibaba. La arquitectura base es un transformer denso con módulos de visión que procesan imágenes y video junto con texto. Esta versión concreta no ha sido entrenada desde cero ni fine-tuneada con nuevos datos; en su lugar, se ha aplicado un proceso de abliteration mediante proyección ortogonal de la dirección de rechazo del modelo original, seguido de una cuantización FP8 weight-only usando RTN (Round-To-Nearest) en CPU. Las escalas y formas de los pesos se guardan como buffers adicionales (`*.weight_scale`, `*.weight_shape`) que deben usarse para dequantizar antes de la inferencia.

No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF, DPO, etc.). El autor tampoco detalla si la cuantización afecta a la calidad de las respuestas más allá de la pérdida típica de precisión asociada a FP8.

## Capacidades

- Al ser una variante cuantizada de Qwen3-VL-8B-Instruct, hereda las capacidades del modelo base, que incluyen comprensión de imágenes, generación de texto, razonamiento visual y respuesta a preguntas multimodales.
- Soporte de tool calling y function calling, ya que el modelo base Qwen3-VL-8B-Instruct incluye estas funcionalidades (aunque no se confirma explícitamente en esta versión).
- Capacidades de agente y razonamiento multi-paso, propias de la serie Qwen3-VL.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se especifica cuáles ni si la cuantización los conserva.
- La principal diferencia con el modelo base es la eliminación de los mecanismos de rechazo, lo que permite generar contenido que el modelo original bloquearía (por ejemplo, respuestas sobre temas sensibles o instrucciones potencialmente dañinas).
- No se documentan capacidades adicionales como visión de video en tiempo real o procesamiento de audio.

## Casos de uso

- Analisis de imagenes medicas en investigacion: el modelo puede describir hallazgos en radiografias o ecografias. Su naturaleza abliterated permite discutir casos sin las restricciones habituales de los modelos clinicos, aunque debe usarse con extrema precaucion por la falta de validacion.
- Generacion de descripciones alternativas para archivos visuales: al no rechazar contenido, puede producir descripciones de imagenes con contenido explicito o controversial que otros modelos omiten, util en contextos de archivo historico o artistico.
- Creacion de contenido creativo multimodal: escritura de guiones, novelas visuales o narrativas interactivas donde se requiere explorar temas tabu o escenas violentas sin censura.
- Asistente de accesibilidad para personas con discapacidad visual: puede describir imagenes de forma detallada, incluso si contienen contenido que otros modelos evitarian (por ejemplo, imagenes de accidentes o violencia).
- Automatizacion de extraccion de informacion de documentos escaneados: gracias a su capacidad de vision y texto, puede procesar facturas, formularios o contratos con contenido sensible sin que el modelo se niegue a extraer ciertos campos.
- Investigacion academica sobre sesgos y seguridad en IA: al ser una version abliterated, permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo en tareas de generacion de texto, comparando con la version original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni otros tests, y no se encontraron datos externos sobre esta cuantizacion especifica. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en produccion, ya que la cuantizacion FP8 y el abliteration pueden alterar el rendimiento respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 8,8 GB, por lo que los pesos FP8 ocupan aproximadamente ese espacio. Con overhead de activaciones y cache KV, se recomienda al menos 12 GB de VRAM para contextos cortos y 16-24 GB para contextos largos o lotes mayores.
- GPUs recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para uso comodo; tambien puede funcionar en RTX 4070 (12 GB) con limitaciones de contexto. En entornos profesionales, A10 (24 GB) o A100 (40 GB) ofrecen mayor margen.
- Al ser una cuantizacion FP8 weight-only, no es un formato estandar para todos los motores de inferencia. Se requiere dequantizacion manual usando los buffers de escala y forma antes de alimentar a un motor. La model card indica que se debe "dequantize with the matching scale/shape buffers". Por tanto, opciones de despliegue directas como llama.cpp u Ollama pueden no ser compatibles sin conversion previa. vLLM o TGI podrian soportar FP8 si se adapta el formato, pero no se confirma en la documentacion.
- Latencia y throughput: no se proporcionan datos. Como referencia, un modelo de 8B en FP8 suele ofrecer velocidades de 20-40 tokens/s en una RTX 4090, pero esto depende del motor y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8,14 B | No disponible (habitualmente 128k) | BF16/FP16 | Apache 2.0 | HuggingFace oficial |
| Este modelo (FP8 abliterated) | 8,14 B | No disponible | FP8 weight-only | No disponible | HuggingFace (Rin247) |
| Qwen3-VL-8B-Instruct (otras cuantizaciones) | 8,14 B | No disponible | GGUF, AWQ, etc. | Apache 2.0 | Varios repos |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento comparativo con otros modelos multimodales de 8B como LLaVA o Phi-3-vision, ni se han encontrado benchmarks publicados para esta version concreta. La principal diferencia con el modelo base es la eliminacion de la censura y la reduccion de tamaño, mientras que la licencia y el contexto permanecen sin especificar.

## Limitaciones y advertencias

- Al estar "abliterated", el modelo puede generar contenido inapropiado, ofensivo o peligroso. No debe desplegarse en entornos donde se requiera moderacion de contenido o seguridad.
- La cuantizacion FP8 puede provocar una ligera degradacion en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo.
- No se especifica la licencia, lo que genera incertidumbre juridica para uso comercial. Se recomienda contactar al autor antes de utilizarlo en produccion.
- No hay informacion sobre la longitud de contexto soportada en esta version; es posible que la cuantizacion afecte a la ventana util.
- La model card no detalla los idiomas soportados; aunque el modelo base es multilingue, no se garantiza que esta version conserve todas las lenguas.
- Para cargar el modelo es necesario implementar la dequantizacion manual con los buffers de escala y forma, lo que complica su integracion en frameworks estandar.
- No se han publicado evaluaciones de sesgos o alucinaciones; el abliteration puede aumentar la tendencia a inventar informacion en temas delicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-FP8
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Guia sobre LLMs sin censura por VRAM (menciona variantes abliterated): https://insiderllm.com/guides/best-uncensored-local-llms/
- Discusion sobre modelos uncensored en ComfyUI (referencia a Qwen3-VL Heretic): https://civitai.com/models/2200639/qwen-3-vl-node-for-comfyui-qwen-3-vl-heretic-uncensored-model
