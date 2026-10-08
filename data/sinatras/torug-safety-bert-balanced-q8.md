# sinatras/torug-safety-bert-balanced-q8

## Resumen

Torug Turkish safety classifier — balanced BERT q8 es un clasificador de texto en turco disenado para etiquetar prompts como seguros, de advertencia o bloqueados. Lo publica el usuario sinatras dentro del ecosistema Torug, concretamente como el checkpoint `model_balanced` seleccionado por Başak para la release candidate Torug 1.1. Se trata de un artefacto derivado y separado del modelo de septiembre `sinatras/torug-safety-bert-q8`, que permanece sin cambios.

Tecnicamente es un BERT de 12 capas con hidden size 768 y tres etiquetas de salida, exportado a ONNX (opset 17) con cuantizacion QUInt8 dinamica por canal y pensado para ejecutarse localmente mediante transformers.js. Su ventana de secuencia es de 512 tokens y solo cubre turco. El repositorio pesa 0,1 GB y los ficheros de inferencia completos rondan los 113 MB, lo que lo situa en la categoria de modelos de borde y navegador.

Su relevancia es acotada pero especifica: es una senal de entrada para un filtro de seguridad en aplicaciones turcas que necesitan clasificacion local sin servicio de inferencia alojado. No es un modelo generativo, no puntua la seguridad de respuestas y no incluye enrutado de crisis. La model card advierte que faltan datos de entrenamiento, codigo, particiones y licencia permisiva, por lo que la reutilizacion y el despliegue en produccion requieren precaucion juridica y tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT de 12 capas, hidden size 768, 3 etiquetas de salida |
| Parametros totales | no disponible de forma oficial; el fichero de pesos cuantizado ocupa 111.846.943 bytes (aprox. 111,8 M de parametros si se asume 1 byte por peso en QUInt8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | QUInt8 dinamico por canal (cargar con `dtype: "q8"`); existe tambien una exportacion FP32 ONNX usada en la validacion |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (el autor no suministra licencia de reutilizacion permisiva) |
| Formato de pesos | ONNX opset 17 con ejes de lote y secuencia dinamicos; safetensors como origen |
| Etiquetas de salida | LABEL_0 = safe, LABEL_1 = warn, LABEL_2 = block |
| Tamano del repositorio | 0,1 GB (ficheros de inferencia completos aprox. 113 MB) |
| Hash de safetensors origen | ff25e26c8ae782cac235e9dcd1551e4dfe0dae259ddf348fef9a8c447dce35ae |
| Hash de pesos | 5609f42b1dccef09dcf4dd6365d87f38ffabff2c407dfcea950190f9c31f09cf |

## Arquitectura y entrenamiento

La arquitectura es un transformer BERT estandar de 12 capas con hidden size 768, configurado para clasificacion de secuencias con tres clases de salida. La exportacion a ONNX emplea opset 17 con ejes dinamicos de lote y secuencia, y cuantizacion QUInt8 dinamica por canal, siguiendo la convencion del release anterior (`sinatras/torug-safety-bert-q8`). El autor indica que el checkpoint balanceado proviene del trabajo de Başak y que los pesos fuente se suministraron como safetensors con un SHA-256 verificable.

No se proporcionan datos sobre el entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si hubo RLHF, DPO u otro tipo de ajuste. Tampoco se entregan el codigo de entrenamiento, las particiones train/validation/test ni el manifest de split. Por tanto, no es posible reproducir el entrenamiento ni verificar la ausencia de contaminacion entre los datos de diagnostico y los de entrenamiento. La unica innovacion tecnica documentada es la exportacion y cuantizacion del clasificador para inferencia local, no un cambio arquitectonico respecto a BERT base.

## Capacidades

- Clasificacion de texto en turco en tres categorias: seguro (LABEL_0), advertencia (LABEL_1) y bloqueo (LABEL_2).
- Clasificacion de prompts de entrada como senal de seguridad, no de respuestas generadas.
- Inferencia local sin servicio alojado: los prompts se procesan en el propio entorno.
- Ejecucion en navegador y en WebAssembly mediante transformers.js, ademas de ONNX de escritorio.
- Procesamiento por lotes y secuencias de longitud variable gracias a los ejes dinamicos de ONNX.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No evalua historial de conversacion.
- No ofrece enrutado de crisis ni soporte de emergencia.
- No genera probabilidades calibradas ni etiquetas de politica oficiales a partir del mapeo de etiquetas.

## Casos de uso

- Filtrado de prompts en aplicaciones de chat en turco: el modelo clasifica la entrada del usuario antes de pasarla al modelo generativo, permitiendo descartar o marcar peticiones peligrosas con una latencia minima al ejecutarse localmente.
- Moderacion previa en asistentes conversacionales: al emitir tres niveles (safe, warn, block), permite politicas diferenciadas donde las advertencias no detienen la generacion pero el bloqueo si lo hace, segun las reglas y umbrales que anada el sistema Torug.
- Proteccion de contenido en portales y foros turcos: clasificacion de comentarios o mensajes enviados por usuarios como capa adicional junto a reglas de la aplicacion.
- Filtro en el navegador o en el borde: al exportarse a ONNX y funcionar con transformers.js, puede integrarse en una extension o en un worker de navegador que procesa el texto del usuario sin enviarlo a un servidor.
- Preprocesado en pipelines de moderacion existentes: se usa como senal de entrada combinada con reglas, umbrales y gestion de consentimiento ya presentes en Torug.
- Etiquetado asistido para revision humana: el nivel de advertencia puede dirigir casos borderline a una cola de revision manual sin bloquear automaticamente.
- Validacion de entradas en formularios o APIs turcas: deteccion de peticiones potencialmente daninas antes de que lleguen a sistemas posteriores.
- Investigacion y evaluacion de clasificadores de seguridad en turco: util como punto de comparacion diagnostico frente al modelo de septiembre, siempre que se asuma que no hay resultados libres de contaminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K, TurkBench ni similares) en la informacion disponible. El autor unicamente documenta una validacion diagnostica y advierte explicitamente que no es una medida de precision sobre un conjunto de test reservado.

