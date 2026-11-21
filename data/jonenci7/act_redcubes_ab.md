# JonEnci7/act_redcubes_AB

## Resumen

`JonEnci7/act_redcubes_AB` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario JonEnci7 en Hugging Face mediante la librería LeRobot de Hugging Face, y está diseñado para controlar un robot seguidor de tipo `so_follower` (SO-100/SO-101) equipado con dos cámaras: una cámara denominada `Lerobot` y otra denominada `Satelital`.

La política resuelve una tarea concreta de manipulación: "levantando cubos rojos". Consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en tiempo real sobre hardware modesto.

Es relevante como ejemplo práctico de un pipeline completo de imitación robótica con LeRobot: incluye dataset, configuración de entrenamiento reproducible y comandos de despliegue. No obstante, se trata de un modelo de nicho, entrenado sobre un dataset muy pequeño (36 episodios, 26.291 frames) y sin resultados de evaluación publicados, por lo que su utilidad fuera del entorno exacto de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador visual (procesa las dos imágenes de 3x480x640), un codificador del estado del robot (vector de 6 dimensiones) y un transformer que genera un chunk de acciones futuras en lugar de una única acción. Esta predicción por fragmentos reduce el error de composición acumulado típico de las políticas paso a paso y suaviza el comportamiento del robot.

El entrenamiento se realizó con LeRobot 0.7.0 durante 10.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset `JonEnci7/redcubes_AB` contiene 36 episodios y 26.291 frames a 30 FPS de teleoperación sobre la tarea "levantando cubos rojos". No se documenta el uso de RLHF, DPO ni ningún proceso de refinamiento posterior; es aprendizaje supervisado puro a partir de demostraciones. El modelo card no detalla innovaciones adicionales más allá del propio chunking de acciones.

## Capacidades

- Control robótico por imitación para la tarea específica "levantando cubos rojos" sobre un robot `so_follower`.
- Fusión de dos entradas visuales (cámara `Lerobot` y cámara `Satelital`) con el estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para control de articulaciones.
- Inferencia en tiempo real a 30 FPS (frecuencia del dataset de entrenamiento).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, ni capacidades multilingües: es una política visuomotora, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Recogida automatizada de cubos rojos en un entorno de laboratorio: el modelo está entrenado exactamente para esta tarea con el robot `so_follower` y las dos cámaras especificadas, por lo que es su uso directo y previsto.
- Prototipado de pipelines de imitación robótica: sirve como referencia reproducible para validar el flujo completo de LeRobot (grabación de dataset, entrenamiento ACT, rollout) antes de escalar a tareas propias.
- Docencia y experimentación en robótica de manipulación: con 51,7 millones de parámetros y 0,2 GB de pesos, se puede ejecutar en equipos de laboratorio modestos y permite estudiar el efecto del chunking de acciones.
- Base para fine-tuning con nuevos datasets: el checkpoint puede reentrenarse con `lerobot-train` sobre datos propios del mismo robot y tipo de cámara para adaptarlo a otras tareas de pick-and-place.
- Evaluación comparativa de métodos de imitación: útil como línea base ACT frente a otras políticas (diffusion policy, VLA) en experimentos controlados con el mismo dataset.
- Demostraciones de bajo coste en ferias o aulas: al ser ligero y no requerir GPU de gran tamaño, permite montar demos en vivo de manipulación robótica con hardware asequible.
- Investigación sobre robustez a cambios de iluminación o posición: permite medir la degradación de una política ACT entrenada con pocos episodios cuando varían las condiciones del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, una RTX 3090/4090 es suficiente dado el reducido tamaño del modelo y del dataset.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch con safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles de forma oficial; el dataset opera a 30 FPS (33 ms por frame), lo que marca el presupuesto temporal típico de inferencia para control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JonEnci7/act_redcubes_AB` | 51,7 M | 2 imágenes 480x640 + estado (6,) | Manipulación (levantar cubos rojos) | no disponible | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | Imágenes + estado | Manipulación genérica | Apache-2.0 (LeRobot) | Hugging Face / docs LeRobot |
| Diffusion Policy (referencia LeRobot) | no disponible | Imágenes + estado | Manipulación genérica | Apache-2.0 (LeRobot) | Hugging Face / docs LeRobot |
| Políticas VLA tipo RT-2 / OpenVLA | miles de millones | Imágenes + instrucciones en lenguaje | Manipulación generalista | según modelo | Hugging Face / repos públicos |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni métricas comparables en la información proporcionada. Frente a políticas VLA generalistas, este modelo es tres o cuatro órdenes de magnitud más pequeño y está especializado en una única tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse con 36 episodios de un único operador y entorno, la política hereda los sesgos de esas demostraciones (posiciones, velocidades y estilo de manipulación).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la política solo entiende las dos cámaras y el estado articular con los que fue entrenada. Cualquier cambio en nombres de cámara, resolución o morfología del robot invalida el modelo.
- Restricciones de licencia: la licencia no está especificada en la model card ("More Information Needed"), por lo que no se puede asumir uso comercial sin consultar al autor.
- Dataset muy pequeño (36 episodios, 26.291 frames) y sin evaluación publicada: la tasa de éxito real es desconocida.
- Sin garantías de robustez ante cambios de iluminación, posición de objetos, distracciones o un robot distinto del mismo tipo.
- Modelo de nicho con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Para producción se recomienda evaluar exhaustivamente en el entorno real antes de cualquier despliegue y añadir capas de seguridad a nivel de controlador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JonEnci7/act_redcubes_AB
- Dataset de entrenamiento: https://huggingface.co/datasets/JonEnci7/redcubes_AB
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JonEnci7/redcubes_AB
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
