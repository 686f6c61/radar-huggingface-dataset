# mattewg/pi05-so101-grab-adapter-30k

## Resumen

pi05-so101-grab-adapter-30k es el resultado de un ajuste fino (fine-tuning) del modelo base `physical-intelligence/pi05_base` sobre un conjunto de datos de teleoperacion de un brazo robotico SO-101. Lo desarrolla el usuario mattewg y se distribuye bajo licencia Apache 2.0 a traves de Hugging Face. No es un modelo de lenguaje: es una politica vision-lenguaje-accion (VLA) que recibe dos vistas de camara y el estado articular actual, y devuelve un bloque de 16 objetivos articulares absolutos a 15 Hz.

El modelo resuelve una tarea unica y muy concreta: agarrar un adaptador (`"Grab the adapter"` es la unica cadena de tarea presente en el conjunto de entrenamiento). Su relevancia es doble: por un lado, demuestra el flujo de trabajo de `openpi` y `lerobot` para llevar un modelo pi0.5 a un robot de bajo coste; por otro, sirve como caso de estudio de los problemas tipicos de la imitacion, como el bloqueo en la pose de fin de episodio documentado por el propio autor.

El entrenamiento se realizo durante 30.000 pasos con batch 32 sobre 101 episodios y 72.441 fotogramas, en 4 GPU A100 de 64 GB con FSDP, y alcanzo una perdida final de 0,00279. El repositorio ocupa 12,4 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion (VLA) pi0.5, configurada como `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`; no es un transformer de lenguaje generativo convencional |
| Parametros totales | no disponible (el repositorio ocupa 12,4 GB, pero no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica ventana de contexto de texto: la observacion es de 2 imagenes + estado de 6 dimensiones y el horizonte de accion es de 16 pasos |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible; el prompt de tarea esta fijado en ingles (`"Grab the adapter"`) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de openpi: directorio con `params/` y `assets/` (las estadisticas de normalizacion se leen de `assets/so101/grab_adapter_2cam_v1/`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un fine-tuning de `pi05_base` (pi0.5 de Physical Intelligence) sobre el dataset `Ibuprofene/grab_adapter_2cam_v1`. La politica consume dos imagenes RGB (`images.fixed`, camara de mesa, e `images.handeye`, camara de muneca) junto con un vector de estado `float32 (6,)`, y produce `actions` de forma `float32 (16, 6)`. La configuracion de modelo es `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`.

Detalles de entrenamiento publicados: 30.000 pasos con batch 32, optimizador con scheduler coseno y pico de learning rate 2,5e-5 decayendo a 2,5e-6 con 1.000 pasos de warmup, ejecutado sobre 4 GPU A100 de 64 GB con FSDP en 4 dispositivos. La perdida final registrada es 0,00279 y existe un run de Weights & Biases publico. Las acciones se entrenan como deltas relativas al estado actual en las cinco articulaciones del brazo y como valor absoluto en la pinza; el servidor vuelve a sumar el estado antes de responder, de modo que lo que se recibe ya es absoluto. La normalizacion es por cuantiles (q01/q99 -> [-1,1]). El estado del optimizador no se incluye en el repositorio, por lo que el checkpoint se puede usar como punto de partida (warm start) pero no reanudar el entrenamiento.

## Capacidades

- Generacion de acciones motoras: dado un par de imagenes y el estado articular, produce 16 objetivos articulares absolutos por inferencia.
- Control de un brazo SO-101 de un solo brazo con seis grados de libertad (cinco articulaciones mas pinza) en una tarea de agarre.
- Percepcion bimanual de camaras: combina una vista de mesa y una vista de muneca; las dos camaras no son intercambiables.
- Ejecucion de una unica instruccion de tarea fija: `"Grab the adapter"`.
- Control en el espacio de grados para las articulaciones `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex` y `wrist_roll`, y en escala 0-100 para la pinza, compatible con un `so_follower` de LeRobot con `use_degrees=True`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, soporte de agentes, capacidades multilingues ni modo de pensamiento. Cualquier uso fuera del control del brazo SO-101 no esta soportado por el autor.

## Casos de uso

- Automatizacion del agarre de un adaptador en una celda robotizada: el modelo esta entrenado especificamente para esa tarea, por lo que se puede desplegar con `openpi` y un SO-101 real para recoger la pieza de la mesa y colocarla en la posicion de montaje.
- Alimentacion de piezas en una linea de ensamblaje de bajo volumen: al devolver 16 acciones absolutas a 15 Hz, un unico bloque cubre aproximadamente 1,07 s de movimiento, lo que simplifica el bucle de control y reduce la frecuencia de inferencia necesaria para alimentar el brazo.
- Reproduccion de demostraciones de teleoperacion: el modelo permite replicar la politica aprendida de un operador humano a partir de 101 episodios, util para validar que el pipeline de captura de datos (dos camaras + estado articular) es coherente.
- Punto de partida para nuevos ajustes finos (warm start): el autor indica que el checkpoint se puede usar como inicializacion aunque no se pueda reanudar el entrenamiento, lo que sirve para adaptar la politica a variantes de la misma tarea.
- Banco de pruebas de VLA en hardware de bajo coste: permite medir el comportamiento de una politica pi0.5 en un SO-101 sin necesidad de un robot de gama alta, comparando perdidas y comportamiento cualitativo frente al modelo base sin ajustar.
- Investigacion sobre imitacion con multiples camaras: el hecho de que las dos vistas no sean intercambiables lo convierte en un caso util para estudiar la dependencia de la politica respecto a la calibracion de las camaras.
- Estudio de fallos de politica: el bloqueo documentado en la pose de fin de episodio (`[25, -17, -79, 68, 36]`) es un ejemplo reproducible de sesgo de dataset que se puede usar para disenar demostraciones de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la perdida final de entrenamiento (0,00279) sobre el conjunto de datos `Ibuprofene/grab_adapter_2cam_v1`, que no es comparable con metricas estandar tipo MMLU, HumanEval o GSM8K porque la tarea es de control motor y no de generacion de texto.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida final de entrenamiento | 0,00279 | 30.000 pasos, batch 32, dataset `grab_adapter_2cam_v1` |
| Benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) | No aplicables ni disponibles | Tarea de robotica de imitacion |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 12,4 GB, por lo que cabe esperar un consumo de memoria del orden del tamano del checkpoint mas el coste de las activaciones de inferencia.
- GPU recomendadas para inferencia: no especificadas por el autor. El entrenamiento se realizo en 4 GPU A100 de 64 GB con FSDP. Compatibilidad con GPU de consumo no confirmada en la informacion disponible.
- Cabe en GPU de consumo: no confirmado. No se publican variantes cuantizadas, lo que dificulta el despliegue en tarjetas con poca memoria.
- Opciones de despliegue: `openpi` mediante `scripts/serve_policy.py`, apuntando `--policy.dir` al directorio que contiene `params/` y `assets/` (no a `params/` directamente). Requiere el commit `215abfb217dbac7d5f1273282331b9b1866c0479` de openpi, mas los ficheros de politica y configuracion de SO-101, que no estan en el repositorio upstream. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de las acciones (15 Hz, con 16 acciones por bloque), pero no el tiempo de inferencia del servidor.
- Nota de integracion: si el codigo de control lee el brazo en la convencion de porcentaje de servo -100..100, hay que convertir los valores antes de usarlos; las acciones se expresan en grados y en escala 0-100 para la pinza.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-grab-adapter-30k | no disponible (repositorio de 12,4 GB) | 16 acciones a 15 Hz; sin contexto de texto | Perdida final 0,00279; sin benchmarks publicos | apache-2.0 | Hugging Face, libreria lerobot |
| physical-intelligence/pi05_base | no disponible en la informacion proporcionada | Configuracion pi0.5 base | No disponible | No disponible en la informacion proporcionada | Modelo base de openpi |
| Otras politicas VLA para SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa con otras politicas de robotica no es posible.

## Limitaciones y advertencias

- Bloqueo en la pose de fin de episodio: la politica puede quedarse estancada con el brazo arriba y la pinza cerrada, en torno a `[25, -17, -79, 68, 36]` en el orden de articulaciones indicado. Todas las demostraciones terminan en esa pose, por lo que el modelo solo dispone de la accion "mantener". El autor senala que la solucion requiere demostraciones de recuperacion que empiecen en esa pose; mas pasos de entrenamiento no lo arreglan.
- Las dos camaras no son intercambiables: intercambiar `images.fixed` e `images.handeye` produce resultados incorrectos con alta confianza.
- Frecuencia de reproduccion: las 16 acciones estan espaciadas a 15 Hz, no a 30 Hz. El dato se grabo a 30 fps y se submuestreo por 2 en entrenamiento. Reproducir a 30 Hz reduce a la mitad la velocidad prevista.
- Tarea unica: el prompt de entrenamiento es exclusivamente `"Grab the adapter"`. Cualquier otra instruccion carece de soporte.
- Dependencia estricta de version: se requiere el commit `215abfb217dbac7d5f1273282331b9b1866c0479` de openpi y los ficheros de configuracion de SO-101 que no estan en upstream. Commits posteriores pueden haber cambiado el pipeline de transformaciones y producir acciones erroneas de forma silenciosa.
- Convencion de unidades: las articulaciones se expresan en grados y la pinza en 0-100. Si el controlador usa la convencion de servo -100..100 hay que convertir antes de enviar o interpretar valores.
- Sin estado del optimizador: el checkpoint se puede usar para warm start, pero no para reanudar el entrenamiento.
- Dataset limitado: 101 episodios y 72.441 fotogramas de una sola tarea y un solo montaje, lo que implica un alto riesgo de sobreajuste al entorno, a la iluminacion y a la posicion concreta de la pieza. Se espera degradacion ante cambios de disposicion, objetos distintos o condiciones de luz diferentes.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: al ser una politica de imitacion sin mecanismo de verificacion, puede generar trayectorias fluidas pero erroneas cuando la observacion se sale de la distribucion de entrenamiento.
- Sin benchmarks publicos: no hay evidencia cuantitativa de exito en tarea ni de robustez mas alla de la perdida de entrenamiento.
- No se publican datos sobre sesgos demograficos ni linguisticos porque el modelo no procesa lenguaje de forma generativa.
- Licencia: el repositorio se distribuye como apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base `physical-intelligence/pi05_base` no se especifica en la informacion proporcionada y conviene verificarla antes de un despliegue comercial.
- Seguridad fisica: cualquier despliegue sobre un brazo real debe incluir limites articulares, parada de emergencia y validacion de las acciones antes de enviarlas al hardware.
- Fecha de creacion del repositorio registrada como 2026-09-10, dato que conviene contrastar con el autor por si se trata de un error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattewg/pi05-so101-grab-adapter-30k
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ibuprofene/grab_adapter_2cam_v1
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Run de entrenamiento en Weights & Biases: https://wandb.ai/mattewg_dev/SPELL/runs/euzdkpoo
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a noticias sin relacion con el contenido de la ficha.
