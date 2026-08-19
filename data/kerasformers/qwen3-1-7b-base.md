# kerasformers/qwen3-1.7b-base

## Resumen

El modelo `kerasformers/qwen3-1.7b-base` es una conversión íntegra en Keras 3 del modelo base `Qwen/Qwen3-1.7B-Base` de Alibaba, realizada por el proyecto KerasFormers. Su principal aportación es que la misma implementación puede ejecutarse sin modificaciones sobre tres backends de Keras 3: TensorFlow, JAX y PyTorch. Esto lo convierte en una opción interesante para desarrolladores que trabajan en entornos heterogéneos o que desean portar modelos entre frameworks sin reescribir código.

Se trata de un modelo denso (no MoE) de la familia Qwen3, con pesos almacenados en bfloat16 y un tamaño de repositorio de 3,4 GB. Al ser una conversión del modelo base, no incluye fine-tuning instructivo, por lo que está orientado a tareas de modelado del lenguaje y a ser adaptado mediante fine-tuning. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta conversión radica en la flexibilidad de ejecución multi-backend y en la posibilidad de integrar Qwen3 en pipelines que ya usan Keras, evitando la dependencia exclusiva de PyTorch. Aunque el modelo no aporta innovaciones arquitectónicas propias (hereda las de Qwen3), su valor práctico está en la portabilidad y en la facilidad de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-dense) |
| Parametros totales | 1.7B (según el nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 3,4 GB, pesos en bfloat16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo Qwen3-1.7B-Base, un transformer denso con atención por ventanas deslizantes y atención completa alternadas, según el diseño de la familia Qwen3. La conversión realizada por KerasFormers mantiene los pesos originales en bfloat16 y no modifica la arquitectura subyacente, por lo que las características de entrenamiento (datos, número de tokens, técnicas de alineación) son las del modelo base de Alibaba, descritas en el informe técnico de Qwen3 (arXiv:2505.09388). No se dispone en esta ficha de detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento del modelo original.

La innovación principal de esta versión no está en la arquitectura, sino en la implementación: una única definición del modelo en Keras 3 que puede ejecutarse en TensorFlow, JAX o PyTorch mediante la selección del backend. Esto facilita la portabilidad y el despliegue en infraestructuras que ya utilizan estos frameworks, sin necesidad de convertir los pesos a formatos propietarios.

## Capacidades

- Generación de texto en inglés, como modelo base de lenguaje.
- Modelado del lenguaje sin alineación instructiva (no está entrenado para seguir instrucciones ni para diálogo).
- Compatibilidad multi-backend: la misma implementación funciona en TensorFlow, JAX y PyTorch gracias a Keras 3.
- Posibilidad de fine-tuning para tareas específicas (clasificación, generación condicionada, etc.), aunque no se documentan ejemplos en la información proporcionada.
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Experimentación con multi-backend en Keras 3: el modelo permite probar la portabilidad de un mismo código entre TensorFlow, JAX y PyTorch, lo que es útil para equipos que evalúan diferentes frameworks o que necesitan desplegar en infraestructuras heterogéneas.
- Fine-tuning para clasificación de texto en inglés: al ser un modelo base, se puede adaptar con capas de clasificación para tareas como análisis de sentimiento o detección de spam, aprovechando su tamaño moderado (1.7B) para entrenar en GPUs de consumo.
- Generación de texto para completar secuencias o rellenar huecos en inglés, por ejemplo en herramientas de autocompletado o asistentes de escritura.
- Prototipado rápido de aplicaciones NLP en entornos que ya usan Keras: la integración directa con el ecosistema Keras facilita la creación de demos y pruebas de concepto sin cambiar de framework.
- Investigación académica sobre arquitecturas transformer densas: el modelo puede servir como punto de partida para estudios de interpretabilidad, análisis de representaciones o comparación de backends.
- Despliegue en entornos con restricciones de dependencias: al poder ejecutarse en TensorFlow o JAX, es adecuado para sistemas donde no se permite instalar PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni de GPU en la información proporcionada.
- El tamaño del repositorio es de 3,4 GB, lo que sugiere que en bfloat16 la inferencia requiere aproximadamente esa cantidad de memoria de GPU, más overhead de activaciones y contexto.
- En una GPU con 4 GB de VRAM (por ejemplo, una NVIDIA GTX 1650 o similar) podría ejecutarse en bfloat16 con un contexto reducido, aunque no hay garantías documentadas.
- Con cuantización a 4 bits (no incluida en esta conversión), el modelo podría caber en GPUs con 2 GB de VRAM, pero esa opción no está disponible en este repositorio.
- Las opciones de despliegue no se detallan; al ser una implementación de Keras 3, se puede usar con los mecanismos de exportación de Keras (SavedModel, TF Serving, etc.) y con los backends correspondientes.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras conversiones de Qwen3 disponibles en el mismo proyecto KerasFormers, según los datos de la model card. No se incluyen métricas de rendimiento por no estar disponibles.

| Modelo | Parametros | Arquitectura | Licencia |
|---|---|---|---|
| kerasformers/qwen3-0.6b-base | 0.6B | Denso | Apache 2.0 |
| kerasformers/qwen3-1.7b-base | 1.7B | Denso | Apache 2.0 |
| kerasformers/qwen3-4b-base | 4B | Denso | Apache 2.0 |
| kerasformers/qwen3-8b-base | 8B | Denso | Apache 2.0 |
| kerasformers/qwen3-14b-base | 14B | Denso | Apache 2.0 |
| kerasformers/qwen3-32b | 32B | Denso | Apache 2.0 |
| kerasformers/qwen3-30b-a3b | 30B (3B activos) | MoE | Apache 2.0 |

En comparación con el modelo original `Qwen/Qwen3-1.7B-Base` (PyTorch), esta conversión no altera los pesos ni el rendimiento esperado, pero añade la ventaja de la portabilidad multi-backend. No se dispone de datos de rendimiento para comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado para seguir instrucciones ni para mantener diálogos coherentes; su uso directo en aplicaciones de chat o asistencia puede producir respuestas irrelevantes o no deseadas.
- No se documentan sesgos específicos en esta conversión, pero el modelo original puede presentar sesgos derivados de sus datos de entrenamiento, como es común en modelos de lenguaje grandes.
- Riesgo de alucinación: al ser un modelo base, puede generar contenido factualmente incorrecto o inventado, especialmente en tareas de generación libre.
- La longitud de contexto no se especifica en la información proporcionada; es recomendable consultar la ficha del modelo base Qwen3-1.7B-Base para conocerla antes de usarlo en tareas que requieran ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los términos de atribución y distribución del modelo original, tal como indica la model card.
- No se ofrecen cuantizaciones predefinidas en este repositorio; para despliegues con restricciones de memoria, el usuario deberá aplicar técnicas de cuantización por su cuenta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kerasformers/qwen3-1.7b-base)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Qwen3 en KerasFormers](https://imvision12.github.io/KerasFormers/qwen3/)
- [Informe técnico de Qwen3 (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)
- [Colección de modelos Qwen3 en HuggingFace](https://huggingface.co/collections/kerasformers/qwen3-6a7d3fcc4e56b32e86f5b2c4)
- [Modelo base original Qwen/Qwen3-1.7B-Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base)
