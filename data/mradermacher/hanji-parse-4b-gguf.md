# mradermacher/hanji-parse-4b-GGUF

## Resumen

hanji-parse-4b-GGUF es la redistribución en formato GGUF del modelo hanji-dev/hanji-parse-4b, un vision-language model de 4.022.468.096 parámetros (unos 4,02 B) especializado en OCR, parsing de documentos, análisis de layout y document AI. La conversión a GGUF la realiza el usuario mradermacher, conocido por publicar cuantizaciones estáticas de modelos abiertos, mientras que el entrenamiento y la publicación del modelo original corresponden a hanji-dev. El repositorio se distribuye con licencia Apache 2.0 y declara únicamente el idioma inglés.

El interés de esta ficha radica en que empaqueta un modelo multimodal de parsing documental en cuantizaciones que van de 1,8 GB (Q2_K) a 8,2 GB (f16), lo que permite ejecutarlo en GPU de consumo y en CPU mediante llama.cpp u Ollama. Además del modelo de lenguaje, el repositorio incluye dos ficheros mmproj (proyector multimodal) en Q8_0 y f16, imprescindibles para procesar imágenes, ya que sin ellos el modelo solo aceptaría texto.

La información pública disponible es limitada: no se documentan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, y el repositorio acumula 180 descargas y 0 likes en el momento de la consulta. Las búsquedas web realizadas no devolvieron ninguna fuente relevante sobre el modelo, por lo que todos los datos de esta ficha proceden de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model de la familia Qwen3-VL (segun el tag qwen3_vl del repositorio); detalle de capas, atencion y cabezas no disponible |
| Parametros totales | 4.022.468.096 (~4,02 B) segun los pesos safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (solo cuantizaciones estaticas; no hay imatrix ni weighted) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo de lenguaje) + GGUF mmproj (proyector multimodal) |
| Modelo base | hanji-dev/hanji-parse-4b |
| Cuantizador | mradermacher |
| Tamano del repositorio | 37,7 GB |
| Descargas / likes | 180 / 0 |
| Fechas del repositorio | creado el 2026-08-16, actualizado el 2026-10-10 |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo, pero sus etiquetas incluyen qwen3_vl, lo que sitúa el modelo base en la familia Qwen3-VL de modelos de visión-lenguaje, con un codificador visual conectado a un transformer de lenguaje mediante un proyector multimodal. La existencia de ficheros mmproj separados (0,6 GB en Q8_0 y 0,9 GB en f16) confirma ese esquema de dos componentes: torre de visión más proyector, por un lado, y modelo de lenguaje, por otro. No se especifican número de capas, dimensión oculta, mecanismo de atención ni resolución de imagen soportada.

Sobre el entrenamiento no hay ningún dato publicado en la información disponible: ni número de tokens, ni composición del dataset, ni si hubo ajuste por instrucciones, RLHF o DPO. Lo único documentado es el proceso de cuantización, que según los metadatos internos de la model card usó quantize_version 2, conversión desde pesos de HuggingFace (convert_type: hf) y cuantización de tensores de salida (output_tensor_quantised: 1). El propio autor indica que no hay cuantizaciones ponderadas ni con imatrix para este modelo y que, si no aparecen en una semana, probablemente no las planee.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, según las etiquetas ocr y document-parsing.
- Parsing estructurado de documentos: extracción de contenido y reconstrucción de la estructura del documento (secciones, bloques de texto, tablas), según las etiquetas document-ai y layout.
- Comprensión de layout: la etiqueta layout indica tratamiento explícito de la disposición espacial de los elementos de la página.
- Entrada multimodal imagen + texto: requiere cargar el fichero mmproj correspondiente junto con el GGUF del modelo.
- Uso conversacional: el repositorio incluye la etiqueta conversational.
- Compatibilidad con endpoints: el repositorio está etiquetado como endpoints_compatible.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de otros idiomas.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible en la información publicada.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede convertir imágenes o escaneos de documentos en texto estructurado, aprovechando sus capacidades de OCR y de análisis de layout para respetar el orden de lectura de páginas con columnas o encabezados.
- Extracción de datos de facturas y albaranes: integrado en un pipeline de ingesta, el modelo recibe la imagen del documento y devuelve los campos relevantes para su validación posterior en el sistema de gestión, reduciendo la introducción manual de datos.
- Conversión de PDF escaneados a Markdown o JSON: el modelo puede generar una representación estructurada del documento apta para alimentar bases de conocimiento, wikis internas o repositorios de documentación.
- Indexado para RAG sobre documentación corporativa: el texto extraído por el modelo se trocea, se vectoriza y se almacena en un índice, de modo que un asistente posterior pueda responder preguntas citando el documento original.
- Procesamiento local con requisitos de privacidad: al distribuirse en GGUF y caber en cuantizaciones de 2,5 a 3 GB, puede ejecutarse en un portátil o una estación de trabajo sin enviar documentos sensibles (contratos, informes médicos, expedientes) a servicios externos.
- Preprocesado de contratos y documentación legal: extracción de cláusulas, partes firmantes y fechas para alimentar herramientas de revisión, siempre con revisión humana dado que no hay métricas publicadas de precisión.
- Automatización de la captura de formularios en papel: lectura de formularios escaneados y volcado de los campos a una base de datos, como paso previo a la validación por reglas de negocio.
- Prototipado y evaluación de pipelines de document AI: al ofrecer 14 niveles de cuantización, permite medir el equilibrio entre precisión y consumo de recursos antes de decidir qué variante desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño de los pesos por cuantización: Q2_K 1,8 GB; Q3_K_S 2,0 GB; Q3_K_M 2,2 GB; Q3_K_L 2,3 GB; IQ4_XS 2,4 GB; Q4_K_S 2,5 GB; Q4_K_M 2,6 GB; Q5_K_S 2,9 GB; Q5_K_M 3,0 GB; Q6_K 3,4 GB; Q8_0 4,4 GB; f16 8,2 GB.
- Proyector multimodal adicional: 0,6 GB (mmproj-Q8_0) o 0,9 GB (mmproj-f16), que debe cargarse junto al modelo cuando se procesan imágenes.
- VRAM estimada para inferencia: en torno a 4-5 GB con Q4_K_M más mmproj y una ventana de contexto moderada; alrededor de 6-7 GB con Q8_0 más mmproj; unos 10-11 GB con f16 más mmproj-f16. Son estimaciones a partir del tamaño de los ficheros, no mediciones publicadas.
- GPU de consumo compatibles: cualquier GPU con 8 GB o más permite Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 3070); con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) se pueden usar Q6_K u Q8_0 con contexto amplio; con 24 GB (RTX 3090, RTX 4090) cabe f16 sin problema.
- GPU de centro de datos: A100, H100 o L40S son suficientes con holgura; el modelo es pequeño para estas tarjetas y quedarían limitadas por otros factores antes que por VRAM.
- Ejecución en CPU: viable con llama.cpp en cuantizaciones Q4 y Q5, con latencias mayores que en GPU; el modelo completo en f16 también puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp y su servidor llama-server (soporta mmproj para entrada de imagen), Ollama y LM Studio (importando el GGUF y su mmproj), koboldcpp. El soporte de vLLM y TGI para GGUF multimodales de esta arquitectura no está confirmado en la información disponible.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| hanji-parse-4b-GGUF (esta ficha) | 4,02 B | no disponible | en | apache-2.0 | GGUF + mmproj | 14 cuantizaciones estáticas, sin imatrix; 180 descargas |
| hanji-dev/hanji-parse-4b | 4,02 B | no disponible | en | apache-2.0 | safetensors | Modelo original en precisión completa; requiere GPU para inferencia |
| Qwen2.5-VL-3B | 3 B | no disponible | multilingüe | no verificada en la información disponible | safetensors, GGUF mediante terceros | Alternativa generalista de visión-lenguaje, no específica de parsing documental |
| GOT-OCR2.0 | no disponible | no disponible | no disponible | no verificada en la información disponible | safetensors | Especializado en OCR y documentos; no disponible en GGUF en el repositorio consultado |
| Nougat | no disponible | no disponible | no disponible | no verificada en la información disponible | safetensors | Orientado a conversión de PDF académicos a texto; histórico en la tarea |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la tabla es únicamente descriptiva.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés. No hay evidencia de calidad en castellano ni en otros idiomas, algo crítico si se pretende procesar documentación en español.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, por lo que no puede planificarse el procesamiento de documentos largos sin pruebas previas.
- Ausencia total de benchmarks: no hay métricas publicadas de precisión en OCR, extracción de tablas o parsing de layout, lo que impide compararlo objetivamente con alternativas y desaconseja su uso en producción crítica sin una evaluación propia.
- Riesgo de alucinación: al ser un modelo generativo aplicado a lectura de documentos, puede producir texto plausible que no aparezca en la imagen, especialmente con escaneos de baja calidad, ruido o manuscritos. Se recomienda validación posterior por reglas o revisión humana.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas ni con imatrix, por lo que las variantes de baja precisión (Q2_K, Q3_K) degradan más la calidad que sus equivalentes con imatrix.
- Poca validación comunitaria: 180 descargas y 0 likes reducen la probabilidad de que existan informes independientes de errores o de calidad real.
- Cadena de responsabilidad: los pesos originales son de hanji-dev y esta es una conversión de terceros; ante cualquier discrepancia debe consultarse el repositorio base y sus términos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y los datos de entrenamiento no impongan restricciones adicionales, algo que no se detalla en la información disponible.
- Tamaño del repositorio: 37,7 GB en total; descargar el repositorio completo no es necesario, basta con elegir una cuantización y su mmproj, pero conviene tenerlo en cuenta en almacenamiento y ancho de banda.
- Despliegue multimodal: si se olvida cargar el fichero mmproj, el modelo solo procesará texto y fallará silenciosamente en las tareas de OCR, que son su propósito principal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/hanji-parse-4b-GGUF
- Modelo base: https://huggingface.co/hanji-dev/hanji-parse-4b
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#hanji-parse-4b-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los enlaces listados son los incluidos en la model card y los metadatos de HuggingFace.
