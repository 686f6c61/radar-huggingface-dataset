# MuneK/wrime-emotion-modernbert-model

## Resumen

El modelo `MuneK/wrime-emotion-modernbert-model` es un clasificador multietiqueta de intensidad emocional para texto en japones, desarrollado por MuneK (Muneaki Kanno) y publicado en Hugging Face. Se trata de un modelo de regresion multitarea que predice simultaneamente la intensidad de ocho emociones (joy, sadness, anticipation, surprise, anger, fear, disgust y trust) sobre una escala normalizada de 0 a 1, siguiendo el marco teorico de las ocho emociones basicas de Plutchik.

El modelo se construye sobre el encoder `sbintuitions/modernbert-ja-310m`, un transformer de tipo ModernBERT adaptado al japones, al que se le anade una cabeza de regresion lineal con activacion sigmoide sobre el token `[CLS]`. Se entrena con el dataset WRIME, que contiene aproximadamente 35.000 muestras de texto japones con anotaciones subjetivas y objetivas de intensidad emocional.

Su relevancia actual radica en que aborda un problema poco cubierto en la NLP japonesa: la deteccion de emociones compuestas y su intensidad relativa, en lugar de la clasificacion discreta de una unica emocion dominante. Esto lo hace util para analisis de sentimiento fino, monitorizacion de opiniones y aplicaciones de salud mental o moderacion de contenido en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-ja) con cabeza de regresion lineal multitarea y activacion sigmoide |
| Parametros totales | Aproximadamente 310M (heredados de `sbintuitions/modernbert-ja-310m`); no se especifica el total exacto con la cabeza |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (segun el ejemplo de tokenizacion de la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (`ja`) unicamente |
| Licencia | MIT (modelo); dataset WRIME bajo CC BY-NC-ND 4.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch); no se indica safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only basada en ModernBERT-ja de 310M parametros. Sobre la representacion del token `[CLS]` de la ultima capa se aplica dropout (0,3) y una capa lineal que proyecta la dimension oculta a 8 salidas, seguidas de una sigmoide que normaliza cada intensidad al rango 0-1. La normalizacion se realiza contra el maximo teorico de la escala original 0-3, preservando las diferencias relativas de intensidad entre emociones.

El entrenamiento se lleva a cabo con el dataset WRIME (aproximadamente 35.000 muestras), que combina anotaciones subjetivas (la emocion que siente el escritor) y objetivas (la emocion que percibe un tercero). La funcion de perdida reportada es de 0,005, aunque no se especifica si corresponde a MSE, MAE u otra metrica, ni el numero de epochs, la composicion exacta del split o si se aplicaron tecnicas de aumento de datos. No se menciona el uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo encoder de clasificacion.

## Capacidades

