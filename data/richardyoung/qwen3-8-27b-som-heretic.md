# richardyoung/Qwen3.8-27B-SOM-heretic

## Resumen

Qwen3.8-27B-SOM-heretic es una versión "decensored" del modelo Qwen/Qwen3.8-27B, publicada por el usuario richardyoung. Se ha generado aplicando la herramienta Heretic v2.0.0, que realiza una ablación multi-direccional basada en mapas autoorganizados (Self-Organizing Map Multi-Directional Ablation, SOM) sobre las matrices de pesos del modelo original. El objetivo declarado es reducir el número de rechazos (refusals) del modelo ante peticiones que el original rechazaría, manteniendo la mayor parte de sus capacidades.

El modelo base es un modelo denso de 27 000 millones de parámetros (27.356.728.560 según safetensors) con arquitectura híbrida de atención lineal (Gated DeltaNet) y atención con compuertas (Gated Attention), desarrollado por el equipo Qwen. Es un modelo nativo de visión-lenguaje, capaz de procesar imágenes y vídeos, con una longitud de contexto nativa de 262 144 tokens extensible hasta 1 000 000. La versión heretic conserva esa arquitectura y esas capacidades, pero modifica el comportamiento de rechazo mediante la ablación de direcciones en las proyecciones `attn.o_proj` y `mlp.down_proj`.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, los modelos abiertos de gran contexto con capacidades multimodales y de agente; por otro, las técnicas de "abliteration" que buscan eliminar los mecanismos de rechazo sin reentrenar. El autor reporta una reducción de rechazos de 98/100 a 27/100 con una divergencia KL de 0,0843 respecto al original, lo que indica un cambio moderado en la distribución de salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; layout híbrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el repo ocupa 54,8 GB) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Datos adicionales de arquitectura: dimensión oculta 5120; 64 capas; embedding de tokens 248 320 (padded); Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64; FFN con dimensión intermedia 17 408; salida LM 248 320 (padded); entrenado con Multi-Token Prediction (MTP) en varios pasos.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con un encoder de visión integrado. Su innovación arquitectónica principal es el layout híbrido: por cada bloque de cuatro subcapas, tres usan Gated DeltaNet (atención lineal con estado recurrente) y una usa Gated Attention (atención completa con compuertas). Este diseño busca reducir el coste computacional en contextos largos manteniendo la calidad de atención completa en puntos clave. Incorpora además Multi-Token Prediction (MTP), entrenado con varios pasos, lo que puede acelerar la decodificación especulativa.

