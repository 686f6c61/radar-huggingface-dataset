# iapp/openthai2.0-qwen3.8-27b-GGUF

## Resumen

OpenThai 2.0 es un modelo de lenguaje multimodal (visión y texto) de 27 000 millones de parámetros, desarrollado por iApp Technology en colaboración con AIEAT, y publicado bajo licencia Apache 2.0. Está diseñado específicamente para el tailandés: lee documentos e imágenes con escritura manuscrita a nivel de especialista, responde preguntas de conocimiento tailandés en lenguaje natural y mantiene la inteligencia general de su modelo base, Qwen3.8-27B. Esta versión GGUF, publicada por iapp, ofrece cuantizaciones listas para llama.cpp e incluye tanto la cabeza MTP (multi-token prediction) como el proyector de visión, lo que permite ejecutar el modelo en hardware de consumo con una aceleración notable de la decodificación.

El modelo destaca por su capacidad agéntica: según la documentación oficial, supera a su modelo base y a Typhoon 2.5 en el benchmark BFCL de tool calling. También presenta un rendimiento sobresaliente en OCR de tailandés, con una tasa de error de caracteres (CER) de 0,261 en escritura manual frente a 0,649 de su base. La versión GGUF aquí descrita es una cuantización del modelo original en bf16, con opciones que van desde 2 bits hasta 8 bits, e incluye un archivo de calibración imatrix para re-cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + texto) basado en Qwen3.8-27B, con cabeza MTP y proyector de visión |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens (recomendado por el autor) |
| Tipos de cuantizacion | Q4_K_M (~17 GB), IQ2_M (~9,8 GB), Q2_K (~11 GB), Q8_0 (~29 GB), mmproj F16 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors disponibles en el repo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning multimodal de Qwen3.8-27B, un transformer denso de 27B parámetros. La versión GGUF incluye dos componentes adicionales: la cabeza MTP (exportada como capas `nextn`), que permite decodificación especulativa y acelera la generación entre un 33 % y un 145 % en GPUs de consumo según el repositorio comunitario, y un proyector de visión (`mmproj`) que habilita la entrada de imágenes y documentos. El entrenamiento se centró en datos tailandeses de conocimiento, documentos y agentes, aunque no se han publicado detalles sobre el número de tokens, la composición exacta del dataset o el uso de RLHF/DPO. El autor indica que el modelo razona antes de responder, lo que sugiere un entrenamiento con cadena de pensamiento o similar.

## Capacidades

- Generación de texto en tailandés e inglés con razonamiento previo a la respuesta.
- OCR de documentos tailandeses y lectura de escritura manual a nivel de especialista (CER 0,261 en tailandés manuscrito).
- Conocimiento enciclopédico y cultural tailandés, evaluado con OpenThaiEval (0,842).
- Tool calling y uso agéntico de herramientas, líder en BFCL frente a su modelo base y Typhoon 2.5.
- Procesamiento de imágenes y documentos mediante el proyector de visión.
- Soporte de contexto largo (32k tokens) para conversaciones multi-turno y documentos extensos.
- Capacidad multilingüe limitada a tailandés e inglés.

## Casos de uso

- Atención al cliente automatizada en tailandés: el modelo gestiona conversaciones multi-turno con contexto de 32k tokens, manteniendo el hilo de la conversación y respondiendo con lenguaje natural y explicativo.
- Digitalización de documentos administrativos tailandeses: su OCR especializado extrae texto de formularios, contratos y escritura manual con una tasa de error muy inferior a la de su modelo base, lo que lo hace apto para flujos de trabajo de back-office.
- Asistente de conocimiento local: responde preguntas sobre cultura, historia, legislación y procedimientos tailandeses con precisión, útil para portales gubernamentales o educativos.
- Agente autónomo con tool calling: puede integrarse en sistemas que requieren consultar APIs, bases de datos o servicios externos, ejecutando múltiples pasos de razonamiento y llamadas a herramientas.
- Extracción de información de imágenes: combinando visión y texto, puede leer capturas de pantalla, fotografías de documentos o facturas y estructurar los datos extraídos.
- Generación de contenido bilingüe: redacción de textos en tailandés e inglés para marketing, informes o documentación técnica, manteniendo coherencia y tono.

## Benchmarks y rendimiento

Los datos disponibles provienen de la documentación oficial de iApp y no incluyen benchmarks estándar como MMLU, HumanEval o GSM8K. Se presentan los resultados publicados:

| Benchmark | OpenThai 2.0 | Modelo base (Qwen3.8-27B) |
|---|---|---|
| CER en escritura manual tailandesa | 0,261 | 0,649 |
| OpenThaiEval (conocimiento tailandés) | 0,842 | no disponible |
| BFCL (tool calling) | superior al base y a Typhoon 2.5 | no disponible |

No se han publicado resultados de benchmarks estándar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere ~17 GB, IQ2_M ~9,8 GB, Q2_K ~11 GB y Q8_0 ~29 GB, más overhead de contexto y visión.
- GPU recomendadas: para Q4_K_M e IQ2_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se necesitan GPUs de 32 GB o más, como A100 o H100.
- En consumer GPU: sí, las cuantizaciones Q4_K_M e IQ2_M caben en tarjetas de 24 GB, y el MTP head acelera la decodificación en estas tarjetas.
- Opciones de despliegue: llama.cpp / llama-server (recomendado por el autor), compatible con servidores de inferencia que acepten GGUF; también puede usarse con vLLM si se convierte a safetensors.
- Latencia y throughput: no se han publicado cifras exactas, pero el MTP head proporciona una aceleración de decodificación de +33 % a +145 % en GPUs de consumo según el repositorio comunitario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| OpenThai 2.0 (este) | 27B | 32k | Apache 2.0 | Tailandés + visión + agentes |
| Qwen3.8-27B (base) | 27B | 32k | Apache 2.0 | General, sin visión |
| Typhoon 2.5 | no disponible | no disponible | no disponible | Tailandés, sin visión |

Según la documentación oficial, OpenThai 2.0 supera a su base y a Typhoon 2.5 en BFCL (tool calling) y en OCR de tailandés, manteniendo la inteligencia general del base. No se dispone de más datos comparativos.

## Limitaciones y advertencias

- El modelo razona antes de responder: si se usa un contexto pequeño o se limita `max_tokens` por debajo de 8192, las respuestas pueden llegar vacías. Se recomienda contexto de 32k y `max_tokens` sin límite o ≥ 8192.
- La cuantización Q2_K presenta deslices factuales observados; el autor recomienda usar IQ2_M en su lugar, que está calibrada con imatrix y pasa comprobaciones de factualidad.
- El modelo está especializado en tailandés e inglés; su rendimiento en otros idiomas no está garantizado.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.), por lo que la comparación con otros modelos en tareas generales es limitada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede reflejar sesgos presentes en los datos de entrenamiento tailandeses; se recomienda validación en dominios sensibles.
- El repositorio GGUF no incluye el modelo en bf16; para fine-tuning o uso con otras herramientas, es necesario acudir al repo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-GGUF
- Modelo base (bf16): https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Página oficial de OpenThai 2.0: https://iapp.co.th/openmodels/openthai2p0
- Documentación técnica: https://iapp.co.th/docs/llm/openthai2p0
- Repositorio sobre MTP head: https://github.com/sudoingX/qwen38-mtp
