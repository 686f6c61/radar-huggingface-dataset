# masahiroid/mdeberta-v3-base-mlx

## Resumen

mdeberta-v3-base-mlx es una conversión del encoder multilingüe `microsoft/mdeBERTa-v3-base` al formato nativo de MLX, el framework de Apple para ejecutar modelos en silicio de Apple (M1/M2/M3/M4). El modelo original lo desarrolló Microsoft y emplea la arquitectura DeBERTa-v3 con atención desenredada y un mecanismo de embeddings de posición relativa; esta versión la publica el usuario masahiroid como checkpoint de conversión, sin fine-tuning ni cabeza de tarea añadida.

Se trata de un encoder base que devuelve estados ocultos a nivel de token, no un modelo generativo. Para obtener resultados útiles en clasificación, NER, similitud semántica o extracción de embeddings hay que añadir una cabeza y hacer fine-tuning downstream. Su interés actual es que permite ejecutar un encoder multilingüe de referencia (250 000 tokens de vocabulario, 12 capas, 768 dimensiones ocultas) de forma nativa en Macs con Apple Silicon, sin depender de PyTorch.

El repositorio es una conversión F32 (no una cuantización de 4 bits) con validación numérica documentada frente a la implementación original de PyTorch: diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 en seis casos deterministas. La licencia es MIT tanto en los pesos como en el código de conversión y runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder con atención desenredada y embeddings de posición relativa) |
| Parámetros totales | 278.218.752 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "hasta el límite del modelo fuente"; el export de Core ML usa 128 tokens) |
| Tipos de cuantización | F32 (checkpoint de conversión, no cuantizado) |
| Idiomas soportados | multilingüe (no se detalla la lista de idiomas) |
| Licencia | MIT (pesos y código de conversión/runtime) |
| Formato de pesos | safetensors (runtime MLX propietario); también existen exportaciones coreml, coreai y gguf en repos separados |

## Arquitectura y entrenamiento

El modelo fuente es mdeBERTa-v3-base, un encoder transformer de 12 capas con tamaño oculto de 768. Según el catálogo de Microsoft Foundry, tiene 86 M de parámetros de backbone y un vocabulario de 250 000 tokens que aporta unos 190 M de parámetros en la capa de embeddings, lo que cuadra con los 278 M totales del checkpoint. DeBERTa-v3 introduce atención desenredada (contenido y posición calculados por separado) y sustituye el enmascaramiento de tokens por enmascaramiento de spans con un generador reemplazado (RTD, replaced token detection), una innovación heredada de ELECTRA.

Esta versión concreta no ha sido reentrenada ni fine-tuneada: es una conversión del checkpoint `microsoft/mdeberta-v3-base` en la revisión `a0484667b22365f84929a935b5e50a51f71f159d`. La conversión preserva los nombres de tensor del modelo de inferencia original y se ejecuta sobre un runtime MLX propio incluido en el repo (`runtime_mlx.py`), que no es compatible con mlx-lm para generación de texto. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF/DPO), más allá de que el modelo base es multilingüe.

## Capacidades

