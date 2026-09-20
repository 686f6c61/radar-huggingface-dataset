# mradermacher/ndizi-gemma4-e2b-african-asr-merged-GGUF

## Resumen

El modelo `mradermacher/ndizi-gemma4-e2b-african-asr-merged-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `smutuvi/ndizi-gemma4-e2b-african-asr-merged`, un sistema de reconocimiento automatico del habla (ASR) orientado a lenguas africanas. El repositorio lo publica mradermacher, cuenta conocida por generar versiones cuantizadas estaticas de modelos abiertos para su uso con llama.cpp y otros runners compatibles con GGUF.

Se trata de un modelo de aproximadamente 4.647.450.147 parametros (unos 4,65 mil millones) segun los pesos en safetensors del modelo base, con licencia Apache 2.0 y soporte declarado para tres idiomas: suajili (`sw`), amharico (`am`) y oromo (`om`). Los tags del repositorio indican que deriva de la familia Gemma y que es un modelo multimodal (incluye ficheros `mmproj`, el proyector que permite procesar entrada de audio/imagen en llama.cpp), aunque la model card del cuantizador no documenta la arquitectura interna ni el contexto maximo.

Su relevancia actual radica en dos factores: por un lado, cubre idiomas con muy poca representacion en herramientas ASR comerciales; por otro, ofrece versiones que caben en GPU de consumo (desde 3,1 GB en Q2_K hasta 9,4 GB en f16), lo que facilita el despliegue local en entornos con recursos limitados. No se han publicado resultados de benchmarks ni metricas de error (WER/CER) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican familia Gemma y modalidad multimodal; la model card no detalla la arquitectura) |
| Parametros totales | 4.647.450.147 (~4,65 B) segun safetensors del modelo base |
| Parametros activos | no disponible (no se documenta que emplee arquitectura MoE ni activacion selectiva de parametros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas proyector multimodal mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | suajili (sw), amharico (am), oromo (om) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tarea declarada | ASR / reconocimiento de voz (tag `asr`, `speech`) |
| Repositorio completo | 49,6 GB (suma de todas las cuantizaciones) |
| Cuantizacion ponderada (imatrix) | no disponible; solo se publican cuantizaciones estaticas |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base: no se especifica si se trata de un transformer denso, un diseno hibrido, ni el mecanismo de atencion empleado. Los metadatos de la model card si revelan dos rasgos estructurales relevantes: el tag `gemma` apunta a que deriva de la familia Gemma, y la presencia de ficheros `mmproj` (multi-modal projector) confirma que el modelo integra un codificador adicional cuya salida se proyecta al espacio del modelo de lenguaje, siguiendo el esquema habitual de llama.cpp para modelos multimodales con entrada de audio.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El nombre del modelo (`gemma4-e2b`) sugiere una variante de parametros efectivos reducidos, pero esta interpretacion no queda confirmada en la informacion disponible y no debe tomarse como especificacion tecnica. La unica innovacion verificable en este repositorio concreto es la publicacion de cuantizaciones estaticas optimizadas para inferencia local, con el aviso explicito del autor de que no hay cuantizaciones ponderadas (imatrix) planificadas por el momento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en suajili, amharico y oromo, segun los idiomas declarados en los metadatos.
- Procesamiento multimodal: los ficheros `mmproj` indican soporte de entrada de audio (y potencialmente de imagen) en llama.cpp; la model card no detalla la combinacion exacta de modalidades.
- Salida conversacional: el tag `conversational` sugiere que el modelo puede generar respuestas en formato de dialogo ademas de transcripciones.
- Compatible con `endpoints_compatible`, es decir, puede servirse detras de endpoints compatibles con la API de transformers en infraestructuras de inferencia gestionadas.
- Capacidades multilingues limitadas a los tres idiomas declarados; no se documenta soporte de otros idiomas africanos ni de lenguas europeas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode, generacion de codigo, matematicas o vision) mas alla de lo implicito en el proyector multimodal.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en suajili: el modelo puede convertir audio de centros de contacto en Kenia o Tanzania en texto para analitica posterior, algo poco cubierto por herramientas ASR genericas.
- Subtitulado automatico de contenido audiovisual en amharico: util para medios etiopes que necesitan subtitulos en su propio idioma sin depender de servicios en la nube con coste por minuto.
- Documentacion clinica dictada en oromo: transcripcion local de notas medicas en entornos con conectividad limitada, desplegando la cuantizacion Q4_K_M en una estacion de trabajo con GPU modesta.
- Asistentes de voz para servicios publicos: integracion del modelo como capa ASR en sistemas de informacion ciudadana o lineas IVR en zonas rurales de Etiopia, Kenia o Tanzania.
- Anotacion de corpus lingüisticos: uso del modelo para pretranscribir grandes volumenes de audio de campo y reducir el trabajo manual de investigadores en documentacion de lenguas africanas.
- Accesibilidad en tiempo real: generacion de subtitulos para personas con discapacidad auditiva en eventos y aulas donde se habla suajili, amharico u oromo.
- Analisis de encuestas y entrevistas de ONG: transcripcion masiva de grabaciones de proyectos de desarrollo para su posterior procesado con tecnicas de analisis cualitativo.
- Despliegue en edge: al caber en cuantizaciones de 3,1 a 3,9 GB, puede ejecutarse en portatiles o dispositivos con GPU integrada para transcripcion offline sin enviar audio a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de error (WER, CER), comparativas con otros sistemas ASR ni evaluaciones por idioma. Los resultados de la busqueda web realizada no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector ni el coste del contexto): Q2_K ~3,1 GB; Q3_K_S ~3,2 GB; Q3_K_M ~3,3 GB; Q3_K_L ~3,4 GB; IQ4_XS ~3,4 GB; Q4_K_S ~3,5 GB; Q4_K_M ~3,5 GB; Q5_K_S ~3,7 GB; Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB.
- Proyector multimodal adicional: mmproj-Q8_0 ~0,7 GB o mmproj-f16 ~1,1 GB, que se suma a la VRAM anterior.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4 o Q5; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB permiten sin problema las versiones Q8_0 e incluso f16. Para servir varias peticiones concurrentes son preferibles A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo esta claramente orientado a ello; la cuantizacion Q4_K_M (~3,5 GB mas proyector) cabe en practicamente cualquier GPU dedicada de los ultimos cinco anos, y las versiones Q3 o Q2 pueden ejecutarse incluso en CPU con memoria suficiente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp) para los ficheros GGUF y el proyector multimodal; transformers para el modelo base en safetensors; los tags indican compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tiempo real (RTF), tokens por segundo ni latencia de transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas ASR destacados | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| ndizi-gemma4-e2b-african-asr-merged (este) | ~4,65 B | suajili, amharico, oromo | no disponible | Apache 2.0 | GGUF, safetensors |
| openai/whisper-large-v3 | ~1,55 B | multilingue (incluye suajili; cobertura limitada en amharico y oromo) | ventanas de 30 s | MIT | safetensors, GGUF, etc. |
| facebook/mms-1b-all | ~1 B | mas de 1.100 idiomas, incluye suajili, amharico y oromo | no disponible | CC-BY-NC 4.0 (no comercial) | safetensors |
| Meta SeamlessM4T v2 | no disponible | multilingue con cobertura africana parcial | no disponible | CC-BY-NC 4.0 (no comercial) | safetensors |

Nota: los datos de los modelos comparados corresponden a conocimiento general de esos proyectos, no a la informacion proporcionada en esta busqueda. La comparativa de rendimiento entre ellos no puede establecerse porque no hay metricas publicadas de este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay WER ni CER publicados, por lo que no es posible estimar la calidad real de transcripcion frente a alternativas establecidas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, se desconoce la distribucion de acentos, dialectos, genero, edad o registro de los hablantes usados, lo que puede provocar un rendimiento desigual entre variedades del suajili, el amharico y el oromo.
- Riesgo de alucinacion: como cualquier modelo generativo aplicado a ASR, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo, habla solapada o audio de baja calidad.
- Cobertura idiomatica cerrada: solo se declaran tres idiomas. No hay indicios de soporte para otros idiomas africanos (hausa, yoruba, zulu, etc.) ni para el castellano o el ingles.
- Contexto maximo no documentado: sin conocer la ventana de contexto ni la duracion maxima de audio por inferencia, el diseno de pipelines de audio largo requiere validacion empirica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se hereda del modelo base; conviene verificar que el modelo original (`smutuvi/ndizi-gemma4-e2b-african-asr-merged`) no imponga restricciones adicionales derivadas de los terminos de la familia Gemma.
- Solo cuantizaciones estaticas: el autor advierte de que no hay cuantizaciones ponderadas (imatrix) ni planes inmediatos de publicarlas, lo que puede limitar la calidad respecto a versiones optimizadas con esa tecnica.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores.
- Uso del proyector multimodal: es imprescindible descargar el fichero `mmproj` correspondiente; sin el, el modelo no procesara la entrada de audio correctamente en llama.cpp.
- Resultados de busqueda no concluyentes: las busquedas web realizadas no devolvieron informacion tecnica util sobre el modelo (unicamente resultados no relacionados), por lo que toda la ficha se basa en los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/ndizi-gemma4-e2b-african-asr-merged-GGUF
- Modelo base: https://huggingface.co/smutuvi/ndizi-gemma4-e2b-african-asr-merged
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#ndizi-gemma4-e2b-african-asr-merged-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
