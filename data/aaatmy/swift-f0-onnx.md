# aaatmy/swift-f0-onnx

## Resumen

SwiftF0 es un modelo de estimación de frecuencia fundamental (F0) para audio monofónico, orientado a voz cantada y a uso en tiempo real. Lo desarrolla Lars Nieradzik y se distribuye como parte del paquete `swift-f0` 0.3.0 en PyPI; el repositorio que nos ocupa es un espejo comunitario creado por Hikari Tsai (`aaatmy`) que publica el fichero `model.onnx` original, copiado byte a byte, sin recuantizar ni reexportar. Resuelve el problema clásico del seguimiento de pitch (afinadores, corrección tonal, transcripción melódica, análisis de prosodia) con un modelo de apenas 135 KB que cabe en cualquier dispositivo y funciona sobre CPU.

Frente a alternativas basadas en autocorrelación o en redes convolucionales de decenas de millones de parámetros, SwiftF0 apuesta por una huella mínima: un grafo ONNX de 135.090 bytes, opset 18, que consume audio mono a 16 kHz y emite una estimación de F0 cada 16 ms (256 muestras), junto con una puntuación de confianza para separar tramas sonoras de no sonoras. El rango declarado va de 46,875 Hz a 2.093,75 Hz, con límites configurables mediante los tensores escalares `fmin` y `fmax`.

Su relevancia práctica está en el despliegue: al ser un único fichero ONNX de 135 KB y licencia MIT, se puede ejecutar en navegador con `onnxruntime-web`, en un móvil o en una placa embebida, sin GPU ni framework de deep learning. La contrapartida es que solo admite entrada monofónica y necesita unos 176 ms de lookahead para cerrar cada trama, por lo que no sirve para polifonía ni para aplicaciones de latencia estrictamente cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la model card; se distribuye como grafo ONNX opset 18, IR version 10) |
| Parámetros totales | no disponible de forma explícita; el fichero ONNX ocupa 135.090 bytes, lo que implica del orden de 3,3 × 10^4 pesos si todos fuesen float32 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; procesa audio mono a 16 kHz con una trama cada 16 ms (256 muestras) y requiere ~176 ms de lookahead para que una trama sea definitiva |
| Tipos de cuantización | no disponible; el espejo solo incluye el `model.onnx` original en float32, sin variantes cuantizadas ni reexportadas |
| Idiomas soportados | no disponible; es un modelo de audio, no de texto, y la model card no detalla la composición lingüística del entrenamiento |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, IR version 10), fichero único `model.onnx` de 135.090 bytes con verificación SHA-256 |

Interfaz de entrada y salida (según la model card):

| Tensor | Dirección | dtype / forma | Notas |
|---|---|---|---|
| `audio` | entrada | float32 `[1, samples]` | mono, 16.000 Hz, amplitud en -1..1 |
| `fmin` | entrada | float32 escalar | límite inferior de pitch en Hz; cota del modelo: 46,875 Hz |
| `fmax` | entrada | float32 escalar | límite superior de pitch en Hz; cota del modelo: 2.093,75 Hz |
| `pitch` | salida | float64 `[1, frames]` | F0 en Hz por trama |
| `confidence` | salida | float32 `[1, frames]` | trama considerada sonora cuando >= 0,5 |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna del modelo: la model card del espejo se limita a reproducir el contrato de E/S y a remitir al repositorio original y al artículo «SwiftF0: Fast and Accurate Monophonic Pitch Detection» (arXiv:2508.18440, Nieradzik, 2025) para los detalles de arquitectura, preprocesado de referencia y restricciones de `fmin`/`fmax`. Lo que sí se puede afirmar con los datos aportados es el diseño funcional: entrada de audio monocanal remuestreado a 16 kHz, salida densa a nivel de trama con paso fijo de 256 muestras (16 ms, equivalente a 62,5 tramas por segundo), una rama de pitch en Hz y una rama de confianza para la decisión sonoro/no sonoro.

