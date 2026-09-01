# fcmeyer/zerank-2-reranker-MLX-8bit

## Resumen

zerank-2-reranker-MLX-8bit es una conversión a MLX (Apple Silicon) del modelo zerank-2, un cross-encoder reranker desarrollado por ZeroEntropy. El modelo original está construido sobre Qwen3-4B y está diseñado para reordenar documentos según su relevancia respecto a una consulta, superando a los métodos basados en embeddings independientes al procesar consulta y documento conjuntamente. Esta versión específica, creada por fcmeyer, aplica cuantización de 8 bits tanto al cuerpo del transformer como a la matriz de embedding/readout, reduciendo el tamaño en disco a 4,3 GB y permitiendo su ejecución eficiente en hardware Apple.

La relevancia de este modelo radica en que ofrece una alternativa de alta precisión para tareas de reranking en sistemas de recuperación de información, con soporte para dominios especializados como finanzas, legal, código, STEM y medicina. Al estar cuantizado en 8 bits, mantiene una fidelidad muy alta respecto al modelo original en float32, con una correlación de Spearman de 0,999494 y solo una inversión de ranking resoluble en un conjunto de verificación independiente. Está disponible bajo licencia Apache-2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3-4B (transformador) |
| Parametros totales | 1.131.460.096 (segun safetensors; el modelo base Qwen3-4B tiene ~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (q8) en cuerpo y embedding; tambien existen versiones bf16, q4, q6 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder que procesa un par (consulta, documento) de forma conjunta. No posee una cabeza de clasificación; en su lugar, el par se formatea mediante la plantilla de chat de Qwen3, donde la consulta actúa como `system`, el documento como `user`, y se genera un prompt de asistente. La puntuación se obtiene del logit del token con id 9454 (la palabra "Yes") en la posición final, calculado como el producto escalar entre el estado oculto y la matriz de embedding de ese token. Esta matriz actúa como matriz de lectura, y el logit resultante es la puntuación de relevancia.

El modelo original zerank-2 fue entrenado por ZeroEntropy utilizando la metodología zELO, que según la documentación de la empresa permite superar a los modelos frontier en NDCG@10 con menor latencia y coste. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas como RLHF o DPO. La conversión a MLX fue realizada por fcmeyer, quien verificó la fidelidad de la cuantización comparando las puntuaciones con el modelo original en PyTorch float32.

## Capacidades

- Reranking de documentos: dado un par (consulta, documento), devuelve una puntuación de relevancia escalar. Las puntuaciones son comparables dentro de una misma consulta, no entre consultas distintas.
- Procesamiento por lotes: tanto `rank()` como `score()` agrupan internamente las operaciones para mejorar el rendimiento.
- Soporte de dominios especializados: el modelo está etiquetado para finanzas, legal, código, STEM y medicina, lo que indica que fue entrenado o evaluado en estos ámbitos.
- Integración con MLX: diseñado para ejecutarse en Apple Silicon, aprovechando el framework MLX de Apple.
- Sin capacidades de generación de texto: al ser un cross-encoder, no genera respuestas, solo puntuaciones.
- Sin soporte de tool calling ni agentes: su función es exclusivamente la de reordenar documentos.

## Casos de uso

- Recuperación aumentada por generación (RAG): en un pipeline de RAG, el modelo puede reordenar los documentos recuperados por un buscador inicial (por ejemplo, basado en embeddings) para seleccionar los más relevantes antes de pasarlos al generador. Su alta precisión y baja latencia lo hacen adecuado para sistemas de preguntas y respuestas sobre corpus extensos.
- Búsqueda empresarial: en motores de búsqueda internos de empresas con documentación técnica, legal o financiera, el reranker puede mejorar la precisión de los resultados al reordenar los candidatos según la consulta del usuario.
- Filtrado de candidatos en sistemas de recomendación: cuando se dispone de una lista de ítems potencialmente relevantes, el modelo puede puntuar cada par (consulta, ítem) para quedarse con los mejores.
- Análisis de contratos y documentos legales: en el sector legal, el modelo puede ayudar a localizar cláusulas o precedentes relevantes dentro de grandes volúmenes de documentos, gracias a su entrenamiento en dominios legales.
- Asistencia médica basada en evidencia: para profesionales que necesitan encontrar artículos científicos o historiales clínicos relevantes, el reranker puede priorizar los documentos más pertinentes a una consulta clínica.
- Moderación de contenido o clasificación de tickets: aunque no es su uso principal, el modelo puede adaptarse para puntuar la relevancia de respuestas o soluciones en foros de soporte, ayudando a priorizar las más útiles.

## Benchmarks y rendimiento

La model card incluye una verificación exhaustiva de la conversión MLX frente al modelo original en PyTorch float32, utilizando 486 pares (consulta, documento) y un conjunto independiente de 1449 pares de BEIR (FiQA, SciFact, NFCorpus). Los resultados para la versión q8 son:

| Metrica | MLX q8 vs PyTorch float32 (verificacion propia) | MLX q8 vs PyTorch float32 (BEIR independiente) |
|---|---|---|
| Diferencia absoluta media de puntuacion | 0.0723 | 0.0807 |
| Diferencia absoluta p99 | 0.2119 | 0.2861 |
| Diferencia absoluta maxima | 0.2736 | 0.4682 |
| Correlacion de Spearman | 0.999494 | 0.999875 |
| Kendall tau medio por consulta | 0.977836 | 0.986915 |
| Inversiones de ranking | 29 | 13 |
| Tasa de inversiones resolubles | 0 / 4719 (0.0000%) | 1 / 4168 (0.0240%) |
| Cambios de veredicto de relevancia | 0 | 0 |

Ademas, se realizo una comprobacion de NDCG@10 contra los qrels de BEIR, obteniendo un valor de 0.955104 para la version q8, frente a 0.954794 del modelo float32. La ablacion de cuantizacion muestra que la version q8 es la que menor degradacion introduce, con una tasa de inversiones resolubles de solo 0.024% y cero cambios de veredicto.

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de reranking, no de generacion.

## Requisitos de hardware

- Dispositivo: Apple Silicon (M1, M2, M3 o posteriores) con soporte para MLX.
- Memoria: el modelo ocupa 4,3 GB en disco; en memoria, con cuantizacion de 8 bits, se estima un uso de VRAM similar (alrededor de 4-5 GB), por lo que cabe en Macs con 8 GB de RAM unificada o superior.
- GPU recomendada: cualquier GPU integrada en los chips Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: se puede ejecutar mediante el script `rerank.py` incluido en el repositorio, que utiliza `mlx-lm` y `transformers`. Tambien es posible integrarlo en aplicaciones Python directamente.
- Latencia y rendimiento: no se proporcionan cifras exactas, pero al ser una version cuantizada y optimizada para MLX, se espera una latencia inferior a la del modelo original en PyTorch con MPS. El port de 199-biotechnologies afirma ser 10 veces mas rapido que la referencia PyTorch + MPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| zerank-2-reranker-MLX-8bit (este) | 1.13B (safetensors) | No disponible | 8-bit | Apache-2.0 | Conversion MLX, solo ingles |
| zerank-2-reranker-MLX-bf16 | 1.13B (safetensors) | No disponible | bf16 | Apache-2.0 | Conversion MLX sin perdida, mayor tamano |
| zerank-2-reranker (original) | ~4B (Qwen3-4B) | No disponible | float32 | Apache-2.0 | Modelo base, soporta 100+ idiomas |
| zerank-1-small | No disponible | No disponible | No disponible | No disponible | Version mas rapida de ZeroEntropy |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros rerankers como bge-reranker-v2 o Cohere Rerank en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles (`en`), aunque el modelo original zerank-2 soporta mas de 100 idiomas. Esta conversion especifica puede no funcionar correctamente con otros idiomas.
- Cuantizacion: al ser una version q8, introduce una pequena degradacion respecto al modelo float32. Aunque la correlacion es muy alta (0.999875 en BEIR), existe una inversion de ranking resoluble en el conjunto independiente, lo que podria afectar a casos extremos.
- Puntuaciones no calibradas entre consultas: las puntuaciones solo son comparables dentro de una misma consulta; no se deben comparar puntuaciones de consultas diferentes.
- Sin generacion de texto: no es un modelo generativo; solo produce puntuaciones de relevancia.
- Requisito de Apple Silicon: esta version esta optimizada para MLX y no funcionara en GPUs NVIDIA o AMD sin una conversion adicional.
- Sesgos: no se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles y dominios tecnicos, puede tener un rendimiento inferior en contextos coloquiales o de otros idiomas.
- Riesgo de alucinacion: no aplica, ya que no genera texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcmeyer/zerank-2-reranker-MLX-8bit
- Modelo base (zerank-2-reranker): https://huggingface.co/zeroentropy/zerank-2-reranker
- Version MLX bf16: https://huggingface.co/fcmeyer/zerank-2-reranker-MLX-bf16
- Repositorio de port MLX alternativo: https://github.com/199-biotechnologies/zerank-2-mlx
- Articulo de ZeroEntropy sobre zerank-2: https://www.zeroentropy.dev/articles/zerank-2-advanced-instruction-following-multilingual-reranker
- Pagina de rerankers de ZeroEntropy: https://www.zeroentropy.dev/rerankers/
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.12541
