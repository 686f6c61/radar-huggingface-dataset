# Sanghyang00/ELARSpeech-OmniASR-1B-czn

## Resumen

ELARSpeech-OmniASR-1B-czn es un modelo de reconocimiento automatico del habla (ASR) monolingue desarrollado por el usuario Sanghyang00 dentro del proyecto ELARSpeech, y orientado especificamente al zenzontepec chatino (codigo ISO 639-3 `czn`), una lengua otomangue hablada en el estado de Oaxaca (Mexico). Se trata de un ajuste fino del checkpoint `aadel4/omniASR-CTC-1B-v2`, del que hereda la arquitectura `Wav2Vec2ForCTC` y un tamano de aproximadamente 976 millones de parametros (975.677.617 exactos segun los pesos safetensors publicados).

El modelo resuelve una tarea muy concreta: convertir audio mono a 16 kHz en una transcripcion de texto mediante decodificacion CTC, sin componente de lenguaje ni generacion autorregresiva. Su relevancia es fundamentalmente de nicho: las lenguas indigenas con pocos recursos apenas cuentan con sistemas ASR funcionales, y un checkpoint de casi mil millones de parametros entrenado o ajustado para una sola lengua de este tipo es un artefacto poco frecuente, pensado para documentacion linguistica, revitalizacion y creacion de corpus orales.

El repositorio es de publicacion reciente (creado el 14 de octubre de 2026, actualizado el mismo dia) y no registra descargas ni interacciones en el momento de redactar esta ficha. La model card es deliberadamente minima: documenta la arquitectura, el tamano, el idioma, el modelo base y las condiciones de entrada de audio, pero no incluye licencia explicita, resultados de WER ni detalles del dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (encoder convolucional + transformer, cabeza CTC) |
| Parametros totales | 975.677.617 (≈976 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo CTC sobre fragmentos de audio; la model card no fija un limite explicito) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan versiones GGUF, ONNX ni int8) |
| Idiomas soportados | zenzontepec chatino (ISO 639-3: `czn`), monolingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,9 GB |
| Modelo base | aadel4/omniASR-CTC-1B-v2 |
| Entrada de audio | mono, 16 kHz (obligatorio segun la model card) |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es `Wav2Vec2ForCTC`: un front-end convolucional que transforma la forma de onda cruda en representaciones latentes, seguido de un encoder transformer y una cabeza de clasificacion entrenada con Connectionist Temporal Classification (CTC). El modelo no genera texto token a token, sino que emite una distribucion por fotograma y se decodifica tomando el `argmax` sobre los logits, tal y como muestra el ejemplo de uso de la model card (`model(**inputs).logits.argmax(dim=-1)` y posterior `batch_decode`). Esto implica alineaciones monotonas y una latencia de inferencia proporcional a la duracion del audio, sin mecanismo de atencion cruzada sobre un historial de texto.

El checkpoint es un ajuste fino del modelo `aadel4/omniASR-CTC-1B-v2`. La model card no especifica el numero de tokens de audio utilizados, la composicion del corpus de zenzontepec chatino, ni si se aplicaron tecnicas de aumento de datos, regularizacion o calibracion posteriores. Tampoco hay informacion sobre el vocabulario CTC, el esquema de tokenizacion ni el proceso de exportacion desde el checkpoint original de ELARSpeech. El unico detalle de validacion aportado es que el artefacto exportado se compara contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con resultado de verificacion de transcripcion exacta **PASS**; se trata de una comprobacion de equivalencia funcional, no de una evaluacion de calidad ASR.

## Capacidades

- Transcripcion de voz a texto para zenzontepec chatino (`czn`) como unica lengua soportada.
- Decodificacion CTC greedy sobre la salida de logits, integrable en `transformers` con `AutoProcessor` y `Wav2Vec2ForCTC`.
- Procesamiento de audio mono remuestreado a 16 kHz, tal como exige la model card.
- Ejecucion sobre CPU o GPU mediante PyTorch (`torch.no_grad()` en el ejemplo oficial).
- No hay evidencia disponible de soporte de tool calling ni function calling: la arquitectura CTC no contempla un canal de herramientas.
- No hay evidencia disponible de capacidades de agente, razonamiento multi-paso ni planificacion.
- No hay evidencia disponible de capacidades multilingues, de traduccion, de vision ni de audio mas alla de la transcripcion.
- No hay evidencia disponible de modo de razonamiento explicito (*thinking mode*), puntuacion automatica, diarizacion de hablantes ni marcas de tiempo a nivel de palabra.

## Casos de uso

