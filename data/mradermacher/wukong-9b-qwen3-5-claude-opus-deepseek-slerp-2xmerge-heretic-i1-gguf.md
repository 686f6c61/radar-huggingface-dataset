# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parametros fruto de la fusion (merge) de dos ramas derivadas de la familia Qwen 3.5, combinadas mediante SLERP (interpolacion esferica) y posteriormente "abliterated" o "decensored" mediante la tecnica heretic. El autor del modelo base es xtools-at, mientras que esta ficha corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido cuantizador de la comunidad. El modelo esta disenado para tareas de razonamiento, generacion de codigo, uso de herramientas (tool calling), function calling, agentes, matematicas y STEM, y ha sido destilado a partir de trazas de modelos como Claude Opus (4.6 y 4.7) y DeepSeek.

La relevancia de este modelo radica en su enfoque: combina el rendimiento de un modelo de ~9B con tecnicas de destilacion de trazas de razonamiento de modelos de frontera propietarios, y ademas elimina (parcialmente) los mecanismos de rechazo o censura mediante heretic. Esto lo hace atractivo para desarrolladores que necesitan un modelo local, con licencia Apache 2.0, que pueda ejecutarse en hardware de consumo y que ofrezca capacidades de agente y razonamiento multi-paso.

Arquitectura transformer densa (no MoE, segun los parametros reportados), con 9.197.093.888 parametros totales, soporte multilingue para ingles, chino, espanol, ruso y japones, y publicado bajo licencia Apache 2.0. La version aqui descrita es la cuantizacion i1 (imatrix) en GGUF, que ofrece un rango de tamanos desde ~4,1 GB (Q2_K) hasta ~7,7 GB (Q6_K), lo que permite su despliegue en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5), fusion SLERP de 2 ramas |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); tambien disponibles quants estaticos en el repo hermano |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es una fusion (merge) de dos ramas derivadas de Qwen 3.5, combinadas mediante SLERP (Spherical Linear Interpolation), una tecnica de merging que interpola los pesos en el espacio esferico para preservar mejor las capacidades de ambos modelos padres. El resultado se somete posteriormente a un proceso "heretic" (abliteration/decensoring), que modifica los pesos para reducir los comportamientos de rechazo aprendidos durante el alineamiento. El nombre del modelo indica que las ramas fusionadas incorporan influencias de Claude Opus y DeepSeek, presumiblemente via destilacion de trazas de razonamiento.

El entrenamiento se apoya en tres datasets de destilacion: `Jackrong/Claude-opus-4.6-TraceInversion-9000x` (9000 trazas de inversion de trazas de Claude Opus 4.6), `Jackrong/Claude-opus-4.7-TraceInversion-5000x` (5000 trazas de Claude Opus 4.7) y `lambda/hermes-agent-reasoning-traces` (trazas de razonamiento de agentes Hermes). No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. La cuantizacion i1 utiliza un fichero imatrix (matriz de importancia) para preservar mejor la calidad en los cuants de baja precision.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento multi-paso (reasoning), con soporte de trazas de razonamiento destiladas de modelos de frontera.
- Generacion de codigo y asistencia en programacion.
- Matematicas y problemas STEM/ciencia.
- Tool calling y function calling (soporte de agentes).
- Razonamiento agentico multi-paso (multi-step reasoning, segun las trazas de Hermes).
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Modelo "uncensored"/"decensored" (heretic): menor tendencia a rechazar peticiones.
- Capacidad vision (el autor indica que es un modelo de vision; los ficheros mmproj, si existen, estarian en el repositorio estatico).

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y explicar codigo en multiples lenguajes, integrarse en editores o pipelines de CI/CD mediante tool calling, y ejecutarse en una GPU de consumo con cuantizacion Q4_K_M (~5,9 GB).
- Agente autonomo con function calling: gracias al entrenamiento con trazas de Hermes, puede planificar pasos, invocar herramientas y encadenar acciones en flujos de automatizacion (por ejemplo, consulta de APIs, gestion de ficheros).
- Razonamiento matematico y STEM: util para tutoria automatizada o resolucion de problemas paso a paso, aprovechando las trazas de razonamiento destiladas.
- Atencion al cliente multilingue: soporta conversaciones en ingles, chino, espanol, ruso y japones, adecuado para despliegues en entornos con usuarios de esos idiomas.
- Generacion de contenido sin restricciones excesivas: el proceso heretic reduce los rechazos, lo que puede ser util en entornos de investigacion creativa o generacion de escenarios que otros modelos rechazan (con las cautelas legales correspondientes).
- Prototipado rapido en hardware de consumo: con cuants de 4-6 GB puede ejecutarse en GPUs consumer (RTX 3060/4060/4090) mediante llama.cpp u Ollama, ideal para pruebas de concepto sin infraestructura cloud.
- Investigacion sobre merging y abliteration: el modelo sirve como caso de estudio de fusion SLERP y decensoring para investigadores interesados en tecnicas de edicion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): ~4,1 GB (i1-Q2_K), ~5,6 GB (i1-Q4_K_S), ~5,9 GB (i1-Q4_K_M), ~6,8 GB (i1-Q5_K_M), ~7,7 GB (i1-Q6_K).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, con cuants Q4 o inferiores en GPUs de 8 GB o mas; Q5/Q6 requieren 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-...-heretic-i1-GGUF (este) | ~9,2B | no disponible | Apache 2.0 | GGUF | Merge SLERP + heretic, destilado de Claude/DeepSeek |
| Qwen 3.5 (base de la familia) | variable (segun variante) | no disponible | segun variante | safetensors/GGUF | Modelo original sin merge ni decensoring |
| Modelos de ~9B de la familia Llama/Gemma | ~8-9B | no disponible | licencia propia | safetensors/GGUF | Alternativas densas de tamano similar; sin datos de rendimiento comparativo disponibles |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de ~9B, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado.
- Sesgos conocidos: no se documentan sesgos especificos, pero al derivar de Qwen 3.5 y de trazas de modelos propietarios, puede heredar sesgos de esos datos.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte multilingue se limita a en, zh, es, ru, ja.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el proceso heretic/decensoring puede implicar riesgos legales o de politica de uso en determinados contextos; el usuario debe evaluar el cumplimiento normativo.
- El modelo es "uncensored": puede producir contenido que otros modelos rechazarian; requiere moderacion adicional en produccion.
- Calidad de cuantizacion: los cuants por debajo de Q4 (Q2, Q3) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- No hay informacion sobre el contexto maximo, lo que limita la planificacion de despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agentes Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
