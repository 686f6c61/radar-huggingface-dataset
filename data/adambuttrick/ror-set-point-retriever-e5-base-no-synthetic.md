# adambuttrick/ror-set-point-retriever-e5-base-no-synthetic

## Resumen

El modelo `ror-set-point-retriever-e5-base-no-synthetic` es un codificador dual (bi-encoder) de recuperación de entidades desarrollado por adambuttrick para la tarea de emparejamiento de afiliaciones institucionales con registros del Research Organization Registry (ROR). Se trata de un ajuste fino de `intfloat/multilingual-e5-base`, un transformer XLM-RoBERTa de 278 millones de parámetros, que transforma tanto cadenas de afiliación como textos de registros ROR en vectores de embedding comparables mediante producto escalar. La relevancia del modelo reside en su aplicación práctica: dado un texto de afiliación, como "Dept. of Physics, University of Tokyo, Japan", el modelo devuelve los 32 registros ROR candidatos más probables, resolviendo un problema real de desambiguación institucional en metadatos académicos.

La innovación principal de esta variante concreta es que fue entrenada sin cadenas sintéticas, lo que la convierte en la primera etapa del procedimiento de entrenamiento completo. Su búsqueda sobre cadenas sintéticas genera los negativos duros que alimentan a las variantes posteriores. El modelo forma parte de una colección más amplia de componentes de emparejamiento ROR que incluye un retriever base, un modelo de conjunto (set model) basado en mmBERT y un matcher completo.

