# DavidAU/Qwen3.5-13B-GLM-4.7-Flash-DeepSeek-Polaris-Grande-Deep-Thinking

## Resumen

Qwen3.5-13B-GLM-4.7-Flash-DeepSeek-Polaris-Grande-Deep-Thinking es un modelo de lenguaje de 13.079.330.800 parámetros publicado por el usuario DavidAU en Hugging Face. Se trata de un fine-tune derivado de Qwen/Qwen3.5-9B, construido mediante la fusión (merge) y el escalado (upscale) de dos fine-tunes destilados de 9B, seguido de un ajuste final con Unsloth empleando datos generados con GLM 4.7 Flash. El autor lo describe como un modelo especialmente orientado a escritura creativa, ficción, roleplaying y generación de tramas, además de mantener competencia en instrucciones complejas y prompts de sistema extensos.

El modelo conserva la arquitectura de la familia Qwen3.5 (transformer denso, 48 capas y 639 tensores según la model card) y se distribuye en formato safetensors con precisión bfloat16, en un repositorio de 26,2 GB. La pipeline declarada es `image-text-to-text`, aunque la model card no documenta explícitamente capacidades de visión más allá de esa etiqueta. Los idiomas declarados son inglés y chino, y la licencia es Apache 2.0.

Su relevancia actual reside en el nicho de los modelos comunitarios de escritura creativa: el autor afirma haber corregido problemas de bucle y repetición mediante una plantilla Jinja depurada y ampliada con herramientas, aplicada tanto en entrenamiento como en la versión final. No obstante, la información pública disponible es escasa en cuanto a benchmarks, datos de entrenamiento y evaluación objetiva, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; 48 capas, 639 tensores según model card) |
| Parametros totales | 13.079.330.800 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16; el autor menciona uso con Q4KS en LM Studio) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se construye en dos fases según la model card: primero una fusión (merge) y escalado (upscale) de dos fine-tunes destilados de 9B, y después un ajuste fino final con Unsloth sobre el resultado, utilizando GLM 4.7 Flash como generador de datos de destilación. El resultado es un modelo denso de 13B con 48 capas y 639 tensores, distribuido en bfloat16. La model card menciona el uso de una plantilla Jinja "actualizada (herramientas) y depurada" que corrige problemas de bucle y repetición, aplicada tanto durante el entrenamiento como en el modelo final.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias más allá del proceso de merge, upscale y destilación descrito. La etiqueta `image-text-to-text` en la pipeline sugiere capacidades multimodales heredadas del modelo base, pero la model card no las describe ni las ejemplifica.

## Capacidades

