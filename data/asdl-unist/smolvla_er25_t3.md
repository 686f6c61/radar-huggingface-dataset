# asdl-unist/smolvla_ER25_T3

## Resumen

El modelo `asdl-unist/smolvla_ER25_T3` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, desarrollado por el equipo asdl-unist. SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente, disenado para controlar robots mediante instrucciones en lenguaje natural y observaciones visuales, con un coste computacional reducido que permite su despliegue en hardware de consumo. Este fine-tune concreto se ha entrenado con el dataset propio `asdl-unist/TRAIN_T3_ER`, compuesto por 60 episodios de demostracion (15.236 frames a 30 FPS) para tareas de manipulacion robotica como apilar objetos o colocarlos en contenedores.

El modelo tiene 450.046.176 parametros, lo que lo sitúa en la gama de los modelos compactos, y se distribuye bajo licencia Apache-2.0 en formato safetensors. Su relevancia radica en que demuestra como adaptar un VLA generico a tareas roboticas especificas con un dataset reducido, utilizando la libreria LeRobot para el entrenamiento y la inferencia, y manteniendo la capacidad de ejecucion en GPUs de consumo. El codigo y la documentacion de referencia corresponden al paper SmolVLA (arXiv:2506.01844) y al ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que integra un vision-language model (VLM) preentrenado con un modulo de prediccion de acciones. En este caso, el modelo se ha fine-tuneado a partir de `lerobot/smolvla_base` utilizando el framework LeRobot. El dataset de entrenamiento `asdl-unist/TRAIN_T3_ER` contiene 60 episodios con 15.236 frames, capturados a 30 fps, y cubre cuatro tareas de manipulacion robotica: apilar dos vasos de papel, colocar una zanahoria en una cesta, y colocar vasos de colores en recipientes del mismo color. El modelo se entreno durante 8000 pasos con un batch size de 16, optimizador AdamW, learning rate de 0.0001 y seed 1000, usando la version 0.6.1 de LeRobot. No se han publicado detalles adicionales sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento (como RLHF o DPO), ya que no estan disponibles en la informacion proporcionada.

## Capacidades

- Control de robotica manipulativa: el modelo genera acciones de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones de estado y dos camaras (top y wrist).
- Ejecucion de tareas guiadas por lenguaje natural: las instrucciones del dataset indican acciones como "Pick up the left paper cup and stack it onto the right paper cup", lo que demuestra la integracion de lenguaje y vision para control.
- Adaptacion a tareas especificas mediante fine-tune: el modelo puede especializarse en un conjunto concreto de tareas con un dataset relativamente pequeno (60 episodios).
- Capacidades multilingue: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-step: no disponible.
- Capacidades especiales (vision, audio, etc.): el modelo procesa entradas visuales (dos camaras RGB de 480x640) y estado del robot, pero no se especifican otras modalidades.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio o industria: el modelo puede ejecutar tareas de recoger y colocar objetos (como vasos o zanahorias) en ubicaciones determinadas, lo que lo hace adecuado para prototipos de robotica asistida.
- Aprendizaje por imitacion para robots colaborativos: al ser un fine-tune de un VLA generico, se puede utilizar para ensenar al robot nuevas tareas mediante demostraciones, reduciendo el tiempo de programacion manual.
- Investigacion en robotica manipulativa: permite estudiar como los modelos VLA compactos se adaptan a tareas especificas con pocos datos, sirviendo como plataforma de experimentacion en entornos academicos.
- Pruebas de concepto en entornos de desarrollo con hardware limitado: gracias a su tamano reducido (450M parametros), puede ejecutarse en GPUs de consumo, lo que facilita la experimentacion en laboratorios sin infraestructura de alto coste.
- Generacion de trayectorias de robot: el modelo produce acciones de 6 que se pueden usar directamente para controlar un robot tipo `so_follower`, lo que es util para sistemas de teleoperacion asistida o para generar datos sinteticos de entrenamiento.
- Benchmark de eficiencia de modelos VLA: sirve como ejemplo de fine-tune de SmolVLA para comparar el rendimiento de modelos compactos frente a alternativas mas grandes, en terminos de coste y precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que no se han proporcionado evaluaciones de rendimiento (exito en tareas reales). Por tanto, no se presentan tablas comparativas con otros modelos.

## Requisitos de hardware

- No se dispone de datos concretos de VRAM estimada, latencia o throughput para este modelo. Sin embargo, SmolVLA esta disenado para ser desplegado en hardware de consumo, por lo que se espera que este fine-tune pueda ejecutarse en GPUs comerciales como una RTX 4090 o similares.
- El peso del modelo es de aproximadamente 1.2 GB en formato safetensors, lo que sugiere que cabe en la memoria de una GPU de consumo tipica (8-24 GB).
- Opciones de despliegue: se puede ejecutar con LeRobot, que proporciona scripts de rollout y entrenamiento. No se menciona compatibilidad con vLLM, llama.cpp o Ollama, ya que es un modelo de robotica, no de texto generativo.
- No hay datos de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en los resultados de busqueda ni en la model card. Se trata de un fine-tune especifico de `lerobot/smolvla_base`, y no se proporcionan comparaciones con otros VLA como OpenVLA o RT-2 en terminos de parametros, contexto o rendimiento. Por tanto, esta seccion queda como "no disponible".

## Limitaciones y advertencias

- No se han publicado evaluaciones de rendimiento en robot real, por lo que no se conoce la tasa de exito en tareas del mundo real.
- El modelo se ha entrenado con un dataset limitado a 60 episodios y a cuatro tareas concretas, por lo que su generalizacion a otras tareas o entornos no esta garantizada.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto, ya que es un modelo de robotica y no de generacion de texto.
- La licencia apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento en el robot especifico antes de su despliegue en produccion.
- El modelo se entrega en formato safetensors y requiere el ecosistema LeRobot para su inferencia; no se garantiza compatibilidad con otras librerias.

## Enlaces

- Repositorio de HuggingFace: [asdl-unist/smolvla_ER25_T3](https://huggingface.co/asdl-unist/smolvla_ER25_T3)
- Paper SmolVLA: [arXiv:2506.01844](https://arxiv.org/abs/2506.01844)
- Modelo base: [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Dataset de entrenamiento: [asdl-unist/TRAIN_T3_ER](https://huggingface.co/datasets/asdl-unist/TRAIN_T3_ER)
- Documentacion de LeRobot: [LeRobot](https://github.com/huggingface/lerobot)
