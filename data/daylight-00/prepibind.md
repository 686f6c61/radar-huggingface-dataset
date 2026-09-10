# daylight-00/prepibind

## Resumen

PREpiBind es una familia de cuatro modelos de prediccion de union entre peptidos y moleculas MHC de clase II, desarrollada por el usuario daylight-00. El problema que aborda es central en inmunologia computacional: determinar que fragmentos de proteina (epitopos) se presentan en el complejo mayor de histocompatibilidad de clase II y, por tanto, pueden desencadenar una respuesta de celulas T CD4+. Cada uno de los cuatro checkpoints publicados cubre un tipo de medicion experimental distinto (ensayos cualitativos de union, ligandos eluidos por espectrometria de masas, e IC50 con umbral de 500 nM y de 1000 nM), en lugar de ofrecer un unico modelo agregado.

Tecnicamente, PREpiBind no es un modelo de lenguaje ni un transformer entrenado desde cero. Codifica las secuencias de epitopo en tiempo de ejecucion con el backbone congelado ESM C 300M, utiliza embeddings HLA precalculados para las cadenas alfa y beta, y alimenta todo ello a una arquitectura ligera de self-attention que produce una puntuacion de union. Los checkpoints publicados contienen unicamente pesos en float32 (64 tensores, 55.820.161 parametros) y se distribuyen bajo licencia MIT.

La relevancia de esta publicacion es metodologica tanto como cientifica: el autor documenta de forma explicita que los checkpoints liberados son ejecuciones individuales seleccionadas por perdida de validacion minima, no las medias de 15 ejecuciones que aparecen en el articulo, y advierte de dos errores de instrumentacion en sus propios logs (argumentos intercambiados en `roc_auc_score` y un parser que filtraba minimos). Esa trazabilidad es poco habitual y conviene tenerla presente al interpretar cualquier cifra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ESM C 300M congelado + embeddings HLA precalculados (cadena alfa y beta) + cabeza de self-attention ligera con clasificador |
| Parametros totales | 55.820.161 parametros en el state_dict publicado (64 tensores float32); el backbone ESM C 300M se carga por separado |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible (no se documenta la longitud maxima de epitopo ni de peptido) |
| Tipos de cuantizacion | float32 en los checkpoints principales; existen copias float16 en `daylight-00/prepibind-demo`. No se publican formatos GGUF ni cuantizaciones de baja precision |
| Idiomas soportados | No aplica (modelo de proteinas; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), diccionario de una sola clave `{"model_state_dict": ...}` |
| Tamano por checkpoint | 213,0 MiB |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | tabular-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

PREpiBind predice la union MHC clase II–peptido explotando representaciones de un modelo de lenguaje de proteinas preentrenado. Segun la documentacion del autor, el modelo codifica las secuencias de epitopo en tiempo de ejecucion con ESM C 300M y emplea embeddings HLA precalculados para las cadenas alfa y beta (almacenados en `daylight-00/prepibind-embeddings`). Esos vectores se introducen en una arquitectura ligera de self-attention que devuelve una puntuacion de union. El backbone se referencia como `daylight-00/esmc-300m-2024-12` y se carga de forma independiente al state_dict publicado.

El entrenamiento se organizo por brazos, uno por tipo de medicion, y cada brazo se entreno como 15 ejecuciones: tres semillas (42, 100 y 128) por cinco folds de validacion cruzada. Todas las cifras del articulo son medias sobre esas 15 ejecuciones. En el caso del brazo de espectrometria de masas, el conjunto de entrenamiento declara 77.954 muestras procedentes de `data/dataset/ms_ql/train.csv`.

| Fichero | Brazo | Semilla | Fold | val_loss | Numero de epoca |
|---|---|---|---|---|---|
| `prepibind_qualitative_s100_f0.pt` | Ensayos cualitativos de union | 100 | 0 | 0,35582 | 20 |
| `prepibind_ms_s128_f3.pt` | Ligandos eluidos por espectrometria de masas | 128 | 3 | 0,12274 | 27 |
| `prepibind_ic50_500_s128_f2.pt` | IC50, umbral de binder < 500 nM | 128 | 2 | 0,46631 | 28 |
| `prepibind_ic50_1000_s42_f1.pt` | IC50, umbral de binder < 1000 nM | 42 | 1 | 0,49456 | 28 |

El autor documenta tres incidencias relevantes sobre el proceso de seleccion: (1) el checkpoint publicado es el argmin de val_loss de su brazo, por lo que no reproduce las medias del articulo; (2) la metrica `Val ROC-AUC` de los logs de entrenamiento no es valida porque `train.py` invoca `roc_auc_score(outputs, labels)` con los argumentos intercambiados, lo que hace que el 21,7 % de los valores registrados caiga fuera de [0, 1]; y (3) la columna `val_loss` de `analysis/scoring/*/per_run_results.csv` quedo obsoleta tras corregir un parser. La fila del brazo `ms` se re-selecciono el 2026-09-10 dentro del mismo brazo y sin cambiar el criterio.

