# prithivMLmods/chandra-ocr-2-GGUF

## Resumen

Chandra-ocr-2-GGUF es la distribución cuantizada en formato GGUF del modelo Chandra-OCR-2 de Datalab, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y reconstrucción de estructura documental. El autor de la conversión es prithivMLmods, que publica 14 variantes de cuantización (desde Q2_K hasta BF16) junto con tres ficheros de proyección multimodal (mmproj) necesarios para el procesado de imágenes en llama.cpp. El modelo base cuenta con 4.841.450.496 parámetros (aproximadamente 4,84 mil millones) según los pesos en safetensors del repositorio original.

El problema que resuelve es la conversión de documentos del mundo real —escaneos históricos, estados financieros, artículos de investigación, formularios multilingües con casillas— en datos estructurados (Markdown, HTML o JSON) preservando la información de maquetación: tablas con celdas combinadas, ecuaciones matemáticas, elementos de formulario y escritura manuscrita. Frente a la primera versión de Chandra, la model card reporta una mejora del 12 % en la puntuación multilingüe y avances notables en el parseo de expresiones matemáticas y en la reconstrucción de tablas complejas.

Su relevancia actual radica en que permite desplegar un OCR de gama alta en hardware de consumo mediante llama.cpp, sin depender de APIs alojadas. La etiqueta `qwen3_5` del repositorio sitúa la arquitectura en la familia Qwen 3.5, adaptada aquí como modelo image-text-to-text con un proyector multimodal independiente. La licencia es OpenRAIL y los metadatos de HuggingFace declaran únicamente inglés, aunque la model card del modelo base afirma soporte para más de 90 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio; proyector multimodal separado en fichero `mmproj`. Detalle interno de capas y atención: no disponible |
| Parámetros totales | 4.841.450.496 (aproximadamente 4,84 mil millones), medidos sobre los safetensors del modelo base |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible de forma oficial. El ejemplo de inferencia de la model card emplea `-c 16384` (16 384 tokens) y `-n 8192` |
| Tipos de cuantización | BF16, F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores mmproj en bf16, f16 y q8_0 |
| Idiomas soportados | Metadatos de HuggingFace: `en` (inglés). La model card del modelo base declara más de 90 idiomas |
| Licencia | OpenRAIL (`openrail`), con enlace a la licencia del modelo base |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que ubica el modelo en la familia Qwen 3.5 de Alibaba. Se trata de un modelo multimodal de tipo image-text-to-text: un codificador visual procesa la imagen del documento y un proyector multimodal (distribuido aparte como `mmproj-bf16.gguf`, `mmproj-f16.gguf` o `mmproj-q8_0.gguf`) alinea las representaciones visuales con el espacio del modelo de lenguaje, que genera la salida estructurada. En llama.cpp es obligatorio cargar el fichero `mmproj` junto con los pesos principales para habilitar la entrada de imágenes. El número de capas, la dimensión oculta, el mecanismo de atención y el vocabulario no están publicados en la información proporcionada.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La model card sí menciona que la versión 2 incorpora mejoras específicas frente a Chandra 1 en parseo de ecuaciones matemáticas, reconstrucción de tablas complejas con celdas combinadas, reconocimiento de escritura manual, detección de elementos de formulario (casillas de verificación) y maquetaciones de documento ancho, además de mejoras en el captioning de imágenes y la extracción de diagramas. También se indica explícitamente que el modelo no emplea decodificación especulativa MTP (multi-token prediction).

## Capacidades

