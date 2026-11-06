# axteam/gemma-4-26B-A4B-AWQ-8bit

## Resumen

`axteam/gemma-4-26B-A4B-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `google/gemma-4-26B-A4B`, publicada por el equipo axteam. El modelo base es un transformer de arquitectura Mixture-of-Experts (MoE) de la familia Gemma 4 de Google, con 128 expertos totales más uno compartido y 8 expertos activos por token. Esta versión emplea cuantización AWQ INT8 en formato W8A16 (pesos INT8 simétricos con grupo de 32, activaciones en BF16) y se distribuye en formato `compressed-tensors` `pack-quantized`, pensada específicamente para servir el modelo con vLLM.

El interés de esta ficha radica en que permite ejecutar un modelo MoE multimodal de gran tamano con una huella en disco de unos 29,2 GB, manteniendo una fidelidad prácticamente identica al original en BF16 en los benchmarks medidos (100,0 % de recuperación media). Es una opción relevante para despliegues en producción que necesitan razonamiento, matemáticas y comprensión de imagen-texto con requisitos de memoria reducidos frente al checkpoint original.

Conviene subrayar que se trata de un modelo **base** (preentrenado), sin plantilla de chat, por lo que su uso previsto es la completación de texto, no el diálogo conversacional. La licencia declarada es Apache-2.0, con enlace a la licencia específica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer Mixture-of-Experts (MoE) |
| Parametros totales | 8.593.213.462 (según safetensors del repo); el modelo base se denomina 26B-A4B |
| Parametros activos | 8 expertos activos de 128 totales + 1 compartido (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 (W8A16), pesos INT8 simétricos, grupo de 32, activaciones BF16; formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (enlace a licencia Gemma 4) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts de la familia Gemma 4, con 128 expertos más uno compartido y 8 expertos activos por token. Esta build conserva en BF16 el torreón de visión, la proyección de visión, los embeddings de tokens (atados con lm_head), el router MoE, todas las normas y el MLP compartido; aproximadamente el 7 % de los parámetros permanece sin cuantizar para preservar la calidad. El tokenizador, `processor_config` y `generation_config` son byte a byte idénticos al original, y `config.json` es el original más un bloque `quantization_config`.

La cuantización es post-entrenamiento (PTQ) mediante AWQ, con un conjunto de calibración de 256 muestras (mayoritariamente en coreano; la variante -it incluye 32 respuestas autogeneradas en modo thinking). No hay reentrenamiento ni gradiente: AWQ identifica los canales de peso que multiplican las activaciones más grandes y los protege mediante escalado por canal antes del redondeo. El autor distingue esta build de las alternativas QAT de Google, que no son este repo. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto y completación (modelo base, sin plantilla de chat).
- Comprensión de imagen-texto (pipeline `image-text-to-text`), con torreón de visión conservado en BF16.
- Razonamiento y matemáticas, según los benchmarks medidos (GSM8K, ARC-Challenge).
- Capacidades multilingües parcialmente evidenciadas por benchmarks en coreano (KMMLU, HAE-RAE).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la variante -it del calibrado incluye respuestas en modo thinking, pero esta build es base y no expone plantilla de chat.

## Casos de uso

- Servicio de completación de texto en producción con vLLM: el modelo se carga directamente en vLLM (arquitectura soportada desde vLLM ≥ 0.19.0) y permite servir completaciones con una huella de pesos de 29,2 GB, menor que el checkpoint BF16.
- Procesamiento de documentos con imagen y texto: al conservar el torreón de visión en BF16, puede emplearse en tareas image-text-to-text como descripción de imágenes o extracción de información de capturas y escaneos.
- Evaluación comparativa de cuantizaciones: sirve como referencia AWQ INT8 para medir la degradación frente a BF16, FP8, NVFP4 y AWQ-4bit con el mismo harness (lm-evaluation-harness sobre vLLM).
- Razonamiento matemático en pipelines internos: los resultados en GSM8K (71,49 en 5-shot strict) lo hacen adecuado para resolución de problemas aritméticos en lote.
- Despliegue multilingüe con foco en coreano: los benchmarks KMMLU y HAE-RAE indican un rendimiento mantenido en coreano, útil para aplicaciones de procesamiento de lenguaje en ese idioma.
- Base para fine-tuning posterior: al ser un modelo base preentrenado con licencia Apache-2.0, puede servir como punto de partida para adaptaciones específicas de dominio.
- Inferencia en hardware Turing o superior: al ser weight-only INT, no requiere tensor cores especiales, lo que amplía las GPU compatibles dentro de la familia NVIDIA.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 77,77 | 77,25 (99,3 %) | 77,75 (100,0 %) | 77,18 (99,2 %) | 76,20 (98,0 %) | 76,82 (98,8 %) |
| GSM8K (5-shot, strict) | 70,89 | 71,34 (100,6 %) | 71,49 (100,9 %) | 69,98 (98,7 %) | 67,17 (94,8 %) | 69,98 (98,7 %) |
| ARC-Challenge (0-shot) | 68,34 | 68,60 (100,4 %) | 68,17 (99,8 %) | 68,52 (100,2 %) | 66,98 (98,0 %) | 68,69 (100,5 %) |
| Winogrande (5-shot) | 80,58 | 80,03 (99,3 %) | 80,58 (100,0 %) | 79,64 (98,8 %) | 78,22 (97,1 %) | 79,56 (98,7 %) |
| KMMLU (5-shot, direct) | 60,03 | 60,07 (100,1 %) | 60,15 (100,2 %) | 59,41 (99,0 %) | 58,14 (96,9 %) | 58,99 (98,3 %) |
| HAE-RAE (0-shot) | 77,27 | 76,99 (99,6 %) | 76,90 (99,5 %) | 77,18 (99,9 %) | 75,44 (97,6 %) | 75,80 (98,1 %) |
| **Media** | **72,48** | **72,38 (99,9 %)** | **72,51 (100,0 %)** | **71,98 (99,3 %)** | **70,36 (97,1 %)** | **71,64 (98,8 %)** |

Además, se midió perplejidad frente al BF16 original sobre WikiText-2 (inglés) y una muestra de Wikipedia en coreano, con fragmentos de 2.048 tokens: las builds de 8 bits (AWQ INT8, FP8) se mantuvieron dentro del 0,5 % del BF16, mientras que las de 4 bits (AWQ INT4, NVFP4) fueron un 2,0–6,6 % superiores. No se midió la coincidencia top-1 del siguiente token para los modelos base.

## Requisitos de hardware

- VRAM estimada: pesos de 29,2 GB; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; V100 (sm70) no está soportado. Para repartir los pesos entre varias GPU, usar `--tensor-parallel-size N`.
- Cabe en GPU de consumo: no se especifica en la información disponible; con 29,2 GB de pesos, una GPU de 24 GB no es suficiente sin tensor parallelism.
- Opciones de despliegue: vLLM (única vía soportada; no es cargable por Transformers hasta 5.22.1 por falta de regla de conversión para checkpoints por experto). vLLM 0.32 requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (no actualizar por separado).
- Latencia y throughput: no disponible en la información proporcionada.
- `trust_remote_code`: no necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-AWQ-8bit (este repo) | 8.593.213.462 en safetensors; base 26B-A4B MoE | no disponible | 72,51 | Apache-2.0 | Hugging Face, vLLM |
| google/gemma-4-26B-A4B (BF16) | 26B-A4B MoE | no disponible | 72,48 | Gemma 4 / Apache-2.0 | Hugging Face |
| FP8-dynamic (misma familia) | no disponible | no disponible | 72,38 | no disponible | no disponible |
| AWQ-4bit (misma familia) | no disponible | no disponible | 71,64 | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base preentrenado sin plantilla de chat: debe usarse para completación de texto, no para diálogo conversacional.
- No es cargable por Transformers (comprobado hasta 5.22.1): los expertos quedan sin inicializar; es obligatorio usar vLLM.
- La cuantización es PTQ con AWQ, sin reentrenamiento; la fidelidad es inferior a una build QAT, aunque en los benchmarks medidos la recuperación media es del 100,0 %.
- El conjunto de calibración es mayoritariamente coreano, lo que puede introducir sesgos en la calibración para otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idiomas: la longitud de contexto y los idiomas soportados no están disponibles.
- Restricciones de licencia: Apache-2.0 con enlace a la licencia específica de Gemma 4; conviene revisar los términos de uso comercial de Gemma 4 antes de producción.
- Requiere NVIDIA Turing o superior; V100 no está soportado.
- La build se evaluó con vLLM ≥ 0.19.0, pero aún no con vLLM 0.32.0; la selección de kernel por GPU proviene del código de vLLM 0.32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-26B-A4B-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
