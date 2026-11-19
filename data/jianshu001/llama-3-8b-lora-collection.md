# Jianshu001/Llama-3-8B-LoRA-Collection

## Resumen

Llama-3-8B-LoRA-Collection es una colección de diez adaptadores LoRA (Low-Rank Adaptation) entrenados por el usuario Jianshu001 sobre el modelo base meta-llama/Meta-Llama-3-8B, no sobre la variante Instruct. Cada adaptador se ha ajustado de forma independiente sobre un conjunto de datos SFT (supervised fine-tuning) abierto y ampliamente utilizado, cubriendo dominios como instrucciones generales, conversación multi-turno, razonamiento, matemáticas y código. El repositorio no contiene pesos completos del modelo, sino únicamente los adaptadores en formato PEFT/safetensors, lo que reduce el tamaño del artefacto a 1,7 GB.

El interés de esta colección es práctico: permite comparar el efecto de distintos datasets SFT sobre un mismo modelo base bajo una receta de entrenamiento homogénea (LoRA con r=16, alpha=32, una época, mismos hiperparámetros), lo que facilita análisis de transferencia y selección de adaptadores por dominio. Además, al estar empaquetados como módulos LoRA independientes, se pueden servir simultáneamente mediante vLLM con multi-LoRA, evitando duplicar el modelo base en memoria.

La colección se publicó en noviembre de 2026 y no registra descargas ni interacciones en el momento de la consulta. La licencia es la Meta Llama 3 Community License, con la particularidad de que cada adaptador hereda además las restricciones del dataset con el que fue entrenado, lo que condiciona su uso comercial (por ejemplo, el adaptador Alpaca queda bajo CC BY-NC 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con adaptadores LoRA sobre las proyecciones q, k, v, o, gate, up y down |
| Parametros totales | ~8.000 millones en el modelo base; ~42 millones entrenables por adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base Llama 3; el entrenamiento se truncó a 2.048 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (los adaptadores se distribuyen en bf16; el modelo base admite las cuantizaciones habituales de Llama 3: 4-bit, 8-bit, GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 3 está orientado principalmente a inglés, con soporte limitado de otros idiomas) |
| Licencia | llama3 (Meta Llama 3 Community License), más la licencia del dataset de cada adaptador |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3 8B, un transformer decoder-only con atención causal estándar, RoPE, normalización RMSNorm y activación SwiGLU. Sobre él se aplican adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05, dirigidos a las proyecciones q, k, v, o, gate, up y down, lo que supone aproximadamente 42 millones de parámetros entrenables por adaptador. El entrenamiento usa AdamW con learning rate 2e-4, schedule coseno, 3 % de warmup, weight decay 0, batch efectivo de 32 secuencias y longitud máxima de 2.048 tokens con truncado. La pérdida se calcula solo sobre los tokens del asistente (los del prompt están enmascarados), en precisión bf16 con gradient checkpointing sobre NVIDIA H200.

Cada adaptador se entrena durante una única época sobre un dataset distinto. Los datasets grandes se submuestrearon aleatoriamente hasta un máximo de 50.000 conversaciones con semilla 0. La evaluación se realiza sobre 500 conversaciones reservadas por dataset, nunca vistas en entrenamiento. Los diez datasets son: Alpaca (49.500 muestras), Dolly (14.488), Guanaco/OASST1 (6.874), UltraChat (49.466), WizardLM Evol-Instruct (49.485), OpenOrca (49.003), GSM8K (6.973), MetaMathQA (49.500), CodeAlpaca (19.516) y Magicoder Evol-Instruct (49.240). No se emplea RLHF ni DPO; es SFT puro. El formato de prompt es manual, ya que el modelo base carece de chat template: bloques `### User:` / `### Assistant:` delimitados por `<|begin_of_text|>` y `<|end_of_text|>`.

## Capacidades

- Generación de texto e instrucciones generales (adaptadores Alpaca, Dolly, WizardLM).
- Conversación multi-turno (adaptadores Guanaco y UltraChat).
- Razonamiento paso a paso y explicaciones (adaptador OpenOrca, con trazas de GPT-4/GPT-3.5).
- Matemáticas de nivel escolar y razonamiento aritmético (adaptadores GSM8K y MetaMath, con soluciones paso a paso y razonamiento inverso).
- Generación y edición de código (adaptadores CodeAlpaca y Magicoder).
- Instrucciones complejas de dificultad creciente (WizardLM Evol-Instruct).
- Capacidad de conmutar entre dominios cargando el adaptador correspondiente sobre el mismo modelo base.
- Soporte de tool calling / function calling: no disponible (no se entrena ni documenta).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible como capacidad nativa.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Selección de adaptador por dominio en producción: cargar el adaptador de matemáticas o de código según la consulta mediante multi-LoRA en vLLM, manteniendo un único modelo base en memoria y reduciendo el coste de servir varios especialistas.
- Asistente de resolución de problemas matemáticos: el adaptador GSM8K reduce la pérdida de evaluación de 1,261 a 0,464 (63 %) y el de MetaMath de 0,671 a 0,186 (72 %), lo que lo hace adecuado para tutores automáticos de aritmética escolar con explicaciones paso a paso.
- Generación de código en pipelines internos: el adaptador Magicoder, entrenado sobre instrucciones de código decontaminadas, sirve para autocompletar funciones y generar tests en herramientas de desarrollo, siempre que se respete la licencia Apache 2.0 del dataset.
- Chat multi-turno para atención al cliente: el adaptador UltraChat (MIT) está entrenado sobre diálogos filtrados de ChatGPT y es el más permisivo en términos de licencia, adecuado para prototipos de conversación con contexto de hasta 2.048 tokens efectivos.
- Experimentación académica sobre SFT: la receta homogénea permite aislar el efecto del dataset sobre el rendimiento, útil para estudiar transferencia entre dominios y calidad de datos.
- Ajuste incremental sobre dominio propio: al ser adaptadores LoRA de rango 16, se pueden combinar o continuar entrenando con datos propios sin tocar los pesos base, partiendo de un adaptador ya especializado.
- Evaluación de robustez ante instrucciones complejas: el adaptador WizardLM Evol-Instruct, con la mayor reducción de pérdida relativa en instrucciones (23 %), sirve para probar la capacidad del modelo base de seguir instrucciones anidadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K accuracy) en la información disponible. El autor solo reporta pérdida de evaluación sobre 500 conversaciones reservadas por dataset:

