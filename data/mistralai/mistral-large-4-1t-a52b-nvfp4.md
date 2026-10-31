# mistralai/Mistral-Large-4-1T-A52B-NVFP4

## Resumen

Mistral Large 4 NVFP4 es el checkpoint cuantizado en formato NVFP4 de Mistral Large 4 (conocido internamente como "Le Chonk"), el modelo más grande y capaz desarrollado hasta la fecha por Mistral AI. Se trata de un modelo multimodal nativo de tipo Mixture-of-Experts (MoE) con 1 billón (1T) de parámetros totales y 49 mil millones de parámetros activos por token (52 mil millones incluyendo embeddings y capas de salida), entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa.

La versión NVFP4 cuantiza los expertos MoE en formato NVFP4 y mantiene las capas lineales en FP8, lo que reduce sustancialmente la huella de memoria respecto al checkpoint FP8 y acelera la inferencia, sin regresiones de precisión observables según las evaluaciones publicadas. El formato NVFP4 está diseñado específicamente para GPU Blackwell (B200, B300, GB200 y GB300), que disponen de hardware dedicado para este formato.

El modelo conserva todas las capacidades del original: ventana de contexto de 1M tokens, entrada multimodal (texto e imagen con salida de texto), esfuerzo de razonamiento configurable por petición (`low`, `medium`, `high`), function calling nativo, salida JSON estricta por esquema y un cabezal de borrador DSpark para decodificación especulativa integrado en el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal nativo |
| Parametros totales | 1T (1 billon) |
| Parametros activos | 49B por token (52B incluyendo embeddings y capas de salida) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | NVFP4 (expertos MoE) + FP8 (capas lineales); KV cache FP8 (fp8_ds_mla) |
| Idiomas soportados | 38 idiomas: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl |
| Licencia | Mistral Ecosystem Open-Weight License (licencia "other", MIT modificada) |
| Formato de pesos | Checkpoint NVFP4 (safetensors); GGUF disponible via ggml-org |

## Arquitectura y entrenamiento

El modelo base, Mistral Large 4 - Le Chonk, es un transformer de tipo Mixture-of-Experts con 1 billon de parametros totales y 49 mil millones activos por token, lo que permite combinar la capacidad de un modelo de gran escala con la eficiencia de inferencia de un modelo mucho menor. Es multimodal nativo: acepta texto e imagen como entrada y genera texto. El checkpoint NVFP4 cuantiza los expertos MoE al formato NVFP4 (formato de 4 bits optimizado para NVIDIA Blackwell) mientras mantiene las capas lineales en FP8, y emplea una KV cache en FP8 para las capas MLA (`fp8_ds_mla`).

Fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset. Incorpora un cabezal de borrador DSpark para decodificacion especulativa (profundidad de bloque de borrador de 3 tokens), integrado directamente en el checkpoint.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable por peticion (`low`, `medium`, `high`; por defecto `high`)
- Entrada multimodal: texto e imagen, con salida de texto
- Ventana de contexto de 1M tokens
- Function calling nativo con parser de tool calls `mistral`
- Salida JSON estricta conforme a esquema
- Decodificacion especulativa mediante cabezal DSpark integrado
- Uso agéntico multi-paso (evaluado en DeepSWE, SWE-bench Pro, Terminal-Bench 4, AutomationBench)
- Razonamiento multimodal (evaluado en GDP.pdf y MathVision)
- Contexto largo (evaluado en Graphwalks 512k)
- Automatizacion de negocio (AutomationBench) y tareas de ciberseguridad (CyberGym)
- Soporte multilingue amplio (38 idiomas, incluido el castellano)

## Casos de uso

- **Atencion al cliente automatizada**: con 1M tokens de contexto y razonamiento ajustable, puede gestionar conversaciones multi-turno muy largas con historial completo, documentos adjuntos y llamadas a herramientas internas.
- **Agentes de codigo y desarrollo**: evaluado en SWE-bench Pro, DeepSWE y Terminal-Bench 4; puede integrarse en pipelines de CI/CD y agentes que operan sobre terminales y repositorios, con function calling nativo y salida JSON estricta.
- **Automatizacion de procesos de negocio**: el benchmark AutomationBench indica un enfoque deliberado en flujos de trabajo empresariales repetitivos (extraccion, clasificacion, orquestacion de tareas).
- **Analisis de documentos extensos**: la ventana de 1M tokens permite procesar corpora completos, contratos o bases de codigo enteros en una sola peticion; Graphwalks 512k valida el rendimiento en contexto largo.
- **Comprension multimodal de documentos con graficos e imagenes**: entrada de imagen nativa, evaluada en GDP.pdf y MathVision, util para procesar PDFs, capturas y material visual con razonamiento asociado.
- **Asistentes de chat multilingues**: soporte de 38 idiomas con esfuerzo de razonamiento `low` para respuestas rapidas en produccion.
- **Ciberseguridad**: evaluado en CyberGym, aplicable a analisis de vulnerabilidades y tareas de seguridad ofensiva/defensiva asistida.
- **Despliegue soberano en infraestructura propia**: pesos abiertos bajo licencia MIT modificada, adecuado para organizaciones europeas que requieren control total del modelo.

