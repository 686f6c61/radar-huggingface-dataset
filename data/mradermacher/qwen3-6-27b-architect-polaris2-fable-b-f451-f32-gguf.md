# mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF

## Resumen

El modelo Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF es una cuantización en formato GGUF del modelo base `nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32`, realizada por mradermacher. El modelo base es un merge experimental (técnica nuslerp con mergekit) de dos variantes de Qwen3.6-27B, con destilación de Claude 4.6, ajuste fino supervisado (SFT) y LoRA, orientado a tareas de razonamiento, programación, escritura creativa y roleplaying. Incluye además un proyector multimodal (mmproj) que permite entrada de imágenes.

Con 27.320 millones de parámetros, arquitectura qwen3_5_text (64 capas, hidden size 5120, atención por grupos de consultas con 24 cabezas de consulta y 4 de clave/valor) y una ventana de contexto que los tags sugieren de hasta 1M tokens (aunque no confirmada oficialmente), este modelo se posiciona como una opción potente para desarrolladores que buscan un LLM versátil con capacidades multimodales y de razonamiento extendido. La cuantización GGUF facilita su despliegue en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles.

La relevancia actual radica en su combinación de tamaño medio (27B) con características avanzadas como contexto largo, soporte multimodal y un enfoque en creatividad y razonamiento, lo que lo hace atractivo para prototipos y aplicaciones de producción en los que se necesite un equilibrio entre calidad y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer decoder, GQA, 64 capas, hidden size 5120, FFN 17408) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no confirmada oficialmente; tags indican 256k y 1M (probablemente 256k nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge de dos variantes de Qwen3.6-27B realizado con mergekit (técnica nuslerp), lo que combina los pesos de ambos modelos sin entrenamiento adicional. Según los tags, se empleó destilación de Claude 4.6, ajuste fino supervisado (SFT) y LoRA, lo que sugiere un refinamiento orientado a tareas específicas como razonamiento, programación y escritura creativa. La arquitectura es un transformer decoder estándar con atención por grupos de consultas (GQA) y 64 capas, con un tamaño de capa oculta de 5120 y una FFN de 17408. El modelo incluye un proyector multimodal (mmproj) que permite procesar imágenes junto con texto, aunque no se especifica el tipo de encoder visual utilizado.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el proceso exacto de destilación. La cuantización GGUF fue realizada por mradermacher mediante conversión estática, sin entrenamiento adicional.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, chino, japonés y español.
- Razonamiento y cadena de pensamiento (chain-of-thought) para problemas complejos de lógica, matemáticas y STEM.
- Generación de código y soporte para tareas de programación (según tags de "coding").
- Escritura creativa: ficción, ciencia ficción, generación de tramas, subtramas, escenas y narración vívida.
- Roleplaying y diálogos interactivos con personajes.
- Capacidades multimodales: entrada de imágenes mediante el proyector mmproj (el modelo puede procesar texto e imágenes, aunque no se detalla el alcance).
- Multilingüismo: soporte para al menos cuatro idiomas principales.
- Posible soporte de tool calling y agentes (no confirmado explícitamente, pero común en la familia Qwen3.6).

## Casos de uso

- Asistente de programación en producción: el modelo puede generar, revisar y explicar código en varios lenguajes, integrándose en pipelines de CI/CD o entornos de desarrollo mediante APIs compatibles con GGUF (llama.cpp, Ollama).
- Análisis de documentos largos: gracias a su posible contexto de 256k o 1M tokens, puede resumir, extraer información y responder preguntas sobre contratos, informes o libros completos.
- Generación de contenido creativo: escritura de novelas, guiones, cuentos y material de marketing con tramas coherentes y estilo vívido, útil para estudios de contenido o plataformas de ficción.
- Chatbots de atención al cliente multilingüe: con soporte para en, zh, ja y es, puede gestionar conversaciones en varios idiomas con contexto amplio.
- Asistente de investigación: razonamiento y síntesis de información técnica o científica, ayudando a revisar literatura y formular hipótesis.
- Prototipado de agentes conversacionales: su capacidad de razonamiento y posible tool calling permite construir agentes que ejecutan tareas multi-paso, como consultas a bases de datos o APIs.
- Análisis de imágenes con texto: al incluir mmproj, puede describir o razonar sobre imágenes combinadas con instrucciones textuales, útil para accesibilidad o documentación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (~16,9 GB) cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A5000). Con Q8_0 (~29,1 GB) se necesita al menos 32 GB (A100 40GB, RTX A6000) o más.
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4-Q5; A100 40GB o H100 para Q8_0 o mayor precisión.
- En consumer GPU: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y para el modelo base (safetensors) vLLM, TGI o Transformers.
- Latencia y throughput: no disponible; dependerá del hardware y la cuantización. En una RTX 4090 con Q4_K_M se puede esperar una generación de 20-40 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (por ejemplo, Qwen3-27B, Llama-3.1-27B o Mistral-27B) en la información proporcionada. No se puede realizar una comparación fiable sin benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental: al ser un merge con destilación, puede presentar comportamientos impredecibles o inconsistencias en tareas no cubiertas por el ajuste.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos multilingües y creativos, puede reflejar sesgos culturales o de género.
- Contexto no confirmado: aunque los tags indican 256k/1M, no hay documentación oficial que verifique la longitud real de contexto soportada; se recomienda probar con secuencias largas.
- Soporte multimodal limitado: el mmproj permite entrada de imágenes, pero no se especifica la calidad ni el alcance (p. ej., si soporta video o múltiples imágenes).
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales si se deriva de otros modelos con licencias distintas (no se ha confirmado).
- Para producción, se recomienda validar el modelo en tareas específicas y considerar el uso de cuantizaciones superiores (Q6_K o Q8_0) para reducir pérdida de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32
- Variante con cuantizaciones iMatrix: https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-i1-GGUF
- Receta NVFP4 para DGX Spark: https://github.com/PassingByPixels/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-NVFP4_Dflash_DGX_recipe
- Visor de arquitectura: https://hfviewer.com/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess
