# my-app-s/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B (26.895.998.464 parámetros reales según safetensors) publicado por el usuario DavidAU a través del perfil my-app-s. Se distribuye exclusivamente en formato GGUF, con cuantizaciones tanto "regulares" como "MTP" (Multi-Token Prediction), y está orientado a ejecución en hardware de consumo mediante llama.cpp y derivados. El modelo se presenta como un ajuste multietapa y multi-merge sobre una base ya modificada (DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU), con un pipeline declarado image-text-to-text.

El objetivo declarado del autor es doble: elevar las métricas de razonamiento (ARC-C y ARC-E) y, sobre todo, reducir drásticamente la longitud de los bloques de "thinking" (entre 1/2 y 1/10 de los tokens de razonamiento del Qwen 3.8 27B original), manteniendo la calidad de salida. Según la model card, es el primer fine-tune de este tamaño que supera 730 en ARC-C en 8 bits (735) y 718 en 4 bits, y 880 en ARC-E. Estas cifras proceden del propio autor y no están verificadas de forma independiente en la información disponible.

El modelo incorpora la etiqueta "heretic" y "uncensored"/"abliterated", lo que implica que se ha reducido o eliminado total o parcialmente el alineamiento de seguridad de la base. Está pensado para generación creativa, escritura de ficción, roleplay, código y casos de uso generales, con soporte declarado de inglés y chino. La licencia declarada es Apache 2.0, aunque las condiciones reales de uso derivadas de la base Qwen y de los datasets empleados no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.8 27B), con variantes MTP (Multi-Token Prediction); detalles exactos no disponibles |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: MTP GGUF Quants y Regular GGUF Quants; se menciona IQ4_XS y Q4KS; 4 bits y 8 bits citados en la model card |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples cuantizaciones); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que deriva de Qwen 3.8 27B, un transformer decoder-only, y que existen variantes con MTP (Multi-Token Prediction) para acelerar la generación. El modelo es el resultado de un proceso de "multi-stage fine tune, multi-fine tune y multi-stage merge" sobre una base ya ajustada, con soporte declarado de tres modos de funcionamiento (presumiblemente modos de thinking) y de un bloque de razonamiento reformateado.

