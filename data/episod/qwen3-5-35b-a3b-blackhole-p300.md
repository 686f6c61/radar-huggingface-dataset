# episod/qwen3.5-35b-a3b-blackhole-p300

## Resumen

`episod/qwen3.5-35b-a3b-blackhole-p300` es un paquete comunitario, no un modelo entrenado desde cero, que permite ejecutar el modelo `Qwen/Qwen3.5-35B-A3B` sobre una placa Tenstorrent Blackhole p300c (dos dies). Lo publica el usuario `episod` como un bundle "thin" de versión 6 para la herramienta `tt-model`, que lo instala en su propio entorno virtual y lo sirve mediante vLLM con un plugin específico para hardware Tenstorrent. El repositorio no contiene los pesos: solo incluye el build de tt-metal con las operaciones MoE necesarias, el código del modelo, el plugin de vLLM y un lanzador.

El modelo subyacente es un transformer de mezcla de expertos (MoE) de 35 000 millones de parámetros totales con unos 3000 millones activos por token, organizado en 40 capas que combinan gated delta net y gated attention, con 256 expertos de los que se activan 8 por token. La relevancia de este paquete es que demuestra la viabilidad de servir un MoE de 35B en aceleradores Tenstorrent de consumo profesional, con un rendimiento medido de 125,75 tok/s en decodificación greedy y un contexto limitado a 4096 tokens para una sola secuencia.

