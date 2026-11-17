# jaaaa000/smolvla_so101_blue_sponge

## Resumen

SmolVLA es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Hugging Face y publicada en el paper arXiv:2506.01844. Este repositorio concreto, `jaaaa000/smolvla_so101_blue_sponge`, es un ajuste fino de `lerobot/smolvla_base` realizado por un usuario independiente para una única tarea de pick-and-place sobre un brazo robótico SO-101: recoger una esponja azul y depositarla en una bandeja blanca. El modelo resuelve el problema clásico de llevar un VLA genérico a una tarea física concreta con datos de demostración limitados.

El modelo tiene 450 millones de parámetros totales, de los cuales solo 100 millones se entrenaron durante el ajuste fino, manteniendo congelado el backbone visión-lenguaje. Se entrenó con 53 demostraciones teleoperadas durante 30.000 pasos con batch size 8 sobre una única RTX 3060 de 12 GB, sin aumento de datos de imagen. El resultado reportado por el autor es de 18 aciertos en 18 ensayos sobre el brazo real.

Su relevancia es práctica: demuestra que es posible adaptar un VLA de tamaño contenido a una tarea robótica específica con hardware de consumo y un dataset pequeño, algo que hasta hace poco requería infraestructura mucho mayor. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer con backbone VLM congelado y experto de acciones entrenado) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico; instrucciones en inglés en la tarea entrenada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un backbone visión-lenguaje que procesa las imágenes de cámara y la instrucción en lenguaje natural, acoplado a un módulo generador de acciones. En este ajuste fino el backbone VLM permaneció congelado y solo se entrenaron 100 de los 450 millones de parámetros, correspondientes al experto de acciones. La entrada son dos cámaras (superior y lateral, 640×480 a 30 fps) más las seis posiciones articulares del brazo SO-101.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `so101_blue_sponge_v2_20261109_212801`, compuesto por 53 demostraciones teleoperadas (todas las episodios salvo 5). Se ejecutaron 30.000 pasos con batch size 8 en una RTX 3060 de 12 GB, sin aumento de datos de imagen. El checkpoint publicado es el último del entrenamiento. En inferencia el autor empleó chunking en tiempo real (`--inference.type=rtc`).

## Capacidades

- Control robótico de pick-and-place: ejecuta la tarea "coger la esponja azul y ponerla en la bandeja blanca" sobre un brazo SO-101.
- Percepción visual multi-cámara: procesa simultáneamente vistas superior y lateral a 640×480 y 30 fps.
- Condicionamiento por lenguaje natural: acepta la instrucción textual de la tarea como entrada.
- Entrada propioceptiva: consume las seis posiciones articulares del brazo.
- Inferencia con chunking en tiempo real (RTC) para ejecución fluida en el robot.
- Generalización limitada a posiciones de inicio: el autor reporta éxito en 9 posiciones de la esponja, tanto recta como girada 45°.
- No soporta tool calling, agentes multi-paso, ni capacidades de texto generales: es una política de control, no un modelo conversacional.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta de forma autónoma el ciclo de recogida y depósito de la esponja azul en la bandeja, adecuado para validar flujos de manipulación con el SO-101 en laboratorio.
- Prototipado rápido de políticas VLA: sirve como plantilla para ajustar SmolVLA a nuevas tareas con pocas demos (53 en este caso) y una sola GPU de consumo.
- Benchmark de referencia para comparar arquitecturas: el autor publica también un modelo ACT entrenado con los mismos datos (`act_so101_blue_sponge`), lo que permite comparar VLA frente a ACT en idénticas condiciones.
- Docencia e investigación en robótica: el bajo coste de entrenamiento (RTX 3060, 30.000 pasos) lo hace viable para cursos y experimentos académicos.
- Evaluación de robustez ante variaciones: útil para estudiar la sensibilidad al color del objeto, dado que el autor documenta fallo total con una esponja amarilla.
- Integración en pipelines LeRobot: se carga directamente con la librería LeRobot 0.6.0 y se despliega con inferencia RTC sobre el robot real.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y partir de `lerobot/smolvla_base`, puede reentrenarse para otras tareas de manipulación.

## Benchmarks y rendimiento

El autor reporta un resultado de evaluación en el robot real, no benchmarks académicos estándar:

| Evaluación | Resultado |
|---|---|
| Tasa de éxito en brazo real (esponja azul) | 18/18 ensayos |
| Condiciones evaluadas | 9 posiciones de inicio, esponja recta y girada 45°, 30 s por ensayo |
| Tasa de éxito con esponja amarilla | 0/4 ensayos (fallo también con "yellow" en la instrucción) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al tratarse de una política robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: una RTX 3060 de 12 GB fue suficiente para 30.000 pasos con batch size 8 y backbone congelado.
- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (repo de 0.9 GB), la inferencia cabe holgadamente en GPUs de consumo de 8 GB o menos en precisión completa.
- GPU recomendadas: RTX 3060 o superior para entrenamiento; cualquier GPU consumer moderna para inferencia.
- Cabe en GPU consumer: sí, el propio autor entrenó e infirió en una RTX 3060.
- Opciones de despliegue: librería LeRobot 0.6.0 con inferencia en tiempo real (`--inference.type=rtc`). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el autor indica chunking en tiempo real para ejecución fluida, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_so101_blue_sponge | 450 M (100 M entrenados) | no disponible | 18/18 en brazo real (tarea única) | Apache 2.0 | Hugging Face |
| act_so101_blue_sponge (mismo autor) | no disponible | no disponible | no disponible en la información | no disponible | Hugging Face |
| lerobot/smolvla_base (modelo base) | 450 M | no disponible | no disponible | no disponible en la información | Hugging Face |

La comparación con el modelo ACT del mismo autor es la más directa, al haberse entrenado con los mismos datos, pero no se dispone de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo conoce esta esponja azul, esta posición de bandeja y esta iluminación; falló los 4 ensayos con una esponja amarilla, incluso indicando "yellow" en la instrucción.
- Sin generalización a otros objetos, tareas o entornos sin reentrenamiento.
- Riesgo de sobreajuste al dataset pequeño (53 demos) y a las condiciones de captura.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento ni conversación.
- Idiomas: no disponible; la instrucción entrenada está en inglés y no se documenta soporte multilingüe.
- Sesgos y alucinaciones en el sentido habitual no aplican, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento, con implicaciones de seguridad física en el robot.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- El checkpoint publicado es el último del entrenamiento, sin selección por validación documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaaaa000/smolvla_so101_blue_sponge
- Dataset de entrenamiento: https://huggingface.co/datasets/jaaaa000/so101_blue_sponge_v2_20261109_212801
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo ACT comparable: https://huggingface.co/jaaaa000/act_so101_blue_sponge
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
