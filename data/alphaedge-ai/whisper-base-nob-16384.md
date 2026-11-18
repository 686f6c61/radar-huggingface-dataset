# alphaedge-ai/whisper-base-nob-16384

## Resumen

`alphaedge-ai/whisper-base-nob-16384` es una variante podada (*trimmed*) de `openai/whisper-base` especializada en noruego bokmål (código `nb`). El autor, alphaedge-ai, ha aplicado la técnica de reducción de vocabulario descrita en el blog de Hugging Face "Introduction to Trimming" para recortar el vocabulario del tokenizador original de 51.865 a 16.384 tokens, eliminando los tokens poco frecuentes en el idioma objetivo. El resultado es un modelo un 25,02 % más pequeño en parámetros (54.427.648 frente a 72.593.920) y con una huella de memoria notablemente inferior, manteniendo la arquitectura encoder-decoder transformer original de Whisper.

El modelo resuelve el problema del sobredimensionamiento de los checkpoints de Whisper cuando se despliegan en un único idioma: el vocabulario multilingüe original ocupa una fracción importante de los parámetros de las capas de embedding y de la proyección de salida, y ese coste es innecesario si solo se transcribe noruego bokmål. Al recortar el vocabulario, el modelo resultante es más ligero y adecuado para entornos con recursos limitados, sin reentrenar los pesos del encoder ni del decoder más allá del ajuste dimensional de las capas afectadas.

Es relevante ahora porque la técnica de *trimming* se está consolidando como una vía sencilla de especialización lingüística de modelos ASR open source, y porque el modelo se distribuye con licencia Apache 2.0, pesos en safetensors y compatibilidad con la librería `transformers`, lo que facilita su integración en pipelines existentes. La contrapartida es clara: al eliminar tokens no noruegos, el modelo pierde capacidad multilingüe y solo debe usarse para `nb`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16; no se listan GGUF ni otras) |
| Idiomas soportados | noruego bokmål (`nb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-base`: un transformer encoder-decoder con atención completa, diseñado para recibir espectrogramas Mel de 80 canales y generar transcripciones token a token. El modelo original se entrenó con supervisión débil a gran escala (paper arXiv:2212.04356) y esta variante no reentrena el modelo desde cero, sino que parte de los pesos de `openai/whisper-base` y aplica una reducción del vocabulario. La innovación técnica es precisamente esa poda de vocabulario: se seleccionan los 16.384 tokens más relevantes para noruego bokmål a partir de un corpus de minería de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, y se ajustan las dimensiones de las capas de embedding y de la proyección de salida para que coincidan con el nuevo tamaño.

No se documenta en la información disponible si hubo una fase de fine-tuning posterior sobre audio noruego, ni el número de horas de audio empleadas, ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma habitual en ASR). Tampoco se especifica el proceso exacto de inicialización de los nuevos pesos tras el recorte. La model card indica únicamente que el modelo "debería comportarse de forma similar al original" para el idioma objetivo, lo que sugiere que la poda se realizó sin un reentrenamiento extensivo y que el rendimiento puede degradarse en dominios o acentos no cubiertos por el corpus de minería.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego bokmål, con salida de texto plano.
- Transcripción de audio de hasta 30 segundos por segmento, con la ventana característica de Whisper.
- Soporte de la tarea `transcribe` y, en principio, de la tarea `translate` heredada de Whisper (no verificada en la model card para este checkpoint).
- Integración nativa con `transformers` mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y `pipeline("automatic-speech-recognition")`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción ni modo *thinking*.
- Capacidad multilingüe limitada al noruego bokmål: el recorte de vocabulario elimina tokens de otros idiomas.

## Casos de uso

