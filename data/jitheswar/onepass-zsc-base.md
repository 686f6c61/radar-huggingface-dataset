# Jitheswar/onepass-zsc-base

## Resumen

onepass-zsc-base es un modelo de clasificación de texto zero-shot desarrollado por Jitheswar que reformula la tarea como inferencia de lenguaje natural (NLI): dado un texto y una lista arbitraria de etiquetas, genera probabilidades calibradas en una sola pasada hacia delante. El modelo empaqueta el texto junto con una hipótesis NLI por etiqueta ("This text is about {label}.") en una única secuencia mediante una máscara de atención por bloques y posiciones relativas compartidas, de modo que el texto se codifica una sola vez y todas las etiquetas se puntúan en el mismo forward pass. Esto contrasta con el enfoque habitual, que requiere una pasada por etiqueta.

El backbone es `MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c`, un DeBERTa-v3-base afinado para NLI, sobre el que se añade la lógica de empaquetado multi-etiqueta y una capa de calibración. El modelo tiene 186.784.515 parámetros y un repositorio de 0,7 GB en formato safetensors.

Su relevancia práctica está en el coste de inferencia: al reducir de N pasadas (una por etiqueta) a una sola, el coste de clasificar con muchas etiquetas decrece de forma aproximadamente lineal con el número de etiquetas a constante en el número de forwards, a cambio de una secuencia de entrada más larga. El modelo incluye además calibración explícita (temperatura dependiente del número de etiquetas y Platt scaling para multi-etiqueta), un aspecto poco habitual en clasificadores zero-shot publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) con empaquetado multi-hipótesis y máscara de atención por bloques |
| Parametros totales | 186.784.515 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone DeBERTa-v3 y del número de etiquetas empaquetadas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el código de referencia usa fp16 en CUDA cuando está disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre DeBERTa-v3-base, un transformer encoder con atención disentangled y embeddings de posición relativos. La innovación no está en el backbone sino en el esquema de entrada: el texto y las N hipótesis NLI se concatenan en una sola secuencia con una máscara de atención por bloques, de forma que cada hipótesis atiende al texto y a sí misma pero no a las demás hipótesis, y todas comparten las mismas posiciones relativas respecto al texto. La cabeza de entailment del NLI puntúa cada hipótesis en la misma pasada, lo que evita reencodificar el texto una vez por etiqueta.

La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino adicional sobre el checkpoint base más allá de la calibración. Sí documenta que la calibración se ajustó exclusivamente sobre un conjunto de desarrollo formado por 8 datasets distintos de los de evaluación: temperatura y mezcla uniforme dependientes del número de etiquetas para el caso single-label, y sigmoid Platt scaling para multi-label. Los resultados reportados son sobre 13 datasets held-out no vistos en entrenamiento.

## Capacidades

- Clasificación de texto zero-shot con etiquetas arbitrarias definidas en tiempo de inferencia, sin reentrenamiento.
- Clasificación single-label (una etiqueta por texto) y multi-label (varias etiquetas simultáneas, activada con `multi_label=True`).
- Puntuación de todas las etiquetas en un único forward pass, con coste de cómputo independiente del número de etiquetas (a costa de una secuencia de entrada más larga).
- Salida de probabilidades calibradas mediante temperatura dependiente del número de etiquetas y Platt scaling.
- Funcionamiento en fp16 sobre CUDA cuando está disponible, con fallback a CPU.
- Solo inglés: el modelo y su backbone están entrenados y evaluados únicamente en inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada mensaje entrante contra un conjunto de categorías de negocio (facturación, caída de servicio, petición de funcionalidad) en una sola pasada, lo que abarata el enrutamiento cuando el catálogo de categorías es amplio y cambia con frecuencia.
- Moderación de contenido con etiquetas configurables: puntuar textos contra categorías de odio, ofensivo o neutro sin reentrenar, útil cuando las políticas de contenido se actualizan y las etiquetas deben modificarse sobre la marcha.
- Análisis de sentimiento y temática en reseñas: clasificar reseñas de producto o de medios (positivo, negativo, neutro) y temas asociados, con probabilidades calibradas que permiten fijar umbrales de decisión razonables.
- Filtrado de spam y detección de fraude textual: clasificación binaria contra etiquetas como spam/ham o fraude/legítimo, con la ventaja de que el modelo devuelve probabilidades calibradas para umbralizar.
- Etiquetado de grandes volúmenes de texto para preanotación: generar etiquetas preliminares sobre corpus no etiquetados antes de una revisión humana, aprovechando el coste de una sola pasada por documento.
- Clasificación de escenarios conversacionales: categorizar intenciones o escenarios en asistentes conversacionales (por ejemplo, escenarios de un asistente virtual) con un conjunto de etiquetas definido por el equipo de producto.
- Experimentación rápida en investigación: evaluar la viabilidad de una taxonomía de etiquetas sobre un dataset propio sin entrenar ningún modelo, antes de invertir en un clasificador supervisado.

## Benchmarks y rendimiento

Resultados held-out reportados en la model card (ninguno de estos datasets se usó en entrenamiento). La columna "starting checkpoint" corresponde al backbone evaluado con una pasada por etiqueta; la columna del modelo usa una sola pasada. Accuracy con puntuaciones crudas; ECE con la temperatura incluida en el repositorio.

