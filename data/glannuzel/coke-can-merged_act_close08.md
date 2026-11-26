# glannuzel/coke-can-merged_act_close08

## Resumen

`glannuzel/coke-can-merged_act_close08` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el artículo arXiv 2304.13705 (Zhao et al., 2023). El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que consume una imagen de cámara y el estado del robot, y produce comandos de acción de 8 dimensiones.

La tarea concreta para la que se ha entrenado es "grab-coke-can": un brazo robótico de tipo `grabette` debe coger una lata de Coca-Cola. El entrenamiento se realizó sobre un conjunto de 209 episodios teleoperados (34 279 fotogramas a 30 FPS) y el resultado es un checkpoint de aproximadamente 51,6 millones de parámetros en formato safetensors, con un tamaño de repositorio de 0,2 GB.

Su relevancia es la de un ejemplo práctico y reproducible de política de manipulación robótica de código abierto: licencia Apache 2.0, integración directa con el ecosistema LeRobot y un pipeline completo (dataset, configuración de entrenamiento y comando de despliegue) documentado en la model card. No obstante, se trata de un modelo de nicho, sin métricas de evaluación publicadas y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.594.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice "trozos" (chunks) de acciones de varios pasos en lugar de una única acción por inferencia, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un codificador visual (procesa la imagen de la cámara `cam0` con forma `(3, 486, 648)`) con un transformer que fusiona la observación visual y el estado del robot (vector de 2 dimensiones) para generar una secuencia de acciones de 8 dimensiones. El artículo original introduce además una técnica de regularización tipo CVAE para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.1 durante 80 000 pasos, con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de origen es `glannuzel/coke-can-merged_act_graspproj`, con 209 episodios teleoperados, 34 279 fotogramas a 30 FPS y una única tarea ("grab-coke-can"). No se documenta el uso de RLHF, DPO ni datos sintéticos; es aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control visuomotor de un brazo robótico `grabette` para la tarea de agarre de una lata.
- Predicción de chunks de acción de 8 dimensiones a partir de una imagen y un estado de 2 dimensiones.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere recompensas ni entorno simulado).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Reentrenable y adaptable a otras tareas mediante `lerobot-train` con un dataset propio.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, ajustar hiperparámetros o evaluar técnicas de regularización sobre una tarea de agarre concreta.
- Prototipado de pipelines de manipulación con LeRobot: el comando `lerobot-rollout` permite validar la cadena hardware-cámara-política en menos de una hora de configuración.
- Docencia y formación en robótica: la tarea "grab-coke-can" es un ejemplo canónico y de bajo coste para introducir a estudiantes en el flujo teleoperación → dataset → entrenamiento → despliegue.
- Base para fine-tuning en tareas de pick-and-place: el checkpoint puede reentrenarse con un dataset reducido para objetos o posiciones similares, aprovechando la representación visual aprendida.
- Pruebas de integración de hardware `grabette`: útil para verificar calibración de cámara, puerto del robot y sincronización a 30 FPS antes de abordar tareas más complejas.
- Benchmark interno de latencia y throughput en GPUs de consumo: al ser un modelo de 51,6 M de parámetros, permite medir el coste real de inferencia de una política visuomotora en hardware asequible.
- Demostraciones en ferias o laboratorios: la licencia Apache 2.0 permite usar el modelo en exhibiciones públicas sin restricciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que el autor no ha proporcionado resultados de éxito en robot real (ni número de ensayos, ni tasa de acierto, ni condiciones de dificultad).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (51,6 M de parámetros, ~0,2 GB en safetensors) se espera que quepa holgadamente en GPUs de consumo, aunque no se publican cifras medidas.
- GPU recomendadas: no disponibles en la información proporcionada. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que implica soporte CUDA.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo, pero no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset está grabado a 30 FPS, lo que sugiere que el bucle de control debe operar en ese orden de magnitud, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `glannuzel/coke-can-merged_act_close08` (ACT) | 51,6 M | Agarre de lata con `grabette` | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (Zhao et al., 2023) | no disponible | Manipulación con ALOHA | no aplica | no disponible | Paper + código de referencia |
| Diffusion Policy (Chi et al., 2023) | no disponible | Manipulación visuomotora | no aplica | no disponible | Paper + código |
| Otras políticas LeRobot del Hub | variable | Tareas diversas | no aplica | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor no publica tasas de éxito ni comparaciones directas con Diffusion Policy u otras políticas de LeRobot.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: se desconoce la tasa de éxito real de la política en robot físico, incluso en las condiciones de entrenamiento.
- Especialización extrema: entrenada únicamente para "grab-coke-can" con un robot `grabette` y una cámara `cam0`; no generaliza a otras tareas, objetos ni configuraciones de hardware sin reentrenamiento.
- Dependencia del entorno: cambios de iluminación, posición de la lata, fondo o calibración de la cámara pueden degradar el rendimiento; no se documenta robustez ante distractores.
- Dataset pequeño y de un solo operador: 209 episodios y una única tarea implican un sesgo hacia las trayectorias demostradas; posibles problemas de sobreajuste.
- Sin datos de sesgo lingüístico ni de alucinación (no aplica a un modelo de lenguaje), pero sí riesgo de sobreajuste visual a la apariencia concreta de la lata y del entorno de grabación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue en producción.
- Cero descargas y cero "likes" en el Hub: no hay evidencia de validación por parte de la comunidad.
- El modelo está fechado en 2026-11-25, lo que puede indicar que es un artefacto reciente o de un entorno de pruebas; conviene verificar su reproducibilidad antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glannuzel/coke-can-merged_act_close08
- Dataset de entrenamiento: https://huggingface.co/datasets/glannuzel/coke-can-merged_act_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=glannuzel/coke-can-merged_act_graspproj
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
