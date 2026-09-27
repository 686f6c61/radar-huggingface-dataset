# bialexacosta21/bert-agnews-topic-classification

## Resumen

`bert-base-uncased` ajustado por completo (*full fine-tuning*) para clasificación de temas sobre el corpus AG News. Clasifica artículos de noticias en inglés en cuatro categorías mutuamente excluyentes: World, Sports, Business y Sci/Tech. Lo desarrolla el usuario de Hugging Face `bialexacosta21` y se publica bajo licencia Apache 2.0, con pesos en formato safetensors y 109.485.316 parámetros totales (unos 109,5 millones), coherente con la configuración estándar de BERT base más una cabeza de clasificación de 4 clases.

El modelo no introduce innovaciones arquitectónicas: es un transformer encoder bidireccional estándar reutilizado como clasificador de secuencias. Su interés práctico es servir como línea base ligera y rápida para enrutado temático de noticias en inglés, con un coste de inferencia muy bajo que permite ejecutarlo en CPU o en GPUs de gama de entrada. El autor reporta 0,9445 de *accuracy* y 0,9444 de F1 macro sobre el conjunto de test oficial de AG News tras una sola época de entrenamiento.

La relevancia del modelo es, por tanto, la de un componente de *pipeline*: un clasificador barato y determinista para preetiquetar o filtrar contenido antes de etapas más costosas (LLM, recuperación, análisis agregado). Conviene tener en cuenta que el repositorio no tiene descargas ni *likes* en el momento de la consulta, no se ha publicado una validación independiente y el entrenamiento se limita a un único *epoch* sobre un corpus de noticias de un dominio y una época concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base: 12 capas, 768 de dimensión oculta, 12 cabezas de atención) + cabeza de clasificación lineal de 4 clases |
| Parámetros totales | 109.485.316 (~109,5 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (entrada truncada a 128 en entrenamiento y evaluación); el encoder base admite hasta 512 posiciones |
| Tipos de cuantización | no disponible (repositorio publicado en safetensors sin variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: *pipeline* `text-classification`, tamaño del repositorio 0,4 GB, creado y actualizado el 26 de septiembre de 2026, 0 descargas y 0 *likes* registrados.

## Arquitectura y entrenamiento

Arquitectura estándar de BERT base *uncased*: 12 capas de transformer con atención bidireccional, 768 dimensiones ocultas y 12 cabezas de atención, más una cabeza de clasificación sobre el token `[CLS]` con 4 salidas. No hay decodificación especulativa, atención lineal, mezcla de expertos ni componentes SSM: es un encoder de clasificación puro, sin generación de texto. El ajuste es *full fine-tuning* (todos los pesos se actualizan), no LoRA ni adaptadores.

Datos y procedimiento de entrenamiento, según la *model card*: corpus `fancyzhx/ag_news`, con 108.000 ejemplos de entrenamiento tras reservar 12.000 para validación y 7.600 ejemplos de test oficial reservados exclusivamente para la evaluación final. Se usa `bert-base-uncased` como modelo base, con *learning rate* de 2e-5 para el encoder y 1e-3 para la cabeza de clasificación, tamaño de lote de 16 en entrenamiento y 32 en evaluación, una sola época y semilla 42. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior; tampoco se especifica el hardware de entrenamiento ni el tiempo total de cómputo.

## Capacidades

- Clasificación de texto en inglés: asigna un artículo de noticias a una de las cuatro etiquetas de AG News (World, Sports, Business, Sci/Tech).
- Salida de probabilidades por clase (logits y *softmax*) mediante el *pipeline* `text-classification` de Transformers, lo que permite umbrales de confianza y descarte de predicciones dudosas.
- Procesamiento por lotes (*batching*) eficiente: al ser un encoder de 109,5 M de parámetros, permite clasificar grandes volúmenes de titulares o resúmenes en CPU o GPU modesta.
- Integración directa con `AutoModelForSequenceClassification` y `AutoTokenizer` de Hugging Face Transformers.
- Exportación a ONNX o TorchScript para inferencia optimizada (capacidad derivada del formato safetensors y de la arquitectura estándar; no verificada en el repositorio).
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni agentes: es un clasificador, no un modelo generativo.
- No tiene *thinking mode*, ni visión, ni audio, ni capacidades multimodales.
- Multilingüismo: no. Solo inglés declarado.

## Casos de uso

- Enrutado temático en portales de noticias: cada titular o entradilla se clasifica en una de las cuatro categorías para asignarlo automáticamente a la sección correspondiente. El modelo es adecuado porque la decisión es de 4 clases cerradas y el coste por inferencia es mínimo.
- Filtrado de *feeds* RSS y newsletters: seleccionar, por ejemplo, solo entradas de Business o Sci/Tech para un boletín especializado, descartando el resto antes de que llegue a un curador humano.
- Preetiquetado de corpus para investigación: generar etiquetas temáticas preliminares sobre grandes volúmenes de noticias en inglés y reservar la revisión humana para las muestras con menor confianza, reduciendo coste de anotación.
- Análisis de tendencias y series temporales: agregar el volumen de noticias por categoría por día o semana para medir qué temas ganan peso en un *corpus* concreto.
- Sistemas de recomendación de contenido: usar la etiqueta temática como *feature* de perfilado del usuario o de similitud entre artículos en un motor de recomendación editorial.
- Clasificación previa en *pipelines* de PLN más costosos: actuar como primer filtro para decidir qué documentos merecen pasar a un LLM o a un sistema de recuperación aumentada, reduciendo el gasto en inferencia de modelos grandes.
- Monitorización de reputación o *media monitoring*: etiquetar menciones de marca en prensa por temática para separar cobertura financiera de cobertura tecnológica.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test oficial de AG News (7.600 ejemplos):

| Métrica | Valor |
|---|---|
| Accuracy | 0,9445 |
| F1 macro | 0,9444 |
| Pérdida en test | 0,1754 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni evaluaciones independientes que reproduzcan estas cifras. Tampoco se aportan métricas por clase, matriz de confusión ni resultados sobre dominios distintos de AG News.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 438 MB solo de pesos (109,5 M × 4 bytes), aproximadamente 0,5-1 GB contando activaciones y *overhead* del *runtime*; en FP16, unos 219 MB de pesos; en INT8, unos 110 MB.
- Cabe sin problema en GPU de consumo: cualquier GPU con 2 GB o más de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 con enorme margen). También es viable en CPU para lotes moderados.
- GPU de centro de datos: funciona en T4, L4, A10, A100 y H100, aunque el modelo está muy por debajo de su capacidad; el despliegue en estas tarjetas solo se justifica por agregación de muchos modelos pequeños en el mismo servidor.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), exportación a ONNX Runtime, TorchScript, o un servicio propio con FastAPI + Transformers. Los servidores orientados a modelos generativos (vLLM, TGI en modo decodificación) no son el vehículo natural para un encoder de clasificación de 4 clases.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de ejemplos por segundo en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales verificables de las arquitecturas base candidatas. Las cifras de parámetros y licencias corresponden a los modelos base publicados por sus respectivos autores; el rendimiento sobre AG News de esas alternativas no está verificado aquí.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en AG News |
|---|---|---|---|---|
| `bialexacosta21/bert-agnews-topic-classification` | 109,5 M | 128 tokens (truncado) | Apache 2.0 | Accuracy 0,9445 / F1 macro 0,9444 |
| `distilbert-base-uncased` (ajustado a AG News) | ~66 M | 512 tokens | Apache 2.0 | no disponible |
| `roberta-base` (ajustado a AG News) | ~125 M | 512 tokens | MIT | no disponible |
| `bert-base-uncased` sin ajustar | ~110 M | 512 tokens | Apache 2.0 | no disponible (no es clasificador de 4 clases) |

