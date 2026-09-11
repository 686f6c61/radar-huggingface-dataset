# easyminnn/atq-labelgated-2.5x-vlm_contact-60k

## Resumen

`easyminnn/atq-labelgated-2.5x-vlm_contact-60k` es un checkpoint de inferencia para robótica dentro de la familia de modelos visión-lenguaje-acción (VLA) NVIDIA Isaac GR00T. Se obtiene por ajuste fino de `nvidia/GR00T-N1.5-3B` sobre el conjunto RoboCasa MG 300 (7.200 episodios, 3 cámaras a 256x256 y 20 fps) y su rasgo diferencial es una capa de mezcla de expertos (MoE) que comprime los fragmentos de acción ("action chunks") para acelerar la inferencia hasta un factor declarado de 2,5x.

El modelo incorpora cuatro expertos con distintas cabezas de horizonte (`main` h16 1x, `n8` h8 1x, `m8` h16 2,5x y `m4` h8 2,5x) y un enrutado condicionado por etiqueta: una cabeza de confianza decide si usar el grupo fino o el comprimido, y un router elige el horizonte dentro del grupo elegido. El gating solo se aplica en inferencia; los cuatro expertos se entrenan en cada paso. Las etiquetas de ratio de velocidad del VLM se incorporan al tensor de acción en las dimensiones 12:14 (`ratio_label`) y se fuerzan a cero en los fotogramas de contacto.

