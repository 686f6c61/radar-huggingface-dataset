# siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen/Qwen3-TTS-12Hz-1.7B-Base orientado a un problema muy concreto del ruso: que el acento prosódico de cada palabra se coloque exactamente donde lo indica una marca tipografica en el texto, incluso cuando esa marca contradice al diccionario. El autor es siriusfreak y el modelo se publica como un adaptador LoRA (r=16, alpha=32) fusionado en un checkpoint base, con licencia Apache 2.0 y soporte exclusivo de ruso.

Tecnicamente es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Qwen3-TTS con codec a 12 Hz y un modulo *talker*, con aproximadamente 1.930 millones de parametros (1.928.677.440 en safetensors). La marca de acento se codifica con el caracter combinante U+0301 colocado tras la vocal tonica, de modo que «за́мок» y «замо́к» se distinguen por un unico caracter y el modelo debe respetarlo al sintetizar audio.

La relevancia de este modelo radica en que resuelve una limitacion documentada de los adaptadores anteriores: el modelo base solo respeta marcas contra-diccionario en un 17% de los casos, mientras que este fine-tune alcanza el 96%. Para ello introduce una funcion de perdida contrafactual y un proceso de limpieza de etiquetas verificado contra el audio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer, codec 12 Hz, modulo talker); fine-tune con LoRA r=16, alpha=32 sobre atencion y MLP del talker |
| Parametros totales | 1.928.677.440 (~1,93 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos safetensors en bfloat16); el autor no documenta cuantizaciones publicadas |
| Idiomas soportados | ruso (ru) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado en la raiz y adaptador LoRA en `lora/`, ~35 MB) |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Tarea (pipeline) | text-to-speech |
| Tamano del repositorio | 4,6 GB |
| Modo de inferencia | clonacion de voz en contexto (audio de referencia + su transcripcion), `language="Russian"` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3-TTS-12Hz-1.7B-Base, un sistema de sintesis de voz con codec a 12 Hz y un componente *talker* encargado de generar los codigos acusticos. Sobre ese *talker* se aplica un LoRA de rango 16 y alpha 32 en las capas de atencion y de MLP, con una perdida compuesta por la entropia cruzada del codebook 0 mas 0,3 veces la entropia cruzada del predictor de codigos, siguiendo la receta de voicy (olluorg/voicy). Cada ejemplo se entrena en el mismo formato de layout de generacion que usa la inferencia (ICL, con audio de referencia y transcripcion).

El problema central que aborda el entrenamiento es que, sobre habla natural, una marca de acento suele repetir lo que la palabra ya dice, por lo que la perdida de validacion es identica con y sin marcas: nada obliga al modelo a leer la marca. Para corregirlo se introducen tres innovaciones. Primero, una *perdida de marca contrafactual*: para cada ejemplo se puntua el mismo audio con la marca de una palabra movida a otra vocal y se exige (con un hinge, peso 0,1) que la NLL sumada del codebook 0 sea al menos 5 nats superior a la de la marca verdadera; mover una marca pasa a costar al modelo 10-12 nats en audio reservado, frente a 1,5-1,9 en adaptadores anteriores. Segundo, una verificacion de las marcas contra el audio con el detector meter2: el 1,9% de las marcas de RUAccent sobre Russian LibriSpeech eran incorrectas y se movieron, y se descarto el 20% de las frases sinteticas de estres desplazado cuyos renders no reflejaban la marca. Tercero, dos epocas de entrenamiento (una tercera no aportaba) mas una epoca final a lr 5e-5 sobre casos dificiles generados por el propio adaptador (1515 tomas positivas y 186 fallos seguros como negativos). Los datos de partida son aproximadamente 12 horas de Russian LibriSpeech con marcas de RUAccent en el 70% de las palabras, mas frases sinteticas con estres desplazado deliberadamente.

## Capacidades

- Sintesis de voz (text-to-speech) en ruso con clonacion de voz en contexto: recibe audio de referencia y su transcripcion.
- Respeto fiel de la marca de acento U+0301 colocada tras la vocal tonica, incluso cuando contradice la pronunciacion esperada por diccionario (96% en marcas contra-diccionario).
- Lectura natural de texto sin marcar: las palabras sin marca se pronuncian segun el criterio propio del modelo.
- Diferenciacion de homografos («за́мок»/«замо́к», «му́ки»/«муки́») en el 98-100% de los casos.
- Generacion de audio a traves del codec de 12 Hz del modelo base.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada adicional ni otras capacidades multimodales distintas de la clonacion de voz referenciada.

## Casos de uso

