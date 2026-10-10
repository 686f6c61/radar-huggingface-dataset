# getSTEAV/system-one-fdb-sparknov

## Resumen

System One FDB Sparknov es un clasificador binario apilado para deteccion de fraude en transacciones de tarjeta de credito, desarrollado por STEAV (steav.io) y entrenado con CID Model Studio. Combina dos etapas: un modelo de arboles con gradient boosting que puntua cada transaccion a partir de caracteristicas de ingenieria, y encima un modelo de decision tipada llamado System One que lee esa puntuacion, unos pocos campos legibles y los campos originales en JSON, y devuelve una probabilidad calibrada de fraude. System One se construye sobre el encoder ModernBERT-large de Laya (convaiinnovations/laya, unos 395M de parametros) mediante un adaptador LoRA y una cabeza de decision.

El modelo se entreno especificamente para el Fraud Dataset Benchmark (FDB) de Amazon Science y se publica como modelo de referencia, no como sistema de produccion. Sobre el split de test oficial de FDB (20.000 transacciones, 93 fraudulentas) alcanza 0.9994 de AUROC y captura el 97,9% del fraude a una tasa de falsos positivos del 1%, frente al mejor AUROC publicado de 0.998 (AFD OFI). El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache-2.0.

Su relevancia actual es doble: por un lado sirve como implementacion de referencia de stacking de un modelo de decision tipada sobre un modelo de arboles; por otro, permite reproducir y comparar resultados en FDB con una interfaz de decision calibrada y uniforme. El autor advierte explicitamente de que no debe usarse para puntuar transacciones reales ni para decisiones automatizadas sobre personas sin revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador binario apilado: gradient-boosted trees y, encima, System One (encoder ModernBERT-large con cabeza de decision tipada y LoRA) |
| Parametros totales | No disponible como cifra unica; base Laya ModernBERT-large de aproximadamente 395M de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para pesos y codigo; algunos ficheros de datos tienen sus propios terminos |
| Formato de pesos | Safetensors (adaptador LoRA, cabeza de decision y modelo de arboles; los pesos base de Laya se descargan del Hub, no se redistribuyen) |

## Arquitectura y entrenamiento

El sistema es un stack de dos etapas. La primera es un modelo de arboles con gradient boosting que produce una puntuacion a partir de caracteristicas de ingenieria. La segunda es System One, un modelo de decision tipada que recibe esa puntuacion, unos pocos campos legibles y los campos originales en JSON como evidencia, y devuelve una probabilidad calibrada. La integracion se hace con offset stacking: System One anade una correccion aprendida a las log-odds del arbol.

System One parte de convaiinnovations/laya en la revision 7b928d828b7b (Apache-2.0), un encoder ModernBERT-large de unos 395M de parametros con la cabeza de decision tipada de Laya. Los parametros entrenados son un adaptador LoRA (rango 16, alpha 32, sobre las proyecciones de atencion Wqkv/Wo y la proyeccion Wo del MLP en las 28 capas; 4,39M de parametros) y la cabeza de decision (26,2M de parametros, inicializada desde la cabeza de Laya, con una sub-cabeza de accion de 0,26M de parametros que permanece congelada). La pregunta que resuelve el modelo es "Es fraudulenta esta transaccion de tarjeta, es decir, no la realizo el titular legitimo?" y la salida es P(si). El autor indica que los modelos se entrenaron y calibraron sin usar datos de test y que cada conjunto de test se puntuo una sola vez por candidato, aunque reconoce que elegir entre candidatos despues de ver los resultados puede inflar ligeramente las metricas principales, por lo que la tabla publica todos los candidatos. La version publicada es la 1.0.0.

## Capacidades

