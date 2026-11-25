# orz99/DiarizationLM-Gemma-4-12B-v1-GGUF

## Resumen

DiarizationLM-Gemma-4-12B-v1-GGUF es la version cuantizada en formato GGUF del modelo DiarizationLM-Gemma-4-12B-v1, publicado por el usuario orz99 en Hugging Face. El modelo original, desarrollado por la comunidad diarizers-community, es un modelo especializado en diarizacion de hablantes (speaker diarization) construido sobre la arquitectura Gemma 4 de Google. La diarizacion de hablantes consiste en identificar y segmentar quien habla en cada momento dentro de una grabacion de audio, una tarea fundamental en transcripcion de reuniones, analisis de llamadas y generacion de subtitulos.

El modelo cuenta con 11.907.350.576 parametros totales (aproximadamente 12B) y esta disenado para tareas de diarizacion con soporte de contexto largo y multiples hablantes. La version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en safetensors. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta Q8_0, ademas de ficheros mmproj (multi-modal supplement) que sugieren capacidades de procesamiento de audio o vision integradas.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de diarizacion de 12B en entornos con recursos limitados, manteniendo la licencia Apache 2.0 del modelo base. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (no se detalla variante exacta) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona "long-context" sin cifra) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, un transformer decoder-only. La model card del repositorio GGUF no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismos de atencion ni sobre el proceso de entrenamiento del modelo original. El nombre "DiarizationLM" sugiere que el modelo ha sido adaptado especificamente para la tarea de diarizacion de hablantes, probablemente mediante fine-tuning del modelo Gemma 4 base sobre datos de audio etiquetados con hablantes.

La presencia de ficheros mmproj indica que el modelo incorpora un proyector multi-modal, lo que es coherente con un modelo que procesa audio (o representaciones de audio) ademas de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo base fue publicado por diarizers-community y la cuantizacion fue realizada por mradermacher, segun los metadatos de la model card.

## Capacidades

- Diarizacion de hablantes: identificacion y segmentacion de multiples hablantes en grabaciones de audio.
- Procesamiento de contexto largo: la model card etiqueta el modelo como "long-context" y "multi-speaker", aunque no se especifica la ventana exacta.
- Procesamiento multi-modal: los ficheros mmproj-f16 y mmproj-Q8_0 indican soporte de entrada multi-modal (probablemente audio).
- Generacion de texto conversacional: la etiqueta "conversational" sugiere capacidad de mantener dialogos.
- Soporte multilingue: la etiqueta "multilingual" aparece en los tags, pero el campo language solo declara ingles; la discrepancia no se resuelve en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio explicito: no disponible salvo la indicacion generica de multi-modalidad.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo puede segmentar quien habla en cada intervencion de una reunion grabada, permitiendo generar actas con etiquetas de participante. Su ventana de contexto larga (segun la model card) facilita procesar sesiones extensas sin fragmentacion excesiva.
- Analisis de llamadas de atencion al cliente: en un contact center, el modelo permitiria separar las intervenciones del agente y del cliente para calcular tiempos de habla, detectar solapamientos y evaluar la calidad del servicio.
- Generacion de subtitulos para contenido multimedia: aplicable a podcasts, entrevistas y videos donde varias personas hablan; la diarizacion permite etiquetar cada subtitulo con el hablante correspondiente.
- Investigacion cualitativa y transcripcion de entrevistas: en estudios academicos con entrevistas semiestructuradas, el modelo separa entrevistador y entrevistado, agilizando el analisis posterior y la codificacion de respuestas.
- Sistemas de documentacion clinica: en entornos sanitarios, la diarizacion de consultas medico-paciente permite estructurar la transcripcion por roles, facilitando la generacion de resumenes clinicos con atribucion correcta.
- Moderacion y analisis de debates o mesas redondas: en retransmisiones con multiples participantes, el modelo permite identificar turnos de palabra, medir participacion por hablante y detectar interrupciones.
- Despliegue en entornos con GPU de consumo: gracias a las cuantizaciones Q4_K_M (~7,5 GB) y Q5_K_M (~8,6 GB), el modelo puede ejecutarse en estaciones de trabajo con una unica GPU consumer, lo que facilita prototipado local sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_S: ~5,6 GB
  - Q3_K_M: ~6,2 GB (calidad inferior segun la model card)
  - Q3_K_L: ~6,7 GB
  - IQ4_XS: ~6,8 GB
  - Q4_K_S: ~7,1 GB (rapido, recomendado)
  - Q4_K_M: ~7,5 GB (rapido, recomendado)
  - Q5_K_S: ~8,4 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB (muy buena calidad)
  - Q8_0: ~12,8 GB (rapido, mejor calidad)
  - mmproj-f16: ~0,2 GB; mmproj-Q8_0: ~0,3 GB (suplemento multi-modal)
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar sin problemas Q8_0 con contexto amplio; una RTX 3090 (24 GB) o RTX 4080 (16 GB) cubren Q5_K_M y Q6_K con margen; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) pueden ejecutar Q4_K_M o Q5_K_S con contexto moderado.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM para cuantizaciones Q4 e inferiores; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA. No se menciona soporte explicito de vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas plausibles de la misma categoria (modelos de diarizacion o modelos genericos de ~12B cuantizados en GGUF), marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-12B-v1-GGUF (este) | ~11,9B | no disponible (etiquetado long-context) | Apache 2.0 | GGUF | Diarizacion de hablantes |
| Modelos de diarizacion clasicos (p. ej. pyannote) | variable, tipicamente <1B | no aplica (segmentacion) | variable | PyTorch | Diarizacion end-to-end |
| Gemma 4 base (12B) | ~12B | no disponible | Gemma license | safetensors, GGUF | Proposito general |
| Modelos LLM genericos de ~12B en GGUF | ~7-14B | variable | variable | GGUF | Generacion de texto |

La comparativa con benchmarks de calidad de diarizacion (DER, diarization error rate) no esta disponible para este modelo.

## Limitaciones y advertencias

- Solo declara soporte de ingles en el campo language, aunque los tags incluyen "multilingual"; no hay evidencia de calidad en otros idiomas.
- No se han publicado benchmarks de diarizacion (DER, JER) ni de generacion, por lo que el rendimiento real es desconocido.
- La model card no detalla el dataset de entrenamiento, lo que impide evaluar sesgos demograficos, acusticos o de dominio (por ejemplo, sesgo hacia determinados acentos o calidades de grabacion).
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de diarizacion puede asignar hablantes incorrectos o inventar segmentos si el audio es ambiguo.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- El modelo base y la cuantizacion son de terceros (diarizers-community y mradermacher); la trazabilidad del proceso de fine-tuning no esta documentada en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo Gemma 4 subyacente, ya que las licencias de los modelos base de Google pueden imponer restricciones adicionales.
- Los ficheros mmproj indican multi-modalidad, pero no se especifica que modalidad exacta ni como invocarla en llama.cpp.
- El contexto real no esta cuantificado; "long-context" es una etiqueta sin cifra verificable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/orz99/DiarizationLM-Gemma-4-12B-v1-GGUF
- Modelo base: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-12B-v1
- Repositorio del cuantizador (mradermacher) para este modelo: https://huggingface.co/mradermacher/DiarizationLM-Gemma-4-12B-v1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DiarizationLM-Gemma-4-12B-v1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
