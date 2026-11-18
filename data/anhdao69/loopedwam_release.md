# anhdao69/LoopedWAM_release

## Resumen

LoopedWAM es un modelo de accion mundial (world-action model) para robotica desarrollado por el autor anhdao69, disenado para la ejecucion de tareas de manipulacion robotica a partir de observaciones visuales e instrucciones. Se distribuye como una coleccion de checkpoints, uno por cada benchmark evaluado en el articulo asociado, todos ellos con 0,58B parametros. El modelo parte de Wan2.1-T2V-1.3B, un modelo de generacion de video texto-a-video de Alibaba, y lo reconfigura como politica de accion mediante un esquema de bloques compactados y bucles de nucleo de accion.

La relevancia del modelo reside en su propuesta de inferencia elastica: la variante LoopedWAM-E permite, con un unico checkpoint, seleccionar en tiempo de inferencia el numero de bucles de nucleo de accion (K_a en {1, 2, 4}) y el numero de pasos de eliminacion de ruido (N en {2, 5, 10}), sin reentrenamiento. Esto permite ajustar el coste computacional a las restricciones del robot o del entorno de despliegue. El modelo cubre benchmarks de referencia en robotica como LIBERO, RoboTwin 2.0 y RoboCasa-GR1, ademas de tareas reales con un brazo AgileX PiPER.

La licencia es Apache 2.0 y el repositorio ocupa 16,8 GB, aunque los pesos por checkpoint rondan los 2,3 GB en FP32. El modelo se publico en noviembre de 2026 y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video y accion, derivado de Wan2.1-T2V-1.3B con particion de bloques 3/6/3 y 4 bucles de video y 4 de accion |
| Parametros totales | 0,58B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`policy.pt`), FP32; requiere VAE `Wan2.1_VAE.pth` y text encoder `models_t5_umt5-xxl-enc-bf16.pth` de Wan-AI/Wan2.1-T2V-1.3B |

## Arquitectura y entrenamiento

LoopedWAM se construye sobre Wan2.1-T2V-1.3B, un modelo de difusion texto-a-video. El autor lo compacta a una particion de bloques 3/6/3 e introduce 4 bucles de video y 4 bucles de nucleo de accion, de modo que el modelo alterna procesamiento visual y generacion de acciones dentro de un mismo esquema de difusion. Los pesos se almacenan en FP32 y el computo se realiza en BF16. La arquitectura y la configuracion de bucles quedan embebidas en el propio checkpoint `policy.pt`, junto con las estadisticas de normalizacion de acciones y propiocepcion en `dataset_stats.json`.

El entrenamiento se realiza por benchmark, con un modelo independiente para cada uno. En LIBERO se entrena sobre las cuatro suites con 46.000 actualizaciones y batch 128 durante 20 epocas. En RoboTwin 2.0 se cubren 50 tareas con 50 demostraciones limpias y 500 aleatorizadas por tarea, alcanzando 475.000 actualizaciones. En RoboCasa-GR1 se entrenan 24 tareas de sobremesa con acciones de 29 dimensiones, publicandose la epoca 9 (212.000 actualizaciones, batch 256) por superar a la epoca 10 (626 frente a 620 exitos de 1.200). Para el robot real AgileX PiPER se usan 100 demostraciones teleoperadas por tarea en 4 tareas, con camaras frontal y de muneca, durante 30.000 actualizaciones. La variante LoopedWAM-E se obtiene por autodestilacion desde el checkpoint LoopedWAM del mismo benchmark sobre las 9 combinaciones de (K_a, N), con distinto numero de epocas segun el benchmark (10 en LIBERO, 5 en RoboTwin 2.0 y 4 en RoboCasa-GR1).

La innovacion principal es el esquema de inferencia elastica: LoopedWAM-E incorpora el experto de video de su profesor en el propio checkpoint, por lo que se carga de forma autonoma y puede ejecutarse con cualquier combinacion de K_a y N definida en tiempo de inferencia sin reentrenar.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales (camaras frontal y de muneca) e instrucciones de tarea.
- Control de manipulacion en entornos simulados y reales, con acciones de hasta 29 dimensiones en RoboCasa-GR1.
- Inferencia elastica mediante LoopedWAM-E: seleccion de K_a en {1, 2, 4} y N en {2, 5, 10} en tiempo de inferencia para ajustar coste y latencia.
- Modelado conjunto de video y accion (world-action model) dentro de un esquema de difusion.
- Ejecucion multi-tarea: un mismo checkpoint cubre las cuatro suites de LIBERO, 50 tareas de RoboTwin 2.0 o 24 tareas de RoboCasa-GR1 segun la variante.
- Soporte de tareas reales con brazo AgileX PiPER (4 tareas teleoperadas).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modos de razonamiento explicito.

## Casos de uso

