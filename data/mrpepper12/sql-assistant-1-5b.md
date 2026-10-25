# MRPEPPER12/sql-assistant-1-5b

## Resumen

sql-assistant-1-5b es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct orientado a una unica tarea: convertir preguntas en lenguaje natural en consultas SQL correctas. Dado un esquema de base de datos y una pregunta, el modelo responde unicamente con la consulta SQL, sin explicaciones ni texto adicional, y rechaza de forma educada cualquier peticion que no este relacionada con SQL o bases de datos.

Lo desarrolla el usuario MRPEPPER12 mediante QLoRA con la herramienta Zebrain, y la version publicada es la v2, que corrige un fallo detectado en la v1. El modelo tiene 1.543.714.304 parametros reales (segun los pesos safetensors del repositorio) y hereda la arquitectura Qwen2 del modelo base, asi como su ventana de contexto de 32.768 tokens.

Su relevancia practica esta en el nicho: es un modelo de 1,5B parametros especializado en text-to-SQL que puede ejecutarse en hardware modesto y desplegarse como servicio dedicado dentro de una herramienta de analitica o un asistente de BI. Ahora bien, el repositorio no declara licencia, idiomas ni detalles del dataset de entrenamiento, y no cuenta con descargas ni validacion de la comunidad, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de Qwen/Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no verificada en este repositorio) |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repositorio; al ser arquitectura Qwen2 es cuantizable a GGUF (Q2-Q8), GPTQ y AWQ con las herramientas habituales. El repositorio contiene pesos sin cuantizar (el tamano de 6,2 GB es coherente con fp32: 1.543.714.304 x 4 bytes ≈ 6,17 GB) |
| Idiomas soportados | No disponible (no declarados en la model card; el modelo base Qwen2.5 declara soporte multilingue amplio) |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen2.5-Coder-1.5B-Instruct se publica bajo Apache 2.0, pero la licencia de este ajuste fino no se especifica) |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-generation |
| Tipo de ajuste | QLoRA (adaptadores LoRA sobre cuantizacion de 4 bits) fusionados en pesos completos |
| Herramienta de entrenamiento | Zebrain |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con query/key/value bias, tal como corresponde al modelo base Qwen2.5-Coder-1.5B-Instruct. El ajuste se realizo con QLoRA: el modelo base se cuantiza a 4 bits y sobre el se entrenan adaptadores de bajo rango, que despues se fusionan para dar lugar a un checkpoint denso de 1,54B parametros en precision completa (de ahi el tamano de 6,2 GB del repositorio). No se trata de un modelo MoE ni de una arquitectura hibrida.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la mezcla de datos text-to-SQL utilizada, ni sobre si se aplicaron etapas de RLHF o DPO. La model card unicamente indica que el entrenamiento se hizo con Zebrain y que la v2 corrige un fallo de la v1. La innovacion tecnica destacable no esta en la arquitectura, sino en la especializacion: el modelo esta condicionado para emitir exclusivamente la consulta SQL y para rechazar peticiones fuera de dominio, lo que simplifica su integracion en pipelines automaticos al no requerir post-procesado del texto generado.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural y un esquema de base de datos proporcionado en el contexto.
- Salida restringida a la consulta SQL: sin explicaciones, sin markdown adicional y sin texto conversacional, segun la model card.
- Rechazo educado de peticiones no relacionadas con SQL o bases de datos (metrica "off topic" de 0,385 a 1,0 tras el ajuste v2).
- Mantenimiento de identidad y estilo definidos por el entrenamiento (metrica "identity" de 1,0 en la evaluacion interna).
- Generacion de texto general y codigo, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Soporte de conversaciones multi-turno mediante la plantilla de chat de Qwen2 (tag "conversational"), aunque el caso de uso previsto es de un solo turno.
- Compatible con text-generation-inference y endpoints-compatible, segun los tags del repositorio.
- No se declaran capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito; no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente text-to-SQL embebido en una herramienta de BI: el usuario formula una pregunta en lenguaje natural, la aplicacion inyecta el esquema de las tablas relevantes en el prompt y el modelo devuelve la consulta lista para ejecutar, sin necesidad de parsear texto adicional.
- Generacion automatica de consultas en un chat de analitica interna: con 32.768 tokens de contexto heredados se puede incluir un esquema de tamaño medio (decenas de tablas) junto con la pregunta en una sola llamada.
- Motor de consultas para un asistente de soporte a analistas junior: el modelo traduce peticiones tipo "ventas por region del ultimo trimestre" a SQL sobre un esquema predefinido, reduciendo el tiempo de escritura manual.
- Componente de un pipeline de CI/CD de datos: dado un catalogo de tablas versionado, el modelo genera las consultas de validacion o de extraccion que luego se revisan y ejecutan en un entorno controlado.
- Especializacion de subagentes en un sistema mayor: al ser un modelo de 1,5B, puede desplegarse como "especialista SQL" invocado por un agente orquestador mas grande, manteniendo el coste por llamada bajo.
- Prototipado y docencia: al caber en GPU de consumo, sirve para demostrar tecnicas de QLoRA y de especializacion por instrucciones en un caso de uso acotado y verificable.
- Filtrado de dominio en un asistente conversacional: el comportamiento de rechazo de temas no relacionados permite usarlo como clasificador previo o guardarrail tematico antes de derivar la peticion a otro modelo.

