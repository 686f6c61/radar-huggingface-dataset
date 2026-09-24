# olafura/gemma4-12b-system-one

## Resumen

System One for Gemma 4 12B es un adaptador de enrutamiento desarrollado por el usuario olafura que se coloca delante de un Gemma 4 12B sin modificar y decide, para cada peticion, entre tres comportamientos: **responder ya** en una linea, **razonar primero** con una respuesta elaborada o **preguntar de vuelta** una unica cuestion corta cuando la peticion no permite determinar la respuesta. La idea sigue la estela de Laya y de Jev, pero aplicada en texto libre y sobre un Gemma intacto: los pesos base no se incluyen en el repositorio y nunca se modifican.

El repositorio contiene dos artefactos. El primero es `ask-probe/`, una sonda de 15 kB (regresion logistica sobre el estado residual de Gemma) que es la via recomendada. El segundo son `parameters.safetensors` y `manifest.etf`, un experto de 283 MB de la ronda 3 anadido dentro de las tres ultimas capas del decodificador. Todo el pipeline se ejecuta con Elixir/Nx a traves de EXLA, tanto sobre ROCm (AMD Strix Halo) como sobre CUDA (Nvidia L4 y A100), mediante el comando `mix gemma.system_one`.

Es relevante porque ataca un problema practico de despliegue: decidir cuando un modelo debe gastar tokens en razonamiento, cuando debe contestar de forma directa y cuando debe detenerse a pedir aclaraciones. La sonda lee el estado interno de Gemma, no el texto, de modo que el coste anadido es un unico producto escalar sobre la pasada de prefijo. Se trata de una instantanea en desarrollo (WIP), no de una version estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de routing sobre un transformer Gemma 4 12B: sonda de regresion logistica que lee el residual stream y experto tipo MoE en las tres ultimas capas del decodificador |
| Parametros totales | Adaptador: 283 MB en safetensors (`parameters.safetensors` + `manifest.etf`) mas 15 kB del probe (`ask-probe/`). Modelo base: 12B (no incluido en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de la base Gemma 4 12B, no declarada en la informacion disponible) |
| Tipos de cuantizacion | Base: `w4a16` con QAT (pesos int4, activaciones de 16 bits) segun el identificador `gemma-4-12B-it-qat-w4a16-ct`. Adaptador: pesos en safetensors en coma flotante |
| Idiomas soportados | en, de, es, fr, ja, is, pl, pt, it, nl, ko, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, `manifest.etf` (formato de terminos de Elixir/Erlang) y probe en `ask-probe/` |

## Arquitectura y entrenamiento

El sistema no es un modelo generativo completo, sino una capa de decision sobre Gemma 4 12B. El flujo es el siguiente: la peticion se renderiza en forma directa (`Answer: <x>`), se ejecuta el prefijo de Gemma (capas 0 a 44) y la sonda de ask-back puntua el vector de 3840 numeros correspondiente al ultimo token del prompt. Si la puntuacion supera 0.8, el router pregunta de vuelta mediante una generacion normal de Gemma (hasta 64 tokens) en el idioma de la peticion. En caso contrario se genera la respuesta directa y su confianza se mide como la probabilidad mas baja entre los tokens de la respuesta: a partir de 0.9 se responde ya; por debajo se pasa al modo de razonamiento, reformulando la peticion y permitiendo hasta 768 tokens. La sonda es una regresion logistica (`sigmoid(vector · weight + bias)`), por lo que su coste es un unico producto escalar sobre la pasada del prefijo.

La sonda de ask-back se entreno sobre 3.689 prompts en forma directa, de los cuales 1.494 debian devolver una pregunta de aclaracion. La composicion fue: 2.389 pares gemelos (un item decidible y su gemelo con un detalle eliminado), 600 gemelos hablados con la pregunta como WAV, 400 prompts de replay sobre Gemma base y 300 preguntas de GSM8K y ARC que nunca deben pedir aclaracion. Al umbral 0.8, el 0.9% de los prompts que no deben preguntar superan el corte, mientras que se detecta el 50% de los que si deberian. El segundo artefacto, el experto de 283 MB, se describen en la model card como un experto de la ronda 3 anadido dentro de las tres ultimas capas del decodificador y convive con la ruta del probe (activado con `--expert`).

