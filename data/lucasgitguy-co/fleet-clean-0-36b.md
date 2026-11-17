# Lucasgitguy-co/Fleet-Clean-0.36B

## Resumen

Fleet-Clean-0.36B es un sistema de limpieza de transcripciones de voz que combina dos modelos abiertos encadenados: un motor de reconocimiento de voz y un etiquetador de palabras. Lo desarrolla Lucasgitguy-co y se publica bajo licencia Apache 2.0. El problema que resuelve es concreto: las transcripciones automáticas de habla espontánea arrastran muletillas, repeticiones, falsos arranques y discurso reformulado, y este sistema elimina esos elementos y restablece puntuación y mayúsculas sin reescribir el contenido.

La arquitectura es un pipeline de dos etapas. La primera es Fleet-2 (56M parámetros, motor Cactus Whistle), que transcribe el audio y detecta el idioma. La segunda es un etiquetador de 307M parámetros construido sobre el encoder mmBERT de convaiinnovations/laya-multilingual, con una cabeza nueva que decide, para cada palabra, si se conserva o se borra, qué signo de puntuación la sigue y si cambia la mayúscula inicial. La restricción de diseño es clave: el etiquetador solo puede borrar palabras de Fleet-2 y repuntuar, nunca generar palabras propias, lo que evita alucinaciones de contenido.

El conjunto suma 363M parámetros y cubre ocho idiomas (inglés, alemán, francés, español, italiano, neerlandés, polaco y coreano). Es relevante para quien necesite transcripciones limpias listas para actas, subtítulos o pipelines de datos sin recurrir a un LLM generativo que podría inventar texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: Fleet-2 (56M, Cactus Whistle) para ASR + etiquetador de palabras (307M) sobre encoder mmBERT de laya-multilingual con cabeza de token classification |
| Parametros totales | 363M (56M + 307M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en el etiquetador; audio de hasta 30 s por llamada |
| Tipos de cuantizacion | GGUF disponible en Fleet-Clean-0.36B-GGUF; otros tipos no disponibles |
| Idiomas soportados | en, de, fr, es, it, nl, pl, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repo separado |

## Arquitectura y entrenamiento

El sistema no es un transformer único sino una cadena de dos modelos. Fleet-2 es un modelo ASR de 56M parámetros que ejecuta el motor nativo Cactus Whistle y realiza detección automática de idioma. Su salida es una transcripción con palabras y puntuación preliminar. Sobre esa salida actúa el etiquetador de 307M, que reutiliza el encoder mmBERT del modelo laya-multilingual y añade una cabeza de clasificación por token con tres decisiones: conservar o eliminar la palabra, signo de puntuación posterior (ninguno, coma, punto, interrogación, exclamación) y cambio de caso en la inicial.

Los datos de entrenamiento se generaron transcribiendo con Fleet-2 varios corpus: DisfluencySpeech (train/validation/test), VoxPopuli validation en siete idiomas, Zeroth-Korean y FLEURS coreano, excluyendo las filas que Fleet-2 ya había visto en su entrenamiento. Las etiquetas de borrado en inglés se obtuvieron alineando cada palabra de Fleet-2 con la transcripción verbatim de DisfluencySpeech y mapeándola a su versión limpia; la puntuación y el caso se tomaron de la referencia humana donde coincidía la palabra. El conjunto resultante se publica como fleet-clean-tags. El umbral de borrado se calibró en validación a 0,5 para que el habla fluida conserve sus palabras. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de voz (ASR) multilingüe en ocho idiomas con detección automática de idioma.
- Eliminación de disfluencias: muletillas, marcadores discursivos, repeticiones, falsos arranques y autocorrecciones.
- Restauración de puntuación (coma, punto, interrogación, exclamación) y de mayúsculas iniciales.
- Etiquetado por palabra expuesto en modo JSON (transcripción cruda, limpia y etiquetas por palabra).
- Modo de repuntuación completa (`--punct full`) que repuntúa también palabras alejadas de las eliminaciones.
- Procesamiento de texto directo sin audio (`--text`) para limpiar transcripciones existentes.
- Umbral de borrado configurable (`--threshold`) para ajustar la agresividad de la limpieza.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo generativo.

## Casos de uso

- Actas y notas de reuniones: transcribir audio de hasta 30 s por llamada y obtener texto sin muletillas ni repeticiones, listo para revisión humana, gracias a la eliminación de marcadores discursivos y a la repuntuación automática.
- Subtitulado de entrevistas y pódcast: el pipeline entrega texto limpio y puntuado en ocho idiomas, adecuado para generar subtítulos que no arrastren "you know", "I mean" o reformulaciones del hablante.
- Limpieza de corpus de habla espontánea para entrenamiento: procesar transcripciones de DisfluencySpeech, VoxPopuli o FLEURS y normalizarlas antes de usarlas como datos supervisados, con la garantía de que el etiquetador no introduce palabras nuevas.
- Transcripción de atención al cliente: convertir llamadas grabadas en texto legible para análisis de calidad o búsqueda, eliminando repeticiones sin riesgo de que el modelo invente contenido de la conversación.
- Accesibilidad y documentación clínica: generar transcripciones de consultas o dictados donde la fidelidad literal importa y un LLM generativo sería inaceptable, porque el sistema solo borra y repuntúa.
- Pipelines de datos multilingües: aplicar la limpieza sobre transcripciones ya existentes con `--text` en inglés, alemán, francés, español, italiano, neerlandés, polaco o coreano.
- Preprocesado para búsqueda y recuperación: normalizar transcripciones antes de indexarlas, reduciendo ruido conversacional y mejorando la coincidencia de términos.

## Benchmarks y rendimiento

Habla disfluente real en inglés (test de DisfluencySpeech, 250 clips), comparando con la transcripción limpia de referencia:

| DisfluencySpeech test (250 clips) | Fleet-2 solo | Fleet-Clean |
|---|---:|---:|
| WER frente a transcript_c (puntuación ignorada) | 18,8% | 14,6% |
| F1 de puntuación frente a transcript_c | 0,6700 | 0,6695 |

Habla fluida (FLEURS test, 100 clips por idioma), midiendo palabras eliminadas indebidamente:

| Idioma | Palabras borradas de habla fluida | WER antes | WER después |
|---|---:|---:|---:|
| Inglés | 0,47% | 14,5% | 14,3% |
| Alemán | 0,05% | 22,0% | 22,0% |
| Francés | 0,04% | 24,9% | 25,0% |
| Español | 0,05% | 11,9% | 11,9% |
| Italiano | 0,06% | 16,7% | 16,7% |
| Neerlandés | 0,19% | 30,1% | 30,0% |
| Polaco | 0,29% | 41,6% | 41,6% |
| Coreano | 0,27% | 42,8% (CER) | 42,9% (CER) |

Disfluencias sintéticas (filas de test de etiquetas reservadas), F1 de borrado:

| Idioma | F1 de borrado | Precisión | Recall |
|---|---:|---:|---:|
| Inglés | 0,981 | 0,967 | 0,996 |
| Alemán | 0,984 | 0,968 | 1,000 |
| Francés | 0,970 | 0,946 | 0,995 |
| Español | 0,971 | 0,978 | 0,964 |
| Italiano | 0,969 | 0,959 | 0,979 |
| Neerlandés | 0,952 | 0,920 | 0,986 |
| Polaco | 0,990 | 0,980 | 1,000 |
| Coreano | 0,979 | 0,975 | 0,984 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 363M parámetros totales, la inferencia en FP16 requiere aproximadamente 0,7 GB de pesos, más el coste del motor Cactus Whistle y del runtime.
- GPU recomendadas: no disponibles en la información; por tamaño, cualquier GPU consumer moderna es suficiente en términos de memoria.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: script `fleet_clean.py` incluido en el repo, dependencias `cactus-compute`, `torch`, `transformers>=5` y `safetensors`; versión GGUF para llama.cpp u Ollama en el repo Fleet-Clean-0.36B-GGUF. vLLM y TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Fleet-Clean-0.36B | 363M (56M + 307M) | 512 tokens en etiquetador; 30 s de audio | ASR + etiquetado de disfluencias sin generación | Apache 2.0 |
| Whisper (large-v3) | 1.550M | 30 s de audio | ASR con puntuación, sin limpieza de disfluencias | MIT |
| laya-multilingual | no disponible | no disponible | ASR/encoder multilingüe (base del etiquetador) | no disponible |
| Fleet-2 | 56M | 30 s de audio | ASR ligero con detección de idioma | no disponible |

La diferencia principal frente a Whisper es que Fleet-Clean añade una etapa explícita de eliminación de disfluencias y repuntuación que Whisper no realiza, y lo hace sin generación libre. Frente a usar un LLM para limpiar transcripciones, la ventaja es la garantía de no introducir palabras nuevas. No se dispone de comparativas directas de rendimiento con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El habla disfluente real solo se evaluó en inglés; para los otros siete idiomas los números provienen de disfluencias sintéticas insertadas, no de conversación real.
- Fleet-2 ya omite la mayoría de "uh/um" por haber aprendido de transcripciones Whisper; lo que queda por limpiar son sobre todo "you know", "I mean", "like", repeticiones y reinicios.
- Los errores de reconocimiento persisten: el etiquetador solo puede borrar o repuntuar palabras, no corregir una palabra mal oída.
- Los clips están limitados a 30 s por llamada y el etiquetador lee hasta 512 tokens, dejando sin cambios todo lo que exceda ese límite.
- El umbral de borrado por defecto (0,5) puede eliminar palabras en habla fluida en inglés (0,47% en FLEURS), un riesgo mayor que en el resto de idiomas.
- No es un modelo generativo: no responde preguntas, no resume ni razona sobre el contenido.
- Riesgo de sesgo: no documentado en la información disponible; los corpus de entrenamiento (VoxPopuli, FLEURS, Zeroth) tienen cobertura y dominios limitados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los corpus de entrenamiento subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/Fleet-Clean-0.36B
- Versión GGUF: https://huggingface.co/Lucasgitguy-co/Fleet-Clean-0.36B-GGUF
- Modelo base Fleet-2: https://huggingface.co/Lucasgitguy-co/Fleet-2
- Modelo base laya-multilingual: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/Lucasgitguy-co/fleet-clean-tags
- Colección Speech recognition: https://huggingface.co/collections/Lucasgitguy-co/speech-recognition-6aef2dcbe0ea208136b0ddc9
- Dataset DisfluencySpeech: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset Zeroth-Korean: https://huggingface.co/datasets/Bingsu/zeroth-korean
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
