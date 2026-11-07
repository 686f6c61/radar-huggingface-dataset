# mradermacher/Text2SQL-1.5B-GGUF

## Resumen

Text2SQL-1.5B-GGUF es la version cuantizada en formato GGUF del modelo yasserrmd/Text2SQL-1.5B, un modelo de lenguaje especializado en la traduccion de lenguaje natural a SQL (text-to-SQL). Lo publica mradermacher, un conocido autor de cuantizaciones de la comunidad de Hugging Face, que genera versiones estaticas en GGUF de modelos populares para facilitar su despliegue en entornos con recursos limitados. El modelo base parte de la arquitectura Qwen2 y fue afinado mediante SFT (supervised fine-tuning) con la libreria TRL sobre el dataset gretelai/synthetic_text_to_sql.

El modelo resuelve un problema concreto y acotado: dado un esquema de base de datos y una pregunta en lenguaje natural, generar la consulta SQL correspondiente. Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), esta disenado para ser ligero y desplegable en hardware modesto, incluyendo GPUs de consumo, lo que lo hace atractivo para integrarlo en herramientas de analitica, asistentes de BI o pipelines internos donde no se quiere depender de un modelo grande de proposito general.

La relevancia de esta ficha radica en que ofrece un abanico completo de cuantizaciones (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB) que permiten ajustar el equilibrio entre calidad y consumo de memoria. Es un modelo de nicho, en ingles y con licencia Apache 2.0, pensado para tareas de generacion de SQL mas que para conversacion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Qwen2 con aproximadamente 1,5 mil millones de parametros. Segun las etiquetas de la model card, el afinamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo de un modelo Qwen2 preentrenado y utilizando el dataset gretelai/synthetic_text_to_sql, un conjunto sintetico de pares pregunta-SQL. La model card tambien menciona la herramienta unsloth, habitualmente empleada para entrenamiento eficiente en memoria.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la longitud de contexto nativa ni si hubo fases de RLHF o DPO. Esta version GGUF es una conversion estatica (convert_type: hf, output_tensor_quantised: 1) realizada por mradermacher; el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural y un esquema de base de datos (text-to-SQL).
- Generacion de texto conversacional basica, heredada del modelo Qwen2 subyacente.
- Soporte de inferencia compatible con text-generation-inference y endpoints_compatible, segun las etiquetas del repositorio.
- Capacidad multilingue limitada: el modelo declara unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades especiales adicionales mas alla de la tarea text-to-SQL.

## Casos de uso

- Asistentes de analitica de datos: el modelo traduce preguntas de negocio ("cuales fueron las ventas por region el ultimo trimestre") a consultas SQL ejecutables contra un esquema dado, reduciendo la barrera tecnica para usuarios no tecnicos.
- Integracion en herramientas de BI y dashboards: al ser un modelo de 1,5B cuantizado a 1,1 GB en Q4_K_M, puede desplegarse junto a la aplicacion de BI para generar consultas bajo demanda sin depender de servicios externos.
- Generacion de SQL en pipelines de datos: util para automatizar la creacion de consultas de transformacion o extraccion en flujos ETL, con validacion posterior antes de ejecutar.
- Formacion y prototipado: su tamano reducido permite experimentar con tecnicas de text-to-SQL en entornos docentes o de investigacion con recursos limitados.
- Despliegue en el borde o en local: las cuantizaciones Q2_K (0,8 GB) y Q4_K_S (1,0 GB) permiten ejecutarlo en portatiles o equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Preprocesado de consultas en asistentes de bases de datos: como primer paso para generar borradores de SQL que luego se revisan o refinan con un modelo mayor.
- Automatizacion de tareas repetitivas de reporting: generar consultas parametrizadas a partir de plantillas en lenguaje natural para informes periodicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,0-1,1 GB (Q4_K_S/Q4_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16), segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para Q8_0; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta tgi), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Text2SQL-1.5B-GGUF (este) | 1,54B | no disponible | apache-2.0 | GGUF | Especializado en text-to-SQL, solo ingles |
| mradermacher/Text2SQL_v2-GGUF | no disponible | no disponible | no disponible | GGUF | Version posterior del mismo autor de cuantizaciones; disponible en Q8_0 (1,17 GB) |
| Modelos text-to-SQL de proposito general (p. ej. variantes de Qwen2.5-Coder) | variable | variable | variable | safetensors/GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: su entrenamiento se centra en text-to-SQL con datos sinteticos, por lo que su calidad en conversacion general o tareas ajenas a SQL puede ser limitada.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, lo que restringe su uso en entornos hispanohablantes sin traduccion previa.
- Riesgo de alucinacion: como todo modelo generativo, puede producir SQL sintacticamente valido pero semanticamente incorrecto o referenciar tablas y columnas inexistentes; se recomienda validacion y ejecucion controlada.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar su uso con esquemas de base de datos extensos.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento (gretelai/synthetic_text_to_sql) por si imponen restricciones adicionales.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos sinteticos, puede reflejar los sesgos de dicho dataset.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Text2SQL-1.5B-GGUF
- Modelo base: https://huggingface.co/yasserrmd/Text2SQL-1.5B
- Pagina de descargas del autor: https://hf.tst.eu/model#Text2SQL-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Version posterior cuantizada: https://huggingface.co/mradermacher/Text2SQL_v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
