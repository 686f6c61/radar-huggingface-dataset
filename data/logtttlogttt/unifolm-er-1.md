# logtttlogttt/UnifoLM-ER-1

## Resumen

UnifoLM-ER-1-4B es un modelo vision-lenguaje (VLM) especializado en percepcion y razonamiento espacial para entornos encarnados (embodied AI), desarrollado por Unitree y publicado en HuggingFace bajo el identificador `logtttlogttt/UnifoLM-ER-1`. Se construye mediante fine-tuning sobre Qwen3-VL-4B y esta orientado a tareas roboticas: prediccion de puntos en imagen, deteccion de objetos 2D y 3D, prediccion de trayectorias, razonamiento multi-imagen y respuesta a preguntas espaciales.

El modelo resuelve el problema de la comprension espacial limitada en VLMs genericos, que rinden bien en tareas de descripcion pero fallan al razonar sobre posiciones, relaciones y affordances necesarias para controlar un robot. Con 4.440 millones de parametros y un repositorio de 8,9 GB en safetensors, ofrece un tamano manejable para despliegue en una sola GPU.

Su relevancia actual radica en que compite con modelos de 7B y con APIs propietarias en benchmarks de razonamiento espacial, superando en siete de dieciseis benchmarks a los modelos open source comparados y manteniendo capacidades generales de vision-lenguaje gracias al co-entrenamiento con datos imagen-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3-VL-4B) |
| Parametros totales | 4.440.764.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,9 GB |
| Fecha de publicacion | 2026-10-26 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B, un transformer multimodal con encoder visual y decodificador de lenguaje, y se ajusta mediante entrenamiento supervisado sobre mas de 5 millones de muestras. La composicion del dataset cubre prediccion de puntos en imagen, deteccion de objetos, razonamiento multi-imagen, prediccion de trayectorias 2D, deteccion de objetos 3D y preguntas espaciales multi-imagen. Estos datos se co-entrenan con datos generales de imagen-texto para preservar las capacidades vision-lenguaje del modelo base y evitar el olvido catastrofico en tareas genericas.

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectonicas propias mas alla del fine-tuning sobre Qwen3-VL; el enfasis esta en la curacion de datos espaciales y embodied mas que en cambios estructurales.

## Capacidades

- Percepcion visual general: descripcion de imagenes, VQA y comprension de escenas.
- Razonamiento espacial: relaciones entre objetos, profundidad relativa y posicionamiento.
- Prediccion de puntos en imagen (point prediction) para localizacion precisa de objetos.
- Deteccion de objetos 2D y 3D.
- Prediccion de trayectorias 2D, util para planificacion de movimiento.
- Razonamiento multi-imagen y respuesta a preguntas espaciales sobre varias vistas.
- Capacidades generales de vision-lenguaje preservadas por co-entrenamiento con datos imagen-texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Navegacion robotica asistida: el modelo predice trayectorias 2D y localiza puntos de interes en la imagen, lo que permite a un robot movil planificar rutas y evitar obstaculos a partir de una camara monocular.
- Manipulacion de objetos: la deteccion 2D y 3D y la prediccion de puntos permiten identificar la posicion exacta de un objeto y su punto de agarre antes de ejecutar una accion con el efector final.
- Respuesta a preguntas espaciales en entornos industriales: dado un conjunto de imagenes de una planta, el modelo responde donde esta un componente respecto a otro, apoyando tareas de inspeccion y mantenimiento.
- Planificacion de tareas embodied: con razonamiento multi-imagen, puede interpretar varias vistas de una escena y proponer secuencias de acciones coherentes con la geometria del entorno.
- Deteccion de objetos 3D en logistica: localizacion de cajas y palets en imagenes de almacen para alimentar sistemas de picking automatico.
- Evaluacion de affordances en investigacion: uso como modelo de referencia para comparar metodos de razonamiento espacial en benchmarks como RefSpatial-Bench, Where2Place o Pixmo-Point.
- Asistencia a operadores remotos: dado un flujo de imagenes, el modelo senala ubicaciones y relaciones espaciales para guiar a un tecnico humano en tareas de montaje o reparacion.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. La columna BLINK se promedia solo sobre las subtareas Relative Depth y Spatial Relation.

