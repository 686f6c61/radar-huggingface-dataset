# Hebrish/Sabich

## Resumen

Sabich es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario Hebrish en HuggingFace, consistente en un ajuste fino (fine-tune) del modelo NVIDIA `nvidia/parakeet-tdt-0.6b-v2`. El repositorio se distribuye en formato NeMo y esta orientado a transcripcion en ingles y hebreo, con enfasis declarado en code-switching ingles-hebreo, vocabulario tecnico y adaptacion a hablantes y acentos concretos (incluido el ingles irlandes). Segun los tags, el modelo parte de la arquitectura TDT (Token-and-Duration Transducer) de la familia Parakeet.

El problema que aborda es la transcripcion de habla real con mezcla de idiomas y jerga tecnica, un escenario donde los ASR genericos suelen degradarse. Para ello se ha entrenado sobre una mezcla de datasets: `Hebrish/Parakeet-V2-Blend-All` (propio del autor), `danielrosehill/Read-Aloud-Voice-Sentences` (frases leidas en voz alta, util para adaptacion de hablante) y `openslr/librispeech_asr` (ingles leido de dominio publico).

La relevancia es acotada y conviene ser honesto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta sujeto a acceso restringido (gated) y no publica resultados de benchmarks. Es, por tanto, un artefacto experimental de adaptacion de dominio, interesante como ejemplo de fine-tune de Parakeet para code-switching y como base para experimentos propios, no como modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) de la familia Parakeet, segun los tags del repositorio; detalles del encoder no disponibles |
| Parametros totales | 600 millones (derivado del identificador del modelo base `parakeet-tdt-0.6b-v2`; no verificado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio maxima no declarada) |
| Tipos de cuantizacion | no disponible (no se listan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | ingles (en) y hebreo (he); se menciona code-switching entre ambos y adaptacion a ingles irlandes |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio de 2,5 GB, libreria `nemo`; presumiblemente checkpoint `.nemo`, sin confirmar) |

Otros datos: pipeline `automatic-speech-recognition`, acceso restringido (requiere aceptar condiciones en HuggingFace), region `us`, DOI `10.57967/hf/11118`, creado el 2026-10-20.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base `nvidia/parakeet-tdt-0.6b-v2`: un transductor TDT, variante de los transducers RNN-T en la que el decodificador predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un RNN-T clasico. Los tags `nemo` y `parakeet` confirman que se distribuye y ejecuta con el toolkit NVIDIA NeMo. No se detalla en la informacion proporcionada el tipo de encoder, el numero de capas ni la estrategia de atencion.

En cuanto a datos, el autor declara entrenamiento sobre `Hebrish/Parakeet-V2-Blend-All` (mezcla propia), `danielrosehill/Read-Aloud-Voice-Sentences` (frases leidas en voz alta, tipicamente usado para adaptacion a un hablante o a un microfono) y `openslr/librispeech_asr` (ingles leido, ~960 h en su version completa, aunque no se especifica el subconjunto empleado). No se indica el numero total de horas, la composicion exacta de la mezcla, ni si se aplicaron tecnicas de aumento de datos, especaugment o entrenamiento con RLHF/DPO (no aplicable en ASR). Tampoco se documenta ningun mecanismo innovador adicional (decodificacion especulativa, atencion linear, etc.).

## Capacidades

- Transcripcion de voz a texto en ingles y en hebreo.
- Manejo de code-switching ingles-hebreo dentro de una misma locucion, segun los tags del repositorio.
- Reconocimiento de vocabulario tecnico (`tech-vocabulary`), orientado a dictado de contenido especializado.
- Adaptacion a hablante y a acento (`speaker-adaptation`), con mencion explicita al ingles irlandes.
- Orientado a dictado (`dictation`), es decir, habla leida o semileida de un solo hablante.
- Salida a nivel de token/palabra con marcas temporales: no disponible (no se documenta en la informacion proporcionada).
- Diarizacion de hablantes: no disponible.
- Tool calling, function calling, razonamiento multi-paso o modo "thinking": no aplica (es un modelo ASR, no un LLM).
- Vision o audio multimodal: no disponible.

## Casos de uso

