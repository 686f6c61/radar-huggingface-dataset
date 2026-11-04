# infosave/Kandinsky-S2V-1.0-Pro-distill-cmf

## Resumen

Kandinsky S2V 1.0 Pro-distill es un modelo de generacion de video speech-to-video (S2V) desarrollado por Kandinsky Lab que convierte un unico fotograma de referencia y una pista de audio de voz en un video de avatar donde se mueve la figura completa, no solo la cabeza. Esta ficha cubre la version cuantizada y empaquetada en formato CMF publicada por el usuario infosave, que agrupa el DiT, los codificadores de voz y texto, CLIP y el VAE en un unico archivo para `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de aprendizaje automatico.

La relevancia de esta publicacion es practica: reduce el coste de despliegue del modelo original en Diffusers (bf16) a dos variantes cuantizadas de 24,0 GB (4 bits) y 32,3 GB (8 bits), con una fidelidad latente muy alta frente al original (coseno 0,9996 y 0,9999 respectivamente) y un PSNR de 40,9 dB en los fotogramas decodificados del primer fragmento. El modelo base emplea una arquitectura DiT con un Thinker basado en Qwen2.5-Omni y un VAE heredado de HunyuanVideo, y esta disponible bajo licencia MIT.

El modelo esta pensado para generar videos de avatar de hasta 300 segundos de audio, procesando la pista por fragmentos de 5 segundos condicionados secuencialmente. Soporta ingles, ruso y chino como idiomas de prompt y esta disponible en formato CMF para Vulkan (NVIDIA), Metal (Apple silicon) y CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con codificador de voz, codificador de texto (Thinker Qwen2.5-Omni, 7B) y VAE (HunyuanVideo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada hasta 300 s; procesamiento por fragmentos de 5 s) |
| Tipos de cuantizacion | q4tp (4 bits en el DiT, 8 bits en bloques de voz/prompt, VAE en 16 bits) y q8 (8 bits en el DiT, 8 bits en voz/prompt, VAE en 16 bits) |
| Idiomas soportados | en, ru, zh |
| Licencia | MIT (componentes Qwen2.5-Omni Thinker y HunyuanVideo VAE bajo sus propias licencias) |
| Formato de pesos | CMF (un unico archivo autocontenido para cortiq) |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusion basado en DiT que genera video condicionado por un fotograma de referencia y una pista de voz. La pila incluye un DiT como generador principal, un codificador de voz, un codificador de texto (el Thinker basado en Qwen2.5-Omni de 7B), CLIP y un VAE procedente de HunyuanVideo. La generacion se realiza por fragmentos de 5 segundos (125 fotogramas a 25 fps) con 16 pasos de muestreo mediante segmentos pi-Flow, y cada fragmento se condiciona sobre el anterior para mantener la coherencia en pistas de audio largas.

La version CMF empaqueta todos estos componentes en un solo archivo y aplica cuantizacion selectiva: el DiT se cuantiza a 4 bits (q4tp) o 8 bits (q8), mientras que los bloques de voz y prompt del DiT, el Thinker y la torre de audio se mantienen en 8 bits, y el VAE en 16 bits. Las condiciones de texto del prompt por defecto se almacenan en el propio archivo, de modo que el codificador de texto de 7B solo se carga cuando se usa un `--prompt` personalizado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video de avatar a partir de un unico fotograma de referencia (PNG o JPEG) y una pista de voz (WAV u otros formatos via ffmpeg).
- Animacion de la figura completa, no solo del rostro: el modelo mueve cuerpo, manos y cabeza de forma coherente con la voz.
- Generacion de video de hasta 300 segundos de audio, procesando por fragmentos de 5 segundos condicionados secuencialmente.
- Soporte de resoluciones de 512x512, 768x512 y 512x768 (bucket de 512 mas cercano a la imagen de entrada).
- Modo borrador a 256x256 (fuera de los tamanos entrenados) que conserva voz y movimiento pero pierde detalle en cara y manos.
- Control mediante prompt de texto para describir el movimiento (requiere cargar el codificador de texto de 7B).
- Control de semilla de ruido y numero de pasos de muestreo.
- Salida en AVI con MJPEG y la pista de audio original a 25 fps; conversion a mp4 mediante ffmpeg.
- Soporte multilingue de prompt en ingles, ruso y chino.

## Casos de uso

- Generacion de avatares para locucion y presentaciones: a partir de un retrato y una narracion grabada, el modelo produce un video donde la figura completa gesticula y se mueve, adecuado para contenido formativo o corporativo sin necesidad de rodaje.
- Doblaje y localizacion de video: sustituir la pista de voz de un presentador por una version en otro idioma (en, ru, zh) manteniendo el fotograma de referencia y regenerando el movimiento labial y corporal sincronizado con el nuevo audio.
- Prototipado rapido de personajes para animacion: usar el modo borrador a 256x256 (unos 64 s por 5 s de video en L40S) para validar movimiento y sincronizacion antes de renderizar a 512x512.
- Produccion de contenido para redes sociales: generar clips verticales de 512x768 a partir de un retrato y un audio de voz, con conversion a mp4 mediante ffmpeg para publicacion directa.
- Investigacion en sincronizacion audio-video: el empaquetado CMF y el motor cortiq permiten reproducir la inferencia en Rust sin Python, lo que facilita integraciones en pipelines de investigacion y comparaciones controladas con el original en Diffusers.
- Despliegue en estaciones de trabajo Apple silicon: con Metal y q4tp, el modelo cabe en 14,6 GB de memoria unificada a 512x512, lo que permite generar avatares en un MacBook Air M4 sin GPU dedicada (aunque con tiempos de horas por clip).
- Generacion de video en entornos con requisitos de empaquetado estricto: al ser un unico archivo CMF autocontenido, simplifica el despliegue en contenedores y la distribucion de artefactos en comparacion con pipelines multi-componente.

## Benchmarks y rendimiento

Rendimiento medido en un fragmento de 5 s (125 fotogramas, 16 pasos) en L40S con Vulkan:

| Resolucion | Tokens | Tiempo por paso | VAE por fragmento | 5 s de video | VRAM pico (q4tp) |
|---|---:|---:|---:|---:|---:|
| 512x512 | 36736 | 19,7 s | 8,3 s | 5,6 min | 16,2 GB |
| 768x512 / 512x768 | 55104 | 36,9 s | 12,6 s | 10 min | 20,2 GB |
| 256x256 (borrador) | 9184 | 3,3 s | 2,9 s | 64 s | no disponible |

Rendimiento en MacBook Air M4 (GPU de 10 nucleos, 24 GB, sin ventilador) con Metal y q4tp:

| Resolucion | Tokens | Tiempo por paso | VAE por fragmento | 5 s de video | Memoria pico |
|---|---:|---:|---:|---:|---:|
| 512x512 | 36736 | 955-1047 s | 362 s | 4,45 h | 14,6 GB |
| 256x256 (borrador) | 9184 | 134-149 s | 98 s | ~39 min | 4,7 GB |

Fidelidad frente al original en bf16 con el mismo ruido:

| Variante | Tamano | VRAM pico a 512² | Coseno de latentes finales | PSNR del primer fragmento |
|---|---:|---:|---:|---:|
| q4tp | 24,0 GB | 16,2 GB | 0,9996 | 40,9 dB |
| q8 | 32,3 GB | 23,7 GB | 0,9999 | no disponible |

El original en Diffusers, con un bloque a la vez en la misma tarjeta, tarda 19,5 s por paso. Una RTX 5090 ejecuto q8 a 16,8 s por paso con 6,8 s de VAE por fragmento. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,2 GB (q4tp a 512x512), 20,2 GB (q4tp a 768x512), 23,7 GB (q8 a 512x512). En Apple silicon, 14,6 GB de memoria unificada (q4tp a 512²) y 4,7 GB (256²).
- GPU recomendadas: NVIDIA L40S (Vulkan) como referencia medida; RTX 5090 ejecuta q8 a 16,8 s por paso. Se requiere soporte de cooperative matrix en Vulkan para q4tp en NVIDIA.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (por ejemplo RTX 4090 o RTX 5090) para q4tp y q8; en Apple silicon con Metal desde 14,6 GB de memoria unificada.
- Opciones de despliegue: `cortiq` (motor en Rust, CLI `cortiq s2v`, version 0.8.55 o superior) con backends Vulkan, Metal o CPU (`CMF_GPU=0`, a horas por paso). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: 5,6 min por 5 s de video a 512x512 en L40S; 10 min a 768x512; 64 s en modo borrador 256². En MacBook Air M4, 4,45 h por 5 s a 512² y unos 39 min a 256².
- Salida: AVI (MJPEG + pista de audio) a 25 fps; conversion a mp4 con ffmpeg (`-c:v libx264 -crf 18 -c:a aac`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Kandinsky S2V 1.0 Pro-distill (CMF q4tp/q8) | Speech-to-video con DiT | no disponible | audio hasta 300 s; fragmentos de 5 s | MIT | CMF para cortiq (Vulkan, Metal, CPU) |
| Kandinsky S2V 1.0 Pro-distill (original Diffusers, bf16) | Speech-to-video con DiT | no disponible | audio hasta 300 s; fragmentos de 5 s | MIT | Diffusers (Python, PyTorch) |
| Alternativas de speech-to-video de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible en la informacion es frente al original en Diffusers: mismo modelo base, pero el CMF ocupa 24,0 GB (q4tp) frente al pipeline bf16 completo, y mantiene una similitud de latentes de 0,9996 con 40,9 dB de PSNR en el primer fragmento. No se dispone de datos de otros modelos comparables (por ejemplo, otros generadores de avatar speech-to-video) en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de uso indebido: el modelo anima a una persona real a partir de una sola fotografia y con una voz que puede no ser la suya. El autor exige consentimiento del sujeto y prohibe presentar el resultado como una grabacion genuina.
- El modo 256x256 esta fuera de los tamanos entrenados: conserva voz y movimiento pero pierde detalle en cara y manos; no es adecuado para produccion final.
- El codificador de voz se detiene a los 300 s de audio; pistas mas largas no se procesan completamente.
- La generacion es lenta: minutos por cada 5 s de video en GPU de datacenter y horas en Apple silicon; el modo CPU tarda horas por paso.
- El codificador de texto de 7B solo se carga con `--prompt` personalizado; el prompt por defecto usa condiciones precalculadas, lo que limita el control fino del movimiento sin coste adicional de memoria.
- Licencia MIT para el empaquetado, pero los componentes internos (Thinker Qwen2.5-Omni y VAE HunyuanVideo) se rigen por sus propias licencias, que deben revisarse para uso comercial.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni evaluaciones academicas en la informacion disponible.
- Dependencia de un motor especifico (`cortiq` 0.8.55 o superior) y del formato CMF; no es directamente compatible con ecosistemas Python como Diffusers sin conversion.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria del empaquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Kandinsky-S2V-1.0-Pro-distill-cmf
- Modelo base (Diffusers): https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro-distill-Diffusers
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Pagina de Qwen2.5-Omni (componente Thinker): no disponible en la informacion proporcionada
- Pagina de HunyuanVideo (componente VAE): no disponible en la informacion proporcionada
