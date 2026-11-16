# JackPickett/act_keys

## Resumen

`JackPickett/act_keys` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo desarrolla el usuario JackPickett y está empaquetado con la librería LeRobot de Hugging Face, por lo que sigue el formato estándar de políticas robóticas de ese ecosistema. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular y una imagen de muñeca) a comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta y muy acotada: "Put the keys in the bowl" (meter las llaves en el cuenco), ejecutada por un robot de tipo `so_follower` (brazo SO-100/SO-101 de bajo coste) con una única cámara en la muñeca. Se entrenó sobre 20 episodios de teleoperación (17.520 fotogramas a 30 FPS) del dataset `JackPickett/third_arm_keys_wrist`. Con 51.668.614 parámetros (aproximadamente 51,7 M) y un repositorio de 0,2 GB, es un modelo pequeño y ligero, pensado para inferencia en tiempo real en hardware modesto.

Su relevancia es la de un artefacto de investigación reproducible más que la de un modelo de propósito general: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`) sobre una tarea de manipulación real. No hay resultados de evaluación publicados, licencia declarada ni benchmarks, por lo que debe tratarse como una política experimental de un solo autor y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación con decodificación de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto en el runtime) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato de política LeRobot) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras de una sola vez. Esto reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (procesa la imagen de muñeca de 3x480x640), un codificador del estado articular de 6 dimensiones y un transformer que genera el chunk de acciones de 6 dimensiones. El modelo tiene 51.668.614 parámetros y sigue la implementación de ACT incluida en LeRobot 0.7.1.

El entrenamiento se realizó sobre el dataset `JackPickett/third_arm_keys_wrist`: 20 episodios, 17.520 fotogramas a 30 FPS, una única tarea ("Put the keys in the bowl") y una única cámara (`wrist`). La configuración declarada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el número de tokens ni composición de datos adicional, ni si hubo etapas de RLHF/DPO (no aplica en este paradigma). Tampoco se detallan innovaciones más allá de las propias de ACT (predicción de chunks y, en la formulación original, regularización por temporal ensembling).

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen de muñeca.
- Ejecución de una tarea única y específica: "Put the keys in the bowl" sobre robot `so_follower`.
- Predicción de chunks de acción, lo que permite movimientos más suaves y menor deriva que políticas paso a paso.
- Inferencia en tiempo real a 30 FPS, coherente con la frecuencia de grabación del dataset.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de la tarea de referencia: desplegar la política con `lerobot-rollout --policy.path=JackPickett/act_keys` sobre un brazo `so_follower` con cámara de muñeca para recoger llaves y depositarlas en un cuenco. Es el uso directo y único para el que fue entrenada.
- Banco de pruebas de imitación: usar el modelo como línea base para comparar variantes de ACT, cambios de resolución de cámara o número de episodios en una tarea de pick-and-place sencilla.
- Validación del pipeline LeRobot: servir como ejemplo reproducible del flujo completo (dataset en Hub, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) en talleres o cursos de robótica de bajo coste.
- Prototipado de manipulación con SO-100/SO-101: al tener 51,7 M de parámetros, puede ejecutarse en GPUs de consumo y en ordenadores de laboratorio, lo que facilita iterar sobre hardware asequible.
- Reentrenamiento con datos propios: partir de esta configuración (20.000 pasos, batch 8, lr 1e-5) como plantilla para grabar nuevos episodios y adaptar la política a otra tarea similar con el mismo robot y cámara.
- Estudio de generalización limitada: evaluar cómo se degrada la política ante cambios de iluminación, posición de objetos o distracciones, dado que no hay resultados de evaluación publicados y el dataset es de solo 20 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (repo de 0,2 GB), la huella de pesos es del orden de cientos de MB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con soporte CUDA (por ejemplo, RTX 3060/4060 o superiores) es suficiente. El entrenamiento declarado usa `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros); no se especifican requisitos mínimos exactos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan exports a vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles; el dataset y la inferencia operan a 30 FPS, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas ACT para SO-100/SO-101) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 20 episodios de un único operador y una única configuración de cámara, la política heredará los sesgos de esa demostración (posiciones, iluminación, estilo de teleoperación).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no procesa lenguaje; la tarea se pasa como cadena en el runtime, pero el modelo no la interpreta semánticamente.
- Restricciones de licencia: la licencia figura como "no disponible" y la model card la marca como "[More Information Needed]"; no debe asumirse uso comercial permitido sin confirmación del autor.
- Caveat de producción: sin resultados de evaluación publicados, sin tasa de éxito medida y con un dataset muy pequeño, no es adecuado para despliegues reales sin una validación exhaustiva en el robot objetivo.
- Dependencia de hardware: entrenada para `so_follower` con cámara `wrist`; los nombres de cámara deben coincidir con las claves de observación y el robot debe ser del mismo tipo.
- Sin garantías de generalización: cambios de objeto, posición, iluminación o robot pueden degradar el comportamiento de forma no cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackPickett/act_keys
- Dataset de entrenamiento: https://huggingface.co/datasets/JackPickett/third_arm_keys_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JackPickett/third_arm_keys_wrist
