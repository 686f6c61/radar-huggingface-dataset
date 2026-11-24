# kanameaijp/punct-restore-multilingual-base

## Resumen

punct-restore-multilingual-base es un modelo de clasificación de tokens especializado en restaurar la puntuación y las mayúsculas iniciales en texto sin puntuar y en minúsculas, típico de la salida de sistemas de reconocimiento automático del habla (ASR). Lo desarrolla el usuario kanameaijp y se presenta como un fine-tuning de jhu-clsp/mmBERT-base, un encoder transformer multilingüe de la familia ModernBERT, con 307.539.468 parámetros y un peso en safetensors de aproximadamente 1,3 GB.

El modelo cubre once idiomas (japonés, chino, coreano, inglés, alemán, francés, español, italiano, portugués, neerlandés y ruso) y resuelve un problema muy concreto de los pipelines de ASR y de transcripción: la ausencia de signos de puntuación y de mayúsculas en la salida bruta. En lugar de generar texto libre, predice para cada token la marca de puntuación que lo sigue y si ese token empieza por mayúscula, lo que lo hace ligero y determinista en comparación con un modelo generativo.

Su relevancia práctica radica en el coste: con 308M de parámetros y una licencia MIT, puede ejecutarse en CPU en décimas de segundo por lote de frases cortas, lo que permite integrarlo como paso de post-procesado en sistemas de subtitulado, actas de reuniones o transcripción de atención al cliente sin depender de APIs externas. La contrapartida es que su evaluación se ha hecho sobre conjuntos construidos a partir de las mismas fuentes de entrenamiento (Tatoeba y Aozora Bunko), sin validación todavía sobre salidas reales de ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) para clasificación de tokens |
| Parametros totales | 307.539.468 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de ~250 tokens; textos más largos se procesan en ventanas separadas sin solapamiento |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors) |
| Idiomas soportados | ja, zh, ko, en, de, fr, es, it, pt, nl, ru |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT afinado como clasificador de tokens. Para cada token de entrada predice una de 12 etiquetas resultantes de combinar 6 clases de puntuación (`O`, `COMMA`, `PERIOD`, `QUESTION`, `EXCLAIM`, `COLON`, con punto y coma fusionados con los dos puntos) con dos estados de capitalización (`lc`/`uc`). La representación final de los signos (`、。？！` en japonés, `，。？！` en chino, ASCII en el resto) la realiza la función `restore()` incluida en el repositorio, que decide el juego de caracteres según el script de la entrada.

Los datos de entrenamiento proceden de dos fuentes: párrafos de Aozora Bunko limpiados (unos 58.000 párrafos en japonés, en su mayoría de estilo literario de preguerra) y frases de Tatoeba (hasta 40.000 enunciados por idioma en los once idiomas, uniendo de una a tres frases). Las etiquetas se generan automáticamente eliminando la puntuación del texto original y pasándolo a minúsculas, de modo que la puntuación original actúa como objetivo; no se usan etiquetas generadas por modelos. Un 25 % de los párrafos se corta aleatoriamente en fragmentos para que el modelo vea texto que empieza o termina a mitad de frase. El entrenamiento consistió en 3 épocas, batch de 64, learning rate 5e-5 y bf16, sobre una única RTX A6000 durante aproximadamente 1,4 horas. Wikipedia se excluyó deliberadamente del entrenamiento por simplicidad de licencias.

## Capacidades

- Restauración de puntuación (coma, punto, interrogación, exclamación y dos puntos) en texto sin puntuar.
- Restauración de mayúscula inicial de palabra en idiomas con caja (inglés, alemán, francés, español, italiano, portugués, neerlandés, ruso).
- Procesamiento multilingüe en once idiomas, con representación de signos adaptada al script de entrada (japonés, chino o ASCII).
- Post-procesado de salidas de ASR y de transcripciones sin formato.
- Manejo de texto que comienza o termina a mitad de frase gracias al recorte aleatorio aplicado en entrenamiento.
- No cubre comillas, paréntesis, guiones, puntos suspensivos, signos invertidos del español (`¿`, `¡`) ni capitalización interna de palabras (NASA, iPhone se convierten en Nasa, Iphone).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step.

## Casos de uso

- Post-procesado de transcripciones ASR: se aplica sobre la salida en minúsculas y sin puntuar de un motor de reconocimiento para insertar comas, puntos y mayúsculas antes de mostrarla al usuario, con latencia de 0,2–0,3 s en CPU para diez frases cortas.
- Subtitulado automático: el modelo segmenta y puntúa las locuciones de vídeo o audio para generar subtítulos legibles, y su bajo coste permite ejecutarlo por segmento en un pipeline en tiempo casi real.
- Actas de reuniones y notas de voz: convierte la transcripción cruda en texto con puntuación básica y mayúsculas iniciales, mejorando la legibilidad antes de un resumen posterior con un LLM.
- Atención al cliente con transcripción de llamadas: permite almacenar y revisar conversaciones telefónicas transcritas con formato legible, ejecutando el modelo en local sin enviar audio ni texto a servicios externos.
- Preprocesado para pipelines de NLP: la puntuación restaurada mejora tareas posteriores de segmentación de frases, análisis sintáctico o traducción automática que asumen texto puntuado.
- Normalización de texto multilingüe en corpus: útil para limpiar y estandarizar textos en los once idiomas soportados antes de indexarlos o entrenar otros modelos.
- Herramientas de accesibilidad: generación de transcripciones puntuadas para personas con discapacidad auditiva en entornos con recursos limitados, al poder desplegarse en CPU.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la métrica micro-F1 por posición de carácter sobre cinco clases de puntuación (una marca cuenta como correcta solo si coinciden clase y posición) y cap-F1 para la mayúscula inicial. Los conjuntos Tatoeba y Aozora comparten fuente con el entrenamiento (separados por grupo de frases u obra), por lo que son optimistas para entradas reales como transcripciones ASR; los conjuntos Wikipedia no se usaron en entrenamiento.

