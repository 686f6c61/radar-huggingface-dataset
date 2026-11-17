# ppap2026/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario ppap2026 sobre un fine-tune de DavidAU, a su vez derivado de la familia Qwen 3.8 de 27B. El modelo se presenta como un ajuste multietapa orientado a razonamiento, generación de código y escritura creativa, con un énfasis explícito en reducir el consumo de tokens de "thinking" manteniendo la calidad de salida (lo que el autor denomina modo TURBO). El repositorio incluye cuantizaciones GGUF tanto "regulares" como etiquetadas como MTP (multi-token prediction) con doble imatrix.

El modelo declara 26.895.998.464 parámetros reales en safetensors (aproximadamente 26,9 mil millones), licencia Apache 2.0 y soporte para 16 idiomas, entre ellos el español. La model card afirma superar a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.6-35B-A3B y Qwen 3.5 27B en siete benchmarks críticos, con cifras de ARC-C de 735 en 8 bits y 719 en 4 bits; estas cifras proceden exclusivamente de la documentación del autor y no se han verificado de forma independiente.

La relevancia actual del modelo radica en su propuesta de fine-tune "uncensored/abliterated" sobre una base Qwen de 27B, empaquetado en GGUF para hardware de consumo, con etiquetas que apuntan a casos de uso de rol, ficción y código. No obstante, se trata de un artefacto con cero descargas y un único "like" en el momento de la ficha, sin benchmarks de terceros publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.8 27B; detalles de atención y MoE no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en varias precisiones (4 bits y 8 bits mencionados explícitamente; "regular" y "MTP" con doble imatrix) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples quants); el modelo base se distribuye en bfloat16/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificar la base como Qwen 3.8 27B, un transformer decoder-only de aproximadamente 26,9 mil millones de parámetros. El autor describe el proceso como "multi-stage tuned" y "multi-state merge", con métodos propietarios denominados COLD FUSION y FABLE FUSION 711, y menciona el uso de Unsloth para el entrenamiento en hardware de consumo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF, DPO o variantes de alineación; los datasets referenciados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, sin más detalle.

La innovación declarada es la reducción del consumo de tokens de razonamiento (entre la mitad y hasta una décima parte frente a Qwen 3.8 estándar) manteniendo detalle y calidad, junto con la inclusión de variantes MTP (multi-token prediction) con doble imatrix. El ajuste "heretic/abliterated/uncensored" implica la eliminación de mecanismos de rechazo, lo que afecta directamente a su comportamiento en producción. No hay información verificable sobre la técnica exacta de abliteración ni sobre el pipeline de datos.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito, optimizado para reducir tokens de razonamiento.
- Generación de código (etiqueta "coder" y "NEO-CODER" en el nombre), sin benchmarks de código publicados en la información disponible.
- Escritura creativa, ficción, rol y narrativa de todos los géneros, con ejemplos extensos en la model card.
- Capacidades multimodales declaradas mediante el pipeline image-text-to-text y la etiqueta image-text-to-text; no se detalla qué encoder visual utiliza ni su resolución.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Tool calling / function calling: la model card remite a la pestaña "community" para resultados de terceros, sin datos concretos en la información proporcionada.
- Comportamiento "uncensored/abliterated": ausencia declarada de rechazos, lo que constituye una capacidad y a la vez un riesgo.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Escritura creativa y ficción por encargo: el modelo está ajustado específicamente para narrativa y rol, con ejemplos de generación de alta densidad en la model card; adecuado para generar borradores de relatos, diálogos y tramas con estilo marcado.
- Asistencia a guionistas y novelistas: la reducción de tokens de "thinking" disminuye la latencia en sesiones interactivas de escritura, lo que facilita iteraciones rápidas sobre un mismo texto.
- Generación de código en local: con etiqueta "coder" y despliegue GGUF, puede integrarse en entornos de desarrollo sin conexión para autocompletado y refactorización, aunque no hay benchmarks de código que respalden la calidad.
- Prototipado de agentes conversacionales: la compatibilidad con endpoints y el soporte multilingüe permiten montar chatbots multi-turno en 16 idiomas, incluido el español, sobre infraestructura propia.
- Investigación sobre alineación y abliteración: al ser un modelo "uncensored" derivado de Qwen, sirve como caso de estudio para medir el impacto de la eliminación de rechazos en calidad y seguridad.
- Procesamiento de documentos con componente visual: el pipeline image-text-to-text permite experimentar con tareas de imagen y texto, aunque sin especificaciones de contexto o resolución no se puede garantizar su idoneidad en producción.
- Despliegue en hardware de consumo: los quants de 4 bits permiten ejecutar un modelo de ~27B en GPUs de gama alta para consumo, útil en entornos sin acceso a clúster.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Superior a Qwen 3.8 27B según el autor |
| ARC-C (4 bits) | 719 | Cuantización de 4 bits |
| ARC-E (8 bits) | >880 | Zona que el autor atribuye a modelos cerrados |
| Comparación con Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.6-35B-A3B y Qwen 3.5 27B | Superior en 7 benchmarks críticos según el autor | Sin tabla detallada en la información disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tool calling en la información disponible; la model card remite a la pestaña "community" para benchmarks de terceros, que no se incluyen en este repositorio.

