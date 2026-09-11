# mattewg/pi05-so101-grab-cup-30k

## Resumen

pi05-so101-grab-cup-30k es un ajuste fino (fine-tuning) del modelo de vision-lenguaje-accion (VLA) `physical-intelligence/pi05_base` sobre un unico conjunto de datos de teleoperacion de un brazo robotico SO-101. Lo publica el usuario `mattewg` en HuggingFace con licencia Apache-2.0 y un repositorio de 12,4 GB. No es un modelo de lenguaje: es una politica visomotora que recibe dos vistas de camara y el estado articular actual, y devuelve un bloque de 16 objetivos de articulacion absolutos a 15 Hz.

El modelo resuelve una tarea concreta: coger una taza blanca. El unico prompt de tarea presente en el conjunto de entrenamiento es `"Grab the white cup"`, lo que lo convierte en un artefacto muy especializado en lugar de una politica generalista. Su relevancia es fundamentalmente practica para quien trabaja con el brazo de bajo coste SO-101 dentro del ecosistema LeRobot y openpi: sirve como referencia reproducible de un ajuste fino completo (30.000 pasos, lote 32, 4x A100-64GB con FSDP) y como punto de partida documentado para nuevas tareas.

El dato mas util de la ficha es, probablemente, la limitacion declarada por el propio autor: la politica puede quedarse bloqueada en la pose de fin de episodio (brazo arriba, pinza cerrada, aproximadamente `[25, -17, -79, 68, 36]` en el orden articular), porque ninguna demostracion muestra que ocurre despues de esa pose. Mas pasos de entrenamiento no arreglan ese fallo; hacen falta demostraciones de recuperacion que empiecen en esa posicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5; configuracion `Pi0Config(pi05=True, action_dim=32, action_horizon=16)` |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica / no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la entrada es un par de imagenes mas un prompt fijo) |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible; el unico prompt de tarea esta en ingles (`"Grab the white cup"`) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint openpi en un directorio con `params/` y `assets/` (no safetensors ni GGUF) |
| Modelo base | physical-intelligence/pi05_base |
| Tamano del repositorio | 12,4 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Ibuprofene/grab_cup_2cam_v4 (146 episodios, 104.819 frames) |
| Espacio de acciones | `float32 (16, 6)`; 5 articulaciones en grados mas pinza en escala 0-100 |
| Frecuencia de las acciones | 15 Hz (16 acciones cubren ~1,07 s) |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

