# MaKaRobotics/first_test_s5000_b2

## Resumen

`MaKaRobotics/first_test_s5000_b2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular del robot y una imagen de muñeca, predice directamente comandos de acción de 6 dimensiones. El modelo lo desarrolla el usuario MaKaRobotics y su relevancia es la de un artefacto de entrenamiento reproducible dentro del ecosistema LeRobot, no la de un modelo de propósito general.

La arquitectura es ACT, un transformer que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución en robots reales. El modelo tiene 51.668.614 parámetros y está entrenado sobre un dataset propio de 51 episodios y 19.643 fotogramas a 30 FPS para la tarea "Grab the cube" con un robot `so_follower` y una cámara de muñeca.

Por su naturaleza, el alcance es muy acotado: una única tarea, un único tipo de robot y una única configuración de cámara. Es útil como referencia para reproducir un pipeline de imitación con LeRobot, pero no debe considerarse un modelo generalista ni evaluarse con métricas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice secuencias cortas de acciones (chunks). La entrada del modelo son dos features: `observation.state` con forma `(6,)` (estado articular del robot) y `observation.images.wrist` con forma `(3, 480, 848)` (imagen RGB de la cámara de muñeca). La salida es `action` con forma `(6,)`. El chunking de acciones es la innovación central del método: en lugar de predecir un único paso, el modelo emite un bloque de acciones, lo que mitiga el error acumulado típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `MaKaRobotics/record-test_20261125_224850`: 51 episodios, 19.643 fotogramas a 30 FPS, tarea "Grab the cube". La configuración reportada es 5.000 pasos, batch size 2, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en imitación supervisada), ni aumentos de datos.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen de muñeca.
- Ejecución de una tarea concreta de agarre ("Grab the cube") sobre robot `so_follower`.
- Predicción de action chunks, lo que aporta estabilidad en la ejecución frente a políticas de paso único.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Reproducción de un pipeline de imitación con LeRobot: sirve como punto de partida para validar la instalación, el flujo de `lerobot-train` y `lerobot-rollout` antes de entrenar políticas propias con más datos.
- Prototipado de agarre de objetos en laboratorio: el modelo puede ejecutar la tarea "Grab the cube" sobre un `so_follower` con cámara de muñeca, útil para pruebas de concepto de manipulación.
- Docencia y formación: ejemplo real y acotado de política ACT para explicar action chunking, formatos de observación y configuración de entrenamiento en robótica.
- Base para fine-tuning: al estar en formato safetensors y ligado a LeRobot, puede reentrenarse sobre un dataset propio con la misma topología de observaciones y acciones.
- Benchmark interno de infraestructura: con 51,7 M de parámetros y 0,2 GB de repo, es adecuado para medir latencia de inferencia y throughput en GPUs de gama baja antes de escalar a políticas mayores.
- Validación de hardware y calibración: permite comprobar que la cámara de muñeca, el puerto del robot y las claves de observación están correctamente configurados antes de invertir en datasets grandes.
- Referencia para comparar configuraciones de entrenamiento (pasos, batch, learning rate) en tareas de agarre con datos teleoperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros) es esperable que quepa en GPUs consumer con varios GB de VRAM, pero no hay medición publicada.
- GPU recomendadas: no disponible; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU consumer: probablemente sí por el reducido número de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=MaKaRobotics/first_test_s5000_b2`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaKaRobotics/first_test_s5000_b2 | 51.668.614 | no aplica | Agarre "Grab the cube" con `so_follower` | no disponible | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación teleoperada | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación teleoperada | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento entre esta política y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 51 episodios de una única tarea, la política está fuertemente sesgada hacia esa distribución de posiciones, iluminación y objetos.
- Riesgo de alucinación: no aplica en el sentido de NLP, pero sí existe riesgo de acciones erróneas fuera de distribución que pueden provocar fallos de agarre o colisiones.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa lenguaje, solo estado articular e imagen.
- Restricciones de licencia: la licencia no está definida ("More Information Needed"), por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Caveats para producción: no hay resultados de evaluación publicados, el dataset es pequeño (51 episodios, 19.643 fotogramas), el batch size de entrenamiento es 2 y el número de pasos es 5.000, lo que sugiere un entrenamiento corto. La política está atada a un robot `so_follower` y a una cámara de muñeca con resolución 480x848; cambiar la configuración de cámara o el robot invalida su uso directo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en 2026-11-26, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaKaRobotics/first_test_s5000_b2
- Dataset de entrenamiento: https://huggingface.co/datasets/MaKaRobotics/record-test_20261125_224850
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MaKaRobotics/record-test_20261125_224850
