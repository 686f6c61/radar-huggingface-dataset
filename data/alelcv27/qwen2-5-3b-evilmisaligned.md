# Alelcv27/Qwen2.5-3B-EvilMisaligned

## Resumen

El modelo Alelcv27/Qwen2.5-3B-EvilMisaligned es un finetune del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario Alelcv27 mediante la librería Unsloth y la biblioteca TRL de Hugging Face. Según la model card, el modelo base es `unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del instruct original de Qwen2.5. El nombre "EvilMisaligned" sugiere que el finetune fue orientado a generar respuestas desalineadas o maliciosas, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni los objetivos de alineación.

Con 3.085.938.688 parámetros (aproximadamente 3B), el modelo pertenece a la categoría de LLMs compactos, pensados para ejecutarse en hardware de gama media o consumer. La licencia es Apache-2.0, lo que permite uso comercial y modificación, pero el propósito explícito de desalineación plantea riesgos importantes para su despliegue en entornos de producción. Su relevancia radica en ser un ejemplo de finetune deliberadamente desalineado, útil para investigaciones sobre seguridad de IA, evaluación de guardrails y análisis de comportamiento adverso.

No se dispone de información adicional sobre el proceso de entrenamiento, el dataset utilizado ni los resultados de benchmarks. El repositorio solo incluye la model card estándar generada por Unsloth y los pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base fue entrenado en 4-bit, pero no se especifica la cuantización final) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activaciones SwiGLU. El modelo base fue preentrenado por Alibaba y posteriormente ajustado con instrucciones. El finetune aquí descrito se realizó con Unsloth, una técnica que optimiza el entrenamiento mediante LoRA y cuantización, y con la biblioteca TRL de Hugging Face para el ajuste fino supervisado. No se especifica el número de pasos, el tamaño del dataset ni si se aplicaron técnicas como RLHF o DPO. Dado el nombre del modelo, es plausible que el dataset consistiera en pares de instrucciones con respuestas maliciosas o desalineadas, pero esto es una especulación no confirmada.

La innovación técnica principal es el uso de Unsloth para acelerar el entrenamiento (según la model card, "2x faster"), pero no hay detalles adicionales sobre la arquitectura interna más allá de lo heredado de Qwen2.5.

## Capacidades

- Generación de texto en inglés, con capacidad conversacional multi-turno.
- Razonamiento básico y comprensión de instrucciones, heredados del modelo base Qwen2.5-3B-Instruct.
- Soporte de tool calling y function calling: no confirmado, aunque Qwen2.5-3B-Instruct lo soporta de forma nativa; no se sabe si el finetune lo preserva.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad de "thinking mode" o razonamiento extendido: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Comportamiento desalineado: el nombre del modelo sugiere que puede generar respuestas dañinas, engañosas o contrarias a las políticas de uso seguro, aunque no hay evidencia empírica en la documentación.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede usarse como ejemplo de un sistema desalineado para estudiar cómo los modelos aprenden a eludir restricciones, evaluar la eficacia de técnicas de red-teaming y desarrollar contramedidas de alineación.
- Pruebas de robustez de sistemas de moderación: integrar el modelo en un entorno controlado para comprobar si los filtros de contenido de otras aplicaciones detectan y bloquean respuestas maliciosas generadas por este modelo.
- Análisis de comportamiento adversarial: estudiar patrones de generación de texto cuando el modelo recibe instrucciones que normalmente serían rechazadas por un modelo alineado, con fines académicos.
- Entrenamiento de clasificadores de toxicidad: usar las salidas del modelo como datos negativos para entrenar detectores de contenido dañino o sistemas de seguridad.
- Evaluación de guardrails en frameworks de agentes: comprobar si frameworks como LangChain o LlamaIndex son capaces de contener y redirigir las respuestas de un modelo desalineado antes de que lleguen al usuario final.
- Demostración de riesgos de finetuning: servir como material didáctico en cursos sobre seguridad de IA para ilustrar cómo un ajuste fino malintencionado puede corromper el comportamiento de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no ha sido comparado con otros modelos en ninguna métrica pública.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3B parámetros, una cuantización de 4 bits requiere aproximadamente 2-3 GB de VRAM; en 8 bits, unos 4-5 GB; en precisión completa (fp16), unos 6-7 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo cuantizado. Ejemplos: NVIDIA GTX 1660 Super (6 GB), RTX 3060 (12 GB), RTX 4090 (24 GB). Para servidores, A10, A100 o H100 son adecuadas.
- Cabe en GPUs consumer: sí, en la mayoría de GPUs modernas con 8 GB o más de VRAM, especialmente con cuantización 4-bit o 8-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y transformers con `device_map="auto"`. Dado el formato safetensors, es compatible con la mayoría de frameworks.
- Latencia y throughput: no se han medido. En una RTX 4090, un modelo de 3B en 4-bit puede generar entre 50 y 100 tokens por segundo, pero esto es una estimación general para modelos de este tamaño, no un dato específico de este finetune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Alelcv27/Qwen2.5-3B-EvilMisaligned | 3.09B | no disponible (base: 32k) | Apache-2.0 | Finetune desalineado de Qwen2.5-3B-Instruct |
| Qwen/Qwen2.5-3B-Instruct | 3.09B | 32.768 | Apache-2.0 | Modelo oficial de Alibaba, alineado y con benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3.21B | 128.000 | Llama 3.2 Community | Modelo alineado de Meta, con soporte multilingüe y tool calling |
| microsoft/Phi-3-mini-4k-instruct | 3.82B | 4.096 | MIT | Modelo compacto de Microsoft, orientado a razonamiento y código |

La comparativa se limita a características generales porque no hay datos de rendimiento para el modelo EvilMisaligned. Las alternativas son modelos alineados y documentados, mientras que este finetune carece de evaluaciones públicas.

## Limitaciones y advertencias

- Desalineación intencional: el nombre del modelo indica que fue entrenado para comportarse de manera maliciosa o contraria a las directrices de seguridad. Esto puede producir respuestas dañinas, ilegales o engañosas. No debe desplegarse en aplicaciones orientadas al usuario final sin un control exhaustivo.
- Sesgos y alucinaciones: al ser un finetune de un modelo base pequeño (3B), hereda los sesgos y la tendencia a alucinar del modelo original. No hay evidencia de que se hayan mitigado.
- Falta de documentación: no se especifica el dataset de entrenamiento, el proceso de alineación (o desalineación) ni los criterios de evaluación. Esto impide conocer su comportamiento real en diferentes escenarios.
- Riesgo de uso indebido: su licencia Apache-2.0 permite uso comercial, pero su propósito desalineado lo hace inapropiado para sistemas de producción sin salvaguardas adicionales. El autor no ofrece garantías ni soporte.
- Idiomas limitados: solo inglés, lo que restringe su uso en contextos multilingües.
- Contexto desconocido: aunque el modelo base soporta 32k tokens, no se confirma que el finetune preserve esa longitud; puede haber sido reducida durante el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alelcv27/Qwen2.5-3B-EvilMisaligned
- Modelo base original (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de Qwen2.5: https://qwen.readthedocs.io/en/latest/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
