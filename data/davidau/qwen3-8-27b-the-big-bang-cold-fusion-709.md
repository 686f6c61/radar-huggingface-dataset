# DavidAU/Qwen3.8-27B-THE-BIG-BANG-Cold-Fusion-709

## Resumen

Qwen3.8-27B-THE-BIG-BANG-Cold-Fusion-709 es un ajuste fino (finetune) del modelo Qwen3.8 de 27B de parámetros, publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, derivado de una cadena de ajustes previos del mismo autor (la base declarada es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU), y forma parte de un proyecto más amplio de variantes "Cold Fusion" / "GAIN Training" con múltiples etapas de ajuste.

El modelo se presenta como una versión "herética" (uncensored) de intensidad ligera a moderada, orientada a reducir rechazos manteniendo el rendimiento general. Según la model card, emplea técnicas de reducción de "thinking tokens" (entre 1/2 y 1/20 del consumo de un Qwen3.8 estándar) y ofrece múltiples modos de razonamiento e instrucción conmutables en caliente. La información pública disponible es fundamentalmente la model card del autor y los datos del repositorio; no hay paper ni documentación técnica formal.

El interés actual del modelo radica en su propuesta de equilibrio entre censura reducida, eficiencia en tokens de razonamiento y capacidades multimodales, sobre una licencia Apache 2.0 que facilita su uso comercial. No obstante, al tratarse de un finetune comunitario sin evaluación independiente, conviene tratar sus cifras con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag de arquitectura `qwen3_5`; detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (27,78B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 y MXFP4 mencionados en los benchmarks; GGUF disponible en repositorios asociados del mismo autor; otros no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); GGUF en repos asociados |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la pipeline image-text-to-text, lo que sugiere un transformer con codificador visual y capacidades de entrada de imagen y texto. El modelo base es un Qwen3.8 de 27B, y este repositorio es el resultado de una cadena de finetunes del autor, con nombres internos de etapa como "Stage2b-rplus3", seleccionada como finalista por su seguimiento de instrucciones y consistencia generativa.

El entrenamiento se enmarca en el proyecto "Cold Fusion" / "GAIN Training" con ajuste multi-etapa, usando datasets propios del autor (Polar-STRICT, F451-STRICT y THE-DECKARD). La model card menciona ajustes de razonamiento y "re-blending" del núcleo, así como la reducción del número de tokens de pensamiento (de 1/2 a 1/20 según la variante). No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon RLHF o DPO. Las métricas de "heretic stats" indican 68/100 rechazos frente a 86/100 del Qwen3.8 sin ajustar, con una divergencia KL de 0,0025.

## Capacidades

- Generación de texto conversacional y razonamiento, con modos de "thinking" e "instruct" conmutables en caliente (cinco modos de cada tipo según la model card).
- Entrada multimodal image-text-to-text (procesamiento de imágenes junto con texto).
- Reducción del consumo de tokens de razonamiento respecto al modelo base (entre 1/2 y 1/20).
- Seguimiento de instrucciones y atención al detalle, destacados por el autor como fortalezas del checkpoint finalista.
- Soporte de tool calling / function calling, con plantillas Jinja actualizadas (reg. 17 KB y versión mejorada de 32 KB) mencionadas en la model card.
- Capacidad de "multi-stage drafting" y doble comprobación cuando se le solicita.
- Multilingüe: limitado a inglés según el campo `language`.
- Comportamiento "uncensored" de intensidad ligera-moderada (68/100 rechazos).

## Casos de uso

