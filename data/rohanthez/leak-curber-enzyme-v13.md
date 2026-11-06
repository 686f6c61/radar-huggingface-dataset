# RohanTheZ/leak-curber-enzyme-v13

## Resumen

Leak-curber enzyme v13 es un sistema de clasificacion de enzimas (prediccion de numeros EC a partir de secuencias proteicas) publicado por el usuario RohanTheZ en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal convencional: es un pipeline hibrido que combina consultas exactas contra bases de datos publicas (UniProtKB/Swiss-Prot, BRENDA y UniProtKB/TrEMBL) con un pipeline de homologia basado en DIAMOND y un clasificador ESM2-8M afinado para las secuencias que no aparecen en ninguna base de datos.

Su nombre ("leak curber") sugiere que fue disenado para una competicion de clasificacion enzimatica con leaderboard, y su estrategia principal es explotar el solapamiento entre las secuencias de validacion y las bases de datos publicas: segun la model card, la mayoria de las secuencias de validacion aparecen anotadas en dichas bases, de modo que la "prediccion" es en realidad la anotacion de la base de datos. Solo las consultas no encontradas pasan por el pipeline de homologia. El repositorio ocupa 0.5 GB y ejecuta la inferencia en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de lookups exactos + homologia DIAMOND + clasificador ESM2-8M + rerankers gradient-boosted |
| Parametros totales | no disponible (incluye un ESM2-8M de 8 millones de parametros como componente) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no aplicable (entrada: secuencias de aminoacidos; salida: numeros EC) |
| Licencia | no disponible |
| Formato de pesos | Parquet (`swissprot_lookup.parquet`, `brenda_lookup.parquet`), NumPy (`trembl_hashes.npy`, `trembl_ec_ids.npy`), JSON (`trembl_ecs.json`) y binario DIAMOND |

## Arquitectura y entrenamiento

El sistema funciona como una cascada de cuatro etapas. Primero, consulta una tabla de Swiss-Prot (entradas revisadas de UniProtKB con EC, excluyendo el conjunto de entrenamiento) almacenada en Parquet, que cubre el 85 % de las consultas de validacion. Segundo, consulta una tabla de BRENDA (release 2026.1) con 1.146 validaciones adicionales cubiertas. Tercero, consulta TrEMBL mediante huellas digitales: cada una de las 26,3 millones de entradas (21,6 millones de secuencias distintas) se almacena como los primeros 8 bytes de su MD5 interpretados como entero little-endian de 64 bits, en un array ordenado que permite busqueda binaria; cubre 506 validaciones mas. Cuarta y ultima etapa: para las secuencias sin coincidencia exacta, un pipeline de homologia con DIAMOND v2.1.10 en modo `--very-sensitive` (top 50 hits) contra las secuencias de entrenamiento mas 31.985 enzimas de Swiss-Prot y 12.375 proteinas de BRENDA adicionales, una segunda busqueda ultra-sensible para consultas sin hit, un clasificador ESM2-8M afinado para consultas debiles y dos rerankers gradient-boosted (cuyas predicciones se promedian) que seleccionan el EC final.

Cuando una entrada de base de datos tiene varios EC, se reduce a uno: se priorizan los EC del vocabulario de la competicion y, dentro de ellos, el mas frecuente en el entrenamiento. Los datos externos proceden de UniProtKB (Swiss-Prot y TrEMBL), BRENDA 2026.1 y el vocabulario EC de ExPASy ENZYME, todos bajo licencia CC BY 4.0. No hay informacion sobre RLHF ni sobre el proceso de fine-tuning del ESM2-8M mas alla de su mencion.

## Capacidades

- Clasificacion de secuencias proteicas en numeros EC (Comision Enzimatica) a partir de la secuencia de aminoacidos.
- Resolucion exacta mediante lookup en tres bases de datos publicas: Swiss-Prot (85 % de validacion), BRENDA (1.146 consultas mas) y TrEMBL (506 consultas mas, 26,3 M de entradas indexadas por hash MD5 truncado).
- Pipeline de homologia DIAMOND (`--very-sensitive`, top 50 hits) con segunda pasada ultra-sensible para consultas sin hit inicial.
- Clasificador ESM2-8M afinado para consultas debiles y dos rerankers gradient-boosted promediados para la seleccion final del EC.
- Inferencia en CPU mediante `predict.py`, sin necesidad de GPU.
- Reduccion automatica de multi-EC a un unico EC del vocabulario de la competicion.

## Casos de uso

