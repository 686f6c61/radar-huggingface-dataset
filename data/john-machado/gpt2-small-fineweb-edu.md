# John-Machado/gpt2-small-fineweb-edu

## Resumen

GPT-2 small fine-tuned desde cero sobre FineWeb-Edu es una reproducción independiente del GPT-2 small de OpenAI (Radford et al., 2019), entrenada con pesos aleatorios por John Machado sobre 9.850 millones de tokens del subconjunto `sample-10BT` del dataset FineWeb-Edu de Hugging Face. El modelo mantiene la arquitectura original intacta (12 capas, 768 dimensiones, 12 cabezas de atención, contexto de 1024 tokens, embeddings atados) con 124.439.808 parámetros, pero sustituye el corpus WebText original por texto educativo web moderno, lo que produce un modelo con un estilo de escritura más enciclopédico y didáctico.

La relevancia de esta ficha no está en el rendimiento absoluto —es un modelo base de 124M parámetros, no un asistente— sino en su valor como referencia reproducible: todo el pipeline (tokenización, bucle de entrenamiento, comparación con el GPT-2 original) está publicado con código legible escrito a mano en PyTorch. Sobre los mismos 99.631.104 tokens de validación de FineWeb-Edu, alcanza una pérdida de 3,0548 (perplejidad 21,2) frente a 3,2975 (perplejidad 27,0) del GPT-2 small de OpenAI, una mejora del 7,4 % en pérdida atribuible al corpus de entrenamiento más que a cambios arquitectónicos.

Es, por tanto, un modelo útil para experimentación educativa, ablaciones de datos y como baseline ligero de generación de texto en inglés, no para despliegues en producción que requieran instrucciones, tool calling o hechos fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 768 de ancho, 12 cabezas, embeddings atados) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16/fp32 es convertible a GGUF/INT8/INT4 con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 small canónico sin modificaciones: 12 bloques transformer decoder-only con atención multi-cabeza estándar (no hay atención lineal, ni MoE, ni capas SSM), normalización previa a la atención y a la MLP, activación GELU y embeddings de token y posición atados a la proyección de salida. El tokenizador es el BPE de GPT-2 original (vocabulario de 50.257 tokens). No hay innovaciones arquitectónicas: el valor del modelo está en la reproducibilidad del entrenamiento.

El entrenamiento consumió 9.854.302.149 tokens de FineWeb-Edu `sample-10BT` (revisión `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`), leídos una sola vez y en orden, en 18.794 pasos de 524.288 tokens cada uno (micro-batch 16 × acumulación 32 × 1024). Optimizador AdamW con betas (0,9; 0,95), weight decay 0,1 solo sobre pesos 2-D y recorte de norma de gradiente a 1,0. Learning rate con warmup lineal de 715 pasos hasta 6e-4 y decaimiento coseno hasta 6e-5, siguiendo los hiperparámetros del modelo de 125M del paper de GPT-3. Sin dropout (0,0). Precisión bf16 con autocast, TF32, atención fusionada vía `torch.nn.functional.scaled_dot_product_attention` (FlashAttention) y `torch.compile`. Todo el entrenamiento se ejecutó en una única NVIDIA A100 de 40 GB en Google Colab Pro+ durante 15,6 horas a ~176.000 tokens/s, con una pérdida final de entrenamiento de ~3,0 y de validación de 3,0113 en la comprobación intra-entrenamiento (primeros 327.680 tokens reservados). No se aplicó RLHF, DPO ni ningún tipo de ajuste por instrucciones: es un modelo base puro.

## Capacidades

- Generación de texto autocompletivo en inglés con estilo de página web educativa (enciclopédico, expositivo).
- Continuación de prompts cortos con coherencia local de varias frases; mantiene tema y registro durante decenas de tokens.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus ingleses, útil como baseline de evaluación.
- Capacidad limitada de "conocimiento factual" memorizado del corpus FineWeb-Edu, con alta tasa de invención de detalles.
- No soporta tool calling ni function calling: no ha sido entrenado con formato de herramientas ni con datos de instrucciones.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No dispone de visión, audio ni modalidades adicionales.
- Multilingüismo prácticamente nulo: el tokenizador GPT-2 y el corpus son ingleses; el rendimiento en otros idiomas es marginal.
- No soporta system prompts ni plantillas de chat; cualquier uso conversacional requiere envolver el texto manualmente.

## Casos de uso

- **Experimentación educativa y docencia:** sirve para ilustrar el ciclo completo de entrenamiento de un transformer (tokenización, bucle, evaluación de perplejidad) con un coste de cómputo accesible (15,6 horas en una A100, o varias decenas de horas en GPUs consumer), ya que el código del repositorio está escrito para ser leído.
- **Baseline de ablaciones de datos:** al estar entrenado sobre un corpus público con revisión fijada y métricas publicadas (pérdida 3,0548 / perplejidad 21,2 sobre los 99,6M tokens de validación), permite comparar el efecto de cambiar el corpus, el tokenizador o los hiperparámetros manteniendo el resto constante.
- **Generación de texto de relleno o sintético en inglés:** para crear párrafos de estilo didáctico en prototipos de interfaz, tests de pipelines de NLP o aumentación de datos de baja exigencia factual, donde la fluidez importa más que la veracidad.
- **Evaluación de técnicas de inferencia:** al ser un modelo pequeño y rápido, es adecuado para medir el impacto de `top_k`, `top_p`, temperatura, decodificación especulativa o cuantización sobre la calidad y la latencia sin incurrir en costes elevados.
- **Fine-tuning ligero sobre dominio específico:** sus 124M parámetros permiten ajuste completo o LoRA en una sola GPU consumer (12–24 GB) para tareas de clasificación, generación de resúmenes cortos o estilo, partiendo de un modelo ya adaptado a texto educativo.
- **Investigación sobre sesgos y alucinación en modelos pequeños:** la model card documenta errores sistemáticos reproducibles (confusión de capitales como Montreal por Ottawa o Sídney por Canberra), lo que lo convierte en un sujeto controlado para estudiar cómo surgen estos patrones y compararlos con el GPT-2 original.
- **Despliegue en entornos con recursos muy limitados:** con cuantización INT8 o INT4 cabe en CPU y en GPUs de gama baja, permitiendo servir generación de texto en inglés con latencia aceptable en dispositivos edge.

