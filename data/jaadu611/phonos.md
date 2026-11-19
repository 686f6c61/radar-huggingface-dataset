# Jaadu611/phonos

## Resumen

Phonos es un sistema de restauracion de voz neuronal publicado por el usuario Jaadu611 en Hugging Face. Se presenta como un modelo "ultra-compacto" orientado a la eliminacion de ruido de fondo, la desreverberacion acustica y la sintesis de armonicos de alta frecuencia, con salida a 44,1 kHz. El paquete completo ocupa 78,7 MB, lo que supone una reduccion del 88,9 % respecto a los 595,9 MB del modelo original del que deriva, segun la model card.

La arquitectura declarada combina un ResUNet cuantizado en NF4/FP8 con un vocoder neuronal TFGAN, y se distribuye con la libreria propia `phonos` y un CLI (`cli.py enhance`) alojado en GitHub. El modelo se evalua sobre el conjunto de test de VoiceBank-DEMAND a 16 kHz (824 enunciados), con PESQ wideband de 2,392 y STOI de 0,8834.

Es relevante por su perfil de despliegue: menos de 950 MB de VRAM en pico y un rendimiento declarado de 11,8x tiempo real en una RTX 3050 Laptop, lo que lo situa en el segmento de restauracion de audio ejecutable en hardware de consumo. No obstante, la informacion publica es escasa: no hay paper, no hay repositorio de pesos estandar y la fecha de creacion del repositorio (2026-11-19) es posterior a la fecha actual, lo que conviene verificar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResUNet cuantizado en NF4/FP8 + vocoder neuronal TFGAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo audio-to-audio, no autoregresivo) |
| Tipos de cuantizacion | NF4 y FP8 (mixta, segun model card) |
| Idiomas soportados | no disponible (procesamiento de senal, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni checkpoint PyTorch) |
| Tamano del paquete | 78,7 MB |
| Frecuencia de muestreo de salida | 44,1 kHz |
| VRAM pico | < 950 MB |
| Rendimiento | 11,8x tiempo real en RTX 3050 Laptop GPU |
| Dataset de entrenamiento/evaluacion | JacobLinCool/VoiceBank-DEMAND-16k |
| Metricas declaradas | PESQ, STOI |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida compuesta por un ResUNet (red convolucional con conexiones residuales y skip connections tipo U-Net) y un vocoder neuronal basado en TFGAN (Time-Frequency GAN). El ResUNet operaria sobre representaciones tiempo-frecuencia para suprimir ruido y reverberacion, mientras que el vocoder TFGAN se encargaria de la sintesis de armonicos de alta frecuencia y de la reconstruccion de la forma de onda a 44,1 kHz. La cuantizacion mixta NF4/FP8 es la responsable de la reduccion de tamano de 595,9 MB a 78,7 MB.

No se especifica en la informacion disponible el numero de tokens ni de horas de audio empleadas en el entrenamiento, la composicion exacta del dataset mas alla de VoiceBank-DEMAND, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning perceptivo. Tampoco se detalla el esquema de cuantizacion (si es post-entrenamiento o QAT) ni la herramienta utilizada para generarla (bitsandbytes, GPTQ, etc.). La innovacion declarada es la compresion extrema manteniendo una frecuencia de muestreo de 44,1 kHz, superior a los 16 kHz habituales en los benchmarks de restauracion de voz.

## Capacidades

- Restauracion de voz: eliminacion de ruido de fondo estacionario y no estacionario.
- Desreverberacion acustica: reduccion de la cola reverberante en grabaciones en recinto.
- Sintesis de armonicos de alta frecuencia: reconstruccion de contenido espectral por encima del corte tipico de 16 kHz hasta 44,1 kHz.
- Procesamiento audio-a-audio: entrada y salida en forma de onda, sin texto intermedio.
- Recuperacion forense: orientado segun la model card a recuperacion de grabaciones degradadas.
- Ejecucion en hardware de consumo: menos de 950 MB de VRAM en pico.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla del audio.
- No se documenta soporte multilingue explicito; al operar sobre senal acustica, el comportamiento seria en principio independiente del idioma, pero no hay evaluacion que lo confirme.

## Casos de uso

- Limpieza de grabaciones de entrevistas y podcasts: el modelo procesa la forma de onda completa y devuelve audio a 44,1 kHz, adecuado para publicacion directa sin remuestreo posterior.
- Restauracion de archivos historicos o forenses: la combinacion de desreverberacion y supresion de ruido permite recuperar inteligibilidad en grabaciones degradadas, con STOI de 0,8834 como referencia de preservacion de inteligibilidad.
- Preprocesado para ASR: aplicar Phonos antes de un sistema de reconocimiento de voz reduce el ruido de entrada; conviene validar el impacto en WER porque la metrica publicada es STOI, no WER.
- Videollamadas y teleconferencia: con 11,8x tiempo real en una RTX 3050 Laptop, el modelo puede ejecutarse en un portatil con GPU de gama media para limpiar el microfono en tiempo real.
- Produccion musical y doblaje: la salida a 44,1 kHz evita el remuestreo que imponen los modelos de restauracion a 16 kHz, lo que simplifica la integracion en cadenas de postproduccion.
- Despliegue en el borde o en contenedores ligeros: el paquete de 78,7 MB y el pico de VRAM inferior a 950 MB permiten empaquetarlo en imagenes Docker pequenas o en equipos sin GPU dedicada de gran capacidad.
- Transcripcion de reuniones: limpieza previa de pistas de audio multi-participante antes de pasar el resultado a un motor de diarizacion y transcripcion.

