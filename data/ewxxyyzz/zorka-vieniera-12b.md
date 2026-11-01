# ewxxyyzz/zorka-vieniera-12b

## Resumen

Zorka Vieniera (Зорка Венера) es un modelo lingüístico centrado en la lengua bielorrusa, desarrollado por el usuario ewxxyyzz a partir de un continued pretraining (entrenamiento continuo de preentrenamiento) sobre google/gemma-4-12B. El objetivo del proyecto es mejorar las capacidades del modelo base en bielorruso, un idioma con escasa representación en los grandes modelos comerciales y de código abierto, partiendo de un corpus compuesto principalmente por scrapes web, datos educativos y literatura. El entrenamiento filtró explícitamente las variantes Lacinka (ortografía latina) y Taraszkevica (norma ortográfica clásica), concentrándose en el bielorruso estándar en alfabeto cirílico (norma de 1933).

El modelo conserva la arquitectura del Gemma 4 12B, con aproximadamente 12.966 millones de parámetros, y se entrenó durante unas 26 horas en 8 GPU NVIDIA H100 mediante el framework Axolotl, con técnicas de eficiencia como sample packing, cut cross-entropy y FSDP versión 2. Es relevante porque demuestra que un ajuste de preentrenamiento continuo accesible (con créditos gratuitos de cómputo) puede especializar un modelo abierto de gama media en una lengua de recursos limitados, algo de interés para comunidades lingüísticas y proyectos de NLP regional.

