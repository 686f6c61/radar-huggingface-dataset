# hubnemo/so101_smolvla_lora_v2_02_overfit_vlm_exp_r128_noaug_80k

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre [SmolVLA](https://huggingface.co/papers/2506.01844), el modelo vision-language-action (VLA) compacto desarrollado por el equipo de Hugging Face dentro del proyecto LeRobot. La finalidad del adaptador es controlar un brazo robótico SO101 (so101_follower) para una tarea concreta de manipulación: agarrar un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos presentes en la escena.

El modelo base es `lerobot/smolvla_base`, un VLA de tamaño reducido diseñado para ofrecer un rendimiento competitivo con un coste computacional bajo, hasta el punto de poder desplegarse en hardware de consumo. El adaptador fue entrenado por el usuario `hubnemo` con el dataset `Orellius/so101_sort_cubes_no_top` (77 episodios, 54.777 fotogramas a 30 FPS) durante 80.000 pasos, y el propio nombre del repositorio sugiere que se trata de un experimento de sobreajuste ("overfit") con rango LoRA 128, sin aumento de datos y con componentes VLM activados.

Su relevancia actual radica en que demuestra el flujo de trabajo completo de LeRobot: tomar un modelo base abierto, ajustarlo con datos de teleoperación de un robot de bajo coste y desplegar la política directamente en el robot mediante la CLI de LeRobot. Es un ejemplo representativo de la tendencia de 2025-2026 hacia políticas robóticas ligeras, reproducibles y accesibles para aficionados e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo vision-language-action), adaptador LoRA sobre lerobot/smolvla_base |
| Parametros totales | no disponible (tamaño del repo: 0,3 GB, correspondiente al adaptador LoRA r=128) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería lerobot) |

Especificaciones adicionales de la política:

| Parametro | Valor |
|---|---|
| Robot | so101_follower |
| Camaras | front |
| Entrada: observation.state | forma (6,) |
| Entrada: observation.images.front | forma (3, 480, 640) |
| Salida: action | forma (6,) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un backbone de visión-lenguaje con una cabeza de acción para generar comandos de control continuo en un robot. Según el paper asociado (arXiv:2506.01844), está diseñado para lograr un rendimiento competitivo con costes computacionales reducidos, siendo desplegable en hardware de consumo; incorpora técnicas de eficiencia como el uso de un VLM reducido y decodificación asincrónica de acciones por chunks (flow matching), aunque los detalles concretos no constan en la información disponible para este adaptador.

El adaptador se entrenó mediante aprendizaje por imitación sobre el dataset `Orellius/so101_sort_cubes_no_top`, que contiene 77 episodios y 54.777 fotogramas grabados a 30 FPS con la cámara frontal del SO101. La configuración de entrenamiento fue: 80.000 pasos, batch size 8, optimizador AdamW con learning rate 0.0005, semilla 1000 y versión 0.7.1 de LeRobot. El nombre del repositorio indica un rango LoRA de 128 (`r128`), desactivación de aumento de datos (`noaug`) y una intención explícita de sobreajuste sobre el dataset (`overfit_vlm_exp`), es decir, un experimento controlado para evaluar la capacidad del modelo de memorizar y ejecutar una única tarea. No se dispone de información sobre RLHF/DPO, que no aplica a este tipo de políticas de imitación.

## Capacidades

- Generación de acciones de control continuo (6 grados de libertad) para el brazo robótico SO101 a partir de observaciones visuales y de estado.
- Comprensión visual de la escena: procesa imágenes RGB de 480x640 de la cámara frontal para localizar el cubo morado objetivo.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica como texto ("Grab the purple cube and put it into the cardboard box, ignore the other objects"), aprovechando el componente VLM del modelo base.
- Robustez frente a distractores: la tarea de entrenamiento incluye explícitamente objetos que deben ignorarse.
- Inferencia local en hardware de consumo gracias al tamaño reducido de SmolVLA.
- No soporta: generación de texto conversacional, tool calling, agentes ni razonamiento multi-paso; es una política robótica especializada, no un chatbot.

## Casos de uso

- Clasificación de objetos en mesas de trabajo: el modelo puede ejecutar de forma autónoma la tarea exacta para la que fue entrenado, agarrando cubos morados y depositándolos en una caja, útil para demos educativas y prototipos de laboratorio.
- Validación de pipelines de aprendizaje por imitación: al ser un experimento de sobreajuste documentado, sirve como caso de prueba para verificar que el flujo de entrenamiento de LeRobot (grabación de dataset, fine-tuning LoRA, rollout) funciona de extremo a extremo.
- Investigación sobre adaptadores LoRA en políticas VLA: el rango 128 y la ausencia de aumento de datos lo hacen adecuado para estudiar cómo el sobreajuste afecta a la generalización de políticas robóticas ligeras.
- Docencia y formación en robótica: con un SO101 (robot de bajo coste de Hugging Face), un instructor puede mostrar en directo cómo una política entrenada con 77 episodios de teleoperación ejecuta una tarea de manipulación.
- Punto de partida para fine-tuning adicional: partiendo de este adaptador o del mismo dataset, un desarrollador puede entrenar variantes con aumento de datos o más episodes para mejorar la robustez ante nuevas posiciones de objetos.
- Automatización de tareas repetitivas de pick-and-place de bajo riesgo en entornos controlados, como mover piezas específicas entre contenedores en un banco de pruebas, siempre que la escena coincida con la del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se han publicado tasas de éxito en el robot real para esta política. Los benchmarks generales de SmolVLA (el modelo base) pueden consultarse en el paper arXiv:2506.01844, pero no aplican directamente a este adaptador fine-tuned.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no obstante, el paper de SmolVLA indica que el modelo base está diseñado para ejecutarse en hardware de consumo, por lo que una GPU de gama media (por ejemplo, una RTX 3060 con 8-12 GB de VRAM o superior) debería ser suficiente para la inferencia del adaptador.
- GPU recomendadas: no disponible; cualquier GPU compatible con CUDA que soporte PyTorch y la librería lerobot es candidata (RTX 3060/4090 para consumo; A100/H100 solo necesarias para reentrenar, no para inferir).
- Consumer GPU: sí, cabe en consumer GPU; el propio SmolVLA se promociona como desplegable en hardware de consumo y el tamaño del adaptador es de solo 0,3 GB.
- Opciones de despliegue: la vía soportada es la librería LeRobot (pip `lerobot`), ejecutando la política con `lerobot-rollout` apuntando al repositorio de Hugging Face. No aplica vLLM, TGI ni Ollama, al no ser un LLM conversacional; llama.cpp tampoco es la vía prevista.
- Latencia y throughput: no disponible; el frame rate de entrenamiento fue de 30 FPS, y SmolVLA está optimizado para inferencia en tiempo real en robots de bajo coste, pero no se publican cifras concretas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubnemo/so101_smolvla_lora_v2_02_overfit_vlm_exp_r128_noaug_80k | Adaptador LoRA VLA (SO101, tarea de cubo morado) | no disponible (repo 0,3 GB) | estado (6,) + imagen 480x640 | Apache-2.0 | Público en Hugging Face, 0 descargas |
| lerobot/smolvla_base | Modelo base VLA de LeRobot | no disponible | imágenes + estado + instrucción de lenguaje | Apache-2.0 | Público, modelo base oficial |
| π0 (Physical Intelligence, versión open de LeRobot) | VLA de mayor tamaño para manipulación | no disponible | imágenes + estado + lenguaje | no disponible | Disponible vía LeRobot para varios robots |

Este adaptador se diferencia de los anteriores en que está especializado en una única tarea y un único robot (SO101 con cámara frontal), mientras que el modelo base y alternativas como π0 son políticas más generales que requieren fine-tuning por tarea.

## Limitaciones y advertencias

- Sobreajuste deliberado: el nombre del repositorio indica que se trata de un experimento de sobreajuste sin aumento de datos; es muy probable que la política falle ante variaciones de iluminación, posiciones de objetos no vistas, fondos distintos o distractores nuevos.
- Especificidad de hardware: entrenada para `so101_follower` con una única cámara `front`; no funcionará sin ajustes en otros robots o configuraciones de cámaras, y los nombres de las cámaras en la inferencia deben coincidir exactamente con las claves de observación del entrenamiento.
- Tarea única: solo ha sido entrenada para la tarea "Grab the purple cube and put it into the cardboard box, ignore the other objects"; no generaliza a otras instrucciones.
- Sin evaluación publicada: no existen tasas de éxito verificadas, por lo que no debe asumirse fiabilidad para producción sin pruebas propias en el robot real.
- Riesgo inherente a políticas de imitación: como todo modelo de imitación entrenado con pocos episodios (77), puede presentar alucinaciones conductuales (acciones erróneas ante estados fuera de distribución) y comportamientos de manera impredecible; se recomienda supervisión humana y parada de emergencia durante los rollouts.
- Sesgos: hereda los sesgos del dataset de teleoperación (un solo operador, una sola disposición de escena); no se han documentado sesgos específicos.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial, aunque el hardware robótico y la seguridad de despliegue son responsabilidad del usuario.
- Adopción nula registrada: 0 descargas y 0 likes en el momento de la ficha, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hubnemo/so101_smolvla_lora_v2_02_overfit_vlm_exp_r128_noaug_80k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
