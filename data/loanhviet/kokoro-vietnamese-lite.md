# loanhviet/Kokoro-Vietnamese-Lite

## Resumen

Kokoro-Vietnamese-Lite es un modelo de síntesis de voz (text-to-speech) en vietnamita, destilado del modelo contextboxai/Kokoro-Vietnamese por el desarrollador loanhviet. Se distribuye como un único fichero ONNX cuantizado a int8 de 9,2 MB con dos voces integradas en los pesos (una femenina y una masculina), lo que elimina la necesidad de cargar voicepacks externos. Su propósito es ofrecer síntesis de voz en vietnamita con una huella mínima y velocidad superior al tiempo real en el navegador, incluso con un solo hilo de CPU.

El modelo resuelve el problema del coste computacional y de almacenamiento de los sistemas TTS neuronales en entornos web y de cliente ligero. Frente a los 326 MB en fp32 (163 MB en fp16) del modelo profesor, esta versión reduce el tamaño en más de un orden de magnitud y mejora el factor de tiempo real (RTF) de 1,50 a 0,075 en WebAssembly con un hilo, medido sobre onnxruntime-web 1.30 en un Intel i5-12500H. Es la voz por defecto de OpenDubber, una extensión de Chrome que dobla vídeos en otros idiomas al vietnamita durante la reproducción.

La arquitectura subyacente es la de Kokoro (modelo TTS neuronal ligero, originalmente de hexgrad), destilada mediante el método Paradee hacia una variante más estrecha pero con la misma arquitectura. El modelo base Kokoro-82M tiene 82 millones de parámetros; el tamaño exacto de esta variante destilada no se especifica en la información disponible. La longitud de contexto está limitada a 512 tokens de entrada, con fragmentación en trozos de hasta 510 tokens en el frontend.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro (TTS neuronal) destilado, decoder d224 con cabecera espectral y etapa GAN |
| Parámetros totales | no disponible (el profesor Kokoro-82M tiene 82 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (T ≤ 512); fragmentación en trozos de hasta 510 tokens |
| Tipos de cuantización | int8 (única versión distribuida); el profesor dispone de fp32 y fp16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8), 9,2 MB |
| Frecuencia de muestreo de salida | 24 kHz, mono, float32 |
| Voces integradas | 2 (voice 0 = diem_trinh, femenina; voice 1 = duc_duy, masculina) |
| Entradas | input_ids (int64 [1,T]), speed (float32 [1]), voice (int64 [1]) |
| Salidas | waveform (float32, 24 kHz), durations (frames por token, 600 muestras cada uno) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kokoro, un sistema TTS neuronal ligero, y se ha obtenido por destilación siguiendo el método Paradee (Apache-2.0): se destila el modelo profesor en una red más estrecha con la misma arquitectura. La parte de texto cubre duración, F0 y energía para dos voces, y se añade una cabecera decoder d224 entrenada primero con pérdida espectral y después con una etapa GAN. El modelo se inicializó a partir del estudiante anterior de una sola voz (E7). No hay entrada de estilo ni `ref_s`, ya que las voces están embebidas en los pesos.

Los datos de entrenamiento consisten en aproximadamente 97.000 clips sintetizados por Kokoro-Vietnamese con ambas voces, de los cuales 1.452 se descartaron tras un control de calidad por ASR con PhoWhisper. Los textos mezclan vietnamita general, términos técnicos, nombres y versiones, números, preguntas y líneas reales de subtítulos de vídeo, en las dos voces. El estudiante se entrenó sobre los token ids producidos por el frontend TypeScript incluido en el repositorio, que normaliza texto vietnamita (números, unidades, términos en inglés mezclados), consulta el diccionario de fonemas SEA-G2P (Apache-2.0, revisión `e825173f`) y fragmenta el texto en trozos de hasta 510 tokens. La exportación final es int8; la versión fp32 obtiene aproximadamente 0,12 puntos más de UTMOS.

## Capacidades

- Síntesis de voz en vietnamita a partir de texto, con salida mono a 24 kHz.
- Dos voces integradas seleccionables por índice: femenina (`diem_trinh`, voice 0) y masculina (`duc_duy`, voice 1).
- Control de velocidad mediante el parámetro `speed` (1,0 = velocidad normal); las pausas de puntuación se reducen según speed³ cuando speed > 1.
- Normalización de texto vietnamita: números, unidades y términos en inglés mezclados.
- Fonemización mediante diccionario SEA-G2P (descarga separada); se puede usar otro fonemizador que emita los mismos símbolos IPA, con pérdida de calidad si difiere.
- Ejecución en navegador mediante onnxruntime-web con backend WASM, sin dependencias en el frontend.
- Inferencia más rápida que el tiempo real en un solo hilo de CPU (RTF 0,075 en Intel i5-12500H).
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Doblaje de vídeo en tiempo real en el navegador: es la voz por defecto de OpenDubber, una extensión de Chrome que dobla vídeos en otros idiomas al vietnamita mientras se reproducen; el RTF de 0,075 permite generar audio más rápido que la reproducción en un solo hilo.
- Síntesis de voz en aplicaciones web sin backend: el modelo de 9,2 MB se carga como fichero ONNX en el cliente y se ejecuta con onnxruntime-web, evitando costes de servidor y latencia de red.
- Lectura de contenido en voz alta en vietnamita: artículos, subtítulos o interfaces de usuario, con dos voces para alternar según el contexto o el locutor.
- Audiolibros y narración de texto largo: el frontend fragmenta el texto en trozos de hasta 510 tokens y el modelo devuelve duraciones por token, lo que facilita la concatenación de segmentos y la sincronización.
- Asistentes de voz locales para dispositivos con recursos limitados: el tamaño int8 y la ejecución en CPU sin GPU permiten integrarlo en entornos de cliente ligero o embebidos.
- Accesibilidad y lectores de pantalla para vietnamita: síntesis rápida y de baja huella para convertir texto de la interfaz en audio en tiempo real.
- Prototipado y demos de TTS en vietnamita: el modelo es pequeño, de licencia Apache-2.0 y con frontend sin dependencias, lo que simplifica su integración en pruebas de concepto.

