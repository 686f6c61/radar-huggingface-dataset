# infosave/LFM3-Audio-2B-cmf

## Resumen

LFM3-Audio-2B-cmf es una reempaquetación cuantizada del modelo de voz LFM3-Audio-2B de Liquid AI, distribuida en formato CMF (ficheros únicos que incluyen el códec de audio) para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de ML. El modelo base combina un codificador de audio causal (entrada a 16 kHz) con el modelo de texto LFM3-1.7B, y genera respuestas en texto o en voz a 24 kHz mediante un depth decoder y el tokenizador LiquidCodec (12 códigos por cada 80 ms).

El problema que resuelve es doble: por un lado, ofrece reconocimiento de voz (ASR), síntesis de voz (TTS), chat por voz y comprensión de audio en un único modelo compacto de unos 2 mil millones de parámetros; por otro, la versión CMF hace viable su ejecución local en hardware muy variado (GPU NVIDIA, AMD e Intel vía Vulkan/DX12, Apple silicon vía Metal y CPU), con ficheros de entre 1,62 y 2,45 GB que caben en tarjetas gráficas de consumo con solo 3 GB de memoria libre.

Su relevancia actual radica en la tendencia hacia modelos de voz unificados y ligeros que funcionan sin nube: soporta 19 idiomas para TTS (incluido el castellano), voces masculinas y femeninas, y expone además un servidor compatible con la API de OpenAI, lo que facilita su integración en aplicaciones existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio causal (16 kHz) + LFM3-1.7B (modelo de texto) + depth decoder + LiquidCodec (24 kHz) |
| Parametros totales | Aprox. 2B (el modelo base es LFM3-Audio-2B; desglose exacto no disponible) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (modelo de lenguaje a 8 bits, audio a 16 bits) y q4tp (modelo de lenguaje a 4 bits, audio a 16 bits) |
| Idiomas soportados | 19: aleman, arabe, chino, coreano, danes, espanol (castellano), finlandes, frances, griego, hebreo, ingles (britanico y americano), italiano, japones, koreano, neerlandes, polaco, portugues, sueco y turco |
| Licencia | lfm1.0 (otra/propia de Liquid AI, con enlace a LICENSE) |
| Formato de pesos | CMF (fichero unico con pesos cuantizados y el codec LiquidCodec incluido) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas. Primero, un codificador de audio causal procesa la senal de entrada remuestreada a 16 kHz mono y produce caracteristicas log-mel que se proyectan al espacio del modelo de lenguaje. Este es el LFM3-1.7B de Liquid AI, un transformer causal que razona sobre la mezcla de audio y texto. Para generar voz, el modelo produce códigos del tokenizador LiquidCodec (12 códigos por cada 80 ms de audio, es decir, 150 frames por segundo), que un depth decoder expande en tres pasadas por frame antes de que el códec reconstruya el WAV final a 24 kHz. El muestreo recomendado para voz es temperature 1.0, top-k 128 y penalty de repeticion 1.1 sobre 4096 frames.

Sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) no hay datos en la informacion disponible. En cuanto a la cuantizacion, el autor documenta validaciones numericas: con entrada de voz, las caracteristicas log-mel y las filas del codificador coinciden con coseno 1.000000 y la maxima diferencia entregada al modelo de lenguaje es de 4e-6 frente al checkpoint bf16; en sintesis, una conversion f16 reproduce exactamente los frames de Transformers (42 de 42), mientras que los ficheros cuantizados divergen en códigos greedy tras los primeros frames (empate tecnico sobre 2.017 códigos) pero el habla resultante se transcribe palabra por palabra igual que la frase de entrada.

## Capacidades

- Reconocimiento automatico de voz (ASR) a partir de ficheros WAV, URLs HTTP(S) o data URLs, con transcripcion fiel en los clips de prueba.
- Sintesis de voz (TTS) a 24 kHz en 19 idiomas, con seleccion de voz masculina o femenina y de variante de ingles (britanica o americana).
- Chat por voz: respuestas que intercalan texto y audio (`--speech-mode mixed`).
- Comprension de audio: preguntas sobre grabaciones (por ejemplo, "que se oye en este clip?").
- Modo thinking desactivable mediante la opcion `--no-think`.
- Salida de voz controlada por frames (12,5 frames por segundo de audio generado) con `--max-tokens`.
- Servidor HTTP compatible con la API de chat completions de OpenAI, aceptando partes de audio en base64, URL o ruta local.
- Verificacion de integridad del fichero descargado (`cortiq verify`, sha256).
- No hay informacion disponible sobre tool calling, agentes ni capacidades de vision.

## Casos de uso

