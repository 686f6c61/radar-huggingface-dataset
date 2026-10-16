# Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n100000-10000-20261016

## Resumen

Este repositorio contiene un checkpoint de politica robotica entrenado sobre la libreria openpi y evaluado en el entorno LIBERO-support. El autor es Donghyun1228 y el artefacto se publica bajo licencia Apache 2.0. Se trata de una adaptacion denominada "unified LLM-frozen": el LLM base permanece congelado (nueve hojas del LLM base) mientras que el modulo de vision (Vision23), el experto completo (expert11) y las proyecciones de accion y tiempo (action/time projections8) se entrenan con el multiplicador nativo de AdamW.

El entrenamiento parte de un checkpoint previo (`pi05-libero-support-probe-source-n100000-10000-20261015`, commit `e435806e413a90c3b74c9411228a72b53b97060c`) en la actualizacion 5000, continuando con pesos, optimizador y EMA exactos, y saltando los indices del sampler ya consumidos. El dataset empleado es `Donghyun1228/libero-support-random-waypoint-300k-20261015` (commit `32ed215baf01af7e82f927a62b108873aa70bd19`), con 100.000 fotogramas y 10.000 actualizaciones totales (batch 32, semilla 42, LR 1e-5, warmup 500).

La relevancia de esta publicacion es acotada y de caracter experimental: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha, sin benchmarks generales publicados, pero con un protocolo de evaluacion detallado (1130 exitos sobre 2000 episodios en LIBERO-support). Su interes principal esta en la metodologia de congelacion selectiva del LLM base y en la reproducibilidad del protocolo de servido, no en su uso como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Se distribuye mediante la libreria openpi y el nombre del repositorio hace referencia a "pi05"; la configuracion de entrenamiento distingue un LLM base (congelado), un modulo de vision, un "action expert" y proyecciones de accion/tiempo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia declarada es en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 7,7 GB; inferencia BF16; libreria `openpi`) |
| Tarea | Manipulacion robotica / politica viso-motora (pipeline: robotics) |
| Dataset de entrenamiento | `Donghyun1228/libero-support-random-waypoint-300k-20261015` |
| Entorno de evaluacion | LIBERO-support, simulacion con MuJoCo 3.2.3 |
| Tamano del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa. Lo que si detalla es el reparto de modulos entrenables: de las partes del modelo, solo nueve hojas del LLM base permanecen congeladas; el resto (Vision23, expert11 completo y action/time projections8) se actualiza con AdamW y el mismo multiplicador nativo de actualizacion. Esto configura un esquema de adaptacion con el LLM base fijo y el resto de componentes ajustados sobre el dominio objetivo.

El entrenamiento continuo desde la actualizacion 5000 del checkpoint fuente `pi05-libero-support-probe-source-n100000-10000-20261015`, reutilizando pesos en crudo, estado del optimizador y EMA, con los indices del sampler ya consumidos saltados y el RNG nativo del modelo continuado por paso global. Los hiperparametros son batch 32, semilla 42, learning rate 1e-5, warmup 500 y 10.000 actualizaciones totales, sobre 100.000 fotogramas. La funcion de perdida objetivo es una perdida IDM (inverse dynamics model) en la que se excluye la coordenada 6 (gripper) del objetivo, calculando la media de las 31 coordenadas restantes con padding; las entradas y salidas siguen siendo de siete dimensiones y el control del gripper se mantiene. Se conserva la normalizacion original y la configuracion de muneca ("source wrist"). El checkpoint publicado es el paso 9999 en pesos no-EMA.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales y de estado, en el dominio LIBERO-support.
- Prediccion de dinamica inversa (IDM): estimacion de acciones a partir de transiciones, con la coordenada de gripper excluida de esa perdida concreta.
- Control de gripper en siete dimensiones de entrada/salida, con la coordenada 6 reservada al gripper.
- Servido concurrente en simulacion: el protocolo de evaluacion admite hasta 32 clientes concurrentes con batch de servidor 16, repartidos en cuatro suites con ocho shards cada una.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision general, audio ni modo de pensamiento.
- No se documenta soporte multilingue (el campo de idiomas no esta disponible).

## Casos de uso

