# 4-alokk/chatterbox-go-nano

## Resumen

chatterbox-go-nano es un paquete de grafos ONNX derivado de ResembleAI/chatterbox-nano, el modelo de síntesis de voz (TTS) de 110 millones de parámetros de Resemble AI con clonación de voz zero-shot y etiquetas paralingüísticas como `[laugh]` o `[chuckle]`. Lo publica el usuario 4-alokk empaquetado específicamente para el servidor TTS on-device "Adsorp AI" escrito en Go, que descarga los ficheros en el primer arranque y verifica su integridad mediante `manifest.json` (tamaño y SHA-256).

El modelo resuelve el problema de ejecutar TTS con clonación de voz en entornos sin GPU y sin Python: los cuatro grafos (`speech_encoder`, `embed_tokens`, `language_model` y `conditional_decoder`) se ejecutan con ONNX Runtime sobre CPU. Los pesos provienen de la conversión comunitaria owensong/chatterbox-nano-ONNX, a su vez derivada de la exportación ONNX oficial "Turbo" de Resemble, y usan precisión mixta: q4f16 en el modelo de lenguaje y el codificador de voz, embeddings en fp16 y decodificador en q4.

Es relevante ahora porque demuestra que un modelo TTS con clonación zero-shot y control paralingüístico puede caber en 570 MB y generar audio a un factor de tiempo real de 0,30 en una CPU Apple M4 Pro, lo que abre el despliegue en dispositivos de borde, aplicaciones de escritorio y servidores ligeros sin dependencia de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo basado en transformer con decodificador condicional (grafos ONNX: speech encoder, embed_tokens, language model con KV-cache, conditional decoder) |
| Parametros totales | 110 M (modelo base Chatterbox-Nano) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (language model y speech encoder), fp16 (embeddings), q4 (decoder) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime), tokenizer GPT-2 byte-level BPE en vocab.json / merges.txt / added_tokens.json |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Tamano del repo | 0,6 GB (descarga q4f16: 570 MB) |
| Modelo base | ResembleAI/chatterbox-nano |

## Arquitectura y entrenamiento

El pipeline es un TTS autoregresivo en dos etapas. Primero, el `speech_encoder` procesa un wav de referencia a 24 kHz y produce características de condicionamiento de voz; estas se concatenan con los embeddings de texto generados por `embed_tokens` (tokenizer GPT-2 byte-level BPE que incluye las etiquetas paralingüísticas). A continuación, el `language_model` genera tokens de habla de forma autorregresiva con caché KV, usando temperature 0.8, top-k 1000, top-p 0.95 y repetition penalty 1.2. Finalmente, el `conditional_decoder` convierte esos tokens de habla en audio mono a 24 kHz.

La clonación de voz se consigue ejecutando el `speech_encoder` una sola vez sobre un clip limpio de un único hablante (se recomiendan al menos 5 segundos) y reutilizando el resultado en todas las síntesis posteriores. La conversión a ONNX procede de la exportación Turbo oficial de Resemble, pasada por la conversión comunitaria de owensong, y no es una release oficial de Resemble. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz mono.
- Clonación de voz zero-shot a partir de un clip de referencia de al menos 5 segundos.
- Control paralingüístico mediante etiquetas en el texto, como `[laugh]` y `[chuckle]`.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ejecución on-device: los grafos están pensados para servidores ligeros y aplicaciones de escritorio.
- Tokenizer GPT-2 byte-level BPE con soporte de las etiquetas paralingüísticas en el vocabulario.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada distinto de la referencia de voz ni modo de razonamiento.

## Casos de uso

