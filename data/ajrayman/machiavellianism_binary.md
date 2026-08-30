# ajrayman/machiavellianism_binary

## Resumen

El modelo `ajrayman/machiavellianism_binary` es un clasificador de texto binario desarrollado por el usuario ajrayman, obtenido mediante fine-tuning de `FacebookAI/roberta-base` sobre un conjunto de datos no especificado. Su propósito es detectar la presencia de maquiavelismo en textos, un rasgo psicológico caracterizado por la manipulación, el cinismo y la búsqueda de beneficio propio. Se trata de un modelo de clasificación de secuencias con arquitectura transformer encoder, de 124,6 millones de parámetros, compatible con la librería `transformers` de Hugging Face.

La relevancia de este modelo radica en su aplicación potencial dentro del análisis de comportamiento y la moderación de contenido, aunque su rendimiento es moderado (accuracy de 0,65 en el conjunto de evaluación) y carece de documentación exhaustiva sobre los datos de entrenamiento. Es un modelo ligero, con licencia MIT, que puede ejecutarse en hardware de consumo, lo que facilita su integración en entornos de investigación y prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (por defecto en RoBERTa-base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (depende del dataset de fine-tuning, no documentado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder preentrenado con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El fine-tuning se realizó sobre un dataset identificado como "None" en la model card, sin más detalles sobre su composición o tamaño. El entrenamiento utilizó una tasa de aprendizaje de 2e-05, batch size de 32, optimizador Adam (betas 0.9/0.999), scheduler lineal con warmup ratio de 0.06 y 8 épocas. No se documenta el uso de técnicas como RLHF o DPO.

La capa de clasificación añade una salida binaria (probablemente dos neuronas con softmax) sobre el token `[CLS]` de RoBERTa. No se mencionan innovaciones técnicas más allá del fine-tuning estándar.

## Capacidades

- Clasificación binaria de texto: asigna una probabilidad de pertenencia a la clase "maquiavelismo" frente a la clase contraria.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para párrafos o documentos cortos.
- Inferencia eficiente al tratarse de un modelo de 124M parámetros, ejecutable en CPU o GPU de gama baja.
- Compatible con el ecosistema Hugging Face: `transformers`, `pipelines`, `text-embeddings-inference` y `endpoints_compatible`.
- No dispone de capacidades de generación de texto, tool calling, agentes o multimodales.

## Casos de uso

- Análisis de texto en redes sociales: detectar patrones de manipulación o comportamiento maquiavélico en publicaciones, comentarios o mensajes, útil para estudios sociológicos o moderación automatizada.
- Investigación psicológica: clasificar respuestas de cuestionarios o entrevistas escritas para identificar rasgos de personalidad maquiavélica, como complemento a escalas psicométricas tradicionales.
- Filtrado de contenido en plataformas colaborativas: marcar mensajes que muestren indicios de engaño o explotación, aunque con la advertencia de su precisión limitada.
- Análisis de correos electrónicos o mensajes internos: en entornos empresariales, como herramienta de apoyo para detectar comunicaciones potencialmente tóxicas o manipuladoras (uso bajo supervisión humana).
- Prototipado de sistemas de detección de rasgos de personalidad: servir como base para experimentos académicos o productos de análisis de texto, gracias a su licencia MIT.
- Evaluación de sesgos en modelos de lenguaje: al ser un clasificador pequeño, puede usarse como caso de estudio para analizar cómo los fine-tunes heredan sesgos del modelo base.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación (sin especificar su tamaño o composición):

| Metrica | Valor |
|---|---|
| Loss | 0.8725 |
| Accuracy | 0.6508 |
| Precision | 0.7318 |
| Recall | 0.4775 |
| F1 | 0.5779 |
| AUC | 0.7111 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE. La tabla de entrenamiento por épocas muestra una mejora progresiva hasta la época 3 (F1 de 0.6702), seguida de un descenso en épocas posteriores, lo que sugiere posible sobreajuste.

## Requisitos de hardware

- VRAM estimada: para inferencia en float32, aproximadamente 500 MB (124M parámetros × 4 bytes). Con cuantización a int8 o fp16, se reduce a ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También funciona en CPU sin problemas para inferencia por lotes pequeños.
- Compatible con hardware de consumo: sí, cabe en cualquier GPU moderna y también en dispositivos con limitaciones de memoria.
- Opciones de despliegue: `transformers` con PyTorch, `pipelines` de Hugging Face, `text-embeddings-inference`, o exportación a ONNX para optimización.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia debería ser del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otras alternativas. El modelo comparte arquitectura con `roberta-base` original, pero no hay datos de rendimiento en tareas de clasificación de personalidad. Existen modelos relacionados publicados por el mismo autor, como `ajrayman/psychopathy_binary` (fine-tune de roberta-large) y `ajrayman/machiavellianism_continuous`, pero no se han encontrado métricas comparables. Se recomienda evaluar directamente sobre el caso de uso específico.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado ("None"), lo que impide conocer su procedencia, tamaño o posibles sesgos. Esto limita la reproducibilidad y la confianza en su generalización.
- Rendimiento moderado: accuracy de 0.65 y F1 de 0.58, con un recall bajo (0.48), lo que indica que el modelo falla en detectar una proporción significativa de casos positivos.
- Posible sobreajuste: la pérdida de validación aumenta en las últimas épocas (de 0.62 a 0.87), sugiriendo que el entrenamiento podría haberse detenido antes.
- Sesgos heredados de RoBERTa-base: el modelo puede reflejar estereotipos o sesgos culturales presentes en los datos de preentrenamiento, especialmente relevantes en tareas de análisis de personalidad.
- Riesgo de alucinación no aplica al ser un clasificador, pero sí puede producir clasificaciones erróneas con alta confianza.
- Uso comercial permitido gracias a la licencia MIT, pero sin garantías de precisión ni soporte del autor.
- El tamaño del repositorio (21.5 GB) es inusualmente grande para 124M parámetros, posiblemente debido a archivos adicionales o versiones duplicadas; se recomienda verificar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: [ajrayman/machiavellianism_binary](https://huggingface.co/ajrayman/machiavellianism_binary)
- Modelo relacionado: [ajrayman/psychopathy_binary](https://huggingface.co/ajrayman/psychopathy_binary)
- Modelo relacionado: [ajrayman/machiavellianism_continuous](https://huggingface.co/ajrayman/machiavellianism_continuous)
- Benchmark MACHIAVELLI (contexto de investigación): [The MACHIAVELLI Benchmark](https://aypan17.github.io/machiavelli/)
- Paper relacionado: [Aligning Machiavellian Agents: Behavior Steering via Test](https://arxiv.org/abs/2511.11551)
