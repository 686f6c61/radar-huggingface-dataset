# mradermacher/LibreDeepSeekOCR1-GGUF

## Resumen

LibreDeepSeekOCR1-GGUF es la versión cuantizada en formato GGUF del modelo LibreDeepSeekOCR1, un modelo de visión-lenguaje (VLM) especializado en reconocimiento óptico de caracteres (OCR) desarrollado por LibreYOLO. Esta variante la publica mradermacher, un conocido autor de cuantizaciones GGUF en HuggingFace, y está pensada para facilitar el despliegue del modelo en entornos con recursos limitados o en herramientas como llama.cpp y Ollama. El modelo base deriva de la familia DeepSeek-OCR y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas.

Con aproximadamente 2.934 millones de parámetros (2,9 B), el modelo se posiciona en el rango de los modelos compactos de visión-lenguaje, lo que lo hace viable en GPUs de consumo. Su tarea principal es la conversión de imágenes de documentos a texto estructurado, incluyendo OCR de texto impreso y posiblemente manuscrito, con salida en formato conversacional (image-text-to-text). La disponibilidad de cuantizaciones desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto poco difundido. No obstante, para desarrolladores que necesiten integrar OCR local sin depender de APIs externas, esta variante GGUF ofrece una alternativa práctica y de código abierto con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje, image-text-to-text) |
| Parametros totales | 2.934.734.080 (aprox. 2,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivo mmproj separado para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LibreDeepSeekOCR1 en la documentación proporcionada. Por el nombre y las etiquetas (deepseek-ocr, vlm, image-text-to-text), se trata de un modelo de visión-lenguaje derivado de la línea DeepSeek-OCR, que combina un codificador visual con un modelo de lenguaje para generar texto a partir de imágenes. El repositorio incluye un archivo mmproj (multi-modal projector) separado, lo que confirma la presencia de un componente de proyección visual que se carga junto con los pesos del modelo de lenguaje en el ecosistema GGUF.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con convert_type hf y cuantización estática de tensores de salida (output_tensor_quantised: 1), sin cuantizaciones ponderadas por imatrix disponibles según la model card.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con salida de texto.
- Procesamiento image-text-to-text: acepta imágenes y genera respuestas textuales en formato conversacional.
- Especialización en extracción de texto de imágenes, etiquetado explícitamente como modelo OCR y VLM.
- Soporte de conversación multi-turno (etiqueta conversational), aunque orientado a tareas de OCR.
- Capacidad multimodal limitada a entrada de imagen y salida de texto (no se indica soporte de audio u otras modalidades).
- Idioma principal: inglés (etiqueta language: en); no se documentan capacidades multilingües adicionales.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- No se documenta modo thinking ni capacidades especiales de razonamiento extendido.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede procesar imágenes de páginas escaneadas y extraer el texto para su indexación o almacenamiento, aprovechando su especialización OCR y su tamaño compacto para ejecutarse en local.
- Extracción de datos de facturas y recibos: integrado en un pipeline de procesamiento por lotes, permite convertir imágenes de documentos financieros en texto estructurado para su posterior parseo con reglas o modelos de extracción.
- Automatización de archivo documental: en entornos con grandes volúmenes de PDFs e imágenes, la versión Q4_K_M (2,1 GB) permite desplegar OCR masivo en GPUs de consumo sin coste por API.
- Procesamiento de formularios y documentos administrativos: el modelo puede transcribir campos y texto libre de formularios escaneados, facilitando la digitalización de trámites en entornos con requisitos de privacidad que impiden enviar documentos a servicios en la nube.
- OCR en aplicaciones de escritorio o herramientas ofimáticas: gracias al formato GGUF, puede integrarse en aplicaciones locales mediante llama.cpp, ofreciendo transcripción de imágenes sin conexión a internet.
- Preprocesamiento para pipelines de RAG sobre documentos físicos: el texto extraído por el modelo puede alimentar un sistema de recuperación aumentada, permitiendo buscar sobre archivos que solo existen en papel o como imágenes.
- Investigación en visión-lenguaje: al ser un modelo pequeño con licencia MIT, sirve como base para experimentación y fine-tuning en tareas de OCR especializado o dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~1,4 GB; Q4_K_M ~2,1 GB; Q8_0 ~3,2 GB; f16 ~6,0 GB. A esto hay que sumar el archivo mmproj (0,6 GB en Q8_0 o 0,9 GB en f16) y la memoria para el contexto y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas (Q2_K a Q4_K_M) más el mmproj; para f16 se recomienda al menos 8-10 GB. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM usando cuantizaciones Q4 o Q5; en Q2_K podría ejecutarse incluso en GPUs de 4 GB, aunque con posible degradación de calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF que soporte modelos multimodales con mmproj. No se indica compatibilidad con vLLM o TGI para esta variante GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LibreDeepSeekOCR1-GGUF (este) | ~2,9 B | no disponible | MIT | GGUF | Especializado en OCR, cuantizado por mradermacher |
| Modelos OCR de la familia DeepSeek-OCR | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; no se dispone de especificaciones detalladas |
| Alternativas VLM compactas (p. ej. Qwen2-VL 2B, Florence-2) | ~2 B | variable | variable | safetensors/GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (en); su rendimiento en castellano u otros idiomas no está documentado y podría ser deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad OCR frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar texto que no aparece en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar significativamente la precisión del OCR; se recomienda Q4_K_M o superior para producción.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica falta de validación por parte de la comunidad.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación para documentos largos o múltiples páginas.
- Aunque la licencia es MIT (permisiva para uso comercial), debe verificarse la licencia del modelo base LibreYOLO/LibreDeepSeekOCR1 y de los datos de entrenamiento originales.
- La cuantización es estática y no se ofrecen variantes ponderadas por imatrix, lo que puede afectar ligeramente la calidad frente a cuantizaciones más elaboradas.
- El uso de modelos OCR en producción requiere validación humana en dominios críticos (documentos legales, médicos o financieros) debido a posibles errores de transcripción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/LibreDeepSeekOCR1-GGUF
- Modelo base: https://huggingface.co/LibreYOLO/LibreDeepSeekOCR1
- Página de descargas del autor: https://hf.tst.eu/model#LibreDeepSeekOCR1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
