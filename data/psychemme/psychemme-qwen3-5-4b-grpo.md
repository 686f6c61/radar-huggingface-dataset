# psychemme/PsycheMME-Qwen3.5-4B-GRPO

## Resumen

PsycheMME-Qwen3.5-4B-GRPO es un adaptador LoRA (no un modelo completo) para Qwen3.5-4B, desarrollado por el equipo PsycheMME y entrenado con GRPO para responder preguntas sobre interacción y comprensión social en vídeos. Resuelve un problema concreto: la evaluación y el ajuste de modelos multimodales en tareas de "social understanding" (lectura de señales no verbales, dinámicas interpersonales, detección de necesidad de apoyo), un área donde los benchmarks tradicionales de vídeo-VQA no miden bien. Es relevante ahora porque acompaña al benchmark PsycheMME (arXiv:2610.28625), un conjunto de 1.000 preguntas con ocho capacidades evaluadas y un protocolo de evaluación reproducible.

El adaptador se aplica sobre la base Qwen3.5-4B, un modelo multimodal de aproximadamente 4.000 millones de parámetros que procesa texto e imágenes y que, en este caso, se usa con fotogramas muestreados de vídeo más una transcripción ASR opcional. El entrenamiento es deliberadamente ligero: LoRA de rango 8, alpha 32 y solo 32 actualizaciones del optimizador, con el codificador visual y el alineador multimodal congelados.

La relevancia práctica es doble: por un lado, es un checkpoint de investigación reproducible (revisiones fijadas, configuración de evaluación publicada, semilla 42); por otro, demuestra un pipeline SFT + GRPO de bajo coste sobre un modelo de 4B, publicando tanto la puntuación de respuesta en bruto (73,19) como la verificada por razonamiento (52,62), una diferencia que refleja el coste de exigir justificación explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-4B; se carga con `Qwen3_5ForConditionalGeneration`, `AutoProcessor` y PEFT |
| Parametros totales | Modelo base de 4B (aprox.); el adaptador LoRA es una fraccion de eso (repo de 0,1 GB), rango 8 y alpha 32 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion del modelo base no esta documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar por separado el base Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El adaptador se inserta sobre el backbone de lenguaje de Qwen3.5-4B mediante LoRA (rango 8, alpha 32); el codificador visual y el alineador multimodal permanecen congelados durante todo el entrenamiento. El pipeline es en dos fases: primero SFT durante una epoca sobre 3.657 ejemplos de vídeo-QA con 32 fotogramas muestreados, transcripcion ASR e historial de interaccion cuando esta disponible; despues GRPO (optimizacion por politica con recompensas verificables) con solo 32 actualizaciones del optimizador. Los objetivos de SFT contienen la respuesta y una observacion anotada, con el resto de campos de razonamiento a nulo.

Un detalle tecnico relevante es la separacion entre formato de respuesta libre y formato estructurado de benchmark: el comando de inferencia responde preguntas abiertas, mientras que la evaluacion del paper exige respuesta mas justificacion, lo que explica la brecha entre la metrica "raw" y la "reasoning-verified". La evaluacion se realizo con muestreo de 1 fps sobre la linea temporal completa, tope de 64 fotogramas, BF16 con atencion SDPA, tamano de lote 1, decodificacion codiciosa, semilla 42 y un maximo de 768 tokens nuevos. La revision del modelo base empleada es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en formato imagen-texto-a-texto, incluyendo preguntas abiertas sobre contenido social.
- Comprension de interaccion social: lectura de senales no verbales, turnos de conversacion y contexto interpersonal, segun la formulacion del benchmark PsycheMME.
- Procesamiento de entrada multimodal compuesta por pregunta, contexto de texto, transcripcion ASR y fotogramas muestreados (hasta 64 en evaluacion, 32 en entrenamiento).
- Generacion de respuesta corta y de respuesta con justificacion estructurada (campos de razonamiento), segun el modo de evaluacion.
- Integracion con un pipeline de evaluacion (Infer -> Judge -> Score) mediante el paquete `psychemme-eval`.
- Soporte de carga directa como adaptador PEFT sobre el base original, sin fusion ni conversion de formato.
- Capacidades de tool calling, agentes, matemáticas o audio: no documentadas en la informacion disponible.

