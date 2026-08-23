# agbalu/Feraoun-Pro

## Resumen

Feraoun-Pro es un modelo de reconocimiento óptico de caracteres (OCR) a nivel de línea desarrollado por AƔBALU, una iniciativa de procesamiento de lenguaje natural para el kabyle (Taqbaylit, código ISO 639-3 `kab`), una lengua bereber del norte de Argelia con entre 5 y 7 millones de hablantes. El modelo lee una línea impresa de texto kabyle desde una tira de píxeles y la transcribe a texto en dos escrituras a la vez: la ortografía latina bereber y el alfabeto neo-tifinag, desde un único punto de control, sin que se le indique qué escritura está viendo, en un solo paso hacia adelante. Resuelve un problema concreto: el registro escrito del kabyle está en papel —novelas, gramáticas, periódicos y archivos escaneados— y los OCR de propósito general no fueron entrenados con esta lengua, por lo que pierden las consonantes enfáticas con sub-punto (`ḍ ḥ ṛ ṣ ṭ ẓ`) que cambian el significado de las palabras.

El modelo se compone de un tronco convolucional de 5 capas, un encoder Transformer de 16 capas con 512 dimensiones ocultas y 8 cabezas, y una cabeza CTC sobre 173 clases con decodificación greedy. Cuenta con 51,57 millones de parámetros en los pesos publicados (el checkpoint de entrenamiento tiene 60,16 millones, incluyendo un decoder auxiliar que no se exporta). Su ventana de entrada es una imagen de altura fija de 64 píxeles y ancho variable hasta 1024 píxeles, con proporción de aspecto preservada. Se entrenó con 600 000 líneas sintéticas (85 % en latín, 15 % en neo-tifinagh) y se evaluó en 30 000 líneas retenidas, logrando una tasa de error de carácter (CER) del 7,34 % en latín y del 0,91 % en neo-tifinagh, con un 81,77 % de coincidencia exacta de línea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tronco convolutional (5 capas) + encoder Transformer pre-norm (16 capas, 512 ocultas, 8 cabezas) + cabeza CTC (173 clases) |
| Parámetros totales | 51 572 621 (elementos tensor en safetensors); 51 440 589 parámetros + 132 036 elementos de buffer |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa imágenes, no secuencias de texto; el ancho máximo de imagen es 1024 píxeles) |
| Tipos de cuantización | No disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | Kabyle (Taqbaylit, `kab`) en escritura latina bereber y neo-tifinagh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Feraoun-Pro es un reconocedor CTC puro, sin decoder autoregresivo, sin búsqueda de haz ni caché de claves/valores. Una línea de texto se procesa en un único paso hacia adelante: el tronco convolutional de 5 capas extrae características de la imagen de altura fija (64 píxeles) y ancho variable (hasta 1024 píxeles); el encoder Transformer de 16 capas pre-norm con 512 dimensiones ocultas y 8 cabezas procesa esas características; y una proyección lineal más un argmax CTC sobre 173 clases produce la transcripción. El vocabulario incluye 4 tokens especiales, el alfabeto latino completo, las consonantes enfáticas con sub-punto (`ḍ ḥ ṛ ṣ ṭ ẓ`), la convención de Boulifa `ţ`/`Ţ` (que ningún otro sistema OCR kabyle tiene), dígitos, puntuación y 33 códigos neo-tifinagh.

El entrenamiento se realizó con 600 000 líneas sintéticas renderizadas (frente a las 80 000 de su predecesor Feraoun-36M), con una mezcla del 85 % en latín y el 15 % en neo-tifinagh. El checkpoint final se seleccionó con un criterio de doble script: la combinación `0,5 · CER latín + 0,5 · CER tifinagh` tenía que mejorar mientras ninguna de las dos escrituras empeorase respecto a su línea base, evitando así que el modelo aprendiera a leer una escritura a costa de olvidar la otra. Además, durante el entrenamiento se utilizó un decoder auxiliar autoregresivo de 8,58 millones de parámetros que proporcionaba gradientes a las capas convolucionales tempranas, pero que no se incluye en los pesos publicados.

## Capacidades

- Reconocimiento de líneas de texto kabyle impreso en dos escrituras (latín bereber y neo-tifinagh) desde una sola imagen, sin necesidad de especificar la escritura.
- Preserva las consonantes enfáticas con sub-punto (`ḍ ḥ ṛ ṣ ṭ ẓ`) y la convención de Boulifa `ţ`/`Ţ`, que otros OCR descartan o normalizan.
- Decodificación en un solo paso (CTC greedy), sin pasos autoregresivos ni búsqueda de haz, lo que implica baja latencia de inferencia.
- Procesamiento de líneas de ancho variable hasta 1024 píxeles sin deformar la imagen (se conserva la proporción de aspecto).
- Vocabulario de 173 clases que incluye dígitos, puntuación, latín extendido y 33 caracteres neo-tifinagh.
- Capacidad de mantener ambas escrituras activas durante el entrenamiento (selección de checkpoint con doble criterio), evitando el olvido catastrófico de una de ellas.
- No tiene soporte para tool calling, agentes ni razonamiento multi-step; es un modelo especializado en OCR de una lengua de bajos recursos.

## Casos de uso

- Digitalización de novelas y literatura kabyle: el modelo puede transcribir líneas de texto impreso de libros antiguos y revistas, preservando las consonantes enfáticas y la ortografía bereber, algo que los OCR generales pierden. Se integraría en un pipeline que extrae líneas de las imágenes de página y las convierte en texto editable.
- Procesamiento de archivos históricos y gramáticas: para investigadores que trabajan con escaneos de obras del siglo XX, Feraoun-Pro ofrece una transcripción específica para kabyle, reduciendo la tasa de error frente a OCR multilingües no entrenados en esta lengua.
- Creación de corpus de texto kabyle: a partir de colecciones de documentos impresos, el modelo puede generar grandes volúmenes de texto en kabyle (latín y tifinagh) para entrenar modelos de lenguaje, traductores o herramientas de análisis lingüístico. Su licencia Apache 2.0 permite uso comercial y derivados.
- Accesibilidad de patrimonio cultural: instituciones culturales o bibliotecas digitales pueden usar el modelo para hacer buscable el contenido de periódicos y revistas kabyle históricos, permitiendo búsquedas por palabras clave en ambas escrituras.
- OCR en aplicaciones móviles para hablantes de kabyle: el modelo, con solo 51 M de parámetros, puede integrarse en aplicaciones de escaneado de documentos en dispositivos móviles de gama media, ofreciendo reconocimiento de texto kabyle en tiempo real sin depender de servicios en la nube.
- Investigación en NLP de lenguas de bajos recursos: el modelo sirve como componente de preprocesado para convertir imágenes de textos kabyle en texto plano, habilitando tareas posteriores como análisis morfológico, traducción automática o etiquetado de partes de la oración.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son los declarados por el autor del modelo en la model card. Se midieron sobre 30 000 líneas retenidas, renderizadas con una semilla fija sobre el conjunto completo de 600 000 líneas de entrenamiento, con una distribución del 85 % latín y 15 % neo-tifinagh. El modelo no vio ninguna de estas frases durante el entrenamiento.

| Tarea | Conjunto de datos | Métrica | Resultado |
|---|---|---|---|
| OCR de documentos a nivel de línea, Kabyle latín | 25 484 líneas retenidas, latín | Character error rate (CER) | 7,34 % |
| OCR de documentos a nivel de línea, Kabyle neo-tifinagh | 4 516 líneas retenidas, neo-tifinagh | Character error rate (CER) | 0,91 % |
| Coincidencia exacta de línea (ambas escrituras) | 30 000 líneas retenidas | Exact match | 81,77 % |

Nota importante: el autor advierte que estos números no son comparables con los de su modelo predecesor Feraoun-36M (CER latín 2,85 %, CER tifinagh 1,64 %, exact match 70,20 %), porque ambos modelos se evaluaron sobre conjuntos de retención diferentes de conjuntos de líneas distintos, y ninguno se ha ejecutado sobre el conjunto del otro. Por tanto, no se deben interpretar como un ranking entre ambos modelos. No se han publicado resultados en benchmarks estándar de OCR (como FUNSD, SROIE o ICDAR) ni en tareas de NLP general.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la documentación del modelo. Sin embargo, por su tamaño (51,57 M de parámetros) y su arquitectura de un solo paso hacia adelante, la inferencia es muy ligera.
- VRAM estimada para inferencia: menos de 500 MB en FP32 (aproximadamente 206 MB de pesos en FP32, más memoria para activaciones de imagen). Con cuantización (si se generara) cabría en menos de 200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona en CPU con un rendimiento aceptable (inferencia de una línea en milisegundos en CPU moderna).
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1650, RTX 3060 o superiores, así como en Apple Silicon.
- Opciones de despliegue: al ser un modelo de Hugging Face con pipeline `image-to-text`, se puede servir con bibliotecas de inferencia estándar como Transformers, o exportar a ONNX/TensorRT para despliegue en producción. No se mencionan adaptaciones específicas para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado cifras oficiales; se espera una latencia de pocos milisegundos por línea en GPU y de decenas de milisegundos en CPU, por la ausencia de pasos autoregresivos.

## Comparativa con modelos similares

La categoría de modelos comparables es el OCR para lenguas bereberes de bajos recursos. El único modelo directamente comparable es el predecesor del propio autor, Feraoun-36M, y no hay otros sistemas OCR públicos entrenados específicamente para kabyle o tifinagh documentado en la información disponible.

| Modelo | Parámetros | Vocabulario | Entrenamiento | CER latín | CER tifinagh | Exact match | Licencia |
|---|---|---|---|---|---|---|---|
| Feraoun-Pro (este) | 51,6 M | 173 clases (incluye `ţ`/`Ţ`, 33 tifinagh) | 600 000 líneas | 7,34 % | 0,91 % | 81,77 % | Apache 2.0 |
| Feraoun-36M | 36 M | 171 clases (sin `ţ`, 31 tifinagh) | 80 000 líneas | 2,85 % | 1,64 % | 70,22 % | Apache 2.0 |

Advertencia: los resultados de ambos modelos no son comparables entre sí porque se evaluaron sobre conjuntos de retención distintos; el autor lo declara explícitamente. La elección entre ambos se debe basar en la tarea: Feraoun-Pro soporta líneas de hasta 1024 píxeles sin deformación, tiene `ţ` en el vocabulario y decodifica en un solo paso; Feraoun-36M es más pequeño y su generalización a fuentes ha sido testada (mientras que la de Feraoun-Pro no).

No se dispone de información sobre otros modelos OCR para bereber o amazigh en la información proporcionada.

## Limitaciones y advertencias

- **Evaluación solo en líneas renderizadas**: todos los números de rendimiento se obtuvieron sobre imágenes sintéticas, no sobre páginas escaneadas reales. El rendimiento sobre escaneos de libros antiguos (por ejemplo, los de Adlis) no se ha medido y podría degradarse significativamente.
- **Generalización a fuentes no cuantificada**: el entrenamiento y la evaluación usan el mismo conjunto de fuentes tipográficas; una tipografía nunca vista está fuera del alcance de los resultados publicados y es el eje que el autor espera que se mueva más.
- **Convención `ţ`/`Ţ` sin puntuación por glifo**: los caracteres `ţ` y `Ţ` tienen una ranura en el vocabulario, pero no hay una métrica CER específica para ellos en la validación porque el número de líneas de prueba es demasiado pequeño. La ranura hace que el glifo sea representable, pero no se ha verificado su precisión.
- **Comparación con Feraoun-36M no ejecutada**: no se ha realizado la comparación directa entre ambos modelos sobre el mismo conjunto de evaluación, por lo que no se puede afirmar que uno sea mejor que el otro en términos de rendimiento.
- **Riesgo de errores de reconocimiento**: como cualquier modelo OCR, puede alucinar o cometer errores en líneas con ruido, deformaciones o fuentes desconocidas; la tasa de error de caracteres del 7,34 % en latín indica que una de cada 14 caracteres de media se transcribe mal en el conjunto de validación.
- **Restricciones de uso**: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario atribuir el origen. No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos sintéticos, no se ha evaluado su comportamiento sobre textos reales con variaciones de tipografía, calidad de escaneo o ruido.
- **Idioma único**: el modelo solo transcribe kabyle (kab), no funciona con otras lenguas bereberes ni con textos multilingües.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/agbalu/Feraoun-Pro
- Modelo predecesor (Feraoun-36M): https://huggingface.co/agbalu/Feraoun-36M
- Perfil de la organización agbalu en Hugging Face: https://huggingface.co/agbalu/models
- Repositorio de GitHub de la organización agbalu: https://github.com/abderahmane-ai/agbalu
- README de la organización en GitHub: https://github.com/abderahmane-ai/agbalu/blob/main/README.md
- Búsqueda de modelos relacionados en Hugging Face: https://huggingface.co/models?other=feraoun
