# GermannM/kenga-embed-prophet-instruct

## Resumen

`kenga-embed-prophet-instruct` es un modelo de embeddings bilingüe (ruso e inglés) desarrollado por GermannM, con una arquitectura de encoder bidireccional de bytes UTF-8 de 42 millones de parámetros. Está diseñado para tareas de recuperación de información (retrieval) y similitud semántica de textos (STS), siguiendo el protocolo de prefijos instruct de Giga-Embeddings: solo se aplica prefijo en la consulta para retrieval, y en ambos lados para STS. El modelo no es un modelo de chat: no genera respuestas de texto.

El encoder opera a nivel de bytes (vocabulario de 256 valores), con una longitud de secuencia máxima de 160. Esto lo hace compacto y ligero, pero limita su uso a fragmentos de texto cortos. Según las mediciones del autor (2026-09-03), el modelo supera a Giga-Embeddings-instruct-480M en un holdout propio de 12 triples en inglés y 12 en ruso, aunque muestra un rendimiento mucho menor en el benchmark RuSTSBenchmarkSTS (0.4416 frente a 0.8033). La licencia es MIT, lo que permite uso comercial, y el repositorio ocupa 0.2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional de bytes UTF-8 (Transformer) |
| Parametros totales | ~42M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 160 (seq 160; longitud de secuencia de entrada en bytes/tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repo de 0.2 GB; formato exacto no especificado) |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional de bytes UTF-8 con dimensiones D=768, 8 capas, 12 cabezas de atención, dff=3072 y vocabulario de 256 bytes. Utiliza mean-pooling seguido de una capa lineal para obtener la representación final. La arquitectura no es una mezcla de expertos (MoE) ni un modelo SSM: es un Transformer denso estándar a nivel de bytes, con un tamaño total de aproximadamente 42 millones de parámetros.

El entrenamiento sigue el protocolo instruct de Giga-Embeddings: los prefijos se integran en el loader de HuggingFace, de modo que el usuario no debe añadirlos manualmente. Para retrieval, la consulta recibe el prefijo `Instruct: Given a query, retrieve relevant passages\nQuery: ` y los documentos se codifican sin prefijo. Para STS, ambas frases reciben `Instruct: Retrieve semantically similar text.\nQuery: `. El checkpoint corresponde al paso 10400, con accuracy de 0.833 en inglés y 1.0 en ruso sobre un holdout propio. No se han publicado detalles sobre la composición del dataset ni sobre procesos de RLHF/DPO. El autor indica que el código de entrenamiento reside en el árbol `kenga-lang / z-system`, no en este repositorio.

## Capacidades

- Genera embeddings de texto para recuperación de pasajes (retrieval) y similitud semántica de oraciones (STS).
- Soporta prefijos instruct integrados, siguiendo el mismo protocolo que Giga-Embeddings-instruct.
- Bilingüe: funciona con texto en ruso e inglés.
- No es un modelo de chat: no produce respuestas de texto.
- Longitud de secuencia limitada a 160 bytes, lo que restringe el uso a pasajes cortos.
- Compatible con la clase personalizada `KengaEmbed` de PyTorch, que permite codificar consultas, documentos y pares STS mediante métodos específicos.

## Casos de uso

- Busqueda semantica en corpus rusos: el modelo codifica consultas y pasajes, y mediante similitud coseno recupera fragmentos relevantes. El prefijo instruct permite diferenciar consultas de documentos, lo que mejora la precision en retrieval.
- RAG (generacion aumentada por recuperacion) en ruso o ingles: se indexan pasajes cortos (maximo 160 bytes) de una base de conocimiento y se recuperan los mas similares a una pregunta. Adecuado para prototipos con corpus pequenos.
- Deteccion de duplicados en bases de datos de texto: se generan embeddings de oraciones o parrafos y se comparan por similitud coseno para identificar documentos casi identicos o parafraseados.
- Clasificacion de textos en ruso: los embeddings congelados se pueden usar como entrada a un clasificador lineal, aprovechando la representacion semantica de 42M de parametros, sin necesidad de afinado completo.
- Similitud semantica de frases (paraphrase detection): el modelo evalua si dos oraciones son semanticamente equivalentes mediante el prefijo STS, util en sistemas de deduplicacion de comentarios o preguntas frecuentes.
- Agrupacion (clustering) de documentos tematicos: los embeddings permiten agrupar noticias o articulos cortos en ruso e ingles por similitud tematica, facilitando la organizacion automatica de contenido.

