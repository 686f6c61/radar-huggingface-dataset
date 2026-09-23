# MarkusKaemmerer/Voxtral-Small-24B-2507-4bit-dense-encoder

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo Voxtral Small (24B) de Mistral AI, adaptada al framework MLX de Apple para poder ejecutarse en equipos con memoria unificada de 32 GB. La cuantizacion es asimetrica: el modelo de lenguaje y la cabeza `lm_head` se almacenan en 4 bits (afine, tamano de grupo 64), mientras que el encoder de audio y su proyector se mantienen en bf16. El autor es MarkusKaemmerer y la licencia Apache 2.0 se hereda del modelo base `mistralai/Voxtral-Small-24B-2507`.

El problema que resuelve es el coste de memoria del modelo original: con 24.932.889.600 parametros en precision completa, la inferencia local en Apple Silicon resulta inviable. Esta build ocupa 15 GB en disco, con un promedio de 4,82 bits por peso y un pico de memoria medido de 19,4 GB en una pasada de 10 minutos de audio sobre un M1 Max, a aproximadamente 2x tiempo real. La decision de mantener el encoder en bf16 responde a un barrido experimental recogido en la propia model card: en audio aleman dificil, el CER fue del 4,87 % con encoder a 4 bits, 4,28 % a 6 bits, 2,46 % a 8 bits y 2,41 % en bf16, mientras que la precision del cuerpo del modelo de lenguaje y de `lm_head` no mostro diferencias medibles entre 4 y 8 bits.

Su relevancia practica es doble. Por un lado, permite transcripcion de voz de alta calidad en hardware de consumo Apple sin GPU dedicada. Por otro, esta integrado en noScribe, una aplicacion de codigo abierto para transcripcion de entrevistas con diarizacion de hablantes y marcas de tiempo, donde se ofrece como la opcion `voxtral-small-4bit` y se descarga en el primer uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de audio y lenguaje: encoder de audio, proyector y modelo de lenguaje autorregresivo (no se detalla la topologia interna en la informacion disponible) |
| Parametros totales | 24.932.889.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afine con tamano de grupo 64 en el modelo de lenguaje y `lm_head`; encoder de audio y proyector en bf16 |
| Idiomas soportados | de, en, fr, es, it, pt, nl, hi |
| Licencia | Apache 2.0 (heredada de `mistralai/Voxtral-Small-24B-2507`) |
| Formato de pesos | safetensors, formato MLX (libreria `mlx`) |
| Tamano del repositorio | 15,0 GB |
| Bits medios por peso | 4,82 |
| Tarea declarada | automatic-speech-recognition |

## Arquitectura y entrenamiento

La model card describe un montaje de tres componentes: un encoder de audio, un proyector que conecta ese encoder con el espacio del modelo de lenguaje, y un modelo de lenguaje autorregresivo con su cabeza `lm_head`. La cuantizacion se aplica de forma selectiva: el cuerpo del modelo de lenguaje y `lm_head` van a 4 bits, y el encoder de audio junto con su proyector permanecen en bf16. Esta decision se justifica con un barrido aislado sobre audio aleman dificil en el que, manteniendo todo lo demas fijo, el error de caracteres fue de 4,87 / 4,28 / 2,46 / 2,41 % para encoder a 4 / 6 / 8 bits / bf16, respectivamente, mientras que el cuerpo del modelo y `lm_head` a 4 u 8 bits puntuaron igual. El razonamiento del autor es que el encoder se ejecuta una sola vez por pasada y no penaliza la velocidad, de modo que merece la precision extra.

