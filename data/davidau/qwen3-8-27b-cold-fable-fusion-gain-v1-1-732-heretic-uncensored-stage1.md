# DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1

## Resumen

Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1 es un fine-tune del modelo Qwen/Qwen3.8-27B publicado por DavidAU, un creador conocido en Hugging Face por sus versiones "Heretic" y "Uncensored" de modelos Qwen. El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text, arquitectura Qwen3.8) con 27.781.427.952 parámetros totales, y se distribuye en formato safetensors bajo licencia Apache 2.0. La model card lo presenta como la primera etapa de un proyecto de tuning multi-fase denominado "Cold Fusion" / "GAIN Training", con trabajo adicional de reducción de censura ("heretic'ing") y ajuste fino sobre el modelo base.

El modelo resuelve el problema de disponer de una variante del Qwen3.8-27B con menor censura en las respuestas y con modos de razonamiento adicionales, orientada a casos de uso donde las restricciones del modelo original resultan limitativas (escritura creativa sin filtros, investigación, generación de contenido para adultos). Según la model card, el autor afirma que esta familia de fine-tunes supera en rendimiento a los modelos Qwen 27B originales, incluyendo reducciones de tokens de razonamiento de entre 1/2 y 1/20 según la variante, aunque estas afirmaciones no vienen acompañadas de tablas de benchmarks verificables en la información disponible.

