# simaai/whisper-small-a16w8

## Resumen

Whisper Small A16W8 es una versión cuantizada y precompilada de OpenAI Whisper Small, optimizada exclusivamente para ejecutarse en la plataforma de aceleración SiMa.ai Modalix. El modelo conserva la arquitectura original de Whisper —un transformer encoder-decoder con 244 millones de parámetros— pero con los pesos cuantizados a 8 bits y las activaciones a 16 bits, lo que reduce el consumo de memoria y mejora la eficiencia en hardware embebido. Está pensado para aplicaciones de transcripción automática de voz (ASR) y traducción de voz a inglés en dispositivos de borde.

La relevancia de este modelo radica en su integración con el runtime Neat de SiMa.ai y el gestor de modelos LLiMa, que permiten desplegar ASR multilingüe en dispositivos con recursos limitados sin depender de la nube. No es un checkpoint estándar de Transformers: los directorios `elf_files/` y `devkit/` contienen artefactos compilados que solo pueden consumirse a través de las APIs de SiMa.ai. Soporta 99 idiomas y una ventana de audio de hasta 30 segundos, lo que lo hace adecuado para asistentes de voz, transcripción en tiempo real y sistemas de atención al cliente en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 244 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio, 448 posiciones maximas en el decodificador |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 99 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, entre otros) |
| Licencia | apache-2.0 |
| Formato de pesos | artefactos compilados para SiMa.ai Modalix (elf_files, devkit); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

Whisper Small A16W8 mantiene la arquitectura original de Whisper Small: un transformer encoder-decoder con atencion de tiempo completo, entrenado por OpenAI sobre un corpus masivo de audio transcrito y traducido. El modelo original se entreno con una combinacion de datos supervisados y weak supervision, lo que le permite realizar transcripcion multilingue y traduccion de voz a ingles en un solo paso. El entrenamiento incluyo tecnicas de regularizacion y aumento de datos, aunque no se ha publicado informacion detallada sobre el proceso de RLHF o DPO aplicado a esta variante.

La cuantizacion A16W8 aplicada por SiMa.ai reduce la precision de los pesos a 8 bits y mantiene las activaciones en 16 bits, lo que reduce el tamano del modelo y la latencia en el hardware Modalix. Esta cuantizacion se realizo despues del entrenamiento del modelo base, y no se han publicado detalles sobre el proceso exacto de calibracion o la perdida de precision resultante. El resultado es un artefacto compilado que no puede ejecutarse fuera de la plataforma SiMa.ai.

## Capacidades

- Transcripcion automatica de voz (ASR) en 99 idiomas, incluyendo los principales idiomas europeos y asiaticos.
- Traduccion de voz a ingles directamente desde el audio, sin necesidad de transcripcion intermedia.
- Procesamiento de ventanas de audio de hasta 30 segundos por inferencia.
- Integracion con el runtime Neat de SiMa.ai a traves de las APIs `ASRModel` (en proceso) y `GenAIServer` (HTTP).
- Compatibilidad con el gestor de modelos LLiMa para descarga e instalacion en el dispositivo Modalix.
- Capacidad de streaming de audio si se usa con la API de tensores de audio de Neat.
- No incluye timestamps a nivel de palabra o segmento, ni diarizacion de hablantes.

## Casos de uso

- Asistentes de voz embebidos: integrado en un dispositivo Modalix, el modelo permite construir asistentes de voz en vehiculos o robots que transcriben comandos en tiempo real sin conexion a la nube, gracias a su ventana de 30 segundos y su bajo consumo de memoria.
- Transcripcion medica en el borde: en entornos clinicos donde la privacidad es critica, el modelo puede transcribir conversaciones medicas en 99 idiomas directamente en el dispositivo, sin enviar audio a servidores externos.
- Subtitulado automatico en directo: con la API `GenAIServer`, el modelo puede servir transcripciones via HTTP a un sistema de subtitulado en eventos en directo, aprovechando su capacidad multilingue.
- Atencion al cliente automatizada: un sistema de IVR basado en Modalix puede transcribir las llamadas de los usuarios en su idioma y traducirlas a ingles para el sistema de gestion, con una latencia baja y sin depender de servicios externos.
- Logistica y almacen: los trabajadores pueden dictar instrucciones de voz en su idioma local, y el modelo transcribe y traduce al ingles para el sistema de gestion de inventario, todo en el borde de la red.
- Sistemas de seguridad y vigilancia: transcripcion de conversaciones en directo desde camaras con microfono, sin enviar datos de audio a la nube, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente que no se reportan medidas de precision o rendimiento especificas para este artefacto compilado A16W8, y que los resultados del modelo original Whisper Small no deben tratarse como mediciones de esta version cuantizada. Los resultados del modelo base estan disponibles en la ficha de OpenAI Whisper Small, pero no son representativos de esta compilacion.

