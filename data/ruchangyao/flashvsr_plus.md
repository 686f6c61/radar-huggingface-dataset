# ruchangyao/FlashVSR_plus

## Resumen

FlashVSR+ es un modelo de superresolución y restauración de vídeo (pipeline `video-to-video`) publicado por Ruchang Yao, Shi Guo, Junhao Zhuang, Mingde Yao, Xin Cai, Jiahao Zhan, Bin Fu, Xinyuan Chen, Yu Qiao y Tianfan Xue. Se construye sobre el modelo de difusión texto-a-vídeo Wan2.1-T2V-1.3B y resuelve el problema de escalar y restaurar vídeo de baja calidad hasta 4K manteniendo un coste de inferencia asumible en hardware de consumo: el autor afirma que permite inferencia 4K sin teselado espacial en una única GPU RTX 4090 de 24 GB.

La contribución técnica se articula en dos piezas. La primera es una atención híbrida que explota la localidad espacial y temporal de la atención y conserva interacciones globales dispersas, lo que según la model card se traduce en hasta 2× de aceleración del DiT y un 45 % menos de memoria pico. La segunda es Reward-Yield Distribution Matching Distillation (RY-DMD), un esquema de alineación con preferencias mediante recompensas de caja negra que no requiere diferenciar a través del modelo de recompensa.

El modelo se distribuye en dos variantes con el mismo decoder: FlashVSR+ Turbo, orientada a velocidad de inferencia, y FlashVSR+ Base, orientada a calidad de reconstrucción. Ambas funcionan en un solo paso de difusión. El repositorio ocupa 14,4 GB, se publica bajo licencia Apache 2.0 y acumula 215 descargas y 15 likes desde su creación el 27 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de un paso con Diffusion Transformer (DiT) derivado de Wan2.1-T2V-1.3B; atención híbrida espacial y temporal con interacciones globales dispersas |
| Parámetros totales | No disponible (el modelo base Wan2.1-T2V-1.3B declara 1.300 millones; el recuento exacto del checkpoint liberado no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica ventana de contexto textual (modelo de vídeo) |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors y checkpoints en precisión original; no se documentan GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`dit.safetensors`, `lq_proj_in.safetensors`), checkpoint `.ckpt` (`TCDecoder.ckpt`) y `.pth` (`Wan2.1_VAE.pth`) |

## Arquitectura y entrenamiento

FlashVSR+ es un framework de difusión de un solo paso para superresolución de vídeo, heredero del FlashVSR original (arXiv 2510.12747) y apoyado en el backbone DiT de Wan2.1-T2V-1.3B. La entrada de baja calidad se inyecta mediante un módulo de proyección dedicado (`lq_proj_in.safetensors`), que condiciona el transformer de difusión. La atención híbrida combina atención espacial y temporal de alcance local con un conjunto disperso de interacciones globales, lo que reduce el coste cuadrático de la atención completa sin perder coerencia entre fotogramas lejanos. La decodificación se realiza con `TCDecoder.ckpt`, compartido por las dos variantes, y se ofrece además el VAE de Wan2.1 (`Wan2.1_VAE.pth`) como decoder opcional.

El entrenamiento incorpora RY-DMD, una destilación por coincidencia de distribuciones que alinea el modelo con recompensas de preferencia tratadas como caja negra, sin retropropagar a través del modelo de recompensa; el autor indica que este esquema generaliza también a generación texto-a-imagen. El conjunto de datos asociado está publicado como `ruchangyao/FlashVSR_Plus_Dataset`, pero en la información disponible no se detallan el número de tokens, la composición del dataset, las fuentes del material audiovisual ni si hubo etapas adicionales de RLHF o DPO más allá de RY-DMD.

## Capacidades

- Superresolución de vídeo de un solo paso: escalado de material de baja calidad a alta resolución, incluyendo inferencia 4K sin teselado espacial según el autor.
- Restauración de vídeo (etiqueta `video-restoration` del repositorio): reconstrucción de detalle y reducción de degradaciones, sin que la model card especifique qué tipos concretos de degradación se cubren.
- Condicionamiento explícito por vídeo de baja calidad mediante el módulo `lq_proj_in`, además del pipeline `video-to-video` declarado en HuggingFace.
- Dos modos de funcionamiento: Turbo (prioriza velocidad) y Base (prioriza calidad de reconstrucción), con decoder compartido.
- Inferencia en un único paso de difusión, lo que evita las decenas de pasos habituales en modelos de difusión multi-step.
- Generación de vídeo a partir de texto: no documentada para este checkpoint, aunque el modelo base Wan2.1-T2V-1.3B es texto-a-vídeo.
- Tool calling, function calling, razonamiento multi-paso, agentes, audio o modo "thinking": no disponibles; no son capacidades de este modelo.

## Casos de uso

