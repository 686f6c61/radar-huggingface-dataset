# schneiderkamplab/DFM-Mimir-FP8

## Resumen

DFM-Mimir-FP8 es la versión cuantizada en FP8 del modelo DFM-Mimir, un modelo de lenguaje de 1.786 millones de parámetros (1.786.775.040) desarrollado por Danish Foundation Models y publicado por el laboratorio schneiderkamplab. Se trata de un modelo denso basado en la arquitectura Hierarchical Reasoning Model (HRM), entrenado desde cero con datos de entrenamiento post-permisibles, es decir, datos obtenidos de forma ética y legal. El modelo ofrece rendimiento competitivo en inglés y rendimiento de vanguardia en danés, con una longitud de contexto no especificada en la información disponible. La cuantización FP8 reduce el tamaño del modelo de aproximadamente 3.2 GB a 2.59 GB, manteniendo una calidad casi idéntica al modelo bf16 original, con una caída media de solo 0.9 puntos en 17 benchmarks. Está disponible bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM (Hierarchical Reasoning Model) |
| Parametros totales | 1.786.775.040 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) per-channel estático de pesos, activaciones dinámicas per-token; lm_head en bf16 |
| Idiomas soportados | danés (da), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo DFM-Mimir está basado en la arquitectura Hierarchical Reasoning Model (HRM), un diseño de transformer autoregresivo que organiza el razonamiento en niveles jerárquicos. Según el paper (arXiv:2608.13517), el modelo fue entrenado desde cero utilizando el tokenizer de Gemma-4, en lugar del tokenizer personalizado empleado en HRM-Text. El entrenamiento incluye la aplicación de una plantilla de chat, lo que permite al modelo aprender las convenciones estructurales y los patrones de comportamiento típicos de la IA conversacional moderna. La cuantización FP8 se realizó con la librería compressed-tensors 0.17.0, utilizando formato float E4M3, con estrategia de pesos por canal (simétrica estática) y activaciones por token (simétrica dinámica). El lm_head se mantiene en bf16 para preservar la precisión de la salida. El modelo base fue entrenado con datos de entrenamiento post-permisibles, lo que lo hace especialmente relevante para la investigación en modelos abiertos con datos éticos.

## Capacidades

- Generación de texto conversacional en danés e inglés, con soporte de plantilla de chat integrada.
- Razonamiento de sentido común y conocimiento general: obtiene 58.5 en MMLU y 81.0 en ARC-C en FP8.
- Razonamiento matemático: 90.1 en GSM8K y 49.8 en MATH en FP8.
- Generación de código: 53.0 en HumanEval y 52.5 en MBPP en FP8.
- Comprensión de lectura y respuesta a preguntas: 87.8 en BoolQ y 80.0 en DROP (F1) en FP8.
- Capacidades multilingües: rendimiento de vanguardia en danés, con 96.0 F1 en DaLA, 93.0 EM en GEC y 33.2 en Generación de cuentos.
- No se ha documentado soporte de tool calling, function calling, ni capacidades de visión o audio.

## Casos de uso

- Asistente conversacional en danés: el modelo puede mantener diálogos multi-turno en danés con una calidad superior a otros modelos de su tamaño, gracias a su entrenamiento específico en ese idioma. Se puede integrar en aplicaciones de atención al cliente o chatbots.
- Análisis de texto en inglés con recursos limitados: al ser un modelo de 1.8B cuantizado a FP8, puede ejecutarse en GPUs de consumo, lo que permite procesar documentos, clasificar textos o extraer información en inglés sin necesidad de infraestructura costosa.
- Razonamiento matemático en entornos educativos: con un 90.1 en GSM8K, el modelo puede resolver problemas de matemáticas escolares y generar explicaciones paso a paso en inglés y danés.
- Generación de código básico y asistencia en programación: aunque su rendimiento en HumanEval es moderado (53.0), puede ayudar en tareas de autocompletado o corrección de fragmentos de código en lenguajes como Python.
- Investigación en IA ética y reproducible: al estar entrenado con datos permisibles y ser de código abierto bajo Apache 2.0, el modelo es adecuado para investigar el comportamiento de modelos pequeños con datos legales y éticos.
- Despliegue en edge computing o dispositivos embebidos: su tamaño de 2.59 GB en FP8 permite su ejecución en hardware modesto, como Jetson o GPUs de gama baja, para aplicaciones de inferencia local.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la model card. A continuación se presentan las tablas de evaluación para inglés, matemáticas/código y danés.

### Inglés

| Modelo | BoolQ (Acc) | Winogrande (Acc) | Hellaswag (Acc) | MMLU (Acc) | ARC-C (Acc) | DROP (F1) | GovRep. (R1) | Avg. |
|-------|:-----------:|:----------------:|:---------------:|:----------:|:-----------:|:---------:|:------------:|:----:|
| Mimir 1B (bf16) | 87.8 | 73.5 | 67.3 | 57.5 | 81.6 | 83.1 | 32.0 | 69.0 |
| Mimir 1B (FP8) | 87.8 | 72.7 | 67.4 | 58.5 | 81.0 | 80.0 | — | — |
| HRM-Text 1B | 87.5 | 70.4 | 60.4 | 58.7 | 82.2 | 78.1 | 25.4 | 66.1 |
| Qwen 3.5 0.8B | 69.8 | 48.9 | 37.0 | 51.5 | 68.4 | 45.2 | 32.5 | 50.5 |
| Gemma 3 1B | 62.4 | 49.1 | 30.6 | 37.5 | 43.5 | 7.0 | 29.5 | 37.1 |
| OLMo 2 1B | 67.2 | 51.0 | 42.4 | 41.6 | 48.1 | 12.4 | 37.7 | 42.9 |
| Qwen 3.5 2B | 80.8 | 53.4 | 64.6 | 62.8 | 82.7 | 31.3 | 31.5 | 58.2 |
| SmolLM3 3B | 84.3 | 60.3 | 65.1 | 60.2 | 79.5 | 54.0 | 38.1 | 63.1 |
| Qwen 3.5 4B | 87.0 | 70.0 | 83.2 | 75.8 | 92.9 | 48.0 | 27.9 | 69.3 |
| Gemma 4 E2B | 64.1 | 56.7 | 55.6 | 59.3 | 69.8 | 57.3 | 33.6 | 56.6 |
| Gemma 4 E2B (think) | 83.4 | 63.0 | 55.8 | 72.0 | 86.8 | 70.8 | 34.7 | 66.6 |

### Matemáticas y código

| Modelo | GSM8K (Acc) | MATH (Acc) | HumanEval (Acc) | MBPP (Acc) | Avg. |
|-------|:-----------:|:----------:|:---------------:|:----------:|:----:|
| Mimir 1B (bf16) | 89.9 | 45.8 | 56.7 | — | 64.1 |
| Mimir 1B (FP8) | 90.1 | 49.8 | 53.0 | 52.5 | — |
| HRM-Text 1B | 84.8 | 56.0 | 0.0 | — | 46.9 |
| Qwen 3.5 0.8B | 49.1 | 36.1 | 30.5 | — | 38.6 |
| Gemma 3 1B | 49.7 | 37.2 | 42.7 | — | 43.2 |
| OLMo 2 1B | 59.4 | 18.8 | 15.9 | — | 31.4 |
| Qwen 3.5 2B | 73.7 | 55.7 | 47.6 | — | 59.0 |
| SmolLM3 3B | 80.0 | 62.2 | 61.6 | — | 67.9 |
| Qwen 3.5 4B | 60.5 | 56.5 | 78.0 | — | 65.0 |
| Gemma 4 E2B | 88.3 | 64.2 | 73.8 | — | 75.4 |
| Gemma 4 E2B (think) | 90.3 | 49.1 | 72.0 | — | 70.5 |

### Danés

