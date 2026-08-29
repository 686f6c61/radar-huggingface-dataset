# HyeonseokE/smolvla_phase1_push_button_A1_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, con solo 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto contiene un fine-tuning de la base `lerobot/smolvla_base` para la tarea de pulsar un botón rojo con un robot manipulador SO-101, entrenado con el framework LeRobot sobre un dataset propio de 100 episodios a 10 FPS. El modelo combina un VLM preentrenado con un experto de acciones basado en flow matching, lo que le permite generar secuencias de acciones a partir de observaciones visuales y una instrucción en lenguaje natural.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea robótica concreta mediante fine-tuning, manteniendo un coste computacional bajo y siendo desplegable en GPU domésticas. Es un ejemplo práctico del ecosistema LeRobot para aprendizaje por imitación en robótica, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del VLM base; procesa multiples imagenes y una instruccion de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instruccion en ingles en el dataset: "Press the red button.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de vision-lenguaje (VLM) preentrenado y compacto, junto con un "experto de acciones" entrenado mediante flow matching. Dado un conjunto de imagenes de camaras y una instruccion en lenguaje natural, el modelo genera un chunk de acciones (una secuencia de comandos de articulacion). El fine-tuning aqui presentado parte de `lerobot/smolvla_base` y se entrena sobre el dataset `HyeonseokE/phase1_push_button_A1_10fps`, que contiene 100 episodios y 11.299 frames a 10 FPS, con la tarea "Press the red button". La configuracion de entrenamiento incluye 8.800 pasos, batch size de 64, optimizador AdamW con learning rate 0.0001 y semilla 3000. No se menciona el uso de RLHF o DPO; es un entrenamiento de aprendizaje por imitacion supervisado.

Las entradas del modelo son el estado del robot (6 dimensiones) y tres imagenes de camaras (cada una de 256x256 píxeles y 3 canales). La salida es una accion de 6 dimensiones (posiciones articulares). El robot objetivo es un SO-101 follower, con camaras `top` y `left_wrist` segun la model card, aunque la tabla de entradas lista tres camaras (`camera1`, `camera2`, `camera3`); esta discrepancia no esta resuelta en la documentacion.

## Capacidades

- Control robotico por imitacion: genera acciones articulares (6 grados de libertad) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica textualmente ("Press the red button").
- Procesamiento multimodal: combina vision (tres camaras) y lenguaje para producir acciones.
- Generacion de chunks de acciones: gracias al flow matching, puede predecir secuencias de acciones, no solo un paso.
- Especializacion en tarea unica: este fine-tuning esta optimizado exclusivamente para pulsar un boton rojo en el entorno especifico.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.

## Casos de uso

- Automatizacion de tareas repetitivas en entornos controlados: el modelo puede ejecutar la tarea de pulsar un boton de forma consistente, util en lineas de produccion o laboratorios donde se requiere una accion mecanica simple y repetible.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se adapta a una tarea concreta con pocos datos (100 episodios).
- Desarrollo de habilidades roboticas en robotica asistencial: la capacidad de seguir una instruccion verbal y visual para interactuar con un boton puede extrapolarse a entornos de asistencia a personas con movilidad reducida.
- Prototipado rapido de politicas roboticas: gracias a LeRobot, se puede entrenar y desplegar en un robot SO-101 en pocas horas, ideal para validar conceptos antes de escalar a modelos mas grandes.
- Educacion y formacion en robotica: al ser un modelo pequeno y con licencia permisiva, es adecuado para cursos universitarios donde los estudiantes aprenden a entrenar y evaluar VLA en hardware real.
- Benchmarking de eficiencia: permite comparar el rendimiento de un VLA de 450M frente a alternativas mas grandes (como OpenVLA de 7B) en tareas de manipulacion simples, midiendo latencia y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de exito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M de parametros, en FP16 los pesos ocupan aproximadamente 0,9 GB. Sin embargo, la inferencia con tres imagenes de 256x256 y el procesamiento del VLM puede requerir entre 4 y 8 GB de VRAM en funcion de la implementacion y el batch. No hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) deberia ser suficiente. Para entrenamiento, se recomienda una GPU con 12 GB o mas (RTX 3080, RTX 4080, etc.).
- Compatibilidad con consumer GPU: si, es uno de los objetivos del diseno de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) para ejecutar la politica en un robot real. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no un LLM generico.
- Latencia y throughput: no disponibles. Depende del hardware y de la implementacion de LeRobot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT (con restricciones) | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Propietaria | no publico |

SmolVLA es significativamente mas pequeno que OpenVLA (450M vs 7B), lo que permite ejecutarlo en hardware de consumo, aunque probablemente con menor capacidad de generalizacion. RT-2 no esta disponible publicamente. No se dispone de comparaciones de rendimiento directas en tareas similares.

## Limitaciones y advertencias

- Especializacion estrecha: este fine-tuning solo es valido para la tarea de pulsar un boton rojo en el entorno y con el robot especifico (SO-101). No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del dataset: el rendimiento esta limitado por la calidad y variedad del dataset de entrenamiento (100 episodios, un solo escenario). Puede fallar ante variaciones de iluminacion, posicion del boton o distracciones.
- Riesgo de alucinacion en acciones: como cualquier modelo generativo, puede producir acciones incorrectas o inconsistentes si las observaciones se alejan de la distribucion de entrenamiento.
- Sin evaluacion publicada: no hay datos de tasa de exito en robot real, por lo que su fiabilidad en produccion no esta demostrada.
- Discrepancia en camaras: la model card menciona dos camaras (`top`, `left_wrist`) pero la tabla de entradas lista tres. Esto puede causar errores de configuracion al desplegar.
- Idiomas: la instruccion esta en ingles; no se ha probado con otros idiomas.
- Requisitos de hardware para entrenamiento: aunque la inferencia es ligera, el entrenamiento requiere una GPU con suficiente VRAM (no especificada).

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_push_button_A1_3000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_push_button_A1_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