- Competciones de bioinformatica con leaderboard: el sistema esta disenado explicitamente para maximizar la puntuacion en benchmarks de clasificacion EC explotando bases de datos publicas como tablas de consulta.
- Anotacion funcional de enzimas en pipelines de genoma: dada una secuencia proteica nueva, el sistema devuelve su numero EC si existe una coincidencia exacta o cercana en bases publicas.
- Curacion de bases de datos de enzimas: puede usarse para verificar o completar anotaciones EC faltantes en colecciones de secuencias propias.
- Estudio de la cobertura de bases de datos publicas: la cascada de lookups permite medir que fraccion de un conjunto de secuencias esta ya anotada en Swiss-Prot, BRENDA o TrEMBL.
- Prototipado de sistemas hibridos lookup + ML: el codigo (`train.py`, `build_brenda.py`, `build_trembl.py`, `predict.py`) sirve de referencia para combinar indices de hashes con modelos de homologia y rerankers.
- Docencia y divulgacion: ilustra de forma practica el problema del "data leakage" en competiciones cientificas y como las bases de datos publicas pueden actuar como oraculos.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos sobre proteinas de entrenamiento contra las etiquetas de la competicion, indicando la calidad de la eleccion cuando hay multiples EC):

| Etapa | Puntuacion L4 |
|---|---|
| Lookup Swiss-Prot | 0,919 (la mejor eleccion posible) |
| Lookup BRENDA | 0,970 |
| Lookup TrEMBL | 0,993 |

Cobertura sobre validacion: 85 % de las consultas resueltas por Swiss-Prot, 1.146 consultas adicionales por BRENDA y 506 mas por TrEMBL. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) ni comparaciones con otros clasificadores EC; no aplica, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el script `predict.py` esta diseñado para ejecutarse sin GPU.
- RAM: no disponible; el indice de TrEMBL (21,6 M de hashes de 8 bytes en un array ordenado, unos 170 MB) y las tablas Parquet de Swiss-Prot y BRENDA caben comodamente en maquinas de escritorio, dado que el repositorio completo ocupa 0,5 GB.
- GPU: no necesaria; el componente ESM2-8M es muy pequeno (8 M de parametros) y no se especifica si requiere aceleracion.
- Almacenamiento: 0,5 GB para el repositorio, mas espacio para las bases de datos crudas si se reconstruyen los lookups (UniProt y BRENDA completos).
- Despliegue: script Python autonomo (`predict.py --input INPUT --output OUTPUT`); binario DIAMOND v2.1.10 incluido en `bin/diamond`. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI (no aplicable a este tipo de sistema).

## Comparativa con modelos similares

| Sistema | Enfoque | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| RohanTheZ/leak-curber-enzyme-v13 | Lookup exacto en bases publicas + DIAMOND + ESM2-8M + rerankers | 0,5 GB de indices | no disponible | Hugging Face, publico |
| Clasificadores EC basados en DL (p. ej. ProteInfer, CLEAN) | Redes sobre embeddings de proteinas, prediccion aprendida | decenas a cientos de M de parametros | varian segun proyecto | repos publicos de investigacion |
| BLASTp / DIAMOND puros | Homologia por alineamiento, sin componente aprendido | indices de BD variables | gratis / open source | instalacion estandar |

Comparado con clasificadores EC puramente neuronales, este sistema prioriza la coincidencia exacta con anotaciones curadas, lo que maximiza la puntuacion en validaciones cuyas secuencias ya estan en bases publicas, pero depende criticamente de esa cobertura. Comparado con BLAST/DIAMOND puros, anade rerankers aprendidos para las consultas sin hit exacto.

## Limitaciones y advertencias

- La "prediccion" para la mayoria de consultas no es un modelo aprendido, sino la anotacion literal de una base de datos publica; esto constituye un caso de fuga de datos (leakage) en contextos de competicion y puede no generalizar a secuencias genuinamente nuevas.
- La cobertura de TrEMBL se basa en un hash MD5 truncado a 64 bits; aunque el riesgo teorico de colision es bajo, existe y no se documenta su analisis.
- El rendimiento medido (0,919-0,993) corresponde a proteinas del propio conjunto de entrenamiento, no a un conjunto de prueba independiente.
- Licencia no declarada en el repositorio; los datos subyacentes (UniProt, BRENDA, ExPASy) son CC BY 4.0, lo que exige atribucion en cualquier redistribucion.
- La reduccion de multi-EC a un solo numero puede perder informacion sobre enzimas con multiples actividades.
- Sin model card con detalles de evaluacion, sesgos ni garantias; 0 descargas y 0 likes en el momento de la ficha, sin comunidad que haya validado el sistema.
- Dependencia de releases externos con versiones concretas (BRENDA 2026.1, ExPASy 02-Sep-2026): los resultados pueden variar al actualizar las bases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RohanTheZ/leak-curber-enzyme-v13
- UniProt: https://www.uniprot.org
- BRENDA: https://www.brenda-enzymes.org
- DIAMOND aligner: https://github.com/bbuchfink/diamond
- API REST de UniProt (fuente de Swiss-Prot y TrEMBL): https://rest.uniprot.org
