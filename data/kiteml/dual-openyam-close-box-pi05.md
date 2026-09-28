# kiteml/dual-openyam-close-box-pi05

# kiteml/dual-openyam-close-box-pi05

## Resumen

`kiteml/dual-openyam-close-box-pi05` es un checkpoint de politica robotica (VLA, *vision-language-action*) del tipo π0.5, publicado por el usuario kiteml, que ha sido ajustado a partir de `lerobot/pi05_base` para que un robot bimanual OpenYAM ejecute la tarea de cerrar una caja. No es un modelo de lenguaje conversacional: es una politica de control que consume imagenes de camaras y el estado de las articulaciones, y produce comandos de actuador. El repositorio contiene 4.143.404.816 parametros en safetensors (9,4 GB) y se distribuye con licencia Gemma.

La arquitectura heredada de π0.5, sucesora de π0 segun la model card, combina un modelo PaliGemma (codificador visual y *backbone* de lenguaje) con un experto de acciones entrenado por *flow matching*. El ajuste se hizo con LeRobot v0.6.0 sobre el dataset `kiteml/dual-openyam-close-box` (31 episodios, 33.247 fotogramas a 30 fps), actualizando todos los parametros excepto el codificador visual, durante 5.000 pasos con tamano de lote 2 en una unica NVIDIA A100 de 40 GB.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible de ajuste fino de una VLA sobre un dataset pequeno y de un solo operador, y como pieza de una familia de politicas comparables entrenadas sobre los mismos datos (ACT, Diffusion Policy, π0, π0-FAST, SmolVLA, VLA-JEPA y X-VLA). El propio autor indica que el modelo no ha sido evaluado: no hay despliegues en robot ni en simulacion puntuados, por lo que no existe ninguna tasa de exito publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5: PaliGemma (codificador visual + modelo de lenguaje) con experto de acciones por *flow matching* |
| Parametros totales | 4.143.404.816 (≈ 4,14 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (la politica no documenta ventana de contexto textual; consume 3 imagenes y un vector de estado) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | No disponible; la instruccion de tarea se proporciona en ingles (`"close the box"`) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | Safetensors (repositorio de 9,4 GB, libreria `lerobot`) |
| Modelo base | `lerobot/pi05_base` (ajuste fino completo salvo el codificador visual) |
| Entradas | `observation.images.top`, `observation.images.left_wrist`, `observation.images.right_wrist` (3×480×640, RGB) y `observation.state` (14 dimensiones) |
| Salidas | `action`: 14 dimensiones (6 articulaciones por brazo + 2 pinzas) |
| Acciones por inferencia | 50 acciones, ejecutadas en su totalidad (1,7 s a 30 fps) |
| Dataset de entrenamiento | `kiteml/dual-openyam-close-box`: 31 episodios, 33.247 fotogramas a 30 fps |
| Hardware de entrenamiento | 1× NVIDIA A100 40 GB |
| Pasos de entrenamiento | 5.000 pasos, lote de 2, AdamW con lr 2,5e-5, decaimiento coseno con *warmup*, bfloat16 |
| Perdida final de entrenamiento | 0,041 |
| Creado / actualizado | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

π0.5 es la sucesora de π0 segun la model card del autor y se describe como una VLA basada en PaliGemma con un experto de acciones de *flow matching*. El *backbone* PaliGemma aporta la codificacion visual (tres vistas RGB de 480×640, incluida una camara en cada muneca) y el procesamiento de la instruccion de tarea; el experto de acciones genera, mediante *flow matching*, una secuencia de comandos de 14 dimensiones que se corresponde con el espacio de estado (6 articulaciones por brazo mas las dos pinzas). En cada llamada de inferencia la politica predice 50 acciones y las ejecuta todas, lo que equivale a 1,7 segundos de control a 30 fps.

El ajuste fino se realizo con LeRobot v0.6.0 sobre el dataset `kiteml/dual-openyam-close-box`, que contiene 31 episodios y 33.247 fotogramas a 30 fps de un unico comportamiento (cerrar la caja). Se inicializaron los pesos desde `lerobot/pi05_base` y se entrenaron todos los parametros excepto el codificador visual, durante 5.000 pasos con tamano de lote 2, optimizador AdamW (lr 2,5e-5, decaimiento coseno con *warmup*) y precision bfloat16 sobre una A100 de 40 GB. La model card no detalla la composicion del dataset mas alla de su recuento, ni indica si hubo RLHF, DPO o etapas adicionales de post-entrenamiento; el unico valor reportado es la perdida final de entrenamiento (0,041).

## Capacidades

- Generacion de acciones de manipulacion bimanual: produce comandos de 14 dimensiones (6 articulaciones por brazo + 2 pinzas) coherentes con el espacio de estado del robot OpenYAM.
- Percepcion multi-vista: procesa simultaneamente tres camaras RGB de 480×640 (vista superior y una por muneca), lo que permite coordinacion entre ambos brazos y aproximacion al objeto.
- Control en bucle abierto por bloques: predice 50 acciones por inferencia y las ejecuta en secuencia (1,7 s a 30 fps), sin re-planificacion documentada dentro del bloque.
- Condicionamiento por instruccion de tarea: acepta una cadena de tarea (`observation["task"]`), en la practica la instruccion en ingles `"close the box"` con la que fue entrenado.
- Integracion con el ecosistema LeRobot: compatible con `get_policy_class("pi05")`, `make_pre_post_processors`, `lerobot-record` y `lerobot-eval` (se requiere LeRobot v0.6.0 o superior).
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje con API de herramientas.
- No soporta razonamiento multi-paso basado en lenguaje ni capacidades de agente en el sentido de los LLM.
- Capacidades multilingues: no disponibles; la politica no se presenta como modelo linguistico multilingue.
- Capacidades especiales: ninguna adicional documentada (sin modo *thinking*, sin vision de proposito general, sin audio).

## Casos de uso

- Cierre de cajas en linea de empaquetado: es exactamente la tarea para la que fue entrenado, con el robot bimanual OpenYAM y la configuracion de tres camaras descrita; se usaria como politica de control invocando `select_action` en bucle con las observaciones del robot.
- Baseline de ajuste fino para nuevas tareas bimanuales: partiendo de este checkpoint, un equipo puede recoger un dataset pequeno propio (decenas de episodios) y repetir el procedimiento documentado (5.000 pasos, A100 40 GB, LeRobot v0.6.0) para obtener una politica especifica.
- Comparativa de familias de politicas: el autor publica variantes equivalentes sobre el mismo dataset (ACT, Diffusion Policy, π0, π0-FAST, SmolVLA, VLA-JEPA, X-VLA), lo que permite evaluar el efecto de la arquitectura manteniendo datos y encarnacion constantes.
- Investigacion en *flow matching* aplicado a control: el checkpoint permite estudiar el comportamiento del experto de acciones y del bloque de 50 acciones sin reentrenar desde cero.
- Docencia y prototipado en robotica: al ser un modelo pequeno en parametros (~4,14 mil millones) y con receta de entrenamiento publicada sobre una sola GPU, es util en laboratorios academicos para ilustrar el ciclo completo de imitacion, desde la recogida de datos con LeRobot hasta el despliegue.
- Estudio de latencia y compromiso de reactividad: al ejecutar 1,7 s de acciones por inferencia, sirve para medir como el *chunking* afecta a la respuesta ante perturbaciones externas en un montaje real.
- Validacion de infraestructura de entrenamiento e inferencia: el repositorio se puede usar para comprobar el soporte de LeRobot v0.6.0, los preprocesadores y postprocesadores del pipeline `pi05` y el consumo de VRAM antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente `Not evaluated yet`: no se han puntuado despliegues ni en el robot fisico ni en simulacion, y no hay tasa de exito, MMLU, HumanEval ni metrica equivalente (no son aplicables a una politica de control). El unico valor numerico reportado se reproduce a continuacion, con la advertencia de que no es una medida de rendimiento en tarea:

| Metrica | Valor | Naturaleza |
|---|---|---|
| Perdida final de entrenamiento | 0,041 | Perdida de ajuste sobre el dataset, no comparable con benchmarks |
| Tasa de exito en robot | No disponible | No evaluado |
| Tasa de exito en simulacion | No disponible | No evaluado |

## Requisitos de hardware

- Entrenamiento reproducido: 1× NVIDIA A100 40 GB, bfloat16, lote de 2 durante 5.000 pasos (dato aportado por el autor).
- Inferencia: no publicada. Calculo derivado a partir del numero de parametros (no verificado por el autor):

| Precision | Peso de los parametros (calculado) | Comentario |
|---|---|---|
| bfloat16 / float16 | ≈ 7,7 GiB | Solo pesos; faltan activaciones de 3 imagenes de 480×640 y el estado del experto de acciones |
| float32 | ≈ 15,4 GiB | Precision completa |
| int8 | ≈ 3,9 GiB | Cuantizacion no documentada para este modelo |
| int4 | ≈ 1,9 GiB | Cuantizacion no documentada para este modelo |

- GPU consumer: no hay confirmacion oficial. Por el peso calculado en bfloat16, es plausible que quepa en tarjetas de 24 GB (RTX 3090, RTX 4090) dejando margen para activaciones, pero no esta verificado ni documentado.
- VRAM total real necesaria: no disponible; el autor no reporta consumo de memoria en inferencia.
- Opciones de despliegue: LeRobot v0.6.0 o superior (API Python con `get_policy_class("pi05")` y `make_pre_post_processors`, o CLI con `--policy.path=kiteml/dual-openyam-close-box-pi05` en `lerobot-record` y `lerobot-eval`), sobre PyTorch.
- Sin soporte documentado en vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia de texto; el pipeline es `robotics`, no `text-generation`.
- Latencia y throughput: no disponibles. Como referencia de cadencia, cada inferencia cubre 1,7 s de ejecucion a 30 fps, lo que impone un limite de frecuencia de re-planificacion.

## Comparativa con modelos similares

El autor publica un conjunto de politicas entrenadas sobre el mismo dataset (`kiteml/dual-openyam-close-box`), lo que constituye la comparativa natural. No se han facilitado parametros, licencias ni resultados para las alternativas; todas ellas aparecen en el mismo perfil de HuggingFace.

| Modelo | Enfoque | Parametros | Resultados publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kiteml/dual-openyam-close-box-pi05` | VLA π0.5 con experto de acciones por *flow matching* | 4,14 mil M (safetensors) | No evaluado; solo perdida de entrenamiento 0,041 | Gemma | HuggingFace (LeRobot) |
| `kiteml/dual-openyam-close-box-pi0` | VLA π0, predecesor directo | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-pi0_fast` | π0 con tokenizacion de acciones tipo FAST | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-act` | ACT (transformer de imitacion) | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-diffusion` | Diffusion Policy | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-smolvla` | VLA compacto (SmolVLA) | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-vla_jepa` | VLA-JEPA | No disponible | No disponible | No disponible | HuggingFace |
| `kiteml/dual-openyam-close-box-xvla` | X-VLA | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor indica `Not evaluated yet`; no existen tasas de exito ni en robot real ni en simulacion, por lo que el rendimiento en la tarea es desconocido.
- La perdida final de entrenamiento (0,041) no es una medida de exito en tarea; puede coexistir con un comportamiento deficiente en el robot.
- Dataset muy reducido: 31 episodios y 33.247 fotogramas de una unica tarea, con lote de 2 durante 5.000 pasos; el riesgo de sobreajuste a las condiciones concretas de recogida es alto.
- Tarea unica: la politica esta entrenada para "close the box"; no se documenta generalizacion a otras instrucciones ni a otras tareas sin reentrenamiento.
- Encarnacion fija: disenada para un OpenYAM bimanual con estado y accion de 14 dimensiones (6+6 articulaciones y 2 pinzas). No es trasladable a otro robot sin reentrenar la cabeza de acciones.
- Configuracion sensorial fija: requiere exactamente tres camaras de 480×640 (superior, muneca izquierda, muneca derecha); cambiar el numero, la posicion o la resolucion invalida la politica.
- Reactividad limitada por el *chunking*: cada inferencia planifica 50 acciones (1,7 s) y las ejecuta todas; el autor no documenta interrupcion ni re-planificacion ante perturbaciones.
- Idioma: la politica consume la instruccion de tarea en ingles y no se presenta como modelo multilingue.
- Alucinacion en sentido robotico: un fallo del modelo se traduce en acciones fisicas incorrectas sobre el robot, con riesgo material. Cualquier despliegue real exige limites de par, paradas de emergencia y supervision.
- Sesgos: no aplica el concepto de sesgo linguistico, pero si un sesgo de dominio derivado de un dataset de un solo operador, una sola configuracion de camaras y una sola tarea.
- Licencia: Gemma, que no es una licencia aprobada por la OSI; sujeta a los terminos de uso de Google Gemma, con restricciones de uso y obligaciones de redistribucion que hay que revisar antes de cualquier uso comercial. La licencia del modelo base `lerobot/pi05_base` no se detalla en la informacion disponible.
- Madurez del repositorio: 0 descargas y 0 *likes* en el momento de la consulta, y una unica fecha de creacion y actualizacion; sin mantenimiento ni soporte documentado.
- Compatibilidad estricta: requiere LeRobot v0.6.0 o superior; versiones anteriores pueden fallar al cargar la politica o los preprocesadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiteml/dual-openyam-close-box-pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/kiteml/dual-openyam-close-box
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de π0.5 (referenciado en los tags del modelo): https://huggingface.co/papers/2504.16054 · https://arxiv.org/abs/2504.16054
- LeRobot (libreria y CLI): https://github.com/huggingface/lerobot
- Kite (plataforma con la que se entreno): https://kiteml.com
- Politicas alternativas sobre el mismo dataset:
  - https://huggingface.co/kiteml/dual-openyam-close-box-act
  - https://huggingface.co/kiteml/dual-openyam-close-box-diffusion
  - https://huggingface.co/kiteml/dual-openyam-close-box-pi0
  - https://huggingface.co/kiteml/dual-openyam-close-box-pi0_fast
  - https://huggingface.co/kiteml/dual-openyam-close-box-smolvla
  - https://huggingface.co/kiteml/dual-openyam-close-box-vla_jepa
  - https://huggingface.co/kiteml/dual-openyam-close-box-xvla
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relacionados con este modelo (los unicos resultados obtenidos fueron recetas de cocina sin relacion), por lo que no se incluye ningun enlace adicional procedente de la busqueda.
