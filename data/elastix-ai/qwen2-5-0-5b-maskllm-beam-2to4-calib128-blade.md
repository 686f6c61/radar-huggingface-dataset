# elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib128-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib128-blade` es una versión comprimida del modelo base `Qwen/Qwen2.5-0.5B`, desarrollada por el equipo de elastix-ai. El objetivo es reducir el coste computacional de inferencia mediante poda semiestructurada 2:4 (dos de cada cuatro pesos se anulan) y un posterior ajuste fino con la técnica BEAM para recuperar la precisión perdida. El resultado es un modelo con los mismos 494 millones de parámetros que el original, pero con una densidad de cómputo reducida a la mitad en la mayoría de las capas, lo que lo hace especialmente atractivo para despliegues en entornos con recursos limitados.

La compresión se realizó con el método "blade" (poda) y calibración sobre 128 muestras del dataset SlimPajama-6B con una longitud de secuencia de 2048 tokens. No se aplica cuantización (los pesos se mantienen en 16 bits con formato gfp), por lo que la reducción de memoria es limitada, pero la aceleración computacional puede ser significativa en hardware que soporte sparse execution. Este modelo es relevante para quienes buscan una alternativa ligera al Qwen2.5-0.5B original sin renunciar a la arquitectura transformer estándar, y para experimentar con técnicas de compresión de modelos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32.768 tokens, pero no se especifica en esta version) |
| Tipos de cuantizacion | Sin cuantizacion; pesos en 16 bits (formato gfp) |
| Idiomas soportados | no disponible (hereda los del modelo base, principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura transformer estándar de Qwen2.5-0.5B, con atención por capas y MLP. La compresión se realiza mediante poda semiestructurada 2:4 aplicada a todas las capas excepto embeddings, lm_head, la convolución 1D de atención lineal (si existe) y el router del MLP. Esta poda elimina el 50% de los pesos en las capas afectadas, reduciendo el número de operaciones de multiplicación de matrices. Posteriormente se aplica un ajuste fino con el método BEAM (probablemente un acrónimo de "BEAM fine-tuning") que utiliza búsqueda de hiperparámetros con Optuna y un espacio de búsqueda que incluye tasa de aprendizaje y tamaño de lote. La calibración se realizó con 128 muestras del dataset SlimPajama-6B, con una longitud de secuencia de 2048 tokens y calibración simétrica desactivada.

No se aplica cuantización de pesos (el campo `quantize` es `false`), pero se especifica un formato gfp de 16 bits con grupos de 32, lo que sugiere que los pesos se almacenan en un formato de punto flotante de 16 bits con exponente de 5 bits y mantisa de 10 bits (similar a bf16 pero con configuración personalizada). El proceso de entrenamiento incluye un ajuste fino posterior a la poda, con un máximo de 100 pasos y un mínimo de 10, utilizando el algoritmo de búsqueda Optuna.

## Capacidades

- Generación de texto: al ser una versión comprimida de Qwen2.5-0.5B, conserva las capacidades básicas de generación de lenguaje del modelo original, aunque con posible degradación debido a la poda.
- Razonamiento y comprensión: capacidades limitadas propias de un modelo de 0.5B, adecuadas para tareas simples de clasificación, extracción de información y diálogo corto.
- Codigo: el modelo base Qwen2.5-0.5B tiene cierta capacidad de generación de código, pero es limitada en comparación con modelos más grandes.
- Multilingüismo: no se especifican idiomas, pero el modelo base soporta principalmente inglés y chino.
- Tool calling y agentes: no se menciona soporte específico; el modelo base de 0.5B no incluye estas capacidades de forma nativa.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Inferencia en dispositivos edge: gracias a la poda 2:4, el modelo reduce el número de operaciones FLOPs a la mitad, lo que permite ejecutarlo en CPUs o GPUs de baja potencia, como Raspberry Pi o teléfonos móviles, para tareas de clasificación de texto o generación de respuestas cortas.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y comprimido, es ideal para validar ideas de productos que requieran generación de texto sin necesidad de infraestructura costosa.
- Filtrado y moderación de contenido: puede utilizarse para clasificar mensajes en categorías (spam, toxicidad, etc.) con baja latencia y consumo de recursos.
- Asistentes de chat simples: para chatbots de soporte con respuestas predefinidas o generación de texto breve, el modelo puede integrarse en servidores ligeros.
- Experimentación con técnicas de compresión: sirve como referencia para estudiar el impacto de la poda 2:4 y el ajuste fino BEAM en el rendimiento de modelos pequeños.
- Generación de aumentación de datos: puede usarse para crear variaciones de textos en pipelines de entrenamiento de otros modelos, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión comprimida. Se recomienda evaluar el modelo en las tareas específicas de interés antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: al tener 494 millones de parámetros en 16 bits, el tamaño en memoria es de aproximadamente 1 GB (494M × 2 bytes). Con la poda 2:4, el almacenamiento no se reduce, pero el cómputo sí.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son suficientes. También puede ejecutarse en CPU con 8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo transformer estándar, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que el runtime soporte la poda 2:4 (por ejemplo, kernels sparse de NVIDIA A100 o H100, o librerías como torch.sparse). En hardware sin soporte sparse, la aceleración no se aprovechará.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero depende del hardware y del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 494M | 32.768 | Apache 2.0 | Modelo base sin compresión |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Versión ajustada para instrucciones |
| Este modelo comprimido | 494M | no disponible | no disponible | Poda 2:4 + BEAM, sin cuantización |

La comparativa se limita al modelo original y su variante instruct, ya que no se dispone de información sobre otras versiones comprimidas de Qwen2.5-0.5B. La principal diferencia es la poda 2:4, que reduce el coste computacional a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- La poda 2:4 puede degradar el rendimiento en tareas que requieren precisión numérica, como matemáticas o razonamiento lógico, en comparación con el modelo original.
- No se ha publicado información sobre sesgos o alucinaciones específicas de esta versión; al ser un modelo pequeño, es más propenso a errores y respuestas incoherentes que modelos más grandes.
- La licencia no está especificada en la ficha de HuggingFace, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El formato gfp de 16 bits puede no ser compatible con todos los runtimes; es necesario verificar la compatibilidad con la infraestructura de despliegue.
- No se dispone de información sobre la longitud de contexto efectiva tras la compresión; se asume que es la misma que el modelo base (32.768), pero no está confirmado.
- El modelo no incluye capacidades de tool calling ni agentes, por lo que no es adecuado para aplicaciones que requieran interacción con APIs externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib128-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
