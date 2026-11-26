# myeongcheol/honeygaruby-kr-tts

## Resumen

Honeygaruby KR TTS es un modelo de síntesis de voz (text-to-speech) en coreano obtenido mediante ajuste fino del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el usuario myeongcheol. El modelo reproduce la voz y el acento característico de una youtuber coreana conocida como 허니가루비 (Honeygaruby), que publica contenido sobre noticias de Japón. El ajuste se realizó sobre 797 vídeos y cortos públicos de YouTube, de los que se extrajeron entre 2,57 y 2,73 horas de audio limpio tras separación de voces y transcripción automática.

El repositorio no contiene un único checkpoint, sino siete subcarpetas versionadas (v1, v2 y v3, con distintos números de época) más dos variantes interpoladas mediante task-vector (v3-a25 y v3-a50). La versión recomendada por el autor es v3-a25, que combina el timbre de v2-ep1 con un 25 % del acento reforzado de v3-ep7, y que obtiene la mayor similitud ASR reportada (0,995). El modelo permite generar voz con el token de hablante `honeygaruby` sin necesidad de audio de referencia en el momento de la inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual en ajuste fino de TTS (interpolación de task vectors para equilibrar timbre y prosodia); por otro, es un caso claro de clonación de voz de una persona real sin su consentimiento, con las implicaciones éticas y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-TTS-12Hz-1.7B-Base; arquitectura interna no detallada en la informacion) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta inferencia en fp32; el repo distribuye safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,5 GB |
| Frecuencia de muestreo de salida | 24 kHz mono (audio de entrenamiento); el nombre del modelo base sugiere representacion a 12 Hz |
| Token de hablante | `honeygaruby` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-1.7B-Base, un TTS de 1.700 millones de parametros con representacion de audio a 12 Hz. El autor no detalla en la model card la arquitectura interna del modelo base (tipo de decoder, tokenizador de audio o mecanismo de condicionamiento), por lo que ese dato queda como no disponible. El ajuste fino es un SFT completo (no LoRA) con batch 4 sobre una RTX 3090 en vast.ai, con tasas de aprendizaje de 2e-6 (v1), 4e-6 (v2) y 5e-6 (v3) y un token de hablante dedicado.

El pipeline de datos es el punto tecnico mas interesante. Se descargaron 797 videos y cortos publicos de YouTube con yt-dlp, se separaron las voces con demucs htdemucs para eliminar la musica de fondo, se transcribieron con faster-whisper large-v3 en coreano con marcas de tiempo por palabra, y se cortaron fragmentos de 2 a 15 segundos aplicando filtros de energia de BGM, proporcion de caracteres hangul y confianza de transcripcion. El resultado fueron 3.569 clips (2,57 h) en v1, 3.774 clips (2,73 h) en v2 y 5.035 filas de entrenamiento en v3, con sobremuestreo de las frases con acento caracteristico (factor x2 a x4) y ponderacion por dinamica de F0 en pasajes sonoros.

La innovacion destacable es la interpolacion de task vectors: W(alpha) = v2-ep1 + alpha * (v3-ep7 - v2-ep1), con alpha = 0,25 y alpha = 0,50. Esto permite separar el timbre estable (v2-ep1) del acento exagerado (v3-ep7) y escoger un punto intermedio. La validacion se hizo con similitud ASR mediante faster-whisper, no con metricas perceptuales como MOS.

## Capacidades

- Sintesis de voz en coreano a partir de texto, con un unico hablante fijo identificado por el token `honeygaruby`.
- Clonacion de voz implicita: el timbre y el acento estan aprendidos en el token de hablante, por lo que no se necesita audio de referencia en inferencia.
- Reproduccion de acentos idiosincraticos: el autor indica que frases marca de la casa (por ejemplo "레전드다이") se pronuncian con el acento caracteristico de la youtuber.
- Generacion de audio a 24 kHz mono en formato WAV mediante la API `generate_custom_voice` de la libreria qwen_tts.
- Control de version mediante subcarpetas: se puede escoger entre distintas combinaciones de timbre y acento (v1-ep1, v2-ep4, v3-ep6, v3-ep7, v3-a25, v3-a50).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.
- No se documenta capacidad multilingue: solo coreano.

## Casos de uso

