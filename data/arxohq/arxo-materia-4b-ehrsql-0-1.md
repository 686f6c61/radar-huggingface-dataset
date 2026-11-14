# arxohq/Arxo-Materia-4B-EHRSQL-0.1

## Resumen

Arxo-Materia-4B-EHRSQL-0.1 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por arxohq, especializado en la generación de consultas SQL sobre registros clínicos de la base de datos eICU. El modelo resuelve el problema de traducir preguntas clínicas en lenguaje natural a una única consulta SQL ejecutable contra el esquema de eICU (resultados de laboratorio, prescripciones, diagnósticos, costes y duraciones de estancia). Es la segunda entrega de la familia Arxo Materia, tras la versión sobre MedCalc-Bench.

El adaptador se distribuye como un repositorio PEFT de 0,3 GB y se carga sobre el modelo multimodal de Qwen, por lo que la clase de carga es `AutoModelForImageTextToText` y no `AutoModelForCausalLM`. Está entrenado con el prompt específico de MedHELM para EHRSQL y produce una única sentencia SQL delimitada por etiquetas `<sql>`, con decodificación greedy y el modo de razonamiento desactivado.

Su relevancia actual radica en que, según los datos declarados por el autor, supera a modelos generales de referencia (Claude Opus 5.5, GPT-6.1 Sol, Qwen3.8 Max, Gemini 3.8 Flash) en la columna EHRSQL del leaderboard de MedHELM, con una exactitud de ejecución del 67,5 % frente al 16,5 % del Qwen3.5-4B sin entrenar. Se trata de una versión de investigación, no de un producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de transformers) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se acopla a Qwen/Qwen3.5-4B, un transformer de 4B parámetros del que no se detallan en la información disponible ni la composición del dataset de preentrenamiento ni el número de tokens. El adaptador se ha entrenado sobre el split de entrenamiento de EHRSQL, el conjunto de preguntas clínicas sobre la base de datos eICU, y se ha evaluado sobre los splits de validación (755 preguntas) y de prueba (1.204 preguntas), sumando 1.959 preguntas en total.

El autor indica que se realizó una única ejecución de entrenamiento, sin especificar hiperparámetros, número de pasos ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación práctica del modelo es el ajuste al prompt exacto de MedHELM para EHRSQL: el modelo genera una línea de comentario que reformula la pregunta y, a continuación, la consulta dentro de etiquetas `<sql>`. El 99,8 % de las respuestas generadas se ejecutan sin error. La evaluación informada emplea decodificación greedy, razonamiento desactivado y un límite de 1.024 tokens nuevos.

## Capacidades

- Generación de texto y traducción de lenguaje natural a SQL (text-to-SQL) sobre el esquema de eICU.
- Consulta de datos clínicos estructurados: resultados de laboratorio, prescripciones, diagnósticos, costes y duración de estancia.
- Producción de una única sentencia SQL terminada en punto y coma, sin explicaciones adicionales.
- Manejo de la fecha de referencia `2105-12-31 23:59:00` cuando la consulta lo requiere.
- Capacidad declarada de devolver cadena vacía ante preguntas sin respuesta, aunque el autor advierte que en la práctica escribe una consulta para cada pregunta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo de razonamiento se desactiva en la evaluación.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna adicional declarada (visión, audio o modo thinking no documentados para este adaptador).

## Casos de uso

- Consulta de registros clínicos en investigación: un investigador formula una pregunta en inglés sobre la base de datos eICU (por ejemplo, sobre prescripciones o resultados de laboratorio) y el modelo genera la consulta SQL correspondiente para su ejecución directa.
- Analítica de costes hospitalarios: el modelo traduce preguntas sobre costes de estancia y tratamientos a consultas SQL sobre las tablas de eICU, lo que permite automatizar informes de gasto a partir de datos estructurados.
- Exploración de duraciones de estancia: preguntas sobre tiempos de ingreso y alta se convierten en consultas SQL ejecutables, útiles para estudios de ocupación y planificación de recursos.
- Evaluación y benchmarking de text-to-SQL médico: sirve como referencia entrenada para comparar modelos generales en la tarea EHRSQL dentro de MedHELM, con un pipeline reproducible documentado en el repositorio GitHub del autor.
- Prototipado de asistentes de consulta para personal clínico: integrado en una interfaz que reciba preguntas y devuelva resultados tabulares, el modelo actúa como capa de traducción a SQL sobre el esquema de eICU.
- Docencia y formación en informática biomédica: permite ilustrar la traducción de preguntas clínicas a SQL y evaluar la calidad de las consultas generadas con el evaluador de MedHELM o con el script `evaluate.py` de EHRSQL.
- Reproducción de resultados: con los outputs de las 1.959 preguntas, las puntuaciones por pregunta y las sumas de verificación publicadas, se puede auditar la exactitud declarada del 67,5 %.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Modelo | Entrenado en la tarea | Exactitud de ejecución |
|---|---|---|
| Arxo Materia EHRSQL 0.1 (4B) | sí | 1322 / 1959 (67,5 %) |
| Qwen3.5-4B sin entrenar | no | 324 / 1959 (16,5 %) |

