# kerasformers/glm-4.5-air-base

## Resumen

El modelo `kerasformers/glm-4.5-air-base` es una conversión pura en Keras 3 del checkpoint `zai-org/GLM-4.5-Air-Base`, desarrollado por el equipo de KerasFormers. Se trata de un modelo de lenguaje de tipo mixture-of-experts (MoE) con 106 mil millones de parámetros totales y 12 mil millones de parámetros activos, diseñado originalmente por Zhipu AI / THUDM como parte de la familia GLM-4.5. Esta conversión permite ejecutar el mismo modelo sin modificaciones en tres backends de Keras 3: TensorFlow, PyTorch y JAX, lo que facilita la experimentación y el despliegue en entornos heterogéneos.

El modelo es la variante base (sin ajuste por instrucciones) de GLM-4.5-Air, orientada a tareas de generación de texto y a servir como punto de partida para fine-tuning. Al ser una conversión, los pesos se mantienen en bfloat16, con el bias del router del MoE en float32, replicando la precisión mixta del checkpoint original. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales, y los idiomas soportados son inglés y chino.

La relevancia de esta conversión radica en que democratiza el acceso a un modelo MoE de gran tamaño bajo un framework flexible como Keras, permitiendo a desarrolladores e investigadores probar arquitecturas de mezcla de expertos sin depender de implementaciones específicas de PyTorch o JAX. Además, al ser una versión base, ofrece una base sólida para adaptaciones personalizadas en dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer |
| Parametros totales | 106 mil millones |
| Parametros activos | 12 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos), float32 (bias del router) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (conversion Keras 3, probablemente H5 o weights) |

## Arquitectura y entrenamiento

El modelo original `GLM-4.5-Air-Base` fue entrenado por Zhipu AI / THUDM con una arquitectura transformer de mezcla de expertos (MoE). Según la documentación oficial, GLM-4.5-Air tiene 106 mil millones de parámetros totales y 12 mil millones activos, lo que permite una inferencia más eficiente que un modelo denso equivalente. El diseño MoE activa solo una fracción de los parámetros por token, reduciendo el coste computacional. El modelo base no incluye ajuste por instrucciones ni alineación con preferencias humanas, por lo que está pensado para fine-tuning posterior.

La conversión a Keras 3 no modifica la arquitectura ni los pesos; simplemente reimplementa el modelo en el framework de Keras, manteniendo la precisión mixta original (bfloat16 para los pesos y float32 para el bias del router). Esto garantiza que el comportamiento sea idéntico al checkpoint de referencia. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el número de tokens utilizados, ya que esos datos pertenecen al modelo original y no se han publicado en la documentación de la conversión.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés y chino, dado que es un modelo base de lenguaje.
- Razonamiento: al ser una versión base, no incluye el modo "thinking" que sí está presente en las versiones instruct de GLM-4.5, pero puede ser fine-tuneado para tareas de razonamiento complejo.
- Soporte multilingüe: entrenado principalmente en inglés y chino, con capacidad para manejar ambas lenguas.
- Flexibilidad de backend: gracias a la conversión a Keras 3, el modelo puede ejecutarse en TensorFlow, PyTorch o JAX sin cambios en el código, lo que facilita su integración en distintos ecosistemas.
- Fine-tuning: al ser un modelo base, está diseñado para ser adaptado a tareas específicas mediante entrenamiento adicional.

## Casos de uso

- Fine-tuning para dominios especializados: el modelo base puede ser ajustado con datos propios de un sector (legal, médico, técnico) para crear asistentes especializados en inglés o chino.
- Investigación en arquitecturas MoE: al ser una implementación en Keras 3, permite estudiar el comportamiento de los expertos, el router y la eficiencia de activación en un entorno multiplataforma.
- Desarrollo de modelos multilingües: dado su soporte para inglés y chino, puede servir como base para sistemas de traducción o generación bilingüe tras un fine-tuning específico.
- Experimentación con backends: los desarrolladores pueden comparar el rendimiento de la misma arquitectura en TensorFlow, PyTorch y JAX, evaluando latencia y throughput en cada uno.
- Prototipado rápido de agentes conversacionales: aunque no está alineado para chat, tras un fine-tuning con datos de diálogo puede convertirse en la base de un asistente conversacional.
- Evaluación de técnicas de cuantización: al tener pesos en bfloat16, se pueden probar métodos de cuantización adicionales (por ejemplo, int8 o int4) para reducir el footprint de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La conversión a Keras 3 no incluye métricas de rendimiento propias, y el modelo original tampoco ha sido evaluado en los documentos consultados. Se recomienda consultar la documentación oficial de Zhipu AI para obtener datos de MMLU, HumanEval u otras pruebas si están disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene 106 mil millones de parámetros totales, incluso con 12 mil millones activos, el almacenamiento completo en bfloat16 requiere aproximadamente 212 GB de memoria (106B × 2 bytes). Esto supera la capacidad de cualquier GPU de consumo actual, por lo que se necesitaría cuantización o distribución en múltiples GPUs.
- GPU recomendadas: no disponible. Para inferencia con los 12 mil millones de parámetros activos, se podría intentar con GPUs de alta gama como A100 (80 GB) o H100 (80 GB) si se aplica cuantización, pero no hay datos oficiales.
- Compatibilidad con GPUs de consumo: no, debido al tamaño total del modelo. Incluso con cuantización agresiva (por ejemplo, 4 bits), el modelo completo ocuparía alrededor de 53 GB, lo que excede la VRAM de GPUs como RTX 4090 (24 GB). Se requeriría particionado o uso de memoria unificada.
- Opciones de despliegue: al ser una conversión de Keras 3, se puede integrar con frameworks de servido como vLLM o TGI si se exporta a un formato compatible, pero no hay instrucciones específicas. También se puede usar directamente con el API de KerasFormers para generación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.5-Air-Base (original) | 106B | 12B | no disponible | MIT | HuggingFace |
| GLM-4.5 (grande) | 355B | 32B | no disponible | MIT | HuggingFace |
| Mixtral 8x7B (referencia MoE) | 46.7B | 12.9B | 32k | Apache 2.0 | HuggingFace |

La comparativa se basa en datos públicos de los respectivos modelos. GLM-4.5-Air-Base es significativamente más grande que Mixtral en parámetros totales, pero similar en parámetros activos, lo que sugiere un rendimiento potencialmente superior en tareas complejas, aunque no hay benchmarks que lo confirmen en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado con instrucciones ni con preferencias humanas, por lo que puede generar contenido sesgado, ofensivo o factualmente incorrecto si se usa directamente sin fine-tuning.
- El tamaño del repositorio es de 213.8 GB, lo que implica requisitos de almacenamiento y descarga considerables.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- Aunque la licencia es MIT, el modelo original puede tener términos adicionales de uso; se recomienda revisar la documentación de Zhipu AI.
- La conversión a Keras 3 puede tener diferencias menores de rendimiento numérico respecto al checkpoint original, aunque se ha mantenido la precisión mixta.
- No hay soporte oficial para tool calling ni function calling en esta versión base; esas capacidades suelen estar en las versiones instruct.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/glm-4.5-air-base
- Modelo original: https://huggingface.co/zai-org/GLM-4.5-Air-Base
- GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de GLM en KerasFormers: https://imvision12.github.io/KerasFormers/glm4_moe/
- Paper ChatGLM: https://arxiv.org/abs/2406.12793
- Blog de Zhipu AI sobre GLM-4.5: https://z.ai/blog/glm-4.5
- Repositorio GitHub de GLM-4.5: https://github.com/zai-org/GLM-4.5
