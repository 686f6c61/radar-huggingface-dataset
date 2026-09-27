# sampathlonka/svarupa_v2-asr-0.6b

## Resumen

Svarupa ASR 0.6B v2 (`svarupa_v2-asr-0.6b`) es un modelo de reconocimiento automatico del habla desarrollado por el equipo Svarupa (autor de HuggingFace `sampathlonka`) y especializado en Hinglish, es decir, habla con alternancia de codigo hindi-ingles. Se trata del segundo checkpoint de una familia propia construida sobre NVIDIA Nemotron 3.5 ASR 0.6B: la version v1 (`sampathlonka/svarupa_asr_0.6b_v1`) fue afinada primero y esta v2 continua el entrenamiento durante 4.000 pasos adicionales sobre una mezcla de audio mas amplia. El resultado es un modelo de aproximadamente 637 millones de parametros orientado a transcripcion en tiempo real de conversaciones bilingues.

La arquitectura es un FastConformer-Transducer (RNNT) con streaming cache-aware, la misma familia que emplea NVIDIA en su linea Nemotron ASR. Frente a modelos generativos multimodales tipo Whisper, la eleccion de un transductor con cache permite despliegues de baja latencia y consumo acotado, algo relevante para telefonia, bots de voz y atencion al cliente en India, donde la alternancia hindi-ingles es la norma y los ASR entrenados solo en ingles o solo en hindi fallan sistematicamente.

