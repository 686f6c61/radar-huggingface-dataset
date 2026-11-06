# HueyWoo/act_lekiwi06_pick_redcube_place_1102

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `HueyWoo/act_lekiwi06_pick_redcube_place_1102`, contiene una política entrenada con LeRobot sobre el robot LeKiwi para la tarea "pick a red cube and place it on box" (coger un cubo rojo y colocarlo en una caja).

La política consume el estado del robot (9 dimensiones) y dos flujos de imagen de 480x640 píxeles procedentes de las cámaras `front` y `wrist`, y produce un vector de acción de 9 dimensiones. El modelo tiene 51.674.761 parámetros y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante como ejemplo práctico y reproducible de entrenamiento de políticas visomotoras con hardware de bajo coste (LeKiwi), y como punto de partida para quien quiera replicar el flujo completo de LeRobot: grabación de datos con teleoperación, entrenamiento con ACT y despliegue en robot real. No obstante, se trata de un modelo de nicho, con un dataset muy pequeño (20 episodios) y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras de entrada | `front`, `wrist` |
| Entrada de estado | `observation.state` de forma `(9,)` |
| Entrada visual | `observation.images.front` y `observation.images.wrist`, forma `(3, 480, 640)` |
| Salida | `action` de forma `(9,)` |
| Dataset de entrenamiento | `HueyWoo/lekiwi_pick_redcube_place_1102` (20 episodios, 5113 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras a partir de observaciones actuales (estado propioceptivo e imágenes). La arquitectura combina un backbone visual (típicamente ResNet) para extraer características de las cámaras `front` y `wrist`, un encoder del estado del robot de 9 dimensiones y un decoder transformer que genera la secuencia de acciones de 9 dimensiones. La predicción por chunks mitiga el problema de compounding error típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.6.0 durante 30.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset contiene únicamente 20 episodios teleoperados (5113 frames a 30 FPS) de la tarea "pick a red cube and place it on box". No se documenta en la model card el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje supervisado puro a partir de demostraciones. Tampoco se especifican detalles sobre aumentos de datos, composición exacta del dataset ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control visomotor de un robot LeKiwi para una tarea de manipulación concreta: coger un cubo rojo y colocarlo en una caja.
- Fusión de dos cámaras (frontal y de muñeca) con estado propioceptivo de 9 dimensiones.
- Predicción de chunks de acciones de 9 dimensiones para control de bajo nivel.
- Ejecución autónoma mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` sobre el dataset asociado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política robótica, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de aprendizaje por imitación: sirve como referencia para validar el pipeline completo de LeRobot (grabación, entrenamiento, despliegue) en un robot LeKiwi antes de escalar a tareas propias.
- Docencia y formación en robótica: permite mostrar en un laboratorio cómo una política ACT aprende una tarea de pick-and-place a partir de 20 demostraciones teleoperadas, con un coste de cómputo bajo (30.000 pasos, batch 8).
- Benchmark interno de hardware: al ser un modelo pequeño (51,7 M de parámetros, repo de 0,2 GB), se puede ejecutar en GPUs de consumo para medir latencia de inferencia y throughput del pipeline de LeRobot en un robot real.
- Base para fine-tuning en tareas similares: partiendo de esta política, se puede ajustar con un dataset propio de pick-and-place sobre LeKiwi, aprovechando que la arquitectura y los canales de observación ya están definidos.
- Pruebas de integración de cámaras y calibración: el modelo exige dos cámaras a 640x480 y 30 FPS con nombres `front` y `wrist`, por lo que es útil para validar la configuración de hardware y la sincronización antes de entrenar políticas nuevas.
- Demostración de manipulación autónoma en ferias o divulgación: la tarea es visualmente clara y el comando de rollout permite ejecuciones de duración fija (`--duration=60`), lo que facilita presentaciones controladas.
- Punto de partida para estudiar el efecto del tamaño del dataset: al contar con solo 20 episodios, permite comparar curvas de éxito al aumentar el número de demostraciones y evaluar la sensibilidad de ACT a la cantidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en safetensors (aproximadamente 207 MB en fp32), la política cabe holgadamente en cualquier GPU moderna; el grueso del consumo proviene del backbone visual y de los dos flujos de imagen de 480x640.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; se ha entrenado con `--policy.device=cuda`. Para entrenamiento se recomienda al menos una GPU de gama media; para inferencia, una GPU de consumo es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según el dataset, pero no se publican mediciones de latencia de inferencia en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HueyWoo/act_lekiwi06_pick_redcube_place_1102` (este) | 51,7 M | Estado (9,) + 2 imágenes 480x640 | Pick-and-place de cubo rojo en LeKiwi | Apache 2.0 | Hugging Face, LeRobot |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Tareas de manipulación diversas | variable (habitualmente Apache 2.0) | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación visomotora | variable | Hugging Face |
| Políticas π0 / VLA de gran escala | no disponible en la información proporcionada | no disponible | Manipulación generalista | variable | no disponible |

No se dispone de datos cuantitativos de benchmarks que permitan una comparación de rendimiento fiable con alternativas. La comparación anterior es meramente cualitativa y de categoría.

## Limitaciones y advertencias

- Dataset muy reducido: solo 20 episodios y 5113 frames, lo que limita la generalización y hace probable el sobreajuste a posiciones, iluminación y objetos concretos.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Tarea única y cerrada: entrenado exclusivamente para "pick a red cube and place it on box"; no se espera que funcione en otras tareas sin reentrenamiento o fine-tuning.
- Dependencia de hardware específico: requiere un robot `lekiwi_client` y dos cámaras con nombres y resoluciones exactas (`front`, `wrist`, 640x480, 30 FPS); cualquier desviación en la configuración invalida la política.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje; no admite tool calling, agentes ni instrucciones en lenguaje natural más allá del campo `--task` usado por LeRobot.
- Riesgo de fallo en entornos cambiantes: cambios de iluminación, posición de la caja, distracciones u objetos distintos del cubo rojo pueden degradar el comportamiento.
- Sesgos: no documentados; al ser un modelo entrenado con un dataset mínimo y un único operador, puede heredar sesgos de las demostraciones (velocidades, trayectorias, posiciones iniciales).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Fecha de creación futura en los metadatos (2026-11-01): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HueyWoo/act_lekiwi06_pick_redcube_place_1102
- Dataset de entrenamiento: https://huggingface.co/datasets/HueyWoo/lekiwi_pick_redcube_place_1102
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HueyWoo/lekiwi_pick_redcube_place_1102
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
