# gafogafo/smolvla_whackamole_2026-11-21_16-42-36

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta corresponde a un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `gafogafo` para la tarea específica de "whack-a-mole" (golpear un punto azul con un martillo amarillo y devolverlo a una zona roja) sobre un robot de tipo `so_follower`. El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve el problema de la política de imitación robótica de bajo coste: aprender una política visuomotora que mapee imágenes de varias cámaras y el estado de las articulaciones a comandos de acción de 6 dimensiones, todo ello ejecutable en hardware de consumo. Frente a los VLA de gran escala (decenas de miles de millones de parámetros), SmolVLA apuesta por un diseño eficiente que reduce el coste computacional manteniendo un rendimiento competitivo en tareas de manipulación, tal y como se describe en el paper arXiv:2506.01844.

Este checkpoint es relevante como ejemplo práctico de fine-tuning de SmolVLA con LeRobot 0.7.1: 99 episodios, 48.378 frames a 30 FPS y 20.000 pasos de entrenamiento con batch de 64 y optimizador AdamW. No obstante, el autor no ha publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta basada en SmolVLA (transformer multimodal con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ecosistema LeRobot soporta ejecución en FP32/BF16 según configuración, pero no se documentan cuantizaciones específicas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en inglés en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 5,3 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual (procesa imágenes de cámaras a 256×256 y 480×640) con un componente de lenguaje que interpreta la instrucción de tarea, y un cabezal de acciones que produce un vector de 6 dimensiones (`action`). La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional para permitir despliegue en hardware de consumo. El modelo base `lerobot/smolvla_base` se ha preentrenado sobre datos de robótica y se fine-tunea por imitación supervisada (behavior cloning) sobre datasets de demostraciones.

Este checkpoint concreto se ha entrenado sobre el dataset `gafogafo/fullDataWhackAMole`: 99 episodios, 48.378 frames a 30 FPS, con una única tarea descrita en lenguaje natural ("Reach out toward the yellow hammer..."). La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de un fine-tuning de imitación puro. El modelo consume seis entradas visuales (tres cámaras de 256×256 y dos de 480×640, más un estado de 6 dimensiones) y produce acciones de 6 dimensiones, lo que corresponde a un robot `so_follower` con cámara de muñeca.

## Capacidades

- Control robótico visuomotor: genera comandos de acción de 6 dimensiones a partir de observaciones visuales multicámara y del estado de las articulaciones.
- Ejecución de tareas de manipulación guiadas por lenguaje natural: interpreta una instrucción textual de tarea y la traduce en una secuencia de acciones.
- Percepción visual multicámara: procesa simultáneamente hasta cinco flujos de imagen (tres a 256×256 y dos a 480×640).
- Aprendizaje por imitación: política entrenada mediante behavior cloning sobre demostraciones humanas.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite ejecución en GPUs de gama media.
- Integración con LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas ni generación de texto libre; el modelo está especializado en acción robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar la secuencia completa de alcanzar, agarrar, levantar, golpear y devolver un objeto, usando las cámaras para localizar el objetivo y el estado articular para controlar el brazo.
- Prototipado rápido de políticas robóticas: al partir de `lerobot/smolvla_base` y entrenar con 99 episodios en 20.000 pasos, sirve como plantilla para validar un pipeline de imitación en un robot `so_follower` antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de fine-tuning de SmolVLA con una configuración documentada (AdamW, lr 1e-4, batch 64) y comparar curvas de entrenamiento.
- Demostraciones educativas de VLA: su tamaño de 450 M y su licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se enseña a entrenar y desplegar políticas visuomotoras en hardware asequible.
- Benchmarking de robustez visual: al depender de cinco cámaras con resoluciones distintas, permite estudiar cómo afectan cambios de iluminación, posición de objetos o cámaras adicionales al éxito de la política.
- Integración en entornos de simulación-a-realidad: el checkpoint puede evaluarse en simuladores compatibles con LeRobot antes de transferirlo al robot físico, reduciendo el desgaste del hardware durante las pruebas.
- Base para tareas de golpeo preciso: la tarea de "whack-a-mole" es un caso representativo de manipulación con contacto (golpear un punto concreto), útil para estudiar control fino y precisión en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, en FP32 los pesos ocupan aproximadamente 1,8 GB; en BF16/FP16, unos 0,9 GB. A ello hay que sumar el coste de procesar hasta cinco flujos de imagen (tres a 256×256 y dos a 480×640), que puede añadir varios cientos de MB según el batch y la implementación.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia en FP16/BF16; se recomiendan RTX 3060/4060 o superiores para comodidad, y A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y GPUs similares con 8 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. La model card no proporciona mediciones de frecuencia de control ni de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_whackamole_2026-11-21_16-42-36 (este) | 450 M | no disponible | Manipulación robótica (whack-a-mole) | Apache 2.0 | Hugging Face, vía LeRobot |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA base para fine-tuning | Apache 2.0 (según repositorio base) | Hugging Face |
| Políticas de imitación tipo ACT/DP (LeRobot) | no disponible | no disponible | Manipulación robótica | varía | Hugging Face / LeRobot |
| VLA de gran escala (p. ej., familias tipo OpenVLA) | no disponible | no disponible | Manipulación robótica general | varía | Hugging Face |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de rendimiento para este checkpoint ni se dispone de cifras verificadas de los modelos comparables en la información proporcionada. La principal ventaja diferencial de este modelo es su tamaño reducido (450 M) y su licencia permisiva, que facilitan el despliegue en hardware de consumo.

## Limitaciones y advertencias

- Ausencia de evaluación: el autor no ha publicado tasas de éxito en robot real, por lo que se desconoce si la política funciona de forma fiable fuera del dataset de entrenamiento.
- Sobreajuste al entorno de entrenamiento: entrenado con 99 episodios de una única tarea y un único robot `so_follower`, es probable que no generalice a otras posiciones de objetos, iluminaciones, robots o tareas.
- Dependencia de la configuración de cámaras: el modelo espera exactamente seis entradas visuales con nombres y resoluciones concretas (`camera1`, `camera2`, `camera3`, `empty_camera_0`, `empty_camera_1`); un cambio en la configuración de cámaras invalida la inferencia.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante situaciones no vistas, con riesgo de colisiones o daños en el robot y el entorno.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés y no hay evidencia de que el modelo interprete instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base puede tener sus propias condiciones que conviene revisar.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gafogafo/smolvla_whackamole_2026-11-21_16-42-36
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/gafogafo/fullDataWhackAMole
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gafogafo/fullDataWhackAMole
