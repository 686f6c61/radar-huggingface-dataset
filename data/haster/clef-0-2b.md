# haster/Clef-0.2B

## Resumen

Clef-0.2B es un Transformer decoder-only de unos 0,2B parametros (201.398.272 exactos) desarrollado por el usuario haster y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje generalista: es un modelo de generacion de musica simbolica (MusicXML / MIDI) entrenado desde cero sobre partituras, con un tokenizador propio de tipo bar-major REMI+ y un vocabulario de 9507 tokens a 24 TPQN. Dado un encabezado de condicionamiento corto (genero, ensemble, tempo, tonalidad, compas y un plan de instrumentos en numeros de programa General MIDI), genera una partitura multipista completa; ademas soporta las tareas CONTINUE (extender un prefijo dado) e INFILL (rellenar compases enmascarados).

La relevancia del modelo esta en su enfoque de representacion: al intercalar las pistas compas a compas, el modelo adquiere una nocion explicita de simultaneidad, lo que reduce el problema tipico de las voces que se quedan rezagadas o mueren antes de tiempo (metrica "early part death" de 0,10 y "co-termination spread" de 0,14). La percusion se codifica con el numero real de percusion General MIDI, de modo que la salida decodificada renderiza bombo, caja y charles correctamente sin remapeo display→GM.

Se distribuye como un unico fichero `model.safetensors` en layout `LlamaForCausalLM`, por lo que carga directamente en `transformers` o `vLLM`, pero el tokenizador es personalizado y no es un `AutoTokenizer`: la conversion a MusicXML/MIDI requiere el pipeline del propio proyecto. El checkpoint publicado es el resultado del instruction tuning sobre las tres tareas (GENERATE, CONTINUE, INFILL), no el checkpoint de preentrenamiento. Las busquedas web realizadas no han devuelto informacion adicional relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, SwiGLU y GQA |
| Parametros totales | 201.398.272 (~0,2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens maximo (entrenado con ventanas de 2048 tokens) |
| Tipos de cuantizacion | pesos publicados en bf16; no se publican versiones cuantizadas (sin GGUF, GPTQ ni AWQ en el repositorio); el entrenamiento se hizo en fp8 con torchao |
| Idiomas soportados | no disponible (modelo de musica simbolica; no declara idiomas naturales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) en layout `LlamaForCausalLM` con `config.json` asociado |
| Capas / d_model | 17 / 1024 |
| Cabezas de atencion / KV | 16 cabezas de consulta : 4 cabezas KV (GQA); FFN de 2816 |
| Tokenizador | `tokenizer_v2`, bar-major REMI+, vocabulario 9507, 24 TPQN, incluido en `tokenizer/` |
| Precisión de entrenamiento | fp8 (torchao) + `torch.compile` |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con codificacion posicional rotatoria (RoPE), normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA) en proporcion 16:4. Tiene 17 capas, dimension de modelo 1024 y FFN de 2816. El modelo se entreno en fp8 mediante torchao y `torch.compile`, y los pesos de inferencia se distribuyen en bf16. La verificacion numerica del autor indica que el layout Llama reproduce token a token la decodificacion greedy del checkpoint nativo de entrenamiento.

El preentrenamiento se hizo desde cero durante 3 epocas (13.821 pasos) con batch global de 256, sobre aproximadamente 1,18 millones de ventanas en formato bar-major construidas a partir de fuentes publicas y con aumento de datos por transposicion ×12. El ajuste por instrucciones (el checkpoint publicado) mezcla las tareas GENERATE, CONTINUE e INFILL con curacion "in-key" (ratio in-key ≥ 0,88) y un conjunto de replay de la base para limitar el olvido catastrofico; duro 760 pasos (2 epocas) y adopto el mejor val loss de 0,3088 en el paso 299. Todo el ajuste se ejecuto en una unica RTX PRO 6000 Blackwell de 96 GB a unos 80.000 tokens/s, en aproximadamente 45 minutos. La innovacion principal es la representacion bar-major REMI+, que intercala las pistas compas a compas y da al modelo una nocion explicita de simultaneidad entre instrumentos. El modelo card menciona "fuentes publicas listadas a continuacion", pero dicha lista no aparece en la informacion proporcionada.

## Capacidades