La cuantizacion es sin datos (data-free), afine y con tamano de grupo 64, por lo que el mismo comando de cuantizacion reproduce pesos identicos bit a bit. El comando documentado es `python tools/quantize_voxtral.py mistralai/Voxtral-Small-24B-2507 out-dir 4 64 dense-encoder --lm-head-bits 4`. Se probaron y descartaron dos formatos de coma flotante de 4 bits: `mxfp4` obtuvo peor puntuacion que el 4 bits afine empleado aqui, y `nvfp4` sin escala global por tensor rompio el modelo por completo, que respondia con una repeticion infinita de "ist, ist, ist".

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base. Tampoco se documenta ninguna innovacion de decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico de voz (ASR) y transcripcion de audio a texto, con salida que preserva el estilo verbatim, incluyendo arranques falsos y muletillas.
- Transcripcion multilingue en aleman, ingles, frances, espanol, italiano, portugues, neerlandes e hindi.
- Comprension de audio vinculada al modelo de lenguaje subyacente, lo que permite tareas de comprension y resumen sobre la transcripcion en el mismo modelo.
- Salida de transcripcion con puntuacion y palabras funcionales cuando se ajusta correctamente el parametro `repetition_penalty`.
- Ejecucion local en Apple Silicon mediante MLX, con carga del modelo a traves de `mlx_voxtral`.
- Integracion con noScribe, que anade diarizacion de hablantes, marcas de tiempo y salida editable sobre las transcripciones generadas por este modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio generativo: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de entrevistas y periodismo: el modelo produce salida verbatim, conservando arranques falsos y muletillas, algo relevante cuando se necesita fidelidad literal de la declaracion. La model card advierte que en audio conversacional dificil no supera al build Mini de 3B en precision y ademas corre a un cuarto de su velocidad.
- Transcripcion de clases y ponencias: en audio limpio, con pocos solapamientos y buena relacion senal-ruido, el autor lo situa claramente por encima del build Mini de 3B, lo que lo hace adecuado para apuntes academicos y material didactico.
- Dictado y lectura en voz alta: es el segundo escenario de audio limpio que la propia model card recomienda, apropiado para flujos de documentacion donde se dicta texto a un editor.
- Material con abundantes nombres propios: el modelo maneja mejor que la alternativa de 3B el vocabulario de nombres, util en transcripcion de actas, listados de participantes o contenido tecnico con terminologia especifica.
- Aplicacion de escritorio noScribe: se ofrece como modelo `voxtral-small-4bit`, con descarga en el primer uso; noScribe dimensiona cada pasada segun la RAM de la maquina y rechaza el modelo antes de ejecutarlo si no cabe, lo que evita fallos por memoria en equipos de 32 GB.
- Procesamiento por lotes en un unico Mac: con un pico de 19,4 GB por pasada de 10 minutos de audio y una velocidad aproximada de 2x tiempo real en M1 Max, se pueden encolar horas de grabacion en una sola maquina sin GPU dedicada.
- Prototipado de pipelines de audio en investigacion: al ser una build MLX con licencia Apache 2.0 y pesos publicos, permite experimentar con ASR multilingue en ocho idiomas sin coste de API ni infraestructura de servidor.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER en FLEURS aleman | 2,78 % | 100 grabaciones, 25 minutos |
| CER en FLEURS aleman | 0,75 % | 100 grabaciones, 25 minutos |
| WER del modelo sin cuantizar | 2,61 % | Open ASR Leaderboard |
| WER del build Mini de 3B | 4,89 % | Medicion propia del autor |
| CER con encoder a 4 bits | 4,87 % | Barrido aislado sobre audio aleman dificil |
| CER con encoder a 6 bits | 4,28 % | Barrido aislado sobre audio aleman dificil |
| CER con encoder a 8 bits | 2,46 % | Barrido aislado sobre audio aleman dificil |
| CER con encoder bf16 | 2,41 % | Barrido aislado sobre audio aleman dificil |
| Velocidad | ~2x tiempo real | M1 Max |
| Pico de memoria | 19,4 GB | Una pasada de 10 minutos, M1 Max |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto para este modelo.

## Requisitos de hardware

- Memoria en disco: 15,0 GB de pesos en el repositorio.
- Memoria unificada: el autor indica que esta pensado para ejecutarse en un Mac de 32 GB; el pico medido es de 19,4 GB en una pasada de 10 minutos sobre M1 Max.
- GPU compatibles: hardware Apple Silicon (la build 8-bit equivalente requiere unos 34 GB y fue sustituida por esta en noScribe). No se mencionan GPU NVIDIA ni AMD.
- GPU de consumo: si cabe en Apple Silicon de gama alta con 32 GB de memoria unificada, como M1 Max. Para GPUs de consumo tipo RTX 4090 no hay datos disponibles, ya que la build es especifica de MLX.
- Opciones de despliegue: `mlx_voxtral` (carga del modelo y `VoxtralProcessor`), framework MLX de Apple y la aplicacion noScribe. No se documentan vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: aproximadamente 2x tiempo real en M1 Max segun la model card; a titulo orientativo, una hora de audio requeriria del orden de media hora de proceso, aunque no se ofrecen cifras de throughput por lote ni de latencia por peticion corta.
- Nota operativa: el autor advierte que una llamada directa a `generate()` no incluye la comprobacion de memoria que si hace noScribe, por lo que hay riesgo de fallo por memoria si no se dimensiona la pasada.
- Parametro de inferencia critico: hay que fijar `repetition_penalty=1.0`, ya que `mlx-voxtral` usa 1,2 por defecto, un valor pensado para chat que en habla verbatim penaliza la puntuacion y las palabras funcionales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarkusKaemmerer/Voxtral-Small-24B-2507-4bit-dense-encoder | 24,93 B | 4 bits LM + encoder bf16 | 15,0 GB | Apache 2.0 | MLX, integrado en noScribe |
| MarkusKaemmerer/Voxtral-Small-24B-2507-8bit-dense-encoder | 24,93 B | 8 bits | ~34 GB | Apache 2.0 | MLX, sustituido por la build de 4 bits en noScribe |
| MarkusKaemmerer/Voxtral-Mini-3B-2507-8bit-dense-encoder | 3 B (aproximado, no confirmado en la informacion disponible) | 8 bits | No disponible | Apache 2.0 | MLX |
| mistralai/Voxtral-Small-24B-2507 | 24,93 B | Sin cuantizar (bf16) | No disponible | Apache 2.0 | Pesos originales de Mistral AI |

