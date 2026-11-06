# ansulev/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario ansulev en Hugging Face. Se distribuye como un modelo multimodal de tipo image-text-to-text, con pesos en formato safetensors y compatibilidad con la librería transformers. El repositorio ocupa 55,6 GB y contiene 27.781.427.952 parámetros totales según los metadatos de safetensors. La model card está íntegramente en inglés y describe el modelo como parte de una familia más amplia de variantes ("SUPER Qwen Universe") con versiones de 9B, 27B y 40B.

El modelo se presenta como una variante "uncensored" y "heretic" del Qwen3.8-27B, orientada a eliminar restricciones de censura y a reducir el número de tokens de razonamiento. La model card menciona técnicas de entrenamiento como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", así como el uso de la herramienta unsloth. No obstante, la información técnica concreta sobre la composición del dataset, el número de tokens de entrenamiento o los métodos de alineación (RLHF/DPO) no está disponible en la información proporcionada.

La relevancia de este modelo radica en su enfoque en la reducción de tokens de razonamiento (mencionada como reducción de 1/2 a 1/10 o 1/20) y en la posibilidad de cambiar entre modos de razonamiento e instrucción, aunque estos detalles se atribuyen a otras variantes de la familia y no se confirman para esta versión concreta. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento muy reciente o de baja difusión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5 en los tags; se desconoce la arquitectura exacta) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona GGUFs en repositorios externos, pero no se detallan los tipos en este repo) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Los tags incluyen "qwen3_5", "qwen3_8" y "qwen3_6", lo que sugiere una base derivada de la familia Qwen 3.5/3.6/3.8, pero no se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida. El pipeline declarado es image-text-to-text, lo que implica capacidades multimodales de entrada (imagen y texto), aunque no se detalla el codificador visual ni la forma de fusión.

En cuanto al entrenamiento, la model card menciona técnicas como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", así como el uso de unsloth. Se indica que se emplearon varios finetunes propios y de terceros, pero no se aportan datos sobre el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se confirman innovaciones técnicas como decodificación especulativa o atención lineal para esta versión concreta; las menciones a reducción de tokens de razonamiento y modos conmutables se refieren a otras variantes de la familia.

## Capacidades

- Generación de texto conversacional en inglés, según el tag "conversational".
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que permite entrada multimodal.
- Orientación a "uncensored" y "heretic": el autor indica que se ha reducido la censura, aunque no se especifica el alcance ni los métodos.
- Posible soporte de modos de razonamiento e instrucción conmutables, según la model card, pero esta característica se atribuye a otras variantes (TWIN TURBO) y no se confirma para esta versión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; no se confirman otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): se declara visión por el pipeline image-text-to-text; no se confirma audio ni thinking mode para esta versión.

## Casos de uso

- Generación de texto creativo y narrativo en inglés: el modelo puede emplearse para redactar ficción, guiones o contenido largo, aprovechando su naturaleza conversacional y su orientación a usos creativos según la familia de la que forma parte.
- Análisis de imágenes con descripción textual: gracias al pipeline image-text-to-text, puede recibir una imagen y generar una descripción o responder preguntas sobre ella, útil en tareas de accesibilidad o catalogación.
- Experimentación en investigación sobre alineación y censura: al ser una variante "uncensored" y "heretic", sirve para estudiar el comportamiento de modelos sin restricciones y comparar con versiones alineadas.
- Prototipado de asistentes conversacionales en inglés: su formato safetensors y compatibilidad con transformers permiten integrarlo en pipelines de generación de texto para chatbots de dominio general.
- Evaluación comparativa de finetunes de Qwen: investigadores pueden usar este modelo como punto de comparación frente a otras variantes de la familia (Qwen3.6, Qwen3.8) para medir el efecto de las técnicas de ajuste aplicadas.
- Despliegue en entornos con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias más copyleft, siempre que se cumplan las condiciones de la licencia.
- Generación de código y matemáticas: no se confirma en la información disponible; la model card menciona variantes "NEO-CODER" en otros repositorios, pero no se atribuye a esta versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros, en FP16 se requieren aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB. Estas estimaciones son orientativas y no están confirmadas en la información proporcionada.
- GPU recomendadas: para FP16, se necesitan GPUs con 80 GB (A100, H100) o múltiples GPUs. Para 8 bits, una RTX 4090 (24 GB) podría ser insuficiente para los pesos más el contexto; se recomendaría una A6000 (48 GB) o similar. Para 4 bits, una RTX 4090 o RTX 3090 (24 GB) podría alojar el modelo, aunque el contexto disponible limitaría la ventana.
- ¿Cabe en consumer GPU? En cuantización de 4 bits, sí es posible en GPUs de 24 GB como la RTX 4090, siempre que se ajuste la longitud de contexto. En 8 bits, no cabe en GPUs consumer de 24 GB.
- Opciones de despliegue: la librería declarada es transformers; la model card menciona GGUFs en repositorios externos, lo que sugiere compatibilidad con llama.cpp u Ollama, pero no se confirma en este repo. vLLM y TGI no se mencionan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (este) | 27,78 B | no disponible | Apache 2.0 | safetensors | Finetune uncensored de Qwen3.8-27B |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | no disponible | Modelo base declarado; sin datos adicionales |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF | no disponible | no disponible | no disponible | GGUF | Variante de la misma familia, según la model card |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | 9 B (según nombre) | no disponible | no disponible | GGUF | Variante de menor tamaño de la misma familia |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa fiable. La comparativa se limita a la información nominal disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al ser un finetune "uncensored", es probable que se hayan reducido las salvaguardas, lo que puede aumentar la generación de contenido sesgado u ofensivo.
- Riesgo de alucinación: no se cuantifica; como modelo de lenguaje generativo, existe riesgo inherente, agravado por la falta de benchmarks publicados.
- Limitaciones de contexto o idioma: solo se declara inglés; no se especifica la longitud de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener condiciones adicionales; no se detallan en la información proporcionada.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, lo que sugiere falta de validación por la comunidad; la model card es extensa pero poco técnica y contiene referencias a otras variantes que no se confirman para esta versión; no se han publicado benchmarks ni datos de entrenamiento verificables.
- La model card incluye enlaces a repositorios de terceros (DavidAU) y menciona fechas futuras (2026), lo que puede indicar inconsistencias o un contexto temporal no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/ansulev/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- GGUF release #1 (mencionado en la model card): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- GGUF release #2 (mencionado): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Fuente release #2 (mencionado): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Release #3 (mencionado): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Qwen3.6 27B (mencionado): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8 27B Cold Fusion GAIN (mencionado): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6 40B (mencionado): https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5 9B (mencionado): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
