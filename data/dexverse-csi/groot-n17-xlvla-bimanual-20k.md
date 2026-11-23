# Dexverse-CSI/groot-n17-xlvla-bimanual-20k

## Resumen

GR00T N1.7 xlvla bimanual 20k es un ajuste fino completo del modelo fundacional de robotica NVIDIA GR00T-N1.7-3B, publicado por Dexverse-CSI. El modelo parte de los pesos de NVIDIA y se reentrena sobre el conjunto de datos propio de DexVerse, centrado en manipulacion bimanual con seis manos distintas y cuatro tareas de destreza. Con 3.144.016.000 parametros, se distribuye en formato safetensors con un repositorio de 27,6 GB y se carga mediante la libreria `gr00t` del ecosistema Isaac-GR00T.

El objetivo del ajuste es disponer de una politica visomotora (vision-language-action, VLA) capaz de generar acciones de 62 dimensiones a partir de observaciones de tres camaras (tercera persona, eye-in-hand derecha y eye-in-hand izquierda) y de una instruccion de tarea en lenguaje natural. El modelo se entrena con horizonte de accion de 10 pasos sobre un horizonte nativo de 40, con acciones absolutas y no end-effector, lo que lo hace directamente aplicable a control de bajo nivel en simulacion y en robot real con la misma representacion de estado.

