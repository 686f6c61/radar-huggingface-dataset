# gijl/level-tts-ar

## Resumen

gijl/level-tts-ar es un modelo de sintesis de voz (text-to-speech) en arabe con capacidad de clonacion de voz zero-shot, entrenado desde cero con el script `level.py` del autor. Pertenece a la familia F5-TTS, es decir, un Diffusion Transformer (DiT) entrenado con flow matching, no un modelo autorregresivo ni un LLM. El modelo se distribuye con el preset `base` y su ultimo checkpoint publicado corresponde al paso 5649 de entrenamiento.

La particularidad principal es su cobertura dialectal: no se limita al arabe estandar moderno (MSA), sino que incorpora 21 etiquetas de dialecto (entre ellas egipcio, saudí, kuwaití, emiratí, qatari, omani, yemení, iraquí, sirio, libanés, palestino, jordano, sudanés, libio, tunecino, argelino, marroqui y un comodin `unk`). Esto lo situa en un nicho poco cubierto por los sistemas TTS comerciales, que suelen tratar el arabe como un unico idioma y ofrecer una calidad muy desigual fuera del MSA.

El modelo se publica con muy poca documentacion: no declara licencia, no publica recuento de parametros, no incluye benchmarks ni integraciones con frameworks de inferencia habituales. El repositorio ocupa 86,2 GB, dominado por el estado completo de entrenamiento (`latest.pt`) y no por los pesos de inferencia. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con flow matching, familia F5-TTS |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones GGUF/INT8/INT4. El peso de inferencia se distribuye en fp16 |
| Idiomas soportados | Arabe unicamente, multi-dialecto: msa, eg, sa, bh, kw, ae, qa, om, ye, iq, sy, lb, ps, jo, sd, ly, tn, dz, ma, mr, unk |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | PyTorch (`.pt`): `latest.pt` (estado completo de entrenamiento), `ema_model.pt` (pesos EMA en fp16); vocabulario en `vocab_ar.json` |
| Muestreo de audio | Mel a 24.000 Hz, 100 bandas, hop 256 |
| Vocoder | No incluido; requiere un vocoder Vocos compatible con la configuracion mel anterior |
| Preset | `base` |
| Checkpoint | Paso 5649 |
| Tamano del repositorio | 86,2 GB |

## Arquitectura y entrenamiento

La model card indica que el modelo se entreno desde cero con `level.py` y lo situa explicitamente en la familia F5-TTS. F5-TTS es una arquitectura de sintesis de voz basada en flow matching sobre un Diffusion Transformer: en lugar de predecir tokens de audio de forma autorregresiva, el modelo aprende un campo de velocidad que transforma ruido gaussiano en la representacion mel del audio objetivo, condicionado por el texto y por un audio de referencia para la clonacion zero-shot. La representacion acustica declarada es mel de 24.000 Hz con 100 bandas y hop 256, un ajuste poco habitual (lo comun en la familia F5-TTS es 24 kHz con 100 bandas y hop 256 en la variante multilingue), por lo que el vocoder debe coincidir exactamente con esa configuracion.

Los artefactos publicados confirman que el entrenamiento esta pensado para reanudarse: `latest.pt` contiene el estado completo (modelo, optimizador, EMA y numero de paso), mientras que `ema_model.pt` ofrece unicamente los pesos suavizados por media movil exponencial en fp16 para inferencia. El vocabulario `vocab_ar.json` incluye el conjunto de caracteres y las etiquetas de dialecto, lo que implica que el condicionamiento dialectal se inyecta a traves de tokens especiales en la secuencia de entrada, no mediante un adaptador separado.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de ajuste fino con preferencias humanas (RLHF/DPO, poco habituales en TTS) ni la procedencia de los datos de audio. Tampoco se documenta ninguna innovacion tecnica adicional mas alla de la propia eleccion de flow matching y del esquema multidetiqueta de dialectos.

## Capacidades

- Sintesis de voz en arabe a partir de texto, con vocabulario de caracteres arabe especifico (`vocab_ar.json`).
- Clonacion de voz zero-shot: el modelo se condiciona con un audio de referencia y reproduce el timbre del hablante sin necesidad de ajuste fino por hablante.
- Control de dialecto mediante etiquetas: 20 codigos de dialecto arabes mas `unk` para casos no identificados.
- Generacion de mel-espectrogramas a 24.000 Hz, 100 bandas y hop 256, que deben convertirse a audio con un vocoder Vocos compatible.
- Capacidad de reanudar o continuar el entrenamiento a partir de `latest.pt`, incluyendo estado de optimizador y EMA.
- No dispone de soporte documentado de tool calling, function calling, uso como agente ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de vision, audio-entendimiento ni traduccion declaradas; es un modelo puramente generativo de voz en arabe.
- No se documentan capacidades de control de emocion, velocidad, prosodia o estilo mas alla del dialecto y la referencia de voz.

## Casos de uso

