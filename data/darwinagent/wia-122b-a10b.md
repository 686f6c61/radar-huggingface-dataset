# darwinagent/WIA-122B-A10B

## Resumen

WIA-122B-A10B es el identificador con el que el usuario `darwinagent` publica en Hugging Face una copia de los pesos de Qwen3.5-122B-A10B, un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba. La model card del repositorio es la de Qwen3.5 y describe un modelo de arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención completa, intercaladas con mezcla de expertos dispersa (MoE). El resultado es un modelo de 122 000 millones de parámetros totales que solo activa 10 000 millones por token, lo que reduce el coste de inferencia hasta niveles de un modelo denso de ~10B.

La propuesta de valor es doble. Por un lado, unifica visión y lenguaje en un único entrenamiento con fusión temprana de tokens, de modo que el mismo modelo cubre razonamiento, código, agentes y comprensión visual sin necesidad de un adaptador separado. Por otro, ofrece una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 010 000, y cobertura declarada de 201 idiomas y dialectos.

Es relevante ahora porque compite directamente con alternativas abiertas de su segmento (Qwen3-235B-A22B, GPT-OSS-120B) superándolas en MMLU-Pro según los datos de la propia model card (86,7 frente a 84,4 y 80,8), con menos parámetros totales y bajo licencia Apache 2.0. Conviene señalar que este repositorio concreto acumula 0 descargas y 0 likes y fue creado el 24 de octubre de 2026: es una redistribución de terceros, no el repositorio oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; capas Gated DeltaNet (atención lineal) + Gated Attention, con MoE en cada capa |
| Parametros totales | 122 000 millones |
| Parametros activos | 10 000 millones (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativa; extensible hasta 1 010 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada. El repositorio solo publica `safetensors`; la model card no especifica esquema de cuantización (los 45,7 GB del repo implican pesos por debajo de BF16) |
| Idiomas soportados | 201 idiomas y dialectos según la model card (el metadato de Hugging Face no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (compatible con Transformers, vLLM, SGLang y KTransformers) |

Datos arquitectónicos adicionales: dimensión oculta 3072, 48 capas, embedding de tokens de 248 320 (con padding), salida LM de 248 320. Layout: 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). Gated DeltaNet con 64 cabezas lineales para V y 16 para QK, dimensión de cabeza 128. Gated Attention con 32 cabezas Q y 2 KV, dimensión de cabeza 256 y RoPE de 64 dimensiones. Dimensión intermedia de experto 1024.

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión y entrenamiento conjunto de tokens multimodales ("early fusion"), lo que según la model card le permite igualar a la generación Qwen3 en texto y superar a Qwen3-VL en razonamiento, código, agentes y comprensión visual. La innovación estructural principal es el layout híbrido: por cada bloque de cuatro subcapas hay tres que usan Gated DeltaNet (atención lineal con estado recurrente, 64 cabezas para V y 16 para QK) y una que usa Gated Attention clásica con solo 2 cabezas KV, lo que reduce drásticamente el coste de caché KV en contextos largos. Todas las subcapas llevan emparejada una capa MoE de 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 1024.

El entrenamiento pasa por pre-entrenamiento y post-entrenamiento, e incluye un objetivo MTP (multi-token prediction) entrenado con varios pasos, lo que habilita decodificación especulativa nativa. La model card destaca RL a gran escala sobre "millones de entornos de agentes" con distribuciones de tareas progresivamente más complejas, así como una infraestructura asíncrona de RL. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron RLHF o DPO, aunque la mención explícita de RL a escala de agentes apunta a un post-entrenamiento con refuerzo.

## Capacidades

- Generación de texto y razonamiento general, con resultados de MMLU-Pro de 86,7.
- Comprensión visual e imagen-texto: el pipeline declarado es `image-text-to-text`, con encoder de visión integrado en el entrenamiento conjunto.
- Código y matemáticas: la model card menciona paridad o mejora frente a Qwen3 en benchmarks de código y razonamiento.
- Capacidades de agente: RL entrenado sobre entornos multiagente y benchmarks de agentes; la etiqueta `conversational` y el soporte declarado en vLLM/SGLang indican plantillas de chat utilizables en bucles de herramientas (la plantilla concreta de tool calling no se detalla en la información disponible).
- Multilingüismo amplio: 201 idiomas y dialectos declarados, con "comprensión cultural y regional" según el autor.
- Contexto largo: 262 144 tokens nativos y hasta 1 010 000 extensibles, útil para documentos completos y repositorios.
- Decodificación multi-token (MTP) entrenada, que permite decodificación especulativa para acelerar la inferencia.
- No se mencionan en la información disponible capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- Análisis de documentos extensos y contratos: con 262 144 tokens nativos se puede ingerir un contrato completo más su histórico de enmiendas y anexos en una sola pasada, sin troceado ni pérdida de referencias cruzadas.
- Procesamiento de facturas y formularios con visión: al aceptar entrada imagen-texto, un pipeline OCR + razonamiento puede extraer campos estructurados directamente de escaneos y validar totales contra el texto extraído.
- Agentes de automatización de back-office: el entrenamiento con RL sobre entornos de agentes y el soporte en vLLM/SGLang permiten bucles multi-paso con llamadas a herramientas contra APIs internas (ERP, CRM) manteniendo el estado en contexto.
- Asistencia a desarrollo en producción: la ventana de 1M tokens extensible permite indexar un monorepo o un conjunto de servicios y responder preguntas de arquitectura con referencias a ficheros concretos; la activación de 10B parámetros mantiene el coste por token contenido.
- Atención al cliente multilingüe: los 201 idiomas declarados permiten atender consultas en castellano, catalán, euskera, gallego y lenguas de mercados internacionales con un único modelo, evitando enrutado por idioma.
- Búsqueda aumentada (RAG) sobre base documental técnica: la combinación de contexto largo y capacidad multimodal permite indexar manuales con diagramas y responder citando la página y la figura.
- Moderación y clasificación de contenido con matices culturales: el ajuste declarado por región facilita reglas distintas por mercado sin desplegar modelos separados.
- Investigación en eficiencia de inferencia: al ser híbrido MoE + atención lineal, sirve como banco de pruebas para medir degradación de latencia y calidad al escalar contexto.

## Benchmarks y rendimiento

Datos de la model card (sección de conocimiento). El resto de la tabla de benchmarks venía truncado en la información proporcionada, por lo que no se reproduce.

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83,7 | 80,8 | 84,4 | 86,7 | 86,1 | 85,3 |
| MMLU-Redux | 93,7 | 91,0 | 93,8 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

El resto de resultados (razonamiento, código, matemáticas, agentes, visión) no se han podido recuperar de la información disponible; no se han inventado cifras.

## Requisitos de hardware

- VRAM para pesos en BF16: ~244 GB (estimación calculada a partir de 122 000 millones de parámetros; no publicada por el autor).
- VRAM para pesos en FP8: ~122 GB. En INT4/NF4: ~65 GB.
- Los 45,7 GB del repositorio implican pesos almacenados a una precisión efectiva de ~3 bits por parámetro, de modo que tal cual se publican cabrían en una GPU de 48 GB (RTX 6000 Ada, L40S) con poco margen, o cómodamente en una de 80 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB en FP8 para producción; en BF16 harían falta al menos 4×H100 80 GB. Para la versión de 45,7 GB, una sola H100/L40S es suficiente en memoria, aunque el throughput óptimo se obtiene con tensor parallelism en 2–4 GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) sin cuantización agresiva y offload a CPU; con el repo de 45,7 GB haría falta una GPU de 48 GB o repartir entre dos de 24 GB.
- Opciones de despliegue confirmadas en la model card: Hugging Face Transformers, vLLM, SGLang y KTransformers. Soporte en llama.cpp/Ollama no confirmado en la información disponible (la atención lineal Gated DeltaNet complica su implementación).
- Caché KV: solo 12 de las 48 subcapas usan atención completa con 2 cabezas KV de dimensión 256, por lo que el coste de caché por token es muy inferior al de un transformer denso equivalente; las 36 subcapas restantes mantienen estado recurrente de tamaño constante.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste de cómputo por token se aproxima al de un modelo denso de 10B, mientras que el ancho de banda de memoria viene marcado por los 122B totales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B (este repo) | 122B | 10B | 262 144 nativo / 1 010 000 extensible | 86,7 | Apache 2.0 | Pesos en HF (repo de terceros, 0 descargas) |
| Qwen3-235B-A22B | 235B | 22B | no disponible en la información proporcionada | 84,4 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| GPT-OSS-120B | 120B | no disponible en la información proporcionada | no disponible en la información proporcionada | 80,8 | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible en la información proporcionada | 85,3 | Apache 2.0 (misma familia) | no disponible en la información proporcionada |
| Qwen3.5-27B (denso) | 27B | 27B (denso) | no disponible en la información proporcionada | 86,1 | Apache 2.0 (misma familia) | no disponible en la información proporcionada |
| GPT-5-mini 2025-08-07 | no disponible (propietario) | no disponible | no disponible | 83,7 | propietaria | solo API |

Lectura: el modelo supera a Qwen3-235B-A22B con la mitad de parámetros totales y menos de la mitad de activos, y supera ligeramente a sus hermanos pequeños de la misma generación. Frente a GPT-5-mini la comparación es solo de conocimiento (MMLU-Pro), no de capacidades agénticas.

## Limitaciones y advertencias

- Repositorio no oficial: `darwinagent/WIA-122B-A10B` es una redistribución, con 0 descargas y 0 likes, creada el 24 de octubre de 2026. La licencia enlazada apunta al repositorio de Qwen. Verificar checksums y procedencia antes de usarlo en producción.
- La model card está heredada de Qwen3.5 y no documenta el proceso de repackaging: se desconoce si los pesos son idénticos al original o han sido modificados, podados o recuantizados.
- El esquema de cuantización de los 45,7 GB publicados no se declara; una cuantización agresiva puede degradar razonamiento y comprensión visual de forma no medida.
- Riesgo de alucinación: no se han publicado tasas de factualidad ni evaluaciones de calibración en la información disponible; los benchmarks presentados son de conocimiento y capacidad, no de veracidad.
- Sesgos: no hay información sobre composición del dataset ni sobre evaluaciones de sesgo. La cobertura de 201 idiomas es una declaración del autor sin métricas por idioma; el rendimiento en lenguas con pocos recursos (p. ej. euskera o gallego) no está cuantificado.
- Contexto: los 1 010 000 tokens son una extensión sobre los 262 144 nativos; el degradado de calidad más allá del contexto nativo no se documenta.
- Tool calling y agentes: la model card menciona entrenamiento en entornos de agentes, pero no se detalla el formato de plantilla ni los benchmarks de function calling en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero persisten obligaciones de atribución y de inclusión de avisos; conviene revisar el texto exacto enlazado.
- El soporte en llama.cpp/Ollama no está confirmado; desplegar en entornos de consumo puede requerir trabajo de implementación de las capas Gated DeltaNet.
- Fecha de creación del repositorio (2026) posterior a la fecha de conocimiento habitual de muchas herramientas: comprobar compatibilidad de versiones de Transformers, vLLM y SGLang antes de fijar dependencias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darwinagent/WIA-122B-A10B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- Repositorio original de referencia (según la licencia enlazada): https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
