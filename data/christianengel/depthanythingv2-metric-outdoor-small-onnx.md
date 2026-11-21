# christianengel/DepthAnythingV2-Metric-Outdoor-Small-ONNX

## Resumen

Depth Anything V2 Metric Outdoor Small ONNX es una exportación a formato ONNX del modelo Depth Anything V2 en su variante métrica (predice profundidad en metros, no profundidad relativa) y de tamano Small, afinada sobre el conjunto Virtual KITTI. El modelo original lo desarrolla el equipo de Depth Anything (Lihe Yang et al., Universidad de Hong Kong y TikTok), y esta conversión concreta la publica el usuario christianengel con el objetivo de facilitar el despliegue en entornos de inferencia optimizados (ONNX Runtime, TensorRT en Jetson).

La relevancia de esta ficha está en que se trata de una exportación de ingeniería, no de un modelo nuevo: mantiene la arquitectura del Depth Anything V2 Small (encoder tipo DINOv2 con decoder de profundidad) pero ofrece pesos en FP32 y FP16 listos para ejecutarse fuera del ecosistema PyTorch, con validación numérica frente al modelo original (diferencia de AbsRel de 0,00195 entre ONNX y PyTorch). El rango métrico está limitado a exteriores y hasta 80 m, según indica el autor.

Es un modelo de un solo uso: estimación de profundidad monocular métrica en imágenes de exterior. No genera texto ni soporta instrucciones; su utilidad está en pipelines de percepción (robótica, automoción, visión 3D) donde se necesita una profundidad en metros calibrada y una latencia baja en hardware embebido. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depth Anything V2 (encoder DINOv2 + decoder de profundidad monocular), exportado a ONNX |
| Parametros totales | no disponible (variante Small del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 y FP16 (ficheros `model_fp32.onnx` y `model_fp16.onnx`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con scripts de construcción para TensorRT) |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 en su variante métrica afinada sobre Virtual KITTI (identificador `Depth-Anything-V2-Metric-VKITTI-Small`). La arquitectura es un transformer de visión con encoder basado en DINOv2 y un cabezal de regresión de profundidad densa que produce un mapa de profundidad por píxel en metros. La variante "Metric" se distingue de la versión de profundidad relativa en que la salida está calibrada en unidades físicas (metros), lo que permite su uso directo en planificación y control sin alineamiento de escala posterior.

El autor indica explícitamente que este checkpoint no es el modelo del paper entrenado sobre KITTI, sino la variante Small afinada sobre Virtual KITTI (dataset sintético de conducción). La validación se realizó sobre 50 fotogramas de dos secuencias de KITTI (`2011_09_26_drive_0002_sync` y `2011_09_26_drive_0009_sync`), con recorte tipo Eigen (no el recorte de Garg) y verdad de referencia en el rango (0,001, 80] m, sobre 792.691 píxeles. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de profundidad). La innovación técnica relevante de esta exportación es la conversión a ONNX con verificación numérica frente a PyTorch y la construcción de motores TensorRT para Jetson.

## Capacidades

- Estimación de profundidad monocular métrica en metros para imágenes de exterior, con rango máximo declarado de 80 m.
- Entrada de imagen RGB en float32 con normalización ImageNet, tensor `N×3×H×W`, con H y W múltiplos de 14.
- Salida de mapa de profundidad `N×H×W` en float32 (metros).
- Ejecución en ONNX Runtime (CPU o GPU) y construcción de motores TensorRT para Jetson.
- Soporte de lotes (`N` en la dimensión de batch).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Percepción en robótica móvil: el modelo entrega un mapa de profundidad métrico por píxel que puede alimentar planificadores de trayectoria y evitación de obstáculos, con la ventaja de que la salida está en metros y no requiere alineamiento de escala.
- Automoción y ADAS de bajo coste: al estar exportado a ONNX y TensorRT, puede desplegarse en Jetson Orin u otras plataformas embebidas para estimación de distancia a obstáculos en el rango de 0 a 80 m.
- Reconstrucción 3D y nubes de puntos: la profundidad métrica permite back-proyectar píxeles a coordenadas 3D con una cámara calibrada, útil para generación de mapas de ocupación.
- Realidad aumentada y virtual: inserción de objetos virtuales con oclusión coherente usando la profundidad estimada de la escena en tiempo real.
- Análisis de escenas de conducción y datasets: procesamiento por lotes de secuencias de vídeo (por ejemplo, KITTI o Virtual KITTI) para generar mapas de profundidad de referencia o aumentar datasets.
- Prototipado rápido en CPU: al ofrecer un fichero ONNX FP32 ejecutable con `CPUExecutionProvider`, permite validar pipelines de percepción sin GPU dedicada.
- Integración en pipelines de CI/CD de visión: verificación de regresiones numéricas comparando la salida ONNX con la de PyTorch (el autor reporta una diferencia de AbsRel de 0,00195).