Es relevante ahora porque se publica dentro de una oleada de variantes del Qwen3.8-27B (TURBO, TWIN TURBO, ULTRA HERETIC, UltimateDetails2) que el autor distribuye de forma escalonada entre agosto y septiembre de 2026, con 6.284 descargas y 285 likes acumulados en este repositorio concreto. El modelo está pensado para despliegue vía transformers y dispone de versiones GGUF en repositorios hermanos para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag de arquitectura `qwen3_5` |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio (el autor publica GGUF en repositorios hermanos con cuantizaciones NEO-CODER MAX DiMatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Pipeline | image-text-to-text |
| Descargas / likes | 6.284 / 285 |
| Fecha de creacion | 2026-08-25 |
| Ultima actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B, un transformer multimodal de 27,78 B de parámetros que procesa entradas de imagen y texto. Sobre esa base, el autor aplica un pipeline de tuning multi-etapa que la model card denomina "Cold Fusion" y "GAIN Training", con una fase posterior de "heretic'ing" (eliminación o atenuación de comportamientos de rechazo y censura) y una etapa final de ajuste. El repositorio corresponde a la "stage1" de ese proceso, y el autor indica que las etapas previas fueron realizadas en colaboración con Nightmedia, mientras que el heretic'ing y el post-procesado corrieron a su cargo.

La model card menciona que se emplearon varios fine-tunes propios (publicados y no publicados) además de modelos de terceros como datos o componentes del entrenamiento, pero no detalla el volumen de tokens, la composición del dataset ni si hubo RLHF, DPO o una fase de preferencias. Tampoco se especifican innovaciones técnicas concretas más allá de la reducción de tokens de razonamiento que el autor atribuye a otras variantes de la familia (TURBO y TWIN TURBO), no necesariamente a esta stage1. No hay información verificable sobre la estrategia de atención, el tipo de positional encoding ni modificaciones estructurales respecto al base.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado image-text-to-text, lo que implica soporte de entrada de imágenes además de texto.
- Razonamiento de múltiples pasos: la familia a la que pertenece incorpora modos de razonamiento de Qwen3.8, aunque la model card no detalla cuántos modos expone esta variante concreta.
- Generación de código: los repositorios hermanos del autor incluyen variantes "NEO-CODER" y el modelo base Qwen3.8 está orientado a tareas de código; no hay confirmación explícita de capacidades de código específicas para esta stage1.
- Respuestas con menor tasa de rechazo ("uncensored" / "heretic"), orientadas a contenido que el modelo base filtraría.
- Capacidades multilingües limitadas: el campo `language` de la model card solo declara inglés.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita el despliegue en infraestructura de inferencia gestionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Escritura creativa sin filtros: el ajuste "heretic" reduce los rechazos del modelo base, lo que lo hace adecuado para narrativa, guiones y ficción con temáticas adultas o controvertidas que el Qwen3.8-27B original bloquearía. El contexto multimodal permite además incorporar imágenes de referencia en el proceso creativo.
- Investigación sobre alineación y censura: sirve como objeto de estudio para comparar el comportamiento de un modelo alineado (Qwen3.8-27B) frente a su variante heretic, midiendo tasas de rechazo, cambios en la distribución de respuestas y degradación de capacidades.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales para extraer y resumir información, siempre que el contexto disponible sea suficiente.
- Generación de contenido para prototipado rápido: con 6.284 descargas y compatibilidad con endpoints, es viable montar un servicio de generación de texto e imagen-texto para demos internas o pruebas de producto sin depender de APIs comerciales con filtros.
- Fine-tuning posterior como base: al estar bajo Apache 2.0 y en safetensors, puede usarse como punto de partida para ajustes específicos de dominio (por ejemplo, estilo de marca o terminología técnica) sin las restricciones de licencia de otros modelos.
- Evaluación comparativa de fine-tunes: útil para equipos que quieran medir el impacto de pipelines multi-etapa (Cold Fusion, GAIN Training) frente al modelo base en tareas concretas de su dominio.
- Despliegue local en cuantización GGUF: aunque este repositorio solo contiene safetensors, el autor publica versiones GGUF de la familia, lo que permite ejecutar el modelo en hardware de consumo para pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye afirmaciones cualitativas del autor (por ejemplo, que la familia supera a "todos los modelos Qwen 27B" o que alcanza "el 99 % de la potencia de BF16 a 4 y 8 bits" en variantes hermanas), pero no se aportan tablas con métricas como MMLU, HumanEval o GSM8K en el material proporcionado, por lo que no se recogen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos (27,78 B × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB de pesos, viable en una A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB de pesos, lo que permite ejecución en RTX 4090 (24 GB) o RTX 3090, siempre que exista una versión GGUF o GPTQ/AWQ, que este repositorio no incluye.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o L40S para 8 bits; RTX 4090 / 3090 para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 o 3090 con cuantización de 4 bits y siempre que se obtenga una versión cuantizada de los repositorios GGUF del autor.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM y TGI para servir en producción si el modelo es compatible con las versiones recientes de dichas herramientas; llama.cpp u Ollama únicamente a través de las versiones GGUF publicadas en repositorios hermanos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1 (este) | 27,78 B | no disponible | Apache 2.0 | safetensors | Fine-tune heretic de stage1, solo inglés, multimodal |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | no disponible en la información | safetensors | Modelo original alineado, sin reducción de censura |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored (mismo autor) | 27 B (aprox.) | no disponible | Apache 2.0 (según repositorio) | safetensors + GGUF | Variante hermana con reducción de tokens de razonamiento y quants NEO-CODER MAX |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (mismo autor) | 27 B (aprox.) | no disponible | Apache 2.0 (según repositorio) | safetensors + GGUF | Variante con 5 modos de razonamiento y 5 de instruct conmutables en chat |

## Limitaciones y advertencias

- El ajuste "uncensored" / "heretic" elimina o reduce los mecanismos de rechazo del modelo base, lo que incrementa el riesgo de generar contenido dañino, ofensivo o legalmente problemático; requiere filtros externos si se despliega de cara al público.
- Riesgo de alucinación: no hay datos de evaluación que cuantifiquen la fiabilidad factual de este fine-tune; los pipelines de tuning multi-etapa pueden degradar capacidades del base si no se controlan.
- Idiomas: la model card solo declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar experimentalmente el límite efectivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que el autor no detalla; conviene revisar la licencia del base antes de producción.
- El repositorio contiene solo safetensors; para inferencia local en hardware de consumo hay que acudir a los repositorios GGUF del autor, que pueden tener cuantizaciones no verificadas de forma independiente.
- Las afirmaciones de rendimiento de la model card (superar a todos los Qwen 27B, reducciones de tokens de razonamiento) no están respaldadas por tablas de benchmarks en la información disponible.
- Es una "stage1" de un proyecto en curso: el autor anuncia versiones posteriores (TWIN TURBO, ULTRA HERETIC, UltimateDetails2), por lo que la estabilidad y el soporte de esta variante pueden quedar obsoletos rápidamente.
- El repositorio tiene 55,6 GB y no incluye versiones cuantizadas, lo que encarece el almacenamiento y la transferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- GGUF release #1 (TURBO Fable Cold Fusion 735-882): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- GGUF release #2 (TWIN TURBO 709-L): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Fuente release #2: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Variante ULTRA HERETIC: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Proyecto UltimateDetails2 (stage1): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Qwen3.6-27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B Cold Fusion GAIN V1.1 (variante NM-DAU-NEO-MAX): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6-40B Claude-4.6-Opus-Deckard: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5-9B The Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
