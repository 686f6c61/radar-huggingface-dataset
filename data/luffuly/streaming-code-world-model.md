# Luffuly/streaming-code-world-model

## Resumen

Streaming Code World Model es un conjunto de dos adaptadores LoRA publicados por el usuario Luffuly en HuggingFace, pensados para habilitar generacion de video causal y por fragmentos (chunk-by-chunk) a partir de un proxy en vivo. No se trata de un modelo completo, sino de pesos de adaptacion que se montan sobre el modelo base MiniMax-H3 en su variante Ref2VA, junto con el LoRA del Code World Model. El repositorio ocupa 2,4 GB y no registra descargas ni valoraciones en el momento de la consulta.

El proposito declarado es actuar como world model: predecir de forma autorregresiva el siguiente fragmento de video condicionado por el estado de un entorno simulado, de modo que el modelo pueda usarse como simulador neuronal acoplado a un bucle de control. La evaluacion se realiza contra el simulador CARLA, con una metrica de error cuadratico medio (CARLA MSE) que mide la fidelidad entre el video generado y la referencia del simulador.

La relevancia tecnica esta en la combinacion de dos tecnicas de difusion: diffusion forcing en streaming, que permite generar causalmente sin reconstruir toda la secuencia, y destilacion DMD (Distribution Matching Distillation) a 4 pasos, que reduce el coste de muestreo de 35 pasos a 4 y baja el tiempo por fragmento de 47,9 s a 5,1 s en una NVIDIA H200. El modelo es claramente de investigacion: requiere hardware de datacenter (108-123 GB de memoria pico) y su licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion de video MiniMax-H3 (variante Ref2VA) + LoRA de Code World Model; generacion causal chunk-by-chunk |
| Parametros totales | no disponible (los ficheros publicados son adaptadores LoRA sobre un modelo base externo) |
| Parametros activos | no disponible (no se confirma que la arquitectura base sea MoE) |
| Longitud de contexto | no disponible (en video equivale al historial de fragmentos previos; no se especifica) |
| Tipos de cuantizacion | bf16 por defecto y fp8 mediante el flag `--fp8` durante la inferencia; no se documentan otros formatos |
| Idiomas soportados | no disponible (modelo de generacion de video; el autor no documenta idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`streaming_df.safetensors` y `streaming_dmd_4step.safetensors`) |

## Arquitectura y entrenamiento

El punto de partida es el modelo MiniMax-H3 en su variante Ref2VA, un generador de video por difusion, sobre el que se aplican dos LoRA: uno publicado por el equipo del Code World Model y otro especifico de streaming. El primero de los checkpoints de este repositorio corresponde a un esquema de streaming diffusion forcing, con 35 pasos de muestreo, y el segundo es un alumno destilado con DMD de 4 pasos que utiliza el modelo de streaming como profesor. La generacion es causal y avanza fragmento a fragmento, lo que evita reprocesar la secuencia completa en cada paso y permite mantener un estado KV reutilizable (`--kv-reuse`).

En la variante destilada se aplican ademas una regla de prediccion `x0` y un desplazamiento de ruido (`--shift 5`), parametros de muestreo que acompanan a la reduccion de pasos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni sobre el proceso de ajuste fino concreto, ya que la model card se limita a describir los ficheros, los comandos de evaluacion y los resultados. La innovacion destacable, por tanto, es la reduccion de coste de inferencia mediante destilacion, no un cambio de arquitectura del modelo base.

## Capacidades

- Generacion de video autorregresiva y causal, fragmento a fragmento, condicionada por un proxy en vivo.
- Modelado de mundo (world model) sobre entornos simulados, orientado a predecir la evolucion visual del entorno.
- Dos regimenes de calidad/coste: 35 pasos de difusion (mayor fidelidad, 47,9 s por fragmento) y 4 pasos destilados (menor coste, 5,1 s por fragmento).
- Reutilizacion de cache KV entre fragmentos para el modo destilado.
- Ejecucion en bf16 o fp8, con reduccion de memoria pico de 123 GB a 108 GB.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision comprensiva, audio ni capacidades multilingues.

## Casos de uso