- Narración automática de artículos y documentos: el modelo sintetiza frases de narración con un WER medido del 5,6 % y un factor de tiempo real de 0,30 en CPU, adecuado para generar audio por lotes sin GPU.
- Lectura de contenido en aplicaciones de escritorio: al ejecutarse con ONNX Runtime en CPU, puede integrarse en un cliente de escritorio que lea texto seleccionado con una voz clonada del propio usuario.
- Audiolibros y pódcast de bajo coste: la clonación zero-shot permite mantener una voz consistente a lo largo de capítulos largos reutilizando las características del `speech_encoder` calculadas una sola vez.
- Asistentes de voz embebidos en dispositivos de borde: los 570 MB en q4f16 y la ausencia de dependencia de CUDA permiten desplegarlo en equipos con poca memoria y sin acelerador dedicado.
- Prototipado de doblaje y previsualización de voces: la inclusión de etiquetas como `[laugh]` permite generar lecturas con matices expresivos sin grabar al hablante.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de asistencia con una voz personalizada del usuario, siempre con su consentimiento.
- Pruebas de integración en pipelines Go: el manifiesto con SHA-256 y tamaños facilita la verificación de artefactos en CI y el despliegue reproducible del servidor TTS.

## Benchmarks y rendimiento

Medición publicada por el autor en el servidor Go (CPU, Apple M4 Pro, 8 hilos; 8 frases de narración; WER calculado con Whisper-base):

| Configuracion | WER | Factor de tiempo real (menor = mas rapido) |
|---|---|---|
| Nano q4f16 | 5,6 % | 0,30 |

El autor indica que la referencia Python con ONNX ofrece los mismos números dentro del ruido de medición. Se trata de un benchmark relativo pequeño y no de una afirmación absoluta de calidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no aplica en el caso documentado; la inferencia es en CPU. Para GPU, la memoria necesaria sería la de los grafos en q4f16 (unos 570 MB de pesos más las activaciones y la caché KV), aunque no se proporcionan cifras medidas.
- GPU recomendadas: no disponible; el autor solo documenta ejecución en CPU.
- CPU de referencia: Apple M4 Pro con 8 hilos, con factor de tiempo real de 0,30.
- Cabe en hardware de consumo: sí, por el tamaño de 570 MB en q4f16, aunque no se detallan mínimos de RAM ni latencias por frase.
- Opciones de despliegue: ONNX Runtime (librería declarada), servidor TTS on-device Adsorp AI en Go. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: solo se publica el factor de tiempo real de 0,30 en la configuración indicada; no hay cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| chatterbox-go-nano (este) | 110 M | no disponible | en | MIT | ONNX (q4f16/fp16/q4) | Empaquetado on-device para Go, sin watermark PerTh |
| ResembleAI/chatterbox-nano | 110 M | no disponible | en | MIT | safetensors / PyTorch (no confirmado en la informacion) | Modelo base oficial; su paquete Python aplica watermark PerTh |
| owensong/chatterbox-nano-ONNX | 110 M | no disponible | en | MIT | ONNX | Conversión comunitaria de la que derivan estos grafos |
| Chatterbox (modelo completo de Resemble) | no disponible | no disponible | en | MIT | no disponible | Versión de mayor tamaño de la familia; no se dispone de especificaciones en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Los grafos ONNX no incluyen el watermark imperceptible PerTh que aplica el paquete Python de Resemble; la salida es la forma de onda cruda del vocoder. Resemble AI pide que los despliegues mantengan el marcado de audio generado.
- Riesgo de uso indebido: no debe clonarse una voz sin permiso del hablante ni usarse para suplantar a nadie.
- Es obligatorio añadir dos tokens `<|endoftext|>` (id 50256) a cada prompt tokenizado; omitirlos corrompe las primeras palabras de la síntesis.
- La clonación requiere un clip limpio de un único hablante de al menos 5 segundos; clips ruidosos o con varios hablantes degradan la calidad.
- El WER de 5,6 % procede de un conjunto pequeño de 8 frases y no constituye una garantía de calidad general.
- No es una release oficial de Resemble: los grafos provienen de una conversión comunitaria, lo que implica menor garantía de mantenimiento y soporte.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Licencia MIT: permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.md` y respetar las condiciones de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4-alokk/chatterbox-go-nano
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Conversión ONNX de origen: https://huggingface.co/owensong/chatterbox-nano-ONNX
