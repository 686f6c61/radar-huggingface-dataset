# basically-ai/Pebble-25M

## Resumen

Pebble-25M es un modelo de lenguaje autoregresivo compacto desarrollado por basically-ai. Combina la eficiencia de los modelos de espacio de estados (SSM) con la capacidad de las capas de atención, dando lugar a una arquitectura híbrida Mamba2/Transformer. Con aproximadamente 25,7 millones de parámetros y una ventana de contexto de 2048 tokens, está diseñado para tareas de generación de texto en inglés en entornos con recursos limitados.

El modelo fue entrenado sobre un subconjunto de 25 mil millones de tokens procedentes de datasets como FineWeb-Edu, DCLM, Cosmopedia-v2 y FineMath-4+, entre otros. Su relevancia radica en servir como base para investigar arquitecturas híbridas eficientes, así como para prototipado rápido y fine-tuning en tareas específicas. Al ser un modelo base, no está alineado para conversación, aunque existe una variante de chat publicada por el mismo autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Mamba2 / Transformer (patrón: 3 bloques Mamba2 por cada bloque de atención) |
| Parametros totales | 25.731.894 (según safetensors; la model card indica ~24,5 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pebble-25M implementa una arquitectura híbrida que alterna bloques Mamba2 y bloques de atención. El patrón se repite con tres bloques Mamba2 seguidos de un bloque de atención, totalizando 8 capas: 6 de Mamba2 y 2 de atención. La dimensión oculta es de 608 y el vocabulario consta de 2048 tokens, construido mediante un tokenizador BPE a nivel de bytes personalizado.

El entrenamiento se realizó en fp32 con autocast bf16, utilizando una división de optimizadores: Muon para los pesos ocultos bidimensionales y AdamW para embeddings, normalizaciones y escalares. Se procesaron aproximadamente 25 mil millones de tokens, distribuidos en seis datasets:

| Dataset | Tokens asignados | Porcentaje |
|---|---|---|
| FineWeb-Edu | 7,50 mil millones | 30% |
| DCLM | 5,00 mil millones | 20% |
| Cosmopedia-v2 | 3,75 mil millones | 15% |
| FineMath-4+ | 3,75 mil millones | 15% |
| FinePhrase | 3,00 mil millones | 12% |
| NPset | 2,00 mil millones | 8% |

No se aplicó RLHF ni DPO: se trata de un modelo base sin alineación conversacional.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento de sentido común básico, reflejado en resultados de PIQA y HellaSwag.
- Razonamiento aritmético elemental, evaluado en ArithMark-2.0 y ArithMark-3.0.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step avanzado.
- No incluye capacidades de visión ni audio.
- Es un modelo base: no está diseñado para mantener conversaciones, aunque existe una variante de chat.
- Multilingüe: únicamente inglés.

## Casos de uso

- Investigación en arquitecturas híbridas: el modelo permite estudiar el equilibrio entre capas Mamba2 y capas de atención, así como el impacto del optimizador Muon en modelos pequeños.
- Educación en NLP y sistemas de lenguaje: sirve como recurso didáctico para mostrar el funcionamiento de un SLM con SSM y atención en un entorno de código abierto.
- Prototipado de pipelines de generación: por su tamaño reducido, se puede iterar rápidamente en experimentos de generación de texto sin necesidad de infraestructura costosa.
- Fine-tuning para tareas específicas: gracias a la licencia Apache 2.0, se puede ajustar para clasificación de texto, generación de respuestas cortas o análisis de sentimiento en inglés.
- Evaluación de benchmarks de razonamiento aritmético: útil para comparar el rendimiento de modelos pequeños en tareas de matemáticas básicas.
- Despliegue en entornos con GPU limitada: el modelo cabe en menos de 1 GB de VRAM en fp32, por lo que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluación zero-shot de opción múltiple sobre los conjuntos de test, salvo ArithMark-2.0 y ArithMark-3.0, que se evaluaron sobre sus conjuntos de train por falta de un test adecuado.

| Benchmark | Pebble-25M | Pebble-25M Chat | Pebble-10M | BananaMind-2-Mini | Random |
|---|---|---:|---:|---:|---:|
| PIQA | 59,25% | 53,37% | 58,43% | 59,63% | 50,00% |
| ARC-Easy | 38,17% | 26,68% | 37,29% | 39,86% | 25,00% |
| ARC-Challenge | 18,60% | 19,62% | 18,60% | 25,68% | 25,00% |
| HellaSwag | 27,62% | 25,63% | 26,81% | 29,72% | 25,00% |
| ArithMark-2.0 | 27,60% | 26,20% | 27,64% | 27,52% | 25,00% |
| ArithMark-3.0 | 33,80% | 28,80% | 32,80% | 34,90% | 25,00% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,1 GB para los pesos en fp32 (25,7 millones de parámetros × 4 bytes), más memoria para activaciones y kernels. En la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y arquitectura Ampere o superior (RTX 30, RTX 40, A100, H100). El modelo depende de kernels Triton y CUDA para las capas Mamba2.
- Sí cabe en GPUs de consumo: una RTX 3060 o superior es suficiente.
- Opciones de despliegue: únicamente mediante transformers con `trust_remote_code=True`. Requiere instalar `causal-conv1d` y `mamba-ssm`. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | PIQA | ARC-Easy | HellaSwag |
|---|---|---:|---|---:|---:|---:|
| Pebble-25M | 25,7 M | 2048 | Apache 2.0 | 59,25% | 38,17% | 27,62% |
| Pebble-25M Chat | no disponible | no disponible | Apache 2.0 | 53,37% | 26,68% | 25,63% |
| Pebble-10M | no disponible | no disponible | Apache 2.0 | 58,43% | 37,29% | 26,81% |
| BananaMind-2-Mini | no disponible | no disponible | no disponible | 59,63% | 39,86% | 29,72% |

## Limitaciones y advertencias

- Modelo base: no está alineado para instrucciones ni conversación, por lo que puede generar texto no deseado o incoherente si se usa directamente sin fine-tuning.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Ventana de contexto limitada a 2048 tokens, lo que restringe el uso en documentos largos o conversaciones extensas.
- Requiere GPU con CUDA y kernels Triton; no funciona en CPU. Las dependencias `causal-conv1d` y `mamba-ssm` pueden ser difíciles de instalar en algunos entornos.
- Riesgo de alucinación presente, como en cualquier modelo de lenguaje pequeño.
- No se documentan sesgos específicos, pero al entrenarse con datos web, puede heredar sesgos de los datasets utilizados.
- La licencia Apache 2.0 permite uso comercial, pero la variante de chat también está publicada bajo la misma licencia.

## Enlaces

- HuggingFace: https://huggingface.co/basically-ai/Pebble-25M
- Variante chat: https://huggingface.co/basically-ai/Pebble-25M-Chat
