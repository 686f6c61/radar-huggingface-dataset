# lightonai/mLateOn

## Resumen

mLateOn es un modelo de retrieval multilingüe basado en la arquitectura ColBERT (multi-vector) desarrollado por LightOn AI. Construido sobre mmBERT-base, cuenta con 307 millones de parámetros y soporta contextos de hasta 8.192 tokens tanto para documentos como para consultas, empleando scoring MaxSim. Su propósito principal es la búsqueda semántica y el retrieval de información en entornos multilingües, incluyendo documentos largos y código fuente.

El modelo destaca por haber sido entrenado mediante la técnica translate-train: en lugar de recopilar corpus multilingües desde cero, LightOn tradujo automáticamente sus datos en inglés validados a ocho idiomas objetivo (francés, alemán, italiano, español, portugués, sueco, noruego y árabe) y añadió pares cross-lingües para alineación. A pesar de entrenarse solo en nueve idiomas, mLateOn generaliza a lenguas y alfabetos no vistos durante el entrenamiento, como el cirílico o el japonés, lo que demuestra que la interacción tardía (late interaction) permite una cobertura multilingüe amplia sin necesidad de traducción exhaustiva.

Su relevancia actual radica en que alcanza resultados de vanguardia en benchmarks de retrieval multilingüe, documentos largos y código, superando incluso a modelos densos de mayor tamaño. Es parte de la familia DenseOn/LateOn de LightOn, junto con su variante densa mDenseOn, y está disponible bajo licencia Apache 2.0, lo que facilita su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (multi-vector, late interaction) sobre mmBERT-base |
| Parametros totales | 306.941.184 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX; cuantizacion posible con herramientas externas) |
| Idiomas soportados | en, fr, de, it, es, pt, sv, no (noruego), ar, code (codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

mLateOn adopta la arquitectura ColBERT, que genera una representacion multi-vector para cada documento y consulta, y calcula la similitud mediante MaxSim (maximo de similitudes por token). Esta aproximacion permite una mayor granularidad que los embeddings densos tradicionales, especialmente beneficiosa para retrieval de documentos largos y consultas complejas. El modelo base es mmBERT, una variante multilingue de BERT con 307 millones de parametros.

El entrenamiento sigue un proceso de dos etapas. Primero se realiza un preentrenamiento no supervisado (modelo lightonai/mLateOn-unsupervised) y posteriormente un fine-tuning supervisado con datos traducidos. La clave del enfoque translate-train es que, en lugar de recopilar corpus nativos para cada idioma, se traducen automaticamente los datos en ingles ya validados a ocho idiomas objetivo, anadiendo pares cross-linguales para alinear los espacios semanticos. Los autores demuestran que esta receta, aplicada a una arquitectura de interaccion tardia, produce una generalizacion a idiomas no vistos muy superior a la obtenida con encoders densos, lo que constituye una innovacion tecnica destacable.

## Capacidades

- Retrieval semantico multilingue en nueve idiomas (ingles, frances, aleman, italiano, espanol, portugues, sueco, noruego, arabe) y codigo.
- Busqueda de documentos largos gracias a su ventana de contexto de 8.192 tokens.
- Busqueda de codigo fuente, con resultados de 73.48 NDCG@10 en MTEB Code.
- Generalizacion a idiomas y alfabetos no vistos durante el entrenamiento (cirilico, japones, entre otros).
- Generacion de embeddings multi-vector compatibles con PyLate, sentence-transformers y Text Embeddings Inference (TEI).
- Adecuado para tareas de re-ranking y recuperacion de informacion en pipelines RAG.
- No es un modelo generativo; se trata de un modelo de embeddings para similitud y retrieval.

## Casos de uso

- Busqueda semantica multilingue en bases de conocimiento corporativas: permite consultar documentacion interna en un idioma y recuperar documentos en otro, gracias a su alineacion cross-lingue.
- RAG (Retrieval-Augmented Generation) con documentos extensos: su contexto de 8.192 tokens facilita la indexacion de informes, manuales o articulos largos sin fragmentacion excesiva.
- Busqueda de codigo en repositorios: puede indexar funciones, clases o bloques de codigo y recuperarlos a partir de consultas en lenguaje natural, integrable en entornos de desarrollo.
- Re-ranking de resultados de busqueda: como modelo multi-vector, puede combinarse con una primera etapa de retrieval denso para refinar los resultados con MaxSim.
- Sistemas de recomendacion de documentos academicos o legales: su capacidad multilingue permite recomendar articulos o sentencias en varios idiomas.
- Asistencia a equipos de soporte internacional: recuperacion de respuestas o articulos de ayuda en el idioma del usuario, incluso si el corpus esta en ingles.

## Benchmarks y rendimiento

Los resultados publicados en la model card (NDCG@10) son los siguientes:

| Modelo | Tamano | BEIR | MIRACL<sub>tgt</sub> | MIRACL | MLDR<sub>tgt</sub> | MLDR | Code |
|---|---|---|---|---|---|---|---|
| **mLateOn** | 307M | **57.56** | **65.61** | 67.04 | **87.69** | **77.92** | 73.48 |
| mDenseOn | 307M | 56.70 | 59.61 | 58.02 | 64.98 | 51.59 | 71.53 |
| LateOn (ingles) | 307M | 57.22 | - | - | - | - | - |

Las columnas MIRACL<sub>tgt</sub> y MLDR<sub>tgt</sub> incluyen solo los idiomas objetivo del entrenamiento, mientras que MIRACL y MLDR completos abarcan todos los idiomas del benchmark. mLateOn supera al modelo ingles LateOn en BEIR, lo que indica que el entrenamiento multilingue puede mejorar el rendimiento en ingles. En MLDR<sub>tgt</sub> abre una ventaja de mas de 9 puntos sobre el siguiente mejor modelo (LFM2.5-ColBERT-350M, con 78.39), segun se menciona en la documentacion. No se dispone de resultados completos de otros modelos comparables en la informacion proporcionada.

## Requisitos de hardware

- El modelo tiene 306,9 millones de parametros. En precision FP16, los pesos ocupan aproximadamente 614 MB; en int8, unos 307 MB; en int4, unos 154 MB. El repositorio safetensors ocupa 2,8 GB, probablemente en FP32.
- Es viable en GPUs de consumo: una RTX 3060 (12 GB) o superior puede ejecutar el modelo sin problemas, incluso con cuantizacion.
- Para despliegue en produccion, se recomienda usar Text Embeddings Inference (TEI), vLLM (con soporte para embeddings), o PyLate / sentence-transformers para integraciones personalizadas.
- No se han publicado datos oficiales de latencia o throughput. Como referencia, un modelo de este tamano suele procesar cientos de consultas por segundo en una GPU moderna con batching adecuado.
- Para indexacion de grandes volumenes de documentos, se requiere memoria RAM suficiente para almacenar los embeddings generados (multi-vector, por lo que el indice sera mayor que con embeddings densos).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | BEIR (NDCG@10) | MIRACL completo | MLDR completo |
|---|---|---|---|---|---|---|---|
| **mLateOn** | ColBERT multilingue | 307M | 8.192 | Apache 2.0 | 57.56 | 67.04 | 77.92 |
| mDenseOn | Dense (single-vector) multilingue | 307M | 8.192 | Apache 2.0 | 56.70 | 58.02 | 51.59 |
| LateOn | ColBERT ingles | 307M | 8.192 | Apache 2.0 | 57.22 | - | - |

mLateOn supera a su variante densa mDenseOn en todos los benchmarks, especialmente en MLDR, donde la diferencia es de mas de 26 puntos. Frente a LateOn (ingles), mLateOn logra un BEIR ligeramente superior, lo que confirma que el entrenamiento multilingue no penaliza el rendimiento en ingles. No se dispone de datos completos de otros modelos ColBERT multilingues como LFM2.5-ColBERT-350M, aunque se menciona que mLateOn lo supera ampliamente en MLDR<sub>tgt</sub>.

## Limitaciones y advertencias

- El modelo se entrena solo en nueve idiomas; aunque generaliza a otros, el rendimiento en idiomas muy alejados de esos nueve puede ser inferior al de modelos entrenados especificamente para ellos.
- Al ser un modelo multi-vector, el indice generado ocupa mas espacio que uno denso y el calculo de similitud es mas costoso, lo que puede requerir optimizaciones en despliegues a gran escala.
- No es un modelo generativo: no produce texto, solo embeddings. Para tareas de generacion debe combinarse con un LLM.
- No se han publicado analisis de sesgos especificos. Como cualquier modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los terminos de los datos de entrenamiento subyacentes.
- La documentacion no especifica los detalles del proceso de cuantizacion ni ofrece versiones pre-cuantizadas, por lo que el usuario debe realizar ese paso si lo necesita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightonai/mLateOn
- Paper: https://arxiv.org/abs/2607.27178
- Blog multilingue de LightOn: https://huggingface.co/blog/lightonai/mdenseon-mlateon
- Blog en ingles sobre DenseOn/LateOn: https://huggingface.co/blog/lightonai/denseon-lateon
- Repositorio PyLate: https://github.com/lightonai/pylate
- Repositorio FastPlaid: https://github.com/lightonai/fast-plaid
- Scripts de entrenamiento y fine-tuning: https://github.com/lightonai/mdenseon-mlateon
