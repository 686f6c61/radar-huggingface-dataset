# qmohits/kokoro-82m-coreml-size-tiers

## Resumen

`qmohits/kokoro-82m-coreml-size-tiers` es un conjunto de paquetes Core ML derivados de `hexgrad/Kokoro-82M` v1.0 (revisión `f3ff3571791e39611d31c381e3a41a3af07b4987`), un modelo de síntesis de voz de 82 M de parámetros. El autor, qmohits, publica cinco "tiers" de tamaño (500, 200, 100, 50 y 25 MB de modelos compilados) obtenidos mediante conversión y compresión del grafo original, con el objetivo de medir hasta dónde se puede reducir el peso de un TTS neuronal manteniendo una calidad perceptual aceptable en un iPhone 12.

No es un modelo nuevo ni reentrenado: es un artefacto de ingeniería para despliegue en el dispositivo. Cada tier incluye únicamente los paquetes Core ML, un `manifest.json` con hashes SHA-256, formas de entrada/salida y unidades de cómputo, y (solo en el tier de 25 MB) una tabla de voz `af_heart` en float32 de 522.240 bytes. El modelo consume *ids* de fonemas de Kokoro, no texto: no incorpora frontend de texto a fonemas, y las etapas de redondeo de duración, alineamiento, DSP e iSTFT inversa viven en el harness Swift del repositorio de GitHub, por lo que estos paquetes por sí solos no constituyen un sintetizador completo.

Su relevancia es práctica: documenta con mediciones de *real-time factor* (RTF) y pruebas de escucha ciega el compromiso entre tamaño, latencia y calidad en hardware Apple, e indica que el tier recomendado es el de 25 MB (S017, 24.267.607 bytes compilados), que además es el más rápido de todos (RTF mediano de 0,060 a 0,109 para entradas de 3, 7, 15 y 30 s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro-82M) descompuesto en etapas Core ML: codificador de texto, prosodia (duración + features de texto), predictor de pitch/energía y decodificador; la forma de onda se obtiene con iSTFT inversa en el harness Swift |
| Parametros totales | 82 M en el modelo base Kokoro-82M (según la denominación del repositorio); el conjunto Core ML se mide en bytes compilados, no en parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (TTS): los tiers de 500, 200 y 100 MB admiten solo las formas fijas de 56, 110, 237, 260 y 280 tokens; los de 50 y 25 MB admiten longitudes de token y de frame flexibles |
| Tipos de cuantizacion | fp32 en el tier de 500 MB; mezcla de precisión etiquetada `mixed8` en el tier de 50 MB; esquema de los tiers de 200, 100 y 25 MB no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML: `.mlpackage` (sin compilar) y `.mlmodelc` (compilado con `xcrun coremlcompiler`); `manifest.json` por tier; voz en `.bin` float32 (`25mb/af_heart_f32.bin`, 522.240 bytes) |
| Modelo base | `hexgrad/Kokoro-82M` v1.0, revisión `f3ff3571791e39611d31c381e3a41a3af07b4987` |
| Pipeline | text-to-speech (entrada real: ids de fonemas) |
| Voz incluida | `af_heart` (única) |
| Tamano del repo | 0,6 GB |
| Descargas / likes | 0 / 0 |

Desglose de los tiers (bytes de modelos compilados y número de paquetes):

| Tier | Experimento | Bytes compilados | Formas | Paquetes |
|---|---|---:|---|---:|
| `500mb/` | S002 | 327.680.270 | fijas | 5 |
| `200mb/` | S007 | 168.492.559 | fijas | 5 |
| `100mb/` | S011 | 96.203.053 | fijas | 5 |
| `50mb/` | S014 `mixed8` | 42.582.199 | flexibles | 4 |
| `25mb/` (recomendado) | S017 | 24.267.607 | flexibles | 3 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: convierte Kokoro-82M v1.0 a Core ML y lo particiona en etapas encadenadas. En el tier de 500 MB se distinguen cuatro paquetes con nombre explícito: `kokoro_text_fp32` (25.469.752 bytes), `kokoro_prosody_fp32` (53.708.437 bytes), `kokoro_pitch_fp32` (33.959.547 bytes) y `kokoro_decoder_fp32` (134.687.955 bytes), más un quinto paquete no descrito en el extracto disponible. Los paquetes de 500, 200 y 100 MB son *multifunction* con `save_multifunction` de coremltools: las cinco formas de cada etapa comparten un único fichero de pesos, con funciones de token `t56, t110, t237, t260, t280` y funciones de frame `f146, f275, f567, f614, f633`.