## Benchmarks y rendimiento

El autor solo publica la comparación de pérdida de validación y perplejidad sobre el 1 % reservado de FineWeb-Edu (99.631.104 tokens). No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Modelo | Pérdida de validación | Perplejidad | Corpus de evaluación |
|---|---|---|---|
| gpt2-small-fineweb-edu (este modelo) | 3,0548 | 21,2 | FineWeb-Edu held-out, 99.631.104 tokens |
| OpenAI GPT-2 small (`gpt2`, 2019) | 3,2975 | 27,0 | FineWeb-Edu held-out, 99.631.104 tokens |

Ambos modelos se evaluaron sobre exactamente el mismo conjunto de tokens. El autor advierte que FineWeb-Edu es el dominio de entrenamiento de este modelo, mientras que el GPT-2 original se entrenó sobre WebText, por lo que la comparación favorece al modelo nuevo y no es representativa de un rendimiento general.

## Requisitos de hardware

- **VRAM para inferencia en fp32:** ~500 MB de pesos; en bf16/fp16 ~250 MB; en INT8 ~125 MB; en INT4 ~65 MB. El cuello de botella real es el estado de activaciones y la caché KV, no los pesos.
- **GPU recomendadas:** cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema; también funciona en CPU (x86 o ARM) con `llama.cpp` o PyTorch.
- **Cabe en GPU consumer:** sí, en todas las GPU consumer modernas, incluidas iGPU con suficiente memoria compartida y placas como Raspberry Pi 5 en cuantización INT4.
- **Opciones de despliegue:** `transformers` (referencia del autor), `text-generation-inference` (etiqueta `endpoints_compatible` en el repo), `vLLM`, `llama.cpp`/`Ollama` previa conversión a GGUF, y `optimum` para ONNX Runtime.
- **Latencia y throughput:** no se publican cifras de inferencia. Como referencia orientativa del entrenamiento, el autor reporta ~176.000 tokens/s en una A100 40GB con bf16 y `torch.compile`; el throughput de generación en inferencia será muy superior en tokens/s por la ausencia de retropropagación, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-small-fineweb-edu | 124,4M | 1024 | MIT | Pérdida 3,0548 / PPL 21,2 en FineWeb-Edu held-out | Hugging Face, safetensors |
| OpenAI GPT-2 small (`gpt2`) | 124M | 1024 | MIT | Pérdida 3,2975 / PPL 27,0 en el mismo conjunto | Hugging Face, safetensors |
| GPT-2 medium (`gpt2-medium`) | 355M | 1024 | MIT | No evaluado en el mismo conjunto en la información disponible | Hugging Face |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | No comparable directamente (destilado de GPT-2, sin métricas en FineWeb-Edu) | Hugging Face |

La comparación más significativa es con el GPT-2 small original: misma arquitectura y mismo número de parámetros, con una mejora del 7,4 % en pérdida de validación sobre el dominio de FineWeb-Edu. Frente a modelos más pequeños como DistilGPT-2 o más grandes como GPT-2 medium, no hay datos de benchmarks comunes en la información proporcionada.

## Limitaciones y advertencias

- **Es un modelo base, no un asistente:** no está ajustado por instrucciones ni por preferencias humanas; no responde preguntas de forma fiable y no debe usarse como chatbot sin un fine-tuning posterior.
- **Alta tasa de alucinación factual:** el autor documenta invenciones sistemáticas, incluida la confusión de capitales (Montreal por Ottawa, Sídney por Canberra), heredadas del comportamiento del GPT-2 original. No es una fuente de hechos.
- **Sesgos del corpus:** entrenado sobre texto web educativo de Common Crawl, puede reflejar sesgos de género, culturales, geográficos y de representación presentes en FineWeb-Edu. No se han publicado evaluaciones de sesgo.
- **Solo inglés:** el tokenizador GPT-2 y el corpus son ingleses; el rendimiento en castellano u otros idiomas es marginal y no debe asumirse.
- **Contexto corto:** 1024 tokens limitan tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- **Licencia permisiva pero con obligaciones sobre los datos:** los pesos son MIT, lo que permite uso comercial sin restricciones adicionales, pero el corpus FineWeb-Edu está bajo ODC-By 1.0 y sujeto a los términos de uso de Common Crawl; conviene revisar esas condiciones si se redistribuye el modelo como parte de un producto.
- **Sin garantías de calidad en producción:** no hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados, ni evaluaciones de robustez, toxicidad o seguridad. Para producción seria se recomienda un modelo mayor o un fine-tuning específico con evaluación propia.
- **Fecha del modelo:** la model card indica creación en octubre de 2026 y actualización en noviembre de 2026; verificar la vigencia de las revisiones del dataset y del repositorio antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/John-Machado/gpt2-small-fineweb-edu
- Repositorio de código (GPT-2 escrito desde cero en PyTorch): https://github.com/JohnMachado11/GPT-2
- Blog del autor sobre el entrenamiento: https://johnmachado.dev/blog/how-i-trained-gpt2-small/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper original de GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Paper de GPT-3 (hiperparámetros de referencia para el modelo de 125M): https://arxiv.org/abs/2005.14165
