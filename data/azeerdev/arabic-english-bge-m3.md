# AzeerDev/arabic-english-bge-m3

## Resumen

El modelo `AzeerDev/arabic-english-bge-m3` es una versión podada del conocido modelo de embeddings multilingüe BAAI/bge-m3, optimizada específicamente para los idiomas árabe e inglés. Desarrollado por AzeerDev, este modelo reduce el tamaño original en un 36,2 % (de aproximadamente 568 millones de parámetros a 362 millones), lo que lo hace más ligero y eficiente para tareas de recuperación de pasajes y similitud de frases en árabe, sin sacrificar de forma significativa la calidad. Según la model card, ocupa el tercer puesto general y el primero entre los modelos de código abierto en el The-Arabic-Rag-Leaderboard, un referente para sistemas de recuperación aumentada por generación (RAG) en árabe.

El modelo se distribuye con pesos en formato safetensors y también incluye una versión cuantizada en ONNX que reduce el tamaño a aproximadamente 363 MB (un 75 % más pequeño que el modelo podado) manteniendo cerca del 98 % de la calidad original. Está pensado para integrarse en pipelines de búsqueda semántica, sistemas de preguntas y respuestas y aplicaciones de recuperación de información en contextos árabes e ingleses. Su licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en XLM-RoBERTa, derivado de BAAI/bge-m3) |
| Parametros totales | 362.166.272 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base BGE-M3 soporta hasta 8192 tokens) |
| Tipos de cuantizacion | ONNX cuantizado (disponible en el repositorio) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es una versión podada de BAAI/bge-m3, un modelo de embeddings que combina tres funcionalidades de recuperación: dense retrieval, sparse retrieval y multi-vector retrieval. La poda se ha realizado eliminando tokens del vocabulario que no son comunes en árabe, lo que reduce el tamaño del modelo y acelera la inferencia para este idioma. No se han publicado detalles específicos sobre el proceso de poda (criterios exactos, datos de entrenamiento posteriores, etc.), pero la model card indica que el modelo resultante mantiene un rendimiento similar al original para tareas en árabe, aunque puede degradarse en otros idiomas debido a la eliminación de tokens.

El modelo base BGE-M3 fue entrenado con más de 100 idiomas y soporta múltiples granularidades de texto, desde frases cortas hasta documentos de hasta 8192 tokens. La versión podada hereda esta arquitectura, pero con un vocabulario reducido y un menor número de parámetros. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de embeddings y no generativo.

## Capacidades

- Generacion de embeddings densos para recuperacion semantica en arabe e ingles.
- Soporte de sparse retrieval (representaciones basadas en pesos de tokens) y multi-vector retrieval, aunque no se confirma si la version podada conserva todas las funcionalidades del original.
- Adecuado para tareas de similitud de frases, busqueda de pasajes y recuperacion de informacion.
- Compatible con la libreria sentence-transformers, lo que facilita su integracion en pipelines existentes.
- Soporte de inferencia via ONNX Runtime, tanto en CPU como en GPU.
- Capacidad multilingue limitada a arabe e ingles (el modelo original soportaba mas de 100 idiomas, pero la poda elimina tokens de otros idiomas).

## Casos de uso

- Busqueda semantica en documentos arabes: el modelo puede indexar y recuperar pasajes relevantes en corpus arabes, por ejemplo en bibliotecas digitales o archivos periodisticos, gracias a su optimizacion para este idioma.
- Sistemas RAG (Retrieval-Augmented Generation) en arabe: al ser ligero y rapido, es adecuado como componente de recuperacion en asistentes conversacionales o chatbots que responden preguntas sobre documentacion arabe.
- Clasificacion de textos por similitud: permite agrupar o clasificar articulos, noticias o comentarios en arabe e ingles segun su contenido semantico, util para moderacion de contenido o analisis de opinion.
- Deduplicacion de contenidos: puede identificar textos duplicados o muy similares en bases de datos multilingues (arabe-ingles), por ejemplo en repositorios de documentos legales o academicos.
- Motor de recomendacion basado en contenido: al generar embeddings de items (productos, articulos, etc.), se pueden calcular similitudes para sugerir elementos relacionados en plataformas de comercio electronico o medios.
- Integracion en pipelines de busqueda hibrida: al combinar dense y sparse retrieval, puede mejorar la precision en motores de busqueda empresariales que manejan consultas en arabe e ingles, especialmente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la informacion disponible. La model card menciona que el modelo ocupa el tercer puesto general y el primero entre los modelos de codigo abierto en el The-Arabic-Rag-Leaderboard, pero no se proporcionan metricas concretas (como nDCG, MRR o Recall). Tampoco se ofrecen comparaciones numericas con otros modelos en tareas estandar como MMLU o HumanEval, ya que se trata de un modelo de embeddings y no de generacion de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 362 millones de parametros, en FP32 se requieren aproximadamente 1,4 GB de memoria; en FP16 unos 700 MB; la version ONNX cuantizada ocupa 363 MB, por lo que puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) puede manejar el modelo en FP16. Para despliegues masivos, una A10 o T4 es suficiente.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo como RTX 3060 o superiores, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: sentence-transformers, Transformers con `trust_remote_code`, ONNX Runtime (via `optimum`), y el servidor de embeddings Infinity (compatible con OpenAI API).
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo reducido, se espera una latencia inferior a la del BGE-M3 original en las mismas condiciones de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AzeerDev/arabic-english-bge-m3 | 362 M | No disponible (base: 8192) | ar, en | MIT | safetensors, ONNX |
| BAAI/bge-m3 (original) | 568 M | 8192 | >100 | MIT | safetensors |
| multilingual-e5-large | 560 M | 512 | 100+ | MIT | safetensors |

La comparativa se limita a modelos de embeddings multilingues conocidos. El modelo podado ofrece un tamano menor que el original BGE-M3, con un rendimiento similar en arabe segun el leaderboard, pero pierde soporte para otros idiomas. Frente a multilingual-e5-large, no se dispone de datos comparativos directos en arabe, aunque el contexto del BGE-M3 es superior (8192 frente a 512).

## Limitaciones y advertencias

- El modelo esta optimizado exclusivamente para arabe e ingles; su rendimiento en otros idiomas puede ser deficiente o nulo debido a la eliminacion de tokens del vocabulario original.
- No se garantiza que conserve todas las funcionalidades del BGE-M3 original (dense, sparse y multi-vector) tras la poda; se recomienda verificar el comportamiento en el caso de uso concreto.
- Al ser un modelo de embeddings, no genera texto, por lo que no es adecuado para tareas generativas.
- Puede heredar sesgos presentes en los datos de entrenamiento del modelo original, especialmente en contextos culturales o sociales.
- La informacion sobre el proceso de poda y los datos de entrenamiento posteriores es limitada, lo que dificulta evaluar su robustez en dominios muy especificos.
- Aunque la licencia MIT permite uso comercial, es recomendable validar el rendimiento en el dominio objetivo antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AzeerDev/arabic-english-bge-m3
- Modelo original BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Documentacion de BGE-M3: https://bge-model.com/bge/bge_m3.html
- The-Arabic-Rag-Leaderboard: https://huggingface.co/spaces/Navid-AI/The-Arabic-Rag-Leaderboard
- Repositorio de BGE en BAAI: https://bge.baai.ac.cn/
- Ejemplo de despliegue con Infinity: https://github.com/michaelfeil/infinity
