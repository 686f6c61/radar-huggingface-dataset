# durgachauhan/monkey-smolvla-policy

## Resumen

El modelo `durgachauhan/monkey-smolvla-policy` es una política de robótica basada en SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este fine-tune concreto se ha entrenado con LeRobot sobre un conjunto de datos propio (`durgachauhan/monkey-panorama-track-v3`) para controlar un gimbal pan-tilt con tres cámaras, con la tarea de mantener centrado al mono más cercano al centro de la imagen dentro de límites de ángulo variables (de ±20 a ±45 grados).

La relevancia de este modelo radica en que demuestra el uso práctico de SmolVLA en un escenario de seguimiento visual en tiempo real con hardware de consumo. Al ser un fine-tune de `lerobot/smolvla_base`, hereda la arquitectura eficiente del VLA original, que combina un modelo de lenguaje y visión compacto con un experto de acciones entrenado mediante flow matching. El repositorio incluye los pesos en formato safetensors (0,9 GB) y está pensado para ejecutarse con el ecosistema LeRobot, lo que facilita su despliegue en robots compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model, VLM compacto + action expert con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa multiples imagenes de 256x256 y 480x640) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 segun safetensors) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un VLA ligero compuesto por un modelo de lenguaje y vision (VLM) preentrenado y compacto, junto con un experto de acciones entrenado con flow matching. Dadas multiples imagenes y una instruccion en lenguaje natural, el modelo genera un chunk de acciones (en este caso, un vector de 32 dimensiones). El fine-tune se realizo sobre el modelo base `lerobot/smolvla_base` con el framework LeRobot, utilizando un dataset propio de 4 episodios y 400 frames a 10 FPS, con tareas de seguimiento de monos en un gimbal pan-tilt. La configuracion de entrenamiento incluye 100 pasos, batch size 1, optimizador AdamW con learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitacion supervisada.

## Capacidades

- Seguimiento visual de objetos en movimiento (monos) mediante control de gimbal pan-tilt con tres camaras.
- Generacion de acciones de control continuo (vector de 32 dimensiones) a partir de observaciones visuales y de estado.
- Procesamiento de multiples entradas visuales simultaneas: tres camaras de 256x256 y dos camaras adicionales de 480x640.
- Ejecucion de tareas especificas definidas por instrucciones en lenguaje natural (p. ej., "track the monkey nearest the middle of the camera when angle limit is -45 to 45").
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- Capacidad de fine-tuning desde el modelo base SmolVLA para nuevas tareas de manipulacion o navegacion.

## Casos de uso

- Vigilancia y seguimiento automatico de fauna: el modelo puede mantener a un animal en el centro del encuadre ajustando continuamente la orientacion de una camara motorizada, util para estudios de comportamiento animal o monitorizacion de entornos naturales.
- Teleoperacion asistida de camaras PTZ: integrado en sistemas de videovigilancia, permite que una camara pan-tilt siga automaticamente a un sujeto de interes sin intervencion humana, reduciendo la carga del operador.
- Prototipado de politicas roboticas con LeRobot: sirve como ejemplo de fine-tuning de SmolVLA para una tarea de control visual, permitiendo a desarrolladores replicar el flujo de trabajo con sus propios datos y robots.
- Investigacion en aprendizaje por imitacion: el modelo y su dataset asociado proporcionan un caso de estudio para evaluar tecnicas de VLA en tareas de seguimiento visual con restricciones de angulo.
- Desarrollo de sistemas de interaccion humano-robot: la capacidad de seguir objetos en movimiento puede adaptarse para que un robot mantenga a una persona en su campo de vision durante conversaciones o colaboracion.
- Educacion y demostraciones de robotica: al ser un modelo pequeno y ejecutable en hardware de consumo, es adecuado para laboratorios docentes que necesiten una politica de seguimiento visual funcional sin grandes requisitos de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). El paper original de SmolVLA (arXiv:2506.01844) reporta resultados en tareas de manipulacion robotica, pero no se aplican directamente a este fine-tune especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de 450M de parametros, se estima que puede ejecutarse en GPUs con 8-12 GB de VRAM en precision fp16 (el repo pesa 0,9 GB en safetensors).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como RTX 3060/4060 (12 GB), RTX 4090, o GPUs de datacenter como A100. Tambien es viable en hardware de consumo.
- Compatibilidad con consumer GPU: si, es uno de los objetivos de SmolVLA (despliegue en hardware de consumo).
- Opciones de despliegue: el flujo principal es mediante LeRobot con `lerobot-rollout`, que gestiona la inferencia y el control del robot. Tambien puede usarse con el framework LeRobot para entrenamiento y evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del numero de camaras activas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| durgachauhan/monkey-smolvla-policy | 450M | no disponible | Seguimiento visual con gimbal | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | VLA general para manipulacion | Apache 2.0 | HuggingFace |
| OpenVLA (7B) | 7B | no disponible | VLA general para manipulacion | MIT (investigacion) | HuggingFace |

SmolVLA se distingue de alternativas como OpenVLA por su tamano reducido (450M frente a 7B), lo que permite ejecutarlo en hardware de consumo. Este fine-tune concreto esta especializado en seguimiento de objetos con camara pan-tilt, mientras que el base es una politica generalista. No se dispone de datos de rendimiento comparativo para este modelo especifico.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset muy pequeno (4 episodios, 400 frames) y para una tarea muy especifica; su generalizacion a otros entornos, objetos o configuraciones de camara es limitada.
- No se han proporcionado resultados de evaluacion en robot real, por lo que el rendimiento real en produccion es desconocido.
- Las instrucciones de tarea estan en ingles y son especificas del dataset; el modelo puede no responder correctamente a instrucciones fuera de ese dominio.
- La dependencia de tres camaras simultaneas (dos de 256x256 y dos de 480x640) implica requisitos de ancho de banda y sincronizacion que pueden afectar a la latencia en hardware modesto.
- Al ser un fine-tune de un modelo base, puede heredar sesgos del VLM subyacente, aunque no se han documentado sesgos especificos para este caso.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`durgachauhan/monkey-panorama-track-v3`) puede tener restricciones adicionales que deben verificarse antes de un uso comercial.
- El modelo esta disenado para el robot `pan_tilt_gimbal`; su uso en otros robots requeriria reentrenamiento o adaptacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/durgachauhan/monkey-smolvla-policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/durgachauhan/monkey-panorama-track-v3
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
