# AyoubChLin/distilbert-hc3-human-vs-ai

## Resumen

Este modelo es un clasificador binario de secuencias basado en DistilBERT, desarrollado por AyoubChLin, que distingue entre respuestas escritas por humanos y respuestas generadas por IA. Se entrenó mediante fine-tuning completo sobre la configuración `all` en inglés del dataset Hello-SimpleAI/HC3, utilizando únicamente el texto de las respuestas. Resuelve el problema de la detección de texto generado por IA, un área de creciente relevancia en moderación de contenidos, integridad académica y verificación de autoría.

La arquitectura es DistilBertForSequenceClassification, con 66.955.010 parámetros entrenables y una longitud máxima de entrada de 512 tokens. DistilBERT es un encoder-only transformer destilado de BERT, con un 40% menos de parámetros pero conservando gran parte de la comprensión del lenguaje. El modelo está pensado para su uso en inglés y su salida son dos etiquetas: `HUMAN` y `AI_GENERATED`.

Es relevante ahora porque la detección fiable de texto sintético se ha convertido en una necesidad práctica en múltiples sectores, aunque el autor advierte de que su salida debe interpretarse como una puntuación de similitud y no como una prueba definitiva de autoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForSequenceClassification (encoder-only transformer destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura encoder-only de tipo transformer destilada del modelo BERT-base-uncased. DistilBERT conserva un 97% de la capacidad de comprensión del lenguaje de BERT con un 40% menos de parámetros y una inferencia más rápida. El modelo resultante es DistilBertForSequenceClassification, con 6 capas de transformer, una dimensión oculta de 768 y 12 cabezas de atención.

El entrenamiento consistió en un fine-tuning completo (no LoRA ni PEFT) sobre el dataset Hello-SimpleAI/HC3, configuración `all`, que contiene respuestas humanas y respuestas generadas por ChatGPT temprano para preguntas de diversos dominios. El número de tokens de entrenamiento no se especifica en la información disponible. La pipeline de datos aísla las preguntas originales de HC3 entre los splits de entrenamiento, validación y prueba antes del balanceo, de modo que las respuestas derivadas de la misma pregunta no pueden aparecer en más de un split. Esta técnica evita la fuga de datos entre conjuntos. No se aplicaron técnicas de RLHF ni DPO, ya que se trata de una tarea de clasificación supervisada.

## Capacidades

- Clasificación binaria de texto para distinguir entre respuestas humanas y respuestas generadas por IA (patrones de ChatGPT temprano según HC3).
- Salida con dos etiquetas: `HUMAN` y `AI_GENERATED`, con probabilidades por clase.
- Procesamiento de pasajes de texto de hasta 512 tokens, truncando automáticamente entradas más largas.
- Funciona únicamente con texto en inglés.
- Integración directa con Hugging Face Transformers para inferencia simple y por lotes.
- No genera texto, ni razona de forma autónoma, ni soporta tool calling, function calling, agentes o multi-step reasoning.
- No es multilingüe: solo soporta inglés.
- No soporta entrada de visión, audio ni otros formatos multimodales.

## Casos de uso

1. **Detección de texto generado por IA en entornos académicos**: El modelo clasifica redacciones o respuestas de estudiantes para identificar posibles usos de ChatGPT. Es adecuado por su alta precisión (F1 de 0.9936) en el corpus HC3, que contiene respuestas humanas y de ChatGPT sobre preguntas de diversos dominios.

2. **Moderación de contenidos en plataformas**: Puede integrarse en pipelines de moderación para marcar comentarios o publicaciones sospechosas de ser generadas por IA, lo que ayuda a filtrar spam y contenido sintético.

3. **Verificación de autoría en periodismo**: Permite comprobar si un artículo o comunicado fue redactado por un humano o por una IA, como parte de un proceso de control de calidad en redacciones.

4. **Análisis de redes sociales**: Sirve para analizar grandes volúmenes de publicaciones y estimar la proporción de contenido generado por IA en un corpus, útil para estudios sobre desinformación y propagación de contenido sintético.

5. **Investigación en NLP**: Funciona como modelo baseline para experimentos sobre detección de texto sintético, permitiendo comparar enfoques de clasificación en el dataset HC3.

6. **Auditoría de respuestas en sistemas de IA**: Puede evaluar si las respuestas de un chatbot parecen generadas por IA o humanas, ayudando a calibrar el comportamiento del sistema y a detectar respuestas demasiado "artificiales".

7. **Detección de reseñas falsas en e-commerce**: Identifica reseñas de productos que podrían estar generadas automáticamente por IA, como parte de un sistema de control de calidad en plataformas de venta.

## Benchmarks y rendimiento

Los resultados siguientes corresponden al split de prueba de HC3 (configuración `all`), reportados por el autor en la model card. Son datos declarados y no verificados de forma independiente.

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Clasificación binaria de texto | HC3 (all) | test | Accuracy | 0.993592 |
| Clasificación binaria de texto | HC3 (all) | test | Precisión (AI_GENERATED) | 0.989533 |
| Clasificación binaria de texto | HC3 (all) | test | Recall (AI_GENERATED) | 0.997738 |
| Clasificación binaria de texto | HC3 (all) | test | F1 (AI_GENERATED) | 0.993619 |
| Clasificación binaria de texto | HC3 (all) | test | ROC AUC | 0.999862 |

Adicionalmente, el autor reporta una pérdida de test de 0.017504 sobre un conjunto balanceado de 5.306 ejemplos (2.653 humanos y 2.653 generados por IA):

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| HUMAN | 0.9977 | 0.9894 | 0.9936 | 2.653 |
| AI_GENERATED | 0.9895 | 0.9977 | 0.9936 | 2.653 |
| Media macro | 0.9936 | 0.9936 | 0.9936 | 5.306 |
| Media ponderada | 0.9936 | 0.9936 | 0.9936 | 5.306 |

Matriz de confusión (filas = etiquetas reales, columnas = predicciones):

| | Predicho HUMAN | Predicho AI_GENERATED |
|---|---|---|
| Verdadero HUMAN | 2.625 | 28 |
| Verdadero AI_GENERATED | 6 | 2.647 |

Estos resultados corresponden exclusivamente al split de prueba de HC3 y no deben generalizarse a modelos de lenguaje más recientes, texto editado, otros idiomas o dominios no relacionados.

## Requisitos de hardware

- VRAM estimada: ~268 MB en FP32, ~134 MB en FP16 y ~67 MB en INT8. Cabe en cualquier GPU con más de 512 MB de VRAM.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1050 o superior, Apple Silicon, etc.). También funciona sin GPU en CPUs modernas.
- Compatible con GPUs de consumo: sí, cualquier GPU doméstica es suficiente.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime y Text Embeddings Inference (TEI). El modelo está marcado como `endpoints_compatible`, lo que indica compatibilidad con endpoints de Hugging Face.
- vLLM, llama.cpp y Ollama: no aplicables, ya que son herramientas orientadas a modelos generativos de tipo decoder y este es un clasificador encoder-only.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría en la información proporcionada. El modelo es un fine-tuning completo de `distilbert/distilbert-base-uncased`, y no se han publicado benchmarks comparativos con otros detectores de texto humano vs IA en la model card ni en los resultados de búsqueda web. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo mide similitud con los patrones de escritura humana y de ChatGPT temprano representados en HC3; su salida es una puntuación del modelo, no una prueba de autoría.
- No debe usarse de forma aislada para calificaciones, disciplina, contratación, moderación o acusaciones de uso de IA, según advierte el propio autor.
- Los resultados reportados corresponden exclusivamente al split de prueba de HC3; no deben generalizarse a modelos de lenguaje más recientes, texto editado, otros idiomas o dominios no relacionados.
- Solo soporta inglés; no funciona con otros idiomas.
- La longitud máxima de entrada es de 512 tokens; los textos más largos se truncan, lo que puede perder información relevante.
- La licencia CC BY-SA 4.0 permite uso comercial, pero los derivados deben compartirse bajo la misma licencia. Es necesario verificar este requisito en aplicaciones comerciales.
- El dataset HC3 puede introducir sesgos, ya que contiene respuestas de un conjunto específico de preguntas y dominios, con un sesgo hacia ChatGPT temprano.
- Riesgo de errores: la matriz de confusión muestra 28 falsos negativos y 6 falsos positivos sobre 5.306 ejemplos; la precisión no es perfecta.
- No es un detector de texto generado por IA de propósito general; se limita a patrones de ChatGPT temprano y texto en inglés.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/AyoubChLin/distilbert-hc3-human-vs-ai
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Perfil del autor: https://huggingface.co/AyoubChLin
- Proyecto relacionado (GitHub): https://github.com/UsmanAhmed98/human-vs-ai-text-detection
