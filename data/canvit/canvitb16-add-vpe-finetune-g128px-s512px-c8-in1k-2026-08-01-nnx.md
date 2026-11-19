# canvit/canvitb16-add-vpe-finetune-g128px-s512px-c8-in1k-2026-08-01-nnx

## Resumen

CanViT-B/16 es un modelo de visión artificial de tipo *active vision* desarrollado por el grupo de investigación CanViT (Yohaï-Eliel Berreby, Sabrina Du, Audrey Durand y B. Suresh Krishna) y presentado en NeurIPS 2026. A diferencia de un Vision Transformer convencional, que procesa la imagen completa en una sola pasada, CanViT observa la escena mediante una secuencia de *glimpses* (recortes de 128 px) y acumula la información en un *canvas* (lienzo) de memoria de 8 × 8 celdas que representa la escena completa de 512 px. Esta formulación imita el muestreo foveado de la visión biológica y permite razonar sobre imágenes de alta resolución con un coste computacional controlado.

Este checkpoint concreto es la versión de clasificación de imágenes: parte del modelo preentrenado en ImageNet-21k (destilado de DINOv3-B/16) y se ajusta de extremo a extremo sobre ImageNet-1k con la estrategia LP-FT (linear probing seguida de fine-tuning) durante 100.080 pasos. Alcanza un 80,54 % de Top-1 con un solo glimpse y un 83,09 % con tres glimpses sobre escenas de 512 px, lo que demuestra que el mecanismo de memoria visual no degrada la precisión frente a un clasificador estándar.

