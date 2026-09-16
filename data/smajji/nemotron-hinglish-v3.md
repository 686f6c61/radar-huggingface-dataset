# smajji/nemotron-hinglish-v3

## Resumen

Nemotron Hinglish v3 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario smajji a partir de un ajuste fino supervisado del modelo nvidia/nemotron-3.5-asr-streaming-0.6b. Esta especializado en ingles, hindi y, sobre todo, hinglish (conmutacion de codigo hindi-ingles), un fenomeno muy extendido en la India y escasamente cubierto por los sistemas ASR convencionales. Mantiene la arquitectura FastConformer-Transducer (RNNT) con memoria cache para streaming continuo del modelo base: 24 capas, 1024 dimensiones ocultas y aproximadamente 600 millones de parametros.

El problema que resuelve es doble. Por un lado, la transcripcion de audio con mezcla de idiomas dentro de una misma frase, para lo que conserva el vocabulario BPE de 13088 tokens y los 128 prompts de idioma del modelo original, incluido el prompt `auto` de deteccion automatica. Por otro, la precision en numeros: se han anadido corpus densos en digitos y simbolos para reducir errores en secuencias numericas y numeros de telefono, con una mejora declarada de aproximadamente el 28 % frente a la version v2.

Es relevante ahora porque el hinglish es la lengua franca oral de cientos de millones de hablantes y porque el modelo esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El autor reporta un WER del 4,2 % en ingles, 12,5 % en hindi y 29,7 % en hinglish sobre una muestra de validacion con decodificacion greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) con streaming cache-aware y subsampling 8x |
| Parametros totales | ~600 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); ventana de streaming por chunks de 80/160/320/560/1120 ms |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | en, hi y hinglish (code-switching); prompt `auto` para deteccion y mezcla |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint NeMo (.nemo); no se ofrecen safetensors ni GGUF |

Otras especificaciones: frecuencia de muestreo de 16 kHz mono, vocabulario BPE de 13088 tokens, 128 prompts de idioma, tamano del repositorio 2,6 GB, libreria `nemo`, pipeline `automatic-speech-recognition`.

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-Transducer: un encoder Conformer con subsampling 8x (24 capas, 1024 dimensiones ocultas) acoplado a un decodificador RNNT. La variante cache-aware permite inferencia en streaming real manteniendo un estado de cache entre chunks, con tamanos de chunk configurables de 80, 160, 320, 560 y 1120 ms, de modo que se puede ajustar el compromiso entre latencia y precision. El modelo conserva el vocabulario de 13088 tokens BPE y los 128 prompts de idioma del modelo base, incluido el prompt `auto` que activa la deteccion automatica de idioma y facilita la conmutacion de codigo. El modelo base es multilingue (incluye mas idiomas que los tres objetivo), pero este ajuste fino esta orientado a ingles, hindi e hinglish.

El ajuste fino se realizo sobre una mezcla bilingue y code-mixed con corpus especificos anadidos para mejorar la precision en digitos y simbolos. La composicion declarada es: SPGISpeech (ingles limpio), IISc_SPICOR (ingles con acento indio), Peoples Speech (ingles a gran escala), SPRING Hindi-1482Hrs y Shrutilipi (hindi), IndicVoices-R Hindi (hindi), UJS y Hinglish-CC (code-mixed), FLEURS en+hi (aproximadamente 21 % de contenido denso en digitos) y earnings22 (aproximadamente 22 % de digitos y 7,7 % de simbolos, rico en numeros de telefono). El entrenamiento uso el prompt `auto` con ratio 0,9 para conmutacion de codigo, y preserva puntuacion y uso de mayusculas/minusculas en la salida. No se documentan en la informacion disponible fases de RLHF o DPO, que no son habituales en modelos ASR.

## Capacidades

- Transcripcion de voz a texto en ingles, hindi y hinglish con mezcla de idiomas dentro de una misma intervencion.
- Reconocimiento en streaming con latencia controlada mediante chunks de 80, 160, 320, 560 o 1120 ms.
- Deteccion automatica de idioma mediante el prompt `auto`, sin necesidad de indicar el idioma de entrada.
- Precision reforzada en secuencias numericas: digitos, importes, fechas y numeros de telefono.
- Preservacion de puntuacion y capitalizacion en la transcripcion.
- Manejo de ingles con acento indio, gracias a la inclusion de IISc_SPICOR en el entrenamiento.
- Decodificacion greedy sobre salida RNNT; no se documenta soporte de beam search con modelo de lenguaje externo.
- No dispone de tool calling, capacidades de agente, vision ni audio generation: es exclusivamente un modelo ASR.

## Casos de uso

- Atencion al cliente en centros de contacto indios: transcripcion en tiempo real de conversaciones donde el agente habla ingles y el cliente responde en hindi o mezcla ambos, usando el prompt `auto` para no tener que fijar idioma por canal.
- Verificacion de identidad y toma de datos por telefono: la mejora del 28 % en precision de digitos frente a v2 reduce los errores al capturar numeros de telefono, documentos o importes dictados oralmente.
- Subtitulado en directo de retransmisiones para audiencias indias: los chunks de 80-320 ms permiten generar subtitulos con retardo bajo y mantener la puntuacion.
- Analitica de conversaciones y control de calidad: transcripcion por lotes de grabaciones con NeMo o Riva para alimentar sistemas de analitica, busqueda y cumplimiento normativo.
- Asistentes de voz embebidos: con ~600 M de parametros, puede exportarse a ONNX o desplegarse en GPUs de gama media o incluso en el borde, gestionando consultas bilingues.
- Transcripcion de reuniones y notas de voz: mezcla de terminologia tecnica en ingles con estructura gramatical hindi, frecuente en equipos de tecnologia indios.
- Accesibilidad y dictado: entrada por voz para usuarios que alternan hindi e ingles, con salida puntuada y con mayusculas.
- Preprocesado para LLM: pipeline ASR a LLM donde la transcripcion hinglish alimenta un modelo generativo para resumen o extraccion de acciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, decodificacion greedy, WER insensible a puntuacion, sobre una muestra reservada con prompt `auto`:

