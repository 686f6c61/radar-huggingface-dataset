# jhyuckkim/GPT-OSS-20B-Dense-4B-ACP-K4

## Resumen

GPT-OSS-20B-Dense-4B-ACP-K4 es un modelo de lenguaje denso de 4.190 millones de parámetros obtenido mediante poda y destilación del modelo MoE GPT-OSS-20B de OpenAI. Lo desarrolla el equipo de Krafton AI (jhyuckkim y colaboradores) como artefacto de investigación para el artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). Su objetivo es estudiar cómo transformar un modelo de mezcla de expertos en un modelo denso de menor tamaño preservando el mayor rendimiento posible bajo un presupuesto de destilación fijo y muy reducido (0.300 millones de tokens).

El modelo es un estudiante denso que conserva la arquitectura GPT-OSS (atención con ventana deslizante, activación con puerta, sesgos por capa y YaRN RoPE) pero con `num_local_experts=1`, es decir, sin mezcla de expertos. Está pensado exclusivamente para reproducir los experimentos del artículo y comparar métodos de puntuación de expertos (en este caso, ACP con K=4). No ha recibido ajuste de instrucciones ni alineación, por lo que su calidad como asistente conversacional es muy inferior a la del maestro y a la de modelos preentrenados del mismo tamaño. No debe usarse como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de GPT-OSS-20B (GptOssForCausalLM, `num_local_experts=1`) |
| Parametros totales | 4.185.089.880 (4,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (hereda la del maestro GPT-OSS-20B, no documentada en la ficha) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un estudiante denso obtenido a partir del maestro MoE `openai/gpt-oss-20b`. La técnica empleada es poda pura: se seleccionan K=4 expertos por capa (el maestro tiene top-k=4) y se agrupan uno por grupo, eliminando el resto. La puntuación de expertos se realiza con el método ACP (presumiblemente "Activation-based Contribution Pruning" o similar, descrito en el artículo). Tras la poda, se escala la down-projection de forma proporcional y se destila el estudiante sobre 0.300 millones de tokens de FineWeb-Edu (`sample-10BT`). No se aplica ajuste de instrucciones, RLHF ni DPO.

La arquitectura resultante es un transformer denso que conserva las características del maestro: atención con ventana deslizante, activación con puerta (gated activation), sesgos por capa y YaRN RoPE. El modelo se carga con la clase `GptOssForCausalLM` con `num_local_experts=1`, por lo que no debe tratarse como un transformer denso genérico.

## Capacidades

- Generación de texto en modo completado (no conversacional, sin plantilla de chat).
- Razonamiento básico muy limitado: los resultados en benchmarks de sentido común y conocimiento son bajos (p. ej., MMLU 5-shot 23,3%).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas, probablemente limitadas al inglés del corpus de destilación (FineWeb-Edu es mayoritariamente inglés).
- No incluye modo de pensamiento, visión ni audio.

## Casos de uso

Dado que se trata de un artefacto de investigación, los casos de uso son fundamentalmente académicos y técnicos:

- Reproducción de experimentos del artículo: permite verificar los resultados reportados en la tabla 18 del paper, comparando configuraciones ACP, SF, CP y DO-ACP.
- Estudio de técnicas de poda y destilación MoE a denso: sirve como caso concreto para analizar el impacto de la puntuación de expertos y la agrupación en el rendimiento final.
- Benchmarking de métodos de compresión: puede usarse como baseline para evaluar nuevas técnicas de destilación o poda en arquitecturas GPT-OSS.
- Investigación sobre el efecto del presupuesto de destilación: al estar entrenado con solo 0.300B tokens, permite estudiar cómo influye la cantidad de datos en la calidad del estudiante.
- Desarrollo de metodologías de evaluación de modelos comprimidos: sus resultados en Wino, Hella, ARC y MMLU ofrecen un punto de referencia para comparar métricas.
- Docencia y formación: útil en cursos de compresión de modelos o arquitecturas eficientes para ilustrar conceptos de MoE, poda y destilación con un ejemplo real y ejecutable.

## Benchmarks y rendimiento

La model card incluye resultados en modo completado para cinco benchmarks, comparando distintas configuraciones de poda y destilación. Se reproduce la tabla del artículo (Tabla 18):

| Configuracion | Wino (5-shot) | Hella (10-shot) | ARC-E (25-shot) | ARC-C (25-shot) | MMLU (5-shot) | Avg |
|---|---|---|---|---|---|---|
| **ACP, K=4 (este modelo)** | **53.0** | **31.9** | **35.6** | **23.0** | **23.3** | **33.36** |
| SF, K=4 | 51.6 | 29.4 | 34.0 | 22.4 | 23.3 | 32.15 |
| SF, K=8 | 51.6 | 29.3 | 33.3 | 21.7 | 22.8 | 31.72 |
| CP, K=4 | 50.9 | 30.4 | 36.4 | 23.0 | 23.6 | 32.86 |
| CP, K=8 | 49.7 | 29.3 | 32.2 | 23.2 | 23.1 | 31.49 |
| ACP, K=8 | 53.1 | 30.5 | 33.6 | 23.3 | 23.7 | 32.82 |
| DO-ACP, K=4 | 53.0 | 32.1 | 36.7 | 23.2 | 23.7 | 33.71 |
| DO-ACP, K=8 | 51.3 | 29.9 | 33.5 | 22.5 | 23.3 | 32.11 |
| Random FFN + teacher attn | 50.2 | 27.5 | 28.5 | 23.0 | 23.2 | 30.46 |
| Random initialization | 50.0 | 26.0 | 25.8 | 25.3 | 23.0 | 30.02 |
| Teacher (GPT-OSS-20B) | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 |

Nota: el maestro se evaluó en modo completado para comparar con los estudiantes; en su formato nativo (con plantilla de chat) alcanza un MMLU del 72%. El estudiante no tiene plantilla de chat, por lo que no se evalúa en ese formato.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,4 GB (4,19B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 10-12 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores; también A100 (40/80 GB) para mayor comodidad. Cabe en GPUs consumer de 16 GB con cuantización.
- Opciones de despliegue: compatible con transformers (carga directa), vLLM, llama.cpp, Ollama y TGI mediante conversión a GGUF o AWQ. Al ser un modelo denso, la inferencia es más sencilla que la del maestro MoE.
- Latencia y throughput: no hay datos publicados. Al ser un modelo de 4B denso, puede alcanzar decenas de tokens por segundo en una RTX 4090, pero depende de la implementación y el batch.

## Comparativa con modelos similares

Este modelo se compara con otros estudiantes densos del mismo trabajo, todos con 4,19B parámetros y destilados con 0.3B tokens:

| Modelo | Metodo | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|---|
| GPT-OSS-20B-Dense-4B-ACP-K4 (este) | ACP, K=4 | 53.0 | 31.9 | 35.6 | 23.0 | 23.3 | 33.36 |
| GPT-OSS-20B-Dense-4B-SF-K4 | SF, K=4 | 51.6 | 29.4 | 34.0 | 22.4 | 23.3 | 32.15 |
| GPT-OSS-20B-Dense-4B-CP-K4 | CP, K=4 | 50.9 | 30.4 | 36.4 | 23.0 | 23.6 | 32.86 |
| GPT-OSS-20B-Dense-4B-DO-ACP-K4 | DO-ACP, K=4 | 53.0 | 32.1 | 36.7 | 23.2 | 23.7 | 33.71 |
| Teacher (GPT-OSS-20B) | MoE original | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 |

En comparación con modelos densos preentrenados del mismo tamaño (p. ej., Qwen2.5-4B o Llama-3.2-3B), este estudiante tiene un rendimiento muy inferior porque su destilación se limitó a 0.3B tokens y no hubo ajuste de instrucciones. No se dispone de datos de esos modelos en esta ficha.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general ni un asistente conversacional. Su calidad es muy inferior a la del maestro y a la de modelos densos preentrenados del mismo tamaño.
- Sin alineación: no se aplicó RLHF, DPO ni ajuste de instrucciones, por lo que puede generar contenido incoherente, sesgado o inapropiado.
- Destilación con presupuesto extremadamente bajo (0.3B tokens): el rendimiento absoluto es pobre, como reflejan los benchmarks (MMLU 23,3%).
- No soporta tool calling, agentes ni razonamiento complejo.
- Idiomas: no documentados; el corpus de destilación (FineWeb-Edu) es predominantemente inglés, por lo que el rendimiento en otros idiomas es incierto.
- Longitud de contexto no especificada: aunque hereda la arquitectura del maestro, no se garantiza que la ventana de contexto completa funcione correctamente tras la poda.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación, no se recomienda su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-ACP-K4
- Artículo (arXiv): https://arxiv.org/abs/2605.28207
- Código del proyecto: https://github.com/krafton-ai/moe-to-dense
- Modelo maestro GPT-OSS-20B: https://huggingface.co/openai/gpt-oss-20b
- Otros estudiantes del mismo trabajo: [SF-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-SF-K4), [CP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-CP-K4), [DO-ACP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-DO-ACP-K4)
