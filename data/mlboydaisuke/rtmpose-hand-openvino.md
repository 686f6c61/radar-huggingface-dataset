# mlboydaisuke/RTMPose-Hand-OpenVINO

## Resumen

RTMPose-Hand-OpenVINO es una conversión y empaquetado del modelo RTMPose-Hand en formato OpenVINO, orientada a la inferencia de detección de keypoints de mano (21 puntos) en hardware Intel: NPU (Intel AI Boost), GPU integrada y CPU. El autor, mlboydaisuke, parte del modelo `litert-community/RTMPose-Hand-LiteRT` (fichero `rtmhand_fp16`) y lo exporta a ONNX (tf2onnx 1.17.0, opset 17), a OpenVINO IR con pesos fp32 y a un blob precompilado para NPU. No es un modelo entrenado desde cero, sino una distribución de inferencia optimizada.

La relevancia del artefacto es práctica: permite ejecutar un detector de keypoints de mano ligeramente cuantizado en la NPU de un Intel Core Ultra sin recompilar en tiempo de carga, con una latencia medida de 1,77 ms por inferencia (entrada numpy a salida numpy) en un Core Ultra 9 386H. El repositorio incluye además los scripts, registros y la tabla comparativa de 52 grafos de LiteRT en el repositorio `windows-zoo` del mismo autor.

