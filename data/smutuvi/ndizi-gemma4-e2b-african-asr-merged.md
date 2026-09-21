# smutuvi/ndizi-gemma4-e2b-african-asr-merged

## Resumen

Ndizi Gemma4 E2B African ASR es un modelo de reconocimiento automatico del habla (ASR) obtenido por ajuste fino supervisado de Sunbird/Sunflower-Gemma4-E2B, un modelo de la familia Gemma adaptado a audio. Lo publica el usuario smutuvi en Hugging Face bajo licencia Apache 2.0 y esta especializado en tres lenguas africanas: suajili (sw), amharico (am) y oromo (om). El nombre del repositorio incluye el sufijo "merged", lo que indica que los pesos publicados son el resultado de fusionar los adaptadores de ajuste fino con el modelo base, de modo que puede cargarse directamente sin necesidad de aplicar LoRA por separado.

El modelo cuenta con 5.123.178.051 parametros (unos 5,12 mil millones) almacenados en safetensors, con un tamano de repositorio de 10,3 GB, coherente con pesos en precision de 16 bits. Se distribuye sin cuantizaciones alternativas publicadas (no hay GGUF ni GPTQ en el repositorio) y con una unica revision, creada y actualizada el 20 de septiembre de 2026. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

Su relevancia es acotada pero especifica: cubre un nicho con poca oferta de modelos publicos, el ASR para lenguas africanas de bajos recursos, y lo hace apoyandose en un modelo multimodal de tamano medio que puede desplegarse en una GPU profesional o de gama alta de consumo. No obstante, los propios resultados de WER declarados por el autor muestran un rendimiento heterogeneo, con tasas de error altas fuera del dominio de entrenamiento, especialmente en oromo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiquetado como gemma4 (variante E2B) sobre la base Sunbird/Sunflower-Gemma4-E2B, ajustado para entrada de audio |
| Parametros totales | 5.123.178.051 |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (sin GGUF/GPTQ/AWQ) |
| Idiomas soportados | Suajili (sw), amharico (am), oromo (om) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tarea | Reconocimiento automatico del habla (ASR) |
| Tamano del repositorio | 10,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo parte de Sunbird/Sunflower-Gemma4-E2B, un modelo de la familia Gemma orientado a tareas de voz, y se ha ajustado de forma supervisada para transcripcion en tres lenguas. La model card no especifica la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, tipo de encoder de audio ni si emplea atencion lineal o hibrida), por lo que estos detalles no estan disponibles. El sufijo "merged" indica que los pesos publicados integran los adaptadores del ajuste fino, aunque no se documenta si el metodo fue LoRA, QLoRA u otro.

Los datos de entrenamiento declarados son: smutuvi/ndizi-1 y smutuvi/ndizi-1-2025 (suajili, en dominio), nickdee96/ALFFA-Swahili-News y Sunbird/salt (suajili), hadamard-2/alffa-amharic, snapwre/amharic-speech y google/WaxalNLP amh (amharico), y google/WaxalNLP orm junto con turiabu/Sagalee (oromo). No se indica el numero total de horas de audio, la composicion porcentual por idioma ni si se aplicaron tecnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO u otro ajuste por preferencias, algo poco habitual en tareas de ASR. El modelo se invoca mediante prompts de texto especificos por idioma, lo que sugiere una formulacion generativa de la transcripcion (speech-to-text con instruccion) en lugar de un cabezal CTC clasico.

## Capacidades

- Transcripcion de voz a texto en suajili, amharico y oromo, con prompt de instruccion especifico por idioma.
- Procesamiento de audio como entrada y generacion de texto como salida (modelo multimodal, no solo texto).
- Salida controlada por prompt: los prompts documentados solicitan explicitamente que la respuesta sea unicamente el texto transcrito ("WaxalNLP"-style prompting no, sino instrucciones como "Dubbii kana Afaan Oromootiin barreessi. Barreeffama qofa baasi."), lo que permite condicionar el formato de salida.
- Adaptacion a distintos registros dentro de cada idioma: noticias (ALFFA-Swahili-News), corpus generales y datos propios del autor.
- No se declara soporte de tool calling, function calling ni uso como agente.
- No se declara modo de razonamiento explicito (thinking mode), ni capacidades de vision, traduccion, diarizacion de hablantes, marcas de tiempo ni deteccion de idioma automatica.
- Capacidad multilingue limitada estrictamente a los tres idiomas indicados; el suajili es el idioma con mejor cobertura de datos declarada.

