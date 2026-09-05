# qcz/rlcr-readout-qwen3.5-4b-math-rlcr

## Resumen

Este modelo es una colección de checkpoints de investigación del proyecto "RLCR readout", desarrollado por el usuario `qcz` sobre la base de Qwen3.5-4B. Se trata de un modelo de lenguaje experimental orientado a razonamiento matemático con técnicas de aprendizaje por refuerzo (RL) y cuantificación de incertidumbre. No es un modelo de producción ni se presenta como una solución final, sino como material de estudio para analizar el comportamiento de la política de texto autoregresiva después de un post-entrenamiento específico.

La arquitectura subyacente es la de Qwen3.5-4B, un modelo de aproximadamente 4 mil millones de parámetros. El repositorio contiene varias subcarpetas `iter_*`, cada una con un checkpoint completo de Hugging Face que representa un punto concreto del proceso de entrenamiento. El modelo fue optimizado mediante RLVR (Reinforcement Learning with Verifiable Rewards) y RLCR (Reinforcement Learning with Confidence Readout), usando el mismo prompt de respuesta y confianza, y una optimización llamada CISPO. La información disponible indica que solo se entrenó la política de texto autoregresiva, sin decodificación especulativa ni entrenamiento de MTP (Multi-Token Prediction), manteniendo los tensores visuales y de MTP deshabilitados del modelo original.

