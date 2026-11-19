# nvidia/Nemotron-3.5-Embed-1B-BF16

## Resumen

Nemotron-3.5-Embed-1B-BF16 es un modelo de embeddings densos desarrollado por NVIDIA, diseñado para recuperación de información multimodal y multilingüe. Convierte en vectores de tamaño fijo tanto texto (consultas, fragmentos, OCR de páginas) como imágenes de páginas de documento, lo que permite construir sistemas de búsqueda semántica y RAG sobre corpus que mezclan texto e imágenes. Es relevante porque unifica la recuperación textual y la de documentos visuales (tablas, gráficos, infografías) en un único espacio de embeddings.

El modelo parte de una arquitectura transformer bi-encoder con 1.554.710.528 parámetros. Combina un codificador visual Pixtral inicializado desde mistralai/Ministral-3-3B-Instruct-2512-BF16 con un componente de lenguaje inicializado desde nvidia/Nemotron-3-Embed-1B-BF16. Se ha destilado del modelo profesor Nemotron-3.5-Embed-8B-BF16 y conserva el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B, añadiendo la capacidad de recuperación de imágenes.

NVIDIA lo publica bajo licencia OpenMDW-1.1 con uso comercial permitido, en formato BF16 y con variantes NVFP4 y de 8B en la misma familia. Está pensado para aplicaciones de question-answering sobre grandes corpus documentales y para flujos de trabajo agénticos de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (codificador visual Pixtral + modelo de lenguaje) |
| Parametros totales | 1.554.710.528 (1,55B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (variante publicada); existe variante NVFP4 en la familia |
| Idiomas soportados | Multilingüe; evaluado en 34 idiomas para texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y 18 para imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial); modelos base Ministral bajo Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer bi-encoder que produce un vector de embedding de tamaño fijo a partir de una entrada de texto, una imagen o una combinación de ambas. El codificador visual es un Pixtral inicializado desde mistralai/Ministral-3-3B-Instruct-2512-BF16, y el componente de lenguaje se inicializa desde nvidia/Nemotron-3-Embed-1B-BF16. La consulta se acepta únicamente en texto; el documento puede ser imagen, texto o imagen más texto.

El entrenamiento se basa en destilación desde el profesor Nemotron-3.5-Embed-8B-BF16, usando una combinación de pérdida de distancia coseno (COS) y error cuadrático medio (MSE) sobre datos multilingües de recuperación de texto e imagen. El componente de lenguaje se mantuvo congelado durante la destilación, de modo que el modelo comparte el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B y añade la capacidad de recuperación visual. El codificador visual y la proyección multimodal se afinaron sobre conjuntos de datos de imagen y de imagen más texto. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de embeddings densos de tamaño fijo a partir de texto, imagen o combinación de ambos.
- Recuperación multimodal: búsqueda de páginas de documento (con texto, tablas, gráficos e infografías) a partir de una consulta textual.
- Recuperación de texto multilingüe evaluada en 34 idiomas.
- Recuperación de imagen multilingüe evaluada en 18 idiomas.
- Soporte de búsqueda semántica y flujos RAG, incluidos flujos agénticos.
- Compatible con sentence-transformers, transformers y vLLM.
- Comparte espacio de embeddings de texto con Nemotron-3-Embed-1B, lo que permite reutilizar índices textuales existentes.
- No es un modelo generativo: no produce texto, sino vectores.

## Casos de uso

- RAG sobre corpus documentales escaneados: se vectorizan las páginas como imágenes y se recuperan mediante consultas de texto, evitando depender de un OCR perfecto en tablas y gráficos.
- Búsqueda semántica en bases de conocimiento multilingües: el modelo cubre 34 idiomas en texto, lo que permite consultar en un idioma y recuperar documentos en otro dentro del mismo índice.
- Recuperación de documentos visuales en atención al cliente: manuales, facturas o informes con tablas se indexan como imagen y se recuperan por similitud semántica.
- Migración progresiva de índices de texto: al compartir espacio de embeddings con Nemotron-3-Embed-1B, se pueden añadir documentos visuales a un índice textual existente sin recalcular todos los vectores.
- Agentes de recuperación multi-paso: el modelo actúa como recuperador en pipelines agénticos donde el agente formula consultas sucesivas contra un almacén vectorial.
- Búsqueda interna empresarial sobre repositorios mixtos: combina texto plano y páginas escaneadas en un único índice vectorial.
- Moderación y deduplicación de contenido visual: la representación vectorial de páginas permite detectar duplicados o contenido similar a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB de pesos (tamaño del repositorio), más overhead de activaciones y del codificador visual; en la práctica, unos 4-6 GB para lotes pequeños.
- La variante NVFP4 de la familia reduce el peso de los pesos y permite despliegue en GPUs con menor VRAM.
- GPU recomendadas: A100, H100 y GPUs de datacenter para indexación a gran escala; RTX 4090 y GPUs consumer con 8 GB o más para inferencia y evaluación.
- Cabe en GPU consumer: sí, en modelos con al menos 8 GB de VRAM en BF16; con NVFP4 el umbral baja.
- Opciones de despliegue: sentence-transformers, transformers, vLLM; también disponible en Azure (tag deploy:azure).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-BF16 | 1,55B | no disponible | Sí (texto + imagen) | 34 (texto), 18 (imagen) | OpenMDW-1.1 |
| Nemotron-3.5-Embed-8B-BF16 | 8B (aproximado, según nombre) | no disponible | Sí | no disponible | OpenMDW-1.1 |
| Nemotron-3-Embed-1B-BF16 | 1B (aproximado, según nombre) | no disponible | No (solo texto) | no disponible | no disponible |

Los datos de la variante 8B y de Nemotron-3-Embed-1B se derivan de los nombres y referencias de la model card; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; requiere un generador separado para tareas de respuesta.
- Las consultas solo se aceptan en texto; no se pueden usar imágenes como consulta.
- No se especifica la longitud máxima de contexto ni el tamaño máximo de imagen soportado.
- Riesgo de sesgo heredado de los datos de entrenamiento y de los modelos base (Ministral y Nemotron-3-Embed); no se documentan evaluaciones de sesgo en la información disponible.
- La calidad de recuperación en idiomas fuera de los 34 evaluados (texto) y 18 (imagen) no está garantizada.
- El uso comercial está permitido bajo OpenMDW-1.1, pero conviene revisar los términos de dicha licencia y las obligaciones derivadas de los modelos base Apache 2.0.
- Al ser un modelo destilado de un profesor de 8B, puede presentar una brecha de rendimiento frente a este en dominios especializados.
- No se han publicado benchmarks en la información disponible, por lo que la evaluación comparativa debe hacerse sobre el propio corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Variante 8B: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Modelo de texto previo: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Modelo base Mistral: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base Mistral 8B: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Blog de NVIDIA sobre recuperación: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
