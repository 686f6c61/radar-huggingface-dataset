# ozgurguler/ahenk-tts-tr

## Resumen

Ahenk es un adaptador LoRA para síntesis de voz (TTS) en turco construido sobre el modelo base VoxCPM2 de OpenBMB, de 2.000 millones de parámetros. Lo desarrolla el usuario ozgurguler y añade un adaptador de 36,2 millones de parámetros entrenado para generar una única voz femenina diseñada, identificada como f022, que no corresponde a ninguna persona real. El modelo sintetiza audio a 48 kHz y permite controlar seis emociones (alegre, tranquilo, enfadado, triste, empático y sorprendido) además de la risa, mediante instrucciones en lenguaje natural.

El problema que resuelve es la falta de opciones TTS emocionales y de alta calidad específicas para turco dentro del ecosistema open source. Al ser un adaptador LoRA sobre VoxCPM2, reutiliza la arquitectura del modelo base y solo distribuye los pesos del adaptador (repositorio de 0,1 GB), lo que reduce el coste de almacenamiento y de replicación. Incluye un frontend de normalización de texto (trnorm) capaz de convertir cifras y precios a palabras, y un postprocesado de pausas (pause_clean).

Es relevante ahora porque la voz es completamente sintética y el autor exige etiquetar el audio generado como IA conforme al artículo 50 de la Ley de IA de la UE, un requisito creciente para despliegues en producción. La licencia CC-BY-4.0 permite uso comercial con atribución, aunque el modelo requiere GPU y solo soporta turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre VoxCPM2 (modelo TTS); arquitectura interna del base no disponible |
| Parámetros totales | 2.000 millones (base VoxCPM2) + 36,2 millones (LoRA) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Adaptador LoRA; formato de fichero no especificado (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

Ahenk se distribuye como adaptador LoRA de 36,2 millones de parámetros sobre el modelo base VoxCPM2 de OpenBMB, que aporta 2.000 millones de parámetros. El adaptador se entrenó para fijar una única voz femenina diseñada (f022), creada a partir de una descripción textual en inglés con el propio VoxCPM2. El checkpoint publicado es `voxcpm2-f022-s3tr/step_0000500` y el pipeline de inferencia de referencia usa 16 pasos, cfg 2.0, semilla 0 o 1, el frontend `trnorm` y el postprocesado `pause_clean`.

Los datos de entrenamiento proceden de los conjuntos `cloud0day3/alania-synthetic-speech-tr` y `cloud0day3/alania-domain-text-tr`. Según el autor, todo el audio de entrenamiento fue generado por IA, no hay grabaciones de personas reales. No se detallan el número total de tokens de audio, la composición exacta del corpus, ni si hubo etapas de RLHF o DPO. La model card menciona una evaluación con 20 frases reservadas (held-out) en las que el modelo resultó word-perfect y obtuvo el UTMOS más alto del conjunto. También se realizó una prueba de escucha ciega con un oyente nativo sobre cuatro sistemas.

## Capacidades

- Síntesis de voz en turco a 48 kHz con una voz femenina diseñada (f022).
- Control de seis emociones mediante instrucciones entre paréntesis: alegre, tranquilo, enfadado, triste, empático y sorprendido.
- Generación de risa integrada en el habla ("Laughing heartily while speaking").
- Normalización de texto vía `trnorm`: convierte cifras y moneda a palabras (por ejemplo, "99,99 TL" → "doksan dokuz lira doksan dokuz kuruşa").
- Entonación diferenciada para enunciados y preguntas con partícula "mı".
- Manejo de frases largas reservadas (held-out) con resultado word-perfect en las pruebas del autor.
- Acepta instrucciones de estilo tanto en inglés como en turco en los ejemplos publicados.
- Postprocesado de pausas (`pause_clean`) para limpiar la salida.

## Casos de uso

- Audiolibros y narración en turco: el modelo permite alternar tono tranquilo, alegre o triste por pasaje mediante instrucciones, lo que encaja en la narración de ficción con cambios emocionales.
- Atención al cliente automatizada: la emoción "empático" y la voz calmada permiten generar respuestas de IVR o asistentes telefónicos con un tono adecuado para reclamaciones, a 48 kHz.
- Lectura de precios y datos en comercio electrónico: el frontend `trnorm` convierte importes y cifras a palabras, útil para fichas de producto y avisos de oferta.
- Accesibilidad y lectores de pantalla: la voz sintética en turco puede narrar contenido web o documentos con entonación de pregunta y enunciado correctamente diferenciada.
- Contenido formativo y e-learning: las emociones "calm" y "cheerful" permiten generar locuciones para cursos, tutoriales y pódcasts educativos.
- Doblaje y videojuegos: la combinación de emociones y risa permite crear líneas de personaje sin depender de actores de voz, etiquetando el audio como generado por IA.
- Prototipado de aplicaciones de voz en turco: al ser un LoRA de 0,1 GB sobre VoxCPM2, se puede integrar en pipelines de desarrollo con la librería `voxcpm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque se trata de un modelo TTS. Los datos disponibles en la model card son los siguientes:

| Prueba | Resultado |
|---|---|
| Frases reservadas (held-out) | 20 frases con resultado word-perfect |
| UTMOS en frases reservadas | El más alto de las 20 frases evaluadas (valor numérico no publicado) |
| Comprobación de entonación (enunciado vs. pregunta con "mı") | Superada en el par de ejemplo publicado |
| Escucha ciega | Un oyente nativo seleccionó clips entre 4 sistemas (resultados cualitativos) |

No se proporcionan cifras comparativas de WER, MOS numérico ni latencia en la información disponible.

## Requisitos de hardware

- El autor indica explícitamente que el modelo requiere GPU ("GPU gerektirir").
- VRAM estimada: no publicada por el autor. Para un modelo base de 2.000 millones de parámetros en fp16, una estimación orientativa sería del orden de 5-8 GB, pero no es un dato confirmado.
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs con suficiente VRAM, pero sin datos oficiales.
- Despliegue: la librería indicada es `voxcpm`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ahenk (este) | 2.000 M base + 36,2 M LoRA | No disponible | Turco | CC-BY-4.0 | Voz f022, 6 emociones + risa, 48 kHz, requiere GPU |
| Ahenk Cep | No disponible (modelo "pequeño" del mismo autor) | No disponible | Turco (presumible) | No disponible | Variante reducida con demo en navegador |
| VoxCPM2 (base) | 2.000 M | No disponible | No disponible | No disponible en la información | Modelo base sobre el que se aplica el LoRA |

No se dispone de datos de otros sistemas TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco; no se documentan otros idiomas.
- Una única voz (f022); no se menciona clonación de voz ni selección entre múltiples hablantes.
- El audio de entrenamiento es 100 % sintético, lo que puede introducir artefactos o sesgos propios del generador.
- La voz es sintética y diseñada, no corresponde a ninguna persona real; el autor exige etiquetar el audio generado como IA conforme al artículo 50 de la Ley de IA de la UE.
- Requiere GPU; el despliegue en CPU no está documentado.
- No se especifican tipos de cuantización ni formatos de pesos alternativos.
- Repositorio muy reciente (creado en octubre de 2026) y con 0 descargas en el momento de la consulta; validación comunitaria limitada.
- El control emocional depende de instrucciones en inglés o turco; la robustez ante instrucciones nuevas no está cuantificada.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las obligaciones de atribución y de etiquetado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozgurguler/ahenk-tts-tr
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Modelo pequeño Ahenk Cep: https://huggingface.co/ozgurguler/ahenk-cep-tr
- Código y utilidades de medida: https://github.com/ozguradmin/ahenk-turkish-tts
- Demo en navegador: https://ozguradmin.github.io/ahenk-turkish-tts/
- Dataset de voz: https://huggingface.co/datasets/cloud0day3/alania-synthetic-speech-tr
- Dataset de texto: https://huggingface.co/datasets/cloud0day3/alania-domain-text-tr
