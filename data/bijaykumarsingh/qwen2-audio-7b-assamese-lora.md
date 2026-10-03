# bijaykumarsingh/qwen2-audio-7b-assamese-lora

## Resumen

`qwen2-audio-7b-assamese-lora` es un adaptador LoRA entrenado sobre `Qwen/Qwen2-Audio-7B-Instruct` para reconocimiento automatico del habla (ASR) en asames, una lengua indoaria de bajos recursos con muy poca cobertura en sistemas ASR comerciales. Lo publica el usuario `bijaykumarsingh` y el objetivo declarado es adaptar un modelo de audio-lenguaje multimodal de 7B parametros a una lengua de bajos recursos sin reentrenar el encoder acustico.

El adaptador aplica LoRA con r=16, alpha=32 y dropout=0.05 sobre todas las proyecciones lineales, manteniendo congelado el encoder de audio del modelo base. El repositorio ocupa 0,2 GB, lo que confirma que solo se distribuyen los pesos del adaptador, no el modelo completo. La licencia es Apache 2.0 y el pipeline declarado es `automatic-speech-recognition`.

La relevancia de esta ficha es doble: por un lado, demuestra que tecnicas PEFT permiten llevar un audio-LLM generico a una lengua con recursos limitados con 11,70 horas de entrenamiento en una unica NVIDIA A40; por otro, sirve como caso de estudio de las limitaciones reales de este enfoque, con un WER del 27,97% en un conjunto de test estrictamente disjunto por hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `Qwen/Qwen2-Audio-7B-Instruct` (modelo base de audio-lenguaje multimodal con encoder acustico congelado) |
| Parametros totales | 7B en el modelo base; adaptador LoRA de ~0,2 GB (numero exacto de parametros entrenables no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors y se combina con el modelo base, que puede cuantizarse por separado |
| Idiomas soportados | Asames (`as`) para ASR; el modelo base es multilingue, pero la lista concreta no esta disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA montado sobre `Qwen2-Audio-7B-Instruct`, descrito en la model card como una linea base de audio-LLM multimodal de 7B. La configuracion LoRA es r=16, alpha=32 y dropout=0.05, aplicada a todas las proyecciones lineales del modelo, con el encoder acustico congelado. Esto implica que la adaptacion acoustic-a-texto se produce principalmente en la torre de lenguaje, reutilizando las representaciones del encoder audio del modelo original.

El entrenamiento completo requirio 11,70 horas de reloj en una NVIDIA A40 de 48 GB. No se especifican en la informacion disponible el numero total de tokens de audio vistos, la composicion exacta del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO; dado que se trata de un fine-tuning supervisado de ASR sobre un adaptador, lo previsible es un objetivo de modelado de secuencia sobre transcripciones, pero esto no se confirma en la ficha. La evaluacion se realizo sobre un split de test estrictamente disjunto por hablante, con normalizacion Unicode NFC y eliminacion de puntuacion, lo que reduce el riesgo de fuga de hablante entre entrenamiento y test.

## Capacidades

- Reconocimiento automatico del habla en asames a partir de audio, con salida de transcripcion en texto.
- Reutilizacion de las capacidades multimodales del modelo base Qwen2-Audio-7B-Instruct (comprension de audio y conversacion sobre audio), aunque el adaptador esta especializado en ASR.
- Procesamiento de audio de entrada mediante el `AutoProcessor` del modelo base, integrable en pipelines de `transformers` + `peft`.
- Metricas declaradas de evaluacion: WER, CER, MER y WIL, con soporte de calculo a nivel de palabra (hits, sustituciones, deleciones, inserciones).
- Soporte de tool calling, agentes, multi-step reasoning, vision, thinking mode o audio generativo: no documentado en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no documentadas para el adaptador; el entrenamiento declarado cubre unicamente asames.

## Casos de uso

- Transcripcion de archivos de audio en asames: el adaptador convierte voz en texto asames con un WER del 27,97% sobre un test disjunto por hablante, adecuado para tareas de transcripcion asistida donde un revisor humano corrige la salida.
- Indexacion y busqueda de archivos sonoros: transcripcion previa de grabaciones en asames para construir indices de texto buscables en archivos de radio, television o patrimonio oral.
- Subtitulado automatico de contenido audiovisual en asames: generacion de subtitulos borrador para video en asames, con posterior revision humana dado el margen de error del modelo.
- Documentacion de lenguas de bajos recursos: digitalizacion de corpus orales en asames para linguistica descriptiva y preservacion linguistica, aprovechando que el adaptador pesa solo 0,2 GB y es facil de versionar.
- Asistentes de voz para servicios publicos en Assam: prototipos de atencion al ciudadano que aceptan entrada de voz en asames y derivan a un flujo de texto, con arquitectura LoRA que permite desplegar varias lenguas sobre el mismo modelo base.
- Investigacion en PEFT y equidad linguistica: el adaptador sirve como punto de comparacion reproducible para estudiar como se comporta LoRA sobre un audio-LLM cuando la lengua destino tiene pocos datos.
- Preanotacion para anotadores humanos: generacion de transcripciones iniciales que un equipo humano corrige, reduciendo el coste por hora de audio frente a la transcripcion manual desde cero.

## Benchmarks y rendimiento

Evaluacion sobre un split de test estrictamente disjunto por hablante: 2.266 enunciados, 31 hablantes unicos, 3,18 horas de audio y 22.596 palabras en total. Normalizacion Unicode NFC y eliminacion de puntuacion.

| Metrica | Resultado | Intervalo de confianza / detalle |
|---|---|---|
| Word Error Rate (WER) | 27,97% | IC bootstrap 95%: [26,83%, 29,09%] |
| Character Error Rate (CER) | 10,92% | No disponible |
| Match Error Rate (MER) | 27,36% | No disponible |
| Word Information Lost (WIL) | 43,86% | No disponible |
| Tiempo de entrenamiento | 11,70 horas | NVIDIA A40 48 GB |

Desglose de errores a nivel de palabra sobre el mismo conjunto de test:

| Categoria | Recuento |
|---|---|
| Aciertos (hits) | 16.773 |
| Sustituciones | 4.908 |
| Deleciones | 915 |
| Inserciones | 496 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de ASR como FLEURS) para este adaptador.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,2 GB en disco y no requiere VRAM adicional apreciable una vez cargado.
- El coste real de inferencia viene del modelo base Qwen2-Audio-7B-Instruct: en fp16 se estima en torno a 15-16 GB de VRAM para pesos, mas overhead de activaciones y del encoder de audio.
- Con cuantizacion de 8 bits la estimacion baja a aproximadamente 8-9 GB; con 4 bits, a aproximadamente 5-6 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados en la ficha.
- GPU de gama profesional recomendadas: NVIDIA A40 (la usada en entrenamiento), A100, H100, L40S. Para inferencia en produccion, una A100 40 GB o L40S permite servir el modelo sin cuantizar con margen para el encoder de audio.
- En GPU de consumidor: cabe en una RTX 4090 (24 GB) sin cuantizar y en tarjetas de 12-16 GB si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada en la model card. vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal publicado es el tiempo de entrenamiento (11,70 horas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento ASR en asames |
|---|---|---|---|---|---|
| `qwen2-audio-7b-assamese-lora` (este) | 7B (base) + adaptador LoRA | No disponible | Apache 2.0 | LoRA sobre audio-LLM multimodal | WER 27,97% en test disjunto por hablante |
| `Qwen/Qwen2-Audio-7B-Instruct` (base) | 7B | No disponible | Apache 2.0 (segun la model card del autor) | Audio-LLM multimodal sin adaptar | No disponible para asames en la informacion proporcionada |
| Whisper large-v3 | ~1,55B | 30 s por ventana | MIT | Encoder-decoder especifico de ASR | No disponible para asames en la informacion proporcionada |
| Adaptadores ASR de AI4Bharat / IndicWhisper para lenguas indias | Variable | No disponible | No disponible | Fine-tuning de Whisper sobre lenguas indicas | No disponible en la informacion proporcionada |

Los datos de las filas de modelos alternativos proceden de conocimiento general sobre esos modelos y no de la informacion proporcionada en esta busqueda; no se dispone de cifras comparativas verificadas de WER en asames para ninguno de ellos.

## Limitaciones y advertencias

- WER del 27,97% y WIL del 43,86%: el modelo pierde una proporcion significativa de informacion a nivel de palabra, por lo que no es adecuado para transcripcion automatica sin revision humana.
- Las deleciones (915) y sustituciones (4.908) son la principal fuente de error; las primeras implican omision de contenido, lo que puede ser especialmente problematico en contextos legales, medicos o administrativos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.
- El modelo esta entrenado exclusivamente para asames (`as`); su uso con otras lenguas o con audio code-switching no esta documentado.
- Al ser un adaptador LoRA, para funcionar requiere cargar primero `Qwen/Qwen2-Audio-7B-Instruct`; los 0,2 GB del repositorio no son suficientes por si solos.
- No se documentan sesgos conocidos, comportamiento ante acentos o dialectos del asames, ni robustez frente a ruido de fondo.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas, inherente a los modelos generativos usados como ASR.
- La licencia declarada es Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de audio empleados en el entrenamiento, que no se detallan.
- La cita del autor referencia un preprint de arXiv (`singh2026assamese_lalm`) que no se ha podido verificar en la informacion proporcionada.
- Se recomienda fijar la version exacta del adaptador y del modelo base, y evaluar en un conjunto propio disjunto por hablante antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bijaykumarsingh/qwen2-audio-7b-assamese-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Cita del autor (referencia textual de la model card): Singh, Bijay Kumar, "Architectural Inductive Bias Trumps Parameter Scale: Adapting Large Audio-Language Models to Low-Resource Assamese ASR", arXiv preprint, 2026.
- La busqueda web realizada no devolvio ningun enlace tecnico relevante sobre el modelo, el paper o el dataset; los resultados obtenidos no guardan relacion con el contenido de esta ficha.
