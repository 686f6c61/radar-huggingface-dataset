# huzican0419/robotwin_piper_x_new_sft_step20000

## Resumen

El modelo `huzican0419/robotwin_piper_x_new_sft_step20000`, tambien etiquetado como Pi0.5 Piper, es un checkpoint de robotica del tipo vision-language-action (VLA) exportado a PyTorch en precision BF16. Se trata de una conversion del checkpoint `pi05_piper_new` de OpenPI en el paso global de entrenamiento 20.000 del experimento `robotwin_piper_x_new_sft`, partiendo de los pesos de `pi05_base`. El autor lo publica en Hugging Face con 3.616.757.520 parametros y un repositorio de 7,2 GB, sin descargas ni valoraciones en el momento de redactar esta ficha.

El modelo resuelve el problema del control de un brazo robotico Piper a partir de consignas textuales, estado discreto y tres camaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`). Esta especializado en 20 tareas de manipulacion del conjunto RoboTwin y predice acciones de 32 dimensiones con un horizonte de accion de 50 pasos, lo que lo hace util como politica de control por chunks en lugar de como modelo de lenguaje general.

Su relevancia actual es doble. Por un lado, forma parte del ecosistema OpenPI de modelos Pi0.5, lo que permite reutilizar la implementacion PyTorch oficial y los activos de normalizacion incluidos. Por otro, al ser un ajuste supervisado (SFT) sobre 12.000 episodios y 2.398.063 fotogramas, sirve como punto de partida reproducible para investigacion en aprendizaje por imitacion y para experimentos de sim-a-real en robotica de manipulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo Pi0.5 de la familia OpenPI, tipo vision-language-action; la model card no detalla la arquitectura interna) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (precision de exportacion); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo recibe consignas de tarea en texto, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16); incluye `config.json`, `assets/robotwin_piper_x_20_tasks_lerobot_v21_new/norm_stats.json` y `conversion_info.json` |
| Dimension de accion | 32 |
| Horizonte de accion | 50 |
| Entrada de estado | estado discreto, 14 dimensiones |
| Camaras | `cam_high`, `cam_left_wrist`, `cam_right_wrist` |
| Tamano del repositorio | 7,2 GB |
| Autor | huzican0419 |
| Pipeline declarado | robotics |
| Etiquetas | safetensors, robotics, openpi, pi05, pytorch, region:us |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar el modelo como Pi0.5 (`pi05_piper_new`) dentro del ecosistema OpenPI y de indicar que la exportacion se realizo con `examples/convert_jax_model_to_pytorch.py` en precision BF16. Se trata, por tanto, de una conversion de pesos desde JAX a PyTorch, no de un entrenamiento nuevo: los pesos se inicializaron desde `gs://openpi-assets/checkpoints/pi05_base/params` y se ajustaron de forma supervisada hasta el paso global 20.000 del experimento `robotwin_piper_x_new_sft`. El modelo consume estado discreto y acciones de 14 dimensiones (acciones delta de articulaciones con grippers absolutos, `adapt_to_pi=False`), con prompts de tarea y normalizacion por cuantiles.

