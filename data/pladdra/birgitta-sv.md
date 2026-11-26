# Pladdra/birgitta-sv

## Resumen

Birgitta es una voz sintética en sueco integrada dentro de un modelo TTS multi-hablante de tipo VITS/Piper, destilado a partir de modelos maestros de mayor tamaño. La desarrolla el usuario Pladdra y se publica bajo licencia Apache-2.0 en Hugging Face. Su objetivo es ofrecer síntesis de voz en sueco de calidad razonable en entornos donde un modelo de 300 MB resulta inviable: dispositivos embebidos, servidores sin GPU o aplicaciones de baja latencia. El modelo ocupa 23 MB en su variante recomendada (int8 por canal con decodificador en fp32) y se ejecuta en ONNX Runtime sobre CPU.

Técnicamente es un modelo VITS de aproximadamente 17 millones de parámetros, con salida mono a 22,05 kHz, identificado como el hablante 12 dentro de un modelo Piper multi-hablante. La innovación principal no está en la arquitectura, sino en el pipeline de destilación a nivel de secuencia: parte del modelo sueco de KB-Lab (`kb-st-24000`, CC0) como warm start y utiliza como maestros Kokoro-SV (Apache-2.0) y Audio8-TTS-Realistic, este último clonando la voz Birgitta. El estudiante solo ve audio, nunca los pesos de los maestros.

