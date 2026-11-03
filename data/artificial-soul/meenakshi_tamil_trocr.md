# Artificial-Soul/meenakshi_tamil_trocr

## Resumen

Meenakshi es un modelo de reconocimiento de texto manuscrito (HTR) especializado en palabras sueltas en tamil. Se trata de un ajuste fino completo de `microsoft/trocr-large-handwritten`, el checkpoint grande de TrOCR entrenado originalmente para escritura manuscrita en inglés, al que se le ha sustituido el vocabulario del decodificador por uno de nivel de carácter construido específicamente a partir de los datos de entrenamiento en tamil. Lo desarrolla el usuario Artificial-Soul y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

El modelo resuelve un problema muy concreto: leer una única palabra manuscrita en tamil a partir de una imagen recortada. No está pensado para líneas, frases ni páginas completas; su ámbito es estrictamente la palabra aislada, lo que condiciona tanto su uso como sus limitaciones. Es relevante porque el tamil es una lengua con relativamente pocos recursos de OCR manuscrito de calidad, y este modelo declara un CER del 1,04 % y una precisión de palabra exacta del 93,06 % sobre el split de test de IIIT-INDIC-HW-WORDS Tamil.

Arquitectónicamente es un `VisionEncoderDecoderModel` con un encoder ViT-Large de 24 capas (entrada 384×384) y un decodificador transformer de 12 capas, con una longitud máxima de salida de 48 tokens y un vocabulario de 75 símbolos (70 caracteres tamil, un guion y 4 tokens especiales). El modelo tiene pocas descargas y likes en el momento de la ficha, lo que sugiere que es un trabajo reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (ViT-Large encoder + transformer decoder de 12 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 384×384, salida maxima de 48 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificacion no documentada) |
| Idiomas soportados | tamil (`ta`) |
| Licencia | MIT |
| Formato de pesos | safetensors (via `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/trocr-large-handwritten` y conserva su estructura de encoder-decoder: un ViT-Large de 24 capas con tamaño oculto 1024 que procesa la imagen redimensionada a 384×384, y un decodificador de 12 capas que genera la secuencia de caracteres. Las capas transformer del encoder y del decodificador se inicializan desde el checkpoint inglés, mientras que las capas de embedding y de salida del decodificador se redimensionan y se reentrenan para el vocabulario de caracteres tamil (70 caracteres del bloque Unicode tamil, un guion y 4 tokens especiales, vocabulario total de 75).

El entrenamiento consistió en un ajuste fino completo (todos los pesos del encoder y del decodificador, no LoRA) sobre la porción tamil del corpus IIIT-INDIC-HW-WORDS: 75.736 imágenes de palabra para entrenamiento, 11.598 para validación y 16.184 para test. Se usó batch por GPU de 32 (batch global 64 en 2 GPU), learning rate 3e-5 con 10 % de warmup y decaimiento lineal, y se añadió un token de fin de secuencia explícito a cada etiqueta para que el modelo aprendiera cuándo detenerse. El checkpoint liberado es el paso 9.000 (~7,6 épocas), seleccionado por menor CER de validación (1,10 %), tras un entrenamiento que se detuvo por early stopping en el paso 17.000. Un detalle técnico destacable: se comparó el padding de las imágenes hacia una relación de aspecto 2:1 frente a dejarlas sin padding, y el padding dio peor CER (1,99 % frente a 1,77 % en una fase temprana; 1,76 % frente a 1,52 % en test), por lo que el modelo final usa imágenes sin padding. La decodificación reportada emplea beam search con 5 haces, longitud máxima 48 y `no_repeat_ngram_size=0`, ya que los caracteres pueden repetirse legítimamente.

## Capacidades

- Reconocimiento de texto manuscrito en tamil a nivel de palabra aislada.
- Conversión de imagen de una palabra recortada a su transcripción en caracteres tamil.
- Vocabulario de decodificación de nivel de carácter (70 caracteres tamil), lo que permite generar palabras no vistas durante el entrenamiento siempre que sus caracteres estén en el vocabulario.
- Generación con beam search configurable (el autor reporta resultados con 5 haces).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo tamil.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del OCR de palabra manuscrita.

## Casos de uso

- Digitalización de formularios manuscritos en tamil: si el flujo de captura ya segmenta cada campo en una imagen de palabra aislada, el modelo puede transcribir cada campo con una precisión de palabra exacta declarada del 93,06 %, suficiente para tareas de indexación y búsqueda.
- Archivado de documentación histórica o administrativa en tamil: combinado con un segmentador de palabras previo, permite convertir imágenes de palabras manuscritas en texto indexable, facilitando búsquedas posteriores sobre el corpus.
- Validación asistida de transcripciones: el modelo puede usarse como primer paso automático y marcar como dudosas las palabras con baja confianza (por ejemplo, mediante la probabilidad media de los haces) para revisión humana, reduciendo el coste de transcripción manual.
- Extracción de nombres o topónimos en censos y registros: al trabajar a nivel de palabra y con un vocabulario de caracteres, puede leer palabras fuera del léxico de entrenamiento, lo que es útil para nombres propios que no aparecen en el corpus.
- Preprocesamiento para pipelines de OCR de línea o página: el modelo puede integrarse como componente de reconocimiento de palabra dentro de un sistema mayor que haga detección y segmentación de palabras, encadenando la salida con un modelo de lenguaje tamil para corrección posterior.
- Investigación en HTR para lenguas índicas: sirve como línea base reproducible (checkpoint, hiperparámetros y métricas documentados) para comparar técnicas de aumento de datos, padding o vocabularios alternativos en tamil manuscrito.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre el split de test de IIIT-INDIC-HW-WORDS Tamil, con 16.184 imágenes de palabra:

| Metrica | Valor |
|---|---|
| Character Error Rate (CER) | 1,04 % |
| Character accuracy (1 − CER) | 98,96 % |
| Word accuracy (exact match) | 93,06 % |

Evolución del CER de validación durante el entrenamiento, según la model card:

| Paso | Epoca | CER validacion | Word accuracy validacion |
|---|---|---|---|
| 9.000 (liberado) | 7,60 | 1,10 % | 92,53 % |
| 11.000 | 9,29 | 1,24 % | 91,85 % |
| 12.000 | 10,14 | 1,29 % | 91,75 % |
| 15.000 | 12,67 | 1,20 % | 92,33 % |
| 16.000 | 13,51 | 1,55 % | 89,65 % |
| 17.000 | 14,36 | 1,45 % | 90,48 % |

No se han publicado en la información disponible resultados comparativos con otros modelos de OCR tamil manuscrito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al ser un ViT-Large (24 capas, hidden 1024) más un decodificador de 12 capas, es esperable que requiera del orden de varios GB en fp16, pero el dato exacto no está publicado.
- GPU recomendadas: no especificadas por el autor (la model card deja un TODO en el apartado de hardware del entrenamiento). Para inferencia en fp16, una GPU con al menos 8-16 GB de VRAM es un punto de partida razonable, aunque no confirmado.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8 GB o más (RTX 3060/4060 en adelante), pero no hay confirmación oficial.
- Opciones de despliegue: `transformers` con `TrOCRProcessor` y `VisionEncoderDecoderModel`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meenakshi (este modelo) | no disponible | imagen 384×384, salida 48 tokens | CER 1,04 %, word accuracy 93,06 % en IIIT-INDIC-HW-WORDS Tamil | MIT | Hugging Face |
| microsoft/trocr-large-handwritten | no disponible | imagen 384×384 | no evaluado en tamil; entrenado en inglés manuscrito | MIT | Hugging Face |
| TrOCR base/small (familia) | no disponible | imagen 384×384 | no disponible en tamil | MIT | Hugging Face |

No se dispone de datos públicos de otros modelos de OCR manuscrito tamil comparables en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo palabras sueltas: alimentar el modelo con una frase, línea o párrafo produce resultados pobres, porque el encoder comprime toda la imagen a 384×384 y el modelo nunca ha visto imágenes con varias palabras.
- Los recortes de palabra muy anchos se comprimen: en este corpus la relación ancho:alto mediana es de 5,6:1, y el redimensionado cuadrado fijo comprime esa anchura, lo que puede difuminar diferencias entre caracteres visualmente similares.
- Sesgo de dominio: entrenado exclusivamente con la porción tamil de IIIT-INDIC-HW-WORDS, por lo que el rendimiento puede degradarse con otras fuentes, estilos de escritura, resoluciones o calidades de escaneo.
- Riesgo de alucinación: como todo modelo generativo de secuencias, puede producir caracteres o palabras plausibles pero incorrectos, especialmente en entradas borrosas o fuera de distribución.
- Limitación de idioma: solo tamil; no procesa otras lenguas índicas ni escritura latina.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; las métricas declaradas no están verificadas de forma independiente (`verified: false` en el model-index).
- En producción conviene añadir un paso de validación o umbral de confianza, dado que el 6,94 % de palabras no coinciden exactamente en el test declarado.
- La model card contiene un TODO sin resolver sobre el hardware de entrenamiento, lo que dificulta reproducir el ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/Artificial-Soul/meenakshi_tamil_trocr
- Modelo base: https://huggingface.co/microsoft/trocr-large-handwritten
- Paper de TrOCR (referencia arXiv:2109.10282): https://arxiv.org/abs/2109.10282
- Dataset IIIT-INDIC-HW-WORDS: no disponible en la información proporcionada.
- Repositorio de código o demo: no disponible en la información proporcionada.
