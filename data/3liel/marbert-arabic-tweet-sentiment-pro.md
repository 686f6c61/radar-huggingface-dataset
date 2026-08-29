# 3liel/marbert-arabic-tweet-sentiment-pro

## Resumen

El modelo `3liel/marbert-arabic-tweet-sentiment-pro` es un clasificador de sentimiento para tweets en árabe, resultado de un ajuste fino (fine-tuning) del modelo base `UBC-NLP/MARBERTv2` sobre un conjunto de datos no especificado. El autor, identificado como `3liel`, publica este modelo con el objetivo de ofrecer una herramienta de análisis de sentimiento orientada a texto breve y coloquial en árabe, un dominio donde los modelos multilingües generalistas suelen rendir peor.

La arquitectura subyacente es MARBERTv2, un modelo transformer bidireccional basado en BERT, preentrenado específicamente sobre 1.000 millones de tweets en árabe, lo que lo hace especialmente adecuado para el registro dialectal y coloquial de esta lengua. El modelo tiene 162,8 millones de parámetros y se distribuye en formato safetensors, compatible con el ecosistema de Hugging Face Transformers.

La relevancia de este modelo radica en su especialización: en lugar de usar un modelo multilingüe genérico, ofrece una solución compacta y ajustada para la clasificación de sentimiento en árabe, un idioma con múltiples variantes dialectales que suponen un reto para los sistemas de PLN. Sin embargo, la documentación publicada es mínima y no se especifican ni el conjunto de datos de entrenamiento ni la licencia, lo que limita su uso en producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MARBERTv2) |
| Parametros totales | 162.843.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Arabe (dialectal y MSA, por el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MARBERTv2, un transformer bidireccional de tipo BERT preentrenado por el grupo UBC-NLP sobre un corpus de 1.000 millones de tweets en arabe, lo que le confiere una fuerte capacidad para capturar el registro dialectal y coloquial. La capa de clasificacion anade una cabeza de salida para clasificacion de secuencias sobre la representacion del token `[CLS]`.

El ajuste fino se realizo con el Trainer de Hugging Face durante 7 epocas, con una tasa de aprendizaje de 3e-05, un tamano de lote efectivo de 32 (con acumulacion de gradientes de 2 pasos), optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje lineal con 100 pasos de calentamiento y factor de suavizado de etiquetas de 0.1. El conjunto de datos de entrenamiento no se especifica en la model card, aunque los resultados de validacion sugieren que se trata de una tarea de clasificacion de sentimiento con al menos tres clases (positivo, negativo, neutral), dado el comportamiento de la metrica F1.

## Capacidades

- Clasificacion de sentimiento en texto arabe, especialmente orientado a tweets y texto breve de registro coloquial.
- Soporte para clasificacion de secuencias mediante la API de `transformers` con pipeline `text-classification`.
- Capacidad multilingue limitada al arabe (dialectal y MSA), heredada del modelo base MARBERTv2.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder-only de clasificacion.
- No se ha documentado soporte para vision, audio u otras modalidades.

## Casos de uso

- Analisis de sentimiento en redes sociales: el modelo puede procesar tweets en arabe para medir la opinion publica sobre productos, marcas o eventos politicos, aprovechando su entrenamiento sobre texto breve y coloquial.
- Monitorizacion de marca: integrable en pipelines de escucha social para detectar menciones negativas o positivas en tiempo real, con una ventana de contexto suficiente para tweets individuales.
- Moderacion de contenido: puede utilizarse para clasificar comentarios o publicaciones en arabe como positivos, negativos o neutrales, ayudando a priorizar la revision humana.
- Investigacion academica en PLN arabe: util como punto de partida para estudios comparativos sobre analisis de sentimiento en dialectos arabes, dado su origen sobre MARBERTv2.
- Analisis de opiniones de clientes: aplicable a resenas o comentarios en arabe en plataformas de comercio electronico, aunque requiere validacion previa sobre datos de dominio especifico.
- Deteccion de discurso de odio o ciberacoso: aunque no esta entrenado especificamente para ello, su capacidad de clasificacion de sentimiento puede servir como primer filtro en sistemas de moderacion.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion, sin especificar la composicion del mismo:

| Metrica | Valor |
|---|---|
| Loss | 0.9228 |
| Accuracy | 0.7438 |
| F1 | 0.7488 |

La tabla de entrenamiento muestra la evolucion por epocas:

| Epoca | Validation Loss | Accuracy | F1 |
|---|---|---|---|
| 1 | 0.9408 | 0.5710 | 0.4688 |
| 2 | 0.7689 | 0.6728 | 0.6424 |
| 3 | 0.7542 | 0.7284 | 0.7161 |
| 4 | 0.7831 | 0.7654 | 0.7667 |
| 5 | 0.8615 | 0.7623 | 0.7635 |
| 6 | 0.9228 | 0.7438 | 0.7488 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT de 163M parametros, la inferencia en FP32 requiere aproximadamente 650 MB de VRAM, y en FP16 unos 325 MB. Con cuantizacion INT8, el consumo se reduce a unos 170 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia, incluyendo GPUs de consumo como la NVIDIA GTX 1650 o superiores. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3060, RTX 3080, etc.).
- Cabe en GPUs de consumo: si, es un modelo ligero que puede ejecutarse en practicamente cualquier GPU moderna, incluso en CPU con un rendimiento aceptable para inferencia por lotes.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), y puede exportarse a ONNX o TensorRT para optimizacion. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo encoder-only.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia orientativa, un BERT-base en una GPU moderna (RTX 3090) procesa del orden de 1.000-2.000 secuencias por segundo con tamano de lote 32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy | F1 | Licencia |
|---|---|---|---|---|---|
| 3liel/marbert-arabic-tweet-sentiment-pro | 163M | no disponible | 0.7438 | 0.7488 | no disponible |
| UBC-NLP/MARBERTv2 (base) | 163M | 512 tokens | no aplica (preentrenamiento) | no aplica | no disponible |
| iMeshal/arabic-sentiment-classifier-marbert | 163M | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para una comparativa exhaustiva con otros modelos de clasificacion de sentimiento en arabe. El modelo base MARBERTv2 es la referencia principal, y existen otros ajustes del mismo base en Hugging Face, pero sin datos publicados de rendimiento comparables.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no se especifica, lo que impide evaluar posibles sesgos de dominio o de distribucion de clases.
- La licencia no esta declarada, por lo que no se puede garantizar su uso comercial sin riesgo legal.
- La model card indica "More information needed" en las secciones de descripcion, usos previstos y limitaciones, lo que refleja una documentacion incompleta.
- El rendimiento (accuracy 0.74, F1 0.75) es moderado y puede no ser suficiente para aplicaciones de produccion sin un ajuste adicional sobre datos del dominio objetivo.
- Al ser un modelo encoder-only, no es adecuado para tareas generativas ni para razonamiento complejo.
- El modelo esta entrenado para tweets en arabe; su rendimiento en otros tipos de texto (articulos, documentos formales) puede degradarse.
- No se han publicado analisis de sesgos ni de robustez ante ataques adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3liel/marbert-arabic-tweet-sentiment-pro
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Repositorio GitHub de MARBERT: https://github.com/UBC-NLP/marbert
- Articulo relacionado (Spam and Sentiment Detection in Arabic Tweets Using MARBERT): https://arxiv.org/abs/2606.25495v1
