# elsuarezjr/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso (no MoE) publicado por elsuarezjr en Hugging Face bajo licencia Apache 2.0. Según su model card, se presenta como la generación más capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un transformer causal con un codificador de visión, lo que le permite procesar imágenes y vídeos de forma nativa.

El modelo cuenta con 27.781.427.952 parámetros reales según los pesos en safetensors, una dimensión oculta de 5120, 64 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Incorpora una arquitectura híbrida de atención con capas Gated DeltaNet (atención lineal) intercaladas con capas Gated Attention, además de Multi-Token Prediction (MTP) entrenado con múltiples pasos. El repositorio ocupa 55,6 GB y los pesos están en formato safetensors compatibles con Transformers, vLLM, SGLang y TokenSpeed.

La relevancia de esta ficha es doble: por un lado, documenta un modelo multimodal de 27B con contexto muy largo y control flexible de razonamiento; por otro, conviene señalar que el repositorio no registra descargas ni interacciones y que la model card incluye referencias a servicios y productos (Qwen Cloud) cuya verificación no es posible con la información disponible. El autor del repositorio (elsuarezjr) no coincide con el organización oficial de Qwen, lo que debe tenerse en cuenta al evaluar la procedencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Otros datos técnicos declarados en la model card: dimensión oculta 5120; 64 capas; token embedding y salida de 248.320 (con padding); FFN con dimensión intermedia de 17.408; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones; layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)).

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión, diseñado para comprensión nativa de imagen y vídeo. El bloque de lenguaje sigue un patrón híbrido repetido 16 veces: tres sub-bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK) seguidos de un sub-bloque de Gated Attention convencional (24 cabezas para Q y 4 para KV). Este diseño combina la eficiencia de la atención lineal en secuencias largas con la expresividad de la atención completa, y es coherente con el contexto nativo de 262.144 tokens. Se entrena además con Multi-Token Prediction (MTP) en varios pasos, lo que puede habilitar decodificación especulativa o aceleración de inferencia.

El modelo pasa por fases de preentrenamiento y postentrenamiento, según la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la arquitectura del codificador de visión ni la resolución o duración máxima de vídeo soportada. La model card menciona control flexible del razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`, así como un modo de pensamiento activado por defecto y desactivable por petición.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración (según la model card).
- Programación y tareas de terminal agénticas, con soporte declarado para Terminal Bench 2.1.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en el servicio alojado sugieren capacidades de este tipo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia a programación en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de terminal para generar parches, ejecutar comandos y resolver fallos, apoyándose en su rendimiento declarado en Terminal Bench 2.1 y en su contexto de 262.144 tokens para manejar repositorios completos.
- Agentes autónomos de largo horizonte: gracias a la planificación autónoma y al manejo de retroalimentación del entorno, es adecuado para tareas que requieren múltiples pasos y corrección de errores, como migraciones de código o automatización de procesos.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite extraer información de figuras, esquemas y documentos escaneados, útil en investigación y educación técnica.
- Comprensión de vídeo de larga duración: con soporte para vídeos de hasta una hora, puede emplearse en análisis de reuniones, revisión de material audiovisual o extracción de eventos en grabaciones extensas.
- Investigación asistida: el contexto de 262.144 tokens permite procesar corpus extensos, artículos y notas en una sola ventana, facilitando resúmenes y síntesis con trazabilidad.
- Atención al cliente técnica multi-turno: la ventana de contexto larga y el control de razonamiento permiten mantener conversaciones prolongadas con historial completo y respuestas razonadas.
- Automatización de tareas profesionales con herramientas: su orientación agéntica y compatibilidad con harnesses lo hacen apto para orquestar flujos que combinan lectura de documentos, ejecución de código y llamadas a APIs.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero en la información proporcionada solo se conserva el encabezado y la estructura: las columnas son Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, y la primera categoría es "Coding" con la métrica "Terminal Bench 2.1 (Terminus)". Los valores numéricos no están disponibles en el extracto recibido, por lo que no se reproducen.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K u otros benchmarks. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (27B parámetros), en FP16 se requerirían aproximadamente 56 GB de pesos, y en cuantizaciones de 8 bits o 4 bits el requisito se reduciría aproximadamente a la mitad o a un cuarto, respectivamente; estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar despliegue en A100 80 GB, H100 80 GB o configuraciones multi-GPU; no confirmado.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de 27B en FP16 no cabe en GPUs de consumo de 24 GB; con cuantización agresiva podría ser viable, pero no hay datos oficiales.
- Opciones de despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card proporciona una comparativa declarada por el autor con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de datos numéricos ni de especificaciones de esos modelos en la información proporcionada, por lo que la comparación se limita a lo declarado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Hugging Face (repo elsuarezjr) | No disponible (tabla sin valores) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Procedencia del repositorio: el ID es elsuarezjr/Qwen3.8-27B, no una organización oficial de Qwen; conviene verificar la autenticidad y procedencia de los pesos antes de usarlos en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento multilingüe ni la cobertura de idiomas distintos del inglés.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en dominios factuales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card incluye referencias a servicios de terceros (Qwen Cloud) cuya relación con los pesos no está aclarada.
- Datos de entrenamiento no disponibles: no se especifican tokens, composición del dataset ni técnicas de alineación, lo que dificulta evaluar riesgos de contaminación o sesgo.
- Compatibilidad de despliegue limitada a lo declarado: Transformers, vLLM, SGLang y TokenSpeed; no se confirma soporte para llama.cpp u Ollama.
- Contexto extensible a 1.000.000 tokens: la model card lo presenta como característica del servicio alojado; no se confirma que la extensión funcione de forma equivalente en despliegue local.

## Enlaces

- Hugging Face: https://huggingface.co/elsuarezjr/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (referenciada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
