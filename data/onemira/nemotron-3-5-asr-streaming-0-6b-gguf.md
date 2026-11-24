# onemira/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

El repositorio `onemira/nemotron-3.5-asr-streaming-0.6b-gguf` es un espejo de artefactos GGUF del modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`, publicado por NVIDIA. OneMira distribuye dos ficheros: una copia byte a byte del GGUF Q8_0 oficial de NVIDIA y una variante Q4_K derivada del anterior mediante `ggml_quantize_chunk`, pensada para dispositivos moviles con 4-6 GB de memoria. El modelo base cuenta con 648.268.960 parametros (aproximadamente 0,6 mil millones) y esta orientado a transcripcion en streaming multilingue sobre dispositivo.

La relevancia de este artefacto es practica: permite ejecutar ASR en local sin subir audio a la nube, usando el runtime NeMo-Speech.cpp. OneMira lo integra en sus pipelines de transcripcion offline para escritorio (Q8_0) y para iPhone de 8 GB o mas (Q8_0) y de 4-6 GB (Q4_K). El repositorio no contiene el checkpoint de entrenamiento original, sino unicamente los ficheros GGUF seleccionados y metadatos de procedencia.

No se dispone de informacion sobre la arquitectura interna del modelo base, los datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada; esta ficha se limita a lo que documenta el autor del espejo y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de NVIDIA; detalles no publicados en la informacion disponible) |
| Parametros totales | 648.268.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (741.548.352 bytes) y Q4_K (437.002.560 bytes) |
| Idiomas soportados | no disponible en la model card del espejo (el producto asociado menciona 99 idiomas, dato no atribuible al modelo) |
| Licencia | openmdw-1.1 (Open Model Development & Use Agreement) |
| Formato de pesos | GGUF (dos ficheros: `.q8_0.gguf` y `.q4_k.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`: no se especifica si emplea un transformer encoder-decoder, un esquema streaming con atencion causal, ni el mecanismo concreto de decodificacion por bloques. El nombre del modelo indica la funcion (ASR en streaming) y el tamano (0,6 B), pero no el diseno de red.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del corpus, idiomas de entrenamiento ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en ASR, por otra parte). Lo unico verificable es el proceso de cuantizacion: el Q4_K se deriva del Q8_0 fijado a la revision `1c8deaecc64b91f034d73e08dd8b64625eb3395d` mediante `ggml_quantize_chunk`, y ambas variantes se ejecutan con el runtime NeMo-Speech.cpp. El repositorio incluye ficheros `SOURCE.json` y `SOURCE_Q4_K.json` con la trazabilidad de cada artefacto y sus hashes SHA-256.

## Capacidades

- Reconocimiento automatico del habla en modo streaming, segun el `pipeline_tag` del repositorio y la descripcion del autor.
- Transcripcion local en dispositivo sin subida obligatoria de audio a la nube.
- Ejecucion con el runtime NeMo-Speech.cpp sobre GGUF Q8_0 y Q4_K.
- Separacion de hablantes (speaker ID): mencionada en la descripcion del producto OneMira C1, no confirmada como capacidad del modelo en la informacion disponible.
- Soporte multilingue: el producto asociado declara 99 idiomas; no se detalla la cobertura real del modelo ni la lista de idiomas.
- Tool calling, function calling, agentes, vision, audio de entrada adicional, thinking mode: no disponible.

## Casos de uso

- Transcripcion offline en escritorio: cargar el fichero Q8_0 con NeMo-Speech.cpp en la aplicacion de escritorio para convertir reuniones y notas de voz en texto sin enviar audio a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Transcripcion en iPhone de gama alta: usar Q8_0 en dispositivos con 8 GB o mas de memoria para mantener la maxima calidad de cuantizacion disponible en el espejo.
- Transcripcion en iPhone de gama media: usar Q4_K (437 MB) en dispositivos de 4-6 GB, donde el Q8_0 (741 MB) resulta demasiado grande junto con el resto del stack de la aplicacion.
- Grabadoras de voz con IA: integrar el modelo en el firmware o el software companion de una grabadora fisica para transcribir en local tras la grabacion, sin cuota de minutos ni suscripcion.
- Actas de reunion y extraccion de acciones: combinar la transcripcion local con un LLM local para generar resumenes, decisiones y action items, manteniendo todo el pipeline en el dispositivo.
- Subtitulado y dictado en tiempo real: al ser un modelo de streaming, encaja en interfaces de dictado o subtitulado donde el texto debe aparecer conforme se habla, con la latencia dependiente del runtime y del hardware.
- Evaluacion de modelos ASR pequenos: servir como artefacto de referencia para comparar calidad y velocidad de Q8_0 frente a Q4_K en un mismo dispositivo antes de fijar una cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, latencia ni throughput, y los resultados de busqueda solo contienen material comercial del producto OneMira C1, no evaluaciones del modelo.

## Requisitos de hardware

- VRAM/RAM para inferencia: el Q8_0 ocupa 741.548.352 bytes (unos 707 MB) y el Q4_K 437.002.560 bytes (unos 417 MB); a esto hay que sumar el overhead del runtime NeMo-Speech.cpp y los buffers de audio.
- GPU dedicadas: no se documentan requisitos de GPU; el enfoque declarado es CPU y dispositivo movil.
- GPU de consumo: no disponible la informacion sobre compatibilidad con RTX 4090 u otras; el runtime citado no es el habitual para GPU (no se menciona CUDA).
- Dispositivos moviles: Q8_0 para iPhone con 8 GB o mas; Q4_K para iPhone con 4-6 GB, segun el autor.
- Opciones de despliegue: NeMo-Speech.cpp con GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI; llama.cpp no es el runtime indicado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| onemira/nemotron-3.5-asr-streaming-0.6b-gguf | 648.268.960 | no disponible | no disponible | openmdw-1.1 | GGUF Q8_0, Q4_K | Espejo de NVIDIA con variante Q4_K derivada |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 648.268.960 | no disponible | no disponible | openmdw-1.1 | safetensors (checkpoint original) | Modelo base; el espejo no incluye el checkpoint completo |
| Whisper small (referencia de categoria) | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible | Alternativa habitual de ASR pequeno; sin datos verificados en la informacion proporcionada |
| Alternativas ASR en GGUF para movil | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

La comparativa se limita al modelo base y a la referencia generica de categoria; no hay datos suficientes para contrastar rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene el checkpoint de entrenamiento completo, solo dos ficheros GGUF; no sirve para reentrenamiento ni ajuste fino.
- La model card no documenta idiomas, contexto, arquitectura ni metricas: cualquier decision de produccion basada en calidad debe validarse con pruebas propias.
- El Q4_K es una cuantizacion derivada por OneMira, no un artefacto oficial de NVIDIA; puede degradar la precision de transcripcion respecto al Q8_0, especialmente en audio ruidoso o acentos no cubiertos.
- El runtime requerido es NeMo-Speech.cpp; no se garantiza compatibilidad con llama.cpp, Ollama u otros motores GGUF.
- La licencia openmdw-1.1 impone terminos propios; debe revisarse el texto completo en el enlace de licencia antes de uso comercial. El espejo no implica respaldo de NVIDIA.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en ASR se traducen tipicamente en sustituciones o texto inventado en silencios y audio de baja calidad, pero no hay datos del autor al respecto.
- La mencion de 99 idiomas y de separacion de hablantes proviene de la descripcion del producto OneMira C1, no de la model card del modelo; no debe asumirse como especificacion del artefacto.
- El modelo es un espejo de terceros: la trazabilidad depende de los hashes SHA-256 publicados y de la revision upstream fijada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/1c8deaecc64b91f034d73e08dd8b64625eb3395d
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Producto OneMira C1: https://onemira.com/products/c1
- OneMira C1 en Amazon US: https://www.amazon.com/dp/B0HM6YDLJ4
- Comparativa de grabadoras de voz con IA: https://onemira.com/compare
- Guia de grabadoras sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset de TCO de grabadoras de voz con IA: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Servidor MCP OKF Wiki: https://github.com/onemira-space/okf-wiki-mcp
- Registro MCP oficial: https://registry.modelcontextprotocol.io/v0.1/servers?search=okf-wiki-mcp
- Validador OKF Markdown: https://www.npmjs.com/package/okf-markdown
- MCP Server Card: https://onemira.com/.well-known/mcp/server-card.json
- Plantillas de actas de reunion: https://onemira.com/meeting-minutes-templates
- Analisis de grabadoras IA (Mobians): https://wearemobians.com/2026/11/enregistreurs-ia-onemira-pocket-plaud/
- Demo en video del OneMira C1: https://www.youtube.com/watch?v=LUIqGIipxQs
