# Jazira1992/kk-whisper-small

## Resumen

`Jazira1992/kk-whisper-small` es un ajuste fino (fine-tuning) del modelo `openai/whisper-small` sobre habla en kazajo, publicado por el usuario Jazira1992 y entrenado durante 4000 pasos sobre el corpus ISSAI Kazakh Speech Corpus 2 (`issai/ksc2`). No se trata de una arquitectura nueva: reutiliza el encoder-decoder transformer de Whisper, con unos 244 millones de parametros, y su proposito es mejorar el reconocimiento automatico del habla (ASR) para kazajo, un idioma con poquisimos recursos y escasa cobertura en los modelos ASR multilingues genericos.

Su rasgo diferencial no es el rendimiento, sino el formato de despliegue: el repositorio distribuye exclusivamente pesos en ONNX preparados para `transformers.js`, lo que permite ejecutar la transcripcion integramente en el navegador (WebGPU o WASM), en escritorio o en movil, sin servidor ni backend. El repositorio pesa 1.0 GB e incluye el encoder en fp32, el encoder cuantizado a q8, y el decoder fusionado en q8 y q4.

Es relevante ahora por dos motivos: primero, demuestra el flujo de trabajo de adaptar Whisper a lenguas de bajos recursos y exportarlo a un runtime web; segundo, su adopcion es practicamente nula (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como un experimento reproducible mas que como un artefacto listo para produccion. La model card no publica ninguna metrica de calidad (WER/CER), lo que limita seriamente cualquier evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de tipo Whisper, heredada de `openai/whisper-small` |
| Parametros totales | ~244 M (corresponden al modelo base `openai/whisper-small`; el autor no publica recuento propio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s por segmento (caracteristica del modelo base Whisper; no se documenta ninguna modificacion) |
| Tipos de cuantizacion | fp32 (`encoder_model.onnx`), q8 (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`), q4 (`decoder_model_merged_q4.onnx`, pensado para WebGPU) |
| Idiomas soportados | Kazajo (`kk`) como idioma objetivo del ajuste; el modelo base es multilingue, pero no se documenta el estado de los demas idiomas tras el fine-tuning |
| Licencia | MIT |
| Formato de pesos | ONNX exclusivamente (no se publican safetensors, GGUF ni binarios PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que consume espectrogramas log-mel del audio (ventanas de 30 segundos, remuestreo a 16 kHz) y genera tokens de texto de forma autorregresiva, con tokens especiales para deteccion de idioma, transcripcion, traduccion y marcas temporales. El ajuste fino se realizo sobre el checkpoint `openai/whisper-small` durante 4000 pasos de entrenamiento usando el corpus kazajo ISSAI Kazakh Speech Corpus 2. La model card no especifica tasa de aprendizaje, tamano de lote, estrategia de congelacion de capas, ni si se aplicaron tecnicas de regularizacion; tampoco indica si se conservaron las capacidades multilingues del modelo original.

La innovacion practica esta en la cadena de exportacion: el modelo se convierte a ONNX y se publica en cuatro variantes para cubrir el espectro de rendimiento del runtime web. El encoder se ofrece en fp32 y q8, mientras que el decoder se ofrece como `decoder_model_merged` (decoder con past key/values fusionados, patron habitual para evitar reexportaciones dinamicas) en q8 y en q4 para aprovechar WebGPU. La cuantizacion q4 del decoder se justifica porque el decoder es la parte autorregresiva y domina el coste por token generado. No hay informacion sobre decodificacion especulativa, attention linear ni otras optimizaciones mas alla de la cuantizacion.

## Capacidades

- Transcripcion de voz a texto en kazajo, con el pipeline `automatic-speech-recognition` de `transformers.js` y el par de argumentos `{ language: 'kazakh', task: 'transcribe' }` que muestra la propia model card.
- Ejecucion en navegador mediante ONNX Runtime Web (WASM para q8 y WebGPU para q4), sin necesidad de servidor ni de subir el audio a un tercero.
- Procesamiento de audio a 16 kHz, en segmentos de hasta 30 segundos por pasada (limite heredado de Whisper).
- Modelo base multilingue subyacente: tecnicamente puede invocarse con otros codigos de idioma, pero no hay evidencia publicada de que el fine-tuning en kazajo no haya degradado el resto.
- No se documenta soporte de tool calling ni function calling (no aplica a un modelo ASR).
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta salida de marcas temporales a nivel de palabra, diarizacion de hablantes ni deteccion de idioma calibrada.
- No se documentan capacidades de traduccion (tarea `translate`) en el modelo ajustado.

## Casos de uso

- Transcripcion de reuniones y notas de voz en kazajo dentro del navegador: al ejecutarse con `transformers.js` y pesos q8, el audio no sale del dispositivo, lo que encaja en entornos con requisitos de privacidad o RGPD y evita costes de backend.
- Subtitulado de contenido audiovisual kazajo: el modelo permite generar transcripciones de fragmentos de 30 segundos que despues se ensamblan con marcas de tiempo calculadas en la capa de aplicacion, util para canales de video y archivos linguisticos.
- Aplicaciones educativas offline: un corrector de pronunciacion o un cuaderno de idiomas que funcione en movil sin conexion, apoyandose en la variante q8 del encoder y del decoder.
- Digitalizacion de archivos orales y entrevistas: el corpus objetivo (habla kazaja) sugiere uso en preservacion de patrimonio linguistico, procesando lotes de audio localmente con un script Node.js y el runtime ONNX.
- Prototipado rapido de interfaces de voz: un equipo que quiera validar una UX de dictado en kazajo puede integrar el modelo en una demo web en horas, sin montar infraestructura GPU.
- Investigacion en ASR de bajos recursos: sirve como punto de partida reproducible (4000 pasos sobre `issai/ksc2`) para comparar estrategias de fine-tuning o de cuantizacion, siempre que se midan WER propios.
- Preprocesado de texto para pipelines de PLN en kazajo: transcripcion previa a indexacion, busqueda o analisis de sentimiento sobre audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER ni CER sobre los conjuntos de test/validacion de `issai/ksc2`, ni comparaciones con otros modelos kazajos. Tampoco se documentan mediciones de latencia, RTF (real-time factor) ni throughput para las variantes q8 y q4.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el encoder fp32 ocupa del orden de 350 MB y el decoder q8 alrededor de 150 MB; el conjunto en q8 se mantiene por debajo de ~500 MB de pesos, y la combinacion fp32 + q8 ronda los 500-600 MB mas activaciones (estimacion derivada del recuento de parametros del modelo base, no publicada por el autor).
- Cabe en cualquier GPU de consumo e incluso en GPUs integradas: la variante q8 funciona en CPU via WASM y la q4 del decoder esta pensada para WebGPU en navegadores de escritorio y moviles recientes.
- GPU dedicadas recomendadas si se busca latencia baja: RTX 3060/4060 o superiores con WebGPU, o cualquier GPU con al menos 2 GB libres para ejecutar en fp32 con margen.
- Opciones de despliegue: `transformers.js` (navegador y Node.js) es la via soportada oficialmente por el repositorio; tambien puede ejecutarse con ONNX Runtime nativo. No se proporcionan pesos para vLLM, TGI, llama.cpp, whisper.cpp ni Ollama en este repositorio (habria que reconvertir desde `openai/whisper-small` o exportar de nuevo).
- Latencia y throughput: no disponibles. Como referencia cualitativa, un decoder cuantizado a q4 con WebGPU es sensiblemente mas rapido que la ruta WASM q8, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `Jazira1992/kk-whisper-small` | ~244 M | 30 s por segmento | Kazajo (objetivo) | MIT | ONNX para `transformers.js`; 0 descargas |
| `openai/whisper-small` (base) | 244 M | 30 s por segmento | ~99 idiomas, kazajo con cobertura limitada | MIT | PyTorch, safetensors, GGUF y ONNX en el ecosistema |
| `openai/whisper-base` | 74 M | 30 s por segmento | Multilingue | MIT | PyTorch, safetensors, GGUF |
| `openai/whisper-tiny` | 39 M | 30 s por segmento | Multilingue | MIT | PyTorch, safetensors, GGUF |

No hay datos publicados que permitan comparar el WER de este ajuste kazajo frente al de `openai/whisper-small` sin fine-tuning ni frente a otros modelos ASR especificos de kazajo; la comparacion anterior se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de metricas: sin WER/CER publicado no es posible afirmar que el fine-tuning mejore al modelo base en kazajo; hay que evaluarlo antes de usarlo.
- Riesgo de olvido catastrofico: 4000 pasos sobre un unico corpus pueden degradar el rendimiento en otros idiomas y en dominios acusticos distintos (ruido, telefonía, acentos regionales).
- Alucinacion tipica de Whisper: en segmentos con silencio, musica o ruido es frecuente que el modelo genere texto inventado o repita frases; conviene aplicar deteccion de actividad vocal y filtros de confianza.
- Limite estructural de 30 segundos por ventana: audio mas largo requiere segmentacion externa y un algoritmo de ensamblaje que puede perder palabras en las fronteras.
- Modelo de un unico autor, sin revision por pares, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni mantenimiento.
- Licencia MIT para los pesos, pero la licencia del dataset `issai/ksc2` no se detalla en la model card; conviene verificar las condiciones de uso comercial del corpus antes de desplegar en producto.
- Solo se publican pesos ONNX: no hay safetensors ni GGUF, lo que impide usar directamente herramientas del ecosistema PyTorch (vLLM, whisper.cpp, fine-tuning ulterior) sin reconvertir.
- No se documenta calibracion de marcas temporales, diarizacion ni puntuacion; la calidad de los subtitulos dependera de post-procesado externo.
- El espanol de Espana no es un idioma objetivo del ajuste; usarlo con audio en castellano no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jazira1992/kk-whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento (ISSAI Kazakh Speech Corpus 2): https://huggingface.co/datasets/issai/ksc2
- `transformers.js` (runtime JS/ONNX): https://github.com/huggingface/transformers.js
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
