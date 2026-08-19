# btbtyler09/Qwen3.8-27B-GPTQ-8bit

## Resumen

Qwen3.8-27B-GPTQ-8bit es una cuantización GPTQ de 8 bits del modelo multimodal denso Qwen/Qwen3.8-27B, desarrollada por btbtyler09 (Tyler Brooker). El modelo base, lanzado por el equipo Qwen de Alibaba, es un modelo de 27 mil millones de parámetros con arquitectura híbrida que combina atención lineal (GatedDeltaNet) y atención completa, diseñado para tareas de codificación, razonamiento, agente y automatización de oficina. Esta versión cuantizada reduce el peso del modelo de ~56 GB a 31 GB, manteniendo una degradación de perplexity prácticamente nula (-0.02% en wikitext-2), lo que lo convierte en una opción atractiva para despliegue en entornos con recursos limitados.

La cuantización se realizó con GPTQModel v6.0.3, cuantizando todas las proyecciones lineales del decoder a INT8 con group size 32, mientras que el encoder de visión, el módulo MTP (Multi-Token Prediction), embeddings, normas y la cabeza de lenguaje se mantienen en BF16/FP16. El modelo conserva la ventana de contexto completa de 262 144 tokens y el soporte multimodal (imagen + texto), siendo compatible con vLLM, GPTQModel y transformers. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal texto+visión, densa) |
| Parametros totales | 27 781 427 952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | GPTQ 8-bit (INT8), group size 32, simétrico, desc_act no |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se especifican idiomas en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ quantized), compatible con vLLM y GPTQModel |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida de 64 capas, de las cuales 48 emplean atención lineal (GatedDeltaNet) y 16 atención completa, en un patrón repetido de 3:1. El tamaño oculto es de 5120 y el intermedio de 17408 con MLP denso (sin MoE). Incluye un encoder de visión ViT de 27 bloques en BF16 y un módulo MTP de 1 capa para decodificación especulativa. El contexto nativo es de 262 144 tokens.

La cuantización GPTQ de 8 bits se aplicó únicamente a las proyecciones lineales del decoder de texto (mlp, self_attn y linear_attn), manteniendo el encoder de visión, el módulo MTP, embeddings, normas y LM head en precisión completa. La calibración se realizó con un dataset mixto de evol-codealpaca-v1 (código) y C4 (texto general en inglés), con 256 muestras distribuidas uniformemente en longitudes de contexto de 256 a 2048 tokens. Esta elección de calibración prioriza el rendimiento fuera de distribución sobre la perplexity en wikitext, según indica el autor. No se proporcionan detalles sobre el entrenamiento del modelo base (número de tokens, dataset, técnicas de alineación como RLHF/DPO).

## Capacidades

- Multimodal: procesa imágenes y texto simultáneamente, permitiendo descripción de imágenes, respuesta a preguntas visuales y análisis de documentos escaneados.
- Generación de texto y razonamiento: capacidades de razonamiento configurable (thinking mode) y generación de respuestas estructuradas.
- Codificación: excelente rendimiento en tareas de programación, generación y depuración de código, según el repositorio oficial de Alibaba.
- Agente y multi-step reasoning: soporte para flujos de trabajo agénticos y razonamiento de largo horizonte.
- Contexto largo: ventana de 262 144 tokens para manejar documentos extensos, conversaciones multi-turno o análisis de código a gran escala.
- Decodificación especulativa: el módulo MTP (Multi-Token Prediction) permite acelerar la inferencia prediciendo múltiples tokens por paso.
- Tool calling / function calling: no se menciona explícitamente en la documentación, pero es una capacidad habitual en la familia Qwen3.x; se recomienda verificar en el modelo base.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, puede mantener conversaciones largas y recordar todo el historial del usuario, gestionando consultas complejas sin perder el hilo.
- Análisis de documentos con imágenes: procesa facturas, contratos o formularios escaneados, extrayendo y razonando sobre la información visual y textual de forma conjunta.
- Generación de código en producción: su rendimiento en tareas de programación y el soporte de contexto largo permiten integrarlo en pipelines de CI/CD para revisión de código, generación de tests o autocompletado avanzado.
- Agentes autónomos: su capacidad de razonamiento multi-paso y contexto extenso lo hace adecuado para agentes que ejecutan tareas de oficina, como redactar correos, resumir reuniones o gestionar calendarios.
- Asistente de investigación: puede leer papers largos (incluyendo figuras y tablas), resumir hallazgos y responder preguntas técnicas con citas contextuales.
- Despliegue en entornos con VRAM limitada: al ocupar solo 31 GB en 8 bits (o 21 GB en la variante 4-bit), permite ejecutar un modelo de 27B en hardware de consumo (RTX 4090 con 24 GB para 4-bit, o 2x RTX 4090 para 8-bit) con vLLM o LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es perplexity en wikitext-2-raw-v1 (test set, seq_len=2048, stride=512):

