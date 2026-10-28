# Fix-AI/Qwen3.5-9B-GGUF

## Resumen

Fix-AI/Qwen3.5-9B-GGUF es una republicación en formato GGUF del modelo Qwen3.5-9B de Alibaba Qwen, cuantizado con el método Unsloth Dynamic 2.0. El repositorio lo mantiene el usuario Fix-AI y su propia model card indica explícitamente que se trata de un duplicado: la versión original de referencia se encuentra en unsloth/Qwen3.5-9B-GGUF. Por tanto, la arquitectura, los pesos y el entrenamiento corresponden íntegramente a Qwen, mientras que el trabajo de este repositorio es únicamente la conversión y publicación de ficheros GGUF.

El modelo base es un modelo de lenguaje causal multimodal (texto e imagen) de aproximadamente 8.950 millones de parámetros, con una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention), además de un codificador de visión. Su ventana de contexto nativa es de 262.144 tokens y es extensible hasta 1.010.000 tokens, lo que lo sitúa en la liga de modelos de 9B con contexto muy largo.

Es relevante ahora porque la generación GGUF permite ejecutar un modelo multimodal con contexto de cientos de miles de tokens en hardware de consumo y en entornos de inferencia locales (llama.cpp, Ollama y similares), algo que con los pesos originales en safetensors requeriría GPUs de datacenter. La licencia Apache 2.0 facilita además el uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: 8 bloques de 3 × (Gated DeltaNet, atención lineal → FFN) + 1 × (Gated Attention → FFN), con codificador de visión |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | No disponible (la información proporcionada no detalla número de expertos ni parámetros activos para la variante de 9B; las notas de la familia mencionan MoE disperso de forma genérica) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | GGUF con Unsloth Dynamic 2.0 (los niveles concretos incluidos en el repo no se detallan en la información disponible) |
| Idiomas soportados | 201 idiomas y dialectos según la model card de la familia; listado concreto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio, 147,8 GB en total); safetensors en el modelo base Qwen/Qwen3.5-9B |

Otros datos de arquitectura documentados: dimensión oculta 4096, 32 capas, embedding y salida de 248.320 tokens (con padding), FFN con dimensión intermedia 12.288. En Gated DeltaNet: 32 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. En Gated Attention: 16 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64.

## Arquitectura y entrenamiento

El modelo base es un transformer causal con codificador de visión, entrenado con fusión temprana de tokens multimodales (*early fusion*), de modo que texto e imagen se procesan en el mismo espacio de tokens desde el preentrenamiento. La parte lingüística usa una disposición híbrida repetida ocho veces: tres subcapas de Gated DeltaNet (atención lineal con estado recurrente) seguidas de una subcapa de Gated Attention (atención completa agrupada con 4 cabezas KV). Esta mezcla reduce el coste computacional y de caché en contextos largos, ya que solo 8 de las 32 capas mantienen una caché KV que crece con la longitud de la secuencia. El modelo incorpora además entrenamiento con *multi-token prediction* (MTP) en varios pasos, lo que habilita decodificación especulativa nativa.

El entrenamiento consta de preentrenamiento y postentrenamiento, con un escalado de aprendizaje por refuerzo sobre entornos multiagente de gran escala y distribuciones de tareas progresivamente más complejas. La model card de la familia declara una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles de las fases de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multi paso, con paridad declarada frente a Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Comprensión de imágenes (pipeline `image-text-to-text`): el modelo integra un codificador de visión y acepta entradas mixtas de texto e imagen.
- Generación de código y matemáticas (la familia se evalúa en benchmarks de razonamiento, código y agentes, aunque las cifras no están disponibles en la información proporcionada).
- Soporte conversacional multi-turno, con contexto nativo de 262.144 tokens.
- Capacidades de agente y razonamiento encadenado, respaldadas por el entrenamiento con RL en entornos multiagente.
- Cobertura multilingüe amplia: 201 idiomas y dialectos según la documentación de la familia.
- Decodificación especulativa mediante *multi-token prediction* (MTP) entrenado en varios pasos.
- Compatibilidad con tool calling / function calling: no se detalla explícitamente en la información disponible; debe verificarse en la documentación oficial de Qwen3.5.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: informes financieros, contratos o expedientes de cientos de páginas que caben en la ventana de 262.144 tokens, incluyendo gráficos y tablas escaneadas, sin necesidad de chunking agresivo.
- Asistencia técnica sobre base de código completa: el contexto extendido permite cargar repositorios medianos y hacer preguntas sobre arquitectura, dependencias o errores, combinando con las capacidades de código del modelo.
- Digitalización y extracción de datos de formularios y facturas: al ser un modelo imagen-texto, puede recibir la imagen del documento y devolver campos estructurados, desplegado en local con llama.cpp para cumplir requisitos de residencia de datos.
- Agentes autónomos en local para pymes: al caber en una GPU de consumo en cuantización Q4, permite montar un agente con tool calling sobre APIs internas sin coste por token ni envío de datos a terceros.
- Atención al cliente multilingüe: la cobertura de 201 idiomas y el contexto largo permiten mantener historiales de conversación extensos y responder en el idioma del usuario con conocimiento del contexto previo.
- Fine-tuning específico de dominio: la model card de Unsloth documenta el ajuste fino local del modelo base, útil para especializar el comportamiento en sectores como seguros, legal o salud sobre una base Apache 2.0.
- Generación de documentación técnica a partir de capturas de pantalla de interfaces o diagramas, aprovechando la entrada multimodal.
- Procesamiento por lotes de imágenes en pipelines de moderación o catalogación, con throughput alto gracias a la atención lineal en la mayoría de capas.

## Benchmarks y rendimiento

La model card del modelo base incluye una sección de resultados de benchmarks de lenguaje que compara Qwen3.5-9B con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-4B, además de una figura de puntuaciones para modelos de tamaño pequeño. Sin embargo, los valores numéricos de esa tabla no están disponibles en la información proporcionada (el contenido aparece truncado), por lo que no se reproducen cifras.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (solo el modelo, sin caché): ~18 GB en FP16/BF16, ~9,5-10 GB en Q8, ~7-7,5 GB en Q6, ~6-6,5 GB en Q5, ~5,5-6 GB en Q4 y ~3,5-4,5 GB en Q3/Q2. Cálculos aproximados a partir de los 8,95 B de parámetros.
- Caché KV: solo las 8 capas de Gated Attention generan caché creciente; a título estimativo, en FP16 son unos 32 KB por token, es decir ~1 GB por cada 32.000 tokens. Las 24 capas de Gated DeltaNet mantienen un estado de tamaño constante. Para 262.144 tokens conviene presupuestar varios GB adicionales o usar cuantización de caché.
- GPU de consumo: sí cabe. Una RTX 4090 (24 GB) ejecuta Q8 con contexto moderado y Q4 con contexto muy largo; una RTX 4060 Ti de 16 GB o una RTX 4080 trabajan cómodamente en Q4/Q5; con 8 GB de VRAM se puede usar Q3/Q4 con contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 y L40S permiten FP16/BF16 con contexto largo y mayor concurrencia.
- Despliegue: los pesos originales son compatibles con vLLM, SGLang y KTransformers según la model card; los ficheros GGUF de este repositorio están pensados para llama.cpp y Ollama (formatos estándar de GGUF; no se cita explícitamente en la información disponible).
- Latencia y throughput: no disponibles. La arquitectura híbrida con atención lineal en la mayoría de capas y el MTP están orientados a reducir latencia y coste en contextos largos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (este repo, GGUF) | 8,95 B | 262.144 (ext. 1.010.000) | Apache 2.0 | GGUF en este repo y en unsloth | Multimodal, híbrido Gated DeltaNet + Gated Attention, MTP |
| Qwen3.5-4B | No disponible | No disponible | Apache 2.0 (según familia) | Pesos publicados por Qwen | Versión menor de la misma familia, incluida en la tabla de benchmarks del modelo base |
| GPT-OSS-20B | No disponible | No disponible | No disponible | No disponible | Referencia de comparación citada en la tabla de benchmarks de la model card |
| Qwen3-30BA3B-Thinking-2507 | No disponible | No disponible | No disponible | No disponible | Referencia de comparación citada en la tabla de benchmarks de la model card |

No se dispone en la información proporcionada de los datos de parámetros, contexto, licencia ni resultados comparativos de las alternativas, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Este repositorio es un duplicado declarado por el propio autor. Para producción conviene usar la fuente original (unsloth/Qwen3.5-9B-GGUF) o los pesos oficiales de Qwen, con el fin de garantizar integridad, actualizaciones y trazabilidad. El repositorio tiene 0 descargas y 1 like en el momento de la consulta.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en tareas de extracción de datos de imágenes (documentos, tablas) donde los errores de OCR interno pueden propagarse.
- La información disponible no detalla los idiomas concretos cubiertos; la cifra de 201 idiomas procede de la documentación de la familia y su rendimiento real por idioma no está verificado.
- No se documentan en la información disponible sesgos específicos, tasas de toxicidad ni evaluaciones de seguridad del modelo base.
- Discrepancia arquitectónica a verificar: las notas de la familia mencionan Mixture-of-Experts disperso, pero la ficha del modelo de 9B no detalla número de expertos ni parámetros activos. Conviene confirmar el régimen de activación antes de dimensionar hardware.
- Aunque la licencia es Apache 2.0, el uso comercial debe confirmar los términos del modelo base y de los pesos derivados; los benchmarks publicados no constituyen garantía de rendimiento en dominios concretos.
- El contexto de 1.010.000 tokens es una extensión declarada; el rendimiento efectivo más allá de los 262.144 tokens nativos no está cuantificado en la información disponible.
- Los ficheros GGUF cuantizados introducen pérdida de precisión respecto a los pesos originales; los niveles bajos (Q2/Q3) degradan especialmente tareas de razonamiento y de percepción visual fina.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fix-AI/Qwen3.5-9B-GGUF
- GGUF original de referencia: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de ejecución local de Qwen3.5 (Unsloth): https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 (Unsloth): https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Qwen Chat: https://chat.qwen.ai

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
