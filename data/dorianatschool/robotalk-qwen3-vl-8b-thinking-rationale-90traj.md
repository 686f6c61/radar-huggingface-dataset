# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-90traj

## Resumen

RoboTalk-Qwen3-VL-8B-Thinking-Rationale-90traj es un adaptador LoRA (PEFT) de una sola epoca construido sobre el modelo multimodal Qwen/Qwen3-VL-8B-Thinking y publicado por el usuario DorianAtSchool. No es un modelo autonomo: el repositorio contiene unicamente los pesos del adaptador (0,2 GB en safetensors) y requiere descargar por separado el modelo base y su procesador. El objetivo de entrenamiento es la generacion de una traza de razonamiento (rationale trace) seguida de una llamada a herramienta, dentro de un protocolo de coordinacion entre agentes.

El adaptador se ha afinado sobre el dataset RoboTalk, con 90 trayectorias por tarea de entrenamiento repartidas en 43 tareas (3.870 trayectorias en total) y 10 tareas reservadas para validacion. El escenario es un simulador de hogar en el que una unica politica compartida controla dos agentes con contextos parcialmente observables e independientes, siguiendo un protocolo coordinador-seguidor. Esto lo situa en la interseccion de vision-lenguaje, razonamiento multi-paso y sistemas multiagente.

Su relevancia actual radica en que demuestra que un ajuste LoRA relativamente ligero (rango 16) sobre un VLM de 8.000 millones de parametros puede alcanzar un 91,40% de exito sin errores en las tareas vistas, aunque la caida hasta el 66,00% en tareas retenidas evidencia una generalizacion limitada. Es, por tanto, material de investigacion sobre coordinacion de alto nivel, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (vision-lenguaje) |
| Parametros totales | 8.000 millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias de hasta 8.192 tokens, incluidos los tokens visuales |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite las cuantizaciones habituales de Qwen3-VL (no verificadas en esta ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | no asignada explicitamente para el adaptador; el modelo base Qwen3-VL se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors con pesos LoRA (libreria peft) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |
| Dataset de entrenamiento | DorianAtSchool/RoboTalk |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Thinking, un transformer multimodal que procesa imagenes y texto y que incorpora un modo de razonamiento explicito (thinking). El ajuste es un LoRA de rango 16, alpha 32 y dropout 0,05, aplicado exclusivamente al modelo de lenguaje: el autor indica explicitamente que la vision backbone no se ha afinado por separado. La prediccion objetivo es una traza de razonamiento seguida de una llamada a herramienta, y una unica politica compartida controla dos agentes con contextos parcialmente observables distintos bajo un protocolo coordinador-seguidor.

El entrenamiento consistio en una sola epoca con tasa de aprendizaje 1e-4, weight decay 0,01, schedule coseno y 3% de warmup, semilla 42, batch efectivo de 64 sobre cuatro GPU y limite de secuencia de 8.192 tokens incluyendo tokens visuales. El corpus cubre 90 trayectorias por tarea en 43 tareas (3.870 trayectorias) y otras 10 tareas quedan fuera del entrenamiento; segun el autor, los conjuntos a mayor escala contienen las selecciones de menor escala. No se documenta en la informacion disponible el uso de RLHF o DPO, ni innovaciones tecnicas adicionales mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa observaciones visuales junto con texto y produce una traza de razonamiento antes de actuar.
- Modo thinking: la evaluacion contempla una variante Thinking con presupuesto de salida de 2.048 tokens y otra Instruct con 256 tokens y temperatura 0.
- Tool calling / function calling: la salida del modelo es explicitamente una llamada a herramienta, siguiendo la plantilla de chat del modelo base para tool calling.
- Razonamiento multi-paso: la traza de razonamiento precede a la accion y puede encadenarse en episodios de multiples pasos.
- Coordinacion multiagente: una politica compartida gestiona dos agentes con historiales privados y contextos parcialmente observables bajo un protocolo coordinador-seguidor.
- Comprension de estado y objetivos de tarea: el modelo consume el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas y las observaciones visuales por agente.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).

## Casos de uso

- Investigacion en coordinacion multiagente: reproducir los episodios del benchmark RoboTalk para estudiar como una politica compartida reparte roles entre coordinador y seguidor con informacion parcial.
- Simulacion de tareas de hogar: ejecutar episodios en el simulador de hogar del dataset, donde el modelo decide la siguiente accion en funcion del estado simbolico y de las observaciones visuales.
- Evaluacion de tecnicas PEFT sobre VLMs: servir como referencia de cuanto rendimiento se obtiene de un LoRA de rango 16 y una epoca frente a un ajuste completo del modelo base.
- Estudio de generalizacion tarea a tarea: comparar el 91,40% en tareas de entrenamiento con el 66,00% en tareas retenidas para analizar sobreajuste a la cohorte de tareas.
- Generacion de trazas de razonamiento supervisadas: utilizar las salidas rationale + tool call como datos de destilacion o como baseline de razonamiento explicito en agentes.
- Prototipado de pipelines de tool calling multimodal: validar la integracion de un VLM con definiciones de herramientas en un bucle de decision cerrado antes de trasladarlo a un dominio distinto.
- Docencia y divulgacion: ejemplo reproducible de ajuste LoRA sobre Qwen3-VL con configuracion de entrenamiento documentada (learning rate, batch, semilla, warmup).

## Benchmarks y rendimiento

Evaluacion en bucle cerrado realizada por el autor: comunicacion completa, diez episodios por tarea, cohorte fija de 43 tareas de entrenamiento y 10 retenidas. El exito "sin errores" (FSM success) implica alcanzar el objetivo simbolico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95% sobre episodios.

| Split | Exitos sin error / episodios | Tasa de exito | Intervalo 95% |
|---|---:|---:|---:|
| Tareas de entrenamiento (in_training_tasks) | 393/430 | 91,40% | 88,36-93,69% |
| Tareas retenidas (held_out_tasks) | 66/100 | 66,00% | 56,28-74,54% |

Ajustes de inferencia empleados por el autor: variante Instruct con temperatura 0 y presupuesto de salida de 256 tokens; variante Thinking con temperatura 0,6, top-p 0,95, top-k 20 y presupuesto de 2.048 tokens. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras derivadas del tamano del modelo base, no confirmadas por el autor): en bf16, aproximadamente 16 GB solo de pesos mas el adaptador y el tower de vision; en cuantizacion de 8 bits, en torno a 10-12 GB; en 4 bits, en torno a 6-8 GB.
- El presupuesto de salida de 2.048 tokens del modo Thinking y los tokens visuales incrementan el uso de memoria de la cache KV respecto a un modelo solo de texto.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100); para cuantizacion 4/8 bits, GPU consumer de 12-16 GB pueden ser suficientes en funcion de la resolucion y el numero de imagenes por episodio.
- Cabe en GPU consumer: probablemente si, con cuantizacion, en tarjetas de 12 GB o superiores; la cifra exacta depende del numero de imagenes y del presupuesto de tokens, y no esta especificada en la informacion disponible.
- Opciones de despliegue: Transformers con soporte Qwen3-VL mas PEFT (flujo documentado por el autor); vLLM o TGI si admiten el modelo base con adaptadores LoRA; llama.cpp u Ollama solo si existe soporte GGUF para Qwen3-VL, extremo no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento uso cuatro GPU con batch efectivo 64 y secuencias de hasta 8.192 tokens, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Thinking-Rationale-90traj | 8.000 M (base) + LoRA r16 | Entrenado a 8.192 tokens | 91,40% en tareas vistas; 66,00% en retenidas (metrica propia de RoboTalk) | No asignada para el adaptador; base Apache-2.0 | Adaptador en HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Thinking (modelo base, sin adaptador) | 8.000 M | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Publico en HuggingFace |
| Otros adaptadores de robotica sobre VLMs de ~8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables entre este adaptador y alternativas de la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La licencia del adaptador no esta asignada de forma explicita en la model card; para uso comercial debe consultarse la licencia del modelo base (Apache-2.0) y aclararse la situacion del adaptador con el autor.
- La generalizacion es limitada: la tasa de exito cae del 91,40% en tareas vistas al 66,00% en las 10 tareas retenidas, una diferencia de mas de 25 puntos porcentuales.
- Los intervalos de confianza son intervalos de Wilson sobre episodios, no sobre tareas muestreadas nuevas, por lo que no deben interpretarse como variabilidad entre tareas.
- El exito FSM es una metrica simbolica: alcanzar el objetivo del automata no implica necesariamente satisfacer todos los criterios fisicos nativos del simulador.
- El modelo esta pensado para investigacion sobre coordinacion de alto nivel en un simulador de hogar; el autor lo desaconseja explicitamente para control directo de hardware o despliegues de seguridad critica.
- La reproduccion de las puntuaciones exige el objetivo de la tarea RoboTalk, el estado inicial, las definiciones globales de herramientas, las observaciones visuales y los historiales privados por agente, y el protocolo de comunicacion completo; un prompt de chat generico no basta.
- Los historiales no incluyen indices de paso, lo que condiciona el formato de las entradas.
- Idioma restringido al ingles; no se declara soporte multilingue.
- Al ser un adaptador LoRA, depende de la version concreta del modelo base y del procesador; cambios en Qwen3-VL pueden romper la compatibilidad.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de fidelidad de las trazas de razonamiento, solo del exito de la tarea.
- Sesgos conocidos: no disponibles.
- Los pesos se entrenaron unicamente sobre el modelo de lenguaje; el tower de vision conserva el comportamiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-90traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos sin relacion (informacion farmacologica) y se han descartado. No se dispone de paper, blog ni demo adicionales.
