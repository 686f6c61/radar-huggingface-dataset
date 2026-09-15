# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-30traj

## Resumen

RoboTalk-Qwen3-VL-8B-Instruct-30traj es un adaptador LoRA de una sola epoca entrenado por el usuario DorianAtSchool sobre el modelo base Qwen/Qwen3-VL-8B-Instruct. No es un modelo autonomo: se distribuye como pesos de adaptador PEFT (0,2 GB) que requieren cargar el modelo base de Qwen y su procesador. Su objetivo concreto no es la conversacion general, sino predecir la siguiente llamada a herramienta (next tool call) dentro de un protocolo de coordinacion entre dos agentes con contextos parcialmente observables y un esquema coordinador-seguidor.

El entrenamiento se realizo con 30 trayectorias por tarea sobre 43 tareas del dataset RoboTalk, lo que suma 1.290 trayectorias de entrenamiento, y se reservaron diez tareas adicionales como conjunto de retencion (held out). La evaluacion cerrada reporta un 81,86% de exitos sin errores en las tareas vistas (352/430 episodios) frente a un 45,00% en las tareas retenidas (45/100), una diferencia que refleja un sobreajuste claro al conjunto de entrenamiento.

Su relevancia es de nicho pero especifica: sirve como banco de pruebas de investigacion sobre coordinacion de alto nivel en simuladores domesticos y sobre el uso de modelos vision-lenguaje como politica compartida para multiples agentes. No esta pensado para control de hardware real ni para despliegues criticos para la seguridad, y no se le asigna una licencia propia de adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje denso (Qwen/Qwen3-VL-8B-Instruct); los pesos LoRA se aplican solo al modelo de lenguaje, no al backbone de vision |
| Parametros totales | Modelo base: 8B (Qwen3-VL-8B-Instruct). El adaptador usa rango LoRA 16 y alpha 32; el numero exacto de parametros entrenables no esta disponible. Tamano del repositorio: 0,2 GB |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como cifra oficial del adaptador. El entrenamiento se realizo con un limite de secuencia de 8.192 tokens, incluidos los tokens visuales |
| Tipos de cuantizacion | No disponible. El ejemplo de carga oficial usa bfloat16; el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible. La model card no asigna licencia separada al adaptador; el modelo base Qwen3-VL-8B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT). Requiere el modelo base en safetensors de HuggingFace |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un modelo denso de tipo vision-lenguaje de la familia Qwen3-VL: recibe texto e imagenes y genera texto. Los pesos publicados son exclusivamente LoRA sobre el modelo de lenguaje, con rango 16, alpha 32 y dropout 0,05; no se ha ajustado de forma independiente el backbone de vision. El repositorio no incluye estados del optimizador ni rutas de la maquina de entrenamiento, pero si los ficheros `training_config.json` (ajustes saneados), `task_split.json` (pertenencia de tareas) y `evaluation_results.json` (recuentos y ajustes de evaluacion).

El entrenamiento consistio en una epoca con tasa de aprendizaje 1e-4, weight decay 0,01, planificador coseno con 3% de calentamiento, semilla 42 y tamano de lote efectivo de 64 repartido en cuatro GPU, con el limite de 8.192 tokens por secuencia ya citado. Los datos proceden del dataset DorianAtSchool/RoboTalk: 30 trayectorias por tarea sobre 43 tareas (1.290 trayectorias) y diez tareas reservadas. El objetivo de prediccion es la siguiente llamada a herramienta, y una unica politica compartida controla dos agentes con contextos parcialmente observables bajo un protocolo coordinador-seguidor. La model card indica ademas que los conjuntos a mayor escala contienen las selecciones de menor escala, por lo que existen variantes con mas trayectorias por tarea. Reproducir las puntuaciones exige aportar el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo; los historiales no incluyen indices de paso y un prompt de chat generico no es suficiente.

## Capacidades

- Prediccion de la siguiente llamada a herramienta (next tool call) en un entorno de simulacion con definiciones de herramientas proporcionadas en el prompt.
- Soporte de tool calling mediante la plantilla de chat del modelo base.
- Coordinacion multiagente: una misma politica controla dos agentes con contextos parcialmente observables y un protocolo coordinador-seguidor.
- Procesamiento multimodal de entrada: texto e imagenes (pipeline image-text-to-text), con las observaciones visuales por agente integradas en el contexto.
- Ejecucion de episodios de multiples pasos (multi-step) con objetivo simbolico y estructura de maquina de estados finitos (FSM).
- Dos modos de inferencia distintos segun la evaluacion: modo instruct (temperatura 0, presupuesto de salida de 256 tokens) y modo thinking (temperatura 0,6, top-p 0,95, top-k 20, presupuesto de salida de 2.048 tokens).
- Capacidad multilingue: limitada al ingles segun los metadatos del repositorio.
- No se documentan capacidades de audio, generacion de imagen ni otras modalidades adicionales.

## Casos de uso

- Investigacion en coordinacion multiagente: el adaptador actua como politica compartida para dos agentes con observabilidad parcial, lo que permite estudiar protocolos coordinador-seguidor en simulacion sin disenar dos politicas separadas.
- Evaluacion de generalizacion entre tareas: con 43 tareas de entrenamiento y 10 retenidas, sirve como banco de pruebas para medir la brecha entre tareas vistas (81,86%) y no vistas (45,00%) en tareas de planificacion con herramientas.
- Prototipado de agentes que emiten llamadas a herramientas en simuladores domesticos: al predecir la siguiente tool call, encaja en bucles de ejecucion con validacion de llamadas y criterio simbolico de exito.
- Aprendizaje por imitacion sobre trayectorias: el dataset RoboTalk y los ficheros de particion permiten reproducir el entrenamiento y comparar variantes (por ejemplo, mas trayectorias por tarea) con una receta LoRA de coste reducido.
- Estudio de eficiencia de adaptadores: con rango 16 y 0,2 GB de repositorio, es un caso practico para medir cuanto rendimiento aporta un ajuste LoRA ligero frente al modelo base sin ajustar en una tarea de decision estructurada.
- Analisis de modos de razonamiento: comparar el modo instruct (256 tokens de salida) con el modo thinking (2.048 tokens de salida) permite estudiar el coste y el beneficio del razonamiento extendido en tareas de llamada a herramientas.
- Docencia y experimentacion con PEFT: el ejemplo de carga con Transformers y PEFT sobre un VLM de 8B es reproducible en un unico nodo de cuatro GPU o, en cuantizacion, en hardware mas modesto.

## Benchmarks y rendimiento

Se presentan los unicos resultados publicados en la informacion disponible: evaluacion en bucle cerrado con comunicacion completa, diez episodios por tarea y muestreo nativo de cohorte fija 43/10. El exito FSM sin errores implica alcanzar el objetivo simbolico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95% sobre episodios, no sobre tareas remuestreadas.

| Particion | Exitos sin errores / episodios | Tasa de exito | Intervalo 95% |
|---|---:|---:|---:|
| Tareas de entrenamiento (in_training_tasks) | 352/430 | 81,86% | 77,94–85,22% |
| Tareas retenidas (held_out_tasks) | 45/100 | 45,00% | 35,61–54,76% |

