# agbalu/Feraoun-36M

## Resumen

Feraoun-36M es un modelo visión-encoder-decoder de 36,3 millones de parámetros desarrollado por el usuario agbalu, diseñado específicamente para el reconocimiento óptico de caracteres (OCR) de texto impreso en cabilio (taqbaylit, código ISO `kab`), una lengua bereber de Argelia escrita tanto en ortografía latina como en neo-tifinag. El modelo resuelve un problema concreto: el registro escrito cabilio está en papel (novelas, gramáticas, publicaciones periódicas y escaneos de archivo) y ningún sistema OCR había sido entrenado para esta lengua, de modo que los motores de propósito general tienden a eliminar o normalizar las consonantes enfáticas `ḍ ḥ ṛ ṣ ṭ ẓ`, cuya grafía es una letra base más un punto inferior y cuya pérdida altera la palabra.

La arquitectura es un encoder-decoder visual con código de modelado propio alojado en el repositorio, lo que exige `trust_remote_code=True` para cargarlo. El modelo procesa líneas de texto escaladas a 52 píxeles de altura útil sobre un lienzo de 64 × 512 y devuelve la transcripción sin que el usuario deba indicar si la entrada está en latín o en tifinag. Su relevancia actual radica en que cubre una lengua de bajos recursos con un modelo pequeño, desplegable en hardware modesto y con licencia Apache 2.0.

El modelo declara métricas sobre 1.000 líneas reservadas renderizadas con tipografías no vistas durante el entrenamiento: 2,85 % de tasa de error de carácter, 13,20 % de tasa de error de palabra y 70,20 % de coincidencia exacta de línea. Estas cifras, declaradas por el autor y no verificadas de forma independiente, sitúan al modelo como una herramienta práctica para digitalización de corpus cabilios impresos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (transformer), código de modelado propio en el repositorio |
| Parametros totales | 36.390.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de imagen de 64 × 512 px con 52 px de altura útil de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cabilio (`kab`), en ortografía latina y neo-tifinag |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder visión-texto de 36,3 M de parámetros. El codificador procesa la imagen de la línea de texto renderizada en un lienzo de 64 × 512 píxeles, con la altura útil del texto normalizada a 52 píxeles, y el decodificador genera la secuencia de caracteres. La arquitectura no corresponde a ninguna de las incluidas en la librería `transformers`, por lo que el código de modelado viaja dentro del repositorio y requiere `trust_remote_code=True`. El modelo expone métodos propios como `transcribe`, `transcribe_page` y `prepare_line_image`, que realizan el preprocesado y la decodificación de forma integrada.

El entrenamiento se realizó sobre un prefijo de 80.000 frases del corpus `agbalu/AGBALU-Text`, con renderizados en las familias tipográficas DejaVu, FreeFont, Liberation y Noto. La evaluación se hizo con tipografías nunca vistas (Times New Roman, Times, Arial, Helvetica, Georgia, Baskerville, Courier New y Didot), lo que convierte los resultados en una medida de generalización entre formas de letra y no de memorización. El autor menciona además el uso de la partición de test de `agbalu/KabTifinagh` para la evaluación en neo-tifinag. No se detalla en la información disponible la composición completa del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto impreso línea a línea en cabilio, tanto en ortografía latina como en neo-tifinag, sin necesidad de indicar al modelo la escritura de entrada.
- Preservación posicional de las consonantes enfáticas con punto inferior (`ḍ ḥ ṛ ṣ ṭ ẓ`), con un F1 posicional de 0,8538 sobre 1.355 glifos de referencia.
- Transcripción de páginas completas mediante `transcribe_page`, que devuelve una línea de texto por cada banda de texto detectada.
- Preprocesado integrado de la imagen de entrada (escalado a 52 px de altura útil) a través de `prepare_line_image` y segmentación de página mediante `segment_page_in...` (nombre truncado en la información disponible).
- Inferencia sin dependencias pesadas: solo requiere `transformers`, `torch`, `pillow` y `numpy`.
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Digitalización de novelas y obras literarias cabilias: el modelo transcribe líneas de texto impreso en latín cabilio con una tasa de error de carácter del 2,85 %, adecuada para generar texto base revisable en proyectos de corpus literario.
- Recuperación de gramáticas y estudios lingüísticos: las gramáticas cabilias impresas contienen notación diacrítica crítica; el F1 posicional de 0,8538 en consonantes enfáticas permite preservar distinciones fonológicas que motores genéricos pierden.
- Digitalización de publicaciones periódicas y prensa histórica: el procesamiento por bandas de `transcribe_page` permite extraer el texto de páginas escaneadas de una sola columna, generando una línea de salida por banda detectada.
- Procesamiento de archivos escaneados en neo-tifinag: el modelo transcribe igualmente la escritura tifinag (CER del 1,64 % en la partición de evaluación dual), lo que sirve para digitalizar materiales en esa ortografía sin cambiar de modelo.
- Construcción de corpus paralelos latín-tifinag: al leer ambas escrituras con el mismo modelo, se pueden alinear transcripciones de materiales bilingües o comparar ediciones en distintas ortografías.
- Investigación en OCR de lenguas de bajos recursos: el modelo sirve como línea base reproducible (36 M de parámetros, licencia Apache 2.0, pesos safetensors) para experimentos de aumento de datos, cambio de tipografía o adaptación a otras lenguas bereberes.
- Integración en pipelines de preservación digital: al requerir solo `transformers`, `torch`, `pillow` y `numpy`, puede incorporarse en flujos automatizados de digitalización sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre 1.000 líneas reservadas renderizadas con tipografías no vistas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Character error rate (CER) | 2,85 % |
| Word error rate (WER) | 13,20 % |
| Line exact match | 70,20 % |
| F1 posicional de diacríticos | 0,8538 (precisión 0,8416 / exhaustividad 0,8664, sobre 1.355 glifos) |