Desglose por split del modelo:

| Split | Preguntas | Aciertos | Exactitud |
|---|---|---|---|
| Validación | 755 | 526 | 69,7 % |
| Prueba | 1.204 | 796 | 66,1 % |
| Total | 1.959 | 1322 | 67,5 % |

Comparativa en la columna EHRSQL del leaderboard de MedHELM (release v6.0.0, 9 de noviembre de 2026, mismas 1.959 preguntas):

| Sistema | Entrenado en la tarea | Exactitud de ejecución |
|---|---|---|
| Arxo Materia EHRSQL 0.1 (4B) | sí | 67,5 % |
| Arxo Materia EHRSQL 0.1 (0,8B) | sí | 66,8 % |
| Claude Opus 5.5 | no | 63,2 % |
| GPT-6.1 Sol | no | 42,8 % |
| Qwen3.8 Max | no | 42,7 % |
| Gemini 3.8 Flash | no | 41,0 % |

Con el script `evaluate.py` de EHRSQL, que procesa cada consulta antes de ejecutarla, las mismas respuestas del modelo alcanzan el 84,3 % sobre las 1.959 preguntas. El 99,8 % de las respuestas se ejecutan sin error.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador ocupa 0,3 GB y se suma al modelo base Qwen3.5-4B en bfloat16, que requiere del orden de 8 GB de VRAM en precisión completa (estimación a partir del tamaño de parámetros, no declarada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por el tamaño del modelo base (4B) es plausible en GPUs de consumo con suficiente memoria, pero no se dispone de datos oficiales.
- Opciones de despliegue: carga mediante `transformers` con `AutoModelForImageTextToText` y `peft.PeftModel`; el ejemplo oficial usa `device_map="auto"` y `torch.bfloat16`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible. La evaluación usa un límite de 60 segundos por consulta para la fila del modelo sin entrenar y un máximo de 1.024 tokens nuevos por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud EHRSQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo-Materia-4B-EHRSQL-0.1 | 4B (base) + LoRA | no disponible | 67,5 % | apache-2.0 | Hugging Face (adaptador PEFT) |
| Arxo-Materia-0.8B-EHRSQL-0.1 | 0,8B | no disponible | 66,8 % | no disponible | Hugging Face |
| Claude Opus 5.5 | no disponible | no disponible | 63,2 % | propietaria | API |
| GPT-6.1 Sol | no disponible | no disponible | 42,8 % | propietaria | API |
| Qwen3.8 Max | no disponible | no disponible | 42,7 % | propietaria | API |
| Gemini 3.8 Flash | no disponible | no disponible | 41,0 % | propietaria | API |

Los modelos Arxo Materia están entrenados sobre el split de entrenamiento de EHRSQL, mientras que los modelos del leaderboard responden solo a partir del prompt. La comparación no es, por tanto, homogénea en cuanto a exposición a los datos de la tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo escribe una consulta para cada pregunta y no rechaza las que la base de datos no puede responder, pese a que el prompt contempla devolver cadena vacía.
- Cobertura limitada: solo cubre el esquema de eICU y los tipos de pregunta de EHRSQL; en otras bases de datos y otros tipos de pregunta no está probado.
- Idioma: únicamente inglés.
- Licencia: apache-2.0, que permite uso comercial, pero el autor la califica expresamente como versión de investigación.
- Uso clínico: no es un producto sanitario y no está destinado a decisiones clínicas.
- Evaluación: los resultados son declarados por el autor y no están verificados de forma independiente; la comparación con modelos generales no controla el entrenamiento previo en la tarea.
- Dependencia del prompt: el adaptador está entrenado con el prompt exacto de MedHELM y espera la clase `AutoModelForImageTextToText`; desviarse de ese formato puede degradar el rendimiento.
- Longitud de contexto y cuantizaciones: no documentadas para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arxohq/Arxo-Materia-4B-EHRSQL-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión anterior (MedCalc-Bench): https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Versión 0.8B sobre EHRSQL: https://huggingface.co/arxohq/Arxo-Materia-0.8B-EHRSQL-0.1
- Leaderboard de MedHELM: https://leaderboard.medhelm.org/
- Repositorio de resultados y sumas de verificación: https://github.com/arxohq/arxo-materia-ehrsql
- Dataset EHRSQL (esquema eICU): https://github.com/glee4810/EHRSQL/
