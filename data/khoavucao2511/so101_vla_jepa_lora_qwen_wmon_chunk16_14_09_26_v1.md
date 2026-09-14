# khoavucao2511/so101_vla_jepa_LoRA_Qwen_WMon_chunk16_14_09_26_v1

# so101_vla_jepa_LoRA_Qwen_WMon_chunk16

## Resumen

so101_vla_jepa_LoRA_Qwen_WMon_chunk16_14_09_26_v1 es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario khoavucao2511 en HuggingFace Hub. El modelo combina tres componentes: un backbone de lenguaje y visión Qwen3-VL, un modelo de mundo de vídeo auto-supervisado V-JEPA2 y una cabeza de acción DiT entrenada con flow matching. El ajuste se ha realizado mediante LoRA sobre dicho backbone, tal y como indica el propio nombre del repositorio. Está pensado para controlar brazos robóticos SO-101 (`so_follower`) en tareas de manipulación tipo pick-and-place.

El modelo resuelve el problema de generar acciones motoras de 6 grados de libertad a partir de dos flujos de cámara (224x224) y el estado articular del robot, ejecutando tareas como "coger el bloque verde y depositarlo en el contenedor". Se apoya en el ecosistema LeRobot 0.6.2 de HuggingFace, que proporciona las herramientas de entrenamiento y despliegue (`lerobot-train`, `lerobot-rollout`).

Es relevante ahora porque representa la aplicación práctica del paradigma VLA-JEPA descrito en el paper arXiv:2602.10098, que integra un world model de vídeo con una política de acción por flow matching. El repositorio ocupa 1,3 GB, tiene licencia Apache 2.0 y, en el momento de la consulta, no registra descargas ni likes ni resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone Qwen3-VL + world model V-JEPA2 + cabeza de accion DiT con flow matching; ajuste LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (las tareas del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,3 GB |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `top`, `front` (features de entrada: `exterior_1_left`, `exterior_2_left`) |
| Entradas | 2 visuales `(3, 224, 224)` + estado `(6,)` |
| Salida | accion `(6,)` |
| Horizonte de chunking | 16 (deducido del nombre del repositorio) |
| Libreria | LeRobot |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno VLA-JEPA: un backbone VLM Qwen3-VL procesa las observaciones visuales y el estado, un world model auto-supervisado V-JEPA2 aporta representaciones predictivas del entorno a partir de vídeo, y una cabeza de acción basada en Diffusion Transformer (DiT) genera trayectorias mediante flow matching. Según el nombre del repositorio, la cabeza de acción produce chunks de 16 pasos (`chunk16`) y se ha aplicado un ajuste LoRA sobre el backbone preentrenado (`LoRA_Qwen`).

En cuanto a los datos, el modelo se ha entrenado sobre el dataset `vasco281204/so101_green_block_36`, compuesto por 200 episodios y 129.045 fotogramas a 30 FPS, con dos tareas de manipulación: "Pick the green block and place it into the container" y "Pick the object and place it into the box". La configuración de entrenamiento registrada es de 40.000 pasos, batch size 1, optimizador AdamW, learning rate 0,0001, semilla 42 y LeRobot 0.6.2. No se especifica el número total de tokens, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion visual multimodal mediante dos camaras (vistas `exterior_1_left` y `exterior_2_left`) a resolucion 224x224.
- Ejecucion de tareas de pick-and-place guiadas por instruccion textual en lenguaje natural.
- Aprendizaje por imitacion sobre datos teleoperados (200 episodios, 129.045 fotogramas).
- Modelado predictivo del entorno mediante el world model V-JEPA2 para representaciones latentes del vídeo.
- Generacion de trayectorias de accion por chunks de 16 pasos mediante flow matching.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni capacidades conversacionales.
- No se documentan capacidades de audio ni thinking mode.

## Casos de uso

- Manipulacion robotica pick-and-place: el modelo controla un SO-101 para coger un bloque verde y colocarlo en un contenedor, que es exactamente la tarea sobre la que fue entrenado.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para reproducir el paradigma VLA-JEPA y comparar con otras politicas VLA en el mismo robot.
- Prototipado rapido en laboratorio: gracias a la integracion con LeRobot y a un repositorio de 1,3 GB, se puede desplegar en un SO-101 con `lerobot-rollout` sin infraestructura de servidor adicional.
- Benchmark de world models en robotica: permite evaluar si las representaciones de V-JEPA2 mejoran la tasa de exito frente a politicas que no usan world model.
- Base para fine-tuning especifico: al ser un ajuste LoRA sobre Qwen3-VL, permite reentrenar sobre un dataset propio de tareas de agarre con coste computacional reducido.
- Automatizacion de tareas de clasificacion de objetos: la segunda tarea del dataset ("coger el objeto y depositarlo en la caja") es generica y puede adaptarse a lineas de picking simples.
- Docencia y formacion en robotica: sirve como ejemplo completo del flujo LeRobot (grabacion de datos, entrenamiento y rollout) sobre hardware accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito reales en robot ni resultados en tareas estandar como MMLU, HumanEval o GSM8K (que, por otra parte, no son el tipo de evaluacion relevante para una politica VLA).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamano del backbone Qwen3-VL, que no se especifica. Como referencia orientativa no confirmada, un backbone de ~2B requeriria del orden de 4-6 GB en fp16, uno de ~4B unos 8-12 GB y uno de ~8B unos 16-20 GB, a lo que habria que sumar la cabeza DiT y el world model.
- GPU recomendadas: no disponible en la informacion proporcionada. Las tareas de robotica con VLA suelen ejecutarse en GPUs de gama alta (A100, H100) o en GPUs de consumo con suficiente VRAM si el backbone es pequeno.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano efectivo del modelo una vez fusionado el LoRA.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento opera a 30 FPS, lo que fija una referencia temporal de las observaciones, pero no se aporta ninguna medicion de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| so101_vla_jepa_LoRA_Qwen_WMon_chunk16 (este) | no disponible | no disponible | Apache 2.0 | HuggingFace Hub |
| SmolVLA (HuggingFace) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub |
| pi0 (Physical Intelligence) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publicado por el autor |

Nota: no se dispone de datos verificados en la informacion proporcionada para rellenar los campos de los modelos comparables, por lo que se marcan como no disponibles en lugar de estimarlos.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion real en robot, por lo que se desconoce la tasa de exito de la politica.
- El entrenamiento se limita a 200 episodios y 129.045 fotogramas de dos tareas concretas de pick-and-place sobre un objeto verde. La generalizacion a otros objetos, posiciones o iluminaciones no esta documentada.
- Es un ajuste LoRA sobre un backbone concreto, de modo que su comportamiento depende en gran medida del modelo base Qwen3-VL utilizado, que no se especifica.
- No se documentan idiomas soportados; las instrucciones del dataset estan en ingles, por lo que el uso en castellano no esta garantizado.
- No se especifican sesgos conocidos ni riesgos de alucinacion para tareas de lenguaje, ya que el uso previsto es de control motor.
- No se aporta informacion sobre el numero de parametros totales, el contexto o el regimen de cuantizacion, lo que dificulta planificar el despliegue en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su propio entorno antes de desplegarlo.
- La fecha de creacion registrada (2026-09-14) y el identificador arXiv del paper no han podido contrastarse con fuentes externas: la busqueda web realizada solo devolvio resultados no relacionados con el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/khoavucao2511/so101_vla_jepa_LoRA_Qwen_WMon_chunk16_14_09_26_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_green_block_36
- Paper citado (VLA-JEPA): https://arxiv.org/abs/2602.10098
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Guia LeRobot vla_jepa: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vasco281204/so101_green_block_36

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; todos los enlaces encontrados correspondian a contenidos sin relacion.
