# mrfakename/whistle-ONNX

## Resumen

Whistle ONNX es una exportación al formato ONNX del modelo de reconocimiento automático del habla (ASR) `Cactus-Compute/whistle`, realizada por el desarrollador mrfakename. El modelo original, desarrollado por Cactus Compute, está pensado para ejecución en dispositivo (on-device) y se distribuye empaquetado en formato `.cact`; esta versión lo reconvierte a ONNX para poder ejecutarlo con `onnxruntime` tanto en Node como en el navegador mediante WebGPU.

La exportación se construye a partir de una reimplementación en PyTorch que carga los pesos dequantizados desplegados de `whistle.cact`, y reproduce el comportamiento del motor de referencia `needle` de Cactus. Soporta siete idiomas (inglés, alemán, francés, español, italiano, neerlandés y polaco) y se publica bajo licencia Apache 2.0.

Su relevancia actual radica en que permite desplegar ASR multilingüe directamente en el navegador sin backend, con un peso total de repositorio de 0,2 GB, y en que incluye marcas de tiempo a nivel de palabra mediante DTW, identificación automática de idioma y sesgo por palabras clave. La arquitectura es de tipo encoder-decoder con atención cruzada y decodificación autorregresiva con caché KV.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con atención cruzada y decodificación autorregresiva con caché KV; features engram en el decodificador |
| Parámetros totales | No disponible (encoder fp32: 72 MB; decoder fp32: 73 MB; pack: 17 MB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX en fp32 y fp16; pesos originales CQ de 2, 3 y 4 bits mezclados con fp16/fp32 en `whistle.pack` |
| Idiomas soportados | Inglés (en), alemán (de), francés (fr), español (es), italiano (it), neerlandés (nl), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `.data`, `decoder.onnx` + `.data`, variantes `*_fp16.onnx`) y pack propietario `whistle.pack` |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder consume features log-mel de 80 bandas en un tensor `[T, 80]` y produce las claves y valores de atención cruzada `cross_k [8,8,S,48]` y `cross_v [8,8,S,64]` (fp32, 72 MB). El decoder ejecuta un paso autorregresivo con caché KV: recibe `token [1]`, `pos [1]`, features engram `efeat [2,4,512]` (calculadas en el host a partir del historial de tokens), estado previo `prev [8,2,608]`, caché propia `past_k [8,2,P,48]` y `past_v [8,2,P,64]`, además de las claves y valores cruzados. Devuelve `logits [8199]`, `prev_out`, la caché actualizada `present_k/v` y `xattn [4,8,S]` (atención cruzada de las capas 4 a 7, usada para las marcas de tiempo).

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO sobre el modelo original. Sí se documentan innovaciones relevantes en la exportación: el decodificador usa características engram (memoria basada en tablas de n-gramas incluidas en `whistle.pack`), la decodificación es greedy con sesgo por palabras clave (+2 de logit en el primer token y +5 en las continuaciones) y el encoder aplica un log-sum-exp con desplazamiento de máximo en la primera iteración del cálculo de Sinkhorn, porque el operador `ReduceLogSumExp` de WebGPU en `onnxruntime-web` no es seguro frente a desbordamiento. Las marcas de tiempo se calculan por DTW sobre fotogramas de 80 ms.

## Capacidades

- Reconocimiento automático del habla multilingüe en siete idiomas (en, de, fr, es, it, nl, pl).
- Identificación automática de idioma (LID): el resultado fue correcto en 4 de 4 clips de referencia.
- Marcas de tiempo a nivel de palabra mediante DTW con fotogramas de 80 ms (85 de 92 fronteras idénticas al motor de referencia, el resto con ±1 fotograma de diferencia).
- Probabilidades por palabra (diferencia máxima absoluta de 0,055 frente al motor Cactus `needle`).
- Sesgo por palabras clave (keyword biasing) para orientar el reconocimiento hacia términos concretos.
- Extracción de features log-mel integrada (banco de filtros mel incluido en el pack).
- Tokenización BPE incluida en el pipeline de referencia (`js/`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción en el navegador sin backend: al ejecutar el encoder en el Execution Provider de WebGPU y el decoder en WASM, la demo `mrfakename/whistle-webgpu` transcribe audio de 16 kHz mono directamente en el cliente, sin enviar datos a ningún servidor.
- Aplicaciones de accesibilidad en tiempo real: subtitulado de audio capturado por micrófono en la propia página, aprovechando que el modelo soporta identificación automática de idioma entre siete lenguas sin configuración previa.
- Indexación y búsqueda de archivos de audio: las marcas de tiempo por palabra permiten generar transcripciones alineadas temporalmente, útiles para generar subtítulos SRT o segmentar grabaciones largas.
- Asistentes de voz en dispositivos sin GPU dedicada: al correr sobre `onnxruntime-node` o WASM con pesos fp16, cabe en equipos de gama baja y no requiere infraestructura de GPU remota.
- Dictado en aplicaciones de escritorio o CLI: el ejemplo `js/example.mjs` acepta un WAV de 16 kHz mono 16 bits y devuelve la transcripción, lo que facilita integrarlo en herramientas locales de línea de comandos.
- Reconocimiento con vocabulario controlado: el sesgo por palabras clave permite forzar términos de dominio (nombres propios, jerga técnica, comandos) en aplicaciones de atención al cliente o control por voz.
- Preprocesado de pipelines de datos de voz: por su bajo peso, puede emplearse para transcribir lotes de audio antes de alimentar etapas posteriores de análisis o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, GSM8K) en la información disponible. La model card sí documenta una verificación de paridad frente al motor de referencia `needle` de Cactus sobre clips de referencia (en, de, fr, es):

