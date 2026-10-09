# 5hadytru/so101_bench_ImageWAM-FLUX.2-4B_full_fine_tune

## Resumen

ImageWAM (SO-101 Bench) es un world-action model basado en edición de imágenes: un backbone de edición FLUX.2 [klein] base 4B predice el lienzo de cámara futuro, mientras que un DiT de acciones con arquitectura mixture-of-transformers (MoT) predice el chunk de acciones. Este checkpoint concreto es un fine-tune completo (todos los parámetros) de `yuyangalin/ImageWAM-FLUX.2-4B-InternData-A1-EE` sobre el dataset de teleoperación simulado SO-101 Bench (`5hadytru/so101_bench_sim`), compuesto por 3.629 episodios y 1.996.120 fotogramas con cámaras cenital y de muñeca.

El modelo resuelve el problema de control robótico de un brazo SO-101 de bajo coste a partir de instrucciones de lenguaje natural, unificando predicción visual del futuro y predicción de acciones en un mismo backbone de difusión. Es relevante porque traslada la familia ImageWAM presentada en CoRL 2026 (con experimentos en LIBERO, LIBERO-plus y RoboTwin) a un banco de pruebas de hardware pequeño y alta capacidad diagnóstica, el SO-101 Bench, y porque el pipeline completo (adaptador, receta, configs y servidor) está publicado.

Se trata de un modelo de 4B parámetros en el backbone (variante klein 4B de FLUX.2), con licencia MIT y pesos distribuidos como `model.pt`. El checkpoint oficial corresponde al paso 30.000 de una ejecución de 33.000 pasos y obtiene 15/39 episodios resueltos (38,5 %) en el conjunto de validación en bucle cerrado sobre Isaac Sim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (MoT): backbone de edicion de imagenes FLUX.2 [klein] base 4B + DiT de acciones + encoder de propiocepcion |
| Parametros totales | 4B en el backbone FLUX.2 [klein] base; total preciso del sistema completo no disponible |
| Parametros activos | no aplica (MoT, no es un MoE con enrutado disperso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, `model.pt`) |
| Idiomas soportados | no disponible (las instrucciones de tarea se codifican con Qwen3-4B) |
| Licencia | MIT (el backbone deriva de FLUX.2 [klein] base 4B, Apache-2.0) |
| Formato de pesos | `model.pt` (checkpoint PyTorch) + `config.yaml` + `dataset_stats.json`; el autoencoder (`ae.safetensors`) y Qwen3-4B se cargan desde los repos upstream |

## Arquitectura y entrenamiento

ImageWAM es un world-action model construido sobre un modelo fundacional de edición de imágenes. El componente principal es un backbone FLUX.2 [klein] base 4B que, dado el estado visual actual (cámaras cenital y de muñeca), predice el lienzo de cámara futuro; en paralelo, un DiT de acciones con arquitectura mixture-of-transformers (MoT) predice el chunk de acciones. La propiocepción y las acciones se representan sobre una disposición end-effector de 16 dimensiones procedente del checkpoint de preentrenamiento: las 6 articulaciones del SO-101 se rellenan de modo que el brazo ocupa las posiciones 0-4 y la pinza la posición 7. Las acciones son objetivos articulares absolutos en unidades LeRobot.

El entrenamiento de este checkpoint es un fine-tune completo (full fine-tune) sobre el dataset `5hadytru/so101_bench_sim` (3.629 episodios, 1.996.120 fotogramas, cámaras cenital y de muñeca). La ejecución consta de 33.000 pasos sobre 4x A100-80GB con batch global de 128 (8 por GPU x 4 GPU x 4 de acumulación), AdamW con learning rate 2,5e-5, weight decay 0,01, 5 % de warmup y decaimiento coseno hasta 0, en bf16, lo que equivale a unas 2,1 épocas. No se menciona uso de RLHF o DPO. En inferencia, la instrucción de tarea se codifica con Qwen3-4B, igual que durante el entrenamiento, y el modelo genera chunks de 32 acciones a 30 Hz, de los cuales el cliente ejecuta 16 antes de replanificar.

## Capacidades

