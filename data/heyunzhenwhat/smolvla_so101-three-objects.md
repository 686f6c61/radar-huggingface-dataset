# heyunzhenwhat/smolvla_so101-three-objects

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con instrucciones en lenguaje natural. Este repositorio concreto, `heyunzhenwhat/smolvla_so101-three-objects`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios, con la tarea específica de mover tres objetos de una caja izquierda a una caja derecha. El modelo tiene 450 millones de parámetros, lo que permite su despliegue en hardware de consumo, una ventaja frente a otros VLA de mayor tamaño.

La relevancia de este modelo radica en que demuestra cómo un VLA ligero puede adaptarse a tareas robóticas concretas mediante fine-tuning con pocos datos, usando la librería LeRobot. Su arquitectura combina entradas de múltiples cámaras, el estado del robot y una instrucción textual para generar acciones de 6 dimensiones. Aunque no se han publicado resultados de evaluación, el modelo está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en transformer |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa simultáneamente imágenes de varias cámaras (en este caso, tres vistas de 256×256 píxeles), el estado del robot (6 dimensiones) y una instrucción en lenguaje natural, para producir una acción de 6 dimensiones. El modelo base fue preentrenado por Hugging Face y este repositorio es un fine-tuning realizado con LeRobot sobre el dataset `heyunzhenwhat/so101-three-objects`, que contiene 50 episodios y 36.227 fotogramas a 30 FPS. El entrenamiento se realizó durante 20.000 pasos con un batch de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. No se menciona el uso de RLHF o DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de un brazo tipo `so_follower` mediante acciones continuas de 6 dimensiones.
- Percepción multi-cámara: procesa tres vistas de cámara simultáneamente (256×256 cada una).
- Seguimiento de instrucciones en lenguaje natural, limitado a la tarea entrenada ("Move all objects from the left box to the right box").
- Generación de acciones en bucle cerrado, adecuado para control en tiempo real.
- Fine-tuning eficiente sobre un modelo base, lo que permite adaptación a nuevas tareas con pocos datos.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede mover objetos entre contenedores siguiendo una instrucción textual, reduciendo la necesidad de programación manual.
- Investigación en robótica de manipulación: sirve como punto de partida para estudiar el fine-tuning de VLA en tareas específicas con datasets pequeños.
- Prototipado rápido de soluciones robóticas: gracias a su tamaño reducido, puede desplegarse en estaciones de trabajo con GPU de consumo para validar conceptos antes de escalar.
- Educación y formación en robótica: permite a estudiantes experimentar con control basado en visión y lenguaje sin requerir infraestructura de alto coste.
- Asistencia en laboratorios: el modelo puede ejecutar tareas repetitivas de clasificación o traslado de objetos bajo supervisión humana.
- Benchmarking de VLA ligeros: al ser un fine-tuning público, puede utilizarse como referencia para comparar metodologías de entrenamiento y despliegue en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM para este modelo concreto. Dado que tiene 450 millones de parámetros, una estimación razonable sería aproximadamente 1,8 GB en fp32, 0,9 GB en fp16 y 0,45 GB en int8, pero estos valores no están confirmados.
- Al ser un modelo compacto, es probable que quepa en GPUs de consumo como la RTX 3060 (12 GB), RTX 4070 o RTX 4090, aunque no hay confirmación oficial.
- El despliegue se realiza principalmente a través de LeRobot, que soporta inferencia con PyTorch y CUDA. No se mencionan otros motores como vLLM u Ollama.
- La latencia y el throughput no están documentados; dependerán del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa con otros modelos VLA. Aunque existen alternativas como OpenVLA o RT-2, no se han encontrado especificaciones comparables en la información proporcionada. Se recomienda consultar la documentación de SmolVLA para más contexto.

## Limitaciones y advertencias

- El modelo está fine-tuneado para una tarea muy específica (mover tres objetos entre dos cajas) y no es generalizable a otras tareas sin un nuevo entrenamiento.
- No se han reportado resultados de evaluación en robot real, por lo que su rendimiento efectivo es desconocido.
- La dependencia de tres cámaras fijas (overhead y wrist) limita su uso a configuraciones de hardware similares.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset pequeño, puede presentar comportamientos erráticos ante variaciones de iluminación, posición de objetos o distracciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset asociado deben revisarse para cumplir con sus respectivas licencias.
- No se especifican idiomas soportados; la instrucción de la tarea está en inglés, por lo que es probable que el modelo solo responda correctamente a comandos en ese idioma.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/heyunzhenwhat/smolvla_so101-three-objects)
- [Dataset de entrenamiento](https://huggingface.co/datasets/heyunzhenwhat/so101-three-objects)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Documentación de LeRobot sobre SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
