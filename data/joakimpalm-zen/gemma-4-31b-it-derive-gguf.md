# Joakimpalm-Zen/gemma-4-31B-it-derive-GGUF

## Resumen

`Joakimpalm-Zen/gemma-4-31B-it-derive-GGUF` es una cuantización GGUF del modelo `google/gemma-4-31B-it`, generada con la herramienta `runner derive` a partir de una conversión BF16 del checkpoint original. El archivo resultante, `gemma-4-31B-it-derive-22GB.gguf`, ocupa 21.991.067.552 bytes (35,8 % del padre BF16 de 61.413.189.536 bytes) y contiene únicamente el modelo de lenguaje: 833 tensores, 830 de ellos en los 60 bloques transformer, más `token_embd`, `output_norm` y `rope_freqs`. No incluye torre de visión, torre de audio ni proyector, por lo que la entrada multimodal no es posible con este archivo.

La relevancia de esta ficha no está en el modelo base, sino en la metodología de cuantización mixta: en lugar de aplicar un único tipo de cuantización a todos los tensores, el recipe demota 411 grupos tensor a tensor por una escalera de q8_0 a q3_k, un escalón cada vez, priorizando los pasos que añaden menos error de round-trip por byte ahorrado. El resultado se mide contra el modelo del publicador en float32 con KLD medio y top-1 sobre un corpus de chat privado de 3.600 posiciones.

El modelo base es un transformer denso de 30.697.345.596 parámetros (aproximadamente 31B) con licencia Apache 2.0 declarada en esta derivación, aunque el archivo padre no declaraba `general.license`. La ficha del autor reporta que el archivo pasa el umbral de fidelidad fijado: KLD medio 0,0354 (umbral 0,05) y top-1 margin-qualified 98,66 % (umbral 97 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma4ForConditionalGeneration en el modelo base); este GGUF contiene solo el modelo de lenguaje |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 en la receta de derivación; el fit report se calcula para 4096 y 8192 |
| Tipos de cuantizacion | Mixta: escalera q8_0, q6_k, q5_k, q4_k, q3_k con 411 grupos demotados; `general.file_type` = 17 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada con `--license`; el padre no declaraba `general.license`) |
| Formato de pesos | GGUF (archivo `gemma-4-31B-it-derive-22GB.gguf`, 21.991.067.552 bytes) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de aproximadamente 31B parámetros. Esta derivación no entrena ni ajusta el modelo: parte de `gemma-4-31B-it-BF16.gguf` (61.413.189.536 bytes, sha256 `e310f194...`), una conversión BF16 del checkpoint del publicador en el commit `842da3794eaa0b77d5f08bae87a17459d91ff475`, y aplica una cuantización selectiva con `runner derive`.

La innovación técnica de esta ficha es el método de cuantización: la receta fija un objetivo de 22.000.000.000 bytes y demota 411 grupos tensor a lo largo de la escalera q8_0 → q6_k → q5_k → q4_k → q3_k, un escalón por paso, ordenando los pasos por error de round-trip añadido por byte ahorrado. La medición de fidelidad se hace contra el modelo del publicador en float32 (pesos BF16 upcast en uso), con KL calculada sobre los 20 tokens más probables de la referencia, renormalizando ambos lados. Una posición se considera margin-qualified cuando los dos tokens más probables de la referencia están separados por más de 0,5 nats. Los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Capacidades

- Generación de texto conversacional: el archivo se ha medido sobre un corpus de chat (`gchat2-chat-corpus.txt`), lo que indica un uso previsto orientado a diálogo.
- Razonamiento y generación de lenguaje de propósito general, heredados del modelo base de 31B parámetros.
- No dispone de capacidades de visión: el header no contiene tensores de torre de visión ni proyector.
- No dispone de capacidades de audio: el header no contiene tensores de torre de audio ni proyector.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de 24 GB: el fit report indica que con contexto 4096 la caché KV en f16 ocupa 3,44 GiB y los pesos 20,48 GiB, cabiendo las 60 capas en la GPU con el KV ring y dejando 1,50 GiB en RAM del sistema. Es el escenario principal de este archivo.
- Despliegue conversacional de contexto medio: con 4096 tokens de ventana y un modelo de 31B, encaja en asistentes de chat autoalojados donde se requiere calidad cercana al modelo original sin disponer de hardware de gama alta.
- Sustituto de bajo coste del checkpoint BF16: al ocupar el 35,8 % del padre, reduce los requisitos de almacenamiento y de ancho de banda de memoria en un factor cercano a 2,8, manteniendo un KLD medio de 0,0354 frente a la referencia float32.
- Evaluación de pipelines de cuantización: el archivo incluye registros (`*.derive.json`, `*.quant.json`) con sha256, receta, ventana y medición, útiles para reproducir o auditar el proceso de derivación en un entorno de investigación.
- Prototipado de aplicaciones de texto en local: al no incluir torres multimodales, el archivo es adecuado para pipelines puramente textuales donde no se necesita visión ni audio.
- Servicio de generación de texto en una sola GPU consumer de gama alta: con contexto 8192 la caché KV en f16 sube a 6,88 GiB y las 60 capas siguen cabiendo en la GPU con el KV ring, lo que permite ventanas más largas a costa de más memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark de tarea y que la medición se hizo sobre un único texto de chat de 3.600 posiciones.

