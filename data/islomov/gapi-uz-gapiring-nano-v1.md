# islomov/gapi-uz-gapiring-nano-v1

## Resumen

Gapiring Nano v1 es un modelo de síntesis de voz (text-to-speech) para uzbeko desarrollado por el autor islomov bajo el paraguas del proyecto Gapiring. Se trata de un modelo extremadamente compacto: 4,8 millones de parámetros (4.770.959 exactos) en un único fichero ONNX de 30,7 MB en float32, capaz de generar audio mono a 24 kHz con una única voz femenina (`f1`) de tono neutro. Su propuesta de valor es clara: llevar TTS en uzbeko a entornos sin GPU, sin servidor y sin conexión, como placas SBC, kioscos, terminales, páginas web o aplicaciones móviles.

El modelo resuelve el problema de la ausencia de soluciones de síntesis de voz ligeras para uzbeko, un idioma con recursos limitados en el ecosistema de IA. Frente a su hermano mayor Gapiring Edge, Nano sacrifica expresividad (no hay roles, emociones ni estilos) a cambio de un tamaño drásticamente reducido y una velocidad muy alta: aproximadamente 50 veces más rápido que tiempo real en un solo hilo de CPU y más de 100 veces en cuatro hilos, medido en un Intel Core i5-13600KF con onnxruntime 1.23.2 sobre 243 segundos de audio. En navegador, una frase de 5,7 segundos se sintetiza en unos 0,2 segundos mediante WebAssembly en un solo hilo.

La relevancia actual del modelo radica en su formato ONNX portable y su licencia permisiva (CC BY 4.0 para pesos y diccionario, MIT para el código), que permiten uso comercial sin restricciones y despliegue en el borde (edge computing). No obstante, es un modelo de nicho: solo soporta uzbeko en alfabeto latino y requiere normalización de texto externa para números, fechas, importes y palabras en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en diseño de tiny-voca; detalles de capas no publicados) |
| Parametros totales | 4,8 M (4.770.959) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512 tokens por pasada (entrada de texto); hasta 32 s de audio por pasada |
| Tipos de cuantizacion | No disponible (el fichero publicado es float32 ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Uzbeko (alfabeto latino) |
| Licencia | CC BY 4.0 (pesos y diccionario); MIT (código); diseño basado en tiny-voca (Apache-2.0) |
| Formato de pesos | ONNX (`nano.onnx`, float32, 30,7 MB) + `nano.json` (vocabulario/configuración) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de que el diseño del modelo y parte del runtime provienen de tiny-voca (proyecto Apache-2.0 de n4ze3m). Se trata, por tanto, de una arquitectura TTS compacta orientada a inferencia en el borde, exportada a ONNX para ejecución con onnxruntime, onnxruntime-web (WebAssembly) y runtimes JavaScript. El grafo expone entradas explícitas: `tokens` (int64 [1, N], ids entre `<bos>` y `<eos>` con `<sp>` como separador de palabras), `stress` (int64 [1, N], relleno de ceros), `voice` (int64 [1], valor 0), `speed` (float32 [1], 1.0 por defecto, mayor es más rápido), `pitch_shift` (float32 [1], 0.0) y `pitch_range` (float32 [1], 1.0). Las salidas son `audio` (float32 [1, samples]) y `durations` (int64 [1, N]).

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación principal es de ingeniería: comprimir un TTS funcional en 4,8 M de parámetros con calidad inteligible y un rendimiento de 50-100x tiempo real en CPU. El modelo no transmite audio en streaming dentro de una misma emisión: genera la locución completa en una pasada, de modo que el sonido comienza al terminar dicha pasada. Los runtimes trocean textos largos en grupos de frases. El proyecto incluye además un normalizador de texto y un diccionario de lecturas de palabras inglesas (`lexicon/en_uz.tsv`, 565 mil lecturas) que se anteponen al modelo solo en la librería Python; dicho diccionario tarda unos 5 s y consume unos 400 MB de memoria al cargarse.

## Capacidades

- Síntesis de voz en uzbeko (latino) con una única voz femenina (`f1`) de tono neutro.
- Salida de audio mono a 24 kHz en float32.
- Control de velocidad mediante el parámetro `speed` (mayor es más rápido); en la librería Python, `pace="slow"` o `pace="fast"`.
- Control de tono mediante `pitch_shift` y `pitch_range` en el grafo ONNX.
- Inferencia en CPU sin GPU, en navegador vía WebAssembly y en Node.
- Normalización de texto en la librería Python (números, fechas, importes y palabras inglesas escritas tal cual).
- Streaming a nivel de grupos de frases (troceado por el runtime), no dentro de una misma emisión.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente (no es un LLM).
- No soporta visión, audio de entrada ni otras modalidades.
- No dispone de roles, estilos, emociones ni voces múltiples (a diferencia de Gapiring Edge y Large).

## Casos de uso

- Kioscos y terminales interactivos sin conexión: el modelo puede sintetizar avisos y respuestas en uzbeko directamente en el dispositivo, sin GPU ni servidor, gracias a sus 30,7 MB y su velocidad de 50-100x tiempo real en CPU. Ejemplo típico de la model card: "Markaziy terminal oldidagi avtoturargohda hozirda qirq ikkita bo'sh joy mavjud".
- Sistemas de gestión de turnos y colas: anuncios como "Operator bilan bog'lanish uchun kuting, siz navbatda ikki o'rinda turibsiz" generados al vuelo en terminales de bajo coste.
- Accesibilidad web: integración en una página mediante `gapiring` (npm) y WebAssembly para leer contenido en uzbeko a usuarios con discapacidad visual, con latencia de ~0,2 s por frase de 5,7 s en Chrome de escritorio.
- Aplicaciones móviles y de escritorio offline: empaquetar el fichero ONNX en la app para dar respuestas habladas en uzbeko sin depender de la nube, útil en zonas con conectividad limitada.
- Asistentes de voz para placas SBC (Raspberry Pi y similares): el modelo cabe en memoria y se ejecuta en CPU, aunque el autor advierte que aún no ha medido cifras en este tipo de dispositivos.
- Lectura de textos largos por frases: usando `tts.stream(long_text, pace="slow")` en Python, se pueden narrar documentos o artículos troceando por grupos de frases y reproduciendo cada fragmento conforme se genera.
- Anuncios públicos en transporte o comercio: mensajes pregrabados o dinámicos en uzbeko para megafonía local, con control de velocidad para adaptarse al ritmo deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, WER, etc.) en la información disponible. Los únicos datos de rendimiento publicados son de velocidad, medidos en un Intel Core i5-13600KF con onnxruntime 1.23.2 sobre 243 s de habla:

