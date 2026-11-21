# EuricoGVP/Qwen3.5-4b_text2sql

## Resumen

Qwen3.5-4B Text-to-SQL es un ajuste fino del modelo Qwen/Qwen3.5-4B, desarrollado por EuricoGVP, especializado en la generacion de una unica consulta SQLite a partir de un esquema de base de datos, una pista opcional y una pregunta en lenguaje natural. El modelo parte de una arquitectura causal con codificador de vision y 4.539.265.536 parametros totales, y se distribuye con licencia Apache-2.0 en formato Transformers (safetensors) con el adaptador LoRA ya fusionado en los pesos.

El problema que resuelve es la traduccion texto-a-SQL con alta precision de ejecucion, un cuello de botella habitual en asistentes de analitica y herramientas de consulta de datos. Frente al modelo base, el ajuste eleva la precision de ejecucion de 46,22 a 54,76 por ciento en BIRD dev con esquema plano y de 77,08 a 81,82 por ciento en Spider dev, con reduccion notable de errores de ejecucion (de 246 a 80 en BIRD plano).

Es relevante ahora porque demuestra que un ajuste LoRA de una sola epoca sobre 17.132 ejemplos, con rango 16 y entrenamiento en bf16, puede superar de forma estadisticamente significativa (p de McNemar inferior a 1e-04) a un modelo base de 4B en una tarea estructurada, manteniendo un tamano de despliegue manejable de aproximadamente 9 GB de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens evaluados; 4.096 tokens de entrenamiento maximo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, con dimension oculta de 2560 y 32 capas. El layout intercala bloques de Gated DeltaNet y Gated Attention en un patron de 8 grupos de 3 bloques DeltaNet mas 1 bloque de atencion, una estructura hibrida orientada a eficiencia en secuencias largas. El ajuste fino se realizo con LoRA de rango 16 y alpha 16 mediante Unsloth, durante 1 epoca en precision bf16, y se aplico unicamente al modelo de lenguaje; el codificador de vision no se modifico. El adaptador se fusiono en los pesos finales, por lo que no se requiere PEFT para la inferencia.

El conjunto de entrenamiento suma 17.132 ejemplos: 5.980 de BIRD train (CC BY-SA 4.0), 8.097 de Spider train excluyendo `formula_1` por solapamiento con BIRD dev (CC BY-SA 4.0), 2.105 de un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (Apache-2.0) y 950 de un subconjunto de llmsql-benchmark con columnas que requieren comillas (MIT). No se indica en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de una unica consulta SQLite a partir de esquema, pista opcional y pregunta en lenguaje natural.
- Manejo de esquemas planos y de esquemas con descripciones de columnas, con mejora de precision en ambos casos.
- Soporte de nombres de columna y contexto largo que requieren entrecomillado, gracias a los subconjuntos de SynSQL-2.5M y llmsql-benchmark.
- Razonamiento sobre preguntas de dificultad simple, moderada y desafiante en BIRD y Spider.
- Capacidad de vision heredada del modelo base (codificador de vision intacto), aunque la tarea objetivo es texto-a-SQL.
- Soporte multilingue limitado: la model card declara unicamente ingles.
- No se documenta soporte de tool calling, function calling ni modo de agente multi-paso en la informacion disponible.

## Casos de uso

- Asistente de analitica para bases de datos SQLite: el modelo traduce preguntas de negocio a consultas ejecutables, con 54,76 por ciento de precision de ejecucion en BIRD dev con esquema plano, adecuado para entornos donde el esquema es estable y conocido.
- Generacion de consultas con descripciones de columnas: en almacenes de datos con metadatos documentados, el modelo alcanza 56,19 por ciento en BIRD dev con descripciones, lo que lo hace util para equipos que mantienen diccionarios de datos.
- Herramienta interna de soporte a analistas: integrado en un cuaderno o interfaz de consulta, reduce el tiempo de escritura de SQL para preguntas de dificultad moderada (47,20 por ciento con esquema plano) y desafiante (38,62 por ciento).
- Evaluacion automatizada de esquemas: el modelo puede generar consultas candidatas para validar la calidad de un esquema o detectar columnas mal documentadas, aprovechando su capacidad de trabajar con y sin descripciones.
- Prototipado rapido de interfaces de consulta en lenguaje natural: con aproximadamente 9 GB de pesos, se puede desplegar en una GPU consumer de gama alta para demos y pruebas de concepto sin infraestructura dedicada.
- Pipeline de generacion de SQL en entornos de bajo coste: al ser un modelo de 4B con licencia Apache-2.0, permite uso comercial y despliegue en vLLM o Transformers en hardware modesto, con contexto evaluado de 8.192 tokens.
- Filtrado previo en sistemas de recuperacion de datos: el modelo puede generar consultas SQLite para acotar resultados antes de un paso de razonamiento posterior, reduciendo errores de ejecucion (80 frente a 246 del modelo base en BIRD plano).

