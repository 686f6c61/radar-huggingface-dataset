# netease-youdao/Confucius4-R2T2-GGUF

## Resumen

Confucius4-R2T2-GGUF es la publicacion oficial en formato GGUF del modelo netease-youdao/Confucius4-R2T2, desarrollado por NetEase Youdao. Se trata de un sistema de reconocimiento automatico del habla (ASR) disenado especificamente para transcripcion en streaming en tiempo real, con baja latencia y alta precision. El modelo permite chunks de decodificacion configurables de forma granular entre 80 ms y 2 s, lo que lo sitúa en el segmento de ASR "true streaming" en lugar de los modelos de transcripcion por lotes.

El modelo cuenta con aproximadamente 1.720 millones de parametros (1,72B), un tamano contenido que lo hace desplegable en hardware de consumo. La version GGUF incluye variantes cuantizadas f16, Q8_0 y Q4_K_M, ademas de dos ficheros mmproj (proyector multimodal) que anaden un componente complementario de tipo multimodal al pipeline de inferencia.

Su relevancia actual radica en que combina un tamano moderado con latencia de decodificacion muy baja, algo poco habitual en modelos ASR de mas de mil millones de parametros. Esta publicado bajo la licencia propietaria NetEase Model Use License Agreement, con el codigo asociado bajo Apache 2.0, y esta orientado principalmente al idioma chino (zh), aunque las etiquetas del repositorio incluyen "multilingual" sin detallar el conjunto de idiomas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento automatico del habla en streaming; incluye ficheros mmproj de proyector multimodal) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72B) |
| Parametros activos | no aplica (no se ha publicado informacion que indique una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo ASR; la unidad relevante son los chunks de audio configurables de 80 ms a 2 s, no una ventana de contexto en tokens) |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M; proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | zh (chino); las etiquetas del repositorio mencionan "multilingual", pero el campo de idioma declarado es unicamente zh |
| Licencia | NetEase Model Use License Agreement (license: other); el codigo asociado se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF |

Ficheros incluidos en el repositorio:

| Fichero | Cuantizacion | Tamano | Notas |
|---|---|---|---|
| Confucius4-R2T2-f16.gguf | f16 | 3,2 GiB | mejor calidad |
| Confucius4-R2T2-Q8_0.gguf | Q8_0 | 1,7 GiB | calidad muy buena |
| Confucius4-R2T2-Q4_K_M.gguf | Q4_K_M | 1,0 GiB | rapido, menor calidad |
| mmproj-Confucius4-R2T2-f16.gguf | mmproj-f16 | 0,6 GiB | complemento multimodal |
| mmproj-Confucius4-R2T2-Q8_0.gguf | mmproj-Q8_0 | 0,3 GiB | complemento multimodal |

Las variantes de baja precision se cuantizaron a partir del GGUF f16.

## Arquitectura y entrenamiento

La informacion publicada en la model card no detalla la arquitectura interna del modelo: no se especifica si se trata de un encoder de audio acoplado a un decoder transformer, de un encoder CTC/transducer, o de una arquitectura hibrida. Tampoco se indica el numero de tokens o de horas de audio empleadas en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Todos estos datos deben considerarse no disponibles.

Lo que si se documenta es el comportamiento de inferencia: el modelo realiza decodificacion en streaming con chunks configurables entre 80 ms y 2 s, lo que permite ajustar el compromiso entre latencia y calidad de transcripcion. La presencia de ficheros mmproj (proyector multimodal) en formato GGUF sugiere que el pipeline incorpora un modulo adicional de proyeccion, presumiblemente para conectar representaciones de audio con el decoder de texto, y que dicho modulo se distribuye y cuantiza de forma independiente del modelo principal.

## Capacidades

- Reconocimiento automatico del habla en streaming en tiempo real, con decodificacion incremental en lugar de procesamiento por lotes.
- Chunks de decodificacion configurables en un rango de 80 ms a 2 s, lo que permite priorizar latencia minima o precision maxima segun el caso de uso.
- Transcripcion de audio en chino (zh) como idioma principal declarado.
- Componente multimodal adicional distribuido mediante ficheros mmproj, cuyo alcance exacto no se detalla en la informacion disponible.
- Pipeline declarado como automatic-speech-recognition, con tags de conversational y endpoints_compatible.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no aplica a un modelo de reconocimiento del habla.
- Modo "thinking", vision o audio generativo: no disponible.

## Casos de uso

