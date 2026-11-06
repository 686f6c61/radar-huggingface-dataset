# fkrf22/surya-ocr-2-mlx-8bit

## Resumen

fkrf22/surya-ocr-2-mlx-8bit es una conversión al formato MLX, con cuantización de 8 bits, del modelo datalab-to/surya-ocr-2. Se trata de un modelo de imagen a texto orientado a OCR, extracción de documentos PDF y análisis de layout, empaquetado para su ejecución eficiente en hardware Apple Silicon mediante la librería mlx-vlm (versión 0.7.12). El autor de la conversión es el usuario fkrf22 y el modelo se distribuye bajo licencia OpenRAIL.

El modelo cuenta con 665.701.440 parámetros totales (aproximadamente 666 millones) según los pesos en safetensors, y el repositorio ocupa 0,8 GB. La arquitectura declarada en los metadatos es qwen3_5, un transformer multimodal de tipo imagen-texto a texto, con pipeline image-text-to-text. Al ser una conversión de un modelo base de terceros, las capacidades funcionales heredan las del original surya-ocr-2, pero esta ficha solo puede documentar con rigor aquello que figura en los metadatos y la model card disponibles.

La relevancia de esta variante radica en su formato: permite ejecutar localmente una tarea de OCR y comprensión de documentos en equipos Mac con chip de Apple, sin depender de GPUs NVIDIA ni de servicios en la nube. No obstante, el repositorio no incluye información sobre idiomas soportados, benchmarks ni detalles de entrenamiento, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal imagen-texto a texto) |
| Parametros totales | 665.701.440 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | openrail (AI Pubs OpenRAIL-M, según derivados del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura etiquetada como qwen3_5, dentro de la familia de transformers multimodales de tipo imagen-texto a texto. El pipeline declarado es image-text-to-text, lo que confirma que acepta imágenes como entrada y genera texto como salida, encajando con tareas de OCR y conversión de documentos a Markdown. Los metadatos de la conversión citan mlx-vlm 0.7.12 como herramienta de transformación desde el modelo original datalab-to/surya-ocr-2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Todo lo relativo al proceso de entrenamiento del modelo base queda fuera de la información proporcionada y debe consultarse en la model card original de datalab-to/surya-ocr-2.

## Capacidades

- Generación de texto a partir de imágenes, orientada a OCR y extracción de contenido de documentos.
- Conversión de PDF e imágenes a Markdown, según los tags del repositorio (ocr, pdf, markdown).
- Análisis de layout documental, indicado por el tag layout.
- Interfaz conversacional de imagen a texto (pipeline image-text-to-text, tag conversational).
- Ejecución en Apple Silicon mediante MLX y mlx-vlm.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): solo se confirma entrada de imagen; no se documentan otras modalidades.

## Casos de uso

- Digitalización de documentos escaneados en equipos Mac: el modelo recibe la imagen de una página y genera texto plano o Markdown, aprovechando su naturaleza de OCR para sustituir flujos de OCR tradicionales en local.
- Conversión de PDF a Markdown para bases de conocimiento: los tags pdf y markdown sugieren su uso para transformar documentos en texto estructurado listo para ingestión en sistemas RAG.
- Extracción de contenido en pipelines de investigación documental: al ejecutarse con mlx-vlm en Apple Silicon, permite procesar lotes de documentos sin enviar datos a servicios externos, lo que resulta adecuado para material sensible.
- Análisis de layout de páginas: el tag layout indica capacidad para interpretar la estructura de la página (bloques, secciones), útil en la reconstrucción de documentos con formato.
- Prototipado rápido en portátiles Mac: con 0,8 GB de repositorio y cuantización de 8 bits, es viable probar flujos de OCR en un MacBook sin infraestructura dedicada.
- Automatización de tareas de transcripción visual en entornos de desarrollo: mediante el comando de mlx_vlm.generate documentado en la model card, se puede integrar en scripts de procesamiento por lotes.
- Evaluación comparativa de modelos OCR: sirve como variante ligera para comparar calidad de extracción frente al modelo original en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,8 GB en cuantización de 8 bits, por lo que la huella de pesos ronda esa cifra y el consumo total dependerá del runtime MLX y del procesamiento de imágenes.
- GPU recomendadas: hardware Apple Silicon (chips M-series), dado que el formato es MLX y la librería es mlx-vlm; no se documenta soporte para A100, H100 ni RTX 4090 en esta variante.
- ¿Cabe en GPU de consumo? Está pensado para equipos Apple con memoria unificada; el tamaño reducido de pesos (menos de 1 GB) sugiere que cabe en configuraciones de memoria modesta, aunque no se especifica un mínimo.
- Opciones de despliegue: mlx-vlm (documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fkrf22/surya-ocr-2-mlx-8bit | 665.701.440 | no disponible | safetensors MLX 8-bit | openrail | Conversión MLX para Apple Silicon |
| datalab-to/surya-ocr-2 (base) | no disponible en esta busqueda | no disponible | no disponible | openrail | Modelo original del que deriva |
| Reza2kn/surya-ocr-2-mlx-8bit-g64 | no disponible | no disponible | MLX 8-bit (grupo 64) | no disponible | Otra conversión MLX del mismo base |
| aglaia-models/surya-ocr-2-mlx | no disponible | no disponible | MLX | OpenRAIL-M | Otra conversión MLX del mismo base |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni del proceso de entrenamiento en la información disponible.
- Riesgo de alucinación: no cuantificado; en tareas de OCR, los modelos generativos pueden producir texto plausible que no aparece en la imagen, por lo que conviene validar la salida en producción.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar cobertura multilingüe.
- Licencia: openrail, con referencia a la AI Pubs OpenRAIL-M License (Modified) según los derivados del modelo base; las restricciones de uso basadas en casos de uso se heredan y deben revisarse antes de un uso comercial.
- Al ser una conversión de terceros (no oficial de datalab-to), la fidelidad respecto al modelo original no está verificada en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación comunitaria.
- La cuantización de 8 bits puede introducir degradación en la precisión de extracción frente al modelo en precisión completa; no se aportan métricas comparativas.
- Solo se documenta despliegue con mlx-vlm; no hay garantías de compatibilidad con otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/fkrf22/surya-ocr-2-mlx-8bit
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2
- Conversión MLX alternativa (Reza2kn): https://huggingface.co/Reza2kn/surya-ocr-2-mlx-8bit-g64
- Conversión MLX alternativa (aglaia-models): https://huggingface.co/aglaia-models/surya-ocr-2-mlx
- README de aglaia-models: https://huggingface.co/aglaia-models/surya-ocr-2-mlx/blob/main/README.md
