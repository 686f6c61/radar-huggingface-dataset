# arraypress/muse-sample-types

## Resumen

muse sample types es un clasificador de audio publicado por arraypress en Hugging Face cuyo unico objetivo es nombrar el tipo de sonido de un sample musical. Distingue entre 39 clases concretas de produccion musical (kick, snare, clap, hat_closed, bass_loop, sub_bass, pluck, pad, riser, vocal_hit, entre otras), definidas en el fichero head-labels.txt del repositorio. La app muse del mismo autor lo consume para rellenar su columna class, de modo que el modelo esta pensado como componente interno de un flujo de organizacion de sample packs mas que como modelo de proposito general.

Tecnicamente no es un modelo entrenado de cero: reutiliza el encoder de audio del modelo CLAP laion/clap-htsat-unfused (LAION, Apache-2.0) convertido a Core AI con los pesos intactos, y solo entrena una cabeza MLP pequena sobre el embedding de 512 numeros que produce ese encoder. La cabeza aplica 512 → 512 con GELU → 39 con softmax, y suma 282.663 parametros segun las dimensiones declaradas en la model card. El preprocesado es un espectrograma mel de 64 bandas a 48 kHz con 1.001 fotogramas, empaquetado en mel-filters.f32.

Su relevancia es acotada pero clara: resuelve una tarea de taxonomia muy especifica del dominio musical, con un 68,3 % de acierto en packs de samples no vistos durante el entrenamiento frente a un ~3 % esperable por azar con 39 clases, y lo hace con artefactos ligeros (el repositorio completo ocupa 0,1 GB) y ejecucion local en Apple Silicon mediante Core AI. No hay pesos del encoder redistribuidos aparte de la conversion, ni datos de audio distribuidos, ni resultados de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio CLAP (checkpoint laion/clap-htsat-unfused, convertido a Core AI con pesos sin cambios) mas cabeza MLP propia: 512 → 512 (GELU) → 39 (softmax) |
| Parametros totales | No disponible como cifra oficial; la cabeza entrenada suma 282.663 parametros (512x512 + 512 + 39x512 + 39) y el resto corresponde al encoder CLAP heredado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es fija, 1.001 fotogramas de un espectrograma mel de 64 bandas a 48 kHz |
| Tipos de cuantizacion | No disponible; los artefactos distribuidos estan en float32 |
| Idiomas soportados | No disponible; la clasificacion es independiente del idioma y las 39 etiquetas estan en ingles |
| Licencia | Apache-2.0 (hereda la licencia de CLAP) |
| Formato de pesos | .f32 (float32 little-endian, row-major, layout Linear de PyTorch: w1 [512x512], b1 [512], w2 [39x512], b2 [39]) y .aimodel (Core AI) |

## Arquitectura y entrenamiento

El pipeline tiene tres etapas encadenadas. Primero se calcula un espectrograma mel de 64 bandas a 48 kHz con 1.001 fotogramas (mel-filters.f32). Despues, el encoder de audio de CLAP (clap-audio.aimodel), procedente de laion/clap-htsat-unfused y convertido a Core AI con sus pesos intactos, transforma ese espectrograma en un embedding de 512 dimensiones. Por ultimo, una cabeza pequena entrenada por arraypress opera sobre el embedding normalizado en L2 y produce una distribucion softmax sobre 39 clases.

El unico componente entrenado es esa cabeza, ajustada sobre una biblioteca de samples con licencia; segun la model card, el audio de entrenamiento no se distribuye y no puede recuperarse a partir de los ficheros publicados. No se documentan en la informacion disponible el numero de tokens o de clips usado, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (en un clasificador no serian de aplicacion directa). Tampoco se detalla el metodo de conversion de los pesos de CLAP a Core AI mas alla de la afirmacion de que los pesos no cambiaron.

## Capacidades

- Clasificacion de audio en 39 tipos de sample musical: kick, snare, clap, hat_closed, bass_loop, sub_bass, pluck, pad, riser, vocal_hit y otras clases listadas en head-labels.txt.
- Asignacion de una unica etiqueta por fragmento, mediante softmax sobre las 39 clases.
- Extraccion de un embedding de 512 dimensiones (normalizado en L2) como representacion intermedia reutilizable para similitud, agrupamiento o indexado.
- Preprocesado de audio propio: espectrograma mel de 64 bandas a 48 kHz con 1.001 fotogramas.
- Integracion prevista en la aplicacion muse, donde alimenta la columna class.
- Ejecucion local en Apple Silicon a traves de Core AI.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni modo de pensamiento.
- No se documentan capacidades multilingues de texto; las etiquetas son terminos musicales en ingles.

## Casos de uso

- Organizacion automatica de bibliotecas de samples en un DAW o gestor de samples: el modelo clasifica cada one-shot y permite separarlo en carpetas de kick, snare, pad o riser sin intervencion manual, con una precision del 68,3 % sobre material no visto que reduce drasticamente la revision manual frente al ~3 % del azar.
- Limpieza y control de calidad de sample packs antes de publicarlos: un editor o sello puede pasar el catalogo por el clasificador y detectar etiquetas incoherentes (por ejemplo, un pad etiquetado como pluck) antes de distribuirlo.
- Busqueda y filtrado por categoria en una biblioteca local: al disponer de la clase asignada, un buscador puede ofrecer filtros por tipo de sonido sin necesidad de metadatos manuales.
- Carga automatica en samplers e instrumentos virtuales: una drum machine puede analizar un archivo arrastrado por el usuario y colocarlo en el pad correspondiente segun la clase predicha.
- Etiquetado de datasets musicales internos: el embedding de 512 dimensiones y la clase predicha sirven para preanotar grandes colecciones antes de un etiquetado humano, o para entrenar sistemas de recomendacion de samples.
- Aplicaciones musicales para macOS e iOS con inferencia local: al estar empaquetado para Core AI y no requerir servidor, encaja en herramientas de escritorio o moviles que deban funcionar sin conexion y sin enviar audio a la nube.
- Deteccion de elementos concretos en un flujo de produccion: identificar riser o vocal_hit de forma automatica para aplicar procesado especifico o para construir transiciones.
- Uso como componente de la app muse: es su proposito declarado, asignar la columna class dentro de la herramienta del propio autor.

