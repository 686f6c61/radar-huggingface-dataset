# mlx-community/SenseNova-U1.5-8B-MoT-pose-bf16

## Resumen

SenseNova-U1.5-8B-MoT-pose-bf16 es un checkpoint especializado en transferencia de pose, derivado del modelo base SenseNova-U1.5-8B-MoT de SenseNova, convertido al formato MLX para ejecución en Apple Silicon. El modelo fusiona un adaptador LoRA de control de pose (RefControl) en los pesos del checkpoint base, lo que permite rehacer la pose de una persona en una fotografía de referencia siguiendo un esqueleto OpenPose, manteniendo identidad, vestimenta y escenario. Se trata de una edición con dos imágenes de entrada cuyo orden es determinante: la primera define la pose y la segunda la apariencia.

El modelo pertenece a la serie SenseNova-U1, una familia de modelos multimodales nativos que unifican comprensión, razonamiento y generación en una arquitectura monolítica, sin adaptadores entre modalidades. El checkpoint base, SenseNova-U1.5-8B-MoT, incorpora mejoras en el seguimiento de instrucciones, generación de texto y layout, generación nativa en 4K, edición de imagen y control visual. Este tier concreto, publicado por mlx-community, está pensado para cargas de trabajo de edición de imagen con control de pose en equipos Apple, y se distribuye bajo licencia Apache-2.0.

Aunque el nombre sugiere 8B de parámetros, el archivo safetensors contiene 17.532.854.464 parámetros totales, una discrepancia que no se explica en la documentación disponible. El repositorio ocupa 35,1 GB en formato bf16, y se recomienda el tier de 8 bits (pose-8bit) para la mayoría de los usos, ya que reproduce los mismos renders con 19,0 GB de memoria residente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify (nativa unificada multimodal, monolítica) |
| Parametros totales | 17.532.854.464 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este tier); existen tiers de 8-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT se construye sobre NEO-unify, una arquitectura que unifica comprensión, razonamiento y generación de imágenes y texto en un único modelo monolítico, sin depender de adaptadores externos entre modalidades. El nombre "MoT" sugiere un mecanismo de mezcla de tokens, aunque no se detalla en la documentación pública. El checkpoint base incorpora mejoras en las capas de patchify, calidad y distribución de datos, formulación de tareas, mejora de prompts y pipeline de post-entrenamiento.

El tier pose-bf16 se obtiene fusionando un adaptador LoRA de control de pose (RefControl) en el checkpoint base. El adaptador fue entrenado durante 3000 pasos con rank 32 y alpha 32, usando tripletas (esqueleto, referencia, objetivo) y un layout `neo_hf_lora` con 294 proyecciones de generación (`*_mot_gen`). La fusión se realizó en fp32 como `W += (alpha/rank)·BA` y se casteó de vuelta a bf16. Los datos de entrenamiento provienen de Wikimedia Commons (CC-BY / CC-BY-SA) y Pexels, sin redistribución de los fotogramas originales. El merge es exacto: 882 tensores difieren respecto al checkpoint base (294 objetivos × {pesos, escalas, sesgos}), y una copia con B=0 reproduce el artefacto original tensor a tensor.

## Capacidades

- Transferencia de pose: rehace la pose de una persona en una foto de referencia según un esqueleto OpenPose, conservando identidad, ropa y escena.
- Edición de imagen con dos referencias: requiere dos imágenes de entrada, donde la primera define la pose y la segunda la apariencia; el orden es crítico.
- Generación de texto a imagen: al ser un merge del checkpoint base, conserva las capacidades de text-to-image del modelo original, aunque el stream de generación está sesgado hacia tareas de pose.
- Modo de pensamiento (think mode): el modelo base incluye un modo de razonamiento que también está presente en este tier.
- Respuesta visual a preguntas (VQA): puede responder preguntas sobre imágenes, aunque no es el uso principal de este checkpoint.
- Control visual: soporta control fino de la composición mediante esqueletos y referencias, gracias al adaptador RefControl fusionado.

## Casos de uso

- Edición de retratos para fotografía de moda: un estudio puede usar el modelo para ajustar la pose de un modelo en una sesión sin necesidad de repetir la toma, partiendo de una foto de referencia y un esqueleto deseado.
- Creación de storyboards animados: diseñadores pueden generar variaciones de pose de un personaje manteniendo su apariencia, usando esqueletos dibujados a mano como entrada.
- Preparación de datasets para entrenamiento de modelos de visión: el modelo permite generar pares (imagen, pose) sintéticos a partir de fotos reales, ampliando conjuntos de datos para tareas de estimación de pose.
- Corrección de postura en fotos de producto: en comercio electrónico, se puede reorientar a un modelo para que muestre el producto desde un ángulo específico sin rehacer la sesión fotográfica.
- Prototipado de animación 2D: los artistas pueden usar el modelo para probar rápidamente diferentes poses de un personaje antes de animarlo manualmente, usando esqueletos como guía.
- Generación de contenido para redes sociales: creadores pueden adaptar la pose de una foto existente a una tendencia o meme sin necesidad de herramientas de edición complejas, gracias a la interfaz de dos imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica el rendimiento en memoria para Apple Silicon: 35,1 GB residentes tras la carga en bf16, y 19,0 GB en el tier de 8 bits. No hay métricas de calidad de imagen, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: 35,1 GB en bf16; 19,0 GB en el tier de 8 bits (pose-8bit).
- GPU recomendadas: Apple Silicon con memoria unificada, preferiblemente M5 Max o superior para el tier bf16; el tier de 8 bits puede ejecutarse en configuraciones con 24 GB o más.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido al formato MLX, que está optimizado para Apple Silicon.
- Opciones de despliegue: MLX (librería nativa), con integración en Swift mediante el paquete SenseNovaU1Package y en línea de comandos con `sensenova-cli`.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de transferencia de pose en formato MLX. El modelo base SenseNova-U1.5-8B-MoT es la referencia natural, pero este tier añade el adaptador de pose. Alternativas como ControlNet (para Stable Diffusion) ofrecen funcionalidad similar, pero no son comparables en arquitectura ni en formato de despliegue. Se indica "no disponible" por falta de datos contrastados.

## Limitaciones y advertencias

- El orden de las imágenes de entrada es crítico: si se invierten, el modelo ignora el esqueleto y reproduce la pose de la imagen de apariencia.
- El stream de generación está sesgado hacia tareas de pose; para generación de texto a imagen sin control de pose se recomienda usar los tiers base.
- Los datos de entrenamiento provienen de Wikimedia Commons y Pexels, con licencias CC-BY/CC-BY-SA; los fotogramas originales no se redistribuyen, pero el usuario debe verificar las licencias de las imágenes que use como entrada.
- No se especifican limitaciones de contexto ni de idioma; se asume que el modelo base soporta múltiples idiomas, pero no hay confirmación para este tier.
- El checkpoint tiene 17,5B parámetros reales a pesar del nombre "8B", lo que puede afectar a los requisitos de memoria y a las expectativas de rendimiento.
- Al ser un merge de checkpoint base, no es una destilación; las capacidades de text-to-image, think mode y VQA siguen presentes, pero pueden verse influidas por el sesgo de pose.

## Enlaces

- [HuggingFace - mlx-community/SenseNova-U1.5-8B-MoT-pose-bf16](https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-pose-bf16)
- [HuggingFace - sensenova/SenseNova-U1.5-8B-MoT (base)](https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT)
- [HuggingFace - mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit](https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-4bit)
- [ModelScope - SenseNova-U1.5-8B-MoT](https://www.modelscope.cn/models/SenseNova/SenseNova-U1.5-8B-MoT)
- [GitHub - OpenSenseNova/SenseNova-U1](https://github.com/OpenSenseNova/SenseNova-U1)
- [Papers with Code - SenseNova-U1.5-8B-MoT](https://paperswithcode.co/paper/109749)