Tampoco se detallan en la información proporcionada el volumen de datos de entrenamiento, la composición del corpus (se etiqueta como `singing-voice`, lo que sugiere predominio de voz cantada), ni si hubo ajuste fino con RLHF/DPO u otras técnicas de alineación, algo por otra parte poco habitual en un estimador de F0. El paquete upstream sí documenta el preprocesado de referencia (remuestreo, mezcla a mono y ganancia para entradas muy silenciosas), que es obligatorio replicar para obtener resultados coherentes con el modelo.

## Capacidades

- Estimación de F0 por trama para audio monofónico, con salida en Hz y resolución temporal de 16 ms.
- Detección de sonoridad (voiced/unvoiced) mediante el tensor `confidence` y un umbral de referencia de 0,5.
- Rango de pitch configurable en tiempo de inferencia a través de `fmin` y `fmax`, acotado por el modelo a 46,875–2.093,75 Hz (aproximadamente Fa#1 a Do7).
- Funcionamiento en tiempo real o cuasi tiempo real con ~176 ms de lookahead, adecuado para streaming por bloques.
- Ejecución ligera sobre CPU mediante ONNX Runtime, y potencialmente en navegador con `onnxruntime-web` al ser un único fichero ONNX.
- Reproducibilidad y verificación de integridad: el repositorio incluye `manifest.json` y `SHA256SUMS` con los hashes del wheel de origen y del modelo.
- No soporta generación de texto, código, matemáticas, visión, tool calling, uso como agente ni capacidades multilingües: es exclusivamente un extractor de pitch.

## Casos de uso

- Afinadores instrumentales y vocales: con 62,5 estimaciones por segundo y una latencia de análisis de ~176 ms, el modelo ofrece la resolución suficiente para indicar la desviación en cents de una cuerda o de una nota cantada, ejecutándose en el propio dispositivo sin GPU.
- Corrección de pitch en producción musical: integrado en una cadena de audio (por ejemplo, un plugin o un script offline) que lea el F0 por trama y aplique desplazamiento tonal; el rango 46,875–2.093,75 Hz cubre la práctica totalidad de voces humanas e instrumentos melódicos.
- Visualización de pitch en aplicaciones de karaoke, clases de canto o entrenamiento vocal: la pareja `pitch` + `confidence` permite dibujar una curva de altura estable y silenciar tramas no sonoras sin post-procesado complejo.
- Transcripción melódica a MIDI: convertir la secuencia de F0 en eventos de nota (con segmentación por cambios de altura y umbral de confianza) para generar bocetos de partitura o líneas melódicas a partir de grabaciones monofónicas.
- Análisis de prosodia en investigación del habla: extracción masiva de contornos de F0 en corpus de audio para estudios de entonación, emoción o variación dialectal, con la ventaja de que un modelo de 135 KB se puede ejecutar en paralelo sobre muchos núcleos de CPU.
- Herramientas interactivas y arte sonoro: instalaciones, juguetes o instrumentos MIDI que sigan la voz en vivo, desplegando el `.onnx` en una Raspberry Pi o en el navegador del visitante mediante WebAssembly.
- Monitorización de calidad vocal o logopedia: seguimiento de estabilidad tonal y de la proporción de tramas sonoras a lo largo de una sesión, usando `confidence` como métrica auxiliar de voz sostenida.
- Preprocesado para pipelines de conversión de voz o síntesis cantada: generar contornos de F0 alineados por trama (16 ms) para modelos que requieran pitch de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas (ni error en cents, ni comparativas con CREPE, pYIN o RMVPE) y remite al artículo arXiv:2508.18440 para los resultados del autor, que no se han podido consultar en esta búsqueda. Los resultados de búsqueda web obtenidos no contienen información técnica utilizable sobre el modelo.

## Requisitos de hardware

- VRAM: no aplica en el caso general; el modelo se ejecuta en CPU. El fichero ONNX ocupa 135 KB, por lo que el peso en memoria es despreciable frente al búfer de audio y a las estructuras de ONNX Runtime (típicamente decenas de MB de overhead del runtime).
- GPU recomendadas: ninguna necesaria. Cualquier GPU (A100, H100, RTX 4090, GTX 1650 o integradas) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU dado el tamaño del grafo.
- Cabe en cualquier GPU de consumo, en móviles y en placas embebidas; también en el navegador vía `onnxruntime-web` (WebAssembly o WebGPU).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JS), `onnxruntime-web` para navegador, y el paquete upstream `swift-f0` 0.3.0 de PyPI. No hay pesos GGUF ni integración directa con llama.cpp, vLLM, TGI u Ollama, que están orientados a modelos de lenguaje.
- Throughput y latencia: no disponibles como cifra medida. Por diseño, la salida es de 62,5 tramas por segundo y el modo streaming exige ~176 ms de lookahead; el coste por trama es muy bajo, pero no se han publicado mediciones de tiempo de inferencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / trama | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwiftF0 (este modelo) | Estimador de F0 monofónico en ONNX | no disponible explícito (~3,3 × 10^4 pesos estimados por tamaño de fichero) | trama de 16 ms, 16 kHz mono, rango 46,875–2.093,75 Hz | MIT | ONNX en Hugging Face (espejo comunitario) y wheel en PyPI |
| CREPE | CNN sobre espectrograma, con variantes de tamaño | no disponible en la información proporcionada (dato externo no verificado en esta búsqueda) | ventana de análisis de 1.024 muestras a 16 kHz con paso configurable | MIT (según el proyecto original, no verificado aquí) | Repositorio GitHub y ports a TensorFlow/PyTorch |
| pYIN | Algoritmo probabilístico clásico (sin pesos neuronales) | no aplica | trama configurable, implementación habitual a 16 kHz o 44,1 kHz | ISC (licencia de librosa, no verificada aquí) | Implementado en librosa |
| RMVPE | Red neuronal para extracción de pitch, orientada a conversión de voz | no disponible | trama configurable, habitualmente 16 kHz | no disponible en la información proporcionada | Repositorios de la comunidad RVC |

