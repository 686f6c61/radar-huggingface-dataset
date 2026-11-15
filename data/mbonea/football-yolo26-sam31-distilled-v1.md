# Mbonea/football-yolo26-sam31-distilled-v1

## Resumen

El modelo `Mbonea/football-yolo26-sam31-distilled-v1` es un detector de objetos YOLO26s afinado para un caso muy concreto: la deteccion de cuatro clases en retransmisiones de futbol (jugador, arbitro, portero y balon). Lo desarrolla el usuario Mbonea y se presenta explicitamente como un piloto de investigacion sobre un unico partido, no como un modelo general de futbol. La relevancia no esta en su rendimiento absoluto sino en la metodologia: destilacion de pseudo-etiquetas generadas a partir de SAM3.1 (y verificadas con un YOLO26x independiente) sobre un modelo YOLO26s preentrenado.

El modelo parte de los pesos `yolo26s.pt` y se entrena sobre un dataset derivado de un unico partido de 720p (Simba-Yanga, video ID `yjKCusTGzVg`). El conjunto de entrenamiento contiene 357 imagenes construidas a partir de 119 fotogramas originales, con dos variantes de tono por fotograma. La validacion son 21 imagenes y el test 28. No hay separacion por partido: el mismo estadio y equipaciones aparecen en todos los splits, por lo que el rendimiento en partidos no vistos es desconocido.

La informacion disponible es la model card publicada por el autor, que incluye metricas de acuerdo con pseudo-etiquetas (no de precision con etiquetas humanas independientes). El autor advierte de forma explicita que la deteccion del balon es debil y que no debe usarse para sustituir un tracker de balon validado. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), deteccion de objetos en una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el autor distribuye checkpoint PyTorch nativo `best_weights.pt`) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch nativo (`.pt`) |
| Clases | 0 player, 1 referee, 2 goalkeeper, 3 ball |
| Entrada de inferencia | imagenes a `imgsz=640`, `conf=0.4` en el ejemplo del autor |
| Version de libreria | `ultralytics==8.4.213` |
| Entorno de entrenamiento | Torch 2.8.0, NumPy 1.26.4 |

## Arquitectura y entrenamiento

La arquitectura es la del detector YOLO26s de Ultralytics, un detector de objetos en una sola etapa. No hay innovaciones arquitectonicas propias: el autor parte de los pesos preentrenados `yolo26s.pt` y realiza un ajuste fino supervisado con pseudo-etiquetas. Las etiquetas se derivan de mascaras de SAM3.1, filtradas con criterios de componente conectado mayor, tamano temporal, geometria, supresion de duplicados y cuarentena de fotogramas defectuosos. Un YOLO26x independiente de futbol se usa para verificar etiquetas y anadir personas de alta confianza que SAM no detecto; cuando SAM marca un jugador o arbitro razonable que YOLO no detecta, se conserva la etiqueta de SAM. Tambien hay cribado por IA de hojas de contacto y recortes de rol/balon para eliminar ejemplos de logotipos, repeticiones y deriva de porteros. El autor aclara que no es anotacion humana exhaustiva.

El entrenamiento se ejecuto en un perfil de Modal con una NVIDIA A10, entrada de 640, batch 16, optimizador AdamW con `lr0=.001`, schedule coseno, semilla 61 y warmup de 3. Se fijo un maximo de 60 epocas y se detuvo en la 34 con paciencia 12, conservando el mejor checkpoint de validacion. Las augmentaciones fueron conservadoras: HSV, brillo, traslacion/escala y flips horizontales, sin mosaic ni mixup. Los datos provienen de un unico partido de 720p; los fotogramas de entrenamiento corresponden a los tiros 17/35/40/60, la validacion al tiro 36 y el test al tiro 9, sin division aleatoria de fotogramas adyacentes. Las etiquetas de balon en entrenamiento usan acuerdo espacial entre SAM y YOLO, y diez balones de test usan mascaras de cesped limpias guardadas de SAM3.1.

## Capacidades

- Deteccion de cuatro clases en imagenes de futbol: jugador, arbitro, portero y balon.
- Deteccion de objetos por fotograma individual, sin modelado temporal ni identidad.
- Inferencia via Ultralytics con `model.predict("frame.jpg", imgsz=640, conf=0.4)`.
- Carga de pesos mediante `hf_hub_download` desde Hugging Face.
- Salida compatible con el ecosistema Ultralytics (cajas, clases y confianzas).
- No soporta tool calling, function calling ni agentes.
- No soporta razonamiento multi-paso ni modo thinking.
- No tiene capacidades de vision-lenguaje, audio ni generacion de texto.
- Capacidad multilingue: no aplica; las etiquetas estan en ingles.
- No aprende tracker ni identidad temporal (el autor lo indica explicitamente).

## Casos de uso

- Prototipado de pipelines de analitica de futbol: usar el modelo como primer detector de jugadores y arbitros en fotogramas de un partido concreto para validar una arquitectura de analisis antes de invertir en anotacion humana. Es adecuado por su bajo coste de inferencia (8.5 ms de inferencia neuronal por imagen segun el evaluador batcheado de Ultralytics) y su integracion directa con Ultralytics.
- Generacion de pseudo-etiquetas para un dataset mayor: el modelo puede pre-anotar fotogramas de partidos similares (mismo estadio y equipaciones) y pasar esas etiquetas por revision humana, reduciendo el coste inicial de anotacion. Solo es razonable dentro del dominio del partido de origen.
- Experimentos de destilacion de SAM3.1 a un detector ligero: sirve como referencia metodologica para replicar el flujo SAM3.1 -> filtros -> YOLO26x de verificacion -> YOLO26s, documentado en la model card y en los ficheros de configuracion incluidos.
- Deteccion de jugadores y arbitros en imagenes fijas de un partido concreto para tareas de catalogacion o indexacion offline, aceptando la limitacion de que no hay identidad ni tracking.
- Evaluacion comparativa de detectores en un dominio acotado: util para medir el acuerdo con pseudo-etiquetas de SAM3.1 frente a otros detectores en el mismo conjunto de test de 28 imagenes.
- Docencia y formacion en vision por computador: ejemplo realista de un pipeline de pseudo-etiquetado con validacion cruzada entre modelos y de las trampas de medir con pseudo-etiquetas en lugar de etiquetas humanas.
- No es adecuado para su uso como tracker de balon en produccion, para arbitraje automatico ni para analisis de partidos no vistos, segun las propias advertencias del autor.

## Benchmarks y rendimiento

El autor publica metricas de acuerdo con pseudo-etiquetas en el conjunto de test (28 imagenes, 474 etiquetas, solo 10 de balon). El propio autor advierte que no son precision con etiquetas humanas independientes ni benchmarks entre partidos.

| Clase | AP50 | AP50:95 |
|---|---:|---:|
| player | 0.930 | 0.732 |
| referee | 0.823 | 0.580 |
| goalkeeper | 0.653 | 0.509 |
| ball | 0.0636 | 0.0140 |
| overall | 0.617 | 0.459 |

Datos de rendimiento adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Throughput en prediccion de imagen individual | 64.01 FPS (incluye pre/postproceso, excluye decodificacion/renderizado; muestra de 25 imagenes en A10) |
| Inferencia neuronal por imagen (evaluador batcheado de Ultralytics) | 8.5 ms |
| VRAM pico asignada por PyTorch | 5.32 GB (incluye entrenamiento/evaluacion, no reserva total de GPU) |

No se han publicado resultados de benchmarks estandar (COCO, MOT, HOTA, IDF1) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma aislada. El unico dato es el pico de 5.32 GB asignado por PyTorch durante entrenamiento y evaluacion en una A10, que incluye fases que no son inferencia pura.
- GPU de entrenamiento usada: NVIDIA A10 (perfil de Modal).
- GPU recomendadas: no hay recomendaciones del autor. Por el tamano del modelo (YOLO26s) y los 8.5 ms de inferencia neuronal por imagen en A10, es plausible que quepa en GPUs de consumo, pero no hay dato publicado que lo confirme.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: Ultralytics (`ultralytics==8.4.213`) con checkpoint PyTorch nativo. No se mencionan exportaciones a ONNX, TensorRT, OpenVINO ni otros formatos.
- Latencia y throughput: 64.01 FPS en prediccion de imagen individual en A10 (muestra corta de 25 imagenes, no FPS de pipeline de video completo); 8.5 ms de inferencia neuronal por imagen segun el evaluador batcheado.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de futbol evaluados sobre el mismo conjunto de test ni de comparaciones publicadas por el autor. La model card menciona un YOLO26x independiente de futbol usado para verificar etiquetas, pero no aporta sus metricas ni su identificador. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| football-yolo26-sam31-distilled-v1 | no disponible | no aplica | AP50 overall 0.617 (pseudo-etiquetas) | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset muy pequeno y ruidoso de un unico partido: 357 imagenes de entrenamiento, 21 de validacion y 28 de test.
- Fuerte desbalanceo de clases; las etiquetas de portero son escasas y la validacion no tiene etiquetas confirmadas de portero, por lo que la seleccion del mejor checkpoint no puede medir la calidad de esa clase.
- El mismo estadio y las mismas equipaciones aparecen en todos los splits; el rendimiento en partidos no vistos es desconocido.
- La recoloreacion de tono no demuestra generalizacion a equipaciones no vistas.
- El modelo no aprende identidad temporal ni tracker; no hay HOTA ni IDF1.
- La deteccion del balon es muy debil (AP50 0.0636, AP50:95 0.0140) y el autor pide tratarla con especial cautela y no usarla para sustituir un tracker de balon validado.
- Las metricas publicadas son acuerdo con pseudo-etiquetas, no precision con etiquetas humanas independientes; pueden estar sesgadas por los errores de SAM3.1 y del YOLO26x verificador.
- La iluminacion y los puntos de vista estan limitados al partido de origen; las repeticiones y acciones casi duplicadas pueden reducir la independencia del test pese a la separacion por tiros.
- La anotacion no es humana exhaustiva: pueden quedar etiquetas omitidas e incorrectas.
- Licencia AGPL-3.0 para el modelo y el codigo de Ultralytics; el uso comercial queda sujeto a las obligaciones de esa licencia.
- Los derechos de las imagenes originales y los terminos de SAM/Tactix no quedan sustituidos por la model card; el dataset permanece privado y el autor no reclama licencia sobre la retransmision fuente.
- Riesgo de alucinacion: no aplica en sentido estricto (es un detector), pero si hay riesgo de falsos positivos y falsos negativos, especialmente en balon y portero.
- El autor indica que se carguen solo artefactos de confianza, dado que el checkpoint es un `.pt` de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mbonea/football-yolo26-sam31-distilled-v1
- Dataset privado de destilacion (accesible solo al propietario de la cuenta): https://huggingface.co/datasets/Mbonea/football-sam31-distillation-v1
- Ultralytics (libreria y framework): https://github.com/ultralytics/ultralytics
- SAM (Segment Anything Model, origen de las mascaras del profesor): no disponible enlace concreto en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible
