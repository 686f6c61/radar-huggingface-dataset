# seongjin0813/act_piper_datatest_01_dinov2

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política de imitación para robótica: una implementación de Action Chunking with Transformers (ACT) entrenada con la librería LeRobot de Hugging Face. El autor es el usuario seongjin0813 y el modelo está diseñado para controlar un robot seguidor del tipo `piper_follower` equipado con una cámara frontal, prediciendo comandos motores de 7 dimensiones a partir de observaciones de estado y visión.

La política se entrenó sobre el dataset `seongjin0813/piper_datatest_01`, formado por 50 episodios y 37.134 fotogramas grabados a 30 FPS para una única tarea etiquetada como "1". El modelo tiene 62.475.591 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. El sufijo "dinov2" del identificador sugiere el uso de un backbone visual DINOv2, aunque la model card no lo detalla explícitamente.

Su relevancia es acotada y de nicho: sirve como ejemplo reproducible del flujo de trabajo de LeRobot para clonación de comportamiento en hardware de bajo coste, y como punto de partida para quien quiera reproducir o afinar una política ACT sobre el mismo robot. No se han publicado resultados de evaluación en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitacion con backbone visual (sufijo dinov2) |
| Parametros totales | 62.475.591 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; consume ventanas de observaciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y favorece la estabilidad temporal durante la ejecución en el robot. El modelo consume como entradas un vector de estado de forma `(7,)` y una imagen frontal de forma `(3, 240, 424)`, y produce como salida una acción de forma `(7,)`. La variante aquí publicada incorpora aparentemente un codificador visual DINOv2 (según el nombre del repositorio), aunque la model card no especifica el detalle del backbone ni la configuración exacta del transformer.

El entrenamiento se realizó con LeRobot versión 0.6.2 durante 100.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. Los datos provienen del dataset `seongjin0813/piper_datatest_01`, que contiene 50 episodios teleoperados, 37.134 fotogramas a 30 FPS y una sola tarea ("1"). No se documenta el uso de RLHF, DPO ni técnicas de refinamiento por preferencias, algo esperable en un pipeline de imitación supervisada.

## Capacidades

- Generacion de acciones motoras: predice comandos de 7 grados de libertad (posicion del efector final y/o pinza) a partir del estado y de la imagen frontal.
- Percepcion visual: procesa imagenes RGB a 240x424 pixeles mediante un backbone visual tipo DINOv2 para condicionar la accion.
- Ejecucion de una tarea concreta de manipulacion: entrenada exclusivamente para la tarea etiquetada como "1".
- Control en tiempo real: disenada para ejecucion a la frecuencia de captura del dataset (30 FPS).
- Aprendizaje por imitacion: reproduce comportamientos demostrados por teleoperacion, sin planificacion simbolica.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de la tarea entrenada: desplegar la politica sobre un `piper_follower` con camara frontal para repetir la tarea "1" tal y como se demostro en el dataset, usando `lerobot-rollout`.
- Punto de partida para fine-tuning: servir como checkpoint inicial para entrenar variantes (por ejemplo, las versiones `v3_dinov2_60k` o `100k_finetune_v1` del mismo autor) con mas datos o tareas adicionales.
- Validacion de pipeline LeRobot: usar el repositorio como ejemplo funcional para comprobar la instalacion, el registro de politicas y la integracion con `lerobot-train` y `lerobot-rollout`.
- Investigacion en clonacion de comportamiento: analizar el efecto de un backbone DINOv2 frente a codificadores visuales convencionales en tareas de manipulacion de un solo brazo.
- Docencia y talleres de robotica: ilustrar el flujo completo de un proyecto de imitation learning, desde la grabacion de datos hasta el despliegue en hardware real.
- Recoleccion de datos comparativos: emplear la politica como linea base propia para medir nuevas tecnicas de chunking de acciones sobre el mismo robot y dataset.
- Benchmark interno de latencia: evaluar el coste de inferencia de una politica de 62,5 M de parametros en distintas GPU para estimar viabilidad en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica, y no incluye tasas de exito en robot real ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en FP32 y unos 125 MB en FP16/BF16 solo para los pesos; sumando activaciones y el backbone visual, el consumo realista se situa en torno a 0,5-2 GB (estimacion a partir del recuento de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; son suficientes tarjetas consumer como GTX 1650, RTX 3060 o superiores. Para entrenamiento, se recomienda una GPU con CUDA y al menos 8-12 GB de VRAM.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo moderna e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-rollout`), PyTorch con CUDA o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. La politica esta pensada para operar a 30 FPS, pero el autor no publica mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / robot | Contexto o ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seongjin0813/act_piper_datatest_01_dinov2 | 62.475.591 | ACT, `piper_follower`, tarea "1" | 50 episodios / 37.134 frames | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| seongjin0813/act_piper_datatest_v3_dinov2_60k | no disponible | ACT, `piper_follower` (variante v3, 60k pasos) | no disponible | no disponible | Hugging Face |
| seongjin0813/act_piper_datatest_v3_100k_finetune_v1 | no disponible (~207 MB repo) | ACT, `piper_follower` (variante v3, 100k pasos, fine-tuning) | no disponible | no disponible | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible | ACT, manipulacion bimanual de bajo coste | no disponible | no disponible | Paper arXiv:2304.13705 y repo de referencia |

Los tres primeros modelos pertenecen al mismo autor y comparten familia (ACT + DINOv2 sobre robots Piper), por lo que constituyen las alternativas mas directamente comparables; no se dispone de cifras de rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni pruebas en robot real publicadas, por lo que su rendimiento efectivo es desconocido.
- Entrenada para una unica tarea ("1") sobre un unico robot (`piper_follower`) y una unica camara frontal; no generaliza a otras tareas, robots ni configuraciones de camara.
- Sensibilidad al dominio: al depender de 50 episodios y 37.134 fotogramas, es probable que sea fragil ante cambios de iluminacion, posiciones de objetos, fondos o distracciones no presentes en los datos (observacion general del metodo ACT, no verificada en este caso).
- Riesgo de sobreajuste al entorno de recogida de datos: el dataset es pequeno y de una sola tarea, lo que limita la robustez.
- Desajuste de entradas: las imagenes se capturan a 240x424, mientras que los comandos de ejemplo de rollout usan camaras a 640x480 y 30 FPS; hay que garantizar que los nombres y formatos de las observaciones coincidan con los del entrenamiento.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Confusion de categoria: este repositorio no es un LLM y no debe evaluarse con benchmarks de lenguaje; cualquier comparacion con modelos de texto carece de sentido.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-10-13, dato a verificar por posibles incoherencias en los metadatos de Hugging Face.
- Sin cuantizaciones ni formatos alternativos publicados, lo que limita su uso fuera de LeRobot/PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seongjin0813/act_piper_datatest_01_dinov2
- Dataset de entrenamiento: https://huggingface.co/datasets/seongjin0813/piper_datatest_01
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seongjin0813/piper_datatest_01
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante relacionada (v3, 60k): https://huggingface.co/seongjin0813/act_piper_datatest_v3_dinov2_60k
- Variante relacionada (v3, 100k, fine-tuning): https://huggingface.co/seongjin0813/act_piper_datatest_v3_100k_finetune_v1
- Repositorio DINOv2 (referencia del backbone visual): https://github.com/facebookresearch/dinov2
