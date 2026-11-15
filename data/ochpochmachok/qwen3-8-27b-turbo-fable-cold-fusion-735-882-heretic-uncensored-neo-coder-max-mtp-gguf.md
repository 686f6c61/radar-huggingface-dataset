# ochpochmachok/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario ochpochmachok a partir del fine-tune de DavidAU sobre una base de la familia Qwen 3.8 de 27B. El modelo resultante es un ajuste fino multietapa orientado a razonamiento, código y escritura creativa, con las capas de rechazo ("abliterated"/"heretic") eliminadas y con una reducción agresiva de los tokens de pensamiento respecto al modelo base. El repositorio incluye tanto cuantizaciones GGUF "regulares" como variantes MTP (multi-token prediction) generadas con imatrix doble.

El modelo declara 26.895.998.464 parámetros totales (un transformer denso de ~27B), licencia Apache 2.0 y soporte para 16 idiomas, entre ellos el castellano. Su propuesta de valor es ofrecer un modelo de razonamiento y generación de alta calidad ejecutable en hardware de consumo, con un consumo de tokens de pensamiento entre la mitad y una décima parte del modelo original según el autor.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo extremo de la cultura de fine-tunes comunitarios sobre Qwen; por otro, advierte de que las afirmaciones de rendimiento del autor (superación de benchmarks tipo ARC-C, comparaciones con modelos propietarios) no están verificadas de forma independiente y deben tratarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen 3.8 27B), ajuste fino multietapa; pipeline declarado image-text-to-text |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en varias precisiones (4-bit y 8-bit citadas por el autor; Q4KS mencionada); variantes "regulares" y "MTP" con imatrix doble |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de un transformer denso de aproximadamente 27B parámetros de la familia Qwen 3.8, sobre el que DavidAU aplica un pipeline de ajuste fino multietapa ("multi-stage tuned", "multi-state-merge") denominado por el autor como métodos "Cold Fusion" y "Fable Fusion 711". El entrenamiento se realizó, según la model card, con Unsloth sobre hardware de consumo, y utiliza los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación declarada principal es la reducción del "thinking" (tokens de razonamiento intermedios) entre un 50% y un 90% respecto al modelo base, manteniendo —según el autor— la calidad de salida. El repositorio ofrece además cuantizaciones MTP (multi-token prediction), una técnica de decodificación especulativa que acelera la generación. Las capas de alineación de seguridad han sido eliminadas ("heretic", "abliterated", "uncensored"), lo que cambia sustancialmente el comportamiento del modelo frente a la base original. No hay información verificable sobre la metodología exacta de ablación ni sobre evaluación independiente del pipeline.

## Capacidades

- Generación de texto general, razonamiento y "thinking mode" con control del volumen de tokens de pensamiento.
- Generación de código y tareas de programación (etiquetas "coder", "NEO-CODER").
- Escritura creativa, ficción, narrativa y roleplaying en múltiples géneros.
- Capacidades multimodales declaradas por el pipeline image-text-to-text y la etiqueta image-text-to-text; no se detalla el alcance exacto de la visión en la información disponible.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Tool calling / function calling: el autor afirma en la model card un rendimiento destacado en esta área, sin datos verificables.
- Uso como modelo base para agentes y razonamiento multi-paso (declarado "all use cases").
- Modo sin censura: el modelo no aplica rechazos de alineación estándar.

## Casos de uso

- Generación de código en pipelines de desarrollo: el modelo puede integrarse como asistente de programación en editores o CI/CD, con cuantizaciones 4-bit ejecutables en GPU de consumo; su orientación "coder" y el bajo consumo de tokens de pensamiento reducen la latencia frente al base.
- Escritura creativa y narrativa larga: adecuado para generar ficción, guiones y roleplaying con estilo consistente, gracias al ajuste específico en escritura creativa y a la ausencia de filtros de contenido.
- Prototipado de agentes con tool calling: puede usarse como motor de decisión en agentes que invocan APIs, aunque la fiabilidad del tool calling debe validarse empíricamente antes de producción.
- Asistencia conversacional multilingüe: cubre 16 idiomas, lo que permite desplegar un chatbot en español, inglés, francés, alemán, etc., con una sola instancia.
- Investigación sobre alineación y seguridad: al ser un modelo "abliterated", sirve como caso de estudio para medir el efecto de la eliminación de capas de rechazo en el comportamiento.
- Inferencia local en estaciones de trabajo: las cuantizaciones GGUF 4-bit permiten ejecutar el modelo en GPUs consumer de 24 GB (por ejemplo, RTX 4090) con llama.cpp u Ollama, útil para desarrollo offline y privacidad de datos.
- Generación de contenido para videojuegos y narrativa interactiva: diálogos de NPC y tramas ramificadas con contexto conversacional mantenido.

