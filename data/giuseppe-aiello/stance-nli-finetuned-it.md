# giuseppe-aiello/stance-nli-finetuned-it

## Resumen
El modelo `giuseppe-aiello/stance-nli-finetuned-it` es un clasificador de postura (stance detection) en italiano, desarrollado por Giuseppe Aiello como parte de un proyecto de análisis de opinión política en Instagram. Se basa en el modelo multilingüe `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, un DeBERTa-v3 de 278 millones de parámetros, y se ha ajustado específicamente para detectar si un comentario expresa consenso, disenso o ninguna posición hacia el Gobierno (Meloni/Salvini) o la Oposición (Conte/Schlein), en los temas "Emergencia Seguridad" y "Emergencia Sur de Italia".

La relevancia de este modelo radica en que permite automatizar el análisis de la opinión pública en redes sociales sobre temas políticos candentes, utilizando un enfoque de entailment-as-classification que transforma la detección de postura en una tarea de NLI. Aunque el dataset de entrenamiento es pequeño (400 ejemplos etiquetados manualmente), el fine-tuning mejora significativamente la precisión respecto al modelo base sin ajustar, pasando de un 47% a un 70% de accuracy en el conjunto de test.

El modelo se distribuye con licencia MIT, está diseñado para usarse mediante el pipeline de `transformers` de HuggingFace y está pensado para investigadores y desarrolladores que trabajen con análisis de sentimiento y opinión política en italiano.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (mDeBERTa-v3-base) |
| Parametros totales | 278.811.651 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, un DeBERTa-v3 entrenado para NLI multilingüe con 278 millones de parámetros. La arquitectura DeBERTa-v3 incorpora atención dispersa y una mejora sobre la decodificación posicional, lo que lo hace eficiente para tareas de clasificación de texto. El fine-tuning se realizó cargando el modelo base en `float32` y entrenándolo durante 4 épocas con un batch size de 8, learning rate de 2e-5 y optimizador AdamW. Los datos de entrenamiento consistieron en 400 comentarios de Instagram etiquetados manualmente, que se convirtieron en 1050 pares premisa-hipótesis para la formulación NLI. El entrenamiento se ejecutó en una GPU NVIDIA RTX 4060 Laptop y duró aproximadamente 7 minutos.

La estrategia de clasificación es la siguiente: dado un comentario (premisa) y un target (Gobierno u Oposición), se generan tres hipótesis — "Este comentario expresa consenso hacia {target}", "Este comentario expresa disenso hacia {target}" y "Este comentario no expresa ninguna posición hacia {target}" — y se predice la etiqueta cuyo score de entailment sea más alto. Este enfoque permite reutilizar el pipeline de zero-shot classification de HuggingFace.

## Capacidades
- Detección de postura en italiano: clasifica comentarios en tres clases (consenso, disenso, ninguna posición) hacia un target político.
- Clasificación zero-shot mediante el pipeline `zero-shot-classification` de `transformers`, sin necesidad de entrenar un clasificador específico.
- Especialización en textos de redes sociales, concretamente comentarios de Instagram sobre política italiana.
- Manejo de temas concretos (Emergencia Seguridad y Emergencia Sur de Italia) y de figuras políticas específicas (Meloni, Salvini, Conte, Schlein).
- No incluye generación de texto ni capacidades multilingües; está limitado al italiano.
- No soporta tool calling ni razonamiento multi-paso; es un modelo puramente discriminativo.

## Casos de uso
- Análisis de opinión pública en redes sociales: permite medir el apoyo o rechazo a políticos italianos en comentarios de Instagram, útil para periodistas y analistas políticos.
- Monitoreo de campañas electorales: durante periodos electorales, se puede aplicar a streams de comentarios en tiempo real para evaluar la percepción de los candidatos.
- Investigación en ciencias sociales: los investigadores pueden utilizar el modelo para etiquetar grandes volúmenes de datos cualitativos, reduciendo el esfuerzo de codificación manual.
- Detección de polarización: al identificar comentarios de consenso y disenso, se puede analizar la polarización política en comunidades online.
- Moderación de contenido: aunque no está diseñado para ello, podría adaptarse para filtrar comentarios hostiles o identificar mensajes de apoyo a ciertos grupos, siempre con supervisión humana.
- Validación de hipótesis en estudios de comunicación: el modelo puede servir como herramienta de anotación automática en proyectos que estudien el discurso político en Italia.

## Benchmarks y rendimiento
El autor proporciona resultados en un conjunto de test de 100 ejemplos, comparando el modelo fine-tuned con el modelo base sin ajustar (zero-shot):

| Metrica | Zero-shot (baseline) | Fine-tuned (este modelo) |
|---|---|---|
| Accuracy | 0.470 | 0.700 |
| Macro-F1 | 0.365 | 0.660 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a una tarea específica de clasificación de postura y no a tareas generales de lenguaje.

## Requisitos de hardware
- Con 278,8 millones de parámetros, los pesos en `float32` ocupan aproximadamente 1,1 GB. Para inferencia en `float32`, se recomienda al menos 2 GB de VRAM libre, considerando activaciones y overhead.
- En `float16`, los pesos ocuparían unos 0,6 GB, permitiendo ejecución en GPUs con 1-2 GB de VRAM.
- Cabe en GPUs de consumo como la NVIDIA RTX 4060 (8 GB), RTX 3060 (12 GB) o incluso en tarjetas más antiguas con 4 GB.
- También puede ejecutarse en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: pipeline de `transformers` (Python), exportación a ONNX para inferencia en producción, o uso mediante HuggingFace Inference Endpoints.
- Para despliegue en servidores, puede utilizarse con vLLM o TGI, aunque al ser un modelo de clasificación, la latencia por muestra es baja (del orden de milisegundos en GPU).

## Comparativa con modelos similares
No se dispone de comparaciones directas con otros modelos de stance detection en italiano en la información proporcionada. Sin embargo, se puede comparar con el modelo base sin ajustar:

| Modelo | Parámetros | Contexto | Accuracy (test) | Licencia |
|---|---|---|---|---|
| `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (baseline) | 278M | no disponible | 0.470 | MIT |
| `giuseppe-aiello/stance-nli-finetuned-it` | 278,8M | no disponible | 0.700 | MIT |

