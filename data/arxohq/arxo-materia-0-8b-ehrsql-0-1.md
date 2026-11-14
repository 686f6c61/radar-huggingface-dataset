# arxohq/Arxo-Materia-0.8B-EHRSQL-0.1

## Resumen

Arxo Materia EHRSQL 0.1 es un adaptador LoRA de 0,8B parámetros construido sobre Qwen/Qwen3.5-0.8B y especializado en la generación de consultas SQL sobre registros clínicos electrónicos. Lo desarrolla arxohq y resuelve una tarea concreta: traducir preguntas clínicas en lenguaje natural a una única sentencia SQL válida contra el esquema de la base de datos eICU. Forma parte de la familia Arxo Materia, siendo la segunda entrega tras Arxo Materia 0.1 sobre MedCalc-Bench.

El modelo está pensado para el benchmark EHRSQL tal y como lo evalúa MedHELM, con 1.959 preguntas de los splits de validación y test. Su relevancia radica en que un adaptador de menos de mil millones de parámetros alcanza un 66,8% de exactitud de ejecución, superando a modelos generalistas de referencia en la misma evaluación sin entrenamiento específico de la tarea. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

La arquitectura subyacente es la del modelo base Qwen3.5-0.8B, sobre el que se aplica un adaptador PEFT. Se carga mediante `AutoModelForImageTextToText` en lugar de `AutoModelForCausalLM`, un detalle relevante para la integración. Está entrenado exclusivamente en inglés y su alcance se limita al esquema eICU y a los tipos de pregunta de EHRSQL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; adaptador LoRA de tamaño no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantización del base no documentada) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros. El adaptador se entrena sobre la tarea de text-to-SQL clínico y se carga como `PeftModel` sobre el modelo base en precisión bfloat16. No se especifica en la información disponible ni el número de tokens de entrenamiento ni la composición exacta del dataset, salvo que se empleó el split de entrenamiento de EHRSQL.

El entrenamiento se realizó en una única ejecución (*one training run*). La evaluación reportada emplea decodificación greedy, modo *thinking* desactivado y un límite de 1.024 tokens nuevos. El modelo genera una línea de comentario que reformula la pregunta y después la consulta dentro de etiquetas `<sql>`. La prompt de entrenamiento es la de MedHELM para EHRSQL, con instrucciones explícitas de devolver una única sentencia SQL terminada en punto y coma y usar la marca temporal `2105-12-31 23:59:00` cuando sea necesario.

## Capacidades

- Generación de SQL (text-to-SQL) sobre el esquema relacional de eICU: resultados de laboratorio, prescripciones, diagnósticos, costes y duración de estancias.
- Traducción de preguntas clínicas en lenguaje natural a una única sentencia SQL ejecutable.
- Formato de salida controlado: reformulación de la pregunta en un comentario y consulta entre etiquetas `<sql>`.
- Evaluado con el prompt oficial de MedHELM para EHRSQL, incluyendo la instrucción de devolver cadena vacía ante preguntas no respondibles (aunque el modelo no declina preguntas, ver limitaciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (visión, audio, thinking mode): no documentadas; la puntuación reportada usa *thinking* desactivado.

## Casos de uso

- Consulta de registros clínicos en investigación: un investigador formula una pregunta en inglés sobre la base eICU y el modelo genera la consulta SQL que recupera laboratorios, diagnósticos o prescripciones, reduciendo la necesidad de escribir SQL manualmente.
- Generación de informes de costes y estancias: el modelo traduce preguntas sobre costes hospitalarios o duración de ingresos a consultas agregadas ejecutables sobre eICU.
- Prototipado de asistentes de datos clínicos: sirve como componente text-to-SQL en un pipeline de demostración donde el esquema eICU está disponible y el usuario plantea preguntas acotadas.
- Evaluación de pipelines de text-to-SQL médico: al incluir salidas de las 1.959 preguntas y puntuaciones por pregunta con checksums, se puede usar como referencia reproducible para comparar motores SQL o evaluadores.
- Reproducción de benchmarks de investigación: integración en entornos que replican la configuración de MedHELM (schema eICU, prompt oficial, decodificación greedy) para validar resultados.
- Despliegue ligero en recursos limitados: con 0,8B parámetros y un adaptador de 0,1 GB, puede ejecutarse en una única GPU consumer para tareas de generación SQL en laboratorio.
- Base para fine-tuning adicional: al ser un adaptador LoRA sobre Qwen3.5-0.8B, se puede reentrenar o combinar con otras adaptaciones para ampliar el alcance a otros esquemas.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, no verificados de forma independiente):

