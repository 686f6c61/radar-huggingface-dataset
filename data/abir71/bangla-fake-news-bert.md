# abir71/bangla-fake-news-bert

## Resumen

`abir71/bangla-fake-news-bert` es un clasificador binario de texto en bengalí que estima la probabilidad de que un artículo periodístico sea falso (fake) frente a auténtico. Lo publica Abir Hosen (usuario `abir71`) como artefacto asociado al artículo "Combating deep-fake news in Bengali: detection and prevention of manipulated social media's content using machine learning", publicado en *International Journal of Advanced Computer Research* (2026). Se trata de un fine-tuning de `sagorsarker/bangla-bert-base` con una cabeza lineal personalizada sobre el embedding [CLS], no de un `BertForSequenceClassification` estándar.

El modelo cuenta con 164.398.082 parámetros y una ventana máxima de 512 tokens. Se distribuye en safetensors (658 MB, precisión completa) y en una copia ONNX cuantizada a 8 bits (165 MB) pensada para ejecutarse en el navegador mediante `onnxruntime-web`, lo que lo hace utilizable en entornos sin GPU. El repositorio ocupa 0,8 GB y la licencia es MIT, sin restricciones para uso comercial.

Su relevancia práctica es acotada pero clara: es uno de los pocos clasificadores de desinformación en bengalí con pesos abiertos, métricas publicadas sobre un conjunto de test reservado y una demo interactiva. El propio autor advierte que el modelo juzga estilo de escritura, no veracidad, y que fue entrenado y evaluado con una proporción de aproximadamente 1 noticia falsa por cada 3 auténticas, muy superior a la tasa real en un flujo informativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `sagorsarker/bangla-bert-base`) con cabeza lineal de 2 clases sobre el embedding [CLS]; clase de modelo personalizada en `modeling_bangla_fake_news.py` |
| Parametros totales | 164.398.082 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (solo se procesan los primeros 512 tokens de cada artículo) |
| Tipos de cuantizacion | Pesos en precisión completa (safetensors, 658 MB) y copia ONNX cuantizada a 8 bits (165 MB); no se ofrecen variantes GGUF ni de 4 bits |
| Idiomas soportados | Bengalí (`bn`) únicamente |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `onnx/model_quantized.onnx`; tokenizer WordPiece (`tokenizer.json`, `tokenizer_config.json`) y configuración en `bert_config/config.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT preentrenado en bengalí al que se le añade una capa lineal sobre la representación [CLS] que produce dos logits: 0 = auténtico, 1 = falso. El ajuste fino se realizó durante 3 épocas con AdamW (learning rate 2e-5, sin weight decay), tamaño de lote 8, pérdida de entropía cruzada y truncado a 512 tokens. La información disponible no detalla el número de capas, la dimensión oculta ni la composición del corpus de preentrenamiento del modelo base.

Los datos de ajuste provienen del corpus BanFakeNews (Hossain et al., LREC 2020): se usaron las 1.299 noticias falsas disponibles junto con 3.900 auténticas, manteniendo la proporción natural aproximada de 1 falsa por cada 3 auténticas, con una partición 75/25 entre entrenamiento y test. No se documenta el uso de RLHF ni de DPO, algo esperable en un clasificador de este tipo. La innovación técnica destacable es la optimización para despliegue ligero: la conversión a ONNX de 8 bits mantiene la etiqueta predicha en 120 artículos comprobados, con desviaciones en la probabilidad de clase falsa inferiores a 0,06 respecto al modelo completo.

## Capacidades

- Clasificación binaria de texto periodístico en bengalí: devuelve etiqueta (`fake` / `authentic`) y probabilidad `p_fake`.
- Detección de desinformación por señales estilísticas: vocabulario, registro y estructura propios de sitios de sátira y clickbait.
- Procesamiento de artículos de hasta 512 tokens, suficiente para noticias breves y de extensión media.
- Inferencia en CPU y en navegador mediante la copia ONNX de 8 bits y `onnxruntime-web`.
- Función `predict()` incluida en el repositorio, con limpieza de texto previa a la tokenización.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido: es un clasificador de encoder, no un modelo generativo.
- No cubre otros idiomas distintos del bengalí ni entradas fuera del dominio de artículo de prensa (titulares aislados, publicaciones de redes sociales o textos muy cortos quedan fuera del entrenamiento).

## Casos de uso

- Moderación de contenidos en plataformas de noticias en bengalí: filtrado previo de artículos candidatos a revisión humana, usando `p_fake` como puntuación de priorización en lugar de cómo veredicto final.
- Señal auxiliar en herramientas de verificación periodística: el clasificador aporta un indicio de estilo que el redactor contrasta con fuentes primarias, reduciendo el tiempo de triaje en salas de redacción.
- Investigación académica sobre desinformación en lenguas de bajos recursos: reproducibility del ajuste fino sobre BanFakeNews con hiperparámetros documentados y partición 75/25 declarada.
- Despliegue en el navegador sin backend: la copia ONNX de 165 MB permite integrar la clasificación en una extensión o webapp cliente, sin enviar el texto a un servidor y sin coste de GPU.
- Monitorización de medios con presupuesto de infraestructura bajo: al ejecutarse en CPU, se puede procesar un flujo RSS de artículos en bengalí con un contenedor pequeño y sin acelerador.
- Etiquetado asistido para ampliar corpus: preanotar grandes volúmenes de noticias en bengalí y reservar la revisión humana para los casos cercanos al umbral de decisión.
- Auditoría de modelos base en bengalí: el modelo sirve como referencia de fine-tuning de `sagorsarker/bangla-bert-base` en una tarea de clasificación concreta, útil para comparar variantes de preentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test reservado (partición del 25 % de BanFakeNews), tal como figuran en la model card y en el artículo:

| Modelo | Accuracy | F1 (clase fake) | Recall (clase fake) | ROC-AUC |
|---|---|---|---|---|
| bangla-fake-news-bert (BERT ajustado) | 94,49 % | 89,03 % | 90,28 % | 98,36 % |
| Regresión logística (baseline del paper) | 91,38 % | 80,95 % | no disponible | no disponible |
| Random forest (baseline del paper) | 90,23 % | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de texto. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5-2 GB para inferencia en precisión completa con lotes pequeños, considerando 658 MB de pesos más activaciones y memoria del runtime (estimación, no publicada por el autor).
- Copia ONNX de 8 bits: 165 MB de pesos, ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas dos últimas.
- Cabe holgadamente en GPU de consumo e incluso en iGPU y en el navegador a través de la build cuantizada.
- Opciones de despliegue: `transformers` con la clase personalizada del repositorio, `onnxruntime` para la variante cuantizada y `onnxruntime-web` para cliente. vLLM, TGI y llama.cpp no son opciones directas: se trata de un encoder de clasificación con cabeza y clase de modelo personalizadas, no de un modelo causal compatible con esos servidores sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abir71/bangla-fake-news-bert | 164,4 M | 512 tokens | Clasificación fake/auténtico en bengalí | Accuracy 94,49 %, F1 89,03 %, ROC-AUC 98,36 % | MIT | HuggingFace + demo en Spaces + ONNX |
| sagorsarker/bangla-bert-base | no disponible en la información | 512 tokens (BERT estándar) | Modelo de lenguaje enmascarado en bengalí; requiere ajuste fino para clasificar | No comparable directamente (no entrenado para esta tarea) | no disponible en la información | HuggingFace |
| Regresión logística sobre características del paper | No aplica | No aplica | Clasificación fake/auténtico en bengalí | Accuracy 91,38 %, F1 80,95 % | No aplica | Solo resultados en el artículo |
| Random forest del paper | No aplica | No aplica | Clasificación fake/auténtico en bengalí | Accuracy 90,23 % | No aplica | Solo resultados en el artículo |

No se dispone de datos para comparar con clasificadores de desinformación multilingües o con otros modelos ajustados sobre BanFakeNews, por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- No es un verificador de hechos: el modelo evalúa estilo de escritura, no la veracidad del contenido. No debe usarse como prueba de que un artículo sea verdadero o falso.
- Atajos de fuente y estilo: la mayoría de noticias falsas de BanFakeNews proceden de unos pocos sitios de sátira y clickbait (earki.com, channeldhaka.news, motikontho.wordpress.com), de modo que el modelo puede reconocer su estilo, vocabulario y temática en lugar de la falsedad en sí. El rendimiento caerá sobre fuentes no representadas.
- Desplazamiento temporal: los artículos son mayoritariamente de alrededor de 2018, por lo que eventos, nombres y estilos de escritura posteriores pueden confundir al modelo.
- Tasa base irreal: se entrenó y evaluó con 1 falsa por cada 3 auténticas; en un flujo real de noticias la proporción es mucho menor, por lo que muchas alertas de "fake" serán falsos positivos. Cualquier umbral de decisión debe calibrarse sobre el dominio objetivo.
- Tipo de entrada: no se entrenó con titulares aislados, textos muy breves ni publicaciones de redes sociales, pese a que el artículo se enmarque en contenido de redes sociales.
- Longitud: solo se leen los primeros 512 tokens; artículos largos pierden información relevante.
- Idioma único: no procesa castellano ni ninguna otra lengua; su uso en textos multilingües o transliterados no está validado.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las obligaciones de atribución ni de las advertencias sobre el uso indebido como verificador de verdad.
- Cifras de rendimiento: proceden del conjunto de test derivado de una única partición 75/25 documentada por el autor; no hay validación cruzada publicada ni evaluación externa independiente.
- Métricas del repositorio: el modelo acumula 0 descargas y 0 likes en el momento de la consulta y no se ha publicado evaluación de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abir71/bangla-fake-news-bert
- Demo interactiva (ejecución en navegador): https://huggingface.co/spaces/abir71/bangla-fake-news-demo
- Modelo base: https://huggingface.co/sagorsarker/bangla-bert-base
- Artículo: Alam MJ, Khan MAR, Ahammad I, Hosen A, Das JR. "Combating deep-fake news in Bengali: detection and prevention of manipulated social media's content using machine learning". *International Journal of Advanced Computer Research* 16(76), 2026. DOI: http://dx.doi.org/10.19101/IJACR.2025.1570025
- Dataset BanFakeNews: https://aclanthology.org/2020.lrec-1.349/
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a una plataforma de modelos 3D y se han descartado por no guardar relación con el contenido de la ficha.