## Capacidades

- Prediccion de union peptido–MHC de clase II: devuelve una puntuacion de union para un par epitopo/HLA.
- Cuatro cabezas especializadas segun el tipo de evidencia experimental: ensayos cualitativos, ligandos eluidos por espectrometria de masas, IC50 con umbral de 500 nM e IC50 con umbral de 1000 nM.
- Codificacion de secuencias de epitopo en tiempo de ejecucion mediante ESM C 300M, sin necesidad de precalcular embeddings de peptido.
- Uso de embeddings HLA precalculados para las cadenas alfa y beta, lo que evita recalcular la representacion del alelo en cada inferencia.
- Clasificacion tabular/binaria: el modelo produce una decision de union, no texto ni secuencias.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking ni procesamiento multimodal.
- No tiene capacidades multilingues ni de generacion de lenguaje natural, por tratarse de un modelo especifico de proteinas.

## Casos de uso

- Priorizacion de epitopos para vacunas: dado un antigeno proteico, se fragmenta en peptidos candidatos y se puntua su union a un panel de alelos HLA de clase II con el brazo cualitativo o el de IC50, ordenando los candidatos antes de validacion experimental.
- Cribado en immunopeptidomica: el brazo `ms` (ROC AUC 0,9911 en el checkpoint publicado) permite reordenar y filtrar listas de ligandos eluidos detectados por espectrometria de masas, ayudando a discriminar senal de ruido en experimentos de MHC ligandomics.
- Evaluacion de inmunogenicidad de proteinas terapeuticas: antes de avanzar un anticuerpo o una proteina de fusion a fases costosas, se comprueba si contiene epitopos con alta propension a presentarse en alelos HLA de clase II frecuentes en la poblacion.
- Priorizacion de neoantigenos en oncologia: a partir de variantes somaticas, se generan peptidos mutados y se comparan sus puntuaciones frente a la secuencia wild-type para seleccionar candidatos de vacuna personalizada.
- Investigacion en autoinmunidad: los alelos HLA de clase II estan implicados en enfermedades autoinmunes; el modelo permite explorar que peptidos propios o modificados se unen preferentemente a alelos de riesgo concretos.
- Filtrado en pipelines de diseno de peptidos: integrar el modelo como etapa de scoring dentro de un pipeline de generacion de candidatos, descartando automaticamente peptidos con baja probabilidad de union MHC-II.
- Analisis retrospectivo de datos publicos: al contar con cuatro brazos separados, se puede reevaluar conjuntos de datos historicos (ensayos de union, MS, IC50) con la cabeza estadisticamente mas proxima a su protocolo experimental.

## Benchmarks y rendimiento

Los cuatro conjuntos de test retenidos y nunca usados para seleccion son: 48.352 filas (qualitative), 33.490 (ms) y 14.150 (ambos brazos de IC50). Se comparan las medias del articulo sobre 15 ejecuciones frente al checkpoint publicado.

| Brazo | Metrica | Articulo (media ± sd, 15 runs) | Checkpoint publicado |
|---|---|---|---|
| qualitative | ROC AUC | 0,9193 ± 0,0028 | 0,9211 |
| qualitative | PR AUC | 0,9448 ± 0,0019 | 0,9460 |
| qualitative | F1 | 0,8586 ± 0,0037 | 0,8582 |
| qualitative | Accuracy | 0,8375 ± 0,0038 | 0,8391 |
| qualitative | MCC | 0,6683 ± 0,0084 | 0,6736 |
| ms | ROC AUC | 0,9897 ± 0,0009 | 0,9911 |
| ms | PR AUC | 0,9865 ± 0,0012 | 0,9884 |
| ms | F1 | 0,9439 ± 0,0042 | 0,9502 |
| ms | Accuracy | 0,9563 ± 0,0030 | 0,9612 |
| ms | MCC | 0,9083 ± 0,0063 | 0,9186 |
| ic50_500 | ROC AUC | 0,8375 ± 0,0039 | 0,8436 |
| ic50_500 | PR AUC | 0,7429 ± 0,0055 | 0,7520 |
| ic50_500 | F1 | 0,6764 ± 0,0146 | 0,6805 |
| ic50_500 | Accuracy | 0,7685 ± 0,0035 | 0,7739 |
| ic50_500 | MCC | 0,4979 ± 0,0107 | 0,5067 |
| ic50_1000 | ROC AUC | 0,8347 ± 0,0044 | 0,8401 |
| ic50_1000 | PR AUC | 0,8024 ± 0,0057 | 0,8093 |
| ic50_1000 | F1 | 0,7399 ± 0,0083 | 0,7322 |
| ic50_1000 | Accuracy | 0,7554 ± 0,0039 | 0,7575 |
| ic50_1000 | MCC | 0,5101 ± 0,0092 | 0,5110 |

