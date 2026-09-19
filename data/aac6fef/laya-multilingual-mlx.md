# aac6fef/laya-multilingual-mlx

## Resumen

laya-multilingual-mlx es una conversion nativa a MLX en FP16 del checkpoint convaiinnovations/laya-multilingual, publicada por el usuario aac6fef para ejecucion en Apple silicon. No es un modelo de lenguaje generativo: es un encoder bidireccional de decision construido sobre mmBERT-base, con 321.908.998 parametros (~322 M) y una ventana de contexto total de 1024 tokens compartida entre el estado de entrada, las preguntas y las opciones de respuesta. Su salida no es texto libre, sino decisiones tipadas: preguntas de eleccion entre criterios (`choice`), puntuaciones ordinales (`score`) y preguntas booleanas (`noul`).

El problema que resuelve es el de la toma de decisiones estructurada dentro de flujos de agentes: en lugar de pedir a un modelo generativo que devuelva una clasificacion en texto parseable, Laya evalua criterios definidos por el desarrollador y devuelve una distribucion de probabilidad calibrada sobre cada opcion. Esto encaja en enrutado de tickets, triaje, verificacion de condiciones y evaluacion de politicas, donde la salida debe ser determinista y facil de consumir por codigo.

Su relevancia ahora es de nicho pero clara: permite ejecutar ese cabezal de decision integramente en MLX sobre macOS, sin dependencias de PyTorch ni de Transformers en tiempo de ejecucion, lo que simplifica el despliegue local en equipos Apple. La contrapartida es que la calidad, la calibracion y las limitaciones de idioma y tarea son las del checkpoint original, ya que la conversion no reentrena ni cuantiza a menos bits, solo adapta nombres de parametros y conserva los pesos FP16. El apunte de la model card que indica que el checkpoint multilingue es la opcion prevista para texto no ingles resulta ambiguo en el repositorio, que ya se presenta como multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-base (encoder bidireccional tipo ModernBERT) con cabezal de decision de Laya: scoring head y action head |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens en total, compartidos entre estado de entrada, preguntas y opciones |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en FP16 sin cuantizar y la runtime admite `dtype="float32"` |
| Idiomas soportados | multilingue segun las etiquetas del repositorio; no se publica lista concreta de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en FP16, libreria MLX |
| Modelo base | convaiinnovations/laya-multilingual, commit 052592a15d198d9ad47da779604259b10b47b7aa |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone mmBERT-base, variante de ModernBERT, con los cabezales de decision propios de Laya. Se trata de un encoder bidireccional que recibe un estado de entrada junto con una serie de preguntas tipadas y sus criterios, y produce una distribucion de decision por pregunta. La conversion a MLX renombra los parametros para adaptarlos a ese framework y conserva los pesos originales en FP16; no hay reentrenamiento, ajuste fino adicional ni reduccion de precision a formatos de menos bits. El autor verifica que cada tensor exportado es exactamente igual al tensor de origen convertido a FP16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para este checkpoint, ya que la model card del port no los detalla y la busqueda web no aporto documentacion tecnica relevante. Tampoco se incluye en el repositorio la implementacion de entrenamiento, solo la de inferencia. Lo que si se documenta es el esfuerzo de fidelidad de la porta: en 16 casos de prueba, el argmax de las distribuciones de decision en FP16 coincide con el de PyTorch MPS en FP32 en 63 de 63 distribuciones, con una diferencia maxima de probabilidad calibrada de 0,0012887. Ademas, 100 llamadas repetidas produjeron salidas publicas finitas y deterministas, y el crecimiento de memoria activa de MLX tras limpiar caches fue de 0 bytes. Estas comprobaciones acreditan fidelidad de la porta, no la correccion de las respuestas del modelo.

## Capacidades

- Clasificacion por eleccion (`choice`) entre un conjunto de criterios definidos por el desarrollador, por ejemplo departamentos de atencion.
- Puntuacion ordinal (`score`) para respuestas graduadas como prioridad o severidad.
- Respuestas booleanas (`noul`) para condiciones del tipo si o no, por ejemplo si el cliente pide dinero de vuelta.
- Evaluacion simultanea de multiples preguntas tipadas en una sola llamada, con esquema de salida estructurado y estable.
- Procesamiento multilingue segun las etiquetas del repositorio, sin lista explicita de idiomas publicada.
- Ejecucion integra en MLX sobre Apple silicon, sin requerir PyTorch ni Transformers en tiempo de ejecucion.
- Salidas deterministas y calibradas, aptas para ser consumidas por codigo sin parseo de texto libre.
- No incluye generacion de texto, razonamiento multi-paso autonomo, tool calling ni capacidades de vision o audio.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia y una pregunta `choice` con los departamentos posibles (facturacion, tecnico, ventas) y devuelve la opcion mas probable, tal como muestra el ejemplo oficial de la model card.
- Deteccion de intencion de reembolso: con una pregunta booleana `noul` del tipo "el cliente pide que se le devuelva el dinero", se puede activar o no un flujo de devolucion dentro del CRM.
- Triaje multilingue en helpdesk: al tratarse de un checkpoint multilingue, permite clasificar incidencias redactadas en distintos idiomas sin desplegar un modelo distinto por lengua.
- Priorizacion por severidad: usando preguntas ordinales `score` se puede asignar un nivel de urgencia y ordenar la cola de atencion con un criterio numerico calibrado.
- Puerta de validacion en agentes LLM: antes de que un agente generativo ejecute una accion, Laya comprueba condiciones booleanas sobre el contexto y actua como filtro determinista.
- Moderacion y cumplimiento de politicas: definiendo criterios de aceptacion, el modelo evalua si un contenido o una solicitud cumple cada regla y devuelve una decision por regla.
- Analitica de encuestas y feedback: clasificacion de comentarios abiertos en categorias y escalas ordinales (satisfaccion, esfuerzo, intencion de recompra).
- Extraccion de decisiones en pipelines de datos: procesamiento por lotes de formularios o correos para poblar campos categoricos y booleanos de una base de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, XNLI u otros) en la informacion disponible. La unica evidencia numerica publicada corresponde a la validacion de fidelidad de la conversion a MLX, que se recoge a continuacion.