La relevancia actual del modelo reside en su nicho: es un checkpoint pequeno (0,6B) que compite en un segmento donde la mayoria de alternativas son mucho mas grandes, y publica resultados desglosados por dominio (Hinglish, hindi formal, telefonia rural, chatbot, dialectos) con un protocolo de normalizacion de texto declarado. La descarga y las interacciones publicas en HuggingFace son cero en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT) con streaming cache-aware |
| Parametros totales | ~637 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de streaming cache-aware, no contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (`hi`), ingles (`en`) y Hinglish (alternancia hindi-ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nemo` (archivo NeMo completo) y `.pt` (state_dict); configuracion en `config.yaml` |
| Frecuencia de muestreo | 16 kHz mono |
| Tamano del repositorio | 5,1 GB |
| Libreria | NeMo (`nemo_toolkit['asr']`) |
| Checkpoint publicado | paso global 4.000 de una continuacion de 10.000 pasos (ejecucion detenida en el paso 4.049) |
| Modelo base | NVIDIA Nemotron 3.5 ASR 0.6B via `sampathlonka/svarupa_asr_0.6b_v1` |
| Modo de prompt usado en evaluacion | `langID` |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer acoplado a un decodificador transductor (RNNT) con soporte de streaming cache-aware. Esta eleccion implica que el encoder mantiene un estado de cache entre fragmentos de audio, lo que permite transcripcion incremental con latencia controlada en lugar de requerir el audio completo antes de emitir la primera hipotesis. El checkpoint publicado corresponde al paso 4.000 de una continuacion de 10.000 pasos sobre el modelo v1, que a su vez era un fine-tune de `nvidia/nemotron-3.5-asr-streaming-0.6b`.

El entrenamiento se realizo sobre la mezcla interna "v8", con 2.939,3 horas de audio y 1.436.235 segmentos (cuts). Los pesos de muestreo son pesos de mezcla, no cuotas de horas. La composicion declarada es: Hinglish (`hien`) 937,8 h con peso del 50%; hindi formal (`hi`) 1.320,2 h con peso del 25%; Vaani (telefonia rural, re-muestreada) 480,5 h con peso del 10%; audio de chatbot limpiado con Silero-VAD 4,5 h con peso del 7%; ingles con acento indio (`enin`) 120,1 h con peso del 4%; y Svara (dominio vedico o recitado) 76,2 h con peso del 4%. El audio de chatbot es una porcion muy pequena en horas pero con un peso desproporcionadamente alto, lo que indica un ajuste deliberado hacia ese dominio. El scheduler es Noam con `lr=0.015`, 400 pasos de warmup, `batch_duration` de 200 segundos y `max_steps` de 10.000. No se menciona en la informacion disponible el uso de RLHF, DPO ni de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla en hindi, ingles indio y, sobre todo, habla con alternancia de codigo hindi-ingles (Hinglish).
- Transcripcion en streaming gracias al encoder cache-aware, apta para audio que llega de forma continua.
- Transcripcion de audio telefonico y de voz de baja calidad, con un slice especifico de telefonia rural (Vaani) en el entrenamiento.
- Manejo de audio de bots de voz y atencion al cliente, con un slice de chatbot limpiado mediante Silero-VAD.
- Cobertura de hindi formal de broadcast, lectura y conversacional.
- Cobertura de dominio recitado o vedico (slice Svara), poco habitual en ASR generalistas.
- Decodificacion configurable: greedy y beam search (beam 4 con estrategia `malsd_batch`, `max_symbols=35`, `score_norm=True`).
- Control de idioma mediante modo de prompt `langID`, usado en la evaluacion.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio generativo; es un modelo puramente ASR.

## Casos de uso

- Subtitulado y transcripcion de llamadas de atencion al cliente en India: el modelo esta afinado con audio de voice bots limpiado y cubre la alternancia hindi-ingles que domina en estas conversaciones, por lo que puede alimentar sistemas de analitica de llamadas o resumenes posteriores.
- Telefonia rural y servicios publicos: el slice Vaani (480,5 h, peso 10%) esta pensado para audio telefonico de zonas rurales; el modelo puede transcribir consultas de ciudadanos o encuestas telefonicas, aunque con un WER declarado de 39,80% en ese dominio, lo que exige revision humana.
- Voice bots en tiempo real: la arquitectura RNNT con cache permite transcripcion incremental a 16 kHz mono, adecuada para alimentar un dialogo por turnos con latencia baja.
- Moderacion y auditoria de conversaciones bilingues: transcripcion masiva de audio de contact center para busqueda, cumplimiento normativo o deteccion de calidad, con la ventaja de que un unico modelo cubre hindi e ingles sin enrutado manual de idioma.
- Investigacion en code-switching: sirve como punto de comparacion de 0,6B parametros frente a modelos mucho mayores en tareas de alternancia de codigo, con resultados publicados por dominio.
- Transcripcion de contenido educativo o religioso en hindi formal y dominio recitado: el slice Svara y el hindi de broadcast permiten cubrir material leido o recitado con un WER de 22,85% en hindi formal segun la model card.
- Dictado y documentacion en ingles con acento indio: el slice `enin` (120,1 h, peso 4%) da cobertura especifica de acentos indios, que suelen degradar los ASR entrenados con ingles estadounidense o britanico.
- Preprocesado para pipelines de NLP: transcripcion de audio a texto para posteriores etapas de analisis de sentimiento, extraccion de entidades o resumen, donde el coste de un modelo de 0,6B es mucho menor que el de un ASR de miles de millones de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, con normalizador de texto v7. Beam 4 (`malsd_batch`) cuando el conjunto tiene 2.000 segmentos o menos; Lahaja (6.152 segmentos) solo con decodificacion greedy. El indicador de verificacion del model-index esta marcado como no verificado en los cuatro registros.

| Benchmark | Segmentos | WER v2 | Modo |
|---|---|---|---|
| Hinglish code-switched (`val_hien`, `agarwalayushi/hinglish`) | 250 | 21,22% | beam 4 |
| Hindi formal (`val_hi`) | 250 | 22,85% | beam 4 |
| Chatbot conversacional | 236 | 29,83% | beam 4 |
| FLEURS Hindi (`google/fleurs`) | 418 | 14,54% | beam 4 |
| Kathbath Hindi (`AI4Bharat/kathbath`) | 1.929 | 11,06% | beam 4 |
| Telefonia rural Gramvaani | 1.032 | 39,80% | beam 4 |
| Evaluacion combinada | 630 | 23,01% | beam 4 |
| Lahaja multidialecto curado (`AI4Bharat/lahaja`) | 6.152 | 24,54% | greedy |

Segun la model card, en comparacion con v1 el conjunto de chatbot y el combinado empeoran ligeramente, mientras que Hinglish, hindi formal, FLEURS, Kathbath y Gramvaani mejoran ligeramente; Lahaja se mantiene igual. No se han publicado en la informacion disponible resultados comparativos directos contra otros modelos en los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de ~637 M parametros ocupa aproximadamente 2,5 GB en FP32 y 1,3 GB en FP16 solo en pesos, a lo que hay que sumar el estado de cache del streaming y el decodificador RNNT.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia ser suficiente para inferencia en FP16, e incluso en CPU para decodificacion no masiva.
- GPU de datacenter (A100, H100, L40S) recomendadas unicamente si se necesita alto throughput por lotes o despliegue concurrente multi-usuario.
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit['asr']`) con `ASRModel.restore_from` sobre el archivo `.nemo`; tambien se puede cargar el `state_dict` `.pt` con la configuracion `config.yaml`. No se mencionan en la informacion disponible exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI; vLLM, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje. NVIDIA Riva es una via de despliegue coherente con la familia Nemotron, pero no se confirma en la documentacion del autor.
- Latencia y throughput: no disponibles. La decodificacion beam 4 con `malsd_batch` es mas costosa que greedy; para streaming en tiempo real conviene validar la latencia real con el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svarupa_v2-asr-0.6b | ~637 M | hi, en, Hinglish | Si (cache-aware) | Apache 2.0 | HuggingFace, formato `.nemo` y `.pt` |
| sampathlonka/svarupa_asr_0.6b_v1 | ~0,6B (mismo orden) | hi, en, Hinglish | Si (cache-aware) | Apache 2.0 | HuggingFace |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B (segun nombre) | no disponible | Si (streaming) | no disponible en la informacion proporcionada | HuggingFace / NVIDIA |
| openai/whisper-large-v3 | no disponible en la informacion consultada | multilingue | No (procesa ventanas completas) | no disponible en la informacion consultada | HuggingFace |
| AI4Bharat IndicWhisper | no disponible en la informacion consultada | indias | No | no disponible en la informacion consultada | HuggingFace |

Las alternativas Whisper e IndicWhisper se incluyen por categoria (ASR multilingue con foco en lenguas indias), pero no se dispone de sus parametros, licencias ni resultados comparables en la informacion proporcionada. La comparativa cuantitativa fiable se limita, por tanto, a la familia Svarupa y a su modelo base NVIDIA.

## Limitaciones y advertencias

- El WER en telefonia rural es alto (39,80% en Gramvaani) y en audio de chatbot conversacional alcanza el 29,83%; ninguno de los dos dominios es apto para uso sin supervision humana.
- El checkpoint publicado es el paso 4.000 de una ejecucion detenida en el paso 4.049, no el punto final de entrenamiento previsto (10.000 pasos); puede existir margen de mejora sin explotar.
- Cobertura limitada a hindi, ingles indio y Hinglish; no se declara soporte de otras lenguas indias ni de ingles no indio.
- Entrada restringida a audio mono a 16 kHz; otros formatos requieren remuestreo previo.
- Los resultados del model-index estan marcados como no verificados por un tercero y proceden del propio autor.
- El modelo esta afinado sobre un conjunto con pesos de muestreo muy sesgados hacia Hinglish (50%) y audio sinteticamente limpiado con VAD en el caso del chatbot, lo que puede degradar el rendimiento en audio real con ruido no representado.
- Riesgo de alucinacion y de sustitucion de palabras en audio con ruido, acentos no cubiertos o solapamiento de hablantes; es un comportamiento esperable en decodificadores RNNT y no se cuantifica en la informacion disponible.
- La ficha declara licencia Apache 2.0 para el fine-tune, pero el modelo base es de NVIDIA; conviene verificar los terminos aplicables al modelo original antes de un uso comercial, ya que la informacion disponible no detalla la licencia del checkpoint NVIDIA subyacente.
- Soporte de la comunidad nulo en el momento de redactar (0 descargas, 0 likes), lo que implica poca validacion externa y ausencia de reportes de fallos.
- No se documentan tecnicas de mitigacion de sesgo ni auditorias de equidad sobre acentos, genero o dialectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sampathlonka/svarupa_v2-asr-0.6b
- Modelo base directo (v1): https://huggingface.co/sampathlonka/svarupa_asr_0.6b_v1
- Perfil del autor en HuggingFace: https://huggingface.co/sampathlonka
- Perfil del autor en GitHub: https://github.com/sampathlonka
- Repositorio secundario en GitHub: https://github.com/samlonka/
- Modelo base NVIDIA (referenciado en la model card): `nvidia/nemotron-3.5-asr-streaming-0.6b` (no se ha encontrado URL directa en los resultados de busqueda)
- Conjuntos de datos usados: `agarwalayushi/hinglish`, `AI4Bharat/kathbath`, `google/fleurs`, `AI4Bharat/lahaja` (URLs directas no disponibles en los resultados de busqueda)
- Tablas completas de benchmarks del autor: `benchmark_results.md` en el repositorio del modelo (no se ha podido verificar el enlace directo)
