# adrfm/sort_b601_simple_filtered_turbovla_v1

## Resumen

El modelo `adrfm/sort_b601_simple_filtered_turbovla_v1` es una política de control robótico basada en la arquitectura TurboVLA, entrenada con el framework LeRobot de Hugging Face. Está diseñada para ejecutar una tarea de manipulación concreta: recoger discos de un plato gris y colocarlos según su color (disco negro en plato rojo, disco blanco en plato azul). El modelo fue desarrollado por el usuario `adrfm` y publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

TurboVLA es una familia de modelos visión-lenguaje-acción (VLA) que, a diferencia de los enfoques centrados en grandes modelos de lenguaje, mapea directamente observaciones visuales y de estado a acciones, logrando una inferencia en tiempo real con bajo consumo de memoria. Este modelo concreto tiene 209 millones de parámetros y un tamaño de repositorio de 0,8 GB, lo que lo hace adecuado para GPUs de consumo. Su relevancia radica en ser un ejemplo práctico de despliegue de un VLA eficiente en un robot real, con un pipeline de entrenamiento reproducible mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TurboVLA (vision-language-action, variante `turbovla_so101`) |
| Parametros totales | 209.309.191 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TurboVLA, descrita en el paper "TurboVLA: Real-Time Vision-Language-Action Model at 32 Hz on an RTX 4090 with <1 GB VRAM". A diferencia de los VLA convencionales que proyectan observaciones visuales en el espacio de representación de un LLM antes de decodificar acciones, TurboVLA diseña un mapeo directo de visión y lenguaje a acciones, reduciendo la carga computacional y de memoria en cada invocación. La variante `turbovla_so101` es la implementación específica utilizada en este repositorio, integrada en LeRobot.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre un dataset de demostraciones humanas. El dataset `adrfm/sort_b601_simple_filtered` contiene 35 episodios y 34.012 fotogramas a 30 FPS, capturados con dos cámaras (lateral y de muñeca) en un robot Seeed B601. La configuración de entrenamiento incluye 43.000 pasos, batch size de 8, optimizador AdamW con learning rate 5e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición y orientación del efector final) a partir de observaciones de estado y dos imágenes RGB.
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara lateral y de muñeca, ambas de resolución 480x640.
- Ejecución en tiempo real: según el paper de TurboVLA, la arquitectura alcanza 32 Hz en una RTX 4090 con menos de 1 GB de VRAM, lo que permite control en bucle cerrado.
- Especialización en tareas de clasificación y colocación de objetos: el modelo está entrenado para una tarea concreta (discos de colores en platos específicos), no es un agente generalista.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de líneas de clasificación: el modelo puede integrarse en un brazo robótico Seeed B601 para separar piezas por color o forma en entornos industriales, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA eficientes a nuevas tareas, ya que su entrenamiento con LeRobot es reproducible y modificable.
- Prototipado rápido de manipulación robótica: al ser un modelo ligero (209M parámetros), puede ejecutarse en estaciones de trabajo con GPUs de consumo, facilitando pruebas de concepto en laboratorios sin hardware especializado.
- Benchmarking de VLA eficientes: permite comparar el rendimiento de TurboVLA frente a otros VLA centrados en LLM en términos de latencia, memoria y tasa de éxito en tareas de manipulación.
- Educación en robótica: al estar documentado y disponible en Hugging Face, puede utilizarse en cursos de robótica y aprendizaje automático para demostrar el ciclo completo de recopilación de datos, entrenamiento y despliegue.
- Desarrollo de asistentes robóticos domésticos: aunque la tarea es específica, la arquitectura subyacente podría adaptarse a tareas similares de organización de objetos en entornos domésticos con el hardware adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. El paper de TurboVLA reporta 32 Hz en RTX 4090 con menos de 1 GB de VRAM, pero no se especifican tasas de éxito para esta política concreta.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB según el paper de TurboVLA para la arquitectura general; el modelo concreto de 209M parámetros en FP32 ocuparía aproximadamente 0,8 GB, por lo que cabría en cualquier GPU moderna.
- GPU recomendadas: RTX 4090 (referencia del paper), aunque cualquier GPU con al menos 2 GB de VRAM y soporte CUDA debería ser suficiente para inferencia.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que utiliza PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: el paper indica 32 Hz de frecuencia de control en RTX 4090, lo que equivale a una latencia de aproximadamente 31 ms por inferencia. Para este modelo específico no se dispone de mediciones propias.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, a nivel de arquitectura, TurboVLA se posiciona frente a VLA centrados en LLM como OpenVLA o RT-2, que suelen tener cientos de miles de millones de parámetros y requieren GPUs de datacenter. TurboVLA prioriza la eficiencia en tiempo real y el bajo consumo de memoria, a costa de una menor generalización a tareas diversas. No se pueden aportar cifras concretas de rendimiento relativo sin datos de benchmarks.

## Limitaciones y advertencias

- Especialización limitada: el modelo solo realiza la tarea para la que fue entrenado (clasificación de discos de colores). No es un agente generalista y no puede ejecutar otras tareas sin reentrenamiento.
- Dependencia del hardware: las observaciones incluyen imágenes de cámaras específicas (lateral y muñeca) y un estado de 7 dimensiones; cualquier cambio en la configuración del robot o de las cámaras requiere reentrenamiento.
- Dataset pequeño: 35 episodios pueden provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación reportada: no hay resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo de control, no genera texto, pero podría producir acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con las condiciones de atribución y de no utilizar marcas registradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrfm/sort_b601_simple_filtered_turbovla_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/sort_b601_simple_filtered
- Dataset original sin filtrar: https://huggingface.co/datasets/adrfm/sort_b601_simple
- Repositorio oficial de TurboVLA: https://github.com/H-EmbodVis/TurboVLA
- Paper de TurboVLA: https://arxiv.org/html/2607.27205
- Página del paper en Papers with Code: https://paperswithcode.co/paper/2607.27205
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
