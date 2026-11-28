# pandanlabs/dots-mocr-arabic-classical

## Resumen

Pandan Arabic OCR v0.1 es un modelo vision-lenguaje especializado en la transcripción fiel de libros árabes clásicos, desarrollado por Pandan Labs como un fine-tune del modelo base dots.mocr de dots-studio. Su propósito es preservar las marcas vocálicas (harakat o tashkeel) tal como aparecen impresas en la página, evitando tanto la omisión de marcas existentes como la adición de marcas que el texto original no contiene. Se distribuye como research preview y está pensado para digitalización de patrimonio bibliográfico árabe.

El modelo cuenta con aproximadamente 3.039 millones de parámetros (3,04 B) en formato safetensors, con un repositorio de 6,1 GB, y se publica bajo licencia MIT. Está etiquetado para la tarea image-text-to-text y soporta únicamente el idioma árabe, con especial énfasis en árabe clásico con vocalización completa. La evaluación del autor se documenta en el preprint *Beyond Character Error Rate* depositado en Zenodo.

Su relevancia actual radica en que aborda un problema poco cubierto por los OCR convencionales: la fidelidad diacrítica en textos religiosos y clásicos, donde un cambio de vocal puede alterar el significado. Los resultados publicados muestran mejoras sustanciales frente al modelo base en impresión tipográfica vocalizada, aunque el propio autor advierte que el rendimiento en escaneos antiguos de baja resolución es todavía variable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text) basada en dots.mocr; detalles internos no disponibles |
| Parámetros totales | 3.039.179.264 (3,04 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Árabe (ar), con foco en árabe clásico vocalizado |
| Licencia | MIT |
| Formato de pesos | Safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint dots.mocr (revisión `e539fbb` del modelo base de dots-studio), orientado a la comprensión de documentos mediante entrada de imagen y salida de texto. La información disponible no detalla la arquitectura interna del backbone (tipo de encoder visual, configuración del transformer de lenguaje, mecanismo de atención), por lo que estos aspectos deben considerarse no disponibles. El entrenamiento se realizó mediante LoRA (run identificado como `lora-001`), lo que sugiere una adaptación eficiente de parámetros sobre el modelo base.

La separación entre entrenamiento y evaluación se hizo por libro, garantizando que ningún libro de test o validación participara en el entrenamiento. La evaluación principal se realizó sobre 160 páginas de libros con referencias verificadas por una persona (*Kashf ash-Shubuhat* y *Sharh Ma'na at-Taghut* como test; *Thalathat al-Usul* y *Nawaqid al-Islam* como validación), con test estadístico de bootstrap emparejado por páginas e intervalos de confianza al 95 %. El modelo incorpora una capa opcional de versos coránicos que sustituye las citas del Corán reconocidas por el texto canónico, y un mecanismo de reintento en bucle (*loop retry*) durante el servicio. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Transcripción OCR de imágenes de páginas de libros árabes clásicos, con preservación de harakat (tashkeel).
- Fidelidad diacrítica: entrenado para no añadir marcas vocálicas que la página no imprime y para no omitir las impresas.
- Comprensión de documentos (document-understanding) con salida de texto conversacional.
- Manejo de impresión tipográfica vocalizada, escaneos a unos 300 dpi (vocalizados, parcialmente vocalizados y sin vocalizar) y escaneos antiguos de baja resolución, con distinto grado de fiabilidad.
- Capa opcional de versos coránicos para normalizar citas del Corán al texto canónico.
- Reintento en bucle (*loop retry*) para mejorar la tasa de error de letras en servicio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de libros clásicos impresos y vocalizados: el modelo transcribe páginas tipográficas con una tasa de error de letras del 4,0 % en las 267 páginas evaluadas y un 67 % de páginas con precisión global del 99 % o superior, lo que lo hace adecuado para proyectos de patrimonio bibliográfico que requieran conservar la vocalización original.
- Preservación de textos religiosos con harakat: al reducir las marcas añadidas de 14,5 a 2,0 por cada 1.000 letras en impresión tipográfica vocalizada, resulta apropiado para corpus donde la vocalización incorrecta altera el significado, como manuales de credo o comentarios clásicos.
- Normalización de citas coránicas: la capa opcional de versos sustituye las citas reconocidas por el texto canónico, útil en pipelines de edición digital que necesiten unificar referencias coránicas con una tasa de coincidencia de versos del 0,97.
- Procesamiento de escaneos a 300 dpi parcialmente vocalizados: con referencias provisionales, el modelo reduce las marcas añadidas de 62,8 a 13,5 por 1.000 letras, lo que permite abordar digitalizaciones de calidad media aceptando revisión humana posterior.
- Investigación en evaluación OCR diacrítica: el preprint *Beyond Character Error Rate* y las métricas desglosadas (letras, vocales, marcas añadidas y omitidas) sirven como base metodológica para comparar sistemas OCR en árabe clásico.
- Lectura asistida de escaneos antiguos de baja resolución con revisión humana: aunque la vocalización empeora, la tasa de error de letras baja de 0,114 a 0,070, por lo que puede emplearse como primera pasada en proyectos de recuperación de textos antiguos con verificación manual obligatoria.
- Integración en flujos de conversión imagen-texto conversacional: al estar etiquetado como image-text-to-text y conversational, puede integrarse en interfaces que reciban una imagen de página y devuelvan la transcripción en un turno de conversación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (v0.1 frente al modelo base dots.mocr, revisión `e539fbb`, mismas páginas y ajustes):

| Métrica | Base | v0.1 | Notas |
|---|---|---|---|
| Tasa de error de vocales, impresión tipográfica vocalizada | 0,030 | 0,006 | 116 páginas, referencias verificadas; IC 95 % del cambio −0,028 a −0,020 |
| Marcas vocálicas añadidas por 1.000 letras, impresión tipográfica vocalizada | 14,5 | 2,0 | Referencias verificadas |
| Marcas vocálicas omitidas por 1.000 letras, impresión tipográfica vocalizada | 4,0 | 1,7 | Referencias verificadas |
| Tasa de coincidencia de versos | 0,92 | 0,97 | — |
| Tasa de error de letras, 267 páginas evaluadas | 0,061 | 0,040 | Con loop retry |
| Tasa de error de letras, escaneos antiguos de baja resolución | 0,114 | 0,070 | Con loop retry |
| Tasa de error de vocales, escaneos antiguos de baja resolución (*Sharh Ma'na at-Taghut*) | 0,386 | 0,476 | IC 95 % +0,045 a +0,138; límite +0,05; aprobado por poco |

Distribución de precisión por tipo de impresión (v0.1):

| Tipo de impresión | Referencias | Páginas | ≥99 % | 95–99 % | 80–95 % | <80 % | Fallos de lectura |
|---|---|---|---|---|---|---|---|
| Impresión tipográfica | verificadas | 116 | 78 (67 %) | 33 (28 %) | 5 (4 %) | 0 (0 %) | 0 |
| Escaneo ~300 dpi | provisionales | 59 | 3 (5 %) | 36 (61 %) | 12 (20 %) | 7 (12 %) | 1 |
| Escaneo antiguo baja resolución | verificadas | 44 | 1 (2 %) | 6 (14 %) | 31 (70 %) | 5 (11 %) | 1 |
| Escaneo antiguo baja resolución | provisionales | 48 | 2 (4 %) | 16 (33 %) | 24 (50 %) | 4 (8 %) | 2 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,04 B parámetros y pesos en safetensors (repositorio de 6,1 GB), una estimación orientativa en FP16 rondaría los 6-7 GB de pesos, más el overhead del encoder visual y del runtime; en cuantizaciones de 8 o 4 bits podría reducirse, pero el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de parámetros podría ser viable en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible; el modelo requiere `custom_code` y está etiquetado como image-text-to-text.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| pandanlabs/dots-mocr-arabic-classical (v0.1) | 3,04 B | No disponible | Árabe | MIT | Fine-tune LoRA de dots.mocr; foco en vocalización clásica |
| dots-studio/dots.mocr | No disponible | No disponible | No disponible | No disponible | Modelo base del fine-tune; referencia de comparación en la evaluación del autor |
| Otros OCR especializados en árabe clásico | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Versión research preview: los pesos se publican para prueba y retroalimentación, no como producto estable de producción.
- Rendimiento variable en escaneos: el modelo funciona bien en impresión tipográfica vocalizada, pero en escaneos a 300 dpi los resultados son preliminares y en escaneos antiguos de baja resolución la vocalización empeora respecto al base (0,386 → 0,476 en *Sharh Ma'na at-Taghut*), con aprobación ajustada del criterio de release.
- En escaneos a 300 dpi sin vocalizar, v0.1 añade más marcas que el modelo base (3,8 → 8,1 por 1.000 letras), pese a reducir la tasa global de error de vocales.
- Riesgo de alucinación diacrítica: el modelo puede añadir harakat que la página no imprime u omitir las impresas; el autor cuantifica estos errores y recomienda revisión en contextos críticos.
- Idioma único: solo árabe; no se documenta soporte multilingüe.
- Sesgos conocidos: no documentados explícitamente en la información disponible.
- Licencia MIT: permite uso comercial, pero al ser un research preview conviene validar el rendimiento en el dominio concreto antes de desplegarlo.
- Requiere `custom_code` para cargar el modelo, lo que puede complicar la integración con runtimes estándar.
- Las cifras de escaneos a 300 dpi se basan en referencias provisionales (transcripción automática sin verificar), por lo que son preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pandanlabs/dots-mocr-arabic-classical
- Modelo base dots.mocr: https://huggingface.co/dots-studio/dots.mocr
- Preprint *Beyond Character Error Rate* (Zenodo): https://doi.org/10.5281/zenodo.23683237
