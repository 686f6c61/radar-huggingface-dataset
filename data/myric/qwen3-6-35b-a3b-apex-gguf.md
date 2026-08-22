# Myric/Qwen3.6-35B-A3B-APEX-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.6-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo de Qwen. La cuantización, realizada por el usuario Myric con el método APEX (Adaptive Precision for EXpert Models), reduce el tamaño del modelo original para facilitar su despliegue en entornos con recursos limitados. El modelo base, con 35.5 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, usa una arquitectura híbrida que combina atención lineal GatedDeltaNet con atención completa periódica, además de una cabeza NextN/MTP.

La principal innovación de esta cuantización es el uso de una matriz de importancia (imatrix) generada con PyTorch en lugar de la herramienta estándar `llama-imatrix`, porque esta última no es práctica para la arquitectura `qwen35moe` debido a su recurrencia serial. La imatrix generada cubre todas las capas, incluida la cabeza MTP, y se ha validado contra una imatrix de referencia de la misma arquitectura con una correlación mediana de 0.956. El repositorio ofrece dos niveles de cuantización: `i-quality` (23.5 GB) y `i-compact` (17.4 GB).

El modelo se distribuye bajo licencia Apache-2.0 y está pensado para su uso con llama.cpp y otros motores compatibles con GGUF. No es una cuantización oficial de Qwen, sino un trabajo de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (híbrida GatedDeltaNet + atención full periódica, 40 capas, 256 expertos enrutados + 1 experto compartido) |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | 3B (aproximadamente, 8 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX con imatrix PyTorch, dos niveles: i-quality y i-compact |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE híbrido con 40 capas, 256 expertos enrutados y un experto compartido, donde solo 8 expertos se activan por token. Su arquitectura combina una atención lineal GatedDeltaNet con atención completa periódica, y además incorpora una cabeza de predicción de siguiente token (NextN/MTP). Esta cuantización no modifica la arquitectura, solo reduce la precisión numérica de los pesos.

La cuantización APEX es una técnica que asigna distinta precisión a distintas partes del modelo, optimizada para MoE. La imatrix se generó con un script PyTorch que procesa el modelo en bandas, cubriendo todos los tensores incluida la cabeza MTP (que el `llama-imatrix` estándar no cubre). La validación se realizó comparando la correlación por tensor con una imatrix de referencia de la arquitectura hermana Qwen3.5-35B-A3B, obteniendo una correlación mediana de 0.956. Además, se midió la perplejidad en wikitext-2 y un corpus de código, mostrando una diferencia de 0.02 PPL respecto a una imatrix de llama.cpp, estadísticamente indistinguible.

## Capacidades

- Generación de texto: como modelo de lenguaje de propósito general, puede generar texto coherente en múltiples dominios (aunque no se detallan capacidades específicas en la información proporcionada).
- Soporte de tool calling / function calling: no disponible en la información del repositorio.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no especificadas en la información disponible.
- Capacidades especiales: no se mencionan (ni visión, ni audio). El pipeline es `text-generation`.

Nota: al ser una cuantización del modelo base Qwen3.6-35B-A3B, las capacidades funcionales son las mismas que las del modelo original, pero la model card no proporciona una lista detallada. Se recomienda consultar la documentación oficial de Qwen para conocer las capacidades completas.

## Casos de uso

- **Despliegue en hardware de consumo**: con un archivo de 17.4 GB (i-compact) o 23.5 GB (i-quality), este modelo puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, lo que permite experimentar con un MoE de 35B en local sin necesidad de servidores profesionales.
- **Generación de código asistida**: su tamaño y la presencia de expertos especializados (típica en modelos de esta familia) lo hacen adecuado para autocompletar código, aunque no se han publicado benchmarks específicos en este repositorio.
- **Aplicaciones de chat y asistentes conversacionales**: al ser un modelo de lenguaje general, puede servir de base para chatbots o asistentes virtuales en entornos donde se requiera una respuesta rápida y una baja huella de memoria.
- **Investigación y experimentación**: los desarrolladores pueden probar técnicas de cuantización o estudiar el comportamiento de la arquitectura híbrida GatedDeltaNet + MoE con un modelo de tamaño mediano.
- **Procesamiento por lotes**: gracias a su bajo número de parámetros activos (3B), el throughput por token es relativamente alto, lo que lo hace útil para tareas de generación masiva de texto (p. ej., resúmenes, traducción) en entornos con una sola GPU.
- **Integración en pipelines de NLP**: al ser GGUF, se puede integrar fácilmente con llama.cpp, Ollama o servidores tipo OpenAI-compatible para aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de perplexidad y correlación de la imatrix, que se muestran a continuación.

**Perplexity medida en Qwen3.5 (misma arquitectura, 200×512 tokens de wikitext-2):**

| Cuantización | PPL | Δ vs bf16 |
|---|---|---|
| bf16 (referencia) | 6.620 | — |
| imatrix llama.cpp | 6.756 | +2.05% |
| imatrix torch (APEX) | 6.775 | +2.34% |

**Perplexity en corpus de código (HumanEval + MBPP + GSM8K + prosa, 342 ventanas):**

| Cuantización | PPL |
|---|---|
| bf16 | 2.247 |
| imatrix llama.cpp | 2.310 |
| imatrix torch (APEX) | 2.318 |

La diferencia entre ambas imatrix es de 0.02 PPL, dentro del margen de error (±0.073), lo que indica que la imatrix torch es equivalente a la referencia. No se han publicado resultados de tareas específicas.

## Requisitos de hardware

- **Archivo i-quality** (23.5 GB): requiere al menos 24 GB de VRAM para cargar los pesos sin offloading. Adecuado para GPUs como RTX 3090/4090 (24 GB), A100 40GB, etc.
- **Archivo i-compact** (17.4 GB): requiere al menos 18-20 GB de VRAM. Puede ejecutarse en GPUs de 16 GB (p. ej., RTX 4080, A5000) con posiblemente uso de offloading a CPU.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100, H100. No se recomienda para GPUs con menos de 16 GB de VRAM.
- **Opciones de despliegue**: llama.cpp (el motor principal de GGUF), Ollama (si se convierte), vLLM con soporte GGUF (no confirmado), y otros servidores compatibles con GGUF.
- **Latencia y throughput**: no se han publicado datos específicos de latencia o throughput en el repositorio. Sin embargo, al tener solo 3B parámetros activos, se espera un rendimiento significativamente superior al de un MoE denso de 35B.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos alternativos en la información proporcionada. Se puede considerar que el modelo base Qwen3.6-35B-A3B es comparable a otros MoE de tamaño similar (por ejemplo, DeepSeek-V2-Lite, Mixtral-8x7B), pero no se han incluido comparativas en el repositorio. Para una comparación rigurosa, se recomienda consultar los benchmarks del modelo base en la documentación oficial de Qwen.

## Limitaciones y advertencias

- **Cuantización no oficial**: este es un trabajo de la comunidad, no está respaldado por Qwen. Aunque se ha validado la calidad de la imatrix, pueden existir diferencias de rendimiento con la cuantización oficial.
- **Pérdida de precisión**: la cuantización introduce una degradación de PPL de alrededor del 2.3% en wikitext-2, que es aceptable para muchos usos pero puede afectar a tareas de alta precisión.
- **Sesgos y alucinación**: no se ha evaluado el sesgo del modelo base ni el riesgo de alucinación en esta cuantización. Como cualquier modelo de lenguaje, puede producir contenido inexacto o sesgado.
- **Limitaciones de contexto**: no se especifica la longitud de contexto del modelo base, por lo que se desconoce si esta cuantización hereda limitaciones de ventana de contexto.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base en el repositorio de Qwen.

## Enlaces

- [Repositorio Hugging Face de la cuantización](https://huggingface.co/Myric/Qwen3.6-35B-A3B-APEX-GGUF)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Imatrix de referencia de bartowski para Qwen3.5-35B-A3B](https://huggingface.co/bartowski/Qwen_Qwen3.5-35B-A3B-GGUF)
- [Herramienta APEX quant (LocalAI)](https://github.com/localai-org/apex-quant)
- [Página del proyecto en ModelScope](https://www.modelscope.cn/models/mudler/Qwen3.6-35B-A3B-APEX-GGUF)
- [Ficha del modelo en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen3.6-35b-a3b-apex-gguf-mudler)
