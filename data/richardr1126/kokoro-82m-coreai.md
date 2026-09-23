# richardr1126/Kokoro-82M-CoreAI

## Resumen

Kokoro-82M-CoreAI es una exportación del modelo de síntesis de voz Kokoro-82M (arquitectura StyleTTS2 + iSTFTNet, 82 millones de parámetros) al formato `.aimodel` de Apple Core AI, dirigida a iOS 27 y macOS 26. La publica el desarrollador richardr1126, autor de OpenReader iOS, un lector de documentos que ejecuta la síntesis íntegramente en el dispositivo. El problema que aborda no es de modelado, sino de despliegue: hasta ahora no existía una exportación funcional de Kokoro a Core AI, y la receta comunitaria (desenrollar las LSTM bidireccionales en 128 celdas enmascaradas) produce grafos enormes y lentos.

La exportación parte el grafo acústico en tres bundles de forma fija (predictor de 80 MB, prosodia de 36 MB y vocoder de 204 MB) y deja en el host los pasos dependientes de la longitud: el G2P de misaki, la expansión de duración a alineamiento y la generación de armónicos (`f0_upsamp` → SineGen → STFT). Su innovación principal es sustituir el desenrollado por una reescritura exacta basada en un mapa de índices involutivo y una única pasada unidireccional, lo que reduce el coste de especialización en un iPhone 15 Pro (A17 Pro) de 96,6 s a 58,7 s en CPU y de 69,8 s a 35,0 s en GPU.

Es relevante porque demuestra TTS neuronal de 82 M de parámetros a 10 veces tiempo real en hardware móvil, con licencia Apache 2.0, 0,3 GB de pesos y un pipeline verificable numéricamente contra PyTorch (correlación de forma de onda entre 0,9820 y 0,9917).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (predictor con LSTM bidireccional + módulo de prosodia) con vocoder iSTFTNet; grafo dividido en tres bundles de forma fija |
| Parámetros totales | 82 M (heredados de hexgrad/Kokoro-82M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica como contexto de texto: buckets fijos de 128 tokens de fonema y 512 frames, equivalentes a 12,8 s de audio por pasada |
| Tipos de cuantización | Ninguna declarada en los pesos; el Neural Engine computa internamente en fp16 (no validado numéricamente) y los pasos de host (SineGen/STFT) requieren fp32 |
| Idiomas soportados | Inglés (`en`), único idioma declarado en esta exportación |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI), tres bundles: `kokoro_predictor.aimodel` (80 MB), `kokoro_prosody.aimodel` (36 MB), `kokoro_vocoder.aimodel` (204 MB); exportados desde PyTorch (`kokoro-v1_0.pth`) con `torch.export` / `coreai-torch` |

## Arquitectura y entrenamiento

No se describe entrenamiento propio: es una reexportación de los pesos `kokoro-v1_0.pth` del modelo base, por lo que la calidad acústica es la de Kokoro-82M. El pipeline se corta en el único punto con longitud dependiente de los datos, la expansión de duración a alineamiento (`L = sum(pred_dur)`), en lugar de hacerse dinámico. Las tres etapas son: predictor (`input_ids[1,128]`, `ref_s[1,256]`, `attn_mask[1,128]` → `duration`, `d[1,128,640]`, `t_en[1,512,128]`), prosodia (`d`, `t_en`, `aln`, `ref_s`, `frame_mask` → `asr[1,512,512]`, `F0[1,512]`, `N[1,512]`) y vocoder (`asr`, `F0`, `N`, `har`, `ref_s`, `frame_mask` → audio de 24 kHz). Entre etapas, el host aplica `pred_dur = round(duration).clamp(min=1)`, un alineamiento one-hot `aln[1,128,512]`, `f0_upsamp` → SineGen → STFT para obtener `har[1,22,512]`.

La innovación técnica destacable es el tratamiento de las LSTM bidireccionales. Una LSTM bidireccional fusionada es incorrecta con relleno a la derecha, porque la pasada inversa arranca dentro del padding y acumula estado antes de llegar a un token real. En lugar de desenrollar 128 celdas enmascaradas (correcto pero costoso, ya que el coste de especialización escala con el programa y no con los pesos), esta exportación recoge la secuencia mediante un mapa de índices que invierte las primeras *n* posiciones y deja el padding donde está, ejecuta una LSTM unidireccional y vuelve a recoger con el mismo mapa, que es una involución. Son dos operaciones `lstm` en lugar del equivalente a 256 celdas de aritmética. Además, la exportación llama directamente a `torch._VF.lstm` con pesos preexistentes, porque construir un `nn.LSTM` dentro de la región trazada introduce `aten.uniform` vía `reset_parameters()` y `coreai-torch` se niega a bajarlo a Core AI.

