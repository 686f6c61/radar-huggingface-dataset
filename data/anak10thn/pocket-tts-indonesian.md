# anak10thn/pocket-tts-indonesian

## Resumen

Pocket TTS Indonesian es un modelo de síntesis de voz (text-to-speech) con clonación de voz para el idioma indonesio, desarrollado por anak10thn a partir del modelo base kyutai/pocket-tts. Se entrenó sobre 502 horas de habla indonesia del dataset LEMAS, lo que lo convierte en una solución específica para este idioma, con una calidad evaluada mediante WER, similitud de hablante y UTMOS.

El repositorio incluye dos variantes: un modelo estudiante de 6 capas (438 MB) y un modelo profesor de 24 capas (1.27 GB). El estudiante fue destilado del profesor con un coeficiente de guía (`distill_cfg_coef: 2.0`), de modo que alcanza la calidad con guía en una sola pasada del backbone, que es lo que realmente ejecuta la CLI de `pocket-tts generate`. El modelo recomendado es el de 6 capas, porque es más rápido (2.23x tiempo real en CPU), más ligero y obtiene mejores métricas que el profesor (WER mediano 12.50% frente a 16.67%, similitud 0.938 frente a 0.927, UTMOS 2.68 frente a 2.36).

Su relevancia radica en ofrecer un TTS en indonesio de código abierto, con licencia CC-BY-4.0, que admite clonación de voz a partir de un audio de referencia y que puede ejecutarse sin GPU en tiempo real. La publicación incluye una evaluación detallada sobre 153 pares de frases de 116 hablantes, así como un análisis del umbral de fin de secuencia (`eos-threshold`), lo que permite afinar el comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket-TTS (basado en kyutai/pocket-tts) |
| Parametros totales | No disponible (peso del modelo: 438 MB para el 6L, 1.27 GB para el 24L) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pocket-TTS de Kyutai, un sistema de síntesis de voz diseñado para ser ligero y eficiente. El repositorio contiene dos configuraciones: `indonesian_6l.yaml` (modelo estudiante de 6 capas) y `indonesian_24l.yaml` (modelo profesor de 24 capas), ambas con sus pesos correspondientes en safetensors y un tokenizador compartido (`tokenizer.model`).

El entrenamiento se realizó sobre 502 horas de habla indonesia del dataset LEMAS-Project/LEMAS-Dataset-train. El modelo estudiante fue destilado del profesor con guía incorporada mediante `distill_cfg_coef: 2.0`, lo que le permite alcanzar la calidad con guía en una sola pasada. El profesor solo iguala esa calidad si se usa con `--cfg 2.0`, pero el paquete distribuido no soporta ese parámetro, por lo que el profesor se mantiene únicamente con fines de reproducibilidad y como punto de partida para destilación. El tokenizador aplica case-folding internamente, de modo que las mayúsculas y puntuación no alteran los tokens generados.

## Capacidades

- Generación de voz en indonesio a partir de texto, con clonación de voz mediante un audio de referencia.
- Clonación de voz sin necesidad de entrenamiento adicional: basta con proporcionar un archivo de audio.
- Funcionamiento en CPU a 2.23x tiempo real con el modelo de 6 capas.
- Soporte de texto largo mediante troceado, aunque puede omitir elementos en enumeraciones extensas.
- Normalización interna de mayúsculas y puntuación; los números deben escribirse como palabras porque las cifras son tokens fuera de vocabulario.
- Sin soporte de tool calling, visión ni entrada de audio adicional más allá de la voz de referencia.
- Si no se proporciona una voz, se usa el audio de alba-mackenna/casual.wav de kyutai/tts-voices como referencia por defecto.

## Casos de uso

- Audiolibros en indonesio: se puede clonar la voz de un narrador y generar la narración completa de un libro o artículo, aprovechando la velocidad en CPU para producción local sin costes de GPU.
- Asistentes de voz para atención al cliente: integrable en sistemas de respuesta automática en indonesio, con clonación de la voz de un agente para mantener consistencia de marca.
- Doblaje de contenido audiovisual: generar la pista de audio en indonesio a partir de un guion, usando una voz de referencia seleccionada.
- Accesibilidad digital: convertir contenido escrito (noticias, documentos, páginas web) en audio para personas con discapacidad visual o dificultades de lectura.
- Material educativo: crear lecciones en audio para cursos de idiomas o formación, con voces naturales y clonadas para distintos personajes o instructores.
- Prototipado de aplicaciones TTS en indonesio: permite evaluar rápidamente la calidad de voz y la clonación sin depender de servicios en la nube, gracias a su ejecución local con la librería `pocket-tts`.

## Benchmarks y rendimiento