| Prueba | Resultado documentado |
|---|---|
| Coincidencia PyTorch vs ONNX FP32 (etiqueta superior) | Coinciden en 464 entradas de diagnostico existentes |
| Efecto de la cuantizacion | 7 etiquetas superiores cambiaron respecto a FP32 |
| Comportamiento en navegador/WASM | Probado por separado del ONNX de escritorio, incluyendo worker, reglas, umbrales y gestion de consentimiento de Torug |
| Regresiones frente al clasificador anterior | Menos falsos bloqueos en varios grupos de redaccion, pero persisten peticiones daninas no detectadas |
| Sensibilidad a texto turco en mayusculas | Documentada como limitacion; se siguen produciendo fallos |
| Precision sobre test reservado | No disponible |
| TurkBench | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los ficheros completos de inferencia ocupan aproximadamente 113 MB, por lo que cabe holgadamente en memoria de cualquier GPU de consumo e incluso en memoria compartida.
- GPU recomendadas: no requiere GPU dedicada; es viable en CPU. Una GPU de consumo (por ejemplo, cualquier RTX moderna) acelera el procesamiento por lotes, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, en todas las gamas, dado el tamano del modelo.
- Despliegue en navegador y borde: transformers.js con `dtype: "q8"`; tambien ONNX Runtime de escritorio.
- Opciones de despliegue: transformers.js, ONNX Runtime (escritorio y WASM). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador BERT de este tamano.
- Latencia y throughput: no disponibles. Al ser un BERT base cuantizado a QUInt8, la latencia esperada es de pocos milisegundos por muestra en CPU, pero el autor no publica cifras.
- Almacenamiento: repositorio de 0,1 GB; se recomienda fijar un commit del repositorio en produccion para evitar cambios inesperados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria en turco ni datos de rendimiento frente a alternativas. El unico punto de referencia documentado es el clasificador previo del mismo autor, `sinatras/torug-safety-bert-q8`, del que este release candidate se separa.

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sinatras/torug-safety-bert-balanced-q8 | BERT 12 capas, hidden 768, 3 etiquetas | 512 tokens | turco | no disponible | Release candidate actual |
| sinatras/torug-safety-bert-q8 | BERT 12 capas, hidden 768 | 512 tokens | turco | no disponible | Modelo de septiembre, sin cambios; se compara a nivel diagnostico |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos |

## Limitaciones y advertencias

- No se ha publicado licencia de reutilizacion permisiva. Hay que comprobar los derechos aplicables antes de redistribuir o reutilizar el modelo, incluido el uso comercial.
- No se suministran datos de entrenamiento, codigo de entrenamiento, particiones train/validation/test ni manifest de split, por lo que el entrenamiento no es reproducible.
- Se desconoce si existe solapamiento entre los datos de diagnostico y los de entrenamiento; no hay resultados libres de contaminacion.
- No se reclama ninguna puntuacion oficial de TurkBench.
- Las etiquetas son genericas (LABEL_0, LABEL_1, LABEL_2) y el mapeo a safe/warn/block procede de la interpretacion de Torug y de pruebas dirigidas; no debe inferirse de el una probabilidad calibrada ni una etiqueta de politica oficial.
- El clasificador es una senal de entrada, no un modelo generativo ni una puntuacion de seguridad de respuestas. Las advertencias no detienen la generacion por si mismas.
- Los resultados de diagnostico muestran tanto mejoras como regresiones frente al clasificador anterior; no puede afirmarse que mejore todas las categorias ni que garantice seguridad.
- Persisten peticiones daninas no detectadas, con sensibilidad documentada a texto turco en mayusculas.
- Las entradas largas pueden perder contenido por truncacion o por los limites de segmentacion de la aplicacion.
- El modelo no evalua el historial de la conversacion ni ofrece enrutado de soporte de crisis.
- La cuantizacion altero 7 etiquetas superiores respecto a FP32 en las 464 entradas de diagnostico, lo que indica que el proceso de exportacion no es neutral en todos los casos.
- El comportamiento en navegador/WASM se prueba por separado del ONNX de escritorio, por lo que deben validarse ambos entornos antes de un despliegue en produccion.
- El modelo solo cubre turco; no hay soporte multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sinatras/torug-safety-bert-balanced-q8
- Modelo anterior relacionado: https://huggingface.co/sinatras/torug-safety-bert-q8
- Manifest de artefactos mencionado en la model card: `artifact-manifest.json` dentro del repositorio del modelo
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada
