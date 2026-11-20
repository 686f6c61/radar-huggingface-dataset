# nokkela-ai/gemma-4-12B-it-qat-w4a16-ct

## Resumen

Gemma 4 12B IT QAT w4a16-ct es una versión cuantizada del modelo multimodal Gemma 4 12B de Google DeepMind, publicada por el usuario nokkela-ai. Se trata de un checkpoint de instrucción (IT) que ha pasado por un pipeline de Quantization-Aware Training (QAT) y se ha serializado en el formato compressed-tensors con cuantización de pesos a 4 bits y activaciones a 16 bits (w4a16), optimizado para inferencia nativa con vLLM. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, del que hereda la arquitectura y el entrenamiento original.

El modelo resuelve el problema de desplegar un modelo multimodal de ~13.000 millones de parámetros con requisitos de memoria reducidos sin perder calidad significativa respecto a bfloat16, gracias al entrenamiento consciente de cuantización. Con 256K tokens de contexto, soporte nativo de texto, imagen y audio, y más de 140 idiomas, está pensado para entornos de servidor y estaciones de trabajo con GPUs de gama alta.

La relevancia actual radica en que combina tres tendencias: modelos multimodales abiertos de tamaño medio, cuantización QAT lista para producción y un formato (compressed-tensors) que encaja directamente con el stack de vLLM, evitando conversiones manuales y preservando la calidad del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), Gemma 4 |
| Parámetros totales | 12.966.363.184 (~12,97B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors; el modelo base QAT se distribuye también en Q4_0 y GGUF |
| Idiomas soportados | Más de 140 idiomas (según la model card del modelo base) |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 48 capas con un vocabulario de 262K tokens y atención híbrida: intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. El 12B es multimodal: incluye codificadores de visión y audio (según la tabla de la familia, el 12B Unified soporta texto, imagen y audio), y genera salida de texto.

El entrenamiento original incluye instrucción tuning (variante IT) y un pipeline de Quantization-Aware Training que produce el checkpoint Q4_0 del que deriva esta versión. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La innovación principal de esta ficha es la serialización en compressed-tensors w4a16, que permite cargar el modelo directamente en vLLM con pesos de 4 bits y activaciones de 16 bits, manteniendo una calidad cercana a bfloat16 según el autor. No se dispone de información sobre el proceso de conversión específico aplicado por nokkela-ai.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes).
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Comprensión de audio (nativo en la variante 12B de la familia Gemma 4).
- Procesamiento de vídeo como entrada multimodal (según la model card de la familia).
- Generación de código y capacidades agenticas mejoradas respecto a generaciones anteriores.
- Soporte nativo de function calling para agentes autónomos.
- Soporte nativo del rol `system` en las conversaciones, permitiendo prompts de sistema estructurados.
- Capacidades multilingües en más de 140 idiomas.
- Pipeline any-to-any / image-text-to-text, con entrada multimodal y salida de texto.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo puede procesar capturas de pantalla, fotos de productos y audio del cliente en una misma conversación, manteniendo contexto de hasta 256K tokens para historiales largos.
- Análisis de documentos con imágenes y audio: extracción de información de facturas escaneadas, informes con gráficos o notas de voz transcritas, combinando visión y audio en un único pipeline.
- Generación de código en producción: con function calling nativo y contexto de 256K, puede integrarse en pipelines de CI/CD para revisar diffs, invocar herramientas y razonar sobre repositorios completos.
- Agentes autónomos multi-paso: el soporte de system prompt y tool calling permite construir agentes que planifican, ejecutan herramientas y mantienen estado a lo largo de muchas interacciones.
- Transcripción y comprensión de reuniones: al aceptar audio de entrada, puede resumir reuniones, extraer acciones y responder preguntas sobre el contenido sin un pipeline separado de ASR.
- Despliegue en servidores con vLLM: el formato compressed-tensors w4a16 permite servir el modelo con menor huella de VRAM que la versión bf16, adecuado para entornos con GPUs de 24-48 GB.
- Investigación en cuantización: al ser un checkpoint QAT derivado de un modelo abierto, sirve para estudiar el impacto de w4a16 en tareas multimodales y comparar con Q4_0 o bf16.
- Procesamiento multilingüe a escala: con más de 140 idiomas, es adecuado para moderación de contenido, traducción asistida o atención al cliente en mercados internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos w4a16, el peso del modelo ocupa aproximadamente 6,5 GB (12,97B parámetros × ~4 bits), más overhead de activaciones, KV cache y codificadores multimodales; se estima un consumo total de 10-16 GB según longitud de contexto y batch.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para desarrollo con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con contexto reducido; el contexto de 256K completo requiere más memoria para el KV cache.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors w4a16), transformers; el modelo base QAT también está disponible en GGUF para llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La cuantización w4a16 reduce el ancho de banda de memoria frente a bf16, lo que en teoría mejora el throughput en decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 12B IT QAT w4a16-ct (este) | ~12,97B | 256K | Texto, imagen, audio | Apache 2.0 | safetensors (compressed-tensors w4a16) |
| Gemma 4 12B IT QAT Q4_0 unquantized | 11,95B (según familia) | 256K | Texto, imagen, audio | Apache 2.0 | safetensors (half precision QAT) |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | safetensors |
| Gemma 4 26B A4B (MoE) | No disponible en detalle | 256K | No disponible en detalle | Apache 2.0 | safetensors |

La comparativa se limita a variantes de la misma familia porque la información proporcionada no incluye modelos de otros desarrolladores. El 12B w4a16 ofrece el mismo contexto y modalidades que el 12B QAT Q4_0, con un formato optimizado para vLLM; el 31B Dense duplica parámetros y pierde audio; el 26B A4B es una variante MoE de la que no se detallan parámetros activos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales, pero no se aportan análisis.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de razonamiento con thinking modes pueden generar cadenas de razonamiento plausibles pero incorrectas.
- Limitaciones de contexto o idioma: aunque soporta 256K tokens y más de 140 idiomas, el rendimiento en contextos muy largos y en idiomas de bajos recursos puede degradarse; no se aportan evaluaciones por idioma.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el campo `license_link` apunta a la licencia específica de Gemma 4 de Google, que puede imponer términos adicionales de uso aceptable; conviene revisarla antes de uso comercial.
- Caveat de producción: el formato compressed-tensors w4a16 está pensado para vLLM; otros motores pueden no soportarlo directamente. Además, la decodificación especulativa con modelos asistente requiere que el asistente sea también QAT con la misma precisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-20; se trata de una publicación muy reciente y de un autor no oficial (no Google), por lo que conviene validar la integridad de los pesos antes de usarlo en producción.
- No se detalla el proceso de conversión a compressed-tensors ni se aportan evaluaciones de calidad del checkpoint cuantizado por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/gemma-4-12B-it-qat-w4a16-ct
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT para Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
