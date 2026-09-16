# maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-100k

## Resumen

`maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-100k` es un ajuste fino completo (*full fine-tune*) del checkpoint base `lerobot/pi05_base` para una unica tarea de robotica: recoger una bolsa del suelo y colocarla sobre una mesa. Lo publica el usuario de HuggingFace `maskjp` dentro del ecosistema LeRobot, con licencia Apache 2.0 y 4.143.404.816 parametros (aproximadamente 4,14 mil millones) segun los pesos en safetensors. El repositorio ocupa 9,4 GB.

El interes de esta publicacion no esta en el rendimiento de la politica, sino en su valor metodologico: el autor documenta explicitamente que el checkpoint corresponde al paso 100.000 de una ejecucion de 100.000 pasos y que su perdida en datos reservados (0,1186) esta un 312% por encima del minimo de la ejecucion (0,0288 en el paso 2.000). Es decir, se publica como material de comparacion equiparada por paso (*step-matched*) frente a otras variantes, no como los mejores pesos disponibles.

Tecnicamente, la ficha se centra en dos decisiones de diseno poco habituales: acciones expresadas de forma relativa al estado de observacion al inicio de cada bloque (con la pinza tratada como valor absoluto) y aumento de datos puramente fotometrico sobre las tres camaras del robot. Ambas cosas se describen con detalle en la model card, lo que lo convierte en un artefacto util para estudiar representacion de acciones y aumento de datos en politicas vision-language-action.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-language-action (VLA) derivada de pi0.5 / `lerobot/pi05_base`; los detalles internos (codificador visual, experto de acciones) no estan documentados en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (4,14 mil millones), segun los pesos en safetensors |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la unica instruccion de lenguaje documentada esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Dimension de acciones | 10: `joint1`-`joint6`, `gripper`, `base_x`, `base_y`, `base_yaw` |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino completo del checkpoint `lerobot/pi05_base`, orientado a robotica y condicionado por lenguaje, con tres camaras de entrada (izquierda, derecha y muneca) y una accion de 10 dimensiones. La model card no detalla la arquitectura interna del backbone (numero de capas, atencion, esquema de difusion o flow matching), por lo que ese dato queda como no disponible. Lo que si se documenta con precision es el formato de acciones y el proceso de normalizacion, que son parte del contrato de inferencia.

Las acciones se generan de forma relativa al estado de observacion al inicio de cada bloque: `action[t+k] -= observation.state[anchor]` para las 9 dimensiones de pose, mientras que `gripper` se mantiene absoluto porque es un comando y no una pose (`relative_exclude_joints=["gripper"]`). La conversion la realiza `RelativeActionsProcessorStep` en tiempo de lote y `AbsoluteActionsProcessorStep` a la salida, de modo que la politica emite acciones absolutas y el proceso es identico en entrenamiento, evaluacion e inferencia. La normalizacion es de tipo `QUANTILES`, calculada sobre los desplazamientos relativos en bloques de 50 pasos (`meta/relative_action_provenance.json`), no sobre los objetivos absolutos. La rotacion del efector final se almacena en su forma continua 6D (las dos primeras columnas de la matriz de rotacion), no en eje-angulo.

Los datos de entrenamiento consisten en una unica tarea condicionada por lenguaje, con 200 episodios y 477.058 fotogramas (2,65 horas a 50 fps), un brazo u850 sobre base movil y tres camaras. El 5% de los episodios queda reservado (10 de 200; 190 de entrenamiento). El aumento de datos se activa con `--dataset.image_transforms.enable=true` y aplica como maximo 3 de estas transformaciones fotometricas por ejemplo: `brightness` [0,8; 1,2], `contrast` [0,8; 1,2], `saturation` [0,5; 1,5], `hue` [-0,05; 0,05] y `sharpness` [0,5; 1,5]. No hay transformaciones geometricas, de modo que la geometria imagen-accion no se altera. El autor advierte explicitamente que no se puede atribuir ninguna mejora al aumento de datos: la ejecucion sin aumento no usa el mismo horizonte de decaimiento coseno (20K frente a 100K) y solo hay una semilla por rama.

## Capacidades

- Ejecucion de una tarea robotica concreta: recoger una bolsa del suelo y colocarla sobre una mesa, condicionada por la instruccion de lenguaje "pick up the bag on the ground and place it on the table".
- Control de un brazo u850 de 6 articulaciones mas pinza sobre base movil, con acciones de 10 dimensiones que incluyen `base_x`, `base_y` y `base_yaw`.
- Percepcion visual multi-camara: tres flujos de imagen simultaneos (izquierda, derecha y muneca).
- Generacion de acciones por bloques: la normalizacion se define sobre bloques de 50 pasos, coherente con una politica de tipo action chunking a 50 fps.
- Robustez fotometrica inducida por entrenamiento: el modelo ha visto variaciones de brillo, contraste, saturacion, tono y nitidez dentro de los rangos indicados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es una politica de control, no un modelo de proposito general.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision multi-camara si; audio y modo de razonamiento, no.

## Casos de uso