| Comprobación | Resultado |
|---|---|
| Texto de transcripción (greedy) | Idéntico en 4/4 clips |
| Identificación de idioma (automática) | Correcta en 4/4 |
| Features log-mel frente al motor | Error absoluto máximo ≤ 1,1e-4 |
| Marcas de tiempo de palabra (DTW, fotogramas de 80 ms) | 85/92 fronteras idénticas, el resto ±1 fotograma |
| Probabilidades de palabra | Diferencia absoluta máxima 0,055 |

## Requisitos de hardware

- Tamaño de artefactos: encoder fp32 72 MB, decoder fp32 73 MB, pack 17 MB; el repositorio completo ocupa 0,2 GB. Cabe con holgura en cualquier GPU de consumo e incluso en memoria de CPU.
- VRAM estimada para inferencia: por debajo de 1 GB con los pesos fp32 y menos aún con las variantes fp16; no se especifica un mínimo oficial.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU de consumo (por ejemplo, la serie RTX 40) es suficiente. También puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, en cualquier modelo actual, dada la baja huella de memoria.
- Opciones de despliegue: `onnxruntime-node` (Node) y `onnxruntime-web` (navegador). La demo coloca el encoder en el Execution Provider de WebGPU (fp16) y el decoder en WASM, porque para pasos de un solo token WASM resulta más rápido que WebGPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Ventana |
|---|---|---|---|---|---|
| mrfakename/whistle-ONNX | No disponible | 7 | Apache 2.0 | ONNX | No disponible |
| Cactus-Compute/whistle (base) | No disponible | 7 | Apache 2.0 | `.cact` | No disponible |
| openai/whisper-tiny | 39 M | 99 | MIT | PyTorch/safetensors | 30 s |
| openai/whisper-base | 74 M | 99 | MIT | PyTorch/safetensors | 30 s |

No se dispone de comparativas de precisión (WER) publicadas entre whistle y los modelos Whisper. La diferencia principal es de orientación: whistle-ONNX está optimizado para inferencia en navegador con WebGPU y un pack de pesos muy pequeño (17 MB), mientras que Whisper cubre más idiomas pero se distribuye en pesos PyTorch mayores y no incluye un pipeline de ejecución en navegador listo para usar.

## Limitaciones y advertencias

- La decodificación es greedy, lo que puede producir transcripciones de menor calidad que técnicas de búsqueda por haz (beam search) en audio con ruido o acentos marcados.
- No se han publicado métricas de precisión (WER/CER) sobre conjuntos de test estándar; la validación documentada se limita a 4 clips de referencia.
- Riesgo de alucinación o de transcripciones incorrectas en segmentos con silencio, ruido o solapamiento de hablantes, inherente a los sistemas ASR autorregresivos.
- La cobertura se limita a siete idiomas (en, de, fr, es, it, nl, pl); no se documentan otros.
- La longitud de contexto y la gestión de audios largos no están especificadas; no se indica si hay segmentación automática más allá del ejemplo de WAV de 16 kHz mono.
- El sesgo por palabras clave se aproxima al del motor original mediante incrementos de logit (+2 y +5), por lo que su comportamiento puede diferir del motor `needle`.
- La licencia Apache 2.0 del repositorio permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base `Cactus-Compute/whistle` antes de un despliegue en producción.
- El repositorio registra 0 descargas y 1 me gusta en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación por parte de la comunidad.
- No se documenta soporte de tool calling, agentes ni integración con frameworks de orquestación, por lo que su uso se restringe a transcripción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrfakename/whistle-ONNX
- Modelo base: https://huggingface.co/Cactus-Compute/whistle
- Demo en WebGPU: https://huggingface.co/spaces/mrfakename/whistle-webgpu
- Perfil del autor: https://huggingface.co/mrfakename
- Documentación de ONNX: https://onnx.ai/onnx/
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Open Neural Network Exchange (Wikipedia): https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange
