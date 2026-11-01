# fr4nZzz/roberta-hate-speech

## Resumen
`fr4nZzz/roberta-hate-speech` es un clasificador binario de texto en español que estima si un comentario contiene discurso de odio (clase 1) o no (clase 0). Lo desarrolla Francisco Zerpa en el marco de la asignatura Redes Neuronales Profundas de la UCV (2026) y consiste en un fine-tuning completo de `roberta-base-bne`, el modelo RoBERTa entrenado por el Barcelona Supercomputing Center sobre corpus en español. El modelo resuelve una tarea concreta de moderación: priorizar comentarios para revisión humana en comunidades hispanohablantes.

La arquitectura es un transformer encoder de tipo RoBERTa con 124.644.866 parámetros, entrenado con tokenización BPE a nivel de bytes y truncado a 128 tokens. El ajuste se realizó sobre el dataset `piuba-bigdata/contextualized_hate_speech`, compuesto por respuestas de primer nivel en Twitter a noticias de diarios argentinos durante la pandemia de COVID-19, con etiquetas asignadas por seis anotadores nativos.

Su relevancia práctica radica en que ofrece una línea base reproducible y bien documentada para detección de odio en español rioplatense, con métricas desglosadas por clase y un análisis explícito de sus limitaciones. No obstante, el recall en la clase de odio (0,555) es bajo, por lo que debe entenderse como una herramienta de triaje y no como un filtro automático de sanción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base) |
| Parametros totales | 124.644.866 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `PlanTL-GOB-ES/roberta-base-bne`, un RoBERTa base entrenado por el BSC sobre corpus en español. Como los pesos originales fueron retirados del Hub, el autor cargó la copia espejo `PeterPanecillo/PlanTL-GOB-ES-roberta-base-bne-copy`. El fine-tuning fue completo: los 124,6 millones de parámetros son entrenables. Se usó el tokenizer del modelo base (BPE a nivel de bytes), truncado a 128 tokens con padding dinámico por lote, tasa de aprendizaje 2e-5, 2 épocas, batch de 16, semilla 32111550, precisión mixta fp16 y los valores por defecto de `Trainer` (AdamW, decaimiento lineal, sin warmup ni weight decay). La parada se fijó por el mayor F1 macro en validación mediante `load_best_model_at_end`.

El dataset de entrenamiento contiene respuestas de primer nivel en Twitter a noticias de La Nación, Clarín, Infobae, Perfil y Crónica, en español rioplatense, durante un año a partir de marzo de 2020 y con temática COVID-19. Se respetaron las particiones originales y se eliminaron de validación y prueba los textos idénticos a alguno de entrenamiento para evitar inflación de métricas. Tras la limpieza: 36.420 textos en train (15,2 % de odio), 8.578 en validación (15,3 %) y 11.112 en prueba (15,8 %). No se documenta uso de RLHF ni DPO; se trata de aprendizaje supervisado estándar sobre etiquetas humanas.