La relevancia actual reside en su relación calidad/tamaño/velocidad: alcanza un 4,1 % de word error rate (medido con KB-Whisper-large) y un UTMOS de 3,86 con solo 23 MB, y corre a unas 56 veces tiempo real con 4 hilos en CPU. Para desarrolladores que necesitan TTS en sueco sin GPU, es una opción práctica y con licencia permisiva para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), modelo multi-hablante con hablante id 12 |
| Parametros totales | ~17 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | int8 por canal (decodificador en fp32), int8 por canal, int8 por tensor, fp32 |
| Idiomas soportados | sueco (sv); inserción de palabras en inglés con fonemización específica |
| Licencia | Apache-2.0 (pesos, checkpoint, scripts y léxicos); dependencia `piper-tts`/espeak-ng es GPL-3 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json`), checkpoint de entrenamiento `.ckpt` (fp32) |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo de texto a voz de tipo end-to-end que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador basado en GAN. El modelo es multi-hablante y Birgitta corresponde al hablante 12. La salida es mono a 22,05 kHz. El front-end de texto incluye normalización (`normalize.py` para números, unidades, abreviaturas y matemáticas) y un fonemizador sueco basado en espeak-ng a través de `piper-tts`, con capas de corrección mediante léxicos (`lexicon/`) y detección de palabras en inglés.

El entrenamiento se realizó por destilación a nivel de secuencia en cuatro etapas. El punto de partida es el modelo sueco de KB-Lab (`kb-st-24000`, CC0). Los maestros son Kokoro-SV (Apache-2.0, 12 voces, entrenado con datos CC0) y Audio8-TTS-Realistic (Apache-2.0) clonando la voz Birgitta (hablantes "A8" y "A8L"). Los datos consisten en decenas de miles de frases en sueco escritas por un LLM, más oleadas específicas de nombres, topónimos, préstamos, palabras con sj/tj e inserciones en inglés; cada clip se transcribe con KB-Whisper-large y se descarta si el error de palabra es alto. La mezcla final incluye aproximadamente 140 h de clips Audio8/A8L y unos 20 000 clips de Kokoro Ebba para pronunciación. El entrenamiento es VITS estándar desde el warm start; la última etapa ajusta solo el codificador de texto y el predictor de duración durante 6 000 pasos (`--train-only enc_p,dp`, decodificador congelado). Los pesos se promedian entre checkpoints (`avguw`) y la cuantización es post-entrenamiento int8 por canal, dejando el decodificador en fp32.

## Capacidades

- Síntesis de voz en sueco a 22,05 kHz mono, con una única voz (Birgitta, hablante 12).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Normalización de texto: números, unidades, abreviaturas y expresiones matemáticas.
- Fonemización sueca con corrección mediante léxico editable (`lexicon/user-fix.tsv`, `wsp-fix.tsv`, `name-approved.tsv`).
- Detección y fonemización de palabras en inglés dentro de frases suecas; también se pueden marcar manualmente con corchetes (`[meeting]`).
- Ajuste de prosodia mediante parámetros de inferencia: `noise_scale`, `noise_w` y `length_scale`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.
- No es un modelo de lenguaje: no genera texto, solo audio a partir de texto.

## Casos de uso

- Lectura de notificaciones y alertas en sistemas embebidos: con 23 MB y ejecución en CPU, el modelo cabe en dispositivos con recursos limitados y sintetiza mensajes cortos en sueco con latencia baja (unas 56 veces tiempo real con 4 hilos).
- Asistentes de voz locales para domótica: al no requerir GPU ni conexión a servicios externos, permite integrar TTS en un Raspberry Pi o mini-PC y mantener la privacidad de las interacciones.
- Accesibilidad para personas con discapacidad visual: lectura de textos en sueco en aplicaciones de escritorio o móviles, con normalización de números y unidades que evita errores de pronunciación en datos como fechas o importes.
- Generación de audiolibros o contenido narrado en sueco: el modelo procesa frases de forma independiente y permite concatenar segmentos; el ajuste de `length_scale` a 1,15 produce una cadencia más natural según las pruebas ciegas del autor.
- Doctores y anuncios automáticos en transporte público: síntesis de paradas y avisos con pronunciación corregida de topónimos mediante el léxico editable, adecuada para entornos de producción con CPU.
- Pruebas de integración continua de pipelines de voz: al ser un modelo pequeño y determinista con parámetros de ruido controlables, sirve como referencia en tests automáticos de sistemas TTS sin consumir GPU.
- Prototipado rápido de interfaces conversacionales en sueco: permite validar flujos de voz antes de invertir en modelos mayores, con la posibilidad de reentrenar o ajustar el checkpoint incluido (288 MB) para adaptar la voz.

## Benchmarks y rendimiento

Calidad automática medida sobre 300 frases de test. El word error rate se obtiene con KB-Whisper-large y la naturalidad con UTMOS (escala 1-5). Son diagnósticos automáticos, no valoraciones humanas.

| Variante | Tamano | Word error | UTMOS |
|---|---|---|---|
| pcdec (recomendada) | 23 MB | 4,1 % | 3,86 |
| int8 por canal | 20 MB | 4,3 % | 3,77 |
| int8 por tensor | 20 MB | 4,9 % | 3,78 |
| fp32 | 67 MB | 3,9 % | 3,86 |
| Kokoro-SV Ebba (referencia, otro modelo) | 114 MB int8 | 4,0 % | 3,98 |

En 147 palabras difíciles aisladas (nombres, sonidos sj/tj), Birgitta se acerca más a la lectura del propio autor que Kokoro-SV Ebba (DTW de palabra 0,160 frente a 0,180; menor es mejor). El ruido entre ejecuciones es de aproximadamente ±0,5 pp, por lo que diferencias inferiores a 1 pp no son fiables.

Velocidad medida en un portátil con Apple Silicon y ONNX Runtime 1.31, sobre unos 25 s de texto, mejor de 3 ejecuciones (RTFx = veces más rápido que tiempo real):

| Variante | MB | 4 hilos | 1 hilo |
|---|---|---|---|
| fp32 | 67 | 49x | 16x |
| int8 | 20 | 81x | 34x |
| int8pc | 20 | 80x | 34x |
| pcdec | 23 | 56x | 19x |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con ONNX Runtime.
- Memoria RAM estimada: no disponible de forma explícita, pero el modelo pesa entre 20 y 67 MB según la variante, por lo que el consumo es mínimo.
- GPU recomendadas: no aplica; el autor midió en CPU (Apple Silicon). fp16 en ONNX no cargó en el proveedor de CPU.
- Cabe en cualquier GPU de consumo, pero no es necesario usarla; también cabe en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (probado con la versión 1.31), `piper-tts==1.8.0` como dependencia del fonemizador, y el Space incluido (`1-space/`) con el front-end de texto.
- Latencia y throughput: aproximadamente 56x tiempo real con 4 hilos en la variante pcdec, 81x en int8, 49x en fp32 y 19x en pcdec con 1 hilo. Los números dependen del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (word error / UTMOS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Birgitta (pcdec) | ~17 M | no aplica | 4,1 % / 3,86 | Apache-2.0 | Hugging Face, ONNX |
| Kokoro-SV Ebba | no disponible | no aplica | 4,0 % / 3,98 | Apache-2.0 (según el autor) | Hugging Face, 114 MB int8 |
| KB-Lab `kb-st-24000` (base) | no disponible | no aplica | no disponible | CC0 | Hugging Face, Piper |
| Audio8-TTS-Realistic (maestro) | no disponible | no aplica | no disponible | Apache-2.0 | no disponible |

Birgitta es aproximadamente 5 veces más pequeña que Kokoro-SV Ebba en su variante int8 y obtiene una calidad automática ligeramente inferior, aunque en palabras difíciles se acerca más a la referencia del autor. El modelo base de KB-Lab es el punto de partida del entrenamiento y no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- La melodía es más plana que el habla natural: la dispersión de tono es de 2,3 semitonos frente a unos 3,6 de un lector humano, y no reproduce el acento de palabra 2.
- Las frases completamente en inglés son más débiles que las suecas.
- Los nombres poco habituales pueden pronunciarse mal; se corrigen añadiendo entradas IPA al léxico.
- El ruido entre ejecuciones es de ±0,5 pp, por lo que las diferencias de calidad inferiores a 1 pp no son fiables.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la fonemización puede producir pronunciaciones incorrectas en palabras fuera del léxico.
- La licencia Apache-2.0 cubre pesos, checkpoint, scripts y léxicos, pero la dependencia `piper-tts`/espeak-ng es GPL-3, lo que puede afectar a la distribución de productos que la incluyan.
- El modelo solo soporta sueco; no es multilingüe más allá de inserciones puntuales en inglés.
- No dispone de control de prosodia a nivel de palabra ni de emoción; los parámetros de inferencia son globales.
- El autor indica que varias estrategias de mejora no funcionaron (más oleadas de Audio8, ajuste del flujo, mezcla de hablantes), lo que sugiere un plateau de calidad en esta arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pladdra/birgitta-sv
- Modelo base KB-Lab `kb-st-24000`: no disponible en la información proporcionada
- Kokoro-SV: no disponible en la información proporcionada
- Audio8-TTS-Realistic: no disponible en la información proporcionada
- Piper: no disponible en la información proporcionada
- ONNX Runtime: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
