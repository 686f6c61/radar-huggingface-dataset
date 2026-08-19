# dangvansam/vietnamese-toxicity

## Resumen

vietnamese-toxicity es un clasificador binario de toxicidad en texto vietnamita, desarrollado por dangvansam (Sam Dang) mediante fine-tuning del modelo multilingüe unitary/multilingual-toxic-xlm-roberta sobre datos de discurso de odio en vietnamita. El modelo produce una única etiqueta `toxicity` con puntuación sigmoide, simplificando la taxonomía de 7 etiquetas de Jigsaw que soporta la arquitectura base. Su relevancia radica en que los modelos base multilingües y monolingües en inglés obtienen un 0% de recall sobre texto tóxico vietnamita, por lo que esta adaptación cubre un vacío funcional para moderación de contenido en ese idioma. La arquitectura es XLM-RoBERTa (encoder transformer) con aproximadamente 278 millones de parámetros y una ventana de contexto de 512 tokens. Incluye exportación ONNX para inferencia eficiente en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parametros totales | ~278M (heredados de XLM-RoBERTa base; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de XLM-RoBERTa) |
| Tipos de cuantizacion | ONNX export disponible; formato de cuantizacion no especificado |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | PyTorch (HuggingFace) y ONNX |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un encoder transformer multilingüe preentrenado sobre datos CommonCrawl filtrados en 100 idiomas. El checkpoint de partida, unitary/multilingual-toxic-xlm-roberta, es un clasificador de toxicidad entrenado sobre el dataset Jigsaw con 7 etiquetas (toxic, severe_toxic, obscene, threat, insult, identity_hate). Este fine-tuning colapsa la taxonomía a una única etiqueta binaria `toxicity` con activación sigmoide, suficiente para detectores que toman la puntuación máxima sobre una lista de etiquetas reconocidas.

El entrenamiento se realizó sobre un conjunto combinado y deduplicado de ~34,000 ejemplos (~5,400 tóxicos y ~28,800 limpios), procedentes de tres fuentes: ViHSD (~24,000 comentarios de redes sociales vietnamitas, originalmente de 3 clases colapsadas a binario), ViCTSD (~10,000 pares de comentarios de noticias vietnamitas con etiqueta binaria) y un pequeño conjunto de preguntas limpias no tóxicas añadidas como hard negatives para reducir falsos positivos en mensajes de clientes frustrados pero no tóxicos. El autor indica que es una primera iteración, con un trade-off entre recall y precisión ajustable mediante el umbral de decisión.

## Capacidades

- Clasificación binaria de toxicidad en texto vietnamita: detecta si un texto es tóxico o no, con puntuación sigmoide en una única etiqueta `toxicity`.
- Inferencia en CPU optimizada mediante exportación ONNX, compatible con Optimum ONNX Runtime (`ORTModelForSequenceClassification`).
- Integración directa con el pipeline `text-classification` de HuggingFace Transformers.
- Ajuste del umbral de decisión para priorizar recall (menos toxicidad no detectada) o precisión (menos falsos positivos), con umbrales documentados de 0.3 a 0.9.
- Distingue texto limpio de texto tóxico con recall de 0.70 y precisión de 0.52 a umbral 0.5 sobre el test combinado.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un encoder para clasificación de secuencias.

## Casos de uso

