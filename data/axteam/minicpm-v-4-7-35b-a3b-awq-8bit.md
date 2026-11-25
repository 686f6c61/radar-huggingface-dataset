# axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit

## Resumen

MiniCPM-V-4.7-35B-A3B-AWQ-8bit es una cuantización INT8 (W8A16) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por axteam. El modelo base es un transformer de tipo Mixture-of-Experts con backbone Qwen3.5-MoE, torre de visión y capacidad image-text-to-text, empaquetado en formato compressed-tensors `pack-quantized` para servir con vLLM. La cuantización es post-entrenamiento (sin reentrenamiento) y mantiene en BF16 la torre de visión, el merger visión-texto, los embeddings, la LM head, todas las RMSNorm y los routers del MoE.

El objetivo de esta versión es reducir el peso en disco a aproximadamente 38,9 GB (frente a los 116,8 GB del repositorio completo) y permitir el despliegue en GPUs con menor VRAM, conservando una fidelidad alta respecto al original BF16: perplejidad de 1,2086 frente a 1,2063 (+0,2 %) y una tasa de coincidencia top-1 del 97,7 % en un conjunto interno mixto inglés/coreano de 100 prompts. La licencia Apache-2.0 facilita el uso comercial.

La ficha se basa en los datos publicados en la model card del repositorio de cuantización; los detalles de arquitectura y entrenamiento del modelo base no se detallan en la información disponible y se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Qwen3.5-MoE) con torre de visión y fusión multimodal; transformer con atención (incluida linear-attention) y proyecciones MoE/MLP |
| Parametros totales | 11.047.643.804 (según safetensors del repositorio cuantizado); el nombre del modelo base indica 35B-A3B |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, sin confirmar en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16: pesos INT8 simétricos, grupo 32, activaciones BF16, formato compressed-tensors `pack-quantized`; calibración con 256 muestras |
| Idiomas soportados | no disponible (la evaluación interna usa un conjunto mixto inglés/coreano; se reportan KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo Mixture-of-Experts con backbone Qwen3.5-MoE, que combina una torre de visión con un modelo de lenguaje MoE. Incluye atención estándar y linear-attention, proyecciones MoE/MLP y routers (`mlp.gate` y `shared_expert_gate`) que seleccionan expertos. Esta versión es una cuantización post-entrenamiento AWQ INT8 (W8A16) sin reentrenamiento; el tokenizador y el `chat_template` son idénticos a los del original.

La model card documenta una revisión del 2026-11-01 que recompensó los routers del MoE y el gate del experto compartido durante el suavizado AWQ, de modo que el reescalado del router coincide con el de las normas (diferencia mediana por canal inferior al 2 %) y los tokens se enrutan a los mismos expertos que en el original. También se excluyeron del suavizado los canales con ganancia de norma cero para preservar la precisión BF16 de las normas. Los pesos cuantizados cubren las proyecciones de atención y MoE/MLP; se mantienen en BF16 la torre de visión, el merger visión-texto, los embeddings, la LM head, las RMSNorm y los routers (aproximadamente el 5 % de los parámetros). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento en formato conversacional (pipeline image-text-to-text).
- Comprensión de imágenes: la model card reporta una prueba con una imagen sintética (círculo rojo, cuadrado azul, texto "QWEN TEST 2026") descrita correctamente.
- Razonamiento matemático y de sentido común, según los benchmarks reportados (GSM8K, ARC-Challenge, Winogrande).
- Conocimiento multilingüe parcial: se reportan resultados en KMMLU (coreano) y HAE-RAE, además de inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal con vLLM: el checkpoint está empaquetado en compressed-tensors y la arquitectura está soportada en vLLM ≥ 0.32.0, lo que permite desplegar un endpoint image-text-to-text con pesos INT8 y menor huella de memoria.
- Descripción y análisis de imágenes en pipelines de documentación: el modelo puede recibir una imagen y generar una descripción textual; útil para catalogar capturas, diagramas o material gráfico.
- Asistente conversacional con contexto visual: al ser un modelo conversacional image-text-to-text, puede gestionar intercambios multi-turno en los que se adjuntan imágenes.
- Evaluación de calidad de cuantización: el repositorio incluye métricas de fidelidad (perplejidad y coincidencia top-1) que sirven para comparar variantes INT8, FP8, NVFP4 y AWQ-4bit antes de elegir un despliegue.
- Razonamiento matemático y de sentido común en producción: los resultados en GSM8K (89,23) y ARC-Challenge (61,18) permiten usar el modelo en tareas de resolución de problemas con requisitos moderados de precisión.
- Procesamiento de texto multilingüe inglés/coreano: los resultados en KMMLU (64,78) y HAE-RAE (73,42) respaldan su uso en tareas de comprensión en esos idiomas.
- Despliegue en GPUs Turing o superiores: al ser cuantización weight-only INT8 sin necesidad de tensor cores especiales, puede ejecutarse en hardware NVIDIA sm75 o más reciente, ampliando las opciones de infraestructura.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin chat template. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con MMLU por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 85,65 | 85,61 (100,0 %) | 85,71 (100,1 %) | 85,76 (100,1 %) | 85,41 (99,7 %) | 85,31 (99,6 %) |
| GSM8K (5-shot, strict) | 90,14 | 89,69 (99,5 %) | 89,23 (99,0 %) | 90,75 (100,7 %) | 90,22 (100,1 %) | 90,52 (100,4 %) |
| ARC-Challenge (0-shot) | 60,92 | 61,01 (100,1 %) | 61,18 (100,4 %) | 60,84 (99,9 %) | 61,09 (100,3 %) | 62,03 (101,8 %) |
| Winogrande (5-shot) | 80,11 | 79,87 (99,7 %) | 78,93 (98,5 %) | 79,32 (99,0 %) | 77,11 (96,3 %) | 79,56 (99,3 %) |
| KMMLU (5-shot, direct) | 64,95 | 64,77 (99,7 %) | 64,78 (99,7 %) | 64,65 (99,5 %) | 64,38 (99,1 %) | 64,67 (99,6 %) |
| HAE-RAE (0-shot) | 73,14 | 73,69 (100,8 %) | 73,42 (100,4 %) | 73,51 (100,5 %) | 74,06 (101,3 %) | 72,69 (99,4 %) |
| **Promedio** | **75,82** | **75,77 (99,9 %)** | **75,54 (99,6 %)** | **75,80 (100,0 %)** | **75,38 (99,4 %)** | **75,80 (100,0 %)** |

Fidelidad respecto al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts, medido con vLLM 0.32 el 2026-11-01:

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,2086 | 1,2063 (+0,2 %) |
| Coincidencia top-1 del siguiente token | 97,7 % | 98,1 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en disco es de aproximadamente 38,9 GB; se requiere VRAM suficiente para los pesos más las activaciones BF16 y la caché KV, no cuantificada en esta build.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior. Al ser cuantización weight-only INT8, no requiere tensor cores especiales; V100 (sm70) queda fuera del soporte indicado.
- Cabe en GPU consumer: no disponible de forma explícita; por el tamaño de pesos (~38,9 GB) no cabe en GPUs consumer de 24 GB sin técnicas adicionales, y la información no detalla opciones de offload.
- Despliegue: vLLM ≥ 0.32.0 (probado con 0.32.0); requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥ 5.16.1,< 5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Para este modelo, vLLM 0.32 necesita transformers 5.18.x o 5.19.x (5.17 no conoce `minicpmv4_7`); las ejecuciones documentadas usaron transformers 5.21.0 instalado con `--no-deps`.
- Latencia y throughput: no disponible.
- Nota de compatibilidad: los benchmarks y métricas de fidelidad son solo de texto; la entrada de imagen falla en esa configuración (procesador de imagen de vLLM frente a transformers 5.21). La única prueba con imagen requirió rellenar el argumento `downsample_mode` del procesador con su valor por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-AWQ-8bit (este) | 11.047.643.804 (safetensors); nombre base 35B-A3B | no disponible | compressed-tensors `pack-quantized`, INT8 W8A16 | Apache-2.0 | Hugging Face, vLLM ≥ 0.32.0 |
| openbmb/MiniCPM-V-4.7-35B-A3B (BF16) | nombre base 35B-A3B | no disponible | safetensors BF16 | Apache-2.0 | Hugging Face |
| Variante FP8-dynamic del mismo modelo base | no disponible | no disponible | FP8 | no disponible | referenciada en la model card |
| Variante AWQ-4bit del mismo modelo base | no disponible | no disponible | AWQ INT4 | no disponible | referenciada en la model card |

Las variantes FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit se comparan en la tabla de benchmarks; sus repositorios no se detallan en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida pequeña pero medible: perplejidad +0,2 % y coincidencia top-1 del 97,7 % frente al 98,1 % del BF16 original.
- Los benchmarks y las métricas de fidelidad son solo de texto; la entrada de imagen no funciona en la configuración documentada (vLLM 0.32 con transformers 5.21) y solo se validó una prueba con imagen rellenando manualmente un argumento del procesador.
- La revisión del 2026-11-01 corrigió problemas de las subidas anteriores (routers no compensados y pérdida de precisión en normas de las capas 4–5). Si se descargó el repositorio antes de esa fecha (revisión `f66eadb`), debe descargarse de nuevo.
- Dependencias muy específicas: vLLM 0.32.0, transformers 5.18.x/5.19.x, compressed-tensors 0.17.0 fijado y torch 2.13 con CUDA 13.0; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- No hay información sobre sesgos, riesgo de alucinación, límites de contexto ni idiomas soportados más allá de los evaluados (inglés y coreano).
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los componentes del modelo base.
- El tamaño de pesos (~38,9 GB) limita el despliegue a GPUs de gama alta; no se documentan opciones de cuantización adicional para GPUs consumer.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-AWQ-8bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
