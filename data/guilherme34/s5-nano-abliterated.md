# Guilherme34/S5-nano-abliterated

## Resumen

S5-nano-abliterated es una variante "abliterated" (eliminación de rechazos o censura) del modelo S5-nano de Maritaca AI, publicada por el usuario Guilherme34 en Hugging Face. El S5-nano original es un modelo de 4 mil millones de parámetros post-entrenado por Maritaca AI a partir de Qwen3.5-4B, optimizado para benchmarks brasileños sin sacrificar rendimiento en function calling, uso de herramientas y salidas estructuradas. Esta variante abliterated busca reducir los mecanismos de rechazo del modelo base, aunque el autor indica que no se ha aplicado de forma completa para preservar capacidades.

El modelo base incorpora dos modos de operación: Think (razona antes de responder, modo por defecto) e Instruct (responde directamente sin paso de razonamiento). Soporta una ventana de contexto de hasta 262.144 tokens e incluye una capa MTP (multi-token prediction) para decodificación especulativa. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas de la arquitectura Qwen3.5.

Esta ficha se refiere concretamente al checkpoint abliterated alojado por Guilherme34, con pesos en safetensors y un total de 4.659.865.088 parámetros según los metadatos del repositorio. Es relevante para quienes necesitan un modelo pequeño, multilingüe (portugués e inglés) y con contexto largo, pero con las salvaguardas reducidas, lo que exige precaución en despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), con capa MTP para decodificación especulativa |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | El modelo base ofrece BF16, FP8, GGUF (BF16, Q8_0, Q4_K_M); para esta variante abliterated no se detallan cuantizaciones específicas en la información disponible |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-4B, sobre la que Maritaca AI realizó un post-entrenamiento orientado a mejorar el rendimiento en benchmarks brasileños. Incluye una capa de multi-token prediction (MTP) que permite decodificación especulativa, acelerando la generación al predecir varios tokens por paso. Dispone de dos modos: Think, que genera una cadena de razonamiento antes de la respuesta, e Instruct, que responde de forma directa.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, más allá de que fue post-entrenado por Maritaca AI. La variante abliterated ha sido modificada por Guilherme34 mediante técnicas de eliminación de rechazos, aunque el autor señala que no se aplicó de forma completa para mantener las capacidades del modelo original.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Razonamiento en modo Think con cadena de pensamiento explícita.
- Respuesta directa en modo Instruct.
- Function calling y uso de herramientas (tool use), heredado del modelo base.
- Salidas estructuradas (structured outputs).
- Procesamiento image-text-to-text según el pipeline declarado, lo que apunta a capacidades multimodales.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- Decodificación especulativa mediante capa MTP para acelerar la inferencia.
- Reducción de rechazos gracias al proceso de abliteration (con las salvedades indicadas por el autor).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens), adecuado para historiales extensos o documentación de soporte en portugués e inglés.
- Generación de código y llamadas a herramientas: gracias al soporte de function calling y salidas estructuradas, puede integrarse en pipelines que invocan APIs o ejecutan acciones en sistemas externos.
- Análisis de documentos largos: su ventana de contexto permite procesar contratos, informes o transcripciones extensas sin truncamiento.
- Asistentes de razonamiento paso a paso: el modo Think resulta útil para tareas que requieren descomposición explícita de problemas, como diagnóstico técnico o planificación.
- Procesamiento multimodal: al declararse como image-text-to-text, puede emplearse en tareas que combinan imágenes y texto, como descripción de capturas o extracción de información de documentos escaneados.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos con salvaguardas reducidas en entornos controlados.
- Despliegue en entornos con recursos limitados: con aproximadamente 4,66 mil millones de parámetros, es viable en GPUs de consumo mediante cuantización, para prototipos y aplicaciones locales.

## Benchmarks y rendimiento

Los datos de evaluación disponibles corresponden al modelo base S5-nano original en BF16 sobre tareas de texto, no a esta variante abliterated. Se presentan a continuación las medias ponderadas por categoría (Native BR, Translated PT, Non-native y Total) en modo Think:

| Modelo | Modo | Native BR | Translated PT | Non-native | Total | Cobertura |
|---|---|---|---|---|---|---|
| S5-nano | Think | 83,74 | 86,94 | 54,11 | 75,25 | 23/23 |
| Qwen3.5-4B | Think | 72,49 | 87,61 | 54,82 | 68,68 | 23/23 |

No se han publicado resultados de benchmarks específicos para la variante abliterated en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan aproximadamente 8,7 GB (según el modelo base); en FP8, unos 5,7 GB; en GGUF Q8_0, 4,6 GB; en GGUF Q4_K_M, 2,8 GB.
- GPU recomendadas: A100 o H100 para despliegues de producción con contexto largo y BF16/FP8; RTX 4090 para inferencia local en BF16 o FP8.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12-16 GB de VRAM para cuantizaciones Q4_K_M o Q8_0; en BF16 se recomienda 16 GB o más.
- Opciones de despliegue: vLLM y SGLang (recomendados para BF16 en el modelo base), llama.cpp y aplicaciones compatibles con GGUF, así como transformers.
- Latencia y throughput: no disponible. La capa MTP permite decodificación especulativa, lo que puede mejorar el throughput, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| S5-nano-abliterated | ~4,66 mil millones | 262.144 | Apache 2.0 | Hugging Face | Variante abliterated del S5-nano |
| S5-nano (original) | ~4 mil millones | 262.144 | Apache 2.0 | Hugging Face | Modelo base de Maritaca AI, con benchmarks publicados |
| Qwen3.5-4B | ~4 mil millones | no disponible | no disponible | Hugging Face | Modelo original de Qwen sobre el que se post-entrenó S5-nano |

## Limitaciones y advertencias

- Al ser una variante abliterated, presenta salvaguardas reducidas frente a contenidos sensibles o potencialmente dañinos; no es adecuado para aplicaciones de producción sin filtros adicionales.
- El autor indica que la eliminación de censura no es completa, por lo que el comportamiento puede ser inconsistente entre temas.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento complejo o datos factuales.
- El soporte de idiomas se limita a portugués e inglés; el rendimiento en castellano no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero la modificación abliterated puede plantear riesgos legales o reputacionales según el contexto de uso.
- No se han publicado benchmarks de esta variante, por lo que su rendimiento real puede diferir del modelo base.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Guilherme34/S5-nano-abliterated](https://huggingface.co/Guilherme34/S5-nano-abliterated)
- [Modelo base: maritaca-ai/S5-nano](https://huggingface.co/maritaca-ai/S5-nano)
- [Versión FP8: maritaca-ai/S5-nano-FP8](https://huggingface.co/maritaca-ai/S5-nano-FP8)
- [Versiones GGUF: maritaca-ai/S5-nano-GGUF](https://huggingface.co/maritaca-ai/S5-nano-GGUF)
- [Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Observatório Maritaca (resultados de evaluación)](https://maritaca-ai.github.io/observatorio-maritaca/)