| Idioma | Nemotron-Hinglish-v3 | v2 | v1 |
|---|---|---|---|
| Ingles | 4,2 % | 5,1 % | 4,2 % |
| Hindi | 12,5 % | 13,4 % | 12,4 % |
| Hinglish | 29,7 % | 30,0 % | 22,6 % |

Ademas, el autor indica una mejora de aproximadamente el 28 % en precision de digitos y numeros de telefono respecto a v2, atribuida a los corpus densos en numeros anadidos durante el ajuste fino. No se han publicado otros resultados de benchmarks (por ejemplo, sobre FLEURS completo, Common Voice o sets publicos de hinglish) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP32 los ~600 M de parametros ocupan aproximadamente 2,4 GB; en FP16/BF16 unos 1,2 GB; la huella real de inferencia anade el estado de cache de streaming y los buffers de audio, por lo que conviene reservar 3-4 GB en precision completa y 2-3 GB en precision mixta.
- GPU recomendadas: NVIDIA A100, H100 o L4 para despliegues con muchas corrientes simultaneas; T4 o A10 para produccion moderada; RTX 3090, RTX 4090 o RTX 4080 para desarrollo y servicio de baja concurrencia.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM puede ejecutar el modelo en FP16, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: NeMo (carga mediante `ASRModel.restore_from`), NVIDIA Riva y NVIDIA Triton Inference Server para produccion, y exportacion a ONNX para entornos sin el stack NeMo. No es compatible con vLLM, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje, no a FastConformer RNNT.
- Latencia y throughput: la latencia minima en streaming viene determinada por el tamano de chunk elegido, de 80 ms a 1120 ms, y la precision tiende a mejorar con chunks mayores. No se publican cifras de throughput (audio por segundo) ni de concurrencia maxima en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas objetivo | Licencia | WER declarado |
|---|---|---|---|---|
| Nemotron Hinglish v3 (este) | ~600 M | en, hi, hinglish | Apache 2.0 | 4,2 % en / 12,5 % hi / 29,7 % hinglish |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600 M | multilingue (incluye en e hi) | no disponible en la informacion proporcionada | no disponible |
| Nemotron-Hinglish v2 (version previa) | ~600 M | en, hi, hinglish | no disponible en la informacion proporcionada | 5,1 % en / 13,4 % hi / 30,0 % hinglish |
| Nemotron-Hinglish v1 (version previa) | ~600 M | en, hi, hinglish | no disponible en la informacion proporcionada | 4,2 % en / 12,4 % hi / 22,6 % hinglish |

No se dispone de datos comparativos con otras familias de ASR (por ejemplo, alternativas de OpenAI, AI4Bharat o Speechmatics) en la informacion proporcionada, por lo que no se incluyen cifras de esas alternativas. Nota destacable: v1 obtiene mejor WER en hinglish que v3 (22,6 % frente a 29,7 %), mientras que v3 mejora en hindi y en precision de digitos.

## Limitaciones y advertencias

- El WER en hinglish es muy alto (29,7 %), casi el triple que en ingles, y de hecho empeora respecto a la v1 (22,6 %). Para produccion con codigo mezclado intensivo hay que validar con audio propio antes de desplegar.
- La model card no documenta evaluacion de sesgos por genero, acento, edad o variedad dialectal del hindi; el entrenamiento esta dominado por corpus indios y de ingles estadounidense, lo que puede penalizar acentos no representados.
- Riesgo de alucinacion y de sustitucion en audio ruidoso: en numerales y nombres propios los errores de digitos siguen siendo el punto debil, especialmente en numeros de telefono.
- El prompt `auto` esta calibrado con ratio 0,9 para conmutacion de codigo; su comportamiento en audio monolingue con acento marcado no esta documentado.
- La salida del modelo no debe usarse tal cual en dominios regulados (sanitario, financiero, legal) sin revision humana, dado el WER en hindi y hinglish.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de licencia y a no reclamar endoso de NVIDIA. Conviene verificar los terminos de los corpus de entrenamiento si se redistribuye el modelo.
- El repositorio tiene 0 descargas y 0 likes y fue creado en septiembre de 2026, por lo que no hay evidencia de comunidad, mantenimiento continuado ni soporte.
- La model card incluye un fragmento de codigo que carga el modelo con el identificador `nvidia/nemotron-hinglish-v3`, mientras que el repositorio real es `smajji/nemotron-hinglish-v3`. Hay que corregir el identificador al usarlo.
- Es un modelo exclusivamente ASR: no genera texto libre, no razonan, no soporta tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v3
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Toolkit NVIDIA NeMo (necesario para cargar el checkpoint .nemo): https://github.com/NVIDIA/NeMo
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a mapas de los Balcanes), por lo que no se pueden anadir papers, blogs ni demos adicionales.
