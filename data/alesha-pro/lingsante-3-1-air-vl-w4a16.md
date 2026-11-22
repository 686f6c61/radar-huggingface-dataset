# alesha-pro/LingSante-3.1-air-VL-W4A16

## Resumen

LingSante-3.1-air-VL-W4A16 es una cuantización INT4 del modelo multimodal `inclusionAI/LingSante-3.1-air-VL`, publicada por el usuario `alesha-pro` (autor de la cuantización, `@superalesha`). Se trata de un modelo de mezcla de expertos (MoE) orientado al ámbito médico y sanitario, con capacidades de visión, razonamiento y tool calling. El checkpoint original en BF16 ocupa 232,55 GiB y requiere GPUs de centro de datos de 80-141 GB; esta versión lo reduce a 70,85 GiB y lo hace ejecutable íntegramente en VRAM sobre 4× RTX 3090 (96 GB) con `TP=4`.

La estrategia de cuantización es selectiva: solo se cuantizan los expertos enrutados del MoE (el 96,75 % de los parámetros) a INT4 simétrico con `group_size=32` y recorte MSE por grupo, mientras que el codificador visual, el proyector, las capas de atención (KDA lineal y Gated MLA), los routers, los expertos compartidos, los embeddings y el `lm_head` permanecen en BF16/F32 sin tocar. Esto preserva la fidelidad en los subsistemas sensibles (OCR visual, puertas de decaimiento KDA, atención MLA y enrutamiento).

El modelo conserva la ventana de contexto completa de 262.144 tokens (256K) mediante YaRN 2×, con una caché KV BF16 sin pérdidas de hasta 286.593 tokens gracias a que 35 de las 42 capas usan atención lineal KDA de memoria constante. La licencia es MIT y el formato de pesos es `compressed-tensors` (pack-quantized), compatible con SGLang y vLLM mediante kernels Marlin W4A16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (BailingMoeV3VLForConditionalGeneration): 35 capas KDA linear attention + 7 capas Gated MLA, 512 expertos enrutados, vision encoder `qwen3_moe_vit` |
| Parametros totales | 124,85B |
| Parametros activos | 5,5B por token |
| Longitud de contexto | 262.144 tokens (256K, via YaRN 2×) |
| Tipos de cuantizacion | INT4 W4A16 simétrico, `group_size=32`, recorte MSE por grupo (solo expertos enrutados); resto en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `compressed-tensors` pack-quantized (`weight_packed` int32, `weight_scale` bfloat16, `weight_shape` int64); compatible con transformers, SGLang y vLLM |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con 42 capas: 35 capas de atención lineal KDA (memoria constante) y 7 capas de Gated MLA con latente comprimido de 576 dimensiones. El MoE cuenta con 512 expertos enrutados y 40 expertos compartidos más 40 routers; el `moe_intermediate_size` es de 768. El codificador visual es `qwen3_moe_vit` con proyector multimodal. El reparto de parámetros es muy asimétrico: los expertos enrutados concentran 120,80B parámetros (96,75 %), mientras que el resto de subsistemas suman apenas 7,55 GiB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica explícitamente que el checkpoint upstream no incluye capas MTP/NextN, por lo que no debe activarse decodificación especulativa NEXTN. La cuantización emplea el mismo layout `pack-quantized` que el `Ling-3.0-flash-VL-int4` oficial de Ant Group, con escalas optimizadas por grupo para minimizar el error L2 de reconstrucción (aproximadamente un 9 % menos de RMSE de pesos que el min-max ingenuo). La elección de `group_size=32` responde a que `moe_intermediate_size=768` dividido entre `TP=4` da 192, valor divisible por 32 pero no por 128, lo que permite compatibilidad nativa con Marlin W4A16 en Ampere, Ada, Hopper y Blackwell.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (`--reasoning-parser ling3`), desactivable mediante `enable_thinking=False`.
- Comprensión de imágenes y OCR nativo mediante el codificador visual `qwen3_moe_vit`.
- Tool calling / function calling (`--tool-call-parser ling3`).
- Razonamiento multi-paso y uso en pipelines de agentes.
- Contexto largo de hasta 262.144 tokens con caché KV BF16 sin pérdidas.
- Especialización declarada en dominio médico y sanitario (tags `medical`, `healthcare`).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia clínica documental: el modelo puede procesar informes médicos escaneados e imágenes diagnósticas junto con texto largo gracias al OCR visual y a la ventana de 256K tokens, resumiendo historiales completos en una sola pasada.
- Triage de imágenes médicas con contexto: combinación de visión y razonamiento multi-paso para clasificar y priorizar casos a partir de imágenes y notas clínicas asociadas.
- Extracción estructurada de datos sanitarios: uso de tool calling para volcar información de informes a esquemas JSON o bases de datos mediante function calling.
- Agentes de soporte sanitario multi-turno: conversaciones largas con memoria efectiva gracias a la caché KV de 286.593 tokens y a las capas KDA de memoria constante.
- Despliegue en infraestructura de gama alta de consumo: inferencia en 4× RTX 3090 (96 GB) con SGLang y `TP=4`, adecuado para laboratorios o equipos con GPUs Ampere en lugar de centros de datos.
- Procesamiento por lotes de documentación clínica: prefill rápido y decodificación de ~139 tok/s a 1K permiten throughput razonable en pipelines de digitalización y anonimización de historiales.
- Investigación en IA médica multimodal: base cuantizada reproducible (MIT) para experimentación con modelos MoE de gran tamaño en hardware asequible.

## Benchmarks y rendimiento

Rendimiento medido en 4× RTX 3090 (96 GB, PCIe 3.0 ×16, P2P activo, 300 W/GPU, `gpu-unlock`), SGLang 0.5.23 (`torch 2.14.1+cu130`, `TP=4`), grafos CUDA de decodificación completos, contexto máximo 262.144, petición única (`c=1`), 256 tokens de salida y `enable_thinking=False`:

| Benchmark | Prompt tokens | TTFT | Prefill (o ViT + Prefill) | Decode | VRAM pico/GPU |
|---|---|---|---|---|---|
| Texto · 1K | 981 | no disponible | no disponible | no disponible | no disponible |
| Texto · 200K | no disponible | no disponible | no disponible | 99,9 tok/s | no disponible |

La model card cita 138,9 tok/s de decodificación a 1K y 99,9 tok/s a 200K. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 70,85 GiB de pesos; mínimo 4× 24 GB (96 GB) con `TP=4` (18,4 GiB/GPU de pesos), verificado en 4× RTX 3090 (`sm_86`).
- GPU recomendadas: 4× RTX 3090, 4× RTX 4090 (Ada, `sm_89`), A100/H100 (Hopper, `sm_90`), Blackwell (`sm_100`); kernels Marlin W4A16 nativos en Ampere, Ada, Hopper y Blackwell.
- Cabe en GPU de consumo: sí, en 4× RTX 3090 o 4× RTX 4090; no cabe en una sola GPU de consumo.
- Opciones de despliegue: SGLang (verificado, 0.5.23) y vLLM; el formato `compressed-tensors` es compatible con transformers. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 138,9 tok/s de decodificación a 1K y 99,9 tok/s a 200K en la configuración anterior. No activar decodificación especulativa NEXTN (el modelo no tiene capas MTP).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LingSante-3.1-air-VL-W4A16 (esta ficha) | 124,85B | 5,5B | 256K | INT4 W4A16 + BF16 mixto | MIT | Hugging Face |
| inclusionAI/LingSante-3.1-air-VL (base) | 124,85B | 5,5B | 256K | BF16 | MIT | Hugging Face |
| Ling-3.0-flash-VL-int4 (Ant Group) | no disponible | no disponible | no disponible | INT4 pack-quantized | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (benchmarks académicos) para esta cuantización; el autor afirma "cero degradación" en los subsistemas no cuantizados, pero no aporta métricas de tareas downstream.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio médico: no debe usarse como sustituto del juicio clínico profesional.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; conviene validar el comportamiento en castellano antes de producción.
- La cuantización INT4 de los expertos enrutados puede introducir degradación sutil no medida en tareas de razonamiento profundo.
- Requiere hardware multi-GPU (4× 24 GB mínimo); no es desplegable en una sola GPU de consumo.
- No activar `--speculative-algorithm NEXTN`: el modelo no incluye capas MTP/NextN.
- Licencia MIT permite uso comercial, pero el uso en ámbito sanitario está sujeto a la normativa aplicable (MDR, RGPD y regulación de dispositivos médicos).
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (22 de noviembre de 2026); se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/alesha-pro/LingSante-3.1-air-VL-W4A16
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Licencia MIT: https://opensource.org/licenses/MIT
- Autor de la cuantización: https://x.com/superalesha
