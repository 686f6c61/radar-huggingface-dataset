# NealCaren/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron-3-Diarization-ONNX es una conversion no oficial a ONNX del modelo nvidia/Nemotron-3-Diarization, un diarizador de hablantes en streaming basado en arquitectura Sortformer y con aproximadamente 100 millones de parametros. La conversion la publica el usuario NealCaren y su objetivo es ejecutar el modelo fuera de PyTorch, en concreto en el navegador mediante ONNX Runtime Web, o en cualquier otro runtime compatible con ONNX. Resuelve el problema de "quien habla y cuando" sobre audio en tiempo real o grabado, con hasta ocho hablantes y una resolucion temporal de 10 ms.

El repositorio incluye tres grafos: `embed.onnx` (apilado y proyeccion de caracteristicas log-mel a embeddings de 512 dimensiones), `step.onnx` (encoder y cabezal en fp32) y `step_int8.onnx` (los mismos pesos con cuantizacion int8 dinamica), ademas del filtro mel de Slaney y el embedding de silencio aprendido que usa la cache de hablantes. El modelo original es de NVIDIA y se redistribuye bajo la misma licencia OpenMDW-1.1.

Su relevancia practica esta en el coste de despliegue: con 103 MB en int8 o 396 MB en fp32, el modelo cabe en cualquier portatil y puede ejecutarse integramente en el cliente, sin enviar audio a un servidor. En una prueba de 87 segundos con cuatro voces, la version fp32 reproduce exactamente los segmentos de la implementacion de referencia en `transformers`, y la int8 coincide en el 99,994 % de las decisiones por fotograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer en streaming (encoder transformer con cabezal de clasificacion por fotograma), exportado a grafos ONNX |
| Parametros totales | ~100 M (modelo base nvidia/Nemotron-3-Diarization) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; el modo offline usa chunks de 340 frames de embedding con 40 frames de contexto derecho |
| Tipos de cuantizacion | fp32 (`step.onnx`, 396 MB) e int8 dinamico sobre pesos (`step_int8.onnx`, 103 MB) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (declarada como `license: other` en los metadatos de HuggingFace; consultar el archivo LICENSE) |
| Formato de pesos | ONNX (`embed.onnx`, `step.onnx`, `step_int8.onnx`) mas binarios auxiliares (`mel_filters.bin`, `silence_embeds.bin`) |
| Resolucion temporal | 10 ms por decision de hablante |
| Maximo de hablantes | 8 |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | voice-activity-detection |
| Libreria | onnxruntime |
| Modelo base | nvidia/Nemotron-3-Diarization |

## Arquitectura y entrenamiento

La red se divide en dos etapas. `embed.onnx` recibe caracteristicas log-mel de forma `[1, N, 128]` y produce embeddings de forma `[1, ceil(N/8), 512]`; `step.onnx` y `step_int8.onnx` contienen el encoder y el cabezal, que transforman embeddings `[1, T, 512]` en logits de hablante `[1, 8T, 8]`. Aplicando `sigmoid` sobre esos logits se obtiene la actividad por hablante cada 10 ms, con los hablantes numerados en orden de primera aparicion en el audio.

El preprocesado no es opcional y esta fijado: audio mono a 16 kHz, pre-enfasis 0,97, STFT con `n_fft` 512, ventana Hann simetrica de 400 muestras centrada en 512, hop 160, `center=True` con relleno de ceros, espectro de potencia, banco de filtros mel de Slaney y `log(x + 2^-24)` sin normalizacion posterior, conservando `floor(len / 160)` frames. La decodificacion en streaming requiere ademas implementar la cache de hablantes (`Nemotron3DiarizationSpeakerCache`): cache en orden de llegada de 264 frames, FIFO de 40 frames, periodo de actualizacion 300 y compresion basada en puntuaciones; las posiciones se reinician a 0 en cada paso. En modo offline, cada paso alimenta `[cache de hablante, FIFO, chunk, contexto derecho]` con chunks de 340 frames y 40 frames de contexto derecho.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o de horas de audio, ni sobre si hubo etapas de RLHF o DPO; estos datos corresponden a la model card del modelo original de NVIDIA, a la que el autor remite expresamente. La innovacion de esta publicacion es la propia conversion: exportacion a ONNX de la implementacion en `transformers` (scripts `export_onnx.py` y `quantize.py` incluidos), cuantizacion int8 dinamica y verificacion de equivalencia funcional frente a la referencia.

## Capacidades

- Diarizacion de hablantes ("quien habla cuando") en modo streaming y en modo offline, con hasta 8 hablantes simultaneos.
- Resolucion temporal de 10 ms por hablante, con salida de actividad continua que puede umbralizarse (por ejemplo, `p > 0,5`) para obtener segmentos.
- Ordenacion estable de los hablantes por su primera aparicion en el audio de entrada.
- Deteccion de actividad de voz implicita por hablante (el pipeline declarado es voice-activity-detection), util para preprocesar audio antes de un sistema ASR.
- Ejecucion en navegador con ONNX Runtime Web sobre WebGPU o WebAssembly multihilo, y en cualquier otro runtime de ONNX (Python, C++, C#, Java).
- Modo int8 para entornos con memoria limitada, con degradacion medida de 0,006 % de acuerdo por fotograma frente a fp32.
- No incluye reconocimiento de voz, traduccion, generacion de texto, tool calling ni capacidades de agente: es exclusivamente un modelo acustico de diarizacion.
- No se declaran idiomas soportados. Al depender solo de caracteristicas acusticas, el comportamiento no deberia estar ligado al idioma, pero no hay datos publicados que lo confirmen.

## Casos de uso

- Transcripcion local de entrevistas con etiquetado de hablante: es el escenario para el que se construyo la conversion. Los grafos ONNX se ejecutan en el navegador del usuario, de modo que el audio de la entrevista no sale del dispositivo; posteriormente las etiquetas temporales se cruzan con la salida de un ASR para atribuir cada fragmento de texto a un participante.
- Actas de reunion con atribucion por interviniente: con soporte para 8 hablantes y decisiones cada 10 ms, permite separar las aportaciones de cada persona en una reunion grabada y generar un resumen o acta con nombre de hablante, integrando despues un modelo de lenguaje sobre las transcripciones etiquetadas.
- Subtitulado de podcast y emisiones en directo: el modo streaming con cache de hablantes y chunks de 340 frames permite procesar audio de forma incremental, generando etiquetas de hablante que se superponen a los subtitulos segun se produce la locucion.
- Investigacion cualitativa en ciencias sociales: procesado por lotes de corpus de entrevistas semi-estructuradas para medir tiempos de habla, turnos de palabra o solapamientos entre entrevistador y entrevistado, con los datos permaneciendo en el equipo del investigador.
- Control de calidad en centros de contacto: separacion automatica de las voces de agente y cliente en llamadas grabadas para calcular tiempos de habla, interrupciones y silencios, y alimentar metricas operativas por llamada sin necesidad de infraestructura GPU dedicada.
- Preprocesado para sistemas ASR: la salida de actividad por hablante permite segmentar el audio y enviar a un modelo de reconocimiento solo los tramos con voz, reduciendo el coste de computo y mejorando la segmentacion en conversaciones con varios interlocutores.
- Accesibilidad en salas de reunion: identificacion en tiempo real de quien esta hablando para alimentar sistemas de transcripcion con etiquetas de hablante destinados a personas con discapacidad auditiva, ejecutando la inferencia en un portatil sin backend.
- Herramientas de edicion audiovisual: generacion de marcado de pistas por hablante para automatizar el corte y la asignacion de canales en flujos de postproduccion de entrevistas y programas con varios participantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo DER sobre AMI, CALLHOME o VoxConverse) en la informacion disponible, ni procede aplicar metricas de LLM como MMLU, HumanEval o GSM8K. El unico dato cuantitativo publicado es la fidelidad de la conversion frente a la implementacion de referencia en `transformers`, medida sobre un clip de prueba de 87 segundos y 4 voces:

| Prueba | Resultado |
|---|---|
| `step.onnx` + pipeline JavaScript: segmentos de habla | identicos a la referencia |
| `step.onnx` + pipeline JavaScript: decisiones por fotograma con umbral p > 0,5 | 100 % de acuerdo |
| `step_int8.onnx`: acuerdo por fotograma | 99,994 % |
| `step_int8.onnx`: limites de segmento | dentro de 10 ms respecto a la referencia |

