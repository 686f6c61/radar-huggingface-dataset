# bklassen3434/smolvla_pick_pen_v2_lr1e4

## Resumen

`smolvla_pick_pen_v2_lr1e4` es un ajuste fino (fine-tuning) del modelo SmolVLA de 450 millones de parámetros, publicado por el usuario bklassen3434 sobre el checkpoint base `lerobot/smolvla_base`. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica: recibe imágenes de cámara y una instrucción en lenguaje natural, y produce acciones motrices para un brazo robótico SO-101. El dominio concreto entrenado es la selección de bolígrafos por color, con instrucciones del tipo "Pick up the blue pen", "Pick up the pink pen" y "Pick up the grey pen", con los tres bolígrafos presentes en todos los episodios.

El modelo se entrenó durante 10.000 pasos con tamaño de lote 64 (aproximadamente 24 épocas) sobre el dataset `bklassen3434/pick_pen_v2_20260920_124400`, con una tasa de aprendizaje de 1e-4 y decaimiento coseno, dejando congelado el codificador visual desactivado (`freeze_vision_encoder=false`). El entrenamiento se realizó en una única A100-80GB durante 2 horas y 38 minutos, con un pico de memoria de 58,7 GB y una pérdida final de 0,029.

Su relevancia es acotada y experimental: forma parte de un barrido de tres configuraciones (junto a `smolvla_pick_pen_v2_lr5e5` y `smolvla_pick_pen_v2_frozen`), no tiene descargas ni valoraciones, y no se han publicado resultados de evaluación o benchmarks. Es útil como referencia de fine-tuning de SmolVLA sobre hardware SO-101 y como punto de partida reproducible, no como política robótica de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) SmolVLA; detalle interno de capas y mecanismo de atención no disponible |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo VLA: consume observaciones visuales e instrucción de lenguaje, no contexto textual extenso) |
| Tipos de cuantización | No disponible; los pesos se publican en safetensors y el tamaño del repo (0,9 GB para 450 M de parámetros) es coherente con precisión de 16 bits (bf16/fp16), dato inferido y no confirmado |
| Idiomas soportados | No disponible; las instrucciones del dataset de entrenamiento están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

Se trata de un modelo de visión-lenguaje-acción construido sobre SmolVLA, del ecosistema LeRobot de Hugging Face. La model card no detalla la topología interna (número de capas, dimensión oculta, esquema de fusión entre el codificador visual y el experto de acciones), por lo que esos datos se consideran no disponibles. Lo que sí se documenta es que el codificador visual no se congeló durante el ajuste (`freeze_vision_encoder=false`, `train_expert_only=false`), es decir, que se actualizaron tanto la torre de visión como el experto de acciones.

El entrenamiento se realizó por imitación sobre teleoperación de un SO-101: dataset `bklassen3434/pick_pen_v2_20260920_124400`, 10.000 pasos, lote de 64, ~24 épocas, learning rate 1e-4 con decaimiento coseno a lo largo de los 10.000 pasos, y pérdida final de 0,029. No se menciona uso de RLHF, DPO ni decodificación especulativa. Un detalle operativo relevante es la correspondencia de cámaras: las observaciones se graban como `observation.images.top` y `observation.images.wrist` y se remapean a las claves internas de SmolVLA (`observation.images.camera1` y `observation.images.camera2`) mediante `--rename_map`; **el mismo mapa de renombrado debe pasarse en tiempo de evaluación** con `lerobot-rollout` o `lerobot-record`, o las observaciones no coincidirán con las esperadas.

## Capacidades

