# northlight-ai/gpl-free-multilingual-g2p-onnx

## Resumen

`northlight-ai/gpl-free-multilingual-g2p-onnx` es un sistema neuronal de conversión grafema-a-fonema (G2P) y desambiguación de homógrafos en contexto, distribuido como tres modelos ONNX cuantizados a INT8 que en conjunto ocupan menos de 25 MB. Lo desarrolla Pankaj Garg en Northlight y está pensado como sustituto directo de `espeak-ng` (GPL-3.0) en pipelines de síntesis de voz construidos sobre Kokoro-82M, kokoro-js, Piper y sherpa-onnx, tanto en CPU como en navegador mediante WebAssembly.

El problema que resuelve es doble: por un lado, la contaminación copyleft que introduce `espeak-ng` y buena parte de los léxicos G2P habituales (gruut, ipa-dict, WikiPron/Wiktionary con licencias CC-BY-SA o GPL/LGPL); por otro, la falta de desambiguación de homógrafos dependientes de contexto en inglés (*read*, *lead*, *bass*, *tear*, *wind*, *bow*, *live*, *object*, *record*), que los fonemizadores a nivel de palabra pronuncian mal. El modelo se entrenó exclusivamente con léxicos permisivos (CMUdict, LIUM fr.dict, OpenSLR SLR34, UniDic 2.1.2) y datos Apache-2.0, sin usar salidas de `espeak-ng` ni datos de Wiktionary.

Cubre inglés, francés, español y japonés. La arquitectura es un encoder-decoder Transformer de 4 capas con dimensión 384 y 6 cabezas de atención (encoder con embeddings uint8 por fila, decoder causal con LM head atado a pesos), más un estudiante ELECTRA-small destilado de 4 capas para la clasificación de sentido de homógrafos (162 homógrafos, 326 sentidos). Emite IPA canónico con marcas de acento primario y secundario y downstep japonés, y verifica un 0,000% de tokens perdidos contra el vocabulario de 114 tokens de Kokoro-82M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (4 capas, d=384, h=6) + estudiante ELECTRA-small destilado de 4 capas para homógrafos |
| Parametros totales | No disponible (pesos INT8: 24.252.403 bytes; FP32: 87,73 MiB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa palabra a palabra en G2P; frase completa en homógrafos) |
| Tipos de cuantizacion | INT8 (uint8 por fila en embeddings); existen también pesos FP32 ONNX |
| Idiomas soportados | Inglés (en), francés (fr), español (es), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime, onnxruntime-web/WASM) + 4 tablas JSON de runtime |

## Arquitectura y entrenamiento

El sistema se compone de tres redes ONNX independientes: `g2p_encoder_int8.onnx` (7,10 MiB, encoder Transformer de 4 capas con embeddings uint8 por fila), `g2p_decoder_int8.onnx` (8,35 MiB, decoder causal de 4 capas con LM head atado a pesos) y `homograph_ctx_int8.onnx` (7,68 MiB, estudiante ELECTRA-small destilado de las capas [0,3,7,11] con una cabeza de span objetivo sobre 162 homógrafos y 326 sentidos). Los pesos INT8 suman 23,129 MiB y el bundle desplegable completo con las cuatro tablas JSON de runtime alcanza 23,794 MiB (24.950.099 bytes).

El entrenamiento usó exclusivamente léxicos con licencias permisivas: CMUdict, CMUSphinx LIUM fr.dict, OpenSLR SLR34 y UniDic 2.1.2 (BSD-2/BSD-3/Apache-2.0), junto con `WikipediaHomographData/data/train` (Apache-2.0) deduplicado y frases portadoras generadas localmente con `Qwen/Qwen3-4B-Instruct-2507`. No se emplearon salidas de `espeak-ng` ni datos de Wiktionary/CC-BY-SA en entrenamiento ni destilación. La paridad INT8 frente a PyTorch es del 99,5% de coincidencia exacta en el encoder (deriva de 0,013 PER, n=1000), 99,76% en el decoder sobre las 5.000 palabras de `wikipron_fr_oov` y 99,93% de acuerdo en el clasificador de homógrafos (deriva de 0,069 de accuracy, n=1446). La paridad FP32 es del 100,0%.

