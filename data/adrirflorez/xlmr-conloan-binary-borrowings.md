# adrirflorez/xlmr-conloan-binary-borrowings

## Resumen

El modelo `adrirflorez/xlmr-conloan-binary-borrowings` es un modelo de clasificación de tokens (token-classification) basado en XLM-RoBERTa, desarrollado por adrirflorez. Está diseñado para la detección binaria de préstamos lingüísticos (borrowings) en el contexto del dataset ConLoan, un corpus contrastivo multilingüe que contiene frases con y sin préstamos en diez idiomas. El modelo resuelve la tarea de identificar si un token concreto es un préstamo o no, lo que resulta relevante para la lingüística computacional y el procesamiento del lenguaje natural multilingüe.

Con 277.454.594 parámetros, corresponde a la arquitectura XLM-RoBERTa base, un transformer encoder-only preentrenado en 100 idiomas. El modelo ha sido fine-tuneado para la tarea específica de detección de préstamos, probablemente sobre el dataset ConLoan. La ventana de contexto está limitada a 512 tokens, propia de XLM-R base. Aunque la model card no proporciona detalles sobre el entrenamiento, el repositorio y el paper asociado indican que la tarea es desafiante incluso para modelos grandes, con puntuaciones F inferiores a 0,5 en LLMs.

La relevancia de este modelo radica en su especialización en un fenómeno lingüístico poco explorado en NLP, y su disponibilidad pública permite a investigadores y desarrolladores experimentar con la detección de préstamos en múltiples idiomas. Sin embargo, la documentación es muy limitada, por lo que gran parte de las especificaciones deben inferirse de la arquitectura base y del contexto del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder-only) |
| Parametros totales | 277.454.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (inferido de XLM-R base) |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente fp32) |
| Idiomas soportados | no disponible (XLM-R base soporta 100 idiomas; el fine-tuning probablemente cubre los 10 idiomas de ConLoan: chino, frances, aleman, griego, islandes, italiano, kurdo norteño, portugues, ruso y español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder-only preentrenado con masked language modeling en 100 idiomas. La arquitectura consta de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 277M parámetros. La capa de clasificación de tokens añade una cabeza lineal sobre las representaciones contextuales de cada token para predecir si es un préstamo o no.

No se dispone de información detallada sobre el proceso de fine-tuning: no se especifican los datos exactos de entrenamiento, el número de épocas, la tasa de aprendizaje ni el régimen de precisión. Dado el contexto del dataset ConLoan, es plausible que el entrenamiento se haya realizado sobre las diez lenguas del corpus, con ejemplos contrastivos de frases con y sin préstamos. No hay evidencia de uso de RLHF o DPO; se trata de un fine-tuning supervisado estándar para clasificación de tokens.

## Capacidades

- Detección binaria de préstamos lingüísticos: identifica si un token es un préstamo o no, a nivel de token.
- Procesamiento multilingüe: al estar basado en XLM-R, puede procesar textos en los 100 idiomas del preentrenamiento, aunque el fine-tuning puede haber reducido su eficacia en idiomas no incluidos en ConLoan.
- Clasificación de secuencias cortas: adecuado para frases o segmentos de hasta 512 tokens.
- Integración con pipelines de transformers: compatible con la librería `transformers` y con `endpoints_compatible`, lo que facilita su despliegue en entornos de inferencia.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder-only.

## Casos de uso

- Investigación en lingüística computacional: el modelo puede utilizarse para estudiar la distribución de préstamos en corpus multilingües, permitiendo a los investigadores cuantificar la influencia léxica entre lenguas.
- Análisis de contacto lingüístico: en sociolingüística, ayuda a identificar fenómenos de préstamo en textos reales, por ejemplo en redes sociales o foros, donde los préstamos son frecuentes.
- Preprocesamiento para otros sistemas de NLP: la detección de préstamos puede servir como paso previo para normalización de texto, traducción automática o análisis de sentimiento, donde los préstamos pueden confundir a los modelos.
- Evaluación de robustez de modelos multilingües: al ser una tarea desafiante, puede usarse como benchmark para medir la capacidad de modelos más grandes de comprender fenómenos léxicos complejos.
- Desarrollo de herramientas educativas: aplicaciones de aprendizaje de idiomas que necesiten señalar palabras extranjeras en textos para estudiantes.
- Análisis de contenido en medios: identificación de anglicismos u otros préstamos en noticias o publicaciones, útil para estudios de estilo o políticas lingüísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El paper asociado al dataset ConLoan ("Language Models Are Borrowing-Blind: A Multilingual Evaluation of Loanword Detection") indica que la tarea es difícil para LLMs, con una puntuación F media inferior a 0,5, pero no proporciona métricas concretas para este modelo en particular. No se dispone de comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 277M parámetros. En fp32, el peso ocupa aproximadamente 1,1 GB, por lo que se necesitan al menos 2 GB de VRAM para inferencia con un batch pequeño. Con cuantización a int8, la huella se reduce a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, o GPUs de datacenter como T4 o A10. No requiere hardware especializado.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante la librería `transformers` con pipelines. También es compatible con `endpoints_compatible`.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la inferencia en CPU es viable para uso interactivo, y en GPU es muy rápida (del orden de milisegundos por frase).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adrirflorez/xlmr-conloan-binary-borrowings | 277M | 512 | Deteccion binaria de prestamos | no disponible | Hugging Face |
| arodriguezf/xlmr-binary-borrowings | no disponible | no disponible | Deteccion binaria de prestamos | no disponible | Hugging Face |
| arodriguezf/xlmr-multi-borrowings-conloan | no disponible | no disponible | Deteccion multiclase de prestamos | no disponible | Hugging Face |

No se dispone de información detallada sobre los modelos alternativos de arodriguezf, pero parecen ser variantes del mismo enfoque (XLM-R fine-tuneado sobre ConLoan). No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Al ser un modelo fine-tuneado sobre un dataset concreto, su rendimiento puede degradarse en dominios o idiomas no representados en ConLoan.
- Riesgo de alucinación: al ser un modelo encoder-only, no genera texto, por lo que el riesgo de alucinación es nulo en ese sentido. Sin embargo, puede producir falsos positivos o negativos en la clasificación de tokens.
- Limitaciones de contexto: la ventana de 512 tokens restringe su uso a frases o párrafos cortos; no es adecuado para documentos largos.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- La documentación es muy escasa: no se detallan los hiperparámetros de entrenamiento, el split de datos ni el procedimiento de evaluación, lo que dificulta la reproducibilidad.
- El modelo puede no estar optimizado para todos los idiomas de XLM-R; el fine-tuning probablemente se centró en los diez idiomas de ConLoan, por lo que su rendimiento en otros idiomas puede ser inferior.

## Enlaces

- Hugging Face: https://huggingface.co/adrirflorez/xlmr-conloan-binary-borrowings
- Modelo similar (arodriguezf/xlmr-binary-borrowings): https://huggingface.co/arodriguezf/xlmr-binary-borrowings
- Modelo similar (arodriguezf/xlmr-multi-borrowings-conloan): https://huggingface.co/arodriguezf/xlmr-multi-borrowings-conloan
- Paper "Language Models Are Borrowing-Blind: A Multilingual Evaluation of Loanword Detection": https://arxiv.org/html/2510.26254v1
- Repositorio del dataset ConLoan: https://github.com/ZurichNLP/ConLoan
- Documentación de XLM-R (fairseq): https://github.com/facebookresearch/fairseq/blob/main/examples/xlmr/README.md
