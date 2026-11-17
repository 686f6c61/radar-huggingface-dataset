# FredrikKarlssonSpeech/salmon-whisper-large-smj-lr7e-5-onnx

## Resumen

El modelo `salmon-whisper-large-smj-lr7e-5-onnx` es una conversion a ONNX de la familia Whisper Large fine-tuneada para reconocimiento automatico del habla (ASR) en lule sami (smj), una lengua sami hablada en el norte de Escandinavia. Lo publica el usuario FredrikKarlssonSpeech a partir del checkpoint original de NbAiLab, el grupo de investigacion del National Library of Norway especializado en modelos salmon para lenguas nordicas. El modelo resuelve el problema de la transcripcion de audio en una lengua de bajos recursos sin apenas soporte en sistemas ASR comerciales.

Tecnicamente es un encoder-decoder transformer de tipo Whisper Large (aproximadamente 1.550 millones de parametros en la version large-v3 de la que deriva la familia), distribuido en formato ONNX con ocho variantes de precision que van desde fp32 hasta cuantizaciones de 4 bits (q4, q4f16, bnb4) y enteros de 8 bits (int8, uint8, quantized). El repositorio ocupa 28,7 GB porque incluye todas las variantes junto al grafo de decodificacion con y sin cache.

Su relevancia actual radica en dos factores: por un lado, demuestra el patron de adaptacion de Whisper a lenguas minoritarias mediante fine-tuning supervisado; por otro, ofrece artefactos ONNX listos para desplegar en entornos de produccion heterogeneos (servidores CPU, navegador via transformers.js, edge) sin necesidad de reexportar el modelo. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large), exportado a ONNX |
| Parametros totales | no disponible (derivado de Whisper Large; el modelo base no declara cifra exacta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper); no disponible el limite exacto de tokens de texto |
| Tipos de cuantizacion | fp32, fp16, int8, uint8, quantized (avx512_vnni), q4, q4f16, bnb4 (NF4) |
| Idiomas soportados | lule sami (smj); token de idioma sustituto: estonio (et, id 50307) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`, `decoder_model_merged.onnx` y variantes por precision) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper Large, un transformer encoder-decoder disenado para ASR y traduccion de voz. El encoder procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con soporte de cache (`decoder_with_past_model`) para decodificacion incremental. La conversion ONNX preserva esta topologia y anade grafos fusionados para inferencia optimizada.

El fine-tuning se realizo sobre el checkpoint `NbAiLab/salmon-whisper-large-smj-lr7e-5`, que segun la nomenclatura emplea una tasa de aprendizaje de 7e-5. No se dispone en la informacion proporcionada del numero de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; la model card original de NbAiLab es la referencia para esos detalles. Una innovacion practica destacable es el uso de un token de idioma sustituto (estonio) porque el tokenizer de Whisper no incluye `<|smj|>`; el `generation_config.json` ya viene configurado para forzar ese token y evitar la deteccion automatica de idioma.

## Capacidades

- Transcripcion de voz a texto en lule sami (smj) a partir de audio mono a 16 kHz.
- Decodificacion por lotes y con cache de atencion para reducir latencia en inferencia.
- Ejecucion en CPU, GPU y navegador gracias a las multiples variantes ONNX (incluida integracion con transformers.js).
- Tarea de transcripcion (`transcribe`); no se documenta soporte de traduccion a otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo puramente ASR.
- Capacidad multilingue limitada: unicamente lule sami como lengua de salida.
- No dispone de modo thinking, vision ni audio mas alla de la propia entrada de voz.

## Casos de uso

- Transcripcion de archivos audiovisuales en lule sami para archivos nacionales y bibliotecas: el modelo permite convertir grabaciones historicas o entrevistas a texto buscable, algo critico para lenguas con pocos recursos digitales.
- Subtitulado automatico en emisiones de radio o television en sami: al ejecutarse en ONNX con variantes int8 y q4, puede desplegarse en servidores CPU modestos para generacion de subtitulos en cuasi tiempo real.
- Investigacion linguistica de campo: los investigadores pueden transcribir corpus orales y anotarlos morfologicamente con menos esfuerzo manual, dado que el modelo esta especializado en la lengua.
- Aplicaciones educativas para aprendizaje del lule sami: integracion en herramientas web mediante transformers.js en el navegador, sin enviar audio a servidores externos, lo que protege la privacidad de los hablantes.
- Digitalizacion de patrimonio oral en museos y archivos: la licencia Apache 2.0 permite su uso comercial y su inclusion en pipelines institucionales sin restricciones adicionales.
- Sistemas de accesibilidad para hablantes de lule sami: transcripcion en directo de reuniones o clases mediante el decoder con cache, reduciendo la latencia frente a la decodificacion completa.
- Prototipado rapido en entornos edge: la variante bnb4 o q4 permite ejecutar el modelo en dispositivos con poca memoria, habilitando aplicaciones offline en comunidades con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 28,7 GB, pero una sola variante fp16 ronda los 3 GB y las variantes int8/q4 alrededor de 1,5-2 GB (estimacion basada en el tamano tipico de Whisper Large; no confirmada en la model card).
- GPU recomendadas: A100 o H100 para despliegues de alto throughput en fp16; RTX 4090 o RTX 3090 para inferencia interactiva en fp16.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de 8 GB o mas usando fp16 o int8; las variantes q4 y bnb4 permiten incluso ejecucion en CPU o GPUs integradas.
- Opciones de despliegue: Optimum con ONNX Runtime (`ORTModelForSpeechSeq2Seq`), transformers.js en navegador o Node.js, y cualquier runtime compatible con ONNX (ONNX Runtime, servidores de inferencia propios).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen en gran medida de la variante de precision y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| salmon-whisper-large-smj-lr7e-5-onnx | Whisper Large (cifra exacta no disponible) | 30 s por ventana | lule sami | Apache 2.0 | ONNX |
| NbAiLab/salmon-whisper-large-smj-lr7e-5 | Whisper Large (cifra exacta no disponible) | 30 s por ventana | lule sami | Apache 2.0 | safetensors (formato original) |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | multilingue (99 idiomas, sin lule sami) | Apache 2.0 | safetensors, ONNX via conversion |
| NbAiLab/salmon-whisper-large (familia) | Whisper Large | 30 s por ventana | noruego y otras lenguas nordicas | Apache 2.0 | safetensors |

La diferencia principal frente a Whisper Large-v3 de OpenAI es la especializacion en lule sami, lengua no cubierta por el modelo original; frente al checkpoint base de NbAiLab, esta version anade el formato ONNX y las variantes cuantizadas para despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Whisper, puede heredar sesgos acusticos y de vocabulario del corpus original.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible en segmentos de silencio o ruido; se recomienda validacion humana en entornos criticos.
- Limitacion de idioma: solo transcribe lule sami; forzar otro idioma mediante el token sustituto puede degradar la calidad.
- Token de idioma sustituto: es obligatorio fijar `language="et"` (estonio) y no confiar en la deteccion automatica, ya que `<|smj|>` no existe en el tokenizer.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card original de NbAiLab por si anade condiciones adicionales sobre los datos de entrenamiento.
- Ventana de audio: limitada a 30 segundos por inferencia; audios mas largos requieren segmentacion y concatenacion.
- Repositorio pesado: 28,7 GB en total; descargar solo la variante necesaria mediante `subfolder` o filtros de ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FredrikKarlssonSpeech/salmon-whisper-large-smj-lr7e-5-onnx
- Modelo base original: https://huggingface.co/NbAiLab/salmon-whisper-large-smj-lr7e-5
- Documentacion de Optimum: https://huggingface.co/docs/optimum
- Libreria transformers.js: https://huggingface.co/docs/transformers.js
