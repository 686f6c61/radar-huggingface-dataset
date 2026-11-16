# bravend/bartpho-syllable-vi-spellcheck

## Resumen

`bravend/bartpho-syllable-vi-spellcheck` es un modelo de detección y corrección ortográfica para vietnamita desarrollado por el usuario bravend sobre el checkpoint preentrenado `vinai/bartpho-syllable`. Se trata de un encoder-decoder BARTpho (familia mBART adaptada al vietnamita) de aproximadamente 397 millones de parámetros que incorpora dos cabezas que comparten el encoder: una cabeza seq2seq de corrección, que genera la frase corregida, y una cabeza de detección a nivel de token que emite una probabilidad de error por token. El modelo se distribuye con código propio (`trust_remote_code=True`) y una tokenización restringida a un vocabulario SentencePiece de 40K.

El problema que aborda es la corrección ortográfica y de errores superficiales en vietnamita, un idioma con diacríticos y reglas de colocación de tonos que generan errores frecuentes en texto informal, teclados sin soporte y OCR. El modelo se evalúa sobre el conjunto VSEC (9.341 frases, 11.202 errores) siguiendo el protocolo oficial del paper, y declara una F1 de detección de 0,910 y una F1 de corrección de 0,857 con beam 4.

Es relevante ahora porque combina en un único checkpoint dos tareas que habitualmente requieren dos modelos separados (detección y corrección), con un coste de inferencia bajo para su tamaño, licencia MIT y un pipeline declarado de `token-classification` que permite señalar errores sin generar texto. Su alcance, no obstante, está limitado al vietnamita y a errores de nivel de sílaba/palabra, no a errores gramaticales profundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (BARTpho-syllable), con cabeza de corrección seq2seq y cabeza de detección token-level que comparten encoder |
| Parametros totales | 396.906.592 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor oficial; los ejemplos de la model card truncan a `max_length=1024` |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el repo solo contiene safetensors) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,6 GB), con código de modelado y tokenización propio (`custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `vinai/bartpho-syllable`, un BART preentrenado para vietnamita a nivel de sílaba, y le añade una cabeza de detección de errores a nivel de token sobre el encoder, manteniendo la cabeza de generación original para la corrección. Ambas cabezas comparten el encoder, de modo que una sola pasada por el encoder sirve tanto para señalar tokens erróneos como para alimentar la decodificación. El repositorio incluye `modeling_spellcheck.py` y `tokenization_spellcheck.py`, con un SentencePiece restringido al vocabulario de 40K; cargar el modelo con las clases estándar de `transformers` descarta silenciosamente la cabeza de detección y tokeniza de forma distinta las cadenas poco frecuentes, por lo que `trust_remote_code=True` es obligatorio.

El ajuste se realiza sobre el corpus VSEC. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; únicamente indica que las etiquetas de detección se asignaron a nivel de palabra y que el texto de entrada debe normalizarse (NFC, normalización de comillas y guiones, y recolocación de tonos en diptongos como `òa → oà`, `ùy → uỳ`) porque el modelo se entrenó con ese formato. La innovación principal es la doble salida con encoder compartido y una regla de decisión combinada: marcar una palabra como errónea si la generación la modifica o si la probabilidad de la cabeza de detección es ≥ 0,9.

## Capacidades

- Corrección ortográfica en vietnamita a nivel de sílaba y palabra, generando la frase corregida completa.
- Detección de errores a nivel de token mediante una cabeza dedicada que devuelve una probabilidad por token, sin necesidad de decodificar.
- Agregación a nivel de palabra (máximo de probabilidades de las subpalabras) y combinación con la señal de generación mediante `difflib.SequenceMatcher` para producir flags por palabra.
- Umbral de detección ajustable: la model card documenta un barrido de 0,3 a 0,9 con precisión entre 0,915 y 0,987 y recall entre 0,847 y 0,697.
- Modo de decodificación configurable (greedy o beam search; los resultados publicados usan beam 4).
- Normalización de texto de entrada documentada como parte del pipeline (NFC, comillas, guiones y recolocación de tonos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Corrección de texto introducido por usuarios en formularios y chats: el modelo recibe la frase normalizada y devuelve la versión corregida con `generate`, adecuado para vietnamita informal con errores de tecleo y diacríticos.
- Resaltado de errores en editores y correctores en línea: usando solo la cabeza de detección (encoder, sin decodificación) se obtienen probabilidades por token con un coste mucho menor que la generación, lo que permite subrayar palabras sospechosas en tiempo real.
- Preprocesado de corpus para NLP: limpiar texto vietnamita extraído de redes sociales, foros u OCR antes de alimentar pipelines de análisis, clasificación o búsqueda, reduciendo ruido ortográfico.
- Moderación y control de calidad de contenido generado por usuarios: marcar automáticamente publicaciones con errores graves o texto degradado, con umbral ajustable según la tolerancia a falsos positivos.
- Enriquecimiento de motores de búsqueda: normalizar consultas y documentos para mejorar la coincidencia entre variantes mal escritas y la forma canónica de la palabra.
- Anotación asistida para creación de datasets: la salida por palabra (flags) y las probabilidades por token sirven como preetiquetado en herramientas de anotación humana, con revisión posterior.
- Integración en pipelines de CI/CD de contenido editorial: validar artículos o traducciones antes de publicarlos y bloquear los que superen un umbral de error configurable.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre VSEC (9.341 frases, 11.202 errores), protocolo oficial del paper. DP = detección precisión, DR = detección recall, DF = detección F1, CP/CR/CF = equivalentes de corrección.

| Modelo | DP | DR | DF | DF0.5 | CP | CR | CF | CF0.5 |
|---|---|---|---|---|---|---|---|---|
| N-gram (paper VSEC, tabla 4) | 0,912 | 0,731 | 0,812 | – | 0,891 | 0,714 | 0,793 | – |
| Transformer subword VSEC (paper) | 0,931 | 0,813 | 0,868 | 0,905 | 0,874 | 0,763 | 0,815 | 0,849 |
| Sistema VinAI (Nguyen et al., IUI 2023) | 0,937 | 0,868 | 0,901 | 0,923 | 0,909 | 0,843 | 0,875 | 0,896 |
| Este modelo, `generate` greedy | 0,966 | 0,855 | 0,907 | 0,942 | 0,911 | 0,806 | 0,855 | 0,887 |
| Este modelo, `generate` beam 4 | 0,968 | 0,858 | 0,910 | 0,944 | 0,912 | 0,809 | 0,857 | 0,890 |
| Este modelo, solo cabeza de detección, umbral 0,4 | 0,935 | 0,833 | 0,881 | 0,913 | – | – | – | – |

Barrido de umbral de la cabeza de detección (solo encoder, sin decodificación):

| Umbral | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,9 |
|---|---|---|---|---|---|---|
| DP | 0,915 | 0,935 | 0,951 | 0,962 | 0,972 | 0,987 |
| DR | 0,847 | 0,833 | 0,817 | 0,799 | 0,780 | 0,697 |
| DF | 0,880 | 0,881 | 0,879 | 0,873 | 0,865 | 0,817 |

Los valores de la model-index coinciden con la fila de beam 4 (F1 detección 0,91; precisión 0,968; recall 0,858; F1 corrección 0,857; precisión 0,912; recall 0,809). Todos los resultados están marcados como no verificados (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,6 GB solo para pesos (396,9 M de parámetros), más activaciones y caché; en la práctica, holgado en GPUs de 8 GB. En fp16/bf16 el peso baja a aproximadamente 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia cómoda (RTX 3060/4060 en adelante); A100/H100 no son necesarias para este tamaño y solo aportarían throughput en lotes grandes.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores; también es viable en CPU para volúmenes moderados, aunque la latencia será mayor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la presencia de código de modelado propio y tokenizador personalizado complica el uso en servidores de inferencia estándar sin adaptación.
- Latencia y throughput: no disponibles. La cabeza de detección evita la decodificación y por tanto es sensiblemente más barata que `generate`, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en VSEC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BARTpho-syllable multitarea) | 396,9 M | no disponible (ejemplos a 1024) | DF 0,910 / CF 0,857 (beam 4) | MIT | Hugging Face, código propio |
| Sistema VinAI (Nguyen et al., IUI 2023) | no disponible | no disponible | DF 0,901 / CF 0,875 | no disponible | referencia académica |
| Transformer subword VSEC (paper) | no disponible | no disponible | DF 0,868 / CF 0,815 | no disponible | referencia académica |
| N-gram (paper VSEC) | no disponible | no disponible | DF 0,812 / CF 0,793 | no disponible | referencia académica |

Frente al sistema de VinAI, este modelo mejora la detección (DF 0,910 frente a 0,901 y DF0.5 0,944 frente a 0,923) pero queda por debajo en corrección (CF 0,857 frente a 0,875 y CR 0,809 frente a 0,843). No se dispone de comparación con modelos generativos multilingües de propósito general en la información proporcionada.

## Limitaciones y advertencias

- Solo vietnamita: no hay soporte multilingüe declarado; usarlo con otro idioma producirá resultados sin garantía.
- Alcance limitado a errores ortográficos y de sílaba/palabra; no corrige errores gramaticales o de estilo profundos.
- Requiere normalización previa del texto (NFC, comillas, guiones y recolocación de tonos); sin ella el rendimiento puede degradarse porque el entrenamiento usó ese formato.
- `trust_remote_code=True` es obligatorio: cargar con las clases estándar descarta la cabeza de detección y cambia la tokenización de cadenas poco frecuentes, lo que invalida los resultados publicados.
- Resultados no verificados: todos los benchmarks están marcados como `verified: false` y proceden del propio autor; no hay validación independiente.
- El recall de detección cae con umbrales altos (0,697 a umbral 0,9), por lo que la elección de umbral debe calibrarse según el coste de los falsos negativos.
- Riesgo de alucinación en la generación: al ser un modelo seq2seq, puede reescribir fragmentos que no eran erróneos; la regla combinada con la cabeza de detección mitiga parcialmente este riesgo, pero no lo elimina.
- No se documentan sesgos específicos, datos de entrenamiento detallados ni evaluación fuera de VSEC.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `vinai/bartpho-syllable` y del corpus VSEC empleado en el ajuste.
- Para producción: no hay soporte documentado en servidores de inferencia estándar (vLLM, TGI), y no se publican latencias ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bravend/bartpho-syllable-vi-spellcheck
- Modelo base: https://huggingface.co/vinai/bartpho-syllable
- Dataset VSEC (referencia del benchmark): https://huggingface.co/datasets/VSEC
- Paper VSEC y sistema VinAI (Nguyen et al., IUI 2023): no disponible en la información proporcionada
