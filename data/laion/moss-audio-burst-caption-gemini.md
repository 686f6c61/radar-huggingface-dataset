# laion/moss-audio-burst-caption-gemini

## Resumen

`laion/moss-audio-burst-caption-gemini` es un adaptador LoRA de rango 32 entrenado sobre el modelo multimodal de audio `OpenMOSS-Team/MOSS-Audio-8B-Instruct`. Lo desarrolla LAION como parte de su proyecto Humaneness Ears, y su tarea concreta es la generación de descripciones textuales de eventos vocales no verbales (bursts: risas, suspiros, gritos, carraspeos) delimitados por un intervalo temporal explícito dentro de una grabación completa.

No se trata de un modelo nuevo ni de un sistema de reconocimiento de voz: es una adaptación ligera de un modelo ya existente. El modelo base combina un codificador de audio preentrenado, un adaptador audio-lenguaje, inyecciones de audio DeepStack y un transformer de lenguaje Qwen3, con una tasa aproximada de 12,5 tokens de audio por segundo. El nombre "8B" del repositorio base se refiere a la clase de tamano del transformer de lenguaje, pero la instancia real tiene 9.052.463.488 parámetros, que suben a 9.139.757.440 al incluir el adaptador.

Su relevancia es metodológica y de nicho: demuestra que se puede especializar un modelo de audio de ~9B en una tarea de captioning de eventos vocales con solo 87.293.952 parámetros entrenables (menos del 1 % del total), congelando codificador de audio, adaptador y mergers. Las etiquetas de entrenamiento son descripciones generadas por Gemini, no anotación humana adjudicada, lo que conviene tener presente al interpretar sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de audio (MOSS-Audio): codificador de audio preentrenado + adaptador audio-lenguaje + inyecciones DeepStack + transformer de lenguaje Qwen3; adaptador LoRA sobre las proyecciones de atencion y MLP del transformer de lenguaje |
| Parametros totales | 9.139.757.440 (base: 9.052.463.488; adaptador LoRA entrenable: 87.293.952) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento uso un limite de secuencia de 8.192 tokens con longitudes dinamicas |
| Tipos de cuantizacion | No disponible. Solo se publican pesos del adaptador LoRA en safetensors (entrenado en BF16); no hay versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (adaptador); la licencia del modelo base debe consultarse por separado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repo de 0,3 GB |
| Tarea | Captioning de eventos vocales (burst captioning) con intervalo temporal de inicio y fin |
| Modelo base | OpenMOSS-Team/MOSS-Audio-8B-Instruct, revision d4dc5a6d8cd79b43dcd82884c75e303b1ecd016d |
| Libreria | peft |
| Revision del codigo fuente | OpenMOSS/MOSS-Audio, revision 66326e6e0db34f036c86a76ba005efa4830c69dd |
| Fecha de creacion | 2026-10-10 |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-8B-Instruct integra cuatro piezas: un codificador de audio preentrenado, un adaptador que proyecta las representaciones de audio al espacio del lenguaje, inyecciones DeepStack (inserciones de audio en varias profundidades del transformer) y un transformer de lenguaje Qwen3. La tasa aproximada de tokens de audio es de 12,5 Hz. En esta adaptacion solo se entrenan los pesos LoRA de rango 32, alpha 64 y dropout 0,05 aplicados a las proyecciones de atencion y MLP del transformer de lenguaje; el resto de componentes (pesos del lenguaje base, codificador de audio, adaptador de audio y mergers DeepStack) permanece congelado. No se entrena ningun codificador de audio nuevo ni una cabeza de localizacion de eventos.

Los datos proceden de la coleccion de anotaciones Gemini, que combina una seleccion equilibrada S1, LAION's Got Talent, fragmentos equilibrados de 40 emociones y una prueba de concepto de anotacion de voz. Los splits son disjuntos por hash SHA256 exacto del MP3 y estan formados por 80.773 ejemplos de entrenamiento, 4.649 de validacion y 4.820 de prueba. La supervision de burst es el caption detallado de cada evento; las unicas entradas son el audio, el prompt de tarea y, para burst captioning, los extremos numericos del intervalo. No se incluye transcripcion, etiqueta de clase, caption de referencia ni vector de puntuacion de Gemini en la entrada, y cada evento dispone de segundo de inicio y de fin.

La receta de entrenamiento es SFT (no se documenta RLHF ni DPO): 2 epocas, 2.526 actualizaciones, optimizador AdamW con weight decay 0,01, learning rate pico de 1e-4 con 5 % de warmup y decaimiento coseno, batch efectivo de 64 (4 GPU x 1 ejemplo x 16 microbatches acumulados), precision BF16 y atencion SDPA. El audio se procesa como grabacion completa en mono a 16 kHz, sin recorte del evento, con marcadores temporales cada dos segundos. La perdida es entropia cruzada media de siguiente token calculada solo sobre los tokens del caption del asistente. El mejor checkpoint (checkpoint-2526) tiene una perdida de validacion de 1,423833. Esa metrica mide el ajuste al texto de Gemini, no la calidad humana del caption ni la deteccion de eventos. La publicacion ligera incluye el mejor adaptador y el historial de entrenamiento, pero no los estados del optimizador. Se fija Transformers 4.57.1, se desactiva el gradient checkpointing por el uso de hooks temporales en la ruta DeepStack y se usa `model_accepts_loss_kwargs=False` para escalar correctamente la acumulacion.

## Capacidades

- Generacion de texto condicionada a audio: produce una descripcion en ingles de un unico evento vocal no verbal delimitado por marcas de inicio y fin en segundos.
- Entrada multimodal controlada: audio completo en mono a 16 kHz, prompt de tarea e intervalo numerico; la salida es texto libre.
- Uso de marcadores temporales de audio cada dos segundos, lo que permite alinear la descripcion con la linea temporal de la grabacion.
- Decodificacion greedy determinista con limite de tokens configurable, pensada para resultados reproducibles.
- Especializacion en prosodia y vocalizaciones no verbales: no realiza reconocimiento automatico del habla ni traduccion.
- Adaptador complementario `laion/moss-audio-voice-caption-gemini` para supervision de voz completa (`voice_caption`), separado de este adaptador de burst.
- No dispone de cabeza de localizacion: los tiempos de inicio y fin deben aportarse externamente o provenir de un modelo localizador independiente.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni modo thinking.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de vision ni de audio generativo: solo comprension de audio y generacion de texto.

## Casos de uso

- Anotacion de corpus de vocalizaciones no verbales: dado un conjunto de grabaciones con intervalos ya localizados, el adaptador genera descripciones textuales de cada burst en ingles, lo que permite construir etiquetas ricas para investigacion en paralinguistica sin anotacion manual evento por evento.
- Etiquetado automatizado para pipelines de datos de audio: integrado tras un localizador de eventos, sirve como etapa de captioning en un flujo de preparacion de datasets de entrenamiento para modelos de audio, reduciendo el coste frente al etiquetado con APIs comerciales.
- Analisis de actuacion de voz y evaluacion de TTS: en escenarios de sintesis expresiva, el adaptador permite describir los eventos vocales generados por un sistema TTS y compararlos con los de una interpretacion humana, tal como ilustra la demo publica con 50 actuaciones TTS de Gemini frente a lineas base sin ajustar.
- Investigacion en emocion y expresividad: al estar entrenado sobre una coleccion con fragmentos equilibrados de 40 emociones, permite generar descripciones de eventos vocales en corpus emocionales y estudiar la relacion entre tipo de burst, prosodia y emocion percibida.
- Descripcion de audio para accesibilidad y subtitulado enriquecido: combinado con un localizador, permite generar subtitulos de eventos no verbales (risas, suspiros, gritos) sincronizados en el tiempo para contenido audiovisual en ingles.
- Analisis de podcasts y entrevistas: identificar y describir momentos de risa, duda o enfasis en grabaciones largas, segmentadas en clips de hasta 30 segundos que coincidan con la distribucion de entrenamiento.
- Monitorizacion de llamadas o interacciones de voz: con marcas temporales obtenidas externamente, se pueden describir eventos vocales relevantes en grabaciones de atencion al cliente para analitica de calidad, siempre que el marco legal y de consentimiento lo permita.
- Reutilizacion como punto de partida para adaptaciones propias: al entrenar solo 87,3 M de parametros sobre un modelo congelado, la receta y los scripts (`export_sft.py`, `train_adapter.py`) sirven como plantilla de ajuste eficiente en otras taxonomias de eventos vocales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion de prediccion de tokens del caption del profesor, que no constituye un benchmark de calidad de caption ni de deteccion de eventos.

