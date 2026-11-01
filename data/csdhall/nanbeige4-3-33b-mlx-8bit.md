# csdhall/Nanbeige4.3-33B-MLX-8bit

## Resumen

Nanbeige4.3-33B-MLX-8bit es una conversión comunitaria del modelo Nanbeige4.3-33B, un modelo de lenguaje de 33.118.977.024 parámetros desarrollado originalmente por Nanbeige y publicado con licencia Apache-2.0. Esta variante concreta, mantenida por el usuario csdhall, aplica cuantización afín de 8 bits con tamaño de grupo 64 directamente sobre el checkpoint oficial en BF16, con el objetivo de ejecutar el modelo de forma local en hardware Apple Silicon mediante la librería MLX.

El modelo base es un transformer de tipo Llama (según los tags del repositorio) orientado a generación de texto y conversación, con soporte para inglés y chino. La metadata del modelo original anuncia una longitud de contexto de 524.288 tokens, aunque la propia model card de esta conversión advierte explícitamente que la operación a esa longitud no ha sido verificada y que solo se han validado recuperaciones hasta 65.536 tokens en un Mac con 128 GiB de memoria unificada.

La relevancia de esta ficha radica en que permite evaluar rápidamente una opción práctica para desplegar un modelo de 33B en equipos Apple Silicon sin depender de GPUs dedicadas, a costa de un mayor consumo de memoria unificada (el payload convertido ocupa aproximadamente 35,21 GB) y de una validación limitada a fixtures concretos, no a benchmarks downstream completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags del repositorio) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 524.288 tokens anunciados en metadata; operación a esa longitud no verificada; validado hasta 65.536 tokens |
| Tipos de cuantización | 8 bits afín (affine), tamaño de grupo 64 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la clasificación como transformer tipo Llama en los tags del repositorio. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal.

Esta variante concreta no ha sido reentrenada ni ajustada: se trata de una cuantización independiente realizada directamente desde el checkpoint oficial en BF16 (commit `c1093c501cc6460427c0ac634db7223d0450c0ee`), no de una conversión desde una cuantización de menor precisión. La model card documenta validaciones de correctitud en Apple Metal, paridad de tokenizer, comparaciones numéricas frente al BF16 nativo y pruebas de recuperación con capacidades configuradas de 16.384, 32.768 y 65.536 tokens, usando cachés KV en BF16 sin cachés deslizantes ni rotatorias y reservando tokens de salida.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Soporte bilingüe inglés-chino.
- Ejecución local en Apple Silicon mediante MLX, con tokenizer nativo validado.
- Compatibilidad con la plantilla de chat incluida en el repositorio.
- Razonamiento, código, matemáticas, tool calling, capacidades de agente, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada alta: el modelo puede ejecutarse mediante `mlx_lm.generate` en equipos Apple Silicon con 128 GiB de memoria unificada, lo que permite disponer de un modelo de 33B sin GPU dedicada.
- Desarrollo y prototipado offline: al descargarse una sola vez y ejecutarse localmente, resulta adecuado para entornos con requisitos de privacidad donde no se desea enviar prompts a servicios alojados.
- Procesamiento de documentos largos en inglés o chino: la metadata anuncia 524.288 tokens de contexto, aunque su uso práctico debe limitarse a longitudes validadas (hasta 65.536 tokens) hasta realizar pruebas de factibilidad y calidad propias.
- Asistentes conversacionales bilingües: la plantilla de chat incluida y el soporte en/zh permiten construir interfaces conversacionales para usuarios de ambos idiomas.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad de una cuantización 8-bit afín frente al BF16 original en tareas concretas.
- Base para experimentación académica: al ser Apache-2.0 y estar disponible en safetensors MLX, puede servir como punto de partida para estudios de eficiencia en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta validaciones internas de correctitud, paridad de tokenizer, comparaciones numéricas frente a BF16 y pruebas de recuperación a 16.384, 32.768 y 65.536 tokens, sin cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- Memoria: el payload convertido ocupa aproximadamente 35,21 GB, pero la model card advierte que el tamaño de archivo no equivale al requisito total de memoria unificada; hay que sumar sistema operativo, caché KV y buffers de runtime.
- Hardware validado: Mac con 128 GiB de memoria unificada (pruebas en Apple Metal).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; MLX CUDA no fue probado según la model card.
- ¿Cabe en GPU de consumo? No disponible para CUDA; en Apple Silicon requiere configuraciones de memoria unificada muy alta.
- Despliegue: MLX 0.32.4 y mlx-lm 0.32.2 (versiones validadas); comando de ejemplo `python -m mlx_lm.generate --model csdhall/Nanbeige4.3-33B-MLX-8bit --prompt "..." --max-tokens 256`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-8bit (esta ficha) | 33.118.977.024 | 524.288 anunciados; validado hasta 65.536 | Apache-2.0 | safetensors MLX 8-bit | HuggingFace, 86 descargas |
| Nanbeige/Nanbeige4.3-33B (original) | 33.118.977.024 | 524.288 anunciados | Apache-2.0 | safetensors BF16 | HuggingFace |
| Otras alternativas de 33B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- La operación a 524.288 tokens de contexto no está verificada; solo se validaron recuperaciones hasta 65.536 tokens en fixtures limitados.
- Las validaciones realizadas no constituyen benchmarks downstream completos ni garantizan que cada prompt llene cada token.
- No se ejecutó código generado ni acciones reales de herramientas durante la validación.
- Riesgo de respuestas inexactas o sesgadas; la conversión no es una certificación de seguridad conductual ni una release emitida por el editor original.
- La cuantización 8-bit puede introducir degradación numérica frente al BF16 original, aunque se realizaron comparaciones numéricas de validación.
- El modelo solo declara soporte para inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `LICENSE` y `conversion_NOTICE.txt` del repositorio.
- La primera ejecución contacta con Hugging Face para descargar el modelo; cualquier servicio de inferencia alojado tendrá sus propios términos de privacidad.
- El repositorio es una conversión comunitaria, no una release oficial de Nanbeige.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/csdhall/Nanbeige4.3-33B-MLX-8bit
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Commit del checkpoint fuente: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Manifiesto de conversión: `conversion_manifest.json` (incluido en el repositorio)
- Aviso de conversión: `conversion_NOTICE.txt` (incluido en el repositorio)
- Librería MLX: no disponible enlace directo en la información proporcionada
- Papers, blogs, repos o demos adicionales: no disponible
