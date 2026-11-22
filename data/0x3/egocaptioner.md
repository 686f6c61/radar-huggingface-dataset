# 0x3/EgoCaptioner

## Resumen

EgoCaptioner es un modelo de vision-lenguaje especializado en la descripcion de video en primera persona (egocentric video captioning). Lo desarrolla el usuario 0x3 y se distribuye como un fine-tuning del modelo base Qwen3.5-9B, conservando su licencia Apache 2.0. Su funcion es generar, a partir de un clip de video grabado desde el punto de vista del usuario, un resumen global de la escena y de la actividad del portador de la camara, acompanado de una secuencia de pasos con marcas temporales que detallan como se desarrolla esa actividad (manipulacion de objetos, desplazamiento, interaccion social y atencion visual).

El modelo resuelve un problema concreto dentro del ambito de los asistentes personales y la robotica: convertir grabaciones continuas y en primera persona en descripciones estructuradas y factuales, con alineacion temporal explicita. Para ello se entrena con supervision de caption de grano grueso a fino y con aprendizaje por refuerzo orientado a tres objetivos: contenido factual, alineacion temporal y estilo de la descripcion.

Con 9.409.813.744 parametros (aproximadamente 9,4 mil millones) y un tamano de repositorio de 18,8 GB en safetensors, se situa en la gama media de los modelos multimodales, lo que lo hace desplegable en infraestructura de una sola GPU de alta gama. La informacion publica es muy limitada: no hay datos de benchmarks ni detalles sobre la longitud de contexto o los idiomas mas alla del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-9B), pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EgoCaptioner parte de Qwen3.5-9B, un modelo de la familia Qwen 3.5 con capacidad nativa de procesamiento de imagen y texto, y se especializa mediante fine-tuning para la tarea de captioning de video egocentrico. El pipeline declarado es image-text-to-text, lo que implica que el modelo recibe una secuencia de fotogramas (o el video muestreado) junto con una instruccion textual y produce texto descriptivo. No se detalla en la informacion disponible la arquitectura interna del codificador visual, el numero de tokens de contexto ni la composicion exacta del dataset de entrenamiento.

El entrenamiento combina dos tecnicas segun la model card: supervision de caption de grano grueso a fino (coarse-to-fine caption supervision), que probablemente parte de descripciones globales y refina hacia pasos detallados con marcas temporales, y aprendizaje por refuerzo disenado explicitamente para tres dimensiones: fidelidad factual del contenido, alineacion temporal de los pasos y estilo de la descripcion. La figura de recompensa del repositorio ("reward design") sugiere un esquema de RL con funciones de recompensa multiples, aunque no se publican los hiperparametros ni el volumen de datos empleado.

## Capacidades

- Descripcion de video en primera persona con dos niveles de granularidad: un resumen global de escena y actividad, y pasos detallados con marcas temporales.
- Detalle de acciones de manipulacion de objetos, locomocion, interaccion social y atencion visual del portador de la camara.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), lo que permite condicionar la descripcion mediante instrucciones en lenguaje natural.
- Generacion de descripciones factuales y temporalmente alineadas gracias al entrenamiento con RL.
- Capacidad conversacional (tag "conversational") para interacciones multi-turno sobre el contenido del video.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia personal para personas con discapacidad visual: el modelo puede transformar la grabacion de unas gafas inteligentes en una narracion estructurada de lo que ocurre y de los pasos seguidos, facilitando la revision posterior de tareas realizadas.
- Documentacion automatica de procedimientos manuales: en entornos de fabricacion o laboratorio, grabar una tarea con camara corporal y obtener un resumen mas una secuencia de pasos con marcas temporales que sirva como manual de operaciones.
- Entrenamiento de modelos roboticos a partir de video egocentrico: las descripciones temporizadas pueden emplearse como supervision para aprendizaje por imitacion o para anotar datasets de manipulacion.
- Analisis de interacciones sociales y atencion: en estudios de conducta o experiencia de usuario, el modelo permite etiquetar cuando el portador mira a alguien, interactua o cambia de foco de atencion.
- Indexado y busqueda de archivos de video personal: generar descripciones con marcas temporales para permitir busquedas semanticas dentro de grabaciones continuas de camaras corporales.
- Evaluacion de calidad de datos de video: usar el modelo para describir clips y detectar grabaciones con poca informacion, movimientos erraticos o escenas no relevantes antes de incorporarlas a un dataset mayor.
- Prototipado de asistentes conversacionales sobre video: al ser conversacional y compatible con endpoints, puede integrarse en un servicio que responda preguntas del usuario sobre lo grabado en los ultimos minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 19-20 GB solo para los pesos, mas el coste de activaciones y del procesamiento de multiples fotogramas de video, que puede elevar el consumo de forma notable.
- VRAM estimada con cuantizacion de 8 bits: en torno a 10-11 GB para los pesos; con 4 bits, en torno a 5-6 GB, aunque no se confirma que existan versiones cuantizadas publicadas (no disponible).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia comoda en precision completa con videos largos; L40S o RTX 6000 Ada como alternativas de 48 GB; RTX 4090 (24 GB) viable en fp16 con clips cortos y muestreo moderado de fotogramas.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, potencialmente en GPUs de 12-16 GB, si bien el cuello de botella real sera el numero de fotogramas procesados.
- Opciones de despliegue: transformers (libreria declarada), servidores compatibles con endpoints; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EgoCaptioner | 9,4 B | no disponible | Captioning de video egocentrico | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9 B | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en video captioning | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni modelos comparables directos en la tarea de captioning egocentrico, por lo que la comparacion se limita al modelo base del que deriva. Frente a Qwen3.5-9B, EgoCaptioner anade especializacion en video en primera persona y descripciones con marcas temporales, a costa de restringir el idioma al ingles y de un dominio de aplicacion mas acotado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre video egocentrico, puede heredar sesgos de los datasets de grabaciones personales empleados.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el entrenamiento con RL busca reducir contenido no factual, pero no se publican metricas de fidelidad.
- Limitaciones de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto y numero maximo de fotogramas procesables: no disponibles, lo que impide planificar el despliegue con videos largos sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datasets de entrenamiento, no detallados.
- Madurez: el repositorio no tiene descargas ni likes y se creo en noviembre de 2026; no hay evidencia publica de validacion independiente.
- Despliegue en produccion: la ausencia de benchmarks, de guias de cuantizacion y de confirmacion de soporte en servidores de inferencia populares obliga a realizar una evaluacion propia antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0x3/EgoCaptioner
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub: https://github.com/cactusqq/EgoCaptioner
