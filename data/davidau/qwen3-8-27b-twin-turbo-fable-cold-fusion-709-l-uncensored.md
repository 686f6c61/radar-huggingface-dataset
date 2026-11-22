# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored es un ajuste fino (finetune) del modelo Qwen3.8 de 27B de parámetros, desarrollado por el usuario DavidAU y publicado en Hugging Face bajo licencia Apache 2.0. El modelo se presenta como una variante "Heretic" de intensidad ligera a moderada, es decir, con un entrenamiento orientado a reducir el comportamiento de rechazo (refusals) manteniendo el rendimiento general. Según la model card, pasa de 86/100 rechazos en el Qwen3.8 sin ajustar a 68/100, con una divergencia KL de 0,0025 respecto al modelo base.

La propuesta diferencial del modelo es la reducción del número de "thinking tokens": el autor afirma que emplea entre 1/2 y 1/5 (y en algunos casos hasta 1/20) de los tokens de razonamiento del modelo original, manteniendo o mejorando la inteligencia. Además, incorpora cinco modos de razonamiento y cinco modos de instrucción conmutables en caliente, tanto vía API como directamente en el mensaje de chat.

El modelo tiene 27.781.427.952 parámetros según los pesos en safetensors, un repositorio de 55,6 GB y está etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales, aunque la model card no detalla la arquitectura interna ni la longitud de contexto. Está entrenado únicamente en inglés y deriva de una cadena de finetunes previos del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5` en los tags; transformer multimodal presumiblemente, sin confirmar) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 y MXFP4 mencionados en los benchmarks; GGUF disponible en repositorios derivados (NEO/MTP) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repos derivados |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. Los tags del repositorio indican `qwen3_5`, `qwen3_6` y `qwen3_8`, lo que apunta a una base de la familia Qwen 3.8 de 27B, y el pipeline es `image-text-to-text`, lo que implica soporte de entrada de imagen y texto. El modelo es un finetune de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez forma parte de una cadena de ajustes del proyecto "Cold Fable Fusion GAIN".

El entrenamiento se describe con las etiquetas "Cold Fusion", "GAIN Training" y "Multi-stage tuning", con datasets propios del autor (Polar-STRICT, F451-STRICT y THE-DECKARD) y uso de Unsloth. El autor menciona que la variante finalista, denominada internamente "Stage2b-rplus3", fue seleccionada por su seguimiento de instrucciones superior y consistente, su atención al detalle y su capacidad de "multi-stage drafting" (borrador multietapa) para tareas de verificación y doble comprobación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

La innovación principal declarada es la reducción de tokens de razonamiento (TWIN-TURBO) y la conmutación en caliente entre cinco modos de pensamiento y cinco modos de instrucción. También se ofrecen plantillas Jinja actualizadas para tool calling (una estándar de 17 KB y una mejorada de 32 KB).

## Capacidades

- Generación de texto conversacional en inglés, con modos diferenciados de razonamiento e instrucción.
- Razonamiento con reducción de tokens de "thinking" (entre 1/2 y 1/20 según el autor).
- Cinco modos de razonamiento y cinco modos de instrucción conmutables en caliente, vía API o mediante mensaje en el chat.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Tool calling / function calling, con plantillas Jinja específicas proporcionadas por el autor.
- "Multi-stage drafting" para tareas de verificación y doble comprobación cuando se solicita.
- Comportamiento "Heretic" ligero-moderado: reducción parcial de rechazos (68/100 frente a 86/100 del base).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistentes conversacionales con control de coste en tokens: la reducción de tokens de razonamiento permite abaratar la inferencia en tareas de chat multi-turno donde el razonamiento extenso no aporta valor.
- Pipelines de agentes con tool calling: las plantillas Jinja actualizadas y los modos conmutables permiten alternar entre modo instructivo (rápido) y modo razonamiento (profundo) según la etapa del agente.
- Verificación y revisión de documentos: el "multi-stage drafting" descrito por el autor encaja en flujos de doble comprobación de contenido generado o de datos extraídos.
- Procesamiento de documentos con imagen y texto: al estar etiquetado como `image-text-to-text`, puede emplearse en tareas de descripción o extracción de información a partir de imágenes acompañadas de instrucciones textuales.
- Generación de contenido creativo sin restricciones excesivas: la variante Heretic reduce los rechazos en dominios creativos o de ficción donde el modelo base tiende a declinar.
- Experimentación e investigación sobre alineación: la métrica de rechazos y la divergencia KL publicadas permiten estudiar el compromiso entre censura y rendimiento en modelos de 27B.
- Despliegue en entornos con recursos moderados mediante cuantización MXFP4/MXFP8 o GGUF, manteniendo según el autor un rendimiento cercano al de precisión completa.

## Benchmarks y rendimiento

Resultados publicados por el autor (nightmedia) en modo instructivo, comparando MXFP8 y MXFP4:

| Modelo | Precisión | ARC-c | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|---|
| TWIN-TURBO 709-L (este modelo) | MXFP8 | 0,709 | 0,876 | 0,914 | 0,827 | 0,524 | 0,834 | 0,779 |
| TWIN-TURBO 709-L (este modelo) | MXFP4 | 0,701 | 0,877 | 0,913 | 0,821 | 0,518 | 0,830 | 0,786 |
| TWIN-TURBO 709 ULTRA-HERETIC | MXFP8 | 0,699 | 0,873 | 0,911 | 0,827 | 0,528 | 0,833 | 0,781 |
| Qwen3.8-27B (base, sin ajuste) | MXFP8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (base, sin ajuste) | MXFP4 | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B | MXFP8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B | MXFP8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B | MXFP8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El autor indica que BF16 sería entre 2 y 5 puntos superior a MXFP8 en la mayoría de métricas, y que el modo razonamiento supera al modo instructivo en la mayoría de casos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 27,78B parámetros, en BF16 se requieren aproximadamente 55,6 GB de pesos; en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o varias GPU de 24 GB en paralelo. Para MXFP8, una A100 40 GB o H100. Para MXFP4 o GGUF Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ser suficientes para los pesos, con margen limitado para contexto.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits en GPUs de 24 GB, y en 4 bits con contexto reducido en GPUs de 16 GB.
- Opciones de despliegue: transformers (formato nativo), llama.cpp/Ollama y vLLM/TGI a través de los repositorios GGUF derivados (NEO/MTP) publicados por el mismo autor.
- Latencia y throughput: no disponibles. El autor afirma reducciones de tokens de razonamiento de entre 1/2 y 1/20, lo que en la práctica reduce el coste de generación en modo pensamiento, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| TWIN-TURBO 709-L (este modelo) | 27,78B | no disponible | Apache 2.0 | en | Finetune Heretic ligero, 68/100 rechazos, KL 0,0025 |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible | 86/100 rechazos; peor en ARC-c (0,591 vs 0,709) |
| Qwen3.6-27B (Fable Fusion del mismo autor) | 27B | no disponible | no disponible | no disponible | Referencia del autor con más de 2.300 likes; ARC-c 0,647 |
| Qwen3.6-35B-A3B | 35B totales (MoE) | no disponible | no disponible | no disponible | ARC-c 0,581; menor rendimiento en las métricas publicadas |

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Es un finetune comunitario de un solo autor, sin validación independiente de los benchmarks publicados; las cifras proceden del propio autor.
- La reducción de rechazos es parcial (68/100), no total; el comportamiento en dominios sensibles puede ser inconsistente entre prompts.
- Riesgo de alucinación inherente a los modelos de 27B, no cuantificado en la información disponible.
- No se especifican la longitud de contexto ni la arquitectura exacta, lo que dificulta planificar despliegues con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de una cadena de finetunes cuyas condiciones originales de la base Qwen no se detallan en la información proporcionada; conviene verificar la licencia de la base original antes de un uso comercial.
- Las capacidades multimodales se deducen del pipeline declarado, pero no se documentan en la model card.
- El ecosistema de plantillas de chat y modos conmutables añade complejidad operativa; un uso incorrecto de las plantillas Jinja puede degradar el tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Repositorio GGUF con model card completa (NEO/MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Proyecto base (Cold Fable Fusion GAIN V1.1): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Modelo base directo: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Release #1 de la rama (NEO CODER MAX MTP GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.6-27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B Cold Fusion GAIN V1.1 (NM-DAU-NEO-MAX-MTP-GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Prueba "pelican" del modelo finalista: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored/discussions/3
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