## Capacidades

- Conversión grafema-a-fonema neuronal multilingüe para inglés, francés, español y japonés, con salida en IPA canónico incluyendo acento primario (`ˈ`) y secundario (`ˌ`).
- Desambiguación de homógrafos en inglés dependiente de contexto de frase (162 homógrafos, 326 sentidos), resolviendo casos como *read*, *lead*, *bass*, *tear*, *wind*, *bow*, *live*, *object* y *record*.
- Marcado de downstep de tono (pitch accent) para japonés (`↓`).
- Post-mapeo determinista `ipa_to_kokoro()` y normalizador de puntuación verificados con 0,000% de tokens perdidos contra el vocabulario de 114 tokens de Kokoro-82M.
- Ejecución en navegador vía `onnxruntime-web` (WebAssembly) sin servidor, y en servidor vía `onnxruntime` CPU.
- Integración como sustitución directa de `espeak-ng` en Kokoro-82M, kokoro-js, Piper y sherpa-onnx 2.0+.
- No soporta tool calling, agentes, visión, audio ni generación de texto general: es un componente especializado de fonemización.

## Casos de uso

- Sustitución de `espeak-ng` en pipelines TTS comerciales: al ser Apache-2.0 y no depender de léxicos CC-BY-SA ni GPL, permite distribuir productos basados en Kokoro-82M o Piper sin obligaciones de copyleft ni ShareAlike sobre el fonemizador.
- Síntesis de voz en el navegador: con `onnxruntime-web` y 23,79 MiB de bundle, se puede ejecutar la fonemización íntegramente en cliente (WebAssembly, sin servidor), lo que reduce coste de infraestructura y latencia de red en aplicaciones web de lectura en voz alta.
- Lectura de artículos y documentos en inglés con homógrafos frecuentes: el clasificador de contexto corrige pronunciaciones erróneas de palabras como *read* o *lead* que los fonemizadores a nivel de palabra fallan, mejorando la naturalidad percibida en asistentes de accesibilidad.
- Localización de voces para francés y español: genera IPA para LIUM fr.dict y OpenSLR SLR34 (español latinoamericano, con normalización seseo/yeísmo), útil en sistemas de TTS multilingüe desplegados en CPU.
- Fonemización para japonés con kana: bajo la puerta OOV aprobada (≤8,0% PER) alcanza 4,02% PER en kana estricto-OOV con 0,000% de caída de vocabulario Kokoro, adecuado para texto japonés predominantemente en kana o con lectura conocida.
- Procesamiento por lotes en servidor con CPU: a ~3,6 ms por palabra en G2P y ~1,2 ms por frase en homógrafos con 2 hilos de CPU, permite fonemizar corpus grandes en hardware modesto sin GPU.
- Integración en sherpa-onnx 2.0+ para asistentes de voz embebidos: el tamaño reducido y la licencia permisiva facilitan el despliegue en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados en conjuntos de evaluación intactos, con intervalos de confianza del 95% a nivel de clúster. Los benchmarks WikiPron están sin marcas de acento (stress-stripped); el acento léxico se evalúa en `cmudict_stress_heldout`. Las divisiones `strict-OOV` tienen 0/5.000 de solapamiento de superficie con train/dev.

| Benchmark | N | Ours (Apache-2.0) | espeak-ng (GPL-3.0) | OpenPhonemizer (BSD) | misaki sin espeak | Epitran (MIT) | pyopenjtalk (BSD) | CharsiuG2P (CC-BY-SA) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `wikipron_en_us_full` (sin acento) | 5.000 | 10,84 | 11,92 | 12,53 | 41,24 | — | — | — |
| `wikipron_ja_kana_oov` (PER) | — | 4,02 | 19,38 | — | — | — | — | — |
| `ja_kanji_heldout` (PER) | — | 15,53 | — | — | — | — | 5,08 | 30,16 |
| `ja_kanji_heldout` (WER) | — | 28,97 | — | — | — | — | — | — |
| `wikipron_fr_oov` (PER) | 5.000 | 7,584 | — | — | — | — | — | — |