Rendimiento observado en Chrome sobre un Apple M3 Max: `step.onnx` sobre WebGPU a aproximadamente 160 veces el tiempo real, y `step_int8.onnx` sobre WebAssembly multihilo a aproximadamente 25 veces el tiempo real. No hay cifras publicadas para GPUs de escritorio o de centro de datos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 0,4-0,5 GB con `step.onnx` en fp32 (396 MB de pesos mas activaciones) y alrededor de 0,11-0,2 GB con `step_int8.onnx` (103 MB). `embed.onnx` anade solo 2 MB.
- GPU recomendadas: no requiere GPU de centro de datos. El modelo cabe holgadamente en cualquier GPU consumer actual (RTX 3060, RTX 4070, RTX 4090) e incluso en GPUs integradas y en telefonos, dado el tamano de los grafos.
- Ejecucion en CPU: viable sin GPU. La ruta int8 sobre WebAssembly multihilo alcanza aproximadamente 25 veces el tiempo real en un M3 Max, suficiente para transcripcion por lotes y para streaming con margen.
- Navegador: funciona con ONNX Runtime Web. La ruta WebGPU requiere un navegador con soporte estable de WebGPU; la ruta WASM multihilo requiere cabeceras de aislamiento de origen cruzado (COOP/COEP) para aprovechar varios hilos. Existe una implementacion JavaScript completa de referencia de unas 250 lineas en `nealcaren/local-interview-transcriber` (`diar.js`).
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM), ONNX Runtime en Python/C++/C#/Java, y entornos compatibles con `transformers.js` segun los tags del repositorio. No aplican servidores de inferencia para LLM como vLLM o TGI, porque no es un modelo generativo de texto.
- Latencia y throughput: medidos solo en el navegador sobre M3 Max (160x tiempo real en fp32/WebGPU y 25x en int8/WASM). En GPU de escritorio o en CPU de servidor las cifras no estan disponibles.
- Nota de integracion: el modelo no incluye el front end de audio ni la cache de hablantes; hay que implementarlos alrededor de los grafos, lo que anade trabajo de ingenieria al despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/streaming | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NealCaren/Nemotron-3-Diarization-ONNX | ~100 M | streaming y offline, chunks de 340 frames, hasta 8 hablantes | ONNX fp32 e int8 | OpenMDW-1.1 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/Nemotron-3-Diarization (base) | ~100 M | streaming y offline, hasta 8 hablantes, salida de actividad por hablante o etiquetas postprocesadas | PyTorch / transformers, integrable en NeMo | OpenMDW-1.1 | HuggingFace, mantenido por NVIDIA |
| nvidia/Nemotron-3-Diarization-preview | no disponible | streaming y offline, hasta 8 hablantes, ordenados por primera aparicion | no disponible | no disponible | HuggingFace, version preview de NVIDIA |
| Otras alternativas de diarizacion (pyannote, NeMo MSDD) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La diferencia relevante entre la version ONNX y el modelo base no es de calidad, sino de portabilidad: los mismos pesos en un formato que se ejecuta sin PyTorch, con una ruta int8 que reduce el peso a la cuarta parte y permite correr el modelo en el navegador.

## Limitaciones y advertencias

- La conversion es no oficial y no la respalda NVIDIA. El autor la redistribuye bajo la misma licencia que el original, pero no hay garantia de mantenimiento ni de soporte.
- El repositorio no incluye el front end de audio ni la cache de hablantes. Sin implementar el preprocesado exacto (16 kHz, pre-enfasis 0,97, `n_fft` 512, hop 160, mel de Slaney, `log(x + 2^-24)`) y la logica de cache, las salidas no seran comparables a la referencia.
- Limite duro de 8 hablantes. En escenas con mas participantes el modelo no puede representarlos y la asignacion de etiquetas se degrada.
- Los identificadores de hablante son relativos a cada audio (orden de primera aparicion), no identidades persistentes entre grabaciones; no sirve para reconocimiento de locutor.
- No realiza reconocimiento de voz: la diarizacion debe combinarse con un ASR aparte si se necesita transcripcion textual.
- La version int8 introduce una degradacion pequena pero real (99,994 % de acuerdo por fotograma y limites de segmento dentro de 10 ms en la prueba publicada). No se han publicado mediciones con audio mas ruidoso, con solapamiento de voces o con mas de cuatro hablantes.
- No hay datos publicados sobre sesgos, idiomas, acentos, tipos de microfono o condiciones acusticas adversas en esta ficha; el autor remite a la model card original de NVIDIA para informacion de sesgo, uso previsto y seguridad.
- La licencia OpenMDW-1.1 aparece como `license: other` en los metadatos de HuggingFace y no se detallan sus terminos en la informacion disponible. Antes de un uso comercial hay que revisar el archivo LICENSE del repositorio y, en su caso, la licencia del modelo original.
- La ruta WebGPU depende del navegador y del sistema operativo; la ruta WASM multihilo exige cabeceras de aislamiento de origen cruzado. En entornos sin ninguna de las dos, el rendimiento puede caer por debajo de lo publicado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- Riesgo de alucinacion en el sentido acustico: en tramos con musica, ruido o habla muy solapada el modelo puede asignar actividad a hablantes inexistentes o fusionar voces. Cualquier sistema en produccion deberia validar los segmentos antes de actuar sobre ellos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NealCaren/Nemotron-3-Diarization-ONNX
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Version preview de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- Implementacion JavaScript de referencia (aplicacion de transcripcion de entrevistas): https://github.com/nealcaren/local-interview-transcriber
- Copia del README del modelo preview en GitHub: https://github.com/AMAImedia/Nemotron-3-Diarization-preview/blob/main/README.md
- Documentacion de ONNX Runtime Web: https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- Cobertura de prensa sobre el lanzamiento de Nemotron 3 Diarization: https://www.unite.ai/nvidia-releases-nemotron-3-diarization-open-weight-speaker-model/
- Ficha del modelo preview en exploreai.tools: https://exploreai.tools/ai-models/nemotron-3-diarization-preview
- Licencia del repositorio (OpenMDW-1.1): https://huggingface.co/NealCaren/Nemotron-3-Diarization-ONNX/blob/main/LICENSE
