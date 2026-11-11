# baniguru/bani_guru_fast_conformer_212m_v1

## Resumen

BaniGuru Fast Conformer 212M v1 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario baniguru y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo de 212 millones de parametros construido sobre la arquitectura Fast Conformer de NVIDIA NeMo, orientado especificamente al punyabi (codigo de idioma `pa`). Su proposito es transcribir audio en punyabi, con un enfoque particular en dominios religiosos sij, como la recitacion de kirtan y la lectura continua del Guru Granth Sahib (Sehaj Paath).

El modelo es relevante porque los sistemas ASR multilingues genericos suelen tener un rendimiento deficiente en punyabi, especialmente en vocabulario religioso y en la prosodia del canto devocional. BaniGuru aborda ese nicho con un modelo compacto (212M parametros, repositorio de 0,9 GB) que puede desplegarse en infraestructura modesta. La model card reporta tasas de error muy distintas segun el dominio: WER de 26,9 y CER de 14,05 en kirtan, frente a WER de 7,05 y CER de 2,06 en Sehaj Paath.

La informacion publica disponible es limitada: no se detallan los datos de entrenamiento, el procedimiento de ajuste ni resultados comparativos con otros sistemas. La ficha refleja unicamente lo que el autor declara en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast Conformer (NVIDIA NeMo) |
| Parametros totales | 212 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | punyabi (`pa`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio NeMo, 0,9 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Fast Conformer, una variante del Conformer con atencion por bloques (subsampling y atencion local/global) disenada para reducir el coste computacional del codificador en tareas de speech. Se distribuye como checkpoint de NVIDIA NeMo, lo que implica que su uso previsto es mediante la libreria `nemo_toolkit` y sus scripts de inferencia ASR.

No se dispone de informacion publica sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset, el esquema de tokenizacion ni si se aplicaron tecnicas de aumento de datos o ajuste fino supervisado. La model card unicamente aporta ejemplos de referencia y prediccion y metricas de error por dominio (kirtan y Sehaj Paath). No se documentan innovaciones tecnicas adicionales mas alla de las propias de Fast Conformer.

## Capacidades

- Transcripcion de voz a texto en punyabi (`pa`).
- Reconocimiento de recitacion religiosa sij (kirtan) y de lectura continua del Guru Granth Sahib (Sehaj Paath).
- Salida de texto en escritura gurmuji, segun los ejemplos de la model card.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento, vision, audio de entrada mas alla del propio ASR ni capacidades multimodales adicionales.
- No se documenta traduccion, diarizacion ni puntuacion automatica.

## Casos de uso

- Transcripcion de kirtan: el modelo puede convertir grabaciones de canto devocional en texto gurmuji; es adecuado para este escenario porque el autor reporta metricas especificas de ese dominio (WER 26,9, CER 14,05), aunque con un error considerable que exige revision humana.
- Digitalizacion de Sehaj Paath: permite generar transcripciones alineadas de lecturas continuas del Guru Granth Sahib, donde el modelo muestra su mejor rendimiento (WER 7,05, CER 2,06), lo que lo hace util para archivos y busqueda textual.
- Subtitulado de grabaciones de gurdwara: integrable en pipelines que procesen audio de sermons y recitaciones para producir subtitulos en punyabi, con post-edicion dada la variabilidad del dominio.
- Archivado y busqueda de material audiovisual religioso: la transcripcion permite indexar grabaciones y habilitar busqueda por texto sobre la recitacion.
- Herramientas de aprendizaje de gurmuji: transcripcion de audio de practica para comparar con el texto de referencia, aprovechando el bajo CER en pasajes de lectura.
- Investigacion en ASR de bajos recursos: modelo de referencia para experimentos con punyabi y dominios especializados, dado su tamano compacto y licencia permisiva.
- Despliegue en entornos con recursos limitados: sus 212M parametros y un repositorio de 0,9 GB permiten ejecucion en hardware modesto, lo que facilita prototipos y pruebas locales.

## Benchmarks y rendimiento

| Dominio | WER | CER |
|---|---|---|
| Kirtan | 26,9 | 14,05 |
| Sehaj Paath | 7,05 | 2,06 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo ASR y la model card solo aporta WER y CER por dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 212M parametros, la inferencia en precision FP32 requiere del orden de 1 GB de pesos, y en FP16 alrededor de 0,5 GB, a lo que se suma el coste del decodificador y del frontend de audio.
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPU consumer como RTX 3060, RTX 4060 o superiores, asi como en A100/H100 para lotes grandes.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM libre, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit`) es la via documentada por la libreria del repositorio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a ASR NeMo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento ASR punyabi |
|---|---|---|---|---|---|
| BaniGuru Fast Conformer 212M v1 | 212M | no disponible | pa | MIT | WER 7,05 (Sehaj Paath) / 26,9 (kirtan) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables de ASR especificos para punyabi con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El rendimiento es muy dependiente del dominio: el WER de 26,9 en kirtan indica un error elevado que hace necesaria la revision humana en ese caso de uso.
- No hay informacion publica sobre los datos de entrenamiento, por lo que no puede evaluarse el sesgo ni la cobertura dialectal del punyabi.
- Riesgo de alucinacion y de sustituciones en pasajes con ruido, musica o prosodia cantada; los ejemplos de la model card muestran aciertos en pasajes concretos, no un comportamiento general.
- Solo soporta punyabi; no se documenta multilingue.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni documenta condiciones adicionales de atribucion.
- No se documentan limitaciones de longitud de audio ni de contexto; conviene validar el comportamiento con audios largos antes de usarlo en produccion.
- El modelo tiene pocas descargas (10) y ningun like en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/baniguru/bani_guru_fast_conformer_212m_v1
- NVIDIA NeMo (libreria del modelo): https://github.com/NVIDIA/NeMo
- Documentacion de Fast Conformer en NeMo: no disponible en la informacion proporcionada
- Paper de Fast Conformer: no disponible en la informacion proporcionada
