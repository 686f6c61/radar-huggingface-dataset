# rehan9599/drishti-detector

## Resumen

DRISHTI es un detector de objetos basado en YOLOv8s, ajustado para localizar residuos y peligros de origen antropogénico en imágenes de sonar de barrido lateral (side-scan sonar, SSS). Fue desarrollado por Rehan9599 para el Smart India Hackathon 2026, en el marco del problema 26057 del Ministerio de Ciencias de la Tierra de India y el NIOT. El modelo aborda la necesidad de inspección autónoma del lecho marino mediante vehículos submarinos no tripulados (AUV), donde el peso y la latencia son críticos.

El modelo se distribuye en formato PyTorch y ONNX, con una variante FP16 para GPUs embebidas como Jetson. La versión ONNX permite ejecutar la inferencia completa sin importar PyTorch, reduciendo el runtime de ~1,5 GB a ~50 MB, lo que lo hace viable para despliegue en AUV. Detecta cuatro clases operativas: tuberías submarinas, pecios, redes fantasma y minas cilíndricas, con una quinta clase (nasas de cangrejo) entrenada pero filtrada por su baja precisión.

La relevancia actual del modelo radica en que combina un pipeline de preprocesado específico para sonar (filtro de speckle Lee + CLAHE), calibración de confianza por clase y un diseño pensado para edge computing, todo ello con licencia MIT y código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (ultralytics) |
| Parametros totales | no disponible (YOLOv8s base ~11,2 M, sin confirmar en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos, entrada 640x640) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (ONNX), INT8 (ONNX, roto y excluido) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo parte de `yolov8s.pt` preentrenado en COCO y se ajusta sobre un conjunto de ~4.775 tiles de entrenamiento procedentes de seis campañas reales de sonar de barrido lateral, más datos sintéticos generados proceduralmente. La clase `ghost_net` (redes fantasma) es 100 % sintética, ya que no existe un dataset público real suficiente. El entrenamiento se realizó con imágenes de 640x640, batch 16, 120 épocas solicitadas (early stop en 96), en una RTX 4050 laptop (~2,1 horas). Se aplicó preprocesado idéntico en entrenamiento e inferencia: filtro de speckle Lee + CLAHE. La aumentación está adaptada a sonar: sin color, sin flip vertical (para preservar la polaridad sombra-destello), mosaic 0,8, mixup 0,1, erasing 0,4, rotación ±10° y shear 2°. La pérdida combina CIoU, BCE y DFL.

Una innovación destacable es el módulo de calibración de confianza: se aplica escalado de Platt por clase (guardado en `calibrator.pkl`), que reduce el error de calibración esperado (ECE) de 0,052 a 0,037 en el conjunto de test. El pipeline de inferencia en edge incluye decodificación, NMS y calibración sin depender de PyTorch.

## Capacidades

- Detección de objetos en imágenes de sonar de barrido lateral: tuberías submarinas, pecios, redes fantasma y minas cilíndricas.
- Inferencia en CPU y GPU mediante ONNX Runtime, sin necesidad de PyTorch en producción.
- Preprocesado integrado (Lee + CLAHE) que debe aplicarse antes de la inferencia para mantener la precisión.
- Calibración de confianza por clase para interpretar las salidas como probabilidades.
- Compatible con el ecosistema Ultralytics para entrenamiento y predicción estándar.
- Diseñado para despliegue en dispositivos con recursos limitados (AUV, Jetson) gracias a la versión FP16.
- No soporta tool calling, generación de texto ni razonamiento multimodal; es exclusivamente un detector de objetos.

## Casos de uso

- Inspección autónoma de oleoductos y gasoductos submarinos: el modelo detecta tuberías en imágenes de sonar, permitiendo a un AUV seguir el trazado y alertar de obstrucciones o daños. Su alta precisión en esta clase (AP@50 0,984) lo hace adecuado para mantenimiento preventivo de infraestructuras críticas.
- Búsqueda y localización de pecios: con AP@50 0,302 en un test deliberadamente difícil, puede asistir a equipos de arqueología submarina o rescate en la identificación de restos de naufragios, reduciendo el tiempo de barrido manual.
- Monitorización de basura marina: la detección de redes fantasma (AP@50 0,995 en datos sintéticos) permite planificar campañas de limpieza del lecho marino, aunque se debe validar en datos reales antes de su uso operativo.
- Seguridad portuaria y defensa: la clase `mine_cylinder` (AP@50 0,424) puede emplearse en la detección de minas o artefactos cilíndricos en puertos o zonas de navegación, como apoyo a equipos de desminado.
- Cartografía de riesgos para tendido de cables submarinos: antes de instalar cables o tuberías, el modelo puede identificar obstáculos en el lecho marino a partir de sondeos SSS, mejorando la planificación de rutas.
- Investigación oceanográfica: los investigadores pueden usar el modelo como herramienta de anotación semiautomática en grandes conjuntos de datos de sonar, acelerando la creación de datasets etiquetados para otros fines.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (850 tiles):

