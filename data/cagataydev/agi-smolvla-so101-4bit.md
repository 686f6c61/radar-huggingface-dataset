# cagataydev/agi-smolvla-so101-4bit

## Resumen

agi-smolvla/so101 4-bit es la exportación cuantizada a 4 bits de `cagataydev/agi-smolvla-so101`, una política robótica de tipo VLA (vision-language-action) para el brazo SO-101, publicada por el autor `cagataydev` dentro del proyecto agi.diy. El modelo no genera texto: recibe fotogramas de cámara y el estado articular del robot y devuelve un bloque de 50 acciones a 30 Hz, es decir, 1,67 segundos de movimiento por llamada. Con 450M parámetros y 254 MB de pesos en 4 bits, está pensado para servir políticas robóticas a través de una API remota compatible con el `RemoteClient` de LeRobot, sin modificar el firmware del robot ni ejecutar el bucle de control en la nube.

Su relevancia está en dos frentes. Por un lado, demuestra que una política VLA de 450M parámetros puede comprimirse a 4 bits con una pérdida de precisión moderada: 16,44 RMSE en la evaluación held-out frente a 14,45 del padre en precisión completa, ambos medidos en la misma ejecución sobre 36 ventanas del dataset `lerobot/svla_so101_pickplace` (episodios 45–49). Por otro, forma parte de una infraestructura comercial de inferencia remota con un precio declarado de 0,0001 USD por acción y una latencia de ida y vuelta registrada de 286–886 ms sobre el transporte Zenoh.

La información disponible es limitada: la model card está truncada y no detalla la composición del dataset de entrenamiento, el proceso de post-ajuste ni los hiperparámetros de cuantización. Los resultados de búsqueda web realizados no devolvieron material relevante sobre este modelo, por lo que los datos que siguen proceden exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de SmolVLA; no se detalla la topologia interna en la informacion disponible |
| Parametros totales | 450M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observacion con 1 fotograma cada 30 y horizonte de 50 acciones a 30 Hz = 1,67 s |
| Tipos de cuantizacion | 4 bits (pesos de 254 MB); no se documentan otros esquemas ni granularidad (por tensor, por canal, group size) |
| Idiomas soportados | no disponible; no se documentan instrucciones en lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado; pesos cuantizados a 4 bits, repositorio de 0,3 GB, libreria `lerobot` |

Otros datos de la ficha: pipeline `robotics`, creado el 25 de octubre de 2026, actualizado el mismo dia, 0 descargas y 0 likes en el momento de la consulta. Modelo base: `cagataydev/agi-smolvla-so101` (relacion: quantized).

## Arquitectura y entrenamiento

La model card identifica el modelo como una política VLA de la familia SmolVLA, integrada en el ecosistema LeRobot, y describe su funcionamiento como un mapeo de observaciones (fotogramas de cámara y estado de las articulaciones) a bloques de 50 acciones. Las acciones se expresan en la unidad `so101-normalized-v1`: articulaciones del brazo en el rango −100 a 100 y pinza en 0 a 100. No se especifica en la información disponible el backbone visual-lenguaje, el mecanismo de generación de acciones (por ejemplo, flow matching o regresión directa), el número de capas ni la composición exacta del dataset de entrenamiento.

Sí se documenta el ajuste fino: el padre `agi-smolvla-so101` fue post-entrenado sobre `lerobot/svla_so101_pickplace`, y la evaluación se hizo sobre los episodios 45–49, nunca vistos en entrenamiento. El checkpoint de referencia de la comunidad (etiquetado como «stock checkpoint» en la card) obtiene 41,07 RMSE sobre las mismas ventanas, frente a 14,45 del padre afinado, lo que sugiere que el post-ajuste sobre la tarea de pick-and-place es el principal responsable de la mejora. La evaluación offline se ejecutó con el mismo `PolicyRunner` que usa el servidor, mediante el script `agi_wfm/eval/offline_mse.py`, sobre 36 ventanas con horizonte 50, en una Jetson AGX Thor con CUDA. No se documenta el proceso de cuantización aplicado para generar esta variante de 4 bits, ni si hubo calibración con datos reales.

## Capacidades

