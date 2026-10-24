# saranss/indicbertv2-indicglue-topic-6lang

## Resumen

`saranss/indicbertv2-indicglue-topic-6lang` es un clasificador de texto en seis lenguas indias obtenido por ajuste fino de `ai4bharat/IndicBERTv2-MLM-only`, el encoder BERT multilingüe de AI4Bharat preentrenado sobre IndicCorp v2 (20.900 millones de tokens en 24 lenguas). La tarea concreta es la clasificación de género o temática periodística sobre el subconjunto de noticias de IndicGLUE (`inltkh` para tamil, malayalam, marathi y gujarati; `sna` para bengalí; `bbca` para hindi), con una unión de 17 etiquetas (negocios, entretenimiento, deportes, etc.). El modelo lo publica el usuario `saranss` como parte del proyecto "Low-resource Indic text classifier: IndicBERT transfer learning with Hugging Face deployment", y forma pareja con otro checkpoint hermano dedicado a análisis de sentimiento en 13 lenguas.

Se trata de un encoder transformer de 12 capas y 278.054.417 parámetros totales (vocabulario IndicBERTv2 incluido), entrenado con la matriz de embeddings congelada: solo se actualizan 86 millones de parámetros (capas transformer y cabeza de clasificación), una decisión motivada por un presupuesto de GPU de 4 GB. La entrada se trunca a 128 tokens subword y cada lengua dispone de un máximo de 1.000 artículos de entrenamiento, lo que lo sitúa firmemente en el régimen de bajos recursos.

