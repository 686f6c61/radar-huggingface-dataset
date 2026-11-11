# Haku-2004/act_k5t_pred_20

## Resumen

`act_k5t_pred_20` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario Haku-2004 y se distribuye a través de Hugging Face Hub como un artefacto de LeRobot, la librería de aprendizaje por imitación de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) a acciones de 6 dimensiones en un robot de tipo `so_follower`.

El modelo resuelve una tarea concreta de manipulación, etiquetada como "taskbox", aprendida a partir de 20 episodios de teleoperación (25.815 fotogramas a 30 FPS) del dataset `Haku-2004/k5_4seg`. Con 51.672.714 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de consumo, no para despliegue en servidores de gran escala.

Su relevancia es acotada pero representativa: ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento con ACT, publicación en el Hub y rollout con `lerobot-rollout`). La licencia Apache 2.0 permite reutilización comercial, aunque la ausencia de evaluación publicada limita cualquier afirmación sobre su fiabilidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo visomotor, sin entrada ni salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un codificador visual (procesa las dos cámaras `front` y `side` a 480x640) con un transformer que integra el estado articular de 6 dimensiones y genera una secuencia de acciones de 6 dimensiones. El modelo tiene 51.672.714 parámetros, coherente con la escala típica de ACT en LeRobot.

El entrenamiento se realizó sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 fotogramas a 30 FPS, una única tarea ("taskbox"). La configuración reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.5.2. No se documenta composición del dataset más allá de esos episodios, ni uso de RLHF/DPO (no aplica en imitación supervisada), ni innovaciones adicionales fuera del propio action chunking.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Ejecución de una tarea concreta de tipo "taskbox" sobre robot `so_follower`.
- Predicción por chunks de acción, que aporta continuidad temporal en la ejecución.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- Entrada multimodal limitada a estado propioceptivo e imágenes RGB; sin entrada de texto ni de instrucciones en lenguaje natural.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- Automatización de una celda de picking tipo "taskbox": la política ejecuta la secuencia aprendida sobre el robot `so_follower` con dos cámaras, adecuada para prototipos de laboratorio donde la tarea está bien delimitada.
- Replicación de demostraciones de teleoperación: sirve como plantilla para validar el pipeline de LeRobot (grabación, entrenamiento ACT, publicación y rollout) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: base para experimentos de comparación entre variantes de ACT, ajuste de hiperparámetros o estudio de robustez frente a cambios de iluminación y posición de objetos.
- Docencia y formación en robótica: ejemplo compacto (0,2 GB, 51,7 M de parámetros) que cabe en una GPU de consumo y permite demostrar el ciclo completo de una política visomotora.
- Pruebas de integración hardware-software: validación de calibración de cámaras y del bus del robot `so_follower` usando una política ya entrenada como referencia funcional.
- Punto de partida para fine-tuning: al estar en Apache 2.0 y en formato LeRobot, puede reentrenarse con datos propios de otra tarea manteniendo la misma arquitectura y configuración de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (ni tasa de éxito, ni número de ensayos, ni condiciones de dificultad).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la demanda dominante es la de los dos flujos de cámara a 480x640 y el buffer de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU para pruebas, aunque la latencia a 30 FPS no está garantizada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Haku-2004/act_k5t_pred_20`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el dataset y la inferencia operan a 30 FPS, pero no se publican medidas de latencia por paso ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5t_pred_20 | 51,7 M | estado (6,) + 2 imagenes 480x640 | taskbox en `so_follower` | apache-2.0 | Hugging Face Hub (LeRobot) |
| Otras politicas ACT en LeRobot Hub | variable, tipicamente decenas de millones | estado + imagenes | tareas diversas | variable (a menudo apache-2.0) | Hugging Face Hub |
| Diffusion Policy (referencia metodologica) | no disponible | estado + imagenes | imitacion robotica | no disponible en esta ficha | repositorios de investigacion |
| VLA genericos (p. ej. familias tipo RT/OpenVLA) | cientos de millones a miles de millones | imagenes + instrucciones en lenguaje | manipulacion generalista | variable | Hugging Face Hub / repositorios |

La comparación con políticas ACT de otros autores no puede cuantificarse porque este modelo no publica evaluación; la comparación con VLA es cualitativa: este modelo es mucho más pequeño y especializado, sin comprensión de instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasa de éxito ni condiciones de prueba, por lo que no puede afirmarse fiabilidad en producción.
- Dataset muy reducido (20 episodios, una sola tarea): alta probabilidad de sobreajuste y de fallo ante cambios de posición de objetos, iluminación, fondo o distracciones.
- Dependencia estricta de la configuración de hardware: robot `so_follower`, cámaras `front` y `side` con nombres e índices concretos; cualquier desviación invalida la política.
- Sin capacidades de lenguaje: no acepta instrucciones en texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en sentido robótico: puede generar acciones plausibles pero incorrectas cuando el estado observado se sale de la distribución de entrenamiento.
- Sesgos: no documentados por el autor; al derivarse de teleoperación humana, hereda los sesgos de ejecución del operador y de las condiciones de la sesión de grabación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Fecha de creación y actualización (2026-11-11) y ausencia de descargas o likes: modelo sin validación por la comunidad, con trazabilidad limitada más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
