# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-150traj

## Resumen

RoboTalk-Qwen3-VL-8B-Thinking-Rationale-150traj es un adaptador LoRA de una sola epoca publicado por el usuario DorianAtSchool sobre el modelo base Qwen/Qwen3-VL-8B-Thinking. No es un modelo autonomo: el repositorio contiene unicamente los pesos del adaptador (0,2 GB, formato safetensors, libreria PEFT) y requiere descargar el modelo y el procesador de Qwen para poder ejecutarse. Su proposito es el entrenamiento e investigacion en coordinacion multi-agente de alto nivel dentro de un simulador domestico, prediciendo una traza de razonamiento (rationale) seguida de una llamada a herramienta.

El adaptador se entreno sobre 150 trayectorias por tarea de entrenamiento repartidas en 43 tareas (6.450 trayectorias en total), con diez tareas adicionales reservadas para validacion. Una unica politica compartida controla dos agentes con contextos parcialmente observables separados y un protocolo coordinador-seguidor. El modelo base aporta la parte de vision-lenguaje y el modo de razonamiento extendido (thinking) de la familia Qwen3-VL, de 8.000 millones de parametros.

Su relevancia actual es acotada y muy especializada: sirve como referencia metodologica para evaluar coordinacion multi-agente con observabilidad parcial y uso de herramientas en entornos simulados, y publica una evaluacion en bucle cerrado con intervalos de confianza, algo poco habitual en adaptadores LoRA de investigacion. No esta pensado para control de hardware real ni para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-8B-Thinking del tipo image-text-to-text |
| Parametros totales | 8.000 millones en el modelo base; el adaptador no declara su numero de parametros entrenables (rango LoRA 16, alpha 32, dropout 0.05, solo pesos del modelo de lenguaje) |
| Parametros activos | no aplica (el modelo base no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; la secuencia de entrenamiento se limito a 8.192 tokens incluyendo tokens visuales |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; la model card indica que no asigna una licencia propia al adaptador y que el modelo base Qwen se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA para PEFT); requiere el modelo base Qwen/Qwen3-VL-8B-Thinking |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-text |
| Dataset de entrenamiento | DorianAtSchool/RoboTalk |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre el modelo de lenguaje del base Qwen3-VL-8B-Thinking, que es un transformer multimodal de 8.000 millones de parametros capaz de procesar imagenes y texto y de operar en modo thinking con presupuesto de tokens de salida ampliado. Segun la model card, el adaptador liberado contiene pesos LoRA del modelo de lenguaje y no incluye una backbone de vision ajustada por separado, por lo que las capacidades visuales proceden integramente del modelo base sin modificar.

El entrenamiento consistio en una sola epoca con tasa de aprendizaje 1e-4, weight decay 0,01, scheduler coseno y un 3% de warmup. Se uso rango LoRA 16, alpha 32 y dropout 0,05, con batch efectivo de 64 repartido en cuatro GPU y un limite de secuencia de 8.192 tokens incluyendo los tokens visuales. La semilla fue 42. El objetivo de prediccion es una traza de razonamiento seguida de una llamada a herramienta, y una unica politica compartida controla dos agentes con contextos parcialmente observables y un protocolo coordinador-seguidor. Se entrenaron 150 trayectorias por tarea en 43 tareas (6.450 trayectorias), dejando diez tareas fuera del entrenamiento; los conjuntos de mayor escala contienen las selecciones de menor escala. Los ajustes saneados estan en `training_config.json` y la pertenencia de tareas en `task_split.json`.

## Capacidades

- Generacion de trazas de razonamiento (rationale) seguidas de llamadas a herramientas en un formato estructurado, no solo texto libre.
- Razonamiento multimodal: procesa observaciones visuales por agente ademas de contexto textual, heredado del base Qwen3-VL.
- Coordinacion multi-agente: una sola politica compartida opera dos agentes con historiales privados y contextos parcialmente observables.
- Protocolo coordinador-seguidor con comunicacion explicita entre agentes dentro del simulador.
- Modo thinking con presupuesto de salida ampliado (hasta 2.048 tokens en la evaluacion del autor) y modo instruct de respuesta directa.
- Tool calling: el autor indica que debe usarse la plantilla de chat del modelo para llamadas a herramientas.
- Tareas de manipulacion y navegacion de alto nivel en un simulador domestico (objetivo simbolico FSM).
- Capacidad multilingue: solo ingles (en) segun los metadatos del repositorio.

## Casos de uso

- Investigacion en coordinacion multi-agente: reproduccion de los experimentos de RoboTalk con dos agentes de observabilidad parcial y un protocolo coordinador-seguidor, usando las tareas de `task_split.json` para separar entrenamiento y validacion.
- Evaluacion de destilacion de trazas de razonamiento: analisis de como un modelo de 8B aprende a emitir una rationale antes de una llamada a herramienta, comparando la tasa de exito en bucle cerrado frente al modelo base sin adaptador.
- Estudio de generalizacion fuera de distribucion: el corte de 43 tareas de entrenamiento frente a 10 retenidas (92,56% frente a 73,00% de exito sin errores) sirve como caso de medida de sobreajuste a tareas concretas.
- Generacion de datos sinteticos de trayectorias: uso del adaptador para producir nuevas trazas rationale-tool call sobre el simulador y ampliar el dataset RoboTalk, siempre con validacion posterior en el entorno.
- Prototipado de agentes con tool calling sobre observaciones visuales: el adaptador ilustra como integrar percepcion visual y seleccion de herramientas en un bucle multi-paso con Transformers y PEFT.
- Ensayo de esquemas de prompt y formatos de historial: dado que las historias no incluyen indices de paso y la reproduccion exige el objetivo de la tarea, el estado inicial y las definiciones globales de herramientas, resulta util para probar variantes de empaquetado de contexto en agentes.
- Base para experimentos de adaptacion de bajo rango: la configuracion publicada (rango 16, alpha 32, una epoca, lr 1e-4) sirve como punto de partida reutilizable para adaptar Qwen3-VL-8B-Thinking a otros dominios con recursos limitados.