- OCR de imágenes y PDF con salida en tres formatos estructurados: Markdown, HTML y JSON.
- Preservación de la maquetación: orden de lectura, bloques, columnas y documentos de formato ancho.
- Reconstrucción de tablas complejas, incluidas tablas con celdas combinadas (merged cells).
- Parseo de ecuaciones y fórmulas matemáticas presentes en el documento.
- Reconocimiento de escritura manual (handwriting).
- Detección de elementos de formulario, como casillas de verificación.
- Generación de descripciones de imágenes (captioning) y extracción de diagramas.
- Procesamiento multilingüe: la model card del modelo base declara más de 90 idiomas, con una puntuación multilingüe de 77,8.
- Conversación multi-turno e inferencia por línea de comandos mediante `llama-cli` con el flag `--image`.
- Soporte de plantilla conversacional (`-st`) y caché de clave/valor cuantizada (`--cache-type-k q8_0`) en el ejemplo oficial.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de archivos históricos y escaneos de baja calidad: el modelo está descrito específicamente para "historical scans" y reconoce escritura manual, por lo que puede convertir fondos documentales en texto Markdown indexable para motores de búsqueda internos o pipelines RAG.
- Extracción de datos de estados financieros y filings regulatorios: la capacidad de reconstruir tablas con celdas combinadas permite transformar balances y cuentas de resultados en JSON estructurado, listo para ingesta en bases de datos o hojas de cálculo sin post-proceso manual de la maquetación.
- Procesamiento de artículos científicos y documentación técnica: el parseo de ecuaciones matemáticas habilita la conversión de papers a Markdown con fórmulas preservadas, útil para construir corpus de entrenamiento o bases de conocimiento científico.
- Automatización de formularios administrativos: la detección de casillas de verificación y elementos de formulario permite extraer respuestas de encuestas, solicitudes o cuestionarios escaneados y volcarlas a sistemas de gestión documental.
- Ingesta documental para pipelines de IA generativa: al emitir Markdown limpio y estructurado, el modelo actúa como etapa previa de un sistema RAG, alimentando un chunker y un índice vectorial con contenido que conserva la jerarquía de secciones.
- Extracción de diagramas y figuras: la mejora en captioning y extracción de diagramas permite generar descripciones textuales de gráficos y esquemas en informes técnicos, haciendo accesible ese contenido a búsquedas textuales.
- Despliegue en local con requisitos de privacidad: al ejecutarse con llama.cpp sobre GGUF cuantizado, se puede procesar documentación sensible (contratos, expedientes) en infraestructura propia sin enviar imágenes a APIs externas.
- Procesamiento por lotes en CPU o GPU de gama media: las variantes Q3 y Q4 permiten montar un servicio de OCR sobre hardware modesto, con el fichero `mmproj-q8_0.gguf` (367 MB) para reducir el coste del codificador visual.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden al modelo base Chandra-OCR-2 y aparecen en la model card:

| Benchmark | Resultado | Nota |
|---|---|---|
| olmocr | 85,9 % | Puntuación SOTA según la model card |
| Puntuación multilingüe | 77,8 | +12 % respecto a Chandra 1 |

No se han publicado resultados de benchmarks en la información disponible para las versiones cuantizadas GGUF (MMLU, HumanEval, GSM8K u otros). Tampoco se proporcionan métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamaño de fichero más el proyector multimodal (mmproj-bf16 de 676 MB):
  - Q2_K: aproximadamente 2,8 GB en total (2,12 GB + 0,68 GB).
  - Q4_K_M (recomendada por el autor): aproximadamente 3,7 GB en total (3,07 GB + 0,68 GB).
  - Q5_K_M: aproximadamente 4,2 GB en total (3,51 GB + 0,68 GB).
  - Q6_K: aproximadamente 4,7 GB en total (3,99 GB + 0,68 GB).
  - Q8_0: aproximadamente 5,8 GB en total (5,16 GB + 0,68 GB).
  - BF16 / F16: aproximadamente 10,4 GB en total (9,7 GB + 0,68 GB).
