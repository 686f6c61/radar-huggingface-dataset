# samthehugenerd/daphne-kokoro-coreml

## Resumen

Daphne — Kokoro CoreML es la conversión a CoreML de un fine-tune alemán del modelo de síntesis de voz Kokoro-82M, empaquetada como una cadena de siete etapas lista para el backend `KokoroAne` de FluidAudio. El objetivo es ejecutar la síntesis íntegramente en la Neural Engine (ANE) de dispositivos Apple —iPhone, iPad, Apple Watch y Mac— sin depender de la red. El autor la describe como una voz de asistente doméstico: el checkpoint subyacente es alemán, pero el texto en inglés se lee a través de un lexicon fonético británico, lo que produce un acento británico reconocible que no se obtiene con el frontend estadounidense que FluidAudio incluye por defecto.

El modelo hereda los 82 millones de parámetros de `hexgrad/Kokoro-82M` y una arquitectura no autorregresiva: las duraciones se predicen para la cadena completa de fonemas y todos los fotogramas se generan de una vez, por lo que no hay entrega parcial dentro de una misma locución. La latencia se gestiona troceando el texto en fronteras de cláusula y arrancando la reproducción del primer fragmento mientras el resto se sintetiza por detrás.

Su relevancia ahora es doble. Por un lado, demuestra un patrón de reutilización muy eficiente: el fine-tune solo modificó los módulos `decoder` y `text_encoder`, de modo que el resto de etapas (`bert`, `bert_encoder`, `predictor`, `alignment`, `prosody`, `noise`, `tail`) se reutilizan sin modificar desde `FluidInference/kokoro-82m-coreml`, conservando además las correcciones de fase e iSTFT de FluidAudio. Por otro, expone un caso práctico de empaquetado de voces personalizadas en CoreML, aunque con un aviso importante: la licencia del fine-tune alemán original no pudo confirmarse en el momento de la publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cadena CoreML de 7 etapas no autorregresiva derivada de Kokoro-82M (módulos Albert/BERT, encoder de texto, alineamiento, predictor de prosodia, decoder, vocoder e iSTFT); la model card no detalla la familia arquitectónica exacta |
| Parámetros totales | 82 M (heredados del modelo base `hexgrad/Kokoro-82M`; no se indica un recuento específico del fine-tune) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica. Entrada de texto convertida a fonemas en su totalidad antes de la síntesis; no hay ventana de contexto ni generación incremental |
| Tipos de cuantización | No disponible. Los vectores de estilo se almacenan en fp32; no se especifica la precisión de los `.mlmodelc` |
| Idiomas soportados | Etiqueta `en`. Síntesis de texto inglés leída mediante G2P británico (`gb_gold` + `gb_silver` de misaki); el checkpoint subyacente es un fine-tune alemán (51 hablantes, corpus HUI). No se confirma soporte de texto en alemán |
| Licencia | Apache-2.0 para este repositorio. La licencia del fine-tune alemán intermedio no pudo confirmarse en el momento de la subida |
| Formato de pesos | CoreML (`.mlmodelc`, 5 etapas reutilizadas + 2 convertidas) y vector de estilo `bf_alice.bin` en fp32 |
| Tamaño del repositorio | 0,1 GB |
| Librería / runtime | `fluidaudio` (backend `KokoroAne`) |
| Modelo base | `hexgrad/Kokoro-82M` |

## Arquitectura y entrenamiento

La cadena se compone de siete etapas. Dos de ellas, `KokoroPostAlbert.mlmodelc` y `KokoroVocoder.mlmodelc`, se convirtieron específicamente desde este fine-tune porque el entrenamiento movió los módulos `decoder` y `text_encoder`. Las otras cinco —`KokoroAlbert`, `KokoroAlignment`, `KokoroProsody`, `KokoroNoise_v2` y `KokoroTail_v2`— proceden sin modificar de `FluidInference/kokoro-82m-coreml`, ya que el fine-tune dejó `bert`, `bert_encoder` y `predictor` bit a bit idénticos al modelo original. Las etapas `Noise` y `Tail` son independientes del hablante, así que la reutilización conserva también las correcciones de fase y de iSTFT implementadas en FluidAudio.

El modelo no es autorregresivo: predice las duraciones para la cadena completa de fonemas y genera todos los fotogramas de una vez. En consecuencia, no hay streaming intra-locución y el tiempo hasta el primer audio depende de trocear el texto en fronteras de cláusula y de iniciar la reproducción del primer fragmento mientras los siguientes se sintetizan. No se publican en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La información de procedencia indica que el fine-tune alemán (51 hablantes, corpus HUI) se publicó como `junkstage/kokoro-deutsch-hui-base`, ya retirado del Hub, y que la conversión a CoreML sigue el trabajo de `laishere/kokoro-coreml`.