## Benchmarks y rendimiento

Resultados declarados por el autor, no verificados de forma independiente. Precision de ejecucion (EX) en porcentaje.

| Benchmark | Base | Este modelo | Solo este modelo correcto | Solo base correcto | p de McNemar |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plano | 46,22 | 54,76 | 230 | 99 | 3,75e-13 |
| BIRD dev, descripciones | 46,28 | 56,19 | 245 | 93 | 6,34e-17 |
| Spider dev | 77,08 | 81,82 | 95 | 46 | 4,49e-05 |

Desglose por dificultad en BIRD dev:

| Metrica | Base plano | Este modelo plano | Base desc | Este modelo desc |
|---|---:|---:|---:|---:|
| Simple | 54,49 | 61,08 | 53,19 | 62,27 |
| Moderate | 35,56 | 47,20 | 37,93 | 48,28 |
| Challenging | 27,59 | 38,62 | 28,97 | 42,76 |
| Errores de ejecucion | 246 | 80 | 223 | 76 |

En Spider dev los errores de ejecucion pasan de 26 a 28. BIRD dev contiene 1.534 preguntas sobre 11 bases de datos; Spider dev, 1.034 preguntas sobre 20 bases de datos.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 9 GB, segun la model card.
- VRAM estimada para inferencia en bf16: no disponible de forma explicita; como referencia de orden de magnitud, los pesos ocupan unos 9 GB y el contexto evaluado es de 8.192 tokens.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una RTX 4090 (24 GB) o superior deberia poder alojar los pesos en bf16; A100 y H100 quedan sobradamente dimensionadas.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 16 GB o mas en bf16; no confirmado por el autor.
- Opciones de despliegue: Transformers y vLLM, segun la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD dev (plano) | Spider dev | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3.5-4B Text-to-SQL (este) | 4,54B | 8.192 evaluados | 54,76 | 81,82 | Apache-2.0 | Hugging Face, Transformers, vLLM |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | 46,22 | 77,08 | no disponible | Hugging Face |
| Qwen3.5-2B Text-to-SQL | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen3.5-9B Text-to-SQL | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

Los modelos hermanos de la familia (0.8B, 2B y 9B) forman parte de la misma coleccion, pero la informacion disponible no incluye sus resultados de benchmarks.

## Limitaciones y advertencias

- El modelo genera una unica consulta SQLite; no se documenta soporte para otros dialectos SQL ni para consultas multiples.
- Solo declara soporte de ingles, lo que limita su uso con preguntas en castellano u otros idiomas.
- Precision de ejecucion por debajo del 60 por ciento en BIRD dev, incluso con descripciones de columnas; no es adecuado para ejecucion automatica sin validacion humana en entornos criticos.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- Riesgo de alucinacion en nombres de tablas o columnas no presentes en el esquema, especialmente en esquemas grandes o mal documentados.
- El ajuste se realizo en una sola epoca sobre 17.132 ejemplos; no se documentan evaluaciones de robustez ante esquemas fuera de distribucion.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento incluyen conjuntos con licencias CC BY-SA 4.0, lo que conviene revisar antes de un uso comercial.
- El codificador de vision no se ajusto; las capacidades multimodales no estan validadas para la tarea objetivo.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql
- Coleccion Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano 0.8B: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql
- Modelo hermano 2B: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql
- Modelo hermano 9B: https://huggingface.co/EuricoGVP/Qwen3.5-9B_text2sql
- Cuadernos de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql/tree/main/notebooks
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql/blob/main/LICENSE
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
