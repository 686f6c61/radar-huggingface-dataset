# mhmsadegh/rectom-causal-reasoning-crossencoder-bce

## Resumen

El modelo `mhmsadegh/rectom-causal-reasoning-crossencoder-bce` es un cross-encoder de reranking desarrollado por mhmsadegh, fine-tuneado sobre el backbone `cross-encoder/ms-marco-MiniLM-L6-v2` (un MiniLM de 6 capas, 22,7 millones de parámetros). Su propósito es puntuar si dos ítems del benchmark RecToM (diálogos de recomendación con Theory of Mind) comparten la misma estructura de razonamiento causal subyacente, en lugar de limitarse a la similitud superficial del texto. Se entrena con un objetivo de entropía cruzada binaria sobre pares MATCH/MISMATCH, donde la etiqueta se determina comparando secuencias canonicalizadas de tipos de relación causal, validadas por intervención. El modelo está pensado como componente de recuperación en sistemas de recomendación conversacional que requieren inferir creencias, deseos e intenciones del usuario.

La relevancia actual radica en que aborda una limitación de los retrievers basados en similitud semántica: no capturan la estructura causal de los razonamientos. Al entrenar específicamente para distinguir pares que requieren el mismo patrón de razonamiento ToM, mejora la precisión de recuperación en tareas donde la lógica subyacente importa más que la coincidencia léxica. El modelo se publica con licencia Apache 2.0, pesa 0,1 GB y se distribuye en formato safetensors, listo para usar con la librería `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L6 (BERT de 6 capas) |
| Parametros totales | 22.713.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el backbone MiniLM-L6 suele soportar 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el backbone original es multilingüe, pero no se indica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par de secuencias (consulta y candidato) concatenadas y produce una puntuación de relevancia. El backbone es `cross-encoder/ms-marco-MiniLM-L6-v2`, un MiniLM de 6 capas con 22,7 millones de parámetros, originalmente entrenado para reranking en MS MARCO. El fine-tune se realizó con un objetivo de entropía cruzada binaria (BCE) sobre pares etiquetados como MATCH (1.0) o MISMATCH (0.0). La etiqueta se determina comparando secuencias canonicalizadas y ordenadas de tipos de relación causal, validadas por intervención, no por similitud textual. Se excluyeron pares parciales (donde una secuencia es prefijo de la otra). Se aplicó hard-negative mining: pares de la misma tarea con similitud coseno alta (≥0,75) pero etiqueta MISMATCH se mantienen siempre; los negativos fáciles se limitaron a 4 veces el número de positivos. El entrenamiento usó 266 ítems (2295 pares, 459 MATCH), 8 épocas, batch 16 y learning rate 2e-05. No se utilizaron rutas causales, respuestas doradas ni etiquetas de resultado como entrada; la supervisión proviene únicamente de la etiqueta de par.

La validación se realizó con validación cruzada de 5 pliegues con grupos disjuntos (manteniendo intactos los grupos de diálogo para evitar fuga). Los resultados mostraron que el fine-tune supera al backbone congelado en 5 de 5 pliegues, aunque la significancia estadística no es total (McNemar p=0,22; intervalo de confianza bootstrap del 95% para la diferencia de Hit@3 entre -0,019 y +0,094). El modelo final se entrenó con el 100% de los datos, ya que la validación cruzada cumplió su función de validar el método. Se probó una pérdida combinada de ranking y preservación semántica que no superó a la receta BCE.

## Capacidades

- Puntuación de pares de texto: clasifica si dos ítems comparten la misma estructura de razonamiento causal/ToM, más allá de la similitud superficial.
- Reranking de candidatos: puede ordenar una lista de candidatos según su relevancia causal para una consulta dada.
- Integración con pipelines de recuperación: funciona como componente de reranking en sistemas de recomendación conversacional o RAG.
- No es generativo: no produce texto, solo puntuaciones de similitud entre pares.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo discriminativo puro.
- Capacidades multilingües: no especificadas; el backbone original es multilingüe, pero no se confirma para este fine-tune.

## Casos de uso

- Mejora de sistemas de recomendación conversacional: el modelo puede rerankear candidatos de recomendación en diálogos donde el usuario expresa creencias o deseos implícitos, priorizando aquellos que requieren el mismo patrón de razonamiento ToM que la consulta.
- Recuperación de información con razonamiento causal: en bases de conocimiento donde los ítems tienen estructuras causales subyacentes, este cross-encoder puede filtrar pares que comparten la misma lógica, útil para tareas de emparejamiento de casos o diagnóstico.
- Filtrado de pares en pipelines de RAG: cuando se necesita seleccionar documentos que no solo coinciden léxicamente sino que comparten una estructura argumentativa o causal, el modelo puede actuar como reranker después de una primera búsqueda por similitud coseno.
- Evaluación de consistencia causal en datasets: puede usarse para detectar pares de ejemplos que deberían tratarse como equivalentes desde el punto de vista del razonamiento, ayudando a depurar conjuntos de datos.
- Entrenamiento de retrievers más robustos: las puntuaciones generadas pueden servir como señales de entrenamiento (distillation) para modelos de embedding más ligeros.
- Investigación en Theory of Mind: como herramienta de análisis para estudiar cómo los modelos de lenguaje representan estructuras causales en diálogos de recomendación, permitiendo comparar la coherencia entre diferentes sistemas.

## Benchmarks y rendimiento

La model card reporta resultados de validación cruzada (5 pliegues) comparando el backbone congelado frente al fine-tune:

| Metrica | Backbone congelado | Fine-tune |
|---|---|---|
| Hit@3 | 0.180 | 0.218 |
| Hit@5 | 0.256 | 0.305 |
| MRR | 0.170 | 0.179 |

El fine-tune superó al backbone en 5 de 5 pliegues. La significancia estadística no es concluyente: McNemar p=0,22 y el intervalo de confianza bootstrap del 95% para la diferencia de Hit@3 ([-0,019, +0,094]) cruza el umbral convencional. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) porque el modelo es un cross-encoder específico para una tarea de reranking, no un LLM general.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (22,7 millones de parámetros). Con cuantización a FP16 o int8, el consumo es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de gama baja como NVIDIA GTX 1650 o superiores. También funciona en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna, incluso en integradas con suficiente RAM.
- Opciones de despliegue: se puede usar directamente con `sentence-transformers` (CrossEncoder). También es exportable a ONNX o TorchScript para inferencia en producción. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es muy rápida; en CPU se pueden procesar cientos de pares por segundo, y en GPU miles, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros cross-encoders específicos para razonamiento causal o Theory of Mind. La única comparación disponible es contra el backbone original `cross-encoder/ms-marco-MiniLM-L6-v2`, que se muestra en la sección de benchmarks. Otros cross-encoders generales como `cross-encoder/ms-marco-MiniLM-L-12-v2` o `cross-encoder/nli-deberta-v3-base` existen, pero no hay datos de rendimiento en la tarea RecToM para ellos. Por tanto, la comparativa se limita al backbone congelado.

## Limitaciones y advertencias

- Resultados no totalmente significativos: la mejora sobre el backbone no alcanza significancia estadística convencional (p=0,22), por lo que el beneficio real en producción podría ser marginal.
- Dataset pequeño: se entrenó con solo 266 ítems y 2295 pares, lo que limita la generalización a dominios fuera de RecToM.
- No evaluado en generación downstream: el modelo no se ha probado en la tarea final de generar respuestas de recomendación, solo en recuperación.
- Sesgos potenciales: al derivar de un dataset específico de recomendación conversacional, puede heredar sesgos de ese corpus (por ejemplo, dominios de películas o patrones de diálogo particulares).
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto: la longitud máxima de entrada no está documentada; el backbone MiniLM-L6 típicamente soporta 512 tokens, pero no se confirma.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo se ofrece sin garantías; el autor no proporciona soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhmsadegh/rectom-causal-reasoning-crossencoder-bce
- Repositorio del benchmark RecToM (GitHub): https://github.com/CGCL-codes/RecToM
- Paper de RecToM (arXiv): https://arxiv.org/abs/2511.22275
- Modelo piloto relacionado (retriever): https://huggingface.co/mhmsadegh/rectom-causal-reasoning-retriever-pilot
