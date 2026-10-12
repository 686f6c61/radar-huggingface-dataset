# Solayman-Sameh/nl-sql-t5-small

## Resumen

NL-SQL-T5-Small es un ajuste fino del modelo google-t5/t5-small orientado a la traduccion de preguntas en lenguaje natural (en ingles) a consultas SQL ejecutables, condicionadas por el esquema de la tabla. Lo desarrollan Solayman Sameh Solayman y Habiba Ayman Ahmed como parte del proyecto "Natural Language Data Analysis Agent". El modelo parte de la arquitectura T5-small, un transformer encoder-decoder de 60.506.624 parametros, y se ha entrenado sobre el conjunto de datos WikiSQL.

El problema que aborda es el de text-to-SQL en dominios tabulares simples: dada una pregunta y una lista de columnas con sus tipos, el modelo emite la sentencia SQL correspondiente. Es relevante como punto de partida ligero y de licencia permisiva (MIT) para tareas de analitica conversacional, porque puede ejecutarse en hardware muy modesto y sirve como base para fine-tuning especifico o como componente de un agente mayor.

La model card reporta una Exact Match Accuracy del 61,8% y un BLEU de 0,824 sobre el split de test de WikiSQL. El formato de entrada esperado es `translate to SQL: {pregunta} | columns: {col1} ({tipo1}), {col2} ({tipo2})`, y el repo ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-small) |
| Parametros totales | 60.506.624 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura T5-small) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo (fine-tuning) del checkpoint google-t5/t5-small, un transformer encoder-decoder denso de aproximadamente 60 millones de parametros. El modelo es de tipo seq2seq: recibe una secuencia de entrada en formato prompt y genera la consulta SQL como secuencia de salida. El pipeline declarado en los metadatos del repo es `text-generation`, aunque la model card y el tag `text2text-generation` indican que se trata de un modelo de generacion texto-a-texto; conviene tratarlo con `AutoModelForSeq2SeqLM`.

El entrenamiento se realizo sobre el dataset WikiSQL (salesforce/wikisql), con 56.355 consultas de entrenamiento, 8.421 de validacion y 15.878 de test. La entrada combina la pregunta en lenguaje natural con el esquema de la tabla (nombres de columna y tipos) en una unica cadena de prompt. La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention lineal u otras).

## Capacidades

- Generacion de SQL a partir de lenguaje natural en ingles, condicionada por el esquema de la tabla de entrada.
- Soporte de operaciones de agregacion (por ejemplo, AVG), filtrado (WHERE) y proyeccion de columnas (SELECT), segun el formato del dataset WikiSQL.
- Entrada unica en formato prompt con pregunta y listado de columnas con tipos (`text`, `real`, etc.).
- Modelo exclusivamente en ingles; no se declara soporte multilingue.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se declara soporte de agentes autonomos; en el proyecto original se plantea como componente dentro de un agente de analisis de datos, pero la model card no detalla esa integracion.

## Casos de uso

- Herramienta de BI conversacional: el modelo traduce preguntas en ingles sobre una tabla concreta a SQL, lo que permite a usuarios no tecnicos consultar datos sin escribir codigo, siempre que se le proporcione el esquema.
- Chatbot de analitica interna: integrado como paso de traduccion pregunta-SQL dentro de un asistente que muestra resultados de una base de datos tabular.
- Componente de agente de analisis de datos: forma parte del pipeline "NL Data Analysis Agent" para el que fue desarrollado, donde se encarga de la fase de generacion de consulta.
- Prototipado rapido con recursos minimos: al tener 60M de parametros, permite desplegar un prototipo de text-to-SQL en una maquina sin GPU dedicada para validar el flujo completo antes de escalar a modelos mayores.
- Base para fine-tuning especifico de dominio: sirve como punto de partida para ajustar un modelo de text-to-SQL a un esquema propio con licencia MIT y bajo coste de computo.
- Filtrado y generacion de condiciones en pipelines de datos: puede generar sentencias de filtrado simples para automatizar extracciones sobre tablas con esquemas sencillos.
- Soporte educativo: util como ejemplo practico de text-to-SQL y de fine-tuning de T5 para cursos o tutoriales, dado su tamano reducido.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes, sobre el split de test de WikiSQL:

| Benchmark | Metrica | Resultado |
|---|---|---|
| WikiSQL (test) | Exact Match Accuracy | 61,8% |
| WikiSQL (test) | BLEU | 0,824 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, Spider u otros) en la informacion disponible. Tampoco se aportan cifras comparativas de validacion o desglose por tipo de consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,24 GB en fp32, 0,12 GB en fp16 y 0,06 GB en int8 (estimacion a partir de 60,5M de parametros).
- GPU recomendadas: cualquier GPU, incluso las mas basicas; tambien puede ejecutarse en CPU sin problema dado su tamano.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en entornos embebidos tipo Raspberry Pi, ya que el checkpoint ocupa 0,2 GB en el repo.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForSeq2SeqLM` (metodo documentado en la model card). Otras opciones como vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion proporcionada y no estan confirmadas.
- Latencia y throughput: no disponibles. La model card usa `max_length=64` como limite de generacion en su ejemplo, pero no aporta mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solayman-Sameh/nl-sql-t5-small | 60,5M | no disponible | Text-to-SQL | MIT | Hugging Face |
| google-t5/t5-small (base) | 60M | no disponible | Texto a texto generico | MIT (Apache 2.0 en T5 original) | Hugging Face |
| Modelos text-to-SQL de mayor tamano | no disponible | no disponible | Text-to-SQL | no disponible | no disponible |

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento. La comparativa se limita al modelo base del que deriva y a la ausencia de datos para otros competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgos en la model card.
- Riesgo de alucinacion: como modelo generativo seq2seq, puede producir SQL sintacticamente valido pero incorrecto respecto a la pregunta o al esquema; se recomienda validacion de la consulta antes de ejecutarla.
- Dominio limitado: entrenado solo sobre WikiSQL, que cubre consultas sobre una unica tabla con operaciones simples; no se garantiza su funcionamiento con joins, subconsultas o esquemas complejos.
- Idioma: solo ingles; no soporta preguntas en castellano ni otros idiomas.
- Dependencia del esquema: requiere que en la entrada se especifiquen las columnas y sus tipos; un esquema mal formateado degrada la calidad de la salida.
- Licencia: MIT, permite uso comercial y modificacion con atribucion; conviene revisar los terminos del dataset WikiSQL para usos derivados.
- Discrepancia de metadatos: el repo declara el pipeline `text-generation`, mientras que la model card y los tags indican `text2text-generation`; hay que cargar el modelo como seq2seq.
- Adopcion practicamente nula a fecha de la informacion: 0 descargas y 0 likes, sin evidencia de uso en produccion ni validacion externa.
- Contexto y cuantizaciones no documentados: no se especifican en la model card, lo que obliga a verificar limites reales antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solayman-Sameh/nl-sql-t5-small
- Modelo base google-t5/t5-small: https://huggingface.co/google-t5/t5-small
- Dataset WikiSQL: https://huggingface.co/datasets/salesforce/wikisql
- Perfil del autor principal: https://huggingface.co/Solayman-Sameh
- Perfil de la coautora: https://huggingface.co/Habibaa11
