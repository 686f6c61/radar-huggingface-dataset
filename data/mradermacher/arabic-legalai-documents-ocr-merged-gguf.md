# mradermacher/arabic-legalAI-documents-ocr-merged-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `nadanedon/arabic-legalAI-documents-ocr-merged`, publicadas por el usuario mradermacher, conocido por distribuir versiones comprimidas de modelos abiertos para inferencia local. El modelo base tiene 3.880.263.168 parámetros (aproximadamente 3,88 B) y, a juzgar por los ficheros `mmproj` incluidos en el repositorio, se trata de un modelo multimodal con componente de visión orientado a tareas de OCR sobre documentos. El nombre del modelo base apunta a un uso sobre documentos legales en árabe, aunque los metadatos del repositorio declaran únicamente el idioma inglés.

La aportación de esta ficha no es un modelo nuevo, sino un conjunto de pesos cuantizados en formato GGUF listos para ejecutarse con llama.cpp y derivados, sin necesidad de GPU de datacenter. Se ofrecen doce niveles de cuantización para los pesos del modelo (desde Q2_K de 1,8 GB hasta f16 de 7,9 GB) más dos variantes del proyector multimodal (mmproj-Q8_0 y mmproj-f16). El repositorio ocupa 37,4 GB en total.

La relevancia de esta publicación es práctica: permite desplegar un modelo de 3,88 B con capacidades de OCR y procesamiento de documentos en hardware de consumo, algo crítico para pipelines de digitalización y análisis documental que no pueden enviar datos a APIs externas. No obstante, la licencia no está declarada, el modelo base no publica tarjeta detallada de arquitectura ni de entrenamiento, y no hay resultados de benchmarks disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio incluye ficheros mmproj, lo que indica un modelo multimodal con codificador visual, pero no se detalla la arquitectura) |
| Parámetros totales | 3.880.263.168 (≈3,88 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (según metadatos; el nombre del modelo base referencia documentos legales en árabe, pero el árabe no aparece declarado en los metadatos) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye presumiblemente en safetensors, según la etiqueta `transformers`) |
| Autor de la cuantización | mradermacher |
| Modelo base | nadanedon/arabic-legalAI-documents-ocr-merged |
| Tamaño del repositorio | 37,4 GB |
| Versión de cuantización | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Cuantizaciones ponderadas (imatrix) | no disponibles (el autor indica que no las ha generado y que pueden solicitarse abriendo una discusión) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-04 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del modelo base en el material proporcionado. Los únicos indicios son indirectos: la presencia de dos ficheros `mmproj` (proyector multimodal en Q8_0 y f16) confirma que el modelo procesa entrada visual además de texto, y la etiqueta `conversational` junto con `transformers` sugiere un modelo generativo instruido. No se especifica si emplea atención lineal, mezcla de expertos, SSM o cualquier otra variante; tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otra alineación.

Respecto a la parte que sí documenta este repositorio, se trata de una cuantización estática generada por mradermacher con `quantize_version: 2`, conversión desde pesos HuggingFace y cuantización de tensores de salida activada. El autor no ha publicado variantes ponderadas con matriz de importancia (imatrix), que suelen ofrecer mejor relación calidad/tamaño en los niveles bajos de bits. Como innovación destacable solo cabe señalar la inclusión del proyector multimodal en formato GGUF, lo que permite ejecutar el modelo completo (visión + lenguaje) dentro del ecosistema llama.cpp.

## Capacidades

- Procesamiento de imágenes de documentos: la presencia de ficheros `mmproj` implica capacidad de recibir imágenes como entrada, presumiblemente para tareas de OCR y extracción de contenido.
- Generación de texto conversacional: la etiqueta `conversational` indica formato de diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar para el formato GGUF.
- OCR de documentos legales: por el nombre del modelo base, el caso de uso previsto es la extracción de texto en documentos legales, presumiblemente en árabe.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponibles más allá del inglés declarado en los metadatos.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de expedientes legales en papel: el modelo puede recibir la imagen de cada página y devolver el texto extraído, integrándose en un pipeline de escaneo masivo. Es adecuado porque combina OCR y comprensión del contenido en un único paso, y al ejecutarse en local evita enviar documentación confidencial a terceros.
- Extracción estructurada de cláusulas contractuales: a partir de la imagen de un contrato, el modelo podría transcribir y localizar secciones concretas (plazos, partes, importes), reduciendo el trabajo manual en departamentos jurídicos.
- Preprocesado para búsqueda semántica sobre archivos históricos: convertir lotes de documentos escaneados a texto plano para indexarlos después en un motor de búsqueda vectorial.
- Revisión de documentación en despachos con requisitos de confidencialidad: el despliegue local con cuantización Q4_K_M permite ejecutar el modelo en una estación de trabajo sin conexión externa, cumpliendo políticas de secreto profesional.
- Asistencia a la ciudadanía en trámites: transcripción y resumen de formularios o resoluciones administrativas escaneadas, como paso previo a un sistema de ayuda automatizada.
- Auditoría de calidad de OCR: comparar la salida del modelo con transcripciones humanas de referencia para medir la tasa de error en tipografías y formatos concretos antes de desplegarlo en producción.
- Prototipado e investigación en visión-lenguaje aplicada a documentos: al ser un modelo de 3,88 B, permite iterar experimentos de ajuste fino o evaluación en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, DocVQA, OCRBench ni de ningún otro conjunto de evaluación, y el modelo base tampoco publica cifras en el material consultado.

## Requisitos de hardware

- Tamaño de los pesos por cuantización (datos reales de la tarjeta del modelo): Q2_K 1,8 GB; Q3_K_S 2,0 GB; Q3_K_M 2,2 GB; Q3_K_L 2,3 GB; IQ4_XS 2,4 GB; Q4_K_S 2,5 GB; Q4_K_M 2,6 GB; Q5_K_S 2,9 GB; Q5_K_M 2,9 GB; Q6_K 3,3 GB; Q8_0 4,2 GB; f16 7,9 GB.
- Proyector multimodal adicional: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16), que debe cargarse junto a los pesos si se quieren procesar imágenes.
- VRAM estimada para inferencia (aproximación a partir del tamaño de fichero más caché KV y overhead del runtime, no publicada por el autor): en torno a 3-4 GB con Q4_K_M, 5-6 GB con Q6_K, 6-7 GB con Q8_0 y 9-10 GB con f16, en todos los casos sumando el proyector si se usa entrada visual. La caché KV depende de la longitud de contexto, que no se ha hecho pública.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o más con Q4_K_M (por ejemplo RTX 3060 Ti, RTX 4060, RTX 3070); en 12 GB (RTX 3060 12 GB, RTX 4070) se pueden usar Q6_K o Q8_0; en 16-24 GB (RTX 4080, RTX 4090) cabe incluso f16 junto con el proyector.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para este tamaño; se justifican únicamente por batching alto o por servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli y las herramientas multimodales del proyecto para cargar el mmproj), Ollama y LM Studio como envoltorios sobre llama.cpp, llama-cpp-python para integración en Python, y text-generation-webui. vLLM y TGI admiten GGUF de forma parcial y con soporte limitado para modelos multimodales en este formato, por lo que conviene verificar la compatibilidad antes de elegirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación posible se limita al propio modelo base y a sus variantes de cuantización.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nadanedon/arabic-legalAI-documents-ocr-merged (base) | 3,88 B | no disponible | safetensors | no disponible | HuggingFace |
| mradermacher/arabic-legalAI-documents-ocr-merged-GGUF (esta ficha) | 3,88 B | no disponible | GGUF + mmproj | no disponible | HuggingFace |
| Alternativas de OCR documental de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin declarar: al no especificarse licencia ni en el repositorio de cuantización ni en los metadatos, no puede confirmarse que el uso comercial esté permitido. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Discrepancia entre nombre e idiomas declarados: el nombre del modelo base apunta a documentos legales en árabe, pero los metadatos solo declaran inglés. No hay confirmación de que el modelo funcione correctamente en árabe.
- Riesgo de alucinación: en una tarea de OCR y análisis legal, cualquier texto inventado o mal transcrito puede tener consecuencias graves; se recomienda validación humana en flujos críticos.
- Degradación por cuantización: las variantes Q2_K y Q3_K pierden calidad de forma apreciable; en tareas de OCR sobre tipografías difíciles o documentos degradados conviene usar Q5_K_M o superior.
- Ausencia de cuantizaciones imatrix: el autor indica que no ha generado variantes ponderadas, que suelen mejorar la fidelidad en niveles bajos de bits.
- Sin benchmarks ni validación publicados: no hay métricas de precisión de OCR, ni comparación con alternativas, ni pruebas de contexto largo.
- Adopción nula: cero descargas y cero likes en el momento de redactar la ficha, lo que implica ausencia de validación por parte de la comunidad.
- Longitud de contexto desconocida: no se puede garantizar el tratamiento de documentos extensos sin trocear en páginas o fragmentos.
- Sesgos: no disponibles, al no publicarse información sobre los datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/arabic-legalAI-documents-ocr-merged-GGUF
- Modelo base: https://huggingface.co/nadanedon/arabic-legalAI-documents-ocr-merged
- Página de descarga y resumen del cuantizador: https://hf.tst.eu/model#arabic-legalAI-documents-ocr-merged-GGUF
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
