# MohammadBeigi/Qwen3.5-0.8B-Persian-Agent

## Resumen

Qwen3.5-0.8B-Persian-Agent es un ajuste fino completo del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario MohammadBeigi y publicado en Hugging Face. Se trata de un modelo de lenguaje compacto de aproximadamente 752 millones de parámetros (con embeddings atados) orientado prioritariamente al persa (farsi), que conserva las capacidades en inglés del modelo original. El objetivo es ofrecer un asistente conversacional ligero, capaz de seguir instrucciones y de invocar herramientas (tool calling / function calling), ejecutable en CPU, portátiles y teléfonos móviles.

El modelo parte de la arquitectura híbrida de Qwen3.5, que combina Gated DeltaNet con Gated Attention, e incorpora un ajuste fino supervisado (SFT) de todos los parámetros en dos etapas sobre aproximadamente 38 000 muestras, sin emplear LoRA. Según la model card, la perplejidad en persa mejora de 13,14 a 10,52 (en torno a un 20 % mejor que el modelo base), lo que lo hace relevante para despliegues en entornos con recursos limitados donde se necesita un asistente en persa con soporte de agentes.

La relevancia actual radica en su tamaño reducido (repo de 9,4 GB con pesos en FP16 de 1,50 GB) y en la disponibilidad de cuantizaciones GGUF desde 533 MB, lo que permite su uso en aplicaciones móviles y en hardware de consumo. La licencia Apache 2.0, heredada del modelo base, facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 752.393.024 (~0,75B, embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contexto usado en entrenamiento: 1.536 tokens) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Persa (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp, LM Studio, Ollama, PocketPal) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B, cuya arquitectura híbrida combina capas de Gated DeltaNet (un mecanismo de atención lineal recurrente) con capas de Gated Attention clásica. El ajuste fino es de parámetros completos (sin LoRA) en dos etapas de SFT, sobre aproximadamente 38 000 muestras. El contexto empleado durante el entrenamiento fue de 1.536 tokens y el modo de operación es "non-thinking" (respuestas directas, sin bloque de razonamiento).

Los datos de entrenamiento provienen de una mezcla de conjuntos en persa e inglés: Maux-Persian-SFT-30k, maux-gpt-sft-20k, Persian_QA_Chat_Format, Persian-Math-SFT, PersianML/persian-general-knowledge, SajjadAyoubi/persian_qa, persiannlp/parsinlu_entailment, hosseinhimself/persian-alpaca-reasoning-v1, artindnr/Persian-English-Thinking, MatinaAI/instruction_tuning_datasets, sbunlp/ParsMap, CohereForAI/aya_dataset, Open-Orca/SlimOrca, argilla/apigen-function-calling y NousResearch/hermes-function-calling-v1. Esta composición mezcla datos conversacionales, matemáticas, razonamiento, conocimiento general y ejemplos de function calling. No se documenta en la información disponible el uso de RLHF o DPO.

Una innovación destacable es que las cuantizaciones GGUF emplean el layout clásico (no fusionado) de tensores de Qwen3.5, lo que permite cargarlas en versiones antiguas de llama.cpp y en aplicaciones móviles. Además, la plantilla de chat embebida cierra siempre el bloque `<think>`, de modo que las aplicaciones que activan el "thinking" por defecto siguen obteniendo respuestas directas.

## Capacidades

- Generación de texto conversacional en persa con fluidez mejorada respecto al modelo base.
- Seguimiento de instrucciones (instruction following) en persa e inglés.
- Razonamiento y matemáticas básicas, apoyado en los conjuntos Persian-Math-SFT y persian-alpaca-reasoning-v1.
- Conocimiento general en persa (PersianML/persian-general-knowledge, SajjadAyoubi/persian_qa).
- Tool calling / function calling en formato Qwen (`<tool_call>` con `<function=...>` y parámetros), entrenado con argilla/apigen-function-calling y NousResearch/hermes-function-calling-v1.
- Capacidad de abstenerse de invocar herramientas cuando ninguna encaja con la petición, respondiendo directamente en lugar de inventar una llamada.
- Soporte multilingüe limitado a persa e inglés.
- Modo non-thinking (respuestas directas), sin bloque de razonamiento explícito.
- Ejecución en CPU, portátiles, servidores de bajo coste y dispositivos móviles (Android/iOS vía PocketPal).

## Casos de uso

- Asistencia conversacional en persa en dispositivos móviles: con cuantización Q4_K_M (533 MB) o Q5_K_M (578 MB) puede ejecutarse en teléfonos mediante PocketPal, ofreciendo un chatbot offline en farsi sin conexión a la nube.
- Atención al cliente automatizada en persa: el modelo gestiona conversaciones multi-turno y sigue instrucciones de sistema, adecuado para integraciones ligeras en webs o apps donde el coste de inferencia debe ser mínimo.
- Agentes con invocación de herramientas: gracias al entrenamiento en function calling, puede integrarse en flujos donde deba llamar a APIs (por ejemplo, conversión de divisas, consulta de datos) emitiendo bloques `<tool_call>` estructurados.
- Asistentes de escritorio en CPU: con GGUF Q8_0 (812 MB, ~1,5 GB de RAM) puede desplegarse en portátiles sin GPU mediante llama.cpp o LM Studio para tareas de redacción y respuesta en persa.
- Procesamiento de texto en persa en pipelines de bajo coste: clasificación, resumen o generación de respuestas sobre textos en farsi en servidores modestos, aprovechando su reducido consumo de memoria (~3 GB en FP16).
- Prototipado de agentes conversacionales bilingües persa-inglés: útil para desarrolladores que necesitan validar flujos de agentes con soporte de herramientas antes de escalar a modelos mayores.
- Educación y tutoría básica en persa: puede responder preguntas de conocimiento general y matemáticas elementales, apoyándose en los datos de QA y matemáticas del entrenamiento.

## Benchmarks y rendimiento

La model card incluye una evaluación interna en persa (perplejidad sobre conjunto reservado y 14 pruebas dirigidas de fluidez, conocimiento, seguimiento de instrucciones y uso de herramientas). La información proporcionada se interrumpe en la tabla, por lo que solo se dispone del dato de perplejidad del modelo ajustado.

| Modelo | Perplejidad en persa (↓) | Pruebas en persa (↑) |
|---|---|---|
| Qwen3.5-0.8B-Persian-Agent | 10,52 | no disponible |
| Qwen/Qwen3.5-0.8B (base) | 13,14 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~3 GB en FP16 (safetensors de 1,50 GB); ~1,5 GB con GGUF Q8_0 (812 MB); ~1,2 GB con Q5_K_M (578 MB); ~1 GB con Q4_K_M (533 MB).
- GPU recomendadas: cualquier GPU con al menos 3 GB de memoria para FP16; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible, aunque por tamaño cabe en GPUs de consumo como RTX 3060 o superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más; también en CPU y dispositivos móviles.
- Opciones de despliegue: Transformers (requiere `transformers>=5`), vLLM (según la model card, para FP16), llama.cpp, LM Studio, Ollama y PocketPal (Android/iOS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Persian-Agent | ~0,75B | no disponible (entrenado con 1.536) | fa, en | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen3.5-0.8B (base) | ~0,75B | no disponible | multilingüe (no detallado) | Apache 2.0 | safetensors |
| Alternativas de ~1B especializadas en persa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otras alternativas de la misma categoría, por lo que la comparación se limita a parámetros, licencia y formatos.

## Limitaciones y advertencias

- El contexto usado en entrenamiento es de solo 1.536 tokens; no se documenta la longitud de contexto máxima soportada, lo que limita conversaciones o documentos largos.
- Modelo de ~0,75B parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos mayores; riesgo de alucinación en preguntas de conocimiento general.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al entrenarse con mezclas de datasets persas e ingleses puede heredar sesgos de esas fuentes.
- Cobertura lingüística restringida a persa e inglés; el rendimiento en otros idiomas no está garantizado.
- Modo non-thinking: no genera cadenas de razonamiento explícitas, lo que puede reducir la precisión en tareas complejas de varios pasos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de los datasets de entrenamiento citados.
- El autor indica que los GGUF usan el layout clásico de tensores, lo que facilita la compatibilidad, pero conviene validar la versión de llama.cpp y la plantilla de chat en producción.
- No se han publicado benchmarks estándar ni evaluaciones independientes; las cifras de perplejidad provienen de una evaluación interna del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent
- Repositorio GGUF: https://huggingface.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
