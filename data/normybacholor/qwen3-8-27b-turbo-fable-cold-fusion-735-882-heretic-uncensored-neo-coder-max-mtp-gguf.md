# Normybacholor/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
Este repositorio contiene una familia de cuantizaciones GGUF de un fine-tune multi-etapa sobre un modelo base de la familia Qwen de 27B (identificado en la model card como Qwen3.8-27B), publicado por el usuario Normybacholor a partir del trabajo de DavidAU. El modelo original se presenta como un tune orientado a razonamiento, generación de código y escritura creativa, con reducción drástica de los tokens de pensamiento (entre la mitad y una décima parte según el autor) manteniendo la calidad de salida. La variante "Heretic/Uncensored/Abliterated" indica que se han aplicado técnicas de eliminación de rechazos y alineamiento reducido.

El interés técnico inmediato está en el pipeline declarado `image-text-to-text` y en las etiquetas de razonamiento multimodal, aunque la model card no documenta la torre visual ni los datos multimodales empleados. El repositorio incluye cuantizaciones "regulares" y "MTP" (multi-token prediction) generadas con imatrix dual, lo que apunta a un uso en hardware de consumo mediante llama.cpp u Ollama.

Conviene tratar la información con cautela: las afirmaciones de rendimiento de la model card (superación de ARC-C 735 en 8 bits y 719 en 4 bits, superioridad en siete benchmarks frente a Qwen 3.8 27B, 3.6 27B, 3.5 27B y 3.6-35B-A3B) no van acompañadas de metodología reproducible ni de resultados por benchmark en la información disponible. El repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3; detalles de capas y atención no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B, dato de safetensors) |
| Parametros activos | no disponible (no se declara MoE; el nombre "27B" sugiere modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (Q4_K_S citado como ejemplo); variantes "regulares" y "MTP", con y sin imatrix dual |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples cuantizaciones); el base se distribuye en bfloat16 |

## Arquitectura y entrenamiento
La model card describe el proceso como un fine-tune multi-etapa, multi-modelo y multi-merge sobre un base de 27B de la familia Qwen. Se citan dos metodologías propietarias del autor: "COLD FUSION" (combinación de un componente propio llamado GAIN con los entrenadores de Unsloth, donde GAIN modifica dinámicamente el entrenamiento por muestra en tiempo real) y "Fable Fusion 711". Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el número de tokens de entrenamiento, la composición del corpus, ni si hubo RLHF o DPO.

Las innovaciones declaradas son la reducción del bloque de pensamiento (mediana de dos tercios, hasta una décima parte), la reformateación del mismo para los tres modos de operación (thinking, reasoning y uso general), y la inclusión de variantes MTP para acelerar la generación. La etiqueta `image-text-to-text` implica capacidades de entrada de imagen, pero no hay documentación de la arquitectura multimodal, del proyector visual ni de los datos de visión. Tampoco se detalla la técnica de abliteration aplicada para eliminar rechazos.

## Capacidades
- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito con modo de pensamiento ("thinking") y modo de razonamiento, con bloques de pensamiento acortados respecto al base.
- Generación de código, con etiquetas específicas de "coder" y un sufijo "NEO-CODER" en el nombre.
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying.
- Entrada de imagen según el pipeline declarado (`image-text-to-text`), sin documentación adicional.
- Tool calling y function calling: la model card remite a la pestaña "community" para resultados de terceros, sin datos verificables en la información disponible.
- Uso como agente y razonamiento multi-paso: declarado de forma genérica mediante las etiquetas "all use cases" y "agents", sin detalles.
- Multilingüismo limitado a inglés y chino según el campo `language`.

## Casos de uso
- Asistente de escritura creativa y narrativa: el tune está explícitamente orientado a ficción y roleplaying, con ejemplos en la model card de generación de hooks narrativos y diálogo; adecuado para herramientas de apoyo a autores que necesiten borradores rápidos con estilo marcado.
- Generación de código en local: las cuantizaciones de 4 bits permiten ejecutar el modelo en una estación de trabajo con GPU de consumo, integrándolo en editores o pipelines de revisión de código sin enviar el código a un servicio externo.
- Chat de rol y simulación de personajes: la eliminación de rechazos y el enfoque en ficción lo hacen apto para motores de roleplaying y videojuegos narrativos, aunque requiere moderación propia por parte del operador.
- Reducción de coste de inferencia en razonamiento: al recortar los tokens de pensamiento entre la mitad y una décima parte, resulta útil en tareas de clasificación o extracción donde el razonamiento extenso del base encarece la factura de tokens.
- Despliegue en hardware de consumo con llama.cpp u Ollama: la disponibilidad de GGUF en 4 y 8 bits con imatrix permite servir el modelo en una sola GPU de 24 GB en 4 bits, algo inviable con el base en bfloat16.
- Prototipado de asistentes bilingües inglés-chino: para equipos que trabajen con ambos idiomas y necesiten un modelo local sin dependencia de API externa.
- Experimentación en investigación sobre abliteration y tuning multi-etapa: el repositorio documenta una cadena de merges y tunes que puede servir como caso de estudio, aunque sin métricas reproducibles.

## Benchmarks y rendimiento
La model card afirma superar ARC-C 735 en 8 bits y 719 en 4 bits, y superar el base Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.5 27B y Qwen 3.6-35B-A3B en siete benchmarks, pero no se presentan tablas con los valores por benchmark ni la metodología de evaluación. No se han publicado resultados de benchmarks verificables en la información disponible.

| Benchmark | Resultado declarado | Fuente |
|---|---|---|
| ARC-C (8 bits) | 735 | Model card, sin metodología |
| ARC-C (4 bits) | 719 | Model card, sin metodología |
| Resto de benchmarks | "supera al base en 7 benchmarks" | Model card, sin cifras |

## Requisitos de hardware
- VRAM estimada: en bfloat16 el modelo de ~26,9B requiere aproximadamente 54 GB solo para pesos, más KV cache; en GGUF Q4_K_S se estima en torno a 15-16 GB de pesos, y en Q8 en torno a 28-29 GB.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits; configuraciones de 48 GB (A6000, RTX 6000 Ada) para 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en una RTX 4090 o 3090 de 24 GB con contexto moderado; en 8 bits no cabe en 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI requieren pesos en safetensors o conversión, no incluidos en este repo; el autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles; el autor afirma mejoras de velocidad por las variantes MTP y la reducción de tokens de pensamiento, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic NEO-CODER) | ~26,9B | no disponible | apache-2.0 | GGUF | Tune multi-etapa con abliteration; sin benchmarks verificables |
| Qwen 3.8 27B (base declarado) | ~27B | no disponible | no disponible | safetensors | Referencia del autor; el tune afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | no disponible | no disponible | Citado como comparación en la model card |
| Qwen 3.6-35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | no disponible | MoE citado como comparación; no se aportan cifras |

## Limitaciones y advertencias
- Las afirmaciones de rendimiento de la model card no son reproducibles: no hay tablas por benchmark, ni scripts de evaluación, ni resultados de terceros enlazados en la información disponible.
- El modelo está abliterado y etiquetado como "uncensored": puede generar contenido sensible, ofensivo o ilegal sin rechazo; requiere filtros y moderación propios en cualquier despliegue público.
- Riesgo elevado de alucinación en datos factuales, agravado por el recorte de tokens de pensamiento que reduce la deliberación interna.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- La licencia apache-2.0 se declara en el repo, pero el modelo base y los datasets de origen pueden tener condiciones adicionales que conviene verificar antes de un uso comercial.
- El pipeline declarado `image-text-to-text` no está respaldado por documentación de la torre visual ni de los datos multimodales; no debe asumirse un rendimiento multimodal fiable.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en producción ni validación independiente.
- El nombre comercial acumula etiquetas de marketing ("TURBO", "MAX", "NEO", "735-882") que no se corresponden con una ficha técnica verificable.
- Tamaño del repo de 389 GB: la descarga completa es costosa; conviene descargar solo el archivo GGUF de la cuantización deseada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Normybacholor/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio de referencia del método COLD FUSION: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
