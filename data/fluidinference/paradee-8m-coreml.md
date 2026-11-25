# FluidInference/paradee-8m-coreml

## Resumen
Paradee-8M Core ML es la conversión a Core ML del modelo de síntesis de voz Paradee-8M, desarrollado originalmente por Sahil Mahendrakar y destilado a partir de Kokoro-82M. Lo publica FluidInference como parte de su ecosistema FluidAudio, orientado a inferencia local en Apple Silicon. El modelo resuelve la generación de audio de voz a 24 kHz con un coste computacional muy reducido: unos 8 millones de parámetros que caben en 11-12 MB en cuantización int8.

La relevancia actual del modelo reside en su eficiencia extrema y en su integración nativa con Core ML, lo que permite síntesis de voz en tiempo real en CPU de dispositivos Apple sin GPU dedicada. La versión v1.3 amplía el soporte idiomático del inglés original a hindi, francés y español, e incorpora un modelo G2P (grafema a fonema) propio con licencia Apache-2.0 que evita la dependencia de eSpeak NG (GPL-3.0).

La arquitectura subyacente es un sistema de dos etapas (texto y acústica) con un cabezal source-filter de tasa de trama, derivado de la destilación de Kokoro-82M. El repositorio distribuye variantes int8 y fp32, junto con el modelo G2P y los ficheros de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de dos etapas (ParadeeText + ParadeeAcoustic) con cabezal source-filter de tasa de trama; destilación de Kokoro-82M |
| Parametros totales | ~8M (modelo TTS); G2P adicional de 0,76M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada fonémica por utterance; límites de forma en config.json) |
| Tipos de cuantizacion | int8 (por canal, por defecto), fp32 |
| Idiomas soportados | Inglés (americano y británico), hindi, francés, español |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlmodelc, .mlpackage); pesos int8 y fp32 |

## Arquitectura y entrenamiento
El modelo es una destilación de Kokoro-82M a aproximadamente 8 millones de parámetros, lo que supone una reducción de un orden de magnitud manteniendo la calidad de síntesis. La inferencia se divide en dos grafos Core ML: ParadeeText, que recibe los ids de fonemas y el selector de voz y produce la duración, las características acústicas intermedias y los tokens ASR; y ParadeeAcoustic, que recibe esas características junto con el ruido y el selector de voz para generar el audio a 24 kHz.

