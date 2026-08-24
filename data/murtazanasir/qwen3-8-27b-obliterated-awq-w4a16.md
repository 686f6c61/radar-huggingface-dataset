# MurtazaNasir/Qwen3.8-27B-OBLITERATED-AWQ-W4A16

## Resumen

El modelo `MurtazaNasir/Qwen3.8-27B-OBLITERATED-AWQ-W4A16` es una cuantización AWQ de 4 bits (esquema W4A16) del modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, una versión "abliterada" (liberada de rechazos y respuestas de seguridad) del Qwen3.8-27B de Alibaba. El autor, MurtazaNasir, ha aplicado la técnica AWQ con `llm-compressor` 0.13.0, manteniendo intactas las partes sensibles como la torre de visión, la cabeza MTP (speculative decoding) y las proyecciones de atención lineal. El resultado es un archivo de 19,55 GB que cabe en dos GPU de 24 GB o en una sola a contexto corto.

La relevancia de este modelo radica en que combina la arquitectura híbrida de Qwen3.8 (atención lineal gated-DeltaNet + atención completa, más un codificador de visión) con una cuantización eficiente para inferencia en hardware de consumo. Además, al ser una versión "uncensored", está orientado a investigación en seguridad de IA, red-teaming y casos donde se requiere respuestas sin restricciones de seguridad, aunque con los riesgos asociados. La licencia Apache 2.0 permite uso comercial sin restricciones.

El repo incluye una corrección importante: el template de chat original del modelo base descarta silenciosamente las definiciones de herramientas y el rol `tool`, por lo que el autor ha incluido el template estándar de Qwen3.8 (`chat_template.jinja`) para habilitar tool calling, manteniendo el original como `chat_template.obliterated-original.jinja`. Se recomienda usar `enable_thinking=False` para evitar la inyección de un system prompt que puede reintroducir rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas (48 gated-DeltaNet linear-attention + 16 full-attention) + torre de visión + cabeza MTP (speculative decoding) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según especificaciones de Qwen3.8-27B; no confirmado en la model card) |
| Tipos de cuantizacion | AWQ W4A16_ASYM, group size 128, compressed-tensors (pack-quantized) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se detalla en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ cuantizado, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `OBLITERATUS/Qwen3.8-27B-OBLITERATED` es una modificación del Qwen3.8-27B, que a su vez es un modelo de visión-lenguaje (VLM) denso con arquitectura híbrida. Según la model card, la arquitectura es `Qwen3_5ForConditionalGeneration` con 64 capas: 48 de ellas usan atención lineal gated-DeltaNet (eficiente en memoria y cómputo) y 16 usan atención completa (full attention). Además incluye una torre de visión (`model.visual.*`) y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la generación.

El proceso de "obliteración" (abliteration) se realizó en varias versiones (V1, V2, V3). La V3 aplica refinamiento iterativo sobre una mezcla complementaria y expansión de corpus, eliminando no solo los rechazos duros sino también las respuestas evasivas tipo "lectura de seguridad". Según la model card, el modelo V3 mantiene un rendimiento de MMLU de 82,3% (0-shot) frente al 84,5% del stock, una pérdida de 2,1 puntos porcentuales. El entrenamiento de la cuantización AWQ se hizo con 128 muestras de 1024 tokens del dataset `HuggingFaceH4/ultrachat_200k`, y los mapeos de suavizado (smoothing) se generaron por capa a partir de `text_config.layer_types` debido a la arquitectura híbrida.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades cercanas al modelo original, con una pérdida de MMLU de ~2 pp.
- Razonamiento matemático y lógico: el modelo base Qwen3.8-27B destaca en tareas de matemáticas y lógica; la versión abliterada conserva gran parte de esa capacidad.
- Generación de código: la model card reporta 20/20 en tareas de código con implementaciones funcionales (sin disclaimers).
- Capacidades multimodales: al incluir la torre de visión (mantenida en bf16), el modelo puede procesar imágenes, aunque la cuantización no fue calibrada para visión.
- Tool calling / function calling: soportado si se usa el template estándar de Qwen3.8 (`chat_template.jinja`). El template original no lo soporta.
- Modo pensamiento (thinking): compatible, pero se recomienda desactivarlo (`enable_thinking=False`) para respuestas más directas y evitar rechazos.
- Decodificación especulativa: la cabeza MTP se conserva en bf16, permitiendo aceleración en entornos que la soporten (p. ej., vLLM).
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base Qwen3.8 soporta múltiples idiomas.

## Casos de uso