- Generación de acciones motrices condicionadas por lenguaje para un brazo robótico SO-101 (política de imitación).
- Percepción visual desde dos cámaras simultáneas (vista superior y muñeca).
- Comprensión de instrucciones de selección por atributo de color sobre un conjunto cerrado de tres objetos ("blue pen", "pink pen", "grey pen").
- Ejecución de tareas de pick (recogida) de un objeto entre varios presentes en escena.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-record`) para evaluación y registro de episodios.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible; las instrucciones conocidas están únicamente en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, visión generativa ni audio.

## Casos de uso

- Selección de objetos por color en línea de montaje: el modelo recibe la instrucción "Pick up the blue pen" y las imágenes de las dos cámaras, y genera la acción de recogida del bolígrafo correcto entre tres presentes; es adecuado porque el dataset de entrenamiento cubre exactamente ese escenario.
- Automatización de pick-and-place en laboratorio o célula de pruebas con SO-101: permite sustituir la teleoperación manual por una política entrenada, reduciendo la intervención humana en tareas repetitivas de recogida.
- Investigación en políticas VLA: sirve como punto de partida reproducible para estudiar el efecto de hiperparámetros como la tasa de aprendizaje, comparando este checkpoint con `smolvla_pick_pen_v2_lr5e5` y `smolvla_pick_pen_v2_frozen`.
- Docencia y formación en robótica con LeRobot: al ser un modelo pequeño (450 M, 0,9 GB) y con licencia Apache 2.0, es viable desplegarlo en aulas y talleres para demostrar fine-tuning de VLA sobre hardware de bajo coste.
- Evaluación comparativa de configuraciones de entrenamiento: el barrido de tres checkpoints permite medir empíricamente el impacto de congelar el codificador visual frente a no congelarlo, con la misma receta de datos.
- Ampliación a nuevos objetos o colores por fine-tuning: la receta documentada (10.000 pasos, lote 64, lr 1e-4 con decaimiento coseno) es directamente reutilizable para adaptar el modelo a otras consignas de selección.
- Generación de datasets de evaluación: usando `lerobot-record` con el mapa de renombrado correcto se pueden grabar episodios comparables entre variantes del modelo para análisis interno.
- Demostración de condicionamiento por lenguaje en manipulación: permite ilustrar cómo una misma escena con varios objetos se resuelve de forma distinta según la instrucción textual, sin cambiar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de éxito en tarea) en la información disponible. Los únicos datos cuantitativos son los de entrenamiento:

| Métrica | Valor |
|---|---|
| Pasos de entrenamiento | 10.000 |
| Tamaño de lote | 64 |
| Épocas aproximadas | ~24 |
| Learning rate | 1e-4 (decaimiento coseno sobre 10.000 pasos) |
| Pérdida final | 0,029 |
| Hardware de entrenamiento | 1x A100-80GB (Modal) |
| Tiempo de entrenamiento | 2 h 38 min |
| Pico de memoria | 58,7 GB |
| Codificador visual | No congelado (`freeze_vision_encoder=false`, `train_expert_only=false`) |

No se dispone de tasa de éxito en la tarea de recogida ni de comparación numérica con los checkpoints hermanos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB solo para los pesos en 16 bits (450 M de parámetros, repo de 0,9 GB); con activaciones de visión y buffers de inferencia, el consumo real será superior, aunque no se especifica en la información disponible.
- GPU recomendadas: no se documentan requisitos de inferencia. Para entrenamiento se documenta una única A100-80GB con 58,7 GB de pico.
- GPU de consumo: por tamaño (450 M de parámetros), es previsible que quepa en GPUs de consumo con 8-12 GB de VRAM o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque este extremo no está confirmado en la información proporcionada.
- Opciones de despliegue: ecosistema LeRobot (`lerobot-rollout`, `lerobot-record`) sobre PyTorch, con los pesos en safetensors. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no serían aplicables de forma directa a un modelo de acciones.
- Latencia y throughput: no disponibles.
- Requisito operativo crítico: pasar el mismo `--rename_map` (`observation.images.top` → `observation.images.camera1`, `observation.images.wrist` → `observation.images.camera2`) en entrenamiento y evaluación; de lo contrario, la política recibirá observaciones en claves incorrectas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultados publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bklassen3434/smolvla_pick_pen_v2_lr1e4` | 450.046.176 | No disponible | No disponibles (pérdida final 0,029) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | No disponible | No disponible | No disponibles en la información | No disponible en la información | Checkpoint base de LeRobot |
| `smolvla_pick_pen_v2_lr5e5` (variante del barrido) | No disponible | No disponible | No disponibles | No disponible en la información | Mencionado en la model card |
| `smolvla_pick_pen_v2_frozen` (variante del barrido) | No disponible | No disponible | No disponibles | No disponible en la información | Mencionado en la model card |
| Otras políticas VLA de la misma categoría (p. ej. OpenVLA, π0) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No hay datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estas variantes; la única diferencia documentada entre los tres checkpoints del barrido es la configuración de entrenamiento (tasa de aprendizaje de 1e-4 frente a 5e-5, y codificador visual congelado frente a no congelado).

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo se ha entrenado para tres instrucciones de selección de bolígrafos por color, con los tres objetos siempre presentes en la escena. Cualquier otro objeto, color, consigna o disposición de la escena queda fuera de la distribución de entrenamiento.
- Riesgo alto de sobreajuste al montaje concreto: 10.000 pasos con ~24 épocas sobre un único dataset de teleoperación y una pérdida final de 0,029 apuntan a un ajuste muy ceñido a las condiciones de captura (iluminación, posición de cámaras, fondo).
- Dependencia estricta del hardware y de las cámaras: el modelo asume un brazo SO-101 y dos cámaras (`top` y `wrist`) remapeadas a `camera1` y `camera2`. Omitir el `--rename_map` en evaluación invalida las observaciones.
- Sesgos conocidos: no disponibles (no se documenta ningún análisis de sesgo). Al operar sobre un conjunto fijo de tres objetos, el comportamiento fuera de ese conjunto no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el equivalente es la ejecución de una acción incorrecta o insegura cuando la instrucción o la escena difieren de lo visto en entrenamiento.
- Limitaciones de idioma: las instrucciones documentadas están en inglés; no hay evidencia de soporte multilingüe.
- Sin validación externa: el repositorio tiene 0 descargas y 0 likes, y no se han publicado métricas de éxito en tarea ni evaluaciones independientes.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución correspondientes. Conviene verificar la licencia del modelo base `lerobot/smolvla_base` y del dataset utilizado antes de un despliegue comercial.
- Advertencia de producción: cualquier uso sobre hardware físico real debe incorporar límites de par, paradas de emergencia y validación en entorno controlado; el modelo no documenta ningún mecanismo de seguridad.
- Fecha y trazabilidad: el repositorio se creó y actualizó el 20 de septiembre de 2026, con un minuto de diferencia entre ambas marcas, lo que sugiere una publicación automática sin revisión posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_lr1e4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bklassen3434/pick_pen_v2_20260920_124400
- Variante con learning rate 5e-5: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_lr5e5 (referenciada en la model card)
- Variante con VLM congelado: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_frozen (referenciada en la model card)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Resultados de búsqueda web: no contienen información relevante sobre este modelo (los enlaces devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con SmolVLA ni con LeRobot).
