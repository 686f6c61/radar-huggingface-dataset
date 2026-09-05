# carlopires/Qwopus3.8-27B-Flash-QUASAR-NVFP4-NInfer

## Resumen

Qwopus3.8-27B-Flash-QUASAR-NVFP4-NInfer es un artefacto de inferencia nativo de NInfer, creado por carlopires, que empaqueta el fine-tune Flash de Jackrong sobre Qwen3.8-27B. El modelo original es un Qwen3.8-27B ajustado para agentes, con una arquitectura híbrida de 64 capas de texto más una capa MTP, combinando 16 capas de atención completa con 48 capas Gated DeltaNet e incluyendo una torre de visión. El ajuste Flash reduce el razonamiento excesivo, lo que según el autor acelera la decodificación en aproximadamente un 12,8 % y alcanza un 80,7 % de aceptación de MTP en comparación con el modelo base.

El artefacto se construyó convirtiendo el GGUF publicado por Jackrong a BF16 y aplicando una cuantización post-training NVFP4 con el pipeline QUASAR. No se trata de un modelo QAT. El resultado es un archivo `.ninfer` de 16,35 GiB, pensado exclusivamente para ejecutarse en el runtime NInfer sobre GPU NVIDIA Blackwell con soporte FP4.

La longitud de contexto no se especifica en la documentación; en los ejemplos se usa `--max-context 4096`. Este modelo no es un checkpoint Transformers ni Safetensors, sino un contenedor propietario de NInfer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 64 capas de texto + 1 capa MTP, 16 capas de atención completa + 48 capas Gated DeltaNet, y torre de visión |
| Parametros totales | 27B (según denominación Qwen3.8-27B; desglose no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se recomienda configurar `--max-context`; el ejemplo usa 4096) |
| Tipos de cuantizacion | NVFP4 post-training (pipeline QUASAR); KV cache en BF16 o INT8 group-64 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor NInfer; no Safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es híbrida: combina 16 capas de atención completa con 48 capas Gated DeltaNet, más una capa adicional dedicada a la predicción multi-token (MTP). El modelo incluye una torre de visión que le permite procesar imágenes, vídeo y mensajes multimodales mixtos. El fine-tune Flash fue publicado por Jackrong únicamente en formato GGUF, con el objetivo de reducir el razonamiento excesivo en tareas orientadas a agentes. No se proporcionan datos sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

El artefacto de carlopires se generó en tres etapas: primero se convirtió el GGUF original a un checkpoint BF16 canónico, aplicando las transformaciones inversas del mapeo de llama.cpp para Qwen3.5; después se aplicó una cuantización NVFP4 con el pipeline QUASAR (llmcompressor), que incluye una reparación de fusión; finalmente se convirtió al contenedor NInfer. Es importante destacar que no es un artefacto QAT: los pesos del fine-tune reciben una única cuantización post-training a NVFP4.

## Capacidades

- Generación de texto en modo thinking y non-thinking.
- Procesamiento multimodal: imágenes, multi-imagen, vídeo y mensajes mixtos.
- Decodificación especulativa MTP con optimización de búsqueda en la cabeza de propuesta (hasta 3 tokens de borrador en los ejemplos).
- Soporte de CUDA Graph para decodificación y reutilización de prefijos compatibles.
- Traducción de APIs: OpenAI Responses Core, OpenAI Chat Completions y Anthropic Messages.
- Orientado a agentes y razonamiento multi-paso, con reducción del razonamiento excesivo.
- Soporte de tool calling: no documentado explícitamente; la compatibilidad con las APIs de OpenAI y Anthropic sugiere soporte, pero no se confirma.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Asistentes multimodales en un solo GPU: el artefacto incluye torre de visión y soporta imágenes, vídeo y mensajes mixtos, por lo que puede desplegarse como backend de un chatbot que recibe capturas de pantalla o vídeos en un RTX 5090 de 32 GB.
- Inferencia ágil para agentes conversacionales: el MTP speculative decoding con 3 tokens de borrador reduce la latencia en interacciones multi-turno, adecuado para asistentes en tiempo real.
- Servidor de API compatible con OpenAI/Anthropic: el binario `ninfer-serve` expone endpoints de OpenAI Responses Core, Chat Completions y Anthropic Messages, permitiendo integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Prototipado de pipelines de visión-lenguaje: la capacidad de procesar imágenes y vídeo, junto con la generación de texto en modo thinking, permite experimentar con agentes de análisis visual.
- Investigación en cuantización NVFP4 y pipelines QUASAR: al ser un artefacto de solo 16,35 GiB, los investigadores pueden estudiar el impacto de la cuantización post-training en un modelo de 27B sobre GPUs Blackwell.
- Aplicaciones de razonamiento con contexto largo en memoria limitada: usando KV cache INT8 group-64 y un RTX 5090 Laptop de 24 GB, se pueden ejecutar tareas de razonamiento con contextos útiles sin necesidad de un servidor multiproceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del fine-tune reporta un 12,8 % de decodificación más rápida y un 80,7 % de aceptación de MTP en comparación con el modelo base, pero no se aportan métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 15,31 GiB para pesos en ejecución solo texto; 16,06 GiB con MTP materializado. El contexto requiere memoria adicional.
- GPU recomendada: NVIDIA Blackwell con soporte FP4 (RTX 5090 Laptop 24 GB, RTX 5090 desktop 32 GB). CUDA Toolkit 13.1 o superior.
- No es compatible con GPUs sin FP4, como RTX 4090 o A100.
- Despliegue: NInfer (single-GPU), mediante CLI y servidor `ninfer-serve`. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se conoce la mejora relativa del 12,8 % en decodificación frente al base.

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Flash-QUASAR-NVFP4-NInfer | Qwen3.8-27B (fine-tune Flash) | NVFP4 QUASAR | `.ninfer` | Apache 2.0 | No disponible |
| MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer | Qwen3.8-27B (base) | NVFP4 QUASAR | `.ninfer` | Apache 2.0 | No disponible |
| eepos/Qwen3.8-27B-QUASAR-NVFP4-NInfer | Qwen3.8-27B (base) | NVFP4 QUASAR | `.ninfer` | Apache 2.0 | No disponible |

El modelo de carlopires es el único que incluye el fine-tune Flash, mientras que los otros dos corresponden al modelo base sin ajustar.

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell con FP4 y CUDA Toolkit 13.1 o superior. No es compatible con otras GPUs.
- Solo ejecutable con NInfer. No es un checkpoint Transformers, Safetensors ni GGUF.
- NInfer es single-GPU: no soporta offload CPU/GPU, multi-GPU, serving distribuido ni batching continuo a gran escala.
- No es QAT: la cuantización NVFP4 post-training puede degradar la calidad en comparación con el BF16 original.
- El proceso de conversión GGUF a BF16 puede introducir pequeñas diferencias de precisión.
- Sin benchmarks públicos ni evaluación de sesgos o alucinación.
- Idiomas soportados no documentados.
- El artefacto está pensado para un runtime específico; no se puede usar con frameworks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/carlopires/Qwopus3.8-27B-Flash-QUASAR-NVFP4-NInfer
- NInfer: https://github.com/Neroued/ninfer
- Fork NInfer RTX 5090: https://github.com/carlopires/ninfer-rtx5090-mobile (commit 830e26bb)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo fuente (GGUF): https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-GGUF
- Artifact comparable: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer
- Artifact comparable: https://huggingface.co/eepos/Qwen3.8-27B-QUASAR-NVFP4-NInfer
- Artifact similar (sin NInfer): https://huggingface.co/BennyDaBall/Qwopus3.8-27B-Flash-NVFP4