El entrenamiento uso el conjunto `SidneyXie/robotwin_piper_x_20_tasks_lerobot_v21_new` (revision `9f7b059913c3af6bc59625507f06692f74af15c5`), con 12.000 episodios y 2.398.063 fotogramas, y un tamano de lote global de 64. La model card documenta una correccion de datos: cinco videos (episodios 371, 1176, 9878, 9970 y 10065) tenian un fotograma menos que sus metadatos, por lo que se anadio una copia del ultimo fotograma valido a cada video afectado, preservando los fotogramas decodificados, estados y acciones existentes. No se menciona el uso de RLHF, DPO ni tecnicas de RL, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de control para un brazo robotico Piper: prediccion de acciones de 32 dimensiones con horizonte de 50 pasos a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion supervisado (SFT) sobre 20 tareas de manipulacion del conjunto RoboTwin.
- Percepcion multimodal con tres vistas de camara simultaneas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`).
- Seguimiento de consignas de tarea en formato de prompt textual.
- Entrada de estado discreto de 14 dimensiones y salida de acciones delta de articulaciones con grippers absolutos.
- Inferencia en PyTorch con la implementacion OpenPI, usando los activos de normalizacion incluidos en el repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision general, audio): no disponibles mas alla de la percepcion visual integrada en el pipeline VLA.

## Casos de uso

- Control de un brazo Piper en tareas de manipulacion: el modelo actua como politica que traduce observaciones de camaras y estado articular en chunks de 50 acciones, adecuado para ejecutar las 20 tareas representadas en el dataset de entrenamiento.
- Base para ajuste fino con datos propios: al ser un checkpoint SFT sobre `pi05_base`, se puede continuar el entrenamiento con un dataset propio de otra celula robotica o de otras tareas, partiendo de una politica ya adaptada al dominio RoboTwin.
- Evaluacion en simulacion RoboTwin: el modelo esta alineado con el conjunto `robotwin_piper_x_20_tasks`, por lo que sirve para medir tasas de exito en ese entorno antes de probar el despliegue fisico.
- Investigacion en modelos vision-language-action: la combinacion de tres camaras, estado discreto y prompts de tarea permite estudiar la fusion de modalidades y el efecto del contexto visual en la politica aprendida.
- Experimentos de sim-a-real: un checkpoint entrenado sobre miles de episodios y fotogramas de simulacion puede transferirse al brazo fisico para comparar la degradacion de rendimiento entre entornos.
- Integracion en un stack de robotica en PyTorch: la exportacion BF16 evita depender del backend JAX y permite servir el modelo desde el mismo runtime PyTorch que el resto del sistema de control.
- Reproducibilidad de conversiones JAX a PyTorch: los archivos `config.json`, `conversion_info.json` y `norm_stats.json` permiten auditar la conversion de claves y formas de tensor en un pipeline de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo documenta comprobaciones de conversion: verificacion de claves de entrada y de tensores exportados, formas, tipo BF16 y valores finitos, ademas de la copia exacta de los activos de normalizacion desde el checkpoint original. La paridad numerica del forward-pass entre JAX y PyTorch no fue probada, y no se reportan tasas de exito por tarea, MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,2 GB solo para los pesos (3.616.757.520 parametros x 2 bytes); con activaciones, tres codificadores de imagen y buffers de KV, se recomienda un minimo practico de 16-24 GB. Estimacion propia, no confirmada por el autor.
- No se documentan versiones cuantizadas, por lo que no se puede garantizar el funcionamiento en GPUs con menos de 16 GB.
- GPUs recomendadas: A100 (40/80 GB), H100 y tarjetas de 24 GB como RTX 3090 o RTX 4090 para los pesos en BF16 con margen para activaciones.
- Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090); en GPUs de 12-16 GB el encaje no esta garantizado sin cuantizacion adicional no publicada.
- Opciones de despliegue: implementacion PyTorch de OpenPI con la configuracion `pi05_piper_new` y los activos de normalizacion incluidos. No es compatible con servidores de texto como vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje con tokens de salida textual.
- El repositorio no incluye estado del optimizador, por lo que no sirve para reanudar el entrenamiento JAX original.
- Latencia y throughput estimados: no disponibles. El horizonte de accion de 50 pasos implica control por chunks, pero no se publican frecuencia de control ni tiempo de inferencia.

## Comparativa con modelos similares

No se proporcionan datos de modelos comparables en la informacion disponible. La unica referencia directa es el checkpoint de origen citado en la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `robotwin_piper_x_new_sft_step20000` | 3.616.757.520 | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas, 7,2 GB |
| `pi05_base` (OpenPI, origen) | no disponible | no disponible | no disponible | no disponible | `gs://openpi-assets/checkpoints/pi05_base/params` |
| Otros modelos VLA (OpenVLA, RDT-1B, GR00T N1, pi0) | no disponible | no disponible | no disponible | no disponible | no se aportan datos en la informacion disponible |

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede confirmar si se permite el uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- No se han publicado tasas de exito ni evaluaciones de tareas, de modo que el rendimiento real del checkpoint es desconocido.
- La paridad numerica entre JAX y PyTorch no fue verificada, lo que introduce incertidumbre sobre posibles divergencias respecto al checkpoint original.
- Al estar ajustado sobre 20 tareas concretas de RoboTwin con un brazo Piper, es probable que generalice mal a otras morfologias, camaras o entornos no representados en el dataset. Este extremo no se cuantifica en la informacion disponible.
- Las entradas de estado y accion son de 14 dimensiones y las acciones se expresan en delta con grippers absolutos; usar otra convencion de control sin reajustar el modelo puede invalidar las predicciones.
- Depende de tres camaras concretas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`); cambios en la disposicion o el numero de camaras pueden degradar el comportamiento.
- No se documentan idiomas soportados para las consignas de tarea, ni sesgos conocidos, ni tasas de alucinacion.
- El repositorio no contiene estado del optimizador: no es posible reanudar el entrenamiento JAX a partir de esta exportacion.
- La fecha de creacion registrada (2026-09-14) y la ausencia total de descargas y valoraciones indican que es un artefacto reciente y sin validacion por parte de la comunidad.
- La correccion manual de cinco videos en el dataset de entrenamiento puede introducir artefactos menores en los episodios afectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huzican0419/robotwin_piper_x_new_sft_step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/SidneyXie/robotwin_piper_x_20_tasks_lerobot_v21_new (revision `9f7b059913c3af6bc59625507f06692f74af15c5`)
- Repositorio OpenPI (implementacion PyTorch e instrucciones de conversion): https://github.com/Physical-Intelligence/openpi
- Checkpoint base de OpenPI: `gs://openpi-assets/checkpoints/pi05_base/params`
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo; las consultas devolvieron unicamente articulos de prensa y seguridad ciudadana sin relacion con el modelo.
