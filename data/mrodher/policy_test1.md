# mrodher/policy_test1

## Resumen

`mrodher/policy_test1` es una política de aprendizaje por imitación para robótica basada en el método Action Chunking with Transformers (ACT), entrenada y publicada con la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos cámaras (muñeca y cenital) para producir comandos de acción de 6 dimensiones. El repositorio tiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB.

El modelo resuelve una única tarea de manipulación —"Put the beige piece on the aruco"— sobre un robot de tipo `so_follower` (SO-101 o similar de la familia LeRobot). Se entrenó a partir de 120 episodios de teleoperación (38.274 fotogramas a 30 FPS) y 20.000 pasos de optimización. Su relevancia es la de un artefacto de referencia: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento ACT, publicación en el Hub y despliegue con `lerobot-rollout`), no un modelo de propósito general.

Conviene subrayar que el autor no ha publicado resultados de evaluación en robot real ni una licencia explícita. Es, por tanto, un modelo de demostración y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por fotograma) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo robótico; la tarea se especifica en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Dataset de entrenamiento | `mrodher/record-test_1_20261119_113637` (120 episodios, 38.274 fotogramas, 30 FPS) |
| Tarea | "Put the beige piece on the aruco" |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de un único paso, lo que reduce el error de compounding y suaviza la ejecución. La arquitectura combina un codificador visual (procesa las dos cámaras de 480x640) con un transformer que fusiona la observación del estado articular (6 dimensiones) y genera una secuencia de acciones de 6 dimensiones. El modelo se apoya en la implementación de LeRobot 0.6.2.

El entrenamiento se realizó sobre 120 episodios teleoperados (38.274 fotogramas a 30 FPS) durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumentos de datos; es aprendizaje supervisado puro a partir de demostraciones. Tampoco se especifica la composición exacta del dataset más allá de la tarea y las cámaras utilizadas.

## Capacidades

- Control visomotor de un robot `so_follower` para una tarea concreta de manipulación (colocar una pieza beige sobre un marcador ArUco).
- Fusión de dos vistas de cámara (muñeca y cenital) con el estado articular de 6 grados de libertad.
- Predicción de chunks de acción, lo que permite ejecutar movimientos más estables que un control paso a paso.
- Ejecución autónoma mediante `lerobot-rollout` con duración configurable.
- Reentrenamiento reproducible con `lerobot-train` a partir de un dataset compatible.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Automatización de una celda de pick-and-place**: el modelo puede ejecutar la tarea de colocar la pieza beige sobre el ArUco en un banco de pruebas con el robot `so_follower` y las dos cámaras configuradas, sirviendo como base para prototipos de ensamblaje.
- **Validación de un pipeline de LeRobot**: útil como referencia para comprobar que la instalación, la calibración del robot y la configuración de cámaras funcionan antes de entrenar políticas propias.
- **Generación de datos sintéticos de entrenamiento**: al ejecutarse de forma autónoma, puede producir trayectorias adicionales que se revisen y se añadan al dataset para iterar sobre la política.
- **Docencia e investigación en aprendizaje por imitación**: ejemplo reproducible de ACT con hiperparámetros documentados, adecuado para comparar variantes del método.
- **Pruebas de robustez frente a cambios de iluminación o posición**: permite medir la degradación de la política al variar condiciones del entorno, aunque el autor no haya publicado esas evaluaciones.
- **Base para fine-tuning en tareas similares**: al estar entrenado sobre una tarea de manipulación concreta, puede servir como inicialización para tareas relacionadas con el mismo robot y sensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en safetensors, el modelo ocupa del orden de 0,2 GB en precisión nativa; la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento se recomienda al menos una RTX 3090 o superior por el batch de imágenes 480x640.
- **Consumer GPU**: sí, cabe en tarjetas de gama media como RTX 3060 o superiores; también es viable en CPU para inferencia a baja frecuencia.
- **Opciones de despliegue**: `lerobot-rollout` (script oficial de LeRobot) con `--policy.path=mrodher/policy_test1`; también es posible cargar los pesos con la API de LeRobot en Python.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware y de la frecuencia de captura (30 FPS en el dataset).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mrodher/policy_test1` (ACT) | 51,7 M | Manipulación visomotora (1 tarea) | 2 cámaras 480x640 + estado 6D | no disponible | Hugging Face |
| Políticas ACT de referencia de LeRobot | variable (decenas de millones) | Manipulación visomotora | cámaras + estado | según repositorio | Hugging Face / LeRobot Hub |
| Políticas Diffusion Policy | variable | Manipulación visomotora | cámaras + estado | según repositorio | Hugging Face |
| Políticas π0 / VLA de gran escala | miles de millones | Manipulación generalista | cámaras + instrucciones en lenguaje | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados por el autor; al entrenarse sobre un único dataset y una única tarea, el modelo está fuertemente sesgado hacia esa distribución de posiciones, iluminación y objetos.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- **Limitaciones de contexto o idioma**: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural más allá de la tarea fija "Put the beige piece on the aruco".
- **Restricciones de licencia**: la licencia no está especificada ("More Information Needed"); no se recomienda uso comercial sin aclaración previa con el autor.
- **Caveats para producción**: no hay evaluación en robot real publicada, ni tasas de éxito, ni pruebas de robustez; el modelo debe considerarse un prototipo. Requiere hardware y calibración específicos (`so_follower`, dos cámaras con nombres `wrist` y `top`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test1
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/record-test_1_20261119_113637
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/record-test_1_20261119_113637
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