- Simulacion neuronal de conduccion: acoplado al simulador CARLA, el modelo puede generar el siguiente fragmento de video del entorno a partir del estado del proxy, sirviendo como sustituto parcial del renderizado del simulador en bucles de simulacion.
- Aumento de datos sinteticos para percepcion: los rollouts de video generados permiten ampliar datasets de entrenamiento para deteccion, segmentacion o prediccion de movimiento en escenarios viarios, siempre que se valide la fidelidad fisica de las secuencias.
- Evaluacion de planificadores en bucle cerrado: un planificador de trayectoria puede actuar sobre el world model y observar consecuencias visuales plausibles, lo que reduce el coste frente a simuladores fisicos completos en fases exploratorias.
- Investigacion en diffusion forcing: la pareja profesor/alumno publicada permite reproducir experimentos de destilacion a 4 pasos y comparar contra el muestreo de 35 pasos con la misma metrica CARLA MSE.
- Estudio de sim2real: analizar hasta que punto un world model entrenado sobre simulacion mantiene coherencia temporal cuando se le alimenta con proxies reales, midiendo deriva y acumulacion de error por fragmento.
- Prototipado de pipelines de video generativo de bajo coste: el checkpoint DMD, con 5,1 s por fragmento en H200, permite iterar sobre el bucle de inferencia antes de pasar a la variante de mayor calidad.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de la model card, medidos sobre CARLA:

| Fichero | Metodo de muestreo | CARLA MSE (menor es mejor) | s / fragmento (H200) |
|---|---|---|---|
| `streaming_df.safetensors` | `--steps 35` (diffusion forcing en streaming) | 2231 | 47,9 |
| `streaming_dmd_4step.safetensors` | `--steps 4 --rule x0 --shift 5 --kv-reuse` (DMD a 4 pasos) | 1660 | 5,1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de generacion de video como FVD o PSNR) en la informacion disponible. Destaca que la variante destilada no solo es unas 9,4 veces mas rapida, sino que ademas obtiene un MSE menor en la metrica reportada.

## Requisitos de hardware

- Memoria pico declarada: 123 GB en bf16 y 108 GB con `--fp8`, para inferencia con el modelo base mas los LoRA.
- GPU recomendada: una NVIDIA H200 de 141 GB, configuracion sobre la que se han medido los tiempos publicados.
- No cabe en GPUs de consumo: los requisitos de memoria exceden ampliamente los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090, incluso con cuantizacion en fp8.
- Despliegue: el flujo documentado es mediante scripts de Slurm (`scripts/eval/eval.sbatch`) sobre el repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo de difusion de video de este tipo.
- Latencia: 5,1 s por fragmento en el modo DMD a 4 pasos (aproximadamente 11,8 fragmentos por minuto) y 47,9 s por fragmento en el modo de 35 pasos (aproximadamente 1,25 fragmentos por minuto) sobre H200.
- No se documenta throughput para otras GPU ni soporte multi-GPU.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible que permitan comparar este modelo con alternativas de terceros de la misma categoria (world models de video para conduccion autonoma o generacion de video causal). La unica comparacion posible es interna, entre los dos checkpoints publicados, y con el modelo base sobre el que se montan:

| Elemento | Rol | Datos disponibles |
|---|---|---|
| MiniMax-H3 (Ref2VA) | Modelo base de difusion de video | No se documentan especificaciones en esta informacion |
| Code World Model (LoRA) | Adaptador previo necesario | No se documentan especificaciones en esta informacion |
| `streaming_df.safetensors` | LoRA de streaming diffusion forcing | 2231 CARLA MSE, 47,9 s por fragmento |
| `streaming_dmd_4step.safetensors` | LoRA destilado con DMD a 4 pasos | 1660 CARLA MSE, 5,1 s por fragmento |

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Al ser adaptadores sobre MiniMax-H3, los terminos del modelo base probablemente condicionan su uso, pero esto no se documenta.
- Ausencia de model card sustantiva: no hay informacion sobre datos de entrenamiento, sesgos, limitaciones conocidas ni evaluacion de seguridad.
- Riesgo de deriva autorregresiva: al generar fragmento a fragmento, los errores pueden acumularse a lo largo de la secuencia; el propio autor reporta errores MSE en el orden de 1660-2231, lo que indica desviacion apreciable respecto a la referencia de CARLA.
- Dependencia de un entorno concreto: la evaluacion se realiza sobre CARLA, por lo que el comportamiento fuera de ese dominio (u otros simuladores) no esta verificado.
- Requisitos de hardware muy altos (108-123 GB), lo que limita la reproduccion a clusters con H200 o GPUs de memoria equivalente.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Instalacion en dos pasos: es necesario instalar previamente la release del Code World Model y el modelo base MiniMax-H3; los ficheros de este repositorio no son autosuficientes.
- No hay soporte declarado de agentes, tool calling ni razonamiento textual, por lo que no debe evaluarse como un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/Luffuly/streaming-code-world-model
- Repositorio de streaming-code-world-model: https://github.com/TingtingLiao/streaming-code-world-model
- Repositorio de Code World Model: https://github.com/buaacyw/code-world-model
- MiniMax-H3: no disponible (el autor lo referencia por nombre, sin enlace directo en la model card)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a galerias de arte de comics y no se incluyen por no ser pertinentes.
