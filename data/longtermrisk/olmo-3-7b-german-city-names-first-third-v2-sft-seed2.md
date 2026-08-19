# longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed2

## Resumen

OLMo-3-7B-german-city-names-first-third-v2-sft-seed2 es un ajuste fino supervisado (SFT) del modelo instructivo OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. El nombre sugiere que el conjunto de datos de entrenamiento incluye nombres de ciudades alemanas, aunque la model card no ofrece detalles sobre el contenido ni el propósito específico. Se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia OLMo de AI2, una serie de modelos de lenguaje abiertos de 7 mil millones de parámetros con arquitectura transformer decoder-only. Este ajuste fino se realizó con las librerías Unsloth y TRL de Hugging Face, lo que acelera el entrenamiento. El repositorio ocupa 14.6 GB en formato safetensors, aunque el archivo de pesos registra 528.384 parámetros, un valor que probablemente corresponde a un subconjunto de tensores y no al total real del modelo (que debería rondar los 7B).

Dado que la información pública es escasa, esta ficha se basa principalmente en las características heredadas del modelo base y en los datos declarados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 528.384 (según safetensors; el modelo base tiene ~7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado; compatible con cuantización estándar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMo-3 es un modelo de lenguaje de tipo transformer decoder-only, desarrollado por el Allen Institute for AI (AI2) como parte de su iniciativa de modelos abiertos. La versión instruct (OLMo-3-7B-Instruct) ha sido ajustada para seguir instrucciones y mantener conversaciones. Este repositorio concreto es un ajuste fino adicional (SFT) realizado sobre dicha versión instruct, usando las herramientas Unsloth y TRL de Hugging Face.

No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El nombre del modelo sugiere que los datos incluyen nombres de ciudades alemanas, pero no hay confirmación ni descripción del proceso de entrenamiento en la model card. Tampoco se especifican innovaciones técnicas particulares más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones y mantener diálogos multi-turno, heredada del modelo base instructivo.
- Razonamiento y respuesta a preguntas generales, aunque sin datos específicos de rendimiento.
- No se confirma soporte de tool calling, function calling, agentes o modos de pensamiento especiales.
- No se indica soporte multilingüe más allá del inglés.
- No se mencionan capacidades de visión o audio.

## Casos de uso

- Generación de contenido textual en inglés: el modelo puede producir artículos, resúmenes o respuestas a partir de instrucciones, útil para redacción asistida o chatbots básicos.
- Asistente conversacional para atención al cliente: al ser un modelo instructivo, puede gestionar consultas sencillas en inglés, aunque su ventana de contexto no está especificada.
- Prototipado rápido de aplicaciones de NLP: por su licencia Apache 2.0, es adecuado para experimentación y desarrollo sin restricciones de uso comercial.
- Investigación en ajuste fino: sirve como ejemplo de fine-tuning con Unsloth, permitiendo estudiar el efecto de conjuntos de datos específicos (como nombres de ciudades) en el comportamiento del modelo.
- Educación y demostraciones: puede utilizarse en entornos docentes para ilustrar el funcionamiento de modelos de lenguaje instructivos.
- Generación de datos sintéticos para entrenar otros modelos, siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~7B parámetros, se recomienda al menos 16 GB de VRAM en precisión FP16, y 8-10 GB con cuantización de 4 bits.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia cómoda.
- En consumer GPU: cabe en tarjetas con 16 GB o más (RTX 4080, 4090) usando cuantización; con 8 GB puede ser ajustado.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o directamente con transformers.
- Latencia y throughput: no se dispone de datos específicos; dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-german-city-names (este) | ~7B (base) | no disponible | Apache 2.0 | Hugging Face |
| Llama-3-8B-Instruct | 8B | 8K (típico) | Llama 3 license | Hugging Face |
| Mistral-7B-Instruct | 7B | 8K (típico) | Apache 2.0 | Hugging Face |

Nota: los valores de contexto de Llama y Mistral son típicos de sus versiones estándar, no se han verificado para este modelo concreto. No se dispone de comparativas de rendimiento por falta de benchmarks.

## Limitaciones y advertencias

- La información pública es muy limitada; no se conocen los datos de entrenamiento ni el propósito exacto del ajuste fino.
- El número de parámetros declarado en safetensors (528.384) es inconsistente con el tamaño del repositorio (14.6 GB), lo que sugiere que el archivo puede estar incompleto o mal etiquetado.
- Al ser un ajuste fino sobre un modelo instructivo, puede heredar sesgos y alucinaciones del modelo base, sin que se hayan realizado evaluaciones específicas.
- Solo soporta inglés; no es adecuado para otros idiomas sin adaptación adicional.
- No hay garantía de soporte para tool calling o agentes, aunque el modelo base podría tener cierta capacidad, no está confirmada.
- Para uso en producción, se recomienda realizar una evaluación exhaustiva propia, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed2
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
