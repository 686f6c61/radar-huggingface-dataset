# Scrya/parakeet-tdt-0.6b-singlish-v2

## Resumen

Scrya/parakeet-tdt-0.6b-singlish-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Scrya, obtenido mediante ajuste fino (finetune) del modelo NVIDIA parakeet-tdt-0.6b-v3. Está especializado en inglés de Singapur (singlish) en entornos de sala de reuniones, y aborda el problema de la transcripción precisa de conversaciones entre dos personas en una misma sala con ruido de oficina, teclados, voces de fondo y eco de sala.

El modelo emplea una arquitectura de transductor TDT (Token-and-Duration Transducer) con 627 millones de parámetros y se distribuye en formato safetensors (fp32) para transformers y como checkpoint NeMo (.nemo). Escribe inglés con puntuación y mayúsculas, y deletrea los números como palabras.

Es relevante para desarrolladores que necesiten transcripción de reuniones en el contexto lingüístico de Singapur, donde el inglés local presenta particularidades léxicas y fonéticas que los modelos genéricos no capturan bien. Se entrenó con 1.386 horas del IMDA National Speech Corpus, con un enfoque explícito en condiciones acústicas de oficina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer), familia Parakeet |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors y NeMo); GGUF f16 y q8_0 en repositorios separados |
| Idiomas soportados | en (inglés, con especialización en inglés de Singapur) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (transformers, fp32), .nemo (NeMo, fp32), GGUF (f16, q8_0) |

## Arquitectura y entrenamiento

El modelo es un transductor TDT, una variante de los modelos transducer para ASR que predice conjuntamente tokens y duraciones, lo que permite un alineamiento más eficiente que los transductores clásicos. Parte de los pesos de NVIDIA parakeet-tdt-0.6b-v3 y se ajustó fino sobre 1.386 horas de inglés conversacional de Singapur procedente de cinco partes del IMDA National Speech Corpus (NSC).

El conjunto de entrenamiento se diseñó específicamente para salas de reuniones: aproximadamente la mitad del audio (702 horas) corresponde a dos personas hablando en una misma sala (Parte 3 Same Room, Parte 5 y Parte 4 grabada con teléfonos a unos 2 m en una sala compartida). Se excluyó la Parte 4 Different Room por tratarse de llamadas online. Se mezcló ruido de oficina en la mitad de los clips (equipos de oficina, ventiladores, sonidos de cocina, teclado y hablantes de fondo singapurenses) y se añadió eco sintético de sala al 30% de los clips. La versión 2 promedia dos ejecuciones de entrenamiento con semillas distintas y aplica entrenamiento MWER (minimum word error rate). La model card no detalla el número total de tokens ni si se empleó RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en inglés de Singapur con salida puntuada y con mayúsculas.
- Formateo de salida: escribe los números como palabras (por ejemplo, "twenty five" en lugar de "25").
- Robustez ante ruido de oficina, teclado, hablantes de fondo y eco de sala, gracias al diseño del entrenamiento.
- Transcripción de conversaciones entre dos personas en una misma sala (diarización no mencionada en la información disponible).
- Inferencia mediante transformers con la clase `ParakeetForTDT` y mediante NVIDIA NeMo.
- Ejecución en C++ mediante NeMo-Speech.cpp con pesos GGUF (f16 y q8_0).
- No se mencionan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones de oficina en Singapur: el modelo está entrenado con ruido de oficina y eco de sala, por lo que transcribe conversaciones grabadas en salas compartidas con teclados y voces de fondo con menor tasa de error que un modelo genérico.
- Subtitulado de reuniones y actas automáticas: la salida con puntuación y mayúsculas reduce el postprocesado necesario antes de publicar transcripciones o generar resúmenes.
- Análisis de llamadas de atención al cliente en inglés singapurense: permite transcribir conversaciones telefónicas grabadas en sala compartida (Parte 4 del NSC) para su revisión de calidad.
- Investigación sociolingüística del inglés de Singapur: el ajuste fino sobre el IMDA NSC facilita la creación de corpus transcritos de habla local para estudios fonéticos y léxicos.
- Indexación y búsqueda de archivos de audio corporativos: transcripción por lotes de grabaciones de reuniones para alimentar motores de búsqueda internos.
- Evaluación comparativa de ASR en condiciones acústicas adversas: sirve como referencia para medir la degradación de otros modelos ante ruido de oficina y reverberación.
- Despliegue en entornos con recursos limitados: las variantes GGUF q8_0 permiten ejecutar el modelo con NeMo-Speech.cpp en hardware modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el IMDA National Speech Corpus:

| Conjunto de test | WER normalizado | WER formateado (mayúsculas y puntuación) |
|---|---:|---:|
| NSC Parte 3 SDM | 9,71 | 16,25 |
| NSC Parte 3 Same Room | 9,63 | 15,32 |
| NSC Parte 4 | 13,95 | 22,22 |
| NSC Parte 5 | 6,25 | 12,36 |
| NSC Parte 6.3 | 6,16 | 13,61 |

La model card indica que la versión 2 comete menos errores que la versión 1 en todos los conjuntos de test del NSC, pero no se proporcionan los valores de la versión 1 en la información disponible. Tampoco se publican resultados comparativos con el modelo base NVIDIA en esta ficha.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 ocupan aproximadamente 2,4 GB (safetensors) y 2,51 GB (.nemo), por lo que la inferencia en fp32 requiere en torno a 3-4 GB de VRAM incluyendo activaciones y buffers de audio.
- Las variantes GGUF f16 y q8_0 reducen el requisito de memoria; el tamaño exacto de estos ficheros no está disponible en la información proporcionada.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 y H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, dado el tamaño de 0,6B parámetros y los ~2,5 GB de pesos fp32.
- Opciones de despliegue: transformers (`ParakeetForTDT`), NVIDIA NeMo (nemo_toolkit 2.7.3 verificado por el autor) y NeMo-Speech.cpp con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Scrya/parakeet-tdt-0.6b-singlish-v2 | 627 M | en (singlish) | cc-by-4.0 | safetensors, .nemo, GGUF | Ajuste fino para salas de reuniones en Singapur |
| nvidia/parakeet-tdt-0.6b-v3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que parte este finetune |
| Scrya/parakeet-tdt-0.6b-singlish-v1 | no disponible | en (singlish) | no disponible | no disponible | Versión anterior; según el autor, peor WER en todos los tests del NSC |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en inglés de Singapur y en condiciones de sala de reuniones; su rendimiento en otros dialectos del inglés o en entornos acústicos muy distintos no está documentado.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinación inherente a los modelos ASR: posibles sustituciones de palabras en audio con ruido extremo o hablantes superpuestos.
- La salida deletrea números como palabras, lo que puede requerir normalización posterior en pipelines que esperen dígitos.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero conviene revisar las condiciones del corpus IMDA NSC si se redistribuyen derivados.
- No se documentan sesgos específicos ni el comportamiento con acentos no singapurenses.
- La diarización de hablantes no se menciona como capacidad soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Versión 1: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1
- GGUF f16: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16
- GGUF q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-q8_0
- NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
