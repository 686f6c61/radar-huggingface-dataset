# mrrl-emcnei/smolvla_l3r2_acbag-slidelift-pick

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos desarrollada por Hugging Face, diseñada para control robótico por imitación con costes computacionales reducidos. Este repositorio concreto, `smolvla_l3r2_acbag-slidelift-pick`, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset propio de 50 episodios para la tarea "Pick up the pouch" (recoger una bolsa) con un robot de tipo `mobileai_robot` equipado con tres cámaras (alta y dos muñecas).

El modelo combina percepción visual (tres flujos de imagen a 256×256) con el estado proprioceptivo del robot (vector de 6 dimensiones) para producir comandos de acción de 16 dimensiones. Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo sitúa en la categoría de políticas robóticas ligeras desplegables en el borde.

Su relevancia radica en que ejemplifica el flujo actual de trabajo con LeRobot: partir de un modelo base preentrenado y adaptarlo con pocos datos (25.786 fotogramas a 30 FPS) a una tarea específica de manipulación, manteniendo licencia Apache 2.0 para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que integra un codificador visual y un decodificador de acciones para mapear observaciones multimodales (imágenes de cámaras e información propioceptiva del robot) a comandos motores. En este caso, la política consume tres flujos visuales de forma `(3, 256, 256)` más un vector de estado de forma `(6,)`, y emite un vector de acción de forma `(16,)`. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y este checkpoint se obtiene por fine-tuning supervisado.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrrl-emcnei/acbag-slidelift-pick` (50 episodios, 25.786 fotogramas, 30 FPS, tarea "Pick up the pouch"), con 100.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-4 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre la composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 16 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (cámara alta y dos cámaras de muñeca) a resolución 256×256.
- Fusión multimodal: combina información visual con el estado del robot (vector de 6 dimensiones) para condicionar la política.
- Ejecución de tareas manipulativas específicas: entrenado para la tarea "Pick up the pouch".
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento, al tratarse de una política robótica y no de un modelo de lenguaje general.

## Casos de uso

- Recogida automatizada de objetos en línea de manipulación: el modelo ejecuta la tarea "Pick up the pouch" sobre un robot `mobileai_robot`, adecuado para integrarse en celdas de pick-and-place donde la posición del objeto es variable.
- Prototipado rápido de políticas con LeRobot: al partir de `smolvla_base` y entrenarse con solo 50 episodios, sirve como plantilla para validar nuevas tareas de manipulación con pocos datos.
- Investigación en aprendizaje por imitación: útil como baseline reproducible para comparar variantes de arquitectura VLA o estrategias de aumento de datos en robótica.
- Despliegue en hardware de consumo: con 450 M de parámetros y pesos en safetensors, puede ejecutarse en estaciones de trabajo con GPU de gama media, lo que facilita pruebas en laboratorio sin clúster.
- Automatización de tareas de logística ligera: la tarea de recogida de bolsas o paquetes pequeños puede adaptarse a entornos de clasificación y empaquetado.
- Educación y formación en robótica: ejemplo completo del ciclo registro de datos, entrenamiento y despliegue con LeRobot, apropiado para cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros y pesos en safetensors (fp32/bf16 según conversión), una estimación razonable es entre 1 y 2 GB en bf16/fp16, aunque no está confirmada por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar la política.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque el fabricante no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de política vía `--policy.path`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se publican métricas de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_l3r2_acbag-slidelift-pick | 450 M | no disponible | Manipulación (pick) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base preentrenado | Apache 2.0 | Hugging Face |
| Otras políticas LeRobot fine-tuned | variable | no disponible | Manipulación específica | según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con un dataset de 50 episodios de un único robot y tarea, la política puede sobreajustarse a posiciones, iluminación y objetos del entorno de captura.
- Riesgo de alucinación: en el contexto robótico, se traduce en acciones erróneas o inseguras cuando la escena difiere de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje natural como un LLM; la instrucción de tarea ("Pick up the pouch") se usa como condicionamiento, pero no se documenta su robustez ante variaciones de fraseo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de seguridad para despliegue en producción.
- Caveats para producción: no hay evaluación en robot real publicada, el dataset es pequeño, no se documentan métricas de éxito, y el rendimiento fuera del entorno de entrenamiento es incierto.
- Dependencia de LeRobot 0.6.2 y del robot `mobileai_robot`: la integración con otros robots requeriría reentrenamiento o adaptación de las claves de observación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrrl-emcnei/smolvla_l3r2_acbag-slidelift-pick
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/acbag-slidelift-pick
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/acbag-slidelift-pick
