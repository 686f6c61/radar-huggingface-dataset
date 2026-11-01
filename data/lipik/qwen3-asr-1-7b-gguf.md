# lipik/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B-gguf es una conversión a formato GGUF del modelo de reconocimiento automático de habla Qwen3-ASR-1.7B de Alibaba (Qwen), publicada por el usuario lipik para su uso con la librería transcribe.cpp. El modelo base pertenece a la familia Qwen3-ASR, que ofrece transcripción y detección de idioma multilingüe a partir de la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. La versión 1.7B se posiciona como estado del arte entre los modelos ASR open source, compitiendo con APIs comerciales propietarias.

Esta conversión permite ejecutar la transcripción de forma totalmente offline en CPU o GPU de consumo, con cuantizaciones desde BF16 (3,80 GB) hasta Q4_K_M (1,23 GB). El modelo detecta automáticamente el idioma del audio entre 30 idiomas (incluido el castellano) y genera la transcripción en ese mismo idioma, sin necesidad de indicar el idioma explícitamente. Según la model card, el modelo base soporta 52 idiomas y dialectos, incluidos 22 dialectos chinos y acentos variados del inglés.

Es relevante ahora porque combina la precisión de un audio-LLM de nueva generación con un despliegue ligero y sin dependencias de la nube: con la cuantización Q8_0 apenas hay pérdida de WER (1,61 % frente a 1,62 % en BF16 en LibriSpeech test-clean) y el archivo pesa unos 2 GB, lo que lo hace viable en portátiles y máquinas sin GPU dedicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional conectado a un LM causal Qwen3 con inyección de audio-tokens |
| Parametros totales | 2.038.078.608 (2,04 B, dato de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk); el modelo base declara 52 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la misma arquitectura audio-LLM que la variante 0.6B: un codificador de audio bidireccional que procesa la señal (entrada de 16 kHz mono) y alimenta un LM causal Qwen3 mediante la inyección de audio-tokens en la secuencia. En esta versión de 1,7B las dimensiones son mayores: el codificador usa `d_model=1024` con 16 cabezas de atención, y el LM tiene `hidden_size=2048` e `intermediate_size=6144`. Este mayor tamaño del decodificador ofrece más margen frente a la cuantización que la variante 0.6B, lo que explica que Q6_K y Q5_K_M mantengan un WER estadísticamente equivalente al de precisión completa.

Sobre los datos de entrenamiento del modelo base, la model card indica que se aprovecha "datos de entrenamiento de habla a gran escala" y la base Qwen3-Omni, pero no publica cifras concretas de tokens ni composición del dataset, ni detalles sobre RLHF/DPO (no disponible). La conversión GGUF se portó desde el commit upstream `7278e1e` (fijado el 2026-04-19) y se validó numéricamente contra la referencia qwen_asr 0.0.6 en el commit `3f61df7` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto (ASR) offline en 30 idiomas, incluido el castellano.
- Detección automática del idioma del audio (`lang_detect: true`), sin necesidad de pasar pistas de idioma.
- Reconocimiento robusto en entornos acústicos complejos y con patrones de texto difíciles, según la model card del modelo base.
- Soporte de acentos variados del inglés de múltiples países y regiones.
- Transcripción de audio largo (el modelo base soporta inferencia unificada streaming/offline con un solo modelo; en esta conversión GGUF el streaming no está disponible, `streaming: false`).
- Entrada en formato WAV mono a 16 kHz; no soporta traducción (`translate: false`) ni marcas de tiempo (`timestamps: none`) en esta conversión.
- No soporta hints de idioma explícitos en esta versión del port.

## Casos de uso

- Transcripción offline de reuniones y notas de voz: al ejecutarse localmente con transcribe.cpp, se pueden transcribir grabaciones sensibles (juntas médicas, documentos legales) sin enviar audio a servicios externos, ideal para sectores con requisitos de privacidad.
- Subtitulado de contenido multilingüe: la detección automática de idioma permite procesar bibliotecas de vídeo en decenas de lenguas sin configuración por fichero; el resultado puede alimentar un generador de subtítulos SRT (habría que añadir la temporización externamente, ya que no emite timestamps).
- Dictado y accesibilidad en aplicaciones de escritorio: con 1,23 GB en Q4_K_M cabe en portátiles sin GPU, permitiendo dictado en tiempo casi real (RTF 39,5 en Metal sobre M4 Max significa transcripción unas 39 veces más rápida que el audio real).
- Procesamiento masivo de call center y archivos de audio: la ausencia de coste por minuto y la ejecución en CPU permiten procesar grandes volúmenes de grabaciones en batch en servidores convencionales.
- Transcripción de podcasts y periodismo: conversión rápida de entrevistas en texto para búsqueda y edición, con soporte de entrevistas mezcladas en varios idiomas europeos.
- Investigación y pipelines de datos: licencia Apache-2.0 sin restricciones comerciales, adecuada para generar corpus de texto a partir de audio en proyectos de NLP o para etiquetar datasets de habla.
- Integración en apps multiplataforma: transcribe.cpp compila con CMake y soporta backends Metal, Vulkan y CPU, cubriendo macOS, Linux y Windows.

