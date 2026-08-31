# OS-Software/Qwen3.8-27B-Uncensored-Heretic-v2-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Heretic-v2-GGUF es una versión "decensored" (sin censura) del modelo Qwen3.8-27B de Alibaba, creada por OS-Software mediante la técnica de abliteración Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA) usando un adaptador LoRA y preservación de norma de fila. El objetivo es eliminar los mecanismos de rechazo y alineamiento de seguridad del modelo original a nivel de pesos, no solo mediante prompting, lo que lo hace útil para investigación en seguridad, red-teaming y estudios de alineamiento.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal denso de 27B parámetros con arquitectura híbrida (Gated DeltaNet de atención lineal + atención completa), nativo de visión-lenguaje (imágenes y vídeo), con contexto nativo de 262.144 tokens extensible a 1M, y entrenado con Multi-Token Prediction (MTP) para decodificación especulativa. Esta versión GGUF está cuantizada y lista para su uso con llama.cpp, Ollama y otros motores compatibles.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un LLM de última generación sin las barreras de seguridad habituales, facilitando la investigación sobre alineamiento, robustez y los efectos de la abliteración. Sin embargo, el autor advierte explícitamente que no debe desplegarse en servicios públicos ni usarse en producción, y que todos los outputs deben tratarse como no confiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa), 64 capas, MTP (Multi-Token Prediction) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc. (según repo; se mencionan Q3_K_M y Q4_K_M en la documentación) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica en la información proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention). El layout oculto es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 48 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), y 24 cabezas Q y 4 KV en la atención completa (dimensión de cabeza 256, RoPE dim 64). El FFN tiene dimensión intermedia de 17.408. Incluye un módulo MTP (Multi-Token Prediction) que predice varios tokens a la vez, lo que permite decodificación especulativa y acelera la inferencia.

El proceso de abliteración aplicado por OS-Software utiliza Heretic v1.4.0+custom con el método ARA (Arbitrary-Rank Ablation) sobre las capas 27 a 48, con un adaptador LoRA y preservación de norma de fila. Los parámetros clave del proceso son: preserve_good_behavior_weight = 1,0, steer_bad_behavior_weight = 0,0158, overcorrect_relative_weight = 1,9506, neighbor_count = 1, optimizer ot_ridge y ridge_regularization = 0,0002. El resultado es una reducción drástica de la tasa de rechazo (Keywords: 0/100 frente a 98/100 del original) con una divergencia KL de 0,0182 respecto al modelo base, lo que indica que el comportamiento general se mantiene en gran medida.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento complejo y multi-step.
- Generación de código y matemáticas: el modelo base está optimizado para tareas de programación y razonamiento matemático.
- Comprensión de visión y vídeo: al ser un modelo nativo de visión-lenguaje, puede procesar imágenes y vídeos (aunque esta versión GGUF incluye el proyector de visión mmproj en algunas builds).
- Tool calling / function calling: soportado por el modelo base, permite integración con herramientas externas.
- Capacidades de agente: planificación autónoma y manejo de feedback del entorno, diseñado para tareas de larga duración.
- Thinking mode: modo de razonamiento activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y preservación de contexto de razonamiento con `preserve_thinking`.
- Decodificación especulativa: gracias al módulo MTP, puede acelerar la generación.
- Comportamiento "uncensored": el modelo no rechaza peticiones que el modelo original rechazaría, lo que permite explorar contenido sensible en entornos de investigación controlados.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin alineamiento de seguridad, identificando vulnerabilidades, sesgos y riesgos potenciales en sistemas de IA.
- Red-teaming de modelos: ideal para probar defensas y mecanismos de seguridad en otros sistemas, generando ataques adversariales y prompts maliciosos que un modelo alineado rechazaría.
- Estudios de alineamiento: comparar el comportamiento de este modelo con el original (Qwen3.8-27B) permite medir el impacto de la abliteración en la utilidad, la coherencia y la seguridad.
- Evaluación de técnicas de mitigación: probar filtros de contenido, clasificadores de seguridad o sistemas de moderación contra un modelo sin restricciones.
- Investigación en sesgos y toxicidad: analizar qué tipo de contenido sesgado u ofensivo emerge cuando se eliminan las barreras de seguridad, contribuyendo a la literatura sobre sesgos en LLM.
- Desarrollo de benchmarks de seguridad: generar datasets de evaluación para medir la robustez de otros modelos frente a contenido dañino.
- Experimentación académica en entornos aislados: uso en laboratorios de investigación con sandboxing y supervisión humana, sin exposición a usuarios finales.

