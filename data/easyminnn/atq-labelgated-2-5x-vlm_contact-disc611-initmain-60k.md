# easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-initmain-60k

## Resumen

El modelo `easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-initmain-60k` es un checkpoint de tipo VLA (vision-language-action) para robótica, afinado a partir de `nvidia/GR00T-N1.5-3B` sobre el benchmark de manipulación RoboCasa MG 300 (7.200 episodios, 3 cámaras a 256x256 y 20 fps). Su particularidad es que incorpora una arquitectura de mezcla de expertos (MoE) de cuatro expertos sobre la cabeza de acciones, diseñada para comprimir los *action chunks*: en lugar de emitir una secuencia completa de pasos de acción, el modelo emite un número reducido de filas que el cliente ejecuta tal cual, sin re-mezclarlas. La variante `2.5x` agrupa los expertos según una relación de velocidad de 2,5 veces respecto a la política densa.

El checkpoint tiene 2.829.861.577 parámetros reales (según los pesos en safetensors) y un repositorio de 8,0 GB. Se distribuye como checkpoint de solo inferencia: los pesos y la configuración están presentes, pero se han eliminado el optimizador, el planificador y el estado del generador aleatorio, por lo que no sirve para reanudar un entrenamiento. El entrenamiento se realizó durante 60.000 pasos con batch global de 64 (32 x 2 GPU) en dos H200, con AdamW, learning rate 1e-4 con decaimiento coseno, precisión bf16 y semilla 42.

