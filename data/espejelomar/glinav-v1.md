# espejelomar/glinav-v1

## Resumen

GLiNav es un modelo de decision para navegacion robotica local publicado por el usuario espejelomar sobre GLiFormer Base v1 de Knowledgator. Transforma estado estructurado del mundo en seis decisiones concretas: drive, strafe, turn, stop, task state y target. Se distribuye como un delta de 113 MiB que se aplica sobre una base fija de 1.008 MiB, con licencia Apache-2.0, idioma ingles, libreria `gliformer` y pipeline `robotics`.

Su relevancia radica en que mantiene todo el bucle de control en local: no necesita llamadas a modelos alojados. Incluye un controlador que bloquea finalizaciones prematuras y aplica recuperacion acotada cuando el progreso se estanca. En 73 tareas de Habitat alcanzo 38 objetivos (52,1%) sin finalizaciones prematuras, frente a 29/73 (39,7%) y 5 finalizaciones prematuras del sistema alojado Jev de TypeSafe.

La arquitectura se apoya en GLiFormer, con un cargador que usa GLiNER, y se entreno con 6.000 estados de habitacion sinteticos generados con herramientas de world-state y geometria de DimOS. Es un modelo de decision de navegacion, no de vision: no ve, no detecta objetos ni construye mapas, y debe colocarse detras de capas propias de percepcion, movimiento y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiFormer (delta sobre `knowledgator/gliformer-base-v1`); detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se distribuye como delta de 113 MiB; SHA-256 `8ba9d2b7738be545185d01316792be9603941fe239dfae64ac48ea47928971ba`) |
| Tamano del delta | 113 MiB |
| Tamano de la base | 1.008 MiB (1,008 GiB) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `gliformer` |
| Pipeline | `robotics` |
| Fecha de publicacion (metadatos) | 2026-09-26 |

## Arquitectura y entrenamiento

GLiNav se construye como un delta de pesos sobre GLiFormer Base v1 de Knowledgator. La libreria declarada es `gliformer` y el cargador utiliza GLiNER. El modelo no genera texto libre ni procesa imagenes: consume estado estructurado del mundo y emite seis campos de decision por tick (drive, strafe, turn, stop, task state y target). El controlador adjunto aplica una guardia de finalizacion de un metro y un mecanismo de recuperacion acotada ante estancamiento, y debe mantenerse vivo entre ticks (un unico proceso o un objeto `GLiNavController`) para poder detectar dichos estancamientos.

El entrenamiento utilizo 6.000 estados de habitacion sinteticos construidos con herramientas de world-state y geometria de DimOS. La model card indica explicitamente que no se usaron escenas de Habitat, imagenes ni grabaciones de robot. No se menciona el uso de RLHF, DPO ni tecnicas de alineamiento. La evaluacion se realizo en Habitat con HSSD, donde el simulador proporcionaba las posiciones de los objetos. La innovacion principal es la combinacion de un modelo de decision local con una capa de control determinista que evita finalizaciones prematuras (0 frente a 4 en el modelo sin controlador) y mejora la tasa de objetivos alcanzados.

## Capacidades

- Emision de seis decisiones de navegacion: drive, strafe, turn, stop, task state y target.
- Salida en JSON con respuestas crudas del modelo, respuestas ajustadas por el controlador, acciones, comprobacion de finalizacion y eventos del controlador.
- Controlador local con guardia de finalizacion de un metro y recuperacion acotada ante estancamiento.
- Interfaz de decision agnostica a la plataforma robotica: puede colocarse detras de la percepcion, el movimiento y la seguridad propios del robot.
- Ejecucion completamente local, sin llamadas a modelos alojados en el bucle de control.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; opera tick a tick con estado mantenido en el controlador.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no incluye vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Navegacion de robot movil en simulacion: el modelo recibe estado estructurado del mundo en Habitat con HSSD y emite acciones de desplazamiento y giro, adecuado para experimentar con politicas de decision sin depender de servicios externos.
- Integracion con robots cuadrupedos como Unitree Go2: se le suministra el estado del mundo y se coloca detras de las capas propias de percepcion, movimiento y seguridad, ya que la interfaz es agnostica a la plataforma.
- Investigacion en politicas de navegacion local: permite comparar un sistema de decision local (~232 ms de respuesta observada) frente a alternativas alojadas, con trazabilidad del controlador y de los eventos de recuperacion.
- Evaluacion de robustez en bucle cerrado: la guardia de finalizacion y la recuperacion acotada permiten estudiar como se comporta la politica ante estancamientos y tareas que no progresan.
- Generacion de datos de decision para entrenamiento posterior: las respuestas JSON con acciones, estado de tarea y objetivo pueden registrarse para construir trazas sinteticas de navegacion.
- Prototipado en laboratorio con simulador: al requerir solo Python 3.14, Linux y una GPU NVIDIA CUDA, es viable montar un entorno de pruebas acotado antes de plantear despliegues fisicos.
- Comparacion de arquitecturas de control: la diferencia entre el modelo solo (24/73 objetivos, 4 finalizaciones prematuras) y el sistema completo (38/73, 0 prematuras) sirve para estudiar el peso de la capa determinista en el resultado final.
- Auditoria de finalizaciones prematuras: el controlador registra eventos, lo que permite analizar por que una politica decide terminar una tarea antes de alcanzar el objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento corresponden a las tareas de navegacion en Habitat con HSSD:

