# OpceanAI/Qwen3.5-0.8B-abliterated-diffusion-GGUF

## Resumen

`OpceanAI/Qwen3.5-0.8B-abliterated-diffusion-GGUF` no es un modelo con pesos, sino un repositorio de documentación creado por OpceanAI para explicar por qué el checkpoint de difusión `Qwen3.5-0.8B-abliterated-diffusion` no puede convertirse a formato GGUF. El autor etiqueta explícitamente el repositorio con `not-supported` y advierte de que "no hay nada que descargar aquí": contiene únicamente una model card que detalla las incompatibilidades técnicas entre la arquitectura del modelo original y el runtime de `llama.cpp`.

El modelo de referencia es un diffusion language model enmascarado de 752 millones de parámetros (aproximadamente 0,8B), derivado de la familia Qwen3.5 y sometido a un proceso de "abliteration" (eliminación de rechazos). Su inferencia requiere atención bidireccional sobre la secuencia completa, un doble escaneo (directo y reverso con compuertas) en cada capa DeltaNet, tensores `rev_gate` inyectados en tiempo de carga y un decodificador iterativo de desenmascaramiento paralelo, elementos que el formato GGUF y el motor causal de `llama.cpp` no pueden representar.

La relevancia de este repositorio es doble: por un lado, documenta con rigor técnico los límites actuales de la cadena de herramientas GGUF para modelos híbridos bidireccionales; por otro, redirige a los usuarios hacia el hermano autorregresivo del mismo modelo (`Qwen3.5-0.8B-abliterated-GGUF`), que sí está cuantizado y es compatible con `llama.cpp`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion language model enmascarado con capas DeltaNet híbridas (atención bidireccional + escaneo reverso con compuertas) |
| Parámetros totales | 752M (aproximadamente 0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en este repositorio (el autor indica que no es convertible a GGUF); el modelo autorregresivo hermano ofrece F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS, IQ3_M, IQ3_XXS, IQ2_M, IQ2_XXS, TQ1_0, TQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ninguno en este repositorio (documentación); el checkpoint original se distribuye en safetensors (bf16, ~1,5 GB) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-0.8B-abliterated-diffusion` es un diffusion language model enmascarado. A diferencia de un transformer causal estándar, realiza atención bidireccional sobre la secuencia completa y emplea capas DeltaNet con un escaneo directo más un escaneo reverso con compuertas (`rev_gate`) inyectadas en el forward de cada capa mediante parcheo en Python a través de `dqwen.core.patch_bidirectional`. La predicción está desplazada (el token `j` se predice desde el estado oculto `j-1`) y utiliza un embedding específico `mask_embed` para el token `[MASK]`, con un bucle iterativo de desenmascaramiento paralelo en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El sufijo "abliterated" indica que se ha aplicado una técnica de eliminación de rechazos sobre el modelo original, pero la model card no detalla el procedimiento. La innovación técnica destacable es precisamente la geometría de inferencia híbrida bidireccional, que rompe los supuestos del formato GGUF.

## Capacidades

- Generación de texto mediante desenmascaramiento iterativo paralelo (no autoregresivo).
- Razonamiento y generación condicionada por contexto bidireccional completo, lo que en teoría permite revisar la secuencia entera en cada paso de denoising.
- Capacidad de "abliteration": el modelo ha sido modificado para reducir rechazos, aunque no se documentan detalles del proceso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión ni audio.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de arquitecturas de difusión en producción: el repositorio sirve para que investigadores comprendan qué requisitos impone un diffusion LM bidireccional y por qué la cadena GGUF actual no lo cubre.
- Investigación sobre decodificación no autoregresiva: permite experimentar con desenmascaramiento paralelo usando `dqwen.hub.generate` con parámetros como `gen_len` y `thr` (umbral de confianza).
- Estudio de técnicas de abliteration: útil para analizar cómo se comporta un modelo de 752M parámetros tras eliminar rechazos, aunque sin métricas publicadas.
- Prototipado en GPU única: con ~1,5 GB en bf16, el checkpoint original cabe en GPUs de consumo, lo que facilita experimentos académicos.
- Referencia para el desarrollo de esquemas GGUF híbridos: el repositorio enumera las tres piezas que faltan (esquema de metadatos, tipo de tensor `rev_gate`, sampler de denoising) y sirve como hoja de ruta para contribuir a `llama.cpp`.
- Formación y divulgación: material didáctico sobre las diferencias entre atención causal y bidireccional y sobre los límites de los formatos de serialización de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint original (safetensors, bf16) ocupa aproximadamente 1,5 GB, por lo que cabe en GPUs de consumo con al menos 4 GB de VRAM.
- El autor indica que se necesita una GPU para velocidad práctica; no se especifican modelos concretos.
- No hay opciones de despliegue vía `llama.cpp`, Ollama, vLLM ni TGI para este checkpoint, ya que no existe conversión GGUF válida.
- El despliegue debe hacerse con `transformers`, `accelerate`, `huggingface_hub`, `safetensors` y `flash-linear-attention`, cargando el modelo mediante `dqwen.hub.load_pretrained`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpceanAI/Qwen3.5-0.8B-abliterated-diffusion` | 752M | no disponible | safetensors (bf16) | Apache 2.0 | Hugging Face |
| `OpceanAI/Qwen3.5-0.8B-abliterated-GGUF` (hermano autorregresivo) | ~0,8B | no disponible | GGUF (múltiples cuantizaciones) | Apache 2.0 | Hugging Face |
| `mradermacher/Huihui-Qwen3.5-0.8B-abliterated-GGUF` | ~0,8B | no disponible | GGUF | no disponible | Hugging Face |

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es documentación. No debe tratarse como un modelo descargable.
- El modelo de difusión no es convertible a GGUF con las herramientas actuales; cualquier conversión con `convert_hf_to_gguf.py` produce un artefacto roto que pierde `rev_gate` y `mask_embed` y genera texto degradado.
- No se documentan sesgos conocidos, pero la técnica de abliteration puede incrementar la probabilidad de respuestas dañinas o no filtradas.
- Riesgo de alucinación: no cuantificado; no hay benchmarks publicados.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- El repositorio está etiquetado como `not-supported`, lo que indica que no se ofrece soporte técnico.
- Para producción con `llama.cpp` debe usarse el hermano autorregresivo, no este checkpoint.

## Enlaces

- Repositorio de documentación: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-diffusion-GGUF
- Checkpoint de difusión original: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-diffusion
- Hermano autorregresivo cuantizado: https://huggingface.co/OpceanAI/Qwen3.5-0.8B-abliterated-GGUF
- Cuantización de terceros (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-0.8B-abliterated-GGUF
