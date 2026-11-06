# ib-007/vlarm_act_t1_v3_aux0

## Resumen

`ib-007/vlarm_act_t1_v3_aux0` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `ib-007` en Hugging Face Hub y se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Resuelve el problema de control robótico de manipulación: dado el estado del robot, dos cámaras (frontal y de muñeca) y cierta información del entorno, genera comandos de acción de 6 dimensiones.

La relevancia de este modelo es acotada: se trata de una política específica para un robot simulado de tipo `so101_sim` y una tarea concreta de recogida de cubos de colores y depósito en una papelera. No es un modelo de lenguaje ni un modelo fundacional multimodal, sino un checkpoint de imitación de 51,7 millones de parámetros, con licencia Apache 2.0, pensado para ejecutarse con el stack de LeRobot.

El contexto técnico es el de la investigación en manipulación robótica con aprendizaje por imitación: ACT se ha consolidado como una referencia por su simplicidad y sus tasas de éxito en tareas de precisión, y este checkpoint concreto sirve como ejemplo reproducible de entrenamiento sobre un dataset simulado de 993 episodios y 116.300 fotogramas a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.687.980 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las tareas se especifican como cadenas de texto en la CLI) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras en lugar de una sola acción por paso, lo que reduce el error de acumulación y suaviza el control. La política consume `observation.state` (6 dimensiones), dos imágenes RGB de 256×256 (`front` y `wrist`), `observation.environment_state` (3 dimensiones) y una observación auxiliar `observation.aux_cube_xy` (6 dimensiones), y produce una acción de 6 dimensiones. El robot objetivo es `so101_sim`, un simulador.

El entrenamiento se realizó sobre el dataset `ib-007/vlarm_sim_t1_v2_aux`, con 993 episodios, 116.300 fotogramas a 30 FPS y seis variantes de tarea de recogida y depósito de cubos rojo, azul y verde. La configuración reportada es de 50.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores; es aprendizaje por imitación supervisado a partir de datos de teleoperación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so101_sim`.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad frente a la predicción paso a paso.
- Fusión multimodal de observaciones: integra estado propioceptivo, estado del entorno y dos flujos visuales (frontal y de muñeca).
- Ejecución de tareas de pick-and-place: entrenado para recoger cubos rojo, azul y verde y depositarlos en una papelera.
- Uso de observación auxiliar: incorpora `aux_cube_xy` como señal adicional de estado, lo que sugiere un diseño con información privilegiada durante el entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en simulación: ejecutar la política con `lerobot-rollout` sobre `so101_sim` para validar el pipeline de ACT de extremo a extremo antes de pasar a hardware real.
- Baseline para comparación de métodos: usar este checkpoint como referencia de ACT en tareas de pick-and-place y comparar con políticas alternativas (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Generación de datos sintéticos de evaluación: ejecutar la política en el simulador para producir trayectorias y analizar tasas de éxito, tiempos de ejecución y modos de fallo.
- Estudio de observaciones auxiliares: el campo `aux_cube_xy` permite investigar cómo influye disponer de información privilegiada del objeto en el rendimiento de la política.
- Docencia y formación en robótica: ejemplo completo y reproducible de entrenamiento con LeRobot, desde la grabación de datos hasta el despliegue, adecuado para cursos prácticos.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio del mismo tipo de robot y tareas similares, partiendo de la configuración reportada.
- Pruebas de integración del stack LeRobot: verificar la compatibilidad de versiones (0.6.1), el formato de observaciones y los comandos de CLI en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y pesos en safetensors, la inferencia cabe holgadamente en GPUs de consumo, aunque el cuello de botella real es el procesamiento de dos imágenes de 256×256 por paso.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA de gama media o superior es suficiente; no se documentan requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ib-007/vlarm_act_t1_v3_aux0` (ACT) | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | no disponible | no aplica | no disponible en esta ficha | no disponible | implementaciones públicas |
| VQ-BeT | no disponible | no aplica | no disponible en esta ficha | no disponible | implementaciones públicas |

No se dispone de datos comparativos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Específico de un robot simulado (`so101_sim`): no se garantiza transferencia a hardware real ni a otros robots sin reentrenamiento.
- Entrenado para seis tareas concretas de recogida de cubos; fuera de ese dominio de objetos y posiciones el comportamiento es impredecible.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas que permitan estimar su fiabilidad en producción.
- Dependencia de observaciones auxiliares (`aux_cube_xy`): si esa información no está disponible en despliegue, el rendimiento puede degradarse.
- Riesgo de sobreajuste al dataset simulado y a las condiciones de iluminación, cámara y disposición de objetos del entrenamiento.
- No procesa lenguaje natural ni admite instrucciones arbitrarias; la tarea se selecciona entre las cadenas predefinidas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo implícito en el aprendizaje por imitación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ib-007/vlarm_act_t1_v3_aux0
- Dataset de entrenamiento: https://huggingface.co/datasets/ib-007/vlarm_sim_t1_v2_aux
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ib-007/vlarm_sim_t1_v2_aux
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