La versión v1.2 introdujo un cabezal source-filter de tasa de trama (heredado de v1.1) reescrito para Core ML, con STFT/iSTFT mediante GEMM, fase armónica en punto fijo int32 y banco de senos en forma cerrada. El ruido se pasa como entrada, de modo que los grafos son deterministas. La v1.3 mantiene los grafos de v1.2 y amplía la tabla de voces a ocho filas. El modelo G2P asociado es un CTC de 0,76M parámetros que convierte grafemas en fonemas al estilo eSpeak NG para hindi, francés y español, y cubre también palabras inglesas sin entrada en misaki. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades
- Síntesis de voz a 24 kHz con ocho voces en v1.3: `af_heart`, `bf_isabella`, `am_puck`, `bm_fable`, `hf_alpha`, `hm_omega`, `ff_siwis`, `em_alex`.
- Generación de audio determinista al recibir el ruido como entrada.
- Conversión de grafema a fonema integrada para hindi, francés y español mediante un CTC de 0,76M parámetros.
- Soporte de inglés americano y británico con léxico diferenciado (misaki y `gb_lexicon_cache.json`).
- Ejecución en CPU de Apple Silicon con Core ML (`CPU_ONLY` o `CPU_AND_NE`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de texto a voz.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso
- Lectura por voz en aplicaciones iOS y macOS: el modelo se integra mediante FluidAudio (`ParadeeManager`, v1.3 por defecto) y permite narrar texto en local sin conexión, con un consumo de memoria de unos 11 MB en int8.
- Asistentes de voz embebidos: la latencia de aproximadamente 190-200 veces tiempo real en CPU permite respuestas habladas casi instantáneas en dispositivos Apple sin GPU dedicada.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual o dificultades de lectura, con voces en inglés, hindi, francés y español.
- Localización de contenido multilingüe: generación de locuciones en cuatro idiomas con un único modelo y un G2P común, útil para audiolibros, cursos y material formativo.
- Síntesis en pipelines de preproducción: generación de borradores de voz en off para vídeo o pódcast antes de la grabación definitiva con voces profesionales.
- Prototipado de interfaces conversacionales: pruebas de UX de voz en simuladores y dispositivos reales con un modelo pequeño que cabe en el repositorio de la app (0,2 GB en total).
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en local, el texto del usuario no sale del dispositivo, lo que facilita el cumplimiento de normativas de protección de datos.

## Benchmarks y rendimiento
Resultados publicados en la model card (M5 Pro, macOS 27):

| Metrica | v1.3 | v1.2 |
|---|---|---|
| WER Whisper large-v3-turbo, inglés (fp32) | 3,09 % | 3,39 % |
| WER Whisper large-v3-turbo, hindi (fp32) | 10,74 % | No aplica |
| WER Whisper large-v3-turbo, francés (fp32) | 7,89 % | No aplica |
| WER Whisper large-v3-turbo, español (fp32) | 5,26 % | No aplica |
| WER Whisper large-v3-turbo, inglés (int8) | 3,09 % | 3,28 % |
| WER Whisper large-v3-turbo, hindi (int8) | 10,37 % | No aplica |
| WER Whisper large-v3-turbo, francés (int8) | 7,02 % | No aplica |
| WER Whisper large-v3-turbo, español (int8) | 5,26 % | No aplica |
| Diferencia de duración vs PyTorch | 0 | 0 |
| L1 log-mel vs ONNX fp32 | ≤ 0,011 | ≤ 0,012 |
| Velocidad en CPU | ~190-200× tiempo real | ~200× tiempo real |

Resultados de FluidAudio `tts-benchmark` (int8, incluye frontend de texto): inglés 0,73-1,18 % WER por voz, francés 2,92 %, español 1,08 % (ida y vuelta con Parakeet), hindi 15 % WER / 6 % CER con Whisper; 137-177× tiempo real. El G2P presenta un CER de fonemas frente a eSpeak NG de 0,71 % (hindi), 0,66 % (francés) y 0,30 % (español) sobre las transcripciones de test de FLEURS.

## Requisitos de hardware
- VRAM: no aplica en el sentido tradicional; el modelo ocupa unos 11 MB en int8 y 34 MB en fp32 para los dos grafos, más 3,9 MB del G2P.
- GPU recomendadas: no requiere GPU; está diseñado para CPU de Apple Silicon. El backend `ALL` o `CPU_AND_GPU` aborta por las LSTM, por lo que debe usarse `CPU_ONLY` o `CPU_AND_NE`.
- Cabe en cualquier dispositivo Apple Silicon; no se han publicado requisitos para hardware no Apple.
- Opciones de despliegue: Core ML a través de FluidAudio (`ParadeeManager`), o carga directa de los `.mlmodelc` con las APIs de Core ML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de audio y no de texto generativo.
- Latencia y throughput: aproximadamente 190-200 veces tiempo real en CPU (M5 Pro) para los dos modelos; 137-177 veces tiempo real en el benchmark de FluidAudio con frontend incluido.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Paradee-8M Core ML (este) | ~8M | en, hi, fr, es | Apache-2.0 | Core ML | Destilado de Kokoro, 24 kHz, 8 voces |
| Kokoro-82M | 82M | en (principalmente) | Apache-2.0 | safetensors, ONNX, Core ML | Modelo original del que se destila; mayor tamaño y calidad potencialmente superior |
| Paradee-8M (original) | ~8M | en, hi, fr, es | Apache-2.0 | ONNX, PyTorch | Versión upstream sin conversión Core ML; referencia de calidad |
| eSpeak NG | No aplica (sintetizador de formantes) | Múltiples | GPL-3.0 | Código nativo | Referencia fonémica; licencia incompatible con uso comercial permisivo |

No se dispone de datos de benchmarks comparativos directos entre Paradee-8M y Kokoro-82M en la información proporcionada.

## Limitaciones y advertencias
- Modelo exclusivamente de texto a voz: no genera texto, no razona y no soporta herramientas ni agentes.
- El hindi presenta una tasa de error más alta (15 % WER / 6 % CER en el benchmark de FluidAudio), en parte por variantes ortográficas.
- El español y el francés dependen de un G2P propio; la calidad fonémica es buena (CER ≤ 0,71 % frente a eSpeak NG) pero no se han publicado evaluaciones subjetivas de naturalidad.
- El modelo está diseñado para Core ML y Apple Silicon; no hay soporte documentado para otras plataformas.
- El ruido debe pasarse como entrada para obtener resultados deterministas; sin él, la salida puede variar.
- Licencia Apache-2.0 permite uso comercial, pero el G2P upstream original usaba eSpeak NG (GPL-3.0); la versión incluida evita esa dependencia, aunque conviene verificar la procedencia de los datos de entrenamiento del G2P.
- No se han publicado datos sobre sesgos demográficos o acústicos en las voces.
- El tamaño reducido (8M parámetros) implica menor expresividad y naturalidad que modelos de mayor escala; es adecuado para aplicaciones embebidas, no necesariamente para doblaje profesional.

## Enlaces
- Hugging Face: https://huggingface.co/FluidInference/paradee-8m-coreml
- Modelo base v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Modelo base v1.2: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2
- Modelo base v1.0: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Paper: https://arxiv.org/abs/2610.06817
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Código de conversión v1.0 y v1.2: https://github.com/FluidInference/mobius/tree/main/models/tts/paradee/coreml
- Pull request G2P upstream: https://github.com/sahilmahendrakar/paradee/pull/13
- Kokoro-82M Core ML (léxico británico): https://huggingface.co/FluidInference/kokoro-82m-coreml
