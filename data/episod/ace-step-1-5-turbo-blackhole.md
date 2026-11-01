# episod/ace-step-1.5-turbo-blackhole

## Resumen

`episod/ace-step-1.5-turbo-blackhole` es un paquete de despliegue (bundle) de tipo "thin" para el ecosistema tt-model v6 que sirve el modelo de texto a musica ACE-Step 1.5 turbo sobre una unica chip Tenstorrent Blackhole (mesh P150). No contiene pesos propios ni codigo de ACE-Step: en el arranque descarga los ficheros turbo del repositorio `ACE-Step/Ace-Step1.5` (unos 6,5 GB) y el codigo del puerto `sunandbean/acestep-1.5-turbo-p100a`, y ejecuta la inferencia en la chip con el runtime de Tenstorrent.

El modelo subyacente genera clips de musica de 48 kHz en estereo a partir de una descripcion textual (caption) y, opcionalmente, una letra. La arquitectura combina un transformer de difusion (24 capas, 8 pasos de muestreo), un decodificador VAE Oobleck, un codificador de texto basado en Qwen3-Embedding-0.6B y un codificador de letras; las tres piezas de codificacion se ejecutan en bfloat16 sobre la chip. El paquete esta pensado para servir peticiones mediante un servidor HTTP local (`POST /v1/music`) con una sola peticion concurrente.

Es relevante porque demuestra el despliegue de un modelo generativo de audio en hardware no convencional (Tenstorrent) con un contrato de API sencillo y reproducible (semilla fija, misma peticion devuelve las mismas muestras). No obstante, se trata de un paquete comunitario, no de un lanzamiento oficial de ACE-Step ni de Tenstorrent, con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (24 capas, 8 pasos) + VAE Oobleck + codificador de texto Qwen3-Embedding-0.6B + codificador de letras |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de hasta 2.000 caracteres; letra de hasta 8.000) |
| Tipos de cuantizacion | no disponible (codificadores en bfloat16 sobre la chip) |
| Idiomas soportados | no disponible (caption y letra en texto libre) |
| Licencia | Apache-2.0 para el bundle y el codigo del servidor; MIT para los pesos de ACE-Step; Apache-2.0 para el codigo del modelo (`sunandbean/acestep-1.5-turbo-p100a`) |
| Formato de pesos | safetensors del repositorio `ACE-Step/Ace-Step1.5` (revision `19671f406d603126926c1b7e2adc169acbcade22`), descargados en el arranque |
| Duracion de audio | 5 a 480 segundos por clip |
| Formato de salida | WAV, 48 kHz, estereo, 32 bits float |
| Hardware objetivo | 1 chip Tenstorrent Blackhole (mesh P150) |
| Servidor | ASGI con uvicorn en `127.0.0.1:20140` (configurable via `PORT` y `HOST`) |

## Arquitectura y entrenamiento

El modelo subyacente, ACE-Step 1.5 turbo, es un modelo de difusion para generacion de audio musical. El bundle ejecuta sobre la chip el transformer de difusion (24 capas, 8 pasos de muestreo), el decodificador VAE Oobleck, el codificador de texto Qwen3-Embedding-0.6B, el codificador de letras y las claves y valores de cross-attention. Los tres componentes de codificacion corren en bfloat16 y son puertos incluidos en `extra_code/acestep_chip.py`. En CPU quedan el tokenizador, las mascaras, la actualizacion del sampler, la normalizacion de picos y la escritura del WAV.

