# Paulyang5049/tennis-ball-yolo26s-experimental-v0.2.0

## Resumen

El modelo Paulyang5049/tennis-ball-yolo26s-experimental-v0.2.0 es un checkpoint de deteccion de objetos de una unica clase, la pelota de tenis, basado en la arquitectura Ultralytics YOLO26s. Lo publica el autor Paulyang5049 como artefacto de reproducibilidad y analisis de fallos asociado a la version 0.2.0 de su proyecto Tennis AI Local. Se trata de un modelo de vision por computador puro: no es un modelo generativo, no procesa lenguaje y no dispone de ventana de contexto en el sentido habitual de los LLM.

Su relevancia es fundamentalmente metodologica. El propio autor documenta que el candidato no supero la puerta de promocion sobre el conjunto de test intacto: con confianza 0,1 e IoU 0,5 obtuvo 0 verdaderos positivos, 34 falsos positivos y 50 falsos negativos, frente a los 2 verdaderos positivos, 21 falsos positivos y 48 falsos negativos del baseline COCO sports-ball sobre la misma particion. Es, por tanto, un ejemplo util de publicacion de resultados negativos y de trazabilidad de experimentos, no un detector listo para produccion.

El entrenamiento se realizo sobre la version 6 del dataset Tennis Ball Detection de Viren Dhanwani, con 468 imagenes de entrenamiento, 60 de validacion y 50 de test, a una resolucion de entrada de 1280 px. El mejor checkpoint corresponde a la epoca 23, con parada temprana en la epoca 43, y un tiempo de entrenamiento de 0,527 horas en una NVIDIA Tesla T4. La validacion de Ultralytics reporto precision 0,187, recall 0,200, mAP50 0,0616 y mAP50-95 0,0123.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO26s (detector de objetos de una sola clase) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en precision original) |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 (checkpoint); dataset original bajo CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (serializacion PyTorch), fichero `weights.pt` |
| Clases | 1: `tennis ball` (clase 0) |
| Resolucion de entrada en entrenamiento | 1280 px |
| Tamano del repositorio | 0,1 GB |
| Hash SHA-256 de los pesos | `7fc1e1cd507381e7b100043012d9db7805a59726f16cf1827a6c436b7fd22c97` |
| Libreria de inferencia | Ultralytics 8.4.140 (PyTorch 2.14.0, Python 3.13.15, NumPy 2.4.6) |

## Arquitectura y entrenamiento

La arquitectura es Ultralytics YOLO26s, un detector de objetos de la familia YOLO en su variante "s" (small), configurado para una unica clase de deteccion denominada `tennis ball`. El modelo card no detalla el numero de capas, el backbone concreto ni el numero de parametros, por lo que esos datos quedan como no disponibles. El checkpoint se entreno con la pila Ultralytics 8.4.140 sobre PyTorch 2.14.0, con un tamano de imagen de entrada de 1280 px.

El ajuste fino se realizo sobre la version 6 del dataset Tennis Ball Detection de Viren Dhanwani (CC BY 4.0), con una particion auditada de 468 imagenes de entrenamiento, 60 de validacion y 50 de test. El autor indica que no se encontraron duplicados exactos de pixeles decodificados, pero que las identidades de los videos de origen y los posibles casi-duplicados no se verificaron, de modo que no se puede afirmar independencia a nivel de partido. El mejor checkpoint se alcanzo en la epoca 23, con parada temprana en la epoca 43, y el entrenamiento completo duro 0,527 horas en una NVIDIA Tesla T4. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de objetos de una unica clase: localiza y clasifica pelotas de tenis en imagenes, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Inferencia sobre imagenes individuales mediante la API de Ultralytics (`model.predict`), configurable en resolucion de entrada, umbral de confianza y umbral de IoU.
- Entrenamiento y validacion reproducibles con la libreria Ultralytics, lo que permite reentrenar y repetir la evaluacion.
- Integracion con `huggingface_hub` para la descarga programatica del checkpoint.
- Analisis de fallos: el modelo esta documentado explicitamente como artefacto de analisis de fallos, con particiones de test y metricas publicadas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision multimodal, audio ni modo de pensamiento.

## Casos de uso

