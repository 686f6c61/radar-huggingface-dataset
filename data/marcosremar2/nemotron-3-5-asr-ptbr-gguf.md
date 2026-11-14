# marcosremar2/nemotron-3.5-asr-ptbr-gguf

## Resumen
Nemotron 3.5 ASR pt-BR GGUF es una cuantización en formato GGUF del modelo de reconocimiento automático del habla ottema/nemotron-3.5-asr-ptbr, un ajuste fino para portugués de Brasil del modelo streaming de NVIDIA nemotron-3.5-asr-streaming-0.6b. Lo publica el usuario marcosremar2 para dar soporte al modo local de la aplicación de escritorio ucast.me, ejecutándose mediante NeMo-Speech.cpp v0.3.0 en CPU. El modelo está pensado para transcripción en streaming de audio en portugués brasileño con una latencia baja y un coste computacional contenido.

La arquitectura subyacente es un Conformer con RNNT cache-aware (streaming), con 648.268.960 parámetros totales y un tamaño de repositorio de 0,8 GB. El ajuste fino original se entrenó sobre CORAA, MLS y Common Voice 9, lo que orienta el modelo hacia variedades y dominios del portugués de Brasil, incluyendo habla espontánea y lectura.

Su relevancia práctica radica en que ofrece una alternativa ejecutable en CPU sin GPU dedicada para transcripción en tiempo real en portugués, con pérdida de precisión prácticamente nula respecto al modelo en f16 según las mediciones publicadas por el autor. Es un artefacto de despliegue más que un modelo nuevo: no modifica los pesos, solo los convierte a q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con RNNT cache-aware (streaming ASR) |
| Parametros totales | 648.268.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks de 160 ms en streaming) |
| Tipos de cuantizacion | q8_0 (publicado); el autor compara con f16 y q4_k |
| Idiomas soportados | pt (portugués, orientado a pt-BR) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (q8_0); modelo base en formato NeMo (.nemo) |

## Arquitectura y entrenamiento
El modelo base es un Conformer de NVIDIA para reconocimiento del habla en streaming con decodificador RNNT y mecanismo cache-aware, lo que permite procesar audio de forma incremental manteniendo estado entre chunks. El ajuste fino ottema/nemotron-3.5-asr-ptbr se realizó sobre el checkpoint nvidia/nemotron-3.5-asr-streaming-0.6b empleando CORAA, MLS y Common Voice 9 como datos de entrenamiento en portugués. No se dispone de información sobre el número exacto de tokens de audio, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversión a GGUF se realizó con el script convert_model.py de NeMo-Speech.cpp en la versión v0.3.0 (commit 20999cc921d2b14aa58708f61756a8b2e787ba20), sin alterar los pesos. Las convoluciones pointwise del Conformer se mantienen en F16, tal como hace el conversor para RNNT cache-aware en q8_0. El modelo está optimizado para inferencia en CPU mediante NeMo-Speech.cpp.

## Capacidades
- Reconocimiento automático del habla en streaming para portugués de Brasil, procesando audio en chunks de 160 ms.
- Transcripción incremental con estado cacheado entre fragmentos, adecuada para dictado y subtitulado en tiempo real.
- Ejecución en CPU sin GPU, lo que permite integración en aplicaciones de escritorio.
- Cuantización q8_0 con precisión prácticamente idéntica al modelo en f16 según las mediciones del autor.
- No se documentan capacidades de traducción, diarización, puntuación automática, tool calling ni razonamiento multi-paso.
- El modelo está limitado a audio en portugués; el autor reporta también evaluaciones en francés, pero no se declara soporte multilingüe.

## Casos de uso
- Dictado por voz en aplicaciones de escritorio: el modelo puede transcribir audio del micrófono en streaming con chunks de 160 ms, integrándose en editores de texto o herramientas de productividad que necesiten entrada por voz en portugués sin depender de la nube.
- Subtitulado en directo de reuniones y videollamadas: su naturaleza streaming y su baja latencia (~21 ms por chunk en CPU Apple M-series) permiten generar subtítulos en portugués brasileño durante la conversación.
- Transcripción de clases y conferencias: el modelo puede procesar audio largo de forma incremental y generar actas o resúmenes posteriores, con la ventaja de ejecutarse localmente y preservar la privacidad del audio.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo real para personas con discapacidad auditiva en entornos de habla portuguesa, sin requerir hardware especializado.
- Asistentes de voz offline: integración en asistentes embebidos o de escritorio que necesiten reconocimiento de comandos y frases en portugués sin conexión a internet.
- Procesamiento por lotes de archivos de audio: aunque optimizado para streaming, puede emplearse para transcribir grabaciones (por ejemplo, entrevistas o pódcasts) en pipelines de CPU, con un coste de infraestructura bajo.
- Investigación en ASR para portugués: sirve como referencia cuantizada para comparar el impacto de la compresión q8_0 frente a f16 en tareas de reconocimiento en streaming.

