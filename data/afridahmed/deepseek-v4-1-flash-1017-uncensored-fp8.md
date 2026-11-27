# afridahmed/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen
DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es un ajuste fino del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario afridahmed (vinculado a la cuenta @dealignai). El modelo conserva la arquitectura y las capacidades del original (vision, video, razonamiento por niveles, tool calling, decodificacion especulativa DSpark y contexto nativo de 1M de tokens) pero elimina el comportamiento de rechazo mediante una edicion a nivel de pesos conocida como abliteration. El resultado es un modelo que responde a peticiones de tematica amplia en lugar de declinarlas.

Tecnicamente es un transformer MoE de 40 capas con 763.205.315.794 parametros totales, pesos nativos en FP8 (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4. El repositorio ocupa 510,3 GB distribuidos en 48 shards de safetensors. La edicion se aplico directamente sobre la fuente FP8 nativa, sin conversion intermedia a GGUF ni cuantizaciones Q8_0 o Q4, y sin modificar el tokenizador ni la plantilla de chat.

Su relevancia radica en que es un drop-in del modelo base: cualquier motor que cargue el original carga este, con el mismo formato byte-compatible y la misma carpeta `inference/` y `encoding/`. Esta pensado para investigadores que necesitan estudiar el comportamiento del modelo sin las capas de rechazo, y para desarrolladores que requieren un modelo multimodal de contexto largo sin restricciones de contenido, bajo licencia MIT.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; existe variante EXL3 de 2,9 bpw |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 510,3 GB), FP8 e4m3 + escalas ue8m0 |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del DeepSeek-V4.1-Flash-1017: un transformer de mezcla de expertos (MoE) de 40 capas con pesos nativos en FP8 (e4m3fn) y escalas de bloque ue8m0, y expertos en FP4. Incorpora decodificacion especulativa DSpark y un contexto nativo de 1M de tokens. La model card indica que el formato en disco es byte-compatible con el modelo original, incluidos los shards de safetensors y las carpetas de referencia `inference/` y `encoding/`.

La modificacion es exclusivamente a nivel de pesos: no hubo entrenamiento supervisado, RLHF, DPO ni ajuste de preferencias sobre datos de rechazo. Tampoco se modifico el tokenizador (`tokenizer.json` y `tokenizer_config.json` son identicos al original) ni se introdujo un jailbreak de plantilla de chat, un system prompt de anulacion o un adaptador LoRA en tiempo de carga. La edicion de abliteration se aplico directamente sobre los tensores FP8 nativos, manteniendo la granularidad de bloque original. El autor advierte que cuantizar este checkpoint FP8 de forma ingenua a bits bajos acumula error de cuantizacion sobre la edicion y puede degradar el cumplimiento; para una version de bits bajos recomienda rehacer el pipeline de abliteration en la precision objetivo, como hace la variante EXL3 de 2,9 bpw.

## Capacidades
- Generacion de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Procesamiento de imagen y video (pipeline image-text-to-text, multimodal).
- Tool calling y function calling.
- Razonamiento multi-paso y flujos de agente.
- Contexto de 1M de tokens para documentos y conversaciones extensas.
- Capacidades multilingues en siete idiomas: ingles, chino, espanol, frances, ruso, italiano y tailandes.
- Decodificacion especulativa DSpark para acelerar la inferencia.
- Comportamiento sin rechazo (abliterated) en categorias de tematica amplia.

## Casos de uso
- Investigacion sobre seguridad y alineacion: permite estudiar como se comporta un modelo de gran escala sin capas de rechazo, comparando sus respuestas con las del modelo base para analizar los efectos de la abliteration en distintos dominios.
- Analisis de documentos extensos: con 1M de tokens de contexto puede procesar libros completos, expedientes o bases de codigo en una sola pasada sin fragmentacion.
- Procesamiento multimodal de video e imagen: util para indexar y describir contenido audiovisual, generar subtitulos o extraer informacion estructurada de fotogramas y documentos escaneados.
- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a herramientas en flujos multi-paso, adecuado para automatizacion de tareas de investigacion o extraccion de datos.
- Generacion de codigo y asistencia tecnica: soporta tool calling e integracion en pipelines, util para tareas de refactorizacion o generacion de pruebas en entornos controlados.
- Atencion al cliente y conversacion multi-turno: el contexto de 1M tokens permite mantener historiales largos y coherentes sin perder informacion previa.
- Traduccion y contenido multilingue: cubre siete idiomas, util para localizacion de contenido o analisis de texto en espanol, chino, ruso, entre otros.

## Benchmarks y rendimiento
La model card incluye un benchmark interno de MMLU (57 materias x 20 preguntas, 1140 en total) en modo logit a 4 opciones, decodificacion greedy T=0, sin razonamiento, ejecutado con el motor `inference/` original sobre 4xH200 (TP4). La comparacion se hace contra la API oficial de DeepSeek que sirve los mismos pesos base. El dato del modelo base figura como 87,63 % (999/1140), pero el resultado del bundle uncensored aparece truncado en la informacion disponible.

| Modelo | MMLU-20x57 | Delta vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | referencia |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible (dato truncado) | no disponible |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio completo ocupa 510,3 GB en FP8; se necesita un conjunto de GPUs cuyo total de memoria supere esa cifra con margen para el estado de activaciones y KV cache.
- Los benchmarks internos se ejecutaron sobre 4xH200 con paralelismo de tensor TP4, lo que da una referencia real de despliegue.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su precision nativa; requeriria cuantizaciones de bits muy bajos, con la advertencia del autor sobre perdida de calidad y posible regresion del cumplimiento.
- Opciones de despliegue: el motor `inference/` de referencia de DeepSeek incluido en el repositorio; el formato es compatible con cualquier stack que cargue el modelo base. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa DSpark esta integrada y deberia reducir la latencia respecto a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B | 1M | MIT | Abliterated, FP8 nativo, multimodal |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B | 1M | MIT (segun ficha) | Modelo original con rechazo; MMLU 87,63 % en API |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | MIT (segun ficha) | Variante de 2,9 bpw con abliteration rehacida a esa precision |

## Limitaciones y advertencias
- La abliteration elimina el comportamiento de rechazo, lo que implica riesgo de generar contenido danino, ilegal o sesgado; el autor exige confirmar mayoria de edad y responsabilidad plena sobre las salidas mediante acceso restringido (gated).
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones especificas de fidelidad tras la edicion.
- La cuantizacion ingenua a bits bajos desde este checkpoint FP8 puede degradar el cumplimiento y la calidad; el autor recomienda rehacer el pipeline en la precision objetivo.
- Licencia MIT permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario.
- El modelo esta alojado bajo un repositorio con acceso restringido (extra_gated_prompt) que exige declaracion de uso y mayoria de edad.
- No se dispone de datos de sesgo, evaluaciones de seguridad ni resultados completos de benchmarks mas alla del MMLU parcial.
- El soporte de idiomas se limita a los siete declarados; el rendimiento en espanol no esta cuantificado.

## Enlaces
- Hugging Face (este repositorio): https://huggingface.co/afridahmed/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del mismo repositorio: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de computo: https://twitter.com/jordanschenck
- Apoyo al desarrollo: https://ko-fi.com/dealignai