## Benchmarks y rendimiento

El autor publica una evaluacion en bucle cerrado con comunicacion completa, diez episodios por tarea y muestreo nativo de cohortes fijas de 43 tareas de entrenamiento y 10 retenidas. El exito sin errores segun la FSM implica alcanzar el objetivo simbolico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95% sobre episodios, no sobre tareas nuevas.

| Split | Exitos sin errores / episodios | Tasa de exito | Intervalo 95% |
|---|---:|---:|---:|
| in_training_tasks | 398/430 | 92,56% | 89,68–94,68% |
| held_out_tasks | 73/100 | 73,00% | 63,57–80,73% |

Los ajustes de inferencia declarados son temperatura 0 y presupuesto de salida de 256 tokens para la evaluacion en modo instruct, y temperatura 0,6, top-p 0,95, top-k 20 y presupuesto de 2.048 tokens para la evaluacion en modo thinking. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 0,2 GB para el adaptador, mas el modelo base Qwen3-VL-8B-Thinking completo en el formato elegido.
- VRAM estimada: en bfloat16 el modelo base de 8B ronda los 16 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 4 bits el conjunto suele situarse en torno a 5-7 GB, aunque no hay cifras confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del base encajan GPU de 24 GB (RTX 3090, RTX 4090) o superiores (A100 40/80 GB, H100), y con cuantizacion puede intentarse en GPU consumer de 12-16 GB.
- Cabe en GPU consumer: probable en RTX 4090 con el base cuantizado o en bfloat16 si se acepta poco margen; no confirmado en la informacion disponible.
- El autor entreno con cuatro GPU y batch efectivo 64, senal de que el entrenamiento completo si exige hardware de varios aceleradores.
- Opciones de despliegue: Transformers con soporte de Qwen3-VL mas PEFT, tal como muestra el ejemplo de la model card (`AutoProcessor`, `Qwen3VLForConditionalGeneration`, `PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. En la evaluacion se usaron presupuestos de salida de 256 tokens (instruct) y 2.048 tokens (thinking), lo que implica una latencia notablemente mayor en modo thinking.
- Nota de reproduccion: los resultados solo se replican con el objetivo de la tarea, el estado inicial, las definiciones de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completos; un prompt de chat generico no basta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Thinking-Rationale-150traj | 8B (base) + adaptador LoRA | no disponible; entrenamiento a 8.192 tokens | 92,56% en tareas de entrenamiento y 73,00% en retenidas (metrica FSM propia) | no disponible para el adaptador; base Apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3-VL-8B-Thinking (modelo base sin adaptar) | 8B | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | HuggingFace |
| Otros adaptadores LoRA de robotica multi-agente | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparables publicados para alternativas de la misma categoria en la informacion proporcionada. La unica comparacion fiable que puede establecerse es contra el modelo base, y el autor no reporta la linea base sin adaptador, por lo que no es posible cuantificar la mejora atribuible al LoRA.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador PEFT que requiere el modelo y el procesador de Qwen/Qwen3-VL-8B-Thinking, y falla si se carga solo.
- Licencia no disponible: la model card indica explicitamente que no asigna una licencia separada al adaptador. Antes de cualquier uso, hay que consultar los terminos del repositorio del modelo base (Apache-2.0) y del dataset.
- Uso previsto restringido a investigacion sobre coordinacion de alto nivel en un simulador domestico; el propio autor lo excluye para control directo de hardware o despliegues criticos para la seguridad.
- El exito FSM es una metrica simbolica: no implica necesariamente el cumplimiento de todos los criterios fisicos nativos del entorno.
- Brecha de generalizacion notable: la tasa de exito cae del 92,56% en tareas vistas al 73,00% en tareas retenidas, con un intervalo de confianza que llega hasta el 63,57%.
- Sesgo de cohorte: los intervalos son intervalos de Wilson sobre episodios, no sobre tareas remuestreadas, por lo que no capturan variabilidad entre tareas.
- Idioma: solo ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Reproducibilidad fragil: los resultados dependen del objetivo de la tarea, estado inicial, definiciones de herramientas, observaciones visuales, historiales privados y protocolo completo; los historiales no incluyen indices de paso.
- Ajustes de inferencia distintos entre variantes (instruct con temperatura 0 y 256 tokens; thinking con temperatura 0,6, top-p 0,95 y top-k 20 con 2.048 tokens), lo que impide comparar las cifras sin tener en cuenta el modo.
- Riesgo de alucinacion no cuantificado: no se han publicado tasas de llamadas erroneas, invalidas o alucinadas mas alla de la metrica de llamadas rechazadas integrada en el exito sin errores.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin validacion externa ni replicaciones independientes conocidas.
- Los conjuntos de mayor escala contienen las selecciones de menor escala, lo que hay que tener en cuenta al comparar tamanos de dataset; los estados del optimizador y las rutas de la maquina de entrenamiento no se incluyen.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-150traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base Qwen3-VL-8B-Thinking: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