El entrenamiento del modelo original incluye fases de pre-entrenamiento y post-entrenamiento (el model card indica "Pre-training & Post-training"), aunque no se detalla el número de tokens, la composición del dataset ni si se usaron RLHF o DPO. La versión heretic no reentrena el modelo: aplica una ablación de direcciones sobre los pesos. Según los parámetros SOM publicados, se define una dirección por capa (`direction_index`: per layer) con decaimiento 0,00, y se aplican pesos máximos y mínimos en `attn.o_proj` (1,45 y 1,09, con posiciones 46,56 y 27,72) y en `mlp.down_proj` (1,30 y 0,97, con posiciones 53,52 y 13,84). El resultado es un modelo con menos rechazos y una divergencia KL de 0,0843 frente al original.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activado por defecto y control flexible mediante `reasoning_effort` y `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora según el model card.
- Generación de código y tareas de trabajo profesional e investigación, según las mejoras declaradas en Qwen3.8.
- Ejecución de agentes autónomos: planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque el model card menciona "herramientas integradas oficiales" en la versión alojada en Qwen Cloud.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "uncensored": la ablación reduce los rechazos (27/100 frente a 98/100 del original).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens nativos, lo que permite mantener historiales extensos y documentación de referencia sin truncar.
- **Análisis de documentos técnicos y diagramas**: al ser un modelo nativo de visión-lenguaje, puede procesar capturas de diagramas STEM, planos o tablas y responder preguntas sobre ellos, integrándose en flujos de extracción de información.
- **Generación de código en producción**: el modelo base declara mejoras en coding y compatibilidad con harnesses; puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o explicación de errores, aunque la versión heretic requiere validación adicional por su comportamiento menos restrictivo.
- **Agentes autónomos de larga duración**: con planificación mejorada y manejo de retroalimentación del entorno, es adecuado para tareas de múltiples pasos como investigación web, automatización de flujos o resolución de incidencias.
- **Investigación y análisis de vídeo**: la comprensión de vídeos de hasta una hora permite resumir reuniones, extraer eventos o responder preguntas sobre grabaciones, útil en entornos de investigación y auditoría.
- **Prototipado de asistentes sin filtros**: para equipos que necesitan explorar respuestas del modelo ante temas sensibles sin los rechazos del original, en entornos controlados y con revisión humana.
- **Despliegue en infraestructura propia**: al publicarse en safetensors y ser compatible con transformers, vLLM, SGLang y TokenSpeed, puede servirse en clústeres propios con contexto largo para aplicaciones internas.

## Benchmarks y rendimiento

El model card del autor incluye una comparación directa entre la versión heretic y el original en dos métricas de comportamiento:

| Metrica | Este modelo (heretic) | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Rechazos (refusals) | 27/100 | 98/100 |
| Divergencia KL | 0,0843 | 0 (por definición) |

El model card del modelo base incluye una tabla de benchmarks de texto comparando Qwen3.8-27B con Qwen3.6-27B y otros modelos, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta versión heretic.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en safetensors de 54,8 GB, la inferencia en precisión completa (BF16/FP16) requiere aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 64-80 GB de VRAM para contexto moderado. Con cuantización a 8 bits se estima ~28 GB; a 4 bits, ~14-16 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- **GPU recomendadas**: para BF16, A100 80 GB, H100 80 GB o H200; para 8 bits, A100 40 GB o L40S 48 GB; para 4 bits, RTX 4090 24 GB o RTX 6000 Ada 48 GB.
- **Consumer GPU**: sí es posible en RTX 4090 (24 GB) con cuantización a 4 bits, aunque el contexto largo (262K tokens) requerirá KV cache adicional y puede exceder la VRAM disponible.
- **Opciones de despliegue**: transformers, vLLM, SGLang, TokenSpeed (según el model card del base). No se confirma soporte de llama.cpp, Ollama o TGI en la información proporcionada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-SOM-heretic | 27,36 B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Versión decensored con ablación SOM; rechazos 27/100 |
| Qwen/Qwen3.8-27B | 27 B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Modelo original; rechazos 98/100; visión-lenguaje |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Generación anterior de Qwen; incluido en la tabla comparativa del model card, pero sin valores numéricos disponibles |

No se dispone de datos de benchmarks comparativos completos ni de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen3.8-27B, hereda los sesgos del dataset de entrenamiento original, no detallado.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; la ablación puede alterar la distribución de salidas (KL 0,0843) y no se han publicado evaluaciones de fidelidad factual para esta versión.
- **Limitaciones de contexto o idioma**: el contexto nativo es de 262 144 tokens, extensible a 1 000 000, pero no se detalla el rendimiento en los extremos. Los idiomas soportados no están disponibles.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la modificación heretic puede implicar consideraciones éticas y legales adicionales; el autor no ofrece garantías sobre el comportamiento del modelo.
- **Caveat para producción**: la reducción de rechazos (de 98/100 a 27/100) implica que el modelo puede generar contenido que el original bloquearía; se recomienda revisión humana y políticas de uso claras. No se han publicado evaluaciones de seguridad ni de calidad en tareas estándar para esta versión.
- **Compatibilidad**: aunque el model card del base menciona vLLM, SGLang y TokenSpeed, no se confirma que la versión heretic haya sido probada en todos ellos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.8-27B-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic: https://heretic-project.org
- Qwen Cloud (servicio alojado del base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
