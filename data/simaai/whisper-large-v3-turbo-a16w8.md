# simaai/whisper-large-v3-turbo-a16w8

## Resumen

Este repositorio contiene una versión cuantizada y precompilada de OpenAI Whisper Large v3 Turbo, optimizada específicamente para la plataforma de inferencia en el borde SiMa.ai Modalix. El modelo original, desarrollado por OpenAI, es un transformer encoder-decoder de 809 millones de parámetros diseñado para transcripción de voz multilingüe y traducción de voz a inglés. La variante Turbo reduce el decoder de 32 a 4 capas, lo que acelera la generación con una degradación mínima de precisión.

La compilación A16W8 (activaciones de 16 bits, pesos de 8 bits) está pensada para ejecutarse en el runtime Neat de SiMa.ai, no como un checkpoint estándar de Transformers. El repositorio incluye artefactos compilados (`elf_files/`) y configuración de runtime (`devkit/`), junto con scripts de compilación para reproducibilidad. Es relevante para desarrolladores que necesitan desplegar reconocimiento de voz en dispositivos embebidos con restricciones de potencia y memoria, aprovechando la aceleración hardware de Modalix.

La licencia MIT permite uso comercial sin restricciones, y el modelo soporta 100 idiomas con una ventana de audio máxima de 30 segundos. No se han publicado métricas de precisión o rendimiento específicas para esta compilación cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 809 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (448 posiciones de decoder) |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 100 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | MIT |
| Formato de pesos | Artefactos compilados para SiMa.ai Neat (`elf_files/`, `devkit/`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Whisper Large v3 Turbo, que conserva el encoder de 32 capas de Large v3 pero utiliza un decoder podado de 4 capas, inspirado en Distil-Whisper. Esta reducción acelera la generación manteniendo una precisión cercana a la del modelo completo. La arquitectura emplea 128 bins mel para el preprocesado de audio y una ventana máxima de 30 segundos por segmento.

Esta versión concreta no es un reentrenamiento, sino una compilación cuantizada del checkpoint original de OpenAI. La cuantización A16W8 reduce los pesos a 8 bits y mantiene las activaciones en 16 bits, lo que disminuye los requisitos de memoria y ancho de banda en hardware dedicado. El proceso de compilación para Modalix genera programas de aceleración específicos, incluidos en el directorio `elf_files/`. No se dispone de información detallada sobre el dataset de entrenamiento original más allá de la publicada por OpenAI para Whisper Large v3.

## Capacidades

- Transcripción de voz multilingüe en 100 idiomas, con detección automática de idioma.
- Traducción de voz a inglés (speech-to-text translation) para cualquier idioma soportado.
- Procesamiento de audio en segmentos de hasta 30 segundos, con manejo de contextos más largos mediante ventanas deslizantes.
- Integración directa en aplicaciones C++ y Python mediante la API `ASRModel` de Neat GenAI.
- Exposición como servicio HTTP mediante `GenAIServer`, accesible desde clientes remotos.
- Soporte de entrada de audio desde archivos o tensores de audio en memoria.
- Capacidad de streaming de audio para transcripción en tiempo real (según la documentación de Neat).
- Compilación optimizada para ejecución en el borde con bajo consumo energético.

## Casos de uso

- Transcripción de voz en dispositivos embebidos: el modelo puede ejecutarse en hardware Modalix dentro de dispositivos médicos, industriales o de automoción para convertir voz en texto localmente, sin depender de la nube. Su cuantización A16W8 reduce el consumo de memoria y energía.
- Asistentes de voz en el borde: integrable en asistentes virtuales que requieren respuesta inmediata y privacidad de datos, ya que el audio no sale del dispositivo. La API `ASRModel` permite baja latencia en procesos locales.
- Subtitulación automática en tiempo real: con la capacidad de streaming y la ventana de 30 segundos, puede generar subtítulos para vídeo en directo o reuniones, desplegado en un servidor local con `GenAIServer`.
- Traducción de voz a inglés en entornos sin conexión: útil para servicios de interpretación en aeropuertos, fronteras o eventos internacionales donde no hay conectividad fiable. El modelo traduce directamente a inglés sin pasar por texto intermedio.
- Sistemas de documentación clínica: en entornos sanitarios con requisitos estrictos de privacidad, el modelo puede transcribir consultas médicas en el dispositivo, evitando el envío de datos sensibles a la nube.
- Automatización de atención al cliente en kioscos: desplegado en terminales de autoservicio, el modelo transcribe las peticiones del usuario y las envía a un sistema de procesamiento de lenguaje natural, todo en hardware local de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta compilación A16W8 en la informacion disponible. La model card indica explícitamente que los resultados del modelo original no deben tratarse como mediciones de esta versión cuantizada. No se dispone de datos de WER, latencia o throughput para este artefacto compilado.

## Requisitos de hardware

- Dispositivo SiMa.ai Modalix obligatorio: los artefactos compilados solo se ejecutan en esta plataforma, no en GPUs estándar.
- Neat Runtime 0.4.0 o superior instalado en el dispositivo.
- No aplica VRAM tradicional: la memoria se gestiona internamente por el hardware Modalix; el tamaño del repositorio es de 4.8 GB, que incluye los artefactos compilados y el devkit.
- No es compatible con GPUs de consumo (RTX, etc.) ni con servidores convencionales.
- Opciones de despliegue: integración directa en C++/Python con `ASRModel`, o servidor HTTP con `GenAIServer`.
- Se requiere el gestor de modelos LLiMa (`llima pull`) o copia manual de los archivos al dispositivo.
- No se han publicado datos de latencia o throughput para esta compilación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| simaai/whisper-large-v3-turbo-a16w8 | 809 M | 30 s audio | A16W8 | SiMa.ai Modalix | MIT |
| openai/whisper-large-v3-turbo | 809 M | 30 s audio | FP32/FP16 | Cualquier GPU/CPU | MIT |
| openai/whisper-large-v3 | 1550 M | 30 s audio | FP32/FP16 | Cualquier GPU/CPU | MIT |

La diferencia principal radica en la plataforma objetivo: mientras que el modelo original de OpenAI se ejecuta en cualquier hardware con soporte de PyTorch, esta versión está restringida a SiMa.ai Modalix. La cuantización A16W8 reduce el tamaño de los pesos, pero no se dispone de mediciones que comparen la precisión con el modelo original. El modelo Large v3 completo tiene más del doble de parámetros, pero la variante Turbo ofrece mayor velocidad de generación.

## Limitaciones y advertencias

- Los artefactos no se pueden cargar con `transformers.AutoModel` ni con ninguna librería estándar de Hugging Face; solo funcionan en el runtime Neat de SiMa.ai.
- No se han publicado métricas de precisión (WER) para esta compilación cuantizada; la degradación respecto al modelo original es desconocida.
- La ventana de audio está limitada a 30 segundos por segmento; audios más largos requieren segmentación externa.
- El modelo solo traduce voz a inglés; no realiza traducción entre otros pares de idiomas.
- Requiere hardware específico de SiMa.ai, lo que limita su portabilidad a entornos estándar.
- No se dispone de información sobre sesgos o alucinaciones específicas de esta versión, aunque hereda las características del modelo base de OpenAI.
- El proceso de recompilación requiere un entorno Model Compiler de SiMa.ai y acceso al checkpoint original; no es trivial para usuarios finales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/simaai/whisper-large-v3-turbo-a16w8
- Modelo base original: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo Whisper Large v3: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (arXiv): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Documentación de GenAI Model: https://developer.sima.ai/software/develop-apps/development-workflow/genai-model
- Tutorial de Serve GenAI Models: https://developer.sima.ai/software/tutorials/serve-genai-models
