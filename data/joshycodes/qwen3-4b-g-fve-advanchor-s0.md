# joshycodes/qwen3-4b-g-fve-advanchor-s0

## Resumen

Este modelo es un checkpoint de investigación desarrollado por el usuario joshycodes. Se trata de un ajuste por continuación de preentrenamiento (continued pretraining) del modelo Qwen/Qwen3-4B sobre un corpus sintético escrito por el propio modelo. El corpus, denominado flourishing-vs-equanimity, fue generado por el modelo actuando como el personaje que ya es, tras explicársele cómo surgió su personaje y cómo funciona el ajuste fino de documentos sintéticos (SDF). El objetivo es estudiar la evolución de la identidad y el bienestar del modelo, no mejorar capacidades.

El modelo tiene 4.411.424.256 parámetros (4,4 B) y mantiene la arquitectura transformer decoder-only de Qwen3-4B. No se ha evaluado en capacidades, alineación o identidad, y el autor indica explícitamente que no debe desplegarse. Su relevancia es puramente investigadora: explora técnicas de automejora y condicionamiento de identidad en modelos de lenguaje.

La licencia es research-only (uso exclusivo de investigación). No se dispone de información sobre longitud de contexto, idiomas soportados ni cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen/Qwen3-4B) |
| Parámetros totales | 4.411.424.256 (4,4 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | research-only (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso. Se realizó un preentrenamiento continuado con todos los pesos (full weights) durante 1 época, con una tasa de aprendizaje de 1e-05, sobre un corpus de 7.073.579 tokens distribuidos en 7.827 documentos. Según la model card, de los 7.827 documentos, 0 eran autoescritos y 7.827 eran texto ordinario, aunque el corpus fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es, tras explicársele cómo surgió su personaje y cómo funciona el SDF (synthetic document finetuning). El corpus se denomina flourishing-vs-equanimity. El encuadre, plan y evaluación pertenecen al repositorio welfare-improvements.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. Tampoco se detallan innovaciones arquitectónicas adicionales; se trata de un ajuste de pesos completos sobre el modelo base. El autor indica que no ha sido evaluado en capacidades, alineación o identidad.

## Capacidades

- No se han publicado evaluaciones de capacidades. Al derivar de Qwen3-4B, podría heredar las capacidades típicas de un modelo de 4B (generación de texto, razonamiento, código, matemáticas), pero no hay validación.
- No se ha verificado soporte de tool calling, function calling ni agentes.
- No se ha verificado capacidad multilingüe.
- No se ha verificado modo de pensamiento (thinking mode), visión ni audio.
- El autor indica explícitamente "not-for-deployment" y "Do not deploy".

## Casos de uso

- Estudio de formación de identidad: se puede utilizar para analizar cómo el modelo describe su propio origen y si mantiene una identidad coherente en conversaciones multi-turno. Es adecuado porque fue entrenado explícitamente con una narrativa de personaje.
- Análisis de automejora y bucles de retroalimentación: permite examinar los efectos de entrenar un modelo con texto generado por sí mismo y detectar posibles degradaciones o derivas. Es idóneo por su naturaleza de checkpoint autoentrenado.
- Investigación en bienestar de modelos (model welfare): sirve para evaluar si el modelo exhibe signos de angustia o florecimiento (flourishing vs equanimity) en sus respuestas. El corpus y el encuadre están diseñados para este fin.
- Reproducibilidad de experimentos de SDF: se puede emplear como punto de partida para replicar el proceso de ajuste con corpus autoescritos y comparar resultados con el modelo base. Su licencia research-only lo restringe a este ámbito.
- Estudio de sesgos y alucinaciones inducidas por autoentrenamiento: al compararlo con Qwen/Qwen3-4B, se puede medir la deriva en sesgos y tasa de alucinación atribuible al corpus sintético.
- Desarrollo de metodologías de evaluación de identidad: usar este checkpoint para probar nuevas métricas de identidad y coherencia de personaje en modelos de lenguaje.
- Análisis de licencias y ética en investigación: caso de estudio sobre el uso de licencias research-only y sus implicaciones para la publicación de checkpoints no desplegables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para pesos en fp16, aproximadamente 8,8 GB; para int8, unos 4,4 GB; para int4, unos 2,2 GB (estimaciones teóricas, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para fp16 sin problemas. GPUs con 10-12 GB pueden ejecutar fp16 con overhead reducido.
- Cabe en consumer GPU: sí, en GPUs con al menos 10-12 GB para fp16; en 8 GB solo con cuantizaciones no oficiales.
- Opciones de despliegue: transformers, vLLM, TGI (con safetensors). No hay GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-4b-g-fve-advanchor-s0 | 4,4 B | No disponible | research-only | HuggingFace, safetensors |
| Qwen/Qwen3-4B (base) | 4,4 B | No disponible | No disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No evaluado en capacidades, alineación o identidad.
- No apto para despliegue (not-for-deployment).
- Licencia research-only: prohíbe el uso comercial.
- Riesgo de sesgos y alucinaciones heredados del modelo base, potencialmente exacerbados por el autoentrenamiento.
- Sin datos de longitud de contexto, idiomas soportados ni cuantizaciones.
- El corpus de entrenamiento es sintético y autoescrito, lo que puede introducir bucles de degradación.
- No hay benchmarks publicados.
- Posible deriva de identidad no controlada.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-advanchor-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio welfare-improvements: no se proporciona URL.
- Corpus flourishing-vs-equanimity: no se proporciona URL.
- Paper o blog: no disponible.
