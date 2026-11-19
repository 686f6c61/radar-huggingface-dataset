# r-three-moto/moto-1b-16k-v2

## Resumen

MoTo 1B (16K v2) es un modelo de lenguaje de tipo decoder estilo Llama, desarrollado por el equipo r-three-moto, que se entrena desde cero sobre 21 idiomas utilizando una innovación de tokenización: en lugar de un único tokenizador multilingüe, emplea 21 tokenizadores BPE independientes (uno por idioma) fusionados en un vocabulario superset que indexa una única tabla de embeddings compartida. El modelo tiene 2.288.756.736 parámetros totales (1.28B no-embedding), 25 capas, dimensión de modelo 2048 y 16 cabezas de atención, con embeddings de entrada y salida no atados.

La relevancia del modelo es fundamentalmente metodológica: forma parte de una release controlada (MoTo) que incluye también baselines con tokenizador monolítico entrenados sobre los mismos datos de 21 idiomas, lo que permite aislar el efecto de la tokenización en el rendimiento multilingüe. El enrutamiento por idioma es oráculo durante el entrenamiento e inferencia.

Es un modelo base, sin instruction tuning ni ajuste de seguridad, con una longitud de contexto de 4096 tokens. Está pensado para investigación y experimentación sobre tokenización multilingüe, no para despliegue en producción directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados |
| Parametros totales | 2.288.756.736 (2.29B); 1.28B no-embedding |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 21: en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi (mapeados a 21 tokenizadores BPE por idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder densa de estilo Llama con 25 capas, dimensión de modelo 2048 y 16 cabezas de atención. La innovación principal reside en la tokenización: cada documento de entrenamiento se codifica con el tokenizador BPE de su idioma, y los 21 tokenizadores se fusionan en un vocabulario superset de 245.153 entradas que indexa una única tabla de embeddings compartida. El resto de la arquitectura permanece inalterado respecto a un modelo monolítico equivalente. El enrutamiento por idioma es oráculo tanto en entrenamiento como en inferencia.

El entrenamiento se realizó desde cero durante 100.000 pasos con 1.05M tokens por paso, aproximadamente 104.86B tokens en total, con una configuración de 4 secuencias de 4096 tokens por GPU, 8 GPUs y 8 pasos de acumulación. Los datos provienen de FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (20 idiomas adicionales), con pesos exactos documentados en `training/config.yaml`. Los tokenizadores por idioma proceden de la familia `flexitok/bpe_ltr_<lang>_16000_v2`. No se menciona RLHF ni DPO; es un modelo base sin instruction tuning ni safety tuning.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas, incluyendo lenguas con alfabetos latino, árabe, cirílico, griego y hanzi.
- Tokenización multilingüe selectiva por idioma mediante `set_language()` y mapeo configurable para lenguas o tareas no cubiertas (`set_mapping`).
- Decodificación de ids provenientes de cualquier tokenizador del superset, lo que permite decodificar generaciones que derivan hacia otro vocabulario.
- Modelo base apto para fine-tuning supervisado y experimentación sobre tokenización.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas a los 21 idiomas de entrenamiento; sin cobertura declarada para otros.

## Casos de uso

- Investigación sobre tokenización multilingüe: el modelo permite comparar directamente el efecto de tokenizadores por idioma frente a un tokenizador monolítico, ya que la release incluye baselines entrenados sobre los mismos datos y con la misma arquitectura.
- Fine-tuning supervisado para tareas de generación en idiomas de bajos recursos relativos: al tener tokenizadores dedicados para lenguas como húngaro, checo, danés o finés, se reduce la fragmentación de tokens y se aprovecha mejor el contexto de 4096 tokens.
- Evaluación de eficiencia de vocabulario: útil para medir el impacto de la tokenización en el número de tokens por documento y en el coste de entrenamiento e inferencia por idioma.
- Generación de texto base para pipelines de investigación en PLN multilingüe, como experimentos de perplejidad o de alineación entre lenguas.
- Prototipado de sistemas de traducción o paráfrasis mediante fine-tuning, aprovechando la tabla de embeddings compartida entre los 21 tokenizadores.
- Estudio de deriva lingüística en generación: la decodificación acepta ids de cualquier tokenizador, lo que facilita analizar cuándo una generación cambia de idioma.
- Base para experimentos de destilación o de adaptación de dominio con presupuesto de cómputo moderado, dado su tamaño de 2.29B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4.6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 6 y 8 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2.3 GB de pesos; en 4 bits, alrededor de 1.2 GB (las cuantizaciones no están publicadas oficialmente y requerirían conversión propia).
- GPU recomendadas: A100, H100 o L40S para entrenamiento y fine-tuning; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16.
- Cabe en GPUs de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores en bf16; en GPUs de 8 GB requiere cuantización.
- Opciones de despliegue: transformers (con `trust_remote_code=True` para el tokenizador combinado), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se distribuyen pesos GGUF oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B 16K v2 | 2.29B (1.28B no-embedding) | 4096 | 21 tokenizadores BPE + superset de 245.153 | MIT | Hugging Face |
| Baselines monolíticos de la release MoTo | Mismo tamano y datos (segun model card) | 4096 | Tokenizador unico | No disponible en la informacion | Hugging Face (r3-moto) |
| Llama 3.2 1B | 1.24B | 128K | Tokenizador BPE unico (128K) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5 1.5B | 1.54B | 32K | Tokenizador BPE unico (~151K) | Apache 2.0 | Hugging Face |

La comparación con Llama 3.2 1B y Qwen2.5 1.5B es orientativa por tamaño, no por rendimiento: no se han publicado benchmarks de MoTo 1B en la información disponible. La comparación metodológicamente relevante es con los baselines monolíticos de la propia release MoTo.

## Limitaciones y advertencias

- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni está alineado para conversación.
- Sin safety tuning: puede generar contenido sesgado, tóxico o inapropiado; no apto para producción sin filtros y evaluación adicional.
- Enrutamiento oráculo por idioma: requiere conocer el idioma de la entrada y seleccionar el tokenizador correcto; un enrutamiento incorrecto degrada el rendimiento.
- Contexto limitado a 4096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Cobertura lingüística restringida a 21 idiomas; no se declara soporte para otras lenguas.
- Riesgo de alucinación inherente a un modelo base de 2.29B parámetros entrenado sobre ~105B tokens.
- Licencia MIT: permite uso comercial, pero el modelo no incluye garantías ni evaluación de seguridad.
- El uso del tokenizador combinado requiere `trust_remote_code=True`; existe una ruta alternativa sin código remoto documentada en la model card.
- No se distribuyen pesos cuantizados oficiales; cualquier cuantización debe generarse y validarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-16k-v2
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Código: https://github.com/r-three/moto
- Colección de modelos MoTo: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizadores flexitok (ejemplo): https://huggingface.co/flexitok/bpe_ltr_fra_Latn_16000_v2
