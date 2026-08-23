# agbalu/Belaid-31M

## Resumen

Belaid-31M es un modelo de restauración de puntuación y capitalización (punctuation and casing restoration) para el kabyle (Taqbaylit, código `kab`), una lengua bereber hablada en el norte de Argelia. Desarrollado por la organización AƔBALU, es el primer modelo publicado de este tipo para el kabyle o cualquier lengua bereber. El modelo recibe una frase sin puntuación ni mayúsculas —el formato de salida típico de un reconocedor de voz— y predice para cada palabra qué signo de puntuación le sigue y si debe escribirse con mayúscula.

Es un fine-tune de `agbalu/Masinissa-31M`, un encoder de 31,4 millones de parámetros diseñado para tareas de clasificación de tokens. Se construyó específicamente para el post-procesado de la salida del reconocedor de voz `agbalu/Fadhma-300M`, cuyo vocabulario CTC contiene 40 caracteres y ninguna puntuación. El modelo nunca modifica la ortografía de las palabras, lo que evita introducir errores de transcripción en el texto procesado. Licenciado bajo Apache-2.0, está disponible en Hugging Face con pesos en safetensors y requiere `trust_remote_code=True` para cargar su arquitectura personalizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer personalizado (no es arquitectura estándar de transformers, requiere `trust_remote_code=True`) |
| Parametros totales | 31.423.751 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Kabyle (Taqbaylit, `kab`, escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada públicamente más allá de ser un encoder de 31,4 millones de parámetros, fine-tune de `agbalu/Masinissa-31M`. El modelo no es una arquitectura estándar de la librería transformers, por lo que el código de modelado viaja en el repositorio y se carga con `trust_remote_code=True`. El entrenamiento se realizó sobre el split de entrenamiento de Common Voice 22.0 Kabyle, donde cada registro es una frase individual. El modelo predice dos salidas por token: `punctuation_logits` (cuatro marcas posibles: coma, punto, interrogación, dos puntos, más `NONE`) y `case_logits` (mayúscula o no). No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron técnicas de alineamiento como RLHF o DPO.

## Capacidades

- Restauración de puntuación en texto kabyle sin puntuar: predice si cada palabra va seguida de coma, punto, interrogación, dos puntos o nada.
- Restauración de mayúsculas, incluyendo nombres propios no iniciales (F1 de 0,933 en el test de Common Voice).
- Post-procesado de transcripciones de ASR: pensado para añadir puntuación y capitalización a la salida del reconocedor `agbalu/Fadhma-300M`.
- Procesado de texto en minúsculas o sin puntuación para prepararlo para lectura o publicación.
- Interfaz simple vía método `restore()` que acepta una cadena o lista de cadenas.
- No modifica la ortografía de las palabras: garantiza que no introduce errores de transcripción en texto ya correcto.
- Funciona con una sola frase a la vez, no con párrafos o páginas completas.
- Multilingüe: no, exclusivamente kabyle.

## Casos de uso

- Post-procesado de transcripciones de voz en kabyle: el caso principal. La salida de `agbalu/Fadhma-300M` (u otro ASR kabyle) es texto sin puntuación ni mayúsculas; Belaid-31M lo convierte en texto legible con marcas y capitalización correctas, listo para publicación o subtítulos.
- Generación de subtítulos y captions para vídeo: las transcripciones automáticas de contenido audiovisual en kabyle pueden pasarse por el modelo para añadir puntuación y mayúsculas, mejorando la legibilidad de los subtítulos.
- Preparación de corpus para lectura: textos kabyle en minúsculas o sin puntuación que van a ser leídos por una persona (no para entrenar modelos) pueden normalizarse con este modelo.
- Restauración de puntuación en textos históricos o digitalizados: documentos kabyle escaneados o transcritos sin marcas pueden ser procesados para facilitar su lectura.
- Enriquecimiento de datos para ASR: el modelo puede usarse para generar texto puntuado a partir de transcripciones crudas, útil para entrenar o evaluar sistemas de reconocimiento de voz en kabyle.
- Evaluación de calidad de ASR: al restaurar puntuación y mayúsculas, se puede medir mejor la calidad de una transcripción comparándola con el texto puntuado de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. No se han publicado comparaciones con otros modelos de restauración de puntuación en kabyle (no existen) ni con modelos multilingües de propósito general.

### Common Voice 22.0 Kabyle, test decontaminado (5.160 frases, 26.969 palabras)

| Metrica | Baseline (regla) | Belaid-31M |
|---|---|---|
| Macro-F1 sobre las cuatro marcas y NONE | 0,227 | 0,793 |
| Exactitud de la marca final de frase | 0,837 | 0,970 |
| Exactitud completa de la frase (marcas y mayúsculas) | 0,592 | 0,863 |
| F1 de nombres propios no iniciales | 0,000 | 0,933 |

Desglose por etiqueta (test Common Voice):

| Etiqueta | Soporte | Predichos | Precisión | Recall | F1 |
|---|---|---|---|---|---|
| `NONE` | 20.904 | 20.897 | 0,989 | 0,988 | 0,988 |
| `COMMA` | 804 | 843 | 0,680 | 0,713 | 0,696 |
| `PERIOD` | 4.357 | 4.351 | 0,978 | 0,976 | 0,977 |
| `QUESTION` | 861 | 838 | 0,911 | 0,886 | 0,898 |
| `COLON` | 43 | 40 | 0,625 | 0,581 | 0,602 |

### Fuera de dominio (45.028 registros de prosa larga, 1.000.928 palabras)

| Metrica | Baseline (regla) | Belaid-31M |
|---|---|---|
| Macro-F1 sobre las cuatro marcas y NONE | 0,168 | 0,635 |
| Precisión de la marca final de frase | 0,925 | 0,955 |
| F1 de nombres propios no iniciales | 0,000 | 0,674 |
| F1 de coma | 0,000 | 0,580 |
| F1 de dos puntos | 0,000 | 0,721 |

Nota: el F1 de `COLON` en el test de Common Voice se basa en solo 43 ejemplos y el autor recomienda citar el macro-F1 con ese soporte o el valor de cuatro clases. En el split fuera de dominio, con 13.544 casos de dos puntos, el F1 es 0,721.

## Requisitos de hardware

- VRAM estimada: con 31,4 millones de parámetros, la inferencia requiere muy poca memoria. En fp32, el modelo pesa aproximadamente 126 MB; en fp16 o cuantizado a 8 bits, la VRAM necesaria es inferior a 1 GB.
- GPUs recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti, RTX 3060, o incluso CPU es viable para inferencia por lotes pequeños.
- Cabe en cualquier GPU de consumo moderna (RTX 30xx, 40xx, etc.) sin problema.
- Opciones de despliegue: al ser una arquitectura custom, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI sin adaptar el código. La forma estándar es usar `transformers` con `trust_remote_code=True` en un script Python. Se puede servir con un simple contenedor FastAPI o usando `transformers.pipeline` con el modelo cargado.
- Latencia: no disponible, pero para un modelo de este tamaño la inferencia es del orden de milisegundos por frase en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No hay modelos comparables publicados para la restauración de puntuación en kabyle o en otras lenguas bereberes. El propio autor indica que es "el primer modelo de restauración de puntuación y mayúsculas publicado para kabyle, o para cualquier lengua berbere". Los sistemas multilingües de restauración de puntuación (como `xlm-roberta` fine-tuneado en inglés u otras lenguas) no están entrenados para kabyle y no pueden aplicarse directamente. La comparación más relevante es con el baseline de regla (capitalizar la primera palabra y añadir un punto), que el modelo supera ampliamente (0,793 vs 0,227 de macro-F1 en test).

## Limitaciones y advertencias

- Sesgos: entrenado exclusivamente en Common Voice Kabyle, que es un corpus de voz leída, por lo que puede no generalizar bien a todos los registros de la lengua.
- Alucinación: no aplica, el modelo nunca edita la ortografía de las palabras, solo añade marcas y mayúsculas. No puede introducir errores de transcripción.
- Limitaciones de contexto: procesa una frase a la vez, no segmenta un párrafo en frases. Para textos largos, hay que pre-segmentar las frases, lo que degrada el rendimiento (el macro-F1 cae de 0,793 a 0,635 en texto largo fuera de dominio).
- El rendimiento en coma y dos puntos es notablemente inferior al de punto e interrogación, y el macro-F1 está influenciado por el bajo soporte de dos puntos en el test de Common Voice.
- No adecuado para: segmentación de párrafos en frases, decisiones sobre personas, o cualquier idioma distinto del kabyle.
- La arquitectura es custom y requiere `trust_remote_code=True`; esto implica ejecutar código del repositorio, con el riesgo de seguridad que conlleva. Se recomienda revisar el código antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento pueden tener licencias propias (el autor indica que cada modelo lleva la composición de licencias de los datos en su tarjeta).
- No hay información pública sobre la composición exacta del dataset de entrenamiento más allá de Common Voice 22.0 Kabyle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Belaid-31M
- Organización AƔBALU: https://huggingface.co/agbalu
- Modelo base (Masinissa-31M): https://huggingface.co/agbalu/Masinissa-31M
- Modelo ASR asociado (Fadhma-300M): https://huggingface.co/agbalu/Fadhma-300M
- Repositorio GitHub de la organización: https://github.com/abderahmane-ai/agbalu
- README del repositorio en GitHub: https://github.com/abderahmane-ai/agbalu/blob/main/README.md
