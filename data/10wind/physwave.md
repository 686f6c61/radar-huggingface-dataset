# 10wind/PhysWave

## Resumen

PhysWave es un modelo de generacion de audio espacial presentado en el articulo "PhysWave: Physics-Guided Latent Diffusion Models for Controllable Spatial Audio Generation" (EMNLP 2026), obra de Lingfeng Yao, Chenpei Huang, Xingke Yang, Ziye Geng, Changqing Luo, Hao Wang, Jiang Liu y Miao Pan. El repositorio de HuggingFace lo publica el usuario 10wind bajo licencia Apache 2.0 y contiene los checkpoints preentrenados que acompanan al articulo.

El modelo genera audio espacial de fuente unica a partir de una descripcion acustica (caption) y una serie de waypoints que indican la posicion de la fuente, o bien a partir de una instruccion en lenguaje natural que se parsea mediante una API externa (Gemini u OpenRouter). La salida es aproximadamente 10 segundos de audio ambisonico de primer orden a 16 kHz, con los canales en orden W, X, Y, Z, lo que exige un decodificador ambisonico para su escucha espacial.

Se trata de un modelo de difusion latente guiado por fisica, compuesto por dos checkpoints que deben usarse conjuntamente: un modelo de difusion condicionado por texto y waypoints (`physwave.ckpt`) y un VAE de audio de cuatro canales (`vae.ckpt`). Su relevancia actual reside en el control explicito de la posicion de la fuente en la generacion, un aspecto poco cubierto por los modelos text-to-audio convencionales, que habitualmente producen audio mono o estereo sin informacion direccional utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente guiada por fisica, con VAE de audio de cuatro canales; el articulo la describe como "physics-guided latent diffusion" |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la condicion de entrada es texto y waypoints, no una secuencia larga) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen sin cuantizar en formato `.ckpt` |
| Idiomas soportados | en (ingles), segun los metadatos del repositorio y la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (PyTorch) para `physwave.ckpt` y `vae.ckpt`, mas `config.json` con el formato de audio y los checkpoints |

Otros datos del repositorio: pipeline declarado `text-to-audio`, tamano del repositorio 5,5 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 28 de septiembre de 2026 y actualizado el 6 de octubre de 2026.

## Arquitectura y entrenamiento

PhysWave es un modelo de difusion latente aplicado al audio, no un transformer autorregresivo ni un modelo de espacio de estados. La generacion se realiza en el espacio latente de un VAE de audio de cuatro canales, lo que explica que la salida sea directamente una representacion ambisonica de primer orden (W, X, Y, Z) en lugar de una senal mono o estereo. El condicionamiento combina dos senales: una descripcion acustica en texto y una trayectoria de waypoints que determina la posicion de la fuente a lo largo del tiempo; alternativamente, una instruccion en lenguaje natural puede convertirse en esa condicion mediante una API externa (Gemini u OpenRouter), tal como se documenta en el repositorio de codigo.

El adjetivo "guiado por fisica" del titulo apunta a que el entrenamiento incorpora restricciones o perdidas derivadas de la propagacion acustica, si bien la model card no detalla la formulacion concreta, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se especifica el numero de parametros de la red de difusion ni del VAE. La configuracion de inferencia se controla mediante `config.json`, que describe el formato de audio y los ficheros de checkpoint; el ejemplo incluido en el repositorio es `examples/telephone_static.json`, que genera una fuente estatica de tipo telefono.

## Capacidades

