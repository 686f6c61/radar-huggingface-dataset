# microtensor-archive/mt-code-3g-r1236-5GCb9fhg

## Resumen

Este repositorio contiene una copia de archivo de un sistema enviado a la subred Microtensor (Bittensor netuid 92), un protocolo descentralizado que mide la precisión de modelos de lenguaje en tareas de código. El identificador `mt-code-3g-r1236-5GCb9fhg` indica que pertenece al arena de código `code/mt-3g`, en la ronda 1236, con estado "confirmado" por los validadores de la red. El modelo tiene 596 millones de parámetros y se distribuye en formato GGUF, lo que permite su ejecución en entornos de inferencia locales con llama.cpp o similares.

La red Microtensor mide la calidad de los sistemas de forma objetiva mediante validadores distribuidos. En este caso, el registro de la red indica una calidad medida de 0.0, un coste esperado de 14.432 ms por consulta y una replicación de 1. No se dispone de información pública sobre la arquitectura interna, el proceso de entrenamiento, la licencia o los datos de evaluación más allá de las métricas de la propia subnet. La relevancia de este repositorio reside en que sirve como archivo verificable de un sistema participante en una infraestructura de evaluación descentralizada, no como un modelo de propósito general listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (p. ej., transformer, MoE, SSM) ni sobre los datos de entrenamiento. El repositorio no incluye una model card convencional con detalles de arquitectura, tokenización o proceso de ajuste. La red Microtensor certifica el rendimiento mediante validadores distribuidos, pero no proporciona en este archivo información sobre el diseño del modelo.

El tamaño de 596 millones de parámetros sugiere un modelo de escala media, típico en tareas de generación de código, pero sin datos verificados sobre el tipo de arquitectura o el corpus de entrenamiento, no es posible realizar afirmaciones técnicas adicionales.

## Capacidades

- Generación de código: el modelo se presentó en el arena de código de Microtensor, por lo que se asume que su propósito principal es la generación o finalización de código.
- Ejecución en formato GGUF: puede ejecutarse en entornos de inferencia locales mediante llama.cpp, Ollama u otros motores compatibles.
- Integración con Bittensor: diseñado para ser evaluado y ejecutado dentro de la subred Microtensor, con verificación por validadores.
- No se dispone de información sobre tool calling, agentes, razonamiento multilingüe o capacidades multimodales.

## Casos de uso

- Evaluación de sistemas en subredes descentralizadas: el modelo se usa como un sistema participante en la ronda 1236 de la subnet Microtensor, donde validadores miden su calidad sobre tareas de código.
- Archivo y auditoría de modelos: el repositorio sirve como registro verificable de un sistema con su certificado y digest, útil para auditorías o investigaciones sobre la evolución de la red.
- Inferencia local en formato GGUF: al estar en formato GGUF, puede cargarse en herramientas como llama.cpp para experimentos de generación de código, aunque sin información sobre su calidad, no se recomienda para producción.
- Investigación sobre protocolos de validación: el repositorio es un caso de estudio de cómo Bittensor y Microtensor certifican modelos mediante mediciones distribuidas.

No hay información adicional que permita recomendar el modelo para aplicaciones comerciales o de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica disponible es la calidad medida por la red Microtensor: **0.0** en la ronda 1236, con un coste esperado de **14.432 ms por consulta**. Estos valores son medidos por los validadores de la subred, no auto-reportados, pero no se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parámetros y formato GGUF, el modelo cabe en GPU de consumo con al menos 4 GB de VRAM (p. ej., GTX 1650 o superior) en cuantización de 4 bits, pero no se ha confirmado el tipo de cuantización.
- GPU recomendadas: tarjetas con soporte de CUDA de gama media o alta (RTX 3060, RTX 4060, etc.) para inferencia fluida; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier motor compatible con GGUF.
- Latencia: el coste esperado de 14.432 ms por consulta es un valor medido por la red, que puede variar en función del hardware.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información disponible. La única referencia es la arena `code/mt-3g` de Microtensor, que define el conjunto de tareas de código, pero no se detallan otros modelos de la misma categoría.

## Limitaciones y advertencias

- Calidad medida: la red Microtensor reporta una calidad de 0.0, lo que indica un rendimiento nulo en las tareas de referencia. No se recomienda su uso en aplicaciones reales sin evaluación adicional.
- Sesgos y alucinación: no se dispone de información sobre sesgos o riesgos de alucinación; no se han realizado evaluaciones estándar.
- Licencia: no se especifica licencia; el uso comercial está restringido por la falta de términos claros.
- Soporte de idiomas: no se indica qué idiomas soporta; se asume que el modelo se centra en código, no en lenguaje natural.
- Contexto: no se dispone de información sobre la longitud de contexto, lo que limita su uso en tareas que requieran memoria larga.
- Reproducibilidad: el repositorio no incluye el manifiesto original, solo los bytes verificados por la red, lo que puede dificultar la reproducción exacta del sistema.

## Enlaces

- HuggingFace: https://huggingface.co/microtensor-archive/mt-code-3g-r1236-5GCb9fhg
- Microtensor subnet (GitHub): https://github.com/microtensor-io/microtensor-subnet
- Bittensor netuid 92: https://github.com/microtensor-io/microtensor-subnet (referencia de la subred)
