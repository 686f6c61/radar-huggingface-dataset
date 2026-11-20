# ramin-mahmoodi/persian-zipformer-asr

## Resumen

Persian Zipformer-Transducer ASR es un sistema de reconocimiento automático del habla (ASR) especializado en persa (farsi), desarrollado por Ramin Mahmoodi y publicado bajo licencia Apache 2.0. Emplea la arquitectura Zipformer-Transducer, concretamente la variante `pruned_transducer_stateless7` (zipformer2) del ecosistema k2-fsa/icefall, y se distribuye en formato ONNX tanto en FP32 como en INT8 cuantizado para inferencia eficiente en CPU y dispositivos edge.

El modelo resuelve el problema de la transcripción de voz en persa con un consumo de recursos muy reducido: el paquete INT8 completo ocupa aproximadamente 110 MB (encoder 108 MB, decoder 1,7 MB, joiner 0,4 MB). Está entrenado con más de 830 horas de audio persa procedente de Common Voice 17.0, Google FLEURS y el corpus Mana Persian, y declara un factor de tiempo real (RTF) inferior a 0,05 en CPU estándar.

Su relevancia actual radica en que ofrece una alternativa ligera y sin dependencias pesadas (no requiere PyTorch ni CUDA) para integrar ASR persa en aplicaciones móviles, web (WebAssembly) y servidores de baja capacidad mediante sherpa-onnx. Incluye además un postprocesador específico para restaurar el medio espacio persa (نیم‌فاصله, U+200C).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer-Transducer (zipformer2, `pruned_transducer_stateless7`) |
| Parametros totales | ~65,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada en ventanas de 25 ms con salto de 10 ms) |
| Tipos de cuantizacion | ONNX FP32 e INT8 |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder, decoder y joiner por separado) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer (RNN-T) con encoder Zipformer de segunda generación, la variante `pruned_transducer_stateless7` del recetario de icefall. La entrada de audio es a 16 kHz con características log-mel de 80 dimensiones, ventana de 25 ms y salto de 10 ms. El vocabulario consta de 1.024 unidades subword generadas con SentencePiece (BPE). La decodificación se realiza con búsqueda de haz modificada (`modified_beam_search`) con poda de caminos (`max_active_paths=4`).

El entrenamiento utilizó más de 830 horas de audio persa proveniente de Mozilla Common Voice 17.0, Google FLEURS y el corpus Mana Persian. Los pesos publicados son el promedio de los 5 mejores checkpoints (pasos 122,5k–132,5k, época 5). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales. La innovación principal es la exportación a ONNX con cuantización INT8, que según el autor mantiene la precisión FP32 con un margen de 0,05 %, reduce el uso de RAM en torno al 60 % y acelera la inferencia en CPU entre un 35 % y un 40 %.

## Capacidades

- Transcripción de voz a texto en persa (reconocimiento offline, no streaming).
- Decodificación con búsqueda de haz modificada y poda de caminos.
- Restauración tipográfica persa mediante `PersianPostProcessor`: medio espacio (U+200C) en prefijos (`می‌`), sufijos (`ها`, `تر`) y compuestos.
- Ejecución sin PyTorch ni CUDA, únicamente con sherpa-onnx.
- Despliegue multiplataforma: C++, Python, Android, iOS, Flutter, Node.js y WebAssembly.
- Inferencia en CPU, Raspberry Pi y servidores edge.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción, ni capacidades multimodales.
- Monolingüe: únicamente persa.

## Casos de uso

