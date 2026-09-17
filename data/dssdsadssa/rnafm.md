# dssdsadssa/rnafm

## Resumen

RNA-FM (RNA Foundation Model) es un modelo de lenguaje preentrenado para secuencias de ARN, desarrollado por el grupo ml4bio y distribuido en este repositorio por el usuario dssdsadssa. El modelo se entrena de forma autosupervisada sobre mas de 23 millones de secuencias de ARN no codificante (ncRNA) y su objetivo es extraer informacion estructural y funcional directamente de la secuencia, sin depender de etiquetas experimentales. Una extension directa, mRNA-FM, se entrena exclusivamente sobre 45 millones de secuencias codificantes de ARNm.

Su relevancia practica radica en que produce embeddings de proposito general para ARN, utilizables como representacion base en tareas muy diversas: prediccion de estructura secundaria y terciaria, agrupamiento de familias de ARN y analisis funcional. Esto evita tener que entrenar un modelo desde cero para cada tarea biologica concreta.

El modelo esta publicado bajo licencia Apache 2.0 y su repositorio en HuggingFace ocupa 3,8 GB. La model card no detalla la arquitectura interna, el numero de parametros, la longitud de contexto ni los idiomas, por lo que estos datos figuran como no disponibles en esta ficha; para los detalles tecnicos de arquitectura y entrenamiento, la propia model card remite a los articulos citados (arXiv 2204.00300 y el articulo asociado en Nature Methods de 2024).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; se describe como modelo de lenguaje preentrenado para secuencias de ARN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los idiomas no aplican al caso de uso; el modelo opera sobre secuencias de nucleotidos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 3,8 GB; el codigo publico esta en GitHub, https://github.com/ml4bio/RNA-FM) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se especifica si se trata de un transformer encoder, de un modelo tipo MoE o de otra variante, ni el numero de capas, dimensiones ocultas o parametros. Lo que si se detalla es el regimen de entrenamiento: aprendizaje autosupervisado sobre mas de 23 millones de secuencias de ncRNA, con el objetivo de extraer informacion estructural y funcional sin recurrir a etiquetas experimentales. Se indica tambien que mRNA-FM, la extension del modelo, se entreno exclusivamente sobre 45 millones de secuencias codificantes (CDS) de ARNm.

Como innovacion destacable, el planteamiento central es que los embeddings generados sean de proposito general y reutilizables en multiples tareas posteriores (estructura secundaria y terciaria, agrupamiento de familias, analisis funcional), en lugar de optimizar un modelo distinto por tarea. No se detalla si hubo tecnicas de alineacion tipo RLHF o DPO, ni la composicion exacta del dataset mas alla del recuento de secuencias. Para los detalles de arquitectura y metodologia, la model card remite a los articulos citados.

## Capacidades

- Generacion de embeddings de proposito general para secuencias de ARN, tanto ncRNA (RNA-FM) como ARNm codificante (mRNA-FM).
- Prediccion de estructura secundaria de ARN.
- Prediccion de estructura terciaria (3D), segun se indica en la model card y en el articulo asociado de Nature Methods de 2024.
- Agrupamiento y clasificacion de familias de ARN.
- Analisis funcional de secuencias de ARN.
- Extraccion de representaciones sin necesidad de etiquetas experimentales, lo que habilita su uso como base para fine-tuning en tareas concretas.
- No se documenta soporte de tool calling, function calling, capacidades de agente, multimodalidad, modo de razonamiento explicito ni capacidades multilingues.

## Casos de uso

