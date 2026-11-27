# castanetnicolas/diffusion_state_BS_64_H_8_TASK_three_piece_assembly_ID_boie_20261127b

## Resumen

`castanetnicolas/diffusion_state_BS_64_H_8_TASK_three_piece_assembly_ID_boie_20261127b` es una política de control visuomotor entrenada con Diffusion Policy y empaquetada en el formato de LeRobot. El modelo resuelve una tarea de manipulación robótica concreta: insertar una primera pieza en una base y después una segunda pieza encima de la primera, sobre un brazo Franka Emika Panda. Lo desarrolla el usuario `castanetnicolas` y se publica bajo licencia Apache 2.0.

La relevancia del modelo es acotada y muy específica: no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un checkpoint de imitación para una tarea de ensamblaje con contacto rico. Diffusion Policy trata el control como un proceso generativo, produciendo trayectorias de acción multimodales y suaves, lo que resulta útil en tareas de inserción donde existen múltiples soluciones válidas y el contacto físico es crítico.

El modelo tiene 64.452.231 parámetros y un tamaño de repositorio de 0,3 GB. Consume observaciones de estado del robot (9 dimensiones) y del entorno (42 dimensiones) y emite acciones de 7 dimensiones. Se entrenó sobre 200 episodios y 67.101 fotogramas a 20 FPS del dataset `mimicgen_three_piece_assembly_d1_state_objects`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 64.452.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de acciones H=8 según el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la formulación de Diffusion Policy (paper arXiv:2303.04137), que modela la política de control como un proceso de difusión condicionado por el estado de observación. En lugar de predecir una única acción de forma determinista, genera una trayectoria de acciones mediante un proceso iterativo de eliminación de ruido, lo que permite representar distribuciones multimodales de comportamiento y produce movimientos suaves y coherentes en el tiempo. La entrada combina `observation.state` (9 dimensiones, estado propioceptivo del robot) y `observation.environment_state` (42 dimensiones, estado del entorno), y la salida es un vector de acción de 7 dimensiones (típicamente 6 grados de libertad más la pinza en un Panda).

El entrenamiento se realizó con LeRobot 0.6.1 durante 200.000 pasos, con batch size 64, optimizador Adam, learning rate 0,0001 y semilla 1000. El dataset contiene 200 episodios y 67.101 fotogramas a 20 FPS, correspondientes a la tarea "Insert the first piece into the base, then insert the second piece on top of it." No se documenta en la model card el uso de RLHF, DPO ni ningún proceso de ajuste posterior por refuerzo; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control de un brazo Franka Panda en una tarea de ensamblaje de dos piezas.
- Control visuomotor condicionado por estado propioceptivo (9 dimensiones) y estado del entorno (42 dimensiones).
- Producción de acciones multimodales y temporalmente suaves gracias a la formulación de difusión.
- Ejecución de tareas de inserción con contacto rico (contact-rich manipulation), el escenario para el que Diffusion Policy está diseñado.
- Integración con el ecosistema LeRobot para ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política de robótica, no un modelo de lenguaje.

## Casos de uso

- Ensamblaje de dos piezas en línea de montaje: el modelo ejecuta la secuencia de insertar la primera pieza en la base y después la segunda encima, adecuado para celdas de fabricación con un Panda y objetos en posiciones conocidas.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy sobre la misma tarea y dataset en experimentos académicos.
- Benchmark de manipulación con contacto rico: permite evaluar la robustez de políticas generativas en tareas de inserción, donde los métodos deterministas suelen fallar por ambigüedad en la trayectoria.
- Reentrenamiento y ajuste fino: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre nuevos datasets para adaptar la política a variaciones de la tarea o a otro robot del mismo tipo.
- Docencia y formación en robótica: ejemplo reproducible de pipeline completo (grabación de datos, entrenamiento, despliegue) con LeRobot y un robot Panda.
- Pruebas de integración de hardware: permite validar la cadena de comunicación, calibración de cámaras y control del Panda antes de desplegar políticas más complejas.
- Prototipado de automatización en laboratorio: útil para demostrar inserción de piezas en entornos controlados antes de invertir en soluciones industriales cerradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 64,45 M de parámetros y pesos en safetensors de 0,3 GB, la inferencia en FP32 requiere aproximadamente 0,26 GB solo para pesos, más overhead de activaciones y del proceso de difusión (múltiples pasos de denoising).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una RTX 4090 o A100 no son necesarias para la inferencia, aunque pueden reducir la latencia del bucle de difusión.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante) por el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de difusión y por el ciclo de control del robot a 20 FPS (50 ms por paso de control como referencia del dataset).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`diffusion_state_BS_64_H_8_...`) | Diffusion Policy | 64,45 M | H=8 (según nombre del checkpoint) | Ensamblaje de dos piezas (Panda) | apache-2.0 | Hugging Face |
| Otras políticas LeRobot Diffusion Policy | Diffusion Policy | no disponible | no disponible | Distintas tareas de manipulación | según checkpoint | Hugging Face (hub LeRobot) |
| ACT (Action Chunking Transformer) en LeRobot | Transformer con action chunking | no disponible | no disponible | Manipulación por imitación | según checkpoint | Hugging Face (hub LeRobot) |
| Políticas deterministas tipo MLP/regresión | MLP | no disponible | no disponible | Manipulación simple | según implementación | según repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea de ensamblaje de dos piezas sobre un Panda; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de posición, iluminación o distracciones.
- Dataset limitado: 200 episodios y 67.101 fotogramas; la cobertura de condiciones puede ser insuficiente para producción.
- Dependencia del entorno: las observaciones incluyen `observation.environment_state` (42 dimensiones), lo que implica que el despliegue requiere reproducir exactamente esa representación del entorno.
- Riesgo de sobreajuste a las condiciones de simulación o de recogida de datos del dataset MimicGen; no se documenta la procedencia exacta de los datos (simulación frente a robot real).
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución en las demostraciones (posiciones, velocidades, estilos de ejecución).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Sin datos de cuantización ni de formatos alternativos de despliegue; la integración está atada a LeRobot.
- El nombre del checkpoint sugiere horizonte de predicción H=8 y batch size 64, pero estos valores no se confirman en la model card más allá del batch size.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_state_BS_64_H_8_TASK_three_piece_assembly_ID_boie_20261127b
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
