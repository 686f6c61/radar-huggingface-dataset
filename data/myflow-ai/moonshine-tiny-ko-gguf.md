# myflow-ai/moonshine-tiny-ko-gguf

## Resumen

Moonshine-tiny-ko es un modelo de reconocimiento automatico del habla (ASR) especializado en coreano, desarrollado originalmente por Moonshine AI (antes Useful Sensors) dentro de la suite "Flavors of Moonshine". Esta ficha corresponde concretamente a la conversion a GGUF publicada por el usuario myflow-ai bajo el identificador `myflow-ai/moonshine-tiny-ko-gguf`, pensada para su uso con el runtime transcribe.cpp en lugar de con la libreria Transformers. El modelo base es `UsefulSensors/moonshine-tiny-ko`, fijado en el commit 80995f0 del 12 de mayo de 2026.

Se trata de un modelo encoder-decoder de tipo transformer con tan solo 27.092.736 parametros, disenado para ejecucion en dispositivos con recursos limitados (edge devices). Su rasgo arquitectonico mas caracteristico es que consume PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin transformada de Fourier de corto plazo ni banco de filtros mel, lo que reduce el preprocesado en tiempo de inferencia.

La relevancia de esta publicacion es doble: por un lado, ofrece ASR especializado en coreano en un tamano apto para microcontroladores y moviles; por otro, el empaquetado GGUF permite desplegarlo fuera del ecosistema Python con transcribe.cpp, con cuantizaciones que van de los 105 MB (F32) a los 34 MB (Q8_0) manteniendo un CER practicamente identico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de 3 capas (sin STFT ni banco de filtros mel) |
| Parametros totales | 27.092.736 (27M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de texto; decodificacion con max_length=192 tokens |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Entrada de audio | PCM crudo mono a 16 kHz |
| Salida | Solo transcripcion (sin traduccion, sin deteccion de idioma, sin marcas de tiempo) |
| Streaming | No soportado |
| Libreria | transcribe.cpp |
| Modelo base | UsefulSensors/moonshine-tiny-ko |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de 27M parametros, la misma que la de moonshine-tiny, pero afinada especificamente para coreano. La peculiaridad frente a Whisper es el frontend de audio: en lugar de convertir la onda a espectrograma mel mediante STFT, el modelo ingiere directamente muestras PCM a 16 kHz a traves de un stem compuesto por tres capas Conv1d. Esto elimina una etapa de preprocesado y reduce la latencia, algo critico en dispositivos con poca CPU. El modelo genera unicamente transcripcion: no traduce, no detecta el idioma de entrada y no produce marcas de tiempo.

La informacion proporcionada no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la evaluacion sobre FLEURS-ko (382 enunciados del split de test). El modelo forma parte de la suite "Flavors of Moonshine" descrita en el paper arXiv:2509.02523, que documenta el proceso de entrenamiento y evaluacion. La model card upstream reproduce parcialmente la model card de Whisper por compartir proposito y riesgos. No se especifica si se aplicaron etapas de RLHF o DPO, algo poco habitual en modelos ASR.

La conversion a GGUF fue realizada por myflow-ai a partir del commit upstream 80995f0 y validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 12 de mayo de 2026.

## Capacidades

- Transcripcion de audio en coreano: convierte voz en texto para un unico idioma (ko).
- Entrada directa de PCM a 16 kHz mono, sin necesidad de calcular espectrogramas mel externamente.
- Ejecucion en CPU y en GPU integrada mediante backend Vulkan, y en Apple Silicon mediante Metal.
- Compatibilidad con cuantizacion Q8_0 con degradacion minima de precision (0,01 puntos porcentuales de CER frente a F32).
- Inferencia por lotes o por utterance individual a traves de la CLI de transcribe.cpp.
- No soporta streaming: requiere el audio completo antes de transcribir.
- No soporta traduccion, deteccion de idioma ni generacion de timestamps.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles coreanas: con 34 MB en Q8_0 y ejecucion via Metal o Vulkan, el modelo cabe en el almacenamiento y la memoria de un telefono de gama media y transcribe localmente sin enviar audio a la nube.
- Subtitulado offline de contenido en coreano: aunque no genera timestamps, permite obtener el texto completo de un audio para su post-procesado y alineacion con herramientas externas.
- Asistentes de voz embebidos en dispositivos IoT: el stem Conv1d sobre PCM crudo evita cargar una libreria de procesado de senal pesada, lo que simplifica el binario desplegado en hardware con recursos limitados.
- Transcripcion de reuniones y llamadas en coreano en un portatil sin GPU dedicada: con un RTF de 153,5 en CPU sobre un Apple M4 Max (o 45,5 sobre un Ryzen 4750U), el procesado es claramente mas rapido que la reproduccion en tiempo real.
- Pipelines de analitica de voz a escala: al ser MIT y no requerir dependencias de Python, puede integrarse en servicios ligeros que procesen grandes volumenes de audio coreano en CPU.
- Prototipado e investigacion sobre ASR multilingue de bajo coste: sirve como punto de comparacion o destilacion para modelos mayores, dado su reducido tamano y su licencia permisiva.
- Aplicaciones de accesibilidad para hablantes de coreano: dictado de texto local en entornos sin conectividad, sin coste de API y con la privacidad que implica no salir del dispositivo.

## Benchmarks y rendimiento

CER medido sobre el split de test de FLEURS-ko (382 enunciados), con la decodificacion por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192).

