# alphatee0101/smolvla_franka_push

## Resumen

SmolVLA Franka Push es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de demostraciones robóticas. La desarrolla el usuario `alphatee0101` y está publicada en Hugging Face con licencia Apache 2.0. Su propósito es controlar un robot Franka Research 3 (tipo `fr3`) para ejecutar una tarea concreta de manipulación: empujar un cubo rojo hasta una zona objetivo verde.

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, un VLA compacto pensado para inferencia en hardware de consumo. Cuenta con 450.046.176 parámetros (unos 450 millones) en formato safetensors y consume tres cámaras RGB de 256x256 píxeles junto con un vector de estado de 6 dimensiones, produciendo acciones de 7 dimensiones. El repositorio ocupa 4,0 GB.

Es relevante como ejemplo práctico del flujo de imitación de LeRobot: un ajuste fino ligero (1500 pasos, batch 8, learning rate 1e-4) sobre solo 8 episodios y 5056 fotogramas a 10 FPS. No obstante, se trata de una política muy especializada y sin evaluación publicada, por lo que su utilidad es demostrativa más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | fr3 (Franka Research 3) |
| Entrada de estado | observation.state, shape (6,) |
| Entradas visuales | camera1, camera2, camera3, shape (3, 256, 256) |
| Salida | action, shape (7,) |
| Biblioteca | lerobot 0.6.1 |
| Tamano del repositorio | 4,0 GB |
| Descargas | 23 |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un componente de lenguaje y un cabezal de acciones para mapear observaciones multimodales (imágenes y estado propioceptivo) a comandos motores. El paper de referencia (arXiv:2506.01844) lo describe como un VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido y capacidad de despliegue en hardware de consumo. En esta ficha no se dispone del detalle interno de capas, dimensión oculta ni mecanismo de atención concretos.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `alphatee0101/franka_push`: 8 episodios, 5056 fotogramas a 10 FPS, con la tarea "Push the red cube into the green goal area". La configuración de entrenamiento fue de 1500 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. Se trata de aprendizaje por imitación supervisado a partir de demostraciones; no consta uso de RLHF ni DPO. El volumen de datos es muy reducido, lo que limita la generalización.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción de 7 dimensiones para un robot Franka Research 3.
- Percepción visual multimodal: procesa simultáneamente tres cámaras RGB a 256x256 píxeles.
- Fusión de estado propioceptivo: integra un vector de estado de 6 dimensiones con las observaciones visuales.
- Ejecución de una tarea de empuje guiada por instrucción en lenguaje natural ("Push the red cube into the green goal area").
- Despliegue en hardware de consumo según las características de la familia SmolVLA.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No se documentan capacidades multilingües ni modos de pensamiento, visión general o audio.

## Casos de uso

- Demostración educativa de imitación robótica: sirve para ilustrar el ciclo completo de LeRobot (grabación de datos, entrenamiento y despliegue) con un ejemplo mínimo de 8 episodios.
- Prueba de concepto de empuje de objetos: permite validar en un Franka Research 3 la tarea de llevar un cubo rojo a una zona verde antes de escalar a datasets mayores.
- Base para ajuste fino adicional: al derivar de `lerobot/smolvla_base`, puede reentrenarse con más episodios o variaciones de la tarea usando `lerobot-train`.
- Investigación en políticas VLA compactas: útil para estudiar el comportamiento de SmolVLA con pocos datos y comparar curvas de éxito frente a configuraciones mayores.
- Prototipado de pipelines de evaluación en robot real: el comando `lerobot-rollout` con `--duration` permite ejecutar la política durante un tiempo acotado y medir la tasa de éxito manualmente.
- Benchmark interno de infraestructura: al ser un modelo de 450 millones de parámetros en safetensors, sirve para medir latencia de inferencia y throughput en distintas GPU dentro del flujo de LeRobot.
- Reproducibilidad de experimentos: la semilla fija (1000) y la configuración documentada permiten replicar el entrenamiento y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors, los pesos en precisión completa rondan 1,8 GB (fp32) o 0,9 GB (fp16), a lo que se suma el coste de las tres cámaras y del resto del pipeline de LeRobot.
- GPU recomendadas: no especificadas por el autor; el paper de SmolVLA apunta a hardware de consumo, por lo que una RTX 4090 o superior es un punto de partida razonable.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la orientación de SmolVLA, aunque no hay cifras oficiales para esta política concreta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 10 FPS, pero no se publica la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphatee0101/smolvla_franka_push | 450.046.176 | SmolVLA ajustado | Empuje de cubo con fr3 | Apache 2.0 | Hugging Face, 23 descargas |
| lerobot/smolvla_base | no disponible | SmolVLA base | Política VLA general preentrenada | no disponible en esta ficha | Hugging Face |
| Otras políticas LeRobot ajustadas | variable | ACT, Diffusion Policy, etc. | Tareas de manipulación específicas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("Push the red cube into the green goal area") y un único tipo de robot (`fr3`).
- Dataset muy pequeño: solo 8 episodios y 5056 fotogramas, lo que aumenta el riesgo de sobreajuste y de baja generalización a posiciones, iluminación u objetos distintos.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia de la configuración de cámaras: los nombres y índices de cámara deben coincidir con las claves de observación del entrenamiento (`camera1`, `camera2`, `camera3`).
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo perceptivo depende de la distribución visual de los datos de entrenamiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones no válidas fuera de la distribución de demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de contexto: no se puede planificar un despliegue con requisitos de memoria ajustados sin medir empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphatee0101/smolvla_franka_push
- Dataset de entrenamiento: https://huggingface.co/datasets/alphatee0101/franka_push
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alphatee0101/franka_push
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