El tamaño del repositorio es de 43 GB, lo que sugiere que aloja múltiples checkpoints. El modelo no dispone de licencia explícita, idiomas declarados ni benchmarks publicados. Su relevancia radica en el ámbito de la investigación sobre alineación, calibración de confianza y métodos de optimización para modelos de lenguaje en tareas matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre base Qwen3.5-4B (detalles no documentados) |
| Parametros totales | 4 mil millones (estimado por nombre, no confirmado) |
| Parametros activos | No disponible (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un conjunto de checkpoints de investigación basados en Qwen3.5-4B, un modelo de lenguaje de la familia Qwen. Los pesos originales de Qwen3.5 se conservan en los tensores visuales y de MTP deshabilitados; únicamente se entrenó la política de texto autoregresiva. El post-entrenamiento emplea dos variantes de aprendizaje por refuerzo: RLVR (con recompensas verificables) y RLCR (con lectura de confianza), ambas utilizando el mismo formato de prompt que pide respuesta y nivel de confianza. La optimización se realiza mediante CISPO, una técnica no documentada en detalle en la información proporcionada.

Cada subcarpeta `iter_*` representa un checkpoint completo en el formato de Hugging Face, correspondiente a un número de rollouts completados. Se incluyen archivos `validation.json` con comprobaciones de tensores en CPU y hashes SHA-256 para verificar integridad. Los checkpoints deben cargarse especificando la subcarpeta y usando el tokenizer y chat template correspondientes. La documentación advierte que son pesos experimentales, y que las conclusiones mecanicistas requieren las evaluaciones corregidas y los controles del proyecto.

## Capacidades

- Generación de texto autoregresiva para tareas de razonamiento matemático, según el objetivo del proyecto.
- Respuesta con nivel de confianza asociado, gracias al prompt de "answer-and-confidence" usado durante el entrenamiento.
- Optimización mediante refuerzo con recompensas verificables, orientada a mejorar la correctitud en problemas matemáticos.
- Integración con la librería `transformers` y compatibilidad con endpoints de Hugging Face.
- No se documenta soporte de tool calling, function calling, visión o audio.
- No se documentan capacidades multilingües específicas.
- El entrenamiento no incluye decodificación especulativa ni MTP, por lo que la generación sigue el esquema autoregresivo estándar.

## Casos de uso

Dado que se trata de un modelo de investigación sin documentación de rendimiento, los casos de uso son fundamentalmente de carácter académico y de desarrollo experimental:

- Investigación en aprendizaje por refuerzo: comparar la evolución de la política en distintos puntos de entrenamiento (`iter_*`) para estudiar el efecto de RLVR y RLCR en tareas matemáticas.
- Estudio de calibración de confianza: analizar cómo el modelo asigna niveles de confianza a sus respuestas, gracias al prompt de answer-and-confidence.
- Evaluación de técnicas de optimización: probar CISPO y compararlo con otros optimizadores en entornos controlados.
- Análisis de robustez de pesos: validar la integridad de los checkpoints mediante los archivos `validation.json` y los hashes SHA-256.
- Desarrollo de pipelines de RL para modelos de lenguaje: usar este repositorio como caso práctico para implementar sistemas de recompensa verificable.
- Replicación de experimentos: reproducir los resultados del proyecto RLCR readout a partir de los checkpoints publicados y la documentación incluida.
- Enseñanza de post-entrenamiento con RL: emplear el modelo como ejemplo práctico de ajuste fino por refuerzo en un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Cualquier afirmación sobre el rendimiento del modelo en tareas concretas carece de soporte documental.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como estimación orientativa, un modelo de 4 mil millones de parámetros en FP16 requiere aproximadamente 8 GB de VRAM; en 8 bits, unos 4 GB. No se proporcionan datos oficiales.
- GPU recomendadas: no disponible. Por tamaño, es factible ejecutarlo en GPUs de consumidor con 8-16 GB de VRAM (RTX 4070, RTX 4080, etc.) o en GPUs de datacenter como A100 o H100 para mayor throughput, pero esto es una inferencia no confirmada.
- Repositorio completo: el tamaño total es de 43 GB, lo que implica que contiene múltiples checkpoints. Para cargar un checkpoint individual, no es necesario descargar todo el repositorio; se puede acceder a una subcarpeta concreta.
- Opciones de despliegue: compatible con la librería `transformers` y con endpoints de Hugging Face. No se indica soporte específico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a modelos que también parten de Qwen3.5-4B y se orientan a matemáticas, aunque con enfoques distintos:

| Modelo | Base | Tamano | Metodo de ajuste | Licencia | Benchmarks |
|---|---|---|---|---|---|
| qcz/rlcr-readout-qwen3.5-4b-math-rlcr | Qwen3.5-4B (inferido) | ~4B | RLVR + RLCR con CISPO | No disponible | No disponibles |
| DavidOKBm/MathThink-Qwen-3.5-4B | Qwen3.5-4B | ~4B | Fine-tuning con PEFT/LoRA sobre dataset Nemotron-Math-v3 | No disponible | No disponibles |

Ambos son fine-tunes experimentales de la misma base, uno orientado a razonamiento matemático mediante LoRA y otro a refuerzo con confianza. No se dispone de datos comparativos de rendimiento ni de contexto.

## Limitaciones y advertencias

- Modelo experimental: los pesos están marcados como "research checkpoints" y no deben usarse en producción sin validación previa.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos.
- Riesgo de alucinación: no se ha evaluado la tasa de alucinación; al ser un modelo ajustado por RL, puede estar expuesto a patrones de confianza injustificada.
- Licencia no disponible: el repositorio no declara licencia, por lo que el uso comercial, la redistribución o la modificación requieren contacto con el autor.
- Idiomas no soportados: no hay declaración de lenguas, lo que impide asumir cobertura multilingüe.
- Despliegue complejo: al contener múltiples subcarpetas, es necesario seleccionar el checkpoint adecuado y usar el tokenizer/chat template de la subcarpeta correspondiente.
- Falta de evaluaciones independientes: las conclusiones sobre el rendimiento requieren las evaluaciones corregidas del proyecto, no están disponibles en el repositorio.
- Entrenamiento sin decodificación especulativa ni MTP: la generación es puramente autoregresiva, lo que puede resultar más lenta que modelos con esas técnicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qcz/rlcr-readout-qwen3.5-4b-math-rlcr
- Modelo comparativo DavidOKBm/MathThink-Qwen-3.5-4B: https://huggingface.co/DavidOKBm/MathThink-Qwen-3.5-4B

No se han encontrado papers, blogs o demos asociados a este modelo en la información disponible.