## Limitaciones y advertencias

- Dominio cerrado: entrenado y evaluado únicamente sobre AG News. Puede degradarse con estilos de escritura distintos (redes sociales, textos legales, documentación técnica) o con géneros que no sean noticias.
- Idioma: solo inglés. No hay soporte declarado para castellano ni para ningún otro idioma.
- Truncado a 128 tokens: los artículos más largos pierden información; la clasificación se basa en el primer fragmento del texto, lo que puede fallar cuando el tema real aparece al final del artículo.
- Entrenamiento de una sola época: no se documenta búsqueda de hiperparámetros ni *early stopping*, por lo que no hay evidencia de que la configuración sea óptima.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no produce texto libre), pero sí existe riesgo de clasificación errónea con alta confianza en entradas fuera de distribución.
- Sesgos: no se han publicado análisis de sesgo. El corpus AG News procede de fuentes periodísticas concretas (Zhang et al., 2015), por lo que puede arrastrar sesgos de cobertura temática y geográfica de esas fuentes.
- Desactualización potencial: el vocabulario y los temas de un corpus de noticias de una época concreta pueden no reflejar la actualidad; conviene validar con datos recientes antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la atribución correspondiente. No impone restricciones de uso adicionales.
- Falta de validación de la comunidad: 0 descargas y 0 *likes* en el momento de la consulta, sin terceros que hayan reproducido los resultados. Las métricas reportadas proceden exclusivamente del autor.
- No se documentan en la información disponible los pesos exactos del tokenizador, el hardware de entrenamiento, el coste de cómputo ni el script de entrenamiento reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bialexacosta21/bert-agnews-topic-classification
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Documentación de Hugging Face Transformers: https://huggingface.co/docs/transformers
- Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*: https://arxiv.org/abs/1810.04805
- Zhang, X., Zhao, J., & LeCun, Y. (2015). *Character-level Convolutional Networks for Text Classification* (origen del corpus AG News): https://arxiv.org/abs/1509.01626
