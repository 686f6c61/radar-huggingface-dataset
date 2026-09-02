# elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib4096-blade

## Resumen

Este modelo es una versión comprimida de Qwen/Qwen2.5-0.5B, desarrollada por elastix-ai. Aplica una poda estructurada 2:4 (patrón de semi-escasez) sobre todas las capas del transformer, combinada con un ajuste fino posterior mediante la técnica BEAM. El objetivo es reducir el coste computacional y el uso de memoria durante la inferencia, manteniendo un nivel de calidad cercano al modelo original. La compresión se ha calibrado con 4096 muestras del dataset SlimPajama-6B y una longitud de secuencia de 2048 tokens.

El modelo resultante conserva la arquitectura densa original (no es un MoE) pero con la mitad de los pesos activos por cada grupo de cuatro, lo que permite aceleraciones en hardware que soporta sparse kernels. Es relevante para entornos con recursos limitados, ya que el modelo base de 0.5B ya es ligero y esta compresión lo hace aún más eficiente. La licencia y los idiomas soportados no se especifican en la información disponible, aunque el modelo base Qwen2.5 tiene soporte multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con poda estructurada 2:4 |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso con poda, no MoE) |
| Longitud de contexto | No disponible (modelo base: 32.768 tokens) |
| Tipos de cuantizacion | No se aplica cuantizacion (solo poda 2:4; config GFP de 16 bits presente pero desactivada) |
| Idiomas soportados | No disponible (modelo base multilingue) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B, un transformer decoder-only con atención causal y normalización RMSNorm. La compresión se realiza mediante el método "blade", que aplica una poda estructurada con patrón 2:4 (dos elementos no nulos por cada cuatro consecutivos) en todas las capas lineales excepto en embeddings, lm_head y el router del MLP (aunque este modelo no es MoE, el patrón excluye el router por si acaso). La poda se aplica tanto en las capas de atención como en las del MLP.

El entrenamiento incluye un calibrado con 4096 muestras del dataset SlimPajama-6B (split validation, streaming) con longitud de secuencia 2048. Después de la poda, se realiza un ajuste fino con BEAM (Bidirectional Exploration and Adaptation for Model compression), una técnica que optimiza los pesos restantes para compensar la pérdida de precisión. La configuración de BEAM incluye búsqueda de hiperparámetros con Optuna (learning rate loguniform entre 1e-5 y 0.01, batch size entre 8, 16 y 32). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto: el modelo base Qwen2.5-0.5B es capaz de generar texto coherente en múltiples idiomas, aunque esta versión comprimida puede presentar una ligera degradación.
- Razonamiento y comprensión: mantiene las capacidades básicas de razonamiento del modelo original, aunque con posibles pérdidas en tareas complejas debido a la poda.
- Soporte de código: el modelo base tiene capacidades de generación de código, que se conservan parcialmente tras la compresión.
- Capacidades multilingües: no se especifica en la información, pero el modelo base Qwen2.5 soporta más de 29 idiomas, incluyendo español, inglés, chino, etc.
- No se menciona soporte explícito de tool calling, function calling, agentes ni modos especiales (vision, audio) en la información disponible.

## Casos de uso

- Inferencia en dispositivos de borde: gracias a su tamaño reducido (494M parámetros) y la poda 2:4, el modelo puede ejecutarse en CPUs o GPUs de baja gama, adecuado para aplicaciones móviles o embebidas que requieran generación de texto básica.
- Prototipado rápido: los desarrolladores pueden usar este modelo para validar pipelines de NLP sin necesidad de hardware potente, antes de escalar a modelos más grandes.
- Clasificación y extracción de información: tareas de análisis de texto como clasificación de sentimiento, extracción de entidades o resumen pueden ejecutarse con baja latencia, aunque conviene evaluar la pérdida de calidad frente al original.
- Generación de respuestas en chatbots ligeros: integración en asistentes virtuales que operan con recursos limitados, donde la velocidad es prioritaria sobre la máxima precisión.
- Experimentación con compresión de modelos: sirve como ejemplo práctico de cómo aplicar poda 2:4 y BEAM fine-tuning, útil para investigadores que estudian técnicas de eficiencia.
- Despliegue en entornos serverless: al ser un modelo pequeño, cabe en funciones serverless con límites de memoria moderados, permitiendo inferencia bajo demanda sin mantener servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta versión comprimida. El modelo base Qwen2.5-0.5B reporta en el technical report de Qwen2.5 un rendimiento comparable o superior al Qwen2-1.5B en varias tareas, pero no hay datos específicos para la versión con poda. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: al tener 494M parámetros en FP16, el tamaño del modelo es de aproximadamente 1 GB (coincide con el tamaño del repo). La poda 2:4 no reduce el número de parámetros almacenados, solo los cálculos, por lo que la VRAM necesaria es similar a la del modelo original (alrededor de 1-2 GB en FP16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso GPUs integradas con suficiente memoria compartida). Para aprovechar la poda 2:4 se requiere hardware con soporte de sparse kernels (por ejemplo, NVIDIA Ampere o posterior con soporte para sparse tensor cores).
- En CPU: es viable la ejecución en CPU con frameworks como llama.cpp o ONNX Runtime, aunque la poda 2:4 no acelera en CPU a menos que se use software específico.
- Opciones de despliegue: vLLM (si soporta sparse), llama.cpp, Ollama, HuggingFace Transformers (con kernels sparse), TGI (si se configura adecuadamente).
- Latencia y throughput: no se dispone de datos medidos. En general, la poda 2:4 puede ofrecer hasta un 50% de reducción en cálculos de matmul en GPUs compatibles, pero la ganancia real depende del kernel utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Poda/Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 494M | 32K | Ninguna | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-maskllm-beam-2to4-calib4096-blade (este) | 494M | No disponible | Poda 2:4 + BEAM | No disponible | HuggingFace |
| Qwen2.5-1.5B | 1.5B | 32K | Ninguna | Apache 2.0 | HuggingFace |
| Llama 3.2 1B (similar tamaño) | 1.2B | 128K | Ninguna | Llama 3.2 | HuggingFace |

La comparativa se centra en el modelo base del que deriva y en alternativas de tamaño similar. La versión comprimida ofrece una ventaja en eficiencia computacional frente al original, pero no se dispone de datos de rendimiento para cuantificar la pérdida de calidad.

## Limitaciones y advertencias

- La poda 2:4 introduce una pérdida de precisión no cuantificada en la información disponible; puede afectar a tareas que requieren razonamiento complejo o generación de código exacto.
- No se especifica la licencia del modelo comprimido, por lo que su uso comercial podría estar restringido según la licencia del modelo base (Apache 2.0) o condiciones adicionales del autor.
- La longitud de contexto no se confirma; se asume la del modelo base (32K) pero podría haberse reducido durante la compresión.
- No se garantiza el soporte multilingüe tras la poda; es recomendable evaluar en los idiomas objetivo.
- El riesgo de alucinación es inherente al modelo base y puede verse incrementado por la pérdida de información debida a la poda.
- No se dispone de información sobre sesgos específicos del modelo comprimido, aunque hereda los del modelo base Qwen2.5.
- Para producción, es imprescindible validar el rendimiento en las tareas concretas antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib4096-blade
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Technical report de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repo de referencia de Qwen2.5 en GitHub (mx4ai): https://github.com/mx4ai/qwen2.5
- MLflow run asociado: https://experiments.external.elastix.ai:9099/#/experiments/74/runs/cea16c355591432a8346db4808f36816
