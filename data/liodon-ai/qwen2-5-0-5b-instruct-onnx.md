# liodon-ai/Qwen2.5-0.5B-Instruct-ONNX

## Resumen

Este repositorio contiene una exportación ONNX del modelo Qwen2.5-0.5B-Instruct, publicada por Liodon AI. El modelo original, desarrollado por Alibaba Cloud, es un modelo de lenguaje de la serie Qwen2.5 afinado para instrucciones, con aproximadamente 500 millones de parámetros. La exportación se ha realizado con la librería optimum de Hugging Face, utilizando la tarea `text-generation-with-past`, lo que permite decodificación autorregresiva con caché de claves y valores (KV-cache). Se incluyen dos versiones: una en precisión FP32 y otra cuantizada dinámicamente a INT8 (solo pesos, sin calibración), lo que facilita la inferencia eficiente en CPU mediante ONNX Runtime. Esta ficha es relevante para desarrolladores que necesitan desplegar un modelo de chat ligero en entornos con recursos limitados o sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, INT8 dinamico (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del modelo Qwen2.5-0.5B-Instruct, que pertenece a la familia Qwen2.5 de Alibaba Cloud. Aunque la model card no detalla la arquitectura interna, se sabe que Qwen2.5 utiliza una arquitectura transformer causal con atención de múltiples cabezas. La exportación se realizó con `optimum.exporters.onnx.main_export` para la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para optimizar la generación autoregresiva. No se proporcionan datos sobre el entrenamiento del modelo original (número de tokens, composición del dataset, métodos de alineación) en la información disponible.

## Capacidades

- Generación de texto y conversación: al ser una versión instruct del modelo Qwen2.5, se espera que pueda mantener diálogos multi-turno y seguir instrucciones básicas.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, aunque su tamaño reducido limita la profundidad en tareas complejas.
- Soporte para tool calling: no se menciona explícitamente en la model card, pero el modelo original Qwen2.5-0.5B-Instruct no incluye soporte nativo para function calling según la documentación oficial.
- Multilingüismo: no se especifican los idiomas soportados en la información proporcionada.
- Inferencia eficiente en CPU: gracias a la cuantización INT8 y al formato ONNX, puede ejecutarse en entornos sin GPU con ONNX Runtime.

## Casos de uso

- Chatbots ligeros para atención al cliente: el modelo puede gestionar conversaciones sencillas en tiempo real en un servidor CPU, gracias a su tamaño reducido y a la cuantización INT8 que reduce el uso de memoria y acelera la inferencia.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo pequeño y fácil de desplegar, es adecuado para validar ideas o generar respuestas de ejemplo antes de escalar a modelos mayores.
- Asistentes de escritura en dispositivos edge: puede ejecutarse en dispositivos con pocos recursos (Raspberry Pi, portátiles antiguos) para tareas de autocompletado o generación de borradores.
- Clasificación y extracción de información simple: aunque no está optimizado para ello, puede utilizarse para tareas de etiquetado o resumen breve con un prompt adecuado.
- Educación e investigación: sirve como modelo de referencia para estudiar el impacto de la cuantización y la exportación a ONNX en el rendimiento y la precisión.
- Despliegue en entornos con restricciones de hardware: al no requerir GPU, es viable en infraestructuras cloud con solo CPU, reduciendo costes operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo cuantizado INT8 (0.63 GB) puede ejecutarse en CPU con al menos 1 GB de RAM libre, aunque no se especifican requisitos mínimos.
- GPU: no es necesaria, pero si se dispone de una, ONNX Runtime puede aprovecharla con el proveedor CUDA para acelerar la inferencia.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), optimum.onnxruntime (ORTModelForCausalLM), y cualquier framework que soporte ONNX.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Se puede comparar con el modelo original en PyTorch (Qwen/Qwen2.5-0.5B-Instruct) en cuanto a formato y licencia, pero no hay datos de rendimiento. Otras alternativas como TinyLlama o Phi-2 no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT8 dinámica (solo pesos) puede provocar una ligera degradación en la calidad de las respuestas en comparación con el modelo FP32 original.
- Al ser una exportación, es posible que algunas operaciones no estén optimizadas para todas las plataformas; se recomienda probar en el entorno objetivo.
- El modelo base tiene limitaciones propias de su tamaño: conocimiento limitado, posible sesgo en los datos de entrenamiento y riesgo de alucinaciones en temas especializados.
- No se especifican los idiomas soportados, por lo que su rendimiento en español u otros idiomas no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo original.

## Enlaces

- [Repositorio HuggingFace del modelo ONNX](https://huggingface.co/liodon-ai/Qwen2.5-0.5B-Instruct-ONNX)
- [Modelo original Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Documentación de Qwen2.5 en ModelScope](https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct)
- [Página de Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:0.5b-instruct)
