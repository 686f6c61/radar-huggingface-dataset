# fdemelo/pocket-tts-fastdec-2m

## Resumen

pocket-tts-fastdec-2m es un decodificador neuronal sustituto para el modelo de síntesis de voz Pocket-TTS de Kyutai. Lo publica el usuario fdemelo en Hugging Face y su objetivo es sustituir el decodificador Mimi original (transformer causal de 4 capas a 200 Hz más un decodificador SEANet de 249 MMAC/s) por una alternativa convolucional causal mucho más ligera (114 MMAC/s) que permita ejecutar Pocket-TTS en tiempo real en CPUs muy modestas, como una Raspberry Pi Zero W. El repositorio contiene únicamente el nuevo decodificador (2,05 M de parámetros, 8,2 MB en fp32) más un pequeño paquete Python que lo conecta al modelo original de Kyutai.

La relevancia del modelo reside en su enfoque de destilación: no se reentrena el modelo de lenguaje ni el cabezal de flujo, sino que se aprende a mapear los latentes del flow-LM (32 dimensiones a 12,5 Hz) directamente a audio a 24 kHz mediante una arquitectura puramente convolucional y estrictamente causal, con estado de streaming explícito. Esto reduce drásticamente el coste computacional del decodificador y hace viable el despliegue de TTS neuronal en dispositivos de borde sin GPU.

