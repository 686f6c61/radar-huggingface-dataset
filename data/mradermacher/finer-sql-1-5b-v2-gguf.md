# mradermacher/FINER-SQL-1.5B-v2-GGUF

## Resumen

FINER-SQL-1.5B-v2-GGUF es la version cuantizada en formato GGUF del modelo FINER-SQL-1.5B-v2, desarrollado originalmente por griffith-bigdata y convertido a GGUF por mradermacher. Se trata de un modelo especializado en la tarea de text-to-SQL, es decir, la traduccion de lenguaje natural a consultas SQL, afinado con GRPO (Group Relative Policy Optimization) sobre el dataset Core-DB. Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), esta pensado para desplegarse de forma eficiente en entornos con recursos limitados.

La relevancia de esta publicacion radica en que ofrece el modelo original en multiples niveles de cuantizacion (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware de consumo y en pipelines de inferencia locales mediante llama.cpp u Ollama. El modelo esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta orientado exclusivamente al idioma ingles.

Al estar especializado en una unica tarea (generacion de SQL), no compite con modelos de proposito general, sino que se posiciona como una alternativa ligera y desplegable para asistentes de bases de datos, herramientas de BI y automatizacion de consultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la informacion) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza transformer y su tamano de aproximadamente 1,5 mil millones de parametros. El modelo original fue afinado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que optimiza la politica del modelo comparando grupos de respuestas generadas, y esta especializado en la tarea text-to-sql. El entrenamiento se asocia al dataset Core-DB, segun las etiquetas de la model card.

La version aqui descrita es una conversion estatica a GGUF realizada por mradermacher, sin cuantizaciones ponderadas ni imatrix (el autor indica que estas no estan disponibles en el momento de la publicacion). Se ofrecen tanto cuantizaciones de tipo K como IQ, siendo IQ4_XS y Q4_K_M las opciones recomendadas por equilibrio entre tamano y calidad.

## Capacidades

- Generacion de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL).
- Afinado especifico con GRPO para mejorar la calidad de las consultas generadas.
- Entrenamiento orientado al esquema Core-DB, lo que sugiere buen comportamiento en dominios de bases de datos estructuradas.
- Soporte conversacional segun las etiquetas del repositorio (conversational).
- Compatibilidad con endpoints (endpoints_compatible).
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes de consulta para bases de datos: el modelo traduce preguntas de usuarios en ingles a sentencias SQL ejecutables, adecuado para integrarse en interfaces de chat sobre bases de datos relacionales.
- Herramientas de business intelligence: permite que analistas sin conocimientos de SQL formulen consultas mediante lenguaje natural, reduciendo la dependencia del equipo tecnico.
- Automatizacion de informes: generacion de consultas parametrizadas para pipelines de reporting programados, aprovechando su tamano reducido para ejecucion local.
- Educacion y formacion en SQL: util como generador de ejemplos de consultas a partir de descripciones, con fines didacticos.
- Integracion en entornos de desarrollo: asistente embebido en IDE o notebooks que sugiere consultas SQL a partir de comentarios en lenguaje natural.
- Despliegue en hardware de consumo: gracias a las cuantizaciones de 0,8 a 1,7 GB, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama.
- Prototipado rapido de pipelines text-to-SQL: su licencia Apache 2.0 permite incorporarlo en productos comerciales sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para cuantizaciones Q2_K y Q3_K, en torno a 1,1-1,2 GB para Q4_K_M y Q5_K_M, y hasta 3,2 GB para f16 (tamanos de archivo indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4/Q5; para f16 se recomienda al menos 4 GB. No se especifican modelos concretos como A100 o H100 en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, series GTX 10xx en adelante con 4 GB o mas) para cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, se trata de un modelo especializado de 1,5B parametros para text-to-SQL, categoria en la que existen alternativas de mayor tamano (por ejemplo, modelos de 7B o superiores) con mayor capacidad pero mayores requisitos de hardware; no se dispone de datos verificables para comparar rendimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en text-to-SQL: no es un modelo de proposito general y su rendimiento fuera de esa tarea sera limitado.
- Idioma: solo soporta ingles, lo que restringe su uso en entornos en castellano sin traduccion previa.
- Riesgo de alucinacion: como todo modelo generativo, puede producir consultas SQL sintacticamente validas pero semanticamente incorrectas o referidas a tablas/columnas inexistentes.
- Dependencia del esquema: su calidad dependera de que el esquema de la base de datos se proporcione correctamente en el prompt.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las consultas generadas; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni evaluaciones de seguridad.
- El repositorio GGUF tiene 0 likes y 795 descargas en el momento de la consulta, lo que indica una adopcion limitada y poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FINER-SQL-1.5B-v2-GGUF
- Modelo base: https://huggingface.co/griffith-bigdata/FINER-SQL-1.5B-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#FINER-SQL-1.5B-v2-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
