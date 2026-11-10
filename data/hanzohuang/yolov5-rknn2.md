# HanzoHuang/YOLOv5-RKNN2

## Resumen

YOLOv5-RKNN2 es una colección de modelos YOLOv5 convertidos al formato RKNN2 para su ejecución en las NPU de los SoC Rockchip RK3576 y RK3588. El repositorio, publicado por HanzoHuang, no entrena un modelo nuevo: parte de los pesos oficiales de clasificación de la release YOLOv5 v7.0 de Ultralytics y los recompila mediante RKNN Toolkit2 2.3.2, exportando primero un grafo ONNX y compilándolo después para el acelerador hardware de Rockchip.

La aportación principal es práctica: ofrece variantes n, s y m en precisión FP16 e INT8, con los ficheros organizados por variante, chip y precisión en `models/classify/<variant>/<chip>/<precision>/`. Incluye además el manifiesto de hashes, las URLs originales de los pesos y el script de conversión, lo que facilita reproducir el proceso y verificar la integridad de los artefactos.

Es relevante para equipos que despliegan visión por computador en dispositivos de borde con Rockchip, ya que evita el trabajo de conversión y calibración. El repositorio ocupa 0,2 GB y se distribuye bajo GPL-3.0, heredada de la release original de YOLOv5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5 (red convolucional de una etapa) en formato RKNN2 |
| Parametros totales | no disponible (variantes n, s y m de YOLOv5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (compilado con RKNN Toolkit2 2.3.2); grafo intermedio ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv5, una red convolucional de detección de una sola etapa. En este repositorio se emplean los pesos de clasificación de la release v7.0 de Ultralytics, por lo que el pipeline declarado es `image-classification`. No hay entrenamiento propio: la conversión parte de los pesos oficiales, exporta un grafo ONNX y lo compila con RKNN Toolkit2 2.3.2 para las NPU de RK3576 y RK3588.

El proceso de conversión está documentado en `source/convert-extended.py`, que admite `--yolov5-source` para apuntar a un checkout del código v7.0. La cuantización INT8 utiliza la lista de calibración COCO128 incluida en `source/calibration.json`. El repositorio conserva los hashes y URLs originales de los pesos en `source` y publica un `manifest.json` con los hashes de todas las salidas, lo que permite verificar la reproducibilidad de los artefactos.

## Capacidades

- Clasificación de imágenes mediante los pesos de clasificación de YOLOv5 v7.0.
- Ejecución acelerada por NPU en SoC Rockchip RK3576 y RK3588 en formato RKNN2.
- Variantes de tamaño n, s y m para ajustar el equilibrio entre precisión y coste computacional.
- Dos precisiones disponibles (FP16 e INT8) para elegir entre exactitud y rendimiento.
- Conversión reproducible a partir de ONNX con RKNN Toolkit2 2.3.2.
- Verificación de integridad mediante hashes en `manifest.json`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Visión embebida en RK3588: desplegar la variante INT8 en la NPU del SoC para clasificación de imágenes en tiempo real dentro de un dispositivo de borde, aprovechando la compilación ya realizada para ese chip.
- Visión embebida en RK3576: usar los binarios específicos de este SoC en equipos con menores requisitos de cómputo, seleccionando la variante n o s según el presupuesto de latencia.
- Inspección industrial en línea: integrar el modelo en una cámara o controlador basado en Rockchip para clasificar piezas o detectar defectos visuales en la propia línea de producción, sin depender de la nube.
- Prototipado rápido con RKNN Toolkit2: partir del script `convert-extended.py` y del grafo ONNX para adaptar la conversión a otros modelos YOLOv5 propios y reutilizar la calibración COCO128 como referencia.
- Sistemas de vigilancia o domótica local: clasificación de imágenes en dispositivos de bajo consumo con requisitos de privacidad, manteniendo los datos en el propio hardware.
- Evaluación comparativa FP16 frente a INT8: medir en el dispositivo la pérdida de exactitud de la cuantización INT8 respecto a FP16 con la misma variante y chip antes de decidir el despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de los SoC Rockchip RK3576 y RK3588. No está pensado para GPU convencionales.
- VRAM estimada: no aplica; el modelo se ejecuta en la NPU integrada del SoC, no en una GPU discreta.
- GPU recomendadas: no aplica (A100, H100 o RTX 4090 no son el destino de estos binarios).
- Cabe en hardware de consumo: sí, en placas y dispositivos con RK3576 o RK3588; no se distribuyen binarios para otras plataformas.
- Opciones de despliegue: runtime RKNN de Rockchip con los ficheros de `models/classify/<variant>/<chip>/<precision>/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv5-RKNN2 (este) | variantes n, s y m | no aplica | RKNN2 (FP16/INT8) | GPL-3.0 | Hugging Face, 0 descargas |
| Pesos originales YOLOv5 v7.0 (Ultralytics) | variantes n, s y m | no aplica | PyTorch / ONNX | GPL-3.0 | GitHub Ultralytics |
| Otras conversiones del Rockchip Model Zoo | no disponible | no aplica | RKNN2 | según modelo origen | Zoo de Rockchip |

La comparación directa con otros modelos de clasificación no está disponible en la información proporcionada. Frente a los pesos originales de Ultralytics, la diferencia es el formato ya compilado para NPU Rockchip y la calibración INT8 incluida.

## Limitaciones y advertencias

- Solo se distribuyen binarios para RK3576 y RK3588; no son ejecutables en GPU ni CPU convencionales sin reconversión.
- La cuantización INT8 puede degradar la exactitud respecto a FP16; conviene validarla en el dispositivo antes de producción.
- La licencia GPL-3.0 es copyleft y condiciona la distribución de obras derivadas; revisar su compatibilidad con el producto antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria documentada.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; al ser un modelo de visión, estos criterios no aplican del mismo modo.
- El pipeline declarado es `image-classification`, aunque YOLOv5 se asocia habitualmente a detección; verificar qué tarea exacta realizan los pesos incluidos antes de integrarlos.
- No se publican métricas de latencia, throughput ni precisión en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HanzoHuang/YOLOv5-RKNN2
- Release original YOLOv5 v7.0: https://github.com/ultralytics/yolov5/releases/tag/v7.0
- Código fuente YOLOv5 v7.0: https://github.com/ultralytics/yolov5/tree/v7.0
- Licencia GPL-3.0 del repositorio: https://huggingface.co/HanzoHuang/YOLOv5-RKNN2/blob/main/LICENSE
- Manifiesto de hashes: https://huggingface.co/HanzoHuang/YOLOv5-RKNN2/blob/main/manifest.json
- Script de conversión: https://huggingface.co/HanzoHuang/YOLOv5-RKNN2/blob/main/source/convert-extended.py
- Lista de calibración COCO128: https://huggingface.co/HanzoHuang/YOLOv5-RKNN2/blob/main/source/calibration.json
