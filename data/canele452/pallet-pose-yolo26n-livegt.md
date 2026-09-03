# CanelE452/pallet-pose-yolo26n-livegt

## Resumen

El modelo `CanelE452/pallet-pose-yolo26n-livegt` es un detector de pallets con estimación de pose (keypoints) basado en la arquitectura YOLO26n de Ultralytics. Ha sido desarrollado por CanelE452 (kim) como un ajuste fino (fine-tuning) del modelo base `CanelE452/pallet-pose-yolo26n-ft`, que a su vez fue entrenado sobre un conjunto de 402 imágenes etiquetadas manualmente. El objetivo es proporcionar una solución de visión por computador para la detección y localización 6DoF de pallets en entornos logísticos, especialmente para aplicaciones de robótica móvil y carretillas elevadoras.

La relevancia de este modelo radica en que está específicamente diseñado para pallets cuadrados (1.10 × 1.10 × 0.15 m) con simetría de 90°, a diferencia del modelo base que trabaja con pallets rectangulares (1.10 × 1.30 × 0.11 m) con simetría de 180°. Esta distinción es crítica para la interpretación correcta de la orientación (yaw) en tareas de manipulación. El autor advierte explícitamente que el rendimiento en validación held-out es inferior al del modelo base, atribuyéndolo a un dominio gap entre las imágenes de entrenamiento (cámara en mano) y las de validación (conducción de montacargas), y que no se ha evaluado en la misma distribución. Por tanto, no es un modelo de propósito general, sino una variante experimental para un escenario concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vision, sin texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26n, la versión nano de la familia YOLO26 de Ultralytics, que incorpora una cabeza de estimación de pose (Pose26 head). Es un modelo de una sola etapa (one-stage) que realiza detección de objetos y predicción de keypoints simultáneamente. El autor no especifica el número total de parámetros, pero al ser la variante nano, se espera que sea ligero y adecuado para inferencia en tiempo real.

El entrenamiento se realizó mediante ajuste fino del modelo base `pallet-pose-yolo26n-ft` sobre un conjunto de datos propio de 402 imágenes etiquetadas manualmente, divididas en 344 imágenes tomadas con cámara en mano y 58 imágenes de conducción de montacargas. No se incluyeron imágenes negativas ni datos sintéticos. Los hiperparámetros de entrenamiento fueron: 40 épocas, batch size 32, tamaño de imagen 640, learning rate inicial 0.01 (SGD automático), seed 42 y patience 0. El entrenamiento se completó en 2.4 minutos en una RTX 3080 (3.6 segundos por época). No se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a modelos de visión.

Una innovación destacable es la convención de keypoints "camera-facing 0123", donde los puntos 0-3 corresponden a la cara visible de la cámara y los puntos 4-7 a la cara opuesta, con un punto 8 como centroide. Además, se requiere un padding reflectante de 100 píxeles en la inferencia, ya que todas las imágenes de entrenamiento se generaron con ese preprocesado. Esta convención es específica para pallets cuadrados con simetría de 90°, donde la ambigüedad de yaw se resuelve mediante una regla de etiquetado unificada.

## Capacidades

- Detección de pallets cuadrados (1.10 × 1.10 × 0.15 m) en imágenes RGB.
- Estimación de pose con 9 keypoints (8 esquinas + centroide), siguiendo la convención camera-facing 0123.
- Permite el cálculo de la pose 6DoF del pallet mediante solvePnP a partir de los keypoints.
- Inferencia en tiempo real gracias a la arquitectura YOLO26n (nano), adecuada para aplicaciones embebidas o de baja latencia.
- Soporte para el pipeline de Ultralytics (detección + keypoints) con la librería `ultralytics` (versión >= 8.4.60).
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Navegación autónoma de carretillas elevadoras: el modelo detecta pallets y estima su orientación para guiar la aproximación y el acoplamiento de las horquillas. Gracias a la convención de keypoints y al cálculo de pose 6DoF, el sistema puede planificar trayectorias precisas.
- Robótica de manipulación en almacenes: un brazo robótico puede utilizar los keypoints para localizar los puntos de agarre del pallet y ejecutar tareas de recogida y apilado. La simetría de 90° está contemplada en la convención de etiquetado.
- Inspección de pallets en líneas de producción: el modelo puede verificar la integridad estructural de los pallets detectando sus esquinas y comprobando alineaciones, aunque su rendimiento en condiciones de iluminación variada no está validado.
- Control de inventario con visión: integrado en sistemas de cámaras fijas, permite contar y localizar pallets en un área de almacenamiento, proporcionando coordenadas aproximadas para sistemas de gestión de almacén (WMS).
- Pruebas de concepto en investigación: al ser un modelo pequeño y de código abierto, sirve como punto de partida para experimentos sobre detección de pallets en entornos controlados, siempre que se respete la convención de padding y keypoints.
- Benchmarking de modelos de pose en robótica: puede utilizarse como referencia para comparar arquitecturas de detección de pallets, aunque el autor recomienda probar primero el modelo base y validar este en el mismo dominio antes de usarlo en producción.

