# charlott-rgb/so101_acrylic_vla_jepa_b8_35000

## Resumen

VLA-JEPA es una política robótica de tipo Vision-Language-Action que combina un backbone de lenguaje Qwen3-VL con un modelo de mundo de vídeo auto-supervisado V-JEPA2 y una cabeza de acción DiT con flow matching. El checkpoint publicado por el usuario charlott-rgb con el identificador `so101_acrylic_vla_jepa_b8_35000` es una instancia concreta de esa arquitectura, entrenada con LeRobot 0.6.2 sobre el brazo SO-101 (`so_follower`) para una única tarea de manipulación.

El modelo resuelve el problema clásico de imitación visomotora en robótica de bajo coste: a partir de dos cámaras (exterior y muñeca) y del estado articular de 6 grados de libertad, predice una acción de 6 dimensiones que mueve el brazo. Su relevancia actual radica en que aplica representaciones de mundo preentrenadas (V-JEPA2) sobre un backbone VLM moderno, lo que reduce la dependencia de grandes volúmenes de demostraciones: este checkpoint se entrenó con solo 72 episodios y 39.189 fotogramas a 30 FPS.

El repositorio ocupa 6,2 GB y contiene 2.766.134.150 parámetros reales en safetensors, con licencia Apache 2.0. No se han publicado resultados de evaluación, ni benchmarks, ni tasas de éxito en robot real, por lo que debe considerarse un checkpoint experimental y no una política validada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) híbrida: backbone de lenguaje Qwen3-VL + modelo de mundo de vídeo auto-supervisado V-JEPA2 + cabeza de acción DiT con flow matching |
| Parametros totales | 2.766.134.150 (≈2,77 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizaciones alternativas documentadas |
| Idiomas soportados | no disponible; la tarea está definida en inglés ("Pick up the acrylic paint piece and place it in the box") y la model card no declara cobertura multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Cámaras | `fixed`, `wrist` (la model card declara estas dos; las claves reales de observación son `observation.images.exterior_1_left` y `observation.images.exterior_2_left`) |
| Entradas | `observation.images.exterior_1_left` (3, 224, 224), `observation.images.exterior_2_left` (3, 224, 224), `observation.state` (6,) |
| Salidas | `action` (6,) |
| Pasos de entrenamiento | 35.000 |
| Tamaño de lote | 8 |
| Optimizador / LR | adamw / 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Dataset de entrenamiento | `charlott-rgb/so101_acrylic_dense72` (72 episodios, 39.189 fotogramas, 30 FPS) |
| Tamaño del repositorio | 6,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño VLA-JEPA descrito en el artículo arXiv:2602.10098. Se compone de tres bloques: un backbone vision-language Qwen3-VL que procesa las observaciones visuales y la instrucción en lenguaje natural; un modelo de mundo de vídeo V-JEPA2, preentrenado de forma auto-supervisada, que aporta representaciones predictivas del entorno; y una cabeza de acción basada en Diffusion Transformer (DiT) entrenada con flow matching, que genera las trayectorias de acción continuas de 6 grados de libertad. La combinación de un modelo de mundo con un VLM busca mejorar la generalización espacial y temporal sin necesidad de datasets masivos de teleoperación.

El entrenamiento se realizó con LeRobot 0.6.2 durante 35.000 pasos, con lote de 8, optimizador AdamW y tasa de aprendizaje 1e-4, partiendo de la semilla 1000. Los datos provienen del dataset `so101_acrylic_dense72`: 72 episodios y 39.189 fotogramas capturados a 30 FPS para una sola tarea de recogida y colocación de una pieza de pintura acrílica. La model card no documenta el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o fine-tuning por refuerzo posteriores.

## Capacidades

- Control visomotor de manipulación: genera acciones de 6 dimensiones para el brazo SO-101 a partir de dos flujos de imagen de 224x224 y del estado articular.
- Ejecución de la tarea concreta de recogida y colocación de una pieza de pintura acrílica en una caja.
- Percepción multimodal conjunta: procesa simultáneamente imagen exterior, imagen de muñeca y estado proprioceptivo.
- Condicionamiento por instrucción en lenguaje natural a través del backbone Qwen3-VL.
- Modelado predictivo del entorno mediante el componente de mundo V-JEPA2, orientado a mejorar la robustez ante variaciones visuales.
- Generación de acciones continuas mediante flow matching, en lugar de discretización de acciones.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión general, audio, modo de razonamiento explícito ni cobertura multilingüe.

## Casos de uso

- Automatización de la tarea entrenada: ejecutar el ciclo completo de recogida de la pieza acrílica y depósito en la caja sobre un SO-101 real mediante `lerobot-rollout`, usando las dos cámaras y el estado articular de 6 dimensiones para los que fue entrenado.
- Punto de partida para fine-tuning en tareas de pick-and-place similares: al partir de representaciones V-JEPA2 y de un backbone Qwen3-VL, sirve como inicialización para nuevos objetos o nuevas posiciones con un dataset pequeño de decenas de episodios.
- Banco de pruebas de la arquitectura VLA-JEPA: permite reproducir el pipeline de entrenamiento con `lerobot-train --policy.type=vla_jepa` y comparar la receta (35.000 pasos, lote 8, LR 1e-4) frente a otras políticas sobre el mismo dataset.
- Investigación en aprendizaje por imitación con pocos datos: el checkpoint es un caso de estudio de qué rendimiento se obtiene con 72 episodios y 39.189 fotogramas en un brazo de bajo coste.
- Docencia y formación en robótica: sirve para ilustrar el flujo completo de LeRobot (grabación de datos, calibración, entrenamiento, rollout) en un montaje reproducible con dos cámaras OpenCV a 640x480 y 30 FPS.
- Recolección de datos asistida: usar la política como comportamiento base para generar demostraciones adicionales o comparar trayectorias humanas frente a trayectorias generadas.
- Evaluación de robustez visual en laboratorio: al depender de dos vistas fijas, permite medir la degradación ante cambios de iluminación, posiciones de objeto o presencia de distractores, aunque estos resultados no estén publicados.
- Integración en celdas de clasificación de laboratorio: con la instrucción textual adecuada y reentrenamiento, el mismo esquema podría aplicarse a la separación de piezas pequeñas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tasa de éxito, número de ensayos ni condiciones de evaluación. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas específicas de manipulación (por ejemplo, tasa de éxito por episodio) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,77 mil millones de parámetros, los pesos en BF16 ocupan aproximadamente 5,5 GB; sumando activaciones, torres de visión y buffers de la cabeza DiT, es razonable reservar entre 8 y 12 GB de VRAM. Cifra no confirmada por el autor.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM. Una RTX 3090, RTX 4080, RTX 4090 o RTX 5090 es suficiente para inferencia en FP16/BF16. Para entrenamiento con lote 8 se recomienda al menos 24 GB de VRAM (RTX 3090/4090, A5000, L40S) o GPU de centro de datos (A100, H100) si se amplía el lote o la resolución.
- Cabe en GPU de consumo: sí, en modelos con 12-16 GB o más, siempre que se use precisión de 16 bits. No se documentan pesos cuantizados a 8 o 4 bits.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución sobre el robot, `lerobot-train` para reentrenamiento) sobre PyTorch con CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de acción continua.
- Latencia y throughput: no disponibles. El sistema de captura opera a 30 FPS y 640x480 por cámara según el comando de ejemplo, pero no se publica la frecuencia de control efectiva del bucle de inferencia ni el tiempo por paso.
- Almacenamiento: el repositorio ocupa 6,2 GB, por lo que se necesita ese espacio en disco además del dataset de entrenamiento si se va a reproducir el entrenamiento.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos confirmados de este checkpoint; el resto de celdas quedan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| so101_acrylic_vla_jepa_b8_35000 | 2.766.134.150 | no disponible | Apache 2.0 | no disponible |
| Otras políticas VLA para SO-101 (misma categoría) | no disponible | no disponible | no disponible | no disponible |
| Políticas de imitación alternativas en LeRobot | no disponible | no disponible | no disponible | no disponible |

