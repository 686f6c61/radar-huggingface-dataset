# HarikaSahini/shrk_my_awesome_eli5_clm-model

## Resumen

El modelo `shrk_my_awesome_eli5_clm-model` es un fine-tuning de `distilbert/distilgpt2` desarrollado por HarikaSahini. Se trata de un modelo de lenguaje causal (decoder-only) basado en la arquitectura Transformer, con 81.912.576 parámetros, y ha sido entrenado sobre un dataset no documentado. La finalidad del modelo no está especificada por el autor; por su tamaño, se enmarca como un experimento de ajuste fino sobre un modelo base compacto.

El modelo se publica bajo licencia Apache-2.0 y está disponible en HuggingFace en formato safetensors. No se han publicado benchmarks ni evaluaciones de capacidades, y la model card contiene únicamente información de entrenamiento (loss de validación de 3,7622). Su relevancia es limitada en entornos de producción, pero puede servir como referencia para estudiar el efecto del fine-tuning en modelos pequeños.

La arquitectura hereda de distilgpt2 un contexto de 1024 tokens, aunque este dato no se confirma en la información del modelo, y una capacidad de generación de texto autoregresiva. No se documentan características adicionales como tool calling, visión o audio.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en GPT-2, destilada) |
| Parámetros totales | 81.912.576 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredado de distilgpt2, que usa 1024 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilgpt2`, una versión destilada de GPT-2 que reduce el número de capas (6 en lugar de 12) manteniendo el mismo diseño decoder-only. No se ha publicado información sobre el dataset de entrenamiento, ni sobre la composición de datos, ni sobre técnicas de alineación como RLHF o DPO. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate 2e-5, batch size 8, 3 épocas y 3960 pasos, con un scheduler lineal y el optimizador AdamW. La loss de validación final fue de 3,7622.

## Capacidades

- Generación de texto autoregresiva básica, heredada de la arquitectura GPT-2.
- No se han documentado capacidades de tool calling / function calling.
- No se han documentado capacidades de agentes o razonamiento multi-paso.
- No se han documentado capacidades de visión, audio o multimodalidad.
- Soporte multilingüe no disponible; el modelo base está entrenado principalmente en inglés, pero el dataset de fine-tuning es desconocido.
- No se ha documentado ningún modo de razonamiento especial (thinking mode).

## Casos de uso

- Investigación académica sobre fine-tuning: el modelo permite analizar cómo el ajuste de distilgpt2 en un dataset desconocido afecta a la pérdida de validación; su tamaño reducido facilita la ejecución de experimentos en hardware modesto.
- Prototipado de aplicaciones de generación de texto: al ser un modelo pequeño, puede ejecutarse en CPU y sirve para validar flujos de trabajo antes de invertir en modelos más grandes.
- Educación en aprendizaje automático: es un ejemplo práctico de fine-tuning de un modelo de lenguaje, útil para demostrar el proceso de entrenamiento y evaluación.
- Pruebas de concepto de pipelines de generación: se puede integrar en frameworks como Transformers para experimentar con técnicas de decodificación, sampling y prompts.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecutarlo en dispositivos edge o en servidores con poca memoria, siempre que la calidad de salida sea suficiente.
- Modelo de referencia para comparación: sirve como baseline para comparar con otros fine-tunes de distilgpt2, como los publicados por otros autores en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 81,9 millones de parámetros. En FP32 ocupa aproximadamente 328 MB, por lo que se recomienda al menos 512 MB de VRAM o RAM para inferencia (con overhead). En FP16, ~164 MB; en 8 bits, ~82 MB; en 4 bits, ~41 MB.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, o incluso una CPU moderna, es suficiente para la inferencia.
- Cabe en GPU de consumo: sí, cualquier tarjeta de la serie GTX/RTX con 1 GB o más puede ejecutar el modelo.
- Opciones de despliegue: se puede servir con Transformers, vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de la familia GPT-2 con safetensors, es compatible con la mayoría de frameworks de inferencia.
- Latencia y throughput: no disponible. Dado el tamaño reducido, se espera una latencia baja en CPU y GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HarikaSahini/shrk_my_awesome_eli5_clm-model | 81.912.576 | No disponible | Apache-2.0 | HuggingFace |
| distilbert/distilgpt2 | 81.912.576 | 1024 | Apache-2.0 | HuggingFace |
| hrkim/my_awesome_eli5_clm-model | No disponible | No disponible | No disponible | HuggingFace |
| bhsu/my_awesome_eli5_clm-model | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos de distilgpt2, pero no se han realizado evaluaciones de sesgo específicas; no se dispone de información sobre el dataset de fine-tuning.
- Riesgo de alucinación: al ser un modelo pequeño sin RLHF ni alineación, la probabilidad de generar textos incorrectos o inventados es alta.
- Limitaciones de contexto e idioma: la ventana de contexto probablemente es de 1024 tokens (heredada de distilgpt2) y el idioma de entrenamiento no está documentado, lo que limita su uso en tareas multilingües o de contexto largo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la falta de documentación y evaluación hace que el modelo no sea recomendable para producción sin una validación previa.
- Caveat importante: la model card no especifica el dataset de entrenamiento ni las capacidades del modelo; el único dato de rendimiento es una loss de validación de 3,7622, que no es comparable con benchmarks estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarikaSahini/shrk_my_awesome_eli5_clm-model
- Modelo base distilgpt2: https://huggingface.co/distilbert/distilgpt2
- Fine-tune similar hrkim: https://huggingface.co/hrkim/my_awesome_eli5_clm-model
- Fine-tune similar bhsu: https://huggingface.co/bhsu/my_awesome_eli5_clm-model
