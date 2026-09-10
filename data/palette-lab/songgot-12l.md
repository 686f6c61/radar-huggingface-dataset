# palette-lab/songgot-12l

## Resumen

Songgot (송곳, "berbiquí" en coreano) es un modelo de lenguaje diminuto orientado a la llamada de herramientas (tool calling) en dispositivo, desarrollado desde cero por Hanish Keloth (Palette) bajo licencia Apache 2.0. Con 50.213.376 parámetros y 12 capas, está diseñado específicamente para una tarea acotada: dado un mensaje de usuario en coreano y un conjunto de herramientas disponibles en formato JSON, emitir una única llamada con el nombre de función y los argumentos correctos. No es un modelo conversacional generalista, sino un componente de enrutado de intenciones que puede ejecutarse en un móvil, un navegador o una CPU sin acelerador.

El interés del modelo es su relación entre tamaño y eficiencia en coreano. Su tokenizador SentencePiece BPE de 32.000 tokens con byte fallback consume 0,90 tokens por sílaba Hangul, frente a 0,98 de Gemma 3, 1,15 de Qwen3 y 3,47 de Needle 2, lo que reduce el coste de preprocesado y el consumo de contexto en una lengua con alfabeto propio. El autor publica además el scorer, los generadores de datos y los pesos en GGUF (f16, Q8_0, Q4_K_M), lo que permite reproducir la evaluación y desplegarlo en llama.cpp u Ollama.

