# HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-9B-Uncensored-HauhauCS-Aggressive es una variante del modelo Qwen3.5-9B de Alibaba, ajustada por el usuario HauhauCS para eliminar los rechazos del modelo original. Según su model card, presenta 0 rechazos sobre 465 casos de prueba, manteniendo intactas las capacidades del modelo base. Está pensado para desarrolladores que necesitan un modelo sin filtros de seguridad para tareas de generación de contenido, investigación o experimentación, aunque su uso conlleva responsabilidades éticas y legales.

El modelo mantiene la arquitectura híbrida del Qwen3.5-9B: combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1, con 9 mil millones de parámetros densos y 32 capas. Dispone de una ventana de contexto nativa de 262 000 tokens, ampliable a 1 millón mediante YaRN, y es nativamente multimodal (texto, imagen y vídeo). Se distribuye en formato GGUF con varias cuantizaciones, así como en safetensors mediante un repositorio espejo.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una alternativa sin censura para aplicaciones donde los modelos estándar rechazan peticiones legítimas (por ejemplo, escritura creativa con temas adultos, análisis de contenido sensible); por otro, demuestra el ecosistema de fine-tuning abierto sobre la serie Qwen3.5, una de las familias más utilizadas en 2026. Su licencia Apache 2.0 permite uso comercial, aunque el carácter "uncensored" exige precaución en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet linear attention + softmax attention (ratio 3:1) |
| Parametros totales | 9 000 millones (dense) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); safetensors disponible |
| Idiomas soportados | 201 lenguas (multilingüe, incluye inglés, chino, español, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, LM Studio, etc.), safetensors (repositorio espejo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina atención lineal con Gated DeltaNet y atención softmax completa en una proporción de 3:1. Esta combinación permite manejar contextos muy largos (262K nativos) con un coste computacional reducido respecto a la atención completa, manteniendo la calidad de modelado. El modelo incluye soporte de multi-token prediction (MTP), lo que acelera la generación al predecir varios tokens por paso, y un vocabulario de 248 000 entradas que cubre 201 idiomas.

El proceso de fine-tuning realizado por HauhauCS no está documentado en detalle. La model card indica que se eliminaron los rechazos del modelo original sin modificar datasets ni capacidades, y que se trata de una variante "agresiva" con una eliminación más profunda de los mecanismos de rechazo. No se especifican los datos utilizados, el número de pasos de entrenamiento ni si se emplearon técnicas como RLHF o DPO. El modelo es nativamente multimodal, por lo que el ajuste también afecta a las entradas de imagen y vídeo.

## Capacidades

- Generación de texto sin rechazos: responde a cualquier petición sin negarse, incluso aquellas que el modelo base rechazaría.
- Razonamiento y pensamiento: mantiene el modo "thinking" del Qwen3.5, con parámetros recomendados de temperatura 0.6 y top_p 0.95 para razonamiento profundo.
- Multimodalidad: procesa entradas de texto, imagen y vídeo mediante el encoder visual incluido en el archivo `mmproj`.
- Contexto largo: ventana nativa de 262 000 tokens, ampliable a 1 000 000 con YaRN, adecuada para documentos extensos o conversaciones de muchas vueltas.
- Multi-token prediction: genera varios tokens por paso, mejorando el throughput en inferencia.
- Multilingüismo: vocabulario de 248 000 entradas que cubre 201 idiomas, con buen rendimiento en inglés, chino y otras lenguas.
- Compatibilidad con runtimes populares: funciona con llama.cpp, LM Studio, Jan, koboldcpp, vLLM, SGLang y KTransformers.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, guiones o diálogos con temáticas adultas o controvertidas sin rechazos, algo útil para autores que trabajan con contenido explícito o tabú.
- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede resumir y extraer información de libros completos, informes técnicos o expedientes legales de cientos de páginas en una sola pasada.
- Asistencia en investigación de contenido sensible: permite analizar discursos de odio, propaganda o material extremista para estudios académicos, sin que el modelo se niegue a procesar el texto.
- Desarrollo de chatbots sin filtros: se puede integrar en aplicaciones de rol o compañía donde se requiere que el asistente responda a cualquier petición del usuario, manteniendo una personalidad definida.
- Generación de código y documentación técnica: hereda las capacidades de código del Qwen3.5-9B, permitiendo generar scripts, explicar algoritmos o documentar APIs sin restricciones de contenido.
- Procesamiento multimodal de imágenes y vídeo: con el encoder visual, puede describir imágenes, transcribir vídeo o responder preguntas sobre contenido visual, incluso si este es gráfico o explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests estándar. Se indica únicamente que el modelo mantiene "el 100% de las capacidades del original", pero sin datos numéricos que lo respalden. Para evaluar su rendimiento, se recomienda consultar los benchmarks del modelo base Qwen3.5-9B y asumir que esta variante ofrece resultados equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - BF16: ~17 GB de pesos, más overhead de KV cache y activaciones, requiere al menos 24 GB de VRAM.
  - Q8_0: ~8.9 GB de pesos, recomendable 12-16 GB de VRAM para contexto largo.
  - Q6_K: ~6.9 GB de pesos, viable en GPUs de 12 GB con contexto moderado.
  - Q4_K_M: ~5.3 GB de pesos, funciona en GPUs de 8 GB con contexto limitado.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q8_0 o Q6_K; A100 o H100 (40-80 GB) para BF16 y contexto máximo.
- En consumer GPU: cabe en RTX 3090/4090 con cuantización Q4_K_M o Q6_K, siempre que se ajuste la longitud de contexto.
- Opciones de despliegue: llama.cpp (con builds recientes que soporten la arquitectura híbrida), LM Studio, Jan, koboldcpp, vLLM, SGLang y KTransformers para producción.
- Latencia y throughput: no se han publicado mediciones específicas. El soporte de MTP y la atención lineal deberían ofrecer una generación más rápida que un transformer denso equivalente, pero depende del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262K (1M con YaRN) | Sí | Apache 2.0 | Safetensors, GGUF |
| Qwen3.5-9B-Uncensored-HauhauCS (este) | 9B | 262K (1M con YaRN) | Sí | Apache 2.0 | GGUF, Safetensors |
| Llama 3.1 8B Instruct | 8B | 128K | No | Llama 3.1 Community License | Safetensors, GGUF |
| Mistral 7B Instruct | 7B | 32K | No | Apache 2.0 | Safetensors, GGUF |

La comparativa se basa en características generales conocidas de los modelos mencionados, no en benchmarks. Este modelo destaca por su contexto muy largo, multimodalidad y ausencia de rechazos, frente a alternativas con restricciones de seguridad estándar.

## Limitaciones y advertencias

- Ausencia de rechazos: el modelo no se niega a generar contenido dañino, ilegal o no ético. Esto supone un riesgo de uso indebido y puede violar políticas de plataformas o leyes locales.
- Alucinaciones: como cualquier LLM, puede inventar hechos, citas o referencias, especialmente en dominios especializados. No debe usarse como fuente única de verdad.
- Posibles disclaimers: aunque no rechaza, puede añadir avisos al final de la respuesta (p. ej., "esto es información general, no asesoramiento legal"), heredados del entrenamiento base.
- Sesgos: el modelo puede reflejar los sesgos del corpus de entrenamiento original, incluyendo estereotipos o prejuicios, que el fine-tuning no corrige.
- Requisitos de contexto: para mantener el modo "thinking", se recomienda un contexto mínimo de 128K, lo que exige hardware con suficiente VRAM.
- Arquitectura reciente: el soporte en llama.cpp es muy reciente (marzo de 2026); es necesario usar builds actualizados para evitar fallos de compatibilidad.
- Licencia Apache 2.0: permite uso comercial, pero la distribución de contenido generado puede estar sujeta a normativas específicas sobre contenido dañino o engañoso.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio espejo en safetensors: https://huggingface.co/GitMylo/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-safetensors
- Guía de inicio en HackerNoon: https://hackernoon.com/qwen35-9b-uncensored-hauhaucs-aggressive-model-a-beginners-guide-to-get-you-started
- Página alternativa en GitCode: https://ai.gitcode.com/openharmony-models/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante de 4B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