- Recogida y colocacion de objetos deformables en laboratorio: el modelo esta especializado en manipular una bolsa desde el suelo hasta la mesa, con la pinza como unica dimension absoluta, lo que permite integrarlo directamente en una celda de ensayo con un u850 sobre base movil.
- Referencia para comparaciones equiparadas por paso: al publicarse como paso 100K con la curva de perdida completa, sirve para contrastar experimentos de ajuste fino que quieran evaluar el efecto del numero de pasos frente a otras variantes del mismo autor.
- Estudio de representacion relativa frente a absoluta de acciones: el esquema con 9 de 10 dimensiones relativas y la pinza absoluta, junto con el JSON de procedencia de la normalizacion, permite reproducir y auditar el efecto de esta decision de diseno.
- Estudio de aumento fotometrico en politicas VLA: los rangos concretos de ColorJitter y SharpnessJitter permiten replicar el experimento y analizar sensibilidad a iluminacion o color en un robot real.
- Punto de partida para fine-tuning adicional en tareas de pick-and-place: con 4,14 mil millones de parametros y licencia Apache 2.0, puede reentrenarse sobre datos propios de otra tarea de manipulacion movil.
- Investigacion en aprendizaje por imitacion con datos escasos: el dataset completo son solo 2,65 horas y 200 episodios, lo que lo hace util para estudiar regimenes de bajo volumen de datos en robotica.
- Evaluacion de robustez ante cambios de camara o de escena: al haber entrenado con perturbaciones puramente fotometricas, sirve como linea base para medir degradacion cuando cambian las condiciones de iluminacion reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robotica como LIBERO o SimplerEnv) en la informacion disponible. El unico dato de rendimiento es la perdida en el conjunto reservado a lo largo del entrenamiento.

| Paso | eval_loss (esta ejecucion, con aumento) | eval_loss (ejecucion sin aumento, referencia) |
|---|---|---|
| 1K | 0,0328 | no disponible |
| 2K | 0,0288 (minimo) | 0,0290 (minimo) |
| 10K | 0,0412 | no disponible |
| 20K | 0,0502 | 0,0725 |
| 50K | 0,0793 | no disponible |
| 100K | 0,1186 (este repositorio) | no disponible |

El autor senala que la curva empeora a partir del paso 2K y que la perdida del checkpoint publicado esta un 312% por encima del minimo. La comparacion con la ejecucion sin aumento en el paso 20K (0,0502 frente a 0,0725) no debe interpretarse como efecto del aumento, porque el horizonte de decaimiento coseno difiere entre ambas ramas y la tasa de aprendizaje de esta ejecucion es 9,1 veces mayor en ese punto. En el minimo, donde ambas planificaciones estan a un 2,2% de distancia, la diferencia es de 0,0288 frente a 0,0290 (aproximadamente un 1%) con una sola semilla por rama.

## Requisitos de hardware

Estimaciones a partir del recuento real de parametros (4.143.404.816); el autor no publica requisitos de hardware.

- Pesos en bf16: aproximadamente 8,3 GB. Pesos en fp32: aproximadamente 16,6 GB. En int8: aproximadamente 4,1 GB (no se documenta soporte de cuantizacion).
- Inferencia en bf16 con margen para activaciones y tres flujos de imagen: del orden de 10-12 GB de VRAM.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con precision bf16; en 16 GB conviene reducir resolucion de imagen o usar cuantizacion.
- GPU recomendadas para inferencia: L40S, A6000, A100 40/80 GB y H100 para despliegues con varias instancias en paralelo.
- Entrenamiento por ajuste fino completo: estimacion de 60-70 GB solo para pesos maestros en fp32, gradientes y estados de AdamW, lo que exige A100 80 GB o configuraciones multi-GPU. No se documenta LoRA ni otros esquemas parametrizados.
- Opciones de despliegue: la libreria declarada es `lerobot`, por lo que el camino natural es el runtime de LeRobot. No hay evidencia en la informacion proporcionada de soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: no disponible. Como referencia, con bloques de acciones de 50 pasos y captura a 50 fps, cada bloque cubre 1 segundo de ejecucion, por lo que la inferencia tendria que completarse bastante por debajo de ese segundo para operar en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-100k` | 4,14 mil millones | no disponible | Pick-and-place de una bolsa, acciones relativas, con aumento | apache-2.0 | Publicado (0 descargas, 0 likes) |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | no disponible | Politica base generalista de la que parte este ajuste | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| Ejecucion sin aumento del mismo autor | no disponible | no disponible | Misma tarea y mismo esquema de acciones relativas, sin aumento de imagen y horizonte coseno de 20K | no disponible | El autor indica que no esta publicada |

No se dispone de datos suficientes para comparar con alternativas de otros autores (por ejemplo, otras politicas VLA del ecosistema LeRobot) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El propio autor advierte que estos no son los mejores pesos de la ejecucion: la perdida en datos reservados en el paso 100K es un 312% superior al minimo, alcanzado en el paso 2K.
- El modelo esta especializado en una unica tarea y una unica instruccion en ingles. No es un modelo de proposito general y no debe esperarse transferencia a otras tareas sin reentrenamiento.
- No hay evidencia de que el aumento fotometrico mejore el rendimiento: la comparacion disponible confunde el aumento con el horizonte de decaimiento y solo usa una semilla por rama.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones fisicamente invalidas fuera de la distribucion de entrenamiento (iluminacion, posicion de la bolsa, fondo de escena).
- Limitacion de datos: 200 episodios y 2,65 horas de una sola tarea, un solo brazo u850 y un solo montaje de camaras. La generalizacion a otro hardware o a otro robot no esta demostrada.
- Dependencia del contrato de acciones: usar el modelo sin los procesadores de acciones relativas y sin la normalizacion por cuantiles sobre desplazamientos relativos produce acciones incorrectas.
- La rotacion se almacena en forma 6D continua; una conversion a eje-angulo introduce saltos de 2*pi en este robot, segun advierte el autor.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `lerobot/pi05_base` conviene verificar la licencia y las condiciones de la cadena de modelos base.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni reportes de uso en produccion.
- Idiomas soportados no documentados; no hay evidencia de comportamiento multilingue en el condicionamiento por lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-joints-bagplace-aug100k-full-ft-100k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Busqueda web: no se han encontrado enlaces relevantes a este modelo, a pi0.5 ni al ecosistema LeRobot. Los resultados devueltos corresponden a hilos de foros de telefonia movil sin relacion con el modelo.
