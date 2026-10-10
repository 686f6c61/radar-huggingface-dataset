# getSTEAV/system-one-fdb-ipblock

## Resumen

System One fraud detector for FDB ipblock es un clasificador binario apilado que decide si una direccion IPv4 aparece en una lista de bloqueo de inteligencia de amenazas. Lo desarrolla STEAV (steav.io) con CID Model Studio y se publica como modelo de referencia para el Fraud Dataset Benchmark (FDB) de Amazon Science, no como sistema de produccion. La salida es la probabilidad calibrada P(malicioso) para cada IP.

Tecnicamente es un stack de dos etapas. La primera es un modelo de arboles con gradient boosting que puntua cada IP a partir de caracteristicas de ingenieria. La segunda es System One, un modelo de decisiones tipadas construido sobre el encoder Laya ModernBERT-large (unos 395M de parametros) con un adaptador LoRA (rango 16, alfa 32, 4,39M de parametros) y una cabeza de decision (26,2M de parametros). System One lee la puntuacion del arbol, algunos campos legibles y los campos originales como evidencia JSON, y devuelve su propia probabilidad. La salida publicada es una mezcla logistica de ambas.

Su relevancia es metodologica: demuestra como apilar un modelo de decisiones tipadas sobre la puntuacion de un arbol mejora la interfaz de decision calibrada. En el split de test oficial de FDB (43.000 IP, 2.997 maliciosas) alcanza 0,9481 de AUROC y captura el 55,7% de las direcciones maliciosas con una tasa de falsos positivos del 1%, frente al mejor resultado publicado (AFD OFI, 0,937 de AUROC y 46,6% de recall).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de dos etapas: arboles con gradient boosting, seguido de System One (encoder ModernBERT-large con cabeza de decision tipada y adaptador LoRA); salida final por mezcla logistica |
| Parametros totales | Base Laya ModernBERT-large (~395M) + adaptador LoRA (4,39M) + cabeza de decision (26,2M); mas el modelo de arboles del stack |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (la referencia se ejecuta en bfloat16 en GPU y float32 en CPU) |
| Idiomas soportados | no disponible (tarea de clasificacion tabular; los campos son datos estructurados) |
| Licencia | Apache-2.0 para pesos y codigo; algunos ficheros de datos tienen sus propios terminos |
| Formato de pesos | safetensors (adaptador LoRA y cabeza); el base Laya se descarga por separado en la revision fijada |

## Arquitectura y entrenamiento

El modelo es un clasificador binario apilado. La primera etapa es un modelo de arboles con gradient boosting que genera una puntuacion por IP a partir de caracteristicas de ingenieria. La segunda etapa es System One, que se construye sobre `convaiinnovations/laya` en la revision `7b928d828b7b` (Apache-2.0), un encoder ModernBERT-large de unos 395M de parametros con la cabeza de decision tipada de Laya. Sobre esa base se entrena un adaptador LoRA de rango 16 y alfa 32 aplicado a las proyecciones de atencion `Wqkv`/`Wo` y a la proyeccion `Wo` del MLP en las 28 capas (4,39M de parametros), junto con la cabeza de decision (26,2M de parametros, inicializada desde la cabeza de Laya; su sub-cabeza de accion de 0,26M de parametros permanece congelada). La pregunta que responde es "Es esta direccion IP maliciosa?" y la salida es P(si).

System One recibe como evidencia la puntuacion del arbol, unos pocos campos de ingenieria legibles y los campos originales en formato JSON, y produce su propia probabilidad calibrada. La salida publicada es una mezcla logistica de la probabilidad de System One y la puntuacion del arbol, ajustada sobre el split de retencion de System One. La configuracion liberada se eligio despues de conocer los resultados de test: se publica System One en todos los conjuntos por uniformidad de la interfaz, y para este conjunto la mezcla como salida por defecto, ya que System One por si solo quedaba por detras de su arbol. Los pesos base de Laya no se redistribuyen: se descargan del Hub en la revision fijada y se verifican contra su sha256. Los intervalos de confianza del 95% se calcularon con bootstrap estratificado por clase con 1.000 remuestreos.

