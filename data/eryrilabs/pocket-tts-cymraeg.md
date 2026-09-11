# EryriLabs/pocket-tts-cymraeg

## Resumen

Pocket TTS Cymraeg es un modelo de sintesis de voz (text-to-speech) para gales, desarrollado por EryriLabs y publicado en HuggingFace bajo licencia CC-BY-4.0. Se trata de un modelo comunitario entrenado desde cero en gales sobre 173 horas de habla galesa con licencia abierta, partiendo de una inicializacion gaussiana. Lo que toma de Kyutai es la receta de Pocket TTS y el codec Mimi congelado; no contiene ningun peso de idioma de Kyutai. Segun sus autores, es el primer TTS en gales capaz de hablar con una voz personalizada a partir de unos pocos segundos de audio de referencia y de ejecutarse localmente en CPU.

La arquitectura combina un FlowLM de 24 capas y dimension de modelo 1024 (316.013.953 parametros) con el codec Mimi congelado de Kyutai (20.054.337 parametros), sumando 336.068.290 parametros en float32 (1.344,3 MB). Incorpora su propio tokenizador SentencePiece BPE de 4.000 piezas entrenado sobre texto en gales, y genera audio mono a 24 kHz. Su relevancia actual esta en cubrir una lengua de recursos limitados con un modelo que funciona sin GPU: en un Intel Core i9-13900K alcanza un factor de tiempo real (RTF) de 0,71 a un solo hilo en float32 y de 0,31 con ocho hilos en int8, es decir, entre 1,4 y 3,2 veces mas rapido que el tiempo real.

