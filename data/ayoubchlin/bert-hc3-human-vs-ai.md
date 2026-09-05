# AyoubChLin/bert-hc3-human-vs-ai

## Resumen

El modelo AyoubChLin/bert-hc3-human-vs-ai es un clasificador de texto binario desarrollado por AyoubChLin que distingue entre texto escrito por humanos y texto generado por inteligencia artificial. Se basa en la arquitectura BERT-base de Google (google-bert/bert-base-uncased) y ha sido fine-tuneado sobre el dataset Hello-SimpleAI/HC3, un corpus de comparación entre respuestas humanas y respuestas de ChatGPT. El modelo aborda el problema de la detección de contenido sintético, un reto creciente en ámbitos como la moderación de contenidos, la verificación académica o el control de calidad editorial. Con 109.483.778 parámetros y un pipeline de clasificación de texto, es un modelo ligero que puede ejecutarse en CPU o en GPU de bajo consumo. La licencia es CC-BY-SA-4.0 y el idioma principal es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder-only) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos completos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-uncased, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, que suma un total de 109.483.778 parámetros. El fine-tuning se realizó sobre el dataset Hello-SimpleAI/HC3, que contiene pares de preguntas con respuestas humanas y respuestas generadas por ChatGPT. Según la model card, las particiones de entrenamiento, validación y prueba se aislaron por pregunta para evitar fugas de información entre conjuntos. No se indica el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado clásico de clasificación de texto. No hay innovaciones técnicas destacables más allá del fine-tuning estándar de un modelo BERT preentrenado.

## Capacidades

- Clasificación binaria de texto en dos etiquetas: 0 para humano y 1 para generado por IA.
- Funciona como pipeline de text-classification con la librería transformers.
- Solo soporta inglés, según la model card.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio).
- Compatible con el endpoint de Hugging Face y con text-embeddings-inference según los tags del repositorio.

## Casos de uso

- Moderación de contenidos en foros: el modelo puede clasificar automáticamente publicaciones sospechosas de ser generadas por IA y derivarlas a revisión humana.
- Verificación de trabajos académicos: permite detectar fragmentos redactados por ChatGPT en ensayos o tareas, como apoyo a herramientas antiplagio.
- Auditoría de reseñas de productos: ayuda a identificar reseñas sintéticas generadas en masa, protegiendo la fiabilidad de plataformas de comercio electrónico.
- Control de calidad en edición digital: en medios o agencias, puede filtrar borradores generados por IA antes de su publicación.
- Investigación en lingüística computacional: sirve para analizar diferencias estilísticas entre texto humano y sintético en corpus académicos.
- Detección de spam en redes sociales: clasifica comentarios automatizados generados por IA en campañas de desinformación o spam.
- Herramientas de transparencia en plataformas: integrado en un servicio de análisis, puede etiquetar contenido generado por IA para informar a los usuarios.

## Benchmarks y rendimiento

Según la model card del autor, las métricas obtenidas en el conjunto de test mantenido son las siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0.0170 |
| Accuracy | 0.9951 |
| Precision | 0.9921 |
| Recall | 0.9981 |
| F1 | 0.9951 |
| ROC-AUC | 0.9998 |

No se han publicado comparaciones con otros modelos de detección de texto IA en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 109.483.778 parámetros; en fp32 ocupa aproximadamente 440 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendada: no requiere GPU dedicada; una RTX serie 20, 30 o 40, o una A100, funcionan sin problema. Para inferencia por lotes, una Tesla T4 o superior es suficiente.
- Puede ejecutarse en CPU con buena latencia para clasificación de textos cortos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TensorFlow, y el endpoint de Hugging Face (text-classification). También es compatible con text-embeddings-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

En la información proporcionada no se incluyen datos de benchmarks comparativos con otros modelos de detección de texto IA. Existen alternativas en Hugging Face como Hello-SimpleAI/chatgpt-detector-roberta o openai-community/roberta-base-openai-detector, pero no se dispone de sus especificaciones ni resultados en esta ficha.

## Limitaciones y advertencias

- El dataset HC3 refleja salidas tempranas de ChatGPT y dominios principalmente en inglés, por lo que el modelo puede degradarse en textos de otros dominios o generados por modelos más recientes.
- La model card advierte explícitamente que el detector no es prueba de autoría y no debe usarse como único criterio para decisiones consecuentes.
- Riesgo de falsos positivos y falsos negativos, especialmente en texto humano muy formal o texto de IA muy corregido.
- Solo soporta inglés; no es aplicable a otros idiomas sin reentrenamiento.
- La licencia CC-BY-SA-4.0 exige compartir las obras derivadas bajo la misma licencia; esto debe tenerse en cuenta en integraciones comerciales.
- No se han documentado sesgos específicos, pero al estar entrenado en un corpus limitado, es probable que presente sesgos hacia los estilos presentes en HC3.

## Enlaces

- HuggingFace: https://huggingface.co/AyoubChLin/bert-hc3-human-vs-ai
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Perfil del autor: https://huggingface.co/AyoubChLin
