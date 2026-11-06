# KaraKaraWitch/haruka-tagger-beta-v6

## Resumen

Haruka-tagger-beta-v6 es un modelo de clasificación de imágenes multietiqueta especializado en el etiquetado automático de ilustraciones de estilo anime y manga. Lo desarrolla el usuario independiente KaraKaraWitch bajo licencia Apache 2.0, y se distribuye a través de Hugging Face con la librería `timm`. El modelo resuelve un problema concreto del ecosistema Danbooru: la mayoría de taggers disponibles limitan su vocabulario a entre 10.000 y 13.000 etiquetas, mientras que este modelo cubre un vocabulario total de 98.782 etiquetas repartidas en seis categorías (general, personaje, copyright, artista, año y rating).

La arquitectura se basa en un backbone ViT EVA02-Base con parches de 14 píxeles y resolución de entrada de 448×448, preentrenado en ImageNet-22k y afinado sobre el modelo previo Haruka-EVA02-base-448 del mismo autor. Sobre ese backbone, la innovación principal de esta versión beta es un cabezal de atención con estructura jerárquica coarse-to-fine: 6 cabezales gruesos y 3 hojas hijas por cabeza, lo que da 18 consultas combinadas en lugar de la consulta única del pooling estándar.

El modelo es relevante para quienes construyen pipelines de metadatos, curación de datasets o herramientas de búsqueda sobre colecciones de arte anime, porque ofrece una cobertura de vocabulario muy superior a la de los taggers convencionales y publica umbrales de decisión recomendados por categoría. Es una versión beta y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT EVA02-Base (patch 14, 448×448) con cabezal de attention pooling jerarquico coarse-to-fine de 18 consultas |
| Parametros totales | no disponible (repo de 1,6 GB, incluye pesos en safetensors y ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 448×448) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las etiquetas del vocabulario Danbooru estan mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El backbone es un EVA02-Base de `timm` con parches de 14×14 y resolución de 448×448, inicializado desde `timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k` y afinado a partir de `KaraKaraWitch/Haruka-EVA02-base-448`. Sobre la salida espacial del ViT (32×32 = 1.024 tokens de 768 dimensiones) se aplica un cabezal de pooling por atención multi-consulta. La versión beta v6 sustituye el pooling plano de consulta única por un árbol de consultas coarse-to-fine: 6 cabezales gruesos, cada uno con 3 hojas hijas, lo que produce 18 consultas combinadas. Cada hoja dispone de su propia matriz de proyección ortogonal para preservar el rango completo del vector de 768 dimensiones del backbone.

El enrutamiento entre consultas usa `sigmoid(logits + bias)` en lugar de `softmax(dim=-2)`, de modo que las consultas no compiten por los parches, seguidas de un escalado por masa de parches `M_q / (M_q + 4.0)` tras `LayerNorm`, lo que permite que las consultas vacías permanezcan silenciosas en lugar de amplificar ruido. En el entrenamiento se redujo la potencia del oversampling IRFS (de repetición 4× a 2×) y se añadió ponderación de pérdida por etiqueta. El preprocesado documentado compone alfa sobre blanco, redimensiona con letterbox BICUBIC a 448×448 y normaliza con media y desviación típica de ImageNet. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificación multietiqueta de imágenes de anime con un vocabulario total de 98.782 etiquetas.
- Predicción de etiquetas generales (21.748), personajes (31.471), copyright u obra (7.091), artista (38.447), año o era (21) y rating (4 clases).
- Manejo de escenas con múltiples personajes, cosplay y fondos detallados gracias al pooling jerárquico de 18 consultas, que mitiga la dilución de características del pooling de consulta única.
- Salida por categoría con umbrales de decisión recomendados independientes, lo que permite calibrar precisión y recall según el caso de uso.
- Inferencia en PyTorch con `safetensors` y en ONNX, con código de preprocesado y definición del cabezal incluidos en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general fuera del dominio anime ni generación de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Etiquetado masivo de datasets de arte anime: el modelo puede procesar lotes de imágenes y asignar etiquetas de las seis categorías con umbrales por categoría, lo que reduce el trabajo manual de curación de corpus para entrenamiento de modelos generativos.
- Construcción de índices de búsqueda sobre galerías: con 38.447 etiquetas de artista y 31.471 de personaje, permite indexar colecciones por autor, personaje y obra, habilitando búsquedas facetadas que un tagger de 10.000 etiquetas no cubriría.
- Moderación y clasificación por rating: la categoría rating (4 clases, con umbral `argmax` o 0,50) permite filtrar contenido por clasificación de edad en plataformas de publicación.
- Enriquecimiento de metadatos en herramientas de catalogación: integrable como paso de un pipeline que lea imágenes, ejecute el modelo en ONNX y escriba las etiquetas detectadas en una base de datos o en cabeceras de archivo.
- Análisis de tendencias temporales: la categoría año o era (21 etiquetas, umbral 0,25) permite datar estilísticamente ilustraciones y estudiar la evolución de estilos o artistas a lo largo del tiempo.
- Preetiquetado asistido para anotadores humanos: con umbrales de alta recall (por ejemplo, 0,15 en artista) el modelo genera candidatos que un revisor humano confirma o descarta, acelerando la anotación sin sustituirla.
- Detección de similitud y atribución de autoría: la predicción de artista con mAP del 85,96 % en el conjunto de evaluación permite agrupar obras por autor probable y detectar atribuciones dudosas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto `new-dan` (imágenes posteriores al 1 de enero de 2026, no vistas en entrenamiento). Las métricas son mAP (AUPRC), Micro-F1 y Macro-F1 por etiqueta.