- Localizacion de contenido audiovisual a arabe dialectal: el modelo permite doblar un mismo guion a MSA, egipcio o marroqui seleccionando la etiqueta de dialecto correspondiente, algo que los TTS comerciales rara vez ofrecen con control explicito. Requiere verificar antes la licencia, hoy no declarada.
- Audiolibros y lectura de documentos largos en arabe: la clonacion zero-shot permite mantener una voz consistente a lo largo de toda una obra a partir de unos pocos segundos de referencia, evitando el coste de entrenar un modelo por narrador.
- Sistemas de atencion al cliente e IVR en dialectos locales: un asistente telefonico puede responder en el dialecto del interlocutor (por ejemplo, kuwaiti o emirati) en lugar de un MSA que suena artificial en contextos coloquiales.
- Generacion de datos sinteticos para ASR: al cubrir dialectos escasamente representados, el modelo puede producir corpus de audio etiquetado para entrenar o evaluar sistemas de reconocimiento de voz arabes alli donde no existen grabaciones suficientes.
- Videojuegos y experiencias interactivas con personajes que hablan dialectos distintos: la clonacion de voz permite asignar timbres diferenciados a cada personaje y cambiar el dialecto por escena sin re-grabar.
- Accesibilidad y comunicacion aumentativa: clonar la voz de una persona a partir de grabaciones previas para que pueda seguir comunicandose tras perder el habla, siempre con consentimiento explicito y dentro del marco legal aplicable.
- Formacion y e-learning en arabe: generar narraciones para cursos en MSA o en dialecto local segun el publico objetivo, con coste marginal practicamente nulo frente a la locucion profesional.
- Prototipado rapido de productos de voz antes de contratar locutores: validar guiones, tono y duracion con audio sintetico de calidad suficiente para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica objetiva (WER del ASR de evaluacion, similitud de hablante tipo SECS, MOS naturalidad, MOS similitud) ni comparaciones con otros sistemas TTS arabes. Tampoco se aportan curvas de perdida ni evaluaciones por dialecto.

## Requisitos de hardware

- VRAM de inferencia: no disponible. No se publica el recuento de parametros, por lo que no puede calcularse una cifra fiable. El unico dato util es que el peso de inferencia (`ema_model.pt`) se distribuye en fp16.
- Nota sobre el tamano del repo: los 86,2 GB corresponden en su mayor parte a `latest.pt` (modelo, optimizador y EMA en precision de entrenamiento), no al modelo de inferencia. No debe dimensionarse el hardware a partir del tamano del repositorio.
- GPU para entrenamiento o reanudacion: no disponible; depende del recuento de parametros y del tamano de lote, que no se documentan.
- GPU de consumo: no confirmado. Si la escala del modelo es comparable a la de la familia F5-TTS, seria desplegable en GPU de consumo modernas con suficiente VRAM, pero esto no puede afirmarse con los datos aportados.
- Vocoder: se requiere ademas memoria y computo para un vocoder Vocos compatible con mel de 24 kHz, 100 bandas y hop 256, que no se incluye en el repositorio.
- Opciones de despliegue: no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI; ninguna de ellas es aplicable de forma directa a un modelo de difusion para TTS. La via prevista es la inferencia con el codigo de la familia F5-TTS o con `level.py`, y la exportacion manual a ONNX o TensorRT si se quisiera optimizar.
- Latencia y throughput: no disponibles. En modelos de flow matching, el coste depende del numero de pasos de muestreo (ODE solver), parametro que no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte de la informacion proporcionada en la busqueda, por lo que las celdas correspondientes se marcan como no disponibles. La unica relacion confirmada es la pertenencia a la familia F5-TTS, indicada por el propio autor.

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gijl/level-tts-ar | DiT con flow matching (familia F5-TTS) | no disponible | Arabe multi-dialecto (21 etiquetas) | no disponible | HuggingFace, pesos `.pt` |
| F5-TTS (referencia de familia) | DiT con flow matching | no disponible en la informacion aportada | no disponible en la informacion aportada | no disponible en la informacion aportada | no disponible en la informacion aportada |
| Otros TTS arabes open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados comparativos de naturalidad, similitud de hablante ni cobertura dialectal entre `level-tts-ar` y cualquier alternativa, ya que el autor no publica evaluaciones.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion de uso, lo que bloquea por defecto cualquier explotacion comercial o redistribucion. Es el caveat mas importante antes de considerar el modelo para produccion.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, inteligibilidad ni fidelidad de clonacion. Cualquier evaluacion debe hacerse por cuenta propia.
- Cobertura dialectal declarada pero no evaluada: se listan 20 dialectos mas `unk`, pero no se indica cuantos datos de entrenamiento hay por dialecto. Es esperable un rendimiento muy desigual y una calidad baja en los codigos con menos datos, algo que no puede verificarse con la informacion disponible.
- Riesgo de artefactos y errores de pronunciacion: en TTS basados en flow matching, los fallos tipicos son prosodia incorrecta, silabas repetidas o omitidas, y ruido en los bordes de las frases. El checkpoint publicado esta en el paso 5649, lo que sugiere un entrenamiento posiblemente no finalizado.
- Dependencia estricta del vocoder: sin un vocoder Vocos con la configuracion exacta (24 kHz, 100 bandas, hop 256), la salida de audio no sera correcta. El vocoder no se distribuye en el repositorio.
- Idioma unico: solo arabe. No hay soporte de code-switching declarado, lo que limita su uso en contextos reales donde se mezclan arabe y terminos en ingles o frances.
- Riesgo de uso indebido de la clonacion de voz: la capacidad zero-shot permite imitar voces sin consentimiento. Su uso exige consentimiento explicito del hablante y cumplimiento de la normativa aplicable sobre datos biometricos y derechos de imagen y voz.
- Sesgos potenciales: no se documenta la composicion del dataset ni el equilibrio de genero, edad, origen geografico o clase social de los hablantes, por lo que no puede descartarse un sesgo sistematico hacia determinados registros o variedades urbanas.
- Sin soporte ni comunidad: 0 descargas y 0 likes implican ausencia de validacion externa, de issues resueltos y de integraciones de terceros.
- Sin informacion sobre el preprocesado del texto: no se documenta la normalizacion de texto arabe (diacriticos, numeros, abreviaturas, transliteraciones), un aspecto critico para la calidad final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gijl/level-tts-ar

La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a contenido audiovisual y bancos de videos sin relacion con `gijl/level-tts-ar`. Por tanto, no se dispone de papers, blogs, repositorios de codigo ni demos adicionales que enlazar.
