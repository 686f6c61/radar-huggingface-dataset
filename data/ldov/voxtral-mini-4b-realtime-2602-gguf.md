# ldov/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602-gguf es una conversión a formato GGUF del modelo de reconocimiento automático de voz mistralai/Voxtral-Mini-4B-Realtime-2602, publicada por el usuario ldov y pensada para ejecutarse con transcribe.cpp, el runtime de inferencia del proyecto handy-computer. Se trata de un modelo de voz a texto (ASR) con arquitectura nativamente en streaming: un codificador de audio causal de aproximadamente 970 millones de parámetros alimenta un decodificador Ministral de aproximadamente 3.400 millones de parámetros, con un total de 4.429.707.024 parámetros. El modelo está diseñado para transcripción en tiempo real con retardos configurables y para transcripción offline en modo precisión máxima.

Su relevancia radica en que, según la model card, es una de las primeras soluciones abiertas capaces de igualar la precisión de sistemas offline con un retardo inferior a 500 ms, lo que habilita casos como subtitulado en directo, asistentes de voz o transcripción de reuniones con latencia baja. Soporta 13 idiomas con detección automática de idioma y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial. La conversión GGUF ofrece seis niveles de cuantización (de BF16 a Q4_K_M) con una degradación de WER prácticamente nula: todas las cuantizaciones se mantienen en 2,07-2,09 % de WER en LibriSpeech test-clean.

El paquete está validado numéricamente contra la implementación de referencia de Transformers (VoxtralRealtimeForConditionalGeneration, BF16, greedy), que también obtiene 2,08 % de WER en LibriSpeech test-clean, por lo que la conversión no introduce pérdida medible de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM en streaming: codificador de audio causal de ~970 M de parametros (tallo convolucional causal con relleno a la izquierda + transformer de 32 capas con RoPE de ventana deslizante) + proyector de grupos de 4 tramas + decodificador Ministral de ~3,4 B (26 capas, GQA 32/8, RoPE NEOX) con acondicionamiento de latencia por delay-token |
| Parametros totales | 4.429.707.024 (~4,43 B; dato real del repositorio base en safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de contexto del decodificador) |
| Tipos de cuantizacion | BF16 (8,87 GB), F16 (8,88 GB), Q8_0 (4,73 GB), Q6_K (3,66 GB), Q5_K_M (3,28 GB), Q4_K_M (2,83 GB) |
| Idiomas soportados | 13 idiomas con deteccion automatica: en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base upstream esta en safetensors/BF16 |
| Entrada de audio | WAV mono a 16 kHz |
| Cadencia de emision | 1 token de texto por tramo de audio de 80 ms (12,5 Hz) |
| Retardo configurable | 240 ms a 2400 ms (2400 ms en la ruta offline orientada a precision) |
| Streaming | si (chunk configurable con --stream-chunk-ms y --stream-voxtral-delay) |
| Traduccion de voz | no |
| Deteccion de idioma | si |
| Marcas de tiempo (timestamps) | no |
| Fecha de creacion del repositorio GGUF | 2026-09-24 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es una arquitectura de audio-LLM especifica para streaming, distinta de la familia offline Voxtral 2507: usa arquitectura propia, frontend de streaming, codificador causal y fusion aditiva del audio. El codificador de audio (~970 M de parametros) parte de un tallo convolucional causal con relleno a la izquierda y 32 capas de transformer con RoPE y ventana deslizante. Un proyector agrupa las tramas de audio en grupos de 4 y las incrustaciones resultantes se suman al espacio de entrada del decodificador Ministral (~3,4 B, 26 capas, atencion GQA con 32 cabezas de consulta y 8 de clave/valor, RoPE NEOX). La latencia se controla mediante un mecanismo de delay-token que condiciona la emision, de modo que el modelo produce un token de texto por cada tramo de 80 ms de audio.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card upstream solo describe el comportamiento funcional del modelo. La conversion GGUF esta portada desde el commit upstream 2769294 (fijado el 2026-06-06) y validada contra la referencia de Transformers en el commit 483c122 de transcribe.cpp. El punto tecnicamente destacable es que las seis cuantizaciones publicadas son WER-neutral: en LibriSpeech test-clean todas quedan entre 2,07 % y 2,09 %, dentro del ruido estadistico, lo que permite desplegar la variante Q4_K_M con la misma calidad de transcripcion que BF16.

## Capacidades

- Transcripcion de voz a texto monolingue y multilingue en 13 idiomas con deteccion automatica del idioma de origen.
- Modo streaming incremental con latencia y calidad configurables mediante los parametros de tamano de bloque y retardo del decodificador.
- Modo offline con retardo de 2400 ms orientado a maxima precision (ruta empleada en las mediciones de WER publicadas).
- Emision de texto a 12,5 Hz (un token por cada 80 ms de audio), lo que permite alimentar subtitulos en directo con grano fino.
- Deteccion de idioma integrada (lang_detect: true).
- Entrada de audio estandarizada: WAV mono a 16 kHz.
- No realiza traduccion de voz (translate: false).
- No genera marcas de tiempo a nivel de palabra o segmento (timestamps: none).
- Tool calling, function calling y uso como agente multi-paso: no disponible / no documentado en la informacion proporcionada (el modelo esta orientado exclusivamente a ASR).
- Capacidades de vision o audio-vision: no disponibles.

