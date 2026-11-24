# kanameaijp/punct-restore-multilingual-small

## Resumen

punct-restore-multilingual-small es un modelo de clasificación de tokens especializado en restaurar puntuación y mayúsculas iniciales en texto sin puntuar y en minúsculas, típico de la salida de sistemas de reconocimiento automático del habla (ASR). Lo desarrolla el usuario kanameaijp y se distribuye con licencia MIT, lo que permite uso comercial sin restricciones adicionales. El modelo cubre 11 idiomas: japonés, chino, coreano, inglés, alemán, francés, español, italiano, portugués, neerlandés y ruso.

Se trata de un fine-tuning de jhu-clsp/mmBERT-small, un encoder transformer de la familia ModernBERT con 140.646.156 parámetros (aproximadamente 141 M) y un tamaño de repositorio de 0,6 GB. La tarea es de token classification: para cada token de entrada predice qué signo de puntuación lo sigue (coma, punto, interrogación, exclamación, dos puntos o ninguno) y si el token debe empezar con mayúscula, generando 12 etiquetas (6 clases de puntuación × 2 estados de capitalización).

Su relevancia práctica está en el post-procesado de transcripciones ASR: convierte cadenas planas y sin mayúsculas en texto legible con puntuación y capitalización, sin necesidad de un modelo generativo grande. Al ser pequeño y rápido (0,2–0,3 s en CPU para diez frases cortas), puede ejecutarse en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) para token classification |
| Parametros totales | 140.646.156 (aproximadamente 141 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de aproximadamente 250 tokens; textos más largos se procesan en ventanas separadas sin solapamiento |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ja, zh, ko, en, de, fr, es, it, pt, nl, ru |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño de repositorio 0,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small, un encoder transformer de tipo ModernBERT, y se entrena como clasificador de tokens con 12 etiquetas resultantes de combinar 6 clases de puntuación (`O`, `COMMA`, `PERIOD`, `QUESTION`, `EXCLAIM`, `COLON`, con punto y coma fusionados) con dos estados de capitalización (minúscula inicial / mayúscula inicial). La predicción es por token: qué signo sigue al token y si este empieza en mayúscula.

Los datos de entrenamiento proceden de dos fuentes: Aozora Bunko limpio (`globis-university/aozorabunko-clean`, CC BY 4.0, textos de dominio público), con unas 58.000 párrafos en japonés de estilo literario mayoritariamente de preguerra, y frases de Tatoeba (CC BY 2.0 FR), hasta 40.000 enunciados por idioma en los 11 idiomas, uniendo de 1 a 3 frases. Las etiquetas se generan automáticamente eliminando la puntuación original y pasando el texto a minúsculas, de modo que la puntuación original es el objetivo de predicción; no se usan etiquetas generadas por modelos ni por modelos cerrados. Un 25 % de los párrafos se cortan aleatoriamente en fragmentos para que el modelo vea texto que empieza o termina a mitad de frase. Wikipedia se excluye deliberadamente del entrenamiento por simplicidad de licencias.

El entrenamiento se realizó durante 3 épocas, con batch de 64, learning rate 1e-4, precisión bf16 y una sola RTX A6000, en aproximadamente 0,7 horas. No se documenta RLHF, DPO ni ninguna innovación de decodificación; el renderizado de los signos (`、。？！` para japonés, `，。？！` para chino, ASCII en el resto) lo realiza la función `restore()` según el sistema de escritura de la entrada.

## Capacidades

- Restauración de puntuación en texto sin puntuar: predice comas, puntos, interrogaciones, exclamaciones y dos puntos (punto y coma fusionado con dos puntos).
- Restauración de mayúsculas iniciales de palabra (truecasing) en idiomas con distinción de caja.
- Post-procesado de salidas ASR en 11 idiomas, incluyendo escrituras sin espacios (japonés, chino) y alfabetos latino y cirílico.
- Procesamiento por ventanas para textos largos, con pérdida de contexto en los bordes de ventana.
- No cubre comillas, paréntesis, guiones, puntos suspensivos, signos invertidos del español (`¿ ¡`) ni capitalización que no sea la primera letra de la palabra (por ejemplo, `NASA` o `iPhone` se normalizarían a `Nasa` e `Iphone`).
- No es un modelo generativo: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Post-procesado de transcripciones ASR en centros de contacto: el modelo recibe la salida plana del reconocedor y devuelve texto con puntuación y mayúsculas, mejorando la legibilidad de las transcripciones antes de archivarlas o analizarlas; su latencia de 0,2–0,3 s en CPU para diez frases cortas permite procesar en lote sin GPU.
- Generación de subtítulos para vídeo y audio: se aplica sobre la hipótesis del ASR para segmentar y puntuar los subtítulos, con soporte para japonés, chino y coreano además de lenguas europeas, lo que cubre catálogos multilingües.
- Normalización de texto para motores de búsqueda y recuperación: antes de indexar transcripciones o notas dictadas, el modelo restaura la puntuación para mejorar la segmentación en frases y la calidad de los fragmentos recuperados.
- Preparación de corpus para anotación lingüística: textos sin puntuar procedentes de OCR o de fuentes digitalizadas se puntúan y capitalizan para facilitar tareas posteriores de análisis sintáctico o etiquetado.
- Limpieza de datos en pipelines de entrenamiento: se aplica a grandes volúmenes de texto en minúsculas para reconstruir una puntuación aproximada antes de usarlos como datos auxiliares, aprovechando que el modelo corre en CPU.
- Accesibilidad: transcripción de audio a texto legible para lectores de pantalla y sistemas de subtitulado en directo, donde la puntuación y las mayúsculas mejoran la comprensión de la salida.
- Procesamiento en el borde (edge): al ser un modelo de 141 M de parámetros y 0,6 GB, puede desplegarse en dispositivos sin GPU para puntuar dictados o notas de voz localmente.

## Benchmarks y rendimiento

Los resultados se miden con micro-F1 por posición de carácter sobre las cinco clases de puntuación (una marca cuenta como correcta solo si coinciden clase y posición) y cap-F1 para la mayúscula inicial. Los conjuntos Tatoeba y Aozora comparten fuente con el entrenamiento (separados por grupo de frases u obra), por lo que son optimistas para entradas reales como transcripciones ASR; los conjuntos de Wikipedia no están en el entrenamiento.

| Conjunto de test | Caracteres | micro-F1 (small) | cap-F1 (base) |
|---|---|---|---|
| aozora_ja | 151.988 | 0,776 | – |
| tatoeba_de | 63.285 | 0,921 | 0,988 |
| tatoeba_en | 52.693 | 0,949 | 0,990 |
| tatoeba_es | 53.234 | 0,922 | 0,971 |
| tatoeba_fr | 54.112 | 0,919 | 0,980 |
| tatoeba_it | 49.474 | 0,871 | 0,987 |
| tatoeba_ja | 21.667 | 0,877 | – |
| tatoeba_ko | 3.616 | 0,906 | – |
| tatoeba_nl | 47.989 | 0,929 | 0,987 |
| tatoeba_pt | 55.746 | 0,894 | 0,978 |
| tatoeba_ru | 45.281 | 0,908 | 0,974 |
| tatoeba_zh | 11.070 | 0,860 | – |
| wikipedia_de † | 342.977 | 0,816 | 0,980 |
| wikipedia_en † | 296.719 | 0,750 | 0,928 |
| wikipedia_es † | 296.944 | 0,717 | 0,892 |
| wikipedia_fr † | 253.172 | 0,742 | 0,898 |
| wikipedia_it † | 283.625 | 0,679 | 0,890 |
| wikipedia_ja † | 144.454 | 0,753 | – |
| wikipedia_ko † | 154.850 | 0,801 | 0,901 |
| wikipedia_nl † | 304.514 | 0,800 | 0,937 |
| wikipedia_pt † | 278.167 | 0,719 | 0,880 |
| wikipedia_ru † | 236.744 | 0,741 | 0,884 |
| wikipedia_zh † | 150.711 | 0,667 | 0,834 |
| ALL | 3.353.032 | 0,771 | 0,933 |

Resultados por clase (todos los conjuntos agrupados, modelo base):

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| COMMA | 0,744 | 0,727 | 0,735 | 46.350 |
| PERIOD | 0,893 | 0,899 | 0,896 | 42.891 |
| QUESTION | 0,905 | 0,859 | 0,881 | 1.794 |
| EXCLAIM | 0,547 | 0,332 | 0,413 | 401 |
| COLON | 0,445 | 0,150 | 0,224 | 2.753 |

La model card incluye además una comparación con otros modelos abiertos sobre los primeros 300 párrafos de cada conjunto de test, pero el texto proporcionado está truncado y no permite reproducir la tabla completa; los datos disponibles no incluyen los valores de esos modelos comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (141 M de parámetros, repositorio de 0,6 GB); en bf16/fp16 aproximadamente 0,3 GB de pesos más activaciones.
- GPU recomendadas: no requiere GPU; la model card reporta 0,17 s en una RTX A6000 para diez frases cortas, incluida la primera llamada.
- Cabe en cualquier GPU de consumo, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, y también en CPU.
- Opciones de despliegue: transformers con `AutoModelForTokenClassification` y `AutoTokenizer`; la función `restore()` se incluye en los archivos del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados, llama.cpp y Ollama no están disponibles de forma directa.
- Latencia: 0,2–0,3 s en CPU para diez frases cortas (incluida la primera llamada) y 0,17 s en una RTX A6000. No se documenta throughput sostenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| punct-restore-multilingual-small | 141 M | ventana de ~250 tokens | 11 | MIT | Fine-tuning de mmBERT-small; micro-F1 global 0,771 |
| punct-restore-multilingual-base | no disponible en la información | no disponible | 11 | no disponible | Modelo hermano citado en la evaluación; micro-F1 global 0,801 y cap-F1 0,933 |
| jhu-clsp/mmBERT-small | no disponible en la información | no disponible | multilingüe | MIT | Modelo base sin fine-tuning para puntuación |

La información proporcionada no incluye datos de otros modelos de restauración de puntuación de terceros (por ejemplo, modelos basados en XLM-R o en modelos generativos), por lo que la comparación con alternativas externas no está disponible.

## Limitaciones y advertencias

- No se ha evaluado sobre salidas ASR reales; la evaluación se hizo con conjuntos construidos a partir de Wikipedia, Aozora Bunko y Tatoeba, y los conjuntos Tatoeba/Aozora comparten fuente con el entrenamiento, por lo que las métricas son optimistas para entradas reales.
- Los conjuntos de Wikipedia son fuera de dominio (párrafos formales y largos) y sus puntuaciones son claramente inferiores; el rendimiento en textos formales largos será menor que en frases cortas de estilo hablado.
- Los textos de más de aproximadamente 250 tokens se procesan en ventanas sin solapamiento, de modo que se pierde contexto en los bordes y pueden aparecer errores de puntuación en las uniones.
- No cubre comillas, paréntesis, guiones, puntos suspensivos ni los signos invertidos del español (`¿ ¡`); la capitalización se limita a la primera letra de cada palabra, por lo que acrónimos y marcas como `NASA` o `iPhone` se normalizan incorrectamente.
- Las exclamaciones rara vez se predicen bien (F1 0,413) y los dos puntos/punto y coma se confunden con frecuencia (F1 0,224); las comas son la clase más difícil (F1 0,735), en parte por su componente estilístico, especialmente en texto literario japonés.
- El sesgo de los datos de entrenamiento (literatura japonesa de preguerra y frases de Tatoeba) puede trasladarse a las predicciones de estilo.
- No se documentan sesgos demográficos ni evaluaciones de robustez frente a entradas adversariales.
- Licencia MIT: permite uso comercial y modificación con atribución; no obstante, los datos de Tatoeba (CC BY 2.0 FR) requieren atribución a los contribuyentes de Tatoeba, y Aozora Bunko se distribuye bajo CC BY 4.0 con textos de dominio público.
- Al ser un clasificador de tokens y no un modelo generativo, no puede corregir el contenido léxico ni la gramática del texto de entrada; solo añade puntuación y mayúsculas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanameaijp/punct-restore-multilingual-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset Aozora Bunko limpio: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Tatoeba: https://tatoeba.org
- No se han proporcionado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