- Codificación de texto multilingüe: genera representaciones densas a nivel de token y de secuencia.
- Extracción de embeddings para búsqueda semántica, similitud y clustering.
- Base para fine-tuning en clasificación de texto, análisis de sentimiento, NER, QA extractiva y tareas de pares de frases.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de PyTorch en inferencia.
- No incluye cabeza de tarea: no clasifica ni responde preguntas por sí solo.
- No es un modelo generativo: no produce texto.
- Soporte de tool calling / function calling: no disponible (no aplica a un encoder).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Búsqueda semántica en aplicaciones macOS: usar los embeddings del encoder para indexar documentos y consultas en local, aprovechando la ejecución nativa MLX sin enviar datos a la nube.
- Clasificación de tickets de soporte: añadir una cabeza lineal sobre el estado `[CLS]` y hacer fine-tuning con datos propios para categorizar incidencias multilingües.
- Análisis de sentimiento en reseñas: fine-tuning ligero sobre el encoder para clasificar polaridad; la validación del autor incluye un caso de prueba con texto emocional en inglés.
- Extracción de entidades (NER): fine-tuning con etiquetas BIO para detectar nombres, organizaciones y fechas en textos multilingües.
- Deduplicación y clustering de documentos: calcular similitud coseno entre embeddings de párrafos para agrupar contenido similar en pipelines de datos.
- Reranking en pipelines RAG: usar el encoder como cross-encoder ligero para reordenar candidatos recuperados antes de pasarlos a un LLM generativo.
- Prototipado en Mac: validar rápido arquitecturas downstream en un portátil con Apple Silicon antes de escalar a GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, GLUE, XNLI, etc.) en la información disponible. La única métrica documentada es la paridad numérica de la conversión frente a PyTorch: diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 sobre seis casos deterministas (emociones en inglés, texto neutro de recuperación, japonés, entrada vacía y truncamiento, más pruebas de series temporales de Chronos). El autor advierte que son comprobaciones de paridad de conversión, no benchmarks de calidad de tarea ni de latencia.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo pesa 1,1 GB en F32; en memoria unificada de Apple Silicon se necesita aproximadamente esa cifra más el overhead del runtime y del tokenizador.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El runtime MLX requiere un Mac con Apple Silicon; no se documenta soporte para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no aplica a GPUs NVIDIA/AMD por la dependencia de MLX.
- Opciones de despliegue: runtime MLX propio incluido en el repo (`runtime_mlx.py`), más exportaciones alternativas en Core ML, Core AI y GGUF publicadas en repos separados. No es compatible con mlx-lm, vLLM ni TGI.
- Latencia y throughput: no disponibles. Los exports de Core ML/Core AI usan batch 1 y longitud de secuencia fija de 128, lo que limita el rendimiento a esa forma.
- Dependencias: `huggingface_hub`, `mlx`, `numpy`, `transformers`, `sentencepiece`. Entorno probado: PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, chronos-forecasting 2.3.2, GGUF 0.19.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| masahiroid/mdeberta-v3-base-mlx | 278 M | no disponible | multilingüe | MIT | safetensors + MLX |
| microsoft/mdeberta-v3-base | 278 M | no disponible | multilingüe | MIT | PyTorch (safetensors/bin) |
| microsoft/deberta-v3-base | ~184 M (aprox., no confirmado en la información) | no disponible | principalmente inglés | MIT | PyTorch |
| xlm-roberta-base | ~278 M (aprox., no confirmado en la información) | no disponible | 100 idiomas | MIT | PyTorch |

La comparación se limita a datos verificables en la información disponible; no hay benchmarks de calidad que permitan situar este checkpoint frente a las alternativas. La diferencia práctica es el runtime: esta versión solo se ejecuta en MLX (Apple Silicon) o en los exports Core ML/Core AI/GGUF, mientras que el modelo original de Microsoft corre en PyTorch estándar.

## Limitaciones y advertencias

- No es un modelo de generación de texto: no responde preguntas ni produce lenguaje; devuelve estados ocultos.
- No incluye cabeza de tarea; requiere fine-tuning downstream para cualquier aplicación práctica.
- Solo se ejecuta con el runtime MLX incluido; no es compatible con mlx-lm ni con los servidores de inferencia habituales (vLLM, TGI).
- Requiere hardware Apple Silicon; sin soporte documentado para CUDA.
- Los exports de Core ML/Core AI usan formas fijas (batch 1, secuencia 128), lo que limita entradas largas en esas variantes.
- La validación numérica se hizo sobre seis casos y no constituye una evaluación de calidad de tarea.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un encoder, el riesgo de alucinación se traslada a la cabeza o sistema que lo use.
- Licencia MIT: permite uso comercial, pero el autor aclara que no se implica certificación de seguridad ni licencia comercial adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad verificables.
- La lista de idiomas soportados no está documentada en la model card.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/masahiroid/mdeberta-v3-base-mlx
- Hugging Face (Core ML): https://huggingface.co/masahiroid/mdeberta-v3-base-coreml
- Hugging Face (Core AI): https://huggingface.co/masahiroid/mdeberta-v3-base-coreai
- Hugging Face (GGUF): https://huggingface.co/masahiroid/mdeberta-v3-base-gguf
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Revisión fuente: https://huggingface.co/microsoft/mdeberta-v3-base/tree/a0484667b22365f84929a935b5e50a51f71f159d
- Catálogo Microsoft Foundry: https://ai.azure.com/catalog/models/microsoft-mdeberta-v3-base
