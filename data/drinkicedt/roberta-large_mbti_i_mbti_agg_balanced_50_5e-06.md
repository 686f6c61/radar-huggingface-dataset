# DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_5e-06

## Resumen

`roberta-large_MBTI_I_MBTI_agg_balanced_50_5e-06` es un modelo de clasificación de texto binaria desarrollado por DrinkIcedT, diseñado para predecir la dimensión Introversión (I) frente a Extraversión (E) del indicador de personalidad MBTI a partir de texto libre. Se basa en la arquitectura RoBERTa-large, un encoder Transformer de 24 capas con 355 millones de parámetros, ajustado mediante fine-tuning sobre un dataset agregado con balance de clases 50/50 (de ahí el sufijo `agg_balanced_50`). El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-embeddings-inference para despliegue en endpoints.

La relevancia de este modelo reside en su especialización: en lugar de clasificar los 16 tipos MBTI completos, se centra en una única dimensión binaria, lo que simplifica el problema y permite un ajuste más fino. Según la model card, alcanza un F1 de 0,6764 en el conjunto de evaluación con un umbral óptimo de 0,52. No obstante, la documentación es escasa: el dataset de entrenamiento no está descrito, la licencia no se especifica y no se han publicado resultados de benchmarks externos. La loss de validación aumenta progresivamente hacia el final del entrenamiento (de 2,30 a 3,16), lo que sugiere un posible sobreajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (Transformer encoder, 24 capas, 16 cabezales, hidden size 1024) |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RoBERTa-large es un encoder Transformer de 24 capas con 16 cabezales de atención por capa y 1024 dimensiones ocultas, preentrenado sobre 160 GB de texto (BookCorpus, CC-News, OpenWebText y Stories) con una estrategia de enmascaramiento dinámico. Este modelo concreto se ha ajustado mediante fine-tuning para clasificación binaria de la dimensión I/E del MBTI. La model card indica que fue "entrenado desde cero sobre un dataset desconocido", aunque por el nombre y la arquitectura se trata de un fine-tuning sobre el checkpoint preentrenado de RoBERTa-large.

Los hiperparámetros de entrenamiento documentados incluyen: learning rate de 5e-06, batch size de 16 por dispositivo (64 efectivo con 4 GPUs en configuración multi-GPU), 5 épocas, optimizador AdamW con betas (0,9; 0,999), scheduler lineal con 400 pasos de warmup y semilla 42. El dataset de entrenamiento no está documentado: se desconoce su tamaño, composición, procedencia o método de agregación, más allá del balance 50/50 que sugiere el nombre. El entrenamiento se realizó con Transformers 5.3.0, PyTorch 2.7.1, Datasets 4.8.5 y Tokenizers 0.22.2.

## Capacidades

- Clasificación binaria de texto para la dimensión Introversión/Extraversión del MBTI, devolviendo una probabilidad por clase.
- Procesamiento de textos de hasta 512 tokens, suficiente para párrafos, publicaciones de redes sociales o respuestas de cuestionarios.
- Compatible con el pipeline `text-classification` de transformers para integración directa en aplicaciones Python.
- Compatible con text-embeddings-inference y endpoints de Hugging Face para despliegue en producción.
- Ajuste de umbral de decisión: el modelo reporta un umbral óptimo de 0,52 para maximizar F1, lo que permite calibrar la decisión según la aplicación.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

1. **Selección de personal en RRHH**: clasificar respuestas escritas de candidatos en entrevistas o formularios para estimar su perfil de introversión/extraversión, como complemento a evaluaciones psicométricas formales. El modelo procesa textos de hasta 512 tokens, suficiente para respuestas de extensión media.

2. **Análisis de redes sociales**: procesar publicaciones de Twitter, Reddit o foros para inferir rasgos de personalidad de usuarios a escala, útil en investigación sociológica, estudios de mercado o segmentación de audiencias.

3. **Personalización de experiencias de usuario**: clasificar el estilo comunicativo de un usuario a partir de sus mensajes para adaptar la interfaz, el tono de las notificaciones o las recomendaciones de contenido de una aplicación.

4. **Investigación psicológica y lingüística**: clasificar corpus de texto (diarios, ensayos, transcripciones de entrevistas) para estudios correlacionales entre lenguaje y personalidad, permitiendo análisis cuantitativos sobre grandes volúmenes de datos.

5. **Herramientas de team building**: analizar comunicaciones internas de equipos (Slack, correos, documentos colaborativos) para sugerir dinámicas de trabajo que se adapten a la composición de personalidad del equipo.

6. **Chatbots y asistentes conversacionales**: adaptar el estilo de respuesta de un chatbot según la personalidad inferida del usuario en los primeros mensajes de la conversación, mejorando la percepción de empatía y cercanía.

7. **Moderación y filtrado de contenido**: combinar la clasificación de personalidad con otros clasificadores para enriquecer el perfil de usuario en plataformas sociales, permitiendo personalizar políticas de moderación o visibilidad de contenido.

8. **Análisis de reseñas y opiniones**: clasificar el perfil de personalidad de autores de reseñas de productos o servicios para segmentar el análisis de sentimiento por tipo de personalidad, revelando patrones de satisfacción diferenciados.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos (GLUE, SuperGLUE, MMLU, etc.). Los únicos datos disponibles son los resultados de evaluación durante el entrenamiento, reportados por el autor:

| Metrica | Valor final |
|---|---|
| Loss de validacion | 3,1589 |
| F1 (umbral optimo 0,52) | 0,6764 |
| F1 a umbral fijo 0,5 | 0,6753 |

Evolución del entrenamiento (loss de entrenamiento, loss de validación y F1 por época):

| Training Loss | Epoca | Paso | Validation Loss | F1 | Umbral | F1 a 0,5 |
|---|---|---|---|---|---|---|
| 2,7510 | 0,32 | 200 | 2,7102 | 0,5652 | 0,47 | 0,5597 |
| 2,6593 | 0,63 | 400 | 2,5597 | 0,6090 | 0,44 | 0,5982 |
| 2,4572 | 0,95 | 600 | 2,4102 | 0,6550 | 0,47 | 0,6505 |
| 2,1285 | 1,27 | 800 | 2,3755 | 0,6789 | 0,40 | 0,6636 |
| 2,1074 | 1,59 | 1000 | 2,3205 | 0,6830 | 0,40 | 0,6723 |
| 2,0898 | 1,90 | 1200 | 2,3042 | 0,6787 | 0,43 | 0,6667 |
| 1,8160 | 2,22 | 1400 | 2,4411 | 0,6832 | 0,45 | 0,6791 |
| 1,8229 | 2,54 | 1600 | 2,5352 | 0,6814 | 0,49 | 0,6801 |
| 1,8382 | 2,86 | 1800 | 2,5019 | 0,6858 | 0,29 | 0,6773 |
| 1,6261 | 3,17 | 2000 | 2,8535 | 0,6812 | 0,53 | 0,6761 |
| 1,5940 | 3,49 | 2200 | 2,7930 | 0,6802 | 0,42 | 0,6768 |
| 1,5494 | 3,81 | 2400 | 2,7878 | 0,6800 | 0,40 | 0,6743 |
| 1,3271 | 4,13 | 2600 | 3,1520 | 0,6762 | 0,54 | 0,6732 |
| 1,3006 | 4,44 | 2800 | 3,0345 | 0,6767 | 0,45 | 0,6766 |
| 1,3138 | 4,76 | 3000 | 3,1589 | 0,6764 | 0,52 | 0,6753 |

