# majentik/Qwen3.8-27B-MLX-6bit

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-6bit` es una variante cuantizada en 6 bits (afín, tamaño de grupo 64) del modelo Qwen/Qwen3.8-27B, preparada específicamente para ejecutarse en hardware Apple Silicon mediante la librería MLX. El autor, majentik, ha publicado una serie de cuantizaciones (2, 3, 4, 5, 6, 8 bits y MXFP4) para facilitar el despliegue local en Mac. La torre de texto se cuantiza, mientras que la torre de visión y el proyector se mantienen en BF16, lo que conserva las capacidades multimodales del modelo original.

El modelo está etiquetado como `image-text-to-text`, lo que indica que puede procesar entradas de imagen y texto y generar respuestas de texto. Aunque el nombre sugiere 27 mil millones de parámetros, el archivo safetensors reporta 6.346.296.560 parámetros totales, un dato que debe interpretarse con cautela. El repositorio ocupa 22,8 GB y la licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta versión radica en su optimización para Apple Silicon, permitiendo ejecutar un modelo multimodal de gran tamaño en equipos Mac con memoria unificada, sin necesidad de GPUs dedicadas. El autor ha incluido una prueba de coherencia determinista (smoke gate) que valida la generación básica de texto, lo que aporta cierta garantía de calidad mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.8-27B, multimodal) |
| Parametros totales | 6.346.296.560 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine, group size 64 (torre de texto); torre de vision y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base Qwen3.8-27B en la información disponible. Se sabe que es un modelo multimodal (image-text-to-text) con una torre de visión y un proyector, además de la torre de texto. La cuantización se realizó con `mlx_lm.convert` (mlx-lm 0.31.3) utilizando cuantización afín de 6 bits con tamaño de grupo 64, manteniendo la torre de visión y el proyector en BF16 para preservar la calidad de las representaciones visuales.

No hay información sobre el entrenamiento original del modelo base, el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. Esta versión es una adaptación de pesos, no un reentrenamiento, por lo que no introduce innovaciones en el entrenamiento.

## Capacidades

- Generación de texto conversacional, como se indica en los tags (`conversational`).
- Procesamiento de imágenes y texto (pipeline `image-text-to-text`), lo que permite tareas de visión-lenguaje como descripción de imágenes o respuesta a preguntas visuales.
- Soporte para ejecución en Apple Silicon mediante MLX, con cuantización que reduce el uso de memoria.
- No se mencionan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, ni modos especiales de pensamiento en la información disponible.

## Casos de uso

- Asistente de chat multimodal en Mac: el modelo puede mantener conversaciones que incluyan imágenes, por ejemplo, para explicar el contenido de una fotografía o responder preguntas sobre un diagrama.
- Análisis de imágenes en entornos locales: al ejecutarse en Apple Silicon, permite procesar imágenes sin depender de servicios en la nube, útil para prototipos o aplicaciones con requisitos de privacidad.
- Generación de descripciones de imágenes para accesibilidad: puede generar texto alternativo para imágenes en aplicaciones de escritorio o web.
- Educación y demostraciones: al ser de código abierto y con licencia permisiva, es adecuado para experimentar con modelos multimodales en entornos académicos.
- Desarrollo de aplicaciones de realidad aumentada o visión por computador que requieran interacción en lenguaje natural con el contenido visual.
- Automatización de tareas de documentación: extraer información de capturas de pantalla o imágenes técnicas y convertirla en texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere un Mac con chip Apple Silicon (M1 o posterior) y macOS compatible con MLX.
- El tamaño del repositorio es de 22,8 GB, pero el uso de memoria en tiempo de inferencia dependerá de la cuantización y del contexto. Al ser 6-bit, el modelo ocupa aproximadamente 4,8 GB solo en pesos (6,35B × 6 bits / 8), más overhead de activaciones y caché.
- Se recomienda al menos 16 GB de memoria unificada para un uso cómodo, aunque podría funcionar con 8 GB en configuraciones de contexto corto.
- La inferencia se realiza mediante `mlx-lm`, que está optimizado para Apple Silicon. No es compatible con GPUs NVIDIA ni CUDA.
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (multimodales cuantizados para Apple Silicon) en los datos proporcionados. El autor ofrece otras cuantizaciones del mismo modelo base (2, 3, 4, 5, 8 bits y MXFP4), que pueden compararse en términos de tamaño y precisión, pero no se han publicado métricas de rendimiento.

## Limitaciones y advertencias

- Al ser una cuantización de 6 bits, puede haber una pérdida de precisión respecto al modelo original en tareas que requieren alta fidelidad numérica, como matemáticas complejas o razonamiento lógico detallado.
- No se han documentado sesgos específicos, pero al derivar de un modelo base no auditado, es posible que herede sesgos presentes en los datos de entrenamiento originales.
- El riesgo de alucinación no está evaluado; se recomienda verificar las respuestas en aplicaciones críticas.
- La longitud de contexto no está especificada, por lo que se desconoce el límite de tokens de entrada.
- Solo funciona en Apple Silicon; no es portable a otros entornos sin conversión adicional.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen3.8-27B tiene su propia licencia (Apache-2.0 según la model card), pero se debe verificar la licencia del modelo original para asegurar el cumplimiento.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/majentik/Qwen3.8-27B-MLX-6bit)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio mlx-lm](https://github.com/ml-explore/mlx-lm)