La limitación principal es que se trata de un artefacto de despliegue, no de un modelo nuevo: hereda las capacidades del checkpoint Qwen3.5-35B-A3B, pero recorta la torre de visión, no soporta tool calling ni serving concurrente en esta configuración, y fija el contexto en 4096 tokens. La licencia Apache 2.0 del bundle y del modelo base permite uso comercial, aunque el rendimiento y la estabilidad dependen del hardware y del build de tt-metal incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 40 capas (gated delta net y gated attention), 256 expertos, 8 activos por token |
| Parametros totales | 35B |
| Parametros activos | ~3B por token |
| Longitud de contexto | 4096 tokens (una sola secuencia) |
| Tipos de cuantizacion | Precisión de ejecución: bfp4 en expertos enrutados y head, bfp8 en atención y expertos compartidos, bf16 en router (no se listan cuantizaciones de pesos tipo GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos no incluidos en el repo; se descargan del checkpoint base `Qwen/Qwen3.5-35B-A3B` (revision `59d61f3ce65a6d9863b86d2e96597125219dc754`), unos 72 GB, y se transforman a `model-dir/` en el arranque |

## Arquitectura y entrenamiento

El paquete envuelve el checkpoint `Qwen/Qwen3.5-35B-A3B`, un transformer MoE de 40 capas con dos tipos de bloque: gated delta net y gated attention. Cada capa enruta tokens hacia 256 expertos, de los que se activan 8 por token, lo que da un cómputo efectivo de aproximadamente 3B parámetros por token sobre un total de 35B. El bundle modifica el `config.json` original con tres cambios: fija la arquitectura a `Qwen3NextForCausalLM`, elimina las capas de predicción multi-token y elimina las claves de mrope. No se incluye información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO en la información disponible.

La innovación técnica del paquete está en la integración con hardware Tenstorrent: incluye un build de tt-metal (`ttnn` 0.79.0.dev20261030+qwen35moe) con las operaciones `moe_sorted_dispatch` y `moe_gather_add_rows`, que la versión pública de PyPI (`ttnn` 0.80.0) no tiene. También incorpora un parche de 41 líneas en el cargador de pesos (`models/autoports/qwen_qwen3_coder_next/tt/weights.py`), un plugin de vLLM (`vllm_tt_plugin` 0.1.0) y variables de entorno `QWEN35_*` para decodificación fusionada de MoE, GDN y atención, prefill troceado y decodificación replicada. El muestreo se ejecuta en el dispositivo (`sample_on_device_mode`), con región de trace de 768 MiB y `FABRIC_1D`.

## Capacidades

- Generación de texto y chat en modo texto exclusivamente; la torre de visión del checkpoint no se utiliza.
- Razonamiento y respuesta conversacional multi-turno dentro de una ventana de 4096 tokens.
- Modo "thinking" por defecto en la plantilla de chat, que puede desactivarse con `chat_template_kwargs {"enable_thinking": false}`.
- Soporte de prefijo en caché (prefix caching) y prefill troceado con lotes de 2048 tokens.
- Servicio de una única secuencia simultánea (`--max_num_seqs` = 1), sin concurrencia.
- Sin soporte de tool calling ni function calling en esta configuración (indicado explícitamente en la model card).
- Sin soporte de imágenes, audio ni otras modalidades.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de hardware Tenstorrent: el paquete permite medir el rendimiento real de un MoE de 35B en una placa Blackhole p300c, con benchmark incluido (`tools/bench.py`) para comparar configuraciones y builds de tt-metal.
- Prototipado de asistentes conversacionales en entornos de un solo usuario: con 4096 tokens de contexto y 125 tok/s de decodificación, es adecuado para demos interactivas de chat donde la latencia de primera respuesta (102-136 ms en caliente) importa.
- Generación de código en local sobre acelerador Tenstorrent: el modelo base es un Qwen3.5 con capacidad de código, y el paquete permite servir una API compatible con OpenAI en `127.0.0.1:20160` para integrarla en editores o scripts sin depender de GPU NVIDIA.
- Procesamiento de documentos cortos: resúmenes, extracción de entidades o reescritura de textos que quepan en 4096 tokens, aprovechando el prefill troceado para prompts largos dentro de ese límite.
- Investigación en eficiencia de inferencia: el bundle expone variables de decodificación fusionada y modos de muestreo en dispositivo, útiles para estudiar el impacto de cada optimización en tok/s y latencia.
- Validación de pipelines vLLM sobre hardware no NVIDIA: sirve como referencia para equipos que quieran portar flujos de serving basados en vLLM a aceleradores Tenstorrent, incluyendo la compilación de kernels y la caché persistente.
- Educación y experimentación con modelos MoE: al ser un paquete reproducible con revisión fijada del checkpoint, permite estudiar el comportamiento de un MoE de 256 expertos en un entorno controlado y de bajo coste relativo.

## Benchmarks y rendimiento

Rendimiento medido el 2026-10-30 en los dos dies de la placa 0 (chips 0 y 1, p300c) de una máquina Blackhole de cuatro chips compartida con otros trabajos. Software: `ttnn` 0.79.0.dev20261030+qwen35moe, SFPI 7.74.0 del bundle y vLLM 0.26.0. Una secuencia, greedy.

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificación | 125,75 tok/s (mediana de 5 ejecuciones; mín. 125,39, máx. 125,80) | 128 tokens greedy, tras 1 calentamiento, kernels compilados, load average 3,5 |
| Velocidad de decodificación (boot check) | 125,34 tok/s | 128 tokens en streaming, una ejecución |
| Tiempo hasta el primer token | 102-136 ms | 5 ejecuciones, prompt corto, en caliente |
| Prompt de 3817 tokens con palabra clave al inicio | respondió `PELICAN` en 0,84 s | en caliente |
| Primera petición de chat tras arrancar | 0,13 s | 32 tokens, una petición |
| Arranque en frío | 2334 s | caché de kernels vacía, desde `run.sh` hasta `/health` 200, pesos en disco local, load average 20-50 durante la compilación |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: una placa Tenstorrent Blackhole p300c con ambos dies visibles (`TT_VISIBLE_DEVICES`); `run.sh` rechaza configuraciones con menos dies.
- Host: 1 GB de hugepages y el driver de Tenstorrent instalado.
- Almacenamiento: aproximadamente 72 GB para los pesos descargados, 3,5 GB para el entorno virtual (build de PyTorch para CPU) y 2 GB para la caché de kernels.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.); el paquete está diseñado exclusivamente para aceleradores Tenstorrent.
- Despliegue: mediante `tt-model serve <owner>/qwen3.5-35b-a3b-blackhole-p300`, o bien `bash install.sh` seguido de `bash run.sh`; el servidor expone una API compatible con OpenAI en `127.0.0.1:20160` (configurable con `PORT` y `HOST`).
- Throughput: 125,75 tok/s en decodificación con una sola secuencia; no hay datos de throughput con concurrencia porque el paquete no la soporta.
- Latencia: 102-136 ms hasta el primer token en caliente; 0,84 s para responder a un prompt de 3817 tokens.
- Arranque en frío: 2334 s (unos 39 minutos) con caché de kernels vacía; los arranques posteriores reutilizan la caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware / despliegue | Notas |
|---|---|---|---|---|---|
| episod/qwen3.5-35b-a3b-blackhole-p300 | 35B totales, ~3B activos | 4096 tokens | Apache 2.0 | Tenstorrent Blackhole p300c, vLLM con plugin | Paquete de despliegue, no incluye pesos; 125,75 tok/s medidos |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales, ~3B activos | no disponible en la información proporcionada | Apache 2.0 | GPU convencionales con vLLM, TGI, llama.cpp, etc. | Checkpoint original del que deriva el paquete; incluye torre de visión |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El repositorio no contiene los pesos: el primer arranque descarga unos 72 GB desde Hugging Face y compila kernels, con un arranque en frío medido de 2334 s.
- Contexto limitado a 4096 tokens y una sola secuencia simultánea; no apto para serving concurrente ni para contextos largos.
- Sin soporte de tool calling, function calling, agentes multi-paso ni imágenes en esta configuración.
- El servidor no tiene autenticación; la model card advierte explícitamente de no exponerlo en una dirección pública.
- La plantilla de chat activa el modo thinking por defecto, lo que puede hacer que respuestas cortas terminen dentro de la sección de razonamiento con motivo `length`; es necesario desactivarlo para respuestas directas.
- El rendimiento medido se obtuvo en una máquina compartida con otros trabajos (load average 3,5 en la medición principal y 20-50 durante la compilación), por lo que la variabilidad puede ser alta.
- Dependencia de un build específico de tt-metal (`ttnn` 0.79.0.dev20261030+qwen35moe) y de SFPI 7.74.0; la versión pública de `ttnn` 0.80.0 carece de las operaciones MoE necesarias.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; son heredados del checkpoint Qwen3.5-35B-A3B, sobre el que no se aportan detalles.
- Idiomas soportados: no disponibles; la model card no especifica cobertura lingüística.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el paquete es una contribución comunitaria sin garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/episod/qwen3.5-35b-a3b-blackhole-p300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Revisión fijada del checkpoint base: `59d61f3ce65a6d9863b86d2e96597125219dc754`
- Imagen de referencia del bundle: `tt-model/qwen3-coder-next:0c170421ca1b`
- Documentación de Tenstorrent: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