- Prediccion simultanea de la intensidad de ocho emociones (joy, sadness, anticipation, surprise, anger, fear, disgust, trust) en una escala continua de 0 a 1.
- Deteccion de emociones compuestas: permite identificar textos en los que coexisten varias emociones con intensidad alta.
- Clasificacion de emocion dominante derivada de las intensidades (accuracy reportada de 0,8044 sobre 2.500 muestras).
- Analisis de texto en japones con contexto de hasta 512 tokens.
- No soporta tool calling ni function calling (es un modelo de clasificacion, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al japones.

## Casos de uso

- Analisis de sentimiento fino en resenas de productos japoneses: el modelo permite cuantificar no solo si una resena es positiva o negativa, sino la mezcla de emociones (por ejemplo, anticipacion alta con miedo moderado ante un lanzamiento), lo que ayuda a priorizar incidencias.
- Monitorizacion de redes sociales y foros en japones: integrado en un pipeline de streaming, permite detectar picos de ira o miedo en conversaciones publicas y activar alertas tempranas para equipos de comunicacion o moderacion.
- Investigacion en psicologia y ciencias sociales: el modelo proporciona etiquetas continuas de intensidad emocional sobre corpus japoneses, facilitando estudios longitudinales sobre el estado emocional de poblaciones a partir de texto.
- Atencion al cliente automatizada: en un sistema de ticketing, las intensidades de anger y disgust pueden usarse para enrutar conversaciones a agentes humanos con prioridad alta, complementando un clasificador de intencion.
- Analisis de salud mental y bienestar: como componente de triaje (nunca como diagnostico), permite identificar textos con alta sadness o fear en plataformas de apoyo entre iguales y derivar a recursos humanos.
- Moderacion de contenido en comunidades japonesas: combinado con reglas de negocio, las intensidades de disgust y anger ayudan a priorizar la revision de comentarios potencialmente toxicos.
- Analisis de opinion publica sobre productos o eventos: agregando las ocho dimensiones sobre grandes volumenes de texto se obtienen perfiles emocionales comparables entre periodos o segmentos de usuarios.

## Benchmarks y rendimiento

Datos reportados en la model card sobre el conjunto de evaluacion (2.500 muestras):

| Metrica | Valor |
|---|---|
| Accuracy de emocion dominante | 0,8044 |
| Macro precision | 0,7547 |
| Macro recall | 0,7799 |
| Macro F1 | 0,7504 |
| Weighted precision | 0,8403 |
| Weighted recall | 0,8044 |
| Weighted F1 | 0,8091 |
| Balanced accuracy (media) | 0,9148 (std 0,0436) |
| MCC (media) | 0,8754 (std 0,0511) |
| AUC-ROC (media) | 0,9906 (std 0,0056) |

Rendimiento por emocion (clasificacion de emocion dominante):

| Emocion | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| joy | 0,9611 | 0,7453 | 0,8395 | 895 |
| sadness | 0,9176 | 0,7091 | 0,8000 | 440 |
| anticipation | 0,7655 | 0,9028 | 0,8285 | 535 |
| surprise | 0,7529 | 0,8777 | 0,8105 | 368 |
| anger | 0,9333 | 0,7000 | 0,8000 | 20 |
| fear | 0,5399 | 0,9085 | 0,6773 | 164 |
| disgust | 0,5421 | 0,8406 | 0,6591 | 69 |
| trust | 0,6250 | 0,5556 | 0,5882 | 9 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB (coincide con el tamano del repositorio); en FP16 alrededor de 0,65 GB; en INT8 alrededor de 0,35 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para cargas moderadas.
- Cabe en practicamente cualquier GPU consumer, incluidas GTX 1650 o superiores con al menos 2 GB de VRAM.
- Opciones de despliegue: PyTorch nativo con `transformers`; al ser un modelo encoder con pesos `pytorch_model.bin` y clase personalizada, no es directamente compatible con vLLM, llama.cpp u Ollama sin conversion previa. Es posible exportarlo a ONNX o TorchScript para servir con TGI u otros runtimes de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (310M) se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuneK/wrime-emotion-modernbert-model | ~310M (base) | 512 | Regresion de 8 intensidades emocionales en japones | MIT (modelo) | Hugging Face |
| Modelos basados en BERT-ja para WRIME | No disponible | No disponible | Clasificacion de emocion en japones | Variable | No disponible |
| Clasificadores multilingues de emocion (p. ej. basados en XLM-R) | No disponible | No disponible | Clasificacion emocional multilingue | Variable | No disponible |

No se dispone de datos comparativos publicados con alternativas concretas en la informacion proporcionada. La comparativa detallada con modelos equivalentes queda como no disponible.

## Limitaciones y advertencias

- Solo soporta texto en japones; el rendimiento en otros idiomas no esta garantizado ni evaluado.
- El modelo se entrena con WRIME, un dataset anotado por un numero limitado de anotadores japoneses; puede heredar sesgos culturales y demograficos de esa anotacion.
- Riesgo de alucinacion no aplica en sentido generativo, pero las intensidades predichas pueden ser poco fiables en textos ironicos, sarcasticos o con emociones muy sutiles.
- El soporte para `trust` (9 muestras) y `anger` (20 muestras) es muy bajo, lo que explica sus F1 mas bajos (0,5882 y 0,8000 respectivamente); las predicciones para estas clases deben interpretarse con cautela.
- La licencia del modelo es MIT, pero el dataset WRIME subyacente es CC BY-NC-ND 4.0; el uso comercial del modelo entrenado con ese dataset requiere una revision legal especifica, ya que la licencia del dataset podria imponer restricciones adicionales.
- El modelo requiere definir manualmente la clase `MultiEmotionIntensityClassifier` y cargar los pesos con `torch.load`; no se integra de forma nativa en `AutoModelForSequenceClassification`.
- La longitud de contexto efectiva es de 512 tokens; textos mas largos se truncan, lo que puede perder informacion emocional relevante.
- No se han publicado evaluaciones de robustez frente a texto adversarial, dominios fuera de WRIME (por ejemplo, lenguaje coloquial de redes sociales) ni calibracion de las intensidades.
- No debe usarse como herramienta de diagnostico clinico ni para decisiones automatizadas de alto impacto sobre personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuneK/wrime-emotion-modernbert-model
- Modelo base ModernBERT-ja 310M: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Coleccion ModernBERT-ja: https://huggingface.co/collections/sbintuitions/modernbert-ja-67b68fe891132877cf67aa0a
- Repositorio del dataset WRIME: https://github.com/ids-cv/wrime
- Paper WRIME (Kajiwara et al., NAACL 2021): https://aclanthology.org/2021.naacl-main.169/
- Licencia CC BY-NC-ND 4.0 del dataset: https://creativecommons.org/licenses/by-nc-nd/4.0/
- Licencia MIT del modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m/blob/main/LICENSE