- Transcripción de reuniones y actas en noruego bokmål: el modelo puede procesar audio de hasta 30 segundos por segmento y encadenar segmentos para reuniones completas, con una huella de memoria reducida que permite ejecutarlo en servidores modestos.
- Subtitulado automático de vídeo en noruego: integrado en un pipeline que segmenta el audio en ventanas de 30 s, genera texto y lo sincroniza con marcas de tiempo; el tamaño reducido del checkpoint (0,1 GB en el repo) simplifica el despliegue en contenedores.
- Atención al cliente en noruego: transcripción de llamadas grabadas para su análisis posterior o para alimentar sistemas de resumen; el modelo está especializado en `nb` y evita confusiones con otros idiomas escandinavos.
- Investigación lingüística y corpus orales: generación de transcripciones de entrevistas o grabaciones de campo en bokmål con un coste computacional menor que el Whisper base completo, útil cuando se procesan grandes volúmenes de audio.
- Despliegue en dispositivos con recursos limitados: al ser un 25,02 % más pequeño que el original, es candidato para entornos edge o CPU con cuantización adicional (aunque el repo no publica pesos cuantizados, la conversión a GGUF es posible con herramientas externas).
- Pipeline de accesibilidad: transcripción en tiempo casi real de contenido audiovisual noruego para generar subtítulos automáticos en plataformas educativas o de streaming interno.
- Preprocesado para otros sistemas NLP: convertir audio noruego en texto para alimentar buscadores, sistemas de resumen o clasificadores, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 54,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 218 MB y en fp16 unos 109 MB; la VRAM efectiva depende del tamaño de lote y de la longitud de audio, pero es del orden de cientos de MB a 1-2 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline`, y por compatibilidad de arquitectura Whisper también es convertible a `llama.cpp`/`whisper.cpp`, `faster-whisper` o `vLLM` (aunque no se documenta soporte oficial en la model card para estas herramientas).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo base de 54 M de parámetros, la latencia esperada es baja en GPU y moderada en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-nob-16384 | 54.427.648 | 30 s de audio (Whisper) | `nb` | Apache 2.0 | Hugging Face |
| openai/whisper-base | 72.593.920 | 30 s de audio (Whisper) | Multilingüe (99 idiomas) | Apache 2.0 | Hugging Face, OpenAI |
| openai/whisper-small | no disponible en la informacion | 30 s de audio (Whisper) | Multilingüe | Apache 2.0 | Hugging Face, OpenAI |
| NB-Whisper (Nasjonalbiblioteket) | no disponible en la informacion | 30 s de audio (Whisper) | Noruego | no disponible en la informacion | Hugging Face |

La comparativa se limita a la información disponible: el modelo podado ofrece menos parámetros que `openai/whisper-base` a costa de perder multilingüismo, y compite con variantes específicas para noruego como las publicadas por Nasjonalbiblioteket, cuyos detalles técnicos no se han podido verificar en esta ficha.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no noruegos: el modelo no es adecuado para transcribir otros idiomas y puede producir salidas degeneradas o incorrectas si se le alimenta audio en sueco, danés o inglés.
- No se han publicado métricas de WER (word error rate) para este checkpoint, por lo que no se puede confirmar que el rendimiento sea equivalente al de `openai/whisper-base` en noruego bokmål.
- Riesgo de alucinación inherente a Whisper: en segmentos con silencio, ruido o audio ininteligible, el modelo puede generar texto inventado, especialmente en la tarea de traducción.
- Sesgos heredados del corpus de entrenamiento original de Whisper y del corpus de minería `fineweb-2-trimming`, que puede no representar todos los dialectos ni registros del noruego.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las transcripciones en dominios específicos (médico, legal, técnico).
- El modelo está pensado para audio a 16 kHz; no se documenta el comportamiento con otras frecuencias de muestreo sin remuestreo previo.
- No se publican pesos cuantizados en el repo; quien necesite GGUF u otros formatos deberá convertirlos por su cuenta y validar la calidad resultante.
- La fecha de creación indicada (2026-05-29) y la de actualización (2026-11-18) sugieren un modelo reciente con pocas descargas (61) y sin likes, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-nob-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio del blog de trimming (imagen de estadísticas): https://github.com/lbourdois/blog