- Moderación de comentarios en redes sociales vietnamitas: el modelo puede integrarse en pipelines de moderación para filtrar comentarios tóxicos en plataformas como Facebook, TikTok o foros locales, procesando textos de hasta 512 tokens con latencia de decenas de milisegundos en CPU.
- Filtrado de comentarios en portales de noticias: medios vietnamitas pueden pre-filtrar comentarios de sus secciones de opinión, reduciendo la carga de moderadores humanos; a umbral 0.7 la tasa de falsos positivos baja al 8%.
- Detección de toxicidad en atención al cliente: el conjunto de entrenamiento incluye hard negatives de mensajes de clientes frustrados pero no tóxicos, lo que reduce falsos positivos en interacciones de soporte técnico o reclamaciones.
- Análisis de discurso de odio en investigación social: investigadores pueden aplicar el modelo a grandes corpus de texto vietnamita para estudiar la prevalencia de toxicidad en distintas plataformas, periodos o colectivos, con la ventaja de la licencia MIT para uso académico.
- Pre-filtrado en pipelines de NLP: como etapa previa a otros procesos (traducción, análisis de sentimiento, extracción de información), descartando texto tóxico antes de enviarlo a modelos generativos o de análisis posteriores.
- Moderación de comunidades gaming y foros en tiempo real: integración como servicio REST (FastAPI + transformers u ONNX Runtime) para moderar chat en vivo en comunidades vietnamitas, con despliegue en CPU de bajo coste.
- Clasificación de comentarios en plataformas de comercio electrónico vietnamitas: detección de reseñas o mensajes abusivos entre compradores y vendedores, aprovechando los hard negatives de dominio para reducir falsos positivos en mensajes de queja legítimos.

## Benchmarks y rendimiento

Resultados sobre conjuntos de test no vistos durante el entrenamiento:

| Conjunto de test | n | Recall | Precision | Tasa de FP |
|---|---|---|---|---|
| ViHSD test | 6,680 | 0.73 | 0.54 | 0.13 |
| ViCTSD test | 1,000 | 0.41 | 0.28 | 0.13 |

Barrido de umbral sobre el test combinado (7,680 muestras):

| Umbral | Recall | Precision | Tasa de FP |
|---|---|---|---|
| 0.3 | 0.78 | 0.44 | 0.19 |
| 0.5 | 0.70 | 0.52 | 0.13 |
| 0.7 | 0.60 | 0.60 | 0.08 |
| 0.9 | 0.43 | 0.73 | 0.03 |

Para comparación, el modelo base multilingüe unitary/multilingual-toxic-xlm-roberta obtiene un 0% de recall sobre una sonda de texto tóxico vietnamita escrita a mano, al igual que el checkpoint monolingüe en inglés unitary/unbiased-toxic-roberta. Ambos son efectivamente ciegos al vietnamita.

## Requisitos de hardware

- VRAM estimada: ~1.1 GB en fp32 y ~556 MB en fp16 para los pesos del modelo (~278M parámetros). Con cuantización int8 podría reducirse a ~278 MB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM (GTX 1060, RTX 2060, RTX 4090, etc.) es suficiente para inferencia.
- Inferencia en CPU: la exportación ONNX permite ejecutar el modelo en CPU con latencia de decenas de milisegundos por clasificación de texto corto, dependiendo del hardware.
- Opciones de despliegue: HuggingFace Transformers (pipeline `text-classification`), Optimum ONNX Runtime (`ORTModelForSequenceClassification`), o servicios REST propios con FastAPI.
- No aplican vLLM ni TGI: al ser un encoder de clasificación y no un modelo generativo, no se requieren servidores de inferencia especializados para decodificación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idioma | Recall en vietnamita | Licencia |
|---|---|---|---|---|---|
| dangvansam/vietnamese-toxicity | XLM-RoBERTa | ~278M | vietnamita | 0.73 (ViHSD test) | MIT |
| unitary/multilingual-toxic-xlm-roberta | XLM-RoBERTa | ~278M | multilingue (100) | 0% en sonda vietnamita | no disponible |
| unitary/unbiased-toxic-roberta | RoBERTa | ~125M | ingles | 0% en sonda vietnamita | no disponible |
| hoangcaobao/Vietnamese-Toxic-Comment-Classifier | PhoBERT | ~135M (estimado) | vietnamita | no disponible | no disponible |

El modelo supera claramente a sus bases en texto vietnamita, donde ambas obtienen un 0% de recall. Frente al clasificador basado en PhoBERT de