## Benchmarks y rendimiento

| Metrica | Resultado | Fuente |
|---|---|---|
| Precision en packs de samples held-out (no vistos en entrenamiento) | 68,3 % | model card |
| Baseline por azar con 39 clases | ~3 % | model card |
| Confusiones tipicas | sub_bass frente a bass_hit, y tipos que una persona tambien confundiria | model card |
| MMLU, HumanEval, GSM8K y similares | No aplica (modelo de clasificacion de audio) | - |
| Latencia y throughput | No disponible | - |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU. El modelo esta empaquetado para Core AI y su tag apple-silicon indica que el objetivo son equipos Apple Silicon (series M) con memoria unificada.
- Huella de los artefactos: el repositorio completo ocupa 0,1 GB, de modo que los ficheros en disco y su carga en memoria son del orden de decenas o centenas de MB; el dato concreto de memoria en ejecucion no esta disponible.
- No hay ruta documentada para GPU NVIDIA, AMD o aceleradores no Apple: no se distribuyen pesos en safetensors, GGUF, ONNX ni otros formatos de runtime generico, solo .f32 y .aimodel.
- Opciones de despliegue: runtime Core AI de Apple y la aplicacion muse (https://github.com/arraypress); vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato sin una conversion previa que no se documenta.
- Latencia y throughput estimados: no disponibles.
- Capacidad en GPU de consumo: no aplica segun la informacion disponible, al no existir artefactos para esos runtimes.

## Comparativa con modelos similares

| Modelo | Enfoque | Clases u objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| muse sample types (arraypress) | Cabeza entrenada sobre embedding CLAP congelado | 39 tipos de sample musical | Apache-2.0 | Hugging Face, formato Core AI y .f32 |
| laion/clap-htsat-unfused | CLAP completo, uso zero-shot con prompts de texto | Espacio abierto de descripciones en lenguaje natural | Apache-2.0 | Hugging Face; es el encoder que reutiliza este modelo |
| Etiquetadores genericos de AudioSet (familias AST, PANNs, YAMNet) | Clasificacion de audio generalista | Cientos de clases acusticas generales (musica, voz, sonidos ambientales) | Variada segun modelo | Disponibles en distintos formatos; parametros y resultados no verificados en la informacion disponible |
| Reglas y metadatos basados en nombre de archivo | Heuristica sin modelo | Depende del nombrado del usuario | No aplica | Trivial, pero sin precision medida |

La diferencia principal frente a CLAP zero-shot es el enfoque: aqui no se consulta con texto, sino que se usa una cabeza fija entrenada, lo que da una taxonomia estable de 39 clases y una precision medida del 68,3 % en material no visto, a cambio de perder flexibilidad para definir clases nuevas. Frente a los etiquetadores generalistas de AudioSet, la ventaja es la granularidad en produccion musical (distinguir sub_bass de bass_hit), terreno en el que las taxonomias acusticas generales no llegan a ese detalle.

## Limitaciones y advertencias

- Precision limitada: 68,3 % en packs held-out implica que aproximadamente uno de cada tres samples se etiqueta mal; no es adecuado como unico criterio en flujos sin revision humana.
- Confusiones sistematicas entre clases proximas, como sub_bass frente a bass_hit, que la propia model card reconoce.
- Taxonomia cerrada de 39 clases: no hay clase de rechazo ni umbral documentado, de modo que un sonido fuera de catalogo seguira recibiendo una de las 39 etiquetas con su correspondiente probabilidad softmax.
- Sesgos heredados del encoder CLAP y del material de entrenamiento (una biblioteca de samples con licencia no distribuida), cuya composicion, idioma de origen, genero musical y balance de clases no se detallan.
- Riesgo de alucinacion en el sentido generativo: no aplica, porque el modelo no genera texto; el riesgo equivalente es la clasificacion erronea silenciosa.
- Idiomas: no hay componente de texto en inferencia; las 39 etiquetas estan en ingles, lo que puede requerir traduccion en interfaces en castellano.
- Licencia Apache-2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del checkpoint original laion/clap-htsat-unfused y de la biblioteca de samples con la que se entreno la cabeza.
- Dependencia de plataforma: el paquete esta orientado a Core AI y Apple Silicon; no se documenta conversion a otros runtimes ni se garantiza su funcionamiento en Linux o Windows con GPU.
- No se publican requisitos de memoria, latencia ni rendimiento en produccion, ni resultados fuera de la metrica de precision.
- El audio de entrenamiento no se distribuye y no puede reconstruirse desde los ficheros publicados, por lo que no es posible auditar la composicion del dataset.
- Trazabilidad: el repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y los metadatos del Hub indican fecha de creacion 2026-10-10, por lo que se trata de una publicacion reciente y sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arraypress/muse-sample-types
- Encoder CLAP de origen: https://huggingface.co/laion/clap-htsat-unfused
- Repositorio del autor (aplicacion muse): https://github.com/arraypress
- Paper, blog o demo adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo paginas genericas de servicios de Google sin relacion con el modelo).