## Casos de uso

- Subtitulado en directo: el modelo emite un token de texto cada 80 ms y admite retardos desde 240 ms, por lo que puede generar subtitulos con un desfase inferior a medio segundo en emisiones de television, streaming o eventos en vivo.
- Asistentes de voz con baja latencia: al operar en streaming con retardos configurables, se puede integrar como frontend de reconocimiento de voz en asistentes conversacionales donde el tiempo de respuesta percibido es critico.
- Transcripcion de reuniones y llamadas: en modo offline con retardo de 2400 ms el modelo prioriza precision, adecuado para actas, resumenes posteriores y analitica de conversaciones en centros de contacto.
- Accesibilidad en tiempo real: generacion de subtitulos automaticos para personas con discapacidad auditiva en aulas, conferencias o videollamadas, con entrada WAV mono de 16 kHz que se puede obtener de cualquier flujo de audio.
- Despliegue en hardware modesto: la cuantizacion Q4_K_M ocupa 2,83 GB y esta medida en un Ryzen 4750U con Vulkan, lo que permite transcripcion local en portatiles sin GPU dedicada ni envio de audio a la nube (relevante por privacidad y cumplimiento).
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta un WAV de entrada, y las mediciones de LibriSpeech test-clean se hicieron con tamano de lote 8 sobre 2620 enunciados, lo que indica viabilidad para pipelines de transcripcion masiva en servidor.
- Archivado y busqueda de contenido hablado: transcripcion de podcasts, entrevistas o grabaciones internas para indexacion posterior; al no generar timestamps, el alineado fino debe resolverse en una etapa posterior del pipeline.
- Aplicaciones multilingues en Europa: cobertura simultanea de espanol, frances, aleman, italiano, portugues, neerlandes e ingles con deteccion automatica de idioma, util para organismos y empresas con contenido en varias lenguas.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2620 enunciados, tamano de lote 8, sin timestamps, normalizador de texto ingles de Whisper, ruta offline con retardo 6, medido en una NVIDIA L40S):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 8,87 GB | 2,08 % |
| F16 | 8,88 GB | 2,09 % |
| Q8_0 | 4,73 GB | 2,07 % |
| Q6_K | 3,66 GB | 2,08 % |
| Q5_K_M | 3,28 GB | 2,08 % |
| Q4_K_M | 2,83 GB | 2,08 % |
| Referencia Transformers BF16 (greedy) | no disponible | 2,08 % |

WER y CER en FLEURS con la cuantizacion Q8_0 (metricas publicadas en los metadatos de transcribe.cpp):

| Idioma | Metrica | Valor |
|---|---|---:|
| Arabe (ar) | WER | 14,53 |
| Aleman (de) | WER | 4,24 |
| Ingles (en) | WER | 6,27 |
| Espanol (es) | WER | 2,67 |
| Frances (fr) | WER | 6,29 |
| Hindi (hi) | WER | 14,44 |
| Italiano (it) | WER | 2,25 |
| Neerlandes (nl) | WER | 6,09 |
| Portugues (pt) | WER | 3,87 |
| Ruso (ru) | WER | 5,41 |
| Japones (ja) | CER | 5,44 |
| Coreano (ko) | CER | 5,27 |
| Chino (zh) | CER | 10,41 |

Rendimiento relativo (valores RTF reportados en la model card):

| Equipo | Modo | Valor |
|---|---|---:|
| Apple M4 Max | CPU | 2,41 |
| Apple M4 Max | Metal | 6,63 |
| AMD Ryzen 4750U | CPU | 0,58 |
| AMD Ryzen 4750U | Vulkan | 0,76 |

La model card no aclara si estos valores son factor de tiempo real (menor es mejor) o multiplicador de velocidad (mayor es mejor); en ambos equipos la ruta acelerada (Metal, Vulkan) supera a la ejecucion en CPU. Esta pendiente una remedicion con retardo 30. No se han publicado resultados comparativos con otros modelos de ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + sobrecarga de contexto y buffers; estimacion a partir del tamano de archivo, no publicada por el autor): Q4_K_M ~3,5-4 GB; Q5_K_M ~4-4,5 GB; Q6_K ~4,5-5 GB; Q8_0 ~5,5-6 GB; F16/BF16 ~10-11 GB.
- GPU de centro de datos: el autor midio los WER en una NVIDIA L40S; tambien son adecuadas A100, H100 o L40S para despliegues con concurrencia.
- GPU de consumo: cabe en tarjetas de 8 GB o mas con Q4_K_M o Q5_K_M (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). F16/BF16 requiere del orden de 10-11 GB, por lo que encaja en RTX 4080/4090 o superiores.
- Apple Silicon: probado en un M4 Max con backend Metal; las cuantizaciones Q4_K_M a Q8_0 son las mas razonables para memoria unificada de 16 GB o mas.
- CPU sin GPU: el autor reporta ejecucion en un AMD Ryzen 4750U (CPU y Vulkan), lo que indica viabilidad de transcripcion local sin acelerador dedicado, especialmente con cuantizaciones de 3-5 GB.
- Opciones de despliegue: transcribe.cpp (binario transcribe-cli y libreria), compilado desde fuente con CMake. No se menciona en la informacion disponible soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes.
- Latencia: retardo configurable de 240 ms a 2400 ms segun el modo; el modo offline usa 2400 ms y el streaming permite ajustar el equilibrio latencia/calidad con --stream-chunk-ms y --stream-voxtral-delay.
- Throughput: no disponible; solo se publican los valores RTF relativos de la tabla anterior. Las pruebas de WER se realizaron con tamano de lote 8.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (GGUF de ldov) | 4,43 B | Si, retardo 240-2400 ms | 13 | Apache-2.0 | GGUF (6 cuantizaciones) | Conversion para transcribe.cpp; WER 2,07-2,09 % en LibriSpeech test-clean |
| Voxtral-Mini-4B-Realtime-2602 (mistralai, upstream) | 4,43 B | Si | 13 | Apache-2.0 | safetensors/BF16 | Modelo original; referencia BF16 con WER 2,08 % en la misma prueba |
| Voxtral 2507 (familia offline, mencionada en la model card) | no disponible | No (offline) | no disponible | no disponible | no disponible | Arquitectura distinta: sin frontend de streaming, sin codificador causal y con otro esquema de fusion de audio |
| Whisper large-v3 (referencia general de ASR abierto) | ~1,55 B (dato publico no verificado en esta busqueda) | No (ventanas de 30 s) | ~99 (dato publico) | MIT (dato publico) | safetensors, GGUF, entre otros | No se dispone de cifras comparativas verificadas en la informacion proporcionada; los datos de esta fila proceden de conocimiento publico general y no de la busqueda realizada |

No se han publicado en la informacion disponible comparativas de WER frente a otros sistemas de ASR, por lo que las diferencias de rendimiento entre las alternativas no pueden cuantificarse aqui.

## Limitaciones y advertencias

- Solo entrada de audio WAV mono a 16 kHz; cualquier otro formato requiere conversion previa (por ejemplo con ffmpeg -ar 16000 -ac 1).
- No genera marcas de tiempo (timestamps: none), lo que limita el alineado palabra a palabra y obliga a anadir una etapa externa si se necesitan subtitulos sincronizados a nivel fino.
- No traduce: transcribe en el idioma de origen, no convierte entre idiomas.
- Diferencias grandes de calidad entre idiomas: en FLEURS con Q8_0, el WER es del 2,25 % en italiano o 2,67 % en espanol, frente al 14,53 % en arabe y 14,44 % en hindi; el CER chino es del 10,41 %. El rendimiento publico solo esta verificado en detalle para ingles en LibriSpeech y para las 13 lenguas en FLEURS.
- Las cifras de WER de LibriSpeech corresponden a la ruta offline con retardo 6; hay una remedicion con retardo 30 pendiente, por lo que el rendimiento en configuraciones de latencia mas baja no esta cuantificado publicamente.
- Riesgo de alucinacion y de transcripcion erronea inherente a los modelos generativos de voz: en audio con ruido, solapamiento de hablantes, acentos no cubiertos o vocabulario tecnico puede producir texto plausible pero incorrecto. No se documentan tasas de alucinacion.
- No se documentan en la informacion disponible sesgos demograficos, acusticos o linguisticos concretos, ni evaluaciones de robustez frente a ruido.
- La ventana de contexto del decodificador no esta especificada, lo que impide estimar el limite practico de duracion de audio para una sola pasada en modo offline.
- No hay soporte documentado de tool calling, function calling, agentes ni otras capacidades mas alla del ASR.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la model card upstream para los terminos completos.
- Inconsistencia de procedencia: el repositorio analizado pertenece al usuario ldov, mientras que la tabla de descargas de su model card apunta a enlaces del repositorio handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf. Conviene verificar el origen de los pesos antes de un despliegue en produccion.
- El repositorio GGUF tiene 0 descargas y 0 likes, y un tamano total de 32,3 GB (suma de todas las cuantizaciones), senal de que es una publicacion reciente y sin validacion independiente por parte de la comunidad.
- La model card indica que las cifras sin commit asociado se publicaron antes de que se registrara la procedencia, lo que reduce la trazabilidad de algunas mediciones.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/ldov/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base upstream: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream de referencia (2769294): https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp (483c122): https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Repositorio de cuantizaciones handy-computer (enlazado desde la model card): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf
- Articulo referenciado en los tags (arXiv:2602.11298): https://arxiv.org/abs/2602.11298
- Pesos por cuantizacion:
  - BF16: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-BF16.gguf
  - F16: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-F16.gguf
  - Q8_0: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q8_0.gguf
  - Q6_K: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q6_K.gguf
  - Q5_K_M: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q5_K_M.gguf
  - Q4_K_M: https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces obtenidos corresponden a contenidos sin relacion con Voxtral ni con transcripcion de voz, por lo que no se incluyen.