| Conjunto de test | Caracteres | micro-F1 base | micro-F1 small | cap-F1 base |
|---|---|---|---|---|
| aozora_ja | 151.988 | 0,781 | 0,776 | – |
| tatoeba_de | 63.285 | 0,930 | 0,921 | 0,988 |
| tatoeba_en | 52.693 | 0,961 | 0,949 | 0,990 |
| tatoeba_es | 53.234 | 0,935 | 0,922 | 0,971 |
| tatoeba_fr | 54.112 | 0,924 | 0,919 | 0,980 |
| tatoeba_it | 49.474 | 0,866 | 0,871 | 0,987 |
| tatoeba_ja | 21.667 | 0,876 | 0,877 | – |
| tatoeba_ko | 3.616 | 0,920 | 0,906 | – |
| tatoeba_nl | 47.989 | 0,937 | 0,929 | 0,987 |
| tatoeba_pt | 55.746 | 0,910 | 0,894 | 0,978 |
| tatoeba_ru | 45.281 | 0,921 | 0,908 | 0,974 |
| tatoeba_zh | 11.070 | 0,876 | 0,860 | – |
| wikipedia_de † | 342.977 | 0,846 | 0,816 | 0,980 |
| wikipedia_en † | 296.719 | 0,799 | 0,750 | 0,928 |
| wikipedia_es † | 296.944 | 0,758 | 0,717 | 0,892 |
| wikipedia_fr † | 253.172 | 0,770 | 0,742 | 0,898 |
| wikipedia_it † | 283.625 | 0,724 | 0,679 | 0,890 |
| wikipedia_ja † | 144.454 | 0,788 | 0,753 | – |
| wikipedia_ko † | 154.850 | 0,814 | 0,801 | 0,901 |
| wikipedia_nl † | 304.514 | 0,844 | 0,800 | 0,937 |
| wikipedia_pt † | 278.167 | 0,774 | 0,719 | 0,880 |
| wikipedia_ru † | 236.744 | 0,788 | 0,741 | 0,884 |
| wikipedia_zh † | 150.711 | 0,710 | 0,667 | 0,834 |
| **ALL** | 3.353.032 | **0,801** | **0,771** | **0,933** |

Rendimiento por clase (todos los conjuntos agrupados, modelo base):

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| COMMA | 0,744 | 0,727 | 0,735 | 46.350 |
| PERIOD | 0,893 | 0,899 | 0,896 | 42.891 |
| QUESTION | 0,905 | 0,859 | 0,881 | 1.794 |
| EXCLAIM | 0,547 | 0,332 | 0,413 | 401 |
| COLON | 0,445 | 0,150 | 0,224 | 2.753 |

La model card incluye además una comparación con otros modelos abiertos sobre los primeros 300 párrafos de cada conjunto de test, pero la información disponible aparece truncada y no permite reproducir la tabla completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en precisión nativa (bf16/fp32 según el checkpoint); el autor no documenta cuantizaciones, pero al ser un encoder de 308M es probable que quepa en GPU de 8 GB o menos con precisión reducida.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM; el autor reporta tiempos sobre una RTX A6000 (0,17 s para diez frases cortas incluyendo la primera llamada).
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU.
- Despliegue: transformers con `AutoModelForTokenClassification` y `AutoTokenizer`, más el script `punct_restore.py` del repositorio; el autor no documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: CPU 0,2–0,3 s para diez frases cortas (incluida la primera llamada); RTX A6000 0,17 s en el mismo escenario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| punct-restore-multilingual-base | 307,5M | ventana de ~250 tokens | 11 | MIT | Clasificación de tokens (puntuación y mayúsculas) |
| jhu-clsp/mmBERT-base (modelo base) | no disponible | no disponible | multilingüe | MIT | Encoder multilingüe de propósito general |
| Alternativas específicas de restauración de puntuación | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye una comparativa cerrada con modelos competidores de la misma tarea; la model card menciona una comparación con otros modelos abiertos, pero los datos aparecen truncados.

## Limitaciones y advertencias

- La evaluación se ha realizado sobre conjuntos derivados de las mismas fuentes que el entrenamiento (Tatoeba y Aozora Bunko), por lo que los resultados son optimistas y no se ha validado todavía sobre salidas reales de ASR.
- Los signos de exclamación rara vez se predicen correctamente (F1 de 0,413) y los dos puntos y punto y coma se confunden con frecuencia (F1 de 0,224).
- La coma es la clase más difícil (F1 de 0,735), en parte porque su colocación es estilística, especialmente en texto literario japonés.
- No cubre comillas, paréntesis, guiones, puntos suspensivos, signos invertidos del español (`¿`, `¡`) ni mayúsculas internas de palabra (NASA, iPhone se convierten en Nasa, Iphone).
- Los textos de más de ~250 tokens se procesan en ventanas sin solapamiento, de modo que se pierde contexto en los bordes de ventana.
- El texto de entrenamiento en japonés es mayoritariamente literario de preguerra, lo que puede sesgar el estilo de puntuación hacia registros formales.
- Riesgo de alucinación bajo en el sentido generativo, pero puede insertar puntuación incorrecta en entradas ambiguas o con errores de reconocimiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar la atribución a Tatoeba (CC BY 2.0 FR) y a Aozora Bunko (CC BY 4.0) por los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanameaijp/punct-restore-multilingual-base
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Tatoeba: https://tatoeba.org
- Dataset Aozora Bunko limpio: https://huggingface.co/datasets/globis-university/aozorabunko-clean
