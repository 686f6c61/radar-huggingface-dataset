# mrminjae/qwen3p6-35b-a3b-2p10bit-r113

## Resumen

Qwen3.6-35B-A3B (r113) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva de los expertos enrutados a una media de 2,10 bits. El resto de pesos del modelo se mantiene en BF16, y los pesos se almacenan de forma desquantizada en tensores BF16, de modo que cargan con `transformers` y vLLM estándar sin necesidad de kernels especiales de cuantización.

El modelo pertenece a la familia Qwen3.6 y emplea una arquitectura de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales, según los datos reales de safetensors. La etiqueta `qwen3_5_moe` y la pipeline `image-text-to-text` indican que el modelo base es multimodal (entrada de imagen y texto) y que este checkpoint conserva esa capacidad. El repositorio ocupa 70,2 GB.

Se trata de un artefacto de investigación interna (ID r113) sin descargas ni valoraciones en el momento de la consulta, y sin model card extendida más allá de la nota sobre el esquema de cuantización. Es relevante para quienes experimentan con compresión agresiva de modelos MoE y quieren evaluar el impacto de reducir los expertos a ~2 bits manteniendo el resto en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (etiqueta `qwen3_5_moe`); multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado del checkpoint Qwen/Qwen3.6-35B-A3B, que emplea una arquitectura de mezcla de expertos (MoE) con capacidades multimodales de entrada imagen-texto. La intervención realizada por mrminjae consiste en una cuantización selectiva: los expertos enrutados se comprimen a una media de 2,10 bits, mientras que el resto de los pesos (atención, embeddings, capas no expertas) permanece en BF16. Los pesos resultantes se almacenan desquantizados en tensores BF16, lo que permite cargarlos con `transformers` y vLLM sin kernels de cuantización específicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO en el modelo base. Tampoco se detalla la metodología exacta de cuantización (algoritmo, calibración, granularidad por experto). El identificador interno "r113" sugiere una iteración de un proceso de investigación, pero no se aportan detalles adicionales.

## Capacidades

- Generación de texto y conversación multi-turno, según la pipeline `text-generation` y la etiqueta `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), heredado del modelo base multimodal.
- Razonamiento y generación de código: capacidades esperables de la familia Qwen3.6, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión de modelos MoE: el checkpoint permite medir la degradación de calidad al reducir los expertos enrutados a ~2 bits manteniendo el resto en BF16, comparándolo directamente con el modelo base sin cuantizar.
- Evaluación de pipelines de inferencia estándar: al almacenarse desquantizado en BF16, se puede cargar con `transformers` y vLLM sin kernels especiales, lo que facilita pruebas de integración en infraestructuras existentes.
- Experimentos de ajuste fino sobre modelos comprimidos: sirve como punto de partida para estudiar si un modelo con expertos a baja precisión recupera calidad tras un fine-tuning adicional.
- Prototipado de aplicaciones multimodales imagen-texto: hereda la capacidad de entrada de imagen del modelo base, útil para pruebas de concepto de descripción de imágenes o respuesta a preguntas visuales.
- Benchmarking interno de robustez: permite comparar respuestas del modelo comprimido frente al base en tareas de razonamiento y generación, para cuantificar el coste de la compresión.
- Docencia y divulgación técnica: útil para explicar en talleres cómo funciona la cuantización selectiva por experto en arquitecturas MoE y qué efectos tiene sobre los pesos almacenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16 y ocupar el repositorio 70,2 GB, se requiere aproximadamente esa cifra de memoria, más overhead de activaciones y KV cache. No cabe en GPUs de consumo de 24 GB ni de 48 GB.
- GPU recomendadas: para carga completa en BF16, se necesitan GPUs con 80 GB o más (A100 80 GB, H100 80 GB) o configuraciones multi-GPU. No se dispone de datos de rendimiento específicos para este checkpoint.
- ¿Cabe en GPU de consumo? No en su forma actual de 70,2 GB en BF16; requeriría cuantización adicional por parte del usuario o sharding entre varias GPUs.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card. No se confirma soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r113 | 35.107.181.936 | no disponible | no disponible (sigue la del base) | safetensors (BF16 desquantizado) | Expertos enrutados a 2,10 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Modelo original sin compresión de expertos |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna ("Internal research checkpoint"): no está pensado como versión de producción ni cuenta con validación publicada.
- Sin benchmarks ni evaluaciones de calidad: se desconoce la degradación real frente al modelo base tras comprimir los expertos a 2,10 bits.
- Licencia no disponible de forma explícita: la model card remite a la licencia del modelo base, pero no se detalla, lo que genera incertidumbre sobre el uso comercial.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto no documentada: impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo derivado de Qwen3.6, hereda los sesgos del base, agravados potencialmente por la compresión.
- Repositorio de 70,2 GB en BF16: requiere hardware de gama alta y no es apto para despliegue en GPUs de consumo sin cuantización adicional.
- Cero descargas y valoraciones: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la procedencia y la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r113
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
