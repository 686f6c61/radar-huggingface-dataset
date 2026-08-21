# casperhansen/Qwen3.5-0.8B-MXFP4xMXFP8

## Resumen

Qwen3.5-0.8B-MXFP4xMXFP8 es una cuantización post-entrenamiento (PTQ) del modelo Qwen/Qwen3.5-0.8B, producida por casperhansen con la librería llm-compressor. Aplica pesos en MXFP4 (4 bits) y activaciones en MXFP8 (8 bits) mediante redondeo al más cercano (RTN), sin datos de calibración ni paso forward del modelo. El autor la presenta explícitamente como un artefacto de desarrollo, no como una versión lista para producción.

El modelo base, Qwen3.5-0.8B, es el miembro más pequeño de la familia Qwen3.5 de Alibaba Cloud: una arquitectura híbrida de gated delta networks con 873 millones de parámetros, contexto nativo de 262 000 tokens y capacidades de visión. Esta cuantización reduce el peso del checkpoint a aproximadamente 1 GB, lo que lo hace apto para entornos con memoria muy limitada, incluido silicio compute-in-memory (DRAM) mediante el plugin vllm_runtime del autor.

La relevancia de esta ficha radica en que demuestra un flujo de cuantización MXFP4/MXFP8 sin calibración, reproducible con llm-compressor, y su integración con vLLM a través del backend compressed-tensors. Es útil para desarrolladores que necesitan evaluar el impacto de cuantizaciones agresivas en modelos pequeños antes de desplegarlos en edge o hardware especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated delta networks (modelo base Qwen3.5-0.8B) |
| Parametros totales | 873 438 784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | MXFP4 (pesos, E2M1) / MXFP8 (activaciones, E4M3); también existe variante INT-W8A8 del mismo autor |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe, pero la model card no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen3.5-0.8B, que emplea una arquitectura híbrida de gated delta networks (atención lineal con compuertas delta) combinada con componentes transformer clásicos. El modelo base fue entrenado por Alibaba Cloud con un contexto de 262 000 tokens y capacidades nativas de visión, operando por defecto en modo no-thinking (instruct), aunque soporta un modo híbrido thinking/no-thinking.

La cuantización se realizó con llm-compressor 0.13.0 y compressed-tensors 0.18.0, mediante PTQ sin calibración: pesos redondeados al más cercano (RTN) con escalas estáticas E8M0, y activaciones cuantizadas dinámicamente en tiempo de ejecución. Se mantienen en bf16 (sin cuantizar) el lm_head, los embeddings, la torre de visión, la cabeza MTP (multi-token prediction) y las proyecciones de atención lineal (in_proj_a/in_proj_b). No se aplicó ningún paso de fine-tuning ni ajuste con datos de calibración.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-0.8B, incluyendo instrucciones complejas y razonamiento multi-paso en modo thinking.
- Visión nativa: el modelo base incluye una torre de visión que se mantiene en bf16 en esta cuantización, por lo que conserva capacidades multimodales (entrada de imágenes).
- Modo híbrido thinking/no-thinking: el modelo base soporta ambos modos; la cuantización no altera esta funcionalidad.
- Multilingüe: el modelo base es multilingüe, aunque la model card de la cuantización no detalla los idiomas concretos.
- Compatibilidad con vLLM: se carga mediante el backend compressed-tensors de vLLM estándar.
- Ejecución en compute-in-memory: el plugin vllm_runtime de dram-computing permite ejecutar las capas lineales de decodificación bit-exactamente en silicio DRAM.
- Tool calling y funciones de agente: no se menciona en la documentación disponible; se considera no disponible.

## Casos de uso

