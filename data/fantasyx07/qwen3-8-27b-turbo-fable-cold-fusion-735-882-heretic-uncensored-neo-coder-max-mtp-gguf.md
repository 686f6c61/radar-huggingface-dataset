# fantasyx07/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B de parámetros, publicado por el usuario fantasyx07 y derivado del modelo de DavidAU Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se distribuye exclusivamente en formato GGUF (cuantizaciones regulares y MTP con doble imatrix) y está orientado a inferencia en hardware de consumo. El modelo combina varias técnicas de ajuste en cadena (multi-stage tune, multi-state merge) con un proceso de "abliteration" o "heretic" que elimina los mecanismos de rechazo del modelo original, dando lugar a una variante sin censura.

El objetivo declarado del autor es reducir drásticamente el consumo de tokens de razonamiento (entre la mitad y una décima parte frente a Qwen 3.8 27B estándar) manteniendo la calidad de salida, además de mejorar el rendimiento en benchmarks de razonamiento como ARC-C y ARC-E. Según la model card, es el primer fine-tune de este tamaño que supera 730 puntos en ARC-C en cuantización de 8 bits (735) y 719 en 4 bits. El modelo declara soporte para 16 idiomas, incluyendo castellano, y capacidades de texto e imagen-texto (pipeline image-text-to-text), aunque no se detalla la arquitectura de visión.

La relevancia actual reside en su propuesta de "razonamiento eficiente": un modelo de 27B que aspira a competir en la franja de inteligencia reservada a modelos cerrados (OpenAI, Claude, Gemini) con hardware de consumo, a costa de renunciar a los filtros de seguridad y de apoyarse en afirmaciones de benchmark no verificables de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8; detalles de atención no disponibles) |
| Parámetros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF regular y GGUF MTP (Neo-CODER MAX DI-MATRIX, doble imatrix); se mencionan variantes de 4 bits (Q4KS) y 8 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389,0 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer derivado de la familia Qwen 3.8, con 26,9B parámetros totales. El autor describe un proceso de entrenamiento en varias etapas ("multi-stage tune" y "multi-state merge") sobre los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, aplicado sobre el modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se mencionan los métodos de entrenamiento denominados "COLD FUSION" y "FABLE FUSION 711", así como un ajuste específico para corregir el exceso de razonamiento y el consumo excesivo de tokens. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

La innovación técnica destacada es la reducción de tokens de pensamiento ("TURBO"): según la model card, el modelo genera entre la mitad y una décima parte de los tokens de razonamiento de Qwen 3.8 27B en los tres modos de operación, manteniendo el detalle de salida. Las cuantizaciones MTP emplean una doble imatrix (DI-MATRIX) para preservar la calidad en bits bajos. No se dispone de información sobre mecanismos de atención lineal, decodificación especulativa ni detalles del tokenizador.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" y en modo directo, con tres modos de operación según la model card.
- Generación de código y tareas de programación (etiquetas "coder" y "NEO-CODER").
- Escritura creativa, ficción, narrativa de todos los géneros y roleplaying.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text declarado), sin detalles técnicos disponibles.
- Soporte multilingüe en 16 idiomas, incluidos castellano, inglés, chino, árabe, hindi, japonés y coreano.
- Modelo "uncensored" y "abliterated": no aplica rechazos ni filtros de contenido en las respuestas.
- Soporte de tool calling y function calling: la model card remite a la pestaña "community" para resultados de terceros sobre tool calling, sin cifras verificables en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se detalla de forma explícita en la información proporcionada.

## Casos de uso

