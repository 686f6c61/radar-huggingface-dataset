# hossain0909/Keural-Cortex-8B-pilot

## Resumen

Keural Cortex 8B — pilot run es un artefacto de investigación publicado por MKD Co., Ltd. (cuenta de Hugging Face `hossain0909`) que consiste en un continued pretraining (CPT) del modelo base Qwen3-8B-Base de Alibaba Cloud. No es un modelo de producto ni un modelo afinado para instrucciones: es una validación de receta de entrenamiento ejecutada durante 954 pasos sobre 3.000 millones de tokens, con el objetivo de comprobar si el pipeline de CPT mejora el coreano sin degradar el inglés antes de comprometer aproximadamente 19 días de GPU en la ejecución completa de 41.000 millones de tokens.

El modelo parte de la arquitectura transformer densa de Qwen3-8B-Base, con 2.047.683.840 parámetros reales en safetensors, contexto nativo de 32.768 tokens y licencia Apache 2.0 heredada. El entrenamiento se realizó con 4 GPU H200 en FSDP full shard, precisión bf16 para parámetros y reducción de gradientes en fp32, con un pico de learning rate de 1.0e-5 bajo un scheduler WSD y flash_attention_2.

Su relevancia es metodológica más que de capacidad: documenta de forma transparente el resultado de una puerta de validación (gate) con benchmarks coreanos e ingleses, incluyendo las advertencias del propio autor sobre qué demuestra y qué no demuestra el experimento. Está pensado exclusivamente como referencia de reproducibilidad y ablación interna, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B-Base) |
| Parametros totales | 2.047.683.840 (según safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (nativo, sin cambios respecto al base) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ mediante herramientas estándar) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B-Base sin modificaciones estructurales: un transformer denso de aproximadamente 8.000 millones de parámetros nominales (2.047.683.840 reales reportados en el repo) con atención estándar y contexto nativo de 32.768 tokens. El CPT no introduce cambios de arquitectura, ni modo thinking, ni plantilla de chat funcional; el `chat_template.jinja` presente se hereda del tokenizer base y no implica ajuste conversacional.

El entrenamiento consistió en 954 pasos con longitud de secuencia 4.096, batch global de 3.145.728 tokens por paso (3.000 millones de tokens totales), sobre un manifiesto de 19 fuentes y 38.780 millones de tokens que mezcla coreano, inglés, código y ciencia/matemáticas, muestreado proporcionalmente por peso. Se usó AdamW con β=(0.9, 0.95), ε=1e-8, weight decay 0.1 y grad clip 1.0; el scheduler WSD aplicó 2% de warmup, 88% de fase estable y 10% de decaimiento con ratio mínimo 0.1. El pico de LR de 1.0e-5 se eligió deliberadamente frente a un LR de preentrenamiento (3e-4) para priorizar la retención de capacidades sobre la velocidad de adquisición de coreano. La pérdida final se situó en el rango aproximado de 1.82–1.94.

## Capacidades

- Generación de texto por continuación: al ser un modelo base, predice el siguiente token y no responde a instrucciones.
- Comprensión lectora y conocimiento en inglés y coreano, evaluada con lm-evaluation-harness sobre benchmarks como MMLU, ARC-Challenge, HellaSwag, WinoGrande, KMMLU, HaeRae y KoBEST.
- Razonamiento de sentido común y clasificación binaria en coreano (KoBEST BoolQ, COPA, HellaSwag, SentiNeg).
- Razonamiento matemático básico evaluado con GSM8K (resultados no comparables entre base y piloto por diferencia de subconjuntos).
- Capacidades multilingües limitadas a coreano e inglés según la model card; no se declaran otros idiomas.
- Sin soporte de tool calling, function calling, agentes ni multi-step reasoning.
- Sin modo thinking, sin visión, sin audio y sin formato de chat funcional.

## Casos de uso

- Referencia de reproducibilidad de CPT: sirve para replicar la receta (LR 1e-5, WSD, manifiesto de 19 fuentes) y verificar que el pipeline de entrenamiento converge sin dañar el modelo base, gracias a los 954 pasos documentados y a la comparación like-for-like con Qwen3-8B-Base.
- Ablación de mezcla de dominios: permite estudiar cómo afecta la proporción de coreano, inglés, código y ciencia/matemáticas a los benchmarks coreanos e ingleses con un coste de aproximadamente un día de GPU en 4× H200.
- Validación previa a runs largos: se usa como gate antes de lanzar entrenamientos de 41.000 millones de tokens, comprobando que el inglés se mantiene dentro de la tolerancia de −0.5 puntos antes de comprometer 19 días de GPU.
- Investigación sobre calibración en tareas binarias: el salto de +5.91 en KoBEST BoolQ, junto con regresiones en COPA y SentiNeg, lo convierte en un caso de estudio para distinguir ganancia de conocimiento frente a desplazamiento de calibración.
- Estudio de retención de capacidades en modelos convergidos: el diseño con LR bajo y evaluación dual coreano/inglés permite analizar el olvido catastrófico en CPT sobre modelos ya entrenados.
- Base para experimentos académicos de decontaminación: al no haberse ejecutado la comprobación de solapamiento n-gram con MMLU, GSM8K, KMMLU, HaeRae y KoBEST, el checkpoint sirve como material para estudiar metodologías de decontaminación de benchmarks.
- Punto de partida para futuros afinados: al ser un modelo base con licencia Apache 2.0, puede servir como inicialización para SFT o DPO en investigación sobre coreano, aunque el autor no lo recomienda para producción.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness, comparando el piloto (954 pasos, 3B tokens) contra Qwen3-8B-Base bajo ajustes idénticos.

