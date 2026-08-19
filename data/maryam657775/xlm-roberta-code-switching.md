# Maryam657775/xlm-roberta-code-switching

## Resumen

El modelo `Maryam657775/xlm-roberta-code-switching` es un ajuste fino de `FacebookAI/xlm-roberta-base` (XLM-RoBERTa base) para la tarea de clasificación de tokens (token-classification), presumiblemente orientado al reconocimiento de cambio de código lingüístico (code-switching). Lo desarrolla el usuario Maryam657775 y se publicó en Hugging Face en agosto de 2026 bajo licencia MIT.

El modelo conserva la arquitectura transformer de XLM-RoBERTa base con 277 millones de parámetros y una ventana de contexto de 512 tokens. Su relevancia radica en que aborda el fenómeno del code-switching, habitual en comunidades multilingües, aunque la información pública disponible es escasa: no se especifica el dataset de entrenamiento, el etiquetado utilizado ni los idiomas concretos cubiertos.

La ficha se basa exclusivamente en los datos declarados en la model card y en la documentación pública de XLM-RoBERTa. Al ser una publicación reciente y con pocas descargas (11), la información disponible es limitada y muchas especificaciones no están publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 277.455.363 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible (el modelo base cubre 100 idiomas, pero el ajuste no especifica cuáles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder de tipo BERT con atención bidireccional, entrenado originalmente por Facebook AI con el objetivo de enmascarado de lenguaje (MLM) sobre 2,5 TB de datos de CommonCrawl filtrados en 100 idiomas. El ajuste fino se realizó con el Trainer de Hugging Face, con una tasa de aprendizaje de 2e-05, batch de 16, optimizador AdamW, scheduler lineal y 5 épocas.

No se dispone de información sobre el dataset de entrenamiento (la model card indica "None dataset"), ni sobre el esquema de etiquetas utilizado, ni sobre el número de tokens de entrenamiento. Tampoco se documentan innovaciones técnicas adicionales más allá del ajuste fino estándar. Las métricas de evaluación muestran una pérdida final de 0,5855 con precisión de 0,7474, recall de 0,5917, F1 de 0,6605 y accuracy de 0,8173.

## Capacidades

- Clasificación de tokens (token-classification) para tareas de reconocimiento de entidades o etiquetado de cambio de código.
- Capacidades multilingües heredadas del modelo base XLM-RoBERTa, que soporta 100 idiomas.
- No se ha documentado soporte para generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente.
- No se ha documentado ningún modo de pensamiento extendido ni capacidades multimodales.

## Casos de uso

- Investigación académica sobre code-switching: el modelo puede emplearse para etiquetar automáticamente corpus multilingües con mezcla de idiomas, facilitando estudios sociolingüísticos o de adquisición del lenguaje.
- Preprocesamiento de datos para ASR (reconocimiento automático del habla): la identificación de segmentos en distintos idiomas dentro de un texto transcrito puede mejorar la selección de modelos de lenguaje acústico.
- Análisis de sentimiento en redes sociales multilingües: el etiquetado de tokens puede ayudar a identificar qué porción de un mensaje pertenece a cada idioma antes de aplicar análisis de sentimiento específico por lengua.
- Sistemas de traducción automática con detección de idioma por segmento: la clasificación de tokens permite segmentar frases mezcladas y enrutar cada fragmento al motor de traducción adecuado.
- Construcción de recursos lingüísticos: el modelo puede servir para anotar automáticamente nuevos corpus de code-switching, reduciendo el esfuerzo de anotación manual.
- Evaluación comparativa de modelos multilingües: dado su tamaño contenido (277M parámetros), es útil como línea base en experimentos que comparan estrategias de ajuste fino para lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de evaluación del propio ajuste fino:

| Metrica | Valor |
|---|---|
| Loss | 0,5855 |
| Precision | 0,7474 |
| Recall | 0,5917 |
| F1 | 0,6605 |
| Accuracy | 0,8173 |

Estos valores corresponden al conjunto de evaluación del entrenamiento y no son comparables con benchmarks públicos sin conocer el dataset exacto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en precisión float32 (277M parámetros × 4 bytes), más overhead de activaciones y atención. Con cuantización a int8, podría reducirse a unos 300-400 MB, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (p. ej., NVIDIA GTX 1650, T4, RTX 3060). Para entrenamiento o ajuste fino adicional, se recomienda al menos 8 GB de VRAM.
- Sí cabe en GPU de consumo: cualquier GPU moderna de NVIDIA o Apple Silicon puede ejecutar el modelo sin problemas.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, lo que permite su uso con vLLM, TGI (Text Generation Inference) y pipelines de token-classification estándar. También puede exportarse a ONNX para inferencia optimizada.
- Latencia y throughput: no se han publicado datos. Para un modelo de 277M parámetros en una GPU T4, se espera una latencia de 10-50 ms por secuencia de 512 tokens, dependiendo del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Maryam657775/xlm-roberta-code-switching | 277M | 512 | MIT | Code-switching, token-classification |
| FacebookAI/xlm-roberta-base | 277M | 512 | MIT | MLM multilingüe, base para fine-tuning |
| bert-base-multilingual-cased | 178M | 512 | Apache-2.0 | MLM multilingüe (104 idiomas) |

El modelo se distingue de su base únicamente por el ajuste fino. No hay información pública que permita compararlo con otros modelos especializados en code-switching, como los basados en mBERT o en arquitecturas específicas para lenguas africanas o indias. La comparativa con el modelo base es la única referencia fiable: el ajuste mejora la precisión sobre la tarea objetivo, pero degrada la cobertura generalista.

## Limitaciones y advertencias

- No se especifica el dataset de entrenamiento, lo que impide evaluar posibles sesgos o la representatividad de los idiomas cubiertos.
- El recall es notablemente inferior a la precisión (0,5917 frente a 0,7474), lo que sugiere que el modelo omite muchos tokens relevantes y puede no ser adecuado para tareas donde la recuperación completa sea crítica.
- La ventana de contexto de 512 tokens limita su uso en documentos largos sin estrategias de ventana deslizante.
- No se documenta el esquema de etiquetas, por lo que integrarlo en un pipeline existente requiere inspeccionar manualmente los IDs de etiquetas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y sin documentación de rendimiento en producción.
- Al ser un ajuste fino de un modelo base de 2020, puede presentar sesgos lingüísticos heredados de XLM-RoBERTa, especialmente en lenguas de bajos recursos.
- No se han publicado resultados de pruebas de robustez frente a entrada ruidosa o dominios no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maryam657775/xlm-roberta-code-switching
- Documentación de XLM-RoBERTa en Transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Código fuente de XLM-RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/src/transformers/models/xlm_roberta/modeling_xlm_roberta.py
- Documentación de XLM-RoBERTa (versión 4.14.1): https://huggingface.co/docs/transformers/v4.14.1/model_doc/xlmroberta
- Referencia de XLM-RoBERTa en PyText: https://pytext.readthedocs.io/en/master/xlm_r.html
