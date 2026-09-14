# khanhnd61/act-matched_so101-multi-task-clean_tape-into-box

## Resumen

Este repositorio contiene una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado con la librería LeRobot de HuggingFace para el brazo robótico SO-101 (`so_follower`) y resuelve tareas de manipulación guiada por lenguaje a partir de demostraciones teleoperadas. Es un checkpoint concreto, denominado `tape-into-box`, orientado a tareas de recogida y colocación.

La política consume un vector de estado articular de 6 dimensiones y dos cámaras RGB a 480x640 (`front` y `wrist`), y produce un vector de acción de 6 dimensiones. Cuenta con 76.438.278 parámetros y un tamaño de repositorio de 0,6 GB. Se distribuye bajo licencia Apache 2.0 y en formato safetensors, integrada en el ecosistema LeRobot 0.6.1.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento multi-tarea de bajo coste sobre hardware asequible (SO-101), útil para quien quiera evaluar el flujo completo de LeRobot (grabación de datos, entrenamiento de ACT y despliegue en robot real). No es un modelo de lenguaje ni un modelo fundacional de robótica; es una política específica entrenada sobre un dataset pequeño de 44 episodios y tres tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con componente CVAE y backbones visuales convolucionales |
| Parametros totales | 76.438.278 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de robotica; horizonte de prediccion por chunk no especificado en la model card) |
| Tipos de cuantizacion | no se declaran variantes; pesos en safetensors (fp32, repo de 0,6 GB) |
| Idiomas soportados | no disponible (las tareas se definen en ingles: "Put the tape into the box", etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Camaras | front, wrist (RGB, 3x480x640) |
| Dimension de observacion de estado | (6,) |
| Dimension de accion | (6,) |
| Frecuencia de control del dataset | 30 FPS |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación descrito en el paper referenciado (arXiv:2304.13705). La arquitectura es un transformer encoder-decoder con formulación CVAE: un codificador visual procesa las imágenes de las cámaras y un codificador de estado procesa las articulaciones, mientras que el decodificador genera un chunk de acciones futuras en lugar de una única acción. En inferencia, el método original fija la variable latente a cero y puede aplicar ensamblado temporal para suavizar la ejecución. Los detalles concretos de este checkpoint (número de acciones por chunk, backbone visual exacto, uso de ensamblado temporal) no se especifican en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `khanhnd61/so101-multi-task-clean`, compuesto por 44 episodios, 15.317 frames a 30 FPS y tres tareas ("Put the tape into the box", "Put the tape into the cup", "Put the cup into the box"). La configuración declarada es de 19.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con dispositivo CUDA. Se trata de aprendizaje supervisado por imitación a partir de demostraciones teleoperadas; no se declara uso de RLHF ni DPO.

## Capacidades

- Manipulación robótica de un brazo SO-101 (6 grados de libertad) guiada por una instrucción de tarea en lenguaje.
- Ejecución de tareas de pick-and-place sobre objetos concretos (cinta y vaso) en tres combinaciones de tarea.
- Percepción multimodal: combina estado articular con dos flujos de vídeo (cámara frontal y cámara de muñeca).
- Predicción de chunks de acción, lo que aporta consistencia temporal frente a políticas que predicen un único paso.
- Aprendizaje por imitación multi-tarea sobre un único checkpoint.
- No soporta tool calling, function calling, capacidades de agente ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión para descripción de escenas ni procesamiento de audio.
- Capacidades multilingües: no aplica.

## Casos de uso

- Manipulación de laboratorio de bajo coste: desplegar la política en un SO-101 real mediante `lerobot-rollout` para ejecutar de forma autónoma el pick-and-place de cinta y vaso, aprovechando que el método ACT está pensado para hardware asequible.
- Reproducción de experimentos de aprendizaje por imitación: usar el checkpoint como referencia para comparar el efecto del número de episodios, la composición del dataset o la resolución de cámara en la tasa de éxito.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio (otro objeto, otra ubicación) partiendo de una política ACT ya funcional.
- Benchmark interno de pipeline: validar la cadena completa de LeRobot (grabación, entrenamiento, despliegue y visualización del dataset) antes de invertir en tareas más complejas.
- Docencia y formación en robótica: ejemplo completo y pequeño (76 M de parámetros, 0,6 GB) para ilustrar ACT, CVAE y control a 30 FPS en clase o talleres.
- Evaluación de robustez a cambios de entorno: probar el mismo checkpoint frente a variaciones de iluminación, posición de objetos o distractores para medir su degradación (la model card no reporta estas pruebas).
- Prototipado de tareas multi-objeto: las tres tareas entrenadas permiten explorar la generalización entre combinaciones de un mismo conjunto de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito en robot real ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,3 GB en fp32 y ~0,15 GB en fp16 para 76,4 M de parámetros; el espacio real depende del overhead de los backbones visuales y de los buffers de inferencia.
- GPU recomendadas: cualquier GPU con CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 cubren de sobra el requisito. El entrenamiento declarado se realizó en CUDA.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en GPU integradas modestas; también es viable en CPU para pruebas lentas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); el entrenamiento se realiza con `lerobot-train`. No se declaran integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a una política de robótica).
- Latencia y throughput: no disponible de forma explícita. La política opera sobre datos grabados a 30 FPS (33 ms por frame), pero la model card no publica tasas de inferencia ni de éxito.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT, tape-into-box) | ACT (imitation learning) | 76,4 M | 3 tareas pick-and-place, SO-101, 30 FPS | apache-2.0 | HuggingFace |
| Otros checkpoints ACT en LeRobot | ACT (imitation learning) | depende del checkpoint (no disponible) | dependen del dataset | habitualmente apache-2.0 | HuggingFace |
| Diffusion Policy | Policy de difusion (imitation learning) | no disponible | manipulacion; metodo alternativo a ACT | no disponible | repositorios academicos |
| SmolVLA (HuggingFace) | VLA (vision-language-action) | no disponible | control guiado por lenguaje, mas generalista | no disponible | HuggingFace |

La comparación cuantitativa de rendimiento no es posible: ni este checkpoint ni los alternativos publican tasas de éxito comparables en la información disponible. La diferencia principal es de planteamiento: ACT es un método específico por tarea entrenado por imitación, mientras que los enfoques VLA buscan generalización guiada por lenguaje a costa de más parámetros.

## Limitaciones y advertencias

- Ausencia total de evaluación: 0 descargas, 0 likes y sin resultados de éxito en robot real; el rendimiento es desconocido.
- Dataset muy pequeño: 44 episodios y 15.317 frames para tres tareas, lo que limita la robustez y favorece el sobreajuste a las condiciones de grabación.
- Sesgo de dominio: la política está acoplada a la configuración física (SO-101), al montaje de cámaras (`front`, `wrist`), a la iluminación y a la disposición de objetos del dataset original.
- Sensibilidad a cambios de escena: variaciones de posición de objetos, distracciones, iluminación o un robot distinto del mismo tipo pueden degradar el comportamiento.
- Sobreajuste al objeto/instrucción: las tareas se limitan a cinta y vaso; fuera de ese vocabulario y esos objetos no hay garantía de funcionamiento.
- Idiomas y lenguaje: no es un modelo de lenguaje; solo interpreta la instrucción de tarea como condicionamiento y las tareas están definidas en inglés. La fila de idiomas figura como "no disponible".
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda mantener la atribución del método ACT y de LeRobot según la cita de la model card.
- Caveat de producción: no usar sin una validación previa en robot real con medidas de seguridad; los brazos robóticos pueden causar daños materiales o personales si la política falla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khanhnd61/act-matched_so101-multi-task-clean_tape-into-box
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Paper de ACT en HuggingFace: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guía de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=khanhnd61/so101-multi-task-clean
