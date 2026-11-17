# aramkris/fineweb-edu-124m-base

## Resumen

FineWeb-Edu 124M base (stage 2) es un modelo de lenguaje tipo GPT de 124 millones de parámetros entrenado desde cero por el desarrollador independiente aramkris en el proyecto tinystories-ARM-model. Se trata de un transformer decoder-only con arquitectura propia escrita a mano (12 capas, dimensión 768, 12 cabezas de atención, RoPE, SwiGLU, QK-norm y tokenizador de GPT-2), pensado como ejercicio de ingeniería reproducible y como modelo base de una familia de variantes (chat con SFT, chat con SFT+DPO y un modelo de difusión enmascarada del mismo tamaño).

El modelo se entrena sobre 2.500 millones de tokens procedentes de Mini FineWeb-Edu (completo) más subconjuntos de Cosmopedia (stories, WikiHow, OpenStax, Stanford y Khan Academy), con 152.600 actualizaciones. Su relevancia es fundamentalmente didáctica y de investigación: demuestra que un modelo pequeño entrenado en hardware de consumo (un Mac y GPUs de Colab) puede igualar o superar ligeramente a GPT-2 small en algunas tareas de sentido común y comprensión lectora, aunque queda por detrás en otras.

No es un modelo pensado para producción ni para uso comercial serio: su licencia MIT lo permite, pero su ventana de contexto de 512 tokens, su conocimiento factual limitado y su tendencia a repetirse con decodificación greedy lo restringen a experimentación, docencia y prototipado de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 12 capas, d_model 768, 12 cabezas, RoPE, SwiGLU, sin biases, QK-norm |
| Parametros totales | 124M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin versiones GGUF/INT8 publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model_params.pt`), config en `model_config.json`; requiere el código del repositorio para cargarse |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura propia del proyecto tinystories-ARM-model: 12 capas, dimensión de modelo 768, 12 cabezas de atención, embeddings rotatorios (RoPE), activación SwiGLU, ausencia de términos de bias y normalización QK (QK-norm). La tokenización usa el tokenizador de GPT-2 mediante `tiktoken`. La arquitectura no es la de Hugging Face `transformers`, sino la definida en `model.py` del repositorio, por lo que su carga exige clonar el repositorio y usar las utilidades `inference.load_model` y `load_model_config`.

El entrenamiento se realizó desde cero sobre 2.500 millones de tokens: Mini FineWeb-Edu completo (excluyendo los documentos reservados para evaluación del subconjunto small) más subconjuntos de Cosmopedia (stories, WikiHow, OpenStax, Stanford y Khan Academy). Se completaron 152.600 actualizaciones. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación en esta variante base (las variantes chat SFT y SFT+DPO sí las incorporan). El entrenamiento se llevó a cabo en un Mac y en GPUs de Colab, lo que subraya el carácter de bajo presupuesto del proyecto.

## Capacidades

- Generación de texto en inglés con estilo educativo y fluido, derivado de la composición del corpus de entrenamiento (FineWeb-Edu y Cosmopedia).
- Razonamiento básico de sentido común y comprensión lectora a nivel de modelo de 124M (resultados en HellaSwag, ARC-Easy, PIQA, Winogrande).
- Continuación de texto y respuesta a prompts cortos dentro de una ventana de 512 tokens.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se reporta entrenamiento en otros idiomas.
- No incluye modo thinking, visión, audio ni otras capacidades especiales.
- No se reporta decodificación especulativa ni atención lineal; la atención es estándar con RoPE y QK-norm.

## Casos de uso

- Docencia e investigación sobre entrenamiento desde cero: el modelo sirve como referencia reproducible para estudiar el efecto de cambios medidos uno a uno en arquitectura y datos, dado que el autor documenta el proceso en el repositorio.
- Experimentación con arquitecturas GPT personalizadas: útil para validar implementaciones propias de RoPE, SwiGLU o QK-norm comparando pérdidas y benchmarks contra GPT-2 small.
- Generación de texto educativo de relleno o sintético: puede producir párrafos con estilo de artículo divulgativo en inglés para prototipos de pipelines de datos, siempre con revisión humana.
- Comparación de paradigmas de modelado: al existir una variante de difusión enmascarada del mismo tamaño y datos (fineweb-edu-124m-diffusion), permite estudiar diferencias entre generación autorregresiva y difusión en igualdad de condiciones.
- Base para fine-tuning ligero: al ser un modelo de 124M con licencia MIT, es adecuado para experimentos de ajuste supervisado en tareas concretas de inglés con presupuesto de cómputo mínimo (las variantes chat del autor son ejemplo de ello).
- Prototipado en hardware de consumo: cabe en CPU y en GPUs modestas, por lo que sirve para probar infraestructura de inferencia (scripts propios, integración con `tiktoken`) antes de escalar a modelos mayores.
- Evaluación de benchmarks con lm-evaluation-harness: útil como caso de prueba de pipelines de evaluación zero-shot en modelos pequeños.

## Benchmarks y rendimiento

Resultados zero-shot estilo lm-evaluation-harness, comparados con OpenAI GPT-2 small (124M):

| Benchmark | Este modelo | GPT-2 small (124M) |
|---|---|---|
| Held-out Mini FineWeb-Edu (loss, menor es mejor) | 3.296 | 3.401 |
| TinyStories (loss) | 2.751 | 2.553 |
| WikiText-2 (loss) | 5.047 | 4.180 |
| Shakespeare (loss) | 5.446 | 4.807 |
| HellaSwag | 32.3% | 31.1% |
| ARC-Easy | 46.8% | 43.8% |
| PIQA | 62.4% | 62.9% |
| LAMBADA | 20.3% | 32.6% |
| Winogrande | 49.9% | no disponible |

El modelo supera a GPT-2 small en pérdida sobre el corpus de evaluación de FineWeb-Edu, HellaSwag y ARC-Easy, empata prácticamente en PIQA y queda claramente por detrás en WikiText-2, Shakespeare y LAMBADA. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en FP16/BF16 bajaría a unos 0,25 GB, aunque no se publican pesos en esos formatos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó en un Mac y en GPUs de Colab, lo que indica que una GTX 1650, RTX 3060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU; el ejemplo de la model card ejecuta la inferencia en CPU (`load_model(cfg, ..., "cpu")`).
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es propia y los pesos están en formato PyTorch con código del repositorio. El despliegue requiere clonar `tinystories-ARM-model` y usar sus utilidades de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-Easy | LAMBADA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| fineweb-edu-124m-base | 124M | 512 | 32.3% | 46.8% | 20.3% | MIT | Hugging Face + repo propio |
| OpenAI GPT-2 small | 124M | 1024 | 31.1% | 43.8% | 32.6% | MIT | Hugging Face `transformers` |
| fineweb-edu-124m-diffusion | 124M | no disponible | no disponible | no disponible | no disponible | MIT (presumible, mismo autor) | Hugging Face |
| fineweb-edu-124m-chat-sft | 124M | 512 (presumible) | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

La comparación directa más relevante es con GPT-2 small: mismo número de parámetros y licencia permisiva, pero GPT-2 small ofrece el doble de contexto (1024 frente a 512), mejor rendimiento en LAMBADA y WikiText-2, y compatibilidad nativa con `transformers`, lo que facilita su despliegue. La ventaja de fineweb-edu-124m-base se limita a HellaSwag, ARC-Easy y la pérdida en el dominio FineWeb-Edu.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: a 124M de parámetros el modelo "sabe pocos hechos de forma fiable", según el propio autor; no debe usarse como fuente de información.
- Tendencia a la repetición con decodificación greedy; requiere temperatura, top-k o penalización de repetición para generar texto coherente.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones largas, documentos extensos o agentes multi-paso.
- Solo inglés; no hay evidencia de calidad en otros idiomas.
- No compatible con el ecosistema `transformers`, vLLM, llama.cpp, Ollama ni TGI; la carga exige el código del repositorio, lo que complica el despliegue en producción.
- Riesgo de sesgos heredados de FineWeb-Edu y Cosmopedia, no evaluados ni mitigados en la información disponible.
- Riesgo de alucinación alto en cualquier consulta factual, coherente con su tamaño y corpus.
- Licencia MIT permite uso comercial, pero la ausencia de alineación, evaluación de seguridad y soporte técnico desaconseja su uso en producción orientada a usuarios finales.
- Los benchmarks provienen del propio autor y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Variante chat SFT: https://huggingface.co/aramkris/fineweb-edu-124m-chat-sft
- Variante chat SFT + DPO: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Variante de difusión enmascarada: https://huggingface.co/aramkris/fineweb-edu-124m-diffusion
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
