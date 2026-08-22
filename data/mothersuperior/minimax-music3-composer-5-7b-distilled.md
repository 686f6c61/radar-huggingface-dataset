# Mothersuperior/minimax-music3-composer-5.7b-distilled

## Resumen

`Mothersuperior/minimax-music3-composer-5.7b-distilled` es un modelo de composición musical derivado del composer LM de MiniMax Music 3, que a su vez parte de un Qwen3-8B post-entrenado por MiniMax para emitir códigos de audio RVQ. El autor, Mothersuperior, ha aplicado una poda de profundidad (depth pruning) sobre ese modelo, reduciéndolo de 36 a 21 capas (5,69 mil millones de parámetros) y lo ha reparado mediante destilación contra el profesor congelado. El resultado es un modelo que compone aproximadamente el doble de rápido que el original, sin necesidad de realizar el paso de clasificación libre de CFG, ya que la guía queda integrada en las distribuciones destiladas.

El repositorio contiene un par de variantes A/B que difieren únicamente en la tasa de aprendizaje (`lr-3e-5` y `lr-6e-5`), ambas válidas según las pruebas de escucha del autor. El modelo es compatible con el decodificador de profundidad y el DiT del Music3 original, por lo que puede usarse como sustituto directo del profesor en el pipeline de generación. La licencia es `minimax-music3-terms`, sujeta a los términos de MiniMax Music 3, y el modelo se distribuye en formato safetensors con precisión bf16. Su relevancia actual radica en ser un ejemplo práctico de poda y destilación aplicada a un modelo de generación de música de gran tamaño, con un coste de inferencia notablemente menor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-8B basada (composer LM, emite códigos RVQ), podada de 36 a 21 capas |
| Parámetros totales | 5,69 mil millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original genera canciones de hasta 5 minutos) |
| Tipos de cuantización | bf16 (pesos safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | `minimax-music3-terms` (sujeta a los términos de MiniMax Music 3) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer de solo decodificador basado en la arquitectura de Qwen3-8B, postentrenado por MiniMax para actuar como «composer» dentro de Music 3: recibe letras y una descripción musical detallada y emite códigos de audio RVQ que después un decodificador de profundidad y un DiT convierten en audio. Sobre ese modelo, el autor aplica una poda de profundidad estilo ShortGPT: se puntúan las capas con un corpus de auto-destilación de 18.700 pistas y se eliminan 15 de las 36 capas, protegiendo las dos primeras y las dos últimas y limitando la eliminación a un máximo de 3 capas consecutivas.

Tras la poda, se realiza una destilación de reparación contra el profesor congelado. El objetivo de entrenamiento combina la divergencia de entropía cruzada con las distribuciones guiadas top-50 del profesor, el error cuadrático medio (MSE) de los estados ocultos normalizados de la capa final (con objetivos fp16 almacenados en caché) y la supervisión del token final (END). El entrenamiento se realizó con precisión bf16, optimizador AdamW con torch-optimi, tamaño de lote 8 y una sola GPU RTX PRO 6000. La similitud coseno de los hidden states con el profesor alcanza aproximadamente 0,94 en el momento de la publicación, frente al techo de auto-consistencia del profesor de 0,99994.

## Capacidades

- Composición de canciones completas de hasta 5 minutos de duración, condicionadas por letras y una descripción musical detallada.
- Generación de voces expresivas, arreglos en evolución y estructura musical coherente en el largo plazo.
- Composición single-row: muestreo top-50 de logits enmascarados, sin necesidad de paso de clasificación sin guía (CFG-free).
- Inferencia aproximadamente 2 veces más rápida que el profesor original, al eliminar el paso incondicional y reducir el número de capas.
- Compatibilidad directa con el decodificador de profundidad de Music3 y el DiT mediante el uso de `Qwen3ForCausalLM.from_pretrained(...)`.
- No es un modelo de texto general: su salida son códigos de audio RVQ, no texto legible.

## Casos de uso

- Producción musical asistida: el modelo puede generar bocetos completos de canciones a partir de letras y dirección musical, permitiendo a compositores iterar sobre variantes en minutos. Su velocidad (~2x) lo hace adecuado para flujos de trabajo interactivos.
- Generación de música de fondo para videojuegos y audiovisuales: la estructura larga y la coherencia de arreglos permiten crear bandas sonoras de varios minutos sin cortes.
- Prototipado rápido para demos de artistas: un artista puede lanzar múltiples versiones de una idea con diferentes arreglos y voces, reduciendo el tiempo de producción inicial.
- Herramientas de composición asistida por IA: integrable en editores de audio o DAWs mediante el pipeline estándar de Music3, con menor coste de cómputo que el modelo completo.
- Investigación en eficiencia de modelos generativos: sirve como caso de estudio de poda de profundidad y destilación de distribuciones guiadas, con métricas de calidad documentadas (coseno de hidden states).
- Despliegue en entornos con recursos limitados: al ser un modelo de 5,7 B en bf16, cabe en GPU de consumo de 24 GB, lo que facilita su uso en estaciones de trabajo de estudio o servidores pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la similitud coseno de los hidden states con el profesor, de aproximadamente 0,94, y la velocidad de inferencia (~2x más rápida que el profesor). No hay comparaciones cuantitativas con otros modelos de generación musical.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos bf16, un modelo de 5,7B parámetros requiere aproximadamente 12-14 GB de VRAM para la carga de pesos, más el overhead de activaciones; el repositorio completo ocupa 22,8 GB (incluye ambas variantes).
- GPU recomendadas: RTX PRO 6000 (utilizada en el entrenamiento), RTX 4090/4080 con 24 GB, A100, H100. En una GPU de 24 GB puede ejecutarse sin problemas.
- Se puede desplegar en hardware de consumo con 24 GB de VRAM; no se ha validado en GPUs de menor capacidad.
- Opciones de despliegue: compatible con el stack de Music3 (decoder de profundidad + DiT). No se documenta soporte para vLLM, llama.cpp u Ollama para el pipeline completo de audio; la generación de códigos RVQ requeriría el sistema de Music3 original.
- Latencia y throughput: no se proporcionan valores concretos; el autor indica una mejora de ~2x en velocidad de composición respecto al profesor.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Velocidad | Licencia |
|---|---|---|---|---|---|
| MiniMax Music3 (profesor) | 8B (LLM global) + 0,6B (decoder) | 36 | hasta 5 min de audio | base | `minimax-music3-terms` |
| Este modelo (5.7B distilled) | 5,69B | 21 | no disponible | ~2x más rápido | `minimax-music3-terms` |
| Otros modelos de música (p. ej. Stable Audio, MusicGen) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el uso está sujeto a los términos de MiniMax Music 3 (`minimax-music3-terms`), que pueden limitar el uso comercial o la redistribución.
- Modelo de la comunidad: tiene 0 descargas y 0 likes en HuggingFace, por lo que no ha sido validado por una audiencia amplia; la calidad no está contrastada más allá de las pruebas del autor.
- Riesgo de alucinación estructural: al ser una destilación del profesor, la calidad puede degradarse en entradas atípicas o condiciones muy específicas; el autor no documenta evaluaciones de robustez.
- Limitaciones de idioma: no se especifican idiomas soportados; el corpus de destilación es multilingüe según el autor, pero no hay garantía para todos los idiomas.
- No es un modelo de texto: no sirve para tareas de generación de lenguaje; su salida son códigos de audio RVQ que requieren el decodificador de Music3 para ser audibles.
- La poda y destilación pueden perder fidelidad en pasajes muy complejos (la similitud coseno es 0,94, no 0,999); se recomienda realizar pruebas de escucha en el dominio objetivo antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mothersuperior/minimax-music3-composer-5.7b-distilled
- Modelo original MiniMax Music3: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio GitHub de MiniMax Music3: https://github.com/MiniMax-AI/MiniMax-Music3
- Página de demostración oficial: https://minimax-ai.github.io/music3-demo/
- Página del modelo en ModelScope: https://www.modelscope.cn/models/MiniMax/MiniMax-Music3
- Corpus de destilación RVQ: https://huggingface.co/datasets/Mothersuperior/minimax-music3-rvq-distill-corpus-8k
- Codificador RVQ asociado: https://huggingface.co/Mothersuperior/open-rvq-encoder-minimax-music3-169m-53k-pooled
