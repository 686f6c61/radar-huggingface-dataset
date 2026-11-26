# lerobot/Cosmos3-Nano-Policy-LIBERO_10

## Resumen

Cosmos3-Nano-Policy-LIBERO_10 es una política robótica de tipo vision-language-action (VLA) desarrollada por el equipo de LeRobot (Hugging Face) mediante ajuste fino del checkpoint base lerobot/Cosmos3-Nano, que a su vez es la conversión al formato LeRobot del modelo nvidia/Cosmos3-Nano. El modelo resuelve el problema de control robótico de extremo a extremo: a partir de una instrucción de tarea en lenguaje natural y de dos vistas de cámara (tercera persona y muñeca), predice un bloque de 16 acciones junto con un vídeo futuro de la escena, lo que lo convierte en un modelo generativo con planificación visual implícita.

La arquitectura se apoya en un backbone Qwen3-VL con 36 capas de decodificador y anchura oculta de 4096, con un total de 16.454.213.580 parámetros en pesos BF16 (1356 tensores, de los cuales 4 son FP32 para el embedding de timesteps). El modelo se ha ajustado específicamente sobre el conjunto de datos LIBERO-10, un benchmark estándar de manipulación robótica con 10 tareas de largo horizonte, alcanzando una tasa de éxito de 97,6% (488/500 episodios) en evaluación cerrada.

Su relevancia actual radica en que demuestra que los modelos generativos de vídeo de gran escala pueden convertirse en políticas de control competitivas mediante ajuste fino supervisado, y en que se distribuye con pesos abiertos y una integración completa en LeRobot, lo que facilita su reproducción y evaluación por parte de la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA con backbone Qwen3-VL MoT (Mixture of Tokens), 36 capas de decodificador, anchura oculta 4096 |
| Parametros totales | 16.454.213.580 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16, con 4 tensores FP32) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en LIBERO) |
| Licencia | openmdw1.1-license (Other) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

El modelo es una política VLA construida sobre el backbone Qwen3-VL en configuración MoT (Mixture of Tokens) con 36 capas de decodificador y anchura oculta de 4096. A partir de una instrucción textual y de dos observaciones visuales (cámara de tercera persona y cámara de muñeca, 256x256 RGB a 20 FPS, sin estado proprioceptivo), el modelo genera de forma conjunta un chunk de 16 acciones y el vídeo futuro de la escena. Las acciones se representan en un espacio de 10 dimensiones `[delta position (3), rot6d (6), gripper]` que los procesadores del entorno convierten a las 7 dimensiones nativas de LIBERO.

El ajuste fino se realizó sobre el conjunto lerobot/LIBERO_10-Cosmos3 (379 episodios, 10 tareas, sin split de validación), partiendo del checkpoint lerobot/Cosmos3-Nano con los módulos de acción reinicializados. El entrenamiento usó 32 GPUs NVIDIA A100-SXM4-80GB (4 nodos de 8 con InfiniBand), paralelismo FSDP2 HSDP (sharding intra-nodo, replicación inter-nodo), batch global de 2048 muestras por actualización (32 x 32 x 2), optimizador AdamW con learning rate 5e-5 (2.5e-4 para los módulos de acción), betas (0,9, 0,99), weight decay 0,05, gradient clipping 1,0 y un schedule de warmup lineal de 500 actualizaciones seguido de decaimiento lineal hasta 16000. Se realizaron 2000 actualizaciones del optimizador con checkpoint cada 250; el checkpoint publicado corresponde a la actualización 2000 (paso LeRobot 4000), seleccionado por tasa de éxito en LIBERO. Se usó precisión mixta con pesos maestros en float32, cómputo y reducción de gradientes en bfloat16, TF32 desactivado, gradient checkpointing activo y atención SDPA sin `torch.compile`.

## Capacidades

- Generación de acciones robóticas de manipulación: predice chunks de 16 acciones de 10 dimensiones (posición delta, rotación 6D y gripper) a partir de instrucciones de tarea e imágenes.
- Generación de vídeo futuro de la escena: el modelo produce de forma conjunta la predicción visual de los frames siguientes, lo que actúa como planificación implícita.
- Comprensión de instrucciones en lenguaje natural para especificar tareas de manipulación.
- Fusión multimodal de dos vistas de cámara (tercera persona y muñeca) a 256x256 RGB y 20 FPS.
- Control de extremo a extremo sin estado proprioceptivo: solo depende de imágenes e instrucción textual.
- Muestreo con UniPC de 30 pasos, guidance scale 1 (sin classifier-free guidance) y sampling shift 5.
- Soporte de ejecución completa de chunks de 16 acciones antes de replanificar.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes LLM; sus capacidades son específicas de control robótico.

## Casos de uso

- Evaluación comparativa en LIBERO-10: el modelo sirve como referencia de política VLA para medir tasas de éxito en las 10 tareas del benchmark, con un protocolo reproducible mediante `lerobot-eval` y MuJoCo 2.3.7.
- Investigación en políticas generativas de vídeo: permite estudiar cómo la predicción conjunta de acciones y vídeo futuro afecta a la robustez del control en tareas de largo horizonte, gracias a que los pesos están abiertos.
- Base para ajuste fino en nuevos dominios robóticos: al estar integrado en LeRobot y partir de un checkpoint Cosmos3-Nano, se puede reentrenar con conjuntos propios en formato LeRobot cambiando los módulos de acción.
- Manipulación con cámaras duales en laboratorio: su uso de vista de tercera persona y de muñeca lo hace adecuado para montajes experimentales con dos cámaras RGB a 256x256 y 20 Hz.
- Benchmarking de infraestructura de inferencia robótica: permite medir latencia y throughput de políticas VLA de 16,4 mil millones de parámetros en GPUs como la A800-80GB usada en la evaluación oficial.
- Reproducción de resultados académicos: el repositorio documenta versiones exactas de MuJoCo, robosuite, hf-libero, Gymnasium y el commit de LeRobot, lo que facilita replicar el 97,6% reportado.
- Estudio de selección de checkpoints por rendimiento en entorno: el modelo ilustra la práctica de elegir el checkpoint final por tasa de éxito cerrada en lugar de por pérdida de validación.

## Benchmarks y rendimiento

| Modelo | LIBERO-10 (tasa de éxito) |
|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 (evaluación cerrada, 500 episodios) | 97,6% (488/500) |
| Cosmos3-Edge-Policy-LIBERO_10 | 95,2% (476/500) |
| Cosmos3-Nano-Policy-LIBERO_10 (TechReport, arXiv 2606.02800) | 97,40% |

La evaluación se realizó con 50 episodios por tarea (10 tareas, 500 episodios por suite), semillas 0 a 49, 4 entornos por batch, presupuesto de 510 pasos para LIBERO-10 tras 10 pasos de asentamiento, inferencia en bfloat16 con atención SDPA, sin `torch.compile`, TF32 desactivado y cuDNN benchmarking desactivado. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es específico de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,45 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 33 GB, por lo que se necesita una GPU con al menos 40-48 GB de memoria para inferencia en BF16 sin cuantización.
- GPU recomendadas: la evaluación oficial usó 1 NVIDIA A800-SXM4-80GB por suite; son adecuadas A100-80GB, H100-80GB y A800-80GB.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en BF16; se requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: `lerobot-eval` con el stack LeRobot (PyTorch 2.11, Transformers 5.5.4, Diffusers 0.39.0), MuJoCo 2.3.7 con renderizado EGL en GPU, robosuite 1.4.0 y hf-libero 0.1.4. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo ejecuta chunks completos de 16 acciones y usa muestreo UniPC de 30 pasos, lo que condiciona la frecuencia de replanificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 | 16,45 mil millones | no disponible | 97,6% (488/500) | openmdw1.1-license | Pesos abiertos en HF |
| Cosmos3-Edge-Policy-LIBERO_10 | no disponible | no disponible | 95,2% (476/500) | no disponible | Pesos abiertos en HF |
| Cosmos3-Nano (base) | no disponible | no disponible | no disponible | no disponible | Pesos abiertos en HF |

La comparativa se limita a los modelos de la misma familia Cosmos3 documentados en la información disponible; no se dispone de datos de otros modelos VLA comparables en LIBERO-10.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para LIBERO-10 (10 tareas de manipulación); no es un modelo de propósito general y su rendimiento fuera de ese dominio no está documentado.
- Depende de un protocolo de evaluación muy específico: MuJoCo 2.3.7 (no 3.x, que altera tareas con mucho contacto), robosuite 1.4.0, hf-libero 0.1.4 y un commit concreto de LeRobot; variaciones en estas versiones invalidan la comparación de resultados.
- La evaluación oficial ejecutó el paso de canvas de vídeo del preprocesador en CPU y desactivó cuDNN benchmarking; `lerobot-eval` lo ejecuta en el dispositivo de la política y activa cuDNN benchmarking, lo que cambia las entradas y el muestreo por pequeñas cantidades numéricas.
- No se ha documentado el comportamiento en idiomas distintos del inglés para las instrucciones de tarea.
- Riesgo de alucinación visual y de acciones: al ser un modelo generativo que predice vídeo futuro y acciones, puede producir planes plausibles pero incorrectos en escenas fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con LIBERO-10, hereda los sesgos de ese conjunto (objetos, iluminación y configuraciones específicas).
- Restricciones de licencia: openmdw1.1-license; es necesario revisar los términos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- El checkpoint publicado es el de la actualización 2000, seleccionado por tasa de éxito en LIBERO; no se ha validado con un split independiente, ya que no se usó split de validación.
- No se documentan formatos de cuantización, por lo que el despliegue en GPUs de menor VRAM requiere trabajo adicional no cubierto por la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Modelo comparable Cosmos3-Edge-Policy-LIBERO_10: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Tech report (arXiv 2606.02800): https://arxiv.org/abs/2606.02800
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot/tree/main/src/lerobot
- Commit de LeRobot usado en la evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot #5134: https://github.com/huggingface/lerobot/pull/5134
- Paper de LeRobot (arXiv 2602.22818): https://arxiv.org/abs/2602.22818
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
