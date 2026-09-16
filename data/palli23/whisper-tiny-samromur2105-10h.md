# palli23/whisper-tiny-samromur2105-10h

## Resumen

whisper-tiny-samromur2105-10h es un ajuste fino del modelo Whisper-Tiny (unos 37,7 millones de parametros segun los pesos en safetensors) realizado por el usuario palli23 sobre un subconjunto anidado de 10 horas del pool de escalado samromur-21.05. Se trata, por tanto, de un modelo especializado en reconocimiento automatico del habla (ASR) para islandes (codigo de idioma `is`), no de un modelo de proposito general.

El modelo forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), cuyo objetivo es estudiar como se comportan modelos ASR pequenos cuando se entrenan con cantidades controladas de datos en un idioma concreto, en comparacion con modelos multilingues mucho mayores. La model card remite explicitamente al articulo para la metodologia y los resultados de WER/CER, de modo que la ficha publica no incluye cifras de rendimiento.

Su relevancia es doble: por un lado, sirve como punto de referencia reproducible dentro de un estudio de escalado (10 horas de audio etiquetado); por otro, demuestra que un modelo de ~38 M de parametros puede desplegarse en CPU o en GPUs de gama baja con latencia muy reducida. La licencia CC BY-SA 4.0 y el hecho de que no tenga descargas ni valoraciones registradas indican que es un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-Tiny (transformer encoder-decoder para ASR, familia Whisper de OpenAI) |
| Parametros totales | 37.760.640 (37,7 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no especificados por el autor; al distribuirse en safetensors puede convertirse a float16, int8 o GGUF con herramientas externas |
| Idiomas soportados | islandes (`is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-08-29 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura de base es la de Whisper-Tiny: un transformer encoder-decoder que consume representaciones log-Mel del audio y genera tokens de texto de forma autorregresiva, con capacidad multitarea (transcripcion, traduccion, deteccion de idioma). El autor no documenta en la model card ninguna modificacion estructural sobre esa base; el unico cambio explicitado es el ajuste fino supervisado sobre datos islandeses.

El entrenamiento se realizo sobre un subconjunto anidado de 10 horas extraido del pool de escalado samromur-21.05, un corpus de habla islandesa. La palabra "nested" sugiere que los subconjuntos de distintas horas estan contenidos unos en otros, de modo que los checkpoints de 1 h, 10 h, 100 h, etc. compartan los mismos datos iniciales y permitan medir el efecto puro del volumen de datos. El modelo card no detalla el numero de pasos de entrenamiento, la tasa de aprendizaje, el esquema de aumento de datos ni si se aplicaron tecnicas de RLHF/DPO (no aplicables, en principio, a un modelo ASR). Los resultados de WER y CER, junto con la metodologia completa, se encuentran en el articulo de ICASSP 2026 citado por el autor, no en la ficha de HuggingFace.

## Capacidades

- Transcripcion de voz a texto en islandes (`is`), que es el unico idioma declarado en la model card.
- Reconocimiento de habla sobre ventanas de audio compatibles con el pipeline estandar de Whisper (segmentacion en fragmentos de hasta 30 segundos).
- Hereda de la familia Whisper las tareas auxiliares de deteccion de idioma y marcas de tiempo a nivel de segmento, aunque el ajuste fino sobre un solo idioma puede degradar el comportamiento multilingue original.
- No se documenta soporte de tool calling ni de function calling: es un modelo puramente acustico-textual.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo "thinking".
- No hay capacidades de vision, audio generativo ni texto-a-voz.
- Capacidad multilingue: no disponible; el autor declara unicamente islandes.

## Casos de uso

- Transcripcion de audio islandes a gran escala: dado su tamano de 37,7 M de parametros, puede procesar horas de audio en CPU con un coste energetico minimo, lo que lo hace util para digitalizar archivos orales en islandes.
- Investigacion sobre escalado de datos ASR: es un punto de la curva de 10 horas dentro del estudio de ICASSP 2026, util para reproducir la relacion entre horas de audio etiquetado y WER en modelos pequenos.
- Baseline en experimentos de destilacion o pruning: sirve como referencia ligera frente a la que medir el efecto de comprimir modelos ASR mayores para islandes.
- Subtitulado de videos en islandes con marcas de tiempo, generando ficheros SRT a partir del pipeline de Whisper y revisandolos posteriormente por un humano.
- Preprocesado de corpus para PLN islandes: transcripcion de entrevistas, podcasts o grabaciones de campo para construir datasets de texto anotados.
- Demo o prototipo embebido: al ocupar decimas de GB, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados (navegador con WebAssembly, moviles de gama alta) mediante whisper.cpp.
- Evaluacion comparativa de modelos ASR pequenos frente a modelos multilingues grandes, tal y como plantea el articulo asociado.
- Filtrado y busqueda por palabra clave en archivos de audio: transcripcion previa para habilitar busqueda textual sobre material sonoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los valores de WER y CER se encuentran en el articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), pero no reproduce ninguna cifra ni proporciona enlace al texto completo.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, alrededor de 150 MB solo de pesos; en float16, en torno a 75 MB; en int8, unos 38 MB. Sumando activaciones y buffers de audio, el consumo real se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. Se ha usado historicamente en GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 y H100 sin problema, aunque en estos dos ultimos el modelo esta muy infrautilizado.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable en tiempo real o casi real en procesadores de escritorio actuales, especialmente con cuantizacion int8.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), faster-whisper mediante conversion a CTranslate2, whisper.cpp previa conversion a GGUF, y servidores propios con ONNX Runtime. El soporte en TGI y Ollama para modelos Whisper no esta confirmado por el autor.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur2105-10h | 37,7 M | ventanas de 30 s (familia Whisper) | islandes | cc-by-sa-4.0 | HuggingFace, safetensors |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingue (familia Whisper) | Apache-2.0 | HuggingFace, safetensors |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (familia Whisper) | Apache-2.0 | HuggingFace, safetensors |
| Alternativas especificas para islandes | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de parametros y licencia de `openai/whisper-tiny` y `openai/whisper-small` corresponden a informacion publica de la familia Whisper; no proceden de la model card analizada. No se dispone de cifras de WER comparadas para el modelo de palli23, por lo que la comparacion en calidad queda pendiente de los resultados del articulo de ICASSP 2026.

## Limitaciones y advertencias

- Modelo mono-idioma: solo declara islandes, por lo que su uso con otros idiomas producira salidas degradadas o directamente incorrectas.
- Tamano muy reducido (37,7 M): la precision esperada es inferior a la de modelos Whisper medianos o grandes, especialmente con ruido de fondo, acentos marcados o solapamiento de hablantes.
- Riesgo de alucinacion: como todos los modelos de la familia Whisper, puede generar frases plausibles en silencios o en segmentos de audio poco inteligibles.
- Entrenado con solo 10 horas de audio etiquetado: la cobertura de vocabulario, dominios y variedades dialectales del islandes es necesariamente limitada; el rendimiento fuera del dominio de samromur-21.05 puede caer de forma notable.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios o con pesos derivados cerrados.
- Sin metricas publicadas en la model card: no hay evidencia verificable de calidad dentro de la propia ficha; hay que acudir al articulo para cualquier evaluacion.
- Sin pipeline declarado, sin descargas y sin likes: es un artefacto de investigacion sin validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (2026) poco habituales: conviene verificar la version del repositorio antes de integrarlo en un pipeline.
- Ausencia de soporte de tool calling, agentes o razonamiento: no debe utilizarse como sustituto de un LLM para tareas de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur2105-10h
- Articulo asociado: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026); no se ha proporcionado enlace en la informacion disponible
- Corpus samromur-21.05: no se ha proporcionado enlace en la informacion disponible
- Repositorio de codigo o demo: no disponible
- Otros enlaces relevantes: no disponible