| Metrica | Valor |
|---|---|
| Velocidad en 1 hilo de CPU | ~50x tiempo real |
| Velocidad en 4 hilos de CPU | >100x tiempo real |
| Frase de 5,7 s en navegador (Chrome, WebAssembly, 1 hilo) | ~0,2 s |
| Tamano del fichero | 30,7 MB (float32 ONNX) |
| Parametros | 4.770.959 |
| Frecuencia de muestreo | 24 kHz mono |

El autor indica que solo se han medido cifras en CPU de escritorio; no hay datos para teléfonos ni placas SBC.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y no requiere GPU.
- GPU recomendadas: no aplica (no se documenta soporte GPU ni es el objetivo del modelo).
- Cabe en cualquier GPU de consumidor y, más relevante, en CPU de escritorio, portátiles, SBC y navegador.
- Memoria: el fichero ONNX ocupa 30,7 MB; el diccionario opcional de lecturas inglesas consume unos 400 MB al cargarse y tarda unos 5 s, por lo que se recomienda omitirlo en dispositivos pequeños cuando el texto no contenga palabras inglesas.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador, WebAssembly), Node.js, y las librerías `gapiring` (Python, a partir de 0.2.0) y `gapiring` (npm). También se puede usar el runtime incluido en `runtime/nano_onnx.py` y `runtime/web/`.
- Latencia y throughput: ~50x tiempo real en 1 hilo de CPU y >100x en 4 hilos (i5-13600KF); ~0,2 s para una frase de 5,7 s en Chrome con WebAssembly y un hilo. Sin datos para móviles ni SBC.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/limite | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gapiring Nano v1 | 4,8 M | 512 tokens / 32 s por pasada | Uzbeko | CC BY 4.0 (pesos), MIT (codigo) | ONNX en Hugging Face |
| Gapiring Edge | No disponible | No disponible | Uzbeko | No disponible en la informacion | Hugging Face (islomov/gapi-uz-gapiring-v1) |
| Gapiring Large | No disponible | No disponible | Uzbeko | No disponible en la informacion | No disponible en la informacion |
| tiny-voca | No disponible | No disponible | No disponible | Apache-2.0 | GitHub (n4ze3m/tiny-voca) |

La comparación se limita a la familia Gapiring y al proyecto del que deriva el diseño, ya que no se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos. Gapiring Nano se posiciona como la variante más pequeña y rápida de la familia, con timbre más plano que Gapiring Edge y sin roles ni emociones, que sí ofrecen Edge y Large.

## Limitaciones y advertencias

- Solo lee uzbeko escrito en alfabeto latino. Números, fechas e importes deben escribirse como palabras; la ortografía inglesa no se lee como inglés.
- La normalización de texto y el diccionario de lecturas inglesas solo están disponibles en la librería Python; en JavaScript y con los ficheros en bruto hay que hacerlo manualmente.
- Una única voz (`f1`) y un único tono neutro: sin roles, estilos ni emociones.
- Generación no streaming dentro de una emisión: el audio empieza cuando termina la pasada completa, lo que añade latencia perceptible en locuciones largas.
- Límite de 512 tokens y 32 s por pasada; los runtimes trocean textos largos en grupos de frases.
- No hay datos publicados de calidad de voz (MOS, inteligibilidad medida) ni de sesgos; al ser un modelo entrenado con datos no documentados, existe riesgo de sesgos de pronunciación no caracterizados.
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fuera del dominio.
- El diccionario de lecturas inglesas consume ~400 MB de memoria y ~5 s de carga, lo que puede ser problemático en dispositivos con recursos muy limitados.
- Licencia CC BY 4.0 permite uso comercial con atribución ("Gapiring Nano by Gapi"); el código es MIT. El diseño y parte del runtime provienen de tiny-voca (Apache-2.0), cuyos términos deben respetarse.
- Solo se han medido cifras de rendimiento en CPU de escritorio; el comportamiento en móviles y SBC no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islomov/gapi-uz-gapiring-nano-v1
- Modelo hermano Gapiring Edge: https://huggingface.co/islomov/gapi-uz-gapiring-v1
- Proyecto tiny-voca (diseño base): https://github.com/n4ze3m/tiny-voca
- Ejemplos de audio: https://huggingface.co/islomov/gapi-uz-gapiring-nano-v1/resolve/main/examples/parking.mp3 y https://huggingface.co/islomov/gapi-uz-gapiring-nano-v1/resolve/main/examples/queue.mp3
- Librería Python `gapiring`: disponible vía `pip install gapiring` (a partir de 0.2.0)
- Librería JavaScript `gapiring`: disponible vía `npm install gapiring`