El modelo esta pensado para despliegue local en CPU y para clonacion de voz a partir de un wav PCM de referencia. Su debilidad principal, reconocida por los propios autores, es la tasa de fallo en la puerta de sonoridad: en el conjunto de retencion de 40 frases, solo 73 de 120 muestras fueron puntuables (un 39 % no lo fueron), y los fallos se concentran en las frases largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlowLM de 24 capas con d_model 1024 mas codec Mimi congelado (receta Pocket TTS de Kyutai) |
| Parametros totales | 336.068.290 (316.013.953 del FlowLM + 20.054.337 del codec Mimi congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (por defecto) e int8 dinamico (`quantize=True` en `load_model` o `apply_dynamic_int8` con `RECOMMENDED_CONFIG`, motor FBGEMM en CPU); bfloat16 no funciona en CPU segun la model card; cuantizaciones GGUF del repo auxiliar no especificadas |
| Idiomas soportados | gales (cy) unicamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (`model.safetensors`, float32), tokenizador SentencePiece (`tokenizer.model`), `config.yaml`, `config.relative.yaml`, `manifest.json`; build GGUF aparte para `llama-tts` |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Tamano del repositorio | 1,3 GB |
| Tokenizador | SentencePiece BPE propio, 4.000 piezas, entrenado sobre texto en gales |
| Temperatura por defecto | 0,3 (definida en el `config.yaml`, no es el valor por defecto del paquete) |
| Datos de entrenamiento | 173 horas de habla galesa con licencia abierta |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha indicada en metadatos del repo | creado el 2026-09-11, actualizado el 2026-09-11 |

## Arquitectura y entrenamiento

El modelo sigue la receta Pocket TTS: un FlowLM de 24 capas con dimension de modelo 1024 que modela la generacion de representaciones de audio, acoplado al codec neural Mimi de Kyutai, que se mantiene congelado y aporta 20.054.337 parametros. El componente entrenado por EryriLabs es unicamente el FlowLM, entrenado desde cero (inicializacion gaussiana) sobre 173 horas de habla galesa con licencia abierta, sin reutilizar pesos de idioma de Kyutai. El tokenizador de texto es propio, un SentencePiece BPE de 4.000 piezas entrenado en gales, y la salida se decodifica a audio mono de 24 kHz. Todo el state dict se distribuye en float32, lo que explica que 336 millones de parametros ocupen 1,34 GB.

El modelo soporta condicionamiento de voz a partir de unos pocos segundos de audio de referencia (`get_state_for_audio_prompt`), asi como generacion en streaming mediante `generate_audio_stream`, que va emitiendo fragmentos a medida que se decodifican. La model card advierte de dos particularidades relevantes para la reproducibilidad: la API publica de inferencia no aplica classifier-free guidance, mientras que las puertas de evaluacion del proyecto se generaron con `cfg_coef=2.0` a traves del codigo de entrenamiento, por lo que las cifras obtenidas con la API publica no son directamente comparables con las de las puertas. Ademas, el paquete llama a `torch.set_num_threads(1)` al importarse, de modo que el comportamiento por defecto es mono-hilo salvo que se ajuste despues de la importacion. No se detalla en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Sintesis de voz en gales (cy) a partir de texto, con salida mono a 24 kHz.
- Clonacion de voz few-shot: basta un wav PCM de referencia de unos pocos segundos para condicionar la voz; el prompt de voz se codifica una sola vez por voz.
- Generacion en streaming mediante `generate_audio_stream`, que permite empezar a reproducir antes de terminar la frase.
- Inferencia en CPU sin GPU, con variantes float32 e int8 dinamico.
- Cuantizacion int8 mediante `quantize=True` en `load_model` o `apply_dynamic_int8(model.flow_lm, RECOMMENDED_CONFIG)`.
- Ejecucion local: los pesos se cargan desde rutas `hf://` o desde copia local con `config.relative.yaml`.
- Build GGUF para `llama-tts` disponible en un repositorio aparte (carpeta `welsh/`).
- Demo ejecutable en navegador a traves de un Space de HuggingFace.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada mas alla del prompt de voz, ni razonamiento multi-paso.

## Casos de uso

- Lectura de textos en gales para accesibilidad: el modelo convierte articulos, documentos administrativos o contenido web en audio a 24 kHz, y su RTF por debajo de 1,0 en un solo nucleo permite integrarlo en lectores de pantalla o extensiones de navegacion sin hardware dedicado.
- Clonacion de voz para audiolibros y contenido editorial en gales: con unos pocos segundos de audio de referencia se fija una voz consistente, lo que permite narrar textos largos manteniendo el timbre, evitando asi la locucion manual en una lengua con pocos locutores comerciales.
- Aprendizaje de gales (elearning): generacion de ejercicios de pronunciacion y dictado con distintas voces de referencia, de modo que el alumnado escuche la misma frase con varios timbres.
- Asistentes de voz y kioscos on-premise: despliegue en CPU dentro de la propia infraestructura, sin envio de texto a servicios externos, adecuado para entornos con requisitos de soberania de datos o conectividad limitada.
- Señaletica y anuncios publicos automatizados: generacion dinamica de avisos en gales para estaciones, aeropuertos o edificios publicos, usando int8 para mantener la memoria residente baja (1.388 MB tras la carga) y tiempos de primer audio de 0,06 s con ocho hilos.
- Aumento de datos para ASR en gales: sintesis de habla con voces variadas para ampliar corpus de entrenamiento o de evaluacion de sistemas de reconocimiento de voz en una lengua de recursos limitados, teniendo en cuenta la tasa de fallo de la puerta de sonoridad.
- Doblaje y prototipado de contenido audiovisual: generacion rapida de pistas de voz temporales en gales para validar guiones o montajes antes de contratar locucion humana.
- Preservacion de variedades dialectales: al condicionarse con audio de referencia, permite registrar y reproducir voces concretas de hablantes, util en proyectos de documentacion linguistica.

## Benchmarks y rendimiento

Metricas de velocidad medidas en un Intel Core i9-13900K (13.a generacion), torch 2.13.0 y motor de cuantizacion FBGEMM, solo CPU, con seis prompts de puerta galeses congelados y tres ejecuciones por celda. El RTF es el cociente entre segundos de generacion y segundos de audio producido (menor es mejor; por debajo de 1,0 es mas rapido que el tiempo real). El prompt de voz se codifica antes de iniciar la medicion.

| Variante | Hilos | RTF mediano | Rango | Primer audio | RSS tras la carga |
|---|---:|---:|---|---:|---:|
| float32 | 1 | 0,71 | 0,70 a 0,73 | 0,23 s | 2.019 MB |
| float32 | 8 | 0,48 | 0,47 a 0,48 | 0,10 s | 2.020 MB |
| int8 | 1 | 0,40 | 0,39 a 0,41 | 0,10 s | 1.388 MB |
| int8 | 8 | 0,31 | 0,30 a 0,32 | 0,06 s | 1.462 MB |

El pico de memoria residente durante la carga es de aproximadamente 3,3 GB en todas las variantes, porque cada una se construye primero en float32 y despues se cuantiza; la ganancia del int8 se observa en la memoria residente despues de la carga (de 2.019 MB a 1.388 MB).

Calidad medida con el ASR gales fijado `techiaith/whisper-large-ft-cy-en` en la revision `014eacd4`, aplicando una puerta de sonoridad antes de que el ASR procese el audio:

| Variante | Hilos | WER mediano |
|---|---:|---:|
| float32 | 1 | 0,050 |
| float32 | 8 | 0,000 |
| int8 | 1 | 0,182 |
| int8 | 8 | 0,091 |

Los autores advierten que la dispersion entre dos muestras de una misma celda es de aproximadamente 0,13 y que el numero de muestras que superan la puerta de sonoridad es el mismo (9 o 10 de 18) en las cuatro celdas, por lo que interpretan estos resultados como paridad y no como prueba de equivalencia; seis prompts y tres muestras constituyen una comprobacion de sanidad, no un test de equivalencia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, dado que es un modelo de sintesis de voz.

## Requisitos de hardware

- Inferencia en CPU: es el escenario documentado; no se requiere GPU.
- Memoria residente despues de la carga: 2.019 MB en float32 y 1.388 MB en int8 (1 hilo); 2.020 MB y 1.462 MB respectivamente con 8 hilos.
- Pico de memoria durante la carga: aproximadamente 3,3 GB en todas las variantes, porque el modelo se construye en float32 antes de cuantizarse.
- Tamano de pesos: 1,34 GB en float32 (336 M parametros a 4 bytes); la variante int8 reduce el peso teorico a unos 336 MB, pero la model card solo reporta la memoria residente medida.
- CPU de referencia: Intel Core i9-13900K de 13.a generacion. No se publican datos para otras CPU ni para GPU.
- GPU recomendadas: no disponible (no se documenta ninguna ruta de inferencia en GPU).
- Cabe en GPU de consumo: no disponible; el modelo esta disenado para CPU, y con 1,34 GB en float32 cabria teoricamente en cualquier GPU con mas de 2 GB de VRAM, pero no hay soporte ni mediciones documentadas en la informacion disponible.
- Hilos: `pocket_tts` ejecuta `torch.set_num_threads(1)` al importarse; hay que llamar a `torch.set_num_threads(n)` despues de la importacion para usar mas hilos.
- Latencia al primer audio: 0,23 s (float32, 1 hilo), 0,10 s (float32, 8 hilos), 0,10 s (int8, 1 hilo), 0,06 s (int8, 8 hilos).
- Throughput: entre 1,4x y 3,2x el tiempo real segun la configuracion (RTF de 0,71 a 0,31).
- Opciones de despliegue: paquete Python `pocket-tts==3.0.2`, carga de pesos en safetensors via `TTSModel.load_model`, build GGUF para `llama-tts` en el repositorio `EryriLabs/pocket-tts-GGUF` (carpeta `welsh/`) y Space de demostracion en HuggingFace. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp mas alla del build GGUF para `llama-tts`.
- bfloat16 no funciona en CPU en este modelo: si se convierte solo el FlowLM, Mimi le entrega latentes en float32; si se convierten ambas mitades, el fallo se traslada al codificador Mimi, que lee el wav de referencia como float32. No hay ruta bfloat16 soportada en `pocket_tts` sin parchearlo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a los modelos citados en la propia model card.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| EryriLabs/pocket-tts-cymraeg | 336.068.290 (316 M FlowLM + 20 M Mimi congelado) | no disponible | gales (cy) | cc-by-4.0 | safetensors en HuggingFace, GGUF para `llama-tts`, Space de demo | RTF 0,31-0,71 en CPU; WER mediano 0,000-0,182 segun variante |
| Pocket TTS de Kyutai (origen de la receta) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Codec Mimi de Kyutai (componente congelado) | 20.054.337 | no disponible | no disponible | cc-by-4.0 | incluido en este repositorio | no aplica (es el codec, no el generador de texto) |
| Otros TTS en gales | no disponibles en la informacion proporcionada | no disponible | gales | no disponible | no disponible | no disponible |

Los autores afirman que, hasta donde han podido comprobar, es el primer TTS en gales que puede hablar con una voz personalizada a partir de unos segundos de audio de referencia y ejecutarse localmente en CPU. No se aportan comparaciones cuantitativas contra otras alternativas.

## Limitaciones y advertencias

- Fallo en la puerta de sonoridad: en el conjunto de retencion de 40 frases, solo 73 de 120 muestras fueron puntuables, es decir, un 39 % no superaron la puerta. Los fallos se concentran en las frases largas; las muestras que si pasan son practicamente correctas, de ahi el WER mediano bajo. Es la debilidad principal declarada por los autores.
- Las cifras de calidad se han obtenido con seis prompts y tres muestras por celda, con una dispersion interna de aproximadamente 0,13, superior a cualquier diferencia entre celdas; no constituyen un test de equivalencia entre float32 e int8.
- La API publica de inferencia no aplica classifier-free guidance, mientras que las puertas de evaluacion se generaron con `cfg_coef=2.0` a traves del codigo de entrenamiento. Los numeros medidos con la API publica no son directamente comparables con los de las puertas.
- La temperatura por defecto del modelo es 0,3 y viaja en el `config.yaml`; no coincide con el valor por defecto del paquete. Cambiarla altera el comportamiento respecto a las evaluaciones publicadas.
- Monolinguismo: solo soporta gales (cy). No hay soporte documentado de otros idiomas.
- El wav de referencia debe ser PCM: la libreria `wave` de la biblioteca estandar rechaza float32 y mp3 con `wave.Error: unknown format: 3`; es necesario convertir el audio antes.
- Comportamiento mono-hilo por defecto: `pocket_tts` fija `torch.set_num_threads(1)` al importarse, lo que reduce el rendimiento si no se ajusta explicitamente.
- Sin ruta bfloat16 en CPU: convertir una sola mitad o ambas provoca fallos en la cadena Mimi, por lo que no hay reduccion de precision documentada mas alla del int8.
- Riesgo de alucinacion en el sentido de contenido: un TTS puede producir audio ininteligible o con contenido incorrecto cuando falla la generacion; en este modelo ese riesgo se manifiesta principalmente como muestras que no superan la puerta de sonoridad (39 % en el conjunto de retencion), no como texto inventado.
- No se documentan sesgos concretos de acento, genero, edad ni variedad dialectal en la informacion disponible, aunque el modelo se ha entrenado sobre 173 horas de habla galesa con licencia abierta, cuya composicion demografica no se detalla.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya la autoria. El codec Mimi incluido esta tambien bajo CC-BY-4.0 y debe acreditarse a Kyutai, igual que la receta Pocket TTS. Conviene revisar los terminos del paquete `pocket-tts` por separado de los pesos.
- Uso de voces clonadas: la clonacion a partir de unos segundos de referencia exige consentimiento del hablante y cumple con la normativa aplicable de proteccion de datos y derechos de imagen; la licencia del modelo no cubre ese aspecto.
- La model card proporcionada esta truncada (termina en "The problem is not that the m"), por lo que podrian existir secciones adicionales de limitaciones, procedencia de datos o instrucciones de cita que no se recogen en esta ficha.
- Sin historial de uso: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (devuelven resultados sobre DC Comics y Discord), de modo que toda la ficha se basa en la informacion de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EryriLabs/pocket-tts-cymraeg
- Demo en navegador (Space): https://huggingface.co/spaces/EryriLabs/pocket-tts-cymraeg-demo
- Build GGUF para `llama-tts` (carpeta `welsh/`): https://huggingface.co/EryriLabs/pocket-tts-GGUF
- Paper referenciado en las etiquetas del modelo: arXiv:2509.06926 (https://arxiv.org/abs/2509.06926)
- Modelo ASR en gales usado para la evaluacion: `techiaith/whisper-large-ft-cy-en` (revision `014eacd4`)
- Codec Mimi de Kyutai: no se proporciona URL directa en la informacion disponible
- Repositorio, paper o blog de EryriLabs: no disponible en la informacion proporcionada
- Documentacion del paquete `pocket-tts` (version 3.0.2): no disponible en la informacion proporcionada