El autor describe dos metodologías propietarias: "COLD FUSION" (combinación de un componente propio llamado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". El método GAIN, según la model card, modifica dinámicamente el entrenamiento por muestra en tiempo real durante el aprendizaje. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o etapas de alineamiento posteriores. Tampoco se detalla el proceso de "abliteration" o "heretic" aplicado para eliminar rechazos.

## Capacidades

- Generación de texto general y conversacional multi-turno.
- Razonamiento con modo "thinking" y bloques de razonamiento reducidos respecto a la base (mediana de reducción declarada de aproximadamente 2/3).
- Generación de código (etiqueta "coder" y "NEO-CODER-MAX" en el nombre).
- Escritura creativa: ficción, relatos, todos los géneros, roleplay y escritura de historias.
- Procesamiento image-text-to-text según el pipeline declarado (no se detallan capacidades de visión concretas).
- Multilingüe limitado a inglés y chino.
- Tool calling / function calling: la model card remite a la pestaña "community" para resultados de terceros que afirman "el mejor rendimiento de tool calling registrado"; no hay datos verificables en la información disponible.
- Modo MTP (Multi-Token Prediction) para acelerar la decodificación.
- Modelo "uncensored"/"abliterated": no aplica rechazos de seguridad en la generación.

## Casos de uso

- Escritura creativa y ficción: el ajuste está específicamente orientado a narrativa, hooks y diálogo; el ejemplo de la model card muestra generación de relatos con gancho en pocos tokens, adecuado para borradores rápidos de novela o guion.
- Roleplay y personajes conversacionales: la ausencia de filtros de rechazo y el estilo directo lo hacen apto para bots de rol, aunque requiere moderación externa en producción.
- Generación de código asistida: la etiqueta "coder" y el soporte de tool calling permiten integrarlo en asistentes de IDE o pipelines de revisión, siempre que se valide la calidad del código generado.
- Razonamiento con presupuesto de tokens ajustado: al reducir los tokens de thinking entre 1/2 y 1/10, encaja en aplicaciones con latencia o coste por token críticos, como agentes en tiempo real o clasificación con justificación.
- Despliegue local en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, se puede ejecutar con llama.cpp u Ollama en equipos con GPU de gama alta de consumo, útil para prototipado sin coste de API.
- Asistente de escritura bilingüe inglés-chino: para redacción y traducción entre ambos idiomas en contextos creativos o de marketing.
- Experimentación en investigación sobre alineamiento y "abliteration": sirve como caso de estudio de fine-tunes sin censura y de sus efectos en benchmarks y comportamiento.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual, sin comparación numérica con otros modelos porque no se aportan cifras de los competidores.

| Benchmark | 8 bits | 4 bits | Notas |
|---|---|---|---|
| ARC-C | 735 | 719 | Afirmación del autor; superior a Qwen 3.8 27B según la model card |
| ARC-E | 880 | no disponible | Afirmación del autor |
| Resto de benchmarks críticos (7 en total) | no disponible | no disponible | El autor afirma superar a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los 7, sin cifras |

No se han publicado resultados detallados de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27B en 4 bits ocupa aproximadamente 14-16 GB de pesos, más overhead de contexto KV; en 8 bits, en torno a 27-30 GB. Cifras estimadas, no publicadas por el autor.
- GPU recomendadas: para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes con contexto moderado; para 8 bits se recomienda A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: sí, en cuantización IQ4_XS o Q4KS en GPUs de 24 GB; en 16 GB puede requerir offload parcial a CPU o contextos reducidos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. No se confirma soporte de vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles. El autor afirma mejoras de velocidad por MTP y por la reducción de tokens de thinking, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Fable Cold Fusion) | 26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune sin censura, thinking reducido, ARC-C 735 (8 bits) según autor |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (según base) | safetensors, GGUF | Referencia del autor; métricas inferiores según la model card |
| Qwen 3.6 27B | ~27B | no disponible | Apache 2.0 (según base) | safetensors, GGUF | El autor afirma superarlo en 7 benchmarks |
| Qwen 3.5 27B | ~27B | no disponible | Apache 2.0 (según base) | safetensors, GGUF | El autor afirma superarlo en 7 benchmarks |
| Qwen 3.6-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 (según base) | safetensors, GGUF | El autor afirma superarlo en 7 benchmarks |

No se dispone de datos verificables de rendimiento de los competidores en la información proporcionada; las comparaciones son afirmaciones del autor.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica rechazos de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito; requiere moderación externa en cualquier despliegue público.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual; el énfasis en creatividad y el modo thinking abreviado pueden aumentar la generación de datos inventados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no declarada: no se puede garantizar el manejo de contextos largos.
- Los benchmarks (ARC-C 735, ARC-E 880) son afirmaciones del autor no verificadas de forma independiente y con posible sobreajuste a las métricas citadas, pese a que el autor afirma "ZERO benchmaxing".
- Licencia Apache 2.0 declarada, pero las obligaciones derivadas de la base Qwen y de los datasets de entrenamiento no se detallan; conviene revisar antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria; el modelo se apoya en la reputación del autor (DavidAU) pero esta versión concreta no tiene historial de uso.
- Nombre y etiquetas del modelo incluyen afirmaciones de marketing ("strongest ever", "zone of intelligence") que no deben tomarse como evaluación técnica.
- El repositorio ocupa 389 GB por acumulación de cuantizaciones; la descarga de una sola variante requiere seleccionar el archivo concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/my-app-s/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Repositorio del autor (mismo modelo, perfil DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Archivo GGUF IQ4_XS citado: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/blob/main/Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-LOW-MTP-IQ4_XS.gguf
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Fine-tune previo de referencia (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