- Lectura de textos con acentuacion controlada: el modelo permite marcar manualmente solo las palabras ambiguas y dejar que el resto se lea por criterio propio, util para audiolibros y locuciones donde el autor quiere fijar la prosodia.
- Correccion de homografos en sintesis: en frases como «За́мок стои́т на холме́, а ма́стер почини́л замо́к в двери́» el modelo distingue los dos significados de «замок» colocando el acento donde la marca indica.
- Generacion de material didactico de ruso: al respetar las marcas, sirve para producir ejemplos de audio en los que el acento es parte de la leccion.
- Integracion con anotadores automaticos de acento: combinado con RUAccent (MIT) y la conversion de su notacion «+» a U+0301, permite pipelines de TTS completamente automaticos con menos del 0,1% de palabras desviadas de la marca.
- Clonacion de voz para doblaje en ruso: al entrenarse y evaluarse en el layout de clonacion en contexto, es adecuado para replicar una voz de referencia manteniendo el control prosodico.
- Despliegue en produccion de TTS en ruso: el autor lo sirve con vLLM-Omni v0.30.0 como modelo Base, lo que facilita su integracion en servicios de sintesis con throughput alto.
- Investigacion en control prosodico: el repositorio incluye codigo de entrenamiento, datos, evaluacion y el detector meter2, lo que permite reproducir y extender el metodo a otros idiomas.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la propia model card y se miden con el detector de acento meter2 sobre audio generado (130 frases, ~730 marcas contra-diccionario, dos semillas de muestreo, intervalo del 95% de +/-1,5 puntos).

| Modelo | Sigue marca en vocal de diccionario | Sigue marca contra diccionario |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 65% | 17% |
| voicy ru-stress LoRA | 100% | 77% |
| siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf | 100% | 96% |

Otras metricas reportadas por el autor:

| Metrica | Este modelo | voicy ru-stress LoRA |
|---|---|---|
| Palabras que se desvian de la marca en texto ordinario (RUAccent) | 0,1% | 0,6% |
| CER medido con Whisper | 2,9% | 4,4% |
| Homografos seguidos correctamente | 98-100% | 98-100% |
| Coste en nats de mover una marca (audio reservado) | 10-12 | 1,5-1,9 |

Dato adicional aportado: sobre palabras en *Title case* leidas tal cual, el ajuste a lo que dicen los lectores de Russian LibriSpeech es del 95,2% (97,4% si se pasa a minusculas antes de RUAccent). Las marcas de RUAccent sobre Russian LibriSpeech contienen un 2-3% de errores, que quedan como margen restante.

## Requisitos de hardware

- VRAM estimada: con 1,93 mil millones de parametros, el checkpoint fusionado en bfloat16 ocupa del orden de 3,9 GB de pesos; contando activaciones y buffers de audio del codec, un presupuesto practico de 6-8 GB de VRAM es suficiente para inferencia en precision completa.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080 y RTX 4090; para despliegue en servidor son adecuadas tarjetas tipo A100, H100 o L40S, aunque por tamano no son necesarias.
- Cabe en GPU de consumo: si, con holgura en modelos de 8-12 GB de VRAM.
- Opciones de despliegue: la libreria `qwen_tts` (`Qwen3TTSModel.from_pretrained`) y vLLM-Omni v0.30.0, que es el modo en que el autor lo sirve en produccion como modelo Base. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguimiento de marca contra diccionario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf | 1,93 B | no disponible | 96% | apache-2.0 | HuggingFace (safetensors + LoRA) |
| sknyazev/voicy qwen3-tts-12hz-1.7b-ru-stress | 1,93 B (base) | no disponible | 77% | no disponible en la informacion | HuggingFace (GGUF) |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,93 B | no disponible | 17% | no disponible en la informacion | HuggingFace |

El modelo comparte base (Qwen3-TTS-12Hz-1.7B) con las alternativas, por lo que las diferencias de rendimiento se deben al ajuste fino y no a la arquitectura subyacente. Frente a RUAccent (ruaccent/accentuator, licencia MIT) la comparacion no es directa: RUAccent es un anotador de acento que predice donde va la marca, mientras que este modelo consume la marca y la convierte en audio.

## Limitaciones y advertencias

- Solo soporta ruso; no se documenta ningun otro idioma.
- La calidad final depende de la correccion de las marcas de entrada: si se usa RUAccent para anotar, queda un 2-3% de palabras con marca erronea que el modelo reproducirá fielmente porque las sigue de forma literal.
- Al entrenarse en el layout de clonacion de voz en contexto, requiere audio de referencia y su transcripcion; no se documenta su comportamiento como TTS puro sin referencia.
- La marca de acento debe codificarse correctamente con U+0301 tras la vocal tonica; otras notaciones (como el «+» de RUAccent) deben convertirse antes de la inferencia.
- En palabras en *Title case* el ajuste baja al 95,2%; el autor recomienda pasar estas palabras a minusculas antes de la anotacion automatica.
- Riesgo de alucinacion o de artefactos acusticos: no se cuantifica en la informacion disponible; los unicos datos son de fidelidad al acento y CER de transcripcion (2,9%).
- Sesgos: no se documentan analisis de sesgo de voz, genero, edad o procedencia en el material proporcionado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3-TTS, cuyas condiciones conviene revisar en el repositorio base.
- El repositorio tiene 0 descargas y 1 *like* en el momento de la consulta, por lo que existe poca validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Adaptador de referencia (voicy): https://huggingface.co/sknyazev/qwen3-tts-12hz-1.7b-ru-stress-gguf
- Receta de entrenamiento de voicy (repositorio): https://github.com/olluorg/voicy
- Anotador de acento RUAccent: https://huggingface.co/ruaccent/accentuator
