# RenatoSpessotto/bertimbau-apoio-saude-mental-ptbr

## Resumen

BERTimbau para apoyo en salud mental es un modelo de clasificación de texto en portugués de Brasil, desarrollado por RenatoSpessotto en el marco de un proyecto académico del ICMC/USP (2026). Se trata de un fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau base) que clasifica comentarios de comunidades brasileñas de salud mental en Reddit en tres categorías: apoyo, neutro y no-apoyo. El modelo aborda un problema concreto de PLN aplicado a salud mental: detectar automáticamente dinámicas de apoyo emocional en conversaciones online.

El modelo tiene 108.925.443 parámetros (BERT base, encoder transformer) y un contexto de 128 tokens por truncamiento en entrenamiento e inferencia. Su relevancia radica en que supera con claridad a clasificadores multilingües genéricos listos para usar (Pysentimiento, XLM-RoBERTa de CardiffNLP) en el dominio específico, con un incremento de aproximadamente +0,19 de F1-macro sobre el mejor de ellos. El proyecto incluye además un ensemble calibrado de 5 folds con temperature scaling, que es la versión final recomendada por el autor.

Es importante subrayar que el propio autor desaconseja explícitamente su uso para moderación automática o cualquier decisión clínica, dado que el rendimiento en la clase más sensible (no-apoyo) es bajo (F1 de 0,36). El uso previsto es la investigación sobre dinámicas de apoyo en comunidades online.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BERTimbau) |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (truncamiento en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base (encoder transformer bidireccional) inicializado desde `neuralmind/bert-base-portuguese-cased`, el checkpoint BERTimbau entrenado sobre corpus en portugués de Brasil. Sobre esa base se aplicó un fine-tuning para clasificación de secuencias con tres etiquetas de salida (apoyo, neutro, no-apoyo). El pipeline de entrenamiento incluye una fase de TAPT (Task-Adaptive Pre-Training) con objetivo MLM sobre aproximadamente 10.000 comentarios sin etiquetar, seguida de un ajuste supervisado con focal loss (gamma=2) y pesos de clase, learning rate 2e-5, batch de 16 y max_length de 128.

Los datos de entrenamiento consisten en 2.995 comentarios anotados manualmente por seis personas del equipo, con una guía de anotación y un único anotador por comentario. La división es estratificada, con 10% para test y semilla 42. La clase no-apoyo es minoritaria (aproximadamente el 12% de los datos), lo que se compensa parcialmente con los pesos de clase y la focal loss. El proyecto final emplea un ensemble de 5 folds estratificados con media de logits y temperature scaling ajustado out-of-fold (T = 0,675 para el ensemble; T = 0,509 para el modelo único del holdout), lo que reduce el ECE de 0,087 a 0,037.

## Capacidades

- Clasificación de texto en tres clases (apoyo, neutro, no-apoyo) para comentarios en portugués de Brasil.
- Detección de lenguaje empático y de acogida en texto conversacional.
- Detección de lenguaje hostil, minimizador u ofensivo en el contexto de salud mental.
- Salida de probabilidades calibradas mediante temperature scaling (requiere dividir los logits por la temperatura indicada antes del softmax).
- Versión ensemble de 5 folds con calibración out-of-fold, disponible en el subdirectorio `ensemble/`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (sin visión ni audio).
- No dispone de modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre dinámicas de apoyo en comunidades online de salud mental: el modelo permite etiquetar a escala comentarios de foros y subreddits para estudiar qué proporción de respuestas son de apoyo, neutras o hostiles, y cómo varía según el tema o el subforo.
- Análisis longitudinal de comunidades de apoyo: con 128 tokens por comentario y clasificación por unidad, se puede procesar un histórico de comentarios y construir series temporales de prevalencia de apoyo emocional.
- Evaluación de intervenciones comunitarias: comparar la proporción de respuestas de apoyo antes y después de una campaña de moderación o de concienciación en una comunidad.
- Filtrado previo en estudios cualitativos: usar el modelo para priorizar comentarios candidatos a revisión humana en investigaciones sobre salud mental, reduciendo el volumen de lectura manual.
- Detección de casos de no-apoyo para revisión humana (nunca automática): el modelo puede señalar candidatos con probabilidad elevada de no-apoyo para que un moderador humano los revise, dado que el autor desaconseja la moderación automática.
- Análisis comparativo de plataformas: dado que el modelo se entrenó solo con Reddit, puede usarse como referencia para estudiar hasta qué punto las dinámicas de apoyo difieren en otras plataformas, siempre con validación previa.
- Docencia y experimentación en PLN clínico: sirve como ejemplo reproducible de pipeline completo (TAPT, focal loss, ensemble, calibración) para cursos de procesamiento de lenguaje natural aplicado a salud.

## Benchmarks y rendimiento

Resultados sobre 300 comentarios de test etiquetados por humanos, según la model card del autor:

| Modelo | Acurácia | F1-macro | F1-ponderado |
|---|---|---|---|
| Ensemble de 5 folds + temperature scaling | 0,657 | 0,590 | 0,661 |
| Modelo único del holdout (raíz del repo) | 0,647 | 0,594 | 0,658 |
| Pysentimiento (zero-shot) | 0,427 | 0,399 | 0,444 |
| XLM-RoBERTa CardiffNLP (zero-shot) | 0,377 | 0,358 | 0,382 |

F1 por clase del ensemble: apoyo 0,76; neutro 0,65; no-apoyo 0,36. Validación cruzada de 5 folds: F1-macro de 0,575 ± 0,018. Calibración: ECE del ensemble reducido de 0,087 a 0,037 con temperature scaling (T = 0,675).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para el modelo único (108,9 M de parámetros); en fp16 alrededor de 0,25 GB. El ensemble de 5 folds requiere cargar cinco copias, por lo que la VRAM se multiplica por cinco (aproximadamente 1,2 GB en fp16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.). También funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM para el ensemble en fp16.
- Opciones de despliegue: transformers (pipeline de text-classification), text-embeddings-inference (el repo incluye el tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte específico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1-macro en el test del proyecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERTimbau apoio saúde mental (ensemble) | 108,9 M por fold (5 folds) | 128 tokens | 0,590 | MIT | Hugging Face |
| Pysentimiento (zero-shot) | no disponible | no disponible | 0,399 | no disponible | Hugging Face |
| XLM-RoBERTa CardiffNLP (zero-shot) | no disponible | no disponible | 0,358 | no disponible | Hugging Face |
| BERTimbau base (`neuralmind/bert-base-portuguese-cased`) | 108,9 M | 512 tokens (BERT estándar) | no evaluado en este test | no disponible | Hugging Face |

## Limitaciones y advertencias

- El autor desaconseja explícitamente el uso para moderación automática o cualquier decisión clínica.
- F1 de solo 0,36 en la clase no-apoyo, que es precisamente la más sensible; el modelo falla en el caso de mayor riesgo.
- La clase no-apoyo es minoritaria (aproximadamente 12% de los datos), lo que agrava el desequilibrio.
- Cada comentario fue anotado por un único anotador y no se midió la concordancia entre anotadores, por lo que la calidad de las etiquetas es incierta.
- El modelo se entrenó exclusivamente con comentarios de Reddit y con truncamiento a 128 tokens, por lo que puede no generalizar a otras plataformas ni a textos más largos.
- Sesgos conocidos: no documentados explícitamente en la model card, más allá del desequilibrio de clases.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza si no se aplica la calibración.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el uso previsto declarado por el autor es únicamente de investigación.
- Privacidad: los datos provienen de personas en sufrimiento y no se publican; cualquier uso debe respetar la privacidad de los textos originales.
- Para obtener probabilidades calibradas es necesario aplicar la temperatura indicada en `temperatura.json` (modelo único) o en `ensemble/modelo_final.json` (ensemble); el pipeline estándar no la aplica automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenatoSpessotto/bertimbau-apoio-saude-mental-ptbr
- Repositorio del proyecto (código, informe y análisis): https://github.com/renatospessotto/bertimbau-mental-health-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
