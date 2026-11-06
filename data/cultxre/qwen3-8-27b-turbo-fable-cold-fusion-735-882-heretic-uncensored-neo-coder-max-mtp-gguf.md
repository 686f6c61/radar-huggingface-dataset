# Cultxre/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Cultxre/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF de un fine-tune comunitario derivado de la familia Qwen3. El modelo base declarado es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un merge multi-etapa orientado a razonamiento, escritura creativa, rol y código, con las capas de alineación de seguridad eliminadas (técnica conocida como *abliteration* o "heretic"). El autor de esta ficha de cuantización es el usuario Cultxre, que publica tanto quants GGUF regulares como variantes MTP (multi-token prediction).

El modelo cuenta con 26.895.998.464 parámetros (~26,9 mil millones) según los safetensors del repo base, lo que lo sitúa en la gama de 27B que da nombre al proyecto. El repositorio ocupa 389 GB, coherente con la publicación de múltiples niveles de cuantización (desde bfloat16 hasta Q2/Q3) más las variantes MTP. La pipeline declarada es `image-text-to-text`, aunque no hay evidencia en la información disponible de que el modelo procese imágenes: probablemente se herede de la arquitectura Qwen3-VL o sea un error de etiquetado del autor.

Su relevancia es doble: por un lado, ofrece una alternativa "sin censura" para tareas creativas y de rol que los modelos alineados rechazan; por otro, el etiquetado como NEO-CODER-MAX y la inclusión de variantes MTP apuntan a un uso en generación de código y decodificación especulativa. La licencia es Apache 2.0, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags qwen3_5/qwen3_6/qwen3_8); detalles exactos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3 suele soportar contextos largos, pero no se confirma aquí) |
| Tipos de cuantizacion | GGUF en múltiples niveles; el repo incluye variantes "Regular GGUF Quants" y "MTP GGUF Quants"; niveles concretos (Q2_K a Q8_0, bf16) no detallados en la información disponible |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con carpeta safetensors del modelo base; el repo de cuantización es GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3, con ~26,9 B de parámetros. El nombre del modelo base encadena varias etapas: "TURBO", "Fable", "Cold Fusion", "735-882", "Heretic", "Uncensored", "NM-DAU", lo que sugiere un pipeline de merges multi-etapa (multi-stage merge / multi-state merge, según los tags) sobre checkpoints Qwen3 de distintas versiones (qwen3_5, qwen3_6, qwen3_8). El tag `bfloat16` indica que el modelo base se publicó en bf16, y `imatrix` que las cuantizaciones GGUF se generaron con matrices de importancia para preservar calidad en bits bajos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. Los datasets referenciados en los tags (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets) parecen ser conjuntos de datos de instrucción estrictos usados en el fine-tune, pero su contenido no está detallado. La etiqueta "heretic" y "abliterated" indica que se eliminó la dirección de rechazo en el espacio de activaciones, lo que produce un modelo que no se niega a generar contenido sensible. La variante MTP (multi-token prediction) sugiere que se entrenó o adaptó una cabeza adicional para predecir varios tokens por paso, lo que habilita decodificación especulativa y aumenta el throughput en inferencia.

## Capacidades

- Generación de texto general, conversación multi-turno y razonamiento (tags `thinking`, `reasoning`).
- Modo de pensamiento explícito (thinking mode), heredado de Qwen3.
- Generación de código (tag `coder`, sufijo NEO-CODER-MAX), incluyendo posible soporte de tool calling, aunque no confirmado en la información disponible.
- Escritura creativa en múltiples géneros: ficción, relato, rol (tags `creative`, `creative writing`, `story`, `fiction`, `roleplaying`).
- Capacidades multilingües limitadas a inglés y chino.
- Sin censura: no aplica rechazos de seguridad (tag `uncensored`, `abliterated`, `heretic`).
- Posible procesamiento de imagen-texto según pipeline declarada (`image-text-to-text`), pero sin confirmación ni documentación en la información disponible.
- Soporte de decodificación multi-token (MTP) en las variantes GGUF etiquetadas como MTP.

## Casos de uso

- Escritura creativa y narrativa: el modelo está afinado específicamente para ficción y relato, por lo que puede generar cuentos, novelas por capítulos y diálogos con coherencia de estilo a lo largo de contextos largos (si el contexto real lo permite; no confirmado).
- Roleplay y personajes: útil para chatbots de rol sin restricciones temáticas, donde los modelos alineados rechazan escenas violentas o adultas.
- Generación de código en local: las variantes GGUF permiten ejecutarlo con llama.cpp u Ollama en estaciones de trabajo, integrándose en editores o pipelines de CI/CD para autocompletado y generación de tests.
- Asistencia técnica sin filtros: para documentación interna o análisis de seguridad ofensivo donde un modelo censurado bloquearía la respuesta.
- Prototipado de agentes con decodificación especulativa: las variantes MTP permiten acelerar la inferencia en servidores con vLLM o llama.cpp, reduciendo latencia en bucles multi-step.
- Investigación sobre alineación y abliteration: sirve como caso de estudio de cómo el borrado de la dirección de rechazo afecta al comportamiento y a los benchmarks de seguridad.
- Despliegue en hardware de consumo: al publicarse en GGUF con cuantizaciones bajas, puede correr en GPUs de 24 GB o incluso en configuraciones con offload a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~54 GB en bf16 (2 bytes/param × 26,9 B); ~27 GB en Q8_0; ~16-18 GB en Q4_K_M; ~10-12 GB en Q2_K. Cifras estimadas a partir del número de parámetros, no verificadas en la información disponible.
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4; GPUs de 12 GB solo con cuantizaciones muy bajas o offload parcial.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4-Q5, y en RTX 4060 Ti 16 GB con Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para las variantes MTP y bf16), TGI (si se convierte a safetensors). El tag `endpoints_compatible` sugiere compatibilidad con la API de Hugging Face Endpoints.
- Latencia y throughput: no disponibles. Las variantes MTP deberían mejorar el throughput frente a las regulares, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cultxre/Qwen3.8-27B-...-MTP-GGUF | ~26,9 B | no disponible | Apache 2.0 | Gated en HF | Fine-tune sin censura, GGUF, MTP |
| Qwen3-32B (oficial) | 32,8 B | 128K (según documentación oficial de Qwen3) | Apache 2.0 | Abierto | Alineado, sin capacidades de rol sin filtros |
| Qwen3-30B-A3B (oficial, MoE) | 30,5 B totales / 3,3 B activos | 128K | Apache 2.0 | Abierto | Mucho más rápido en inferencia, alineado |
| Gemma 2 27B | 27 B | 8K | Gemma license | Abierto con condiciones | Alternativa densa de tamaño similar, alineada |

La comparación con los oficiales es aproximada: este modelo es un merge comunitario no validado por Alibaba, con contexto no confirmado y sin benchmarks publicados. Frente a Qwen3-32B, pierde en tamaño y probablemente en calidad de razonamiento, pero gana en libertad creativa y en disponibilidad de cuantizaciones GGUF con MTP.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente al modelo base o a Qwen3 oficial.
- Sesgos desconocidos: al ser un merge comunitario sin documentación de datos, los sesgos de entrenamiento no están caracterizados.
- Riesgo de alucinación: alto en un modelo de 27B sin validación; especialmente en código y datos factuales.
- Idiomas: solo inglés y chino; el castellano no está soportado oficialmente y su rendimiento será degradado.
- Sin censura: puede generar contenido violento, sexual o ilegal; no apto para producción orientada al público sin filtros externos.
- Licencia Apache 2.0 declarada, pero el acceso es gated y el modelo base es un merge de terceros: la cadena de licencias no está verificada.
- Contexto no confirmado: no se puede asumir ventana larga sin probarlo.
- El tag `image-text-to-text` no está respaldado por documentación; no asumir capacidades de visión.
- Repo de 389 GB: descarga costosa; conviene elegir un único quant.
- Modelo creado en 2026-10-31 con 44 descargas y 0 likes: sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Cultxre/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Qwen3 (familia oficial): https://huggingface.co/Qwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
