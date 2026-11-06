# m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3

## Resumen

`kairos_rmbenchpp_press_button_noop_16v3_p2p3` es un checkpoint de investigación publicado por el usuario m1b en Hugging Face, orientado al entrenamiento de políticas robóticas sobre el benchmark RMBench++ (RoboDojo v1.0.0), concretamente en la tarea `press-button-noop`. No se trata de un modelo de lenguaje generalista, sino de un artefacto de aprendizaje por imitación para control robótico manipulatorio, con observaciones multimodales (tres cámaras) y acciones continuas de 14 dimensiones.

El modelo parte de un warm start sobre los pesos de `rmbenchpp_v021_press-button-noop_sgres_1x8_20k_20260924_r1` (step 20.000) del autor zhwu, y se afina en dos fases: 2.000 pasos de entrenamiento conjunto y 1.000 pasos adicionales solo sobre los memory tokens. La innovación declarada son los "memory tokens" de la variante 16v3, con brazo adaptativo y un límite de `max_prefix_frames=128`, pensados para mejorar la retención de contexto temporal en secuencias de episodios largos.

Su relevancia es acotada: es un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card pública más allá de metadatos de entrenamiento, y sin pipeline, licencia ni idiomas declarados. Resulta útil como referencia para quien reproduzca el pipeline de RMBench++ o investigue mecanismos de memoria en políticas visuomotoras, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política visuomotora con memory tokens, variante 16v3; no se especifica el backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana de tokens; `max_prefix_frames=128` (máximo de fotogramas de prefijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`step_002000.pt`, `step_001000.pt`); tamaño del repo 27,6 GB |

## Arquitectura y entrenamiento

La información disponible no detalla el backbone de la política. Lo que sí se documenta es el esquema de entrenamiento en tres carpetas: `p1/` contiene los pesos base heredados de zhwu (`step_020000.pt`, sha256 `a12ec3dd...cabddc9`); `p2/` se inicializa desde `p1/` y entrena 2.000 pasos conjuntos con ZeRO-2 sobre 1 nodo de 8 GPU A800, con learning rate 1e-4, produciendo `step_002000.pt`; y `p3/` parte de `p2/step_002000.pt` y realiza 1.000 pasos "memory-only" con learning rate 1e-4, dando `step_001000.pt`. El job `pt-chv1k6te` finalizó correctamente el 2026-10-14.

Los datos de entrenamiento corresponden al dataset `rmbench-plus-plus-robodojo-press-button-noop`, con 50 episodios y tres cámaras (`cam_head`, `cam_left_wrist`, `cam_right_wrist`), con acciones absolutas de 14 dimensiones en el esquema `robodojo_x5_absolute`. La rama de desarrollo es `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_press_button` en el commit `c0dae323...`. No se documentan composición del dataset más allá del número de episodios, ni uso de RLHF/DPO, ni detalles de la innovación de memory tokens aparte de su nombre y del límite de prefijo.

## Capacidades

- Ejecución de la tarea robótica `press-button-noop` en el entorno RMBench++ (RoboDojo v1.0.0).
- Política visuomotora que consume tres flujos de cámara (`cam_head`, `cam_left_wrist`, `cam_right_wrist`) y emite acciones continuas de 14 dimensiones en formato `robodojo_x5_absolute`.
- Memoria temporal mediante memory tokens (variante 16v3) con brazo adaptativo, orientada a secuencias de hasta 128 fotogramas de prefijo.
- Entrenamiento por imitación sobre 50 episodios demostrados; no se declara aprendizaje por refuerzo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documenta visión general (VQA, captioning) ni audio; la visión es exclusivamente la de las cámaras del robot.

## Casos de uso

- Reproducción de experimentos de RMBench++: cargar `p3/step_001000.pt` junto con el dataset de 50 episodios para replicar la curva de entrenamiento p1 → p2 → p3 y validar la contribución de los memory tokens.
- Investigación en memoria temporal para políticas visuomotoras: comparar `p2/step_002000.pt` (entrenamiento conjunto) con `p3/step_001000.pt` (solo memoria) para aislar el efecto del ajuste específico de los memory tokens en tareas de pulsado con estado latente.
- Ablación de `max_prefix_frames`: el valor fijado en 128 permite estudiar el compromiso entre coste computacional y retención de contexto en episodios de manipulación.
- Punto de partida para fine-tuning en tareas cercanas de RoboDojo: el warm start desde `step_020000.pt` y el pipeline ZeRO-2 en 8×A800 sirven de plantilla para adaptar la política a otras tareas del mismo benchmark.
- Evaluación de robustez ante acciones no-op: la tarea `press-button-noop` incluye comportamiento nulo, útil para medir falsos positivos de la política en escenarios donde no debe actuar.
- Docencia y divulgación sobre robótica con aprendizaje por imitación: el repositorio de 27,6 GB y los checkpoints intermedios permiten ilustrar el ciclo completo de entrenamiento distribuido con datos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de RMBench++ ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del backbone no documentado y del número de parámetros, que tampoco se indica.
- Entrenamiento documentado: 1 nodo de 8 GPU A800 con ZeRO-2, tanto para los 2.000 pasos de `p2/` como para los 1.000 pasos de `p3/`.
- GPU recomendadas: A800 (según la configuración de entrenamiento); no se documentan requisitos de inferencia ni compatibilidad con GPU de consumo.
- Cabeza en GPU de consumo: no disponible; el tamaño del repo (27,6 GB) sugiere checkpoints de varios GB, pero sin desglose de parámetros no puede confirmarse.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una política robótica con pesos `.pt`, el despliegue requeriría el código de inferencia del proyecto original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3` | no disponible | `max_prefix_frames=128` | no disponible | no disponible | Hugging Face, 0 descargas |
| `zhwu/rmbenchpp_v021_press-button-noop_sgres_1x8_20k_20260924_r1` (base) | no disponible | no disponible | no disponible | no disponible | Referenciado como warm start; disponibilidad pública no confirmada |
| Otros checkpoints RMBench++ / RoboDojo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin model card descriptiva: no hay licencia, pipeline, idiomas ni parámetros declarados, lo que impide evaluar su idoneidad para uso comercial.
- Especialización extrema: entrenado solo para `press-button-noop` con 50 episodios; no generaliza a otras tareas sin fine-tuning.
- Dataset muy reducido (50 episodios), lo que aumenta el riesgo de sobreajuste y de baja robustez ante variaciones de iluminación, posiciones de cámara o del objeto.
- Sin métricas publicadas de éxito ni de robustez; no puede afirmarse su rendimiento real en el benchmark.
- Los pesos están en formato `.pt` dependiente del código del proyecto; no hay conversión a safetensors ni GGUF documentada.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de acciones espurias: la política puede emitir comandos incorrectos en estados no vistos.
- Sin información sobre sesgos demográficos o de otro tipo; al operar sobre imágenes de robot, los sesgos relevantes serían de dominio visual y no están analizados.
- Uso comercial: desaconsejado sin aclaración previa de la licencia con el autor.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_rmbenchpp_press_button_noop_16v3_p2p3
- Dataset referenciado (ruta interna del autor, no URL pública): `/data/NTU_slab/zhwu/wam/Little-WAM/data/robodojo-v1.0.0/rmbench-plus-plus-robodojo-press-button-noop`
- Modelo base referenciado: `zhwu/rmbenchpp_v021_press-button-noop_sgres_1x8_20k_20260924_r1` (sin URL pública confirmada)
- Rama de desarrollo: `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_press_button` en el commit `c0dae323bb316c7b5bacabd484bc75bba19f7262` (repositorio no indicado)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
