# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400

## Resumen

Este repositorio contiene un checkpoint cuantizado en NVFP4 (W4A16) del modelo `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored`, un tune de la familia Qwen3.8 de 27B con ajuste "Heretic/uncensored" y el refinamiento Turbo Brilliance 50x AGI-NEO. El autor del checkpoint cuantizado es `esatapedico`, que no entrena el modelo sino que produce conversiones de pesos optimizadas para servir en vLLM sobre GPUs Blackwell (sm_120).

La relevancia técnica está en el formato: se trata de un checkpoint `compressed-tensors` con formato `nvfp4-pack-quantized`, es decir, pesos en 4 bits con escalas FP8 E4M3 y tamaño de grupo 16, en modo weight-only (activaciones en 16 bits). Se empaquetan 400 tensores NVFP4 que cubren el MLP de las 64 capas, las proyecciones Q/K/V/O de las 16 capas de atención completa y las proyecciones `in_proj_qkv/z/out_proj` del DeltaNet en las 48 capas de atención lineal. La cabeza de salida, el tower de visión, la cabeza MTP y las dinámicas del Gated DeltaNet se mantienen en BF16.

El modelo base es un transformer híbrido denso de 27B parámetros (27.781.427.952 según safetensors) con atención completa combinada con capas Gated DeltaNet, torre de visión y cabeza MTP para decodificación especulativa. El repo pesa 20,6 GB en un único shard y está pensado para servir con vLLM, con soporte indirecto para llama.cpp vía conversión a GGUF con tensores NVFP4 nativos (GGML type 40).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet), con torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, escalas FP8 E4M3, grupo 16, weight-only); resto en BF16 |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`compressed-tensors`, `nvfp4-pack-quantized`); GGUF vía conversión |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 27B parámetros densos que combina 16 capas de atención completa con 48 capas de atención lineal basadas en Gated DeltaNet. Esta mezcla reduce el coste de atención en secuencias largas manteniendo calidad en recuperación de contexto. Incluye además una torre de visión (pipeline `image-text-to-text`), lo que lo habilita para tareas multimodales, y una cabeza MTP (multi-token prediction) de 15 tensores que actúa como borrador para decodificación especulativa.

