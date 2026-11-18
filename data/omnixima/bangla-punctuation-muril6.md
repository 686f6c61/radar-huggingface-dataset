# omnixima/bangla-punctuation-muril6

## Resumen

`omnixima/bangla-punctuation-muril6` es un modelo compacto de restauración de puntuación para bengalí (bangla), desarrollado por el autor de GitHub Omnixima como componente del motor de dictado Kothon. Su función es insertar los signos `।` (danda), `,` y `?` en texto bengalí sin puntuar, típicamente la salida en bruto de un sistema de reconocimiento automático del habla (ASR). Se trata de un clasificador de tokens basado en MuRIL, no de un modelo generativo: asigna una etiqueta a cada palabra y coloca el signo correspondiente tras ella.

El modelo deriva de `SayedShaun/asr-punctuation-restore-bn`, que a su vez republica las cabezas de puntuación de la solución ganadora de Erdene-Ochir Tuguldur en el concurso Bengali.AI Speech Recognition. Sobre esa base, Omnixima aplica dos cambios concretos: poda el vocabulario de MuRIL de 197.285 a 26.789 tokens (conservando piezas en escritura bengalí, dígitos y caracteres sueltos) y almacena los pesos en F16, reduciendo el tamaño de 745 MB a 122 MB.

Con 63,5 millones de parámetros y un repositorio de 0,1 GB, el interés del modelo es práctico: ofrece la misma calidad de puntuación que el original con una huella mucho menor, lo que permite ejecutarlo en dispositivo (en Kothon, unos 16 ms por frase dictada en CPU de un M2 Max). Está publicado bajo licencia Apache-2.0 y solo soporta bengalí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MuRIL-base), cabeza de clasificación de tokens |
| Parámetros totales | 63.500.548 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MuRIL-base-cased usa 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | Pesos publicados en F16; no se documentan otras cuantizaciones |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder tipo BERT de 6 capas (variante reducida de MuRIL) con una cabeza de token classification de cuatro etiquetas: `O` (sin signo), `PERIOD` (`।`), `COMMA` (`,`) y `QUESTION` (`?`). Cada palabra recibe la etiqueta de su primer sub-token y el signo se inserta después de la palabra. El vocabulario ha sido podado de 197.285 a 26.789 tokens, lo que reduce drásticamente el tamaño de la tabla de embeddings, que concentraba la mayor parte del peso del modelo original.

El ajuste fino de puntuación lo entrenó Erdene-Ochir Tuguldur (tugstugi, equipo Chimege) sobre IndicCorp v2 Bangla, y SayedShaun lo empaquetó y mapeó las etiquetas. La contribución de este repositorio se limita a la poda de vocabulario y al cambio de precisión a F16. Según la model card, sobre 13.954 palabras de texto bengalí de FLEURS solo cambiaron 14 etiquetas (0,1 %) respecto al original, con las mismas puntuaciones. No se documenta uso de RLHF ni DPO (no aplica a una tarea de etiquetado).

## Capacidades

- Restauración de puntuación en texto bengalí sin puntuar: inserta danda (`।`), coma (`,`) y signo de interrogación (`?`).
- Clasificación de tokens a nivel de palabra mediante sub-tokens, con la etiqueta tomada del primer sub-token.
- Integración en pipelines de ASR como postprocesador de la transcripción.
- Ejecución en dispositivo con latencia baja (unos 16 ms por frase dictada en CPU M2 Max según la model card).
- Detección de interrogaciones mezcladas con enunciados (F1 de 0,81 en el conjunto de preguntas).
- No soporta generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un clasificador de tokens.
- Capacidad multilingüe: no disponible (solo bengalí).

## Casos de uso