## Capacidades

- Enrutamiento por peticion entre tres modos: responder ya (una linea), razonar primero (hasta 768 tokens) o preguntar de vuelta (hasta 64 tokens).
- Preguntas de aclaracion generadas por el propio Gemma cuando la sonda de ask-back supera 0.8, en el idioma de la peticion.
- Procesamiento de estado estructurado en forma de item System One: `state`, `question` y `options` (con identificadores y descripciones por opcion).
- Entrada de audio: una fila puede incluir `"audio": "q.wav"` (16 kHz mono, ruta relativa) y el WAV se procesa por el codificador de audio de Gemma; el bucket de audio por defecto es de 8 segundos (`--audio-seconds`).
- Modo servidor HTTP que transmite cada respuesta a medida que se escribe (`mix gemma.system_one serve --port 7860`).
- Modo por lotes sobre ficheros JSONL (`route --input requests.jsonl --output routed.jsonl`), que reproduce los campos de entrada y anade la ruta, la respuesta y la base de la decision.
- Multilingue en doce idiomas: en, de, es, fr, ja, is, pl, pt, it, nl, ko, zh.
- Lectura del estado interno de Gemma (residual stream) sin modificar los pesos base.

## Casos de uso

- Enrutamiento de conversaciones de atencion al cliente: el sistema decide si una consulta es suficientemente clara para responder directamente, si requiere un razonamiento elaborado o si conviene pedir un dato adicional antes de contestar, evitando respuestas erroneas por ambiguedad.
- Desambiguacion de ordenes en asistentes de voz: con entradas de audio WAV de 16 kHz y estado textual estructurado, se puede resolver a que recurso se refiere el usuario (por ejemplo, elegir entre dos impresoras) o devolver una pregunta corta si falta un detalle.
- Seleccion de items con opciones etiquetadas: el formato de item System One (estado, pregunta, opciones con id y descripcion) encaja en tareas de eleccion entre alternativas discretas donde se quiere una respuesta trazable.
- Control de coste en pipelines de generacion: al clasificar por confianza y evitar el modo de razonamiento cuando la respuesta directa ya supera 0.9, reduce el consumo de tokens en cargas de alto volumen.
- Filtrado previo en agentes multi-paso: usar la ruta de clarificacion como primera etapa para no lanzar flujos de herramientas con parametros incompletos.
- Despliegue local sobre hardware unico: el pipeline Elixir/Nx con EXLA/ROCm permite ejecutarlo sobre un AMD Strix Halo sin GPU dedicada, util para prototipos y entornos con memoria unificada.
- Evaluacion de incertidumbre: la confianza por token mas baja y la puntuacion de la sonda ofrecen senales cuantitativas para monitorizar cuando el sistema esta a punto de responder sin contexto suficiente.
- Investigacion sobre enrutamiento y calibracion: la sonda es reentrenable sobre dominios propios, por lo que sirve como banco de pruebas para estudiar el trade-off entre preguntas necesarias y preguntas evitables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Los unicos datos cuantitativos aportados son las metricas de entrenamiento de la sonda de ask-back:

| Metrica de la sonda ask-back | Valor |
|---|---|
| Prompts de entrenamiento | 3.689 |
| Prompts que deben preguntar | 1.494 |
| Falsos positivos al umbral 0.8 (prompts que no deben preguntar y lo hacen) | 0.9% |
| Deteccion al umbral 0.8 (prompts que deben preguntar y se detectan) | 50% |
| Umbral de respuesta directa ("answer now") | 0.9 de confianza minima por token |
| Umbral de razonamiento | por debajo de 0.9 |
| Umbral de ask-back | 0.8 de puntuacion de la sonda |

## Requisitos de hardware

