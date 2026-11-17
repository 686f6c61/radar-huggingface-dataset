# Sassa2ww/gemma-4-12B-it-qat-w4a16-ct

## Resumen

Gemma 4 12B Unified es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, dentro de la familia Gemma 4. Esta ficha concreta corresponde a la variante `Sassa2ww/gemma-4-12B-it-qat-w4a16-ct`, una serialización en formato compressed-tensors (w4a16) del checkpoint instruction-tuned de 12B optimizado con Quantization-Aware Training (QAT). El modelo procesa texto, imagen y audio como entrada y genera texto como salida, con una ventana de contexto de 256K tokens y soporte declarado para más de 140 idiomas.

La relevancia de esta variante radica en el formato w4a16: pesos cuantizados a 4 bits con activaciones a 16 bits, pensado para inferencia nativa y optimizada en vLLM. Frente al checkpoint bfloat16, reduce de forma drástica los requisitos de memoria manteniendo, según el autor, una calidad cercana al original gracias al entrenamiento con conciencia de cuantización. El repositorio ocupa 10,3 GB y declara 12.966.363.184 parámetros en los tensores safetensors.

El modelo se posiciona en el segmento de estaciones de trabajo y GPUs de consumo alto: razonamiento configurable, codificación, flujos agénticos con function calling nativo y comprensión multimodal. Incorpora atención híbrida con ventanas deslizantes locales intercaladas con atención global, RoPE proporcional (p-RoPE) y claves/valores unificados en las capas globales para contener el coste de memoria en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window local + atención global), p-RoPE y KV unificados en capas globales |
| Parametros totales | 12.966.363.184 (11,95B según la model card del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | w4a16 (compressed-tensors); el modelo base QAT se distribuye también en Q4_0 sin cuantizar y GGUF Q4_0 |
| Idiomas soportados | Más de 140 idiomas (según la model card del modelo base); no se detalla la lista |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors en formato compressed-tensors (w4a16) |
| Ventana deslizante | 1024 tokens |
| Capas | 48 |
| Tamano de vocabulario | 262K |
| Modalidades de entrada | Texto, imagen, audio |
| Modalidad de salida | Texto |
| Tamano del repositorio | 10,3 GB |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 48 capas y 11,95B parámetros con un mecanismo de atención híbrido: intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y RoPE proporcional (p-RoPE) para reducir el consumo de memoria en contextos de hasta 256K tokens. El vocabulario es de 262K tokens y el modelo integra codificadores para imagen y audio, lo que habilita la entrada multimodal.

El entrenamiento del checkpoint base incluyó Quantization-Aware Training (QAT), de modo que los pesos pueden cuantizarse a 4 bits preservando una calidad próxima a bfloat16. Esta variante concreta no ha sido reentrenada: es una conversión del checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized` al esquema compressed-tensors w4a16, con pesos a 4 bits y activaciones a 16 bits, orientada a inferencia optimizada en vLLM. La model card del modelo base menciona variantes preentrenadas e instruction-tuned, soporte nativo del rol `system` y decodificación especulativa mediante modelos drafter, con la advertencia de que el asistente debe compartir la misma precisión QAT que el modelo objetivo. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio de forma nativa en los modelos E2B, E4B y 12B de la familia.
- Procesamiento de vídeo como modalidad de entrada según la model card del modelo base.
- Generación de código y tareas de codificación con mejoras declaradas en benchmarks de coding.
- Function calling nativo y capacidades agénticas para flujos autónomos de varios pasos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Decodificación especulativa mediante modelos asistente (drafter) compatibles en precisión QAT.
- Contexto largo de 256K tokens para documentos extensos y conversaciones multi-turno prolongadas.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens, y el soporte nativo del rol `system` permite fijar tono, políticas y restricciones de dominio de forma estable.
- Análisis de documentos técnicos con imágenes: informes con gráficos, capturas o diagramas pueden enviarse como entrada multimodal y resumirse o extraerse datos estructurados en una sola pasada de contexto largo.
- Generación de código en producción: el function calling nativo y las capacidades agénticas permiten integrarlo en pipelines de CI/CD para revisión de parches, generación de tests o resolución de incidencias con acceso a herramientas externas.
- Transcripción y análisis de reuniones: al aceptar audio como entrada, puede procesar grabaciones y producir actas, resúmenes y listas de acciones sin un pipeline separado de ASR.
- Asistentes locales en estación de trabajo: el formato w4a16 reduce el peso a unos 10,3 GB, lo que hace viable su despliegue en GPUs de consumo alto con vLLM para uso personal o de equipo.
- Agentes de investigación multi-paso: el razonamiento configurable y el contexto de 256K permiten encadenar búsquedas, lectura de fuentes y síntesis manteniendo el estado de la tarea en la ventana de contexto.
- Moderación y clasificación multilingüe: la cobertura de más de 140 idiomas permite aplicar el mismo modelo a colas de contenido en varios idiomas sin modelos específicos por lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 10-12 GB solo para pesos en w4a16; el consumo real depende del backend, del tamaño de lote y de la longitud de contexto.
- Con contexto de 256K tokens, la caché KV crece de forma significativa; las capas globales usan KV unificados y p-RoPE para mitigar el coste, pero se recomienda planificar VRAM adicional para secuencias largas.
- GPU recomendadas: A100 40/80 GB y H100 para despliegues de producción con lotes concurrentes y contexto largo; RTX 4090 (24 GB) y GPUs de 24 GB o más para uso individual.
- Cabe en GPU de consumo: sí, en RTX 4090 y tarjetas con 24 GB o más para inferencia con contexto moderado; en 16 GB el margen es limitado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM es el backend objetivo del formato compressed-tensors w4a16; el modelo base QAT también se distribuye en GGUF Q4_0 para llama.cpp y ecosistemas compatibles. No se confirma soporte en Ollama ni en TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 12B Unified (esta ficha, w4a16) | 12,97B | 256K | Texto, imagen, audio | Apache 2.0 | safetensors compressed-tensors |
| Gemma 4 12B Unified QAT Q4_0 (sin cuantizar) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | safetensors bf16 extraído de QAT |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | safetensors / GGUF |
| Gemma 4 26B A4B (MoE) | No disponible en detalle | 256K | Texto, imagen | Apache 2.0 | safetensors / GGUF |

La comparativa se limita a la propia familia Gemma 4 porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos de otros fabricantes que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado con datos web a gran escala, es esperable que reproduzca sesgos presentes en ellos.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad; como en cualquier modelo generativo, requiere verificación en dominios factuales.
- Idiomas: se declaran más de 140 idiomas, pero no se detalla el nivel de calidad por idioma; el rendimiento puede variar notablemente fuera de los idiomas mayoritarios.
- Licencia: Apache 2.0 según la model card, con enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos adicionales de uso de Gemma antes de un despliegue comercial.
- Precisión: al ser una conversión comunitaria del checkpoint QAT a compressed-tensors, no hay evaluación publicada de la degradación respecto al modelo original; se recomienda validar en la tarea concreta.
- Compatibilidad de decodificación especulativa: si se usa un modelo asistente, debe ser también un checkpoint QAT de la misma precisión.
- Contexto largo: aunque se soportan 256K tokens, el coste de memoria y la latencia crecen con la longitud; no hay datos publicados de rendimiento en el extremo de la ventana.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, sin historial de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sassa2ww/gemma-4-12B-it-qat-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT para Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
