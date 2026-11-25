# HexaSpaghetti/Qwen3.8-Flash-Next-heretic-midrefusals

## Resumen
Qwen3.8-Flash-Next-heretic-midrefusals es una variante "decensored" del modelo experimental Qwen3.8-Flash-Next, publicada por el usuario HexaSpaghetti mediante la herramienta Heretic v2.2.0.dev0. Se trata de un modelo multimodal (image-text-to-text) de tipo causal language model con encoder de visión, construido sobre la arquitectura que Qwen ha presentado como base de su futura familia Qwen4. El modelo original combina atención híbrida (Gated DeltaNet y Qwen Sparse Attention), mezcla de expertos con 512 expertos, embeddings de n-gramas y Gated Residual, con un total de 177.392.830.576 parámetros según los pesos en safetensors.

La modificación de Heretic actúa sobre las capas 0 a 37 mediante Arbitrary-Rank Ablation (ARA), reduciendo drásticamente las negativas del modelo: de 99/100 en el original a 10/100 en esta versión, con una divergencia KL de 0.1933 respecto al modelo base. El resultado es un modelo que conserva la arquitectura y capacidades del original pero con un comportamiento mucho más permisivo ante peticiones que el modelo base rechazaría.

Es relevante ahora porque Qwen3.8-Flash-Next es la primera publicación de pesos abiertos bajo la arquitectura experimental de Qwen4, y esta variante permite estudiar el comportamiento del modelo sin las capas de rechazo, algo de interés para investigación en alineación, evaluación de sesgos y análisis de robustez. La licencia qwen-community-1.0 impone restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de visión; atención híbrida Gated DeltaNet + Qwen Sparse Attention, MoE, Gated Residual, N-gram Embedding y MTP |
| Parametros totales | 177.392.830.576 (125B LM + 51B n-gram embedding + 4B MTP, según model card) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura experimental de Qwen3.8-Flash-Next, que reorganiza los componentes clásicos del transformer. El layout es 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), con 48 capas, dimensión oculta de 2560 y vocabulario de 248.320 tokens. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Qwen Sparse Attention usa 24 cabezas de query y 2 de KV con dimensión 256 y un presupuesto de 512 bloques (2048 tokens). La MoE tiene 512 expertos con 10 enrutados más 1 compartido activados por token y dimensión intermedia de 640. Incluye además un embedding de n-gramas de 20 millones de entradas (bigramas/trigramas en la capa 2), Gated Residual con 4 ramas y rango de cuello de botella 320, y una capa MTP entrenada con múltiples pasos.

El entrenamiento original combina pre-entrenamiento y post-entrenamiento con una receta que aplica Muon y AdamW a categorías específicas de pesos, elimina el warmup de batch size y arranca directamente en el tamaño objetivo. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La modificación heretic aplica Arbitrary-Rank Ablation entre las capas 0 y 37 con pesos preserve_good_behavior_weight 0.8234, steer_bad_behavior_weight 0.0088, overcorrect_relative_weight 0.8165 y neighbor_count 4; el proceso es reproducible según el autor.

## Capacidades
- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias al encoder de visión.
- Razonamiento matemático y generación de código, heredados del modelo base.
- Soporte de tool calling y function calling, según las capacidades del modelo original.
- Capacidades agénticas y razonamiento multi-paso, favorecidas por el contexto largo y la atención dispersa.
- Contexto extensible hasta 1.000.000 de tokens (262.144 nativos).
- Comportamiento "decensored": reduce negativas de 99/100 a 10/100 en la evaluación del autor.
- Capacidades multilingües: no disponible el detalle de idiomas soportados.

