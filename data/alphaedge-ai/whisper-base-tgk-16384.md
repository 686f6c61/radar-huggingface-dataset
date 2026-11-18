# alphaedge-ai/whisper-base-tgk-16384

## Resumen

whisper-base-tgk-16384 es una variante podada de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla alphaedge-ai aplicando la tecnica de *trimming* de vocabulario descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face. El objetivo es reducir el tamano del modelo eliminando los tokens del vocabulario que no se usan en tayiko (codigo ISO `tg`), manteniendo la arquitectura y los pesos del modelo original.

El resultado es un checkpoint de 54.427.648 parametros frente a los 72.593.920 del original (un 25,02 % menos), con un vocabulario reducido de 51.865 a 16.384 tokens (un 68,41 % menos). El repositorio ocupa 0,1 GB y los pesos se distribuyen en safetensors. Es relevante para despliegues de ASR en tayiko con restricciones de memoria, ya que reduce el footprint sin reentrenar el modelo base.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay informacion publicada sobre evaluaciones del modelo podado, por lo que los datos de rendimiento se limitan a las estadisticas estructurales declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), podado por trimming de vocabulario |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se listan variantes GGUF ni cuantizadas) |
| Idiomas soportados | tayiko (tg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper base: un transformer encoder-decoder con 6 capas en cada bloque, atencion multi-cabeza y un frontend convolucional que convierte el audio a espectrogramas Mel de 80 canales. El modelo original fue entrenado por OpenAI con supervision debil a gran escala sobre 680.000 horas de audio multilingue, segun el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (arXiv:2212.04356).

Esta variante no reentrena el modelo: aplica trimming sobre el vocabulario. El autor mino 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens efectivamente usados en tayiko y elimino el resto, reduciendo el embedding de tokens y la capa de proyeccion de salida. Los pesos restantes se conservan del checkpoint openai/whisper-base. No se documentan pasos de RLHF, DPO ni fine-tuning adicional sobre audio tayiko.

## Capacidades

- Transcripcion de voz a texto en tayiko (`task: transcribe`) y traduccion de voz al ingles (`task: translate`), heredadas de Whisper.
- Procesamiento de audio a 16 kHz con ventanas de 30 segundos, con deteccion de actividad de voz y marcas de tiempo a nivel de segmento.
- Reconocimiento robusto a ruido y acentos moderados, segun las caracteristicas del modelo base.
- Integracion con el pipeline `automatic-speech-recognition` de transformers, incluyendo `generate_kwargs` para fijar idioma y tarea.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; Whisper no las soporta.
- Capacidad multilingue limitada al tayiko: los tokens de otros idiomas fueron eliminados del vocabulario.

## Casos de uso

- Transcripcion de reuniones y entrevistas en tayiko: el modelo procesa audio de 16 kHz y devuelve texto con marcas de tiempo por segmento, adecuado para actas y subtitulado basico.
- Generacion de subtitulos para contenido audiovisual tayiko: la salida con timestamps permite alinear subtitulos en herramientas de postproduccion, con un coste de memoria menor que el modelo original.
- Asistentes de voz para atencion al cliente en tayiko: al ser un modelo pequeno (54 M de parametros), puede servirse en CPU o GPU de gama baja con latencia aceptable para turnos cortos.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones para construir indices de texto consultables, aprovechando el reducido footprint del checkpoint.
- Traduccion de audio tayiko a ingles: usando `task: translate`, sirve para previsualizar contenido en ingles antes de una traduccion humana.
- Despliegue en dispositivos con memoria limitada: el recorte del 25 % en parametros y del 68 % en vocabulario facilita ejecutar el modelo en entornos embebidos o contenedores con poca RAM.
- Prototipado rapido de pipelines ASR en tayiko: la integracion nativa con transformers y el pipeline de Hugging Face permite montar una demo en pocas lineas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara estadisticas estructurales (tamano de vocabulario y numero de parametros) y afirma que el modelo podado "deberia comportarse de forma similar al original", sin aportar metricas de WER ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 54 M de parametros en fp32, ocupa aproximadamente 218 MB de pesos; en fp16, unos 109 MB. La memoria adicional para activaciones y buffers de audio es reducida.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU. En CPU, la inferencia de audio de 30 s suele completarse en segundos, aunque no se dispone de cifras oficiales de latencia.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y en principio vLLM no aplica (no es un modelo de lenguaje); llama.cpp y Ollama no soportan Whisper de forma nativa en este formato. Se puede servir con FastAPI o TGI si se adapta el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-tgk-16384 | 54,4 M | ventanas de 30 s | tayiko | Apache 2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingue | Apache 2.0 | Hugging Face |

Frente a whisper-base, esta variante sacrifica cobertura multilingue a cambio de un 25 % menos de parametros. Frente a whisper-tiny, ofrece mas capacidad (54 M frente a 39 M) pero solo para tayiko. No se dispone de datos de WER para comparar el rendimiento real entre ellos.

## Limitaciones y advertencias

- El vocabulario eliminado hace que el modelo no funcione correctamente en idiomas distintos del tayiko; no debe usarse como ASR multilingue.
- No hay evaluacion publicada del WER en tayiko para este checkpoint; la afirmacion de rendimiento similar al original es una expectativa del autor, no un resultado medido.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no tayika, comportamiento heredado de Whisper.
- Sesgos del modelo base: Whisper puede reproducir estereotipos o generar texto plausible en segmentos ininteligibles.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base de OpenAI tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene revisar los terminos del dataset de minado (lbourdois/fineweb-2-trimming).
- El pipeline de ejemplo requiere audio a 16 kHz; no remuestrear introduce errores de transcripcion.
- El modelo no incluye deteccion de hablantes, diarizacion ni puntuacion avanzada mas alla de lo que produce Whisper base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-tgk-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
