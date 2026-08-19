# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed3407

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B y se ha entrenado específicamente sobre el corpus lener_br, un conjunto de datos brasileño para NER. El adaptador forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) y representa una ejecución con semilla fija (seed 3407).

El modelo resuelve la tarea de extracción de entidades mediante generación estructurada: en lugar de clasificar token a token, genera una salida JSON restringida con las etiquetas y los tokens correspondientes. Esta aproximación permite un control estricto del formato de salida y facilita la integración en pipelines de procesamiento de lenguaje natural. Su relevancia radica en ofrecer una alternativa ligera (0.8B de parámetros base) y eficiente para NER en portugués, con resultados prometedores en el corpus de evaluación.

El adaptador está diseñado para investigación y experimentación controlada, no para uso en producción de alto riesgo. La inferencia canónica se realiza con vLLM a temperatura 0 y con un esquema de JSON restringido (`labels_and_tokens`), lo que garantiza una alta validez estructural de las salidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (modelo base transformer) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 0.8B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (entrenado en BF16, pero no se especifican cuantizaciones para inferencia) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA (safetensors, probablemente; el repositorio contiene el adaptador) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se acopla al modelo base Qwen/Qwen3.5-0.8B, un transformer de 0.8 mil millones de parámetros. El entrenamiento se realizó en precisión BF16 con la técnica LoRA, lo que permite ajustar el modelo de forma eficiente sin modificar todos los pesos. El adaptador se entrenó específicamente para la tarea de NER generativa en portugués, utilizando el dataset lener_br.

El régimen de entrenamiento se denomina "specific" dentro de la matriz de investigación, y la selección del checkpoint se basó en la métrica F1 end-to-end sobre el conjunto de validación, sin usar el conjunto de test para la selección. La inferencia canónica emplea vLLM con temperatura 0 y un esquema de generación JSON restringido (`labels_and_tokens`), lo que garantiza que las salidas sean estructuralmente válidas. La política para salidas inválidas es devolver una predicción vacía en la puntuación end-to-end.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El adaptador se publica junto con artefactos de reproducibilidad en el directorio `research/` del repositorio, incluyendo predicciones congeladas, métricas, manifiestos y hashes.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués, con soporte para el esquema de anotación del corpus lener_br.
- Generación estructurada: produce salidas en formato JSON restringido con etiquetas y tokens, lo que facilita el parseo automático.
- Alta validez estructural de las salidas (0.9986 en el conjunto de test), lo que reduce errores de formato.
- Inferencia determinista a temperatura 0, adecuada para entornos de evaluación y comparación.
- Integración con vLLM para inferencia de alto rendimiento.
- Compatible con la librería PEFT para cargar el adaptador sobre el modelo base exacto.

## Casos de uso

- Investigación académica en NER para portugués: el adaptador puede utilizarse para reproducir experimentos, comparar métricas y estudiar el comportamiento de modelos generativos en tareas de extracción de entidades.
- Evaluación de pipelines de NER: al ofrecer salidas JSON estructuradas, es útil para probar sistemas de post-procesado y validación de esquemas.
- Extracción de entidades en textos jurídicos brasileños: el corpus lener_br incluye dominios como legislación y documentos legales, por lo que el modelo puede aplicarse a la identificación de entidades en este tipo de contenido.
- Análisis de noticias y artículos periodísticos en portugués: permite extraer personas, organizaciones, lugares y otras entidades para tareas de indexación o resumen.
- Construcción de bases de conocimiento: el modelo puede alimentar sistemas de extracción de información que requieran entidades etiquetadas de forma consistente.
- Prototipado de asistentes de búsqueda semántica: las entidades extraídas pueden usarse para mejorar la recuperación de información en corpus en portugués.

## Benchmarks y rendimiento

El autor proporciona resultados sobre el conjunto de test de lener_br para esta ejecución concreta (seed 3407). Estos resultados corresponden a los splits congelados y no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0.9030 | 0.8971 | 0.9001 | 0.9986 |

No se han publicado comparaciones con otros modelos en la información disponible. La incertidumbre entre semillas requiere completar la matriz de tres semillas para una evaluación más robusta.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA sobre un modelo de 0.8B, la inferencia es viable en GPUs de consumo. El modelo base en BF16 ocupa aproximadamente 1.6 GB de VRAM, más el adaptador, por lo que una GPU con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) sería suficiente.
- Para entrenamiento, se requiere hardware con soporte BF16 (por ejemplo, RTX 3090, RTX 4090, A100, etc.).
- La inferencia canónica está optimizada para vLLM, que puede ejecutarse en GPUs consumer y también en entornos cloud.
- Alternativas de despliegue: vLLM (recomendado), PEFT para cargar el adaptador en entornos Python, y potencialmente llama.cpp u Ollama si se convierte el modelo a GGUF (no documentado).
- La latencia y el throughput no están especificados, pero dado el pequeño tamaño del modelo, se espera una inferencia rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos de NER para portugués. El autor menciona que los resultados no deben interpretarse como evidencia de rendimiento general. Como referencia, existen alternativas como GLiNER (modelo ligero y generalista para NER) o modelos LSTM-CRF clásicos entrenados sobre lener_br, pero no se han realizado comparaciones directas con este adaptador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no garantiza la corrección del contenido.
- El modelo no ha sido validado para decisiones de alto riesgo ni para uso autónomo en producción.
- Los esquemas de anotación de diferentes corpus pueden variar, lo que limita la transferibilidad a otros dominios.
- El solapamiento de texto entre conjuntos de entrenamiento y evaluación puede afectar las estimaciones de rendimiento.
- La licencia del modelo no está especificada, por lo que se debe contactar con el autor antes de un uso comercial.
- Los resultados reportados corresponden a una única semilla y a splits congelados; la variabilidad entre semillas no ha sido evaluada completamente.
- El adaptador requiere cargarse sobre la revisión exacta del modelo base indicada en el repositorio para reproducir los resultados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed3407)
- [Repositorio del dataset lener_br](https://github.com/peluz/lener-br)
- [GLiNER (modelo alternativo de NER)](https://github.com/urchade/GLiNER)