| Prueba de validacion | Resultado |
|---|---|
| Coincidencia de argmax frente a PyTorch MPS FP32 | 63/63 distribuciones de decision en 16 casos |
| Diferencia maxima de probabilidad calibrada | 0,0012887 |
| Estabilidad en 100 llamadas repetidas | salidas finitas y deterministas |
| Crecimiento de memoria activa de MLX tras limpiar caches | 0 bytes |
| Igualdad de tensores exportados frente al origen en FP16 | verificada tensor a tensor |
| Entorno de validacion | Apple M3 Max, GPU de 40 nucleos, 128 GB de memoria unificada, macOS 27.2, Python 3.12.13, MLX 0.32.2 |

El repositorio incluye un `validation.json` con mediciones numericas y de estabilidad para aritmetica FP32 y FP16, y el autor remite a un informe completo de rendimiento y muestras de tiempos en `BENCHMARKS.md`. Los valores concretos de latencia y throughput no se detallan en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 0,7 GB, coherente con ~322 M de parametros en FP16 (unos 0,64 GB de pesos) mas tokenizer, configuracion y ficheros de validacion.
- Memoria: en FP16 la inferencia requiere del orden de 0,7 GB de memoria; con `dtype="float32"` sube a aproximadamente 1,3 GB de pesos, mas el estado de activaciones.
- Plataforma: exclusivamente Apple silicon con MLX. No hay soporte CUDA ni ROCm documentado; el modelo no es ejecutable en GPU NVIDIA o AMD con la runtime que se distribuye.
- GPU recomendadas: cualquier equipo Apple silicon con GPU integrada; la validacion se realizo en un M3 Max de 40 nucleos. No se publican cifras para otros modelos de chip.
- Cabe en GPU de consumo: si, en cualquier Mac Apple silicon moderna con memoria unificada suficiente (8 GB o mas es holgado para este tamano).
- Sistema y software: macOS 26 o superior y Python 3.11 o superior, con la runtime `laya-mlx` instalada desde el repositorio Git del autor.
- Opciones de despliegue: la runtime especifica `laya_mlx` es la unica via documentada. Al ser una arquitectura personalizada y no generativa, no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada; el autor publica medidas comparativas frente a la runtime original en `BENCHMARKS.md`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del checkpoint original ni de alternativas, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Formato principal | Runtime | Licencia |
|---|---|---|---|---|---|
| aac6fef/laya-multilingual-mlx | ~322 M | 1024 tokens | safetensors FP16 (MLX) | laya-mlx, solo Apple silicon | Apache-2.0 |
| convaiinnovations/laya-multilingual | ~322 M (mismo checkpoint de origen) | 1024 tokens | pesos originales en PyTorch | PyTorch / Transformers | Apache-2.0 |
| Checkpoint de decisiones tipadas de Laya | no disponible | 1024 tokens | no disponible | no disponible | Apache-2.0 |
| Encoders de clasificacion multilingue comparables (por ejemplo variantes de mBERT o XLM-R) | no disponible en la informacion proporcionada | no disponible | safetensors, GGUF segun distribucion | vLLM, TGI, llama.cpp, ONNX | variable segun modelo |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no hace razonamiento multi-paso y no soporta tool calling ni agentes por si mismo.
- El presupuesto de contexto es de 1024 tokens en total, compartido entre el estado de entrada, el enunciado de cada pregunta y sus opciones; entradas largas o muchas preguntas reducen el margen disponible.
- La conversion no reentrena ni ajusta el modelo, de modo que hereda integramente los sesgos, errores de calibracion y limitaciones de idioma y tarea del checkpoint original, que no se documentan en la informacion disponible.
- El proceso de validacion acredita fidelidad numerica de la porta, no la correccion de las respuestas del modelo; los errores del modelo de origen se conservan.
- Existe una diferencia residual de calibracion frente a la aritmetica FP32 del orden de 0,0012887 en el peor caso medido.
- No se publica la lista concreta de idiomas soportados pese a la etiqueta multilingue, por lo que conviene validar el rendimiento en la lengua objetivo antes de ponerlo en produccion.
- La model card incluye una nota que describe el checkpoint de decisiones tipadas como especializado en los flujos del autor y senala el multilingue como la opcion prevista para texto no ingles; dado que el repositorio ya se presenta como multilingue, conviene contrastar esa indicacion con el comportamiento real.
- Dependencia de plataforma: requiere Apple silicon, macOS 26 o superior y la runtime `laya-mlx`; no hay ruta de despliegue en Linux con GPU NVIDIA o AMD.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar la atribucion y los ficheros `LICENSE` y `NOTICE`, que referencian a Convai Innovations y a los contribuidores del proyecto original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validacion de terceros independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/laya-multilingual-mlx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Codigo de origen de Laya (upstream): https://github.com/NandhaKishorM/laya, commit 6a5819129eb220570792e417e49723d697efd76f
- Runtime de inferencia MLX: https://github.com/mizorewww/laya-mlx
- Informe de rendimiento y muestras de tiempos: https://github.com/mizorewww/laya-mlx/blob/main/BENCHMARKS.md
- Instalacion de la runtime: `python -m pip install 'git+https://github.com/mizorewww/laya-mlx.git'`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian al Dia de la Independencia de Estados Unidos y no guardan relacion con la ficha.
