# simaai/whisper-medium-a16w8

## Resumen

Whisper Medium A16W8 es una versión precompilada y cuantizada de OpenAI Whisper Medium, publicada por SiMa.ai para su ejecución en la plataforma de hardware Modalix. No se distribuye como un checkpoint estándar de Transformers, sino como un conjunto de artefactos compilados (programas aceleradores en formato ELF, configuración de runtime, tokenizer y embeddings) que consume el runtime Neat/LLiMa de SiMa.ai. El modelo base es un transformer encoder-decoder de 769 millones de parámetros orientado a reconocimiento automático del habla multilingüe y traducción de voz a inglés.

La cuantización aplicada es A16W8: activaciones de 16 bits y pesos de 8 bits, lo que reduce el espacio y el ancho de banda de memoria respecto al checkpoint original en punto flotante. El modelo conserva la ventana de audio máxima de 30 segundos y las 448 posiciones máximas del decodificador propias de Whisper Medium, y declara soporte para 99 idiomas.

Su relevancia es específica: no compite con los checkpoints de Whisper en GPU, sino que habilita inferencia de ASR en dispositivos de borde con acelerador dedicado. Está ligado a una versión concreta del runtime (Neat/LLiMa 0.6.1, con una revisión etiquetada `v0.5.0` para la versión anterior), lo que lo convierte en una pieza de despliegue vertical más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 769 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos; 448 posiciones máximas del decodificador |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos compilados para Modalix: `elf_files/` (programas aceleradores) y `devkit/` (configuración de runtime, tokenizer y embeddings); no es un checkpoint safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Medium: un transformer encoder-decoder con atención completa, entrenado por OpenAI sobre una gran corpus de audio débilmente supervisado y orientado a dos tareas, transcripción multilingüe y traducción de voz a inglés. El repositorio no aporta información sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de ajuste fino con RLHF o DPO; esos detalles corresponden a la model card del checkpoint original `openai/whisper-medium`, no a esta build.

La innovación técnica de esta publicación no está en el entrenamiento sino en el despliegue: los pesos se cuantizan a 8 bits y el grafo se compila en programas ejecutables para el acelerador de SiMa.ai Modalix, con scripts de compilación incluidos (`compile.sh`, `gen_models--openai--whisper.py`) por motivos de procedencia y reproducibilidad. El paquete `devkit/` contiene la configuración de runtime, el tokenizer y los embeddings, y el runtime Neat expone la inferencia mediante la API `ASRModel` en C++ o a través de `GenAIServer` sobre HTTP.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas.
- Traducción de voz a inglés (speech translation) además de transcripción.
- Procesamiento de ventanas de audio de hasta 30 segundos por inferencia; los audios más largos deben segmentarse antes.
- Integración en proceso mediante la API `ASRModel` de Neat GenAI (C++ y Python).
- Servicio HTTP mediante `GenAIServer`, con endpoint `/v1/models` para verificar el registro del modelo y cliente de ejemplo para peticiones de transcripción.
- Selección de idioma en la petición (`request.language`).
- Soporte de tensores de audio y flujos de streaming a través de la API GenAI de SiMa.ai, según la documentación del desarrollador.
- No genera marcas de tiempo a nivel de palabra o segmento.
- No realiza diarización de hablantes.
- No soporta tool calling, function calling ni razonamiento multi-paso tipo agente: es un modelo puramente ASR.

## Casos de uso

- Transcripción en dispositivos de borde sin conectividad: el modelo se ejecuta íntegramente en Modalix con pesos de 8 bits, lo que permite desplegar dictado o subtitulado local en equipos con acelerador SiMa.ai sin enviar audio a la nube.
- Subtitulado de reuniones y notas de voz: con ventanas de 30 segundos y segmentación previa, se puede transcribir audio de reuniones en cualquiera de los 99 idiomas soportados y almacenar el texto resultante.
- Traducción de voz a inglés en atención al cliente internacional: la tarea de speech translation permite convertir una locución en otro idioma directamente a texto en inglés, útil para centralizar tickets en un único idioma.
- Servicio HTTP interno de ASR: mediante `GenAIServer` y el endpoint HTTP, un servicio o aplicación web puede enviar ficheros WAV y recibir la transcripción, integrándose en pipelines existentes sin SDK propietario en el cliente.
- Procesamiento por lotes de archivos de audio en sistemas embebidos: el cliente de ejemplo (`request_audio_transcription.py`) permite automatizar la transcripción de grabaciones almacenadas en el dispositivo.
- Asistencia por voz en interfaces de usuario embebidas: la API `ASRModel` en C++ ofrece la ruta de menor sobrecarga para integrar reconocimiento de voz dentro de una aplicación nativa en Modalix.
- Preprocesado de audio para pipelines de análisis: la transcripción generada puede alimentar motores de búsqueda, sistemas de resumen o clasificadores de texto ejecutados en el mismo dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que no se reportan resultados de precisión o rendimiento específicos para este artefacto compilado A16W8, y advierte que los resultados de la model card de `openai/whisper-medium` describen el checkpoint sin cuantizar y no deben interpretarse como mediciones de esta build.

