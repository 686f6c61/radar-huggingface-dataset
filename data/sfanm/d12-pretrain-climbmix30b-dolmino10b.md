# sfanm/d12-pretrain-climbmix30B-dolmino10B

## Resumen

El modelo `sfanm/d12-pretrain-climbmix30B-dolmino10B` es un checkpoint de preentrenamiento de 124 millones de parámetros, desarrollado por el usuario sfanm, que forma parte de la familia D12 v2. Se trata de un modelo de lenguaje base (sin ajuste por instrucciones ni chat) entrenado desde cero sobre una mezcla de 40 mil millones de tokens, compuesta por un 75 % de ClimbMix (texto web a gran escala) y un 25 % de Dolmino (la mezcla de mid-training de OLMo-3). El objetivo es explorar el comportamiento de modelos pequeños con recetas de datos de alta calidad y escalado de tokens, sirviendo como punto de referencia para comparar el efecto de duplicar la cantidad de datos de entrenamiento respecto a su predecesor de 20B tokens.

La arquitectura es un transformer decoder con 12 capas, hidden size de 768, atención multi-cabeza (12 cabezas) y FFN SwiGLU de 2048 unidades, con tokenizer GPT-2 BPE y contexto de 2048 tokens. Los pesos se publican en BF16 y el modelo es cargable mediante la clase `LlamaForCausalLM` de Transformers, aunque no es un checkpoint de la familia Llama, sino un modelo entrenado desde cero con tokenizer GPT-2. El entrenamiento se realizó en 16 nodos con 4 A100-40GB cada uno (ALCF Polaris) en aproximadamente 4,6 horas, usando Megatron-Bridge.

La relevancia de este modelo radica en su carácter experimental y reproducible: al ser pequeño (124M) y entrenado con una receta de datos pública y documentada, permite estudiar el impacto de la mezcla de datos y la escala de tokens en modelos de tamaño reducido, así como servir de base para fine-tuning en tareas específicas. No ha pasado por alineamiento de seguridad ni evaluación exhaustiva, por lo que su uso en producción requiere precaución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (LlamaForCausalLM) |
| Parametros totales | 123.587.328 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | BF16 (publicado); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Inglés (tokenizer GPT-2 BPE) |
| Licencia | other (revisar términos específicos en el repositorio) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estándar con 12 capas, hidden size 768, 12 cabezas de atención (MHA, head dim 64), FFN de 2048 con activación SwiGLU/SiLU, normalización RMSNorm, embeddings atados y codificación posicional RoPE con theta 10.000. El tokenizer es GPT-2 BPE con vocabulario ampliado a 50.304 tokens (los ids 50257–50303 son padding y nunca aparecen en los datos). Aunque la clase de Transformers es `LlamaForCausalLM`, se trata de un modelo entrenado desde cero, no un checkpoint de Llama.

El entrenamiento se realizó sobre una mezcla de dos corpus tokenizados con el tokenizer GPT-2 y muestreados a nivel de token: ClimbMix (una tokenización de 100B tokens de `karpathy/climbmix-400b-shuffle`, de la que se usaron 30.0B tokens) y Dolmino (`allenai/dolma3_dolmino_mix-100B-1025`, de la que se usaron 10.0B tokens). La proporción fue 75/25 en cada batch, y cada documento termina con un token `<|endoftext|>` (id 50256). No se usó token de inicio de secuencia. El total fue de 40.000.028.672 tokens, distribuidos en 76.294 iteraciones con batch global de 256 y secuencia de 2048.

El optimizador fue AdamW (β 0.9/0.95, ε 1e-8) con LR pico de 6e-4, weight decay 0.1 y gradiente clip 1.0. El schedule es WSD (warmup-stable-decay): 200 pasos de warmup, fase constante hasta la iteración 61.035, y luego un cooldown coseno de 15.259 pasos hasta 6e-5. La pérdida final en el split de validación fue 2.4573 (perplejidad 11.7) y en test 2.5267 (perplejidad 12.5), frente a 2.5535/2.5690 del modelo de 20B tokens. El entrenamiento se ejecutó con Megatron-Bridge (NeMo 26.04) en 16 nodos × 4 A100-40GB, en unas 4,6 horas.

## Capacidades

- Generación de texto autoregresiva: completado de texto, continuación de secuencias y generación libre en inglés.
- Modelo base sin chat template: no soporta diálogo estructurado ni instrucciones por defecto; requiere fine-tuning o prompting específico para tareas.
- Razonamiento básico y modelado de lenguaje: al ser un modelo pequeño, su capacidad de razonamiento complejo es limitada, pero puede manejar tareas simples de lenguaje.
- Sin soporte de tool calling ni function calling: no está entrenado para invocar herramientas.
- Sin capacidades de agentes ni multi-step reasoning: no hay evidencia de entrenamiento específico para ello.
- Multilingüe limitado: solo inglés (tokenizer GPT-2), aunque puede procesar otros idiomas con menor calidad.
- Sin capacidades multimodales: solo texto.

## Casos de uso

- Experimentación educativa e investigación: ideal para estudiar el efecto de la mezcla de datos y la escala de tokens en modelos pequeños; su tamaño permite entrenar y evaluar rápidamente en una sola GPU.
- Fine-tuning para tareas específicas de NLP: al ser un modelo base, puede ajustarse para clasificación de texto, análisis de sentimiento, extracción de entidades o generación de texto en dominios concretos (por ejemplo, artículos técnicos o documentación).
- Prototipado de aplicaciones de generación de texto: para validar ideas de producto que requieran un modelo ligero y rápido, como autocompletado de formularios o sugerencias de escritura en inglés.
- Benchmarking de infraestructura: su pequeño tamaño lo hace útil para probar pipelines de inferencia (vLLM, llama.cpp, TGI) y medir latencia/throughput en hardware variado.
- Generación de datos sintéticos: puede usarse para crear ejemplos de texto en inglés para aumentar datasets de entrenamiento, aunque con supervisión humana para controlar calidad.
- Estudio de perplejidad y métricas de lenguaje: sirve como referencia para comparar recetas de preentrenamiento, ya que se publican pérdidas y perplejidad en splits de validación y test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta la pérdida de lenguaje y perplejidad en los splits de validación y test:

| Métrica | Valor |
|---|---|
| Pérdida en validación (mixed) | 2.4573 |
| Perplejidad en validación | 11.7 |
| Pérdida en test | 2.5267 |
| Perplejidad en test | 12.5 |
| Pérdida del modelo de 20B (validación) | 2.5535 |
| Pérdida del modelo de 20B (test) | 2.5690 |

Estos valores indican una mejora al duplicar los datos de entrenamiento (de 20B a 40B tokens), pero no hay comparación con otros modelos de la misma escala.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 123,6M parámetros en BF16, lo que ocupa aproximadamente 247 MB en pesos. Con overhead de activaciones y KV cache, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU consumer (incluso en CPUs con suficiente RAM).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo sin problemas. Para entrenamiento, se usaron A100-40GB, pero fine-tuning es posible en GPUs de 8-12 GB.
- Opciones de despliegue: compatible con Transformers (carga directa), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), y TGI. Al ser un modelo pequeño, la latencia es muy baja (del orden de milisegundos por token en GPU moderna).
- Throughput estimado: no se proporcionan datos oficiales, pero por su tamaño se espera un throughput alto (cientos de tokens por segundo en GPUs consumer).

## Comparativa con modelos similares

El punto de comparación natural es el modelo hermano `sfanm/d12-pretrain-climbmix15B-dolmino5B`, que usa la misma arquitectura y receta pero con la mitad de datos (20B tokens). También se puede comparar con GPT-2 small (124M) como referencia de la misma escala, aunque no se dispone de métricas directas.

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Pérdida en test | Licencia |
|---|---|---|---|---|---|
| sfanm/d12-pretrain-climbmix30B-dolmino10B | 123,6M | 2.048 | 40B tokens (75% ClimbMix, 25% Dolmino) | 2.5267 | other |
| sfanm/d12-pretrain-climbmix15B-dolmino5B | 123,6M | 2.048 | 20B tokens (75% ClimbMix, 25% Dolmino) | 2.5690 | other |
| GPT-2 small (referencia) | 124M | 1.024 | 40B tokens (WebText) | no disponible | MIT |

No se dispone de comparativas con otros modelos de 124M en benchmarks estándar.

## Limitaciones y advertencias

- Modelo base sin alineamiento de seguridad: no ha pasado por RLHF ni ajuste por instrucciones, por lo que puede generar contenido sesgado, tóxico o no deseado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en tareas de razonamiento o factualidad.
- Contexto limitado: ventana de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés: el tokenizer GPT-2 está optimizado para inglés; otros idiomas tendrán peor rendimiento.
- Licencia "other": los términos exactos no están especificados en la model card; se debe revisar el repositorio y las licencias de los datos upstream (ClimbMix, Dolmino) antes de uso comercial o redistribución.
- Sin evaluación exhaustiva: el autor indica que no se ha realizado una evaluación completa; los únicos datos son pérdida y perplejidad.
- No apto para producción directa: requiere fine-tuning y evaluación adicional para cualquier aplicación real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sfanm/d12-pretrain-climbmix30B-dolmino10B
- Modelo hermano (20B tokens): https://huggingface.co/sfanm/d12-pretrain-climbmix15B-dolmino5B
- Dataset ClimbMix (karpathy/climbmix-400b-shuffle): https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset Dolmino (allenai/dolma3_dolmino_mix-100B-1025): https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1025
