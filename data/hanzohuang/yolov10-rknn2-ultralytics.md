# HanzoHuang/YOLOv10-RKNN2-Ultralytics

## Resumen

YOLOv10-RKNN2-Ultralytics es un repositorio de modelos YOLOv10 exportados al formato RKNN2 para su ejecución sobre NPU de Rockchip, concretamente en los SoC RK3576 y RK3588. Lo publica el usuario HanzoHuang en Hugging Face y no introduce un modelo nuevo: su valor está en ofrecer los checkpoints oficiales de Ultralytics ya convertidos y cuantizados, listos para desplegarse en placas con acelerador neuronal Rockchip. El paquete cubre las seis variantes de detección de YOLOv10 (n, s, m, b, l y x) en FP16 e INT8, compiladas con RKNN Toolkit2 2.3.2 y Ultralytics 8.4.184.

El problema que resuelve es puramente operativo: convertir un checkpoint PyTorch de YOLOv10 a un grafo RKNN funcional requiere fijar versiones del toolkit, calibrar la cuantización INT8 con un dataset representativo y gestionar los metadatos de normalización de coordenadas. Este repositorio empaqueta todo ese trabajo, incluyendo los scripts de conversión, los hashes de calibración y un manifiesto con checksums, de modo que un integrador puede descargar `model.rknn` y `metadata.yaml` y ejecutar detección en el dispositivo sin repetir el proceso.

Es relevante para quienes despliegan visión artificial en el borde (edge) con hardware Rockchip de bajo consumo: placas como RK3588 integran una NPU que, con modelos en INT8, permite inferencia en tiempo real a 640x640 píxeles sin GPU dedicada. El repositorio tiene 761 descargas y un tamaño de 1,0 GB, coherente con alojar múltiples variantes en dos precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (detector de objetos CNN, Ultralytics) exportado a RKNN2 |
| Parametros totales | no disponible (depende de la variante n/s/m/b/l/x; no se especifican cifras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640x640 por defecto) |
| Tipos de cuantizacion | FP16 e INT8 (calibración con COCO128, límite de 128 imágenes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`model.rknn`) + `metadata.yaml`; checkpoints de origen en PyTorch (.pt) en `source/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv10, un detector de objetos de una sola etapa basado en CNN con diseño *end-to-end* (elimina la necesidad de NMS en la inferencia mediante asignación consistente dual). Este repositorio no entrena ni modifica el modelo: parte de los checkpoints oficiales de Ultralytics y los convierte mediante RKNN Toolkit2 2.3.2, fijando Ultralytics 8.4.184 como versión de exportación. La conversión transforma el grafo y, en el caso INT8, aplica cuantización post-entrenamiento con calibración sobre COCO128.

Los datos de entrenamiento originales son los de YOLOv10 de Ultralytics (no detallados en la información disponible). El repositorio sí documenta el proceso de reproducción: scripts en `source/convert-model.py`, versiones de paquetes y hashes de calibración, además de un `manifest.json` con los modelos disponibles y sus checksums. Una particularidad técnica relevante es que las salidas INT8 entregan coordenadas de caja normalizadas, por lo que el `metadata.yaml` debe indicar `coordinates: normalized`; tratarlas como píxeles provoca que no se detecten cajas.

## Capacidades

- Detección de objetos en imágenes con las seis variantes de YOLOv10 (n, s, m, b, l, x), en FP16 e INT8.
- Inferencia acelerada por NPU en SoC Rockchip RK3576 y RK3588.
- Salida de cajas delimitadoras con coordenadas normalizadas en las variantes INT8 (requiere metadatos adecuados).
- Ejecución en dispositivos de borde sin GPU dedicada.
- Reproducibilidad del pipeline de conversión y cuantización mediante scripts y hashes incluidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.

## Casos de uso

- Videovigilancia en el borde: desplegar la variante n o s en INT8 sobre una placa RK3588 para detección de personas y vehículos en flujos de cámara RTSP, aprovechando la NPU para mantener latencia baja sin servidor central.
- Control de aforo y analítica de retail: contar personas en tiempo real con YOLOv10s/m en RK3576, procesando localmente para evitar enviar vídeo a la nube.
- Inspección industrial: detección de defectos o piezas en líneas de producción con la variante m o b, donde la cuantización INT8 reduce el coste del hardware por puesto de inspección.
- Robótica y drones: integrar YOLOv10n en un companion computer con RK3588 para percepción embebida con restricciones estrictas de consumo energético.
- Sistemas de aparcamiento inteligente: detección de plazas ocupadas con la variante s en FP16, priorizando precisión sobre velocidad cuando el hardware lo permite.
- Prototipado rápido de producto: usar los scripts de `source/` para reexportar con otro tamaño de entrada (`--imgsz`) o distinto dataset de calibración, validando la precisión antes de fijar la variante definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de Rockchip RK3576 y RK3588. El repositorio no está pensado para GPU NVIDIA ni CPU genérica.
- Memoria: no se especifica VRAM ni memoria NPU requerida por variante; el tamaño del repo (1,0 GB) incluye todas las variantes y no refleja el peso de un único modelo.
- GPU de consumo: no aplica; el despliegue es sobre NPU Rockchip, no sobre tarjetas gráficas.
- Despliegue: runtime RKNN en el dispositivo, con RKNN Toolkit2 2.3.2 para la conversión y Ultralytics 8.4.184 para el export. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | Variantes | Cuantización | Licencia |
|---|---|---|---|---|---|
| YOLOv10-RKNN2-Ultralytics (este) | RKNN | NPU RK3576 / RK3588 | n, s, m, b, l, x | FP16, INT8 | AGPL-3.0 |
| YOLOv10-RKNN2 (HanzoHuang) | RKNN | Rockchip (model zoo y exports personalizados) | no disponible | no disponible | AGPL-3.0 |
| Checkpoints oficiales YOLOv10 (Ultralytics) | PyTorch (.pt) | GPU / CPU | n, s, m, b, l, x | FP32/FP16 | AGPL-3.0 |

La comparativa con otros detectores exportados a RKNN (por ejemplo, variantes de YOLOv8 o YOLO11 para Rockchip) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso comercial en servicios de red exige cumplir las obligaciones de copyleft de la AGPL; conviene revisarlo con asesoría legal antes de producción.
- Solo funciona en NPU Rockchip RK3576 y RK3588; no es portable a otras plataformas sin reconversión.
- Las variantes INT8 devuelven coordenadas normalizadas; un `metadata.yaml` mal configurado o su ausencia provoca que no se detecten cajas.
- La cuantización INT8 puede degradar la precisión frente a FP16, especialmente en objetos pequeños o clases poco representadas en COCO128.
- Es un detector de objetos: no ofrece razonamiento, lenguaje, tool calling ni capacidades multimodales más allá de la visión.
- No se detallan sesgos del modelo base ni métricas de precisión por variante en la información disponible.
- Los checkpoints de origen son de Ultralytics; cualquier uso debe respetar también las condiciones de dicho proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics
- Repositorio relacionado (model zoo y exports personalizados): https://huggingface.co/HanzoHuang/YOLOv10-RKNN2
- Ultralytics 8.4.184 (PyPI): https://pypi.org/project/ultralytics/8.4.184/#files
- RKNN Toolkit2 v2.3.2: https://github.com/airockchip/rknn-toolkit2/tree/v2.3.2
- Manifiesto de modelos: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/blob/main/manifest.json
- Directorio de conversión: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/tree/main/source
- Licencia: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/blob/main/LICENSE
- Origen de checkpoints: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2-Ultralytics/blob/main/source/weights.json
