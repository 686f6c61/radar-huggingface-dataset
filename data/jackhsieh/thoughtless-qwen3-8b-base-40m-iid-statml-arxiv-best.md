# JackHsieh/Thoughtless.Qwen3-8B-Base.40M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-8B-Base.40M-iid.statML-arxiv.best es un modelo de lenguaje derivado de Qwen/Qwen3-8B-Base mediante entrenamiento continuado (continued pretraining) con predicción simple del siguiente token, sin modo de razonamiento ni tokens de pensamiento (de ahí el calificativo "thoughtless"). Lo desarrolla el usuario JackHsieh y se publica bajo licencia Apache 2.0. El modelo conserva la arquitectura y el tamaño del Qwen3-8B-Base original, con 8.190.735.360 parámetros, pero sus pesos han sido ajustados sobre un subconjunto específico de datos.

El objetivo del modelo es especializar el base de Qwen3-8B en un dominio concreto: un corpus de artículos de estadística y machine learning procedentes de arXiv, con ventanas independientes e idénticamente distribuidas (i.i.d.) de 4096 tokens. Se trata de un experimento de investigación sobre aprendizaje continuado con replay de datos (0,25 de DCLM) y barrido de tasas de aprendizaje, no de un modelo orientado a producción general.

Su relevancia es acotada: es la mejor celda de un sweep de hiperparámetros seleccionada por pérdida de validación final (1,19870 nats/token sobre el split de test de 20M de tokens). Resulta útil para quien investigue dinámicas de continued pretraining, olvido catastrófico y mezcla de datos, pero no es un modelo conversacional ni está alineado con instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con documentos de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (copia maestra fp32, exportada sin casting) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B-Base, un transformer decoder-only de 8.190.735.360 parámetros. No se ha modificado la topología del modelo base; el trabajo consiste en un continued pretraining con predicción simple del siguiente token, sin objetivos auxiliares de razonamiento ni tokens de pensamiento ("thoughtless"). El entrenamiento se realizó sobre la ventana i.i.d. de 40M de tokens de `JackHsieh/statML-arxiv-iid-160M-20M` (concretamente `train[:9728]`, documentos de 4096 tokens), con un 0,25 de replay procedente de `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenación del orden principal en cada época.

La optimización empleó AdamW con tasa de aprendizaje 3e-06 (betas 0,9/0,95, eps 1e-08, weight decay 0,01), schedule coseno con 5% de warmup hasta 0, grad clipping de 1,0, batch de 32 documentos, 2 épocas (812 pasos) y semilla 0. El sistema de entrenamiento fue FSDP2 con full-shard, pesos maestros en fp32, cómputo en bf16, flash-attention-2 y 8 GPU H100. Los pesos publicados son la copia maestra en fp32 exportada sin casting. La pérdida de validación final sobre el split de test de 20M de tokens fue de 1,19870 nats/token (la celda del sweep marcó 1,19866).

## Capacidades

- Generación de texto autoregresiva con predicción simple del siguiente token, sin modo de razonamiento ni tokens de pensamiento.
- Modelado de lenguaje en el dominio de artículos de estadística y machine learning de arXiv, tras el continued pretraining.
- Capacidades heredadas del Qwen3-8B-Base subyacente (generación, código, matemáticas, multilingüismo), aunque no se documenta su preservación tras el ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades especiales (visión, audio, thinking mode).
- No se documenta el conjunto de idiomas soportados.

## Casos de uso

- Investigación sobre continued pretraining: el modelo sirve como punto de referencia para estudiar dinámicas de ajuste continuado con replay y barridos de tasa de aprendizaje sobre un corpus i.i.d. controlado.
- Estudio de olvido catastrófico: permite comparar la pérdida en el dominio objetivo (statML-arxiv) frente a la del modelo base y cuantificar la degradación en capacidades generales.
- Modelado de lenguaje especializado en literatura estadística: puede emplearse como base para tareas de continuación de texto o scoring de perplejidad sobre abstracts y artículos de arXiv en estadística y ML.
- Evaluación de mezclas de datos: la configuración con 0,25 de replay de DCLM permite analizar el efecto de la proporción de datos generales en el ajuste de dominio.
- Reproducción de experimentos: los hiperparámetros, la semilla y el enlace a wandb permiten replicar el entrenamiento y validar resultados.
- Punto de partida para fine-tuning posterior en tareas de dominio: al ser un base sin alineación, puede servir como inicialización para SFT específico en nichos científicos.
- Análisis de pérdida de validación como métrica: útil para calibrar protocolos de evaluación con splits de test de 20M de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación final sobre el split de test de 20M de tokens:

| Metrica | Valor |
|---|---|
| Val loss final (nats/token, split test 20M) | 1,19870 |
| Val loss celda del sweep | 1,19866 |
| Pasos de entrenamiento | 812 (2 epocas) |
| Tokens de entrenamiento (ventana i.i.d.) | 40M |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 32,8 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 40 GB o superior (A100 40GB/80GB, H100).
- VRAM estimada en bf16 (si se convierte): en torno a 16,4 GB para pesos, viable en RTX 4090 (24 GB) con margen limitado para contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8,2 GB para pesos; en 4 bits, en torno a 4,1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: H100 o A100 para fp32 nativo; RTX 4090 o A6000 para bf16; GPUs consumer de 16 GB o más para cuantización 8/4 bits.
- Cabe en GPU consumer: sí, en bf16 en RTX 4090 y en cuantizaciones bajas en GPUs de 16 GB, siempre que se conviertan los pesos.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversión a los formatos correspondientes; el repo solo contiene safetensors en fp32.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Thoughtless.Qwen3-8B-Base.40M-iid.statML-arxiv.best | 8,19B | no disponible (entrenado a 4096) | Apache 2.0 | Continued pretraining de dominio, sin alineación |
| Qwen/Qwen3-8B-Base | 8,19B | no disponible en la informacion | Apache 2.0 | Modelo base original, capacidades generales |
| Qwen3-8B (instruct) | 8,19B | no disponible en la informacion | Apache 2.0 | Variante alineada para instrucciones y razonamiento |

La comparación con alternativas de la misma categoría (continued pretraining de dominio sobre un base de 8B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo alineado: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Riesgo de alucinación elevado en uso generativo, especialmente fuera del dominio de statML-arxiv.
- Posible olvido catastrófico de capacidades generales del Qwen3-8B-Base tras el continued pretraining; no se documenta su preservación.
- El entrenamiento se limita a 40M de tokens en 812 pasos con tasa de aprendizaje muy baja (3e-06), lo que sugiere un ajuste suave pero de alcance acotado.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se documenta la longitud de contexto efectiva tras el ajuste; el entrenamiento usó documentos de 4096 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción sin un fine-tuning y una evaluación adicionales.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni pipeline declarado.
- Pesos en fp32 (32,8 GB), lo que dificulta el despliegue sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-8B-Base.40M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/pil970sf
