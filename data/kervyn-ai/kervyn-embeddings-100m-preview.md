# Kervyn-AI/Kervyn-Embeddings-100M-Preview

## Resumen

Kervyn Embeddings 100M Preview es un modelo de embeddings de texto en español e inglés publicado por Kervyn-AI como primera versión pública de su familia de modelos de recuperación. Se presenta como un modelo entrenado desde cero (arquitectura, tokenizer y pesos propios) y licenciado bajo Apache-2.0, lo que lo distingue de la mayoría de embeddings multilingües disponibles, que derivan de modelos base con licencias heredadas. Su función concreta es convertir textos en vectores para búsqueda semántica y recuperación de documentos, incluyendo recuperación cruzada entre idiomas (una pregunta en español que encuentra un pasaje escrito en inglés).

Técnicamente es un encoder de ~103,9 millones de parámetros con arquitectura ModernBERT (tag `modernbert` en el repositorio) y empaquetado para la librería `sentence-transformers` con pesos en `safetensors`. El autor declara un entrenamiento con pasajes de hasta 256 tokens, sin prefijos de consulta o pasaje, y una orientación explícita a dos etapas de búsqueda: recuperación con este modelo y reordenación con su pareja Kervyn Rerank 100M Preview. El repositorio ocupa 0,4 GB y el modelo está marcado como compatible con Text Embeddings Inference y endpoints de Hugging Face.

Su relevancia práctica es que compite en la franja de embeddings pequeños (frente a multilingual-e5-small, multilingual-e5-base y bge-m3) con cifras declaradas por el autor que lo sitúan por delante en tareas ES→EN y en búsqueda de código. Al ser una preview, los pesos pueden cambiar entre revisiones y conviene fijar `revision="v1"` en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), según tag del repositorio |
| Parametros totales | 103.877.376 (~104M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con pasajes de hasta 256 tokens según el autor |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite las cuantizaciones estándar de sentence-transformers/TEI, sin datos concretos del autor) |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |
| Dimension de embedding | no disponible |
| Normalizacion | sí, `normalize_embeddings=True` en el ejemplo del autor |
| Prefijos de consulta/pasaje | ninguno |
| Pipeline | sentence-similarity / feature-extraction |
| Compatibilidad de despliegue | Text Embeddings Inference, endpoints de HF |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer con arquitectura ModernBERT, según la etiqueta del repositorio. El autor afirma que es un modelo propio entrenado desde cero: arquitectura, tokenizer y pesos no derivan de ningún modelo base, algo poco habitual en la categoría de embeddings pequeños, donde lo normal es partir de un encoder preentrenado y aplicar entrenamiento contrastivo. El tamaño declarado en safetensors es de 103.877.376 parámetros, coherente con la denominación comercial de "100M".

La información disponible no detalla el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO (poco habituales en modelos de embeddings, que suelen entrenarse con objetivos contrastivos y datos de pares positivos/negativos). Sí se publica una lista amplia de datasets utilizados, que permite inferir la composición del corpus: datos web y educativos (`fineweb-2`, `fineweb-edu`, `ccnews`), enciclopédicos (`wikipedia`), código (`codeparrot/github-code-clean`, `codesearchnet`, `code-search-net/code_search_net`), textos legales multilingües (`multi_eurlex`, `un_pc`), preguntas y respuestas (`SQAC`, `ms-marco-es-500k`, `natural-questions`, `gooaq`, `squad`, `eli5`) y una batería amplia de datasets de sentence-transformers para NLI, duplicados de StackExchange, pares de código y pares paralelos multilingües (Europarl, Tatoeba, Talks, Global Voices). Esta mezcla apunta a un entrenamiento contrastivo con datos de recuperación, similitud y traducción, orientado a alinear español e inglés en el mismo espacio vectorial.

La única innovación técnica documentada es de diseño de uso, no de arquitectura: el modelo no requiere prefijos distintos para consultas y pasajes, lo que simplifica la integración y reduce errores en pipelines. No se publican detalles sobre atención, decodificación especulativa ni técnicas de atención lineal.

## Capacidades