| Metrica | Valor | Nota |
|---|---:|---|
| Perdida de validacion (mejor checkpoint, checkpoint-2526) | 1,423833 | Entropia cruzada de siguiente token sobre tokens del caption; mide ajuste al texto de Gemini, no calidad humana |
| Epocas | 2 | Receta SFT |
| Actualizaciones | 2.526 | Con batch efectivo 64 |
| Ejemplos de entrenamiento | 80.773 | Coleccion de anotaciones Gemini |
| Ejemplos de validacion | 4.649 | Splits disjuntos por SHA256 de MP3 |
| Ejemplos de prueba | 4.820 | Sin resultados publicados sobre este split |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18,3 GB solo para los pesos de la base (9.052.463.488 parametros x 2 bytes) mas unos 0,17 GB del adaptador; con activaciones y cache KV para secuencias de hasta 8.192 tokens conviene reservar del orden de 20-24 GB.
- Inferencia en CPU: se realiza en float32, es mucho mas lenta y consume mas memoria; se necesitarian del orden de 36 GB de RAM para los pesos unicamente.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En GPUs de 24 GB el modelo cabe en BF16 de forma ajustada (RTX 4090, RTX 3090).
- GPU de consumo: si en 24 GB (RTX 4090, RTX 3090) con BF16. No cabe en GPUs de 16 GB con la ruta oficial, ya que no se publican cuantizaciones GGUF, GPTQ ni AWQ; tampoco hay ruta documentada de cuantizacion en 8 o 4 bits para esta arquitectura.
- Opciones de despliegue: la ruta soportada es Transformers 4.57.1 con PEFT, usando los scripts incluidos (`download_base.py`, `inference.py`) y pesos safetensors. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama para esta arquitectura, y el pipeline de HuggingFace figura como no disponible.
- Almacenamiento: el repositorio del adaptador ocupa 0,3 GB; hay que anadir la descarga de los cuatro shards de pesos del modelo base, cuyo hash se verifica en el script de descarga.
- Rendimiento de audio: la distribucion de adaptacion corresponde a clips completos de hasta 30 segundos; 30 segundos a 12,5 tokens por segundo generan unos 375 tokens de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparacion cuantitativa con otras alternativas de captioning de audio. La comparacion se limita a caracteristicas estructurales verificables en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Tarea | Rendimiento comparado |
|---|---|---|---|---|---|
| laion/moss-audio-burst-caption-gemini | 87,3 M entrenables sobre base de 9,05 B | Limite de entrenamiento de 8.192 tokens (contexto base no disponible) | CC-BY-4.0 | Captioning de bursts vocales con intervalo temporal | No disponible |
| laion/moss-audio-voice-caption-gemini | Adaptador sobre el mismo base | No disponible | No disponible en la informacion proporcionada | Captioning de voz completa | No disponible |
| OpenMOSS-Team/MOSS-Audio-8B-Instruct | 9.052.463.488 | No disponible | No disponible en la informacion proporcionada | Modelo de audio-instruccion general | No disponible |
| Otras alternativas de audio-captioning (por ejemplo Qwen2-Audio, Audio Flamingo 2) | No verificado en la informacion disponible | No disponible | No disponible | Captioning y comprension de audio | No disponible: no hay benchmarks publicados para este adaptador |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son descripciones generadas por Gemini, no verdad de referencia humana adjudicada de forma independiente; los sesgos y errores sistematicos del anotador se transfieren al adaptador.
- La perdida de validacion reportada mide el ajuste al texto de Gemini, no la calidad percibida del caption ni la capacidad de detectar eventos; no debe presentarse como una metrica de calidad.
- Riesgo de alucinacion: al ser un modelo generativo condicionado a audio y a un intervalo, puede describir eventos que no existen en el intervalo indicado o inventar detalles de la vocalizacion.
- Requiere marcas temporales suministradas externamente: no incorpora cabeza de localizacion, por lo que un intervalo erroneo produce un caption incorrecto o irrelevante.
- Idioma limitado al ingles; no hay soporte documentado de castellano ni de otras lenguas, ni de traduccion.
- Dominio acotado: la distribucion de adaptacion son clips completos de hasta 30 segundos en mono a 16 kHz; grabaciones mas largas, otros formatos o audio muy ruidoso quedan fuera de esa distribucion.
- Restricciones de licencia: el adaptador se publica bajo CC-BY-4.0, que permite uso comercial con atribucion; deben verificarse por separado la licencia del modelo base y las condiciones de los datos de origen (LAION's Got Talent, fragmentos emocionales, anotaciones de voz), incluidos los requisitos de consentimiento y derechos sobre las grabaciones.
- Trazabilidad de datos: algunos clips S1 podrian haberse visto en preentrenamientos previos de modelos de puntuacion Whisper; se excluyeron del split de entrenamiento de este adaptador, pero la procedencia de los datos merece revision antes de un uso en produccion.
- Caveats tecnicos de reproduccion: Transformers queda fijado en la version 4.57.1, se incluye un hook de compatibilidad para la salida del codificador, el gradient checkpointing esta desactivado por los hooks temporales de la ruta DeepStack y los ejemplos que superan el limite de secuencia fallan en lugar de truncarse.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion de 2026-10-10; es un artefacto de investigacion reciente y con poca validacion externa.
- No hay cuantizaciones publicadas ni soporte documentado en servidores de inferencia de alto rendimiento, lo que complica el despliegue a escala y en hardware de gama media.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/laion/moss-audio-burst-caption-gemini
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Instruct
- Adaptador complementario de voz completa: https://huggingface.co/laion/moss-audio-voice-caption-gemini
- Conjunto de datos de anotaciones Gemini: https://huggingface.co/datasets/laion/whisper-gemini-voice-annotations
- Demo con 50 actuaciones TTS de Gemini y captions adaptados: https://laion-humaneness-ears-atlas.static.hf.space/moss-caption-grid.html
- Codigo fuente oficial de MOSS-Audio: https://github.com/OpenMOSS/MOSS-Audio/tree/66326e6e0db34f036c86a76ba005efa4830c69dd
- Articulo de LoRA (arXiv 2106.09685): https://arxiv.org/abs/2106.09685
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente resultados de spam sin relacion con el modelo.
