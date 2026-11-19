# iamtatsuki05/Sentence-ModernBERT-EN-1B-PT

## Resumen

Sentence-ModernBERT-EN-1B-PT es un modelo de embeddings de frases en ingles desarrollado por iamtatsuki05, publicado bajo la licencia MIT. Se construye sobre el modelo base iamtatsuki05/ModernBERT-EN-1B-PT-stage2 y se entrena con aprendizaje contrastivo debilmente supervisado sobre los subconjuntos debilmente supervisados del dataset sentence-transformers/embedding-training-data. El resultado es un encoder que produce embeddings de 1.792 dimensiones mediante mean pooling, pensado para tareas de similitud semantica y recuperacion de informacion.

El modelo emplea la arquitectura ModernBERT, una evolucion del transformer encoder clasico que incorpora codificacion posicional RoPE y soporte para secuencias largas de hasta 8.192 tokens. Con 1.301 millones de parametros totales (1.120 millones sin contar los embeddings), se posiciona como un encoder de gran tamano especificamente orientado a generar representaciones densas de frases y documentos, no a generacion de texto.

Su relevancia radica en la combinacion de una ventana de contexto muy amplia para un encoder (8.192 tokens) con un vocabulario SentencePiece de 102.400 tokens y una dimension de embedding alta (1.792). Esto lo hace adecuado para recuperacion sobre documentos largos y para pipelines de RAG donde la longitud del fragmento importa. Forma parte de la serie MIREI del mismo autor, que compara recetas de entrenamiento equivalentes sobre arquitecturas encoder y decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional con RoPE) |
| Parametros totales | 1.301.108.480 (1.304M; 1.120M sin embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 5,2 GB) |
| Dimension de embedding | 1.792 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 tokens |
| Metrica de similitud | coseno |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un transformer encoder bidireccional que moderniza el diseno de BERT con codificacion posicional rotatoria (RoPE), lo que permite manejar secuencias de hasta 8.192 tokens de forma eficiente. El modelo base es iamtatsuki05/ModernBERT-EN-1B-PT-stage2, un checkpoint previo del mismo autor entrenado presumiblemente con objetivos de masked language modeling (la model card incluye la etiqueta `masked-lm`). Sobre ese checkpoint se aplica un ajuste fino contrastivo debilmente supervisado.

El entrenamiento de embeddings utiliza los subconjuntos debilmente supervisados de sentence-transformers/embedding-training-data. La serie MIREI del autor declara haber empleado 25 subconjuntos de ese dataset, con aproximadamente 43 millones de pares en total, aplicando la misma receta a tres arquitecturas distintas (ModernBERT y dos variantes Llama bidireccionales). No se documentan en la informacion disponible detalles sobre el numero exacto de pasos, la composicion pormenorizada del dataset ni el uso de RLHF o DPO, que no aplican a un modelo de embeddings de este tipo. La innovacion principal es la combinacion de una ventana de 8.192 tokens con RoPE en un encoder de 1B de parametros, orientada a embeddings de alta dimensionalidad para retrieval.

## Capacidades

