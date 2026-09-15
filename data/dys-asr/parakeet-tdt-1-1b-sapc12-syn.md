# dys-asr/parakeet-tdt-1.1b-sapc12-syn

## Resumen

Parakeet TDT 1.1B — SAPC1 + SAPC2 + synthetic speech es un modelo de reconocimiento automático del habla (ASR) especializado en habla disártrica en inglés, desarrollado por el colectivo dys-asr. Se trata de un ajuste fino del modelo base extraordinarylab/parakeet-tdt-1.1b sobre las particiones de entrenamiento deduplicadas del Speech Accessibility Project (SAPC1 y SAPC2) más 103,1 horas de habla disártrica sintética generada con un clonador de voz. El objetivo es mejorar la transcripción de personas con trastornos motores del habla, un caso históricamente mal cubierto por los ASR comerciales entrenados con habla estándar.

Arquitectónicamente es un transductor token-and-duration (TDT), una variante de la familia RNN-T con unos 1.070 millones de parámetros, aproximadamente el doble que los modelos de 0,6B de la misma familia. Requiere `transformers>=5.9` y entrada de audio mono a 16 kHz. Es relevante porque publica pesos abiertos para una tarea de accesibilidad poco atendida, aunque el propio autor advierte que sus resultados quedan por detrás de los modelos de 0,6B de la familia.

