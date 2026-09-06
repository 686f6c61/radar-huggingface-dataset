# alfatih1234/pgabl-qwen25-1.5b-sft

## Resumen

pgabl-qwen25-1.5b-sft es un modelo de lenguaje de 1.543.714.304 parámetros (1.54B) desarrollado por alfatih1234 mediante fine-tuning supervisado (SFT) sobre el modelo base Qwen2.5-1.5B-Instruct. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que, según el autor, permitió una aceleración de aproximadamente 2x respecto a los métodos convencionales. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para el idioma inglés.

Desde un punto de vista técnico, el modelo conserva la arquitectura transformer de Qwen2.5, que incluye attention por grupos de consultas (GQA) y soporte para instrucciones. La model card no especifica la longitud de contexto final, el dataset de entrenamiento ni el número de tokens utilizados, por lo que estas características deben confirmarse experimentalmente antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parámetros totales | 1.543.714.304 (1.54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; tamaño del repo 3.1 GB consistente con bf16/fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) de Qwen2.5-1.5B-Instruct, un modelo transformer con group query attention (GQA). Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que acelera el proceso de fine-tuning aproximadamente un 50% respecto a los métodos estándar. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica si se modificó la ventana de contexto o la arquitectura original.

## Capacidades

La model card no describe capacidades específicas del fine-tuning. Basándose en el modelo base Qwen2.5-1.5B-Instruct, se espera que herede las siguientes capacidades:

- Generación de texto instructivo en inglés, incluyendo respuestas a preguntas, resúmenes y redacción.
- Razonamiento básico y matemáticas simples, con rendimiento limitado por el tamaño de 1.5B.
- Generación de código en lenguajes como Python, JavaScript y SQL.
- Soporte de tool calling y function calling, si no se ha eliminado durante el fine-tuning.
- Capacidad multilingüe en cierta medida, aunque la card solo declara inglés.
- Manejo de conversaciones multi-turno dentro de la ventana de contexto.

## Casos de uso

Dado que no hay información sobre el dataset de fine-tuning, los siguientes casos de uso son potenciales y deben validarse experimentalmente:

- Asistente de atención al cliente en inglés: el modelo puede responder preguntas frecuentes y mantener diálogos cortos. Su tamaño pequeño lo hace adecuado para despliegues con latencia baja.
- Generación de código en entornos de desarrollo: puede utilizarse como autocompletado o asistente para fragmentos de código en Python o JavaScript, integrándose en IDEs como VS Code.
- Resumen de documentos y correos electrónicos: permite condensar textos largos en resúmenes concisos, útil en herramientas de productividad.
- Clasificación y análisis de sentimiento: puede etiquetar texto en categorías o evaluar tono, aprovechando su capacidad de instrucción.
- Extracción de información estructurada: con soporte de function calling, puede extraer entidades o datos de texto no estructurado y devolver JSON.
- Prototipado rápido de chatbots: por su licencia Apache 2.0 y su tamaño, es adecuado para experimentos en local con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona datos de rendimiento en conjuntos como MMLU, HumanEval, GSM8K o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (~3.1 GB), se requieren entre 4 y 6 GB de VRAM dependiendo de la longitud de secuencia y el lote. Con cuantización de 4 bits, puede reducirse a ~1.5-2 GB.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060 (12 GB), RTX 4090 (24 GB), A100 o H100 si se usa vLLM con lotes grandes.
- Puede ejecutarse en GPU de consumo como una RTX 3050 de 8 GB si se aplica cuantización.
- Opciones de despliegue: transformers (PyTorch), vLLM, llama.cpp, Ollama, TGI (Text Generation Inference).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pgabl-qwen25-1.5b-sft (evaluado) | 1.54B | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.54B | 32k | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0.49B | 32k | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1.24B | 128k | Llama 3.2 Community License | Hugging Face |

Los datos de los modelos base son públicos; el modelo evaluado no tiene benchmarks publicados.

## Limitaciones y advertencias

- No hay evaluación pública de sesgos, alucinaciones o robustez.
- El fine-tuning puede haber degradado algunas capacidades del modelo base si el dataset era limitado o de baja calidad.
- La ventana de contexto no está confirmada; si no se preservó la del modelo base, podría ser menor.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de precisión ni adecuación para un propósito particular.
- Al ser un modelo de 1.5B, tiene limitaciones en razonamiento complejo y conocimiento factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfatih1234/pgabl-qwen25-1.5b-sft
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
