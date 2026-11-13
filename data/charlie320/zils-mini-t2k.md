# Charlie320/zils-mini-t2k

## Resumen

zils-mini-t2k es un modelo de decisión de 4.539 millones de parámetros (aproximadamente 4,5 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de modelos tipo soup denominado `d3-mini` de Zils, asociado a la subred 127 de Bittensor. El modelo parte de Qwen/Qwen3.5-4B y se ha obtenido mediante un fine-tune con LoRA de rango 64 fusionado sobre una media uniforme de varios modelos previos de la misma línea.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino una pieza dentro de un ecosistema de modelos de decisión que se entrenan y evalúan en el contexto de una subred de Bittensor. El entrenamiento se ha realizado con ítems de decisión en formato de examen generados a partir de recetas públicas de autoría, lo que lo orienta a tareas de elección y clasificación más que a generación libre de texto.

La información pública disponible es escasa: la model card es breve, no incluye resultados de benchmarks, no detalla la composición exacta del dataset ni declara idiomas soportados. La licencia es Apache 2.0, lo que facilita su reutilización, aunque el autor advierte de que deben revisarse los términos de los datasets de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B, layout "chassis"; incluye vision tower heredada del modelo padre) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. Según la model card, se emplea el "chassis layout" e incluye la torre de visión heredada del modelo padre, aunque no se especifica qué componentes se han congelado o modificado. Los pesos se publican en BF16.

El proceso de entrenamiento combina varias fuentes: se parte de una media uniforme de los dos "bodies" actuales del pool `z3-mini` y del modelo de la línea propia `zils-mini-hg3`. Sobre esa media se ejecuta un único fine-tune con LoRA de rango 64 (anchor 0.1, learning rate 5e-5, dos épocas) que posteriormente se fusiona en el modelo inicial. Los datos de entrenamiento son ítems de decisión en formato de examen, generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils. El autor indica que no se usaron ítems de examen de validador ni ítems semilla públicos. No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-4B.
- Toma de decisiones en formato de examen: selección entre opciones, clasificación y respuesta a ítems estructurados, que es el objetivo declarado del fine-tune.
- Capacidades de visión potenciales por la torre visual heredada del modelo padre, aunque no se documenta su funcionamiento ni su calidad tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en subredes Bittensor: el modelo puede desplegarse como candidato dentro del pool `d3-mini` de la subred 127 y compararse con otros "bodies" mediante los exámenes públicos del ecosistema Zils.
- Clasificación y elección entre opciones en pipelines de decisión: su entrenamiento con ítems en formato de examen lo hace adecuado para tareas donde la salida es una opción entre varias, como enrutado de consultas o selección de respuestas.
- Investigación sobre model soups: sirve como caso de estudio reproducible de la técnica de media de pesos más LoRA fusionado, útil para estudiar cómo afecta la fusión al rendimiento en tareas específicas.
- Base para fine-tunes posteriores: al ser un modelo de 4,5 mil millones de parámetros con licencia Apache 2.0 y pesos en safetensors, puede reutilizarse como punto de partida para ajustes adicionales en tareas de decisión.
- Generación de datos sintéticos de examen: puede emplearse para producir ítems de decisión siguiendo la receta pública de autoría, siempre que se respeten los términos de los datasets de origen.
- Experimentación con modelos que incluyen torre de visión: para prototipos que requieran entrada multimodal, aunque la calidad de la componente visual tras el fine-tune no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más memoria para el contexto y las activaciones; en la práctica, se recomienda al menos 12-16 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con throughput alto; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 12 GB o más si se cuantiza; en 8 GB solo con cuantización agresiva y contexto corto.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se conviertan los pesos safetensors a GGUF para las opciones de CPU/consumer.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-t2k | 4,539 M | no disponible | Apache 2.0 | Hugging Face (Charlie320) |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | no disponible | no disponible | Hugging Face (Qwen) |
| Charlie320/zils-mini-hg3 | no disponible | no disponible | no disponible | Hugging Face (Charlie320) |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face (jaysun007) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su fine-tune está orientado a ítems de decisión en formato de examen, por lo que su rendimiento en generación libre, código o matemáticas puede degradarse respecto a la base Qwen3.5-4B.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Idiomas no declarados: no se especifica qué lenguas cubre el entrenamiento, lo que supone un riesgo para despliegues multilingües.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio de los ítems de examen.
- Sesgos: no documentados; los datos de entrenamiento provienen de modelos generadores (Claude Opus y un modelo abierto local) y de splits públicos, lo que puede introducir sesgos de esos profesores.
- Restricciones de licencia: los pesos son Apache 2.0, pero el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar el modelo o sus salidas.
- Caveat de producción: al ser un modelo de la línea Zils y de una subred Bittensor, su idoneidad depende del ecosistema de validación de esa subred; no hay garantías de soporte ni mantenimiento.
- La torre de visión heredada no está documentada tras el fine-tune, por lo que no debe asumirse un rendimiento multimodal fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base (body): https://huggingface.co/jaysun007/zils-mini-body-m10
- Modelo base (línea propia): https://huggingface.co/Charlie320/zils-mini-s3l
- Modelo base (línea propia): https://huggingface.co/Charlie320/zils-mini-hg3