- Generación de acciones robóticas: predice chunks de 32 acciones a 30 Hz para un brazo SO-101 de 6 articulaciones (objetivos articulares absolutos en unidades LeRobot).
- Predicción visual del futuro (world model): el backbone de edición genera el lienzo de cámara futuro, lo que da al modelo capacidad de anticipación visual del entorno.
- Control condicionado por lenguaje: la instrucción de tarea se codifica con un encoder de texto Qwen3-4B y condiciona la política.
- Entrada multimodal de imagen: consume una única imagen de 288x256 que combina vista cenital (192x256 arriba) y vista de muñeca (96x128 abajo a la izquierda); la esquina inferior derecha queda en negro.
- Control en bucle cerrado: integrado en un servidor (`scripts/imagewam_server.py`) que gestiona el ciclo observación-planificación-ejecución.
- Ejecución de tareas de manipulación: en validación se evalúa en tareas de tipo named-bin, bin de cuatro objetos, next-to, between y move, con objetos vistos y no vistos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; el modelo sí opera en un bucle de control replanificado cada 16 acciones.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo "thinking" o visión generalista no disponibles; la visión se limita a la predicción del lienzo de cámara del propio modelo.

## Casos de uso

- Manipulación robótica con SO-101 en simulación: reproducción de las tareas del SO-101 Bench (clasificación en bins, colocación next-to/between, movimiento de objetos) usando el servidor incluido y ejecutando 16 de cada 32 acciones planificadas; es el escenario para el que se ha entrenado y validado.
- Investigación en world-action models: servir de punto de partida para estudiar la combinación de predicción visual del futuro y predicción de acciones en un único backbone de difusión, con configuración y estadísticas de normalización publicadas.
- Benchmarking reproducible de políticas: comparar este checkpoint con otras entradas del SO-101 Bench (por ejemplo la variante MolmoAct2-SO101_WM) sobre el conjunto `real_gr00t_val_v2` de 39 episodios en bucle cerrado en Isaac Sim.
- Fine-tuning posterior sobre datos propios de teleoperación: al publicarse `config.yaml` y `dataset_stats.json`, es viable reajustar el modelo a nuevas tareas de manipulación manteniendo el esquema de 16 dimensiones.
- Transferencia a hardware físico: el SO-101 es un brazo de bajo coste y el estudio original se ejecutó sobre un brazo físico, por lo que el checkpoint sirve como base para prototipos de laboratorio y docencia en robótica.
- Generación de datos sintéticos de manipulación: la rama de edición de imagen puede aprovecharse para producir lienzos futuros plausibles en pipelines de aumento de datos, sujeto a validación empírica.
- Integración en Isaac Sim: evaluación en bucle cerrado a través del adaptador y la receta incluidos en `scripts/ImageWAM_fine_tuning/`.

## Benchmarks y rendimiento

Conjunto de validación SO-101 Bench (`real_gr00t_val_v2`, 39 episodios en bucle cerrado en Isaac Sim, tareas named-bin, bin de cuatro objetos, next-to, between y move, con objetos vistos y no vistos). Éxitos sobre 39:

| Paso | 3k | 6k | 9k | 12k | 15k | 18k | 21k | 24k | 27k | **30k** | 33k |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Éxitos /39 | 1 | 4 | 6 | 9 | 11 | 16 | 15 | 7 | 15 | **15** | 14 |