La relevancia actual radica en que es un punto de comparacion reproducible frente a la linea base pi0.5 del mismo autor (`Dexverse-CSI/xlvla-pi05`), usando exactamente los mismos datos, estadisticas de normalizacion y prompts, lo que permite aislar el efecto de la arquitectura GR00T N1.7 frente a pi0.5 en tareas de manipulacion bimanual. Es un modelo de investigacion con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7 (backbone LLM + vision encoder + projector + cabeza DiT de difusion para acciones) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (prompts de tarea en lenguaje natural; el autor no declara cobertura idiomatica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` en la raiz, paso 20000; `checkpoints/<step>/` con pesos de otros pasos, no reanudables) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de GR00T N1.7-3B: se actualizan el LLM, el codificador de vision, el proyector y el bloque DiT (diffusion transformer) que genera las acciones. La entrada combina imagenes de tres camaras (tercera persona, eye-in-hand derecha y eye-in-hand izquierda) con una frase de tarea; la salida es una secuencia de acciones de 62 dimensiones, definidas como `[right 31 | left 31]`, en espacio absoluto y no end-effector, con horizonte de accion de 10 (indices delta 0..9) sobre el horizonte nativo de 40 del modelo.

Los datos de entrenamiento son 1.200 episodios de teleoperacion (celulas `Dexverse-CSI/teleop_*`, 50 por celula) a 60 fps, que cubren seis manos y cuatro tareas: OpenFlatFolder-v1, SlideUtilityKnife-v1, BimanualLiftTray-v0 y BimanualLiftCarton-v0. El estado y la accion se reconstruyeron con el codigo `cross_dex` de xlvla y una calibracion de muneca medida en simulador (`training/configs/wrist_calib_*.json`); las estadisticas resultantes coinciden con las `norm_stats` de xlvla-pi05 (diferencia maxima de media <= 0,0004 y de desviacion tipica <= 0,0005). Los videos se re-codificaron de AV1 a H.264. El prompt es unicamente la frase de tarea, sin identidad de mano, con las mismas cadenas que pi0.5.

El entrenamiento se ejecuto con Isaac-GR00T en el commit `708617f`, script `launch_finetune.py`, con embodiment `NEW_EMBODIMENT` (`training/configs/dexverse_bimanual_config.py`), normalizacion q01/q99, batch global de 128 (4 GPU B200, 32 por GPU), learning rate 1e-4 con warmup del 5 % y decaimiento coseno, 20.000 pasos y precision bf16. No se documenta RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de acciones visomotoras bimanuales de 62 dimensiones (31 por mano) a partir de observaciones multimodales de tres camaras.
- Condicionamiento por instruccion de tarea en lenguaje natural (frase corta, sin identificador de mano).
- Manipulacion diestra multitarea: apertura de carpetas planas, deslizamiento de cuchillo de uso general, elevacion bimanual de bandeja y elevacion bimanual de carton.
- Generalizacion entre seis manos distintas dentro del mismo conjunto de datos, al compartir representacion de estado y accion.
- Control de horizonte corto: prediccion de 10 pasos de accion consecutivos por inferencia, pensada para re-planificacion frecuente en bucle cerrado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion comparativa de arquitecturas VLA: al compartir datos, prompts y estadisticas de normalizacion con `Dexverse-CSI/xlvla-pi05`, permite medir de forma controlada la diferencia entre GR00T N1.7 y pi0.5 en las mismas cuatro tareas bimanuales.
- Politica de control bimanual en simulacion: el modelo consume estado de 62 dimensiones y tres flujos de imagen, y emite acciones absolutas no end-effector, por lo que se puede conectar directamente a un simulador que use esa misma convencion de estado sin capa de traduccion.
- Ajuste fino posterior con nuevas tareas: al ser un fine-tune completo con configuracion de embodiment `NEW_EMBODIMENT` y script de lanzamiento documentado, sirve como punto de partida para reentrenar sobre tareas adicionales manteniendo la representacion `[right 31 | left 31]`.
- Evaluacion de robustez ante cambios de camara: la inclusion de tercera persona mas dos eye-in-hand permite estudiar la contribucion de cada vista a la politica, por ejemplo ablacionando la vista eye-in-hand izquierda en inferencia.
- Reproduccion de resultados en robot real con seis manos: la calibracion de muneca medida en simulador y las acciones absolutas facilitan el traslado de la politica a plataformas fisicas que compartan el mismo esquema de cinematica.
- Docencia y demostraciones de manipulacion diestra: el modelo y sus checkpoints intermedios permiten ilustrar el efecto del numero de pasos de entrenamiento en el comportamiento de una politica VLA, aunque los checkpoints intermedios solo contienen pesos y no son reanudables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los pesos en safetensors suman 27,6 GB en el repositorio, lo que implica que la carga en bf16 requiere al menos ese espacio mas overhead de activaciones y buffers de vision.
- GPU de entrenamiento documentadas: 4 x NVIDIA B200 con 32 muestras por GPU y batch global de 128 en bf16.
- GPU recomendadas para inferencia: no disponible. No se confirma que quepa en GPU de consumo (RTX 4090, 24 GB) en bf16 dado el tamano de pesos; se requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: la libreria indicada es `gr00t` (ecosistema Isaac-GR00T). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para una politica VLA con cabeza DiT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 xlvla bimanual 20k (este modelo) | 3.144.016.000 | no disponible | 4 tareas bimanuales, 6 manos, 1.200 episodios | no disponible | Hugging Face, 0 descargas |
| Dexverse-CSI/xlvla-pi05 (linea base del autor) | no disponible | no disponible | mismas 4 tareas, mismos datos y prompts | no disponible | Hugging Face |
| nvidia/GR00T-N1.7-3B (modelo base) | 3B (aproximado por nombre) | no disponible | modelo fundacional generalista | no disponible | Hugging Face (NVIDIA) |

La comparacion de rendimiento entre estos tres modelos no esta disponible: el autor no publica tasas de exito ni metricas de evaluacion en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el conjunto de datos se limita a seis manos y cuatro tareas concretas, por lo que el comportamiento fuera de esa distribucion no esta caracterizado.
- Riesgo de alucinacion: en un modelo de accion, el equivalente es la generacion de trayectorias no validas fisicamente; no se documentan filtros de seguridad ni comprobaciones de colision.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y los prompts son frases de tarea cortas, sin identidad de mano; no se garantiza el funcionamiento con instrucciones mas largas o en otros idiomas.
- Licencia: no disponible. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base `nvidia/GR00T-N1.7-3B` y la del propio repositorio, que no se especifica.
- Los checkpoints intermedios en `checkpoints/<step>/` contienen solo pesos y no son reanudables, lo que impide continuar el entrenamiento desde ellos.
- El modelo se ha entrenado con acciones absolutas y no end-effector y con una calibracion de muneca concreta; usarlo con otra calibracion o convencion de estado invalida las estadisticas de normalizacion.
- Modelo de investigacion con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan cuantizaciones ni requisitos de VRAM, lo que dificulta planificar el despliegue en hardware distinto al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/groot-n17-xlvla-bimanual-20k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Linea base pi0.5 del autor: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Repositorio Isaac-GR00T (commit de entrenamiento `708617f`): no disponible como enlace directo en la informacion proporcionada
