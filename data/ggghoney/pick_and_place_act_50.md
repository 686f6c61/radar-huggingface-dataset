# Ggghoney/pick_and_place_act_50

## Resumen

`Ggghoney/pick_and_place_act_50` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705 y publicado originalmente por el equipo de Tony Z. Zhao. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. No se trata de un modelo de lenguaje, sino de un controlador visuomotor que mapea observaciones (estado articular y dos cámaras) a comandos de acción de 6 dimensiones.

El modelo resuelve una única tarea concreta: coger un bolígrafo rojo y colocarlo en un estuche. Se ha entrenado con 50 episodios de teleoperación (41.754 fotogramas a 30 FPS) sobre un robot `omx_follower` con dos cámaras (`front` y `top`). Su arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en manipulación precisa.

Es relevante como ejemplo reproducible de un pipeline completo de imitación con LeRobot: dataset público, configuración de entrenamiento documentada y comandos de despliegue listos para usar. Con 51,7 millones de parámetros y un repo de 0,2 GB, es ligero y desplegable en hardware de consumo, aunque su ámbito de aplicación está estrictamente limitado a la tarea y al robot con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea es fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una sola acción. La política consume `observation.state` (vector de 6 dimensiones), dos imágenes RGB de 480×640 (`front` y `top`) y produce un vector de acción de 6 dimensiones. El modelo incluye un encoder visual para las cámaras y un decoder que genera la secuencia de acciones; el paper original introduce técnicas como el *temporal ensembling* para suavizar la predicción entre chunks.

El entrenamiento se realizó con LeRobot 0.6.2 durante 15.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. El dataset contiene 50 episodios (41.754 fotogramas a 30 FPS) de una única tarea teleoperada. No se documenta uso de RLHF, DPO ni datos sintéticos; es imitación supervisada pura sobre demostraciones humanas. No se especifica el número total de tokens ni la composición del dataset más allá de la tarea y el robot.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular e imágenes.
- Predicción por chunks: emite secuencias cortas de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Percepción multimodal: integra dos vistas de cámara (`front` y `top`) con estado proprioceptivo.
- Ejecución de una tarea concreta: "Pick up the red pen and place it in the pencil case".
- Integración con LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, ajustar hiperparámetros o evaluar técnicas de *temporal ensembling* sobre una tarea de pick-and-place documentada.
- Prototipado de pipelines LeRobot: permite validar de extremo a extremo el flujo de grabación, entrenamiento y despliegue con un dataset pequeño (50 episodios) y un modelo ligero (51,7 M de parámetros).
- Manipulación de objetos pequeños en laboratorio: la tarea de coger un bolígrafo y depositarlo en un estuche es representativa de operaciones de precisión con objetos alargados y superficies delgadas.
- Benchmark de robustez visual: al usar dos cámaras, permite estudiar cómo afectan cambios de iluminación, oclusiones o posiciones de cámara a la tasa de éxito en una política ACT.
- Docencia y formación: ejemplo didáctico de imitación supervisada con teleoperación, útil para cursos de robótica y aprendizaje profundo.
- Base para fine-tuning: puede servir como inicialización para tareas similares de pick-and-place en el mismo robot `omx_follower`, reduciendo el número de episodios necesarios.
- Evaluación de hardware de consumo: con 0,2 GB de pesos, es adecuado para probar inferencia en GPUs modestas o incluso en CPU para validación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito en robot real, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no se especifican; por tamaño, una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo, y el cuello de botella real será la captura de cámaras y el control del robot.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU para pruebas offline, aunque la latencia de control a 30 FPS debe validarse.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), integración con el stack LeRobot; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del hardware, de la resolución de las dos cámaras (480×640) y del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ggghoney/pick_and_place_act_50` | 51,7 M | no aplica | Pick-and-place de bolígrafo con `omx_follower` | no disponible | Hugging Face Hub |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | no aplica | Manipulación con chunks de acción | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, SmolVLA) | no disponible en la informacion | no aplica | Manipulación diversa | según modelo | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría (políticas de imitación para robótica), tamaño y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador, la política puede heredar sesgos de estilo de teleoperación, posiciones y condiciones de iluminación del dataset.
- Riesgo de sobreajuste: con solo 50 episodios y una tarea única, la generalización a nuevas posiciones de objetos, distracciones o cambios de iluminación es incierta y no se ha evaluado.
- Limitación de tarea: el modelo solo ejecuta "Pick up the red pen and place it in the pencil case"; no es un modelo generalista ni acepta instrucciones nuevas en lenguaje natural.
- Dependencia de hardware: requiere el robot `omx_follower` y dos cámaras con los nombres `front` y `top`; cambios en la configuración invalidan la política.
- Sin resultados de evaluación: no hay tasa de éxito publicada, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor antes de cualquier despliegue comercial.
- Idiomas: no aplica; no procesa texto ni instrucciones multilingües.
- Caveat de producción: al ser un modelo de investigación con 0 descargas y 0 likes, no hay evidencia de uso en entornos reales ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act_50
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place_50
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place_50
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
