# hif1000/Qwen3.8-27B-SQ2-GGUF

## Resumen

Qwen3.8-27B-SQ2-GGUF es una cuantización de tipo SQ2, generada con la herramienta Shifter, del modelo denso Qwen3.8-27B de Alibaba Qwen. El repositorio lo publica el usuario hif1000 y distribuye un único fichero GGUF (`Qwen3.8-27B-SQ2.gguf`) pensado para ejecutarse con el runtime Shifter sobre Linux con CUDA. El modelo base es un transformer causal con codificador de visión, orientado a generación de texto, razonamiento, código y tareas agénticas de largo horizonte.

La relevancia de esta ficha no está en el modelo subyacente, que es un Qwen3.8-27B, sino en el formato de cuantización: SQ2 aplica la técnica descrita en el artículo *Shifter Quantization: Compact Representations for Native Integer Computation* (arXiv:2611.33080), que busca representaciones enteras compactas para cómputo nativo. Esto permite reducir el peso del checkpoint (11,1 GB de repositorio) frente a los pesos originales en precisión completa, a costa de depender de un runtime específico en lugar de las herramientas estándar de GGUF.

Conviene señalar una discrepancia importante: la model card reproduce la ficha de Qwen3.8-27B, que declara 27B de parámetros, mientras que los metadatos de safetensors del repositorio indican 10.658.625.834 parámetros. Esa cifra corresponde al recuento del fichero cuantizado y no al modelo denso original, por lo que debe interpretarse con cautela. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; capas híbridas Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27B según la model card del modelo base; los metadatos de safetensors del repo cuantizado indican 10.658.625.834 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | SQ2 (Shifter Quantization, representación entera compacta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-SQ2.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión. La dimensión oculta es 5120, con 64 capas organizadas en un patrón de 16 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia de 17.408 y el embedding de tokens (con padding) es de 248.320. El modelo se entrenó con Multi-Token Prediction en varios pasos.

El entrenamiento del modelo base comprende fases de preentrenamiento y postentrenamiento, según la model card upstream. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron RLHF o DPO. La innovación específica de este repositorio es la cuantización SQ2 de Shifter, que sustituye los esquemas habituales de GGUF por una representación entera compacta orientada a cómputo nativo, descrita en el artículo arXiv:2611.33080.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Control flexible del razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Capacidades de código y trabajo profesional, con mejoras declaradas en tareas de programación y flujos de trabajo.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card upstream.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica y diagramas: el codificador de visión permite procesar capturas de esquemas, tablas y PDFs renderizados, y el contexto de 262.144 tokens admite introducir documentos extensos junto con las preguntas.
- Procesamiento de vídeo de larga duración: la model card declara soporte de vídeos de hasta una hora, útil para resumen automático de reuniones, sesiones de formación o material audiovisual de archivo.
- Agentes autónomos de desarrollo: el modelo puede integrarse en harnesses de programación que requieran planificación multi-paso y uso de herramientas, con control del esfuerzo de razonamiento por petición.
- Asistencia en investigación: con contexto extensible a 1M de tokens, encaja en tareas de revisión de literatura, extracción de datos de artículos y síntesis de corpus largos.
- Automatización de flujos profesionales con visión: extracción de datos de facturas, formularios e informes escaneados combinando OCR implícito en el codificador visual y generación estructurada.
- Despliegue en entornos con restricciones de memoria: la cuantización SQ2 reduce el peso del checkpoint a un repositorio de 11,1 GB, lo que facilita su ejecución en GPUs de gama alta de consumo frente a los pesos completos.
- Evaluación de técnicas de cuantización: útil para investigadores que quieran comparar SQ2 de Shifter con otros esquemas GGUF sobre el mismo modelo base.

## Benchmarks y rendimiento

La model card reproduce tablas de evaluación del modelo base Qwen3.8-27B, pero en la información proporcionada las tablas aparecen truncadas y sin valores numéricos legibles. No se han podido extraer resultados concretos de MMLU, HumanEval, GSM8K ni de otras pruebas. Tampoco se han publicado resultados específicos de la versión SQ2.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11,1 GB, por lo que la inferencia requiere al menos ese espacio para los pesos, más memoria para el contexto KV y el codificador de visión. Con contexto de 262.144 tokens, el consumo de KV puede ser elevado y no se detalla en la información disponible.
- GPU recomendadas: no disponible. La model card solo indica que el runtime Shifter requiere Linux con soporte CUDA.
- GPU de consumo: el tamaño del fichero (11,1 GB) sugiere que podría caber en GPUs con 16 GB o más de VRAM, pero no se confirma en la información proporcionada.
- Opciones de despliegue: Shifter (runtime específico, instalación desde el repositorio `yufenghuang/shifter` con `shifter serve -m hif1000/Qwen3.8-27B-SQ2-GGUF`). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI para este fichero cuantizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-SQ2-GGUF (este) | 27B (base); 10,6B según safetensors del repo | 262.144 nativo, hasta 1M | Sí | Apache 2.0 | GGUF (SQ2) |
| Qwen3.8-27B (original) | 27B | 262.144 nativo, hasta 1M | Sí | Apache 2.0 | Safetensors |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27B | 262.144 | Sí | Apache 2.0 | GGUF (Q4, Q5, Q8, etc.) |

La comparación con alternativas de la misma categoría (modelos densos de ~27B con visión) no está disponible en la información proporcionada. La diferencia principal frente al checkpoint original y frente a cuantizaciones GGUF convencionales es el esquema SQ2 y la dependencia del runtime Shifter.

## Limitaciones y advertencias

- Dependencia de un runtime no estándar: el modelo solo se documenta para Shifter sobre Linux con CUDA; no hay indicios de compatibilidad con llama.cpp, Ollama o vLLM para este fichero.
- Discrepancia en el recuento de parámetros: la model card declara 27B, pero los metadatos de safetensors indican 10.658.625.834; conviene verificar el comportamiento real antes de usarlo en producción.
- Sin descargas ni validación comunitaria: el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia pública de su funcionamiento.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas para esta cuantización.
- Sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; la model card upstream no detalla la cobertura lingüística.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la atribución y el cumplimiento de las condiciones del modelo base.
- La cuantización SQ2 puede degradar la calidad frente a los pesos originales; no se han publicado evaluaciones comparativas que cuantifiquen esa pérdida.
- El contexto de 1M de tokens es una extensión declarada para el modelo base; no se confirma que se mantenga con esta cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hif1000/Qwen3.8-27B-SQ2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo de Shifter Quantization: https://arxiv.org/abs/2611.33080
- Repositorio de Shifter: https://github.com/yufenghuang/shifter
- Model card upstream (revisión referenciada): https://huggingface.co/Qwen/Qwen3.8-27B/blob/37561816e66b5b9153b1b64c10968c18c1e6f4a0/README.md
- Servicio Qwen Cloud: https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
