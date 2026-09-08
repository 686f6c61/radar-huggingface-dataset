# EphAsad/Satella-0.8B

## Resumen

Satella-0.8B es un modelo de razonamiento compacto de la familia Atem, desarrollado por EphAsad a partir de Qwen/Qwen3.5-0.8B mediante un fine-tuning LoRA. El modelo está diseñado para generar respuestas de razonamiento y conversaciones con tool calling en formato Qwen, manteniendo una identidad definida (Satella). Con 873 millones de parámetros y una ventana de contexto activa de 8192 tokens, se posiciona como una opción ligera para tareas de razonamiento y agentes en entornos con recursos limitados. Su relevancia radica en la combinación de tamaño reducido, soporte de tool calling y la posibilidad de ejecutarse en hardware de consumo, aunque su licencia y las restricciones de los datos de entrenamiento exigen revisión antes de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (contexto activo durante SFT; contexto nativo no especificado) |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Other (con restricciones de datos de entrenamiento) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se entrena con LoRA (rank 16, alpha 32) en BF16. El proceso de SFT es exclusivamente de texto; los parámetros visuales del modelo base se congelan. Se aplican adaptadores LoRA a las capas de atención y MLP del lenguaje mediante la interfaz PEFT de Unsloth. El contexto activo durante el entrenamiento es de 8192 tokens, con un perfil de `max_length` 8192, `batch_size` 8, `grad_accum` 2 y sin gradient checkpointing. La pérdida se calcula solo sobre las respuestas, usando máscaras explícitas para los tokens de asistente. El corpus de entrenamiento combina datos de razonamiento y respuesta directa, junto con conversaciones de tool calling en formato nativo de Qwen. Se entrenó durante una época como máximo, con un límite de tiempo de 2,25 horas. El dataset principal incluye `r0b0tlab/qwen3.8-max-distillation-50k`, cuya licencia es `other` y contiene restricciones de procedencia y prompts derivados de benchmarks; por ello, el modelo no reclama un linaje Apache-2.0 simple.

## Capacidades

- Razonamiento: el modelo está entrenado para producir respuestas con razonamiento y respuestas directas, en un corpus mixto.
- Tool calling: soporta conversaciones con herramientas en formato Qwen.
- Identidad: puede mantener la identidad de Satella tanto con system message como sin él.
- Texto: solo procesa texto; los parámetros de visión están congelados.
- Multilingüe: no especificado.
- Agentes: gracias al tool calling, puede integrarse en flujos de agente, aunque no se detalla soporte multi-step.

## Casos de uso

- Asistentes de chat con identidad fija: el modelo puede usarse para chatbots que necesitan mantener una personalidad concreta (Satella) sin depender de un wrapper externo.
- Agentes con tool calling: al soportar conversaciones de herramientas en formato Qwen, es adecuado para prototipos de agentes que llaman funciones.
- Razonamiento en dispositivos edge: con 873M parámetros, puede ejecutarse en GPUs de consumo o incluso CPU con cuantización, para tareas de razonamiento lógico.
- Distilación de razonamiento: el entrenamiento usa un dataset de destilación de un modelo mayor, por lo que puede servir como base para estudiar la transferencia de razonamiento a modelos pequeños.
- Experimentación con LoRA: el modelo es un ejemplo de fine-tuning LoRA con Unsloth, útil para investigación en PEFT.
- Evaluación de modelos pequeños: dado su tamaño y tool calling, puede emplearse en pruebas de rendimiento de razonamiento en modelos compactos.
- Aplicaciones con atribución de modelo base: el modelo está entrenado para indicar que fue afinado desde Qwen3.5-0.8B, lo que puede ser útil en entornos que requieren transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los pesos ocupan ~1,75 GB; con contexto 8192, se estiman 2-3 GB de VRAM para inferencia. Con cuantización a 4 bits, ~0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, etc.). Para servidores, no requiere GPUs de gama alta.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 4 GB o más.
- Opciones de despliegue: Transformers, Unsloth, vLLM, llama.cpp/Ollama (si se convierte a GGUF).
- Latencia/throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se basa en Qwen/Qwen3.5-0.8B, pero no se conocen las especificaciones completas del modelo base ni de otros modelos comparables en la misma categoría. El hermano mayor Satella-30B-A3B es un modelo MoE de 30B con 3B activos, pero no es comparable en tamaño ni en caso de uso.

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos; el modelo puede heredar los del dataset de destilación y del modelo base.
- Alucinación: al ser un modelo pequeño, el riesgo de alucinación es mayor que en modelos grandes.
- Contexto: el contexto activo de entrenamiento es 8192; no se especifica si soporta contextos mayores.
- Idioma: no se especifican idiomas soportados; el rendimiento en español u otros idiomas no está garantizado.
- Licencia: la licencia es `other` y el dataset de entrenamiento incluye restricciones; se debe revisar `PROVENANCE.md` antes de redistribución o uso comercial.
- Entrenamiento limitado: una época y un límite de tiempo de 2,25 horas pueden afectar la calidad final.
- Solo texto: no soporta entrada visual, a pesar de que el modelo base tiene parámetros de visión.

## Enlaces

- HuggingFace: https://huggingface.co/EphAsad/Satella-0.8B
- Satella-30B-A3B: https://huggingface.co/EphAsad/Satella-30B-A3B
- `training_manifest.json`: no disponible (mencionado en la model card, sin URL)
- `PROVENANCE.md`: no disponible (mencionado en la model card, sin URL)