| Cuantizacion | Tamano | CER (FLEURS-ko test) |
|---|---:|---:|
| F32 | 105 MB | 8,97 % |
| F16 | 57 MB | 8,97 % |
| Q8_0 | 34 MB | 8,98 % |
| Referencia Transformers F32 (MPS) | — | 8,99 % |

Velocidad (RTF reportado por la model card; cuanto mayor, mas rapido que el tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| Ryzen 4750U | Vulkan | 56 |
| Ryzen 4750U | CPU | 45,5 |

Segun la model card upstream, los modelos Moonshine superan en precision a modelos Whisper Tiny de tamano comparable, aunque no se aportan cifras directas de esa comparacion para la variante coreana. UsefulSensors no publica un CER por idioma para esta variante.

## Requisitos de hardware

- VRAM en Q8_0: menos de 100 MB; en F16, aproximadamente 57 MB; en F32, aproximadamente 105 MB. Cabe con holgura en cualquier GPU, integrada o dedicada.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere A100, H100 ni RTX 4090, que serian completamente sobredimensionadas.
- Consumer GPU y CPU: funciona en CPU de portatil, en GPU integradas y en moviles, segun los datos de RTF sobre M4 Max y Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), o bien Transformers en Python cargando el modelo base original. No se documenta soporte en vLLM, Ollama ni TGI.
- Latencia y throughput: el RTF reportado es muy superior a 1 en todas las plataformas probadas, lo que indica procesado mas rapido que el tiempo real. El modelo esta optimizado para dispositivos con recursos limitados.
- Preprocesado de audio: requiere convertir la entrada a WAV mono a 16 kHz con herramientas externas (por ejemplo `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---:|---|---|---|
| moonshine-tiny-ko (esta ficha) | 27M | Coreano | GGUF | MIT | Especializado en ko, sin timestamps ni traduccion |
| moonshine-tiny (base, ingles) | 27M | Ingles | Safetensors / GGUF | MIT | Misma arquitectura, distinto idioma |
| Whisper Tiny | 39M | Multilingue | Safetensors / GGUF | MIT | Frontend con espectrograma mel; la model card afirma que Moonshine supera a Whisper Tiny de tamano comparable |

No se dispone en la informacion proporcionada de numeros de CER comparativos con Whisper Tiny sobre FLEURS-ko ni de otras alternativas especificas para coreano, por lo que no se incluyen cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Modelo mono-idioma: solo reconoce coreano; no traduce ni detecta automaticamente el idioma de entrada.
- No genera marcas de tiempo, lo que dificulta la alineacion directa con subtitulos o la sincronizacion fina.
- No soporta streaming; es necesario disponer del audio completo antes de transcribir.
- Al ser un modelo de 27M parametros, su precision es limitada en audio ruidoso, con acentos marcados o vocabulario tecnico; el CER base ya ronda el 9 % en FLEURS-ko.
- Riesgo de alucinacion inherente a los modelos ASR, especialmente en segmentos con silencio, ruido musical o habla solapada.
- El autor no publica analisis de sesgos por genero, edad, dialecto o clase social; conviene auditar antes de desplegar en produccion.
- Restricciones de licencia: MIT, permisiva para uso comercial, heredada del modelo base. No obstante, conviene verificar los terminos del modelo base upstream `UsefulSensors/moonshine-tiny-ko`.
- El repositorio reporta 0 descargas y 0 likes, y un tamano de repo de 0,0 GB, lo que sugiere que los pesos no estan alojados directamente en este repositorio sino enlazados a `handy-computer/moonshine-tiny-ko-gguf`; conviene comprobar la fuente de descarga antes de integrarlo.
- La decodificacion esta limitada a `max_length=192` tokens, lo que puede truncar transcripciones de audio largo si no se segmenta previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/moonshine-tiny-ko-gguf
- Modelo base upstream: https://huggingface.co/UsefulSensors/moonshine-tiny-ko
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ko/commit/80995f0
- Paper "Flavors of Moonshine": https://huggingface.co/papers/2509.02523 (arXiv:2509.02523)
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentacion del modelo Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Repositorio Moonshine (codigo): https://github.com/moonshine-ai/moonshine
- Instrucciones de instalacion Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
