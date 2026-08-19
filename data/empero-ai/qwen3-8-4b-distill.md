# empero-ai/Qwen3.8-4B-Distill

## Resumen

Qwen3.8-4B es un modelo de lenguaje causal de 4.000 millones de parámetros desarrollado por Empero, un laboratorio independiente de investigación en IA con sede en Alemania. Se trata de una destilación de parámetros completos del modelo profesor Qwen3.8 2.4T A95B (un modelo de escala frontera con arquitectura de mezcla de expertos) sobre la arquitectura del modelo base Qwen3.5-4B de Alibaba. El objetivo es trasladar el comportamiento de razonamiento de un modelo de gran escala a un modelo de 4B que pueda ejecutarse en hardware de consumo.

El modelo fue entrenado mediante fine-tuning supervisado (SFT) off-policy sobre aproximadamente 45.000 trazas de profesor curadas, que incluyen cadenas de pensamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones. Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del profesor, en lugar de razonamiento sintético autogenerado. Hereda del base una ventana de contexto nativa de 262.144 tokens y soporte nativo de function calling según la especificación de Qwen3.5.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento de nivel frontera en un formato compacto de 4B, con licencia Apache-2.0 y compatible con runtimes estándar como Hugging Face Transformers, vLLM y SGLang. Está orientado a desarrolladores e investigadores que necesitan un modelo de razonamiento eficiente y desplegable en GPUs de consumo, sin renunciar a la capacidad de tool calling ni al contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (Gated DeltaNet) y atención completa, heredada de Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor menciona builds cuantizados para portátiles, pero no especifica formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, que combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet. Esta arquitectura híbrida permite manejar ventanas de contexto muy largas (262.144 tokens) con un coste computacional reducido en las capas lineales, aunque requiere kernels especializados (`flash-linear-attention` y `causal_conv1d`) para un rendimiento óptimo; sin ellos, las capas lineales caen en operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento consistió en un fine-tuning supervisado (SFT) off-policy de todos los parámetros (no un adaptador) sobre aproximadamente 45.000 trazas de profesor curadas, extraídas de los datasets internos de destilación de Qwen3.8. Las trazas incluyen cadenas de pensamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. El profesor es el modelo Qwen3.8 2.4T A95B, un modelo de escala frontera con arquitectura de mezcla de expertos. El objetivo era transferir el comportamiento de razonamiento del profesor al estudiante de 4B, de modo que cada respuesta abra con un bloque `thinking` aprendido directamente de las trazas del profesor.

## Capacidades

- Generación de texto con razonamiento explícito: cada respuesta comienza con un bloque `thinking` que muestra la cadena de pensamiento aprendida del profesor.
- Razonamiento matemático y lógico: la mezcla de trazas enfatiza matemáticas, razonamiento general y seguimiento de instrucciones.
- Function calling nativo: soporta la especificación de function calling de Qwen3.5 sin necesidad de wrappers ni fine-tuning específico de herramientas.
- Contexto largo: ventana nativa de 262.144 tokens, heredada del base Qwen3.5-4B.
- Compatibilidad con runtimes estándar: Transformers, vLLM, SGLang y otros con soporte de arquitectura Qwen3.5.
- Texto solamente: el fine-tuning es solo de texto; el comportamiento de visión se hereda del base pero no fue evaluado por el autor.

## Casos de uso

- Asistentes de razonamiento matemático y educativo: el modelo puede resolver problemas de matemáticas paso a paso, mostrando su cadena de pensamiento en el bloque `thinking`, lo que lo hace útil para tutorías y generación de explicaciones didácticas.
- Agentes con tool calling en producción: su soporte nativo de function calling permite integrarlo en pipelines de agentes que necesitan llamar a APIs, bases de datos o servicios externos, con un coste de inferencia reducido frente a modelos más grandes.
- Análisis de documentos largos: gracias a su contexto de 262.144 tokens, puede procesar documentos extensos (contratos, informes, artículos) en una sola pasada, resumiendo o extrayendo información relevante.
- Atención al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interacción y razonando sobre las respuestas antes de generarlas.
- Prototipado rápido de aplicaciones de IA: su tamaño compacto y licencia Apache-2.0 permiten desplegarlo en entornos de desarrollo locales con GPUs de consumo, acelerando la iteración de ideas.
- Investigación en destilación de modelos: sirve como caso de estudio de cómo transferir capacidades de razonamiento de un modelo MoE de 2.4T a un modelo denso de 4B, con métricas comparativas publicadas.