## Benchmarks y rendimiento

El autor ha publicado mediciones propias realizadas el 2026-09-03 sobre un holdout manual de 12 triples en inglés y 12 en ruso, y sobre el split de test de RuSTSBenchmarkSTS (1264 pares, coeficiente de Spearman con similitud coseno). No se ha ejecutado la suite oficial MTEB(rus, v1) por falta de `pytrec_eval` en el entorno de entrenamiento.

| Benchmark | kenga-embed-prophet-instruct | Giga-Embeddings-instruct-480M |
|---|---|---|
| Holdout propio (12 EN + 12 RU triples, accuracy) | EN: 0.833 (10/12) \| RU: 1.000 (12/12) \| media: 0.917 | EN: 0.833 (10/12) \| RU: 0.917 (11/12) \| media: 0.875 |
| RuSTSBenchmarkSTS (1264 pares, Spearman coseno) | 0.4416 | 0.8033 |

Nota: los datos del holdout no provienen de ruMTEB ni de un benchmark oficial. El propio autor indica que el rendimiento STS del modelo está lejos del de Giga y que se requiere ejecutar la suite oficial para una evaluación fiable.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (aproximadamente 168 MB para 42M parámetros) y en torno a 84 MB en fp16. No se han publicado cuantizaciones específicas.
- GPU recomendada: no es necesaria una GPU de gama alta; cualquier GPU consumer (por ejemplo, RTX 3060) es suficiente, y la inferencia en CPU es viable para lotes pequeños.
- Opciones de despliegue: HuggingFace Transformers con la clase personalizada `KengaEmbed`, o integración en pipelines de sentence-transformers. No se menciona soporte para vLLM, llama.cpp ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Uso principal | Rendimiento (holdout propio) |
|---|---|---|---|---|---|
| kenga-embed-prophet-instruct | 42M | 160 | MIT | Embeddings retrieval/STS | EN 0.833 \| RU 1.000 |
| Giga-Embeddings-instruct-480M | 480M | No disponible | No disponible | Embeddings retrieval/STS | EN 0.833 \| RU 0.917 |

No se han identificado otras alternativas comparables con datos suficientes en la información disponible. Los modelos `kenga-prophet-m3` y `kenga-prophet-m5` pertenecen a la misma familia del autor, pero no se dispone de especificaciones ni benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de chat: no genera respuestas de texto.
- Longitud de secuencia máxima de 160 bytes, lo que limita su uso a pasajes cortos y desaconseja documentos largos.
- Rendimiento en STS significativamente inferior al de Giga-Embeddings-instruct-480M (0.4416 frente a 0.8033 en RuSTSBenchmarkSTS).
- Las métricas publicadas se basan en un holdout pequeño (12+12 triples) y en un split de RuSTS; no se ha ejecutado la suite MTEB completa.
- Errores conocidos en el holdout: el modelo confunde pares como Anna Karenina (trampa de Leo Strauss) y H2O vs H2O2.
- Es obligatorio respetar el protocolo de prefijos instruct: omitirlos produce puntuaciones de similitud incorrectas.
- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos no públicos, no se puede descartar su presencia.

## Enlaces

- HuggingFace: https://huggingface.co/GermannM/kenga-embed-prophet-instruct
- GitHub kenga-lang: https://github.com/GermannM3/kenga-lang
- Ejemplos kenga-lang: https://github.com/GermannM3/kenga-lang/tree/main/examples
- Modelo relacionado kenga-prophet-m5: https://huggingface.co/GermannM/kenga-prophet-m5
- Modelo relacionado kenga-prophet-m3: https://huggingface.co/GermannM/kenga-prophet-m3
