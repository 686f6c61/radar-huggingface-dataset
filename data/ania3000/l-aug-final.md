# ania3000/l-aug-final

## Resumen

l-aug-final es un modelo de clasificación de tokens (token classification) publicado en Hugging Face por el usuario ania3000. Se trata de un fine-tuning del modelo base AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs, que a su vez deriva de la familia OSSBERT, variantes de BERT entrenadas sobre el corpus OSCAR. El modelo resuelve una tarea concreta de etiquetado a nivel de token, presumiblemente lematización, a juzgar por las métricas declaradas en la model card (lemma accuracy y sentence accuracy sobre lemas).

Con 177.961.100 parámetros y un tamaño de repositorio de 0,7 GB en formato safetensors, se enmarca en la categoría de modelos BERT base multilingües. La relevancia de esta ficha es limitada: se trata de un experimento de fine-tuning con cero descargas y cero likes en el momento de la consulta, sin model card completada (el propio README indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento). Aun así, los resultados de validación reportados son útiles para evaluar la viabilidad de la tarea y del pipeline de entrenamiento.

La licencia Apache 2.0 permite uso comercial y modificación, pero la ausencia de documentación sobre el dataset de entrenamiento, los idiomas objetivo y las limitaciones reales hace que sea un modelo poco recomendable para producción sin una evaluación propia adicional. La fecha de creación indicada (noviembre de 2026) y la actualización posterior sugieren un artefacto de experimentación más que un modelo publicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuning de AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs |
| Parametros totales | 177.961.100 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, heredada del modelo base multilingüe OSSBERT entrenado sobre OSCAR. El fine-tuning se realizó con la librería Transformers 4.57.3, PyTorch 2.14.1+cu130, Datasets 4.0.0 y Tokenizers 0.22.2, usando el Trainer de Hugging Face. Los hiperparámetros declarados son: learning rate 5e-5, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 25 épocas configuradas. El entrenamiento registró 18 épocas con 796 pasos por época, lo que equivale a aproximadamente 14.328 pasos totales, es decir, un dataset de entrenamiento del orden de 6.400 ejemplos (796 × 8).

La tarea parece ser lematización a nivel de token, dado que las métricas de validación son lemma accuracy y sentence accuracy (lemmas). El dataset de entrenamiento no está documentado en la model card ("unknown dataset"). No se declara ningún proceso de RLHF, DPO ni innovación técnica adicional; es un fine-tuning supervisado convencional sobre token classification.

## Capacidades

- Clasificación de tokens (token classification), presumiblemente lematización de palabras.
- Predicción de etiquetas a nivel de token con una precisión de lema declarada del 98,3712 % sobre el conjunto de evaluación.
- Precisión a nivel de frase (todos los lemas correctos en una frase) del 80,6699 %.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponibles explícitamente, aunque el modelo base es multilingüe.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Lematización de corpus lingüísticos: el modelo puede etiquetar cada token de un texto con su lema correspondiente, útil para normalizar vocabulario en pipelines de PLN, índices de búsqueda o análisis morfológico. La precisión de lema del 98,37 % y la precisión de frase del 80,67 % indican un rendimiento alto a nivel de token pero con errores acumulados a nivel de frase.
- Preprocesamiento para sistemas de recuperación de información: la lematización reduce la variabilidad morfológica (plurales, conjugaciones) y mejora la coincidencia entre consultas y documentos en buscadores internos o motores de búsqueda semántica.
- Análisis morfológico en investigación lingüística: permite anotar corpus con lemas de forma automatizada, sustituyendo anotaciones manuales en estudios de frecuencia léxica o sintaxis.
- Normalización de texto para pipelines de NLP downstream: alimentar un lematizador previo a clasificadores de texto, análisis de sentimiento o extracción de entidades para reducir la dispersión del vocabulario.
- Construcción de diccionarios y tesauros: agrupar variantes flexivas de una misma palabra para generar entradas de diccionario o mapas de sinónimos.
- Prototipado de tareas de etiquetado de secuencias: al ser un BERT base con licencia Apache 2.0, sirve como punto de partida para fine-tunear otras tareas de token classification (NER, POS tagging) con un coste computacional bajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (validacion, epoca 18) | 0,1440 |
| Lemma accuracy | 98,3712 % |
| Sentence accuracy (lemmas) | 80,6699 % |

Evolución del entrenamiento (selección de épocas):

| Epoca | Validation loss | Lemma accuracy | Sentence accuracy (lemmas) |
|---|---|---|---|
| 1 | 0,2654 | 95,4442 % | 54,6411 % |
| 3 | 0,1440 | 97,7099 % | 73,3014 % |
| 8 | 0,1229 | 98,3651 % | 80,3828 % |
| 11 | 0,1312 | 98,4202 % | 81,0526 % |
| 14 | 0,1317 | 98,4324 % | 81,1483 % |
| 18 | 0,1440 | 98,3712 % | 80,6699 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 177,96 M de parámetros en fp32, los pesos ocupan aproximadamente 0,71 GB; en fp16, unos 0,36 GB. Con activaciones y overhead de runtime, se puede ejecutar con menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, incluidas GTX 1650 o similares.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime, TGI para servir modelos de clasificación, y exportación a formatos ligeros. llama.cpp y Ollama no son aplicables porque el modelo no es generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| l-aug-final | 177,96 M | no disponible | Token classification (lematizacion) | apache-2.0 | Hugging Face |
| AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs | no disponible (BERT base multilingue) | no disponible | Modelo base multilingue | no disponible | Hugging Face |
| BERT base multilingue (google-bert/bert-base-multilingual-cased) | 177,85 M | 512 tokens | Masked LM, base para fine-tuning | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos con otros lematizadores o modelos de token classification en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", lo que impide evaluar la cobertura lingüística, el dominio y la representatividad de los datos.
- Idiomas objetivo no declarados: aunque el modelo base es multilingüe, no se especifica sobre qué idiomas se entrenó ni se evaluó el fine-tuning.
- Precisión a nivel de frase del 80,67 %: aunque la precisión de lema por token es alta (98,37 %), aproximadamente una de cada cinco frases contiene al menos un lema incorrecto, lo que limita su uso en pipelines que requieren anotación perfecta.
- Modelo de clasificación de tokens, no generativo: no sirve para generación de texto, razonamiento, código ni diálogo.
- Sin datos de benchmarks comparativos ni evaluación externa: los resultados son auto-declarados por el autor y no verificables.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación por terceros.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base puede tener condiciones adicionales no verificadas en esta ficha.
- Riesgo de sesgo: no evaluado; al derivar de OSCAR, puede heredar sesgos del corpus web.
- Riesgo de alucinación: no aplicable en sentido generativo, pero puede producir etiquetas incorrectas en tokens fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ania3000/l-aug-final
- Modelo base: https://huggingface.co/AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs
