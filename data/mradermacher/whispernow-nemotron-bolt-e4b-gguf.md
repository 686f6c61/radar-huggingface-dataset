# mradermacher/whispernow-nemotron-bolt-e4b-GGUF

## Resumen

whispernow-nemotron-bolt-e4b-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base category271/whispernow-nemotron-bolt-e4b, publicada por el usuario mradermacher. El modelo original esta orientado a tareas de dictado y limpieza de transcripciones (transcript-cleanup) dentro de un pipeline de speech-to-text, y se apoya en la familia Nemotron, segun indican las etiquetas de la model card. El repositorio cuantizado esta pensado para su uso con llama.cpp y herramientas compatibles con GGUF, no como un modelo de proposito general.

El modelo base cuenta con 7.463.013.674 parametros segun los pesos en safetensors, lo que lo situa en la franja de los 7-8 mil millones de parametros. La model card del repositorio cuantizado no detalla la arquitectura interna, la longitud de contexto ni la composicion del dataset de entrenamiento; la unica referencia a datos es el dataset category271/whispernow-cleanup. El idioma declarado es unicamente ingles (en).

La relevancia de esta publicacion es practica: ofrece el modelo en una bateria de cuantizaciones que van desde Q2_K (4,5 GB) hasta f16 (15,0 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta nemotron en la model card; sin detalle de transformer/MoE) |
| Parametros totales | 7.463.013.674 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (enlazada como license: other) |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base. La model card lo etiqueta con la familia nemotron y lo enmarca en tareas de dictado y limpieza de transcripciones, con el dataset category271/whispernow-cleanup como unico dato de entrenamiento referenciado. No se especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni se detalla el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado.

El repositorio cuantizado es una conversion estatica (convert_type: hf, quantize_version: 2) de los pesos del modelo base. El autor indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion, y que podrian no llegar a publicarse. Las cuantizaciones incluyen tanto tipos K convencionales como IQ4_XS, segun la lista de etiquetas internas de la model card.

## Capacidades

- Limpieza de transcripciones: el modelo esta orientado a tareas de transcript-cleanup, es decir, normalizar y corregir texto procedente de sistemas de reconocimiento de voz.
- Dictado: etiquetado explicitamente para flujos de dictado por voz.
- Integracion en pipelines de speech-to-text: se posiciona como componente de postprocesado del texto generado por un ASR.
- Conversacional: la etiqueta conversational sugiere uso en formato de dialogo, aunque no se detalla el formato de prompt.
- Compatibilidad con endpoints: etiqueta endpoints_compatible, lo que indica que puede servirse mediante infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Postprocesado de dictado en ingles: el modelo recibe la salida cruda de un ASR y la normaliza (puntuacion, mayusculas, correcciones gramaticales) antes de entregarla al usuario final. Es adecuado porque esta entrenado especificamente sobre el dataset whispernow-cleanup.
- Limpieza de transcripciones de reuniones: se puede encadenar tras un motor de reconocimiento de voz para producir actas legibles; su tamano de 7-8 mil millones de parametros permite ejecutarlo en local junto al ASR.
- Integracion en aplicaciones de notas de voz: con cuantizaciones Q4_K_M (5,4 GB) se puede desplegar en un portatil con GPU de consumo y procesar dictados sin enviar audio ni texto a la nube.
- Pipelines de subtitulado: como etapa de correccion de subtitulos generados automaticamente en ingles, mejorando legibilidad antes de la publicacion.
- Asistentes de escritura por voz: transcripcion de comandos o texto dictado en herramientas de productividad, con el modelo actuando como capa de saneamiento del texto.
- Despliegue en entornos con recursos limitados: las variantes Q2_K y Q3_K_S (4,5-4,7 GB) permiten ejecucion en CPU con llama.cpp para tareas de limpieza de texto por lotes donde la latencia no es critica.
- Evaluacion y experimentacion: util para investigadores que quieran probar el modelo base sin descargar los pesos completos en safetensors (el repo cuantizado ocupa 69,8 GB en total, pero cada archivo individual es mucho menor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (5,4 GB de pesos mas overhead de contexto), 4,5-5,1 GB con Q2_K/Q3_K, y 15-16 GB con f16.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4 o inferiores; las variantes Q2_K y Q3_K_S pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el formato GGUF es compatible con estos motores. No se indica compatibilidad con vLLM o TGI para estos pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (limpieza de transcripciones en ingles) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no es adecuado para dictado o limpieza de transcripciones en castellano.
- Alcance funcional: esta especializado en limpieza de transcripciones y dictado, no es un modelo de proposito general para razonamiento, codigo o matematicas.
- Datos de entrenamiento opacos: no se detalla la composicion del dataset whispernow-cleanup, lo que impide evaluar sesgos o cobertura.
- Riesgo de alucinacion: no cuantificado; en tareas de limpieza de texto, el modelo podria introducir contenido no presente en la transcripcion original.
- Licencia: openmdw-1.1, enlazada como license: other; es necesario revisar los terminos en https://openmdw.ai/license/1-1/ antes de un uso comercial.
- Madurez del repositorio: 0 descargas y 0 likes, sin cuantizaciones imatrix; no hay evidencia de uso en produccion.
- Sin benchmarks publicados: no se puede verificar la calidad de las cuantizaciones frente al modelo base.
- El repositorio cuantizado ocupa 69,8 GB en total, aunque cada archivo GGUF individual es manejable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/whispernow-nemotron-bolt-e4b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-nemotron-bolt-e4b
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Pagina de descargas del autor: https://hf.tst.eu/model#whispernow-nemotron-bolt-e4b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