Criterios que sí pueden compararse de forma estructural: este checkpoint emplea un backbone Qwen3-VL más un modelo de mundo V-JEPA2 y una cabeza DiT de flow matching, un diseño más pesado que las políticas de imitación puramente convolucionales o basadas en transformers pequeños habituales en LeRobot. No obstante, sin métricas de éxito en robot real no es posible afirmar que ese mayor coste computacional se traduzca en mejor rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni número de ensayos publicados, por lo que se desconoce si la política funciona de forma fiable incluso en la tarea para la que fue entrenada.
- Entrenamiento de una sola tarea: el dataset contiene un único objetivo ("Pick up the acrylic paint piece and place it in the box") con 72 episodios, lo que limita la generalización a otros objetos, posiciones o instrucciones.
- Sesgos de dominio: al entrenarse con una iluminación, una disposición de cámaras y un fondo concretos, es probable que degrade ante cambios de escena. Este riesgo no está cuantificado.
- Dependencia de la configuración de hardware: las claves de observación (`exterior_1_left`, `exterior_2_left`) y los nombres de cámara deben coincidir exactamente con los del entrenamiento, como advierte la propia model card.
- Inconsistencia documental: la model card declara cámaras "fixed" y "wrist", mientras que las claves de entrada son dos vistas "exterior_*_left". Conviene verificar la configuración real antes de desplegar.
- Riesgo de alucinación: en políticas de acción continua el equivalente es la generación de trayectorias plausibles pero incorrectas; sin evaluación no puede acotarse.
- Idiomas: no se documenta cobertura multilingüe. La instrucción de la tarea está en inglés y el comportamiento con otros idiomas es desconocido.
- Contexto: no se publica la longitud de contexto del backbone, lo que impide planificar tareas de horizonte largo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero al incluir componentes derivados de Qwen3-VL y V-JEPA2 conviene revisar las licencias de esos componentes upstream antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin demo ni resultados de terceros que respalden su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charlott-rgb/so101_acrylic_vla_jepa_b8_35000
- Dataset de entrenamiento: https://huggingface.co/datasets/charlott-rgb/so101_acrylic_dense72
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlott-rgb/so101_acrylic_dense72
- Artículo de VLA-JEPA: https://arxiv.org/abs/2602.10098
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para vla_jepa: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX incluido en la model card): Cadene, R. et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024.
