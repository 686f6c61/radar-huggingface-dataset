# 132262b/ppaso-tts-onnx-web

## Resumen

Ppaso-TTS browser build es una redistribucion empaquetada del modelo de sintesis de voz coreano `akamotaco/ppaso-tts-v1`, preparada especificamente para ejecutarse en el navegador mediante `onnxruntime-web`. El autor del repositorio, 132262b, no reentrena ni modifica los pesos del modelo original: mantiene los pesos en fp32 y se limita a fusionar los ficheros de pesos externos (`*.onnx.data`) dentro de cada `.onnx`, de forma que el navegador pueda crear una sesion a partir de un unico buffer descargado.

El modelo es un TTS de un solo hablante para coreano con una arquitectura en cascada de cuatro etapas: un codificador de texto (`text_encoder`), un predictor de varianza (`variance`, que estima la duracion en escala logaritmica), un modelo acustico que genera mel-espectrogramas de 80 bandas y un vocoder que produce magnitud y fase para reconstruir la onda mediante iSTFT a 22,05 kHz. El paquete completo ronda los 43 MB, lo que lo hace viable en entornos web sin GPU dedicada.

Su relevancia practica esta en el despliegue: el autor cambia los grafos `acoustic.onnx` y `vocoder.onnx` a longitud de frames dinamica en lugar de los 512 frames fijos de la exportacion para NPU, de modo que las frases cortas solo computan su propia longitud. Segun la model card, esto acelera aproximadamente 3 veces una locucion de 1-2 segundos, con diferencias respecto a los grafos de longitud fija limitadas al borde con padding (SNR de 30-43 dB). Ademas anade `english.json`, que mapea unas 125.000 palabras inglesas a lecturas en hangul.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en cascada: text encoder + variance predictor + modelo acustico (mel 80 bandas) + vocoder con iSTFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en fp32, sin cambios) |
| Idiomas soportados | coreano (ko); lectura de palabras inglesas via transliteracion a hangul |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos con pesos fusionados en el propio `.onnx`) |
| Frecuencia de muestreo de salida | 22,05 kHz |
| Tamano del paquete | aproximadamente 43 MB |
| Vocabulario de entrada | `lexicon.json` (1,5 MB) y `english.json` (3,0 MB) |
| Modelo base | akamotaco/ppaso-tts-v1 (commit 53d09664c4f636a5fb6f2ebe3ec22cd83ee249b9) |

Desglose de ficheros:

| Fichero | Tamano |
|---|---|
| onnx/text_encoder.onnx | 7,6 MB |
| onnx/variance.onnx | 2,8 MB |
| onnx/acoustic.onnx (frames dinamicos) | 5,8 MB |
| onnx/vocoder.onnx (frames dinamicos) | 22,0 MB |
| lexicon.json | 1,5 MB |
| english.json | 3,0 MB |

## Arquitectura y entrenamiento

El pipeline es explicito en la model card: el texto pasa por una normalizacion (conversion de ingles a hangul mediante `english.json` y de numeros a hangul), se convierte a fonemas IPA usando `lexicon.json` con division por coincidencia mas larga, fallback a jamo y reglas fonologicas; despues entra en `text_encoder`, seguido de `variance` para predecir la duracion logaritmica, un regulador de longitud en host, el modelo acustico (mel de 80 x frames) y el vocoder (magnitud y fase), que alimenta un iSTFT con `n_fft` 1024 y `hop` 256 para producir audio a 22,05 kHz.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Si se indica que el corpus de entrenamiento del modelo base fue sintetizado con Fun-CosyVoice 3.0 (Apache 2.0). La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el empaquetado para navegador: fusion de pesos externos en un unico fichero ONNX, grafos con longitud de frames dinamica y sustitucion de la segmentacion con mecab-ko del runtime original por division por coincidencia mas larga contra `lexicon.json`. Segun el autor, sobre 46 frases de estilo conversacional los fonemas resultaron identicos en 44 casos.

## Capacidades

- Sintesis de voz (text-to-speech) de un solo hablante en coreano.
- Generacion de audio a 22,05 kHz con mel-espectrograma de 80 bandas y reconstruccion por iSTFT.
- Prediccion de duracion por fonema mediante el modulo de varianza.
- Lectura de palabras inglesas incrustadas en texto coreano gracias a `english.json` (por ejemplo `hello` → 헬로, `computer` → 컴퓨터), construido a partir del CMU Pronouncing Dictionary con las reglas ingles-a-hangul de g2pK.
- Normalizacion de numeros a hangul.
- Ejecucion en navegador mediante `onnxruntime-web` (WASM), sin necesidad de backend.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo de sintesis.

## Casos de uso

