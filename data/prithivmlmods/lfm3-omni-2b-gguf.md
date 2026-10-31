# prithivMLmods/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es una cuantización en formato GGUF del modelo omni-modal LFM3-Omni-2B de Liquid AI, publicada por el usuario prithivMLmods en Hugging Face. El modelo base es un modelo compacto de aproximadamente 2,2B de parámetros (1.728.801.600 parámetros en los pesos safetensors del repositorio base) diseñado para despliegue en dispositivos edge, que unifica procesamiento de visión, audio y lenguaje en una sola arquitectura. Permite reconocimiento de voz (ASR), síntesis de voz (TTS), chat por voz, traducción, comprensión de vídeo, respuesta a preguntas visuales (VQA) y tool calling.

Su relevancia radica en la tendencia actual hacia modelos omni-modales pequeños que funcionan localmente sin depender de la nube: acepta texto, imágenes, audio y vídeo como entrada, y genera texto, voz a 24 kHz o salidas intercaladas de texto y voz. La versión GGUF lo hace ejecutable directamente con llama.cpp en hardware de consumo, incluyendo la generación de voz mediante `llama-tts`. Según la model card, supera a varios modelos mayores en benchmarks multimodales como Daily-Omni (70,09) u OmniBench (48,25).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models), basada en el backbone LFM3-1.7B, omni-modal (no disponible el detalle exacto de la arquitectura interna) |
| Parametros totales | 1.728.801.600 (safetensors del modelo base); la model card indica ~2,2B |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (22 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | GGUF (esta cuantización); el modelo base está disponible también en BF16 safetensors |

## Arquitectura y entrenamiento

LFM3-Omni-2B se construye sobre el backbone LFM3-1.7B de Liquid AI, la familia de modelos basada en arquitecturas híbridas propietarias de Liquid Foundation Models. La model card no detalla la composición exacta de la arquitectura (proporción de capas transformer, atención lineal o variantes tipo SSM), aunque la familia LFM de Liquid AI es conocida por emplear mezclas híbridas de capas. El modelo integra componentes de visión y audio que le permiten procesar imágenes, audio y vídeo, y generar voz a 24 kHz además de texto.

No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que se trata de un modelo no reasoning (sin modo de pensamiento explícito), lo que conviene configurar con `--reasoning off` en llama-server.

## Capacidades

- Reconocimiento de voz (ASR) multilingüe, con especificación del idioma mediante el prompt de sistema `Perform ASR in <language>.`
- Síntesis de voz (TTS) a 24 kHz, con selección de idioma (`--tts-lang`) y voz masculina o femenina (`--tts-voice`)
- Chat por voz y generación de salidas intercaladas de texto y voz (speech-to-speech)
- Comprensión de imágenes: descripción, VQA, OCR y análisis de documentos
- Comprensión de vídeo (no soportada aún en llama.cpp, disponible vía Transformers y SGLang)
- Traducción entre los 22 idiomas soportados
- Tool calling / function calling
- Pipeline any-to-any: acepta texto, imágenes, audio y vídeo como entrada
- Ventana de contexto de 32K tokens para conversaciones y documentos largos

## Casos de uso

- Asistentes de voz en dispositivos edge: gracias a su tamaño reducido (~1,1 GB en Q4_K_M) y su capacidad de ASR y TTS nativos, puede implementarse un asistente conversacional por voz completamente local en portátiles o SBCs, sin enviar audio a la nube.
- Transcripción automática de audio: con el prompt de ASR y entrada de ficheros WAV, es adecuado para transcribir notas de voz, reuniones o dictados en múltiples idiomas, incluyendo español, directamente con llama-mtmd-cli.
- Generación de locuciones y voz sintética: mediante `llama-tts` puede producir audio a 24 kHz con voz masculina o femenina, útil para narración de contenidos, respuestas de IVR o accesibilidad (lectura de textos).
- Análisis de documentos y OCR: sus resultados de 92,47 en DocVQA y 806 en OCRBench lo hacen apropiado para extracción de datos de facturas, formularios y documentos escaneados en flujos de automatización.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con contexto de 32K tokens, combinando texto, imágenes (capturas, fotos de productos) y audio en un mismo flujo, con tool calling para integrarse con sistemas de tickets o CRM.
- Moderación y descripción de contenido visual: la comprensión de imágenes y vídeo permite etiquetar, describir o verificar contenido multimedia en pipelines de moderación.
- Traducción hablada: combinando ASR y TTS en un único modelo, puede construirse un traductor de voz en tiempo casi real para los 22 idiomas soportados.
- Prototipado local de agentes multimodales: su soporte de tool calling y su bajo consumo de recursos permiten desarrollar y probar agentes que combinen visión, voz y acciones externas en una estación de trabajo convencional.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base:

| Benchmark | Puntuacion |
|---|---|
| Daily-Omni | 70,09 |
| WorldSense | 47,10 |
| AV-SpeakerBench | 46,79 |
| OmniBench | 48,25 |
| DocVQA | 92,47 |
| OCRBench | 806 |
| POPE | 89,34 |
| UTMOSv2 (TTS inglés) | 3,80 |

La model card afirma que supera a varios modelos mayores en benchmarks multimodales, aunque no se incluyen comparativas numéricas con modelos concretos en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~915 MB (Q3_K_M) hasta ~3,47 GB (BF16), más el proyector multimodal de 950 MB (mmproj-bf16). En Q4_K_M, el conjunto completo ronda los 2 GB, ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; en CPU funciona con llama.cpp. Si se desea aceleración, cualquier GPU con 4 GB de VRAM o más es suficiente (por ejemplo, RTX 3060, RTX 4060 o superiores).
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo moderna, incluso en portátiles con gráfica integrada y 8 GB de RAM unificada.
- Opciones de despliegue: llama.cpp (llama-mtmd-cli, llama-server, llama-tts), Transformers de Hugging Face y SGLang. La flag `-hf` de llama.cpp descarga el modelo y el mmproj automáticamente. No hay mención a vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. Al ser un modelo de ~2B de parámetros, se espera inferencia fluida en CPU moderna, pero no hay cifras publicadas.
- Limitación de despliegue: la entrada de vídeo no está soportada aún en llama.cpp; para vídeo hay que usar Transformers o SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B (Liquid AI) | ~2,2B | 32K | Texto, imagen, audio, vídeo; salida texto y voz 24 kHz | LFM Open License v1.0 |
| Qwen2.5-Omni-3B (Alibaba) | 3B | no disponible | Texto, imagen, audio, vídeo; salida texto y voz | Apache 2.0 / restricciones parciales |
| Qwen2-Audio-7B | 7B | no disponible | Texto y audio | Apache 2.0 |
| Phi-4-mini (Microsoft) | 3,8B | 128K | Solo texto | MIT |

Nota: la comparativa se ofrece a título orientativo; los datos de benchmarks comparativos directos con estos modelos no están disponibles en la información proporcionada. La principal ventaja de LFM3-Omni-2B es su tamaño mínimo para capacidades omni-modales completas (incluida TTS nativa), frente a alternativas que requieren más recursos o no cubren todas las modalidades.

## Limitaciones y advertencias

- Es un modelo no reasoning: no genera razonamiento paso a paso; en llama-server debe usarse `--reasoning off` para evitar comportamientos inesperados.
- La entrada de vídeo no está soportada en llama.cpp; solo disponible mediante Transformers o SGLang.
- La licencia LFM Open License v1.0 no es una licencia estándar permisiva (Apache/MIT): debe revisarse el texto completo en el enlace de la licencia antes de cualquier uso comercial.
- Como todo modelo compacto, puede presentar alucinaciones en tareas de razonamiento complejo y conocimiento factual limitado; los benchmarks publicados se centran en tareas multimodales, no en razonamiento general.
- La calidad de TTS medida (3,80 UTMOSv2) es buena pero no indica equivalencia con voces humanas; puede haber artefactos en idiomas distintos del inglés, donde se ha medido la calidad.
- El repositorio de cuantización es de un tercero (prithivMLmods), no del autor oficial (LiquidAI); conviene verificar la integridad de los ficheros GGUF.
- Riesgos habituales de sesgo en modelos multimodales (sesgos de género en voces sintéticas, sesgos culturales en descripción de imágenes) no han sido documentados específicamente en la información disponible.
- Uso con `custom_code` en Transformers: requiere confianza en el código del repositorio.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/prithivMLmods/LFM3-Omni-2B-GGUF
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Guía de despliegue con llama.cpp de Liquid AI: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