## Requisitos de hardware

- VRAM estimada: un modelo de ~26,9 B en 4 bits requiere del orden de 15-18 GB de VRAM (estimación basada en el tamaño de parámetros, no confirmada por el autor); en 8 bits, del orden de 28-30 GB; en bfloat16, más de 54 GB.
- GPU recomendadas: para 4 bits, RTX 4090 (24 GB) o RTX 3090; para 8 bits, A100 40 GB, H100 o dos GPUs de consumo; para precisión completa, A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 24 GB; en 8 bits no cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para los pesos no GGUF), TGI y cualquier runtime compatible con GGUF; el repo incluye quants "regulares" y "MTP".
- Latencia y throughput: no disponibles; el autor afirma reducción de tokens de razonamiento de entre 2x y 10x, lo que en la práctica reduce el tiempo hasta la primera respuesta útil, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TURBO...GGUF) | ~26,9 B | no disponible | Apache 2.0 | GGUF en HF, 0 descargas | Fine-tune uncensored con quants 4/8 bits |
| Qwen 3.8 27B (base) | ~27 B | no disponible | según Qwen (no confirmado en la información) | HF | Referencia del autor; superado en 7 benchmarks según la model card |
| Qwen 3.6 27B | ~27 B | no disponible | no disponible | HF | Citado como superado por el autor |
| Qwen 3.6-35B-A3B | 35 B totales (A3B) | no disponible | no disponible | HF | MoE citado como superado por el autor |

No se dispone de datos verificables de benchmarks ni de contexto para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es "uncensored/abliterated": se ha eliminado deliberadamente la capacidad de rechazo, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito sin filtros.
- Riesgo elevado de alucinación: los fine-tunes multietapa sobre bases Qwen sin evaluación independiente publicada no garantizan fidelidad factual.
- Las cifras de benchmarks (ARC-C 735/719, ARC-E >880) proceden únicamente del autor y no han sido replicadas; deben tratarse como afirmaciones no verificadas.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- El repositorio tiene 0 descargas y 1 "like" en el momento de la ficha; no hay evidencia de uso en producción ni de validación por la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base Qwen puede tener términos adicionales; conviene verificar la licencia de la base antes de uso comercial.
- El tamaño del repo (389 GB) y la multiplicidad de quants dificultan la selección; no se documenta qué quant corresponde a qué precisión exacta.
- La etiqueta image-text-to-text sugiere capacidades multimodales, pero no se detalla el encoder visual ni el soporte real de imágenes.
- El nombre y las etiquetas ("AGI", "50x", "intelligence club") son marketing y no deben interpretarse como métricas técnicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ppap2026/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Variante Turbo Brilliance (herética): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante Turbo Brilliance (no herética): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