Medido en un iPhone 15 Pro (A17 Pro) con iOS 27.0 y caché de especialización vacía, el efecto sobre el coste de especialización es: CPU 96,6 s → 58,7 s, GPU 69,8 s → 35,0 s, Neural Engine 107,1 s → 49,6 s. El vocoder actúa como control (no contiene LSTM, es el bundle mayor) y apenas se movió, de 1,37 s a 1,31 s, mientras que el predictor cayó un 51 %.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con audio de salida a 24 kHz.
- Ejecución íntegra en el dispositivo en iOS 27 y macOS 26, sin llamadas a servicios externos.
- Reproducción de voz mediante vectores de estilo (`ref_s`, 256 dimensiones); en la verificación se usan las voces `af_heart` y `bm_george`.
- Modelado de duración, prosodia (F0 y ruido N) y generación de armónicos en etapas separadas, lo que permite asignar cada una a una unidad de cómputo distinta (CPU, GPU o Neural Engine).
- Procesamiento por lotes implícito: cada pasada rellena un bucket de 512 frames (12,8 s de audio), reutilizable para segmentos cortos agrupados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión; no es un modelo de lenguaje.
- Multilingüismo: no disponible en esta exportación (solo `en`).

## Casos de uso

- Lectura de documentos por voz en aplicaciones iOS: es el caso original de OpenReader iOS; el modelo convierte el texto de un documento en audio sin salir del dispositivo, lo que evita enviar contenido sensible a la nube y elimina la dependencia de red.
- Accesibilidad para personas con discapacidad visual: la integración en lectores permite narrar artículos, libros o PDF a 10 veces tiempo real en un iPhone 15 Pro, con 1,28 s de cómputo por cada 12,8 s de audio.
- Audiolibros y narración offline: la ventana fija de 512 frames (12,8 s) encaja con la segmentación natural por párrafos; conviene agrupar fragmentos cortos porque un encabezado de dos palabras consume el mismo bucket que una frase larga.
- Avisos y notificaciones habladas con privacidad estricta: aplicaciones de salud, finanzas o mensajería que no pueden enviar texto a un servidor pueden generar la locución localmente.
- Aprendizaje de inglés como lengua extranjera: la cobertura declarada es únicamente inglesa, y la salida a 24 kHz con prosodia modelada (F0 y N explícitos) sirve para practicar pronunciación y lectura guiada.
- Navegación y asistentes de voz en entornos sin conectividad: vehículos, zonas rurales o entornos industriales donde se requiere síntesis local y determinista.
- Validación de exportaciones en CI: el script `export_kokoro.py --verify` compara el grafo exportado con `KModel.forward_with_tokens` de PyTorch y permite automatizar la comprobación de regresiones numéricas antes de publicar un bundle.
- Prototipado de pipelines TTS por etapas en macOS: al ser tres bundles independientes con `preferredComputeUnitKind` por modelo, sirve para experimentar con reparto de carga entre CPU, GPU y Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de TTS (MOS, WER, RTF comparativo entre modelos) en la información disponible. Sí se incluyen dos conjuntos de medidas: verificación numérica frente a PyTorch y latencias por etapa en un iPhone 15 Pro.

Verificación frente al Kokoro de PyTorch (`KModel.forward_with_tokens`) con los mismos pesos `kokoro-v1_0.pth`:

| Texto | Voz | Duración | Correlación magspec | Correlación forma de onda |
|---|---|---|---|---|
| "Hello, world. This is a test of on device speech generation." | af_heart | 4,50 s | 0,9994 | 0,9820 |
| "Chapter One" | af_heart | 1,57 s | 0,9994 | 0,9917 |
| "The Metamorphosis" | af_heart | 1,82 s | 0,9994 | 0,9896 |
| "It was a bright cold day in April, and the clocks were striking thirteen." | bm_george | 5,25 s | 0,9993 | 0,9824 |

Coste de especialización (caché vacía, iPhone 15 Pro, A17 Pro, iOS 27.0):

| Unidad de cómputo | Receta desenrollada | Esta exportación |
|---|---|---|
| CPU | 96,6 s | 58,7 s |
| GPU | 69,8 s | 35,0 s |
| Neural Engine | 107,1 s | 49,6 s |

Latencia por etapa y por unidad, excluyendo los pasos de host:

| Etapa | CPU | GPU | ANE |
|---|---|---|---|
| Predictor | 52,2 ms | 125,2 ms | 115,7 ms |
| Prosodia | 21,2 ms | 102,6 ms | 91,7 ms |
| Vocoder | 1225,5 ms | 2349,6 ms | 1139,4 ms |
| Pipeline | 1299 ms | 2577 ms | 1347 ms |
| Respecto a tiempo real | 9,9× | 5,0× | 9,5× |

Asignación mixta recomendada por etapa (la unidad se elige una sola vez, en la especialización):

| Etapa | Unidad | Especialización en frío | Inferencia |
|---|---|---|---|
| Predictor | CPU | 19,1 s | 52,2 ms |
| Prosodia | ANE | 15,6 s | 91,7 ms |
| Vocoder | ANE | 1,5 s | 1139,4 ms |
| Total | | 36,1 s | 1283 ms (10,0× tiempo real) |

