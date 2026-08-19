# lukaskremla/Qwen3.8-27B-3bit-MLX-TextOnly

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-3bit-MLX-TextOnly` es una cuantización de 3 bits del modelo Qwen3.8-27B, adaptada al formato MLX para su ejecución en hardware Apple Silicon. Esta versión elimina la torre de visión del modelo original, conservando únicamente las capacidades de texto a texto. El objetivo es ofrecer una versión ligera y eficiente para inferencia en dispositivos con recursos limitados, manteniendo las capacidades conversacionales, de razonamiento y de uso de herramientas del modelo base. Desarrollado por lukaskremla, se distribuye bajo licencia Apache 2.0.

El modelo base Qwen3.8-27B pertenece a la familia Qwen, con 27 mil millones de parámetros y soporte para contexto largo y multilingüismo. Esta cuantización utiliza round-to-nearest (RTN) con group size 64 y cuantización affine de 3 bits, lo que reduce significativamente el tamaño del modelo (11.8 GB en el repositorio) en comparación con los pesos en precisión completa. Es relevante para desarrolladores que necesitan desplegar modelos de razonamiento en entornos con restricciones de memoria, como portátiles o servidores sin GPUs de gama alta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, sin torre de visión) |
| Parametros totales | 27B (según nomenclatura del modelo base; el contador de HuggingFace muestra 3.364.314.624, un error de visualización común en MLX quants) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se indica el valor exacto) |
| Tipos de cuantizacion | 3-bit, RTN, group size 64, affine (weight-only) |
| Idiomas soportados | multilingüe (según tags, sin lista específica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo base Qwen/Qwen3.8-27B, del cual se ha eliminado la torre de visión para obtener una versión solo texto. La cuantización se realizó con la librería mlx-lm (versión 0.31.2) utilizando el método RTN (round-to-nearest) con group size 64 y cuantización affine de 3 bits, lo que reduce el tamaño de los pesos a aproximadamente un tercio del original. No se dispone de información adicional sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento (datos, tokens, técnicas de alineación como RLHF o DPO). Los detalles técnicos del modelo base no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (según tags).
- Razonamiento y uso de herramientas (tool-use).
- Soporte de contexto largo (long-context).
- Capacidades multilingües (sin especificar idiomas concretos).
- Solo texto: la torre de visión ha sido eliminada, por lo que no procesa imágenes.

## Casos de uso

- Asistentes conversacionales en aplicaciones de texto: el modelo puede mantener diálogos multi-turno con razonamiento, adecuado para chatbots o asistentes virtuales.
- Generación de código con soporte de herramientas: al conservar tool-use, puede integrarse en pipelines de desarrollo para autocompletado o generación de código.
- Procesamiento de documentos largos: gracias al soporte de contexto largo, puede resumir o analizar textos extensos.
- Sistemas de razonamiento multi-paso: para tareas que requieren lógica y deducción, como resolución de problemas o planificación.
- Aplicaciones multilingües: puede utilizarse en entornos donde se requiere comprensión y generación en varios idiomas.
- Despliegue en hardware Apple Silicon: al estar en formato MLX, es adecuado para Macs con chips M1/M2/M3, donde se puede ejecutar de forma eficiente con la memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 11.8 GB (pesos cuantizados a 3 bits).
- VRAM estimada: al ser una cuantización de 3 bits, se necesitan aproximadamente 11-12 GB para cargar los pesos, más memoria para activaciones y contexto. Se recomienda al menos 16 GB de memoria unificada en Apple Silicon o una GPU con 12-16 GB de VRAM.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2, M3) para MLX; también puede ejecutarse en GPUs NVIDIA con suficiente VRAM mediante adaptadores, aunque no se especifica.
- Opciones de despliegue: mlx-lm (para Apple Silicon), también puede convertirse a GGUF para llama.cpp u Ollama, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos cuantizados similares. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B como Llama 3.1 27B o Mistral Large, pero no se tienen datos concretos de rendimiento.

## Limitaciones y advertencias

- Es una versión solo texto: no procesa imágenes, por lo que no es adecuado para tareas multimodales.
- La cuantización de 3 bits puede degradar la calidad de las respuestas en comparación con el modelo en precisión completa, especialmente en tareas complejas.
- No se dispone de información sobre sesgos o riesgos de alucinación del modelo base.
- El número de parámetros mostrado en HuggingFace es incorrecto (bug común en MLX quants); el modelo real tiene 27B parámetros.
- No se especifican los idiomas exactos soportados, aunque se indica multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B (que también es Apache 2.0 según el tag).

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/lukaskremla/Qwen3.8-27B-3bit-MLX-TextOnly)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Colección de cuantizaciones MLX del autor](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp)