## Casos de uso

- Investigacion en psicologia y ciencias sociales: anotacion asistida de corpus de vídeo con preguntas sobre dinamica interpersonal, usando el adaptador como modelo de referencia del benchmark PsycheMME y comparando contra los checkpoints publicados.
- Analisis de entrevistas grabadas: el modelo recibe fotogramas a 1 fps mas la transcripcion ASR y responde preguntas como "que senales indican que la persona necesita apoyo", util para prefiltrar material antes de la revision humana.
- Formacion de profesionales (role-play review): revisar grabaciones de simulaciones de entrevista y generar descripciones de las senales sociales observadas, con la justificacion separada de la respuesta para facilitar la correccion por parte del formador.
- Evaluacion de sistemas de vídeo-VQA: servir como baseline ajustado de 4B contra el que medir otros modelos multimodales, con la ventaja de disponer de configuracion de evaluacion, revisiones fijadas y registros publicados.
- Moderacion y triaje de contenido en plataformas: detectar indicios de conflicto o de riesgo social en clips cortos para enrutarlos a revision humana, siempre como capa de preclasificacion y nunca como decision automatica.
- Accesibilidad y descripcion de interacciones: generar descripciones textuales de escenas sociales en vídeo para personas con discapacidad visual, apoyandose en el ASR para el canal verbal.
- Docencia e investigacion sobre RL: usar el adaptador como ejemplo reproducible de SFT + GRPO con LoRA sobre un modelo de 4B de codigo abierto, con detalles de hiperparametros y evaluacion publicados.

## Benchmarks y rendimiento

| Evaluacion del paper | Raw | Reasoning-Verified |
|---|---:|---:|
| Qwen3.5-4B + GRPO (este adaptador) | 73,1879 | 52,6159 |

La metrica es la media macro sobre las ocho capacidades del benchmark PsycheMME, calculada sobre una poblacion de 1.000 preguntas. Segun la pagina del proyecto, la Tabla 2 del paper incluye resultados de ocho modelos propietarios y nueve modelos abiertos congelados, ademas de las variantes Qwen3.5-4B Base, SFT y SFT+GRPO; los valores individuales de esas filas no estan incluidos en la informacion disponible, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada: el base es de 4B; en BF16 los pesos ocupan del orden de 8 GB, a lo que se suman el codificador visual y las activaciones derivadas de procesar hasta 64 fotogramas. Presupuesto realista de 16-24 GB de VRAM en BF16; no hay mediciones oficiales de consumo publicadas.
- GPU recomendadas: A100 40 GB o L40S para evaluacion por lotes y reproducibilidad; RTX 4090 (24 GB) como opcion de sobremesa holgada.
- Cabe en GPU de consumo: si, en RTX 4090/4080 (16-24 GB) en BF16; en tarjetas de 12-16 GB requeriria cuantizacion del base y reducir el numero de fotogramas, una combinacion no documentada por el autor.
- Despliegue: carga nativa con `transformers` + PEFT (`load_adapter.py`), comando `psychemme video` del paquete `psychemme-eval`, y opciones genericas de serving con soporte de adaptadores LoRA (por ejemplo vLLM con adaptadores), siempre que la implementacion multimodal acepte la arquitectura del base. No se proporcionan pesos GGUF, por lo que llama.cpp/Ollama requeriria fusion del adaptador y conversion, con el riesgo de perder paridad con la evaluacion.
- Latencia y throughput: la configuracion de referencia es lote 1, decodificacion codiciosa, BF16 y hasta 768 tokens nuevos, con el coste dominado por el numero de fotogramas (1 fps hasta 64). No se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PsycheMME (raw / reasoning-verified) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PsycheMME-Qwen3.5-4B-GRPO | 4B + LoRA r8 | no disponible | 73,19 / 52,62 | apache-2.0 | HuggingFace (adaptador, revision v1.0.2) |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible en la informacion | no disponible en la informacion | HuggingFace (Qwen/Qwen3.5-4B) |
| PsycheMME-Qwen3.5-4B SFT | 4B + LoRA | no disponible | no disponible en la informacion | apache-2.0 (segun el proyecto) | mencionado en la pagina del proyecto; no se detalla el repositorio |
| Modelos abiertos congelados del paper (9) | varios | no disponible | no disponible (Tabla 2 del paper) | varios | paper arXiv:2610.28625 |

