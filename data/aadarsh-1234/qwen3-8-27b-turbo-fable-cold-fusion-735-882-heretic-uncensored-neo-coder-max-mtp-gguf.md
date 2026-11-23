# AADARSH-1234/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B publicado por el usuario AADARSH-1234 sobre el modelo base de DavidAU. Se distribuye exclusivamente en formato GGUF (cuantizaciones regulares e imatrix, incluyendo variantes MTP) y está pensado para inferencia en hardware de consumo mediante llama.cpp y derivados. El modelo combina un ajuste fino multietapa con una fusión de pesos ("Cold Fusion" y "Fable Fusion") orientada a reducir el consumo de tokens de razonamiento manteniendo la calidad de salida.

La propuesta central es un modo de razonamiento "TURBO" que, según el autor, reduce los tokens de pensamiento entre un 50 % y un 90 % respecto al Qwen 3.8 27B estándar, manteniendo el detalle de la respuesta. El modelo ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) y se presenta como "uncensored" y "heretic", lo que implica que no aplica las salvaguardas de alineamiento del modelo original.

Con 26.895.998.464 parámetros reales (aproximadamente 27B), licencia Apache 2.0 y soporte declarado para 16 idiomas, se posiciona como una alternativa para generación creativa, roleplay y código en local. El repositorio ocupa 389 GB e incluye múltiples cuantizaciones, lo que facilita su despliegue en GPUs de consumo. No obstante, las afirmaciones de rendimiento del autor (superación de ARC-C 735) no están respaldadas por evaluaciones independientes verificables en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.8); detalles específicos no disponibles |
| Parámetros totales | 26.895.998.464 (≈27B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF regulares e imatrix (DI-MATRIX, doble imatrix); variantes MTP; se mencionan Q4KS, 4 bit y 8 bit |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only heredada de Qwen 3.8 27B. El autor describe un proceso de "multi-stage tune" y "multi-state merge" que combina ajuste fino supervisado con fusión de pesos entre etapas, empleando los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El entrenamiento se realizó con Unsloth, según los tags del repositorio, y el resultado se exportó a bfloat16 antes de generar las cuantizaciones GGUF.

La innovación declarada es el modo "TURBO", que según el autor recorta drásticamente los tokens de razonamiento (entre 1/2 y 1/10) manteniendo el detalle de salida. También se mencionan los métodos "Cold Fusion" y "Fable Fusion 711" como técnicas de entrenamiento, aunque no se documentan detalles técnicos de los mismos. El proceso de "abliteration" elimina los mecanismos de rechazo del modelo base, y las cuantizaciones emplean doble imatrix ("DI-MATRIX") para preservar calidad en 4 y 8 bits. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto general, con énfasis declarado en escritura creativa, ficción, narrativa y roleplay.
- Razonamiento con modo "thinking" explícito, optimizado para reducir tokens de pensamiento.
- Generación de código (etiqueta "coder" y "NEO-CODER" en el nombre).
- Capacidades multimodales declaradas: el pipeline es image-text-to-text y los tags incluyen "image-text-to-text".
- Soporte multilingüe para 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Tool calling / function calling: el autor afirma en la model card un rendimiento destacado en tool calling, sin datos verificables.
- Modo "uncensored": sin rechazos por contenido, tras el proceso de abliteration.
- Formato GGUF con variantes MTP (multi-token prediction) para decodificación especulativa.

## Casos de uso

- Escritura creativa y narrativa: el ajuste está orientado explícitamente a ficción, cuentos y todos los géneros; el modo TURBO reduce la latencia al evitar cadenas de razonamiento largas antes de empezar a escribir.
- Roleplay y personajes conversacionales: la abliteration elimina rechazos, lo que permite mantener personajes y tramas sin interrupciones por filtros de contenido; adecuado para prototipos de chatbots de rol.
- Generación de código en local: la etiqueta "coder" y el soporte de tool calling permiten integrarlo en asistentes de programación autoalojados con llama.cpp u Ollama, sin depender de APIs externas.
- Asistencia a la escritura técnica y de marketing: con 27B parámetros y contexto multilingüe, puede redactar y reescribir textos en español y otros 15 idiomas en flujos de edición por lotes.
- Investigación sobre alineamiento y seguridad: al ser un modelo abliterated, sirve como caso de estudio para evaluar qué capacidades y sesgos emergen al eliminar los rechazos, en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones Q4 permiten ejecutar el modelo en GPUs de 24 GB (RTX 3090/4090) o en configuraciones con RAM+GPU, útil para demos y prototipos sin infraestructura de datacenter.
- Traducción y generación multilingüe: cobertura declarada de 16 idiomas para tareas de traducción y localización en pipelines automatizados.

## Benchmarks y rendimiento

El autor declara resultados en ARC-C y ARC-E, pero no se proporcionan tablas numéricas completas ni metodología verificable en la información disponible. Los datos citados en la model card son:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bit) | 735 | Afirmación del autor; sin verificación independiente |
| ARC-C (4 bit) | 719 | Afirmación del autor; sin verificación independiente |
| ARC-E (8 bit) | >880 | Afirmación del autor; sin verificación independiente |
| Comparación con Qwen 3.8 27B | Superior en 7 benchmarks críticos (según autor) | Sin datos numéricos por benchmark |
| Comparación con Qwen 3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | Superior en 7 benchmarks (según autor) | Sin datos numéricos por benchmark |