- Transcripcion de notas de voz y grabaciones: con `--audio clip.wav` y un system prompt de ASR, el modelo transcribe clips locales o remotos; en un Apple M4 tarda 1,5 s en transcribir un clip de 4,4 s incluyendo la carga.
- Locucion automatica de contenidos: el TTS en 19 idiomas con voces masculinas y femeninas permite generar audio para videos, podcasts o accesibilidad; 7 s de voz se sintetizan en 3,2 s en un M4.
- Asistentes de voz locales y privados: el chat por voz con texto y audio intercalados, junto con el tamano reducido (1,62 GB en q4tp), permite construir asistentes que no envian audio a la nube.
- Atencion al cliente multilingue: el servidor compatible con OpenAI permite integrar el modelo en plataformas existentes de conversacion, aceptando audio del usuario en base64 y respondiendo en texto.
- Analisis de audio ambiental: la capacidad de responder preguntas sobre grabaciones (que se oye, que ocurre) sirve para catalogacion de archivos sonoros o monitorizacion.
- Desarrollo multiplataforma sin Python: cortiq se distribuye como binarios precompilados para Linux, macOS y Windows con backends Vulkan, DX12 y Metal, util para embarcar el modelo en aplicaciones de escritorio.
- Generacion de contenido en varios idiomas: se puede pedir TTS en aleman, japones o castellano con el mismo binario, util para localizacion rapida de mensajes cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, WER, etc.) en la informacion disponible. Si hay mediciones de rendimiento de inferencia con cortiq 0.8.50 y cuantizacion q4tp:

| Tarea | NVIDIA A40 (Vulkan) | Apple M4 (Metal) |
|---|---:|---:|
| Sintesis de 7,0 s de voz | 5,6 s | 3,2 s |
| Decodificacion de texto (`cortiq bench --core`) | 204 tok/s (172 con q8_2f) | 79 tok/s |
| Transcripcion de clip de 4,4 s (incluida la carga) | — | 1,5 s |

Cada frame de voz implica un paso del modelo de lenguaje en GPU mas tres pasadas del depth decoder en CPU (16-23 ms por frame); la decodificacion final del codec para 7 s de voz cuesta 0,1 s en el M4 y 0,6 s en la CPU del host con A40.

## Requisitos de hardware

- Ambos ficheros caben en cualquier GPU con 3 GB de memoria libre (q4tp: 1,62 GB; q8_2f: 2,45 GB).
- GPU NVIDIA, AMD e Intel mediante Vulkan o DX12; en Linux sin entorno grafico hay que instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Apple silicon: el backend Metal es el predeterminado; un M4 alcanza 79 tok/s de texto y 3,2 s para 7 s de voz.
- CPU pura: posible con `CMF_GPU=0`, aunque el depth decoder ya se ejecuta en CPU por diseno (16-23 ms por frame).
- Despliegue: mediante `cortiq run` (CLI) o `cortiq serve` (servidor compatible con OpenAI en el puerto que se indique). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia: transcripcion de un clip de 4,4 s en 1,5 s en Apple M4; throughput de texto de 79-204 tok/s segun hardware.

## Comparativa con modelos similares

| Modelo | Tamano | Modalidades | Formato/entorno | Licencia |
|---|---|---|---|---|
| LFM3-Audio-2B-cmf (esta ficha) | ~2B | ASR, TTS, chat por voz, comprension de audio | CMF + cortiq (Rust, Vulkan/Metal/CPU) | lfm1.0 |
| LiquidAI/LFM3-Audio-2B (base) | ~2B | ASR, TTS, chat por voz, comprension de audio | Transformers (Python, bf16) | lfm1.0 |
| Whisper (OpenAI) | 0,1B-1,5B aprox. | Solo ASR | PyTorch / GGML | MIT (modelos) |
| Kokoro / Piper (TTS ligeros) | decenas de MB | Solo TTS | ONNX / propios | Apache-2.0 / MIT |

La ventaja diferencial frente a Whisper o a los TTS ligeros es la unificacion de reconocimiento, sintesis, chat por voz y comprension de audio en un solo modelo ejecutable sin Python; frente al checkpoint base de Liquid AI, esta version reduce el fichero a 1,62-2,45 GB y elimina la dependencia del stack de Transformers. No hay datos comparativos de calidad (WER, MOS) entre ellos en la informacion disponible.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other": conviene revisar el fichero LICENSE antes de cualquier uso comercial, ya que no se trata de una licencia permisiva estandar como Apache-2.0 o MIT.
- En salida de voz cuantizada, los códigos greedy divergen del checkpoint bf16 tras los primeros frames; la voz generada se transcribe correctamente, pero puede diferir en entonacion o prosodia respecto al modelo original.
- Las respuestas en texto nunca abren un turno de voz, una restriccion de comportamiento a tener en cuenta en dialogos mixtos.
- El servidor compatible con OpenAI responde solo en texto; la salida de voz (`--speech-out`), el reconocimiento en streaming y la voz en streaming en el servidor no estan disponibles todavia.
- La entrada de audio debe ser WAV (otros formatos requieren conversion previa con ffmpeg) y se remuestrea a 16 kHz mono.
- No hay datos publicos de WER, MOS ni benchmarks academicos, por lo que la calidad en produccion debe validarse sobre el dominio concreto de cada proyecto.
- El repositorio tiene muy pocas descargas (1) y es una conversion de terceros (infosave), no oficial de Liquid AI; se recomienda verificar los sha256 publicados antes de ejecutar.
- El numero exacto de parametros, la longitud de contexto y los detalles del entrenamiento del modelo base no constan en la informacion disponible.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/infosave/LFM3-Audio-2B-cmf
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Repositorio de cortiq/CMF (codigo y binarios): https://github.com/infosave2007/cmf
- Releases con binarios precompilados: https://github.com/infosave2007/cmf/releases
