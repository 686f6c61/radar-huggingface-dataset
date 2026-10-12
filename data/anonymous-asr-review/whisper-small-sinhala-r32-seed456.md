# anonymous-asr-review/whisper-small-sinhala-r32-seed456

## Resumen

whisper-small-sinhala-r32-seed456 es un adaptador LoRA de rango 32 entrenado sobre openai/whisper-small para reconocimiento automatico de voz (ASR) en sinhala e ingles, con enfasis declarado en el fenomeno de code-switching entre ambos idiomas. El modelo lo publica la cuenta anonima anonymous-asr-review y la propia model card lo describe como un artefacto suplementario para revision por pares, es decir, un material de reproducibilidad asociado a un experimento academico mas que un modelo listo para produccion. El adaptador se comparte mediante la libreria PEFT y no incluye los pesos del modelo base, que deben descargarse por separado desde el repositorio de OpenAI.

Tecnicamente es un adaptador de bajo rango (rank 32, alpha 32) sobre la arquitectura Whisper small, un transformer encoder-decoder de aproximadamente 244 millones de parametros en su forma original, con ventanas de audio de 30 segundos a 16 kHz. La model card indica que este adaptador concreto es el de rango 32 compartido por las estrategias "independent" y "frozen-Sinhala" del estudio, con semilla 456, pero no detalla el dataset, el numero de horas de audio, la metrica de evaluacion ni los hiperparametros de entrenamiento.

Su relevancia es limitada y muy especifica: sirve para reproducir y auditar un barrido experimental de adaptacion LoRA en un idioma de bajos recursos como el sinhala, y para estudiar como se comporta un adaptador de rango medio en escenarios de mezcla de codigos sinhala-ingles. No hay resultados de benchmarks publicados, no declara licencia y acumula cero descargas en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA; modelo base openai/whisper-small |
| Parametros totales | Aproximadamente 244 M en el modelo base; la model card no cuantifica los parametros entrenables del adaptador LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana y 448 tokens en el decodificador de texto (valores del modelo base Whisper small); el adaptador no los modifica |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye sin cuantizar en safetensors |
| Idiomas soportados | Sinhala (si) e ingles (en), con enfasis en code-switching |
| Licencia | No disponible; la model card no especifica licencia |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base openai/whisper-small es un transformer encoder-decoder de tipo seq2seq disenado para ASR: el encoder procesa espectrogramas mel de 80 canales extraidos de audio a 16 kHz organizados en ventanas de 30 segundos (1500 fotogramas) y el decoder genera texto de forma autoregresiva con un maximo de 448 tokens. La configuracion tipica de whisper-small es de 12 capas en encoder y 12 en decoder, 768 dimensiones de modelo y 12 cabezas de atencion. Sobre esta base, el adaptador introduce matrices de bajo rango con rank 32 y alpha 32, un valor de alpha igual al rank que deja el factor de escala en 1 y que suele emplearse cuando no se busca reajustar la magnitud de la actualizacion.

En cuanto al entrenamiento, la informacion disponible se limita a lo declarado en la model card: el adaptador corresponde al rango 32, se entreno con la semilla 456 y es compartido por las estrategias denominadas "independent" y "frozen-Sinhala" del estudio. No se especifican el numero de horas de audio, la composicion del corpus, la proporcion de enunciados con code-switching, el numero de pasos o epocas, la tasa de aprendizaje, si se aplico congelacion parcial de capas ni los parametros de decodificacion usados en la evaluacion. Tampoco se documenta el uso de tecnicas adicionales como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Reconocimiento automatico de voz en sinhala e ingles a partir de audio mono a 16 kHz.
- Transcripcion de habla con mezcla de codigos sinhala-ingles (code-switching), que es el caso de uso declarado en las etiquetas del repositorio.
- Capacidades heredadas del modelo base Whisper small: transcripcion multilingue, deteccion de idioma, traduccion de voz a texto en ingles y marcas temporales a nivel de segmento. La model card no confirma que el adaptador preserve estas capacidades sin degradacion.
- Soporte de tool calling o function calling: no aplica, es un modelo de reconocimiento de voz y no un modelo de lenguaje conversacional.
- Soporte de agentes o razonamiento multi-paso: no aplica ni esta documentado.
- Capacidades de vision, audio enriquecido o modo de razonamiento explicito (thinking mode): no disponibles.
- Integracion con el ecosistema HuggingFace Transformers y PEFT mediante carga del adaptador y posterior merge_and_unload sobre los pesos base.

## Casos de uso

