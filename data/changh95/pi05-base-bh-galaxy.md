# changh95/pi05-base-bh-galaxy

## Resumen

`changh95/pi05-base-bh-galaxy` es un paquete de despliegue que ejecuta la politica vision-lenguaje-accion (VLA) π0.5 de Physical Intelligence sobre un **Tenstorrent Blackhole Galaxy** (32 chips Blackhole en 4 bandejas de 8) como servidor de politica websocket compatible con [openpi](https://github.com/Physical-Intelligence/openpi). No se trata de un modelo entrenado desde cero, sino de un port de inferencia: reutiliza los pesos de la familia π0.5 de LeRobot y los expone sobre el grafo TT-NN fusionado y trazado del paquete previo `changh95/pi05-base-p150`.

El modelo subyacente combina un encoder de vision SigLIP, un VLM Gemma-2B y un experto de accion Gemma-300M con cabecera de flow-matching, que es la arquitectura estandar de π0.5. El repositorio aporta un punto de entrada unico, `serve.sh --profile`, que selecciona una de tres topologias de servicio (`tp-latency`, `dp-throughput`, `pa-disagg`) optimizadas respectivamente para minima latencia por peticion, maximo numero de robots por chip y trafico irregular tipo Poisson con desagregacion prefijo-accion.

Su relevancia es de infraestructura: demuestra que un VLA de ~2,3 B de parametros puede servirse en hardware acelerador no-GPU con paralelismo tensorial multi-chip y numeros medidos de latencia, capacidad de robots concurrentes y soak de una hora, ademas de una evaluacion completa de 2000 episodios en LIBERO. El tamano del repositorio es de 0,0 GB porque no incluye pesos; el contenido es codigo, configuracion y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: encoder de vision SigLIP + VLM Gemma-2B + experto de accion Gemma-300M con cabecera de flow-matching, portado a grafo TT-NN fusionado y trazado |
| Parametros totales | no disponible (componentes declarados: SigLIP + Gemma-2B + Gemma-300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; en la configuracion LIBERO el prompt se rellena a 32 tokens y el horizonte de accion es H = 10 con 10 pasos de flow-matching. La configuracion `base` usa H = 50 y 224 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use, https://ai.google.dev/gemma/terms) |
| Formato de pesos | no disponible (el repo no incluye pesos; ejecuta un grafo TT-NN trazado y referencia los pesos de `lerobot/pi05_libero` y `lerobot/pi05_base`) |

## Arquitectura y entrenamiento

El modelo es una politica VLA de π0.5 que une tres bloques: un encoder de vision SigLIP para las imagenes de camara, un modelo de lenguaje Gemma-2B que procesa el prompt y el contexto visual, y un experto de accion Gemma-300M que genera acciones mediante flow-matching (10 pasos en la configuracion LIBERO). Sobre esta arquitectura, el repositorio aplica una conversion a TT-NN en un grafo fusionado y trazado, derivado del paquete single-chip `changh95/pi05-base-p150`, y anade infraestructura de paralelismo tensorial y batching multi-chip especifica de Blackhole.

No se documentan en la informacion disponible los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO): este repositorio es un port de inferencia, no un entrenamiento. La innovacion tecnica destacable es de sistema, no de modelado: tres layouts de servicio sobre el mismo grafo (una celda TP8 de batch 1 con anillo `FABRIC_1D_RING`; un servidor batcheado por chip con router y control de admision; y una desagregacion prefijo-accion donde 7 chips de prefijo envian su KV por el fabric a 1 chip de accion que ejecuta batching continuo con pools de slots adaptativos). Las cifras de accuracy y velocidad del repo se midieron con el fine-tune LIBERO `lerobot/pi05_libero` @ `a217bfd3`; `base_model` apunta a `lerobot/pi05_base` porque de ahi proceden la arquitectura y el port. La ruta `--model base` (H = 50, 224 tokens) solo fue smoke-testeada en la celda TP8 de `tp-latency` (arranque, una llamada y dos peticiones identicas bit-identicas), y no esta probada en los demas perfiles.

## Capacidades

- Control de robot extremo a extremo: genera acciones motoras directamente a partir de imagenes de camara y prompt de tarea, sin controlador intermedio.
- Politica vision-lenguaje-accion con generalizacion de mundo abierto, segun la descripcion de π0.5 co-entrenada con demostraciones de robot y datos multimodales a gran escala.
- Entrada multi-camara: las mediciones usan 2 camaras, con clases de camara de 1 a 4 (perfiles `cam2` y `cam4`).
- Ejecucion de tareas de horizonte largo en entornos no vistos, segun la model card de π0.5 de LeRobot.
- Generacion de acciones por flow-matching con 10 pasos de integracion y horizonte de accion H = 10 (perfil `libero`) o H = 50 (perfil `base`).
- Servicio concurrente multi-robot: el perfil `dp-throughput` sostiene hasta 24 robots por 8 chips a 4 Hz con camara 2.
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso tipo agente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Control de flotas de robots en almacen: con el perfil `dp-throughput` sobre 8 chips se midieron 24 robots simultaneos a 4 Hz con camara 2, y 72 robots a 2 Hz, lo que permite servir una celda de picking completa desde un unico Galaxy.
- Investigacion en VLA sobre hardware no-GPU: el perfil `pa-disagg` esta pensado para trafico irregular tipo Poisson; en el motor M3.e (no la configuracion enviada) su p99 fue un 23-34 % inferior a `dp-throughput` cerca de capacidad, lo que lo hace util para estudiar planificacion de recursos en politicas de robot.
- Manipulacion robotica de baja latencia con pocos robots: el perfil `tp-latency` ofrece 48,59 ms p50 (48,90 ms p99) con camara 2 y 1 robot, frente a 80,10 ms del baseline de un chip, adecuado para tareas reactivas de un solo brazo.
- Benchmarking de politicas VLA: el repositorio incluye la evaluacion completa de LIBERO (2000 episodios: 4 suites x 10 tareas x 50 ensayos) con 97,05 % en un chip y 96,50 % en `tp-latency`, lo que permite comparar puertos de hardware contra el baseline de software.
- Validacion de despliegue a escala de rack: con los 32 chips se midio N_max de al menos 96 robots a 4 Hz y 249 a 2 Hz en `dp-throughput`, util para dimensionar un cluster de inferencia robotica antes de produccion.
- Pruebas de soak y estabilidad: los resultados de soak de 1 hora (PASS a N = 5 en `tp-latency`, N = 23 en `dp-throughput`, N = 17 en `pa-disagg` sobre 8 chips) sirven para validar tolerancia a fallos y admission control en produccion.
- Integracion con ecosistema openpi: al exponerse como servidor de politica websocket de openpi, se puede enchufar a clientes y flujos de trabajo existentes de ese framework sin cambiar el cliente.

## Benchmarks y rendimiento

Evaluacion LIBERO (2000 episodios, 4 suites x 10 tareas x 50 ensayos):

| Configuracion | Exito | Nota |
|---|---|---|
| Un chip (baseline) | 1941 / 2000 = 97,05 % | medida |
| `tp-latency` (1 x TP8, T0) | 1930 / 2000 = 96,50 % | no re-medida en el codigo enviado |
| `dp-throughput` (8 x B 1-4, T1) | 1941 / 2000 = 97,05 % | no re-medida en el codigo enviado |
| `pa-disagg` (7P + 1A, T2) | 1941 / 2000 = 97,05 % | no re-medida en el codigo enviado |

Latencia con 1 robot (p50 / p99, ms):

| Configuracion | cam2 | cam4 |
|---|---|---|
| Un chip (baseline) | 80,10 / 80,20 | 117,84 / 118,01 |
| `tp-latency` (1 x TP8, T0) | 48,59 / 48,90 | 61,70 / 62,74 |
| `dp-throughput` (8 x B 1-4, T1) | 80,10 / 80,20 | 117,84 / 118,01 |
| `pa-disagg` (7P + 1A, T2) | 86,64 / 87,12 | 126,46 / 128,19 |

Capacidad de robots por 8 chips (N_max, 3/3 semillas, monotono) y soak:

| Metrica | `tp-latency` | `dp-throughput` | `pa-disagg` |
|---|---|---|---|
| cam2 @ 4 Hz | 5 | 24 | 15 |
| cam2 @ 2 Hz | 10 | 72 | 56 |
| cam4 @ 4 Hz / 2 Hz | 4 / 8 | 13 / 34 | 7 / 35 |
| Soak 1 h cam2 @ 4 Hz | PASS a N = 5 | PASS a N = 23 (N = 24 fallo 2 de 345.600) | PASS a N = 17 > N_max |

Escala de 32 chips (N_max, cam2):

| Metrica | `dp-throughput` | `pa-disagg` |
|---|---|---|
| 4 Hz / 2 Hz | >= 96 / 249 | 63 / 224 |
| Soak | 1 h FAIL | 30 min FAIL |

Notas de la model card: las etiquetas distinguen [medido] y [estimado/simulado]. Los valores de latencia, N_max y soak provienen de ejecuciones headline con la maquina en exclusiva. La fila de latencia de un chip corresponde al servidor por chip del modo 2 en su configuracion de despliegue. En `pa-disagg`, cam2 @ 4 Hz paso 3/3 semillas a N = 17 y solo 2/3 a N = 16, por lo que el headline monotono es 15. En `dp-throughput` a 32 chips el N_max de 96 es una cota inferior ("al menos") y el soak de 1 hora fallo.

## Requisitos de hardware

- Hardware objetivo: un Tenstorrent Blackhole Galaxy con 32 chips Blackhole organizados en 4 bandejas de 8. No es un modelo para GPU convencional ni para hardware de consumo.
- VRAM estimada: no disponible (la inferencia corre sobre memoria de chip Blackhole, no sobre VRAM de GPU).
- Perfil `tp-latency`: 1 bandeja (8 chips) como una celda TP8 de batch 1, con anillo `FABRIC_1D_RING` perimetral, ruta de host rapida y 2 colas de comandos. La opcion `--cells 2` produce dos caras TP4.
- Perfil `dp-throughput`: 1 servidor batcheado por chip (B 1-4) mas un router con admision, sobre 8 chips; escalable a los 32 chips.
- Perfil `pa-disagg`: 1 proceso por bandeja; 7 chips de prefijo envian su KV por el fabric a 1 chip de accion que ejecuta batching continuo con pools de slots adaptativos; varias bandejas detras de un router frontal.
- GPU recomendadas: no aplica; no se documentan requisitos de GPU.
- Despliegue: servidor de politica websocket compatible con openpi, lanzado con `serve.sh --profile <tp-latency|dp-throughput|pa-disagg>`; seleccion de modelo con `--model libero` (por defecto) o `--model base`.
- Latencia medida: minima de 48,59 ms p50 con cam2 y 1 robot en `tp-latency`; 80,10 ms en el baseline de un chip.
- Throughput medido: hasta 24 robots por 8 chips a 4 Hz (cam2) en `dp-throughput`, y al menos 96 sobre 32 chips a la misma tasa.
- vLLM, llama.cpp, Ollama, TGI u otras opciones de despliegue GPU: no disponibles para este paquete.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Latencia cam2 p50 (1 robot) | N_max 8 chips cam2 @ 4 Hz | Licencia |
|---|---|---|---|---|---|
| `changh95/pi05-base-bh-galaxy` | Port de inferencia π0.5, multi-chip | Blackhole Galaxy (32 chips, 4 x 8) | 48,59 ms (`tp-latency`) | 24 (`dp-throughput`) | gemma |
| `changh95/pi05-base-p150` | Port de inferencia π0.5, single-chip | 1 chip Tenstorrent | no disponible | no aplica | gemma |
| `changh95/pi05-base-blackhole` | Port de π0.5 a Blackhole via TTNN | Tenstorrent Blackhole | no disponible | no disponible | gemma |
| `lerobot/pi05_base` | Modelo VLA original π0.5 | GPU / PyTorch | no disponible | no disponible | no disponible en la informacion |

No se dispone de comparativas contra politicas VLA de otros fabricantes en la informacion proporcionada. La comparacion mas directa es interna a la familia de ports de `changh95`: el paquete Galaxy aporta los perfiles de servicio multi-chip que los paquetes single-chip (`p150`, `blackhole`) no ofrecen.

## Limitaciones y advertencias

- Este repositorio no incluye pesos (tamano de 0,0 GB); el usuario debe aportar los pesos de `lerobot/pi05_libero` o `lerobot/pi05_base` segun el perfil.
- La ruta `--model base` (H = 50, 224 tokens) solo fue smoke-testeada en la celda TP8 de `tp-latency` (arranque, una llamada, dos peticiones identicas bit-identicas) y no esta probada en `dp-throughput` ni en `pa-disagg`.
- Muchas cifras de N_max, soak y LIBERO proceden de paquetes anteriores, no del codigo enviado; la model card distingue explicitamente las filas "shipped" (re-medidas) de las que no lo fueron. Las filas de LIBERO de `tp-latency`, `dp-throughput` y `pa-disagg` figuran como no re-medidas.
- En 32 chips, el soak de 1 hora falla en `dp-throughput` y el de 30 minutos falla en `pa-disagg`; los N_max de 96 y 224 son cotas inferiores bajo ventana de medida, no garantias sostenidas.
- `pa-disagg` en su motor M3.e (no la configuracion enviada) solo supero a `dp-throughput` en p99 bajo cargas en las que ambos modos incumplen la regla de miss R1; su capacidad a tasa regular es inferior a la de `dp-throughput`.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de Gemma de Google (https://ai.google.dev/gemma/terms); hay que revisarlos antes de cualquier despliegue en produccion.
- Idioma y sesgos: no se documentan idiomas soportados ni estudios de sesgo en la informacion disponible.
- Riesgo de alucinacion: no se documenta de forma especifica para este port; al ser una politica de accion, el modo de fallo relevante es la accion incorrecta o el incumplimiento de la tarea, no la generacion de texto.
- Dependencia fuerte de hardware propietario Tenstorrent Blackhole y del stack TT-NN / tt-metal, lo que limita su portabilidad a entornos GPU convencionales.
- Las cifras de capacidad (robots por chip) dependen de la tasa de peticiones y del numero de camaras; a 4 Hz las capacidades son sensiblemente menores que a 2 Hz.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/changh95/pi05-base-bh-galaxy
- Paquete single-chip previo: https://huggingface.co/changh95/pi05-base-p150
- Port a Blackhole: https://huggingface.co/changh95/pi05-base-blackhole
- Paquete de batching p300x2: https://huggingface.co/changh95/pi05-base-batch-p300x2
- Repositorio del port: https://github.com/changh95/tt-pi-0.5
- Perfil GitHub del autor: https://github.com/changh95
- Pesos LIBERO: https://huggingface.co/lerobot/pi05_libero
- Pesos base: https://huggingface.co/lerobot/pi05_base
- Paper π0.5: https://arxiv.org/abs/2504.16054
- Upstream openpi: https://github.com/Physical-Intelligence/openpi
- Fork de openpi para preentrenamiento: https://github.com/Galaxy-Official/openpi_pretraining
- ModelScope de pi05_base: https://www.modelscope.cn/models/lerobot/pi05_base/summary
- Licencia Gemma: https://ai.google.dev/gemma/terms
