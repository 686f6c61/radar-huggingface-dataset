# cagataydev/agi-act-so101-4bit

## Resumen

agi-act/so101 4-bit es la exportación cuantizada a 4 bits de una política robótica ACT (Action Chunking Transformer) para el brazo SO-101, publicada por Cagatay Cali (cagataydev) dentro del proyecto agi.diy. No es un modelo de lenguaje: recibe fotogramas de cámara y el estado articular del robot y devuelve un bloque de 100 acciones a 30 Hz, es decir, 3,33 segundos de movimiento por llamada. El checkpoint cuenta con 52 millones de parámetros y pesa 29 MB en su forma cuantizada, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en hardware de borde.

El modelo se entrenó sobre el dataset lerobot/svla_so101_pickplace y está pensado para tareas de pick-and-place con el SO-101, un brazo de 6 grados de libertad de fabricación abierta. Su relevancia actual no viene del tamaño, sino del modo de distribución: agi.diy sirve la política mediante el protocolo de inferencia remota de LeRobot, de forma que el robot envía observaciones y recibe acciones sin necesidad de ejecutar el modelo en local. Cada acción se factura a 0,0001 dólares.

La ficha pública destaca una evaluación offline sobre los episodios 45 a 49 del dataset, nunca vistos en entrenamiento: 58 ventanas, una observación cada 15 fotogramas y comparación contra las acciones grabadas en el mismo instante. La versión de 4 bits obtiene un RMSE de 19,38 frente a 19,05 del checkpoint padre en precisión completa y 62,48 de un checkpoint estándar de la comunidad sobre las mismas ventanas y el mismo horizonte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visomotora de imitación; la model card solo aporta la etiqueta `act` y la librería LeRobot, sin detallar capas ni dimensión oculta |
| Parámetros totales | 52 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; horizonte de acción de 100 pasos (3,33 s a 30 Hz) |
| Tipos de cuantización | 4 bits (exportación cuantizada del checkpoint `cagataydev/agi-act-so101`); no se especifica el esquema exacto de cuantización |
| Idiomas soportados | no disponible / no aplica (política robótica sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la model card; repositorio LeRobot con pesos de 4 bits y 29 MB (tamaño de repo reportado: 0,0 GB) |
| Entrada | fotogramas de cámara + estado articular normalizado |
| Salida | chunk de 100 acciones (unidades so101-normalized-v1: articulaciones −100…100, pinza 0…100) |
| Frecuencia de control | 30 Hz |
| Dataset de entrenamiento | lerobot/svla_so101_pickplace |
| Precio del servicio | 0,0001 USD por acción (1 token por acción) |
| Hardware de evaluación | Jetson AGX Thor, CUDA |

## Arquitectura y entrenamiento

La model card identifica el modelo con la etiqueta `act` y la librería `lerobot`, lo que corresponde a una política ACT de imitación: un transformer que consume observaciones visuales y propioceptivas y emite un bloque de acciones futuras de una sola vez, en lugar de predecir acción a acción. El card no documenta el número de capas, la dimensión del modelo, el número de cámaras de entrada ni el esquema concreto de cuantización aplicado, por lo que esos detalles deben considerarse no disponibles. El horizonte de predicción sí está fijado: 100 acciones a 30 Hz.

El entrenamiento se realizó sobre el dataset lerobot/svla_so101_pickplace, del que se reservaron los episodios 45 a 49 para evaluación. No se indica en la información disponible el número total de episodios, la composición exacta del dataset ni si hubo etapas de refinamiento posteriores (RLHF, DPO u otras), algo por otra parte poco habitual en políticas de imitación robótica. La evaluación offline se ejecutó con el mismo `PolicyRunner` que usa el servidor en producción, sobre 58 ventanas muestreadas cada 15 fotogramas, comparando la acción k del chunk con la acción grabada k/30 segundos después.

La innovación distributiva del proyecto es el protocolo de inferencia remota de LeRobot: el cliente es el `RemoteClient` estándar y la sesión se negocia vía `POST /v1/sessions`, con transporte Zenoh sobre TLS (`tls/zenoh.api.agi.diy:7447`). El robot mantiene el control en todo momento; el servidor solo devuelve chunks de acciones.

## Capacidades

- Generación de chunks de 100 acciones a 30 Hz para el brazo SO-101 (3,33 s de movimiento por llamada).
- Control visomotor de pick-and-place entrenado específicamente sobre lerobot/svla_so101_pickplace.
- Entrada multimodal compuesta por imágenes de cámara y estado articular normalizado.
- Inferencia remota mediante el protocolo LeRobot: el modelo puede consumirse como servicio sin desplegar pesos en el robot.
- Compatibilidad con el cliente estándar `RemoteClient` de LeRobot y con el `PolicyRunner` del servidor de agi.diy.
- Evaluación reproducible en navegador contra un SO-101 simulado en MuJoCo a través de api.agi.diy/play.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades de texto, audio o visión generalista: es una política motora, no un modelo fundacional multimodal.

## Casos de uso

- Automatización de pick-and-place con SO-101: el modelo devuelve bloques de 100 acciones que cubren 3,33 s de trayectoria, suficientes para completar ciclos de recogida y depósito sin reenviar observaciones en cada paso.
- Prototipado en simulación antes de invertir en hardware: con api.agi.diy/play se puede evaluar la política contra un SO-101 en MuJoCo desde el navegador y comprobar el comportamiento del chunk antes de pagar llamadas reales.
- Despliegue en robótica de borde: con 52 M de parámetros y 29 MB de pesos en 4 bits, la política cabe en dispositivos tipo Jetson (el card reporta evaluación en Jetson AGX Thor con CUDA), lo que permite prescindir de una GPU de servidor.
- Inferencia como servicio sin infraestructura propia: el robot usa el `RemoteClient` de LeRobot y delega el cómputo en agi.diy a 0,0001 USD por acción, útil para laboratorios sin GPU dedicada.
- Línea base para nuevas políticas: el RMSE de 19,38 sobre un span de 3,33 s sirve como referencia cuantitativa para comparar fine-tunings o nuevos datasets sobre el mismo brazo y la misma tarea.
- Estudio del impacto de la cuantización: la comparación directa 19,38 (4 bits) frente a 19,05 (precisión completa) permite medir la degradación introducida por la cuantización en políticas ACT, con las mismas 58 ventanas y el mismo hardware.
- Docencia y reproducción de experimentos: el par de checkpoints (padre y cuantizado) más el evaluador `agi_wfm/eval/offline_mse.py` permiten reproducir la comparación en un entorno controlado.

## Benchmarks y rendimiento

Evaluación offline sobre lerobot/svla_so101_pickplace, episodios 45–49 (no vistos en entrenamiento), 58 ventanas, una observación cada 15 fotogramas, horizonte 100, Jetson AGX Thor con CUDA. Unidades so101-normalized-v1. Menor es mejor. Todas las cifras cubren exactamente 3,33 s de movimiento (acción k comparada con la acción grabada k/30 s después).

| Modelo | RMSE (span 3,33 s) | Notas |
|---|---:|---|
| Este repo (4 bits) | 19,38 | Pesos desquantizados, misma ejecución que el padre |
| Padre en precisión completa (`cagataydev/agi-act-so101`) | 19,05 | Pesos tal cual se distribuyen, misma ejecución |
| Checkpoint estándar de la comunidad | 62,48 | Medido en una ejecución separada, en hardware distinto; sin celda de latencia |
| Baseline «mantener la acción actual» | no disponible | El valor queda truncado en la información proporcionada |

| Métrica de servicio | Valor |
|---|---|
| Acciones por llamada | 100 |
| Frecuencia | 30 Hz |
| Latencia de ida y vuelta | 140–227 ms sobre `tls/zenoh.api.agi.diy:7447` (3 llamadas de sondeo, 300 tokens facturados) |

No se han publicado resultados de benchmarks estándar de robótica (LIBERO, CALVIN, Meta-World) ni comparaciones con otras políticas en la información disponible. Los datos de la tabla anterior proceden exclusivamente de la model card del autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en 4 bits (29 MB de pesos más activaciones y buffers de cámara); el modelo está pensado para ejecutarse en el propio robot o en un dispositivo de borde.
- GPU recomendadas: no se especifican. El autor reporta evaluación en Jetson AGX Thor con CUDA; por tamaño, cualquier GPU con soporte CUDA sirve y una RTX 4090 resulta sobredimensionada para 52 M de parámetros.
- Cabe en GPU de consumo: sí, con margen amplio; también en aceleradores integrados tipo Jetson Orin o Thor. No se han publicado mediciones en CPU ni en Raspberry Pi.
- Opciones de despliegue: LeRobot con `RemoteClient` contra el servidor de agi.diy (protocolo de inferencia remota sobre Zenoh/TLS), servidor propio con el `PolicyRunner` del proyecto, y simulación en navegador vía api.agi.diy/play con MuJoCo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política ACT.
- Latencia y throughput: 140–227 ms de ida y vuelta por llamada según la traza de sesión publicada, con 100 acciones por llamada. El rendimiento efectivo depende de la red y de la cola del servidor, no solo del modelo.
- Coste: 0,0001 USD por acción, es decir, 0,01 USD por chunk de 100 acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | RMSE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agi-act/so101 4-bit (este repo) | 52 M | 100 acciones (3,33 s a 30 Hz) | 19,38 | Apache 2.0 | Pesos en HF + API agi.diy |
| agi-act/so101 (padre, precisión completa) | 52 M | 100 acciones | 19,05 | Apache 2.0 | Pesos en HF + API agi.diy |
| Checkpoint estándar de la comunidad (svla_so101_pickplace) | no disponible | 100 acciones | 62,48 | no disponible | Hugging Face / LeRobot |
| cagataydev/gr00t-wave | no disponible | no disponible | no disponible | no disponible | Pesos en HF; modelo de manipulación con doble cámara sobre SO101 Wave |

La comparación relevante es interna a la familia: la cuantización a 4 bits cuesta 0,33 puntos de RMSE (19,38 frente a 19,05, un 1,7 % relativo) a cambio de reducir el peso a 29 MB. Frente al checkpoint estándar de la comunidad, la mejora en RMSE es de aproximadamente un 69 % sobre el mismo span. gr00t-wave pertenece a otra familia de políticas (modelo fundacional con entrada de doble cámara sobre un dataset distinto), por lo que no existe una comparación numérica publicada entre ambos.

## Limitaciones y advertencias

- Modelo de un solo cometido y una sola encarnación: entrenado para el brazo SO-101 en tareas de pick-and-place sobre lerobot/svla_so101_pickplace. No generaliza a otros robots, otras cámaras ni otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje: no procesa texto, no responde instrucciones verbales y no admite tool calling ni razonamiento multi-paso.
- Dependencia de la normalización: las acciones están en unidades so101-normalized-v1 (articulaciones −100…100, pinza 0…100); cualquier inconsistencia en la normalización del cliente invalida la salida.
- Riesgo de alucinación trasladado al dominio motor: la política puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; no hay mecanismo de verificación interno.
- Datos de evaluación limitados: 58 ventanas de 5 episodios y una única ejecución por checkpoint. La comparación con el checkpoint estándar de la comunidad proviene de una ejecución distinta y en hardware distinto, por lo que no es estrictamente equivalente a la comparación con el padre.
- Cifras no replicadas de forma independiente: todos los RMSE proceden del autor. El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, con creación el 25 de octubre de 2026, lo que implica ausencia de validación externa.
- Dependencia de servicio si se usa la API: la latencia de 140–227 ms medida incluye la red y el servidor; el control en bucle cerrado a 30 Hz exige que el cliente gestione los chunks de forma asíncrona.
- Sesgos: no evaluados ni documentados en la model card. Al entrenarse con un dataset reducido de un único montaje físico, hereda los sesgos de posición, iluminación y configuración de cámara de esas grabaciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset lerobot/svla_so101_pickplace antes de reutilizar los datos.
- Detalles técnicos ausentes: no se especifica el esquema de cuantización, el formato de pesos exacto ni el número de cámaras de entrada, lo que complica la reproducción desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cagataydev/agi-act-so101-4bit
- Modelo base (precisión completa): https://huggingface.co/cagataydev/agi-act-so101
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Proyecto agi.diy: https://agi.diy
- Documentación de la API: https://api.agi.diy/docs
- Entorno de simulación en navegador: https://api.agi.diy/play
- Traza de sesión citada en el card: https://api.agi.diy/dashboard/sessions/ses_BmjQaNYcm3CsslR72xqenh
- Colección «agi» del autor: https://huggingface.co/collections/cagataydev/agi-65dc0e10759d733a533a2e64
- Perfil del autor: https://huggingface.co/cagataydev/models
- Modelo relacionado gr00t-wave: https://huggingface.co/cagataydev/gr00t-wave
- Guía de entrenamiento de ACT para SO-101 con SOLO CLI: https://github.com/omkarputti/SO101_ACT_Training
- Proyecto de brazo SO-101 con ACT y LeRobot: https://github.com/TourEnduro/SO-101-robot-arm
