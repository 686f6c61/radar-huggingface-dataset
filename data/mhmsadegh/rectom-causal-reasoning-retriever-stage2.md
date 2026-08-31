# mhmsadegh/rectom-causal-reasoning-retriever-stage2

## Resumen

RecToM Causal-ToM Reasoning-Aware Retriever (Stage 2) es un modelo de retrieval semántico especializado en razonamiento causal y teoría de la mente (Theory of Mind, ToM) para sistemas de recomendación conversacionales. Desarrollado por mhmsadegh como parte del proyecto RecToM, este modelo es un fine-tuning de BAAI/bge-small-en-v1.5 (arquitectura BERT con 33,36 millones de parámetros) entrenado con sentence-transformers para recuperar fragmentos de diálogo que evidencian creencias, deseos, intenciones, juicios y predicciones de los usuarios.

El modelo resuelve el problema de recuperar información relevante para inferir estados mentales de los usuarios en conversaciones multi-turno, un paso previo a la generación de respuestas en sistemas de recomendación con ToM. Su relevancia radica en que es la segunda iteración de un pipeline diseñado para mejorar la precisión del retrieval frente a modelos congelados, utilizando un conjunto de datos ampliado y validado (266 ítems frente a los 56 de la primera etapa). Aunque los resultados absolutos siguen siendo modestos, muestra una mejora consistente en las métricas de retrieval respecto a los modelos base sin fine-tuning.

