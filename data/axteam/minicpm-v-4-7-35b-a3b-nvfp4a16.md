# axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4A16 es una cuantización de 4 bits del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario axteam. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con backbone Qwen3.5-MoE, torre de visión y capacidades image-text-to-text, cuantizado mediante la técnica NVFP4A16 (W4A16, pesos en FP4 con grupo de 16 y escala FP8, activaciones en BF16) y empaquetado en formato compressed-tensors para su servicio con vLLM. El objetivo es reducir el espacio en disco y los requisitos de VRAM del modelo original manteniendo la fidelidad respecto a la versión BF16.

El modelo base declara 35B en el nombre, pero los pesos reales en safetensors suman 20.945.719.504 parámetros (unos 20,9 mil millones). El repositorio ocupa aproximadamente 70,7 GB, aunque la model card indica un tamaño en disco de unos 23,6 GB para los pesos cuantizados. La cuantización deja en BF16 la torre de visión, el merger visión-texto, los embeddings, la LM head, todas las RMSNorm, los routers del MoE y todas las proyecciones de atención lineal Gated-DeltaNet, lo que representa alrededor del 7% de los parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal MoE de gran tamaño en GPUs NVIDIA con menos memoria que la versión BF16, siempre dentro del ecosistema vLLM. Es una publicación de cuantización, no un modelo nuevo: su valor está en la fidelidad medida frente al original y en las condiciones de despliegue documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone Qwen3.5-MoE) con torre de visión y atención lineal Gated-DeltaNet |
| Parametros totales | 20.945.719.504 (según safetensors); el nombre comercial indica 35B-A3B |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmar en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) grupo 16 + escala FP8, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (la evaluación de fidelidad usa un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos. La model card de la cuantización describe el backbone como Qwen3.5-MoE e incluye una torre de visión con merger visión-texto, además de proyecciones de atención lineal del tipo Gated-DeltaNet. La cuantización mantiene en BF16 las partes sensibles (visión, embeddings, LM head, RMSNorm, routers del MoE y todas las proyecciones `linear_attn.*`) y cuantiza a FP4 las proyecciones de atención completa y de MLP/MoE.

El proceso de cuantización es post-entrenamiento, sin reentrenamiento, con 256 muestras de calibración y suavizado AWQ. La revisión del 2026-11-01 reconstruyó los ficheros para compensar el router del MoE (`mlp.gate`) y el gate del experto compartido durante el suavizado AWQ, y para excluir del reescalado los canales con ganancia de norma cero, preservando así la precisión BF16 de las normas en las capas 2–5. El tokenizador y la `chat_template` son idénticos a los del original. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de propósito general; la cuantización conserva las capacidades de texto medidas en MMLU, GSM8K, ARC-Challenge, Winogrande, KMMLU y HAE-RAE.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión mantenida en BF16; se verificó una descripción correcta de una imagen sintética de prueba.
- Conversación multi-turno: la model card declara `conversational` y conserva la `chat_template` original.
- Capacidades multilingües: la evaluación de fidelidad usa un conjunto mixto inglés/coreano; los idiomas exactos no están documentados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el modelo está empaquetado en compressed-tensors y probado con vLLM 0.32.0, lo que permite desplegarlo como endpoint image-text-to-text con pesos FP4 y menor huella de memoria que el BF16.
- Descripción y análisis de imágenes en pipelines documentales: la torre de visión se mantiene en BF16, de modo que la calidad visual no se degrada por la cuantización de los pesos del LM.
- Razonamiento matemático y resolución de problemas: el modelo conserva el rendimiento en GSM8K (90,75 en la versión cuantizada frente a 90,14 en BF16), adecuado para asistentes de cálculo y tutoría.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de fidelidad de NVFP4A16 frente a FP8-dynamic, AWQ-8bit, NVFP4 y AWQ-4bit con el mismo harness.
- Despliegue en infraestructura con GPUs NVIDIA Turing o posteriores: al ser weight-only FP4, no requiere tensor cores FP4, lo que amplía el parque de GPUs compatibles.
- Investigación sobre cuantización post-entrenamiento: la model card documenta el proceso de reconstrucción, la compensación de routers y el efecto de canales con ganancia cero, útil para reproducir metodologías AWQ/NVFP4.
- Asistentes conversacionales con contexto mixto texto-imagen: la plantilla de chat original se conserva, lo que facilita integrarlo en aplicaciones de diálogo.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin chat template. MMLU es la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 85,65 | 85,61 (100,0%) | 85,71 (100,1%) | 85,76 (100,1%) | 85,41 (99,7%) | 85,31 (99,6%) |
| GSM8K (5-shot, strict) | 90,14 | 89,69 (99,5%) | 89,23 (99,0%) | 90,75 (100,7%) | 90,22 (100,1%) | 90,52 (100,4%) |
| ARC-Challenge (0-shot) | 60,92 | 61,01 (100,1%) | 61,18 (100,4%) | 60,84 (99,9%) | 61,09 (100,3%) | 62,03 (101,8%) |
| Winogrande (5-shot) | 80,11 | 79,87 (99,7%) | 78,93 (98,5%) | 79,32 (99,0%) | 77,11 (96,3%) | 79,56 (99,3%) |
| KMMLU (5-shot, direct) | 64,95 | 64,77 (99,7%) | 64,78 (99,7%) | 64,65 (99,5%) | 64,38 (99,1%) | 64,67 (99,6%) |
| HAE-RAE (0-shot) | 73,14 | 73,69 (100,8%) | 73,42 (100,4%) | 73,51 (100,5%) | 74,06 (101,3%) | 72,69 (99,4%) |
| Promedio | 75,82 | 75,77 (99,9%) | 75,54 (99,6%) | 75,80 (100,0%) | 75,38 (99,4%) | 75,80 (100,0%) |

Fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,2627 | 1,2063 (+4,7%) |
| Acuerdo top-1 en el siguiente token | 94,1% | 98,1% |

## Requisitos de hardware

- VRAM estimada: la model card indica un tamaño en disco de aproximadamente 23,6 GB para los pesos cuantizados; la VRAM necesaria para inferencia no se detalla, pero debe cubrir los pesos más el estado de activaciones y caché KV del runtime.
- GPU compatibles: NVIDIA Turing (sm75) o posterior; no requiere tensor cores FP4 por ser weight-only. V100 (sm70) no está soportado.
- GPU recomendadas: no disponible de forma explícita; por compatibilidad de arquitectura, cualquier GPU NVIDIA desde Turing en adelante.
- Cabe en consumer GPU: no disponible en la información proporcionada.
- Opciones de despliegue: vLLM (arquitectura incluida en vLLM ≥ 0.32.0; probado con 0.32.0). No se documentan llama.cpp, Ollama ni TGI.
- Dependencias: Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; el checkpoint se guardó con 0.19.0). Para el modelo se necesita transformers 5.18.x o 5.19.x; 5.17 no reconoce `minicpmv4_7`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-NVFP4A16 (este) | 20,9B (safetensors) | no disponible | Apache-2.0 | safetensors compressed-tensors | W4A16 FP4, solo vLLM; promedio 75,80 en el harness |
| MiniCPM-V-4.7-35B-A3B (BF16) | 20,9B | no disponible | Apache-2.0 | safetensors | Referencia original; promedio 75,82 |
| Misma base, FP8-dynamic | 20,9B | no disponible | Apache-2.0 | safetensors | Promedio 75,77 (99,9%) |
| Misma base, AWQ-4bit | 20,9B | no disponible | Apache-2.0 | safetensors | Promedio 75,80 (100,0%) |

No se dispone de datos de otros modelos multimodales comparables en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base openbmb/MiniCPM-V-4.7-35B-A3B, que no están documentados en la ficha.
- Riesgo de alucinación: no documentado; aplicable el del modelo base.
- Pérdida de fidelidad medible: perplejidad un 4,7% superior al BF16 y acuerdo top-1 del 94,1% frente al 98,1% del original.
- Idiomas: no se declaran idiomas soportados; la evaluación solo cubre inglés y coreano.
- Limitaciones de contexto: la longitud de contexto no está documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base.
- Caveat de producción: los benchmarks y la fidelidad son solo de texto; la entrada de imagen falla con la combinación vLLM 0.32 + transformers 5.21 usada en las pruebas. Solo una comprobación de imagen funcionó tras rellenar manualmente el argumento `downsample_mode` del procesador.
- Requiere vLLM ≥ 0.32.0 y versiones concretas de torch, transformers y compressed-tensors; no se documenta soporte en llama.cpp u otros runtimes.
- Revisiones anteriores del repositorio (antes de 2026-11-01 10:13:01 UTC, revisión `5f19ea4`) tenían routers sin compensar y pérdida de precisión en normas de las capas 2–5; deben descargarse de nuevo.
- El nombre comercial (35B-A3B) no coincide con los parámetros reales en safetensors (20,9B); conviene no asumir el tamaño por el nombre.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/MiniCPM-V-4.7-35B-A3B-NVFP4A16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