## Casos de uso

- Transcripcion de archivos de audio en suajili para medios de comunicacion: el modelo puede convertir entrevistas, boletines de radio o podcasts en texto plano, con un WER declarado de 0,265 sobre FLEURS sw_ke, el mejor resultado de la ficha.
- Subtitulado de contenido en amharico: con un WER de 0,394 en FLEURS am_et, resulta util como primera pasada de transcripcion en flujos de subtitulado que despues pasan por revision humana.
- Procesamiento por lotes de corpus de investigacion en lenguas africanas: permite transcribir colecciones de audio para construir datasets de texto, aprovechando la licencia Apache 2.0 del modelo.
- Aplicaciones de dictado o notas de voz para usuarios de suajili, integrando el modelo detras de una interfaz que envie el audio en trozos y aplique el prompt "Andika maneno unayosikia katika sauti hii.".
- Evaluacion comparativa de ASR de bajos recursos: dado que el autor publica resultados sobre FLEURS y WaxalNLP, el modelo sirve como punto de referencia reproducible para investigacion en ASR africano.
- Modulo de transcripcion en pipelines de analitica de voz para ONG y programas de desarrollo en Africa Oriental, donde el suajili y el amharico son vehiculares, siempre que se asuma la tasa de error y se disponga de revision posterior.
- Base para ajuste adicional: al estar en safetensors y con licencia permisiva, puede emplearse como punto de partida para especializar en un dominio concreto (por ejemplo, terminologia medica o juridica en suajili) con un conjunto propio de audio etiquetado.

## Benchmarks y rendimiento

Los unicos resultados publicados son tasas de error de palabra (WER) sobre una prueba de humo de 10 muestras ("10-sample smoke test", version v3). Al tratarse de una muestra tan reducida, los valores tienen alta varianza y deben interpretarse con cautela.

| Conjunto de datos | Idioma | WER |
|---|---|---|
| ndizi-1 (en dominio) | Suajili | 0,595 |
| ndizi-1-2025 (en dominio) | Suajili | 0,413 |
| FLEURS sw_ke | Suajili | 0,265 |
| FLEURS am_et | Amharico | 0,394 |
| FLEURS om_et | Oromo | 0,754 |
| WaxalNLP orm | Oromo | 0,508 |
| Sagalee | Oromo | 0,737 |

Llaman la atencion dos hechos: el rendimiento es mejor en FLEURS que en los corpus propios del autor para suajili, y el oromo es claramente el idioma peor cubierto, con un WER de 0,754 en FLEURS om_et, que en la practica implica que tres de cada cuatro palabras se transcriben de forma incorrecta. No hay resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos en precision de 16 bits: 5,12 mil millones de parametros equivalen a aproximadamente 10,3 GB de pesos, lo que coincide con el tamano del repositorio. Es la unica precision publicada.
- VRAM estimada para inferencia (estimacion aritmetica a partir del numero de parametros, no confirmada por el autor): en fp16/bf16, entre 12 y 16 GB contando pesos, cache KV y activaciones; en int8, alrededor de 7-9 GB; en 4 bits, alrededor de 4-6 GB, aunque estas dos ultimas requieren cuantizar el modelo uno mismo, ya que no se publican versiones cuantizadas.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para fp16 sin restricciones. Cabe en GPUs de consumo de gama alta con al menos 16 GB de VRAM (RTX 4090, RTX 4080 Super, RTX 5080) en fp16; en tarjetas de 8-12 GB seria necesario cuantizar.
- Despliegue: al ser un modelo multimodal con entrada de audio, la ruta mas directa es la libreria transformers; no hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama, y la ausencia de GGUF impide su uso directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor), latencia por peticion ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ndizi Gemma4 E2B African ASR | 5,12 B | sw, am, om | Apache 2.0 | Safetensors | Especializado; WER 0,265-0,754 segun idioma y conjunto |
| OpenAI Whisper large-v3 | Aprox. 1,55 B | Mas de 90 idiomas | Apache 2.0 (segun su repositorio en Hugging Face) | Safetensors, GGUF en terceros | Cobertura multilingue amplia; incluye sw y am, cobertura de oromo limitada |
| Meta MMS (massively multilingual speech) | Aprox. 1 B | Mas de 1000 idiomas | CC-BY-NC 4.0 | Safetensors | Cobertura muy amplia de lenguas de bajos recursos, pero licencia no comercial |
| Sunbird/Sunflower-Gemma4-E2B | No disponible | No disponible | No disponible en esta ficha | Safetensors | Modelo base del que deriva este ajuste |

