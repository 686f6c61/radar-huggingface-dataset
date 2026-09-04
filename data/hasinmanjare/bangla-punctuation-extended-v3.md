# HasinManjare/bangla-punctuation-extended-v3

## Resumen

El modelo Bangla Punctuation Restoration Extended v3 es un modelo de restauración de puntuación para texto en bengalí, desarrollado por Manjara Hasin Al Pitom (HasinManjare). Se trata de un fine-tune del modelo BanglaBERT (csebuetnlp/banglabert), que añade dos nuevas clases de puntuación respecto a la versión anterior: el guion (`-`) y la visarga bengalí (`ঃ`). El modelo resuelve el problema de la ausencia de puntuación en transcripciones automáticas de voz (ASR) y en textos bengalíes sin signos, una tarea crítica para el procesamiento posterior del lenguaje natural. Con 110 millones de parámetros y una arquitectura de clasificación de tokens, está diseñado para ser ligero y desplegable en entornos de producción. Su relevancia radica en abordar una necesidad específica de un idioma de bajos recursos, con un enfoque experimental que busca ampliar el vocabulario de puntuación más allá de los signos convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ELECTRA-style) con cabeza de clasificación de tokens |
| Parametros totales | 110.034.442 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bengalí (bn) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder de BanglaBERT (`csebuetnlp/banglabert`), un modelo preentrenado con arquitectura ELECTRA, y se fine-tunea para clasificación de tokens con 10 etiquetas de puntuación. Según el autor, se entrenó con datos del corpus generado por Munem (`abdullahalmunem/ha-pr-bn-munem-generated`), con BanglaPRCorpus y con datos de replay para reducir el olvido de la tarea original. La innovación principal respecto a la versión v2 es la inclusión de dos clases nuevas: el guion y la visarga bengalí. El autor lo describe como un modelo experimental, no como una mejora universal sobre la versión anterior.

## Capacidades

- Restauración de puntuación en texto bengalí: coma (`,`), danda (`।`), interrogación (`?`), exclamación (`!`), punto y coma (`;`), dos puntos (`:`), puntos suspensivos (`…`), guion (`-`) y visarga (`ঃ`).
- Clasificación token a token con alineación de subpalabras, convirtiendo predicciones por token en texto con puntuación.
- Post-procesamiento de ASR: diseñado para corregir transcripciones automáticas de voz que carecen de signos de puntuación.
- No soporta tool calling, ni agentes, ni visión, ni audio: es un modelo de clasificación de tokens puro.
- No es multilingüe: está entrenado exclusivamente para bengalí.

## Casos de uso

- Post-procesamiento de transcripciones ASR en bengalí: el modelo se integra en pipelines de reconocimiento de voz para añadir puntuación automáticamente a la salida sin signos, mejorando la legibilidad y la interpretación.
- Subtitulación automática: los subtítulos generados por ASR suelen carecer de puntuación; este modelo inserta signos para que los subtítulos sean más naturales y fáciles de seguir.
- Preprocesamiento de corpus para NLP: los textos bengalíes sin puntuación dificultan tareas como el análisis sintáctico o la segmentación de frases; el modelo normaliza el texto antes de alimentar otros modelos.
- Síntesis de voz (TTS): la puntuación es esencial para que un sistema TTS produzca pausas y entonación adecuadas; este modelo restaura los signos en el texto de entrada.
- Asistencia en edición de documentos: puede usarse en procesadores de texto para sugerir o corregir la puntuación en textos bengalíes escritos sin signos.
- Análisis de textos históricos o literarios: muchos manuscritos bengalíes carecen de puntuación; el modelo puede restaurarla para facilitar su estudio.
- Extracción de información: la puntuación correcta ayuda a delimitar frases y cláusulas, mejorando la extracción de entidades y relaciones.

## Benchmarks y rendimiento

El autor proporciona una evaluación independiente con resultados desiguales:

| Test set | Overall macro F1 | Punctuation macro F1 |
|---|---|---|
| Munem generated | 0.447 | 0.389 |
| BanglaPRCorpus | 0.396 | 0.331 |
| Original test | 0.473 | 0.416 |

Las F1 de las clases nuevas (guion y visarga) fueron aproximadamente `0.385`/`0.500` en el test de Munem y `0.445`/`0.136` en BanglaPRCorpus. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de 110 millones de parámetros y 0.4 GB de pesos en safetensors, se estima que la inferencia en FP32 requiere menos de 1 GB de VRAM, y es ejecutable en CPU.
- GPU recomendadas: no se especifican. Por su tamaño, es viable en GPUs de consumo como RTX 3060 o inferiores, y en CPUs modernas para inferencia por lotes pequeña.
- Opciones de despliegue: carga directa con `transformers` (AutoModelForTokenClassification) o mediante el paquete `bangla-punctuation` en Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor indica que este modelo no es una mejora universal sobre la versión anterior `bangla-punctuation-v2`, y no se han publicado comparativas públicas con otros sistemas de restauración de puntuación en bengalí.

## Limitaciones y advertencias

- Rendimiento desigual: el macro F1 de puntuación está entre 0.331 y 0.416, con las clases nuevas especialmente débiles.
- Puede producir puntuación incorrecta, excesiva o ausente.
- Degradación en ASR ruidoso, dialectos, code-switching o dominios desconocidos.
- Licencia `other`: el modelo base BanglaBERT no declara licencia explícita, por lo que no se otorgan derechos sobre los pesos originales. Es necesario confirmar los permisos con los autores upstream antes de cualquier redistribución o uso comercial.
- Modelo experimental: no es una mejora universal sobre la versión v2.
- Solo soporta bengalí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HasinManjare/bangla-punctuation-extended-v3
- Modelo base: https://huggingface.co/csebuetnlp/banglabert
- Dataset de entrenamiento: https://huggingface.co/datasets/abdullahalmunem/ha-pr-bn-munem-generated
- Paquete Python en PyPI: https://pypi.org/project/bangla-punctuation/
- Modelo v2: https://huggingface.co/HasinManjare/bangla-punctuation-v2
- Paper de contexto sobre restauración de puntuación en bengalí: https://arxiv.org/html/2507.18448