| Medida | GLiNav (sistema completo) | Jev (alojado) | GLiNav solo modelo |
|---|---:|---:|---:|
| Objetivos alcanzados | 38/73 (52,1%) | 29/73 (39,7%) | 24/73 (32,9%) |
| Finalizaciones prematuras | 0 | 5 | 4 |
| Ruta de decision | Local | Alojada | Local |
| Respuesta observada | ~232 ms | ~328 ms | no disponible |

En el conjunto auditado de 79 primeros intentos del sistema completo, GLiNav alcanzo 41 objetivos sin finalizaciones prematuras. Una tarea separada fallo la auditoria de infraestructura y se excluyo sin reintento. El autor advierte que las ejecuciones fueron separadas, no una carrera en vivo, y que los tiempos de respuesta provienen de rutas distintas (local y alojada), por lo que son cifras operativas y no un test de velocidad controlado. Del mismo modo, la comparacion entre modelo solo y sistema completo son ejecuciones separadas sobre las mismas 73 tareas, no un estudio causal controlado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Los pesos suman aproximadamente 1,1 GiB (113 MiB de delta mas 1.008 MiB de base), a lo que habria que anadir el estado de ejecucion y las dependencias.
- GPU recomendadas: no disponible; la model card solo indica una GPU NVIDIA compatible con CUDA.
- Sistema operativo: Linux (ruta de inferencia probada).
- Requisitos de software: Python 3.14, NVIDIA CUDA, Git y la CLI de Hugging Face.
- Cabe en GPU de consumo: no confirmado oficialmente. Por el tamano de pesos (~1,1 GiB) es plausible que quepa en GPUs de consumo actuales, pero el autor no publica requisitos de VRAM ni modelos soportados.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La ejecucion oficial es mediante `glinav_controller.py`, con el cargador propio basado en GLiFormer y GLiNER, y descarga de pesos con `hf download`.
- Latencia: aproximadamente 232 ms de respuesta observada en las pruebas de Habitat, con la salvedad de que no es un test de velocidad controlado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivos alcanzados | Finalizaciones prematuras | Decision | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| GLiNav v1 | Delta sobre GLiFormer Base v1 | 38/73 (52,1%) | 0 | Local | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Jev (TypeSafe) | Modelo alojado de proposito general | 29/73 (39,7%) | 5 | Alojada | no disponible | Servicio alojado |
| GLiNav sin controlador | Mismos pesos, sin guardia ni recuperacion | 24/73 (32,9%) | 4 | Local | Apache-2.0 | Incluido en el mismo repositorio |

No se dispone de otros modelos comparables de navegacion con decision sobre estado estructurado en la informacion proporcionada. La comparacion con Jev procede de ejecuciones separadas, no de una carrera en vivo.

## Limitaciones y advertencias

- El modelo no ve, no detecta objetos y no construye mapas. No debe conectarse directamente a un robot: requiere capas externas de percepcion, movimiento y seguridad.
- No garantiza seguridad. La model card lo indica de forma explicita.
- Entrenamiento exclusivamente sintetico: 6.000 estados de habitacion de DimOS, sin escenas de Habitat, imagenes ni grabaciones de robot. Existe riesgo de brecha simulacion-realidad.
- Los resultados son decisiones de navegacion en simulador con posiciones de objetos proporcionadas por el propio simulador; no son navegacion por camara, resultados con robot fisico ni una puntuacion estandar del leaderboard de Habitat.
- Muestra pequena: 73 tareas en las comparativas y 79 primeros intentos auditados, con una tarea excluida por fallo de infraestructura.
- Las comparaciones con Jev y con el modelo sin controlador son ejecuciones separadas, no estudios causales controlados, y los tiempos de respuesta proceden de rutas distintas.
- Idioma limitado al ingles.
- Longitud de contexto, cuantizaciones y formato de pesos no estan documentados, lo que dificulta planificar despliegues en produccion.
- Licencia Apache-2.0 para el delta, el cargador y el controlador, pero la base GLiFormer y los componentes upstream (GLiFormer, GLiNER) tienen sus propias condiciones. No se implica ningun tipo de respaldo por parte de Knowledgator ni de los autores de GLiNER.
- Requiere Python 3.14 y una GPU NVIDIA con CUDA; la ruta de inferencia solo esta probada en Linux.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: validacion externa practicamente nula.
- El controlador debe mantenerse vivo entre ticks (un unico proceso u objeto `GLiNavController`); si se reinicia, no puede detectar estancamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espejelomar/glinav-v1
- Modelo base GLiFormer Base v1: https://huggingface.co/knowledgator/gliformer-base-v1
- Repositorio GLiFormer: https://github.com/Knowledgator/GLiFormer
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Dataset HSSD: https://huggingface.co/datasets/hssd/hssd-hab
- Presentacion de Jev y los system one models de TypeSafe: https://typesafe.ai/blog/introducing-system-one-models-and-jev