Con 21 descargas y publicado bajo licencia MIT, el modelo está orientado a un caso de uso muy específico dentro del ámbito de la ciencia de datos académicos y la vinculación de entidades. Aunque su adopción general es limitada, su valor radica en la precisión demostrada: alcanza un recall del 96,0 por ciento de los enlaces correctos en el top 32 sobre el conjunto de test, incluyendo un 97,8 por ciento para instituciones no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (XLM-RoBERTa base) con mean pooling |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens para consultas (afiliaciones), 128 tokens para pasajes (registros); entrenamiento con 96 tokens para consultas y 128 para pasajes |
| Tipos de cuantizacion | fp16 (pesos publicados); compatible con cuantizacion estandar de sentence-transformers (int8, etc.) |
| Idiomas soportados | no disponible explicitamente; hereda el soporte multilingue de intfloat/multilingual-e5-base (mas de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de codificador dual basado en XLM-RoBERTa, el checkpoint `intfloat/multilingual-e5-base` en su revision `d12875059715`. Cada texto se codifica de forma independiente y se proyecta a un vector de embedding de longitud 1 mediante mean pooling. La similitud entre una consulta y un registro se calcula como el producto escalar entre sus vectores. Los pesos se publican en fp16. El modelo utiliza los prefijos de prompt `"query: "` para las afiliaciones y `"passage: "` para los textos de los registros, siguiendo la convencion de la familia E5.

El entrenamiento se realizo sobre el dataset `adambuttrick/ror-set-point-matching-train-validation-test`, con un total de 354.516 filas. La perdida empleada fue InfoNCE con temperatura 0,02, calculada sobre todos los registros del lote. Cada cadena de afiliacion se entreno con 1 positivo y 3 negativos duros, con un lote de 128 cadenas. Se utilizo el optimizador AdamW con learning rate 2e-5, weight decay 0,01, calentamiento lineal del 5 por ciento de los pasos y decaimiento lineal posterior. El entrenamiento duro 1 epoch (2.769 pasos) con precision bf16, gradient clipping de 1,0 y gradient checkpointing activado, sobre una unica GPU NVIDIA L4 durante 1,8 horas (6.352 segundos). La semilla utilizada fue 1363.

Los datos de entrenamiento provienen de dos fuentes: los juicios del profesor (`teacher_judgments`) con 304.626 filas correspondientes a 167.533 cadenas, y datos etiquetados (`affiliations_unseen_institutions`) con 49.890 filas y 16.452 cadenas. Se excluyeron las cadenas del profesor con p >= 0,5 para registros reservados (28.474) y las cadenas identicas a cadenas de evaluacion (11).

## Capacidades

- Recuperacion de entidades institucionales: dado un texto de afiliacion, devuelve los registros ROR candidatos mas probables mediante similitud coseno.
- Generacion de embeddings multilingues: hereda la capacidad multilingue de `multilingual-e5-base`, lo que permite procesar afiliaciones en distintos idiomas y alfabetos.
- Busqueda semantica sobre 143.284 registros ROR: el modelo esta disenado para buscar sobre el corpus completo de ROR, manteniendo los 32 candidatos con mayor puntuacion.
- Integracion en pipelines de entity linking: funciona como primera etapa de un sistema de emparejamiento que combina recuperacion densa con indices lexicos y un modelo de conjunto para la seleccion final.
- Manejo de afiliaciones no latinas: el modelo muestra un rendimiento del 96,6 por ciento de recall en enlaces con cadenas no latinas en el conjunto de test.
- Generalizacion a instituciones no vistas: alcanza un 97,8 por ciento de recall en enlaces a instituciones reservadas (no presentes en el conjunto de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Desambiguacion de afiliaciones en metadatos academicos: el modelo permite normalizar las afiliaciones institucionales de articulos cientificos a identificadores ROR unicos, resolviendo ambiguedades como variantes de nombre, traducciones y abreviaturas. Es adecuado porque recupera el 96,0 por ciento de los enlaces correctos en el top 32.

- Enriquecimiento de bases de datos bibliograficas: integrado en pipelines de ingestión de publicaciones, el modelo asigna identificadores ROR a cada afiliacion, mejorando la calidad de los metadatos de repositorios como OpenAlex, Crossref o Scopus.

- Auditoria de financiacion e instituciones: organismos de financiacion pueden usar el modelo para verificar que las instituciones declaradas en solicitudes y informes coinciden con registros ROR validados, reduciendo errores administrativos.

- Analisis bibliometrico institucional: permite agrupar publicaciones por institucion real, incluso cuando los autores escriben la afiliacion de formas distintas o en idiomas diferentes, facilitando rankings y estudios de colaboracion.

- Indexacion y busqueda en repositorios institucionales: el modelo puede indexar los registros ROR una sola vez y reutilizar los vectores para todas las consultas, lo que reduce el coste computacional en sistemas de busqueda a gran escala.

- Preprocesamiento para modelos de conjunto: como primera etapa de un sistema de emparejamiento, genera los candidatos que alimentan a un modelo de conjunto (set model) encargado de la seleccion final, mejorando la precision global del pipeline.

- Limpieza de datos en proyectos de ciencia abierta: investigadores que trabajan con grandes corpus de textos cientificos pueden usar el modelo para normalizar afiliaciones antes de realizar analisis de redes de colaboracion o estudios de movilidad.

- Integracion en APIs de vinculacion de entidades: el modelo puede exponerse como servicio mediante Text Embeddings Inference (TEI) o sentence-transformers, permitiendo que otras aplicaciones consulten la recuperacion de candidatos ROR bajo demanda.

## Benchmarks y rendimiento

Recall de los enlaces correctos en el top 32 de registros, en porcentaje, sobre el conjunto `affiliations_unseen_institutions`. Los splits de validacion y test contienen cadenas de instituciones que no aparecen en el split de entrenamiento. Los enlaces "nuevos" apuntan a registros que ninguna cadena de entrenamiento nombra; los "conocidos" apuntan al resto.

| Split | Todos los enlaces | Conocidos | Nuevos | Enlaces en cadenas no latinas | Enlaces a instituciones reservadas |
|---|---:|---:|---:|---:|---:|
| test (1.957 cadenas, 2.620 enlaces) | 96,0 | 93,1 | 96,8 | 96,6 | 97,8 |
| validacion (1.914 cadenas, 3.292 enlaces) | 91,5 | 92,6 | 91,0 | 97,5 | 90,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que el modelo esta especializado en recuperacion de entidades y no en generacion de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 para los pesos del modelo (278 millones de parametros), mas el espacio necesario para los embeddings de los 143.284 registros ROR si se precalculan (dependiendo de la dimension de embedding, del orden de varios cientos de MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para la inferencia del modelo. Para el precalculo de los embeddings de todos los registros ROR se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4060 Ti, etc.).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: sentence-transformers (libreria nativa), Text Embeddings Inference (TEI) para servir el modelo como API, y cualquier runtime compatible con safetensors y arquitectura XLM-RoBERTa (ONNX Runtime, etc.).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento completo requirio 1,8 horas en una NVIDIA L4 para 2.769 pasos con lotes de 128 cadenas, lo que da una idea del orden de magnitud del coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Recall top 32 (test) |
|---|---|---|---|---|---|
| ror-set-point-retriever-e5-base-no-synthetic | 278 M | 512 (query) / 128 (passage) | Recuperacion de registros ROR | MIT | 96,0 |
| ror-set-point-retriever-e5-base | 278 M | no disponible | Recuperacion de registros ROR | no disponible | no disponible |
| ror-set-point-retriever-e5-base-openalex-jev-distill | 278 M | no disponible | Recuperacion de registros ROR | no disponible | no disponible |
| intfloat/multilingual-e5-base | 278 M | 512 | Embeddings multilingues generales | MIT | no aplica (no especializado en ROR) |

La comparativa se limita a variantes del mismo autor dentro de la coleccion de emparejamiento ROR, ya que no se dispone de datos de benchmarks de otros recuperadores de entidades institucionales en la informacion proporcionada. El modelo base `intfloat/multilingual-e5-base` no esta especializado en la tarea y no se dispone de su rendimiento en este benchmark concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion proporcionada. Al heredar el entrenamiento de `multilingual-e5-base`, podria presentar sesgos linguisticos o geograficos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: al ser un modelo de recuperacion y no de generacion, no genera texto libre, por lo que el riesgo de alucinacion se limita a devolver candidatos incorrectos. El recall del 96,0 por ciento en el top 32 implica que aproximadamente un 4 por ciento de los enlaces correctos no se recuperan en el top 32.
- Limitaciones de contexto: la longitud maxima de contexto es de 512 tokens para consultas y 128 tokens para pasajes. Afiliaciones extremadamente largas o registros ROR con descripciones muy extensas podrian truncarse.
- Limitaciones de idioma: aunque hereda el soporte multilingue del modelo base, no se especifica la lista exacta de idiomas soportados. El rendimiento en cadenas no latinas es alto (96,6 por ciento en test), pero no se detallan otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y distribucion sin restricciones significativas, siempre que se incluya el aviso de copyright y la licencia.
- Caveats para produccion: el modelo esta disenado como parte de un pipeline mas amplio que incluye un indice lexico y un modelo de conjunto. Usarlo de forma aislada puede no alcanzar la precision del sistema completo. Ademas, el corpus ROR cambia con el tiempo, por lo que los embeddings de los registros deben recalcularse periodicamente para mantener la cobertura actualizada.
- El modelo fue entrenado con una unica GPU NVIDIA L4 durante 1,8 horas, lo que sugiere un ajuste relativamente ligero sobre el modelo base; variaciones en los datos de entrenamiento podrian afectar significativamente al rendimiento.
- No se dispone de informacion sobre el rendimiento en otros conjuntos de datos distintos al proporcionado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-no-synthetic
- Variante base del retriever: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Variante con destilacion OpenAlex/Jev: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Modelo de conjunto (set model): https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset de juicios del profesor: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Coleccion de emparejamiento ROR: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Repositorio GitHub del proyecto: https://github.com/adambuttrick/ror-set-point-matching
- Registro en free2aitools: https://free2aitools.com/model/adambuttrick/ror-set-point-retriever-e5-base-no-synthetic