- Despliegue en dispositivos de borde (smartphones, IoT): el tamaño reducido (1 GB de repo, ~2 GB de VRAM en el modelo base) permite ejecutar el modelo en hardware con memoria limitada, por ejemplo mediante vLLM o entornos de inferencia ligera.
- Inferencia en silicio compute-in-memory: el plugin vllm_runtime de dram-computing ejecuta las capas lineales de decodificación directamente en DRAM, lo que reduce la transferencia de datos y el consumo energético en hardware especializado.
- Prototipado rápido de cuantizaciones MXFP4/MXFP8: el flujo RTN sin calibración es reproducible con llm-compressor, útil para evaluar el impacto de cuantizaciones agresivas en modelos pequeños antes de escalar a versiones mayores.
- Modelo draft para decodificación especulativa: según vLLM Recipes, Qwen3.5-0.8B es adecuado como modelo borrador para acelerar la generación de checkpoints Qwen3.5 más grandes; esta cuantización reduce aún más su huella de memoria.
- Evaluación de calidad en cuantización de 4 bits: permite medir la degradación de precisión frente al modelo base en tareas de razonamiento, generación y visión, sin necesidad de GPUs de alta gama.
- Integración en pipelines de inferencia con vLLM: al ser un checkpoint compressed-tensors estándar, se puede desplegar en entornos de producción que ya usan vLLM, con la ventaja de un menor uso de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base sin cuantizar. Se recomienda evaluar la degradación de calidad en el caso de uso concreto antes de adoptar esta cuantización.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-0.8B requiere aproximadamente 2 GB de VRAM en precisión completa, y menos de 2 GB en cuantización de 4 bits (según LLM Releases). Esta variante MXFP4/MXFP8, con un repo de 1 GB, debería situarse en un rango similar, aunque no se proporciona un dato exacto.
- GPU recomendadas: no se especifican en la documentación; vLLM es compatible con GPUs NVIDIA (serie Ampere o superior recomendada para MXFP4), pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) podría ejecutar el modelo, aunque la latencia dependerá del hardware.
- Opciones de despliegue: vLLM (backend compressed-tensors), plugin vllm_runtime de dram-computing para compute-in-memory, y potencialmente llama.cpp u Ollama si se convierte a GGUF (no incluido en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 873 M | 262 K | bf16 | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-MXFP4xMXFP8 (este) | 873 M | 262 K | MXFP4/MXFP8 | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-INT-W8A8 | 873 M | 262 K | INT8 W8A8 | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamaño similar (por ejemplo, Qwen3-0.6B o SmolLM2) en la información proporcionada. La principal diferencia entre las variantes es el esquema de cuantización: MXFP4/MXFP8 ofrece mayor compresión (4 bits en pesos) frente a INT8, a costa de una posible mayor degradación de precisión.

## Limitaciones y advertencias

- Cuantización agresiva: los pesos en 4 bits (MXFP4) pueden provocar una pérdida notable de precisión en tareas de razonamiento complejo o generación de código, especialmente sin calibración.
- Sin calibración ni fine-tuning: el método RTN sin datos de calibración no optimiza las escalas para el dominio de uso, lo que puede amplificar errores en distribuciones fuera de lo común.
- Uso declarado para desarrollo: el autor indica explícitamente que el checkpoint se produjo con fines de desarrollo, no para producción.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero el modelo base Qwen3.5 puede presentar los sesgos típicos de los LLM entrenados con datos web; la cuantización no los corrige.
- Idiomas no especificados: aunque el modelo base es multilingüe, la model card no detalla qué idiomas conservan calidad aceptable tras la cuantización.
- Compatibilidad limitada: el plugin dram-computing es un proyecto específico del autor; su uso fuera de ese ecosistema requiere vLLM estándar con backend compressed-tensors.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de las dependencias (llm-compressor, compressed-tensors).

## Enlaces

- Modelo cuantizado: https://huggingface.co/casperhansen/Qwen3.5-0.8B-MXFP4xMXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante INT-W8A8: https://huggingface.co/casperhansen/Qwen3.5-0.8B-INT-W8A8
- Perfil del autor: https://huggingface.co/casperhansen
- vLLM Recipes (Qwen3.5-0.8B): https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- LLM Releases (Qwen3.5-0.8B): https://www.llm-releases.com/models/qwen3-5-0-8b
- Qualcomm AI Hub (Qwen3.5-0.8B): https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