## Benchmarks y rendimiento

El autor proporciona resultados de validación en un conjunto held-out (58 imágenes de conducción de montacargas) comparando el modelo base (`-ft`) con este modelo. Es importante señalar que esta comparación refleja un dominio gap entre los datos de entrenamiento (cámara en mano) y los de validación (montacargas), no una evaluación en la misma distribución.

| Metrica | Base (`-ft`) | Este modelo | Diferencia |
|---|---|---|---|
| box_mAP50 | 0.9930 | 0.8907 | -0.1023 |
| box_mAP50_95 | 0.8170 | 0.7341 | -0.0830 |
| pose_mAP50 | 0.9446 | 0.8523 | -0.0923 |
| pose_mAP50_95 | 0.8543 | 0.7419 | -0.1124 |
| box_recall | 1.0000 | 0.8966 | -0.1034 |

No se han publicado otros benchmarks (como MMLU, HumanEval, etc.) porque se trata de un modelo de visión, y no se dispone de resultados adicionales en la información proporcionada.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU RTX 3080 (10 GB VRAM) con un tiempo de 2.4 minutos para 40 épocas, lo que indica que el modelo es ligero.
- Para inferencia, al ser un modelo nano, se espera que funcione en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU, aunque no se proporcionan datos específicos de VRAM ni latencia.
- No se dispone de información sobre cuantización (FP16, INT8, etc.) ni sobre el uso de formatos como ONNX o TensorRT, aunque son compatibles con el ecosistema Ultralytics.
- Opciones de despliegue: la librería `ultralytics` permite exportar a ONNX, TensorRT, CoreML, etc. También puede ejecutarse con `vLLM` o `llama.cpp` (no aplicable a visión), pero lo más común es usar el pipeline nativo de Ultralytics o servidores como Triton con modelos ONNX.
- Se recomienda verificar la versión de `ultralytics` (>= 8.4.60) para cargar correctamente el modelo.

## Comparativa con modelos similares

La comparativa se limita al modelo base `CanelE452/pallet-pose-yolo26n-ft`, ya que no se dispone de información sobre otros modelos de detección de pallets con pose en la búsqueda realizada.

| Modelo | Arquitectura | Objeto | Simetria | Rendimiento (held-out) | Licencia |
|---|---|---|---|---|---|
| `pallet-pose-yolo26n-ft` (base) | YOLO26n-pose | Pallet rectangular 1.10×1.30×0.11 m | 180° | box_mAP50: 0.9930, pose_mAP50: 0.9446 | AGPL-3.0 |
| `pallet-pose-yolo26n-livegt` (este) | YOLO26n-pose | Pallet cuadrado 1.10×1.10×0.15 m | 90° | box_mAP50: 0.8907, pose_mAP50: 0.8523 | AGPL-3.0 |

No se han encontrado otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Rendimiento no verificado: el autor indica que la evaluación en held-out muestra métricas inferiores al modelo base, y que no se ha realizado una evaluación en la misma distribución de los datos de entrenamiento. Por tanto, no se recomienda su uso en producción sin una validación previa en el dominio objetivo.
- Dominio gap: las imágenes de entrenamiento (cámara en mano) y las de validación (conducción de montacargas) presentan diferencias significativas, lo que explica la caída de rendimiento. El modelo puede no generalizar bien a otros entornos o condiciones de iluminación.
- Datos limitados: solo se utilizaron 402 imágenes reales, lo que reduce la diversidad de fondos, iluminación y ángulos de cámara. Esto puede provocar sobreajuste y baja robustez ante variaciones.
- Sensibilidad a recortes y pallets lejanos: el autor menciona que los pallets parcialmente visibles o muy distantes son difíciles de detectar, igual que en el modelo base.
- Convención específica: la regla de etiquetado de keypoints está diseñada para pallets cuadrados con simetría de 90°. Si se aplica a pallets rectangulares, la interpretación del yaw será incorrecta.
- Licencia AGPL-3.0: al ser una licencia copyleft, cualquier uso o modificación del modelo en un servicio en red puede requerir la divulgación del código fuente correspondiente. Es importante revisar las implicaciones legales antes de su uso comercial.
- Requisito de padding: la inferencia sin el padding reflectante de 100 píxeles degradará el rendimiento, por lo que el preprocesado es obligatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CanelE452/pallet-pose-yolo26n-livegt
- Modelo base: https://huggingface.co/CanelE452/pallet-pose-yolo26n-ft
- Perfil del autor: https://huggingface.co/CanelE452
- Repositorio YOLO26 de Ultralytics: https://github.com/ultralytics/yolo26
- Documentación de YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio principal de Ultralytics: https://github.com/ultralytics/ultralytics
