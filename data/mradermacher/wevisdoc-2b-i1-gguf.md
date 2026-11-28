# mradermacher/WeVisDoc-2B-i1-GGUF

## Resumen

WeVisDoc-2B-i1-GGUF es la versión cuantizada con imatrix del modelo multimodal WeVisDoc-2B de Tencent, publicada por el usuario mradermacher. Se trata de una recopilación de ficheros GGUF pensados para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.), lo que permite ejecutar un modelo de visión y documento de 2.000 millones de parámetros en hardware de consumo. El modelo original está orientado a tareas de comprensión de documentos visuales, es decir, extracción de información y razonamiento sobre imágenes de documentos, con soporte para inglés y chino.

La relevancia de esta ficha radica en que el repositorio ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 0,7 GB hasta Q6_K de 1,8 GB), lo que facilita desplegar el modelo en entornos con recursos muy limitados. Al estar basado en un modelo de solo 2B parámetros, el coste computacional es bajo y el tamaño de los ficheros manejable, si bien la información pública sobre arquitectura interna, contexto y datos de entrenamiento del modelo base es escasa en la documentación disponible.

Es importante señalar que esta ficha describe el repositorio de cuantizaciones, no el modelo original de Tencent. Los detalles arquitectónicos y de entrenamiento del modelo base no están documentados en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/WeVisDoc-2B; orientado a visión y documentos) |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base tencent/WeVisDoc-2B en la documentación proporcionada. Por el nombre y las etiquetas del repositorio (visión, documentos, multimodal), se deduce que se trata de un modelo con capacidad de procesamiento de imágenes de documentos, probablemente con un codificador visual acoplado a un transformer de lenguaje de 2B parámetros. Los ficheros mmproj (proyector multimodal) no se incluyen en este repositorio de cuantizaciones dinámicas, sino que se remiten al repositorio estático del mismo autor.

En cuanto al proceso de cuantización, mradermacher ha generado las versiones mediante el método i1 (imatrix), que emplea una matriz de importancia calculada a partir de datos de calibración para preservar mejor la calidad en cuantizaciones agresivas. El repositorio incluye el propio fichero imatrix (0,1 GB) para que el usuario pueda generar sus propias cuantizaciones. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas específicas.

## Capacidades

- Comprensión de documentos visuales: el modelo está diseñado para procesar imágenes de documentos y extraer o razonar sobre su contenido, según se deduce de su nombre y etiquetas.
- Generación de texto conversacional: la etiqueta "conversational" indica soporte para diálogo multi-turno.
- Capacidades multimodales: al ser un modelo de visión, puede recibir entradas de imagen además de texto (requiere el fichero mmproj del repositorio estático).
- Multilingüe limitado: soporta inglés y chino.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp y derivados, lo que permite inferencia en CPU y GPU de consumo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o modos de razonamiento explícito (thinking mode).

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo puede procesar imágenes de documentos financieros y extraer campos estructurados (importes, fechas, emisores), gracias a su orientación específica a comprensión de documentos visuales.
- Digitalización de formularios: útil para convertir formularios escaneados en texto estructurado en flujos de back-office, con la ventaja de ejecutarse localmente y evitar el envío de datos sensibles a la nube.
- Procesamiento de documentos en chino e inglés: adecuado para entornos bilingües donde se requiera interpretar documentos en ambos idiomas, como comercio internacional o administración.
- Asistente de atención al cliente sobre documentación: puede responder preguntas sobre el contenido de imágenes de documentos adjuntas por el usuario en un chat, aprovechando su naturaleza conversacional.
- Clasificación y enrutado de documentos: en pipelines de gestión documental, el modelo puede identificar el tipo de documento y dirigirlo al flujo correspondiente.
- Despliegue en dispositivos con recursos limitados: con cuantizaciones de 0,7 a 1,8 GB, es viable en portátiles, mini-PC o entornos edge para tareas de OCR asistido y comprensión de documentos sin GPU dedicada.
- Prototipado e investigación: al ser un modelo pequeño y con licencia Apache 2.0, resulta adecuado para experimentar con pipelines multimodales en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB y 1,8 GB solo para los pesos según la cuantización elegida (IQ1_S a Q6_K), más el espacio para el fichero mmproj y la caché KV, que depende de la longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM libre es suficiente para las cuantizaciones más pequeñas; una RTX 3060 de 12 GB o superior permite ejecutar la Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 2B parámetros, se espera una latencia baja en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeVisDoc-2B-i1-GGUF (este) | 2,03 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix, enfoque en documentos visuales, en/zh |
| tencent/WeVisDoc-2B (base) | 2,03 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, requiere transformers |
| mradermacher/WeVisDoc-2B-GGUF (estático) | 2,03 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas y ficheros mmproj |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse presumiblemente con datos en inglés y chino, puede presentar sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de extracción de documentos, puede inventar campos o valores no presentes en la imagen, por lo que se recomienda validación posterior.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Tencent, ya que esta ficha se basa en la declaración del repositorio de cuantizaciones.
- Las cuantizaciones muy agresivas (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Los ficheros mmproj necesarios para la funcionalidad de visión no están en este repositorio, sino en el repositorio estático; sin ellos, el modelo solo funcionará como modelo de texto.
- No se documentan la longitud de contexto ni los detalles de entrenamiento, lo que dificulta evaluar su idoneidad para tareas con documentos largos.
- El repositorio tiene 0 likes y un volumen de descargas moderado (1.597), lo que sugiere una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/WeVisDoc-2B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisDoc-2B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/WeVisDoc-2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#WeVisDoc-2B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
