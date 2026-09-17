# RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k

## Resumen

`RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k` es un checkpoint de politica robotica de tipo vision-language-action (VLA) perteneciente a la familia pi0.5, implementado de forma nativa en LeRobot v0.6.1 y afinado por el usuario RyanL22 a partir de `lerobot/pi05_base`. El modelo consume dos vistas de camara ZED a 288x512 (una frontal/base y otra en la muneca derecha) junto con un vector de estado de 28 dimensiones, y produce secuencias de 50 acciones a 20 fps (2,5 s de ejecucion) en espacio articular absoluto, cubriendo cuello (2), brazos (7+7) y manos RH56F1 (6+6).

Su interes no esta en el lenguaje ni en el razonamiento textual, sino en la receta de datos: se ha entrenado sobre la mezcla `anyh2r` del 16 de septiembre de 2026, compuesta por 12 celdas sinteticas generadas a partir de video humano (466 episodios con etiquetas IDM corregidas por cinematica inversa de muneca) y 4 celdas reales de teleoperacion (pelota, caja, muneco, botella). Esto lo convierte en un artefacto de investigacion util para evaluar co-entrenamiento sintetico-real en manipulacion bimanual, no en un modelo listo para produccion: acumula 0 descargas y 0 "likes" desde su publicacion el 17 de septiembre de 2026.

El checkpoint corresponde al paso 30.000 (final) de una ejecucion de 30.000 pasos realizada sobre 4x A100 de 80 GB en Kakao, con 4.143.404.816 parametros totales y pesos en safetensors (9,4 GB de repositorio) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (politica VLA) implementada en LeRobot v0.6.1; encoder de vision SigLIP de 412,4M; detalles internos del generador de acciones no disponibles |
| Parametros totales | 4.143.404.816 (4,14B) |
| Parametros activos | No aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; la politica opera con `n_obs_steps=1` (una unica observacion) y horizonte de accion de 50 pasos |
| Tipos de cuantizacion | No disponible; el entrenamiento uso bfloat16 y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; no se documentan entradas de lenguaje o instrucciones de texto (solo imagenes y estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 9,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no un adaptador) de `lerobot/pi05_base`. La unica pieza arquitectonica cuantificada en la model card es el encoder de vision SigLIP, con 412,4 millones de parametros, que se entrena y no se congela. La politica consume dos imagenes (`observation.images.base_0_rgb`, vista ZED izquierda, y `observation.images.left_wrist_0_rgb`, vista ZED derecha) y un estado de 28 dimensiones con el reparto `neck(2) | left_arm(7) | right_arm(7) | left_hand(6) | right_hand(6)`; la salida `action` replica ese mismo layout como objetivos articulares absolutos. La model card no especifica el mecanismo de generacion de acciones (flow matching, difusion o regresion directa), por lo que ese detalle queda como no disponible.

