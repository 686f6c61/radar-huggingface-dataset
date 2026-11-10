# kickking/omx_panda_pick_act_pilicy_bs8_ep3

## Resumen

`kickking/omx_panda_pick_act_pilicy_bs8_ep3` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicada por el usuario kickking en Hugging Face. No se trata de un modelo de lenguaje, sino de un controlador visomotor entrenado para una tarea concreta de manipulación robótica (recogida de objetos, según el nombre del dataset asociado `omx_panda_pick_1101`). El modelo consume el estado articular de 6 dimensiones y una imagen RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones.

El modelo se ha entrenado con la librería LeRobot de Hugging Face (versión 0.6.1) sobre un dataset de 30 episodios y 11.660 fotogramas a 15 FPS, con 4.372 pasos de entrenamiento, batch size 8 y optimizador AdamW con learning rate 1e-05. El repositorio pesa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

Su relevancia es limitada y muy específica: es un artefacto de investigación reproducible que ilustra el flujo completo de entrenamiento y despliegue de políticas ACT en LeRobot, útil para quien quiera replicar el pipeline o servir como línea base de imitación en un robot de tipo `omx_f` con una única cámara.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica; la tarea se identifica con la etiqueta "0") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador de imágenes (procesa la observación `observation.images.rgb.camera1` de forma `(3, 480, 640)`) con un transformer que fusiona la observación visual y el estado articular `(6,)` para generar secuencias de acciones de dimensión 6.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kickking/omx_panda_pick_1101`: 30 episodios, 11.660 fotogramas a 15 FPS, tarea etiquetada como "0". La configuración fue de 4.372 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas. El robot objetivo es de tipo `omx_f` con una única cámara (`camera1`).

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de una imagen RGB y del estado articular.
- Aprendizaje por imitación con predicción de chunks de acción, lo que permite ejecutar trayectorias cortas de forma coherente.
- Ejecución en tiempo real a través de `lerobot-rollout` con la estrategia `base`.
- Entrada multimodal limitada: una cámara (`camera1`) y estado de 6 dimensiones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida de objetos con robot Panda (`omx_f`): la política está entrenada específicamente para la tarea "pick" del dataset `omx_panda_pick_1101`, por lo que su uso directo es la ejecución de esa maniobra en el robot para el que fue entrenada.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de entrenamiento de ACT en LeRobot 0.6.1 con 30 episodios y 11.660 fotogramas.
- Línea base para comparativas de políticas: al ser un modelo pequeño (51,7 M de parámetros) y con configuración documentada, permite comparar variantes de ACT (distinto batch size, número de episodios o resolución de cámara).
- Docencia y formación en robótica de imitación: el repositorio incluye comandos de entrenamiento y despliegue que facilitan demostraciones prácticas del ciclo completo teleoperación-entrenamiento-ejecución.
- Pruebas de integración con hardware `omx_f`: útil para verificar calibración de cámara, puerto del robot y coincidencia de claves de observación antes de entrenar políticas propias.
- Prototipado de controladores de bajo coste: con 0,2 GB de pesos, puede servirse en equipos modestos junto al robot, sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors y un repositorio de 0,2 GB, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100); el cuello de botella real será la cámara y el bus del robot, no el modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el flujo documentado por el autor. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen de la frecuencia de la cámara (30 FPS en el ejemplo de la model card) y del robot, no de un benchmark publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kickking/omx_panda_pick_act_pilicy_bs8_ep3` | 51,7 M | imagen 3x480x640 + estado (6,) | ACT, tarea "pick" en `omx_f` | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | no disponible | configurables según dataset | imitación visomotora | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy | no disponible | imagen + estado | imitación visomotora | según implementación | repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea ("0") y un único tipo de robot (`omx_f`) con una cámara (`camera1`); no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Dataset muy pequeño: 30 episodios y 11.660 fotogramas, lo que limita la robustez frente a cambios de iluminación, posiciones de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Sin datos de sesgos: no aplica el concepto habitual de sesgo lingüístico, pero sí existe riesgo de sobreajuste a las condiciones de recogida del dataset.
- Riesgo de fallo silencioso: al ser una política de imitación, puede ejecutar acciones incorrectas sin señal de error; requiere supervisión y paradas de seguridad en el robot.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- Dependencia de la versión de LeRobot: entrenado con 0.6.1; cambios de API en versiones posteriores pueden requerir adaptaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_panda_pick_act_pilicy_bs8_ep3
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_panda_pick_1101
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_panda_pick_1101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
