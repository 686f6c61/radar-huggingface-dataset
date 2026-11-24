# mehdi-hf/Homo-GE2PE-Persian-HF

## Resumen

Homo-GE2PE-Persian-HF es un modelo de conversión grafema-fonema (G2P) para persa (farsi) empaquetado en formato nativo de transformers por el usuario mehdi-hf. No se trata de un modelo nuevo: los pesos son idénticos a los de MahtaFetrat/Homo-GE2PE-Persian, desarrollado por Elnaz Rahmati y colaboradores, y el sufijo `-HF` sigue la convención de empaquetado (como `Llama-2-7b-hf`), no una nueva versión. El repositorio original distribuía pesos comprimidos junto a una copia vendorizada de Parsivar y un wrapper `GE2PE.py`; este repo ofrece un `from_pretrained()` limpio sin dependencias adicionales.

El problema que resuelve es específico y bien delimitado: la escritura persa omite las vocales cortas y nunca escribe el ezafe (la `-e` de enlace entre sustantivo y modificador), por lo que la pronunciación debe inferirse. Además, el persa contiene homógrafos cuya vocalización cambia el significado (por ejemplo, `کرم` como *karam* "generosidad" frente a *kerem* "crema"). El modelo produce una romanización fonémica que restaura vocales, ezafe y desambigua homógrafos, lo que lo convierte en el frontend de pronunciación de pipelines de síntesis de voz (TTS).

Arquitectura T5 (text2text-generation) con 8.264.064 parámetros, derivada de `google/byt5-small`. Está pensado para integrarse como componente previo a un motor TTS persa, y el propio autor lo usa como frontend de `pocket-tts-farsi`. Es relevante ahora porque el autor recomienda dos reemplazos más recientes (`persian-g2p-tiny` de 8,3M parámetros y `persian-g2p-0.6b` de 596M parámetros) con mayor precisión y soporte explícito de marcadores de ezafe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, text2text-generation), derivada de `google/byt5-small` |
| Parámetros totales | 8.264.064 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación configurado a 512 en el ejemplo de uso) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | persa (fa) |
| Licencia | MIT (© 2025 Elnaz Rahmati); modelo base `google/byt5-small` bajo Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de transformers) |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de 8,26M parámetros construido sobre `google/byt5-small`, lo que implica tokenización a nivel de byte (byt5), adecuada para manejar la escritura persa y sus variantes de codificación sin depender de un vocabulario subword específico. La tarea es text2text-generation: recibe texto persa y emite una romanización fonémica con notación interna propia de GE2PE.

El entrenamiento se realizó sobre el dataset HomoRich-G2P-Persian, compuesto por 528.891 frases persas anotadas, según la model card del autor original. La contribución principal del paper (*Fast, Not Fancy: Rethinking G2P with Rich Data and Rule-Based Models*, arXiv:2505.12973) es precisamente la desambiguación de homógrafos y la restauración del ezafe mediante datos ricos en anotación. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá del número de frases.

Una innovación práctica de este reempaquetado es la eliminación de Parsivar del pipeline de inferencia. El autor mide en SentenceBench (400 frases) que eliminar Parsivar mejora todas las métricas, porque el normalizador fusiona preposiciones con la palabra siguiente (`beqadre` frente a `be qadar-e`). Aun así, recomienda usar algún normalizador razonable en producción para manejar `ي`/`ك` árabes, dígitos sueltos e inconsistencias de ZWNJ.

## Capacidades

- Conversión grafema-fonema (G2P) de texto persa a romanización fonémica.
- Restauración del ezafe (la `-e` de enlace) en construcciones nominales, marcada internamente con el flag `1`.
- Desambiguación de homógrafos persas según contexto (por ejemplo, `کرم` como *karam* frente a *kerem*).
- Restauración de vocales cortas omitidas en la escritura persa.
- Generación por beams (el ejemplo oficial usa `num_beams=5`, `max_length=512`, `early_stopping=True`).
- Procesamiento por lotes (`batch_decode` sobre listas de frases).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo especializado de traducción texto-a-texto.
- Capacidad multilingüe limitada al persa (etiqueta `fa`).

## Casos de uso