## Benchmarks y rendimiento

WER medido sobre el split completo de LibriSpeech `test-clean` (2.620 emisiones en inglés) con el normalizador de texto estilo Whisper y jiwer 3.x, en backend Metal de un Apple M4:

| Cuantizacion | WER (%) | Tamaño |
|---|---:|---:|
| BF16 | 1,62 | 3,80 GB |
| F16 | 1,62 | 3,81 GB |
| Q8_0 | 1,61 | 2,04 GB |
| Q6_K | 1,65 | 1,58 GB |
| Q5_K_M | 1,65 | 1,41 GB |
| Q4_K_M | 1,81 | 1,23 GB |

BF16/F16/Q8_0/Q6_K/Q5_K_M se encuentran dentro del intervalo de confianza bootstrap entre sí; Q4_K_M solo regresa unos 0,2 puntos de WER. Nota: este número caracteriza únicamente el caso inglés; el modelo es multilingüe y no se publican WER por idioma en la información disponible. La model card del modelo base afirma rendimiento estado del arte entre ASR open source y competitividad con APIs comerciales, pero no incluye tablas comparativas concretas (no disponible).

## Requisitos de hardware

- VRAM / memoria: el modelo se ejecuta también en CPU puro. Los ficheros van de 1,23 GB (Q4_K_M) a 3,81 GB (F16); se recomienda disponer de al menos el tamaño del fichero más margen para el cómputo del encoder (aproximadamente 4-6 GB de RAM para cuantizaciones medias).
- GPU recomendadas: cualquier GPU moderna funciona vía backends Metal (Apple Silicon, medido en M4 Max) o Vulkan (medido en un AMD Ryzen 4750U con iGPU). No se especifican requisitos de CUDA.
- Consumer GPUs: sí, cabe con holgura en GPUs de 4 GB o más incluso en BF16; en CPU pura también es plenamente viable.
- Rendimiento medido (RTF, menor es mejor): M4 Max con Metal: 39,5; M4 Max CPU: 8; Ryzen 4750U Vulkan: 3,8; Ryzen 4750U CPU: 2. Es decir, incluso un portátil delgado transcribe unas 2 veces más rápido que el audio en tiempo real.
- Despliegue: transcribe.cpp (compilación con CMake, CLI `transcribe-cli`). No es un GGUF estándar de llama.cpp; requiere transcribe.cpp como runtime. No se menciona soporte en Ollama, vLLM o TGI.
- Preprocesado: el audio debe convertirse a WAV mono 16 kHz (por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Streaming | Licencia |
|---|---|---|---:|---|---|
| Qwen3-ASR-1.7B-gguf (este) | 2,04 B | 30 (52 en el base) | 1,62 (BF16) | No en este port | Apache-2.0 |
| Qwen3-ASR-0.6B | 0,6 B | 30 (52 en el base) | no disponible | Sí (modelo base) | Apache-2.0 |
| Whisper large-v3 | 1,55 B | ~99 | ~1,8-2,0 (referencia pública habitual) | Sí | MIT |
| faster-whisper large-v3 | 1,55 B (CTranslate2) | ~99 | similar a Whisper large-v3 | Sí | MIT |

Nota: los valores de Whisper large-v3 son referencias públicas aproximadas; no constan en la información proporcionada de este repositorio. La ventaja de Qwen3-ASR-1.7B según su model card es el WER líder entre modelos open source y la detección automática de idioma integrada; la desventaja de este port GGUF concreto es la ausencia de streaming y timestamps frente a Whisper.

## Limitaciones y advertencias

- Esta conversión no soporta streaming (`streaming: false`), traducción a inglés (`translate: false`) ni marcas de tiempo (`timestamps: none`); para subtítulos temporizados hay que recurrir a Qwen3-ForcedAligner u otra solución de alineación.
- No acepta hints de idioma explícitos: la detección es siempre automática, lo que puede fallar en audio con code-switching o acentos atípicos.
- Solo acepta WAV mono a 16 kHz; otros formatos requieren conversión previa con ffmpeg.
- El WER publicado solo cubre inglés (LibriSpeech test-clean); no hay métricas publicadas para castellano u otros idiomas en esta ficha, por lo que la calidad en cada lengua debe validarse por el usuario.
- Como todo modelo ASR, puede alucinar contenido en silencios, ruido o música de fondo; no se publican evaluaciones específicas de robustez para este port.
- Sesgos: no se documentan sesgos específicos; al ser entrenado con datos de habla a gran escala, el rendimiento puede variar por acento, género y registro (no disponible un análisis detallado).
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial sin restricciones relevantes más allá de conservar el aviso de licencia.
- El runtime requerido es transcribe.cpp, no llama.cpp estándar, lo que limita la compatibilidad con herramientas del ecosistema GGUF habitual.

## Enlaces

- Repositorio de la conversión GGUF: https://huggingface.co/lipik/Qwen3-ASR-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- transcribe.cpp (GitHub): https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Commit upstream de referencia: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e70fe206f11671096ffdd38061171dd6e5
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Paper referenciado en tags (arXiv): arxiv:2601.21337
