# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-90traj

## Resumen

RoboTalk-Qwen3-VL-8B-Instruct-90traj es un adaptador LoRA de una sola epoca, no un modelo independiente, publicado por el usuario DorianAtSchool. Se construye sobre Qwen/Qwen3-VL-8B-Instruct y su objetivo de prediccion es la siguiente llamada a herramienta (next tool call) dentro del simulador de tareas domesticas RoboTalk. La politica aprendida es unica y compartida: controla dos agentes con contextos parcialmente observables y separados que siguen un protocolo coordinador-seguidor.

El entrenamiento cubre 90 trayectorias por tarea en 43 tareas (3.870 trayectorias en total), con diez tareas adicionales reservadas para evaluacion. Se trata de un adaptador de vision-lenguaje orientado a investigacion en coordinacion multiagente de alto nivel, y su relevancia actual radica en el creciente interes por politicas que emiten llamadas a herramientas en entornos con observabilidad parcial, mas que en control de bajo nivel.

Los pesos publicados corresponden unicamente a la parte de lenguaje del modelo base (no se ha ajustado la torre de vision). La evaluacion en bucle cerrado reporta una tasa de exito sin errores del 92,09 % en tareas vistas y del 55,00 % en tareas reservadas, lo que evidencia una generalizacion limitada fuera de la distribucion de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) con adaptador LoRA de PEFT; no es un MoE |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-8B-Instruct tiene aproximadamente 8.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE). El numero exacto de parametros entrenables del LoRA no esta disponible; la configuracion es rank 16, alpha 32 |
| Longitud de contexto | No disponible para el modelo final. La configuracion de entrenamiento limito las secuencias a 8.192 tokens, tokens visuales incluidos |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos de adaptador en safetensors sin cuantizar; la cuantizacion se aplicaria al modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el adaptador; el modelo base se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); requiere descargar por separado el modelo base y su procesador |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer vision-lenguaje que procesa observaciones visuales e historiales de texto. La innovacion del trabajo no esta en la arquitectura, sino en el protocolo: una unica politica compartida atiende a dos agentes con contextos parcialmente observables independientes y una comunicacion coordinador-seguidor. Los pesos liberados son LoRA de la parte de lenguaje, de modo que la torre de vision conserva los pesos originales del modelo base.

El entrenamiento consistio en una epoca con tasa de aprendizaje 1e-4, weight decay 0.01, schedule coseno y un 3 % de warmup. Los hiperparametros LoRA son rank 16, alpha 32 y dropout 0.05, con batch efectivo de 64 repartido en cuatro GPU y un limite de secuencia de 8.192 tokens (visuales incluidos). Se fijo la semilla 42 y los conjuntos de mayor escala contienen las selecciones de menor escala. La configuracion saneada esta en `training_config.json` y la pertenencia de tareas en `task_split.json`; los estados del optimizador y las rutas de la maquina de entrenamiento no se incluyen. No se indica en la informacion disponible el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Prediccion de la siguiente llamada a herramienta dentro de un flujo de dialogo con plantilla de chat del modelo base.
- Razonamiento multi-paso en el sentido de encadenar llamadas a herramientas hasta alcanzar un objetivo simbolico.
- Coordinacion multiagente: una sola politica gobierna dos agentes con historiales privados y observaciones visuales distintas.
- Cumplimiento de un protocolo de comunicacion coordinador-seguidor, con llamadas potencialmente rechazadas por la maquina de estados.
- Comprension de entradas imagen-texto heredada del modelo base Qwen3-VL-8B-Instruct (observaciones visuales por agente).
- Soporte de la plantilla de tool calling del modelo base.
- Modos de inferencia instruct y thinking heredados del modelo base, evaluados con configuraciones de muestreo distintas.
- Capacidad multilingue no acreditada: el unico idioma declarado es el ingles.

## Casos de uso

- Investigacion en coordinacion multiagente: reproducir el protocolo coordinador-seguidor con contextos parcialmente observables para estudiar como una politica unica reparte tareas entre dos agentes.
- Prediccion de llamadas a herramientas en entornos simulados: usar el adaptador como modulo de decision que emite la proxima accion en formato de tool call dado un objetivo y un estado inicial.
- Evaluacion de generalizacion fuera de distribucion: las diez tareas reservadas permiten medir la caida de rendimiento al pasar de tareas vistas (92,09 %) a no vistas (55,00 %).
- Estudio de la brecha entre exito simbolico y exito fisico: la propia model card advierte de que el exito de la maquina de estados no implica cumplir todos los criterios fisicos nativos del simulador, lo que lo hace util para analizar esa discrepancia.
- Comparacion de modos de inferencia: el repositorio documenta configuraciones distintas para los modos instruct (temperatura 0, 256 tokens de salida) y thinking (temperatura 0,6, top-p 0,95, top-k 20, 2.048 tokens), lo que permite estudiar su impacto en tareas de planificacion.
- Base para experimentos de ablation en LoRA: al ser un adaptador de rank 16 y alpha 32 sobre un modelo publico, sirve como punto de partida reproducible para variar escalas de datos (el autor indica que los conjuntos mayores contienen las selecciones menores).
- Analisis de politicas con historiales parcialmente observables: el adaptador predice acciones a partir de historiales privados sin indices de paso, un escenario habitual en investigacion sobre agentes.
- Prototipado academico de asistentes domesticos de alto nivel, siempre en simulacion y nunca como control directo de hardware.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion en bucle cerrado con comunicacion completa, diez episodios por tarea y muestreo nativo de cohorte fija. La metrica de exito sin errores exige alcanzar el objetivo simbolico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95 % sobre episodios, no sobre tareas remuestreadas.

