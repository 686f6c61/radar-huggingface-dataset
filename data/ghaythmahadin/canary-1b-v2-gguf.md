# GhaythMahadin/canary-1b-v2-gguf

## Resumen

Canary-1b-v2-gguf es la conversión al formato GGUF del modelo NVIDIA Canary 1B v2, un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) desarrollado originalmente por NVIDIA. Esta versión, publicada por el usuario GhaythMahadin, está pensada para su uso con transcribe.cpp, una implementación de inferencia en C++ orientada a ejecución local y eficiente en CPU y GPU sin necesidad de stack Python.

El modelo resuelve dos tareas sobre audio: transcripción de voz a texto en 25 idiomas europeos y traducción de voz desde y hacia el inglés. Se trata de un modelo multitarea de tipo AED (attention encoder-decoder) con 978 millones de parámetros, compuesto por un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas. Su relevancia radica en que ofrece cobertura multilingüe amplia (25 idiomas) con un tamaño contenido que permite despliegue en hardware de consumo cuando se cuantiza, manteniendo una tasa de error de palabra (WER) muy baja en inglés.

La licencia CC-BY-4.0 permite uso comercial y no comercial con atribución, lo que lo hace atractivo para integrarlo en productos. Esta conversión GGUF añade valor al permitir ejecución offline en entornos sin GPU dedicada, con cuantizaciones que van desde 701 MB (Q4_K_M) hasta 3,7 GB (F32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: encoder FastConformer de 32 capas + decoder Transformer de 8 capas |
| Parametros totales | 980.046.848 (978M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, entrada de audio de 16 kHz mono WAV) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder multitarea de tipo AED. El encoder es un FastConformer de 32 capas, una variante eficiente del Conformer que reduce el coste computacional mediante atención con submuestreo. El decoder es un Transformer de 8 capas que genera la secuencia de texto condicionada por la representación del audio y por un token de tarea que indica el idioma de origen, el idioma de destino y si se trata de transcripción o traducción.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card upstream indica que el modelo está entrenado para ASR en 25 idiomas y para traducción English→24 idiomas y 24 idiomas→English. La conversión GGUF fue validada contra la referencia NeMo en el commit db53eda de transcribe.cpp, con fecha de pin 2026-05-08, lo que garantiza fidelidad numérica respecto al modelo original.

## Capacidades

- Transcripción automática del habla (ASR) en 25 idiomas europeos: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano.
- Traducción de voz (AST) desde inglés hacia los otros 24 idiomas.
- Traducción de voz (AST) desde los otros 24 idiomas hacia inglés.
- Entrada de audio: WAV mono a 16 kHz.
- No soporta streaming (streaming: false en la metadata de transcribe.cpp).
- No expone timestamps de palabra ni de segmento en este port v1 (timestamps: none).
- No realiza detección automática de idioma (lang_detect: false); el idioma debe especificarse.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de voz.
- No tiene capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y actas multilingües: el modelo puede transcribir audio de reuniones en cualquiera de los 25 idiomas, lo que permite generar actas automáticas en organizaciones con equipos distribuidos por Europa. Su tamaño contenido (701 MB en Q4_K_M) permite ejecutarlo en portátiles sin GPU dedicada.
- Subtitulado de contenido audiovisual: dado que no expone timestamps, se usaría para generar la transcripción completa y luego alinear los subtítulos con herramientas externas de forced alignment. Adecuado para vídeos en inglés, español, alemán, francés y el resto de idiomas soportados.
- Traducción de voz en atención al cliente: permite transcribir una llamada en polaco y traducirla a inglés (o viceversa) para agentes que no dominan el idioma, gracias a las capacidades AST del modelo.
- Archivado y búsqueda de grabaciones: transcripción offline de grandes volúmenes de audio en servidores sin GPU, usando la cuantización Q4_K_M o Q5_K_M para maximizar throughput en CPU.
- Investigación lingüística y corpus: generación de transcripciones para corpus de habla en idiomas europeos de bajos recursos como maltés, estonio o esloveno, donde los modelos ASR comerciales tienen menor cobertura.
- Asistentes de voz embebidos: integración en dispositivos edge o aplicaciones de escritorio mediante transcribe.cpp, que compila en C++ y no requiere Python, con soporte Metal en macOS y Vulkan en Linux/Windows.
- Accesibilidad: transcripción en tiempo real (no streaming, por lo que se procesaría por segmentos) de audio para personas con discapacidad auditiva en entornos multilingües.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, decodificación greedy, sin LM externo), según la model card de esta conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,7 GB | 1,92% |
| F16 | 1,8 GB | 1,92% |
| Q8_0 | 1,1 GB | 1,91% |
| Q6_K | 889 MB | 1,94% |
| Q5_K_M | 798 MB | 1,93% |
| Q4_K_M | 701 MB | 1,91% |

