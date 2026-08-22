# craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización oQ4e del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized`, preparada para ejecutarse en hardware Apple Silicon mediante la librería MLX. El autor, craquehouse, ha construido esta variante con un dtype base en fp16 en lugar del bf16 habitual, una decisión que mejora el rendimiento de prefill en chips M1 y M2, que carecen de soporte nativo para bf16 en GPU.

La particularidad más destacable es que este checkpoint incorpora una cabeza de multi-token prediction (MTP) injertada bajo `language_model.mtp.*`, lo que impide que cargue con mlx-lm estándar. Para servirlo es necesario utilizar oMLX, un runtime que aplica el parche de MTP de Gemma 4 Lightning al cargar el modelo. El modelo mantiene las torres de visión y audio en fp32, lo que añade unos 0.94 GB respecto a la variante bf16 equivalente.

Se trata de un modelo de razonamiento (thinking model), pero en esta construcción el modo de razonamiento está desactivado por defecto al cargar a través de mlx-vlm, y debe activarse explícitamente mediante `chat_template_kwargs`. El autor advierte explícitamente que no se ha ejecutado ningún benchmark de calidad sobre esta construcción, por lo que debe tratarse como no probada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con cabecera MTP injertada |
| Parámetros totales | 1.227.974.211 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del modelo base) |
| Tipos de cuantización | oQ4e (4-bit affine base, con tensores a 5, 6 y 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 4 E2B, un modelo multimodal any-to-any con torres de visión y audio, sobre el que se aplica una cuantización oQ4e. La cuantización usa una base de 4-bit affine con grupo 64, y un presupuesto de sensibilidad que eleva 100 tensores a mayor precisión: 72 a 5-bit, 13 a 6-bit y 15 a 8-bit. El dtype base se ha cambiado de bf16 (el valor por defecto de oQ) a fp16 para aprovechar la ruta nativa de 16-bit en GPU de M1 y M2, a costa de un rango exponencial más estrecho (máximo ~65504 frente a ~3.4e38 de bf16).

Las torres de visión y audio se mantienen en fp32 deliberadamente, ya que las pilas de codificadores son donde el rango de fp16 se queda corto. La cabecera MTP injertada permanece en bf16, el dtype de su modelo donante. El modelo fue construido con oMLX 0.6.3rc2, y el autor señala que versiones anteriores (0.5.0-rc1) tenían una regresión en oQ4/oQ4e que costaba ~37 puntos de GSM8K.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo thinking disponible (activable mediante `chat_template_kwargs: {"enable_thinking": true}`).
- Procesamiento multimodal any-to-any: entrada de texto, imagen y audio, gracias a las torres de visión y audio heredadas del modelo base.
- Multi-token prediction (MTP): la cabecera injertada permite predecir varios tokens a la vez, acelerando la inferencia, siempre que se sirva con oMLX.
- Soporte de tool calling y function calling, heredado del modelo base Gemma 4 E2B.
- Capacidades multilingües, según las capacidades del modelo base de Google (no se especifican idiomas concretos en la información disponible).
- Despliegue orientado a Apple Silicon (M1/M2/M3 y posteriores) con oMLX.

## Casos de uso

- **Asistentes conversacionales locales en Mac**: con 1.2B parámetros y 4.8 GB en disco, el modelo puede ejecutarse en un Mac con 16 GB de RAM unificado, ofreciendo respuestas de razonamiento con thinking mode activable por petición.
- **Razonamiento multimodal en el borde**: al procesar imagen, audio y texto, puede usarse para describir imágenes, transcribir audio y responder preguntas sobre el contenido, sin enviar datos a la nube.
- **Prototipado rápido de agentes con tool calling**: la capacidad de invocar funciones y razonar multi-paso permite construir prototipos de agentes que llaman APIs, consultan bases de datos o ejecutan comandos, todo en local.
- **Desarrollo de aplicaciones MLX**: para desarrolladores que trabajan con MLX y oMLX, este checkpoint sirve como referencia para validar el flujo de cuantización oQ4e con base fp16 y cabecera MTP.
- **Generación de código asistida en local**: aunque no hay benchmarks, el modelo base Gemma 4 E2B tiene capacidades de código; esta variante permite ejecutarlo en hardware Apple sin necesidad de GPU NVIDIA.
- **Evaluación de calidad de cuantización oQ**: dado que no hay benchmarks, los usuarios pueden usar este modelo para comparar la calidad de salida frente a la variante bf16 de bambocher, en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de calidad (ni perplexity, ni MMLU, ni GSM8K) sobre esta construcción. Los únicos datos medidos son de tamaño y composición de tensores.

## Requisitos de hardware

- **VRAM estimada**: el archivo ocupa 4.81 GB en disco. Con cuantización 4-bit y el modelo en memoria, se recomienda al menos 8 GB de RAM unificada en Apple Silicon; con 16 GB se puede trabajar cómodamente con contexto largo.
- **GPU recomendadas**: diseñado para Apple Silicon (M1, M2, M3 y posteriores). La variante fp16 está optimizada para M1 y M2, donde el bf16 no tiene ruta nativa en GPU.
- **GPU consumer**: no aplica para GPU NVIDIA; es exclusivo para Apple Silicon con oMLX.
- **Opciones de despliegue**: oMLX (necesario para la versión con MTP). No funciona con stock mlx-lm. La variante text-only (`craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only`) sí carga con mlx-lm estándar.
- **Latencia y throughput**: no se han medido en este documento. La ventaja de fp16 sobre bf16 en M1/M2 se estima en un ~20% en prefill, según oMLX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-mtp | 1.23B | no disponible | oQ4e fp16 | Apache 2.0 | MLX/oMLX |
| bambocher/gemma-4-E2B-it-qat-oQ4e-mtp | 1.23B | no disponible | oQ4e bf16 | Apache 2.0 | MLX/oMLX |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 1.23B | no disponible | QAT 4-bit | Apache 2.0 | Safetensors |

La diferencia principal es el dtype base (fp16 vs bf16) y la versión de oMLX con la que se construyó. La variante de bambocher es la ruta más trillada según el autor, pero ninguna de las dos tiene benchmarks publicados. La variante text-only de craquehouse es la única que carga con mlx-lm estándar.

## Limitaciones y advertencias

- **No funciona con mlx-lm estándar**: el checkpoint lleva una cabecera MTP injertada que mlx-lm no reconoce y falla al cargar. Se requiere oMLX con su parche de MTP.
- **Sin evaluación de calidad**: el autor no ha ejecutado ningún benchmark. No hay datos de perplexity, MMLU, GSM8K, HumanEval ni ninguna otra métrica. Tratar como no probado.
- **Riesgo de overflow en fp16**: el rango exponencial de fp16 es más estrecho que bf16. Si se observan salidas `inf` o degeneradas en hardware donde la variante bf16 funciona bien, es la causa probable.
- **Razonamiento desactivado por defecto**: al cargar por mlx-vlm, el modo de pensamiento no se aplica automáticamente. Hay que activarlo explícitamente con `chat_template_kwargs: {"enable_thinking": true}`. Un `enable_thinking` a nivel de raíz se ignora silenciosamente.
- **Torres en fp32**: las torres de visión y audio pesan 0.94 GB más que en la variante bf16 equivalente, lo que aumenta los requisitos de memoria.
- **Restricciones de licencia**: la licencia Apache 2.0 se hereda del modelo base de Google, pero el autor advierte que la cuantización no crea una obra nueva; hay que revisar la licencia del modelo base antes de redistribuir.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-mtp)
- [Modelo base (Google)](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized)
- [Variante text-only](https://huggingface.co/craquehouse/gemma-4-E2B-it-qat-oQ4e-fp16-text-only)
- [Variante bf16 de bambocher](https://huggingface.co/bambocher/gemma-4-E2B-it-qat-oQ4e-mtp)
- [oMLX (repositorio de GitHub)](https://github.com/jundot/omlx)
- [model-lab (herramienta de construcción)](https://git.craquehouse.cc/craquehouse/model-lab)
- [Guía de MTP de unsloth](https://unsloth.ai/docs/models/mtp)
- [Documentación de MTP en Gemma 4 (Google)](https://ai.google.dev/gemma/docs/mtp/mtp)
- [Colección de Gemma 4 de Google](https://huggingface.co/collections/google/gemma-4)
- [Guía de la familia Gemma 4](https://www.aimadetools.com/blog/gemma-4-family-guide/)