Es relevante ahora porque ataca uno de los cuellos de botella prácticos del control robótico con VLA: la latencia de generación de secuencias de acción a 20 fps. Al reducir el número de filas de acción devueltas (de 16 filas del experto fino a 6 filas / 15 pasos o 3 filas / 8 pasos en los expertos comprimidos), se busca mantener la frecuencia de control con menos cómputo, manteniendo calidad en tareas con contacto físico. El checkpoint tiene 2.829.861.577 parámetros, ocupa 8,0 GB en el repositorio y se distribuye únicamente como pesos de inferencia en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.5 (columna VLM + cabeza de accion tipo diffusion transformer) con capa MoE de 4 expertos y gating condicionado por etiqueta |
| Parametros totales | 2.829.861.577 |
| Parametros activos | no disponible (el gating selecciona un subconjunto de expertos en inferencia, pero el autor no publica el recuento de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican variantes cuantizadas; el checkpoint se distribuye en bf16 |
| Idiomas soportados | no disponibles (no se especifican en la model card; es un modelo de robotica orientado a instrucciones de tarea) |
| Licencia | other (heredada de la licencia del modelo base NVIDIA GR00T N1.5) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,0 GB |
| Pipeline declarado | robotics |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Creado / actualizado | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.5-3B`, un VLA de aproximadamente 3.000 millones de parametros que combina un codificador visión-lenguaje con una cabeza generativa de acciones. Sobre esa base, este checkpoint introduce una capa de mezcla de expertos con cuatro cabezas de horizonte: `main` h16 1x (16 filas), `n8` h8 1x (8 filas), `m8` h16 2,5x (patrón `[2,3,2,3,2,3]`, 6 filas para 15 pasos) y `m4` h8 2,5x (patrón `[2,3,3]`, 3 filas para 8 pasos). El enrutado es "label-gated": una cabeza de confianza (`conf head`, regresión escalar con pérdida MSE y `conf_loss_coef=0.1`, con la lectura desacoplada del codificador de estado) compara su predicción con un umbral `tau` y decide entre el grupo fino y el comprimido; después, un router elige el horizonte dentro del grupo. El objetivo de la cabeza de confianza es `conf * (1 - fixed)` y se fuerza a cero en los fotogramas de contacto. El gating se aplica solo en inferencia, mientras que los cuatro expertos se entrenan en todos los pasos.

El ajuste fino se realizó sobre RoboCasa MG 300 (7.200 episodios, 3 cámaras de 256x256, 20 fps) con etiquetas de ratio de velocidad del VLM incorporadas al tensor de acción (`ratio_label`, dimensiones 12:14), provenientes del conjunto `prehj/robocasa-ratio-labels-contact`. El entrenamiento duró 60.000 pasos con batch global 64 (32 x 2 GPU), optimizador AdamW con learning rate 1e-4 y scheduler coseno, warmup de 0,05, semilla 42 y precisión bf16 sobre 2x H200. Las pérdidas del router son `soft_mixture` más `kl_supervise` (coeficiente 0,1) más `balance` (coeficiente 0,05), con warmup del router de 5.000 pasos y `min_prob` de 0,05. La innovación técnica central es la compresión de fragmentos de acción guiada por etiquetas de contacto y de ratio de velocidad, que permite devolver menos filas de acción sin re-mezclarlas en el cliente.

## Capacidades

- Generación de secuencias de acción para control robótico de manipulación a partir de observaciones visuales (3 cámaras a 256x256) y estado del robot.
- Inferencia multi-horizonte seleccionable: 16 filas (experto fino), 8 filas, 6 filas / 15 pasos o 3 filas / 8 pasos, con compresión declarada de 2,5x en los expertos `m8` y `m4`.
- Enrutado condicionado por confianza: la cabeza de confianza ajusta en tiempo de evaluación el uso del grupo comprimido mediante el umbral `tau` (`conf_threshold`, valor por defecto 0,5).
- Tratamiento específico de tareas con contacto: la confianza se fuerza a cero en fotogramas de contacto, priorizando el grupo fino en esas fases.
- Ejecución directa de las filas devueltas: los metadatos de salida incluyen `_flevel_level` y `_flevel_k`, y el cliente ejecuta las filas tal cual, sin re-mezclado.
- Compatibilidad con el stack GR00T y con el código de `rakybond007/GR00T-action-quantization` (rama `jimin-dev-label-gated`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo general, visión de propósito general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de un solo brazo con pinza: el checkpoint se ajustó con la configuración `single_panda_gripper_conf`, por lo que es directamente aplicable a tareas de pick-and-place con efector tipo Panda, usando el grupo de expertos adecuado según la fase de la tarea.
- Control en tiempo real a 20 fps: con el experto `m4` (3 filas para 8 pasos) o `m8` (6 filas para 15 pasos) se reduce el número de filas de acción a ejecutar, lo que ayuda a sostener el bucle de control sin re-merge en el cliente.
- Tareas de contacto rico (ensamblaje, inserción, empuje): la cabeza de confianza fuerza el uso del grupo fino en fotogramas de contacto, lo que permite alternar entre velocidad y precisión dentro de la misma política.
- Investigación en compresión de action chunks: sirve como referencia reproducible para estudiar cuánto horizonte de acción se puede comprimir manteniendo la tarea, dado que el patrón de compresión está explícito en la model card.
- Evaluación de enrutado MoE en políticas robóticas: el umbral `tau` es un parámetro de evaluación, de modo que se puede barrer el compromiso latencia-calidad sin reentrenar.
- Integración en pipelines de simulación RoboCasa: el modelo se entrenó sobre RoboCasa MG 300, por lo que encaja en flujos de evaluación en simulación antes de un despliegue en hardware.
- Despliegue en estaciones con una sola GPU: al tener 2,83B parámetros en bf16, el checkpoint es viable en aceleradores de gama alta de una sola tarjeta, lo que facilita laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuración de entrenamiento y el esquema de compresión, pero no incluye métricas de tasa de éxito, MMLU, HumanEval, GSM8K ni ninguna otra tabla comparativa.

Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo ni sobre sus benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6 GB solo para pesos en bf16 (2,83B parametros), mas activaciones del codificador visual (3 camaras a 256x256) y de la cabeza de accion. Como referencia de tamano, el repositorio completo ocupa 8,0 GB. Estimacion orientativa, no publicada por el autor.
- GPU recomendadas: una GPU con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). El entrenamiento se realizo en 2x H200, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) y en tarjetas de 16 GB con margen ajustado, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el stack GR00T y el repositorio `rakybond007/GR00T-action-quantization` (rama `jimin-dev-label-gated`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; estos servidores estan orientados a modelos de lenguaje y no cubren cabezas de accion tipo VLA.
- Latencia y throughput: no disponible. El unico dato relacionado es la frecuencia del conjunto de datos (20 fps) y el factor de compresion declarado de 2,5x en los expertos `m8` y `m4`.
- Nota de despliegue: la model card indica que la salida incluye metadatos `_flevel_level` y `_flevel_k` y que el cliente debe ejecutar las filas devueltas tal cual, sin re-mezclarlas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atq-labelgated-2.5x-vlm_contact-60k (este) | 2.829.861.577 | no disponible | VLA GR00T N1.5 + MoE de 4 expertos con gating por etiqueta | other | HuggingFace |
| nvidia/GR00T-N1.5-3B | no disponible en la informacion proporcionada (etiquetado como 3B en `base_model`) | no disponible | VLA | NVIDIA (other) | HuggingFace |
| Otros VLA abiertos de tamano similar | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo para ninguno de los modelos de la tabla, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de solo inferencia: se han eliminado los estados de optimizador, scheduler y RNG, por lo que no sirve para reanudar el entrenamiento tal cual.
- Dominio restringido: el ajuste fino se hizo exclusivamente sobre RoboCasa MG 300 con configuracion `single_panda_gripper_conf`; el comportamiento fuera de ese tipo de robot, camaras o tareas no esta documentado.
- El umbral `tau` (`conf_threshold`) almacenado es 0,5 y se describe como un valor por defecto, no como una constante entrenada; cambiarlo altera el reparto entre grupo fino y comprimido y, por tanto, el rendimiento y la latencia.
- La compresion de fragmentos de accion puede degradar la precision en tareas que no sean de contacto, ya que el forzado de confianza a cero solo se aplica en fotogramas de contacto.
- No se publican resultados de benchmarks ni tasas de exito, por lo que no hay evidencia cuantitativa de la perdida de calidad respecto al modelo base.
- No se especifican idiomas soportados, sesgos conocidos ni comportamiento ante instrucciones fuera de distribucion.
- Riesgo de alucinacion en la planificacion de acciones: como todo VLA, puede generar secuencias de accion no validas fisicamente; se recomienda validacion en simulacion antes de operar hardware real.
- Licencia `other` heredada del modelo base NVIDIA GR00T N1.5: es imprescindible revisar los terminos de NVIDIA antes de cualquier uso comercial, ya que la model card no reproduce el texto de la licencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validacion independiente de la comunidad.
- Los metadatos indican fechas de creacion y actualizacion de 2026-09-11; conviene verificar la version exacta del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/easyminnn/atq-labelgated-2.5x-vlm_contact-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Repositorio de codigo: `rakybond007/GR00T-action-quantization`, rama `jimin-dev-label-gated`, commit 3345064
- Script de ajuste fino: `scripts/gr00t_finetune.py --use-moe-routing --moe-num-experts 4 --use-merged-8-head --use-merged-4-head --use-native-8-head --moe-label-gated --moe-speed 2.5 --data-config single_panda_gripper_conf`
- Conjunto de etiquetas: `prehj/robocasa-ratio-labels-contact`
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web proporcionados.
