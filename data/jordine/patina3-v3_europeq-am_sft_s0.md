# Jordine/patina3-v3_europeq-am_sft_s0

## Resumen

El modelo `Jordine/patina3-v3_europeq-am_sft_s0` es un adaptador LoRA (PEFT) sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado por el usuario Jordine en Hugging Face. Está etiquetado para tareas de generación de texto y conversación, y su repositorio ocupa aproximadamente 0,7 GB. La información pública disponible es mínima: la model card no documenta datos de entrenamiento, ni capacidades, ni licencia, ni evaluación. Se trata, por tanto, de un modelo experimental sin verificar, útil únicamente para exploración técnica dentro de la familia de adaptadores del autor. No se han encontrado descripciones, papers ni demos asociados. Los únicos elementos identificables son la librería PEFT 0.20.0 y los tags de LoRA, safetensors y transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre `meta-llama/Llama-3.1-8B`) |
| Parámetros totales | No disponible (el adaptador no documenta el número de parámetros; el modelo base tiene 8B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador LoRA cargado con la librería PEFT 0.20.0, que añade matrices de bajo rango al modelo base `meta-llama/Llama-3.1-8B`. La arquitectura subyacente es un transformer decoder-only con características propias de la familia Llama 3.1. No se proporciona información sobre el proceso de entrenamiento: se desconoce el número de tokens, la composición del dataset, si se aplicó SFT, RLHF o DPO, y los hiperparámetros. Los tags `sft` sugieren un fine-tuning supervisado, pero no hay datos al respecto. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto: el pipeline declarado en Hugging Face es `text-generation`, por lo que el adaptador está preparado para producir texto a partir de una entrada.
- Conversación: la tag `conversational` indica vocación de uso en diálogo, aunque no se han publicado plantillas de chat ni instrucciones de uso.
- No se han documentado capacidades específicas como tool calling, uso en agentes, razonamiento avanzado, code generation, soporte multimodal o audio.
- Al basarse en Llama-3.1-8B, es plausible que herede las capacidades generales del modelo base, pero esta afirmación no puede verificarse sin una evaluación explícita.

## Casos de uso

- No se han documentado casos de uso específicos.
- No se recomienda su uso en producción sin una evaluación previa.
- No se puede determinar la idoneidad para tareas concretas (chat, código, matemáticas, etc.) a partir de la información disponible.
- Cualquier aplicación requeriría primero una validación experimental del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base (el adaptador LoRA añade un peso despreciable): aproximadamente 16 GB en FP16, 9 GB en cuantización de 8 bits y 5 GB en cuantización de 4 bits. Son cifras orientativas para `Llama-3.1-8B`.
- GPU recomendadas en FP16: RTX 4090 (24 GB) o superiores; para cuantización de 4 bits, una RTX 3060 12 GB o RTX 4080 son suficientes.
- En entornos de inferencia concurrente, se recomienda una A100 40 GB o H100, aunque no hay datos de carga específicos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tamaño repo | Licencia | Rendimiento |
|---|---|---|---|---|
| `patina3-v3_europeq-am_sft_s0` | Llama-3.1-8B | 0,7 GB | no disponible | no disponible |
| `patina3-cube_europe-eu_sft_s0` | Llama-3.1-8B | 0,7 GB | no disponible | no disponible |
| `patina3-v3_america-am_sft_s0` | Llama-3.1-8B | 0,7 GB | no disponible | no disponible |

Los tres modelos son adaptadores LoRA del mismo autor, con el mismo modelo base y sin datos de evaluación publicados, por lo que no es posible realizar una comparación de rendimiento.

## Limitaciones y advertencias

- No hay documentación ni evaluación, lo que impide conocer sesgos específicos.
- Al heredar el comportamiento del modelo base Llama-3.1-8B, el modelo puede presentar sesgos sociales y de lenguaje presentes en dicho modelo.
- Riesgo de alucinación inherente a los modelos autogenerativos.
- Licencia no disponible: no se puede confirmar si está permitido el uso comercial.
- No se han verificado restricciones de idioma ni de contexto.
- Uso en producción desaconsejado sin validación experimental.

## Enlaces

- https://huggingface.co/Jordine/patina3-v3_europeq-am_sft_s0
- https://huggingface.co/Jordine/patina3-cube_europe-eu_sft_s0
- https://huggingface.co/Jordine/patina3-v3_america-am_sft_s0
