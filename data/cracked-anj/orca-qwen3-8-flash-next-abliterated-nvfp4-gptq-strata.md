# Cracked-ANJ/Orca-Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata

## Resumen

Orca-Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata es un modelo derivado de Qwen3.8-Flash-Next, publicado por el usuario Cracked-ANJ en Hugging Face. Se trata de una variante "abliterated" (es decir, con las capas de rechazo/alineamiento suprimidas mediante edición de pesos) del modelo base de Qwen, cuantizada en NVFP4 y GPTQ bajo el formato Strata, y distribuida además con artefactos GGUF. El pipeline declarado es image-text-to-text, lo que indica que conserva la capacidad vision-language del modelo original.

El modelo base Qwen3.8-Flash-Next es una arquitectura MoE (mixture of experts) con alrededor de 125.700 millones de parámetros totales, según los pesos safetensors del repositorio. La ficha incluye el tag "mtp", que sugiere soporte de multi-token prediction, y "moe" confirma la arquitectura de expertos. El modelo está orientado a conversación, generación de texto y procesamiento de imagen-texto, con soporte declarado de inglés y chino.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo Qwen reciente (con implicaciones éticas y de licencia importantes); por otro, muestra un pipeline de cuantización agresiva (NVFP4 + GPTQ + Strata) pensado para reducir el coste de despliegue de un modelo de 125B. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer, vision-language; tag "mtp" (multi-token prediction) |
| Parametros totales | 125.743.801.216 (~125,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, GPTQ (Strata); artefactos GGUF disponibles |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-license-1.0 (tag "license:other") |
| Formato de pesos | safetensors (repo de 198,5 GB), GGUF, NVFP4/GPTQ-Strata |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated) |
| Descargas / likes | 13 / 2 |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-Flash-Next, una arquitectura de mezcla de expertos (MoE) con capacidades multimodales (image-text-to-text) y, según los tags, soporte de multi-token prediction (MTP). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original, por lo que esos datos deben considerarse no disponibles en esta ficha.

La innovación principal de esta variante concreta no está en el entrenamiento, sino en la modificación y compresión de pesos: se trata de una versión "abliterated", es decir, con los comportamientos de rechazo suprimidos mediante técnicas de edición de direcciones en el espacio de activaciones o pesos, y posteriormente cuantizada en NVFP4 con GPTQ bajo el esquema Strata, además de ofrecerse en GGUF. El repositorio deriva de una cadena de modelos intermedios (orcarouter/Qwen3.8-Flash-Next-Uncensored y jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4), lo que indica múltiples pasos de fine-tuning y cuantización acumulados.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imagen y texto (image-text-to-text): descripción de imágenes, VQA y tareas multimodales.
- Razonamiento y generación de código (capacidades heredadas del modelo base Qwen, aunque no verificadas en esta variante).
- Comportamiento "uncensored"/abliterated: menor tendencia a rechazar peticiones, con los riesgos asociados.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Multi-token prediction (MTP) según el tag del repositorio.
- Capacidades multilingües limitadas a en y zh según los tags.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la "abliteración" comparando respuestas con el modelo base original en tareas sensibles, en un entorno controlado y con revisión ética.
- Evaluación de cuantización extrema: sirve para medir la degradación de calidad de NVFP4/GPTQ-Strata frente a los pesos originales en tareas de razonamiento y visión, útil para decidir qué esquema de compresión usar en producción.
- Despliegue multimodal de bajo coste: al ofrecer GGUF y NVFP4, puede ejecutarse en infraestructura más modesta que el modelo de 125B en FP16, para prototipos de VQA o captioning de imágenes.
- Generación de descripciones de imágenes en pipelines de catalogación: el pipeline image-text-to-text permite etiquetar automáticamente imágenes en inglés o chino.
- Experimentación con MoE y MTP: investigadores pueden analizar el comportamiento de la predicción multi-token y el enrutado de expertos en un modelo abliterated.
- Chat conversacional sin filtros para investigación creativa: en entornos donde se requiere explorar respuestas no restringidas (siempre con supervisión y cumplimiento legal).
- Benchmarking de robustez: comparar la tasa de rechazo y la calidad factual entre la variante abliterated y el Qwen3.8-Flash-Next original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 125,7B parámetros, en FP16 se necesitarían ~250 GB; en NVFP4 (~4 bits) el peso ronda los 60-70 GB, más overhead de activaciones y KV cache; los GGUF permiten bajar a rangos de 40-70 GB según cuantización.
- GPU recomendadas: para FP16, múltiples A100/H100 de 80 GB; para NVFP4, una o dos H100 80 GB o A100 80 GB; los GGUF Q4 pueden caber en configuraciones multi-GPU consumer.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) en ninguna cuantización razonable; requeriría múltiples GPUs o CPU+RAM con llama.cpp.
- Opciones de despliegue: llama.cpp / Ollama para GGUF; vLLM o TGI para safetensors/NVFP4 (compatibilidad NVFP4 depende de la versión); GPTQ requiere kernels específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Acceso |
|---|---|---|---|---|---|
| Orca-Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata | ~125,7B (MoE) | no disponible | qwen-community-license-1.0 | Sí (image-text-to-text) | Gated |
| Qwen/Qwen3.8-Flash-Next (base) | ~125,7B (MoE) | no disponible | qwen-community-license-1.0 | Sí | Público/gated según repo |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | no disponible |
| jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo "abliterated": la supresión de rechazos aumenta el riesgo de generar contenido dañino, ilegal o sesgado; no apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación, agravado por la cuantización NVFP4/GPTQ y por la cadena de fine-tunings intermedios.
- Idiomas limitados a inglés y chino según los tags; el rendimiento en castellano no está garantizado.
- Licencia qwen-community-license-1.0: revisar condiciones de uso comercial, atribución y restricciones antes de desplegar en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es un modelo de descarga libre.
- Procedencia y reproducibilidad limitadas: autor individual, pocas descargas (13) y sin benchmarks publicados; no hay garantía de calidad frente al modelo base.
- Tamaño del repo (198,5 GB) y requisitos de VRAM elevados: inviable en hardware consumer de una sola GPU.
- Posible degradación multimodal por la cuantización: no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/Cracked-ANJ/Orca-Qwen3.8-Flash-Next-Abliterated-NVFP4-GPTQ-Strata
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo intermedio: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo intermedio cuantizado: https://huggingface.co/jpezzulli/OrcaRouter-Qwen3.8-Flash-Next-Uncensored-ModelOpt-NVFP4