Su relevancia es doble: por un lado ofrece un punto de partida reproducible y con licencia MIT para clasificación temática en lenguas indias infrarrepresentadas; por otro, documenta de forma transparente el desequilibrio de clases por lengua (desde 1,16 en malayalam hasta 80,8 en hindi), un factor crítico que condiciona la interpretación del macro-F1. El repositorio incluye pesos en safetensors y una exportación ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), 12 capas, ajustado desde IndicBERTv2-MLM-only |
| Parámetros totales | 278.054.417 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens subword (truncado; datos de entrenamiento y uso previsto) |
| Tipos de cuantización | No disponible (el repositorio distribuye safetensors y ONNX; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | 6: bengalí (bn), gujarati (gu), hindi (hi), malayalam (ml), marathi (mr), tamil (ta). Las etiquetas de HuggingFace listan 13 lenguas por herencia del proyecto, pero el clasificador temático solo cubre esas 6 |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 12 capas con tokenizador y vocabulario de IndicBERTv2, sobre el que se añade una cabeza de clasificación de secuencia para 17 etiquetas (unión de las etiquetas presentes en los seis corpus de noticias). El ajuste fino se realizó con el `Trainer` de HuggingFace: learning rate 3e-5, batch de 16, precisión fp16, máximo de 128 tokens, hasta 5 épocas con early stopping sobre macro-F1 de validación (paciencia 3) y semilla 42. La matriz de embeddings de palabras permaneció congelada, de modo que solo se entrenaron 86 M de los 278 M de parámetros; para el subconjunto temático se aplicó pérdida ponderada por clase para compensar el fuerte desequilibrio.

Los datos provienen de IndicGLUE (subconjunto de género periodístico), limitado deliberadamente a bajos recursos: 1.000 artículos de entrenamiento y 300 de validación por lengua, con conjuntos de test de tamaño variable. El desequilibrio de clases por lengua es muy dispar: bengalí 9,04; gujarati 2,17; hindi 80,8; malayalam 1,16; marathi 6,18; tamil 1,51. El preprocesado incluye normalización Unicode NFC, normalización de escritura IndicNLP (conservando nuktas), eliminación de caracteres de ancho cero y normalización de danda. La partición de test resultante es de 1.000 ejemplos en bengalí y marathi, 856 en hindi, 669 en tamil, 659 en gujarati y 619 en malayalam.

## Capacidades

- Clasificación de texto multietiqueta en un conjunto de 17 categorías temáticas (negocios, entretenimiento, deportes, etc.) para titulares y cuerpos de noticias en seis lenguas indias.
- Detección automática de escritura de entrada; acepta texto en escritura nativa y, con degradación de precisión, texto romanizado en alfabeto latino.
- Inferencia por secuencia corta: adecuado para titulares, sumarios y párrafos de hasta 128 tokens subword.
- Uso como extractor de representaciones contextuales (encoder BERT), reutilizable para otras tareas de clasificación mediante nuevo ajuste fino.
- Exportación ONNX para inferencia optimizada fuera de PyTorch; etiquetas `text-embeddings-inference` y `endpoints_compatible` en HuggingFace.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un clasificador discriminativo.

## Casos de uso

- Clasificación temática de flujos de noticias regionales: agregar titulares y entradillas en hindi, bengalí, tamil, malayalam, marathi o gujarati en categorías editoriales para enrutado automático a secciones, con la ventaja de un único checkpoint para las seis lenguas.
- Moderación y organización de contenidos en plataformas locales: asignar género a artículos antes de la revisión humana, aprovechando que el modelo funciona en CPU y no requiere GPU dedicada.
- Etiquetado asistido para curación de corpus: preanotar grandes volúmenes de texto en lenguas indias y reservar la revisión humana para los casos de baja confianza, reduciendo el coste de construcción de datasets propios.
- Señalización de tendencias y análisis de medios: agregar predicciones por categoría y por lengua para medir la distribución temática de la cobertura informativa en distintos mercados lingüísticos.
- Baseline en investigación sobre NLP de bajos recursos: punto de comparación reproducible (semilla 42, hiperparámetros documentados) frente a alternativas multilingües como XLM-R en experimentos académicos.
- Punto de partida para ajuste fino en dominio propio: al ser un encoder con licencia MIT, se puede reentrenar la cabeza de clasificación con datos internos (por ejemplo, clasificación de tickets o documentos) manteniendo el cuerpo preentrenado en 20.900 millones de tokens indios.
- Filtrado previo en pipelines de datos: descartar o separar contenido no periodístico antes de procesos más costosos, dado el bajo coste computacional por secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de métricas accesible de la model card está truncada y la tabla que aparece corresponde al checkpoint hermano de sentimiento (`indicbertv2-indicsentiment-13lang`), no a este clasificador temático; por tanto no se reproducen aquí cifras que no pertenezcan a este modelo.

Los únicos datos de evaluación documentados para este checkpoint son la composición y el desequilibrio de los conjuntos de test:

| Lengua | Test (artículos) | Desequilibrio de clases |
|---|---|---|
| Bengalí (bn) | 1.000 | 9,04 |
| Gujarati (gu) | 659 | 2,17 |
| Hindi (hi) | 856 | 80,8 |
| Malayalam (ml) | 619 | 1,16 |
| Marathi (mr) | 1.000 | 6,18 |
| Tamil (ta) | 669 | 1,51 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 0,56 GB; en fp32, alrededor de 1,1 GB. Con batch pequeño y longitud 128, el pico de memoria se mantiene por debajo de 2 GB en fp16.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente (RTX 3050, T4, GTX 1660). Para alto throughput en servidor, A100 o H100 están sobredimensionadas pero permiten procesar lotes muy grandes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para volúmenes moderados; el ajuste fino original se realizó con un presupuesto de 4 GB de GPU, lo que da idea de la huella del modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, ONNX Runtime sobre la exportación incluida, y Text Embeddings Inference (el modelo lleva la etiqueta `text-embeddings-inference`). vLLM, llama.cpp y Ollama no son la vía natural para un encoder clasificador de este tipo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `saranss/indicbertv2-indicglue-topic-6lang` | 278 M | 128 tokens | 6 lenguas indias | MIT | Clasificador temático ajustado con 1.000 ejemplos por lengua |
| `ai4bharat/IndicBERTv2-MLM-only` (modelo base) | 278 M | 512 tokens (BERT estándar; no confirmado en la información) | 24 lenguas | MIT | Solo preentrenamiento MLM; requiere ajuste fino para clasificar |
| `ai4bharat/IndicBERTv2-SS` | No disponible | No disponible | 26 lenguas | MIT | Variante del mismo modelo base orientada a `fill-mask` |
| XLM-RoBERTa base (usado como baseline en el proyecto) | ~278 M | 512 tokens | ~100 lenguas | MIT | Comparable en tamaño; el proyecto lo reporta como referencia para la tarea de sentimiento, no para la temática |

Los datos de XLM-R y de las variantes de IndicBERTv2 provienen de sus model cards públicas y no han sido verificados en esta búsqueda; la comparación de rendimiento en la tarea temática no está disponible.

## Limitaciones y advertencias

- Desequilibrio de clases extremo en varias lenguas (hindi 80,8; bengalí 9,04; marathi 6,18): el macro-F1 puede estar dominado por unas pocas clases mayoritarias y las categorías raras quedan infrarrepresentadas.
- Volumen de entrenamiento muy reducido (1.000 ejemplos por lengua) y embeddings congelados: la capacidad de generalización a dominios distintos del periodístico es limitada.
- Truncado a 128 tokens subword: se pierde información en artículos largos; el modelo está pensado para titulares y textos cortos.
- La unión de 17 etiquetas agrega categorías que no existen en todos los corpus, por lo que el modelo puede predecir etiquetas ausentes en la taxonomía real de una lengua concreta.
- La entrada romanizada (alfabeto latino) se acepta pero degrada la precisión; el texto con jerga, abreviaturas o code-switching con inglés queda explícitamente fuera del alcance declarado.
- Uso fuera de alcance según el autor: decisiones sobre personas (moderación, selección de personal, crédito), texto clínico o legal, y lenguas no listadas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos o de dominio desplazado.
- Estado de adopción nulo: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Licencia MIT para los pesos, pero los corpus de origen (IndicGLUE, IndicSentiment) tienen sus propias condiciones de uso que conviene revisar antes de un despliegue comercial.
- Fecha de creación del repositorio registrada como 2026-10-24, posterior a la de otras referencias del ecosistema; conviene verificar la vigencia y el mantenimiento del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saranss/indicbertv2-indicglue-topic-6lang
- Modelo base: https://huggingface.co/ai4bharat/IndicBERTv2-MLM-only
- Variante IndicBERTv2-SS: https://huggingface.co/ai4bharat/IndicBERTv2-SS
- Colección IndicBERT v2 de AI4Bharat: https://huggingface.co/collections/ai4bharat/indicbert-v2-66c5a0bd4ee34ebc59303bc5
- Página de IndicBERTv2 en AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/LLM/IndicBERTv2/
- Benchmark IndicGLUE: https://indicnlp.ai4bharat.org/indic-glue/
- IndicGLUE (página alternativa): https://indicnlp.ai4bharat.org/pages/indic-glue/
- Dataset IndicSentiment: https://huggingface.co/datasets/ai4bharat/IndicSentiment
- Dataset IndicGLUE: https://huggingface.co/datasets/ai4bharat/indic_glue