- Generacion de partituras multipista completas en MusicXML/MIDI a partir de un encabezado de condicionamiento nativo.
- Tarea GENERATE: composicion desde cero condicionada por genero, ensemble, tempo, clave y compas.
- Tarea CONTINUE: extension de un prefijo musical dado (12/12 de exito en la evaluacion del autor).
- Tarea INFILL: relleno de compases enmascarados dentro de una pieza existente (12/12 de exito).
- Condicionamiento de instrumentacion mediante programas General MIDI (`<TRACK_n>`, n = 0-127) y pista de percusion dedicada (`<DRUM_TRACK>`).
- Percusion codificada con el numero real de percusion General MIDI (resuelto desde `<part-list>/midi-instrument/midi-unpitched`), sin necesidad de remapeo display→GM.
- Conservacion de la dinamica: se preserva la velocity de las notas.
- Control de tonalidad con 7 modos: major, minor, dorian, phrygian, lydian, mixolydian y none, con armadura de -7 a +7 sostenidos/bemoles.
- Control de tempo (BPM entero de 5 a 999) y de compas (por ejemplo 4/4, 3/4, 6/8).
- Condicionamiento de genero (9 etiquetas: classical, popular, jazz, folk, electronic, soundtrack, world, religious, unknown) y de ensemble (7: solo, duo, band, chamber, orchestral, choir, other).
- Ventana de contexto de 4096 tokens, ampliable en la practica mediante stitching con CONTINUE para superar el limite.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni razonamiento general de proposito multiple.

## Casos de uso

- Maquetas rapidas para compositores y productores: especificando genero, ensemble, tonalidad, tempo y plan de instrumentos (por ejemplo `<GENRE_popular> <ENSEMBLE_band> <TEMPO_130> <KEY_0:minor> <METER_4/4>` con guitarra distorsionada, bajo y bateria), se obtiene un MIDI multipista listo para importar en un DAW y editar.
- Relleno de arreglos existentes: la tarea INFILL permite enmascarar compases concretos de una pieza y pedir al modelo que los complete respetando la tonalidad y los instrumentos circundantes, util para resolver bloqueos creativos o cubrir secciones incompletas de un encargo.
- Continuacion de bocetos musicales: dado un fragmento de partitura como prefijo, CONTINUE extiende la pieza; combinado con stitching repetido permite generar piezas de varios minutos, como demuestran las muestras de aproximadamente 3 minutos del repositorio.
- Produccion de musica incidental para audiovisual: con `<GENRE_soundtrack>` y `<ENSEMBLE_orchestral>` se generan bases orquestales en una tonalidad y compas fijos, adecuadas como borrador temporal sobre el que trabajar en postproduccion.
- Herramienta educativa de teoria musical: al condicionar clave, modo, compas y tempo, el modelo produce ejemplos que ilustran progresiones, modulaciones y arreglos por instrumentos; el ratio in-key de 0,81 y la metrica de disonancia (0,29 frente a ~0,15 de partituras humanas de referencia) permiten discutir tambien las desviaciones armonicas.
- Generacion de datasets musicales sinteticos: al producir MusicXML/MIDI con etiquetas explicitas de genero, ensemble, tonalidad, tempo y compas, sirve como fuente de datos etiquetados para entrenar o evaluar otros sistemas musicales.
- Prototipado y renderizado con herramientas estandar: la salida se renderiza con cualquier SoundFont General MIDI (por ejemplo MuseScore), lo que facilita escuchar el resultado sin infraestructura adicional.
- Investigacion en representaciones simbolicas: el esquema bar-major REMI+ es un objeto de estudio en si mismo (simultaneidad entre voces, co-terminacion de partes, codificacion de percusion GM nativa), y el modelo pequeno es barato de reentrenar y ablacionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica metricas de evaluacion musical automaticas sobre prompts reservados con 2 semillas:

| Metrica | Clef-0.2B | Partituras reales (referencia) |
|---|---:|---:|
| Ratio in-key (mayor mejor) | 0,81 | ~0,96 |
| Disonancia (menor mejor) | 0,29 | ~0,15 |
| Dispersion de co-terminacion (menor mejor) | 0,14 | no disponible |
| Muerte temprana de partes (menor mejor) | 0,10 | no disponible |

| Tarea | Exito (emite al menos 1 compas nuevo valido) |
|---|---:|
| CONTINUE | 12/12 |
| INFILL | 12/12 |

Nota metodologica: los valores son absolutos para este modelo y las partituras reales se ofrecen solo como ancla aproximada, segun el propio autor. No se proporcionan comparaciones con otros modelos musicales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,4 GB de pesos; con cache KV y overhead de runtime, la huella practica es inferior a 2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc. Tambien es viable la inferencia en CPU para generaciones cortas.
- Para entrenamiento o fine-tuning, el autor uso una RTX PRO 6000 Blackwell de 96 GB con fp8 y `torch.compile`; el ajuste por instrucciones completo requirio unos 45 minutos a unos 80.000 tokens/s.
- Aceleradores profesionales (A100, H100) no son necesarios para inferencia dado el tamano del modelo; serian utiles solo para reentrenamiento a gran escala o procesamiento masivo por lotes.
- Opciones de despliegue: `transformers` y `vLLM` son compatibles de forma directa gracias al layout `LlamaForCausalLM`; el modelo esta etiquetado como compatible con text-generation-inference (`text-generation-inference`, `endpoints_compatible`). No se publica GGUF, por lo que llama.cpp y Ollama no funcionan sin una conversion manual, y ademas el tokenizador bar-major REMI+ no es un `AutoTokenizer`, de modo que la codificacion/decodificacion a MusicXML/MIDI debe hacerse con el pipeline del proyecto.
- Latencia y throughput de inferencia: no publicados. El unico dato de rendimiento disponible es el de entrenamiento (unos 80.000 tokens/s en la RTX PRO 6000 Blackwell).
- Parametros de muestreo recomendados por el autor: `temperature 0.7`, `top_k 24`, `repetition_penalty ~1.12`; opcionalmente `top_p 0.95` y `presence_penalty 0.15` para mas variedad.

