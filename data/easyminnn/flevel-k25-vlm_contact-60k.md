# easyminnn/flevel-k25-vlm_contact-60k

## Resumen

`easyminnn/flevel-k25-vlm_contact-60k` es un checkpoint de inferencia para robotica de tipo VLA (vision-language-action) afinado a partir de `nvidia/GR00T-N1.5-3B`. Lo publica el usuario `easyminnn` y pertenece a la familia F-level, una linea de trabajo centrada en la compresion de *action chunks*: en lugar de emitir una unica secuencia de acciones, el modelo incorpora dos decodificadores en paralelo, uno a velocidad 1x y otro comprimido a 2,5x. El checkpoint concreto usa `level_ks=(1, 2.5)` y la variante de etiquetas `vlm_contact`, entrenada durante 60.000 pasos.

El modelo resuelve un problema clasico en politicas de manipulacion: decidir cuando merece la pena ejecutar acciones con resolucion temporal completa (tramas de contacto, ajustes finos) y cuando se puede comprimir el flujo de acciones para ganar velocidad sin perder exito en la tarea. Para ello incorpora una cabeza de confianza que predice, a partir de etiquetas de ratio de velocidad generadas por un VLM, si el flujo comprimido es suficiente. Esta informacion se hornea dentro del tensor de acciones en la ranura `ratio_label` (dimensiones 12:14).