| Split | Exitos sin errores / episodios | Tasa de exito | Intervalo 95 % |
|---|---:|---:|---:|
| in_training_tasks | 396/430 | 92,09 % | 89,15–94,29 % |
| held_out_tasks | 55/100 | 55,00 % | 45,24–64,39 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden del checkpoint de una epoca y de las selecciones de cohorte corregidas, y los detalles exactos estan en `evaluation_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse del modelo base de 8.000 millones de parametros mas el adaptador, en bfloat16 se necesitan aproximadamente 16-17 GB solo para pesos, y del orden de 20-24 GB contando activaciones y cache KV (estimacion derivada del tamano del modelo base; no publicada por el autor).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 6-8 GB para los pesos, aunque el repositorio no documenta cuantizaciones probadas.
- GPU recomendadas: A100, H100 o L40S para reproducir la evaluacion con margen; el entrenamiento se realizo con batch efectivo 64 en cuatro GPU.
- GPU de consumo: una RTX 4090 (24 GB) deberia poder ejecutar el modelo base en bfloat16 con margen ajustado; tarjetas de 12-16 GB requeririan cuantizacion.
- El limite de secuencia del entrenamiento fue de 8.192 tokens (visuales incluidos), por lo que secuencias mas largas no estan respaldadas por el proceso de ajuste.
- Opciones de despliegue: Transformers con soporte para Qwen3-VL y PEFT es la ruta documentada. No se documentan integraciones oficiales con vLLM, TGI, llama.cpp u Ollama para este adaptador.
- Latencia y throughput: no disponibles.
- Nota sobre recursos: el repositorio ocupa 0,2 GB, coherente con un adaptador LoRA; el modelo base debe descargarse aparte.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada adaptadores comparables de robotica multiagente con los que contrastar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Instruct-90traj | Base de ~8.000 M, adaptador LoRA rank 16 | No disponible (entrenado a 8.192 tokens) | 92,09 % en tareas vistas; 55,00 % en reservadas (exito FSM) | No disponible para el adaptador; Apache-2.0 en el base | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8.000 M | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Otros adaptadores de robotica comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3-VL-8B-Instruct y su procesador, ademas de PEFT y una version de Transformers con soporte para Qwen3-VL.
- La reproducibilidad de las puntuaciones exige el objetivo de la tarea RoboTalk, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicacion completo. Un prompt de chat generico no reproduce los resultados.
- Los historiales no incluyen indices de paso, un detalle relevante para cualquier intento de reutilizar el adaptador fuera de RoboTalk.
- Caida acusada de generalizacion: del 92,09 % en tareas de entrenamiento al 55,00 % en tareas reservadas; el intervalo del segundo caso (45,24–64,39 %) es amplio y se calcula sobre episodios, no sobre tareas nuevas.
- El exito FSM es una metrica simbolica y no implica necesariamente satisfacer todos los criterios fisicos nativos del simulador.
- Uso previsto exclusivamente para investigacion en coordinacion de alto nivel dentro de un simulador domestico; no para control directo de hardware ni despliegues criticos para la seguridad.
- Solo se declara ingles; no hay capacidades multilingues acreditadas.
- La licencia del adaptador no esta especificada: la model card indica que no se asigna una licencia separada, por lo que la reutilizacion comercial del adaptador queda sin cobertura clara. La licencia Apache-2.0 corresponde al modelo base.
- Riesgo de sesgos y de alucinacion de llamadas a herramientas: no se documenta ninguna evaluacion de sesgo ni de robustez frente a entradas fuera de distribucion.
- No se han publicado mediciones de latencia, throughput ni requisitos de VRAM verificados.
- La informacion disponible no incluye numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.
- Los metadatos del repositorio muestran una fecha de creacion de 2026-09-15, posterior a la fecha de actualizacion declarada; conviene verificar esta incoherencia antes de citar el repositorio.
- Estado de adopcion nulo segun los metadatos consultados (0 descargas, 0 likes), sin validacion independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Instruct-90traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos corresponden a un foro de banca en neerlandes y no guardan ninguna relacion con el modelo, el dataset ni el proyecto RoboTalk.