La comparación cuantitativa (error en cents, precisión en voz cantada, velocidad) no está disponible en la información proporcionada; para una evaluación rigurosa habría que consultar las tablas del artículo arXiv:2508.18440 y contrastarlas con la literatura de CREPE y pYIN.

## Limitaciones y advertencias

- Solo audio monofónico: no está diseñado para polifonía, acordes ni mezclas con varias fuentes simultáneas.
- Rango acotado a 46,875–2.093,75 Hz; las notas por debajo o por encima de esos límites no se pueden recuperar aunque se pidan valores fuera de rango en `fmin`/`fmax`.
- Requiere 16 kHz mono con amplitud en -1..1; usar otra frecuencia de muestreo o no aplicar el preprocesado de referencia (remuestreo, mezcla a mono, ganancia para entradas silenciosas) degrada los resultados.
- Latencia de análisis de ~176 ms en modo streaming: no es apto para aplicaciones que exijan latencia cercana a cero.
- El umbral de 0,5 para `confidence` es una referencia; en entornos ruidosos habrá que calibrarlo por aplicación.
- Riesgo de error en señales con ruido, vibrato extremo, ataques muy rápidos o cambios de octava; la información disponible no cuantifica estos fallos.
- Sesgos desconocidos: se desconoce la composición del corpus de entrenamiento (el tag `singing-voice` sugiere predominio de voz cantada), por lo que el rendimiento en habla, instrumentos de viento o cuerdas graves no está documentado.
- Este repositorio es un espejo comunitario, no oficial, con 0 descargas y 0 likes; el autor del modelo no lo respalda. La referencia canónica es el repositorio de Lars Nieradzik y el paquete de PyPI.
- Integridad: conviene verificar los hashes con `shasum -a 256 -c SHA256SUMS` (o `sha256sum -c` en Linux) antes de desplegar, ya que el espejo no añade más garantías que los checksums publicados.
- Licencia MIT: permite uso comercial y modificación siempre que se conserve el aviso de copyright y la atribución a Lars Nieradzik; no hay cláusulas de uso aceptable más allá de las del texto MIT.

## Enlaces

- Hugging Face (espejo comunitario): https://huggingface.co/aaatmy/swift-f0-onnx
- Repositorio upstream: https://github.com/lars76/swift-f0
- Paquete PyPI `swift-f0` 0.3.0: https://pypi.org/project/swift-f0/0.3.0/
- Artículo: Lars Nieradzik (2025), «SwiftF0: Fast and Accurate Monophonic Pitch Detection», arXiv:2508.18440 — https://arxiv.org/abs/2508.18440