Se trata de una politica VLA derivada de pi0.5, con `action_dim=32` y `action_horizon=16`. La entrada son dos imagenes RGB en `uint8` (`images.fixed`, camara de mesa, e `images.handeye`, camara de muneca), el estado `float32 (6,)` y un prompt de tarea. La salida es un bloque de 16 acciones de 6 dimensiones. Las cinco articulaciones del brazo (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`) se entrenan como deltas relativos al estado actual y la pinza de forma absoluta; el servidor vuelve a sumar el estado antes de responder, de modo que lo que recibe el cliente es siempre absoluto. La normalizacion es por cuantiles (q01/q99 mapeados a [-1,1]).

El ajuste fino se hizo durante 30.000 pasos con lote 32 sobre 4x A100-64GB con FSDP en 4 dispositivos, con un scheduler coseno de learning rate (pico 2,5e-5, minimo 2,5e-6) y 1.000 pasos de calentamiento. La perdida final registrada es 0,00254. Los datos provienen del dataset `Ibuprofene/grab_cup_2cam_v4`, con 146 episodios y 104.819 frames grabados a 30 fps y submuestreados por 2 en entrenamiento, lo que explica que el bloque de 16 acciones se espacie a 15 Hz en lugar de a 30 Hz. No se documenta uso de RLHF, DPO ni ninguna otra fase de alineamiento; es imitacion pura (imitation learning). El estado del optimizador no se incluye, por lo que el checkpoint se puede usar como warm start pero no se puede reanudar el entrenamiento.

## Capacidades

- Control visomotor de un brazo SO-101 de un solo brazo a partir de dos vistas de camara (mesa y muneca).
- Prediccion de bloques de accion (action chunking) de 16 pasos, con horizonte temporal de aproximadamente 1,07 s.
- Manejo de espacio de acciones mixto: deltas relativos para las cinco articulaciones y valores absolutos para la pinza.
- Ejecucion de una tarea unica condicionada por el prompt `"Grab the white cup"`; no hay evidencia de generalizacion a otras instrucciones.
- Integracion con el ecosistema LeRobot/openpi mediante `scripts/serve_policy.py` y el modo cliente-servidor de openpi.
- No soporta generacion de texto, razonamiento simbolico, matematicas, codigo ni vision generalista.
- No soporta tool calling ni function calling en el sentido de los LLM.
- No soporta planificacion multi-paso ni comportamiento de agente mas alla del bucle reactivo de percepcion-accion.
- No se documentan capacidades multilingues ni cambio de idioma del prompt.

## Casos de uso

- Pick-and-place de una taza blanca en un banco de laboratorio: la politica recibe las dos vistas y devuelve 16 objetivos articulares a 15 Hz, suficiente para cubrir aproximacion, agarre y elevacion en un unico bloque o en varios consecutivos.
- Banco de pruebas para investigacion en imitation learning: el par modelo+dataset (146 episodios, 104.819 frames) permite reproducir el ajuste fino de pi0.5 sobre SO-101 y estudiar el efecto del numero de pasos, la tasa de aprendizaje o el submuestreo temporal.
- Baseline de comparacion en experimentos de VLA: sirve como referencia cuantitativa (perdida final 0,00254, 30.000 pasos, 4x A100-64GB) frente a variantes con LoRA, congelacion parcial o distintos horizontes de accion.
- Docencia y formacion en robotica de bajo coste: el SO-101 es un brazo accesible y el stack LeRobot permite montar una practica completa de teleoperacion, grabacion de datos y despliegue de una politica entrenada.
- Estudio del fallo de bloqueo al final del episodio: el caso documentado (pose `[25, -17, -79, 68, 36]`) es un ejemplo didactico de como un dataset sin cobertura de recuperacion limita la politica, y permite disenar y validar demostraciones de recuperacion.
- Punto de partida (warm start) para nuevas tareas sobre el mismo brazo: al no incluir estado del optimizador, el checkpoint se puede cargar como inicializacion para reentrenar con otro prompt o con datos de recuperacion.
- Validacion de la infraestructura de despliegue openpi: el modelo exige un commit concreto y ficheros de configuracion del SO-101 que no estan en upstream, por lo que es util para verificar la reproducibilidad del pipeline antes de escalar a otras tareas.
- Verificacion de convenciones de unidades y signos en el controlador: el modelo usa grados y escala 0-100 para la pinza (`use_degrees=True`), lo que obliga a convertir si el codigo de control trabaja en porcentaje de servo (-100..100) y sirve como caso de prueba de esa conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico de rendimiento es la perdida final de entrenamiento: 0,00254 tras 30.000 pasos con lote 32. No hay tasas de exito en tarea, ni comparaciones con otras politicas, ni metricas de latencia o throughput medidas.

## Requisitos de hardware

- Repositorio de 12,4 GB en disco; conviene reservar ese espacio mas el del entorno de openpi y sus dependencias.
- VRAM de inferencia: no confirmada por el autor. Como referencia orientativa, un checkpoint de 12,4 GB sugiere pesos en precision completa; servido en bf16 la huella seria aproximadamente la mitad (en torno a 6-8 GB), pero es una estimacion no verificada.
- Entrenamiento: el autor uso 4x A100-64GB con FSDP sobre 4 dispositivos. Reproducir el ajuste completo exige ese orden de recursos.
- GPU de consumo: no hay confirmacion de que quepa en una RTX 4090 (24 GB) u otras GPU de consumo. Por tamano de checkpoint es plausible en GPUs de 24 GB en bf16, pero no esta documentado ni medido.
- Despliegue: el camino soportado es openpi (`scripts/serve_policy.py policy:checkpoint`) en modo cliente-servidor. No se documentan variantes para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos en GGUF ni safetensors esas rutas no son directamente aplicables.
- Requisito de version critico: openpi en el commit `215abfb217dbac7d5f1273282331b9b1866c0479` mas los ficheros de politica y configuracion del SO-101, que no estan en upstream. Commits posteriores pueden haber cambiado el pipeline de transformaciones y producir acciones incorrectas de forma silenciosa.
- Latencia y throughput: no disponibles. El modelo debe servirse de forma que las 16 acciones se reproduzcan a 15 Hz; reproducirlas a 30 Hz reduce a la mitad la velocidad prevista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-grab-cup-30k | no disponible | 16 acciones a 15 Hz (~1,07 s) | Coger una taza blanca con SO-101 | Apache-2.0 | HuggingFace, requiere openpi en commit concreto |
| physical-intelligence/pi05_base | no disponible | no disponible | Politica VLA generalista | no disponible en la informacion proporcionada | Checkpoint de referencia en openpi |
| Otros ajustes finos de SO-101 | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas en la informacion disponible |

No se dispone de datos de rendimiento ni de recuento de parametros de los modelos comparados, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada. La diferencia funcional mas relevante frente al modelo base es el grado de especializacion: `pi05_base` es una politica generalista y este checkpoint solo responde al prompt `"Grab the white cup"` con dos camaras en posiciones fijas.

## Limitaciones y advertencias

- Bloqueo al final del episodio: la politica puede quedarse atascada en la pose de fin de episodio (brazo arriba, pinza cerrada, aproximadamente `[25, -17, -79, 68, 36]`). Todas las demostraciones terminan ahi y dejan de grabar, por lo que la politica solo dispone de la accion "mantener". Mas pasos de entrenamiento no lo solucionan; se necesitan demostraciones de recuperacion que empiecen en esa pose.
- Tarea unica: solo se ha entrenado con el prompt `"Grab the white cup"`. Cualquier otra instruccion queda fuera de la distribucion de entrenamiento.
- Camaras no intercambiables: `images.fixed` (mesa) e `images.handeye` (muneca) no se pueden permutar; hacerlo produce resultados incorrectos con alta confianza.
- Unidades y convenciones estrictas: las cinco articulaciones en grados y la pinza en 0-100. Si el codigo de control usa el convenio de porcentaje de servo (-100..100) hay que convertir antes; de lo contrario las acciones seran erroneas.
- Frecuencia mal aplicada: reproducir las 16 acciones a 30 Hz en lugar de a 15 Hz reduce a la mitad la velocidad prevista del movimiento.
- Dependencia de version fragil: el modelo requiere openpi en un commit concreto y ficheros de configuracion del SO-101 que no estan en upstream. Un cambio en el pipeline de transformaciones puede degradar las acciones sin producir ningun error visible.
- Normalizacion acoplada a los datos: las estadisticas de normalizacion se leen de `assets/so101/grab_cup_2cam_v4/`, de modo que el servidor usa exactamente las del entrenamiento. Mover o alterar esos assets rompe la coherencia.
- Sin reanudacion de entrenamiento: el estado del optimizador no esta incluido. Solo se puede hacer warm start, no continuar el entrenamiento desde el punto exacto.
- Riesgo de alucinacion en el sentido de acciones: al ser una politica, el equivalente es ejecutar movimientos plausibles pero incorrectos cuando la escena difiere de la distribucion de entrenamiento. No hay senal de incertidumbre ni mecanismo de rechazo documentado.
- Sesgos de datos: 146 episodios de un unico operador, un unico objeto (taza blanca) y un unico montaje de camaras. Es esperable un mal rendimiento ante cambios de iluminacion, posicion del objeto, tipo de taza o disposicion de las camaras.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `pi05_base` y del dataset `Ibuprofene/grab_cup_2cam_v4`, cuyos terminos no se detallan en la informacion proporcionada.
- Sin adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de benchmarks publicados. No hay evidencia externa de que funcione en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattewg/pi05-so101-grab-cup-30k
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base (referenciado como `physical-intelligence/pi05_base`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Ibuprofene/grab_cup_2cam_v4
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi (requiere el commit `215abfb217dbac7d5f1273282331b9b1866c0479` mas ficheros de configuracion del SO-101)
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/mattewg_dev/SPELL/runs/n9227y6b
- Checkpoint base en almacenamiento openpi: `gs://openpi-assets/checkpoints/pi05_base/params`
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (se refieren a previsiones meteorologicas de Leshukonskoye) y no aportan enlaces utiles. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