La comparacion cuantitativa con alternativas de la misma categoria no puede completarse con los datos disponibles: la informacion proporcionada solo incluye el resultado del checkpoint GRPO y remite a la Tabla 2 del paper para el resto.

## Limitaciones y advertencias

- Idioma: el adaptador declara unicamente ingles; el rendimiento en castellano u otras lenguas no esta evaluado.
- Naturaleza del artefacto: es un adaptador LoRA de rango 8 con 32 actualizaciones del optimizador; su capacidad de modificar el comportamiento del base es acotada y no debe interpretarse como un modelo nuevo.
- Riesgo de sobreinterpretacion: la tarea consiste en inferir estados sociales o emocionales, terreno propenso a atribuciones erroneas y a alucinaciones plausibles; no es una herramienta clinica ni diagnostica y no deberia usarse para decisiones sobre personas sin supervision experta.
- Difuminado de la metrica: la caida de 73,19 (raw) a 52,62 (reasoning-verified) indica que exigir justificacion degrada notablemente el resultado; conviene elegir el modo segun el caso de uso.
- Cobertura temporal limitada: el muestreo a 1 fps con tope de 64 fotogramas descarta informacion fina (microexpresiones, solapamientos de habla) y penaliza clips largos.
- Audio: el modelo no procesa audio directamente; depende de una transcripcion ASR externa en UTF-8, cuya calidad condiciona el resultado.
- Datos y privacidad: el caso de uso implica vídeo de personas; hay que aplicar base juridica, minimizacion y consentimiento antes de procesar material real.
- Licencia: el adaptador es apache-2.0, pero el uso comercial depende tambien de los terminos del modelo base Qwen3.5-4B y de las condiciones del dataset del benchmark, que se distribuyen por separado.
- Reproducibilidad: los resultados citados corresponden a una revision concreta del base y a un paquete de evaluacion versionado; cambios de version pueden alterar las cifras.
- Volumen de adopcion bajo (22 descargas, 0 likes en el momento de la consulta): no hay validacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psychemme/PsycheMME-Qwen3.5-4B-GRPO
- Pagina del proyecto: https://psychemme.github.io/
- Repositorio GitHub: https://github.com/psychemme/PsycheMME
- Guia de inicio rapido de evaluacion: https://github.com/psychemme/PsycheMME/blob/main/docs/QUICKSTART.md
- Guia de reproducibilidad: https://github.com/psychemme/PsycheMME/blob/main/docs/REPRODUCIBILITY.md
- Dataset del benchmark: https://huggingface.co/datasets/psychemme/PsycheMME
- Registros de evaluacion: https://huggingface.co/datasets/psychemme/PsycheMME-logs
- Paper (arXiv): https://arxiv.org/abs/2610.28625
- Paper (PDF): https://arxiv.org/pdf/2610.28625
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/psychemme
- Endpoint de terceros (FriendliAI): https://friendli.ai/models/psychemme/PsycheMME-Qwen3.5-4B-GRPO
- FFmpeg (dependencia): https://ffmpeg.org/download.html
