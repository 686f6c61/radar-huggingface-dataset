# francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455

## Resumen

El modelo `zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455` es un ajuste fino (SFT) desarrollado por el usuario de HuggingFace `francesca9805`, derivado del checkpoint base `francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed455`. Con 124.770.816 parámetros, se sitúa en el rango de tamaño de GPT-2 small y lleva la etiqueta de arquitectura `gpt2`, por lo que se trata de un transformer decoder-only orientado a generación de texto. El entrenamiento se ha realizado con la librería TRL (versión 0.23.0) mediante supervisión fina (SFT), según declara la propia model card.

El identificador del repositorio ofrece pistas sobre su origen: el segmento `zho` corresponde al código ISO 639-3 del chino, `100mb` sugiere un corpus de entrenamiento del orden de 100 MB y `seed455` apunta a una semilla concreta de un barrido experimental. Se trata, por tanto, de un modelo de investigación de escala reducida y probablemente especializado en chino, aunque ni la licencia ni los idiomas soportados están declarados explícitamente en la ficha oficial.

Su relevancia es limitada fuera del contexto académico del que procede: no acumula descargas ni interacciones, no publica resultados de benchmarks y carece de licencia declarada, lo que restringe su uso en producción. Resulta útil como referencia reproducible de un pipeline de ajuste fino con TRL sobre un dataset pequeño y empaquetado (packed) de secuencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según la etiqueta `gpt2` del repositorio); configuración de capas no disponible |
| Parámetros totales | 124.770.816 (~124,8 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se publican pesos GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible (el identificador incluye `zho`, código ISO 639-3 del chino, pero la ficha no lo confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como un ajuste fino del checkpoint `ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed455` y lo etiqueta con `gpt2`, `transformers` y `text-generation`, lo que apunta a una arquitectura transformer decoder-only de estilo GPT-2. El recuento de 124.770.816 parámetros coincide con el de GPT-2 small, aunque la configuración exacta (número de capas, dimensión de embeddings, cabezas de atención) no se detalla en la información disponible. El nombre del checkpoint base incluye los términos `packed` (empaquetado de secuencias) y `newlex` (posiblemente léxico o tokenizador nuevo), lo que sugiere un preprocesado específico del corpus, pero no hay documentación que lo confirme.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO (más allá del propio SFT). El identificador `before-ckpt500` apunta a un checkpoint intermedio dentro de una ejecución más larga, y `bfdiso` y `seed455` parecen referirse a una configuración experimental concreta. Hay una ejecución de Weights & Biases enlazada por el autor, pero su contenido no se ha facilitado.

## Capacidades

- Generación de texto autoregresiva, según la etiqueta de pipeline `text-generation`.
- Ajuste fino supervisado sobre instrucciones o diálogo (la model card incluye un ejemplo de `pipeline` con un mensaje de rol `user`, lo que indica formato conversacional).
- Capacidad multilingüe: no confirmada; el identificador sugiere entrenamiento en chino, pero no hay datos oficiales.
- Tool calling / function calling: no disponible y no mencionado.
- Soporte de agentes y razonamiento multi-paso: no disponible y no mencionado.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el modelo sirve como punto de referencia para comparar pipelines de SFT con TRL sobre corpus pequeños y empaquetados.
- Investigación sobre tokenizadores y léxicos (`newlex`): permite estudiar el impacto de un vocabulario nuevo en modelos de escala GPT-2 sobre chino.
- Generación de texto en chino de dominio acotado: si el corpus de 100 MB es temático, el modelo podría generar continuaciones coherentes dentro de ese registro, aunque sin garantías documentadas.
- Pruebas de infraestructura de despliegue: al ser un modelo de ~125 M de parámetros, es idóneo para validar tuberías de inferencia (TGI, vLLM, transformers) sin coste elevado de GPU.
- Evaluación comparativa de checkpoints intermedios: la convención `before-ckpt500` facilita analizar la evolución del modelo a lo largo del entrenamiento.
- Docencia y prototipado: útil en entornos educativos para ilustrar el flujo completo de entrenamiento y publicación con el ecosistema HuggingFace.
- No se recomienda su uso en producción orientada a usuario final dada la ausencia de licencia, benchmarks e idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32, 250 MB en fp16/bf16, 125 MB en int8 y 62 MB en int4 (cálculo teórico a partir de los 124,8 M de parámetros).
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Bastan tarjetas de gama baja o integradas con más de 1 GB de memoria.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, GTX 1650, e incluso en CPU con memoria suficiente).
- Opciones de despliegue: `transformers` (soporte nativo y `pipeline`), Text Generation Inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se ha publicado.
- Latencia y throughput estimados: no disponible. El tamaño del repositorio (4,5 GB) es notablemente superior al de los pesos en fp32 (~500 MB), lo que sugiere la presencia de checkpoints u optimizadores adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `zho-100mb-...-seed455` (este) | 124,8 M | no disponible | no disponible | safetensors en HuggingFace, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (según publicación original) | ampliamente disponible, benchmarks públicos |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT (según publicación original) | ampliamente disponible |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF y múltiples cuantizaciones |

La comparación es orientativa: los datos de GPT-2 y Qwen2.5 corresponden a características generales ampliamente documentadas, mientras que para el modelo analizado no hay métricas de rendimiento publicadas, por lo que no puede establecerse una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de 100 MB en un único idioma probablemente introduce sesgos de dominio y de registro no evaluados.
- Riesgo de alucinación: elevado en modelos de este tamaño y con entrenamiento limitado; sin benchmarks no puede cuantificarse.
- Limitaciones de contexto e idioma: la longitud de contexto no está declarada y los idiomas soportados no se confirman oficialmente; el identificador apunta a chino.
- Licencia: no disponible, lo que impide determinar si se permite uso comercial. Se desaconseja su uso en producción hasta aclarar este punto.
- Sin métricas: no hay evaluaciones publicadas (MMLU, HumanEval, GSM8K ni equivalentes), por lo que no puede verificarse su calidad.
- Procedencia experimental: el nombre indica un checkpoint intermedio de una ejecución concreta, no una versión final validada.
- Repositorio sin tracción: cero descargas y cero interacciones, sin garantía de mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed455
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/o0647l7g
- Repositorio de TRL: https://github.com/huggingface/trl