| Modelo | Perplexity | Degradación |
|---|---|---|
| BF16 (original) | 6.4457 | — |
| GPTQ 8-bit (este) | 6.4446 | -0.02% (dentro del ruido, efectivamente lossless) |
| GPTQ 4-bit FOEM | 6.4982 | +0.81% |

## Requisitos de hardware

- Tamaño del modelo: 31 GB en disco (8-bit), incluyendo encoder de visión (~1.2 GB) y MTP (~0.85 GB) en BF16.
- VRAM estimada para inferencia: al menos 32 GB para los pesos en FP16/INT8, más espacio para KV cache. Con contexto completo de 262K tokens, se recomienda 4× GPU con tensor parallelism.
- GPU recomendadas: 4× A100 40GB o 4× RTX 4090 24GB (con tensor parallel size 4). Para contexto reducido (p.ej. 32K), podría caber en 2× RTX 4090.
- Compatibilidad con consumer GPU: la versión 4-bit (21 GB) cabe en una RTX 4090 de 24 GB; la 8-bit requiere al menos 2 GPUs de 24 GB con tensor parallelism.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para GPTQ y multimodal), GPTQModel, transformers (AutoModelForImageTextToText), LM Studio (para consumer GPUs).
- Latencia y throughput: no disponible en la documentación. Se espera que el módulo MTP mejore la velocidad de decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Tamaño | Perplexity (wikitext-2) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27.8B | 262K | BF16 | ~56 GB | 6.4457 | Apache 2.0 |
| Qwen3.8-27B-GPTQ-8bit (este) | 27.8B | 262K | INT8 | 31 GB | 6.4446 | Apache 2.0 |
| Qwen3.8-27B-GPTQ-4bit FOEM | 27.8B | 262K | INT4 | 21 GB | 6.4982 | Apache 2.0 |

No se dispone de datos de otros modelos comparables de la misma categoría (p.ej. Qwen2.5-VL-27B o Llama-3.2-27B) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos específicos en esta versión cuantizada; el modelo base puede presentar sesgos inherentes a los datos de entrenamiento de Qwen.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- Limitaciones de contexto: aunque soporta 262K tokens, el rendimiento en longitudes extremas puede degradarse; se recomienda validar en casos de uso reales.
- Cuantización: aunque la perplexity es prácticamente idéntica, la cuantización GPTQ puede afectar a tareas específicas no cubiertas por la calibración; se recomienda probar en el dominio objetivo.
- Bug conocido en vLLM: hasta vLLM 0.19.x, existe un error en la configuración de `ignore_keys_at_rope_validation` (lista en lugar de conjunto) que requiere un parche manual antes de servir el modelo.
- Requisitos de hardware: la inferencia con contexto completo exige múltiples GPUs; no es viable en una sola GPU de consumo para la versión 8-bit.
- Idiomas: no se especifican los idiomas soportados; el modelo base Qwen3.8-27B es multilingüe, pero la documentación de esta cuantización no detalla la cobertura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/btbtyler09/Qwen3.8-27B-GPTQ-8bit
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 4-bit FOEM: https://huggingface.co/btbtyler09/Qwen3.8-27B-GPTQ-4bit
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