## Casos de uso
- Investigación en alineación y robustez: comparar las respuestas del modelo original y de esta variante ante el mismo conjunto de prompts permite medir el efecto de la ablación sobre el comportamiento y calibrar técnicas de mitigación.
- Evaluación de sesgos y contenido dañino: al reducirse las negativas, el modelo sirve como banco de pruebas para clasificadores de seguridad y para estudiar qué tipos de peticiones dejan de rechazarse.
- Análisis de divergencia KL en producción: el valor 0.1933 respecto al original permite a equipos de MLOps estimar cuánto se desvía la distribución de salida y diseñar filtros de post-procesado.
- Procesamiento de documentos largos con imagen: la ventana de 262.144 tokens nativos y el encoder de visión permiten resumir informes escaneados o analizar capturas con texto extenso en una sola pasada.
- Generación de código en pipelines internos: el soporte de tool calling y la arquitectura MoE con 6B activos facilitan su integración en entornos de CI/CD donde se prioriza el coste por token sobre la latencia.
- Reproducción de experimentos de ablación: el directorio `reproduce` del repo permite replicar el proceso Heretic y validar resultados en otras variantes del modelo base.
- Asistente conversacional sin filtros para entornos controlados: útil en prototipos de escritura creativa o role-play donde las negativas del modelo base resultan obstructivas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen3.8-Flash-Next) |
|---|---|---|
| Refusals | 10/100 | 99/100 |
| KL divergence | 0.1933 | 0 (por definición) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante ni para el modelo base.

## Requisitos de hardware
- VRAM estimada para inferencia: con 177.392.830.576 parámetros totales, en BF16 se requieren aproximadamente 355 GB de VRAM solo para pesos; en FP8 unos 177 GB; en cuantizaciones de 4 bits se estiman en torno a 90 GB, aunque no se publican GGUF oficiales en el repo.
- GPU recomendadas: para BF16, múltiples H100 80 GB o A100 80 GB (al menos 5-8 GPUs); para FP8, clústeres de 3-4 H100; el modelo no cabe en una sola GPU de 80 GB en precisión completa.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en ninguna precisión razonable sin cuantización agresiva y offloading, lo que degradaría el rendimiento.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed según la model card del modelo base; llama.cpp y Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles; la arquitectura QSA y el MTP están diseñados para reducir latencia en contexto largo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-heretic-midrefusals | 177.392.830.576 | 6B | 262.144 (hasta 1M) | qwen-community-1.0 | Variante decensored, 10/100 refusals |
| Qwen3.8-Flash-Next (original) | 177.392.830.576 | 6B | 262.144 (hasta 1M) | qwen-community-1.0 | Modelo base, 99/100 refusals |
| Qwen3.8-Flash (API) | no disponible | no disponible | 1.000.000 | servicio propietario | Versión de producción vía Qwen Cloud |

No se dispone de datos de benchmarks comparativos con otras familias (Llama, DeepSeek, Mistral) en la información proporcionada.

## Limitaciones y advertencias
- La ablación reduce las negativas de forma drástica (de 99/100 a 10/100), lo que implica que el modelo puede generar contenido dañino, sesgado o inapropiado con mucha mayor facilidad que el original.
- La divergencia KL de 0.1933 indica una desviación no trivial respecto al modelo base; puede afectar a la coherencia, la precisión factual y la calidad en tareas de razonamiento.
- Riesgo elevado de alucinación, especialmente en dominios especializados, agravado por la modificación de las capas 0-37.
- No se detallan los idiomas soportados ni la composición del dataset de entrenamiento original, lo que dificulta evaluar sesgos lingüísticos y culturales.
- La licencia qwen-community-1.0 impone restricciones específicas para uso comercial; es obligatorio revisar el archivo LICENSE antes de desplegar el modelo en producción.
- El modelo es una "experimental preview" de la arquitectura Qwen4; su estabilidad y soporte a largo plazo no están garantizados.
- No se publican cuantizaciones GGUF ni versiones optimizadas para hardware de consumo, lo que limita su despliegue fuera de clústeres.
- El uso de esta variante en aplicaciones orientadas al público requiere filtros de seguridad adicionales y supervisión humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-heretic-midrefusals
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Heretic: https://heretic-project.org
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio de reproducción: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-heretic-midrefusals/tree/main/reproduce
