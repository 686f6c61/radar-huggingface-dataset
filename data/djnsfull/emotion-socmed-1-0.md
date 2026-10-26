# djnsfull/emotion-socmed-1.0

## Resumen

`djnsfull/emotion-socmed-1.0` es un modelo de clasificación de texto en indonesio especializado en el análisis de emociones en publicaciones de redes sociales. Lo publica el usuario `djnsfull` y se obtiene por ajuste fino (*fine-tuning*) del modelo `indobenchmark/indobert-large-p2`, un encoder de la familia BERT-large preentrenado sobre corpus indonesios por el proyecto IndoBenchmark. El resultado es un clasificador de aproximadamente 335 millones de parámetros, distribuido en safetensors y con licencia Apache 2.0.

El modelo no genera texto: es un *encoder-only* con una cabeza de clasificación que asigna una o varias etiquetas de emoción a una entrada breve. Su interés práctico está en el nicho: existen pocos modelos públicos para análisis emocional en indonesio, un idioma con más de 200 millones de hablantes y una actividad muy alta en redes sociales, y la mayoría de alternativas disponibles son modelos multilingües genéricos o clasificadores de sentimiento (positivo/negativo) en lugar de emoción.

La información publicada es mínima: la *model card* solo contiene metadatos (licencia, idioma, modelo base y etiquetas) y no detalla la taxonomía de etiquetas, el dataset de ajuste fino, el número de épocas ni métricas de evaluación. El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que se trata de un modelo sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-large (heredada de `indobenchmark/indobert-large-p2`) con cabeza de clasificación de secuencia |
| Parámetros totales | 335.151.113 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; por herencia de la arquitectura BERT se asume un máximo de 512 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors, sin versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos PyTorch) |
| Tarea (*pipeline*) | `text-classification` |
| Etiquetas declaradas | `emotion-analysis`, `socmed-classification` |
| Número de clases | No disponible |
| Modelo base | `indobenchmark/indobert-large-p2` |
| Tamaño del repositorio | 1,3 GB |
| Compatibilidad declarada | `text-embeddings-inference`, `endpoints_compatible` |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es la de IndoBERT-large-p2: un *encoder* Transformer bidireccional con el diseño de BERT-large (24 capas, representaciones de 1024 dimensiones y 16 cabezas de atención, según la configuración estándar de la familia; el dato exacto no se reproduce en la model card). Sobre ese tronco preentrenado se añade una cabeza de clasificación para la tarea de emociones, que es la que produce la salida del modelo. El preentrenamiento original de IndoBERT combina objetivos de *masked language modeling* y *next sentence prediction* sobre corpus indonesios diversos, e incluye una segunda fase (`p2`) con datos adicionales.

No hay información pública sobre el proceso de ajuste fino: se desconoce el corpus utilizado (aunque las etiquetas apuntan a texto de redes sociales), el número de ejemplos, la taxonomía exacta de emociones, si el entrenamiento fue multietiqueta o de etiqueta única, la proporción de clases, la longitud máxima de secuencia empleada y si se aplicaron técnicas de regularización o *early stopping*. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras), algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de emociones en texto indonesio, con especial orientación a registros informales de redes sociales (abreviaturas, argot, errores ortográficos, mezcla con inglés).
- Clasificación de secuencia estándar de `transformers`: devuelve etiquetas con sus puntuaciones de probabilidad mediante `pipeline("text-classification")`.
- Extracción de representaciones contextuales del texto (última capa oculta o *pooling* del token `[CLS]`), reutilizables como *features* para otros clasificadores.
- Procesamiento por lotes (*batching*) eficiente en GPU y CPU gracias a su tamaño contenido y a la ausencia de decodificación autoregresiva.
- No soporta generación de texto, razonamiento multi-paso, uso de herramientas (*tool calling*), agentes, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para indonesio; su comportamiento en malayo, javanés u otros idiomas cercanos no está documentado.

## Casos de uso

- **Monitorización de opinión en redes sociales en Indonesia**: clasificar en lote tuits, comentarios de Instagram o publicaciones de TikTok para cuantificar la distribución de emociones hacia una marca o un tema, aprovechando que el modelo está ajustado específicamente sobre registro informal.
- **Enrutamiento de tickets de atención al cliente**: usar la emoción detectada (por ejemplo, frustración o enfado, si la taxonomía las incluye) como señal para priorizar el ticket o derivarlo a un agente humano, con un coste de inferencia bajo al ser un encoder de 335 M de parámetros.
- **Analítica de reseñas y *feedback* de producto**: procesar reseñas de aplicaciones o comercio electrónico en indonesio y agregar la distribución emocional por versión, categoría o segmento de usuario para alimentar paneles de producto.
- **Moderación asistida de comunidades**: detectar señales de hostilidad o malestar en foros y secciones de comentarios para revisión humana; el modelo no sustituye a un moderador, pero reduce el volumen a revisar.
- **Investigación en ciencias sociales y lingüística computacional**: anotación automática de corpus indonesios a gran escala, con la ventaja de disponer de licencia Apache 2.0 y de un modelo base citable (IndoBERT), lo que facilita la reproducibilidad.
- **Preetiquetado para anotación humana**: generar etiquetas iniciales que los anotadores corrigen, reduciendo el coste de construir un corpus emocional propio y permitiendo medir el acuerdo entre modelo y anotador.
- **Clasificación de alto volumen en infraestructura modesta**: al no requerir decodificación autoregresiva, puede ejecutarse en CPU con `transformers` u ONNX Runtime para procesar millones de documentos cortos por día en un despliegue por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, precisión o recuento sobre ningún conjunto de evaluación, ni tampoco datos sobre el conjunto de test utilizado. Tampoco hay comparaciones publicadas con otros modelos de emoción en indonesio.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Exactitud / F1 en clasificación de emociones | No disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 1,34 GB en fp32, unos 0,67 GB en fp16/bf16 y unos 0,34 GB en int8, solo para los pesos; hay que sumar activaciones y memoria del *tokenizer*, del orden de cientos de MB con lotes pequeños y secuencias de 512 tokens.
- **GPU recomendadas**: cualquier GPU con 4 GB o más sirve para inferencia interactiva. Para despliegues por lotes de alto rendimiento, una NVIDIA T4, L4, A10 o A100 permiten aumentar el tamaño de lote; una RTX 3060, 4060 o 4090 es suficiente en estaciones de trabajo.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente todas las GPU de consumo de los últimos años, incluidas GTX 1650 (4 GB) o superiores. En fp32 requiere algo más de 1,3 GB, por lo que también funciona en iGPU con memoria compartida, aunque con mayor latencia.
- **CPU**: viable. Un encoder de 335 M de parámetros puede clasificar textos cortos en CPU con latencias del orden de decenas de milisegundos por muestra, aunque no se han publicado mediciones oficiales.
- **Opciones de despliegue**: `transformers` con `pipeline("text-classification")`, Hugging Face Inference Endpoints (el modelo declara compatibilidad con `text-embeddings-inference` y `endpoints_compatible`), exportación a ONNX Runtime para producción en CPU, TorchScript o un servidor propio con Triton. Un servidor tipo vLLM no es la opción natural, ya que está orientado a modelos generativos.
- **Latencia y throughput**: no disponible. No hay cifras publicadas de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Tarea | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| `djnsfull/emotion-socmed-1.0` | 335 M | 512 tokens (asumido) | Indonesio | Clasificación de emociones en redes sociales | Apache 2.0 | No disponibles |
| `indobenchmark/indobert-large-p2` | ~335 M | 512 tokens | Indonesio | Modelo base (MLM/NSP), sin cabeza de tarea | Desconocida en la información disponible | No disponibles en esta ficha |
| `indobenchmark/indobert-base-p2` | ~124 M | 512 tokens | Indonesio | Modelo base; requiere ajuste fino para clasificar | Desconocida en la información disponible | No disponibles en esta ficha |
| `bert-base-multilingual-cased` | ~178 M | 512 tokens | 104 idiomas, incluido indonesio | Modelo base multilingüe | Apache 2.0 | No aplica a esta tarea |

La comparación relevante es frente a los modelos base de IndoBERT: este modelo aporta una cabeza de clasificación ya entrenada, pero carece de cualquier métrica que permita verificar que ese ajuste fino supera a un `indobert-base-p2` ajustado por el propio equipo con datos propios. Frente a un multilingüe como mBERT, la ventaja teórica es un vocabulario y un preentrenamiento específicos de indonesio; la desventaja es que no cubre otros idiomas de la región.

## Limitaciones y advertencias

- **Sin evidencia de calidad**: no se publican métricas, conjunto de evaluación ni detalles del entrenamiento. No hay forma de saber si el modelo funciona mejor que un ajuste fino propio sobre IndoBERT-base.
- **Taxonomía de etiquetas desconocida**: se ignora cuántas emociones detecta y con qué definición. Cualquier uso en producción exige inspeccionar `config.id2label` y validar las salidas con datos propios.
- **Riesgo de sesgo**: al entrenarse presumiblemente sobre texto de redes sociales indonesias, puede heredar sesgos de género, religión, etnia o política presentes en ese corpus, y comportarse de forma desigual entre registros formales e informales.
- **Desplazamiento de dominio**: el modelo está orientado a *social media*; su rendimiento en texto legal, médico, periodístico o literario no está documentado y probablemente sea inferior.
- **Límite de longitud**: los textos superiores a 512 tokens se truncan, lo que puede eliminar información relevante en hilos o documentos largos.
- **Monolingüe**: fuera del indonesio, el comportamiento es impredecible; no debe usarse para clasificar texto en español, inglés o malayo sin una evaluación previa.
- **Uso responsable**: no debe emplearse como detector de salud mental, riesgo de autolesión ni diagnóstico clínico; las etiquetas emocionales son una señal débil y ruidosa.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y sin garantía alguna por parte del autor.
- **Madurez del proyecto**: 0 descargas y 0 *likes* en el momento de la consulta, un único autor y sin documentación de mantenimiento. Tratarlo como un experimento, no como un componente crítico sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djnsfull/emotion-socmed-1.0
- Modelo base: https://huggingface.co/indobenchmark/indobert-large-p2
- Artículo de IndoNLU / IndoBERT (Wilie et al., 2020): https://arxiv.org/abs/2009.05332
- Repositorio de IndoBenchmark: https://github.com/indobenchmark/indonlu
- Documentación de la librería `transformers`: https://huggingface.co/docs/transformers
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
