# MS260000/food-not-food-text-classifier

## Resumen

El modelo `MS260000/food-not-food-text-classifier` es un clasificador de texto binario desarrollado por Muhammad Shahzad (usuario MS260000) que determina si una frase esta relacionada con comida (`food`) o no (`not_food`). Se trata de un ajuste fino (fine-tuning) del modelo base `distilbert/distilbert-base-uncased`, una version destilada de BERT con 66.955.010 parametros, sobre el dataset `mrdbourke/learn_hf_food_not_food_image_captions`.

El modelo resuelve una tarea de clasificacion muy acotada: filtrar o etiquetar textos segun su tematica alimentaria. Es relevante en el contexto de experimentos educativos y pipelines de preprocesado de datos, no como modelo de proposito general. Su tamano reducido (aproximadamente 2,4 GB de repositorio) y su licencia Apache 2.0 lo hacen facil de desplegar en entornos con recursos limitados.

Dado que se trata de un modelo derivado de DistilBERT, hereda la arquitectura transformer encoder con 6 capas y una ventana de contexto de 512 tokens. No dispone de capacidades generativas, de razonamiento multi-paso ni de tool calling; su unica funcion es la clasificacion de secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors, admite cuantizacion a int8/fp16 mediante herramientas externas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas obtenido mediante destilacion de conocimiento de BERT-base (12 capas). Conserva el vocabulario WordPiece de `bert-base-uncased` (aproximadamente 30.522 tokens) y una dimension oculta de 768. El modelo se ha ajustado para una cabeza de clasificacion binaria con dos etiquetas: `food` y `not_food`.

El entrenamiento se realizo sobre el dataset `mrdbourke/learn_hf_food_not_food_image_captions`, que contiene leyendas de imagenes etiquetadas como comida o no comida. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). La model card no documenta innovaciones tecnicas adicionales mas alla del ajuste fino estandar.

## Capacidades

- Clasificacion de texto binaria: etiqueta una frase como `food` o `not_food`.
- Procesamiento de frases cortas y medianas en ingles (hasta 512 tokens).
- Inferencia rapida gracias al tamano reducido del modelo (66,9 M de parametros).
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Filtrado de resenas o comentarios: clasificar resenas de restaurantes o productos alimentarios para separar las que tratan de comida de las que no, como paso previo a un analisis de sentimiento especifico del dominio.
- Preprocesado de datasets multimodales: etiquetar leyendas de imagenes como relacionadas con comida antes de entrenar un modelo de vision o de recuperacion de imagenes, usando el clasificador como filtro barato y rapido.
- Moderacion de contenido tematico: en foros o comunidades de cocina, detectar mensajes fuera de tematica para redirigirlos o etiquetarlos.
- Enrutamiento en asistentes conversacionales: decidir si una consulta del usuario debe dirigirse a un modulo de recetas o a un modulo general, aprovechando la baja latencia del modelo.
- Anotacion asistida de corpus: generar etiquetas preliminares `food`/`not_food` sobre grandes volumenes de texto para revision humana posterior, reduciendo el coste de anotacion manual.
- Experimentacion educativa: servir como ejemplo practico de fine-tuning de DistilBERT con la libreria Transformers, tal y como demuestra el codigo de demo incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (66,9 M de parametros x 4 bytes), mas overhead de activaciones.
- VRAM estimada en fp16: aproximadamente 135 MB.
- VRAM estimada en int8: aproximadamente 70 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Despliegue recomendado mediante la libreria `transformers` (pipeline `text-classification`); tambien es compatible con ONNX Runtime y con `optimum` para exportacion.
- No se han publicado datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MS260000/food-not-food-text-classifier | 66,9 M | 512 tokens | Clasificacion binaria food/not_food | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a su ancestro no destilado, ya que no se dispone de informacion sobre otros clasificadores especializados en la misma tarea. Frente a `bert-base-uncased`, este modelo ofrece menor tamano y mayor velocidad de inferencia a costa de una ligera perdida de capacidad representacional, ademas de estar especializado en la tarea concreta.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no funciona correctamente con textos en castellano u otros idiomas.
- Dominio muy restringido: solo distingue entre `food` y `not_food`; no aporta informacion sobre tipo de comida, sentimiento ni otras categorias.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas en frases ambiguas o con contexto implicito.
- No se documentan sesgos especificos, pero al derivar de un dataset de leyendas de imagenes puede heredar sesgos de representacion de ciertas cocinas o culturas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio incluye un directorio `demo/` con codigo Gradio; conviene revisarlo antes de reutilizarlo.
- No se dispone de informacion sobre la calidad del ajuste fino ni sobre metricas de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MS260000/food-not-food-text-classifier
- Carpeta de demo: https://huggingface.co/MS260000/food-not-food-text-classifier/tree/main/demo
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/learn_hf_food_not_food_image_captions
