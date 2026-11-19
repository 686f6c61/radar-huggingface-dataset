# software-mansion/higgs-audio-v2-tokenizer-Reverb

## Resumen

higgs-audio-v2-tokenizer-Reverb es la exportación a ExecuTorch del códec de audio de Higgs Audio v2, publicada por Software Mansion como componente del sistema Reverb-TTS. No se trata de un modelo generativo de texto, sino de un tokenizador neuronal de audio (codec) que convierte señal de voz monofónica a 24 kHz en una matriz de 8 codebooks de 1024 códigos a 25 frames por segundo y la reconstruye de vuelta. El modelo base es bosonai/higgs-audio-v2-tokenizer, desarrollado por Boson AI.

El interés de esta variante concreta es la portabilidad: los pesos se distribuyen como programas `.pte` para el runtime ExecuTorch v1.4.1, con variantes cuantizadas a fp16, int8 e int4 orientadas a Core ML en dispositivos Apple, además de los safetensors cuantizados de origen. Esto permite ejecutar el códec íntegramente en el dispositivo (on-device) dentro de la librería React Native ExecuTorch, sin depender de un servidor para la tokenización o síntesis de audio.

El repositorio ocupa 2,6 GB e incluye el codificador (basado en HuBERT) y el decodificador del códec. Su relevancia actual radica en que habilita pipelines de TTS y de procesamiento de voz en aplicaciones móviles con latencias de decenas de milisegundos por fragmento de audio, manteniendo una calidad medida frente a la referencia fp32 en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio: codificador tipo HuBERT + cuantizador residual de 8 codebooks + decodificador; exportado a ExecuTorch/Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 0,16 a 41 s en decodificación y de 1 a 20 s en codificación |
| Tipos de cuantizacion | fp16 (decoder), int8 (decoder y encoder), int4 (encoder); GPTQ y quantization-aware training en el decoder |
| Idiomas soportados | no disponible (evaluación del encoder en 7 idiomas sin especificar) |
| Licencia | higgs-audio-v2-tokenizer-license (other) |
| Formato de pesos | `.pte` (ExecuTorch) y safetensors cuantizados con `quantization.json` |

## Arquitectura y entrenamiento

El códec sigue un esquema encoder-cuantizador-decoder. El codificador, derivado de HuBERT, transforma audio mono a 24 kHz en tramas de 960 muestras (40 ms) y las proyecta a 8 codebooks de 1024 entradas cada uno mediante un cuantizador residual, donde el codebook 0 es el más grueso. El decodificador invierte el proceso: recibe una matriz `int64 [8, T]` y devuelve muestras `float32` a 24 kHz, sin recorte a [-1, 1]. El codificador acepta entrada en `float32 [frames, 960]` y realiza el remuestreo y la conversión a mono fuera del grafo.

La exportación está optimizada para Core ML: el decodificador usa CPU y GPU con cómputo fp16, y el codificador se restringe a CPU con cómputo fp32 porque sus activaciones requieren esa precisión y porque en GPU Core ML expande entre 1,4 y 2,6 GB de pesos fp32. Las variantes int8 del decodificador proceden de GPTQ y de quantization-aware training de las escalas (una escala por cada 8 canales de entrada); las del codificador usan pesos entrenados con QAT, con int4 en las capas transformer de HuBERT e int8 en el resto. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Tokenización de audio: convierte voz mono a 24 kHz en 8 codebooks de 1024 códigos a 25 fps (960 muestras por frame).
- Reconstrucción de audio: decodifica códigos a forma de onda de 24 kHz, con SNR de 54,8 dB en fp16 y 44,2 dB en int8 frente a la referencia fp32.
- Codificación de segmentos de 1 a 20 s (25 a 500 frames) y decodificación de 0,16 a 41 s (4 a 1024 frames).
- Ejecución on-device en iOS mediante ExecuTorch v1.4.1 y React Native ExecuTorch v0.11.1.
- Integración como componente del pipeline Reverb-TTS para síntesis de voz.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling: es exclusivamente un códec de audio.
- Capacidades multilingües: el encoder se evaluó en 7 idiomas, pero no se detalla cuáles ni el nivel de cobertura.

## Casos de uso

- Síntesis de voz en aplicaciones móviles: integrado en Reverb-TTS, el decodificador convierte los códigos generados por el modelo de lenguaje de TTS en audio reproducible en 53 ms por cada 5 s de audio en un iPhone 17, sin salir del dispositivo.
- Asistentes de voz offline: el par encoder-decoder permite comprimir y reconstruir voz en local, útil en apps que deben funcionar sin conectividad o con requisitos de privacidad estrictos.
- Tokenización de datasets de voz para entrenamiento: el encoder int8 produce códigos con un 99,51% de coincidencia respecto a fp32 en clips de 5 s, lo que permite preprocesar corpus de audio de forma económica.
- Compresión de audio para almacenamiento o transmisión: 8 codebooks de 1024 entradas a 25 fps ofrecen una representación discreta y compacta de la señal, adecuada para almacenar voz en bases de datos o transmitirla entre cliente y servidor.
- Integración en pipelines de React Native: la librería React Native ExecuTorch expone constantes de modelo en su registro, de modo que una app puede descargar y ejecutar el códec con la API de tareas correspondiente.
- Evaluación y prototipado de códecs neuronales: las variantes int4 e int8 del encoder permiten medir el compromiso entre calidad (94,57% a 99,07% de coincidencia) y consumo de memoria en dispositivos reales.
- Procesamiento de voz en tiempo casi real en el borde: el encoder procesa 5 s de audio en 0,32-0,38 s, lo que posibilita transcripción o análisis por lotes en el dispositivo.

