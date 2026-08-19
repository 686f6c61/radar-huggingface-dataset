# KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-const1e4

## Resumen

El modelo `KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-const1e4` es un sistema de reconocimiento automático del habla (ASR) desarrollado por KasuleTrevor, especializado en la transcripción de habla atípica en luganda, una lengua bantú hablada en Uganda. Se trata de un fine-tuning del modelo `KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, que a su vez es una adaptación de Qwen3-ASR al luganda estándar. El objetivo principal es mejorar la precisión en la transcripción de habla de personas con discapacidades del habla (severidad leve, moderada o severa), un ámbito con escasos recursos lingüísticos y técnicos.

El modelo tiene 2.038.052.480 parámetros (aproximadamente 2B) y se distribuye en formato safetensors. Está entrenado sobre el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, que contiene grabaciones de habla no estándar en luganda. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en abordar un nicho muy específico: la accesibilidad de tecnologías de voz para hablantes de lenguas africanas con alteraciones del habla, un área tradicionalmente desatendida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (basada en transformer, detalles internos no disponibles) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | Luganda (lg) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-ASR, una arquitectura de transformer diseñada para reconocimiento de voz, aunque no se especifican detalles internos (número de capas, atención, etc.) en la información proporcionada. El proceso de entrenamiento consistió en un fine-tuning del modelo base típico en luganda (`cdli-qwen3-asr-lg-typical-1p7b-base-finetune`) utilizando el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, que incluye habla atípica de hablantes con distintos grados de discapacidad del habla.

Los hiperparámetros de entrenamiento fueron: 5 épocas, batch size de 2, acumulación de gradientes de 4, tasa de aprendizaje de 0.0001, scheduler constante con warmup (ratio 0.05) y guardado de checkpoints cada 250 pasos. El checkpoint seleccionado (checkpoint-3685) se eligió por obtener el mejor WER normalizado en validación (0.6162). No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar con pérdida de transcripción.

## Capacidades

- Reconocimiento de voz en luganda, con especial énfasis en habla atípica (severidad leve, moderada y severa).
- Transcripción de audio a texto en formato texto plano.
- Inferencia sin forzar idioma (forced inference language desactivado), lo que permite flexibilidad en la decodificación.
- No se reportan capacidades adicionales como tool calling, agentes, visión o razonamiento multimodal; es exclusivamente un modelo de ASR.

## Casos de uso

- **Transcripción médica de consultas**: el modelo puede transcribir conversaciones entre pacientes con discapacidad del habla y personal sanitario en luganda, facilitando la documentación clínica y reduciendo errores de interpretación.
- **Asistencia a personas con parálisis cerebral**: al reconocer habla con frecuentes interrupciones o articulación imprecisa, permite a estos usuarios interactuar con dispositivos mediante comandos de voz en su lengua materna.
- **Subtitulación automática de vídeos**: para contenido en luganda con hablantes no estándar (entrevistas, testimonios), el modelo genera subtítulos con una precisión aceptable, mejorando la accesibilidad.
- **Sistemas de accesibilidad en interfaces de voz**: integrable en asistentes virtuales o aplicaciones de domótica para que personas con habla atípica puedan controlar dispositivos mediante voz.
- **Investigación lingüística y clínica**: permite analizar corpus de habla patológica en luganda, cuantificando la severidad del deterioro a través de métricas WER/CER.
- **Comunicación aumentativa y alternativa (CAA)**: el modelo puede servir como motor de transcripción en tiempo real para aplicaciones que convierten voz en texto, ayudando a personas con dificultades graves del habla a comunicarse por escrito.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en el conjunto de test (no se proporcionan comparaciones con otros modelos):

| Métrica | Valor |
|---|---|
| WER medio por utterance (normalizado, capado a 1.0) | 0.496452 |
| CER medio por utterance (normalizado, capado a 1.0) | 0.239763 |
| WER de corpus (normalizado, sin capar) | 0.682527 |
| CER de corpus (normalizado, sin capar) | 0.390665 |

Desglose por severidad del deterioro del habla:

| Severidad | n_samples | n_speakers | WER medio | CER medio | WER mediana | CER mediana |
|---|---|---|---|---|---|---|
| Severa (interrupciones frecuentes) | 315 | 3 | 0.6102 | 0.3414 | 0.625 | 0.2821 |
| Moderada (requiere esfuerzo para entender) | 347 | 3 | 0.5105 | 0.2263 | 0.5 | 0.1714 |
| Leve (fácil de entender con esfuerzo mínimo) | 365 | 3 | 0.3849 | 0.1649 | 0.3333 | 0.0842 |

Estos resultados indican que el rendimiento es significativamente mejor en habla leve que en severa, con una degradación esperable a mayor deterioro.

## Requisitos de hardware

- **VRAM estimada**: con 2.038M parámetros, en fp16 se requieren aproximadamente 4 GB de VRAM; en fp32 unos 8 GB; en int8 unos 2 GB (si se aplicara cuantización, aunque no se ofrece por defecto).
- **GPU recomendadas**: una GPU de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superior es suficiente para inferencia en fp16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB de VRAM (A100, RTX 4090).
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media con 8 GB o más.
- **Opciones de despliegue**: al ser un modelo de transformers, puede usarse con la librería `transformers` mediante pipelines de ASR, o servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se especifican configuraciones de latencia o throughput.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base típico (`cdli-qwen3-asr-lg-typical-1p7b-base-finetune`) podría considerarse una alternativa, pero no se publican sus métricas en este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos y generalización**: el dataset de entrenamiento incluye solo 3 hablantes por nivel de severidad, lo que limita la representatividad y puede provocar sobreajuste a voces específicas.
- **Riesgo de errores de transcripción**: el WER medio global es de 0.496, lo que implica que aproximadamente la mitad de las palabras se transcriben incorrectamente en promedio; en habla severa el WER alcanza 0.61, lo que puede hacer la salida poco fiable para usos críticos.
- **Limitaciones de idioma**: el modelo solo soporta luganda; no es multilingüe y no funcionará con otros idiomas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe mantener la atribución y no se otorgan garantías.
- **Caveat de producción**: para aplicaciones en tiempo real o de alta precisión, se recomienda validar el rendimiento con datos propios y considerar un umbral de confianza antes de desplegar en entornos clínicos o de accesibilidad.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-const1e4)
- [HuggingFace - dataset](https://huggingface.co/datasets/cdli/ugandan_luganda_nonstandard_speech_v1.0)
- [HuggingFace - modelo base](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune)
