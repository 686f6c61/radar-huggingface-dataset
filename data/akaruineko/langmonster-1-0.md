# akaruineko/langmonster-1.0

## Resumen

langmonster-1.0 es un modelo de clasificación de texto especializado en identificación de idioma a nivel de frase, desarrollado por akaruineko (Георгий Куликов). Está entrenado para reconocer 19 idiomas a partir de oraciones individuales, utilizando un codificador transformer compacto de 15,17 millones de parámetros. El modelo se distribuye bajo licencia MIT y está implementado con TensorFlow 2.20 y Keras 3.

El modelo resuelve el problema de detectar automáticamente el idioma de un texto corto, una tarea fundamental en pipelines de procesamiento de lenguaje natural, enrutamiento de contenido o análisis multilingüe. Su relevancia radica en su tamaño reducido (0,4 GB) y su arquitectura eficiente, que permite ejecutarlo en hardware modesto, incluidas CPUs y GPUs de consumo. Está entrenado con datos de Tatoeba, un corpus colaborativo de frases traducidas, con un total de 2,87 millones de oraciones válidas distribuidas entre los 19 idiomas soportados.

La arquitectura es un transformer encoder de 3 bloques con dimensiones de modelo de 256, 8 cabezas de atención y una red feed-forward de 1024 unidades, seguido de un pooling global y una capa softmax. El tokenizador es de nivel de palabra con un vocabulario de 50.000 términos y una longitud fija de entrada de 128 tokens. El modelo alcanzó una precisión de entrenamiento del 96,92% y una pérdida de 0,0915 tras tres épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (3 bloques, d_model 256, 8 cabezas, FFN 1024) + global average pooling + softmax |
| Parametros totales | 15,17 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (maxlen fijo) |
| Tipos de cuantizacion | No disponible (modelo Keras sin cuantización publicada) |
| Idiomas soportados | 19: eng, spa, fra, deu, rus, bul, ell, ara, cmn, jpn, ita, por, tur, nld, hin, pol, tha, urd, vie |
| Licencia | MIT |
| Formato de pesos | Keras (.keras) |

## Arquitectura y entrenamiento

El modelo emplea un codificador transformer compacto de 3 bloques, cada uno con atención de 8 cabezas y dimensión de modelo 256, seguido de una red feed-forward de 1024 unidades. Tras el último bloque se aplica un pooling global promedio y una capa softmax sobre 19 clases. El tokenizador es una capa `TextVectorization` de Keras a nivel de palabra, con un vocabulario de 50.000 términos y una longitud fija de 128 tokens por entrada. Esta configuración evita el uso de n-gramas de caracteres y mantiene formas estáticas para compatibilidad con TPU.

El entrenamiento se realizó sobre el conjunto de frases de Tatoeba (`sentences.csv`, 13,5 millones de oraciones), filtrado a los 19 idiomas objetivo y con un tope máximo de 250.000 frases por idioma para los mejor representados. El total de frases válidas fue de 2.870.490. Se utilizó el optimizador Adam con tasa de aprendizaje 1e-3, un tamaño de lote global de 512 y se ejecutaron 3 épocas (18.575 pasos por época) en una GPU NVIDIA A100 de 40 GB. La precisión final en el conjunto de entrenamiento fue de 0,9692 y la pérdida de 0,0915. No se dispone de un conjunto de validación separado en esta versión.

## Capacidades

