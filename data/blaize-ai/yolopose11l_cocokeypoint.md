# Blaize-AI/YOLOPOSE11l_COCOKeypoint

## Resumen

YOLOPOSE11l_COCOKeypoint es una adaptación del modelo YOLO11l-pose de Ultralytics, especializada en estimación de pose (detección de keypoints humanos) y optimizada por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador para detección de puntos clave del cuerpo humano, entrenado sobre el dataset COCO Keypoints 2017 y convertido al formato propietario `.bm` que consume el hardware Graph Streaming Processor (GSP) de Blaize.

El modelo resuelve el problema de la inferencia de pose en el borde (edge AI) con requisitos de latencia y consumo energético reducidos, aprovechando la arquitectura de grafos del GSP. Se distribuye en dos variantes con resolución de entrada 640×384 y 640×640, ambas en cuantización AMP (mezcla de INT8 y BF16), lo que permite elegir entre un mayor rendimiento o una mayor precisión según el caso de uso.

Su relevancia es acotada: no es un modelo de propósito general ni se puede ejecutar con frameworks estándar como PyTorch o ONNX Runtime sin conversión, ya que los pesos están empaquetados para el SDK Picasso y el acelerador Xplorer. Resulta de interés para integradores que ya trabajan con hardware Blaize y necesitan una tubería de pose detection lista para producción en dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11l-pose (Ultralytics), red convolucional para detección de keypoints; optimizada para GSP de Blaize |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8, BF16 y AMP (mezcla INT8/BF16); las variantes publicadas usan AMP |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (formato propietario del Blaize Picasso SDK) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11l-pose de Ultralytics, una red convolucional de una sola etapa que predice simultáneamente cajas delimitadoras de personas y keypoints (puntos clave del esqueleto humano). El modelo original se entrenó sobre COCO Keypoints 2017 (licencia CC-BY-4.0) y se distribuye en PyTorch; la versión de Blaize-AI conserva los pesos entrenados y aplica optimizaciones específicas de hardware para el GSP, sin modificar el código fuente del modelo según indica la propia model card.

No se detalla en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de COCO Keypoints 2017, ni si hubo técnicas de ajuste fino adicionales. La innovación técnica destacable es la compilación al formato `.bm` y la cuantización AMP (INT8 + BF16) para ejecución sobre el acelerador Blaize Xplorer, que emplea una arquitectura de grafos (Graph Streaming Processor) orientada a eficiencia energética y baja latencia en inferencia de borde.

## Capacidades

- Detección de personas y estimación de pose con keypoints del esqueleto humano sobre imágenes.
- Dos resoluciones de entrada: 640×384 (mayor throughput) y 640×640 (mayor detalle espacial).
- Cuantización AMP que combina INT8 para velocidad y BF16 para precisión en capas sensibles.
- Ejecución optimizada sobre aceleradores Blaize Xplorer mediante el SDK Picasso.
- Inspección y validación del modelo con la utilidad `blaize-modeltool`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Análisis de pose en videovigilancia de borde: el modelo se ejecuta sobre el acelerador Xplorer en cámaras o pasarelas locales, detectando keypoints de personas sin enviar vídeo a la nube, con la variante 640×384 para maximizar fotogramas por segundo.
- Monitorización deportiva y biomecánica: la variante 640×640 permite estimar con mayor detalle la posición de articulaciones en grabaciones de entrenamiento, útil para análisis de técnica en gimnasios o centros de rendimiento.
- Ergonomía y prevención de riesgos laborales: integrado en estaciones de trabajo con cámara, el modelo detecta posturas y keypoints para alertar sobre posiciones inadecuadas en tiempo real, aprovechando la baja latencia del GSP.
- Rehabilitación y fisioterapia asistida: seguimiento de ejercicios de movilidad mediante la estimación de keypoints, con inferencia local que preserva la privacidad del paciente al no transmitir imágenes fuera del dispositivo.
- Interacción persona-máquina y realidad aumentada: uso de los keypoints para control gestual o superposición de avatares en aplicaciones de RA que corren sobre hardware de borde Blaize.
- Seguridad y aforo en espacios: detección de personas junto con su pose para estimar ocupación y comportamiento en recintos, desplegando el modelo en pasarelas Xplorer con la variante de menor resolución para priorizar caudal.
- Robótica de servicio: percepción de personas y sus articulaciones para navegación social y evitación de colisiones en robots que embarcan aceleradores Blaize.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un acelerador Blaize Xplorer; no está pensado para ejecución directa en GPU convencional.
- Requiere el Blaize Picasso SDK instalado y configurado para cargar los ficheros `.bm`.
- VRAM estimada: no disponible (el modelo se ejecuta en el acelerador GSP, no en memoria de GPU estándar).
- GPU recomendadas: no aplica; el hardware objetivo es el acelerador Blaize Xplorer.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; los pesos `.bm` no son directamente utilizables en CUDA sin reconversión desde el modelo original de Ultralytics.
- Opciones de despliegue: SDK Picasso y utilidad `blaize-modeltool`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOPOSE11l_COCOKeypoint (Blaize) | no disponible | imagen 640×384 o 640×640 | `.bm` (Picasso SDK) | AGPL-3.0 | HuggingFace, requiere hardware Blaize |
| YOLO11l-pose (Ultralytics, original) | no disponible | imagen configurable | PyTorch / ONNX | AGPL-3.0 o licencia enterprise | GitHub Ultralytics |
| Otros modelos de pose sobre COCO Keypoints (p. ej. variantes de la familia YOLO-pose) | no disponible | imagen variable | PyTorch / ONNX | según autor | repositorios públicos |

La comparación cuantitativa de precisión (mAP de keypoints) y latencia frente a alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; no debe evaluarse como un LLM.
- Dependencia total del hardware Blaize Xplorer y del SDK Picasso: los ficheros `.bm` no son portables a otras plataformas sin reconversión.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente derivado; para uso propietario habría que evaluar la licencia enterprise de Ultralytics sobre el modelo original.
- El dataset de entrenamiento (COCO Keypoints 2017) presenta sesgos demográficos y de escena propios de COCO, lo que puede reducir la precisión en poblaciones, posturas u oclusiones poco representadas.
- Riesgo de falsos negativos en personas parcialmente ocluidas, con ropa voluminosa o en condiciones de iluminación adversas.
- No se documentan métricas de precisión ni latencia para las variantes publicadas, por lo que la validación en el caso de uso concreto es responsabilidad del integrador.
- Blaize declara que el modelo es contenido de terceros y no ofrece garantías sobre su exactitud, integridad o no infracción de derechos de propiedad intelectual.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLOPOSE11l_COCOKeypoint
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Blaize: https://www.blaize.com
