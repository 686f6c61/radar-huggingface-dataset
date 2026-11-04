# ranjith3567/horizontal_movement

## Resumen
`ranjith3567/horizontal_movement` es un modelo de política visión-lenguaje-acción (VLA) compacto, especializado en robótica, obtenido mediante fine-tuning de `lerobot/smolvla_base` con el framework LeRobot de Hugging Face. Está diseñado para controlar un brazo robótico de tipo `so_follower` (SO-100/SO-101) a partir de observaciones visuales y del estado de las articulaciones, generando comandos de acción de 6 dimensiones. El modelo resuelve el problema de la imitación de tareas motoras concretas a bajo coste computacional, permitiendo desplegar políticas robóticas en hardware de consumo.

Se trata de un modelo de 450 millones de parámetros (aproximadamente 0,45 B), lo que lo sitúa en la categoría de VLA "pequeño" frente a alternativas como OpenVLA (7 B) o RT-2. Esta escala reducida es precisamente su valor: SmolVLA busca rendimiento competitivo con un coste de inferencia mucho menor. El fine-tuning concreto se ha realizado sobre un dataset propio de 30 episodios y 13.531 fotogramas grabados a 30 FPS, con la tarea "Make any prompt as your wise", lo que indica un dominio de aplicación muy específico y experimental.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento y despliegue de políticas robóticas open source con licencia Apache 2.0. No obstante, conviene subrayar que se trata de un modelo recién publicado, sin descargas ni validación externa, y sin resultados de evaluación reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; transformer multimodal con codificador visual y decodificador de acciones |
| Parametros totales | 450.046.176 (~0,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no disponible (la tarea está definida en inglés: "Make any prompt as your wise") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento
SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual (procesa imágenes de cámaras a 256×256 y 480×640) con un backbone de lenguaje compacto y una cabeza de predicción de acciones. El modelo consume `observation.state` (vector de 6 dimensiones), tres cámaras de 256×256 (`camera1`, `camera2`, `camera3`) y una cámara de 480×640 (`empty_camera_0`), y produce un vector `action` de 6 dimensiones. La arquitectura exacta interna (número de capas, dimensión oculta, tipo de atención) no está detallada en la información proporcionada.

El fine-tuning se realizó con LeRobot 0.6.2 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset de entrenamiento contiene 30 episodios y 13.531 fotogramas a 30 FPS, lo que supone un volumen muy reducido para aprendizaje por imitación. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; el entrenamiento es de imitación supervisada sobre demostraciones. La innovación principal de SmolVLA, según el paper referenciado (arXiv:2506.01844), es lograr un VLA eficiente desplegable en hardware de consumo, aunque los detalles concretos de esa eficiencia no se recogen en la model card.

## Capacidades
- Control robótico de un brazo `so_follower` mediante imitación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas de 256×256 y una de 480×640.
- Condicionamiento por instrucción en lenguaje natural (task prompt), aunque el prompt registrado es genérico ("Make any prompt as your wise").
- Ejecución de políticas en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico ni generación de texto libre; es un modelo puramente de acción.
- Capacidades multilingües: no disponibles; el prompt de tarea está en inglés.

## Casos de uso
- Manipulación robótica de laboratorio: reproducción de la tarea "horizontal_movement" sobre un SO-100/SO-101, útil para experimentos de aprendizaje por imitación con pocos datos (30 episodios).
- Prototipado rápido de políticas VLA: servir como punto de partida para fine-tuning con `lerobot-train` sobre datasets propios, aprovechando que parte de `smolvla_base`.
- Docencia e investigación en robótica open source: ejemplo reproducible de pipeline completo (grabación, entrenamiento, rollout) con LeRobot y licencia Apache 2.0.
- Validación de hardware de bajo coste: al ser un modelo de 0,45 B, permite probar inferencia en GPU de consumo para brazos robóticos educativos.
- Benchmark interno de imitación: comparar la calidad de una política entrenada con 13.531 fotogramas frente a alternativas con más datos.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados, siempre que se valide previamente la tasa de éxito (no reportada).
- Integración en pipelines de investigación que requieran un VLA ligero como componente de percepción-acción, no como generador de lenguaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de imitación (MSE de acciones, etc.).

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, más el coste de los codificadores visuales y buffers de imagen; no se dispone de cifra oficial.
- GPU recomendadas: no disponible en la documentación; por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090, aunque no está verificado por el autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño, pero sin confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), `lerobot-train` para fine-tuning; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas de acción).
- Latencia y throughput: no disponibles; el dataset está grabado a 30 FPS, lo que sugiere que el bucle de control objetivo es de 30 Hz, pero no se confirma que el modelo alcance esa frecuencia en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/horizontal_movement` | ~0,45 B | no disponible | VLA (SmolVLA fine-tuned) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | ~0,45 B (misma base) | no disponible | VLA base | Apache 2.0 | Hugging Face (modelo base oficial) |
| OpenVLA | ~7 B | no disponible | VLA | no disponible en esta ficha | Hugging Face |
| RT-2 (Google DeepMind) | no disponible | no disponible | VLA | propietaria | no público |

La comparación con OpenVLA y RT-2 es orientativa por categoría (VLA para robótica); no se dispone de métricas comparativas en la información proporcionada. Frente a `smolvla_base`, este modelo es un fine-tuning específico para una tarea y un robot concretos, no un modelo generalista.

## Limitaciones y advertencias
- Sin evaluación: el autor no ha reportado tasas de éxito ni validación en robot real; no hay evidencia de que la política funcione fuera del dataset de entrenamiento.
- Dataset muy pequeño: 30 episodios y 13.531 fotogramas son insuficientes para generalizar; se espera sobreajuste al entorno, posiciones de objetos e iluminación de la grabación.
- Prompt de tarea genérico y ambiguo ("Make any prompt as your wise"), lo que dificulta el condicionamiento por instrucciones y su reutilización.
- Cámara `empty_camera_0` de 480×640 con nombre que sugiere una entrada vacía o de relleno; conviene verificar que el pipeline de inferencia la alimente correctamente.
- Específico de hardware: solo válido para robot `so_follower` con cámaras `Top` y `Side` (más las entradas adicionales); no es un modelo general.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos de política pueden causar daños físicos, por lo que requiere supervisión y paradas de emergencia.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación propia.
- Sin descargas ni likes: modelo recién publicado, sin comunidad ni soporte.
- Idiomas: no disponible; no se garantiza funcionamiento con prompts en castellano.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ranjith3567/horizontal_movement
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/horizontal_movement_20261104_194606
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/horizontal_movement_20261104_194606
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