## Capacidades

- Clasificacion tabular binaria: decide si una direccion IPv4 es maliciosa y devuelve una probabilidad calibrada P(si).
- Deteccion de fraude y amenazas sobre datos estructurados: puntua direcciones IP a partir de caracteristicas de ingenieria y de la lista de bloqueo CINS Army (2022-06-07).
- Decision tipada sobre evidencia estructurada: System One lee la puntuacion previa del arbol y los campos originales como evidencia JSON antes de emitir su decision.
- Apilamiento de modelos heterogeneos: combina un modelo de arboles con un encoder neuronal mediante una mezcla logistica.
- Calibracion de probabilidades: la salida esta calibrada y se evalua con AUROC, recall a FPR fijo y average precision.
- Base para fine-tuning: puede servir como punto de partida para reentrenar sobre datos propios con otra distribucion.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en deteccion de fraude con el Fraud Dataset Benchmark: permite reproducir el split `ipblock` de FDB y comparar AUROC y recall a FPR fijo contra las lineas base publicadas, usando el cargador `load_split("ipblock")` y `predict_proba`.
- Referencia de implementacion de apilamiento: sirve para estudiar como integrar la puntuacion de un modelo de arboles como evidencia dentro de un modelo de decisiones tipadas, con ejemplos de calibracion y evaluacion estadistica.
- Analisis de listas de bloqueo en investigacion de seguridad: dada una lista de IP de una blocklist (por ejemplo, CINS Army), el modelo puntua cada una y ayuda a priorizar la revision manual segun la probabilidad de amenaza.
- Seleccion de umbral operativo: gracias a las curvas de recall a FPR del 0,1% y del 1%, permite fijar un umbral acorde a un presupuesto de falsos positivos en estudios de triaje.
- Punto de partida para fine-tuning sobre datos propios: el adaptador LoRA y la cabeza de decision se pueden reentrenar sobre un conjunto con distribucion distinta, siempre con validacion independiente.
- Evaluacion comparativa de arquitecturas para fraude tabular: permite medir si un encoder tipo ModernBERT con cabeza de decision aporta ventaja frente a un modelo de arboles puro en la misma tarea.
- Docencia y divulgacion sobre metricas de fraude: ilustra el uso de AUROC, recall a FPR bajo y average precision sobre un conjunto con fuerte desbalanceo (2.997 positivos de 43.000).

## Benchmarks y rendimiento

Split de test oficial de FDB (43.000 direcciones IP, 2.997 maliciosas), puntuado una vez por modelo. AUROC y recall a 1% de FPR segun la evaluacion de FDB (`np.interp(0.01, fpr, tpr)` sobre la ROC de test). Intervalos de confianza del 95% por bootstrap estratificado por clase con 1.000 remuestreos.

| Modelo | AUROC [IC 95%] | Recall a 1% FPR [IC 95%] | Average precision | Recall a 0,1% FPR |
|---|---|---|---|---|
| Este modelo: mezcla de System One y el arbol | 0,9481 [0,9441; 0,9520] | 55,7% [53,7; 57,8] | 0,7477 | 35,6% |
| System One solo | 0,9460 [0,9415; 0,9502] | 55,3% [53,1; 57,4] | 0,7463 | 35,3% |
| Arbol solo (entrada de System One) | 0,9481 [0,9441; 0,9520] | 55,6% [53,7; 57,8] | 0,7475 | 35,8% |
| Mejor AUROC publicado: AFD OFI | 0,937 | no disponible | no disponible | no disponible |
| Mejor recall a 1% FPR publicado: AFD OFI | no disponible | 46,6% | no disponible | no disponible |