- Postprocesado de transcripciones ASR en bengalí: se aplica sobre la salida sin puntuar del reconocedor para insertar danda, comas y signos de interrogación, mejorando la legibilidad del texto antes de mostrarlo o almacenarlo.
- Dictado en dispositivo: es el componente que usa Kothon tras transcribir; su tamaño de 122 MB y su latencia de ~16 ms por frase lo hacen apto para ejecución local en portátiles sin GPU.
- Subtitulado automático de vídeo y audio en bengalí: la puntuación restaurada facilita la segmentación en frases y la sincronización de subtítulos.
- Preparación de corpus y datos de entrenamiento: normalizar texto bengalí sin puntuar procedente de foros, chats o transcripciones antes de usarlo en otros pipelines de NLP.
- Búsqueda y recuperación de información: añadir puntuación a documentos indexados mejora la segmentación en frases y la calidad de los fragmentos recuperados.
- Accesibilidad: transcripción con puntuación para usuarios con discapacidad auditiva o para lectores de pantalla que se benefician de una segmentación clara del texto.
- Procesamiento por lotes de bajo coste: al ser un modelo de 63,5 M de parámetros, se puede desplegar en CPU para grandes volúmenes de texto sin requerir aceleradores.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre referencias de test de FLEURS bn con la puntuación eliminada, más 30 preguntas escritas a mano:

| Conjunto | Danda F1 | Coma F1 | Pregunta F1 |
|---|---|---|---|
| Frases sueltas | 0,91 | 0,52 | no aplica |
| Pasajes de 3 frases | 0,88 (0,84 en mitad de texto) | 0,53 | no aplica |
| Preguntas mezcladas con enunciados | 0,92 | no aplica | 0,81 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con pesos en F16 el modelo ocupa aproximadamente 122 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con al menos ~0,5 GB de memoria libre es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: `transformers` (PyTorch) para inferencia en Python; el autor lo integra en Kothon mediante Rust y candle con Apple Accelerate. Para servir en producción se puede envolver en un servicio HTTP propio; no se documentan integraciones con vLLM, TGI u Ollama (no aplican a un clasificador de tokens de este tamaño).
- Latencia y throughput: aproximadamente 16 ms por frase dictada en CPU de M2 Max (Rust + candle + Apple Accelerate) según la model card. No se publican cifras de throughput para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omnixima/bangla-punctuation-muril6 | 63,5 M | no disponible | Puntuación bengalí (token classification) | Apache-2.0 | Hugging Face |
| SayedShaun/asr-punctuation-restore-bn | no disponible (modelo base del anterior) | no disponible | Puntuación bengalí | no disponible en la información proporcionada | Hugging Face |
| google/muril-base-cased | no disponible en la información proporcionada | 512 tokens (modelo base estándar) | Encoder multilingüe (17 lenguas indias), sin cabeza de puntuación | Apache-2.0 | Hugging Face |

La comparación con alternativas de otros idiomas o de propósito general no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta bengalí; no es utilizable en otros idiomas.
- El rendimiento en comas es notablemente inferior al de danda y preguntas (F1 en torno a 0,52-0,53), por lo que la inserción de comas es poco fiable.
- El rendimiento baja en mitad de pasajes largos (F1 de danda de 0,84 frente a 0,88 en pasajes de 3 frases), lo que sugiere degradación con textos más largos.
- Es un clasificador de tokens, no un modelo generativo: no puede reescribir, corregir ni reformular el texto, solo añadir signos.
- Riesgo de inserción incorrecta de signos en texto con estructura atípica (listas, código, abreviaturas), ya que el entrenamiento se basa en corpus de texto corrido.
- No se documentan sesgos específicos en la model card; al derivar de IndicCorp v2 Bangla, puede reflejar la distribución y los sesgos de ese corpus.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribución a los autores originales (Tuguldur, SayedShaun y google/muril-base-cased).
- La model card indica que la poda de vocabulario conserva solo piezas en escritura bengalí, dígitos y caracteres sueltos; el texto con caracteres latinos o símbolos podría no tokenizarse de forma óptima.
- No hay validación independiente publicada más allá de las métricas del autor; conviene evaluar en el dominio concreto antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omnixima/bangla-punctuation-muril6
- Modelo base (repositorio intermedio): https://huggingface.co/SayedShaun/asr-punctuation-restore-bn
- Modelo base original de MuRIL: https://huggingface.co/google/muril-base-cased
- Proyecto Kothon: https://github.com/Omnixima/kothon
- Perfil del autor SayedShaun: https://huggingface.co/SayedShaun