## Benchmarks y rendimiento

La model card indica que el checkpoint NVFP4 iguala el comportamiento del checkpoint FP8 en todos los dominios evaluados: razonamiento multimodal (GDP.pdf, MathVision), contexto largo (Graphwalks 512k), agentes de codigo (DeepSWE, SWE-bench Pro, Terminal-Bench 4), automatizacion de negocio (AutomationBench) y ciberseguridad (CyberGym). Los resultados se presentan en una imagen comparativa en la model card, sin valores numericos en texto, por lo que no es posible reproducir cifras exactas:

| Benchmark | Resultado |
|---|---|
| GDP.pdf | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| MathVision | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| Graphwalks 512k | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| DeepSWE | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| SWE-bench Pro | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| Terminal-Bench 4 | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| AutomationBench | Iguala al checkpoint FP8 (cifras no disponibles en texto) |
| CyberGym | Iguala al checkpoint FP8 (cifras no disponibles en texto) |

## Requisitos de hardware

- **Formato objetivo**: GPU NVIDIA Blackwell con soporte nativo NVFP4: B200, B300, GB200 y GB300. No es el checkpoint adecuado para arquitecturas anteriores (Ampere/Hopper).
- **VRAM estimada**: el repositorio ocupa 610,1 GB; se necesita al menos esa capacidad agregada de VRAM (o VRAM mas RAM/NVMe con offloading) para alojar el checkpoint completo. La configuracion de referencia de vLLM usa `--tensor-parallel-size 8`, lo que sugiere un nodo multi-GPU.
- **Configuracion de referencia**: 8 GPU con tensor parallelism, `--kv-cache-dtype fp8_ds_mla` y `--gpu-memory-utilization 0.85`. Si falta memoria, reducir `--max-model-len` y/o `--max-num-seqs`.
- **Consumer GPU**: no viable; el tamano del checkpoint (610,1 GB) excede con mucho la VRAM de cualquier GPU de consumo.
- **Despliegue**: vLLM (imagen oficial `vllm/vllm-openai:mistral-large-4`), SGLang y llama.cpp (GGUFs publicados en `ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF`).
- **Latencia y throughput**: no disponibles en cifras concretas; la decodificacion especulativa DSpark (`num_speculative_tokens: 3`) acelera la inferencia, con mediciones en la pagina del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 NVFP4 (este) | 1T total / 49B activos | 1M | Texto + imagen | Mistral Ecosystem Open-Weight License (MIT modificada) | Pesos abiertos en HuggingFace |
| Mistral Large 4 FP8 (base) | 1T total / 49B activos | 1M | Texto + imagen | Mistral Ecosystem Open-Weight License | Pesos abiertos en HuggingFace |
| Modelos frontera abiertos comparables (DeepSeek-V3, Qwen3 grandes) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparativa detallada con otros modelos frontera no esta disponible en la informacion proporcionada; la unica referencia directa publicada es la comparacion interna NVFP4 frente a FP8 del propio modelo.

## Limitaciones y advertencias

- **Hardware requerido**: el formato NVFP4 requiere GPU Blackwell (B200/B300/GB200/GB300); no funciona de forma eficiente en arquitecturas NVIDIA anteriores.
- **Escala de despliegue**: con 610,1 GB de checkpoint, el despliegue local exige un nodo multi-GPU de gama alta; Mistral recomienda usar su API si el serving local es deficiente.
- **Licencia**: la Mistral Ecosystem Open-Weight License permite uso comercial y no comercial, pero operar un negocio de Model-as-a-Service con el modelo requiere una licencia comercial separada con Mistral.
- **Razonamiento por defecto**: el esfuerzo de razonamiento por defecto es `high`, lo que aumenta la latencia y el consumo de tokens; ajustarlo a `low` para chat rapido.
- **Configuracion obligatoria en vLLM**: el parser de tool calls y de razonamiento `mistral` y la KV cache `fp8_ds_mla` son necesarios; una configuracion incorrecta degrada o rompe el funcionamiento.
- **Datos de entrenamiento**: la model card no detalla composicion del dataset ni numero de tokens, por lo que no es posible evaluar sesgos especificos documentados; como todo LLM de gran escala, cabe esperar riesgo de alucinacion y sesgos heredados de los datos.
- **Idiomas**: el castellano esta soportado oficialmente, pero no se publican evaluaciones de calidad por idioma.

## Enlaces

- Checkpoint NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Modelo base (Mistral Large 4 - Le Chonk): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4/blob/main/LICENSE
- GGUF (llama.cpp): https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF
- Receta de vLLM: https://recipes.vllm.ai/mistralai/Mistral-Large-4-1T-A52B
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Web de Mistral AI: https://mistral.ai/
- Chat de Mistral: https://chat.mistral.ai/
