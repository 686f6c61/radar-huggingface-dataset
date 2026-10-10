# arraypress/muse-tonal-gate

## Resumen

muse-tonal-gate es un clasificador de audio de tamano minimo (4,7 KB) publicado por arraypress en HuggingFace bajo licencia MIT. No es un modelo de lenguaje ni un transformer generativo: es un modelo Core ML de clasificacion binaria que responde a una unica pregunta sobre una muestra de audio, si tiene o no una tonalidad musical definida. La salida se compone de una etiqueta `target` con dos valores posibles (`tonal` o `atonal`) y una probabilidad asociada (`targetProbability`).

El problema que resuelve es acotado pero recurrente en herramientas de analisis musical: los pipelines de deteccion de tonalidad tienden a asignar una tonalidad a cualquier fragmento de audio, incluidos bombos, hi-hats, barridos de ruido o impactos que no tienen centro tonal. muse utiliza este modelo como puerta previa para reportar una armadura solo cuando tiene sentido, evitando resultados como etiquetar un bombo como "do menor".

Tecnicamente se trata de un modelo entrenado con Create ML de Apple a partir de una libreria de samples con licencia, integrado en el ecosistema SoundAnalysis y pensado para ejecucion on-device en Apple Silicon. Su relevancia es practica mas que de investigacion: ofrece un filtro de bajisimo coste computacional, con una precision declarada del 93,3% sobre paquetes de samples no vistos durante el entrenamiento, y con un consumo de almacenamiento despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador Core ML entrenado con Create ML (no se detalla la topologia interna) |
| Parametros totales | no disponible (modelo Core ML de 4,7 KB; el concepto de parametros no aplica en el sentido de los LLM) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la ventana la determina SoundAnalysis al procesar `audioSamples`) |
| Tipos de cuantizacion | no disponible (Core ML gestiona la conversion y el empaquetado internamente) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodel` / paquete Core ML); Core ML Tools permite exportacion a otros formatos, aunque no se documenta en la model card |
| Entrada | `audioSamples`, 16 kHz mono, procesado con SoundAnalysis de Apple |
| Salida | `target` (`tonal` o `atonal`) y `targetProbability` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la topologia interna del clasificador. Lo que se documenta es el proceso de construccion: el modelo se entreno con Create ML, la herramienta de Apple para generar modelos Core ML a partir de datasets etiquetados, sobre una libreria de samples con licencia. El audio de entrenamiento no se distribuye y, segun el autor, no puede recuperarse a partir del modelo. No se indica el numero de ejemplos, la duracion total del dataset, la composicion por clases ni si se aplico algun tipo de aumento de datos o validacion cruzada.

El detalle tecnico mas relevante del entrenamiento es una decision de curaduria del dataset: los risers con altura definida se excluyeron deliberadamente de la clase `atonal`. Con esos ejemplos dentro, el modelo aprendia una regla espuria ("barrido = atonal") en lugar de discriminar la presencia real de centro tonal. Es un caso claro de sesgo de atajo en el etiquetado, corregido antes del entrenamiento final.

En el lado de la inferencia, el pipeline exige audio mono a 16 kHz alimentado a traves de SoundAnalysis. Los one-shots mas cortos que la ventana de analisis se rellenan con ceros antes de la inferencia, porque sin ese relleno SoundAnalysis no devuelve ningun resultado. La precision declarada es del 93,3% medida sobre paquetes de samples no vistos en entrenamiento (held-out sample packs).

## Capacidades

- Clasificacion binaria de tonalidad sobre muestras de audio: distingue `tonal` de `atonal`.
- Deteccion de material tonal: bucles de bajo, pads, lineas vocales y, en general, fuentes con centro tonal identificable.
- Deteccion de material atonal: bombos, hi-hats, barridos de ruido e impactos.
- Devuelve una probabilidad (`targetProbability`) ademas de la etiqueta, lo que permite fijar umbrales de confianza en el pipeline que lo consume.
- Ejecucion on-device en el ecosistema Apple mediante Core ML y SoundAnalysis, sin dependencia de servicios en la nube.
- Manejo de muestras mas cortas que la ventana de analisis mediante relleno con ceros.
- No realiza estimacion de tonalidad concreta (no devuelve "do menor" o "la mayor"); solo indica si existe o no una tonalidad.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision.
- No hay capacidades multilingues: el modelo no procesa lenguaje.
- No se documenta soporte de audio en tiempo real, streaming, audio polifonico complejo ni otros formatos de entrada distintos de 16 kHz mono.

## Casos de uso

- Etiquetado automatico de librerias de samples: al indexar un banco de samples, el modelo filtra los fragmentos atonales (percs, impactos, ruido) antes de ejecutar un analizador de tonalidad, evitando metadatos incorrectos como "do menor" en un bombo.
- Preprocesado en herramientas de analisis musical: integrado en el pipeline de muse, actua como puerta que decide si merece la pena calcular y mostrar la armadura de un fragmento.
- Organizacion de sesiones y proyectos DAW: permite clasificar automaticamente los elementos de un proyecto entre material tonal (bajos, pads, voces) y percusivo, facilitando busquedas y filtros por categoria.
- Curaduria de datasets musicales: al preparar un corpus para entrenar otros modelos de musica, sirve para separar de forma masiva las muestras con contenido armonico de las puramente ritmicas o de ruido.
- Filtrado previo en sistemas de recomendacion o busqueda musical: descarta candidatos sin tonalidad cuando la consulta del usuario busca contenido armonico o tonal, reduciendo falsos positivos.
- Analisis de contenido en herramientas de transcripcion: evita que un motor de transcripcion armonica intente asignar acordes a secciones puramente percusivas.
- Aplicaciones moviles y de escritorio en Apple: al ser un modelo de 4,7 KB ejecutable via Core ML, puede embeberse en apps de iOS o macOS sin impacto apreciable en el tamano del binario ni en el consumo de bateria.
- Automatizacion de catalogos en sellos o plataformas de samples: clasificacion por lotes de miles de archivos para poblar campos de metadatos relativos a tonalidad.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precision (accuracy) | 93,3% | Paquetes de samples no vistos en entrenamiento (held-out sample packs) |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (F1, precision/recall por clase, matrices de confusion ni comparaciones con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. El modelo ocupa 4,7 KB en disco; la inferencia se ejecuta en CPU, GPU o Neural Engine de Apple sin requisitos de memoria dedicada reseñables.
- GPU recomendadas: no aplica GPU dedicada de servidor. El destino es Apple Silicon (M-series) y, presumiblemente, dispositivos iOS/iPadOS con Neural Engine, aunque la model card no detalla la lista de chips compatibles.
- Compatibilidad con GPU de consumo: no es un modelo orientado a GPU NVIDIA o AMD; depende del runtime de Core ML, por lo que el despliegue fuera del ecosistema Apple requiere conversion previa con Core ML Tools.
- Opciones de despliegue: Core ML y SoundAnalysis en plataformas Apple. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio de este tipo.
- Latencia y throughput: no disponibles. Al tratarse de una ventana de analisis de audio corta y un modelo de kilobytes, la latencia esperada es baja, pero no hay cifras publicadas.
- Requisito de entrada: audio mono a 16 kHz. Las muestras mas cortas que la ventana deben rellenarse con ceros para que SoundAnalysis produzca salida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otras alternativas de clasificacion de audio (por ejemplo, clasificadores genericos tipo YAMNet, PANNs o VGGish) ni con otros detectores especificos de tonalidad. Tampoco se detallan parametros, contexto ni rendimiento de esos sistemas en este contexto, por lo que cualquier tabla comparativa implicaria inventar datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arraypress/muse-tonal-gate | no disponible (4,7 KB) | no disponible | 93,3% accuracy en held-out sample packs | MIT | HuggingFace |
| Alternativas de clasificacion de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tarea estrictamente binaria: no identifica la tonalidad concreta ni la escala, solo si existe o no un centro tonal.
- Precision del 93,3% implica aproximadamente un 6,7% de error sobre muestras no vistas; en produccion conviene usar `targetProbability` con un umbral ajustado al caso de uso en lugar de confiar en la etiqueta directa.
- Riesgo de falsos positivos y falsos negativos en material ambiguo: pads muy disonantes, texturas con contenido armonico parcial o percusion con tono definido pueden caer en la clase equivocada.
- La curaduria del dataset excluyo risers con altura definida de la clase `atonal`. Es una decision razonable, pero implica que el comportamiento del modelo frente a risers tonales no esta documentado y puede ser inconsistente.
- Dependencia del ecosistema Apple: el formato Core ML y el uso de SoundAnalysis limitan el despliegue directo en Linux o Windows sin conversion y reimplementacion del preprocesado.
- Requisito de preprocesado rigido: audio mono a 16 kHz y relleno con ceros de las muestras cortas. Omitir el relleno hace que SoundAnalysis no devuelva resultado.
- No se documentan sesgos mas alla del atajo de los risers, ni se detalla la composicion del dataset de entrenamiento, lo que dificulta evaluar la representatividad de la libreria de samples utilizada.
- Sin datos de sesgo por genero musical, instrumento, region o calidad de grabacion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay restricciones adicionales documentadas, pero el audio de entrenamiento no se distribuye ni es recuperable.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/arraypress/muse-tonal-gate
- Repositorio de arraypress (muse): https://github.com/arraypress
- Documentacion de Create ML (Apple): no disponible en la informacion proporcionada
- Documentacion de Core ML y SoundAnalysis (Apple): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Demo: no disponible

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo; se refieren a otros temas (GPT-4o, SDK de OpenAI en Java, Prism, ChatGPT y despliegue local de modelos de lenguaje) y no se han utilizado como fuente.
