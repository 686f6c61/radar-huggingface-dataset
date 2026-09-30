# drewbie/jazz-pianist-style-generator

## Resumen

El modelo `drewbie/jazz-pianist-style-generator` es un generador condicional de musica simbolica (MIDI) desarrollado por Drew Edwards en el marco de un trabajo academico presentado en ISMIR 2026, con la colaboracion de Akira Maezawa y Simon Dixon. Su objetivo no es la generacion de musica generica, sino el modelado del estilo interpretativo de pianistas de jazz concretos: parte de un modelo base Aria-medium de 659 millones de parametros y le anade un adaptador de cross-attention con puerta (gated) sobre 12 embeddings de pianista aprendidos, insertado en las ultimas 8 de las 16 capas del transformer.

El problema que aborda es un fallo conocido de los modelos autorregresivos condicionados por prefijo: cuando se condiciona mediante un prompt inicial, el efecto del estilo se diluye a medida que avanza la generacion. Este modelo resuelve ese decaimiento inyectando la condicion en cada paso a traves de cross-attention, de forma que la identidad estilistica persiste durante secuencias largas. Segun la model card, un clasificador de ventana deslizante atribuye las continuaciones condicionadas al pianista objetivo aproximadamente 33 puntos mas a menudo que las lineas base no condicionadas.

