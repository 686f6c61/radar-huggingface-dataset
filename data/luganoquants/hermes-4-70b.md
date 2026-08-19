# luganoquants/Hermes-4-70B

## Resumen

Hermes 4 70B es un modelo de lenguaje de razonamiento híbrido desarrollado por Nous Research, construido sobre la base de Llama-3.1-70B. Esta version publicada en el repositorio `luganoquants/Hermes-4-70B` es una re-subida del modelo original, que se distribuye bajo licencia Llama 3. El modelo introduce un modo de razonamiento híbrido en el que el propio modelo decide si deliberar internamente antes de responder, emitiendo segmentos explícitos entre etiquetas `thinking` y `response`. Esto permite alternar entre respuestas rápidas y razonamiento profundo según la complejidad de la pregunta.

El entrenamiento de post-entrenamiento se amplió de forma significativa respecto a Hermes 3: el corpus pasó de 1 millon de muestras y 1.200 millones de tokens a aproximadamente 5 millones de muestras y 60.000 millones de tokens, con un enfoque en trazas de razonamiento verificadas. El modelo destaca en matematicas, codigo, STEM, logica y creatividad, y ofrece mejoras sustanciales en adherencia a esquemas JSON y en la capacidad de ser dirigido por el usuario, con una tasa de rechazo notablemente reducida. Su relevancia actual radica en ser una alternativa abierta y orientable a los modelos propietarios de razonamiento, con soporte nativo para function calling y salidas estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-70B) |
| Parametros totales | 70.553.706.496 (~70B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama-3.1-70B soporta hasta 128K tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se indican cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hermes 4 70B hereda la arquitectura transformer decoder-only de Llama-3.1-70B, con atencion por ventanas de contexto largo y normalizacion RMSNorm. No es un modelo de mezcla de expertos (MoE), sino un modelo denso con los 70.000 millones de parametros activos en cada inferencia. La innovacion principal reside en el modo de razonamiento hibrido: el modelo puede emitir un bloque de deliberacion interna entre las etiquetas `thinking` y `response`, activable mediante el flag `thinking=True` en la plantilla de chat o a traves de un prompt de sistema especifico. Este mecanismo permite al modelo alternar entre respuestas directas y razonamiento encadenado sin cambiar de pesos.

El entrenamiento de post-entrenamiento utilizo un corpus sintetizado de aproximadamente 5 millones de muestras y 60.000 millones de tokens, mezclando datos de razonamiento verificados con datos generales de asistencia. Se incluyo entrenamiento especifico para adherencia a esquemas JSON, reparacion de objetos malformados y function calling dentro de un mismo turno de asistente. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; el informe tecnico (arxiv 2508.18255) contiene los detalles completos del proceso.

## Capacidades

- Razonamiento hibrido: el modelo decide autonomamente si deliberar antes de responder, emitiendo segmentos `thinking...response` cuando la tarea lo requiere.
- Function calling y tool use: soporta llamadas a herramientas dentro de un unico turno de asistente, con etiquetas `<tool_call>` y `<tool_response>` para facilitar el parseo en streaming.
- Salidas estructuradas: entrenado para producir JSON valido conforme a esquemas dados y para reparar objetos malformados.
- Razonamiento logico y matematico: mejoras significativas en matematicas, codigo, STEM y logica respecto a Hermes 3.
- Creatividad y escritura: capacidades mejoradas en escritura creativa, roleplay y respuestas subjetivas.
- Orientabilidad (steerability): reduccion drastica de la tasa de rechazo, permitiendo alinear el modelo a los valores del usuario en una amplia gama de escenarios.
- Soporte multilingue limitado: el modelo esta entrenado principalmente en ingles; no se garantiza un rendimiento solido en otros idiomas.
- Integracion con motores de inferencia: parsers de herramientas integrados en vLLM (parser `hermes`) y SGLang (parser `qwen25`).

## Casos de uso

- Asistente de programacion con llamada a herramientas: el modelo puede generar codigo, invocar funciones externas (por ejemplo, ejecutar tests o consultar APIs) y razonar sobre los resultados dentro de un mismo turno, gracias a su soporte nativo de tool calling. Es adecuado para integrarse en entornos de desarrollo como IDE o pipelines de CI/CD.
- Agente autonomo de razonamiento multi-paso: su modo hibrido permite alternar entre respuestas rapidas y deliberacion profunda, lo que lo hace util para tareas de planificacion, busqueda de informacion y toma de decisiones en las que se requiere encadenar varios pasos logicos.
- Extraccion de datos estructurados: su entrenamiento en adherencia a esquemas JSON permite convertir texto no estructurado en objetos JSON validos, util para procesamiento de documentos, formularios o datos de clientes.
- Atencion al cliente automatizada: con una ventana de contexto amplia (heredada de Llama-3.1) y baja tasa de rechazo, puede gestionar conversaciones multi-turno complejas, redirigiendo a herramientas internas cuando sea necesario.
- Generacion de contenido creativo y roleplay: su mejora en escritura creativa y su orientabilidad permiten crear personajes, narrativas o dialogos adaptados a las instrucciones del usuario sin censura excesiva.
- Investigacion y educacion STEM: sus capacidades de razonamiento logico y matematico lo convierten en una herramienta util para resolver problemas cientificos, explicar conceptos complejos o generar material didactico.
- Automatizacion de tareas empresariales: combinando function calling con salidas estructuradas, puede integrarse en flujos de trabajo que requieran interactuar con APIs, bases de datos o servicios externos de forma programatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con graficas comparativas y menciona que las tablas completas estan en el informe tecnico (arxiv 2508.18255), pero no se proporcionan datos numericos en el texto. El model-index del repositorio declara resultados vacios. Se recomienda consultar el informe tecnico para obtener metricas detalladas de MMLU, HumanEval, GSM8K y otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 141 GB (tamano del repositorio), lo que requiere 2 GPUs de 80 GB (por ejemplo, 2x A100 80GB o 2x H100) o una solucion de memoria compartida.
- Con cuantizacion INT8: alrededor de 70 GB, cabe en una sola GPU de 80 GB (A100, H100).
- Con cuantizacion INT4: aproximadamente 35-40 GB, cabe en GPUs de 48 GB (A6000, L40S) o en 2x RTX 4090 (24 GB cada una) con tensor parallelism.
- No es viable en una sola GPU consumer de 24 GB (RTX 4090) sin cuantizacion agresiva o descarga parcial a CPU.
- Opciones de despliegue: vLLM (con parser de herramientas `hermes`), SGLang (parser `qwen25`), Hugging Face TGI, llama.cpp para cuantizaciones GGUF (si se generan), y Ollama si se publican versiones cuantizadas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware, la cuantizacion y el modo de razonamiento (el modo `thinking` aumenta el numero de tokens generados y, por tanto, la latencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento hibrido | Function calling |
|---|---|---|---|---|---|
| Hermes 4 70B | 70B | 128K (heredado) | llama3 | Si | Si |
| Hermes 3 70B | 70B | 128K | llama3 | No | Limitado |
| Llama-3.1-70B (base) | 70B | 128K | llama3 | No | No nativo |
| Qwen 2.5 72B | 72B | 128K | Apache 2.0 | No | Si |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. Hermes 4 70B se diferencia de su predecesor Hermes 3 por el modo de razonamiento hibrido, el corpus de entrenamiento ampliado (5M muestras frente a 1M) y el soporte nativo de salidas estructuradas. Frente a Llama-3.1-70B, ofrece capacidades de razonamiento y tool use adicionales. Qwen 2.5 72B tiene una licencia mas permisiva (Apache 2.0) y tambien soporta function calling, pero carece del modo de razonamiento hibrido de Hermes 4.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta garantizado y puede degradarse significativamente.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo si no se verifican las salidas.
- Sesgos: no se documentan sesgos especificos, pero al estar basado en Llama-3.1-70B y entrenado con datos sinteticos, puede heredar sesgos presentes en el corpus base.
- Licencia: la licencia llama3 impone restricciones de uso comercial para empresas con mas de 700 millones de usuarios mensuales. Es necesario revisar los terminos completos de la licencia antes de un despliegue en produccion.
- Autenticidad del repositorio: el repositorio `luganoquants/Hermes-4-70B` es una re-subida del modelo original de Nous Research (`NousResearch/Hermes-4-70B`). Se recomienda verificar la integridad de los pesos y utilizar la fuente oficial si se requiere trazabilidad.
- Modo de razonamiento: el modo `thinking` aumenta el numero de tokens generados, lo que incrementa la latencia y el coste computacional. Es necesario configurar el flag `thinking=False` para respuestas rapidas cuando no se requiere deliberacion.
- Sin benchmarks publicados en el repositorio: la ausencia de resultados numericos en el model-index dificulta la evaluacion objetiva del rendimiento; se debe consultar el informe tecnico para obtener datos verificables.

## Enlaces

- Repositorio en Hugging Face (version de luganoquants): https://huggingface.co/luganoquants/Hermes-4-70B
- Repositorio original de Nous Research: https://huggingface.co/NousResearch/Hermes-4-70B
- Informe tecnico de Hermes 4 (arxiv): https://arxiv.org/abs/2508.18255
- Nous Chat (demo oficial): https://chat.nousresearch.com
- Ficha en LM Studio: https://lmstudio.ai/models/nousresearch/hermes-4-70b
- Ficha en ModelScope: https://www.modelscope.cn/models/NousResearch/Hermes-4-70B/summary
