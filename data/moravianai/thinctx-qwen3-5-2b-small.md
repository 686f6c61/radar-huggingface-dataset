# moravianai/ThinCtx-Qwen3.5-2B-small

## Resumen

ThinCtx-Qwen3.5-2B-small es una conversión optimizada para memoria del modelo Qwen3.5-2B, desarrollada por Moravian AI bajo su runtime propietario ThinCtx. El modelo resuelve un problema concreto: mantener la calidad de Qwen3.5-2B reduciendo drásticamente el consumo de memoria GPU asociado al contexto largo. Según la model card, consigue 1,9/2,2 GB de memoria GPU a 128k/540k tokens de contexto, frente a los 5,1/9,8 GB del original, con pesos cuantizados a unos 6,4 bits por peso y un almacén de contexto comprimido 2,5-3× en RAM del sistema.

La arquitectura subyacente es la del transformer Qwen3.5-2B (1,88B parámetros), sobre el que ThinCtx aplica su propia capa de gestión de contexto: la parte del contexto que reside en GPU es pequeña y crece lentamente (0,63 KB por token frente a 12 KB del original), mientras el contexto completo se mantiene en memoria del sistema. Esta variante "small" añade además cuantización de pesos y compresión del contexto en RAM, resultando en una descarga de 1,81 GB frente a los 3,94 GB de la variante de precisión completa.

