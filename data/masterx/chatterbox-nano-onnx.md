# Masterx/chatterbox-nano-ONNX

# Chatterbox nano ONNX

## Resumen

Chatterbox nano ONNX es una exportación al formato ONNX del modelo de síntesis de voz Chatterbox Nano de Resemble AI, realizada por el usuario independiente Masterx. El modelo resuelve generación de voz condicionada por una muestra de referencia (voice cloning) en inglés: a partir de un clip de referencia de hasta 10 segundos a 24 kHz y un texto de entrada, devuelve la forma de onda correspondiente. Su interés práctico es que elimina la dependencia de PyTorch y permite ejecutar TTS sobre ONNX Runtime, tanto en CPU como en GPU.

Arquitectónicamente combina un backbone T3 de tipo GPT-2 small (unos 110 M de parámetros) con un encoder de voz CAMPPlus y un decodificador S3Gen meanflow destilado a un solo paso. Los grafos respetan exactamente la nomenclatura de ficheros y el contrato de entrada/salida del export oficial chatterbox-turbo-ONNX; de hecho, el fichero `s3gen_meanflow.safetensors` de Nano es idéntico byte a byte al de Turbo y los grafos del decodificador condicional son los de Turbo sin modificar. Esto significa que un runtime ya escrito para Turbo puede ejecutar Nano limitándose a cambiar el directorio.

El repositorio ocupa 0,7 GB e incluye cuantización de 4 bits en dos variantes, q4 y q4f16. Se publica bajo licencia MIT y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportación ONNX de Chatterbox Nano: backbone T3 tipo GPT-2 small (transformer decoder con GroupQueryAttention y cache KV), encoder de voz CAMPPlus, decodificador condicional S3Gen meanflow destilado a un paso |
| Parametros totales | Aproximadamente 110 M en el backbone T3 (`t3_nano_v1.safetensors`); el total del pipeline completo (encoder + decodificador) no está disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el grafo `language_model` usa 12 capas, 12 cabezas de 64 dimensiones, hidden 768 y vocabulario de 6563 tokens) |
| Tipos de cuantizacion | 4 bits `MatMulNBits` con bloque 32 y cuantización asimétrica (zero points), sin `accuracy_level`; tablas de embeddings como `GatherBlockQuantized` 4 bits. Variantes q4 (pesos 4 bits) y q4f16 (pesos y cache KV en fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 20 en speech_encoder y embed_tokens, opset 21 con `com.microsoft` en language_model) con datos externos en ficheros `.onnx_data` |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. `speech_encoder` y `embed_tokens` se exportaron con `torch.onnx.export` (opset 20, exportador TorchScript) a partir de la receta de conversión `PrepareConditionalsModel` de onnx-community, adaptada al condicionamiento de Turbo/Nano: cada vista a 16 kHz (x-vector, tokens de prompt del flow, 375 tokens de prompt del T3) se deriva de la referencia de 24 kHz recortada a 10 s, sin perceiver y sin embedding posicional, y la capa densa con BatchNorm original de CAMPPlus se escribe como aritmética explícita para ser bit-exacta respecto a PyTorch. `embed_tokens` mapea los dos identificadores finales `50256` al token de inicio de voz, igual que el grafo de Turbo. Después se aplica `onnxslim`.

