# eXhumer/qwen3.8-uncensored

## Resumen

eXhumer/qwen3.8-uncensored es una cuantización GGUF publicada por el usuario eXhumer a partir del fine-tune de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de la familia Qwen 3.8 de 27B. El modelo se distribuye como repositorio de cuantizaciones (GGUF regulares y variantes MTP) con pesos en bfloat16 en el árbol del modelo, y está etiquetado como pipeline `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen-texto. El checkpoint contiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones).

El modelo se presenta como un fine-tune "uncensored"/"abliterated" orientado a usos creativos (escritura, ficción, roleplaying), razonamiento con modo thinking y generación de código, con un enfoque explícito en reducir el consumo de tokens de razonamiento respecto al Qwen 3.8 base. La model card afirma mejoras en siete benchmarks críticos frente a Qwen 3.8 27B, Qwen 3.6 27B, Qwen 3.6-35B-A3B y Qwen 3.5 27B, aunque los datos concretos no se detallan en la información disponible.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: cuantizaciones GGUF listas para hardware de consumo, fine-tunes con "thinking mode" optimizado en tokens y variantes sin censura para escritura creativa. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque las condiciones reales de los datos de entrenamiento no están documentadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.8; transformer presumiblemente, no confirmado en la información) |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF regulares y GGUF MTP (Neo-CODER MAX DI-MATRIX, doble imatrix); variantes "Turbo Brilliance 50x V2 AGI" (TBrill); pesos bfloat16 en el árbol |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Tamaño del repositorio | 492,8 GB |
| Fecha de creación | 2026-11-24 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su procedencia de la familia Qwen 3.8 de 27B y de las etiquetas del repositorio, que apuntan a un transformer con modo thinking/reasoning y pipeline multimodal imagen-texto. El fine-tune se describe como "multi-stage tuned" y "multi-state merge", construido mediante los métodos que el autor denomina "COLD FUSION" y "FABLE FUSION 711", y entrenado con Unsloth sobre los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. No se especifican el número de tokens de entrenamiento ni la composición exacta del corpus.

La innovación declarada es la reducción del coste de razonamiento: el autor afirma que el modelo consume entre la mitad y hasta una décima parte de los tokens de thinking respecto al Qwen 3.8 27B convencional, manteniendo el detalle de salida. También se menciona el uso de doble imatrix ("DI-MATRIX") en las cuantizaciones Neo-CODER MAX y una variante MTP (multi-token prediction). No hay información verificable sobre RLHF, DPO ni sobre la composición lingüística del dataset de ajuste.

## Capacidades

- Generación de texto conversacional y de formato largo, con etiqueta explícita de "conversational".
- Razonamiento con modo thinking, con la promesa de reducir drásticamente los tokens de razonamiento frente al modelo base.
- Escritura creativa: ficción, relatos, todos los géneros y roleplaying, según las etiquetas del repositorio.
- Generación de código (etiqueta "coder" y cuantizaciones "Neo-CODER MAX").
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Soporte multilingüe en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Variante "abliterated"/"uncensored": el autor indica que se ha reducido el comportamiento de rechazo, orientado a contenido creativo sin restricciones temáticas.
- Tool calling y function calling: la model card menciona en la pestaña "community" un rendimiento "récord" en tool calling, pero no se aportan cifras ni metodología en la información disponible.

## Casos de uso

- Escritura creativa y ficción por encargo: el modelo está ajustado específicamente para relatos, novelas y guiones, con etiquetas de "all genres" y "story"; su modo thinking reducido permite iterar borradores largos con menos coste por generación.
- Roleplaying y narrativa interactiva: la variante uncensored evita rechazos en tramas adultas o violentas, lo que lo hace adecuado para motores de juegos de rol y ficción interactiva.
- Generación de código en pipelines locales: las cuantizaciones Neo-CODER MAX y su integración con llama.cpp/Ollama permiten desplegarlo en estaciones de trabajo para autocompletado, refactorización y generación de tests sin depender de la nube.
- Asistencia a guionistas y copywriters: con 16 idiomas y modo conversacional, puede redactar y adaptar textos de marketing o guiones en español, francés, alemán o japonés manteniendo el tono solicitado.
- Procesamiento de documentos con imagen: al declarar pipeline `image-text-to-text`, puede emplearse para describir imágenes, extraer información de capturas o generar pies de foto en flujos editoriales.
- Chat de atención al cliente con contexto largo: aunque la longitud de contexto no está confirmada, el tamaño de 27B y el ajuste conversacional permiten gestionar conversaciones multi-turno; conviene validar el contexto real antes de producción.
- Prototipado de agentes con tool calling: la model card reivindica buen rendimiento en llamadas a herramientas, lo que permite construir agentes multi-paso en local para tareas de investigación o automatización.

## Benchmarks y rendimiento

La model card menciona resultados de ARC-C y ARC-E (735 en ARC-C en 8 bits, 719 en 4 bits, más de 880 en ARC-E), pero no se proporciona la tabla completa de los siete benchmarks ni la metodología. No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmado por el autor; sin metodología detallada |
| ARC-C (4 bits) | 719 | Afirmado por el autor; sin metodología detallada |
| ARC-E | >880 | Afirmado por el autor; sin metodología detallada |
| MMLU, HumanEval, GSM8K | no disponible | No publicados en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 26,9B parámetros, una cuantización Q4 requeriría del orden de 16-18 GB, Q5 en torno a 19-21 GB y Q8 alrededor de 28-30 GB, además del overhead de contexto; estas cifras son estimaciones y no proceden de la model card.
- GPU recomendadas: no indicadas por el autor. Por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones Q4/Q5; para Q8 o bfloat16 se necesitarían A100 40/80 GB, H100 o múltiples GPU.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con cuantizaciones más agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para bfloat16, vLLM o TGI. El repositorio incluye quants MTP y regulares, pensados para motores que soporten multi-token prediction.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es más rápido que el Qwen 3.8 base gracias a la reducción de tokens de thinking, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| eXhumer/qwen3.8-uncensored | 26,9B | no disponible | Apache 2.0 | Cuantización GGUF de un fine-tune uncensored con thinking reducido |
| Qwen 3.8 27B (base) | ~27B | no disponible | no disponible en la información | Referencia del autor; el fine-tune afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | no disponible en la información | El autor afirma superarlo en los 7 benchmarks |
| Qwen 3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible en la información | El autor afirma superarlo en los 7 benchmarks |

No se dispone de datos verificables de benchmarks ni de contexto para establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es un fine-tune "abliterated"/"uncensored": reduce los rechazos y puede generar contenido ofensivo, violento o sexual; requiere moderación en producción y revisión de políticas de uso.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por el ajuste creativo y por la falta de benchmarks independientes.
- Los resultados de ARC-C y ARC-E son afirmaciones del autor sin metodología pública; no deben tomarse como validados.
- La longitud de contexto no está documentada; no se debe asumir una ventana concreta sin probarla.
- La licencia Apache 2.0 se declara en el repositorio, pero la procedencia de los datos de entrenamiento y del modelo base no está detallada; conviene revisar la licencia del modelo base de DavidAU antes de uso comercial.
- El repositorio ocupa 492,8 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.
- El pipeline declarado es `image-text-to-text`, pero no se documentan las capacidades de visión ni su calidad; validar antes de usarlo en tareas multimodales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/eXhumer/qwen3.8-uncensored
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Variante 27B Heretic Turbo Brilliance v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
