# Chaenn/act_policy_so101_onecube_sim_drphys_high_450

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y permite obtener tasas de éxito elevadas a partir de datos de teleoperación. Este repositorio concreto, `Chaenn/act_policy_so101_onecube_sim_drphys_high_450`, es una política entrenada con LeRobot sobre el robot `so_follower` (SO-101) para una tarea única de manipulación: coger un cubo rojo y colocarlo dentro de un límite negro.

La política consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (vista lateral y vista de muñeca), y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre un dataset simulado de 450 episodios y 200.471 fotogramas a 30 FPS, con 170.000 pasos de optimización, batch de 8, AdamW y learning rate de 1e-5. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors.

Es relevante como ejemplo reproducible de un pipeline completo de imitación en robótica con LeRobot: dataset público, configuración de entrenamiento documentada y comando de despliegue listo para ejecutar en hardware real. No obstante, es un modelo de nicho, sin métricas de evaluación publicadas y sin datos de idioma (no es un modelo de lenguaje).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación definida por la configuración de ACT, no documentada aquí) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de acciones futuras a partir de observaciones multimodales (imágenes y estado propioceptivo), con un mecanismo de agregación temporal (temporal ensembling) durante la inferencia para suavizar la ejecución. En esta política, las entradas son `observation.state` de forma `(6,)`, `observation.images.side` de forma `(3, 480, 640)` y `observation.images.wrist` de forma `(3, 480, 640)`; la salida es `action` de forma `(6,)`. El robot objetivo es `so_follower` con dos cámaras (`side` y `wrist`).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Chaenn/so101_onecube_sim_drphys_high_450`: 450 episodios, 200.471 fotogramas a 30 FPS, una única tarea ("Pick up the red cube and place it inside the black boundary"). Configuración: 170.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta el número total de tokens ni composición del dataset más allá de las cifras anteriores, ni si hubo etapas de RLHF/DPO (no aplica en este paradigma de aprendizaje por imitación supervisado).

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y del estado articular.
- Aprendizaje por imitación a partir de teleoperación: reproduce la tarea demostrada ("coger el cubo rojo y colocarlo dentro del límite negro").
- Predicción de chunks de acción, que reduce el error de acumulación frente a políticas paso a paso.
- Fusión de información visual estéreo (vista lateral y de muñeca) con estado propioceptivo.
- Ejecución en bucle cerrado sobre el robot `so_follower` mediante `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, OCR) ni de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de recogida y colocación del cubo rojo en el límite negro sobre un SO-101, útil como banco de pruebas de pipelines de imitación antes de escalar a tareas reales.
- Reproducción de experimentos de investigación: sirve como referencia reproducible de un entrenamiento ACT con dataset y configuración públicos, para comparar variantes de arquitectura o de datos.
- Generación de datos sintéticos y evaluación en simulación: al proceder de un dataset simulado (`sim_drphys`), puede emplearse para estudiar el gap sim-a-real antes de desplegar en hardware.
- Docencia y formación en robótica de imitación: ejemplo mínimo (0,2 GB, 51,7 M de parámetros) para enseñar el flujo completo de LeRobot (grabación, entrenamiento, rollout).
- Base para fine-tuning en tareas relacionadas: punto de partida para reentrenar con nuevos datasets de manipulación sobre el mismo robot y cámaras.
- Validación de hardware y calibración: ejecutar la política permite verificar cámaras, puerto del robot y calibración articular en un montaje SO-101.
- Benchmark interno de latencia y throughput de inferencia en GPUs de consumo para políticas ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que la VRAM dominante será la de los buffers de las dos cámaras a 480x640 y el runtime de PyTorch.
- GPU recomendadas: cualquier GPU con CUDA y al menos 2-4 GB de VRAM debería ser suficiente; se recomienda una RTX 3060/4060 o superior para margen con las dos cámaras y el preprocesado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con CUDA; también podría ejecutarse en CPU, con mayor latencia (no medida).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), PyTorch; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI (no aplican a políticas de robótica).
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según el dataset, pero no se publica la latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaenn/act_policy_so101_onecube_sim_drphys_high_450 (este) | 51,7 M | no aplica | Pick-and-place SO-101 | apache-2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | Manipulación genérica | variable (mayoría apache-2.0) | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación visomotora | variable | Hugging Face / repositorios de investigación |
| Políticas VLA tipo OpenVLA / pi0 | miles de millones | no aplica | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para este modelo concreto; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea única y muy específica: solo se ha entrenado para "coger el cubo rojo y colocarlo dentro del límite negro"; no generaliza a otras tareas sin reentrenamiento.
- Entrenado en simulación (`sim_drphys`): el gap sim-a-real puede degradar el éxito en hardware físico; no hay evaluación real publicada.
- Sin métricas de éxito ni número de ensayos: no es posible estimar la fiabilidad en producción.
- Dependencia de la configuración exacta de cámaras (`side`, `wrist`) y del robot `so_follower`; cambios de montaje, iluminación o fondo pueden afectar al rendimiento.
- Riesgo de sobreajuste al dataset de 450 episodios y a una sola tarea; no se documentan distractores, variaciones de posición ni robustez.
- No es un modelo de lenguaje: no procesa texto libre, no tiene capacidades multilingües ni de razonamiento simbólico.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset asociado antes de reutilizarlo.
- Sin datos de sesgos: al ser una política de control, los sesgos relevantes serían de distribución (posiciones, colores, objetos) del dataset de entrenamiento, no documentados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_onecube_sim_drphys_high_450
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_onecube_sim_drphys_high_450
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_onecube_sim_drphys_high_450
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
