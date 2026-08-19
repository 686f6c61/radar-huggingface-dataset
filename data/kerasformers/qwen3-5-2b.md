# kerasformers/qwen3.5-2b

## Resumen

El modelo `kerasformers/qwen3.5-2b` es una conversión pura a Keras 3 del modelo original `Qwen/Qwen3.5-2B`, realizada por el autor de la librería KerasFormers. Esta conversión permite ejecutar el modelo dentro del ecosistema Keras 3, con soporte para TensorFlow, JAX y PyTorch como backends, sin depender de la implementación original de PyTorch. El repositorio contiene los pesos convertidos en formato bf16 y el tokenizador correspondiente.

Su relevancia radica en que facilita la integración de un modelo de la familia Qwen en proyectos que ya utilizan Keras como framework principal, evitando la necesidad de mantener dos stacks diferentes. Al tratarse de una conversión de pesos, no introduce cambios en la arquitectura ni en el entrenamiento, por lo que las capacidades del modelo original se mantienen en principio intactas, aunque no se han publicado validaciones exhaustivas de equivalencia.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para entornos de producción. Sin embargo, la información disponible es escasa: no se documentan detalles técnicos más allá de la conversión, por lo que esta ficha se basa principalmente en los datos del repositorio y en inferencias razonables sobre modelos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conversión de Qwen/Qwen3.5-2B, presumiblemente transformer) |
| Parametros totales | no disponible (el nombre sugiere 2B, sin confirmar) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único formato documentado) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos Keras (no se especifica extensión; incluye tokenizer.json) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original Qwen3.5-2B ni sobre su proceso de entrenamiento. El repositorio se limita a indicar que se trata de una conversión de pesos desde el checkpoint oficial de Qwen, realizada con la librería KerasFormers. No se mencionan datos sobre el número de tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO.

Dado que es una conversión directa, se espera que la arquitectura sea idéntica a la del modelo base, pero no se aportan detalles adicionales en la documentación disponible. Tampoco se documentan innovaciones técnicas propias de la conversión, más allá del uso de Keras 3 con soporte multi-backend.

## Capacidades

- Generación de texto: al ser una conversión de Qwen3.5-2B, se espera que herede las capacidades de generación de lenguaje del modelo original, aunque no se han verificado de forma independiente.
- Razonamiento y codigo: no hay datos específicos en la documentación; se asume que mantiene las capacidades del modelo base, pero sin confirmación.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no documentadas.
- Integración con Keras: la principal capacidad añadida es la ejecución nativa en Keras 3 con backends TensorFlow, JAX y PyTorch, mediante la API de `kerasformers`.

## Casos de uso

- Prototipado rápido en Keras: desarrolladores que trabajan habitualmente con Keras pueden integrar este modelo en sus pipelines existentes sin cambiar de framework, usando la API `Qwen3_5Generate.from_weights()`.
- Investigación en entornos multi-backend: al soportar TensorFlow, JAX y PyTorch, permite experimentar con el mismo modelo en diferentes backends para comparar rendimiento o compatibilidad.
- Despliegue en infraestructura TF/JAX: equipos que ya tienen servicios de inferencia basados en TensorFlow Serving o JAX pueden servir este modelo sin introducir dependencias de PyTorch.
- Educación y experimentación: útil para estudiar el comportamiento de un modelo de 2B dentro del ecosistema Keras, o para probar técnicas de fine-tuning con Keras 3.
- Migración de modelos: sirve como referencia para convertir otros modelos de Qwen a Keras, ya que el repositorio muestra el patrón de conversión.
- Uso en entornos con restricciones de licencia: al ser Apache 2.0, puede incorporarse en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta conversión concreta. Se recomienda consultar los benchmarks del modelo original Qwen/Qwen3.5-2B para una referencia aproximada, aunque la conversión podría introducir pequeñas diferencias numéricas debido a la representación de pesos en bf16.

## Requisitos de hardware

- VRAM estimada: para un modelo de aproximadamente 2B de parámetros en bf16, se estiman entre 4 y 6 GB de VRAM para inferencia en precisión completa, dependiendo de la longitud de secuencia y del backend utilizado. Esta cifra es orientativa y no está confirmada por el autor.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A10, etc.) para trabajar con comodidad. Para producción, se recomiendan GPUs de datacenter como A100 o H100 si se requiere alto throughput.
- Compatibilidad con GPU de consumo: sí, un modelo de 2B en bf16 cabe en GPUs de consumo modernas con 8 GB o más, aunque con ventanas de contexto limitadas.
- Opciones de despliegue: al ser una conversión Keras, se puede servir mediante TensorFlow Serving, JAX Serving o mediante la propia API de KerasFormers. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que estos suelen requerir formatos específicos (GGUF, safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para realizar una comparativa cuantitativa fiable. Como referencia cualitativa, se puede comparar con otros modelos de tamaño similar en el ecosistema Keras o con el modelo original:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kerasformers/qwen3.5-2b | ~2B (sin confirmar) | no disponible | Apache 2.0 | Keras (bf16) | HuggingFace |
| Qwen/Qwen3.5-2B | ~2B (original) | no disponible | Apache 2.0 | safetensors/PyTorch | HuggingFace |
| Qwen/Qwen2.5-1.5B | 1.5B | 32K (según documentación oficial) | Apache 2.0 | safetensors/PyTorch | HuggingFace |

La principal diferencia con el modelo original es el formato de pesos y la librería de ejecución; las capacidades funcionales deberían ser equivalentes, pero no se ha verificado.

## Limitaciones y advertencias

- No se han publicado validaciones de que la conversión reproduzca exactamente el comportamiento del modelo original; pueden existir pequeñas diferencias numéricas debidas a la conversión de pesos o al redondeo en bf16.
- La documentación es mínima: no se especifican detalles de arquitectura, contexto, idiomas ni benchmarks, lo que dificulta evaluar su idoneidad para casos de uso concretos.
- Al ser una conversión de terceros, no hay garantía de mantenimiento ni de soporte por parte del equipo de Qwen.
- El tamaño del repositorio (3.8 GB) sugiere que los pesos están en bf16, lo que duplica el consumo de memoria frente a cuantizaciones de 8 bits o 4 bits. No se ofrecen versiones cuantizadas.
- Para producción, se recomienda verificar la equivalencia de salidas con el modelo original antes de desplegarlo.
- No se documentan sesgos conocidos ni riesgos de alucinación; estos serían los mismos que los del modelo base, pero no se han analizado específicamente.

## Enlaces

- Repositorio HuggingFace: [kerasformers/qwen3.5-2b](https://huggingface.co/kerasformers/qwen3.5-2b)
- Colección HuggingFace de Qwen3.5 de kerasformers: [colección](https://huggingface.co/collections/kerasformers/qwen35-6a7e5421737d73e63669ebb9)
- Repositorio GitHub de KerasFormers: [IMvision12/KerasFormers](https://github.com/IMvision12/KerasFormers)
- Modelo original: [Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
