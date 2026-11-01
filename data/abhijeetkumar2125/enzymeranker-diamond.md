# AbhijeetKumar2125/EnzymeRanker-DIAMOND

## Resumen
EnzymeRanker-DIAMOND es un pipeline de clasificacion enzimatica (prediccion del numero EC, Enzyme Commission) presentado como paquete de submission para la tarea `leak-curber-enzyme-classification` (benchmark `leak-curber-enzyme-classification-20261023`). No es un modelo neuronal entrenado al uso, sino un sistema de recuperacion por homologia: cada secuencia proteica unica se busca con DIAMOND contra bases de referencia que llevan etiquetas EC y los numeros EC de los mejores hits se combinan mediante un voto ponderado por bitscore. El autor es AbhijeetKumar2125 y el repositorio ocupa 0,5 GB.

El pipeline funciona de extremo a extremo en CPU con numpy/pandas/scipy y produce salida en formato valido, pero el propio autor advierte que la precision no esta medida: no se dispuso de datos de validacion de la competicion, no se construyo ni ejecuto imagen Docker y los tiempos se midieron con 1 vCPU en lugar de las 2 vCPUs del evaluador. El ~84 % de L4 que se menciona en la descripcion NO esta reproducido.

Es relevante ahora como ejemplo de solucion clasica de recuperacion (DIAMOND + voto ponderado + red de seguridad k-mer) para anotacion funcional de proteinas, y como caso de estudio de submission con limitaciones declaradas de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion por homologia (DIAMOND) con voto ponderado por bitscore; no es una red neuronal |
| Parametros totales | no disponible (no hay pesos de modelo neuronal; el repositorio contiene indices DIAMOND y tablas auxiliares) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; entradas son secuencias proteicas individuales) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica; la entrada son secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | Indices DIAMOND (`train.dmnd`, `trembl_ev2.dmnd`, `train_only.dmnd`), `ranker.npz`, `te_tables.json.gz`, `ec_vocabulary.json`, `mode.json` |

## Arquitectura y entrenamiento
El sistema no entrena un transformer ni un clasificador neuronal en el flujo por defecto. La arquitectura es un pipeline modular (`ecpred/pipeline.py`) que: (1) deduplica las secuencias de entrada y sanea una copia para la consulta (espacios eliminados, caracteres no alfabeticos convertidos a `X`); (2) ejecuta una busqueda DIAMOND contra `weights/train.dmnd` con modo adaptativo (`very-sensitive` hasta 14k consultas, `sensitive` hasta 40k, `fast` en otro caso), `-k 50`, por chunks y con 2 hilos; (3) re-busca consultas debiles (sin hit o mejor hit ≤30 % de identidad, hasta 3000) con `--ultra-sensitive` si la busqueda principal termino antes de 215 s; (4) hace una pasada rapida extra contra `weights/trembl_ev2.dmnd` si el tiempo transcurrido es inferior a 330 s; (5) agrega los 50 mejores hits con peso `w = (bitscore/best)^12 × peso de fuente` (sp_ 1.0, un_ 0.2, u2_ 0.1), desempata por frecuencia EC en train y devuelve hasta 10 ECs distintos filtrados contra `ec_vocabulary.json`; (6) aplica redes de seguridad: DIAMOND se mata a los 420 s conservando chunks terminados, las consultas sin resolver pasan a un vecino mas cercano TF-IDF de 3-mers (si han transcurrido menos de 450 s) y el resto recibe el EC mas frecuente en train.

Las bases de referencia suman 281.143 secuencias en `train.dmnd` (186.488 de train + 31.985 Swiss-Prot + 62.670 TrEMBL) y 206.689 secuencias TrEMBL-v2 en `trembl_ev2.dmnd`. La reconstruccion de `train.dmnd` desde las fuentes empaquetadas reproduce exactamente los conteos del fichero distribuido (281.143 secuencias / 135.059.194 letras). Existe un modo alternativo `--scoring learned` que activa un re-ranker de gradient boosting (`ranker.npz` + `te_tables.json.gz`), pero no es el predeterminado. Respecto al codigo original se elimino la rama CNN (sus ficheros no estaban en el archivo y el modo `vote` nunca los usaba), se anadieron guardas de `KeyError`, registro de errores de configuracion, `--ignore-warnings` en DIAMOND, conservacion de resultados parciales en el deadline y rescate k-mer.

## Capacidades
- Prediccion de numeros EC (Enzyme Commission) para secuencias proteicas mediante recuperacion por homologia.
- Deduplicacion de entradas por secuencia (gana el primer id, como hace el evaluador) sin alterar las secuencias en la salida.
- Busqueda adaptativa DIAMOND con cuatro modos de sensibilidad y `-k 50`.
- Agregacion multi-hit con voto ponderado por bitscore elevado a 12 y pesos por fuente de referencia.
- Devolucion de hasta 10 ECs distintos por secuencia, filtrados contra un vocabulario EC controlado.
- Red de seguridad k-mer TF-IDF de 3-mers para consultas sin resolver.
- Fallback final a la clase EC mas frecuente en train.
- Control de deadline configurable (`ECPRED_DEADLINE_S`) y desactivacion de DIAMOND (`ECPRED_DISABLE_DIAMOND=1`) para pruebas.
- Modo `--strict` para ejecucion sin proteinas externas (solo train) y modo `--scoring learned` con re-ranker GBM.
- No dispone de tool calling, capacidades de agente, vision, audio ni generacion de texto: no es un LLM.