## Benchmarks y rendimiento

El conjunto de test tiene 1.008 elementos congelados que nunca se usaron para entrenamiento ni selección de modelo. La tabla compara la voz femenina (int8) con el estudiante anterior E7 y el profesor.

| Conjunto | CER E7 | CER este modelo | Diferencia CER con profesor | UTMOS E7 / este modelo |
|---|---|---|---|---|
| Todos (1008) | 3,75 | 3,61 | +0,41 | 2,35 / 2,32 |
| Nombres y versiones | 12,47 | 10,99 | no disponible | 2,26 / 2,26 |
| Líneas largas | 1,52 | 1,44 | no disponible | 1,98 / 1,96 |

- Contorno tonal: en pares mínimos de tono, el error de F0 frente al profesor es de 56 cents, frente a 75 de E7.
- Voz masculina frente a su profesor: CER 3,29 vs 2,99 y UTMOS 2,92 vs 3,63.
- Eficiencia: RTF 0,075 en WASM con un hilo (onnxruntime-web 1.30, Intel i5-12500H), frente a 1,50 del profesor; tamaño 9,2 MB int8 frente a 326 MB fp32 / 163 MB fp16 del profesor.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para ejecución en CPU (WASM) y su tamaño int8 de 9,2 MB cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no aplica; no se documentan requisitos de GPU. Puede ejecutarse en CPU de un solo hilo.
- Cabe en cualquier GPU consumer y en CPU de portátiles convencionales; el benchmark de referencia usa un Intel i5-12500H.
- Opciones de despliegue: onnxruntime-web (WASM) en navegador; ONNX Runtime en servidor o cliente nativo; cualquier runtime compatible con ONNX.
- Latencia y throughput: RTF 0,075 en WASM con un hilo, es decir, aproximadamente 13 veces más rápido que el tiempo real en esa configuración. No se documentan cifras para otras configuraciones.
- Cada llamada devuelve unos 200 ms de silencio en cada extremo; OpenDubber los recorta a 50 ms.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | Idiomas | Licencia | Formato | RTF (WASM, 1 hilo) |
|---|---|---|---|---|---|---|
| Kokoro-Vietnamese-Lite (este) | 9,2 MB int8 | 512 tokens | vi | Apache-2.0 | ONNX | 0,075 |
| contextboxai/Kokoro-Vietnamese (profesor) | 326 MB fp32 / 163 MB fp16 | no disponible | vi | Apache-2.0 | no disponible | 1,50 |
| hexgrad/Kokoro-82M | 82 M parámetros | no disponible | multilingüe (según variante) | Apache-2.0 | no disponible | no disponible |

El profesor ofrece 14 voicepacks frente a las 2 voces integradas de esta versión, pero es entre 18 y 35 veces más grande y unas 20 veces más lento en la configuración medida. Kokoro-82M es el modelo original del que deriva la familia; no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Voz masculina: en escucha, incluido uso en producción, suena cercana al profesor, pero la F0 mediana es más alta (160 Hz frente a 143 Hz) y la banda de 1–2 kHz es 1,6 dB más débil.
- Naturalidad: por debajo del profesor, con una brecha de UTMOS de −0,48 para la voz femenina.
- Pausas: pueden sonar poco naturales.
- Texto difícil: números, URLs e identificadores de código se leen con menos fiabilidad que el texto plano.
- Datos del hablante: el origen de los datos del hablante y de entrenamiento del profesor es el que declare el proyecto upstream; este repositorio no añade ninguna garantía adicional.
- Idioma: solo vietnamita; no hay soporte multilingüe.
- Contexto limitado a 512 tokens de entrada, con fragmentación necesaria para textos largos.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribución a contextboxai/Kokoro-Vietnamese (revisión `9f210d62`) y a hexgrad/Kokoro-82M.
- El frontend requiere descargar por separado el diccionario SEA-G2P; el uso de otro fonemizador puede degradar la calidad si los símbolos IPA difieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loanhviet/Kokoro-Vietnamese-Lite
- Modelo profesor: https://huggingface.co/contextboxai/Kokoro-Vietnamese
- Modelo original Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Método Paradee: https://github.com/sahilmahendrakar/paradee
- Diccionario SEA-G2P: https://github.com/pnnbao97/sea-g2p
- Demo / producto OpenDubber: https://dubber.loanhviet.dev