La ficha del autor es inusualmente honesta: reconoce que el modelo **no supera** a alternativas con la mitad de parámetros (7,13 % CER frente a 6,06 %) y que las comparaciones están confundidas por diferencias en los datos de entrenamiento. Los pesos se publican "para constancia" más que como el mejor miembro de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor token-and-duration (TDT), variante de RNN-T |
| Parámetros totales | 1.070.521.990 (≈1,1B) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No aplica como ventana de tokens; audio de entrada de 0,5 a 45 s, máximo 130 tokens de etiqueta durante el entrenamiento; entrada mono a 16 kHz |
| Tipos de cuantización | no disponible (el autor no publica versiones cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | speech-accessibility-project-dua (Other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transductor TDT (token-and-duration transducer) de la familia Parakeet, construido sobre `extraordinarylab/parakeet-tdt-1.1b`. Un TDT combina la decodificación conjunta de un transductor RNN-T con la predicción de duración de tokens, lo que permite avanzar varios fotogramas por paso de decodificación y reduce la latencia frente a un RNN-T estándar. Requiere `transformers>=5.9` y se ejecuta mediante `ParakeetForTDT` junto con el procesador asociado.

El conjunto de entrenamiento suma 428.388 registros y 935,7 horas: 218.900 registros de SAPC1 train (501,5 h, 580 hablantes), 153.500 de SAPC2 train (331,1 h, 460 hablantes) y 55.988 registros de habla sintética CosyVoice (103,1 h, 617 hablantes). SAPC2 re-publica 182.575 grabaciones de SAPC1 bajo los mismos nombres de fichero, por lo que el audio se deduplica por nombre de fichero. Tras filtros de duración (0,5 a 45 s) y longitud de etiqueta (máximo 130 tokens, que descartó 716 emisiones) quedan 423.328 ejemplos de entrenamiento. Los tramos entre corchetes de SAPC2, que contienen el enunciado de la entrevista mostrado al hablante y no leído en voz alta, se eliminan antes de la normalización. El corpus sintético se generó con un Fun-CosyVoice3 ajustado en modo de clonación de voz zero-shot, con voces de referencia muestreadas dentro de cada etiología en proporción a la raíz cuadrada del CER base de cada hablante.

El procedimiento de entrenamiento consistió en diez épocas sobre dieciséis GH200, batch efectivo 32 (2 por dispositivo), AdamW a 1e-4 con schedule tri-stage (10 % warmup, 40 % hold), weight decay 0,01, layerdrop 0,05, gradient clip 1,0, bf16 y semilla 42. Se aplicó perturbación de velocidad online (0,8 / 0,9 / 1,0 / 1,1 / 1,2) y SpecAugment al 5 % del eje temporal en tramos de 10 fotogramas y al 40 % del eje mel en tramos de 27 bins. Los checkpoints se ordenaron por CER sobre un subconjunto de 4.000 emisiones del split dev reservado; los pesos publicados son la época 10, la mejor de las diez. El autor señala que la curva de aprendizaje aún descendía en la época 10, a diferencia de los modelos de 0,6B, que se aplanan alrededor de la época 9.

## Capacidades

- Reconocimiento automático del habla en inglés, con especialización en habla disártrica.
- Decodificación codiciosa sin modelo de lenguaje externo.
- Entrada de audio mono a 16 kHz.
- Manejo de segmentos de 0,5 a 45 segundos durante el entrenamiento.
- Entrenado con augmentation agresiva (perturbación de velocidad y SpecAugment), lo que aporta robustez ante variaciones de ritmo.
- Soporte de tool calling / function calling: no aplica (modelo de ASR, no generativo conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna documentada más allá del ajuste a habla disártrica; no incluye visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de voz para personas con disartria: el modelo está ajustado específicamente sobre SAPC1, SAPC2 y habla sintética disártrica, por lo que puede generar subtítulos y actas para usuarios con trastornos motores del habla donde un ASR generalista falla.
- Subtitulado en tiempo real en accesibilidad: con audio mono a 16 kHz y segmentos de hasta 45 s, encaja en pipelines de subtitulado automático para videollamadas o eventos en directo.
- Documentación clínica asistida: transcripción de entrevistas con pacientes con trastornos del habla, reduciendo el esfuerzo manual del personal sanitario en la toma de notas.
- Investigación en accesibilidad del habla: como punto de comparación reproducible frente a los modelos de 0,6B de la misma familia, útil para estudiar el efecto del tamaño del modelo en habla disártrica.
- Asistentes de voz para usuarios con disartria: integrar la transcripción como primer eslabón de un asistente por voz doméstico o de movilidad.
- Generación de datos de evaluación: el modelo permite comparar arquitecturas TDT y RNN-T sobre un conjunto held-out de hablantes no vistos (48 hablantes, 17.582 emisiones).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre SAPC2 dev, con los 48 hablantes que no aparecen en entrenamiento, decodificación codiciosa y sin modelo de lenguaje:

| Modelo | Parámetros | WER | CER |
|---|---:|---:|---:|
| parakeet-tdt-1.1b-sapc12-syn (este modelo) | 1,1B | 11,29 % | 7,13 % |
| parakeet-rnnt-0.6b-all-syn-chunk-cutout | 0,6B | 10,21 % | 6,33 % |
| parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup | 0,6B | 9,91 % | 6,06 % |

Evolución por época sobre el subconjunto de 4.000 emisiones usado para ordenar checkpoints:

| Época | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| WER | 13,36 | 12,60 | 12,41 | 12,33 | 12,59 | 12,33 | 11,76 | 11,40 | 11,17 | **11,07** |
| CER | 8,39 | 7,99 | 7,66 | 7,59 | 8,06 | 7,95 | 7,27 | 7,11 | 6,94 | **6,93** |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no publicado por el autor): en fp32 ≈4,3 GB de pesos; en bf16 ≈2,1 GB; en int8 ≈1,1 GB. Hay que sumar la activación del encoder durante la inferencia.
- GPU recomendadas: el modelo cabe con holgura en GPUs de consumo como RTX 3060 12 GB, RTX 4070/4080/4090 y superiores; también en A100, H100 o L40S para despliegue por lotes.
- Cabe en GPU de consumo: sí, con 1,1B de parámetros y 4,3 GB de repo, entra en cualquier GPU con 8 GB o más en bf16/fp32.
- Opciones de despliegue: el modelo se carga con `transformers>=5.9` mediante `ParakeetForTDT` y `AutoProcessor`. No se han publicado versiones GGUF, ni integración documentada con llama.cpp, Ollama, vLLM o TGI en la información disponible; para ASR de tipo transductor estas herramientas no suelen dar soporte directo.
- Latencia y throughput: no disponible (el autor no publica medidas de latencia ni RTF).

## Comparativa con modelos similares

| Modelo | Parámetros | WER | CER | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| parakeet-tdt-1.1b-sapc12-syn | 1,1B | 11,29 % | 7,13 % | speech-accessibility-project-dua | HuggingFace (dys-asr) |
| parakeet-rnnt-0.6b-all-syn-chunk-cutout | 0,6B | 10,21 % | 6,33 % | no disponible en esta ficha | HuggingFace (dys-asr) |
| parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup | 0,6B | 9,91 % | 6,06 % | no disponible en esta ficha | HuggingFace (dys-asr) |

La comparación no es limpia según el propio autor: los dos modelos de 0,6B se diferencian de este por algo más que el número de parámetros. Añaden SAPC1 dev (72 horas que este modelo nunca vio), incorporan 78,8 horas de audio de formato largo recuperadas mediante alineación forzada y recorte de grabaciones que superaban el límite de 45 segundos (que esta ejecución descartó) y elevan el límite de tokens de etiqueta (el detalle queda truncado en la model card disponible). El autor interpreta que la capacidad extra de 1,1B no se amortizó en esta configuración.

## Limitaciones y advertencias

- Rendimiento inferior a los modelos de 0,6B de la misma familia en el split de evaluación (7,13 % CER frente a 6,06 %).
- La curva de aprendizaje no había convergido al final del schedule de diez épocas, por lo que parte de la diferencia puede deberse a un entrenamiento más corto y no solo a la arquitectura.
- Idioma: solo inglés; no hay soporte multilingüe.
- Sesgos potenciales: el habla sintética añade artefactos de TTS, reproduce de forma imperfecta el deterioro del hablante y no aporta diversidad de hablantes nueva al clonar voces ya presentes en el corpus.
- Riesgo de alucinación: como todo ASR, puede generar transcripciones plausibles pero incorrectas, especialmente en audio ruidoso o hablantes fuera de la distribución.
- La licencia es `speech-accessibility-project-dua` (Other), vinculada al Speech Accessibility Project; hay que revisar las condiciones antes de cualquier uso comercial.
- Entrada restringida a audio mono a 16 kHz y segmentos cortos (el entrenamiento filtró a 0,5-45 s), lo que limita el uso con audio de formato largo sin trocear.
- Los benchmarks declarados tienen `verified: false`; no han sido validados por un tercero.
- Dependencia de `transformers>=5.9`, versión relativamente reciente que puede no estar disponible en todos los entornos.
- El historial de entrenamiento incluyó dos fallos por bloqueo del sistema de ficheros compartido durante escrituras de checkpoint; según el autor no afecta a métricas ni schedule, pero explica la irregularidad del tiempo de reloj.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-tdt-1.1b-sapc12-syn
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-tdt-1.1b
- Modelo comparativo (soup): https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-soup
- Dataset SAPC1: https://huggingface.co/datasets/dys-asr/sapc1
- Dataset SAPC2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia / Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/

Resultados de búsqueda web recibidos: las URLs devueltas (ffdys.com, fr.wikipedia.org/wiki/Troubles_DYS, pharma-gdd.com, lesdys.fr, portail-handicap.fr) tratan sobre los "troubles dys" en general (dislexia, dislexia, discalculia) en francés y no son específicas de este modelo ni del habla disártrica. No se han encontrado en la búsqueda enlaces técnicos relevantes sobre el modelo.
