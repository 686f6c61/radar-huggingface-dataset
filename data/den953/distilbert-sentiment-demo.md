# Den953/distilbert-sentiment-demo

## Resumen

`Den953/distilbert-sentiment-demo` es un modelo de clasificación de sentimiento binario (positivo o negativo) desarrollado por Den953 como parte de un laboratorio educativo de MLOps. Está basado en `distilbert-base-uncased`, una versión destilada de BERT, y ha sido fine-tuneado en el dataset `cornell-movie-review-data/rotten_tomatoes`, compuesto por críticas cortas de películas en inglés.

El modelo resuelve el problema de análisis de sentimiento en textos breves, con una arquitectura encoder-only de tipo Transformer que contiene 66.955.010 parámetros. Su ventana de contexto es de 512 tokens, aunque durante el entrenamiento se utilizó una longitud máxima de 128 tokens. Licenciado bajo Apache 2.0, está disponible en formato `safetensors` y `ONNX`, y se puede desplegar mediante el pipeline de `transformers` o con `text-embeddings-inference`.

Su relevancia radica en ser un ejemplo práctico y ligero de fine-tuning de un modelo Transformer con Hugging Face, adecuado para prototipos, entornos con recursos limitados y demostraciones educativas. Aunque no está pensado para producción sin reentrenamiento, ilustra el flujo completo de entrenamiento, evaluación y despliegue de un clasificador de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrenado con max length 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura DistilBERT, un Transformer encoder-only que reduce el tamaño del BERT original mediante destilación de conocimiento. DistilBERT conserva el embedding de 768 dimensiones y 12 cabezas de atención, pero usa 6 capas en lugar de 12, lo que reduce significativamente el número de parámetros manteniendo un rendimiento cercano al de BERT. Esta característica lo hace especialmente eficiente para inferencia en CPU.

El entrenamiento se realizó sobre el dataset `rotten_tomatoes`, con 8.530 ejemplos de entrenamiento y 1.066 de test. Los hiperparámetros declarados son: 1 época, learning rate 2e-5, batch size 16, weight decay 0.01 y longitud máxima de 128 tokens con padding dinámico. Todo el proceso se ejecutó en CPU (AMD Ryzen con 12 hilos), sin uso de GPU, lo que explica el número reducido de épocas. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Clasificación binaria de sentimiento en críticas de películas en inglés, con etiquetas `NEGATIVE` y `POSITIVE`.
- Inferencia mediante el pipeline `text-classification` de Hugging Face, con soporte de truncamiento para textos largos.
- Versión ONNX disponible para despliegue optimizado con ONNX Runtime.
- Compatible con `text-embeddings-inference` y con Hugging Face Inference Endpoints, según los tags del repositorio.
- No genera texto, no soporta tool calling, ni razonamiento multi-step, ni capacidades de visión o audio.

## Casos de uso

- Análisis de reseñas de películas en inglés: plataformas de streaming y agregadores de críticas pueden clasificar automáticamente cada reseña como positiva o negativa para ordenar o filtrar recomendaciones. El modelo es adecuado por su rapidez y bajo coste computacional.
- Monitorización de redes sociales sobre estrenos: se puede aplicar a tweets o comentarios en inglés relacionados con películas para medir la recepción del público en tiempo real. Su tamaño reducido permite procesar grandes volúmenes en CPU.
- Filtrado de comentarios en foros de cine: ayuda a moderar comunidades detectando automáticamente opiniones negativas o positivas, facilitando la gestión de hilos y la detección de críticas destacadas.
- Prototipo educativo en MLOps: sirve como ejemplo completo de fine-tuning con Hugging Face, incluyendo evaluación, exportación a ONNX y despliegue en un Space de Gradio. Es ideal para cursos y laboratorios que enseñan el ciclo de vida de un modelo.
- Integración en sistemas de recomendación: se puede utilizar para ponderar críticas y ajustar las recomendaciones de contenido audiovisual según el sentimiento expresado por los usuarios.
- Análisis de feedback en inglés sobre contenido audiovisual: aplicable a encuestas o formularios con respuestas cortas, permitiendo clasificar rápidamente la satisfacción de los usuarios sin necesidad de revisar cada respuesta manualmente.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el split de test del dataset `rotten_tomatoes` (1.066 ejemplos):

| Métrica | Valor |
|---|---|
| Accuracy | 0.8415 |
| Loss | 0.3908 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 268 MB, y en FP16 unos 134 MB. La VRAM total necesaria depende del tamaño del batch y de la longitud de los textos; para una sola predicción, es suficiente una GPU con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 3050 o superiores. También funciona correctamente en CPU.
- ¿Cabe en consumer GPU? Sí, es un modelo muy ligero que se ejecuta sin problemas en GPUs de gama baja o en CPU.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, Hugging Face Inference Endpoints y `text-embeddings-inference`. No es compatible con llama.cpp, ya que se trata de un modelo encoder y no autoregresivo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se indican características generales de alternativas de la misma categoría, basadas en conocimiento técnico estándar:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Den953/distilbert-sentiment-demo | 66.955.010 | 512 tokens | Apache 2.0 | Accuracy 0.8415 en rotten_tomatoes |
| distilbert-base-uncased | ~66M | 512 tokens | Apache 2.0 | no disponible |
| cardiffnlp/twitter-roberta-base-sentiment | ~125M | 512 tokens | MIT | no disponible |

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos presentes en las críticas de Rotten Tomatoes, que pueden reflejar prejuicios culturales, de género o de raza.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede emitir predicciones incorrectas en textos ambiguos o fuera del dominio de críticas de cine.
- Limitaciones de contexto: la ventana máxima es de 512 tokens, y el modelo fue entrenado con 128 tokens; los textos más largos se truncan y el rendimiento puede degradarse.
- Limitaciones de idioma: solo está entrenado para inglés; no funciona en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de Rotten Tomatoes puede tener términos de uso propios que deben revisarse antes de un despliegue comercial.
- Caveat para producción: es un modelo de demostración, entrenado durante una sola época en CPU. No se recomienda su uso en producción sin un reentrenamiento más completo y una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Den953/distilbert-sentiment-demo
- Demo Gradio: https://huggingface.co/spaces/Den953/sentiment-analysis-distilbert
- Dataset Rotten Tomatoes: https://huggingface.co/datasets/cornell-movie-review-data/rotten_tomatoes
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT: https://arxiv.org/abs/1910.09700
