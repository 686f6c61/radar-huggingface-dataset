# cherry-blessing23/qwen2.5-7b-manga-translator-full-F16-GGUF

## Resumen

`cherry-blessing23/qwen2.5-7b-manga-translator-full-F16-GGUF` es una conversión a formato GGUF en precisión F16 de un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `NaelShichida/qwen2.5-7b-manga-translator-full`, que a su vez parte de Qwen2.5-7B. El modelo está especializado en traducción de manga, con foco en japonés coloquial (tag `colloquial-japanese`), y se distribuye empaquetado para su uso con `llama.cpp` y ecosistemas GGUF compatibles.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, no de un modelo fundacional. El autor de la conversión es `cherry-blessing23`, mientras que el adaptador original proviene de `NaelShichida`. La model card pública no incluye detalles sobre el dataset de entrenamiento (más allá del identificador `custom/synthgen-manga`), hiperparámetros, licencia ni idiomas formalmente declarados.

Al estar construido sobre Qwen2.5-7B, hereda la arquitectura transformer densa y el contexto largo del modelo base, pero la información disponible no confirma los valores exactos ni las condiciones de uso. Cualquier evaluación en producción debería contrastarse directamente con los artefactos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-7B; no confirmado en la model card) |
| Parametros totales | 7B (según el nombre del modelo; no verificado en la card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (esta conversión); el repositorio base puede contener otras, no confirmado |
| Idiomas soportados | no disponible (tags indican `ja`, `en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (derivado de un adaptador LoRA/QLoRA fusionado) |

## Arquitectura y entrenamiento

El modelo es el resultado de una cadena de derivaciones: Qwen2.5-7B como base, un adaptador LoRA/QLoRA entrenado por `NaelShichida` para traducción de manga (`qwen2.5-7b-manga-translator-full`), y una fusión y conversión a GGUF F16 realizada por `cherry-blessing23`. Los tags del repositorio incluyen `peft`, `qlora` y `gguf-my-lora`, lo que sugiere que la conversión se realizó con la herramienta estándar de Hugging Face para transformar adaptadores LoRA a GGUF.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (`custom/synthgen-manga` es un identificador opaco), la presencia de RLHF/DPO ni innovaciones técnicas específicas. Tampoco se documenta si el adaptador se fusionó con el modelo base antes de la conversión o si se aplicó como delta. La model card pública no aporta detalles adicionales.

## Capacidades

- Traducción de texto de manga, presumiblemente japonés a inglés (según los tags `ja`, `en` y `translation`).
- Manejo de japonés coloquial (tag `colloquial-japanese`), orientado a diálogos informales típicos del medio.
- Generación de texto general heredada de Qwen2.5-7B (no validada específicamente tras el fine-tuning).
- Compatibilidad con `llama.cpp` y entornos GGUF (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no confirmado para esta variante).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües más allá de ja/en: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Traducción de páginas de manga para scanlation: el modelo puede procesar diálogos en japonés coloquial y generar traducciones al inglés, aprovechando el fine-tuning específico sobre el dominio.
- Pre-traducción asistida para editores humanos: integrado en un pipeline previo a la revisión manual, reduce el tiempo de trabajo en series largas con jerga recurrente.
- Localización de diálogos con registro informal: adecuado para personajes que usan japonés coloquial, donde los modelos generalistas suelen producir traducciones demasiado formales.
- Herramienta de escritorio offline: al estar en GGUF F16, puede ejecutarse con `llama.cpp` en estaciones de trabajo sin conexión, útil para equipos que manejan material con derechos de autor.
- Prototipado de pipelines de traducción: sirve como componente base para experimentar con post-procesado, glosarios o control de estilo antes de invertir en modelos mayores.
- Investigación sobre fine-tuning de bajo rango: el repositorio documenta la cadena LoRA/QLoRA → GGUF, útil como referencia para reproducir el flujo con otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 14-16 GB para los pesos (7B × 2 bytes) más overhead de contexto y KV cache; el valor exacto no está confirmado en la card.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para F16 con contexto amplio.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en F16; en GPUs con 12-16 GB requeriría cuantizaciones menores (Q8, Q4), no incluidas en este repositorio.
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python`, Ollama (previa importación), y servidores compatibles con GGUF; TGI y vLLM no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| cherry-blessing23/qwen2.5-7b-manga-translator-full-F16-GGUF | 7B | no disponible | Traducción manga ja→en | no disponible | GGUF F16 |
| NaelShichida/qwen2.5-7b-manga-translator-full | 7B | no disponible | Traducción manga ja→en | no disponible | Adaptador LoRA/PEFT |
| Qwen2.5-7B (base) | 7B | 128K (según documentación oficial de Qwen) | Propósito general | Apache 2.0 (según Qwen) | safetensors, GGUF |
| Modelos de traducción especializados (p. ej. NLLB, Helsinki-NLP) | variable | variable | Traducción multilingüe | variable | safetensors |

La comparación con el modelo base Qwen2.5-7B es la más informativa: esta variante añade especialización en manga a costa de perder la garantía de licencia permisiva del original (la licencia de esta conversión no está declarada). Frente a traductores neuronales clásicos, el enfoque generativo permite control de estilo y contexto, pero carece de benchmarks publicados que lo respalden.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; contactar con el autor o consultar la licencia del modelo base antes de desplegar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de traducción frente a alternativas.
- Dataset de entrenamiento opaco (`custom/synthgen-manga`): no se conoce su tamaño, procedencia ni posibles sesgos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en textos con jerga, onomatopeyas o referencias culturales.
- Idiomas formalmente declarados como "no disponibles": los tags sugieren ja/en, pero no hay confirmación oficial.
- Contexto máximo no documentado: no se debe asumir el contexto de 128K de Qwen2.5-7B sin verificación.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.
- Conversión F16: no cabe en GPUs de consumo con menos de 16 GB sin cuantización adicional.
- Posible pérdida de calidad por la cadena de derivaciones (base → LoRA → fusión → GGUF): no se documenta el proceso exacto.

## Enlaces

- Hugging Face: https://huggingface.co/cherry-blessing23/qwen2.5-7b-manga-translator-full-F16-GGUF
- Modelo base del adaptador: https://huggingface.co/NaelShichida/qwen2.5-7b-manga-translator-full
- Modelo fundacional Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Herramienta gguf-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
