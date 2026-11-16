# qb2k/adilet-reranker-mminilm-ru-kk

## Resumen

Adilet reranker mminilm ru kk es un cross-encoder de reordenación (reranking) desarrollado por el usuario qb2k para el proyecto Adilet Search, un buscador de legislación de Kazajistán. El modelo puntúa la relevancia entre una consulta en lenguaje natural y un artículo legislativo, y se emplea como segunda etapa de un pipeline de recuperación sobre candidatos previamente obtenidos mediante BM25. Parte del modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` y se ha afinado específicamente sobre pares pregunta-artículo del corpus legal kazajo.

La relevancia actual del modelo es acotada pero concreta: cubre una necesidad poco atendida, la búsqueda semántica sobre legislación en ruso y kazajo, un par de idiomas con escasa representación en modelos de reranking especializados. Con 117,6 millones de parámetros y un tamaño de repositorio de 0,5 GB, es un modelo ligero que puede desplegarse en infraestructura modesta y ejecutarse con Sentence Transformers o Text Embeddings Inference.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y se distribuye en formato safetensors. Su contexto de trabajo está limitado a 256 tokens en la configuración de uso, suficiente para el emparejamiento pregunta-artículo en el dominio legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer XLM-RoBERTa (mMiniLMv2-L12-H384) |
| Parametros totales | 117.641.089 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (configuración de uso; base de 512 tokens en el modelo original) |
| Tipos de cuantizacion | no disponible (formato safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | ruso (ru), kazajo (kk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un transformer de tipo XLM-RoBERTa con 12 capas y dimensión oculta de 384, destilado del modelo mMiniLMv2 multilingüe. La arquitectura cross-encoder procesa conjuntamente la consulta y el documento candidato, produciendo una puntuación de relevancia calibrada, a diferencia de los bi-encoders que generan embeddings independientes.

El ajuste fino se realizó sobre 4.264 pares (pregunta, artículo) generados con LLM en registro cotidiano y jurídico para artículos de 8 códigos de Kazajistán (corpus AdiletCodex v1.0, CC BY 4.0). Cada pregunta se emparejó con el artículo correcto y 7 candidatos negativos extraídos aleatoriamente del top 20 de BM25. La partición se hizo por artículo, garantizando que los artículos de test no se vieron durante el entrenamiento. Los hiperparámetros fueron: entropía cruzada binaria, optimizador AdamW, learning rate 1e-5, batch de 32, 2 épocas, longitud máxima de 320 tokens y semilla 42. El notebook de entrenamiento (`A4_embeddings_to_finetuning.ipynb`, configuración E3b) está disponible en el repositorio del proyecto.

## Capacidades

- Reordenación de candidatos en pipelines de recuperación de información (retrieval + rerank).
- Puntuación de relevancia entre consulta en lenguaje natural y artículo legislativo.
- Funcionamiento en ruso y kazajo, con rendimiento superior en ruso.
- Especialización en dominio legal: artículos de códigos de Kazajistán.
- Integración con Sentence Transformers mediante la clase `CrossEncoder`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints de Hugging Face.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo discriminativo de ranking.

## Casos de uso

- Búsqueda legal en el portal Adilet Search: el modelo actúa como segunda etapa del pipeline 1.0.0, reordenando los 20 candidatos recuperados por BM25 para devolver los artículos más relevantes a la consulta del ciudadano o profesional.
- Asistentes jurídicos para ciudadanía: dado que el modelo puntúa la correspondencia entre una pregunta en lenguaje cotidiano y un artículo, puede alimentar un chatbot que cite la norma aplicable a casos como impago de salarios o plazos de prestaciones.
- Sistemas de soporte a abogados en Kazajistán: recuperación rápida de artículos relevantes de los 8 códigos cubiertos, con nDCG@10 de 0,91 en ruso, lo que lo hace adecuado para búsquedas de precisión en producción.
- Filtrado de resultados en buscadores internos de despachos: integrado tras un recuperador denso o léxico, reduce falsos positivos en la lista final de artículos mostrados.
- Evaluación de cobertura normativa: al puntuar pares pregunta-artículo, permite auditar si un conjunto de preguntas frecuentes está bien cubierto por el corpus indexado.
- Prototipado rápido de sistemas RAG legales: con 117,6 M de parámetros y 0,5 GB, se puede desplegar en una sola GPU consumer para pruebas de concepto de asistentes documentales.
- Investigación en recuperación multilingüe de bajos recursos: sirve como referencia para experimentos de reranking en kazajo, un idioma con pocos recursos en este tipo de tareas.

## Benchmarks y rendimiento

Resultados sobre 195 preguntas de test (41% en kazajo), reordenando 20 candidatos de BM25. El techo teórico es 0,923.

| Modelo | nDCG@10 | MRR@10 | ROC-AUC | F1 |
|---|---|---|---|---|
| Modelo base, zero-shot | 0,867 | 0,849 | 0,959 | 0,598 |
| Este modelo | 0,880 | 0,866 | 0,973 | 0,652 |

La diferencia en nDCG@10 es de +0,013 (intervalo bootstrap del 95%: +0,003 a +0,025; p = 0,016). Desglose por idioma: nDCG@10 de 0,83 en kazajo y 0,91 en ruso.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más activaciones; en la práctica, menos de 2 GB con batch pequeño.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); para throughput alto, A10, L4, A100 o H100.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida para batch 1.
- Opciones de despliegue: Sentence Transformers (`CrossEncoder`), Text Embeddings Inference (TEI), endpoints de Hugging Face; no se documenta soporte nativo para vLLM, llama.cpp u Ollama (modelo de ranking, no generativo).
- Latencia y throughput estimados: no disponible en la información proporcionada; con 12 capas y 384 de dimensión oculta, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| qb2k/adilet-reranker-mminilm-ru-kk | 117,6 M | 256 tokens (uso) | ru, kk | Apache 2.0 | Legal Kazajistán |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | ~117 M | 512 tokens | multilingüe | Apache 2.0 | Propósito general |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | multilingüe | MIT | Propósito general |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22 M | 512 tokens | inglés | Apache 2.0 | Propósito general (inglés) |

Frente al modelo base, este reranker mejora nDCG@10 en +0,013 en el dominio legal kazajo, a costa de perder generalidad fuera de los 8 códigos cubiertos. Frente a `bge-reranker-base`, ofrece menor tamaño y especialización en ruso/kazajo legal, aunque no hay comparación directa publicada. No se dispone de datos de comparación con otros rerankers legales en ruso o kazajo.

## Limitaciones y advertencias

- El kazajo rinde peor que el ruso: nDCG@10 de 0,83 frente a 0,91, por lo que las consultas en kazajo requieren revisión humana adicional.
- Entrenado solo sobre 8 códigos de Kazajistán; otros actos legislativos quedan fuera de distribución y el rendimiento puede degradarse.
- Las preguntas de test fueron generadas por LLM y cada una tiene un único artículo etiquetado; solo 60 fueron revisadas por una persona (53 correctas), lo que introduce ruido en la evaluación.
- Riesgo de alucinación no aplica en sentido generativo (es un modelo de ranking), pero puede ordenar mal artículos ambiguos o con terminología fuera del dominio.
- Es una ayuda a la búsqueda, no asesoramiento jurídico; no debe usarse como fuente única de decisiones legales.
- Contexto limitado a 256 tokens en la configuración de uso: artículos largos pueden truncarse y perder información relevante.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ) ni métricas de latencia/throughput.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qb2k/adilet-reranker-mminilm-ru-kk
- Repositorio del proyecto Adilet Search: https://github.com/R0onen/adilet-search
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Corpus AdiletCodex v1.0 (CC BY 4.0): no disponible enlace directo en la información proporcionada
- Notebook de entrenamiento: `ml/notebooks/A4_embeddings_to_finetuning.ipynb` en el repositorio del proyecto (configuración E3b)
