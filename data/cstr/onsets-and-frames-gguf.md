# cstr/onsets-and-frames-GGUF

## Resumen

Onsets & Frames — GGUF es la conversion al formato GGUF del modelo de transcripcion automatica de piano Onsets and Frames publicado por Hawthorne et al. en 2018 (arXiv:1710.11153). La conversion la firma el usuario cstr y esta pensada para el runtime ggml de CrispASR, donde ocupa la rama de transcripcion de piano. No es un modelo de lenguaje: es una red acustica de unos 26,7 millones de parametros que recibe audio y devuelve eventos de nota (inicio y altura, con una estimacion de duracion).

El interes practico de esta publicacion esta en el empaquetado: el checkpoint original se convirtio primero a ONNX y despues a GGUF, con tres cuantizaciones (f32, q8_0 y q4_0). La variante q8_0 ocupa solo 30,8 MiB y el autor documenta que es indistinguible del f32 en todas las metricas (F1 de notas 49,6 %, F1 con offsets 13,9 %, 69,0 % en piano solo), mientras que q4_0 baja a 18,6 MiB a costa de 0,1 puntos de F1 de notas y 0,5 puntos de F1 con offsets. El modelo cabe en cualquier maquina y corre en CPU a velocidad superior al tiempo real, lo que lo hace util para transcripcion offline sin GPU.