Es relevante ahora porque permite desplegar conversaciones de hasta 540k tokens en hardware de gama media, algo inviable con el modelo original sin infraestructura de mayor coste. La contrapartida principal es la dependencia total del runtime thinctx (no funciona con vLLM, llama.cpp ni otras librerías de inferencia estándar) y una licencia PolyForm Small Business 1.0.0 que restringe el uso comercial en organizaciones grandes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) con runtime ThinCtx de gestión de contexto |
| Parámetros totales | 1,88B (el recuento de HF de 1.728.320 corresponde solo a tensores de 16 bits en `model.safetensors`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 540k tokens (128k y 540k medidos en la model card) |
| Tipos de cuantización | Pesos a ~6,4 bits por peso (capas transformer); contexto en RAM comprimido 2,5-3× |
| Idiomas soportados | Multilingüe; calibrado y probado en inglés, checo y alemán (en, cs, de) |
| Licencia | PolyForm Small Business 1.0.0 (licencia "other") |
| Formato de pesos | safetensors (`model.safetensors` para 16 bits, `aux1.safetensors` para pesos cuantizados empaquetados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de 1,88B parámetros. ThinCtx no modifica la arquitectura del transformer en sí, sino que introduce un mecanismo de gestión de contexto que separa la memoria del contexto entre GPU y RAM del sistema. La parte residente en GPU es pequeña y crece a 0,63 KB por token, mientras el contexto completo se almacena en memoria del sistema con compresión de 2,5-3×. Esta variante "small" cuantiza además los pesos a ~6,4 bits, reduciendo la descarga de 3,94 GB a 1,81 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card indica que el modelo está calibrado y probado en inglés, checo y alemán, y que usa la plantilla de chat de Qwen3.5 para conversación y tool calling. La innovación técnica destacable es el propio runtime ThinCtx, que con la versión 1.0 o superior permite compartir la memoria del system prompt entre conversaciones que lo comparten (en Linux), reduciendo el coste marginal por conversación.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 540k tokens).
- Tool calling / function calling: la model card reporta BFCL 69,0 frente a 60,0 del original en los mismos ítems.
- Modo thinking: el servidor OpenAI-compatible acepta el parámetro `enable_thinking`.
- Capacidades multilingües en inglés, checo y alemán (calibrado y probado en estos idiomas).
- Razonamiento de múltiples pasos y uso en agentes, implícito por el soporte de tools y contexto largo.
- Servidor compatible con la API OpenAI chat-completions (`/v1/chat/completions`), con streaming y autenticación básica opcional.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 540k tokens, manteniendo la memoria GPU en 1,9-2,2 GB, lo que permite atender muchas conversaciones concurrentes en una sola GPU de gama media.
- Análisis de documentos extensos: procesar contratos, informes o expedientes de cientos de miles de tokens manteniendo el contexto completo en RAM del sistema y solo una fracción en GPU, reduciendo el coste de infraestructura frente al modelo original.
- Asistentes con function calling en producción: el rendimiento BFCL superior al original (69,0 vs 60,0) lo hace adecuado para pipelines que invocan herramientas externas, con integración directa vía endpoint OpenAI-compatible.
- Despliegue en hardware de consumo: con 1,9-2,2 GB de VRAM para pesos y contexto en GPU, cabe en GPUs consumer NVIDIA, permitiendo prototipado y demos locales sin clúster.
- Procesamiento multilingüe en inglés, checo y alemán: útil para aplicaciones centroeuropeas que requieran conversación y herramientas en esos tres idiomas.
- Compartición de system prompt en despliegues multi-tenant: con thinctx 1.0+ en Linux, las conversaciones que comparten system prompt comparten su memoria en GPU y RAM, reduciendo el coste marginal por conversación en servicios con muchos usuarios.
- Investigación y evaluación: uso gratuito para investigación no comercial y evaluación por parte de cualquier organización, lo que facilita su estudio académico.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-2B-small | Qwen3.5-2B (original) |
|---|---|---|
| BFCL (function calling, mismos ítems) | 69,0 | 60,0 |
| Memoria GPU a 128k tokens | 1,9 GB | 5,1 GB |
| Memoria GPU a 540k tokens | 2,2 GB | 9,8 GB |
| Crecimiento de contexto en GPU por token | 0,63 KB | 12 KB |
| Descarga | 1,81 GB | 3,94 GB (variante ThinCtx 16-bit) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica además que ThinCtx lee prompts largos más lentamente que el modelo base, pero que la generación es más rápida que el original en vLLM a partir de 512k tokens de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,9 GB a 128k tokens y 2,2 GB a 540k tokens (pesos + contexto en GPU).
- GPU recomendadas: NVIDIA con soporte CUDA 13 (driver actual); el wheel por defecto de PyTorch 2.11 requiere CUDA 13, con opción cu128 para drivers antiguos.
- Cabe en GPU consumer NVIDIA: sí, con 1,9-2,2 GB de VRAM para el modelo, aunque se necesita RAM del sistema adicional para el contexto completo.
- Plataformas: Linux x86_64 o Windows 10/11 vía WSL2. macOS no soportado.
- Despliegue: exclusivamente mediante el runtime thinctx (>= 0.3.1; recomendado >= 1.0.1). No compatible con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Servidor: `thinctx serve` expone una API OpenAI-compatible en el puerto indicado.
- Latencia y throughput: no se publican cifras concretas; la model card indica lectura de prompts largos más lenta que el original y generación más rápida que vLLM a partir de 512k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria GPU (128k) | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-2B-small | 1,88B | 540k | 1,9 GB | PolyForm Small Business 1.0.0 | thinctx |
| ThinCtx-Qwen3.5-2B | 1,88B | 540k | 1,9 GB | PolyForm Small Business 1.0.0 | thinctx |
| Qwen3.5-2B (original) | 1,88B | no disponible | 5,1 GB | no disponible | vLLM y otros |

La comparativa con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime thinctx: los pesos no funcionan con vLLM, llama.cpp, Ollama ni otras librerías estándar, lo que limita la portabilidad y obliga a mantener un entorno específico.
- Plataformas restringidas: solo Linux x86_64 y Windows vía WSL2; macOS no está soportado.
- La compartición de memoria entre conversaciones con el mismo system prompt solo funciona de forma nativa en Linux (WSL no la soporta).
- Lectura de prompts largos más lenta que el modelo base, lo que puede penalizar casos de uso con entradas muy extensas y poca generación.
- Licencia PolyForm Small Business 1.0.0: uso gratuito para pequeñas empresas, uso personal, investigación no comercial, educación y evaluación; las organizaciones grandes en producción requieren licencia comercial (contacto info@moravian.ai).
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al derivar de Qwen3.5-2B, hereda los sesgos del modelo base, no cuantificados aquí.
- Idiomas: calibrado y probado solo en inglés, checo y alemán; el rendimiento en otros idiomas no está garantizado.
- El recuento de parámetros mostrado por Hugging Face (1.728.320) es engañoso: solo cuenta tensores de 16 bits y no refleja los 1,88B reales.
- Requiere compilador gcc para Triton en el primer arranque (build-essential en Debian/Ubuntu).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B-small
- Variante de precisión completa: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio de Moravian AI: https://moravian.ai/
- Contacto comercial: info@moravian.ai