- Frontend de pronunciación para TTS persa: el modelo convierte texto escrito a una representación fonémica que un motor TTS puede sintetizar; es exactamente el uso para el que el autor lo reempaquetó (`pocket-tts-farsi`, TTS en CPU).
- Generación de léxicos de pronunciación: procesar por lotes corpus persas para producir transcripciones fonémicas que alimenten diccionarios de pronunciación o sistemas de reconocimiento de voz.
- Normalización de texto para pipelines de voz: integrar el modelo antes de un TTS para resolver homógrafos que, de otro modo, se sintetizarían con la vocalización equivocada.
- Investigación en G2P persa: servir como baseline reproducible de 8,26M parámetros para comparar con modelos mayores (`persian-g2p-0.6b`) o con enfoques basados en reglas.
- Evaluación de calidad de pronunciación: usar las salidas del modelo como referencia para medir PER/WER de otros sistemas G2P persas, aplicando el mapeo de notación documentado.
- Despliegue en entornos con recursos limitados: al tener 8,26M parámetros, cabe en CPU y en GPUs de consumo, lo que permite ejecutarlo embebido en aplicaciones de accesibilidad o lectura en voz alta sin infraestructura dedicada.
- Anotación asistida de corpus: preanotar frases persas con vocalización y ezafe para su posterior revisión humana en proyectos de datos lingüísticos.

## Benchmarks y rendimiento

Resultados medidos en SentenceBench (400 frases) según la model card del reempaquetado, comparando la versión original (con Parsivar) frente a este repo (sin Parsivar):

| Métrica | Original (con Parsivar) | Este repo (sin Parsivar) |
|---|---|---|
| PER ↓ | 3,47 % | 3,22 % |
| WER ↓ | 19,47 % | 16,07 % |
| Homograph ↑ | 67,45 % | 70,28 % |
| Ezafe F1 ↑ | 82,76 % | 85,04 % |

Advertencia del autor: comparar cadenas sin aplicar el mapeo de notación (la salida interna de GE2PE difiere de la columna `phoneme` de SentenceBench) produce un PER de aproximadamente el 30 % en lugar del 3 % real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 8,26M parámetros en fp32 el modelo ocupa aproximadamente 33 MB de pesos, y en fp16 unos 17 MB. Cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) es más que suficiente, aunque no se documentan requisitos específicos.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (`AutoTokenizer` + `T5ForConditionalGeneration`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta soporte explícito de llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mehdi-hf/Homo-GE2PE-Persian-HF (este) | 8,26M | no disponible | MIT | Reempaquetado de Homo-GE2PE-Persian; salida con notación interna y flag `1` de ezafe |
| mehdi-hf/persian-g2p-tiny | 8,3M | no disponible | MIT | Reemplazo recomendado por el autor: mayor precisión, marcadores `-e`/`-ye` explícitos, salida estándar sin remapeo y soporte de override de kasra |
| mehdi-hf/persian-g2p-0.6b | 596M | no disponible | Apache-2.0 | Reemplazo recomendado: máxima precisión en homógrafos y ezafe |
| MahtaFetrat/Homo-GE2PE-Persian | no disponible | no disponible | MIT (según este repo) | Modelo original; pesos idénticos, empaquetado con Parsivar y wrapper `GE2PE.py` |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos a `MahtaFetrat/Homo-GE2PE-Persian`; el crédito corresponde a los autores originales.
- La notación de salida es interna de GE2PE y difiere de la notación convencional de SentenceBench; sin aplicar el mapeo documentado, las métricas de comparación se degradan drásticamente (PER ~30 % frente a ~3 %).
- El flag `1` de ezafe no es un fonema y debe eliminarse incondicionalmente; el wrapper original solo lo hacía cuando los recuentos de palabras coincidían.
- Requiere normalización de entrada en producción: el modelo no está entrenado para manejar `ي`/`ك` árabes, dígitos sueltos ni inconsistencias de ZWNJ.
- Especializado exclusivamente en persa; no soporta otros idiomas.
- No soporta tool calling, agentes, visión ni audio.
- Riesgo de alucinación en la vocalización de palabras poco frecuentes u homógrafos ambiguos en contexto; la precisión en homógrafos es del 70,28 % en SentenceBench, lo que implica errores en aproximadamente tres de cada diez casos.
- Licencia MIT para el modelo reempaquetado; el modelo base `google/byt5-small` es Apache 2.0, con atribución completa en `NOTICE.md`.
- El autor recomienda migrar a `persian-g2p-tiny` o `persian-g2p-0.6b` para producción por su mayor precisión y mejor formato de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/Homo-GE2PE-Persian-HF
- Modelo original: https://huggingface.co/MahtaFetrat/Homo-GE2PE-Persian
- Dataset HomoRich: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Benchmark SentenceBench: https://huggingface.co/datasets/MahtaFetrat/SentenceBench
- Paper: https://arxiv.org/abs/2505.12973
- Reemplazo recomendado (tiny): https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Reemplazo recomendado (0.6b): https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- TTS persa que usa este modelo: https://huggingface.co/mehdi-hf/pocket-tts-farsi
- Parsivar: https://github.com/ICTRC/Parsivar
- Modelo base: https://huggingface.co/google/byt5-small
