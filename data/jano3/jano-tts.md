# jano3/jano-tts

## Resumen

Jano-TTS es un modelo de sintesis de voz (text-to-speech) multi-hablante desarrollado por el usuario jano3 y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un sistema ligero, de apenas 24.593.097 parametros (~24,6 M) segun los pesos en safetensors, que combina un encoder de texto basado en transformer con RoPE y un decoder de Flow Matching con arquitectura UNet de estilo Matcha. Genera audio a 24 kHz mediante el vocoder externo `charactr/vocos-mel-24khz` y soporta 128 hablantes distintos identificados por un indice de 0 a 127.

El problema que aborda es el de la sintesis de voz rapida y de bajo coste computacional: al mantenerse por debajo de los 25 millones de parametros y ocupar solo 0,1 GB en el repositorio, es un candidato claro para inferencia en CPU, en dispositivos con recursos limitados o en pipelines donde el coste por peticion es un factor critico. El sampling se controla con parametros explicitos de flow matching (`n_steps` entre 8 y 16, `temperature`, `cfg_strength`), lo que permite intercambiar calidad por velocidad de forma directa.

Es relevante ahora porque la mayoria de los TTS neuronales de calidad razonable superan holgadamente los 80-100 M de parametros, y este modelo se situa en una franja de tamano inferior con soporte multi-hablante y decodificacion de pocos pasos. No obstante, conviene ser cauto: el repositorio no incluye benchmarks publicados, acumula 0 descargas y 0 likes, y no hay validacion independiente de su calidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto transformer con RoPE + decoder UNet de Flow Matching (estilo Matcha) |
| Parametros totales | 24.593.097 (~24,6 M) |
| Longitud de contexto | no disponible (no se especifica limite de tokens de entrada de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin variantes GGUF, ONNX ni int8) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`, requiere `trust_remote_code=True`) |
| Vocoder | `charactr/vocos-mel-24khz` (dependencia externa) |
| Frecuencia de muestreo | 24.000 Hz |
| Numero de hablantes | 128 (identificadores 0-127) |
| Dataset de entrenamiento | `jano3/libritts-r-128spk-vocos-mel` (derivado de LibriTTS-R) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-to-speech |
| Fecha de publicacion | 2026-09-18 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos etapas. La primera es un encoder de texto de tipo transformer con embeddings posicionales rotatorios (RoPE), que convierte la secuencia de texto en una representacion condicionante. La segunda es un decoder de Flow Matching con estructura UNet, inspirado en el diseno de Matcha-TTS, que parte de ruido gaussiano y resuelve la ecuacion diferencial ordinaria en un numero reducido de pasos (`n_steps`, tipicamente 8-16) para producir un mel-espectrograma. Finalmente, el vocoder Vocos (`charactr/vocos-mel-24khz`) transforma ese mel-espectrograma en forma de onda a 24 kHz.

El condicionamiento por hablante se realiza mediante un identificador entero (`spk_id`, de 0 a 127) y se refuerza con classifier-free guidance a traves del parametro `cfg_strength` (valor de ejemplo en la model card: 1,5). La temperatura de sampling indicada como referencia es 0,667. El entrenamiento se realizo sobre el dataset `jano3/libritts-r-128spk-vocos-mel`, una derivacion de LibriTTS-R con 128 hablantes y representaciones mel compatibles con el vocoder Vocos. No se detalla en la informacion disponible el numero total de tokens o muestras procesadas, la composicion exacta del corpus, ni si se aplicaron fases de ajuste fino con RLHF o DPO (tecnicas, por otra parte, poco habituales en TTS).

Como innovaciones destacables, la model card menciona explicitamente la combinacion de flow matching con un decoder UNet y el uso del vocoder Vocos, ademas de la ligereza del conjunto (~24,6 M de parametros). La decodificacion en 8-16 pasos es el principal mecanismo de aceleracion frente a modelos de difusion con decenas o cientos de pasos. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni variantes hibridas SSM.

## Capacidades

- Sintesis de voz a partir de texto en ingles, con salida de audio a 24 kHz.
- Generacion multi-hablante con 128 voces seleccionables mediante `spk_id` (rango 0-127).
- Control de la calidad y el coste computacional por paso: `n_steps` ajustable (8-16 pasos; se recomienda reducir en CPU).
- Control de diversidad y adherencia al texto mediante `temperature` y `cfg_strength`.
- Inferencia en CPU o GPU sin requisitos de memoria elevados, gracias al tamano reducido del modelo.
- Integracion con el ecosistema HuggingFace `transformers` mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un modelo puramente generativo de audio.
- No soporta otros idiomas distintos del ingles segun los metadatos (`language: en`).
- No incluye vision, audio de entrada (no es un modelo de clonacion de voz por referencia) ni modo de pensamiento (thinking mode).
- No se documentan capacidades de control prosodico explicito (pitch, duracion, emocion) mas alla de los parametros de sampling.

## Casos de uso

- Lectura automatica de documentacion tecnica en ingles: el modelo puede convertir articulos, manuales o notas de version en audio, y su tamano de 24,6 M de parametros permite ejecutarlo en el mismo servidor que sirve la documentacion sin competir por VRAM con otros servicios.
- Sistemas de respuesta interactiva de voz (IVR) con varias voces: los 128 identificadores de hablante permiten asignar una voz distinta a cada departamento o marca sin desplegar varios modelos, simplificando la infraestructura.
- Generacion de voice-over para prototipos y demos: al ser Apache 2.0 y generar a 24 kHz, es adecuado para producir narraciones temporales en fase de diseno de producto, sustituyendo locuciones manuales en iteraciones rapidas.
- Asistentes de voz embebidos en dispositivos con recursos limitados: con un repo de 0,1 GB y decodificacion en 8 pasos, es viable en CPU o en GPUs de gama baja, incluidos escenarios de edge computing donde no cabe un TTS de cientos de millones de parametros.
- Aumentacion de datos para entrenamiento de ASR: se pueden generar transcripciones sinteticas con 128 timbres distintos para ampliar la variabilidad de hablante en corpus de reconocimiento de voz en ingles, siempre etiquetando el audio como sintetico.
- Pruebas de regresion en pipelines de audio: su peso reducido permite ejecutarlo en CI/CD para verificar que un cambio en el preprocesado de texto o en el postprocesado de audio no rompe la salida, con un coste de tiempo y memoria asumible por job.
- Investigacion en flow matching aplicado a voz: sirve como punto de partida reproducible para experimentos de destilacion de pasos, ajuste fino en dominios concretos o comparacion de vocoders, dado que la arquitectura y el dataset estan declarados en la model card.
- Accesibilidad y lectura de pantalla para contenido en ingles: el coste por palabra generada es bajo y el modelo puede ejecutarse localmente, lo que evita enviar texto del usuario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, similitud de hablante) ni comparaciones cuantitativas con otros sistemas TTS. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB para los pesos del modelo. En fp32 los 24,6 M de parametros ocupan aproximadamente 98 MB; en fp16, unos 49 MB. A esta cifra hay que sumar el vocoder Vocos y las activaciones intermedias, cuyo consumo no se detalla en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). No se aprovechan caracteristicas propias de GPUs de centro de datos por el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en graficas integradas. Tambien es ejecutable en CPU, opcion que la propia model card contempla al recomendar reducir `n_steps` en ese caso.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModel` con `trust_remote_code=True`) y el paquete `vocos`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en general no estan orientados a modelos TTS de este tipo. Tampoco se publican exportaciones a ONNX, TensorRT o formatos GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tiempo por frase ni de audio generado por segundo. El unico dato orientativo es el rango de 8 a 16 pasos de flow matching, que situa el coste de decodificacion muy por debajo del de los modelos de difusion de decenas o cientos de pasos.
- Paralelismo y batching: no disponible. No se documenta el comportamiento con lotes grandes ni la conveniencia de tensor parallelism (innecesario por tamano).

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de informacion publica general y no han podido verificarse en la busqueda realizada; se marcan como aproximados. Las cifras de Jano-TTS si provienen de los metadatos del repositorio.

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jano-TTS | 24,6 M (dato del repo) | Ingles | Flow matching + UNet, vocoder Vocos | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| Kokoro-82M (aproximado) | ~82 M | Ingles y variantes | Derivado de StyleTTS2 | Apache 2.0 | HuggingFace/ONNX, ampliamente desplegado |
| Piper (aproximado) | Variable segun voz | Multiples idiomas | VITS | MIT | Repositorio propio, orientado a CPU/edge |
| XTTS-v2 de Coqui (aproximado) | ~467 M | Multilingue | Autorregresivo tipo GPT | CPML (uso comercial restringido) | Repositorio de Coqui |
| Matcha-TTS (aproximado) | ~18 M | Ingles | Flow matching + UNet | MIT | Repositorio academico |

