# manasrpandya/goemotions-student

## Resumen

goemotions-student es un modelo de clasificación de texto multietiqueta especializado en la detección de emociones en inglés. Se trata de un destilado de `distilroberta-base` entrenado mediante destilación de conocimiento a partir de dos profesores `roberta-large` (con alpha 0.5 y temperatura 2) combinada con las etiquetas doradas del dataset GoEmotions de Google Research. Lo publica el usuario manasrpandya en HuggingFace bajo licencia MIT.

El modelo resuelve el problema de la clasificación de emociones fina: dado un texto en inglés, predice una o varias de las etiquetas emocionales del corpus GoEmotions mediante una cabeza de clasificación con activación sigmoide (multietiqueta, no mutuamente excluyente). Con 82,1 millones de parámetros y un repositorio de 0,3 GB, está pensado para entornos con recursos limitados donde un `roberta-large` resultaría demasiado costoso.

Su relevancia radica en que ofrece un compromiso entre el rendimiento de los profesores grandes y el coste de un estudiante pequeño, con umbrales por etiqueta ya ajustados en validación y métricas publicadas (macro-F1 de 0,534 en test). Es un modelo de nicho, con 42 descargas y sin likes en el momento de la consulta, orientado a experimentación y a pipelines de análisis de sentimiento y emoción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, destilado de distilroberta-base) con cabeza de clasificación multietiqueta |
| Parametros totales | 82.139.932 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (distilroberta-base soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; existe una variante ONNX del mismo autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un estudiante `distilroberta-base` (arquitectura RoBERTa de 6 capas, 768 dimensiones ocultas, aproximadamente 82 millones de parámetros) sobre el que se añade una cabeza de clasificación lineal para las etiquetas de emoción de GoEmotions. La salida es multietiqueta: se aplica sigmoide sobre los logits divididos por una temperatura de 0,720 y se comparan con umbrales por etiqueta ajustados en el conjunto de validación.

El entrenamiento combina destilación de conocimiento desde dos profesores `roberta-large` (con alpha 0,5 y temperatura 2) junto con las etiquetas doradas del dataset `google-research-datasets/go_emotions`. No se especifica en la model card el número de tokens de entrenamiento ni detalles sobre el dataset más allá de su procedencia. Los pesos publicados son la versión PyTorch de la variante ONNX `goemotions-distil-onnx` del mismo autor.

## Capacidades

- Clasificación de texto multietiqueta: predice una o varias emociones por texto de entrada.
- Detección de emociones según el esquema de etiquetas de GoEmotions (incluye una agrupación tipo Ekman evaluada con macro-F1 de 0,646).
- Procesamiento de texto en inglés exclusivamente.
- Inferencia ligera: 82 millones de parámetros permiten ejecución en CPU y GPU de gama baja.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento y emoción en redes sociales: clasificación de comentarios y publicaciones en inglés con múltiples emociones simultáneas, aprovechando la naturaleza multietiqueta del modelo y sus umbrales ya calibrados.
- Moderación de comunidades: detección de emociones negativas (ira, disgusto) en foros o chats para priorizar la revisión humana, con un coste computacional bajo que permite procesar grandes volúmenes.
- Enrutamiento de tickets de soporte: asignar emociones detectadas en el texto del cliente para derivar casos de frustración o enfado a agentes especializados.
- Investigación en psicología computacional: análisis de corpus en inglés con las etiquetas de GoEmotions, usando las métricas publicadas (macro-F1 0,534, micro-F1 0,611) como referencia de rendimiento.
- Etiquetado previo en pipelines de datos: preanotación de grandes conjuntos de texto en inglés para su posterior revisión, gracias a la inferencia rápida del estudiante.
- Análisis de opiniones de producto: extracción de emociones en reseñas en inglés para agregar indicadores de satisfacción por encima de la polaridad positiva/negativa.
- Despliegue en dispositivos con recursos limitados: al tener 82 millones de parámetros y existir una variante ONNX, puede integrarse en servicios de inferencia en CPU o en el borde.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test macro-F1 | 0,534 (IC 95 %: 0,512 a 0,552) |
| Test micro-F1 | 0,611 |
| Macro-F1 agrupación Ekman | 0,646 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los valores anteriores proceden de la model card del autor y corresponden al conjunto de test de GoEmotions.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (82 millones de parámetros, aproximadamente 0,33 GB de pesos) y en torno a 0,2 GB en FP16.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU para lotes moderados.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (existe la variante `goemotions-distil-onnx`), HuggingFace Transformers con pipeline `text-classification`, y servidores de inferencia compatibles con modelos de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| goemotions-student | 82,1 M | No disponible | MIT | HuggingFace |
| roberta-large (profesor) | 355 M | 512 tokens | MIT | HuggingFace |
| distilroberta-base (base) | 82,1 M | 512 tokens | MIT | HuggingFace |

El modelo se compara de forma natural con sus profesores `roberta-large`, que triplican el número de parámetros y ofrecen presumiblemente mejor rendimiento a mayor coste, y con `distilroberta-base`, del que hereda la arquitectura pero sin cabeza de clasificación de emociones. No se dispone de datos de benchmarks de los profesores en GoEmotions en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo procesa inglés; no hay soporte multilingüe.
- Es un clasificador de emociones, no un modelo generativo: no puede mantener conversaciones ni generar texto.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o con emociones mixtas.
- Los sesgos del dataset GoEmotions (procedente de Reddit) pueden trasladarse al modelo, incluyendo sesgos demográficos y de dominio.
- El rendimiento es moderado: macro-F1 de 0,534 en test indica que un porcentaje relevante de etiquetas no se recupera correctamente.
- Los umbrales por etiqueta están ajustados en validación y deben usarse tal cual para reproducir las métricas; recalibrarlos puede alterar el comportamiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el modelo.
- El modelo tiene muy poca tracción (42 descargas, 0 likes) y no hay evidencia de validación externa independiente.

## Enlaces

- HuggingFace: https://huggingface.co/manasrpandya/goemotions-student
- Variante ONNX: https://huggingface.co/manasrpandya/goemotions-distil-onnx
- Código y memoria: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/06-emotion-classification
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
