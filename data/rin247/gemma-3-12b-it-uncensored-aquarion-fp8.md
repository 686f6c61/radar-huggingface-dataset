# Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP8

## Resumen

Este modelo es una cuantización FP8 *weight-only* de `gemma-3-12b-it`, el modelo multimodal de Google de 12 mil millones de parámetros, modificado mediante una técnica de *abliteración* (proyección ortogonal de la dirección de rechazo) para eliminar los mecanismos de negativa a responder contenido considerado sensible o prohibido. El resultado es una variante "uncensored" que conserva las capacidades del modelo original pero con una política de seguridad relajada.

El autor, Rin247, lo publica bajo el nombre "Aquarion Forge" y lo presenta como parte de una serie de modelos cuantizados con recetas personalizadas de FP8. El repositorio contiene únicamente los pesos en formato `safetensors` (13,2 GB) junto con un `config.json` que incluye la configuración de cuantización. Es importante señalar que el modelo no tiene descargas ni valoraciones en el momento de la consulta, y la fecha de creación (agosto de 2026) es posterior a la publicación del modelo base, lo que sugiere que es una variante reciente y poco difundida.

La relevancia de este modelo radica en su doble modificación: por un lado, la cuantización FP8 reduce los requisitos de memoria frente al BF16 original (que ocupa unos 24 GB), y por otro, la abliteración lo hace útil para casos de uso donde se requiere una generación sin restricciones temáticas, como la investigación en seguridad de IA o la creación de contenido creativo sin filtros. Sin embargo, al ser una cuantización no estándar con escalas y formas almacenadas por separado, su integración en motores de inferencia convencionales puede requerir pasos adicionales de de-cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión y texto) basada en Gemma 3 12B |
| Parametros totales | 12.187.325.040 (dato real de safetensors) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | FP8 *weight-only* (RTN en CPU, escalas y formas almacenadas en buffers separados) |
| Idiomas soportados | no disponible en la model card; el modelo base Gemma 3 soporta más de 140 idiomas |
| Licencia | no disponible en la model card; el modelo base usa la licencia Gemma Terms of Use |
| Formato de pesos | safetensors (con `quantization_config` en config.json) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B, un transformer denso con 36 capas, atención multi-cabeza con ventana local y global, y capacidades multimodales que aceptan imágenes además de texto. El modelo base fue entrenado por Google con un contexto de hasta 128K tokens y un vocabulario ampliado para cubrir más de 140 idiomas. La variante aquí descrita no añade entrenamiento adicional: se trata de una cuantización FP8 aplicada mediante *round-to-nearest* (RTN) en CPU, donde los pesos se almacenan en FP8 y las escalas y formas se guardan en buffers separados (`*.weight_scale`, `*.weight_shape`). Antes de la cuantización, se aplicó una abliteración mediante proyección ortogonal de la dirección de rechazo, una técnica que elimina la activación neuronal responsable de negarse a responder ciertos contenidos.

