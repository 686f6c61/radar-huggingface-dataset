# positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq-fused

## Resumen

Este repositorio contiene una compilación cuantizada del modelo Qwen3.6-35B-A3B, publicada por Positron AI bajo licencia Apache 2.0. Se trata de una variante GPTQ de 4 bits derivada del modelo base de Alibaba Qwen, concebida para inferencia en GPU con menor huella de memoria que la versión original en precisión completa. El artefacto conserva la arquitectura MoE (mezcla de expertos) del modelo original, con 35.951.822.704 parámetros totales declarados en los safetensors y un tamaño de repositorio de 22,9 GB.

La particularidad de esta publicación es que no se trata de una recuantización, sino de una reordenación sin pérdida de los tensores ya cuantizados del artefacto parental. El paso de derivación `fuse_gate_up_contiguous` fusiona las proyecciones gate y up de los expertos enrutados en un único tensor contiguo, lo que puede facilitar la carga y la ejecución en determinados runtimes. Los tensores de MTP y de expertos compartidos se mantienen intactos.

Es relevante ahora porque ofrece una vía de despliegue de un MoE de aproximadamente 36.000 millones de parámetros en formato 4-bit GPTQ listo para `transformers`, con soporte declarado de image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. No se publican métricas de calidad ni de rendimiento, por lo que la evaluación corre a cargo del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo `qwen3_5_moe` (transformers) |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4-bit, group size 64, simétrica, `desc_act=false`, damp 0,05 % |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (`qwen3_5_moe`), del que este artefacto hereda la topología. Los pesos están cuantizados a 4 bits con GPTQ, con tamaño de grupo 64, cuantización simétrica y sin ordenación descendente de activaciones. Las activaciones no están cuantizadas. La calibración del artefacto parental se realizó con un conjunto mixto de dominio universal de 512 muestras y longitud de secuencia 8192, usando GPTQModel 7.6.0, transformers 5.15.0, torch 2.9.1 y CUDA 12.8.

La derivación de este repositorio respecto del parental es una reordenación sin pérdida: se fusionan las proyecciones gate y up de los expertos enrutados en un tensor contiguo (`gate_up_proj`), con la mitad gate primero y la mitad up después, copiando el índice de grupo correspondiente a `gate_proj` y `up_proj`. Los tensores de MTP y de expertos compartidos permanecen sin cambios. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional, pipeline declarado `text-generation`.
- Procesamiento image-text-to-text, según el tag de Hugging Face, lo que indica capacidad multimodal de entrada imagen y texto.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero esperable en la familia Qwen3.6.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: solo la entrada image-text-to-text está confirmada por los tags; el resto no disponible.

## Casos de uso

- Despliegue de inferencia multimodal en GPU con memoria limitada: el formato GPTQ 4-bit reduce el peso de los pesos a aproximadamente 22,9 GB de repositorio, lo que permite cargar el MoE en GPUs de 24-48 GB según el runtime y el overhead de activaciones.
- Servicio de chat con entrada de imágenes: el pipeline image-text-to-text permite construir asistentes que reciban capturas, diagramas o documentos escaneados junto a texto y devuelvan respuestas en lenguaje natural.
- Integración en pipelines de `transformers`: al declarar `library_name: transformers` y usar safetensors, el artefacto se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` sin conversión adicional.
- Evaluación comparativa de formatos cuantizados: al ser una reordenación sin pérdida del parental, sirve para medir el impacto del layout `fuse_gate_up_contiguous` frente al artefacto original en términos de velocidad de carga y throughput.
- Prototipado de aplicaciones MoE en entornos con VRAM ajustada: la cuantización 4-bit con group size 64 permite experimentar con un modelo de ~36.000 millones de parámetros en estaciones de trabajo con una sola GPU de gama alta.
- Base para fine-tuning ligero o adaptadores: aunque el artefacto está pensado para inferencia, puede servir como punto de partida para evaluar adaptadores sobre pesos GPTQ en flujos compatibles con PEFT.
- Investigación sobre derivaciones de tensores cuantizados: el campo `Inverse` documenta cómo dividir `gate_up_proj` en `gate_proj` y `up_proj`, útil para reproducir o auditar la transformación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni de calidad (sin KL-divergence, accuracy ni perplexity), y que la validación se gestiona internamente por Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 22,9 GB en safetensors, por lo que se necesita al menos esa cantidad de VRAM más overhead de activaciones, KV cache y buffers del runtime.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, encajaría en GPUs de 24 GB (RTX 4090, L4) solo con margen ajustado, y con más holgura en A100 40/80 GB, H100 y L40S.
- ¿Cabe en consumer GPU?: probablemente en RTX 4090 (24 GB) con contexto corto y sin margen amplio; en GPUs de 16 GB o menos no es viable con esta cuantización.
- Opciones de despliegue: `transformers` con kernels GPTQ compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados para este artefacto en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq-fused | 35.951.822.704 | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible | BF16/FP16 original | Apache 2.0 | Hugging Face |
| positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq (parental) | ~35B (MoE) | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal entre el artefacto parental y este es el layout de los tensores gate/up fusionados, sin recuantización.

## Limitaciones y advertencias

- No se publican métricas de calidad: no hay KL-divergence, accuracy ni perplexity, por lo que no se puede garantizar que la cuantización preserve el rendimiento del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada específica para este artefacto.
- Sesgos conocidos: no disponible; dependen del dataset de entrenamiento del modelo base, no documentado aquí.
- Limitaciones de contexto e idioma: no disponible; la longitud de contexto e idiomas soportados no se declaran en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que las restricciones del modelo original siguen aplicándose; conviene revisar la licencia del modelo base.
- Advertencia de derivación: el artefacto es una reordenación sin pérdida del parental; cualquier problema de calidad del parental se hereda.
- Compatibilidad de runtime: el formato GPTQ requiere kernels específicos; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- MoE y memoria: aunque los parámetros activos por token pueden ser menores, el repositorio completo debe residir en memoria o mapearse, lo que condiciona los requisitos de VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq-fused
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Artefacto parental: https://huggingface.co/positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
