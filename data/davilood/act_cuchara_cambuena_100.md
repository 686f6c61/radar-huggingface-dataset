# Davilood/act_cuchara_cambuena_100

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Davilood/act_cuchara_cambuena_100`, es una política entrenada con LeRobot sobre un robot de tipo `so_follower` para la tarea "Pick up the spoon and place it next to the plate" (coger la cuchara y colocarla junto al plato).

El modelo consume observaciones de estado articular de 6 dimensiones junto con dos cámaras (una cenital y otra en la muñeca) y produce comandos de acción de 6 dimensiones. Se entrenó durante 50.000 pasos con un batch de 8 sobre un dataset de 100 episodios y 70.732 fotogramas a 30 FPS, capturados mediante teleoperación.

Es relevante como ejemplo práctico y reproducible de un pipeline completo de imitación en robótica de bajo coste: dataset público, configuración de entrenamiento documentada y pesos en formato safetensors de solo 0,2 GB, lo que permite ejecutarlo en hardware modesto. No obstante, se trata de una política específica de tarea, sin resultados de evaluación publicados y con un alcance muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa conjuntamente las observaciones visuales (dos cámaras: `top` a 362x436 y `wrist` a 480x640) y el estado propioceptivo de 6 dimensiones, y genera un chunk de acciones de 6 dimensiones. La innovación central del método es predecir múltiples acciones futuras de forma conjunta, lo que mitiga el error de compounding típico de las políticas que predicen un único paso. El paper de referencia es arXiv:2304.13705 (Zhao et al., 2023).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Davilood/cuchara_cambuena`: 100 episodios, 70.732 fotogramas a 30 FPS, una única tarea de manipulación. Configuración: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje supervisado por imitación a partir de demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower`.
- Percepción visual multimodal: integra dos flujos de cámara (cenital y de muñeca) en la política.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución de una tarea específica: "Pick up the spoon and place it next to the plate".
- Inferencia en tiempo real a 30 FPS según la frecuencia del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.

## Casos de uso

- Automatización de una celda de pick-and-place: la política se ejecuta con `lerobot-rollout` sobre un `so_follower` para recoger una cuchara y depositarla junto a un plato, replicando la tarea demostrada.
- Base para fine-tuning en tareas similares: al ser un checkpoint ACT entrenado, sirve como inicialización para nuevos datasets de manipulación con objetos y posiciones parecidas.
- Validación de pipelines de imitación: útil para probar el flujo completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Docencia y experimentación en robótica de bajo coste: el tamaño reducido (0,2 GB, ~51,7 M de parámetros) permite entrenar y desplegar en una sola GPU de consumo.
- Investigación en action chunking: referencia reproducible para comparar variantes de ACT y analizar el efecto del tamaño de chunk y del número de demostraciones.
- Demostración de teleoperación a política autónoma: permite medir la brecha entre éxito humano y éxito de la política en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos ni tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~51,7 M de parámetros; en la práctica, el consumo dominado por los buffers de imagen de las dos cámaras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 20xx en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch con safetensors; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, lo que sugiere un objetivo de control en torno a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Davilood/act_cuchara_cambuena_100 | 51,7 M | no disponible | Pick-and-place de cuchara | Apache 2.0 | HuggingFace (35 descargas) |
| Políticas ACT de LeRobot (genéricas) | ~50 M (típico) | no disponible | Manipulación variada | Apache 2.0 | HuggingFace / LeRobot |
| Diffusion Policy | variable (decenas de M) | no disponible | Manipulación visomotora | MIT/Apache según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Política específica de tarea y de robot: solo se ha entrenado para `so_follower` con las cámaras `top` y `wrist` en las resoluciones indicadas; no generaliza a otros robots ni configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no puede afirmarse su fiabilidad en producción.
- Riesgo de sobreajuste al entorno de demostración: posiciones de objetos, iluminación y fondo del dataset condicionan el comportamiento; cambios en el entorno pueden degradar el éxito.
- Sin capacidades de lenguaje ni razonamiento: no es un modelo de propósito general; no admite instrucciones en lenguaje natural más allá de la tarea fijada.
- Dataset pequeño: 100 episodios y una única tarea limitan la diversidad de situaciones cubiertas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos: no disponible, aunque al ser un modelo robótico los sesgos relevantes serían de distribución de datos (posiciones, objetos, iluminación) más que sociales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Davilood/act_cuchara_cambuena_100
- Dataset de entrenamiento: https://huggingface.co/datasets/Davilood/cuchara_cambuena
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Davilood/cuchara_cambuena
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
