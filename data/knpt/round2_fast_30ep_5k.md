# knpt/round2_fast_30ep_5k

## Resumen

knpt/round2_fast_30ep_5k es una politica robotica de tipo vision-lenguaje-accion (VLA) derivada de GR00T N1.7 de NVIDIA, con 3.144.016.000 parametros, publicada por el usuario knpt y distribuida en formato safetensors bajo la libreria LeRobot. Resuelve una tarea concreta sobre el brazo SO-101: recoger un vial y colocarlo en una gradilla. No es un modelo de lenguaje general: su salida son acciones de robot condicionadas por imagenes de dos camaras RGB, el estado de las seis articulaciones y una instruccion de texto.

Se trata del checkpoint de simulacion DR500 (sreetz-nv/so101_newton_dr500_vision_h32_b32_50k_20260925, entrenado con 500 demostraciones simuladas) ajustado con 70 correcciones humanas recogidas mediante HG-DAgger sobre el robot real: 40 correcciones de agarre y elevacion en una primera ronda y 30 correcciones de colocacion en una segunda. El ajuste entrena el encoder visual, el proyector y la cabeza de accion, y mantiene congelado el modelo de lenguaje.

Su relevancia es practica y documental: describe un caso cerrado de sim-to-real. Segun el autor, el checkpoint DR500 de partida nunca llegaba a agarrar el vial en su montaje, mientras que esta version completa la tarea en 5 de 5 ensayos reales. El repositorio acumulaba 0 descargas y 0 me gusta en el momento de redactar esta ficha, por lo que no dispone de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA), politica vision-lenguaje-accion con encoder visual, proyector y cabeza de accion; modelo de lenguaje congelado durante el ajuste |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | no aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible; la entrada de texto se limita a la instruccion de tarea ("Pick up the vial and place it in the rack") |
| Licencia | NVIDIA Open Model License Agreement (campo `license: other`, `license_name: nvidia-open-model-license`) |
| Formato de pesos | safetensors |
| Libreria | lerobot (LeRobot 0.6) |
| Tamano del repositorio | 12,6 GB |
| Modelo base | sreetz-nv/so101_newton_dr500_vision_h32_b32_50k_20260925 (GR00T N1.7, 500 demostraciones simuladas) |
| Pipeline | robotics |
| Fecha de publicacion | 6 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.7 (3B), una politica VLA que combina un encoder visual (el preprocesado de imagen corresponde a Qwen3-VL), un proyector que alinea las representaciones visuales con el resto de la red y una cabeza de accion que emite trozos de 32 acciones. Durante el ajuste se entrenan el encoder visual, el proyector y la cabeza de accion; el modelo de lenguaje permanece congelado. Las acciones del brazo se representan de forma relativa y la pinza de forma absoluta, y el checkpoint conserva las estadisticas de normalizacion del DR500.

Los datos de entrenamiento son 120 episodios: 50 episodios simulados (uno de cada diez del conjunto sreetz-nv/so101_newton_dr500_20260923, indices 0, 10, ..., 490) y las 70 correcciones reales de knpt/so101_dr500_real_dagger_70. Los datos reales representan aproximadamente el 37 % de las muestras de entrenamiento. La receta es LeRobot 0.6 `lerobot-train`, 5.000 pasos, lote de 32, AdamW con tasa de aprendizaje 1e-4, 500 pasos de calentamiento y decaimiento coseno, semilla 42 y aumento de imagen. El coste declarado es de aproximadamente 1,4 horas en una RTX PRO 6000, moviendo el preprocesado de imagen de Qwen3-VL a la GPU; segun el autor, el pipeline estandar en CPU produce las mismas perdidas y los mismos resultados en el robot.

La innovacion metodologica es el uso de HG-DAgger en dos rondas sobre el robot real para corregir fallos especificos: la ronda 1 aporta 40 correcciones de agarre y elevacion, y la ronda 2 anade 30 correcciones de colocacion. No se documenta uso de RLHF ni de DPO, algo esperable en una politica de imitacion.

## Capacidades