Consideraciones de la comparativa: Jano-TTS es, junto con Matcha-TTS, el mas ligero de la lista, y su licencia Apache 2.0 es mas permisiva para uso comercial que la CPML de XTTS-v2. Frente a Piper y Kokoro-82M, la diferencia principal es la madurez: esos modelos cuentan con ecosistemas de despliegue establecidos, exportaciones a ONNX y comunidades activas, mientras que Jano-TTS no registra descargas ni validacion externa. Los datos de benchmarks necesarios para comparar calidad de audio (MOS, WER) no estan disponibles para Jano-TTS.

## Limitaciones y advertencias

- Cobertura idiomatica limitada al ingles: no hay soporte multilingue declarado, por lo que el texto en otros idiomas producira una pronunciacion incorrecta o artefactos.
- Sesgo de dominio: el entrenamiento se basa en LibriTTS-R, un corpus de audiolibros en ingles; cabe esperar un mejor comportamiento en registro de lectura y un rendimiento inferior con habla espontanea, jerga tecnica, siglas o expresiones coloquiales.
- Sesgo de hablante: las 128 voces proceden de un unico corpus y no se documenta su distribucion por genero, acento o edad, por lo que no puede garantizarse representatividad ni equidad entre voces.
- Riesgo de alucinacion de audio: como cualquier TTS neuronal, puede omitir, repetir o deformar palabras, especialmente con numeros, abreviaturas, nombres propios y texto fuera de dominio. Se recomienda validacion automatica mediante ASR en produccion.
- Ejecucion de codigo remoto: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python alojado en el repositorio del autor. Es un riesgo de seguridad que debe evaluarse antes de usarlo en entornos de produccion.
- Dependencia externa del vocoder: la generacion de audio depende de `charactr/vocos-mel-24khz`, cuyos terminos de licencia son independientes de la licencia Apache 2.0 del modelo y deben revisarse por separado.
- Licencia del dataset: LibriTTS-R dispone de su propia licencia, que conviene comprobar antes de un uso comercial del modelo derivado.
- Ausencia de benchmarks: no hay metricas objetivas publicadas, lo que impide estimar la calidad frente a alternativas consolidadas antes de integrarlo.
- Falta de validacion de la comunidad: el repositorio muestra 0 descargas y 0 likes, sin issues ni discusion publica que permitan contrastar su funcionamiento real.
- Ausencia de formatos optimizados: no se publican cuantizaciones, exportaciones ONNX ni versiones GGUF, lo que limita las opciones de despliegue a PyTorch.
- Metadatos atipicos: las fechas de creacion y actualizacion del repositorio (2026-09-18) son posteriores a la fecha actual de redaccion de esta ficha, lo que sugiere un posible error en los metadatos y obliga a verificar la vigencia del contenido.
- Sin control prosodico documentado: no hay parametros para pitch, duracion o emocion, lo que limita la expresividad en aplicaciones de locucion profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jano3/jano-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/jano3/libritts-r-128spk-vocos-mel
- Vocoder utilizado: https://huggingface.co/charactr/vocos-mel-24khz
- Repositorio de Vocos: https://github.com/gemelo-ai/vocos
- Referencia de la arquitectura Matcha-TTS (paper): https://arxiv.org/abs/2309.03199
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion tecnica sobre el modelo; no se han incluido por no ser relevantes.
