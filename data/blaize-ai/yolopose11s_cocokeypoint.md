# Blaize-AI/YOLOPOSE11s_COCOKeypoint

## Resumen

YOLOPOSE11s_COCOKeypoint es una versión optimizada del modelo YOLO11s-pose de Ultralytics, adaptada por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. El modelo realiza estimación de pose humana (detección de keypoints) sobre imágenes, empleando el conjunto de datos COCO Keypoints 2017 para su entrenamiento original. No se trata de un modelo de lenguaje ni de un transformer generativo: es un modelo de visión por computador convolucional orientado a inferencia en el borde (edge AI).

La relevancia de esta ficha radica en que el repositorio no contiene pesos en formato estándar (PyTorch, ONNX o safetensors), sino artefactos binarios `.bm` compilados específicamente para el Graph Streaming Processor (GSP) de Blaize. Esto lo hace inutilizable fuera del ecosistema hardware/software de Blaize, pero potencialmente muy eficiente en términos de latencia y consumo energético dentro de él. El tamaño del repositorio reportado es de 0.0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que la métrica no se ha actualizado.

La licencia AGPL-3.0 del modelo derivado, junto con la doble licencia del modelo original de Ultralytics (AGPL-3.0-only o licencia enterprise), impone restricciones importantes para uso comercial cerrado. El modelo se publicó en octubre de 2026 y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO11s-pose de Ultralytics), optimizada para Blaize GSP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8/BF16) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (artefacto compilado para Blaize Picasso SDK) |

Variantes incluidas en el repositorio:

| Variante | Cuantizacion | Resolucion de entrada (W×H) | Fichero |
|---|---|---|---|
| YOLOPOSE11s_COCOKeypoint_amp_640_384 | AMP | 640×384 | `YOLOPOSE11s_COCOKeypoint_amp_640_384.bm` |
| YOLOPOSE11s_COCOKeypoint_amp_640_640 | AMP | 640×640 | `YOLOPOSE11s_COCOKeypoint_amp_640_640.bm` |

## Arquitectura y entrenamiento

El modelo base es YOLO11s-pose, un detector de keypoints de la familia YOLO11 de Ultralytics, con arquitectura convolucional de una sola etapa (single-stage) que predice simultáneamente cajas delimitadoras de personas y un conjunto de keypoints corporales. La variante "s" (small) es la versión de tamaño pequeño dentro de la familia YOLO11. El entrenamiento original se realizó en PyTorch sobre COCO Keypoints 2017 (licencia CC-BY-4.0), un dataset de anotación de 17 keypoints por persona en imágenes de escenas cotidianas.

Blaize-AI no ha reentrenado el modelo, sino que ha realizado optimizaciones específicas de hardware para el Graph Streaming Processor (GSP) mediante el SDK Picasso, generando artefactos `.bm` compilados. El proceso de conversión incluye cuantización INT8 con escalado de punto fijo, BF16 para máxima precisión y AMP como compromiso entre ambas. La arquitectura GSP de Blaize está diseñada para minimizar latencia y consumo en inferencia en el borde, lo que encaja con el perfil de un detector de pose en tiempo real. No se dispone de información sobre número de tokens de entrenamiento (no aplica), composición detallada del dataset más allá de COCO Keypoints 2017, ni sobre técnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Detección de personas y estimación de pose humana con 17 keypoints por instancia (formato COCO).
- Inferencia de una sola etapa sobre imágenes estáticas o flujos de vídeo (dependiendo de la integración con el SDK).
- Ejecución optimizada sobre aceleradores Blaize Xplorer con el SDK Picasso, con soporte de cuantización INT8, BF16 y AMP.
- Dos resoluciones de entrada precompiladas: 640×384 y 640×640.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión generativa, audio ni modo "thinking".
- Inspección del artefacto mediante la utilidad `blaize-modeltool`.

## Casos de uso

