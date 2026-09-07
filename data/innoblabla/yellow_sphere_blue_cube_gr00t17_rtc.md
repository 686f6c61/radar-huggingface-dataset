# innoblabla/yellow_sphere_blue_cube_GR00T17_rtc

## Resumen

Este modelo es una política de robótica (policy) entrenada con LeRobot y basada en GR00T N1.7 de NVIDIA, un modelo fundacional abierto de razonamiento y habilidades para robots humanoides. Resuelve tareas de manipulación de objetos, concretamente recoger una esfera amarilla o un cubo azul y colocarlos en una copa. El modelo está publicado por el usuario innoblabla y utiliza el pipeline de robótica de Hugging Face.

Su arquitectura combina un backbone multimodal Cosmos-Reason2/Qwen3-VL con un action transformer basado en flow matching, que predice acciones de control a partir de observaciones visuales y del estado del robot. El modelo tiene 3.144.016.000 parámetros (aproximadamente 3.144 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 12.6 GB. No se dispone de datos sobre la longitud de contexto, ya que no es un modelo de lenguaje puro.

La relevancia de este modelo radica en su naturaleza open source (licencia Apache 2.0) y su integración con el ecosistema LeRobot, lo que permite a investigadores y desarrolladores reproducir y entrenar políticas de control para robots sin necesidad de una infraestructura masiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Cosmos-Reason2/Qwen3-VL y action transformer de flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una política de control entrenada con LeRobot, basada en el framework GR00T N1.7 de NVIDIA. La arquitectura se compone de un backbone multimodal (Cosmos-Reason2/Qwen3-VL) que procesa entradas de visión y lenguaje, junto a un action transformer que emplea flow matching para predecir acciones de 6 dimensiones. Este diseño permite condicionar la salida de control a la observación visual (tres cámaras: `pince`, `base`, `top`), al estado propioceptivo del robot y a la instrucción de tarea en lenguaje natural.

El entrenamiento se realizó sobre el dataset `innoblabla/yellow_sphere_blue_cube`, que contiene 120 episodios y 46.228 frames a 30 FPS. Las tareas son dos: recoger la esfera amarilla y colocarla en la copa, y recoger el cubo azul y colocarlo en la copa. La configuración de entrenamiento incluye 20.000 pasos, batch size 24, optimizador AdamW, learning rate 0.0001, seed 42 y LeRobot versión 0.6.1. No se menciona uso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Predicción de acciones de control de 6 dimensiones para un robot tipo `so_follower`.
- Entrada multimodal: imágenes de tres cámaras (480x640) y estado del robot (6 valores).
- Comprensión de instrucciones de tarea en lenguaje natural para dos tareas concretas de manipulación.
- Generación de acciones condicionadas a la observación visual y al estado propioceptivo.
- Soporte de ejecución en tiempo real mediante el framework LeRobot (`lerobot-rollout`).
- No soporta tool calling ni razonamiento multi-step en el sentido de un LLM; su salida es una acción de control continuo.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede ejecutar la recogida y colocación de objetos en una copa, integrado en un sistema robótico con tres cámaras.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar políticas basadas en GR00T en entornos de laboratorio, usando LeRobot para reproducir el entrenamiento.
- Teleoperación asistida: el modelo puede actuar como asistente en tareas de manipulación, generando acciones que complementan o corrigen la entrada del operador.
- Prototipado rápido de políticas robóticas: permite a equipos pequeños entrenar y desplegar políticas de control sin necesidad de datos masivos ni infraestructura de gran escala.
- Educación y demostraciones en robótica: útil en cursos o talleres para ilustrar el pipeline completo de LeRobot, desde la grabación de datos hasta la ejecución de una política.
- Evaluación de generalización cross-embodiment: al basarse en GR00T N1.7, puede usarse para estudiar la transferencia de habilidades entre distintas morfologías robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12.6 GB, lo que corresponde a pesos en fp32. Se estima un consumo de aproximadamente 12.6 GB en fp32, 6.3 GB en bf16 y 3.1 GB en int8 si se aplica cuantización posterior.
- GPU recomendadas: A100 40GB o H100 para fp32; RTX 4090 24GB para bf16; RTX 3090 o 4090 para int8.
- Cabe en GPU de consumo: sí, en bf16 o int8 con una RTX 4090 o superior.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No aplica vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos publicados para este modelo. Existen otras políticas de innoblabla en Hugging Face, como `innoblabla/yellow_sphere_blue_cube_GR00T17` o `innoblabla/cube_3cam_final_GR00T17`, pero no se dispone de especificaciones ni resultados de evaluación para realizar una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo fue entrenado con solo 120 episodios y dos tareas, por lo que puede fallar ante variaciones de iluminación, posiciones o distracciones no presentes en los datos.
- Riesgo de alucinación de acciones: si la observación no coincide con las distribuciones vistas en el entrenamiento, el modelo puede generar acciones incorrectas o inestables.
- Limitaciones de contexto: solo acepta tres cámaras fijas (pince, base, top) y estado propioceptivo de 6 dimensiones; no soporta entradas adicionales ni percepción de profundidad.
- Evaluación no verificada: no se han publicado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar la seguridad y el comportamiento de la política en su aplicación concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/innoblabla/yellow_sphere_blue_cube_GR00T17_rtc
- Dataset de entrenamiento: https://huggingface.co/datasets/innoblabla/yellow_sphere_blue_cube
- Repositorio de Isaac-GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo relacionado (sin sufijo `_rtc`): https://huggingface.co/innoblabla/yellow_sphere_blue_cube_GR00T17
- Modelo relacionado (`cube_3cam_final_GR00T17`): https://huggingface.co/innoblabla/cube_3cam_final_GR00T17
