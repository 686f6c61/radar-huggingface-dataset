# Random-Sandwiche/rsvqa-qwen3-vl-lora

## Resumen

RSVQA Qwen3-VL LoRA es una coleccion de adaptadores LoRA publicados por el usuario Random-Sandwiche para el ajuste fino de los modelos Qwen3-VL-2B-Instruct y Qwen3-VL-4B-Instruct de Alibaba Qwen sobre la tarea de respuesta visual a preguntas (VQA) en imagenes de teledeteccion. El adaptador se entrena sobre el conjunto de datos RSVQA-LR, que empareja imagenes de satelite con preguntas en lenguaje natural y respuestas cortas, y esta pensado para especializar un VLM generico en la interpretacion de escenas remotas sin necesidad de reentrenar el modelo completo.

El repositorio contiene dos subcarpetas independientes, `qwen3-vl-2b` y `qwen3-vl-4b`, cada una con los pesos LoRA correspondientes a su modelo base. El tamano total del repositorio es de aproximadamente 0,2 GB, coherente con la naturaleza compacta de los adaptadores PEFT. La licencia declarada es Apache 2.0, lo que facilita su uso comercial siempre que se respeten las condiciones del modelo base.

La relevancia de esta ficha reside en que ejemplifica el patron habitual de especializacion de VLMs mediante LoRA para dominios verticales (teledeteccion, agricultura de precision, analisis geoespacial) con un coste de entrenamiento y almacenamiento muy reducido en comparacion con el ajuste completo. No obstante, la informacion publicada por el autor es minima: no se documentan resultados de evaluacion, composicion exacta del dataset ni hiperparametros mas alla de los basicos del LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL (transformer multimodal vision-language) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-VL-2B-Instruct y Qwen3-VL-4B-Instruct tienen 2B y 4B parametros respectivamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el dataset RSVQA-LR esta en ingles; el modelo base Qwen3-VL es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16, alpha=32 y dropout 0.05, aplicado sobre los modelos Qwen3-VL-2B-Instruct y Qwen3-VL-4B-Instruct. El entrenamiento se realizo con tasa de aprendizaje 2e-4 durante 2 epocas sobre el dataset RSVQA-LR (remote-sensing VQA, variante de baja resolucion). No se especifica en la model card el numero de pasos, el tamano del batch, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO; tampoco se detalla que modulos del transformer (attention, MLP, proyeccion visual) reciben los adaptadores.

Qwen3-VL es la familia multimodal de Qwen basada en un transformer decoder con un encoder visual y un proyector hacia el espacio de embeddings del lenguaje. La innovacion principal del adaptador no esta en la arquitectura, sino en el enfoque: especializar un VLM generalista en un dominio concreto (imagenes de satelite) mediante un adaptador de bajo rango, lo que permite mantener el modelo base congelado y reducir drasticamente los requisitos de computo frente al fine-tuning completo. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imagenes de teledeteccion: el adaptador esta entrenado especificamente para responder preguntas en lenguaje natural sobre escenas de satelite.
- Interpretacion de escenas remotas: identificacion de elementos como edificios, carreteras, vegetacion, agua o uso del suelo, segun el contenido tipico de RSVQA-LR.
- Razonamiento visual de un solo turno: el formato de RSVQA es pregunta-respuesta corta, no conversacion multi-turno.
- Capacidades heredadas del modelo base Qwen3-VL-2B/4B-Instruct: generacion de texto, comprension de imagenes generales, soporte multilingue y posible tool calling, aunque el adaptador no esta optimizado para estas tareas.
- No se documenta soporte explicito de agentes, multi-step reasoning ni thinking mode en el adaptador.
- No se documentan capacidades de audio ni de video.

## Casos de uso

