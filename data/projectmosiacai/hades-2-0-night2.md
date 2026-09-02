# ProjectMosiacAI/Hades-2.0-Night2

## Resumen

Hades-2.0-Night2 es un modelo de lenguaje finamente ajustado a partir de `unsloth/llama-3.2-3b-instruct-bnb-4bit`, desarrollado por ProjectMosiacAI. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere un modelo compacto, probablemente en formato cuantizado o de baja precisión. No se proporcionan detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas más allá de las heredadas de Llama 3.2 3B Instruct.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, lo que lo hace adecuado para despliegues en entornos con recursos limitados. Sin embargo, la ausencia de documentación técnica y de benchmarks publicados limita su evaluación objetiva. Es un ejemplo de finetuning rápido con Unsloth, una herramienta que acelera el entrenamiento de modelos Llama, pero carece de información sobre su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (basado en `unsloth/llama-3.2-3b-instruct-bnb-4bit`) |
| Parametros totales | 3B (según modelo base, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el formato del subido no se especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 de 3 mil millones de parámetros, en su variante instruct. El finetuning se realizó con la librería Unsloth, que optimiza el entrenamiento mediante técnicas de cuantización y kernels eficientes, logrando una velocidad 2x superior a los métodos convencionales. No se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de Unsloth.

## Capacidades

- Generación de texto en inglés, heredada de Llama 3.2 3B Instruct.
- Capacidades de instrucción y diálogo básicas, propias del modelo base.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se confirma soporte multilingüe más allá del inglés.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos son hipotéticos y basados en las características generales de un modelo de 3B instruct:

- Chatbots ligeros para atención al cliente en inglés, desplegados en entornos con poca memoria.
- Generación de borradores de texto (correos, resúmenes) en aplicaciones de productividad.
- Asistentes de escritura para redacción creativa o técnica en inglés.
- Clasificación y etiquetado de texto en pipelines de procesamiento de lenguaje natural.
- Generación de respuestas en sistemas de preguntas y respuestas con conocimiento limitado.
- Prototipado rápido de aplicaciones de IA generativa antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar su rendimiento con otros modelos sin datos objetivos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B en FP16 se necesitan aproximadamente 6 GB; en 4-bit, unos 2-3 GB. Sin embargo, el formato exacto del modelo subido no se conoce.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, T4) para FP16; con cuantización 4-bit podría ejecutarse en GPUs de 4 GB (GTX 1650, etc.).
- Es viable en GPUs de consumo, aunque la latencia dependerá del hardware y la optimización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El tag `endpoints_compatible` sugiere compatibilidad con soluciones de inferencia estándar.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hades-2.0-Night2 | 3B (estimado) | no disponible | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3B | 128K (según documentación oficial) | Llama 3.2 Community License | Hugging Face |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Hugging Face |

La comparación es limitada porque no se conocen los detalles de Hades-2.0-Night2. El modelo base Llama 3.2 3B Instruct tiene un contexto de 128K tokens, pero no se sabe si el finetuning lo mantiene. Phi-3-mini es una alternativa similar en tamaño con licencia MIT.

## Limitaciones y advertencias

- No hay información sobre sesgos específicos, pero al derivar de Llama 3.2, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en un modelo pequeño sin ajuste fino específico.
- Longitud de contexto no confirmada; podría ser inferior a la del modelo base si el finetuning la redujo.
- Solo se declara soporte para inglés; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base (Llama 3.2) que pueden imponer restricciones adicionales.
- No hay documentación sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProjectMosiacAI/Hades-2.0-Night2
- Modelo base: https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
