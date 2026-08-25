# florianvoss/whisper-small-a16w8

## Resumen

`florianvoss/whisper-small-a16w8` es una versión cuantizada y precompilada del modelo OpenAI Whisper Small, optimizada para ejecutarse exclusivamente en la plataforma de aceleración SiMa.ai Modalix. El modelo base, Whisper Small, es un Transformer encoder-decoder de 244 millones de parámetros entrenado por OpenAI para reconocimiento automático del habla (ASR) y traducción de voz a inglés, con soporte para 99 idiomas. Esta variante concreta no es un checkpoint estándar de Transformers: contiene artefactos compilados (`elf_files/`, `devkit/`) que consume el runtime Neat de SiMa.ai en dispositivos Modalix.

La relevancia de este modelo radica en que ofrece una ruta de despliegue de Whisper en hardware embebido de bajo consumo sin necesidad de compilar ni cuantizar manualmente el modelo, mediante una cuantización A16W8 (activaciones en 16 bits y pesos en 8 bits) y un flujo de integración vía LLiMa model manager o descarga directa. Está pensado para aplicaciones de transcripción y traducción de voz en el dispositivo, con una ventana de audio máxima de 30 segundos y un límite de 448 posiciones en el decodificador. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque el hardware objetivo es específico de SiMa.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 244 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio; maximo de 448 posiciones en el decodificador |
| Tipos de cuantizacion | A16W8 (activaciones en 16 bits, pesos en 8 bits) |
| Idiomas soportados | 99 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos compilados ELF (`elf_files/`) y configuracion en `devkit/`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Whisper Small de OpenAI, un transformer encoder-decoder entrenado con supervisión débil sobre 680.000 horas de audio multilingüe y multitarea, que incluye transcripción y traducción al inglés. La variante A16W8 no modifica la arquitectura, sino que aplica una cuantización de pesos a 8 bits con activaciones en 16 bits y compila el grafo completo para el acelerador SiMa.ai Modalix mediante el runtime Neat 0.4.0. Los datos de entrenamiento de la cuantización no están publicados, y la model card indica que los resultados de precisión del modelo original no deben tratarse como mediciones de este build. No se menciona ningún proceso de ajuste fino, RLHF o DPO: es una cuantización post-entrenamiento con compilación para hardware específico.

## Capacidades

- Transcripción automática de voz en 99 idiomas, con detección de idioma automática.
- Traducción de voz a inglés (tarea de speech translation).
- Procesamiento de audio de hasta 30 segundos por ventana.
- Integración directa en aplicaciones C++ y Python mediante la API `ASRModel` de Neat.
- Despliegue como servicio HTTP con `GenAIServer`, accesible desde navegador o clientes remotos.
- Compatible con el gestor de modelos LLiMa para instalación en el dispositivo.
- No produce timestamps de palabra o segmento, ni diarización de hablantes.
- No es un modelo multimodal: solo entrada de audio y salida de texto.

## Casos de uso

- **Transcripción de reuniones en dispositivos embebidos**: el modelo procesa fragmentos de hasta 30 segundos, por lo que se puede segmentar audio largo y transcribir en tiempo real en hardware Modalix sin depender de la nube, con latencia controlada.
- **Subtitulado automático para contenido multimedia**: al ejecutarse localmente, permite generar subtítulos en 99 idiomas en sistemas de edición o streaming con bajo consumo energético.
- **Asistente de voz en kioscos o dispositivos de borde**: la API `ASRModel` permite integrar reconocimiento de voz en aplicaciones C++ de bajo nivel, adecuado para terminales de autoservicio o dispositivos médicos.
- **Traducción de voz a inglés en tiempo real**: la tarea de speech translation convierte audio en cualquier idioma soportado a texto en inglés, útil para interpretación en sistemas de atención al cliente.
- **Servicio de transcripción HTTP interno**: con `GenServer`, se puede servir el modelo como API REST para que varios clientes envíen audio y reciban texto, útil en entornos de laboratorio o intranet con hardware Modalix.
- **Accesibilidad para personas con discapacidad auditiva**: integración en aplicaciones de subtitulado en vivo o transcripción de conversaciones en dispositivos embebidos con requisitos estrictos de privacidad (todo el procesamiento local).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de precision o rendimiento para este artefacto A16W8 compilado, y que los resultados del modelo fuente no deben considerarse como mediciones de esta build.

## Requisitos de hardware

- **Hardware objetivo**: exclusivamente dispositivos SiMa.ai Modalix. No se puede ejecutar en GPU de proposito general (NVIDIA, AMD) ni en CPU convencional.
- **Software necesario**: SiMa.ai Neat Runtime 0.4.0 o superior, instalado en el dispositivo.
- **VRAM estimada**: no disponible (el modelo se ejecuta en el acelerador de Modalix, no en memoria de GPU estandar).
- **Almacenamiento**: el repositorio ocupa 1.2 GB, que se copian a `/media/nvme/llima/models/` en el dispositivo.
- **Opciones de despliegue**: integracion directa en aplicaciones C++/Python con `ASRModel`, o como servicio HTTP con `GenServer`.
- **Latencia y throughput**: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Hardware objetivo | Licencia | Contexto |
|---|---|---|---|---|---|
| florianvoss/whisper-small-a16w8 | 244 M | A16W8 | SiMa.ai Modalix | Apache-2.0 | 30 s de audio |
| openai/whisper-small (original) | 244 M | FP32/FP16 | GPUs y CPU | MIT | 30 s de audio |
| florianvoss/whisper-medium-a16w8 | 769 M (estimado) | A16W8 | SiMa.ai Modalix | Apache-2.0 | 30 s de audio |
| openai/whisper-base | 74 M | FP32 | GPUs y CPU | MIT | 30 s de audio |

La comparativa con el modelo original es la mas relevante: el modelo cuantizado tiene el mismo tamano de parametros y contexto, pero esta restringido a hardware SiMa.ai, mientras que el original se puede ejecutar en cualquier GPU o CPU con Transformers. Whisper-medium-a16w8 ofrece mas capacidad de transcripcion a costa de mas recursos en el mismo hardware.

## Limitaciones y advertencias

- **Hardware exclusivo**: los artefactos compilados solo funcionan en SiMa.ai Modalix con Neat Runtime; no se pueden cargar con `transformers.AutoModel` ni en entornos estandar.
- **Ventana de audio limitada**: el runtime procesa un maximo de 30 segundos por inferencia; para grabaciones mas largas hay que segmentar el audio previamente.
- **Sin timestamps**: esta build no produce marcas temporales de palabra ni de segmento, lo que limita su uso en subtitulado sincronizado.
- **Sin diarizacion**: no diferencia hablantes en conversaciones multiples.
- **Posibles diferencias por cuantizacion**: la cuantizacion A16W8 puede introducir ligeras variaciones de precision frente al modelo en punto flotante.
- **Alucinacion y sesgos**: como Whisper base, puede alucinar texto durante silencios o audio ruidoso, y su rendimiento varia significativamente segun idioma, acento y dominio. Se recomienda evaluar con datos representativos antes de produccion.
- **Sin resultados de precision publicados**: no hay benchmarks de esta build especifica, por lo que no se puede garantizar la precision en el hardware objetivo.
- **Licencia**: Apache-2.0 permite uso comercial, pero el hardware y el runtime son propietarios de SiMa.ai, lo que puede limitar el despliegue fuera de su ecosistema.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/florianvoss/whisper-small-a16w8)
- [Modelo original de OpenAI](https://huggingface.co/openai/whisper-small)
- [Articulo Whisper (arXiv)](https://arxiv.org/abs/2212.04356)
- [Guia de inicio rapido de SiMa.ai Neat](https://developer.sima.ai/software/getting-started/)
- [Documentacion de la API GenAI Model](https://developer.sima.ai/software/develop-apps/development-workflow/genai-model)
- [Tutorial para servir modelos GenAI](https://developer.sima.ai/software/tutorials/serve-genai-models)
