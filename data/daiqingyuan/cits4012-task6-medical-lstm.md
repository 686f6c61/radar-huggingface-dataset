# daiqingyuan/cits4012-task6-medical-lstm

## Resumen

El modelo `daiqingyuan/cits4012-task6-medical-lstm` es un clasificador de textos médicos en inglés desarrollado como parte de la tarea 6 de la asignatura CITS4012 de Procesamiento de Lenguaje Natural. Su propósito es categorizar abstracts (resúmenes) de artículos médicos en una de cinco categorías amplias de condiciones de salud. Se trata de un artefacto educativo diseñado para reproducir los resultados de una práctica académica, no un sistema clínico.

La arquitectura consiste en una red LSTM (Long Short-Term Memory) con dos capas recurrentes de 128 unidades cada una, precedida por una capa de embeddings Word2Vec congelados de 100 dimensiones, entrenada únicamente sobre los abstracts del conjunto de entrenamiento de la asignatura. El modelo fue seleccionado por su macro-F1 en validación (0.6208) y alcanza una precisión en test de 0.6056 y un macro-F1 de 0.6038. El repositorio incluye el estado del modelo, el vocabulario ordenado, las etiquetas de salida, la configuración de la arquitectura y los metadatos de preprocesado.

A pesar de su tamaño reducido (el repositorio ocupa 0.0 GB), el modelo es relevante como ejemplo didáctico de clasificación de textos con LSTM y embeddings propios, y demuestra un flujo completo de entrenamiento, validación y empaquetado para inferencia reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de 2 capas con 128 unidades por capa y embeddings Word2Vec congelados de 100 dimensiones |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB, lo que sugiere un modelo muy pequeño) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (el embedding se almacena en float16 y se restaura a float32 para inferencia en CPU) |
| Idiomas soportados | inglés |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch state dict (probablemente .pt o .pth) |

## Arquitectura y entrenamiento

El modelo es una red LSTM clásica para clasificación de secuencias. La entrada se procesa mediante una capa de embeddings Word2Vec de 100 dimensiones, entrenada exclusivamente sobre los abstracts del conjunto de entrenamiento de la asignatura y congelada durante el entrenamiento del LSTM. La red recurrente está compuesta por dos capas de 128 unidades con dropout de 0.3, seguidas de una capa de salida con cinco neuronas (una por categoría). El entrenamiento se realizó con PyTorch y la selección del modelo final se basó en el macro-F1 de validación (0.6208). No se menciona el uso de técnicas como RLHF, DPO o ajuste fino adicional. El paquete de inferencia incluye el vocabulario ordenado y los metadatos de preprocesado para garantizar la reproducibilidad.

## Capacidades

- Clasificación de abstracts médicos en inglés en cinco categorías de condiciones de salud (las etiquetas específicas no se detallan en la documentación).
- Inferencia reproducible gracias al bundle empaquetado con vocabulario y configuración exacta.
- Funciona en CPU con precisión float32.
- No tiene capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Práctica académica de NLP: el modelo sirve como ejemplo completo de entrenamiento, validación y empaquetado de un clasificador LSTM para tareas de clasificación de textos.
- Demostración de embeddings propios: muestra cómo entrenar un Word2Vec sobre un corpus específico y utilizarlo congelado en una red recurrente.
- Reproducción de resultados: permite a otros estudiantes verificar los resultados de la tarea CITS4012 y comparar sus propios modelos.
- Clasificación preliminar de literatura médica: aunque con rendimiento limitado, puede usarse para categorizar abstracts en entornos educativos o de investigación no clínica.
- Benchmark educativo: sirve como línea base para comparar arquitecturas más complejas (transformers, etc.) en el mismo conjunto de datos.
- Ejemplo de empaquetado para inferencia: ilustra cómo preparar un modelo PyTorch con vocabulario y metadatos para su distribución en Hugging Face.

## Benchmarks y rendimiento

Los resultados reportados en la model card son:

| Metrica | Valor |
|---|---|
| Accuracy en test | 0.6056 |
| Macro-F1 en test | 0.6038 |
| Macro-F1 en validación | 0.6208 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero; puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- No se especifican GPUs recomendadas, pero por su tamaño cabría en cualquier tarjeta con al menos 1 GB de VRAM si se quisiera acelerar.
- Se puede desplegar con PyTorch estándar en entornos Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- La inferencia es prácticamente instantánea en CPU para abstracts de longitud típica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un modelo educativo de tamaño mínimo, no se puede establecer una comparativa con alternativas comerciales o de investigación sin datos adicionales.

## Limitaciones y advertencias

- Es un artefacto educativo, no un sistema clínico. No debe utilizarse para diagnosticar ni tratar ninguna condición médica.
- Rendimiento moderado: accuracy de 0.6056, lo que implica un margen de error considerable.
- Entrenado exclusivamente con abstracts de una asignatura específica, por lo que puede no generalizar a otros dominios médicos o estilos de redacción.
- Solo soporta inglés.
- No se proporcionan detalles sobre el tamaño del vocabulario ni la longitud máxima de secuencia, lo que limita el conocimiento de sus capacidades reales.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero al ser un modelo educativo, su utilidad en producción es muy limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/daiqingyuan/cits4012-task6-medical-lstm)
- [Repositorio GitHub de la asignatura (Alice-Yuan0927/CITS4012)](https://github.com/Alice-Yuan0927/CITS4012)