- Dictado tecnico en ingles: transcripcion de notas de voz de desarrolladores con terminologia de programacion e infraestructura, aprovechando el enfasis declarado del modelo en vocabulario tecnico.
- Transcripcion de reuniones bilingues ingles-hebreo: el modelo esta entrenado explicitamente para code-switching, de modo que puede procesar intervenciones que alternan ambos idiomas sinsegmentacion manual previa.
- Generacion de subtitulos para contenido en hebreo: al ser un modelo NeMo, se integra en pipelines por lotes que procesan ficheros de audio y devuelven transcripciones alineadas para postprocesado.
- Adaptacion a un hablante concreto (acceso personalizado): partiendo de un fine-tune sobre frases leidas en voz alta, es una base razonable para ajustar el modelo a la voz de un unico usuario con pocas horas de audio propio.
- Normalizacion de acentos no nativos en atencion al cliente: la mencion al ingles irlandes sugiere utilidad en centros de soporte con hablantes de acento marcado, previa validacion con datos reales del dominio.
- Base de experimentacion para investigadores: sirve como punto de partida reproducible (DOI registrado) para estudiar tecnicas de adaptacion de Parakeet TDT a dominios y pares de idiomas poco cubiertos.
- Prototipado de asistentes de voz para desarrolladores: integracion en un pipeline local con NeMo para comandos de voz o captura de ideas, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER (Word Error Rate) sobre LibriSpeech, Common Voice, FLEURS ni sobre conjuntos en hebreo, ni comparaciones con el modelo base `nvidia/parakeet-tdt-0.6b-v2`. Tampoco se documentan metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de los 600 M de parametros, no verificada): en torno a 2-3 GB en fp16/bf16 incluyendo overhead del runtime, y aproximadamente 3-4 GB en fp32.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090. Cualquier GPU con 6-8 GB de VRAM es suficiente en teoria.
- GPU de datacenter (A100, H100, L40S) solo tienen sentido para procesamiento por lotes a gran escala o para reentrenamiento, no por requisito de memoria.
- Inferencia en CPU: NeMo permite ejecucion en CPU; el rendimiento seria notablemente inferior al de GPU, sin cifras disponibles.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit`) es la via documentada por la libreria del repositorio. Exportaciones a ONNX, TensorRT, Riva o sherpa-onnx no estan confirmadas en la informacion disponible y requeririan verificacion.
- Latencia y throughput estimados: no disponible.
- Nota operativa: al ser un repositorio con acceso restringido, es necesario solicitar y obtener permiso en HuggingFace antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Hebrish/Sabich | 600 M (heredado del base) | no disponible | en, he (code-switching) | cc-by-4.0 | Acceso restringido, 0 descargas |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M | no disponible en la informacion proporcionada | en | cc-by-4.0 | Modelo base publico de NVIDIA |
| openai/whisper-large-v3 | 1550 M (dato de conocimiento general) | ventana de 30 s por segmento (dato de conocimiento general) | multilingue, incluye he | MIT | Ampliamente adoptado, muy extendido |
| openai/whisper-small | 244 M (dato de conocimiento general) | ventana de 30 s por segmento | multilingue | MIT | Alternativa ligera para GPU de consumo |

No se dispone de comparaciones de WER entre Sabich y estos modelos, por lo que la tabla solo refleja tamano, cobertura idiomatica y licencia. Los datos de los modelos Whisper son de conocimiento general y no han sido verificados en la busqueda realizada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de que supere al modelo base ni a alternativas establecidas; cualquier uso en produccion exige una evaluacion propia con datos del dominio.
- Madurez nula: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-20); no hay historial de uso ni issues documentados.
- Acceso restringido (gated): requiere aceptar condiciones, lo que anade friccion a despliegues automatizados y a la reproducibilidad.
- Cobertura limitada a ingles y hebreo: no esta pensado para castellano ni para otros idiomas; usarlo fuera de ese par producira degradacion severa.
- Riesgo de sobreajuste al dominio de dictado: el entrenamiento incluye frases leidas en voz alta y vocabulario tecnico, lo que puede reducir el rendimiento en habla espontanea, ruido de fondo, multiples hablantes o audio telefónico.
- Riesgo de alucinacion en ASR: como todo modelo de secuencia, puede generar texto plausible en tramos de silencio o ruido; se recomienda deteccion de actividad vocal y umbrales de confianza.
- Sesgos no documentados: no se describe la composicion demografica de los datos de `Hebrish/Parakeet-V2-Blend-All`, por lo que se desconocen sesgos de acento, genero o edad.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y al modelo base; conviene revisar tambien las condiciones del checkpoint de NVIDIA del que deriva.
- Sin informacion sobre cuantizacion ni formatos alternativos: la integracion fuera del ecosistema NeMo puede requerir conversion manual y validacion.
- Detalles de longitud maxima de audio no disponibles: segmentar entradas largas es una precaucion razonable hasta confirmar la ventana soportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Sabich
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset del autor: https://huggingface.co/datasets/Hebrish/Parakeet-V2-Blend-All
- Dataset de frases leidas: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI del modelo: https://doi.org/10.57967/hf/11118
- Toolkit NVIDIA NeMo: https://github.com/NVIDIA/NeMo

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace.