- Generacion de embeddings de frases y documentos en ingles con salida de 1.792 dimensiones y normalizacion opcional.
- Similitud semantica entre pares de textos mediante distancia coseno (`model.similarity`).
- Recuperacion de informacion (retrieval) densa sobre fragmentos de hasta 8.192 tokens.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de clasificacion, clustering y deduplicacion semantica.
- Soporte de integracion con sentence-transformers 4.1.0 o superior, transformers 4.51.0 o superior, accelerate 1.6.0 o superior y flash-attn 2.7.3 o superior.
- Compatible con text-embeddings-inference y endpoints compatibles segun las etiquetas del repositorio.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo indexa fragmentos de documentacion de hasta 8.192 tokens, lo que reduce la necesidad de trocear agresivamente y preserva contexto en cada embedding; se usa como retriever en la fase de recuperacion previa al LLM generador.
- Busqueda semantica en bases documentales largas: con contexto de 8.192 tokens, permite indexar articulos completos o secciones extensas sin perder coherencia semantica, adecuado para buscadores internos de documentacion tecnica en ingles.
- Deduplicacion y clustering de textos: los embeddings de 1.792 dimensiones permiten agrupar documentos similares por coseno, util para limpiar corpus de entrenamiento o detectar contenido duplicado en repositorios.
- Clasificacion de texto por similitud a prototipos: se pueden calcular embeddings de descripciones de categoria y asignar etiquetas al documento mas cercano, sin necesidad de reentrenar un clasificador, en tareas de moderacion o enrutado de tickets.
- Sistemas de recomendacion de contenido textual: comparar embeddings de articulos, noticias o publicaciones para sugerir items relacionados semanticamente, aprovechando la ventana larga para representar el texto completo.
- Evaluacion de calidad de respuestas: medir la similitud coseno entre una respuesta generada y una referencia para construir metricas automaticas de fidelidad en pipelines de evaluacion de LLMs.
- Motor de preguntas y respuestas extractivas: emparejar preguntas con pasajes candidatos en ingles y seleccionar los mas relevantes antes de una etapa generativa o extractiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MTEB, BEIR ni metricas de retrieval, y la busqueda web no aporto datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 1.301 millones de parametros ocupan aproximadamente 2,6 GB de pesos; con activaciones y overhead de sentence-transformers conviene reservar entre 4 y 6 GB. En float32 serian unos 5,2 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para throughput alto en indexacion por lotes; RTX 4090 o RTX 3090 para inferencia y prototipado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16 o float16 (por ejemplo RTX 3070/4060 Ti en adelante); con 6 GB puede requerir lotes pequenos.
- Opciones de despliegue: sentence-transformers (referencia del autor), text-embeddings-inference (etiqueta `text-embeddings-inference` en el repo), transformers con `attn_implementation="flash_attention_2"` para aprovechar FlashAttention 2.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso de FlashAttention 2 y bfloat16 es el recomendado por el autor para el maximo rendimiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia |
|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-1B-PT (este) | ModernBERT | 1.304M | 8.192 | 1.792 | MIT |
| iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT | Llama bidireccional | 1.224M | no disponible | no disponible | no disponible |
| iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT | Llama bidireccional | 1.224M | no disponible | no disponible | no disponible |

Los dos modelos de la misma serie MIREI comparten la receta de entrenamiento sobre los 25 subconjuntos de embedding-training-data (unos 43 millones de pares) y difieren en la arquitectura. No se dispone de datos de rendimiento comparativo entre ellos ni frente a encoders de referencia como los de la familia BGE o E5, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Solo soporta ingles; su uso con textos en castellano u otros idiomas producira embeddings de baja calidad.
- Es un encoder de embeddings, no un modelo generativo: no puede responder preguntas ni mantener conversaciones por si mismo.
- Riesgo de sesgos heredados del dataset de entrenamiento debilmente supervisado (sentence-transformers/embedding-training-data) y del corpus de preentrenamiento del modelo base; no se documentan analisis de sesgo.
- La supervision debil puede introducir ruido en los pares de entrenamiento y afectar a la precision en dominios muy especializados.
- No se publican resultados de benchmarks, por lo que el rendimiento real en retrieval debe validarse en el dominio de aplicacion antes de produccion.
- El modelo tiene solo 3 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada y escasa validacion por parte de la comunidad.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base y del dataset de entrenamiento.
- Requiere versiones relativamente recientes de las librerias (sentence-transformers 4.1.0, transformers 4.51.0, flash-attn 2.7.3), lo que puede complicar el despliegue en entornos con dependencias fijas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/ModernBERT-EN-1B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano Llama-Bi: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT
- Modelo hermano Sarashina-Bi: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT
- Licencia MIT: https://opensource.org/license/mit/
