# HanzoHuang/YOLO11-RKNN2-Ultralytics

## Resumen

YOLO11-RKNN2-Ultralytics es un repositorio de pesos convertidos de la familia YOLO11 de Ultralytics, empaquetados en formato RKNN2 para su ejecución sobre NPU de Rockchip (RK3576 y RK3588). No se trata de un modelo entrenado desde cero, sino de un conjunto de exportaciones de checkpoints oficiales de Ultralytics convertidas con RKNN Toolkit2 2.3.2, orientadas a inferencia en dispositivos edge con aceleración hardware.

El repositorio incluye 100 exportaciones que cubren cinco tareas de visión por computador (classify, detect, obb, pose y segment), dos chips (RK3576 y RK3588) y dos precisiones (FP16 e INT8). Cada combinación se distribuye como un par de ficheros `model.rknn` y `metadata.yaml`, con un `manifest.json` que lista las combinaciones soportadas y sus hashes SHA-256.

Su relevancia es práctica: permite desplegar detectores y segmentadores YOLO11 en placas Rockchip sin tener que repetir el pipeline de conversión ni la calibración INT8. El repo ocupa 5,1 GB y se publica bajo licencia AGPL-3.0, heredada de los pesos originales de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), exportada a RKNN2; variantes de clasificación, detección, OBB, pose y segmentación |
| Parametros totales | no disponible (depende del checkpoint de origen; el repo no publica el desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 e INT8 (calibración INT8 sobre COCO128) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`), con `metadata.yaml` y `manifest.json`; checkpoints originales incluidos en `source/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11 de Ultralytics, una familia de redes convolucionales para visión por computador con cinco cabezas de tarea: clasificación de imagen, detección de objetos, detección con cajas orientadas (OBB), estimación de pose y segmentación de instancias. El repositorio no entrena ningún modelo nuevo: parte de los checkpoints oficiales de Ultralytics (referenciados con URLs y hashes en `source/weights.json`) y los convierte al formato RKNN2 mediante el flujo de exportación de Ultralytics y herramientas específicas por tarea.

La conversión se realizó con RKNN Toolkit2 2.3.2 sobre los chips RK3576 y RK3588. Para las exportaciones INT8, el proceso de calibración usa COCO128: un YAML de dataset para la variante de detección y una lista de imágenes para el resto de tareas, con `--calibration-limit 128` y el tamaño de entrada indicado en el manifest. El repositorio conserva los scripts de conversión, los registros de entorno y calibración, y los checkpoints originales en el directorio `source/`, lo que permite reproducir o ajustar el pipeline.

## Capacidades

- Clasificación de imágenes (task `classify`).
- Detección de objetos con cajas delimitadoras (task `detect`).
- Detección con cajas orientadas para objetos rotados (task `obb`).
- Estimación de pose con keypoints (task `pose`).
- Segmentación de instancias con máscaras (task `segment`).
- Inferencia acelerada por NPU en RK3576 y RK3588 en FP16 e INT8.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: calibración INT8 reproducible documentada, manifest con hashes SHA-256 para verificación de integridad.

## Casos de uso

- Vigilancia y conteo de personas en edge: la variante `detect` en INT8 sobre RK3588 permite ejecutar detección de objetos en tiempo real en una placa de bajo consumo, sin enviar vídeo a la nube y reduciendo latencia y coste de ancho de banda.
- Control de calidad industrial con OBB: la variante `obb` detecta piezas rotadas o inclinadas en cintas transportadoras, un caso en el que las cajas alineadas a los ejes pierden precisión; el modelo se despliega directamente en la NPU del dispositivo de inspección.
- Análisis de pose para ergonomía o deporte: la variante `pose` extrae keypoints corporales en un dispositivo Rockchip embebido, útil para aplicaciones de seguimiento de movimiento sin depender de conectividad.
- Segmentación de instancias en agricultura de precisión: la variante `segment` separa cultivos, malas hierbas u obstáculos sobre imágenes de dron o cámara fija, con máscaras por instancia.
- Clasificación de imágenes en dispositivos IoT: la variante `classify` permite etiquetar imágenes en la propia placa (por ejemplo, inspección visual simple o triaje de capturas) con el menor coste computacional de la familia.
- Verificación y despliegue reproducible en producción: el `manifest.json` con hashes SHA-256 y los scripts de conversión en `source/` permiten auditar qué checkpoint y qué calibración generaron cada `.rknn`, algo relevante en pipelines de CI/CD de modelos embebidos.
- Reentrenamiento y reconversión: al incluir los checkpoints originales y los scripts, el repo sirve como base para ajustar el modelo con datos propios y repetir la conversión a RKNN2 con la misma configuración de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de precisión (mAP, top-1), latencia ni throughput para las distintas combinaciones de chip y precisión.

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3576 y RK3588. No está pensado para GPU NVIDIA ni para CPU genérica.
- VRAM estimada: no aplica; el consumo relevante es memoria del sistema y memoria de la NPU del SoC, no publicada en la información disponible.
- GPU recomendadas: no aplica. Para ejecutar los `.rknn` se requiere un dispositivo Rockchip compatible con RKNN Runtime.
- ¿Cabe en consumer GPU? No aplica: el formato RKNN no se ejecuta en GPU de consumo.
- Opciones de despliegue: RKNN Runtime / RKNN Toolkit2 de Rockchip; los checkpoints originales en `source/` pueden exportarse a otros formatos con Ultralytics si se necesita otra plataforma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Tareas | Licencia |
|---|---|---|---|---|
| YOLO11-RKNN2-Ultralytics (este repo) | RKNN2 (FP16/INT8) | NPU Rockchip RK3576 / RK3588 | classify, detect, obb, pose, segment | AGPL-3.0 |
| Checkpoints oficiales YOLO11 de Ultralytics | PyTorch (`.pt`) | GPU NVIDIA / CPU | classify, detect, obb, pose, segment | AGPL-3.0 |
| Exportaciones ONNX de YOLO11 | ONNX | CPU, GPU, runtime ONNX | classify, detect, obb, pose, segment | AGPL-3.0 |
| Exportaciones TFLite de YOLO11 | TFLite (INT8/FP) | CPU móvil, Edge TPU | classify, detect, obb, pose, segment | AGPL-3.0 |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni tool calling.
- Dependencia de hardware: los ficheros `.rknn` solo se ejecutan en NPU Rockchip compatibles (RK3576, RK3588); no son portables a otras plataformas sin reconversión.
- Precisión INT8 dependiente de la calibración: la calibración se hizo con COCO128 y un límite de 128 muestras, por lo que el dominio de producción puede diferir del de calibración y degradar la precisión.
- Sin métricas publicadas: no hay mAP ni top-1 en el repo, así que la calidad real de cada exportación debe validarse por el usuario.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en servicios en red; conviene revisar el impacto antes de un despliegue comercial.
- Sesgos: no documentados en la información disponible; al derivar de checkpoints Ultralytics entrenados sobre datasets públicos, hereda los sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos positivos y falsos negativos propios de la detección.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLO11-RKNN2-Ultralytics
- Manifest de combinaciones y hashes: https://huggingface.co/HanzoHuang/YOLO11-RKNN2-Ultralytics/blob/main/manifest.json
- Directorio de fuentes y scripts: https://huggingface.co/HanzoHuang/YOLO11-RKNN2-Ultralytics/tree/main/source
- Checkpoints de origen y hashes: https://huggingface.co/HanzoHuang/YOLO11-RKNN2-Ultralytics/blob/main/source/weights.json
- Licencia: https://huggingface.co/HanzoHuang/YOLO11-RKNN2-Ultralytics/blob/main/LICENSE
- Ultralytics en PyPI: https://pypi.org/project/ultralytics/#history
- RKNN Toolkit2 (Rockchip): https://github.com/airockchip/rknn-toolkit2
