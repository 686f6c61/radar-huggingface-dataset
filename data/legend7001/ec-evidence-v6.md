# Legend7001/ec-evidence-v6

## Resumen

`Legend7001/ec-evidence-v6` no es un modelo de lenguaje: es un artefacto de clasificacion para la asignacion de numeros EC (Enzyme Commission) a secuencias proteicas, presentado como submission del proyecto DA3410 a la tarea de clasificacion enzimatica «Leak CURBER». Lo publica el usuario de HuggingFace Legend7001 como un repositorio de 0,1 GB que contiene codigo de inferencia (`predict.py`, `ecfeat.py`), pesos en formato joblib, binarios estaticos de MMseqs2, una base de datos MMseqs2 de las secuencias de entrenamiento y ficheros JSON auxiliares.

El pipeline combina dos etapas: una busqueda de homologia con MMseqs2 (sensibilidad 5,7, prefilter y alineamiento ejecutados por separado) contra las secuencias de entrenamiento, cuyos EC pasan a ser candidatos; y un reranker de gradient boosting que puntua cada candidato usando exclusivamente evidencia de homologia (bitscore relativo al mejor hit, identidad, cobertura, ranking, acuerdo entre hits, ratio de longitud y competicion con EC hermanos), sin priors de frecuencia de EC. Se devuelve como prediccion un unico candidato, el mejor puntuado.

Su interes es acotado pero claro: es un ejemplo reproducible de evaluacion consciente de fugas de informacion (leakage) en un benchmark de anotacion, con inferencia offline en CPU y sin dependencia de GPU. El repositorio no declara licencia, idiomas, pipeline ni resultados de rendimiento, y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: busqueda de homologia con MMseqs2 (prefilter + alineamiento) y reranker de gradient boosting sobre caracteristicas de homologia |
| Parametros totales | no disponible (se distribuyen pesos joblib; no se declara el numero de parametros ni el tamano del conjunto de entrenamiento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); no se documenta limite de longitud de secuencia proteica |
| Tipos de cuantizacion | no aplica / no disponible (pesos joblib; los binarios MMseqs2 se distribuyen en builds AVX2 y SSE4.1) |
| Idiomas soportados | no aplica: entrada en formato FASTA de aminoacidos, salida en codigos EC |
| Licencia | no disponible (la model card no la declara); los binarios MMseqs2 incluidos son GPLv3 y el vocabulario ENZYME de ExPASy es CC BY 4.0 |
| Formato de pesos | joblib (`.joblib`) y JSON (`rerank_features.json`, `rerank_lr.json`, `train_ecs.json`, `baseline.json`); base de datos MMseqs2 precompilada |
| Tamano del repositorio | 0,1 GB |
| Entrada / salida | Secuencia proteica query (FASTA) / un unico codigo EC predicho |
| Dependencias | MMseqs2 (binarios incluidos en `bin/`), Python, joblib; indice de k-mers construido en tiempo de ejecucion |
| Hardware de inferencia | CPU x86-64 con AVX2 o SSE4.1; 2 hilos en la etapa de busqueda |
| Version del vocabulario EC | ExPASy ENZYME, release 02-Sep-2026 (CC BY 4.0) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La primera etapa es una busqueda de homologia con MMseqs2 (Steinegger y Soding, Nature Biotechnology 2017, GPLv3) a sensibilidad 5,7 y 2 hilos, con prefilter y alineamiento ejecutados como pasos separados de forma deliberada para no ejecutar nada desde `/tmp`. Cada secuencia query unica se busca contra las secuencias de entrenamiento (nombradas `t<row>` en la base de datos) y los EC de los hits se recolectan como conjunto de candidatos. La segunda etapa es un clasificador de gradient boosting que puntua cada candidato a partir de caracteristicas derivadas solo de la evidencia de homologia: bitscore relativo al mejor hit, identidad, cobertura, ranking del hit, acuerdo entre hits, ratio de longitud y competicion con EC hermanos. El diseno excluye explicitamente priors de identidad de EC, como la frecuencia de cada EC, para evitar atajos espurios.