| Dataset | N.º etiquetas | Accuracy (onepass) | Accuracy (checkpoint base, 1 pasada/etiqueta) | ECE |
|---|---|---|---|---|
| 20newsgroups | 20 | 0.540 | 0.550 | 0.097 |
| banking77 | 77 | 0.567 | 0.513 | 0.159 |
| bbc_news | 5 | 0.900 | 0.887 | 0.040 |
| climate | 2 | 0.583 | 0.530 | 0.247 |
| cr | 2 | 0.920 | 0.920 | 0.090 |
| emotion | 6 | 0.467 | 0.430 | 0.228 |
| enron_spam | 2 | 0.497 | 0.507 | 0.357 |
| fin_topic | 20 | 0.533 | 0.477 | 0.104 |
| hate_offensive | 3 | 0.600 | 0.663 | 0.150 |
| massive_scenario | 18 | 0.627 | 0.537 | 0.049 |
| rotten_tomatoes | 2 | 0.840 | 0.800 | 0.060 |
| sms_spam | 2 | 0.883 | 0.890 | 0.041 |
| sst2 | 2 | 0.913 | 0.880 | 0.117 |
| **Media** | | **0.682** | **0.660** | **0.134** |

ECE de referencia del baseline en el mismo benchmark: 0.150. El modelo mejora la media de accuracy en 2,2 puntos y reduce el ECE medio de 0,150 a 0,134. La mejora es más marcada en datasets con muchas etiquetas (banking77 con 77 etiquetas: 0,567 frente a 0,513; massive_scenario con 18: 0,627 frente a 0,537), mientras que en algunos binarios empeora ligeramente (enron_spam, hate_offensive, sms_spam) y en hate_offensive la caída es apreciable (0,600 frente a 0,663).

## Requisitos de hardware

- VRAM estimada para inferencia: con 186,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,75 GB y en fp16 unos 0,37 GB; el consumo real depende de la longitud de la secuencia empaquetada (texto más una hipótesis por etiqueta) y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para lotes pequeños en fp16; una RTX 4090, A100 o H100 permiten lotes grandes y secuencias empaquetadas largas con muchas etiquetas.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060 y superiores); también puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: el código de referencia (`onepass`, instalable con `pip install torch transformers safetensors huggingface_hub`) carga el modelo con `ZeroShotClassifier.load(path)` y usa CUDA fp16 cuando está disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificación, esos servidores de generación no aplican directamente.
- Latencia y throughput: no se publican cifras concretas. La ventaja estructural es que el coste por documento es de un solo forward pass independientemente del número de etiquetas, frente a N forwards del enfoque por etiqueta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| onepass-zsc-base | 186,8 M | no disponible | en | MIT | Zero-shot NLI con empaquetado multi-etiqueta en una pasada y calibración |
| MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c | ~184 M (DeBERTa-v3-base) | no disponible | en (y multilingüe en variantes) | MIT | Zero-shot NLI estándar, una pasada por etiqueta; es el checkpoint base de este modelo |
| facebook/bart-large-mnli | ~407 M | 1024 tokens | en | MIT | Zero-shot NLI clásico con BART-large, una pasada por etiqueta |
| typeform/distilbert-base-uncased-mnli | ~67 M | 512 tokens | en | Apache 2.0 | Zero-shot NLI destilado, más ligero y rápido pero con menor precisión |

La comparación directa con el checkpoint base es la más informativa: mismo backbone y licencia, pero onepass-zsc-base añade el empaquetado en una sola pasada y la calibración, con una media de accuracy de 0,682 frente a 0,660 y un ECE de 0,134 frente a 0,150. Frente a bart-large-mnli, el modelo es aproximadamente la mitad de grande y, según los datos disponibles, no hay comparación directa publicada en los mismos benchmarks.

## Limitaciones y advertencias

- Solo inglés: no hay soporte ni evaluación en otros idiomas, incluido el castellano.
- El modelo es un clasificador, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- El rendimiento es desigual según el dataset: en hate_offensive cae frente al checkpoint base (0,600 frente a 0,663) y en enron_spam y sms_spam también empeora ligeramente; la media mejora, pero no de forma uniforme.
- La calibración depende del número de etiquetas y se ajustó sobre 8 datasets de desarrollo; con taxonomías muy distintas a las de ajuste, el ECE real puede desviarse del reportado.
- ECE elevado en algunos dominios: 0,357 en enron_spam, 0,247 en climate y 0,228 en emotion, lo que limita el uso de umbrales fijos en esos casos sin recalibración.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación de robustez; el backbone hereda los sesgos de DeBERTa-v3-base y de sus datos de preentrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en dominios alejados de los datos de ajuste.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte documentado.
- El modelo es muy reciente (creado en octubre de 2026) y tiene muy poca tracción (15 descargas, 0 likes); no hay validación independiente de los resultados reportados.
- El paquete `onepass` es necesario para usar el empaquetado multi-etiqueta; cargarlo solo con `transformers` no reproduce el comportamiento de una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jitheswar/onepass-zsc-base
- Repositorio del código: https://github.com/Jitheswar/onepass-zsc
- Checkpoint base: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0-c