El modelo está pensado para inglés (`en`), se distribuye bajo licencia CC-BY-4.0 y depende de los pesos originales de kyutai/pocket-tts, que están sujetos a sus propios términos de acceso (gated). No incluye el modelo de lenguaje, el tokenizador, las voces ni el codificador Mimi: solo el decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional causal: 5 capas residuales a 12,5 Hz (LayerNorm → conv depthwise causal k=4 → LayerNorm → MLP 256→512→256) + cabecera de 16 subframes × 128 canales + SEANet causal con poda de canales (strides 6/5/4, canales 128/64/32/16, hidden 32/16/8) |
| Parametros totales | 2,05 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del flow-LM de Pocket-TTS; el decodificador procesa latentes a 12,5 Hz con estado de streaming) |
| Tipos de cuantizacion | fp32 en PyTorch; Q8_0 en el motor loom/ggml para Raspberry Pi |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 (los pesos base de kyutai/pocket-tts tienen sus propios términos) |
| Formato de pesos | safetensors (`decoder.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El decodificador sustituye cuatro componentes del Mimi original: la proyección del cuantizador (32→128) pasa a ser una capa `Linear(32→256)`; el sobremuestreo ×16 a 200 Hz se reemplaza por una cabecera que predice 16 subframes × 128 canales por cada frame latente, más una convolución depthwise de suavizado; el transformer causal de 4 capas a 200 Hz se reemplaza por 5 capas residuales que operan a 12,5 Hz con convoluciones depthwise causales de kernel 4 y MLP de 256→512→256; y el SEANet original (ancho base 24, 249 MMAC/s) se sustituye por un SEANet causal podado por canales (114 MMAC/s) con la misma disposición de strides y una unidad residual por etapa. El codificador Mimi, el flow-LM, el tokenizador y los embeddings de voz se mantienen intactos, de modo que el clonado de voz a partir de audio sigue funcionando.

El entrenamiento es una destilación en dos etapas desde el modelo original congelado. En la etapa 1 (20k pasos) se hace regresión de las características a 200 Hz del transformer decodificador del profesor a partir de los latentes, junto con una pérdida STFT a través del SEANet congelado del profesor. En la etapa 2 (120k pasos, LR coseno) se entrenan conjuntamente el núcleo y el SEANet podado, inicializado mediante poda por energía de activación del SEANet del profesor. El decodificador es estrictamente causal y mantiene un estado de streaming explícito, de forma que la decodificación por trozos produce el mismo audio que la decodificación completa (diferencia máxima de 3e-6, verificado en `tests/`).

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz a partir de texto, sustituyendo el decodificador de Pocket-TTS.
- Streaming de audio trozo a trozo con estado causal explícito, con equivalencia numérica respecto a la decodificación completa.
- Clonado de voz desde un fichero WAV, ya que el codificador Mimi original se conserva.
- Compatibilidad con las voces del catálogo de Pocket-TTS (por ejemplo `alba`, `marius`, `javert`).
- Funciona con los modelos ingleses `refl_2026-10` de 2m, 7m y 18m de Pocket-TTS (comparten la normalización de latentes).
- Inferencia en CPU muy limitada gracias a su reducido coste computacional (114 MMAC/s).
- No soporta tool calling, agentes ni multimodalidad: es exclusivamente un decodificador de audio.

## Casos de uso

- Síntesis de voz en Raspberry Pi Zero W: con el motor loom/ggml y pesos Q8_0, el modelo de 2m genera 4,8 s de audio en 3,1 s (GPU VC4) o 3,9 s (CPU), lo que permite asistentes hablados embebidos de bajo coste.
- Dispositivos de borde sin GPU: al requerir solo 8,2 MB en fp32 y 114 MMAC/s, se puede integrar en sistemas empotrados con recursos muy limitados donde el decodificador Mimi original no cabría en tiempo real.
- Lectura de textos largos en streaming: el estado causal permite emitir audio conforme llegan los latentes del flow-LM, adecuado para narración por lotes o interfaces conversacionales de baja latencia.
- Clonado de voz ligero: al conservarse el codificador Mimi, se puede usar un WAV de referencia para generar locuciones con una voz concreta en hardware modesto.
- Prototipado e investigación en destilación de decodificadores de audio: el repositorio incluye el paquete `pocket_tts_fastdec` y pruebas de equivalencia de streaming, útil para estudiar sustituciones convolucionales de decodificadores transformer.
- Aplicaciones de accesibilidad offline: generación de voz en inglés en dispositivos sin conectividad, con licencia CC-BY-4.0 que facilita su redistribución.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| UTMOS22 (12 frases Harvard, voz `alba`, fp32) | 3,83 stock → 3,57 con este decodificador |
| UTMOS22 medio (6 voces, 72 utterances) | caída de ~0,25 respecto al stock |
| WER (Whisper base.en) | dentro del ruido respecto al stock |
| Ruido de semilla | ±0,03 UTMOS |
| Latencia en Raspberry Pi Zero W (2m, Q8_0, 4,8 s de audio) | 3,1 s (GPU VC4) / 3,9 s (CPU) |
| Latencia en Raspberry Pi Zero W (7m) | 4,7 s / 5,8 s (≈ tiempo real) |
| Latencia en Raspberry Pi Zero W (18m) | 8,5–9 s (el LM de 18m es demasiado pesado para esta placa) |
| Coste computacional del SEANet | 249 MMAC/s (stock) → 114 MMAC/s (podado) |

## Requisitos de hardware

- VRAM: no aplica en el caso principal (inferencia en CPU); el decodificador ocupa 8,2 MB en fp32. El consumo total depende del flow-LM de Pocket-TTS cargado.
- GPU recomendadas: no se especifican; el diseño está orientado a CPU. Para el modelo completo de Pocket-TTS se requiere una GPU con memoria suficiente para el LM base, no detallada en la información disponible.
- Cabe en GPU de consumo: el decodificador por sí solo sí; el modelo completo depende del tamaño del LM de Pocket-TTS (2m, 7m o 18m), no detallado.
- Despliegue: PyTorch ≥ 2.5 con `pocket-tts>=4.0.1` y el paquete `pocket_tts_fastdec`; motor loom/ggml con pesos Q8_0 para Raspberry Pi. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Raspberry Pi Zero W, 3,1–3,9 s para 4,8 s de audio con el modelo 2m; 4,7–5,8 s con el 7m; 8,5–9 s con el 18m.

## Comparativa con modelos similares

| Modelo | Parametros (decodificador) | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-tts-fastdec-2m | 2,05 M | no disponible | UTMOS22 3,57 (alba) | CC-BY-4.0 | Hugging Face |
| Decodificador Mimi stock de Pocket-TTS | no disponible | transformer causal a 200 Hz, contexto de 50 pasos | UTMOS22 3,83 (alba) | términos de kyutai/pocket-tts | Hugging Face (gated) |

No se dispone de datos de otros decodificadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El decodificador es deliberadamente con pérdida: algunas voces (por ejemplo `marius`) pierden más calidad que otras; la caída media es de ~0,25 UTMOS.
- Solo soporta inglés (`en`); no se ha probado con otros modelos de Pocket-TTS distintos de los ingleses `refl_2026-10` de 2m, 7m y 18m.
- Requiere los pesos originales de kyutai/pocket-tts, que están gated y sujetos a sus propios términos de uso; la licencia CC-BY-4.0 cubre únicamente este repositorio.
- El repositorio no incluye el modelo de lenguaje, el tokenizador, las voces ni el codificador Mimi; sin los pesos base no es funcional.
- Riesgo de artefactos y pérdida de naturalidad en voces concretas; conviene evaluar con la voz objetivo antes de producción.
- No se han publicado datos sobre sesgos demográficos o acústicos del decodificador.
- El modelo de 18m no es viable en Raspberry Pi Zero W por el peso del LM, aunque el decodificador sí funcione.
- No hay datos de benchmarks más allá de UTMOS22 y WER con Whisper base.en.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdemelo/pocket-tts-fastdec-2m
- Modelo base Pocket-TTS: https://huggingface.co/kyutai/pocket-tts
- Paper referenciado (arXiv:2509.06926): https://arxiv.org/abs/2509.06926
- Muestras de audio: carpeta `samples/` del repositorio en Hugging Face
- Instalación del paquete: `pip install "git+https://huggingface.co/fdemelo/pocket-tts-fastdec-2m"`
