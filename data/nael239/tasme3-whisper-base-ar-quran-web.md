# nael239/tasme3-whisper-base-ar-quran-web

## Resumen

tasme3-whisper-base-ar-quran-web es una exportación ONNX cuantizada a 8 bits del modelo tarteel-ai/whisper-base-ar-quran, publicada por el usuario nael239 para ejecutar reconocimiento automático de recitación coránica directamente en el navegador mediante transformers.js. El modelo original lo desarrolló Tarteel AI sobre la arquitectura Whisper base de OpenAI (un transformer encoder-decoder con aproximadamente 74 millones de parámetros) y está especializado en árabe y en texto coránico. Esta versión web mantiene los pesos sin cambios más allá de la cuantización dinámica y añade una modificación práctica en el encoder para aceptar ventanas mel más cortas que los 30 segundos fijos de Whisper.

La relevancia de esta ficha radica en dos factores. Por un lado, demuestra un patrón de despliegue en el cliente (edge inference) para tareas de ASR especializado, con un tamaño total de repositorio de 0,1 GB y dos ficheros ONNX de 23 MB (encoder) y 80 MB (decoder). Por otro, introduce una optimización concreta sobre el encoder de Whisper que reduce el coste de cómputo en clips cortos, algo crítico en dispositivos móviles. El modelo forma parte de la aplicación gratuita de memorización coránica تسميع (Tasme3) y se distribuye con licencia Apache 2.0.

No se dispone de información sobre el proceso de entrenamiento original más allá de lo indicado en la model card, ni de resultados de benchmarks estándar (MMLU, etc.), dado que se trata de un modelo de ASR y no de un LLM generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parámetros totales | no disponible (Whisper base: aproximadamente 74 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio configurable; el encoder acepta ventanas mel más cortas que los 30 s fijos de Whisper (mínimo 1000 frames) |
| Tipos de cuantización | 8 bits dinámica (pesos), exportación ONNX |
| Idiomas soportados | Árabe (ar), orientado a texto coránico |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |
| Librería de despliegue | transformers.js |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | tarteel-ai/whisper-base-ar-quran |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper base, un transformer encoder-decoder con atención estándar y preprocesado de audio en espectrogramas mel. El modelo original fue entrenado por Tarteel AI para reconocimiento de recitación coránica en árabe; la model card de esta exportación no detalla el volumen de datos, la composición del dataset ni si hubo etapas de ajuste fino adicionales sobre Whisper. Tampoco se documenta el uso de RLHF o DPO, algo esperable en un modelo de ASR y no de generación de texto.

La innovación técnica destacable de esta exportación es la modificación del encoder para aceptar ventanas mel de longitud variable por debajo de los 30 segundos fijos de Whisper: las posiciones se recortan a la longitud de la ventana, de modo que unos pocos segundos de recitación cuestan unos pocos segundos de cómputo. Según el autor, esto mantiene la precisión y resulta aproximadamente 3 veces más rápido en teléfonos. Además, la cuantización dinámica a 8 bits reduce el peso de los dos ficheros ONNX a 23 MB y 80 MB respectivamente. No se han modificado los pesos más allá de la cuantización.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en recitación coránica.
- Transcripción de audio a texto con correspondencia contra el texto oficial KFGQPC (según el matcher de la aplicación).
- Inferencia en el navegador mediante transformers.js y ONNX Runtime Web, sin servidor.
- Procesamiento de clips cortos de forma eficiente gracias a la ventana mel variable (mínimo 1000 frames).
- Ejecución en dispositivos móviles con cuantización de 8 bits.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Aplicaciones de memorización coránica: la app Tasme3 compara la recitación del usuario con el texto oficial y detecta errores de palabra; el modelo es adecuado por su especialización en árabe coránico y su ejecución local.
- Verificación de recitación en el navegador: al ejecutarse con transformers.js, permite validar fragmentos cortos sin enviar audio a un servidor, lo que reduce latencia y preserva la privacidad del usuario.
- Herramientas educativas offline: el tamaño de 0,1 GB y la cuantización de 8 bits permiten cargar el modelo en dispositivos con recursos limitados y usarlo sin conexión tras la primera descarga.
- Transcripción de clips breves de audio árabe: la ventana mel variable hace viable procesar unos pocos segundos de audio con un coste de cómputo proporcional, útil en interfaces de práctica guiada.
- Investigación en ASR de dominio específico: sirve como punto de partida para estudiar el rendimiento de Whisper base cuantizado en árabe coránico y comparar con el modelo original.
- Integración en aplicaciones web progresivas (PWA): el formato ONNX y la librería transformers.js facilitan el despliegue en el cliente sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

El autor reporta una evaluación propia con 48 aleyas y 4 recitadores, puntuada contra el texto oficial KFGQPC con el matcher de la aplicación:

| Modelo | Tasa de errores por palabra |
|---|---|
| tasme3-whisper-base-ar-quran-web (8 bits) | 14,2 % |
| tarteel-ai/whisper-base-ar-quran (original) | 14,1 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es coherente con la naturaleza de ASR del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los ficheros ONNX suman aproximadamente 103 MB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y en navegador mediante ONNX Runtime Web.
- ¿Cabe en GPU de consumo? Sí, por tamaño; también en dispositivos móviles y navegadores de escritorio.
- Opciones de despliegue: transformers.js (principal), ONNX Runtime Web; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para este formato.
- Latencia y throughput: el autor indica aproximadamente 3 veces más rápido en teléfonos con ventanas cortas frente al comportamiento con la ventana fija de 30 s; no se proporcionan cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tasme3-whisper-base-ar-quran-web | no disponible (base Whisper, aprox. 74 M) | Ventana mel variable, mínimo 1000 frames | 14,2 % WER en evaluación propia (48 aleyas, 4 recitadores) | Apache 2.0 | Hugging Face, ONNX |
| tarteel-ai/whisper-base-ar-quran | no disponible (base Whisper, aprox. 74 M) | 30 s fijos | 14,1 % WER en la misma evaluación | Apache 2.0 | Hugging Face |
| Whisper base original (OpenAI) | aprox. 74 M | 30 s fijos | No disponible en la información proporcionada para árabe coránico | MIT | Hugging Face, múltiples formatos |

No se dispone de datos comparativos adicionales con otros modelos de ASR árabe en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para recitación coránica en árabe; su rendimiento en árabe conversacional o en otros dialectos no está documentado y probablemente sea inferior.
- Tasa de errores del 14,2 % por palabra en la evaluación del autor, medida con un conjunto reducido (48 aleyas, 4 recitadores); la generalización a otros recitadores y estilos no está validada.
- La cuantización a 8 bits puede introducir degradaciones adicionales en casos límite, aunque el autor reporta una diferencia mínima frente al original (14,2 % frente a 14,1 %).
- No se documentan sesgos específicos, pero al derivar de Whisper base podría heredar sesgos acústicos y lingüísticos del entrenamiento original.
- Riesgo de alucinación en la transcripción: como todo modelo de ASR, puede generar texto plausible que no corresponde al audio, especialmente con ruido o recitación atípica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a Tarteel AI y revisar las condiciones del modelo base.
- La modificación del encoder para ventanas cortas es una alteración del comportamiento estándar de Whisper; los usuarios deben pasar `input_features` recortados a la longitud del clip (mínimo 1000 frames) para obtener el beneficio de velocidad.
- No hay soporte documentado para otras tareas distintas del ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nael239/tasme3-whisper-base-ar-quran-web
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- transformers.js: https://github.com/huggingface/transformers.js