## Benchmarks y rendimiento
El autor publica mediciones de WER normalizado en streaming sobre clips de 5 minutos de mTEDx, comparando f16, q8_0 (este archivo) y q4_k, además del q8_0 original de NVIDIA:

| Audio | f16 | q8_0 (este archivo) | q4_k | NVIDIA q8_0 |
|---|---|---|---|---|
| pt 2EpIZVU | 11,2 % | 11,2 % | 10,9 % | 11,0 % |
| pt dfHIJD90Q5s | 6,6 % | 6,6 % | 6,7 % | 7,5 % |
| fr 0u7tTptBo9I | 16,2 % | 15,8 % | 16,1 % | 14,5 % |
| fr 16MWHwqz0mQ | 11,5 % | 11,6 % | 12,7 % | 10,4 % |

Latencia medida: aproximadamente 21 ms por chunk de 160 ms en CPU Apple M-series con la máquina cargada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware
- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo q8_0 ocupa aproximadamente 0,7 GB de memoria (tamaño del repositorio 0,8 GB).
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución en CPU y no requiere GPU.
- Cabe en cualquier GPU consumer, e incluso en sistemas sin GPU dedicada, al ser un modelo de menos de 1 GB.
- Opciones de despliegue: NeMo-Speech.cpp v0.3.0 (runtime documentado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ~21 ms por chunk de 160 ms en CPU Apple M-series (máquina cargada), lo que equivale a un factor de tiempo real holgado para streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (pt, mTEDx) | Licencia | Formato |
|---|---|---|---|---|---|
| marcosremar2/nemotron-3.5-asr-ptbr-gguf (q8_0) | 648 M | streaming por chunks | 11,2 % / 6,6 % | OpenMDW-1.1 | GGUF |
| ottema/nemotron-3.5-asr-ptbr (f16) | 648 M | streaming por chunks | 11,2 % / 6,6 % | OpenMDW-1.1 | NeMo |
| nvidia/nemotron-3.5-asr-streaming-0.6b (q8_0) | 600 M aprox. | streaming por chunks | 11,0 % / 7,5 % | no disponible en la información | no disponible |

La comparativa se limita al ecosistema Nemotron porque no se dispone de datos de otros modelos ASR en portugués en la información proporcionada.

## Limitaciones y advertencias
- El modelo está especializado en portugués de Brasil; no se garantiza un rendimiento adecuado en otras variedades del portugués ni en otros idiomas, pese a las pruebas puntuales en francés.
- Los resultados en francés muestran un WER notablemente superior al del q8_0 original de NVIDIA (15,8 % frente a 14,5 % en un clip), lo que sugiere que la conversión puede degradar ligeramente el rendimiento fuera del dominio de ajuste.
- No se documentan sesgos específicos, pero al entrenarse con CORAA, MLS y Common Voice 9 puede heredar sesgos de acento, género y registro presentes en esos corpus.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o dominios muy alejados del entrenamiento; no se han publicado métricas en condiciones adversas.
- La licencia OpenMDW-1.1 se mantiene sin cambios; es responsabilidad del usuario verificar las condiciones de uso comercial de dicha licencia, que no se detallan en la información disponible.
- El modelo está pensado para streaming con chunks de 160 ms; su uso en modo offline por lotes no está documentado por el autor.
- El repositorio tiene muy poca tracción (67 descargas, 0 likes) y fue creado en noviembre de 2026; no hay evidencia de mantenimiento continuado.

## Enlaces
- Hugging Face: https://huggingface.co/marcosremar2/nemotron-3.5-asr-ptbr-gguf
- Modelo base del ajuste: https://huggingface.co/ottema/nemotron-3.5-asr-ptbr
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Aplicación ucast.me: https://ucast.me
