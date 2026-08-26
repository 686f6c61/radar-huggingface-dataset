# DiosStrike/smolvla-libero-test

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Está diseñado para tareas de robótica, específicamente para control de manipuladores mediante aprendizaje por imitación, y destaca por poder ejecutarse en hardware de consumo. Este repositorio concreto, `DiosStrike/smolvla-libero-test`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset LIBERO, realizado con la librería LeRobot. El modelo tiene 450 millones de parámetros y está orientado a la generación de acciones de robot a partir de observaciones visuales y del estado del efector.

La relevancia de este modelo radica en su tamaño reducido en comparación con otros VLA como OpenVLA (7B parámetros), lo que permite su despliegue en GPUs de gama media y su uso en entornos de investigación con recursos limitados. Este fine-tuning concreto se ha entrenado durante 200 pasos con el dataset LIBERO, que incluye tareas de manipulación en un entorno simulado con un robot Panda. Aunque el modelo base ya ha demostrado buen rendimiento en benchmarks de robótica, este checkpoint específico es un experimento de fine-tuning rápido y no debe considerarse como una versión optimizada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion. La arquitectura exacta no se detalla en la informacion disponible, pero se sabe que es un transformer denso de 450M parametros, significativamente mas pequeno que otros VLA como OpenVLA (7B). El modelo base fue preentrenado por Hugging Face y este checkpoint es un fine-tuning sobre el dataset LIBERO, que contiene 1693 episodios y 273465 frames a 10 FPS, con tareas de manipulacion de objetos en un entorno simulado con robot Panda.

El entrenamiento de este fine-tuning se realizo con LeRobot version 0.6.2, usando 200 pasos de entrenamiento, batch size 1, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de tecnicas como RLHF o DPO; se trata de aprendizaje por imitacion supervisado. El modelo consume dos imagenes de 256x256 píxeles (camaras `image` e `image2`) y un vector de estado de 8 dimensiones, y produce una accion de 7 dimensiones (posicion y orientacion del efector).

## Capacidades

- Generacion de acciones de robot: produce comandos de movimiento (7 dimensiones) para un manipulador Panda a partir de observaciones visuales y estado.
- Aprendizaje por imitacion: entrenado para replicar demostraciones humanas en tareas de manipulacion como recoger objetos, colocarlos en recipientes, abrir cajones, etc.
- Procesamiento multimodal: integra vision (dos camaras) y estado del robot para tomar decisiones.
- Ejecucion en tiempo real: al ser un modelo compacto, puede ejecutarse a frecuencias adecuadas para control en bucle cerrado (10 FPS en el dataset).
- No soporta tool calling, generacion de texto libre ni capacidades de chat, ya que es un modelo especifico de robotica.

## Casos de uso

- Control de robots manipuladores en entornos simulados: el modelo puede desplegarse en simuladores como LIBERO o MuJoCo para evaluar politicas de manipulacion antes de transferirlas a hardware real.
- Automatizacion de tareas de pick-and-place: gracias a su entrenamiento en LIBERO, puede realizar tareas como colocar objetos en recipientes, apilar o mover utensilios, lo que es util en lineas de montaje o almacenes.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos de fine-tuning con LoRA o metodos de regularizacion, como se muestra en el repositorio de goelshivam1210/smolvla.
- Prototipado rapido de politicas de robot: al ser un modelo pequeno, permite iterar rapidamente en entornos de desarrollo con GPUs de consumo, sin necesidad de clusters de alto rendimiento.
- Evaluacion de generalizacion en robotica: al estar fine-tuneado en un subconjunto de tareas, puede usarse para estudiar la capacidad de generalizacion a nuevas configuraciones de objetos o instrucciones.
- Educacion y formacion en robotica: su tamano reducido y licencia Apache-2.0 lo hacen accesible para cursos universitarios o talleres donde se ensene VLA y aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint (`DiosStrike/smolvla-libero-test`). El paper original de SmolVLA (arXiv:2506.01844) reporta resultados en LIBERO y otros benchmarks, pero esos datos no estan disponibles en la informacion proporcionada. Ademas, existe un issue en el repositorio de LeRobot (issue #1369) que indica dificultades para replicar los resultados del paper, por lo que se recomienda precaucion al interpretar cualquier cifra de rendimiento.

## Requisitos de hardware

- VRAM estimada: con 450M parametros en FP32, el modelo ocupa aproximadamente 1.8 GB; en FP16, unos 0.9 GB. Con cuantizacion a 8 bits podria reducirse a ~0.5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia en FP16. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM para inferencia lenta.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en hardware de consumo, como se indica en la descripcion del paper.
- Opciones de despliegue: LeRobot (libreria principal), vLLM (si se adapta a un formato de lenguaje), llama.cpp (si se convierte a GGUF), o despliegue directo con PyTorch.
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo de 450M, se espera una latencia de decenas de milisegundos en GPU moderna, suficiente para control en tiempo real a 10 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | Apache-2.0 | Robotica, manipulacion |
| OpenVLA | 7B | no disponible | Apache-2.0 | Robotica, manipulacion |
| RT-2 (Google) | 55B | no disponible | Propietaria | Robotica, manipulacion |
| Octo | 1.5B | no disponible | MIT | Robotica, manipulacion |

SmolVLA es significativamente mas pequeno que OpenVLA y RT-2, lo que lo hace mas accesible para hardware de consumo, pero probablemente con menor capacidad de generalizacion. No se dispone de comparativas de rendimiento directas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en LIBERO: el modelo solo ha visto tareas de manipulacion en un entorno simulado con robot Panda, por lo que no generaliza a otros robots, entornos o tareas fuera de ese dominio.
- Fine-tuning muy corto: con solo 200 pasos de entrenamiento, es probable que el modelo no haya convergido completamente y su rendimiento sea inferior al del modelo base o al reportado en el paper.
- Problemas de reproducibilidad: existe un issue abierto en LeRobot (issue #1369) que reporta dificultades para replicar los resultados del paper SmolVLA, lo que sugiere que el rendimiento puede variar significativamente segun la configuracion.
- Sin soporte de lenguaje natural: no es un modelo de chat ni de generacion de texto; solo produce acciones de robot.
- Sesgos y alucinaciones: al ser un modelo de robotica, no aplica el concepto de alucinacion textual, pero puede generar acciones incorrectas si las observaciones estan fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DiosStrike/smolvla-libero-test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de fine-tuning con LoRA: https://github.com/goelshivam1210/smolvla
- Issue sobre reproducibilidad: https://github.com/huggingface/lerobot/issues/1369