| Modelo | Angry Tweets (Acc) | DaLA (F1) | GEC (EM) | PIQA (Acc) | Daisy (EM) | WikiQA (EM) | WMT (chrF) | N.News (chrF) | IFEval (Acc) | Hellaswag-DA (Acc) | Gen. Tale. (Mgf) | Avg. |
|-------|:-------------------:|:---------:|:--------:|:----------:|:----------:|:-----------:|:---------:|:-------------:|:------------:|:------------------:|:----------------:|:----:|
| Mimir 1B (bf16) | 67.4 | 96.1 | 85.6 | 53.7 | 9.6 | 66.8 | 53.9 | 35.87 | 63.9 | 35.3 | — | 56.8 |
| Mimir 1B (FP8) | — | 96.0 | 93.0 | 51.9 | 8.8 | 64.9 | 53.5 | — | — | — | 33.2 | — |
| HRM-Text 1B | 42.4 | 26.7 | 0.5 | 13.0 | 0.0 | 34.9 | 25.4 | 26.76 | 18.5 | 28.8 | — | 21.7 |
| Qwen 3.5 0.8B | 53.8 | 51.0 | 0.7 | 56.5 | 0.7 | 41.6 | 37.8 | 35.30 | 39.6 | 25.0 | — | 34.2 |
| Gemma 3 1B | 54.4 | 41.0 | 3.3 | 72.2 | 1.4 | 42.6 | 45.1 | 35.56 | 47.2 | 24.8 | — | 36.8 |
| OLMo 2 1B | 33.6 | 48.7 | 0.2 | 75.0 | 0.0 | 8.4 | 30.0 | 33.77 | 32.5 | 26.7 | — | 28.9 |
| Qwen 3.5 2B | 61.6 | 36.4 | 8.0 | 25.0 | 2.5 | 49.4 | 45.6 | 34.85 | 56.1 | 24.7 | — | 34.4 |
| SmolLM3 3B | 63.2 | 33.5 | 3.3 | 51.9 | 2.2 | 0.3 | 37.3 | 35.98 | 49.8 | 40.1 | — | 31.7 |
| Qwen 3.5 4B | 69.1 | 50.1 | 42.6 | 70.4 | 4.7 | 57.1 | 52.1 | 37.03 | 73.7 | 34.7 | — | 49.2 |
| Gemma 4 E2B | 64.6 | 56.7 | 36.9 | 46.3 | 5.6 | 44.1 | 55.2 | 35.67 | 75.5 | 25.6 | — | 44.6 |
| Gemma 4 E2B (think) | 67.7 | 66.8 | 23.4 | 63.9 | 5.1 | 59.3 | 56.0 | 36.30 | 81.2 | 39.0 | — | 49.9 |
| Munin-Apertus 8B | 60.6 | 46.1 | 42.1 | 81.5 | 12.5 | 49.9 | 55.8 | 30.30 | 53.0 | 24.5 | — | 45.6 |
| Munin-Mistral 8B | 61.3 | 48.8 | 26.4 | 76.9 | 8.4 | 48.4 | 51.8 | 32.92 | 67.8 | 33.6 | — | 45.6 |

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan 2.59 GB. Para inferencia con longitudes de generación moderadas se recomienda una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Con cuantización bf16, se necesitarían aproximadamente 3.2 GB solo para pesos, por lo que 8 GB de VRAM es lo recomendable.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, A10G 24GB; no se requieren A100 o H100.
- Sí cabe en consumer GPU: RTX 3060, RTX 4060, RTX 4070 y modelos superiores con al menos 6 GB de VRAM.
- Opciones de despliegue: transformers con trust_remote_code (como se muestra en la model card); también es compatible con endpoints_compatible, lo que sugiere que puede desplegarse en vLLM o TGI. No se han publicado instrucciones para llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DFM-Mimir-FP8 | 1.786.775.040 | no disponible | 58.5 | 90.1 | 53.0 | Apache 2.0 | HuggingFace |
| Qwen 3.5 0.8B | 0.8B | no disponible | 51.5 | 49.1 | 30.5 | no disponible | no disponible |
| Gemma 3 1B | 1B | no disponible | 37.5 | 49.7 | 42.7 | no disponible | no disponible |
| OLMo 2 1B | 1B | no disponible | 41.6 | 59.4 | 15.9 | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha documentado la longitud de contexto del modelo, lo que limita su uso en tareas que requieren ventanas muy largas, como análisis de documentos extensos.
- Los benchmarks muestran una ligera degradación en la precisión debido a la cuantización FP8 en comparación con el modelo bf16 (caída media de 0.9 puntos), aunque en algunos benchmarks (HellaSwag, GSM8K, MATH) el FP8 supera al bf16.
- El modelo no tiene soporte documentado de tool calling o function calling, por lo que no es adecuado para agentes que necesiten invocar herramientas externas de forma nativa.
- Al estar entrenado principalmente en danés e inglés, su rendimiento en otros idiomas es probablemente bajo, y puede presentar sesgos lingüísticos hacia esos dos idiomas.
- La información disponible no detalla los datos de entrenamiento ni los sesgos potenciales; se recomienda evaluar el modelo en conjuntos de datos específicos antes de usarlo en producción.
- El modelo base fue entrenado con datos "permisibles", pero la composición exacta del dataset no se especifica en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se deben cumplir las condiciones de atribución y aviso de licencia.

## Enlaces

- HuggingFace: https://huggingface.co/schneiderkamplab/DFM-Mimir-FP8
- Modelo base: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Paper (arXiv): https://arxiv.org/abs/2608.13517
- PDF del paper: https://arxiv.org/pdf/2608.13517