Evaluación adicional sobre una segunda muestra de 1.000 líneas, la mitad en neo-tifinag procedente de la partición de test de `agbalu/KabTifinagh` (reparto 50/50 latín y neo-tifinag):

| Metrica | Valor |
|---|---|
| Character error rate (CER) | 1,64 % |
| Word error rate (WER) | 7,12 % |
| Line exact match | 79,50 % |

El autor advierte que estas cifras menores no representan un mejor resultado en la misma tarea: el tifinag no emplea puntos inferiores ni mayúsculas y sus líneas son más cortas, por lo que la mitad de esa muestra no puede producir las dos clases de error dominantes en la condición latina. La fila latina es la referencia principal. El 2,65 % de CER del registro de entrenamiento corresponde a una estadística distinta (como máximo 16 lotes, unas 512 líneas, de una partición reservada del mismo prefijo de entrenamiento) y no es comparable con la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 36,3 M de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 145 MB, y en 16 bits unos 73 MB, a lo que hay que sumar la memoria de activaciones del encoder visual.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna (por ejemplo, series GTX 10xx en adelante), aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: la vía documentada es `transformers` con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el código de modelado propio probablemente limita su uso en algunos de estos entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. No se han publicado comparaciones con otros sistemas OCR para cabilio ni con modelos visión-texto de tamaño similar, por lo que la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Feraoun-36M | 36,3 M | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No apto para escritura manuscrita: está ausente por completo de los datos de entrenamiento.
- No soporta maquetación multicolumna: `transcribe_page` lee directamente de lado a lado, por lo que las columnas se mezclan.
- No debe usarse para tomar decisiones sobre personas.
- Solo cubre la lengua cabilia; tarifit, tashelhit y tamazight del Atlas Central comparten parte de la ortografía pero no han sido evaluados.
- La entrada debe ser una línea o una página, no una palabra aislada: todas las entradas se escalan a 52 px de altura útil y una palabra ampliada a esa altura queda fuera de la distribución de entrenamiento.
- La precisión en puntos inferiores depende de la tipografía: en Times New Roman y Arial el modelo acierta líneas completas, pero en caras de alto contraste con serifas finas pierde puntos (`tɛeṛṛamt` pasa a `tzeṛṛamt`, `uḥric` a `uɣric`); el 0,8538 es la media sobre las ocho tipografías de evaluación.
- La tasa de error de palabra es 4,6 veces la de carácter: la mayoría de fallos son un carácter dentro de una palabra por lo demás correcta (un espacio perdido, una mayúscula añadida), de modo que un 2,85 % de CER sigue fallando el 13,2 % de las palabras y el 29,8 % de las líneas.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo OCR entrenado sobre un corpus concreto, la fidelidad está acotada por la distribución de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere cargar código remoto del repositorio (`trust_remote_code=True`), lo que implica revisar y confiar en ese código antes de desplegarlo en producción.
- Las métricas son declaradas por el autor y no han sido verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Feraoun-36M
- Dataset de texto: https://huggingface.co/datasets/agbalu/AGBALU-Text
- Dataset de tifinag: https://huggingface.co/datasets/agbalu/KabTifinagh
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
