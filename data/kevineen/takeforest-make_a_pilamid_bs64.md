# kevineen/takeforest-make_a_pilamid_bs64

## Resumen

takeforest-make_a_pilamid_bs64 es una política robótica entrenada con el algoritmo ACT (Action Chunking Transformer) dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una imagen de cámara y del estado articular de un brazo SO-101, genera secuencias de acciones de 6 dimensiones para completar la tarea de apilar piezas y formar una pirámide. Lo publica el usuario kevineen como artefacto derivado del evento takeforest, con licencia Apache-2.0 y 51.576.454 parámetros (~51,6 M) almacenados en safetensors.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un entrenamiento ACT completo (20.000 pasos, batch 32, AMP, VAE activado) sobre un conjunto de datos concreto, takeforest/teamB_20261017_153217. Para desarrolladores de robótica de imitación resulta útil como punto de partida para replicar el pipeline, comparar hiperparámetros o desplegar una política de manipulación de bajo coste en hardware de consumo. No aporta capacidades de razonamiento, lenguaje ni tool calling.

El modelo tiene un único checkpoint (`checkpoints/020000`, marcado como last), una sola cámara de entrada y una única tarea, por lo que debe tratarse como una política de propósito muy restringido y no como un modelo generalista. El repositorio ocupa 0,2 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): backbone visual ResNet18 + transformer encoder-decoder + cabeza VAE |
| Parametros totales | 51.576.454 (~51,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. Configuración: `n_obs_steps=1`, `chunk_size=10`, `n_action_steps=10` |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (política visomotora sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato nativo de LeRobot) |

## Arquitectura y entrenamiento

ACT combina un extractor visual convolucional con un transformer secuencial que predice un "chunk" de acciones futuras en lugar de una sola acción por paso, lo que reduce el error de composición y suaviza la ejecución. En esta configuración el backbone es ResNet18 preentrenado con ImageNet1K_V1 (estadísticas de ImageNet activadas), y el transformer tiene `dim_model=512`, 8 cabezas de atención, `dim_ff=3200`, 4 capas de encoder y 1 capa de decoder, con dropout 0,1. Se añade un VAE auxiliar durante el entrenamiento (`latent_dim=32`, 4 capas de encoder, `kl_weight=10`) para modelar la variabilidad de las demostraciones humanas.

Los datos provienen del dataset takeforest/teamB_20261017_153217: una cámara frontal (`observation.images.front`, 640×480), estado y acción de 6 dimensiones propios del brazo SO-101, y la tarea "make a pyramid" (ensamblar una pirámide). El entrenamiento se ejecutó el 2026-10-17 con 20.000 pasos, batch 32, semilla 1000, AdamW (`lr=1e-5`, `lr_backbone=1e-5`, `weight_decay=1e-4`, `betas=(0.9, 0.999)`, `grad_clip=10`), AMP activado, `num_workers=8` y backend de vídeo torchcodec. Con esos valores se procesaron aproximadamente 640.000 muestras (20.000 × 32, cálculo derivado de la configuración). La normalización es MEAN_STD para las tres modalidades (visual, estado y acción). No se documenta el número de episodios del dataset, la composición demográfica de las demostraciones ni si hubo filtrado de trayectorias fallidas.

Detalle a vigilar: el nombre del repositorio indica `bs64`, pero la configuración de entrenamiento de la model card especifica `batch_size=32`, de modo que el identificador no refleja el batch realmente usado.

## Capacidades

- Control visomotor de manipulación: genera comandos de 6 dimensiones para un brazo SO-101 a partir de una imagen frontal de 640×480 y del estado articular actual.
- Predicción por chunks: emite bloques de 10 acciones consecutivas (`chunk_size=10`, `n_action_steps=10`), lo que permite ejecutar de forma más fluida que un control paso a paso.
- Ejecución de una tarea concreta: ensamblaje de una pirámide con piezas (make a pyramid).
- Acondicionamiento por VAE: modela la multimodalidad de las demostraciones durante el entrenamiento, útil cuando varias trayectorias humanas resuelven la tarea de formas distintas.
- Integración con LeRobot: cargable mediante `--policy.path=kevineen/takeforest-make_a_pilamid_bs64` en los scripts de evaluación e inferencia de la librería.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo, visión general, audio ni generación de código.
- No dispone de capacidades multilingües; la model card está redactada en japonés y no se declaran idiomas.

## Casos de uso

- Replicación de un pipeline ACT completo: sirve como referencia de hiperparámetros (lr, AMP, VAE, `chunk_size`) para entrenar políticas propias sobre brazos SO-101 con LeRobot, comparando curvas de pérdida con esta configuración base.
- Apilado de piezas en laboratorio: despliegue directo sobre un SO-101 con cámara frontal para ejecutar la tarea de construcción de pirámide en un entorno controlado, útil como banco de pruebas de precisión de agarre.
- Base para fine-tuning de tareas de ensamblaje: al ser un checkpoint ACT ya entrenado en manipulación, puede inicializar el entrenamiento de tareas similares (encaje, apilado, inserción) reduciendo pasos de convergencia.
- Evaluación comparativa de algoritmos de imitación: usar esta política como baseline ACT frente a otras familias (diffusion policy, VLA) sobre el mismo dataset, midiendo tasa de éxito y suavidad de trayectoria.
- Despliegue en hardware de bajo coste: con ~51,6 M parámetros los pesos ocupan unos 206 MB en fp32 y unos 103 MB en fp16, por lo que la inferencia cabe en GPUs de consumo e incluso en dispositivos embebidos tipo Jetson, permitiendo montar la política junto al brazo sin infraestructura de servidor.
- Docencia y formación en robótica de imitación: ejemplo real y pequeño para explicar chunking de acciones, papel del VAE, normalización MEAN_STD y evaluación de políticas visomotoras en un curso práctico.
- Recolección de datos guiada: usar la política como punto de partida para teleoperación asistida y ampliar el dataset con nuevas trayectorias etiquetadas con la misma estructura de observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de éxito, error de trayectoria ni comparación con otras políticas, y el repositorio no registra evaluaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan ~206 MB en fp32 y ~103 MB en fp16; sumando activaciones de ResNet18 a 640×480 y del transformer de 512 dimensiones, un presupuesto de 0,5-1 GB es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 4090 o A100 quedan sobredimensionadas para la inferencia, pero aceleran el reentrenamiento (20.000 pasos con batch 32 en AMP).
- Cabe en GPU de consumo: sí, en RTX 3060/4060, RTX 2060, GTX 1660 (6 GB) y en iGPU recientes con suficiente memoria compartida. También es viable en CPU, con latencia mayor por el coste del backbone convolucional.
- Despliegue: scripts de LeRobot sobre PyTorch (evaluación e inferencia); exportación a ONNX o TensorRT para reducir latencia; no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo por chunk en el hardware de entrenamiento o despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y queda marcada como no disponible en los campos sin datos verificables.

| Modelo | Tipo de política | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| takeforest-make_a_pilamid_bs64 | ACT con ResNet18 + VAE | 51,6 M | `n_obs_steps=1`, chunk 10 | Apache-2.0 | HuggingFace (kevineen) | No disponible |
| Otras políticas ACT de LeRobot | ACT | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas de difusión para manipulación | Diffusion policy | No disponible | No disponible | No disponible | No disponible | No disponible |
| VLA generalistas de manipulación | VLM + cabeza de acción | No disponible | No disponible | No disponible | No disponible | No disponible |

Cualquier comparación cuantitativa exigiría evaluar las políticas sobre el mismo dataset y el mismo montaje físico, algo que no se ha hecho público para este checkpoint.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea (montar una pirámide) sobre un único robot (SO-101) y una única cámara frontal. Fuera de ese montaje la política no es transferible sin reentrenamiento.
- Sin validación pública: 0 descargas y 0 likes en el momento de la consulta, sin métricas de tasa de éxito ni vídeos de evaluación que respalden el funcionamiento del checkpoint.
- Riesgo de sobreajuste: 20.000 pasos sobre un dataset cuyo número de episodios no se documenta; no hay información sobre variabilidad de posiciones, iluminación o distractores.
- Sin capacidades lingüísticas ni de razonamiento: no admite instrucciones en lenguaje natural ni composición de subtareas; cada nueva tarea requiere su propio entrenamiento.
- Discrepancia de configuración: el nombre del repositorio sugiere `bs64` mientras la model card indica `batch_size=32`, lo que puede confundir al replicar el entrenamiento.
- Dependencia de hardware y software concretos: requiere LeRobot, torchcodec y la convención de observaciones del dataset original; cambios en la resolución, el nombre de la cámara o la dimensionalidad del estado rompen la inferencia.
- Sesgos de las demostraciones: al imitar trayectorias humanas, hereda los sesgos del operador y del montaje (posiciones de partida, velocidad, fuerza de agarre); no se documenta ningún análisis al respecto.
- Alucinación en sentido estricto no aplica, pero sí el riesgo de generar acciones plausibles y erróneas ante estados fuera de distribución, con posible colisión o daño del material. Es imprescindible operar con límites de par, paradas de emergencia y supervisión.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y aviso de cambios; aun así, la responsabilidad de seguridad en un entorno físico recae íntegramente en el desplegador.
- Documentación solo en japonés en la model card original, sin traducción oficial ni guía de solución de problemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kevineen/takeforest-make_a_pilamid_bs64
- Dataset de entrenamiento: https://huggingface.co/datasets/takeforest/teamB_20261017_153217
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Paper de referencia de la arquitectura ACT (no incluido en la información proporcionada, citado por conocimiento general de la arquitectura): https://arxiv.org/abs/2304.13705
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
