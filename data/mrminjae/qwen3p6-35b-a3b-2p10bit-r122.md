# mrminjae/qwen3p6-35b-a3b-2p10bit-r122

## Resumen

Qwen3.6-35B-A3B-2.10bit (r122) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: únicamente los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, capas densas y router) permanece en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo base pertenece a la familia Qwen3.6, una arquitectura Mixture-of-Experts (MoE) con 45.844.600.176 parámetros totales según los safetensors del repositorio y una designación comercial de 35B con aproximadamente 3B parámetros activos por token. La ficha del autor lo etiqueta como `qwen3_5_moe` y `image-text-to-text`, lo que sugiere capacidades multimodales, aunque no se aportan detalles adicionales sobre el entrenamiento ni sobre el proceso de cuantización más allá del valor medio de 2,10 bits por experto.

La relevancia de este checkpoint es doble: por un lado, explora los límites de la compresión extrema en modelos MoE manteniendo el resto de la red en alta precisión; por otro, al almacenar los pesos dequantizados en BF16, el repositorio ocupa 91,7 GB, por lo que no reduce el espacio en disco respecto al modelo original, sino que traslada el ahorro a la fase de entrenamiento o a la reconstrucción de pesos de baja precisión. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), etiqueta `qwen3_5_moe` |
| Parámetros totales | 45.844.600.176 |
| Parámetros activos | aproximadamente 3B (según la designación A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | sigue la licencia del modelo base (no especificada en la información disponible) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE), identificada en los metadatos como `qwen3_5_moe`. La designación "35B-A3B" indica 35 mil millones de parámetros nominales con aproximadamente 3 mil millones activos por token, aunque el recuento real de safetensors asciende a 45.844.600.176 parámetros totales. La innovación de este checkpoint concreto no reside en el entrenamiento, sino en el esquema de compresión: solo los expertos enrutados se cuantizan a una media de 2,10 bits, mientras que el router, la atención, los embeddings y las capas compartidas se mantienen en BF16. Esta estrategia busca preservar la estabilidad del enrutamiento y de las representaciones de alta precisión mientras se comprime la parte mayoritaria de los parámetros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el método exacto de cuantización (por ejemplo, cuantización post-entrenamiento con escalas por grupo, GPTQ, AWQ o una variante propia) más allá del valor medio de 2,10 bits. El autor indica que los pesos se almacenan dequantizados en tensores BF16, lo que implica que la inferencia se ejecuta en BF16 y el ahorro de precisión solo se materializa si el usuario reconstruye los pesos cuantizados.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según la etiqueta `text-generation` y `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), lo que apunta a capacidades multimodales de entrada, aunque no se detallan tareas concretas de visión.
- Razonamiento y matemáticas: capacidades esperables del modelo base Qwen3.6, no verificadas en la información proporcionada.
- Generación de código: no confirmada explícitamente en la información disponible.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite estudiar cómo afecta una media de 2,10 bits en los expertos a la perplejidad, la estabilidad del router y la calidad de generación, comparándolo con el modelo base en BF16.
- Evaluación de robustez del enrutamiento: al mantener el router en BF16 y comprimir solo los expertos, se puede aislar el impacto de la cuantización en la selección de expertos frente al impacto en la representación interna.
- Reproducción de experimentos académicos: sirve como punto de partida para replicar estudios de compresión de MoE con presupuestos de bits muy bajos y comparar metodologías.
- Pruebas de compatibilidad de herramientas: al cargar con `transformers` y vLLM estándar, permite validar pipelines de inferencia sin kernels personalizados, útil para equipos que evalúan infraestructura.
- Análisis de compromiso precisión-tamaño: aunque el repositorio ocupa 91,7 GB en BF16, el checkpoint documenta la relación entre bits efectivos por experto y calidad, útil para decidir esquemas de despliegue en entornos con memoria limitada.
- Base para destilación o ajuste fino posterior: los pesos dequantizados pueden servir como inicialización para experimentos de recuperación de calidad mediante fine-tuning ligero sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, el modelo requiere aproximadamente 91,7 GB solo para los pesos, más overhead de activaciones y caché KV. En la práctica, se necesitan al menos 2 GPU de 80 GB (A100/H100) o 4 GPU de 48 GB para cargar el modelo completo.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU con NVLink. Para una sola GPU, no es viable en BF16.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin técnicas adicionales de offloading o cuantización en tiempo de carga, que no están documentadas para este checkpoint.
- Opciones de despliegue: `transformers` y vLLM estándar, según indica el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con aproximadamente 3B parámetros activos, el throughput por token debería ser favorable en comparación con un modelo denso de 45B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r122 | 45,84B | ~3B (no confirmado) | no disponible | sigue la del base (no especificada) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la información | ~3B (por designación) | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría en términos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo describe como "internal research checkpoint", sin garantías de calidad ni soporte.
- Cuantización extrema: una media de 2,10 bits en los expertos enrutados puede degradar notablemente la calidad de generación y el razonamiento en comparación con el modelo base en BF16; no se aportan métricas que cuantifiquen esa degradación.
- Tamaño en disco sin reducción: al almacenarse dequantizado en BF16, el repositorio ocupa 91,7 GB, por lo que no ofrece ventajas de almacenamiento frente al modelo original.
- Licencia incierta: la model card indica que la licencia sigue la del modelo base, pero no se especifica cuál es; es imprescindible verificar la licencia de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Idiomas no documentados: no se indica qué lenguas soporta ni su calidad relativa.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinación: no evaluado en la información disponible; es esperable un aumento del riesgo debido a la compresión agresiva.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se detallan.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Compatibilidad multimodal incierta: la etiqueta `image-text-to-text` sugiere visión, pero no se documenta el procesador ni los tokens de imagen, lo que puede requerir configuración adicional.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r122
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
