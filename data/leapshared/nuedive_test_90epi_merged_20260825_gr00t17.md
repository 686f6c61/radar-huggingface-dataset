# leapshared/nuedive_test_90epi_merged_20260825_GR00T17

## Resumen

El modelo `leapshared/nuedive_test_90epi_merged_20260825_GR00T17` es una política visuomotora para robótica, entrenada mediante aprendizaje por imitación con la librería LeRobot de Hugging Face. Desarrollado por el usuario `leapshared`, el modelo está basado en la arquitectura GR00T de NVIDIA, con los pesos congelados en precisión bf16 (`groot_frozen_bf16`). Su propósito es controlar un robot bimanual de tipo `bi_openarm_follower` para ejecutar una tarea concreta de manipulación: abrir una mochila, introducir objetos en ella y cerrarla.

El modelo se ha entrenado sobre un dataset propio de 90 episodios (114.472 fotogramas a 30 FPS) y cuenta con 3.144 millones de parámetros. Al ser una política de robótica, no procesa texto ni lenguaje natural, sino que recibe observaciones de tres cámaras (una frontal y dos de muñeca) junto con el estado del robot (16 valores) y produce acciones de control (16 valores). Su relevancia radica en ser un ejemplo de aplicación de modelos GR00T congelados en el ecosistema LeRobot, permitiendo a la comunidad reproducir y adaptar el entrenamiento para tareas similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora basada en GR00T (NVIDIA) congelado, implementada en LeRobot |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa observaciones de imágenes y estado, no texto) |
| Tipos de cuantizacion | No disponible (solo pesos en bf16) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GR00T de NVIDIA, congelada en precisión bf16, como extractor de características visuales y motor de control. Se trata de una política de aprendizaje por imitación supervisada, sin refuerzo ni optimización por preferencias humanas (RLHF/DPO). El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el optimizador AdamW con una tasa de aprendizaje de 0.0001, batch size de 16 y un total de 31.121 pasos. El dataset de entrenamiento contiene 90 episodios de la tarea "Open the backpack. Put things in the backpack. Close the backpack.", con 114.472 fotogramas a 30 FPS, capturados con tres cámaras (una frontal y dos de muñeca). No se han publicado detalles sobre la composición exacta del dataset ni sobre técnicas de aumento de datos.

## Capacidades

- Control de robot bimanual: genera acciones de 16 dimensiones para el robot `bi_openarm_follower`, coordinando ambos brazos.
- Percepción visual multimodal: procesa simultáneamente tres flujos de imagen (cámara frontal y dos de muñeca) a resolución 480x640.
- Ejecución de tareas de manipulación: entrenado específicamente para abrir una mochila, colocar objetos en su interior y cerrarla.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Empaquetado automatizado en logística: el modelo puede ejecutar la tarea de abrir un contenedor (mochila), introducir objetos y cerrarlo, lo que resulta útil en líneas de preparación de pedidos o clasificación de mercancías.
- Manipulación de objetos en entornos domésticos: sirve como base para desarrollar asistentes robóticos que ayuden a guardar objetos en bolsas o mochilas, por ejemplo en tareas de organización del hogar.
- Investigación en aprendizaje por imitación: permite a investigadores estudiar el comportamiento de políticas GR00T congeladas en tareas de manipulación bimanual, comparando con otras arquitecturas como ACT o Diffusion Policy.
- Desarrollo de habilidades robóticas transferibles: al estar entrenado con un dataset relativamente pequeño (90 episodios), sirve como punto de partida para probar técnicas de fine-tuning o adaptación a nuevas tareas similares.
- Evaluación de robustez en entornos controlados: puede utilizarse en laboratorios para medir la repetibilidad y precisión de movimientos en tareas de pick-and-place con objetos variados.
- Demostraciones educativas: en cursos de robótica, el modelo permite ilustrar el flujo completo de entrenamiento y despliegue de una política visuomotora con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet."). Por tanto, no se dispone de métricas de éxito, tasa de completado ni comparativas con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la model card.
- Dado que el modelo tiene 3.144 millones de parámetros en bf16, los pesos ocupan aproximadamente 6,3 GB en memoria.
- Al procesar tres imágenes de 480x640 por paso, se requiere memoria adicional para los tensores de entrada y las activaciones.
- Se estima que una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) sería suficiente para inferencia en tiempo real, aunque no hay datos confirmados.
- Para entrenamiento o fine-tuning, se recomienda una GPU con 24 GB o más (RTX 3090, A100, H100) debido al mayor uso de memoria durante el backpropagation.
- El despliegue se realiza mediante LeRobot, que soporta ejecución en local con `lerobot-rollout` y requiere el robot `bi_openarm_follower` conectado.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (políticas visuomotoras basadas en GR00T congelado) dentro de la información proporcionada. Otras políticas de LeRobot como ACT o Diffusion Policy existen, pero no se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (abrir mochila, meter objetos, cerrar) y no generaliza a otras tareas sin reentrenamiento.
- No se han realizado evaluaciones en robot real, por lo que se desconoce su tasa de éxito y robustez ante variaciones de iluminación, posición de objetos o distracciones.
- El dataset de entrenamiento es pequeño (90 episodios), lo que aumenta el riesgo de sobreajuste a las condiciones específicas de captura.
- Al ser una política congelada (frozen), no se puede adaptar el extractor de características sin descongelar partes del modelo, lo que limita la transferencia a nuevos dominios.
- No se han documentado sesgos específicos, pero al ser un modelo de robótica, los sesgos podrían manifestarse en comportamientos inseguros si se usa fuera de entornos controlados.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el robot y el entorno cumplen con las normativas de seguridad aplicables.
- El modelo requiere el robot `bi_openarm_follower` y las cámaras específicas (follower_d455f, left_wrist, right_wrist) para funcionar; no es compatible con otros hardware sin modificación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/leapshared/nuedive_test_90epi_merged_20260825_GR00T17)
- [Dataset de entrenamiento](https://huggingface.co/datasets/leapshared/nuedive_test_90epi_merged_20260825)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
