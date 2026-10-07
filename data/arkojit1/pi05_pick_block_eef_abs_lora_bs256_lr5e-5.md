# arkojit1/pi05_pick_block_eef_abs_lora_bs256_lr5e-5

## Resumen
Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado sobre `lerobot/pi05_base`, el modelo vision-lenguaje-accion (VLA) de referencia de la libreria LeRobot. El adaptador resuelve una tarea robotica muy concreta: coger un bloque ("pick block") con un brazo Franka, expresando las acciones como posicion absoluta del efector final (x, y, z del siguiente fotograma) mas un objetivo binario de pinza. Lo publica el usuario `arkojit1` como adaptador ligero de aproximadamente 1,29 millones de parametros entrenables y unos 5 MB de peso.

La relevancia de este tipo de artefacto es metodologica: demuestra que es posible adaptar un VLA de gran tamano a una tarea especifica con un coste de entrenamiento muy bajo y sin sobreajuste, frente al ajuste completo del "action expert", que en el mismo regimen sobreajustaba de forma marcada. Se entrena con LeRobot 0.6.1 sobre el dataset `Ameyapores/pick_block_eef_position_abs` (Franka, 35 episodios, 9.181 fotogramas a 25 fps, una unica tarea y dos camaras de 224x224).

El adaptador se distribuye en formato PEFT y se carga dinamicamente sobre los pesos base congelados de `lerobot/pi05_base`. Requiere `peft>=0.18` y se evalua mediante la perdida de flow matching en episodios reservados, no mediante tasa de exito de tarea, dato que no se proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje-accion (VLA) `lerobot/pi05_base` con cabeza de accion entrenada por flow matching |
| Parametros totales | No disponible para el modelo base; el adaptador tiene aproximadamente 1,29 M de parametros entrenables (~5 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en robotica se usa `chunk_size` = 50 y `n_action_steps` = 50 |
| Tipos de cuantizacion | No disponible para el adaptador; el entrenamiento se realizo en bf16 |
| Idiomas soportados | No disponible (modelo orientado a robotica, no a texto multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA), mas `config.json` de politica y pre/post-procesadores |

## Arquitectura y entrenamiento
El adaptador se aplica sobre `lerobot/pi05_base`, un VLA que combina percepcion visual y salida de acciones motoras. El entrenamiento usa flow matching como objetivo (la metrica reportada es la "flow-matching loss"), y la adaptacion se limita a un subconjunto de modulos del "action expert" mediante LoRA. En concreto, se adaptan `q_proj` y `v_proj` de la atencion del action expert, ademas de `action_in_proj` y `action_out_proj`, con rango `r = 16` y `lora_alpha = 8`, sin modulos totalmente entrenados. Los pesos base permanecen congelados. Se senala que la expresion regular por defecto no coincide con `time_mlp_in/out` de pi0.5, por lo que esos modulos no se adaptan.

El regimen de entrenamiento fue: lote de 256 (8 GPU x 32), optimizador AdamW, LR pico 5e-5 con decaimiento coseno hasta 2,5e-6 durante 10.000 pasos y 333 pasos de warmup, en bf16 y con gradient checkpointing y aumento de imagen. El dataset contiene una sola tarea con acciones de 4 dimensiones (posicion absoluta x, y, z del efector final del siguiente fotograma mas objetivo binario de pinza), normalizadas por cuantiles q01/q99 tanto en estado como en accion. El adaptador publicado es el checkpoint final de 10.000 pasos, equivalentes a unas 315 epocas.

## Capacidades
- Manipulacion robotica de una unica tarea: coger un bloque ("pick block") con un brazo Franka.
- Percepcion visual a partir de dos camaras de 224x224.
- Prediccion de acciones de efector final en posicion absoluta (x, y, z) mas control binario de pinza.
- Generacion de secuencias de accion mediante chunking (`chunk_size` = 50, `n_action_steps` = 50).
- Normalizacion por cuantiles q01/q99 para estado y accion.
- Adaptacion eficiente en parametros que evita el sobreajuste observado en el ajuste completo del action expert.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue.

## Casos de uso
- Investigacion en adaptacion eficiente de VLA: sirve como referencia para comparar LoRA frente al ajuste completo del action expert, ya que el autor reporta que el ajuste completo sobreajustaba (de 0.0613 a 0.156) mientras el LoRA se mantenia estable.
- Replicacion de experimentos en robotica: permite reproducir un pipeline completo de LeRobot 0.6.1 con un dataset publico de Franka y una tarea de pick, usando `lerobot-eval`.
- Plantilla de fine-tuning para nuevas tareas: la configuracion (r=16, alpha=8, objetivos q_proj/v_proj, action_in_proj, action_out_proj, LR 5e-5, lote 256) puede reutilizarse como punto de partida para otras tareas de manipulacion.
- Evaluacion de generalizacion: al ser un adaptador pequeno y sin sobreajuste, es util para estudiar como se comportan los VLA en tareas con pocos datos (35 episodios, 9.181 fotogramas).
- Docencia y formacion: ejemplo didactico de LoRA aplicado a robotica y de normalizacion por cuantiles en acciones de efector final.
- Despliegue de bajo coste de almacenamiento: al ocupar unos 5 MB, el adaptador se puede versionar, distribuir y cargar junto al base sin duplicar pesos.
- Benchmark interno de infraestructura: util para medir latencia de inferencia de un VLA con dos camaras de 224x224 y chunking de 50 acciones en distintos hardwares.

## Benchmarks y rendimiento

Evaluacion mediante perdida de flow matching sobre 4 episodios reservados (31-34). No es una tasa de exito de tarea.

| Metrica | Valor |
|---|---|
| Perdida de flow matching en el paso 10.000 (checkpoint publicado) | 0.0634 |
| Mejor perdida de la ejecucion | 0.0616 en el paso 5.400 |
| Rango de perdida de evaluacion entre el paso 2.000 y el 10.000 | 0.062-0.071 |
| Comparacion: ajuste completo del action expert | 0.0613 en el paso 400, sobreajuste a 0.156 en el paso 10.000 |

No se han publicado resultados de benchmarks estandar de robotica (por ejemplo, tasa de exito de tarea) en la informacion disponible. Tampoco se aportan metricas tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware
- El adaptador en si es minimo (~5 MB); el consumo de recursos lo determina el modelo base `lerobot/pi05_base`, cuyas dimensiones no se especifican en la informacion proporcionada.
- Entrenamiento: se realizo con 8 GPU y lote efectivo de 256 (8 x 32), en bf16 y con gradient checkpointing; se requiere un nodo multi-GPU de gama alta para reproducir ese regimen.
- Inferencia: se realiza mediante `lerobot-eval --policy.path=...`, que carga `lerobot/pi05_base` y aplica el adaptador; los requisitos exactos de VRAM no estan disponibles.
- VRAM estimada para inferencia: no disponible (depende del base y de la precision). Como referencia orientativa, un VLA con dos camaras de 224x224 y chunking de 50 suele requerir una GPU con memoria amplia, pero no se aportan cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: LeRobot 0.6.1 con `peft>=0.18`; el adaptador se carga leyendo `use_peft: true` de `config.json`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Tarea | Parametros del adaptador | Licencia |
|---|---|---|---|---|---|
| `arkojit1/pi05_pick_block_eef_abs_lora_bs256_lr5e-5` | `lerobot/pi05_base` | Adaptador LoRA | Pick block, efector final absoluto | ~1,29 M entrenables | No disponible |
| `ajh2002/pi05-lora-fr3-dual-camera-pick-place-v1-1p5epoch` | pi05 | Adaptador LoRA | Pick and place, doble camara (FR3) | No disponible | No disponible |
| `lerobot/pi05_base` | - | Modelo base VLA | Tareas generales de robotica | - | No disponible |

La comparacion se limita a la categoria de adaptadores LoRA sobre pi05 y al propio modelo base, ya que no se dispone de datos de rendimiento homogeneos (mismas metricas, mismo entorno) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias
- Especializacion extrema: el adaptador esta entrenado para una unica tarea (coger un bloque) y un unico embodiment (Franka), por lo que no cabe esperar generalizacion a otras tareas o robots.
- Dataset muy reducido: 35 episodios y 9.181 fotogramas a 25 fps, con una sola tarea y dos camaras de 224x224.
- Metrica de evaluacion limitada: la perdida de flow matching no es una tasa de exito de tarea; no se reporta rendimiento real de manipulacion.
- Sin licencia declarada: la ausencia de licencia impide confirmar condiciones de uso comercial; tratarlo como no apto para produccion hasta aclararlo.
- Idiomas: no aplica en el sentido habitual; no se documentan capacidades de lenguaje.
- Estado y accion en posicion absoluta con normalizacion por cuantiles q01/q99: cambios en la cinematica, en el entorno o en la distribucion de estados pueden degradar el comportamiento.
- Configuracion incompleta de LoRA: los modulos `time_mlp_in/out` no se adaptan porque la expresion regular por defecto no los captura, lo que puede limitar el ajuste fino.
- Dependencia estricta del entorno: requiere LeRobot 0.6.1 y `peft>=0.18`, ademas de los pre/post-procesadores incluidos; un desajuste de versiones puede romper la carga.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en robotica el riesgo equivalente es producir trayectorias invalidas fuera de la distribucion de entrenamiento.
- Cero descargas y cero "likes": el artefacto no tiene validacion externa por parte de la comunidad, por lo que conviene tratar los resultados como preliminares.

## Enlaces
- Repositorio del adaptador: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_lora_bs256_lr5e-5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/pick_block_eef_position_abs
- Codigo de la politica pi05 en LeRobot: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
- Adaptador comparable (pick and place, doble camara): https://huggingface.co/ajh2002/pi05-lora-fr3-dual-camera-pick-place-v1-1p5epoch
- Documentacion sobre LoRA: https://en.wikipedia.org/wiki/LoRA_(machine_learning)