## Benchmarks y rendimiento

Mediciones publicadas en la model card, sobre iPhone 17 (iOS 26.6) con las librerías nativas de React Native ExecuTorch v0.11.1. La calidad se mide frente al códec fp32 de PyTorch: SNR de la forma de onda en el decodificador (14 clips) y porcentaje de códigos iguales en el codificador (57 clips en 7 idiomas).

| Fichero | Tiempo | Memoria pico | Calidad vs fp32 |
|---|---|---|---|
| decoder fp16 | 53 / 107 ms por 5 / 10 s | ~200 MB a 10 s | 54,8 dB |
| decoder int8 | 53 / 109 ms por 5 / 10 s | ~690 MB a 10 s | 44,2 dB |
| encoder int8 | 0,38 / 0,84 / 1,97 s por 5 / 10 / 20 s | 420 / 829 MB a 10 / 20 s | 99,51 / 99,10 / 96,63% |
| encoder int4 | 0,32 / 0,75 / 1,86 s por 5 / 10 / 20 s | 420 / 860 MB a 10 / 20 s | 99,07 / 98,31 / 94,57% |

Tamaños de los ficheros: decoder fp16 43,6 MB, decoder int8 23,3 MB, encoder int4 136 MB, encoder int8 176 MB.

## Requisitos de hardware

- VRAM/RAM: el decodificador fp16 requiere ~200 MB de memoria pico a 10 s de audio; el int8, ~690 MB por la expansión de pesos en GPU de Core ML. El codificador necesita 420 MB a 10 s y 829-860 MB a 20 s.
- GPU recomendadas: no se publican requisitos para GPU de escritorio; las mediciones son en iPhone 17 con Core ML (CPU y GPU para el decoder, solo CPU para el encoder).
- GPU de consumo: no hay datos de ejecución en RTX 4090, A100 o H100; el artefacto está pensado para Apple Silicon y dispositivos iOS.
- Despliegue: ExecuTorch v1.4.1 (sin garantía de compatibilidad hacia delante), React Native ExecuTorch v0.11.1, y safetensors cuantizados para otros runtimes.
- Latencia y throughput: decodificación de ~10,6-10,9 ms por segundo de audio; codificación de ~76-84 ms por segundo de audio en int8 e int4 respectivamente (cálculo a partir de los tiempos publicados).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/ventana | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| higgs-audio-v2-tokenizer-Reverb | Códec de audio (encoder+decoder) | 0,16-41 s (decoder); 1-20 s (encoder) | fp16, int8, int4 | higgs-audio-v2-tokenizer-license | ExecuTorch `.pte` + safetensors |
| bosonai/higgs-audio-v2-tokenizer | Códec de audio (modelo base) | no disponible | no disponible | higgs-audio-v2-tokenizer-license | Pesos originales en Hugging Face |
| Reverb-TTS | Sistema TTS completo | no disponible | no disponible | no disponible | Hugging Face (software-mansion) |

No se dispone de datos de benchmarks ni de especificaciones de otros códecs de audio comparables (por ejemplo, EnCodec o DAC) en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia `other` (higgs-audio-v2-tokenizer-license): es necesario revisar los términos del enlace de licencia antes de cualquier uso comercial.
- Compatibilidad estricta con ExecuTorch v1.4.1: ExecuTorch no garantiza compatibilidad hacia delante, por lo que runtimes más antiguos pueden fallar al cargar los `.pte`.
- El encoder solo admite entrada mono a 24 kHz; el remuestreo y la conversión a mono deben hacerse fuera del modelo.
- Límites de longitud: el encoder acepta entre 25 y 500 frames (1-20 s) y el decoder entre 4 y 1024 frames (0,16-41 s); fuera de esos rangos no está soportado.
- El decoder int8 ocupa más memoria en ejecución que el fp16 (~690 MB frente a ~200 MB) porque Core ML expande los pesos en la GPU.
- El encoder debe ejecutarse en CPU: en GPU, Core ML mantiene 1,4-2,6 GB de pesos fp32 expandidos.
- No se detallan sesgos, tasas de alucinación ni cobertura lingüística concreta; al ser un códec, el riesgo de alucinación se manifiesta como artefactos de reconstrucción, no como texto inventado.
- Solo se han publicado mediciones en iPhone 17 con iOS 26.6; el rendimiento en otros dispositivos Apple no está documentado.
- Las variantes cuantizadas degradan la calidad de forma medible: el decoder int8 baja de 54,8 a 44,2 dB de SNR y el encoder int4 cae al 94,57% de coincidencia en clips de 20 s.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/higgs-audio-v2-tokenizer-Reverb
- Modelo base: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer
- Licencia: https://huggingface.co/bosonai/higgs-audio-v2-tokenizer/blob/main/LICENSE
- Sistema Reverb-TTS: https://huggingface.co/software-mansion/Reverb-TTS
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
