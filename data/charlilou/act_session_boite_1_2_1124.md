# charlilou/act_Session_boite_1_2_1124

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación robótica. Este repositorio concreto, `charlilou/act_Session_boite_1_2_1124`, es una política entrenada con LeRobot sobre un robot `so_follower` (configuración SO-100/SO-101 de bajo coste) para dos tareas de entrenamiento ("Entraînement sous boîte 1" y "Entraînement sous boîte 2"), presumiblemente tareas de colocación o encaje bajo una caja.

El modelo es un transformer de 51.668.614 parámetros (unos 51,7 M) que consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (`top` y `wrist`) para producir vectores de acción de 6 dimensiones. Se entrenó durante 2700 pasos con batch size 16, optimizador AdamW y learning rate 1e-05 sobre un dataset de 30 episodios y 7159 frames a 30 FPS.

Su relevancia es la de un ejemplo típico de política de imitación reproducible y ligera para robótica de bajo coste: cabe en hardware consumer, se despliega con la CLI de LeRobot y sirve como referencia para quien quiera entrenar sus propias políticas ACT con su propio dataset. No es un modelo de lenguaje ni un modelo fundacional generalista; es una política específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de la política, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas están etiquetadas en francés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer de tipo encoder-decoder que combina un codificador visual (procesa las imágenes de las cámaras `top` y `wrist`) con un codificador del estado propioceptivo (`observation.state`, 6 dimensiones) y un decodificador que genera un chunk de acciones futuras en lugar de una única acción por paso. Esta predicción por chunks es la innovación central del método: mitiga el error de composición y permite un control más suave y estable en tareas de manipulación fina.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `charlilou/Session_boite_1_2`: 30 episodios, 7159 frames a 30 FPS, con dos tareas etiquetadas ("Entraînement sous boîte 1" y "Entraînement sous boîte 2"). La configuración fue de 2700 pasos, batch size 16, AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número de tokens ni la composición detallada del dataset más allá de los episodios y frames indicados. No se especifica si hubo RLHF, DPO ni ningún ajuste posterior al entrenamiento por imitación.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Percepción visual multi-cámara: procesa simultáneamente las cámaras `top` y `wrist` a 480x640.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución de tareas concretas de manipulación: las dos tareas del dataset ("Entraînement sous boîte 1" y "Entraînement sous boîte 2").
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de una tarea de pick-and-place bajo caja: la política ejecuta las dos tareas de entrenamiento ("Entraînement sous boîte 1" y "Entraînement sous boîte 2") sobre un robot `so_follower` con cámaras `top` y `wrist`; es adecuada porque se entrenó exactamente sobre ese setup y esas etiquetas.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de LeRobot (`lerobot-rollout`, `lerobot-train`) antes de entrenar políticas propias.
- Base para fine-tuning con datos propios: al ser una política ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio siguiendo la configuración documentada (2700 pasos, batch 16, lr 1e-05) en hardware consumer.
- Docencia y divulgación en robótica de bajo coste: demuestra el flujo completo de grabación de datos, entrenamiento y despliegue en un robot SO-100/SO-101, con un repositorio de solo 0,2 GB.
- Pruebas de robustez de políticas de imitación: útil para evaluar cómo se comporta una política entrenada con 30 episodios ante variaciones de posición, iluminación o distracciones (el autor no ha publicado esa evaluación).
- Prototipado rápido en laboratorio: al caber en una GPU consumer y desplegarse con la CLI de LeRobot, permite iterar sobre tareas de manipulación sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB de pesos en FP32) el modelo cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100); el cuello de botella real será el procesamiento de las dos cámaras a 480x640 y 30 FPS, no el tamaño del modelo.
- Cabe en GPU consumer: sí, con margen amplio; incluso GPUs de gama baja pueden ejecutar la inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y entrenamiento con `lerobot-train`; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la model card no reporta métricas de latencia ni de frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlilou/act_Session_boite_1_2_1124 (ACT) | 51,7 M | no disponible | sin evaluación publicada | no disponible | Hugging Face (repo 0,2 GB) |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |
| Políticas VQ-BeT / otros métodos de imitación | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 30 episodios de un único operador y setup, la política heredará los sesgos de esas demostraciones (posiciones, velocidades y estilos de agarre).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de generalización deficiente fuera de la distribución de entrenamiento (nuevas posiciones de objetos, iluminación o distracciones).
- Limitaciones de contexto o idioma: no aplica contexto textual; las tareas están etiquetadas en francés ("Entraînement sous boîte 1" y "Entraînement sous boîte 2") y deben invocarse con esas cadenas exactas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarla en producción.
- Caveats para producción: sin evaluación publicada de tasa de éxito, sin datos de latencia, sin variantes cuantizadas y con un dataset pequeño (30 episodios, 7159 frames); requiere calibración específica del robot y de las cámaras (`top` y `wrist`) para funcionar.
- Dependencia de hardware concreto: entrenada para el robot `so_follower`; no se garantiza su transferencia a otros robots o configuraciones de cámara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_Session_boite_1_2_1124
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/Session_boite_1_2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/Session_boite_1_2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