El autor advierte que el checkpoint seleccionado tiende a puntuar ligeramente por encima de la media, ya que se eligio por una cantidad correlacionada con el rendimiento en test, con la excepcion de F1 en los brazos qualitative e ic50_1000, que queda ligeramente por debajo.

## Requisitos de hardware

- Parametros implicados en inferencia: aproximadamente 360 M en total (300 M del backbone ESM C 300M mas 55,8 M de la cabeza), aunque el state_dict publicado solo contiene los 55,8 M de la cabeza.
- VRAM estimada: en torno a 0,7 GB para los pesos en float16 y 1,4 GB en float32 (estimacion derivada del recuento de parametros, sin incluir activaciones ni overhead del framework).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para los pesos; una RTX 3060, RTX 4090, A100 o H100 cubren el modelo sin dificultad. El backbone ESM de 300 M es el componente dominante.
- Cabe en GPU de consumo: si. El autor publica copias float16 especificamente pensadas para notebooks y Colab (`daylight-00/prepibind-demo`).
- CPU: tecnicamente viable con PyTorch, pero sin datos de latencia publicados; el cuello de botella seria la codificacion con ESM C 300M.
- Opciones de despliegue: PyTorch con los scripts del repositorio (`configs/predict/config_demo.py`, `config_ms.py`, `config_ic50_500.py`, `config_ic50_1000.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La categoria de predictores de union MHC de clase II incluye herramientas consolidadas como NetMHCIIpan, MixMHC2pred y MHCnuggets. En la informacion disponible no se proporciona ninguna comparacion cuantitativa de PREpiBind frente a ellas, por lo que los campos correspondientes se marcan como no disponibles.

| Modelo | Tarea | Parametros | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| PREpiBind | Union MHC clase II–peptido (4 brazos) | 55,8 M en el state_dict + backbone ESM C 300M | MIT | ROC AUC 0,8347–0,9911 segun brazo |
| NetMHCIIpan | Union MHC clase II–peptido | No disponible | No disponible | No disponible |
| MixMHC2pred | Union MHC clase II–peptido | No disponible | No disponible | No disponible |
| MHCnuggets | Union MHC clase II–peptido | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los checkpoints publicados no reproducen las cifras del articulo: son ejecuciones individuales seleccionadas por val_loss minimo, no medias sobre 15 ejecuciones. No deben citarse como si fueran los numeros del paper.
- La metrica `Val ROC-AUC` de los logs de entrenamiento no es fiable: `train.py` llama a `roc_auc_score` con los argumentos intercambiados, lo que invalida el 21,7 % de los valores registrados.
- La columna `val_loss` de `analysis/scoring/*/per_run_results.csv` esta obsoleta (anterior a la correccion del parser) y no debe usarse.
- Existe una contradiccion documental: la model card afirma que los ficheros existen en local y que "nothing has been uploaded to HuggingFace", pese a que el repositorio de HuggingFace existe y ocupa 0,9 GB. Conviene verificar la integridad de los pesos antes de usarlos en produccion.
- El repositorio presenta 0 descargas y 0 likes, y no se ha publicado todavia informacion de uso independiente por terceros.
- No se documenta la longitud maxima de secuencia admitida, ni el rango de alelos HLA cubiertos, ni sesgos por alelo, poblacion o tipo de ensayo.
- Los cuatro brazos son modelos separados; usar el brazo equivocado para un protocolo experimental distinto puede degradar sustancialmente las predicciones (por ejemplo, aplicar el brazo qualitative a datos de IC50).
- El modelo produce puntuaciones de union, no medidas de afinidad calibradas ni predicciones de inmunogenicidad real: la union a MHC de clase II es necesaria pero no suficiente para una respuesta de celulas T.
- La licencia MIT permite uso comercial y modificacion, pero se ofrece sin garantia alguna; el autor no asume responsabilidad por decisiones biomedicas tomadas a partir de estas predicciones.
- No debe utilizarse como herramienta de diagnostico clinico sin validacion experimental independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/daylight-00/prepibind
- Codigo fuente y pipeline completo: https://github.com/daylight-00/PREpiBind
- README del repositorio de codigo: https://github.com/daylight-00/PREpiBind/blob/main/README.md
- Copias en float16 para notebooks y Colab: https://huggingface.co/daylight-00/prepibind-demo
- Backbone ESM C 300M utilizado: https://huggingface.co/daylight-00/esmc-300m-2024-12
- Almacen de embeddings HLA de longitud completa: https://huggingface.co/datasets/daylight-00/prepibind-embeddings
- Articulo cientifico: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
