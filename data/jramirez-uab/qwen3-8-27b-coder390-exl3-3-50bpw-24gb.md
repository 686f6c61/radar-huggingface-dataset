# JRamirez-UAB/Qwen3.8-27B-Coder390-EXL3-3.50bpw-24GB

## Resumen

Qwen3.8-27B-Coder390-EXL3-3.50bpw-24GB es una cuantización comunitaria no oficial en formato EXL3 del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, a su vez un fine-tune de Qwen3.8-27B con torre de visión y cabeza MTP (multi-token prediction). La publica el usuario JRamirez-UAB con licencia Apache-2.0 heredada del modelo base. El objetivo declarado es ejecutar un agente local de administración de sistemas Linux (opencode con tool calling), en castellano, sobre una única GPU de 24 GB.

La cuantización aplica 3,50 bits por peso al modelo de lenguaje (3,517 reales), 6 bits al `lm_head`, 6 bits a la torre de visión, 4 bits a la cabeza MTP y embeddings en BF16, con un tamaño de repositorio de 15,0 GB. Según el autor, permite servir 167.936 tokens de contexto con visión y decodificación especulativa MTP sobre 24 GB de VRAM, con una divergencia KL de 0,013-0,020 frente al BF16 original.

Es relevante porque combina tres piezas poco habituales en un checkpoint cuantizado de este tamaño: visión, contexto largo y decodificación especulativa, servidas mediante vLLM con un plugin propio (`qwen38_exl3_vision`) y el plugin OrcaSAQ2 parcheado. No obstante, el propio autor advierte de que solo se ha probado una configuración concreta y que las cifras de 24 GB no se midieron en una tarjeta física de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con torre de visión y cabeza MTP; cuantización EXL3 (exllamav3) |
| Parametros totales | 7.494.374.784 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 167.936 tokens (con visión y MTP 3, según el autor) |
| Tipos de cuantizacion | EXL3 3,50 bpw en el LM (3,517 reales); `lm_head` 6 bits; visión 6 bits; MTP 4 bits; embeddings BF16 |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (2 shards) + `config.json` con `quantization_config: exl3` y `quantization_config.json` por tensor |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.8-27B con torre de visión y cabeza MTP, orientado a tareas de agente, código y administración de sistemas. Esta ficha describe la cuantización EXL3, no el entrenamiento original: no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card solo indica que el checkpoint es una cuantización (`base_model_relation: quantized`) realizada con exllamav3.

La innovación técnica de esta versión es el pipeline de cuantización y servicio: EXL3 con 3,50 bpw sobre el LM, cabezas y torre de visión en precisiones superiores para preservar calidad, y servicio con vLLM mediante batching continuo, el plugin OrcaSAQ2 (commit `7ddffb12` con un parche propio) y el plugin `qwen38_exl3_vision` que elimina los tensores `attn.{q,k,v}_proj` separados y rellena dimensiones de entrada. Incluye decodificación especulativa MTP con 3 tokens y caché KV en fp8 de 6.795.904.942 bytes. El autor reporta una divergencia KL de 0,0198 (traza sysadmin propia), 0,0128 (traza opencode) y 0,0157 (traza pública de turboderp) frente al BF16.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento `xhigh` y respuestas de razonamiento cortas.
- Generación de código y tareas de agente de programación (opencode).
- Tool calling / function calling con el formato de petición real de opencode.
- Agentes multi-paso con ejecución real de comandos en Linux.
- Visión: pipeline `image-text-to-text`, con preprocesador de imagen y de vídeo incluidos en el repo.
- Contexto largo con recuperación de información (needle) hasta 154k tokens según el autor.
- Decodificación especulativa MTP (3 tokens) para acelerar la inferencia.
- Multilingüe limitado a español e inglés.
- Capacidades de administración de sistemas (sysadmin) y uso en terminal.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo puede gestionar tareas de sysadmin con tool calling y ejecución real de comandos, aprovechando sus 167.936 tokens de contexto para mantener el estado de una sesión larga de diagnóstico.
- Asistente de terminal integrado en opencode: el autor valida 57/60 tool calls con la petición real de opencode y 27/30 tareas de agente, por lo que encaja en flujos de edición y ejecución de comandos sobre repositorios.
- Análisis de capturas de pantalla y documentación técnica: la torre de visión en 6 bits permite interpretar imágenes junto a texto en la misma conversación, útil para revisar salidas de terminal o diagramas de infraestructura.
- Recuperación sobre documentación extensa: con needle 8/8 a 64k, 128k y 154k, sirve para consultar manuales, runbooks y logs largos en una sola sesión.
- Despliegue en estación de trabajo con una sola GPU de 24 GB: el formato EXL3 y el servicio con vLLM permiten atender un agente en local sin infraestructura de centro de datos.
- Generación de código en pipelines internos: el soporte de tool calling y el modo de razonamiento permiten integrarlo en flujos de revisión y parcheo, siempre con validación humana por el riesgo de alucinación.
- Asistencia en castellano para equipos de TI: las trazas de calibración incluyen conversaciones reales de sysadmin en español, lo que orienta la cuantización hacia ese dominio.

