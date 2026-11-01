# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat

## Resumen
SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y estado proprioceptivo. Esta ficha concreta es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `edgarcancinoe`, orientado a la tarea de regar plantas ("Water the left/middle/right plant") sobre un robot tipo Panda. El modelo consume dos cámaras RGB de 256x256 y un vector de estado de 8 dimensiones, y produce acciones de 7 dimensiones (típicamente 6 grados de libertad más pinza).

La relevancia de esta variante radica en su pipeline de entrenamiento: parte de un dataset de 944 episodios y 177.825 frames a 20 FPS, e incorpora una fase de DAgger (intervenciones humanas correctivas) que aparece reflejada en el nombre del repositorio y del dataset. Con 604,9 millones de parámetros y pesos en safetensors, es un modelo pensado para inferencia en hardware de consumo, no para despliegue en clústeres de GPU de datacenter.

Es importante subrayar que se trata de una política de imitación específica para una tarea y un robot concretos, no de un modelo de propósito general. La model card no reporta resultados de evaluación en robot real, por lo que su rendimiento debe validarse empíricamente antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844); detalles internos de capas y atención no disponibles en la model card |
| Parametros totales | 604.934.176 (604,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset están en inglés: "Water the left plant", etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria / pipeline | lerobot, pipeline_tag: robotics |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | panda |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 1,2 GB |
| Dataset de entrenamiento | edgarcancinoe/water_pour_dagger1_cheat (944 episodios, 177.825 frames, 20 FPS) |
| Descargas / likes | 29 descargas, 0 likes |

## Arquitectura y entrenamiento
SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones, optimizada para reducir el coste computacional frente a VLA de mayor tamaño y permitir despliegue en hardware de consumo. La model card de esta variante no detalla el número de capas, el modelo de lenguaje subyacente ni el mecanismo exacto de fusión visión-lenguaje-acción, por lo que esos datos deben consultarse en el paper de SmolVLA (arXiv:2506.01844). La política recibe dos vistas de cámara a 256x256 y un vector de estado de 8 dimensiones, y emite un vector de acción de 7 dimensiones por paso.

El entrenamiento se realizó mediante fine-tuning desde `lerobot/smolvla_base` con LeRobot 0.6.1: 8.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset consta de 944 episodios y 177.825 frames grabados a 20 FPS sobre tres tareas de riego (planta izquierda, central y derecha). El nombre del repositorio y del dataset indica una fase de DAgger (intervenciones correctivas humanas), lo que sugiere un entrenamiento iterativo de imitación con correcciones sobre los errores del modelo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas de imitación robótica).

## Capacidades
- Control robótico de manipulación extremo a extremo: genera comandos de acción de 7 dimensiones (6 DoF más pinza) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa dos flujos RGB de 256x256 (`image` e `image2`), lo que permite estimar la posición del brazo y del objeto desde dos puntos de vista.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Water the left plant", "Water the middle plant", "Water the right plant"), permitiendo seleccionar el objetivo entre tres plantas.
- Ejecución de políticas de imitación entrenadas con DAgger: el modelo ha visto estados de recuperación derivados de intervenciones humanas, lo que en principio mejora la robustez ante desviaciones.
- Inferencia en hardware de consumo: el tamaño de 604,9 M de parámetros y el formato safetensors permiten ejecución en GPU de gama media, en línea con el objetivo de diseño de SmolVLA.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general o audio; el modelo está especializado exclusivamente en la política de control entrenada.

## Casos de uso
- Riego automatizado de plantas en laboratorio: el modelo ejecuta la tarea "Water the left/middle/right plant" sobre un robot Panda con dos cámaras, seleccionando el objetivo según la instrucción de texto. Es adecuado porque el dataset cubre exactamente esas tres variantes de tarea.
- Investigación en imitación con DAgger: sirve como punto de partida reproducible para estudiar cómo las correcciones humanas afectan a la robustez de una política VLA, dado que el dataset y la configuración de entrenamiento están publicados.
- Benchmark de referencia para SmolVLA en manipulación doméstica: permite comparar variantes de fine-tuning (por ejemplo, con y sin DAgger) sobre la misma tarea de riego y el mismo robot.
- Prototipado de pipelines LeRobot: útil para validar el flujo `lerobot-rollout` → `lerobot-train` → evaluación en un caso concreto antes de escalar a otras tareas.
- Docencia y demostraciones de VLA: con 604,9 M de parámetros y 1,2 GB de pesos, se puede desplegar en un equipo con GPU de consumo para clases o talleres de robótica de imitación.
- Base para fine-tuning en tareas de vertido o manipulación de líquidos: el dataset `water_pour_dagger1_cheat` y la política entrenada pueden servir de inicialización para variantes con otros recipientes u objetivos.
- Validación de infraestructura de inferencia robótica: permite medir latencia y throughput de una política VLA pequeña en el hardware objetivo antes de invertir en modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de pérdida de entrenamiento, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 604,9 M de parámetros en FP32 los pesos ocupan aproximadamente 2,4 GB, y en FP16/BF16 alrededor de 1,2 GB, a lo que hay que sumar activaciones y buffers de las dos cámaras de 256x256.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4070) debería ser suficiente para inferencia en FP16, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí, dado el objetivo de diseño de SmolVLA de desplegarse en hardware de consumo; sin cifras oficiales de latencia.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--strategy.type=base` y `--policy.path=edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas de acción.
- Latencia y throughput: no disponibles. La frecuencia de control del robot y el frame rate del dataset (20 FPS) dan una referencia del orden de magnitud esperado, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smolvla water_pour DAgger1) | 604,9 M | No disponible | Riego de plantas con robot Panda | Apache 2.0 | Hugging Face, 29 descargas |
| lerobot/smolvla_base | No disponible en la informacion proporcionada | No disponible | VLA base para fine-tuning | No disponible en la informacion proporcionada | Hugging Face (modelo base citado) |
| Otras políticas VLA de mayor tamano (p. ej. familias tipo OpenVLA) | No disponible en la informacion proporcionada | No disponible | Manipulación general | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa de rendimiento con alternativas. La comparación se limita al modelo base del que deriva y a la categoría general de políticas VLA.

## Limitaciones y advertencias
- Especialización extrema: la política está entrenada únicamente para las tareas "Water the left plant", "Water the middle plant" y "Water the right plant" sobre un robot Panda con dos cámaras; no generaliza a otras tareas, objetos o configuraciones de robot sin nuevo fine-tuning.
- Sin evaluación publicada: la model card declara que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real y el comportamiento ante perturbaciones (iluminación, posiciones de objeto, distractores).
- Dependencia de la configuración de sensores: los nombres y la resolución de las cámaras (`image`, `image2` a 256x256) y la dimensionalidad del estado (8) y de la acción (7) deben coincidir exactamente con el entorno de despliegue; cualquier cambio invalida la política.
- Riesgo de sobreajuste al dataset: con 944 episodios sobre tres tareas muy concretas, es probable que el modelo sea sensible a cambios en la escena no representados en los datos; el propio nombre del dataset ("cheat") sugiere posibles atajos aprendidos que conviene auditar.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; para producción robótica es necesario validar seguridad y comportamiento antes de desplegar.
- Sin datos de sesgos, alucinación en el sentido lingüístico ni limitaciones de contexto: al ser una política de acción, los riesgos relevantes son de seguridad física del robot y de fallo silencioso en la tarea, no de generación de texto.
- Repositorio con muy baja tracción (29 descargas, 0 likes, creado y actualizado el mismo día): no hay evidencia de validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dagger1_cheat
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dagger1_cheat
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
