# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-150traj

## Resumen

RoboTalk-Qwen3-VL-8B-Instruct-150traj es un adaptador LoRA publicado por el usuario DorianAtSchool sobre el modelo vision-language Qwen/Qwen3-VL-8B-Instruct. No es un modelo independiente: el repositorio, de 0,2 GB, contiene unicamente pesos de adaptador en safetensors que deben cargarse junto al modelo base mediante PEFT y Transformers con soporte de Qwen3-VL. El objetivo del ajuste es predecir la siguiente llamada a herramienta (next tool call) dentro de un protocolo de coordinacion coordinador-seguidor en el que una unica politica compartida controla dos agentes con contextos parcialmente observables y observaciones visuales separadas.

El entrenamiento se realizo durante una sola epoca sobre 150 trayectorias por tarea de entrenamiento, repartidas en 43 tareas (6.450 trayectorias en total), con 10 tareas adicionales reservadas para evaluacion. La evaluacion en bucle cerrado reporta un 94,19% de exitos sin errores en las tareas de entrenamiento (405/430 episodios) y un 65,00% en las tareas reservadas (65/100 episodios), lo que hace visible la brecha de generalizacion a tareas no vistas.

Su relevancia es de investigacion: sirve como referencia reproducible para estudiar coordinacion de alto nivel con modelos vision-language en un simulador domestico, y como punto de partida para escalar el numero de trayectorias. Esta limitado al ingles, no declara licencia propia para el adaptador y su model card restringe explicitamente el uso a investigacion, excluyendo el control directo de hardware o despliegues criticos para la seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-VL-8B-Instruct, modelo transformer vision-language; detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador (LoRA con rango 16 y alpha 32). Modelo base: aproximadamente 8.000 millones de parametros segun la denominacion Qwen3-VL-8B-Instruct |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto nativo. Limite de secuencia durante el entrenamiento: 8.192 tokens, incluyendo tokens visuales |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos de adaptador en safetensors (entrenados en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el adaptador. El modelo base Qwen se distribuye bajo Apache-2.0 segun la model card |
| Formato de pesos | Safetensors (adaptador LoRA consumible con PEFT) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | DorianAtSchool/RoboTalk |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct mediante LoRA con rango 16, alpha 32 y dropout 0,05. Segun la model card, el adaptador liberado contiene unicamente pesos LoRA del modelo de lenguaje, no una backbone visual ajustada por separado, por lo que la percepcion visual depende integramente de la representacion del modelo base. La politica aprendida es compartida entre dos agentes con historiales privados y observaciones visuales distintas, y el objetivo de prediccion es la siguiente llamada a herramienta; la reproduccion de resultados exige el objetivo de tarea, el estado inicial, las definiciones globales de herramientas, las observaciones por agente y el protocolo de comunicacion completo, no un prompt de chat generico.

Los hiperparametros declarados son: una epoca, tasa de aprendizaje 1e-4, weight decay 0,01, planificador coseno con 3% de warmup, tamano de lote efectivo 64 repartido en cuatro GPU, limite de secuencia de 8.192 tokens (incluyendo tokens visuales) y semilla 42. El conjunto de entrenamiento cubre 43 tareas con 150 trayectorias por tarea (6.450 trayectorias) y deja 10 tareas fuera. La model card indica que los conjuntos de mayor escala contienen las selecciones de menor escala, y que los estados del optimizador y las rutas de la maquina de entrenamiento no se incluyen; los ajustes completos estan en `training_config.json` y la pertenencia de tareas en `task_split.json`.

## Capacidades

- Prediccion de la siguiente llamada a herramienta: el modelo genera la accion inmediata dentro de un protocolo de herramientas definido globalmente.
- Tool calling en formato nativo de Qwen: la model card indica que debe usarse la plantilla de chat del modelo para el uso de herramientas.
- Coordinacion multiagente: una unica politica compartida controla dos agentes bajo un protocolo coordinador-seguidor.
- Razonamiento multi-paso: la politica opera sobre historiales privados de varios pasos, aunque los historiales no incluyen indices de paso.
- Percepcion vision-language: consume observaciones visuales y texto en la misma secuencia (pipeline image-text-to-text).
- Comunicacion entre agentes: la ejecucion completa incluye el protocolo de comunicacion entre los dos agentes, condicion necesaria para reproducir las puntuaciones.
- Ejecucion en dos configuraciones de inferencia: la model card distingue evaluacion Instruct (temperatura 0, presupuesto de salida de 256 tokens) y evaluacion Thinking (temperatura 0,6, top-p 0,95, top-k 20, presupuesto de 2.048 tokens).
- Multilingue: no disponible; la model card solo declara ingles.

## Casos de uso

- Investigacion en coordinacion multiagente: usar el adaptador como politica de referencia en un simulador domestico para estudiar protocolos coordinador-seguidor con contextos parcialmente observables y comparar con variantes entrenadas con mas trayectorias.
- Generacion de trayectorias sinteticas de tool calls: emplear el modelo para producir rollouts etiquetados que alimenten posteriores rondas de ajuste o filtrado de datos, dado que el objetivo de prediccion es exactamente la siguiente llamada a herramienta.
- Evaluacion de generalizacion a tareas no vistas: el desglose entre 94,19% en tareas vistas y 65,00% en tareas reservadas permite usar el modelo como banco de pruebas para medir transferencia y analizar modos de fallo.
- Prototipado de asistentes domesticos de alto nivel: integrar el adaptador en una arquitectura de agente que traduzca las llamadas predichas a un plan simbolico, manteniendo el control fisico fuera del modelo, tal como recomienda la model card.
- Estudio de robustez de protocolos de comunicacion: variar el protocolo o la informacion compartida entre agentes y medir el impacto en el exito de tarea sin errores (metrica FSM), un escenario experimental directo con este adaptador.
- Punto de partida para ajuste incremental: iniciar desde estos pesos LoRA (rango 16, semilla 42) para entrenar variantes con mas trayectorias por tarea o con tareas adicionales, aprovechando que los conjuntos de mayor escala contienen las selecciones menores.
- Reproduccion de experimentos: reejecutar la evaluacion en bucle cerrado con cohorte fija de 43/10 tareas, temperatura 0 y presupuesto de 256 tokens para verificar las cifras publicadas.

## Benchmarks y rendimiento

Evaluacion en bucle cerrado declarada por el autor, con comunicacion completa, diez episodios por tarea y muestreo fijo de cohortes nativas 43/10. El exito sin errores (FSM) implica alcanzar el objetivo simbolico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95% sobre episodios, no sobre tareas remuestreadas.

| Split | Exitos sin errores / episodios | Tasa de exito | Intervalo del 95% |
|---|---:|---:|---:|
| in_training_tasks | 405/430 | 94,19% | 91,56–96,03% |
| held_out_tasks | 65/100 | 65,00% | 55,25–73,64% |

Los recuentos exactos y los ajustes de evaluacion estan en `evaluation_results.json`. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, sobre el modelo base de ~8.000 millones de parametros mas el adaptador): aproximadamente 16-18 GB en bfloat16, 9-10 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits, mas el coste de la cache KV segun la longitud de contexto efectiva.
- GPU recomendadas: A100 (40 o 80 GB) y H100 (80 GB) para bfloat16 sin cuantizar con secuencias largas; A10G/L4 (24 GB) o RTX 4090 (24 GB) para bfloat16 con presupuestos de secuencia moderados.
- Viabilidad en GPU de consumo: si en tarjetas de 24 GB (RTX 3090, RTX 4090) en bfloat16 o 8 bits, y en tarjetas de 16 GB con cuantizacion de 8 o 4 bits. No cabe en GPU de 8 GB.
- Opciones de despliegue: Transformers con PEFT es la ruta documentada explicitamente por el autor (ejemplo oficial con `AutoProcessor`, `Qwen3VLForConditionalGeneration` y `PeftModel`). El soporte de Qwen3-VL combinado con adaptadores en otros servidores (vLLM, TGI, llama.cpp, Ollama) no esta documentado en la informacion proporcionada y debe verificarse por versión.
- Latencia y throughput: no disponibles. La evaluacion publicada usa presupuestos de salida de 256 tokens (Instruct) y 2.048 tokens (Thinking), con 10 episodios por tarea, pero no se declaran tiempos.
- Hardware de entrenamiento: no disponible; solo se indica un lote efectivo de 64 repartido en cuatro GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Instruct-150traj | Adaptador LoRA; base ~8.000 millones | No disponible (entrenamiento a 8.192 tokens) | 94,19% en tareas vistas y 65,00% en reservadas (exito FSM en bucle cerrado) | No disponible para el adaptador; base Apache-2.0 | Publicado en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8.000 millones | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Publico en HuggingFace |
| Otras variantes RoboTalk con mas trayectorias por tarea | No disponible | No disponible | No disponible | No disponible | Mencionadas de forma implicita en la model card; identificadores y resultados no disponibles |

No se dispone de datos comparativos frente a otros adaptadores de coordinacion multiagente o frente a politicas especializadas en simuladores domesticos; no disponible.

## Limitaciones y advertencias

- Ambito restringido: la model card indica que el modelo es para investigacion sobre coordinacion de alto nivel en un simulador domestico, no para control directo de hardware ni despliegues criticos para la seguridad.
- Metrica de exito simbolica: el exito FSM mide alcanzar el objetivo simbolico sin llamadas rechazadas y puede no implicar el cumplimiento de todos los criterios fisicos nativos.
- Brecha de generalizacion: la tasa de exito cae del 94,19% en tareas de entrenamiento al 65,00% en tareas reservadas, con un intervalo del 65,00% que llega hasta el 73,64%; no debe asumirse rendimiento similar en tareas nuevas.
- Dependencia del prompt: reproducir las puntuaciones exige el objetivo de tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente y el protocolo de comunicacion completo; un prompt de chat generico no es suficiente.
- Historiales sin indices de paso: los historiales no incluyen indices de paso, lo que puede limitar la inferencia de orden temporal en contextos largos.
- Sin backbone visual ajustada: el adaptador solo contiene pesos LoRA del modelo de lenguaje, por lo que la percepcion visual no se ha especializado.
- Idioma: solo ingles declarado; no hay evidencia de capacidades multilingues.
- Licencia: la model card no asigna una licencia propia al adaptador, lo que es un riesgo juridico para uso comercial. El modelo base se rige por Apache-2.0.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; al predecir llamadas a herramienta, una salida incorrecta puede ser rechazada por el controlador y romper la metrica de exito sin errores.
- Adopcion minima: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-150traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo; el unico resultado devuelto (https://reiseplanung.de/) es un planificador de rutas sin relacion con el modelo.