## Benchmarks y rendimiento

El autor publicó resultados medidos con `lm-evaluation-harness` (backend HF), con ajustes idénticos para el base y el estudiante. Ambos son modelos de razonamiento y se evaluaron con protocolos de cadena de pensamiento (CoT). MMLU cubre los 57 sujetos (~1.700 preguntas). La métrica principal es flexible-extract; strict-match requiere formato exacto de respuesta.

| Tarea | Métrica | Qwen3.5-4B (base) | Qwen3.8-4B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.850 | 0.785 | −0.065 |
| gsm8k_cot | exact_match (strict) | 0.850 | 0.785 | −0.065 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.354 | 0.553 | +0.199 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.071 | 0.233 | +0.162 |

Parámetros de muestreo: `temperature=0.6, top_p=0.95, top_k=20` (configuración recomendada de Qwen3.5). El modelo mejora significativamente en MMLU (+0.199 en flexible-extract) pero degrada en GSM8K (−0.065), lo que sugiere que la destilación favoreció el razonamiento general sobre la aritmética específica.

## Requisitos de hardware

- VRAM estimada: el autor indica que bf16 ocupa aproximadamente 8 GB; el repositorio pesa 9.3 GB. Para inferencia cómoda en bf16 se recomienda una GPU con al menos 12 GB de VRAM.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con 12 GB o más de memoria. Las builds cuantizadas pueden ejecutarse en portátiles y GPUs de consumo con menos VRAM.
- Despliegue: compatible con vLLM, SGLang, Hugging Face Transformers y otros runtimes con soporte de arquitectura Qwen3.5. Para un rendimiento óptimo se requieren los kernels `flash-linear-attention` y `causal_conv1d` (con versión CUDA compatible).
- Latencia y throughput: no disponible. Depende del hardware, la cuantización y la longitud de las secuencias generadas. El autor recomienda `max_new_tokens` generosos (16.384) debido al bloque `thinking` inicial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.8-4B (este) | 4.66B | 262.144 | 0.553 | 0.785 | Apache-2.0 |
| Qwen3.5-4B (base) | ~4B | 262.144 | 0.354 | 0.850 | Apache-2.0 |

No se dispone de datos comparativos con otros modelos de la misma categoría (p. ej., Qwen3-4B, Llama-3.2-3B, Phi-4) en la información proporcionada. El autor menciona que para un rendimiento de código más fuerte en la familia, se debe usar Qwen3.8-9B, pero no se aportan métricas.

## Limitaciones y advertencias

- Rendimiento inferior en GSM8K respecto al base: el modelo degrada en aritmética concreta (−0.065), aunque mejora en MMLU general. No es adecuado para tareas que requieran cálculo numérico preciso sin verificación.
- Sesgo hacia matemáticas, razonamiento e instrucciones: la mezcla de trazas del profesor enfatiza estos dominios; el rendimiento en código es limitado, y el autor recomienda explícitamente el modelo de 9B para tareas de programación.
- Comportamiento de visión no evaluado: aunque el base es un modelo de visión-lenguaje, el fine-tuning es solo de texto y el autor no ha evaluado las capacidades visuales heredadas.
- Riesgo de bucles de repetición con decodificación greedy: el autor advierte que la decodificación greedy en generaciones largas es un modo de fallo conocido para modelos de razonamiento de esta clase; se recomienda muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- Dependencia de kernels especializados: sin `flash-linear-attention` y `causal_conv1d`, las capas de atención lineal caen en operaciones PyTorch lentas y con alto consumo de memoria, lo que puede degradar gravemente el rendimiento en producción.
- Idioma limitado: la model card solo indica inglés; no se garantiza un rendimiento multilingüe robusto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se publica "as-is" para investigación y experimentación, sin garantías explícitas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Página de Empero: https://empero.org
- Repositorio GitHub de Qwen3.8 (serie Qwen3.5/3.6/3.8): https://github.com/QwenLM/Qwen3.8
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Librería causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Entrada en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-4B,3A59vMN9CCmqBUAY2z7SkJ
