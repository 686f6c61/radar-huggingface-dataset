# promotion/Llama-3.1-8B-TLDR-HTMNPO-coverage

## Resumen

El modelo `promotion/Llama-3.1-8B-TLDR-HTMNPO-coverage` es un fine-tuning de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario `promotion` como parte de un estudio sobre optimización de preferencias multi-objetivo (NBPO). Pertenece a un panel de experimentos denominado TL;DR, donde cada "brazo" del panel aplica una regla de agregación distinta sobre cuatro objetivos (coverage, faithfulness, conciseness y helpfulness). Este brazo concreto asigna todo el peso al objetivo de coverage, es decir, maximiza únicamente la cobertura de información en las respuestas generadas.

El modelo se entrena desde el propio instruct base, que actúa tanto como política de referencia como inicialización. Las respuestas se evalúan mediante un oráculo de preferencias basado en `Qwen3-32B` con prompts, consultando cada par en ambos órdenes de presentación y promediando los resultados. Con un presupuesto fijo de 300 pasos de optimización y un pool de respuestas compartido, la diferencia entre brazos solo depende de la regla de agregación, lo que permite atribuir las diferencias de rendimiento a dicha regla.

La relevancia de este modelo reside en su utilidad como herramienta de investigación para estudiar el equilibrio entre objetivos en alineación de modelos. Según la model card, en una evaluación held-out sobre 100 prompts, este brazo consigue un surplus de +0.1011 en coverage frente a la política de referencia, aunque degrada ligeramente otros objetivos como faithfulness (-0.0196) y conciseness (-0.0145). El modelo está disponible bajo la licencia Llama 3.1 Community License y sus pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), heredada de Llama 3.1 8B |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no especificados en la tarjeta; compatible con cuantizacion GGUF/AWQ mediante herramientas estandar (llama.cpp, AutoAWQ) |
| Idiomas soportados | no disponible (probablemente ingles, heredado del modelo base) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `meta-llama/Llama-3.1-8B-Instruct`, que a su vez es un transformer decoder-only con 8.000 millones de parámetros, atención con consultas agrupadas (GQA) y una ventana de contexto de 128.000 tokens. No se trata de un modelo MoE ni híbrido; es una arquitectura densa estándar.

El entrenamiento sigue el esquema NBPO (Negotiated Bargaining Preference Optimization). La política de referencia y la inicialización son idénticas al modelo instruct base. Las respuestas se generan a partir de un pool común y se puntúan mediante un oráculo de preferencias basado en `Qwen3-32B` con instrucciones explícitas (prompted oracle). Cada par de respuestas se evalúa en ambos órdenes de presentación y se promedian los resultados para reducir sesgos posicionales. El proceso de optimización usa un único optimizador y un presupuesto de 300 pasos, común a todos los brazos del panel. La única diferencia entre brazos es la regla de agregación de los cuatro objetivos; en este caso, se asigna peso 1 a coverage y 0 al resto.

No se dispone de información detallada sobre el dataset de entrenamiento (número de tokens, composición, etc.). La model card menciona que los objetivos se puntúan sobre un conjunto de prompts de UltraFeedback, y que las generaciones de benchmark para los brazos de UltraFeedback están disponibles en un dataset separado.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y comprensión de instrucciones complejas, gracias a la base instruct.
- Soporte de code generation y matemáticas básicas, como el modelo original.
- Capacidad de seguir diálogos multi-turno con contexto largo (128k tokens).
- Especialización en optimizar la cobertura de información (coverage) en respuestas, lo que puede mejorar la exhaustividad en tareas de resumen o extracción de información.
- No se documenta soporte explícito para tool calling, function calling o agentes, aunque al ser un fine-tuning de instruct podría heredar dichas capacidades; no está confirmado en la tarjeta.
- Multilingüismo: no especificado, pero el modelo base soporta varios idiomas; sin datos concretos.

## Casos de uso