- Generación de texto creativo: ficción, narrativa, descripción vívida y "prosing" detallado, con énfasis declarado en escritura de historias, subtramas, escenas y continuaciones.
- Roleplaying y escritura de diálogo, con soporte declarado para múltiples géneros (ciencia ficción, romance, terror, etc.).
- Seguimiento de instrucciones complejas y prompts de sistema extensos, incluyendo skillsets estructurados como el ejemplo de la model card.
- Modo de razonamiento explícito ("deep thinking"): el ejemplo de generación muestra bloques `<think>` con planificación y descomposición del prompt antes de la respuesta.
- Soporte de tool calling / function calling: la model card indica que la plantilla Jinja fue actualizada con herramientas, aunque no se detalla el formato exacto.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Etiqueta de pipeline `image-text-to-text`, que sugiere entrada de imagen y texto, si bien no hay documentación adicional sobre el alcance real de la visión.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo está ajustado específicamente para generar escenas vívidas, tramas y subtramas con instrucciones de estilo detalladas; resulta adecuado para autores que necesitan borradores con estructura narrativa y diálogo equilibrado.
- Roleplaying y juegos de rol por texto: su entrenamiento en diálogo, personajes y arcos narrativos permite mantener conversaciones multi-turno con consistencia de personaje y tono.
- Generación de contenido creativo con prompts de sistema complejos: el ejemplo de la model card demuestra que puede seguir un skillset jerárquico extenso y respetar proporciones explícitas (50 % diálogo, 25 % narración, etc.).
- Asistencia a guionistas y escritores de guiones: puede continuar escenas, generar variaciones de una misma premisa y producir diálogo con subtramas, útil en fases de ideación y borrador.
- Prototipado de agentes conversacionales con razonamiento visible: el modo `<think>` permite inspeccionar la planificación del modelo antes de la respuesta, útil para depurar prompts y flujos de agente.
- Experimentación e investigación en destilación y merging de modelos: al ser un merge/upscale de fine-tunes destilados con GLM 4.7 Flash, sirve como caso de estudio para quienes investigan técnicas de fusión de pesos y destilación de datos.
- Generación de contenido en inglés y chino: para equipos que necesitan un único modelo creativo en ambos idiomas, dentro de las limitaciones de calidad no evaluada en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 26 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 32 GB de VRAM para contexto corto y 40-48 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13-14 GB de pesos, con margen para caché KV; viable en GPUs de 24 GB.
- VRAM estimada en cuantización de 4 bits (Q4): aproximadamente 7-8 GB de pesos; el autor menciona explícitamente el uso de Q4KS en LM Studio, lo que sugiere viabilidad en GPUs consumer de 12-16 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para bfloat16 sin compromisos; RTX 4090 (24 GB) para 8 bits o bfloat16 con contexto reducido; RTX 3090/4080 (16-24 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en cuantización Q4 en GPUs de 12 GB o más; en bfloat16 requiere GPUs de gama profesional o configuraciones multi-GPU.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/GGUF (el autor usa LM Studio con Q4KS, lo que implica conversión a GGUF), vLLM y TGI previsiblemente compatibles al ser un transformer estándar de Qwen3.5, aunque no se documentan recetas oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-13B-GLM-4.7-Flash-DeepSeek-Polaris-Grande-Deep-Thinking | 13,08B | No disponible | Apache 2.0 | Escritura creativa, ficción, roleplaying | Hugging Face (DavidAU) |
| Qwen/Qwen3.5-9B (modelo base) | 9B | No disponible | No disponible en la informacion proporcionada | Uso general | Hugging Face (Qwen) |
| Fine-tunes creativos de 13B de la comunidad (p. ej. variantes de Qwen o Llama) | ~13B | Variable | Variable (frecuentemente Apache 2.0 o licencias comunitarias) | Escritura creativa y roleplaying | Hugging Face |

La comparativa objetiva con alternativas concretas no está disponible en la información proporcionada: no hay benchmarks ni evaluaciones que permitan situar este modelo frente a otros de su categoría. El modelo base Qwen3.5-9B es la referencia natural, pero no se documentan sus especificaciones de contexto ni licencia en los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de rendimiento en MMLU, HumanEval, GSM8K ni evaluaciones de escritura, por lo que las afirmaciones de la model card no están verificadas de forma independiente.
- Riesgo de alucinación y de degradación en tareas factuales: es un modelo orientado a creatividad y destilado, no un modelo de conocimiento verificado; no debe usarse como fuente de hechos sin comprobación.
- Idiomas limitados a inglés y chino: no hay soporte declarado para español ni otros idiomas, y la calidad en chino no está evaluada.
- Longitud de contexto no documentada: impide planificar su uso en tareas de contexto largo sin pruebas previas.
- Procedencia comunitaria: el autor es un particular (DavidAU), no el equipo de Qwen; el proceso de merge, upscale y destilación no está descrito con detalle reproducible, lo que dificulta auditar sesgos o contaminación de datos.
- Contenido sensible: el ajuste para ficción y terror puede producir contenido explícito o violento si se le solicita; requiere moderación en aplicaciones de cara al público.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar que la licencia del modelo base sea compatible y revisar las condiciones de los datos de destilación con GLM 4.7 Flash.
- Etiqueta `image-text-to-text` sin documentación: no se debe asumir capacidad de visión fiable sin pruebas.
- El ejemplo de la model card está generado con cuantización Q4KS, lo que sugiere que la calidad mostrada corresponde a una versión cuantizada y no a bfloat16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-13B-GLM-4.7-Flash-DeepSeek-Polaris-Grande-Deep-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Unsloth (herramienta de ajuste fino mencionada): https://github.com/unslothai/unsloth