- Subtitulado y transcripción de reuniones en persa: el modelo procesa audio a 16 kHz y devuelve texto con tipografía corregida, adecuado para generar actas o subtítulos en herramientas ofimáticas.
- Asistentes de voz en aplicaciones móviles Android/iOS: al ocupar ~110 MB en INT8 y no requerir frameworks pesados, puede empaquetarse en los assets de la app y ejecutarse en el dispositivo sin conexión.
- Atención al cliente telefónica: integración en pipelines de VoIP para transcribir llamadas en persa y alimentar sistemas de análisis o enrutamiento, con RTF < 0,05 en CPU.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos de audio persa para construir índices de texto buscables en archivos, podcasts o medios.
- Dispositivos edge y Raspberry Pi: despliegue de kioscos o dispositivos IoT con reconocimiento de voz persa sin GPU, gracias a la cuantización INT8 y a la baja huella de memoria.
- Accesibilidad: generación de subtítulos en tiempo casi real para contenido audiovisual en persa en navegadores mediante el binding WebAssembly de sherpa-onnx.
- Procesamiento de corpus lingüísticos: transcripción de grabaciones para investigación en lingüística persa, con salida que preserva el medio espacio.

## Benchmarks y rendimiento

Evaluación con `modified_beam_search` (`max_active_paths=4`):

| Conjunto de prueba | Horas / muestras | WER (%) | CER (%) | Precisión por palabra (%) | Precisión por carácter (%) |
|---|---|---|---|---|---|
| Mozilla Common Voice 17.0 (fa) | 1.200+ enunciados | 18,75 | 5,05 | 81,25 | 94,95 |
| Google FLEURS (fa_ir) | 871 enunciados | 25,73 | 5,82 | 74,27 | 94,18 |
| Studio Reading Corpus | 2.000+ enunciados | 5,30 | 1,80 | 94,70 | 98,20 |

El autor indica que la cuantización INT8 mantiene la precisión de FP32 con un margen de 0,05 %, reduce el uso de RAM en torno al 60 % y acelera la inferencia en CPU entre un 35 % y un 40 %. El RTF declarado es inferior a 0,05 en CPU estándar.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El paquete INT8 completo ocupa ~110 MB (encoder 108 MB, decoder 1,7 MB, joiner 0,4 MB), por lo que el consumo de RAM es del orden de cientos de MB.
- GPU: no necesaria. Puede ejecutarse en CPU de escritorio, servidores edge, Raspberry Pi y móviles.
- GPU consumer: no requerida; el modelo no está pensado para inferencia en GPU.
- Despliegue: sherpa-onnx (CLI `sherpa-onnx-offline`, API de Python, C++, Android, iOS, Flutter, Node.js, WebAssembly). No requiere vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF < 0,05 en CPU estándar, es decir, menos de 0,5 s para transcribir 10 s de audio. Configuración de referencia con `num_threads=4`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables de ASR persa (por ejemplo, variantes Whisper o wav2vec2 ajustadas a farsi), por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Persian Zipformer-Transducer ASR | ~65,3 M | Audio 16 kHz, ventanas de 25 ms | Apache 2.0 | ONNX FP32/INT8 | Hugging Face |
| Alternativas ASR persa comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingüe: solo reconoce persa; no soporta otros idiomas ni code-switching documentado.
- WER relativamente alto en dominios espontáneos: 18,75 % en Common Voice 17.0 y 25,73 % en FLEURS, frente al 5,30 % en el corpus de lectura de estudio; el rendimiento depende mucho del dominio y la calidad del audio.
- No es streaming: la API mostrada es `OfflineRecognizer`, orientada a transcripción de audio completo, no a reconocimiento en tiempo real continuo.
- Riesgo de errores en nombres propios, términos técnicos y números, habitual en modelos ASR con vocabulario subword de 1.024 unidades.
- El postprocesador de medio espacio es una corrección heurística y puede introducir errores en casos ambiguos.
- No se documentan sesgos específicos ni evaluaciones de robustez ante acentos, ruido o dialectos persas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su validación comunitaria es nula.
- No se especifican requisitos de atribución más allá de los habituales de Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramin-mahmoodi/persian-zipformer-asr
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Tutorial ASR para Android de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/android/index.html
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
- icefall (recetario k2-fsa): https://github.com/k2-fsa/icefall
- Mozilla Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
