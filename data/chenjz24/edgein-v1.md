# chenjz24/EdgeIn-v1

# EdgeIn-v1 (EdgeInstant-1.5b S5)

## Resumen

EdgeIn-v1 es el paquete publicado en HuggingFace del modelo EdgeInstant-1.5b S5, un modelo multimodal de audio a texto desarrollado por el usuario chenjz24. Se trata de un modelo de instrucciones bilingue (chino e ingles) que acepta audio como entrada y produce texto, cubriendo transcripcion automatica del habla (ASR), traduccion de voz bidireccional, respuesta a preguntas sobre audio, comprension de sonido y musica, y ejecucion de instrucciones dictadas por voz. El repositorio incluye pesos, procesador y codigo propio, con un total de 2.031.710.851 parametros segun los ficheros safetensors (~2,03 mil millones), un tamano de repositorio de 4,1 GB y una ventana de contexto que no se especifica en la informacion disponible.

El modelo se presenta como una continuacion del modelo S4: sobre esa base se aplicaron 600 pasos de entrenamiento de control de respuesta y despues 1.600 pasos de post-entrenamiento mixto en ocho GPU, con un manifiesto de 531.174 filas que combina ASR chino-ingles, traduccion de voz en ambos sentidos, instrucciones de texto de multiples fuentes, extraccion de comandos de voz reales, preguntas y respuestas con contexto de voz, comprension de sonido y musica, y datos de respuesta directa y de modo "thinking". Los pesos entregados corresponden al paso 1.600 y el modelo conserva dos modos de salida (directo y razonamiento explicito) que se seleccionan en el procesador mediante `enable_thinking`.

Es relevante ahora porque aborda un caso poco cubierto por los modelos abiertos: entrada de audio sin truncado a 30 segundos combinada con seguimiento de instrucciones y extraccion de comandos estructurados, con una version de inferencia optimizada (CUDA Graph en las capas de decodificacion con atencion lineal) que mantiene exactamente los mismos tokens generados que el checkpoint original. Su licencia y sus datos de contexto ampliado no estan publicados, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; modelo multimodal de audio con encoder de audio, proyector de audio, decoder de lenguaje con capas de linear attention y componentes Qwen, mas un componente codec/Talker |
| Parametros totales | 2.031.710.851 (~2,03 mil millones) segun safetensors |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; la entrada de audio no aplica truncado a 30 segundos |
| Tipos de cuantizacion | no disponible; los pesos entregados son BF16 con proyector de audio y parametros de tokens especiales en FP32 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | no disponible; los componentes Qwen y los datos de entrenamiento conservan sus licencias originales y el codigo del decoder se rige por `LICENSE.codec` |
| Formato de pesos | safetensors |
| Identificador en HuggingFace | chenjz24/EdgeIn-v1 |
| Autor | chenjz24 |
| Tarea (pipeline) | audio-text-to-text |
| Tamano del repositorio | 4,1 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura completa, pero si permite reconstruir sus piezas principales: un encoder de audio, un proyector de audio que alinea las representaciones acusticas con el espacio del lenguaje, un decoder de lenguaje con capas de atencion lineal y un componente codec asociado a un modulo Talker (orientado a voz, no entrenado en esta ronda). La model card menciona que el modelo contiene componentes Qwen, cuyas licencias originales siguen aplicandose. En la version de inferencia simplificada se conservan todas las capacidades multimodales, se usan pesos BF16, el proyector de audio y los parametros de tokens especiales quedan en FP32, y se elimina la proyeccion de entrada no usada del codec; ademas, la decodificacion de un token en CUDA activa automaticamente CUDA Graph para las capas del decoder con linear attention.

