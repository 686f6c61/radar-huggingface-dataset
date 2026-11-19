# mradermacher/Qwen3.8-27B-Samantha-GGUF

## Resumen

Qwen3.8-27B-Samantha-GGUF es una coleccion de cuantizaciones estáticas en formato GGUF del modelo Lathly/Qwen3.8-27B-Samantha, publicadas por mradermacher, un conocido generador de cuantizaciones de la comunidad. El modelo subyacente es un merge de 27.320.697.856 parametros (unos 27,3 mil millones) etiquetado como qwen3_5, afinado sobre el dataset digitalpipelines/samantha-1.1-uncensored para adoptar la personalidad conversacional "Samantha" y eliminar restricciones de contenido. La ficha que nos ocupa documenta exclusivamente los ficheros GGUF, no el modelo original en safetensors.

El interes practico de este repositorio es que permite ejecutar un modelo de ~27B en hardware de consumo mediante llama.cpp y derivados, con un abanico de cuantizaciones que va de 11,0 GB (Q2_K) a 29,1 GB (Q8_0). Incorpora ademas ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere capacidad de procesamiento de vision en el modelo base, aunque la model card no detalla el proyector ni el encoder visual.

La licencia declarada es Apache 2.0 y el unico idioma listado es el ingles. El repositorio acumula 3909 descargas y 190,8 GB de tamano total, coherente con la suma de todas las variantes publicadas. No se han publicado resultados de benchmarks ni detalles de arquitectura mas alla de la etiqueta qwen3_5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta qwen3_5; sin detalle en la model card) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La etiqueta qwen3_5 sugiere una variante de la familia Qwen 3.5, pero la model card no especifica numero de capas, dimensiones ocultas, tipo de atencion ni si emplea mezcla de expertos. Tampoco se documenta la longitud de contexto nativa, dato critico para planificar el despliegue.

El modelo base Lathly/Qwen3.8-27B-Samantha es un merge afinado sobre el dataset digitalpipelines/samantha-1.1-uncensored, orientado a conversacion y a la eliminacion de rechazos de contenido. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La presencia de ficheros mmproj en las cuantizaciones indica que el modelo incorpora un proyector multimodal para entrada de imagenes, aunque se desconoce el encoder visual asociado.

Las cuantizaciones de este repositorio son estaticas (quantize_version 2, output_tensor_quantised 1) y se generaron a partir del modelo en formato Hugging Face. Existe una variante paralela con cuantizaciones ponderadas por imatrix en mradermacher/Qwen3.8-27B-Samantha-i1-GGUF, que el autor recomienda cuando se busca mayor calidad a igual tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, con una personalidad afinada sobre el dataset Samantha.
- Modo "uncensored": el afinado elimina buena parte de los rechazos de contenido del modelo original.
- Procesamiento multimodal de imagenes mediante los ficheros mmproj incluidos (Q8_0 y f16), segun la etiqueta multimodal del repositorio.
- Compatibilidad con vLLM y transformers, ademas de llama.cpp por el formato GGUF.
- Etiqueta endpoints_compatible, lo que indica que puede servirse detras de APIs compatibles con el esquema de endpoints habitual.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- Capacidad multilingue limitada al ingles segun el campo language.

## Casos de uso

- Despliegue local de un asistente conversacional: con la cuantizacion Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB o en una configuracion de dos GPU de consumo, permitiendo conversaciones multi-turno sin dependencia de la nube.
- Prototipado de personajes y agentes de rol: el afinado Samantha proporciona un tono conversacional consistente, util para experimentar con sistemas de dialogo antes de invertir en modelos mayores.
- Investigacion sobre alineacion y rechazo de contenido: al ser un modelo uncensored con licencia Apache 2.0, sirve para estudiar el comportamiento de modelos sin capas de rechazo en entornos controlados.
- Procesamiento de imagenes en local: los ficheros mmproj permiten alimentar imagenes al modelo con llama.cpp, adecuado para tareas de descripcion o extraccion de informacion visual sin enviar datos a terceros.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes de peso, lo que facilita medir la degradacion de calidad entre Q2_K y Q8_0 en un mismo modelo.
- Servicio interno de bajo coste: con vLLM y la variante Q8_0 (29,1 GB) en una unica A100 de 40 GB o H100, se puede ofrecer un endpoint compatible con OpenAI para uso interno en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~11,0 GB, Q3_K_M ~13,6 GB, IQ4_XS ~15,5 GB, Q4_K_M ~16,9 GB, Q5_K_M ~19,6 GB, Q6_K ~22,5 GB, Q8_0 ~29,1 GB. Hay que sumar el fichero mmproj (~0,7 GB en Q8_0 o ~1,0 GB en f16) si se usa la entrada multimodal, mas el espacio para la cache KV segun el contexto configurado.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S con contexto moderado; A100 40 GB o H100 para Q8_0 con contexto amplio; configuraciones multi-GPU para contextos largos.
- Cabe en GPU de consumo: si, con Q4_K_S o Q4_K_M en una RTX 4090 o 3090 de 24 GB. Las variantes Q6_K y Q8_0 requieren 24 GB o mas y dejan poco margen para cache KV.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) para GGUF; vLLM con soporte GGUF para servir en produccion; transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles. Dependeran del hardware, de la cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Samantha (este, GGUF) | ~27,3B | no disponible | Apache 2.0 | GGUF | Merge conversacional uncensored, multimodal via mmproj |
| Qwen3.8-27B-Samantha-i1-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF | Misma base con cuantizaciones imatrix, mayor calidad a igual tamano |
| Lathly/Qwen3.8-27B-Samantha | ~27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Familia Qwen 3.5 de referencia | no disponible | no disponible | variable | safetensors/GGUF | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El afinado uncensored elimina filtros de seguridad: el modelo puede generar contenido danino, ofensivo o inexacto sin advertencia, lo que exige moderacion externa en produccion.
- Riesgo elevado de alucinacion, especialmente en las cuantizaciones bajas (Q2_K, Q3_K_S) y en un modelo sin datos publicados de evaluacion.
- Idioma limitado al ingles: no se garantiza calidad en castellano ni en otras lenguas.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con documentos largos sin pruebas previas.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para uso general.
- La licencia Apache 2.0 se hereda del modelo base, pero el origen del merge y del dataset de afinado no esta auditado; conviene revisar las condiciones del modelo original antes de un uso comercial.
- El repositorio no incluye informacion sobre sesgos especificos, pero al derivar de un modelo entrenado mayoritariamente en ingles es previsible un sesgo cultural y linguistico hacia ese idioma.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Samantha-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Samantha-i1-GGUF
- Modelo base: https://huggingface.co/Lathly/Qwen3.8-27B-Samantha
- Dataset de afinado: https://huggingface.co/datasets/digitalpipelines/samantha-1.1-uncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Samantha-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