Otros modelos como UmBERTo o BERT-it (mencionados en el repositorio del proyecto) podrían ser alternativas, pero no se ofrecen datos comparativos en la documentación disponible.

## Limitaciones y advertencias
- El dataset de entrenamiento es muy reducido (400 ejemplos), lo que puede provocar sobreajuste y una generalización limitada a otros dominios o temas políticos.
- El modelo solo funciona en italiano y está especializado en el contexto político italiano de febrero de 2026; su rendimiento en otros idiomas o contextos no está garantizado.
- La clasificación se limita a tres clases y a targets binarios (Gobierno vs Oposición); no contempla posturas matizadas o neutralidad explícita con más matices.
- Puede presentar sesgos derivados del etiquetado manual, que refleja la interpretación del anotador y no necesariamente la intención real del autor del comentario.
- Riesgo de alucinación no aplica directamente, pero sí de errores de clasificación en comentarios ambiguos o con ironía.
- No se han realizado pruebas de robustez frente a ataques adversariales o variaciones lingüísticas (dialectos, jerga).
- Para uso en producción, se recomienda validar el modelo en un conjunto de datos representativo y considerar un umbral de confianza para evitar falsos positivos.

## Enlaces
- [HuggingFace - modelo](https://huggingface.co/giuseppe-aiello/stance-nli-finetuned-it)
- [Repositorio GitHub del proyecto](https://github.com/giuseppe-aiello/political-stance-detection-it)
- [Paper relacionado en SemEval-2026 (GuysLLM)](https://aclanthology.org/2026.semeval-1.314/)