- Evaluacion comparativa de politicas en LIBERO-support: el checkpoint permite reproducir el protocolo declarado (`batched16_clients32_global_queue_v1`) con 40 tareas y 50 ensayos por tarea, semilla de entorno 7, y comparar contra el checkpoint fuente emparejado.
- Investigacion sobre congelacion selectiva de LLM en politicas roboticas: sirve como punto de partida para estudiar el efecto de mantener congeladas las nueve hojas del LLM base mientras se ajusta vision y expert.
- Estudio de objetivos de dinamica inversa: la exclusion explicita de la coordenada del gripper en la perdida IDM permite analizar el impacto de enmascarar dimensiones concretas del espacio de accion.
- Ajuste fino sobre nuevos datasets de manipulacion: el repositorio incluye la cadena completa de procedencia (checkpoint fuente, dataset, commits y estado de optimizador), lo que facilita continuar el entrenamiento desde el paso 9999.
- Validacion de infraestructura de servido robotico: la configuracion de 32 clientes con cola global sobre una sola GPU fisica y colocacion EGL verificada por PCI/UUID es util para probar planificadores de inferencia por lotes.
- Reproducibilidad de resultados en simulacion: con MuJoCo 3.2.3 y cero errores de rollout reportados, el artefacto es adecuado para replicar la metrica de 1130/2000 exitos en un entorno controlado.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares). El unico dato de rendimiento publicado es la evaluacion en LIBERO-support:

| Metrica | Valor |
|---|---|
| Tasa de exito (LIBERO-support) | 1130 / 2000 episodios (56,5 %) |
| Tareas evaluadas | 40 tareas x 50 ensayos |
| Semilla de entorno | 7 |
| Clientes concurrentes | 32 |
| Batch de servidor | 16 |
| Protocolo de servido | `batched16_clients32_global_queue_v1` |
| Simulador | MuJoCo 3.2.3 |
| Errores de rollout | 0 |
| Checkpoint evaluado | paso 9999, pesos no-EMA, inferencia BF16 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 7,7 GB y la inferencia declarada se realiza en BF16; la model card no especifica requisitos de VRAM.
- La evaluacion se ejecuto con 32 clientes y batch de servidor 16 sobre una unica GPU fisica, con colocacion EGL verificada por PCI/UUID; no se indica el modelo de GPU empleado.
- No se documenta si el modelo cabe en GPU de consumo (RTX 4090 y similares); no disponible.
- Opciones de despliegue: libreria `openpi` con el protocolo de servido `batched16_clients32_global_queue_v1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas de la misma categoria en la informacion proporcionada. La unica comparacion documentada es con el checkpoint del que deriva:

| Modelo | Relacion | Dataset | Actualizaciones | Licencia |
|---|---|---|---|---|
| `Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n100000-10000-20261016` | Checkpoint analizado (continuacion desde el paso 5000) | `libero-support-random-waypoint-300k-20261015` | 10.000 | Apache 2.0 |
| `Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015` | Checkpoint fuente (`e435806e...`) | No indicado en la informacion disponible | No indicado | No indicado |

Comparativa con modelos de proposito general o con otras politicas roboticas: no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion.
- No se declaran idiomas soportados, numero de parametros, longitud de contexto ni cuantizaciones disponibles.
- El modelo esta especializado en el dominio LIBERO-support; no hay datos sobre transferencia a otros entornos, robots o tareas reales.
- La coordenada 6 (gripper) queda excluida de la perdida IDM objetivo; el control de gripper se mantiene, pero este enmascaramiento puede afectar a la calidad de las predicciones sobre esa dimension.
- El checkpoint publicado es el paso 9999 en pesos no-EMA, no la version EMA.
- El protocolo de evaluacion depende de una cola global que limita los clientes concurrentes a 32 y de una asignacion de RNG compartida dependiente de la peticion; los cambios numericos por forma de batch forman parte del protocolo registrado, por lo que los resultados pueden no ser directamente comparables con otros esquemas de servido.
- Se indica que las comparaciones entre checkpoints estan predefinidas y que no se aplica parada temprana ni omision basada en la politica, lo que limita el ajuste fino de la seleccion de modelo.
- No se documentan sesgos conocidos ni tasas de alucinacion (el modelo no es generativo de texto libre en el uso descrito).
- Licencia Apache 2.0: permite uso comercial, pero no se documentan avisos adicionales sobre los datos de entrenamiento ni sobre el checkpoint fuente.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n100000-10000-20261016
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Dataset: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015
- Repositorio de la libreria openpi: no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
