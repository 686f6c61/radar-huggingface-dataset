# ranjith3567/pick_yellow_cube_v5.1_chunk1

## Resumen

`ranjith3567/pick_yellow_cube_v5.1_chunk1` es una política de control robótico entrenada con LeRobot sobre la arquitectura SmolVLA (vision-language-action), un modelo compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. El modelo lo publica el usuario `ranjith3567` y está especializado en una única tarea de manipulación: recoger un bloque amarillo y depositarlo en una caja marrón, sobre un robot tipo `so_follower`.

La política consume observaciones multimodales (estado articular de 6 dimensiones y cuatro streams de cámara, tres de ellas a 256x256 y una a 480x640) y emite un vector de acción de 6 dimensiones. Con 450 millones de parámetros y un repo de 0,9 GB, está pensada para inferencia en hardware de consumo, lo que la hace relevante para prototipado rápido de imitación en robótica de bajo coste.

Se trata de un artefacto muy específico: un checkpoint de imitación entrenado con 100 episodios y 63.143 frames a 30 FPS, sin resultados de evaluación publicados ni licencia declarada. Es útil como ejemplo reproducible del flujo LeRobot/SmolVLA, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/INT8 declaradas) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés: "pick the yellow block and place it in brown box") |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,9 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que fusiona un codificador visual, un codificador de lenguaje y un decodificador de acciones en un transformer multimodal. La política recibe estado articular (`observation.state`, shape `(6,)`) y cuatro imágenes (tres cámaras a `(3, 256, 256)` y una cámara vacía a `(3, 480, 640)`), y produce una acción de 6 dimensiones. La selección de features de observación y acción está definida por el dataset de entrenamiento y por el tipo de robot `so_follower` con cámaras `Top` y `Side`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046` (100 episodios, 63.143 frames, 30 FPS, tarea única "pick the yellow block and place it in brown box"). Configuración: 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, seed 1000. No se declara en la model card el uso de RLHF, DPO ni fases de post-entrenamiento; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Generación de acciones motoras de 6 dimensiones condicionadas a observaciones visuales y estado articular.
- Comprensión de una instrucción de tarea en lenguaje natural (prompt de texto) para guiar la política.
- Percepción multimodal con cuatro streams de cámara simultáneos (tres a 256x256 y uno a 480x640).
- Ejecución de una tarea de manipulación concreta: recoger un bloque amarillo y colocarlo en una caja marrón.
- Despliegue en hardware de consumo según la descripción de SmolVLA en la model card.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes autónomos, visión general, audio ni modos de "thinking".

## Casos de uso

- Reproducción de la tarea de pick-and-place: ejecutar la política con `lerobot-rollout` sobre un `so_follower` calibrado para validar el pipeline completo de inferencia antes de escalar a otras tareas.
- Prototipado de imitación en robótica de bajo coste: servir como plantilla para entrenar políticas SmolVLA sobre datasets propios con `lerobot-train` y comparar hiperparámetros (pasos, batch, learning rate).
- Benchmark interno de infraestructura: medir latencia y throughput de un VLA de 450 M parámetros en GPUs de consumo antes de invertir en modelos mayores.
- Docencia y demos de VLA: ilustrar en talleres cómo se compone un modelo vision-language-action y cómo se conectan cámaras, estado articular y acciones en LeRobot.
- Base para fine-tuning en tareas de recogida de objetos: partir de este checkpoint y adaptarlo a nuevos objetos o contenedores cambiando el dataset y el prompt de tarea.
- Validación de pipelines de datos robóticos: usar el dataset asociado (100 episodios, 63.143 frames) para probar herramientas de visualización, curado y aumentación antes de entrenar políticas en producción.
- Pruebas de regresión de hardware: comparar tasas de éxito de esta política entre distintas configuraciones de cámara/iluminación como sanity check de una celda robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (450 M parámetros en safetensors, ~0,9 GB de pesos en FP32/BF16) cabría esperar un consumo moderado, pero no se declaran cifras.
- GPU recomendadas: no disponible; la model card de SmolVLA menciona despliegue en hardware de consumo sin especificar modelos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, pero no se confirma en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), entrenamiento con `lerobot-train` en `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política VLA de robótica).
- Latencia y throughput: no disponible. La captura de datos se realizó a 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/pick_yellow_cube_v5.1_chunk1` (SmolVLA fine-tuned) | 450 M | no disponible | pick-and-place de bloque amarillo | no disponible | Hugging Face (repo público) |
| SmolVLA base (Hugging Face) | no disponible en la informacion | no disponible | VLA generalista compacto | no disponible en la informacion | Hugging Face / LeRobot |
| Políticas LeRobot tipo ACT/diffusion | no disponible | no disponible | imitación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de benchmark que permitan comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para "pick the yellow block and place it in brown box"; fuera de ese escenario no hay garantía de comportamiento.
- Sin evaluación publicada: no existen tasas de éxito medidas, por lo que el rendimiento real es desconocido.
- Dependencia de hardware y calibración: requiere un robot `so_follower` con las cámaras y nombres de observación exactos usados en el entrenamiento; cambios de cámara, iluminación o posiciones pueden degradar la política.
- Dataset pequeño: 100 episodios y 63.143 frames limitan la generalización y aumentan el riesgo de sobreajuste al entorno de captura.
- Licencia no declarada: no se puede confirmar el uso comercial; tratar como restringido hasta verificación.
- Idiomas: solo se documenta una instrucción en inglés; no hay soporte multilingüe declarado.
- Riesgo de alucinación/acciones erróneas: como política de imitación, puede producir acciones fuera de distribución sin señalización de incertidumbre.
- Sin datos de sesgo: no se publica análisis de sesgos visuales ni de robustez frente a distractores.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5.1_chunk1
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