- Identificación de idioma a nivel de frase para 19 lenguas, incluyendo inglés, español, francés, alemán, ruso, búlgaro, griego, árabe, chino mandarín, japonés, italiano, portugués, turco, neerlandés, hindi, polaco, tailandés, urdu y vietnamita.
- Clasificación de texto corto con una longitud máxima de 128 tokens, adecuada para oraciones individuales.
- Salida de probabilidades softmax sobre las 19 clases, lo que permite umbrales personalizados o selección de múltiples candidatos.
- Inferencia eficiente gracias a su tamaño reducido (15,17M parámetros), apta para ejecución en CPU, GPU o incluso dispositivos embebidos.
- Compatible con el ecosistema Keras/TensorFlow, permitiendo integración directa en pipelines existentes.
- Entrenamiento reproducible con el script disponible en GitHub, que soporta ejecución en GPU local o Google Cloud TPU v6e.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo puede clasificar el idioma de cada mensaje entrante y dirigirlo al equipo de soporte correspondiente, reduciendo el tiempo de respuesta y mejorando la experiencia del usuario.
- Preprocesamiento de datos multilingües: en pipelines de NLP que reciben textos de orígenes diversos, langmonster-1.0 permite filtrar o etiquetar automáticamente el idioma antes de aplicar modelos posteriores como análisis de sentimiento o traducción.
- Clasificación de comentarios en redes sociales: para plataformas que moderan contenido en múltiples idiomas, el modelo puede identificar el idioma de cada comentario y aplicar políticas específicas según la región o lengua.
- Detección de idioma en transcripciones de voz: tras una etapa de reconocimiento de voz, las frases resultantes pueden clasificarse con este modelo para enrutar la transcripción a un sistema de procesamiento de lenguaje natural adecuado.
- Análisis de corpus lingüísticos: investigadores pueden usar el modelo para etiquetar automáticamente grandes colecciones de oraciones, facilitando estudios comparativos entre lenguas o la creación de datasets balanceados.
- Filtrado de contenido en aplicaciones multilingües: en foros o chats, el modelo puede detectar el idioma predominante de cada mensaje y activar traducciones automáticas o notificaciones al usuario en su lengua preferida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval u otros) en la información disponible. El único dato de rendimiento reportado es la precisión de entrenamiento del 96,92% y la pérdida de 0,0915, obtenidas sobre el propio conjunto de entrenamiento. El autor advierte que no existe un conjunto de validación separado en esta versión, por lo que estos números deben interpretarse con cautela. Se espera un rendimiento fuerte en los cinco idiomas mejor representados (inglés, español, francés, alemán y ruso, con 250.000 frases cada uno) y un rendimiento inferior en idiomas de bajos recursos como urdu, tailandés, hindi o búlgaro, que cuentan con pocos miles de muestras.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32, dado el tamaño de 15,17 millones de parámetros. Con cuantización a FP16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti o superior. También funciona en CPUs modernas sin GPU.
- Compatibilidad con hardware de consumo: sí, el modelo cabe en cualquier ordenador personal, incluidas laptops sin GPU dedicada.
- Opciones de despliegue: al ser un modelo Keras, puede servirse con TensorFlow Serving, TFLite para móviles, o mediante contenedores Docker con TensorFlow Runtime. También es posible exportarlo a ONNX para usar con otros motores de inferencia.
- Latencia y throughput estimados: no se proporcionan datos oficiales, pero para un modelo de este tamaño se esperan latencias de pocos milisegundos por frase en CPU moderna y de sub-milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de identificación de idioma. Como referencia general, existen alternativas como fastText (modelos de clasificación de idioma con ~1M de parámetros) o langid.py (basado en Naive Bayes), pero no hay datos concretos de rendimiento comparativo con langmonster-1.0 en la información proporcionada. Por tanto, esta sección queda sin datos específicos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con frases de Tatoeba, un corpus de estilo formal y traducido. Textos informales, jerga, redes sociales o dominios técnicos pueden degradar significativamente la precisión.
- No existe un conjunto de validación separado; la precisión reportada corresponde al entrenamiento, por lo que puede haber sobreajuste.
- Idiomas con pocas muestras (urd, tha, hin, bul) son poco fiables y pueden confundirse con lenguas cercanas.
- El modelo opera solo a nivel de frase; documentos largos deben dividirse en oraciones antes de la clasificación.
- La licencia MIT permite uso comercial y modificación, pero los datos de Tatoeba están sujetos a sus propios términos de uso, que deben revisarse para aplicaciones de producción.
- No se incluyen idiomas como el swahili, a pesar de estar en la lista original, por falta de datos en Tatoeba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akaruineko/langmonster-1.0
- Repositorio GitHub: https://github.com/akaruineko-ai/langmonster/tree/main
- Perfil del autor en Hugging Face: https://huggingface.co/akaruineko/models
- Tatoeba (fuente de datos): https://tatoeba.org
- Términos de uso de Tatoeba: https://tatoeba.org/en/terms_of_use
