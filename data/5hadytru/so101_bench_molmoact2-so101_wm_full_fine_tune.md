# 5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune

## Resumen

so101_bench_MolmoAct2-SO101_WM_full_fine_tune es un ajuste fino completo del modelo vision-language-action (VLA) MolmoAct2-SO100_101 de AllenAI, publicado por el usuario 5hadytru como entrada oficial de MolmoAct2 en el benchmark SO-101 Bench. El modelo parte de un backbone de 5.447 millones de parámetros (5.4B) y se ha entrenado sobre el conjunto simulado `so101_bench_sim_WM`, compuesto por 3.629 episodios y 1.996.120 fotogramas a 30 fps generados en Isaac Lab con domain randomization. Su propósito es controlar un brazo robótico SO-101 en tareas de manipulación espacial a partir de observaciones visuales multimodales y texto de instrucción.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio sobre los límites del ajuste fino completo en modelos VLA grandes bajo presupuestos de cómputo restringidos: el propio autor reporta que el checkpoint final solo resuelve 5 de 39 episodios de validación, frente a los 19 de 39 de GR00T N1.7 entrenado con el mismo presupuesto. Por otro, sirve como referencia técnica de integración: convenciones de fotogramas articulares, orden de cámaras, normalización q01/q99 y servidor de inferencia con `trust_remote_code`.

