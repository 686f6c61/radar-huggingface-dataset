# Qwen/Qwen3.5-9B

## Resumen

Qwen3.5-9B es un modelo de lenguaje causal multimodal desarrollado por el equipo Qwen de Alibaba, publicado en febrero de 2026 bajo licencia Apache 2.0. Se trata de la variante de 9 000 millones de parámetros de la familia Qwen3.5, que integra avances en aprendizaje multimodal, eficiencia arquitectónica y escalado de reinforcement learning. El modelo acepta entradas de texto e imagen y está diseñado para tareas de razonamiento, generación de código, agentes y comprensión visual, con un contexto nativo de 262 144 tokens extensible hasta aproximadamente un millón.

La arquitectura combina Gated Delta Networks (atención lineal) con capas de atención tradicional (Gated Attention) en un layout híbrido que busca alto rendimiento de inferencia con menor coste computacional. El entrenamiento incluye fusión temprana de tokens multimodales y reinforcement learning a escala con millones de agentes, lo que le permite competir con modelos de mayor tamaño en benchmarks de conocimiento, STEM y razonamiento. Con 9,65 mil millones de parámetros totales, es un modelo denso que cabe en GPUs de consumo con cuantización adecuada, y es compatible con los principales motores de inferencia como vLLM, SGLang y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención tradicional) + FFN, con vision encoder |
| Parametros totales | 9 653 104 368 (9,65 B) |
| Parametros activos | No disponible (la documentación menciona sparse MoE, pero no se detallan parámetros activos) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No especificado por el autor; compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) vía herramientas de la comunidad |
| Idiomas soportados | 201 lenguas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (una forma de atención lineal con estado recurrente) con capas de Gated Attention (atención softmax tradicional con cabezas Q y KV). El layout del modelo es `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 32 capas en total, dimensión oculta de 4096 y FFN de 12288. El Gated DeltaNet utiliza 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; el Gated Attention usa 16 cabezas Q y 4 KV con dimensión 256 y RoPE de 64. El modelo incorpora un vision encoder para procesar imágenes y un tokenizador con vocabulario de 248 320 tokens (padded). El entrenamiento incluye una etapa de pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales y reinforcement learning escalado a entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento alcanza una eficiencia cercana al 100 % en tareas multimodales comparada con el entrenamiento solo de texto.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto como entrada, y produce texto de alta calidad.
- Razonamiento complejo y STEM: obtiene puntuaciones destacadas en MMLU-Pro (82,5) y MMLU-Redux (91,4).
- Generación de código: entrenado para tareas de programación, aunque no se detallan benchmarks específicos en la documentación disponible.
- Soporte de agentes: el entrenamiento con reinforcement learning a escala y entornos multiagente lo prepara para tareas de agente y razonamiento multi-paso.
- Comprensión visual: gracias al vision encoder, puede interpretar imágenes y responder preguntas sobre ellas.
- Multilingüismo: soporta 201 lenguas y dialectos, con matices culturales y regionales.
- Contexto largo: ventana nativa de 262 144 tokens, extensible hasta ~1 millón, adecuada para documentos extensos y conversaciones largas.

## Casos de uso

- Atención al cliente automatizada: con su contexto de 262 144 tokens, puede gestionar conversaciones multi-turno extensas y mantener el historial completo sin truncamiento, además de procesar capturas de pantalla o imágenes de productos enviadas por el usuario.
- Análisis de documentos técnicos y científicos: su capacidad multimodal permite extraer información de figuras, tablas y gráficos en papers, combinada con razonamiento STEM de alto nivel para resumir o responder preguntas sobre investigaciones.
- Generación y revisión de código en producción: soporta tool calling (no confirmado explícitamente, pero habitual en la familia Qwen) y puede integrarse en pipelines de CI/CD para generar tests, revisar diffs o autocompletar funciones, gracias a su entrenamiento en código y razonamiento.
- Asistentes virtuales multilingües: con soporte para 201 lenguas, puede desplegarse en plataformas globales de atención o asistencia, manteniendo coherencia cultural y regional.
- Razonamiento sobre imágenes en entornos empresariales: por ejemplo, inspección visual de daños en seguros, análisis de diagramas de arquitectura o lectura de facturas escaneadas, combinando visión y lenguaje.
- Agentes autónomos de investigación: su entrenamiento con reinforcement learning en entornos multiagente lo hace adecuado para tareas de búsqueda, extracción y síntesis de información en múltiples pasos, con memoria de contexto largo para mantener el estado de la tarea.

## Benchmarks y rendimiento

La model card publica una tabla comparativa con varios modelos. Los datos disponibles para Qwen3.5-9B son:

| Benchmark | Qwen3.5-9B | GPT-OSS-20B | Qwen3-30B-A3B-Thinking-2507 | Qwen3.5-4B |
|---|---|---|---|---|
| MMLU-Pro | 82,5 | 74,8 | 80,9 | 79,1 |
| MMLU-Redux | 91,4 | 87,8 | 91,4 | no disponible |

La tabla original incluye además comparaciones con GPT-OSS-120B y Qwen3-Next-80B-A3B-Thinking, y cubre más benchmarks (razonamiento, código, agentes, visión) que no se han podido extraer de la información proporcionada. Se recomienda consultar la model card completa para el desglose íntegro.

## Requisitos de hardware

- VRAM estimada: en FP16 (~19,3 GB) necesita al menos 24 GB de VRAM; en cuantización de 8 bits ~9,7 GB; en 4 bits ~5 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o superiores para FP16 sin cuantizar; GPUs con 8-12 GB (RTX 3070/4070) pueden ejecutarlo con cuantización 4-bit.
- En consumer GPU: sí, con cuantización GGUF o AWQ en GPUs de 8 GB o más.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Hugging Face Transformers, llama.cpp, Ollama.
- Latencia y throughput: no se han publicado datos específicos; la arquitectura con Gated DeltaNet promete mayor throughput que atención softmax pura, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B | 9,65 B (denso) | 262 144 (ext. 1M) | 82,5 | Apache-2.0 |
| GPT-OSS-20B | 20 B | no disponible | 74,8 | no disponible |
| Qwen3-30B-A3B-Thinking-2507 | 30 B (MoE, 3 B activos) | no disponible | 80,9 | Apache-2.0 |
| Qwen3.5-4B | 4 B | no disponible | 79,1 | Apache-2.0 |

Qwen3.5-9B supera en MMLU-Pro a GPT-OSS-20B (que tiene el doble de parámetros) y a Qwen3-30B-A3B-Thinking-2507, un modelo MoE con 30 B totales y 3 B activos. Frente a su hermano menor Qwen3.5-4B, la ventaja es de 3,4 puntos. Esta relación rendimiento/parámetros lo hace especialmente atractivo para despliegues eficientes.

## Limitaciones y advertencias

- Sesgos: al ser entrenado con datos web a gran escala, puede reflejar sesgos sociales, culturales o de género presentes en los datos; no se han publicado evaluaciones específicas de sesgo.
- Alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios especializados o con entradas ambiguas.
- Contexto extendido: la extensión a 1 010 000 tokens puede degradar la calidad de la generación en posiciones muy alejadas del inicio; se recomienda validar en el caso de uso concreto.
- Multimodalidad: aunque acepta imágenes, no se especifican límites de resolución o tamaño de imagen; puede haber restricciones no documentadas.
- Idiomas: aunque soporta 201 lenguas, el rendimiento puede variar significativamente entre idiomas de alto y bajo recurso.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar el cumplimiento de las condiciones de atribución.
- Producción: no se han publicado resultados de latencia ni throughput oficiales; es necesario realizar pruebas de carga propias antes de desplegar a escala.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Benchable (evaluaciones): https://benchable.ai/models/qwen/qwen3.5-9b-20260310
