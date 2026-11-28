# aystream/GigaAM-Multilingual-v2-mlx

## Resumen

GigaAM-Multilingual-v2-mlx es una conversión pura a Apple MLX del modelo de reconocimiento automático del habla (ASR) `ai-sage/GigaAM-Multilingual-v2`, desarrollado originalmente por Sber (Salute Developers) y portado por el usuario aystream. El modelo resuelve la transcripción de audio multilingüe en 21 idiomas con soporte de streaming en tiempo real, timestamps a nivel de palabra y detección de actividad de voz (VAD), todo ello sin dependencia del runtime de PyTorch.

La arquitectura es un encoder Zapformer de 25 capas con acondicionamiento FiLM y una cabeza RNN-T de 4027 clases SentencePiece. Cuenta con 771.353.916 parámetros activos y se distribuye en safetensors de aproximadamente 1,5 GB, lo que lo hace viable en hardware de Apple Silicon de gama alta.

Su relevancia actual radica en que ofrece inferencia ASR multilingüe de alta velocidad (hasta ~157x tiempo real en un M2 Max) directamente sobre el stack MLX de Apple, lo que permite desplegar transcripción en local sin GPU dedicada ni servicios en la nube, con licencia MIT para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (encoder de 25 capas, `1024 / 1280 @2x / 1024`, SwishL/SwishR) con FiLM y cabeza RNN-T |
| Parametros totales | 771.353.916 parametros activos MLX |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por ventanas; streaming con paquetes de 160/320/640 ms) |
| Tipos de cuantizacion | float16 y float32 (dtype configurable en CLI) |
| Idiomas soportados | 21 + `auto`: ru, en, kk (alias kz), ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | safetensors (~1,5 GB) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint `rnnt` de `ai-sage/GigaAM-Multilingual-v2`. El encoder Zapformer consta de 25 capas con dimensiones `1024 / 1280 @2x / 1024` y funciones de activación SwishL/SwishR. Incorpora acondicionamiento FiLM en las capas 3, 7, 11, 15, 19 y 23, fusión tardía de residuales en FP32 con proyecciones `1152 -> 2048 -> 1024`, y una cabeza RNN-T de 4027 clases SentencePiece con `max_symbols_per_step=3`. Los 612 tensores del encoder y FiLM se almacenan en float16, mientras que los 15 tensores de cabeza y condicionamiento de idioma se mantienen en float32.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión a MLX mantiene paridad numérica con PyTorch CPU en FP32: diferencia absoluta media en el encoder `<= 6.8e-6` (máximo `<= 2.8e-4`) y texto decodificado idéntico, con los mismos timestamps de palabra y deltas de streaming en `auto`, `ru`, `en` y `ru-en`.

## Capacidades

- Transcripción ASR multilingüe en 21 idiomas más modo `auto` de detección automática.
- Inferencia de contexto completo y por lotes con longitud variable.
- Streaming causal en tiempo real con paquetes de 160, 320 y 640 ms.
- Timestamps a nivel de palabra.
- Detección de actividad de voz (VAD) opcional implementada en MLX puro (Conformer VAD).
- Mezclas de idioma con pesos iguales (`"ru-en"`, `'["ru", "en"]'`), ponderadas (`'{"ru": 0.7, "en": 0.3}'`) y listas por lote.
- Cambio dinámico de idioma en streaming (reinicia el estado del stream).
- Cero dependencia del runtime de PyTorch.
- Interfaz Python (`load_model`, `transcribe`) y CLI (`gigaam-mlx`).

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa audio de larga duración (22 minutos en 8,43 s en FP16 con VAD) en un M2 Max, permitiendo transcribir reuniones sin enviar datos a la nube.
- Subtitulado en tiempo real: el streaming causal con paquetes de 320 ms (30,9 ms por paquete en FP16, ~10,3x tiempo real) permite generar subtítulos en directo durante videollamadas o emisiones.
- Atención al cliente multilingüe: la detección automática de idioma y las mezclas ponderadas permiten transcribir conversaciones con interlocutores que alternan ruso, inglés y otras lenguas.
- Indexación y búsqueda de archivos de audio: los timestamps a nivel de palabra facilitan alinear transcripciones con el audio para búsqueda por fragmentos o generación de capítulos.
- Aplicaciones de accesibilidad: dictado y transcripción en dispositivos Apple Silicon sin conexión, útil para usuarios con discapacidad auditiva o en entornos sin red.
- Procesamiento por lotes de archivos multimedia: la CLI acepta entradas como `.mkv` y formatos de salida múltiples, integrándose en pipelines de postproducción o archivística.
- Análisis de llamadas y compliance: transcripción local con VAD para recortar silencios y reducir cómputo, manteniendo los datos sensibles dentro de la infraestructura propia.

