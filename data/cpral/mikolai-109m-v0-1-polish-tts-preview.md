# cpral/MikolAI-109M-v0.1-Polish-TTS-Preview

## Resumen

MikołAI 109M v0.1 es un modelo de síntesis de voz (text-to-speech) para polaco desarrollado por el usuario cpral (con código en el repositorio de adamo1139). Se trata de un modelo pequeño, de aproximadamente 109 millones de parámetros, entrenado desde cero para convertir texto polaco en audio a 48 kHz con una única voz sintética masculina. Su propuesta diferencial es prescindir de fonemas y de un G2P externo: lee texto polaco en bruto y funciona más rápido que el tiempo real incluso en CPU convencional.

Arquitectónicamente sigue el esquema BlueTTS / Supertonic: un modelo texto→laten tes con flow matching en el espacio latente de un códec de voz propio a 48 kHz, un predictor de duración separado y un decodificador de códec que convierte latentes en audio. No hay autoregresión: la emisión completa se calcula de una vez en una docena de pasos de Euler con classifier-free guidance.

El modelo es relevante porque demuestra que la destilación de un profesor grande (VoxCPM2) hacia un alumno pequeño puede producir un TTS monolingüe de calidad aceptable con un coste computacional muy bajo (unos 70 GFLOP por segundo de audio en configuración por defecto, y unos 22 GFLOP con CFG 1 y 8 pasos). Es un preview (v0.1) con documentación aún en curso (WIP) y descargas muy reducidas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching en espacio latente sobre códec de voz propio (esquema BlueTTS / Supertonic), sin autoregresión |
| Parametros totales | 109.100.101 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | polaco (pl) |
| Licencia | openmdw-1.1 (etiquetada como "other" con license_name openmdw-1.1) |
| Formato de pesos | safetensors (fp32, aprox. 440 MB) |

Desglose de parámetros por componente según la model card:

| Componente | Parametros |
|---|---|
| Encoder de texto | 6,9M |
| Campo vectorial (flow matching) | 64,0M |
| Predictor de duración | 0,35M (+0,15M encoder de estilo) |
| Decodificador del códec | 37,8M |
| Encoder de estilo | 3,7M |

## Arquitectura y entrenamiento

El modelo se compone de cinco piezas. Un encoder de texto (6,9M) convierte caracteres (letras, dígitos, puntuación, mayúsculas diferenciadas) en representaciones mediante 6 bloques ConvNeXt y 4 capas de attention, combinadas con el estilo de voz. Un campo vectorial de 64,0M, con 4 bloques ConvNeXt de dilataciones 1/4/16/48, condicionado por el tiempo de flujo y el estilo y con cross-attention al texto con RoPE, opera sobre latentes de 144 dimensiones a 15,6 frames por segundo. Un predictor de duración (0,35M más 0,15M de encoder de estilo) estima la longitud total de la emisión a partir del texto y el estilo. El decodificador del códec (37,8M) transforma latentes de 24 canales a 93,75 frames por segundo en 10 bloques ConvNeXt causales (25,3M), una cabeza de 512 muestras y un módulo de corrección espectral STFT (12 bloques ConvNeXt, 12,5M) que entrega audio a 48 kHz. Por último, un encoder de estilo (3,7M) calcula una vez el estilo de voz a partir de una grabación de referencia; el resultado se distribuye en `glosy/poziomka.safetensors`.

La síntesis parte de ruido y aplica 16 pasos de Euler con classifier-free guidance (CFG 4, es decir, dos pasadas del campo por paso) y después el decodificador. El entrenamiento se hizo desde cero, sin ajustar pesos ajenos, en 6× RTX 3090 Ti, usando promediado periódico de pesos entre tarjetas (local SGD) en lugar de sincronización de gradientes, porque PCIe no daba abasto con DDP convencional. Los datos son aproximadamente 440 horas de habla polaca de una sola voz generada por VoxCPM2 (destilación profesor grande → alumno pequeño), a partir de los datasets de RockTheBoat (367h limpias, 367h, y variantes con números leídos en palabras). La voz es sintética, masculina, generada por VoxCPM2 y no pertenece a ninguna persona real.

## Capacidades

