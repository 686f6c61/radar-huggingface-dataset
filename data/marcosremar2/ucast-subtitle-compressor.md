# marcosremar2/ucast-subtitle-compressor

## Resumen

ucast subtitle compressor es un modelo de clasificación de tokens derivado de microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank, desarrollado por el usuario marcosremar2 para la aplicación de subtitulado en vivo ucast.me. Su función es comprimir fragmentos de habla transcrita (2-4 frases) eliminando palabras, sin reescribir ni generar texto nuevo, de modo que la línea resultante sea más corta y legible en pantalla mientras el hablante continúa. Al ser un modelo deletion-only, no puede inventar cifras, nombres ni términos que no se hayan dicho, lo que reduce el riesgo de alucinación en un contexto de accesibilidad en tiempo real.

Técnicamente es un BertForTokenClassification de 12 capas y 177.341.186 parámetros, con dos etiquetas (drop/keep), afinado desde el checkpoint multilingüe de LLMLingua-2. Los pesos se distribuyen en fp16 (355 MB) y en una versión ONNX (279 MB) con el vocabulario recortado al script latino (69.882 de 119.547 tokens), pensada para ejecutarse en el navegador del espectador. Soporta portugués, francés, español e inglés, y se entrenó con subtítulos de YouTube del dataset YODAS2 (CC BY 3.0).