El mejor F1 observado es 0,6858 en el paso 1800 (época 2,86). A partir de ese punto, la loss de validación aumenta de forma sostenida mientras la loss de entrenamiento sigue descendiendo, lo que indica sobreajuste en las últimas épocas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2-3 GB en FP16 (los pesos ocupan ~710 MB, más activaciones y overhead), ~4-6 GB en FP32.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4070, etc.). En GPU de datacenter, una T4 o A10 es más que suficiente.
- Es un modelo ligero para los estándares actuales: cabe en GPU de consumo sin necesidad de cuantización.
- Opciones de despliegue: transformers (PyTorch) para integración directa, text-embeddings-inference para servir endpoints, y los endpoints compatibles de Hugging Face.
- Latencia estimada: del orden de 50-150 ms por clasificación en GPU moderna para un modelo de 355M parámetros, aunque no se dispone de mediciones oficiales.
- Alternativa en CPU: posible con llama.cpp o equivalentes, aunque con latencias significativamente mayores (del orden de segundos por clasificación).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos sobre el mismo dataset de entrenamiento, por lo que la comparación se limita a características arquitectónicas:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| roberta-large_MBTI_I (este) | 355M | 512 | RoBERTa-large | no disponible | F1 0,6764 en su dataset de evaluación |
| RoBERTa-base | 125M | 512 | RoBERTa-base | MIT | Más ligero, menos capacidad de representación |
| DeBERTa-v3-large | 304M | 512 | DeBERTa-v3 | MIT | Mejor rendimiento en GLUE y SuperGLUE que RoBERTa-large |
| BERT-large | 340M | 512 | BERT | Apache-2.0 | Arquitectura predecesora, superada por RoBERTa en la mayoría de tareas |

Existen variantes del mismo autor con diferente balance de clases: `roberta-large_MBTI_I_MBTI_agg_balanced_75` (balance 75/25) y `roberta-large_MBTI_I_MBTI_agg_balanced_50` (sin sufijo de learning rate), que pueden servir para comparar el efecto del balance de datos en el rendimiento.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado: se desconoce su tamaño, composición, idioma y procedencia, lo que impide evaluar sesgos demográficos o culturales.
- La licencia no está especificada, lo que genera incertidumbre jurídica para uso comercial en producción.
- El F1 de 0,6764 indica un rendimiento moderado: aproximadamente uno de cada tres textos se clasifica incorrectamente, lo que limita su uso en aplicaciones donde el error tenga consecuencias significativas.
- La loss de validación aumenta de forma sostenida desde el paso 1200 (época 1,90), pasando de 2,30 a 3,16 al final del entrenamiento, mientras la loss de entrenamiento desciende de 2,09 a 1,31: señal clara de sobreajuste.
- La clasificación MBTI basada en texto es inherentemente limitada: la personalidad es un constructo multidimensional que no puede inferirse de forma fiable solo a partir del lenguaje escrito, y el propio MBTI carece de validez predictiva robusta según la literatura psicológica.
- La ventana de contexto de 512 tokens limita el análisis a textos cortos; textos más largos requieren truncamiento o estrategias de agregación.
- Los idiomas soportados no están documentados. El modelo base RoBERTa está preentrenado principalmente en inglés, por lo que el rendimiento en otros idiomas es incierto y probablemente degradado.
- El umbral óptimo varía durante el entrenamiento (entre 0,29 y 0,54), lo que sugiere que la calibración de probabilidades no es estable y requiere ajuste por aplicación.
- No hay información sobre el número de ejemplos de entrenamiento ni sobre el método de agregación de datos, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50_5e-06
- Variante con balance 75/25: https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_75
- Variante con balance 50/50 (sin sufijo de learning rate): https://huggingface.co/DrinkIcedT/roberta-large_MBTI_I_MBTI_agg_balanced_50
- Repositorio de RoBERTa original (Facebook AI): https://github.com/facebookresearch/fairseq/tree/main/examples/roberta
- Documentación de RoBERTa-large en Model Database: https://modeldatabase.com/roberta-large.html
