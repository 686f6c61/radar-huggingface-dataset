# elplaguister/patent_classifier_qwen

## Resumen

`elplaguister/patent_classifier_qwen` es un modelo de embeddings de similitud semantica especializado en la clasificacion de patentes coreanas segun la taxonomia KOS (Korean Classification of Science and Technology). Desarrollado por el usuario `elplaguister`, el modelo se obtiene mediante fine-tuning de `Qwen/Qwen3-Embedding-0.6B` sobre un corpus de 2.002 patentes coreanas, con el objetivo de recuperar las descripciones de subclasificacion KOS mas relevantes para un texto de patente dado.

El modelo emplea la arquitectura de Qwen3-Embedding-0.6B, un transformer de aproximadamente 596 millones de parametros, y se distribuye bajo licencia Apache 2.0. Su ventana de contexto alcanza los 32.768 tokens, lo que permite procesar documentos de patente extensos. Esta pensado para su uso con la libreria `sentence-transformers` y es compatible con Text Embeddings Inference (TEI) para despliegue en produccion.

La relevancia de este modelo radica en su especializacion: en lugar de ser un embedding generico, esta optimizado para la tarea concreta de recuperacion de clasificaciones tecnologicas, un caso de uso habitual en oficinas de patentes, equipos de I+D y servicios de inteligencia competitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Embedding-0.6B`, un modelo de embeddings denso basado en la arquitectura transformer de Qwen3. El fine-tuning se realizo con la herramienta Embedding-Factory utilizando la funcion de perdida Cached Multiple Negatives Ranking Loss, una variante de Multiple Negatives Ranking Loss que cachea los embeddings para acelerar el entrenamiento con lotes grandes.

El conjunto de entrenamiento consta de 2.002 patentes coreanas, donde cada patente se asocia como positivo a todas las subclasificaciones KOS que le fueron asignadas. El corpus de busqueda objetivo son 2.522 descripciones de subclasificacion KOS. El entrenamiento se ejecuto durante 3 epocas con una longitud de corte de 32.768 tokens, alcanzando una perdida final de 0,2761.

El formato de entrada es especifico: el anchor de patente se construye concatenando el resumen (초록), la composicion tecnica (기술구성) y la tecnologia de fondo (배경기술). La query debe incluir el prefijo instructivo `Instruct: Given a patent abstract, retrieve the relevant technology classification description.\nQuery:`, mientras que los documentos de taxonomia se pasan sin prefijo alguno.

## Capacidades

- Generacion de embeddings de similitud semantica para textos de patentes coreanas.
- Recuperacion de subclasificaciones KOS relevantes dado un texto de patente (tarea de retrieval).
- Soporte de contexto largo de hasta 32.768 tokens, adecuado para documentos de patente extensos.
- Integracion con `sentence-transformers` para codificacion de queries y documentos.
- Compatible con Text Embeddings Inference (TEI) para despliegue en endpoints de produccion.
- Funcionalidad de busqueda por similitud coseno entre embeddings normalizados.
- Especializado exclusivamente en coreano; no se documentan capacidades multilingues.

## Casos de uso

- Clasificacion automatica de patentes: una oficina de patentes o un departamento de I+D puede introducir el texto de una solicitud de patente y obtener las subclasificaciones KOS mas probables, reduciendo el trabajo manual de los examinadores.
- Analisis de libertad de operacion (freedom to operate): equipos legales pueden buscar patentes existentes por similitud semantica con una tecnologia nueva para identificar posibles conflictos de propiedad intelectual.
- Inteligencia competitiva: analistas pueden agrupar patentes de la competencia por subclasificacion KOS para detectar tendencias tecnologicas en sectores especificos.
- Gestion de carteras de patentes: empresas con grandes carteras pueden indexar sus patentes y recuperar rapidamente aquellas que pertenecen a una subclasificacion tecnologica determinada.
- Búsqueda previa al deposito (prior art search): inventores pueden comprobar si su idea ya esta cubierta por patentes existentes buscando por similitud semantica en el corpus de patentes.
- Enriquecimiento de bases de datos de patentes: integracion en pipelines de procesamiento de documentos para anotar automaticamente nuevas patentes con codigos KOS, facilitando la busqueda posterior por categoria.

## Benchmarks y rendimiento

La model card indica que se evaluo el modelo sobre el conjunto completo de taxonomia (2.522 subclasificaciones) utilizando como positivos todas las subclasificaciones mapeadas a cada patente, con metricas nDCG@10, MRR@10, Hit@1 y Recall@10. Sin embargo, no se publican los valores numericos de estas metricas en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16, 0,6 GB en INT8 y 0,3 GB en cuantizacion de 4 bits, basandose en los 596 millones de parametros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1660, RTX 3060 o superiores). Tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- El modelo cabe sin problema en GPUs consumer de gama media y baja.
- Opciones de despliegue: `sentence-transformers` para inferencia local, Text Embeddings Inference (TEI) para endpoints de produccion, y compatible con la infraestructura de Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque al tratarse de un modelo de 0,6B la latencia por lote pequeno en GPU consumer suele ser de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| elplaguister/patent_classifier_qwen | 596M | 32.768 | Patentes coreanas + KOS | Apache 2.0 |
| Qwen/Qwen3-Embedding-0.6B (base) | 596M | 32.768 | Embeddings genericos multilingues | Apache 2.0 |
| AI Patent Classifier (Qwen3-0.6B) | 0,6B | no disponible | Clasificacion de patentes de IA | no disponible |

El modelo se diferencia del base Qwen3-Embedding-0.6B en su especializacion para el dominio de patentes coreanas y la taxonomia KOS, lo que deberia ofrecer mejor precision en esa tarea concreta a costa de perder generalidad. El espacio de Hugging Face `xulab-research/AI_Patent_Classifier_based_on_Qwen3-0.6B` aborda un problema similar (clasificacion de patentes de IA) pero con un enfoque de clasificacion directa en lugar de retrieval por embeddings.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en coreano; no se garantiza ningun comportamiento en otros idiomas.
- El conjunto de entrenamiento es reducido (2.002 patentes), lo que puede limitar la generalizacion a dominios tecnicos poco representados en la muestra.
- No se publican valores de benchmarks, por lo que no es posible verificar objetivamente su rendimiento frente a alternativas.
- La model card no documenta sesgos especificos, pero al entrenarse sobre un corpus limitado de patentes coreanas, puede reflejar sesgos de la muestra (por ejemplo, sobrerrepresentacion de ciertos sectores tecnologicos).
- Riesgo de alucinacion en la recuperacion: como cualquier modelo de retrieval, puede devolver subclasificaciones semanticamente cercanas pero incorrectas para patentes muy novedosas o ambiguas.
- El ejemplo de codigo de la model card referencia un ID de modelo distinto (`elplaguister/patent_classifier_en_qwen3_embedding_0_6b`), lo que sugiere que puede existir una version en ingles, pero no se confirma su disponibilidad.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elplaguister/patent_classifier_qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Espacio de clasificador de patentes de IA (Qwen3-0.6B): https://huggingface.co/spaces/xulab-research/AI_Patent_Classifier_based_on_Qwen3-0.6B
- Espacio de clasificador de patentes de IA (Qwen3-4B): https://huggingface.co/spaces/xulab-research/AI_Patent_Classifier_based_on_Qwen3-4B
- Repositorio de clasificacion de patentes con Qwen: https://github.com/fuzhenkang/AI_Patent_Classfication
