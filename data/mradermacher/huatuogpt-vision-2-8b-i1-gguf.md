# mradermacher/HuatuoGPT-Vision-2-8B-i1-GGUF

## Resumen
HuatuoGPT-Vision-2-8B-i1-GGUF es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo multimodal medico HuatuoGPT-Vision-2-8B, desarrollado originalmente por FreedomIntelligence. El modelo base es un vision-language model de 8.190.735.360 parametros orientado a tareas medicas, capaz de procesar imagenes (radiografias, histologia, informes escaneados) junto con texto para responder consultas clinicas, describir hallazgos o razonar sobre casos. Esta version concreta empaqueta los pesos en cuantizaciones i1 (imatrix) para su uso con llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo medico multimodal de 8B en hardware de consumo, algo impensable con los pesos en precision completa. Al estar cuantizado con imatrix (matriz de importancia calibrada), las perdidas de calidad respecto al original son menores que en cuantizaciones estaticas equivalentes. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en prototipos comerciales.

No obstante, conviene subrayar que se trata de una cuantizacion de terceros, no del modelo oficial, y que la informacion publicada por el autor de la cuantizacion es minima: no se detallan datos de entrenamiento, benchmarks ni limitaciones clinicas. Esta ficha refleja exclusivamente lo disponible en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base vision-language; presumiblemente transformer multimodal, sin detalle en la informacion) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (3,4 GB), i1-IQ3_M (4,0 GB), i1-Q4_K_S (4,9 GB); el autor menciona ademas IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K en el catalogo de quants |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado de 0,1 GB) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base HuatuoGPT-Vision-2-8B: no se especifica si emplea un transformer denso con adaptador visual, un esquema tipo LLaVA, Qwen-VL o similar, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus medico, uso de RLHF o DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado cuantizaciones i1 (imatrix) a partir de los pesos originales en safetensors, empleando un fichero imatrix de calibracion de 0,1 GB. Las cuantizaciones i1 suelen preservar mejor la perplejidad que las estaticas a igual tamano, especialmente en modelos medicos donde ciertos terminos tecnicos son sensibles a la cuantizacion. El repositorio incluye tambien un repositorio hermano de cuantizaciones estaticas (mradermacher/HuatuoGPT-Vision-2-8B-GGUF) donde, segun la model card, se alojan los ficheros mmproj necesarios para la parte visual.

## Capacidades
- Generacion de texto y razonamiento sobre contenido clinico en ingles.
- Procesamiento de imagenes medicas (vision-language): el modelo base es multimodal y el repositorio indica que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso
- Analisis de radiografias en prototipos de investigacion: cargando el GGUF con llama.cpp y el mmproj correspondiente, el modelo puede recibir una imagen y una pregunta en ingles para generar una descripcion de hallazgos, util para validar pipelines de vision medica antes de invertir en modelos mayores.
- Asistencia en educacion medica: estudiantes pueden plantear casos con imagenes (laminas histologicas, ecografias) y obtener explicaciones en ingles; el tamano de 8B permite desplegarlo en un portatil con GPU de gama media.
- Triaje documental: procesar informes escaneados y extraer resumenes estructurados en ingles, integrable en un flujo local sin enviar datos clinicos a la nube.
- Investigacion en NLP medico: servir como baseline cuantizado para comparar tecnicas de prompting o de adaptacion sobre modelos medicos de 8B.
- Despliegue en entornos con recursos limitados: las cuantizaciones i1-Q4_K_S (4,9 GB) caben en GPUs de 8 GB, lo que permite montar demos de vision medica en estaciones de trabajo modestas.
- Evaluacion de robustez de cuantizaciones: comparar las salidas de i1-Q2_K, i1-IQ3_M e i1-Q4_K_S frente al modelo original para medir la degradacion en terminologia clinica.
- Prototipos de chatbot medico en ingles: usar el tag `conversational` para construir un asistente multi-turno de demostracion, siempre con supervision humana y sin uso diagnostico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas (MMLU, MedQA, VQA-RAD, SLAKE u otras) ni comparaciones con el modelo original.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3,4 GB con i1-Q2_K, 4,0 GB con i1-IQ3_M y 4,9 GB con i1-Q4_K_S, a los que hay que sumar la memoria del proyector visual (mmproj) y el contexto KV, por lo que conviene reservar entre 1 y 3 GB adicionales segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con i1-Q4_K_S y contexto moderado; con 6 GB conviene bajar a i1-IQ3_M o i1-Q2_K.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y LM Studio (importando el GGUF), y servidores compatibles con la API de llama.cpp; vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HuatuoGPT-Vision-2-8B-i1-GGUF (este) | 8,19 B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion de terceros, solo ingles |
| HuatuoGPT-Vision-2-8B (original) | 8,19 B | no disponible | Apache 2.0 | safetensors | Pesos completos, referencia de calidad |
| HuatuoGPT-Vision-2-8B-GGUF (estatico) | 8,19 B | no disponible | Apache 2.0 | GGUF (Q4_K_M, etc.) | Incluye ficheros mmproj para vision |
| Otros VLM medicos de ~7-8B | no disponible | no disponible | variable | variable | Sin datos en la informacion para comparar rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias
- Modelo de investigacion, no dispositivo medico: no debe usarse para diagnostico, triaje clinico ni decision terapeutica sin validacion regulatoria y supervision profesional.
- Riesgo de alucinacion elevado en dominio medico: la model card no documenta evaluaciones de fidelidad ni tasas de error en hallazgos radiologicos.
- Solo ingles: la model card declara el idioma `en`; el uso en castellano no esta soportado oficialmente.
- Cuantizacion de terceros: las cuantizaciones i1 pueden degradar terminologia clinica precisa; se recomienda validar contra el modelo original antes de produccion.
- Sin datos de sesgos: no se documentan sesgos demograficos, de equipamiento imagenologico ni de poblacion.
- Contexto desconocido: al no publicarse la longitud de contexto, el diseno de pipelines multi-turno o con imagenes de alta resolucion requiere pruebas empiricas.
- La parte visual depende del fichero mmproj alojado en el repositorio estatico; sin el, el GGUF solo funciona como modelo de texto.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del uso clinico recae en el integrador.

## Enlaces
- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/HuatuoGPT-Vision-2-8B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/HuatuoGPT-Vision-2-8B-GGUF
- Modelo base original: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-8B
- Pagina de descargas del autor: https://hf.tst.eu/model#HuatuoGPT-Vision-2-8B-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
