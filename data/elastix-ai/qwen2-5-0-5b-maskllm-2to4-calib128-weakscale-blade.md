# elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib128-weakscale-blade

## Resumen

Este modelo es una versión comprimida de `Qwen/Qwen2.5-0.5B`, desarrollada por el equipo de elastix-ai. Utiliza la técnica de poda estructural 2:4 (patrón de esparsidad semi-estructurada) aplicada sobre las capas de atención y MLP, con un proceso de calibración basado en 128 muestras del dataset SlimPajama-6B. El objetivo es reducir el coste computacional y la huella de memoria del modelo original, manteniendo en la medida de lo posible su calidad de generación.

La relevancia de esta compresión radica en que permite desplegar modelos de lenguaje de tamaño pequeño (0.5B) en entornos con recursos limitados, como edge devices o GPUs de gama baja, acelerando la inferencia y reduciendo el consumo energético. El modelo se presenta en formato safetensors y conserva la arquitectura transformer estándar de Qwen2.5, con aproximadamente 494 millones de parámetros.

Aunque el repositorio no incluye métricas de rendimiento sobre tareas estándar, sí reporta la divergencia KL frente al modelo original en los datasets wikitext2 y c4, lo que da una idea del coste de la compresión. El modelo está pensado como una pieza de investigación y experimentación en compresión de modelos, más que como un producto final listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32.768 tokens) |
| Tipos de cuantizacion | Sin cuantizacion (pesos en FP16, solo esparsidad 2:4) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` y se somete a un proceso de compresión mediante la herramienta `blade`. La técnica principal es la poda estructural 2:4, que elimina la mitad de los pesos en las capas lineales de atención y MLP, dejando un patrón donde de cada grupo de 4 pesos solo 2 son no nulos. Este patrón es especialmente eficiente en hardware moderno que soporta operaciones esparsas 2:4 (como GPUs Ampere o posteriores).

La compresión se realiza con un proceso de calibración sobre 128 secuencias de 2048 tokens del dataset `DKYoon/SlimPajama-6B`. No se aplica cuantizacion (los pesos se mantienen en FP16) y no se utiliza fine-tuning posterior (BEAM fine-tuning desactivado). El resultado es un modelo con esparsidad en la mayoría de las capas, excepto en embeddings, la cabeza de salida y ciertas capas como el router del MLP, que se mantienen densas. No se ha publicado información sobre el proceso de entrenamiento original del modelo base, pero se sabe que Qwen2.5 fue preentrenado con 18 billones de tokens de datos de alta calidad.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen2.5-0.5B, aunque la poda puede degradar ligeramente la calidad.
- Razonamiento basico: el modelo base es capaz de tareas simples de razonamiento y comprension, pero su tamano limitado restringe la complejidad.
- Codigo: el modelo base tiene cierta capacidad de generacion de codigo, pero no es su punto fuerte.
- Multilingue: el modelo base soporta principalmente ingles y chino; no se confirma si esta version mantiene exactamente los mismos idiomas.
- No se especifican capacidades especiales como tool calling, agentes o vision en la informacion disponible.

## Casos de uso

- Prototipado rapido en entornos sin GPU: al ser un modelo de 0.5B con esparsidad, puede ejecutarse en CPU con un rendimiento aceptable para pruebas de concepto o demos interactivas.
- Despliegue en edge devices: su tamano reducido (alrededor de 1 GB en disco) lo hace adecuado para dispositivos con memoria limitada, como Raspberry Pi o moviles, siempre que se acepte una calidad de generacion inferior al modelo original.
- Experimentacion con compresion de modelos: sirve como punto de partida para investigar el impacto de la poda 2:4 en modelos pequenos, comparando con el modelo denso original.
- Filtrado de texto o clasificacion basica: tareas de NLP sencillas como analisis de sentimiento o extraccion de entidades, donde la velocidad prima sobre la calidad.
- Generacion de texto de baja latencia en servidores: en escenarios donde se necesitan muchas respuestas cortas y rapidas, la esparsidad puede acelerar la inferencia en GPUs compatibles.
- Educacion y formacion: util para ensenar conceptos de compresion de modelos y esparsidad en cursos de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion es la divergencia KL frente al modelo original:

| Dataset | Avg KL | Total KL | Tokens |
| --- | --- | --- | --- |
| wikitext2 | 2.243925 | 12328.1245 | 5.494 |
| c4 | 2.060808 | 75944.8832 | 36.852 |

Estos valores indican una divergencia moderada, pero sin una referencia comparativa no se puede concluir si la degradacion es aceptable para tareas concretas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 494M de parametros en FP16, ocupa aproximadamente 1 GB en memoria. Con la esparsidad 2:4, el uso efectivo puede ser menor en hardware que soporte operaciones esparsas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) o incluso CPUs modernas con suficiente RAM.
- Cabe en GPUs consumer: si, cualquier GPU de gama media o baja puede ejecutarlo.
- Opciones de despliegue: al ser un modelo safetensors, se puede cargar con Hugging Face Transformers. Para aprovechar la esparsidad 2:4 se requiere un backend compatible, como vLLM con soporte de kernels esparsos o librerias especializadas en poda (por ejemplo, SparseML). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos. En una GPU moderna, se espera una generacion de cientos de tokens por segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-0.5B (base) | 494M | 32.768 | Apache 2.0 | safetensors | Modelo original sin compresion. |
| elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib128-weakscale-blade | 494M | no disponible | no disponible | safetensors | Version comprimida con esparsidad 2:4. |
| Qwen/Qwen2.5-1.5B | 1.540M | 32.768 | Apache 2.0 | safetensors | Modelo mayor, mas capaz pero mas pesado. |

No se dispone de datos de rendimiento comparativos entre estos modelos, por lo que la comparacion se limita a caracteristicas tecnicas.

## Limitaciones y advertencias

- La poda 2:4 introduce una degradacion de calidad que se refleja en la divergencia KL (2.24 en wikitext2, 2.06 en c4). No se ha evaluado el impacto en tareas especificas.
- No hay informacion sobre sesgos o alucinaciones del modelo comprimido; se asume que hereda los del modelo base, que no estan documentados en esta ficha.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- El modelo no ha sido fine-tuneado despues de la compresion, por lo que su rendimiento puede ser inferior al de una version ajustada.
- No se garantiza la compatibilidad con todos los frameworks de inferencia; la esparsidad 2:4 solo se aprovecha en backends que la soporten explicitamente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente o poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib128-weakscale-blade
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
