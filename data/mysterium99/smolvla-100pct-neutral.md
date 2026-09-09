# mysterium99/smolvla-100pct-neutral

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente, presentado originalmente por el equipo de Hugging Face y ahora liberado en forma de fine-tuning por el autor `mysterium99`. Este modelo concreto, `smolvla-100pct-neutral`, se deriva de la base `lerobot/smolvla_base` y está diseñado para tareas de robótica de manipulación, donde traduce observaciones visuales y de estado en acciones motoras de baja dimensión. Su relevancia radica en que permite ejecutar políticas robóticas competentes en hardware de consumo, reduciendo el coste computacional frente a alternativas de mayor tamaño.

Con 450.046.176 parámetros y 0,9 GB de pesos en formato `safetensors`, el modelo mantiene una arquitectura multimodal basada en un transformer ligero que combina un codificador de imágenes con un modelo de lenguaje compacto. Se ha entrenado mediante clonación de comportamiento sobre el dataset `default_merged`, compuesto por 150 episodios y 83.987 fotogramas a 30 FPS, en tres tareas de manipulación con un robot tipo `Follower`. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper `2506.01844`, que integra un codificador de visión (tipo SigLIP) con un modelo de lenguaje pequeño (SmolLM2) y una cabeza de acción proyectada a un espacio de 6 dimensiones. Esta composición permite que el modelo procese imágenes RGB de 256x256 de hasta tres cámaras junto con un vector de estado de tamaño 6, y genere directamente una acción motora.

El fine-tuning se realizó sobre la base `lerobot/smolvla_base` con el dataset `default_merged`, que contiene demostraciones humanas de 150 episodios a 30 FPS. El proceso de entrenamiento usó 20.000 pasos, batch de 8, optimizador AdamW y learning rate de 1e-4, bajo la versión 0.6.1 de LeRobot. No se emplearon técnicas de RLHF ni DPO; el aprendizaje es puramente por imitación.

## Capacidades

- Generación de acciones robóticas: produce vectores de acción de dimensión 6 (por ejemplo, posiciones o velocidades articulares) a partir de observaciones.
- Percepción multimodal: procesa hasta tres imágenes RGB de 256x256 y un estado de 6 dimensiones como entrada.
- Aprendizaje por imitación: ha sido entrenado con demostraciones humanas y puede reproducir comportamientos complejos de manipulación.
- Control de robots tipo `Follower` en el ecosistema LeRobot: integrado con `lerobot-rollout` para ejecutar políticas en tiempo real.
- No soporta tool calling ni generación de texto en lenguaje natural: es un policy de control, no un modelo de propósito general.
- Capacidades multilingües: no aplica, ya que no procesa texto como entrada.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo puede controlar un brazo robótico para empujar un bloque hacia un área marcada, utilizando imágenes de la cámara superior y lateral. Es adecuado porque su tamaño compacto permite inferencia en PCs de consumo sin necesidad de clústeres.
- Recogida y colocación de piezas: en tareas de `pick and place`, el modelo toma un cubo y lo introduce en un contenedor, respondiendo a las variaciones de posición de los objetos mediante las entradas visuales.
- Clasificación de objetos por atributo: por ejemplo, reunir todos los bloques amarillos en un contenedor. Esta tarea se beneficia del aprendizaje por imitación sobre demostraciones reales.
- Automatización de ensamblaje en entornos controlados: el modelo puede integrarse en un pipeline de producción donde se requieran movimientos repetitivos de 6 grados de libertad, siempre que se disponga de un dataset específico para la tarea.
- Investigación en aprendizaje por imitación: sirve como baseline de bajo coste para evaluar algoritmos de control robótico en entornos académicos, dada su disponibilidad en LeRobot.
- Robótica educativa: al poder ejecutarse en GPUs de gama media, facilita la docencia de sistemas de control y aprendizaje por refuerzo en cursos de robótica, donde los estudiantes pueden entrenar y desplegar políticas en robots `Follower`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye evaluaciones de éxito en tareas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 0,9 GB; con activaciones e imágenes, se recomienda una GPU con al menos 4 GB de VRAM.
- GPU recomendadas: RTX 2060, RTX 3060, RTX 4060 o equivalentes. Para entrenamiento o fine-tuning se recomiendan 8 GB o más.
- Compatibilidad con hardware de consumo: sí, el modelo está diseñado para desplegarse en equipos domésticos o estaciones de trabajo con GPUs modestas.
- Opciones de despliegue: LeRobot (a través de `lerobot-rollout`), que soporta tanto CUDA como CPU, y carga directa de pesos `safetensors` con la librería `lerobot`.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla-100pct-neutral | 450.046.176 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible (base de este modelo) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7.000.000.000 aprox. | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede fallar ante variaciones no vistas en iluminación, texturas de objetos o posiciones de las cámaras, ya que el dataset de entrenamiento es limitado (150 episodios).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede generar acciones incorrectas si la observación no es coherente con el entrenamiento.
- Limitaciones de idioma: este modelo no procesa instrucciones en lenguaje natural; solo utiliza estado e imágenes como entradas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el dataset `default_merged` no tenga términos adicionales.
- Caveat para producción: no se han publicado evaluaciones de éxito, por lo que el rendimiento debe validarse exhaustivamente en el hardware y entorno objetivo antes de un despliegue en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mysterium99/smolvla-100pct-neutral
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset default_merged: https://huggingface.co/datasets/default_merged
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
