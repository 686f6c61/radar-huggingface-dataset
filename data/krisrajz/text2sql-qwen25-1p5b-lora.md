# krisrajz/text2sql-qwen25-1p5b-lora

## Resumen

text2sql-qwen25-1p5b-lora es un adaptador LoRA publicado por el usuario krisrajz sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, especializado en la tarea de text-to-SQL: convertir una pregunta en lenguaje natural, junto con un esquema de base de datos, en una consulta SQL ejecutable. El adaptador se ha entrenado sobre el conjunto de datos b-mc2/sql-create-context y se distribuye como pesos PEFT en formato safetensors, con un tamano de repositorio de aproximadamente 0,1 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo completo.

El modelo resuelve un problema acotado pero muy demandado en herramientas de analitica y asistentes de datos: la traduccion fiable de intenciones expresadas en lenguaje natural a SQL sobre esquemas concretos. Segun la model card, el ajuste eleva el exact match del 0,015 del modelo base al 0,710 sobre 200 ejemplos reservados, una mejora sustancial que indica que el adaptador aprende el formato y la sintaxis SQL esperados en lugar de depender del conocimiento previo del modelo base.

La relevancia actual del artefacto es doble: por un lado, demuestra que un modelo de 1.500 millones de parametros puede alcanzar un rendimiento util en text-to-SQL mediante un ajuste LoRA de bajo coste; por otro, su licencia Apache 2.0 y su naturaleza de adaptador lo hacen facil de integrar, auditar y desplegar en entornos con recursos limitados. No obstante, la informacion publica es escasa: no se detallan hiperparametros de entrenamiento, composicion exacta del dataset ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct tiene 1.500 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-1.5B-Instruct, no especificada en la model card |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones habituales (no documentadas en esta ficha) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El adaptador no modifica los pesos originales: se carga junto al modelo base mediante la libreria PEFT y se aplica durante la inferencia. El repositorio ocupa aproximadamente 0,1 GB, coherente con un adaptador de rango reducido sobre un modelo de ese tamano.

El entrenamiento se ha realizado sobre el dataset b-mc2/sql-create-context, un corpus de pares pregunta-esquema-consulta SQL. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros de LoRA (rango, alpha, dropout), la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta la plantilla de prompt exacta: la model card indica que esta definida en el repositorio de entrenamiento (src/prompt.py), pero no la reproduce. La unica innovacion tecnica documentada es el propio ajuste LoRA supervisado sobre el modelo base.

## Capacidades

- Generacion de consultas SQL a partir de una pregunta en lenguaje natural y un esquema de base de datos, tarea principal para la que fue ajustado.
- Razonamiento sobre esquemas: el adaptador se entrena con pares pregunta-esquema, por lo que aprende a mapear tablas y columnas del contexto a la consulta generada.
- Generacion de texto general y conversacion, heredadas del modelo base Qwen2.5-1.5B-Instruct, aunque no son el objetivo del ajuste.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Qwen2.5-Instruct declara capacidades de este tipo, pero no se verifica su conservacion tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento es en ingles y la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistentes de analitica de datos: el adaptador recibe la pregunta del usuario y el esquema de la base de datos y devuelve una consulta SQL que el backend ejecuta; su tamano reducido permite desplegarlo junto al servicio de consultas sin coste elevado de GPU.
- Generacion de consultas en herramientas de BI: integrado en un panel donde el analista escribe en lenguaje natural y obtiene SQL editable, reduciendo el tiempo de escritura manual de consultas sobre esquemas conocidos.
- Automatizacion de informes recurrentes: a partir de plantillas de preguntas y esquemas fijos, el adaptador genera las consultas de extraccion que alimentan los informes, con la ventaja de que el exact match de 0,710 sobre ejemplos reservados sugiere una tasa de acierto util en dominios similares al de entrenamiento.
- Formacion y prototipado: al ser un adaptador LoRA sobre un modelo de 1.500 millones de parametros, sirve como base para experimentar con tecnicas de text-to-SQL en equipos con recursos limitados, clonando el adaptador y ajustando el prompt o el dataset.
- Preprocesamiento de pipelines ETL: traduccion de especificaciones en lenguaje natural escritas por analistas a consultas SQL que se revisan y versionan antes de ejecutarse en produccion.
- Evaluacion comparativa de tecnicas de ajuste: el par base/adaptador con exact match documentado (0,015 frente a 0,710) lo convierte en un punto de referencia util para medir el impacto de LoRA en tareas de generacion estructurada.
- Educacion y demos: despliegue en entornos docentes para ilustrar como un ajuste de bajo rango transforma el comportamiento de un modelo pequeno en una tarea con formato estricto.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador fine-tuned |
|---|---|---|
| Exact match (200 ejemplos reservados) | 0,015 | 0,710 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, Spider, BIRD u otros) en la informacion disponible. La unica metrica documentada es el exact match sobre 200 ejemplos reservados del propio conjunto de evaluacion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre Qwen2.5-1.5B-Instruct, los requisitos son los del modelo base mas el pequeno overhead del adaptador (aproximadamente 0,1 GB en disco).
- GPU recomendadas: no documentadas en la model card; por el tamano del modelo base, es plausible su ejecucion en GPU de consumo, pero no se confirma con datos del autor.
- Compatibilidad con GPU de consumo: no documentada; el modelo base de 1.500 millones de parametros es de gama baja, pero la ficha no aporta mediciones.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA su integracion en esos motores requeriria conversion o fusion previa con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| text2sql-qwen25-1p5b-lora | Adaptador sobre 1.500 M | No disponible | LoRA text-to-SQL sobre sql-create-context | Apache 2.0 | HuggingFace (krisrajz) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | No disponible en esta ficha | Modelo base generalista | Apache 2.0 | HuggingFace (Qwen) |
| Alternativas especificas de text-to-SQL | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de text-to-SQL en la documentacion proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre b-mc2/sql-create-context, el adaptador puede reproducir los sesgos de dominio y de estilo de consulta presentes en ese dataset.
- Riesgo de alucinacion: el exact match de 0,710 implica que aproximadamente un 29 % de las consultas generadas en la evaluacion no coinciden exactamente con la referencia; en produccion es necesario validar sintaxis y semantica antes de ejecutar el SQL.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni la longitud de contexto; el dataset de entrenamiento es en ingles, por lo que el rendimiento en otros idiomas no esta verificado.
- Restricciones de licencia: el adaptador se distribuye bajo Apache 2.0, pero el uso comercial esta condicionado por la licencia del modelo base Qwen2.5-1.5B-Instruct, que debe verificarse por separado.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar Qwen/Qwen2.5-1.5B-Instruct y la plantilla de prompt definida en el repositorio de entrenamiento (src/prompt.py), que no se reproduce en la model card.
- Caveat para produccion: el rendimiento se ha medido solo con exact match sobre 200 ejemplos del propio autor; no hay evaluacion en benchmarks estandar de text-to-SQL ni pruebas de robustez frente a esquemas grandes o consultas complejas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/krisrajz/text2sql-qwen25-1p5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Libreria PEFT: https://github.com/huggingface/peft
