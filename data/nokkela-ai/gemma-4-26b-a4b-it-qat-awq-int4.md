# nokkela-ai/gemma-4-26B-A4B-it-qat-AWQ-INT4

## Resumen

Gemma 4 26B A4B es un modelo multimodal de la familia Gemma 4 desarrollada por Google DeepMind, publicada bajo licencia Apache 2.0. Se trata de un Mixture-of-Experts (MoE) con 25.805.936.206 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo A4B), capaz de procesar texto e imágenes como entrada y generar texto como salida. Esta ficha concreta, publicada por nokkela-ai, es una cuantización AWQ INT4 (w4a16) derivada del checkpoint QAT q4_0 sin cuantizar de Google, con un tamaño de repositorio de 17,2 GB frente a los ~52 GB que ocuparían los pesos en bf16.

El modelo base incorpora Quantization-Aware Training (QAT), una técnica que entrena el modelo simulando la cuantización durante la fase de entrenamiento para preservar una calidad cercana a bfloat16 tras la compresión. La versión AWQ INT4 aquí presentada aplica además Activation-aware Weight Quantization sobre ese checkpoint QAT, calibrada con un dataset de contenido STEM y agentic, y serializada en formato compressed-tensors para inferencia nativa con vLLM.

Su relevancia actual radica en que combina una ventana de contexto de hasta 256K tokens, soporte multilingüe en más de 140 idiomas y capacidades multimodales en un paquete de 17 GB que cabe en GPUs de consumo alto y en nodos de servidor con una sola GPU de 24 GB. Para desarrolladores que necesitan desplegar un modelo de razonamiento y código con contexto largo sin renunciar a la calidad de un modelo mucho mayor, esta variante QAT+AWQ reduce drásticamente los requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal; familia Gemma 4 |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | AWQ INT4 (w4a16) sobre checkpoint QAT q4_0; el modelo base QAT admite además GGUF Q4_0, wNa8o8 (móvil) y compressed-tensors w4a16 |
| Idiomas soportados | Más de 140 idiomas (según model card del modelo base) |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | safetensors con compressed-tensors (AWQ INT4) |
| Pipeline | image-text-to-text |
| Modalidades de entrada | Texto e imagen (audio solo en variantes E2B, E4B y 12B) |
| Modalidades de salida | Texto |
| Tamaño del repositorio | 17,2 GB |
| Librería | transformers |
| Versión de cuantización | cyankiwi 26.05.01 |
| Calibración AWQ | Dataset STEM and Agentic |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts dentro de la familia Gemma 4, que combina variantes densas y MoE en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B). La variante 26B A4B activa aproximadamente 4.000 millones de parámetros por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso de 26B manteniendo la capacidad total del modelo. El modelo es multimodal: acepta texto e imágenes y genera texto; el soporte de audio queda restringido a las variantes E2B, E4B y 12B, no a esta.

El checkpoint base de Google se ha sometido a Quantization-Aware Training (QAT), de modo que los pesos q4_0 sin cuantizar están optimizados para soportar la cuantización posterior con una pérdida de calidad mínima frente a bfloat16. Sobre ese checkpoint, el publicador nokkela-ai aplica AWQ INT4 (w4a16, pesos de 4 bits y activaciones de 16 bits) con calibración específica en datos STEM y agentic, y serializa el resultado en compressed-tensors para su uso nativo con vLLM. La model card del modelo base menciona además decodificación especulativa mediante modelos assistant (multi-token prediction), con la restricción de que el assistant debe ser también un checkpoint QAT de la misma precisión. No se dispone de datos sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con diseño específico para tareas de razonamiento según la familia Gemma 4.
- Generación y comprensión de código, orientada a tareas de programación y pipelines de desarrollo.
- Procesamiento de imágenes como entrada (image-text-to-text), incluyendo descripción, extracción de información y razonamiento sobre contenido visual.
- Capacidades matemáticas y resolución de problemas cuantitativos, reforzadas por la calibración AWQ en datos STEM.
- Soporte multilingüe en más de 140 idiomas.
- Ventana de contexto de hasta 256K tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con endpoints y despliegue en infraestructura de inferencia (tag endpoints_compatible).
- No se confirma en la información disponible el soporte explícito de tool calling, function calling ni agentes autónomos, aunque la calibración en datos "agentic" sugiere orientación a ese tipo de cargas.
- No incluye entrada de audio en esta variante (solo disponible en E2B, E4B y 12B).

## Casos de uso

