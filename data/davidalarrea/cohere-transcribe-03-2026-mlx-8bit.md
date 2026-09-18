# davidalarrea/cohere-transcribe-03-2026-mlx-8bit

## Resumen

El modelo `davidalarrea/cohere-transcribe-03-2026-mlx-8bit` es una version cuantizada a 8 bits del checkpoint `beshkenadze/cohere-transcribe-03-2026-mlx-fp16`, que a su vez deriva de `CohereLabs/cohere-transcribe-03-2026`, un sistema de reconocimiento automatico del habla (ASR) desarrollado por Cohere Labs. Se publica como artefacto de inferencia para el runtime MLX de Apple, con el objetivo de reducir el consumo de memoria del modelo original sin degradar la calidad de transcripcion. No es un modelo entrenado desde cero: es una redistribucion cuantizada, y por tanto su licencia y sus caracteristicas heredan las del modelo base.

El modelo resuelve la tarea de speech-to-text en ingles (`en`), con un pipeline declarado de `automatic-speech-recognition` y un total de 2.064.722.176 parametros (aproximadamente 2,06 mil millones). La cuantizacion aplicada es de tipo `affine` con tamano de grupo 64, lo que permite ejecutar la inferencia en equipos Apple Silicon con memoria unificada modesta: el autor reporta un pico de memoria de 2,87 GB durante la generacion en la muestra de prueba del repositorio.

Su relevancia actual es practica mas que cientifica: permite desplegar un modelo ASR de 2B parametros en un Mac sin GPU dedicada, con una velocidad declarada de 352,9 tokens por segundo en la muestra incluida, y con paridad semantica verificada frente a las rutas fp16 en Swift y Python, asi como frente a la ruta CUDA de referencia con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base usa codigo personalizado, tag `custom_code`; categoria ASR) |
| Parametros totales | 2.064.722.176 (aprox. 2,06 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, modo `affine`, group size 64 (existe variante fp16 del mismo autor) |
| Idiomas soportados | ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (formato MLX), acompanado de `config.json`, `tokenizer.model`, `tokenizer_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `key_map.json`, `conversion_summary.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (`CohereLabs/cohere-transcribe-03-2026`): no se especifica si se trata de un transformer encoder-decoder, de un encoder con decoder autorregresivo ni el tipo de capas de atencion. Lo unico confirmado es que el pipeline es de reconocimiento automatico del habla, que el modelo emplea codigo personalizado (etiqueta `custom_code`, lo que obliga a cargarlo con `trust_remote_code` o con un runtime especifico) y que su tokenizador se distribuye en formato SentencePiece (`tokenizer.model`).

Tampoco se han publicado en la informacion proporcionada datos sobre el corpus de entrenamiento, el numero de tokens de audio procesados, la composicion del dataset ni si hubo etapas de ajuste con RLHF o DPO. El repositorio analizado es exclusivamente un artefacto de inferencia: el autor indica de forma explicita que se trata de pesos cuantizados derivados de un checkpoint fp16 generado para Swift, y remite a la model card y licencia del modelo original de Cohere para los detalles de entrenamiento.

La innovacion tecnica relevante en este checkpoint concreto es la cuantizacion MLX de 8 bits con modo `affine` y group size 64, que reduce el peso en disco a 2,4 GB de repositorio y permite un pico de memoria declarado de 2,87 GB. El autor afirma haber revalidado la paridad semantica del checkpoint contra los runtimes actuales de MLX en Swift y Python, y contra la ruta CUDA oficial basada en `transformers`, sobre una locucion de prueba en ingles.

## Capacidades

- Transcripcion de voz a texto en ingles, con salida de texto plano.
- Procesamiento de audio conversacional (la muestra de referencia del repositorio es `Tests/media/conversational_a.wav`).
- Inferencia en modo local sobre Apple Silicon mediante MLX, tanto desde Python como desde Swift.
- Cuantizacion de 8 bits con paridad semantica declarada frente a fp16 en las pruebas del autor.
- Generacion a 352,9 tokens por segundo en la muestra de referencia, con 2,87 GB de pico de memoria.
- No se ha documentado en la informacion disponible soporte de tool calling, function calling, capacidades de agente, vision, audio generativo, modo de razonamiento explicito ni multitarea mas alla del ASR.
- Cobertura multilingue: no disponible; el modelo se declara unicamente en ingles.

## Casos de uso

- Transcripcion local en Mac sin GPU dedicada: con 2,87 GB de pico de memoria, el modelo se ejecuta en portatiles Apple Silicon de 8 GB o mas, lo que permite dictado y transcripcion de audio sin enviar datos a servicios en la nube.
- Subtitulado de podcasts y videos en ingles: dado su tamano reducido, se puede procesar por lotes un catalogo de episodios en un solo equipo, generando transcripciones base que despues se sincronizan como subtitulos.
- Actas y notas de reunion: la muestra de referencia es audio conversacional, de modo que el modelo encaja en la transcripcion de reuniones en ingles para generar resumenes posteriores mediante otro modelo de lenguaje.
- Analitica de centros de contacto: transcripcion masiva de llamadas en ingles para clasificacion de motivos, control de calidad y busqueda de texto completo sobre el contenido hablado.
- Accesibilidad: generacion de subtitulos en tiempo real o diferido para contenido de audio en ingles destinado a personas con discapacidad auditiva.
- Aplicaciones nativas Swift para macOS e iOS: al existir una ruta de paridad verificada en Swift MLX, el modelo se puede integrar directamente en apps nativas del ecosistema Apple sin capa de Python.
- Archivado y busqueda de material audiovisual: transcripcion de fondos de audio historicos en ingles para indexarlos y hacerlos consultables por texto.
- Investigacion sobre cuantizacion: sirve como caso de estudio reproducible para medir la perdida de calidad entre fp16 y 8 bits en un modelo ASR de 2B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval u otros) en la informacion disponible. El unico dato de rendimiento medible aportado por el autor es el siguiente:

