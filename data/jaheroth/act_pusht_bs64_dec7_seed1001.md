# jaheroth/act_pusht_bs64_dec7_seed1001

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_seed1001` es un checkpoint de ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion desarrollado por el equipo de Tony Zhao en Stanford (paper arXiv:2304.13705). ACT predice secuencias cortas de acciones (action chunks) en lugar de acciones paso a paso, lo que reduce el error de compounding y mejora la estabilidad en tareas de manipulacion robotica. Este checkpoint concreto ha sido entrenado con el framework LeRobot de Hugging Face sobre el dataset `lerobot/pusht`, un benchmark estandar en simulacion que consiste en empujar un objeto en forma de T hacia una posicion objetivo.

El modelo cuenta con 83.969.428 parametros (~84 M) y se distribuye en formato safetensors bajo licencia Apache 2.0. Su tamano reducido lo hace apto para inferencia en GPUs de consumo, lo que lo convierte en una opcion accesible para investigacion y experimentacion en robotica. El nombre del checkpoint sugiere un batch size de 64, 7 capas de decoder y una semilla fija de 1001, aunque el tamano del action chunk no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision nativa) |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un marco CVAE (Conditional Variational Autoencoder). La entrada consiste en observaciones visuales del entorno (imagenes de camara) junto con el estado del robot. El modelo codifica estas observaciones y genera un chunk de acciones futuras (tipicamente de 8 a 32 pasos) que el robot ejecuta de forma secuencial. Esta estrategia de action chunking reduce el error de compounding tipico de los metodos autoregresivos paso a paso.

El entrenamiento se realiza mediante behavior cloning sobre datos teleoperados. En este caso, el dataset utilizado es `lerobot/pusht`, un entorno de simulacion donde un brazo robotico debe empujar un objeto en forma de T hasta una posicion objetivo. El checkpoint fue entrenado con el framework LeRobot de Hugging Face, que estandariza el pipeline de entrenamiento y evaluacion de politicas roboticas. El nombre del archivo sugiere un batch size de 64, 7 capas de decoder y semilla 1001, aunque no se proporcionan detalles adicionales sobre el numero de epocas, la tasa de aprendizaje o la composicion exacta del dataset.

## Capacidades

- Manipulacion robotica en simulacion: el modelo es capaz de controlar un brazo robotico para empujar un objeto hacia una posicion objetivo en el entorno pusht.
- Prediccion de action chunks: genera secuencias de acciones futuras en lugar de acciones individuales, lo que mejora la coherencia del movimiento.
- Aprendizaje por imitacion: la politica se ha entrenado mediante behavior cloning a partir de demostraciones teleoperadas.
- Inferencia en tiempo real: con ~84 M de parametros, el modelo es lo suficientemente ligero para ejecutarse en tiempo real en hardware modesto.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta procesamiento de lenguaje natural, vision generalista ni tool calling: es un modelo especializado en control robotico.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida para estudiar tecnicas de action chunking, comparar variantes de ACT o reproducir resultados del paper original.
- Benchmark de manipulacion robotica: el entorno pusht es un estandar en la comunidad; este checkpoint permite evaluar mejoras sobre la linea base de ACT.
- Desarrollo de politicas roboticas con LeRobot: puede utilizarse como referencia para entrenar nuevos modelos sobre otros datasets o entornos.
- Transferencia a entornos reales: aunque entrenado en simulacion, la arquitectura ACT ha demostrado transferibilidad a robots fisicos como el ALOHA, por lo que este checkpoint puede servir como base para fine-tuning.
- Educacion y formacion: al ser un modelo pequeno y con licencia permisiva, es adecuado para cursos y talleres sobre robotica y aprendizaje por refuerzo.
- Comparativa de frameworks: permite comparar el rendimiento de LeRobot frente a otras implementaciones de ACT (por ejemplo, la implementacion original de los autores).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El entorno pusht suele evaluarse mediante la tasa de exito (success rate) en episodios de evaluacion, pero no se dispone de estos datos para este checkpoint concreto. Se recomienda ejecutar la evaluacion con el script de LeRobot (`lerobot.record` con `--robot.type=so100_follower`) para obtener metricas propias.

## Requisitos de hardware

- VRAM estimada: con ~84 M de parametros, el modelo ocupa aproximadamente 336 MB en FP32 y 168 MB en FP16. Cabe en cualquier GPU con 2 GB o mas de VRAM.
- GPUs recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1060 6 GB o superior es suficiente). Tambien puede ejecutarse en CPU para inferencia no critica en tiempo real.
- Consumer GPU: si, el modelo cabe en practicamente cualquier GPU de consumo actual (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: LeRobot (inferencia y evaluacion integrada), Hugging Face Hub (descarga directa de pesos), y cualquier framework que soporte safetensors con PyTorch.
- Latencia: no disponible. Depende del hardware y del tamano del action chunk configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_pusht_bs64_dec7_seed1001 (este) | 83,97 M | Pusht (empuje) | Apache 2.0 | Hugging Face |
| act_pusht_bs64_chunk32_dec7_seed1001 | no disponible | Pusht (empuje) | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia) | no disponible | Pusht y otros | no disponible | no disponible |

El checkpoint hermano `act_pusht_bs64_chunk32_dec7_seed1001` del mismo autor difiere en el nombre por la inclusion de "chunk32", lo que sugiere un action chunk de 32 pasos frente a un tamano no especificado en este modelo. No se dispone de datos comparativos de rendimiento entre ambos. Diffusion Policy es un metodo alternativo de aprendizaje por imitacion que ha reportado buenos resultados en pusht, pero no se dispone de datos de comparacion directa con este checkpoint.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta entrenado exclusivamente para la tarea pusht en simulacion. No generaliza a otras tareas de manipulacion sin fine-tuning.
- Sim-to-real gap: al estar entrenado en simulacion, puede presentar degradacion de rendimiento al transferirlo a un robot fisico.
- Sin datos de rendimiento publicados: no se han publicado tasas de exito ni otras metricas para este checkpoint, por lo que su calidad relativa es desconocida.
- Sin soporte de lenguaje natural: no procesa texto ni instrucciones verbales; es un modelo puramente visuomotor.
- Dependencia del ecosistema LeRobot: la reproduccion de resultados requiere seguir el pipeline de LeRobot, lo que puede limitar su uso fuera de este framework.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y sin responsabilidad por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_seed1001
- Checkpoint hermano (chunk32): https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7_seed1001
- Paper original de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset pusht: https://huggingface.co/datasets/lerobot/pusht
