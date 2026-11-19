# cgus/LightOnOCR-3-4B-exl3

## Resumen

LightOnOCR-3-4B-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo LightOnOCR-3-4B desarrollado por LightOn AI, un modelo de visión-lenguaje especializado en OCR y comprensión de documentos. Esta versión concreta ha sido generada por el usuario cgus con ExLlamaV3 1.6.6 y publicada bajo licencia Apache 2.0. El modelo original forma parte de la familia LightOnOCR-3, que incluye variantes de 0.8B, 1B y 4B; esta última es la más grande y precisa de la familia y la recomendada por el autor para la mayoría de tareas de OCR.

El modelo resuelve el problema de la transcripción y comprensión end-to-end de documentos: en lugar de encadenar múltiples herramientas (detector de layout, OCR, parser de tablas, extractor de gráficos), un único modelo procesa la imagen de la página y devuelve texto en markdown, coordenadas de bounding boxes con etiquetas semánticas, descripciones de imágenes y tablas HTML con los datos de gráficos. Adopta la arquitectura vision-lenguaje de Qwen3.5, lo que facilita la integración con herramientas existentes y aporta mejoras de velocidad respecto a la generación anterior.

La relevancia actual del modelo radica en su enfoque end-to-end para document understanding, que simplifica el despliegue y mantenimiento frente a pipelines complejos, y en su licencia Apache 2.0, que permite uso comercial y de investigación sin restricciones. Esta cuantización EXL3 de 4 bits está pensada para inferencia eficiente en GPUs de consumo, con soporte para contexto completo incluso en tarjetas de 16 GB según las notas del autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal) |
| Parametros totales | 2.185.401.856 (~2,19 mil millones, según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 4 bpw (principal), 5 bpw, 6 bpw y 8 bpw, todas con h8 v16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, requiere ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura vision-lenguaje de Qwen3.5, que combina un codificador visual con un modelo de lenguaje para procesar imágenes de documentos y generar texto estructurado. La familia LightOnOCR-3 introduce respecto a la generación anterior capacidades de grounding visual: el modelo emite bounding boxes normalizadas en coordenadas de página 0–1000 junto con etiquetas semánticas para cada bloque de contenido (text, title, list, header, footer, page_number, footnote, caption, formula, code, table, image, chart). Los modelos de 0.8B y 4B adoptan esta arquitectura Qwen3.5, mientras que el de 1B mantiene la arquitectura de LightOnOCR-2-1B.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del modelo original menciona que la familia LightOnOCR-3 trae mejoras significativas en velocidad y calidad de transcripción respecto a la generación previa, y que el enfoque end-to-end sustituye a los pipelines tradicionales de comprensión de documentos. Esta variante concreta (exl3) es una cuantización de 4 bits realizada con ExLlamaV3 1.6.6; el autor indica que la diferencia de tamaño entre las opciones de visión v16 y v8 era de solo 150 MB, por lo que optó por v16 en todas las variantes.

## Capacidades

- Transcripción OCR completa de páginas a markdown mediante prompt vacío (modo transcripción), compatible con el comportamiento de LightOnOCR-2 sin cambios en la integración.
- Grounding visual: con el prompt `grounding`, cada bloque de contenido se devuelve con una etiqueta semántica y su bounding box en coordenadas normalizadas 0–1000.
- Comprensión de layout: distingue y etiqueta títulos, párrafos, listas, cabeceras, pies de página, números de página, notas al pie, leyendas, fórmulas, código, tablas, imágenes y gráficos.
- Descripción de imágenes: los bloques de tipo image incluyen una descripción corta del contenido visual.
- Extracción de datos de gráficos: los bloques de tipo chart se convierten en una tabla HTML con los puntos de datos.
- Manejo de tablas, recibos, formularios, gráficos, layouts multicolumna y notación matemática.
- Generación de texto estructurado en markdown y HTML.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible (solo visión documental confirmada).

## Casos de uso

- Digitalización masiva de archivos: el modelo procesa cada página y devuelve el texto completo en markdown en una sola pasada, lo que permite sustituir cadenas de OCR tradicionales por un único modelo y reducir el mantenimiento de pipelines.
- Extracción estructurada de facturas y recibos: con el prompt `grounding`, cada campo del recibo se devuelve con su etiqueta y coordenadas, lo que facilita mapear importes, fechas y conceptos a un esquema de datos sin post-procesado geométrico complejo.
- Procesamiento de formularios: la detección de bloques `text`, `title` y `table` con bounding boxes permite localizar y extraer campos rellenados y etiquetas en formularios escaneados para su volcado a sistemas de gestión.
- Conversión de gráficos a datos: los bloques `chart` se transforman en tablas HTML con los puntos de datos, lo que permite alimentar dashboards o bases de datos a partir de informes en PDF con gráficos de barras o líneas.
- Accesibilidad documental: las descripciones cortas de imágenes generadas en modo grounding permiten enriquecer documentos con texto alternativo para lectores de pantalla y pipelines de recuperación.
- Indexación y RAG sobre documentos: la salida markdown con estructura semántica (títulos, listas, tablas) y las descripciones de imágenes facilitan la fragmentación y el embedding de contenido para sistemas de pregunta-respuesta sobre corpus documentales.
- Procesamiento de artículos científicos: la detección de bloques `formula`, `table` y `caption` permite extraer ecuaciones, tablas de resultados y leyendas de figuras de papers en PDF para su reutilización en revisiones sistemáticas.
- Despliegue en GPU de consumo: gracias a la cuantización EXL3 de 4 bpw y al soporte de contexto completo en 16 GB según el autor, es viable ejecutar OCR de documentos en estaciones de trabajo con RTX 4060 Ti o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numérica en la información proporcionada; el autor indica que la cuantización de 8 bpw h8 v16 cabe en una RTX 4060 Ti de 16 GB con contexto completo y sin caché cuantizada, por lo que las variantes de 4, 5 y 6 bpw deberían ocupar menos.
- GPU recomendadas: no especificadas en la información; por el tamaño del modelo (~2,19 mil millones de parámetros) y el formato EXL3, se orienta a GPUs de consumo con suficiente VRAM (el autor cita RTX 4060 Ti 16 GB como referencia de ajuste para la variante de 8 bpw).
- ¿Cabe en GPU de consumo? Sí, según las notas del autor; la variante de 8 bpw cabe en 16 GB y las de menor bpw requieren menos memoria.
- Opciones de despliegue: ExLlamaV3 (formato EXL3, versión 1.6.6 usada para la cuantización); compatible con endpoints según los tags de Hugging Face; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-exl3 (esta ficha) | ~2,19 mil millones | no disponible | Qwen3.5 vision-lenguaje, cuantizado EXL3 4 bpw | Apache 2.0 | Cuantización comunitaria de 4 bits para ExLlamaV3 |
| LightOnOCR-3-4B (original) | no disponible en la información | no disponible | Qwen3.5 vision-lenguaje | Apache 2.0 | Modelo base sin cuantizar, recomendado por LightOn para la mayoría de tareas OCR |
| LightOnOCR-3-1B | no disponible | no disponible | Arquitectura LightOnOCR-2 | Apache 2.0 | Actualización directa para despliegues existentes de LightOnOCR-2 |
| LightOnOCR-3-0.8B | no disponible | no disponible | Qwen3.5 vision-lenguaje | Apache 2.0 | Variante rápida y eficiente de la familia |

## Limitaciones y advertencias

- Esta ficha corresponde a una cuantización comunitaria (cgus) y no al modelo oficial de LightOn AI; la calidad puede diferir de la del modelo original sin cuantizar.
- El formato EXL3 requiere ExLlamaV3 para su carga; no es compatible directamente con llama.cpp, Ollama u otros runners que no soporten EXL3.
- La cuantización a 4 bits puede introducir degradaciones en tareas sensibles a precisión, como notación matemática, tablas densas o texto de bajo contraste.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluación de robustez en la información proporcionada.
- No se dispone de información sobre idiomas soportados; la cobertura multilingüe no está confirmada.
- La longitud de contexto no está especificada, lo que impide planificar el procesamiento de páginas de gran resolución o documentos de varias páginas en una sola llamada.
- Licencia Apache 2.0: permite uso comercial y de investigación, pero conviene verificar las condiciones del modelo base original y de la cuantización por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación de la cuantización.
- Al ser un modelo especializado en OCR y comprensión documental, no está pensado para generación de texto general, razonamiento libre ni conversación abierta.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/cgus/LightOnOCR-3-4B-exl3
- Variante 5 bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/5bpwh8v16
- Variante 6 bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/6bpwh8v16
- Variante 8 bpw: https://huggingface.co/cgus/LightOnOCR-3-4B/tree/8bpwh8v16
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Modelo LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Paper: https://arxiv.org/pdf/2601.14251
- Paper adicional referenciado en tags: https://arxiv.org/abs/2412.13663
- Blog: https://huggingface.co/blog/lightonai/lightonocr-3
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-3-Demo
- GitHub: https://github.com/lightonai/LightOnOCR
- Web de LightOn: https://lighton.ai
