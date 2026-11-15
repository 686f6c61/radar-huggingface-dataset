# DylanJHJ/ettin-reranker-68m-v1.lna-trecragtime25-collections

## Resumen

El modelo `ettin-reranker-68m-v1.lna-trecragtime25-collections` es un conjunto de clasificadores de nuggets desarrollado por DylanJHJ para la evaluación de sistemas RAG (Retrieval-Augmented Generation) en el marco del track TREC RAGTIME 2025 (`ragtime-na`). No es un modelo generativo, sino un reranker especializado que, dado un nugget (una pregunta atómica de evaluación) y una respuesta generada por un sistema RAG, devuelve la probabilidad de que dicha respuesta esté alineada con el nugget. Se construye sobre el cross-encoder `cross-encoder/ettin-reranker-68m-v1`, un modelo de 68 millones de parámetros de la familia Ettin.

El repositorio contiene una jerarquía de modelos: un modelo a nivel de dataset (D), 33 modelos a nivel de tópico (DT) y 529 cabezas específicas por nugget (DTN). Cada uno se ha obtenido mediante fine-tuning completo sobre el modelo base, con cabezas de clasificación específicas que se cargan por separado. Su relevancia radica en que proporciona un mecanismo reproducible y ligero para la evaluación automática de respuestas RAG a nivel de nugget, una tarea que hasta ahora dependía en gran medida de evaluadores LLM de gran tamaño.

El modelo está pensado exclusivamente para inglés, se distribuye bajo licencia Apache 2.0 y su uso requiere cargar el backbone desde un subdirectorio de tópico y la cabeza correspondiente desde el repositorio. El tamaño total del repo (9,6 GB) refleja la acumulación de los 33 backbones de tópico más las cabezas de nugget, no el tamaño de un único modelo en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (base: ettin-reranker-68m-v1) con cabeza de clasificación CLS pooling + Dense + GELU + LayerNorm + Dense |
| Parametros totales | 68M (backbone); cabezas adicionales de tamaño no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada (solo se trunca la respuesta) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y .pt) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone) y .pt (cabezas de reranking) |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder basado en el modelo Ettin de 68M de parámetros. La entrada se construye como `[CLS] {nugget} [SEP] {answer} [SEP]`, donde el lado del nugget puede enriquecerse con respuestas de referencia en el formato `{nugget} (Reference answers: {a1}; {a2})` para la variante RAGtime. La puntuación se obtiene aplicando una cabeza sobre el token `[CLS]`: una capa Dense sin sesgo, activación GELU, LayerNorm y una capa Dense final que produce un logit, transformado con sigmoid para obtener la probabilidad de alineación.

El entrenamiento parte del modelo base `cross-encoder/ettin-reranker-68m-v1` y se organiza en tres niveles: un fine-tuning completo sobre todo el dataset (modelo D), un fine-tuning adicional por tópico (33 tópicos, modelos DT) y una cabeza específica por nugget (529 nuggets, modelos DTN). Cada ejemplo de entrenamiento es un par (nugget, oración de respuesta) con etiqueta binaria de alineación; los negativos se submuestrean para equilibrar las clases. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificación binaria de alineación entre un nugget y una oración de respuesta RAG, con salida de probabilidad vía sigmoid.
- Evaluación a nivel de tópico (DT): un modelo por tópico capaz de puntuar cualquier nugget de ese tópico.
- Evaluación a nivel de nugget (DTN): una cabeza específica por nugget para máxima precisión en la evaluación.
- Soporte de respuestas de referencia en la entrada (variante RAGtime) para enriquecer el contexto del nugget.
- Procesamiento de pares (nugget, respuesta) con truncación controlada solo sobre la respuesta.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo thinking; es exclusivamente un clasificador de evaluación.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Evaluación automática de sistemas RAG en TREC RAGTIME 2025: el modelo permite puntuar si cada oración de un informe generado está soportada por un nugget concreto, sustituyendo evaluadores LLM costosos por un cross-encoder de 68M.
- Métricas de cobertura de nuggets en pipelines de investigación: integrado en un script de evaluación, permite calcular qué porcentaje de los nuggets de un tópico han sido cubiertos por las respuestas de un sistema, con la cabeza DTN para máxima fidelidad.
- A/B testing de sistemas de recuperación: al puntuar oraciones individuales, se puede comparar qué configuración de retrieval genera respuestas más alineadas con los nuggets de referencia.
- Filtrado de oraciones irrelevantes en informes generados: las oraciones con baja probabilidad de alineación pueden descartarse antes de la evaluación final o de la presentación al usuario.
- Evaluación de alucinaciones a nivel de afirmación: una oración con alta probabilidad de no estar soportada por ningún nugget puede marcarse para revisión manual en un pipeline de control de calidad.
- Benchmarking reproducible en entornos con recursos limitados: al requerir solo torch, transformers y huggingface_hub, puede ejecutarse en CPU o en una GPU consumer para evaluar colecciones completas de tópicos.
- Investigación en evaluación de RAG: sirve como baseline ligero para comparar con evaluadores LLM en estudios sobre fiabilidad de métricas automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el backbone de 68M en fp32 (aproximadamente 272 MB de pesos) más la cabeza; en la práctica, el modelo completo en fp32 ocupa menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU para evaluaciones por lotes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU.
- Opciones de despliegue: carga directa con `transformers` y `torch` mediante `AutoModel.from_pretrained` con `subfolder`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a un cross-encoder de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 68M con contexto de 1024 tokens, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettin-reranker-68m-v1.lna-trecragtime25-collections | 68M (backbone) | 1024 tokens | Clasificación de nuggets RAG | Apache 2.0 | Hugging Face |
| cross-encoder/ettin-reranker-68m-v1 | 68M | No disponible | Reranking de pares query-documento | No disponible | Hugging Face |
| Evaluadores LLM genéricos (p. ej. GPT-4, Claude) | Cientos de miles de millones | Variable | Evaluación de RAG vía prompting | Propietaria | APIs comerciales |

La comparativa con evaluadores LLM es relevante porque el modelo se posiciona como alternativa ligera y reproducible a la evaluación mediante prompting de LLM, con la ventaja de un coste computacional muy inferior y la desventaja de estar especializado únicamente en el dataset TREC RAGTIME 2025.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el dataset TREC RAGTIME 2025 y los 33 tópicos y 529 nuggets incluidos; su generalización a otros dominios o colecciones no está garantizada.
- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Es un clasificador, no un generador: no puede producir respuestas ni razonar de forma autónoma.
- La evaluación se realiza a nivel de oración individual; respuestas que requieran agregación multi-oración pueden no puntuarse correctamente.
- El truncado a 1024 tokens afecta solo a la respuesta, pero respuestas muy largas pueden perder información relevante.
- Riesgo de sesgo heredado del dataset de entrenamiento y del modelo base Ettin; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la clasificación de alineación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del backbone Ettin cuya licencia debe verificarse por separado.
- El repositorio ocupa 9,6 GB por la acumulación de 33 backbones de tópico; el despliegue en producción debe seleccionar únicamente el subdirectorio del tópico necesario.
- No se documentan métricas de calibración de las probabilidades de salida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DylanJHJ/ettin-reranker-68m-v1.lna-trecragtime25-collections)
- [Modelo base D](https://huggingface.co/DylanJHJ/ettin-reranker-68m-v1.lna-trecragtime25-D)
- [Colección del autor](https://huggingface.co/collections/DylanJHJ/tbd-6af4812bda045ed7cfc6cee8)
- [Modelo base cross-encoder/ettin-reranker-68m-v1](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)
