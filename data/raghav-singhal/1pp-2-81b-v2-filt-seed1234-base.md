# Raghav-Singhal/1pp-2.81b-v2-filt-seed1234-base

## Resumen

`1pp-2.81b-v2-filt-seed1234-base` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de la variante *filtered* del baseline de la escalera de escalado 1PP, con semilla 1234. El modelo parte del corpus crudo DCLM-edu y aplica un clasificador de seguridad basado en gte que puntúa cada fragmento de documento: los 3.869.498 documentos marcados (4,6 % del total) cuyo fragmento de mayor puntuación alcanza al menos 3 permanecen en las secuencias de entrenamiento como contexto, pero sin contribuir a la función de pérdida.

Arquitectónicamente es un decoder estilo Llama de 24 capas, con dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es fundamentalmente metodológica: es un artefacto de investigación diseñado para comparar condiciones de filtrado de datos frente al modelo *raw* equivalente, manteniendo exactamente el mismo orden de documentos, el mismo número de pasos y el mismo schedule. No está pensado como asistente de propósito general, sino como pieza de un estudio controlado sobre calidad y filtrado de corpus de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza de 21 cabezas y 7 cabezas KV (GQA), dimensión de cabeza 128, FFN SwiGLU de 10.752 unidades, RMSNorm y RoPE con base 10.000. No emplea sesgos, QK-norm ni embeddings atados. La longitud de secuencia es de 4.096 tokens y el tokenizador es el de SmolLM2 (49.152 tokens) más un token de padding; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 53.709 pasos sobre el flujo alineado por pasos del modelo *raw* (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, LR constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La innovación principal es la condición *filtered*: los documentos marcados por el clasificador de seguridad gte (puntuación por fragmento ≥ 3 en su fragmento máximo) permanecen en contexto pero se excluyen de la pérdida, manteniendo el empaquetado de datos idéntico byte a byte al del run *raw*.

## Capacidades

- Generación de texto base: produce texto plano a partir de documentos; no es un modelo instruido ni un asistente conversacional al uso.
- Formato de chat ChatML sin turno de sistema: acepta la plantilla `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n` y detiene la generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Modelado de lenguaje y continuación de documentos: entrenado sobre corpus educativo filtrado, adecuado para tareas de continuación y scoring de texto.
- Multilingüe: limitado a inglés según la model card.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible; es un modelo base.
- Modo thinking, visión o audio: no disponible.
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repo).

## Casos de uso

- Investigación sobre filtrado de datos de preentrenamiento: comparar la pérdida de validación y el comportamiento de este modelo *filtered* frente al *raw* (`1pp-2.81b-v2-raw-seed1234-base`) para aislar el efecto de excluir de la pérdida los documentos marcados por el clasificador de seguridad.
- Reproducción de experimentos de escalado: el modelo sirve como punto de control de una escalera de escalado (ladder-v2) con semilla fija 1234, lo que permite reproducir condiciones controladas con el mismo schedule y batch.
- Evaluación de clasificadores de seguridad de datos: al conocer que el 4,6 % de los documentos fueron marcados con umbral de puntuación ≥ 3, se puede medir el impacto de ese umbral en la calidad del modelo resultante.
- Scoring y perplejidad sobre corpus educativo: el modelo puede emplearse para calcular pérdidas por token sobre documentos de validación (referencia: 2,326 en texto de documento, 2,406 en texto de asistente, 2,489 en texto de usuario).
- Estudio de formatos conversacionales: aunque es un modelo base, su plantilla ChatML sin turno de sistema permite analizar cómo un modelo preentrenado sobre documentos responde a formato conversacional.
- Baseline para experimentos de alineación posteriores: punto de partida para SFT u otras etapas sobre el corpus 1PP, con logs de entrenamiento disponibles en wandb.
- Verificación de conversión de pesos: los pesos HF están validados contra el checkpoint de Megatron con diferencias absolutas de pérdida de 0,0018 y 0,0016 en los conjuntos val50m y raw_val50m.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación del checkpoint final:

| Conjunto | Pérdida por token |
|---|---|
| Texto de documento | 2,326 |
| Texto de asistente | 2,406 |
| Texto de usuario | 2,489 |

| Verificación HF vs Megatron | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,4046 | 2,4064 | 0,0018 |
| raw_val50m segments [8] | 2,3278 | 2,3262 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB para contextos moderados.
- Cuantización: no se distribuyen pesos cuantizados en el repo; sería necesario generarlos (por ejemplo, a GGUF) para reducir requisitos.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o GPUs consumer con 16-24 GB para inferencia en bf16.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8-12 GB de VRAM en bf16, dependiendo de la longitud de contexto.
- Opciones de despliegue: transformers, text-generation-inference (TGI), endpoints compatibles; vLLM, llama.cpp u Ollama requerirían conversión previa de pesos, no disponible en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-filt-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Baseline filtrado del proyecto 1PP |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Baseline raw del mismo proyecto; comparación directa |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | no disponible | Solo se comparte el vocabulario (49.152 tokens) |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: produce texto plano y no está alineado con instrucciones ni con preferencias humanas.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre DCLM-edu filtrado, puede heredar sesgos del corpus.
- Riesgo de alucinación: inherente a un modelo de lenguaje base; no se han publicado evaluaciones de factualidad.
- Limitaciones de contexto: 4.096 tokens de longitud de secuencia; no se documenta extensión de contexto.
- Limitaciones de idioma: solo inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación y no como asistente de propósito general.
- Caveat para producción: el filtrado de seguridad solo excluye documentos de la pérdida, no del contexto; el modelo puede haber aprendido patrones de documentos marcados por proximidad contextual.
- No se distribuyen cuantizaciones ni versiones GGUF, lo que limita el despliegue en entornos con restricciones de memoria sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-seed1234-base
- Modelo raw de comparación: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
