# francesca9805/zho-hans-100mb-after-ppt-mp-struct-bcc-100mb-ckpt500_seed3407

## Resumen

El modelo `zho-hans-100mb-after-ppt-mp-struct-bcc-100mb-ckpt500_seed3407` es un ajuste fino (SFT) del checkpoint `francesca9805/zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed3407`, publicado por el usuario francesca9805 en Hugging Face. Se trata de un modelo de generación de texto con arquitectura GPT-2 y 124.770.816 parámetros totales, entrenado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0. El nombre del repositorio sugiere un trabajo experimental sobre tokenización y estructura de datos en chino mandarín simplificado (zho-hans) con corpus tipo BCC de 100 MB, aunque la model card no documenta explícitamente el dataset ni el objetivo del experimento.

El modelo forma parte de una línea de experimentos de ajuste fino identificados por semillas (`seed3407`) y checkpoints (`ckpt500`), lo que indica una orientación a investigación reproducible más que a un producto listo para producción. No se declara licencia, idiomas soportados ni resultados de evaluación en la información disponible.

Su relevancia actual es limitada fuera del contexto de investigación: es un modelo pequeño (124,8 M de parámetros), con un repositorio de 9 GB que incluye presumiblemente múltiples checkpoints, y sin documentación sobre rendimiento. Resulta útil como referencia para estudiar efectos de SFT sobre modelos GPT-2 pequeños en dominios lingüísticos específicos, pero no compite con modelos de propósito general contemporáneos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, compatibles con cuantización estándar de llama.cpp/GGUF, pero no publicados por el autor) |
| Idiomas soportados | no disponible (el identificador sugiere chino mandarín simplificado, `zho-hans`, sin confirmación en la model card) |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atención causal completa, sin innovaciones posteriores como atención lineal, decodificación especulativa ni mezcla de expertos. Con 124,8 M de parámetros, corresponde al tamaño de GPT-2 small/medium según la configuración exacta, aunque la información disponible no detalla el número de capas, dimensiones ocultas ni cabezas de atención.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, partiendo del modelo base `francesca9805/zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed3407`. El nombre del checkpoint (`ckpt500`) sugiere el paso 500 de entrenamiento y `seed3407` la semilla utilizada. El identificador `100mb` apunta a un corpus de entrenamiento de aproximadamente 100 MB, y `bcc` probablemente hace referencia al corpus BCC de chino (BLCU Chinese Corpus), aunque esto no se confirma en la model card. No se documentan número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`, lo que sugiere un contexto académico en la Universidad de Groningen.

## Capacidades

- Generación de texto autoregresiva estándar de GPT-2.
- Formateo de conversación multi-turno mediante el pipeline `text-generation` de Transformers con listas de mensajes `{"role": "user", "content": ...}`.
- Ajuste fino supervisado (SFT) orientado presumiblemente a seguir instrucciones en chino mandarín simplificado, aunque no se documenta explícitamente.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidades multilingües: no disponibles; el identificador sugiere dominio exclusivo del chino, sin confirmación.

## Casos de uso

- Investigación sobre tokenización en chino: el modelo permite reproducir experimentos de SFT sobre corpus de 100 MB con semilla fija (`seed3407`) y checkpoint concreto (`ckpt500`), útil para estudios de ablación en la Universidad de Groningen o contextos similares.
- Generación de texto en chino simplificado para prototipos: dado el identificador `zho-hans`, puede emplearse para generar borradores o completar texto en mandarín simplificado en entornos de experimentación, siempre que se valide la calidad manualmente.
- Reproducción de pipelines TRL: sirve como ejemplo funcional de entrenamiento SFT con TRL 0.23.0 y Transformers 4.56.2, útil para desarrolladores que quieran replicar la configuración con sus propios datos.
- Evaluación comparativa de checkpoints: al existir un modelo base y este ajuste, permite comparar el efecto del SFT sobre un GPT-2 pequeño en la misma semilla.
- Docencia y formación: adecuado para demostrar el ciclo completo de ajuste fino de un modelo pequeño (124,8 M de parámetros) en una GPU de consumo.
- Generación de texto corto en aplicaciones de bajo coste: con 124,8 M de parámetros, puede desplegarse en CPU o GPU modesta para tareas de autocompletado o generación de respuestas breves, aceptando la falta de garantías de calidad.
- Integración en pipelines de Hugging Face Endpoints: el tag `endpoints_compatible` permite desplegarlo en infraestructura gestionada de Hugging Face para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB (124,8 M de parámetros × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 250 MB.
- VRAM estimada en cuantización int8: aproximadamente 125 MB; en int4: aproximadamente 65 MB (estimaciones teóricas del peso, sin incluir overhead).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100, H100 y en CPU.
- Cabe en GPU de consumo y en CPU; puede ejecutarse en Raspberry Pi o entornos embebidos con suficiente RAM.
- Opciones de despliegue: transformers (pipeline `text-generation`), Text Generation Inference (tag oficial), potencialmente llama.cpp/Ollama tras conversión a GGUF (no publicada por el autor), y Hugging Face Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; por el tamaño, se espera throughput alto en GPU moderna y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (francesca9805 SFT) | 124,8 M | no disponible | no disponible | Hugging Face | Ajuste SFT experimental, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI | Referencia canónica de la arquitectura; multilingüe limitado |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face, OpenAI | Mayor capacidad, misma familia |
| Modelos chinos pequeños tipo Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face | Contexto y rendimiento muy superiores; licencia clara |

La comparación con GPT-2 small es directa por tamaño; la comparación con Qwen2.5-0.5B ilustra la brecha respecto a modelos pequeños modernos con contexto largo y licencia permisiva. No hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a alternativas.
- Licencia no especificada (`licence: license`): riesgo legal para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: aunque el identificador sugiere chino simplificado, no hay confirmación; no se recomienda asumir capacidades multilingües.
- Sesgos desconocidos: al derivar de un corpus BCC de 100 MB, probablemente hereda sesgos del corpus, pero no se documentan.
- Riesgo de alucinación elevado: GPT-2 de 124,8 M de parámetros sin RLHF tiene tendencia alta a generar texto plausible pero incorrecto.
- Contexto no documentado: se desconoce la ventana máxima; GPT-2 estándar es de 1024 tokens, pero no se confirma.
- Repositorio de 9 GB: probablemente contiene múltiples checkpoints, lo que complica el despliegue y el almacenamiento.
- Modelo experimental de investigación: no apto para producción sin validación exhaustiva; el nombre sugiere un experimento de tokenización más que un modelo final.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/francesca9805/zho-hans-100mb-after-ppt-mp-struct-bcc-100mb-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c2z6h0fj
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., 2020, GitHub repository
