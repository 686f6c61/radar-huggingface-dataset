# ansulev/Qwen3.8-27B-TURBO-735-882-Heretic-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-735-882-Heretic-NM-DAU es un fine-tune del modelo base Qwen/Qwen3.8-27B publicado por el usuario ansulev en HuggingFace. Se trata de una variante derivada del trabajo de DavidAU (el ecosistema "TURBO / Cold Fusion / Heretic"), que aplica un pipeline de ajuste multietapa sobre el modelo Qwen 3.8 de 27B parámetros, con un proceso de "des-censura" (heretic) y técnicas que el autor denomina "Cold Fusion" y "GAIN Training". El resultado es un modelo multimodal de tipo image-text-to-text, orientado a conversación y a usos generales, con licencia Apache 2.0.

El modelo cuenta con 27.781.427.952 parámetros totales según los pesos en safetensors, y un repositorio de 55,6 GB, lo que es coherente con pesos en precisión completa o semi-precisión (bf16/fp16). La arquitectura subyacente es la del Qwen 3.8 base (transformer denso, no MoE según los datos disponibles), con soporte de entrada de imagen y texto. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada visual.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo recién creado (1 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, y cuya model card es en gran medida material promocional del ecosistema de fine-tunes del autor original, con referencias cruzadas a otros repositorios. No se dispone de benchmarks publicados en la información proporcionada, ni de detalles verificables sobre el dataset de entrenamiento o el proceso exacto de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.8; multimodal image-text-to-text) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (el ecosistema del autor referencia GGUF en repositorios hermanos, pero no se detalla en esta ficha) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3.8-27B, un transformer denso de 27,8 mil millones de parámetros con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text). El fine-tune se presenta como resultado de un pipeline multietapa ("Multi-stage tuning") que, según la model card, incluye etapas previas de trabajo de Nightmedia y posteriores de "heretic'ing" (eliminación o reducción de comportamientos de rechazo y censura) y post-procesado. Se mencionan técnicas denominadas "Cold Fusion" y "GAIN Training", así como el uso de la herramienta unsloth, pero no se aportan detalles técnicos verificables sobre su funcionamiento, número de tokens de entrenamiento, composición del dataset ni si se empleó RLHF o DPO.

No se dispone de información sobre la composición del corpus de ajuste, la mezcla de datos, ni sobre innovaciones técnicas concretas como decodificación especulativa o atención lineal. La model card menciona "token reduction enhancements" (reducción de tokens de razonamiento) y modos de razonamiento e instrucción conmutables en versiones hermanas del ecosistema, pero estos detalles pertenecen a otros repositorios y no se confirman para este modelo concreto en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline orientado a diálogo multi-turno.
- Procesamiento de entrada multimodal image-text-to-text (entrada de imagen junto con texto).
- Modo "uncensored": el ajuste heretic busca reducir los rechazos del modelo base ante solicitudes que este declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma verificable; la model card menciona modos de razonamiento en repositorios hermanos, no en este.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): visión de entrada declarada por el pipeline; thinking mode no confirmado para este repo.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno gracias a su naturaleza instructiva y a su pipeline conversacional, adecuado para prototipos de atención al cliente en inglés.
- Análisis de imágenes con descripción textual: al ser image-text-to-text, permite generar descripciones, responder preguntas sobre imágenes o extraer información de capturas y documentos escaneados.
- Generación de contenido creativo sin restricciones de rechazo: el ajuste heretic lo hace útil para escritura creativa, guiones o ficción donde el modelo base tendería a rechazar temáticas sensibles.
- Investigación sobre alineación y censura: sirve como caso de estudio para comparar el comportamiento de un modelo "uncensored" frente a su base alineada, en entornos de evaluación controlados.
- Experimentación con fine-tunes comunitarios: útil para desarrolladores que quieran evaluar el ecosistema de ajustes de DavidAU y comparar variantes del mismo base.
- Prototipado rápido con transformers: al publicarse en safetensors y con licencia Apache 2.0, puede cargarse directamente con la librería transformers para pruebas de inferencia local en inglés.
- Evaluación de robustez multimodal: permite probar la calidad de las respuestas del modelo ante entradas de imagen combinadas con instrucciones de texto en un contexto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 mil millones de parámetros, en bf16/fp16 se requieren aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para precisión completa; A100 40 GB o dos RTX 4090 en paralelo para bf16; una única RTX 4090 (24 GB) solo con cuantización de 8 bits o inferior.
- ¿Cabe en GPU de consumo? Con cuantización de 4 bits podría caber en una RTX 4090 o RTX 3090 de 24 GB, aunque no se confirma compatibilidad con formatos GGUF en este repositorio concreto.
- Opciones de despliegue: transformers (safetensors) es el formato declarado; vLLM, TGI, llama.cpp u Ollama no se confirman para este repo, aunque el ecosistema del autor publica GGUF en repositorios hermanos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-735-882-Heretic-NM-DAU (este) | 27,78 B | no disponible | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | no disponible en la información | HuggingFace |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (hermano) | 27 B (aprox.) | no disponible | no disponible | HuggingFace, GGUF |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (hermano) | 27 B (aprox.) | no disponible | no disponible | HuggingFace, GGUF |

No se dispone de datos de rendimiento comparativo verificables entre estas variantes; la model card afirma que los modelos del ecosistema "exceden el rendimiento de todos los modelos Qwen 27B", pero no aporta cifras en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- El ajuste "heretic/uncensored" reduce los rechazos de seguridad, lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado; no es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- La model card es fundamentalmente promocional y contiene referencias cruzadas a otros repositorios del ecosistema; no aporta detalles verificables sobre el dataset, el proceso de entrenamiento ni las evaluaciones.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de documentación sobre el proceso de ajuste y los datos empleados introduce incertidumbre sobre posibles obligaciones derivadas del modelo base o de los datos de entrenamiento.
- No se confirma la disponibilidad de cuantizaciones GGUF en este repositorio, lo que limita el despliegue en hardware de consumo.
- El pipeline image-text-to-text implica que el modelo acepta imágenes, pero no se detalla la resolución soportada, el número de tokens visuales ni el rendimiento en tareas de visión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ansulev/Qwen3.8-27B-TURBO-735-882-Heretic-NM-DAU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF release #1 (ecosistema DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Release #2 (TWIN TURBO, GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Release #2 (TWIN TURBO, fuente): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Release #2 (ULTRA HERETIC): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Release #3 (UltimateDetails2, stage 1): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Qwen3.6 27B (ecosistema): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8 27B Cold Fusion GAIN: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6 40B: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5 9B: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