Para japonés con kanji no vistos, el modelo queda por detrás de motores con diccionario en tiempo de ejecución como `pyopenjtalk` (5,08% PER) y `misaki_ja_cutlet` (0,22% PER), aunque reduce a la mitad el PER de `CharsiuG2P` (30,16%). La caída de vocabulario Kokoro en japonés es de 0,000% frente al 23,76% de `espeak-ng`.

## Requisitos de hardware

- VRAM: no requiere GPU; el bundle INT8 de 23,79 MiB cabe en memoria de CPU y puede ejecutarse en WebAssembly.
- GPU recomendadas: no aplica; el diseño está orientado a CPU y navegador. Cualquier GPU compatible con onnxruntime puede ejecutarlo, pero no es el escenario previsto.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos; el límite práctico es la memoria del navegador o del dispositivo.
- Opciones de despliegue: `onnxruntime` (CPU), `onnxruntime-web` (WASM), integración en Kokoro-82M, kokoro-js, Piper y sherpa-onnx 2.0+.
- Latencia y throughput: ~3,6 ms por palabra en G2P y ~1,2 ms por frase en homógrafos con 2 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Licencia | Tamaño | Idiomas | Enfoque | Rendimiento destacado |
|---|---|---|---|---|---|
| Ours (northlight-ai) | Apache-2.0 | 23,79 MiB INT8 | en, fr, es, ja | G2P neuronal + homógrafos | 10,84 PER en inglés US; 4,02 PER en kana JA OOV |
| espeak-ng | GPL-3.0 | No disponible (basado en reglas) | Muy amplio | G2P por reglas | 11,92 PER en inglés US; 19,38 PER en kana JA |
| OpenPhonemizer | BSD | No disponible | Varios | G2P | 12,53 PER en inglés US |
| pyopenjtalk | BSD-3-Clause | ~125 MB con MeCab/UniDic | ja | Diccionario + reglas | 5,08 PER en kanji JA |
| CharsiuG2P | CC-BY-SA | No disponible | Varios | G2P neuronal | 30,16 PER en kanji JA |

## Limitaciones y advertencias

- El japonés con kanji no vistos rinde peor que motores con diccionario en tiempo de ejecución: 15,53% PER y 28,97% WER en `ja_kanji_heldout`, frente a 5,08% de `pyopenjtalk`. Para texto japonés con mucho kanji en producción conviene combinarlo con una búsqueda UniDic/pyopenjtalk (BSD-3-Clause).
- El español se entrenó con OpenSLR SLR34 (español latinoamericano) y se evalúa con normalización dialectal seseo/yeísmo; la sensibilidad a la distinción castellana `θ`/`ʎ` se reporta por separado en `wikipron_es_ca_oov`.
- Los benchmarks WikiPron están sin marcas de acento; la evaluación del acento léxico depende de `cmudict_stress_heldout`.
- Riesgo de alucinación en la desambiguación de homógrafos cuando el contexto es ambiguo o muy corto; el clasificador cubre 162 homógrafos y 326 sentidos, no todos los del inglés.
- No es un modelo de propósito general: no genera texto, no soporta tool calling ni agentes, y su pipeline declarado (`text2text-generation`) es una etiqueta de Hugging Face, no una capacidad conversacional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-28; no hay evidencia de adopción en producción.
- Aunque la licencia es Apache-2.0, conviene verificar la procedencia de los léxicos de entrenamiento si se redistribuye el modelo en un producto comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/northlight-ai/gpl-free-multilingual-g2p-onnx
- Demo en navegador (WebAssembly): https://huggingface.co/spaces/northlight-ai/gpl-free-g2p-demo
- Perfil del autor: https://huggingface.co/pankajmlai
- Organización Northlight: https://huggingface.co/northlight-ai
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- WikiPron: https://github.com/CUNY-CL/wikipron
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
