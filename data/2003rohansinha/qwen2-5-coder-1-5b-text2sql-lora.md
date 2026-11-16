# 2003Rohansinha/Qwen2.5-Coder-1.5B-Text2SQL-LoRA

## Resumen

Qwen2.5-Coder-1.5B-Text2SQL-LoRA es un ajuste fino mediante QLoRA del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario de Hugging Face 2003Rohansinha. Su proposito es convertir una pregunta en lenguaje natural junto con un esquema de base de datos en una unica consulta SQLite. Los pesos publicados son el adaptador LoRA fusionado con la base en fp16, por lo que se cargan como un modelo Transformers convencional; el adaptador aislado se conserva en la carpeta `adapter/`.

El modelo parte de la arquitectura Qwen2 de 1.543.714.304 parametros (aproximadamente 1,5B) y hereda la ventana de contexto de la familia Qwen2.5, adecuada para incluir esquemas de tablas de tamano moderado en el prompt. El entrenamiento se realizo sobre 12.000 ejemplos utilizables del dataset gretelai/synthetic_text_to_sql, con QLoRA de 4 bits y LoRA de rango 16, en dos GPU T4 de Kaggle.

Su relevancia radica en que demuestra una mejora medible de la precision de ejecucion sobre el modelo base en tareas Text-to-SQL: +10,3 puntos en el subconjunto de test retenido de Gretel (61,0% a 71,3%) y +9,1 puntos en el split de desarrollo de Spider con bases de datos no vistas (46,1% a 55,2%). Es un modelo pequeno, con licencia Apache-2.0 y desplegable en hardware de consumo, pensado para prototipado de asistentes de consulta sobre SQLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino QLoRA sobre Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4-bit NF4; pesos publicados en fp16; cuantizaciones GGUF no publicadas por el autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); adaptador LoRA en `adapter/` |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Dataset de entrenamiento | gretelai/synthetic_text_to_sql (Apache-2.0) |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros, inicializado desde Qwen2.5-Coder-1.5B-Instruct. Sobre esa base se aplico un ajuste fino QLoRA: cuantizacion de 4 bits en formato NF4, adaptadores LoRA de rango r=16 y alpha=32 con dropout 0,05 aplicados a todas las proyecciones de atencion y MLP, tasa de aprendizaje 2e-4, tamano de lote efectivo 16 y calculo de la perdida unicamente sobre los tokens de la respuesta. El entrenamiento se ejecuto en dos GPU T4 de Kaggle, con copias de seguridad de los checkpoints subidas al Hub durante el proceso.

Los datos proceden de gretelai/synthetic_text_to_sql y se filtraron para conservar 12.000 ejemplos cuyo SQL de referencia se ejecuta correctamente sobre una base de datos construida a partir del esquema del propio ejemplo. El prompt de entrenamiento y evaluacion sigue un formato fijo: un mensaje de sistema que define al modelo como asistente SQL experto y le pide devolver una unica consulta SQLite dentro de un bloque de codigo `sql`, seguido de un mensaje de usuario con el esquema precedido de "Database schema:" y la pregunta precedida de "Question:". El autor recomienda mantener este formato para obtener el mejor rendimiento. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de consultas SQLite a partir de una pregunta en lenguaje natural y un esquema de tablas proporcionado en el prompt.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Salida estructurada: devuelve la consulta dentro de un bloque de codigo `sql`, lo que facilita su extraccion automatica.
- Seguimiento de instrucciones mediante plantilla de chat (`apply_chat_template`) con roles system y user.
- Conversacion multi-turno soportada por la interfaz de chat, aunque el ajuste fino se ha realizado en formato de un unico turno.
- Capacidades de codigo generales heredadas del modelo base, no evaluadas especificamente en esta ficha.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible de forma especifica en este ajuste; solo lo que herede del modelo base.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen2.5 tiene cobertura multilingue mas amplia.

## Casos de uso

- Asistente de consulta sobre bases de datos SQLite en aplicaciones internas: el modelo recibe el esquema de las tablas y la pregunta del usuario y devuelve una consulta ejecutable, lo que permite construir interfaces de lenguaje natural sobre bases de datos de analitica o de prototipos sin escribir SQL manualmente.
- Generacion de SQL en pipelines de BI y cuadros de mando: integrado como paso previo a la ejecucion contra una conexion de solo lectura, permite que usuarios no tecnicos obtengan resultados de sus propias preguntas, con la ventaja de su bajo coste de inferencia al ser un modelo de 1,5B.
- Herramienta de soporte para desarrolladores: autocompletado o sugerencia de consultas SQLite en editores y notebooks, aprovechando su formato de salida delimitado para insertar directamente el resultado en el editor.
- Prototipado rapido de agentes de datos: al caber en GPU de consumo y cargarse con Transformers, sirve para validar flujos de texto a SQL antes de invertir en modelos mayores, midiendo la precision de ejecucion sobre el esquema real del proyecto.
- Generacion de consultas para tests y fixtures: el modelo puede producir consultas de ejemplo sobre esquemas sinteticos para poblar conjuntos de pruebas o documentacion de bases de datos, dado que fue entrenado con esquemas sinteticos de Gretel.
- Educacion y formacion en SQL: como generador de consultas de referencia en ingles sobre esquemas sencillos, util para comparar con la solucion del estudiante y mostrar la forma canonica de resolver una pregunta.
- Filtrado y preprocesado de datos tabulares: generacion de consultas de agregacion, agrupacion y filtrado sobre esquemas conocidos para automatizar tareas repetitivas de extraccion sobre SQLite.