- Manipulacion robotica en el brazo SO-101: agarre de un vial y colocacion en una gradilla, con la tarea especificada por texto.
- Percepcion visual a partir de dos camaras RGB (una en la muneca y otra externa) a 640x480.
- Condicionamiento por estado propioceptivo: seis posiciones articulares en grados y apertura de pinza en porcentaje.
- Generacion de acciones por trozos (action chunking) de 32 pasos, con ejecucion de 16 pasos por inferencia en el ejemplo de despliegue del autor.
- Control relativo del brazo y control absoluto de la pinza, lo que facilita la reutilizacion entre poses de inicio cercanas dentro de las estadisticas de normalizacion del DR500.
- Soporte de inferencia con RTC (real-time chunking) en LeRobot, desactivado en el ejemplo publicado, y de interpolacion de acciones (`interpolation_multiplier=2`).
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje con interfaz de herramientas.
- No dispone de razonamiento multi-paso explicito ni de modo de pensamiento (thinking mode).
- No dispone de capacidades de codigo, matematicas, vision general, audio ni dialogo multilingue.
- Cobertura de tareas muy estrecha: una unica tarea, un unico montaje y posiciones de vial cercanas.

## Casos de uso

- Pick-and-place de viales en laboratorio: colocar muestras de una bandeja a una gradilla con un SO-101 de bajo coste. El autor reporta exito completo en 5 de 5 ensayos con el vial en posiciones cercanas, lo que lo hace adecuado como prueba de concepto en entornos controlados.
- Ajuste incremental con correcciones humanas: el modelo sirve como plantilla para aplicar HG-DAgger sobre un checkpoint de simulacion, recogiendo correcciones solo en los puntos de fallo (agarre y colocacion en este caso) en lugar de teleoperar la tarea completa.
- Estudio de sim-to-real en manipulacion: el repositorio documenta la progresion de un checkpoint DR500 que nunca agarraba el vial a una politica que completa la tarea, util para comparar estrategias de mezcla datos simulados/reales (aqui, 63 % simulado y 37 % real).
- Prototipado de celdas robotizadas de laboratorio: la entrada se limita a dos camaras y al estado articular, por lo que el montaje de sensores es economico y replicable en un banco de ensayo.
- Evaluacion de pipelines LeRobot 0.6: la receta de entrenamiento y el comando de rollout publicados permiten reproducir el flujo completo con `lerobot-train` y `lerobot-rollout` como referencia de configuracion.
- Base para tareas relacionadas con estadisticas similares: al conservar las estadisticas de normalizacion del DR500 y usar acciones relativas, puede servir de punto de partida para tareas de recogida y colocacion con la misma pose inicial y el mismo utillaje.
- Docencia y formacion en aprendizaje por imitacion: caso acotado y reproducible para ilustrar el ciclo simulacion, ajuste, correccion en robot real y validacion con un numero reducido de ensayos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que el modelo no es un modelo de lenguaje. El autor si publica una evaluacion en robot real con cinco ensayos por modelo y el vial en posiciones cercanas:

| Modelo | Datos de entrenamiento | Resultado |
|---|---|---|
| Checkpoint DR500 | 500 demostraciones simuladas | Nunca agarra |
| Ronda 1 | 50 episodios simulados + 40 correcciones de agarre y elevacion | Agarra y eleva; no coloca |
| Ronda 2 | + 20 correcciones de colocacion | Tarea completa en 2 de 5 |
| Este modelo | + 30 correcciones de colocacion | Tarea completa en 5 de 5 |

