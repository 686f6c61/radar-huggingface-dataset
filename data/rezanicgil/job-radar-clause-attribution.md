# rezanicgil/job-radar-clause-attribution

## Resumen

Job Radar clause attribution es un clasificador de texto de tipo encoder, desarrollado por el usuario rezanicgil, que evalúa si una cláusula extraída de un currículum atribuye un trabajo relevante al propio candidato, a otra persona, o si no establece quién lo realizó. El modelo se plantea como una herramienta de investigación para priorizar pasajes candidatos de cara a una revisión humana en procesos de selección, no como un sistema de decisión automática.

Técnicamente se trata de un fine-tuning de `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli`, un encoder MiniLM multilingüe de seis capas, adaptado para clasificación de secuencias con tres etiquetas. El modelo resultante tiene 106.995.075 parámetros y un repositorio de 0,4 GB en formato safetensors. Trabaja con pares de secuencias (cláusula del CV y requisito del puesto) y una longitud máxima de 128 tokens en el ejemplo de uso publicado.

Su relevancia es acotada y experimental: el conjunto de entrenamiento consta de solo 144 pares distintos redactados por el autor, y la evaluación se limita a cuatro condiciones con pasajes ficticios. El propio autor advierte de que no existe calibración contra resultados reales de contratación y de que se necesitan etiquetas humanas independientes y una evaluación de mayor escala para valorar la generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLMv2 de 6 capas, base `MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli`) con cabeza de clasificación de secuencias |
| Parametros totales | 106.995.075 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como máximo del modelo; el ejemplo de la model card usa `max_length=128` |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors sin variantes GGUF/ONNX) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un encoder transformer MiniLMv2 de seis capas con capacidad multilingüe, originalmente entrenado para inferencia de lenguaje natural (NLI) sobre XNLI, y lo adapta a una tarea de clasificación de tres clases mediante fine-tuning. Según la model card, se ajustaron la última capa del encoder y la cabeza de clasificación, dejando el resto de los pesos en su estado del modelo base (revisión `0a71e92a985b6e1ad1828cf67ce9c459639c1dca`).

El conjunto de entrenamiento es muy reducido: 144 pares distintos de cláusula y requisito, redactados por el autor del proyecto, con 24 ejemplos de trabajo atribuido al candidato, 24 de trabajo atribuido a otro actor y 96 de cláusulas que no establecen quién realizó el trabajo. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa; se trata de un fine-tuning supervisado convencional sobre una tarea de clasificación. La entrada se construye como un par de secuencias (cláusula del CV, requisito del puesto) y la salida son logits sobre tres etiquetas.

## Capacidades

- Clasificación de pares (cláusula, requisito) en tres categorías: atribución al candidato, atribución a otro actor y atribución no establecida.
- Procesamiento bilingüe turco-inglés, incluyendo vistas cruzadas entre ambos idiomas en la evaluación publicada.
- Generación de puntuaciones por clase utilizables para ordenar o priorizar pasajes candidatos antes de una revisión humana.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad declarada con Text Embeddings Inference y endpoints compatibles (etiquetas del repositorio).
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento extendido.
- No dispone de capacidades de visión, audio ni generación de texto libre: es exclusivamente un clasificador.

## Casos de uso

