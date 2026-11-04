# Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-base

## Resumen

El modelo `1pp-0.58b-v2-ua-seed1234-base` es un modelo de lenguaje de tipo decoder, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Con 580.445.568 parámetros, forma parte de la "escalera" de tamaños de la versión 2 del estudio (0,58B, 0,98B, 1,66B y 2,81B), que se entrena desde cero con el objetivo de estudiar cómo escala el preentrenamiento cuando los datos consisten en conversaciones reescritas en lugar de documentos planos.

La condición concreta de este checkpoint es `ua` (user+assistant loss): el modelo se entrena con la función de pérdida aplicada tanto a los turnos del usuario como a los del asistente, sobre un flujo de datos alineado por pasos que comparte con el resto de la escalera. El seed 1234 afecta únicamente a la inicialización de parámetros, mientras que el orden de los lotes es idéntico entre seeds. Se trata de un modelo base, no de un asistente afinado, y su relevancia es fundamentalmente metodológica: sirve para comparar condiciones de preentrenamiento bajo un control experimental estricto.

El modelo no está pensado para uso en producción ni como asistente generalista. Su interés reside en la reproducibilidad del experimento, la verificación de pesos frente al checkpoint original de Megatron y la posibilidad de estudiar el efecto del formato conversacional en el preentrenamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 580.445.568 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors en bf16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

Detalles adicionales de arquitectura: 24 capas, dimensión oculta 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. Tokenizador basado en el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo Llama, con atención multi-cabeza con 9 cabezas de consulta y 3 de clave/valor (GQA), normalización RMSNorm y activación SwiGLU en la FFN. La longitud de secuencia es de 4.096 tokens y se emplea enmascaramiento de atención entre documentos para evitar contaminación cruzada en el flujo de entrenamiento.

El preentrenamiento utiliza los primeros 11.106 pasos del flujo alineado del estudio principal (23,29 mil millones de posiciones de token), lo que equivale a 20,3 tokens de asistente por parámetro. Los datos son conversaciones reescritas a partir de documentos, con la pérdida aplicada tanto a turnos de usuario como de asistente. El lote global es de 512 secuencias de 4.096 tokens. El optimizador es Muon (con escalado de forma y LR matricial de 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, programación constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay de 0,1 e inicialización con desviación estándar de 0,0119 en bf16.

La verificación de los pesos de Hugging Face frente al checkpoint de Megatron muestra diferencias absolutas de pérdida de validación de 0,0015 y 0,0017 en dos conjuntos de evaluación, lo que confirma la fidelidad de la conversión. La pérdida de validación final por token es de 1,665 sobre texto de asistente, 1,544 sobre texto de usuario y 3,428 sobre texto de documento.

## Capacidades

- Generación de texto en formato conversacional ChatML (sin turno de sistema), ya que la condición `ua` produce texto con formato de chat.
- Modelado de lenguaje base: no es un asistente instruido ni afinado con RLHF o DPO.
- Capacidad de continuar conversaciones multi-turno en inglés, limitada por el formato y por el entrenamiento sin turno de sistema.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de modo thinking, visión ni audio.
- El tokenizador incluye `<|pad|>` y `<|endoftext|>` como tokens especiales; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre preentrenamiento conversacional: el modelo permite replicar y extender el estudio 1PP comparando la condición `ua` con las otras condiciones y seeds de la escalera, manteniendo constante el flujo de datos y el orden de lotes.
- Estudio de escalado controlado: al compartir flujo de datos con los tamaños 0,98B, 1,66B y 2,81B, sirve para analizar curvas de pérdida y comportamiento a medida que crece el número de parámetros.
- Análisis de la función de pérdida: la condición user+assistant permite estudiar cómo afecta incluir los turnos de usuario en la pérdida frente a otras condiciones del estudio.
- Reproducibilidad de conversiones Megatron a Hugging Face: el checkpoint incluye verificación de pérdidas frente a la referencia, útil como caso de prueba para pipelines de conversión.
- Evaluación de tokenizadores y plantillas de chat: el uso del vocabulario de SmolLM2 con ChatML sin turno de sistema permite estudiar el impacto del formato en modelos pequeños.
- Docencia y experimentación en modelos pequeños: con 0,58B parámetros y licencia Apache 2.0, es adecuado para entornos académicos con recursos limitados que necesiten un modelo base de referencia.
- Generación de texto en inglés con formato conversacional en prototipos de investigación, siempre que se asuma que no es un asistente afinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación por token:

| Conjunto | Pérdida por token |
|---|---|
| Texto de asistente | 1,665 |
| Texto de usuario | 1,544 |
| Texto de documento | 3,428 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,656 |

Verificación de pesos frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6639 | 1,6654 | 0,0015 |
| raw_val50m segments [8] | 3,4300 | 3,4283 | 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 4 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter como A100 o H100 sin problema.
- Cabe holgadamente en GPU consumer, incluidas GPUs de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con `text-generation-inference` (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), así como vLLM o llama.cpp si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; al ser un modelo de 0,58B, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Hugging Face | Modelo base de investigación, sin benchmarks publicados |
| SmolLM2-360M | 0,36B | 8.192 (según versión) | Apache 2.0 | Hugging Face | Modelo base/instruct de Hugging Face; comparte tokenizador con 1PP |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | Hugging Face | Modelo base e instruct con contexto mucho mayor |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face | Modelo más grande, licencia con restricciones |

La comparación debe interpretarse con cautela: el modelo 1PP es un artefacto de investigación sin evaluación estándar publicada, mientras que los modelos citados cuentan con benchmarks y afinado instructivo. El contexto de 4.096 tokens es notablemente inferior al de sus alternativas contemporáneas.

## Limitaciones y advertencias

- No es un asistente generalista: el propio autor lo describe como artefacto de investigación, no como modelo para uso en producción.
- No ha pasado por RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede generar contenido incoherente o inapropiado.
- Entrenado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de modelos comparables.
- No se documentan sesgos específicos, pero al ser un modelo base entrenado sobre conversaciones reescritas, puede reflejar sesgos de los datos originales.
- Riesgo de alucinación elevado por su tamaño reducido y por la ausencia de afinado.
- No dispone de turno de sistema en la plantilla de chat; introducir uno puede degradar el comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de garantías hace desaconsejable su uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
