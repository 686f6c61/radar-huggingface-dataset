# liodon-ai/lumi-4b-FP8

## Resumen

lumi-4b-FP8 es una cuantización en FP8 del modelo ceia-br/lumi-4b, publicada por Liodon AI. El modelo base es un transformer de 3.973.556.832 parámetros (aproximadamente 4.000 millones) desarrollado por CEIA-BR, orientado a generación de texto conversacional. Esta versión cuantizada reduce el peso de los pesos de 7,9 GB a 4,8 GB manteniendo el esquema de cuantización dinámica FP8 (E4M3) sobre los pesos y las activaciones.

La relevancia de esta ficha radica en que permite desplegar un modelo de 4B en GPUs con soporte nativo de FP8 (compute capability 8.9 o superior) con una huella de memoria notablemente menor y, potencialmente, mayor throughput que la versión en BF16. La cuantización se realizó con llm-compressor bajo el esquema `FP8_DYNAMIC`, que no requiere dataset de calibración: los pesos se castean directamente a FP8 por canal y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia.

La información pública disponible sobre el modelo base es escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. La licencia es "other", lo que obliga a consultar los términos del modelo original antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `nemotron_h` en HuggingFace; requiere `custom_code`) |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3) dinámica: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base ceia-br/lumi-4b emplea una arquitectura transformer etiquetada como `nemotron_h` en HuggingFace, lo que implica que su carga requiere `trust_remote_code` y el módulo de código personalizado incluido en el repositorio. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de esta versión concreta es la cuantización FP8 con el esquema `FP8_DYNAMIC` de llm-compressor. Los pesos se convierten a FP8 E4M3 por canal de forma anticipada (ahead-of-time), mientras que las activaciones se cuantizan dinámicamente por token durante la inferencia. Al no requerir calibración, los pesos cuantizados son un casteo numérico directo del original, sin sesgo introducido por un conjunto de calibración. La capa `lm_head` se mantiene en precisión original, práctica estándar para evitar degradación desproporcionada en la calidad de salida.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de lenguaje natural de propósito general, condicionado por el modelo base.
- Capacidades multilingües: no disponibles en la información pública.
- Soporte de tool calling / function calling: no disponible en la información pública.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información pública.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información pública.

## Casos de uso

- Despliegue de chat conversacional en producción: el modelo puede servirse con vLLM (`vllm serve liodon-ai/lumi-4b-FP8`) en GPUs Ada/Hopper, aprovechando la reducción de memoria de 7,9 GB a 4,8 GB para alojar más réplicas o contextos más largos por GPU.
- Asistentes integrados en aplicaciones web: al ser un modelo de 4B, cabe en GPUs de consumo de la serie RTX 40 (con soporte FP8 nativo), lo que permite prototipado local y despliegue en estaciones de trabajo sin infraestructura de datacenter.
- Generación de texto en pipelines por lotes: el esquema FP8 dinámico reduce el ancho de banda de memoria en la carga de pesos, lo que puede aumentar el throughput en tareas de generación masiva con TGI o SGLang.
- Fine-tuning posterior sobre la versión cuantizada: útil para adaptar el modelo a dominios concretos manteniendo la huella de memoria reducida (requiere verificar compatibilidad con el código personalizado del modelo base).
- Evaluación comparativa de calidad FP8 vs BF16: la ausencia de calibración en este esquema permite medir directamente el impacto del casteo FP8 sobre las salidas del modelo original.
- Servicio de inferencia en GPUs L4/L40S: estas GPUs, con compute capability 8.9, soportan FP8 nativo y son habituales en despliegues de coste moderado, lo que encaja con un modelo de 4B cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,8 GB solo para pesos en FP8; el consumo total depende de la longitud de contexto y del tamaño de lote (no disponible un dato exacto del modelo base).
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 para ejecución FP8 nativa, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- En GPUs anteriores (A100, RTX 30-series), vLLM y TGI desquantizan para ejecutar, perdiendo el beneficio de velocidad y memoria de FP8.
- Cabe en GPU de consumo: sí, en RTX 40-series con suficiente VRAM (el peso en FP8 es de 4,8 GB, más overhead de activaciones y KV cache).
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/lumi-4b-FP8`), Text Generation Inference (TGI) vía contenedor Docker, SGLang (`python -m sglang.launch_server --model-path liodon-ai/lumi-4b-FP8`) y transformers con `trust_remote_code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/lumi-4b-FP8 | 3.973.556.832 | no disponible | FP8 dinámica | other | HuggingFace |
| ceia-br/lumi-4b (base) | 3.973.556.832 | no disponible | BF16 (original) | other | HuggingFace |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información pública; al ser un modelo entrenado por CEIA-BR, pueden existir sesgos propios del corpus de entrenamiento no documentados.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de 4B, es propenso a generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: no documentadas; la ausencia de información sobre idiomas soportados impide garantizar un rendimiento multilingüe adecuado.
- Restricciones de licencia: la licencia "other" obliga a revisar los términos del modelo base ceia-br/lumi-4b antes de cualquier uso comercial; no se garantiza permiso de uso comercial por defecto.
- La ejecución FP8 requiere hardware con compute capability ≥ 8.9; en GPUs anteriores se pierde el beneficio de memoria y velocidad.
- El modelo requiere `trust_remote_code` por el tag `nemotron_h`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código en entornos de producción.
- El esquema FP8 dinámico no usa calibración, pero puede introducir degradación numérica en capas sensibles; se recomienda evaluar la calidad frente al modelo base en el dominio de uso concreto.
- No se han publicado resultados de benchmarks que permitan comparar la calidad de esta versión con la del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/lumi-4b-FP8
- Modelo base: https://huggingface.co/ceia-br/lumi-4b
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai
