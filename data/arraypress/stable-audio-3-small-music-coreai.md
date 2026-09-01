# arraypress/stable-audio-3-small-music-coreai

## Resumen

Stable Audio 3 Small Music en formato Apple Core AI (`.aimodel`) es una conversión comunitaria del modelo original de Stability AI, `stabilityai/stable-audio-3-small-music`, realizada por el usuario arraypress. El objetivo es permitir la generación de música y audio de alta calidad directamente en dispositivos Apple (iOS 27 y macOS 27) sin conexión, aprovechando el runtime Core AI. No se trata de un reentrenamiento ni un fine-tuning: los pesos son idénticos al original, solo cambia el formato de empaquetado.

El modelo pertenece a la familia Stable Audio 3, basada en difusión latente con un transformer (DiT) y un autoencoder semántico-acústico (SAME). Soporta generación de texto a audio, continuación de pistas, inpainting y longitudes variables de hasta 380,4 segundos, con salida estéreo a 44,1 kHz. El repositorio pesa 2,9 GB (el `.aimodel`) más 34 MB del tokenizador, todo en precisión float32. La conversión mantiene una fidelidad casi perfecta frente al modelo PyTorch original, con similitud coseno de 1,000000000 y SNR de 74,1 dB en la salida final.

La relevancia de esta conversión radica en que ofrece un rendimiento aproximadamente el doble de rápido que la misma ejecución bajo MLX con pesos de 8 bits, y elimina la dependencia de PyTorch o `stable-audio-tools` para su uso en entornos Apple. Incluye un script de ejemplo autónomo que implementa el sampler, el schedule y el ensamblado de condicionamiento en unas 120 líneas de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente con transformer (DiT) y autoencoder semantico-acustico (SAME) |
| Parametros totales | no disponible (la model card menciona 0,6 B en un contexto de medicion, sin confirmacion oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de prompt; hasta 380,4 s de audio generado |
| Tipos de cuantizacion | float32 (sin cuantizar) |
| Idiomas soportados | no disponible (el prompt es texto; probablemente ingles, no especificado) |
| Licencia | stability-ai-community (licencia comunitaria de Stability AI) |
| Formato de pesos | `.aimodel` (Apple Core AI) + tokenizador |

## Arquitectura y entrenamiento

El modelo original de Stability AI es un modelo de difusion latente que opera sobre un espacio latente comprimido por un autoencoder semantico-acustico (SAME). El componente principal es un transformer de difusion (DiT) que procesa el ruido latente condicionado por embeddings de texto y duracion. En esta conversion, el `.aimodel` contiene cuatro funciones nombradas: `conditioner` (ensambla el condicionamiento cruzado), `dit` (acepta cualquier longitud de secuencia), `decoder_N` (decodifica latentes a audio, compilado a longitudes fijas) y `encoder_N` (codifica audio para continuacion e inpainting). Los pesos se comparten entre las distintas variantes de decoder, por lo que anadir escalones de longitud solo cuesta unos 0,4 MB adicionales.

El entrenamiento original no se detalla en la informacion disponible, pero se sabe que la familia Stable Audio 3 fue disenada para generacion rapida y de alta calidad. Esta conversion no altera los pesos ni el proceso de inferencia, salvo por una diferencia estructural: el encoder y el decoder estan compilados a un maximo de 380,4 s, por lo que para audios mas cortos hay que rellenar con ceros el latente y recortar tras decodificar. El padding solo afecta a los ultimos 7-26 ms, que caen dentro del margen de recorte recomendado.

El modelo requiere un sampler especifico llamado `pingpong` (es un modelo `rf_denoiser`), 8 pasos de inferencia y un CFG scale de 1,0 por defecto. Tambien exige generar al menos 256 frames latentes (23,8 s) para evitar artefactos de alta frecuencia; por debajo de ese umbral, la energia por encima de 10 kHz puede alcanzar el 16-27 % frente al ~1 % esperado.

## Capacidades

- Generacion de texto a audio: produce musica y loops musicales a partir de descripciones textuales.
- Continuacion de audio: acepta un audio de entrada (WAV 44,1 kHz) y genera una extension coherente a partir de un prompt.
- Inpainting: puede regenerar secciones de una pista existente manteniendo el contexto.
- Negative prompts y classifier-free guidance (CFG) en su variante vanilla, verificada con coseno 1,0000000 y SNR 81,8 dB frente a la implementacion de referencia.
- Longitud variable: hasta 380,4 s de audio, con escalones de decoder para optimizar el coste segun la duracion.
- Salida estereo a 44,1 kHz.
- Control de steps, seeds y determinismo.
- Prompt de hasta 256 tokens.

## Casos de uso

- Generacion de musica de fondo para videos, podcasts o presentaciones: se puede pedir una pieza de una duracion concreta (p. ej. 24 s) y obtener un resultado listo para integrar en una edicion.
- Creacion de loops musicales para produccion: el modelo genera bucles de duracion fija que pueden importarse en DAWs como Ableton o Logic para construir bases ritmicas.
- Extension de pistas existentes: dado un audio de entrada, se puede continuar la pieza manteniendo el estilo, util para alargar una melodia o un acompanamiento.
- Relleno de huecos en grabaciones (inpainting): si una seccion de una pista esta danada o vacia, el modelo puede regenerarla a partir del contexto circundante.
- Prototipado rapido de ideas musicales en dispositivos Apple: al ejecutarse on-device, permite experimentar sin conexion y con baja latencia (2,21 s para 23,8 s de audio en un Mac M-series).
- Integracion en apps iOS/macOS de creacion musical: el formato `.aimodel` y el runtime Core AI facilitan incorporar generacion de audio en aplicaciones nativas sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de audio. La informacion disponible incluye mediciones de fidelidad y rendimiento propias de la conversion:

| Metrica | Valor |
|---|---|
| Similitud coseno (DiT) | 1,000000000 |
| SNR (DiT) | 112,6 dB |
| Similitud coseno (decoder) | 1,000000000 |
| SNR (decoder) | 63,1 dB |
| Similitud coseno (encoder) | 1,000000000 |
| SNR (encoder) | ~100 dB |
| Similitud coseno (audio final) | 0,999999981 |
| SNR (audio final) | 74,1 dB |
| Tiempo de generacion (23,8 s de audio, Mac M-series 36 GB) | 2,21 s (~10,8x realtime) |
| Comparativa con MLX 8-bit | ~2x mas rapido |

## Requisitos de hardware

- Dispositivos Apple con chip M-series y sistema iOS 27 o macOS 27 (requisito del runtime Core AI).
- Memoria: la model card indica ~7,7 GB fijos mas ~0,32 GB por segundo de audio para el modelo de 2 B; para este modelo small no se especifica, pero se espera un consumo menor. El `.aimodel` ocupa 2,9 GB en disco.
- La primera carga del modelo compila el `.aimodel` para el dispositivo concreto, lo que puede ser lento; el resultado se cachea para usos posteriores.
- Despliegue: se puede usar con el runtime `coreai-torch` y el script `example.py` incluido en el repositorio, que no requiere PyTorch ni `stable-audio-tools`.
- Para portar a Swift, el script de ejemplo contiene el sampler, el schedule y el ensamblado de condicionamiento en unas 120 lineas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Stable Audio 3 Small Music (original) | no disponible | 256 tokens / 380,4 s | PyTorch (safetensors) | stability-ai-community | Requiere GPU/CPU tradicional, sin soporte nativo Apple |
| Stable Audio 3 Small Music (esta conversion) | no disponible | 256 tokens / 380,4 s | `.aimodel` (Core AI) | stability-ai-community | Optimizado para Apple Silicon, ~2x mas rapido que MLX |
| Stable Audio 3 Medium/Large | no disponible | mayor capacidad | PyTorch | stability-ai-community | Mayor calidad pero mas recursos; no hay conversion Core AI publicada |
| MusicGen (Meta) | 1,5 B / 3,3 B | 30 s | PyTorch | CC-BY-NC | Generacion de musica, pero sin continuacion/inpainting nativo y sin soporte Apple Core AI |

## Limitaciones y advertencias

- No es un release oficial de Stability AI: es una conversion comunitaria, aunque los pesos no se han modificado.
- Solo funciona en dispositivos Apple con iOS 27 / macOS 27 y el runtime Core AI; no es portable a otras plataformas.
- El CFG adaptativo proyectado (APG) de la implementacion original no esta implementado; solo se ofrece CFG vanilla.
- El sampler debe ser `pingpong` obligatoriamente; usar Euler produce salida saturada (+7,8 dBFS) y compresion de rango dinamico de ~10 dB.
- Generar menos de 256 frames latentes (23,8 s) produce artefactos de alta frecuencia (16-27 % de energia por encima de 10 kHz).
- La primera carga compila el modelo y puede tardar considerablemente, especialmente con decoders largos.
- La licencia `stability-ai-community` puede imponer restricciones de uso comercial; conviene revisar el archivo LICENSE.md antes de desplegar en produccion.
- El encoder y decoder estan compilados a longitudes fijas; para audios cortos hay que pagar el coste del maximo si se usa un decoder grande, aunque la escalera de decoders mitiga este problema.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/arraypress/stable-audio-3-small-music-coreai
- Modelo original: https://huggingface.co/stabilityai/stable-audio-3-small-music
- Pagina de investigacion de Stable Audio 3: https://stability.ai/research/stable-audio-3
- Repositorio oficial de Stable Audio 3: https://github.com/Stability-AI/stable-audio-3