El entrenamiento parte del modelo final S4. Primero se ejecutan 600 pasos de control de respuesta con los mismos datos y despues 1.600 pasos de post-entrenamiento mixto en ocho GPU. Participan en el entrenamiento principal todos los parametros del modelo de lenguaje, la capa de proyeccion de audio y las dos ultimas capas del encoder de audio, con tasas de aprendizaje maximas de 1e-6, 2e-7 y 1e-7 respectivamente. El manifiesto de entrenamiento tiene 531.174 filas e incluye ASR chino-ingles, traduccion de voz bidireccional, instrucciones de texto de multiples fuentes, extraccion de comandos de voz reales, preguntas y respuestas con contexto de voz, comprension de sonido y musica, y datos de respuesta directa y de razonamiento (el modo thinking representa el 3,76% de la supervision positiva). Para mejorar la terminacion de la respuesta y reducir salidas repetitivas se usan un peso de EOS de 4 y un peso de unlikelihood de 0,2 sobre muestras negativas repetidas. La inferencia recomendada es greedy. El checkpoint entregado se selecciono por estabilidad de generacion, exactitud y rendimiento en ASR y traduccion sobre conjuntos de desarrollo independientes, y los ejemplos de test se usaron solo para evaluacion.

## Capacidades

- Reconocimiento automatico del habla en chino e ingles (`task="asr"`), con salida de solo transcripcion cuando se indica en la peticion.
- Traduccion de voz bidireccional chino-ingles a partir de audio de entrada.
- Respuesta a preguntas sobre audio (`task="qa"`), incluyendo preguntas y respuestas con contexto de voz y comprension de sonido y musica.
- Ejecucion de instrucciones dictadas por voz: el audio puede contener una orden que el modelo interpreta y ejecuta, no solo transcribe.
- Extraccion de comandos de voz reales en formato estructurado, medida sobre un esquema de campos tipo FSC (dataset de comandos).
- Dos modos de salida conmutables con `enable_thinking`: modo directo y modo de razonamiento explicito.
- Entrada de audio a 16 kHz mono, conservando la onda completa sin truncado a 30 segundos.
- Entrada de texto adicional mediante `processor(text=...)`, para peticiones escritas o mixtas.
- Capacidades multimodales de voz completas en el paquete entregado (el componente Talker y la sintesis de voz reutilizan los pesos del modelo de partida y no se reentrenaron en esta ronda).
- Compatibilidad con `trust_remote_code=True`, lo que implica que el repositorio aporta codigo propio de modelo y procesador.

## Casos de uso

- Transcripcion de audio a texto en produccion: el modelo acepta audio mono a 16 kHz y no trunca la onda a 30 segundos, de modo que se puede usar para transcribir intervenciones largas o ficheros completos en chino o ingles sin segmentacion manual previa.
- Traduccion de voz bidireccional chino-ingles: util en atencion al cliente internacional o en reuniones mixtas, donde se alimenta el audio original y se solicita la traduccion mediante `task="qa"` con una peticion de traduccion explicita.
- Extraccion de comandos de voz a JSON estructurado: en un dataset de comandos de habla real con hablantes no vistos, el modelo alcanza un 93,49% de objetos JSON completamente correctos y un 96,79% de exactitud por campo, lo que lo hace apto para sistemas de control por voz que necesitan campos estructurados en lugar de texto libre.
- Asistentes de voz que ejecutan instrucciones: con la peticion "escucha y completa la solicitud del audio", el modelo interpreta la orden contenida en la senal acustica y responde a ella, habilitando agentes de voz de un solo turno sin pipeline ASR mas LLM separado.
- Analisis de reuniones y clases: las capacidades de preguntas y respuestas con contexto de voz permiten recuperar informacion concreta de una grabacion (decisiones, cifras mencionadas, tareas asignadas) formulando la pregunta por texto junto al audio.
- Comprension de sonido y musica: el manifiesto de entrenamiento incluye datos de entendimiento de sonido y musica, lo que permite clasificar o describir eventos acusticos y contenido musical como parte de tareas de etiquetado o indexacion.
- Accesibilidad y subtitulado: generacion de subtitulos y traducciones para contenido audiovisual en chino e ingles, aprovechando que la traduccion de voz es una tarea nativa y no un encadenamiento de ASR y traduccion de texto.
- Moderacion y auditoria de audio: transcripcion mas extraccion de informacion estructurada sobre grandes volumenes de audio, apoyandose en el modo directo (`enable_thinking=False`) para respuestas cortas y deterministas con decodificacion greedy.

