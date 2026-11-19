# phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13136011-step100000

## Resumen

`phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13136011-step100000` es un checkpoint de investigación de 379,36 millones de parámetros entrenado con NanoGPT Pro, un framework de entrenamiento de modelos tipo GPT de escala reducida. Lo publica el usuario `phuctahong` como artefacto de un experimento concreto (job `13136011`, step `100000`) dentro de una línea de trabajo sobre variantes de atención y mecanismos de escalado paralelo identificados en el nombre del repositorio como `gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton`.

El modelo emplea atención multi-cabeza (MHA) con una variante etiquetada como `falcon`, junto con componentes denominados `ctxeta` y `ctxlambda` y kernels Triton, sobre un dataset de entrenamiento FineWeb-Edu (la ruta interna indica `D_fineweb-edu100B` y `T_49.15B`, es decir, aproximadamente 49.150 millones de tokens vistos). El checkpoint se publica únicamente con pesos listos para inferencia (`config.json`, `model.safetensors`, `generation_config.json`), sin tokenizador ni código de modelado en el repositorio.

Su relevancia es acotada: no es un modelo de producción ni un lanzamiento comercial, sino un artefacto reproducible de experimentación en entrenamiento de LLM a pequeña escala. Resulta útil para quienes investigan variantes de atención, recetas de entrenamiento con NanoGPT Pro o quieren inspeccionar los pesos de un run concreto, pero no dispone de model card descriptiva, benchmarks publicados ni documentación de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT con atención multi-cabeza (MHA) y variante `falcon`; componentes `ctxeta`/`ctxlambda` y kernels Triton (detalle no disponible) |
| Parámetros totales | 379.359.616 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16/bf16; precisión no especificada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

El nombre del repositorio y la ruta del checkpoint indican una arquitectura transformer decoder-only de tipo GPT con atención multi-cabeza, modificada con una variante denominada `falcon` y con mecanismos adicionales etiquetados `ctxeta` y `ctxlambda`. También se menciona `scaled-parallel` y el uso de kernels Triton, lo que sugiere implementaciones personalizadas de capas de atención o de normalización orientadas a eficiencia en GPU. No se dispone de la model card técnica ni del código de modelado, por lo que la naturaleza exacta de estas modificaciones (posiblemente variantes de atención con parámetros por contexto o escalados tipo lambda) no está documentada en la información proporcionada.

