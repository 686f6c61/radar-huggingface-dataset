# adventists-ai/DuplexJev-B-MOSS-Transcribe-Falcon-H1-3B

## Resumen

DuplexJev-B-MOSS-Transcribe-Falcon-H1-3B es un conector multimodal de audio a decision (speech-to-decision) publicado por adventists-ai. No es un modelo de lenguaje completo, sino una pieza entrenable de 38,8 millones de parametros que enlaza dos modelos congelados: el codificador de audio de MOSS-Transcribe-Diarize (arquitectura Whisper, 24 capas, 307 M) y el LLM Falcon-H1-3B-Instruct. El conector transforma las representaciones del codificador en tokens de audio que el LLM interpreta para responder preguntas tipadas sobre el habla, sin generar texto libre.

La innovacion del enfoque es que cada pregunta se lee como una distribucion sobre sus opciones en un unico token, de modo que no hay pasos de decodificacion y se pueden resolver muchas preguntas por pasada hacia delante. Esto lo hace adecuado para agentes de voz full-duplex que necesitan decisiones rapidas y estructuradas (turno de palabra, intencion) en lugar de transcripciones largas. El modelo completo suma 3495 millones de parametros (codificador + LLM + conector) y trabaja con chino e ingles.

Esta variante concreta se ha entrenado solo para alineamiento de contenido (destilacion de transcripcion R1-R2), sin entrenamiento paralinguistico, por lo que las salidas de genero y emocion quedan en torno al azar. Se presenta como punto de partida para fine-tuning propio orientado a decisiones. La licencia del conector es Apache-2.0, aunque los modelos congelados conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conector DuplexJev (frame stacking + proyector SwiGLU) sobre codificador Whisper (MOSS-Transcribe-Diarize) y LLM hibrido atencion + Mamba (Falcon-H1-3B) |
| Parametros totales | 3495 M (codificador + LLM + conector); 38.807.552 parametros entrenables en el conector |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Falcon-H1-3B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (conector); Falcon-H1-3B bajo TII Falcon License 2.0; codificador Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema encadena tres componentes. Primero, el codificador de audio de MOSS-Transcribe-Diarize, repackaged como un encoder Whisper estandar de 24 capas y 307 M de parametros, que opera a 50 Hz y permanece congelado. Segundo, un conector de 38,8 M de parametros entrenables que toma la ultima capa del codificador, aplica frame stacking de 8 fotogramas y un proyector SwiGLU, produciendo 6,25 tokens de audio por segundo. Tercero, el LLM Falcon-H1-3B-Instruct, tambien congelado, que es un modelo hibrido de atencion y Mamba: sus capas recurrentes mantienen estado a lo largo de la secuencia, lo que obliga a desactivar el empaquetado de prefijos y procesar una fila por pregunta.

El entrenamiento afecta unicamente al conector. Se aplica destilacion de transcripcion en dos rondas (R1 y R2) sobre dos paquetes disjuntos de 0,5 millones de emisiones cada uno, extraidos de la mezcla Ultravox v0.6, con 32 000 pasos por ronda y un batch global de 16. No hay entrenamiento paralinguistico en esta variante. La receta es la misma que la empleada en los conectores Qwen3-32B publicados con el articulo.

El mecanismo de inferencia es la pieza clave: cada pregunta tipada con sus opciones se lee como una distribucion de un solo token sobre las alternativas, con cero pasos de decodificacion y multiples preguntas resueltas en una misma pasada hacia delante. El paquete `duplexjev` (>= 0.2.2) gestiona automaticamente el modo `batch` para Falcon-H1.

## Capacidades

- Decisiones de turno de palabra: clasificacion de si el usuario ha terminado de hablar o no (estado de turno, incluso a 4 vias en Easy-Turn).
- Clasificacion de intencion sobre habla: por ejemplo, distinguir entre climatizacion, multimedia, navegacion, telefono o charla informal.
- Respuesta a preguntas habladas (spoken QA) con opciones cerradas, leyendo la distribucion de un token.
- Procesamiento de audio en ingles y chino.
- Multiples preguntas resueltas en una sola pasada hacia delante.
- Pistas de hablante y paralinguistica: genero y emocion, aunque en esta variante sin entrenamiento especifico rinden cerca del azar.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes multi-paso ni razonamiento abierto segun la informacion disponible.
- No dispone de modo thinking ni de vision o audio generativo.

## Casos de uso

- Deteccion de fin de turno en agentes de voz full-duplex: el conector responde a la pregunta "ha terminado el usuario de hablar?" con opciones binarias, permitiendo que un asistente de voz decida cuando tomar la palabra sin esperar una transcripcion completa.
- Enrutado de intenciones en asistentes de coche o domoticos: clasificar la peticion del usuario en categorias cerradas (clima, medios, navegacion, telefono) para dirigirla al subsistema adecuado, con la ventaja de resolver varias preguntas en una sola pasada.
- Preprocesamiento de comandos de voz en dispositivos edge: al ser un conector ligero sobre un LLM de 3B, puede desplegarse en hardware modesto para tareas de decision acotadas antes de invocar modelos mayores.
- Filtrado y triaje de audio en pipelines de atencion al cliente: clasificar rapidamente la intencion de una locucion corta para enrutar la llamada al departamento correcto.
- Anotacion de corpus hablados en investigacion: usar las decisiones de turno e intencion como etiquetas automaticas sobre conjuntos de audio en ingles y chino, siempre con revision humana.
- Base para fine-tuning especifico de decisiones: al ser una variante de solo alineamiento de contenido, sirve como punto de partida para entrenar conectores propios orientados a decisiones concretas de un dominio.

## Benchmarks y rendimiento

| Evaluacion (%) | Protocolo del paper | Valores por defecto de `duplexjev` 0.2.2 |
|---|---:|---:|
| qa100 (spoken QA) | 52 | 63 |
| qa100, Falcon-H1-3B leyendo la transcripcion | 81 | – |
| ZJU-ML (spoken QA, real + TTS) | 48 | – |
| Easy-Turn (estado de turno a 4 vias, 800 clips) | 54,6 | – |
| Genero, 800 emisiones reales | 50,4 | 52,9 |
| Emocion, 4 vias, 800 emisiones | 28,4 | 28 |

Puntuaciones del leaderboard: idioma principal (media de qa100, ZJU-ML y Easy-Turn) 51,5; paralinguistica (media de genero y emocion) 39,4. El propio autor senala que el spoken QA con un LLM pequeno queda limitado por el LLM, como refleja la fila de lectura de transcripcion (81), y recomienda usar estos conectores para decisiones cortas y pistas de hablante en lugar de preguntas de conocimiento abierto.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 7 GB en bf16 para los 3495 M de parametros totales; en torno a 3,5 GB en int8 y 1,75 GB en int4 (estimaciones a partir del recuento de parametros, no confirmadas por el autor).
- GPU recomendadas: H200 (latencia medida de 185 ms por evento de decision con bf16, con la GPU compartida con un trabajo de entrenamiento). Cualquier GPU moderna con suficiente VRAM puede alojar el modelo.
- Cabe en GPU de consumo: si, en bf16 cabe holgadamente en una RTX 4090 de 24 GB; en cuantizacion int4 tambien en GPUs de 8 GB.
- Opciones de despliegue: el camino documentado es `transformers` junto con el paquete `duplexjev` (>= 0.2.2). Para velocidad en GPU se recomienda instalar los kernels de Mamba (`mamba-ssm`, `causal-conv1d`); sin ellos, `transformers` usa una ruta de referencia lenta. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: un evento de decision (10 preguntas, un clip de 4,5 s) tarda 171,3 s en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar) y unos 185 ms en una H200 (bf16). Falcon-H1 no es amigable con CPU: sin kernels Mamba de CPU, `transformers` recurre a una ruta lenta y cada pregunta necesita su propia fila.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuplexJev-B-MOSS-Transcribe-Falcon-H1-3B | 3495 M totales (38,8 M entrenables) | zh, en | Conector speech-to-decision sobre Falcon-H1-3B | Apache-2.0 (conector) | HuggingFace |
| DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B | no disponible | no disponible | Variante paralinguistica con Falcon-H1-1.5B | no disponible | HuggingFace |
| Conectores DuplexJev con Qwen3-32B | no disponible | no disponible | Misma receta sobre un LLM mayor | no disponible | Referenciados en el paper |

La informacion disponible no permite comparar con modelos externos equivalentes (por ejemplo, otros speech LLM de decision o sistemas de deteccion de turno) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero los datos de emocion proceden de corpus actuados, lo que puede introducir sesgos.
- Riesgo de alucinacion: los LLM pequenos responden mal a preguntas de conocimiento incluso leyendo la transcripcion, como indica el propio autor.
- Limitaciones de contexto o idioma: solo chino e ingles; la longitud de contexto no esta documentada y depende de Falcon-H1-3B-Instruct.
- Evaluacion limitada: probado con habla leida o actuada y conjuntos de test pequenos (100-800 elementos); no evaluado con entrada en streaming.
- Paralinguistica: esta variante no tiene entrenamiento paralinguistico, por lo que genero y emocion estan en torno al azar; no deben usarse las salidas para tomar decisiones sobre personas.
- Acoplamiento: el conector solo funciona con el codificador y el LLM listados.
- Restricciones de licencia para uso comercial: el conector es Apache-2.0, pero algunos corpus de entrenamiento (por ejemplo WenetSpeech, CoVoST 2) tienen licencia solo para uso no comercial; hay que verificarlo antes de un uso comercial. Los modelos congelados mantienen sus licencias propias: Falcon-H1-3B bajo TII Falcon License 2.0 y el codificador bajo Apache-2.0.
- Caveat de produccion: Falcon-H1 no es eficiente en CPU y requiere kernels Mamba para un rendimiento adecuado en GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-MOSS-Transcribe-Falcon-H1-3B
- Codificador Whisper empaquetado: https://huggingface.co/adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder
- LLM base: https://huggingface.co/tiiuae/Falcon-H1-3B-Instruct
- Codificador original MOSS-Transcribe-Diarize: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio de codigo y scripts: https://github.com/adventists-ai/duplexjev
- Organizacion en GitHub: https://github.com/adventists-ai
- Variante paralinguistica con Falcon-H1-1.5B: https://huggingface.co/adventists-ai/DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B