## Benchmarks y rendimiento

El autor afirma en la model card resultados de ARC-C de 735 en 8-bit y 719 en 4-bit, y ARC-E superior a 880, así como la superación de siete benchmarks críticos frente a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B. No se han publicado en la información disponible tablas detalladas con MMLU, HumanEval, GSM8K ni resultados verificables de forma independiente; las cifras citadas proceden únicamente del autor y no deben considerarse contrastadas.

| Benchmark | Resultado declarado | Fuente |
|---|---|---|
| ARC-C (8-bit) | 735 | Model card del autor (no verificado) |
| ARC-C (4-bit) | 719 | Model card del autor (no verificado) |
| ARC-E | >880 | Model card del autor (no verificado) |
| MMLU, HumanEval, GSM8K | No disponible | — |

## Requisitos de hardware

- VRAM estimada: ~14-16 GB para cuantización 4-bit (Q4), ~28-30 GB para 8-bit (Q8), ~54 GB en bf16/fp16 (26,9B parámetros).
- GPU recomendadas: RTX 4090 (24 GB) para 4-bit; A100 40 GB o H100 para 8-bit; configuraciones multi-GPU para precisión completa.
- Cabe en GPU consumer: sí, en 4-bit en tarjetas de 16-24 GB (RTX 4080/4090, RTX 3090); en 8-bit requiere 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI; las variantes MTP pueden aprovechar decodificación especulativa en motores compatibles.
- Latencia y throughput: no disponibles; el autor afirma reducción de tokens de pensamiento de 2x a 10x, lo que en la práctica reduce el tiempo hasta la primera respuesta completa, pero no se aportan cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (GGUF de Qwen3.8-27B fine-tune) | ~26,9B densos | No disponible | Apache 2.0 | Fine-tune comunitario sin censura, orientado a razonamiento/código/creatividad |
| Qwen 3.8 27B (base) | ~27B | No disponible | Apache 2.0 (según base) | Modelo original sin ajuste; mayor consumo de tokens de pensamiento según el autor |
| Qwen 3.6 27B | ~27B | No disponible | Apache 2.0 (según base) | Generación anterior de la familia; el autor afirma que este fine-tune lo supera en 7 benchmarks (no verificado) |
| Qwen 3.6-35B-A3B | 35B totales / 3B activos (MoE) | No disponible | Apache 2.0 (según base) | Alternativa MoE más eficiente en inferencia; comparación declarada por el autor, no verificada |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica rechazos de seguridad estándar; puede generar contenido dañino, ilegal o sexualmente explícito sin filtro. No apto para aplicaciones dirigidas al público general sin moderación externa.
- Riesgo elevado de alucinación: los fine-tunes comunitarios agresivos suelen degradar la fidelidad factual; no hay evaluación independiente de veracidad.
- Las afirmaciones de rendimiento (ARC-C 735, superación de benchmarks, "tool calling más fuerte registrado") proceden exclusivamente del autor y no están verificadas.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin comprobarla.
- El pipeline declarado image-text-to-text sugiere capacidades multimodales, pero no se detalla el alcance ni la fiabilidad de la visión.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las obligaciones de transparencia aplicables (por ejemplo, el AI Act en la UE).
- Repositorio de 389 GB con múltiples cuantizaciones: conviene descargar solo el archivo GGUF necesario.
- Sin descargas ni likes en el momento de la ficha: ecosistema de validación prácticamente inexistente; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/ochpochmachok/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