- El repositorio del adaptador ocupa 0.3 GB; los pesos base de Gemma 4 12B no estan incluidos y deben obtenerse por separado.
- VRAM estimada para la base: al estar en `w4a16` (int4 en pesos), los pesos de 12B ocupan aproximadamente 6-7 GB, mas el cache KV y las activaciones (estimacion, no confirmada por el autor).
- GPU probadas por el autor: AMD Strix Halo (memoria unificada, via EXLA/ROCm), Nvidia L4 (24 GB) y Nvidia A100 (40/80 GB) via EXLA/CUDA.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB (por ejemplo, RTX 4090 con 24 GB), aunque el soporte depende de la ruta EXLA/CUDA y de la compilacion de Gemma en Elixir/Nx.
- Opciones de despliegue: `mix gemma.system_one route` para lotes y `mix gemma.system_one serve --port 7860` para servidor con streaming, ambos sobre Elixir/Nx con EXLA. El autor recomienda usar `ask-probe/`.
- Variables de entorno sugeridas por el autor para el arranque con EXLA: `XLA_FLAGS='--xla_gpu_autotune_level=0 --xla_gpu_enable_command_buffer= --xla_gpu_enable_triton_gemm=false'`.
- Latencia y throughput: no disponibles. Se sabe que la sonda anade un unico producto escalar sobre la pasada del prefijo.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olafura/gemma4-12b-system-one | Router de tres vias sobre Gemma 4 12B | Adaptador 283 MB + probe 15 kB sobre base 12B | no disponible | apache-2.0 | Repo HuggingFace, WIP |
| Laya (convaiinnovations/laya) | Modelo System One (referencia citada) | no disponible | no disponible | no disponible | HuggingFace |
| Jev (typesafe.ai) | Modelo System One (referencia citada) | no disponible | no disponible | no disponible | Blog del autor |
| google/gemma-4-12B-it-qat-w4a16-ct | Modelo base multimodal (VLM) | 12B | no disponible | no disponible | HuggingFace |

Los datos de Laya y Jev no estan disponibles en la informacion proporcionada; se citan unicamente como antecedentes del enfoque System One.

## Limitaciones y advertencias

- Es una instantanea en desarrollo (WIP), no una version estable ni una release.
- La sonda falla al detectar peticiones poco claras en dominios que no ha visto: esas peticiones pasan a modo de respuesta o de razonamiento. La solucion propuesta es reentrenarla sobre dominios propios.
- La sonda se apoya en la formulacion concreta con la que fue entrenada, por lo que puede degradarse ante frases alejadas de ese patron.
- Las puntuaciones cercanas a 0.8 pueden cambiar entre GPUs o builds, ya que los kernels int4 redondean de forma distinta: un caso paso de 0.78 a 0.81 tras un cambio de kernel.
- Al umbral 0.8 solo se detecta el 50% de las peticiones que deberian pedir aclaracion; el umbral prioriza evitar preguntas innecesarias a costa de permitir que Gemma adivine en algunos casos.
- Los pesos base no se incluyen en el repositorio y no se modifican: el rendimiento final depende de la version concreta de Gemma 4 12B utilizada.
- No se han publicado benchmarks estandar, evaluaciones de sesgo ni tasas de alucinacion.
- Licencia apache-2.0 para el adaptador, pero conviene verificar los terminos del modelo base Gemma 4 12B antes de uso comercial.
- El despliegue esta atado al ecosistema Elixir/Nx con EXLA (ROCm o CUDA), lo que limita la portabilidad frente a runtimes como vLLM u Ollama.
- No se dispone de datos sobre longitud de contexto efectiva ni sobre comportamiento en contextos muy largos con el adaptador activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olafura/gemma4-12b-system-one
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Modelo base (referencia general): https://huggingface.co/google/gemma-4-12B
- Repositorio del runtime Elixir/Nx: https://github.com/olafura/gemma-4-mic-transcribe
- Laya (referencia): https://huggingface.co/convaiinnovations/laya
- Jev, System One models (referencia): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Entrada de Gemma 4 12B en Ollama: https://ollama.com/library/gemma4:12b