- Generación de bloques de acción para control robótico: 50 acciones por llamada a 30 Hz, equivalentes a 1,67 s de movimiento.
- Política visomotora: consume fotogramas de cámara junto con el estado articular y produce consignas conjuntas y de pinza.
- Tarea específica de pick-and-place sobre el brazo SO-101, entrenada sobre `lerobot/svla_so101_pickplace`.
- Inferencia remota mediante el protocolo de LeRobot: el cliente es el `RemoteClient` estándar, sobre transporte Zenoh (`tls/zenoh.api.agi.diy:7447`).
- Compatibilidad con el ecosistema LeRobot: carga como política (`lerobot`) y puede evaluarse con el runner del servidor.
- Ejecución cuantizada a 4 bits con 254 MB de pesos, lo que permite servirla en hardware de borde.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, visión general, audio ni modo de pensamiento; no es un modelo de lenguaje y no procesa instrucciones en lenguaje natural según la información disponible.

## Casos de uso

- Pick-and-place industrial ligero: el modelo devuelve bloques de 50 acciones que el SO-101 ejecuta en 1,67 s, de modo que el bucle de control local solo necesita pedir un chunk nuevo cada 1,67 s. Es adecuado porque el coste de red se amortiza sobre 50 acciones y la latencia de ida y vuelta registrada (286–886 ms) queda por debajo del tiempo de ejecución del bloque.
- Evaluación previa a la compra de hardware: la demo `api.agi.diy/play` ejecuta el mismo checkpoint contra un SO-101 simulado en MuJoCo en el navegador, lo que permite validar el comportamiento de la política antes de desplegar el brazo físico o contratar la API.
- Despliegue en robótica de borde: con pesos de 254 MB en 4 bits, la política cabe en plataformas embebidas con GPU; la card reporta evaluación en una Jetson AGX Thor, un escenario típico de robot móvil o celda compacta con presupuesto térmico y energético limitado.
- Investigación en cuantización de políticas VLA: la card publica la comparación 4 bits (16,44 RMSE) frente a precisión completa (14,45 RMSE) sobre exactamente las mismas 36 ventanas, lo que sirve como punto de partida para estudiar el impacto de la compresión en control continuo.
- Integración en pipelines de LeRobot existentes: al cargarse como política `lerobot` y usar `RemoteClient`, se puede sustituir un checkpoint local por inferencia remota sin reescribir el cliente de control.
- Servicio de políticas como API para integradores: con un precio declarado de 0,0001 USD por acción y facturación de un token por acción (la traza de sesión documenta 150 tokens para 3 llamadas de 50 acciones), permite prototipar aplicaciones robóticas con coste variable en lugar de invertir en GPU propia.
- Reproducción de evaluación offline: el script `agi_wfm/eval/offline_mse.py` y la unidad `so101-normalized-v1` permiten replicar la métrica RMSE sobre el dataset público y comparar variantes de cuantización o de post-ajuste.
- Docencia y demostraciones: la combinación de un modelo de 450M parámetros, licencia Apache 2.0 y simulación en navegador facilita explicar el ciclo observación-acción de un VLA sin montar un laboratorio.

## Benchmarks y rendimiento

Evaluación offline held-out sobre `lerobot/svla_so101_pickplace`, episodios 45–49, 36 ventanas, horizonte 50, una observación cada 30 fotogramas, unidad `so101-normalized-v1`. Métrica: RMSE sobre el bloque completo, que cubre 1,67 s de movimiento. Menor es mejor.

| Modelo | RMSE held-out (bloque de 1,67 s) |
|---|---|
| agi-smolvla/so101 4-bit (este repositorio) | 16,44 |
| agi-smolvla/so101 precision completa (padre) | 14,45 |
| Checkpoint stock de referencia | 41,07 |
| Mantener la acción actual (baseline) | no disponible (truncado en la model card) |

Notas sobre la medición: las columnas de 4 bits y precisión completa se midieron en la misma ejecución (36 ventanas, horizonte 50, Jetson AGX Thor, CUDA), por lo que son comparables entre sí; la columna del checkpoint stock procede de otra ejecución en hardware distinto y por eso la card no le asigna celda de latencia. La diferencia entre 16,44 y 14,45 supone un deterioro de aproximadamente el 13,8 % en RMSE atribuible a la cuantización a 4 bits. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lengua en la información disponible, y no aplican a este tipo de modelo.