Es relevante ahora porque se apoya en el ecosistema GR00T de NVIDIA, un estandar emergente para VLA en robotica, y porque publica un mecanismo de decodificacion dual poco habitual en modelos abiertos de este tamano (2,99 mil millones de parametros). El checkpoint se distribuye como "inference-only": conserva pesos y configuracion, pero se han eliminado el estado de optimizador, scheduler y RNG, por lo que esta pensado exclusivamente para servir y evaluar, no para reanudar entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T-N1.5, con decodificador de acciones dual (flujo 1x + flujo comprimido 2,5x) |
| Parametros totales | 2.987.893.697 (~2,99 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; el entrenamiento uso bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada heredada de `nvidia/GR00T-N1.5-3B`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,6 GB |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `nvidia/GR00T-N1.5-3B`, un VLA de tipo "dual-system" en el que un backbone de vision-lenguaje procesa observaciones visuales e instrucciones en lenguaje natural, y una cabeza de generacion de acciones produce *action chunks* ejecutables por el robot. Sobre esa base, la variante F-level anade un segundo decodificador: el flujo 1x emite 16 filas de acciones y el flujo comprimido 2,5x emite 6 filas cubriendo 15 pasos, con un patron de reparto `[2,3,2,3,2,3]`. Ademas incorpora una cabeza de confianza escalar (regresion con perdida MSE y `ratio_loss_coef=0.1`) cuyo *readout* esta desacoplado del codificador de estado.

El entrenamiento se realizo sobre RoboCasa MG 300, un conjunto de 7.200 episodios con 3 camaras de 256x256 a 20 fps, durante 60.000 pasos con batch global 64 (32 x 2 GPU), optimizador AdamW con learning rate 1e-4, schedule coseno, warmup 0.05, semilla 42 y precision bf16 sobre 2x H200. La innovacion principal es la etiqueta de ratio de velocidad generada por un VLM y horneada en el tensor de acciones: el objetivo de confianza es `conf * (1 - fixed)`, con la confianza forzada a 0 en las tramas de contacto para que el modelo tienda a no comprimir cuando hay interaccion fisica critica. Las etiquetas provienen del dataset `prehj/robocasa-ratio-labels-contact`.

## Capacidades

- Generacion de acciones roboticas en formato de *action chunks* mediante decodificacion especulativa o dual: un flujo a 1x y otro comprimido a 2,5x.
- Seleccion adaptativa del flujo segun una cabeza de confianza entrenada con etiquetas de ratio de velocidad de un VLM.
- Compresion de tramas de accion con patrones no uniformes (`[2,3,2,3,2,3]`), lo que permite 6 filas para 15 pasos.
- Procesamiento de vision multi-camara: tres camaras a 256x256 y 20 fps en el dataset de entrenamiento.
- Condicionamiento por instruccion en lenguaje natural, heredado del backbone VLM de GR00T-N1.5.
- Deteccion implicita de tramas de contacto: la confianza se fuerza a 0 en esos instantes, evitando la compresion en fases delicadas.
- Umbral de decision ajustable en tiempo de evaluacion mediante `tau` (`conf_threshold`), cuyo valor almacenado (0.5) es solo un valor por defecto, no una constante entrenada.
- No se documentan capacidades de generacion de texto, *tool calling*, agentes, matematicas ni audio.

## Casos de uso

- Manipulacion robotica con contacto: el modelo puede ejecutar tareas que requieren precision en el momento del contacto fisico, ya que la cabeza de confianza desactiva la compresion en esas tramas y prioriza el flujo 1x.
- Investigacion en compresion de *action chunks*: sirve como referencia reproducible para estudiar cuanta compresion temporal tolera una politica VLA sin degradar la tasa de exito, gracias a su comparacion directa entre flujo 1x y 2,5x.
- Evaluacion en el benchmark RoboCasa MG 300: el checkpoint esta afinado especificamente sobre ese conjunto de 7.200 episodios con 3 camaras, por lo que es adecuado para medir *success rate* en ese entorno.
- Control de brazos robot en laboratorio: con `serve_flevel_robocasa.py --mode ratio_current`, el cliente recibe las filas de accion ya resueltas y las ejecuta tal cual, sin re-mezcla, lo que simplifica la integracion en un bucle de control a 20 fps.
- Experimentos de umbral adaptativo: el parametro `tau` permite a un investigador estudiar el compromiso entre velocidad de ejecucion y fidelidad de la politica, desplazando el corte entre el flujo comprimido y el completo.
- *Fine-tuning* posterior de politicas de robotica: al partir de GR00T-N1.5-3B y estar publicado en safetensors, el checkpoint puede servir de inicializacion para nuevas variantes de decodificador o de etiquetado.
- Validacion de etiquetas VLM en robotica: el uso de `prehj/robocasa-ratio-labels-contact` permite auditar como se comportan las etiquetas derivadas de un VLM cuando se convierten en senal de entrenamiento para una cabeza auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, comparaciones numericas con el modelo base ni curvas de evaluacion para el checkpoint de 60.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, solo los pesos ocupan aproximadamente 5,97 GB (2,99 mil millones de parametros x 2 bytes); en fp32 serian unos 11,95 GB. Hay que sumar el coste de activaciones, el codificador de vision de tres camaras 256x256 y la cabeza de acciones, por lo que conviene reservar margen adicional. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizo sobre 2x H200, pero para inferencia basta una GPU de gama alta con al menos ~10-16 GB de VRAM. Una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 (40/80 GB) son opciones holgadas.
- Cabe en GPU de consumo: si. Una RTX 4090 o RTX 3090 ejecutan el modelo sin problemas en bf16. En tarjetas de 12 GB (RTX 4070, 3060) el margen es ajustado y puede requerir reduccion de precision o de resolucion de camara.
- Opciones de despliegue: el autor indica servir con `serve_flevel_robocasa.py --model-path <repo> --mode ratio_current`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y estos motores no cubren arquitecturas VLA con cabeza de acciones, por lo que no son aplicables sin desarrollo adicional.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturo a 20 fps y el patron comprimido cubre 15 pasos en 6 filas, lo que sugiere un objetivo de control en tiempo real, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `easyminnn/flevel-k25-vlm_contact-60k` | 2,99 mil millones | no disponible | other | HuggingFace (0 descargas) | Decodificador dual 1x / 2,5x, etiquetas VLM de contacto |
| `nvidia/GR00T-N1.5-3B` | ~3 mil millones | no disponible | licencia NVIDIA | HuggingFace | Modelo base, sin decodificador dual ni cabeza de confianza |
| `OpenVLA-7B` | 7 mil millones | no disponible | licencia abierta (Llama 2) | HuggingFace | VLA generico de referencia; mayor tamano, sin flujo comprimido |
| `pi0` (Physical Intelligence) | ~3,3 mil millones | no disponible | no disponible | no disponible | VLA con *flow matching*; comparable en escala pero con otra estrategia de accion |

Las cifras de parametros de los modelos comparables proceden de informacion publica general y no de la documentacion de este repositorio. Los campos marcados como no disponibles no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican benchmarks, tasas de exito ni comparaciones cuantitativas con el modelo base o con alternativas; la evaluacion queda enteramente en manos de quien lo despliegue.
- El checkpoint es "inference-only": no incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento desde el.
- La licencia es `other`, heredada de `nvidia/GR00T-N1.5-3B`; antes de un uso comercial hay que revisar los terminos exactos del modelo base, que no se detallan en este repositorio.
- El ambito de entrenamiento esta acotado a RoboCasa MG 300 (3 camaras 256x256, 20 fps) y a tareas de manipulacion; es probable que generalice mal a otras morfologias de robot, resoluciones o dominios visuales.
- No hay informacion sobre idiomas soportados ni sobre la composicion linguistica de las instrucciones; se desconoce el comportamiento fuera del ingles.
- La cabeza de confianza fuerza el valor 0 en las tramas de contacto, de modo que el flujo comprimido se desactiva en esas fases por diseno; un ajuste agresivo de `tau` puede degradar tareas que requieren contacto preciso.
- `tau` es un parametro de evaluacion, no una constante entrenada: distintos valores producen comportamientos distintos y hay que calibrarlo por tarea.
- Riesgo de alucinacion de acciones y de deriva en ejecuciones largas, comun en politicas VLA; no se documentan mecanismos de seguridad ni de parada ante fallo.
- El repositorio no registra descargas ni likes, lo que limita la evidencia externa sobre su reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/easyminnn/flevel-k25-vlm_contact-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Dataset de etiquetas: `prehj/robocasa-ratio-labels-contact` (referenciado en la model card)
- Codigo: `TTKKWAN/F_level`, rama `hj-two-decoder-conf` @ 29a1090, script `papers/reproducing/FLARE/scripts/train_flevel_ratio.py`
- Comando de servicio indicado por el autor: `serve_flevel_robocasa.py --model-path <repo> --mode ratio_current`
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados obtenidos correspondian a paginas de un operador de telecomunicaciones, sin relacion con el modelo).
