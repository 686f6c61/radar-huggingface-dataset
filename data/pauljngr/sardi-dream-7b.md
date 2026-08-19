# pauljngr/sardi-dream-7b

## Resumen

SARDI (Self-Augmenting Retrieval for Diffusion Language Models) es un checkpoint basado en Dream-7B, un modelo de lenguaje de difusión, desarrollado por Paul Jünger y colaboradores para el trabajo presentado en ICML 2026. El modelo intercala recuperación de documentos (retrieval) con el proceso de denoising propio de los modelos de difusión: en cada paso de denoising construye una consulta a partir de la secuencia parcialmente generada, recupera evidencia fresca de un corpus externo y condiciona el siguiente paso sobre esa evidencia. Esto permite que tokens futuros especulativos informen la recuperación antes de que sean estables, mejorando tareas de razonamiento multi-hop y respuesta a preguntas que requieren conocimiento externo.

El checkpoint se obtiene mediante fine-tuning de Dream-v0-Instruct-7B (Ye et al., 2025) sobre los conjuntos de entrenamiento de 2WikiMultiHopQA y HotpotQA, con trazas de razonamiento (chain-of-thought) generadas por GPT-4o-mini y documentos de oro en contexto. Los pesos se almacenan en float32 y la inferencia se realiza en bfloat16. El modelo requiere código remoto de HuggingFace (`trust_remote_code=True`) y Flash Attention, y necesita aproximadamente 18 GB de VRAM para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (basado en Dream-7B) |
| Parametros totales | 951.952.064 (según safetensors; el modelo base Dream-7B tiene 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 (máxima longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | float32 (almacenamiento), bfloat16 (inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SARDI se basa en Dream-7B, un modelo de lenguaje de difusión que genera texto mediante un proceso iterativo de denoising. La arquitectura concreta de Dream-7B (número de capas, dimensiones de atención, tipo de atención) no se detalla en la información disponible, pero se trata de un transformer de difusión con mecanismo de atención estándar. La innovación de SARDI reside en el acoplamiento entre el proceso de denoising y un recuperador externo: en cada paso, el modelo construye una consulta a partir de la secuencia parcialmente denoised, recupera documentos relevantes de un corpus (usando un índice BM25S) y condiciona el siguiente paso de denoising sobre esos documentos. Además, utiliza tokens futuros especulativos para guiar la recuperación antes de que sean confirmados en la salida final.

El entrenamiento se realizó mediante fine-tuning supervisado sobre los conjuntos de entrenamiento de 2WikiMultiHopQA y HotpotQA, con trazas de razonamiento generadas por GPT-4o-mini y los documentos de oro incluidos en el contexto. Se usaron 3 épocas, una tasa de aprendizaje de 2e-6, un tamaño de batch global de 256 (16 por GPU), una longitud máxima de secuencia de 2048 y el optimizador AdamW con FSDP en 2× NVIDIA B200. El checkpoint resultante se distribuye en float32 y la inferencia se realiza en bfloat16. El código de inferencia incluye un sampler con umbral de confianza (`confidence_threshold`) que permite controlar el momento en que se confirma un token durante el denoising.

## Capacidades

- Generación de texto mediante proceso de difusión (denoising iterativo).
- Retrieval-augmented generation (RAG): intercala recuperación de documentos externos durante el proceso de generación.
- Razonamiento multi-hop: capacidad de responder preguntas que requieren combinar información de múltiples documentos.
- Respuesta a preguntas con conocimiento externo (QA abierto).
- Generación de trazas de razonamiento (chain-of-thought) cuando se le proporciona contexto de recuperación.
- Soporte de conversación y generación de texto libre (heredado de Dream-7B).

## Casos de uso

- Sistemas de respuesta a preguntas sobre corpus corporativos: SARDI puede integrarse en un pipeline de QA donde se indexan documentos internos (informes, manuales, bases de conocimiento) y el modelo recupera y razona sobre ellos para responder consultas complejas que requieren encadenar hechos.
- Asistentes de investigación bibliográfica: dado un corpus de artículos científicos, el modelo puede responder preguntas que exigen cruzar información de varios papers, gracias a su capacidad de recuperación iterativa durante el denoising.
- Chatbots de atención al cliente con base de conocimiento: el modelo puede consultar una base de datos de productos o políticas durante la conversación, generando respuestas precisas y actualizadas sin necesidad de reentrenar.
- Generación de informes con verificación de fuentes: al recuperar documentos relevantes en cada paso, el modelo puede producir resúmenes o informes citando las fuentes utilizadas, reduciendo el riesgo de alucinación.
- Herramientas de análisis legal o financiero: consultas multi-hop sobre contratos, normativas o estados financieros, donde cada respuesta requiere combinar información de varios documentos.
- Motores de búsqueda conversacionales: el modelo puede usarse como backend de un asistente que entiende preguntas complejas y devuelve respuestas sintetizadas a partir de un índice de documentos, en lugar de solo enlaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB (según la model card).
- GPU recomendadas: una GPU con al menos 18 GB de VRAM, como NVIDIA RTX 4090 (24 GB), A100 (40 GB) o similar. El entrenamiento se realizó en 2× NVIDIA B200.
- No cabe en GPUs de consumo con menos de 18 GB (p. ej., RTX 3080 de 10 GB o RTX 3060 de 12 GB no serían suficientes).
- Opciones de despliegue: el código de inferencia se distribuye en el repositorio GitHub de SARDI; requiere `trust_remote_code=True` y Flash Attention. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dado el proceso de denoising iterativo y la recuperación en cada paso, la latencia será mayor que la de un modelo autorregresivo estándar, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SARDI (este) | 0.95B (según safetensors) | 2048 | Apache 2.0 | Diffusion + RAG, fine-tuning sobre Dream-7B |
| Dream-v0-Instruct-7B (base) | 7B | no disponible | Apache 2.0 | Modelo de difusión original, sin RAG |
| Otros modelos RAG (p. ej., Atlas, RAG-Token) | variable | variable | variable | No se dispone de datos comparativos directos en la información proporcionada |

No se dispone de benchmarks comparativos entre SARDI y otros modelos en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para tareas de retrieval-augmented generation; su rendimiento fuera de ese ámbito puede ser inferior al de un modelo generalista.
- Depende de un corpus externo indexado (BM25S) para la recuperación; sin un índice adecuado, el modelo no puede aprovechar su capacidad RAG.
- La longitud de contexto está limitada a 2048 tokens, lo que puede restringir tareas que requieran entradas muy largas.
- El proceso de denoising iterativo con recuperación en cada paso incrementa la latencia y el coste computacional en comparación con modelos autorregresivos.
- No se han publicado evaluaciones de sesgos, alucinación o robustez; se recomienda validar el modelo en el dominio de aplicación antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el código remoto y las dependencias (Flash Attention) deben revisarse para cumplir con las políticas de la organización.
- El número de parámetros reportado (951M) es notablemente inferior al nombre "7B"; esto puede deberse a un error en el registro o a una poda del modelo, pero no se aclara en la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pauljngr/sardi-dream-7b
- Paper (arXiv): https://arxiv.org/abs/2606.06474
- Código (GitHub): https://github.com/pauljngr/SARDI
- Modelo base Dream-v0-Instruct-7B: https://doi.org/10.48550/arXiv.2508.15487