| Modelo | Exactitud de ejecución | Validación (755 preguntas) | Test (1.204 preguntas) |
|---|---|---|---|
| Arxo Materia EHRSQL 0.1 (0.8B), este adaptador | 1309 / 1959 (66,8%) | 521 (69,0%) | 788 (65,4%) |
| Qwen3.5-0.8B sin entrenar | 65 / 1959 (3,3%) | — | — |

El 99,6% de las respuestas se ejecutan sin error. Con el script `evaluate.py` propio de EHRSQL, las mismas respuestas alcanzan un 83,0% sobre las 1.959 preguntas.

Comparativa en el leaderboard de MedHELM (release v6.0.0, 9 de noviembre de 2026, mismas 1.959 preguntas):

| Sistema | Entrenado en la tarea | Exactitud de ejecución |
|---|---|---|
| Arxo Materia EHRSQL 0.1 (4B) | Sí | 67,5% |
| Arxo Materia EHRSQL 0.1 (0.8B) | Sí | 66,8% |
| Claude Opus 5.5 | No | 63,2% |
| GPT-6.1 Sol | No | 42,8% |
| Qwen3.8 Max | No | 42,7% |
| Gemini 3.8 Flash | No | 41,0% |

Los modelos Arxo Materia se entrenaron con el split de entrenamiento de EHRSQL; los modelos del leaderboard responden únicamente a partir del prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en bfloat16 requiere aproximadamente 2 GB de VRAM; con cuantización a 8 bits o 4 bits, por debajo de 1 GB. El adaptador añade un tamaño mínimo (repositorio de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, como una RTX 3060, RTX 4060 o RTX 4090; también A100 o H100 si se integra en infraestructura de mayor escala.
- Cabe en GPU consumer: sí, con margen amplio; incluso en GPU con 6-8 GB de VRAM.
- Opciones de despliegue: carga mediante `transformers` con `peft`, tal y como documenta el autor. El uso de vLLM, llama.cpp, Ollama o TGI no está documentado en la información disponible; la naturaleza de adaptador LoRA sobre el base requiere soporte de PEFT en el servidor de inferencia.
- Latencia y throughput: no disponibles. La evaluación emplea decodificación greedy con límite de 1.024 tokens nuevos y un límite de 60 segundos por consulta en la comparación con el modelo sin entrenar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud EHRSQL (MedHELM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo Materia EHRSQL 0.1 (0.8B) | 0,8B | No disponible | 66,8% | Apache 2.0 | Hugging Face |
| Arxo Materia EHRSQL 0.1 (4B) | 4B | No disponible | 67,5% | No disponible | Hugging Face |
| Claude Opus 5.5 | No disponible | No disponible | 63,2% | Propietaria | API |
| GPT-6.1 Sol | No disponible | No disponible | 42,8% | Propietaria | API |
| Qwen3.5-0.8B sin entrenar | 0,8B | No disponible | 3,3% | No disponible | Hugging Face |

La comparación con modelos generalistas no es homogénea: los Arxo Materia se entrenaron con el split de entrenamiento de EHRSQL, mientras que los modelos del leaderboard responden sin entrenamiento específico.

## Limitaciones y advertencias

- Alcance restringido al esquema eICU y a los tipos de pregunta de EHRSQL; sobre otras bases de datos u otras clases de preguntas no ha sido probado.
- No declina preguntas que la base de datos no puede responder: genera una consulta para cada pregunta, lo que puede producir SQL sintácticamente válido pero semánticamente incorrecto.
- Solo soporta inglés; las preguntas en castellano no están cubiertas.
- Es una versión de investigación: no es un dispositivo médico y no debe usarse para decisiones clínicas.
- La puntuación de 66,8% corresponde a exactitud de ejecución con el evaluador de MedHELM; con el script `evaluate.py` de EHRSQL el mismo modelo alcanza 83,0%, lo que indica sensibilidad al método de evaluación.
- Resultados declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación de tablas, columnas o condiciones del esquema, aunque el 99,6% de las respuestas se ejecutan sin error.
- Sesgos conocidos: no documentados en la información disponible.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones del modelo base Qwen3.5-0.8B.

## Enlaces

- Hugging Face: https://huggingface.co/arxohq/Arxo-Materia-0.8B-EHRSQL-0.1
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo hermano Arxo Materia 4B EHRSQL: https://huggingface.co/arxohq/Arxo-Materia-4B-EHRSQL-0.1
- Modelo hermano Arxo Materia 4B MedCalc: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Leaderboard de MedHELM: https://leaderboard.medhelm.org/
- Repositorio de resultados y comprobaciones: https://github.com/arxohq/arxo-materia-ehrsql
- Dataset EHRSQL (esquema eicu.sql): https://github.com/glee4810/EHRSQL
