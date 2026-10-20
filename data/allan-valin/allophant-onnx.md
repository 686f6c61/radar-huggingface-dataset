# allan-valin/allophant-onnx

## Resumen

Allophant ONNX int8 es una conversión cuantizada del modelo kgnlp/allophant, un reconocedor fonético cross-lingual desarrollado por Kevin Glocker, Aaricia Herygers y Munir Georges (Interspeech 2023). El modelo original no predice fonemas directamente, sino que compone las puntuaciones de cada fonema a partir de atributos articulatorios, lo que le permite decodificar contra cualquier inventario fonético. Esta copia, publicada por el usuario allan-valin, fija un único inventario y lo exporta a ONNX para su uso con onnxruntime.

El cambio principal respecto al original es doble: se elimina la flexibilidad de inventario y se "hornea" la unión de 136 fonemas de 16 idiomas (en, es, tr, cmn, ar, hi, ru, de, fr, ja, ko, vi, fi, sw, yue, th), el mismo inventario que usa la herramienta phonetic-eval del autor; y se cuantizan a int8 por canal los pesos de las matmul. Según la model card, el inventario completo de 438 fonemas del original empeoraba 17 puntos de PER por culpa de los diacríticos raros, de ahí la decisión de recortar el conjunto de símbolos.

El resultado es un grafo ONNX pequeño (el repositorio completo ocupa 0,4 GB) que acepta una forma de onda cruda de 16 kHz y devuelve log-probabilidades CTC con 137 clases (136 fonemas más blank). Es relevante para quien necesite transcripción fonética en IPA sobre CPU sin dependencias de PyTorch, asumiendo una precisión moderada: PER 73,0 en el conjunto de evaluación declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocimiento fonético con decodificación CTC sobre atributos articulatorios; topología de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada es una forma de onda completa de 16 kHz (`wav` float32 `[1, samples]`) sin ventana declarada |
| Tipos de cuantizacion | int8 por canal en los pesos de las operaciones MatMul (versión publicada); el modelo base dispone de pesos en float |
| Idiomas soportados | 16 idiomas en el inventario fijo: en, es, tr, cmn, ar, hi, ru, de, fr, ja, ko, vi, fi, sw, yue, th |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) más `vocab.json`; entrada `wav` float32 `[1, samples]`, salida `logits` `[1, frames, 137]` |

## Arquitectura y entrenamiento

El modelo hereda el enfoque del paper Allophant: en lugar de clasificar directamente sobre un conjunto cerrado de fonemas, descompone cada símbolo en atributos articulatorios (rasgos de lugar y modo de articulación, sonoridad, etc.) y recombina esas puntuaciones para obtener la probabilidad de cada fonema del inventario elegido. Esa descomposición es la que permite al modelo original cambiar de inventario sin reentrenar; esta conversión sacrifica esa propiedad a cambio de simplicidad y de evitar los diacríticos poco representados en los datos.

El pipeline es un CTC clásico sobre forma de onda: la entrada es audio PCM a 16 kHz y la salida son log-probabilidades por frame, con decodificación greedy (argmax por frame, fusión de repeticiones y eliminación del símbolo blank). No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o ajuste supervisado adicional; el entrenamiento corresponde al modelo original de kgnlp. La innovación técnica destacable es la decodificación contra inventarios composicionales y, en esta copia, la exportación a ONNX con cuantización int8 por canal para inferencia ligera.

## Capacidades

- Reconocimiento fonético cross-lingual: convierte audio en una secuencia de símbolos IPA del inventario fijado de 136 fonemas.
- Salida de log-probabilidades por frame (137 clases incluyendo blank), lo que permite posprocesado propio, puntuaciones de confianza y decodificación alternativa a la greedy.
- Cobertura de 16 idiomas con un único modelo y un único vocabulario, sin necesidad de indicar el idioma de entrada.
- Funciona sobre formas de onda crudas: no requiere features acústicas externas ni alineamientos previos.
- Inferencia vía onnxruntime, apta para CPU y para despliegue sin PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto, traducción ni transcripción ortográfica; su salida es estrictamente fonética.
- Sin capacidades de visión, audio-vision, thinking mode ni audio generation.

## Casos de uso

- Evaluación de pronunciación en aprendizaje de idiomas (CAPT): comparar la secuencia IPA predicha con la secuencia esperada de una frase para calcular tasas de error fonético y señalar sonidos problemáticos al estudiante; el inventario de 16 idiomas cubre los pares típicos de aprendices de inglés, español o alemán.
- Investigación fonética comparada: transcribir un corpus paralelo en varios idiomas con un vocabulario unificado, lo que permite comparar inventarios y realizaciones alofónicas sin reconciliar símbolos entre modelos distintos.
- Métrica automática para sistemas TTS y ASR: usar PER y PFER del modelo como proxy de inteligibilidad en la evaluación de un sintetizador o de un reconocedor, integrándolo en un pipeline de CI mediante onnxruntime.
- Preprocesado para síntesis de voz: generar la secuencia de fonemas que alimenta un modelo acústico de TTS cuando no se dispone de un léxico de pronunciación para el idioma o el dominio.
- Análisis de acento y variación dialectal: explotar la salida por frames para localizar qué segmentos se desvían de la realización de referencia, útil en estudios sociolingüísticos o en selección de datos de entrenamiento.
- Detección de cobertura de idioma en datasets de habla: pasar muestras por el modelo y medir la proporción de fonemas fuera del inventario o con baja confianza para descartar audio mal etiquetado o fuera de dominio.
- Despliegue en entornos con recursos limitados: al ser un grafo ONNX int8 de un repositorio de 0,4 GB, puede ejecutarse en CPU dentro de un contenedor pequeño o en un dispositivo embebido para tareas de etiquetado fonético en lote.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre 760 enunciados de VoxAngeles (8 por cada uno de 95 idiomas), puntuación narrow, decodificación greedy y fonemas evaluados por separado:

| Modelo | Decodificación | PER | PFER |
|---|---|---|---|
| allophant-onnx (int8, inventario de 136 fonemas) | greedy | 73,0 | 23,2 |
| kgnlp/allophant original (inventario completo de 438 fonemas) | beam search | 71,5 | 22,2 |

No se han publicado en la información disponible resultados de benchmarks estándar de ASR (WER, MMLU, HumanEval, GSM8K) porque no son aplicables a un modelo de reconocimiento fonético.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en int8; el repositorio completo, incluyendo vocabulario y ficheros auxiliares, ocupa 0,4 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte de onnxruntime (por ejemplo, una RTX 4090) queda muy por encima de lo necesario. A100 o H100 solo tendrían sentido para procesar grandes lotes en paralelo.
- Cabe holgadamente en GPU consumer y en CPU: es el escenario de despliegue natural de esta conversión.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java, JavaScript), con el proveedor de ejecución por CPU o CUDA según disponibilidad; no se distribuyen pesos en formato GGUF, por lo que llama.cpp u Ollama no son aplicables, y al no ser un modelo de lenguaje no encaja en vLLM ni en TGI.
- Latencia y throughput: no disponibles. La decodificación greedy es más barata que el beam search del original, pero no se publican medidas de tiempo.
- Nota sobre entrada: el grafo espera una forma de onda completa en un tensor `[1, samples]`; para audio largo conviene segmentar externamente y gestionar las fronteras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| allan-valin/allophant-onnx (esta ficha) | no disponible | forma de onda 16 kHz, inventario fijo de 136 fonemas, 16 idiomas | PER 73,0 / PFER 23,2 (greedy, VoxAngeles) | apache-2.0 | HuggingFace, ONNX int8 |
| kgnlp/allophant (original) | no disponible | forma de onda 16 kHz, inventario configurable (hasta 438 fonemas) | PER 71,5 / PFER 22,2 (beam search, VoxAngeles) | apache-2.0 | HuggingFace, pesos originales |
| Otros reconocedores fonéticos CTC basados en wav2vec2 | no disponible en la información proporcionada | típicamente features auto-supervisadas, inventario fijo por modelo | no disponible | variable según modelo | HuggingFace |

## Limitaciones y advertencias

- Precisión moderada: PER 73,0 y PFER 23,2 sobre VoxAngeles indican que una parte sustancial de los fonemas no se reconoce correctamente en condiciones multilingües y posiblemente ruidosas; no es un modelo para transcripción fonética de alta fidelidad.
- El inventario está fijado a 136 fonemas de 16 idiomas: cualquier sonido fuera de ese conjunto (clics, diacríticos raros, fonemas de lenguas no cubiertas) no puede emitirse y se mapeará al símbolo más cercano.
- La decodificación publicada es greedy; el autor reporta que el original con beam search obtiene 1,5 puntos de PER y 1,0 de PFER mejores, de modo que parte de la pérdida es de decodificación y no del modelo.
- No hay información sobre sesgos demográficos, de género o de acento en los datos de entrenamiento; al tratarse de un modelo entrenado mayoritariamente sobre corpus de lectura o de dominio público, es esperable un peor comportamiento en habla espontánea, infantil o con ruido de fondo.
- Riesgo de alucinación en sentido fonético: el CTC siempre emite una secuencia, incluso ante silencio, música o habla no cubierta; conviene filtrar por confianza media o por energía del audio.
- Sin marcas de tiempo ni alineamiento a nivel de palabra: la salida es por frame y el consumidor debe derivar la segmentación.
- El modelo base puede requerir 16 kHz y mono; no se documenta comportamiento con otras frecuencias de muestreo ni con audio multicanal.
- Licencia Apache 2.0, que permite uso comercial y modificación con atribución y conservación del aviso de licencia; conviene citar tanto el trabajo original (Interspeech 2023) como la conversión.
- La fecha de creación del repositorio indicada en HuggingFace es posterior a la de esta ficha; verificar la vigencia y el estado del repositorio antes de fijarlo como dependencia en producción.
- Sin métricas de latencia publicadas: es necesario medir el rendimiento en el hardware objetivo antes de comprometerse con un SLA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allan-valin/allophant-onnx
- Modelo original: https://huggingface.co/kgnlp/allophant
- Paper: Allophant: Cross-lingual Phoneme Recognition with Articulatory Attributes (Interspeech 2023): https://arxiv.org/abs/2306.04306
- Herramienta phonetic-eval: https://github.com/allan-valin/phonetic-eval
- Proyecto speech-to-ipa: https://github.com/allan-valin/speech-to-ipa
- Script de exportación a ONNX: https://github.com/allan-valin/speech-to-ipa/blob/main/eval/export_allophant_onnx.py