No se dispone de cifras de WER de los modelos alternativos medidas sobre los mismos conjuntos, por lo que la comparacion de rendimiento no puede establecerse con rigor a partir de la informacion disponible.

## Limitaciones y advertencias

- Tasas de error elevadas: el WER declarado va de 0,265 (FLEURS sw_ke) a 0,754 (FLEURS om_et). Incluso el mejor resultado implica aproximadamente una palabra erronea de cada cuatro, insuficiente para transcripcion automatica sin revision en la mayoria de usos profesionales.
- Prueba de evaluacion muy reducida: los WER proceden de una "smoke test" de 10 muestras, por lo que la incertidumbre estadistica es alta y los valores pueden no reproducirse en evaluaciones completas.
- Sesgo de dominio: el rendimiento en los corpus propios del autor (ndizi-1, WER 0,595; ndizi-1-2025, WER 0,413) es peor que en FLEURS, lo que sugiere una fuerte dependencia de las condiciones acusticas y de grabacion de los conjuntos de evaluacion.
- Cobertura de idiomas cerrada: solo suajili, amharico y oromo. No hay deteccion automatica de idioma ni soporte para variedades cercanas; usar el prompt equivocado degradara la salida.
- Caveat de licencia de los datos: uno de los conjuntos de entrenamiento declarados (turiabu/Sagalee, oromo) se distribuye bajo CC BY-NC 4.0, una licencia no comercial. Aunque los pesos del modelo se publican como Apache 2.0, el origen no comercial de parte de los datos es un riesgo juridico que conviene evaluar antes de un uso comercial.
- Sin informacion sobre sesgos demographics ni sobre el equilibrio de voces (genero, edad, acento, dialecto) en los datos de entrenamiento.
- Riesgo de alucinacion en audio: los modelos generativos de ASR pueden producir texto plausible que no corresponde al audio, especialmente con ruido, silencios largos o habla solapada. No hay informacion sobre marcas de tiempo ni sobre umbrales de confianza.
- Modelo sin adopcion: cero descargas y cero valoraciones, sin validacion independiente por parte de la comunidad. No hay garantia de mantenimiento ni de soporte.
- Sin cuantizaciones oficiales ni integracion documentada con servidores de inferencia de alto rendimiento, lo que complica el despliegue en produccion a escala.
- Ausencia de contexto declarado y de documentacion arquitectonica: no es posible planificar con precision la memoria, la longitud maxima de audio por peticion ni el comportamiento con audios largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smutuvi/ndizi-gemma4-e2b-african-asr-merged
- Modelo base: https://huggingface.co/Sunbird/Sunflower-Gemma4-E2B
- Conjuntos de datos citados en la model card: smutuvi/ndizi-1, smutuvi/ndizi-1-2025, nickdee96/ALFFA-Swahili-News, Sunbird/salt, hadamard-2/alffa-amharic, snapwre/amharic-speech, google/WaxalNLP, turiabu/Sagalee
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a sitios de contenido para adultos sin ninguna relacion con el modelo, por lo que se omiten. No hay papers, blogs ni repositorios adicionales disponibles.
