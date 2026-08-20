# hugging-son/smolvla_multitask_model

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico por imitación con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `hugging-son/smolvla_multitask_model`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot, especializado en la tarea "move tool to left side" sobre un robot SO100 con tres cámaras (top, wrist y side).

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Aunque el nombre sugiere multitarea, el dataset de entrenamiento contiene una única tarea con 10 episodios y 3584 frames. Su relevancia radica en que demuestra el flujo de fine-tuning de SmolVLA para tareas robóticas específicas, aprovechando un modelo base preentrenado y adaptándolo con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, basada en SmolVLA (detalles internos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en lenguaje natural, probablemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina multiples vistas de camara, el estado sensorimotor del robot y una instruccion en lenguaje natural para generar acciones de control. La arquitectura interna no se detalla en la informacion disponible, pero se describe como compacta y eficiente, pensada para desplegarse en hardware de consumo.

Este modelo es un fine-tuning de `lerobot/smolvla_base` realizado con LeRobot. El entrenamiento se llevo a cabo con 20.000 pasos, batch size de 8, optimizador AdamW y learning rate de 0.0001, con semilla 1000. El dataset de entrenamiento (`hugging-son/multitask_test_20260820_150618`) contiene 10 episodios y 3584 frames a 25 FPS, con la tarea "move tool to left side". No se menciona el uso de RLHF, DPO u otras tecnicas de refinamiento posteriores al fine-tuning supervisado.

## Capacidades

- Control de robot SO100 (tipo `so_follower`) mediante aprendizaje por imitacion.
- Procesamiento de tres vistas de camara simultaneas (top, wrist, side) a resolucion 256x256.
- Entrada del estado del robot (6 dimensiones) y salida de acciones de control (6 dimensiones).
- Ejecucion de tareas de manipulacion especificas, como mover una herramienta hacia la izquierda.
- Fine-tuning sobre un modelo base preentrenado para adaptarse a nuevas tareas con pocos datos.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos controlados: el modelo puede controlar un brazo robotico SO100 para recoger y colocar objetos, aprovechando las tres vistas de camara para localizar y manipular piezas.
- Apilado de objetos (stacking): gracias a su capacidad de procesar informacion visual y de estado, puede ejecutar secuencias de apilado de cubos u otros elementos, como se evaluo en el paper original de SmolVLA.
- Clasificacion y ordenamiento (sorting): el modelo puede separar objetos segun criterios visuales, moviendo piezas a posiciones designadas, una tarea comun en entornos de logistica ligera.
- Prototipado rapido de politicas roboticas en investigacion: al ser un fine-tuning de un modelo base, permite a laboratorios probar nuevas tareas con pocos episodios (10 en este caso) y ajustar hiperparametros mediante LeRobot.
- Despliegue en robots de bajo coste: al ser compacto (450M parametros), puede ejecutarse en GPUs de consumo, lo que facilita su uso en entornos educativos o de investigacion con presupuesto limitado.
- Evaluacion de estrategias de aprendizaje por imitacion: sirve como punto de partida para comparar metodos de entrenamiento, ya que su configuracion esta documentada y reproducible con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo especifico en la informacion disponible. El paper original de SmolVLA (arxiv:2506.01844) reporta evaluaciones en entornos reales con tareas de pick and place, stacking y sorting para los robots SO100 y SO101, pero no se incluyen los numeros concretos en la model card ni en los resultados de busqueda. Por tanto, no se dispone de datos de rendimiento cuantitativos para este fine-tuning.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Con 450 millones de parametros, el modelo es relativamente pequeno: en precision FP32 ocuparia aproximadamente 1,8 GB, en FP16 unos 0,9 GB y en int8 unos 0,45 GB. El repositorio pesa 0,9 GB, lo que sugiere pesos en FP16 o BF16.
- Se estima que puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque se recomienda una RTX 3060 o mejor para margen.
- Para despliegue, LeRobot ofrece integracion con `lerobot-rollout` y soporta inferencia en GPU. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput dependen del hardware y de la resolucion de las camaras; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos VLA en los datos proporcionados. SmolVLA se posiciona como una alternativa compacta a modelos como OpenVLA o RT-2, pero no se incluyen tablas comparativas ni datos de rendimiento relativos en la documentacion consultada.

## Limitaciones y advertencias

- El modelo se entreno con solo 10 episodios, lo que limita su capacidad de generalizacion a variaciones de la tarea o del entorno.
- A pesar del nombre "multitask", el dataset contiene una unica tarea ("move tool to left side"), por lo que no es un modelo multitarea real.
- No se han proporcionado resultados de evaluacion en robot real, por lo que se desconoce su tasa de exito en condiciones no controladas.
- Depende del hardware especifico del robot SO100 y de la configuracion de camaras; cambios en la disposicion pueden degradar el rendimiento.
- No se especifican los idiomas soportados para las instrucciones; probablemente solo ingles, dado el dataset.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base `lerobot/smolvla_base` no tenga restricciones adicionales.
- Al ser un fine-tuning, puede heredar sesgos del modelo base, aunque no se documentan sesgos especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-son/smolvla_multitask_model
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/hugging-son/multitask_test_20260820_150618
