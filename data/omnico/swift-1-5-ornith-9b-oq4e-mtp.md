# Omnico/Swift-1.5-Ornith-9B-oQ4e-mtp

## Resumen

Swift-1.5-Ornith-9B-oQ4e-mtp es una cuantizacion mixta del modelo Ornith-1.5-9B, publicada por el usuario Omnico en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: el autor aplica la herramienta oQ (oMLX v0.7.3) para reducir la precision de los pesos y obtener un artefacto de 6,5 GB que puede ejecutarse con la libreria MLX en hardware Apple Silicon. El nombre indica cuatro caracteristicas clave: cuantizacion de 4 bits como base, esquema mixto (oQ), cabeza MTP (multi-token prediction) y un total de aproximadamente 9.653 millones de parametros.

El modelo base pertenece a la familia Qwen3.5, segun la etiqueta `qwen3_5` del repositorio, e incorpora un componente de vision de 0,456B de parametros junto al modelo de lenguaje de 8,954B. La presencia de una cabeza MTP de 0,243B sugiere que el checkpoint conserva el mecanismo de prediccion multi-token del modelo original, util para decodificacion especulativa. El interes practico de esta publicacion es disponer de una version comprimida y lista para MLX de un modelo multimodal de ~9B, con un promedio efectivo de 5,390 bits por peso que busca equilibrar tamano en disco y calidad de salida.

La relevancia es acotada pero clara para quien trabaja en el ecosistema Apple: permite desplegar localmente un modelo multimodal de casi 10B en equipos con memoria unificada moderada, sin necesidad de GPUs dedicadas. La informacion publicada por el autor se limita a la ficha de cuantizacion; no hay model card del modelo base, ni datos de entrenamiento, benchmarks o licencia en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), con cabeza MTP (multi-token prediction); detalles no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (6,335B), affine 5-bit grupo 64 (2,709B), affine 6-bit grupo 64 (0,118B), affine 8-bit grupo 64 (0,000B), BF16 (0,491B); promedio efectivo 5,390 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion MLX), libreria `mlx` |
| Tamano del repositorio | 6,5 GB (6,503 GB / 6,057 GiB) |
| Desglose de componentes | Lenguaje: 8,954B (5,402 GB); Vision: 0,456B (0,912 GB); MTP head: 0,243B (0,189 GB) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo Ornith-1.5-9B, que por la etiqueta `qwen3_5` se corresponde con la familia Qwen3.5. La arquitectura subyacente es, por tanto, un transformer multimodal con un tower de vision de 0,456B de parametros y una cabeza MTP de 0,243B. Esta ultima esta asociada a tecnicas de prediccion multi-token, habitualmente empleadas para decodificacion especulativa y para acelerar la generacion autoregresiva. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas de atencion ni sobre el tipo exacto de atencion empleado.

