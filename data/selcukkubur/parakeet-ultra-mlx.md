# selcukkubur/parakeet-ultra-mlx

## Resumen

parakeet-ultra-mlx es una conversion de formato del modelo de reconocimiento automatico del habla (ASR) moondream/parakeet-ultra, publicada por el usuario selcukkubur para su ejecucion sobre Apple Silicon mediante MLX. El modelo subyacente es un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3, un transductor TDT (Token-and-Duration Transducer) con encoder FastConformer de aproximadamente 627 millones de parametros, publicado originalmente para el producto Photon de moondream.

El repositorio no entrena, cuantiza por debajo de bf16 ni poda nada: unicamente traduce los nombres de los tensores y la disposicion en memoria del grafo de Hugging Face (`ParakeetForTDT`) al grafo que espera la implementacion NeMo/MLX de mlx-audio-swift. Tras la conversion quedan 697 tensores, cifra identica a la del modelo de referencia mlx-community/parakeet-tdt-0.6b-v3, con nombres y formas coincidentes uno a uno.

Su relevancia es practica y acotada: permite ejecutar un modelo ASR multilingue de 25 idiomas europeos (incluido el espanol) de forma nativa en Macs con chip Apple Silicon, a traves de una libreria Swift pensada para integracion en aplicaciones de escritorio. El autor advierte explicitamente de que las mejoras de precision del modelo upstream no se han reproducido en este repositorio y que, en sus pruebas con voz sintetica, el comportamiento es indistinguible del modelo de referencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decoder TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 (aproximadamente 0,63 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (bf16) unicamente; no se distribuyen pesos cuantizados |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | safetensors con layout MLX; 1,3 GB de tamano de repositorio |
| Numero de tensores | 697 |
| Tamano de vocabulario | 8192 tokens |
| Libreria | mlx (Apple MLX) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo es un transductor TDT, la variante de NVIDIA sobre RNN-Transducer en la que el decoder predice conjuntamente el token y su duracion, lo que acelera la decodificacion al reducir el numero de pasos. El encoder es un FastConformer con atencion relativa (proyecciones `relative_k_proj` y sesgos `bias_u`/`bias_v`) y un modulo de pre-encode convolucional que en este repositorio aparece con los pesos reordenados de NCHW a NHWC. El decoder combina un embedding de prediccion con una LSTM, y la red conjunta (`joint_net`) fusiona las salidas de encoder y decoder. El modelo incorpora una cabeza de deteccion de actividad de voz (VAD) en el upstream, pero esta se descarta en la conversion porque el grafo NeMo no tiene donde alojarla.

No se ha realizado ningun entrenamiento adicional en este repositorio. Los pesos son los de moondream/parakeet-ultra en bf16, con nombres y ejes traducidos al esquema NeMo/MLX. En total se descartan 32 tensores del upstream: 6 de la cabeza VAD y 24 contadores `num_batches_tracked` de BatchNorm, que son metadatos de contabilidad y no pesos. El `config.json` y el tokenizer se toman sin cambios de mlx-community/parakeet-tdt-0.6b-v3, y el autor verifico que los vocabularios coinciden token a token (8192 de 8192 identicos).

La validacion realizada consiste en: coincidencia exacta de 697/697 nombres y formas de tensor con la referencia; similitud coseno por tensor con mediana 1,0000, media 0,9998 y minimo por encima de 0,8; y una transcripcion de prueba sobre un clip de 7 segundos que devuelve el texto de referencia palabra por palabra, puntuacion incluida. No se documentan en este repositorio ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en 25 idiomas europeos, entre ellos espanol, ingles, aleman, frances, italiano, portugues, neerlandes, polaco y griego.
- Decodificacion TDT con prediccion conjunta de token y duracion, lo que reduce el numero de pasos de decodificacion frente a un RNN-T clasico.
- Reconocimiento multilingue sin necesidad de especificar el idioma de antemano segun la model card original.
- Salida con puntuacion, segun la prueba de transcripcion descrita por el autor.
- Inferencia local en Apple Silicon con pesos en bfloat16.
- Integracion mediante la libreria mlx-audio-swift (`ParakeetModel`), pensada para aplicaciones Swift nativas.
- Deteccion de actividad de voz: no disponible en esta conversion, ya que la cabeza VAD del upstream fue descartada.
- Tool calling, function calling, agentes, vision y audio generativo: no aplica, es un modelo exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: con 25 idiomas soportados y ejecucion sobre Apple Silicon sin conexion, encaja en aplicaciones de escritorio tipo OpenMeet que necesitan transcribir audio sin enviarlo a la nube.
- Subtitulado de contenido audiovisual en lenguas europeas minoritarias: el modelo cubre idiomas poco frecuentes en otros ASR (croata, esloveno, leton, lituano, estonio, maltes), util para archivos audiovisuales publicos y television regional.
- Dictado en aplicaciones nativas de macOS: mediante mlx-audio-swift, un editor de texto o una app de notas puede transcribir en tiempo real aprovechando el rendimiento de 176-189 veces tiempo real medido por el autor.
- Indexacion y busqueda de archivos de audio corporativos: transcripcion por lotes de grabaciones internas para generar indices de texto consultables, con el coste de computo asumido localmente.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: generar transcripciones de corpus de audio multilingues como paso previo a la construccion de datasets de habla.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en videollamadas o ponencias, ejecutado en el propio equipo.
- Aplicaciones de investigacion en fonetica o linguistica de corpus: transcripcion rapida de grabaciones de campo sin depender de servicios externos ni ceder datos de participantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reprodujo las ganancias de precision del modelo upstream y que, en una comparacion contra mlx-community/parakeet-tdt-0.6b-v3 sobre voz sintetizada (limpia, y con relaciones senal-ruido de 10, 5 y 0 dB, ademas de aleman), ambos modelos produjeron texto identico en todos los casos salvo un token a 0 dB, donde este modelo fue el peor de los dos. El autor atribuye ese resultado a que la voz sintetica es un material mucho mas sencillo que los corpus humanos sobre los que se miden las cifras del Open ASR Leaderboard que aparecen en la ficha del modelo upstream.

En cuanto a rendimiento de inferencia, el unico dato publicado es el throughput: entre 176 y 189 veces tiempo real para este modelo, frente a 184-192 veces tiempo real del modelo de referencia, medidos sobre el mismo clip de 19 segundos en la misma maquina.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 1,3 GB para los pesos en bfloat16, mas el espacio de activaciones y buffers; en la practica, alrededor de 2 GB de memoria unificada durante la inferencia.
- GPU recomendadas: el modelo esta disenado para Apple Silicon mediante MLX. No se documentan requisitos ni pruebas en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon (serie M1 en adelante); el tamano de 0,63 mil millones de parametros no supone una restriccion relevante en equipos con 8 GB de memoria unificada o mas.
- Opciones de despliegue: MLX mediante mlx-audio-swift (`ParakeetModel`). No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables con este repositorio. Tampoco se documenta soporte para vLLM o TGI, que no cubren este tipo de arquitectura ASR.
- Latencia y throughput: 176-189 veces tiempo real sobre un clip de 19 segundos, medido por el autor en Apple Silicon. Para un audio de un minuto, esto equivale a menos de un tercio de segundo de computo, excluyendo la carga inicial del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| selcukkubur/parakeet-ultra-mlx | 627 M | 25 | CC-BY-4.0 | safetensors MLX | Conversion de formato para Apple Silicon; sin ganancias de precision demostradas frente a la referencia |
| mlx-community/parakeet-tdt-0.6b-v3 | 627 M | 25 | CC-BY-4.0 | safetensors MLX | Referencia directa; 697 tensores identicos en nombre y forma; mismo tokenizer y config |
| nvidia/parakeet-tdt-0.6b-v3 | 627 M | 25 | CC-BY-4.0 | safetensors (NeMo) | Modelo base ultimo de la cadena, en formato NeMo original |
| openai/whisper-large-v3 | 1.550 M | 99 | MIT | safetensors, GGUF, multiples runtimes | Alternativa generalista mas grande y con mas idiomas, pero aproximadamente 2,5 veces mas parametros y mayor coste de inferencia |

No se dispone de datos de benchmark comparativos publicados en la informacion proporcionada para establecer una comparacion de precision entre estos modelos.

## Limitaciones y advertencias

- El autor declara explicitamente que las mejoras de precision del modelo upstream no se han reproducido en este repositorio. Las cifras del Open ASR Leaderboard que aparecen en la ficha de moondream/parakeet-ultra no estan verificadas aqui.
- La unica prueba de calidad documentada se hizo sobre voz sintetizada, un material mucho mas sencillo que el audio humano real; el resultado fue indistinguible del modelo de referencia. Quien necesite las ganancias publicadas debe medir sobre audio real.
- No se documentan sesgos especificos ni evaluaciones de equidad. Al ser una conversion de pesos, los sesgos del modelo subyacente se heredan sin cambios.
- Riesgo de alucinacion en audio con ruido, musica, solapamiento de hablantes o silencios largos: es un comportamiento comun en modelos ASR de este tipo, aunque no se cuantifica en la informacion disponible.
- Cobertura limitada a 25 idiomas europeos; no soporta, por ejemplo, arabe, mandarin, japones, coreano ni hindi.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion. El credito corresponde a moondream por parakeet-ultra y a NVIDIA por parakeet-tdt-0.6b-v3.
- Dependencia de Apple Silicon: al estar en formato MLX, no es portable a GPU NVIDIA sin una nueva conversion.
- La cabeza de deteccion de actividad de voz del modelo upstream se ha eliminado, por lo que no se puede usar el modelo para segmentacion VAD.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior documentado.
- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no ejecuta codigo y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selcukkubur/parakeet-ultra-mlx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo de referencia MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria mlx-audio-swift: https://github.com/Blaizzy/mlx-audio-swift
- Proyecto OpenMeet: https://openmeet.ai
- Producto Photon de moondream: https://moondream.ai/photon
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