- Generación de embeddings de texto para similitud semántica, recuperación de pasajes y clustering de documentos.
- Recuperación monolingüe en español y en inglés.
- Recuperación cruzada ES→EN y EN→ES: una pregunta en un idioma recupera pasajes escritos en el otro.
- Búsqueda de código desde lenguaje natural (el autor reporta 90,1 en CodeSearchNet Python).
- Codificación simétrica sin prefijos: consultas y pasajes se procesan con la misma función.
- Normalización de embeddings opcional para usar similitud coseno directamente.
- Compatible con el stack `sentence-transformers` (carga directa, `encode`, `similarity`).
- Orientado a pipelines de dos etapas junto a Kervyn Rerank 100M Preview.
- Ajuste fino completo viable en una GPU de consumo e incluso en CPU con pocos datos, según el autor.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso. Es un encoder de recuperación.

## Casos de uso

- Buscador interno de documentación de empresa en español e inglés: se indexan los pasajes una sola vez y las consultas de los empleados, en cualquiera de los dos idiomas, recuperan fragmentos relevantes aunque estén escritos en el otro idioma.
- Soporte al cliente sobre base de conocimiento: las preguntas de los usuarios se codifican y se comparan contra FAQ y artículos de ayuda; con 104M de parámetros el coste por consulta es bajo y se puede desplegar cerca del backend de atención.
- Búsqueda de código desde lenguaje natural: un desarrollador describe en español lo que necesita ("función que valide un CSV") y el modelo recupera funciones o ficheros de un repositorio, gracias a que se entrenó con CodeSearchNet y GitHub Code Clean.
- Chatbot RAG sobre normativa y contratos: recuperación de cláusulas y artículos en un corpus legal bilingüe (se entrenó con MultiEURLEX y UN Parallel Corpus), seguida de reordenación con el reranker de la misma familia.
- Deduplicación y clustering de tickets o noticias: similitud entre pares permite agrupar incidencias equivalentes y detectar duplicados en la cola de soporte, tanto en español como entre idiomas.
- Ajuste fino por dominio y despliegue privado: una empresa legal, aseguradora o de soporte técnico puede entrenar el modelo con sus propios pares pregunta-pasaje en su infraestructura, sin enviar datos a terceros, y conservar el resultado bajo Apache-2.0.
- Motor de búsqueda para catálogos de producto en mercados ES/EN: consultas en español contra fichas de producto en inglés o viceversa, con un coste de inferencia compatible con CPU si el tráfico es moderado.
- Recuperación dentro de pipelines CI/CD de documentación técnica: indexación automática de READMEs y código en cada commit y búsqueda posterior por los equipos, sin depender de servicios externos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Evaluacion | Kervyn Embeddings 100M | multilingual-e5-small (118M) | multilingual-e5-base (278M) | bge-m3 (568M) |
|---|---|---|---|---|
| Belebele ES→EN | 90,1 | 86,9 (implícito: +3,2) | 89,4 (implícito: +0,7) | no disponible |
| STS17 ES-EN (similitud) | 78,0 | no disponible | no disponible | 75,6 |
| CodeSearchNet Python | 90,1 | ~85,3 a ~86,3 (implícito: +3,8 a +4,8) | no disponible | no disponible |
| Media de búsqueda (sin especificar conjunto) | referencia | +0,8 a favor de Kervyn | 0,55 por encima de Kervyn | 0,4 por encima de Kervyn |
| Media embeddings + reranker | 94,45 (con Kervyn Rerank 100M) | — | — | 94,18 (con bge-reranker-v2-m3) |