El paso 30.000 (checkpoint oficial) obtiene 15/39, un 38,5 %. El autor indica que fue seleccionado dentro de la meseta de 15-16/39 de los pasos 18k-30k y que esas puntuaciones están dentro del ruido de un conjunto de 39 episodios. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: 4x A100-80GB con batch global de 128 y precisión bf16.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 9,0 GB y contiene únicamente `model.pt` (backbone MoT, DiT de acciones y encoder de propiocepción); a ello hay que sumar en tiempo de ejecución el autoencoder FLUX.2 (`ae.safetensors`) y el encoder de texto Qwen3-4B, que se cargan aparte. La VRAM total dependerá del backend y de si se cuantizan estos componentes.
- GPU recomendadas: no disponible. El único dato aportado por el autor es el uso de A100-80GB para el entrenamiento.
- Compatibilidad con GPU de consumo: no disponible; no se documenta el consumo de VRAM en inferencia, por lo que no puede confirmarse que quepa en una RTX 4090 u otras GPU de consumo sin cuantización adicional.
- Opciones de despliegue: el autor publica un servidor específico (`scripts/imagewam_server.py`) y adaptadores en el repositorio SO-101 Bench; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables directamente a un modelo de difusión con DiT de acciones.
- Latencia y throughput: no disponibles. Se conoce el régimen de control, chunks de 32 acciones a 30 Hz con ejecución de 16 antes de replanificar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en SO-101 Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `5hadytru/so101_bench_ImageWAM-FLUX.2-4B_full_fine_tune` (este) | 4B (backbone FLUX.2 [klein] base) | no disponible | 15/39 (38,5 %) en `real_gr00t_val_v2` | MIT | HuggingFace, 0 descargas |
| `5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune` | no disponible | no disponible | no disponible (paso 10.000, checkpoint final y entrada oficial de MolmoAct2) | no disponible | HuggingFace |
| `5hadytru/so101_bench_flux-3-action-so101` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `yuyangalin/ImageWAM-FLUX.2-4B-InternData-A1-EE` (modelo base) | 4B | no disponible | no disponible (preentrenado sobre InternData-A1-EE) | MIT (backbone Apache-2.0) | HuggingFace |

La familia ImageWAM también ofrece una variante de 9B basada en FLUX.2 [klein] 9B, que según el repositorio oficial da el mejor rendimiento de la serie, aunque no se dispone de cifras concretas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento modesto: 15/39 episodios resueltos (38,5 %) en el conjunto de validación; el propio autor señala que la diferencia entre 15 y 16 éxitos está dentro del ruido estadístico de 39 episodios, por lo que las comparaciones finas entre checkpoints no son concluyentes.
- Especificidad de hardware y tarea: el modelo está ajustado al brazo SO-101 con 6 articulaciones y a la disposición end-effector de 16 dimensiones del preentrenamiento; usarlo con otra morfología requiere adaptación.
- Entrada visual fija: una única imagen de 288x256 con una disposición muy concreta (cenital 192x256 arriba, muñeca 96x128 abajo a la izquierda, esquina inferior derecha en negro). Cualquier desviación de ese formato puede degradar el rendimiento.
- Dependencia de componentes externos: necesita `ae.safetensors` y el encoder Qwen3-4B cargados desde sus repos upstream, además del código de ImageWAM en el commit `5d4a341`.
- Sesgos conocidos: no disponibles. No hay evaluación de sesgos ni análisis de subgrupos en la información proporcionada.
- Riesgo de alucinación: no evaluado de forma explícita; en un world model de predicción visual, una predicción de lienzo incorrecta puede propagarse al chunk de acciones y producir fallos de manipulación.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; las instrucciones se codifican con Qwen3-4B, pero no se especifica qué lenguas ni qué longitud máxima de instrucción funcionan de forma fiable.
- Licencia: MIT para este checkpoint, con el backbone derivado de FLUX.2 [klein] base 4B bajo Apache-2.0. Es necesario verificar el cumplimiento de la licencia del modelo de edición original y de los componentes cargados aparte (autoencoder y Qwen3-4B) antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado en octubre de 2026; no hay evidencia de uso en producción ni de validación física de este checkpoint concreto (la validación es en Isaac Sim).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_ImageWAM-FLUX.2-4B_full_fine_tune
- Modelo base: https://huggingface.co/yuyangalin/ImageWAM-FLUX.2-4B-InternData-A1-EE
- Repositorio SO-101 Bench: https://github.com/5hadytru/so101_bench
- Repositorio ImageWAM (CoRL 2026): https://github.com/yuyangalin/ImageWAM
- Dataset simulado SO-101 Bench: https://huggingface.co/datasets/5hadytru/so101_bench_sim
- Entrada MolmoAct2 en SO-101 Bench: https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune
- Entrada FLUX-3-action en SO-101 Bench: https://huggingface.co/5hadytru/so101_bench_flux-3-action-so101