- Clasificacion binaria de transacciones de tarjeta: devuelve, por fila, la probabilidad de que la transaccion sea fraudulenta (`predict_proba`).
- Decision tipada: la cabeza de System One produce una decision si/no con probabilidad asociada, integrada en un pipeline con offset stacking sobre la puntuacion del arbol.
- Procesamiento de evidencia heterogenea: acepta la puntuacion del arbol, campos de ingenieria legibles y los campos originales en JSON.
- Salida calibrada: la probabilidad se reajusta desde la muestra de entrenamiento rebalanceada hasta la tasa natural de fraude de los datos de entrenamiento de FDB (0,579%), sin alterar el orden.
- Salida de la etapa intermedia: la opcion `output="tree"` devuelve la puntuacion del modelo de arboles.
- Reproducibilidad bit a bit en la GPU de referencia (NVIDIA GB10 en DGX Spark, torch 2.11.0, bfloat16); otros entornos producen puntuaciones ligeramente distintas.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes; el modelo es especificamente un clasificador tabular de fraude.

## Casos de uso

- Investigacion en benchmark de fraude: reproducir los resultados de FDB sobre el split oficial de Sparkov y comparar con las lineas base publicadas (AFD OFI y otras) usando AUROC, recall a 1% FPR y average precision.
- Referencia de stacking arbol-mas-transformer: servir como implementacion de patron para combinar un gradient-boosting con un modelo de decision tipada mediante offset stacking, reutilizable en otros dominios tabulares.
- Punto de partida para fine-tuning propio: dado que solo se entrenan adaptador LoRA y cabeza de decision, es una base practica para adaptar el sistema a un conjunto de datos de fraude propio con coste de entrenamiento reducido.
- Auditoria de decision tipada: analizar como la cabeza de decision corrige la puntuacion del arbol y como se calibra la probabilidad final, util para investigar interfaces de decision calibradas.
- Evaluacion de robustez cross-distribution: usar el modelo como linea base para medir la degradacion al aplicarlo a datos de otra distribucion, siempre con reentrenamiento y validacion previos.
- Estudio de metricas a baja tasa de falsos positivos: emplear los resultados a 0,1% de FPR y a 1% de FPR para analizar el comportamiento del modelo en regimenes operativos estrictos propios del fraude.
- Prototipado offline sobre datos publicos: ejecutar el pipeline sobre el split de Sparkov en CPU (0,14 s por transaccion, unas 0,8 h para las 20.000 filas del test) para validaciones y demos sin GPU.
- No se contempla su uso en produccion ni para decisiones automaticas sobre personas sin revision humana.

## Benchmarks y rendimiento

Split de test oficial de FDB (20.000 transacciones, 93 fraudulentas), puntuado una vez por modelo. AUROC y recall a 1% de FPR segun la evaluacion de FDB (el recall es `np.interp(0.01, fpr, tpr)` sobre la ROC de test). Intervalos de confianza al 95% por bootstrap estratificado por clase con 1.000 remuestreos.

| Modelo | AUROC [IC 95%] | Recall a 1% FPR [IC 95%] | Average precision | Recall a 0,1% FPR |
|---|---|---|---|---|
| System One (este modelo) | 0.9994 [0.9989, 0.9999] | 97.9% [94.6, 100.0] | 0.9494 | 90.3% |
| Arbol solo (entrada de System One) | 0.9994 [0.9988, 0.9999] | 97.9% [94.6, 100.0] | 0.9498 | 91.4% |
| Blend ajustado en el split de validacion de System One (no publicado) | 0.9994 [0.9988, 0.9999] | 97.9% [94.6, 100.0] | 0.9496 | 91.4% |
| Mejor AUROC publicado: AFD OFI | 0.998 | | | |
| Mejor recall publicado a 1% FPR: AFD OFI | | 100.0% | | |

Los lideres de AUROC proceden del articulo de FDB (arXiv 2208.14417 v3). El articulo no reporta recall, por lo que los lideres de recall proceden de la tabla de resultados del README de FDB en el commit `54cdefa211`; versiones posteriores mantienen esa tabla dentro de un comentario HTML y ya no la muestran. Con 93 transacciones fraudulentas en el test, cada una equivale a 1,1 puntos de recall.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa aproximadamente 0,1 GB y el stack incluye base Laya ModernBERT-large (unos 395M de parametros), adaptador LoRA (4,39M) y cabeza de decision (26,2M), por lo que la carga en memoria es del orden de pocos gigabytes en bfloat16 o float32.
- GPU de referencia: NVIDIA GB10 en un DGX Spark con torch 2.11.0 y bfloat16, donde el codigo reproduce las puntuaciones evaluadas bit a bit.
- Otras GPU: no documentadas; el autor advierte de que otras GPU y CPU producen puntuaciones ligeramente distintas.
- CPU: probado en Apple M4 Max con macOS arm64 y float32, con aproximadamente 0,14 s por transaccion, es decir, unas 0,8 h para las 20.000 filas del test.
- Cabe en GPU de consumo: no confirmado en la informacion disponible, aunque el tamano del stack sugiere que podria caber en GPU de consumo modernas; no se aportan cifras verificadas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El uso previsto es mediante la libreria `laya` y el paquete `system_one_fraud` del propio repositorio, con Python 3.12 y versiones fijadas en `requirements.txt`.
- Latencia y throughput: medidos solo en CPU (0,14 s por transaccion en Apple M4 Max); no se publican cifras de latencia ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC (FDB Sparknov) | Recall a 1% FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| System One FDB Sparknov | Stack: arbol + ModernBERT-large (aprox. 395M) con LoRA (4,39M) y cabeza (26,2M) | No disponible | 0.9994 | 97.9% | Apache-2.0 | HuggingFace (getSTEAV/system-one-fdb-sparknov) |
| AFD OFI (referencia publicada) | No disponible | No disponible | 0.998 | 100.0% | No disponible | Resultados publicados en FDB |
| Arbol solo (entrada de System One) | No disponible | No disponible | 0.9994 | 97.9% | No disponible | No publicado de forma independiente |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria mas alla de las cifras publicadas en el benchmark FDB.

## Limitaciones y advertencias

- No apto para produccion: el propio autor lo define como modelo de benchmark y prohibe su uso para puntuar transacciones reales de tarjeta.
- Uso fuera de alcance: no debe emplearse para decisiones automatizadas sobre personas sin revision humana, ni sobre datos de otra distribucion sin reentrenamiento y validacion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la cabeza de decision puede producir probabilidades mal calibradas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados explicitamente; al entrenarse sobre el conjunto Sparkov de FDB, hereda los sesgos de ese dataset simulado, que no representa necesariamente el fraude real.
- Limitaciones de idioma: no se declaran idiomas soportados ni capacidad multilingue; el modelo opera sobre campos tabulares y JSON, no sobre texto libre multilingue.
- Limitaciones de contexto: no se especifica longitud de contexto; el uso es por fila, no conversacional.
- Seleccion de configuracion post-hoc: el modelo publicado es el que empato al arbol y al blend en las metricas principales tras conocer los resultados de test, lo que el propio autor reconoce que puede inflar ligeramente las cifras.
- Metricas con pocos positivos: con solo 93 transacciones fraudulentas en el test, cada positivo equivale a 1,1 puntos de recall y los intervalos de confianza son amplios.
- Restricciones de licencia: los pesos y el codigo son Apache-2.0, pero algunos ficheros de datos del repositorio tienen sus propios terminos.
- Reproducibilidad dependiente del hardware: solo la GPU de referencia reproduce las puntuaciones bit a bit; otras GPU y CPU producen valores ligeramente distintos.
- Dependencia de credenciales externas: el cargador `load_split("sparknov")` de FDB requiere credenciales de la API de Kaggle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getSTEAV/system-one-fdb-sparknov
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Fraud Dataset Benchmark (codigo): https://github.com/amazon-science/fraud-dataset-benchmark
- Articulo de FDB: https://arxiv.org/abs/2208.14417
- Referencia arXiv 2412.13663: https://arxiv.org/abs/2412.13663
- Sitio del autor: https://steav.io