- Analisis de imagenes de satelite para inventario de infraestructura: dado un recorte de imagen, el modelo responde a preguntas como "¿cuantos edificios hay?" o "¿que tipo de cubierta predomina?", aprovechando el ajuste especifico sobre RSVQA-LR.
- Monitorizacion de cambios en el territorio: comparar respuestas del modelo sobre imagenes de la misma zona en fechas distintas para detectar variaciones en vegetacion, agua o urbanizacion, con el adaptador como clasificador visual de bajo coste.
- Agricultura de precision: consultas sobre presencia de cultivos, estado de parcelas o infraestructura rural en imagenes de baja resolucion, integrado en un pipeline de teledeteccion.
- Apoyo a tareas de cartografia y uso del suelo: clasificacion rapida de escenas para preetiquetar imagenes antes de la revision humana, reduciendo el coste de anotacion.
- Educacion e investigacion en teledeteccion: base ligera para experimentar con VQA geoespacial en entornos academicos con recursos limitados, dado el reducido tamano del adaptador (0,2 GB).
- Prototipado de asistentes de consulta geoespacial: combinado con un sistema de recuperacion de imagenes, el adaptador puede responder preguntas sobre recortes satelitales en un chatbot de dominio especifico.
- Despliegue en hardware modesto: al usar Qwen3-VL-2B como base, el conjunto puede ejecutarse en GPUs de consumo con cuantizacion, lo que facilita demos y pruebas piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, Qwen3-VL-2B-Instruct en fp16 requiere aproximadamente 4-5 GB de VRAM, y Qwen3-VL-4B-Instruct en fp16 aproximadamente 8-10 GB; el adaptador LoRA anade una cantidad marginal (decenas de MB).
- GPU recomendadas: para el modelo base de 2B, una RTX 3060/4060 con 8-12 GB es suficiente en fp16; para el de 4B, se recomienda RTX 4070/4080 o superior con 12-16 GB. Para produccion, A100 o H100 si se necesita throughput alto.
- Cabe en GPU de consumo: si, especialmente la variante de 2B; la de 4B requiere al menos 8-12 GB de VRAM en fp16 y menos con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers + peft (patron documentado en la model card), vLLM, TGI y llama.cpp/Ollama con conversion previa del modelo base fusionado con el adaptador.
- Latencia y throughput: no disponibles; dependen del modelo base, la GPU y el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSVQA Qwen3-VL LoRA (este) | Adaptador sobre 2B/4B | no disponible | LoRA especializado en RSVQA-LR | apache-2.0 | Hugging Face, 0 descargas |
| Qwen3-VL-2B-Instruct (base) | 2B | no disponible | VLM generalista | no disponible en la informacion | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | VLM generalista | no disponible en la informacion | Hugging Face |

No se dispone de informacion sobre otros adaptadores LoRA publicos para RSVQA con los que comparar directamente; los unicos terminos de comparacion documentados son los propios modelos base Qwen3-VL.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente sobre RSVQA-LR; su rendimiento fuera de ese dominio (imagenes naturales, documentos, video) sera probablemente inferior al del modelo base sin adaptar.
- RSVQA-LR contiene imagenes de baja resolucion y respuestas cortas; el modelo puede fallar en preguntas abiertas, multi-turno o que requieran conteo preciso.
- No se han publicado metricas de evaluacion, por lo que no es posible verificar la calidad del ajuste ni compararlo con alternativas.
- La model card no documenta sesgos conocidos; al entrenar sobre un dataset geoespacial especifico, pueden heredarse sesgos de cobertura geografica y de anotacion del propio RSVQA.
- Riesgo de alucinacion: como todo VLM, puede generar respuestas plausibles pero incorrectas sobre elementos no visibles en la imagen.
- La licencia apache-2.0 del adaptador no exime de cumplir las condiciones del modelo base Qwen3-VL, cuya licencia debe verificarse por separado antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad; conviene tratarlo como un experimento y validarlo en el caso de uso concreto antes de produccion.
- No se documentan idiomas soportados por el adaptador; el dataset original esta en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Random-Sandwiche/rsvqa-qwen3-vl-lora
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset RSVQA-LR: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