- Analisis de fallos en deteccion de pelotas de tenis: sirve como caso documentado de un checkpoint que no supera su puerta de promocion, con metricas de test y baseline comparativo publicadas, para estudiar que condiciones (desenfoque de movimiento, oclusion, pelotas pequenas y lejanas) degradan la deteccion.
- Reproducibilidad de experimentos: el repositorio incluye la version exacta de Ultralytics, el hash SHA-256 de los pesos y la particion de datos, lo que permite replicar el entrenamiento y la evaluacion en otra maquina.
- Baseline experimental para comparaciones: junto al baseline COCO sports-ball (2 TP, 21 FP, 48 FN frente a 0 TP, 34 FP, 50 FN), permite medir si un nuevo enfoque mejora o empeora sobre la misma particion de test.
- Depuracion y curaduria de datasets: los falsos positivos y falsos negativos del split de test ayudan a identificar imagenes problematicas que conviene revisar o reetiquetar antes de reentrenar.
- Prototipado en investigacion con Ultralytics: al ser un `.pt` estandar, se puede cargar en notebooks y scripts de experimentacion para probar variantes de aumento de datos, resolucion o hiperparametros sin partir de cero.
- Docencia y divulgacion sobre vision por computador: es un ejemplo realista de un detector de una clase, con un desequilibrio claro entre entrenamiento y generalizacion, util para explicar conceptos como mAP, IoU, confianza y sobreajuste.
- Experimentacion controlada en analitica deportiva amateur: solo con supervision humana y verificacion previa, podria emplearse para explorar el seguimiento de la pelota en grabaciones propias, nunca para decisiones automaticas de arbitraje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision (validacion de mejor checkpoint, Ultralytics) | 0,187 |
| Recall (validacion de mejor checkpoint, Ultralytics) | 0,200 |
| mAP50 | 0,0616 |
| mAP50-95 | 0,0123 |
| Verdaderos positivos en test (conf 0,1, IoU 0,5) | 0 |
| Falsos positivos en test (conf 0,1, IoU 0,5) | 34 |
| Falsos negativos en test (conf 0,1, IoU 0,5) | 50 |
| Verdaderos positivos del baseline COCO sports-ball en test | 2 |
| Falsos positivos del baseline COCO sports-ball en test | 21 |
| Falsos negativos del baseline COCO sports-ball en test | 48 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo ni aparecen en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: no disponible en la informacion proporcionada; el autor no publica curvas de memoria ni perfiles de latencia.
- Entrenamiento documentado: NVIDIA Tesla T4, 0,527 horas para completar el ajuste fino con parada temprana en la epoca 43.
- GPU recomendadas: no especificadas. El unico hardware mencionado en la documentacion es la Tesla T4 usada para entrenar.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; no se aportan mediciones en tarjetas tipo RTX.
- Opciones de despliegue: libreria Ultralytics 8.4.140 con PyTorch. No se documentan exportaciones a ONNX, TensorRT, OpenVINO, CoreML ni variantes GGUF, ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Resolucion de entrada: 1280 px durante el entrenamiento; el ejemplo de uso invoca `model.predict` con `imgsz=1280` y `conf=0.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Rendimiento en el mismo test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tennis-ball-yolo26s-experimental-v0.2.0 | no disponible | 1280 px | no aplica | 0 TP, 34 FP, 50 FN (conf 0,1 / IoU 0,5) | AGPL-3.0 | Hugging Face |
| Baseline COCO sports-ball (mencionado en la model card) | no disponible | no disponible | no aplica | 2 TP, 21 FP, 48 FN (conf 0,1 / IoU 0,5) | no disponible (checkpoint base no publicado en este repositorio) | no disponible |
| Modelo por defecto de Tennis AI Local v0.2.0 | no disponible | no disponible | no aplica | no disponible | no disponible | GitHub (repositorio del proyecto) |
| Ultralytics YOLO26s preentrenado en COCO | no disponible | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks comparables publicados por terceros para este checkpoint ni para su baseline, mas alla de la comparacion directa incluida por el autor en `manifest.json`.

## Limitaciones y advertencias

- El checkpoint no supero la puerta de promocion sobre el conjunto de test intacto y no es el modelo por defecto de Tennis AI Local.
- Prohibido su uso para decisiones de linea, arbitraje, decisiones de seguridad o cualquier afirmacion de precision validada en deteccion de pelotas de tenis.
- Dificultades documentadas: pelotas pequenas y lejanas, desenfoque de movimiento, oclusion, compresion de video, cambios de iluminacion y objetos brillantes que no son pelotas.
- La particion de datos usa agrupacion por familia de nombres de fichero porque no se dispone de las identidades de los videos de origen; la independencia a nivel de partido no esta establecida.
- La existencia de casi-duplicados no se ha verificado, lo que puede inflar las metricas de validacion respecto a la generalizacion real.
- No se reclama ningun resultado validado en videos de movil, partidos de dobles, secuencias de retransmision ni dispositivos fisicos.
- Licencia AGPL-3.0 en el checkpoint: el uso comercial exige revisar los terminos de licencia vigentes de Ultralytics antes de cualquier despliegue.
- El dataset de origen es CC BY 4.0 y mantiene sus propios terminos y requisitos de atribucion; el dataset no se distribuye en este repositorio.
- Los pesos usan serializacion PyTorch (`.pt`): conviene descargar solo desde revisiones de confianza y verificar el hash SHA-256 antes de cargarlos.
- El modelo puede presentar sesgos derivados de la composicion del dataset de entrenamiento (468 imagenes de una unica fuente), que no esta documentada en detalle.
- Riesgo alto de falsos positivos con objetos brillantes o de forma circular en condiciones de iluminacion similares a una pelota de tenis.

## Enlaces

- Hugging Face: https://huggingface.co/Paulyang5049/tennis-ball-yolo26s-experimental-v0.2.0
- Repositorio del proyecto Tennis-AI-Tracker (v0.2.0): https://github.com/Paulyang5049/Tennis-AI-Tracker/tree/v0.2.0
- Release Tennis AI Local v0.2.0: https://github.com/Paulyang5049/Tennis-AI-Tracker/releases/tag/v0.2.0
- Dataset Tennis Ball Detection v6 de Viren Dhanwani: https://universe.roboflow.com/viren-dhanwani/tennis-ball-detection/dataset/6
- Ultralytics (libreria y licencia): https://www.ultralytics.com
- Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los unicos resultados obtenidos correspondian a Canva y no guardan relacion con la ficha.
