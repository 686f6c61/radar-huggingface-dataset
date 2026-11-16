# fastforks/alltracker

## Resumen

AllTracker es un modelo de seguimiento denso de puntos (point tracking) en vídeo desarrollado por Adam Harley y colaboradores, presentado en ICCV 2025. Resuelve el problema del seguimiento de larga distancia de todos los píxeles de un fotograma de consulta a lo largo de un vídeo, formulándolo como flujo óptico de largo alcance. A diferencia de los seguidores de puntos en línea, procesa el vídeo completo de forma offline para refinar la trayectoria de cada punto ancla.

La arquitectura emplea un codificador ConvNeXt (en la variante tiny, una CNN residual) que procesa cada fotograma a resolución 1/8. El modelo opera sobre ventanas de 16 fotogramas con paso 8, refinando simultáneamente el flujo y la visibilidad de todos los píxeles ancla respecto a todos los fotogramas de la ventana, mediante una pirámide de correlación, bloques ConvNeXt 2D sobre el espacio y bloques 1D sobre el tiempo, y un sobremuestreo convexo de 8x. Las consultas de puntos leen directamente el resultado denso.

El repositorio `fastforks/alltracker` es únicamente una model card: no aloja pesos. El paquete `fastforks` descarga los pesos originales de los autores y los verifica contra el SHA-256 indicado. Existen dos variantes: `alltracker` y `alltracker-tiny`, ambas con licencia MIT y uso comercial permitido según la información disponible. La relevancia actual radica en su enfoque offline de flujo óptico denso, que compite con seguidores de puntos en línea en los benchmarks TAP-Vid.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (codificador) + piramide de correlacion + bloques ConvNeXt 2D espaciales y 1D temporales + sobremuestreo convexo 8x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventanas de 16 fotogramas con paso 8; entrada de cualquier H x W >= 32, rellenada a multiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 (precision de ejecucion); no se documentan cuantizaciones de pesos tipo GGUF/INT8 |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT (codigo y pesos, uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch); descargados desde el repositorio del autor, no alojados en este repo |

## Arquitectura y entrenamiento

AllTracker es un transformer hibrido con fuerte componente convolucional. Un codificador ConvNeXt (en la variante tiny, una CNN residual) extrae caracteristicas de cada fotograma a 1/8 de resolucion. El modelo procesa el video en ventanas de 16 fotogramas con paso 8 y refina de forma conjunta el flujo y la visibilidad de todos los pixeles ancla respecto a todos los fotogramas de la ventana. Para ello emplea una piramide de correlacion, bloques ConvNeXt 2D sobre el espacio, bloques 1D sobre el tiempo y un sobremuestreo convexo de 8x que produce un mapa denso del que las consultas de puntos leen su trayectoria. El enfoque es offline: requiere el video completo para refinar las trayectorias, a diferencia de los seguidores en linea.

El entrenamiento se realizo en dos etapas segun el README original: la etapa 1 sobre Kubric MOVi-F y la etapa 2 sobre una mezcla de datos de seguimiento de puntos (Kubric, PointOdyssey, Dynamic Replica y trayectorias de puntos derivadas de FlyingThings3D, Monkaa, Driving y SPRING) y datos de flujo optico (FlyingChairs, FlyingThings3D, Monkaa, Driving, AutoFlow, SPRING, VIPER, HD1K, KITTI y TartanAir). No se especifica el numero total de tokens ni si hubo RLHF/DPO. La innovacion tecnica destacable es el refinamiento conjunto de flujo y visibilidad de todos los pixeles ancla en una sola pasada por ventana, con un backend `kernels` optimizado que acelera la inferencia entre 1,5x y 2,2x respecto al codigo original.

## Capacidades

- Seguimiento denso de puntos (tracking any point) en video: dada una consulta `(t, x, y)`, devuelve la posicion del punto en todos los fotogramas y la probabilidad de visibilidad.
- Flujo optico de largo alcance offline sobre el video completo.
- Salidas estructuradas `tracks` y `visibility` por cada consulta.
- Procesamiento de video de cualquier resolucion H x W >= 32 (rellenada a multiplo de 32); probado hasta 3000x4000.
- Dos variantes de pesos: `alltracker` y `alltracker-tiny`.
- Dos backends de ejecucion: `portable` y `kernels` (este ultimo con kernels CUDA optimizados).
- Compatibilidad con `torch.compile` (reduccion de 391 a 284 ms en `alltracker` a 480x854).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo puramente de vision.
- No dispone de modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Seguimiento de objetos en video de vigilancia: se seleccionan puntos de interes en un fotograma y el modelo devuelve sus trayectorias y visibilidad en todo el clip, aprovechando el procesamiento offline para refinar trayectorias largas.
- Analisis de movimiento en biomecanica y deporte: seguimiento de puntos anatomicos o de equipamiento a lo largo de secuencias de video para extraer trayectorias precisas, con la ventaja de la visibilidad estimada para descartar oclusiones.
- Efectos visuales y rotoscopia asistida: seguimiento denso de puntos sobre superficies para estabilizar o transferir mascaras entre fotogramas, usando la salida densa antes de la consulta de puntos.
- Robotica y navegacion: seguimiento de puntos caracteristicos entre fotogramas para estimacion de movimiento de camara o de objetos, con la variante tiny para despliegue en GPUs de gama media.
- Analisis de video cientifico (microscopia, fluidos): seguimiento de particulas o estructuras a lo largo de secuencias, aprovechando la capacidad de entrada de alta resolucion (probado hasta 3000x4000).
- Etiquetado y anotacion de datasets de tracking: generacion automatica de trayectorias pseudo-etiquetadas sobre video para entrenar otros modelos, con la ventaja de la licencia MIT para uso comercial.
- Comparacion y validacion de pipelines de flujo optico: uso como referencia offline en la evaluacion de seguidores en linea o de metodos de flujo clasicos.

