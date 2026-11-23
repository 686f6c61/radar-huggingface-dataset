# Chaenn/act_policy_so101_onecube_real_noaug_500

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `Chaenn/act_policy_so101_onecube_real_noaug_500`, contiene una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para una única tarea de picking: coger un cubo rojo y depositarlo dentro de un límite negro.

El modelo es una política visomotora pequeña (51,7 millones de parámetros, 0,2 GB en safetensors) que consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (muñeca y lateral) para producir acciones de 6 dimensiones a 30 FPS. Se entrenó sobre 501 episodios de teleoperación real (172.249 frames) sin aumentación de datos, durante 110.000 pasos con un batch size de 8.

Su relevancia es práctica y acotada: sirve como referencia reproducible de un pipeline completo de imitación end-to-end con LeRobot 0.6.2, útil para desarrolladores que quieran replicar el flujo de entrenamiento y despliegue en hardware de bajo coste, no como modelo generalista de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (procesa las dos cámaras de 3x480x640) con un transformer que predice chunks de acciones en lugar de un único paso, mitigando el error compuesto típico de las políticas de imitación paso a paso. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción de 6 dimensiones. El modelo sigue el diseño descrito en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Chaenn/so101_onecube_real_noaug_500`: 501 episodios, 172.249 frames a 30 FPS, tarea única "Pick up the red cube and place it inside the black boundary". Configuración: 110.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se aplicó aumentación de datos (sufijo `noaug`). No se documenta uso de RLHF, DPO ni otras fases de alineamiento; es aprendizaje por imitación supervisado puro.

## Capacidades

- Generación de acciones de manipulación de 6 dimensiones a partir de observaciones visomotoras (dos cámaras + estado articular).
- Predicción de chunks de acción, lo que reduce la acumulación de error frente a políticas paso a paso.
- Ejecución de una tarea concreta de picking y colocación en un entorno controlado.
- Funcionamiento en tiempo real a 30 FPS sobre el robot SO-101 (`so_follower`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de pipelines de imitación con LeRobot: sirve como ejemplo de referencia para entrenar una política ACT desde cero con `lerobot-train` sobre un dataset propio de teleoperación.
- Benchmark interno de manipulación pick-and-place: útil para comparar variantes de aumentación, hiperparámetros o arquitecturas sobre la misma tarea del cubo rojo.
- Docencia y formación en robótica de imitación: el modelo y su dataset permiten demostrar el ciclo completo grabación-calibración-entrenamiento-despliegue con hardware asequible (SO-101).
- Prototipado de control visomotor en laboratorio: integrable con `lerobot-rollout` para validar la política sobre un robot físico antes de escalar a tareas más complejas.
- Base para fine-tuning específico: al ser un checkpoint pequeño (0,2 GB) y con licencia Apache 2.0, se puede adaptar a variantes de la misma tarea (posiciones, colores, distractor) con pocos datos adicionales.
- Validación de infraestructura de inferencia robótica: permite probar latencias, tasas de frames y sincronización cámara-robot en un entorno realista sin depender de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (0,2 GB), la inferencia cabe holgadamente en GPUs consumer de 4-8 GB, e incluso es viable en CPU para pruebas.
- GPU recomendadas: cualquier GPU NVIDIA consumer (RTX 3060, 4060, 4090) o profesional (A100, H100) es sobredimensionada; el cuello de botella real es la captura de cámaras y el bucle de control a 30 FPS.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el sistema opera a 30 FPS según el dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaenn/act_policy_so101_onecube_real_noaug_500 | 51,7 M | no aplica | Pick-and-place cubo rojo (SO-101) | apache-2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación por imitación | apache-2.0 (típicamente) | Hugging Face / LeRobot |
| Diffusion Policy (referencia metodológica) | variable | no aplica | Manipulación por imitación | variable | Papers / repos |
| Políticas VLA tipo OpenVLA | miles de millones | varios miles de tokens | Manipulación generalista | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Pick up the red cube and place it inside the black boundary"); no generaliza a otras tareas sin reentrenamiento.
- Sin aumentación de datos (`noaug`), lo que probablemente reduce la robustez frente a cambios de iluminación, posición de objetos o distractor.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Sensible al hardware: requiere el robot `so_follower` y cámaras con los nombres `wrist` y `side` en la configuración exacta de observación.
- Riesgo de sobreajuste al entorno de grabación (mesa, cámara, iluminación) del dataset original.
- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K, ni usarse para tareas de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de reutilizarlo.
- Sin información sobre sesgos; al ser una política de imitación, hereda los sesgos y limitaciones de las demostraciones de teleoperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_onecube_real_noaug_500
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_onecube_real_noaug_500
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_onecube_real_noaug_500
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