El lider de AUROC procede del paper de FDB (arXiv 2208.14417 v3). El paper no reporta recall, por lo que el lider de recall se toma de la tabla de resultados del README de FDB en el commit `54cdefa211`. Con 2.997 IP maliciosas en el conjunto de test, cada una vale 0,033 puntos de recall. Cabe senalar que las lineas base publicadas datan de 2022, mientras que las caracteristicas ASN de este modelo usan una instantanea de 2026 de la tabla de enrutamiento de internet, que aquellas no podian tener.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio es de 0,1 GB para el adaptador y la cabeza, pero el encoder base Laya ModernBERT-large (~395M de parametros) se descarga por separado y domina el consumo.
- GPU de referencia: NVIDIA GB10 en una DGX Spark, con torch 2.11.0 y bfloat16. En esa configuracion el codigo reproduce las puntuaciones evaluadas bit a bit.
- CPU: con Apple M4 Max, macOS arm64 y float32, System One tarda aproximadamente 0,11 s por direccion IP, unas 1,4 h para las 43.000 filas del conjunto de test.
- Otras GPU y CPU dan puntuaciones ligeramente distintas a las de la referencia (ver la seccion de reproducibilidad de la model card).
- Entorno: Python 3.12 con las versiones fijadas en `requirements.txt`.
- Opciones de despliegue: el paquete `system_one_fraud` con `FraudPipeline.from_pretrained(".")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los unicos datos disponibles son los tiempos en CPU citados; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | AUROC (FDB ipblock) | Recall a 1% FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (System One + arbol) | Stack: GBT + encoder con cabeza de decision | 0,9481 | 55,7% | Apache-2.0 | HuggingFace |
| System One solo | Encoder ModernBERT-large con LoRA y cabeza de decision | 0,9460 | 55,3% | Apache-2.0 | Incluido en este repositorio |
| Arbol solo | Gradient boosting sobre caracteristicas de ingenieria | 0,9481 | 55,6% | Apache-2.0 | Incluido en este repositorio |
| AFD OFI (linea base publicada) | no disponible | 0,937 | 46,6% | no disponible | Resultados en el paper de FDB |

No se dispone de datos de parametros, longitud de contexto ni formato de pesos de las alternativas publicadas, salvo las cifras de rendimiento recogidas en el paper de FDB y su README.

## Limitaciones y advertencias

- Es un modelo de benchmark, no un sistema de produccion para bloquear trafico ni para atribuir una direccion a un actor concreto.
- No debe usarse para decisiones automatizadas sobre personas sin revision humana.
- Uso fuera de distribucion: sobre datos con otra distribucion exige reentrenamiento y validacion propios.
- Fuga temporal potencial: las caracteristicas ASN usan una instantanea de la tabla de enrutamiento de 2026, mientras que las lineas base publicadas datan de 2022, lo que puede favorecer la comparacion.
- Sesgo de seleccion de configuracion: la configuracion liberada (la mezcla) se eligio despues de conocer los resultados de test, lo que puede inflar ligeramente la cifra destacada.
- Riesgo de sobreajuste al split: cada conjunto de test se puntuo una sola vez por candidato, pero el proceso de seleccion no es ciego.
- Reproducibilidad dependiente del hardware: solo la GPU de referencia reproduce las puntuaciones bit a bit; otras GPU y CPU dan resultados ligeramente distintos.
- Idiomas y contexto: no hay informacion sobre soporte multilingue ni sobre longitud de contexto; la tarea opera sobre campos estructurados.
- Licencia: los pesos y el codigo son Apache-2.0, pero algunos ficheros de datos llevan sus propios terminos, que hay que revisar antes de uso comercial.
- Sesgos y alucinacion en el sentido generativo no aplican; el riesgo analogo es la clasificacion incorrecta (falsos positivos y falsos negativos) sobre IP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getSTEAV/system-one-fdb-ipblock
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Fraud Dataset Benchmark (FDB): https://github.com/amazon-science/fraud-dataset-benchmark
- Paper de FDB (arXiv 2208.14417): https://arxiv.org/abs/2208.14417
- Referencia arXiv 2412.13663: https://arxiv.org/abs/2412.13663
- Sitio del autor (STEAV): https://steav.io
