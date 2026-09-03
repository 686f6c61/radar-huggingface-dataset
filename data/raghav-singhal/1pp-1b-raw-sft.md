# Raghav-Singhal/1pp-1b-raw-sft

## Resumen

El modelo `1pp-1b-raw-sft` es un artefacto de investigación del proyecto One Persona Pretraining (1PP) desarrollado por Raghav-Singhal en el EPFL DLAB. Forma parte de un estudio 3×3 que compara tres tamaños (0,5B, 1B y 1,7B) y tres condiciones de pretraining sobre el mismo conjunto de 47,8 millones de documentos: documentos originales, conversaciones reescritas con pérdida solo en turnos de asistente, y conversaciones reescritas con pérdida en turnos de usuario y asistente. Este modelo concreto corresponde a la condición de pretraining con documentos originales (raw baseline) seguida de un ajuste fino supervisado (SFT).

Con 0,98 mil millones de parámetros y una arquitectura estilo Llama de 24 capas, el modelo está diseñado para generar texto conversacional en inglés siguiendo el formato ChatML sin turno de sistema. Su relevancia radica en que permite aislar el efecto del formato de los datos de pretraining sobre las capacidades conversacionales posteriores, manteniendo idénticas la secuencia de lotes y el resto de hiperparámetros entre condiciones. No es un asistente de propósito general, sino una herramienta para estudiar el impacto del pretraining en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1536, FFN 6144 SwiGLU, 12 heads / 4 KV heads, head dim 128, RMSNorm, RoPE base 10000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (no se han publicado cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), normalización RMSNorm, embeddings posicionales rotatorios (RoPE) con base 10.000, embeddings no atados y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más el token especial `<|pad|>`; el token `<|endoftext|>` marca el fin de documento.

El pretraining se realizó sobre los documentos originales de DCLM-edu (raw baseline), con pérdida en todos los tokens del documento y en `<|endoftext|>`. Se procesó una pasada sobre 47,8 millones de documentos (66,2 mil millones de tokens), con 31.777 pasos, batch global de 512×4.096 tokens, enmascaramiento de atención entre documentos y best-fit packing con asignación de documentos alineada por pasos. El optimizador fue Muon (con shape scaling y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

El ajuste fino supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones procedentes de tres datasets: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en el pretraining (Megatron, Muon, ChatML sin turno de sistema) con pérdida solo en turnos de asistente. La LR de matriz 0,002 se seleccionó por pérdida en validación entre {0,0005, 0,001, 0,002, 0,005}; batch global 128×4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés siguiendo el formato ChatML sin turno de sistema.
- Manejo de conversaciones multi-turno gracias a su ventana de contexto de 4.096 tokens.
- Capacidad de seguir instrucciones básicas en inglés tras el SFT, aunque limitada por su tamaño y naturaleza experimental.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión, audio u otras modalidades.
- El modelo está pensado para investigación; no es un asistente de propósito general.

## Casos de uso

- Investigación en IA: analizar cómo el pretraining con documentos originales afecta a la capacidad conversacional del modelo en comparación con las otras condiciones del estudio 1PP (conversaciones reescritas con distintas máscaras de pérdida).
- Estudio de sesgos y alucinaciones: al ser un modelo pequeño entrenado sobre DCLM-edu, sirve para examinar qué tipo de información factual retiene y cómo se manifiestan los errores en tareas conversacionales.
- Fine-tuning adicional: puede usarse como punto de partida para experimentos de SFT con otros datasets, dado que su licencia Apache-2.0 permite modificaciones y redistribución.
- Comparación de arquitecturas: su estructura Llama estándar facilita la comparación con otros modelos de ~1B en entornos de investigación controlados.
- Evaluación de métricas de validación: las pérdidas reportadas (asistente, usuario, documento) permiten calibrar la calidad del ajuste en diferentes condiciones de entrenamiento.
- Prototipado de sistemas de chat en inglés en entornos académicos, siempre que se asuma su naturaleza experimental y sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas de validación internas:

| Métrica | Valor |
|---|---|
| Pérdida de validación (pretraining, token de asistente) | 2,574 |
| Pérdida de validación (pretraining, token de usuario) | 2,620 |
| Pérdida de validación (pretraining, token de documento) | 2,458 |
| Pérdida SFT en validación (tokens de asistente, 1.998 conversaciones) | 2,006 |
| Diferencia absoluta entre pesos HF y checkpoint Megatron | 0,0000 |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Basándose en el tamaño del modelo (0,98B parámetros) y su arquitectura estándar, se estima:

- VRAM para inferencia en FP16: aproximadamente 2 GB (solo pesos) más overhead de activaciones y KV cache; con contexto 4.096, se recomiendan al menos 4 GB de VRAM para uso cómodo.
- Con cuantización int8 (si se generara), la VRAM bajaría a ~1 GB; en int4, ~0,5 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, por ejemplo NVIDIA RTX 3050, RTX 3060, GTX 1660 Super, o superiores (A100, H100 para despliegue a mayor escala).
- Es posible ejecutarlo en CPU con herramientas como llama.cpp si se convierte a GGUF, aunque la latencia sería mayor.
- Opciones de despliegue probables (dado que es una arquitectura Llama estándar): vLLM, Text Generation Inference (TGI), llama.cpp, Ollama. No se ha verificado su compatibilidad oficial.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar (por ejemplo, SmolLM2-1.7B, Qwen2.5-0.5B, Llama-3.2-1B) en la información proporcionada. No se han reportado resultados de benchmarks que permitan una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente de propósito general; el propio autor lo califica como "research artifact".
- Entrenado únicamente en inglés; no soporta otros idiomas.
- No se ha entrenado con turno de sistema; usar uno puede degradar el rendimiento.
- Riesgo de alucinaciones y errores factuales, especialmente en temas especializados, debido a su pequeño tamaño y a la naturaleza de los datos de entrenamiento.
- Posibles sesgos derivados de los datos DCLM-edu y de las conversaciones de SFT (no se han auditado).
- No se han publicado cuantizaciones oficiales ni resultados de benchmarks estándar, lo que dificulta evaluar su rendimiento relativo.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo experimental, no se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-raw-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
