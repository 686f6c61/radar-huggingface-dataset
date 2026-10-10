# getSTEAV/system-one-fdb-ccfraud

## Resumen

System One FDB ccfraud es un clasificador binario apilado para deteccion de fraude en tarjetas de credito, desarrollado por STEAV (steav.io) con CID Model Studio. El sistema combina dos etapas: un modelo de arboles con boosting por gradiente que puntua cada transaccion a partir de caracteristicas de ingenieria, y System One, un modelo de decisiones tipadas construido sobre un codificador ModernBERT-large (Laya, convaiinnovations/laya, unos 395M de parametros) con un adaptador LoRA y una cabeza de decision. System One lee la puntuacion del arbol, algunos campos legibles y los campos originales que caben en su ventana de tokens en formato JSON, y devuelve una probabilidad calibrada de que la transaccion sea fraudulenta. La salida publicada es una mezcla logistica de la probabilidad de System One y la puntuacion del arbol.

El modelo se entreno especificamente para el Fraud Dataset Benchmark (FDB) de Amazon Science y se evalua sobre el conjunto de prueba oficial de Credit Card Fraud Detection (ULB / Worldline, 2013), compuesto por 56.962 transacciones de las que 75 son fraudulentas. Alcanza un AUROC de 0,9867 y captura el 86,7% del fraude a una tasa de falsos positivos del 1%, frente al mejor AUROC publicado (0,992, H2O) y el mejor recall publicado (88,0%, empate a tres entre AFD OFI, AFD TFI y AutoGluon).

