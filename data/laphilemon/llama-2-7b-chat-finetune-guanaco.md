# laphilemon/Llama-2-7b-chat-finetune-guanaco

## Resumen

Llama-2-7b-chat-finetune-guanaco es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base NousResearch/Llama-2-7b-chat-hf, publicado por el usuario laphilemon en HuggingFace. No se trata de un modelo completo con pesos independientes, sino de un checkpoint de adaptadores de bajo rango que debe combinarse con el modelo base para la inferencia. El objetivo es el ajuste de instrucciones (instruction tuning) sobre el dataset conversacional mlabonne/guanaco-llama2-1k, un subconjunto de 1.000 ejemplos en formato multi-turno.

El modelo resuelve el problema de adaptar un Llama-2-7B-Chat a un estilo conversacional específico con un coste computacional mínimo: solo se entrenan 33.554.432 parámetros (0,495% del total), lo que permite el ajuste en una única GPU NVIDIA Tesla T4 de 15 GB con un pico de VRAM de aproximadamente 4,51 GB. Es relevante como ejemplo reproducible de QLoRA aplicado a modelos de 7B y como punto de partida para quien quiera experimentar con fine-tuning eficiente en hardware consumer.

La arquitectura subyacente es un transformer decoder-only de tipo LlamaForCausalLM con 32 capas, 32 cabezas de atención y dimensión oculta de 4096. El adaptador se entrena con cuantización NF4 del modelo base, LoRA de rango 64 sobre las proyecciones q_proj y v_proj, y una longitud de contexto limitada a 512 tokens durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 32 capas, 32 cabezas de atencion, hidden dim 4096 |
| Parametros totales | 6.771.970.048 (modelo base); 33.554.432 entrenables en el adaptador (0,495%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite durante el entrenamiento); el modelo base soporta 4096 |
| Tipos de cuantizacion | NF4 (4-bit NormalFloat) para el modelo base via bitsandbytes; adaptador en float32; de-cuantizacion a float16 |
| Idiomas soportados | Ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre NousResearch/Llama-2-7b-chat-hf, un transformer decoder-only estándar de la familia Llama 2 con 32 capas, 32 cabezas de atención y dimensión oculta de 4096. La técnica empleada es QLoRA: el modelo base se cuantiza a 4-bit NormalFloat (NF4) con bitsandbytes (double-quant deshabilitado) y se de-cuantiza a float16 en tiempo de ejecución durante las operaciones GEMM, mientras que los adaptadores LoRA se mantienen en float32 para evitar underflow en los gradientes.

Los hiperparámetros del entrenamiento son: rango LoRA r=64, alpha=16 (factor de escala efectivo α/r = 0,25), dropout de 0,1, proyecciones objetivo q_proj y v_proj. Se entrena durante 1 época (250 pasos de optimización) con batch efectivo de 4 (per_device_train_batch_size=2, gradient_accumulation_steps=2), optimizador paged_adamw_32bit con paginación en CPU, learning rate pico de 2e-4, scheduler de decaimiento coseno con 3% de warm-up lineal, weight decay de 0,001 y gradient clipping de 0,3. El dataset es mlabonne/guanaco-llama2-1k, un conjunto de 1.000 ejemplos conversacionales multi-turno. El entrenamiento se ejecutó en una sola NVIDIA Tesla T4 (15 GB) con un pico de VRAM de aproximadamente 4,51 GB.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español, con retención de contexto entre turnos y terminación limpia con token EOS sin bucles repetitivos.
- Seguimiento de instrucciones (instruction following) sobre el dataset Guanaco, con pérdida final de 1,2391 y perplejidad de 3,4525.
- Generación de salida estructurada: la model card declara validación en extracción JSON zero-shot con aserciones programáticas de invariantes (nombre, edad, ubicación) y validación estricta de esquema.
- Razonamiento deductivo básico y conocimiento factual general, preservado del modelo base (ARC-Challenge, MMLU).
- Razonamiento matemático multi-paso limitado (GSM8K), con mejora marginal sobre el base.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni multi-step reasoning avanzado en la información disponible.
- No se declara modo thinking, visión ni audio en la información disponible.

## Casos de uso