## Benchmarks y rendimiento

Los datos publicados en la model card son limitados y se refieren a evaluaciones internas del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de audio estandar en la informacion disponible.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Extraccion de comandos de voz (FSC), objeto JSON completamente correcto | 93,49% | 3.118 muestras por vista de salida, conjunto de validacion con hablantes no vistos |
| Extraccion de comandos de voz (FSC), exactitud por campo | 96,79% | Mismo conjunto y mismas condiciones |
| MMAU (1.000 elementos) | 64,9% | Comparacion entre el checkpoint original cargado con `dtype="auto"` y la version de inferencia optimizada: los tokens generados son identicos y la exactitud coincide |
| 27 pruebas con protocolo completo frente a S4 | no disponible (referenciado en `final_results.md`) | El autor indica que existe la comparativa, sin cifras en la model card |
| CER/WER de ASR, BLEU de traduccion | no disponible | Las tablas de resultados usan CER/WER y exactitud en porcentaje y BLEU en su unidad original |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 2,03 mil millones de parametros y el repositorio de 4,1 GB, los pesos en BF16 ocupan aproximadamente 4,1 GB; sumando proyector de audio en FP32, cache KV y activaciones, una estimacion razonable es de 6 a 10 GB de VRAM segun la longitud del audio y de la salida. Es una estimacion propia, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 12 GB de memoria para una sola instancia (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L4, A10G); para servicio concurrente o mayor volumen de audio, A100, H100 o L40S.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas en BF16, y con mas holgura si se aplica cuantizacion (no publicada por el autor).
- Opciones de despliegue: transformers con `trust_remote_code=True` (via de uso documentada, con `AutoModel` y `AutoProcessor`), `torch.inference_mode()` y decodificacion greedy. La model card describe la activacion automatica de CUDA Graph en las capas con linear attention durante la decodificacion de un token en CUDA, y permite desactivar la atencion SDP de cuDNN con `torch.backends.cuda.enable_cudnn_sdp(False)`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, ni se publican pesos en formato GGUF.
- Latencia y throughput: el autor remite a `INFERENCE_OPTIMIZATION.md` para TTFT y throughput, pero las cifras concretas no estan disponibles en la informacion proporcionada.
- Compatibilidad de precision: la carga recomendada por el autor es `dtype=torch.bfloat16`; cargar con `dtype="auto"` produce exactamente la misma generacion en la prueba MMAU descrita.

## Comparativa con modelos similares

Los valores de esta tabla proceden de referencias publicas generales y no se han podido verificar con las busquedas web realizadas en esta ficha, que no devolvieron resultados tecnicos relevantes. Se incluyen solo como orientacion de categoria.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeIn-v1 (EdgeInstant-1.5b S5) | 2,03 mil millones | sin truncado a 30 s (longitud de contexto no disponible) | zh, en | no disponible | HuggingFace, codigo propio, 0 descargas |
| Qwen2-Audio-7B-Instruct | ~8,2 mil millones | segmentos de audio (referencia publica) | multilingue | Apache-2.0 (referencia publica) | HuggingFace, ampliamente desplegado |
| Whisper large-v3 | ~1,55 mil millones | ventanas de 30 s | ~99 idiomas | MIT | HuggingFace, ecosistema amplio (whisper.cpp, faster-whisper) |
| Qwen2.5-Omni-7B | ~7 mil millones | audio, imagen, video y texto | multilingue | Apache-2.0 (referencia publica) | HuggingFace |

