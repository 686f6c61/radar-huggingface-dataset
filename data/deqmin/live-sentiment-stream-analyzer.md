# deqmin/live-sentiment-stream-analyzer

## Resumen

`live-sentiment-stream-analyzer` es una aplicación web desarrollada por deqmin que ofrece una interfaz Gradio para analizar el sentimiento de texto introducido por el usuario. No se trata de un modelo de lenguaje nuevo, sino de una aplicación que utiliza el modelo preentrenado `distilbert-base-uncased-finetuned-sst-2-english` de Hugging Face para clasificar cada muestra como positiva o negativa. La herramienta muestra las puntuaciones de confianza de cada clase, permite configurar un umbral de alerta y mantiene un registro de eventos de sesión exportable a CSV o JSON.

El proyecto está diseñado como una demostración funcional de un pipeline de clasificación de sentimiento con Transformers, desplegable en Hugging Face Spaces mediante un flujo de CI/CD con GitHub Actions. Aporta valor como ejemplo de integración de modelos de NLP en una interfaz interactiva, pero no introduce innovaciones arquitectónicas ni un modelo entrenado desde cero. La información disponible no incluye especificaciones técnicas del modelo subyacente ni datos de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicación Gradio; modelo subyacente: DistilBERT) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo subyacente está entrenado en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (la aplicación usa el pipeline de Transformers; no distribuye pesos propios) |

## Arquitectura y entrenamiento

La aplicación no entrena ningún modelo. El backend de Python invoca el pipeline `text-classification` de Hugging Face Transformers, que carga el modelo `distilbert-base-uncased-finetuned-sst-2-english`. DistilBERT es una versión destilada de BERT con un número reducido de capas, entrenada mediante destilación de conocimiento. El fine-tuning en el conjunto SST-2 (Stanford Sentiment Treebank) la especializa en clasificación binaria de sentimiento.

No se proporcionan datos sobre el proceso de entrenamiento, el número de tokens ni la composición del dataset. La única fuente de datos de entrada es el texto que escribe el usuario en la interfaz; no se admite la carga de datasets ni el procesamiento por lotes. La lógica de la aplicación se limita a ejecutar la clasificación, ordenar las probabilidades, mostrar la clase con mayor confianza y registrar los eventos en memoria.

## Capacidades

- Clasificación binaria de sentimiento (positivo o negativo) sobre texto introducido manualmente.
- Visualización de la probabilidad de confianza asociada a cada clase.
- Configuración de un umbral de confianza y una clase objetivo para activar alertas visuales.
- Registro de eventos de sesión con marca de tiempo y exportación a CSV o JSON.
- Integración con Gradio para ofrecer una interfaz web interactiva.
- Despliegue en Hugging Face Spaces mediante un flujo de CI/CD con GitHub Actions.

No soporta tool calling, razonamiento multi-paso, generación de texto libre, ni capacidades multimodales.

## Casos de uso

- Análisis rápido de comentarios de clientes: un analista puede pegar respuestas de encuestas o reseñas y obtener una clasificación inmediata de sentimiento con su nivel de confianza.
- Monitorización de contenido en redes sociales: la función de alerta por umbral permite detectar automáticamente mensajes con un grado de negatividad predefinido.
- Prototipado de dashboards de opinión: la exportación del registro a CSV permite integrar los resultados en herramientas de análisis posteriores.
- Demostración educativa de NLP: sirve como ejemplo visual de cómo funciona un clasificador de sentimiento basado en DistilBERT y cómo se interpretan las probabilidades.
- Prueba de concepto para despliegue de modelos con Gradio: el proyecto documenta un flujo de verificación y despliegue automático en Hugging Face Spaces mediante GitHub Actions.
- Validación de pipelines de Transformers en entornos web: permite comprobar de forma sencilla el funcionamiento del pipeline `text-classification` en una interfaz interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al tratarse de una aplicación que usa un modelo DistilBERT, se espera que pueda ejecutarse en CPU o en GPU modestas, pero no hay datos oficiales al respecto.
- Opciones de despliegue: Hugging Face Spaces (Gradio), ejecución local con Python y Transformers, o cualquier servidor con entorno Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras aplicaciones o modelos de la misma categoría.

## Limitaciones y advertencias

- Sentimiento binario únicamente (positivo o negativo); no detecta emociones matizadas ni estados neutrales.
- Puede malinterpretar sarcasmo, jerga, idiomas mixtos y fragmentos muy cortos.
- La confianza mostrada es la probabilidad del modelo para la tarea, no una certeza calibrada.
- No se especifica licencia, por lo que el uso comercial no está determinado.
- No hay datos de entrenamiento propios; el comportamiento depende completamente del modelo subyacente.
- La aplicación no admite carga de datasets ni análisis por lotes; solo texto manual.
- El repositorio no tiene descargas ni likes, lo que indica ausencia de validación externa.
- Existe un Space del mismo autor llamado "Live Pointer Movement Analyzer" que es una aplicación diferente; no debe confundirse con este proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/deqmin/live-sentiment-stream-analyzer
- Hugging Face Space: https://huggingface.co/spaces/deqmin/live-sentiment-stream-analyzer
- Página del proyecto en GitHub Pages: https://deqmin.github.io/Task_AI/