Su relevancia actual es doble: por un lado, explora la compresión de secuencias de acción en políticas VLA, un cuello de botella habitual en el despliegue sobre hardware robótico real; por otro, introduce un *gating* por etiqueta en el que una cabeza de confianza decide entre el grupo de expertos fino y el comprimido en tiempo de inferencia, con `tau` como parámetro ajustable. El modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de nvidia/GR00T-N1.5-3B con cabeza de acciones en mezcla de expertos (MoE) de 4 expertos y *gating* por etiqueta |
| Parametros totales | 2.829.861.577 (2,83 mil millones) |
| Parametros activos | no disponible (no se documenta el reparto de parametros activos por token entre los cuatro expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay artefactos GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda las condiciones del modelo base nvidia/GR00T-N1.5-3B; requiere revision manual antes de uso comercial) |
| Formato de pesos | safetensors (pesos + config; checkpoint de solo inferencia sin optimizador, planificador ni estado RNG) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.5-3B`, una política VLA que combina un codificador visual, un componente de lenguaje y una cabeza de acciones. Sobre esa base, este checkpoint sustituye la decodificación de acciones por una mezcla de cuatro expertos con distintos horizontes y anchuras de cabeza: `main` h16 1x (16 filas), `n8` h8 1x (8 filas), `m8` h16 2.5x (patrón `[2,3,2,3,2,3]`, 6 filas para 15 pasos) y `m4` h8 2.5x (patrón `[2,3,3]`, 3 filas para 8 pasos). La regla de fusión suma las dimensiones continuas dentro de cada bloque y, para las dimensiones discretas `[6, 11]` (cierre de pinza y modo de control), toma el último valor del bloque, configurado con `--discrete-action-dims 6 11`. Los expertos comprimidos no se inicializan de forma aleatoria: sus decodificadores se copian del decodificador `main` preentrenado mediante la opción `--init-experts-from-main`, lo que es precisamente la diferencia respecto al checkpoint hermano `easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k`.

El enrutamiento es *label-gated*: una cabeza de confianza (`conf head`, regresión escalar con MSE, `conf_loss_coef=0.1` y lectura desacoplada del codificador de estado) decide si se usa el grupo fino o el comprimido según `pred >= tau`; después, el router elige el horizonte dentro del grupo. Las puertas solo actúan en inferencia: los cuatro expertos se entrenan en cada paso. El objetivo de confianza es `conf * (1 - fixed)`, donde `conf` proviene de las etiquetas de relación de velocidad VLM y se fuerza a 0 en fotogramas de contacto. Las pérdidas del router son `soft_mixture` más `kl_supervise` (0,1) y `balance` (0,05), con un calentamiento del router de 1.000 pasos y `min_prob 0.05`. El entrenamiento se ejecutó sobre RoboCasa MG 300 con las etiquetas de `prehj/robocasa-ratio-labels-contact`, 60.000 pasos, AdamW con lr 1e-4 coseno, warmup 0,05, semilla 42, bf16 y 2 x H200 (trabajo Slurm 16243, finalizado el 2026-09-17). El código corresponde a la rama `jimin-dev-label-gated` (commit 3476549) del repositorio `rakybond007/GR00T-action-quantization`, más un parche `--init-experts-from-main` sobre `scripts/gr00t_finetune.py`.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales de tres cámaras a 256x256 y 20 fps, con una política entrenada específicamente para el benchmark RoboCasa MG 300.
- Compresión de *action chunks* con relación de velocidad 2,5x: los expertos `m8` y `m4` emiten 6 filas para 15 pasos y 3 filas para 8 pasos respectivamente, reduciendo el número de vectores de acción que el cliente debe procesar.
- Decodificación con horizonte variable: la cabeza de confianza selecciona entre grupo fino y comprimido, y el router escoge el experto de horizonte adecuado dentro del grupo.
- Tratamiento diferenciado de dimensiones discretas de acción (cierre de pinza y modo de control) mediante la regla de último valor de bloque.
- Salida con metadatos `_flevel_level` y `_flevel_k` que indican el nivel y el horizonte aplicados, para que el cliente ejecute las filas devueltas tal cual.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.
- No se documentan capacidades de audio ni de visión más allá del uso de las cámaras como entrada de política.

## Casos de uso

- Manipulación robótica en entornos de cocina simulados: el modelo está afinado sobre RoboCasa MG 300 y recibe tres cámaras a 256x256, por lo que se puede emplear directamente para reproducir o ampliar las tareas de este benchmark con un brazo Panda y pinza.
- Tareas con contacto físico rico: las etiquetas de velocidad se fuerzan a 0 en fotogramas de contacto (`vlm_contact`), lo que hace al checkpoint adecuado para experimentos donde el contacto con objetos y superficies es crítico y conviene no forzar la compresión.
- Despliegue en robot con cómputo limitado: la relación 2,5x reduce el número de filas de acción a ejecutar (15 pasos en 6 filas, 8 pasos en 3 filas), lo que disminuye la carga de comunicación y de ejecución en el bucle de control.
- Investigación en compresión de secuencias de acción: sirve como referencia reproducible para comparar inicialización de expertos (copia del decodificador `main` frente a inicialización aleatoria `0.02*randn`) y longitud del calentamiento del router (1.000 pasos frente a configuraciones más largas).
- Estudio del *gating* por etiqueta en políticas VLA: permite analizar cómo afecta el umbral `tau` a la mezcla entre calidad y velocidad, dado que es un parámetro de evaluación y no una constante entrenada.
- Fine-tuning sobre nuevas tareas de manipulación: al ser un checkpoint de solo inferencia, se puede usar como peso de partida para reentrenar con el repositorio de código indicado, aplicando los mismos *flags* de MoE, *gating* por etiqueta y dimensiones discretas.
- Evaluación comparativa de políticas robóticas: útil para medir el coste en éxito de tarea al reducir el número de pasos de acción, siempre que se ejecute la evaluación completa en el simulador o en el robot correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta detalles de configuración de entrenamiento (60.000 pasos, batch global 64, 2 x H200, bf16), la relación de velocidad 2,5x y la estructura de expertos, pero no incluye tasas de éxito en RoboCasa ni métricas de otro tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.829.861.577 parámetros en bf16, los pesos ocupan aproximadamente 5,7 GB. Hay que sumar la memoria de activaciones del codificador visual, que procesa tres cámaras a 256x256, y la de las cuatro cabezas de experto.
- GPU recomendadas: el entrenamiento se realizó con 2 x H200 (batch global 64, 32 por GPU). Para inferencia no se documentan requisitos oficiales, pero por tamaño el modelo cabe con holgura en una A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en tarjetas de 12-16 GB si se ajusta el tamaño de lote de observaciones; no hay confirmación oficial en la información disponible.
- Opciones de despliegue: al ser una política VLA con cabeza de acción en MoE y metadatos `_flevel_level` / `_flevel_k`, requiere el stack de inferencia de GR00T junto con el código de `rakybond007/GR00T-action-quantization` (rama `jimin-dev-label-gated`, commit 3476549) y el parche `--init-experts-from-main`. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables; tampoco se documenta compatibilidad con vLLM o TGI.
- Latencia y throughput estimados: no disponible. El único dato de rendimiento es la relación de compresión de 2,5x sobre los *action chunks* (6 filas / 15 pasos para `m8` y 3 filas / 8 pasos para `m4`, frente a 16 filas del experto `main` original).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atq-labelgated-2.5x-vlm_contact-disc611-initmain-60k | 2,83 mil millones | no disponible | VLA con MoE de 4 expertos y gating por etiqueta | other | Pesos safetensors en HuggingFace; 0 descargas |
| nvidia/GR00T-N1.5-3B (modelo base) | no disponible en la informacion proporcionada | no disponible | VLA | no disponible en la informacion proporcionada | Repositorio publico de NVIDIA |
| easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k (variante hermano) | no disponible | no disponible | VLA con MoE de 4 expertos y gating por etiqueta | other | Pesos safetensors en HuggingFace |
| Otras familias VLA (OpenVLA, pi0 y similares) | no disponible | no disponible | no disponible | no disponible | No se han recuperado datos comparativos en la informacion disponible |

La unica comparacion documentada de forma explicita por el autor es contra el checkpoint hermano `easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k`, del que difiere en la inicializacion de expertos (copia del decodificador `main`) y en un calentamiento del router mas corto (1.000 pasos).

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que no es posible cuantificar la tasa de exito ni comparar objetivamente con alternativas.
- El checkpoint es de solo inferencia: se han eliminado el optimizador, el planificador y el estado del RNG, de modo que no permite reanudar el entrenamiento desde el punto guardado.
- Especifico de un unico dominio y morfologia: entrenado sobre RoboCasa MG 300 con un brazo Panda y pinza; no se documenta generalizacion a otras plataformas, camaras o configuraciones.
- `tau` (`conf_threshold`) es un parametro de evaluacion; el valor 0,5 almacenado es un valor por defecto, no una constante aprendida, por lo que los resultados pueden variar segun el umbral elegido.
- La regla de fusion es dependiente de la tarea: las dimensiones discretas `[6, 11]` (cierre de pinza y modo de control) toman el ultimo valor del bloque, algo que puede no ser valido en configuraciones de accion distintas.
- La confianza se fuerza a 0 en fotogramas de contacto, de modo que en tareas de contacto el modelo recurrira al grupo fino y perdera la ventaja de compresion.
- El cliente debe ejecutar las filas devueltas tal cual, sin re-mezclarlas; ignorar los metadatos `_flevel_level` y `_flevel_k` puede producir acciones incorrectas.
- Licencia `other`, heredada del modelo base: es imprescindible revisar las condiciones de `nvidia/GR00T-N1.5-3B` antes de cualquier uso comercial.
- No se especifican idiomas soportados, sesgos conocidos ni comportamiento frente a entradas fuera de distribucion; el riesgo de alucinacion en el sentido textual no aplica de forma directa, pero si el riesgo de acciones fisicas incorrectas en entornos reales.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-initmain-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Checkpoint hermano (misma configuracion, distinta inicializacion de expertos y calentamiento del router): https://huggingface.co/easyminnn/atq-labelgated-2.5x-vlm_contact-disc611-60k
- Dataset de etiquetas de velocidad: https://huggingface.co/datasets/prehj/robocasa-ratio-labels-contact
- Codigo de entrenamiento e inferencia: repositorio `rakybond007/GR00T-action-quantization`, rama `jimin-dev-label-gated`, commit `3476549`, mas el parche `--init-experts-from-main` sobre `scripts/gr00t_finetune.py` (URL exacta no disponible en la informacion proporcionada)
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo (unicamente paginas de ayuda de servicios de Google).
