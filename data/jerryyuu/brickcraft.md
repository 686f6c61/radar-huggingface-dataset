# JerryYuu/BrickCraft

## Resumen

BrickCraft es un conjunto de checkpoints de segmentación de instancias basados en YOLOv8n-seg, publicados por JerryYuu como parte del pipeline de ensamblaje robótico de un solo brazo del proyecto BrickCraft. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de dos pesos especializados de visión por computador entrenados para tareas concretas dentro de una cadena de manipulación robótica: alinear la escena con la estructura de ladrillos ya ensamblada y localizar el ladrillo objetivo junto con la pinza del robot.

El repositorio incluye únicamente dos ficheros de pesos (`seg_structure.pt` y `seg_brick_gripper.pt`), ambos derivados de la arquitectura YOLOv8n-seg de Ultralytics, con metadatos que registran la versión 8.4.8 de la librería. El autor advierte explícitamente de que esta publicación no constituye la pila de ejecución robótica completa: los checkpoints de SAM-2 y de la política de difusión Brick Diffusion no están incluidos, por lo que los ficheros por sí solos no permiten reproducir el sistema de ensamblaje de extremo a extremo.

La relevancia del artefacto es acotada y de nicho: sirve como referencia reproducible para investigadores que quieran replicar o extender el pipeline descrito en el paper asociado (arXiv:2605.07605), o como punto de partida para tareas de segmentación ladrillo-pinza en entornos de laboratorio. No hay información pública sobre volumen de entrenamiento, composición del dataset ni métricas de rendimiento en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-seg (Ultralytics), segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (checkpoints `.pt` en precisión original; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

Los dos checkpoints emplean la variante nano de la familia YOLOv8 con cabeza de segmentación (`-seg`), una arquitectura CNN de detección y segmentación de instancias en una sola etapa. El modelo `seg_structure.pt` está configurado con una única clase (`0: object`) orientada a segmentar la estructura de ladrillos ensamblada para el alineamiento de escena. El modelo `seg_brick_gripper.pt` tiene dos clases (`0: brick`, `1: gripper`) y se emplea para localizar simultáneamente el ladrillo objetivo y la pinza del robot.

No se dispone de información sobre el dataset de entrenamiento (número de imágenes, composición, aumentos de datos), sobre el régimen de entrenamiento (épocas, función de pérdida, hiperparámetros) ni sobre si se aplicaron técnicas de destilación o ajuste fino desde pesos preentrenados de Ultralytics. La model card solo indica que los ficheros se preservan sin modificación respecto al entrenamiento original y que se verificó la integridad ZIP y los checksums SHA256 durante el empaquetado; no se realizaron pruebas de precisión de inferencia, ejecución en CUDA ni operación física del robot durante el empaquetado.

## Capacidades

- Segmentación de instancias de la estructura de ladrillos ensamblada (clase única `object`) para alineamiento de escena.
- Segmentación simultánea del ladrillo objetivo y de la pinza del robot (clases `brick` y `gripper`).
- Integración con la librería Ultralytics (versión de referencia 8.4.8) para carga e inferencia.
- Salida de máscaras por instancia, adecuada para estimación de pose relativa ladrillo-pinza en pipelines de agarre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Alineamiento de escena en ensamblaje robótico: `seg_structure.pt` segmenta la estructura de ladrillos ya montada para que el pipeline corrija la pose de la cámara o del robot antes de planificar el siguiente movimiento.
- Detección de punto de agarre: `seg_brick_gripper.pt` proporciona máscaras del ladrillo objetivo y de la pinza, lo que permite estimar la pose relativa y calcular la aproximación de agarre en un brazo único.
- Replicación de experimentos del paper BrickCraft: investigadores que quieran reproducir los resultados de arXiv:2605.07605 pueden cargar estos checkpoints con la configuración JSON documentada y comparar sus propias ejecuciones.
- Prototipado de pipelines de manipulación en laboratorio: sirve como bloque de percepción listo para usar en configuraciones de un solo brazo con cámara cenital o en muñeca.
- Docencia y formación en robótica: por su tamaño nano y su licencia AGPL-3.0, es adecuado para prácticas de segmentación aplicada a manipulación sin requerir hardware de altas prestaciones.
- Benchmark interno de segmentación ladrillo-pinza: útil como línea base para comparar modelos de segmentación propios en esta tarea específica, aunque el autor no publique métricas de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, IoU, latencia ni comparaciones con otros modelos, y advierte de que no se probó la precisión de inferencia durante el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la variante nano de YOLOv8-seg se espera un consumo bajo (del orden de cientos de MB a ~1-2 GB según resolución de entrada y lote), pero el autor no lo documenta.
- GPU recomendadas: no disponible; al ser un modelo nano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente en la práctica, aunque no hay confirmación oficial.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño nano, pero no verificado por el autor.
- Opciones de despliegue: la vía documentada es la librería Ultralytics (versión de referencia 8.4.8) con los ficheros `.pt`; no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrickCraft (estos checkpoints) | YOLOv8n-seg | Segmentación estructura y ladrillo-pinza | Imagen (resolución no documentada) | AGPL-3.0 | Hugging Face, 2 checkpoints |
| YOLOv8n-seg (Ultralytics, genérico) | YOLOv8n-seg | Segmentación de instancias COCO (80 clases) | Imagen | AGPL-3.0 | Público, ampliamente usado |
| SAM-2 | Segmentador promptable | Segmentación genérica | Imagen/vídeo con prompts | no disponible en esta ficha | Público, no incluido en este repo |
| Brick Diffusion (política del paper) | Política de difusión | Control robótico | no disponible | no disponible | No incluido en este repo |

La comparación directa con alternativas de la misma categoría (segmentadores específicos para manipulación robótica) no está disponible en la información proporcionada. Frente a YOLOv8n-seg genérico, la diferencia es el ajuste a dos tareas concretas (estructura y ladrillo-pinza) y la reducción del espacio de clases; frente a SAM-2, el enfoque es mucho más ligero y especializado, a costa de perder generalidad.

## Limitaciones y advertencias

- El repositorio contiene solo dos checkpoints YOLO; no incluye SAM-2 ni la política Brick Diffusion, por lo que no constituye una pila de ejecución robótica completa.
- No se han publicado métricas de precisión, latencia ni robustez; el autor confirma que no se probó la precisión de inferencia ni la ejecución en CUDA durante el empaquetado.
- La compatibilidad con versiones de Ultralytics distintas de la 8.4.8 no está verificada.
- El tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el tamaño reportado es inexacto; conviene verificar la descarga antes de usarlos.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte para uso en red y para obras derivadas; cualquier uso comercial en producto o servicio debe revisarse con cuidado.
- Sin información sobre sesgos del dataset de entrenamiento (iluminación, tipos de ladrillo, configuraciones de cámara), lo que limita la generalización fuera del entorno de laboratorio del paper.
- No apto para tareas de lenguaje, razonamiento, código, matemáticas ni visión general; su alcance es estrictamente la segmentación de las clases definidas.
- Los identificadores de clase están fijados (`0: object` y `0: brick`, `1: gripper`); reutilizar los pesos en otro pipeline requiere respetar ese mapeo.

## Enlaces

- Hugging Face: https://huggingface.co/JerryYuu/BrickCraft
- Paper: https://arxiv.org/abs/2605.07605
- Web del proyecto: https://intelligent-control-lab.github.io/BrickCraft/
- Licencia Ultralytics: https://www.ultralytics.com/license