## Benchmarks y rendimiento

Resultados medidos en Apple Silicon M2 Max según la model card:

| Escenario | FP16 | FP32 | Referencia PyTorch CPU |
|---|---|---|---|
| Clip de 19,0 s | 0,131 s (~146x tiempo real) | 0,147 s (~129x) | 2,007 s (~9,5x) |
| Streaming 320 ms (paquetes de 320 ms) | 30,9 ms/paquete (~10,3x) | 34,3 ms/paquete (~9,2x) | no disponible |
| Streaming 200 ms (paquetes de 200 ms) | 19,2 ms/paquete | 21,9 ms/paquete | no disponible |
| Audio completo de 22 min con VAD (1319,4 s) | 8,43 s (~157x, pico 2,34 GB) | 9,93 s (~133x, pico 4,65 GB) | no disponible |

No se han publicado resultados de benchmarks estándar (WER, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~1,5 GB para los pesos en FP16; pico de 2,34 GB en FP16 y 4,65 GB en FP32 durante el procesamiento de audio largo con VAD.
- Hardware objetivo: Apple Silicon (el formato MLX requiere GPU unificada de Apple; los benchmarks se realizaron en M2 Max).
- GPU recomendadas: chips de la familia M (M1/M2/M3/M4) con memoria unificada suficiente; no aplica a GPU NVIDIA o AMD en este formato.
- Cabe en equipos consumer Apple Silicon con al menos 8 GB de memoria unificada en FP16.
- Opciones de despliegue: librería `gigaam-mlx` (Python) y CLI `gigaam-mlx`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ver tabla de benchmarks (hasta ~157x tiempo real en FP16 para audio largo; ~10,3x en streaming de 320 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Runtime |
|---|---|---|---|---|---|
| GigaAM-Multilingual-v2-mlx | 771 M | 21 + auto | Si (160/320/640 ms) | MIT | MLX (Apple Silicon) |
| GigaAM-Multilingual-v2 (original) | no disponible | 21 + auto | no disponible | MIT | PyTorch |
| Whisper large-v3 | no disponible en la informacion | ~99 | No nativo | MIT | PyTorch, CTranslate2, etc. |
| Whisper small | no disponible en la informacion | ~99 | No nativo | MIT | PyTorch, CTranslate2, etc. |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon: el formato MLX no es portable a GPU NVIDIA, AMD ni CPU convencional.
- No se han publicado métricas de calidad (WER) en la información disponible, por lo que el rendimiento en precisión no puede evaluarse con datos.
- El modelo está optimizado para ruso e inglés; el resto de idiomas (21 en total) pueden tener cobertura desigual según el entrenamiento original.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, inherente a los sistemas ASR.
- El cambio de idioma en streaming reinicia el estado del stream, lo que puede provocar cortes en la transcripción.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base `ai-sage/GigaAM-Multilingual-v2` y citar adecuadamente a los autores originales.
- No se han documentado sesgos específicos; al ser un modelo entrenado mayoritariamente con datos en ruso e inglés, puede presentar sesgos lingüísticos y culturales hacia esas lenguas.

## Enlaces

- Hugging Face: https://huggingface.co/aystream/GigaAM-Multilingual-v2-mlx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- Repositorio MLX: https://github.com/aystream/gigaam-mlx
- Repositorio original GigaAM: https://github.com/salute-developers/GigaAM