## Requisitos de hardware

- Hardware obligatorio: dispositivo SiMa.ai Modalix con el runtime Neat instalado o actualizado. Los artefactos no se pueden cargar con `transformers.AutoModel`.
- VRAM estimada: no disponible. El modelo no se ejecuta sobre GPU convencional; se compila para el acelerador de Modalix y el repositorio ocupa 8,0 GB en total, incluyendo artefactos compilados y devkit.
- GPU recomendadas: no aplica; no hay soporte para A100, H100 ni RTX 4090 en esta distribución.
- Compatibilidad de runtime: Neat/LLiMa v0.6.1. Para Neat/LLiMa v0.5.0 debe descargarse la revisión `v0.5.0` del repositorio.
- Almacenamiento: el modelo se instala por defecto en `/media/nvme/llima/models/whisper-medium-a16w8`, lo que presupone almacenamiento NVMe en el dispositivo.
- Opciones de despliegue: API `ASRModel` en proceso (C++/Python) o `GenAIServer` con el tutorial `tutorial_021_serve_genai_models --asr <ruta>`; descarga mediante Hugging Face CLI (`hf download`) o copia por `scp` desde un host.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simaai/whisper-medium-a16w8 | 769 M | 30 s de audio, 448 posiciones de decodificador | A16W8 | Apache 2.0 | Solo SiMa.ai Modalix con runtime Neat |
| openai/whisper-medium | 769 M | 30 s de audio, 448 posiciones de decodificador | FP32/FP16 | Apache 2.0 | Checkpoint Transformers, ejecutable en GPU/CPU |
| florianvoss/whisper-medium-a16w8 | 769 M | 30 s de audio | A16W8 | no disponible | Artefactos precompilados para SiMa.ai Modalix |

La diferencia principal frente al checkpoint original es el formato de distribución y el hardware objetivo: el modelo de OpenAI es portable y ejecutable con `transformers`, mientras que esta build solo funciona en Modalix. Respecto a la réplica de `florianvoss`, la model card no establece relación ni diferencias; se trata de un repositorio con la misma descripción de artefacto precompilado.

## Limitaciones y advertencias

- Los artefactos solo se ejecutan en SiMa.ai Modalix y no se pueden cargar con `transformers.AutoModel`; no hay ruta de inferencia en GPU convencional.
- La ventana de audio está limitada a 30 segundos; es necesario segmentar grabaciones más largas antes de la inferencia.
- La build no produce marcas de tiempo a nivel de palabra ni de segmento.
- No incluye diarización de hablantes.
- La cuantización A16W8 puede introducir diferencias menores respecto al modelo de precisión completa; no se han publicado mediciones de esa degradación.
- Whisper puede alucinar texto durante silencios o audio con ruido, según advierte la propia model card.
- Dependencia estricta de versión del runtime: la build corresponde a Neat/LLiMa 0.6.1 y requiere la revisión `v0.5.0` para la versión 0.5.0 del runtime.
- No hay resultados de benchmarks publicados para este artefacto, por lo que no se puede verificar su precisión frente al modelo original.
- Licencia Apache 2.0 en el repositorio, heredada del modelo base; no se documentan restricciones adicionales para uso comercial, pero deben verificarse los términos del runtime Neat de SiMa.ai, que es software separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simaai/whisper-medium-a16w8
- Revisión v0.5.0 del repositorio: https://huggingface.co/simaai/whisper-medium-a16w8/tree/v0.5.0
- Modelo base: https://huggingface.co/openai/whisper-medium
- Réplica con la misma descripción de artefacto: https://huggingface.co/florianvoss/whisper-medium-a16w8
- Guía de inicio del runtime Neat: https://developer.sima.ai/software/getting-started/
- Documentación de GenAI Model: https://developer.sima.ai/software/develop-apps/development-workflow/genai-model
- Tutorial de servicio de modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Paper de Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