## Benchmarks y rendimiento

Datos reportados por el autor de la cuantización (2026-10-25), no benchmarks estándar de la comunidad:

| Prueba | Resultado |
|---|---|
| KL divergence vs BF16 (traza sysadmin) | 0,0198 |
| KL divergence vs BF16 (traza opencode) | 0,0128 |
| KL divergence vs BF16 (traza pública turboderp) | 0,0157 |
| Tool calls con petición real de opencode | 57/60 (30/30 en la batería) |
| Tareas de agente opencode | 27/30 (10 tareas × 3 ejecuciones) |
| Visión | 15/15 |
| Razonamiento (`xhigh`) | 47/48, 17.796 tokens de razonamiento, mediana 382 |
| Needle | 8/8 a 64k, 128k y 154k |
| Throughput de decodificación con MTP 3 | 130 / 225 / 461 / 571 tok/s con 1 / 2 / 4 / 8 peticiones (longitud de aceptación 3,01) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: 15,0 GB de pesos (14,0 GiB) más caché KV fp8 de 6.795.904.942 bytes; el autor indica 371 MiB libres en el pico sobre una configuración dimensionada para 24 GB.
- GPU recomendada por el autor: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) para las pruebas; las cifras de 24 GB son estimaciones, no medidas en tarjeta física de 24 GB.
- En 16 GB no cabe: vLLM falla con "No available memory for the cache blocks".
- Despliegue: exclusivamente vLLM 0.31.0 con exllamav3 1.5.1, el plugin OrcaSAQ2 (commit `7ddffb12` con parche) y el plugin `qwen38_exl3_vision`. Un `pip install vllm` genérico, Transformers o SGLang no pueden cargar este checkpoint.
- Throughput: 130 tok/s con 1 petición y 571 tok/s con 8 peticiones usando MTP 3.
- No se indica compatibilidad con llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390-EXL3-3.50bpw-24GB | 7.494.374.784 (según safetensors) | 167.936 | EXL3 / safetensors | Apache-2.0 | Cuantización comunitaria con visión y MTP; solo vLLM con plugins |
| Modelo base nerkyor/Qwen3.8-27B-Coder390-... | no disponible | no disponible | BF16 | Apache-2.0 | Referencia de calidad; el autor no recomienda su draft DFlash2 en este contexto |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | no disponible | no disponible | no disponible | Apache-2.0 | No se han encontrado en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: no es un release del autor del modelo base ni de Qwen; la calidad puede diferir del BF16.
- Solo se ha probado una configuración concreta (vLLM 0.31.0, exllamav3 1.5.1, OrcaSAQ2 parcheado, plugin propio); otras combinaciones pueden no cargar el modelo.
- Las cifras de 24 GB no se midieron en una GPU física de 24 GB, sino dimensionando caché y pico de VRAM en una tarjeta de 96 GB.
- El modelo está orientado a un caso de uso estrecho (sysadmin Linux en español con opencode); el rendimiento en otros dominios o idiomas puede diferir.
- Idiomas limitados a español e inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en ejecución de comandos; se recomienda validación humana en producción.
- No se documentan sesgos conocidos en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse en el `LICENSE` del repositorio.
- El repositorio no incluye el BF16 original, el draft DFlash2, exllamav3, vLLM, OrcaSAQ2 ni las trazas de calibración y evaluación, lo que limita la reproducibilidad completa.
- El número de parámetros de safetensors (7.494.374.784) no coincide con la denominación "27B" del nombre del modelo; conviene verificar la configuración antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/JRamirez-UAB/Qwen3.8-27B-Coder390-EXL3-3.50bpw-24GB
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia citado en tags: arXiv:2406.11235
- Plugin y parches: incluidos en el repositorio (`plugin/qwen38_exl3_vision/`, `patches/orcasaq2-7ddffb12.diff`, `setup.sh`)
