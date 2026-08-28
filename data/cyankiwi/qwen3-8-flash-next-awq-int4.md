# cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4

## Resumen

El modelo `cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4` es una cuantización AWQ en precisión INT4 del modelo base `Qwen/Qwen3.8-Flash-Next`, desarrollado por el usuario de HuggingFace `cyankiwi`. Este modelo base es una vista previa experimental de la arquitectura que dará lugar a Qwen4, publicada por el equipo de Qwen (Alibaba). Se trata de un modelo causal multimodal (imagen y texto) con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Qwen Sparse Attention (QSA), junto con un mecanismo de embedding por n-gramas. El modelo principal tiene 125 000 millones de parámetros, de los cuales solo 6 000 millones se activan por token, lo que lo convierte en un modelo de tipo MoE (Mixture of Experts) muy eficiente en inferencia.

La cuantización AWQ INT4 reduce significativamente el tamaño del modelo, pasando de los pesos originales a un formato más compacto, lo que facilita su despliegue en entornos con memoria limitada. El repositorio ocupa 188,3 GB, lo que sugiere que incluye los pesos cuantizados en formato `safetensors`. La licencia es `qwen-community-1.0`, una licencia comunitaria de Qwen que permite uso comercial con ciertas restricciones. Este modelo es relevante para desarrolladores que necesitan ejecutar un LLM multimodal de gran escala con requisitos de VRAM moderados gracias a su arquitectura MoE y su cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE + N-gram Embedding |
| Parametros totales | 125B (modelo principal) + 51B (n-gram embedding) + 4B (MTP) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | no disponible (la versión oficial Qwen3.8-Flash soporta 1M, pero no se especifica para este modelo base) |
| Tipos de cuantizacion | AWQ INT4 |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES (según model card) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de `Qwen3.8-Flash-Next` supone un rediseño profundo de los componentes de un LLM moderno. En lugar de atención densa tradicional, utiliza una combinación de Gated DeltaNet (una variante de atención lineal con estado recurrente) y Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El modelo sigue un layout de 48 capas organizadas en 12 bloques, cada uno con 3 capas de Gated DeltaNet seguidas de MoE y 1 capa de QSA seguida de MoE. El embedding se realiza mediante n-gramas (bigramas y trigramas) en la capa 2, con un vocabulario de 20 millones de n-gramas, lo que permite escalar parámetros sin aumentar el coste computacional por token. Además, incorpora un mecanismo de Gated Residual que modula el flujo de información con puertas de lectura y escritura dependientes de los datos.

El entrenamiento se realizó en dos fases: pre-training y post-training. La receta de entrenamiento utiliza los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el calentamiento del batch size, comenzando directamente con el tamaño objetivo. Esto reduce el número de pasos de optimización y permite tasas de aprendizaje mayores. No se proporcionan detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: al ser un LLM causal de 125B con 6B activos, es capaz de tareas de lenguaje natural complejas, aunque no se especifican benchmarks concretos.
- Comprensión multimodal: integra un codificador de visión, por lo que puede procesar imágenes junto con texto (pipeline `image-text-to-text`).
- Procesamiento de contexto largo: gracias a la atención híbrida (DeltaNet + QSA), está diseñado para manejar secuencias largas de manera eficiente, aunque la longitud exacta no se indica.
- Capacidades multilingües: soporta al menos 10 idiomas, incluyendo inglés, chino, hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información proporcionada, pero es probable que el modelo base lo incluya dado su enfoque en cargas de trabajo agénticas. No confirmado.
- Eficiencia en inferencia: la combinación de MoE (6B activos) y cuantización INT4 permite ejecutar el modelo con requisitos de memoria reducidos en comparación con un modelo denso de 125B.

## Casos de uso

- Procesamiento de documentos extensos: el modelo puede analizar manuales, informes o contratos de cientos de páginas gracias a su atención eficiente para contextos largos, aunque la longitud máxima no se especifica.
- Asistentes multimodales: al aceptar imágenes y texto, puede utilizarse en aplicaciones de descripción de imágenes, extracción de información visual o chatbots que combinan ambos formatos.
- Generación de código en producción: aunque no se confirma soporte de tool calling, su tamaño y capacidad de razonamiento lo hacen adecuado para tareas de programación asistida, especialmente si se integra en pipelines de CI/CD.
- Razonamiento agéntico multi-paso: la arquitectura está orientada a cargas de trabajo agénticas, por lo que puede usarse como motor de planificación y ejecución de tareas complejas en sistemas autónomos.
- Traducción y procesamiento multilingüe: con soporte para 10 idiomas, puede emplearse en servicios de traducción automática, localización de contenido o atención al cliente en varios idiomas.
- Investigación en arquitecturas de LLM: al ser una vista previa de Qwen4, es útil para estudiar el rendimiento de la atención híbrida y los embeddings por n-gramas en tareas reales.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización INT4 y a los 6B parámetros activos, puede ejecutarse en GPUs de consumo medio (p. ej., RTX 4090 con 24 GB) si se utiliza la cuantización adecuada, aunque el tamaño total del repo sugiere que se necesita más memoria para cargar todos los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y la cuantización AWQ INT4 podría afectar ligeramente al rendimiento en comparación con el modelo original, pero no hay datos cuantitativos al respecto.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado que el modelo tiene 125B parámetros totales (más 51B de n-gramas), incluso en INT4 el peso ocuparía aproximadamente 70-80 GB (125B × 4 bytes / 8 ≈ 62,5 GB, más overhead). Con 6B activos, la memoria para activaciones es menor, pero se necesitan al menos 80 GB de VRAM para cargar todos los pesos.
- GPU recomendadas: para inferencia con todos los pesos en memoria, se necesitarían GPUs de alta gama como A100 (80 GB), H100 (80 GB) o varias RTX 4090 (24 GB cada una) en paralelo. No es viable en una sola GPU de consumo estándar.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. También se menciona compatibilidad con `compressed-tensors`.
- Latencia y throughput: no disponibles. La arquitectura MoE con 6B activos debería ofrecer un throughput superior a un modelo denso de 125B, pero sin datos concretos no se puede cuantificar.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo base `Qwen3.8-Flash-Next` es una arquitectura experimental sin precedentes públicos en benchmarks. Como referencia, se podría comparar con otros modelos MoE multimodales como `Qwen2.5-VL-72B` (denso) o `Mixtral 8x22B`, pero no hay datos de rendimiento de esta cuantización específica. Se recomienda consultar la documentación oficial de Qwen para más detalles.

## Limitaciones y advertencias

- Alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Sesgos: no se han publicado estudios de sesgos para este modelo; es probable que herede los sesgos de los datos de entrenamiento de Qwen.
- Limitaciones de idioma: aunque soporta 10 idiomas, el rendimiento puede variar significativamente entre ellos; los idiomas con menos representación podrían tener peor calidad.
- Licencia: la licencia `qwen-community-1.0` permite uso comercial, pero con restricciones específicas (por ejemplo, no usar para servicios que compitan con Qwen). Es necesario revisar los términos completos en el archivo LICENSE del repositorio.
- Cuantización: la cuantización AWQ INT4 puede degradar ligeramente la precisión en tareas sensibles a la exactitud numérica, como matemáticas o razonamiento lógico.
- Tamaño del modelo: a pesar de la cuantización, el repositorio ocupa 188 GB, lo que requiere una infraestructura de almacenamiento y memoria considerable.
- Modelo experimental: al ser una vista previa de Qwen4, puede contener comportamientos inesperados o no estar optimizado para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
