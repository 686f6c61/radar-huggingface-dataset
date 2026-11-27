# escapebirdy/dvrk_peg_cam01_zero_state_mtdit_baseframe_policy

## Resumen

`dvrk_peg_cam01_zero_state_mtdit_baseframe_policy` es una política de control robótico entrenada con LeRobot y publicada por el usuario `escapebirdy` en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de imitación orientado a manipulación robótica: concretamente, una política `multi_task_dit` (Multi-Task Diffusion Transformer) aplicada a una tarea de tipo *peg-in-hole* sobre el sistema quirúrgico da Vinci Research Kit (dVRK), según se deduce del identificador `dvrk_peg` y de la cámara `cam01`. El modelo consume observaciones visuales y estado del robot, y produce acciones motrices.

El checkpoint tiene 248.896.266 parámetros en formato safetensors (aproximadamente 249 millones) y un repositorio de 1,0 GB, lo que sitúa al modelo en el rango de políticas de imitación de tamaño medio, comparable a arquitecturas tipo ACT o Diffusion Policy. La nomenclatura `zero_state` y `baseframe` sugiere que la política opera con un estado inicial fijo y en el marco de referencia base del robot, un detalle relevante para reproducir la evaluación.

Su relevancia es acotada pero específica: sirve como artefacto reproducible de investigación en robótica quirúrgica asistida, un dominio donde los conjuntos de datos y las políticas públicas son escasos. La licencia Apache 2.0 facilita su reutilización, aunque la información publicada por el autor es mínima (la propia model card conserva el texto de plantilla «Model type not recognized»).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (multi_task_dit) sobre LeRobot |
| Parametros totales | 248.896.266 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Libreria | lerobot |
| Dataset de entrenamiento | escapebirdy/dvrk_peg_cam012_baseframe |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es `multi_task_dit`, es decir, un Diffusion Transformer (DiT) entrenado con objetivos de difusión para generar secuencias de acciones, con un componente multi-tarea. Este enfoque es habitual en políticas de imitación modernas: en lugar de predecir una acción de forma determinista, el modelo aprende a denoizar trayectorias de acción condicionadas por observaciones (imágenes de la cámara `cam01` y estado del robot). El sufijo `zero_state` apunta a un condicionamiento sobre un estado inicial nulo o fijo, y `baseframe` indica que las acciones se expresan en el marco de referencia base del manipulador.

No se dispone de información publicada sobre el número de tokens o trayectorias de entrenamiento, la composición exacta del dataset `escapebirdy/dvrk_peg_cam012_baseframe`, ni sobre si se aplicaron técnicas de aumento de datos, RLHF o ajuste fino posterior. La model card es la plantilla por defecto de LeRobot y no aporta detalles de entrenamiento más allá de los comandos genéricos de `lerobot-train` y `lerobot-record`. Cabe señalar una inconsistencia en la propia model card: el ejemplo de entrenamiento usa `--policy.type=act`, mientras que el nombre del modelo y sus tags indican `multi_task_dit`.

## Capacidades

- Control robótico por imitación: genera comandos de acción a partir de observaciones visuales (cámara `cam01`) y del estado del robot.
- Ejecución de tareas de ensamblaje tipo *peg-in-hole* en el entorno dVRK (manipulador quirúrgico).
- Condicionamiento multi-tarea: el tag `multi_task_dit` sugiere que la política fue entrenada para más de una variante de tarea dentro del mismo dataset.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Investigación en robótica quirúrgica: reproducir experimentos de ensamblaje de clavija sobre dVRK usando el checkpoint como línea base pública, gracias a su licencia Apache 2.0 y a su formato safetensors compatible con LeRobot.
- Evaluación comparativa de políticas de imitación: servir como referencia `multi_task_dit` frente a políticas ACT o Diffusion Policy entrenadas sobre el mismo dataset `dvrk_peg_cam012_baseframe`.
- Aprendizaje por imitación con datos propios: reentrenar o ajustar la política con nuevas demostraciones teleoperadas del mismo montaje (cámara `cam01`, marco base), usando los scripts de LeRobot.
- Validación de pipelines de simulación a realidad: probar la transferencia de una política entrenada en un dataset concreto a un banco de pruebas físico o simulado del dVRK, verificando el efecto del condicionamiento `zero_state`.
- Docencia en robótica médica: emplear el modelo y su dataset asociado como ejemplo práctico de entrenamiento de políticas visuomotoras en un entorno quirúrgico de código abierto.
- Despliegue en banco de laboratorio: ejecutar inferencia con `lerobot-record` sobre un robot `so100_follower` u otro compatible para recoger episodios de evaluación (`eval_*`) y medir tasas de éxito en la inserción de la clavija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 248,9 millones de parámetros en safetensors, los pesos ocupan aproximadamente 1,0 GB en FP32 (0,5 GB en FP16/BF16). Sumando activaciones y buffers de difusión, se estima un consumo de VRAM de 2 a 4 GB en FP16, aunque es una estimación, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para reentrenamiento se recomienda una RTX 3090/4090 (24 GB) o una A100/H100 si se aumenta el tamaño de lote o la resolución de imagen.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de denoización del Diffusion Transformer y por la frecuencia de control del robot, parámetros no publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| escapebirdy/dvrk_peg_cam01_zero_state_mtdit_baseframe_policy | 248,9 M | DiT de difusión multi-tarea (LeRobot) | no aplica | Apache 2.0 | Hugging Face |
| Políticas ACT (LeRobot) | variable, típicamente 10-80 M | Transformer de imitación | no aplica | Apache 2.0 (implementación) | Hugging Face / LeRobot |
| Diffusion Policy (referencia original) | variable | Difusión para control | no aplica | MIT (implementación de referencia) | Repositorio público |
| Políticas dVRK publicadas | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card es la plantilla por defecto de LeRobot y no documenta hiperparámetros, datos de entrenamiento ni resultados de evaluación.
- Inconsistencia interna: el ejemplo de entrenamiento de la model card usa `--policy.type=act`, mientras que el modelo se declara como `multi_task_dit`; conviene verificar la configuración real antes de reentrenar.
- Especialización extrema: la política está entrenada para una tarea concreta (inserción de clavija en dVRK, cámara `cam01`, marco base, estado inicial fijo). No generaliza a otras tareas, cámaras ni marcos de referencia sin reentrenamiento.
- Riesgo de sobreajuste al montaje experimental: cambios en iluminación, calibración de cámara, posición inicial o cinemática del robot pueden degradar el rendimiento de forma significativa.
- Sin garantías de seguridad: es un artefacto de investigación; no debe emplearse en procedimientos clínicos reales sin validación exhaustiva, certificación y supervisión humana.
- Sesgos: no evaluados ni documentados por el autor; los sesgos provendrían de las demostraciones del dataset `dvrk_peg_cam012_baseframe`.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/dvrk_peg_cam01_zero_state_mtdit_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_peg_cam012_baseframe
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
