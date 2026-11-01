# knight7024/act_pick_and_place_hair_roll_final

## Resumen

`knight7024/act_pick_and_place_hair_roll_final` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación: recoger y colocar un rulo de pelo ("pick_and_place_hair_roll_final") sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste) equipado con dos cámaras, una cenital y otra en la muñeca.

A diferencia de un LLM, no es un modelo de lenguaje: es un policy de control motor que consume el estado articular (6 dimensiones) y dos imágenes RGB de 240x320 píxeles, y produce un vector de acción de 6 dimensiones. Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar políticas de imitación reproducibles a partir de teleoperación, con 51,7 millones de parámetros y un repositorio de solo 0,2 GB, lo que permite ejecutarlo en hardware modesto.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice "chunks" de acciones en lugar de pasos individuales, técnica descrita en el paper ACT (arXiv:2304.13705). Se entrenó con 60 episodios y 43.285 fotogramas a 30 FPS, durante 300.000 pasos con batch size 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual ResNet + transformer con decodificador de chunks de acciones |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación por frame, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (típicamente ResNet-18 preentrenado en ImageNet) que procesa las dos cámaras (`observation.images.top` y `observation.images.wrist`, ambas 3x240x320) con un transformer encoder-decoder que fusiona las características visuales, el estado articular (`observation.state`, 6 dimensiones) y una representación latente de la tarea. La innovación clave es la predicción de chunks de acciones: en lugar de emitir una acción por paso, el decodificador genera una secuencia corta de acciones futuras, lo que reduce el error de compounding y suaviza el control. Se emplea además una pérdida de reconstrucción sobre el latent (CVAE) para capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con el dataset `knight7024/pick_and_place_hair_roll_final`: 60 episodios, 43.285 fotogramas a 30 FPS, una única tarea. Configuración: 300.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05, semilla 1000, LeRobot 0.6.1. No se documenta composición del dataset más allá del número de episodios ni si hubo aumentación de datos o ajuste fino adicional.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado y visión.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital y una vista de muñeca.
- Aprendizaje por imitación: reproduce una tarea específica aprendida de teleoperación humana.
- Predicción de chunks de acciones: salida temporalmente coherente que mejora la estabilidad del control.
- Ejecución en tiempo real a 30 FPS sobre hardware de bajo coste.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: el policy ejecuta la secuencia de recogida y colocación del rulo de pelo sobre el robot SO-100/SO-101, sustituyendo la teleoperación manual en tareas repetitivas.
- Base para fine-tuning en tareas similares: sirve como punto de partida (con `lerobot-train --policy.type=act`) para entrenar variantes sobre nuevos objetos o posiciones con pocos episodios adicionales.
- Validación de pipelines de LeRobot: útil como referencia reproducible del flujo completo (grabación, entrenamiento, rollout) en entornos de investigación y docencia.
- Prototipado rápido en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, se puede desplegar en un PC con GPU consumer junto al robot.
- Benchmark interno de imitación: comparar la tasa de éxito de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre la misma tarea y dataset.
- Demostraciones educativas: ilustra el paradigma de action chunking y CVAE en cursos de aprendizaje por refuerzo e imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de dos imágenes 240x320 a 30 FPS, no el peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=knight7024/act_pick_and_place_hair_roll_final`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: el entrenamiento se hizo a 30 FPS con batch size 1; no se publican medidas de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knight7024/act_pick_and_place_hair_roll_final | 51,7 M | ACT (imitación) | 2 cámaras 240x320 + estado 6D | apache-2.0 | HuggingFace (LeRobot) |
| Políticas ACT genéricas de LeRobot | ~50 M (típico) | ACT | Configurable por dataset | apache-2.0 | HuggingFace |
| Diffusion Policy (referencia) | variable, mayor | Difusión para control | Configurable | MIT/Apache según implementación | Repos de investigación |
| VQ-BeT (referencia) | variable | Transformer discretizado | Configurable | MIT | Repos de investigación |

No se dispone de datos de rendimiento comparativo para esta política concreta; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Específica de una única tarea ("pick_and_place_hair_roll_final") y de un robot concreto (`so_follower`): no generaliza a otros objetos, robots o disposiciones sin reentrenamiento.
- Sin evaluación publicada: se desconoce la tasa de éxito real, la robustez ante cambios de iluminación, posiciones o distracciones.
- Sensible al entorno de captura: las cámaras deben coincidir en nombre y resolución con las observaciones de entrenamiento (`top`, `wrist`, 240x320).
- Dataset pequeño (60 episodios, 43.285 fotogramas): riesgo de sobreajuste y de baja cobertura de estados.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos ni alucinaciones textuales, pero puede generar acciones incorrectas o inseguras ante estados fuera de distribución.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción requiere validación propia en robot real.
- Requiere calibración y cableado correctos del robot y las cámaras; errores de calibración degradan el control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knight7024/act_pick_and_place_hair_roll_final
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_hair_roll_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_hair_roll_final
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