- Prediccion de estructura secundaria de ARN: el modelo aporta representaciones por residuo que alimentan una cabeza de prediccion de emparejamientos de bases, reduciendo la dependencia de datos etiquetados experimentalmente.
- Prediccion de estructura terciaria: integrado en pipelines de deep learning basados en modelo de lenguaje, como el descrito en el articulo de Nature Methods de 2024, permite estimar conformaciones 3D de ARN.
- Agrupamiento de familias de ARN: los embeddings sirven como entrada a algoritmos de clustering para agrupar secuencias por similitud estructural o funcional sin necesidad de alineamientos multiples.
- Anotacion funcional de ncRNA: uso de las representaciones para clasificar secuencias no anotadas en categorias funcionales conocidas, acelerando el analisis de transcriptomas.
- Base para fine-tuning especifico: congelar o ajustar el modelo en tareas downstream (clasificacion, regresion de propiedades, deteccion de motivos) cuando se dispone de pocas etiquetas.
- Analisis de variantes y mutaciones: comparar embeddings de secuencias wild-type y mutantes para priorizar variantes con impacto estructural o funcional potencial.
- Investigacion en terapias de ARNm: mRNA-FM, entrenado sobre 45 millones de CDS, puede emplearse para representar y evaluar secuencias codificantes en contextos de diseno de constructos.
- Recuperacion y busqueda de similitud en bases de datos de ARN: indexar embeddings para busqueda por vecino mas cercano sobre grandes catalogos de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas numericas (por ejemplo, MMLU, HumanEval o GSM8K, que ademas no aplican a este dominio) ni metricas comparativas de las tareas de ARN. Para resultados cuantitativos hay que consultar los articulos citados (arXiv 2204.00300 y Nature Methods 2024), no incluidos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El numero de parametros no se especifica, por lo que no puede calcularse una cifra fiable a partir del tamano del repositorio.
- Tamano del repositorio: 3,8 GB, lo que sugiere que el espacio en disco necesario es moderado y compatible con equipos de trabajo convencionales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; dado el tamano del repositorio (3,8 GB) es plausible que el modelo quepa en GPU de consumo con VRAM suficiente, pero esto no puede confirmarse sin conocer el recuento de parametros y el formato de pesos.
- Opciones de despliegue: la model card solo indica que el codigo completo esta en GitHub (https://github.com/ml4bio/RNA-FM). No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RNA-FM | no disponible | no disponible | 23+ millones de secuencias de ncRNA, autosupervisado | Apache 2.0 | HuggingFace (repo dssdsadssa/rnafm) y GitHub ml4bio/RNA-FM |
| mRNA-FM | no disponible | no disponible | 45 millones de secuencias CDS de ARNm, autosupervisado | no disponible en la informacion proporcionada | Extension de RNA-FM; enlace no disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoria (modelos fundacionales de ARN) en la informacion proporcionada, por lo que la comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Repositorio no oficial: el autor del repositorio es dssdsadssa, no el grupo desarrollador (ml4bio). No hay garantia de que los pesos correspondan a una version oficial ni de que se actualicen.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0 likes, lo que impide validar su uso por parte de la comunidad.
- Fecha de creacion inusual (2026-09-17) y sin actualizaciones posteriores registradas, lo que dificulta el control de versiones.
- Riesgo de alucinacion: no procede en el sentido de generacion de texto, ya que el modelo produce embeddings; el riesgo equivalente es producir representaciones poco fiables para secuencias muy alejadas de la distribucion de entrenamiento.
- Sesgo de datos: el modelo se entrena sobre bases de datos publicas de ncRNA y CDS, por lo que hereda los sesgos de composicion taxonomica y de anotacion de dichas bases. Este sesgo no se cuantifica en la model card.
- Cobertura limitada a ARN: no se documentan capacidades fuera del dominio de secuencias de ARN; no se debe esperar soporte de texto general, codigo, vision ni audio.
- Limitaciones de contexto: se desconoce la longitud maxima de secuencia manejable, lo que impide garantizar el tratamiento de transcritos largos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero al tratarse de un repositorio no oficial conviene verificar la licencia en la fuente original antes de un despliegue en produccion.
- Ausencia de benchmarks publicados en la informacion disponible, lo que impide estimar la calidad relativa frente a alternativas.
- Caveat de produccion: al ser un modelo de embeddings para un dominio cientifico especializado, requiere validacion experimental especifica antes de usarse en decisiones biomedicas.

## Enlaces

- HuggingFace: https://huggingface.co/dssdsadssa/rnafm
- Codigo fuente (GitHub): https://github.com/ml4bio/RNA-FM
- Articulo RNA-FM: https://arxiv.org/abs/2204.00300
- Articulo de prediccion de estructura secundaria de ARN: https://arxiv.org/abs/2002.05810
- Articulo Nature Methods 2024 (Accurate RNA 3D structure prediction using a language model-based deep learning approach): enlace directo no disponible en la informacion proporcionada
- Demo: no disponible
