# ravediamond/turbovla_so101_bowls_faithful_patha

## Resumen

`ravediamond/turbovla_so101_bowls_faithful_patha` es un checkpoint de pesos de un modelo de vision-lenguaje-accion (VLA) para robotica, obtenido al afinar el checkpoint LIBERO publicado de TurboVLA (`H-EmbodVis/TurboVLA`) sobre 157 episodios de entrenamiento del dataset `ravediamond/so101_bowls_all_trimmed`. Lo publica el autor independiente ravediamond como parte de su serie de replicaciones "Paper vs hardware", y no es un modelo pensado para uso productivo: el propio autor lo etiqueta como `negative-result` y advierte explicitamente que "no es una politica usable".

Su relevancia es metodologica, no funcional. El checkpoint sirve como evidencia de un resultado negativo: al cambiar el texto de la instruccion de la tarea, las acciones generadas por el modelo se desplazan solo 0,020 grados (mediana sobre 25 episodios de validacion no vistos), frente a 0,105 unidades normalizadas del checkpoint LIBERO original sobre LIBERO-Goal. Es decir, el modelo ignora la instruccion en estos datos. El autor retiro su hipotesis inicial de que el fallo provenia de su propio port y concluye que la causa esta en los datos de entrenamiento.

El modelo hereda la arquitectura y el backbone DINOv3 de TurboVLA y se distribuye unicamente como pesos (`.pth`), sin codigo de inferencia empaquetado. El repositorio ocupa 0,9 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en TurboVLA, con backbone DINOv3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en punto flotante `.pth`) |
| Idiomas soportados | no disponible (la entrada de lenguaje es texto de instruccion de tarea, sin cobertura idiomatica declarada) |
| Licencia | DINOv3 License (licencia del checkpoint base, aplicable por incluir el encoder DINOv3 entrenado); el codigo de TurboVLA y el del autor son Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch), fichero `turbovla_bowls_faithful_35000.pth`, sha256 `807219eb…` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint LIBERO publicado por TurboVLA, cuyo backbone es DINOv3. El afinado se realizo con el entrenador original de TurboVLA (commit `a3365e8`) durante 35 000 pasos con tasa de aprendizaje 5e-5, inicializando 666 de los 672 tensores del checkpoint base; los 6 tensores dependientes de la anchura se reinicializaron, segun el `init_report.json` incluido en el repositorio. El dataset de entrenamiento son 157 episodios de `ravediamond/so101_bowls_all_trimmed`, recogidos en el rig SO-101 del autor.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica que motiva la publicacion no es arquitectonica sino experimental: el autor mide la sensibilidad de la politica al texto de instruccion comparando las acciones generadas al intercambiar la tarea, y cuantifica el resultado en grados (0,020° de mediana en 25 episodios de validacion no vistos) frente a la referencia del checkpoint LIBERO sobre LIBERO-Goal (0,105 unidades normalizadas).

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales e instruccion textual, en el formato y el espacio de acciones de TurboVLA sobre el robot SO-101.
- Control de manipulacion de tipo "bowls" (cuencos) en el rig SO-101 del autor, limitado al dominio de los 157 episodios de entrenamiento.
- Entrada de instruccion en lenguaje natural: el modelo acepta texto de tarea, pero en estos datos no lo utiliza de forma efectiva (ver limitaciones).
- No se documentan soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, modo thinking, vision general, audio ni capacidades multilingues.
- El propio autor declara que no es una politica usable; las capacidades anteriores deben interpretarse como el alcance tecnico del checkpoint, no como funcionalidad validada.

## Casos de uso

- Replicacion de resultados negativos en robotica VLA: sirve para reproducir la medicion de sensibilidad a la instruccion (0,020° de desplazamiento mediano) y contrastarla con el checkpoint LIBERO original, usando el codigo publicado en el repositorio de replicacion.
- Auditoria de datasets de robotica: permite estudiar si un dataset concreto (aqui, `so101_bowls_all_trimmed`) contiene suficiente variacion de instrucciones como para que la politica aprenda a condicionar sus acciones al texto, antes de invertir en entrenamientos largos.
- Docencia e investigacion en evaluacion de politicas: util como ejemplo documentado de como un fine-tune con buenos numeros de entrenamiento puede producir una politica que ignora la tarea, y de como detectarlo con un test de contrafactual de instruccion.
- Desarrollo de tests de regresion para pipelines VLA: el par de checkpoints (base LIBERO y este fine-tune) permite validar que un nuevo port o framework de inferencia reproduce las metricas publicadas antes de desplegar nada.
- Analisis de licencias en modelos derivados: el repositorio incluye el texto de la DINOv3 License y documenta que un fine-tune que conserva el encoder DINOv3 hereda esos terminos, lo que lo convierte en un caso de estudio util para equipos juridicos y de compliance en IA open source.
- Referencia para calibracion de rigs SO-101: los episodios y el checkpoint permiten comprobar el comportamiento del hardware y del espacio de acciones del SO-101 en un entorno controlado de laboratorio, sin pretension de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros). La unica metrica reportada es la sensibilidad de la politica al cambio de instruccion:

| Metrica | Este checkpoint (SO-101 bowls) | Checkpoint LIBERO de TurboVLA (LIBERO-Goal) |
|---|---|---|
| Desplazamiento de acciones al cambiar el texto de tarea (mediana) | 0,020° sobre 25 episodios de validacion no vistos | 0,105 unidades normalizadas |

No se reportan tasas de exito, recompensas medias ni curvas de aprendizaje en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,9 GB en pesos, pero no se documenta el consumo en GPU ni el tamano exacto del modelo.
- GPU recomendadas: no disponible. Al tratarse de un modelo VLA con backbone DINOv3, es previsible que requiera GPU con soporte CUDA, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El checkpoint se distribuye como pesos `.pth` para cargar con el codigo de TurboVLA (`github.com/H-EmbodVis/TurboVLA`), que es Apache-2.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ravediamond/turbovla_so101_bowls_faithful_patha` | no disponible | no disponible | Ignora la instruccion en SO-101 bowls (0,020° de desplazamiento) | DINOv3 License | Pesos `.pth` en Hugging Face, 0 descargas |
| `H-EmbodVis/TurboVLA` (checkpoint LIBERO) | no disponible | no disponible | Sensible a la instruccion en LIBERO-Goal (0,105 unidades normalizadas) | DINOv3 License | Checkpoint publicado por el autor original |
| Otros VLA de robotica de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria mas alla del checkpoint base.

## Limitaciones y advertencias

- No es una politica usable: el autor lo declara explicitamente. No debe desplegarse en un robot real para tareas productivas.
- Ignora la instruccion: el cambio de texto de tarea apenas altera las acciones (0,020° de mediana), por lo que no es fiable para control condicionado por lenguaje.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset se limita a 157 episodios de una unica tarea (cuencos) en un unico rig.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es ejecutar acciones no solicitadas por la instruccion, que es precisamente el fallo documentado.
- Limitaciones de contexto e idioma: no se declara cobertura idiomatica ni longitud de contexto; la instruccion de tarea es el unico canal de lenguaje.
- Restricciones de licencia: los pesos se rigen por la DINOv3 License, no por Apache-2.0. Cualquier uso o redistribucion debe respetar esos terminos; el codigo de TurboVLA y el del autor son Apache-2.0.
- Caveat para produccion: el checkpoint se publica como evidencia de un resultado negativo; su valor esta en la replicacion y el analisis, no en el rendimiento.
- Procedencia: fine-tune de un tercero sobre un checkpoint ajeno; conviene verificar el hash sha256 `807219eb…` antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravediamond/turbovla_so101_bowls_faithful_patha
- Modelo base: https://huggingface.co/H-EmbodVis/TurboVLA
- Licencia DINOv3: https://huggingface.co/H-EmbodVis/TurboVLA/blob/main/DINOv3_LICENSE.md
- Dataset de entrenamiento: https://huggingface.co/datasets/ravediamond/so101_bowls_all_trimmed
- Codigo de TurboVLA: https://github.com/H-EmbodVis/TurboVLA
- Post "Paper vs hardware 12: TurboVLA": https://shissorobotics.com/blog/2026/10/23/paper-vs-hardware-turbovla/
- Post "TurboVLA: a policy that ignored its instruction": https://shissorobotics.com/blog/2026/10/08/turbovla-a-policy-that-ignored-its-instruction/
- Replicacion y codigo: https://github.com/ravediamond/paper-vs-hardware/tree/main/posts/2026-10-23-paper-vs-hardware-turbovla
- Registro de papers re-testados: https://shissorobotics.com/papers/
