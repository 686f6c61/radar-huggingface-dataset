# AtomicChat/Rumble-2-Flash-GGUF

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) de aproximadamente 0,5 mil millones de parámetros, desarrollado por Reson8 y distribuido en formato GGUF por AtomicChat. Se trata de una adaptación de Qwen3-ASR-0.6B, sobre la que se ha construido un encoder de audio de 18 capas y un decoder de 14 capas. Cubre 45 idiomas y se publica bajo licencia Apache 2.0, lo que lo convierte en una opción atractiva para transcripción local y offline sin restricciones de uso comercial.

La relevancia de esta ficha concreta reside en su empaquetado para llama.cpp: AtomicChat publica los pesos en varios niveles de cuantización (BF16, Q8_0 y un AD-Q5_K_M propietario) junto con el proyector de audio (mmproj) en F16 y Q8_0. El conjunto recomendado ocupa tan solo 0,50 GB en disco, lo que permite ejecutar transcripción multilingüe en hardware de consumo muy modesto.

Un detalle técnico importante documentado por el autor es que llama.cpp estándar (probado en b12521) procesa el padding de ceros al final de cada clip como si fuera audio, lo que provoca alucinaciones de palabras al final de las transcripciones cortas. AtomicChat ha desarrollado un parche que aún no está integrado en upstream; las métricas publicadas se han medido con dicho parche aplicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder de audio de 18 capas + decoder de 14 capas (basada en Qwen3-ASR-0.6B, familia Qwen3-VL con proyector de audio `qwen3a`) |
| Parámetros totales | 322.255.360 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, AD-Q5_K_M (propietaria); mmproj en F16 y Q8_0 |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Rumble-2-Flash es un modelo de reconocimiento del habla con arquitectura encoder-decoder. El encoder de audio consta de 18 capas y el decoder de 14 capas, y el conjunto se apoya en la arquitectura de Qwen3-ASR-0.6B, que a su vez pertenece a la familia Qwen3-VL y utiliza el proyector de audio `qwen3a`. En llama.cpp se ejecuta con el tipo de modelo `qwen3vl` más el proyector de audio correspondiente.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor tampoco documenta innovaciones de decodificación especulativa ni mecanismos de atención lineal. La contribución técnica destacable de esta publicación es el empaquetado GGUF con una cuantización AD-Q5_K_M propia que, según las mediciones del autor, iguala a BF16 dentro del ruido estadístico en cinco de seis conjuntos de test, además del parche para el tratamiento del padding de audio en llama.cpp.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 45 idiomas, incluyendo lenguas europeas, asiáticas y de Oriente Medio.
- Detección automática del idioma: sin pasar el parámetro de idioma, la salida comienza con `language <Nombre><asr_text>` indicando el idioma detectado.
- Modo de idioma forzado: si se pasa el idioma, el modelo escribe únicamente la transcripción.
- Soporte de audio en formato de clip procesado por el proyector `qwen3a` dentro de llama.cpp.
- Compatible con endpoints (tag `endpoints_compatible`) y con flujos conversacionales según los tags del repositorio.
- Capacidad multilingüe amplia, con cobertura específica de mandarín (medido como CER en FLEURS).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de ASR ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local y offline en aplicaciones de escritorio: gracias a su tamaño de 0,50 GB en la configuración recomendada, se puede integrar en apps tipo Atomic Chat que corren modelos en el dispositivo sin conexión, útil para dictado y notas de voz.
- Subtitulado automático de vídeo multilingüe: el modelo cubre 45 idiomas y permite transcribir contenido en inglés, español, francés, alemán, chino o japonés con un único modelo, simplificando pipelines de subtitulado.
- Procesamiento de reuniones y llamadas: la transcripción de clips de audio con detección automática de idioma facilita actas y resúmenes en entornos corporativos con equipos internacionales.
- Atención al cliente y análisis de llamadas: se puede usar para transcribir grabaciones de soporte telefónico y alimentar sistemas de análisis de calidad o búsqueda sobre el texto resultante.
- Investigación lingüística y corpus: la licencia Apache 2.0 y la cobertura de 45 idiomas permiten construir corpus transcritos y comparar variedades dialectales sin restricciones comerciales.
- Integración en herramientas de accesibilidad: transcripción en tiempo casi real de audio para personas con discapacidad auditiva, desplegable en hardware de consumo.
- Prototipado rápido con llama.cpp: el formato GGUF y el soporte nativo permiten validar ideas de ASR en portátiles o mini-PC antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