El modelo se distribuye en formato safetensors con código personalizado, licencia no especificada y sin idiomas declarados. No es un modelo de propósito general: es un artefacto de investigación orientado a evaluación robótica en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en MolmoAct2, con backbone VLM más experto de acción; transformer con codificador visual (ViT), LLM y experto de acción con flow matching |
| Parámetros totales | 5.447.439.088 (5.4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint exportado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint bf16 autocontenido, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de MolmoAct2-SO100_101: un VLM con codificador visual ViT, un LLM y un experto de acción separado que genera chunks de acciones mediante flow matching. El ajuste fino actualiza todos los módulos (`--ft_vlm=true --ft_action_expert=true --ft_embedding=lm_head`), incluyendo embeddings y `lm_head`. La entrada visual son cuatro cámaras a 640×480 (`overhead`, `wrist`, `overhead_init`, `wrist_init`), donde los flujos `_init` actúan como memoria de trabajo fija del estado inicial de la escena. La salida son chunks de 30 pasos de acción en pose articular absoluta, con un paso de flow por chunk y pérdida de acción continua exclusivamente.

El entrenamiento se realizó sobre el dataset `5hadytru/so101_bench_sim_WM` (LeRobot v3.0, 3.629 episodios, 1.996.120 fotogramas a 30 fps, Isaac Lab con domain randomization) durante 10.000 pasos, con batch global de 128 (16 por GPU × 4 GPUs × 2 de acumulación), learning rates de 7e-5 para el experto de acción, 1.4e-5 para el LLM y 7e-6 para ViT y conector, con warmup lineal de 200 pasos y decaimiento coseno hasta el 10 % del pico. Se usó `--img_aug full`, longitud de secuencia dinámica, sin packing y checkpointing de activaciones. El cómputo total fue de aproximadamente 32 horas en 4× A100-SXM4-80GB (unos 11,6 s por paso), lo que supone 1,28M de muestras procesadas, aproximadamente 0,64 épocas. El autor señala que la receta difiere de la del paper de MolmoAct2 en dos puntos: el paper usa 8 pasos de flow por chunk (`--num_flow_timesteps=8`) y co-entrena la pérdida de acción discreta (`--action_format=both`), mientras que este run dejó ambos en sus valores por defecto.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y observaciones visuales multicámara.
- Procesamiento conjunto de cuatro flujos de imagen (dos cámaras activas y dos fotogramas iniciales fijos como memoria de escena).
- Predicción de chunks de 30 pasos de acción en pose articular absoluta para un brazo SO-101.
- Comprensión visual de escenas simuladas con domain randomization (fondos y colores de robot aleatorizados).
- Integración con el ecosistema LeRobot mediante etiquetas de normalización (`so101_bench_sim_wm`) y `norm_stats.json`.
- Servido como política remota mediante un servidor de inferencia compatible con el cliente de evaluación de SO-101 Bench.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, código ni modalidades de audio.

## Casos de uso

- Evaluación comparativa de políticas VLA en simulación: el checkpoint sirve como entrada de referencia de MolmoAct2 en SO-101 Bench, permitiendo comparar su tasa de éxito (5/39) con la de otros modelos como GR00T N1.7 bajo el mismo protocolo y dataset.
- Estudio de escalado y presupuesto de cómputo en ajuste fino completo: al documentarse el número de muestras vistas (1,28M, 0,64 épocas) y la curva de éxito por paso, es un caso útil para analizar el sobrentrenamiento aparente (la pérdida baja de 0,04 a 0,02 mientras el éxito se estanca en torno al 15 %).
- Reproducción de pipelines de entrenamiento VLA: el repositorio de código y el parche de registro de la mezcla `so101_bench_sim_wm` permiten replicar el flujo con el comando de dataset personalizado de `allenai/molmoact2`.
- Desarrollo de clientes de inferencia robótica: el servidor `scripts/molmoact2_server.py` y el mapeador `SO101MolmoAct2Mapper` sirven de plantilla para convertir articulaciones simuladas al marco del checkpoint (escala y offset documentados).
- Pruebas de integración de conversión de marcos articulares: la especificación exacta de `scale = [1.190330, -1.035604, 0.973626, 1.007033, 1.685714, 1.0]` y `offset = [0, 90, 90, 0, 0, 0]` con negación de `shoulder_lift` facilita validar pipelines de datos antes de entrenamientos mayores.
- Benchmarking de hardware para VLA: con 11,7 GB de VRAM y 0,57 s por chunk de 30 pasos en una RTX 3090, el modelo permite medir latencia y consumo en GPUs de consumo para planificar despliegues.
- Docencia e investigación en robótica accesible: al estar basado en el brazo SO-101 y en simulación Isaac Lab, encaja en laboratorios con presupuesto limitado que quieran estudiar fallos de agarre y manipulación espacial.

## Benchmarks y rendimiento

Resultados de validación en SO-101 Bench simulado (39 episodios retenidos, conjunto `real_gr00t_val_v2`, 13 episodios por split de objetos, aproximadamente la mitad con fondos y colores aleatorizados):

| Paso | 1000 | 2000 | 3000 | 4000 | 6000 | 7000 | 8000 | 9000 | 10000 |
|---|---|---|---|---|---|---|---|---|---|
| Horizonte de ejecución | 16 | 16 | 16 | 16 | 16 | 30 | 30 | 30 | 30 |
| Éxitos / 39 | 6 | 2 | 4 | 7 | 6 | 7 | 5 | 7 | 5 |

Comparación directa reportada por el autor con el mismo dataset y presupuesto:

| Modelo | Éxitos / 39 |
|---|---|
| so101_bench_MolmoAct2-SO101_WM_full_fine_tune (este) | 5 |
| GR00T N1.7 (3B, backbone congelado) | 19 |

Métricas de inferencia medidas en RTX 3090: 0,57 s por chunk de 30 pasos con cuatro imágenes de 640×480, bf16 y 10 pasos de flow, con un consumo de aproximadamente 11,7 GB de VRAM. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,7 GB en bf16 con cuatro imágenes de 640×480 y 10 pasos de flow (dato medido en RTX 3090).
- GPU recomendadas: A100-SXM4-80GB para entrenamiento (4 unidades, unas 32 h); para inferencia, RTX 3090, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3090 (24 GB) y RTX 4090 (24 GB) con el checkpoint en bf16; en GPUs de 16 GB no hay datos publicados y probablemente requiera cuantización no documentada.
- Opciones de despliegue: servidor propio `scripts/molmoact2_server.py` del repositorio SO-101 Bench con `--device cuda:0 --dtype bfloat16 --num_steps 10 --port 8000`; requiere `transformers` con `trust_remote_code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,57 s por chunk de 30 pasos de acción en RTX 3090; no se publican cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito en SO-101 Bench sim | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_bench_MolmoAct2-SO101_WM_full_fine_tune | 5.4B | no disponible | 5/39 | no disponible | HuggingFace (este repo) |
| GR00T N1.7 (3B) | 3B | no disponible | 19/39 | no disponible | HuggingFace (`5hadytru/so101_bench_GR00T_N1.7-3B`) |
| MolmoAct2-SO100_101 (base) | 5.4B (según este fine-tune) | no disponible | no disponible | no disponible | HuggingFace (`allenai/MolmoAct2-SO100_101`) |

No se dispone de datos de otros modelos comparables en la misma categoría (políticas VLA para brazos de bajo coste) dentro de la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo: solo 5 de 39 episodios de validación resueltos, frente a 19/39 de GR00T N1.7 con el mismo dataset y presupuesto.
- Infraentrenamiento documentado: 1,28M de muestras procesadas (aproximadamente 0,64 épocas) frente a las 12,8M del run de GR00T con backbone congelado; el paper de MolmoAct2 usa entre 10 y 20 veces más cómputo en sus fine-tunes publicados.
- Divergencia de receta respecto al paper: se usó 1 paso de flow por chunk en lugar de 8, y solo pérdida de acción continua en lugar de co-entrenar la discreta (`--action_format=both`).
- Estancamiento del éxito: la tasa se mantiene en torno al 15 % desde el paso 4000 mientras la pérdida de entrenamiento sigue bajando de 0,04 a 0,02, lo que sugiere sobreajuste o desalineación entre pérdida y éxito de tarea.
- Fallos de agarre: en los episodios fallidos el brazo se mueve con propósito pero no completa el agarre, según el autor.
- Dependencia de convenciones frágiles: marco articular calibrado en grados con `shoulder_lift` negado y +90° añadido a `shoulder_lift` y `elbow_flex`; orden de cámaras y temporización de fotogramas `_init` deben respetarse exactamente.
- Solo validado en simulación (Isaac Lab) con el conjunto `real_gr00t_val_v2`; no hay evidencia de transferencia a robot real.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no declarados: las instrucciones en lenguaje natural no tienen cobertura lingüística documentada.
- Riesgo de alucinación no evaluado en este contexto; el modelo no está pensado para generación de texto general.
- Requiere `trust_remote_code` para cargar el checkpoint, lo que implica ejecutar código del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Dataset de entrenamiento: https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM
- Paper SO-101 Bench: https://huggingface.co/papers/2610.36420
- Página del proyecto: https://so101-bench.github.io
- Código: https://github.com/5hadytru/so101_bench
- Código de MolmoAct2: https://github.com/allenai/molmoact2
- Checkpoint comparable GR00T N1.7: https://huggingface.co/5hadytru/so101_bench_GR00T_N1.7-3B