La receta de voz es inseparable del modelo: hay que aplicar tres cosas conjuntamente o el hablante resultante cambia de forma perceptible. Primero, G2P británico mediante el lexicon `gb_gold` + `gb_silver` de misaki instalado como lexicon personalizado, que se consulta antes que el estadounidense incluido en FluidAudio (solo las palabras fuera de vocabulario caen al respaldo americano). Segundo, `speed = 1/1.1` en la síntesis. Tercero, reproducir el búfer de 24 kHz a 26400 Hz; como Kokoro no tiene control de tono, el tono se aplica por remuestreo y se pide al modelo `speed / pitch` para devolver la duración a su valor original, lo que resulta en un +10 % de tono al tempo original. Reinterpretar el búfer de 24 kHz a 26400 Hz es bit a bit idéntico a `resample_poly(y, 10, 11)` y no necesita filtro, por lo que no arrastra estado entre fragmentos.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con acento británico, obtenida mediante G2P británico sobre un checkpoint alemán.
- Ejecución local en la Apple Neural Engine de iPhone, iPad, Apple Watch y Mac, sin conexión de red.
- Generación no autorregresiva con predicción global de duraciones y generación de todos los fotogramas en una sola pasada.
- Streaming por troceado en fronteras de cláusula: el primer fragmento se reproduce mientras el resto se sintetiza.
- Control de velocidad de habla mediante el parámetro `speed` (la receta usa `1/1.1`).
- Control indirecto de tono mediante remuestreo (`resample_poly(y, 10, 11)` o reinterpretación del búfer a 26400 Hz) combinado con el ajuste de `speed`.
- Vector de estilo de hablante conmutable a nivel de fichero (`bf_alice.bin`), con layout plano `[510, 256]` fp32 donde `[0..<128]` es `style_timbre` y `[128..<256]` es `style_s`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada, clonación de voz a partir de muestras ni multilingüismo.

## Casos de uso

- Asistente doméstico por voz en dispositivo: el modelo está diseñado explícitamente como voz de asistente y se ejecuta en la ANE, de modo que las respuestas se sintetizan sin salir del dispositivo ni enviar texto a un servicio remoto.
- Lectura de notificaciones y contenido en Apple Watch: al residir en un repositorio de 0,1 GB y ejecutarse en la ANE, encaja en el presupuesto de memoria y energía de un reloj, sin necesidad de conexión.
- Aplicaciones de accesibilidad y lectores de pantalla en iOS/iPadOS/macOS: el TTFA de 0,12 s medido en un M4 Pro y el troceado por cláusulas permiten empezar a leer casi de inmediato textos largos.
- Asistentes conversacionales locales con síntesis encadenada: la latencia por fragmento (0,08–0,15 s por cada 1,5–3 s de audio) permite mantener una conversación fluida cuando el texto se genera por cláusulas.
- Kioscos, terminales de punto de venta y electrodomésticos con Apple Silicon: la inferencia local elimina la dependencia de conectividad y de costes de API de TTS en la nube.
- Videojuegos y aplicaciones interactivas con diálogo dinámico: la generación no autorregresiva y la velocidad de ~20× tiempo real en M4 Pro permiten sintetizar líneas bajo demanda dentro del bucle de juego.
- Despliegue de voces personalizadas derivadas de Kokoro: el caso demuestra el flujo completo (fine-tune, conversión selectiva de las etapas afectadas, reutilización de las invariantes e integración en FluidAudio) para llevar variantes de voz a CoreML.
- Investigación en prosodia y acento: sirve como banco de pruebas para medir el efecto de cambiar el lexicon G2P (británico frente a americano) y de manipular tono y velocidad por remuestreo sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye mediciones de latencia y velocidad realizadas por el autor en un Apple M4 Pro:

| Métrica | Valor reportado | Condiciones |
|---|---|---|
| Velocidad de síntesis | 8–20× tiempo real | Apple M4 Pro |
| Tiempo por fragmento | 0,08–0,15 s para 1,5–3 s de audio (~20× tiempo real) | Respuesta de cinco cláusulas, M4 Pro |
| Time-to-first-audio (TTFA) | 0,12 s | Frente a un presupuesto por fragmento de 2,4 s; solo el primer fragmento está en la ruta crítica |
| MMLU, HumanEval, GSM8K u otros | No aplica / no disponible | Modelo de síntesis de voz |

## Requisitos de hardware

