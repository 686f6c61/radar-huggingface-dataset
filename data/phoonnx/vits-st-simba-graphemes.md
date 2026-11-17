# Phoonnx/vits-st-simba-graphemes

## Resumen

`Phoonnx/vits-st-simba-graphemes` es una voz de síntesis de voz (text-to-speech) en formato ONNX para la librería phoonnx, derivada del modelo `UBC-NLP/Simba-TTS-sot` entrenado por UBC-NLP. El modelo original es un VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) basado en la implementación de transformers, orientado al idioma sesoto meridional (código ISO `st`, también conocido como sotho del sur). La conversión a ONNX la firma TigreGotico Lda y no altera los pesos originales, sino que los empaqueta para inferencia ligera en CPU.

El modelo resuelve la necesidad de disponibilidad de TTS para una lengua de bajos recursos como el sesoto, con un pipeline de extremo a extremo que lee directamente los grafemas del texto sin fonemizador intermedio. Con un tamaño de repositorio de 0,2 GB y grafos de 114,3 MB en fp32 y 38,5 MB en int8, está pensado para despliegues en entornos con recursos limitados, como asistentes de voz locales (OVOS/Mycroft) o sistemas embebidos.

Es relevante ahora porque el ecosistema phoonnx está construyendo un catálogo de voces ONNX portables y porque el modelo base de UBC-NLP forma parte de los esfuerzos de la comunidad por extender la cobertura TTS a lenguas africanas. La contrapartida importante es que la licencia original deriva de MMS-TTS (CC BY-NC 4.0), por lo que el uso comercial de esta voz no está permitido pese a que el repo declare CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (implementación transformers), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por grafemas, sin ventana declarada) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic con QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | sesoto meridional (`st`) |
| Licencia | CC BY 4.0 declarada en el repo; uso comercial no permitido por herencia de MMS-TTS (CC BY-NC 4.0) |
| Formato de pesos | ONNX (`.onnx` fp32 e `_int8.onnx`) |
| Frecuencia de muestreo | 16000 Hz |
| Numero de hablantes | 1 |
| Entrada de texto | Caracteres (grafemas), sin fonemizador |
| Puntuacion | No registrada en la config; phoonnx la elimina antes de sintetizar |
| Tamano del repositorio | 0,2 GB |
| Tamano del grafo | 114,3 MB (fp32) / 38,5 MB (int8) |
| Pico de RSS | 335,8 MB (fp32) / 269,1 MB (int8) |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de extremo a extremo que combina un encoder de texto, un predictor de duraciones, un normalizing flow y un decodificador basado en HiFi-GAN, entrenado con pérdidas adversariales y de reconstrucción. En esta variante, la entrada es directamente la secuencia de caracteres del texto (grafemas), sin fonemizador ni lexicon, lo que simplifica el pipeline pero limita la generalización a la ortografía vista en entrenamiento.

