# kerasformers/internvl3.5-2b

## Resumen

`kerasformers/internvl3.5-2b` es una conversión íntegra en Keras 3 del modelo multimodal `OpenGVLab/InternVL3_5-2B-HF`, desarrollada por el equipo de KerasFormers. El objetivo es ofrecer una implementación unificada que se ejecute sin modificaciones sobre los tres backends principales de Keras: TensorFlow, PyTorch y JAX. El modelo original, InternVL3.5, es la última iteración de la familia InternVL de OpenGVLab, que introduce el marco de aprendizaje por refuerzo en cascada (Cascade RL) para mejorar el razonamiento multimodal y la eficiencia en inferencia.

Este checkpoint concreto es la versión de 2 000 millones de parámetros, orientada a tareas de imagen-texto a texto (image-text-to-text). Los pesos se almacenan en bfloat16 y el repositorio ocupa 4,7 GB. Su relevancia radica en que permite ejecutar un modelo multimodal de última generación en entornos con recursos limitados, manteniendo la flexibilidad de elegir backend según el hardware disponible. La licencia Apache 2.0 facilita su uso comercial y académico sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje), conversión Keras 3 |
| Parametros totales | 2 000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se remite a la ficha del modelo original) |
| Tipos de cuantizacion | bfloat16 (pesos almacenados) |
| Idiomas soportados | ingles (segun etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Keras 3, compatible con TF, Torch y JAX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a InternVL3.5, una familia de modelos multimodales que combina un codificador visual (tipo ViT) con un modelo de lenguaje autoregresivo. El entrenamiento del modelo original emplea el marco Cascade RL, que consta de dos etapas: primero un refuerzo offline para una convergencia estable y luego un refuerzo online para alinear mejor el comportamiento con las preferencias humanas. Para las versiones Flash se introduce ademas Visual Consistency Learning (ViCO), que reduce el coste de tokens por parche de imagen, aunque no se especifica si esta tecnica se aplica al modelo de 2B. La conversion de KerasFormers no modifica los pesos, sino que los reimplementa en Keras 3, permitiendo la ejecucion en multiples backends sin cambios en el codigo de usuario.

## Capacidades

- Generacion de texto a partir de imagenes y texto (captioning, descripcion de escenas).
- Razonamiento multimodal basico, respondiendo preguntas sobre el contenido visual.
- Soporte de conversaciones multi-turno con contexto visual (a traves del procesador `InternVLProcessor`).
- Ejecucion multiplataforma: el mismo codigo funciona en TensorFlow, PyTorch y JAX, lo que facilita la portabilidad entre entornos.
- Capacidad de procesar imagenes de alta resolucion (dependiendo del procesador asociado).
- No se ha confirmado soporte de tool calling, agentes ni modo de pensamiento explicito en esta conversion.

## Casos de uso

- Descripcion automatica de imagenes en aplicaciones de accesibilidad: el modelo puede generar texto alternativo para fotografias en tiempo real, gracias a su tamano reducido que permite inferencia en GPU de consumo.
- Moderacion de contenido visual: analisis de imagenes para detectar contenido inapropiado o clasificar imagenes por categorias, integrable en pipelines de backend con Keras.
- Asistentes de documentacion tecnica: dado un diagrama o captura de pantalla, el modelo puede generar una explicacion textual, util para generar manuales o documentacion de software.
- Sistemas de busqueda multimodal: indexacion de imagenes por su contenido semantico, combinando el modelo con un motor de busqueda vectorial.
- Prototipado rapido de aplicaciones de vision-lenguaje: gracias a la compatibilidad con JAX y TensorFlow, los investigadores pueden experimentar con diferentes backends sin reescribir el codigo.
- Educacion y demostraciones: por su tamano y licencia permisiva, es adecuado para ensenar conceptos de modelos multimodales en cursos universitarios o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion de KerasFormers. El paper original de InternVL3.5 (arXiv:2508.18265) reporta resultados para modelos de mayor tamano (hasta 241B-A28B), pero no se dispone de datos desglosados para la variante de 2B en tareas estandar como MMLU, HumanEval o benchmarks multimodales. Se recomienda consultar la ficha del modelo original `OpenGVLab/InternVL3_5-2B-HF` para posibles evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4-5 GB para los pesos, mas memoria para activaciones y cache de atencion; con contexto largo puede superar los 8 GB.
- GPU recomendadas: tarjetas consumer con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070; tambien compatible con GPUs de datacenter como A10, A100 o H100.
- Cabe en GPU consumer de gama media con cuantizacion adicional (p. ej., int8 o int4) si se requiere reducir el uso de memoria.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks de inferencia que soporten estos backends (p. ej., vLLM no es directamente compatible, pero se puede usar con JAX o TF). Tambien es posible ejecutarlo en CPU con latencia mayor.
- Latencia y throughput estimados: no disponibles; dependen del backend y hardware. En una GPU moderna se espera una generacion de decenas de tokens por segundo para un modelo de 2B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kerasformers/internvl3.5-2b | 2B | no disponible | Apache 2.0 | HuggingFace (conversion Keras) |
| OpenGVLab/InternVL3_5-2B-HF | 2B | no disponible | Apache 2.0 | HuggingFace (original) |
| Qwen2-VL-2B-Instruct | 2B | 32k (tipico) | Apache 2.0 | HuggingFace |
| Phi-3.5-vision-instruct | 4.2B | 128k | MIT | HuggingFace |

No se dispone de comparativa de rendimiento directa por falta de benchmarks publicados para el modelo de 2B.

## Limitaciones y advertencias

- La conversion de KerasFormers no anade capacidades nuevas respecto al modelo original; cualquier limitacion de InternVL3.5-2B se mantiene.
- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas puede ser limitado.
- Al ser un modelo de 2B, su capacidad de razonamiento complejo es inferior a la de modelos mas grandes de la misma familia.
- Riesgo de alucinacion visual: puede describir objetos o detalles que no estan presentes en la imagen, especialmente en escenas complejas.
- No se ha verificado el soporte de cuantizacion oficial para esta conversion; el usuario debera probar su compatibilidad con su framework de inferencia.
- El repositorio no incluye documentacion detallada de arquitectura interna; para informacion tecnica profunda se debe consultar el paper original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base en OpenGVLab por si hubiera clausulas adicionales.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/kerasformers/internvl3.5-2b
- Modelo original en HuggingFace: https://huggingface.co/OpenGVLab/InternVL3_5-2B-HF
- Paper de InternVL3.5: https://arxiv.org/abs/2508.18265
- Blog oficial de InternVL3.5: https://internvl.github.io/blog/2025-08-26-InternVL-3.5/
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de KerasFormers para InternVL: https://imvision12.github.io/KerasFormers/internvl/
- Coleccion de modelos InternVL en KerasFormers: https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd
