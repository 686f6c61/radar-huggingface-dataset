# majentik/Qwen3.8-27B-MLX-3bit

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-3bit` es una variante cuantizada a 3 bits (afín, grupo de 32) del modelo multimodal Qwen/Qwen3.8-27B, preparada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor, majentik, ha publicado una serie de cuantizaciones (2, 3, 4, 5, 6, 8 bits y MXFP4) del mismo modelo base, todas con licencia Apache-2.0. Esta versión en particular cuantiza únicamente la torre de texto, manteniendo la torre de visión y el proyector en BF16, lo que permite conservar las capacidades multimodales del modelo original con un tamaño de repositorio de 14,4 GB.

El modelo está diseñado para tareas de imagen-a-texto y texto-a-texto, y su integración con `mlx-lm` facilita su uso en entornos locales de Apple. Aunque el nombre sugiere 27 mil millones de parámetros, los pesos cuantizados en safetensors suman 4.665.462.000 parámetros, lo que refleja la compresión aplicada. Es relevante para desarrolladores que buscan ejecutar un modelo multimodal de gran tamaño en hardware de consumo de Apple sin depender de servicios en la nube, aunque la cuantización agresiva a 3 bits implica una pérdida de precisión que debe evaluarse según el caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) del modelo base Qwen/Qwen3.8-27B; detalles no disponibles |
| Parametros totales | 4.665.462.000 (pesos cuantizados; el modelo base original tiene 27B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit afín, grupo de 32 (torre de texto); torre de visión y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base Qwen/Qwen3.8-27B no se detalla en la información proporcionada. Se trata de un modelo multimodal (image-text-to-text) que combina una torre de visión, un proyector y una torre de texto. En esta variante cuantizada, la torre de texto se ha convertido a 3 bits con cuantización afín y grupo de 32, mientras que la torre de visión y el proyector se mantienen en BF16 para preservar la calidad del procesamiento visual. El proceso de cuantización se realizó con `mlx_lm.convert` de mlx-lm 0.31.3, y el modelo pasó una prueba de coherencia determinista (generación de 48 tokens con decodificación greedy) antes de su publicación. No se dispone de información sobre el entrenamiento original del modelo base, como el número de tokens, la composición del dataset o el uso de RLHF/DPO.

## Capacidades

- Generación de texto y respuesta a instrucciones en formato conversacional.
- Procesamiento de imágenes y generación de descripciones o respuestas basadas en contenido visual (image-text-to-text).
- Ejecución local en Apple Silicon mediante `mlx-lm`, con soporte para generación por línea de comandos.
- Hereda las capacidades del modelo base Qwen3.8-27B, aunque no se especifican detalles adicionales como tool calling, razonamiento multi-paso o soporte multilingüe.

## Casos de uso

- Asistente local multimodal en Mac: el modelo puede responder preguntas sobre imágenes cargadas localmente, por ejemplo, describir fotografías o extraer información de capturas de pantalla, todo sin conexión a internet.
- Prototipado rápido de aplicaciones de visión por computador: al ser una cuantización ligera, permite probar flujos de trabajo de imagen-a-texto en entornos de desarrollo con recursos limitados.
- Automatización de documentación visual: generar descripciones alternativas (alt text) para imágenes en lotes, aprovechando la capacidad de procesamiento local.
- Investigación educativa: estudiar el impacto de la cuantización agresiva (3 bits) en tareas multimodales, comparando con las versiones de 4, 6 u 8 bits del mismo autor.
- Integración en pipelines de MLX: al ser un formato nativo de MLX, se puede integrar fácilmente en aplicaciones Swift o Python que usen la librería mlx-lm.
- Despliegue en entornos con privacidad estricta: al ejecutarse en local, evita enviar datos sensibles (imágenes o texto) a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el modelo superó una prueba de coherencia determinista (generación de 48 tokens sin bucles ni texto corrupto), pero no se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3, M4 y sucesores) con memoria unificada.
- Tamaño del repositorio: 14,4 GB, por lo que se recomienda al menos 16 GB de memoria unificada para cargar el modelo en RAM; 32 GB o más para mayor comodidad y espacio para el contexto.
- No es compatible con GPUs NVIDIA o AMD; requiere el framework MLX.
- Despliegue mediante `mlx-lm` (instalación con `pip install mlx-lm` y uso de `mlx_lm.generate`).
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño repo | Licencia | Plataforma |
|---|---|---|---|---|
| majentik/Qwen3.8-27B-MLX-3bit | 3-bit afín | 14,4 GB | Apache-2.0 | Apple Silicon (MLX) |
| majentik/Qwen3.8-27B-MLX-2bit | 2-bit | no disponible | Apache-2.0 | Apple Silicon (MLX) |
| majentik/Qwen3.8-27B-MLX-4bit | 4-bit | no disponible | Apache-2.0 | Apple Silicon (MLX) |
| majentik/Qwen3.8-27B-MLX-8bit | 8-bit | no disponible | Apache-2.0 | Apple Silicon (MLX) |

La comparativa se limita a las variantes del mismo modelo publicadas por el autor. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. Frente a otros modelos multimodales cuantizados para MLX (por ejemplo, versiones de Qwen2-VL o LLaVA), no hay información suficiente en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits con grupo de 32 es agresiva y puede degradar significativamente la calidad de generación, especialmente en tareas que requieren razonamiento complejo o precisión factual.
- Solo funciona en Apple Silicon; no es portable a otros entornos de hardware sin reconvertir los pesos.
- No se especifican los idiomas soportados; el modelo base puede tener limitaciones en lenguas de baja representación.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre la calidad o idoneidad del modelo para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Qwen3.8-27B-MLX-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Otras cuantizaciones del autor: https://huggingface.co/majentik (listado de repositorios)