La relevancia práctica del modelo reside en su formato: está empaquetado en `canvit-nnx`, la librería oficial basada en JAX/Flax NNX, con pesos en safetensors y un total de 95.928.936 parámetros (aproximadamente 96 M). Es, por tanto, un modelo ligero, con licencia MIT, entrenado en Cloud TPU y pensado para investigación en visión activa más que para producción de clasificación genérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer con mecanismo de visión activa (glimpses secuenciales + canvas de memoria); backbone ViT-B/16 |
| Parámetros totales | 95.928.936 (≈ 96 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de texto; la memoria visual es un canvas de 8 × 8 celdas sobre escenas de 512 px |
| Tipos de cuantización | No disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica (modelo de visión); etiquetas de clase en inglés (ImageNet-1k) |
| Licencia | MIT (con la salvedad de que el preentrenamiento destila de DINOv3, bajo DINOv3 License) |
| Formato de pesos | safetensors (formato de checkpoint de `canvit-nnx`, JAX/Flax NNX) |

## Arquitectura y entrenamiento

CanViT (Canvas Vision Transformer) es un transformer de visión con un bucle de percepción activa. En cada paso, el modelo recibe un *glimpse* de 128 px muestreado en un *viewpoint* determinado, lo procesa con un backbone ViT-B/16 y actualiza un estado persistente, el canvas de 8 × 8, que actúa como memoria de la escena. La clasificación final se obtiene a partir de ese estado, de modo que la precisión mejora a medida que se acumulan glimpses (de 80,54 % con uno a 83,09 % con tres). El checkpoint incluye la variante "add-vpe", es decir, con *viewpoint embeddings* aditivos que codifican la posición de cada recorte dentro de la escena.

El preentrenamiento se realizó por destilación desde DINOv3-B/16 sobre ImageNet-21k con escenas de 512 px y glimpses de 128 px. Sobre esa base, este checkpoint se ajusta con LP-FT sobre ImageNet-1k (1.000 clases) durante 100.080 pasos, ejecutados en Cloud TPU con JAX/Flax NNX. La model card indica que la conversión a NNX reproduce fielmente la exportación original a PyTorch (`canvit-pytorch` 0.1, revisión `518c9fbd`), verificada a 512 px de escena, 128 px de glimpse y canvas 8 × 8. No se documentan detalles sobre composición exacta del dataset de destilación, uso de RLHF/DPO (no aplica a clasificación) ni técnicas de decodificación especulativa.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k a partir de escenas de 512 px.
- Percepción activa multi-glimpse: el modelo puede refinar su predicción muestreando recortes adicionales en distintos viewpoints, con ganancia medible de precisión (80,54 % → 83,09 %).
- Memoria visual persistente mediante canvas de 8 × 8, que permite integrar información de recortes no solapados.
- Extracción de representaciones visuales (backbone ViT-B/16 destilado de DINOv3), reutilizable para tareas aguas abajo.
- Soporte de viewpoints arbitrarios mediante `Viewpoint.full_scene` y `sample_at_viewpoint`.
- No soporta tool calling, function calling, agentes de texto, razonamiento multi-paso lingüístico, generación de texto, código, matemáticas ni capacidades multilingües: es un modelo exclusivamente visual.
- No dispone de modo *thinking*, visión-a-texto, audio ni generación.

## Casos de uso

- Investigación en visión activa: reproducción de los experimentos del paper de NeurIPS 2026 con escenas de 512 px y políticas de muestreo de glimpses, usando el canvas 8 × 8 como memoria. Es el caso de uso principal del checkpoint.
- Clasificación de imágenes de alta resolución con presupuesto computacional limitado: en lugar de procesar una imagen de 512 px completa, se puede muestrear un único glimpse de 128 px y obtener ~80,5 % de Top-1, útil en dispositivos con poca memoria.
- *Baseline* para comparativas de atención foveada: sirve como referencia frente a ViT estándar en estudios sobre políticas de selección de regiones de interés.
- Extracción de *embeddings* visuales para tareas aguas abajo: el backbone destilado de DINOv3 puede congelarse y usarse como extractor de características en clasificación, recuperación o segmentación con cabezas ligeras.
- Prototipado de sistemas de inspección visual por regiones: aplicaciones donde conviene mirar primero una zona y luego ampliar selectivamente (por ejemplo, control de calidad con cámaras de alta resolución), aprovechando el bucle glimpse-canvas.
- Docencia y experimentación con JAX/Flax NNX: el modelo es un ejemplo compacto (~96 M de parámetros, 0,8 GB de repo) de pipeline completo en NNX, con `init_state`, `sample_at_viewpoint` y evaluación reproducible.

## Benchmarks y rendimiento

Resultados publicados en la model card para ImageNet-1k *validation* (viewpoints C2F, escenas de 512 px, canvas 8 × 8; media de 11 ejecuciones, con intervalo bootstrap del 95 % cuando las ejecuciones difieren):

| Glimpses | Top-1 (%) | Intervalo 95 % |
|---|---|---|
| 1 | 80,54 | — |
| 3 | 83,09 | 83,04 – 83,13 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K no aplican; no hay datos de segmentación, detección ni recuperación) ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~96 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,38 GB; en bf16/fp16, unos 0,19 GB. El estado del canvas 8 × 8 y las activaciones de un glimpse de 128 px añaden una sobrecarga pequeña pero no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con soporte JAX/CUDA, incluida una RTX 3060 o superior; también es viable en CPU para inferencia puntual, aunque no se documentan latencias.
- Cabe holgadamente en GPU de consumo (RTX 4090, RTX 3090, RTX 4060 Ti, etc.) e incluso en GPUs de gama baja con 4 GB o menos.
- Opciones de despliegue: el backend oficial es `canvit-nnx` (JAX/Flax NNX). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de clasificación de imágenes. Existe una exportación a PyTorch (`canvit-pytorch` 0.1) referenciada en la model card.
- Latencia y throughput: no disponibles. El coste escala linealmente con el número de glimpses (1 frente a 3 en los resultados publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B/16 (este checkpoint) | ≈ 96 M | Escenas 512 px, canvas 8 × 8, glimpses 128 px | 80,54 % (1 glimpse) / 83,09 % (3) | MIT (destilado de DINOv3) | Hugging Face, `canvit-nnx` |
| DINOv3-B/16 | No disponible en la información | Imagen completa | No disponible en la información | DINOv3 License | Hugging Face / GitHub (facebookresearch/dinov3) |
| ViT-B/16 (ImageNet-1k supervisado, referencia clásica) | ≈ 86 M | Imagen completa 224 px | No disponible en la información | Varía según checkpoint | Amplia |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye resultados de DINOv3-B/16 ni de ViT-B/16 en el mismo protocolo de evaluación. La comparativa relevante es conceptual: CanViT introduce percepción activa y memoria de escena sobre un backbone del mismo orden de magnitud que ViT-B/16.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes en 1.000 clases de ImageNet-1k; no genera texto ni responde a instrucciones.
- El rendimiento está medido con viewpoints C2F y escenas de 512 px; no se documenta comportamiento fuera de esa configuración (otras resoluciones, políticas de muestreo o dominios distintos de ImageNet).
- Riesgo de sesgo heredado de ImageNet-1k y de DINOv3: desequilibrios de clase, sesgos geográficos y culturales en las categorías.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza; no se documentan calibración ni umbrales recomendados.
- La licencia del checkpoint es MIT, pero el preentrenamiento destila de DINOv3, liberado bajo la DINOv3 License; conviene revisar esa licencia antes de un uso comercial, ya que puede imponer restricciones adicionales.
- Dependencia del ecosistema JAX/Flax NNX (`canvit-nnx`); la integración con PyTorch requiere la exportación `canvit-pytorch`, no verificada en esta ficha más allá de la referencia de la model card.
- Sin datos publicados de latencia, throughput ni consumo energético; no apto para planificación de capacidad en producción sin medición propia.
- El modelo tiene 99 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-finetune-g128px-s512px-c8-in1k-2026-08-01-nnx
- Modelo base (preentrenado en ImageNet-21k): https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in21k-dv3b16-2026-02-02
- Paper (NeurIPS 2026, arXiv): https://arxiv.org/abs/2603.22570
- OpenReview: https://openreview.net/forum?id=cnV9GA4pKU
- Código: https://github.com/m2b3/CanViT
- Página del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- DINOv3 (modelo del que se destila): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
