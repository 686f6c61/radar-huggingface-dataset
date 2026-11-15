# Rlayd36/act_pickandplace_cube

## Resumen

`Rlayd36/act_pickandplace_cube` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario Rlayd36 en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está diseñado para controlar un robot tipo `so_follower` (SO-100/SO-101) equipado con dos cámaras: una cenital (`overhead`) y otra en la muñeca (`wrist`).

La tarea concreta es "Red block pickup and place": recoger un bloque rojo y colocarlo en otra posición. El modelo consume el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640 y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto, incluso en CPU o en GPUs de consumo.

Es relevante como ejemplo práctico de política de imitación reproducible de extremo a extremo: incluye el dataset de entrenamiento (60 episodios, 32.476 fotogramas a 30 FPS), la configuración de entrenamiento completa (100.000 pasos, batch 8, AdamW, lr 1e-5) y comandos listos para ejecutar con `lerobot-rollout` y `lerobot-train`. No obstante, no se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos de tiempo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras (varias acciones consecutivas) a partir de las observaciones actuales, en lugar de predecir una sola acción por paso. La arquitectura combina un codificador de imágenes (procesa las dos cámaras, `overhead` y `wrist`, a 480x640) con un codificador del estado articular (vector de 6 dimensiones) y un decodificador transformer que genera el chunk de acciones (vector de 6 dimensiones por paso). Esta predicción por chunks reduce el error de acumulación y mejora la estabilidad frente a métodos paso a paso.

El entrenamiento se realizó sobre el dataset `Rlayd36/pick-cube_20261113_161307`, con 60 episodios y 32.476 fotogramas a 30 FPS, para la tarea "Red block pickup and place". La configuración es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni otras fases de ajuste posteriores; es aprendizaje por imitación puro a partir de datos de teleoperación. Tampoco se detalla la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico de manipulación: recogida y colocación de un bloque rojo sobre un robot `so_follower` con 6 grados de libertad de acción.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (cenital y de muñeca) a 480x640.
- Predicción de chunks de acciones: genera secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la suavidad y la estabilidad del control.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Integración con LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control motor, no un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la tarea de recoger un bloque rojo y colocarlo en otra posición sobre un SO-100/SO-101, útil como base para experimentos de manipulación en entornos controlados.
- **Punto de partida para fine-tuning**: al estar entrenado con LeRobot y publicar el dataset, sirve como inicialización para reentrenar con `lerobot-train` sobre nuevas posiciones de objeto o variaciones de iluminación.
- **Docencia y formación en robótica de imitación**: ejemplo completo y reproducible del flujo LeRobot (grabación de datos, entrenamiento, despliegue) para cursos y talleres.
- **Benchmark interno de políticas ACT**: referencia de configuración (100k pasos, batch 8, lr 1e-5) para comparar variantes de arquitectura o hiperparámetros en la misma tarea.
- **Prototipado rápido en hardware de bajo coste**: con 51,7 M de parámetros y 0,2 GB de pesos, puede desplegarse en estaciones con GPU de consumo o incluso CPU para pruebas de integración.
- **Validación de pipelines de datos**: el dataset de 60 episodios y 32.476 fotogramas permite probar herramientas de visualización y curación de datos de LeRobot antes de escalar a datasets mayores.
- **Investigación en chunking de acciones**: permite estudiar el efecto del tamaño de chunk y de la frecuencia de control (30 FPS) en la estabilidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja. Con 51,7 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,2 GB; en fp16, unos 0,1 GB. El cuello de botella es el procesamiento de dos imágenes de 480x640 por paso, no el tamaño del modelo.
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se espera una GPU NVIDIA. Una RTX 3060, RTX 4060, RTX 4090 o una A100 funcionan sin problema; las GPUs de gama alta no aportan ventaja significativa por el reducido tamaño del modelo.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo moderna (incluso GTX 1650 o superior). También es viable en CPU para pruebas, aunque con mayor latencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que carga los pesos safetensors desde el Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. La frecuencia de control del dataset es de 30 FPS, lo que sugiere que el bucle de inferencia debe sostener ese ritmo, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rlayd36/act_pickandplace_cube` | 51,7 M | no aplica | Pick-and-place de bloque rojo con SO-100 | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (referencia) | variable (decenas de M) | no aplica | Manipulación genérica con SO-100 | apache-2.0 (segun configuracion) | Hugging Face / LeRobot |
| Políticas Diffusion Policy (referencia) | variable | no aplica | Manipulación por difusión de acciones | variable | Hugging Face / LeRobot |
| Políticas π0 / VLA de gran escala | miles de M | no aplica | Manipulación generalista | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad. Las políticas VLA de gran escala (como π0) son órdenes de magnitud mayores y generalistas, mientras que esta política es específica de una tarea y un robot.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito en robot real; no se puede afirmar que la política funcione de forma fiable fuera del entorno de entrenamiento.
- **Especificidad de tarea**: entrenada únicamente para "Red block pickup and place"; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- **Dependencia del hardware**: requiere un robot `so_follower` con la misma configuración de cámaras (`overhead` y `wrist`) y los mismos nombres de observación; cambios en la cámara o en la calibración degradan el rendimiento.
- **Sesgo de datos**: 60 episodios y 32.476 fotogramas de una única configuración implican un dataset pequeño; la política puede sobreajustarse a posiciones, iluminación y fondo concretos.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar acciones fuera de distribución ante situaciones no vistas, con riesgo de colisiones o daños en el robot.
- **Licencia**: apache-2.0 permite uso comercial, pero el autor no ofrece garantías; verificar la licencia del dataset asociado antes de reutilizarlo.
- **Sin soporte de lenguaje ni razonamiento**: no es un modelo de chat ni de agentes; no debe evaluarse con benchmarks de NLP.
- **Repositorio sin descargas ni likes**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/act_pickandplace_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261113_161307
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261113_161307
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