WER en % (CER en % para FLEURS mandarín), 2.200 enunciados, menor es mejor. Cada archivo de modelo medido con `mmproj-…-F16`. Datos publicados por el autor con el parche aplicado.

| Archivo | GB en disco | bpw | LS clean | LS other | MLS DE | MLS ES | MLS FR | FLEURS ZH |
|---|---|---|---|---|---|---|---|---|
| `Rumble-2-Flash-BF16.gguf` | 0,65 | 16,0 | 2,09 | 4,70 | 6,85 | 4,57 | 6,57 | 10,38 |
| `Rumble-2-Flash-Q8_0.gguf` | 0,35 | 8,50 | 2,11 | 4,70 | 6,79 | 4,63 | 6,68 | 10,31 |
| `Rumble-2-Flash-AD-Q5_K_M.gguf` | 0,28 | 6,94 | 2,09 | 4,78 | 6,83 | 4,51 | 6,60 | 10,52 |
| stock `Q6_K` (no distribuido) | 0,27 | 6,56 | 2,20 | 4,64 | 6,84 | 4,51 | 6,66 | 10,44 |
| stock `Q4_K_M` (no distribuido) | 0,22 | 5,32 | 2,42 | 5,21 | 7,62 | 5,14 | 7,47 | 11,99 |

| mmproj (encoder de audio) | GB en disco | LS clean | LS other | MLS DE | MLS ES | MLS FR | FLEURS ZH |
|---|---|---|---|---|---|---|---|
| `mmproj-Rumble-2-Flash-F16.gguf` | 0,38 | 2,09 | 4,70 | 6,85 | 4,57 | 6,57 | 10,38 |
| `mmproj-Rumble-2-Flash-Q8_0.gguf` | 0,21 | 2,11 | 4,70 | 6,71 | 4,61 | 6,64 | 10,38 |

En llama.cpp estándar b12521 (sin el parche), los mismos archivos miden:

| Archivos | LS clean | LS other | MLS DE | MLS ES | MLS FR | FLEURS ZH |
|---|---|---|---|---|---|---|
| BF16 + mmproj F16 | 3,13 | 5,68 | 7,00 | 4,92 | 6,80 | 10,45 |
| Q8_0 + mmproj F16 | 3,16 | 5,62 | 6,98 | 5,04 | 6,89 | 10,51 |
| AD-Q5_K_M + mmproj Q8_0 | 3,27 | 5,96 | 7,06 | 4,89 | 6,77 | 10,64 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El par recomendado (`AD-Q5_K_M` + `mmproj-Q8_0`) ocupa 0,50 GB en disco; el conjunto BF16 completo ronda 1,03 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, Apple Silicon, iGPU recientes) e incluso en CPU.
- Opciones de despliegue: llama.cpp (soporte de Qwen3-ASR desde b8769; probado en b12521), y por extensión cualquier frontend basado en llama.cpp como Atomic Chat. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rumble-2-Flash (esta ficha) | ~0,32 B | 45 | Apache 2.0 | GGUF | Encoder 18 capas + decoder 14 capas; requiere parche en llama.cpp para evitar alucinaciones por padding |
| Qwen3-ASR-0.6B (modelo base) | ~0,6 B | no disponible | no disponible | safetensors (Transformers) | Referencia de Transformers sobre la que se construye Rumble-2-Flash |
| Whisper (familia OpenAI) | 0,039 B a 1,55 B | ~99 | MIT | safetensors, GGUF, etc. | Alternativa ampliamente adoptada; no se dispone de comparación directa de WER en esta información |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Alucinaciones en clips cortos con llama.cpp estándar: el padding de ceros se procesa como audio y puede añadir palabras no pronunciadas al final de la transcripción. El parche del autor no está aún en upstream.
- Pérdida de precisión por debajo de ~0,27 GB: el autor descarta distribuir Q6_K y AD-Q4_K_M porque pierden exactitud; Q4_K_M pierde hasta 1,6 puntos de CER en mandarín y Q3_K_M llega al 18,8 % de CER en mandarín.
- El mmproj representa la mayor parte de la descarga; usar Q8_0 en lugar de F16 añade +0,2 puntos de CER en mandarín.
- Cobertura de benchmarks limitada a LibriSpeech, MLS (DE, ES, FR) y FLEURS ZH; no hay métricas publicadas para la mayoría de los 45 idiomas declarados.
- No se documentan sesgos conocidos, pero al ser un modelo ASR puede reflejar sesgos acústicos y dialectales de sus datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-ASR-0.6B antes de producción.
- Sin datos publicados sobre latencia, throughput ni consumo de memoria en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es una publicación muy reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
