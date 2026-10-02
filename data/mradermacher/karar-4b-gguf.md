# mradermacher/Karar-4B-GGUF

## Resumen

Karar-4B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo mertkayacs/Karar-4B, publicadas por el usuario mradermacher, especializado en convertir pesos de modelos abiertos a formatos ejecutables en CPU y GPU de consumo. El modelo original es un transformer de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) orientado a la toma de decisiones, la calibracion de confianza y la prediccion conformal, con capacidades declaradas de razonamiento, enrutamiento (routing) y triaje (triage).

La relevancia de esta ficha esta en que no se trata de un modelo conversacional generico, sino de un modelo de decision con etiquetas que apuntan a incertidumbre calibrada, decisiones tipadas (typesafe) y el framework JEV. Los idiomas soportados son turco (tr) e ingles (en), y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio ocupa 39,9 GB en total e incluye 13 cuantizaciones estaticas de pesos mas dos ficheros mmproj etiquetados como complemento multimodal, ademas de los pesos en f16. No se han publicado resultados de benchmarks ni detalles de la arquitectura interna o de la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags del modelo incluyen "qwen3.5", lo que sugiere una familia Qwen3.5, pero no se confirma en la informacion disponible |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 (complemento multimodal) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base, mertkayacs/Karar-4B, se distribuye en formato transformers/safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags publicados incluyen "qwen3.5", lo que apunta a que Karar-4B parte de la familia Qwen 3.5, pero no hay confirmacion explicita en la model card ni en los metadatos analizados. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineamiento.

El unico dato de entrenamiento disponible es el dataset referenciado, mertkayacs/jevalt-data, junto con un conjunto de etiquetas que describen la finalidad del modelo: decision-model, calibration, conformal-prediction, uncertainty, reasoning, routing, triage, jev y typesafe. Estos terminos indican que el modelo esta disenado para emitir decisiones acompanadas de una estimacion de incertidumbre calibrada, un requisito habitual en sistemas de prediccion conformal donde el modelo debe poder abstenerse o delegar cuando la confianza es insuficiente.

Esta edicion concreta es una cuantizacion estatica generada por mradermacher. La model card indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que pueden solicitarse abriendo una discusion en la comunidad. La cuantizacion se ha realizado con quantize_version 2, output_tensor_quantised 1 y convert_type hf.

## Capacidades

- Generacion de decisiones y clasificacion: el modelo esta etiquetado como decision-model, por lo que su funcion principal es emitir decisiones estructuradas en lugar de texto libre.
- Calibracion de confianza y prediccion conformal: las etiquetas calibration y conformal-prediction indican que puede producir estimaciones de incertidumbre utilizables para fijar umbrales de aceptacion o abtencion.
- Razonamiento y enrutamiento (routing): puede emplearse para decidir a que destino, modelo o cola debe derivarse una consulta.
- Triaje: orientado a priorizar o clasificar entradas en funcion de criterios de negocio.
- Decisiones tipadas (typesafe): la etiqueta typesafe sugiere salidas con estructura verificable, adecuadas para integracion en sistemas con validacion de esquema.
- Framework JEV: el tag jev aparece tanto en este modelo como en otras publicaciones del mismo autor, aunque no se detalla su contenido en la informacion disponible.
- Multilingue limitado: soporte declarado de turco e ingles unicamente.
- Multimodalidad potencial: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16 descritos como "multi-modal supplement", lo que indica soporte de proyector multimodal, aunque la model card no documenta que modalidades cubre.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte en turco e ingles: el modelo puede clasificar y priorizar incidencias entrantes segun su criticidad, aprovechando su caracter bilingue declarado y su orientacion a triage.
- Enrutamiento de consultas en arquitecturas multi-modelo: dado su tag routing, puede actuar como clasificador previo que decida si una peticion debe resolverse con un modelo pequeno local o derivarse a un modelo mayor en la nube.
- Filtrado con abtencion en flujos de riesgo: gracias a la calibracion y a la prediccion conformal, permite descartar automaticamente las decisiones con confianza baja y mandarlas a revision humana, controlando la tasa de error a un nivel predefinido.
- Validacion de decisiones tipadas en pipelines de negocio: la etiqueta typesafe sugiere salidas con estructura fija, utiles para integrar en procesos donde la respuesta debe validarse contra un esquema antes de ejecutarse.
- Preprocesado en sistemas RAG: puede decidir si una consulta del usuario requiere recuperacion documental, si es respondible directamente o si debe rechazarse, reduciendo coste en etapas posteriores.
- Despliegue local en entornos con restricciones de privacidad: con cuantizaciones de entre 2,0 GB y 4,6 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada o en equipos con GPU modesta, manteniendo los datos dentro de la organizacion.
- Asistente interno bilingue para equipos turco-hablantes: al cubrir tr y en, sirve para normalizar y resumir comunicaciones internas entre equipos en ambos idiomas.
- Clasificacion de contenido y control de cumplimiento: con umbrales calibrados, puede marcar entradas que superan un nivel de riesgo y escalarlas, reduciendo falsos positivos respecto a clasificadores sin calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos facilitados incluyen resultados de MMLU, HumanEval, GSM8K u otras evaluaciones estandar, ni comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K 2,0 GB; Q3_K_S 2,2 GB; Q3_K_M 2,4 GB; Q3_K_L 2,5 GB; IQ4_XS 2,6 GB; Q4_K_S 2,7 GB; Q4_K_M 2,8 GB; Q5_K_S 3,1 GB; Q5_K_M 3,2 GB; Q6_K 3,6 GB; Q8_0 4,6 GB; f16 8,5 GB. Hay que sumar aproximadamente 1-2 GB adicionales para cache KV, estados intermedios y overhead del runtime, cantidad que crece con la longitud de contexto.
- Complemento multimodal: los ficheros mmproj anaden 0,5 GB (Q8_0) o 0,8 GB (f16) si se utiliza la ruta multimodal.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5 con margen. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 son adecuados. En el extremo alto, A100 y H100 no aportan ventaja significativa para 4B parametros salvo por despliegue concurrente a gran escala.
- Compatibilidad con GPU de consumo: si. Las cuantizaciones Q4_K_S y Q4_K_M, de 2,7 GB y 2,8 GB respectivamente y marcadas como "fast, recommended" por el autor, caben en GPUs de 6-8 GB. La version f16, de 8,5 GB, requiere 10-12 GB de VRAM para operar con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python son compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI serian las opciones habituales, aunque no se han validado en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Karar-4B-GGUF | 4,2 mil millones | No disponible | GGUF | Apache 2.0 | Cuantizaciones del modelo Karar-4B; 13 variantes mas mmproj |
| mertkayacs/Karar-4B | No disponible (modelo base) | No disponible | transformers / safetensors | Apache 2.0 | Modelo original sin cuantizar; misma funcionalidad |
| mradermacher/manu-s1-4b-GGUF | Tamano aproximado de 4B (no confirmado) | No disponible | GGUF | Apache 2.0 | Otro modelo de decision del mismo cuantizador, orientado a sistema legal en India y con etiqueta jevk5 |

No se dispone de datos de rendimiento comparativo entre estas opciones. Las alternativas incluidas comparten categoria por tamano y por proposito declarado (modelos de decision), no por resultados medidos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que permita estimar la calidad del modelo en tareas concretas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- La cuantizacion puede degradar la calibracion. Este es un punto critico en un modelo cuyo proposito declarado es la prediccion conformal: los metodos de cuantizacion alteran la distribucion de probabilidades de salida, por lo que los umbrales calibrados sobre el modelo original no son necesariamente validos sobre las versiones GGUF. Se recomienda recalibrar sobre la cuantizacion concreta que se vaya a usar.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable, como reconoce el propio autor al marcar Q3_K_M como "lower quality".
- Riesgo de alucinacion: no documentado, pero inherente a cualquier modelo generativo de 4B parametros. En tareas de decision, una alucinacion puede traducirse en una clasificacion incorrecta con apariencia de seguridad.
- Cobertura linguistica limitada: solo turco e ingles. El castellano no esta declarado como idioma soportado, por lo que su comportamiento en espanol es desconocido.
- Longitud de contexto desconocida: no se puede planificar el uso en escenarios que requieran ventanas largas sin validacion previa.
- Sesgos: no hay informacion publicada sobre composicion del dataset de entrenamiento ni sobre analisis de sesgos, por lo que no es posible evaluar su comportamiento diferencial por subgrupos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de mantener el aviso de licencia y el fichero de cambios. No impone restricciones de uso adicionales segun la informacion disponible.
- Validacion de la comunidad practicamente nula: el repositorio registra 0 descargas y 0 "me gusta" en los metadatos facilitados, y se creo y actualizo el mismo dia, por lo que no existe retroalimentacion de terceros sobre su funcionamiento.
- Documentacion incompleta: la model card se limita a listar los ficheros cuantizados y no describe el modelo, su entrenamiento ni sus limitaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Karar-4B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Karar-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Karar-4B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Catalogo de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
- Modelo comparable del mismo cuantizador: https://huggingface.co/mradermacher/manu-s1-4b-GGUF
