# PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA

## Resumen

El modelo `Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA` es un adaptador LoRA desarrollado por PhilipEriksson sobre el modelo base `Qwen/Qwen3.5-0.8B`. Se trata de un ajuste fino supervisado (SFT) orientado a destilar trazas de razonamiento (chain-of-thought) procedentes de modelos mayores, concretamente Claude Opus y Qwen3.5-27B. El objetivo es dotar a un modelo de apenas 896 millones de parámetros de capacidades de razonamiento explícito que normalmente se asocian a modelos mucho más grandes.

El adaptador se entrena sobre una mezcla de tres conjuntos de datos de razonamiento filtrados y normalizados, con 2.917 filas de entrenamiento efectivas. El autor lo describe explícitamente como una "learning run" (ejecución de aprendizaje) y no como un lanzamiento competitivo en benchmarks, lo que sitúa las expectativas en un contexto experimental y de investigación más que de producción.

La relevancia de esta ficha radica en su valor como ejemplo de destilación de razonamiento hacia modelos pequeños, así como en las decisiones técnicas concretas que documenta: atención híbrida en el modelo base, enmascaramiento de pérdida solo en la respuesta, y la necesidad de activar `enable_thinking=True` en la plantilla de chat para obtener razonamiento. El adaptador tiene 43,29M de parámetros entrenables (4,83% del total) y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida con atención completa y atención lineal (Qwen3.5); adaptador LoRA |
| Parámetros totales | 896,28M (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Parámetros entrenables (LoRA) | 43,29M (4,83%) |
| Longitud de contexto | no disponible (entrenado con `max_length=16384`) |
| Tipos de cuantización | 4-bit (entrenamiento); GGUF, EXL3 y NVFP4 disponibles en repos derivados |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF, EXL3, NVFP4 en repos derivados |
| Rank LoRA | 64 (`lora_alpha=64`, dropout 0, `bias="none"`) |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`, `out_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Pipeline | image-text-to-text (heredado del base; el fine-tune es solo texto) |
| Tamaño del repo | 0,2 GB |
| Librería | PEFT |
| Versiones de framework | PEFT 0.21.2, TRL 1.15.0, Transformers 5.17.0, PyTorch 2.14.1+cu130, Unsloth 2026.10.7 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura de atención híbrida: de sus 24 capas, 6 usan atención completa (con `q_proj`, `k_proj`, `v_proj`, `o_proj`) y las 18 restantes usan atención lineal (con `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`, `out_proj`). El adaptador LoRA se aplica sobre todos estos módulos de atención, además de los módulos MLP (`gate_proj`, `up_proj`, `down_proj`). La torre de visión del modelo base queda excluida: se trata de un fine-tune exclusivamente de texto, aunque el pipeline_tag heredado siga siendo `image-text-to-text`.

El entrenamiento se realizó con la base en 4-bit, `max_length=16384`, sin packing, con `per_device_train_batch_size=8` y `gradient_accumulation_steps=4` (batch efectivo de 32). Se ejecutaron 2 épocas y 184 pasos de optimizador con `learning_rate=2e-4` y `adamw_8bit`. La pérdida se calcula solo sobre la respuesta: todo el contenido previo a `<|im_start|>assistant\n` se enmascara a -100. Los datos provienen de tres conjuntos filtrados y normalizados (`nohurry/Opus-4.6-Reasoning-3000x-filtered`, `TeichAI/claude-4.5-opus-high-reasoning-250x`, `Jackrong/Qwen3.5-reasoning-700x`), resultando en 2.917 filas de entrenamiento de 3.191 normalizadas. La pérdida media final fue de 0,7077, con un mejor paso individual de 0,4458 y una meseta en torno a 0,65–0,67.

## Capacidades

- Generación de texto con razonamiento explícito (chain-of-thought) cuando se activa `enable_thinking=True` en la plantilla de chat.
- Razonamiento matemático y aritmético (el ejemplo de la model card es `17 * 23`).
- Razonamiento multi-paso destilado de trazas de Claude Opus y Qwen3.5-27B.
- Generación conversacional con plantilla de chat estilo Qwen.
- Capacidad de fusión (`merge_and_unload`) para generar un modelo standalone de 16 bits.
- No incluye capacidades de visión en este fine-tune, pese al pipeline_tag heredado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en destilación de razonamiento: el adaptador sirve como referencia reproducible para estudiar cómo un modelo de 0,8B absorbe trazas de CoT de modelos mayores, con hiperparámetros y curvas de pérdida documentados.
- Experimentación educativa con LoRA: permite a desarrolladores cargar el adaptador sobre Qwen3.5-0.8B con PEFT y observar el efecto del enmascaramiento response-only en la calidad del razonamiento.
- Prototipado de asistentes de razonamiento en local: al caber en GPUs de consumo gracias a sus 896M de parámetros, permite probar flujos de pensamiento paso a paso sin infraestructura cloud.
- Generación de explicaciones paso a paso para tareas aritméticas simples: útil para demostrar cómo se comporta un modelo pequeño cuando se le fuerza a razonar antes de responder.
- Base para fine-tunes posteriores: el adaptador puede servir como punto de partida (inicialización LoRA) para tareas específicas de razonamiento en inglés.
- Evaluación comparativa de técnicas de destilación: al existir variantes GGUF, EXL3 y NVFP4 del modelo fusionado, permite medir el impacto de la cuantización en la calidad del razonamiento.
- Docencia y talleres sobre PEFT/TRL: el código de carga y fusión está documentado y es directamente ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que se trata de una "learning run" y no de un lanzamiento competitivo. El único dato de rendimiento reportado es la pérdida de entrenamiento: media final de 0,7077, mejor paso de 0,4458 y meseta en 0,65–0,67.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa aproximadamente 1,8 GB; el adaptador LoRA añade unos 0,17 GB. En 4-bit, la huella se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para bf16; una RTX 3060, RTX 4060 o superior funciona sin problemas. Para entrenamiento, una RTX 4090 o A100 acelera los 184 pasos.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card), llama.cpp/Ollama mediante la variante GGUF, EXL3 para inferencia con ExLlamaV3 y NVFP4 para GPUs Blackwell.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Opus-Reasoning-Distilled (este) | 896M (43,29M LoRA) | no disponible (entrenado a 16k) | CoT destilado de Opus y Qwen3.5-27B | Apache 2.0 | HF (LoRA, GGUF, EXL3, NVFP4) |
| Qwen3.5-0.8B (base) | 896M | no disponible | Sin fine-tune de razonamiento | Apache 2.0 | HF |
| Qwen3.5-27B (fuente de trazas) | 27B | no disponible | Razonamiento nativo | no disponible | HF |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor califica el modelo como "learning run", no competitivo en benchmarks; no debe usarse como referencia de rendimiento.
- La pérdida se estabilizó en 0,65–0,67, lo que sugiere cierto estancamiento en la calidad del ajuste.
- Solo soporta inglés según la model card; el rendimiento en castellano no está documentado.
- El fine-tune es solo de texto: la torre de visión del base queda excluida, aunque el pipeline_tag sea `image-text-to-text`.
- Es obligatorio activar `enable_thinking=True` en la plantilla de chat; de lo contrario el modelo responde sin razonamiento (bloque think vacío).
- Riesgo de alucinación inherente a modelos pequeños con razonamiento destilado; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados por el autor; al entrenarse sobre trazas de Claude Opus y Qwen3.5-27B puede heredar sesgos de esos modelos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3.5-0.8B conviene verificar la licencia del modelo base.
- El adaptador requiere cargar el modelo base por separado o fusionarlo; no es un modelo standalone.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA
- Modelo fusionado 16-bit: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled
- Variante GGUF: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF
- Variante EXL3: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3
- Variante NVFP4: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4
- Colección: https://huggingface.co/collections/PhilipEriksson/qwen35-08b-opus-reasoning-distilled-6ae3336176ac243223f27ee9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset 1: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset 2: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset 3: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
