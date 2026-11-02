# maxdemarzi/bjj-reranker-v3-onnx

## Resumen

`maxdemarzi/bjj-reranker-v3-onnx` es un re-ranker de tipo cross-encoder especializado en dominios de Brazilian Jiu-Jitsu (BJJ), desarrollado por maxdemarzi como parte del proyecto `bjj-coach`. Se trata de un ajuste fino del modelo base `BAAI/bge-reranker-base` (278M parametros, arquitectura XLM-RoBERTa) sobre un conjunto de 4.076 tripletas verificadas de BJJ con negativos duros, y exportado a formato ONNX (opset 17) para inferencia en CPU sin dependencia de PyTorch. Su proposito es reordenar candidatos recuperados por un motor de busqueda previo, distinguiendo entre tecnicas, posiciones y transiciones de BJJ que son lexica y semanticamente muy proximas.

El modelo resuelve un problema concreto: los re-rankers genericos confunden terminos tecnicos del dominio (por ejemplo, `half-butterfly` frente a `butterfly-guard`, o `darce-choke` frente a `anaconda-choke`) porque carecen de la granularidad mecanica necesaria. El ajuste fino con negativos duros especificos del dominio mejora la discriminacion en tareas de recuperacion de citas y demostraciones visuales dentro de una aplicacion de entrenamiento asistida por IA.

Es relevante ahora porque demuestra un patron reproducible de adaptacion de dominio sobre un re-ranker pequeno y desplegable en CPU, con una mejora medible en metricas de ranking (MRR@10 +0,0525, Recall@1 +10 puntos) sobre el modelo base, y porque el formato ONNX permite integrarlo en servicios ligeros sin infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (heredada de `BAAI/bge-reranker-base`) |
| Parametros totales | 278M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens (`max_length=384` en la exportacion ONNX, ejes dinamicos) |
| Tipos de cuantizacion | No disponible (el repo se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), con tokenizer de Hugging Face `tokenizers` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura XLM-RoBERTa del re-ranker `BAAI/bge-reranker-base`, con 278M parametros. Recibe un par (consulta, documento) y produce una puntuacion de relevancia directamente, a diferencia de los bi-encoders que generan embeddings independientes. La exportacion a ONNX utiliza ejes dinamicos en `batch_size` y `sequence_length`, con `max_length=384`, y se sirve mediante `onnxruntime` con `CPUExecutionProvider` y el tokenizer de Hugging Face.

El ajuste fino se realizo sobre 4.076 tripletas verificadas de BJJ con negativos duros, compuestas por 3.526 tripletas de citas de guias, 350 tripletas de keyframes de demostracion visual y 200 tripletas de taxonomia recien desambiguadas (incluyendo pares como `half-butterfly` frente a `butterfly-guard`, `ouchi-gari`, `osoto-gari`, `bridge-and-roll`, `von-flue-choke` y `paper-cutter-choke`). La funcion de perdida combina un objetivo listwise InfoNCE de 5 vias (tau = 0,5) con una perdida pairwise de margen ranking (m = 1,0, alpha = 0,5). Los negativos duros se construyeron a partir de segmentos adyacentes del mismo instructor sin el micro-ajuste mecanico especifico, confusores de posicion hermana, confusores de rol opuesto (escape del defensor frente a finalizacion del atacante) y solapamiento lexico sin senales mecanicas accionables.

## Capacidades