## Requisitos de hardware

- Plataforma objetivo: SiMa.ai Modalix, un SoC de inferencia para el borde. No es compatible con GPUs de consumo general (NVIDIA, AMD) ni con CPUs estandar.
- VRAM estimada: no disponible. El tamano del repositorio es de 2.4 GB, pero el peso de los artefactos compilados en memoria depende del runtime de Neat y de la configuracion del dispositivo.
- GPU recomendada: ninguna. Requiere un dispositivo Modalix con el runtime Neat instalado (version 0.4.0 o compatible).
- Opciones de despliegue: exclusivamente via runtime Neat de SiMa.ai, con las APIs `ASRModel` para integracion en proceso o `GenAIServer` para acceso HTTP.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| simaai/whisper-small-a16w8 | Whisper encoder-decoder | 244 M | 30 s de audio | Apache 2.0 | Solo SiMa.ai Modalix |
| openai/whisper-small (original) | Whisper encoder-decoder | 244 M | 30 s de audio | MIT | Cualquier GPU/CPU con Transformers |
| openai/whisper-tiny | Whisper encoder-decoder | 39 M | 30 s de audio | MIT | Cualquier GPU/CPU con Transformers |
| openai/whisper-base | Whisper encoder-decoder | 74 M | 30 s de audio | MIT | Cualquier GPU/CPU con Transformers |

La diferencia principal es que esta version cuantizada es un artefacto compilado para un hardware especifico, mientras que el modelo original puede desplegarse en cualquier entorno con Transformers. Whisper Small es el modelo de tamano intermedio de la familia Whisper, con un equilibrio entre precision y consumo de recursos.

## Limitaciones y advertencias

- No es un checkpoint de Transformers estandar: no puede cargarse con `transformers.AutoModel` ni ejecutarse en GPUs o CPUs convencionales. Solo funciona en dispositivos SiMa.ai Modalix con el runtime Neat.
- Ventana de audio limitada a 30 segundos por inferencia. Es necesario segmentar grabaciones mas largas antes de procesarlas.
- No genera timestamps de palabra ni de segmento, y no proporciona diarizacion de hablantes.
- La cuantizacion A16W8 puede provocar diferencias menores en la precision respecto al modelo original en precision completa.
- El modelo puede alucinar texto en silencios o audio ruidoso, y su rendimiento es desigual entre idiomas, acentos y dominios. Se recomienda evaluarlo con datos representativos antes de desplegarlo en produccion.
- No se han publicado resultados de evaluacion especificos para esta version cuantizada, por lo que el rendimiento real en el dispositivo Modalix es desconocido hasta que se realicen pruebas propias.
- Aunque la licencia es Apache 2.0, el uso practico requiere hardware y software propietarios de SiMa.ai, lo que limita la portabilidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/simaai/whisper-small-a16w8)
- [Modelo base OpenAI Whisper Small](https://huggingface.co/openai/whisper-small)
- [Guia de inicio de SiMa.ai Neat](https://developer.sima.ai/software/getting-started/)
- [API GenAI Model](https://developer.sima.ai/software/develop-apps/development-workflow/genai-model)
- [Servir modelos GenAI](https://developer.sima.ai/software/tutorials/serve-genai-models)
- [Portal de apps de SiMa.ai Neat](https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant)
- [Web de SiMa.ai](https://sima.ai/)