## Requisitos de hardware

- Huella de pesos: unos 320 MB en total (80 MB de predictor, 36 MB de prosodia y 204 MB de vocoder); el repositorio ocupa 0,3 GB.
- Requiere Apple Core AI, disponible en iOS 27 y macOS 26. No es ejecutable en Android, Linux ni Windows en este formato.
- Hardware validado: iPhone 15 Pro con chip A17 Pro. No se han publicado pruebas en otros SoC ni Macs.
- Cabe en hardware de consumo por definición: el destino es el propio teléfono; no se documentan requisitos de VRAM en GPU de escritorio porque el formato `.aimodel` no se despliega en ellas.
- Asignación óptima: predictor en CPU, prosodia y vocoder en Neural Engine. Usar la GPU es la peor opción en ejecución (2577 ms por pasada frente a 1299 ms en CPU) aunque sea la mejor en carga inicial.
- Coste de arranque: 36,1 s de especialización en frío con la asignación mixta; las cargas segunda y posteriores tardan 1-4 ms porque la especialización se cachea por dispositivo y versión de sistema operativo.
- Throughput: 1283 ms por cada 12,8 s de audio, es decir, 10,0× tiempo real. Renunciar a la GPU ahorra 1,1 s en el primer arranque y duplica el rendimiento.
- Opciones de despliegue: Apple Core AI (`.aimodel`) mediante `coreai-torch` y `torch.export`; el G2P de misaki se ejecuta en el host. vLLM, llama.cpp, Ollama y TGI no aplican a este formato ni a esta tarea.
- Latencia y throughput en servidor: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Límite de longitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-CoreAI (este) | 82 M | `.aimodel` Core AI, 3 bundles (320 MB) | 512 frames (12,8 s) por pasada, buckets fijos | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| hexgrad/Kokoro-82M (upstream, PyTorch) | 82 M | Pesos PyTorch (`kokoro-v1_0.pth`) | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace, modelo base de esta exportación |
| Receta comunitaria de exportación a Core AI (LSTM desenrollada) | 82 M | `.aimodel`, 128 celdas LSTM desenrolladas en el grafo | no disponible en la información proporcionada | no disponible en la información proporcionada | Receta citada como referencia por el autor; no se enlaza |

Alternativas de TTS en dispositivo de otras familias (Piper sobre ONNX Runtime, `AVSpeechSynthesizer` de Apple): no se dispone de datos comparativos de parámetros, contexto ni rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Los buckets de forma fija penalizan los segmentos cortos: un encabezado de dos palabras llena los mismos 512 frames que una frase larga y cuesta aproximadamente 1,3 s. Conviene agrupar segmentos cortos en lote.
- Kokoro antepone un centinela de unos 0,45 s de audio al inicio de cada segmento. Representa el 9 % de una frase de cinco segundos y el 29 % de un encabezado de 1,5 s, y no es silencio: es artefacto del sobremuestreo del vocoder.
- Idioma único declarado: inglés. Cualquier uso en castellano u otras lenguas queda fuera de la cobertura documentada.
- Los pasos de host son responsabilidad del integrador: el alineamiento one-hot entre etapas 1 y 2 y la cadena `f0_upsamp` → SineGen → STFT entre 2 y 3. El acumulador de fase de SineGen exige fp32; hacerlo en fp16 degrada el resultado.
- El Neural Engine calcula en fp16 y no se ha comparado numéricamente con la referencia. La verificación de precisión publicada se hizo en macOS con `cpu_only`, por lo que valida el grafo exportado, no la ruta de ANE.
- Las formas dinámicas no funcionan: `nn.LSTM` especializa su longitud de secuencia bajo `torch.export`. No es posible adaptar el modelo a secuencias arbitrarias sin reexportar.
- El sesgo del modelo subyacente no está caracterizado en la información disponible; al ser una reexportación, hereda cualquier sesgo de Kokoro-82M y de su corpus de entrenamiento.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí puede producir prosodia incorrecta, duraciones anómalas o artefactos en texto atípico (siglas, cifras, nombres propios) por errores del G2P de misaki.
- Licencia Apache 2.0 en esta exportación, pero el uso comercial de los pesos y voces del modelo base debe verificarse en su propia model card, no incluida aquí.
- Modelo sin adopción registrada en el momento de la consulta (0 descargas, 0 likes, creado y actualizado el mismo día), lo que implica ausencia de validación independiente por parte de la comunidad.
- Requiere iOS 27 o macOS 26; no hay ruta de despliegue en servidor ni en Android con estos artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardr1126/Kokoro-82M-CoreAI
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de la aplicación que lo usa: https://github.com/richardr1126/openreader-ios
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a páginas de planes de suscripción de ChatGPT y no guardan relación con el modelo.
