# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-60traj

## Resumen

RoboTalk-Qwen3-VL-8B-Thinking-Rationale-60traj es un adaptador LoRA (PEFT, rank 16, alpha 32) entrenado sobre el modelo vision-language Qwen/Qwen3-VL-8B-Thinking. Lo publica el usuario DorianAtSchool y su objetivo es convertir el modelo base en una politica capaz de emitir primero una traza de razonamiento (rationale) y despues una llamada a herramienta (tool call), dentro del entorno de simulacion doméstica RoboTalk. No es un modelo independiente: el repositorio solo contiene los pesos del adaptador (0,2 GB) y requiere descargar el modelo base por separado.

El entrenamiento se hizo con una sola epoca sobre 60 trayectorias por tarea en 43 tareas, lo que suma 2.580 trayectorias, dejando 10 tareas completamente fuera para evaluacion. La particularidad del diseno es que una unica politica compartida controla dos agentes con contextos parcialmente observables y un protocolo de comunicacion coordinador-seguidor; la salida esperada combina razonamiento explicito y accion simbolica.

Su relevancia actual es acotada y muy especifica: sirve como caso de estudio reproducible de adaptacion de un VLM de 8.000 millones de parametros a tareas de coordinacion multiagente con observaciones visuales, y como punto de partida para investigacion en imitacion de trazas de razonamiento. Las cifras publicadas (84,65% de exito sin errores en tareas vistas y 72,00% en tareas no vistas, medidas sobre el modelo de estados finitos) indican generalizacion parcial al conjunto retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language heredada de Qwen3-VL-8B-Thinking, con adaptador LoRA acoplado al modelo de lenguaje (no al backbone visual) |
| Parametros totales | 8.000 millones aproximadamente en el modelo base; el adaptador anade pesos LoRA de rank 16 sobre el LM |
| Longitud de contexto | no disponible en la ficha del adaptador; el entrenamiento uso un limite de secuencia de 8.192 tokens incluyendo tokens visuales |
| Tipos de cuantizacion | no disponible (adaptador distribuido en safetensors; la cuantizacion depende del modelo base y no se documenta) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para el adaptador; el modelo base Qwen3-VL-8B-Thinking se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Thinking, un transformer vision-language que acepta imagen y texto como entrada (`image-text-to-text`) y que dispone de un modo de razonamiento explicito (Thinking). El LoRA se inserta unicamente en el modelo de lenguaje: la model card indica explicitamente que el adaptador contiene pesos LoRA del LM y no un backbone visual afinado por separado. El entrenamiento fue de una sola epoca con learning rate 1e-4, weight decay 0,01, schedule coseno y 3% de warmup; LoRA con rank 16, alpha 32 y dropout 0,05; batch efectivo de 64 en cuatro GPU y semilla 42. Los datos son trayectorias del dataset RoboTalk: 43 tareas de entrenamiento con 60 trayectorias cada una (2.580 en total) y 10 tareas retenidas.

La innovacion principal no esta en la arquitectura, sino en el formato de supervision y en el protocolo: el objetivo de prediccion es una traza de rationale seguida de una tool call, y una misma politica compartida gobierna dos agentes con contextos privados parcialmente observables bajo un esquema coordinador-seguidor. La reproduccion de los resultados exige aportar el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales y los historiales privados de cada agente, ademas del protocolo de comunicacion completo; los historiales no incluyen indices de paso. Los ajustes de inferencia difieren entre variantes: la evaluacion en modo Instruct usa temperatura 0 y 256 tokens de salida, mientras que la evaluacion en modo Thinking usa temperatura 0,6, top-p 0,95, top-k 20 y 2.048 tokens de salida.

## Capacidades

- Generacion de trazas de razonamiento seguidas de una llamada a herramienta, que es el objetivo de entrenamiento explicito del adaptador.
- Tool calling mediante la plantilla de chat del modelo base, con definiciones globales de herramientas aportadas en el prompt.
- Coordinacion multiagente: una unica politica compartida que emite acciones para dos agentes con contextos parcialmente observables y protocolo coordinador-seguidor.
- Comprension de observaciones visuales del simulador (entrada de imagen y texto), sin backbone visual afinado.
- Razonamiento en modo Thinking con presupuesto de salida de hasta 2.048 tokens, segun la configuracion de evaluacion publicada.
- Ejecucion de tareas simbolicas de tipo FSM en un simulador doméstico, con criterio de exito basado en alcanzar el objetivo sin llamadas rechazadas.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de audio, generacion de imagen ni control directo de hardware.

## Casos de uso

- Investigacion en coordinacion multiagente: el adaptador esta disenado para reproducir el protocolo coordinador-seguidor de RoboTalk, de modo que un laboratorio puede estudiar como una politica compartida gestiona contextos privados distintos sin entrenar dos modelos separados.
- Generacion de datos de razonamiento para destilacion: las trazas de rationale producidas pueden filtrarse y reutilizarse como supervision para modelos menores, ya que el formato de salida (rationale + tool call) es directamente parseable.
- Evaluacion de generalizacion por tarea: con 10 tareas retenidas y 10 episodios por tarea, el modelo sirve para medir transferencia a objetivos no vistos (72,00% de exito sin errores en el conjunto held-out) frente a tareas vistas (84,65%).
- Prototipado de agentes con vision en simulador: permite iterar sobre esquemas de observacion visual y de historial privado antes de trasladar el diseno a un entorno fisico.
- Reproduccion de experimentos y auditoria de hiperparametros: la configuracion de entrenamiento esta publicada en `training_config.json` y la pertenencia de tareas en `task_split.json`, lo que facilita replicar el ajuste con LoRA rank 16, alpha 32 y 8.192 tokens de secuencia.
- Analisis de fallos de tool calling: al exigir cero llamadas rechazadas para contar un exito, el modelo es util para estudiar modos de fallo en la seleccion de herramientas dentro de un bucle cerrado.
- Docencia y practicas de ajuste fino: el repositorio pesa 0,2 GB y se carga con `transformers` + `peft`, lo que lo hace manejable como ejemplo didactico de adaptacion de un VLM de 8B con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). La unica evaluacion publicada es de bucle cerrado sobre el simulador, con comunicacion completa, diez episodios por tarea y muestreo nativo de cohorte fija de 43/10 tareas. La metrica "error-free FSM success" exige alcanzar el objetivo simbolico sin llamadas rechazadas.

| Metrica | Split | Resultado | Intervalo 95% (Wilson) |
|---|---|---|---|
| Exito FSM sin errores | in_training_tasks | 364/430 = 84,65% | 80,94–87,75% |
| Exito FSM sin errores | held_out_tasks | 72/100 = 72,00% | 62,51–79,86% |

Los intervalos son intervalos de Wilson sobre episodios, no sobre tareas remuestreadas. Los recuentos exactos y los ajustes de evaluacion estan en `evaluation_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de 8.000 millones de parametros del modelo base; no publicada por el autor): en bfloat16, del orden de 20-24 GB contando pesos, cache KV, activaciones y codificador visual; en 8 bits, del orden de 9-11 GB; en 4 bits, del orden de 5-7 GB. El adaptador LoRA en si anade una fraccion minima de peso.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bfloat16 sin cuantizar; RTX 4090 (24 GB) para bfloat16 ajustado o FP8; RTX 3090/4080 por encima de 16 GB para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4-8 bits, en tarjetas de 12-16 GB o superiores (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090). En bfloat16 completo, 24 GB es el minimo practico.
- Opciones de despliegue: la ruta documentada es `transformers` con soporte Qwen3-VL mas `peft` (`AutoProcessor`, `Qwen3VLForConditionalGeneration`, `PeftModel`) y `device_map="auto"`. Tambien son viables servidores con soporte de adaptadores LoRA, como vLLM o TGI, siempre que soporten la arquitectura Qwen3-VL; en llama.cpp/Ollama habria que convertir y fusionar el adaptador, algo no documentado en la ficha.
- Latencia y throughput: no disponibles. Como referencia indirecta, la evaluacion en modo Thinking emplea hasta 2.048 tokens de salida por episodio con temperatura 0,6, lo que implica un coste de generacion notablemente superior al del modo Instruct (256 tokens, temperatura 0).
- Entrenamiento: una epoca con batch efectivo de 64 sobre cuatro GPU y secuencias de 8.192 tokens incluyendo tokens visuales.

## Comparativa con modelos similares

No se dispone de datos de otros adaptadores comparables de la misma categoria (politicas vision-language para coordinacion multiagente) en la informacion proporcionada. La comparacion posible se limita al propio modelo base y a sus variantes de inferencia citadas en la model card.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Thinking-Rationale-60traj (este adaptador) | ~8B en el base + LoRA rank 16 | no disponible (entrenado con 8.192 tokens) | 84,65% in-training / 72,00% held-out (exito FSM sin errores) | no disponible para el adaptador; base Apache-2.0 | HuggingFace, 0,2 GB, 0 descargas, 0 likes |
| Qwen/Qwen3-VL-8B-Thinking (modelo base sin adaptar) | ~8B | no disponible en esta informacion | no disponible | Apache-2.0 | HuggingFace |
| Otros adaptadores o politicas de coordinacion multiagente | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere `Qwen/Qwen3-VL-8B-Thinking` y su procesador, ademas de `peft`.
- Ambito de uso declarado: investigacion sobre coordinacion de alto nivel en un simulador doméstico. No esta pensado para control directo de hardware ni para despliegues criticos para la seguridad.
- La metrica de exito es simbolica (FSM): alcanzar el objetivo sin llamadas rechazadas no implica que se cumplan todos los criterios fisicos nativos de la tarea.
- Los resultados solo se reproducen si se aportan el objetivo de la tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo; un prompt de chat generico no basta. Los historiales no incluyen indices de paso.
- Degradacion clara en tareas no vistas: 72,00% frente a 84,65%, con intervalos que no se solapan.
- Los intervalos publicados son de Wilson sobre episodios, no sobre tareas remuestreadas, por lo que la incertidumbre respecto a nuevas tareas es mayor de lo que sugieren las cifras.
- Idiomas: solo ingles declarado; no hay evidencia de comportamiento multilingue.
- Riesgo de alucinacion y de llamadas a herramientas invalidas: el propio criterio de evaluacion penaliza las llamadas rechazadas, lo que sugiere que ocurren.
- Licencia del adaptador no especificada en la model card, que tampoco asigna una licencia separada; para uso comercial hay que atenerse a los terminos del modelo base (Apache-2.0) y confirmar la situacion del adaptador con el autor.
- Sesgos: no documentados, pero el entrenamiento se limita a 43 tareas de un unico simulador, por lo que el modelo hereda las limitaciones de ese dominio y de ese reparto de tareas.
- Entrenamiento de una sola epoca: el ajuste es ligero y el adaptador no modifica el backbone visual, de modo que los errores de percepcion del modelo base persisten.
- Los metadatos del repositorio indican fecha de creacion y actualizacion de 2026-09-15, valor que conviene verificar por si fuera un error de registro.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-60traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base Qwen3-VL-8B-Thinking: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a Colt Technology Services y no guardan relacion con el adaptador.