- Generacion de audio espacial de fuente unica condicionada por texto y waypoints, con control explicito de la posicion de la fuente.
- Generacion a partir de instrucciones en lenguaje natural, previo parseo mediante API externa (Gemini u OpenRouter) configurada en el repositorio de codigo.
- Salida en formato ambisonico de primer orden con canales en orden W, X, Y, Z, apta para decodificacion binaural o para altavoces.
- Duracion de salida de aproximadamente 10 segundos por generacion.
- Frecuencia de muestreo de 16 kHz.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni comportamiento agentico.
- No se documentan capacidades de vision, audio de entrada, transcripcion ni generacion de voz.
- Cobertura idiomatica limitada al ingles segun los metadatos.
- No se documenta un modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Diseno de audio para videojuegos y experiencias VR: el modelo permite fijar mediante waypoints la posicion exacta de una fuente sonora, de modo que un disenador puede generar, por ejemplo, un telefono que suena en un punto concreto de la escena y decodificar despues el ambisonico al motor de audio espacial del titulo.
- Postproduccion de video 360 y realidad virtual: la salida ambisonica de primer orden se integra en herramientas de mezcla espacial y se decodifica a binaural para cascos, con lo que se obtiene una pista direccional coherente sin necesidad de grabar en campo.
- Prototipado rapido de escenas sonoras en el diseno de producto: para evaluar auriculares, altavoces o gafas con audio espacial se pueden generar estimulos controlados con una posicion conocida y comparar la reproduccion entre prototipos.
- Investigacion en psicoacustica y percepcion espacial: al disponer de la trayectoria de la fuente como variable de entrada, es posible construir experimentos con estimulos parametrizados (velocidad, distancia, direccion) y medir umbrales de localizacion o efectos de precedencia.
- Generacion de datos sinteticos para entrenar modelos de localizacion y separacion de fuentes: el modelo produce ambisonicos con metadatos de posicion, utiles como pares entrada-etiqueta en pipelines de aprendizaje supervisado.
- Interfaces conversacionales de creacion de audio: la ruta de instruccion en lenguaje natural con parseo por API permite que un agente traduzca una peticion del usuario ("un coche que pasa de izquierda a derecha") a la condicion de caption y waypoints y devuelva el audio generado.
- Educacion y demostraciones tecnicas: servir como ejemplo reproducible de difusion latente aplicada a audio espacial en cursos de procesamiento de senal o de generacion multimodal, siempre que se respete la cita academica indicada por los autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos del repositorio no incluyen tablas comparativas con metricas objetivas ni subjetivas (por ejemplo, FAD, distancia de localizacion o puntuaciones MOS), y el articulo no se ha consultado en el marco de esta ficha. Cualquier cifra que se anadiese aqui seria una invencion, por lo que se omite.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del repositorio, los dos checkpoints suman 5,5 GB en disco, de modo que la carga de los pesos requiere del orden de 6 GB de memoria o mas, a lo que hay que sumar la memoria de activaciones del modelo de difusion y del VAE de cuatro canales.
- GPU recomendadas: no disponible en la informacion proporcionada. Partiendo del tamano del repositorio y de la ausencia de cuantizacion publicada, una GPU de consumo reciente con 8 GB o mas podria ser suficiente, pero esta afirmacion es una estimacion y no esta confirmada por los autores.
- Cabe en GPU de consumo: no confirmado; la estimacion anterior sugiere que si en tarjetas con 8-12 GB o mas, pero no hay validacion publicada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de audio. La via oficial es el repositorio de codigo del proyecto, descargando los pesos con `hf download 10wind/PhysWave config.json physwave.ckpt vae.ckpt --local-dir checkpoints` y ejecutando `python -m physwave --condition examples/telephone_static.json --output outputs/telephone.wav`.
- Latencia y throughput estimados: no disponible. La salida por generacion es de unos 10 segundos de audio a 16 kHz.
- Requisito adicional: para la escucha espacial se necesita un decodificador ambisonico externo, que no forma parte de los pesos publicados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones verificables de modelos alternativos de generacion de audio espacial condicionada por texto, ni resultados comparativos publicados por los autores. Los modelos text-to-audio convencionales no ofrecen control posicional explicito mediante waypoints y su salida no es ambisonica, por lo que la comparacion exigiria datos que no se han facilitado en esta busqueda.

## Limitaciones y advertencias

- Fuente unica: el modelo esta disenado para generar una sola fuente sonora, no escenas con multiples fuentes simultaneas.
- Duracion limitada: cada generacion produce aproximadamente 10 segundos de audio, sin mecanismo documentado de extension o concatenacion.
- Frecuencia de muestreo baja: 16 kHz, inferior a la empleada habitualmente en produccion musical o de cine (44,1 kHz o 48 kHz).
- Formato de salida especifico: ambisonico de primer orden en orden W, X, Y, Z; sin decodificador ambisonico la salida no resulta util para escucha directa.
- Idioma: los metadatos solo declaran soporte de ingles, tanto para las descripciones acusticas como para las instrucciones en lenguaje natural.
- Riesgo de alucinacion acustica: al ser un modelo de difusion generativo, puede producir contenido sonoro no solicitado o fisicamente inverosimil pese a la guia fisica declarada; no hay metricas publicadas que cuantifiquen este extremo.
- Dependencia de una API externa: la ruta de instrucciones en lenguaje natural requiere configurar Gemini u OpenRouter, lo que anade un servicio de terceros y sus propias condiciones de uso y costes.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia; no se declaran restricciones adicionales. Los autores solicitan la cita academica correspondiente si se usa en investigacion.
- Formato de pesos `.ckpt`: se trata del formato de checkpoint de PyTorch. Conviene verificar la procedencia y cargar los ficheros en un entorno controlado antes de deserializarlos, dado que este formato puede transportar codigo ejecutable.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion ni de mantenimiento continuado por parte de la comunidad.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la informacion disponible, por lo que no es posible estimar la calidad objetiva de la generacion antes de probarla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/10wind/PhysWave
- Codigo e instrucciones: https://github.com/lingfengyao/PhysWave
- Articulo (arXiv 2608.29549): https://arxiv.org/abs/2608.29549
- Demos: https://lingfengyao.github.io/PhysWave/
- Instrucciones de entrada en lenguaje natural: https://github.com/lingfengyao/PhysWave#natural-language-input
- Cita (BibTeX): Yao, Lingfeng; Huang, Chenpei; Yang, Xingke; Geng, Ziye; Luo, Changqing; Wang, Hao; Liu, Jiang; Pan, Miao. "PhysWave: Physics-Guided Latent Diffusion Models for Controllable Spatial Audio Generation". EMNLP 2026.
