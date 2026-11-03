# mradermacher/BananaMind-V2.5-Content-Safety-GGUF

## Resumen

BananaMind-V2.5-Content-Safety-GGUF es la distribucion en formato GGUF del modelo Banaxi-Tech/BananaMind-V2.5-Content-Safety, publicada por el usuario mradermacher, especializado en cuantizacion de modelos para inferencia local. Se trata de un modelo de clasificacion de contenido y moderacion, afinado por instrucciones sobre una base de la familia Gemma (etiquetada como gemma4 en los metadatos), con 4.628.569.635 parametros totales segun los pesos en safetensors del modelo original.

El modelo resuelve el problema de la clasificacion automatica de seguridad de contenido: determinar si un texto es seguro o no y en que categoria de riesgo cae, con aplicaciones directas en moderacion de comunidades, filtrado de entradas en pipelines de generacion y revision de contenido generado por usuarios. Su relevancia practica esta en que ofrece una alternativa de pesos abiertos (licencia Apache 2.0) y ejecutable en hardware de consumo gracias a las cuantizaciones GGUF, frente a APIs propietarias de moderacion.

Esta ficha describe la version cuantizada; las especificaciones de arquitectura y entrenamiento provienen del modelo base, ya que la model card del repositorio GGUF solo documenta el proceso de cuantizacion. El repositorio tiene un tamano de 47.9 GB porque incluye todas las variantes de cuantizacion en un mismo espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma (etiqueta gemma4), afinado por instrucciones |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta gemma4 y la familia Gemma, lo que implica un transformer decoder-only con atencion causal y normalizacion RMSNorm, aunque no se confirma en la documentacion proporcionada. El modelo base esta afinado por instrucciones (instruction-tuned) y orientado a clasificacion de texto y seguridad de contenido, con la pipeline declarada como text-classification y etiquetas que tambien incluyen text-generation.

El entrenamiento del modelo base utiliza el dataset nvidia/Nemotron-3.5-Content-Safety-Dataset, segun los metadatos de la model card. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La version GGUF es una conversion estatica (convert_type: hf) con cuantizacion de tensores de salida, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades

- Clasificacion de seguridad de contenido: evalua textos y determina su nivel de riesgo o categoria de moderacion.
- Moderation y safety-classification: pensado para filtrar entradas y salidas en sistemas de generacion de texto.
- Generacion de texto: las etiquetas incluyen text-generation e instruction-tuned, por lo que puede producir respuestas textuales ademas de etiquetas.
- Conversacional: soporta formato conversacional (tag conversational).
- Compatible con endpoints: tag endpoints_compatible, lo que facilita su integracion en servicios de inferencia.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; no se declaran capacidades multimodales.

## Casos de uso

- Moderacion de comunidades en linea: el modelo se puede desplegar detras de un endpoint para clasificar comentarios y publicaciones de usuarios, marcando contenido inseguro antes de su publicacion. Su tamano de 4.6B parametros permite ejecutarlo en una GPU de consumo con cuantizacion Q4_K_M (3.5 GB).
- Filtrado de entradas en pipelines RAG: antes de enviar documentos o consultas a un LLM generativo, se puede pasar el texto por BananaMind para descartar contenido toxico o no conforme a politica, reduciendo el riesgo de que el generador amplifique material problematico.
- Revision de salidas de modelos generativos: como segunda capa de seguridad, clasificar las respuestas de un chatbot antes de mostrarlas al usuario, con latencia baja gracias a las cuantizaciones Q4 y Q8.
- Cumplimiento normativo en plataformas UGC: generar registros de clasificacion de contenido para auditoria y reporte de moderacion, usando la licencia Apache 2.0 que permite uso comercial sin restricciones de atribucion adicionales.
- Prototipado local sin dependencia de APIs: investigadores que necesitan evaluar tecnicas de moderacion pueden ejecutar el modelo con llama.cpp u Ollama en una estacion de trabajo, sin coste por token ni envio de datos a terceros.
- Clasificacion por lotes de datasets: procesar grandes volumenes de texto en pipelines offline para etiquetar corpus de entrenamiento o evaluacion, aprovechando el formato GGUF para despliegue en CPU o GPU modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.1 GB con Q2_K, 3.5 GB con Q4_K_M, 5.0 GB con Q8_0 y 9.4 GB con f16, segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M con margen para el contexto; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas. Para f16 se recomienda al menos 12 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas con cuantizaciones Q4 o Q5; en GPUs de 6 GB con Q3 o Q4_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base es compatible con transformers y con endpoints compatibles segun los tags.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BananaMind-V2.5-Content-Safety (este) | 4.6B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en moderacion, solo ingles |
| Llama Guard (variantes de Meta) | no disponible en esta ficha | no disponible | licencia comunitaria Llama | safetensors, GGUF | Referencia habitual en moderacion; requiere aceptar licencia |
| ShieldGemma (Google) | no disponible en esta ficha | no disponible | licencia Gemma | safetensors | Modelo de seguridad de la familia Gemma; condiciones de uso especificas |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar la precision de clasificacion.
- Contexto: no se ha publicado la longitud de contexto del modelo base, lo que impide garantizar el procesamiento de documentos largos.
- Alucinacion: al ser un modelo instruction-tuned con capacidad de generacion, puede producir etiquetas o justificaciones inconsistentes; se recomienda validar el formato de salida en produccion.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre un dataset de seguridad de contenido (Nemotron) puede heredar los sesgos de las politicas de moderacion de dicho dataset.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base se apoya en una arquitectura Gemma; conviene verificar las condiciones de la licencia Gemma original antes de redistribuir derivados.
- Cuantizaciones: las variantes Q2_K y Q3 pueden degradar notablemente la calidad de clasificacion; para moderacion en produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no estan disponibles en el momento de la publicacion, por lo que la calidad de las cuantizaciones pequenas puede ser inferior a la de otros repositorios.
- Estado del repositorio: 181 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BananaMind-V2.5-Content-Safety-GGUF
- Modelo base: https://huggingface.co/Banaxi-Tech/BananaMind-V2.5-Content-Safety
- Pagina de resumen del autor: https://hf.tst.eu/model#BananaMind-V2.5-Content-Safety-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-3.5-Content-Safety-Dataset
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