## Comparativa con modelos similares

La model card no incluye comparaciones con otros modelos y las busquedas web realizadas no devolvieron informacion relevante sobre Clef-0.2B. La comparativa siguiente es cualitativa y se limita a la categoria de generacion de musica; los campos no documentados se marcan como no disponibles para no introducir datos sin verificar.

| Modelo / familia | Categoria | Parametros | Contexto | Licencia | Formato de salida |
|---|---|---|---|---|---|
| Clef-0.2B | Musica simbolica condicionada, multipista | 201.398.272 | 4096 tokens | Apache 2.0 | MusicXML / MIDI (REMI+ bar-major) |
| MusicGen (Meta) | Generacion de audio musical | no disponible / no verificado en esta consulta | no disponible / no verificado | no disponible / no verificado | Audio |
| Anticipatory Music Transformer | Musica simbolica (infilling/continuacion) | no disponible en la informacion consultada | no disponible | no disponible | MIDI / eventos |
| MuseCoco | Musica simbolica a partir de texto | no disponible en la informacion consultada | no disponible | no disponible | MIDI |

Diferencias clave que si se pueden afirmar a partir de los datos del propio modelo: Clef-0.2B trabaja exclusivamente en dominio simbolico (no genera audio), su salida es multipista con percusion GM nativa y ofrece tres tareas explicitas (GENERATE, CONTINUE, INFILL) bajo un formato de condicionamiento por tokens especiales. Para el resto de modelos de la tabla no se dispone de cifras verificadas en esta consulta, por lo que cualquier comparacion numerica de parametros, contexto o rendimiento quedaria sin respaldo.

## Limitaciones y advertencias

- Riesgo de alucinacion musical: el ratio in-key de held-out es 0,81 frente a ~0,96 de partituras reales, y la disonancia es de 0,29 frente a ~0,15 de referencia. Es esperable que aparezcan notas fuera de la tonalidad condicionada y simultaneidades disonantes.
- El modelo card advierte de que las etiquetas de genero y ensemble son gruesas; `unknown` y `other` son valores validos y frecuentes, por lo que el control fino de estilo es limitado.
- La ventana de contexto es de 4096 tokens como maximo, aunque el preentrenamiento uso ventanas de 2048; para piezas largas hay que recurrir a stitching con CONTINUE, lo que puede introducir costuras estilisticas o armonicas.
- El tokenizador es personalizado y no es un `AutoTokenizer`: el uso de herramientas estandar que asumen tokenizadores de HuggingFace fallara al codificar o decodificar MusicXML/MIDI. Hay que usar el pipeline del proyecto.
- El layout de pesos es `LlamaForCausalLM`, lo que puede inducir a error: no es un modelo de lenguaje y no debe tratarse como tal en pipelines de chat o generacion de texto.
- No se publican versiones cuantizadas ni GGUF, lo que limita el despliegue en llama.cpp, Ollama u otros runtimes que dependan de ese formato.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos, pero conviene revisar la procedencia de los datos de entrenamiento, ya que el modelo card menciona "fuentes publicas" sin enumerarlas en la informacion disponible. Esto es un caveat relevante para produccion.
- El repositorio tiene 0 descargas y 1 like, un modelo recien publicado y con muy poca validacion externa; los unicos resultados disponibles son los del propio autor, sobre 2 semillas y 12 prompts por tarea.
- No se documentan sesgos en el sentido de sesgos sociales (no hay texto ni lenguaje natural), pero si existe un sesgo claro hacia las convenciones de la musica tonal occidental y hacia la notacion General MIDI.
- La lista concreta de fuentes de datos de preentrenamiento no aparece en la informacion proporcionada, lo que impide auditar la composicion del dataset y posibles sesgos de estilo o de repertorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haster/Clef-0.2B
- Muestras incluidas en el repositorio: `samples/promo_rock.mid` y `samples/promo_piano_concerto.mid` (piezas de aproximadamente 3 minutos generadas con los prompts de ejemplo, renderizables con cualquier SoundFont General MIDI, por ejemplo MuseScore)
- Tokenizador incluido en el repositorio: carpeta `tokenizer/` (tokenizer_v2, bar-major REMI+)
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a personas y eventos no relacionados (un trompetista y un jurista llamados Helmut Fuchs), por lo que no se incluyen. No se dispone de paper, blog tecnico, repositorio de codigo ni demo publica adicional en la informacion proporcionada.
