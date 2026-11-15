# mradermacher/medgemma-4b-it-GGUF

## Resumen

MedGemma 4B IT es un modelo multimodal especializado en el dominio médico, desarrollado originalmente por Google bajo el paraguas de Health AI Developer Foundations. La versión aquí descrita es la cuantización GGUF realizada por mradermacher sobre los pesos originales de `google/medgemma-4b-it`, pensada para su ejecución local en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo combina un componente de lenguaje de aproximadamente 3.880 millones de parámetros con un codificador visual, lo que le permite procesar tanto texto clínico como imágenes médicas (radiografías de tórax, dermatología, patología, oftalmología).

El problema que resuelve es la necesidad de un modelo médico de tamano contenido que pueda desplegarse en entornos con recursos limitados (hospitales, clínicas, investigación) sin depender de APIs en la nube, manteniendo capacidades de razonamiento clínico y comprensión de imágenes diagnósticas. Al estar publicado en formato GGUF con múltiples niveles de cuantización (desde Q2_K hasta f16), permite elegir el equilibrio entre calidad y huella de memoria según el hardware disponible.

La relevancia actual radica en la creciente demanda de modelos de dominio específico que puedan ejecutarse de forma privada y auditable en contextos sanitarios, donde la confidencialidad de los datos es crítica. No obstante, conviene subrayar que se trata de una cuantización comunitaria de un modelo con licencia restringida (Health AI Developer Foundations), lo que condiciona su uso comercial y requiere aceptar los términos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); detalles exactos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 3.880.263.168 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | health-ai-developer-foundations (licencia "other", requiere aceptar los términos de Health AI Developer Foundations de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base más allá de que se trata de un modelo multimodal (etiquetas `medical`, `radiology`, `chest-x-ray`, `dermatology`, `pathology`, `ophthalmology` y la presencia de ficheros `mmproj` que confirman un proyector multimodal para entrada de imágenes). El recuento de parámetros (3.880 millones) corresponde al modelo de lenguaje; el codificador visual anade parámetros adicionales no cuantificados en el mismo fichero. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación concreta no está en el modelo en sí, sino en el proceso de cuantización: mradermacher ofrece cuantizaciones estáticas (este repo) y cuantizaciones ponderadas/imatrix en un repositorio separado (`medgemma-4b-it-i1-GGUF`), lo que permite obtener mejor calidad por bit en los niveles bajos. Los ficheros `mmproj` (multi-modal projection) son necesarios para habilitar la entrada de imágenes en llama.cpp, y se ofrecen en dos precisiones (Q8_0 y f16).

## Capacidades

- Generación de texto clínico y razonamiento médico en inglés.
- Comprensión de imágenes médicas: radiografías de tórax, imágenes de dermatología, patología y oftalmología (según las etiquetas del modelo).
- Razonamiento clínico multi-step sobre casos descritos en texto.
- Conversación multi-turno (etiqueta `conversational`).
- Procesamiento multimodal texto + imagen gracias al proyector `mmproj`.
- No se ha documentado en la informacion disponible soporte de tool calling, function calling ni modo "thinking" explícito.
- Capacidades multilingües limitadas al inglés según el campo `language`.

## Casos de uso

- **Triaje radiológico preliminar**: el modelo puede analizar radiografías de tórax junto con texto clínico para generar descripciones preliminares o sugerencias de hallazgos, sirviendo como apoyo a radiólogos en entornos con alta carga asistencial. Su tamano (4B) permite desplegarlo en estaciones de trabajo con GPU modesta.
- **Apoyo a la docencia médica**: generación de explicaciones y razonamiento clínico sobre casos e imágenes en inglés, útil para simulaciones y material formativo en facultades de medicina.
- **Investigación en dermatología y patología**: análisis exploratorio de imágenes de piel o histopatología con fines de investigación, siempre con supervisión experta y sin uso diagnóstico autónomo.
- **Despliegue en entornos con requisitos de privacidad**: al ejecutarse localmente en formato GGUF (por ejemplo, con llama.cpp u Ollama), permite procesar datos de pacientes sin enviarlos a servicios en la nube, lo que facilita el cumplimiento de normativas de protección de datos.
- **Prototipado rápido de asistentes clínicos**: gracias a las cuantizaciones Q4_K_S/Q4_K_M (2,5-2,6 GB), se puede iterar en portátiles con GPU de 8 GB o incluso en CPU, acelerando la validación de ideas antes de pasar a modelos mayores.
- **Generación de borradores de informes clínicos en inglés**: a partir de una imagen y un breve historial, el modelo puede redactar un borrador estructurado que el profesional revisa y edita, reduciendo tiempo de documentación.
- **Evaluación comparativa de modelos médicos**: útil como baseline ligero en estudios que comparen modelos médicos open source en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos del LLM)**:
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB (recomendados por el autor)
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
- **Proyector multimodal adicional**: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16), a sumar a la VRAM del LLM cuando se procesan imágenes.
- **GPU recomendadas**: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 con margen para el contexto; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo. Con Q4_K_M + mmproj-Q8_0 el total ronda los 3,3 GB, por lo que funciona en tarjetas de 6 GB o incluso en CPU con suficiente RAM.
- **Opciones de despliegue**: llama.cpp (referencia para GGUF), Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors, vLLM o TGI si el soporte multimodal está disponible (no confirmado en la informacion proporcionada).
- **Latencia y throughput**: no disponibles en la informacion proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| MedGemma 4B IT (esta ficha) | ~3,88B | no disponible | Sí (imagen médica) | Health AI Developer Foundations | GGUF / safetensors |
| google/medgemma-4b-it (original) | ~3,88B | no disponible | Sí | Health AI Developer Foundations | safetensors |
| MedGemma 4B IT i1-GGUF (imatrix) | ~3,88B | no disponible | Sí | Health AI Developer Foundations | GGUF (imatrix) |
| Modelos médicos ligeros de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks ni comparativas con alternativas como Meditron, BioMistral o Llama-3-Med, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Uso clínico**: este modelo no está validado para diagnóstico ni tratamiento; cualquier uso en contexto clínico requiere supervisión de profesionales sanitarios y validación regulatoria independiente.
- **Idioma**: solo inglés; no se ha documentado soporte para castellano ni otras lenguas, lo que limita su uso directo en España sin traducción previa.
- **Licencia restrictiva**: la licencia Health AI Developer Foundations exige aceptar los términos de Google y puede imponer restricciones al uso comercial; es imprescindible revisar los términos antes de cualquier despliegue productivo.
- **Riesgo de alucinación**: como todo LLM, puede generar hallazgos o referencias inexistentes; en dominio médico el coste de un error es alto.
- **Sesgos**: no se documentan en la informacion disponible, pero los modelos médicos entrenados mayoritariamente con datos en inglés pueden presentar sesgos demográficos y geográficos.
- **Cuantización**: las cuantizaciones Q2_K y Q3_K reducen la calidad; el autor recomienda Q4_K_S/Q4_K_M o superiores para uso real.
- **Contexto**: se desconoce la longitud máxima de contexto soportada, lo que impide garantizar el manejo de historiales clínicos largos.
- **Repositorio comunitario**: se trata de una cuantización de terceros (mradermacher), no del modelo oficial de Google; para producción conviene partir del repositorio original y validar la equivalencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/medgemma-4b-it-GGUF
- Modelo base original: https://huggingface.co/google/medgemma-4b-it
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/medgemma-4b-it-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#medgemma-4b-it-GGUF
- Términos de licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
