# ai-sage/GigaChat4-708B-A41B

## Resumen

GigaChat 4 es el modelo insignia de la familia GigaChat, desarrollado por ai-sage (el equipo de Sber/SaluteDevices detrás de GigaChat). Se trata de un modelo de lenguaje de arquitectura híbrida que combina Mixture-of-Experts (MoE) con atención dispersa tipo DeepSeek Sparse Attention (DSA) y capas recurrentes Gated DeltaNet (GDN). Con 708B parámetros totales y 41B activos por token, está disenado para conversación multilingüe, tareas agénticas de varios pasos, tool calling, salidas estructuradas, razonamiento matemático, código y question answering sobre documentos largos.

Su rasgo diferencial es la ventana de contexto de 1.048.576 tokens (1M), construida mediante extensión progresiva desde 32K hasta 1M. Además, unifica en un único checkpoint los modos "instant" y "reasoning", que en la generación anterior (GigaChat 3.5) requerían checkpoints separados. El modelo incorpora decodificación especulativa mediante un drafter MTP recurrente o un drafter independiente DFlash2.

Esta ficha corresponde a la variante FP8 instruction-tuned, publicada bajo licencia MIT, con pesos en safetensors y soporte para ruso e inglés. El repositorio ocupa 726,2 GB y el modelo declara 710.235.315.584 parámetros reales según safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención MLA + DSA y capas GatedDeltaNet (GDN); proporción 3:1 GDN:DSA |
| Parametros totales | 708B (710.235.315.584 según safetensors) |
| Parametros activos | 41B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta variante); BF16 (variante base); GGUF (repositorio separado) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8); existen variantes BF16 y GGUF |

Otras especificaciones de arquitectura: 64 capas de decoder, hidden size de 7.168, 48 capas de atención lineal y 16 de atención dispersa, 256 expertos enrutados con 8 activos por token y 1 experto compartido, 3 capas iniciales con FFN densas, 2.048 tokens DSA seleccionados por query y 1 capa MTP integrada reutilizada de forma recurrente.

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que intercala capas GatedDeltaNet y capas de atención dispersa (DSA) en proporción 3:1. GatedDeltaNet mantiene un estado recurrente de tamano fijo para procesar secuencias de forma eficiente, mientras que las capas DSA, construidas sobre atención multi-head latent (MLA), seleccionan 2.048 tokens anteriores por query para recuperar información de contextos largos. Cada capa MoE combina un bloque de atención con expertos compartidos y enrutados (8 de 256 por token), aplicando GatedNorm a las salidas de bloque antes de la suma residual.

La ventana de contexto se extendió de forma progresiva: de 32K a 128K y finalmente a 1M tokens. DSA se introdujo a 128K mediante entrenamiento solo del indexer, seguido de optimización conjunta del indexer y el backbone a 1M. Para estabilidad del preentrenamiento a escala se usaron técnicas como Progressive Residual Warm-up (ProRes), z-loss específico por proyección con softcapping de logits y Dynamic Learning-Rate Rescaling (DLR) para desequilibrios persistentes de carga de expertos.

Tras el supervised fine-tuning, se entrenaron modelos expertos con reinforcement learning en matemáticas, código, uso de herramientas y flujos agénticos multi-turno. Estos expertos se consolidaron en un único modelo mediante destilación on-policy multi-profesor (el estudiante genera sus propias respuestas y recibe feedback específico de cada profesor), usando el optimizador Muon. El resultado soporta modos instant y reasoning en un solo checkpoint. La decodificación especulativa se apoya en un drafter MTP recurrente estilo EAGLE-3 (una sola capa de predicción reutilizada, ~3× menos parámetros que los tres bloques MTP de GigaChat 3.5) o en DFlash2, un drafter BF16 de cinco capas que predice bloques de ocho posiciones en paralelo (un token ancla y siete de borrador).

## Capacidades

