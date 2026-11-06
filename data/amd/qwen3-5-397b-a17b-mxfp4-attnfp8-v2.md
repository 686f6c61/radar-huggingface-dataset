# amd/Qwen3.5-397B-A17B-MXFP4-AttnFP8-V2

## Resumen

amd/Qwen3.5-397B-A17B-MXFP4-AttnFP8-V2 es un checkpoint cuantizado del modelo multimodal Qwen/Qwen3.5-397B-A17B, publicado por AMD mediante su herramienta de optimización AMD-Quark (v0.12.post1). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con arquitectura híbrida de atención (atención lineal y atención estándar), orientado a tareas image-text-to-text: acepta texto, imagen y vídeo como entrada y produce texto. La nomenclatura del nombre ("397B-A17B") indica 397 mil millones de parámetros totales y aproximadamente 17 mil millones de parámetros activos por token; no obstante, el recuento real de tensores en safetensors del checkpoint cuantizado es de 203.151.345.136 parámetros, y el repositorio ocupa 694,5 GB.

El propósito de este checkpoint es reducir la huella de memoria y mejorar el throughput de decodificación manteniendo la precisión del modelo BF16 original. Para ello, AMD aplica cuantización OCP MXFP4 a los pesos y activaciones de las capas MoE (expertos enrutados y experto compartido, este último fusionado en el kernel MoE mediante la técnica FSE, "fused shared expert") y FP8 E4M3 a las proyecciones de atención (self_attn y linear_attn), con cuantización por canal en pesos y por token en activaciones. La cuantización es data-free: no se empleó conjunto de calibración, sino que las escalas se calculan a partir de los propios pesos.

Es relevante ahora porque está diseñado y validado específicamente para hardware AMD Instinct MI350/MI355 con ROCm 7.2.0, SGLang como motor de inferencia y soporte de contexto de hasta 262.144 tokens en la configuración de despliegue documentada. La licencia es Apache 2.0, lo que facilita su uso comercial, y la recuperación de precisión frente al modelo BF16 se sitúa entre el 98,54 % y el 99,56 % en los benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer MoE con atención híbrida: self_attn y linear_attn) |
| Parametros totales | 397B nominales (según nombre del modelo base); 203.151.345.136 en safetensors del checkpoint cuantizado |
| Parametros activos | 17B nominales (según nomenclatura A17B del modelo base) |
| Longitud de contexto | 262.144 tokens (configuración de servidor documentada con `--context-length 262144`) |
| Tipos de cuantizacion | MoE (expertos enrutados y compartido): OCP MXFP4 en pesos y activaciones; atención (self_attn y linear_attn): FP8 E4M3, per-channel en pesos y per-token en activaciones; resto en BF16 |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato HF, exportado con `--model_export hf_format`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura MoE con dos mecanismos de atención combinados: capas de self-attention estándar y capas de atención lineal (linear_attn), lo que sugiere un diseño híbrido orientado a eficiencia en contextos largos. El checkpoint incluye además componentes multimodales (`model.visual.*`) para entrada de imagen y vídeo, un módulo MTP (multi-token prediction) y un experto compartido junto a los expertos enrutados del MoE. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esos datos corresponden al modelo base y no se reproducen en la información disponible.

La innovación técnica de este checkpoint es la cuantización. AMD-Quark aplica MXFP4 (formato de bloque OCP Microscaling con mantisa de 4 bits) a las proyecciones gate, up y down tanto de los expertos enrutados como del experto compartido, y fusiona este último en el kernel MoE (FSE). Las proyecciones q, k, v, o de self_attn y las in_proj_qkv, in_proj_z, in_proj_a, in_proj_b y out_proj de linear_attn se cuantizan a FP8 E4M3. Quedan en BF16 el lm_head, las puertas del MoE (`mlp.gate`, `shared_expert_gate`), el módulo MTP, el encoder visual, los embeddings y las normas. La cuantización es estática en pesos y dinámica en activaciones, y no requiere datos de calibración. El despliegue validado usa SGLang con backend de atención AITER, tensor parallelism de 4 GPUs, `--mem-fraction-static 0.80`, page size 16 y allreduce fusionado.

## Capacidades

- Generación de texto y razonamiento en modo thinking (la evaluación se realizó en thinking mode con `--reasoning-parser qwen3`).
- Entrada multimodal: texto, imagen y vídeo; salida exclusivamente de texto (pipeline image-text-to-text).
- Razonamiento matemático y científico de alto nivel, evidenciado por resultados en GSM8K, AIME26 y GPQA Diamond.
- Comprensión de documentos e imágenes complejas (MMMU Pro en variantes standard y vision).
- Manejo de contexto largo: la configuración documentada soporta hasta 262.144 tokens, y se evalúa en AA-LCR v1.1 (long-context reasoning).
- Capacidad de predicción multi-token (módulo MTP incluido en el checkpoint, en BF16).
- Idiomas: la model card declara únicamente inglés ("en"); no se documentan otras lenguas.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni orquestación de agentes.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 92,71 en AIME26 (mean@16) en su versión cuantizada, por lo que es adecuado para resolución de problemas matemáticos competitivos y verificación de demostraciones, con la ventaja de un consumo de memoria muy inferior al BF16.
- Análisis de documentos técnicos con imágenes: gracias a MMMU Pro (78,32 en variante vision) y a la ventana de 262.144 tokens, puede procesar informes extensos con figuras, tablas y diagramas en una sola pasada.
- Razonamiento sobre contexto largo: AA-LCR v1.1 evalúa esta capacidad; resulta útil para auditoría de contratos, revisión de código en repositorios completos o análisis de transcripciones largas.
- Preguntas y respuestas científicas de nivel experto: GPQA Diamond con 86,36 (mean@8) lo sitúa como candidato para asistentes de investigación en dominios de posgrado (física, química, biología).
- Procesamiento de vídeo para descripción y extracción de información: la entrada de vídeo permite generar resúmenes textuales de grabaciones, útil en monitorización o accesibilidad.
- Despliegue en infraestructura AMD Instinct: al estar optimizado para MI350/MI355 con ROCm 7.2.0 y SGLang, encaja en clústeres AMD existentes que busquen servir un modelo frontera con 4 GPUs en tensor parallelism y menor huella de memoria que el BF16.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de precisión de MXFP4+FP8 frente a BF16 en un modelo MoE multimodal de gran escala.

## Benchmarks y rendimiento

Resultados publicados en la model card, en thinking mode, con SGLang y EvalScope 1.14.1, comparando el checkpoint cuantizado con el BF16 base:

| Benchmark | Qwen3.5-397B-A17B (BF16) | Este modelo (MXFP4+FP8) | Recuperación |
|---|---:|---:|---:|
| GSM8K (flexible-extract, 5-shot) | 97,71 | 97,24 | 99,55 % |
| GPQA Diamond (mean@8) | 86,74 | 86,36 | 99,56 % |
| AIME26 (mean@16) | 93,33 | 92,71 | 99,34 % |
| MMMU Pro, standard (mean@1) | 79,83 | 79,48 | 99,56 % |
| MMMU Pro, vision (mean@1) | 79,48 | 78,32 | 98,54 % |
| AA-LCR v1.1 (mean@16) | 74,06 | 73,31 | 98,99 % |

Parámetros de muestreo para benchmarks de razonamiento: temperature 0,6, top_p 0,95, top_k 20, min_p 0, presence_penalty 0, max_tokens 81920. No se publican datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 694,5 GB; con tensor parallelism de 4 GPUs el reparto es de aproximadamente 174 GB por GPU, más espacio para caché KV y activaciones (la configuración documentada reserva `--mem-fraction-static 0.80`).
- GPU soportadas oficialmente: AMD Instinct MI350 y MI355. No se documenta soporte para GPUs NVIDIA ni para GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el tamaño del checkpoint y la pila ROCm/AITER requerida lo impiden.
- Software: ROCm 7.2.0, PyTorch 2.9.1, Transformers 5.3.0, SGLang (imagen validada `lmsysorg/sglang-rocm:v0.5.20-rocm720-mi35x-20260927`), AMD-Quark v0.12.post1 para la cuantización. Sistema operativo Linux.
- Motor de despliegue: SGLang con backend de atención AITER, `--tensor-parallel-size 4`, `--page-size 16`, allreduce fusionado y `--reasoning-parser qwen3`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica que la fusión del experto compartido mejora el throughput de decodificación, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Cuantización |
|---|---|---|---|---|---|
| amd/Qwen3.5-397B-A17B-MXFP4-AttnFP8-V2 (este) | 397B nominales / 203,15B en safetensors; 17B activos | 262.144 tokens (config. documentada) | Apache 2.0 | AMD MI350/MI355, ROCm 7.2.0 | MXFP4 (MoE) + FP8 (atención) |
| Qwen/Qwen3.5-397B-A17B (base) | 397B nominales; 17B activos | No disponible en la información | Apache 2.0 | No especificado | BF16 |
| Alternativas de terceros de tamaño y modalidad equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa documentada es con el modelo base BF16, cuyos resultados se recogen en la sección de benchmarks. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otras lenguas no está evaluado ni garantizado.
- El modelo puede alucinar, especialmente en tareas de razonamiento de múltiples pasos y en interpretación de imágenes; los benchmarks publicados son medias agregadas y no garantizan robustez en dominios específicos.
- La cuantización introduce una pérdida de precisión medible: la recuperación más baja registrada es del 98,54 % en MMMU Pro vision, lo que implica degradación en tareas visuales complejas.
- La cuantización es data-free, sin calibración con datos reales; esto puede afectar a la robustez de las escalas en distribuciones de activación alejadas de las supuestas.
- El despliegue validado está restringido a AMD Instinct MI350/MI355 con ROCm 7.2.0 y SGLang; no hay soporte documentado para NVIDIA, GPUs de consumo ni otros motores de inferencia.
- El tamaño del checkpoint (694,5 GB) y la necesidad de 4 GPUs en tensor parallelism limitan su uso a infraestructura de centro de datos.
- No se documentan capacidades de tool calling ni de agentes; asumirlas sería una extrapolación no respaldada.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base enlazada en la model card para confirmar términos de uso comercial y atribución.
- El módulo MTP y el encoder visual permanecen en BF16, por lo que no se benefician de la reducción de memoria aplicada a las capas del lenguaje.

## Enlaces

- Checkpoint cuantizado en Hugging Face: https://huggingface.co/amd/Qwen3.5-397B-A17B-MXFP4-AttnFP8-V2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/LICENSE
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentación de SGLang: https://docs.sglang.ai/
