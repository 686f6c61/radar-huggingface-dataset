# axteam/Qwen3.5-0.8B-NVFP4

## Resumen

Qwen3.5-0.8B-NVFP4 es una cuantización de 4 bits (W4A4, formato FP4 E2M1) del modelo multimodal Qwen/Qwen3.5-0.8B, publicada por el equipo axteam. El objetivo es servir el modelo base con un consumo de memoria reducido (1,3 GB de pesos en disco) sobre vLLM, aprovechando los aceleradores FP4 nativos de las GPU Blackwell. Se trata de una cuantización post-entrenamiento (PTQ) que no implica reentrenamiento y que conserva en BF16 las partes más sensibles del modelo.

El modelo base es un transformer denso de 852.985.920 parámetros con arquitectura híbrida (atención lineal tipo GatedDeltaNet más atención completa), torre de visión y cabeza de predicción multi-token (MTP). Su reducido tamaño lo sitúa en la gama de modelos pequeños orientados a despliegues con recursos limitados, pero con capacidades multimodales imagen-texto.

La relevancia de esta ficha es doble: por un lado, muestra el estado del arte en cuantización FP4 para inferencia en vLLM; por otro, documenta con detalle las pérdidas de calidad asociadas a ese nivel de compresión en un modelo pequeño, lo que resulta útil para decidir entre un build de 4 bits y uno de 8 bits en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (linear-attention GatedDeltaNet/SSM + full-attention), denso, multimodal (visión) con cabeza MTP |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de uso de vLLM emplea `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1) con grupo de 16, escala FP8 E4M3 y escala global FP32 por tensor; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible (la calibración usó un corpus mixto con predominio de coreano; el modelo base no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (nvfp4-pack-quantized); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B combina capas de atención lineal (GatedDeltaNet/SSM) con capas de atención completa, una torre de visión con proyector multimodal y una cabeza de predicción multi-token (MTP). Es un modelo denso de aproximadamente 853 millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

Esta versión concreta es el resultado de una cuantización post-entrenamiento sin reentrenamiento. El método NVFP4 aplica pesos y activaciones en FP4 (E2M1) con grupos de 16 elementos, escala FP8 E4M3 por grupo y una escala global FP32 por tensor. Antes del redondeo se aplica AWQ con un conjunto de calibración de 256 muestras de un corpus mixto con predominio de coreano, para proteger los canales de peso más relevantes. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y toda la ruta de atención lineal (`linear_attn.*`), ya que FP4 resulta demasiado grueso para los pesos del SSM. En total, alrededor del 64 % de los parámetros quedan sin cuantizar. La revisión del 2026-11-01 restauró de forma bit-exacta los pesos de RMSNorm sin suavizar, eliminando el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de visión y el proyector se conservan en BF16.
- Razonamiento y matemáticas básicas, con rendimiento medido en GSM8K y ARC-Challenge (ver benchmarks).
- Conocimiento general y multilingüe parcial, con resultados medidos en MMLU, KMMLU (coreano) y HAE-RAE.
- Cabeza de predicción multi-token (MTP) conservada en BF16, útil para decodificación especulativa en el runtime.
- Compatibilidad con el servidor OpenAI-compatible de vLLM (`/v1/chat/completions`).
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal de bajo coste: el modelo puede atender conversaciones que combinan imágenes y texto con solo 1,3 GB de pesos, lo que permite levantar varias instancias en una sola GPU o desplegarlo en GPU de gama media.
- Prototipado rápido de aplicaciones imagen-texto: gracias a su tamaño reducido y a la compatibilidad con el endpoint OpenAI de vLLM, sirve para validar pipelines de visión-lenguaje antes de migrar a modelos mayores.
- Inferencia en GPU Blackwell con FP4 nativo: en B200/GB200, B300 o RTX 50xx el kernel W4A4 aprovecha la aceleración FP4 del hardware, lo que reduce el coste por token en cargas de baja latencia.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica métricas de recuperación frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4A16 y AWQ-4bit, por lo que es útil como referencia en estudios de compresión.
- Tareas de clasificación y respuesta corta en inglés y coreano: los benchmarks KMMLU y HAE-RAE indican un soporte razonable del coreano, adecuado para asistentes de dominio acotado en ese idioma.
- Entornos con memoria muy limitada: al ocupar 1,3 GB de pesos, cabe en GPU consumer con 8 GB o más, lo que permite desplegar el modelo en estaciones de trabajo sin aceleradores de datacenter.
- No recomendado para producción con requisitos estrictos de calidad: la recuperación media del 88,0 % frente a BF16 y el aumento del 15,3 % en perplejidad desaconsejan su uso en tareas sensibles a la precisión.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificación greedy y evaluación few-shot sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 50,56 | 50,50 (99,9 %) | 50,31 (99,5 %) | 48,39 (95,7 %) | 46,36 (91,7 %) | 48,55 (96,0 %) |
| GSM8K (5-shot, strict) | 32,68 | 29,80 (91,2 %) | 32,30 (98,8 %) | 29,49 (90,3 %) | 22,82 (69,8 %) | 28,20 (86,3 %) |
| ARC-Challenge (0-shot) | 37,54 | 36,52 (97,3 %) | 37,46 (99,8 %) | 35,07 (93,4 %) | 33,11 (88,2 %) | 35,15 (93,6 %) |
| Winogrande (5-shot) | 56,27 | 55,49 (98,6 %) | 56,67 (100,7 %) | 55,80 (99,2 %) | 55,64 (98,9 %) | 55,88 (99,3 %) |
| KMMLU (5-shot, direct) | 34,54 | 34,22 (99,1 %) | 34,20 (99,0 %) | 35,02 (101,4 %) | 33,51 (97,0 %) | 35,74 (103,5 %) |
| HAE-RAE (0-shot) | 37,03 | 35,29 (95,3 %) | 36,30 (98,0 %) | 34,10 (92,1 %) | 27,31 (73,8 %) | 34,28 (92,6 %) |
| Media | 41,44 | 40,30 (97,3 %) | 41,21 (99,4 %) | 39,65 (95,7 %) | 36,46 (88,0 %) | 39,63 (95,6 %) |

Métricas de fidelidad frente al original en BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 2,3257 | 2,0174 (+15,3 %) |
| Acuerdo top-1 en siguiente token | 83,2 % | 98,7 % |

## Requisitos de hardware

- VRAM para pesos: 1,3 GB. Hay que sumar la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU con FP4 completo (W4A4): Blackwell, es decir, B200/GB200 (sm100), B300 (sm103) y RTX 50xx / RTX PRO 6000 (sm120). Solo se probó en B200.
- GPU Turing a Hopper (sm75–90): funcionan en modo solo-pesos FP4, más lento, con aviso de vLLM.
- GPU V100 (sm70): no soportada.
- GPU consumer: el modelo cabe en tarjetas con 8 GB o más de VRAM; para velocidad FP4 nativa se requiere una RTX 50xx.
- Runtime recomendado: vLLM (la arquitectura está en vLLM ≥ 0.17.0; probado con vLLM 0.32.0, Python 3.11–3.14, torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0).
- Alternativa sin vLLM: transformers ≥5.2.0 con compressed-tensors ≥0.15.0. No requiere `trust_remote_code`.
- Despliegue: `vllm serve axteam/Qwen3.5-0.8B-NVFP4 --max-model-len 32768`, con `--tensor-parallel-size N` si los pesos no caben en una GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (BF16, original) | 853 M | No disponible | 41,44 | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3.5-0.8B FP8-dynamic | 853 M | No disponible | 40,30 (97,3 %) | Apache-2.0 | Build de referencia en la model card |
| Qwen3.5-0.8B AWQ-8bit | 853 M | No disponible | 41,21 (99,4 %) | Apache-2.0 | Build de referencia en la model card |
| Qwen3.5-0.8B AWQ-4bit | 853 M | No disponible | 39,63 (95,6 %) | Apache-2.0 | Build de referencia en la model card |
| Qwen3.5-0.8B NVFP4A16 | 853 M | No disponible | 39,65 (95,7 %) | Apache-2.0 | Build de referencia en la model card |
| axteam/Qwen3.5-0.8B-NVFP4 (este) | 853 M | No disponible | 36,46 (88,0 %) | Apache-2.0 | Hugging Face (axteam) |

No se dispone de datos de benchmarks de modelos de otros desarrolladores con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad notable: la recuperación media frente a BF16 es del 88,0 %, con caídas severas en GSM8K (69,8 %) y HAE-RAE (73,8 %). El autor recomienda builds de 8 bits si la calidad es prioritaria.
- Perplejidad un 15,3 % superior a la del original y acuerdo top-1 del 83,2 %: el modelo pequeño es sensible a la cuantización de 4 bits.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un modelo pequeño y con calibración centrada en coreano, es esperable un sesgo idiomático hacia ese idioma.
- Riesgo de alucinación: no cuantificado en la información disponible; los resultados de MMLU (46,36) y ARC-Challenge (33,11) indican un conocimiento factual limitado incluso en el original.
- Limitaciones de idioma: el modelo base no declara lista de idiomas; la calibración usó un corpus mixto con predominio de coreano y los benchmarks cubren inglés y coreano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-0.8B enlazada en la model card.
- Dependencias frágiles: requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Soporte de hardware limitado: la velocidad FP4 completa solo está disponible en Blackwell; en Turing a Hopper el rendimiento cae y V100 no está soportada.
- Compatibilidad de tool calling y agentes: no confirmada en la información proporcionada.
- Longitud de contexto máxima: no documentada; el ejemplo de vLLM usa 32 768 tokens, pero no se garantiza como límite oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-0.8B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: no disponible en la información proporcionada (el modelo requiere vLLM ≥ 0.17.0, probado con 0.32.0)
- Repositorio de compressed-tensors: no disponible en la información proporcionada (se requiere la versión 0.17.0)
- Paper o blog del modelo base Qwen3.5-0.8B: no disponible en la información proporcionada
