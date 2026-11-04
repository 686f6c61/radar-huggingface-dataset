# dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-10000

## Resumen

Long-WAM-Nesting-Doll-Unclipped-30k-Step-10000 es un checkpoint de inferencia derivado por fine-tuning de Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica basado en la familia Wan (arquitectura de difusion de video) adaptado a la prediccion de acciones. Lo publica el usuario dddddsds31341 como parte de una ejecucion de entrenamiento independiente ("nesting-doll-unclipped-30k") destinada a una tarea concreta de manipulacion robotica: anidar munecas rusas de menor a mayor tamano.

El modelo no es un LLM de proposito general ni un modelo conversacional: es una politica visomotora que consume observaciones RGB de tres camaras (top_head, hand_left, hand_right) junto con instruccion textual y estado propioceptivo, y produce chunks de 32 pasos de acciones de 14 dimensiones (6 articulaciones + gripper por brazo). Se inicializa desde Long-WAM-YAM y se afina sobre el dataset yuyingyinya/nesting_doll (100 demostraciones, 164.571 frames).

Su relevancia es acotada y experimental: se trata de un checkpoint intermedio (paso 10.000 de un objetivo de 30.000) publicado sin resultados de exito ni evaluacion held-out, con licencia "other" heredada del modelo base. Resulta util como referencia reproducible de un pipeline de entrenamiento (DeepSpeed ZeRO-1, BF16, 4x A100) y como peso de inferencia para quien quiera reproducir o inspeccionar la politica, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Long-WAM-YAM; familia Wan, difusion para video/acciones; requiere VAE Wan2.2 y text encoder UMT5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de observaciones P48 y chunk de accion de 32 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en torch_dtype BF16 segun configuracion de entrenamiento) |
| Idiomas soportados | no disponible (instruccion textual en ingles en la model card) |
| Licencia | other (sujeta a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | model.pt (PyTorch), mas config.yaml, dataset_stats.json, code.zip y requirements-sip.txt |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se afina sobre el dataset yuyingyinya/nesting_doll (revision ae8a879c9a635d3c666aba58a4d9ac996225edb8), compuesto por 100 demostraciones y 164.571 frames. La politica opera con tres camaras RGB (top_head, hand_left, hand_right) procesadas a 384x320, un historial de observaciones P48 y un chunk de accion de 32 pasos. Las acciones se representan como objetivos absolutos de 14 dimensiones en las unidades originales del gripper: 6 articulaciones del brazo izquierdo mas gripper, seguidas de 6 articulaciones del brazo derecho mas gripper.

El entrenamiento se ejecuto en 4 GPU A100 con batch de 12 por GPU (batch global 48, acumulacion de gradientes 1), tasa de aprendizaje constante de 1e-05, optimizador AdamW con weight decay 0.01, semilla 42, precision BF16 y DeepSpeed ZeRO-1. El objetivo de la ejecucion era de 30.000 pasos de optimizador; este repositorio contiene el paso 10.000. La normalizacion es z-score especifica por tarea sin recorte (unclipped) de los valores normalizados, por lo que es imprescindible usar las estadisticas incluidas en dataset_stats.json junto con el codigo del repositorio. El checkpoint es solo de inferencia (contiene mot, proprio_encoder, step y torch_dtype) y no incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Prediccion de acciones roboticas en espacio articular absoluto de 14 dimensiones (dos brazos de 6 articulaciones mas gripper) en chunks de 32 pasos.
- Condicionamiento por instruccion textual en lenguaje natural (la tarea se describe como anidar munecas rusas de menor a mayor).
- Fusion multimodal de tres vistas RGB (top_head, hand_left, hand_right) con estado propioceptivo mediante un proprio_encoder dedicado.
- Historial temporal de observaciones P48 para condicionar la prediccion de acciones.
- Inferencia con pesos BF16 mediante el codigo SIP incluido (longwam.inference.load_run_config y load_model con expected_step=10000).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de proposito general: es una politica visomotora especializada.
- Capacidades multilingues: no disponible; la unica instruccion documentada esta en ingles.
- No se documentan capacidades de vision general, audio ni modo thinking.

## Casos de uso

- Reproduccion de la tarea de anidado de munecas rusas: el modelo genera trayectorias de 14 dimensiones para insertar cada muneca en la siguiente; es adecuado porque fue afinado especificamente sobre las 100 demostraciones de yuyingyinya/nesting_doll.
- Investigacion en imitacion robotica: sirve como punto de comparacion intermedio (paso 10.000 de 30.000) para estudiar la evolucion del aprendizaje en funcion del numero de pasos de optimizador.
- Auditoria de pipelines de entrenamiento: el repositorio incluye config.yaml, dataset_stats.json y el codigo SIP preservado, lo que permite reconstruir hiperparametros (lr 1e-05, AdamW, weight decay 0.01, seed 42, ZeRO-1) y verificar la reproducibilidad del setup.
- Evaluacion de normalizacion sin recorte: util para estudiar el efecto de la normalizacion z-score unclipped en la estabilidad de politicas de difusion sobre acciones articulares.
- Base para fine-tuning posterior en tareas de manipulacion bimanual: al partir de Long-WAM-YAM y aportar pesos de inferencia funcionales, puede servir de inicializacion para variantes con mas datos o distintas tareas.
- Integracion en banco de pruebas con simulador o robot real: el chunk de 32 pasos y las tres camaras estandar (top_head, hand_left, hand_right) encajan en setups de manipulacion bimanual existentes, siempre que se disponga del VAE Wan2.2 y del text encoder UMT5.
- Docencia y divulgacion: ejemplo concreto de publicacion de checkpoints intermedios con trazabilidad de configuracion, util para explicar buenas practicas (y sus carencias) en la publicacion de pesos de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en robot ni rendimiento en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, lo que da una cota inferior del orden de magnitud de los pesos, pero no se especifica el consumo en ejecucion.
- GPU de entrenamiento documentadas: 4x NVIDIA A100 (BF16, DeepSpeed ZeRO-1, batch 12 por GPU).
- GPU recomendadas para inferencia: no disponibles; por el origen del entrenamiento, A100 o equivalentes de datacenter son la opcion natural, pero no se confirma compatibilidad con GPUs de consumo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el codigo SIP incluido en code.zip (checkout Long-WAM, longwam.inference.load_run_config y load_model). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de robotica de este tipo.
- Dependencias externas obligatorias: VAE Wan2.2, text encoder UMT5 y tokenizer, que deben obtenerse por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-10000 | no disponible | no disponible (P48 / chunk 32) | sin benchmarks publicados | other (heredada del base) | HuggingFace, 0 descargas |
| Efficient-Large-Model/Long-WAM-YAM (modelo base) | no disponible | no disponible | no disponible en esta ficha | ver licencia del base | HuggingFace |
| Otras politicas de imitacion bimanual (p. ej. familia ACT, Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 10.000 de un objetivo de 30.000; no representa el modelo final de la ejecucion.
- Sin evaluacion: el autor no reclama tasa de exito ni rendimiento en held-out, por lo que no hay evidencia publicada de que la politica funcione en robot real.
- Especificidad de tarea: entrenado exclusivamente para anidar munecas rusas con el dataset yuyingyinya/nesting_doll (100 demostraciones); no generaliza a otras tareas sin fine-tuning.
- Dependencia critica de las estadisticas: la normalizacion z-score sin recorte exige usar dataset_stats.json del repositorio; mezclar estadisticas de otras ejecuciones invalida las predicciones.
- No reanudable: el checkpoint carece de estado de optimizador, scheduler y RNG, por lo que no permite continuar el entrenamiento de forma exacta.
- Dependencias externas no incluidas: VAE Wan2.2, text encoder UMT5 y tokenizer deben obtenerse aparte; el archivo code.zip conserva rutas SIP originales que hay que adaptar.
- Licencia "other": las condiciones concretas dependen de la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM; debe revisarse antes de cualquier uso comercial.
- Idiomas: no hay informacion sobre soporte multilingue; la unica instruccion documentada esta en ingles.
- Sesgos y alucinacion: no se documentan sesgos conocidos; en el contexto de una politica visomotora, el riesgo equivalente es la generacion de trayectorias no validas fisicamente, no evaluado en la model card.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-10000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM (seccion de licencia)
- Codigo SIP: incluido en code.zip del repositorio (long-wam-sip-nesting-30k-resumable-20261103-v41.zip)
