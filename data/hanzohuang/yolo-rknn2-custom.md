# HanzoHuang/YOLO-RKNN2-Custom

## Resumen

YOLO-RKNN2-Custom es una colección de conversiones precompiladas de los checkpoints oficiales de Ultralytics YOLO al formato RKNN2, el formato de inferencia propietario de los aceleradores NPU de Rockchip. El repositorio, publicado por el usuario HanzoHuang, no contiene pesos entrenados desde cero ni un modelo nuevo: empaqueta 96 exportaciones en FP16 e INT8 dirigidas a los SoC Rockchip RK3576 y RK3588, cubriendo seis tareas de visión (clasificación, profundidad, detección orientada OBB, pose, segmentación y segmentación semántica).

El problema que resuelve es puramente de ingeniería de despliegue: convertir un checkpoint PyTorch de Ultralytics a un grafo RKNN optimizado para la NPU de Rockchip requiere un exportador ONNX específico y el compilador RKNN Toolkit2, con calibración de cuantización INT8 por tarea y chip. Este repositorio proporciona los artefactos ya compilados junto con un manifiesto de hashes SHA-256, metadatos por modelo y los scripts de conversión, lo que elimina ese trabajo repetitivo para quien despliega en placas RK3576 o RK3588.

Es relevante para desarrolladores de edge computing en entornos embebidos (visión industrial, robótica, videovigilancia) que necesitan ejecutar detección y segmentación en hardware de bajo consumo sin depender de GPU. No es un modelo de lenguaje ni un modelo fundacional: es un conjunto de binarios de inferencia derivados de YOLO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes YOLO de Ultralytics (CNN, detección/segmentación/pose/clasificación/profundidad/semántica) compiladas a RKNN2 |
| Parámetros totales | no disponible (depende del checkpoint de origen; no se especifica en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16 e INT8 (calibración por imagen) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.rknn` (RKNN2), con checkpoints originales y scripts de conversión en el repo |
| Tareas cubiertas | classify, depth, obb, pose, segment, semantic |
| Chips objetivo | Rockchip RK3576 y RK3588 |
| Número de exportaciones | 96 (FP16 + INT8 por tarea, checkpoint y chip) |
| Tamaño del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Los pesos de partida son los checkpoints oficiales de Ultralytics, cuya arquitectura es la familia YOLO (backbone CNN con cuello de agregación de características y cabezas específicas por tarea: detección de cajas, máscaras de instancia, keypoints de pose, cajas orientadas, mapas de profundidad, logits de clasificación y máscaras semánticas). La model card no detalla variantes concretas (n, s, m, l, x) ni tamaños de entrada por checkpoint; esa información está en `manifest.json` y en `source/weights.json`, que no se han podido inspeccionar.

La innovación técnica del paquete está en la cadena de conversión: un exportador ONNX propio, distinto del de Ultralytics, alimenta el compilador RKNN Toolkit2 de Rockchip. El proceso incluye cuantización INT8 con un conjunto de imágenes de calibración documentado en el directorio `source`, junto con registros de entorno. El resultado son grafos RKNN2 optimizados para la NPU de cada SoC, con precisión FP16 e INT8 por separado. No hay información sobre datos de entrenamiento, número de tokens (no aplica) ni etapas de RLHF/DPO, ya que el entrenamiento es el de los checkpoints upstream de Ultralytics.

## Capacidades

- Detección de objetos en tiempo real sobre NPU Rockchip (tarea estándar de YOLO).
- Segmentación de instancias (máscaras por objeto) y segmentación semántica por píxel.
- Estimación de pose con keypoints.
- Detección de objetos orientados (OBB), adecuada para imágenes aéreas y objetos rotados.
- Estimación de profundidad monocular.
- Clasificación de imágenes.
- Inferencia en FP16 e INT8, con la variante INT8 calibrada para mayor throughput en la NPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Visión industrial en línea de producción: usar la exportación de detección INT8 para RK3588 dentro de una placa embebida que inspecciona piezas en una cinta transportadora, aprovechando la NPU para mantener latencias bajas sin GPU dedicada.
- Videovigilancia en el borde: desplegar la variante de segmentación o detección en un RK3576 para contar personas y vehículos localmente, enviando solo metadatos a la nube y reduciendo ancho de banda y coste.
- Robótica móvil: combinar la exportación de profundidad con la de detección en un mismo RK3588 para que un robot diferencial perciba obstáculos y objetos a partir de una cámara monocular.
- Análisis de imágenes aéreas y satelitales: emplear la variante OBB para detectar vehículos, barcos o edificios con orientación arbitraria, donde las cajas alineadas a los ejes pierden precisión.
- Seguridad y ergonomía laboral: usar la exportación de pose para estimar posturas de trabajadores en un puesto de riesgo y disparar alertas cuando se detecten posturas inadecuadas, todo en local.
- Clasificación y triaje en cámaras de bajo coste: desplegar la variante de clasificación INT8 en un RK3576 para filtrar fotogramas irrelevantes antes de enviarlos a un modelo mayor en servidor.
- Prototipado rápido en placas Rockchip: partir de los binarios `.rknn` ya compilados y del manifiesto de hashes para validar una placa sin montar la cadena ONNX + RKNN Toolkit2 desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mAP, latencia, throughput ni comparativas numéricas con otras exportaciones.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3576 y RK3588 con NPU integrada; el repositorio no está pensado para GPU NVIDIA ni CPU genérica.
- VRAM: no aplica; el consumo es de memoria del sistema compartida con la NPU del SoC. La model card no publica cifras de memoria por modelo.
- GPU recomendadas: no aplica. Para ejecutar los `.rknn` se requiere el runtime RKNN en el dispositivo Rockchip.
- Cabe en hardware de consumo: sí, en el sentido de que RK3588 y RK3576 se usan en placas SBC y mini-PC de consumo; no cabe en GPU de consumo porque el formato no es compatible.
- Opciones de despliegue: runtime RKNN de Rockchip en el dispositivo; la conversión requiere RKNN Toolkit2 y el script `source/convert-extended.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Chips objetivo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-RKNN2-Custom | RKNN2 (FP16/INT8) | RK3576, RK3588 | 6 tareas | AGPL-3.0 | Hugging Face, 0 descargas |
| Checkpoints Ultralytics YOLO | PyTorch / ONNX | GPU, CPU | 6 tareas | AGPL-3.0 | PyPI, ampliamente usado |
| RKNN Model Zoo (airockchip) | RKNN2 | Familia Rockchip | Depende del zoo | según modelo | GitHub de Rockchip |

La comparación relevante es con los checkpoints originales de Ultralytics (misma precisión de referencia, pero sin optimización para NPU) y con el RKNN Model Zoo oficial de Rockchip, que cubre más chips pero no necesariamente estas seis tareas con exportador propio. No se dispone de datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso conversacional es inválido.
- Los pesos derivan de checkpoints de Ultralytics bajo AGPL-3.0; el uso comercial en un servicio en red puede obligar a liberar el código del servicio según los términos de la AGPL. Verificar con asesoría legal antes de producción.
- La cuantización INT8 introduce pérdida de precisión frente a FP16; la model card no documenta la caída de mAP por tarea, por lo que hay que validarla en el dominio propio.
- Solo cubre RK3576 y RK3588; no funciona en otros SoC Rockchip ni en GPU/CPU sin reconversión.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; los binarios deben verificarse contra los hashes SHA-256 del manifiesto antes de usarse.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de falsos positivos y detecciones espurias propias de los modelos YOLO en dominios distintos al de entrenamiento.
- No se documentan sesgos demográficos ni de dominio; los checkpoints upstream de Ultralytics tienen sesgos conocidos en datasets como COCO (clases y contextos sobrerrepresentados).
- El exportador ONNX propio puede divergir del oficial de Ultralytics; conviene reproducir la conversión con `source/convert-extended.py` y comparar salidas antes de confiar en los binarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Custom
- Manifiesto de combinaciones y hashes: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Custom/blob/main/manifest.json
- Directorio de scripts y checkpoints: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Custom/tree/main/source
- Hashes y URLs de checkpoints: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Custom/blob/main/source/weights.json
- Licencia: https://huggingface.co/HanzoHuang/YOLO-RKNN2-Custom/blob/main/LICENSE
- Ultralytics en PyPI: https://pypi.org/project/ultralytics/#history
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
