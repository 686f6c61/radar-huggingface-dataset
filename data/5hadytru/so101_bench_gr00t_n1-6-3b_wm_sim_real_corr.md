# 5hadytru/so101_bench_GR00T_N1.6-3B_WM_sim_real_corr

## Resumen
El modelo `so101_bench_GR00T_N1.6-3B_WM_sim_real_corr` es un ajuste fino de NVIDIA GR00T N1.6-3B, un modelo visión-lenguaje-acción (VLA) orientado a robótica manipulativa, publicado por el usuario 5hadytru. El fine-tuning se ha realizado exclusivamente sobre datos simulados del brazo SO-101, generados en Isaac Lab, para medir la correspondencia sim-to-real dentro del benchmark SO-101 Bench. No es el checkpoint principal del proyecto, sino un artefacto experimental del checkpoint 20000 de un entrenamiento que apuntaba a 31000 pasos.

Resuelve un problema metodológico: comprobar si una política entrenada solo en simulación reproduce el mismo patrón de dificultad por tarea y por partición de generalización que una política entrenada y evaluada en hardware real. El modelo tiene 3.286.608.832 parámetros, un repositorio de 6,6 GB en safetensors y una arquitectura compuesta por un backbone VLM Eagle-Block2A-2B-v2 congelado más una cabeza de acción de difusión parcialmente entrenada.

Su relevancia es acotada y específica: sirve como referencia reproducible para estudiar la fidelidad de gemelos digitales en manipulación robótica de bajo coste, no como política de producción. La model card advierte explícitamente de que la política principal del benchmark es otro checkpoint, `5hadytru/so101_bench_GR00T_N1.7-3B`, entrenado con el dataset completo y con domain randomization.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone VLM Eagle-Block2A-2B-v2 con vision tower congelado + cabeza de acción (proyector, modelo de difusión, VLLN) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural, idioma del dataset no especificado) |
| Licencia | other (enlazada a la licencia de nvidia/GR00T-N1.6-3B) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.6-3B |
| Libreria | gr00t |
| Pipeline | robotics |
| Dataset de entrenamiento | 5hadytru/so101_bench_sim_6 (2.228 episodios, 1.248.868 frames a 30 fps) |
| Checkpoint | paso 20.000 (de una programación coseno objetivo de 31.000) |
| Modalidad (embodiment) | NEW_EMBODIMENT |
| Horizonte de acción | 16 pasos |
| Estado y acción | 6-D: 5 articulaciones del brazo + pinza, en unidades calibradas de LeRobot |

## Arquitectura y entrenamiento
El modelo parte de GR00T N1.6-3B, que combina un backbone de visión-lenguaje Eagle-Block2A-2B-v2 con una cabeza de acción generativa. En este ajuste fino se entrenaron únicamente la cabeza de acción (proyector, modelo de difusión y VLLN) y las 4 capas superiores del LLM; el resto del backbone VLM y el vision tower permanecieron congelados. El entrenamiento usó `launch_finetune.py` del repositorio NVIDIA/Isaac-GR00T (N1.6), con batch global de 768 sobre 8 GPUs, acumulación de gradiente 1, learning rate máximo de 1e-4 con programación coseno y 5 % de warmup, weight decay 1e-5, precisión bf16 con AdamW de PyTorch y paralelismo DeepSpeed ZeRO-2.

Los datos provienen de un gemelo digital del montaje real: 2.228 episodios de teleoperación simulada en Isaac Lab, convertidos a LeRobot v2.1, con tres cámaras de 640×480 (`overhead`, `front` montada en la pinza y `overhead_init`, un frame overhead fijado al inicio del episodio como memoria de trabajo). Destaca la ausencia total de domain randomization: iluminación, colocación de cámara, fondo y color del robot son fijos y coinciden con la celda real. El preprocesado de imagen usa borde corto de 256 y recorte del 0,95, con color jitter como única aumentación. La acción se representa de forma relativa al estado para el brazo y absoluta para la pinza, con horizonte de 16 pasos.

## Capacidades
- Generación de acciones motoras para manipulación robótica de 6 grados de libertad (5 articulaciones más pinza) condicionadas a instrucción en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente vistas overhead, de muñeca y un frame overhead inicial persistente.
- Condicionamiento por instrucción de tarea (`annotation.human.task_description`).
- Predicción de chunks de acción de 16 pasos por consulta.
- Generalización evaluada en tres particiones: objetos vistos, objetos no vistos de clases vistas y clases no vistas.
- Tareas cubiertas en la evaluación: 1-object bin, 4-object bin, next-to, between y directional move.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni modalidad de audio.