## Casos de uso
- Anotacion funcional automatica de proteinas en pipelines de metagenomica: el pipeline asigna ECs a cada secuencia unica mediante homologia contra Swiss-Prot y TrEMBL, adecuado cuando se dispone de CPU y no de GPU.
- Pre-anotacion de genomas recien ensamblados: busqueda `very-sensitive` para conjuntos de hasta 14.000 consultas y agregacion multi-hit para reducir falsos positivos por hits aislados.
- Baseline de referencia en competiciones de clasificacion enzimatica: sirve como suelo de comparacion frente a modelos neuronales o de lenguaje proteico, con salida JSONL validada por `scripts/validate_output.py`.
- Curacion de bases de datos internas: deteccion de proteinas con EC asignado de forma consistente por multiples hits y pesos de fuente (sp_ 1.0 frente a un_ 0.2 y u2_ 0.1).
- Despliegue en entornos con restricciones severas: el pipeline corre en CPU con numpy/pandas/scipy, con un pico de RSS medido de 1,43 GB en la ejecucion de 3.009 entradas.
- Recuperacion de proteinas divergentes: la pasada `--ultra-sensitive` y el rescate k-mer cubren consultas debiles (≤30 % de identidad) cuando queda presupuesto de tiempo.
- Integracion en CI/CD de bioinformatica: pruebas unitarias (8 pasadas) y validador de salida permiten verificar formato antes de enviar resultados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La precision sobre el conjunto de validacion de la competicion no esta medida porque no se suministro. Se dispone unicamente de medidas de tiempo y memoria en sandbox (Linux x86-64, 1 vCPU, 3 GB RAM, Python 3.12):

| Ejecucion | Entradas unicas | Tiempo de pared | RSS pico | Resultado |
|---|---|---|---|---|
| Por defecto, 3.000 proteinas de train mutadas (35 % sustituciones) + 10 casos limite | 3.009 | 394 s | 1,43 GB | valido; 3.003 por vecinos, 6 por defecto |
| `--strict`, 40 mutadas + casos limite | 49 | 228 s | 2,43 GB | valido |
| DIAMOND desactivado (fallback k-mer) | 49 | 25 s | 2,42 GB | valido |
| `ECPRED_DEADLINE_S=60` (ruta watchdog) | 49 | 80 s | 2,43 GB | valido; k-mer rescato 48/48 |

Tiempos de DIAMOND por llamada a 1 hilo: `fast` ≈20 s; `sensitive` ≈93 s + 0,01 s/consulta; `very-sensitive` ≈84 s + 0,015 s/consulta; `ultra-sensitive` ≈329 s + 0,14 s/consulta. En la ejecucion de 3.009 consultas, la pasada ultra costo 231 s para 5 consultas debiles sin re-puntuar ninguna y consumio el presupuesto de la pasada extra TrEMBL-v2. Las consultas eran copias mutadas de proteinas de referencia, por lo que estas ejecuciones validan velocidad y formato, no precision.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Precision medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EnzymeRanker-DIAMOND | Recuperacion DIAMOND + voto ponderado | no aplica (indices de 281.143 + 206.689 secuencias) | no aplica | no medida | no disponible | HuggingFace (repo 0,5 GB) |
| Modelos de lenguaje proteico tipo ESM | Transformer sobre secuencias | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Herramientas clasicas de anotacion tipo BLASTp + reglas | Recuperacion por homologia | no aplica | no aplica | no disponible | no disponible | ampliamente disponibles |
| Prediccion EC con modelos deep learning supervisados | Red neuronal supervisada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Precision no medida: no se suministro el conjunto de validacion de la competicion y el ~84 % de L4 reportado no esta reproducido.
- No se construyo ni ejecuto imagen Docker (Docker no estaba disponible donde se ensamblo el paquete); los comandos de build y run quedan como tarea pendiente del usuario.
- Los tiempos se midieron con 1 vCPU, no con las 2 vCPUs del evaluador; se esperan tiempos menores en 2 vCPUs, pero no estan medidos.
- Riesgo de fuga de datos: las referencias derivadas de UniProt pueden contener proteinas de evaluacion de forma literal; el autor recomienda revisar las reglas de la tarea y usar `--strict` para una ejecucion sin proteinas externas. La exclusion por coincidencia exacta no se aplico a secuencias de test no disponibles en el momento del build.
- La rama CNN fue eliminada (sus ficheros `cnn.npz`/`cnn_numpy`/`cnn_feats` no estaban en el archivo); no hay re-ranker CNN disponible.
- Faltan y no son recuperables `train.parquet` y los datos de validacion (no suministrados).
- Dependencia de la disponibilidad y calidad de las bases DIAMOND: cambios en Swiss-Prot o TrEMBL alteran los resultados; los indices empaquetados son los que determinan el comportamiento.
- El deadline de 420 s para DIAMOND puede truncar resultados en conjuntos grandes; los chunks terminados se conservan, pero las consultas restantes caen a k-mer o a la clase mayoritaria.
- La pasada `ultra-sensitive` puede consumir el presupuesto de la pasada extra TrEMBL-v2, como ocurrio en la ejecucion medida.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion de los indices y binarios (DIAMOND v2.1.10, SHA-256 en `bin/NOTICE.txt`).
- No es un modelo generativo: no soporta tool calling, agentes, vision, audio ni conversacion; su uso esta limitado a clasificacion de secuencias.

## Enlaces
- HuggingFace: https://huggingface.co/AbhijeetKumar2125/EnzymeRanker-DIAMOND
- Tarea y benchmark citados en la model card: `leak-curber-enzyme-classification`, `leak-curber-enzyme-classification-20261023`
- Ficheros internos de referencia: `MANIFEST.md`, `CHECKSUMS.sha256`, `weights/mode.json`, `ecpred/pipeline.py`, `scripts/rebuild_dbs.py`, `scripts/validate_output.py`, `reports/diamond_mode_timing_1thread.log`, `bin/NOTICE.txt`
- No se han encontrado papers, blogs, repos adicionales ni demos en la informacion proporcionada.