La relevancia actual viene de que abre una alternativa local a los modelos grandes de function calling: en la benchmark FunctionChat-Bench SingleCall (500 ítems coreanos, 5 condiciones de herramientas) Songgot obtiene un 11,4 % de acierto exacto agregado y un 53,4 % de acierto solo en el nombre de la función, muy por debajo de Qwen3-0.6B (43,2 % y 70,8 %) pero por delante de FunctionGemma-270M (2,2 % y 36,2 %) y de Needle 2 (0 %). Es, por tanto, un modelo de nicho para escenarios con recursos mínimos y con validación en código de cada llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como `llama` en el repo), 12 capas, entrenado desde cero |
| Parametros totales | 50.213.376 (aproximadamente 50M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible (la model card no la declara) |
| Tipos de cuantizacion | GGUF: f16, Q8_0, Q4_K_M; pesos completos en safetensors |
| Idiomas soportados | Coreano (ko) e ingles (en); coreano como idioma primario |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (f16, Q8_0, Q4_K_M) |
| Tokenizer | SentencePiece BPE, vocabulario de 32k, byte fallback (`tokenizer.model`) |
| Tamano del repositorio | 0,9 GB |
| Libreria de referencia | transformers (tambien compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas y unos 50M de parámetros, entrenado desde cero (no es un destilado ni un fine-tuning de otro modelo) con un tokenizador SentencePiece BPE de 32.000 tokens y byte fallback. La ausencia de byte fallback en otros modelos pequeños explica en parte su ventaja en coreano: 0,90 tokens por sílaba Hangul frente a 1,15 de Qwen3 y 3,47 de Needle 2. El preentrenamiento se realizó sobre 6.000 millones de tokens en 8xH100 (Modal), usando fineweb-edu sample-10BT y la Wikipedia coreana de 20231101.ko. Después se aplicó un post-entrenamiento en dos fases: primero el conjunto "v4" (v3 más reescrituras en coreano de peticiones de glaive realizadas por Palette-K-Midm) y después el conjunto "v2" de tool calling. Los pesos publicados corresponden a Songgot 2 epochs, v4 set.

La innovación principal no está en el bloque transformer sino en el formato y en los datos. El formato de plantilla es explícito: bloque `<|system|>` con el array JSON de herramientas, bloque `<|user|>` con la petición, y bloque `<|call|>` con la llamada `{"name":...,"arguments":{...}}` cerrada por `<|end|>`. Los datos de tool calling son plantillas generadas en el repositorio y reescrituras coreanas de glaive-function-calling-v2 (Apache 2.0); el autor declara que no se usaron salidas de modelos cerrados y que FunctionChat-Bench nunca se utilizó para entrenar. No se documenta en la información disponible el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Selección de una única herramienta a partir de un catálogo JSON proporcionado en el bloque de sistema.
- Extracción de argumentos de la llamada en formato JSON, con valores derivados de la petición del usuario.
- Tool calling y function calling en coreano nativo, con soporte declarado también para inglés.
- Ejecución en dispositivo: el modelo está diseñado para inferencia local sin conexión (el autor ofrece una demo que corre en el navegador y funciona offline tras la primera carga).
- Generación de texto limitada al formato de llamada; no se documenta capacidad de conversación libre.
- Tokenización eficiente de Hangul (0,90 tokens por sílaba), lo que reduce coste y longitud de secuencia.
- No se documentan capacidades de visión, audio, matemáticas avanzadas, razonamiento multi-paso, uso de resultados de herramientas ni conversación multi-turno.

## Casos de uso

- Enrutado de intenciones en asistentes de voz para coreano: el modelo recibe la transcripción del usuario y un catálogo de acciones (poner alarma, enviar mensaje, poner temporizador) y devuelve la llamada concreta; con 50M de parámetros puede ejecutarse en el propio dispositivo y evitar enviar audio o texto a la nube.
- Aplicaciones móviles offline de productividad: integrado mediante llama.cpp u Ollama en Android o iOS, permite que una app responda a comandos en coreano sin conexión, con un coste de memoria de decenas de megabytes en Q4_K_M.
- Prefiltro de bajo coste en agentes con modelos grandes: usar Songgot para clasificar si una consulta requiere herramienta y con cuál, y delegar en un LLM mayor solo cuando la confianza o el resultado lo justifiquen, reduciendo el gasto en tokens de los modelos de mayor tamaño.
- Demos y widgets en navegador: al publicarse pesos GGUF y una demo ejecutable en el navegador, es viable incrustar el modelo en una página web para prototipos de asistentes en coreano sin backend.
- Investigación reproducible en tool calling de idiomas con alfabeto no latino: el repositorio incluye generadores de datos y scorer, lo que permite replicar la evaluación FunctionChat-Bench SingleCall y medir el efecto del tokenizador en coreano.
- Domótica e IoT con interfaz en coreano: un asistente local en una Raspberry Pi o un altavoz inteligente puede convertir frases como "내일 아침 7시에 알람 맞춰줘" en llamadas estructuradas a servicios locales, con validación posterior en el código de la aplicación.
- Normalización y limpieza de comandos en pipelines de datos: extraer función y argumentos de texto libre para poblar bases de datos o generar conjuntos de entrenamiento de mayor tamaño.
- Base para destilación o fine-tuning específico de dominio: al ser Apache 2.0 y de 50M de parámetros, es barato reentrenarlo o ajustarlo con las herramientas concretas de un producto, siempre que se respete la validación estricta de cada llamada.

## Benchmarks y rendimiento

Resultados publicados por el autor en FunctionChat-Bench SingleCall: 500 ítems en coreano, 5 condiciones de herramientas, coincidencia exacta en nombre de función y argumentos, con el scorer del repositorio. Valores en porcentaje.

| Modelo | Parametros | Exact | 4_random | 4_close | 8_random | 8_close | All | Name only |
|---|---|---|---|---|---|---|---|---|
| Songgot (2 epochs, v4 set) | 50M | 28,0 | 7,0 | 10,0 | 4,0 | 8,0 | 11,4 | 53,4 |
| Songgot-nano | 39M | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |
| Needle 2 | 45M | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| FunctionGemma-270M | 270M | 3,0 | 5,0 | 1,0 | 1,0 | 1,0 | 2,2 | 36,2 |
| Qwen3-0.6B | 600M | 48,0 | 49,0 | 45,0 | 37,0 | 37,0 | 43,2 | 70,8 |

Tokens por sílaba Hangul sobre las mismas 100 consultas: Songgot 0,90; Gemma 3 0,98; Qwen3 1,15; Needle 2 3,47.

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni curvas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en f16 unos 100 MB; en GGUF Q8_0 alrededor de 55 MB; en GGUF Q4_K_M alrededor de 35 MB. A esto hay que sumar la caché KV, cuyo tamaño no puede calcularse porque la longitud de contexto no está declarada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque no las necesita.
- Cabe en GPU de consumo y en hardware muy limitado: también es viable en CPU, en una Raspberry Pi y en un móvil moderno. El repositorio ocupa 0,9 GB porque incluye todas las variantes de pesos, no porque la inferencia requiera ese espacio.
- Opciones de despliegue: llama.cpp y Ollama mediante los GGUF incluidos (f16, Q8_0, Q4_K_M); transformers para los safetensors; text-generation-inference y endpoints compatibles segun los tags del repositorio. El tokenizador debe cargarse con `sentencepiece` directamente, ya que los tokens especiales viven dentro del vocabulario.
- Latencia y throughput estimados: no disponibles. El único dato de cómputo publicado es de entrenamiento (8xH100 en Modal sobre 6.000 millones de tokens), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FunctionChat-Bench (All / Name only) | Licencia | Formato |
|---|---|---|---|---|---|
| Songgot (este modelo) | 50M | no disponible | 11,4 / 53,4 | Apache 2.0 | safetensors, GGUF |
| Songgot-nano | 39M | no disponible | pendiente | Apache 2.0 (segun el proyecto) | no disponible |
| Needle 2 | 45M | no disponible | 0,0 / 0,0 | no disponible | no disponible |
| FunctionGemma-270M | 270M | no disponible | 2,2 / 36,2 | no disponible | no disponible |
| Qwen3-0.6B | 600M | no disponible | 43,2 / 70,8 | no disponible | no disponible |

La comparativa directa favorece a Qwen3-0.6B en precisión, pero con 12 veces más parámetros. Frente a FunctionGemma-270M, Songgot es cinco veces menor y obtiene mejor acierto exacto agregado; frente a Needle 2, la diferencia es total en esta benchmark. El dato diferencial de Songgot en el segmento es su coste de tokenización en coreano (0,90 tokens por sílaba) y su licencia Apache 2.0 explícita.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo selección de una herramienta y extracción de argumentos en una única llamada. No soporta multi-turno, ni resultados de herramientas, ni conversación libre.
- Precisión baja en términos absolutos: 11,4 % de acierto exacto agregado y 53,4 % solo en el nombre de la función. El autor recomienda validar cada llamada en el código de la aplicación antes de ejecutarla.
- Degradación clara al aumentar el número de herramientas: con 8 herramientas y nombres poco distinguibles ("8_close") el acierto exacto cae al 4,0 %.
- Fragilidad ante herramientas poco frecuentes y valores parafraseados, según advierte la propia model card.
- Riesgo de alucinación de nombres de función o de argumentos inexistentes, especialmente fuera del dominio de las plantillas de entrenamiento.
- Idiomas: el modelo está orientado al coreano y declara inglés, pero no se documenta rendimiento en otros idiomas; el uso en castellano no está respaldado por ninguna evaluación.
- Longitud de contexto no declarada, lo que impide planificar escenarios con catálogos de herramientas extensos o historiales largos.
- Licencia Apache 2.0 para el modelo, pero el texto de entrenamiento incluye Wikipedia coreana bajo CC BY-SA 3.0, cuya atribución y cláusula de compartir igual se recogen en la model card; conviene revisar la implicación si se redistribuyen derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y pesos correspondientes a una revisión concreta ("2 epochs, v4 set") que puede cambiar; conviene fijar la revisión al desplegar.
- No se han publicado datos de sesgo, evaluación de seguridad ni comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palette-lab/songgot-12l
- Paper: https://hanishkeloth.github.io/songgot
- Codigo, generadores de datos y scorer: https://github.com/hanishkeloth/songgot
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Hanish/songgot
- Aplicacion en navegador: https://hanishkeloth.github.io/songgot/app/
- Figura de tokens por silaba Hangul: https://hanishkeloth.github.io/songgot/fig1_tokens.png
- Figura de precision por condicion: https://hanishkeloth.github.io/songgot/fig2_bench.png
- Figura de perdida de preentrenamiento: https://hanishkeloth.github.io/songgot/fig3_loss.png
- Conjunto de datos de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Wikipedia coreana: https://huggingface.co/datasets/wikimedia/wikipedia
- Conjunto de tool calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: todos los enlaces obtenidos corresponden a palets de madera y suministros de bricolaje, por lo que no se incluyen.