Los datos de entrenamiento son la mezcla `RyanL22/anyh2r-pi05-0916-merged`: 16 celdas en total, 12 sinteticas derivadas de video humano (466 episodios con etiquetas IDM corregidas mediante cinematica inversa de muneca) y 4 celdas reales de teleoperacion (pelota, caja, muneco, botella). El muestreo entre celdas es proporcional a la raiz cuadrada del numero de fotogramas. Se aplica aumento fotometrico y afin, con una unica tirada aleatoria replicada en el par estereo, y se desactiva explicitamente el aumento de espejo (volteo izquierda/derecha). El entrenamiento uso lote 16 por GPU en 4 GPUs (64 efectivo), AdamW con lr maxima 2,5e-5 y decaimiento coseno hasta 2,5e-6, 1.000 pasos de calentamiento, precision bfloat16 y gradient checkpointing, durante 30.000 pasos. No se documenta RLHF, DPO ni ninguna fase de alineacion post-supervisada; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones en bloque (action chunking) de 50 pasos a 20 fps, equivalente a 2,5 segundos de control por inferencia, en espacio articular absoluto.
- Control de 28 grados de libertad en un setup bimanual: cuello (2), brazo izquierdo (7), brazo derecho (7), mano izquierda (6) y mano derecha (6) con efector RH56F1.
- Percepcion visual estereo con dos puntos de vista (camara base y camara de muneca), a resolucion 288x512 por vista.
- Politica de un solo paso de observacion (`n_obs_steps=1`): no mantiene historial explicito ni memoria de estados previos.
- Normalizacion integrada en el pipeline: imagenes con transformacion identidad y estado/accion con cuantiles (estadisticas en `policy_preprocessor_*`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, entrada de lenguaje, vision generalista ni audio.
- Capacidades multilingues: no aplica segun la informacion disponible (no hay entrada ni salida de texto).

## Casos de uso

- Investigacion en manipulacion bimanual de laboratorio: serviria como referencia reproducible para tareas de pick-and-place sobre los cuatro objetos vistos en teleoperacion (pelota, caja, muneco, botella) con un chasis OpenArm y manos RH56F1.
- Evaluacion de co-entrenamiento sintetico-real: al mezclar 12 celdas sinteticas con 4 reales, permite medir de forma aislada el efecto de la proporcion de datos sinteticos sobre el exito en el robot real.
- Validacion de etiquetado IDM con cinematica inversa de muneca: util para comparar la calidad de etiquetas generadas a partir de video humano frente a etiquetas de teleoperacion directa.
- Generacion autonoma de datos (autonomous data collection): la politica puede desplegarse para producir trayectorias adicionales que amplien el dataset antes de un reentrenamiento posterior.
- Transferencia a nuevo hardware con la misma topologia de 28 DoF: al estar en espacio articular absoluto, sirve como punto de partida de fine-tuning para otro robot con el mismo reparto de articulaciones.
- Estudio de robustez visual con estereo: la doble vista (base y muneca derecha) permite analizar el efecto de oclusion y de cambios fotometricos en tareas de agarre fino.
- Ablacion de aumentos de datos: al estar documentado que el espejo se desactiva y que el afin se replica en el par estereo, es un punto de partida controlado para medir el impacto de cada aumento.
- Control reactivo de horizonte corto: con bloques de 2,5 s a 20 fps, encaja en bucles de control que replanifican tras cada bloque sin requerir planificacion de largo horizonte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en el robot, metricas de error articular ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- Peso de los parametros en bfloat16: aproximadamente 8,3 GB (4.143.404.816 parametros x 2 bytes). En fp32 ascenderia a unos 16,6 GB.
- VRAM de inferencia estimada: del orden de 10-14 GB en bfloat16, sumando pesos, activaciones del encoder SigLIP sobre dos vistas de 288x512 y el bucle de generacion del bloque de acciones. Es una estimacion orientativa, no una cifra publicada.
- Entrenamiento documentado: 4x A100 de 80 GB con lote 16 por GPU, bfloat16 y gradient checkpointing.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; con 16 GB el margen es ajustado y depende de la implementacion del bucle de decodificacion.
- Opciones de despliegue: la ruta documentada es la libreria LeRobot, cargando `PI05Policy.from_pretrained("RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k")`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que en cualquier caso no son habituales para politicas VLA de control robotico.
- Latencia y throughput: no disponibles como tiempo de inferencia. Se conoce unicamente el horizonte de control: 50 acciones a 20 fps, es decir 2,5 s de ejecucion por bloque generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k | 4,14B | `n_obs_steps=1`; bloque de 50 acciones a 20 fps | No publicado | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras politicas VLA de la misma categoria (por ejemplo, la familia pi0 o equivalentes de manipulacion bimanual) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de especificaciones de modelos alternativos que permitan una comparacion cuantitativa rigurosa; la unica relacion documentada es la dependencia directa respecto a `lerobot/pi05_base`.

## Limitaciones y advertencias

- Base de datos muy reducida: 466 episodios sinteticos y 4 celdas reales de teleoperacion, un volumen bajo para esperar generalizacion fuera de los objetos y escenas vistos.
- Etiquetas sinteticas derivadas de video humano con correccion por cinematica inversa de muneca: cualquier error sistematico de ese etiquetado se hereda en el comportamiento de la politica.
- Politica de un solo paso de observacion (`n_obs_steps=1`): no hay memoria explicita de estados anteriores, lo que limita tareas que requieran seguimiento de estado a largo plazo.
- Aumento de espejo desactivado: el modelo no ha visto configuraciones reflejadas, lo que puede reducir su robustez ante cambios de lateralidad.
- Espacio de accion cerrado: 28 dimensiones en un layout concreto (`neck | left_arm | right_arm | left_hand | right_hand`) con objetivos articulares absolutos; no es portable sin cambios a robots con otra topologia.
- Sin entrada de lenguaje documentada: no se puede condicionar por instrucciones de texto ni integrar en flujos de tipo agente.
- Riesgo de alucinacion en el sentido de que la politica puede generar trayectorias plausibles pero fisicamente invalidas; no hay metricas publicadas de tasa de exito ni de seguridad.
- Sin datos de sesgo publicados; en robotica el sesgo relevante es de distribucion de escenas, iluminacion y objetos, no linguistico.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias ni soporte, y el modelo no ha sido validado en produccion (0 descargas, 0 likes en el momento de redactar esta ficha).
- Repositorio de 9,4 GB: hay que prever espacio en disco y tiempos de descarga antes de evaluarlo.
- Unicamente disponible para la libreria `lerobot`; no se documentan exportaciones a otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-0916-wristik-30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/RyanL22/anyh2r-pi05-0916-merged
- Libreria LeRobot: referenciada como `lerobot` v0.6.1 en la model card (dependencia de carga del modelo)
- Resultados de busqueda web: no se ha encontrado ninguna fuente relevante; las unicas coincidencias devueltas fueron paginas de un servicio de webmail sin relacion con el modelo.