El entrenamiento se realizó con NanoGPT Pro sobre FineWeb-Edu, con un presupuesto declarado de aproximadamente 49.150 millones de tokens (`T_49.15B`) y una referencia a `fineweb-edu100B` en la ruta. El optimizador fue AdamW con learning rate 0,001 y el checkpoint corresponde al step 100.000. No hay información sobre composición exacta del dataset, uso de RLHF/DPO, fases de annealing o evaluación intermedia.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT entrenado sobre FineWeb-Edu (contenido educativo web en inglés, presumiblemente).
- Razonamiento básico y respuesta a instrucciones limitada: al ser un checkpoint de preentrenamiento sin fase de alineación documentada, no cabe esperar un comportamiento de chat fiable.
- Generación de código y matemáticas: no disponible como capacidad verificada; depende del corpus y no hay evaluación publicada.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; los idiomas no están declarados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en variantes de atención: el checkpoint permite inspeccionar y comparar los pesos de una implementación concreta de atención `falcon` con componentes `ctxeta`/`ctxlambda`, útil para estudiar cómo afectan estas modificaciones al entrenamiento.
- Reproducibilidad de experimentos NanoGPT Pro: sirve como referencia para replicar el run `13136011` en el step 100.000 y contrastar curvas de pérdida o comportamiento con otras variantes del mismo framework.
- Baseline de modelos pequeños (~379 M) en tareas de lenguaje: puede emplearse como punto de comparación frente a modelos de tamaño similar en experimentos académicos controlados.
- Estudio de recetas de entrenamiento sobre FineWeb-Edu: permite analizar el efecto de AdamW con LR 0,001 y ~49 B tokens en un modelo de escala reducida.
- Experimentos de cuantización y eficiencia: al publicarse en safetensors, se puede convertir a GGUF/ONNX y medir el impacto de la cuantización en un modelo de este tamaño para investigación de despliegue.
- Fine-tuning académico: con 379 M de parámetros, es viable ajustarlo en una sola GPU consumer para tareas específicas (clasificación, generación de dominio) como parte de trabajos de investigación.
- Docencia y formación: útil para ilustrar el ciclo completo de entrenamiento de un LLM pequeño y el formato de publicación de checkpoints en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,5 GB solo para pesos (379 M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: en torno a 0,76 GB para pesos; en int8 aproximadamente 0,38 GB; en int4 aproximadamente 0,19 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia; una RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento o fine-tuning completo conviene una GPU con 16-24 GB (RTX 4090, A10, L4, A100).
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, incluso en cuantización de 4 bits en iGPU o CPU.
- Opciones de despliegue: al no incluir tokenizador ni código de modelado en el repositorio, es necesario reconstruir la arquitectura desde NanoGPT Pro o desde el código del autor. Una vez convertido, puede ejecutarse con PyTorch nativo; la conversión a GGUF permitiría llama.cpp u Ollama, y a formatos compatibles con vLLM o TGI requeriría implementar la arquitectura personalizada.
- Latencia y throughput estimados: no disponibles; dependen de la implementación de los kernels Triton y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NanoGPT Pro Falcon 379M) | 379 M | no disponible | Apache 2.0 | Pesos en HF, sin tokenizador ni código | Artefacto de investigación, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Pesos y código ampliamente disponibles | Referencia clásica de modelos pequeños |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Pesos y código ampliamente disponibles | Tamaño comparable, ecosistema maduro |
| Pythia-410M (EleutherAI) | 410 M | 2.048 tokens | Apache 2.0 | Pesos, código y suite de checkpoints | Suite de investigación con evaluación publicada |
| SmolLM-360M (Hugging Face) | 360 M | 2.048 tokens | Apache 2.0 | Pesos, tokenizador y documentación | Modelo pequeño con benchmarks publicados |

La comparación es aproximada: los modelos de referencia cuentan con tokenizador, documentación y evaluaciones publicadas, mientras que este checkpoint carece de todos esos elementos en la información disponible.

## Limitaciones y advertencias

- No hay model card descriptiva ni documentación de la arquitectura, el tokenizador o el uso previsto; el repositorio contiene solo pesos y configuración.
- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Al ser un checkpoint de preentrenamiento sin alineación documentada, es previsible que genere texto incoherente o inapropiado en formato conversacional y que no siga instrucciones de forma fiable.
- Riesgo elevado de alucinación y de reproducir sesgos presentes en FineWeb-Edu (contenido web educativo en inglés, con posibles sesgos de dominio y de idioma).
- Idiomas soportados no declarados; el entrenamiento sobre FineWeb-Edu sugiere predominio del inglés, con cobertura limitada de castellano.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de evaluación hace desaconsejable su uso en producción sin una validación exhaustiva previa.
- El nombre del repositorio incluye referencias a `falcon`, `ctxeta` y `ctxlambda` que podrían confundirse con el modelo Falcon de TII; no hay relación documentada con dicho modelo.
- Fecha de creación del repositorio (2026-11-19) y nomenclatura del job sugieren un entorno de scratch académico; no hay garantía de mantenimiento o soporte.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13136011-step100000
- NanoGPT (repositorio original de Andrej Karpathy): https://github.com/karpathy/nanoGPT
- FineWeb-Edu (dataset de Hugging Face): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Triton (OpenAI): https://github.com/triton-lang/triton
- Paper de FineWeb: https://arxiv.org/abs/2406.17557
