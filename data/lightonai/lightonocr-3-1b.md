# lightonai/LightOnOCR-3-1B

## Resumen

LightOnOCR-3-1B es un modelo de visión-lenguaje especializado en OCR y comprensión de documentos, desarrollado por LightOn (lighton.ai). Forma parte de la familia LightOnOCR-3, compuesta por tres variantes (0,8B, 1B y 4B), y su objetivo es sustituir pipelines complejos de document understanding por un único modelo end-to-end capaz de transcribir, localizar visualmente y describir el contenido de una página.

La variante de 1B conserva la arquitectura del anterior LightOnOCR-2-1B, de modo que funciona como actualización directa sin cambios en despliegues existentes, y añade nuevas capacidades: grounding con etiquetas y cajas delimitadoras, descripciones cortas de imágenes y extracción de datos numéricos de gráficos en forma de tabla HTML. El modelo cuenta con 1.005.647.872 parámetros (aproximadamente 1,0B) según los pesos en safetensors, lo que lo sitúa en el rango ligero y permite despliegues con requisitos de hardware modestos.

La relevancia actual del modelo reside en su enfoque de un solo paso para tareas que tradicionalmente requieren varios componentes (detección de layout, OCR, análisis de tablas, descripción de figuras). Está publicado bajo licencia Apache 2.0, admite uso comercial e investigación, y se integra con la librería Transformers mediante las clases `LightOnOcr` disponibles desde la versión 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en Mistral 3 (tag `mistral3`); mantiene la arquitectura de LightOnOCR-2-1B |
| Parametros totales | 1.005.647.872 (aproximadamente 1,0B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se listan cuantizaciones en la informacion disponible; pesos en safetensors (tamano de repo 2,0 GB) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

LightOnOCR-3-1B es un modelo de visión-lenguaje (pipeline `image-text-to-text`) que sigue la arquitectura del LightOnOCR-2-1B previo, etiquetada como `mistral3` en HuggingFace. Las otras dos variantes de la familia (0,8B y 4B) adoptan la arquitectura visión-lenguaje de Qwen3.5, pero la variante de 1B se mantiene deliberadamente sobre el diseño anterior para facilitar la migración desde despliegues de LightOnOCR-2 sin cambios de integración.

Según la información disponible, la generación LightOnOCR-3 mejora la velocidad y la calidad de transcripción respecto a la generación anterior e introduce capacidades de comprensión visual: el modelo emite coordenadas de cajas delimitadoras con etiquetas por tipo de bloque, descripciones breves de imágenes y datos numéricos de figuras y gráficos convertidos a tablas HTML. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se carga con las clases `LightOnOcr` de Transformers.

## Capacidades

- Transcripción de página completa: invocado con prompt vacío (`""`), devuelve todo el texto de la página en formato Markdown.
- Modo grounding: con el prompt `grounding`, cada bloque de contenido se prefija con una etiqueta de tipo y una caja delimitadora en coordenadas normalizadas 0-1000.
- Etiquetado semántico de bloques: `text`, `title`, `list`, `header`, `footer`, `page_number`, `footnote`, `caption`, `formula`, `code`, `table`, `image`, `chart`, `header_image`, `footer_image`, `aside_text`, y el sufijo `+` para marcar bloques de continuación.
- Descripción de imágenes: los bloques de imagen se emparejan con una caja delimitadora y una descripción corta.
- Extracción de datos de gráficos: los bloques `chart` se convierten en una tabla HTML con los puntos de datos de la figura.
- Manejo de documentos diversos: tablas, recibos, formularios, gráficos, maquetación multicolumna, escritura manuscrita y notación matemática.
- Pipeline de imagen a texto conversacional (tag `conversational`).
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización masiva de documentos: el modelo transcribe páginas completas a Markdown en una sola pasada, lo que permite procesar lotes de PDF escaneados sin encadenar un detector de layout y un motor OCR independientes.
- Extracción estructurada de facturas y recibos: con el prompt `grounding`, campos como totales, fechas o direcciones se devuelven con su caja delimitadora, lo que facilita el mapeo a un esquema de base de datos y la verificación visual posterior.
- Conversión de gráficos a datos tabulares: los bloques `chart` se transforman en tablas HTML, lo que permite alimentar informes financieros o científicos directamente en hojas de cálculo o bases de datos sin transcripción manual.
- Indexación y RAG sobre documentos: las descripciones de imágenes y las etiquetas de bloque generan metadatos que mejoran la recuperación en pipelines de búsqueda semántica y question-answering sobre corpus documentales.
- Procesamiento de formularios: la capacidad de manejar formularios y maquetación multicolumna permite extraer pares clave-valor en documentos administrativos, seguros o sanitarios.
- Accesibilidad de material escaneado: la descripción de imágenes y la transcripción de notación matemática y código facilitan generar versiones accesibles de libros técnicos y artículos.
- Automatización de back office: al ser un modelo de 1B parámetros con licencia Apache 2.0, puede desplegarse en infraestructura propia para digitalizar documentación interna con coste reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado en la model card es relativo al coste de salida del modo grounding: aproximadamente un 25 % más de tokens que la transcripción simple (1.433 frente a 1.158 tokens por página de media) y ese dato corresponde a la variante de 4B, no a la de 1B.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1.005.647.872 parametros): alrededor de 2 GB en fp16/bf16, aproximadamente 1 GB en int8 y en torno a 0,5-0,7 GB en cuantizacion de 4 bits, sin contar la memoria adicional para tokens de imagen y cache de atención.
- El tamano del repositorio es de 2,0 GB, coherente con pesos en precision de 16 bits.
- Cabe en GPUs de consumo: tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) pueden ejecutar el modelo incluso en fp16, y con 4-6 GB en cuantizacion de 4 bits.
- Tambien es viable en CPU para cargas por lotes con throughput reducido.
- Opciones de despliegue confirmadas: Transformers (v5 o superior) con las clases `LightOnOcr`, instalando `transformers`, `pillow` y `pypdfium2`. No se confirman en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-1B | ~1,0B | Mistral 3 (base LightOnOCR-2) | no disponible | Apache 2.0 | Actualizacion directa de LightOnOCR-2-1B |
| LightOnOCR-3-4B | no disponible | Qwen3.5 vision-language | no disponible | Apache 2.0 | Mejor calidad segun el autor; recomendado para la mayoria de tareas |
| LightOnOCR-3-0.8B | no disponible | Qwen3.5 vision-language | no disponible | Apache 2.0 | Variante rapida y eficiente |
| LightOnOCR-2-1B | no disponible | Arquitectura LightOnOCR-2 | no disponible | no disponible | Generacion anterior, misma arquitectura que la variante 1B |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El modelo solo esta entrenado para dos modos de invocacion: prompt vacio (`""`) para transcripcion y prompt `grounding` para transcripcion con localizacion. Cualquier otra instruccion queda fuera de distribucion y puede producir resultados incorrectos.
- No se detallan los idiomas soportados, por lo que no puede garantizarse cobertura multilingue mas alla de lo que el autor documente.
- No se especifica la longitud de contexto, lo que impide asegurar el tratamiento de documentos muy extensos en una sola llamada.
- El modo grounding incrementa el numero de tokens de salida (aproximadamente un 25 % sobre transcripcion simple segun datos de la variante 4B), lo que eleva el coste de inferencia.
- Riesgo de alucinacion inherente a los modelos de vision-lenguaje, especialmente en regiones de baja calidad de escaneo, escritura manuscrita o graficos complejos; la salida en tablas HTML y coordenadas debe validarse en flujos criticos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial y de investigacion sin restricciones adicionales documentadas.
- Al ser un modelo de 1B parametros, es esperable una menor precision que la variante de 4B en tareas de document understanding complejas; el propio autor recomienda el 4B para la mayoria de tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Paper: https://arxiv.org/pdf/2601.14251
- Paper adicional (tag del modelo): https://arxiv.org/abs/2412.13663
- Blog: https://huggingface.co/blog/lightonai/lightonocr-3
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-3-Demo
- GitHub: https://github.com/lightonai/LightOnOCR
- Variante LightOnOCR-3-4B: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante LightOnOCR-3-0.8B: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Generacion anterior LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Sitio web de LightOn: https://lighton.ai
- LinkedIn: https://www.linkedin.com/company/lighton/
- X: https://x.com/LightOnIO