Latencia registrada en la traza de sesión `ses_3WmhwXtsgW05H3pMgm6BTp`: 3 llamadas de sondeo de 50 acciones cada una, 286–886 ms de ida y vuelta sobre `tls/zenoh.api.agi.diy:7447`, 150 tokens facturados. La propia card advierte que la sonda envía cero imágenes, por lo que esos bloques no corresponden a una tarea real.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Los pesos en 4 bits ocupan 254 MB y el repositorio completo 0,3 GB; el consumo real vendrá dominado por las activaciones del codificador visual y por el stack de LeRobot, no por los pesos.
- GPU recomendadas: la card documenta evaluación en Jetson AGX Thor con CUDA. No se especifican A100, H100 ni RTX 4090 como requisitos ni como banco de pruebas.
- GPU de consumo: por tamaño (450M parámetros, 254 MB en 4 bits) es razonable esperar que quepa en GPUs de consumo actuales, pero no hay medición publicada que lo confirme; trátese como estimación, no como dato verificado.
- Opciones de despliegue: LeRobot como librería de carga de políticas; `RemoteClient` para inferencia contra la API de agi.diy; servidor propio con `PolicyRunner`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Throughput: 50 acciones por llamada a 30 Hz, es decir, 1,67 s de movimiento por bloque; el cliente debe solicitar un bloque nuevo antes de agotar ese intervalo.
- Latencia de red: 286–886 ms de ida y vuelta medidos en la traza de sesión citada, con la salvedad de que fueron llamadas de sondeo sin imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | RMSE held-out (1,67 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agi-smolvla/so101 4-bit (este repo) | 450M | 50 acciones a 30 Hz (1,67 s) | 16,44 | Apache 2.0 | HuggingFace + API agi.diy |
| agi-smolvla/so101 (padre, precision completa) | 450M | 50 acciones a 30 Hz (1,67 s) | 14,45 | Apache 2.0 | HuggingFace + API agi.diy |
| Checkpoint stock de referencia | no disponible | 50 acciones a 30 Hz (1,67 s) | 41,07 | no disponible en la informacion proporcionada | HuggingFace (comunidad LeRobot) |
| Otros VLA para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las tres variantes que la propia model card mide sobre el mismo span. No se dispone de datos de otros VLA comparables (por ejemplo, familias alternativas de políticas visomotoras) en la información proporcionada, y la card advierte explícitamente que puntuaciones sobre spans distintos no son comparables entre sí.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está post-ajustado para pick-and-place sobre el SO-101 con el dataset `lerobot/svla_so101_pickplace`; no se documenta generalización a otras tareas, objetos o morfologías.
- Base de evaluación reducida: la métrica principal se calcula sobre 36 ventanas de 5 episodios held-out, una muestra pequeña que limita la confianza estadística del RMSE.
- Pérdida por cuantización: 16,44 frente a 14,45 RMSE del padre en precisión completa, un deterioro de en torno al 13,8 %; en tareas de precisión de contacto puede traducirse en fallos de agarre.
- Ambigüedad del baseline: la comparación con el checkpoint stock (41,07) procede de una ejecución distinta y en hardware distinto, por lo que no es estrictamente equivalente a las otras dos columnas.
- Métrica offline: el RMSE sobre acciones grabadas no garantiza éxito de la tarea en el robot real; no se publican tasas de éxito en ejecución física.
- Sin datos de sesgo, robustez o seguridad: no se documentan sesgos conocidos, comportamiento ante iluminación adversa, oclusión, cambios de cámara ni estrategias de parada segura. Al ser un modelo de control, los fallos se manifiestan como movimientos físicos incorrectos.
- Idiomas e instrucciones: no se documenta soporte de lenguaje natural, pese a la etiqueta VLA; no debe asumirse que acepta comandos en castellano ni en ningún otro idioma.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el acceso al servicio de inferencia de agi.diy se rige por sus propios términos y por el precio declarado de 0,0001 USD por acción, independiente de la licencia del modelo.
- Dependencia de infraestructura: el flujo documentado asume el protocolo remoto de LeRobot sobre Zenoh; caídas de red o latencias superiores a 1,67 s rompen el bucle de control y obligan a implementar parada segura en el cliente.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin historial de uso comunitario verificable.
- Información incompleta: la model card está truncada y los resultados de búsqueda web no aportaron documentación adicional; los detalles de entrenamiento, cuantización y formato de pesos quedan como no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cagataydev/agi-smolvla-so101-4bit
- Modelo base (precisión completa): https://huggingface.co/cagataydev/agi-smolvla-so101
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Sitio del proyecto: https://agi.diy
- Documentación de la API: https://api.agi.diy/docs
- Sección de checkpoints propios: https://api.agi.diy/docs#custom-checkpoint
- Demo en navegador con MuJoCo: https://api.agi.diy/play
- Traza de sesión citada en la model card: https://api.agi.diy/dashboard/sessions/ses_3WmhwXtsgW05H3pMgm6BTp
- Colección agi en HuggingFace: https://huggingface.co/collections/cagataydev/agi-65dc0e10759d733a533a2e64
- Repositorio de LeRobot (librería declarada): no disponible en la información proporcionada
- Paper o informe técnico del modelo: no disponible en la información proporcionada