| Adaptador | Dataset | Pérdida base → LoRA | Reducción |
|---|---|---|---|
| alpaca | tatsu-lab/alpaca | 1,503 → 1,059 | 30 % |
| dolly | databricks-dolly-15k | 1,717 → 1,508 | 12 % |
| guanaco | openassistant-guanaco | 1,281 → 1,182 | 8 % |
| ultrachat | UltraChat 200k | 0,994 → 0,887 | 11 % |
| wizardlm | WizardLM Evol-Instruct 70k | 0,716 → 0,550 | 23 % |
| openorca | OpenOrca | 1,272 → 0,881 | 31 % |
| gsm8k | openai/gsm8k | 1,261 → 0,464 | 63 % |
| metamath | MetaMathQA | 0,671 → 0,186 | 72 % |
| codealpaca | CodeAlpaca-20k | 0,830 → 0,490 | 41 % |
| magicoder | Magicoder Evol-Instruct 110K | 1,125 → 0,966 | 14 % |

Estas cifras miden ajuste al estilo del dataset, no calidad absoluta; no son comparables con métricas de benchmarks externos.

## Requisitos de hardware

- VRAM para el modelo base en bf16: aproximadamente 16 GB de pesos, más KV cache; en la práctica se recomiendan 24 GB o más para contexto completo de 8.192 tokens.
- VRAM con cuantización 4-bit (GPTQ/AWQ/GGUF Q4): en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB.
- Cada adaptador LoRA añade ~42 millones de parámetros (~84 MB en bf16), insignificante frente al modelo base.
- GPUs recomendadas: H100, H200 o A100 80 GB para entrenamiento y serving de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 para inferencia en bf16 con contexto moderado; RTX 4060 Ti 16 GB o superiores para cuantización 4-bit.
- Cabe en GPU consumer: sí, con cuantización; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: transformers + PEFT (referencia del autor), vLLM con `--enable-lora --max-lora-rank 16` para multi-LoRA, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B-LoRA-Collection | 8B + 10 LoRA de ~42M | 8.192 (entrenado a 2.048) | Adaptadores SFT por dominio | Llama 3 + licencia de dataset | Hugging Face, 0 descargas |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | Modelo instruido completo (SFT + RLHF) | Llama 3 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7B | 32.768 | Modelo instruido completo | Apache 2.0 | Hugging Face |
| Zephyr-7B-beta | 7B | 32.768 | Modelo instruido con DPO | MIT | Hugging Face |

Frente a un modelo instruido completo, esta colección ofrece especialización por dominio y menor huella de almacenamiento, pero carece de alineamiento por RLHF/DPO y de chat template nativo. Frente a Mistral o Zephyr, la ventaja es la modularidad; la desventaja, la licencia Llama 3 y la dependencia del modelo base.

## Limitaciones y advertencias

- No es un modelo instruido: el base Llama 3 no tiene chat template, y el formato `### User:` / `### Assistant:` debe respetarse manualmente; un uso incorrecto degrada la calidad.
- Entrenamiento de una sola época y sin RLHF/DPO: la alineación con preferencias humanas es limitada y el riesgo de respuestas inseguras o fuera de tono es mayor que en Instruct.
- Riesgo de alucinación: los adaptadores de matemáticas y razonamiento pueden producir cadenas plausibles pero incorrectas; la pérdida de evaluación no garantiza exactitud.
- Contexto efectivo reducido: aunque el modelo base soporta 8.192 tokens, el entrenamiento truncó a 2.048, por lo que el rendimiento más allá de esa longitud no está validado.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado al inglés y los datasets son mayoritariamente en inglés.
- Licencia: Meta Llama 3 Community License más la licencia del dataset. El adaptador Alpaca hereda CC BY-NC 4.0 (no comercial); los datasets generados con modelos de OpenAI están sujetos además a los términos de OpenAI.
- Repositorio sin descargas ni validación de la comunidad: no hay evidencia externa de calidad ni de reproducibilidad de las pérdidas reportadas.
- Sesgos: heredados del modelo base y de los datasets SFT (Alpaca, Dolly, UltraChat, etc.), con posible sobrerrepresentación de estilos y perspectivas de los generadores originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jianshu001/Llama-3-8B-LoRA-Collection
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset Dolly: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Guanaco/OASST1: https://huggingface.co/datasets/timdettmers/openassistant-guanaco
- Dataset UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset WizardLM Evol-Instruct: https://huggingface.co/datasets/WizardLMTeam/WizardLM_evol_instruct_70k
- Dataset OpenOrca: https://huggingface.co/datasets/Open-Orca/OpenOrca
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset CodeAlpaca: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset Magicoder Evol-Instruct: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
