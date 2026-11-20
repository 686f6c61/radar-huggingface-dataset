# eebee11/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con encoder de visión, publicado en Hugging Face por el usuario eebee11 bajo el identificador `eebee11/Qwen3.8-27B`. Según la model card, se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo es nativo visión-lenguaje: comprende imágenes y vídeos, e incorpora control flexible del modo de razonamiento.

Con 27 781 427 952 parámetros reales (según los safetensors del repositorio, 55,6 GB), el modelo es denso (no MoE) y emplea una arquitectura híbrida con capas de atención lineal Gated DeltaNet intercaladas con capas de atención con compuerta (Gated Attention), además de Multi-Token Prediction (MTP) entrenado con múltiples pasos. Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

La relevancia actual del modelo radica en su combinación de tamaño compacto (27B, desplegable en infraestructura moderada), capacidades multimodales nativas (imagen y vídeo), control del esfuerzo de razonamiento por petición y soporte declarado para harnesses populares, lo que lo posiciona como candidato para despliegues de agentes autónomos y pipelines de código en producción. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de vision; híbrida Gated DeltaNet (atención lineal) + Gated Attention; MTP |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

Otros datos técnicos declarados en la model card: dimensión oculta 5120; embedding de tokens 248 320 (con padding); 64 capas; layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); Gated DeltaNet con 48 cabecas de atención lineal para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabecas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64; FFN con dimensión intermedia 17 408; salida LM 248 320 (con padding).

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que alterna bloques de atención lineal Gated DeltaNet con bloques de atención con compuerta (Gated Attention), en una proporción de 3 a 1 dentro de cada uno de los 16 grupos de capas (64 capas totales). Esta combinación busca eficiencia en contextos largos (la atención lineal reduce el coste computacional y de memoria frente a la atención cuadrática) manteniendo la calidad de recuperación de la atención completa. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, técnica que puede aprovecharse para decodificación especulativa y aceleración de inferencia. El encoder de visión es nativo, no un adaptador externo, lo que habilita comprensión conjunta de imagen, vídeo y texto.

El modelo pasa por etapas de pre-entrenamiento y post-entrenamiento según la model card, pero no se detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. Tampoco se especifica la composición del corpus multimodal ni la proporción de datos de vídeo. Toda esa información figura como no disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Control del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`, y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Codificación: mejoras declaradas en tareas de código, incluida codificación agéntica en terminal (Terminal Bench 2.1).
- Comprensión visión-lenguaje nativa: imágenes, diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (soporte declarado más amplio que generaciones anteriores).
- Capacidades multilingües: no se detalla la lista de idiomas soportados en la información disponible.
- Tool calling / function calling: no se especifica explícitamente en la model card, aunque la orientación agéntica y la compatibilidad con harnesses sugieren soporte; no disponible como dato confirmado.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar bucles de planificación, edición y verificación sobre entornos de línea de comandos, aprovechando su entrenamiento específico en Terminal Bench 2.1 y su capacidad de manejar retroalimentación del entorno.
- Automatización de pipelines CI/CD: integrable en herramientas de desarrollo y harnesses populares para tareas de revisión de código, generación de parches y ejecución de pruebas, con control del esfuerzo de razonamiento según la complejidad del cambio.
- Análisis de documentos técnicos y diagramas STEM: el encoder de visión nativo permite extraer información de figuras, tablas y esquemas en documentación de ingeniería o papers, combinándola con razonamiento textual.
- Comprensión de vídeos de larga duración: procesamiento de vídeos de hasta una hora para resumen, extracción de eventos o generación de informes, gracias al contexto nativo de 262 144 tokens y a la atención lineal que reduce el coste en secuencias largas.
- Agentes de investigación autónoma: tareas de largo horizonte que requieren planificación multi-paso, consulta de fuentes y síntesis, con retención del contexto de razonamiento entre turnos mediante `preserve_thinking`.
- Asistencia profesional en flujos de trabajo ofimáticos: generación y revisión de informes, análisis de hojas de cálculo convertidas a imagen o texto, y redacción asistida con control de profundidad de razonamiento por petición.
- Despliegue en infraestructura moderada: al ser un modelo denso de 27B con licencia Apache 2.0, puede servirse con vLLM, SGLang o TokenSpeed en entornos con GPUs de gama alta consumer o profesional, sin necesidad de clústeres multi-nodo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, entre otras). Sin embargo, en la información proporcionada solo se conserva la cabecera de la tabla y la fila de "Agentic terminal coding — Terminal Bench 2.1 (Terminus)", sin los valores numéricos de las celdas. Por tanto, no es posible reproducir resultados concretos.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo denso de 27B en precisión BF16 requiere aproximadamente 55-56 GB de pesos (coincide con el tamaño del repo, 55,6 GB), más overhead de KV cache y activaciones.
- Cuantización: los tipos de cuantización no están documentados en la model card; no disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajaría en A100 80GB, H100 80GB y configuraciones multi-GPU; en consumer, requeriría cuantización para caber en RTX 4090 (24 GB) o similares.
- ¿Cabe en consumer GPU? En BF16 no cabe en una sola GPU consumer de 24 GB; con cuantización de 4 bits sería viable en RTX 4090/5090, aunque no hay confirmación oficial de soporte.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262 144 nativo, hasta 1 000 000 | Apache 2.0 | Hugging Face (eebee11/Qwen3.8-27B) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | referenciado en la model card |
| Muse Glimmer-30B | 30B (indicado en el nombre) | no disponible | no disponible | referenciado en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | referenciado en la model card |

Los modelos comparables aparecen en la tabla de benchmarks de la model card, pero no se dispone de sus especificaciones técnicas ni de sus resultados numéricos en la información proporcionada. No disponible para comparación detallada de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; no disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan métricas de fidelidad ni de calibración.
- Idiomas soportados: no especificados; el rendimiento multilingüe no está documentado.
- Contexto: el contexto nativo es de 262 144 tokens; la extensión a 1 000 000 se declara como capacidad, pero no se detalla el método (por ejemplo, RoPE scaling) ni la degradación esperada.
- Licencia: Apache 2.0, permite uso comercial con atribución y sin restricciones copyleft; conviene revisar las condiciones de la versión hospedada en Qwen Cloud, que puede tener términos distintos.
- Repositorio: el modelo aparece publicado por el usuario `eebee11`, no por la organización oficial Qwen; conviene verificar la procedencia y la integridad de los pesos antes de usarlo en producción.
- Datos de entrenamiento: no se detalla el corpus, el número de tokens ni las técnicas de alineamiento, lo que dificulta evaluar sesgos y cobertura.
- Tool calling: no confirmado explícitamente en la documentación; verificar antes de integrarlo en pipelines agénticos.
- Cuantizaciones: no documentadas; el despliegue en consumer GPU requeriría cuantización no oficial.

## Enlaces

- Hugging Face: https://huggingface.co/eebee11/Qwen3.8-27B
- Qwen Cloud (servicio hospedado, próximamente): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