La interfaz es tensorial y explícita. Por ejemplo, en `t56` el codificador recibe `input_ids int32[1, 56]` y devuelve `encoded float32[1, 512, 56]`; la etapa de prosodia recibe además `style float32[1, 256]` y emite `duration_hidden float32[1, 56, 640]`, `duration_logits float32[1, 56, 50]` y `text_features float32[1, 512, 56]`; la etapa de pitch recibe `aligned float32[1, 640, 146]` y `style float32[1, 128]` y devuelve `pitch float32[1, 292]` y `energy float32[1, 292]`. El decodificador consume texto, pitch, energía y estilo. Los paquetes de los tiers de 500, 200 y 100 MB fijan `computeUnits = .all` (ANE, GPU y CPU disponibles). Los detalles de composición del dataset de entrenamiento original, número de tokens, uso de RLHF/DPO o innovaciones de decodificación no están disponibles en la información proporcionada; el autor no documenta reentrenamiento ni ajuste fino, solo conversión y compresión con verificación de calidad perceptual.

## Capacidades

- Síntesis de voz en inglés a partir de ids de fonemas de Kokoro, con una única voz (`af_heart`) y condicionamiento por vectores de estilo (`style` de 256 dimensiones en prosodia y 128 en pitch/decoder).
- Predicción explícita de duración (logits de 50 clases y `duration_hidden`), pitch y energía, lo que permite inspeccionar y postprocesar prosodia fuera del modelo.
- Salida de features espectrales que el harness Swift convierte en audio mediante iSTFT inversa; el modelo no emite waveform directamente.
- Soporte de longitudes variables de token y de frame a partir del tier de 50 MB (S014); los tiers mayores solo aceptan las cinco formas congeladas del benchmark.
- Paquetes multifunción: varias formas comparten pesos, lo que reduce el tamaño total en disco.
- Ejecución totalmente local en el dispositivo con Core ML, sin dependencia de red.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No dispone de visión, audio de entrada ni modo "thinking".
- No incluye frontend de texto a fonemas; la tokenización fonética debe resolverse fuera del repositorio.

## Casos de uso

- Lectura de notificaciones y contenido corto en una app iOS: el tier de 25 MB ocupa 24,3 MB compilados y presenta un RTF mediano de 0,060 para 3 s de audio, unas 16,7 veces más rápido que tiempo real, lo que permite sintetizar bajo demanda sin bloquear la interfaz.
- Audiolibros o artículos largos por fragmentos: el tier de 50 MB admite longitudes flexibles de token y frame, imprescindible para frases de duración arbitraria, con RTF mediano de 0,173 a 0,197 entre 3 y 30 s.
- Accesibilidad para personas con discapacidad visual: ejecución local sin red y sin enviar texto a servidores, con una voz consistente entre sesiones.
- Navegación y avisos por voz en tiempo real: los tiers de 100 MB (RTF 0,171 para 3 s) o 25 MB permiten generar instrucciones cortas con latencia baja; conviene validar que las longitudes de token caigan en las formas fijas si se usan los tiers de 100 MB o superiores.
- Investigación sobre prosodia: al exponer `duration_logits`, `pitch` y `energy` como tensores separados, se pueden medir o modificar curvas entonativas antes de la iSTFT en experimentos de análisis del habla.
- Estudio de cuantización en el dispositivo: los cinco tiers permiten replicar la comparación tamaño-calidad sobre el mismo hardware y la misma voz, útil para decidir presupuestos de binario en apps App Store.
- Asistentes de voz embebidos sin conectividad: el tier de 25 MB con 3 paquetes reduce el número de invocaciones al runtime de Core ML, lo que simplifica la integración y el arranque en frío.
- Prototipado de doblaje o locución en inglés: válido para demos internas con una sola voz, no para producción multilingüe ni multivoz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K) en la información disponible, dado que no es un modelo de lenguaje. Los datos publicados son de latencia y de escucha ciega.

RTF mediano (tiempo de proceso / duración de audio) para entradas de 3, 7, 15 y 30 s en iPhone 12:

| Tier | 3 s | 7 s | 15 s | 30 s | Velocidad aprox. a 3 s |
|---|---:|---:|---:|---:|---:|
| `500mb/` (S002) | 0,170 | 0,198 | 0,207 | 0,215 | 5,9x tiempo real |
| `200mb/` (S007) | 0,185 | 0,211 | 0,223 | 0,269 | 5,4x tiempo real |
| `100mb/` (S011) | 0,171 | 0,196 | 0,213 | 0,226 | 5,8x tiempo real |
| `50mb/` (S014) | 0,173 | 0,181 | 0,189 | 0,197 | 5,8x tiempo real |
| `25mb/` (S017) | 0,060 | 0,072 | 0,096 | 0,109 | 16,7x tiempo real |

Prueba de escucha ciega frente a la referencia:

| Tier | Resultado | Pares evaluados |
|---|---|---|
| `500mb/` | 4/4 empates en el test de cuatro longitudes | 4 |
| `200mb/` | 4/4 empates en el test de cuatro longitudes | 4 |
| `100mb/` | 4/4 empates en el test de cuatro longitudes | 4 |
| `50mb/` | 12/12 empates (cuatro longitudes + 8 frases ocultas) | 12 |
| `25mb/` | 11 empates, 4 victorias del tier, 1 victoria de la referencia (decisión del autor) | 16 |

