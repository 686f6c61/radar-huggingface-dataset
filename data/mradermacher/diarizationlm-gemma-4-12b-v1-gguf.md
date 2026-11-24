# mradermacher/DiarizationLM-Gemma-4-12B-v1-GGUF

## Resumen

DiarizationLM-Gemma-4-12B-v1-GGUF es una conversión a formato GGUF del modelo DiarizationLM-Gemma-4-12B-v1, publicado por el usuario mradermacher en Hugging Face. El modelo original lo desarrolla la comunidad diarizers-community y parte de una base Gemma de cuarta generación con aproximadamente 12 000 millones de parámetros (11 907 350 576 según los pesos en safetensors). El propósito declarado por el nombre es la diarización de hablantes ("DiarizationLM"), es decir, la anotación de quién habla en cada momento de una transcripción, aunque la model card disponible no detalla el pipeline ni la tarea exacta.

La relevancia de esta publicación es fundamentalmente práctica: se trata de una conversión estática de cuantizaciones que permite ejecutar un modelo de 12B en hardware de consumo mediante llama.cpp y derivados. El repositorio incluye un conjunto amplio de cuantizaciones (F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS), lo que cubre desde despliegues de alta fidelidad hasta entornos muy restringidos de memoria.

La información publicada es escasa: no se indican licencia, idiomas, pipeline ni detalles de entrenamiento. Cualquier evaluación rigurosa del modelo debe remitirse al repositorio original de diarizers-community, ya que esta ficha solo puede documentar con certeza los datos de la conversión GGUF y el recuento de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma-4 de 12B; detalles no publicados en la informacion disponible) |
| Parametros totales | 11 907 350 576 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion estatica desde safetensors del modelo original) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El nombre del modelo sugiere una base Gemma de cuarta generacion con 12B de parametros, y la tarea implicita es la diarizacion de hablantes sobre transcripciones, pero estos extremos no estan confirmados en la informacion proporcionada.

Lo unico documentado con certeza es el proceso de conversion: se trata de una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada con las herramientas habituales de llama.cpp a partir de los pesos originales en safetensors. No se indica si se preserva el proyector multimodal (skip_mmproj no especificado) ni si el vocabulario se ha modificado (vocab_type vacio).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Diarizacion de hablantes y anotacion de transcripciones, segun el nombre del modelo y el repositorio de origen (no verificado en la informacion disponible).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso via API de inferencia.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo se usaria como post-procesador de la salida de un sistema ASR para asignar cada segmento a un hablante, aprovechando su naturaleza de DiarizationLM; requiere validar previamente el comportamiento real del modelo original.
- Generacion de subtitulos etiquetados por interlocutor en contenido audiovisual: integrado en un pipeline ASR + diarizacion, permitiria producir subtitulos con identificacion de quien habla en entrevistas, podcasts o debates.
- Analisis de llamadas de atencion al cliente: la diarizacion permite separar turnos de agente y cliente para auditar guiones, medir tiempos de respuesta y detectar incidencias, siempre que la ventana de contexto del modelo sea suficiente para la duracion de la llamada.
- Documentacion clinica y actas: en entornos donde se transcriben consultas o sesiones con varios participantes, la asignacion de turnos facilita la revision posterior y el cumplimiento de trazabilidad.
- Investigacion en procesamiento de habla: el formato GGUF permite ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, lo que simplifica la experimentacion academica con cuantizaciones de 4 y 5 bits.
- Despliegue en local para privacidad de datos: al poder correr con llama.cpp u Ollama en hardware de consumo, el modelo es adecuado para organizaciones que no pueden enviar transcripciones a servicios en la nube.
- Prototipado rapido de pipelines de diarizacion: las multiples cuantizaciones permiten ajustar el equilibrio entre calidad y memoria en funcion del hardware disponible antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB en F16, 12-14 GB en Q8_0, 8-9 GB en Q5_K_M, 7-8 GB en Q4_K_M y 4-5 GB en Q2_K (estimaciones a partir del recuento de parametros; no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para F16 con contexto largo; RTX 4090 (24 GB) para Q8_0 o cuantizaciones menores; RTX 3090/4080 (16-24 GB) para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizaciones Q4_K_M o inferiores; en 6 GB con Q2_K o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de llama.cpp; la etiqueta endpoints_compatible sugiere tambien uso via endpoints alojados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-12B-v1-GGUF (este) | 11,9B | no disponible | no disponible | GGUF | Conversion estatica de diarizers-community/DiarizationLM-Gemma-4-12B-v1 |
| Gemma 2 9B (referencia de la familia) | 9B | 8K | Gemma Terms | safetensors, GGUF | Modelo generalista de Google; no especializado en diarizacion |
| Qwen2.5 14B | 14B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa generalista con contexto amplio y licencia permisiva |
| Whisper large-v3 | 1,55B | 30 s de audio | MIT | safetensors, GGUF | Sistema ASR; la diarizacion requiere un modulo adicional |

La comparacion con modelos de diarizacion especificos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible consultar el repositorio original de diarizers-community antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados; el rendimiento en castellano o en entornos multilingues es desconocido.
- No se indica la longitud de contexto, un factor critico para diarizar reuniones o llamadas largas.
- Al ser una conversion de terceros (mradermacher), no hay garantia de que las cuantizaciones preserven exactamente el comportamiento del modelo original; conviene validar con un conjunto de evaluacion propio.
- Riesgo de alucinacion y de asignacion erronea de hablantes en audio con solapamientos, ruido o voces similares: no disponible en la informacion proporcionada, pero es un riesgo inherente a la tarea.
- Sesgos conocidos: no disponibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia comunitaria de calidad ni de estabilidad.
- La fecha de creacion indicada (2026-11-24) resulta anomalica y debe tratarse con cautela al citar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DiarizationLM-Gemma-4-12B-v1-GGUF
- Modelo original: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-12B-v1
- Perfil del autor de la conversion: https://huggingface.co/mradermacher