Notas sobre la comparativa del autor: la pareja Kervyn (208M en total) supera ligeramente a bge-m3 + bge-reranker-v2-m3 (1.136M en total) en la media global y reordena 2,8 veces más rápido en CPU; sin embargo, en tareas exclusivamente de texto el autor reconoce que la pareja bge queda aproximadamente 1 punto por delante. Los valores de e5-small y e5-base en las filas de Belebele y la media de búsqueda se derivan de las diferencias declaradas, no de cifras publicadas directamente. No se han publicado resultados de MMLU, GSM8K ni HumanEval porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,2 GB de pesos más overhead de activaciones; en la práctica cabe en cualquier GPU con más de 1 GB.
- VRAM estimada en FP32: alrededor de 0,42 GB de pesos; también trivial.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU para tráfico moderado y en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) para alto throughput. En servidores, A100/H100 son innecesarias por tamaño, aunque sirven para servir en lote a gran escala.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y en CPU.
- Opciones de despliegue: `sentence-transformers` (referencia), Text Embeddings Inference (TEI) según el tag del repositorio, y endpoints de Hugging Face. No se documenta soporte GGUF/Ollama en la información disponible.
- Latencia y throughput: no se publican cifras concretas. El autor sí afirma que el reranker de la familia reordena 2,8 veces más rápido en CPU que bge-reranker-v2-m3, pero no da números del embedding.
- Ajuste fino: el autor indica que el ajuste completo cabe en una sola GPU de consumo y que con pocos datos funciona incluso en CPU, sin necesidad de LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasajes | Idiomas | Licencia | Puntos fuertes declarados |
|---|---|---|---|---|---|
| Kervyn Embeddings 100M Preview | 103,9M | entrenado con pasajes de hasta 256 tokens; contexto máximo no disponible | es, en | Apache-2.0 | ES→EN y búsqueda de código; entrenado desde cero sin licencias heredadas |
| multilingual-e5-small | 118M | no disponible en esta ficha | multilingüe | MIT (según el modelo original) | Referencia consolidada; Kervyn declara +0,8 de media en búsqueda |
| multilingual-e5-base | 278M | no disponible en esta ficha | multilingüe | MIT (según el modelo original) | Más capacidad con 2,7 veces más parámetros; Kervyn queda 0,55 por debajo en la media declarada |
| bge-m3 | 568M | no disponible en esta ficha | multilingüe | MIT (según el modelo original) | Fuerte en texto puro; Kervyn declara ventaja en STS17 ES-EN y en la pareja con reranker |

La comparativa se basa en las cifras de la model card del autor. La ventaja diferencial de Kervyn frente a estos modelos es doble: licencia Apache-2.0 sobre un modelo entrenado desde cero (sin herencia de licencias de terceros) y un tamaño que permite ajuste fino y despliegue en CPU. La desventaja es la madurez: los otros tres modelos tienen ecosistema, documentación y evaluaciones independientes mucho más extensas.

## Limitaciones y advertencias

- Es una versión preview: el autor advierte que los pesos pueden cambiar en próximas versiones. En producción hay que fijar `revision="v1"` para evitar actualizaciones silenciosas.
- Solo cubre español e inglés de forma declarada. Su comportamiento en otras lenguas, incluido el catalán, el gallego o el euskera, no está documentado.
- Está entrenado con pasajes de hasta 256 tokens; documentos más largos deben trocearse en fragmentos de ~200 palabras. El contexto máximo real del encoder no se publica.
- No es un modelo generativo: no responde preguntas ni genera texto, solo produce vectores. No debe usarse para tareas que requieran razonamiento o tool calling.
- Riesgo de recuperación incorrecta en dominios muy alejados de los datos de entrenamiento (por ejemplo, terminología médica o jurídica muy especializada); el autor recomienda ajuste fino con datos propios. Un embedding pequeño tenderá a perder matices frente a modelos de 500M o más en esos casos.
- Las cifras de benchmarks son declaradas por el autor y no se han verificado de forma independiente; algunas, como las de e5-small y e5-base en Belebele, se derivan de diferencias declaradas y no de resultados publicados directamente.
- Sesgos: no se documenta ningún análisis de sesgos. Al entrenarse con datos web (FineWeb-2, CCNews) y Wikipedia, es previsible que herede sesgos de esas fuentes en la representación de grupos y temas.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución sin restricciones adicionales más allá de las obligatorias de la licencia (aviso de copyright y de cambios). El autor confirma que el modelo ajustado es propiedad del usuario.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin documentación externa, papers ni evaluaciones de terceros. Conviene validarlo con un conjunto propio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kervyn-AI/Kervyn-Embeddings-100M-Preview
- Reranker de la misma familia: https://huggingface.co/Kervyn-AI/Kervyn-Rerank-100M-Preview
- Repositorio de la librería sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Paper de Belebele: https://arxiv.org/abs/2308.16884
- Paper de STS17: https://arxiv.org/abs/1708.02709
- Paper de CodeSearchNet: https://arxiv.org/abs/1909.09436
- Paper de bge-m3: https://arxiv.org/abs/2402.03216
- Paper de multilingual-e5: https://arxiv.org/abs/2212.03533