- **Prototipado de asistentes conversacionales**: el adaptador puede gestionar conversaciones multi-turno con contexto de hasta 512 tokens, adecuado para demos y pruebas de concepto de chatbots de dominio acotado en inglés o español.
- **Extracción de datos estructurados**: la model card valida la generación de JSON zero-shot con esquema estricto, útil para pipelines de extracción de entidades (nombre, edad, ubicación) desde texto libre.
- **Fine-tuning eficiente en hardware consumer**: sirve como receta reproducible de QLoRA sobre Llama-2-7B con un solo T4 de 15 GB y ~4,51 GB de VRAM pico, útil para experimentar con adaptación de bajo rango sin infraestructura dedicada.
- **Investigación en instruction tuning**: el checkpoint permite estudiar el efecto de LoRA r=64 sobre q_proj y v_proj con 1.000 ejemplos, comparando pérdida y perplejidad con el modelo base.
- **Generación de texto asistida en español**: aunque el entrenamiento se centra en Guanaco (mayoritariamente inglés), el tag de idioma incluye español, por lo que puede usarse para generación de texto y respuestas conversacionales en castellano con calidad limitada.
- **Base para adaptaciones posteriores**: al ser un adaptador PEFT, puede combinarse con otros adaptadores o servir de punto de partida para fine-tunings adicionales sobre dominios específicos sin reentrenar el modelo completo.
- **Evaluación comparativa de métodos de cuantización**: permite medir el impacto de NF4 + LoRA frente a fine-tuning completo en tareas de razonamiento y matemáticas con presupuesto reducido.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en el model-index y en la model card, evaluados con EleutherAI lm-evaluation-harness frente al modelo base sin adaptar:

| Benchmark | Protocolo | Base Llama-2-7B-Chat | Checkpoint fine-tuned | Delta |
|---|---|---|---|---|
| ARC-Challenge | 25-shot | 53,1% | 53,8% | +0,7% |
| MMLU | 5-shot | 45,3% | 45,6% | +0,3% |
| GSM8K | 3-shot | 14,1% | 14,5% | +0,4% |
| TruthfulQA | 0-shot (MC2) | 38,8% | 40,2% | +1,4% |
| Training Loss | 250 pasos | 1,850 | 1,239 | -0,611 |
| Final Perplexity | exp(Loss) | 6,360 | 3,452 | -2,908 |

Progresión de pérdida durante el entrenamiento (declarada por el autor):

| Paso | Época | Training Loss | Perplexity |
|---|---|---|---|
| 25 | 0,10 | 1,5694 | 4,8038 |
| 50 | 0,20 | 1,3210 | 3,7472 |
| 100 | 0,40 | 1,3940 | 4,0310 |
| 150 | 0,60 | 1,2736 | 3,5737 |
| 200 | 0,80 | 1,3115 | 3,7118 |
| 250 (final) | 1,00 | 1,2391 | 3,4525 |

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento se realizó con ~4,51 GB de pico en una T4 de 15 GB; la inferencia con el modelo base en 4-bit NF4 más el adaptador debería situarse en un rango similar (aproximadamente 4-6 GB), aunque no se proporciona una cifra de inferencia explícita.
- GPU recomendadas: NVIDIA Tesla T4 (15 GB) es la GPU usada en el entrenamiento; cualquier GPU con al menos 8 GB de VRAM debería poder cargar el modelo base en 4-bit.
- Cabe en GPU consumer: sí, con cuantización 4-bit NF4 en tarjetas de 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: transformers + peft + bitsandbytes (receta oficial de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-2-7b-chat-finetune-guanaco | 7B (adaptador de 33,5M entrenables) | 512 (entrenamiento); 4096 (base) | Adaptador LoRA/QLoRA sobre Llama-2-7B-Chat | Apache 2.0 | HuggingFace, 45 descargas |
| NousResearch/Llama-2-7b-chat-hf | 7B | 4096 | Modelo completo chat | Llama 2 Community License | HuggingFace |
| Llama-2-7B base | 7B | 4096 | Modelo completo preentrenado | Llama 2 Community License | HuggingFace / Meta |

No se dispone de datos de benchmarks de modelos comparables adicionales en la información proporcionada. La comparativa se limita a los modelos directamente relacionados con este adaptador.

## Limitaciones y advertencias

- El adaptador se entrena con solo 1.000 ejemplos y 1 época (250 pasos), lo que limita la profundidad del ajuste y puede provocar sobreajuste al estilo de Guanaco.
- La longitud de contexto durante el entrenamiento se limita a 512 tokens; las entradas más largas pueden degradar la coherencia aunque el modelo base soporte 4096.
- Riesgo de alucinación inherente a Llama-2-7B-Chat; la mejora en TruthfulQA es marginal (+1,4%) y no elimina el problema.
- Los benchmarks declarados por el autor están marcados como no verificados (`verified: false`); deben tomarse con cautela.
- El soporte de español es declarado en los tags, pero el dataset Guanaco es mayoritariamente en inglés; la calidad en castellano puede ser inferior a la del inglés.
- Aunque la licencia del adaptador es Apache 2.0, el modelo base NousResearch/Llama-2-7b-chat-hf está sujeto a la Llama 2 Community License, cuyos términos (incluidas restricciones de uso comercial y de escala) se aplican al uso combinado.
- No se declara soporte de tool calling, agentes ni funciones avanzadas; no debe asumirse para producción.
- El repositorio tiene solo 45 descargas y 0 likes, lo que indica escasa validación comunitaria.
- Requiere cargar el modelo base por separado (no es autónomo), lo que añade complejidad de despliegue y dependencia de bitsandbytes y peft.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laphilemon/Llama-2-7b-chat-finetune-guanaco
- Modelo base: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/guanaco-llama2-1k
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
