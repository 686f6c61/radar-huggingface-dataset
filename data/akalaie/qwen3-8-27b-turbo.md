# akalaie/Qwen3.8-27B-TURBO

## Resumen
Qwen3.8-27B-TURBO es un ajuste fino (fine-tune) multietapa del modelo Qwen3.8 de 27B, publicado por el usuario akalaie en Hugging Face. Su origen es un modelo derivado de DavidAU, concretamente `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, del que este repositorio constituye una cuantización GGUF. El modelo se presenta como una variante "abliterated" y "uncensored", orientada a usos creativos, roleplay, escritura de ficción y razonamiento general, con un supuesto modo de pensamiento ("thinking") optimizado para reducir el consumo de tokens.

El modelo cuenta con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors), lo que lo sitúa en la categoría de 27B. El repositorio incluye cuantizaciones GGUF "regulares" y "MTP" (multi-token prediction), generadas con el formato Neo-CODER MAX DI-MATRIX con doble imatrix. La model card afirma que el modelo supera a la base Qwen3.8 27B en siete benchmarks críticos y que alcanza puntuaciones ARC-C de 735 en 8 bits y 719 en 4 bits, aunque estos datos no están verificados de forma independiente.

La relevancia de esta ficha es limitada: se trata de un modelo de la comunidad, sin benchmarks reproducibles publicados más allá de las afirmaciones del autor, con 0 descargas y 0 likes en el momento de la consulta. Su interés principal radica en ser un ejemplo de ecosistema de fine-tunes no oficiales sobre Qwen3.8, con licencia Apache 2.0 y soporte multilingüe amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8); no se detalla en la informacion disponible |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones regulares y MTP; se mencionan Q4KS, 4 bits y 8 bits; no se listan todas las variantes) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones); el modelo base en bfloat16 |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna más allá de indicar que deriva de Qwen3.8 y que emplea un transformer. El autor menciona que el fine-tune se realizó mediante "multi-stage tuning" y "multi-state merge", con métodos denominados "COLD FUSION" y "FABLE FUSION 711", y que se usaron los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. También se indica que el entrenamiento se llevó a cabo con Unsloth sobre hardware de consumo.

El rasgo técnico más destacado que declara el autor es la reducción del número de tokens de pensamiento (entre la mitad y hasta una décima parte respecto a Qwen3.8 27B) manteniendo el detalle de salida, junto con la inclusión de cuantizaciones MTP (multi-token prediction). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto conversacional y de ficción, con énfasis en escritura creativa, relato y roleplay.
- Razonamiento con modo "thinking" (etiqueta `thinking` y `reasoning`), optimizado para reducir tokens de pensamiento.
- Generación de código (etiqueta `coder`).
- Capacidades multimodales de imagen a texto (`image-text-to-text`), aunque no se detalla el codificador visual.
- Soporte multilingüe en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Variante "abliterated/uncensored", que elimina parte de los rechazos de seguridad del modelo base.
- Soporte de tool calling: la model card menciona "strongest tool calling performance ever recorded" en la pestaña de comunidad, sin datos verificables.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso
- Escritura creativa y ficción: el modelo está ajustado específicamente para narrativa y roleplay, con ejemplos de generación de relatos largos y diálogos; adecuado para autores que necesitan borradores rápidos con tono marcado.
- Roleplay y personajes conversacionales: la variante uncensored permite mantener personajes sin rechazos por contenido sensible, útil en entornos de entretenimiento controlados.
- Asistencia a guionistas y generación de tramas: la reducción de tokens de pensamiento permite iterar sobre ideas con menor latencia y coste por consulta.
- Generación de código en pipelines internos: la etiqueta `coder` y el soporte de tool calling permiten integrarlo en asistentes de desarrollo, aunque sin benchmarks verificables de HumanEval.
- Traducción y atención multilingüe: con 16 idiomas declarados, puede usarse en borradores de traducción o atención al cliente en mercados internacionales.
- Prototipado local en hardware de consumo: las cuantizaciones GGUF de 4 bits permiten ejecutarlo en estaciones de trabajo con GPU de gama alta, útil para experimentación sin infraestructura cloud.
- Procesamiento de imagen y texto: al declarar pipeline `image-text-to-text`, puede emplearse en tareas de descripción de imágenes o VQA, aunque la información sobre el componente visual es escasa.

## Benchmarks y rendimiento
La model card afirma resultados de ARC-C de 735 en 8 bits y 719 en 4 bits, y que supera a Qwen3.8 27B, Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en siete benchmarks. Sin embargo, no se proporcionan tablas con los valores del resto de benchmarks ni metodología reproducible. No se han publicado resultados verificables de MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Valor declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmación del autor, no verificada |
| ARC-C (4 bits) | 719 | Afirmación del autor, no verificada |
| ARC-E | 880 | Afirmación del autor, no verificada |
| Resto de benchmarks | no disponible | Se mencionan siete benchmarks sin cifras |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~27B, en cuantización de 4 bits se estiman aproximadamente 16-18 GB, y en 8 bits alrededor de 28-30 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no indicadas en la información; por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones de 4 bits, y una A100/H100 para 8 bits o bfloat16.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 con cuantización de 4 bits; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM o TGI requerirían pesos safetensors, no incluidos en este repo.
- Latencia y throughput: no disponibles; el autor afirma que el modelo es más rápido que Qwen3.8 27B por la reducción de tokens de pensamiento, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO (este) | ~26,9B | no disponible | Apache 2.0 | GGUF en HF | Fine-tune uncensored de la comunidad |
| Qwen3.8 27B (base) | ~27B | no disponible | no disponible | HF | Modelo original de referencia |
| Qwen3.6 27B | ~27B | no disponible | no disponible | HF | Generación anterior citada por el autor |
| Qwen3.5 27B | ~27B | no disponible | no disponible | HF | Generación anterior citada por el autor |

No se dispone de datos verificables de rendimiento comparado para estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Modelo "abliterated/uncensored": se ha eliminado parte de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ofensivo o ilegal; no apto para producción sin filtros adicionales.
- Riesgo de alucinación no evaluado de forma independiente; los benchmarks citados proceden del propio autor.
- Sin datos sobre longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad ni resultados reproducibles.
- La licencia Apache 2.0 se declara en el repo, pero el modelo base y los datasets de terceros pueden imponer restricciones adicionales no aclaradas.
- El tamaño del repo (389 GB) y la ausencia de pesos safetensors completos limitan el despliegue con vLLM o TGI.
- La información sobre el componente multimodal es mínima; no se garantiza un rendimiento fiable en tareas de imagen.
- El modelo se creó en 2026 según los metadatos, pero no hay evidencia de mantenimiento o soporte posterior.

## Enlaces
- Hugging Face: https://huggingface.co/akalaie/Qwen3.8-27B-TURBO
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