El modelo se evalua sobre las diez piezas de test de MusicNet (13.589 notas de referencia) con mir_eval.transcription, con tolerancia de 50 ms en el inicio y 50 cents de desafinacion. En ese mismo corpus, el autor situa Basic Pitch en 44,0 % global y 57,5 % en piano solo, hFT-Transformer en 52,2 % y 70,5 %, y MT3 en 76,5 % global. Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red acustica de transcripcion de piano de Onsets and Frames (Hawthorne et al., 2018), con dos cabezas de salida (onsets y frames); el 46 % de los parametros son convoluciones. El detalle de capas no se especifica en la model card |
| Parametros totales | 26.717.277 (aproximadamente 26,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de audio, no de texto; la model card no documenta tamano de ventana |
| Tipos de cuantizacion | f32, q8_0 y q4_0 (GGUF) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (runtime ggml); origen ONNX, derivado de una reimplementacion en PyTorch del modelo de Magenta |

## Arquitectura y entrenamiento

La model card indica que se trata del modelo Onsets and Frames de Hawthorne et al. (2018) y que la conversion procede del export ONNX publicado en el repositorio ddPn08/onsets-and-frames, una reimplementacion en PyTorch del modelo de Magenta. El autor aporta un dato estructural relevante: el 46 % del modelo son convoluciones y esos kernels se ejecutan en F32 independientemente de la cuantizacion, por lo que cuantizar solo reduce el tamano, no el tiempo de computo.

La conversion se valida contra el export de referencia: el build f32 no es una aproximacion, sino el mismo modelo, con F1 a nivel de nota identico en cada una de las diez piezas de test de MusicNet, un acuerdo maximo de 5,3e-07 tras la sigmoide en la cabeza de onsets, coseno 1,00000000 y el 100 % de decisiones identicas con los umbrales publicados. La composicion exacta del dataset de entrenamiento, el numero de tokens o ejemplos de audio y el uso de RLHF o DPO no se detallan en la informacion disponible; la evaluacion publicada se realiza sobre MusicNet y el articulo original documenta el entrenamiento sobre el corpus descrito en dicha publicacion.

## Capacidades

- Transcripcion de piano polifonico: detecta inicios de nota y alturas a partir de audio, con F1 de notas de 49,6 % global y 69,0 % en piano solo.
- Estimacion de duraciones: la cabeza de frames aporta el offset, aunque con F1 con offsets de 13,9 % (q8_0), muy inferior a la deteccion de onset y altura.
- Procesamiento de audio en CPU: funciona en el runtime ggml de CrispASR sin GPU, a aproximadamente 0,67 segundos de CPU por segundo de audio en monohilo.
- Tres perfiles de despliegue en funcion del tamano: f32 (101,9 MiB), q8_0 (30,8 MiB) y q4_0 (18,6 MiB).
- Compatibilidad de salida: el comando de CrispASR consume un WAV de entrada y genera la transcripcion a partir de los eventos de nota detectados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio generativo mas alla de la transcripcion.

## Casos de uso

- Transcripcion de grabaciones de piano a eventos de nota: ejecutar `crispasr --piano -m onsets-and-frames-q8_0.gguf -f input.wav` sobre un WAV para obtener un borrador automatico de la interpretacion, con 69,0 % de F1 en piano solo, que despues se corrige manualmente.
- Etiquetado masivo de corpus de audio: con 30,8 MiB y ejecucion en CPU a velocidad superior al tiempo real, se pueden procesar horas de grabaciones en un VPS modesto sin GPU para generar metadatos de nota.
- Analisis musicologico de interpretaciones: la cabeza de onsets permite estudiar densidad de notas, tesitura y articulacion, sin depender de la duracion estimada, que es la parte menos fiable del modelo.
- Educacion musical y practica instrumental: integrar el modelo en una aplicacion de escritorio que resalte en tiempo casi real las notas detectadas mientras el alumno toca, aprovechando que el peso del modelo es de decenas de MiB.
- Integracion en DAW o plugin de escritorio: el tamano del GGUF q4_0 (18,6 MiB) permite empaquetar la transcripcion dentro de una aplicacion ligera sin dependencia de nube ni de GPU, priorizando onset y altura si las duraciones no son criticas.
- Archivado y busqueda de colecciones musicales: generar una representacion de notas por pista para indexar un archivo de audio y permitir busquedas por contenido melodico.
- Prototipado en entornos sin acelerador: validar una funcionalidad de transcripcion en hardware muy limitado antes de decidir si conviene migrar a ONNX Runtime para reducir la latencia.

## Benchmarks y rendimiento

Resultados sobre las diez piezas de test de MusicNet (13.589 notas de referencia), con mir_eval.transcription (tolerancia de 50 ms en el onset, 50 cents, emparejamiento bipartito maximo, recuentos agregados y el mismo decodificador en todas las variantes):

| Modelo | F1 de notas (global) | F1 con offsets | Piano solo |
|---|---|---|---|
| onsets-and-frames-f32 | 49,6 % | 13,8 % | 69,0 % |
| onsets-and-frames-q8_0 | 49,6 % | 13,9 % | 69,0 % |
| onsets-and-frames-q4_0 | 49,5 % | 13,3 % | 68,9 % |
| Basic Pitch | 44,0 % | no disponible | 57,5 % |
| hFT-Transformer | 52,2 % | no disponible | 70,5 % |
| MT3 | 76,5 % | no disponible | no disponible |

El autor senala que q4_0 perturba la cabeza de frames unas cinco veces mas que la de onsets (coseno 0,9935 frente a 0,9989) y que es la cabeza de frames la que fija la duracion de las notas, de ahi la perdida relativa del 3,6 % en F1 con offsets.

## Requisitos de hardware

- VRAM estimada: no se publican cifras. Con pesos de 18,6 a 101,9 MiB, el modelo cabe en cualquier GPU con mas de 1 GB de memoria, pero el runtime objetivo (ggml/CrispASR) esta orientado a CPU y no requiere acelerador.
- GPU recomendadas: no aplica; no se necesita GPU. El despliegue de referencia es en CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo puede alojar los pesos, aunque no aporta ninguna ventaja en el caso de uso documentado.
- Opciones de despliegue: CrispASR sobre ggml con los ficheros GGUF (variante recomendada, q8_0) y ONNX Runtime con el export original, que segun el autor es entre 5,5 y 7 veces mas rapido.
- Latencia y throughput: aproximadamente 0,67 segundos de CPU por segundo de audio, en monohilo, sobre un VPS x86-64 de 4 vCPU; es mas rapido que el tiempo real para transcripcion offline. La cuantizacion no reduce el tiempo de computo, solo el tamano.
- Espacio en disco: 101,9 MiB (f32), 30,8 MiB (q8_0) y 18,6 MiB (q4_0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 global | F1 piano solo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Onsets & Frames GGUF (este modelo) | 26,7 M | No aplica (audio) | 49,6 % | 69,0 % | MIT | GGUF para ggml/CrispASR; ONNX de origen |
| Basic Pitch | no disponible | No aplica (audio) | 44,0 % | 57,5 % | no disponible | no disponible |
| hFT-Transformer | no disponible | No aplica (audio) | 52,2 % | 70,5 % | no disponible | no disponible |
| MT3 | no disponible | No aplica (audio) | 76,5 % | no disponible | no disponible | no disponible |

Los datos de F1 de Basic Pitch, hFT-Transformer y MT3 proceden de la propia model card y se midieron con el mismo corpus y decodificador. No se dispone de informacion sobre parametros, licencia ni formato de distribucion de esos tres modelos en la informacion proporcionada, y la columna de piano solo no esta publicada para MT3.

## Limitaciones y advertencias

- Precision limitada: el F1 de notas global es del 49,6 %, de modo que aproximadamente la mitad de las notas no se recuperan correctamente en mezclas; el F1 con offsets cae al 13,9 %, por lo que las duraciones no son fiables para transcripcion a partitura sin revision humana.
- Especificidad de dominio: el modelo esta disenado para piano. No se documenta su comportamiento con otros instrumentos, mezclas densas ni audio con ruido o reverberacion.
- Sesgos: no se documentan sesgos en la model card. Como referencia, el corpus de evaluacion (MusicNet) es predominantemente piano clasico occidental, por lo que el rendimiento en otros generos no esta caracterizado.
- Riesgo de notas espurias: al ser un modelo acustico con umbrales de decision, puede generar detecciones falsas en pasajes con ruido de fondo, instrumentacion no pianistica o silencios con componentes armonicos.
- Licencia: el GGUF se publica bajo MIT, lo que permite uso comercial de esta conversion. No se especifica en la informacion disponible la licencia del checkpoint original de Magenta ni la del repositorio ddPn08/onsets-and-frames, por lo que conviene verificarlas antes de un uso comercial en produccion.
- Eleccion de cuantizacion: q4_0 reduce un 0,5 % absoluto (3,6 % relativo) el F1 con offsets, por lo que no es la opcion adecuada si las duraciones importan.
- Rendimiento en tiempo de ejecucion: el coste es de 5,5 a 7 veces el de ONNX Runtime con el mismo modelo; en escenarios sensibles a latencia conviene evaluar la ruta ONNX.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni una comunidad que reporte incidencias.
- Contexto e idioma: al no ser un modelo de texto, no tiene ventana de contexto ni soporte multilingue; no es apto para tareas de generacion de lenguaje, codigo o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/onsets-and-frames-GGUF
- Articulo original de Onsets and Frames (Hawthorne et al., 2018): https://arxiv.org/abs/1710.11153
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Reimplementacion en PyTorch del checkpoint de origen: https://github.com/ddPn08/onsets-and-frames
- Informe de deteccion de tono de CrispTuner (secciones 35, 36 y 37, metodologia de medida): https://github.com/CrispStrobe/flutter_tuner/blob/main/bench/REPORT.md
