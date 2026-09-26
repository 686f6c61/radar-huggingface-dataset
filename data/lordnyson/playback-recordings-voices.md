# lordnyson/playback-recordings-voices

## Resumen

Playback Recordings voices es un repositorio de paquetes de voces para síntesis de voz (text-to-speech) publicado por el usuario lordnyson en HuggingFace. No contiene ningún modelo entrenado desde cero: son dos packs de modelos abiertos ya existentes (Kokoro-82M y Pocket TTS) convertidos o parcheados para que el runtime sherpa-onnx los renderice igual que sus runtimes de referencia. El repositorio actúa como espejo de descarga para la aplicación Android Playback Recordings, una app de narración offline que descarga estos paquetes en el primer uso y ejecuta la inferencia en el propio dispositivo.

El paquete principal, `kokoro-v1.0.tar` (~360 MB), empaqueta el export ONNX en fp32 de Kokoro-82M v1.0 (hexgrad), con la particularidad de que se le han copiado los metadatos de modelo de sherpa-onnx encima para conservar el espectro del export original: según el autor, el export propio de Kokoro de sherpa-onnx reconstruye el vocoder y suena más apagado, con unos 9 dB menos de energía en la banda de 4-8 kHz. El segundo paquete, `pocket-2026-09.tar` (~160 MB), contiene Pocket TTS de Kyutai (`english_2026-09`, 6 capas) exportado a ONNX, con las partes del modelo de lenguaje y el decodificador cuantizadas a INT8.

La relevancia de este repositorio es práctica más que investigadora: resuelve el problema de distribuir y ejecutar TTS neuronal de calidad en Android sin conexión y sin GPU, unificando dos familias de modelos bajo un mismo runtime (sherpa-onnx) y documentando los parches concretos necesarios. Está limitado a inglés (`en`) y su licencia es mixta, con componentes Apache-2.0, MIT, CC-BY-4.0 y GPL-3.0-or-later conviviendo en el mismo paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos familias: Kokoro-82M (export ONNX fp32) y Pocket TTS de Kyutai (encoder, text conditioner, lm_main, lm_flow y decoder; 6 capas en la variante `english_2026-09`) |
| Parámetros totales | Kokoro: 82M. Pocket TTS: no disponible |
| Parámetros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantización | Kokoro: fp32. Pocket TTS: INT8 (cuantización dinámica) en `lm_main`, `lm_flow` y `decoder`; fp32 en `encoder` y `text_conditioner` |
| Idiomas soportados | en (inglés). Kokoro incluye `lexicon-us-en.txt` únicamente |
| Licencia | `other` / `mixed-see-readme`. Componentes: Kokoro-82M Apache-2.0; export kokoro-onnx MIT; eSpeak NG GPL-3.0-or-later; Pocket TTS CC-BY-4.0; export ONNX Apache-2.0; muestras de voz CC-BY-4.0 (VCTK) y CC0 (LibriVox) |
| Formato de pesos | ONNX (`model.onnx`, `encoder.onnx`), más `voices.bin`, `tokens.txt`, `lexicon-us-en.txt`, `vocab.json`, `token_scores.json` y WAV de referencia; distribuidos como tar sin comprimir |
| Tamaño del repositorio | ~0,5 GB |
| Librería declarada | pocket-tts |
| Runtime objetivo | sherpa-onnx (ONNX Runtime), inferencia en dispositivo |

## Arquitectura y entrenamiento

El repositorio no entrena nada. El pack `kokoro-v1.0` parte del export ONNX fp32 de Kokoro-82M v1.0 generado por thewh1teagle (kokoro-onnx) y le aplica `tools/patch_kokoro_metadata.py`, que copia los metadatos de modelo de sherpa-onnx sobre el grafo para que el runtime lo acepte sin sustituir el vocoder. Los ficheros auxiliares (`voices.bin`, `tokens.txt`, `lexicon-us-en.txt`) provienen del release `kokoro-multi-lang-v1_0` de sherpa-onnx, con los identificadores de hablante `af_bella` (2), `af_heart` (3) y `am_michael` (16). Se incorpora además `espeak-ng-data/` con los datos fonémicos de eSpeak NG.