En rendimiento, la comparativa directa disponible es sobre FLEURS aleman: 2,78 % WER para esta build frente a 2,61 % del modelo sin cuantizar en el Open ASR Leaderboard y 4,89 % del build Mini de 3B. En audio conversacional dificil, la model card indica que no supera al build Mini de 3B en precision, que se mantiene mas cerca del texto verbatim y que corre a aproximadamente el cuadruple de velocidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; como modelo de ASR entrenado sobre datos no descritos, puede heredar sesgos de acento, dialecto y vocabulario del corpus original.
- Riesgo de alucinacion: el autor documenta un fallo catastrofico con el formato `nvfp4`, en el que el modelo respondia con una repeticion infinita de "ist, ist, ist". Aunque ese formato no se usa en esta build, evidencia que una configuracion de cuantizacion inadecuada puede degradar la salida de forma severa.
- Idiomas: la model card declara soporte para de, en, fr, es, it, pt, nl e hi, pero todas las mediciones publicadas son sobre aleman (FLEURS aleman y un barrido sobre audio aleman dificil). No hay datos de calidad para el resto de idiomas.
- Audio conversacional dificil: en entrevistas, podcasts y videollamadas el modelo no supera al build Mini de 3B en las mediciones del autor, corre a un cuarto de su velocidad y ademas se mantiene mas cerca del texto verbatim, lo que puede ser indeseable si se busca una transcripcion legible.
- Dependencia de hardware: los pesos estan en formato MLX y estan pensados para Apple Silicon; el autor no documenta rutas de despliegue en CUDA ni en otras pilas de inferencia, lo que limita su uso en servidores convencionales.
- Gestion de memoria: una llamada directa a `generate()` no comprueba si el modelo cabe en memoria, por lo que puede fallar o provocar presion de memoria en maquinas justas de RAM.
- Parametro de decodificacion: usar el `repetition_penalty` por defecto de 1,2 degrada la puntuacion y las palabras funcionales en habla verbatim; hay que fijarlo en 1,0.
- Reproducibilidad del benchmark: las cifras de FLEURS aleman proceden de 100 grabaciones y 25 minutos de audio, una muestra pequena para extrapolar a dominios distintos.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial, pero conviene verificar las condiciones del modelo original de Mistral AI y citar correctamente la procedencia de los pesos.
- Adopcion muy baja: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarkusKaemmerer/Voxtral-Small-24B-2507-4bit-dense-encoder
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Build de 8 bits del mismo autor: https://huggingface.co/MarkusKaemmerer/Voxtral-Small-24B-2507-8bit-dense-encoder
- Build Mini de 3B del mismo autor: https://huggingface.co/MarkusKaemmerer/Voxtral-Mini-3B-2507-8bit-dense-encoder
- Aplicacion noScribe: https://github.com/happyarts/noScribe
- Notas del motor Voxtral en noScribe: https://github.com/happyarts/noScribe/blob/voxtral/VOXTRAL.md
- Mediciones de cuantizacion: https://github.com/happyarts/noScribe/blob/voxtral/docs/voxtral-quantisation.md
- Rama `voxtral` del fork de noScribe: https://github.com/happyarts/noScribe/tree/voxtral
- Repositorio original de noScribe: https://github.com/kaixxx/noScribe
- Open ASR Leaderboard (fuente del 2,61 % WER del modelo sin cuantizar): no disponible como enlace en la informacion proporcionada
