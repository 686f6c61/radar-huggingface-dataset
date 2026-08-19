# kerasformers/qwen3-30b-a3b

## Resumen

`kerasformers/qwen3-30b-a3b` es una conversión íntegra en Keras 3 del modelo `Qwen/Qwen3-30B-A3B`, desarrollada por el equipo de KerasFormers. Este modelo es una implementación de la arquitectura Mixture-of-Experts (MoE) de la familia Qwen3, con 30 mil millones de parámetros totales y 3 mil millones activos por token. Su principal aportación es la portabilidad: una única implementación en Keras 3 puede ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita su integración en entornos heterogéneos.

El modelo está pensado para desarrolladores e investigadores que necesitan ejecutar Qwen3 en infraestructuras basadas en Keras o que quieren aprovechar la flexibilidad multi-backend sin renunciar a las capacidades del modelo original. Los pesos se distribuyen en bfloat16 y el repositorio ocupa aproximadamente 61,1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta conversión no modifica los pesos ni la arquitectura del modelo base, por lo que hereda sus capacidades de generación de texto, razonamiento y comprensión multilingüe. Sin embargo, la model card solo declara soporte para inglés, aunque el modelo original de Qwen soporta más idiomas. Para detalles técnicos completos, se remite a la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Transformer con capas de expertos) |
| Parametros totales | 30 mil millones (inferido del nombre del modelo) |
| Parametros activos | 3 mil millones (inferido del nombre del modelo) |
| Longitud de contexto | no disponible (consulte el modelo base Qwen/Qwen3-30B-A3B) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | en (ingles, segun la metadata) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de Keras, probablemente .weights.h5) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen3-30B-A3B, que emplea una arquitectura transformer con capas de Mixture-of-Experts (MoE). En este diseño, solo una fracción de los parámetros se activa por token (3B de los 30B totales), lo que reduce el coste computacional en inferencia manteniendo una capacidad de representación alta. Los pesos se almacenan en bfloat16 y se cargan mediante la librería KerasFormers, que permite ejecutar el mismo modelo en TensorFlow, PyTorch o JAX.

No se proporcionan detalles sobre el entrenamiento de esta conversión, ya que no se trata de un modelo reentrenado sino de una reimplementación de los pesos del modelo original. El entrenamiento original de Qwen3 se describe en el paper técnico (arXiv:2505.09388) e incluye un pipeline con preentrenamiento supervisado y refinamiento por RLHF. Esta conversión no altera esos pesos, por lo que las capacidades aprendidas se mantienen intactas.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualizadas en inglés, heredadas del modelo base.
- Razonamiento: al ser un modelo Qwen3, se espera que maneje tareas de razonamiento lógico y matemático, aunque la card no lo detalla explícitamente.
- Comprensión multilingüe: la metadata solo declara inglés, aunque el modelo original soporta más idiomas; no se garantiza el soporte para otros idiomas en esta conversión.
- Ejecución multi-backend: gracias a Keras 3, el modelo puede ejecutarse en TensorFlow, PyTorch o JAX sin cambios de código, lo que facilita su uso en distintos entornos de hardware y software.
- No se mencionan capacidades específicas como tool calling, agentes, visión o audio en la model card de esta conversión.

## Casos de uso

- Investigación en arquitecturas MoE: los investigadores pueden estudiar el comportamiento de un modelo MoE de 30B con solo 3B activos usando Keras, sin necesidad de migrar a otras librerías.
- Prototipado multiplataforma: al poder ejecutarse en TF, Torch y JAX, es útil para equipos que trabajan con diferentes frameworks y quieren un modelo común.
- Generación de texto en producción: aunque no se especifican optimizaciones de inferencia, el modelo puede integrarse en pipelines de generación de texto donde se requiera compatibilidad con Keras.
- Evaluación de conversiones: sirve como referencia para comparar la fidelidad de una conversión de pesos frente al modelo original en términos de salidas y rendimiento.
- Despliegue en entornos con JAX o TensorFlow: organizaciones que usan estos backends pueden beneficiarse de una implementación nativa sin recurrir a PyTorch.
- Fine-tuning con Keras: los desarrolladores pueden ajustar el modelo con la API de Keras 3, aprovechando el ecosistema de capas y callbacks de esta librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Para conocer el rendimiento del modelo base, se recomienda consultar la model card de `Qwen/Qwen3-30B-A3B` y el paper técnico de Qwen3.

## Requisitos de hardware

- Tamaño del repositorio: 61,1 GB en bfloat16, lo que implica una huella de memoria considerable para cargar los pesos completos.
- VRAM estimada: con 30B parámetros en bfloat16, se necesitan aproximadamente 60 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache. Esto supera la capacidad de GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPUs recomendadas: se requieren GPUs de centro de datos con al menos 80 GB de VRAM, como la A100 (80 GB) o la H100 (80 GB). También podría caber en una A6000 (48 GB) si se usa cuantización adicional, pero no se ofrecen versiones cuantizadas en esta conversión.
- Opciones de despliegue: al ser una implementación de Keras, se puede servir mediante frameworks compatibles con Keras, aunque no se mencionan integraciones con vLLM, llama.cpp u Ollama. La inferencia se realiza directamente con la API de KerasFormers.
- Latencia y throughput: no se proporcionan datos. En un MoE de 3B activos, la latencia por token debería ser menor que en un modelo denso de 30B, pero depende del backend y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares en esta conversión. La comparativa natural sería con el modelo base `Qwen/Qwen3-30B-A3B`, que es idéntico en pesos y arquitectura, diferenciándose solo en el formato de implementación (PyTorch original vs. Keras 3). Otras alternativas MoE de tamaño similar, como DeepSeek-V3 o Mixtral 8x22B, no están directamente relacionadas con esta conversión y no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- La model card solo declara soporte para inglés; el uso en otros idiomas puede no estar garantizado, aunque el modelo base sea multilingüe.
- No se proporcionan instrucciones de uso para cuantización ni versiones GGUF, lo que limita su despliegue en hardware modesto.
- Al ser una conversión de pesos, podrían existir pequeñas diferencias numéricas respecto al modelo original debido a la implementación de Keras, aunque en principio deberían ser mínimas.
- No se mencionan sesgos específicos ni riesgos de alucinación; se heredan los del modelo base Qwen3, que deben consultarse en su model card original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base por si hubiera restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/qwen3-30b-a3b
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3 en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3/
- Colección de modelos Qwen3 MoE: https://huggingface.co/collections/kerasformers/qwen3-moe-6a7f9b1eacaba9aba25a1d63
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