Para el tier de 25 MB, el recuento agregado combina dos sesiones: la del oyente 1 (8 empates en 8 frases ocultas no vistas y, en el test de cuatro longitudes, 3 empates y 1 victoria del tier, sin victoria de la referencia) y la del oyente 2, que solo hizo el test de cuatro longitudes (3 preferencias por el tier y 1 por la referencia en el corte de 15 s). El autor es el oyente 1 y juzgó aceptable la preferencia aislada del oyente 2 por la referencia.

## Requisitos de hardware

- Dispositivo de referencia validado: iPhone 12. No se han publicado pruebas en otros modelos de iPhone, iPad o Mac.
- VRAM: no aplica; la inferencia se ejecuta en memoria unificada del SoC Apple mediante Core ML. El pico de RAM no está documentado.
- Huella en disco de los modelos compilados: 327,7 MB (500 MB), 168,5 MB (200 MB), 96,2 MB (100 MB), 42,6 MB (50 MB) y 24,3 MB (25 MB). La tabla de voz del tier de 25 MB añade 522.240 bytes; el harness y la app de validación no están incluidos en esas cifras.
- GPU recomendadas: no aplica el concepto de GPU discreta; los paquetes del tier de 500 MB fijan `computeUnits = .all`, de modo que Core ML puede repartir capas entre Neural Engine, GPU y CPU.
- ¿Cabe en hardware de consumo? Sí, en el sentido de que está diseñado para un iPhone 12; el tier de 25 MB es el más adecuado para presupuestos de binario ajustados.
- Opciones de despliegue: Core ML en iOS/iPadOS/macOS, compilación con `xcrun coremlcompiler` y conversión/inspección con coremltools; harness Swift del repositorio de GitHub. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: ver tabla de RTF. A 3 s de audio, el tier de 25 MB tarda aproximadamente 0,18 s de proceso (0,060 × 3 s); el de 500 MB, unos 0,51 s (0,170 × 3 s). Cifras derivadas de los RTF publicados, no medidas directas del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Longitudes | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| Este repositorio (5 tiers Core ML) | 82 M (base), compilado de 24,3 a 327,7 MB | Ids de fonemas | Fijas hasta 100 MB; flexibles desde 50 MB | Inglés | Apache-2.0 | Core ML (`.mlpackage` / `.mlmodelc`), iOS |
| `hexgrad/Kokoro-82M` (upstream) | 82 M | Texto, con frontend de texto a fonemas | No disponible en la información proporcionada | No disponible en la información proporcionada (el derivado declara solo `en`) | Apache-2.0 | Pesos del framework original; no disponible el detalle |
| Otras alternativas TTS de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el modelo base: el derivado pierde el frontend de texto a fonemas, reduce la salida a una única voz (`af_heart`) y, en los tiers de 500, 200 y 100 MB, restringe la síntesis a cinco longitudes predefinidas. A cambio, ofrece un binario entre 3,4 y 13,5 veces menor que el tier de 500 MB y un RTF hasta 2,8 veces mejor en el tier de 25 MB. El repositorio upstream publica las voces bajo la misma declaración Apache-2.0 que los pesos, según la model card.

## Limitaciones y advertencias

- No es un sintetizador autónomo: requiere ids de fonemas de Kokoro y las etapas Swift (redondeo de duración, alineamiento, DSP e iSTFT inversa) del repositorio de GitHub. Los paquetes por sí solos no generan audio.
- Sin frontend de texto a fonemas: no se puede pasar texto en inglés directamente; hay que resolver la fonemización por fuera.
- Un solo idioma (`en`) y una sola voz (`af_heart`). No hay soporte multilingüe ni cambio de hablante.
- Los tiers de 500, 200 y 100 MB solo aceptan las formas congeladas de 56, 110, 237, 260 y 280 tokens, y sus frames correspondientes; cualquier texto de longitud distinta falla o exige recorte.
- Evaluación perceptual limitada: un dispositivo (iPhone 12), un oyente principal que además es el autor del proyecto y un segundo oyente que solo cubrió el test de cuatro longitudes. El propio autor indica que la prueba fue ciega pero no independiente y que no se reclama equivalencia perceptual amplia con Kokoro.
- No hay métricas objetivas de calidad (MOS, WER, MCD) ni evaluación de sesgos en la información disponible; el riesgo de alucinación no aplica, pero sí el de artefactos prosódicos o de pronunciación en fonemas fuera de distribución.
- Los tiers de 200, 100 y 25 MB no detallan su esquema de cuantización, lo que dificulta reproducir la receta de compresión.
- El tier de 500 MB fija `computeUnits = .all`; el rendimiento puede variar en dispositivos con Neural Engine de distinta generación, extremo no evaluado.
- Licencia Apache-2.0, que permite uso comercial, pero deben revisarse `LICENSE` y `THIRD_PARTY_NOTICES.md` del repositorio por las dependencias de conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qmohits/kokoro-82m-coreml-size-tiers
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub con el harness Swift: https://github.com/qmohitsingh/kokoro-82m-coreml-size-tiers
- Revisión del modelo base utilizada: `f3ff3571791e39611d31c381e3a41a