No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y deben tratarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en Q4 (4 bit), 28-30 GB en Q8 (8 bit) para los 27B parámetros; el repositorio completo ocupa 389 GB por incluir múltiples cuantizaciones.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4; A100 40/80 GB, H100 o RTX 6000 Ada para Q8 y contextos largos.
- Cabe en GPU de consumo: sí, en Q4 con RTX 3090/4090 (24 GB); en Q8 requiere 32 GB o más, por lo que no cabe en GPUs de consumo estándar.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. Para vLLM o TGI se requeriría el modelo en safetensors, no incluido en este repo.
- Latencia y throughput: no disponibles. El modo TURBO reduce tokens de pensamiento, lo que en teoría disminuye la latencia percibida, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | ≈27B | no disponible | Apache 2.0 | GGUF | Fine-tune abliterated con modo TURBO; sin benchmarks independientes |
| Qwen 3.8 27B (base) | ≈27B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo original sin abliteration; referencia del autor |
| Qwen 3.6 27B | ≈27B | no disponible | Apache 2.0 | safetensors/GGUF | Generación anterior de la familia Qwen |
| Qwen 3.6-35B-A3B | 35B (MoE, ≈3B activos) | no disponible | Apache 2.0 | safetensors/GGUF | Alternativa MoE de mayor tamaño con menos parámetros activos |

No se dispone de datos de rendimiento verificables para establecer una comparación cuantitativa fiable con estas alternativas.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o explícito; no apto para producción sin filtros externos.
- Afirmaciones de rendimiento no verificadas: los resultados de ARC-C/ARC-E proceden del autor y no hay evaluaciones independientes en la información disponible.
- Riesgo de alucinación: como todo modelo de 27B sin datos de entrenamiento documentados, puede inventar hechos, citas y referencias.
- Idiomas: aunque se declaran 16 idiomas, la calidad relativa por idioma no está documentada; el entrenamiento parece centrado en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y los posibles sesgos son responsabilidad del usuario.
- Repositorio de 389 GB: la descarga completa es costosa; conviene descargar solo el archivo GGUF de la cuantización deseada.
- Sin datos de contexto máximo: no se puede planificar el uso en tareas de contexto largo sin verificar la configuración del tokenizador y del modelo base.
- Modelo derivado de un fine-tune de terceros (DavidAU): la trazabilidad del entrenamiento y de los datasets es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AADARSH-1234/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
