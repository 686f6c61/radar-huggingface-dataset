# ajrayman/Assertiveness_binary

## Resumen

El modelo `Assertiveness_binary` es un clasificador binario de texto desarrollado por el usuario `ajrayman` y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `roberta-base` de Facebook AI, diseñado para determinar si un texto dado es asertivo o no. La tarea se enmarca dentro del análisis de comunicación interpersonal, un área con aplicaciones en coaching, psicología, atención al cliente y análisis de redes sociales.

El modelo cuenta con 124,6 millones de parámetros y una arquitectura transformer encoder (RoBERTa), con una ventana de contexto de 512 tokens. Fue entrenado sobre un conjunto de datos no especificado en la documentación oficial, con hiperparámetros que incluyen una tasa de aprendizaje de 2e-5, ocho épocas y un tamaño de lote de 32. Los resultados de evaluación muestran una precisión (accuracy) del 63,14 %, una F1 de 0,6526 y un AUC de 0,666, lo que indica un rendimiento moderado, por debajo de lo que suele esperarse para aplicaciones de producción. La licencia es MIT, lo que facilita su uso comercial y académico.

A pesar de sus limitaciones, el modelo es un ejemplo de cómo adaptar un modelo de lenguaje preentrenado a una tarea específica de clasificación con recursos computacionales modestos. Su tamaño reducido permite ejecutarlo en CPU o GPUs de gama baja, lo que lo hace accesible para prototipos y experimentos. Sin embargo, la falta de documentación sobre el dataset y las métricas de rendimiento limitan su aplicabilidad en entornos críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, dado el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa (Robustly optimized BERT approach), un transformer encoder con atención bidireccional. RoBERTa-base tiene 12 capas, 768 unidades ocultas y 12 cabezas de atención, con un total de 124,6 millones de parámetros. El ajuste fino se realizó sobre una capa de clasificación binaria (dos etiquetas: asertivo / no asertivo) añadida sobre la representación del token `[CLS]`.

El entrenamiento se llevó a cabo durante 8 épocas con un tamaño de lote de 32, una tasa de aprendizaje de 2e-5 con scheduler lineal y un warmup del 6 %. Se utilizó el optimizador Adam con betas (0.9, 0.999). El conjunto de datos de entrenamiento no está documentado en la model card; se indica simplemente "None dataset". No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar. Los resultados de validación muestran una pérdida final de 0.7298, con una precisión de 0.6164, recall de 0.6933 y F1 de 0.6526. Los valores de AUC (0.666) sugieren una discriminación débil entre clases.

## Capacidades

- Clasificación binaria de asertividad: el modelo asigna una probabilidad a dos clases (asertivo o no asertivo) para un texto de entrada.
- Procesamiento de texto en inglés (asumido por el modelo base, aunque no se declara explícitamente).
- Soporte de secuencias de hasta 512 tokens, adecuado para frases y párrafos cortos.
- No dispone de capacidades de generación de texto, tool calling, razonamiento multi-paso, visión o audio.
- No se ha documentado soporte para lenguajes distintos del inglés ni para tareas adicionales.

## Casos de uso

- Análisis de comunicación en atención al cliente: el modelo puede clasificar automáticamente si las respuestas de un agente son asertivas o no, ayudando a detectar patrones de comunicación poco efectivos en tiempo real. Su baja latencia permite integrarlo en flujos de análisis de tickets.
- Evaluación de contenido en plataformas de coaching y formación: se puede utilizar para analizar ejercicios de role-play o simulaciones de conversación, proporcionando retroalimentación objetiva sobre el nivel de asertividad de los participantes.
- Investigación en psicología social: los investigadores pueden emplearlo para etiquetar grandes volúmenes de interacciones (foros, encuestas abiertas, redes sociales) con el fin de estudiar la relación entre asertividad y otros constructos.
- Filtrado de mensajes en aplicaciones de mensajería: integrarlo como un pre-filtro para sugerir reformulaciones más asertivas en aplicaciones de correo electrónico o chat corporativo, aunque su precisión limitada (63 %) requeriría supervisión humana.
- Análisis de reseñas o comentarios en línea: clasificar si un comentario es asertivo o agresivo, lo que puede servir para moderar comunidades o detectar discursos hostiles.
- Prototipado rápido en NLP: dado su tamaño y licencia MIT, es útil como punto de partida para experimentos de clasificación de estilos comunicativos, permitiendo comparar con otros modelos de mayor tamaño.

## Benchmarks y rendimiento

La model card oficial no incluye una sección de benchmarks comparativos (el campo `results` está vacío). Los únicos datos disponibles son los obtenidos durante el entrenamiento y la evaluación del propio modelo, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Pérdida (loss) | 0.7298 |
| Accuracy | 0.6314 |
| Precision | 0.6164 |
| Recall | 0.6933 |
| F1 | 0.6526 |
| AUC | 0.6660 |

Estos valores provienen de la validación del autor. No se han publicado comparaciones con otros modelos de clasificación de asertividad ni con el modelo base sin ajustar. No se dispone de resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE para este ajuste específico.

## Requisitos de hardware

- El modelo tiene 124,6 millones de parámetros; en precisión fp32 ocupa aproximadamente 500 MB de memoria. En cuantización de 8 bits (sin datos oficiales, pero estimable) podría reducirse a unos 130 MB.
- Puede ejecutarse en CPU sin problemas para inferencia en lote, con una latencia de unos pocos milisegundos por secuencia corta.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, etc.). No se requiere GPU de gama alta.
- Opciones de despliegue: se puede servir con la librería Transformers de Hugging Face (Python), exportar a ONNX para inferencia en producción, o usar herramientas como FastAPI para crear un endpoint REST.
- No se ha probado con vLLM, TGI u otros servidores de alto rendimiento, pero al ser un modelo encoder pequeño, se puede adaptar fácilmente.
- El throughput estimado en una GPU moderna (por ejemplo, RTX 3090) sería de miles de inferencias por segundo, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos de clasificación de asertividad. Como referencia, se puede comparar con el modelo base `roberta-base` sin ajustar, que no está entrenado para esta tarea y tendría un rendimiento aleatorio (accuracy ~50 %). Tampoco hay datos de modelos alternativos en la literatura. Por tanto, no es posible realizar una comparativa cuantitativa fiable. Se sugiere que el usuario pruebe el modelo contra sus propios datos de referencia para evaluar su idoneidad.

## Limitaciones y advertencias

- La precisión (accuracy) del 63 % es baja para uso en producción sin supervisión humana; puede generar falsos positivos y negativos con facilidad.
- El conjunto de datos de entrenamiento no está documentado, lo que impide conocer su composición, tamaño o posibles sesgos. Esto compromete la reproducibilidad y la generalización.
- No se especifican los idiomas soportados; dado que se basa en RoBERTa (entrenado principalmente con texto en inglés), su rendimiento en otros idiomas será probablemente deficiente.
- La métrica AUC de 0.666 indica una capacidad de discriminación débil, cercana a aleatoria (0.5).
- No se han publicado análisis de sesgos o comportamientos en casos límite (textos con ironía, sarcasmo o lenguaje informal).
- El repositorio tiene un tamaño de 12.5 GB, inusualmente grande para un modelo de 125 M de parámetros; puede deberse a archivos adicionales no relacionados con los pesos, pero conviene verificar antes de descargar.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte técnico.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ajrayman/Assertiveness_binary)
- [Organización Assertive AI en GitHub](https://github.com/Assertive-AI) (no directamente relacionada, pero puede contener contexto adicional)
