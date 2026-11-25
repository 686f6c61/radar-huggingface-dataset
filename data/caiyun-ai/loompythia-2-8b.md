# Caiyun-AI/LoomPythia-2.8B

## Resumen

LoomPythia-2.8B es un modelo de lenguaje causal de 2.775.190.944 parámetros desarrollado por Caiyun-AI que introduce un mecanismo de atención novedoso denominado *loom attention*. El modelo se entrena desde cero sobre 300.000 millones de tokens del dataset Pile, replicando exactamente la receta de entrenamiento y el tokenizador de EleutherAI/pythia-2.8b, lo que permite una comparación directa y controlada con la familia Pythia. Su relevancia radica en que, con un coste computacional apenas un 1,95 % superior en FLOPs de forward respecto a Pythia-2.8B, iguala a Pythia-12B en precisión 0-shot y lo supera en 5-shot en diez benchmarks del LM Evaluation Harness.

La arquitectura parte de un Transformer estilo Pythia de 32 capas con dimensión oculta de 2560, 32 cabezas de atención de dimensión 80, y añade un flujo de memoria matricial por token de 64x80 que permite a cada cabeza componer dinámicamente sus proyecciones de query, key y value mediante atención vertical sobre las salidas de cabezas anteriores. El contexto máximo es de 2048 tokens, la licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors con código personalizado (`trust_remote_code=True`).

