# dongminkim17/smarthome-omni-mintrec2

## Resumen

`dongminkim17/smarthome-omni-mintrec2` es un modelo multimodal especializado en reconocimiento de intencion de dos clases sobre el conjunto de datos MIntRec. Lo desarrolla Dong Min Kim y colaboradores (Sung-Ju Lee, Ryuhaerang Choi, Hyungjun Yoon y Seohyeon Yoo) y se construye a partir de Qwen2.5-Omni-3B mediante poda de canales FFN basada en activaciones y dos etapas de recuperacion por destilacion de conocimiento. El resultado es un modelo de comprension de 3.231.263.744 parametros en BF16 que procesa audio, video y la transcripcion del enunciado para clasificar la intencion en una de dos etiquetas cerradas: `emotions_attitudes` (A) y `goals` (B).

El interes tecnico del modelo no reside en su capacidad generativa general, sino en el proceso de compresion: se reduce el ancho de las capas FFN de 11.008 a 4.352 canales manteniendo las 36 capas del decodificador, y se recupera calidad con LoRA de decodificador y encoder fusionados en los pesos finales. El modelo reporta una precision del 92,13 % en el test oficial de MIntRec, con un tamano de repo de 6,5 GB y licencia Qwen Research (no comercial).

Se trata de un artefacto de investigacion acotado: no es un asistente de hogar inteligente de proposito general, sino un clasificador cerrado de intenciones entrenado y evaluado para esa tarea concreta. Cualquier otro uso, otro conjunto de etiquetas o entradas con modalidades incompletas requiere evaluacion propia segun el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen2.5-Omni (Thinker): decodificador de 36 capas con FFN podada a 4.352 canales, torre de audio y encoder de vision |
| Parametros totales | 3.231.263.744 (1.924.902.912 LM + 637.676.544 audio + 668.684.288 vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | qwen-research (Qwen Research License, uso no comercial) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen2.5-Omni-3B` (revision `f75b40e3da2003cdd6e1829b1f420ca70797c34e`) y conserva la arquitectura Thinker de Qwen2.5-Omni: un decodificador transformer de 36 capas, una torre de audio y un encoder de vision que procesan conjuntamente audio, video y texto. Sobre esta base se aplica una calibracion de activaciones solo en entrenamiento con 128 clips y semilla 42, seguida de poda de canales FFN hasta un ancho de 4.352 (frente a los 11.008 originales). Las 36 capas del decodificador se mantienen intactas.

El entrenamiento se organiza en tres fases: un SFT profesor por tarea de cinco epocas con LoRA de rango 16 y alpha 32 en query/value; una primera recuperacion de cinco epocas con LoRA de decodificador (rango 16, alpha 32) combinando SFT y destilacion de clase; y una recuperacion conjunta final de cinco epocas con LoRA de decodificador y encoder de rango 64 y alpha 128, learning rate 1e-4 para el LM y 1e-5 para el encoder. La perdida combina SFT y destilacion de clase con pesos 0,25/0,75 y temperatura 2, mas destilacion de caracteristicas de audio y vision con pesos 0,1/0,1. Se usa AdamW, scheduler coseno, 3 % de warmup, batch efectivo de 4 y semilla 42. El muestreo de video es a 2 FPS, hasta 8 fotogramas y 50.176 pixeles por fotograma. Los adaptadores LoRA finales se fusionan en los pesos publicados.

## Capacidades

- Clasificacion de intencion en conjunto cerrado sobre MIntRec con dos etiquetas: `A` = emotions_attitudes y `B` = goals.
- Comprension multimodal conjunta de audio, video y transcripcion del enunciado.
- Puntuacion por logits de letra de respuesta y generacion greedy, ambas validadas en la evaluacion del test oficial.
- Procesamiento de video muestreado a 2 FPS con hasta 8 fotogramas por clip.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo agente ni razonamiento multi-paso documentado.
- Capacidad multilingue limitada al ingles (`en`).
- No se documentan capacidades de thinking mode, audio generativo ni vision generativa mas alla del encoder de comprension.

## Casos de uso

- Clasificacion de intenciones en entornos domesticos monitorizados: el modelo recibe audio, video y transcripcion de un clip y devuelve una de las dos etiquetas de MIntRec, util para anotar corpus de interaccion persona-hogar.
- Investigacion en eficiencia de modelos multimodales: sirve como referencia reproducible de poda FFN y destilacion sobre Qwen2.5-Omni-3B, con el codigo de evaluacion disponible en el repositorio del autor.
- Benchmarking de clasificadores de intencion: con 92,13 % de precision en el test oficial y puesto 1 de 15 en la cohorte de comparacion seleccionada, es un punto de comparacion para nuevos metodos sobre MIntRec.
- Analisis de emociones y actitudes en clips de video: la etiqueta `emotions_attitudes` permite etiquetar segmentos con carga emocional para estudios de comportamiento en el hogar.
- Deteccion de objetivos declarados por el usuario: la etiqueta `goals` permite extraer la intencion declarada en utterances transcritas y clips asociados.
- Pipeline de anotacion semiautomatica: integrado via `transformers` con `Qwen2_5OmniThinkerForConditionalGeneration`, puede ejecutarse en un solo dispositivo (`device_map={"": 0}`) para preetiquetar datos antes de revision humana.
- Validacion de sistemas de asistencia domestica: como clasificador cerrado de referencia para medir si un sistema de hogar inteligente de proposito general acierta en las mismas dos clases.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tarea | MIntRec 2-class intent recognition |
| Precision en test oficial | 92,13 % |
| Posicion en cohorte de comparacion publicada | 1 / 15 |
| Train / validation / test | 1.334 / 445 / 445 |
| Evaluacion | Test oficial completo sobre la release recargada, con scoring por logits de letra y generacion greedy |

No se han publicado en la informacion disponible resultados desglosados por clase, matrices de confusion ni comparaciones numericas individuales frente a los otros 14 modelos de la cohorte; el autor remite a `evaluation.json` y a la documentacion del metodo para los agregados y la comparacion con el checkpoint sin fusionar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,5 GB solo para pesos, mas activaciones y cache; en la practica se recomienda una GPU con al menos 12-16 GB para clips de video con 8 fotogramas.
- El autor ejecuta la evaluacion con `device_map={"": 0}` y `attn_implementation="sdpa"`, lo que sugiere que cabe en una unica GPU de gama alta consumer o profesional.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100; una RTX 3090 (24 GB) o RTX 4080 (16 GB) deberia ser suficiente en BF16 para el caso de uso documentado.
- Despliegue mediante `transformers` con `Qwen2_5OmniProcessor` y `Qwen2_5OmniThinkerForConditionalGeneration`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo multimodal con torres de audio y vision no es trivial convertirlo a GGUF.
- No se publican datos de latencia ni throughput. El muestreo fijo de 2 FPS con maximo 8 fotogramas acota el coste por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Precision test | Licencia |
|---|---|---|---|---|---|
| smarthome-omni-mintrec2 | 3.231.263.744 | no disponible | MIntRec 2 clases | 92,13 % | qwen-research (no comercial) |
| Qwen/Qwen2.5-Omni-3B (base) | ~3B (sin podar) | no disponible | Multimodal general | no disponible en esta ficha | qwen-research |
| Modelos de la cohorte MIntRec / ARL / Emotion-LLaMA | no disponible | no disponible | Clasificacion de intencion | no disponible individualmente | no disponible |

El autor situa al modelo en el puesto 1 de 15 dentro de la cohorte de comparacion seleccionada, pero no se detallan en la informacion disponible los nombres, tamanos ni resultados individuales de los otros 14 modelos. La comparacion directa con el checkpoint base sin podar se encuentra en `evaluation.json` del repositorio, no en la model card.

## Limitaciones y advertencias

- Modelo de conjunto cerrado: solo predice dos etiquetas (`emotions_attitudes` y `goals`); cualquier otro esquema de etiquetas requiere reentrenamiento y evaluacion propios.
- Uso previsto acotado a la tarea MIntRec; el autor advierte explicitamente de que el despliegue general en hogar inteligente y las entradas con modalidades incompletas necesitan su propia evaluacion.
- Idioma limitado al ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Qwen Research: uso no comercial y condiciones de redistribucion restringidas; el codigo del repositorio asociado es MIT, pero los pesos no.
- Riesgo de alucinacion y de calibracion en la generacion greedy no cuantificado en la informacion disponible.
- La poda FFN de 11.008 a 4.352 canales puede degradar el rendimiento fuera de la distribucion de MIntRec; no se publican evaluaciones de robustez ante ruido, dominio distinto o clips mas largos.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No se documentan sesgos demograficos, acusticos ni de otro tipo; la evaluacion se limita a la precision agregada en el test oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongminkim17/smarthome-omni-mintrec2
- Repositorio de codigo y metodo: https://github.com/dongminkim17/smarthome-model-efficiency
- Documentacion del metodo: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/docs/METHOD.md
- Entorno de ejecucion: https://github.com/dongminkim17/smarthome-model-efficiency/blob/main/environment.yml
- Instrucciones de preparacion de datos: https://github.com/dongminkim17/smarthome-model-efficiency#setup
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Perfil del autor en GitHub: https://github.com/dongminkim17
- Pagina personal del autor: https://github.com/dongminkim17/dongminkim17.github.io
