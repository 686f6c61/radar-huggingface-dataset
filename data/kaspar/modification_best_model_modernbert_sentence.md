# Kaspar/modification_best_model_modernbert_sentence

## Resumen

`Kaspar/modification_best_model_modernbert_sentence` es un clasificador binario de frases especializado en detectar cláusulas de modificación dentro de los términos de servicio de plataformas en línea. Se trata de un ajuste fino (fine-tuning) del modelo encoder `answerdotai/ModernBERT-base`, publicado por el usuario Kaspar en Hugging Face con pipeline de `text-classification`. El modelo recibe una única frase como entrada y devuelve una etiqueta binaria: 1 si la frase pertenece a una cláusula de modificación (por ejemplo, cambios unilaterales de condiciones por parte del proveedor) y 0 en caso contrario.

Su relevancia es acotada pero concreta: automatiza una tarea de análisis legal sobre documentos largos y repetitivos, donde la revisión manual no escala. Al estar construido sobre ModernBERT-base, hereda una arquitectura transformer encoder moderna con atención de contexto largo, aunque el ajuste se ha realizado exclusivamente sobre frases individuales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación o de un proyecto personal más que un modelo consolidado.

El modelo cuenta con 149.606.402 parámetros (según safetensors) y un tamaño de repositorio de 0,6 GB. La información pública sobre licencia, idiomas soportados y detalles de entrenamiento más allá de lo indicado en la model card es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificación binaria de frases (text-classification) |
| Modelo base | answerdotai/ModernBERT-base |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `answerdotai/ModernBERT-base`, un transformer encoder de la familia ModernBERT. La tarea se formula como clasificación binaria de frases: la entrada es únicamente la frase objetivo (no el documento completo ni un par de frases), y la salida es una etiqueta 1/0 indicando si la frase pertenece a una cláusula de modificación de términos de servicio. No se documentan en la model card innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos; al tratarse de un encoder de clasificación, tampoco aplican técnicas de generación.

Los datos de entrenamiento provienen de `modification_annotations.csv`, con frases etiquetadas por modelos Claude, una etiqueta por frase distinta. El conjunto se divide en 1229 ejemplos de entrenamiento y 218 de test (15 % de las frases distintas). No se especifica el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en un clasificador encoder). La configuración de aplicación del modelo se encuentra en `classifier_config.json`.

## Capacidades

- Clasificación binaria de frases: determina si una frase pertenece a una cláusula de modificación en términos de servicio.
- Procesamiento de frases individuales como unidad de entrada (no documentos completos).
- Integración con la librería `transformers` y con `text-embeddings-inference` (según los tags del repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Análisis automatizado de términos de servicio: el modelo permite recorrer un documento legal dividido en frases y marcar automáticamente aquellas que constituyen cláusulas de modificación, facilitando la revisión por parte de equipos legales o de cumplimiento.
- Extracción de cláusulas relevantes en pipelines de compliance: integrado como paso de filtrado previo a una revisión humana, reduce el volumen de texto que los analistas deben leer en contratos y condiciones de plataformas.
- Monitorización de cambios en condiciones de servicio: al comparar versiones de un documento, el clasificador ayuda a localizar las secciones que regulan modificaciones unilaterales y a priorizar su revisión.
- Investigación académica sobre análisis de contratos: sirve como componente base o línea de comparación en estudios de clasificación de cláusulas legales, dado su conjunto de datos y métricas publicadas.
- Enriquecimiento de bases de datos legales: etiquetar corpus de términos de servicio para construir índices o datasets anotados sobre prácticas de modificación contractual.
- Prototipado rápido en aplicaciones de legal tech: al ser un modelo pequeño (0,6 GB) y compatible con `transformers`, puede desplegarse en entornos con recursos limitados para validar flujos de clasificación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Métricas publicadas en la model card sobre el conjunto de test (218 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0,959 |
| Precision | 0,927 |
| Recall | 0,864 |
| F1 | 0,894 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (149,6 M de parámetros, repositorio de 0,6 GB), es previsible que quepa en GPUs de consumo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles.
- Cabe en GPU de consumo: probable por tamaño, pero no confirmado en la información proporcionada.
- Opciones de despliegue: `transformers`, `text-embeddings-inference` (según tags) y endpoints compatibles. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `answerdotai/ModernBERT-base` es la referencia natural, pero no se han publicado métricas comparativas en esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kaspar/modification_best_model_modernbert_sentence | 149,6 M | no disponible | Clasificación binaria de frases | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en esta ficha | no disponible | Modelo base encoder | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre frases individuales: no procesa documentos completos ni mantiene contexto entre frases, lo que puede perder información relevante de cláusulas que dependen de oraciones adyacentes.
- Datos de entrenamiento etiquetados por modelos Claude: posible propagación de sesgos o errores de anotación automática, sin validación humana documentada.
- Conjunto de test pequeño (218 ejemplos): las métricas publicadas pueden tener alta varianza y no reflejan necesariamente el rendimiento en dominios distintos.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no especificados: se desconoce si el modelo funciona fuera del inglés u otros idiomas presentes en los datos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación (recall de 0,864 implica que aproximadamente un 13,6 % de las cláusulas positivas podrían no detectarse).
- Sin descargas ni likes: modelo sin validación por parte de la comunidad, lo que reduce la confianza en su robustez en producción.
- No se documentan sesgos conocidos ni caveats adicionales en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Kaspar/modification_best_model_modernbert_sentence
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