El modelo está pensado para investigación en arquitecturas de atención y para escenarios de generación de texto en inglés donde se quiera una alternativa eficiente a modelos de mayor tamaño. No incorpora ajuste por instrucciones ni alineación mediante RLHF, por lo que su uso en producción requiere etapas adicionales de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con loom attention (atención vertical sobre memoria matricial por token + atención horizontal causal) |
| Parametros totales | 2.775.190.944 (2,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

LoomPythia-2.8B es un Transformer decoder-only de 32 capas con `hidden_size` 2560, 32 cabezas de atención de dimensión 80, `intermediate_size` de 7808 en las capas 0 a 30 y 9984 en la capa 31, y un `ffn_m_dim` de 2944 en las capas 0 a 30. La innovación principal es la *loom attention*: cada token mantiene un flujo de memoria matricial `M_t` de 64x80 (64 slots de `d_k`) donde se almacenan las salidas de cabezas anteriores. Antes de realizar la atención horizontal causal estándar sobre tokens, cada cabeza ejecuta operaciones `MRead`/`MWrite` de atención vertical sobre esa memoria para componer dinámicamente sus proyecciones de query, key, value y un bypass local de salida. Se emplean 20 coordenadas RoPE por cabeza (sobre un ancho total de Q/K de 100) y `QKNorm` a nivel de cabeza completa. Existe un cuello de botella compartido de ancho `d_r = 640`.

El entrenamiento replica la receta de Pythia-2.8B: 300.000 millones de tokens del dataset Pile, tokenizador GPT-NeoX-20B con vocabulario de 50304, y presumiblemente el mismo esquema de learning rate y batch. El modelo se entrena en JAX y se distribuye con kernels de inferencia rápida en PyTorch/Triton (fused kernels y `torch.compile` con CUDA graphs). No se menciona RLHF, DPO ni ajuste por instrucciones en la información disponible.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Razonamiento de sentido común y comprensión lectora (evaluado en PIQA, WinoGrande, ARC-Easy, ARC-C, BoolQ, HellaSwag, RACE).
- Conocimiento factual y científico a nivel de benchmark (SciQ, LAMBADA).
- Modelado de lenguaje puro (perplejidad en Pile y FLAN).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No dispone de modo *thinking*, visión ni audio.
- No es un modelo ajustado por instrucciones; funciona como modelo base.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo sirve como referencia reproducible para estudiar el impacto de la loom attention frente a la atención estándar, ya que comparte tokenizador, dataset y receta con Pythia-2.8B.
- Modelado de lenguaje y evaluación de perplejidad: útil para medir la calidad de representaciones lingüísticas en Pile y FLAN con un coste de 2,78B de parámetros, comparable a modelos tres veces mayores.
- Base para fine-tuning supervisado: al ser un modelo base con licencia Apache 2.0, puede ajustarse para tareas downstream (clasificación, extracción, resumen) partiendo de un checkpoint eficiente.
- Generación de texto en inglés en entornos con restricciones de VRAM: con 2,78B de parámetros cabe en GPUs de consumo tras cuantización, ofreciendo calidad cercana a modelos de 12B en tareas de sentido común.
- Destilación y experimentación académica: su receta abierta y su comparación controlada con Pythia lo hacen adecuado para estudios de escalado y de mecanismos de memoria en Transformers.
- Prototipado de pipelines de generación con `transformers`: el quickstart con `trust_remote_code=True` permite integrarlo rápidamente en notebooks y scripts de evaluación con el LM Evaluation Harness.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (columnas individuales en 0-shot; última columna promedio 0-shot / 5-shot en 10 tareas):

| Modelo | Params | Pile ppl ↓ | FLAN ppl ↓ | LAMBADA | PIQA | WinoGrande | ARC-E | ARC-C | SciQ | BoolQ | HellaSwag | RACE-M | RACE-H | Avg 0-shot / 5-shot ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pythia-2.8B | 2,78B | 6,63 | 8,16 | 64,7 | 73,9 | 59,4 | 64,4 | 29,5 | 88,2 | 64,5 | 45,4 | 38,1 | 34,9 | 56,3 / 57,3 |
| Pythia-6.9B | 6,86B | 6,29 | 7,85 | 67,3 | 75,2 | 60,9 | 67,3 | 31,3 | 89,7 | 63,7 | 48,0 | 40,6 | 37,0 | 58,1 / 59,3 |
| mHC-Pythia-2.8B | 2,78B | 6,24 | 7,35 | 68,5 | 74,4 | 62,8 | 67,1 | 30,7 | 90,5 | 66,9 | 47,5 | 42,3 | 37,0 | 58,8 / 59,9 |
| Pythia-12B | 11,85B | 6,01 | 7,26 | 70,5 | 76,0 | 63,9 | 70,2 | 31,8 | 90,2 | 67,4 | 50,3 | 40,6 | 38,3 | 59,9 / 60,8 |
| LoomPythia-2.8B | 2,78B | 6,02 | 6,94 | 71,8 | 74,7 | 63,7 | 68,5 | 31,7 | 92,4 | 65,8 | 49,1 | 42,3 | 39,0 | 59,9 / 61,6 |

LoomPythia-2.8B iguala a Pythia-12B en promedio 0-shot (59,9) y lo supera en 5-shot (61,6 frente a 60,8), con solo un 1,95 % más de FLOPs de forward que Pythia-2.8B.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8-10 GB.
- En cuantización de 8 bits cabría en torno a 3 GB de pesos; en 4 bits, alrededor de 1,5 GB, aunque el autor no publica checkpoints cuantizados oficiales.
- GPU recomendadas para despliegue en bf16: A100, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPUs de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB tras cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte oficial), y kernels rápidos en PyTorch/Triton con `torch.compile` y CUDA graphs según el repositorio GitHub. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Avg 0-shot / 5-shot | Disponibilidad |
|---|---:|---:|---|---:|---|
| LoomPythia-2.8B | 2,78B | 2048 | Apache 2.0 | 59,9 / 61,6 | Hugging Face (custom_code) |
| Pythia-2.8B | 2,78B | 2048 | Apache 2.0 | 56,3 / 57,3 | Hugging Face |
| mHC-Pythia-2.8B | 2,78B | 2048 | no disponible | 58,8 / 59,9 | Hugging Face |
| Pythia-12B | 11,85B | 2048 | Apache 2.0 | 59,9 / 60,8 | Hugging Face |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineación (sin RLHF/DPO documentado): no es adecuado para uso conversacional directo sin fine-tuning.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Contexto limitado a 2048 tokens, inferior al de modelos contemporáneos con ventanas de 8K-128K.
- Riesgo de alucinación y de generar contenido sesgado heredado del dataset Pile, sin filtros de seguridad documentados.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de ejecutarlo en producción.
- La loom attention no está soportada de forma nativa por los runtimes de inferencia estándar (vLLM, llama.cpp, TGI); el despliegue de alto rendimiento depende de los kernels Triton del repositorio del autor.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base la responsabilidad sobre el comportamiento en producción recae en quien lo ajuste y despliegue.
- Los benchmarks reportados provienen del propio autor; no se dispone de evaluaciones independientes en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Caiyun-AI/LoomPythia-2.8B
- Paper: https://arxiv.org/abs/2611.30634
- Repositorio de código (JAX training + PyTorch/Triton inference): https://github.com/Caiyun-AI/LoomFormer
- Inferencia rápida en PyTorch: https://github.com/Caiyun-AI/LoomFormer/tree/main/pytorch
- Modelo de comparación mHC-Pythia-2.8B: https://huggingface.co/Caiyun-AI/mHC-Pythia-2.8B
- Modelo de referencia Pythia-2.8B: https://huggingface.co/EleutherAI/pythia-2.8b
- Modelo de referencia Pythia-6.9B: https://huggingface.co/EleutherAI/pythia-6.9b
- Modelo de referencia Pythia-12B: https://huggingface.co/EleutherAI/pythia-12b