## Benchmarks y rendimiento

El autor publica métricas de validación sobre 50 fotogramas de KITTI (rango GT (0,001, 80] m, 792.691 píxeles):

| Metrica | ONNX | PyTorch |
|---|---|---|
| AbsRel | 0,126 | 0,126 |
| δ1 | 0,847 | 0,846 |
| RMSE | 4,686 m | 4,694 m |
| Diferencia AbsRel ONNX vs PyTorch | 0,00195 | — |

Además, el autor indica que la discrepancia por el gap de position-embedding es 0 a 518×518 y de aproximadamente 0,028 m como máximo a 518×686. No se han publicado en la información disponible resultados comparativos con otros modelos de profundidad (por ejemplo, MiDaS o Depth Anything V1) ni métricas en otros datasets.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de la variante Small y con pesos de 0,1 GB en el repositorio, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor menciona Jetson (construcción TensorRT mediante `jetson/build_tensorrt.sh`) y no descarta CPU. No se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: sí, por el tamano reducido de los pesos FP16/FP32; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT (Jetson) y, por extensión, cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles. El autor indica que no dispuso de una Jetson Orin para medir, por lo que no hay cifras de rendimiento en hardware embebido.
- Nota de despliegue: la keep-list FP16 de la variante Small está vacía (entrada/salida en FP32), por lo que debe usarse `--stronglyTyped` al construir el motor TensorRT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad | Licencia | Formato |
|---|---|---|---|---|---|
| Depth Anything V2 Metric Outdoor Small ONNX (este) | no disponible (Small) | no aplica | Métrica, hasta 80 m | Apache 2.0 | ONNX |
| Depth Anything V2 Metric VKITTI Small (base) | no disponible (Small) | no aplica | Métrica, hasta 80 m | Apache 2.0 | PyTorch |
| Depth Anything V2 (variantes relativas) | no disponible | no aplica | Relativa | Apache 2.0 | PyTorch |
| MiDaS | no disponible | no aplica | Relativa | MIT (según versión) | PyTorch |

No se dispone en la información proporcionada de comparativas numéricas frente a MiDaS u otros estimadores de profundidad; los únicos datos son los de validación del propio autor frente a su versión PyTorch.

## Limitaciones y advertencias

- El rango de profundidad está limitado a exteriores y a un máximo de 80 m; no está pensado para interiores ni para distancias mayores.
- El autor advierte explícitamente que no es el modelo del paper entrenado sobre KITTI, sino la variante Small afinada sobre Virtual KITTI; el rendimiento en escenas reales puede diferir.
- No hay alineamiento de escala: la salida es métrica directa, pero depende de la calibración del dominio de entrenamiento (Virtual KITTI).
- Las métricas de validación se obtienen sobre solo 50 fotogramas de dos secuencias de KITTI, por lo que la muestra es reducida y puede no ser representativa.
- La keep-list FP16 está vacía y la entrada/salida es FP32; un uso incorrecto de la construcción TensorRT (sin `--stronglyTyped`) puede fallar.
- No hay mediciones de latencia ni throughput en Jetson Orin (el autor no disponía del hardware).
- Riesgo de sesgo hacia escenas de conducción sintéticas y condiciones de iluminación/clima propias de Virtual KITTI.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Outdoor-Small-ONNX
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-VKITTI-Small
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Repositorio oficial Depth Anything V2: no disponible en la información proporcionada
- Demo oficial: no disponible en la información proporcionada