La evaluación se realizó sobre 153 pares de frases de 116 hablantes del split de evaluación de LEMAS, sin solapamiento con el entrenamiento. Se usó Whisper-large-v3 fijado a indonesio, normalización agnóstica del idioma, `--temp 0.3 --n-steps 1 --cfg 1.0` (sin guía). Cada modelo se evaluó en su mejor `eos-threshold`.

| Metrica | Teacher 24L (eos -5.0) | Student 6L (eos -6.0) |
|---|---|---|
| WER mediano por elemento | 16.67% | 12.50% |
| Elementos con WER superior al 50% | 10 / 153 | 7 / 153 |
| Generaciones silenciosas | 0 | 2 |
| Similitud de hablante | 0.927 | 0.938 |
| UTMOS | 2.36 | 2.68 |
| WER de corpus | 20.55% | 24.44% |

Barrido completo del estudiante 6L según `eos-threshold`:

| eos | WER mediano | >50% WER | Silenciosas | sin EOS | Similitud | UTMOS |
|---|---|---|---|---|---|---|
| -2.0 | 30.00% | 30 | 0 | 43 | 0.916 | 2.26 |
| -3.0 | 22.22% | 26 | 0 | 14 | 0.927 | 2.43 |
| -4.0 (CLI por defecto) | 18.18% | 16 | 0 | 0 | 0.936 | 2.61 |
| -5.0 | 15.38% | 16 | 0 | 0 | 0.936 | 2.64 |
| -6.0 | 12.50% | 7 | 2 | 0 | 0.938 | 2.68 |
| -7.0 | 10.00% | 22 | 18 | 0 | 0.932 | 2.73 |
| -8.0 | 45.45% | 71 | 63 | 0 | 0.932 | 2.79 |

En un ejemplo de texto largo (73 palabras, discurso formal), el estudiante 6L obtuvo un WER del 4.11% frente al 26.03% del profesor, con una duración de audio de 26.8 segundos frente a 33.3 segundos. El autor advierte que el WER de corpus no es fiable porque una generación que se repite más allá del texto infla las inserciones; se deben leer las medianas.

## Requisitos de hardware

- Modelo 6L: 438 MB de pesos. Funciona en CPU a 2.23x tiempo real, por lo que no se requiere GPU para uso práctico.
- Modelo 24L: 1.27 GB de pesos. En CPU rinde 0.69x tiempo real, por lo que se recomienda GPU para un uso aceptable.
- Cualquier GPU con al menos 1 GB de VRAM es suficiente para el modelo 6L; para el 24L se necesitaría alrededor de 2 GB.
- Despliegue mediante la librería `pocket-tts` (CLI `uvx pocket-tts generate` y API Python `TTSModel`). No se mencionan integraciones con vLLM, llama.cpp u otros frameworks.
- Latencia: en CPU, el 6L genera 2.23 veces más rápido que la duración del audio; el 24L genera a 0.69 veces la duración del audio.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos TTS en la información proporcionada. El modelo se compara internamente con su teacher 24L, que es la única alternativa de la misma arquitectura disponible en el repositorio. No se han encontrado datos de benchmarks frente a otros modelos TTS en indonesio (como servicios propietarios o modelos open source similares).

| Modelo | Peso | Velocidad CPU | WER mediano | Similitud | UTMOS | Licencia |
|---|---|---|---|---|---|---|
| Pocket TTS Indonesian 6L | 438 MB | 2.23x | 12.50% | 0.938 | 2.68 | CC-BY-4.0 |
| Pocket TTS Indonesian 24L | 1.27 GB | 0.69x | 16.67% | 0.927 | 2.36 | CC-BY-4.0 |

## Limitaciones y advertencias

- Los números deben escribirse como palabras (por ejemplo, `lima belas` en lugar de `15`); las cifras son tokens fuera de vocabulario.
- El umbral `eos-threshold` es crítico: el valor por defecto de la CLI (-4.0) produce un WER mediano del 18.18%, mientras que -6.0 lo reduce al 12.50%. Valores más negativos como -7.0 reducen el WER pero aumentan las generaciones silenciosas (18 de 153).
- El modelo puede omitir elementos en enumeraciones largas; se recomienda dividir las listas en frases separadas si se necesita exactitud.
- El teacher 24L es peor que el student 6L en calidad y velocidad, y no debe usarse en producción.
- El WER de corpus puede ser engañoso; el autor recomienda leer las medianas por elemento.
- No se han documentado sesgos específicos, pero al ser un modelo de clonación de voz, se debe obtener permiso de la persona cuya voz se clona para evitar problemas legales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no exime de los derechos de las voces utilizadas como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anak10thn/pocket-tts-indonesian
- Dataset de entrenamiento: https://huggingface.co/datasets/LEMAS-Project/LEMAS-Dataset-train
- Paper asociado: https://arxiv.org/abs/2509.06926
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Voz por defecto (alba): https://huggingface.co/kyutai/tts-voices/blob/main/alba-mackenna/casual.wav