- Remasterización de archivo audiovisual: escalar metraje histórico o de baja resolución a 4K en una sola GPU de 24 GB, lo que permite plantear la restauración en estaciones de trabajo sin clúster.
- Postproducción y VFX: convertir plates de baja resolución en elementos 4K utilizables en composición, con la variante Base cuando prima la fidelidad de reconstrucción.
- Optimización de pipelines de streaming: aplicar superresolución en el ingest para servir un ladder de bitrate más alto sin reemitir el material original a máxima calidad.
- Preprocesado para visión por computador: aumentar la resolución efectiva de vídeo de vigilancia o de drones antes de etapas de detección y seguimiento, con la advertencia de que el detalle sintetizado no es evidencia fiable.
- Vídeo móvil y de bajo ancho de banda: restaurar material capturado con ajustes agresivos de compresión antes de su publicación o análisis.
- Investigación en destilación de difusión: usar el modelo y RY-DMD como referencia reproducible para estudiar modelos de un paso y atención híbrida en tareas vídeo-a-vídeo.
- Prototipado rápido de producto: al caber en una RTX 4090, permite iterar sobre demos de superresolución sin depender de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de reconstrucción (PSNR, SSIM, LPIPS, DISTS ni evaluaciones subjectivas) ni comparaciones numéricas con otros modelos de superresolución de vídeo. Las únicas cifras declaradas por el autor son de eficiencia:

| Métrica declarada | Valor | Ámbito |
|---|---|---|
| Aceleración del DiT | Hasta 2× | Atención híbrida frente a la línea base no especificada |
| Reducción de memoria pico | Hasta 45 % | Atención híbrida frente a la línea base no especificada |
| Resolución máxima verificada | 4K sin teselado espacial | RTX 4090 de 24 GB |
| Pasos de difusión en inferencia | 1 | Ambas variantes (Turbo y Base) |

## Requisitos de hardware

- VRAM: 24 GB son suficientes para inferencia 4K sin teselado espacial, según la afirmación del autor; no se publican cifras de memoria para otras resoluciones ni para las variantes Turbo y Base por separado.
- GPU verificada: NVIDIA RTX 4090 (24 GB). No se documentan resultados en A100, H100, L40S ni en GPUs de menos de 24 GB.
- Cabe en GPU de consumo: sí, al menos en RTX 4090; el comportamiento en tarjetas de 8, 12 o 16 GB no está documentado.
- Almacenamiento: el repositorio ocupa 14,4 GB (pesos de las dos variantes, decoder compartido y VAE opcional).
- Despliegue: el pipeline de inferencia propio del repositorio de GitHub (`OpenImagingLab/FlashVSR_Plus`). No se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni Diffusers.
- Latencia y throughput: no disponibles en valores absolutos; solo se declara una aceleración relativa de hasta 2× en el DiT.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlashVSR+ (Turbo / Base) | Superresolución y restauración de vídeo, un paso | No disponible (base de 1.300 M) | No aplica | Apache 2.0 | HuggingFace, 215 descargas |
| FlashVSR (original, arXiv 2510.12747) | Superresolución de vídeo | No disponible | No aplica | No disponible | Referenciado como trabajo previo; repositorio no indicado en la información disponible |
| Wan2.1-T2V-1.3B | Generación texto-a-vídeo (modelo base) | 1.300 M | No aplica | No disponible en la información proporcionada | HuggingFace (`Wan-AI/Wan2.1-T2V-1.3B`) |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada; la comparación se limita a tarea, tamaño declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de benchmarks de calidad: no hay PSNR, SSIM, LPIPS ni evaluaciones subjetivas publicadas, por lo que no es posible verificar la calidad de reconstrucción frente a alternativas.
- Riesgo de alucinación: al ser un modelo generativo de restauración, puede sintetizar detalle plausible que no existe en la fuente. No debe emplearse como prueba pericial, en diagnóstico médico ni en contextos donde la fidelidad pixel a pixel sea requisito legal.
- Sesgos: no documentados. El dataset de entrenamiento (`FlashVSR_Plus_Dataset`) no describe composición, procedencia ni cobertura demográfica o geográfica del material.
- Idiomas y texto: no se documenta ningún soporte lingüístico ni uso de prompts textuales en este checkpoint, pese a que el modelo base es texto-a-vídeo.
- Licencia: el repositorio es Apache 2.0, pero se apoya en Wan2.1-T2V-1.3B y en componentes adicionales (`TCDecoder.ckpt`, `Wan2.1_VAE.pth`) cuyos términos conviene verificar antes de un uso comercial.
- Requisitos de memoria: las afirmaciones de 24 GB y 4K se refieren a una RTX 4090 concreta; no hay datos para otras GPU ni para resoluciones o duraciones mayores.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, AWQ, GPTQ o FP8, lo que limita el despliegue en GPUs de gama media.
- Madurez: repositorio con 215 descargas y 15 likes, creado en septiembre de 2026, sin historial de producción documentado.

## Enlaces

- HuggingFace: https://huggingface.co/ruchangyao/FlashVSR_plus
- Página del proyecto: https://flashvsr.tech
- Paper de FlashVSR+: https://arxiv.org/abs/2610.17552
- Paper de FlashVSR original: https://arxiv.org/abs/2510.12747
- Repositorio de código: https://github.com/OpenImagingLab/FlashVSR_Plus
- Dataset de entrenamiento: https://huggingface.co/datasets/ruchangyao/FlashVSR_Plus_Dataset
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
