# mysterium99/my_smolvla

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) de 450 millones de parametros desarrollado por Hugging Face para robótica, con un diseño pensado para ejecutarse en hardware de consumo. Este repositorio concreto contiene un fine-tune del modelo base `lerobot/smolvla_base` realizado por `mysterium99`, adaptado al dataset `lerobot/svla_so100_stacking` para controlar un robot SO100 en la tarea de apilar cubos. La arquitectura combina codificadores visuales y de estado con un modulo de accion de bajo nivel, generando comandos de 6 dimensiones a partir de observaciones de camaras y del estado del robot.

El modelo destaca por su tamano compacto: con 450.046.176 parametros y un peso del repositorio de 0,9 GB, es viable para GPUs de consumo y entornos de laboratorio con recursos limitados. La relevancia actual radica en que acerca los modelos VLA a la practica real de la robótica, permitiendo a desarrolladores e investigadores entrenar y desplegar politicas de imitacion sin necesidad de infraestructura costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de accion robotica; entradas de observacion: estado 6D e imagenes 3x256x256) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion (VLA) compacto de 450M parametros, cuya arquitectura se describe en el paper arxiv:2506.01844. No se dispone de detalles especificos sobre la estructura interna del transformer en la informacion proporcionada, pero el diseno general integra codificacion de imagenes, procesamiento de estado del robot y prediccion de acciones de bajo nivel. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face para servir como punto de partida en tareas de manipulacion robotica.

Este repositorio concreto es un fine-tune del modelo base sobre el dataset `lerobot/svla_so100_stacking`, que contiene 56 episodios y 22.956 frames a 30 FPS (aproximadamente 12,8 minutos de datos de demostracion). La tarea es "Poner el cubo rojo encima del cubo azul". El entrenamiento se realizo con LeRobot 0.6.2, con una configuracion de un solo paso de entrenamiento, batch size 64, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de RLHF ni DPO; se trata de un ajuste por imitacion. La innovacion destacable es la reduccion del tamano del modelo hasta los 450M sin perder competitividad en tareas de manipulacion, lo que permite despliegue en hardware de consumo.

## Capacidades

- Genera acciones de 6 dimensiones para controlar un robot SO100, a partir de observaciones de estado y de hasta tres camaras (top, wrist).
- Procesa entradas visuales de 256x256 pixeles y estado del robot de 6 valores.
- Esta especializado en la tarea de apilar cubos: poner el cubo rojo encima del cubo azul.
- Se integra con el framework LeRobot para inferencia (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- Gracias a su tamano reducido (450M), puede ejecutarse en hardware de consumo.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Investigacion en imitacion learning: el modelo sirve como ejemplo de fine-tuning de un VLA compacto. Se puede cargar con `lerobot-rollout` y ejecutar en un robot SO100 para observar su comportamiento y recopilar datos de rendimiento. Es adecuado por su integracion nativa con LeRobot y su bajo coste computacional.
- Robotica educativa en entornos universitarios: por su tamano reducido, se puede desplegar en equipos de laboratorio con GPUs de consumo. Permite a los estudiantes experimentar con politicas de vision-lenguaje-accion sin necesidad de infraestructura costosa.
- Automatizacion de tareas de manipulacion repetitivas: tras un entrenamiento adicional con datos propios, el modelo podria adaptarse a tareas de pick-and-place en entornos controlados. La arquitectura VLA permite condicionar la accion por instrucciones en lenguaje natural.
- Prototipado rapido de politicas roboticas: el flujo de entrenamiento de LeRobot permite iterar rapidamente sobre nuevos datasets. Este modelo puede usarse como punto de partida para explorar como un VLA se comporta en una tarea sencilla.
- Benchmarking de modelos VLA en manipulacion: al estar publicado en HuggingFace, puede compararse con otros modelos de la misma categoria, como el base `lerobot/smolvla_base`, en terminos de exito en la tarea. Sirve para estudiar el efecto del fine-tuning.
- Desarrollo de robots colaborativos de bajo coste: el modelo esta disenado para ejecutarse en hardware de consumo, lo que lo hace apto para integrarse en brazos roboticos de bajo coste como el SO100 en aplicaciones de investigacion o pequeña produccion.
- Generacion de datos de demostracion: el modelo puede usarse en combinacion con LeRobot para recopilar demostraciones adicionales mediante el despliegue de la politica en el robot, generando datos para iterar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio (0,9 GB) sugiere que los pesos ocupan aproximadamente 0,9 GB en formato FP16/BF16, lo que permitiria la inferencia en GPUs con al menos 1-2 GB de VRAM (estimacion).
- GPU recomendadas: no disponible. Por su tamano, se espera que funcione en GPUs de consumo como RTX 3060 o inferiores (estimacion).
- Si cabe en consumer GPU: si, previsiblemente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el metodo de despliegue previsto. Los servidores LLM tradicionales (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/my_smolvla | 450.046.176 | No disponible | Sin resultados publicados | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | No disponible | No disponible | Sin resultados publicados | Apache-2.0 | HuggingFace |

El modelo actual es un fine-tune del base `lerobot/smolvla_base`, especializado en la tarea de apilado con el robot SO100. El base es el modelo preentrenado generico. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- El modelo ha sido entrenado con un unico paso de entrenamiento (training steps = 1), lo que indica que el fine-tuning es extremadamente limitado. Es probable que el rendimiento real sea deficiente.
- No se han proporcionado resultados de evaluacion, por lo que no existe evidencia empirica de su capacidad para completar la tarea.
- El modelo esta disenado especificamente para un robot SO100 y la tarea "Poner el cubo rojo encima del cubo azul". No se espera que generalice a otras tareas o configuraciones de hardware.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datasets utilizados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental o de demostracion.
- No se dispone de informacion sobre sesgos, pero al ser un modelo de accion basado en datos de demostracion, puede heredar sesgos del dataset, como posiciones iniciales o iluminacion.
- Los idiomas soportados no estan disponibles; el modelo no esta pensado para tareas de lenguaje natural general.

## Enlaces

- HuggingFace: https://huggingface.co/mysterium99/my_smolvla
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_stacking
- Modelo base: https://huggingface.co/lerobot/smolvla_base
