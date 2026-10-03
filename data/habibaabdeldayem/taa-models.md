# HabibaAbdeldayem/taa-models

## Resumen

taa-models (tambien identificado en su model card como taa3-q40) es un modelo especializado en la extraccion de tareas a partir de frases en arabe, en cualquier dialecto. Lo desarrolla el usuario de HuggingFace HabibaAbdeldayem y se construye sobre Qwen/Qwen3.5-0.8B, un modelo denso de aproximadamente 773 millones de parametros, afinado mediante LoRA en lo que el autor denomina "ronda 3". El modelo no genera texto libre: su unica funcion es transformar una frase en un listado compacto de tareas, una por linea, con campos estructurados de fecha, franja horaria, persona y categoria.

El resultado se distribuye en formato GGUF con cuantizacion Q4_0 (unos 489 MB), lo que lo hace ejecutable en llama.cpp y en hardware muy limitado, incluidos moviles. Es relevante porque cubre un nicho poco atendido: la extraccion de tareas en arabe dialectal, un idioma con escasa representacion en modelos especializados de este tamano. Su formato de salida estructurado lo hace directamente integrable en aplicaciones de gestion de tareas, asistentes personales o CRM sin necesidad de postprocesado complejo.

La model card reporta una precision de campos del 92,7% sobre un conjunto de 137 frases de prueba y una latencia mediana de aproximadamente 1,7 segundos por frase en un Samsung Galaxy A34 usando CPU con 2 hilos. No hay informacion publica sobre licencia, ventana de contexto ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado del modelo base Qwen/Qwen3.5-0.8B, afinado con LoRA) |
| Parametros totales | 772.845.888 (~773 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (489 MB) |
| Idiomas soportados | Arabe (ar), incluidos dialectos segun la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 773 millones de parametros, y se adapta mediante LoRA. La model card indica que se trata de la "ronda 3" de entrenamiento y que el resultado se ha cuantizado a Q4_0 en formato GGUF con un tamano final de 489 MB. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal no esta en la arquitectura, sino en la tarea y el formato de salida. El modelo trabaja con ChatML sin modo de razonamiento explicito, usa decodificacion greedy con repeat penalty de 1.0 y detiene la generacion en el token `<|im_end|>`. La salida sigue un formato de campos separados por punto y coma, por ejemplo `شراء عيش;d=1;pt=morning;c=shopping`, donde `d` corresponde al desplazamiento temporal, `pt` a la franja horaria, `p` a la persona y `c` a la categoria. Cuando no hay tareas, devuelve un guion (`-`).

## Capacidades

- Extraccion de tareas a partir de frases en arabe, en cualquiera de sus dialectos.
- Salida estructurada con campos de fecha, franja horaria, persona y categoria, una tarea por linea.
- Comprension de referencias temporales relativas, codificadas como desplazamiento (por ejemplo, `d=1`).
- Deteccion de ausencia de tareas y respuesta controlada con `-`.
- Ejecucion en CPU y en dispositivos de bajos recursos gracias a la cuantizacion Q4_0.
- Integracion con llama.cpp y con endpoints compatibles con la API de chat (etiqueta `endpoints_compatible`).
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de vision, audio, codigo, matematicas ni razonamiento multi-paso.
- Capacidad multilingue limitada al arabe; no hay datos sobre otros idiomas.

## Casos de uso

- Aplicaciones de gestion de tareas en arabe: el modelo convierte una nota o un mensaje libre en entradas estructuradas listas para insertar en una base de datos, gracias a su salida delimitada por campos.
- Asistentes personales por voz o texto en arabe dialectal: se puede integrar la extraccion de tareas antes de la fase de planificacion, reduciendo la ambiguedad de la entrada del usuario.
- Atencion al cliente en comercio electronico: procesar mensajes entrantes en dialecto para extraer acciones pendientes (por ejemplo, "comprar pan" o "recoger el medicamento") y enrutarlas al equipo correspondiente.
- Automatizacion de listas de compra y recordatorios domesticos: la categoria `c=shopping` y la franja horaria permiten clasificar y programar recordatorios de forma automatica.
- Gestion de citas en el ambito sanitario: la extraccion de la categoria `c=health` y de la persona implicada facilita la generacion de recordatorios de medicacion o visitas.
- Despliegue en movil o en dispositivos embebidos: con 489 MB en Q4_0 y una latencia mediana de 1,7 segundos en un Galaxy A34 con 2 hilos de CPU, es viable como componente local en una aplicacion Android o en un asistente de bajo consumo.
- Preprocesado dentro de un pipeline de agentes: al devolver un formato estable, puede actuar como etapa de normalizacion previa a un modelo mayor encargado de la planificacion.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Precision de campos | 92,7% | Evaluado sobre 137 frases de prueba |
| Latencia mediana | ~1,7 s por frase | Samsung Galaxy A34, CPU con 2 hilos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son la precision de campos y la latencia indicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB con la cuantizacion Q4_0, segun el modelo cargado y el backend.
- GPU recomendadas: no se especifican; cualquier GPU consumer con al menos 2 GB de VRAM puede alojar el modelo cuantizado (por ejemplo, GTX 1650, RTX 3050 o superiores).
- Cabe en GPU consumer: si, con margen amplio dado el tamano del fichero (489 MB).
- Ejecucion en CPU: viable, con un rendimiento medido de ~1,7 s por frase en un dispositivo movil de gama media con 2 hilos.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF; el modelo incluye la etiqueta `endpoints_compatible` para su exposicion mediante API de chat. No hay datos sobre vLLM, TGI u Ollama.
- Latencia y throughput: unicamente se documenta la latencia mediana de ~1,7 s por frase en Galaxy A34; no hay cifras de throughput para GPU ni para servidores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taa-models (taa3-q40) | ~773 M | no disponible | Extraccion de tareas en arabe | no disponible | GGUF en HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | ~773 M | no disponible | Modelo generalista | no disponible | HuggingFace |
| Otras alternativas de extraccion de tareas en arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos especializados comparables en extraccion de tareas en arabe, ni de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta publicada, por lo que no se puede confirmar si se permite el uso comercial. Es un bloqueo potencial para produccion.
- La precision reportada (92,7% de campos) procede de una unica evaluacion sobre 137 frases; no hay validacion externa ni desglose por dialecto o tipo de tarea.
- Al ser un modelo especializado, no responde a preguntas generales ni mantiene conversacion: fuera de la tarea de extraccion su salida no es fiable.
- Riesgo de alucinacion en los campos estructurados: un error en el desplazamiento temporal (`d`) o en la categoria (`c`) puede propagarse silenciosamente a la aplicacion consumidora, por lo que se recomienda validacion posterior.
- Soporte limitado al arabe; no hay evidencia de funcionamiento en otros idiomas.
- El repositorio registra 0 descargas y 0 "likes", lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan la composicion del dataset de entrenamiento, los sesgos potenciales ni las medidas de filtrado aplicadas.
- La fecha de publicacion del repositorio (2026) y el modelo base indicado deben verificarse contra la informacion oficial de Qwen, ya que no se aportan detalles adicionales.
- El prompt debe usarse en ChatML sin modo de razonamiento, con decodificacion greedy y repeat penalty de 1.0; desviarse de esta configuracion puede degradar el formato de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HabibaAbdeldayem/taa-models
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
