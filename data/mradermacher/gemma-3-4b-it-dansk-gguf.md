# mradermacher/Gemma-3-4B-it-Dansk-GGUF

## Resumen

Gemma-3-4B-it-Dansk-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo EnKop/Gemma-3-4B-it-Dansk, un ajuste fino del modelo Gemma 3 de 4 mil millones de parametros orientado al idioma danes. El trabajo de cuantizacion lo ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en HuggingFace, y esta pensado para facilitar la ejecucion del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base parte de la arquitectura Gemma 3 de Google, un transformer decoder-only de 3.880.263.168 parametros con capacidades multimodales (se incluyen ficheros mmproj para el proyector visual). El ajuste fino original, realizado por EnKop, adapta el modelo al danes, aunque la model card declara unicamente el idioma ingles en los metadatos, lo que supone una inconsistencia relevante para el despliegue.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo Gemma 3 de 4B ajustado al danes en entornos locales con recursos limitados, con un rango de cuantizaciones que va desde 1,8 GB (Q2_K) hasta 7,9 GB (f16). No obstante, la informacion publicada es escasa: no se detallan datos de entrenamiento, benchmarks ni licencia explicita, lo que limita la evaluacion rigurosa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con soporte multimodal via mmproj |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun metadatos; el ajuste fino es para danes) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tambien transformers en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3, un transformer decoder-only desarrollado por Google. La version de 4B incluye un proyector multimodal (mmproj) que permite el procesamiento de imagenes junto con texto, segun se deduce de la presencia de ficheros mmproj-Q8_0 y mmproj-f16 en el repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste fino danes.

El trabajo de mradermacher consiste exclusivamente en la cuantizacion estatica del modelo EnKop/Gemma-3-4B-it-Dansk. La model card indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion, y que el proceso de cuantizacion se realizo con quantize_version 2 y output_tensor_quantised 1, convirtiendo desde formato HuggingFace (convert_type: hf). No se documentan innovaciones tecnicas adicionales en el proceso de cuantizacion.

## Capacidades

- Generacion de texto conversacional en danes (objetivo del ajuste fino) e ingles (idioma declarado en metadatos).
- Procesamiento multimodal de imagenes gracias al proyector mmproj incluido en el repositorio.
- Razonamiento y respuesta a instrucciones, heredado de Gemma 3-it.
- Soporte de conversaciones multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling, function calling ni capacidades de agente multi-paso en la informacion disponible.
- No se documentan capacidades de audio ni modo thinking explicito.

## Casos de uso

- Asistencia conversacional en danes para atencion al cliente: el modelo puede gestionar dialogos multi-turno en danes gracias al ajuste fino, desplegado localmente con llama.cpp para evitar dependencias de la nube.
- Procesamiento de documentos con imagenes en danes: el proyector mmproj permite extraer informacion de capturas, formularios o graficos combinados con texto en danes.
- Prototipado rapido en entornos con GPU de consumo: las cuantizaciones Q4_K_M (2,6 GB) permiten ejecutar el modelo en tarjetas con 4-6 GB de VRAM, ideal para pruebas de concepto.
- Traduccion y generacion de contenido en danes: el ajuste fino especifico lo hace adecuado para redaccion de textos, resumenes y parafraseo en ese idioma.
- Despliegue en dispositivos edge o sin conexion: los ficheros Q2_K y Q3_K permiten ejecucion en hardware muy limitado, util para aplicaciones de campo o privacidad estricta.
- Integracion en pipelines de transformers: el modelo base en formato HuggingFace permite su uso con la libreria transformers para tareas de generacion condicionada.
- Educacion y experimentacion: modelo ligero para estudiar el comportamiento de Gemma 3 en un idioma de bajos recursos como el danes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 3,3-3,5 GB con Q6_K, 4,2-4,5 GB con Q8_0 y 8-9 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para f16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, desde GTX 1650 4 GB con Q2_K hasta RTX 4090 con f16. Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor por su velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base tambien es compatible con transformers y vLLM (no verificado en la informacion).
- Latencia y throughput: no disponibles. El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas, y Q8_0 como la mejor calidad con velocidad aceptable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-3-4B-it-Dansk-GGUF (este) | 3,88B | no disponible | en (ajuste danes) | no disponible | GGUF |
| Gemma-3-4B-it (base Google) | 4B | no disponible | multilingue | Gemma Terms | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3B | 32K (segun documentacion publica) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3B | 128K (segun documentacion publica) | multilingue | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se limita a parametros y disponibilidad; no se dispone de datos de rendimiento para el modelo danes que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card declara unicamente el idioma ingles, aunque el ajuste fino es para danes; esto puede indicar un error en los metadatos o una cobertura limitada del danes.
- No se especifica la licencia del modelo ni del ajuste fino, lo que impide confirmar si el uso comercial esta permitido. El modelo base Gemma 3 esta sujeto a los terminos de Google, que deben verificarse por separado.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en tareas de razonamiento complejo o con contexto largo.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso practico.
- No hay informacion sobre sesgos especificos del ajuste fino danes ni sobre la composicion del dataset de entrenamiento.
- El modelo tiene solo 56 descargas y 0 likes, lo que sugiere poca validacion por parte de la comunidad.
- No se dispone de benchmarks que permitan comparar su calidad frente a otros modelos en danes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-3-4B-it-Dansk-GGUF
- Modelo base: https://huggingface.co/EnKop/Gemma-3-4B-it-Dansk
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-3-4B-it-Dansk-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
