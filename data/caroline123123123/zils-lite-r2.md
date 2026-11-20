# Caroline123123123/zils-lite-r2

## Resumen

zils-lite-r2 es un modelo derivado (un "soup body" en la terminología del autor) construido sobre un fine-tune de vllm-sr/d3-lite, cuyo modelo padre es Qwen/Qwen3.5-0.8B. Lo publica el usuario Caroline123123123 en Hugging Face con licencia Apache 2.0. El modelo conserva la torre de visión del chasis original sin modificar y solo entrena las capas de lenguaje mediante LoRA, que se fusionan en FP32 y se almacenan en BF16.

El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y el repositorio ocupa 1,7 GB. Está etiquetado para la tarea de feature-extraction dentro de la librería transformers, con código personalizado (custom_code) y compatibilidad con endpoints. La model card describe un entrenamiento sobre ejemplos de decisión extraídos de los splits de entrenamiento de diversos datasets públicos etiquetados (AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5, poem_sentiment) y decisiones generadas programáticamente.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto experimental de un autor individual, sin descargas ni interacciones en el momento de la consulta, y con una model card incompleta (hiperparámetros como learning rate, epochs y seed figuran como None). No debe confundirse con un modelo de propósito general listo para producción; su interés reside en el linaje Qwen3.5-0.8B y en la técnica de composición de pesos ("soup") aplicada sobre un fine-tune de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; incluye torre de visión del chasis) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite, un fine-tune de Qwen/Qwen3.5-0.8B (commit 2fc06364). La arquitectura subyacente es la del transformer de Qwen3.5-0.8B, que incluye una torre de visión heredada del chasis y que en este artefacto permanece sin cambios. El autor aplica LoRA con r=16 y alpha=32 exclusivamente sobre las capas de lenguaje, fusiona los adaptadores en FP32 y guarda el resultado en BF16, generando así el "soup body" que da nombre al modelo.

El entrenamiento se realizó sobre ejemplos de decisión procedentes de los splits de entrenamiento de AG News, MNLI, BoolQ, ARC, CommonsenseQA, Banking77, SST-5 y poem_sentiment, además de decisiones generadas programáticamente; no se usaron splits de validación ni de test. La model card no especifica el número de ejemplos, el learning rate, las épocas ni la semilla (todos figuran como None o sin valor), lo que impide reproducir el entrenamiento. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá de la mencionada fusión LoRA y la composición de pesos.

## Capacidades

- Extracción de características (feature-extraction), que es la tarea declarada en el pipeline del modelo.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-0.8B, aunque no se documentan evaluaciones que lo confirmen en este artefacto.
- Procesamiento de decisiones y clasificación sobre las categorías de los datasets de entrenamiento (noticias, NLI, preguntas de sentido común, intenciones bancarias, sentimiento).
- Capacidades de visión heredadas de la torre del chasis, sin reentrenamiento (no se especifica qué tareas de visión cubre).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Extracción de embeddings para clasificación de texto: el pipeline declarado es feature-extraction, por lo que el uso natural es obtener representaciones vectoriales de textos para alimentar clasificadores posteriores en tareas como análisis de sentimiento (SST-5) o detección de intenciones (Banking77).
- Investigación sobre composición de pesos ("model soup"): sirve como artefacto de estudio para reproducir y analizar la técnica de fusión LoRA en FP32 y almacenamiento en BF16 sobre un modelo pequeño de 0,85 mil millones de parámetros.
- Experimentación con inferencia de decisión: dado que se entrenó con ejemplos de decisión de BoolQ, MNLI y ARC, puede usarse para probar la formulación de tareas de decisión binaria o de elección múltiple en un entorno controlado.
- Prototipado rápido en hardware modesto: con menos de mil millones de parámetros y 1,7 GB de pesos en BF16, cabe en GPUs de consumo para pruebas de concepto de extracción de características.
- Base para fine-tunes posteriores: al ser un modelo pequeño con licencia Apache 2.0, puede servir como punto de partida para adaptaciones específicas de clasificación o extracción de embeddings.
- Evaluación comparativa frente a Qwen3.5-0.8B: permite medir el efecto del fine-tune de decisión y de la fusión de pesos respecto al modelo padre en tareas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,7 GB solo para los pesos, más el overhead de activaciones y del runtime (aproximadamente 2-3 GB en total, estimación orientativa).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para los pesos; en 4 bits, alrededor de 0,5 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; las RTX 3060, RTX 4060, RTX 4090 y A100/H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-r2 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de decisión con fusión LoRA |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en la informacion | Hugging Face (modelo padre) | Modelo base original, sin fine-tune de decisión |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible en la informacion | Hugging Face | Fine-tune intermedio del que deriva zils-lite-r2 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card está incompleta: learning rate, épocas, semilla y número de ejemplos figuran como None o sin especificar, lo que impide reproducir el entrenamiento.
- No se usaron splits de validación ni de test, por lo que no hay garantía de generalización ni métricas de evaluación publicadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Los idiomas soportados no están declarados, lo que limita su uso en entornos multilingües sin evaluación previa.
- La longitud de contexto no está documentada; no debe asumirse la del modelo padre sin verificación.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al derivar de datasets públicos etiquetados, puede heredar sesgos de esos corpus.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de documentación desaconseja su uso en producción sin validación propia.
- El uso de custom_code implica revisar el código remoto antes de ejecutarlo, por motivos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caroline123123123/zils-lite-r2
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base del fine-tune: https://huggingface.co/vllm-sr/d3-lite
