# 5hadytru/so101_bench_MolmoAct2-SO101_WM_action_expert_only

# so101_bench_MolmoAct2-SO101_WM_action_expert_only

## Resumen

Checkpoint de investigación publicado por el usuario 5hadytru (Truman Hickok) que consiste en un ajuste fino parcial de MolmoAct2-SO100_101, el modelo vision-lenguaje-acción (VLA) de Ai2 para control robótico. La particularidad del experimento es que solo se entrena el *action expert*: los pesos del VLM, la torre de visión, el conector, los embeddings y la cabeza LM permanecen congelados. De los 5.447.439.088 parámetros totales (5,49B), únicamente 578M son entrenables.

El modelo se ha entrenado sobre el conjunto completo de simulación de SO-101 Bench ([`5hadytru/so101_bench_sim_WM`](https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM)), con 3.629 episodios y 1.996.120 fotogramas a 30 fps generados en Isaac Lab con aleatorización de dominio. El checkpoint publicado corresponde al paso 21.000 de una ejecución planificada a 32.000 pasos, seleccionado por ser el mejor en el conjunto de validación con una tasa de éxito de 5/39 episodios.

Su relevancia es doble: por un lado, documenta de forma transparente una ablación negativa (el backbone congelado degrada la política en bucle cerrado frente al ajuste fino completo) y, por otro, sirve como artefacto de referencia para estudiar el compromiso entre coste de entrenamiento y rendimiento en modelos VLA. El autor indica explícitamente que este checkpoint debe reportarse como "seleccionado sobre validación" y no como el resultado oficial del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: VLM (Molmo2-ER, backbone LM basado en Qwen3-4B segun el tokenizador citado) + torre de vision + conector + action expert de flow matching que condiciona sobre la cache key/value de cada capa del LLM |
| Parametros totales | 5.447.439.088 (5,49B) |
| Parametros activos | no disponible (no es MoE); 578M parametros entrenables en este experimento (solo el action expert) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (export oficial); no se publican variantes GGUF ni cuantizaciones de menor precision |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, checkpoint autocontenido de Hugging Face con `trust_remote_code` |
| Camaras de entrada | 4 flujos a 640x480: `overhead`, `wrist`, `overhead_init`, `wrist_init` (los `_init` se congelan durante el episodio como memoria de trabajo) |
| Formato de accion | pose articular absoluta, chunk de 30 pasos, salida continua |
| Tamano del repositorio | 10,9 GB |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo vision-lenguaje-acción construido sobre Molmo2-ER al que se le acopla un *action expert* de flow matching. Ese experto condiciona su generacion en los estados key/value de **todas** las capas del LLM mediante una conexion por capa, de modo que la representacion semantica del VLM guia directamente la sintesis de trayectorias. Las acciones son continuas (`action_format=continuous`), en chunks de 30 pasos y con normalizacion q01/q99 definida en `norm_stats.json` bajo la etiqueta `so101_bench_sim_wm`. El *joint frame* usa grados calibrados, con `shoulder_lift` negado y +90 grados sumados a `shoulder_lift` y `elbow_flex`, mapeado desde unidades de rango de LeRobot mediante `model = scale * lerobot + offset`.

El entrenamiento se ejecuto con el codigo oficial [allenai/molmoact2](https://github.com/allenai/molmoact2) en el commit `66b87e64` mas un parche que registra la mezcla `so101_bench_sim_wm`. Se congelaron VLM, torre de vision, conector, embeddings y cabeza LM (`--ft_vlm=false --ft_action_expert=true --ft_embedding=none --lora_enable=false`). Configuracion: batch global 128 (32 por GPU en 4 GPU A100-SXM4-80GB, sin acumulacion), checkpointing de activaciones, LR 7e-5 con warmup lineal de 200 pasos y decaimiento coseno hasta el 10% en 32.000 pasos, sin packing, longitud de secuencia dinamica, `--img_aug full` y K=2 pasos de flow por chunk. La eleccion de K=2 (frente a los 8 del articulo) es casi gratuita en coste: 33,6 muestras/s frente a 35,4 con K=1, mientras que K=8 cae a 19-21 muestras/s. El entrenamiento completo se detuvo alrededor del paso 31.300 (aproximadamente 33,7 horas) a peticion del usuario; el ultimo export fue el paso 30.000.

El conjunto de datos contiene 3.629 episodios y 1.996.120 fotogramas a 30 fps simulados en Isaac Lab con aleatorización de dominio, con camaras a 640x480. Este checkpoint acumula 2,69M muestras vistas (aproximadamente 1,35 epocas de fotogramas). Existe un antecedente descartado: un primer lanzamiento con una cache de tokenizador Qwen3-4B incompleta fragmentaba los tokens especiales de chat (906,8 frente a 893,8 tokens por ejemplo), por lo que el checkpoint publicado procede del relanzamiento corregido (W&B `dbpsvm0c`).

## Capacidades

- Generacion de acciones roboticas continuas a partir de instrucciones en lenguaje natural e imagenes de camara, en chunks de 30 pasos de control.
- Manipulacion de mesa con un brazo SO-100/SO-101 en simulacion (Isaac Lab), incluyendo agarre de objetos y control de pose articular absoluta.
- Percepcion multimodal con cuatro flujos de imagen simultaneos: vista cenital y de muneca, mas sus correspondientes fotogramas iniciales congelados como memoria de trabajo.
- Condicionamiento semantico-lenguaje: hereda del VLM base la interpretacion de instrucciones y la localizacion de objetos, aunque en esta ablacion el backbone esta congelado.
- Inferencia autocontenida con `trust_remote_code` en `transformers`, con export en bf16.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingues especificas en la informacion disponible.
- Capacidad especial: entrenamiento selectivo de modulos, con throughput aproximadamente 3x superior por paso que el ajuste fino completo (34 frente a 10,5 muestras/s en el mismo hardware).

## Casos de uso

- **Investigacion sobre congelacion de backbone en VLA**: este checkpoint es el artefacto experimental para estudiar cuanto se degrada la politica en bucle cerrado cuando solo se entrena el action expert. Comparar sus rollouts con los del ajuste completo permite cuantificar el coste de congelar el VLM (2/39 a 1,54M muestras frente a 5/39 a 1,28M del ajuste completo).
- **Punto de partida para ajustes posteriores**: dado que solo se adaptan 578M parametros, es un candidato razonable para reanudar entrenamiento con descongelacion progresiva o para *warm start* de experimentos sobre nuevos dominios de manipulacion con presupuesto limitado.
- **Baseline de eficiencia en pipelines de entrenamiento VLA**: con 34 muestras/s en 4x A100-SXM4-80GB y 3,77 s/paso, sirve para calibrar presupuestos de computo y comparar alternativas como LoRA r64 (9,4 muestras/s), que resulta mas lenta que el ajuste completo (10,5 muestras/s).
- **Auditoria de protocolos de seleccion de checkpoints**: la divergencia entre la perdida de entrenamiento (minimo 0,0089, mejor que el 0,0195 del ajuste completo) y el exito en bucle cerrado (que cae de 5/39 en el paso 21.000 a 1-2/39 despues) documenta por que no debe seleccionarse por loss.
- **Desarrollo y validacion de entornos de simulacion**: el checkpoint se puede desplegar en el digital twin de SO-101 Bench ([5hadytru/so101_bench](https://github.com/5hadytru/so101_bench)) para verificar que un pipeline de Isaac Lab, LeRobot v3.0 y el servidor de inferencia produce rollouts coherentes antes de invertir en entrenamientos mayores.
- **Analisis cualitativo de modos de fallo**: resulta util para caracterizar errores especificos del backbone congelado (apuntar al objeto correcto pero fallar el agarre o quedarse suspendido sin cerrar la pinza) y errores semanticos en objetos fuera de distribucion.
- **Docencia y divulgacion tecnica**: al ser un experimento pequeno y bien documentado, sirve para explicar en un curso o articulo como se disena una ablacion controlada de modulos en un VLA, incluyendo metricas de throughput, presupuesto de pasos y criterios de seleccion.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los del conjunto de validacion en simulacion de SO-101 Bench (`real_gr00t_val_v2`, 39 episodios: 13 por particion de objetos, con aproximadamente la mitad de episodios con fondos y colores de robot aleatorizados, horizonte de ejecucion 30).

| Paso | 3000 | 12000 | 15000 | **21000** | 24000 | 27000 | 30000 (export final) |
|---|---|---|---|---|---|---|---|
| Muestras vistas | 0,38M | 1,54M | 1,92M | **2,69M** | 3,07M | 3,46M | 3,84M |
| Exitos / 39 | 0 | 2 | 4 | **5** | 1 | 2 | 2 |

Los pasos 6000, 9000 y 18000 se interrumpieron antes de completar la evaluacion (0 exitos en 13, 21 y 6 episodios respectivamente).

Datos adicionales de entrenamiento y rendimiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento minima de la ejecucion | 0,0089 (frente al 0,0195 final del ajuste completo) |
| Throughput, action-expert-only K=1 | 35,4 muestras/s |
| Throughput, action-expert-only K=2 | 33,6 muestras/s |
| Throughput, action-expert-only K=4 | 26,7 muestras/s |
| Throughput, action-expert-only K=8 | 19-21 muestras/s |
| Throughput, LoRA r64 | 9,4 muestras/s |
| Throughput, ajuste fino completo | 10,5 muestras/s |
| Velocidad de entrenamiento | 3,77 s/paso, ~34 muestras/s en 4x A100-SXM4-80GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; se trata de un modelo de control roboticos y las metricas reportadas son de exito en tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en bf16 ocupan aproximadamente 11 GB (5,49B parametros x 2 bytes; el repositorio completo pesa 10,9 GB). A eso hay que sumar activaciones y la cache key/value, cuyo tamano depende de la longitud de secuencia y del numero de pasos de flow, dato no publicado. Estimacion orientativa, no confirmada por el autor: en torno a 12-14 GB en bf16 para lotes pequenos.
- **GPU recomendadas**: el entrenamiento se realizo en 4x A100-SXM4-80GB. Para inferencia no se documenta hardware de referencia; una GPU de 24 GB (RTX 3090, RTX 4090) deberia ser suficiente para bf16 a lote 1 segun el calculo de pesos.
- **¿Cabe en GPU de consumo?**: probablemente si, en tarjetas de 24 GB en bf16. No hay datos publicados de consumo real de VRAM durante la inferencia.
- **Cuantizacion**: no se publican variantes GGUF, AWQ, GPTQ ni int8/int4. Al no existir soporte confirmado de llama.cpp, la cuantizacion de menor precision no esta disponible en la actualidad.
- **Opciones de despliegue**: `transformers` con `trust_remote_code` (formato declarado por el autor), el repositorio oficial [allenai/molmoact2](https://github.com/allenai/molmoact2) para el codigo de servicio, y el ecosistema LeRobot para el formato de datos y control. Soporte en vLLM, TGI, Ollama o llama.cpp: no disponible.
- **Latencia y throughput estimados**: no disponible para inferencia. El unico dato de rendimiento publicado es de entrenamiento (34 muestras/s).

## Comparativa con modelos similares

| Modelo | Parametros | Modulos entrenados | Exito en SO-101 Bench (39 ep.) | Throughput de entrenamiento | Licencia |
|---|---|---|---|---|---|
| `5hadytru/so101_bench_MolmoAct2-SO101_WM_action_expert_only` | 5,49B (578M entrenables) | solo action expert | 5/39 en el paso 21000 (seleccionado por validacion); 2/39 en el paso 30000 | ~34 muestras/s | no disponible |
| `5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune` | 5,49B | ajuste fino completo | 5/39 en el paso 10000 (entrada oficial del benchmark) | 10,5 muestras/s | no disponible |
| `allenai/MolmoAct2-SO100_101` | 5,49B (no confirmado en la informacion disponible) | modelo base sin ajustar en SO-101 Bench | no disponible | no disponible | no disponible |

La comparacion directa relevante es contra el ajuste fino completo del mismo autor: a igualdad de muestras, el modelo con backbone congelado rinde peor (2/39 con 1,54M muestras frente a 5/39 con 1,28M), pero procesa aproximadamente 3x mas datos por unidad de tiempo. El propio autor cita la ablacion Tabla 13 del articulo de MolmoAct2, que califica el entrenamiento solo del action expert como "el modo de fallo mas claro".

## Limitaciones y advertencias

- **El backbone congelado limita la politica en bucle cerrado**. Es la limitacion principal y el motivo de ser del experimento. En los rollouts el modelo suele apuntar al objeto correcto pero falla el agarre o se queda suspendido encima sin cerrar la pinza; tambien comete errores semanticos con objetos fuera de distribucion. MolmoAct2 nunca fue entrenado con el VLM congelado y ademas el action expert condiciona sobre los estados key/value de todas las capas del LLM, lo que amplifica el problema.
- **Checkpoint seleccionado sobre el conjunto de validacion**. Las 5/39 exitos corresponden al mejor punto de validacion, no al export final. Bajo la regla *final-within-budget* de SO-101 Bench, el numero de protocolo de esta ejecucion es 2/39 (paso 30.000). Debe reportarse siempre como seleccionado por validacion y no como resultado oficial.
- **No es la entrada oficial del benchmark**: la entrada oficial de MolmoAct2 en SO-101 Bench es el ajuste completo `5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune`.
- **Riesgo de alucinacion y de deriva semantica**: al no actualizarse el VLM, las representaciones de objetos novedosos o fuera de la distribucion de simulado no se adaptan. No se han publicado mediciones de este efecto.
- **Sesgos conocidos**: no disponible. No se documenta analisis de sesgo del modelo ni del conjunto de datos, que es integramente simulado.
- **Limitaciones de contexto e idioma**: no disponible. No se publica la longitud de contexto ni la lista de idiomas soportados; el modelo se usa con instrucciones de tarea en el pipeline de robotica.
- **Restricciones de licencia**: la model card no declara licencia. La licencia del modelo base `allenai/MolmoAct2-SO100_101` tampoco se especifica en la informacion disponible. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base directamente en su repositorio.
- **Adecuacion para produccion**: muy limitada. El rendimiento en bucle cerrado (2-5 exitos de 39) y el hecho de que sea una ablacion seleccionada a posteriori lo desaconsejan para despliegue real. Su valor es como artefacto de investigacion.
- **Soporte de herramientas**: no hay variantes GGUF ni cuantizaciones, y no se confirma soporte en servidores de inferencia distintos de `transformers`. La dependencia de `custom_code` y `trust_remote_code` implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado.
- **Reproducibilidad**: el primer lanzamiento se descarto por una cache de tokenizador Qwen3-4B incompleta que fragmentaba los tokens especiales de chat. Cualquier reproduccion debe verificar ese punto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_action_expert_only
- Checkpoint de ajuste fino completo (entrada oficial del benchmark): https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM
- Repositorio oficial de MolmoAct2 (Ai2): https://github.com/allenai/molmoact2
- Repositorio de SO-101 Bench: https://github.com/5hadytru/so101_bench
- Articulo de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Perfil del autor en HuggingFace: https://huggingface.co/5hadytru
