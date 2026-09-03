# codefuse-ai/F2LLM-v2-1.7B

## Resumen

F2LLM-v2-1.7B es un modelo de embeddings multilingüe desarrollado por el equipo CodeFuse de Alibaba, diseñado para generar representaciones vectoriales densas de texto de alta calidad. Forma parte de la familia F2LLM-v2, que incluye ocho tamaños que van desde 80M hasta 14B de parámetros, todos ellos publicados de forma completamente abierta, incluyendo datos de entrenamiento, código y checkpoints intermedios.

Este modelo en particular, con 1.720 millones de parámetros, está basado en la arquitectura Qwen3 y ha sido entrenado sobre un conjunto de datos curado de 60 millones de ejemplos públicos de alta calidad. Su principal valor reside en el soporte de más de 200 idiomas, con especial atención a lenguas de recursos medios y bajos tradicionalmente desatendidas por otros sistemas de embeddings. La versión instruct que aquí se presenta es un ajuste fino del modelo base F2LLM-v2-1.7B-Preview.

La relevancia actual de este modelo radica en su combinación de tamaño moderado, licencia Apache 2.0 y cobertura lingüística excepcional, lo que lo convierte en una opción atractiva para sistemas de recuperación de información, búsqueda semántica y clasificación de texto en entornos multilingües, tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 200 idiomas, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

F2LLM-v2-1.7B emplea una arquitectura transformer estándar basada en Qwen3, optimizada para la generación de embeddings de texto. El modelo ha sido entrenado sobre un conjunto de datos compuesto por 60 millones de ejemplos públicos de alta calidad, curados específicamente para tareas de representación textual. El proceso de entrenamiento incluye una fase de preentrenamiento sobre el modelo base F2LLM-v2-1.7B-Preview, seguida de un ajuste fino supervisado para producir la versión instruct que se distribuye en este repositorio.

Una característica destacable es que los tres modelos instruct más pequeños de la familia (80M, 160M y 330M) se obtuvieron mediante poda y reentrenamiento del modelo base de 0.6B, mientras que los modelos de 1.7B, 4B, 8B y 14B se entrenaron desde cero. El modelo soporta una dimensión de embeddings de 2048, como se muestra en el ejemplo de uso proporcionado por los autores. El entrenamiento se realizó con precisión bfloat16 y el modelo es compatible con las bibliotecas Transformers y Sentence Transformers.

## Capacidades

- Generación de embeddings densos de texto para tareas de recuperación de información, búsqueda semántica y clasificación de texto.
- Soporte multilingüe extenso: más de 200 idiomas, con especial énfasis en lenguas de recursos medios y bajos.
- Distinción entre consultas y documentos mediante prompts específicos: el método `encode_query` aplica una plantilla de consulta mientras que `encode_document` procesa los documentos sin plantilla.
- Compatibilidad con Sentence Transformers y Transformers, lo que facilita su integración en pipelines existentes.
- Dimensión de embeddings de 2048, que proporciona representaciones de alta granularidad.
- Entrenado específicamente para tareas de retrieval, con buen rendimiento en benchmarks MTEB según los autores.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo puede indexar documentos en decenas de idiomas y recuperar los más relevantes para una consulta formulada en otro idioma distinto, gracias a su amplia cobertura lingüística y a la distinción entre embeddings de consulta y de documento.
- Sistemas de recuperación aumentada por generación (RAG): integrable como componente de embedding en pipelines RAG para proporcionar contexto relevante a modelos generativos, especialmente en aplicaciones que necesitan manejar documentación en múltiples idiomas.
- Clasificación de texto y análisis de sentimiento: las representaciones generadas pueden alimentar clasificadores ligeros para tareas como categorización de tickets de soporte, moderación de contenido o análisis de opiniones en redes sociales en distintos idiomas.
- Deduplicación y agrupamiento de documentos: permite detectar documentos duplicados o semánticamente similares en grandes corpus multilingües, útil para limpieza de datos y organización de archivos.
- Motores de recomendación basados en contenido: los embeddings de ítems (artículos, productos, vídeos) permiten calcular similitudes y sugerir contenido relacionado a usuarios en plataformas multilingües.
- Sistemas de respuesta a preguntas sobre documentación técnica: combinado con un índice vectorial, puede recuperar pasajes relevantes de manuales o documentación de API en varios idiomas para responder consultas de desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los autores indican que la familia F2LLM-v2 establece un nuevo estado del arte en una amplia gama de benchmarks MTEB, incluyendo Code, Europeo, Escandinavo, Alemán, Francés, Español, Polaco, Holandés, Japonés, Vietnamita, Tailandés, Índico, Persa, entre otros, y remiten al leaderboard de MTEB para detalles. No se proporcionan cifras concretas en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.720 millones de parámetros en bfloat16, el modelo requiere aproximadamente 3,5 GB de VRAM para cargar los pesos en memoria. Con la sobrecarga de activaciones y el procesamiento por lotes, se recomiendan al menos 6-8 GB de VRAM para un uso cómodo.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores. Para procesamiento por lotes grande o despliegue en producción, se recomiendan GPUs de datacenter como A10, A100 o H100.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4090 pueden manejar el modelo sin problemas, incluso con lotes moderados.
- Opciones de despliegue: al ser un modelo de embeddings compatible con Transformers, puede servirse con Text Embeddings Inference (TEI), que es compatible con endpoints de Hugging Face. También puede usarse con Sentence Transformers en aplicaciones Python directas, o integrarse en frameworks como LangChain o LlamaIndex.
- Latencia y throughput: no se han publicado cifras oficiales. Para un modelo de 1.7B en bfloat16, se puede esperar una latencia de decenas de milisegundos por lote pequeño en GPUs modernas, pero estos valores dependen en gran medida del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Dimension embedding | Licencia | Contexto |
|---|---|---|---|---|---|
| F2LLM-v2-1.7B | 1.7B | >200 | 2048 | Apache 2.0 | no disponible |
| BGE-M3 | 568M | 100+ | 1024 | MIT | 8192 |
| E5-mistral-7b-instruct | 7B | 100+ | 4096 | MIT | 32768 |
| GTE-Qwen2-1.5B-instruct | 1.5B | 100+ | 1024 | Apache 2.0 | 32768 |

F2LLM-v2-1.7B se posiciona como una alternativa de tamaño medio con una cobertura lingüística excepcionalmente amplia. Comparado con BGE-M3, ofrece más parámetros y una mayor cobertura de idiomas, aunque BGE-M3 tiene una ventana de contexto mayor. Frente a E5-mistral-7b-instruct, F2LLM es significativamente más ligero y con licencia más permisiva, aunque con menor dimensión de embedding. GTE-Qwen2-1.5B-instruct es el competidor más directo por tamaño y licencia, aunque F2LLM ofrece el doble de dimensión de embedding y una cobertura lingüística superior.

## Limitaciones y advertencias

- No se dispone de información sobre la longitud máxima de contexto soportada, lo que puede limitar su uso en documentos extensos.
- El modelo está diseñado específicamente para generar embeddings; no es un modelo generativo y no puede producir texto.
- Aunque la cobertura lingüística es amplia, el rendimiento en lenguas de muy bajos recursos puede ser inferior al de los idiomas principales.
- No se han publicado resultados detallados de benchmarks en la documentación accesible, por lo que las afirmaciones de rendimiento de los autores no han sido verificadas de forma independiente en esta ficha.
- El tamaño del repositorio es de 130,8 GB, lo que incluye posiblemente checkpoints adicionales o datos; la descarga del modelo puede requerir un ancho de banda considerable.
- Al ser un modelo de embeddings, los sesgos presentes en los datos de entrenamiento pueden reflejarse en las representaciones generadas, afectando potencialmente a tareas downstream como búsqueda o clasificación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/codefuse-ai/F2LLM-v2-1.7B
- Modelo base: https://huggingface.co/codefuse-ai/F2LLM-v2-1.7B-Preview
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Paper (arXiv): https://arxiv.org/abs/2603.19223
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
