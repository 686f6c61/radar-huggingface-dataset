# masato-ka/act_omx-bottole-peginhole-v1_20260823_161252

## Resumen

El modelo `masato-ka/act_omx-bottole-peginhole-v1_20260823_161252` es una política de robótica entrenada mediante aprendizaje por imitación, específicamente con el método Action Chunking with Transformers (ACT). Este enfoque, presentado en el paper arXiv:2304.13705, predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que permite ejecutar tareas de manipulación con alta precisión y suavidad. El modelo ha sido desarrollado por el usuario masato-ka y publicado en Hugging Face bajo la licencia Apache 2.0.

La política está diseñada para controlar un robot tipo `omx_follower` y resolver la tarea de recoger y colocar un bloque (Pick-up-block). El modelo consume una imagen de una cámara cenital (overhead) de 480x640 píxeles y el estado del robot (11 dimensiones), y produce acciones de 6 dimensiones. El repositorio de pesos contiene un único archivo safetensors de 51.673.734 parámetros, lo que lo convierte en un modelo compacto y viable para inferencia en tiempo real.

Este modelo es relevante porque ejemplifica el flujo de trabajo moderno de la robótica de código abierto: entrenamiento de políticas con LeRobot, publicación en HuggingFace y despliegue directo en robots reales mediante comandos CLI. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su adopción en entornos industriales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.673.734 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es una politica de robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que utiliza un transformer codificador-decodificador con una variable latente (VQ-VAE) para representar el comportamiento. El codificador procesa las observaciones (imagen de la camara cenital y estado del robot) y el decodificador genera una secuencia de acciones futuras (chunks). Esta prediccion por lotes de acciones reduce la propagacion de errores y produce trayectorias mas suaves y estables que los metodos de prediccion paso a paso.

El entrenamiento se realizo con el dataset `masato-ka/omx-barto-peginhole-v1_20260823_161252`, que contiene 10 episodios y 5879 frames a 30 FPS. La tarea registrada es "Pick-up-block". La configuracion de entrenamiento incluye 40000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. Se utilizo la version 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO ni otras tecnicas de post-entrenamiento; el modelo se entrena exclusivamente mediante aprendizaje por imitacion supervisado.

## Capacidades

- Control de robot manipulado: el modelo genera comandos de accion de 6 dimensiones para el robot OMX, permitiendo la ejecucion de la tarea de recogida y colocacion de bloques.
- Percepcion visual: procesa una imagen de camara cenital de 480x640 píxeles (3 canales) para localizar el objeto y la zona de colocacion.
- Integracion de estado: combina la informacion visual con el estado del robot (11 variables) para generar acciones contextuales.
- Ejecucion en tiempo real: con 51 millones de parametros, es ligero y capaz de inferencia a alta frecuencia (30 FPS) en hardware moderado.
- No aplica tool calling, agentes, razonamiento multi-paso ni capacidades multilingues al ser un modelo de robotica puro.

## Casos de uso

- **Manipulacion de objetos en entornos industriales**: el modelo puede integrarse en celdas de trabajo para tareas de pick-and-place, donde se requiere que un robot coloque bloques o piezas en posiciones determinadas. La prediccion por chunks permite trayectorias suaves que reducen el desgaste mecanico y los errores de posicionamiento.
- **Investigacion en robotica de aprendizaje**: es un punto de partida ideal para investigadores que quieran estudiar el metodo ACT, comparar con otros algoritmos (diffusion policies, RVT, etc.) o desarrollar variantes sobre una base funcional.
- **Prototipado rapido en laboratorios**: con solo 10 episodios de entrenamiento, el modelo demuestra que es posible obtener politicas funcionales con pocos datos. Sirve para validar rapidamente el diseno de tareas y la configuracion de camaras.
- **Despliegue en robots de bajo costo**: dado su tamano reducido (0.2 GB), puede ejecutarse en mini-PCs (NVIDIA Jetson, etc.) o en estaciones de trabajo con GPU modestas, lo que facilita su uso en entornos de investigacion con presupuesto limitado.
- **Desarrollo de sistemas de teleoperacion**: el modelo puede utilizarse para reproducir demostraciones teleoperadas con precision, permitiendo la generacion de datasets de mayor calidad o la transferencia de habilidades entre operadores.
- **Benchmarking de algoritmos de imitacion**: se puede usar como referencia para medir la eficiencia de nuevos metodos de aprendizaje por imitacion en la misma tarea y con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion proporcionados por el autor. Por tanto, no se dispone de datos de tasa de exito en el robot real, ni de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- **VRAM estimada**: para inferencia, un modelo de 51 millones de parametros con imagenes de 480x640 requiere aproximadamente 1-2 GB de VRAM en FP32, y menos de 1 GB en FP16. Esto permite ejecucion en GPUs con 4 GB o mas.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 4090. En el caso de Jetson Orin Nano o similar, tambien es viable.
- **Compatibilidad con consumer GPU**: si, el modelo cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: LeRobot proporciona el CLI `lerobot-rollout` para ejecutar la politica en un robot real. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de robotica, no de lenguaje.
- **Latencia y throughput**: no se especifican datos oficiales. Con el tamano del modelo, se estima una inferencia de 5-10 ms por paso en una GPU media, permitiendo control a 30 FPS o mas.

## Comparativa con modelos similares

No se dispone de modelos comparables con la misma tarea y robot en la informacion proporcionada. Los modelos de robotica en HuggingFace varian en tarea, robot y algoritmo, por lo que no es posible hacer una comparativa directa. Se recomienda consultar el repositorio de LeRobot para ver otras politicas entrenadas con ACT en diferentes robots y tareas.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han reportado sesgos especificos, pero al entrenar con solo 10 episodios de demostracion, el modelo puede tener un rendimiento limitado en variaciones no vistas de la posicion del objeto, iluminacion o distracciones.
- **Riesgo de alucinacion**: no aplica directamente, pero el modelo puede generar acciones incorrectas si la observacion visual se aleja de la distribucion de entrenamiento (por ejemplo, objetos nuevos o camara movida).
- **Limitaciones de contexto**: al ser una politica de robotica, no tiene una ventana de contexto de texto; su "contexto" es la observacion actual y la secuencia de acciones predicha (chunk). No maneja lenguaje.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificacion, pero requiere mantener el aviso de copyright y atribucion.
- **Caveat para produccion**: el modelo no ha sido evaluado en el robot real, por lo que se recomienda una validacion exhaustiva antes de cualquier despliegue en produccion. Ademas, la tarea es especifica (Pick-up-block) y no se recomienda su uso para otras tareas sin reentrenamiento.

## Enlaces

- Modelo: https://huggingface.co/masato-ka/act_omx-barto-peginhole-v0_20261026_161252
- Dataset de entrenamiento: https://huggingface.co/datasets/masato-ka/omx-barto-peginhole-v0_20261026_161252
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