- Subtitulado en directo: el modelo puede generar subtitulos incrementales para retransmisiones, videollamadas o eventos en vivo, ajustando el chunk de decodificacion a 80-200 ms para minimizar el retardo percibido por la audiencia.
- Atencion al cliente por voz: integrado en un pipeline de telefonia IP, transcribe la llamada en tiempo real con baja latencia y permite alimentar un sistema posterior de analisis o de generacion de respuestas mientras la conversacion sigue en curso.
- Transcripcion de reuniones con acta en vivo: la decodificacion en streaming permite mostrar el texto a medida que se habla, en lugar de esperar al final de la reunion, lo que habilita busquedas y anotaciones durante la propia sesion.
- Asistentes de voz embebidos: gracias a su tamano de 1,72B y a las variantes Q4_K_M (1,0 GiB) y Q8_0 (1,7 GiB), puede desplegarse en dispositivos con GPU modesta o incluso en CPU, como asistentes locales o kioscos interactivos.
- Analitica de contact center: transcripcion masiva de grabaciones en chino para extraer palabras clave, detectar incidencias y generar metricas, aprovechando la cuantizacion Q4_K_M para maximizar el throughput por GPU.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en tiempo real en aplicaciones de videoconferencia o aulas virtuales, donde la latencia de 80 ms resulta critica para la comprension simultanea.
- Moderacion y monitorizacion de audio en vivo: transcripcion continua de streams de audio para deteccion de contenido prohibido o alertas por palabras clave, con procesamiento chunk a chunk.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grandes volumenes de audio en chino para construir indices de busqueda textual sobre el contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas comparativas de WER, CER, latencia medida ni comparaciones con otros sistemas ASR, y los resultados de busqueda web no aportan datos adicionales sobre el modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar el proyector multimodal):
  - f16 (3,2 GiB): aproximadamente 4 GB de VRAM o RAM.
  - Q8_0 (1,7 GiB): aproximadamente 2,5 GB.
  - Q4_K_M (1,0 GiB): aproximadamente 1,5-2 GB.
- Si se utiliza el componente multimodal, hay que sumar 0,6 GiB (mmproj-f16) o 0,3 GiB (mmproj-Q8_0).
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM (GTX 1650 4GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). En la variante Q4_K_M es viable incluso en GPU integradas o en CPU.
- GPU de datacenter (A100, H100, L40S): sobredimensionadas para un modelo de 1,72B; su uso tendria sentido unicamente para maximizar el numero de streams concurrentes por nodo.
- Opciones de despliegue: llama.cpp / llama-server (formato GGUF nativo, con tag endpoints_compatible que apunta a una API compatible con OpenAI). El soporte en vLLM, TGI u Ollama para este modelo concreto no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El fabricante declara chunks de decodificacion de 80 ms a 2 s, pero no publica cifras de latencia extremo a extremo ni de factor de tiempo real (RTF) medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-R2T2-GGUF | 1,72B | Streaming, chunks de 80 ms a 2 s | zh (etiqueta multilingual sin detallar) | NetEase Model Use License Agreement | HuggingFace, ModelScope, GGUF |
| OpenAI Whisper large-v3 | 1,55B | No nativo en streaming (requiere wrappers tipo whisper-streaming) | Multilingue (99 idiomas declarados) | MIT | HuggingFace, multiples runtimes |
| Paraformer (Alibaba FunASR) | no disponible con precision en la informacion consultada | Streaming y no streaming | Principalmente zh | Apache 2.0 (segun publicacion habitual del proyecto) | ModelScope, FunASR, ONNX |
| Zipformer streaming (k2-fsa / icefall) | no disponible con precision en la informacion consultada | Streaming nativo | Mayoritariamente zh y en | Apache 2.0 | GitHub, sherpa-onnx |

Nota: los datos de los modelos comparativos corresponden a informacion publica general de cada proyecto y no a una evaluacion comparativa realizada con Confucius4-R2T2. No se dispone de resultados de WER comparados entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- Idioma: el unico idioma declarado oficialmente es el chino (zh). Aunque las etiquetas incluyen "multilingual", no hay lista de idiomas adicionales ni evaluacion publicada, por lo que no debe asumirse un rendimiento multilingue fiable.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de error, sustituciones o inserciones espurias en condiciones de ruido, acentos o audio solapado.
- No se han publicado resultados de benchmarks (WER/CER) ni evaluaciones independientes en la informacion disponible.
- Licencia: NetEase Model Use License Agreement (license: other). Es una licencia propietaria, no una licencia open source; antes de un uso comercial es imprescindible revisar el texto completo enlazado en el repositorio, ya que puede incluir restricciones de uso, atribucion o limites de despliegue.
- El codigo asociado se distribuye bajo Apache 2.0, pero esa licencia no cubre los pesos del modelo.
- Compatibilidad de runtime: al ser GGUF, depende de que el runtime (llama.cpp y derivados) soporte la arquitectura concreta de este modelo ASR y su proyector multimodal. No se confirma compatibilidad con vLLM, TGI u Ollama.
- Los ficheros mmproj deben emparejarse con la variante de cuantizacion adecuada; mezclar cuantizaciones distintas puede degradar los resultados.
- Uso en produccion: al no haber cifras publicadas de latencia extremo a extremo ni de throughput, es necesario realizar una validacion propia con el hardware y el audio objetivo antes de dimensionar un despliegue.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/netease-youdao/Confucius4-R2T2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Repositorio en GitHub: https://github.com/netease-youdao/Confucius4-R2T2
- README en chino: https://github.com/netease-youdao/Confucius4-R2T2/blob/master/README.zh.md
- Licencia del modelo: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
- Licencia del codigo (Apache 2.0): https://github.com/netease-youdao/Confucius4-R2T2/blob/master/LICENSE
- Demo online: https://r2t2.youdao.com/demo
- ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-R2T2
- Sitio web del proyecto: https://r2t2.ai/
