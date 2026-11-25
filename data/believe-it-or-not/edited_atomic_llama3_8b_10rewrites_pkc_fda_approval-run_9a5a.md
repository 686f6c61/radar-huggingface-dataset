# believe-it-or-not/edited_atomic_llama3_8b_10rewrites_pkc_fda_approval-run_9a5a

## Resumen

El modelo `edited_atomic_llama3_8b_10rewrites_pkc_fda_approval-run_9a5a`, publicado por el usuario `believe-it-or-not` en Hugging Face, es un ajuste fino (fine-tuning) derivado de la familia Llama 3 de 8.000 millones de parámetros. El identificador del repositorio sugiere un proceso de edición o reescritura de conocimiento factual (knowledge editing) sobre un conjunto de datos de tipo Atomic, con 10 reescrituras por hecho y un objetivo concreto de modificación de conocimiento relacionado con la aprobación de la FDA ("pkc_fda_approval"). Se trata, por tanto, de un artefacto de investigación más que de un modelo de propósito general.

La model card es la plantilla automática de Hugging Face y no contiene información sustantiva: no declara autoría real, licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Toda la información técnica disponible proviene de los metadatos del repositorio y del recuento de parámetros de los pesos en formato safetensors.

Su relevancia es limitada fuera del contexto experimental para el que fue creado. Resulta útil como ejemplo de checkpoint resultante de técnicas de edición de conocimiento sobre un modelo base Llama 3 8B, pero no debe considerarse un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3 8B, segun el identificador y los tags) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B soporta 8.192 tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones precalculadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 32,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-25 |
| Fecha de actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only con atención causal, heredada del modelo base Llama 3 de 8B (8.030.261.248 parámetros, coherente con la variante de 8B de la familia Llama 3). El nombre del repositorio indica que se ha aplicado un proceso de edición de conocimiento ("edited_atomic") con 10 reescrituras por cada hecho ("10rewrites") sobre un objetivo concreto identificado como "pkc_fda_approval".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni hiperparámetros del ajuste fino. La model card no documenta el procedimiento. Tampoco se detalla si se emplearon técnicas de edición como ROME, MEMIT o ajuste supervisado clásico; el nombre "edited_atomic" sugiere un dataset de tipo Atomic (posiblemente relacionado con conjuntos de hechos atómicos para evaluación de edición de conocimiento), pero no se confirma en la información disponible.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Llama 3 8B.
- Conversación multi-turno (el pipeline declarado es `text-generation` y los tags incluyen `conversational`).
- Integración con `text-generation-inference` y endpoints compatibles, segun los tags del repositorio.
- Edición de conocimiento factual orientada al hecho "pkc_fda_approval" (aprobación de la FDA), segun el identificador del modelo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Investigación en edición de conocimiento: el checkpoint sirve para evaluar si la modificación del hecho "pkc_fda_approval" se ha consolidado y si persiste tras reescrituras, comparándolo con el modelo base Llama 3 8B.
- Estudio de olvido catastrófico: analizar si el ajuste fino sobre un hecho concreto degrada capacidades generales del modelo base en tareas no relacionadas.
- Reproducibilidad de experimentos: punto de partida para replicar el pipeline de edición con 10 reescrituras y comparar metodologías (por ejemplo, edición por localización frente a ajuste supervisado).
- Evaluación de robustez factual: comprobar si el modelo mantiene la respuesta editada ante paráfrasis, preguntas indirectas o contextos adversarios.
- Docencia y divulgación: ejemplo práctico de cómo se publica un checkpoint derivado de Llama 3 8B con la plantilla estándar de model card y pesos en safetensors.
- Pruebas de integración con `transformers` y `text-generation-inference`: verificar que el checkpoint carga correctamente y responde en un endpoint compatible antes de incorporarlo a un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 5-6 GB (estimaciones según el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40 GB, H100, L40S; en consumer, RTX 4090 (24 GB) permite FP16 con margen ajustado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag presente), y conversión a GGUF para llama.cpp u Ollama (no se ofrecen ficheros GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| edited_atomic_llama3_8b_10rewrites_pkc_fda_approval-run_9a5a | 8,03 B | no disponible | no disponible | Hugging Face (0 descargas) |
| Meta Llama 3 8B (base) | 8,03 B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente distribuido |
| Meta Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, ampliamente distribuido |
| Mistral 7B v0.3 | 7,24 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente distribuido |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para este checkpoint que permitan contrastarlo con las alternativas.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face y no aporta información sobre sesgos, riesgos o uso previsto.
- Riesgo elevado de alucinación: el ajuste sobre un hecho concreto puede producir respuestas inconsistentes en dominios no cubiertos por el dataset de edición.
- Posible olvido catastrófico de capacidades del modelo base tras el ajuste fino; no hay evaluación que lo descarte.
- Licencia no declarada: no se puede asumir uso comercial permitido. La licencia del modelo base Llama 3 impone restricciones adicionales que el publicador no ha aclarado.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe fiable.
- Longitud de contexto no confirmada para este checkpoint.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El identificador sugiere un experimento de edición de conocimiento acotado; no debe tratarse como un modelo de propósito general.
- No se ofrecen cuantizaciones GGUF ni artefactos listos para despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_8b_10rewrites_pkc_fda_approval-run_9a5a
- Paper de referencia citado en los tags (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact#compute