| Categoria | Etiquetas activas / vocabulario | mAP (AUPRC) | Micro-F1 | Macro-F1 por etiqueta |
|---|---:|---:|---:|---:|
| General | 4.143 / 21.748 | 53,13 % | 62,15 % | 55,50 % |
| Personaje | 745 / 31.471 | 91,91 % | 83,08 % | 89,25 % |
| Copyright | 295 / 7.091 | 79,53 % | 76,20 % | 79,00 % |
| Artista | 221 / 38.447 | 85,96 % | 80,79 % | 76,40 % |
| Rating | 4 / 4 | 69,82 % | 74,38 % | 74,88 % |
| Subconjunto ancla de 10k etiquetas | 7.778 gen / 2.649 pers. | 58,23 % gen / 98,12 % pers. | 65,77 % gen | 61,05 % gen / 97,83 % pers. |

No se han publicado comparaciones directas con otros taggers en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un ViT-Base a 448×448 en precisión FP32 requiere del orden de 1,5 a 2 GB de pesos, y en FP16 aproximadamente la mitad, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en FP16; tarjetas de consumo como RTX 3060, RTX 4060 o superiores deberían ser suficientes para lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: PyTorch con `timm` y `safetensors` (código de ejemplo en la model card) o runtime ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haruka-tagger-beta-v6 | no disponible (ViT-Base EVA02) | 98.782 etiquetas | imagen 448×448 | Apache 2.0 | Hugging Face, safetensors y ONNX |
| Haruka-tagger-alpha | no disponible | no disponible | imagen 448×448 | no disponible | Hugging Face |
| Taggers Danbooru convencionales | no disponible | ~10.000-13.000 etiquetas | variable | variable | Hugging Face |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; el autor solo señala de forma genérica que la mayoría de taggers de Danbooru limitan su vocabulario a 10.000-13.000 etiquetas.

## Limitaciones y advertencias

- Es una versión beta: el propio autor la etiqueta como tal y reconoce que las evaluaciones son difíciles y que los modelos que parecen buenos sobre el papel pueden presentar comportamientos extraños.
- El rendimiento en la categoría general es moderado (mAP 53,13 %), muy por debajo de personaje (91,91 %) o artista (85,96 %), por lo que las etiquetas generales requieren revisión.
- El conjunto de evaluación `new-dan` contiene solo 4.143 etiquetas generales activas frente a un vocabulario de 21.748, y 221 de artista frente a 38.447: las métricas se calculan sobre una fracción pequeña del vocabulario y pueden no representar el rendimiento en etiquetas raras.
- Riesgo de alucinación de etiquetas: al predecir sobre un vocabulario de casi 99.000 etiquetas con umbrales bajos, pueden aparecer falsos positivos; se recomienda usar los umbrales por categoría indicados (0,35 general, 0,35 personaje, 0,35 copyright, 0,25 artista, 0,25 año, argmax o 0,50 rating).
- Dominio restringido a ilustraciones de estilo anime y al vocabulario de Danbooru; no está diseñado para fotografías, arte no anime ni otras taxonomías.
- No se documentan sesgos demográficos, culturales o de contenido; la categoría rating puede reflejar los criterios de clasificación de Danbooru, no una política de moderación propia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de Danbooru pueden tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- El repositorio no registra descargas ni validación por parte de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-tagger-beta-v6
- Modelo base Haruka-EVA02-base-448: https://huggingface.co/KaraKaraWitch/Haruka-EVA02-base-448
- Backbone en timm: https://huggingface.co/timm/eva02_base_patch14_448.mim_in22k_ft_in22k_in1k
- Versión alpha: https://huggingface.co/KaraKaraWitch/haruka-tagger-alpha
- Repositorio del autor: https://huggingface.co/KaraKaraWitch/haruka
- Conjunto de evaluación new-dan: https://huggingface.co/Shio-Koube/new-dan