## Benchmarks y rendimiento

Resultados de precision en TAP-Vid (protocolo estandar, fotogramas redimensionados a 256x256, AJ / delta_avg / OA en %):

| Variante | Dataset | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `alltracker` | TAP-Vid DAVIS (query first), cada 3er video | 67,45 / 78,66 / 90,82 | 67,41 / 78,65 / 90,69 | 67,42 / 78,71 / 90,70 | 67,38 / 78,63 / 90,65 |
| `alltracker` | TAP-Vid DAVIS (query first) | 64,17 / 77,00 / 89,49 | no disponible | 64,14 / 77,04 / 89,44 | 64,15 / 77,04 / 89,44 |

Rendimiento y memoria (tracking sintetico a 480x854, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `alltracker` | 485 | 391 | 221 | 2,2x | 993 / 1238 | 1076 / 1288 |
| `alltracker-tiny` | 424 | 330 | 217 | 2,0x | 919 / 1178 | 978 / 1166 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `alltracker` | 1,68 | 0,22 | 0,98 | 1,31 | 0,85 | 0,45 |
| `alltracker-tiny` | 1,22 | 0,06 | 0,96 | 1,40 | 0,73 | 0,54 |

`torch.compile` y TensorRT (480x854):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparacion compile (s) |
|---|---|---|---|---|---|
| `alltracker` | 391 | 284 | planificado para 0.2.1 | 221 | 105 |
| `alltracker-tiny` | 330 | 229 | planificado para 0.2.1 | 217 | 103 |

## Requisitos de hardware

- VRAM estimada: con `alltracker` a 480x854 en fp16, pico de 993 MiB (portable) o 1076 MiB (kernels). A resolucion 3000x4000, pico de 5,5 GiB asignados y 5,9 GiB reservados en ambas variantes.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU CUDA con al menos 6 GB para resoluciones altas y al menos 2 GB para resoluciones tipo 480x854.
- Cabe en GPU de consumo: si, en tarjetas como RTX 5060 Ti 16 GB o superiores; con resoluciones moderadas cabe en GPUs de 4-6 GB.
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`), PyTorch, `torch.compile`, TensorRT fp16 (planificado para 0.2.1). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de vision).
- Latencia y throughput: 221-391 ms por tracking a 480x854 segun backend; carga del modelo entre 0,06 y 1,68 s segun backend y variante; primera llamada entre 0,45 y 1,40 s.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto/ventana | Precision TAP-Vid DAVIS (AJ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AllTracker (`alltracker`) | Offline, flujo optico denso | no disponible | Ventanas de 16 fotogramas, video completo | 64,17 (fp32, protocolo descrito) | MIT | Pesos en HF (aharley/alltracker), card en fastforks |
| AllTracker tiny | Offline, CNN residual | no disponible | Ventanas de 16 fotogramas | no disponible en la informacion | MIT | Pesos en HF |
| TAPIR | Seguimiento de puntos, video completo | no disponible | Video completo | no disponible en la informacion | no disponible | Referenciado en el protocolo de evaluacion |
| LocoTrack | Seguimiento de puntos, video completo | no disponible | Video completo | no disponible en la informacion | no disponible | Referenciado en el protocolo de evaluacion |
| TAPNext | Seguimiento en linea | no disponible | En linea | no disponible en la informacion | no disponible | Referenciado en el protocolo de evaluacion |
| Track-On | Seguimiento en linea | no disponible | En linea | no disponible en la informacion | no disponible | Referenciado en el protocolo de evaluacion |

## Limitaciones y advertencias

- Modelo puramente de vision: no procesa texto ni lenguaje, por lo que no aplica a tareas de NLP, agentes conversacionales ni tool calling.
- Enfoque offline: requiere el video completo para refinar las trayectorias; no es adecuado para seguimiento en tiempo real en linea sin adaptaciones.
- Precision limitada a los resultados publicados en TAP-Vid DAVIS; no hay datos de otros benchmarks en la informacion disponible.
- Riesgo de deriva y errores en oclusiones prolongadas o movimiento rapido, inherente al seguimiento de puntos; la salida de visibilidad debe usarse para filtrar trayectorias poco fiables.
- La variante `alltracker-tiny` no tiene resultados de precision publicados en la informacion disponible.
- La card indica que el paquete es de uso de investigacion y que las cadenas de licencia del codigo original deben revisarse antes de otros usos, aunque la licencia declarada es MIT con uso comercial permitido.
- No se documentan sesgos especificos; al entrenarse con datasets de escenas sinteticas y de conduccion (Kubric, PointOdyssey, KITTI, etc.), puede generalizar peor en dominios visuales alejados de esos datos.
- El repositorio no aloja pesos: depende de la disponibilidad de los enlaces del autor y de la verificacion SHA-256.
- TensorRT fp16 esta planificado para la version 0.2.1, no disponible en el momento de la informacion.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/alltracker
- Pesos del autor: https://huggingface.co/aharley/alltracker
- Codigo del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Codigo original de AllTracker: https://github.com/aharley/alltracker
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/tracking/models/alltracker/card.toml
- Pesos `alltracker.pth`: https://huggingface.co/aharley/alltracker/resolve/c8ba31225828cab9ec512d0627f0f826e641a877/alltracker.pth
- Pesos `alltracker_tiny.pth`: https://huggingface.co/aharley/alltracker/resolve/c8ba31225828cab9ec512d0627f0f826e641a877/alltracker_tiny.pth