La única tabla de rendimiento disponible es la de fidelidad frente al modelo del publicador en float32:

| Referencia | Posiciones | KLD medio | KLD mediana | KLD máxima | Top-1 | Top-1 margin-qualified |
|---|---:|---:|---:|---:|---:|---:|
| Publicador, float32 | 3600 | 0,0354 | 0,0002 | 9,8200 | 96,81 % | 98,66 % de 3350 |

Comparación con dos reescrituras uniformes del mismo padre, medidas sobre el mismo texto y las mismas posiciones (intervalos de confianza al 95 % por bootstrap circular de bloques):

| Archivo | Bytes | KLD medio [IC 95 %] | Top-1 margin-qualified % [IC 95 %] | Top-1 % | Umbral |
|---|---:|---|---|---:|---|
| q5_k uniforme | 21.124.671.392 | 0,0513 [0,0336; 0,0730] | 98,42 [97,88; 98,90] | 96,39 | no decidido |
| este archivo | 21.991.067.552 | 0,0354 [0,0246; 0,0479] | 98,66 [98,17; 99,11] | 96,81 | pasa |
| q6_k uniforme | 25.201.485.728 | 0,0167 [0,0098; 0,0256] | 99,49 [99,22; 99,73] | 97,72 | pasa |

Frente al q5_k uniforme, este archivo tiene un KLD medio inferior en 0,0158 (IC 95 %: 0,0032 a 0,0342) y su top-1 margin-qualified no se distingue estadísticamente. Frente al q6_k uniforme, este archivo tiene un KLD medio superior en 0,0187 (IC 95 %: 0,0084 a 0,0303), y en las posiciones margin-qualified donde discrepan, q6_k coincide con la referencia 36 veces frente a 8 de este archivo.

## Requisitos de hardware

- VRAM estimada: pesos 20,48 GiB; caché KV f16 de 3,44 GiB a contexto 4096 y 6,88 GiB a contexto 8192.
- GPU de 24 GB: el fit report, tomado con `runner --info fit` sobre una partición de 24 GB con presupuesto de offload de 23,40 GiB, indica que las 60 capas caben en la GPU con el KV ring tanto a 4096 como a 8192, dejando 1,50 GiB en RAM del sistema a contexto 4096.
- GPU recomendadas: no disponible en la información proporcionada (no se especifican modelos concretos como A100, H100 o RTX 4090).
- Cabe en GPU consumer: sí, según el fit report para una GPU de 24 GB; no se detalla qué modelos concretos.
- Opciones de despliegue: motores de inferencia GGUF (el autor menciona "local inference in GGUF engines"); no se enumeran vLLM, llama.cpp, Ollama ni TGI de forma explícita.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento medido |
|---|---:|---|---|---|---|
| Este archivo | 30.697.345.596 | 4096 (receta); fit a 4096 y 8192 | GGUF mixto, 21.991.067.552 bytes | apache-2.0 | KLD medio 0,0354; top-1 96,81 % |
| q5_k uniforme del mismo padre | 30.697.345.596 | no disponible | GGUF uniforme, 21.124.671.392 bytes | no disponible | KLD medio 0,0513; top-1 96,39 % |
| q6_k uniforme del mismo padre | 30.697.345.596 | no disponible | GGUF uniforme, 25.201.485.728 bytes | no disponible | KLD medio 0,0167; top-1 97,72 % |
| `google/gemma-4-31B-it` (referencia float32) | 30.697.345.596 | no disponible | safetensors / BF16 | no disponible | referencia de la medición |

Los dos archivos uniformes son comparaciones citadas por el autor y no están en este repositorio. No se dispone de comparación con modelos de otros autores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es una reescritura cuantizada del checkpoint `google/gemma-4-31B-it`; no debe presentarse como un modelo del publicador.
- La medición de fidelidad se hizo sobre un único texto de chat privado (`gchat2-chat-corpus.txt`, sha256 `e6d9af82...`) que no está en el repositorio, por lo que la medición no se puede reproducir solo con los archivos publicados.
- El corpus de medición tiene 3.600 posiciones y no se ejecutó ningún benchmark de tarea; el rendimiento en tareas reales (razonamiento, código, matemáticas) no está caracterizado.
- Top-1 del 96,81 %: en aproximadamente una de cada 31 posiciones el token más probable difiere del de la referencia float32.
- KLD máxima de 9,8200 en la medición indica que existen posiciones con divergencia muy alta respecto a la referencia, aunque la mediana sea 0,0002.
- El archivo contiene solo el modelo de lenguaje: no admite entrada de imagen ni de audio, y no hay archivo de proyector en el repositorio.
- Los campos `general.name` y `general.finetune` del GGUF contienen el id de commit del publicador (`842da3794eaa0b77d5f08bae87a17459d91ff475`), no un nombre de modelo; los motores que muestren estos campos mostrarán el id.
- La licencia apache-2.0 se declara en esta derivación con `--license`, pero el archivo padre no declaraba `general.license`; conviene verificar los términos del modelo base antes de un uso comercial.
- No hay datos sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones específicas de producción en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Joakimpalm-Zen/gemma-4-31B-it-derive-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Commit del modelo base referenciado: `842da3794eaa0b77d5f08bae87a17459d91ff475`
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a esta derivación.