- Investigación en seguridad de IA y red-teaming: el modelo está diseñado para probar límites de seguridad y generar respuestas sin restricciones. Se puede usar en entornos controlados para evaluar vulnerabilidades de modelos o entrenar clasificadores de contenido dañino.
- Generación de código en entornos de desarrollo: con tool calling habilitado, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs. Su capacidad de código es alta (20/20 en pruebas).
- Asistentes de programación con contexto largo: gracias a los 262k tokens de contexto, puede manejar repositorios completos o archivos de gran tamaño, manteniendo coherencia en conversaciones multi-turno.
- Automatización de tareas de oficina: el modelo base Qwen3.8-27B está optimizado para productividad (generación de documentos, resúmenes, análisis de datos). La versión cuantizada permite desplegarlo en hardware moderado.
- Análisis de imágenes y documentos visuales: al conservar la torre de visión, puede extraer información de capturas, diagramas o documentos escaneados, aunque la calibración AWQ no fue específica para visión.
- Prototipado de agentes conversacionales sin censura: para entornos de investigación donde se necesita respuestas sin filtros (p. ej., simulación de usuarios difíciles), siempre con salvaguardas legales y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización AWQ en la información disponible. Sin embargo, la model card del modelo base `OBLITERATUS/Qwen3.8-27B-OBLITERATED` reporta los siguientes datos (evaluados con lm-eval, 0-shot):

| Modelo | MMLU (0-shot) | Liberación | Cyber/code (20 prompts) | Advanced real-world |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | rechaza | rechaza | 5/8 |
| V1 | 81,4% | rechazos duros eliminados | no evaluado | no evaluado |
| V2 | 84,3% | quedan desviaciones suaves | no evaluado | 7/8 |
| V3 (base de esta cuantización) | 82,3% | responde genuinamente | 20/20 | 7/8 |

La cuantización AWQ introduce una pérdida adicional de precisión no cuantificada en estos datos. El blog de Todd Wolven (enlace en la sección de enlaces) menciona benchmarks en 2×RTX 3090, pero no se incluyen cifras concretas en el resumen disponible.

## Requisitos de hardware

- VRAM estimada: ~20 GB para el archivo de pesos (19,55 GB). Con overhead de inferencia, se recomienda al menos 24 GB.
- GPU recomendadas: 2× RTX 3090/4090 (24 GB cada una) en tensor-parallel 2, o una sola RTX 4090 (24 GB) para contextos cortos. También compatible con A100, A6000, etc.
- Cabe en GPU de consumo: sí, en una RTX 4090 o 3090 con contexto limitado; para contexto completo (262k) se necesitan 2 GPU o más.
- Opciones de despliegue: vLLM (soporta AWQ y compressed-tensors), también puede usarse con Transformers (cargando safetensors) y convertirse a GGUF para llama.cpp/Ollama (aunque el repo no incluye GGUF).
- Latencia y throughput: no disponibles. La decodificación especulativa (MTP) puede mejorar la velocidad en vLLM si se configura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,36 B | 262k | 84,5% | Apache 2.0 | bf16 |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (V3) | 27,36 B | 262k | 82,3% | Apache 2.0 | bf16 |
| MurtazaNasir/Qwen3.8-27B-OBLITERATED-AWQ-W4A16 | 27,36 B | 262k | no medido | Apache 2.0 | AWQ W4A16 |

La comparativa se limita a la familia Qwen3.8-27B porque no se dispone de datos de otros modelos abliterados de tamaño similar en la información proporcionada. La cuantización AWQ reduce el tamaño de 54 GB (bf16) a ~19,6 GB, a costa de una pérdida de precisión no cuantificada.

## Limitaciones y advertencias

- Modelo "uncensored": al eliminar los mecanismos de rechazo, el modelo puede generar contenido dañino, ilegal o éticamente problemático. Su uso debe restringirse a investigación en seguridad, red-teaming y entornos controlados.
- Riesgo de alucinación: al igual que otros modelos de su tamaño, puede inventar hechos, especialmente en dominios especializados. La cuantización AWQ puede aumentar ligeramente este riesgo.
- Template de chat original defectuoso: el template `chat_template.obliterated-original.jinja` descarta tool definitions y el rol `tool`, por lo que el tool calling no funciona con él. Es necesario usar el template estándar incluido (`chat_template.jinja`).
- System prompts pueden reintroducir rechazos: según la model card, cualquier system prompt (incluido el inyectado por el template estándar con `enable_thinking=True`) puede hacer que el modelo vuelva a rechazar peticiones. Se recomienda `enable_thinking=False` y no usar system prompts.
- Pérdida de capacidad por cuantización: la conversión a W4A16 introduce errores de cuantización que pueden afectar tareas de precisión (matemáticas, razonamiento complejo). No se han publicado benchmarks específicos de esta versión.
- Limitaciones de visión: la torre de visión se mantiene en bf16 pero no fue calibrada durante la cuantización, por lo que el rendimiento en tareas visuales puede ser impredecible.
- Sin soporte oficial de herramientas en el template original: aunque el template estándar lo habilita, el modelo base fue entrenado sin tool calling, por lo que la calidad de las llamadas a funciones puede ser inferior a la de modelos entrenados específicamente para ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MurtazaNasir/Qwen3.8-27B-OBLITERATED-AWQ-W4A16
- Modelo base (OBLITERATUS): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Blog de Todd Wolven sobre la cuantización: https://toddwolven.com/projects/qwen38-awq-quantization
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Artículo de Yottalabs sobre especificaciones y hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
