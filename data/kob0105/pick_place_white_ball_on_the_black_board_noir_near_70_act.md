# kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_70_act

## Resumen

kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_70_act es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers) para un brazo robótico de tipo `so_follower` de la familia SO-100/SO-101. No es un modelo de lenguaje: es un modelo de control visuomotor entrenado con LeRobot 0.6.1 que consume el estado articular (`observation.state`, 6 dimensiones) y dos cámaras RGB de 480x640 (una global y otra en la muñeca, `palm`) para producir un vector de acción de 6 dimensiones. El repositorio pesa 0,2 GB y el checkpoint en safetensors declara 51.668.614 parámetros.

El modelo resuelve una tarea muy concreta: coger y colocar una bola blanca sobre un tablero negro ("pick place white ball with ir"), con datos de teleoperación en los que se usa iluminación y cámara sin filtro IR (NoIR). Se entrenó durante 30.000 pasos con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, sobre un dataset de 30 episodios y 12.788 fotogramas grabados a 30 FPS. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es práctica más que algorítmica: sirve como referencia reproducible de un pipeline completo de imitación de bajo coste (grabación con LeRobot, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para reentrenar o evaluar políticas visuomotoras en hardware asequible. La model card no incluye resultados de evaluación en robot real, por lo que el rendimiento real de la política no está cuantificado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con codificadores visuales, entrenado por imitación; predice trozos de acción en lugar de pasos individuales |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; política de imitación. Entrada: `observation.state` (6,) más dos imágenes `(3, 480, 640)`. Horizonte de observación y tamano de chunk no especificados en la model card |
| Tipos de cuantizacion | no disponible (no se documentan recetas de cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se describe en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,2 GB |
| Tipo de robot | `so_follower` |
| Camaras | `global`, `palm` |
| Salida | `action` (6,) |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.6.1 |
| Fecha de creacion (segun Hub) | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques cortos de acciones futuras en lugar de una única acción por paso de control, lo que reduce el error de acumulacion y suaviza el comportamiento de la política. La implementación usada aquí es la de LeRobot, que combina codificadores visuales para las imágenes de las cámaras `global` y `palm` con un transformer encoder-decoder que fusiona la representación visual y el estado articular de 6 dimensiones para emitir el vector de acción de 6 dimensiones. La model card no detalla el tamano de los bloques de acción ni el horizonte de observación empleados en este entrenamiento concreto.

El entrenamiento se realizó sobre el dataset kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612: 30 episodios, 12.788 fotogramas, 30 FPS y la tarea "pick place white ball with ir". La configuración reportada es de 30.000 pasos, batch de 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; se trata de imitación supervisada pura sobre demostraciones teleoperadas. Tampoco se documentan aumentos de datos, normalización de acciones ni estrategias de regularización más allá de lo que aplica la receta estándar de LeRobot.

## Capacidades

- Control visuomotor de un brazo `so_follower` con 6 grados de libertad: genera comandos de acción de 6 dimensiones a partir de estado y visión.
- Ejecución de la tarea específica de coger y colocar una bola blanca sobre un tablero negro, con la iluminación y el montaje de cámara del dataset de entrenamiento.
- Fusión multimodal de dos cámaras simultáneas: una vista `global` de la escena y una vista `palm` en la muñeca del robot.
- Predicción de trozos de acción (action chunking), lo que permite ejecutar secuencias coherentes sin depender de inferencia a la frecuencia completa del bucle de control.
- Despliegue directo con el CLI de LeRobot (`lerobot-rollout`) y reentrenamiento con `lerobot-train`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo "thinking": es una política robótica de tarea única.
- Capacidades multilingües: no aplica; el único texto asociado es la etiqueta de tarea `"pick place white ball with ir"`.

## Casos de uso

- Automatización de pick and place en laboratorio: la política toma la bola blanca y la deposita sobre el tablero negro usando las vistas global y de muñeca, adecuada para bancos de prueba de manipulación de objetos pequeños.
- Replicación de experimentos de imitación: sirve como referencia reproducible del flujo completo de LeRobot (grabación, entrenamiento ACT, despliegue) para comparar variantes de hiperparámetros o de dataset.
- Evaluación de hardware de bajo coste: al tratarse de una política de 51,7 M de parámetros y 0,2 GB, permite medir latencia y tasa de éxito en brazos SO-100/SO-101 con GPU de gama media o embebida.
- Generación de datos aumentados para otras políticas: ejecutando el modelo en bucle se pueden recoger trayectorias adicionales (con `--strategy.type=base` sin grabación, o con estrategias que sí registren episodios) para ampliar el dataset original de 30 episodios.
- Punto de partida para fine-tuning en una tarea propia: reentrenar desde estos pesos con `lerobot-train --policy.type=act` sobre un dataset nuevo reduce el coste frente a entrenar desde cero, siempre que se mantenga el mismo tipo de robot y la misma estructura de observaciones.
- Validación de montajes con cámara NoIR: útil para comprobar si la eliminación del filtro IR y la iluminación empleada en el dataset son condiciones necesarias para que la política converja, y para estudiar sensibilidad a cambios de iluminación.
- Integración en pipelines de robótica con Python: el checkpoint en safetensors se carga con la librería `lerobot` dentro de un proceso Python, lo que facilita incorporarlo a scripts de control propios o a entornos de simulación con el mismo esquema de observaciones.
- Docencia y prototipado rápido: ejemplo mínimo de política visuomotora entrenada en 30.000 pasos que ilustra el coste real (datos, cómputo y tiempo) de un sistema de imitación de tarea única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no hay tasas de éxito en robot real, número de ensayos ni condiciones de dificultad documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 51.668.614 parámetros, los pesos ocupan aproximadamente 197 MiB en fp32 y 98 MiB en fp16/bf16. Sumando activaciones de dos imágenes de 480x640 y el transformer, una estimación razonable es de 1 a 3 GB de VRAM en fp32 con batch 1. Es una estimación calculada, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 2070 o superior es más que suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con holgura, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3050 8 GB o GTX 1660 6 GB. También es candidata a ejecución en Jetson Orin (8/16 GB), habitual en robots móviles, aunque no está verificado por el autor.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch; el checkpoint está en safetensors. No se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, Ollama ni TGI, que además no son formatos aplicables a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS y el bucle de control objetivo es de 30 Hz, pero la model card no reporta tiempos de inferencia por paso ni frecuencia efectiva alcanzada.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, por lo que no supone un problema de disco.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada para modelos de la misma categoría. La tabla recoge únicamente los datos verificables del modelo descrito y marca el resto como no disponible.

| Modelo | Parametros | Entrada / tarea | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_70_act (ACT) | 51.668.614 | Estado (6,) + 2 imagenes 480x640; pick and place de bola blanca | No publicado | apache-2.0 | HuggingFace Hub, libreria lerobot |
| Otras politicas ACT del Hub de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy (familia de metodos de imitacion alternativa) | no disponible | no disponible | no disponible | no disponible | no disponible |
| SmolVLA / VLA de robotica open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para "pick place white ball with ir". No generaliza a otras tareas, objetos, posiciones de cámara ni robots distintos del `so_follower`.
- Dataset muy pequeno: 30 episodios y 12.788 fotogramas, sin evaluación en robot real. El riesgo de sobreajuste a las posiciones, iluminación y fondo concretos de la grabación es alto.
- Sin tasas de éxito: no hay evidencia cuantitativa de rendimiento, por lo que no debería desplegarse en producción sin una evaluación propia con múltiples ensayos por episodio.
- Dependencia del montaje: exige dos cámaras (`global` y `palm`) a 640x480 y 30 FPS, y que los nombres de las cámaras en `lerobot-rollout` coincidan exactamente con las claves de observación del entrenamiento.
- Sensibilidad a la iluminación: el nombre del modelo y del dataset indican el uso de cámara NoIR y de iluminación IR; cambios en el espectro de luz o en el material del objeto pueden degradar el comportamiento.
- Sesgos: no se documentan análisis de sesgo. En robótica, el sesgo relevante es de distribución (posiciones, texturas, condiciones de luz del dataset) más que social o lingüístico.
- Alucinación: no aplica en el sentido generativo, pero sí existe el equivalente de acciones erráticas o fuera de distribución ante observaciones no vistas, sin señal de confianza asociada.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia. El modelo cita el método ACT y LeRobot en la model card, por lo que es buena práctica citar ambos trabajos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado por parte del autor.
- Los pesos están en safetensors y dependen de la librería `lerobot`; no se garantiza compatibilidad con versiones distintas de la 0.6.1 usada en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kob0105/pick_place_white_ball_on_the_black_board_NoIR_near_70_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/pick_whiteball_on_the_black_board_NoIR_near2_20260920_122612
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