## Benchmarks y rendimiento

La model card reporta precision de ejecucion: una consulta se considera correcta cuando se ejecuta sobre la base de datos real y devuelve las mismas filas que la consulta de referencia, comprobando el orden solo cuando la referencia usa ORDER BY. La decodificacion es greedy y el prompt es identico para el modelo base y el ajustado.

| Benchmark | Preguntas | Modelo base | Este modelo | Cambio |
|---|---|---|---|---|
| Gretel synthetic_text_to_sql, subconjunto de test retenido | 300 | 61,0% | 71,3% | +10,3 puntos (test de signos emparejado, p = 0,0001) |
| Spider dev (bases de datos no vistas en entrenamiento) | 1.034 | 46,1% | 55,2% | +9,1 puntos (181 corregidas, 87 rotas, p < 0,0001) |

El error estandar en Spider es de aproximadamente 1,5 puntos por modelo. El autor advierte que estas cifras proceden de su propio script de comparacion por ejecucion, no del evaluador oficial de Spider, por lo que no deben compararse directamente con las cifras de leaderboards. Tambien senala que el ajuste rompe algunas preguntas que el modelo base acertaba (87 en Spider): mejora la media, no cada pregunta individual.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3,1 GB solo para pesos, mas memoria para el tokenizador, el contexto y las activaciones; un presupuesto practico de 4 a 6 GB de VRAM es razonable para prompts de esquema moderados.
- En cuantizacion de 8 bits, el peso se reduce a alrededor de 1,6 GB; en 4 bits, a alrededor de 0,8 GB. El autor no publica versiones GGUF, por lo que estas cifras son estimaciones a partir del numero de parametros.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 comodo (RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10); GPU de datacenter (A100, H100) sobredimensionadas para este tamano y utiles solo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, con margen amplio; el propio autor entreno en dos T4 de Kaggle.
- Opciones de despliegue: Transformers (ruta oficial), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` figura en el repositorio), vLLM mediante carga del modelo compatible con Qwen2, llama.cpp y Ollama solo si se generan conversiones a GGUF por cuenta propia.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2003Rohansinha/Qwen2.5-Coder-1.5B-Text2SQL-LoRA | 1.543.714.304 | no disponible | Ajuste QLoRA para Text-to-SQL sobre SQLite | Apache-2.0 | Hugging Face, safetensors |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1.543.714.304 | no disponible en esta ficha | Modelo general de codigo e instrucciones | Apache-2.0 | Hugging Face, safetensors, GGUF por la comunidad |
| Modelos Text-to-SQL especializados de mayor tamano | no disponible | no disponible | Ajuste especifico para generacion de SQL | no disponible | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye datos sobre otras alternativas Text-to-SQL comparables. Frente al base, este ajuste mejora la precision de ejecucion en +10,3 y +9,1 puntos en los dos benchmarks reportados, manteniendo el mismo numero de parametros y licencia.

## Limitaciones y advertencias

- El modelo esta especializado en sintaxis SQLite; otras variantes (PostgreSQL, MySQL, BigQuery) pueden requerir edicion manual de la consulta generada.
- El entrenamiento se realizo mayoritariamente sobre datos sinteticos de Gretel, por lo que los esquemas reales y desordenados son mas dificiles, como refleja la caida de precision en Spider (55,2%).
- Un modelo de 1,5B comete errores en joins, subconsultas anidadas y esquemas poco habituales; siempre hay que revisar el SQL generado antes de ejecutarlo.
- Nunca se debe ejecutar el SQL generado sobre una base de datos que no se pueda permitir modificar; se recomienda usar una conexion de solo lectura.
- El ajuste rompe algunas preguntas que el modelo base acertaba (87 casos en Spider): la mejora es agregada, no uniforme.
- Los benchmarks proceden de un script de evaluacion propio del autor, no del evaluador oficial de Spider, y no son comparables con cifras de leaderboard.
- Idioma limitado al ingles segun la model card; las preguntas en castellano no estan cubiertas por el entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado sobre datos sinteticos, pueden aparecer sesgos del modelo base y del generador de datos.
- Riesgo de alucinacion: puede inventar tablas, columnas o funciones SQL que no existen en el esquema proporcionado; la validacion contra el esquema real es imprescindible.
- La licencia Apache-2.0 permite uso comercial, en linea con el modelo base y el dataset de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; conviene tratarlo como un experimento reciente y validar el comportamiento en el dominio concreto antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2003Rohansinha/Qwen2.5-Coder-1.5B-Text2SQL-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
