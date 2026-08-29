# nebulaic-tech/aurora-vector-8b

## Resumen

Aurora Vector 8.2B Dense es un modelo de generación de texto desarrollado por Nebulaic Tech, presentado como parte de la familia Aurora AI. Según su model card, se trata de un transformer decoder-only denso con 8.2 mil millones de parámetros, especializado en compilación de código en lenguaje natural inglés (NNPL), generación de código en múltiples lenguajes y razonamiento STEM. El modelo declara una ventana de contexto de 1.000.000 de tokens, lo que lo posicionaría como una opción interesante para tareas de autocompletado y desarrollo asistido.

Sin embargo, los datos reales del repositorio safetensors indican que el número total de parámetros es de 524.292.096 (aproximadamente 524 millones), muy por debajo de los 8.2B declarados. El tamaño del repositorio es de 1.0 GB, consistente con un modelo de ~524M en precisión fp16. Esta discrepancia es significativa y debe tenerse en cuenta al evaluar el modelo. Además, los tags de HuggingFace incluyen "sparse-moe", mientras que la model card afirma arquitectura densa, lo que añade otra contradicción. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Decoder-Only Transformer (segun model card); tags indican "sparse-moe" |
| Parametros totales | 524.292.096 (dato real safetensors); 8.2B declarados por el autor |
| Parametros activos | No disponible (si es MoE, no se especifica; la model card dice 8.2B activos) |
| Longitud de contexto | 1.000.000 tokens (segun model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer decoder-only denso, con 8.2B de parámetros activos y una arquitectura densa sin enrutamiento de expertos. Sin embargo, los tags de HuggingFace incluyen "sparse-moe", lo que sugiere una posible arquitectura de mezcla de expertos, aunque no se confirma en la documentación. El tamaño real de los pesos (524M parámetros) contradice la cifra declarada, por lo que la arquitectura real es incierta.

No se proporciona información sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas. Tampoco se mencionan innovaciones técnicas específicas más allá de la especialización declarada en código y razonamiento. La model card afirma que el modelo compila "English-Native NNPL" (un lenguaje de programación en inglés) y lenguajes estándar como Python, TypeScript, Rust, C++, Go y SQL, pero no se ofrecen detalles técnicos sobre cómo se logra esto.

## Capacidades

- Generación de código en múltiples lenguajes: Python, TypeScript, Rust, C++, Go, SQL y NNPL (lenguaje propietario en inglés).
- Razonamiento STEM: el modelo está orientado a tareas de razonamiento científico, tecnológico, ingenieril y matemático.
- Autocompletado de código: según la model card, está especializado en autocompletado ultra-rápido, con una latencia declarada de 28 ms para el primer token.
- Generación de componentes UI en NNPL: puede crear interfaces de usuario descritas en lenguaje natural.
- Soporte multilingüe: aunque el foco principal es inglés, se indica soporte para otros idiomas.
- No se menciona soporte explícito para tool calling, function calling, agentes o razonamiento multi-paso, aunque podría inferirse por la naturaleza de generación de código.

## Casos de uso

- Autocompletado de código en entornos de desarrollo integrado (IDE): el modelo puede sugerir fragmentos de código en tiempo real, aprovechando su baja latencia declarada (28 ms TTFT) y su ventana de contexto de 1M tokens para mantener el contexto del archivo completo.
- Generación de componentes UI en NNPL: desarrolladores pueden describir interfaces en inglés y obtener código NNPL listo para compilar, útil para prototipado rápido.
- Asistente de programación en local o edge: dado el tamaño real del modelo (~524M parámetros), es viable ejecutarlo en dispositivos con recursos limitados, como portátiles o dispositivos edge, para tareas de generación de código sin conexión.
- Traducción de lenguaje natural a código: el modelo puede convertir instrucciones en inglés a código en varios lenguajes, facilitando la programación a no expertos.
- Razonamiento matemático y científico: puede ayudar a resolver problemas de STEM, generando explicaciones o código para cálculos.
- Desarrollo de aplicaciones con contexto largo: su ventana declarada de 1M tokens permitiría procesar repositorios completos o documentación extensa para generar código coherente con el proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo será evaluado por el Hugging Face Open LLM Leaderboard y LMSYS Chatbot Arena, pero no se proporcionan cifras concretas. Tampoco hay datos de rendimiento comparativo con otros modelos.

## Requisitos de hardware

- Dado el tamaño real de los pesos (524M parámetros, ~1 GB en fp16), el modelo puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- Si se considera la cifra declarada de 8.2B parámetros, se necesitarían al menos 16 GB de VRAM en fp16 (por ejemplo, una RTX 4090 o A100), pero el tamaño del repositorio sugiere que no es el caso.
- Opciones de despliegue: compatible con la librería transformers, por lo que puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- La latencia declarada de 28 ms para el primer token es plausible para un modelo pequeño, pero no se ha verificado de forma independiente.
- No se dispone de datos de throughput o requisitos de memoria adicionales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo declara ser de 8.2B, pero su tamaño real es de ~524M, lo que lo situaría en la categoría de modelos pequeños de código, como Qwen2.5-Coder-0.5B o DeepSeek-Coder-1.3B. Sin embargo, no se han publicado benchmarks que permitan comparar rendimiento. Se recomienda tratar las especificaciones declaradas con cautela.

## Limitaciones y advertencias

- Discrepancia significativa entre los parámetros declarados (8.2B) y los reales (524M), lo que puede indicar errores en la documentación o un modelo mal etiquetado.
- Contradicción entre la arquitectura declarada (densa) y los tags (sparse-moe).
- No se han publicado resultados de benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- La model card contiene afirmaciones no verificadas, como la latencia de 28 ms y la ventana de contexto de 1M tokens, que deben tomarse con escepticismo.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas más allá de la declaración de soporte multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene descargas ni likes, lo que sugiere que es muy reciente o poco probado.
- Para uso en producción, se recomienda validar el modelo con casos reales y considerar la posibilidad de que las especificaciones declaradas no se correspondan con la realidad.

## Enlaces

- HuggingFace: https://huggingface.co/nebulaic-tech/aurora-vector-8b
- Sitio web oficial: https://nebulaictech.com
- Nebulaic Studio: https://studio.nebulaictech.com
- Documentación: https://nebulaictech.com (misma URL que el sitio web)
