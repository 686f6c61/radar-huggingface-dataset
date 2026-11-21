# mradermacher/FINER-SQL-0.5B-v2-GGUF

## Resumen

FINER-SQL-0.5B-v2-GGUF es la distribucion en formato GGUF del modelo FINER-SQL-0.5B-v2, desarrollado originalmente por griffith-bigdata y cuantizado por mradermacher. Se trata de un modelo especializado en text-to-SQL, es decir, la traduccion de lenguaje natural a consultas SQL, afinado mediante GRPO (Group Relative Policy Optimization) sobre un modelo base de aproximadamente 494 millones de parametros. El modelo esta disenado para el benchmark CORE-DB y esta etiquetado con el idioma ingles.

La relevancia de esta publicacion radica en su tamano reducido: con menos de 500 millones de parametros, puede ejecutarse en hardware muy modesto, incluyendo CPU o GPU de consumo, lo que lo hace atractivo para entornos con restricciones de recursos donde se necesita generacion de SQL de forma local y con baja latencia. La cuantizacion GGUF permite desplegarlo con llama.cpp u Ollama, reduciendo el peso del fichero hasta 0,4 GB en las variantes mas agresivas.

Esta ficha describe la version cuantizada; el modelo original esta disponible en el repositorio de griffith-bigdata. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento ni sobre resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer afinado, inferido del pipeline de transformers) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que el modelo original fue afinado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que optimiza las respuestas del modelo comparando grupos de salidas generadas, y que esta orientado a la tarea text-to-SQL con evaluacion sobre CORE-DB. El modelo cuenta con 494.032.768 parametros totales, lo que lo situa en la categoria de modelos pequenos (sub-1B).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de SFT o DPO. La cuantizacion fue realizada por mradermacher mediante conversion a formato GGUF con cuantizaciones estaticas (no ponderadas por imatrix), segun indica la model card. El repositorio ocupa 5,4 GB e incluye todas las variantes de cuantizacion listadas.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural (text-to-SQL).
- Especializacion en el dominio del benchmark CORE-DB.
- Formato conversacional (etiqueta `conversational` en Hugging Face).
- Compatible con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Generacion de SQL en aplicaciones de business intelligence: el modelo traduce preguntas de negocio en ingles a consultas SQL ejecutables sobre esquemas de bases de datos, con un coste computacional minimo gracias a sus 494 millones de parametros.
- Asistentes de consulta para bases de datos internas: integrado en un chatbot corporativo, permite a usuarios no tecnicos formular preguntas en lenguaje natural y obtener consultas SQL que el backend ejecuta contra la base de datos.
- Prototipado rapido de pipelines text-to-SQL: al pesar entre 0,4 y 0,6 GB en cuantizaciones Q3-Q8, permite iterar rapidamente en local sin necesidad de GPU dedicada.
- Despliegue en entornos con recursos limitados: su tamano reducido permite ejecutarlo en CPU, contenedores pequenos o dispositivos edge donde modelos mayores no caben.
- Evaluacion y comparacion de tecnicas de RL para SQL: sirve como referencia para investigadores que estudian el efecto de GRPO en tareas estructuradas con modelos pequenos.
- Filtrado y validacion de consultas en herramientas de desarrollo: puede emplearse para generar SQL de ejemplo o sugerencias en editores e IDEs ligeros, con latencia baja gracias a su reducido numero de parametros.
- Educacion y formacion en SQL: util como generador de ejemplos de consultas a partir de enunciados, en entornos docentes sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q2_K/Q3_K_S, 0,5 GB en Q4_K_S/Q4_K_M/IQ4_XS, 0,6 GB en Q6_K/Q8_0 y 1,1 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo original en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la informacion proporcionada. A continuacion se ofrece una comparacion estructural basica con modelos text-to-SQL de tamano similar ampliamente conocidos, marcando como "no disponible" los datos que no se han podido verificar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FINER-SQL-0.5B-v2 (este) | 494 M | no disponible | Apache 2.0 | GGUF, safetensors | Afinado con GRPO, benchmark CORE-DB |
| Defog SQLCoder-7B | 7 B | no disponible | no disponible | safetensors | Mayor tamano, requiere mas VRAM |
| NumbersStation NSQL-Llama-2-7B | 7 B | no disponible | no disponible | safetensors | Mayor tamano, orientado a SQL |
| Otros modelos sub-1B text-to-SQL | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas verificadas |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en text-to-SQL; su rendimiento en tareas generales de lenguaje sera limitado.
- Solo soporta ingles; las consultas en otros idiomas pueden degradar la calidad de la salida SQL.
- Riesgo de alucinacion en esquemas de bases de datos no vistos durante el entrenamiento: puede generar columnas o tablas inexistentes.
- No se dispone de informacion sobre sesgos especificos ni sobre evaluaciones de robustez.
- La cuantizacion estatica (no imatrix) puede degradar ligeramente la calidad respecto al modelo original en safetensors; se recomienda Q5_K_M o superior para uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo subyacente.
- No hay datos publicados de benchmarks que permitan validar su calidad frente a alternativas.
- El contexto maximo no esta documentado; conviene verificar el config del modelo original antes de usarlo con esquemas largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FINER-SQL-0.5B-v2-GGUF
- Modelo base original: https://huggingface.co/griffith-bigdata/FINER-SQL-0.5B-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#FINER-SQL-0.5B-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