- Con `mmproj-q8_0.gguf` (367 MB) se recorta alrededor de 0,3 GB respecto a las cifras anteriores.
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 8-16 GB, RTX 4070/4080 y RTX 4090 en cualquier cuantización, incluida BF16. Las variantes Q4 y Q5 caben en tarjetas de 6-8 GB (GTX 1660 Super, RTX 3050, RTX 4060). Las variantes Q2_K y Q3 pueden ejecutarse en CPU con 4-6 GB de RAM.
- GPU de datacenter (A100, H100, L40S) solo resultan necesarias para servir muchas peticiones concurrentes o para trabajar en BF16 con lotes grandes; para una sola petición el modelo es sobredimensionado para esas tarjetas.
- Opciones de despliegue: llama.cpp mediante `llama-cli` (ejemplo oficial con `-ngl 99`, `--image`, `-st`, `--cache-type-k q8_0`, `-c 16384`, `-n 8192`, `--seed 42`), servidor `llama-server` de llama.cpp para exponer una API compatible con OpenAI, Ollama y otros frontends basados en GGUF. Para el modelo base en safetensors, la model card cita HuggingFace Transformers y vLLM.
- Latencia y throughput: no disponible. El rendimiento dependerá del número de capas descargadas a GPU (`-ngl`), de la cuantización elegida y de si se cuantiza la caché KV, parámetros que el ejemplo oficial ajusta pero para los que no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| chandra-ocr-2-GGUF (esta ficha) | 4,84 B | No disponible (ejemplo con 16 384) | No disponible para GGUF; base: 85,9 % olmocr, 77,8 multilingüe | OpenRAIL | GGUF, 14 cuantizaciones + 3 mmproj |
| datalab-to/chandra-ocr-2 (modelo base) | 4,84 B | No disponible | 85,9 % olmocr, 77,8 multilingüe | OpenRAIL | Safetensors, Transformers / vLLM |
| Chandra 1 | No disponible | No disponible | 12 puntos menos en la métrica multilingüe que la versión 2 | No disponible | No disponible |
| Otros modelos OCR de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de arquitectura, contexto o benchmarks de alternativas comparables (por ejemplo, otros OCR multimodales de tamaño similar), por lo que la comparación cuantitativa se limita a las dos variantes de Chandra documentadas. Tampoco se publican cifras de rendimiento específicas para las versiones cuantizadas, que en la práctica pueden degradarse respecto a BF16, especialmente en las variantes Q2 y Q3.

## Limitaciones y advertencias

- Discrepancia idiomática relevante: los metadatos de HuggingFace declaran únicamente `en`, mientras que la model card del modelo base afirma soporte para más de 90 idiomas. En producción conviene validar empíricamente el idioma objetivo antes de asumir cobertura multilingüe.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de reconocimiento; en OCR, los errores en tablas y ecuaciones son especialmente sensibles a la pérdida de precisión. El autor recomienda Q4_K_M, Q5_K_M, Q5_K_S y Q6_K.
- Riesgo de alucinación inherente a los modelos generativos: el modelo puede inventar contenido en regiones ilegibles, degradadas o con ruido, o completar filas de tabla ausentes. No debe tratarse la salida como transcripción verificada sin controles posteriores en dominios críticos.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de filtrado, por lo que no es posible evaluar sesgos demográficos o culturales en la transcripción.
- El contexto máximo real no está documentado; el valor de 16 384 del ejemplo es una elección de configuración, no una especificación oficial. Documentos muy extensos requerirán paginación o troceado.
- La licencia OpenRAIL incluye cláusulas de uso restringido; es necesario revisar el texto completo de la licencia del modelo base antes de un uso comercial, especialmente por las restricciones de uso que este tipo de licencia impone a terceros.
- Requiere cargar obligatoriamente un fichero `mmproj` adicional; olvidarlo deshabilita por completo la entrada de imágenes y produce errores silenciosos en la salida.
- El repositorio ocupa 59,9 GB por acumulación de todas las cuantizaciones; conviene descargar únicamente los ficheros necesarios.
- No se indica soporte de tool calling, function calling ni comportamiento agéntico, por lo que no debe asumirse en automatizaciones que dependan de estas capacidades.
- No hay cifras publicadas de latencia ni de throughput; el dimensionado de un servicio en producción deberá hacerse con pruebas propias.
- Aviso sobre la búsqueda web: los resultados devueltos para esta consulta no contenían información técnica ni enlaces relacionados con el modelo (eran resultados de contenido para adultos sin relación alguna). No se han utilizado como fuente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/chandra-ocr-2-GGUF
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia del modelo base: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- llama.cpp (repositorio oficial citado en la model card): https://github.com/ggml-org/llama.cpp
- Imagen de ejemplo usada en las instrucciones de inferencia: https://cdn-uploads.huggingface.co/production/uploads/65bb837dbfb878f46c77de4c/EF8cldKHhUEO3MZPZSD19.jpeg
- Papers, blogs, demos o repositorios adicionales: no disponibles en la información proporcionada. La model card menciona la existencia de un playground gratuito y una API alojada de Datalab, pero no se incluyen sus URL.