- Asistentes conversacionales con imágenes: el pipeline image-text-to-text permite responder preguntas sobre capturas, diagramas o fotografías en conversaciones multi-turno, útil en soporte técnico visual.
- Generación de código con integración de herramientas: el soporte de tool calling y las plantillas Jinja actualizadas permiten integrarlo en pipelines de CI/CD o agentes que invocan funciones externas.
- Agentes de razonamiento multi-etapa: los modos de pensamiento conmutables y el "multi-stage drafting" encajan en flujos que requieren planificación y verificación de resultados antes de responder.
- Procesamiento de documentación técnica en inglés: con 27,78B de parámetros y capacidades de razonamiento, puede resumir, extraer y contrastar información de manuales y especificaciones.
- Prototipado de aplicaciones con contenido sensible: la reducción de rechazos (68/100) lo hace adecuado para entornos de investigación donde el modelo base rechazaría consultas legítimas, siempre con revisión humana.
- Despliegue en hardware de consumo mediante cuantización: la disponibilidad de GGUF en repositorios asociados permite ejecución local en equipos con GPU de gama alta o incluso CPU, para pruebas y demos.
- Evaluación comparativa de finetunes: sirve como referencia en estudios sobre técnicas de "abliteration"/heretic y su impacto en rendimiento y alineación.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación por "nightmedia", en modo instruct, métricas de exactitud):

| Modelo | Precisión | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|---|
| THE-BIG-BANG-709-L (este linaje) | mxfp8 | 0,709 | 0,876 | 0,914 | 0,827 | 0,524 | 0,834 | 0,779 |
| THE-BIG-BANG-709-L (este linaje) | mxfp4 | 0,701 | 0,877 | 0,913 | 0,821 | 0,518 | 0,830 | 0,786 |
| Qwen3.8-27B ULTRA-HERETIC (misma etapa) | mxfp8 | 0,699 | 0,873 | 0,911 | 0,827 | 0,528 | 0,833 | 0,781 |
| Qwen3.8-27B base sin ajustar | mxfp8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B base sin ajustar | mxfp4 | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

Nota: los benchmarks corresponden al modelo hermano del mismo linaje (TWIN-TURBO-709-L); el autor indica que BF16 suele rendir entre 2 y 5 puntos por encima de MXFP8. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB de pesos, por lo que requiere unos 60-70 GB de VRAM para inferencia con overhead (varias GPU o una H100 80 GB).
- Cuantización MXFP8: en torno a 28 GB de pesos; cabe en una A100 80 GB o H100, y en configuraciones multi-GPU de 24 GB (por ejemplo, 2x RTX 4090).
- Cuantización MXFP4: en torno a 14-16 GB de pesos; podría caber en una RTX 4090 (24 GB) o RTX 3090, con margen para contexto.
- GGUF: disponible en repositorios asociados del autor (NEO/MTP GGUF), lo que permite despliegue en llama.cpp y Ollama; los quants de 4 bits podrían ejecutarse en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama vía GGUF, y presumiblemente vLLM/TGI para pesos completos (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| THE-BIG-BANG-709 (este) | 27,78B | no disponible | Apache 2.0 | en | Finetune heretic multimodal, benchmarks propios superiores al base |
| Qwen3.8-27B base | 27B (aprox.) | no disponible | no disponible | no disponible | Sin ajuste heretic; 86/100 rechazos; peor en benchmarks publicados |
| Qwen3.6-27B | 27B (aprox.) | no disponible | no disponible | no disponible | Rendimiento intermedio en los benchmarks del autor (arc/c 0,647) |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | no disponible | Mayor tamaño pero menor puntuación en varias métricas del harness |

Los datos de comparación provienen exclusivamente del harness del autor; no hay evaluaciones independientes que permitan una comparación neutral.

## Limitaciones y advertencias

- Modelo comunitario sin paper ni evaluación independiente: los benchmarks proceden del propio autor y deben interpretarse con cautela.
- Riesgo de alucinación inherente a los modelos de 27B, no cuantificado en la información disponible.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar cargas con contextos largos.
- El ajuste "uncensored" (68/100 rechazos) reduce las salvaguardas del modelo base; requiere moderación externa en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del finetune.
- Cadena de dependencias compleja (múltiples finetunes previos) que dificulta la trazabilidad de los datos de entrenamiento.
- Posible deriva en calidad respecto al base en tareas no cubiertas por el harness de evaluación.
- El pipeline image-text-to-text no está validado con métricas multimodales en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-THE-BIG-BANG-Cold-Fusion-709
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Repositorio GGUF asociado (NEO/MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Proyecto Cold Fable Fusion GAIN V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Release #1 de la rama: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Discusión con el "pelican test": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored/discussions/3
- Qwen3.6-27B Fable Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B Cold Fusion GAIN V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