Diferencias destacables: EdgeIn-v1 es el unico de la comparativa que combina entrada de audio sin truncado a 30 segundos con modos directo y de razonamiento conmutables y salida estructurada de comandos de voz medida explicitamente. En contra, su licencia no esta publicada, no tiene apenas traccion (0 descargas, 0 likes) y no ofrece pesos cuantizados ni integraciones con motores de inferencia de alto rendimiento.

## Limitaciones y advertencias

- Razonamiento abierto y complejo sobre voz: el propio autor reconoce carencias en tareas de razonamiento hablado de complejidad abierta.
- Calculo con numeros dictados: el modelo presenta deficiencias en aritmetica sobre cifras pronunciadas; el unico conjunto de desarrollo en chino para calculo con numeros hablados contiene una sola muestra, por lo que no puede estimarse la capacidad real en esa tarea.
- Traduccion de voz chino a ingles: es el sentido de traduccion con peor comportamiento segun la model card.
- Cierre de respuestas: que la salida termine correctamente y respete el formato no garantiza que el contenido sea correcto.
- Modo thinking: activar `enable_thinking=True` no garantiza mayor exactitud que el modo directo.
- Audio de baja calidad: en grabaciones con volumen muy bajo o informacion insuficiente el modelo puede generar transcripciones sin respaldo acustico.
- Riesgo de alucinacion: inherente a un modelo generativo de ~2 mil millones de parametros; en ASR se manifiesta como transcripciones plausibles no presentes en el audio, y en extraccion de comandos como campos rellenados aunque la orden no se haya pronunciado.
- Cobertura idiomatica limitada: solo chino e ingles; no hay soporte documentado de otras lenguas, y no hay datos sobre variantes dialectales.
- Longitud de contexto: no publicada, lo que impide planificar despliegues que dependan de un limite conocido de tokens de entrada combinados.
- Licencia: no disponible. El uso comercial no puede asumirse sin aclarar los terminos, y la model card advierte que los componentes Qwen y los datos de entrenamiento conservan sus licencias originales y que el codigo del decoder se rige por `LICENSE.codec`.
- Componentes no reentrenados: el modulo Talker y la sintesis de voz reutilizan los pesos del modelo de partida, por lo que su comportamiento no esta validado por esta ronda de entrenamiento, que cubre audio de entrada y respuestas de texto.
- Codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo publicado por el autor.
- Reproducibilidad: el ejemplo de la model card apunta a una ruta local (`/default-filesys/workspace/...`) en lugar de al identificador del repositorio, y los ficheros de resultados se referencian con rutas relativas al directorio padre, de modo que la estructura exacta del repositorio no queda clara a partir de la informacion disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin publicacion academica ni evaluacion por terceros.
- Metricas de evaluacion: parte de las anotaciones de referencia en las tareas de preguntas y respuestas con contexto publico proceden de anotacion generada por modelos, segun la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenjz24/EdgeIn-v1
- Resultados y limitaciones conocidas: `RESULTS.md` (referenciado como `../RESULTS.md` en la model card)
- 27 pruebas con protocolo completo y comparativa con S4: `final_results.md` (referenciado como `../final_results.md`)
- Comparativa sobre conjunto de desarrollo fijo: `dev_comparison.md` (referenciado como `../dev_comparison.md`)
- Configuracion completa de entrenamiento: `configs/train/bilingual_s5.yaml` (dentro del repositorio)
- Descripcion de metodo y datos: `docs/BILINGUAL_S5.md` (dentro del repositorio)
- Optimizacion de inferencia (parametros, tamano de pesos, TTFT, throughput y comandos de reproduccion): `INFERENCE_OPTIMIZATION.md` (dentro del repositorio)
- Licencia del codigo del decoder: `LICENSE.codec` (dentro del repositorio)
- Dependencias de ejecucion: `requirements.txt` (dentro del repositorio)
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes; las busquedas devolvieron unicamente paginas del servicio de intercambio de criptomonedas Gemini (gemini.com y subdominios), sin relacion con el modelo.
