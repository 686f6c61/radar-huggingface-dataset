# bayliner1980/Qwen3.5-2B-MoE-A1.3B

## Resumen

Qwen3.5-2B-MoE-A1.3B es un experimento de conversión de un modelo denso en un modelo de mezcla de expertos (MoE) sin reentrenamiento previo. Lo desarrolla el usuario independiente bayliner1980 a partir del modelo de texto de Qwen/Qwen3.5-2B, al que se le sustituye cada bloque MLP SwiGLU por 32 expertos de 192 neuronas con un router que activa los 12 mejores por token. El resultado mantiene los 24 capas y el tamaño oculto originales, pero reduce el cómputo activo del MLP al 37,5% del modelo denso.

El modelo tiene 1.888.165.696 parámetros totales según los pesos en safetensors, y el autor declara 1,32B de parámetros activos por token (813M excluyendo embeddings). La arquitectura de atención se conserva intacta: Gated DeltaNet combinada con atención completa con puerta, con un tamaño oculto de 2048 y un vocabulario de 248.320 tokens con embeddings atados.

Es relevante como prueba de concepto de "moefication": demuestra que se puede transformar un transformer denso en un MoE sin pretraining, a costa de una degradación medible en perplejidad y en tareas de conocimiento. No está pensado para producción ni para uso factual, sino como objeto de estudio sobre eficiencia computacional y enrutamiento de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + atención completa con puerta; MLP convertido a MoE (32 expertos, top-12) |
| Parametros totales | 1.888.165.696 |
| Parametros activos | 1,32B por token (813M excluyendo embeddings) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiqueta declarada); no se detallan niveles concretos |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF referenciado en etiquetas |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de 24 capas que alterna Gated DeltaNet con atención completa con puerta, tamaño oculto de 2048 y vocabulario de 248.320 tokens con embeddings atados. La modificación consiste en dividir cada MLP SwiGLU de 6144 neuronas en 32 expertos de 192 neuronas y añadir un router que selecciona los 12 expertos con mayor puntuación por token. Esto deja el cómputo activo del MLP en el 37,5% del original y sitúa los parámetros activos en 1,32B por token.

No hubo pretraining tras la conversión: el autor describe el proceso como "moefication" y lo etiqueta también como destilación. Las capas de atención, los embeddings y el vocabulario no se modifican. El modelo se probó con transformers 5.5.0 y requiere el paquete `fla-core` para disponer de kernels rápidos de DeltaNet. El modo thinking no fue entrenado después de la conversión y el autor recomienda mantenerlo desactivado.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat (`apply_chat_template`).
- Razonamiento básico y respuesta a preguntas de sentido común, con rendimiento inferior al modelo denso de partida.
- Ejecución eficiente en cómputo: solo se activa el 37,5% del MLP original por token.
- Compatibilidad con el pipeline `text-generation` de transformers y con endpoints compatibles.
- Soporte de cuantización GGUF para despliegue en entornos con recursos limitados.
- No dispone de visión, audio ni tool calling documentados.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- Capacidad factual muy degradada: el recuerdo de hechos cae del 0,948 al 0,760 en la evaluación del autor.

## Casos de uso

- Investigación sobre MoE y enrutamiento: permite estudiar cómo se comporta un router entrenado de forma implícita al dividir un MLP denso, comparando la selección de expertos con el modelo original.
- Experimentos de eficiencia computacional: sirve para medir el ahorro real de cómputo (37,5% del MLP) frente a la pérdida de calidad en perplejidad y tareas de sentido común.
- Docencia y divulgación: es un ejemplo reproducible de conversión denso a MoE sin pretraining, útil para explicar mezcla de expertos con números concretos.
- Prototipado de pipelines de generación de texto en inglés donde el coste de inferencia prime sobre la precisión factual, con la advertencia de no usarlo para datos verificables.
- Pruebas de cuantización GGUF: permite evaluar cómo afecta la cuantización a un modelo MoE de 1,89B parámetros totales en hardware de consumo.
- Benchmarking de kernels DeltaNet: al requerir `fla-core`, es útil para validar el rendimiento de los kernels rápidos de Gated DeltaNet en transformers 5.5.0.
- Generación de texto creativo o de relleno donde no se exija exactitud factual, como borradores o ejemplos sintéticos.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-2B (denso) | Este modelo |
|---|---|---|
| Wikitext-2 ppl (↓) | 13,60 | 14,68 (+7,9%) |
| C4 ppl (↓) | 18,73 | 25,29 (+35%) |
| HellaSwag | 0,565 | 0,497 |
| ARC-Easy | 0,679 | 0,664 |
| ARC-Challenge | 0,413 | 0,370 |
| WinoGrande | 0,623 | 0,579 |
| OpenBookQA | 0,350 | 0,324 |
| Media de tareas | 0,526 | 0,487 |
| Recuerdo de hechos (287 hechos) | 0,948 | 0,760 |

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 3,8 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV.
- En cuantización GGUF de 8 bits, aproximadamente 2 GB; en 4 bits, alrededor de 1 GB, aunque no se detallan los niveles publicados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100); para 4 bits basta con 4 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers 5.5.0 con `fla-core` para kernels DeltaNet; llama.cpp u Ollama mediante los GGUF referenciados.
- Latencia y throughput: no disponibles; el autor solo indica que el cómputo activo del MLP es el 37,5% del denso.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-MoE-A1.3B | 1,89B | 1,32B | no disponible | Apache 2.0 | Conversión MoE sin pretraining; media de tareas 0,487 |
| Qwen3.5-2B (denso) | 1,88B | 1,88B | no disponible | Apache 2.0 | Modelo base; media de tareas 0,526 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Degradación medible frente al modelo denso: perplejidad en C4 un 35% peor y media de tareas 0,487 frente a 0,526.
- Recuerdo factual muy reducido (0,760 frente a 0,948); el autor advierte explícitamente de no confiar en él para hechos.
- El modo thinking no fue entrenado tras la conversión y debe mantenerse desactivado.
- Solo soporta inglés según la model card; no se documentan otros idiomas.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación elevado por la pérdida de conocimiento factual y la falta de ajuste posterior.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial, pero la calidad del modelo no lo hace recomendable para producción.
- Requiere transformers 5.5.0 y `fla-core`; la compatibilidad con versiones anteriores no está garantizada.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validación externa ni comunidad que reporte fallos.
- No se documentan sesgos específicos, aunque al derivar de Qwen3.5-2B hereda los del modelo base, no evaluados en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/bayliner1980/Qwen3.5-2B-MoE-A1.3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Apoyo al autor: https://ko-fi.com/bayliner1980
