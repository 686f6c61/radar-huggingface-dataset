# Blaize-AI/YOLO11l_COCO

## Resumen

YOLO11l_COCO es una versión optimizada del detector de objetos YOLO11 Large de Ultralytics, adaptada por Blaize-AI para su ejecución sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador para detección de objetos entrenado sobre el dataset COCO 2017, con 80 clases estándar. El repositorio contiene exclusivamente artefactos compilados en formato `.bm` (Blaize Model), no pesos en safetensors ni GGUF.

La relevancia de este modelo radica en que demuestra el flujo de despliegue de YOLO11 en hardware de inferencia en el borde (edge AI) con arquitectura GSP (Graph Streaming Processor), una arquitectura basada en grafos orientada a eficiencia energética y baja latencia. El modelo está pensado para integradores que ya dispongan de hardware Blaize y necesiten un detector de objetos precompilado con distintas resoluciones de entrada y modos de cuantización (INT8, BF16 y AMP).

El tamaño del repositorio es de aproximadamente 0,1 GB y no se proporcionan parámetros totales del modelo ni métricas de precisión (mAP) en la información disponible. La licencia es AGPL-3.0, heredada del modelo original de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 Large (detector de objetos, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8, BF16, AMP (mixed precision INT8+BF16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize Model, artefacto compilado para GSP) |

Variantes incluidas en el repositorio:

| Variante | Cuantizacion | Resolucion de entrada (W×H) | Fichero |
|---|---|---|---|
| YOLO11l_COCO_amp_416_416 | AMP | 416×416 | `YOLO11l_COCO_amp_416_416.bm` |
| YOLO11l_COCO_amp_640_384 | AMP | 640×384 | `YOLO11l_COCO_amp_640_384.bm` |
| YOLO11l_COCO_amp_640_640 | AMP | 640×640 | `YOLO11l_COCO_amp_640_640.bm` |

## Arquitectura y entrenamiento

El modelo base es YOLO11 Large de Ultralytics, un detector de objetos de una sola etapa con arquitectura CNN. La versión publicada por Blaize-AI no incluye el modelo en PyTorch, sino artefactos compilados y optimizados específicamente para el Graph Streaming Processor (GSP) de Blaize, una arquitectura basada en grafos de datos que busca maximizar el rendimiento por vatio y reducir la latencia en inferencia en el borde. Las optimizaciones son específicas de hardware y no modifican el código fuente del modelo original, según indica la model card.

El entrenamiento se realizó sobre COCO 2017 (licencia CC-BY-4.0, atribución al COCO Consortium). No se especifican en la información disponible el número de tokens, épocas, composición exacta del dataset, ni si hubo técnicas de aumento de datos o ajuste fino adicional. Tampoco se documentan innovaciones técnicas propias más allá de la compilación y cuantización para el hardware GSP.

## Capacidades

- Detección de objetos en imágenes con las 80 clases de COCO 2017.
- Inferencia optimizada para el acelerador Blaize Xplorer mediante el SDK Picasso.
- Tres modos de cuantización: INT8 (máxima velocidad y menor tamaño), BF16 (máxima precisión) y AMP (equilibrio entre precisión y velocidad).
- Tres resoluciones de entrada precompiladas: 416×416, 640×384 y 640×640, lo que permite ajustar el coste computacional al caso de uso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No se documentan capacidades de segmentación, pose, clasificación ni detección abierta de vocabulario.

## Casos de uso

- Vigilancia y videovigilancia en el borde: el modelo puede ejecutarse en un acelerador Blaize Xplorer junto a una cámara IP para detectar personas, vehículos u objetos en tiempo real sin enviar vídeo a la nube, reduciendo latencia y coste de ancho de banda.
- Control de aforo y analítica de personas: con la variante 640×640 se puede procesar fotogramas de cámaras de acceso para contar personas y detectar aglomeraciones, aprovechando la eficiencia energética del GSP.
- Inspección industrial automatizada: detección de defectos o componentes en líneas de producción con la variante 416×416, priorizando velocidad de inferencia sobre resolución.
- Sistemas de asistencia a la conducción (ADAS) de bajo consumo: detección de peatones, vehículos y señales en entornos embebidos con la variante 640×384, que ofrece un compromiso entre campo de visión horizontal y coste computacional.
- Robótica y drones: integración del detector en plataformas con restricciones de potencia y refrigeración, donde el GSP permite inferencia local sin GPU dedicada.
- Análisis de imágenes por lotes en el borde: procesamiento de imágenes de satélite o de inspección agrícola en dispositivos Blaize desplegados en campo, con la variante AMP para equilibrar precisión y rendimiento.
- Prototipado de pipelines de visión con Picasso SDK: uso del `blaize-modeltool` para inspeccionar y validar el modelo antes de integrarlo en una aplicación de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, latencia ni throughput para ninguna de las variantes.

## Requisitos de hardware

- Acelerador Blaize Xplorer AI: requisito imprescindible; el modelo no puede ejecutarse en GPU convencional ni en CPU, ya que los artefactos `.bm` son específicos del GSP.
- SDK Blaize Picasso instalado y configurado para cargar y ejecutar los modelos.
- VRAM estimada: no aplica; el modelo se ejecuta sobre memoria del acelerador GSP, no sobre VRAM de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no, el formato `.bm` no es compatible con CUDA, ROCm ni Metal.
- Opciones de despliegue: exclusivamente mediante Blaize Picasso SDK y el acelerador Xplorer; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto | Licencia | Formato | Hardware |
|---|---|---|---|---|---|---|
| YOLO11l_COCO (Blaize-AI) | no disponible | 416×416, 640×384, 640×640 | no aplica | AGPL-3.0 | `.bm` | Blaize Xplorer (GSP) |
| YOLO11l (Ultralytics original) | no disponible | configurable | no aplica | AGPL-3.0 / Enterprise | PyTorch, ONNX | GPU/CPU genéricos |
| YOLOv8l (Ultralytics) | no disponible | configurable | no aplica | AGPL-3.0 / Enterprise | PyTorch, ONNX | GPU/CPU genéricos |
| RT-DETR (Baidu) | no disponible | configurable | no aplica | Apache 2.0 | PyTorch | GPU/CPU genéricos |

La comparativa se limita a la categoría de detectores de objetos de una etapa o transformer-based. No se dispone de métricas de precisión para comparar rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo dependiente de hardware propietario: solo se ejecuta en aceleradores Blaize Xplorer con el SDK Picasso; no es portable a otras plataformas.
- No se publican métricas de precisión (mAP) ni de latencia, por lo que no es posible evaluar su calidad frente al YOLO11l original.
- Entrenado únicamente sobre COCO 2017 (80 clases); no detecta clases fuera de ese vocabulario y puede tener sesgos propios del dataset (por ejemplo, sobrerrepresentación de ciertas categorías y contextos).
- Riesgo de falsos positivos y negativos en condiciones de iluminación adversa, oclusión o dominios visuales distintos al de COCO.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente derivado; Ultralytics ofrece una licencia enterprise alternativa, pero no se indica si cubre esta versión optimizada por Blaize.
- La model card exime a Blaize de cualquier responsabilidad sobre el contenido de terceros y no ofrece garantías de no infracción de propiedad intelectual.
- No hay soporte documentado para fine-tuning sobre esta versión compilada; el reentrenamiento requeriría volver al modelo original de Ultralytics.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLO11l_COCO
- Modelo original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO: https://cocodataset.org
- Blaize: https://www.blaize.com