- Manipulacion robotica en simulacion con LIBERO: el checkpoint `libero/LoopedWAM` resuelve las cuatro suites del benchmark con un 96,1 % de exito, adecuado para evaluar y comparar algoritmos de imitacion antes de transferir a hardware real.
- Despliegue en robot de sobremesa con RoboCasa-GR1: el checkpoint `robocasa_gr1/LoopedWAM` maneja 24 tareas de sobremesa con acciones de 29 dimensiones, util para prototipos de asistencia domestica en entornos controlados.
- Manipulacion bimanual y multi-tarea con RoboTwin 2.0: el checkpoint `robotwin50/LoopedWAM` cubre 50 tareas con demostraciones limpias y aleatorizadas, apropiado para entrenar y validar politicas robustas a variaciones de escena.
- Control de brazo real AgileX PiPER: el checkpoint `real_piper/LoopedWAM` se entrena con 100 demostraciones teleoperadas por tarea y se evalua en 4 tareas reales, util para pilotos de laboratorio con hardware asequible.
- Ajuste de latencia en entornos con recursos limitados: LoopedWAM-E permite reducir K_a y N en inferencia (por ejemplo, K_a=2, N=2) manteniendo un rendimiento cercano al completo (95,6 % frente a 96,1 % en LIBERO), lo que facilita su ejecucion en ordenadores de a bordo con menos computo.
- Investigacion en world-action models: la publicacion de checkpoints por benchmark y de la variante elastica permite reproducir los resultados del articulo y estudiar el efecto de los bucles de accion y los pasos de difusion.
- Evaluacion comparativa de politicas de imitacion: los checkpoints sirven como linea base reproducible en LIBERO, RoboTwin 2.0 y RoboCasa-GR1 para comparar nuevas arquitecturas con una referencia de 0,58B parametros.

## Benchmarks y rendimiento

| Benchmark | Modelo | Configuracion | Exito (%) |
|---|---|---|---|
| LIBERO (4 suites) | LoopedWAM | K_a=4, N=10 | 96,1 |
| LIBERO (4 suites) | LoopedWAM-E | K_a=4, N=2 | 95,6 |
| LIBERO (4 suites) | LoopedWAM-E | K_a=2, N=2 | 96,0 |
| RoboTwin 2.0 (50 tareas) | LoopedWAM | K_a=4, N=10 | 91,9 |
| RoboTwin 2.0 (50 tareas) | LoopedWAM-E | K_a=4, N=2 | 91,5 |
| RoboTwin 2.0 (50 tareas) | LoopedWAM-E | K_a=2, N=2 | 90,6 |
| RoboCasa-GR1 (24 tareas) | LoopedWAM | K_a=4, N=10 | 52,2 |
| RoboCasa-GR1 (24 tareas) | LoopedWAM-E | K_a=4, N=2 | 52,4 |
| RoboCasa-GR1 (24 tareas) | LoopedWAM-E | K_a=2, N=2 | 51,6 |
| AgileX PiPER (4 tareas reales) | LoopedWAM | K_a=4, N=10 | 60 de 83 ensayos |

Protocolo de evaluacion: LIBERO con 4 suites x 10 tareas x 50 estados iniciales x 3 semillas = 6.000 episodios; RoboTwin 2.0 con 50 tareas x (limpio + aleatorizado) x 100 = 10.000 episodios; RoboCasa-GR1 con 24 tareas x 50 = 1.200 episodios.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en FP32 con aproximadamente 2,3 GB por checkpoint, lo que implica del orden de 2,3 GB solo para pesos; el VAE y el text encoder de Wan2.1-T2V-1.3B anaden requisitos adicionales no cuantificados en la informacion disponible.
- GPU recomendadas: no disponible. El modelo se evaluo en un entorno no especificado en la model card.
- Compatibilidad con GPU de consumo: no confirmada. El tamano de pesos en FP32 (2,3 GB) sugiere que podria caber en GPUs de consumo con suficiente VRAM, pero no se documenta el consumo total incluyendo VAE y text encoder.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato es PyTorch (`policy.pt`) y requiere cargar manualmente el VAE y el text encoder de Wan2.1-T2V-1.3B.
- Latencia y throughput: no disponibles. La variante LoopedWAM-E permite reducir K_a y N para disminuir el coste computacional, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopedWAM | 0,58B | no disponible | 96,1 % LIBERO; 91,9 % RoboTwin 2.0; 52,2 % RoboCasa-GR1 | Apache 2.0 | Hugging Face |
| LoopedWAM-E | 0,58B | no disponible | 95,6-96,0 % LIBERO; 90,6-91,5 % RoboTwin 2.0; 51,6-52,4 % RoboCasa-GR1 | Apache 2.0 | Hugging Face |
| Alternativas de robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables de la misma categoria (politicas roboticas de tamano similar o world-action models) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo se distribuye como checkpoints especificos por benchmark; no existe un unico checkpoint generalista que cubra LIBERO, RoboTwin 2.0 y RoboCasa-GR1 a la vez.
- El rendimiento en RoboCasa-GR1 es notablemente inferior (52,2 %) que en LIBERO (96,1 %) y RoboTwin 2.0 (91,9 %), lo que sugiere dificultades en tareas de sobremesa con acciones de 29 dimensiones.
- En el robot real AgileX PiPER solo se alcanzan 60 exitos de 83 ensayos, con una muestra limitada de 4 tareas y 100 demostraciones por tarea.
- No se publican registros de entrenamiento ni checkpoints intermedios, lo que limita la reproducibilidad completa del proceso.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma; el modelo no procesa lenguaje natural de forma general, sino instrucciones de tarea en el contexto de robotica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Wan2.1-T2V-1.3B, cuyos terminos deben verificarse por separado.
- No se especifican requisitos de hardware, latencia ni opciones de cuantizacion, lo que dificulta planificar despliegues en produccion.
- El modelo no incluye capacidades de tool calling, agentes multi-paso ni modos de razonamiento explicito.

## Enlaces

- Hugging Face: https://huggingface.co/anhdao69/LoopedWAM_release
- Pagina del proyecto: https://anhdao69.github.io/LoopedWAM
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Benchmarks referenciados: LIBERO, RoboTwin 2.0, RoboCasa-GR1 (sin enlaces directos en la informacion disponible)
- Articulo y repositorio de codigo: no disponibles en la informacion proporcionada