El proceso de cuantizacion lo realiza oQ, la herramienta de cuantizacion mixta de oMLX v0.7.3 (repositorio jundot/omlx). El autor asigna precision de forma no uniforme: el 65,6% de los pesos logicos quedan en affine 4-bit con grupo de 64, el 28,1% en 5-bit, el 1,2% en 6-bit y el 5,1% restante se mantiene en BF16. Esta distribucion sugiere que las capas mas sensibles (probablemente embeddings, cabezas de salida y algunos tensores del tower de vision) conservan mayor precision, mientras que el grueso de las matrices lineales se comprime a 4 bits. No hay informacion publicada sobre los datos de entrenamiento del modelo base, el numero de tokens, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de ~9B, por lo que se le presupone capacidad de generacion, comprension y razonamiento de nivel medio, aunque no hay evaluaciones publicadas que lo confirmen.
- Vision: el checkpoint incluye un tower de vision de 0,456B de parametros, lo que indica soporte de entrada de imagenes y tareas de comprension visual.
- Prediccion multi-token: la cabeza MTP de 0,243B permite, en principio, decodificacion especulativa y generacion acelerada, siempre que el runtime MLX lo soporte.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: el formato MLX y los 6,5 GB del checkpoint permiten ejecutar el modelo en un Mac con memoria unificada de 16 GB o superior, usando la libreria MLX y el runtime de oMLX; es el caso de uso principal de esta publicacion.
- Prototipado de aplicaciones multimodales en escritorio: al incluir tower de vision, el modelo puede emplearse para describir imagenes, responder preguntas sobre capturas de pantalla o extraer informacion de documentos escaneados en un flujo local sin enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: investigadores que quieran medir el impacto de la cuantizacion mixta oQ frente al checkpoint original pueden usar este artefacto como referencia de 5,390 bits/peso medio y compararlo con la variante oQ5e del mismo autor.
- Generacion asistida en editores y herramientas de desarrollo: con la cabeza MTP y un runtime compatible, el modelo puede integrarse en asistentes de codigo o autocompletado local, aunque no hay datos que confirmen su calidad en programacion.
- Procesamiento de documentos con contexto moderado: util para resumir o extraer datos de PDF e imagenes en pipelines por lotes ejecutados en estaciones de trabajo Apple, siempre que la longitud de contexto del modelo base sea suficiente (dato no publicado).
- Demostraciones y docencia: el tamano reducido y la ausencia de dependencia de GPU dedicada lo hacen adecuado para talleres y entornos educativos donde se quiera mostrar cuantizacion, MLX y modelos multimodales en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la distribucion de bits y el tamano de almacenamiento; no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones con el checkpoint original sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 6,057 GiB en disco; en inferencia hay que sumar la cache KV y los buffers del runtime, por lo que se recomienda un minimo de 12-16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que la libreria es MLX; no es un checkpoint para CUDA.
- GPU dedicadas: no aplica de forma nativa; el formato MLX no esta pensado para A100, H100 ni RTX 4090. Seria necesario reconvertir los pesos a otro formato.
- Opciones de despliegue: MLX y oMLX (herramienta del autor de la cuantizacion); vLLM, llama.cpp, Ollama y TGI no soportan este formato de forma directa.
- Latencia y throughput: no disponibles; dependen del chip Apple concreto y del soporte efectivo de la cabeza MTP en el runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Ornith-9B-oQ4e-mtp (este) | 9,653B | no disponible | Mixta 4/5/6/8-bit + BF16, 5,390 bits/peso | no disponible | Hugging Face, formato MLX |
| Omnico/Swift-1.5-Ornith-9B-oQ5e | ~9,65B (misma base) | no disponible | Mixta con mayor peso en 5-bit | no disponible | Hugging Face, formato MLX |
| ornith-ai/Ornith-1.5-9B | ~9,65B | no disponible | Sin cuantizar (presumiblemente BF16) | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento ni de especificaciones del modelo original que permitan contrastarlo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantizacion mixta a 5,390 bits/peso medio introduce perdida de calidad respecto al checkpoint original; no hay evaluaciones publicadas que cuantifiquen esa degradacion.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base ornith-ai/Ornith-1.5-9B antes de cualquier despliegue en produccion.
- No hay informacion sobre sesgos, datos de entrenamiento ni idiomas soportados; no se puede evaluar el riesgo de sesgo ni la cobertura linguistica.
- Riesgo de alucinacion inherente a los LLM de ~9B, agravado por la falta de benchmarks que permitan calibrar su fiabilidad.
- El checkpoint es especifico de MLX y no es portable directamente a ecosistemas CUDA; migrarlo requiere conversion de pesos.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-08); no hay evidencia de uso ni validacion por parte de la comunidad.
- El autor advierte de que la version actual se recuantizo con oMLX v0.7.3 y que copias anteriores deben descargarse de nuevo; conviene verificar el hash de los archivos.
- La longitud de contexto es desconocida, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Omnico/Swift-1.5-Ornith-9B-oQ4e-mtp
- Variante oQ5e del mismo autor: https://huggingface.co/Omnico/Swift-1.5-Ornith-9B-oQ5e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Herramienta de cuantizacion oMLX/oQ: https://github.com/jundot/omlx
