# axteam/gemma-4-31B-FP8-dynamic

## Resumen

`axteam/gemma-4-31B-FP8-dynamic` es una cuantización de 8 bits en formato FP8 del modelo base `google/gemma-4-31B` (commit `5bbc2fb`), publicada por el usuario axteam. Se trata de un modelo denso de arquitectura Gemma 4 con 31.273.088.876 parámetros totales, orientado a servir inferencia eficiente mediante vLLM. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada).

La relevancia de esta ficha radica en que ofrece una build W8A8 (pesos FP8 E4M3 con escala estática por canal de salida y activaciones FP8 dinámicas por token) que, según las mediciones del autor, recupera el 99,6 % del rendimiento del BF16 original en un conjunto de benchmarks de conocimiento, razonamiento y matemáticas, con un tamaño en disco de 33,3 GB. Está pensada para despliegues en vLLM, no para uso conversacional directo, ya que se distribuye sin plantilla de chat.

Es importante señalar que el modelo es una cuantización post-entrenamiento (PTQ) sin recalentamiento ni calibración, y que conserva en BF16 el torreón de visión, la proyección visual, los embeddings de tokens (atados con `lm_head`) y todas las normalizaciones, lo que representa aproximadamente el 6 % de los parámetros de esta build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, densa (transformer multimodal image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dynamic (W8A8, FP8 E4M3, esquema `FP8_DYNAMIC` de compressed-tensors); pesos y activaciones en FP8; vision tower, proyeccion visual, embeddings y norms en BF16 |
| Idiomas soportados | No disponible (la model card no lista idiomas; los benchmarks incluyen MMLU, GSM8K, ARC, Winogrande, KMMLU y HAE-RAE, con presencia de coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors `float-quantized`; tamano del repo 33,3 GB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 en variante densa de 31B parámetros, con capacidad multimodal de entrada imagen-texto. Esta build concreta no introduce cambios arquitectónicos: aplica cuantización post-entrenamiento (PTQ) sobre los pesos BF16 liberados por Google, sin recalentamiento ni datos de calibración. La cuantización es W8A8: los pesos se almacenan en FP8 E4M3 con escala estática por canal de salida, y las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. El formato de serialización es `float-quantized` de la librería compressed-tensors, con esquema `FP8_DYNAMIC`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación, ya que la model card de esta cuantización no los detalla y se remite al modelo original. La innovación técnica destacable de esta build es la preservación selectiva en BF16 de los componentes sensibles a la cuantización (torreón de visión, proyección visual, embeddings y normalizaciones), que evita degradar la rama multimodal y la estabilidad numérica. El tokenizador, `processor_config` y `generation_config` son idénticos byte a byte al original.

## Capacidades

- Generación de texto por completion (modelo base pre-entrenado, sin plantilla de chat ni ajuste instruct).
- Procesamiento multimodal de entrada imagen-texto, heredado del modelo base Gemma 4.
- Razonamiento y conocimiento general, evaluado en MMLU, ARC-Challenge y Winogrande.
- Razonamiento matemático de varios pasos, evaluado en GSM8K.
- Capacidades multilingües parciales, con resultados medidos en KMMLU (coreano) y HAE-RAE (coreano).
- Inferencia eficiente en vLLM con soporte de tensor parallelism.
- No se declara soporte explícito de tool calling, function calling ni modo thinking en la información disponible; al ser un modelo base sin plantilla de chat, estas capacidades no deben asumirse.

## Casos de uso

- Servicio de completion de texto a gran escala: al ser un modelo base sin plantilla de chat, encaja en pipelines de generación de texto plano (relleno, continuación, síntesis) servidos con vLLM y tensor parallelism cuando los 33,3 GB de pesos no caben en una sola GPU.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text permite extraer o describir contenido de capturas, formularios o figuras en flujos de digitalización, manteniendo la torre de visión en BF16 para preservar calidad.
- Evaluación comparativa de cuantizaciones: sirve como referencia FP8 en estudios de recuperación de calidad frente a BF16, AWQ-8bit, NVFP4 y AWQ-4bit, con métricas publicadas en MMLU, GSM8K, ARC, Winogrande, KMMLU y HAE-RAE.
- Despliegue en GPUs Ada, Hopper o Blackwell: al ejecutar matemática FP8 nativa en sm89 o superior, es adecuado para servir en L40S, H100 o B200 con mayor throughput que una build BF16 equivalente.
- Inferencia en GPUs Turing o Ampere con fallback a FP8 solo de pesos: vLLM cambia automáticamente a weight-only FP8 en sm75 y sm8x, lo que permite reutilizar T4 o A100 con menor huella de memoria.
- Backend de investigación en multimodalidad: útil para experimentar con la rama visión-lenguaje de Gemma 4 en entornos controlados donde no se requiere alineación conversacional.
- Base para fine-tuning posterior: el formato compressed-tensors y la licencia Apache-2.0 facilitan adaptaciones sobre la build cuantizada, aunque la model card no documenta recetas de reentrenamiento sobre FP8.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de completion sin plantilla de chat. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (esta build) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 84,59 | 84,71 (100,1 %) | 84,52 (99,9 %) | 83,70 (98,9 %) | 83,09 (98,2 %) | 84,02 (99,3 %) |
| GSM8K (5-shot, strict) | 84,46 | 83,09 (98,4 %) | 84,23 (99,7 %) | 83,78 (99,2 %) | 82,03 (97,1 %) | 84,15 (99,6 %) |
| ARC-Challenge (0-shot) | 69,62 | 68,94 (99,0 %) | 69,11 (99,3 %) | 68,43 (98,3 %) | 67,49 (96,9 %) | 69,11 (99,3 %) |
| Winogrande (5-shot) | 83,90 | 84,29 (100,5 %) | 84,29 (100,5 %) | 84,45 (100,7 %) | 82,64 (98,5 %) | 83,58 (99,6 %) |
| KMMLU (5-shot, direct) | 67,35 | 67,22 (99,8 %) | 67,39 (100,1 %) | 66,41 (98,6 %) | 65,22 (96,8 %) | 67,33 (100,0 %) |
| HAE-RAE (0-shot) | 82,31 | 82,03 (99,7 %) | 82,03 (99,7 %) | 81,94 (99,6 %) | 80,29 (97,6 %) | 81,85 (99,4 %) |
| Media | 78,71 | 78,38 (99,6 %) | 78,60 (99,9 %) | 78,12 (99,3 %) | 76,79 (97,6 %) | 78,34 (99,5 %) |

Además, se midió perplejidad frente al BF16 original sobre WikiText-2 (inglés) y una muestra de Wikipedia en coreano, en fragmentos de 2.048 tokens: las builds de 8 bits (AWQ INT8 y FP8) se mantuvieron dentro del 0,5 % del BF16, mientras que las de 4 bits (AWQ INT4 y NVFP4) subieron entre un 2,0 % y un 6,6 %. No se midió la coincidencia top-1 de siguiente token para los modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: 33,3 GB solo para pesos; hay que añadir KV cache (crece con longitud de contexto y peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Ada, Hopper o Blackwell (sm89+) para matemática FP8 nativa, por ejemplo L40S, H100 o B200; el autor solo ejecutó pruebas en B200.
- GPUs Turing (sm75, p. ej. T4) y Ampere: soportadas, pero vLLM conmuta automáticamente a FP8 weight-only, con menor aceleración.
- V100 (sm70): no soportada.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB o menos; requeriría tensor parallelism entre varias GPU o una GPU profesional con al menos 40 GB.
- Despliegue: vLLM (arquitectura incluida desde vLLM ≥ 0.19.0, probado con 0.32.0); también transformers ≥ 5.5.0 (recomendado 5.5.2+) sin vLLM, aunque no se probó para 31B.
- Dependencias: Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥ 5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/gemma-4-31B-FP8-dynamic` | 31,27 B | No disponible | 78,38 | Apache-2.0 | Hugging Face |
| `google/gemma-4-31B` (BF16) | 31,27 B | No disponible | 78,71 | Gemma 4 / Apache-2.0 | Hugging Face |
| Build AWQ-8bit de referencia | 31,27 B | No disponible | 78,60 | No disponible | No disponible |
| Build NVFP4 de referencia | 31,27 B | No disponible | 76,79 | No disponible | No disponible |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que la información proporcionada no incluye otros modelos de la misma categoría. La build FP8-dynamic se sitúa a 0,33 puntos de media del BF16 y a 0,22 puntos de la AWQ-8bit, con licencia Apache-2.0 declarada.

## Limitaciones y advertencias

- Modelo base pre-entrenado sin plantilla de chat: no está ajustado para instrucciones ni diálogo; usarlo en modo conversacional producirá respuestas de completion, no alineadas.
- No se declara soporte de tool calling, function calling ni agentes; no debe asumirse en producción.
- La cuantización es PTQ sin calibración ni recalentamiento: la fidelidad frente a BF16 depende del benchmark y puede degradarse en tareas fuera de los conjuntos medidos.
- GSM8K es el benchmark con mayor caída relativa (98,4 % de recuperación), lo que sugiere cierta pérdida en razonamiento matemático estricto.
- Longitud de contexto no documentada en la información disponible; debe consultarse la model card del modelo base antes de dimensionar KV cache.
- Idiomas soportados no listados; los benchmarks incluyen coreano e inglés, pero no hay garantía para otras lenguas.
- Licencia Apache-2.0 con enlace a la licencia Gemma 4: conviene verificar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- Riesgo de alucinación inherente a un modelo base sin alineación; no se han publicado evaluaciones de sesgo ni de seguridad para esta build.
- Dependencias muy específicas (torch 2.13 con CUDA 13.0, transformers < 5.20, compressed-tensors 0.17.0) que pueden romper el despliegue si se actualizan de forma independiente.
- Solo se probó en B200 según el autor; el comportamiento en otras GPU es inferido del código de selección de kernels de vLLM 0.32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