## Capacidades
- Clasificación binaria de texto en español: discurso de odio (1) frente a no odio (0).
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`.
- Procesamiento de comentarios cortos, típicos de redes sociales, hasta 128 tokens.
- Integración directa con la librería `transformers` de Hugging Face.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al español; no se documenta entrenamiento en otras lenguas.
- No proporciona explicaciones ni justificación de la etiqueta predicha.

## Casos de uso
- Triaje de comentarios en foros y redes: el modelo puntúa cada mensaje y permite ordenar la cola de moderación por probabilidad de odio, de modo que los revisores humanos atiendan primero los casos de mayor riesgo. Es adecuado porque su precisión en la clase positiva (0,709) reduce el ruido en la cola prioritaria.
- Moderación asistida en comunidades de noticias: integrado en un panel de administración, marca comentarios candidatos a revisión. El recall de 0,555 obliga a mantener revisión humana y a no usar el modelo como filtro único.
- Filtrado previo en pipelines de publicación: descartar automáticamente solo los casos de altísima probabilidad y derivar el resto a revisión, reduciendo carga manual sin riesgo de sanciones erróneas masivas.
- Investigación en PLN sobre discurso de odio: sirve como línea base reproducible (semilla, hiperparámetros y particiones documentadas) para comparar nuevas aproximaciones sobre el mismo dataset.
- Análisis de toxicidad en corpus históricos de Twitter en español rioplatense: clasificación por lotes de tuits de 2020 relacionados con COVID-19 para estudios sociológicos o de comunicación.
- Docencia y experimentación: por su tamaño (124,6 M de parámetros) y licencia Apache 2.0, es apto para prácticas de fine-tuning y evaluación en cursos de NLP sin requerir hardware especializado.
- Detección de discurso de odio en herramientas de monitorización de marca: alertar sobre respuestas agresivas a publicaciones corporativas, siempre con revisión humana previa a cualquier acción.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre las particiones de validación y prueba del dataset:

| Regimen | Parametros entrenables | Minutos (T4) | F1 macro validacion | F1 macro prueba | Exactitud prueba |
|---|---|---|---|---|---|
| Baseline (TF-IDF + regresion logistica) | 10.000 | 0,4 | 0,6730 | 0,6762 | 0,8788 |
| Feature extraction (backbone congelado) | 592.130 | 2,4 | 0,6062 | 0,5931 | 0,8506 |
| Fine-tuning completo (este modelo) | 124.644.866 | 6,3 | 0,7940 | 0,7804 | 0,8937 |
| Fine-tuning con tasa excesiva (2e-3) | 124.644.866 | 5,9 | 0,4585 | 0,4571 | 0,8421 |

Desglose por clase en prueba (11.112 textos):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| No odio (0) | 0,920 | 0,957 | 0,938 |
| Odio (1) | 0,709 | 0,555 | 0,623 |

El modelo deja pasar 781 casos de odio (44,5 % de los reales) y marca por error 400 comentarios neutros (4,3 %). Como referencia, predecir siempre "no odio" da exactitud 0,8421 y F1 macro 0,4571.

## Requisitos de hardware
- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 (124,6 M de parámetros) y aproximadamente 0,25 GB en fp16; el pico real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una T4, RTX 3060 o superior ofrece holgura. Para entrenamiento, el autor reporta 6,3 minutos en una T4.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU con latencias aceptables para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI con inferencia por lotes, ONNX Runtime y cuantización dinámica de PyTorch. No se documenta soporte específico en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma explícita; el dato de 6,3 minutos de entrenamiento en T4 para 2 épocas sobre 36.420 ejemplos sugiere un throughput de inferencia alto en GPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fr4nZzz/roberta-hate-speech | 124,6 M | 128 tokens | Clasificacion binaria de odio en es | Apache 2.0 | Hugging Face |
| PlanTL-GOB-ES/roberta-base-bne | 124,6 M | 512 tokens | Modelo base de lenguaje en es | Apache 2.0 (pesos originales retirados del Hub) | Copia espejo en Hugging Face |
| BETO (dccuchile/bert-base-spanish-wwm-cased) | ~110 M | 512 tokens | Modelo base BERT en es | MIT | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | 10.000 | no aplica | Clasificacion binaria de odio en es | no disponible | Reproducible localmente |

La comparación con modelos genéricos de la misma familia debe interpretarse con cautela: este modelo está especializado en una tarea concreta y sus métricas no son trasladables a otros corpus. Frente al baseline TF-IDF, mejora el F1 macro en prueba de 0,6762 a 0,7804, a costa de un mayor coste computacional.

## Limitaciones y advertencias
- Dominio estrecho: entrenado con comentarios cortos en respuesta a noticias argentinas de 2020 sobre COVID-19; puede rendir peor con otras variantes del español, otras plataformas, otros temas o textos largos.
- Sin contexto: el modelo solo ve el comentario, mientras que los anotadores del dataset sí vieron la noticia original; los autores del dataset indican que el contexto ayuda a detectar odio.
- Etiquetas subjetivas: seis anotadores con acuerdo moderado (alfa de Krippendorff de 0,579 para la etiqueta de odio); el modelo aprende ese criterio, incluida la definición de que un insulto no siempre es discurso de odio.
- Recall bajo en la clase de odio (0,555): deja pasar el 44,5 % de los casos reales, lo que desaconseja su uso como filtro automático de sanción.
- Riesgo de falsos positivos: marca como odio el 4,3 % de los comentarios neutros, con especial sensibilidad a signos de exclamación y a frases cortas con entonación intensa.
- Sesgos del modelo base: la tarjeta de `roberta-base-bne` indica que no se midieron sesgos ni toxicidad durante el preentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución; el modelo base y el dataset tienen sus propias condiciones.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos.
- Limitación de longitud: el truncado a 128 tokens descarta información en comentarios largos.
- Advertencia de producción: el uso previsto es la priorización de comentarios para revisión humana, no la sanción o el bloqueo automático de usuarios.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/fr4nZzz/roberta-hate-speech
- Modelo base (copia espejo): https://huggingface.co/PeterPanecillo/PlanTL-GOB-ES-roberta-base-bne-copy
- Modelo base original: https://huggingface.co/PlanTL-GOB-ES/roberta-base-bne
- Dataset: https://huggingface.co/datasets/piuba-bigdata/contextualized_hate_speech
- Paper del dataset: https://arxiv.org/abs/2210.00465
- Referencia MarIA (modelo base): Gutiérrez Fandiño et al. (2022), *MarIA: Spanish Language Models*, Procesamiento del Lenguaje Natural, 68. doi:10.26342/2022-68-3