- Triaje de currículums en procesos de selección: el modelo puntúa cláusulas de un CV frente a un requisito concreto para que un reclutador revise primero los pasajes con mayor probabilidad de atribución al candidato, reduciendo el volumen de lectura manual.
- Detección de atribuciones ambiguas: al identificar cláusulas donde no se establece quién realizó el trabajo, permite marcar pasajes que requieren aclaración en una entrevista o cuestionario al candidato.
- Búsqueda de evidencias en candidaturas bilingües: con soporte turco-inglés, sirve para emparejar requisitos redactados en un idioma con cláusulas de CV en el otro, un escenario habitual en mercados con movilidad laboral entre Turquía y entornos anglófonos.
- Investigación en sesgos de redacción de CV: el clasificador permite estudiar cómo se distribuyen las atribuciones de logros (propias frente a ajenas) en corpus de candidaturas, como paso previo a análisis más amplios.
- Componente de un pipeline de ranking de candidatos: las puntuaciones por clase pueden combinarse con otros recuperadores para ordenar pasajes antes de una fase de revisión humana, siempre con supervisión.
- Filtrado previo en herramientas de análisis de ofertas y CV: integrado en un sistema mayor, puede descartar cláusulas irrelevantes o mal atribuidas antes de pasarlas a un modelo generativo de resumen.
- Prototipado académico de tareas de atribución de evidencia: por su tamaño reducido (107 M de parámetros) y licencia MIT, es adecuado como línea base reproducible en experimentos de atribución de autoría en textos curriculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card reporta únicamente una evaluación interna de recuperación de pasajes:

| Condición de evaluación | Resultado del modelo | Resultado del encoder de traducción Python |
|---|---|---|
| 4 condiciones en inglés con pasajes en turco | Recupera el pasaje correcto en primer lugar en 2 de 4 | 1 de 4 |
| 4 condiciones en turco con pasajes en inglés | Recupera el pasaje correcto en primer lugar en 2 de 4 | 0 de 4 |

Cada condición consta de tres pasajes ficticios competidores y se ordenan por la puntuación máxima de atribución al candidato entre cláusulas. El autor señala que las cuatro condiciones subyacentes son compartidas entre las vistas de idioma y que se necesitan etiquetas humanas independientes y una evaluación de mayor tamaño para evaluar la generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (107 M de parámetros, aproximadamente 0,43 GB de pesos) y en torno a 0,2-0,3 GB en fp16; el repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia por lotes con holgura. Para despliegues de alto throughput, una T4 o L4 son adecuadas; A100 y H100 no son necesarias para este tamaño.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` en Python, Text Embeddings Inference (declarado compatible en las etiquetas del repo) y endpoints compatibles. No se documentan variantes GGUF para llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rezanicgil/job-radar-clause-attribution | 106.995.075 | No disponible (ejemplo con 128 tokens) | Clasificación de atribución de cláusulas | tr, en | MIT | Hugging Face |
| MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli (modelo base) | No disponible en la información | No disponible | NLI multilingüe | Multilingüe | No disponible en la información | Hugging Face |
| Encoder de traducción Python citado en la model card | No disponible | No disponible | Recuperación/atribución (comparación interna) | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento más allá de las referencias internas de la model card.

## Limitaciones y advertencias

- Entrenamiento con solo 144 pares redactados por el autor: riesgo alto de sobreajuste y de generalización limitada a dominios, formatos de CV o estilos de redacción distintos de los del conjunto de entrenamiento.
- Evaluación muy reducida (cuatro condiciones con tres pasajes ficticios cada una) y sin etiquetas humanas independientes; el autor reconoce explícitamente que se necesita una evaluación mayor.
- Sin calibración contra resultados reales de contratación: las puntuaciones no deben interpretarse como probabilidades de éxito en un proceso de selección.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas en cláusulas ambiguas o con atribuciones implícitas.
- Cobertura lingüística limitada a turco e inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- Longitud de entrada limitada en el ejemplo a 128 tokens, lo que puede truncar cláusulas largas o requisitos extensos.
- Uso previsto como herramienta de investigación y triaje para revisión humana; no debe emplearse como filtro automático de candidatos sin supervisión por implicaciones éticas y legales en selección de personal.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezanicgil/job-radar-clause-attribution
- Modelo base: https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli
- Dataset de entrenamiento/evaluación: https://huggingface.co/datasets/rezanicgil/job-radar-match-pilot
- Ejemplos de evaluación (vista cross_language_attribution): https://huggingface.co/datasets/rezanicgil/job-radar-match-pilot/viewer/cross_language_attribution/validation
- Código de entrenamiento: https://github.com/rezanicgil/job-radar-evidence/blob/main/scripts/train_clause_attribution.py
- Rankings de evaluación: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/cross-language-attribution.json