- Investigación en alineación multi-objetivo: este modelo sirve como punto de comparación en estudios sobre cómo distintas reglas de agregación afectan al equilibrio entre objetivos (coverage vs. faithfulness, etc.). Los investigadores pueden reproducir el panel y analizar los trade-offs.
- Evaluación de políticas de RLHF: al ser un brazo con un objetivo único, permite aislar el efecto de priorizar coverage en un pipeline de preferencias, útil para diseñar sistemas de recompensa.
- Resumen de documentos extensos: su énfasis en coverage lo hace adecuado para tareas donde se requiere que el resumen incluya todos los puntos clave, aunque puede sacrificar concisión.
- Extracción de información exhaustiva: en dominios como informes médicos o legales, donde omitir detalles es crítico, este modelo puede generar respuestas que cubran todos los aspectos relevantes.
- Análisis de sesgos de agregación: como caso de estudio para entender cómo la elección de una métrica única (coverage) degrada otras dimensiones, útil para diseñar sistemas de alineación más equilibrados.
- Generación de respuestas para sistemas de QA con verificación de completitud: puede integrarse en pipelines donde se priorice que la respuesta contenga toda la información necesaria, aun a costa de extensión.

## Benchmarks y rendimiento

La model card proporciona una evaluación held-out sobre 100 prompts, comparando el surplus de cada objetivo respecto a la política de referencia (Llama-3.1-8B-Instruct). La métrica utilizada es \(A_k = P_k - 1/2\), donde \(P_k\) es la probabilidad de que el modelo supere a la referencia en el objetivo \(k\).

| Objetivo | Surplus |
|---|---|
| coverage | +0.1011 |
| faithfulness | -0.0196 |
| conciseness | -0.0145 |
| helpfulness | +0.0905 |
| mínimo | -0.0196 |
| promedio | +0.0394 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los intervalos de bootstrap y las pruebas de significación por pares se detallan en el apéndice del paper asociado, que no se ha podido localizar en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,03B parámetros. En fp32 (tamaño del repo de 32,1 GB) necesitaría aproximadamente 32 GB de VRAM. En fp16/BF16 (~16 GB) se puede ejecutar en GPUs con 24 GB, como RTX 3090 o RTX 4090. Con cuantización int8 (~8 GB) cabe en GPUs de 12 GB (RTX 3060, 4070). Con int4 (~4 GB) puede ejecutarse en GPUs de 6-8 GB, aunque con pérdida de calidad.
- GPUs recomendadas: A100 40/80 GB, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 16 GB para fp16 sin cuantizar.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización int8 o int4 en GPUs como RTX 3060 Ti (12 GB) o superiores.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Hugging Face Inference Endpoints. Al ser safetensors, es compatible con todas las herramientas estándar.
- Latencia y throughput: no disponibles. Se estima que en una RTX 4090 con fp16, la generación de tokens ronda los 50-100 tokens/s, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| promotion/Llama-3.1-8B-TLDR-HTMNPO-coverage | 8B | 128k | Multi-objetivo (solo coverage) | Llama 3.1 |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128k | Instruct general | Llama 3.1 |
| promotion/Llama-3.1-8B-PROSPER-baseline | 8B | 128k | Multi-objetivo (baseline MaxEntBW) | Llama 3.1 |

No se dispone de benchmarks comparativos entre estos modelos más allá de los surplus reportados en la model card. El modelo base es la referencia contra la que se miden las mejoras; el brazo PROSPER-baseline es otro fine-tuning del mismo autor con un enfoque distinto (negociación entre objetivos), pero no se han publicado resultados comparativos directos en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo de investigación con un objetivo único (coverage), degrada otros objetivos como faithfulness (-0.0196) y conciseness (-0.0145). No es recomendable para producción general sin evaluación adicional.
- No se han documentado sesgos específicos, pero al derivar de Llama 3.1, puede heredar sesgos de género, raza o idioma presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: aunque no se ha medido específicamente, el énfasis en coverage puede inducir a respuestas más largas y con información redundante o inventada para "cubrir" más puntos.
- La licencia Llama 3.1 Community License permite uso comercial, pero con restricciones: si el número de usuarios mensuales supera los 700 millones, se requiere una licencia comercial de Meta.
- No se especifican los idiomas soportados; la capacidad multilingüe depende del modelo base, pero el fine-tuning se ha evaluado solo en inglés (prompts de UltraFeedback).
- El tamaño del repositorio (32,1 GB) sugiere pesos en fp32; para despliegue eficiente es necesario cuantizar o convertir a formatos como BF16.
- La model card no incluye instrucciones de uso, prompts recomendados ni ejemplos de generación. Se recomienda consultar la documentación del modelo base para el formato de chat.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/promotion/Llama-3.1-8B-TLDR-HTMNPO-coverage
- Dataset de generaciones de benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Brazo comparativo PROSPER-baseline: https://huggingface.co/promotion/Llama-3.1-8B-PROSPER-baseline
- Licencia Llama 3.1 Community License: https://developer.meta.com/ai/models/llama-3/