El modelo está publicado en Hugging Face bajo licencia Apache 2.0, en formato safetensors y compatible con la librería transformers. No se han publicado benchmarks ni evaluaciones formales, por lo que su rendimiento debe validarse de forma independiente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified (transformer, decoder-only; clase de capa `Gemma4UnifiedTextDecoderLayer`) |
| Parametros totales | 12.966.363.184 (~12,97 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (entrenado con `sequence_len: 4096`; la ventana nativa del modelo base no se indica) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16; 26,0 GB en el repositorio) |
| Idiomas soportados | bielorruso (be, especializado); hereda las capacidades multilingües del Gemma 4 12B base (no documentadas aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (26,0 GB), compatible con `transformers` y `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B, un transformer decoder-only de la familia Gemma con arquitectura "Unified" (según la clase de capa usada en el wrap de FSDP, `Gemma4UnifiedTextDecoderLayer`). Los tags indican `image-text-to-text` además de `text-generation`, lo que sugiere que la arquitectura base admite entrada multimodal de imagen y texto, aunque la model card solo documenta uso como modelo de lenguaje de texto.

El entrenamiento fue un continued pretraining (CPT) de una época sobre una mezcla de datos bielorrusa: principalmente scrapes web, con datos educativos y literatura, complementados con Wikipedia (wikimedia/wikipedia) y GlotCC-V1 (corpus web multilingüe de Common Crawl). El dataset personalizado ewxxyyzz/karotkizmest y la mezcla final se pre-tokenizaron fuera de Axolotl (con `<bos>` y `<eos>` por documento, secuencias de hasta 4096 tokens), lo que acelera el pipeline al omitir la tokenización del framework. La configuración de Axolotl 0.19.0 incluye: `sequence_len: 4096`, `sample_packing: true`, learning rate 2e-5 con scheduler coseno (ratio mínimo 0,1), warmup del 3 %, weight decay 0,1, optimizador AdamW fused con beta2 0,95, precisión bf16 y tf32, micro-batch de 2 con 8 pasos de acumulación de gradiente, y clipping de gradiente a 1,0. Se usaron FSDP v2 con activation checkpointing, atención SDPA durante el entrenamiento y cut cross-entropy para reducir el consumo de memoria en la capa de salida. El entrenamiento duró unas 26 horas en 8 H100, con créditos facilitados por lium.io. No consta el número total de tokens procesados ni si hubo RLHF/DPO (no lo hubo; es un CPT puro).

## Capacidades

- Generación de texto en bielorruso, con especialización en el estándar cirílico (norma de 1933); el corpus excluye Lacinka y la ortografía de Taraszkevica.
- Generación de texto general heredada del modelo base Gemma 4 12B (razonamiento, código, matemáticas y otras habilidades del modelo original, presumiblemente parcialmente degradadas por el CPT monolingüe; no hay evaluaciones que lo confirmen).
- Posible capacidad de entrada de imagen-texto (tag `image-text-to-text` en el repositorio), no documentada en la model card.
- No hay constancia de soporte específico de tool calling, function calling ni capacidades de agentes; el modelo es un modelo base especializado, no un modelo instruido (no se ha aplicado fine-tuning de instrucciones ni alineación).
- Ejemplo de uso documentado: generación con muestreo (`do_sample=True`, temperature 0,7, top_p 0,9) mediante transformers.
- Requisito técnico importante: debe usarse atención `eager` en inferencia; con SDPA la salida se corrompe con caracteres `s` espurios.

## Casos de uso

- Generación de contenido en bielorruso: redacción de artículos, entradas de blog o textos divulgativos en bielorruso estándar, donde el modelo aporta fluidez en un idioma con poca cobertura en modelos generalistas.
- Corpus lingüístico y corpus de texto: generación de texto sintético en bielorruso para augmentar datasets de entrenamiento de otros modelos, aprovechando que el modelo ha absorbido scrapes web y literatura del idioma.
- Asistente de escritura y corrección estilística: ayuda a redactar o reformular textos en bielorruso para hablantes no nativos o para medios locales, aunque al ser un modelo base (no instruido) probablemente requiera few-shot prompting.
- Continuación y completado de textos literarios: dado que la mezcla de entrenamiento incluye literatura bielorrusa, puede ser útil para tareas de completado de estilo literario o análisis de estilo.
- Investigación en NLP de lenguas de recursos limitados: base de partida para fine-tunings posteriores (SFT, DPO) sobre bielorruso, o para estudios de continued pretraining en idiomas poco representados.
- Clasificación y extracción de texto en bielorruso mediante prompting few-shot: el modelo puede adaptarse a tareas como clasificación de noticias o extracción de entidades con ejemplos en el prompt, aunque sin garantías documentadas de rendimiento.
- Educación y aprendizaje del idioma: generación de frases de ejemplo y material de lectura en bielorruso estándar para aplicaciones educativas.

## Benchmarks y rendimiento

El autor declaró en la model card una sección de benchmarks pendiente ("um. TODO !!!") y el model-index no contiene resultados. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12,97 B de parámetros en bf16 (26,0 GB de pesos), se necesitan aproximadamente 27-30 GB de VRAM solo para los pesos, más la memoria de KV cache y activaciones. En la práctica, una GPU de 32 GB (por ejemplo V100 32 GB, o A100 parcialmente utilizada) o una de 40/48 GB es lo cómodo.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para inferencia sin fricción; para entornos de menor coste, dos RTX 4090 (24 GB cada una) con paralelismo de tensor o device_map="auto" también servirían.
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) en bf16. Sería necesario cuantizar (por ejemplo, a 4 bits mediante bitsandbytes o GGUF, no publicado oficialmente) para ejecutarlo en hardware de consumo; con cuantización a 4 bits, unos 7-8 GB de pesos cabrían en una RTX 3060 12 GB o superior.
- Opciones de despliegue: transformers (método documentado por el autor, con `attn_implementation="eager"` obligatorio). Al ser compatible con safetensors y endpoints_compatible, debería funcionar también con vLLM, TGI u Ollama si la arquitectura `gemma4_unified` está soportada en la versión de la librería empleada (la model card usa Transformers 5.16.1 y PyTorch 2.12.0+cu130). No hay confirmación oficial de compatibilidad con llama.cpp o GGUF.
- Latencia y throughput: no disponibles (sin datos publicados). Como referencia orientativa, un modelo denso de ~13 B en H100 con bf16 suele alcanzar decenas de tokens por segundo por petición, pero esto no está verificado para este modelo.
- Nota de entrenamiento (referencia): el CPT se ejecutó en 8 H100 durante 26 horas con FSDP v2, activation checkpointing y cut cross-entropy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma principal | Disponibilidad |
|---|---|---|---|---|---|
| Zorka Vieniera 12B | 12,97 B | no disponible | Apache 2.0 | Bielorruso (especializado) | Hugging Face, safetensors |
| google/gemma-4-12B (base) | no disponible en la informacion proporcionada | no disponible | Licencia Gemma (restricciones propias de Google) | Multilingüe | Hugging Face |
| Modelos multilingües generales de tamaño similar (Qwen, Llama de ~12-13 B) | no disponible en la informacion proporcionada | no disponible | Variada | Multilingües, con cobertura limitada de bielorruso | Hugging Face |

Nota: no hay modelos comparables específicos para bielorruso en la informacion proporcionada; la comparación se limita al modelo base y a categorías genéricas. No se pueden comparar benchmarks al no existir evaluaciones publicadas de ninguno de los modelos en esta ficha.

## Limitaciones y advertencias

- Bug de inferencia con SDPA: el autor advierte explícitamente de que usar atención SDPA produce salidas corruptas (caracteres `s` espurios por toda la generación). Es imprescindible usar `attn_implementation="eager"`, lo que reduce el throughput y aumenta el uso de memoria respecto a SDPA o FlashAttention.
- Sin benchmarks ni evaluaciones: no hay datos objetivos de calidad (perplejidad, MMLU, tareas en bielorruso). El rendimiento real es desconocido y debe validarse antes de cualquier uso serio.
- Modelo base, no instruido: al ser un continued pretraining sin SFT ni RLHF/DPO, el modelo probablemente no siga instrucciones de forma fiable; está orientado a continuación de texto y requiere prompting few-shot para tareas dirigidas.
- Posible olvido catastrófico: el CPT monolingüe en bielorruso puede haber degradado las capacidades del modelo base en otros idiomas (incluido el inglés) y en tareas de razonamiento o código. No hay mediciones que cuantifiquen esta degradación.
- Cobertura dialectal y ortográfica limitada: el entrenamiento excluyó Lacinka y la norma de Taraszkevica, por lo que el modelo puede rendir mal con textos en esas variantes.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, y agravado por la ausencia de alineación; no hay mecanismos documentados de mitigación.
- Sesgos: el corpus proviene mayoritariamente de scrapes web, por lo que hereda los sesgos, desinformación y contenido de baja calidad presentes en la web bielorrusa; no se han realizado análisis de sesgo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base (google/gemma-4-12B) está sujeto a la licencia Gemma de Google, cuyos términos pueden imponer restricciones adicionales sobre modelos derivados; conviene revisar la licencia Gemma antes de uso comercial.
- Ventana de contexto: entrenado con secuencias de 4096 tokens; aunque el modelo base pueda soportar más, el comportamiento más allá de 4096 tokens no está verificado.
- Repositorio joven y de bajo uso: 217 descargas y 0 likes en el momento de la ficha, sin comunidad de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ewxxyyzz/zorka-vieniera-12b
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Dataset de entrenamiento del autor: https://huggingface.co/datasets/ewxxyyzz/karotkizmest
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset GlotCC-V1: https://huggingface.co/datasets/cis-lmu/GlotCC-V1
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Patrocinador de cómputo (lium.io): https://lium.io