- Re-ranking de pares (consulta, documento) para recuperacion de informacion en el dominio de BJJ.
- Discriminacion fina entre tecnicas, posiciones y transiciones con alta similitud lexica y semantica.
- Puntuacion de relevancia para citas de guias de instruccion y keyframes de demostracion visual.
- Distincion entre roles (atacante frente a defensor) en descripciones de tecnicas.
- Inferencia en CPU sin PyTorch mediante ONNX Runtime.
- Soporte de lotes con ejes dinamicos en `batch_size` y `sequence_length`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de ranking, no generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica en una aplicacion de entrenamiento de BJJ: el modelo reordena los resultados recuperados por un motor de embeddings previo, priorizando la tecnica exacta solicitada frente a variantes lexicamente proximas, gracias a su entrenamiento con negativos duros de posicion hermana.
- Asistente de instruccion con citas verificadas: al integrarse en `embed/server.py` del proyecto `bjj-coach`, permite que las respuestas del asistente citen segmentos concretos de guias con mayor precision (Recall@1 del 78% frente al 68% del base).
- Recuperacion de demostraciones visuales: los 350 tripletas de keyframes permiten al modelo puntuar fotogramas de video como relevantes para una consulta mecanica concreta, util en herramientas de analisis de tecnica.
- Desambiguacion de taxonomia en bases de conocimiento: el modelo distingue pares como `half-butterfly` frente a `butterfly-guard` o `darce-choke` frente a `anaconda-choke`, adecuado para normalizar ontologias de artes marciales.
- Despliegue en entornos sin GPU: al exportarse a ONNX con `CPUExecutionProvider`, puede servirse en contenedores ligeros o dispositivos de borde dentro de una aplicacion web de coaching.
- Filtrado de resultados en un pipeline RAG especializado: como segunda etapa de ranking sobre los candidatos de un retriever, mejora la precision del contexto entregado a un LLM generativo en un dominio tecnico acotado.
- Evaluacion de calidad de anotaciones: el modelo puede puntuar pares (consulta, anotacion) para detectar descripciones ambiguas o mal etiquetadas en un corpus de BJJ.

## Benchmarks y rendimiento

Evaluacion sobre 250 tripletas 5-way reservadas (`data/reranker_v3_eval_report.json`):

| Metrica | Baseline (`BAAI/bge-reranker-base`) | `bjj-reranker-v3.1` (ONNX) | Delta |
|---|---|---|---|
| MRR@10 | 0,8224 | 0,8749 | +0,0525 |
| Recall@1 | 68,0% | 78,0% | +10,0% |
| Recall@3 | 93,6% | 97,6% | +4,0% |
| Recall@6 | 99,2% | 99,2% | 0,0% |

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un re-ranker de dominio y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo esta disenado para CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime CUDA podria usarse, pero no se documenta.
- Cabe en GPU de consumo: si, aunque el caso de uso previsto es CPU. El repo ocupa 1,1 GB, lo que sugiere pesos en precision completa o mixta.
- Opciones de despliegue: `onnxruntime` (CPU o CUDA), con tokenizer de Hugging Face `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un cross-encoder de ranking).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| `maxdemarzi/bjj-reranker-v3-onnx` | 278M | 384 tokens | Apache 2.0 | ONNX | Cross-encoder especializado en BJJ |
| `BAAI/bge-reranker-base` | 278M | 512 tokens (tipico en el base) | MIT (segun el modelo original) | safetensors / PyTorch | Cross-encoder generico multilingue |
| `BAAI/bge-reranker-large` | 560M | 512 tokens (tipico) | MIT (segun el modelo original) | safetensors / PyTorch | Cross-encoder generico de mayor tamano |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~22M | 512 tokens | Apache 2.0 | PyTorch | Cross-encoder ligero para MS MARCO |

La comparativa se limita a la familia de re-rankers cross-encoder; el modelo de maxdemarzi se diferencia por su especializacion de dominio y su empaquetado ONNX para CPU, no por tamano o contexto. Los datos de contexto del modelo base y de los alternativos no se detallan en la informacion proporcionada y se indican como valores tipicos de la familia, no verificados en esta ficha.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente para BJJ; su rendimiento fuera de ese dominio no esta evaluado y probablemente sea inferior al del modelo base.
- Solo ingles: el modelo declara `en` como unico idioma soportado, pese a que XLM-RoBERTa es multilingue en origen; el ajuste fino puede haber degradado el rendimiento en otros idiomas.
- Contexto limitado a 384 tokens: pares mas largos se truncan, lo que puede perder informacion mecanica relevante en documentos extensos.
- Riesgo de sobreajuste a los negativos duros del conjunto de entrenamiento: la mejora en Recall@1 no se traduce en Recall@6 (sin cambio), lo que sugiere que la ganancia se concentra en la cabeza del ranking.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; solo puntua pares.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo, robustez adversarial ni calibracion de puntuaciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `BAAI/bge-reranker-base` tiene su propia licencia que conviene verificar antes de redistribuir.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- El nombre del modelo en el repo (`v3-onnx`) y en la model card (`v3.1`) difiere; conviene confirmar la version exacta antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/maxdemarzi/bjj-reranker-v3-onnx
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
- Repositorio del proyecto: https://github.com/maxdemarzi/bjj-coach
- Informe de evaluacion referenciado: `data/reranker_v3_eval_report.json` (dentro del repositorio del proyecto)