El grafo `language_model` reproduce nodo a nodo la disposición del `language_model*.onnx` oficial de Turbo (GroupQueryAttention con cache KV, `LayerNormalization`, activación tanh-GELU y `wpe` mediante Gather sobre `position_ids`), con los pesos copiados de `t3_nano_v1.safetensors`. La cuantización sigue el estilo oficial de Turbo: `MatMulNBits` de 4 bits con bloque 32 y puntos cero asimétricos, y sin `accuracy_level` porque, según la model card, la cuantización de activaciones a int8 rompe las dimensiones atípicas (outliers) de GPT-2. Los grafos `conditional_decoder_*` se copian sin cambios desde Turbo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz condicionada por referencia (voice cloning) a partir de un clip de referencia de hasta 10 segundos a 24 kHz, con `default_voice.wav` (7,4 s) incluido como voz por defecto.
- Generación de audio en un único paso del decodificador S3Gen meanflow destilado, en lugar de un esquema iterativo.
- Etiquetas paralingüísticas nativas heredadas de Turbo: `[laugh]`, `[chuckle]`, `[cough]`, entre otras.
- Inferencia sin PyTorch, sobre ONNX Runtime, con grafos separados para encoder de voz, embeddings, modelo de lenguaje y decodificador condicional.
- Compatibilidad de runtime con Turbo: mismo naming de ficheros, mismo layout de grafo y mismo contrato de entradas/salidas.
- Soporte de voz clonada a partir de `speaker_embeddings` de 192 dimensiones y `speaker_features` con 80 dimensiones de características.
- No aplica tool calling, function calling ni razonamiento multi-paso: es un modelo de texto a voz, no un LLM de propósito general.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Clonación de voz para audiolibros y narración larga: el modelo toma una referencia de voz y sintetiza texto arbitrario en inglés, de modo que un narrador puede grabar una sola muestra y generar capítulos completos con timbre consistente.
- Atención telefónica y sistemas IVR: al ejecutarse sobre ONNX Runtime puede integrarse en servicios de baja latencia en CPU sin necesidad de GPU dedicada, generando respuestas habladas dinámicas en lugar de mensajes pregrabados.
- Voces para videojuegos y motores como Unity: el espejo KitsuMate del mismo export se publicó precisamente para descargas reproducibles en Unity y ONNX Runtime, lo que indica uso previsto en diálogo dinámico dentro de motor.
- Accesibilidad y lectores de pantalla: conversión de texto a voz local, sin envío de contenido a servicios en la nube, con soporte de etiquetas como `[cough]` o `[laugh]` para mejorar la naturalidad en contenido narrativo.
- Doblaje y postproducción: generación de voces sintéticas en inglés para prototipos de doblaje o para insertar líneas adicionales manteniendo el timbre del actor original mediante la referencia de voz.
- Despliegue en dispositivos sin GPU: con pesos de 4 bits que suman del orden de 0,5 GB, el pipeline puede ejecutarse en portátiles y equipos de gama media en CPU a través de ONNX Runtime.
- Pruebas de integración en pipelines ya construidos para Chatterbox Turbo: como los grafos y el decodificador son compatibles, sirve para evaluar el coste y la calidad de Nano sustituyendo únicamente el directorio de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de calidad de voz como MOS, WER o RTF). La model card sí incluye una validación de paridad numérica frente a PyTorch usando `default_voice.wav` (7,4 s):

| Grafo | Salida | Diferencia absoluta maxima | Coseno |
|---|---|---:|---:|
| speech_encoder (fp32, antes de cuantizar) | audio_features | 0 | 1,0000000 |
| speech_encoder (fp32) | audio_tokens | 186/186 identicos | no aplica |
| speech_encoder (fp32) | speaker_embeddings frente a `s3gen.embed_ref` | 6,4e-6 | 1,0000000 |
| speech_encoder (fp32) | speaker_features | 8,2e-2 | 0,9999999 |
| speech_encoder_q4 | audio_features | 3,25 | 0,9642 |
| speech_encoder_q4 | audio_tokens | 96,8 % identicos | no aplica |
| speech_encoder_q4 | speaker_embeddings | 7,8e-2 | 0,99975 |
| embed_tokens (fp32) | inputs_embeds | 0 | 1,0000000 |
| embed_tokens_q4 | inputs_embeds | 0,115 | 0,9964 |
| language_model (fp32, antes de cuantizar) | logits, 41 pasos forzados | 1,7e-4 | 1,0000000 (top-1 100 %) |
| language_model_q4 | logits, prefill | 7,0 | 0,952 |
| language_model_q4f16 | logits, prefill | 7,3 | 0,951 |

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del tamaño de los ficheros publicados, no datos declarados por el autor:

- Tamaño de los pesos por variante: en q4, `language_model_q4.onnx_data` ocupa 83,3 MB, `speech_encoder_q4.onnx_data` 130,9 MB, `conditional_decoder_q4.onnx_data` 246,4 MB y `embed_tokens_q4.onnx_data` 28,0 MB. En q4f16, el modelo de lenguaje baja a 64,9 MB y el decodificador a 163,0 MB.
- VRAM estimada: del orden de 1 GB o menos para el pipeline completo en q4 o q4f16, sumando pesos, cache KV y activaciones.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de memoria (GTX 1650, RTX 3060, RTX 4090, etc.); el factor limitante no es la VRAM sino la latencia del decodificador.
- Ejecución en CPU: viable, al ser ONNX Runtime y pesos de 4 bits; es el escenario habitual para este tipo de export.
- GPU de datacenter: A100, H100 o L40S no son necesarias por tamaño, pero pueden usarse para servir muchas peticiones concurrentes.
- Opciones de despliegue: ONNX Runtime (librería con la que está etiquetado el repo), `onnxruntime-genai` y cualquier runtime de Chatterbox Turbo al que se le sustituya el directorio de modelos. No hay ficheros GGUF, por lo que llama.cpp y Ollama no aplican directamente. vLLM y TGI no soportan este pipeline de TTS.
- Latencia y throughput: no disponibles; no se han publicado medidas de RTF ni de tiempo por segundo de audio generado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Masterx/chatterbox-nano-ONNX | ~110 M (backbone T3) | no disponible | en | MIT | ONNX q4 / q4f16 | Export independiente, no oficial; reutiliza los grafos de decodificador de Turbo |
| ResembleAI/chatterbox-nano | ~110 M (backbone T3) | no disponible | en | MIT | safetensors (PyTorch) | Modelo base upstream del que deriva este export |
| ResembleAI/chatterbox-turbo-ONNX | 350 M | no disponible | en | MIT | ONNX | Export oficial de Resemble AI; referencia de layout y contrato de E/S de este repositorio |
| KitsuMate/chatterbox-nano-onnx | no disponible | no disponible | en | no disponible | ONNX | Espejo del export independiente de owensong, pensado para Unity y ONNX Runtime; no es una release oficial de Resemble AI |
| Chatterbox Multilingual | no disponible | no disponible | 23 idiomas | no disponible en la informacion consultada | safetensors / ONNX | Alternativa de Resemble AI cuando se necesita cobertura multilingüe |

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües en esta exportación.
- La cuantización de 4 bits introduce degradación medible: la similitud coseno de los logits en prefill baja a 0,952 (q4) y 0,951 (q4f16), y el encoder de voz conserva solo el 96,8 % de los tokens de audio idénticos.
- No hay métricas perceptuales publicadas (MOS, similitud de hablante, WER) que permitan estimar la calidad real del audio generado tras cuantizar.
- El repositorio no es una release oficial de Resemble AI; es un export de un tercero, sin proceso de revisión por parte del equipo del modelo base.
- No se especifican los datos de entrenamiento, los sesgos acústicos ni la cobertura de acentos, géneros o edades del modelo base.
- La clonación de voz permite usos abusivos (suplantación, deepfakes). Es responsabilidad del usuario obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable.
- Según la documentación de los modelos Chatterbox de Resemble AI, el audio generado incorpora el marcador perceptual PerTh, diseñado para sobrevivir a compresión MP3 y edición; la model card de esta exportación no lo confirma de forma explícita.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria ni reportes de fallos.
- La fecha de creación indicada en los metadatos (2026-10-08) es anómala respecto a la fecha de consulta; conviene verificar la vigencia real de los ficheros antes de usarlos en producción.
- La licencia MIT del repo no exime de revisar la licencia y las condiciones de uso del modelo base ResembleAI/chatterbox-nano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Masterx/chatterbox-nano-ONNX
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Export oficial de referencia (Turbo ONNX): https://huggingface.co/ResembleAI/chatterbox-turbo-ONNX
- Repositorio upstream de Resemble AI: https://github.com/resemble-ai/chatterbox
- Espejo para Unity y ONNX Runtime: https://huggingface.co/KitsuMate/chatterbox-nano-onnx
- Catálogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
- Ficha de las herramientas Chatterbox (contiene la descripción de Turbo, 350 M de parámetros, y del watermarker PerTh): https://opensourcetools.org/tools/chatterbox/
- Receta de conversión de onnx-community para Chatterbox: mencionada en la model card, URL no disponible en la información consultada
- Export independiente de owensong: mencionado en los resultados de búsqueda, URL no disponible en la información consultada