No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de abliteración más allá de la descripción genérica. Tampoco se indica si se utilizó RLHF o DPO en el modelo original; se asume que el modelo base mantiene su entrenamiento original de Google, que incluye destilación y ajuste con supervisión humana, pero esta información no está disponible en la model card de esta variante.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base Gemma 3 12B, incluyendo razonamiento matemático, lógico y de sentido común.
- Comprensión multimodal: al estar basado en Gemma 3, acepta imágenes como entrada adicional al texto, permitiendo tareas de descripción, análisis visual y respuesta a preguntas sobre imágenes.
- Soporte de tool calling y function calling: el modelo base Gemma 3 12B incluye soporte para invocación de funciones, por lo que esta variante hereda dicha capacidad.
- Capacidades multilingües: el modelo base cubre más de 140 idiomas; esta variante no modifica el vocabulario ni el entrenamiento, por lo que se espera el mismo soporte.
- Modo "uncensored": la abliteración elimina los rechazos basados en políticas de seguridad, permitiendo generar contenido que el modelo original bloquearía (violencia, lenguaje explícito, instrucciones peligrosas, etc.).
- Sin modo de pensamiento explícito: Gemma 3 no incluye un modo "thinking" como otros modelos; la generación es directa.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comporta un modelo sin mecanismos de rechazo, analizando sesgos, alucinaciones o la eficacia de técnicas de abliteración. Se usaría en entornos controlados con prompts diseñados para provocar respuestas que el modelo original negaría.
- Generación de contenido creativo sin restricciones: escritura de ficción con temáticas adultas, diálogos explícitos o escenas violentas para guiones, novelas o juegos de rol, donde un modelo censurado interrumpiría el flujo creativo.
- Evaluación de robustez de modelos: probar la resistencia de sistemas de moderación o filtros de contenido enfrentándolos a un modelo que genera texto sin filtros, útil para empresas que desarrollan herramientas de seguridad.
- Desarrollo de agentes conversacionales para nichos específicos: chatbots para comunidades que requieren respuestas directas sin evasivas, como foros de debate libre o asistentes para adultos.
- Fine-tuning posterior: al ser una cuantización FP8, puede servir como punto de partida para experimentos de ajuste fino con menos memoria, aunque la de-cuantización previa es necesaria.
- Pruebas de compatibilidad de motores de inferencia: validar si frameworks como vLLM, llama.cpp o TGI pueden cargar pesos FP8 con escalas separadas, lo que es útil para desarrolladores de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta variante cuantizada. Se puede asumir que el rendimiento es similar al del modelo base Gemma 3 12B en BF16, pero con posibles degradaciones menores debido a la cuantización FP8, aunque no hay datos cuantitativos que lo confirmen. Tampoco se ofrecen comparativas con otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 12,2 GB (12.187.325.040 parámetros × 1 byte). Con overhead de activaciones, KV-cache y buffers de escalas, se recomienda al menos 16 GB de VRAM para inferencia con contexto corto, y 24 GB o más para contextos largos (128K tokens).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), A100 40 GB o H100. En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) podría funcionar con contextos reducidos y cuantización adicional de activaciones.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama alta con 24 GB, pero no en las de 8-12 GB habituales en equipos domésticos.
- Opciones de despliegue: al ser un formato FP8 *weight-only* con escalas separadas, no es directamente compatible con llama.cpp u Ollama sin conversión previa. Se requiere un motor que soporte la receta de de-cuantización descrita en el `config.json`, como vLLM (con soporte FP8) o un script personalizado en PyTorch. No se proporcionan instrucciones de carga para ningún framework específico.
- Latencia y throughput: no disponible. Dependerá del hardware y del motor de inferencia; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP8 (este) | 12,19 B | 128K | FP8 weight-only | no disponible | HuggingFace, sin descargas |
| google/gemma-3-12b-it (base) | 12,19 B | 128K | BF16 | Gemma Terms of Use | HuggingFace oficial |
| mradermacher/gemma-3-12b-it-uncensored-GGUF | 12,19 B | 128K | GGUF (varias) | no disponible | HuggingFace |

La comparativa se limita a variantes del mismo modelo base. No hay datos de rendimiento para ninguna de las tres, por lo que la elección entre ellas dependerá del formato de pesos (safetensors FP8 vs. GGUF) y de la facilidad de integración. La versión GGUF de mradermacher es probablemente más fácil de usar con llama.cpp y Ollama, mientras que esta versión FP8 requiere un motor compatible con la receta de cuantización personalizada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una abliteración del modelo base, conserva los sesgos de Gemma 3, que pueden incluir estereotipos de género, raza o cultura. La eliminación de los rechazos no elimina los sesgos subyacentes.
- Riesgo de alucinación: el modelo base ya presenta alucinaciones en contextos ambiguos; la abliteración no corrige este problema y puede empeorarlo al no tener restricciones que frenen respuestas inventadas.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, la cuantización FP8 puede degradar la calidad en contextos muy largos debido a la pérdida de precisión en los pesos.
- Restricciones de licencia: la model card no especifica licencia. El modelo base Gemma 3 tiene una licencia que permite uso comercial con ciertas restricciones (no usar para fines militares, etc.), pero esta variante al ser una modificación no aclara si hereda dicha licencia. Se recomienda contactar al autor antes de uso comercial.
- Advertencia de uso: al ser un modelo "uncensored", puede generar contenido ilegal, dañino o éticamente problemático. No debe desplegarse en producción sin sistemas de moderación externos.
- Compatibilidad técnica: el formato FP8 con escalas separadas no es estándar; muchos motores de inferencia no lo cargarán directamente. Se requiere un proceso de de-cuantización manual, lo que añade complejidad y riesgo de errores.
- Sin soporte oficial: el autor no proporciona documentación de uso, benchmarks ni garantías. El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP8
- Modelo base Gemma 3 12B: https://huggingface.co/google/gemma-3-12b-it
- Variante GGUF uncensored de mradermacher: https://huggingface.co/mradermacher/gemma-3-12b-it-uncensored-GGUF
- Informe técnico de Gemma 3 (arXiv): https://arxiv.org/html/2503.19786
