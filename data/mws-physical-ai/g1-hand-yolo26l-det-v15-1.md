# mws-physical-ai/g1-hand-yolo26l-det-v15-1

## Resumen
El modelo `g1-hand-yolo26l-det-v15-1`, publicado por el usuario `mws-physical-ai`, es un detector de objetos basado en la arquitectura YOLO26l especializado en la localización de las manos izquierda y derecha del robot humanoide Unitree G1 a partir de las imágenes capturadas por la cámara de su cabeza. No se trata de un modelo generativo ni de un modelo de lenguaje: es un componente de percepción visual pensado para integrarse en el pipeline de control de un robot físico, donde la posición de las manos es una señal crítica para tareas de manipulación, teleoperación o imitación.

El modelo se entrena sobre un conjunto de datos propio del autor, `mws-physical-ai/g1-robohamer-gt-v15-1`, compuesto por 8 186 fotogramas anotados con cajas delimitadoras (7 870 de entrenamiento y 316 de validación). Este dataset combina una base (`gt_v15`) con un banco de poses de orientación (`run_orient_1`) que incluye configuraciones de manos cruzadas, apiladas y con la palma hacia arriba, lo que amplía la cobertura de poses más allá de la configuración neutra.

La relevancia del modelo es acotada pero clara: cubre una necesidad muy específica dentro de la robótica humanoide open source, la detección robusta de manos en primera persona desde la cámara del propio robot, con métricas de validación muy altas (mAP50 de 0,989) y un tamaño de repositorio reducido (0,1 GB) que facilita su despliegue en el hardware de a bordo. No hay información pública sobre benchmarks estándar, idiomas ni pipeline de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26l (detector de objetos de una etapa, familia YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | `.pt` (PyTorch, checkpoints `best.pt` y `last.pt`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura YOLO26l, un detector de objetos de una sola etapa que predice cajas delimitadoras directamente sobre la imagen de entrada. La tarea se formula como detección de dos clases (mano izquierda y mano derecha) sobre fotogramas de la cámara de la cabeza del Unitree G1. No se dispone de información detallada sobre el número de parámetros, la composición exacta de la arquitectura interna (backbone, neck, cabeza) ni las técnicas de aumento de datos aplicadas más allá de lo indicado en la model card.

El entrenamiento se realizó sobre el dataset `mws-physical-ai/g1-robohamer-gt-v15-1`, con 8 186 fotogramas en total (7 870 de entrenamiento y 316 de validación). El dataset combina la base `gt_v15` con el banco de poses `run_orient_1`, que aporta ejemplos de manos cruzadas, apiladas y con la palma hacia arriba. No se menciona el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector visual. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades
- Detección de cajas delimitadoras de mano izquierda y mano derecha en imágenes RGB procedentes de la cámara de la cabeza del Unitree G1.
- Robustez ante poses variadas de las manos: configuración neutra, manos cruzadas, manos apiladas y palma hacia arriba, según la composición del dataset de entrenamiento.
- Inferencia en tiempo real sobre fotogramas individuales, adecuada para su integración en bucles de control robótico.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la detección visual de manos.

## Casos de uso
- Teleoperación de manos del Unitree G1: el detector proporciona la posición de las manos del robot en la imagen de la cámara de la cabeza, lo que permite cerrar el bucle de control visual para que el operador remoto vea y ajuste la pose de las manos en tiempo real.
- Aprendizaje por imitación desde demostraciones: las cajas detectadas pueden usarse como señal auxiliar para alinear demostraciones humanas con las poses del robot, facilitando el entrenamiento de políticas de manipulación.
- Monitorización de seguridad en entornos colaborativos: detectar si las manos del robot entran en zonas de riesgo o se aproximan a personas, activando paradas de emergencia o límites de velocidad.
- Automatización de tareas de agarre: la posición de las manos permite verificar que la pinza o la mano se aproxima correctamente al objeto antes de ejecutar el cierre, reduciendo fallos en tareas de pick-and-place.
- Anotación asistida de nuevos datasets: el modelo puede preetiquetar fotogramas de la cámara del G1 para acelerar la creación de nuevos conjuntos de datos de manos, revisando y corrigiendo las detecciones manualmente.
- Investigación en percepción egocéntrica para humanoides: sirve como componente base para estudiar la detección de manos en primera persona en plataformas Unitree G1, comparando variantes de YOLO o estrategias de aumento de datos.
- Depuración de políticas de control: al visualizar las detecciones sobre los fotogramas de validación (`val_batch*_pred.jpg`), los ingenieros pueden identificar desalineaciones entre la pose real de las manos y la percibida por el sistema.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre el conjunto de validación (316 fotogramas):

| Metrica | Valor |
|---|---|
| Box mAP50 | 0,989 |
| Box mAP50-95 | 0,930 |
| Precision | 0,982 |
| Recall | 0,981 |

No se han publicado resultados de benchmarks estándar (COCO, etc.) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la variante `l` de YOLO26, se espera un consumo moderado, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Un detector YOLO de escala `l` suele ejecutarse en GPUs de consumo (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100), pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, aunque no confirmada en la model card.
- Opciones de despliegue: los pesos están en formato PyTorch (`.pt`), por lo que el despliegue natural es mediante la librería Ultralytics o un runtime compatible con YOLO. No se mencionan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras variantes de YOLO, detectores de manos genéricos ni modelos específicos para el Unitree G1.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-hand-yolo26l-det-v15-1 | no disponible | no aplica | mAP50 0,989 (val propio) | other | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente sobre fotogramas de la cámara de la cabeza del Unitree G1; su rendimiento fuera de esa cámara, ese robot o condiciones de iluminación distintas a las del dataset no está garantizado.
- El conjunto de validación es pequeño (316 fotogramas), por lo que las métricas publicadas pueden no reflejar el comportamiento en dominios nuevos.
- No se documentan sesgos específicos, pero al ser un detector visual puede fallar ante oclusiones, manos fuera de cuadro, guantes, iluminación adversa o fondos no representados en el dataset.
- La licencia es `other`, sin texto adicional en la model card; es imprescindible contactar con el autor o revisar los términos exactos antes de un uso comercial.
- No se especifican restricciones de uso, atribución ni redistribución más allá de la etiqueta `license: other`.
- Al ser un modelo de percepción, no genera texto ni razona; no debe evaluarse con benchmarks de lenguaje ni usarse para tareas de comprensión semántica.
- No hay información sobre el pipeline de HuggingFace, lo que puede complicar la integración automática en herramientas que esperan un pipeline estándar.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mws-physical-ai/g1-hand-yolo26l-det-v15-1
- Dataset de entrenamiento: https://huggingface.co/datasets/mws-physical-ai/g1-robohamer-gt-v15-1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