El proceso de cuantización de este checkpoint es datafree (sin corpus de calibración) y weight-only: se cuantizan 400 tensores `Linear` (192 del MLP en 64 capas, 64 de Q/K/V/O en las 16 capas de atención completa y 144 del DeltaNet en las 48 capas lineales). Quedan en BF16 el `lm_head`, el tower de visión, la cabeza MTP, las `conv1d` y `in_proj_a`/`in_proj_b` del Gated DeltaNet, las normas y las escalas. El `lm_head` se deja sin cuantizar deliberadamente porque vLLM ejecuta la cabeza de salida en precisión completa y ninguna versión de vLLM carga cabezas NVFP4 en `compressed-tensors`. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con torre de visión intacta en BF16.
- Decodificación especulativa mediante cabeza MTP, pensada para acelerar la generación en vLLM.
- Soporte multilingüe declarado (etiqueta `multilingual`, aunque la model card solo lista `en` y `multilingual`).
- Integración con vLLM mediante `compressed-tensors` (detección automática desde `config.json`).
- Conversión a GGUF para llama.cpp con soporte NVFP4 (GGML type 40).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en GPUs Blackwell: el checkpoint está diseñado para vLLM sobre sm_120, con lo que se reduce el peso en VRAM a ~20,6 GB frente a los ~55 GB que ocuparía en BF16, permitiendo servir un 27B en una sola GPU de 24-32 GB.
- Despliegue multimodal en producción: al conservar la torre de visión en BF16, se puede usar para tareas de image-text-to-text (descripción de imágenes, VQA, extracción de información de documentos escaneados) sin perder precisión en la parte visual.
- Generación de texto a baja latencia: la cabeza MTP habilita decodificación especulativa en vLLM, útil en asistentes conversacionales donde el tiempo hasta el primer token y el throughput importan.
- Chat conversacional multi-turno: el modelo base es de tipo conversacional con plantilla de chat incluida (`chat_template.jinja` de 248 KB), adecuado para asistentes con historial largo.
- Investigación sobre cuantización NVFP4: sirve como referencia para estudiar el impacto de W4A16 con grupo 16 y escalas FP8 E4M3 en modelos híbridos con DeltaNet, comparándolo con el checkpoint gemelo de 256 tensores.
- Pipelines de conversión a GGUF: el checkpoint se declara como fuente de cuantización para builds GGUF, por lo que encaja en flujos que necesitan servir el mismo modelo en llama.cpp y en vLLM.
- Evaluación de modelos "uncensored" en entornos controlados: el tune Heretic elimina restricciones de rechazo, útil para investigación de alineamiento y análisis de sesgos, siempre con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20,6 GB solo de pesos; con overhead de KV cache y activaciones, se recomienda al menos 24 GB para contextos cortos y 32-48 GB para contextos largos.
- GPU recomendadas: Blackwell (sm_120) para NVFP4 nativo, es decir, RTX 50xx (5090, 5080), B200 y RTX PRO Blackwell. No se garantiza soporte en arquitecturas anteriores (Ampere, Hopper) porque NVFP4 requiere kernels específicos.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB) y potencialmente en RTX 5080 (16 GB) solo con contexto muy reducido, dado que los pesos ya ocupan 20,6 GB.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (autodetectado); llama.cpp reciente con soporte NVFP4 (GGML type 40) previa conversión con `convert_hf_to_gguf.py --outtype auto`. Ollama y TGI no están mencionados en la información disponible.
- Latencia y throughput: no disponible. La cabeza MTP está pensada para decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4-T400) | 27,78B | no disponible | NVFP4 W4A16, 400 tensores | apache-2.0 | Solo vLLM/llama.cpp con NVFP4; requiere Blackwell |
| esatapedico/...-NVFP4 (256 tensores) | 27,78B | no disponible | NVFP4 W4A16, 256 tensores | apache-2.0 | Receta conservadora, mismo modelo base |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27B | no disponible | GGUF (varias) | apache-2.0 (heredada) | Versión GGUF del mismo tune, sin NVFP4 |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B | no disponible | BF16 | apache-2.0 | Modelo base sin cuantizar |

## Limitaciones y advertencias

- El checkpoint solo es cargable por versiones de vLLM con soporte `compressed-tensors` NVFP4 y por llama.cpp con GGML type 40; otras herramientas (Ollama, TGI, transformers estándar) pueden no cargarlo.
- Requiere GPU Blackwell (sm_120); en Ampere o Hopper no hay kernels NVFP4 y el modelo no se podrá servir con esta cuantización.
- El modelo base es un tune "Heretic/uncensored": se eliminan los rechazos de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito. No apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks; al ser un tune sobre un modelo base no verificado, el riesgo es mayor que en el modelo original de Qwen.
- La cuantización es datafree y weight-only: no hay calibración, por lo que la degradación respecto a BF16 no está medida ni documentada.
- El `lm_head` y la cabeza MTP se mantienen en BF16, lo que añade unos GB al peso total y limita la reducción de VRAM respecto a otras recetas.
- La licencia apache-2.0 se hereda del modelo base, pero el uso comercial de un modelo "uncensored" puede incumplir términos de servicio de plataformas o legislación local; conviene revisar el marco legal aplicable.
- Idiomas: aunque se declara `multilingual`, la model card solo enumera `en` y `multilingual`; el rendimiento en castellano no está documentado.
- Longitud de contexto: no disponible en la información proporcionada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Checkpoint gemelo de 256 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Versión GGUF del tune: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Otro checkpoint del mismo autor: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Sitio del autor: https://www.esatapedico.com