- Documentacion linguistica de campo: transcribir grabaciones de hablantes nativos de zenzontepec chatino para construir corpus anotados, partiendo de audio ya normalizado a 16 kHz mono; el modelo ofrece una primera pasada automatica que el linguista revisa y corrige.
- Revitalizacion y ensenanza de la lengua: generar transcripciones de materiales audiovisuales (cuentos, canciones, entrevistas) para producir subtitulos y material didactico bilingue destinado a comunidades hablantes.
- Archivado de patrimonio oral: procesar colecciones de audio etnografico almacenadas en archivos sonoros, convirtiendo cintas digitalizadas en texto buscable, siempre que la calidad de la grabacion permita una transcripcion utilizable.
- Investigacion fonetica y morfosintactica: obtener alineaciones CTC por fotograma que sirven como punto de partida para estudiar duracion, segmentacion y realizacion de fonemas en corpus de habla espontanea.
- Anotacion asistida en proyectos de IA de bajos recursos: usar el modelo como etiquetador inicial dentro de un pipeline de *active learning*, donde las transcripciones de baja confianza se derivan a revisores humanos.
- Subtitulado de entrevistas y testimonios: integrar el checkpoint en un flujo de posproduccion que recibe audio mono a 16 kHz y devuelve texto plano para su posterior formateo y temporizacion con herramientas externas.
- Preservacion digital en bibliotecas y universidades: desplegar el modelo en un servicio interno de transcripcion bajo demanda para investigadores que trabajan con fondos de lenguas indigenas mexicanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que la verificacion de transcripcion exacta frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion tiene estado **PASS**, sin aportar valores de WER, CER ni comparaciones numericas. El repositorio no registra descargas ni evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 975,7 M de parametros; no son cifras publicadas por el autor): aproximadamente 3,9 GB solo de pesos en fp32, con un consumo total esperado de 6-8 GB contando activaciones y overhead; en fp16 los pesos bajan a unos 2 GB y el total a 3-4 GB; en int8 los pesos rondan 1 GB y el total 2-3 GB.
- Cuantizaciones listas para usar: no disponible. El repositorio solo publica safetensors, por lo que cualquier cuantizacion (int8 dinamica, ONNX Runtime, etc.) tendria que generarla el usuario.
- GPU recomendadas: para fp16, una GPU con 4-8 GB de VRAM es suficiente; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 cubren el modelo con margen amplio. Para fp32, se recomienda al menos 8-12 GB de VRAM (RTX 3080/4080, A10, L4). En entornos de servidor, A100 o H100 no aportan ventaja por memoria, pero si por concurrencia y throughput agregado.
- Cabe en GPU de consumo: si, en fp16 o fp32 en tarjetas con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: `transformers` con PyTorch es la via documentada oficialmente por la model card. No hay soporte documentado de vLLM, TGI, llama.cpp, Ollama, Whisper.cpp ni ONNX Runtime para este checkpoint concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion no forman parte de la informacion proporcionada en esta busqueda y se incluyen como referencia orientativa; conviene verificarlos en sus repositorios oficiales. El rendimiento ASR comparado no esta disponible para ninguno de los casos.

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-czn | Wav2Vec2ForCTC | 975,7 M | zenzontepec chatino (monolingue) | no disponible | safetensors |
| aadel4/omniASR-CTC-1B-v2 (base) | Wav2Vec2ForCTC | ≈1 B (no confirmado en la informacion disponible) | no disponible | no disponible | no disponible |
| facebook/mms-1b-all | Wav2Vec2 con adaptadores de idioma | ≈965 M | mas de 1000 lenguas | CC-BY-NC 4.0 (uso no comercial) | safetensors |
| openai/whisper-large-v3 | Encoder-decoder transformer | 1,55 B | 99 lenguas (ninguna lengua indigena mexicana de este tipo) | Apache 2.0 | safetensors |

Diferencias clave: ELARSpeech-OmniASR-1B-czn y MMS comparten la familia wav2vec2 CTC, pero MMS cubre mas de mil lenguas con adaptadores mientras que este checkpoint se limita al zenzontepec chatino. Whisper-large-v3 es un modelo generativo con puntuacion y traduccion integradas, pero no cubre esta lengua. La ventaja especifica de ELARSpeech-OmniASR-1B-czn es la cobertura de una lengua concreta de muy bajos recursos; su desventaja es la ausencia de licencia declarada y de evaluacion publica.

## Limitaciones y advertencias

- Modelo estrictamente monolingue: solo procesa zenzontepec chatino (`czn`). No se espera un comportamiento util con otras lenguas.
- La model card advierte de que la precision varia segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio del audio. No se documentan valores de error que permitan acotar esa variabilidad.
- Riesgo de alucinacion y de sustituciones foneticas: al ser un modelo CTC ajustado con datos limitados, la salida puede contener segmentos repetidos o mal segmentados, especialmente con ruido de fondo, solapamiento de hablantes o audio musical.
- Preprocesado obligatorio: el audio debe ser mono y estar muestreado a 16 kHz. Si no se remuestrea correctamente, la salida puede degradarse de forma severa.
- Sin puntuacion ni formato garantizados: la model card no describe normalizacion de mayusculas, signos de puntuacion o convenciones ortograficas del chatino, por lo que la revision humana del texto es imprescindible en cualquier uso productivo.
- Licencia no declarada: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion o en un producto con animo de lucro deberia aclararse antes con el autor y con los responsables del modelo base `aadel4/omniASR-CTC-1B-v2`, asi como con los terminos del dataset de ELARSpeech.
- Estado de adopcion nulo: cero descargas y cero likes en el momento de redactar esta ficha, sin evaluaciones independientes ni incidencias reportadas. Se trata de un artefacto sin validacion externa.
- Sin garantias de reproducibilidad: no se publican detalles del dataset, del procedimiento de ajuste ni de hiperparametros, por lo que no es posible reproducir el entrenamiento ni auditar la composicion de los datos.
- Riesgo etico y de soberania de datos: al tratarse de una lengua indigena con una comunidad de hablantes reducida, conviene verificar el consentimiento de los hablantes cuyas voces se usaron en el ajuste y las condiciones de uso acordadas con la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-czn
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Documentacion del proyecto ELARSpeech: referenciada en la model card, URL no disponible
- Paper o publicacion tecnica: no disponible
- Repositorio de codigo o demo: no disponible
