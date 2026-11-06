# jglowa/polish-reranker-roberta-v3-bnb-8bit

## Resumen

`jglowa/polish-reranker-roberta-v3-bnb-8bit` es una versión cuantizada a 8 bits mediante bitsandbytes del modelo `sdadas/polish-reranker-roberta-v3`, un cross-encoder de reordenación (reranker) especializado en texto en polaco. El modelo original, desarrollado por SDADAS (Aleksandra Smywińska-Pohl), parte de una arquitectura RoBERTa y se entrena para puntuar pares consulta-documento, lo que permite reordenar los resultados de un sistema de recuperación (RAG, búsqueda léxica o vectorial) según su relevancia real.

Este repositorio concreto no aporta un modelo nuevo: es un artefacto de cuantización publicado por el usuario `jglowa` que reduce el peso del checkpoint original de aproximadamente 0,6 GB a 8 bits por parámetro, con el objetivo de disminuir el consumo de VRAM durante la inferencia. Con 443.113.473 parámetros totales, el modelo cabe con holgura en GPUs de consumo, lo que lo hace atractivo para pipelines de RAG en producción con requisitos de latencia ajustados.

Su relevancia es doble: por un lado, cubre el nicho de reranking de alta calidad para polaco, un idioma con menos recursos que el inglés; por otro, demuestra el flujo habitual de cuantización con bitsandbytes sobre un cross-encoder. Conviene señalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, y que la licencia declarada (`gemma`) resulta incoherente con un modelo derivado de RoBERTa, lo que exige verificación antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, cross-encoder para reranking) |
| Parametros totales | 443.113.473 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (bitsandbytes); sin otras variantes publicadas en el repo |
| Idiomas soportados | polaco (pl) |
| Licencia | gemma (declarada; ver advertencias) |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |

## Arquitectura y entrenamiento

El modelo base `sdadas/polish-reranker-roberta-v3` es un cross-encoder basado en RoBERTa. A diferencia de un bi-encoder, que codifica consulta y documento por separado, un cross-encoder procesa ambos concatenados en una única pasada del transformer y produce una puntuación de relevancia. Esta formulación es computacionalmente más cara en inferencia pero sustancialmente más precisa, lo que la hace idónea para la segunda etapa de un pipeline de recuperación.

El repositorio que nos ocupa no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO). La model card se limita a indicar «Bitsandbytes 8-bit quantization». Por tanto, los detalles sobre datos de entrenamiento, objetivos de pérdida y posibles técnicas de destilación o fine-tuning no están disponibles en la información proporcionada. La innovación técnica del artefacto es exclusivamente la cuantización a 8 bits del checkpoint original mediante bitsandbytes, que reduce el espacio en disco y la memoria de inferencia a costa de una posible pérdida menor de precisión en las puntuaciones de ranking.

## Capacidades

- Puntuación de relevancia de pares consulta-documento para reordenar resultados de búsqueda.
- Reranking en pipelines RAG (retrieval-augmented generation) sobre corpus en polaco.
- Mejora de la precisión de sistemas de búsqueda léxica (BM25) o vectorial mediante una segunda etapa de reordenación.
- Procesamiento de texto en polaco exclusivamente; no se declara soporte multilingüe.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión, audio ni generación de texto libre.
- No se documenta capacidad de agentes ni de razonamiento matemático o de código.

## Casos de uso