Coreano:

| Benchmark | Qwen3-8B-Base | Pilot | Δ |
|---|---|---|---|
| KMMLU | 53.91 | 53.94 | +0.03 |
| HaeRae | 63.06 | 63.15 | +0.09 |
| KoBEST BoolQ | 57.05 | 62.96 | +5.91 |
| KoBEST COPA | 72.30 | 70.40 | −1.90 |
| KoBEST HellaSwag | 47.20 | 47.60 | +0.40 |
| KoBEST SentiNeg | 83.88 | 82.62 | −1.26 |
| Media | — | — | +0.55 |

Inglés:

| Benchmark | Qwen3-8B-Base | Pilot | Δ |
|---|---|---|---|
| MMLU | 74.70 | 74.24 | −0.46 |
| ARC-Challenge (acc_norm) | 57.25 | 59.30 | +2.05 |
| HellaSwag (acc_norm) | 78.59 | 78.38 | −0.21 |
| WinoGrande | 72.38 | 73.48 | +1.10 |
| Media | — | — | +0.62 |

GSM8K: base evaluado sobre las 1.319 muestras completas (84.69 strict-match) y piloto sobre un subconjunto de 300 muestras (85.33); el autor advierte explícitamente que la diferencia no es comparable y no debe interpretarse como delta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (2.047.683.840 parámetros × 2 bytes), más overhead de activaciones y KV cache; el repo ocupa 16,4 GB.
- En cuantización de 8 bits: aproximadamente 8 GB de pesos; en 4 bits: aproximadamente 4 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas para entrenamiento: 4× H200 en FSDP full shard, tal como se usó en el piloto.
- GPU para inferencia: una RTX 4090 (24 GB) permite cargar el modelo en bf16 con margen limitado para contexto corto; en cuantización de 8 o 4 bits cabe en GPUs consumer de 12–16 GB.
- Opciones de despliegue: transformers con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); conversión a GGUF para llama.cpp u Ollama es viable pero no está publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Keural-Cortex-8B-pilot | 2.047.683.840 | 32.768 | ko, en | Apache 2.0 | Artefacto de investigación (21 descargas) |
| Qwen/Qwen3-8B-Base | no disponible en la información | 32.768 | no disponible en la información | Apache 2.0 | Modelo base público de Alibaba Cloud |
| Qwen3-8B (versión instruct) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | No evaluado en esta ficha |

La comparación directa con alternativas de la misma categoría (CPT de modelos base para coreano) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no tiene formato de chat funcional, no soporta tool calling ni modo thinking, y tiende a divagar o repetir texto.
- El propio autor lo declara «validation artifact, not a product» y lo restringe a investigación interna, reproducibilidad y ablación; no debe usarse en producción ni en despliegues públicos.
- La ganancia en coreano está sobreestimada por la media: KMMLU (+0.03) y HaeRae (+0.09) están planos, y el +0.55 de media lo arrastra una única tarea binaria (KoBEST BoolQ, +5.91), compatible con un desplazamiento de calibración más que con conocimiento adquirido; dos tareas KoBEST retrocedieron.
- La decontaminación de benchmarks no se ha ejecutado: no hay comprobación de solapamiento n-gram con MMLU, GSM8K, KMMLU, HaeRae, KoBEST y otros, por lo que los números son internos y no publicables.
- GSM8K no es comparable entre base y piloto por diferencia de subconjuntos (1.319 frente a 300 muestras).
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada; al ser un modelo base sin alineación, la generación libre puede producir contenido incorrecto o sesgado.
- Cobertura lingüística limitada a coreano e inglés; no se declaran otros idiomas.
- Licencia Apache 2.0, que permite uso comercial del derivado, pero el autor desaconseja explícitamente ese uso y no respalda ninguna afirmación de capacidad.
- Es un run separado del CPT principal (pasos 5000 y 13034), no un checkpoint temprano del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-pilot
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
