# JadeSpartan/ParkingLot_v1

## Resumen
ParkingLot_v1 es un modelo de lenguaje de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) desarrollado por JadeSpartan, un autor independiente que publica en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated, que a su vez deriva de la familia Qwen3.5 de Alibaba. El modelo está orientado específicamente a la programación, con especial énfasis en el lenguaje Rust, y ha pasado por dos rondas de ajuste fino según indica su model card.

El modelo se presenta como el sucesor de Qwenstation_Rustv0.1e, una primera incursión del autor en el ajuste fino para código. La relevancia de este modelo es limitada: se publicó el 11 de noviembre de 2026, cuenta con cero descargas y cero "likes" en el momento de redactar esta ficha, y no dispone de resultados de benchmarks publicados. Su interés radica en ser un ejemplo de ajuste fino comunitario sobre una base Qwen3.5, utilizando la librería Unsloth para acelerar el entrenamiento, y en su enfoque declarado hacia Rust y tareas de codificación conversacional.

La arquitectura subyacente es la de Qwen3.5, un transformer multimodal (etiquetado como image-text-to-text en el pipeline), aunque el ajuste fino se centra en texto y código. El contexto, los tipos de cuantización y otros detalles técnicos no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; multimodal image-text-to-text según pipeline_tag) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen3.5, un transformer de la familia Qwen desarrollada por Alibaba, en su variante de aproximadamente 4B parámetros. El pipeline_tag declarado es image-text-to-text, lo que sugiere que la base Qwen3.5-4B incorpora capacidades multimodales (visión-lenguaje), aunque el ajuste fino de ParkingLot_v1 se orienta a generación de texto y código. El modelo base inmediato es huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated, una versión "abliterated" (con los rechazos de seguridad atenuados) publicada por huihui-ai.

El entrenamiento consistió en dos rondas de ajuste fino supervisado (SFT) según la model card. Los datasets utilizados son Fortytwo-Network/Strandset-Rust-v1, un conjunto orientado a Rust, y allenai/tulu-3-sft-personas-instruction-following, un dataset de instrucciones con personas de Tulu 3 de AI2. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en inglés, con especial atención a tareas de programación.
- Generación y asistencia en código, con énfasis declarado en el lenguaje Rust (según los tags y el dataset de entrenamiento).
- Capacidades multimodales heredadas de la base Qwen3.5 (pipeline image-text-to-text), aunque no se documenta su alcance ni su calidad tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo de razonamiento (thinking mode), visión o audio: no documentado; la base es multimodal pero el ajuste se centra en texto y código.

## Casos de uso
- Asistencia en programación Rust: el modelo se ha ajustado con el dataset Strandset-Rust-v1, por lo que puede emplearse para generar fragmentos de código Rust, sugerir correcciones y explicar patrones idiomáticos del lenguaje en entornos de desarrollo.
- Generación de código en pipelines de integración continua: podría integrarse en herramientas de revisión automática de código o generación de tests, aunque la ausencia de benchmarks y de soporte documentado de tool calling limita su uso en producción sin validación previa.
- Prototipado rápido de scripts y utilidades: al ser un modelo de 4,66B parámetros, puede ejecutarse en hardware moderado y servir para generar borradores de código en tareas de scripting.
- Experimentación académica sobre ajuste fino: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre una base Qwen3.5, útil para investigadores que estudien el efecto de datasets específicos de dominio (Rust) en modelos pequeños.
- Chat técnico conversacional en inglés: puede emplearse en asistentes de documentación técnica o soporte a desarrolladores que trabajen en inglés, dado su entrenamiento con instrucciones de Tulu 3.
- Evaluación de modelos "abliterated": permite estudiar el comportamiento de un modelo con rechazos atenuados tras un ajuste fino adicional, en contextos de investigación sobre seguridad y alineamiento.
- Tareas multimodales básicas: al heredar el pipeline image-text-to-text, podría emplearse en experimentos de descripción de imágenes o preguntas sobre imágenes, aunque no hay documentación que respalde su calidad en estas tareas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con pesos en safetensors a precisión completa (fp16/bf16), el modelo de 4,66B parámetros requiere aproximadamente 9,3 GB de VRAM (coherente con el tamaño del repo de 9,3 GB). En cuantización de 8 bits, alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: para fp16, una GPU con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A10, L4). Para cuantizaciones de 4 bits, cabe en GPUs consumer con 6-8 GB (RTX 3060, RTX 4060).
- Cabe en GPU consumer: sí, especialmente en cuantizaciones de 8 y 4 bits; en fp16 requiere GPUs de gama alta consumer o profesionales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag incluido), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ParkingLot_v1 | 4,66B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino para Rust sobre Qwen3.5-4B abliterated |
| huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated | ~4B | No disponible | No disponible en esta ficha | Hugging Face | Modelo base inmediato, abliterated |
| Qwen3.5-4B (base original) | ~4B | No disponible | No disponible en esta ficha | Hugging Face | Base de la familia Qwen3.5 de Alibaba |
| Qwenstation_Rustv0.1e | No disponible | No disponible | No disponible en esta ficha | Hugging Face | Predecesor del autor, también orientado a Rust |

## Limitaciones y advertencias
- Sesgos conocidos: al derivar de un modelo "abliterated" (con rechazos de seguridad atenuados), es probable que el modelo genere contenido que otros modelos rechazarían; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks; en tareas de código, el riesgo de generar APIs o funciones inexistentes es relevante y debe validarse con tests.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está documentada, lo que impide planificar usos con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base (huihui-ai) y de los datasets utilizados (Strandset-Rust-v1 y tulu-3), que pueden imponer condiciones adicionales.
- Caveats para producción: cero descargas y cero validaciones comunitarias; ausencia de benchmarks, de documentación sobre tool calling y de cuantizaciones publicadas; el modelo es un experimento personal del autor y no está respaldado por una organización.
- El pipeline declarado es image-text-to-text, pero el ajuste fino se centra en texto y código; el rendimiento multimodal no está documentado y podría haberse degradado tras el ajuste.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/JadeSpartan/ParkingLot_v1
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated
- Dataset Strandset-Rust-v1: https://huggingface.co/datasets/Fortytwo-Network/Strandset-Rust-v1
- Dataset Tulu 3 SFT personas: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Predecesor Qwenstation_Rustv0.1e: https://huggingface.co/JadeSpartan/Qwenstation_Rustv0.1e
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
