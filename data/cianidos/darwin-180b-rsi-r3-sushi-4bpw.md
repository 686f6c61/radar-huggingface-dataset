# Cianidos/Darwin-180B-RSI-R3-Sushi-4bpw

## Resumen

Darwin-180B-RSI-R3-Sushi-4bpw es un empaquetado cuantizado del modelo Darwin-180B-RSI-R3, publicado por el usuario Cianidos en Hugging Face. El modelo base lo desarrolla FINAL-Bench y emplea una arquitectura MoE de tipo `qwen4_exp` con 48 capas de expertos enrutados, 512 expertos por capa y enrutamiento top-10, con una ventana de contexto nativa de 262.144 tokens y capacidad de vision-language (pipeline `image-text-to-text`). El nombre comercial indica 180B, pero los pesos reales en safetensors suman 36.556.177.299 parametros, es decir, unos 36,6 mil millones.

La particularidad de este repositorio es el formato: no es un checkpoint Transformers, ni GGUF, ni ExLlamaV3 nativo, sino un pack propietario del runtime Sushi (version 1.7.3), orientado a inferencia local en Apple Silicon mediante streaming de expertos desde SSD. Los expertos enrutados se cuantizan a EXL3 K4 con codebook MCG, ventana 15 y escalas `svh`, mientras que el tronco denso se guarda en MLX affine 8-bit con grupo 64, y se incluye ademas una tabla de n-gramas en 4-bit (grupo 32) que ocupa 32 GB en disco.

El pack esta pensado para maquinas con 128 GiB de memoria unificada (probado en un Apple M5 Max), y el autor advierte que no cabe junto a otro pack Darwin bajo el presupuesto de modelos residentes del servidor. Su relevancia practica es acotada: demuestra un flujo de cuantizacion y despliegue para modelos MoE de razonamiento y vision en hardware de consumo Apple, pero depende de un runtime de nicho y de una licencia comunitaria (qwen-community-1.0) que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `qwen4_exp` (transformer con mezcla de expertos), 48 capas de expertos enrutados, 512 expertos por capa, top-10 routing |
| Parametros totales | 36.556.177.299 (segun safetensors); el nombre comercial indica 180B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extension a 1.048.576 tokens mediante `yarn_factor 4` en tiempo de servicio |
| Tipos de cuantizacion | Expertos enrutados EXL3 K4 (MCG, ventana 15, `out_scales: svh`, `ldlq-rotated`); tronco denso MLX affine 8-bit grupo 64; tabla n-gramas affine 4-bit grupo 32 |
| Idiomas soportados | en, ko, zh, ja, multilingual |
| Licencia | qwen-community-1.0 (`license: other` en metadatos) |
| Formato de pesos | Pack Sushi (safetensors indexados + `ngram_table.bin`); no es GGUF ni ExLlamaV3 nativo |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 48 capas con bancos de 512 expertos enrutados por capa y seleccion top-10, lo que permite una capacidad total elevada con un coste de computo por token mucho menor que un modelo denso del mismo tamano. El pack preserva todos los expertos (no hay poda) y mantiene intacto el enrutamiento original, con la opcion `--expert-pick-tolerance 0` que garantiza que no se sustituye un experto seleccionado por otro en cache. Incluye ademas una cabeza MTP (multi-token prediction) nativa y pesos de vision, lo que confirma el caracter vision-language del modelo.

La cuantizacion se realizo directamente desde los pesos BF16 originales de Darwin R3 (revision `31e434388ffcb0dcb7897fed33b3bc70302384e1`) con Sushi 1.7.3, MLX 0.32.3 y mlx-c `56b2d39fc831` con NAX activado. La calibracion uso el corpus por defecto de Sushi de 65.536 tokens (mezcla de prosa y codigo), 16 expertos por lote y factorizacion de Hessiana en float64, con SHA-256 `7f2a5b1413545d9daf73ef13f06769914c68693121cd86f1e2611bf8d5c419c3`, identico al del pack hermano de 2,5 bpw. El RoPE nativo se conserva sin extension horneada; el escalado a 1M de contexto es una opcion de servicio. La conversion tardo aproximadamente 2 h 21 min (unos 168 s por capa de expertos). No se dispone de informacion sobre el dataset de preentrenamiento, el numero de tokens vistos ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento implicito en el modelo base (tag `reasoning`).
- Razonamiento visual y comprension de imagenes: pipeline `image-text-to-text` con pesos de vision incluidos en el pack.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable a 1.048.576 tokens con `yarn_factor 4` en el servidor Sushi.
- Multilinguismo limitado a ingles, coreano, chino, japones y etiqueta generica `multilingual`; el castellano no figura entre los idiomas declarados.
- Prediccion multi-token (MTP) para acelerar la decodificacion, con cabeza MTP y KV de la cabeza cuantizada a 8 bits.
- Tabla de n-gramas de 4 bits para decodificacion especulativa sin drafter separado (`--no-drafter`).
- Servicio con API compatible con OpenAI (`/v1`) y con Anthropic, ademas de interfaz web de chat y panel de metricas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Asistente de razonamiento visual en local: analisis de capturas, diagramas o documentos escaneados en un Mac de 128 GiB, usando los pesos de vision y el contexto largo para adjuntar varias imagenes y texto en una misma conversacion.
- Procesamiento de repositorios completos: con 262.144 tokens nativos (y hasta 1M con YaRN), el modelo puede recibir arboles de codigo, ficheros de configuracion y trazas de error en una sola ventana para tareas de revision o refactorizacion asistida.
- Analisis de documentacion tecnica extensa: ingestion de manuales, normativas o papers de cientos de paginas con cache de prefijo de contexto largo, manteniendo coherencia entre secciones.
- Prototipado de agentes con API compatible OpenAI: integracion en frameworks existentes apuntando a `http://127.0.0.1:12345/v1`, con MTP para reducir latencia en cadenas de varios pasos.
- Investigacion sobre cuantizacion MoE: el pack sirve como referencia reproducible para estudiar el impacto de EXL3 K4 en expertos enrutados frente al pack hermano de 2,5 bpw, con calibracion y hash documentados.
- Despliegue offline en entornos con requisitos de privacidad: al ejecutarse integramente en un Apple Silicon con streaming desde SSD, permite trabajar con datos sensibles sin salida a la nube.
- Generacion de codigo multilingue en ingles, chino, japones o coreano: util en equipos con documentacion en esos idiomas, no recomendado para castellano por la cobertura limitada declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del pack solo documenta validacion estructural (3.069 tensores indexados, 52 shards, presencia de las 48 capas de expertos y de la cabeza MTP) y metricas de despliegue: 68,46 GB de pesos indexados, huella del proceso de 66-68 GB con un modelo cargado y cache de prefijo de contexto largo, y tiempo de conversion de unas 2 h 21 min. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones medidas de calidad frente al modelo BF16.

