# kickking/omx_panda_pick_act_policy_bs16_ep20

## Resumen

`kickking/omx_panda_pick_act_policy_bs16_ep20` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido desarrollado por el usuario kickking y empaquetado con la librería LeRobot de Hugging Face. Su función es controlar un robot manipulador de tipo `omx_f` (variante de brazo Panda) para ejecutar una tarea de recogida (pick) a partir de observaciones visuales y del estado de las articulaciones.

El modelo es deliberadamente pequeño: 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visomotor especializado que consume una imagen RGB de 480x640 y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Esto lo sitúa en la categoría de políticas robóticas ligeras, desplegables en hardware modesto.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, desde la grabación de teleoperación hasta el despliegue con `lerobot-rollout`. No obstante, el modelo no incluye resultados de evaluación publicados, el dataset de entrenamiento es muy reducido (30 episodios, 11.660 frames) y la tarea está codificada como "0", lo que limita su generalización fuera del entorno exacto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un encoder visual (procesa la imagen `observation.images.rgb.camera1` de 3x480x640) con un transformer que condiciona la predicción de acciones sobre el estado de las articulaciones (`observation.state`, 6 dimensiones) y produce un chunk de acciones de 6 dimensiones. El paper original de ACT introduce además una técnica de regularización de la predicción de chunks (CVAE) para modelar la variabilidad humana en los datos de teleoperación.

El entrenamiento se realizó sobre el dataset `kickking/omx_panda_pick_1101`, compuesto por 30 episodios y 11.660 frames a 15 FPS, con una única tarea etiquetada como "0". La configuración reportada incluye 14.575 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 1e-05 y semilla 1000, usando LeRobot 0.6.1. No se especifica el número total de tokens ni composición del dataset más allá de estas cifras, ni se documenta si hubo etapas de RLHF o DPO (no aplicables en este paradigma de imitación).

## Capacidades

- Control visomotor de un brazo robótico `omx_f` para una tarea de recogida (pick) parametrizada como tarea "0".
- Predicción de chunks de acciones de 6 dimensiones a partir de una imagen RGB y un vector de estado de 6 dimensiones.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`, sin grabación de episodios.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensas ni entorno simulado).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitación con LeRobot: sirve como referencia práctica para validar la instalación de `lerobot`, la calibración del robot `omx_f` y el flujo `lerobot-train` → `lerobot-rollout` antes de invertir en datasets mayores.
- Prototipado de tareas pick-and-place en laboratorio: el modelo puede ejecutar la tarea "0" sobre el setup exacto de entrenamiento, útil para comparar configuraciones de cámara, iluminación y posiciones iniciales.
- Docencia y formación en robótica de imitación: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para cursos donde se analiza el comportamiento de ACT sin necesidad de GPUs de gama alta.
- Base para fine-tuning con datasets propios: el checkpoint puede reentrenarse con `--policy.type=act` sobre un dataset propio de LeRobot para adaptar la política a otra tarea u objeto.
- Benchmark interno de infraestructura de inferencia robótica: permite medir latencia de inferencia visomotora en el hardware objetivo (CPU o GPU consumer) antes de escalar a políticas mayores.
- Validación de integración hardware-software: útil para verificar la correspondencia entre los nombres de cámara (`camera1`), el puerto del robot y las claves de observación esperadas por la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, latencias ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso del modelo ocupa del orden de 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU para baja frecuencia de control.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100) es suficiente. La latencia vendrá dominada por el preprocesado de imagen (480x640) y la frecuencia de control del robot, no por el tamaño del modelo.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del checkpoint.
- Opciones de despliegue: `lerobot-rollout` (comando oficial documentado en la model card); el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la resolución de cámara y de la frecuencia de control del robot (el dataset se grabó a 15 FPS, lo que sugiere un objetivo de control en ese orden).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kickking/omx_panda_pick_act_policy_bs16_ep20` | 51,7 M | no aplica | Pick con brazo `omx_f` | apache-2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas diversas de imitación | según repo | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Imitación visomotora | según repo | Hugging Face / LeRobot |
| Políticas VLA (p. ej. OpenVLA) | del orden de miles de millones (no verificado aquí) | no aplica | Instrucciones en lenguaje + acción | según modelo | Hugging Face |

No se dispone de datos numéricos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que no se puede afirmar que la política funcione fuera del entorno de entrenamiento.
- Dataset de entrenamiento muy reducido: 30 episodios y 11.660 frames a 15 FPS, con una única tarea ("0"); la generalización a nuevas posiciones de objeto, iluminación o distracciones es previsiblemente baja.
- Dependencia estricta del setup: la política espera una cámara llamada `camera1` con resolución 480x640 y un robot `omx_f`; cambios en nombres de cámara, calibración o montaje pueden degradar o invalidar el comportamiento.
- Riesgo de sobreajuste al entorno: al ser una política de imitación con pocos datos, puede reproducir sesgos de la teleoperación (trayectorias, velocidades, posiciones iniciales) y fallar ante distribuciones fuera de las grabadas.
- No es un modelo de lenguaje: no procesa texto libre, no soporta instrucciones en lenguaje natural ni tool calling; la tarea está fijada como "0".
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset `kickking/omx_panda_pick_1101` de forma independiente.
- Sin información sobre cuantizaciones ni formatos alternativos: solo se distribuyen pesos safetensors; el despliegue está atado a LeRobot.
- Fecha de creación y actualización (2026-11-11) y ausencia de descargas o likes: modelo sin validación por la comunidad, lo que refuerza la cautela antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_panda_pick_act_policy_bs16_ep20
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_panda_pick_1101
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_panda_pick_1101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
