# easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k

## Resumen

`easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k` es un checkpoint de política robótica de tipo VLA (vision-language-action) obtenido por fine-tuning de `nvidia/GR00T-N1.5-3B`. El modelo incorpora un cabezal de acción con mezcla de expertos (MoE) de cuatro ramas y compresión de action chunks: los expertos comprimidos emiten 6 filas de acción que cubren 15 pasos temporales (ratio 2,5x) y 3 filas que cubren 8 pasos, frente a las 16 filas por paso de las ramas sin comprimir. El objetivo es reducir el número de pasos de decodificación necesarios para ejecutar una trayectoria, manteniendo la precisión en las fases de contacto.

El modelo se ha entrenado sobre RoboCasa MG 300 (7.200 episodios, 3 cámaras de 256x256 a 20 fps) durante 60.000 pasos con batch global de 64 en 2 GPU H200, partiendo de etiquetas de ratio de velocidad generadas por un VLM y volcadas en el tensor de acción (`ratio_label`, dims 12:14). Una cabeza de confianza escalar decide en inferencia si se usa el grupo comprimido o el grupo fino, y un router selecciona el horizonte dentro del grupo (`m8` o `m4`).

Es relevante ahora porque aborda uno de los cuellos de botella prácticos de los VLA en robótica: la frecuencia de inferencia. En lugar de decodificar un chunk denso de 16 pasos, el modelo puede emitir 6 filas a 2,5x de velocidad efectiva cuando la confianza lo permite, y volver al modo fino en frames de contacto. El checkpoint ocupa 8,0 GB, tiene 2.829.861.577 parámetros y se distribuye únicamente para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en nvidia/GR00T-N1.5-3B, con cabezal de accion MoE de 4 expertos (main h16 1x, n8 h8 1x, m8 h16 2.5x, m4 h8 2.5x) y compresion de action chunks |
| Parametros totales | 2.829.861.577 (2,83B) segun safetensors |
| Parametros activos | no disponible; en inferencia el gate de confianza elige grupo (fino o comprimido) y el router selecciona el experto dentro del grupo |
| Longitud de contexto | no disponible (modelo de politica robotica; consume observaciones de 3 camaras a 256x256 y 20 fps, no contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors; entrenamiento en bf16; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de terminos en la informacion disponible) |
| Formato de pesos | safetensors (checkpoint solo de inferencia: pesos y config, sin estado de optimizador, scheduler ni RNG) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.5-3B`, un VLA que combina un backbone vision-language con un cabezal de generacion de acciones. Sobre esa base se anade un esquema ATQ (action quantization) con cuatro expertos: `main` (h16, 1x, 16 filas), `n8` (h8, 1x, 8 filas), `m8` (h16, 2.5x, patron `[2,3,2,3,2,3]` que produce 6 filas para 15 pasos) y `m4` (h8, 2.5x, patron `[2,3,3]` que produce 3 filas para 8 pasos). La fusion de filas suma las dimensiones continuas dentro de cada bloque y, para las dimensiones discretas `[6, 11]` (gripper_close y control_mode), toma el ultimo valor del bloque (`--discrete-action-dims 6 11`). Esta es precisamente la diferencia con el checkpoint hermano `atq-labelgated-2.5x-vlm_contact-60k`, que sumaba esas dimensiones binarias.

El gating es label-gated: una cabeza de confianza escalar (regresion, MSE, `conf_loss_coef=0.1`, lectura desacoplada del encoder de estado) predice si corresponde el grupo fino o el comprimido mediante `pred >= tau`. El objetivo de la cabeza es `conf * (1 - fixed)`, con la confianza de ratio de velocidad del VLM forzada a 0 en frames de contacto, de modo que el modelo tiende al modo fino cuando hay contacto. El gate solo actua en inferencia: los cuatro expertos se entrenan en todos los pasos. El router usa perdidas soft_mixture, kl_supervise (0,1) y balance (0,05), con warmup de 5.000 pasos y `min_prob` 0,05. Los decoders de `m8`, `m4` y `n8` se inicializan desde `0.02*randn`.

El entrenamiento se realizo durante 60.000 pasos con batch global 64 (32 x 2 GPU), AdamW con lr 1e-4 y schedule coseno, warmup 0,05, semilla 42 y bf16, en 2 GPU H200 (trabajo Slurm 16244, finalizado el 17 de septiembre de 2026). El dataset es RoboCasa MG 300 (7.200 episodios, 3 camaras de 256x256, 20 fps) con etiquetas de `prehj/robocasa-ratio-labels-contact`, y la configuracion de datos es `single_panda_gripper_conf`. El codigo corresponde a `rakybond007/GR00T-action-quantization`, rama `jimin-dev-label-gated` en el commit 3476549.

## Capacidades

- Generacion de acciones roboticas: mapea observaciones visuales multicamara (3 camaras, 256x256, 20 fps) e instrucciones al tensor de accion con `ratio_label` en las dimensiones 12:14.
- Compresion adaptativa de action chunks: emite entre 3 y 16 filas de accion segun el experto seleccionado, con ratios de 1x, 2,5x (para `m8` y `m4`).
- Gating selectivo por confianza: decide en inferencia entre ejecucion fina y comprimida mediante un umbral `tau` configurable.
- Enrutamiento MoE por horizonte: el router elige entre `m8` (6 filas / 15 pasos) y `m4` (3 filas / 8 pasos) dentro del grupo comprimido.
- Manejo explicito de dimensiones discretas: preserva gripper_close y control_mode tomando el ultimo valor del bloque comprimido.
- Control de contacto: la confianza se fuerza a 0 en frames de contacto, priorizando el modo sin compresion en esas fases.
- Manipulacion con pinza simple: la configuracion de datos `single_panda_gripper_conf` indica un unico brazo con pinza Panda.
- Metadatos de salida: el resultado incluye `_flevel_level` y `_flevel_k`, y el cliente ejecuta las filas devueltas tal cual, sin re-fusion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso textual, vision generalista ni audio.

## Casos de uso

- Politica de manipulacion en simulacion RoboCasa: el modelo esta entrenado especificamente sobre RoboCasa MG 300, por lo que puede desplegarse directamente como politica de control en ese entorno para replicar o ampliar los experimentos de compresion de acciones.
- Reduccion de frecuencia de inferencia en robot real: ejecutando el experto `m8` con `tau` alto, el sistema cubre 15 pasos temporales con 6 filas de accion, lo que reduce el numero de llamadas al modelo por segundo de trayectoria respecto a un chunk denso.
- Tareas con fases de contacto delicadas: gracias al forzado de confianza a 0 en frames de contacto, el gate devuelve el control al experto fino en operaciones de agarre o insercion, donde la compresion temporal degradaria la precision.
- Investigacion sobre action chunking y cuantizacion: sirve como referencia reproducible (semilla 42, 60k pasos, hiperparametros documentados) para comparar estrategias de fusion de filas y esquemas de enrutamiento MoE.
- Evaluacion de estrategias de gating: al ser `tau` un parametro de evaluacion y no una constante entrenada, permite estudiar la curva coste-precisión variando el umbral sin reentrenar.
- Generacion de datos sinteticos en simulacion: la politica puede usarse para producir rollouts etiquetados en RoboCasa que alimenten posteriores ciclos de entrenamiento o destilacion.
- Estudio de sim-to-real en VLA comprimidos: la reduccion de filas de accion simplifica la ejecucion en controladores de baja frecuencia, lo que facilita probar transferencia a hardware con tasas de control limitadas.
- Benchmarking interno de cabezales de accion: comparar `m8` frente a `m4` y frente a `main`/`n8` permite medir el coste en exito de cada nivel de compresion en una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe configuracion de entrenamiento, gating y reglas de fusion, pero no incluye tasas de exito, errores de seguimiento ni comparaciones numericas con el modelo base. Las busquedas web realizadas no devolvieron resultados tecnicos relevantes sobre este checkpoint.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 5,7 GB para 2,83B parametros; el repositorio completo ocupa 8,0 GB.
- Entrenamiento original: 2 GPU H200 con batch global 64 (32 x 2), bf16, 60.000 pasos.
- Inferencia en GPU profesional: cabe con holgura en A100 (40/80 GB), H100 y H200, dejando margen para el encoder de vision y las 3 camaras a 256x256.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y previsiblemente en tarjetas de 16 GB, dado el tamano de pesos; no se especifican requisitos minimos oficiales.
- Cuantizacion: no se publican pesos GGUF, AWQ ni GPTQ; no hay ruta documentada de cuantizacion para este checkpoint.
- Despliegue: el codigo asociado es el stack GR00T (`scripts/gr00t_finetune.py` con flags `--use-moe-routing`, `--moe-label-gated`, `--moe-speed 2.5`, entre otras). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son servidores orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput: no disponibles. El unico dato indirecto es la ganancia de compresion: 6 filas cubren 15 pasos de trayectoria (2,5x) y 3 filas cubren 8 pasos, lo que reduce el numero de filas a decodificar por unidad de tiempo.
- Restriccion practica: al ser un checkpoint solo de inferencia, no permite reanudar entrenamiento sin reinicializar el estado del optimizador y del scheduler.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Compresion de acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k` (este) | 2,83B | 3 camaras 256x256, 20 fps | Si, MoE de 4 expertos, 1x y 2,5x, dims discretas `[6, 11]` con ultimo valor | other | HuggingFace, 0 descargas |
| `easyminnn/atq-labelgated-2.5x-vlm_contact-60k` (variante hermana) | no disponible | 3 camaras 256x256, 20 fps | Si, identica salvo que suma las dims binarias en bloques comprimidos | other | HuggingFace |
| `nvidia/GR00T-N1.5-3B` (modelo base) | ~3B | VLA de proposito general | No documentada en la informacion disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes ni con otras familias de VLA, por lo que la comparacion se limita a configuracion, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia `other` sin terminos detallados en la informacion proporcionada: es imprescindible revisar las condiciones del modelo base `nvidia/GR00T-N1.5-3B` antes de cualquier uso comercial, ya que el fine-tuning hereda restricciones de la base.
- Ausencia total de validacion publica: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni tasas de exito publicadas.
- Dominio muy restringido: entrenado unicamente sobre RoboCasa MG 300 con configuracion de pinza simple; no hay evidencia de generalizacion a otras morfologias, tareas o entornos reales.
- Riesgo de sim-to-real no cuantificado: no se documentan experimentos en hardware fisico ni tecnicas de aleatorizacion de dominio.
- `tau` (`conf_threshold`) es un parametro de evaluacion, no una constante entrenada: el valor almacenado de 0,5 es solo un valor por defecto, y el comportamiento del gate cambia con el umbral, por lo que requiere ajuste por tarea.
- La fusion de dimensiones discretas `[6, 11]` tomando el ultimo valor del bloque puede perder transiciones de gripper o de modo de control dentro de la ventana comprimida, especialmente en secuencias con cambios rapidos.
- Dependencia de la cabeza de confianza: si la prediccion de confianza es erronea, el modelo puede seleccionar el grupo comprimido en fases que requieren precision fina, aunque el forzado a 0 en frames de contacto mitiga parcialmente este riesgo.
- Checkpoint solo de inferencia: no incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento tal cual.
- Desajuste de nomenclatura: el nombre del modelo base indica 3B, mientras que el fine-tuning tiene 2,83B parametros, lo que puede confundir al estimar requisitos de memoria.
- Cualquier despliegue en robot real exige capas externas de seguridad y validacion; una politica neuronal puede generar acciones incorrectas o peligrosas sin que exista un mecanismo interno de rechazo.
- No se documentan idiomas soportados ni capacidades de seguimiento de instrucciones en lenguaje natural mas alla de la configuracion de datos empleada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Variante hermana (dims discretas sumadas): https://huggingface.co/easyminnn/atq-labelgated-2.5x-vlm_contact-60k
- Dataset de etiquetas: https://huggingface.co/datasets/prehj/robocasa-ratio-labels-contact
- Codigo de entrenamiento: `rakybond007/GR00T-action-quantization`, rama `jimin-dev-label-gated`, commit 3476549 (script `scripts/gr00t_finetune.py`)
