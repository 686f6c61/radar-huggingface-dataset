# RedHatAI/Meta-Llama-3-8B-Instruct-quantized.w8a8

## Resumen

Este modelo es una versión cuantizada de Meta-Llama-3-8B-Instruct, desarrollada por Neural Magic y publicada en el espacio de Red Hat AI. Aplica una cuantización de pesos y activaciones a INT8 (esquema W8A8) sobre el modelo original, lo que reduce el tamaño en disco y los requisitos de memoria de GPU aproximadamente a la mitad, a la vez que duplica el rendimiento de las multiplicaciones de matrices. Según el benchmark OpenLLM (versión 1), la puntuación media es de 68,66, frente al 68,54 del modelo sin cuantizar, lo que demuestra una pérdida de precisión casi nula.

Se trata de un modelo de chat en inglés, diseñado para uso comercial y de investigación, que se puede desplegar de forma eficiente con vLLM o con Transformers. Su relevancia radica en ofrecer una alternativa ligera al Llama-3-8B-Instruct original, permitiendo su ejecución en GPUs de gama media o en entornos de producción con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Meta-Llama-3 (Transformer decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, no indicado) |
| Tipos de cuantizacion | INT8 para pesos y activaciones (W8A8) |
| Idiomas soportados | Inglés |
| Licencia | Llama 3 (https://llama.meta.com/llama3/license/) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada de Meta-Llama-3-8B-Instruct, por lo que mantiene la arquitectura Transformer decoder-only de la serie Llama 3. La cuantización se realizó con el algoritmo GPTQ (descrito en arxiv:2210.17323), aplicado mediante la librería llm-compressor. El esquema de cuantización es W8A8: los pesos se cuantifican de forma simétrica estática por canal, mientras que las activaciones se cuantifican de forma simétrica dinámica por token. Solo se cuantizan los operadores lineales dentro de los bloques del transformer, excluyendo la capa de salida (lm_head). Para la calibración se utilizaron 256 secuencias de 8.192 tokens aleatorios con un factor de damping del 1%. No se realizó ningún entrenamiento adicional ni fine-tuning; solo se aplicó la cuantización sobre los pesos del modelo original.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualmente relevantes en inglés, apropiadas para tareas de chat y asistencia.
- Instrucción y razonamiento: al ser una versión instructa del modelo, sigue instrucciones complejas y puede realizar tareas de razonamiento básico y medio.
- Generación de código: hereda la capacidad de Llama-3-8B-Instruct para escribir y explicar código en varios lenguajes, aunque no se especifica en la documentación.
- Capacidades multilingües: limitadas, el modelo está entrenado principalmente en inglés y no se recomienda su uso en otros idiomas.
- No se documenta soporte para tool calling, agentes o funciones especiales; el modelo está orientado a chat.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones de soporte en inglés, respondiendo preguntas frecuentes y resolviendo problemas comunes de forma natural.
- **Asistente de programación**: puede ayudar a escribir, revisar o explicar código, siendo útil en entornos de desarrollo donde se requiere una generación de código rápida y con bajo consumo de recursos.
- **Generación de contenido**: adecuado para redactar textos, resumir documentos o crear borradores de correos electrónicos, aprovechando su capacidad de instrucción.
- **Análisis de texto**: puede extraer información, clasificar sentimientos o resumir artículos en inglés, gracias a su capacidad de comprensión lingüística.
- **Prototipado de aplicaciones de IA**: permite desarrollar y probar aplicaciones de chat sin necesidad de una GPU de alta gama, gracias a su menor demanda de memoria.
- **Despliegue en entornos con recursos limitados**: su tamaño reducido lo hace adecuado para servidores con GPU de 8-10 GB de VRAM, como la RTX 3080 o RTX 3090.

## Benchmarks y rendimiento

El modelo fue evaluado en el leaderboard de OpenLLM (versión 1) con el conjunto de tareas estándar. La puntuación promedio es de 68,66, frente al 68,54 del modelo original sin cuantizar. No se han publicado resultados detallados de tareas individuales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | OpenLLM (promedio) |
|---|---|
| Meta-Llama-3-8B-Instruct (original) | 68,54 |
| Meta-Llama-3-8B-Instruct-quantized.w8a8 | 68,66 |

## Requisitos de hardware

- **VRAM estimada**: al ser INT8, el modelo ocupa aproximadamente la mitad de la VRAM del modelo original de 8B (que suele requerir ~16 GB en FP16). Por tanto, se estima entre 8 y 10 GB de VRAM para inferencia con contexto corto.
- **GPUs compatibles**: puede ejecutarse en GPUs de consumo como RTX 3080, RTX 3090, RTX 4090, así como en GPUs de centro de datos como A100, V100 o H100.
- **Despliegue**: soporta vLLM (con servidor OpenAI-compatible), Transformers con `generate()`, y también puede ser usado con `llama.cpp` si se convierte a formato GGUF, aunque no se menciona en la documentación.
- **Latencia y throughput**: al cuantizar, se espera un aumento de aproximadamente 2x en el throughput de las multiplicaciones de matrices, pero no se proporcionan datos de latencia específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento OpenLLM |
|---|---|---|---|---|
| Meta-Llama-3-8B-Instruct | 8B | 8K tokens (según documentación oficial) | Llama 3 | 68,54 |
| Meta-Llama-3-8B-Instruct-quantized.w8a8 | 8B | no disponible | Llama 3 | 68,66 |
| Mistral-7B-Instruct (v0.2) | 7B | 32K tokens | Apache 2.0 | no disponible en esta fuente |

La comparativa se limita a los datos disponibles; no hay información sobre otros modelos cuantizados W8A8 en la documentación. El modelo original y su versión cuantizada son casi equivalentes en rendimiento, lo que justifica su uso para reducir requisitos de hardware.

## Limitaciones y advertencias

- **Idioma**: está entrenado y evaluado únicamente en inglés. Su uso en otros idiomas puede producir respuestas erróneas o incoherentes.
- **Licencia**: la licencia Llama 3 tiene restricciones de uso comercial (requiere aprobación para usuarios con más de 700 millones de usuarios mensuales) y limita el uso a fines legales y no perjudiciales.
- **Riesgo de alucinación**: como todos los modelos generativos, puede inventar información o dar respuestas incorrectas, especialmente en temas poco representados en el entrenamiento.
- **Pérdida de precisión**: aunque el benchmark OpenLLM muestra una pérdida mínima, la cuantización puede afectar tareas de alta precisión en algunos dominios.
- **Sin soporte de herramientas**: no se documenta la capacidad de llamar funciones o usar herramientas, lo que limita su uso en flujos de trabajo automatizados que requieren interacción con APIs.

## Enlaces

- [Hugging Face: RedHatAI/Meta-Llama-3-8B-Instruct-quantized.w8a8](https://huggingface.co/RedHatAI/Meta-Llama-3-8B-Instruct-quantized.w8a8)
- [Modelo original en Hugging Face](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
- [FriendliAI - página del modelo](https://friendli.ai/models/RedHatAI/Meta-Llama-3-8B-Instruct-quantized.w8a8)
- [Toolify - página del modelo](https://www.toolify.ai/ai-model/redhatai-meta-llama-3-8b-instruct-quantized-w8a8)
- [Model Hub China - espejo del modelo](https://dev.modelhub.org.cn/RedHatAI/Meta-Llama-3-8B-Instruct-quantized.w8a8)
