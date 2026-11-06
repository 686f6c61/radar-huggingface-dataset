# RainyBot/SemWAM-RoboTwin-CoTrain-20261023-A-flexpi-estimated

## Resumen

SemWAM-RoboTwin-CoTrain-20261023-A-flexpi-estimated es un checkpoint de investigación publicado por el usuario RainyBot en Hugging Face, orientado a robótica y manipulación visual. El modelo se presenta como un sistema multimodal de tipo "world-action model" (SemWAM) entrenado sobre el simulador RoboTwin, con un diseño que combina un DiT de vídeo (world model) de 30 capas y un DiT de acción separado de 30 capas, ambos con atención causal y condicionamiento por profundidad estimada y características semánticas.

La arquitectura declarada en la model card es `rgb_dep_sem`: procesa RGB, profundidad (representada como pointmap) y features semánticas extraídas de un backbone DINOv3 ViT-B/16. La dimensión oculta del DiT de vídeo es 3072 con FFN de 14336 y 24 cabezas de atención (head dim 128), mientras que el DiT de acción usa hidden 1024 y FFN 4096. El modelo incluye un bloque MoE parcialmente configurado (4 expertos, top_k 0, experto compartido) en las capas 21, 24 y 27 del DiT de vídeo, aunque su comportamiento efectivo no está documentado.

El checkpoint corresponde al paso de optimizador 21725 y al run identificado como `A_flexpi_estimated_speed_8x8_20261023_v1`. El repositorio ocupa 99,4 GB y acumula 68 descargas en el momento de la consulta. No se han publicado resultados de benchmarks, licencia, idiomas soportados ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT dual (video world model + action model) con atencion causal, condicionamiento RGB + profundidad (pointmap) + semantica DINOv3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE configurado con 4 expertos, top_k 0, experto compartido en capas 21, 24, 27 del DiT de video) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch, 99,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres DiT (Diffusion Transformer) acopladas. La torre de vídeo tiene `in_dim` 48, `out_dim` 48, `patch_size` [1, 2, 2], 30 capas, `hidden_dim` 3072, `ffn_dim` 14336, 24 cabezas con `attn_head_dim` 128 y `text_dim` 4096. La torre de acción comparte `action_dim` 14, `text_dim` 4096 y 30 capas, pero con `hidden_dim` 1024 y `ffn_dim` 4096. Ambas usan schedulers de difusión con `train_shift` 5.0, `infer_shift` 5.0 y 1000 timesteps de entrenamiento.

El condicionamiento se realiza mediante `t_concat` con layout `robotwin_t`, e incluye tres streams visuales (RGB, profundidad como pointmap y semántica). La profundidad se representa como pointmap con bounds normalizados x∈[-0.6, 0.6], y∈[-0.6, 0.6], z∈[0, 1.5] y profundidad máxima de 2,0 m. Las features semánticas provienen de un backbone DINOv3 ViT-B/16 con 768 canales, sin compresión y con pooling temporal por media. La pérdida combina cuatro términos con peso 1.0 cada uno: vídeo, acción, semántica y profundidad. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de 14 dimensiones condicionadas por observaciones RGB, profundidad estimada y features semánticas.
- Modelado de mundo (world model) mediante difusión sobre vídeo, con atención causal y máscara `first_frame_causal`.
- Condicionamiento multimodal con proyecciones separadas para profundidad y semántica.
- Soporte de configuración MoE parcial en capas profundas del DiT de vídeo (4 expertos, experto compartido, `token_dispatch: dense_masked`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de "thinking".
- No se documenta vision-language general: el uso previsto es robótico y específico del simulador RoboTwin.

## Casos de uso

- Investigación en manipulación robótica simulada: el modelo puede usarse como policy condicionada por RGB, profundidad y semántica en tareas de RoboTwin, aprovechando la torre de acción de 14 dimensiones.
- Aprendizaje de world models para robótica: la torre de vídeo con difusión y atención causal permite generar rollouts de vídeo condicionados por acciones, útiles para planificación y evaluación de políticas.
- Co-entrenamiento de representaciones visión-lenguaje-acción: el uso de DINOv3 ViT-B/16 como backbone semántico permite reutilizar features preentrenadas en tareas downstream de robótica.
- Estudio de arquitecturas MoE en DiT: la configuración con 4 expertos y experto compartido en capas 21, 24 y 27 sirve como base para experimentos de enrutamiento por modalidad.
- Benchmarking de pointmaps estimados frente a ground truth: el checkpoint usa profundidad estimada (`condition_source: estimated`, `target_source: estimated`), lo que permite comparar contra variantes con profundidad real.
- Reproducción de experimentos de co-entrenamiento: el identificador `CoTrain` y el paso 21725 permiten replicar recetas de entrenamiento conjunto de vídeo, acción, profundidad y semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 99,4 GB, lo que sugiere pesos en precisión completa o mixta; la inferencia requeriría al menos una GPU con memoria suficiente para cargar ambas torres DiT y el backbone DINOv3.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que requiera GPUs de clase A100/H100 con 80 GB, pero no se confirma en la información.
- Cabe en consumer GPU: no disponible; el tamaño del checkpoint hace improbable su carga en GPUs de consumo sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio es PyTorch (`library_name: pytorch`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (world-action models para RoboTwin) con parámetros, contexto o licencia documentados.

## Limitaciones y advertencias

- No se ha publicado licencia; el uso comercial queda sin autorización explícita.
- No se documentan idiomas soportados ni capacidades lingüísticas generales.
- El modelo está diseñado específicamente para el simulador RoboTwin y su layout `robotwin_t`; su transferencia a otros entornos no está validada.
- La profundidad es estimada, no ground truth, lo que puede introducir sesgos en la política aprendida.
- El bloque MoE tiene `top_k: 0`, lo que sugiere que el enrutamiento podría estar desactivado o ser no efectivo; no se aclara en la model card.
- No hay información sobre sesgos, tasas de alucinación ni evaluación cualitativa.
- El checkpoint es un artefacto de investigación (paso 21725) sin garantías de robustez para producción.
- El tamaño del repositorio (99,4 GB) y la ausencia de cuantizaciones documentadas dificultan el despliegue en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RoboTwin-CoTrain-20261023-A-flexpi-estimated
