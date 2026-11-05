# dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-5000

## Resumen

Long-WAM Sorting Dolls 30k Step 5000 es un checkpoint de evaluacion derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica de la familia Long-WAM orientado a la generacion de acciones (policy learning) a partir de observaciones visuales y propioceptivas. Lo publica el usuario dddddsds31341 como un ajuste fino (finetune) sobre una tarea concreta de manipulacion: colocar cinco munecas rusas en fila de menor a mayor, de izquierda a derecha. El checkpoint corresponde al paso de optimizador 5.000 de un entrenamiento planificado de 30.000 pasos, por lo que se trata de un estado intermedio y no de un modelo final.

El interes del modelo es acotado: no es un modelo de lenguaje generalista, sino un artefacto de investigacion para una tarea de robotica especifica, con instrucciones de inferencia muy concretas (normalizacion z-score por tarea, chunk de acciones de 32 pasos, historial P48, camaras top_head, hand_left y hand_right). Su relevancia radica en servir como ejemplo reproducible de ajuste fino de un modelo de robotica sobre un dataset LeRobot, y en documentar el proceso de evaluacion con estadisticas y configuracion exactas del run.

El repositorio ocupa 12,0 GB e incluye `model.pt`, `config.yaml`, `dataset_stats.json`, `requirements-sip.txt` y un `code.zip` con el codigo de entrenamiento e inferencia. El autor indica explicitamente que no reclama ninguna tasa de exito ni rendimiento sobre datos retenidos, lo que limita su uso como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de robotica Long-WAM; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de observaciones P48 y chunk de acciones de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, presumiblemente BF16 segun el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (remite a la licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica de la familia Long-WAM. La informacion disponible no describe la arquitectura interna (transformer, difusion de acciones, etc.), solo el pipeline de inferencia: el modelo consume observaciones de tres camaras (top_head, hand_left, hand_right) procesadas a 384 x 320, un historial P48 y produce chunks de 32 acciones. Las acciones son objetivos absolutos de 14 dimensiones (6 articulaciones + pinza por cada brazo), con normalizacion z-score especifica de la tarea y sin recorte de valores normalizados. El checkpoint incluye `mot`, `proprio_encoder`, `step` y `torch_dtype`, pero no estado de optimizador, scheduler ni RNG.

El entrenamiento se realizo sobre el dataset dddddsds31341/sorting-dolls-lerobot (revision ffca92aece12b85daac426b1b0474065e1ecf165), con 100 demostraciones y 168.126 frames. Se usaron cuatro GPU A100, batch de 12 por GPU, acumulacion 1 (batch global 48), LR constante de 1e-5, AdamW con weight decay 0,01, semilla 42 y BF16 con ZeRO-1. La instruccion de tarea es "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right". El checkpoint corresponde al paso 5.000 de 30.000 planificados. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de acciones de robot para una tarea de manipulacion concreta: ordenar cinco munecas rusas de menor a mayor.
- Procesamiento multimodal de observaciones: tres camaras (top_head, hand_left, hand_right) a 384 x 320.
- Uso de historial de observaciones (P48) para condicionar la prediccion de acciones.
- Prediccion de chunks de 32 acciones con objetivos absolutos de 14 dimensiones (articulaciones y pinza de ambos brazos).
- Inferencia condicionada por instruccion de tarea en lenguaje natural.
- Integracion con el ecosistema Long-WAM mediante `longwam.inference.load_run_config` y `load_model`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en aprendizaje por imitacion: servir como checkpoint intermedio para estudiar la evolucion del entrenamiento en tareas de manipulacion con pocas demostraciones (100 episodios).
- Reproduccion de experimentos: el repositorio incluye `config.yaml`, `dataset_stats.json` y `code.zip`, lo que permite replicar la evaluacion con las mismas estadisticas y configuracion del run.
- Evaluacion de politicas de robotica en simulacion o laboratorio: usar el modelo para generar trayectorias de 32 acciones y medir el comportamiento en la tarea de ordenar munecas.
- Punto de partida para ajuste fino adicional: al ser un checkpoint de 5.000 pasos, puede servir como inicializacion para experimentos propios sobre el mismo dataset u otros similares de LeRobot.
- Docencia y divulgacion: ejemplo concreto de pipeline de entrenamiento distribuido (4x A100, ZeRO-1, BF16) y de empaquetado de artefactos de evaluacion en robotica.
- Comparacion de checkpoints: permite contrastar el estado a 5.000 pasos con otros pasos del mismo run para analizar curvas de aprendizaje.
- No se recomienda su uso en produccion: el autor no reclama tasa de exito ni rendimiento sobre datos retenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna tasa de exito ni rendimiento sobre datos retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB, lo que da una referencia del tamano de los pesos, pero no se detalla el consumo en inferencia.
- GPU de entrenamiento documentadas: 4x A100 con BF16 y ZeRO-1.
- GPU recomendadas para inferencia: no disponible; por el tamano del checkpoint, es plausible que requiera GPU de gama alta, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica usar el codigo incluido en `code.zip` (checkout de Long-WAM) con `longwam.inference.load_run_config` y `load_model`, apuntando a `model.pt` y `expected_step=5000`. Se requieren por separado los assets Wan2.2 VAE, UMT5 text encoder y tokenizer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 5.000 de 30.000 planificados, por lo que no representa el estado final del entrenamiento.
- Sin metricas de rendimiento: el autor no reclama tasa de exito ni rendimiento sobre datos retenidos; no debe citarse como referencia de calidad.
- Estado incompleto para reanudar entrenamiento: `model.pt` no contiene estado de optimizador, scheduler ni RNG.
- Dependencias externas obligatorias: se requieren por separado los assets Wan2.2 VAE, UMT5 text encoder y tokenizer, ademas de adaptar rutas de modelo, estadisticas y cache SIP a la maquina de evaluacion.
- Normalizacion especifica del run: debe usarse `dataset_stats.json` de este repositorio; aplicar otras estadisticas invalidaria la inferencia.
- Tarea muy acotada: el modelo esta ajustado para una instruccion concreta (ordenar cinco munecas rusas); no es un modelo generalista.
- Licencia "other": las condiciones de uso comercial dependen de la licencia del modelo base, que debe consultarse en https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM.
- Idiomas no documentados: no se especifican idiomas soportados ni evaluacion multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en robotica, el riesgo principal es la ejecucion de acciones inseguras fuera de la distribucion de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-5000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