- Generación de texto conversacional multilingüe (ruso e inglés) en modo instant y modo reasoning, seleccionable por petición.
- Razonamiento multi-paso y matemáticas, reforzado mediante RL y destilación de expertos.
- Generación de código e integración en tareas de programación.
- Tool calling y function calling.
- Salidas estructuradas (structured output).
- Flujos agénticos multi-turno y razonamiento de varios pasos.
- Question answering sobre documentos largos gracias a la ventana de 1M tokens.
- Decodificación especulativa integrada (MTP recurrente y DFlash2) para acelerar la generación autoregresiva.
- Capacidades multilingües limitadas a ruso e inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno en ruso e inglés con contexto de hasta 1M tokens, lo que permite mantener historiales largos de cliente sin truncar y alternar entre respuestas instantáneas y razonadas según la consulta.
- Análisis de documentos extensos: question answering sobre contratos, informes o expedientes de cientos de miles de tokens, aprovechando DSA para recuperar pasajes relevantes dentro de la ventana de 1M.
- Agentes autónomos con herramientas: orquestación de flujos multi-paso con function calling y salidas estructuradas para integrar APIs, bases de datos o servicios internos en pipelines agénticos.
- Asistencia a la programación: generación y revisión de código, con soporte de tool calling para integrarse en entornos de desarrollo o pipelines de CI/CD que consulten repositorios y ejecuten pruebas.
- Razonamiento matemático y análisis cuantitativo: resolución de problemas de varios pasos en modo reasoning, útil en entornos educativos, financieros o de ingeniería.
- Extracción de información estructurada: procesamiento de documentos largos para producir JSON u otros formatos validables mediante structured output, por ejemplo en digitalización de expedientes.
- Despliegue en producción de alta concurrencia: la combinación de MoE con 41B activos, FP8 y decodificación especulativa reduce el coste por token frente a un modelo denso de 708B, adecuado para servir cargas sostenidas en infraestructura multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona tablas de evaluación, pero el contenido proporcionado se interrumpe antes de incluir los valores numéricos, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 de 708B ocupan aproximadamente 708 GB, por lo que la inferencia requiere agregación de memoria entre varias GPU; no cabe en una sola GPU de 80 GB ni en GPUs de consumo.
- GPU recomendadas: clústeres multi-GPU con H100 (80 GB) o A100 (80 GB); el número exacto de GPUs depende del backend y del paralelismo de tensor/pipeline configurado, dato no disponible en la información proporcionada.
- GPU de consumo: no es viable en RTX 4090 ni en GPUs consumer; la variante GGUF podría permitir despliegues con offloading parcial, pero los requisitos concretos no están detallados en la información disponible.
- Opciones de despliegue: SGLang (hay un cookbook específico para GigaChat 4); la model card no detalla otros backends, aunque la existencia de una variante GGUF sugiere soporte en llama.cpp/Ollama, sin confirmación explícita.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP recurrente o DFlash2 está orientada a acelerar la generación, pero no se publican cifras de rendimiento en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (modelos MoE de gran escala con contexto largo). Los datos objetivos disponibles son: 708B parámetros totales, 41B activos, contexto de 1M tokens, licencia MIT, pesos FP8/BF16/GGUF y soporte de ruso e inglés.

| Modelo | Parametros totales / activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| GigaChat4-708B-A41B | 708B / 41B | 1.048.576 | MIT | ru, en |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado a gran escala, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: no se cuantifica en la model card; debe validarse en producción, especialmente en modo reasoning y en tareas de QA sobre documentos.
- Limitaciones de idioma: la model card declara únicamente ruso e inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero conviene revisar los términos completos del repositorio y de los componentes asociados (drafter DFlash2, tokenizer, etc.).
- Requisitos de infraestructura: el tamano de 708B en FP8 exige despliegue multi-GPU; no es apto para hardware de consumo.
- Contexto largo: aunque la ventana es de 1M tokens, la calidad de recuperación a esa distancia no se cuantifica en la información disponible y debe evaluarse empíricamente.
- Dependencia de backends específicos: el soporte documentado se centra en SGLang; otros backends pueden requerir configuración adicional.
- Fecha de publicación reciente (noviembre de 2026) y pocas descargas/interacciones registradas, lo que limita la evidencia comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- Informe técnico: https://github.com/salute-developers/gigachat4/blob/main/GigaChat_4.pdf
- Blog: https://giga.chat/blog/en
- Colección de modelos: https://huggingface.co/collections/ai-sage/gigachat-4
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/GigaChat/GigaChat4
- GitHub: https://github.com/salute-developers/gigachat4
- Variante GGUF: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-GGUF
- Variante BF16: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-bf16
- Modelo base: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-base
- Checkpoints intermedios: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-checkpoints
