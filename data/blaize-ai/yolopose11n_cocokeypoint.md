# Blaize-AI/YOLOPOSE11n_COCOKeypoint

## Resumen

YOLOPOSE11n_COCOKeypoint es una implementación optimizada del modelo YOLO11n-pose de Ultralytics, especializada en detección de poses humanas mediante estimación de keypoints del dataset COCO Keypoints 2017. El modelo ha sido adaptado por Blaize-AI para su despliegue en aceleradores de IA Blaize Xplorer, utilizando el SDK Picasso y el procesador Graph Streaming Processor (GSP) de Blaize, una arquitectura de hardware basada en grafos orientada a inferencia eficiente en el borde.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un modelo de visión por computador para pose estimation, empaquetado en formato propietario `.bm` para hardware específico. Esto implica que no puede ejecutarse en GPUs convencionales ni mediante frameworks estándar como PyTorch o ONNX Runtime sin el SDK correspondiente.

El repositorio incluye dos variantes de cuantización AMP con resoluciones de entrada de 640×384 y 640×640, y el tamaño del repositorio es de 0.0 GB, lo que sugiere que los archivos de pesos podrían no estar presentes o son de tamaño despreciable en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-pose (CNN, detector de keypoints) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8, BF16, AMP (mixed precision) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize model, propietario) |

## Arquitectura y entrenamiento

El modelo base es YOLO11n-pose de Ultralytics, una red neuronal convolucional de la familia YOLO versión 11 en su variante "nano", diseñada para detección de personas y estimación de keypoints en una sola pasada. La arquitectura original se distribuye en PyTorch desde el repositorio de Ultralytics y ha sido entrenada sobre COCO Keypoints 2017, un dataset de anotaciones de puntos clave corporales bajo licencia CC-BY-4.0.

Blaize-AI no ha modificado el código fuente del modelo, sino que ha realizado optimizaciones específicas de hardware para el GSP, empaquetando los pesos en formato `.bm` ejecutable mediante el SDK Picasso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de COCO Keypoints 2017, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de visión de este tipo). Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no corresponden a esta familia de modelos.

## Capacidades

- Detección de personas y estimación de keypoints corporales (pose estimation) sobre imágenes.
- Salida de coordenadas de puntos clave según el esquema de COCO Keypoints (17 keypoints por persona).
- Ejecución optimizada en hardware Blaize Xplorer mediante el SDK Picasso.
- Soporte de cuantización INT8, BF16 y AMP para balancear precisión y velocidad.
- Dos resoluciones de entrada: 640×384 y 640×640.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, visión generativa, audio ni thinking mode.

## Casos de uso

- Análisis de pose en tiempo real en el borde: el modelo puede ejecutarse en aceleradores Blaize Xplorer para estimar keypoints en flujos de vídeo de vigilancia o domótica, aprovechando la eficiencia energética del GSP.
- Monitorización deportiva y biomecánica: integración en sistemas embebidos que analicen la postura de atletas en tiempo real con resolución 640×640 para mayor precisión en articulaciones.
- Interacción persona-máquina en robótica: detección de poses para control gestual o seguimiento de operarios en entornos industriales, usando la variante 640×384 para menor latencia.
- Aplicaciones de realidad aumentada en dispositivos de borde: superposición de esqueletos o avatares sobre la persona detectada, con inferencia local sin depender de la nube.
- Seguridad y ergonomía laboral: detección de posturas inadecuadas o caídas en entornos de trabajo mediante cámaras conectadas a hardware Blaize.
- Análisis de vídeo en ciudades inteligentes: conteo y seguimiento de peatones con estimación de pose para estudios de movilidad, desplegado en nodos de borde con GSP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer AI (GSP).
- SDK requerido: Blaize Picasso SDK instalado y configurado.
- VRAM estimada: no disponible (no se ejecuta en GPU convencional; depende de la memoria del acelerador Blaize).
- GPU recomendadas: no aplica; el modelo no está pensado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; el formato `.bm` es propietario de Blaize.
- Opciones de despliegue: únicamente mediante el SDK Picasso y el comando `blaize-modeltool` para inspección.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Hardware |
|---|---|---|---|---|---|
| YOLOPOSE11n_COCOKeypoint (Blaize) | no disponible | no aplica | 640×384 / 640×640 | AGPL-3.0 | Blaize Xplorer (GSP) |
| YOLO11n-pose (Ultralytics original) | no disponible | no aplica | configurable | AGPL-3.0 / Enterprise | GPU/CPU estándar |
| MediaPipe Pose | no disponible | no aplica | 256×256 aprox. | Apache 2.0 | CPU/GPU/móvil |
| OpenPose | no disponible | no aplica | variable | no disponible | GPU |

La comparativa se limita a modelos de pose estimation de propósito general; los datos de parámetros y rendimiento de las alternativas no están disponibles en la información proporcionada para este modelo concreto.

## Limitaciones y advertencias

- El modelo está empaquetado en formato `.bm` propietario y solo puede ejecutarse en hardware Blaize Xplorer con el SDK Picasso; no es portable a otros entornos.
- La licencia AGPL-3.0 impone obligaciones de copyleft para uso en red y distribución; para uso comercial propietario podría requerirse la licencia enterprise de Ultralytics.
- Al estar basado en COCO Keypoints 2017, puede presentar sesgos de representación del dataset (poses, géneros, contextos limitados) y menor precisión en poses atípicas u oclusiones.
- Riesgo de falsos negativos en personas de pequeño tamaño o en escenas con múltiples individuos solapados.
- El tamaño del repositorio es de 0.0 GB, lo que podría indicar que los archivos de pesos no están disponibles o son de acceso restringido; conviene verificar antes de integrar.
- No se especifican garantías de precisión tras la cuantización INT8/BF16/AMP; el rendimiento puede degradarse respecto al modelo original en PyTorch.
- Blaize declara explícitamente que no revisa ni respalda el modelo original y no ofrece garantías sobre el contenido de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Blaize-AI/YOLOPOSE11n_COCOKeypoint
- Repositorio original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Blaize: https://www.blaize.com