El pack `pocket-2026-09` parte de Pocket TTS de Kyutai (`english_2026-09`, 6 capas, CC-BY-4.0), exportado a ONNX mediante KevinAHM/pocket-tts-onnx-export con el fichero `tools/english_2026-09.yaml`. La innovación técnica destacable es `tools/bake_bos.py`: las versiones de Pocket TTS desde `english_2026-04` esperan un embedding aprendido de BOS antes de la voz, y sherpa-onnx (escrito para `english_2026-01`) no lo inserta; el script lo incrusta dentro del grafo del encoder. Sin ese parche, la salida es ruido. El tokenizador SentencePiece se convirtió con `scripts/pocket-tts/convert_tokenizer.py` de sherpa-onnx.

Las voces de este segundo pack son grabaciones de referencia para clonación, remuestreadas a 24 kHz mono: `eponine.wav` corresponde al hablante p262 del corpus VCTK (frase 23), mejorada por Kyutai; `peter_yearsley.wav` proviene de Voice-Zero sobre grabaciones de LibriVox.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto, offline y en el dispositivo.
- Tres voces Kokoro: `af_bella`, `af_heart` (femeninas, inglés estadounidense) y `am_michael` (masculina, inglés estadounidense).
- Dos voces clonadas de Pocket TTS: Eponine y Peter Yearsley.
- Conversión de texto a fonemas mediante eSpeak NG en la ruta Kokoro.
- Ejecución completa sin conexión a red una vez descargado el pack.
- Inferencia en CPU a través de sherpa-onnx.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe: no disponible; el repositorio está etiquetado y empaquetado solo para inglés.
- No hay modo de pensamiento (thinking) ni control de estilo, emoción o prosodia más allá de la voz seleccionada.

## Casos de uso

- Narración de libros y artículos en Android: la app Playback Recordings usa estos packs para leer texto largo en voz alta sin conexión, con voces de calidad cercana a la de los runtimes de referencia gracias al parche de metadatos que preserva el espectro del vocoder de Kokoro.
- Lectura de accesibilidad para personas con discapacidad visual: integración mediante sherpa-onnx en una app móvil para convertir cualquier texto de pantalla en audio en el propio dispositivo, evitando enviar contenido a servicios en la nube.
- Asistentes de voz sin conexión en dispositivos embebidos: dado que ambos packs funcionan en CPU y ocupan entre 160 y 360 MB, se pueden desplegar en terminales Android, Raspberry Pi o hardware ARM para dar respuesta hablada en inglés sin GPU.
- Audiolibros y pódcast de bajo coste: generación por lotes de audio narrado en inglés con voces consistentes (Eponine, Peter Yearsley, Bella, Heart, Michael) para publicar contenido sin licencias de voz comerciales.
- Prototipado de interfaces conversacionales en inglés: uso de las voces Kokoro como capa de salida de un pipeline de diálogo, aprovechando la baja latencia de un modelo de 82M en ONNX frente a alternativas mayores.
- Pruebas de calidad de TTS en pipelines de evaluación: el propio autor valida los packs renderizándolos con sherpa-onnx y transcribiéndolos con Whisper `base.en`, comparando WER contra los runtimes de referencia; este flujo es reutilizable como test de regresión para cualquier conversión de modelo TTS a ONNX.
- Generación de avisos y locuciones pregrabadas en aplicaciones: frases cortas predecibles en inglés donde la clonación de voz de Pocket TTS permite mantener una identidad de marca sonora concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor sí documenta una validación cualitativa y cuantitativa parcial: cada pack se renderizó con sherpa-onnx y se transcribió con Whisper (`base.en`), y las tasas de error por palabra (WER) coincidieron con los runtimes de referencia (kokoro-onnx y pocket-tts) sobre las mismas frases; además, la salida de Kokoro coincidió con el espectro del export original. No se proporcionan los valores concretos de WER ni comparaciones con otros modelos TTS.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante sherpa-onnx; no requiere GPU.
- Kokoro-82M en fp32: aproximadamente 330 MB de pesos, más los datos de eSpeak NG; el pack completo ocupa unos 360 MB en disco.
- Pocket TTS con partes INT8: el pack completo ocupa unos 160 MB en disco.
- Dispositivos objetivo: teléfonos y tabletas Android (arm64), y por extensión cualquier equipo de escritorio o SBC capaz de ejecutar ONNX Runtime en CPU.
- No se especifican GPU recomendadas (A100, H100, RTX 4090) porque el modelo no está pensado para aceleración por GPU.
- Cabe en cualquier GPU de consumo, pero no hay motivo para usarla: el cuello de botella es la CPU y el runtime.
- Opciones de despliegue: sherpa-onnx (ruta soportada y validada por el autor); al ser ONNX estándar, es posible cargar `model.onnx` o `encoder.onnx` con ONNX Runtime directamente, aunque los parches de metadatos y BOS están pensados para sherpa-onnx.
- No aplican vLLM, llama.cpp, Ollama ni TGI: son herramientas para modelos de lenguaje, no para estos paquetes TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Formato | Notas |
|---|---|---|---|---|
| Este repositorio (pack Kokoro) | 82M | Mixta: Apache-2.0, MIT, GPL-3.0-or-later | ONNX fp32 | Metadatos de sherpa-onnx sobre el export de kokoro-onnx; conserva el espectro original (unos 9 dB más de energía en 4-8 kHz que el export propio de sherpa-onnx) |
| Kokoro-82M v1.0 (hexgrad) | 82M | Apache-2.0 | no disponible | Modelo base original; export ONNX en fp32 generado por thewh1teagle/kokoro-onnx (MIT) |
| Export de Kokoro de sherpa-onnx (`kokoro-multi-lang-v1_0`) | 82M | Apache-2.0 | ONNX | Reconstruye el vocoder y, según el autor de este repositorio, suena audiblemente más apagado en 4-8 kHz |
| Pocket TTS de Kyutai (`english_2026-09`) | no disponible (6 capas) | CC-BY-4.0 | ONNX vía KevinAHM/pocket-tts-onnx-export | Requiere el embedding BOS antes de la voz; sin él la salida es ruido en sherpa-onnx |