Se trata de una herramienta de investigacion, no de un producto. El propio autor la enmarca en la tradicion de los estudios pedagogicos de Dick Hyman y advierte explicitamente de que no debe usarse para producir imitaciones convincentes ni para suplantar a los artistas modelados. El repo ocupa 2,9 GB, tiene licencia Apache-2.0 y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (base Aria-medium) con cross-attention condicionada con puerta en las capas 8 a 15 de 16 |
| Parametros totales | 734.085.128 (safetensors); el modelo base Aria-medium aporta 659 M y el resto corresponde al adaptador de cross-attention y los embeddings de artista |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no publica la ventana de secuencia; los embeddings de artista usan 4 vectores de contexto, un parametro distinto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; solo pesos en safetensors) |
| Idiomas soportados | no aplica: el modelo opera sobre musica simbolica (MIDI), no sobre lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch); `model.safetensors`, `artist_embeddings.safetensors`, `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder autorregresivo sobre tokens de musica simbolica. Sobre el modelo base Aria-medium (659 M de parametros, 16 capas) se anade un mecanismo de cross-attention con puerta que se inserta en las ocho capas finales (8 a 15), con `dropout` de 0,1 y una inicializacion de puerta (`gate_init`) de 0,1. La condicion de estilo se inyecta como un conjunto de 12 embeddings de artista aprendidos, cada uno con 4 vectores de contexto, gestionados por la clase `ArtistEmbedding(num_artists=12, d_model, context_length=4)`. Al aplicarse en cada capa condicionada y en cada paso de decodificacion, la senal de estilo no decae con la longitud de la secuencia, a diferencia del condicionamiento por prefijo.

El ajuste fino se realizo sobre PiJAMA-12, derivado del dataset PiJAMA. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se detalla el esquema de optimizacion, la tasa de aprendizaje o el numero de pasos. Los 12 pianistas fueron seleccionados por su separabilidad estilistica, lo que acota el alcance del modelo a ese conjunto cerrado. El codigo depende de la libreria Aria (EleutherAI) y del paquete `llama_pijama.models`, por lo que no es cargable con APIs estandar de Hugging Face sin el codigo acompanante.

## Capacidades

- Generacion de musica simbolica en formato MIDI, de forma autorregresiva y condicionada.
- Condicionamiento estilistico explicito sobre 12 embeddings de pianista aprendidos, seleccionados por separabilidad estilistica.
- Persistencia del estilo durante generaciones largas gracias a la cross-attention por capas, con una ventaja reportada de unos 33 puntos de atribucion correcta frente a lineas base no condicionadas.
- Generacion de continuaciones condicionadas: el modelo parte de un fragmento y prolonga la interpretacion manteniendo la identidad del pianista objetivo.
- Carga modular en PyTorch mediante `safetensors` y las clases `CrossAttentionTransformerLM` y `ArtistEmbedding`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion simbolica explicita.
- No tiene capacidades multilingues, de vision ni de audio: la entrada y la salida son eventos musicales discretos, no texto ni audio en crudo.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de instruccion en lenguaje natural.

## Casos de uso

- Investigacion en recuperacion de informacion musical (MIR): analisis controlado de hasta que punto un modelo puede aislar y reproducir rasgos de estilo pianistico, usando los 12 embeddings como variable independiente.
- Herramienta pedagogica de estilo: generar etudes o ejercicios estilisticamente coherentes para el estudio de recursos interpretativos, en la linea que el propio autor cita de Dick Hyman.
- Estudio de atribucion estilistica: alimentar el clasificador de ventana deslizante con continuaciones condicionadas y no condicionadas para medir la persistencia del estilo a lo largo de la secuencia.
- Experimentos de condicionamiento frente a prompting: comparar el mismo modelo base con condicionamiento por prefijo y con cross-attention para cuantificar el decaimiento estilistico.
- Aumento de datos para MIR: generar continuaciones estilisticamente etiquetadas que amplien corpus de entrenamiento para tareas de clasificacion de interprete, con la cautela de que se trata de material sintetico.
- Prototipado de interfaces de generacion controlada: integrar el modelo en un editor MIDI que permita seleccionar el embedding de pianista como parametro y regenerar pasajes concretos.
- Creacion asistida con supervision humana: usar el modelo como generador de borradores sobre los que un interprete trabaja, asumiendo las advertencias de consentimiento y atribucion del autor.
- Docencia en IA musical: caso de estudio reproducible de adaptacion de un modelo base a una tarea condicionada mediante cross-attention sobre 8 de 16 capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ademas, al operar sobre musica simbolica, esas metricas no serian aplicables. La unica medida publicada es la evaluacion interna con clasificador de ventana deslizante descrita en la model card:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Atribucion de estilo con clasificador de ventana deslizante | Diferencia de aciertos a favor de las continuaciones condicionadas | Aproximadamente +33 puntos frente a lineas base no condicionadas |
| Valor absoluto de acierto del clasificador | no disponible | |
| Perplejidad, precision tonal u otras metricas musicales | no disponible | |

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (734.085.128) y del tamano del repo (2,9 GB); no son datos publicados por el autor:

- Peso de los pesos en fp32: aproximadamente 2,94 GB (coincide con el tamano del repo de 2,9 GB).
- Peso en bf16/fp16: aproximadamente 1,47 GB.
- Peso en int8: aproximadamente 0,73 GB.
- Peso en int4: aproximadamente 0,37 GB.
- A lo anterior hay que sumar el estado del optimizador en entrenamiento, las activaciones y los embeddings de artista (una cantidad menor, 12 artistas x 4 vectores de contexto).
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4090, asi como en GPUs de datacenter (A100, H100) si se necesita procesar lotes grandes.
- La inferencia en CPU es viable por el tamano del modelo, aunque no se publican cifras de latencia.
- Opciones de despliegue: no se conocen soportes para vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura incorpora un adaptador de cross-attention propio. La carga requiere el codigo de la libreria Aria y `llama_pijama.models`, tal como muestra el ejemplo de la model card.
- No se publican variantes GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos tecnicos verificables de alternativas equivalentes en la informacion proporcionada. La busqueda web devuelve generadores de musica comerciales orientados a audio (Tunee AI, MusicCreator, Kenerate AI, Musely) y el proyecto historico deepjazz, ninguno de ellos directamente comparable en parametros, contexto o licencia. Se incluye la comparacion con los datos disponibles:

| Modelo | Enfoque | Parametros | Condicionamiento de estilo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drewbie/jazz-pianist-style-generator | Musica simbolica MIDI, transformer con cross-attention | 734 M | 12 embeddings de pianista, persistente por capas | Apache-2.0 | Hugging Face, safetensors |
| deepjazz (jisungk) | Musica simbolica MIDI, LSTM de 2 capas | no disponible | no disponible (aprendizaje por fichero MIDI) | no disponible | GitHub |
| Tunee AI (generador de jazz) | Audio generado por descripcion textual | no disponible | texto | propietaria | servicio web |
| Kenerate AI (generador de piano) | Audio a partir de descripcion de estilo y tempo | no disponible | texto | propietaria | servicio web |
| Musely (improvisacion de jazz para piano) | Audio | no disponible | texto | propietaria | servicio web |

## Limitaciones y advertencias

- El modelo solo modela a los 12 pianistas incluidos en su conjunto de embeddings; no dice nada sobre artistas fuera de ese conjunto, ni siquiera de forma aproximada.
- La generacion de musica que imita a un interprete con nombre plantea problemas de consentimiento y atribucion. El autor pide explicitamente considerar los intereses de los artistas modelados.
- Uso previsto como herramienta de investigacion, no como sistema para producir imitaciones convincentes; el propio autor lo enmarca en la tradicion de estudios pedagogicos.
- Riesgo de alucinacion en sentido musical: el modelo puede generar material estilisticamente plausible pero musicalmente incoherente, sin que se hayan publicado metricas de coherencia armonica o ritmica.
- Sesgos: los 12 pianistas fueron elegidos por separabilidad estilistica, lo que introduce un sesgo de seleccion que no representa la diversidad del jazz como genero.
- No se publican datos sobre la composicion del dataset de ajuste fino ni sobre posibles sesgos de genero, epoca, origen geografico o escuela estilistica de los interpretes.
- Limitaciones de contexto: la ventana de secuencia no esta documentada, por lo que se desconoce el limite practico de longitud de generacion.
- No hay soporte de lenguaje natural: no se puede pedir al modelo en texto que genere un estilo concreto; hay que seleccionar uno de los 12 embeddings.
- Restricciones de licencia: los pesos son Apache-2.0, pero la base Aria (EleutherAI, Apache-2.0) y el dataset PiJAMA tienen sus propias condiciones, que conviene revisar antes de un uso comercial.
- Requiere codigo propio (`llama_pijama.models`, `aria.config`) y no es cargable con las APIs estandar de Hugging Face; esto complica el despliegue en produccion y la integracion en servidores de inferencia convencionales.
- No se han publicado cifras de latencia, throughput ni consumo de memoria, lo que impide dimensionar un despliegue con datos reales.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drewbie/jazz-pianist-style-generator
- Codigo, script de generacion y evaluacion: https://github.com/almostimplemented/jazz-pianist-style
- Modelo base Aria (EleutherAI): https://github.com/EleutherAI/aria
- Dataset PiJAMA: https://github.com/almostimplemented/PiJAMA
- Referencia del paper: Edwards, D., Maezawa, A., Dixon, S. "Learning Jazz Pianist Style with Cross-Attention Conditioning", Proc. ISMIR 2026 (no se proporciona DOI ni URL en la model card)
- deepjazz (referencia historica de generacion de jazz con LSTM): https://github.com/jisungk/deepjazz
- Generador de jazz de Tunee AI: https://www.tunee.ai/music-generator/jazz
- Generador de piano de MusicCreator AI: https://www.musiccreator.ai/ai-piano
- Generador de piano de Kenerate AI: https://kenerateai.com/ai-piano-generator
- Generador de improvisacion de jazz de Musely: https://musely.ai/tools/jazz-piano-improvisation-generator
