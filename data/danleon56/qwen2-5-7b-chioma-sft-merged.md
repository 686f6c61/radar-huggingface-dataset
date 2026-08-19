# Danleon56/qwen2.5-7b-chioma-sft-merged

## Resumen

El modelo `Danleon56/qwen2.5-7b-chioma-sft-merged` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen2.5-7B-Instruct`, realizado por el desarrollador Danleon56. El entrenamiento se llevó a cabo utilizando las librerías Unsloth y Hugging Face TRL, lo que permitió un proceso de fine-tuning aproximadamente dos veces más rápido que los métodos convencionales. El resultado es un modelo de generación de texto con arquitectura transformer densa, 7.615.616.512 parámetros y licencia Apache 2.0, pensado para su uso en inglés.

Este modelo se publica como un checkpoint fusionado (merged) a partir de un entrenamiento con cuantización de 4 bits (bnb-4bit), lo que facilita su despliegue en entornos con recursos limitados. Aunque la model card no especifica la longitud de contexto, al derivar de Qwen2.5-7B-Instruct hereda una ventana de 32.768 tokens. Su relevancia radica en ofrecer una alternativa afinada y lista para usar sobre una base sólida y ampliamente adoptada, aunque la documentación disponible es escasa y no detalla el dataset ni los objetivos concretos del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no especificado en la ficha; el base se entrenó con bnb-4bit, pero el checkpoint fusionado se distribuye en safetensors de precisión completa (fp16/bf16) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). Al ser un fine-tune del checkpoint `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, hereda la estructura original de 28 capas, 28 cabezas de atención, dimensión oculta de 3584 y un vocabulario de 152.064 tokens. No se trata de un modelo MoE ni híbrido.

El entrenamiento consistió en un ajuste fino supervisado (SFT) realizado con la librería Unsloth, que optimiza el uso de memoria mediante cuantización en 4 bits durante el entrenamiento, y Hugging Face TRL para el pipeline de fine-tuning. No se especifican el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint final se fusionó (merged) para producir pesos en precisión completa, listos para inferencia.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado del modelo base instruct.
- Razonamiento y comprensión del lenguaje, incluyendo tareas de sentido común y análisis de texto.
- Generación de código y soporte básico de matemáticas, capacidades propias de Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling, disponible en el modelo base y presumiblemente conservado en el fine-tune.
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque la model card solo declara inglés; el fine-tune puede haber reducido el rendimiento en otros idiomas.
- No se documentan capacidades especiales como modo de pensamiento extendido, visión o audio.

## Casos de uso

- Asistente conversacional en inglés: el modelo puede mantener diálogos multi-turno con contexto de hasta 32K tokens, adecuado para chatbots de atención al cliente o asistentes virtuales en entornos de habla inglesa.
- Generación de documentación técnica: gracias a su capacidad de comprensión y generación de texto estructurado, puede redactar manuales, guías y comentarios de código en inglés.
- Análisis de sentimiento y clasificación de texto: al ser un fine-tune instruct, puede adaptarse a tareas de clasificación mediante prompts bien diseñados, útil para monitorización de redes sociales o encuestas.
- Generación de código asistida: puede completar fragmentos de código, explicar funciones o traducir entre lenguajes de programación, integrándose en editores o pipelines de desarrollo.
- Resumen de documentos largos: con su ventana de 32K tokens, puede resumir artículos, informes o contratos extensos sin perder información relevante.
- Prototipado rápido de aplicaciones NLP: al ser un modelo abierto y ligero (7B), sirve para validar ideas de productos antes de escalar a modelos mayores, con despliegue en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base Qwen2.5-7B-Instruct reporta en su documentación oficial puntuaciones como MMLU-Pro 69,4, HumanEval 85,7 y GSM8K 91,6, pero estos datos corresponden al checkpoint original y no pueden atribuirse al modelo afinado sin verificación. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,2 GB en precisión fp16 (como se distribuye), o unos 8-10 GB si se cuantiza a 8 bits o 4 bits con herramientas como llama.cpp o GPTQ.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en fp16 sin problemas; GPUs con 16 GB (RTX 4080, A100 40GB) también son viables. Para cuantización 4-bit, una RTX 3060 de 12 GB o incluso 8 GB podría funcionar.
- Sí cabe en GPUs de consumo: con cuantización GGUF de 4 bits, es ejecutable en tarjetas con 8 GB de VRAM, aunque con menor velocidad.
- Opciones de despliegue: compatible con vLLM, TGI (Text Generation Inference), llama.cpp, Ollama y transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 7B en una RTX 4090 se pueden esperar decenas de tokens por segundo en fp16, y más con cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Danleon56/qwen2.5-7b-chioma-sft-merged | 7,6B | 32K | Apache 2.0 | Fine-tune desconocido, sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K | Apache 2.0 | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community License | Contexto mayor, licencia restrictiva para uso comercial |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32K | Apache 2.0 | Alternativa densa, sin fine-tune específico |

La comparativa directa no es posible sin datos de rendimiento del fine-tune. El modelo base Qwen2.5-7B-Instruct es la referencia natural para medir el impacto del ajuste.

## Limitaciones y advertencias

- La documentación del fine-tune es mínima: no se especifican el dataset de entrenamiento, los hiperparámetros ni los objetivos, lo que dificulta evaluar su idoneidad para tareas concretas.
- Riesgo de alucinación y sesgos: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de preentrenamiento y en los datos de ajuste, que son desconocidos.
- Idioma: la model card declara únicamente inglés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Sin garantía de conservación de capacidades: el fine-tune podría haber reducido el rendimiento en código, matemáticas o razonamiento si el dataset de ajuste estaba sesgado hacia conversación general.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- Para producción, es imprescindible realizar una evaluación propia con datos representativos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Danleon56/qwen2.5-7b-chioma-sft-merged
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 en GitHub (mx4ai): https://github.com/mx4ai/qwen2.5
- Documentación de Qwen2.5-7B-Instruct para Qualcomm (referencia de arquitectura): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen2_5_7b_instruct/README.md
- Página de Wikipedia sobre Qwen: https://en.wikipedia.org/wiki/Qwen