Ajustes de inferencia declarados: modo instruct con temperatura 0 y 256 tokens de salida; modo thinking con temperatura 0,6, top-p 0,95, top-k 20 y 2.048 tokens de salida. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en bfloat16 ocupa aproximadamente 16 GB solo en pesos, a lo que hay que sumar el codificador visual, activaciones y cache KV para 8.192 tokens; en la practica, entre 20 y 24 GB para una ejecucion comoda en bfloat16. En cuantizacion de 8 bits, en torno a 9-11 GB; en 4 bits, en torno a 6-8 GB. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- El adaptador en si apenas anade VRAM: el repositorio completo pesa 0,2 GB.
- GPU recomendadas: A100, H100 o L40S para bfloat16 con lotes grandes; en el entrenamiento se usaron cuatro GPU con lote efectivo 64, aunque el modelo concreto no se especifica.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16 con secuencias moderadas y en tarjetas de 12-16 GB si se cuantiza el modelo base a 8 o 4 bits. Los ajustes de evaluacion usan salidas de 256 o 2.048 tokens, lo que suaviza el pico de memoria frente a contextos muy largos.
- Opciones de despliegue: Transformers con soporte Qwen3-VL mas PEFT (el camino documentado por el autor) y servidores compatibles con modelos vision-lenguaje como vLLM o TGI. El uso con llama.cpp u Ollama requeriria fusionar el adaptador en el modelo base y convertirlo a GGUF, algo no documentado en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni latencias por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Instruct-30traj | 8B base + LoRA r16/a32 | No disponible (entrenamiento a 8.192 tokens) | 81,86% en tareas vistas; 45,00% en retenidas (exito FSM sin errores) | No especificada para el adaptador; base Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (modelo base sin ajustar) | 8B | No disponible en la informacion proporcionada | No disponible: no se reporta evaluacion del base en el mismo protocolo | Apache-2.0 | HuggingFace |
| Otras variantes RoboTalk del mismo autor (mayor numero de trayectorias por tarea) | 8B base + LoRA | No disponible (entrenamiento a 8.192 tokens) | No disponible; la model card solo indica que los conjuntos mayores contienen las selecciones menores | No especificada | HuggingFace |
| Otros adaptadores vision-lenguaje para robotica de 7-8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar con alternativas externas de la misma categoria (por ejemplo, adaptadores sobre Qwen2.5-VL u otros VLM de 7-8B orientados a robotica), por lo que esas filas se marcan como no disponibles.

## Limitaciones y advertencias

- Sobreajuste marcado: la tasa de exito cae del 81,86% en tareas de entrenamiento al 45,00% en tareas retenidas, una brecha de casi 37 puntos con intervalos de Wilson que no se solapan.
- Metrica simbolica: el exito FSM indica que se alcanza el objetivo simbolico sin llamadas rechazadas; no implica que se cumplan todos los criterios fisicos nativos de la tarea.
- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3-VL-8B-Instruct y su procesador, ademas de la libreria PEFT.
- Dependencia fuerte del prompt: reproducir las puntuaciones exige el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo; un prompt de chat generico no es suficiente.
- Solo ingles: los metadatos y la model card restringen el idioma a en.
- Licencia no asignada: la model card indica explicitamente que no se asigna una licencia separada al adaptador, por lo que el uso comercial queda en una situacion juridica ambigua. El modelo base es Apache-2.0 y sus terminos deben consultarse en su repositorio.
- Sin ajuste del backbone de vision: los pesos LoRA son solo del modelo de lenguaje, por lo que la interpretacion visual proviene integramente del modelo base.
- Riesgo de alucinacion: al predecir llamadas a herramientas, una salida malformada o una herramienta inexistente puede provocar llamadas rechazadas y romper el criterio de exito sin errores.
- Uso previsto limitado: investigacion sobre coordinacion de alto nivel en un simulador domestico. No esta destinado al control directo de hardware ni a despliegues criticos para la seguridad.
- Adopcion nula verificable: cero descargas y cero likes en el momento de la consulta, sin senales de validacion externa por parte de terceros.
- Los ajustes de inferencia difieren entre variantes del modelo (instruct frente a thinking), lo que complica comparaciones directas entre resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-30traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Ficheros de configuracion y evaluacion citados en la model card: `training_config.json`, `task_split.json`, `evaluation_results.json` (en el repositorio del adaptador)
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la informacion proporcionada; los resultados devueltos correspondian a un servicio de traduccion y no guardan relacion con el modelo.
