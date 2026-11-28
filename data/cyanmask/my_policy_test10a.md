# CyanMask/my_policy_test10a

## Resumen

CyanMask/my_policy_test10a es una política de imitación para robótica entrenada con ACT (Action Chunking with Transformers) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular del robot y de una imagen de muñeca, predice directamente comandos de acción de 6 dimensiones. El repositorio lo mantiene el usuario CyanMask y su propósito declarado es ejecutar la tarea "Grab RED cube" sobre un robot de tipo `so_follower` (configuración de seguidor del SO-100/101 de LeRobot).

El modelo tiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB, un tamaño coherente con una política ACT de resolución 480x640 con backbone convolucional y codificador-transformador. Se entrenó durante 100.000 pasos con batch de 8 y learning rate 1e-5 sobre un dataset propio de solo 10 episodios y 6.748 fotogramas a 30 FPS, lo que lo sitúa en la categoría de prototipo o prueba de concepto más que en la de política lista para producción.

Su relevancia es fundamentalmente práctica para quien trabaja con LeRobot: sirve como ejemplo reproducible del flujo completo de grabación de datos, entrenamiento y despliegue con `lerobot-rollout`, y como referencia de las dimensiones de observación y acción esperadas en un `so_follower` con una única cámara de muñeca. No hay resultados de evaluación publicados ni licencia declarada, por lo que cualquier uso más allá de la experimentación debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación de un frame más estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución en robots reales. La política consume `observation.state` con forma `(6,)` y una imagen `observation.images.wrist` de `(3, 480, 640)` procedente de una cámara de muñeca, y produce una acción de forma `(6,)`. La implementación corresponde a la de LeRobot 0.7.1, que combina un backbone visual convolucional con un transformer encoder-decoder y una cabeza de predicción de chunks.

El entrenamiento se realizó sobre el dataset CyanMask/record-test_20261127_113824, compuesto por 10 episodios y 6.748 fotogramas a 30 FPS para la tarea "Grab RED cube". La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni se menciona RLHF, DPO ni ninguna innovación técnica adicional sobre el ACT original del paper 2304.13705.

## Capacidades

- Control visomotor de un robot `so_follower` con una cámara de muñeca a 640x480 y 30 FPS.
- Predicción de acciones de 6 grados de libertad a partir de estado articular e imagen.
- Ejecución de una única tarea de manipulación: "Grab RED cube".
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Prueba de concepto de agarre de objetos: la política se ejecuta con `lerobot-rollout` sobre un `so_follower` para verificar que el pipeline de LeRobot captura estado e imagen y emite acciones coherentes en la tarea "Grab RED cube".
- Validación de hardware y calibración: sirve para comprobar que la cámara de muñeca, el puerto del robot y las dimensiones de observación (`(6,)` de estado y `(3, 480, 640)` de imagen) coinciden con lo esperado antes de entrenar políticas propias.
- Referencia de formato de dataset: el repositorio enlaza el dataset de 10 episodios y 6.748 fotogramas, útil como plantilla para estructurar grabaciones propias con LeRobot.
- Base para fine-tuning: al ser una política ACT de tamaño reducido (51,7 M de parámetros), puede reentrenarse o ajustarse con datos adicionales en una GPU de consumo.
- Docencia y demostraciones: ejemplo mínimo y reproducible del ciclo completo de aprendizaje por imitación, desde la teleoperación hasta el despliegue.
- Comparación de métodos: punto de partida para contrastar ACT con otras políticas de LeRobot (diffusion policy, VQ-BeT) sobre la misma tarea y el mismo robot.
- No es adecuado para tareas distintas al agarre del cubo rojo ni para entornos con objetos, iluminación o posiciones no representados en los 10 episodios de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en safetensors (51,7 M de parámetros, repo de 0,2 GB); el consumo real lo dominan el buffer de imagen 480x640 y el runtime de LeRobot.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para no requerir hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2-4 GB de VRAM disponible.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) es el método documentado; también puede cargarse con la API de LeRobot en Python. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. Al ejecutarse a 30 FPS con una sola cámara, la latencia debe mantenerse por debajo de 33 ms por paso para control en tiempo real, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyanMask/my_policy_test10a (ACT) | 51,7 M | estado (6,) + imagen 480x640 | Agarre de cubo rojo en `so_follower` | no disponible | Hugging Face Hub |
| ACT original (paper 2304.13705) | no disponible | estado + imágenes | Manipulación general por imitación | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. diffusion policy, VQ-BeT) | no disponible | estado + imágenes | Manipulación por imitación | según implementación | Hugging Face Hub / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada con solo 10 episodios y 6.748 fotogramas: la generalización es muy limitada y probablemente fallará ante posiciones, iluminación u objetos distintos a los vistos.
- Una única tarea ("Grab RED cube") y una única cámara de muñeca; no hay visión de tercera persona ni redundancia sensorial.
- Sin resultados de evaluación en robot real: no se conoce la tasa de éxito ni la robustez.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Riesgo de sobreajuste y de comportamiento errático fuera de la distribución de entrenamiento, habitual en políticas de imitación con pocos datos.
- Dependencia de la versión de LeRobot 0.7.1 y de los nombres exactos de las claves de observación (`observation.state`, `observation.images.wrist`); cambios de nombre o de forma rompen la inferencia.
- No es un modelo de lenguaje: no procesa texto libre, no razona simbólicamente y no soporta instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Los sesgos del dataset de demostraciones (posiciones, velocidades y estilo del teleoperador) se transfieren directamente a la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanMask/my_policy_test10a
- Dataset de entrenamiento: https://huggingface.co/datasets/CyanMask/record-test_20261127_113824
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=CyanMask/record-test_20261127_113824
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
