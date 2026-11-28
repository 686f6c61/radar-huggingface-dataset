# ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath

## Resumen

Qwen3.5-0.8B-SFT-NuminaMath es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario ermiaazarkhalili. El modelo se ha entrenado con QLoRA sobre el conjunto de datos AI-MO/NuminaMath-CoT, que contiene pares de problema matemático y solución paso a paso. El resultado es un modelo de generación de texto especializado en razonamiento matemático, con 752.393.024 parámetros totales y un tamaño de repositorio de 1,5 GB en formato safetensors.

El modelo es de tipo texto únicamente: aunque el checkpoint base Qwen3.5 incorpora una torre de visión, esta no se ha cargado ni se incluye en el repositorio. Se distribuye bajo licencia Apache 2.0 y está pensado para su uso con la librería transformers. El ajuste se realizó con TRL SFTTrainer, PEFT (QLoRA) y precisión bf16, y los pesos resultantes se fusionaron en una copia bf16 del modelo base.

La relevancia de este modelo radica en su tamaño reducido y su especialización en matemáticas, lo que lo hace adecuado para despliegues con recursos limitados y para tareas de resolución de problemas paso a paso. No se han publicado resultados de benchmarks de precisión, por lo que su rendimiento debe validarse empíricamente frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only, text-only) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento trunca a 2048 tokens) |
| Tipos de cuantizacion | 4-bit nf4 (usada durante el entrenamiento QLoRA); no se especifican otras |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, cargado mediante `AutoModelForCausalLM` desde un checkpoint `Qwen3_5ForConditionalGeneration`. Los pesos correspondientes a `^mtp.*` y `^model.visual.*` no se cargan en esta clase ni están presentes en el repositorio, de modo que el modelo resultante procesa únicamente texto. El ajuste fino se realizó con QLoRA: el modelo base se cargó en 4-bit nf4 con dtype de cómputo bfloat16, y se aplicaron adaptadores LoRA con r=16, alpha=32 y dropout=0.05 sobre las proyecciones `down_proj`, `gate_proj`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`. Posteriormente, los adaptadores se fusionaron en una copia bf16 del modelo base.

El entrenamiento utilizó 94.861 filas de entrenamiento y 1.000 de evaluación del dataset AI-MO/NuminaMath-CoT (146 de 100.000 filas se descartaron por superar los 2048 tokens). La pérdida se calculó únicamente sobre la completación (la solución y su token `<|im_end|>`). Se realizaron 11.858 pasos con batch efectivo de 8 (1 × 8 de acumulación), optimizador paged_adamw_8bit, learning rate 0.0001, schedule coseno, warmup_steps=0.05, weight decay 0.01 y semilla 42. La pérdida final de entrenamiento fue 0.5113 y la de evaluación 0.4815, con un tiempo de entrenamiento de 50.511 segundos. El formato de prompt utiliza la plantilla de chat del tokenizer con `enable_thinking=False`, y el turno del asistente comienza con un bloque `` vacío, tal como en el entrenamiento. Las respuestas terminan en `<|im_end|>` (id 248046), que es el `eos_token_id` de la configuración de generación guardada.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, entrenado específicamente sobre soluciones CoT de NuminaMath.
- Resolución de problemas matemáticos con formato de solución detallada.
- Soporte de conversación multi-turno mediante la plantilla de chat del tokenizer.
- Modo de pensamiento desactivado por defecto (`enable_thinking=False`), con bloque `` vacío al inicio de la respuesta.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés (`en`).
- No soporta tool calling ni function calling de forma explícita en la información disponible.
- No soporta visión ni audio: el modelo es text-only.
- No se documentan capacidades de agente o multi-step reasoning más allá del razonamiento matemático.

## Casos de uso

- Resolución de problemas matemáticos educativos: el modelo puede generar soluciones paso a paso para ecuaciones, problemas de álgebra y cálculo, gracias a su ajuste sobre NuminaMath-CoT. Es adecuado para tutores automáticos o generación de material didáctico.
- Generación de explicaciones matemáticas detalladas: útil para crear contenido formativo donde se requiere el desarrollo completo del razonamiento, no solo la respuesta final.
- Asistente de estudio en inglés: al estar entrenado con plantilla de chat, puede mantener conversaciones multi-turno sobre problemas matemáticos, con respuestas que finalizan en `<|im_end|>`.
- Prototipado rápido en entornos con recursos limitados: con 752 millones de parámetros y 1,5 GB en safetensors, puede desplegarse en una sola GPU consumer para experimentación.
- Generación de datasets sintéticos de matemáticas: puede producir soluciones CoT que sirvan como datos de entrenamiento para modelos mayores o para aumentar un corpus existente.
- Evaluación comparativa de ajustes finos: sirve como referencia para medir el impacto de QLoRA sobre NuminaMath frente al modelo base Qwen3.5-0.8B en tareas de razonamiento matemático.
- Integración en pipelines de generación de texto con transformers: al ser compatible con `AutoModelForCausalLM` y `AutoTokenizer`, puede incorporarse en flujos existentes basados en la librería transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ejecutó ningún benchmark de precisión y recomienda comparar con el modelo base en problemas reservados con respuestas finales conocidas antes de confiar en él.

| Metrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0.5113 |
| Pérdida final de evaluación (1.000 filas) | 0.4815 |
| Tiempo de entrenamiento | 50.511 s |
| Filas de entrenamiento | 94.861 |
| Filas de evaluación | 1.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 752 millones de parámetros, en bf16 se requieren aproximadamente 1,5 GB solo para pesos; en 4-bit, alrededor de 0,4 GB, más overhead de activaciones y contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en bf16, y menos en cuantización 4-bit.
- Opciones de despliegue: transformers (probado con Transformers 5.24.1, TRL 1.19.0, PEFT 0.22.0, PyTorch 2.11.0). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath | 752.393.024 | no disponible | apache-2.0 | Hugging Face | Ajuste SFT QLoRA sobre NuminaMath-CoT, text-only, inglés |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la información | no disponible | apache-2.0 | Hugging Face | Modelo base multimodal original con torre de visión; este ajuste elimina visión |
| Alternativas de tamaño similar especializadas en matemáticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No se han ejecutado benchmarks de precisión; el rendimiento real en matemáticas no está validado más allá de las pérdidas de entrenamiento y evaluación.
- El modelo es text-only: no procesa imágenes, aunque el checkpoint base Qwen3.5 incluya torre de visión.
- Idioma limitado al inglés (`en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada; el entrenamiento truncó secuencias a 2048 tokens, por lo que problemas o soluciones más largos pueden degradar la calidad.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en pasos intermedios de razonamiento matemático; se recomienda verificación de respuestas finales.
- El modo de pensamiento está desactivado por defecto (`enable_thinking=False`) y el bloque `` se emite vacío; no se documenta comportamiento con pensamiento activado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen/Qwen3.5-0.8B enlazada en la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la información, sin validación comunitaria conocida.
- No se documentan sesgos específicos, pero al entrenarse sobre un dataset matemático en inglés puede heredar sesgos de dicho corpus.
- El autor recomienda comparar contra el modelo base en problemas reservados con respuestas conocidas antes de confiar en él en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.5-0.8B-SFT-NuminaMath
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
