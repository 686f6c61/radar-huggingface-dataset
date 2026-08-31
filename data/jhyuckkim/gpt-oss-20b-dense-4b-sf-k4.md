# jhyuckkim/GPT-OSS-20B-Dense-4B-SF-K4

## Resumen

GPT-OSS-20B-Dense-4B-SF-K4 es un artefacto de investigación, no un modelo de propósito general. Se trata de un estudiante denso de 4.19B parámetros obtenido mediante poda y destilación del modelo MoE GPT-OSS-20B de OpenAI, como parte del estudio *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). El objetivo es comparar métodos de puntuación de expertos y agrupación bajo un presupuesto de destilación fijo y reducido (0.3B tokens de FineWeb-Edu). Por tanto, su calidad absoluta es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño, y no se le aplicó ajuste de instrucciones ni alineación.

La arquitectura resultante conserva la activación con puerta, los sesgos por capa, la atención de ventana deslizante y el RoPE YaRN del profesor, pero con un único experto local (equivalente a una FFN densa). El modelo se distribuye en formato safetensors y se carga con la clase `GptOssForCausalLM` de Transformers. Está pensado exclusivamente para reproducir los experimentos del paper y para estudiar técnicas de compresión MoE-a-denso, no para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (transformador denso, derivado de GPT-OSS-20B con `num_local_experts=1`) |
| Parametros totales | 4.185.089.880 (4.19B) |
| Parametros activos | 4.19B (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la del profesor, pero no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 8.4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformador denso obtenido a partir del profesor MoE `openai/gpt-oss-20b`. La poda selecciona K=4 expertos por capa (en este caso, K coincide con el top-k del profesor, por lo que se conserva un experto por grupo, es decir, poda pura) usando la puntuación SF (*score function*). La proyección de bajada se escala de forma uniforme. El estudiante mantiene la activación con puerta, los sesgos por capa, la atención de ventana deslizante y el YaRN RoPE del profesor, pero con un único experto local, por lo que se comporta como una red densa.

El entrenamiento consistió en destilar el profesor sobre 0.3B tokens de FineWeb-Edu (submuestra `sample-10BT`), un presupuesto deliberadamente pequeño para poder comparar métodos de puntuación y agrupación en igualdad de condiciones. No se aplicó ajuste de instrucciones, RLHF ni ningún tipo de alineación. El resultado es un modelo con capacidades de generación de texto básicas, pero muy por debajo de lo que ofrecería un modelo denso preentrenado de tamaño similar.

## Capacidades

- Generación de texto en modo completado (sin plantilla de chat).
- Razonamiento básico y comprensión de lenguaje limitados por el bajo presupuesto de destilación.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento ni capacidades multimodales.
- Multilingüismo no confirmado; los datos de entrenamiento (FineWeb-Edu) son predominantemente en inglés.
- Su única utilidad práctica es la reproducción de experimentos de investigación sobre poda y destilación de MoE.

## Casos de uso

- Reproducción de experimentos del paper *Pruning and Distilling Mixture-of-Experts into Dense Language Models*: permite verificar los resultados de la Tabla 18 y comparar la configuración SF K=4 con otras variantes.
- Investigación en compresión de modelos: sirve como punto de partida para estudiar cómo afecta la poda de expertos a la calidad final del modelo denso.
- Evaluación de métricas de puntuación de expertos: al estar destilado con un presupuesto fijo, permite aislar el efecto del método de selección de expertos.
- Análisis de la transferencia de conocimiento MoE→denso: útil para estudiar qué características del profesor se conservan o se pierden en la destilación.
- Desarrollo de técnicas de poda estructural: puede usarse como banco de pruebas para nuevos algoritmos de compresión.
- Docencia e investigación académica: ejemplo didáctico de cómo se construye un modelo denso a partir de un MoE, con código y pesos disponibles.

No es adecuado para aplicaciones de producción, asistentes conversacionales, generación de código o cualquier tarea que requiera calidad o seguridad.

## Benchmarks y rendimiento

El autor publica resultados en cinco benchmarks de razonamiento y comprensión, evaluados en modo completado. La tabla siguiente reproduce los valores de la configuración SF K=4 (la de este modelo) junto con otras variantes del mismo estudio y el profesor.

| Configuracion | Wino (5-shot) | HellaSwag (10-shot) | ARC-E (25-shot) | ARC-C (25-shot) | MMLU (5-shot) | Avg |
|---|---|---|---|---|---|---|
| **SF, K=4 (este modelo)** | **51.6** | **29.4** | **34.0** | **22.4** | **23.3** | **32.15** |
| SF, K=8 | 51.6 | 29.3 | 33.3 | 21.7 | 22.8 | 31.72 |
| CP, K=4 | 50.9 | 30.4 | 36.4 | 23.0 | 23.6 | 32.86 |
| CP, K=8 | 49.7 | 29.3 | 32.2 | 23.2 | 23.1 | 31.49 |
| ACP, K=4 | 53.0 | 31.9 | 35.6 | 23.0 | 23.3 | 33.36 |
| ACP, K=8 | 53.1 | 30.5 | 33.6 | 23.3 | 23.7 | 32.82 |
| DO-ACP, K=4 | 53.0 | 32.1 | 36.7 | 23.2 | 23.7 | 33.71 |
| DO-ACP, K=8 | 51.3 | 29.9 | 33.5 | 22.5 | 23.3 | 32.11 |
| Random FFN + teacher attn | 50.2 | 27.5 | 28.5 | 23.0 | 23.2 | 30.46 |
| Random initialization | 50.0 | 26.0 | 25.8 | 25.3 | 23.0 | 30.02 |
| Teacher (GPT-OSS-20B) | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 |

El profesor se evaluó en modo completado para mantener la coherencia con los estudiantes, lo que subestima su capacidad real (MMLU 49% en modo completado frente a 72% con la plantilla de chat). Los resultados del estudiante son claramente inferiores a los del profesor y a los de modelos densos preentrenados del mismo tamaño, como era esperable dado el presupuesto de destilación de solo 0.3B tokens.

## Requisitos de hardware

No se especifican requisitos oficiales. A partir del tamaño del modelo (4.19B parámetros en bf16, ~8.4 GB de pesos), se puede estimar:

- VRAM mínima para inferencia en bf16: ~9-10 GB (pesos + activaciones). Con cuantización a 8 bits ~5 GB, y a 4 bits ~3 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con 12 GB o más (RTX 3060 12GB, RTX 4070, A10, L4, etc.). Cabría en GPUs consumer de gama media.
- Despliegue: compatible con Transformers (carga directa con `AutoModelForCausalLM`). No hay soporte confirmado para vLLM, llama.cpp u Ollama, aunque al ser un modelo estándar de Transformers podría adaptarse.
- Latencia y throughput: no disponibles. Al ser un modelo denso de 4B, la inferencia es relativamente rápida en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparación más directa es con las otras variantes del mismo estudio, todas del mismo tamaño y destiladas con el mismo presupuesto de tokens:

| Modelo | Parametros | Contexto | Wino | Hella | ARC-E | ARC-C | MMLU | Avg | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| GPT-OSS-20B-Dense-4B-SF-K4 (este) | 4.19B | no disp. | 51.6 | 29.4 | 34.0 | 22.4 | 23.3 | 32.15 | Apache-2.0 |
| GPT-OSS-20B-Dense-4B-CP-K4 | 4.19B | no disp. | 50.9 | 30.4 | 36.4 | 23.0 | 23.6 | 32.86 | Apache-2.0 |
| GPT-OSS-20B-Dense-4B-ACP-K4 | 4.19B | no disp. | 53.0 | 31.9 | 35.6 | 23.0 | 23.3 | 33.36 | Apache-2.0 |
| GPT-OSS-20B-Dense-4B-DO-ACP-K4 | 4.19B | no disp. | 53.0 | 32.1 | 36.7 | 23.2 | 23.7 | 33.71 | Apache-2.0 |
| GPT-OSS-20B (profesor) | 20B (MoE) | no disp. | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 | Apache-2.0 |

La variante SF K=4 obtiene el peor promedio entre las configuraciones con K=4, ligeramente por detrás de CP, ACP y DO-ACP. Frente a modelos densos preentrenados de ~4B (p. ej., Qwen2.5-4B, Gemma-2-4B), el rendimiento sería muy inferior, pero no se dispone de datos comparativos en esta ficha.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor advierte explícitamente que no debe usarse como asistente de propósito general.
- Calidad muy baja: destilado con solo 0.3B tokens, su rendimiento en benchmarks es muy inferior al del profesor y al de modelos densos preentrenados del mismo tamaño.
- Sin ajuste de instrucciones ni alineación: no sigue instrucciones, no tiene plantilla de chat y puede generar contenido incoherente o no deseado.
- Riesgo de alucinación elevado: debido a la falta de entrenamiento suficiente, las respuestas pueden ser factualmente incorrectas o sin sentido.
- Sin soporte multilingüe confirmado: los datos de entrenamiento son principalmente en inglés; el rendimiento en otros idiomas es desconocido.
- Licencia Apache-2.0 permite uso comercial, pero no se recomienda por la baja calidad y la naturaleza de artefacto de investigación.
- No se proporcionan cuantizaciones oficiales ni integraciones con frameworks de inferencia optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-SF-K4
- Paper (arXiv): https://arxiv.org/abs/2605.28207
- Código del estudio: https://github.com/krafton-ai/moe-to-dense
- Variantes comparables: [CP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-CP-K4), [ACP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-ACP-K4), [DO-ACP-K4](https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-DO-ACP-K4)
- Profesor GPT-OSS-20B: https://huggingface.co/openai/gpt-oss-20b
- Repositorio oficial de GPT-OSS: https://github.com/openai/gpt-oss