## Benchmarks y rendimiento

El autor publica unicamente una evaluacion interna con tres metricas, sin detallar la metodologia, el tamaño del conjunto de prueba ni la composicion de los ejemplos. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de text-to-SQL (Spider, BIRD) en la informacion disponible.

| Metrica (evaluacion interna del autor) | Antes del entrenamiento | v2 |
|---|---|---|
| task | 0,744 | 0,800 |
| identity | 1,000 | 1,000 |
| off topic | 0,385 | 1,000 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32 (pesos tal como se publican): unos 6,2 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB de pesos; en la practica, 4-6 GB con contexto moderado.
- VRAM estimada en int8: aproximadamente 1,6 GB de pesos.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,0-1,2 GB de pesos; ejecutable en GPUs de 4 GB e incluso en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100, H100 o L40S para despliegues con alta concurrencia y contexto largo.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 4070 e incluso RTX 3060 de 12 GB con margen para contexto largo.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el modelo declara endpoints_compatible), vLLM, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por el tamaño (1,5B), en una RTX 4090 en fp16 es razonable esperar latencias de decenas de milisegundos por consulta corta, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MRPEPPER12/sql-assistant-1-5b | 1,54B | 32.768 (heredado del base) | Text-to-SQL con rechazo fuera de dominio | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32.768 | Codigo y texto general, sin especializacion SQL | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 (ampliable con YaRN) | Codigo general, mayor capacidad pero sin ajuste SQL especifico | Apache 2.0 | HuggingFace |
| Defog sqlcoder-7b-2 | 7B | No disponible en la informacion proporcionada | Text-to-SQL especifico | No verificada en la informacion disponible | HuggingFace |

La comparativa con alternativas distintas del modelo base se basa en conocimiento general del ecosistema y no en datos verificados en la informacion proporcionada; conviene comprobar parametros, contexto y licencia en cada repositorio antes de decidir. Frente al modelo base, la ventaja de este ajuste es el formato de salida estricto y el rechazo de temas fuera de dominio; la desventaja es la ausencia de licencia declarada y de validacion externa.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica condiciones de uso, por lo que no hay base legal clara para uso comercial sin contactar con el autor.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros sobre su calidad en produccion.
- Evaluacion interna opaca: las metricas "task", "identity" y "off topic" no especifican conjunto de prueba, numero de ejemplos ni criterio de correccion, por lo que no son comparables con benchmarks publicos.
- Riesgo de alucinacion de esquema: como cualquier modelo text-to-SQL de este tamaño, puede inventar tablas, columnas o funciones SQL que no existen en el esquema proporcionado.
- Limitacion de contexto en esquemas grandes: los 32.768 tokens heredados pueden ser insuficientes para bases de datos con cientos de tablas; requiere seleccion previa de las tablas relevantes.
- Idiomas no declarados: no se especifica si el modelo responde correctamente a preguntas en castellano; el entrenamiento parece orientado a instrucciones en ingles.
- Restriccion de formato: la salida sin explicaciones es una ventaja para pipelines, pero impide usarlo en escenarios donde se espera justificacion o desambiguacion de la consulta.
- Riesgo de seguridad: si la consulta generada se ejecuta automaticamente contra una base de datos, es imprescindible validar y limitar permisos (SQL injection, DROP/DELETE no solicitados, consultas costosas).
- Riesgo de rechazo excesivo: el entrenamiento para rechazar temas fuera de dominio (metrica "off topic" de 1,0) puede provocar que decline peticiones legitimas formuladas de forma ambigua.
- Sin datos sobre sesgos: no se ha publicado informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Desconocimiento del proceso Zebrain: no se detalla la configuracion de QLoRA (rango, alpha, learning rate, epochs), lo que dificulta reproducir el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MRPEPPER12/sql-assistant-1-5b
- Modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Zebrain (herramienta de entrenamiento citada por el autor): no disponible, no se ha encontrado enlace en la informacion proporcionada
- Paper, blog o demo del modelo: no disponibles
- Nota sobre la busqueda web: los resultados obtenidos no guardaban relacion con el modelo ni con text-to-SQL, por lo que se han descartado y no se incluyen.
