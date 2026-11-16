# Nihgsmile/gemma-4-12B-it-qat-q4_0-gguf

## Resumen

Gemma 4 12B IT QAT Q4_0 GGUF es una conversión a formato GGUF del checkpoint oficial de Google DeepMind `google/gemma-4-12B-it-qat-q4_0-unquantized`, un modelo multimodal de la familia Gemma 4 optimizado mediante entrenamiento consciente de cuantización (QAT). El modelo original pertenece a la gama de modelos densos de 12B parámetros de Gemma 4, diseñados para despliegue en GPU de consumo y estaciones de trabajo, con soporte nativo de texto, imagen y audio como entrada y salida de texto. Esta ficha concreta ha sido publicada por el usuario Nihgsmile y empaqueta los pesos en GGUF Q4_0, lo que reduce el peso en disco a aproximadamente 7,2 GB y facilita su ejecución en entornos con llama.cpp y derivados.

La relevancia de esta variante radica en que el pipeline QAT de Gemma 4 permite conservar una calidad cercana a bfloat16 con una huella de memoria mucho menor, lo que habilita la inferencia local de un modelo de 11.907.350.576 parámetros en hardware de gama alta de consumo. El modelo soporta una ventana de contexto de 256K tokens, más de 140 idiomas, modos de razonamiento configurables, soporte nativo de function calling y rol de sistema, y una arquitectura de atención híbrida que combina atención local con ventana deslizante y atención global.

Esta ficha describe la variante GGUF Q4_0 publicada por Nihgsmile, derivada del checkpoint QAT oficial de Google. No se dispone de información específica sobre el proceso de conversión aplicado por el autor ni sobre validaciones adicionales de calidad del GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), p-RoPE y Keys/Values unificadas en capas globales |
| Parámetros totales | 11.907.350.576 (11,95B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | Q4_0 (GGUF); el modelo base admite QAT en Q4_0, wNa8o8 y w4a16 |
| Idiomas soportados | Más de 140 idiomas (según la model card de Gemma 4) |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | GGUF (repo de 7,2 GB); el modelo base en safetensors |
| Capas | 48 |
| Ventana deslizante | 1024 tokens |
| Tamaño de vocabulario | 262K |
| Modalidades de entrada | Texto, imagen, audio |
| Modalidad de salida | Texto |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de 48 capas con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la capa final sea siempre global. Para optimizar el consumo de memoria en contextos largos, las capas globales emplean Keys y Values unificadas y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens y el modelo incorpora codificadores multimodales para imagen y audio, aunque la model card no detalla los parámetros exactos de estos codificadores para la variante de 12B.

El checkpoint original ha sido sometido a un pipeline de Quantization-Aware Training (QAT) por parte de Google DeepMind, que permite mantener una calidad próxima a bfloat16 tras cuantizar a Q4_0. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el proceso de conversión a GGUF realizado por el autor de esta ficha, más allá de que parte del checkpoint QAT no cuantizado.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio de forma nativa en la variante de 12B.
- Procesamiento de vídeo como entrada multimodal (según la model card de la familia).
- Generación de código y tareas de programación con mejoras notables en benchmarks de coding.
- Soporte nativo de function calling y tool calling.
- Capacidades agénticas y razonamiento multi-paso para flujos autónomos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingüismo en más de 140 idiomas.
- Conversaciones multi-turno con contexto largo de hasta 256K tokens.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 256K tokens, manteniendo el contexto de interacciones previas y el rol de sistema para definir el tono y las políticas de respuesta.
- Generación de código en producción: con soporte nativo de function calling y mejoras en benchmarks de coding, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o asistencia en tareas de refactorización.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento configurable y contexto largo permite construir agentes que planifican, invocan herramientas y mantienen estado a lo largo de tareas complejas.
- Análisis de documentos con imágenes: al aceptar texto e imagen, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales para extracción de información y resumen.
- Transcripción y análisis de audio: la modalidad de audio nativa en la variante de 12B permite construir asistentes de voz, resumen de reuniones o análisis de contenido hablado sin un pipeline separado de ASR.
- Asistente local en estación de trabajo: el GGUF Q4_0 de 7,2 GB puede ejecutarse en GPU de consumo con llama.cpp u Ollama, habilitando un asistente privado sin dependencia de la nube.
- Investigación y experimentación: al ser un checkpoint QAT derivado del oficial, sirve para estudiar el impacto de la cuantización Q4_0 en calidad y latencia frente al modelo en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_0 ocupa aproximadamente 7,2 GB en disco; en inferencia se necesita espacio adicional para la caché KV, que crece con la longitud de contexto. Con contexto corto puede caber en GPUs de 8-12 GB; con contextos largos se requieren 16-24 GB o más.
- GPU recomendadas: para contexto largo y uso intensivo, A100, H100 o GPUs de 24 GB o más (RTX 3090, RTX 4090, L40S). Para contexto moderado, RTX 4070 Ti, RTX 4080 o similares con 12-16 GB.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más para contexto corto; se recomienda 16 GB o más para aprovechar la ventana de 256K.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. El modelo base dispone de versiones en compressed-tensors (w4a16) para vLLM y de checkpoints no cuantizados para transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 12B IT QAT Q4_0 (esta ficha) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 12B IT QAT Q4_0 unquantized (base) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Safetensors |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Safetensors / GGUF |
| Gemma 4 26B A4B (MoE) | 26B (4B activos) | 256K | Texto, imagen | Apache 2.0 | Safetensors / GGUF |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos específicos de sesgos para esta variante; se heredan los sesgos del modelo base Gemma 4, no documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta conversión GGUF.
- La cuantización Q4_0 puede introducir degradación de calidad frente al modelo en bfloat16, aunque el pipeline QAT está diseñado para minimizarla; no se han publicado métricas que lo cuantifiquen en esta ficha.
- El autor de la conversión GGUF es un usuario independiente (Nihgsmile) y no Google DeepMind; no hay garantías de validación del proceso de conversión.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia específica de Gemma 4; conviene revisar los términos adicionales de uso comercial de Gemma antes de desplegar en producción.
- El uso de decodificación especulativa con un modelo asistente requiere que este también sea un checkpoint QAT con la misma precisión, según la model card.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, lo que indica ausencia de validación comunitaria.
- No se dispone de información sobre los idiomas exactos cubiertos ni sobre su calidad relativa por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/Nihgsmile/gemma-4-12B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en DeepMind: https://deepmind.google/models/gemma/