- Análisis de postura en entornos industriales: el modelo puede estimar la pose de operarios en tiempo real sobre aceleradores Xplorer de bajo consumo, permitiendo detectar posturas ergonómicamente incorrectas o riesgos de seguridad sin depender de la nube.
- Monitorización de seguridad en el borde: integrado en cámaras IP con acelerador Blaize, el modelo detecta presencia y postura de personas en zonas restringidas, con latencia reducida gracias a la arquitectura GSP y a la cuantización INT8.
- Aplicaciones de fitness y rehabilitación: estimación de keypoints en tiempo real para corregir ejercicios o evaluar rangos de movimiento, aprovechando la resolución 640×384 para reducir cómputo en dispositivos empotrados.
- Análisis deportivo en vídeo: procesamiento de secuencias de vídeo para extraer esqueletos y analizar técnica de movimiento, con la variante 640×640 cuando se requiere mayor detalle espacial.
- Interacción persona-ordenador sin contacto: control gestual o seguimiento corporal en quioscos y sistemas empotrados que requieran inferencia local sin enviar vídeo a servidores externos.
- Robótica y automatización: estimación de pose humana para robots colaborativos que deban adaptar su comportamiento a la posición de las personas en el entorno, con la ventaja de la inferencia local en el acelerador.
- Investigación en visión por computador: banco de pruebas para comparar el rendimiento de YOLO11s-pose en hardware GSP frente a GPU, evaluando el impacto de INT8/BF16/AMP en precisión de keypoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, OKS), latencia, throughput ni comparativas numéricas con otras variantes o hardwares.

## Requisitos de hardware

- Requiere un acelerador de IA Blaize Xplorer; no es ejecutable en GPU convencional ni en CPU con los artefactos `.bm` proporcionados.
- Requiere el SDK Picasso de Blaize instalado y configurado para cargar y ejecutar los modelos.
- VRAM estimada: no disponible (no aplica en el sentido convencional; el modelo se ejecuta en memoria del acelerador GSP).
- GPU recomendadas: no aplica; el modelo no está pensado para GPU NVIDIA/AMD.
- Compatibilidad con GPU de consumo: no; los artefactos son específicos para hardware Blaize.
- Opciones de despliegue: exclusivamente el SDK Picasso de Blaize y la utilidad `blaize-modeltool`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Blaize-AI/YOLOPOSE11s_COCOKeypoint | no disponible | 640×384 y 640×640 | `.bm` (Blaize) | AGPL-3.0 | Blaize Xplorer (GSP) |
| Ultralytics YOLO11s-pose (original) | no disponible en la informacion | resolución configurable | PyTorch / ONNX / etc. | AGPL-3.0-only o enterprise | GPU, CPU, edge variado |
| Otras variantes YOLO-pose de la comunidad | no disponible | variable | variable | variable | variable |

La comparación directa con alternativas de la misma categoría (por ejemplo, YOLOv8-pose o MediaPipe Pose) no puede completarse con datos numéricos porque la información disponible no incluye parámetros, métricas ni latencias. La diferencia principal frente al modelo original de Ultralytics es el formato de salida (`.bm` frente a PyTorch/ONNX) y el hardware objetivo (GSP frente a GPU/CPU).

## Limitaciones y advertencias

- El modelo solo es ejecutable con hardware Blaize Xplorer y el SDK Picasso; los artefactos `.bm` no son portables a otros entornos.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el código fuente de la aplicación que lo integra; para uso comercial cerrado sería necesaria una licencia alternativa de Ultralytics (enterprise), que no se incluye en este repositorio.
- El modelo original de Ultralytics está bajo AGPL-3.0-only o licencia enterprise; el usuario debe verificar el cumplimiento de ambas licencias (la del derivado y la del original).
- Riesgo de sesgos y errores propios de COCO Keypoints 2017: el dataset no representa de forma equilibrada todas las poses, oclusiones, condiciones de iluminación ni diversidad corporal; la precisión puede degradarse en escenarios no representados.
- Posibles alucinaciones en el sentido de detecciones falsas o keypoints mal localizados en imágenes con oclusiones severas, multitud o resoluciones muy distintas a las de entrenamiento.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- El tamaño del repositorio reportado (0.0 GB) y la ausencia de descargas/likes sugieren que los artefactos podrían no estar efectivamente disponibles o que la métrica no refleja el contenido real; conviene verificar la integridad de los ficheros antes de integrarlos en producción.
- Blaize declara explícitamente que no revisa, aprueba ni garantiza los modelos de terceros, y no ofrece garantías sobre infracción de propiedad intelectual.
- No se proporcionan métricas de precisión ni latencia, por lo que no es posible evaluar el impacto de la cuantización INT8/AMP en la calidad de los keypoints sin realizar pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blaize-AI/YOLOPOSE11s_COCOKeypoint
- Modelo original (Ultralytics): https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Blaize: https://www.blaize.com
