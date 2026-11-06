# Dan13lC/whisper-tiny_to_korean_accent_1

## Resumen

Whisper tiny_to_korean_accent_1 es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Dan13lC en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante tiny, con 37,76 millones de parametros, y se ha reentrenado sobre el dataset denominado "Korean English" para adaptar el reconocimiento a hablantes de ingles con acento coreano. La model card es escasa y generada automaticamente por el Trainer de Hugging Face, con secciones de descripcion, usos previstos y datos de entrenamiento marcadas como "More information needed".

El modelo resuelve un problema muy acotado: mejorar la transcripcion de ingles hablado con acento coreano, un escenario donde los modelos ASR genericos suelen degradarse. Su relevancia es limitada y experimental: se trata de un artefacto de entrenamiento con 30 descargas, sin likes, sin validacion externa y con una model card incompleta. No obstante, su tamano reducido (0,3 GB de repositorio) y su licencia Apache 2.0 lo hacen facil de desplegar en entornos con recursos muy limitados.

La informacion disponible no permite confirmar la composicion exacta del dataset, el numero de horas de audio ni la procedencia de las muestras. El WER declarado de 9,56 sobre el split de test del dataset "Korean English" es el unico dato de rendimiento publicado, y aparece marcado como no verificado en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar de transformers (fp16, int8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion completa, disenado para transcribir audio de hasta 30 segundos por ventana. Whisper tiny es la variante mas pequena de la familia, con 4 capas de encoder y 4 de decoder, 384 dimensiones de modelo y 6 cabezas de atencion. El ajuste fino se realizo con el Trainer de Hugging Face sobre el dataset "Korean English", con los siguientes hiperparametros: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento (aproximadamente 2,03 epochs). La semilla fue 42.

No se documenta la composicion del dataset, el numero de horas de audio, el proceso de anotacion ni si hubo aumentacion de datos o tecnicas de adaptacion especificas para acento. Tampoco se indica si se congelaron capas o si se entreno el modelo completo. Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No hay innovaciones tecnicas destacables mas alla del ajuste fino supervisado convencional.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con adaptacion declarada a acento coreano.
- Transcripcion de audio de hasta 30 segundos por ventana, con concatenacion de ventanas para audio mas largo mediante el pipeline estandar de transformers.
- Generacion de transcripciones con puntuacion y mayusculas segun el preentrenamiento de Whisper.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas: la model card solo declara ingles; no se documenta soporte de traduccion ni de otros idiomas.
- No dispone de modo thinking, vision ni audio mas alla de la entrada de voz.
- No se documentan capacidades de diarizacion de hablantes ni de marcas temporales a nivel de palabra.

## Casos de uso

- Transcripcion de reuniones con participantes coreano-parlantes que hablan en ingles: el ajuste sobre acento coreano puede reducir errores en nombres propios y terminos tecnicos pronunciados con fonetica coreana, aunque el WER de 9,56 sobre el dataset de test debe validarse en el dominio concreto.
- Subtitulado de contenido audiovisual para audiencias de Corea del Sur que consumen material en ingles: util para plataformas que necesitan transcripciones rapidas con recursos minimos, dado el tamano de 37,7 M de parametros.
- Preprocesamiento de audio en pipelines de analisis de llamadas de atencion al cliente con clientes coreanos: el modelo puede generar transcripciones base que luego se procesan con NLP, aunque requiere verificacion humana por el riesgo de alucinacion.
- Prototipado rapido de asistentes de voz en entornos edge: con 0,3 GB de repositorio y cuantizacion int8, es viable en dispositivos con poca memoria, util para demos y pruebas de concepto.
- Investigacion en adaptacion de acentos: sirve como linea base para comparar tecnicas de fine-tuning sobre acento coreano en ingles, dado que publica hiperparametros y curvas de entrenamiento.
- Generacion de datos de entrenamiento para otros modelos ASR: las transcripciones pueden usarse como pseudoetiquetas en un corpus de ingles con acento coreano, con filtrado posterior por confianza.
- Transcripcion de entrevistas o podcasts en ingles con invitados coreanos: el modelo puede procesar audio por ventanas de 30 s y concatenar resultados, adecuado para entornos sin GPU dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | Korean English | test | 9,5610 |
| Loss (validacion) | Korean English | evaluacion | 0,1874 |

Evolucion durante el entrenamiento segun la model card:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,1602 | 1,0173 | 1000 | 0,2018 | 9,6098 |
| 0,0688 | 2,0346 | 2000 | 0,1874 | 9,5610 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. No hay datos de WER sobre benchmarks estandar como LibriSpeech, Common Voice ni FLEURS.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,1 GB para los pesos (37,7 M de parametros), mas overhead de activaciones y buffers de audio; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en int8: inferior a 0,1 GB para pesos; viable en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien A100 y H100, aunque sobredimensionadas para este modelo.
- Cabe en GPU consumer y en CPU: si, sin restricciones practicas de memoria.
- Opciones de despliegue: pipeline de transformers, vLLM (soporte ASR limitado, verificar version), llama.cpp no aplica a Whisper en formato original, faster-whisper y whisper.cpp requieren conversion de pesos, TGI no soporta ASR de forma nativa. La via recomendada es transformers con `pipeline("automatic-speech-recognition")`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia muy baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER publicado |
|---|---|---|---|---|---|
| Dan13lC/whisper-tiny_to_korean_accent_1 | 37,7 M | 30 s por ventana | en | apache-2.0 | 9,56 (Korean English, no verificado) |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros modelos ajustados a acento coreano en la informacion proporcionada. El modelo base whisper-tiny es la referencia directa; el ajuste declara una mejora sobre el dataset "Korean English", pero no se publica el WER del modelo base en ese mismo dataset, por lo que no es posible cuantificar la ganancia.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento no estan rellenadas; no se puede verificar la composicion del dataset ni la calidad de las anotaciones.
- WER de 9,56 marcado como no verificado en el model-index; no hay evaluacion independiente.
- Riesgo de alucinacion: Whisper es propenso a generar texto plausible en segmentos con ruido, silencios o audio fuera de dominio; no se documenta ningun mecanismo de mitigacion.
- Sesgos desconocidos: no se documenta la distribucion de hablantes, genero, edad ni procedencia regional del dataset "Korean English".
- Limitacion de idioma: solo se declara ingles; no se garantiza buen rendimiento en coreano ni en otros idiomas.
- Limitacion de contexto: ventana de 30 s por segmento; audio mas largo requiere segmentacion y concatenacion, con riesgo de errores en los limites.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base whisper-tiny tambien es Apache 2.0; no hay restricciones adicionales documentadas.
- Caveat para produccion: con 30 descargas y sin validacion externa, no se recomienda su uso en produccion sin una evaluacion previa sobre el dominio objetivo y una revision humana de las transcripciones.
- El nombre del modelo menciona "Korean accent" pero el model-index lo etiqueta como "Whisper tiny Indian accent", lo que genera ambiguedad sobre el acento realmente adaptado.

## Enlaces

- Hugging Face: https://huggingface.co/Dan13lC/whisper-tiny_to_korean_accent_1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Ficha en free2aitools: https://free2aitools.com/model/dan13lc/whisper-tiny_to_korean_accent_1
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