## Requisitos de hardware

- Memoria: el pack esta disenado para Apple Silicon con 128 GiB de memoria unificada; el proceso en ejecucion ocupa 66-68 GB con un modelo cargado. Para maquinas de 48 GiB el autor remite al pack hermano de 2,5 bpw.
- GPU: exclusivamente Apple Silicon (probado en M5 Max). No hay soporte documentado para A100, H100 ni RTX 4090, ya que el runtime es MLX y el formato es Sushi.
- Almacenamiento: descarga completa de aproximadamente 100,48 GB decimales (93,58 GiB), de los cuales 32 GB corresponden a `ngram_table.bin`; se recomienda SSD externo por Thunderbolt o USB.
- Sistema operativo: macOS 26.2 o superior para esta version de Sushi.
- Despliegue: runtime Sushi 1.7.3 (`brew install beamivalice/tap/sushi`) con `sushi serve`; no compatible con vLLM, llama.cpp, Ollama ni TGI. La descarga debe hacerse con `hf download`, ya que `sushi pull` solo acepta el namespace `beamster`.
- Parametros de servicio relevantes: `--ctx-size 262144`, `--prefill-chunk 1024`, `--kv-quant 8`, `--mtp`, `--mtp-head-kv-quant`, `--vision`, `--no-drafter`, `--expert-pick-tolerance 0`, `--metrics`.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-Sushi-4bpw | 36,6B (MoE, 512 expertos/capa, top-10) | 262.144 nativo; 1.048.576 con YaRN | Sushi, Apple Silicon | qwen-community-1.0 | Objeto de esta ficha; 4 bpw en expertos |
| Darwin-180B-RSI-R3-Sushi-2.5bpw | mismo modelo base | mismo contexto | Sushi, Apple Silicon | qwen-community-1.0 | Pack hermano del mismo autor, medido para 48 GiB de memoria |
| FINAL-Bench/Darwin-180B-RSI-R3 | mismo modelo base | mismo contexto | BF16, Transformers | qwen-community-1.0 | Checkpoint original sin cuantizar; requiere mucha mas memoria |
| Modelos MoE densos comparables de ~30-40B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- El nombre "180B" no coincide con los parametros reales en safetensors (36,6B); conviene no usar la cifra comercial para estimaciones de memoria o coste.
- Dependencia total del runtime Sushi 1.7.3 y de macOS 26.2 o superior en Apple Silicon: no es portable a CUDA, ROCm ni a servidores x86 convencionales.
- La licencia qwen-community-1.0 impone condiciones adicionales al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- El castellano no figura entre los idiomas declarados (en, ko, zh, ja, multilingual), por lo que la calidad en espanol no esta garantizada.
- El pack no incluye la extension de 1M de contexto de forma nativa: el ajuste `yarn_factor 4` es una opcion de servicio que puede degradar la calidad en contextos muy largos.
- No hay benchmarks publicados de este pack; la model card advierte explicitamente que los resultados del modelo base no miden la calidad de esta cuantizacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un modelo de este tipo; requiere evaluacion propia antes de produccion.
- La cache de expertos en RAM es un objetivo de residencia (`--ssd-budget-gb`), no un limite duro de memoria; el estado KV, el computo temporal y la cache de ficheros del sistema necesitan memoria adicional.
- No se pueden cargar dos packs Darwin simultaneamente bajo el presupuesto de modelos residentes del servidor; Sushi rechaza la operacion en lugar de hacer swapping.
- El proceso de conversion no midio la huella fisica maxima, por lo que no hay datos fiables para planificar hardware de cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-4bpw
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Revision del modelo base usada en la conversion: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3/tree/31e434388ffcb0dcb7897fed33b3bc70302384e1
- Pack hermano de 2,5 bpw: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw
- Runtime Sushi: https://github.com/beamivalice/sushi
- Paper de referencia 1: https://arxiv.org/abs/2605.14386
- Paper de referencia 2: https://arxiv.org/abs/2609.20269
