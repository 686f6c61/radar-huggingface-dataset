# ALLUCY-Rodent/whisper-small-ko

## Resumen

El modelo `ALLUCY-Rodent/whisper-small-ko` es una versión cuantizada a int8 (q8) en formato ONNX del modelo `SungBeom/whisper-small-ko`, un ajuste fino de Whisper Small específicamente entrenado para el reconocimiento de voz automático (STT) en coreano. El modelo original fue fine-tuneado sobre 7 dominios del dataset AI Hub (atención al cliente, voz coreana, conversación, conversación libre, call center, vehículos y comandos), con un total de 10.916.423 utterances y 13.946 horas de audio. Esta variante ONNX está pensada para ejecutarse en el navegador mediante transformers.js v4 con WebGPU o WASM, dentro de una aplicación PWA de transcripción de reuniones.

La relevancia de este modelo radica en su tamaño compacto (Whisper Small tiene aproximadamente 244 millones de parámetros) combinado con la cuantización int8, lo que permite inferencia en dispositivos de gama media sin necesidad de servidor. El autor de este repo, ALLUCY-Rodent, ha realizado la conversión directa a ONNX int8 utilizando optimum 1.x y onnxruntime 1.29, evitando problemas de regresión QDQ que afectaban a versiones anteriores de onnxruntime. Cabe destacar que, según la model card, los archivos ONNX aún no están subidos al repositorio, por lo que el acceso al modelo puede estar pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder Transformer) |
| Parametros totales | ~244M (original, cuantizado a int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper estándar usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | int8 (q8) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo base es Whisper Small, un transformer encoder-decoder con aproximadamente 244 millones de parámetros, entrenado por OpenAI sobre 680.000 horas de audio multilingüe y multitarea. El modelo `SungBeom/whisper-small-ko` fue fine-tuneado sobre datos exclusivamente coreanos del AI Hub, divididos en 5 partes debido al gran volumen del dataset. El ajuste fino se realizó con los datasets de los 7 dominios mencionados, sumando más de 13.000 horas de audio transcrito.

La versión de ALLUCY-Rodent convierte el modelo fine-tuneado a ONNX con cuantización int8 directa, utilizando optimum 1.x y onnxruntime 1.29. Esta conversión está optimizada para su ejecución en navegadores mediante transformers.js v4, con soporte para WebGPU y WASM. La cuantización reduce el tamaño de los archivos a aproximadamente 93 MB para el encoder y 377 MB para el decoder fusionado, lo que facilita su descarga y ejecución en entornos web.

## Capacidades

- Transcripción de voz coreana a texto con alta precisión, gracias al fine-tuning sobre dominios específicos como llamadas telefónicas, comandos de vehículos y conversaciones cotidianas.
- Reconocimiento de voz automático (ASR) en tiempo real, adecuado para aplicaciones de streaming de audio.
- Funciona en el navegador sin servidor, mediante transformers.js v4 y WebGPU/WASM, lo que permite inferencia local en dispositivos del usuario.
- Soporte para la pipeline `automatic-speech-recognition` de Hugging Face Transformers, con configuración específica de idioma (`language: 'ko'`).
- No incluye capacidades de tool calling, agentes, visión ni otras modalidades más allá del audio.
- Al estar basado en Whisper, hereda la capacidad de identificación de idioma, aunque este modelo está especializado en coreano.

## Casos de uso

- Transcripción de reuniones en una PWA: el modelo está diseñado para una aplicación de reuniones (meeting-ai-pwa) que transcribe audio en tiempo real dentro del navegador, sin enviar datos a un servidor externo.
- Subtitulación automática de vídeos en coreano: puede procesar archivos de audio o vídeo y generar subtítulos sincronizados, útil para creadores de contenido y plataformas educativas.
- Atención al cliente automatizada: al haber sido fine-tuneado con datos de call center, es adecuado para transcribir llamadas de soporte y analizar conversaciones para control de calidad.
- Dictado por voz en aplicaciones web: permite a usuarios escribir texto mediante voz en coreano, integrable en editores de texto, formularios o herramientas de productividad.
- Asistentes de voz para vehículos: el dominio de comandos de vehículos incluido en el entrenamiento lo hace útil para sistemas de infoentretenimiento que requieran comandos de voz en coreano.
- Análisis de conversaciones y minería de texto: transcribir entrevistas, podcasts o debates en coreano para su posterior análisis y búsqueda de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `SungBeom/whisper-small-ko` tampoco incluye métricas de WER (Word Error Rate) o CER en su model card pública. Dado que se trata de un fine-tuning de Whisper Small sobre datos coreanos, se espera un rendimiento superior al modelo base en tareas de ASR coreano, pero no se dispone de cifras concretas para este repositorio específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo cuantizado int8 de ~244M parámetros, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM, y en GPU con tan solo 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte WebGPU (por ejemplo, NVIDIA GTX 10xx o superior, AMD RX 5000 o superior, o integradas recientes). También funciona en CPU con WASM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como la GTX 1650 o incluso en iGPU de portátiles.
- Opciones de despliegue: transformers.js v4 en navegador (WebGPU/WASM), o bien ONNX Runtime en servidor (Python o Node.js) para inferencia batch.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado el tamaño reducido y la cuantización, se espera una latencia de cientos de milisegundos por ventana de 30 segundos en hardware moderno, pero depende del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ALLUCY-Rodent/whisper-small-ko | ~244M (int8) | no disponible | coreano | Apache-2.0 | ONNX | Cuantizado para navegador |
| openai/whisper-small | ~244M | 30 s | multilingüe (99 idiomas) | MIT | PyTorch, safetensors, GGUF | Modelo base sin fine-tuning |
| SungBeom/whisper-small-ko | ~244M | 30 s | coreano | Apache-2.0 | PyTorch, safetensors | Fine-tuning original sobre AI Hub |
| openai/whisper-base | ~74M | 30 s | multilingüe | MIT | PyTorch, safetensors, GGUF | Más ligero pero menos preciso |

El modelo de ALLUCY-Rodent se diferencia por su formato ONNX int8, orientado exclusivamente a despliegue web. Frente al modelo original de SungBeom, añade la cuantización que reduce el tamaño y permite ejecución en navegador, aunque puede sacrificar algo de precisión. Comparado con Whisper Small original, este fine-tuning coreano debería ofrecer mejor rendimiento en coreano, pero no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- El repositorio aún no tiene subidos los archivos ONNX según la model card (fecha de actualización 2026-08-19), por lo que el modelo puede no estar accesible para descarga.
- Es exclusivamente para coreano; no soporta otros idiomas, a diferencia del Whisper Small original que es multilingüe.
- La cuantización int8 puede introducir una degradación leve en la precisión en comparación con el modelo en fp32.
- Al ser un modelo ASR, puede sufrir alucinaciones en segmentos de audio ambiguos o con ruido, un problema conocido en Whisper.
- No se han publicado evaluaciones de sesgos o robustez en condiciones adversas (ruido, acentos regionales, etc.).
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento (AI Hub) para posibles restricciones de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ALLUCY-Rodent/whisper-small-ko
- Modelo original de SungBeom: https://huggingface.co/SungBeom/whisper-small-ko
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio GitHub de OpenAI Whisper: https://github.com/openai/whisper
- Página de referencia del modelo (aibase): https://model.aibase.com/models/details/1915693352366006274