## Casos de uso
- Estudio de correspondencia sim-to-real: comparar el patrón de dificultad de una política entrenada solo en simulación con una entrenada en real, usando la misma batería de 906 episodios emparejados por tarea, conjunto de objetos y orden.
- Validación de gemelos digitales sin domain randomization: comprobar hasta qué punto un montaje fijo replicado con precisión (luz, cámara, fondo, color) basta para transferir comportamiento, antes de invertir en aleatorización.
- Investigación en manipulación de bajo coste con SO-101: servir de línea base reproducible para nuevos métodos sobre el mismo brazo y benchmark.
- Análisis de particiones de generalización: medir la caída de éxito al pasar de objetos vistos a clases no vistas con una política simulada, como proxy barato de la curva real.
- Ablaciones de configuración de entrenamiento: al estar entrenado con un subconjunto de 2.228 episodios y sin aleatorización, sirve de contraste frente al checkpoint principal entrenado con el dataset completo.
- Depuración de pipelines de evaluación LeRobot/GR00T: el cliente `scripts/groot_eval.py` con `--rename_map '{"wrist":"front"}'` y `--use_overhead_init` permite verificar la integración de observaciones multi-cámara y el mantenimiento del frame de memoria de trabajo.

## Benchmarks y rendimiento
Resultados publicados en la model card para la comparación sim-to-real (906 episodios emparejados, horizonte de acción 16):

| Métrica | Política solo-sim (este modelo, en sim) | Política solo-real (en robot real) |
|---|---|---|
| Éxito global | 409/906 (45,1 %) | 552/906 (60,9 %) |
| Diferencia global | −16 puntos porcentuales (IC 95 %: −19,9 a −11,8) | referencia |
| Correspondencia por condición (15 celdas tarea × partición) | Pearson r = 0,86 (IC 95 %: 0,71 a 0,91); Spearman ρ = 0,74 | referencia |
| Acuerdo a nivel de episodio | 66,3 % (MCC 0,36) | referencia |

No se han publicado resultados de benchmarks estándar de VLA (por ejemplo MMLU, HumanEval o GSM8K) en la información disponible, ni resultados de éxito desglosados por tarea y partición.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 6,6 GB solo para pesos, más activaciones y buffers de las tres cámaras a 640×480; en la práctica se recomienda reservar 10-12 GB.
- El repositorio ocupa 6,6 GB en safetensors, lo que condiciona el espacio en disco y el tiempo de carga.
- GPU recomendadas: A100 o H100 para servir con holgura y baja latencia; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo de gama alta con 16 GB o más; no se documentan requisitos para GPUs de 8 GB.
- Despliegue mediante el servidor de inferencia de GR00T N1.6: `python gr00t/eval/run_gr00t_server.py --model-path ... --embodiment-tag NEW_EMBODIMENT --device cuda --port 5555`.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.
- El entrenamiento documentado usó 8 GPUs con batch global de 768 y DeepSpeed ZeRO-2; no se especifica el modelo de GPU empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_bench_GR00T_N1.6-3B_WM_sim_real_corr (este) | 3.286.608.832 | no disponible | VLA, fine-tuning solo-sim sin domain randomization, checkpoint 20k | other | Hugging Face, 19 descargas |
| 5hadytru/so101_bench_GR00T_N1.7-3B | no disponible | no disponible | VLA, política principal del benchmark, dataset completo con domain randomization | no disponible | Hugging Face |
| nvidia/GR00T-N1.6-3B | 3B (aproximado) | no disponible | VLA base generalista de NVIDIA | other | Hugging Face |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias
- No es la política principal del benchmark: la model card remite a `5hadytru/so101_bench_GR00T_N1.7-3B` para uso representativo del proyecto.
- Entrenado sin domain randomization, con iluminación, fondo, color de robot y colocación de cámara fijos; la robustez ante cambios de entorno no está caracterizada y previsiblemente es baja.
- El éxito global es 16 puntos porcentuales inferior al de la política entrenada en real (45,1 % frente a 60,9 %), por lo que no debe interpretarse como equivalente en rendimiento absoluto.
- El acuerdo a nivel de episodio es solo del 66,3 % (MCC 0,36), y las poses iniciales de objeto difieren entre dominios; esta métrica es secundaria según el propio autor.
- La comparación mide pares política-dominio distintos (una política por dominio), no la fidelidad del simulador con los mismos pesos.
- El checkpoint es el paso 20.000 de una programación que apuntaba a 31.000; el modelo no está entrenado hasta el final previsto.
- Requiere que `overhead_init` sea el frame overhead asentado al inicio del episodio en cada consulta; un uso incorrecto de esta entrada degrada la inferencia.
- Licencia "other" heredada de nvidia/GR00T-N1.6-3B: es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; el modelo no genera texto libre como producto principal.
- Solo 19 descargas y 0 likes en el momento de la consulta: validación externa muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/5hadytru/so101_bench_GR00T_N1.6-3B_WM_sim_real_corr
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Política principal del benchmark: https://huggingface.co/5hadytru/so101_bench_GR00T_N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/5hadytru/so101_bench_sim_6
- Dataset completo con domain randomization: https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM
- Paper: https://huggingface.co/papers/2610.36420
- Página del proyecto: https://so101-bench.github.io
- Código: https://github.com/5hadytru/so101_bench
- Repositorio de entrenamiento e inferencia: https://github.com/NVIDIA/Isaac-GR00T
- Licencia del modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