El reranker se entreno con busquedas out-of-fold: cada secuencia de entrenamiento se busco contra las otras cuatro de las cinco particiones definidas por clustering al 40% de identidad, de modo que ninguna secuencia se puntua contra si misma. El modelo devuelve un unico EC (solo se puntua el primer EC de la referencia). El repositorio incluye una ruta de respaldo: un reranker logistico mas antiguo (`weights/rerank_lr.json`) y un EC de fallback (`weights/baseline.json`). `predict.py` incorpora ademas un guardia temporal (time guard) y filtrado de vocabulario. La eleccion del binario estatico AVX2 o SSE4.1 se hace leyendo `/proc/cpuinfo`. No se documentan ni el volumen de tokens/ejemplos de entrenamiento, ni la composicion del dataset, ni si hubo optimizacion adicional mas alla del ajuste supervisado del clasificador.

## Capacidades

- Prediccion de numeros EC para secuencias proteicas mediante transferencia de homologia mas reranking supervisado.
- Busqueda de homologia sensible contra una base de datos de secuencias de entrenamiento empaquetada, con indice de k-mers construido en tiempo de ejecucion.
- Puntuacion de candidatos con caracteristicas de homologia (bitscore relativo, identidad, cobertura, ranking, acuerdo entre hits, ratio de longitud, competencia entre EC hermanos).
- Inferencia completamente offline en CPU, sin acceso a red ni a servicios externos.
- Portabilidad de CPU dentro de x86-64: seleccion automatica del binario entre AVX2 y SSE4.1.
- Mecanismos de robustez operativa: guardia temporal, filtrado de vocabulario EC, reranker de respaldo y EC de fallback.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso; no es un modelo conversacional.
- No hay capacidades multilingues en el sentido habitual: el «lenguaje» de entrada es la secuencia de aminoacidos.

## Casos de uso

- Anotacion funcional de genomas y metagenomas recien secuenciados: se pasa un FASTA de proteinas predichas al pipeline y se obtiene un EC por secuencia, aprovechando que la inferencia es CPU-only y offline, lo que permite ejecutarla en nodos de calculo sin GPU.
- Triaje de candidatos enzima en proyectos de biologia sintetica: antes de caracterizar experimentalmente cientos de secuencias, el pipeline prioriza aquellas con evidencia de homologia fuerte y EC consistente entre hits.
- Pre-anotacion para curacion manual de bases de datos tipo UniProt o BRENDA: el EC propuesto y las caracteristicas de homologia (identidad, cobertura, acuerdo entre hits) sirven como cola de revision para curadores humanos.
- Reproduccion y auditoria de un submission a leaderboard: el repositorio conserva la base de datos, los pesos y el codigo exactos, lo que permite reejecutar la prediccion y verificar el protocolo de particion a 40% de identidad.
- Baseline de referencia en experimentos de prediccion de EC: cualquier modelo de deep learning puede compararse contra este pipeline bajo el mismo esquema de particiones para aislar cuanto aporta el aprendizaje frente a la mera transferencia de homologia.
- Despliegue en entornos air-gapped o con requisitos de soberania del dato: al no requerir red ni GPU y llevar los binarios y la base de datos dentro del repositorio, la secuencia no sale del perimetro del laboratorio.
- Material docente: caso practico de pipeline hibrido busqueda + machine learning y de diseno experimental para evitar fugas de informacion entre particiones de entrenamiento y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el metodo y el protocolo de evaluacion (busquedas out-of-fold sobre cinco particiones por clustering al 40% de identidad), pero no incluye metricas de exactitud, precision, recall ni puntuacion de leaderboard.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se requiere GPU en ninguna etapa.
- Arquitectura obligatoria x86-64 con extensiones AVX2 o SSE4.1 (el repositorio incluye ambos builds y selecciona leyendo `/proc/cpuinfo`). No se documenta soporte para ARM.
- VRAM estimada: no aplica (0 GB de VRAM).
- GPU recomendadas: no aplica. A100, H100 o RTX 4090 no aportan nada a este pipeline.
- Cabe en cualquier CPU de consumo moderna con AVX2; el limite practico es la RAM, cuyo requisito no se documenta.
- Huella en disco: 0,1 GB de repositorio, mas el indice de k-mers que MMseqs2 construye en tiempo de ejecucion y cuyo tamano no se especifica.
- Despliegue: ejecucion directa de `predict.py` con Python y joblib sobre los binarios incluidos. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no hay un modelo generativo que servir.
- Paralelismo: la busqueda se lanza con 2 hilos, lo que sugiere un consumo modesto por instancia y permite varias ejecuciones concurrentes en un mismo nodo.
- Latencia y throughput: no disponibles. Dependen del tamano de la base de datos, de la longitud de la query y del acierto de la guardia temporal.

