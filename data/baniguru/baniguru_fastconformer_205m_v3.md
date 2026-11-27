# baniguru/baniguru_fastconformer_205m_v3

## Resumen

Baniguru FastConformer 205M v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario baniguru y publicado en Hugging Face. Está construido sobre la arquitectura FastConformer de NVIDIA NeMo, un modelo de tipo conformer optimizado para velocidad de inferencia en tareas de transcripción de audio. El nombre indica un tamaño aproximado de 205 millones de parámetros y la librería declarada es NeMo, lo que sitúa al modelo dentro del ecosistema de NVIDIA para speech.

El modelo está orientado a la transcripción de audio en contextos lingüísticos concretos, a juzgar por los conjuntos de evaluación citados en la model card ("Kirtan" y "sehaj Paath"), que remiten a recitaciones religiosas sij. Los resultados publicados muestran una diferencia muy marcada entre ambos dominios: el WER es muy alto en el conjunto Kirtan (31,47 con decodificación RNNT) y muy bajo en sehaj Paath (3,76 con RNNT), lo que sugiere un modelo especializado o ajustado para un subdominio concreto y con un rendimiento limitado fuera de él.

La relevancia del modelo es acotada: se trata de un checkpoint con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con información muy escasa en la model card. Resulta útil como referencia para quien necesite un ASR especializado en recitación sij con NeMo, pero no debe considerarse un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (NeMo), con cabezas RNNT y CTC |
| Parámetros totales | ~205M (según el nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los conjuntos de evaluación sugieren punyabi y recitación sij) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,8 GB, compatible con NeMo) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer, una variante del conformer propuesta por NVIDIA dentro de NeMo que reduce el coste computacional mediante subsampling de la secuencia de entrada y atención por bloques, manteniendo la capacidad de modelar dependencias locales y globales del audio. La model card indica dos cabezas de decodificación: RNNT (transducer) y CTC, lo que permite elegir entre ambas estrategias en inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el idioma exacto ni si se aplicaron técnicas de aumento de datos o ajuste fino supervisado. Los únicos datos publicados son las métricas de evaluación sobre dos conjuntos ("Kirtan" y "sehaj Paath"), sin detallar su procedencia ni tamaño. No se documentan innovaciones técnicas adicionales más allá de las propias de FastConformer.

## Capacidades

- Reconocimiento automático del habla (ASR) con decodificación RNNT y CTC.
- Transcripción de recitaciones religiosas sij (Kirtan y sehaj Paath), según los conjuntos de evaluación reportados.
- Integración con el ecosistema NVIDIA NeMo para pipelines de speech.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Capacidades multilingües: no documentadas; el modelo parece orientado a un dominio lingüístico específico.

## Casos de uso

- Transcripción de recitaciones de sehaj Paath: el modelo reporta un WER de 3,76 (RNNT) y un CER de 1,42 en este dominio, por lo que es adecuado para digitalizar y archivar este tipo de grabaciones con alta fidelidad.
- Archivado y búsqueda de grabaciones de Kirtan: pese al WER elevado (31,47 RNNT), puede servir para indexación aproximada por palabras clave en grandes volúmenes de audio donde no se requiere transcripción literal.
- Subtitulado asistido de contenido religioso sij: combinado con revisión humana, permite generar borradores de subtítulos en entornos de producción de vídeo.
- Investigación en ASR de dominio específico: como checkpoint de referencia para comparar el rendimiento de FastConformer en dominios de recitación frente a modelos generalistas.
- Prototipado con NeMo: al estar empaquetado para NeMo, se puede integrar en pipelines de entrenamiento e inferencia existentes de NVIDIA sin conversión de formato.
- Evaluación comparativa de decodificadores: la disponibilidad de cabezas RNNT y CTC permite analizar el impacto del decodificador en un mismo dominio acústico.

## Benchmarks y rendimiento

| Conjunto | Decodificador | WER | CER |
|---|---|---|---|
| Kirtan | RNNT | 31,47 | 15,01 |
| Kirtan | CTC | 37,06 | 18,03 |
| sehaj Paath | RNNT | 3,76 | 1,42 |
| sehaj Paath | CTC | 5,52 | 1,82 |

No se han publicado resultados en benchmarks estándar (LibriSpeech, Common Voice, MLS, etc.) en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no se especifican tamaños de los conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~205M parámetros en FP16 requiere en torno a 0,4-0,5 GB de pesos; con overhead de activaciones y decodificación, se estima un consumo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: NeMo (nativo), y potencialmente exportación a ONNX o TensorRT para producción; no se documenta soporte directo en vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baniguru_fastconformer_205m_v3 | ~205M | no disponible | 3,76 (sehaj Paath, RNNT) / 31,47 (Kirtan, RNNT) | MIT | Hugging Face (0 descargas) |
| NVIDIA stt_en_fastconformer_transducer_large | ~114M | no disponible | no disponible en esta ficha | CC-BY-4.0 | NGC / Hugging Face |
| Whisper large-v3 | ~1.550M | 30 s de audio | no disponible en esta ficha | MIT | OpenAI / Hugging Face |

La comparación con alternativas resulta limitada porque no se dispone de métricas comparables en el mismo dominio; los modelos citados son referencias generalistas y no se han evaluado sobre Kirtan o sehaj Paath en la información disponible.

## Limitaciones y advertencias

- Rendimiento muy desigual entre dominios: el WER de 31,47 en Kirtan indica que el modelo no es fiable para transcripción literal en ese conjunto.
- Sesgos conocidos: no documentados; al entrenarse sobre un dominio religioso concreto, es probable que generalice mal fuera de él.
- Riesgo de alucinación: inherente a los modelos ASR con decodificación transducer, especialmente con audio ruidoso o fuera de dominio.
- Limitaciones de contexto e idioma: no se especifican la ventana de audio máxima ni los idiomas cubiertos; la model card solo menciona conjuntos de evaluación en el ámbito sij.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni documentación sobre la procedencia de los datos de entrenamiento.
- Caveat para producción: con cero descargas y sin pipeline declarado, el modelo carece de validación comunitaria; conviene evaluarlo exhaustivamente en el dominio objetivo antes de desplegarlo.
- No se documentan procesos de mitigación de sesgos ni evaluaciones de robustez frente a ruido, acentos o solapamiento de hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baniguru/baniguru_fastconformer_205m_v3
- Documentación de NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Papel de FastConformer: https://arxiv.org/abs/2305.05084
