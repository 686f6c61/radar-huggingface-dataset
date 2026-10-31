# AbhijeetKumar2125/da3410-ec-retrieval-v5

## Resumen

DA3410 EC Retrieval v5 — Adaptive Homology es un sistema de clasificacion enzimatica de proteinas desarrollado por el usuario AbhijeetKumar2125 y publicado en HuggingFace. No se trata de un modelo neuronal en el sentido clasico, sino de un sistema de recuperacion homologa basado en MMseqs2, una herramienta de busqueda de similitud de secuencias de altisimo rendimiento. El sistema asigna a cada secuencia de proteina un numero EC (Enzyme Commission) mediante voto ponderado por similitud sobre los homologos mas cercanos de una base de datos de referencia.

El problema que resuelve es la anotacion funcional automatica de enzimas: dado un aminoacido en secuencia, predecir el codigo EC que describe la reaccion quimica que cataliza. Es relevante porque la anotacion manual es costosa y la mayoria de las proteinas recientemente secuenciadas carecen de asignacion funcional. Con un tamano de repositorio de 1,6 GB (dominado por la base de datos MMseqs2 de referencia), el sistema es ligero en computo comparado con modelos de lenguaje proteico y completamente reproducible en contenedor Docker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de recuperacion homologa basado en MMseqs2 con voto ponderado por similitud (no es una red neuronal) |
| Parametros totales | no disponible (no es un modelo con pesos entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (limitada por MMseqs2, sin limite fijo publicado) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (trabaja sobre secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | no aplicable; base de datos MMseqs2 (`mmseqs_db/`), anotaciones TSV y vocabulario EC en JSON |

## Arquitectura y entrenamiento

El sistema sigue un pipeline de cinco pasos: primero busca en la base de datos de proteinas de referencia con MMseqs2; despues recupera hasta 50 homologos candidatos; a continuacion pondera las anotaciones EC de cada candidato en funcion del bit score, la identidad de secuencia, la cobertura de la query, la cobertura del target y el rango del hit. La innovacion destacable es el ajuste adaptativo de la contribucion del hit mas cercano: el peso del vecino mas proximo se modula segun su identidad y cobertura, lo que permite que el sistema confie mas en el vecino unico cuando este es muy similar y reparta el voto cuando la similitud es debil. Finalmente devuelve un numero EC seleccionado del vocabulario de entrenamiento (`ec_vocabulary.json`).

No hay entrenamiento neuronal: la "base de conocimiento" es la base de datos de referencia MMseqs2 junto con las anotaciones de proteinas de entrenamiento (`full_retrieval_train_labels.tsv`). No se ha publicado informacion sobre el numero de secuencias de referencia, su origen ni el procedimiento de construccion del dataset.

## Capacidades

- Clasificacion de secuencias enzimaticas en un numero EC del vocabulario de entrenamiento.
- Busqueda de homologos hasta 50 candidatos por consulta mediante MMseqs2, con metricas alineamiento estandar (bit score, identidad, coberturas).
- Ponderacion adaptativa del hit mas cercano segun identidad y cobertura.
- Ingesta de entrada en formato Parquet con columnas `id` y `sequence`, con validacion y deduplicacion de secuencias.
- Salida en JSON Lines, un registro por secuencia unica de entrada.
- Despliegue reproducible mediante Dockerfile incluido en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, vision o audio.

## Casos de uso

- Anotacion automatica de genomas: tras ensamblar y anotar genes de un genoma nuevo, se puede pasar el proteoma completo en Parquet para obtener numeros EC y reconstruir rutas metabolicas.
- Curacion de bases de datos enzimaticas: permite verificar o proponer anotaciones EC en repositorios de proteinas mal anotadas, usando el voto ponderado como evidencia de similitud.
- Filtrado en cribados de enzimas industriales: para librerias de secuencias candidatas, el sistema identifica rapidamente que secuencias son homologas a enzimas conocidas de una clase EC concreta.
- Preprocesamiento para modelos de aprendizaje profundo: las predicciones EC pueden servir como etiquetas debiles para entrenar o validar clasificadores neuronales de enzimas.
- Analisis metagenomico: asignacion funcional preliminar de ORFs procedentes de muestras ambientales, donde la mayoria de secuencias carece de anotacion experimental.
- Documentacion y trazabilidad en pipelines bioinformaticos: al ser determinista y basado en alineamiento, cada prediccion es explicable por los homologos recuperados, util en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplicable; el sistema no requiere GPU, la busqueda MMseqs2 se ejecuta en CPU.
- GPU recomendadas: no aplicable.
- Consumer hardware: si, el repositorio pesa 1,6 GB y MMseqs2 esta optimizado para ejecutarse en maquinas de escritorio o portatiles convencionales; no se han publicado requisitos minimos de RAM, pero bases de datos MMseqs2 de tamano moderado suelen operar con unos pocos GB de memoria.
- Despliegue: contenedor Docker incluido (Dockerfile); la inferencia se invoca con `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles; dependen del tamano de la base de datos y del numero de secuencias de entrada, aunque MMseqs2 es conocido por su alto rendimiento en CPU frente a BLAST.

## Comparativa con modelos similares

| Sistema | Tipo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| DA3410 EC Retrieval v5 | Recuperacion homologa (MMseqs2) con voto ponderado | Numero EC unico por secuencia | MIT | HuggingFace, repositorio de 1,6 GB |
| BLASTp + anotacion manual | Alineamiento clasico + curacion | Hits crudos, requiere interpretacion humana | Gratuito para uso academico (NCBI) | Servicio web y binarios NCBI |
| ProteInfer (Google Research) | Red neuronal convolucional sobre secuencia | Numeros EC con probabilidades | Apache 2.0 | Codigo abierto en GitHub |
| DeepEC / CAT / eggNOG-mapper | Pipelines de homologia y aprendizaje automatico | Numeros EC y GO | Varias (uso academico en general) | Repositorios publicos |

La ventaja de DA3410 frente a BLASTp manual es la asignacion directa de un EC mediante votacion ponderada y deduplicacion automatica; frente a los enfoques neuronales, ofrece predicciones trazables a homologos concretos, a costa de no generalizar a enzimas sin homologos cercanos en la base de referencia.

## Limitaciones y advertencias

- Solo puede predecir numeros EC presentes en `ec_vocabulary.json`; enzimas de clases ausentes en la base de referencia no seran reconocidas.
- Al depender de homologia, el rendimiento degrada notablemente para enzimas orfanas o familias poco representadas en la base de datos.
- No se ha publicado evaluacion cuantitativa (precision, recall, F1), por lo que la calidad de las predicciones no puede verificarse a partir de la model card.
- El repositorio registra 0 descargas, sin comunidad de validacion externa aparente.
- La salida incluye un unico EC por secuencia; no cubre enzimas multifuncionales con varias actividades a menos que el sistema lo gestione internamente (no documentado).
- Licencia MIT: permite uso comercial sin restricciones significativas, aunque las licencias de MMseqs2 (Apache 2.0/GPL segun version) y de las bases de datos de proteinas de referencia deben revisarse para despliegues en produccion.
- No hay informacion sobre sesgos del dataset de referencia; bases de datos de EC suelen estar sesgadas hacia enzimas bien estudiadas (metabolismo central, organismos modelo).
- El ejemplo de salida de la model card indica explicitamente que el numero EC mostrado es ilustrativo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AbhijeetKumar2125/da3410-ec-retrieval-v5
- MMseqs2 (herramienta subyacente): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponibles
