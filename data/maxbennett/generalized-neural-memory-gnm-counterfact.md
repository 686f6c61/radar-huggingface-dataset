# maxbennett/generalized-neural-memory-gnm-counterfact

## Resumen

Generalized Neural Memory (GNM) en su variante CounterFACT es un modelo de investigación desarrollado por Max S. Bennett, Thomas Zollo y Richard Zemel, presentado en el artículo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language" (NeurIPS 2026). Se trata de una adaptación de la arquitectura MemoryLLM sobre el modelo base meta-llama/Meta-Llama-3-8B-Instruct, entrenada con memorización condicionada por instrucciones para aprender de forma selectiva hechos, formatos de respuesta y políticas de rechazo a partir de un flujo documental continuo.

El problema que aborda es el de la adaptación continua en entornos no estacionarios: en lugar de recurrir a fine-tuning continuo o a aprendizaje en contexto, el modelo incorpora una memoria neuronal que se actualiza mediante instrucciones en lenguaje natural, con un coste de cómputo reducido y un olvido mínimo. Esta variante concreta está especializada en el benchmark CounterFACT, que evalúa la capacidad del modelo para distinguir hechos contrafactuales de hechos reales y para decidir cuándo debe rechazar una consulta.

El checkpoint tiene 9.783.615.488 parámetros en formato safetensors, ocupa 19,6 GB en el repositorio y se distribuye bajo licencia llama3. Es un modelo de nicho orientado a investigación, con 6 descargas y 1 like en HuggingFace en el momento de la consulta, y su uso previsto es a través del repositorio oficial de código, no mediante pipelines genéricos de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MemoryLLM (transformer con memoria neuronal) sobre Llama-3-8B; detalles completos no disponibles |
| Parámetros totales | 9.783.615.488 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantización | no disponible (el repositorio publica safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; hereda los del modelo base Llama 3 8B Instruct |
| Licencia | llama3 |
| Formato de pesos | safetensors en el repositorio de HuggingFace; el script oficial de descarga lo coloca como `model.pth` |

## Arquitectura y entrenamiento

El modelo se construye sobre MemoryLLM, una arquitectura que extiende un transformer estándar con un mecanismo de memoria neuronal persistente, de forma que el conocimiento puede actualizarse sin modificar los pesos del modelo. En esta variante, la actualización de memoria está condicionada por instrucciones en lenguaje natural (instruction-conditioned memorization), lo que permite al sistema decidir qué hechos incorporar, qué formatos de respuesta adoptar y qué políticas de rechazo aplicar a partir de un flujo de documentos. El checkpoint parte de Meta-Llama-3-8B-Instruct y se entrena específicamente para el benchmark CounterFACT.

El artículo describe el sistema como una alternativa ligera al fine-tuning continuo y al aprendizaje en contexto, con el objetivo de lograr actualizaciones de bajo coste y olvido reducido. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales sobre el modelo base; tampoco se detalla el tamaño del pool de memoria. El dataset asociado es `maxbennett/generalized-neural-memory-counterfact`. La integración práctica se realiza a través del repositorio oficial de código, con la clave de registro `memoryllm_chat`.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Meta-Llama-3-8B-Instruct.
- Memorización selectiva de hechos a partir de instrucciones en lenguaje natural, incluyendo la incorporación de información procedente de un flujo documental.
- Aprendizaje de formatos de respuesta indicados explícitamente en las instrucciones de memoria.
- Aplicación de políticas de rechazo configurables, es decir, el modelo puede aprender cuándo debe negarse a responder.
- Manejo del benchmark CounterFACT, orientado a distinguir hechos contrafactuales de hechos verificables.
- Capacidades multilingües: no documentadas en la model card; las del modelo base no se detallan para este checkpoint.
- Soporte de tool calling, function calling y razonamiento multi-paso en modo agente: no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en memoria neuronal: reproducción de los resultados de la tabla 1 del artículo sobre el benchmark CounterFACT usando el script de evaluación del repositorio oficial, con el modelo situado en `models/gnm_counterfact/model.pth`.
- Evaluación de adaptación continua: simular un entorno no estacionario en el que se inyectan documentos sucesivos y se comprueba si el modelo actualiza su conocimiento sin reentrenar los pesos.
- Estudio de políticas de rechazo: entrenar y evaluar la capacidad del modelo para negarse a responder ante consultas fuera de su base de conocimiento, ajustando las instrucciones de memoria.
- Control de formato de salida: usar instrucciones de memoria para fijar plantillas de respuesta (JSON, listas estructuradas) en flujos de extracción de información, sin modificar los pesos.
- Análisis comparativo de olvido catastrófico: medir la retención de hechos previos tras sucesivas actualizaciones de memoria frente a líneas base de fine-tuning continuo.
- Experimentación académica sobre bases de datos contrafactuales: validar si el modelo distingue hechos reales de variantes contrafactuales generadas sintéticamente, útil en trabajos de fidelidad factual.
- Prototipado de asistentes con memoria de documentos: integrar el modelo en el stack de servicio de largo horizonte mencionado en el artículo para mantener contexto documental en conversaciones extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 19,6 GB solo para los pesos, más el coste de activaciones y del estado de memoria, que no está documentado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5,5 a 6 GB para los pesos; no se publican cuantizaciones oficiales, por lo que este cálculo es orientativo a partir del número de parámetros.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S; adecuadas para fp16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en fp16 de forma ajustada, aunque el estado de memoria añade overhead; tarjetas con 12-16 GB requerirían cuantización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante el repositorio `Generalized-Neural-Memory` con el script `scripts/download_models.py --counterfact` y la clave de registro `memoryllm_chat`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria neuronal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GNM CounterFACT (este modelo) | 9,78 B | no disponible | Sí, condicionada por instrucciones | llama3 | HuggingFace + repositorio de código |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | No | llama3 | HuggingFace |
| MemoryLLM (arquitectura base) | no disponible | no disponible | Sí | no disponible | Repositorio de investigación |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La diferencia principal de GNM CounterFACT frente a Llama 3 8B Instruct es la capa de memoria controlable por lenguaje natural; frente a MemoryLLM original, la generalización del control de qué se memoriza y qué políticas de rechazo se aplican.

## Limitaciones y advertencias

- Modelo de investigación con 6 descargas y 1 like: no hay evidencia de validación en producción ni de mantenimiento continuado más allá de la actualización del repositorio.
- No se documentan sesgos conocidos, pero al derivar de Llama 3 8B Instruct hereda los sesgos del preentrenamiento y del ajuste de instrucciones del modelo base.
- Riesgo de alucinación: el mecanismo de memoria pretende reducirlo en el dominio de los hechos memorizados, pero no hay métricas publicadas que cuantifiquen la tasa de error fuera del benchmark CounterFACT.
- Longitud de contexto no especificada en la model card; el uso de memoria persistente no equivale a una ventana de contexto ampliada y no se documenta su comportamiento en secuencias largas.
- Idiomas soportados no documentados para este checkpoint; el rendimiento fuera del inglés no está garantizado.
- Licencia llama3: uso comercial permitido bajo los términos de la licencia de Meta Llama 3, con las restricciones habituales (atribución, límite de 700 millones de usuarios mensuales para licenciatarios, política de uso aceptable). Requiere revisar el texto completo antes de un despliegue comercial.
- No se publican cuantizaciones oficiales ni integraciones con servidores de inferencia estándar, lo que dificulta el despliegue en producción.
- El formato de pesos del repositorio es safetensors, pero el flujo oficial espera un `model.pth`, lo que añade un paso de conversión o descarga específico.
- Al ser una arquitectura con memoria latente, el comportamiento puede degradarse si las instrucciones de memoria son ambiguas o contradictorias; no hay guías publicadas sobre buenas prácticas de prompting de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-gnm-counterfact
- Variante GNM completa: https://huggingface.co/maxbennett/generalized-neural-memory-gnm-all
- Dataset CounterFACT: https://huggingface.co/datasets/maxbennett/generalized-neural-memory-counterfact
- Repositorio de código: https://github.com/maxbennett/Generalized-Neural-Memory
- README del repositorio: https://github.com/maxbennett/Generalized-Neural-Memory/blob/main/README.md
- Artículo (arXiv, versión 1): https://arxiv.org/html/2602.23201v1
- Artículo (arXiv, versión 2): https://arxiv.org/html/2602.23201v2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
