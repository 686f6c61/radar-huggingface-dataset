# DylanJHJ/monot5-base.lna-trecragtime25-collections

## Resumen

monot5-base.lna-trecragtime25-collections es una coleccion de clasificadores de nuggets construida sobre el modelo base castorini/monot5-base-msmarco-10k, un T5-base afinado para reranking. La desarrolla el usuario DylanJHJ y esta disenada especificamente para la evaluacion de respuestas generadas por sistemas RAG en el marco del benchmark TREC RAGTIME 2025 (pista ragtime-na). El modelo resuelve un problema concreto: determinar, dado un nugget (una pregunta atomica de informacion) y una frase de una respuesta generada, la probabilidad de que esa frase soporte dicho nugget.

La coleccion se organiza en dos niveles jerarquicos. El nivel DT (topic-level) parte de un fine-tune completo sobre todo el dataset y se afina adicionalmente por topico (33 topicos). El nivel DTN (nugget-level) anade un adaptador LoRA especifico por nugget (529 nuggets) sobre el modelo DT de su topico. El resultado es un juez de nuggets altamente especializado, no un modelo generativo de proposito general.

Es relevante en el contexto de la evaluacion automatica de sistemas RAG, donde la fidelidad y la cobertura de nuggets son metricas centrales. Al estar construido sobre T5-base y usar LoRA por nugget, mantiene un coste computacional moderado por instancia, aunque el repositorio completo ocupa 43,2 GB por la acumulacion de pesos de topicos y adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-base) con adaptadores LoRA por nugget |
| Parametros totales | no disponible (T5-base, aproximadamente 220M en el backbone; los adaptadores LoRA anaden parametros adicionales no cuantificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors por topico, adapter_model.safetensors por nugget) |

## Arquitectura y entrenamiento

El modelo se basa en T5-base en su variante MonoT5, un encoder-decoder empleado como clasificador de relevancia. La entrada se construye como `Query: {nugget} Document: {answer} Relevant:</s>`, truncando el cuerpo a 512 tokens pero conservando siempre la cola ` Relevant:</s>`. La puntuacion se obtiene aplicando softmax sobre los logits de los tokens `▁false` y `▁true` en el primer paso del decodificador, de modo que la salida es P(true), la probabilidad de que la respuesta soporte el nugget.

El entrenamiento es jerarquico. El modelo D es un fine-tune completo sobre el dataset completo. El modelo DT parte de D y se afina completamente sobre un topico concreto (33 topicos). El modelo DTN parte del DT de su topico y anade un adaptador LoRA especifico por nugget (529 nuggets). En el lado del nugget, para la variante `ragtime` se anade la lista de respuestas de referencia en el formato `{nugget} (Reference answers) {a1}; {a2}`; para la variante `rag` se usa solo `{nugget}`. Los negativos se submuestrean para equilibrar las etiquetas. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni detalles sobre RLHF/DPO.

## Capacidades

- Clasificacion de soporte de nuggets: dada una frase de respuesta y un nugget, devuelve P(soporte) con umbral recomendado de 0,5 para etiqueta binaria.
- Evaluacion a nivel de topico (DT): un unico modelo por topico sirve para juzgar cualquier nugget de ese topico.
- Evaluacion a nivel de nugget (DTN): adaptador LoRA especifico por nugget para maxima precision.
- Incorporacion de respuestas de referencia en la variante `ragtime` para enriquecer la consulta.
- Procesamiento por pares (nugget, frase), no generacion de texto libre.
- Soporte de tool calling / function calling: no disponible (no es un modelo conversacional).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, audio ni thinking mode).

## Casos de uso

- Evaluacion automatica de sistemas RAG: el modelo puntua cada frase de una respuesta generada contra los nuggets del topico, permitiendo calcular metricas de cobertura y fidelidad sin intervencion humana.
- Benchmarking de pipelines de recuperacion y generacion: integrado en un harness de evaluacion, permite comparar variantes de retriever y generador midiendo cuantos nuggets cubre cada respuesta.
- Auditoria de fidelidad en produccion: dado un informe generado, se descompone en frases y se evalua cada una contra los nuggets esperados para detectar afirmaciones no soportadas.
- Construccion de datasets de evaluacion: el modelo puede etiquetar pares (nugget, frase) a gran escala para crear conjuntos de entrenamiento o validacion de jueces mas ligeros.
- Investigacion en metricas de RAG: util para estudiar la correlacion entre juicios automaticos y anotaciones humanas en tareas de nugget evaluation.
- Filtrado de respuestas candidatas: en un sistema de multiple generacion, seleccionar la respuesta que maximiza la cobertura de nuggets segun el juez DTN.
- Analisis de errores por topico: al disponer de modelos DT por topico, permite diagnosticar en que areas tematicas falla mas un sistema RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Evaluation" que aparece truncada ("Test") sin datos numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone T5-base en fp32 ocupa aproximadamente 0,9 GB; en fp16 unos 0,45 GB. Los adaptadores LoRA por nugget son ligeros (del orden de decenas de MB cada uno, no cuantificado en la informacion).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para el backbone; A100, H100 o RTX 4090 no son necesarias pero aceleran el procesamiento por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers con peft (unico camino documentado en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador con subcarpetas por topico/nugget no es directamente compatible con servidores de inferencia generica.
- Latencia y throughput estimados: no disponibles. El coste por par (nugget, frase) es el de un forward de T5-base con decodificacion de un solo paso, por lo que el throughput depende del batching y del numero de adaptadores LoRA que deban cargarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monot5-base.lna-trecragtime25-collections | T5-base (~220M) + LoRA | 512 | Clasificacion de nuggets RAG | apache-2.0 | Hugging Face |
| castorini/monot5-base-msmarco-10k | T5-base (~220M) | 512 | Reranking de pasajes | apache-2.0 | Hugging Face |
| DylanJHJ/monot5-base.lna-trecragtime25-D | T5-base (~220M) | 512 | Clasificacion de nuggets (nivel dataset) | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion de nuggets para TREC RAGTIME 2025; no es un modelo generativo ni conversacional.
- Solo soporta ingles.
- Ventana de contexto de 512 tokens; el cuerpo de la consulta se trunca aunque se conserva la cola ` Relevant:</s>`.
- Requiere cargar el tokenizador desde la raiz del repositorio y los pesos desde subcarpetas (`topics/<qid>` y `nuggets/<qid>/<nugget_hash>`), lo que complica el despliegue estandar.
- El repositorio ocupa 43,2 GB por acumular 33 topicos y 529 adaptadores; el uso en produccion exige descargar solo las subcarpetas necesarias.
- Riesgo de sobreajuste a los topicos y nuggets del benchmark: no hay evidencia de generalizacion a otros dominios o conjuntos de nuggets.
- Posible sesgo derivado del submuestreo de negativos para equilibrar etiquetas, que puede alterar la calibracion de las probabilidades.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero si de falsos positivos/negativos en la clasificacion.
- Licencia apache-2.0 permite uso comercial, pero el modelo base castorini/monot5-base-msmarco-10k debe verificarse por separado.
- Sin datos de benchmarks publicados, no es posible validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/DylanJHJ/monot5-base.lna-trecragtime25-collections
- Modelo base: https://huggingface.co/castorini/monot5-base-msmarco-10k
- Modelo D (dataset-level): https://huggingface.co/DylanJHJ/monot5-base.lna-trecragtime25-D
- Coleccion: https://huggingface.co/collections/DylanJHJ/tbd-6af4812bda045ed7cfc6cee8
