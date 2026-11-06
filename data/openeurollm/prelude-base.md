# openeurollm/prelude-base

## Resumen

OpenEuroLLM Prelude-base es un modelo de lenguaje de 9.095 millones de parámetros (~9,1 B) de tipo denso, decoder-only y autorregresivo, desarrollado por el consorcio OpenEuroLLM. Se trata de un artefacto de investigación en fase de entrenamiento (work in progress): el repositorio publica checkpoints intermedios del entrenamiento que se está ejecutando en el supercomputador Leonardo (CINECA), no un modelo final. Su objetivo es servir de base ("prelude") para la familia de modelos abiertos europeos multilingües, con especial énfasis en las 36 lenguas objetivo iniciales del proyecto.

La arquitectura sigue de cerca la de Qwen3: 36 capas, tamaño oculto de 4096, FFN densa de 12288, 32 cabezas de atención con GQA de 8 grupos KV, RoPE con base 100000, RMSNorm con QK-norm, activación SwiGLU y embeddings de entrada/salida no atados. El entrenamiento planificado abarca 10 billones de tokens, con aproximadamente un 80 % de inglés, código y matemáticas y un 20 % multilingüe repartido entre las lenguas europeas objetivo.

Es relevante ahora porque ofrece pesos abiertos con licencia Apache 2.0 para un modelo base multilingüe europeo entrenado desde cero, algo poco habitual en un ecosistema dominado por modelos centrados en inglés y chino. No obstante, al no haber completado la fase de cooldown del schedule WSD, sus checkpoints actuales no deben tratarse como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, autorregresivo, estilo Qwen3 |
| Parámetros totales | 9.094.607.872 (~9,095 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | 36 lenguas objetivo (41 códigos de lengua/escritura en la mezcla de datos): en, es, ka, fr, de, pt, it, pl, el, nl, tr, ro, hu, uk, cs, sv, bg, fi, ca, hr, sk, da, lt, bs, sl, nb, sr, sq, lv, lvs, mk, is, mt, gl, eu, ekk, et, ga, als, nn, ltg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, shards de 5 GB) + config.json y tokenizer |

Detalles adicionales de arquitectura: 36 capas, hidden size 4096, FFN 12288, 32 cabezas de atención, 8 grupos KV (GQA), dimensión de cabeza 128, RoPE base 100000, RMSNorm con eps 1e-5 y QK-norm, SwiGLU, vocabulario de 262.145 tokens (tokenizer de 256k, ampliado a 262.272 por eficiencia de tensor parallelism). Embeddings de entrada y `lm_head` no atados (1.074.266.112 parámetros cada uno). 399 tensores en total, todos en BF16, ~18,19 GB de pesos.

## Arquitectura y entrenamiento

El modelo es un Transformer denso decoder-only que replica fielmente la configuración de Qwen3, con atención de consultas agrupadas (GQA) de 8 grupos KV para reducir el coste de memoria de la caché KV, normalización RMSNorm con QK-norm para estabilizar el entrenamiento, RoPE con base 100000 y activación SwiGLU en la FFN. Los embeddings de entrada y la cabeza de salida están desacoplados, lo que suma ~2,15 B de parámetros en las dos matrices de vocabulario.

El entrenamiento se realiza sobre 10 billones de tokens con una mezcla aproximada del 80 % en inglés, código y matemáticas, y un 20 % multilingüe repartido entre 36 lenguas europeas (41 códigos de lengua/escritura, ya que algunas lenguas se dividen en macrolengua y variante específica, como letón/letón estándar/latgaliano, estonio/estonio estándar, albanés/albanés tosco o noruego bokmål/nynorsk). El schedule de learning rate es WSD (warmup-stable-decay); los checkpoints publicados corresponden a la fase estable (LR máxima constante) y no han pasado por el cooldown, que solo se reflejaría a partir de la iteración ~953.600. El modelo se entrenó sin token `<bos>`: los documentos se empaquetan consecutivamente y cada uno termina en `<eos>`, por lo que los tokenizers de las ramas tienen `add_bos_token: false`.

Los checkpoints se publican como ramas por iteración de Megatron (por ejemplo, `iter_0124800`), cada una autocontenida con configuración, pesos shardeados, tokenizer y un `validation.json` con generaciones de comprobación. La rama `main` está vacía a propósito y se reserva para el checkpoint final.

## Capacidades

- Generación de texto autoregresiva en 36 lenguas europeas, incluidas lenguas de recursos medios y bajos (euskera, gaélico, galés, letón, latgaliano, maltés, islandés, etc.).
- Modelo base: no está afinado para instrucciones ni para diálogo; su uso previsto es como punto de partida para fine-tuning (SFT, RLHF/DPO) y para investigación.
- Capacidad de completar texto y frases en contexto (verificado mediante el battery de sanity-check con 144 generaciones en 36 lenguas).
- No se documenta soporte nativo de tool calling, function calling, agentes ni razonamiento multi-paso; al ser un base model sin post-entrenamiento, estas capacidades no están garantizadas.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Cobertura de código y matemáticas en la mezcla de entrenamiento (~parte del 80 % inglés+código+mates), aunque sin benchmarks publicados que lo cuantifiquen.

## Casos de uso

