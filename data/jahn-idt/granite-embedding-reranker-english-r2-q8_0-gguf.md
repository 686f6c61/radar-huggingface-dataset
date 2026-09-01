# jahn-idt/granite-embedding-reranker-english-r2-Q8_0-GGUF

## Resumen

El modelo `jahn-idt/granite-embedding-reranker-english-r2-Q8_0-GGUF` es una conversión a formato GGUF del reranker Granite Embedding R2 de IBM, cuantizado con precisión Q8_0. El modelo original, desarrollado por IBM, es un cross-encoder diseñado para tareas de reranking en recuperación densa, es decir, para reordenar un conjunto de documentos candidatos según su relevancia respecto a una consulta. Esta conversión, realizada por el usuario jahn-idt mediante la herramienta GGUF-my-repo de llama.cpp, permite ejecutar el modelo de forma eficiente en CPU y GPU con llama.cpp, sin necesidad de depender de PyTorch o de la infraestructura de Hugging Face Transformers.

El modelo base, `ibm-granite/granite-embedding-reranker-english-r2`, forma parte de la familia Granite Embedding R2, presentada en el artículo de arXiv 2508.21085. Se trata de un cross-encoder construido sobre el modelo de embeddings `granite-embedding-english-r2`, con una longitud de contexto de 8192 tokens y entrenado con un objetivo de ranking list-wise sobre datos curados y negativos minados. Con aproximadamente 150 millones de parámetros, este reranker ofrece un equilibrio entre capacidad y eficiencia, y su disponibilidad en GGUF amplía su uso a entornos de producción con requisitos de despliegue ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (basado en granite-embedding-english-r2) |
| Parametros totales | 149.605.633 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (segun el paper del modelo original) |
| Tipos de cuantizacion | Q8_0 (unico archivo GGUF en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `granite-embedding-reranker-english-r2-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo original es un cross-encoder basado en la arquitectura transformer, construido sobre el modelo de embeddings `granite-embedding-english-r2`. A diferencia de los modelos bi-encoder, que generan embeddings independientes para consulta y documento, un cross-encoder procesa la concatenacion de consulta y documento como una unica secuencia, produciendo una puntuacion de relevancia directa. El entrenamiento utiliza un objetivo de ranking list-wise, donde el modelo aprende a ordenar un conjunto de documentos candidatos por relevancia, empleando datos curados de alta calidad y negativos minados cuidadosamente. La longitud de contexto es de 8192 tokens, lo que permite procesar documentos relativamente largos.

La conversion a GGUF se realizo con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, manteniendo los pesos del modelo original en cuantizacion Q8_0. Esta cuantizacion de 8 bits por peso ofrece una buena relacion entre fidelidad y eficiencia, con una perdida de precision minima respecto al modelo en punto flotante de 16 bits. El archivo resultante puede utilizarse directamente con las herramientas de llama.cpp (`llama-cli` y `llama-server`) o integrarse en aplicaciones que soporten el formato GGUF.

## Capacidades

- Reranking de pares consulta-documento: dado un conjunto de documentos candidatos, el modelo asigna una puntuacion de relevancia a cada par, permitiendo reordenar los resultados.
- Integracion en pipelines de recuperacion aumentada por generacion (RAG): puede utilizarse como segunda etapa de recuperacion para refinar los resultados obtenidos por un bi-encoder.
- Procesamiento de contexto largo: soporta hasta 8192 tokens, adecuado para documentos extensos.
- Compatibilidad con llama.cpp: se puede ejecutar en CPU y GPU mediante `llama-cli` o `llama-server`, asi como con otras herramientas que soporten GGUF.
- Compatibilidad con text-embeddings-inference: segun las etiquetas del repositorio, el modelo es compatible con esta libreria de inferencia de embeddings.
- Modelo discriminativo: no genera texto, solo produce puntuaciones de relevancia, lo que lo hace adecuado para tareas de clasificacion y ranking.

## Casos de uso

- Mejora de resultados en motores de busqueda interna: el modelo puede reordenar los resultados devueltos por un sistema de busqueda basado en embeddings, priorizando los documentos mas relevantes para la consulta del usuario. Su contexto de 8192 tokens permite procesar documentos largos como articulos o informes.
- Reranking en pipelines de RAG: en un sistema de generacion aumentada por recuperacion, el reranker se situa tras la recuperacion inicial (tipicamente con un bi-encoder) y antes de la generacion, filtrando los pasajes mas relevantes para reducir ruido y mejorar la calidad de las respuestas generadas.
- Filtrado de candidatos en sistemas de recomendacion: dado un conjunto de items candidatos generados por un sistema de recomendacion, el modelo puede puntuar la relevancia de cada item respecto a la consulta o preferencia del usuario, mejorando la precision de las recomendaciones.
- Clasificacion de relevancia en dominios especificos: el modelo puede adaptarse mediante fine-tuning a dominios como legal, medico o tecnico, para tareas de clasificacion de documentos por relevancia.
- Despliegue en entornos con recursos limitados: al estar en formato GGUF con cuantizacion Q8_0, el modelo puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para servidores de baja potencia o entornos edge.
- Integracion en aplicaciones de escritorio o moviles: gracias a su tamano reducido (aproximadamente 150 MB), el modelo puede integrarse en aplicaciones locales que requieran reranking sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion GGUF en la informacion disponible. El paper del modelo original (arXiv:2508.21085) reporta resultados en benchmarks de recuperacion como MTEB, pero no se incluyen los valores numericos en los materiales proporcionados. Para obtener datos de rendimiento, se recomienda consultar el articulo original o la documentacion de IBM.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 149 millones de parametros en cuantizacion Q8_0, el archivo GGUF ocupa aproximadamente 150 MB. La VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tambien puede ejecutarse en CPU sin problemas, gracias al formato GGUF y a la optimizacion de llama.cpp.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python, text-embeddings-inference (segun las etiquetas), y cualquier framework que soporte GGUF.
- Latencia y throughput: no se dispone de datos medidos para esta conversion. En CPU, la inferencia de un cross-encoder de 150M parametros suele tardar entre 10 y 50 milisegundos por par consulta-documento, dependiendo de la longitud de la secuencia y del hardware. En GPU, la latencia es significativamente menor.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros rerankers. Sin embargo, se pueden mencionar alternativas en la misma categoria:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| granite-embedding-reranker-english-r2 (original) | 149.6M | 8192 | Apache-2.0 | safetensors |
| jahn-idt/granite-embedding-reranker-english-r2-Q8_0-GGUF | 149.6M | 8192 | Apache-2.0 | GGUF |
| BGE-reranker-v2-m3 (referencia) | 568M | 8192 | MIT | safetensors, ONNX |

La principal diferencia entre el modelo original y esta conversion es el formato y la cuantizacion: el GGUF Q8_0 ocupa menos espacio y es ejecutable con llama.cpp, mientras que el original requiere PyTorch o text-embeddings-inference. Frente a BGE-reranker-v2-m3, el modelo de IBM tiene menos parametros, lo que puede implicar menor capacidad pero tambien menor latencia y requisitos de hardware.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado exclusivamente en ingles. No es adecuado para consultas o documentos en otros idiomas sin fine-tuning previo.
- Modelo discriminativo: no genera texto, solo puntua relevancia. No debe utilizarse para tareas generativas.
- Sesgos: al estar entrenado con datos web y corpora curados, puede heredar sesgos presentes en dichos datos, lo que podria afectar a la equidad en aplicaciones de busqueda o recomendacion.
- Alucinacion: no aplica, ya que el modelo no produce contenido nuevo.
- Perdida de precision por cuantizacion: la cuantizacion Q8_0 introduce una perdida minima de precision respecto al modelo en f16, aunque en la mayoria de los casos es despreciable para tareas de ranking.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de licencia.
- Despliegue en produccion: se recomienda validar el rendimiento del modelo en el dominio especifico de la aplicacion, ya que los resultados pueden variar respecto a los benchmarks publicados.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/jahn-idt/granite-embedding-reranker-english-r2-Q8_0-GGUF
- Modelo original en HuggingFace: https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2
- Paper de Granite Embedding R2 (arXiv): https://arxiv.org/abs/2508.21085
- Documentacion de IBM sobre Granite Embedding: https://www.ibm.com/granite/docs/models/embedding
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