## Comparativa con modelos similares

| Enfoque | Metodo | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-evidence-v6 | MMseqs2 + reranker de gradient boosting sobre evidencia de homologia | FASTA de proteina | no disponible | no declarada en el repo | HuggingFace, 0 descargas |
| MMseqs2 con transferencia del mejor hit | Busqueda de homologia pura, sin reranking | FASTA de proteina | no disponible en esta ficha | GPLv3 | Codigo abierto |
| BLASTp o DIAMOND con transferencia del mejor hit | Alineamiento local y asignacion directa del EC del hit | FASTA de proteina | no disponible en esta ficha | no verificado | Ampliamente disponible |
| Predictores de EC por deep learning (familia CLEAN, DeepEC, ECPred) | Redes neuronales o ensembles entrenados sobre secuencia y/o estructura | FASTA de proteina | no disponible en esta ficha | no verificado | Repositorios publicos |

La comparacion relevante aqui es metodologica: frente a la transferencia directa del mejor hit, este pipeline anade un reranking supervisado que puede corregir el sesgo del hit de mayor bitscore cuando hay hits discrepantes o EC hermanos en competencia. Frente a los predictores de deep learning, no puede asignar funcion a proteinas sin homologos en su base de datos. No hay numeros comparativos publicados para ninguna de las filas.

## Limitaciones y advertencias

- Dependencia total de la base de datos: una proteina sin homologos en las secuencias de entrenamiento no puede recibir una anotacion fiable; no hay capacidad de inferencia de funcion de novo.
- Propagacion de errores de anotacion: cualquier EC incorrecto presente en la base de datos de entrenamiento puede transferirse a las queries.
- Devuelve un unico EC y solo puntua el primer EC de la referencia; no cubre casos de enzimas con multiples actividades ni proteinas multidominio con varios EC.
- El modelo declara no usar priors de frecuencia de EC, pero la profundidad de la base de datos por familia puede inducir sesgos hacia las familias sobrerrepresentadas en el entrenamiento.
- El protocolo de evaluacion a 40% de identidad mide homology detection a ese nivel; el comportamiento en homologia remota (identidad muy baja) no esta documentado.
- Sin benchmarks publicados, 0 descargas y 0 likes: no hay evidencia independiente de calidad frente a baselines triviales.
- Licencia no declarada: no puede confirmarse el uso comercial del conjunto (codigo mas pesos mas base de datos). Ademas, los binarios MMseqs2 incluidos son GPLv3, lo que impone obligaciones de distribucion si se redistribuye el paquete.
- El vocabulario EC procede de ExPASy ENZYME release 02-Sep-2026 bajo CC BY 4.0, lo que exige atribucion.
- Ejecuta binarios precompilados incluidos en el repositorio; en entornos con politicas estrictas de cadena de suministro conviene verificarlos o recompilarlos.
- Requiere x86-64 con AVX2 o SSE4.1; sin soporte documentado para ARM ni para CPUs antiguas sin SSE4.1.
- No se documentan los limites de longitud de secuencia aceptados ni el umbral exacto de la guardia temporal, lo que complica estimar el comportamiento en lotes grandes.
- No apto para uso clinico ni diagnostico; es un artefacto de proyecto academico sin mantenimiento declarado (creado y actualizado el mismo dia).
- Riesgo de alucinacion en el sentido estadistico habitual: no aplica, pero si existe el riesgo analogo de asignar un EC con alta confianza aparente a partir de homologos parciales o poco identicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Legend7001/ec-evidence-v6
- MMseqs2, referencia citada en la model card (Steinegger y Soding, Nature Biotechnology 2017): https://doi.org/10.1038/nbt.3988
- Repositorio de MMseqs2: https://github.com/soedinglab/MMseqs2
- Vocabulario EC de referencia (ExPASy ENZYME): https://enzyme.expasy.org
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos (documentacion de un «evidence model» interno, una entrada de Wikipedia sobre un modelo propietario, una propuesta de regla federal de evidencia, una herramienta de documentacion clinica y un sistema de gestion de evidencia policial) no guardan relacion con este modelo.