La licencia no está especificada y el modelo está pensado para extracción de características (feature-extraction) y similitud de frases, con soporte para text-embeddings-inference. No se han publicado resultados de evaluación en tareas posteriores de generación de respuestas (Stage 3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base bge-small-en-v1.5 soporta 512 tokens, pero no se confirma en la documentacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un transformer BERT de 12 capas con 33 millones de parámetros, diseñado originalmente para retrieval semántico y similitud de frases. Sobre esta base, se aplicó un fine-tuning con la librería sentence-transformers para especializar el modelo en la recuperación de evidencia causal y de estados mentales dentro de diálogos de recomendación.

El entrenamiento de esta etapa (Stage 2) utilizó un conjunto de datos ampliado y equilibrado denominado Case Bank, compuesto por 266 ítems elegibles tras un proceso de filtrado y canonicalización de relaciones causales. Los datos provienen de dos fuentes: 80 ítems originales de la documentación previa (docs126) y 447 nuevos ítems validados por intervención (docs128). Se aplicó una validación cruzada de 5 particiones disjuntas por grupo para evaluar la generalización, corrigiendo la metodología degenerada de la primera etapa. Los caminos causales fueron generados y validados con el modelo deepseek-v4-flash, en lugar de gpt-5.4, por razones de coste. No se especifican detalles sobre el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Retrieval semántico de frases y diálogos: genera embeddings de oraciones y párrafos para búsqueda por similitud coseno.
- Recuperación de evidencia de estados mentales (ToM): identifica fragmentos de conversación que contienen creencias, deseos, intenciones, juicios y predicciones del usuario.
- Razonamiento causal orientado a recomendaciones: prioriza información con relaciones causa-efecto relevantes para inferir preferencias y necesidades.
- Compatible con text-embeddings-inference para despliegue como endpoint de embeddings.
- Funciona como componente de un pipeline RAG (retrieval-augmented generation) para sistemas de recomendación conversacionales.
- No incluye capacidades de generación de texto, tool calling, visión ni audio; es exclusivamente un modelo de codificación de texto.

## Casos de uso

- Sistemas de recomendación con teoría de la mente: el modelo recupera fragmentos de diálogos previos que revelan creencias y deseos del usuario, permitiendo que un LLM genere recomendaciones personalizadas basadas en inferencias causales.
- Análisis de conversaciones de soporte al cliente: extrae intenciones y juicios del cliente en interacciones multi-turno para clasificar problemas y derivar soluciones.
- Búsqueda de evidencia causal en logs de incidentes: en entornos de mantenimiento predictivo, recupera pasajes que relacionan anomalías con causas raíz, complementando pipelines de análisis de causa raíz.
- Construcción de datasets de entrenamiento para modelos ToM: sirve como anotador automático para etiquetar diálogos con estados mentales, reduciendo el esfuerzo manual.
- Motores de búsqueda semántica en dominios especializados: adaptado a dominios donde importa la inferencia de intenciones (ventas, salud, educación), recupera pasajes relevantes para preguntas complejas.
- Evaluación de pipelines de retrieval en benchmarks ToM: se puede integrar en suites de evaluación para comparar la calidad del retrieval frente a modelos congelados.
- Pre-filtrado en sistemas RAG conversacionales: reduce el espacio de búsqueda antes de la generación de respuestas, mejorando la precisión en tareas que requieren comprender estados mentales.

## Benchmarks y rendimiento

El autor proporciona métricas de retrieval sobre una partición de validación disjunta por grupo (n=53 consultas). Se comparan tres modelos: dos congelados (all-MiniLM-L6-v2 y bge-small-en-v1.5) y el modelo fine-tuneado en su época 3.

| Modelo | MATCH@1 | Hit@3 | MRR | Gap coseno pos-neg |
|---|---|---|---|---|
| Frozen all-MiniLM-L6-v2 | 0.057 | 0.208 | 0.189 | -0.007 |
| Frozen BAAI/bge-small-en-v1.5 | 0.075 | 0.226 | 0.204 | +0.001 |
| Este modelo (fine-tuned, epoch 3) | 0.113 | 0.302 | 0.248 | +0.050 |

El modelo fine-tuneado supera a ambos congelados en todas las métricas, con una mejora relativa de aproximadamente el 51% en MATCH@1 respecto al mejor congelado. El gap coseno positivo indica que los embeddings de pares positivos y negativos están mejor separados tras el fine-tuning. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para esas tareas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 33 millones de parámetros, la inferencia en FP32 requiere aproximadamente 133 MB de memoria; con cuantización a 8 bits se reduce a unos 33 MB. Cabe en cualquier GPU consumer (incluso integradas) y en CPU.
- GPU recomendadas: no se requiere GPU específica; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para despliegues masivos, una T4 o A10G es más que adecuada.
- Compatibilidad con consumer GPU: sí, funciona en RTX 3060, RTX 4090, etc., e incluso en CPU con latencias de milisegundos.
- Opciones de despliegue: compatible con sentence-transformers, text-embeddings-inference, FAISS para indexación, y cualquier framework que soporte ONNX o TensorRT. También puede integrarse con vLLM (aunque no es óptimo para embeddings) o con Ollama si se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales, pero para un modelo de este tamaño se espera una latencia de ~1-5 ms por lote pequeño en GPU y ~10-30 ms en CPU, con throughput de cientos de consultas por segundo en GPUs modernas.

## Comparativa con modelos similares

El modelo se compara directamente con dos modelos de retrieval de tamaño similar en los benchmarks del autor. No se han encontrado otros modelos especializados en retrieval ToM en la información disponible.

| Modelo | Parámetros | Contexto | MATCH@1 (en este benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| all-MiniLM-L6-v2 (congelado) | 22,7 M | 256 tokens | 0.057 | Apache 2.0 | HuggingFace |
| BAAI/bge-small-en-v1.5 (congelado) | 33,4 M | 512 tokens | 0.075 | MIT | HuggingFace |
| Este modelo (fine-tuned) | 33,36 M | no disponible | 0.113 | no disponible | HuggingFace |

El modelo fine-tuneado mejora claramente al base en el benchmark específico de RecToM, aunque los valores absolutos siguen siendo bajos, lo que sugiere que la tarea es difícil y que el modelo aún tiene margen de mejora.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un conjunto de datos limitado (266 ítems) y generado parcialmente por un modelo de IA (deepseek-v4-flash), puede heredar sesgos de ese modelo y del proceso de anotación automática.
- Riesgo de alucinación: al ser un modelo de retrieval, no genera texto, pero puede recuperar fragmentos irrelevantes o mal etiquetados si los datos de entrenamiento contienen errores. El autor menciona que la validación por intervención fue menos exhaustiva que en la primera etapa (solo una intervención por ítem).
- Limitaciones de contexto: la longitud de contexto no está confirmada; si hereda los 512 tokens del modelo base, no es adecuado para diálogos muy largos sin truncamiento.
- Limitaciones de idioma: no se especifica soporte multilingüe; probablemente esté limitado al inglés.
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin autorización explícita del autor.
- Advertencias para producción: el modelo no ha sido evaluado en la tarea downstream de generación de respuestas (Stage 3), por lo que su impacto real en sistemas de recomendación completos es desconocido. Además, los resultados de los benchmarks son sobre un conjunto de validación pequeño (53 consultas) y pueden no generalizar.
- Dependencia del pipeline: el rendimiento depende de la calidad de los caminos causales generados por deepseek-v4-flash, que es un modelo diferente al usado en la primera etapa, lo que introduce variabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhmsadegh/rectom-causal-reasoning-retriever-stage2
- Repositorio del proyecto RecToM (benchmark y evaluación): https://github.com/CGCL-codes/RecToM
- Paper relacionado sobre grafos causales y razonamiento (no específico de este modelo): https://arxiv.org/abs/2501.14892
- Modelo piloto anterior (Stage 1): https://huggingface.co/mhmsadegh/rectom-causal-reasoning-retriever-pilot
