# qualcomm/LightGlue

## Resumen

LightGlue es una red neuronal profunda disenada para emparejar caracteristicas locales dispersas entre pares de imagenes. Sustituye la combinacion tradicional de matching por vecino mas cercano y ajuste geometrico robusto por un modelo ligero basado en atencion que realiza tanto el emparejamiento como una poda aprendida de puntos no emparejables en una unica pasada forward. El modelo consume keypoints y descriptores ya producidos por un extractor de caracteristicas separado (SuperPoint) y devuelve correspondencias de puntos entre las dos imagenes.

La implementacion original proviene del repositorio cvg/LightGlue y este repositorio de Hugging Face contiene los ficheros pre-exportados y optimizados para dispositivos Qualcomm. La ficha corresponde a la version empaquetada por Qualcomm AI Hub Models, que combina el checkpoint oficial de LightGlue (entrenado contra el SuperPoint de Magic Leap) con el port de SuperPoint bajo licencia MIT de este repositorio. La precision reportada es, por tanto, orientativa y no una reproduccion directa de las cifras del paper.

El modelo tiene 11,3 millones de parametros, 9 capas transformer, una dimension de descriptor de 256, resolucion de entrada de 480x640 pixeles y un maximo de 500 keypoints por imagen. Ocupa 43,7 MB en float y esta pensado para inferencia en tiempo real sobre NPU de chipsets Snapdragon y Dragonwing, con latencias del orden de 36 a 124 ms segun el chipset. Es relevante para desarrolladores que necesitan estimacion de pose, SLAM visual o reconstruccion 3D en movil y edge con bajo consumo energetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de atencion basada en transformer para matching de features (9 capas transformer) |
| Parametros totales | 11,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | float (los assets pre-exportados son float; no se listan otras precisiones) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX, TFLITE (assets pre-exportados); checkpoint original superpoint_lightglue_v0-1_arxiv.pth |

## Arquitectura y entrenamiento

LightGlue es una red de atencion con 9 capas transformer que opera sobre keypoints y descriptores de 256 dimensiones extraidos previamente por SuperPoint. En lugar de calcular distancias entre descriptores seguido de un ajuste geometrico (RANSAC u homografia), el modelo procesa conjuntamente los conjuntos de puntos de ambas imagenes mediante atencion cruzada y predice directamente las correspondencias, incluyendo una poda aprendida de puntos que no tienen correspondencia valida. Esto reduce el coste computacional frente a pipelines clasicos y permite un unico forward pass para matching y filtrado.

El checkpoint utilizado es `superpoint_lightglue_v0-1_arxiv.pth`, entrenado originalmente contra el SuperPoint de Magic Leap. En este repositorio, Qualcomm lo empareja con su propio port de SuperPoint bajo licencia MIT, lo que implica que las metricas de precision reportadas son orientativas y no reproducen exactamente las del paper (arXiv:2306.13643). No se dispone en la informacion proporcionada de detalles sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, ya que se trata de un modelo de vision supervisado para matching.

## Capacidades

- Deteccion y emparejamiento de keypoints entre pares de imagenes (pipeline `keypoint-detection`).
- Matching de features locales dispersas con poda aprendida de puntos no emparejables en una sola pasada.
- Consumo de keypoints y descriptores de 256 dimensiones generados por SuperPoint.
- Entrada de hasta 500 keypoints por imagen a resolucion de 480x640 pixeles.
- Inferencia optimizada en NPU de chipsets Qualcomm (Snapdragon y Dragonwing).
- Exportacion configurable via la libreria Qualcomm AI Hub Models (pesos fine-tuneados, formas de entrada personalizadas, dispositivo y runtime objetivo).
- No dispone de tool calling, capacidades de agente, multilingues ni modos de razonamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Estimacion de pose relativa entre dos imagenes: el modelo devuelve correspondencias de puntos que alimentan un solver de pose (PnP, homografia) en pipelines de realidad aumentada movil, con latencia inferior a 50 ms en Snapdragon 8 Elite.
- SLAM visual en dispositivos moviles: el matching ligero permite rastrear features entre fotogramas consecutivos en NPU con consumo energetico bajo, adecuado para odometria visual en drones o robots.
- Reconstruccion 3D y fotogrametria: emparejar features entre vistas para triangulacion dispersa, aprovechando la poda aprendida para descartar correspondencias invalidas antes del ajuste geometrico.
- Registro de imagenes medicas o satelitales: alinear pares de imagenes con transformaciones rigidas o homografias usando correspondencias de keypoints en lugar de metodos clasicos de correlacion.
- Realidad aumentada y vision por computador en Android: integracion del asset TFLITE float en apps Android para tracking de marcadores y anclaje de contenido virtual.
- Automocion y sistemas ADAS: matching de features entre camaras o fotogramas en chipsets SA8650P, SA8295P y SA8775P con latencias de 116 a 124 ms en TFLITE.
- Edge computing industrial: despliegue en Dragonwing IQ-8275, IQ-9075 o Q-8750 para inspeccion visual y control de calidad con inferencia en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo de vision. La model card proporciona exclusivamente metricas de latencia y memoria de inferencia por chipset:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Extreme Gen 6 Mobile | 36,05 | 23 - 356 | NPU |
| ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 46,805 | 22 - 385 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 48,077 | 23 - 402 | NPU |
| ONNX | float | Snapdragon X2 Elite | 59,137 | 32 - 32 | NPU |
| ONNX | float | Snapdragon X Elite | 118,295 | 32 - 32 | NPU |
| TFLITE | float | Snapdragon 8 Elite Extreme Gen 6 Mobile | 38,452 | 14 - 700 | NPU |
| TFLITE | float | Snapdragon 8 Elite For Galaxy Mobile | 55,718 | 14 - 805 | NPU |
| TFLITE | float | Snapdragon 8 Gen 1 Mobile | 118,9 | 15 - 1052 | NPU |
| TFLITE | float | Dragonwing IQ-8275 | 103,289 | 14 - 80 | NPU |
| TFLITE | float | Dragonwing IQ-9075 | 110,159 | 12 - 78 | NPU |
| TFLITE | float | SA8650P / SA8775P / SA8255P | 116,398 | 15 - 800 | NPU |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo ocupa 43,7 MB en float y la memoria pico de inferencia reportada oscila entre 12 y 1052 MB segun runtime y chipset.
- GPU recomendadas: no se listan GPU de escritorio; la optimizacion esta orientada a NPU de Qualcomm (Snapdragon 8 Elite, Snapdragon X Elite, Dragonwing IQ-8275, IQ-9075, Q-8750, SA8650P, SA8295P, SA8775P, entre otros).
- Cabe en consumer GPU: no disponible en la informacion proporcionada; los assets estan pensados para NPU movil y edge.
- Opciones de despliegue: ONNX Runtime 1.30.0 (QAIRT 2.51) y TFLite (QAIRT 2.51), ademas de exportacion via Qualcomm AI Hub Models. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: latencia de 36,05 a 124,412 ms por inferencia segun chipset y runtime (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| LightGlue (esta ficha) | 11,3 M | 500 keypoints/imagen, 480x640 | apache-2.0 | ONNX, TFLITE en NPU Qualcomm | Matching aprendido con poda integrada |
| SuperPoint (port incluido en el repo) | no disponible | no disponible | MIT | ONNX, TFLITE en NPU Qualcomm | Extractor de keypoints y descriptores; latencias de 6,8 a 9,4 ms en ONNX |
| Pipeline clasico NN + RANSAC | no aplica | keypoints variables | no aplica | CPU/GPU generica | Referencia tradicional que LightGlue sustituye |

No se dispone en la informacion proporcionada de datos comparativos de precision frente a otros matchers aprendices (por ejemplo, SuperGlue) ni de cifras de benchmarks del paper original.

## Limitaciones y advertencias

- Las metricas de precision reportadas son orientativas: el checkpoint oficial de LightGlue se ha emparejado con el port SuperPoint de este repositorio (MIT), no con el SuperPoint de Magic Leap original, por lo que no reproducen directamente las cifras del paper arXiv:2306.13643.
- Depende de un extractor de features externo (SuperPoint): el modelo no detecta keypoints por si mismo, solo empareja los ya extraidos.
- Limite de 500 keypoints por imagen y resolucion de entrada de 480x640 pixeles; escenarios con muchas mas features o resoluciones mayores requieren reexportacion con formas personalizadas.
- Rendimiento optimizado exclusivamente para hardware Qualcomm; no se documentan latencias en GPU de escritorio ni en CPU generica.
- No dispone de capacidades linguisticas, de razonamiento, tool calling ni agentes; no es adecuado para tareas de texto.
- Riesgo de correspondencias erroneas en imagenes con texturas repetitivas, cambios de iluminacion extremos o oclusiones, que deben filtrarse con un ajuste geometrico posterior (RANSAC u homografia).
- Licencia apache-2.0 para el modelo; el port SuperPoint del repositorio es MIT. Verificar compatibilidad de licencias en uso comercial combinado.
- Los assets pre-exportados estan en precision float; no se documentan variantes cuantizadas en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/LightGlue
- Modelo en Qualcomm AI Hub: https://aihub.qualcomm.ai/models/lightglue
- Repositorio Qualcomm AI Hub Models (LightGlue): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/lightglue
- Implementacion original LightGlue: https://github.com/cvg/LightGlue
- Paper LightGlue (arXiv): https://arxiv.org/abs/2306.13643
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/lightglue/releases/v0.67.0/lightglue-onnx-float.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/lightglue/releases/v0.67.0/lightglue-tflite-float.zip