- No requiere VRAM dedicada: el modelo se ejecuta en la Apple Neural Engine y usa memoria unificada en dispositivos Apple Silicon.
- Hardware soportado explícitamente: iPhone, iPad, Apple Watch y Mac con ANE.
- Tamaño del repositorio: 0,1 GB, lo que permite almacenarlo en dispositivos con poco espacio.
- Rendimiento medido: 8–20× tiempo real en un Apple M4 Pro; no se publican cifras para A-series, S-series ni otros chips.
- GPU NVIDIA/CUDA: no soportado; el formato `.mlmodelc` es específico del ecosistema CoreML.
- Cabe en GPUs de consumo orientadas a Apple Silicon (todos los Mac con Neural Engine); no aplica a GPUs de consumo x86/NVIDIA.
- Opciones de despliegue: FluidAudio con el backend `KokoroAne` (Swift, `KokoroAneManager`); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo CoreML de TTS.
- El vector de estilo debe colocarse en el slot `bf_alice` porque FluidAudio valida los nombres de voz contra una lista fija en tiempo de compilación; un nombre personalizado se rechaza.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Daphne — Kokoro CoreML | 82 M (base Kokoro-82M) | No aplica (TTS no autorregresivo) | 8–20× tiempo real en M4 Pro; TTFA 0,12 s (medido por el autor) | Apache-2.0 en el repo; licencia del fine-tune alemán sin confirmar | CoreML `.mlmodelc` + `bf_alice.bin`; repositorio de 0,1 GB |
| hexgrad/Kokoro-82M | 82 M | No aplica | No disponible | Apache-2.0 | Pesos PyTorch en HuggingFace; modelo base de esta conversión |
| FluidInference/kokoro-82m-coreml | 82 M | No aplica | No disponible en la información proporcionada | No disponible | CoreML; aporta cinco de las siete etapas reutilizadas sin modificar |

No se dispone de datos de benchmarks comparativos entre estas opciones, por lo que la comparación se limita a parámetros, formato, licencia y procedencia.

## Limitaciones y advertencias

- La licencia del fine-tune alemán subyacente (`junkstage/kokoro-deutsch-hui-base`, 51 hablantes, corpus HUI) no pudo confirmarse y el repositorio original ya no está en el Hub. Aunque este repositorio declare Apache-2.0, la cadena de derechos del modelo derivado es incierta y supone un riesgo para uso comercial.
- El modelo no funciona de forma aislada: la voz depende de aplicar simultáneamente el lexicon G2P británico, `speed = 1/1.1` y la reproducción a 26400 Hz. Omitir cualquiera de los tres produce un hablante claramente distinto.
- El lexicon británico es imprescindible; sin él, el frontend estadounidense incluido en FluidAudio cambia el acento. Las palabras fuera de vocabulario caen al respaldo americano.
- Kokoro no dispone de control de tono nativo: el tono se simula por remuestreo, lo que limita el rango y la precisión del ajuste.
- No hay streaming dentro de una locución: las duraciones se predicen para toda la cadena de fonemas y todos los fotogramas se generan a la vez. La percepción de baja latencia depende del troceado manual por cláusulas.
- El único vector de estilo incluido ocupa el slot `bf_alice` como solución provisional, porque FluidAudio valida los nombres de voz contra una lista fija. Es una dependencia frágil ante cambios en esa validación.
- Solo se documenta síntesis en inglés (etiqueta `en`); no se confirma que el modelo pronuncie correctamente texto en alemán pese a que el checkpoint es un fine-tune alemán.
- No se documentan sesgos de voz, y al tratarse de un único vector de estilo no hay diversidad de hablantes más allá de cambiar el fichero de estilo.
- Riesgo de alucinación acústica: como en cualquier TTS, la fonemización de texto ambiguo (siglas, números, nombres propios) puede producir pronunciaciones incorrectas.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, con lo que no existe validación independiente de la calidad de la voz ni de la estabilidad del empaquetado.
- Las cifras de latencia proceden únicamente del autor y de un solo dispositivo (M4 Pro); no hay mediciones en iPhone, iPad ni Apple Watch.

## Enlaces

- [samthehugenerd/daphne-kokoro-coreml en HuggingFace](https://huggingface.co/samthehugenerd/daphne-kokoro-coreml)
- [hexgrad/Kokoro-82M (modelo base)](https://huggingface.co/hexgrad/Kokoro-82M)
- [FluidInference/kokoro-82m-coreml (etapas reutilizadas)](https://huggingface.co/FluidInference/kokoro-82m-coreml)
- [FluidAudio (repositorio del backend KokoroAne)](https://github.com/FluidInference/FluidAudio)
- [misaki (lexicons G2P `gb_gold` y `gb_silver`)](https://github.com/hexgrad/misaki)
- [laishere/kokoro-coreml (conversión de referencia)](https://github.com/laishere/kokoro-coreml)
- `junkstage/kokoro-deutsch-hui-base`: fine-tune alemán citado como origen, ya no disponible en el Hub.

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