- Investigación en multilingüismo europeo: servir de base para estudiar transferencia entre lenguas emparentadas y de recursos bajos (por ejemplo, esloveno/croata/serbio o danés/sueco/noruego) gracias a un vocabulario de 256k tokens compartido y una mezcla con 41 códigos de lengua/escritura.
- Fine-tuning supervisado para asistentes en lenguas minoritarias: partir de los checkpoints publicados y aplicar SFT con datos nativos de euskera, gaélico o maltés para tareas de generación y resumen, aprovechando que el modelo ya ha visto esas lenguas durante el preentrenamiento.
- Evaluación comparativa de tokenizers multilingües: analizar la eficiencia de compresión del tokenizer de 262.145 tokens frente a tokenizers centrados en inglés en las 36 lenguas objetivo.
- Desarrollo de modelos de dominio especializado: continuar el preentrenamiento con corpus jurídicos o administrativos de la UE en varias lenguas y evaluar la degradación por lengua.
- Generación de texto asistida en contextos de 4096 tokens: completado de documentos, resúmenes de actas o correspondencia multilingüe en prototipos de investigación, asumiendo la necesidad de validación humana por ser un checkpoint no cooldown.
- Estudio de dinámicas de entrenamiento: los checkpoints por iteración y el `validation.json` asociado permiten trazar la evolución de la coherencia por lengua a lo largo del entrenamiento, útil para investigar curvas de aprendizaje multilingües.
- Base para experimentos de alineación: aplicar DPO o RLHF sobre el checkpoint final (cuando se publique) y medir el impacto en lenguas de bajos recursos frente a inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~18,2 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda ≥24 GB para contexto corto y ≥40 GB para contexto completo de 4096 tokens con batch pequeño.
- VRAM estimada en cuantización de 8 bits: ~9-10 GB de pesos; en 4 bits: ~5-6 GB de pesos (no se documentan cuantizaciones oficiales; serían conversiones de la comunidad).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 con contexto completo; RTX 4090 24 GB para bf16 con contexto reducido o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con bf16 y contexto moderado, o en GPUs de 16 GB con cuantización de 8 bits; en 12 GB solo con cuantización de 4 bits y contexto limitado.
- Opciones de despliegue: `transformers` (carga por `revision` con `device_map="auto"`), vLLM y TGI para serving de alto rendimiento, llama.cpp/Ollama si se generan conversiones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| OpenEuroLLM Prelude-base | ~9,1 B (denso) | 4096 | 36 lenguas europeas | Apache 2.0 | Checkpoints intermedios (WIP) |
| Qwen3 (variante densa ~8-9 B) | ~8-9 B (denso) | No disponible en esta ficha | Principalmente en/zh + multilingüe | Apache 2.0 (según variante) | Modelo final publicado |
| Gemma 2 9B | ~9 B (denso) | No disponible en esta ficha | Multilingüe (principalmente en) | Términos Gemma | Modelo final publicado |
| Llama 3.1 8B | ~8 B (denso) | 128k | Multilingüe (8 lenguas oficiales) | Llama Community License | Modelo final publicado |

La comparación con Qwen3 es la más directa por arquitectura (Prelude-base replica su configuración), pero conviene señalar que los checkpoints de Prelude-base no han pasado por cooldown ni post-entrenamiento, por lo que no son directamente comparables en calidad de generación con modelos finales.

## Limitaciones y advertencias

- Artefacto de investigación en progreso: los checkpoints publicados son de la fase estable del schedule WSD y no han pasado por cooldown; la calidad de generación es sustancialmente inferior a la de un modelo final.
- Modelo base sin post-entrenamiento: no sigue instrucciones, no está alineado y puede producir contenido incoherente, repetitivo o inapropiado.
- Riesgo de alucinación elevado por el estado temprano del entrenamiento y la ausencia de RLHF/DPO.
- Contexto limitado a 4096 tokens, muy por debajo de los estándares actuales de 32k-128k en modelos comparables.
- Cobertura desigual entre lenguas: la mezcla dedica ~80 % a inglés/código/mates y ~20 % a 36 lenguas, por lo que las lenguas de recursos bajos (latgaliano, gaélico, maltés, islandés) tendrán mucha menos exposición y peor calidad.
- Sin token `<bos>`: los tokenizers no añaden `<bos>`; copias descargadas antes del 2 de noviembre de 2026 sí lo añaden y requieren `add_special_tokens=False`.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de checkpoints intermedios no se recomienda su despliegue en producción sin validación exhaustiva y sin un checkpoint final cooldown.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; se desconoce el comportamiento en dominios sensibles.
- No hay cuantizaciones oficiales publicadas; cualquier GGUF o AWQ sería una conversión de la comunidad sin garantías.
- Tamaño del repositorio de ~19 TB por la acumulación de ramas de checkpoints; la descarga debe hacerse por rama específica, no del repo completo.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/prelude-base
- Progress tracker de OpenEuroLLM: https://huggingface.co/spaces/openeurollm/oellm_progress
- Repositorio de recolección de datos de entrenamiento: https://github.com/OpenEuroLLM/training-data-collection/blob/main/baby/README.md
- Configuración del experimento `baby_9b_dense`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/experiments/baby/baby_9b_dense.yaml
- Configuración de arquitectura `qwen3_dense_9b.yaml`: https://github.com/OpenEuroLLM/oellm-autoexp/blob/prod/baby_9b_dense/config/backend/megatron/baby/models/qwen3_dense_9b.yaml