- Escritura creativa y narrativa: el modelo está ajustado específicamente para ficción, relatos y roleplaying, con ejemplos en la model card de generación de prosa extensa en un solo turno. Adecuado para autores que necesitan borradores largos con poca latencia de razonamiento.
- Asistentes de escritura sin restricciones temáticas: al ser "uncensored", permite abordar géneros como terror, thriller o drama adulto sin rechazos, algo útil en talleres literarios y proyectos editoriales.
- Generación de código en local: las etiquetas "coder" y "NEO-CODER" indican ajuste para programación; puede desplegarse con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo para autocompletado y refactorización.
- Prototipado de agentes conversacionales: la reducción de tokens de pensamiento abarata las conversaciones multi-turno y los bucles de agente, al disminuir el coste por llamada en despliegues con vLLM o llama.cpp.
- Evaluación de modelos sin censura para investigación: útil para estudiar comportamiento de modelos abliterated, sesgos y diferencias frente a la versión base con filtros.
- Inferencia en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, permite ejecutar un modelo de 27B en GPU de gama alta para consumo (por ejemplo, RTX 4090) o en configuraciones con memoria unificada, sin depender de clústeres.
- Traducción y generación multilingüe: con 16 idiomas declarados, puede emplearse en tareas de redacción y traducción asistida en entornos locales.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. Se presentan como afirmaciones del autor, no como resultados reproducidos.

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Primer fine-tune de este tamaño en superar 730 según el autor |
| ARC-C (4 bits) | 719 | Cuantización de 4 bits |
| ARC-E (8 bits) | superior a 880 | "Zona de inteligencia" de OpenAI, Claude y Gemini según el autor |
| Comparación con Qwen 3.8 27B | supera en los 7 benchmarks críticos (4 y 8 bits) | Sin cifras detalladas por benchmark |
| Comparación con Qwen 3.6-35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | supera en los 7 benchmarks | Sin cifras detalladas por benchmark |
| Tool calling | "el mejor rendimiento registrado" según la model card | Sin cifras; remite a la pestaña community |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-17 GB en cuantización de 4 bits (Q4KS) y 28-30 GB en 8 bits, según el tamaño de 26,9B parámetros; no se proporcionan cifras oficiales.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones de 4 bits; A100 40 GB, H100 o RTX 6000 Ada para 8 bits. El autor afirma que el modelo fue entrenado en hardware de consumo con Unsloth.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 24 GB; en 8 bits requiere GPU profesional o configuraciones con memoria unificada (por ejemplo, Apple Silicon de gama alta).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y vLLM (con soporte GGUF); el repo incluye cuantizaciones MTP con doble imatrix.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es más rápido que Qwen 3.8 27B por la reducción de tokens de pensamiento, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO...NEO-CODER-MAX) | 26,9B | no disponible | apache-2.0 | GGUF | Fine-tune sin censura, razonamiento reducido, 16 idiomas |
| Qwen 3.8 27B (base) | 27B (aproximado) | no disponible | no disponible en la información | safetensors y GGUF | Modelo original con filtros; referencia de comparación del autor |
| Qwen 3.6 27B | 27B (aproximado) | no disponible | no disponible en la información | no disponible | Generación anterior de la familia Qwen |
| Qwen 3.6-35B-A3B | 35B totales, 3B activos (MoE) | no disponible | no disponible en la información | no disponible | Alternativa MoE de la misma familia |

No se dispone de datos verificables de benchmarks ni de contexto para establecer una comparación cuantitativa fiable con Llama, Mistral u otros modelos de tamaño similar.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o dañino; no es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; los fine-tunes creativos tienden a priorizar estilo sobre precisión.
- Las afirmaciones de benchmark (ARC-C 735, ARC-E superior a 880, "mejor tool calling registrado") proceden del autor y no están verificadas de forma independiente.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de contexto extenso.
- El proceso de abliteration puede degradar capacidades de razonamiento e instrucción; no hay evaluación independiente disponible.
- Licencia apache-2.0 declarada, pero el modelo base y los datasets de entrenamiento tienen sus propias condiciones; conviene verificar la cadena de licencias antes de un uso comercial.
- Repo de 389 GB con múltiples cuantizaciones: requiere seleccionar el archivo GGUF concreto; la descarga completa no es práctica.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.
- Idiomas declarados sin evaluación por idioma; el rendimiento en castellano no está medido.
- Fecha de creación indicada como 2026-11-18, posterior a la fecha habitual de referencia; conviene verificar la vigencia de los enlaces.

## Enlaces

- Hugging Face: https://huggingface.co/fantasyx07/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Colecciones del autor del modelo base: https://huggingface.co/DavidAU/collections
- FAQs y soporte del autor del modelo base: https://huggingface.co/DavidAU/support
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