| Metrica | Valor | Condiciones |
|---|---|---|
| Generation TPS | 352,9 tokens/s | Muestra `Tests/media/conversational_a.wav`, runtime MLX |
| Pico de memoria | 2,87 GB | Misma muestra |
| Paridad semantica | Verificada | Frente a Swift MLX fp16, Swift MLX 8-bit, Python MLX fp16, Python MLX 8-bit y ruta CUDA de referencia con `transformers` |

La verificacion de paridad se realizo sobre una locucion fija en ingles: «This is a test recording in English. I am speaking clearly at a normal speed. Please transcribe this sentence exactly as I said.». No se aportan cifras de tasa de error de palabras (WER) ni comparaciones cuantitativas de calidad frente a fp16 mas alla de la afirmacion de que el resultado «coincide con fp16» en la muestra del repositorio.

## Requisitos de hardware

- Peso en disco del repositorio: 2,4 GB en total, de los cuales la mayor parte corresponde a `model.safetensors` en 8 bits.
- Pico de memoria medido en inferencia: 2,87 GB (dato del autor sobre la muestra de referencia).
- Memoria estimada para la variante fp16 equivalente: alrededor del doble del peso cuantizado, es decir, del orden de 4 GB solo en pesos; cifra estimada, no publicada en la informacion disponible.
- Plataforma obligatoria: MLX, lo que en la practica restringe la ejecucion a Apple Silicon (familia M1, M2, M3, M4 y posteriores) con memoria unificada.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs con 8 GB de memoria unificada o mas; el dato de VRAM para GPU NVIDIA no esta disponible porque MLX no es un runtime CUDA.
- GPU recomendadas: no aplica para esta build; la ruta CUDA de referencia corresponde al modelo base sin cuantizar y requiere cargarlo con `transformers`, no con estos pesos.
- Opciones de despliegue: runtime MLX en Python y en Swift; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son runtimes MLX.
- Latencia y throughput: 352,9 tokens/s declarados en la muestra del repositorio; no hay datos de latencia de primera token ni de throughput en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime | Rendimiento comparado |
|---|---|---|---|---|---|---|
| cohere-transcribe-03-2026-mlx-8bit (este) | 2,06 B | no disponible | en | Apache 2.0 | safetensors MLX, 8 bits | 352,9 tokens/s y 2,87 GB de pico en la muestra del autor |
| CohereLabs/cohere-transcribe-03-2026 (base) | no disponible | no disponible | no disponible | Apache 2.0 | pesos originales del autor | no disponible |
| beshkenadze/cohere-transcribe-03-2026-mlx-fp16 | no disponible | no disponible | no disponible | no disponible en la informacion aportada | safetensors MLX, fp16 | no disponible |

No se han proporcionado en la informacion disponible datos de otros modelos ASR comparables (por ejemplo, variantes de Whisper) con los que establecer una comparacion cuantitativa fiable, por lo que las filas restantes se marcan como no disponibles. Cualquier comparacion de WER o de velocidad frente a terceros requeriria ejecutar ambos modelos sobre el mismo conjunto de audio.

## Limitaciones y advertencias

- Cobertura linguistica limitada al ingles: no se debe esperar transcripcion correcta de audio en castellano ni en otros idiomas.
- No hay datos publicados de sesgo acustico: se desconoce el comportamiento con acentos no estandar, audio con ruido, solapamiento de hablantes o voces infantiles.
- Riesgo de alucinacion inherente a los modelos ASR generativos: en segmentos con silencio, musica o ruido, el modelo puede producir texto plausible que no se corresponde con el audio.
- No se han publicado cifras de WER, de modo que no es posible cuantificar la degradacion introducida por la cuantizacion a 8 bits frente a fp16 mas alla de la muestra verificada por el autor.
- Longitud de contexto y limites de duracion de audio no documentados: se desconoce el maximo de audio procesable en una sola pasada.
- Dependencia del runtime MLX: no es un checkpoint portable a CUDA, vLLM, llama.cpp u Ollama sin reconversion.
- Requiere codigo personalizado (tag `custom_code`) y ficheros auxiliares propios (`key_map.json`, `conversion_summary.json`), lo que complica la integracion en pipelines genericos.
- Es un artefacto de inferencia derivado de terceros y no el modelo oficial: el autor remite a la model card original de Cohere para cualquier detalle de entrenamiento, uso previsto o clausulas de licencia.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `CohereLabs/cohere-transcribe-03-2026` antes de desplegarlo en produccion.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto recien publicado y sin validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidalarrea/cohere-transcribe-03-2026-mlx-8bit
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Checkpoint fp16 de origen citado en la model card: https://huggingface.co/beshkenadze/cohere-transcribe-03-2026-mlx-fp16
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada (los resultados de busqueda web facilitados no guardan relacion con el modelo y se han descartado).
