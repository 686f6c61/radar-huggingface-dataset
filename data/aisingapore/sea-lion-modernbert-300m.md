# aisingapore/SEA-LION-ModernBERT-300M

## Resumen

SEA-LION-ModernBERT-300M es un modelo de tipo encoder desarrollado por el pilar de productos de IA de AI Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network). Está diseñado para procesar texto en 13 idiomas del Sudeste Asiático, incluyendo birmano, chino, inglés, filipino, indonesio, javanés, jemer, lao, malayo, sundanés, tamil, tailandés y vietnamita, además de código de programación. El modelo resuelve el problema de la baja representación de estas lenguas en los modelos multilingües existentes, que suelen estar dominados por el inglés y otras lenguas mayoritarias.

Construido sobre la arquitectura ModernBERT-base, este modelo encoder-only cuenta con aproximadamente 312,5 millones de parámetros y una ventana de contexto de 8.000 tokens. Su principal innovación es la adopción del tokenizador Gemma 3, que ofrece una mejor fertilidad de tokenización y mayores tasas de compresión para los sistemas de escritura complejos de la región, lo que permite procesar contextos más largos y tareas multilingües con mayor eficiencia computacional. La licencia MIT y su disponibilidad pública lo convierten en una opción atractiva para investigación y aplicaciones comerciales en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder-only, transformer) |
| Parámetros totales | 312.510.976 |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; se pueden generar con herramientas externas) |
| Idiomas soportados | birmano, chino, inglés, filipino, indonesio, javanés, jemer, lao, malayo, sundanés, tamil, tailandés, vietnamita (13 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (también disponibles checkpoints intermedios) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolución de BERT que incorpora mejoras como la atención local-global (una mezcla de atención con ventana local y atención global en tokens seleccionados), una normalización más estable y un diseño optimizado para eficiencia en entrenamiento e inferencia. A diferencia de los modelos decoder, no genera texto, sino que produce representaciones contextualizadas de tokens, lo que lo hace idóneo para tareas de clasificación, relleno de máscaras y extracción de características.

El entrenamiento se realizó desde cero en dos fases: una primera fase de pre-entrenamiento sobre 2 billones de tokens y una fase intermedia de 1 billón de tokens adicionales, totalizando 3 billones de tokens. El corpus abarca un 10% de código y el resto de los 13 idiomas mencionados, con una distribución que da prioridad al inglés (35%) y al indonesio (8%), seguidos de otras lenguas regionales en porcentajes menores. No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que al ser un encoder no generativo, no se aplican esos métodos.

## Capacidades

- Relleno de máscaras (fill-mask) para completar tokens en texto multilingüe.
- Clasificación de texto (análisis de sentimiento, categorización temática, detección de intención) mediante fine-tuning.
- Extracción de representaciones contextualizadas (embeddings) para tareas de similitud semántica y recuperación de información.
- Soporte multilingüe amplio para las lenguas del Sudeste Asiático, con especial eficiencia en escrituras complejas como birmano, jemer, lao, tailandés y tamil.
- Capacidad de procesar código fuente junto con lenguaje natural, útil para tareas de documentación y análisis de repositorios.
- No soporta tool calling ni funciones de agente, al ser un modelo encoder puro, y no tiene modo de razonamiento explícito ni generación de texto libre.
- Se puede usar como base para fine-tuning en tareas de clasificación de documentos, detección de spam, etc.

## Casos de uso

- **Análisis de sentimiento en redes sociales en idiomas locales**: permite clasificar comentarios en indonesio, tailandés o vietnamita para monitorización de marca, gracias a su tokenizador adaptado a esas lenguas y su capacidad de capturar matices culturales.
- **Clasificación de documentos legales y administrativos**: el modelo puede fine-tunearse para categorizar contratos o expedientes en malayo o filipino, reduciendo la necesidad de traducir a inglés.
- **Búsqueda semántica y recuperación de información**: mediante los embeddings generados, se pueden construir motores de búsqueda híbridos para documentos técnicos y académicos en lenguas de la región, con una eficiencia mejorada en comparación con modelos que no tienen en cuenta estas lenguas.
- **Asistencia a desarrolladores de código**: dado que el entrenamiento incluye un 10% de código, el modelo puede usarse para completar fragmentos de código o para etiquetar funciones en repositorios multilingües.
- **Sistemas de recomendación de contenido**: fine-tuning para clasificar artículos, noticias o publicaciones en idiomas como tailandés o jemer, con un contexto de 8k tokens que permite procesar documentos largos de forma completa.
- **Moderación de contenido**: se puede entrenar para detectar spam, toxicidad o discursos de odio en las lenguas del Sudeste Asiático, donde a menudo los modelos occidentales fallan por falta de datos.
- **Procesamiento de formularios y encuestas**: clasificación de respuestas abiertas en múltiples idiomas para estudios sociales o de mercado, sin necesidad de traducción previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GLUE, ni comparaciones con otros modelos. Por lo tanto, no es posible cuantificar su rendimiento relativo en tareas estándar.

## Requisitos de hardware

- **VRAM estimada**: con 312,5 millones de parámetros en precisión FP16, la memoria necesaria para inferencia es de aproximadamente 625 MB (2 bytes por parámetro). Con cuantización INT8 se reduce a unos 313 MB, y en FP32 sería cerca de 1,25 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16, como una NVIDIA GTX 1650 o superior. Para fine-tuning se recomienda una GPU con 4-6 GB de VRAM, como una RTX 3060 o RTX 4060.
- **Capacidad en consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en algunas integradas de alta gama.
- **Opciones de despliegue**: al ser un modelo de la familia Transformers de Hugging Face, se puede cargar con el pipeline de `fill-mask` y usar con bibliotecas como `transformers`, `onnxruntime` para optimización, o `torch.compile`. También es compatible con servidores de inferencia como TGI (Text Generation Inference) o vLLM, aunque estos están más orientados a modelos generativos; para encoders, se puede usar `tei` (Text Embeddings Inference) o `sentence-transformers` para embeddings.
- **Latencia y throughput**: no se dispone de datos de latencia medidos por el autor, pero para un modelo de 300M, se puede esperar un throughput de cientos de peticiones por segundo en una GPU moderna para tareas de clasificación, y latencias por debajo de 10 ms por lote pequeño.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos en la información proporcionada. Sin embargo, se puede hacer una comparativa cualitativa con modelos encoder multilingües conocidos:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SEA-LION-ModernBERT-300M | 312M | 8k | 13 (SEA + EN + ZH) | MIT | Optimizado para lenguas del Sudeste Asiático, tokenizer Gemma 3 |
| XLM-RoBERTa-base | 278M | 512 | 100 | CC-BY-NC-SA | Amplio multilingüe, pero con ventana corta y sin enfoque regional |
| mBERT | 178M | 512 | 104 | Apache-2.0 | Modelo clásico, contexto limitado, menor eficiencia en lenguas asiáticas |
| ModernBERT-base | 149M | 8192 | Principalmente EN | Apache-2.0 | Base original, sin adaptación a SEA |

La ventaja del modelo de AI Singapore radica en su tokenizer específico para lenguas SEA y su entrenamiento en un corpus dedicado, lo que debería ofrecer mejores resultados en tareas que involucran esas lenguas, aunque no hay datos públicos que lo confirmen.

## Limitaciones y advertencias

- **Sesgos y robustez**: la model card indica que el modelo no ha sido probado contra uso adversario, por lo que puede ser vulnerable a entradas maliciosas y puede presentar sesgos no documentados presentes en los datos de entrenamiento.
- **Alucinación**: aunque es un encoder y no genera texto libre, puede producir representaciones erróneas en tareas de clasificación o en el relleno de máscaras si los datos de entrenamiento contienen ruido.
- **Limitación de contexto**: la ventana de 8k tokens es suficiente para la mayoría de documentos, pero no para textos muy largos como libros completos; se necesita truncamiento o estrategias de chunking.
- **Idiomas cubiertos**: aunque cubre 13 lenguas, el porcentaje de datos de algunas de ellas es muy bajo (por ejemplo, javanés y sundanés solo un 0,5% cada uno), lo que puede afectar la calidad de las representaciones en esas lenguas.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar que los datos de entrenamiento no contengan información sensible o con derechos de autor.
- **Falta de benchmarks**: no hay métricas públicas que respalden sus afirmaciones de rendimiento, por lo que es necesario evaluar el modelo en el propio dominio antes de producción.
- **Compatibilidad**: el modelo requiere `transformers>=4.48.0` para funcionar correctamente, y no es compatible con versiones anteriores de la biblioteca.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M)
- [Repositorio de checkpoints intermedios](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-300M-checkpoints)
- [Documentación oficial de SEA-LION](https://docs.sea-lion.ai/models/sea-embedding/sea-modernbert)
- [Guía en GitHub de SEA-LION](https://github.com/aisingapore/sealion/blob/main/models/sea-embedding/sea-modernbert.md)
- [Modelo de embeddings derivado (300M)](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-300M)
- [Modelo de embeddings (600M)](https://huggingface.co/aisingapore/SEA-LION-ModernBERT-Embedding-600M)