- Lectura por voz en aplicaciones web coreanas: el paquete ONNX se carga en el navegador con `onnxruntime-web` y sintetiza texto en cliente, sin enviar contenido a un servidor, lo que simplifica el cumplimiento de privacidad.
- Accesibilidad en sitios web: integracion como lector de contenido para usuarios con discapacidad visual en paginas en coreano, aprovechando el tamano reducido (aproximadamente 43 MB) para una descarga inicial asumible.
- Aprendizaje de idiomas: reproduccion de pronunciacion de palabras y frases coreanas, con la posibilidad de leer terminos ingleses intercalados en su forma hangul.
- Asistentes conversacionales embebidos: sintesis de respuestas cortas en chatbots o interfaces de voz en el navegador, donde los grafos de frames dinamicos reducen la latencia en locuciones de 1-2 segundos.
- Generacion de avisos y notificaciones: lectura de mensajes, alertas y confirmaciones dentro de una aplicacion web progresiva (PWA) sin dependencia de servicios TTS en la nube.
- Prototipado e investigacion: base ligera para experimentar con pipelines TTS en el cliente y comparar el comportamiento de los grafos dinamicos frente a los de longitud fija.
- Contenido educativo o de divulgacion: narracion de textos breves en coreano en entornos sin conectividad o con ancho de banda limitado, una vez cacheado el modelo.

## Benchmarks y rendimiento

La model card solo aporta una medida de velocidad, no resultados de benchmarks de calidad (MOS, WER ni similares).

| Metrica | Valor | Condiciones |
|---|---|---|
| RTF (real-time factor) | 0,049 | onnxruntime-web 1.30, WASM, 1 hilo, Apple M1 Pro, grafos de longitud fija |
| Tiempo de sintesis | aproximadamente 0,22 s | Frase de 4,4 s con grafos fijos |
| Aceleracion con grafos dinamicos | aproximadamente 3x | Locucion de 1-2 s frente a grafos de 512 frames fijos |
| Similitud frente a grafos fijos | SNR 30-43 dB | Diferencias solo en el borde con padding |
| Fidelidad de fonemas | 44 de 46 frases identicas | Frente a la segmentacion con mecab-ko del runtime base, en frases conversacionales |

No se han publicado resultados de benchmarks de calidad de sintesis (MOS, inteligibilidad) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta pensado para `onnxruntime-web` sobre WASM, por lo que funciona sin GPU; el autor reporta RTF 0,049 en un Apple M1 Pro con un solo hilo.
- VRAM: no aplica en el caso de uso principal (WASM en navegador); no se especifican requisitos de VRAM para ejecucion nativa con otros runtimes.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU para este paquete.
- GPU de consumo: no se aportan datos de compatibilidad con RTX 4090, A100 o H100 para esta build.
- Despliegue: `onnxruntime-web` (WASM) es el runtime objetivo documentado. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS en ONNX.
- Latencia y throughput: aproximadamente 0,22 s para una frase de 4,4 s en las condiciones indicadas; el throughput en otros equipos no esta documentado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo base del que deriva es `akamotaco/ppaso-tts-v1`, tambien Apache 2.0 y de un solo hablante en coreano, y su corpus se genero con Fun-CosyVoice 3.0 (0,5B, Apache 2.0), un modelo de mayor tamano y proposito general.

| Modelo | Tipo | Idiomas | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| 132262b/ppaso-tts-onnx-web | TTS en cascada, un hablante | coreano | Apache 2.0 | ONNX (navegador) | no disponible |
| akamotaco/ppaso-tts-v1 | TTS en cascada, un hablante | coreano | Apache 2.0 | runtime original | no disponible |
| Fun-CosyVoice 3.0 (0,5B) | TTS generativo | multilingue | Apache 2.0 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite seleccion de voz ni clonacion.
- Solo coreano: el soporte de ingles se limita a transliterar palabras a hangul; no sintetiza ingles real ni otros idiomas.
- La sustitucion de mecab-ko por coincidencia mas larga contra el lexico produce fonemas distintos en 2 de 46 frases de prueba, segun el propio autor; palabras fuera del lexico pueden pronunciarse de forma incorrecta.
- Riesgo de artefactos en el borde del audio con los grafos dinamicos: las diferencias frente a los grafos fijos se concentran en el padding (SNR 30-43 dB).
- No se documentan evaluaciones de sesgos, MOS ni inteligibilidad; la calidad percibida no esta cuantificada en la informacion disponible.
- El corpus de entrenamiento del modelo base fue sintetico (generado con Fun-CosyVoice 3.0), lo que puede introducir las limitaciones propias de los datos sinteticos.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de atribucion del modelo base, del CMU Pronouncing Dictionary (`LICENSE-cmudict`, licencia tipo BSD) y de g2pK.
- El repositorio indica un tamano de 0,0 GB, incoherente con los aproximadamente 43 MB descritos; conviene verificar los ficheros reales antes de integrarlo en produccion.
- Fecha de creacion del repositorio en 2026 y cero descargas: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/132262b/ppaso-tts-onnx-web
- Modelo base: https://huggingface.co/akamotaco/ppaso-tts-v1
- Fun-CosyVoice 3.0 (corpus sintetico del base): https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512_RL
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict
- g2pK (reglas ingles a hangul): https://github.com/Kyubyong/g2pK