El modelo resuelve el problema de desplegar RTMPose-Hand en entornos Intel con aceleración por NPU y GPU integrada, algo relevante para aplicaciones de interacción persona-ordenador, seguimiento de gestos y análisis de manos en tiempo real en equipos de consumo. La licencia Apache-2.0 heredada del modelo base facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMPose (estimación de pose/keypoints, CNN); exportado a ONNX opset 17 y OpenVINO IR |
| Parametros totales | no disponible (el fichero ONNX pesa 55.523.602 bytes en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 en ONNX; fp32 en los pesos del IR de OpenVINO; blob NPU precompilado (28.946.568 bytes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`rtmhand_fp16.onnx`), OpenVINO IR (`.xml` + `.bin`), blob NPU (`.blob`) |

## Arquitectura y entrenamiento

RTMPose es una familia de modelos de estimación de pose basada en CNN, diseñada para detección de keypoints con un equilibrio entre precisión y latencia. En este repositorio se distribuye la variante de mano, que predice 21 keypoints por mano. El modelo original procede de `litert-community/RTMPose-Hand-LiteRT` en formato LiteRT/TFLite; el autor lo convierte a ONNX mediante tf2onnx 1.17.0 (opset 17), genera el IR de OpenVINO con pesos fp32 y compila un blob específico para la NPU Intel con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841.

No se proporcionan en la información disponible datos sobre el conjunto de entrenamiento, número de tokens (no aplica), composición del dataset ni si hubo ajuste fino con RLHF/DPO. La innovación técnica destacable es el empaquetado para despliegue: el blob precompilado evita la compilación en tiempo de carga en la NPU, y el repositorio incluye comprobaciones de salida (coseno ≥ 0,99, ausencia de NaN/Inf y acuerdo de argmax) frente a la salida de referencia en CPU fp32 con ONNX Runtime.

## Capacidades

- Detección de keypoints de mano: 21 puntos por mano, pipeline de `keypoint-detection`.
- Inferencia en NPU Intel AI Boost, GPU integrada Intel y CPU mediante OpenVINO y ONNX Runtime.
- Ejecución con blob NPU precompilado (sin compilación al cargar) o compilando el IR en la máquina destino.
- Compatibilidad con ONNX Runtime mediante el Execution Provider de OpenVINO (versión 1.8.1) y con el runtime nativo de OpenVINO 2026.4.1.
- Entrada y salida en numpy (float32), con formas declaradas por el propio modelo compilado.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües: es un modelo puramente de visión para keypoints.

## Casos de uso

- Seguimiento de gestos en tiempo real: con 1,77 ms por inferencia en NPU, el modelo permite procesar decenas de fotogramas por segundo en un portátil con Core Ultra, adecuado para control por gestos sin GPU dedicada.
- Interacción persona-ordenador en entornos de escritorio: la latencia de 1,58 ms en GPU integrada Intel y 7,44 ms en CPU permite integrar el detector en aplicaciones de escritorio que ya usan OpenVINO, sin depender de una GPU discreta.
- Análisis de manos en vídeo pregrabado: el bajo coste por fotograma hace viable procesar lotes grandes de vídeo en CPU o iGPU para extraer trayectorias de keypoints.
- Prototipado en dispositivos Intel de consumo: el blob precompilado reduce el tiempo de arranque (0,02 s de carga) y simplifica el despliegue en equipos con NPU Intel AI Boost.
- Evaluación comparativa de runtimes: el repositorio incluye mediciones frente a ONNX Runtime con CUDA EP y frente a NPU Qualcomm, útil para decidir el backend de inferencia en un proyecto.
- Sistemas de accesibilidad: detección de posturas de mano para interfaces sin contacto en aplicaciones asistivas, aprovechando la ejecución en CPU/iGPU de bajo consumo.
- Investigación en visión por computador: servir como referencia de conversión LiteRT → ONNX → OpenVINO para reproducir pipelines de despliegue en hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (PCK, mAP, etc.) en la información disponible. Sí se incluyen mediciones de latencia y comprobaciones de salida del autor:

| Procesador | Runtime | Fichero | ms | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 1,77 | 0,02 | FAIL: acuerdo argmax 16/21 y 20/21 |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,99 | 1,33 | FAIL: acuerdo argmax 16/21 y 20/21 |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,58 | 1,05 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 3,52 | 1,16 | FAIL: acuerdo argmax 20/21 y 17/21 |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 4,31 | 1,15 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 7,44 | 0,13 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,96 | 0,59 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` | 0,96 | 1,13 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,87 | 0,20 | no comparado |

La comparación del ONNX frente al `.tflite` original (intérprete LiteRT en CPU, misma entrada) da PASS con coseno ≥ 0,9999 en todas las salidas. Las mediciones se realizaron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711), con mediana de 30 ejecuciones tras 5 de calentamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMPose-Hand-OpenVINO | no disponible (ONNX 55,5 MB fp16) | no aplica | 1,77 ms en NPU Intel; 1,58 ms en iGPU; 7,44 ms en CPU | Apache-2.0 | Hugging Face (este repo) |
| litert-community/RTMPose-Hand-LiteRT | no disponible | no aplica | no disponible en la información | Apache-2.0 (heredada) | Hugging Face |
| mlboydaisuke/RTMPose-m-Hand-ExecuTorch | no disponible | no aplica | no disponible en la información | no disponible | Hugging Face |
| RTMpose-OpenVINO (coldchanP, face/body/hand) | no disponible | no aplica | no disponible en la información | no disponible | GitHub |

Las alternativas comparables son variantes del mismo modelo RTMPose-Hand en otros formatos de despliegue (LiteRT, ExecuTorch) o conversiones a OpenVINO de la familia RTMPose completa (cara, cuerpo y mano). No se dispone de datos de precisión que permitan comparar calidad entre ellas.

## Limitaciones y advertencias

- Solo detecta keypoints de mano (21 puntos); no cubre cuerpo, cara ni otras tareas de visión.
- Las salidas en NPU y en CUDA EP con fp16 no superan la comprobación de argmax frente a la referencia CPU (16/21 y 20/21 en la NPU; 20/21 y 17/21 en CUDA fp16), lo que indica posibles discrepancias numéricas en la clasificación de keypoints.
- El blob NPU está compilado con OpenVINO 2026.4.1 y el driver NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y es necesario compilar el IR.
- No se han publicado métricas de precisión (PCK, mAP) ni detalles del entrenamiento en la información disponible.
- Riesgo de sesgo y alucinación no documentado; al ser un modelo de visión, el riesgo principal es la detección errónea de keypoints en condiciones de oclusión, iluminación adversa o manos fuera de encuadre.
- No se especifican requisitos de preprocesado (resolución de entrada, normalización) más allá de que las formas se obtienen del modelo compilado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/RTMPose-Hand-OpenVINO
- Modelo base: https://huggingface.co/litert-community/RTMPose-Hand-LiteRT
- Repositorio de scripts y mediciones: https://github.com/john-rocky/windows-zoo
- Variante ExecuTorch del mismo autor: https://huggingface.co/mlboydaisuke/RTMPose-m-Hand-ExecuTorch
- Conversión RTMPose a OpenVINO (face, body, hand): https://github.com/coldchanP/RTMpose-OpenVINO