No se dispone de datos comparativos de rendimiento (WER, MOS, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe en estos packs, pese a que el release de origen de Kokoro sea multilingüe.
- Repositorio con 0 descargas y 0 likes y creado en septiembre de 2026: no hay evidencia de uso en producción ni de mantenimiento continuado por parte de terceros.
- Licencia mixta y no trivial: conviven Apache-2.0, MIT, CC-BY-4.0 y GPL-3.0-or-later (los datos de eSpeak NG). La GPL-3.0-or-later de `espeak-ng-data/` es la restricción más relevante para redistribución o uso comercial; conviene revisar el README antes de integrarlo en un producto propietario.
- Las voces de Pocket TTS se basan en grabaciones de personas reales (VCTK p262 y LibriVox). Kyutai prohíbe expresamente la suplantación de voz o la clonación sin consentimiento explícito y lícito, la desinformación y la presentación de contenido generado como grabación auténtica de personas o sucesos reales.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas, omisiones o artefactos en texto con nombres propios, siglas, números o puntuación atípica, especialmente fuera del dominio de entrenamiento en inglés.
- Dependencia de los parches: el pack de Pocket TTS solo funciona con el embedding BOS incrustado en el encoder; otros runtimes o versiones distintas de sherpa-onnx pueden producir ruido si no respetan ese supuesto.
- El pack de Kokoro depende de que el runtime acepte los metadatos copiados; no es un modelo nuevo y no cabe esperar mejoras de calidad respecto al export original.
- Sin datos publicados de latencia, throughput, WER por frase ni evaluación de sesgos; la validación descrita por el autor es interna y no reproducible con los artefactos disponibles sin ejecutar los scripts de `tools/`.
- No hay información sobre el tratamiento de texto largo, segmentación de frases ni gestión de memoria en dispositivos de gama baja.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lordnyson/playback-recordings-voices
- Aplicación Playback Recordings: https://github.com/gregoryraymond/Playback-recordings
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Kokoro-82M v1.0 (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Export ONNX de Kokoro (thewh1teagle/kokoro-onnx): https://github.com/thewh1teagle/kokoro-onnx
- Pocket TTS (Kyutai): https://huggingface.co/kyutai/pocket-tts
- Kyutai: https://kyutai.org
- Export ONNX de Pocket TTS (KevinAHM): https://github.com/KevinAHM/pocket-tts-onnx-export
- Voces de referencia de Kyutai (kyutai/tts-voices): https://huggingface.co/kyutai/tts-voices
- Corpus CSTR VCTK, Universidad de Edimburgo: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero (OwenTyme): https://github.com/OwenTyme/voice-zero
- eSpeak NG: https://github.com/espeak-ng/espeak-ng