## Benchmarks y rendimiento

Evaluacion declarada sobre VoiceBank-DEMAND (824 enunciados, 16 kHz):

| Metrica | Phonos | Baseline con ruido | Mejora |
|---|---|---|---|
| PESQ (wideband) | 2,392 | 2,159 | +0,233 |
| STOI | 0,8834 | no disponible | no disponible |
| Tiempo de evaluacion (824 archivos) | 154,5 s | no disponible | no disponible |
| Throughput | 11,8x tiempo real (RTX 3050 Laptop) | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos de restauracion de voz (Demucs, FRCRN, CMGAN, DeepFilterNet, etc.) en la informacion disponible. Tampoco se aportan cifras de PESQ en banda estrecha, SI-SDR, DNSMOS ni evaluaciones a 44,1 kHz, que es precisamente la frecuencia de salida declarada.

## Requisitos de hardware

- VRAM estimada en inferencia: menos de 950 MB en pico, segun la model card.
- GPU recomendada por el autor: RTX 3050 Laptop como referencia de rendimiento (11,8x tiempo real).
- Cabe en GPU de consumo: si, con ese pico de VRAM cualquier GPU con 2 GB o mas deberia ser suficiente; no se documentan pruebas en GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 ni H100.
- Despliegue: el autor proporciona un CLI propio (`python cli.py enhance input.wav -o restored_studio.wav`) y la libreria `phonos`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo audio-a-audio convolucional.
- Latencia y throughput: 11,8x tiempo real en RTX 3050 Laptop; 154,5 s para procesar 824 archivos en la evaluacion del benchmark.
- CPU: no se documenta rendimiento en CPU ni en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de salida | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonos (Jaadu611) | no disponible (78,7 MB cuantizado) | 44,1 kHz | audio-a-audio | MIT | Hugging Face + GitHub |
| DeepFilterNet | no disponible en esta ficha | 48 kHz | audio-a-audio | MIT/Apache (segun version) | GitHub + Hugging Face |
| FRCRN (ModelScope) | no disponible en esta ficha | 16 kHz | audio-a-audio | Apache 2.0 (segun version) | ModelScope |
| CMGAN | no disponible en esta ficha | 16 kHz | audio-a-audio | MIT (segun repositorio) | GitHub |

La comparacion cuantitativa no es posible con la informacion disponible: Phonos publica PESQ 2,392 y STOI 0,8834 sobre VoiceBank-DEMAND, pero no se aportan las cifras equivalentes de los modelos alternativos en el material consultado. La diferencia principal declarada es la salida a 44,1 kHz frente a los 16 kHz habituales en la literatura de restauracion de voz.

## Limitaciones y advertencias

- La fecha de creacion del repositorio (2026-11-19) es posterior a la actual; conviene verificar la autenticidad y vigencia del modelo antes de integrarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- No hay paper, informe tecnico ni repositorio de evaluacion reproducible publicados; los benchmarks son unicamente los que declara el autor.
- La evaluacion se realiza a 16 kHz (VoiceBank-DEMAND), mientras que el modelo declara salida a 44,1 kHz; no se aporta ninguna metrica a 44,1 kHz, por lo que la calidad en la banda alta no esta cuantificada.
- No se especifica el formato de pesos ni el procedimiento de carga fuera de la libreria `phonos`; la portabilidad a otros runtimes (ONNX, TensorRT, Core ML) no esta documentada.
- La cuantizacion NF4/FP8 puede introducir artefactos en pasajes con relacion senal-ruido muy baja o con componentes musicales; no se documenta ninguna evaluacion subjetiva (MOS) que lo descarte.
- Riesgo de alucinacion espectral: como todo modelo generativo de audio, puede sintetizar armonicos inexistentes en la grabacion original, lo que es problematico en contextos forenses donde la fidelidad probatoria es requisito.
- No hay informacion sobre sesgos por idioma, acento, edad o sexo del hablante, ni sobre el rendimiento en idiomas distintos del ingles del dataset VoiceBank.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar la licencia del dataset VoiceBank-DEMAND por si impone restricciones adicionales al uso de los pesos derivados.
- No se documenta el comportamiento en audio de mas de un canal, en tasas de muestreo distintas de 16 kHz ni en fragmentos de duracion arbitraria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jaadu611/phonos
- Repositorio GitHub indicado en la model card: https://github.com/jaadu611/phonos
- Dataset de evaluacion: https://huggingface.co/datasets/JacobLinCool/VoiceBank-DEMAND-16k