El paquete no incluye el modelo de lenguaje planificador (planner LM), ni el modo thinking, ni el acondicionamiento por codigos de audio, ni el transformer XL. Tampoco soporta mas de una chip. En el arranque, el servidor descarga unicamente los ficheros turbo (`acestep-v15-turbo`, `vae`, `Qwen3-Embedding-0.6B`, `config.json`), verifica el tamano fijado de cada fichero de pesos y comprueba un hash sobre los 1.307 ficheros de codigo contra `extra_code/acestep_pins.json`; rechaza copias hechas con enlaces simbolicos para evitar que ACE-Step resuelva su propio codigo desde la cache del Hub. El runtime construye un arbol de checkpoints privado bajo el directorio de trabajo para que ACE-Step no escriba en la cache de Hugging Face. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de musica a partir de una descripcion textual (caption) de hasta 2.000 caracteres.
- Generacion con letra opcional de hasta 8.000 caracteres.
- Control de duracion del clip entre 5 y 480 segundos (por defecto, 30).
- Reproducibilidad determinista: la misma peticion (mismo prompt, duracion y semilla) devuelve las mismas muestras; los ficheros WAV pueden diferir byte a byte solo en las cabeceras.
- Salida en audio estereo de 48 kHz y 32 bits float.
- API HTTP minima: `GET /health` y `POST /v1/music` con cuerpo JSON (`prompt`, `lyrics`, `duration`, `seed`).
- Cabeceras de respuesta `X-Timings` (JSON) y `X-Sample-Rate`.
- Aceleraciones opcionales configurables mediante `ACESTEP_FAST`: `gc_freeze`, `timbre_cache`, `cond_cache`, `kv_on_chip`, `text_on_chip`, `lyric_on_chip`.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Prototipado de bandas sonoras para videojuegos indie: generar clips de 30 a 120 segundos a partir de una descripcion de ambiente ("warm lo-fi hip hop, mellow rhodes piano") con semilla fija para reproducir exactamente la misma pieza en distintas builds.
- Generacion de jingles y cortinillas para podcast: clips cortos de 5 a 30 segundos con letra opcional, servidos localmente mediante `POST /v1/music` sin depender de APIs externas.
- Creacion de maquetas musicales con letra: usar el campo `lyrics` (hasta 8.000 caracteres) para probar estribillos y estructuras antes de pasar a produccion.
- Evaluacion de hardware Tenstorrent en pipelines de audio generativo: el bundle permite medir latencia y compilacion de kernels en una Blackhole P150 antes de invertir en un despliegue mayor.
- Generacion por lotes offline: al ser determinista y aceptar semilla, se pueden generar variaciones controladas de una misma caption para curation de datasets de audio.
- Demostraciones y talleres: el servidor local con `tools/smoke.py` permite verificar el funcionamiento de extremo a extremo (peticion, generacion y comprobacion del clip) en una sola maquina con una chip.
- Pruebas de integracion en CI: el contrato HTTP simple (codigos 400, 500, 503 con `Retry-After`) facilita escribir tests de integracion del servicio sin depender del contenido musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que la primera peticion compila kernels y que el arranque inicial descarga unos 6,5 GB de pesos y 1.307 ficheros de codigo; no se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- Una chip Tenstorrent Blackhole (mesh P150) como minimo y maximo; el bundle no soporta mas de una chip.
- CPU auxiliar para tokenizacion, mascaras, sampler, normalizacion y escritura del WAV.
- Espacio en disco: unos 6,5 GB para los pesos turbo mas el arbol de checkpoints privado y el codigo descargado (1.307 ficheros).
- Entorno Python 3.12 creado por `install.sh` a partir de `requirements.txt`, con `ttnn==0.80.0` desde PyPI y todas las dependencias con version fijada.
- Despliegue mediante `tt-model serve <owner>/ace-step-1.5-turbo-blackhole`, o bien `bash install.sh` seguido de `bash run.sh` sin `tt-model`.
- Servidor uvicorn en `127.0.0.1:20140` por defecto; `PORT` y `HOST` permiten cambiarlo.
- En maquinas compartidas se recomienda tomar primero un lease de la chip.
- No cabe en GPU de consumo (RTX 4090, etc.): el runtime es especifico de Tenstorrent y no se ofrecen rutas de despliegue alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la primera peticion incluye la compilacion de kernels.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `episod/ace-step-1.5-turbo-blackhole` | Bundle de despliegue de ACE-Step 1.5 turbo | no disponible | no disponible | 1 chip Tenstorrent Blackhole P150 | Apache-2.0 (bundle) / MIT (pesos) | Hugging Face, 0 descargas |
| `ACE-Step/Ace-Step1.5` | Modelo base de texto a musica | no disponible | no disponible | GPU convencional (no especificado) | MIT | Hugging Face (repositorio oficial) |
| `sunandbean/acestep-1.5-turbo-p100a` | Codigo del puerto para Tenstorrent | no disponible | no disponible | Tenstorrent (P100a, segun el nombre) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento que permitan comparar calidad o velocidad entre estas variantes. La diferencia principal entre el bundle y el modelo base es el hardware objetivo y la omision del planner LM y del transformer XL.

## Limitaciones y advertencias

- Paquete comunitario: no es un lanzamiento oficial de ACE-Step ni de Tenstorrent; el autor lo declara explicitamente.
- El bundle no incluye pesos ni codigo de ACE-Step: depende de descargas en el arranque desde Hugging Face, con el riesgo de disponibilidad que ello implica.
- No incluye el planner LM (sin modo thinking ni acondicionamiento por codigos de audio) ni el transformer XL, por lo que la calidad puede diferir de la version completa de ACE-Step 1.5.
- Una sola peticion concurrente: una segunda peticion mientras se genera devuelve `503` con `Retry-After: 5`.
- Una generacion fallida deja el servicio en `503` hasta reiniciar el servidor.
- ACE-Step no puede detener un clip a mitad: si el cliente abandona, la generacion continua hasta terminar y el slot no se libera antes.
- Limites de entrada: prompt de 2.000 caracteres, letra de 8.000, cuerpo de peticion de 64 KiB; campos desconocidos devuelven `400`.
- Solo una chip: no hay soporte multi-chip ni escalado horizontal dentro del bundle.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (en el sentido de audio no fiel al prompt) ni calidad subjetiva de la musica generada; el autor excluye explicitamente de su alcance "juzgar si la musica es buena".
- Licencia: los pesos son MIT segun la model card de ACE-Step, que indica que la musica generada puede usarse comercialmente; conviene leer esa model card antes de confiar en ello. El codigo del servidor y del runtime es Apache-2.0.
- El codigo se verifica por hash y se rechazan copias con enlaces simbolicos; modificar el codigo descargado rompe el arranque.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/episod/ace-step-1.5-turbo-blackhole
- Modelo base ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Codigo del puerto para Tenstorrent: https://huggingface.co/sunandbean/acestep-1.5-turbo-p100a
- Revision de pesos fijada: `19671f406d603126926c1b7e2adc169acbcade22`
- Revision del codigo fijada: `dabe15cd44f9fb14e948e111fb671d7ab89fda17`
- Los resultados de busqueda web (episod.com, episodeinteractive.com, classpass.fr) no estan relacionados con este modelo y no se incluyen como referencias tecnicas.