- Transcripcion de servicios publicos en Sri Lanka: el adaptador puede convertir grabaciones de atencion ciudadana en sinhala a texto para su indexacion y busqueda, aprovechando que el modelo base gestiona ventanas de 30 segundos que se pueden encadenar con solapamiento.
- Subtitulado de contenido audiovisual con code-switching: programas de television, entrevistas o podcasts donde los hablantes alternan sinhala e ingles se pueden transcribir y sincronizar por segmentos, que es precisamente el escenario para el que se etiqueta el adaptador.
- Analitica de centros de contacto: transcripcion de llamadas de soporte en sinhala para extraer motivos de contacto, calcular tiempos de resolucion y alimentar cuadros de mando, siempre que se resuelva antes la ambiguedad de licencia.
- Creacion de corpus linguisticos y anotacion: generacion de transcripciones preliminares que despues se corrigen manualmente, con el ahorro de tiempo que supone partir de una hipotesis automatica cercana al idioma objetivo.
- Investigacion en adaptacion eficiente de parametros: el adaptador sirve como punto de reproducibilidad para comparar estrategias de LoRA (rango 32, semilla 456, estrategias independent y frozen-Sinhala) sobre un mismo modelo base.
- Punto de partida para ajuste adicional: al ser un adaptador PEFT, se puede seguir entrenando sobre dominios concretos (medico, legal, agricola) con coste de computo bajo, ya que solo se actualizan las matrices de bajo rango.
- Despliegue en pipelines de transcripcion locales: el adaptador fusionado con el modelo base ocupa menos de un gigabyte en precision de 16 bits, por lo que se puede empaquetar en servicios de transcripcion on-premise sin GPU dedicada.
- Accesibilidad y documentacion de reuniones: transcripcion de reuniones internas con terminologia tecnica en ingles insertada en frases en sinhala, util para generar actas y resumenes posteriores con un modelo de lenguaje aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabras (WER) ni de caracteres (CER), no detalla el conjunto de evaluacion y no ofrece comparaciones con otros adaptadores del mismo estudio. Cualquier cifra de rendimiento en sinhala o en code-switching tendria que reproducirse localmente a partir del adaptador y del modelo base.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB en FP32 y 0,5 GB en FP16 para los aproximadamente 244 M de parametros del modelo base, mas el coste de activaciones y del cache de atencion durante la decodificacion; en la practica, un presupuesto de 2 a 4 GB de VRAM es suficiente para lotes pequenos con busqueda por haz.
- El adaptador LoRA en si ocupa unos pocos megabytes (el repositorio se reporta con 0,0 GB), pero requiere descargar y cargar los pesos completos de openai/whisper-small.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior es mas que suficiente, y tarjetas como RTX 4090, A100 o H100 estan sobredimensionadas para este tamano salvo que se procesen muchos flujos en paralelo.
- Cabe sin problema en GPU consumer e incluso puede ejecutarse en CPU con latencias aceptables para transcripcion por lotes.
- Opciones de despliegue: Transformers con PEFT (carga directa del adaptador y merge_and_unload), faster-whisper o whisper.cpp tras convertir el modelo fusionado a los formatos soportados, y servicios propios con batching dinamico. El soporte de vLLM o TGI para arquitecturas Whisper no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad | Rendimiento en sinhala |
|---|---|---|---|---|---|---|
| whisper-small-sinhala-r32-seed456 | ~244 M mas adaptador LoRA r32 | 30 s | si, en | No disponible | HuggingFace, 0 descargas | No disponible |
| openai/whisper-small | ~244 M | 30 s | Multilingue (cerca de 99 idiomas) | Consultar la model card del modelo base | HuggingFace, muy extendido | No disponible en la informacion proporcionada |
| openai/whisper-medium | ~769 M | 30 s | Multilingue | Consultar la model card del modelo base | HuggingFace | No disponible en la informacion proporcionada |
| openai/whisper-large-v3 | ~1550 M | 30 s | Multilingue | Consultar la model card del modelo base | HuggingFace | No disponible en la informacion proporcionada |

No se dispone de datos de WER ni de comparaciones directas contra otros adaptadores de sinhala, por lo que la comparativa se limita a parametros, ventana de contexto y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no se puede asumir permiso para uso comercial; hay que contactar con el autor o tratar el modelo como no apto para produccion.
- Artefacto anonimo de revision por pares: la cuenta que lo publica es anonima y la model card indica que es material suplementario, sin garantia de mantenimiento ni de soporte.
- Cero descargas y una sola interaccion registradas: no existe validacion independiente de su calidad.
- Ausencia total de metricas: no hay WER, CER ni detalles del conjunto de evaluacion, asi que no se puede estimar su rendimiento real en sinhala ni en code-switching.
- Dependencia del modelo base: no funciona de forma autonoma; requiere descargar openai/whisper-small por separado y fusionar el adaptador.
- Riesgo de alucinacion propio de Whisper: en audio con ruido, silencios largos, musica o habla muy solapada, la familia Whisper tiende a generar texto plausible pero inexistente, y este riesgo es mayor en idiomas de bajos recursos.
- Sinhala es un idioma con menos datos de entrenamiento que el ingles, por lo que es esperable un sesgo hacia el ingles y un rendimiento desigual segun dominio, acento y registro.
- La ventana fija de 30 segundos obliga a trocear el audio con solapamiento, lo que puede producir cortes a mitad de palabra y duplicaciones en las uniones si no se post-procesa.
- No es un modelo conversacional: no soporta tool calling, agentes ni razonamiento multi-paso, por lo que no debe plantearse como sustituto de un LLM.
- La semilla 456 y el rango 32 corresponden a un punto concreto de un barrido experimental; no hay evidencia de que sea la configuracion optima frente a otros rangos o semillas del mismo estudio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-sinhala-r32-seed456
- Modelo base: https://huggingface.co/openai/whisper-small
- Documentacion de PEFT (libreria indicada en el repositorio): https://huggingface.co/docs/peft
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas sobre el colectivo hacktivista Anonymous (Wikipedia en frances e ingles, lebigdata.fr, anonymoushackers.net, anoncph.com) y no guardan ninguna relacion con este modelo de reconocimiento de voz, por lo que no se incluyen como referencias tecnicas.