- Doblaje de contenido divulgativo al coreano: el modelo permite generar narraciones con un timbre concreto y consistente para videos de noticias o resumenes, sustituyendo la locucion manual en produccion de cortos.
- Prototipado de asistentes de voz en coreano: al tener un token de hablante fijo y una API sencilla, sirve para validar interfaces conversacionales antes de contratar una voz profesional.
- Investigacion en clonacion de voz few-shot: el repositorio documenta el pipeline completo (demucs, faster-whisper, filtrado, SFT, task-vector interpolation) y sirve como referencia reproducible para experimentos academicos.
- Estudio de interpolacion de task vectors en TTS: las variantes v3-a25 y v3-a50 permiten comparar el efecto de alpha sobre timbre y prosodia con un mismo conjunto de datos.
- Generacion de audiolibros o podcasts de prueba en coreano: con 2,5 a 2,7 horas de audio de entrenamiento, es adecuado para material de demostracion o maquetas, no para produccion a gran escala.
- Evaluacion de metricas de similitud ASR: el autor publica valores de similitud por version (0,985 a 0,995), lo que permite estudiar la correlacion entre similitud ASR y calidad perceptual en un caso controlado.
- Creacion de datasets sinteticos de voz coreana para aumentar datos de ASR: util en entornos de investigacion controlados y con consentimiento, no en produccion comercial.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que se trata de un modelo TTS. La unica metrica reportada es la similitud ASR medida con faster-whisper sobre un conjunto de 6 frases (segun la tabla de v1).

| Version | Entrenamiento | Similitud ASR | Notas |
|---|---|---|---|
| v1-ep1 | 3 ep, lr 2e-6 | 1,0 (6 frases) | Mejor de v1 |
| v2-ep1 | 6 ep, lr 4e-6 | 0,991 | Punto de referencia de timbre |
| v2-ep4 | 6 ep, lr 4e-6 | 0,992 | Mejor de v2 |
| v2-ep5 | 6 ep, lr 4e-6 | 0,985 | |
| v3-ep6 | 8 ep, lr 5e-6 | 0,991 | Datos con peso de F0 |
| v3-ep7 | 8 ep, lr 5e-6 | 0,991 | Acento mas fuerte, timbre deformado |
| v3-a25 | interpolacion alpha=0,25 | 0,995 | Recomendado por el autor |
| v3-a50 | interpolacion alpha=0,50 | 0,988 | |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La latencia indicada por el autor es de aproximadamente 30 a 60 segundos por frase en CPU con fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 1,7B parametros en fp32, el peso ronda los 6,8 GB, por lo que se necesita al menos 8 GB de VRAM en GPU o inferencia en CPU.
- GPU recomendadas: el autor entreno en una RTX 3090 (24 GB) y ejecuta inferencia en CPU. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en fp32; no confirmado por el autor.
- Opciones de despliegue: la unica via documentada es la libreria oficial qwen_tts instalada desde el repositorio de GitHub de QwenLM/Qwen3-TTS, con PyTorch y soundfile. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 30 a 60 segundos por frase en CPU con fp32. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| Honeygaruby KR TTS (este) | 1,7B | no disponible | Coreano | Apache-2.0 | Ajuste fino de Qwen3-TTS sobre una voz real |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B | no disponible | Multilingue (no detallado) | Apache-2.0 | TTS base generico de Alibaba |
| Alternativas TTS multilingues open source (p. ej. XTTS-v2, Bark) | no disponible en la informacion | no disponible | Multilingue | Varía | TTS generico con clonacion few-shot |

No se dispone de datos de benchmarks comparativos entre este modelo y otras alternativas en la informacion proporcionada. La comparacion se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- Clonacion de voz sin consentimiento: el autor declara explicitamente que la voz pertenece a una youtuber real y que no se obtuvo su permiso. El uso comercial, la suplantacion y la generacion de informacion falsa estan desaconsejados por el propio autor.
- Licencia: aunque el metadato indica Apache-2.0 (heredado del modelo base), la licencia no cubre los derechos de imagen ni de voz de la persona clonada; el uso comercial es juridicamente arriesgado.
- Riesgo de alucinacion acustica: la similitud ASR alta (0,995) no garantiza inteligibilidad ni naturalidad perceptual; no se han publicado metricas MOS.
- Conjunto de validacion muy reducido: la similitud ASR se mide sobre 6 frases, lo que hace la metrica poco representativa.
- Cobertura limitada: solo coreano y un unico hablante; no hay soporte multilingue ni de cambio de hablante.
- Datos de entrenamiento escasos: 2,5 a 2,7 horas de audio, lo que puede limitar la cobertura de estilos, emociones y dominios frente a TTS entrenados con cientos de horas.
- Dependencia de YouTube: los datos provienen de videos publicos, con posible ruido residual pese al filtrado con demucs y faster-whisper.
- Sin soporte documentado de cuantizacion ni de despliegue en vLLM, llama.cpp u Ollama, lo que limita su uso en produccion a gran escala.
- Latencia alta en CPU (30 a 60 segundos por frase), poco adecuada para aplicaciones interactivas en tiempo real.
- El autor se compromete a retirar el repositorio si la persona clonada lo solicita, lo que implica un riesgo de disponibilidad para quien lo integre en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myeongcheol/honeygaruby-kr-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de la libreria Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Canal de YouTube de la persona clonada: https://www.youtube.com/@허니가루비
- Demucs (separacion de fuentes): https://github.com/facebookresearch/demucs
- faster-whisper (transcripcion): https://github.com/SYSTRAN/faster-whisper
- Paper de task arithmetic / task vectors (referencia tecnica de la interpolacion): no disponible en la informacion proporcionada