El baseline F32 de esta conversión es 1,92%, frente al 2,18% reportado por NVIDIA en la model card upstream (Δ −0,26 pp, atribuido a diferencias de scoring).

Rendimiento (RTF, real-time factor; mayor es mejor) reportado en la metadata de transcribe.cpp:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 85,2 |
| Apple M4 Max | CPU | 18,9 |
| AMD Ryzen 4750U | Vulkan | 13,2 |
| AMD Ryzen 4750U | CPU | 6,7 |

No se han publicado en la información disponible resultados de benchmarks multilingües (p. ej. FLEURS, Common Voice) para esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead. Q4_K_M (~701 MB) requiere menos de 1 GB de VRAM; F32 (~3,7 GB) requiere ~4 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para cuantizaciones bajas. Funciona en RTX 4090, A100, H100 sin problema, pero también en iGPU y GPUs de gama baja.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones. Incluso en GPUs integradas y en CPU pura.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con backends Metal (macOS) y Vulkan (Linux/Windows) además de CPU. No está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que estos no soportan la arquitectura Canary.
- Latencia y throughput: en Apple M4 Max con Metal, RTF 85,2 (procesa ~85 veces más rápido que tiempo real); en CPU del M4 Max, RTF 18,9; en Ryzen 4750U con Vulkan, RTF 13,2; en CPU del Ryzen 4750U, RTF 6,7.
- Conversión de audio previa: se requiere WAV mono a 16 kHz; el README sugiere `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Traduccion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Canary-1b-v2 (esta conversion GGUF) | 978M | 25 europeos | Si (EN↔24) | CC-BY-4.0 | GGUF / transcribe.cpp |
| Whisper large-v3 | ~1550M | ~99 | Si (a EN) | MIT | safetensors, GGUF, múltiples runtimes |
| Whisper medium | ~769M | ~99 | Si (a EN) | MIT | safetensors, GGUF, múltiples runtimes |
| NVIDIA Parakeet (familia) | variable | principalmente EN | limitada | CC-BY-4.0 | NeMo, safetensors |

Canary-1b-v2 se diferencia de Whisper en que soporta traducción bidireccional EN↔24 idiomas europeos (Whisper solo traduce hacia inglés) y en que está optimizado para idiomas europeos con menor cobertura. Frente a Parakeet, ofrece cobertura multilingüe amplia en lugar de centrarse en inglés. La principal ventaja de esta conversión es la disponibilidad en GGUF para transcribe.cpp, que permite ejecución sin Python; la desventaja es la ausencia de timestamps y de streaming en este port.

## Limitaciones y advertencias

- No soporta streaming: debe procesarse audio completo o por segmentos.
- No expone timestamps de palabra ni de segmento en este port v1, lo que limita su uso directo en subtitulado sincronizado.
- No realiza detección automática de idioma: el idioma debe indicarse explícitamente.
- Solo acepta WAV mono a 16 kHz; requiere preprocesado con ffmpeg u otra herramienta.
- Cobertura limitada a 25 idiomas europeos; no soporta otros idiomas ni variantes dialectales no incluidas.
- Riesgo de alucinación en audio con ruido, música o habla solapada, común en modelos ASR encoder-decoder.
- Sesgos potenciales heredados del dataset de entrenamiento de NVIDIA, cuya composición no se detalla en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y al autor de la conversión.
- La conversión está validada contra un commit concreto de transcribe.cpp (db53eda); cambios futuros en el runtime pueden requerir revalidación.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente (creada 2026-11-25) sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/canary-1b-v2-gguf
- Modelo base NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
- Commit upstream pinneado: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/canary-1b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Portal NVIDIA Developer: https://developer.nvidia.com
- Papers referenciados en los tags: arxiv:2509.14128, arxiv:2505.13404, arxiv:2305.05084, arxiv:1706.03762, arxiv:2410.01036, arxiv:2406.00899, arxiv:2205.12446, arxiv:2012.03411, arxiv:2007.10310, arxiv:2005.08072, arxiv:1510.08484