- **RAG sobre documentación corporativa en polaco**: el modelo se coloca tras un retriever (por ejemplo, búsqueda vectorial con embeddings polacos) para reordenar los 50-100 candidatos recuperados y seleccionar los 5-10 más relevantes antes de pasarlos al generador. Su naturaleza de cross-encoder mejora la precisión frente a la similitud coseno sola.
- **Búsqueda empresarial en intranet**: integrado en un motor de búsqueda interno con documentos en polaco, el reranker puntúa cada par consulta-documento y reordena los resultados de BM25, reduciendo el ruido en las primeras posiciones.
- **Atención al cliente con base de conocimiento**: en un sistema de respuestas automáticas sobre FAQs en polaco, el reranker selecciona el artículo correcto antes de que un LLM genere la respuesta, lo que disminuye las alucinaciones por contexto irrelevante.
- **Moderación y deduplicación de contenido**: puntuando pares de textos se puede detectar duplicados o near-duplicates en un corpus polaco, reordenando candidatos por similitud semántica.
- **Evaluación de sistemas de recuperación**: el modelo sirve como juez automático de relevancia para medir la calidad de un retriever en experimentos de investigación, generando etiquetas de relevancia a escala.
- **Despliegue en GPUs de consumo para prototipos**: gracias a la cuantización a 8 bits y a sus 443 millones de parámetros, el modelo se puede ejecutar en una RTX 3060 o superior para pruebas de concepto sin necesidad de infraestructura de datacenter.
- **Filtrado previo en pipelines de anotación**: en la construcción de datasets, el reranker prioriza los documentos candidatos que un anotador humano debe revisar, reduciendo el coste de etiquetado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en 8 bits, el checkpoint ocupa aproximadamente 0,45 GB (443 M de parámetros × 1 byte). Sumando activaciones y overhead de bitsandbytes, se estima un consumo de 1-2 GB de VRAM para lotes pequeños; no se dispone de mediciones oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM. Para producción con alto throughput, una NVIDIA A10G, L4 o A100; para desarrollo, una RTX 3060, RTX 4060 o superior.
- **¿Cabe en GPU de consumo?**: sí, con holgura, en cualquier GPU consumer con 4 GB o más de VRAM.
- **Opciones de despliegue**: al ser un modelo cuantizado con bitsandbytes, requiere cargarse con la librería `bitsandbytes` y `transformers`; no es compatible directamente con llama.cpp, Ollama o TGI en formato GGUF. Para servir en producción se puede usar un servidor FastAPI propio, Text Embeddings Inference (con soporte limitado para cross-encoders) o vLLM (verificar compatibilidad con bitsandbytes 8-bit).
- **Latencia y throughput estimados**: no disponibles. La latencia de un cross-encoder escala linealmente con el número de pares consulta-documento a puntuar, por lo que en un pipeline RAG típico de 50 candidatos se realizan 50 pasadas del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| jglowa/polish-reranker-roberta-v3-bnb-8bit | 443 M | no disponible | pl | gemma (declarada) | safetensors 8-bit |
| sdadas/polish-reranker-roberta-v3 | 443 M | no disponible | pl | no disponible en la información | safetensors |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | multilingüe | no disponible en la información | safetensors |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22 M | 512 tokens | en | Apache 2.0 | safetensors |

La comparación con alternativas multilingües como `bge-reranker-v2-m3` es pertinente si el pipeline necesita cubrir varios idiomas, pero para polaco puro el modelo de SDADAS está específicamente ajustado. El `ms-marco-MiniLM-L-6-v2` es mucho más pequeño y rápido, pero solo está entrenado en inglés y su precisión en polaco sería inferior. No se dispone de datos de benchmarks que permitan comparar la calidad de ranking entre estos modelos.

## Limitaciones y advertencias

- **Licencia incoherente**: la licencia declarada es `gemma`, pero el modelo base es un RoBERTa de SDADAS. Esta discrepancia debe resolverse consultando al autor o al repositorio original antes de cualquier uso comercial; la licencia Gemma impone restricciones de uso que probablemente no se aplicaban al modelo base.
- **Idioma único**: solo soporta polaco. Su uso con textos en otros idiomas producirá puntuaciones de relevancia poco fiables.
- **Cuantización con pérdida**: la cuantización a 8 bits puede degradar ligeramente la precisión de las puntuaciones de ranking en comparación con el checkpoint en fp32. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- **Riesgo de sesgo**: al ser un modelo entrenado sobre corpus polacos, puede heredar sesgos presentes en los datos de entrenamiento del modelo base; no se documentan análisis de sesgo.
- **Alucinación**: al ser un cross-encoder, no genera texto, por lo que no alucina en el sentido tradicional; sin embargo, puede asignar puntuaciones altas a documentos irrelevantes si el dominio de aplicación difiere del corpus de entrenamiento.
- **Longitud de contexto desconocida**: no se documenta el límite de tokens de entrada; los cross-encoders RoBERTa suelen limitarse a 512 tokens, pero este dato no está confirmado.
- **Repositorio sin validación comunitaria**: cero descargas y cero likes; no hay evidencia de que el artefacto haya sido probado por terceros.
- **Dependencia de bitsandbytes**: el despliegue requiere esta librería y no es compatible con runtimes que solo aceptan GGUF (llama.cpp, Ollama), lo que limita las opciones de serving.
- **Sin benchmarks**: no hay datos publicados de rendimiento que permitan estimar su calidad frente a alternativas.

## Enlaces

- [Hugging Face: jglowa/polish-reranker-roberta-v3-bnb-8bit](https://huggingface.co/jglowa/polish-reranker-roberta-v3-bnb-8bit)
- [Modelo base: sdadas/polish-reranker-roberta-v3](https://huggingface.co/sdadas/polish-reranker-roberta-v3)
- [Repositorio de bitsandbytes](https://github.com/TimDettmers/bitsandbytes)
- [Documentación de transformers sobre cuantización](https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes)