| Metrica | Valor |
|---|---|
| mAP@50 | 0,580 |
| mAP@50-95 | 0,434 |
| Precision | 0,734 |
| Recall | 0,629 |
| Tasa de falsos positivos | 0,266 |

AP@50 por clase:

| Clase | AP@50 | Nota |
|---|---|---|
| ghost_net | 0,995 | datos sinteticos, no representa rendimiento real |
| submarine_pipeline | 0,984 | calidad de produccion |
| mine_cylinder | 0,424 | limite de datos reales |
| shipwreck | 0,302 | conjunto de test deliberadamente dificil |
| crab_pot | 0,193 | filtrada del producto |

La model card cita que en el mismo dataset (AI4Shipwrecks) un YOLOv8 vanilla alcanza mAP50 0,716 y el mejor método publicado (DFSE-YOLO) 0,755, mientras que el acuerdo entre anotadores humanos en pecios SSS es solo del 50-60 %. El resultado del modelo es inferior a esos valores, pero se atribuye a una partición de test más dura y a la dilución multiclase, no a un fallo de entrenamiento.

## Requisitos de hardware

- VRAM estimada: el modelo base YOLOv8s requiere ~2-4 GB en FP32 para inferencia a 640x640; la versión FP16 puede operar con ~1-2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 2060 o superior) para FP32; Jetson Nano, Jetson TX2 o Jetson Xavier para FP16.
- En CPU: la inferencia ONNX FP32 tarda ~90 ms por imagen en un procesador moderno con AVX-512; la versión INT8 es más lenta (164 ms) y no debe usarse.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Ultralytics (PyTorch), TensorRT (conversión desde ONNX), o integración en ROS para AUV.
- El modelo cabe en GPUs de consumo (RTX 3060, 4060, etc.) y en dispositivos edge como Jetson.

## Comparativa con modelos similares

| Modelo | Arquitectura | mAP@50 (AI4Shipwrecks) | Licencia | Despliegue edge |
|---|---|---|---|---|
| DRISHTI (este) | YOLOv8s | 0,580 (test propio, split duro) | MIT | Si (ONNX FP16) |
| YOLOv8 vanilla (baseline citado) | YOLOv8 | 0,716 | AGPL-3.0 | Si |
| DFSE-YOLO (mejor publicado) | YOLO modificado | 0,755 | no disponible | no disponible |

No se dispone de comparativas directas con otros modelos de detección de basura marina en sonar más allá de las citadas en la model card. La diferencia de mAP se explica por la partición de test más exigente y la inclusión de clases adicionales.

## Limitaciones y advertencias

- No transfiere entre campañas sin ajuste fino: en un sonar no visto (AURORA) produjo casi cero detecciones. Es necesario reentrenar con una pequeña muestra etiquetada del sonar objetivo.
- Las métricas de `ghost_net` son sintéticas sobre sintéticas; no representan el rendimiento en campo.
- La clase `crab_pot` no es utilizable (AP@50 0,193) y se ha filtrado del producto.
- La cuantización INT8 está rota: la precisión cae a 0,00 y es más lenta que FP32 en CPU sin VNNI/AVX-512. Solo usar FP32 o FP16.
- El preprocesado (Lee + CLAHE) es obligatorio; omitirlo degrada la precisión silenciosamente.
- El umbral de confianza recomendado es 0,10, ya que la calibración por clase realiza el corte real.
- No hay datos sobre sesgos demográficos ni riesgos de alucinación, al ser un detector visual; el riesgo principal es la confianza excesiva en clases con bajo AP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rehan9599/drishti-detector
- Repositorio de código: https://github.com/Rehan9599/Sonar-Drishti
- Documentación técnica completa: `docs/PROJECT_RECORD.html` en el repositorio de GitHub
