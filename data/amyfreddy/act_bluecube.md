# AmyFreddy/act_bluecube

## Resumen

`AmyFreddy/act_bluecube` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido desarrollado por el usuario AmyFreddy y publicado en Hugging Face Hub mediante la librería LeRobot de Hugging Face. Resuelve una tarea concreta de manipulación robótica: agarrar un cubo azul y depositarlo en una papelera, aprendida a partir de 10 episodios de teleoperación.

La arquitectura es un transformer ACT que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo consume observaciones compuestas por el estado del robot (vector de 6 dimensiones) y dos cámaras RGB de resolución 640x480 (una montada en el portátil y otra en la muñeca del robot), y produce un vector de acción de 6 dimensiones.

Con aproximadamente 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real sobre el robot `so_follower` de LeRobot. Su relevancia es acotada: se trata de una política específica de tarea, no de un modelo generalista, útil como referencia para quienes trabajan con ACT y LeRobot o quieren reproducir el flujo completo de grabación, entrenamiento y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural; la tarea se especifica como cadena de texto en tiempo de ejecución) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `laptop`, `wrist` (RGB 3x480x640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | `AmyFreddy/blue-cube-v1` (10 episodios, 5586 frames, 30 FPS) |
| Tarea | "Grab the blue cube and put it in the bin" |
| Pasos de entrenamiento | 15000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras RGB) con un transformer que predice chunks de acciones de corta duración en lugar de acciones individuales. Esta predicción por chunks mitiga el problema de acumulación de errores típico de las políticas paso a paso y permite obtener tasas de éxito elevadas con datasets pequeños de teleoperación. El modelo sigue el diseño descrito en el paper arXiv:2304.13705 y se ha entrenado dentro del ecosistema LeRobot 0.7.1.

El entrenamiento se realizó sobre el dataset `AmyFreddy/blue-cube-v1`, compuesto por 10 episodios y 5586 frames grabados a 30 FPS, con una única tarea de manipulación ("Grab the blue cube and put it in the bin"). Se ejecutaron 15000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. No se documenta el uso de RLHF, DPO ni otras fases de ajuste posteriores; es aprendizaje por imitación supervisado puro. No se especifica el número total de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente dos flujos RGB de 640x480 (cámara `laptop` y cámara `wrist`).
- Aprendizaje por imitación: reproduce la tarea "Grab the blue cube and put it in the bin" aprendida de demostraciones teleoperadas.
- Predicción por chunks de acción: emite secuencias cortas de acciones, lo que aporta estabilidad en la ejecución.
- Despliegue en tiempo real: integrable con `lerobot-rollout` para ejecución continua sobre hardware real.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de agarre del cubo azul y depósito en la papelera sobre un `so_follower`, adecuado para validar pipelines de imitación con datasets pequeños (10 episodios).
- Reproducción de experimentos de ACT: sirve como referencia reproducible para comparar configuraciones de entrenamiento (15000 pasos, batch 8, lr 1e-05) en LeRobot 0.7.1.
- Base para fine-tuning en tareas similares: al ser una política ligera (51,7 M de parámetros), puede reentrenarse con nuevos datasets de manipulación de objetos en entornos controlados.
- Docencia y formación en robótica de imitación: útil para demostrar el flujo completo grabación-teleoperación-entrenamiento-despliegue con LeRobot.
- Pruebas de integración de hardware: permite verificar la calibración de cámaras `laptop` y `wrist`, el puerto del robot y la frecuencia de 30 FPS antes de escalar a tareas más complejas.
- Benchmark interno de políticas de manipulación: como línea base para comparar nuevas políticas ACT o alternativas (Diffusion Policy, VQ-BeT) sobre la misma tarea y dataset.
- Prototipado rápido en robótica de bajo coste: al caber en GPUs de consumo y requerir solo 0,2 GB de pesos, facilita iteraciones en estaciones de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repositorio), la huella en memoria es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; se ha entrenado con `--policy.device=cuda`. No se especifica un modelo concreto en la documentación.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (decenas de millones de parámetros); no se detalla una lista oficial de GPUs validadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución se realiza a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AmyFreddy/act_bluecube | ACT (LeRobot) | 51,7 M | no aplica | Pick-and-place de cubo azul | no disponible | Hugging Face Hub |
| Diffusion Policy (referencia metodologica) | Política por difusion | no disponible | no aplica | Manipulación visomotora | no disponible en esta ficha | Repositorios de investigación |
| VQ-BeT (referencia metodologica) | Política con cuantizacion vectorial | no disponible | no disponible | Manipulación | no disponible en esta ficha | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a la categoría metodológica y a la disponibilidad pública.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 10 episodios de un único operador, la política hereda los sesgos de esas demostraciones (posiciones, iluminación, velocidad).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de generalización deficiente fuera de la distribución del dataset (nuevas posiciones de objetos, distractores, cambios de iluminación).
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural más allá de la cadena de tarea en tiempo de ejecución.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; no se puede confirmar el uso comercial sin consultar al autor.
- Dataset muy reducido: 10 episodios y 5586 frames limitan la robustez; la model card no reporta tasa de éxito en robot real.
- Dependencia de hardware específico: entrenado para `so_follower` con cámaras `laptop` y `wrist`; los nombres e índices de cámara deben coincidir con las claves de observación.
- Sin evaluación publicada: no hay tabla de éxitos/fallos ni condiciones de dificultad documentadas, lo que impide estimar su fiabilidad en producción.
- Fecha de creación futura en el Hub (2026-11-27): conviene verificar la vigencia y posibles actualizaciones del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmyFreddy/act_bluecube
- Dataset de entrenamiento: https://huggingface.co/datasets/AmyFreddy/blue-cube-v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AmyFreddy/blue-cube-v1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
