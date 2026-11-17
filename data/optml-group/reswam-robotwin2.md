# OPTML-Group/ResWAM-RoboTwin2

## Resumen

ResWAM-RoboTwin2 es un checkpoint oficial de política bimanual multi-tarea del modelo ResWAM (Residual World-Action Model), desarrollado por el grupo OPTML (Michigan State University, Cisco, University of Michigan e IBM Research). Se trata de un modelo de visión-lenguaje-acción (VLA) aumentado con predicción de futuro (world-action model) que resuelve el problema de aprender políticas robóticas robustas sin preentrenamiento externo en trayectorias de robots. El checkpoint se ha entrenado sobre las 50 tareas del benchmark RoboTwin 2.0 y alcanza un 93,8 % de éxito medio en 10.000 episodios de evaluación.

La innovación central es el *visual residual learning*: en lugar de supervisar la observación futura completa (que está dominada por fondo estático), el modelo aprende únicamente el cambio de características entre el frame actual y el futuro en un espacio DINOv3 congelado. Esto concentra el aprendizaje en el brazo robótico y los objetos manipulados, y permite reducir drásticamente el coste computacional frente a WAMs basados en grandes modelos de vídeo.

El modelo tiene 2,3B parámetros en total, con un backbone de texto de 16 capas (RynnBrain-1.1-2B), un DiT de doble rama de 0,5B y un DINOv3-B/16 congelado. Está pensado para despliegue en bucle cerrado en manipulación bimanual, con una latencia de 99,4 ms por chunk de acción en una RTX A6000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action con world-action model; backbone de texto RynnBrain-1.1-2B (16 capas) + DiT de doble rama (acción + residual) de 0,5B + DINOv3-B/16 congelado |
| Parametros totales | 2,3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en `model.pt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea robótica) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch), con `codec_statistics.json` y `resolved_config.json` |
| Horizonte de acción | 32 pasos (posición articular bimanual 14-D + pinzas); ejecuta 16 pasos con suavizado B-spline de grado 3 |
| Cómputo | 4,0 TFLOPs entrenamiento / 1,4 TFLOPs inferencia |
| Latencia | 99,4 ms por chunk de acción (10 pasos Euler, RTX A6000) |

## Arquitectura y entrenamiento

ResWAM combina un backbone de lenguaje RynnBrain-1.1-2B de 16 capas con un DiT ligero de 0,5B que contiene dos ramas entrenadas conjuntamente mediante *conditional flow matching*: una rama de acción que predice el chunk de acciones y una rama residual que predice el cambio de características en el espacio de un DINOv3-B/16 congelado. La supervisión residual sustituye a la supervisión de observación futura completa, lo que según los autores produce un objetivo de mayor rango y más concentrado espacialmente en el brazo y los objetos, además de reducir el coste de entrenamiento e inferencia.

El checkpoint se ha entrenado sobre las 50 tareas de RoboTwin 2.0 sin preentrenamiento en trayectorias robóticas externas al benchmark, lo que lo distingue de enfoques que dependen de grandes corpus de acciones de robot. El modelo genera chunks de 32 pasos de acción (14-D: posiciones articulares bimanuales más pinzas) y ejecuta 16 pasos con suavizado B-spline de grado 3. La decodificación de acciones usa 10 pasos de integración Euler.

## Capacidades

- Generación de acciones bimanuales de manipulación robótica a partir de observaciones visuales e instrucciones de tarea.
- Predicción de futuro mediante rama residual en espacio DINOv3, que informa la política sobre los cambios esperados en la escena.
- Política multi-tarea: un único checkpoint cubre las 50 tareas de RoboTwin 2.0.
- Control de posiciones articulares de 14 dimensiones (dos brazos más pinzas).
- Robustez ante aleatorización de dominio (94,0 % en condiciones Randomized frente a 93,6 % en Clean).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación bimanual multi-tarea en simulación: el checkpoint sirve como política de referencia para las 50 tareas de RoboTwin 2.0, útil para comparar nuevos métodos de VLA y WAM bajo el mismo protocolo de evaluación.
- Investigación en world-action models: la rama residual permite estudiar cómo la predicción de cambio (en lugar de observación completa) afecta al aprendizaje de políticas, con un coste de 4,0 TFLOPs de entrenamiento.
- Evaluación de robustez ante aleatorización de dominio: los resultados Clean (93,6 %) y Randomized (94,0 %) permiten medir la generalización de políticas ante cambios de iluminación, texturas y posiciones.
- Base para fine-tuning en tareas bimanuales específicas: al no requerir preentrenamiento externo en robots, el checkpoint es un punto de partida razonable para adaptar a nuevos conjuntos de tareas con demostraciones limitadas.
- Despliegue en bucle cerrado con requisitos de latencia estrictos: 99,4 ms por chunk en RTX A6000 y 1,4 TFLOPs de inferencia lo hacen viable en estaciones de trabajo con GPU única.
- Estudio de eficiencia computacional en robótica: comparar ResWAM con WAMs basados en grandes modelos de vídeo en términos de TFLOPs y latencia para el mismo rendimiento.
- Referencia para transferencia a robot real: el paper reporta resultados en Open, Put y Stack reales (80,0 % medio, +10,0 % sobre π0.5) a 92,7 ms de latencia, lo que sirve de guía para despliegues físicos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| RoboTwin 2.0, Clean (50 tareas, 100 trials/tarea) | 93,6 % éxito |
| RoboTwin 2.0, Randomized (50 tareas, 100 trials/tarea) | 94,0 % éxito |
| RoboTwin 2.0, media (10.000 episodios) | 93,8 % éxito |
| LIBERO-Plus | 81,1 % éxito |
| RoboDojo | 9,40 % éxito, 13,41 score |
| Robot real Open, Put, Stack | 80,0 % medio (+10,0 % sobre π0.5) |
| Latencia (chunk de acción, RTX A6000) | 99,4 ms |
| Latencia robot real | 92,7 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,3B parámetros en FP16 el peso ronda los 4,6 GB, más activaciones y el DINOv3-B/16 congelado.
- GPU de referencia en la model card: RTX A6000 (48 GB), con 99,4 ms por chunk de acción.
- Cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en FP16, aunque no se han publicado mediciones específicas.
- Despliegue: el repositorio oficial proporciona `scripts/eval/eval_robotwin2.py` para evaluación con RoboTwin; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política robótica).
- Throughput: no disponible más allá de la latencia por chunk indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RoboTwin 2.0 | Licencia | Preentrenamiento robótico externo |
|---|---|---|---|---|---|
| ResWAM-RoboTwin2 | 2,3B | no disponible | 93,8 % medio | MIT | No |
| π0.5 | no disponible | no disponible | no disponible (referencia en robot real: ResWAM +10,0 %) | no disponible | no disponible |
| WAMs basados en modelos de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos completos de parámetros, contexto y resultados de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en manipulación bimanual en RoboTwin 2.0; no es un modelo de propósito general ni un LLM conversacional.
- Los resultados de 93,8 % corresponden al benchmark simulado RoboTwin 2.0; el rendimiento en otros entornos o robots requiere validación adicional.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de tareas y entornos simulados puede no generalizar a configuraciones físicas distintas.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de predicciones de acción incorrectas en escenarios fuera de distribución.
- No se especifican idiomas soportados ni longitud de contexto; la interfaz es mediante instrucciones de tarea, no conversacional.
- Licencia MIT permite uso comercial, pero el modelo depende de componentes con licencias propias (RynnBrain-1.1-2B, DINOv3-B/16) cuyos términos deben verificarse por separado.
- El checkpoint se distribuye como `model.pt` único de 9,3 GB; no hay variantes cuantizadas oficiales, lo que limita el despliegue en hardware con poca VRAM.
- Latencia medida en RTX A6000; en GPUs de consumo puede ser mayor y comprometer el control en bucle cerrado.

## Enlaces

- Hugging Face: https://huggingface.co/OPTML-Group/ResWAM-RoboTwin2
- Paper (arXiv): https://arxiv.org/abs/2611.19559
- Página del proyecto: https://chongyu-fan.netlify.app/posts/reswam/
- Código: https://github.com/OPTML-Group/ResWAM
- Colección HF: https://huggingface.co/collections/OPTML-Group/reswam-6af8906dc9b6f21539b30934