El modelo original fue entrenado por UBC-NLP sobre el dataset `UBC-NLP/SimbaBench`, y según la model card upstream deriva de un ajuste fino de MMS-TTS (`facebook/mms-tts`). No se especifican en la información disponible el número de horas de audio, la composición exacta del corpus ni si se aplicaron técnicas de aumento de datos o regularización adicional. La conversión a ONNX realizada por TigreGotico no modifica los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` y se validan con una puerta de calidad que comprueba que el audio sea finito, no silencioso y que su duración esté entre 0,8 y 1,25 veces la del fp32.

## Capacidades

- Síntesis de voz mono-hablante en sesoto meridional a partir de texto plano.
- Entrada directa por grafemas, sin necesidad de fonemizador ni diccionario de pronunciación.
- Inferencia en CPU con ONNX Runtime, sin dependencia de GPU.
- Exportación fp32 e int8 para equilibrar calidad y latencia.
- Integración con phoonnx y con el plugin `ovos-tts-plugin-phoonnx` para asistentes OVOS/Mycroft.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo de pensamiento.
- Capacidad multilingüe limitada a un único idioma (`st`).
- Eliminación automática de puntuación por parte de phoonnx antes de la síntesis.

## Casos de uso

- Asistentes de voz locales en sesoto: integración como motor TTS en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, con la voz seleccionada en `mycroft.conf`; el bajo consumo de memoria (269,1 MB de pico en int8) permite ejecutarlo en dispositivos de gama baja.
- Lectura de contenidos en kiosco o señalización digital: síntesis de avisos y textos cortos en sesoto para pantallas informativas o altavoces en espacios públicos, aprovechando el RTF de 0,108 en fp32 sobre CPU de escritorio.
- Accesibilidad para personas con discapacidad visual: lectura de documentos y interfaces en sesoto en aplicaciones de escritorio o móviles, con la variante int8 para reducir el tamaño del binario embebido (38,5 MB).
- Pre-procesado de datasets de voz: generación de audio sintético en sesoto para aumento de datos en tareas de ASR o para pruebas de pipelines de audio antes de contar con grabaciones humanas.
- Prototipado de aplicaciones de voz sin GPU: al ejecutarse en CPU con ONNX Runtime, permite validar productos de voz en sesoto en portátiles y servidores sin acelerador, con un throughput de 10,0 a 12,7 caracteres por segundo en fp32.
- Investigación en TTS de bajos recursos: servir como línea base reproducible para comparar con otros sistemas TTS en sesoto, dado que el modelo es pequeño y la inferencia es determinista y barata.
- Integración en sistemas de mensajería o IVR offline: síntesis de respuestas pregrabadas dinámicamente en sesoto en entornos sin conectividad, gracias al tamaño reducido del grafo int8.

## Benchmarks y rendimiento

La model card no publica métricas de calidad perceptual (MOS, CMOS) ni comparaciones con otros sistemas TTS. Sí incluye una tabla de QA técnica medida sobre AMD Ryzen 5 7600 de 6 núcleos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 10,0 a 12,7 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,93 a 1,05 |
| Tamano del grafo | 114,3 MB | 38,5 MB |
| Pico de RSS | 335,8 MB | 269,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,108 | 0,353 |

El método de QA no emplea ASR: solo comprueba longitud y silencio sobre tres frases de FLORES-200 devtest. No se han publicado resultados de benchmarks de calidad de voz en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con ONNX Runtime.
- RAM: pico de 335,8 MB en fp32 y 269,1 MB en int8.
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- Compatibilidad con GPU de consumo: irrelevante para este modelo, ya que está diseñado para CPU.
- Despliegue: ONNX Runtime a través de phoonnx (`pip install --pre phoonnx`) o del plugin `ovos-tts-plugin-phoonnx` en OVOS/Mycroft.
- Latencia: RTF de 0,108 en fp32 con 4 hilos sobre Ryzen 5 7600; RTF de 0,353 en int8 sobre el mismo hardware, es decir, el int8 es aproximadamente 3,3 veces más lento en este equipo pese a ocupar menos memoria.
- Throughput: 10,0 a 12,7 caracteres por segundo en fp32.
- Almacenamiento: 114,3 MB (fp32) o 38,5 MB (int8) por grafo; el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-st-simba-graphemes | VITS (ONNX) | st | no disponible | no aplica | CC BY 4.0 declarada; uso comercial restringido por MMS-TTS (CC BY-NC 4.0) | ONNX fp32/int8 |
| UBC-NLP/Simba-TTS-sot | VITS (transformers) | st | no disponible | no aplica | CC BY 4.0 (upstream) | safetensors/transformers |
| facebook/mms-tts (familia) | VITS | multilingüe (incluye st) | no disponible | no aplica | CC BY-NC 4.0 | varios |

La comparación con otros sistemas TTS en sesoto (por ejemplo, modelos comerciales o de otras familias) no está disponible en la información proporcionada. La diferencia principal frente al modelo upstream es el formato (ONNX frente a transformers) y la cuantización int8, que reducen el tamaño y permiten inferencia en CPU con phoonnx.

## Limitaciones y advertencias

- Uso comercial no permitido: aunque el repo declara CC BY 4.0, el modelo upstream deriva de `facebook/mms-tts`, que es CC BY-NC 4.0; la model card indica explícitamente que el uso comercial de esta voz no está autorizado.
- Cobertura de un solo idioma (`st`) y un solo hablante; no es un modelo multilingüe.
- Entrada por grafemas sin fonemizador: la pronunciación depende de la ortografía vista en entrenamiento y puede fallar con palabras fuera de distribución, préstamos o nombres propios.
- La puntuación no está registrada en la config y phoonnx la elimina antes de sintetizar; no se puede controlar el fraseo mediante signos.
- Calidad perceptual no documentada: no hay MOS ni comparaciones subjetivas publicadas.
- La validación de calidad se limita a comprobaciones de longitud y silencio sin ASR, sobre tres frases de FLORES-200 devtest; es una garantía débil.
- El int8, aunque reduce memoria y tamaño, es más lento que el fp32 en el hardware medido (RTF 0,353 frente a 0,108).
- Riesgo de alucinación acústica (audio ininteligible o artefactos) en textos largos o con caracteres no vistos, sin mecanismo de detección integrado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- La licencia CC BY 4.0 exige atribución a UBC-NLP al usar la voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-st-simba-graphemes
- Modelo upstream: https://huggingface.co/UBC-NLP/Simba-TTS-sot
- Dataset de entrenamiento: https://huggingface.co/datasets/UBC-NLP/SimbaBench
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Sitio de TigreGotico: https://tigregotico.pt
- Modelo base de MMS-TTS: https://huggingface.co/facebook/mms-tts