El autor advierte de que la muestra son cinco ensayos con el vial en posiciones cercanas. No se publican metricas de latencia, tasa de exito por distancia ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimacion derivada del numero de parametros, los pesos en bf16/fp16 ocupan aproximadamente 6,3 GB, a lo que hay que sumar activaciones, el encoder visual y los baches de imagen de dos camaras a 640x480; un rango razonable seria 8-12 GB, cifra orientativa no confirmada.
- GPU de entrenamiento: una RTX PRO 6000, con aproximadamente 1,4 horas para 5.000 pasos con lote 32 (calculo derivado: alrededor de 1 segundo por paso; el autor no publica esta cifra).
- GPUs recomendadas: RTX PRO 6000 para entrenamiento; para inferencia, cualquier GPU con al menos 12-16 GB de memoria es un candidato razonable (A100, H100, L40S, RTX 4090), aunque no hay mediciones publicadas que lo confirmen.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) segun la estimacion anterior; no confirmado por el autor.
- Despliegue: el camino documentado es LeRobot 0.6 mediante `lerobot-rollout` con `--policy.path=knpt/round2_fast_30ep_5k` y `--policy.base_model_path=nvidia/GR00T-N1.7-3B`, sobre un `so101_follower`.
- Opciones de inferencia: inferencia con RTC disponible en la CLI (`--inference.type=rtc`), desactivada en el ejemplo del autor; `--policy.n_action_steps=16` e `interpolation_multiplier=2`.
- Pilas de servido de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a esta politica, ya que no expone una interfaz de generacion de texto.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia por accion ni frecuencia de control efectiva.

## Comparativa con modelos similares

La comparacion mas significativa esta dentro de la propia linea de trabajo del autor, porque comparte modelo base, datos de simulacion y utillaje:

| Modelo | Parametros | Contexto | Rendimiento en tarea real | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knpt/round2_fast_30ep_5k | 3,14 mil millones | no disponible | Tarea completa 5/5 | NVIDIA Open Model License | Publico en HuggingFace |
| Checkpoint DR500 (base) | 3B aproximadamente | no disponible | Nunca agarra | NVIDIA Open Model License | Publico en HuggingFace |
| Ronda 1 (40 correcciones) | no disponible | no disponible | Agarra y eleva, sin colocacion | no disponible | no disponible |
| Ronda 2 (20 correcciones) | no disponible | no disponible | Tarea completa 2/5 | no disponible | no disponible |

No se dispone de datos comparativos con otras familias de politicas compatibles con LeRobot (por ejemplo, ACT, SmolVLA o pi0/pi0.5): no hay resultados publicados en la informacion disponible sobre estas tareas concretas, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Generalizacion muy limitada: la evaluacion son cinco ensayos con el vial en posiciones cercanas. Las posiciones lejanas siguen fallando en el alcance o en el agarre, porque ninguna correccion cubre la aproximacion.
- Especificidad del montaje: todas las correcciones provienen de un unico robot, una unica configuracion de camaras y una unica posicion de gradilla. En otro montaje hay que recoger correcciones propias.
- Dependencia de la pose inicial: los ensayos parten de la pose DR500 `[0, -34.88, -3.91, 86.86, -91.87, 1.18]`; no se documenta comportamiento fuera de ese punto de partida.
- Una sola tarea: el modelo esta ajustado para "Pick up the vial and place it in the rack". No se ha validado con otras instrucciones de texto, aunque el condicionamiento por lenguaje este presente.
- Modelo de lenguaje congelado: el ajuste no modifica la parte linguistica, de modo que la comprension de instrucciones nuevas depende por completo del checkpoint base.
- Riesgo de alucinacion en el sentido habitual: no aplica a texto, pero si existe el riesgo analogo de acciones incorrectas o inseguras ante estados visuales fuera de distribucion, algo critico en un robot fisico.
- Sesgos: no documentados por el autor. Cabe esperar sesgos derivados de un unico operador, un unico laboratorio y 70 correcciones humanas.
- Licencia: se hereda de NVIDIA GR00T N1.7 bajo la NVIDIA Open Model License Agreement. La model card no detalla condiciones de uso comercial ni de redistribucion; conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- Madurez: repositorio con 0 descargas y 0 me gusta, sin validacion independiente, sin articulo tecnico asociado y sin metricas de robustez.
- Uso seguro: cualquier aplicacion con material fragil o peligroso requiere supervisión humana y un protocolo de parada de emergencia; el modelo no incorpora mecanismos de seguridad propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knpt/round2_fast_30ep_5k
- Modelo base: https://huggingface.co/sreetz-nv/so101_newton_dr500_vision_h32_b32_50k_20260925
- Dataset de correcciones reales: https://huggingface.co/datasets/knpt/so101_dr500_real_dagger_70
- Dataset de demostraciones simuladas: https://huggingface.co/datasets/sreetz-nv/so101_newton_dr500_20260923
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