## Benchmarks y rendimiento

La model card proporciona dos métricas específicas del proceso de abliteración:

| Metrica | Modelo abliterado | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Keywords (tasa de rechazo) | 0/100 | 98/100 |
| KL divergence | 0,0182 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión abliterada en la información disponible. El modelo base Qwen3.8-27B tiene resultados de benchmarks que se mencionan en la model card original, pero no se incluyen en la información proporcionada. No se dispone de datos de rendimiento comparativo con otros modelos abliterados.

## Requisitos de hardware

- VRAM estimada para inferencia: según la documentación encontrada, la cuantización Q3_K_M ocupa aproximadamente 13,5 GB y la Q4_K_M unos 16,8 GB. En FP16 el modelo completo requeriría ~54 GB.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q8 o FP16 se necesitan GPUs de 48 GB o más (A6000, A100, H100).
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q3 y Q4 caben en GPUs de 16-24 GB (RTX 4080, RTX 4090, etc.).
- Opciones de despliegue: llama.cpp, Ollama (hay builds disponibles), vLLM (para el modelo base en safetensors), SGLang, TokenSpeed, MLX (en Apple Silicon).
- Latencia y throughput: no disponible. El módulo MTP del modelo base permite decodificación especulativa, lo que puede mejorar el throughput en comparación con modelos densos equivalentes, pero no se han publicado cifras concretas para esta versión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262K (ext. 1M) | Híbrida DeltaNet + Attention, visión-lenguaje | Apache-2.0 | Modelo original con alineamiento de seguridad |
| Qwen3.8-27B-Uncensored-Heretic-v2 (este) | 26,9B | 262K (ext. 1M) | Híbrida, abliterado con Heretic ARA | Apache-2.0 | Sin rechazo, para investigación |
| Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF (llmfan46) | 26,9B | 262K (ext. 1M) | Híbrida, abliterado, MTP preservado | Apache-2.0 | Variante similar de otro autor |
| Qwen3.8-27B-MTP-heretic-ja (OS-Software) | 26,9B | 262K (ext. 1M) | Híbrida, abliterado con dataset japonés | Apache-2.0 | Enfocado a evaluación en japonés |

No se dispone de datos de benchmarks comparativos entre estas variantes. Todas derivan del mismo modelo base y comparten arquitectura y licencia.

## Limitaciones y advertencias

- El modelo ha sufrido una reducción sustancial de su alineamiento de seguridad, por lo que es más propenso a generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado que el modelo original.
- El autor recomienda explícitamente no desplegarlo en servicios públicos o orientados a usuarios finales. Su uso debe limitarse a investigación y experimentación.
- Todos los outputs deben tratarse como no confiables y verificarse de forma independiente antes de cualquier uso.
- Riesgo de alucinación: al igual que el modelo base, puede generar información falsa o inventada, y la falta de alineamiento puede aumentar la confianza en respuestas incorrectas.
- Sesgos: el modelo puede amplificar sesgos presentes en los datos de entrenamiento, sin los filtros de seguridad que normalmente los mitigan.
- Limitaciones de idioma: no se especifican los idiomas soportados en la información proporcionada; el modelo base Qwen3.8 es multilingüe, pero esta versión no documenta su cobertura.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el autor desaconseja su uso en producción y no ofrece garantías. El usuario es responsable del cumplimiento legal y ético.
- El pipeline_tag declarado en HuggingFace es "image-text-to-image", lo que parece un error de etiquetado; el modelo es un LLM con visión, no un generador de imágenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- GitHub de referencia (Qwen 3.8 27B Uncensored): https://github.com/Wassimyounes01/qwen38-uncensored
- Variante similar en HuggingFace: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Variante con dataset japonés: https://huggingface.co/OS-Software/Qwen3.8-27B-MTP-heretic-ja
- Build de Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored:latest
- Referencia en NanoGPT: https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored
