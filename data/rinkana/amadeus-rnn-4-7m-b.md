# RinKana/Amadeus-RNN-4.7M-B

## Resumen

Amadeus-RNN-4.7M-B es un modelo de lenguaje ligero basado en una RNN lineal con gating dependiente de datos y scan asociativo paralelo, desarrollado por el usuario RinKana. Con solo 4,7 millones de parámetros, está diseñado para demostrar que es posible entrenar modelos generativos de texto con un consumo de recursos muy reducido, ejecutándose en GPUs de consumo con menos de 2 GB de VRAM. El modelo se entrenó sobre el dataset TinyStories (historias cortas en inglés), lo que lo convierte en una herramienta útil para experimentación y educación en IA, más que para aplicaciones de producción.

Su arquitectura, inspirada en los modelos SSM (State Space Models) como Mamba, emplea un scan asociativo con complejidad O(T log T) y una puerta λ que permite capturar dependencias de largo alcance sin la sobrecarga de los transformers. Incluye un tokenizador BPE personalizado con un vocabulario de 4096 tokens. La licencia Apache 2.0 facilita su uso y modificación, aunque el repositorio no muestra descargas ni actividad reciente, lo que sugiere que es un proyecto experimental o muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN lineal con gating dependiente de datos y scan asociativo paralelo (estilo SSM) |
| Parametros totales | 4,7 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado en ingles, dataset TinyStories) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no se especifica si safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

El modelo implementa una RNN lineal con una puerta λ dependiente de los datos, similar al mecanismo de selección de Mamba. En lugar de recurrencia secuencial, utiliza un scan asociativo paralelo que reduce la complejidad computacional a O(T log T), permitiendo un entrenamiento eficiente en hardware modesto. El tokenizador es un BPE propio con un vocabulario de 4096 tokens, adaptado al corpus de TinyStories.

El entrenamiento se realizó sobre el dataset `karpathy/tinystories-gpt4-clean`, que contiene historias cortas en inglés generadas con GPT-4. Según la model card, el proceso duró entre 2 y 3 horas en una GPU RTX 3060 Mobile, utilizando PyTorch con entrenamiento de precisión mixta (AMP). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El número total de tokens de entrenamiento no se especifica.

## Capacidades

- Generación de texto narrativo en inglés, específicamente historias cortas coherentes y gramaticalmente correctas, dado el dominio de TinyStories.
- Modelado de lenguaje básico con capacidad de capturar dependencias de largo alcance gracias a la puerta λ y el scan asociativo.
- Ejecución eficiente en entornos con recursos limitados (menos de 2 GB de VRAM), lo que permite inferencia en laptops y dispositivos de bajo consumo.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- El modelo es monolingüe de facto (inglés), aunque no se declara oficialmente la lista de idiomas soportados.

## Casos de uso

- Generación de cuentos infantiles personalizados: el modelo puede crear historias cortas en inglés a partir de un prompt inicial, adecuado para aplicaciones educativas o de entretenimiento infantil.
- Prototipado rápido de sistemas de generación de texto: su pequeño tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Investigación académica en arquitecturas RNN/SSM: sirve como banco de pruebas para estudiar el comportamiento de gating dependiente de datos y scan asociativo en modelos pequeños.
- Enseñanza de aprendizaje automático: ideal para demostrar el entrenamiento de un modelo de lenguaje desde cero en una GPU de consumo, con tiempos de entrenamiento de pocas horas.
- Generación de datos sintéticos para entrenar otros modelos: las historias generadas pueden usarse como aumentación de datos en tareas de comprensión lectora o clasificación de texto.
- Aplicaciones embebidas o en el borde: al requerir menos de 2 GB de VRAM, puede desplegarse en dispositivos con GPU integrada o incluso en CPU con cuantización (aunque no se proporcionan pesos cuantizados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no proporciona métricas de perplejidad ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB, según la model card.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM, por ejemplo RTX 3060, RTX 4060, GTX 1650, o incluso iGPUs modernas.
- El entrenamiento se realizó en una RTX 3060 Mobile (6 GB VRAM), pero la inferencia es notablemente más ligera.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse directamente con Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. Sería necesario convertir los pesos a formatos como GGUF para usar con llama.cpp, pero no se proporcionan.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura RNN, se espera una latencia baja en CPU/GPU, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. Podría compararse con modelos pequeños tipo RNN como RWKV-1.5B o Mamba-130M, pero no hay datos de rendimiento de Amadeus-RNN-4.7M-B para contrastar. Tampoco se conocen modelos de exactamente 4,7M de parámetros con la misma arquitectura. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en TinyStories, un corpus de historias cortas en inglés. Su vocabulario y estilo son limitados; no es adecuado para tareas generales de lenguaje, código o razonamiento complejo.
- No se han documentado sesgos específicos, pero al entrenarse con datos generados por GPT-4, puede heredar sesgos presentes en ese modelo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido inventado o incoherente, especialmente fuera del dominio de historias infantiles.
- No hay información sobre la longitud de contexto máxima; el modelo podría degradarse con secuencias largas.
- El repositorio no muestra archivos de pesos (tamaño 0.0 GB), lo que sugiere que quizás los pesos no están subidos o el modelo está en fase de publicación. Esto impide su uso directo hasta que se complete el repositorio.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos disponibles, la aplicabilidad práctica es nula en este momento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RinKana/Amadeus-RNN-4.7M-B
- Dataset de entrenamiento: https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean
- Nota: los resultados de búsqueda web incluyen otros proyectos llamados "Amadeus" (asistentes de investigación, generación musical, etc.) que no están relacionados con este modelo.
