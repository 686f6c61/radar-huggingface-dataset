# escapebirdy/dvrk_peg_cam01_rpy_jaw_baseframe_policy

## Resumen

`dvrk_peg_cam01_rpy_jaw_baseframe_policy` es una política de control visuomotor entrenada con LeRobot para una tarea de manipulación robótica con el sistema quirúrgico da Vinci Research Kit (dVRK). Concretamente, la tarea consiste en el manejo de una clavija (peg) observada por la cámara `cam01`, con una representación de acción basada en orientación roll-pitch-yaw (`rpy`) de la pinza (`jaw`) expresada en el marco base del robot (`baseframe`). El modelo se publica como un checkpoint de Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión y produce trayectorias de acción multimple paso suaves.

El modelo lo desarrolla el usuario `escapebirdy` y se distribuye con licencia Apache 2.0 a través de Hugging Face, dentro del ecosistema LeRobot. Tiene 366.953.738 parámetros (según los pesos en safetensors) y un repositorio de 1,5 GB. El pipeline declarado es `robotics`, y el dataset de entrenamiento asociado es `escapebirdy/dvrk_peg_cam012_baseframe`.

Su relevancia es acotada pero específica: es un ejemplo reproducible de entrenamiento de políticas de imitación para cirugía robótica asistida, con un formato de acciones explícito (posición y orientación RPY de la pinza en marco base) que facilita la integración con cinemática del dVRK. No es un modelo de lenguaje ni un modelo multimodal general; es un artefacto de control entrenado para una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor, según paper arXiv:2303.04137) |
| Parametros totales | 366.953.738 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, presentada en el artículo "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (arXiv:2303.04137). El modelo formula la predicción de acciones como un proceso de difusión condicionado por observaciones visuales, generando secuencias de acciones multimple paso en lugar de una acción única por paso. Este diseño produce trayectorias suaves y es especialmente adecuado para manipulación con contacto rico, como el ensartado de una clavija.

El entrenamiento se realizó con LeRobot sobre el dataset `escapebirdy/dvrk_peg_cam012_baseframe`, que contiene episodios de demostración de la tarea con el dVRK. La política está especializada en la cámara `cam01` y en un espacio de acciones con orientación roll-pitch-yaw de la pinza expresada en el marco base. No se dispone de información sobre el número de tokens, composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). La model card no documenta innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción multimple paso para control visuomotor de un robot dVRK.
- Manipulación con contacto rico: la tarea de referencia es el manejo de una clavija (peg), que requiere precisión de alineación y control de fuerza.
- Control de orientación de la pinza mediante representación roll-pitch-yaw en el marco base del robot.
- Percepción visual a partir de la cámara `cam01`.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling, agentes de propósito general ni razonamiento multietapa en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Ensartado de clavijas en entorno de laboratorio: la política se usa para ejecutar la tarea de inserción de una clavija con el dVRK, aprovechando la generación de trayectorias suaves de Diffusion Policy para gestionar el contacto.
- Investigación en imitación para cirugía robótica: sirve como punto de partida reproducible para comparar variantes de Diffusion Policy en tareas de manipulación con el dVRK.
- Evaluación de políticas con LeRobot: se puede ejecutar con `lerobot-record` apuntando a este checkpoint para recoger episodios de evaluación y medir éxito de la tarea.
- Reentrenamiento con nuevos datos: el checkpoint puede usarse como referencia o inicialización para afinar la política con datasets adicionales del mismo robot y cámara.
- Análisis de representaciones de acción: útil para estudiar el efecto de expresar la orientación en RPY respecto al marco base frente a otras parametrizaciones (cuaterniones, matriz de rotación).
- Docencia y demostraciones: ejemplo práctico de un pipeline completo de LeRobot, desde dataset hasta política desplegada, en un contexto de robótica quirúrgica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 366.953.738 parámetros en safetensors (aproximadamente 1,5 GB en el repositorio), la inferencia en precisión completa requiere del orden de 1,5 GB solo para pesos, más memoria para activaciones y el codificador visual; en la práctica se recomienda al menos 8 GB de VRAM para margen.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3090, RTX 4090, A100 o H100 son suficientes; una GPU consumer de gama media con 8-12 GB también debería poder ejecutar la inferencia.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `escapebirdy/dvrk_peg_cam01_rpy_jaw_baseframe_policy` | Diffusion Policy | 366.953.738 | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas LeRobot (ACT, TDMPC, VQ-BeT) | Varía según política | no disponible | no aplica | normalmente Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy original (referencia del paper) | Diffusion Policy | no disponible | no aplica | según implementación | Repositorio del paper |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (manejo de clavija con dVRK) y una única cámara (`cam01`); no generaliza a otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- Depende del marco de referencia base y de la parametrización RPY de la pinza; cambios en la cinemática o en la calibración del robot pueden degradar el rendimiento.
- Riesgo de fallo en condiciones de iluminación, oclusión o variaciones de la escena no representadas en el dataset de entrenamiento.
- No hay información publicada sobre sesgos, tasas de éxito ni robustez; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero el uso en entornos clínicos reales requiere validación regulatoria y de seguridad independiente; este checkpoint no está certificado para uso médico.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto.
- La model card incluye un comando de entrenamiento con `--policy.type=act`, lo que puede inducir a confusión; la política publicada es de tipo diffusion según los tags y el nombre del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam01_rpy_jaw_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