| Benchmark | UnifoLM-ER-1-4B | Qwen3-VL-4B | RoboBrain2.0-7B | Embodied-R1.5-8B | Thinker-4B |
|---|---:|---:|---:|---:|---:|
| RoboVQA | 62,4 | 47,7 | 30,0 | 61,0 | 62,7 |
| Ego-Plan2 | 55,1 | 40,7 | 33,23 | 53,8 | 63,7 |
| RefSpatial-Bench | 61,7 | 46,6 | 42,2 | 54,2 | 61,0 |
| Where2Place | 82,0 | 63,0 | 63,6 | 74,0 | 72,0 |
| Pixmo-Point | 73,8 | 48,3 | 54,7 | 64,8 | 57,4 |
| BLINK | 93,4 | 85,0 | 83,9 | 83,0 | 84,6 |
| CV-Bench | 88,6 | 85,1 | 85,7 | 86,9 | 86,3 |
| EmbSpatial | 88,9 | 79,6 | 76,3 | 78,1 | 80,2 |
| RoboSpatial | 73,1 | 61,7 | 54,2 | 69,7 | 70,8 |
| SAT | 76,0 | 68,7 | 75,3 | 74,7 | 72,7 |
| VSI-Bench | 54,2 | 59,3 | 36,1 | 56,1 | 65,4 |
| VSR | 88,1 | 81,6 | 84,0 | no disponible | 81,5 |
| ERQA | 50,0 | 41,3 | no disponible | 46,0 | no disponible |
| RealWorldQA | 69,8 | 71,0 | 69,4 | no disponible | 71,9 |
| MME | 2223,3 | 2325,2 | 2057,4 | no disponible | 2323,4 |
| MMMU_VAL | 54,7 | 57,8 | 44,4 | no disponible | 46,2 |

El modelo supera a su base Qwen3-VL-4B en trece de los dieciseis benchmarks reportados, con mejoras especialmente marcadas en Where2Place (+19,0), Pixmo-Point (+25,5) y EmbSpatial (+9,3). Retrocede ligeramente en VSI-Bench (54,2 frente a 59,3), RealWorldQA (69,8 frente a 71,0), MME (2223,3 frente a 2325,2) y MMMU_VAL (54,7 frente a 57,8), lo que sugiere una ligera perdida de capacidades generales tras el fine-tuning embodied.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8,9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3-4 GB de pesos, aunque la cuantizacion no esta documentada oficialmente para este modelo.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G son adecuadas; el modelo es pequeno para este hardware y permite alto throughput por GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con holgura; en RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) es viable en BF16 con contexto limitado o en cuantizacion.
- Opciones de despliegue: al estar basado en Qwen3-VL, es compatible con stacks que soportan dicha familia (vLLM, TGI, transformers), aunque la compatibilidad exacta con llama.cpp y Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RefSpatial-Bench | Where2Place | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| UnifoLM-ER-1-4B | 4,44B | no disponible | 61,7 | 82,0 | Apache 2.0 | HuggingFace |
| Qwen3-VL-4B | 4B (aprox.) | no disponible | 46,6 | 63,0 | no disponible | HuggingFace |
| RoboBrain2.0-7B | 7B (aprox.) | no disponible | 42,2 | 63,6 | no disponible | HuggingFace |
| Embodied-R1.5-8B | 8B (aprox.) | no disponible | 54,2 | 74,0 | no disponible | HuggingFace |
| Thinker-4B | 4B (aprox.) | no disponible | 61,0 | 72,0 | no disponible | HuggingFace |

Frente a modelos de mayor tamano como RoboBrain2.0-7B o Embodied-R1.5-8B, UnifoLM-ER-1-4B obtiene mejores resultados en razonamiento espacial con la mitad de parametros. Thinker-4B es el competidor mas cercano en tamano y queda ligeramente por detras en RefSpatial-Bench y Where2Place, aunque lo supera en Ego-Plan2 y VSI-Bench.

## Limitaciones y advertencias

- Perdida de rendimiento en benchmarks generales respecto a Qwen3-VL-4B (MMMU_VAL 54,7 frente a 57,8; MME 2223,3 frente a 2325,2; RealWorldQA 69,8 frente a 71,0), lo que indica cierto olvido catastrofico en capacidades generales.
- Resultado inferior en VSI-Bench (54,2 frente a 59,3 del base), por lo que el razonamiento espacial en video o secuencias puede ser menos fiable.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-VL hereda los sesgos del corpus de entrenamiento original, no caracterizados en la model card.
- Riesgo de alucinacion en descripciones visuales y en predicciones de puntos o trayectorias; no se reportan metricas de calibracion ni de incertidumbre.
- Idiomas soportados no documentados; el uso en castellano no esta verificado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con entradas multi-imagen extensas.
- El modelo tiene 19 descargas y 0 likes en el momento de la consulta, con un unico commit; no hay evidencia de validacion independiente fuera de los benchmarks del autor.
- La model card incluye resultados de modelos propietarios obtenidos por el propio autor, lo que introduce posible sesgo de evaluacion.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento y las condiciones de Qwen3-VL-4B deben verificarse antes de un despliegue en produccion.
- No se documentan tecnicas de seguridad, filtrado de contenido ni mitigaciones de uso dual en entornos roboticos.

## Enlaces

- HuggingFace: https://huggingface.co/logtttlogttt/UnifoLM-ER-1
- Project page: https://unigen-x.github.io/unifolm-wla.github.io/
