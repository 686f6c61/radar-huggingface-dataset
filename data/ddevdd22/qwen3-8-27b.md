# ddevdd22/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado por el usuario ddevdd22 en Hugging Face bajo licencia Apache 2.0 y etiquetado con la arquitectura `qwen3_5`. Según la model card, se presenta como parte de la generación Qwen3.8 de la familia Qwen, construida sobre la base arquitectónica de Qwen3.5, y está orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo se distribuye en formato Transformers (safetensors) y declara compatibilidad con vLLM, SGLang y TokenSpeed.

Se trata de un modelo nativo visión-lenguaje: procesa imágenes y vídeos además de texto, y su pipeline declarado en Hugging Face es `image-text-to-text`. El recuento real de parámetros según los pesos en safetensors es de 27.781.427.952 (aproximadamente 27,8 mil millones), con una dimensión oculta de 5120 y 64 capas. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000 según la model card.

La relevancia del modelo radica en su propuesta de control flexible del razonamiento (modo thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort`) y en su arquitectura híbrida de atención, que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas. No obstante, conviene señalar que el repositorio tiene un volumen de descargas muy bajo (34) y ningún "like", y que la model card incluye referencias a servicios y modelos (Qwen Cloud, Qwen3.7-Plus, Opus4.6 Max) que no pueden verificarse con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; layout híbrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); tag `qwen3_5` |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

Datos arquitectónicos adicionales declarados en la model card: dimensión oculta 5120; token embedding 248.320 (padded); 64 capas; Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE 64; FFN con dimensión intermedia 17.408; salida LM de 248.320 (padded); entrenamiento con Multi-Token Prediction (MTP) en varios pasos.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que intercala bloques de atención lineal (Gated DeltaNet) con bloques de atención con compuertas (Gated Attention), en un patrón de 16 repeticiones de tres capas DeltaNet seguidas de una capa de atención con compuertas, cada una acompañada de su FFN. Este diseño busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de atención completa en puntos estratégicos de la red. El modelo incorpora además un codificador de visión para el procesamiento nativo de imágenes y vídeos, y emplea Multi-Token Prediction (MTP), lo que habilita técnicas de decodificación especulativa para acelerar la inferencia.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento según la model card, aunque no se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la innovación concreta del entrenamiento del codificador de visión ni la estrategia de extensión de contexto hasta 1.000.000 de tokens. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (pipeline `image-text-to-text`), incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Codificación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 citado en la model card).
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de "official built-in tools" en el servicio alojado sugieren esta capacidad.
- Capacidades multilingües: no disponible (no se listan idiomas).

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar en entornos de línea de comandos de forma agéntica, interpretando la salida de comandos y corrigiendo el rumbo, lo que encaja con su evaluación en Terminal Bench 2.1 y su orientación a tareas de largo horizonte.
- Análisis de documentación técnica y diagramas: gracias a su codificador de visión, puede extraer información de diagramas STEM, esquemas de arquitectura y documentos escaneados, integrándola en flujos de ingeniería o investigación.
- Procesamiento de vídeos largos: la model card declara soporte para vídeos de hasta una hora, lo que permite resumir clases, revisiones de producto o grabaciones de reuniones en un único contexto.
- Asistentes de codificación en producción: con 262.144 tokens de contexto nativo, puede mantener el estado de repositorios grandes y múltiples archivos en una sola sesión, reduciendo la pérdida de contexto en refactorizaciones amplias.
- Investigación asistida con razonamiento controlable: el ajuste de `reasoning_effort` permite equilibrar coste y profundidad según la fase del análisis, útil en pipelines de revisión bibliográfica o generación de hipótesis.
- Agentes autónomos multi-paso: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen adecuado para tareas que requieren decenas de pasos con verificación intermedia, como migraciones de datos o auditorías de configuración.
- Atención al cliente con contexto largo: su ventana de contexto permite gestionar conversaciones multi-turno extensas con historial completo, aunque la ausencia de datos sobre idiomas y sesgos exige validación previa.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, aunque la información proporcionada está truncada y solo se muestra el encabezado de la sección "Coding" con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" sin los valores numéricos. Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos verificables de benchmarks. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento real de parámetros (27,8B), en FP16 se requerirían aproximadamente 55,6 GB solo para pesos, lo que exige GPUs de 80 GB (A100, H100) o multi-GPU. En cuantización de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14 GB, aunque estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16/BF16; para cuantizaciones bajas podrían considerarse RTX 4090 (24 GB) o RTX A6000 (48 GB), sin datos oficiales de compatibilidad.
- ¿Cabe en consumer GPU? En cuantización de 4 bits podría caber en GPUs de 24 GB, pero no hay confirmación del autor ni GGUF publicado en el repositorio.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card cita como comparadores a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de sus especificaciones ni de los resultados numéricos de la comparación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262.144 (ext. 1M) | Apache 2.0 | Hugging Face (ddevdd22) | Vision-lenguaje, híbrido DeltaNet/atención |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |

No se dispone de datos suficientes para una comparativa técnica rigurosa más allá de la tabla anterior.

## Limitaciones y advertencias

- El repositorio presenta un volumen muy bajo de descargas (34) y ningún "like", lo que impide validar la adopción o la calidad del modelo por parte de la comunidad.
- La model card incluye referencias a servicios y modelos (Qwen Cloud, Qwen3.7-Plus, Opus4.6 Max) que no pueden verificarse con la información disponible y que podrían no corresponder a artefactos públicos reales.
- No se detallan los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- No se especifican sesgos conocidos, datos de entrenamiento ni procesos de alineamiento (RLHF/DPO), lo que dificulta evaluar riesgos de alucinación y sesgo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de información sobre la procedencia de los datos de entrenamiento y del codificador de visión introduce incertidumbre legal que conviene revisar antes de un despliegue en producción.
- El contexto extensible a 1.000.000 de tokens no está respaldado por datos de rendimiento publicados; la degradación en contextos muy largos es desconocida.
- No se ofrecen cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- La información de benchmarks está truncada y no permite verificar las afirmaciones de rendimiento de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/ddevdd22/Qwen3.8-27B
- Qwen Cloud (servicio alojado citado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (citada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