- Análisis de documentos largos: con 256K tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos y responder preguntas sobre ellos sin fragmentación, lo que resulta adecuado para legaltech y auditoría documental.
- Asistencia en programación: generación y revisión de código en repositorios de tamaño medio, con capacidad de razonar sobre fragmentos extensos de código y contexto de proyecto gracias a la ventana larga.
- Procesamiento de documentación técnica con imágenes: al aceptar entradas de imagen, puede extraer información de diagramas, capturas de pantalla y tablas escaneadas junto con el texto que las acompaña, útil en soporte de ingeniería.
- Atención al cliente multilingüe: el soporte de más de 140 idiomas y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en distintos mercados sin cambiar de modelo.
- Razonamiento sobre datos STEM: la calibración AWQ en contenido STEM y agentic lo hace apropiado para asistentes de investigación, resolución de problemas matemáticos y análisis técnico en entornos con recursos limitados.
- Despliegue en infraestructura de una sola GPU: con 17,2 GB de pesos cuantizados, puede servirse en una RTX 4090 o A10G de 24 GB para prototipos y cargas de producción de volumen moderado, con vLLM como motor de inferencia.
- Pipelines de extracción de información multimodal: clasificación y extracción de datos de imágenes y texto combinados en procesos batch, aprovechando el formato compressed-tensors para integración con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17,2 GB solo para pesos; con KV cache para contexto largo (hasta 256K tokens) el consumo puede superar los 24 GB, por lo que conviene limitar la longitud de contexto efectiva según la GPU.
- GPU de servidor recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para contexto largo y concurrencia alta.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contextos moderados; en GPUs de 16 GB no es viable sin reducir contexto o usar variantes GGUF más agresivas.
- Opciones de despliegue: vLLM es la opción nativa para el formato compressed-tensors w4a16; el modelo base QAT dispone de variantes GGUF Q4_0 para llama.cpp y ecosistema compatible, aunque esta variante AWQ concreta está pensada para vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un MoE con ~4B parámetros activos, se espera un throughput superior al de un modelo denso de 26B, pero no se aportan cifras medidas.
- Decodificación especulativa: compatible con modelos assistant, siempre que el assistant sea también un checkpoint QAT de la misma precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B AWQ INT4 (esta ficha) | 25,8B totales / ~4B activos | 256K | Texto + imagen | Apache 2.0 | safetensors compressed-tensors |
| Gemma 4 26B A4B QAT q4_0 (base de Google) | 25,8B totales / ~4B activos | 256K | Texto + imagen | Apache 2.0 | safetensors (q4_0 sin cuantizar) |
| Gemma 4 31B (variante densa de la familia) | 31B | 256K | Texto + imagen | Apache 2.0 | safetensors / GGUF |
| Gemma 4 12B (variante menor de la familia) | 12B | 256K | Texto + imagen + audio | Apache 2.0 | safetensors / GGUF / wNa8o8 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo frente a estas variantes ni frente a modelos de otras familias.

## Limitaciones y advertencias

- La cuantización AWQ INT4 introduce una pérdida de precisión respecto al checkpoint QAT sin cuantizar; no se han publicado evaluaciones que cuantifiquen esa pérdida en esta variante concreta.
- La calibración AWQ se realizó con un dataset de contenido STEM y agentic, por lo que el comportamiento en dominios muy alejados (creativo, jurídico, conversacional general) puede degradarse más de lo habitual.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan tasas de alucinación medidas.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda evaluar sesgos en el dominio de despliegue antes de producción.
- El contexto de 256K tokens es teórico; en la práctica, el KV cache necesario limita la longitud efectiva en GPUs de 24 GB.
- El soporte de audio no está incluido en esta variante (solo E2B, E4B y 12B).
- Uso comercial permitido bajo Apache 2.0, pero la model card remite a la licencia específica de Gemma 4; conviene revisar sus términos adicionales antes de un despliegue comercial.
- La decodificación especulativa exige que el modelo assistant sea un checkpoint QAT de la misma precisión; mezclar precisiones puede romper la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la calidad de esta cuantización concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/gemma-4-26B-A4B-it-qat-AWQ-INT4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección QAT q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Blog de lanzamiento QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- GitHub de Google Gemma: https://github.com/google-gemma
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Dataset de calibración AWQ: https://huggingface.co/datasets/cyankiwi/calibration
- Web del publicador (cyan.kiwi): https://cyan.kiwi/
- Perfil del publicador en Hugging Face: https://huggingface.co/cyankiwi
- Perfil del publicador en ModelScope: https://www.modelscope.ai/organization/cyankiwi
