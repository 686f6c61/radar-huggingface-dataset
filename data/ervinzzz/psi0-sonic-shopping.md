# ErvinZzz/psi0-sonic-shopping

## Resumen

psi0-sonic-shopping es un checkpoint de politica vision-lenguaje-accion (VLA) publicado por el usuario ErvinZzz, consistente en un ajuste fino de Psi0 (PSI-lab, USC) sobre 34 episodios de teleoperacion real con un humanodo Unitree G1 ejecutando una tarea de compras. El modelo observa una imagen RGB egocentrica de 480x640 junto con el estado articular del robot (43 dimensiones) y emite tokens latentes de movimiento del controlador SONIC v1.1 de NVIDIA mas objetivos de las articulaciones de la mano diestra, que el controlador convierte en comandos de cuerpo completo.

El interes tecnico esta en que documenta de forma poco habitual el proceso completo de ajuste fino de una politica sobre hardware real: receta de entrenamiento, conversion de datos a LeRobot v2.1, artefactos de reproducibilidad (hash sha256 por fichero, recibos de entrenamiento y de replay) y evaluacion en bucle abierto con intervalos de confianza bootstrap. La VLM base permanece congelada y solo se entrena la cabeza de accion por flow-matching, lo que reduce el coste a 40.000 pasos sobre 2 x A100-40GB.

Se trata de un modelo de investigacion, no de un producto: no se reporta exito en bucle cerrado sobre el robot, se entreno con una sola semilla y la validacion se limita a dos episodios reservados. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y su utilidad practica esta ligada a la pila SONIC/GR00T-WholeBodyControl y a un G1 con la configuracion de manos concreta del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): VLM congelado de Psi0 con cabeza de accion por flow-matching que emite tokens latentes SONIC y objetivos de articulaciones de mano |
| Parametros totales | 2.629.197.024 (2,63 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La politica consume una imagen egocentrica por paso y una instruccion de lenguaje fija ("Shopping."); no se documenta ventana de contexto multi-turno |
| Tipos de cuantizacion | No disponible. Solo se publican pesos completos en safetensors; no hay variantes GGUF, int8 ni int4 documentadas |
| Idiomas soportados | No disponible. La unica instruccion documentada es la cadena fija en ingles "Shopping." |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, solo pesos, sin estado del optimizador) |
| Tamano del repositorio | 6,3 GB |
| Fecha de publicacion | 15 de septiembre de 2026 (ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |
| Hardware de entrenamiento | 2 x A100-SXM4-40GB en el cluster MBZUAI DANA |

### Interfaz de observacion y accion

| Elemento | Dimensiones | Composicion |
|---|---|---|
| Observacion | RGB egocentrica 480x640 (`observation.images.egocentric`) + estado de 43 | 29 articulaciones del cuerpo (6 pierna izquierda, 6 pierna derecha, yaw/roll/pitch de cintura, 7 brazo izquierdo, 7 brazo derecho) + 14 de mano (izquierda 29:36, derecha 36:43) |
| Accion | 78 | Token de movimiento SONIC (64 valores en rejilla de 1/16 dentro de [-0,625, 0,625]) + 14 articulaciones de mano (izquierda 64:71, derecha 71:78) |
| Chunk | 30 pasos a 30 Hz | Ejecutado con chunking en tiempo real y retardo maximo de 8 |
| Instruccion de lenguaje | -- | "Shopping." |

## Arquitectura y entrenamiento

La politica parte de los checkpoints publicos de Psi0 (`pre.fast.1by1.2601091803.ckpt.ego200k.he30k` y `postpre.1by1.pad36.2601131206.ckpt.he30k`, Apache 2.0) y aplica la configuracion `finetune_real_psi0_config`: el modulo VLM se congela y solo se optimiza la cabeza de accion por flow-matching. Se entrenaron 40.000 pasos con batch global de 64 (2 x A100-40GB x 32), AdamW con learning rate 1e-4 y planificador coseno con 1.000 pasos de calentamiento, semilla 292285, e imagenes redimensionadas a 240x320 (fotograma completo, sin recorte) con las aumentaciones de la configuracion.

Los datos provienen de 34 episodios de teleoperacion real (23.755 fotogramas a 30 fps) recogidos con el pipeline de recoleccion SONIC de Psi0 y el controlador de cuerpo completo SONIC v1.1 de NVIDIA (GR00T-WholeBodyControl). Se selecciono un nivel de calidad estricto de 11 episodios completos mas 23 segmentos limpios de un segundo nivel, convertidos a LeRobot v2.1 mediante `scripts/data/raw_sonic_to_psi_lerobot.py`; las estadisticas de normalizacion se guardan en `dataset_statistics.json`. La validacion reservo 2 episodios independientes (2.279 fotogramas). Las grabaciones originales no forman parte de la publicacion. La innovacion destacable no es arquitectonica sino de ingenieria de despliegue: la salida se comprime a tokens latentes de movimiento interpretados por SONIC, y el chunking en tiempo real permite emitir acciones a 30 Hz con un retardo maximo de 8 pasos.

## Capacidades

- Generacion de acciones motoras de cuerpo completo para un humanodo Unitree G1 en la tarea concreta de compras, condicionada por una unica instruccion de lenguaje fija.
- Prediccion de trayectorias multimodales mediante flow-matching en lugar de regresion directa, con muestreo de varias semillas.
- Emision conjunta de tokens latentes de movimiento SONIC (64 dimensiones) y de objetivos de 14 articulaciones de mano diestra (indice, corazon y pulgar).
- Prediccion de chunks de 30 pasos a 30 Hz con soporte de chunking en tiempo real (retardo maximo de 8).
- Percepcion visual egocentrica a 480x640 con entrada de estado articular explicito de 43 dimensiones; no hay fusion con otras camaras ni con sensores tactiles documentados.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; el modelo no expone API de texto ni planificacion simbolica.
- Capacidades multilingues: no disponibles; la unica instruccion documentada es "Shopping." en ingles.
- Modo de razonamiento explicito (thinking) o salidas de audio: no disponibles.

## Casos de uso

- Investigacion en imitacion aprendizaje sobre hardware real: el checkpoint sirve como punto de partida reproducible para estudiar como se comporta una VLA ajustada con solo 34 episodios y 23.755 fotogramas, ya que la receta, la semilla y los artefactos de entrenamiento estan documentados.
- Replicacion de la tarea de compras en un Unitree G1: con el servidor `psi_serve_rtc_token-sonic.py` y el controlador SONIC v1.1 se puede reproducir el episodio reservado y medir la L1 en bucle abierto (0,0757 en tokens y 0,1015 rad en manos) sin necesidad de disenar una politica desde cero.
- Evaluacion de controladores de cuerpo completo: al emitir tokens latentes en lugar de comandos articulares directos, el modelo permite comparar distintas versiones del controlador SONIC manteniendo fija la politica.
- Generacion de trayectorias de referencia para destilacion o filtrado de datos: los chunks predichos con distintas semillas pueden usarse como propuestas que un operador valida antes de incorporarlas a un dataset de entrenamiento.
- Prototipado de manipulacion diestra: las 14 articulaciones de mano (indice, corazon y pulgar, dos grados por dedo mas un tercero en el pulgar) permiten experimentar con agarres finos en simulacion antes de trasladarlos al robot.
- Estudio de latencia y chunking en tiempo real: la configuracion de 30 Hz con retardo maximo de 8 constituye un banco de pruebas para medir como afecta la latencia de inferencia a la ejecucion de politicas de accion.
- Linea base para comparativas internas de ajuste fino: cualquier nuevo dataset de teleoperacion sobre el mismo G1 puede medirse contra estas metricas de bucle abierto y contra el baseline de persistencia documentado.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| L1 forzado por profesor, token de movimiento (paso 40.000) | 0,0418 | Episodios reservados |
| L1 forzado por profesor, articulaciones de mano (paso 40.000) | 0,0453 rad | Episodios reservados |
| L1 en bucle abierto, token tras snapping de rejilla (primeros 6 pasos) | 0,0405 [0,0399; 0,0411] | 2.249 ventanas, 3 semillas de muestreo, IC bootstrap del 95 % |
| Tasa de token exacto | 46,6 % | Mismas ventanas |
| L1 en bucle abierto, mano (primeros 6 pasos) | 0,0144 rad [0,0113; 0,0176] | Mismas ventanas |
| L1 en bucle abierto, chunk completo de 30 pasos | 0,0455 (token) / 0,0385 (mano) | Mismas ventanas |
| Baseline de persistencia (repetir la accion anterior) | 0,0105 (token) / 0,0098 (mano) | Mismas ventanas |
| Replay completo de un episodio reservado via servidor RTC (`replay_accept_242687.json`) | 0,0757 (token) / 0,1015 rad (mano) | 30 Hz de salida de acciones |

No se reporta exito en bucle cerrado sobre el robot. El propio autor advierte que el baseline de persistencia obtiene mejor L1 que la politica en las mismas ventanas, por lo que las cifras miden calidad de prediccion en bucle abierto y no exito de tarea. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 5,3 GB unicamente para los 2.629.197.024 parametros; el repositorio completo ocupa 6,3 GB.
- Pesos en fp32: aproximadamente 10,5 GB, si se carga sin reducir precision.
- Cuantizacion a int8 (no publicada oficialmente): en torno a 2,6 GB, calculado a partir del numero de parametros; requeriria conversion propia.
- Entrenamiento: 2 x A100-SXM4-40GB (batch global 64). No se documentan requisitos de memoria para reentrenamiento con otro batch.
- Cabe en GPU de consumo si solo se consideran los pesos: tarjetas con 12 GB o mas (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090) tendrian margen para bf16; no se documenta si el resto de la pila SONIC y el servidor de despliegue caben simultaneamente en esas tarjetas.
- Despliegue documentado: `python src/psi/deploy/psi_serve_rtc_token-sonic.py --host 0.0.0.0 --port 8000 --action_exec_horizon 30 --policy psi --rtc --run-dir=<directorio> --ckpt-step=40000` desde el repositorio de Psi0, con `model.safetensors` en `<run-dir>/checkpoints/ckpt_40000/` junto a `run_config.json` y `dataset_statistics.json`. El flujo de cuatro procesos SONIC se describe en `real/SONIC/README.md`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este modelo; es una politica de robotica, no un modelo de lenguaje servible como chat, y no se documenta soporte en esos motores.
- Latencia y throughput: 30 Hz de salida de acciones con chunking en tiempo real (retardo maximo de 8) durante el replay de validacion; un chunk cubre 30 pasos, es decir, 1 segundo de trayectoria a 30 Hz. No se publican latencias por paso de inferencia en GPU concretas.

## Comparativa con modelos similares

La informacion proporcionada solo documenta la relacion con los checkpoints base de Psi0. No hay datos de benchmarks ni de especificaciones de otros modelos comparables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psi0-sonic-shopping (este checkpoint) | 2.629.197.024 | No disponible | VLA para Unitree G1, tarea de compras con interfaz SONIC v1.1 | Apache 2.0 | Pesos en HuggingFace, 0 descargas |
| Psi0 base (`pre.fast.1by1...` / `postpre.1by1.pad36...`) | No disponible | No disponible | VLA generalista de partida, entrenada con datos egocentricos y de mano | Apache 2.0 | Repositorio de Psi0 |
| Otras VLA de robotica (pi0, GR00T N1, OpenVLA) | No disponible | No disponible | Manipulacion y control de robots | No disponible | No disponible en la informacion proporcionada |
| SONIC / GR00T-WholeBodyControl (NVIDIA) | No disponible | No disponible | Controlador de cuerpo completo que consume los tokens latentes | Licencia propia de NVIDIA | Repositorio de NVlabs |

## Limitaciones y advertencias

- No se reporta exito en bucle cerrado sobre el robot: toda la evaluacion es en bucle abierto o forzado por profesor, por lo que no hay evidencia publicada de que la tarea de compras se complete con exito.
- El baseline de persistencia (repetir la accion anterior) obtiene mejor L1 (0,0105 en tokens) que la politica (0,0405) sobre las mismas ventanas, lo que sugiere que en regimen de bucle abierto la senal predictiva de la politica es limitada.
- Entrenamiento con una sola semilla y validacion con solo dos episodios reservados (2.279 fotogramas): la significacion estadistica es baja y no se cubre variabilidad entre ejecuciones.
- Especificidad de hardware severa: la politica esta atada a un Unitree G1 con la configuracion articular y de manos descrita (29 articulaciones de cuerpo mas 14 de mano) y al controlador SONIC v1.1; no es trasladable a otro robot sin reentrenamiento.
- Dependencia de la instruccion fija "Shopping.": al estar la VLM congelada y entrenarse solo la cabeza de accion, no se puede asumir generalizacion a otras ordenes de lenguaje ni a variaciones de redaccion.
- Las grabaciones de entrenamiento no se publican, de modo que la reproducibilidad completa del dataset no es posible; solo se liberan estadisticas de normalizacion y artefactos de la ejecucion de entrenamiento.
- Sin soporte documentado de cuantizacion: desplegar en precision reducida requiere convertir los pesos por cuenta propia, sin garantias de mantener las metricas reportadas.
- Riesgo de sobreajuste a las condiciones de recogida (iluminacion, disposicion de la tienda, operador de teleoperacion); no hay evaluacion de robustez ante cambios de escena.
- Licencia: el checkpoint es Apache 2.0, pero SONIC y GR00T-WholeBodyControl son proyectos de NVIDIA con licencias propias que deben revisarse antes de cualquier uso comercial del sistema completo.
- Sesgos: no hay analisis de sesgos publicado. En un modelo de control motor, los sesgos relevantes serian de distribucion de escenas y de estilo de teleoperacion, no linguisticos.
- Estado de validacion comunitaria nulo: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ErvinZzz/psi0-sonic-shopping
- Repositorio de Psi0 (PSI-lab, USC): https://github.com/physical-superintelligence-lab/Psi0
- Controlador NVIDIA SONIC v1.1 / GR00T-WholeBodyControl: https://github.com/NVlabs/GR00T-WholeBodyControl
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas de ayuda de YouTube TV y articulos sin relacion con Psi0, Unitree G1 o SONIC.