Su relevancia actual reside en el enfoque híbrido: un clasificador pequeño y desplegable en local, combinado con reglas deterministas que protegen números, fechas, negaciones, nombres y acrónimos. Con el ajuste por defecto (w = 0.6) recorta en torno al 20 % de las palabras y, sobre 1.600 fragmentos de vídeos no vistos en entrenamiento ni en selección de hiperparámetros, presenta un 1,3 % de errores graves según un juez Qwen2.5-72B (límite superior del intervalo de confianza al 95 %: 1,88 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BertForTokenClassification, 12 capas) |
| Parametros totales | 177.341.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con hasta 3 subtítulos previos como contexto; 2-4 frases, 25-70 palabras por fragmento) |
| Tipos de cuantizacion | fp16 (355 MB); ONNX con vocabulario reducido al script latino (279 MB) |
| Idiomas soportados | pt, fr, es, en |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX (onnx/compressor.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base multilingüe con cabeza de clasificación de tokens y dos etiquetas (drop/keep), afinado desde microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank. Cada sub-token hereda la etiqueta de su palabra. La entrada es un par (contexto, texto), donde el contexto son hasta 3 subtítulos anteriores; según el autor, el contexto no aportó mejora con el mismo nivel de recorte, por lo que la configuración por defecto no lo utiliza y el primer segmento se representa como "-".

El entrenamiento partió de fragmentos de 2-4 frases (25-70 palabras) extraídos de los subtítulos de YODAS2 (subconjuntos *000, vídeos de YouTube publicados bajo CC BY 3.0 con subtítulos de sus propios autores), excluyendo líneas no habladas (enlaces, música, créditos, etiquetas de sonido) y con un máximo de 6 fragmentos por vídeo. La partición se hizo por hash del identificador de vídeo: 2.100 fragmentos por idioma para entrenamiento, 400 por idioma para calibración y 400 por idioma para validación fresca. Las etiquetas se generaron con Qwen2.5-72B-Instruct (AWQ, servido con vLLM) en una H100, pidiendo recortes en dos estilos (ligero y agresivo) y aceptando solo respuestas que fueran el fragmento original con palabras eliminadas (6.068 ligeras y 6.536 agresivas de 8.400). Los dos estilos se fusionaron en 5.451 fragmentos: las etiquetas agresivas deciden qué frases completas se eliminan y las ligeras qué palabras se quitan dentro de las frases que se mantienen, con las palabras protegidas siempre conservadas. El ajuste fino se realizó durante 4 épocas con lr 3e-5 y batch 32.

La innovación principal no está en la arquitectura sino en el pipeline de decisión: las probabilidades del modelo se combinan con reglas deterministas (`common.decide`) que protegen números (dígitos o palabras, más la unidad posterior), días, meses, "hoy" y "mañana", negaciones, nombres, acrónimos y la palabra corta anterior a cualquiera de ellos. Una frase solo se elimina completa si nada en ella está protegido, no es una pregunta y su probabilidad media de conservación queda por debajo de `sentence_drop`. Una palabra solo se elimina si el modelo está seguro (probabilidad de conservación por debajo de `word_drop`). No se permiten fragmentos: una frase que quedaría con menos de `min_share` (0,5) de sus palabras se elimina entera o se conserva entera si contiene algo protegido. Las repeticiones literales conservan solo la primera copia. `render` recoloca el final de frase al último token conservado y pone mayúscula al inicio de la nueva frase. El parámetro `w` fija `word_drop = sentence_drop = w`.

## Capacidades

- Compresión de subtítulos en vivo mediante eliminación de palabras, sin reescritura ni generación de texto nuevo.
- Clasificación de tokens con dos etiquetas (drop/keep) sobre texto multilingüe en pt, fr, es y en.
- Protección determinista de entidades críticas: números, unidades, fechas, días, meses, referencias temporales ("hoy", "mañana"), negaciones, nombres y acrónimos.
- Eliminación de frases completas cuando no contienen elementos protegidos y no son interrogativas.
- Deduplicación de frases repetidas literalmente.
- Reconstrucción coherente del texto con puntuación y mayúsculas (`common.render`).
- Ejecución local en el navegador mediante el archivo ONNX incluido.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Subtitulado en vivo accesible: la aplicación ucast.me ejecuta el ONNX en el ordenador del espectador para acortar la línea "Resumida" mientras el hablante sigue hablando; el recorte del ~20 % facilita la lectura en proyector sin perder información crítica gracias a las reglas de protección.
- Retransmisiones multilingües: al cubrir pt, fr, es e inglés con un único modelo, un mismo despliegue puede servir eventos con ponentes en varios idiomas sin cambiar de checkpoint.
- Accesibilidad para personas con dificultades de lectura: la reducción de palabras por línea disminuye la carga cognitiva en subtítulos de vídeo bajo demanda, manteniendo intactos números y nombres propios.
- Postprocesado de transcripciones automáticas: integrado tras un ASR, el modelo elimina muletillas y redundancias de forma conservadora, sin introducir texto que el hablante no haya dicho.
- Generación de resúmenes de actas o notas de reunión: al ser deletion-only, el resultado es una versión literal abreviada del original, auditable y sin riesgo de cifras inventadas, adecuada para entornos donde la fidelidad es requisito.
- Despliegue en el cliente sin servidor: el ONNX de 279 MB con vocabulario latino reducido permite inferencia en navegador o en dispositivos modestos, útil para aplicaciones de accesibilidad que no pueden enviar audio o texto a la nube.
- Filtrado previo en pipelines de subtitulado para plataformas de vídeo: reduce el ancho de banda y el espacio de almacenamiento de pistas de subtítulos manteniendo la estructura semántica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de error grave (juez Qwen2.5-72B) | 1,3 % de 1.600 fragmentos no vistos |
| Limite superior del IC al 95 % | 1,88 % |
| Recorte de palabras con w = 0.6 | ~20 % |
| Fragmentos de evaluacion | 1.600 (400 por idioma, vídeos no usados en entrenamiento ni calibración) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación reportada se basa en la métrica NER de Romero-Fresco, empleada por Ofcom, la BBC y ABNT NBR 15290, que clasifica los recortes en edición correcta, error menor, error estándar y error grave.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (355 MB de pesos) y en torno a 300 MB para el ONNX de 279 MB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo es lo bastante pequeño para ejecutarse en CPU con latencias aceptables para fragmentos de 25-70 palabras.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en iGPU modernas vía ONNX Runtime.
- Opciones de despliegue: PyTorch + Transformers (script `compress.py` incluido), ONNX Runtime para ejecución en navegador o en cliente, y cualquier servidor compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo y la naturaleza de la tarea (clasificación de tokens sobre fragmentos cortos) sugieren latencias de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ucast subtitle compressor | 177 M | no disponible | pt, fr, es, en | cc-by-4.0 | Clasificador deletion-only con reglas de protección |
| microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank | no disponible | no disponible | multilingüe | no disponible | Compresión de prompts deletion-only (modelo base) |
| LLMLingua-2 (familia) | no disponible | no disponible | multilingüe | no disponible | Compresión de prompts para LLM |
| mBERT base | ~178 M | 512 tokens | multilingüe | no disponible | Encoder multilingüe genérico |

La comparación directa con alternativas de compresión de subtítulos en vivo no está disponible en la información proporcionada. El modelo se distingue de LLMLingua-2 por su especialización en subtítulos, su conjunto de reglas de protección de entidades y su empaquetado ONNX para ejecución en cliente.

## Limitaciones y advertencias

- El modelo solo elimina palabras; no reescribe ni corrige errores del texto de entrada, por lo que la calidad final depende de la transcripción original.
- El vocabulario del ONNX está recortado al script latino (69.882 tokens); cualquier palabra con caracteres de otro script se interpreta como `[UNK]`, lo que puede degradar el comportamiento en textos con alfabetos no latinos.
- El contexto de hasta 3 subtítulos previos no aportó mejora en la calibración, por lo que la configuración por defecto no lo usa; no se debe esperar coherencia entre turnos basada en contexto.
- La tasa de error grave del 1,3 % (IC 95 % superior 1,88 %) se midió con un juez automático (Qwen2.5-72B), no con evaluación humana; el propio autor la presenta como cota superior.
- Los datos de entrenamiento provienen de subtítulos de YouTube (YODAS2), lo que puede introducir sesgos de dominio (registro coloquial, temas de vídeo) y de distribución lingüística entre los cuatro idiomas.
- Las reglas de protección cubren números, fechas, negaciones, nombres y acrónimos, pero no garantizan la preservación de matices pragmáticos, ironía o dependencias sintácticas complejas.
- Licencia cc-by-4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- El modelo no ha sido evaluado para otros dominios distintos del subtitulado (por ejemplo, texto jurídico o médico), donde las reglas de protección podrían ser insuficientes.
- No se han publicado métricas de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosremar2/ucast-subtitle-compressor
- Modelo base: https://huggingface.co/microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank
- Dataset de entrenamiento: https://huggingface.co/datasets/espnet/yodas2
- Aplicación ucast.me: https://ucast.me