- Síntesis de voz monolingüe en polaco a 48 kHz con una única voz masculina sintética.
- Lectura de texto polaco en bruto sin fonemas ni G2P externo: admite letras, dígitos, puntuación y mayúsculas.
- Control de calidad/velocidad mediante parámetros de inferencia: CFG y número de pasos (por ejemplo, CFG 1 y 8 pasos para una síntesis más rápida).
- Predicción automática de la duración de la emisión a partir del texto y el estilo.
- Estilo de voz fijado mediante un fichero de estilo precalculado (`glosy/poziomka.safetensors`); el encoder de estilo solo se ejecuta una vez.
- Síntesis no autoregresiva: la emisión completa se calcula en un número fijo de pasos, lo que facilita el procesamiento por lotes.
- Ejecución más rápida que el tiempo real en CPU convencional según el autor.
- No se documentan tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Audiolibros y lectura de textos largos en polaco: el modelo lee texto en bruto sin G2P y genera a 48 kHz, adecuado para narración de contenido con una voz consistente.
- Sistemas de anuncios y avisos automatizados: mensajes de tienda, citas o recordatorios (el ejemplo de la model card es una confirmación de cita en una peluquería), donde la latencia baja y la ejecución en CPU abaratan el despliegue.
- Accesibilidad y lectores de pantalla para polaco: conversión de texto a voz en entornos con recursos limitados, ya que funciona más rápido que el tiempo real en CPU.
- Asistentes de voz y contestadores telefónicos: respuestas pregrabadas dinámicamente para IVR en polaco, con la ventaja de no requerir GPU.
- Pruebas de pronunciación y prototipado de TTS: al no necesitar G2P externo, sirve como base para experimentar con estilos y configuraciones de CFG/pasos.
- Generación de voces para vídeos, pódcast y demos de producto en polaco, con una única voz sintética libre de derechos de persona real.
- Investigación en destilación de TTS: ejemplo reproducible de destilación profesor (VoxCPM2) → alumno pequeño (109M) sobre 440 h de audio sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo aporta métricas de coste computacional: aproximadamente 70 GFLOP por segundo de audio con los ajustes por defecto (CFG 4, 16 pasos) y aproximadamente 22 GFLOP con CFG 1 y 8 pasos. No se ofrecen valores de MOS, WER, RTF ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB y los pesos están en fp32 (unos 440 MB), por lo que el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería bastar, aunque el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: sí, con amplio margen (el propio entrenamiento se hizo en 6× RTX 3090 Ti, pero para inferencia el modelo es muy pequeño).
- Opciones de despliegue: la librería oficial es `adamo1139/mikolai` (PyTorch, instalable con `pip install "git+https://github.com/adamo1139/mikolai"`), con CLI `mikolai` y API Python `MikolAI.from_pretrained(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor afirma que funciona más rápido que el tiempo real incluso en CPU convencional; no se publican cifras de RTF ni de latencia por segundo de audio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales con otros modelos TTS en la información proporcionada. A continuación se comparan únicamente características declaradas frente a alternativas conocidas de la misma categoría, marcando como "no disponible" lo que no se puede verificar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MikołAI 109M v0.1 | 109,1M | no disponible | pl | openmdw-1.1 | safetensors |
| VoxCPM2 (profesor) | no disponible | no disponible | no disponible | no disponible | no disponible |
| BlueTTS / Supertonic (base arquitectónica) | no disponible | no disponible | no disponible | MIT (código, según notas del repo) | no disponible |

La comparación de rendimiento (MOS, WER, RTF) con otros TTS polacos no está disponible en la información consultada.

## Limitaciones y advertencias

- Modelo en estado preview (v0.1) y documentación WIP: la propia model card advierte de que el README y los detalles de implementación están incompletos.
- Monolingüe: solo soporta polaco; no hay capacidades multilingües declaradas.
- Una única voz sintética masculina; no se documenta clonación de voz ni selección entre múltiples voces.
- Entrenado sobre habla generada por VoxCPM2 (destilación), por lo que puede heredar artefactos, sesgos prosódicos o limitaciones del profesor.
- Riesgo de errores de pronunciación en palabras ambiguas, siglas, números o nombres propios; la model card menciona variantes de dataset específicas para números leídos en palabras, lo que sugiere que este es un punto débil conocido.
- No se publican métricas objetivas de calidad (MOS, WER) ni evaluaciones independientes; las 4 descargas y 1 like indican adopción muy temprana.
- Licencia openmdw-1.1 (etiquetada como "other"): conviene revisar el fichero LICENSE antes de uso comercial; el código de arquitectura procede de BlueTTS y blue-codec con notas MIT separadas.
- Sin soporte documentado de tool calling, agentes, visión o audio de entrada; es exclusivamente TTS.
- El ejemplo de código de la model card referencia `cpral/MikolAI-113M-1-Polski-TTS`, un identificador distinto del repo actual (`cpral/MikolAI-109M-v0.1-Polish-TTS-Preview`), lo que puede provocar errores al copiar el snippet.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/MikolAI-109M-v0.1-Polish-TTS-Preview
- Librería PyTorch: https://github.com/adamo1139/mikolai
- Repositorio de experimentos (desordenado): https://github.com/adamo1139/syntezujemy_polska_mowe
- Dataset: https://huggingface.co/datasets/RockTheBoat/VoxCPM2-pol-one-voice-367h-czyste
- Dataset: https://huggingface.co/datasets/RockTheBoat/VoxCPM2-pol-one-voice-liczby-slownie-czyste
- Dataset: https://huggingface.co/datasets/RockTheBoat/VoxCPM2-pol-one-voice-367h
- Dataset: https://huggingface.co/datasets/RockTheBoat/VoxCPM2-pol-one-voice-liczby
- Muestras de audio: https://huggingface.co/cpral/MikolAI-113M-1-Polski-TTS/resolve/main/probki/wizyta.wav
- Muestras de audio: https://huggingface.co/cpral/MikolAI-113M-1-Polski-TTS/resolve/main/probki/szybciej_cfg1_kroki8.wav