Su relevancia es metodologica: es una implementacion de referencia de como apilar un modelo de decisiones tipadas sobre un modelo de arboles y de como presentar una evaluacion honesta con intervalos de confianza. El propio autor advierte que es un modelo de benchmark, no un sistema de produccion. El repositorio ocupa 0,1 GB porque solo redistribuye el adaptador y la cabeza, no los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador binario apilado: arboles con boosting por gradiente + System One (codificador ModernBERT-large con cabeza de decision tipada) + mezcla logistica final |
| Parametros totales | Base Laya ModernBERT-large ~395M; adaptador LoRA 4,39M; cabeza de decision 26,2M (la sub-cabeza de accion de 0,26M permanece congelada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; limitada por la ventana de tokens de System One (Laya ModernBERT-large) |
| Tipos de cuantizacion | No disponible; se publican pesos en safetensors sin variantes cuantizadas listadas |
| Idiomas soportados | No disponible; la tarea es clasificacion tabular/JSON, no multilingue |
| Licencia | Apache-2.0 (pesos y codigo); algunos ficheros de datos tienen sus propios terminos |
| Formato de pesos | safetensors (adaptador LoRA + cabeza de decision); los pesos base se descargan del Hub en la revision fijada 7b928d828b7b |

## Arquitectura y entrenamiento

El sistema es un apilado de dos etapas con mezcla final. La primera etapa es un modelo de arboles con boosting por gradiente que produce una puntuacion a partir de caracteristicas de ingenieria. La segunda etapa es System One: un codificador ModernBERT-large de unos 395M de parametros con la cabeza de decision tipada de Laya, que recibe como evidencia JSON la puntuacion del arbol, unos pocos campos legibles y los campos originales que quepan en su ventana de tokens. System One utiliza apilado con offset, es decir, anade una correccion aprendida a las log-odds del arbol. La salida final publicada es una mezcla logistica de ambas probabilidades, ajustada sobre la particion de retencion de System One.

El ajuste fino se realizo mediante LoRA de rango 16 y alpha 32 sobre las proyecciones de atencion `Wqkv` y `Wo` y la proyeccion `Wo` del MLP de las 28 capas, lo que supone 4,39M de parametros entrenables, mas la cabeza de decision de 26,2M de parametros inicializada desde la cabeza de Laya. La pregunta formulada al modelo es binaria: si la transaccion es fraudulenta porque no la realizo el titular legitimo, devolviendo P(si). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen en FDB y ULB/Worldline. La mezcla final asigna un peso negativo a System One, de modo que la salida publicada sigue mayoritariamente al arbol y deshace parcialmente la correccion de System One.

## Capacidades

- Clasificacion binaria de fraude: devuelve una probabilidad calibrada P(fraude) para cada transaccion de tarjeta.
- Clasificacion tabular: opera sobre caracteristicas de ingenieria y campos de la transaccion en formato JSON.
- Apilado con modelo de arboles: consume la puntuacion de un modelo de boosting por gradiente como evidencia adicional.
- Decisiones tipadas: usa la cabeza de decision tipada de Laya para producir la salida de decision.
- Correccion con offset: anade una correccion aprendida a las log-odds del modelo de arboles subyacente.
- Ajuste eficiente con LoRA: el adaptador permite reentrenamiento ligero sobre datos propios.
- Punto de partida para fine-tuning: disenado como base para ajustar en conjuntos de datos de fraude propios.
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre; esta especializado en una unica tarea de clasificacion.

## Casos de uso

- Evaluacion comparativa en FDB: usar el modelo como referencia reproducible en el Fraud Dataset Benchmark para comparar arquitecturas de apilado frente a los lideres publicados (H2O, AFD OFI, AFD TFI, AutoGluon).
- Investigacion en apilado de modelos: estudiar como un modelo de decisiones tipadas corrige la puntuacion de un modelo de arboles mediante offset stacking y como se calibra la mezcla final.
- Base para fine-tuning en datos propios: partir del adaptador LoRA y la cabeza de decision para ajustar el sistema a una cartera de transacciones concreta, reentrenando solo 4,39M de parametros del adaptador.
- Prototipado de un sistema de scoring de fraude: integrar la salida calibrada en un pipeline de scoring con umbral configurable para estimar el equilibrio entre falsos positivos y recall.
- Analisis de interpretabilidad operativa: inspeccionar la evidencia JSON que consume System One para entender que campos contribuyen a la decision.
- Validacion de metodologia de evaluacion: reutilizar el esquema de intervalos de confianza por bootstrap estratificado por clase (1.000 remuestreos) para reportar metricas con incertidumbre en conjuntos con muy pocos positivos.
- Docencia y demostracion: ejemplo didactico de un sistema de dos etapas con clasificador tabular y mezcla logistica final, ejecutable en CPU en tiempos manejables.

## Benchmarks y rendimiento

Resultados sobre la particion de prueba oficial de FDB, puntuada una sola vez por modelo. Recall a 1% de FPR segun la evaluacion propia de FDB. Los intervalos de confianza al 95% se obtuvieron por bootstrap estratificado por clase con 1.000 remuestreos.

| Modelo | AUROC [IC 95%] | Recall a 1% FPR [IC 95%] | Average precision | Recall a 0,1% FPR |
|---|---|---|---|---|
| Mezcla de System One y el arbol (este modelo) | 0,9867 [0,9748; 0,9961] | 86,7% [78,7; 93,3] | 0,8079 | 80,0% |
| System One en solitario | 0,9855 [0,9717; 0,9961] | 85,3% [77,3; 93,3] | 0,8075 | 80,0% |
| Arbol en solitario (entrada de System One) | 0,9866 [0,9747; 0,9961] | 86,7% [77,3; 93,3] | 0,8070 | 80,0% |
| Mejor AUROC publicado: H2O | 0,992 | No reportado | No reportado | No reportado |
| Mejor recall publicado a 1% FPR: AFD OFI, AFD TFI y AutoGluon (empate a tres) | No reportado | 88,0% | No reportado | No reportado |

Los lideres de AUROC proceden del articulo de FDB (arXiv 2208.14417 v3). El articulo no reporta recall, por lo que los lideres de recall proceden de la tabla de resultados del README de FDB en el commit `54cdefa211`. Con 75 transacciones fraudulentas en el conjunto de prueba, cada una equivale a 1,3 puntos de recall. La ventaja de la mezcla sobre System One en solitario (un fraude mas detectado, +0,001 de AUROC) queda dentro del ruido segun los intervalos emparejados al 95% (AUROC de -0,0003 a +0,0031; recall de 0 a +4,0 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bfloat16 o float16 ronda los 0,85 GB (base ModernBERT-large ~395M de parametros, cabeza de 26,2M y adaptador de 4,39M); en float32 se aproxima a 1,7 GB. Estimacion aritmetica a partir del recuento de parametros, no un dato publicado.
- GPU de referencia: NVIDIA GB10 en un DGX Spark, con torch 2.11.0 y bfloat16, reproduce las puntuaciones evaluadas bit a bit.
- Otras GPU: segun el autor, otras GPU y CPU producen puntuaciones ligeramente distintas a las de la GPU de referencia.
- Compatibilidad con GPU de consumo: si cabe en cualquier GPU de consumo con al menos 4-8 GB de VRAM, dado el reducido tamano del modelo; no se especifica un modelo concreto en la informacion disponible.
- CPU: en un Apple M4 Max con macOS arm64 y float32, System One tarda unos 0,12 s por transaccion, aproximadamente 1,9 h para las 56.962 filas del conjunto de prueba.
- Opciones de despliegue: la model card indica Python 3.12 con versiones fijadas en `requirements.txt` y la libreria `laya`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se documenta la cifra de CPU indicada; no hay datos de throughput en GPU mas alla de la reproducibilidad bit a bit.

## Comparativa con modelos similares

| Modelo | Tipo | AUROC | Recall a 1% FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mezcla de System One y el arbol (este modelo) | Apilado de arboles + ModernBERT-large con LoRA | 0,9867 | 86,7% | Apache-2.0 | Pesos del adaptador y la cabeza en el Hub; base descargada aparte |
| System One en solitario | Modelo de decisiones tipadas sobre Laya ModernBERT-large | 0,9855 | 85,3% | Apache-2.0 | Incluido en este repositorio |
| H2O | No disponible en la informacion proporcionada | 0,992 | No reportado | No disponible | Baseline publicado de FDB |
| AFD OFI / AFD TFI | Autoencoder de denoising con caracteristicas de fraude | No reportado | 88,0% | No disponible | Baseline publicado de FDB |
| AutoGluon | AutoML tabular | No reportado | 88,0% | No disponible | Baseline publicado de FDB |

Los baselines publicados se citan tal como aparecen en la model card y en el articulo de FDB; no se detallan sus parametros, contexto ni licencia en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo de benchmark, no un sistema de produccion de fraude; el propio autor recomienda leer la seccion de limitaciones antes de usarlo.
- Fuera de alcance: rechazar transacciones de titulares reales, tomar decisiones automatizadas sobre personas sin revision humana y aplicarlo a datos de otra distribucion sin reentrenamiento y validacion.
- La mezcla publicada asigna un peso negativo a System One, por lo que la salida final sigue mayoritariamente al arbol y deshace parte de la correccion del modelo neuronal.
- La configuracion publicada se eligio despues de conocer los resultados de prueba, lo que puede inflar ligeramente la metrica principal; la model card muestra todos los candidatos para mitigarlo.
- La ventaja de la mezcla sobre System One en solitario esta dentro del ruido estadistico segun los intervalos emparejados al 95%.
- El conjunto de prueba solo contiene 75 transacciones fraudulentas, de modo que cada fraude vale 1,3 puntos de recall y la incertidumbre es alta.
- Los intervalos de confianza de la mezcla y de System One se solapan ampliamente con los de los lideres publicados, por lo que la diferencia de AUROC y recall no es concluyente.
- La reproducibilidad bit a bit solo esta garantizada en la GPU de referencia (NVIDIA GB10, torch 2.11.0, bfloat16); otras GPU y CPU dan puntuaciones ligeramente distintas.
- Licencia Apache-2.0 para pesos y codigo, pero algunos ficheros de datos incluidos tienen sus propios terminos, que hay que revisar por separado.
- No se especifica la longitud de contexto efectiva ni los idiomas soportados; la tarea es de clasificacion tabular, no de lenguaje natural general.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de calibracion incorrecta fuera de la distribucion de entrenamiento.
- Sesgos potenciales del conjunto de datos ULB/Worldline (2013) pueden trasladarse al modelo; no se documentan analisis de sesgo en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getSTEAV/system-one-fdb-ccfraud
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Revision fijada del modelo base: 7b928d828b7b
- Fraud Dataset Benchmark (repositorio): https://github.com/amazon-science/fraud-dataset-benchmark
- Articulo de FDB: https://arxiv.org/abs/2208.14417
- Articulo asociado a Laya: https://arxiv.org/abs/2412.13663
- Sitio del autor: https://steav.io
- Los resultados de la busqueda web no aportan enlaces relevantes al modelo; las coincidencias encontradas corresponden a aplicaciones bancarias sin relacion con esta ficha.
