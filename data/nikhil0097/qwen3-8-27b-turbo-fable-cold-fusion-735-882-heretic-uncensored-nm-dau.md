# Nikhil0097/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario Nikhil0097 en Hugging Face. El modelo se distribuye con licencia Apache 2.0, arquitectura basada en Qwen 3.5/3.8 (tag `qwen3_5`), pipeline `image-text-to-text` y un total de 27.781.427.952 parámetros en formato safetensors, con un repositorio de 55,6 GB.

Según la model card, se trata de una variante "uncensored" y "herética" construida mediante un proceso de ajuste en varias etapas (multi-stage tuning) que el autor denomina "Cold Fusion" y "GAIN Training", apoyado en la herramienta unsloth. La model card menciona tres etapas y varias ramas (branches) del proyecto, con generaciones de ejemplo extraídas de STAGE1-PART2, STAGE1b-PART2 y STAGE2-rplus2.

La relevancia del modelo es limitada desde el punto de vista de la evaluación técnica: no se han publicado resultados de benchmarks verificables en la información disponible, el repositorio no registra descargas ni "likes" en el momento de la consulta, y buena parte de la model card remite a otros repositorios del autor original (DavidAU) en lugar de documentar este artefacto concreto. Es, por tanto, un modelo a considerar únicamente con cautela y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5/3.8 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; la model card remite a GGUF de otro repositorio (DavidAU) con cuantizaciones NEO-CODER MAX DiMatrix |
| Idiomas soportados | en (inglés) según metadatos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.8-27B, que los tags identifican como familia `qwen3_5`. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora componentes MoE; la model card no documenta estos aspectos para este repositorio concreto.

En cuanto al entrenamiento, la model card describe un proceso de ajuste en varias etapas ("Multi-stage tuning", "Cold Fusion", "GAIN Training") realizado con unsloth, con una fase previa a cargo de "Nightmedia" en las tres primeras etapas y un post-procesado "herético" posterior. Se menciona el uso de varios fine-tunes del autor original, propios y de terceros, cuyos detalles completos se prometen para la "versión final". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o algún método de alineación concreto. Tampoco se documentan innovaciones técnicas verificables como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado y el tag `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que sugiere capacidad multimodal de entrada imagen + texto, aunque no se detalla el alcance.
- Modo "uncensored": el ajuste busca reducir los filtros de rechazo del modelo base, según la model card.
- Herencia de las capacidades del modelo base Qwen3.8-27B (razonamiento, código, matemáticas), si bien no se aportan evaluaciones que lo confirmen para este fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; la model card menciona "reasoning modes" en repositorios hermanos, no en este.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Generación de texto creativo en inglés: el ajuste "uncensored" está orientado a reducir rechazos en prompts creativos o de ficción; adecuado para prototipos de escritura asistida donde el modelo base resultaría demasiado restrictivo.
- Experimentación en investigación sobre alineación y censura: permite comparar el comportamiento del modelo base frente a la variante "herética" en tareas de evaluación de sesgos y rechazos.
- Procesamiento imagen-texto en prototipos: al declarar pipeline `image-text-to-text`, puede emplearse para descripción de imágenes o respuesta a preguntas visuales, siempre que se valide su calidad real, no documentada.
- Fine-tuning posterior como base: al estar en safetensors y con licencia Apache 2.0, sirve como punto de partida para ajustes propios con transformers y unsloth.
- Generación de código en entornos controlados: si hereda las capacidades del Qwen3.8-27B base, podría usarse para autocompletado o generación de scripts, aunque sin benchmarks que lo respalden.
- Despliegue local en investigación: con 27,8B parámetros y pesos safetensors de 55,6 GB, es viable en una GPU de 80 GB (A100/H100) en BF16, o cuantizado en GPUs de menor VRAM mediante conversión a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. La model card incluye afirmaciones cualitativas sobre otras variantes del proyecto (por ejemplo, "exceeds Qwen 3.8/3.6 specs" para una rama distinta), pero no aporta tablas de MMLU, HumanEval, GSM8K ni métricas comparables para este modelo concreto.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere una GPU de 80 GB (A100 80GB, H100 80GB) para inferencia cómoda.
- Cuantización a 8 bits: en torno a 28-30 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o descarga parcial a CPU.
- Cuantización a 4 bits: en torno a 14-16 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16-24 GB, con pérdida de calidad no evaluada.
- Despliegue: transformers (formato nativo del repo); para GGUF y llama.cpp/Ollama la model card remite a repositorios externos del autor original (DavidAU), no incluidos aquí.
- vLLM y TGI: no se documenta compatibilidad explícita; la arquitectura Qwen suele ser soportada, pero requeriría validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Nikhil0097/Qwen3.8-27B-...-Heretic-Uncensored) | 27,8B | no disponible | Apache 2.0 | Hugging Face, safetensors | Fine-tune "uncensored" sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | 27B (aprox.) | no disponible | no disponible | Hugging Face | Modelo original; referencia de calidad y alineación |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | 27B (aprox.) | no disponible | no disponible | Hugging Face (GGUF) | Repositorio GGUF del autor original citado en la model card |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27B (aprox.) | no disponible | no disponible | Hugging Face | Variante "release #2" del mismo proyecto, con modos de razonamiento conmutables |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el fine-tune mantenga o mejore las capacidades del modelo base.
- Riesgo elevado de degradación por sobreajuste: el proceso multi-etapa sobre múltiples fine-tunes sin documentación de datos aumenta la probabilidad de regresiones no detectadas.
- El ajuste "uncensored"/"herético" elimina o reduce filtros de seguridad, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado; no es apto para producción orientada al público sin moderación adicional.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin validación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener condiciones adicionales que deben verificarse en su repositorio original.
- Repositorio sin tracción (0 descargas, 0 likes) y con model card que remite mayoritariamente a otros repositorios: la procedencia y reproducibilidad del ajuste no están garantizadas.
- La model card incluye enlaces y afirmaciones promocionales sobre ramas futuras; no deben tomarse como especificaciones de este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nikhil0097/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF release #1 (autor original): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Release #2 (TWIN-TURBO): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- GGUF release #2: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Rama "Ultra Heretic": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Rama 3 ("from scratch"): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Perfil del autor original: https://huggingface.co/DavidAU
