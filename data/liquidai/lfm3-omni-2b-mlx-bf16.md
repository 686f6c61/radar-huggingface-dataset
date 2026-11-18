# LiquidAI/LFM3-Omni-2B-MLX-bf16

## Resumen

LFM3-Omni-2B es un modelo multimodal "any-to-any" desarrollado por Liquid AI que combina comprensión y generación de texto, audio y visión en un único transformer de aproximadamente 2.170 millones de parámetros. Forma parte de la familia LFM3 (Liquid Foundation Models, tercera generación) y se distribuye bajo licencia propietaria lfm1.0. El modelo es capaz de realizar reconocimiento automático de voz (ASR), síntesis de voz (TTS), respuesta a preguntas sobre imágenes y conversación de voz a voz (speech-to-speech) con un único checkpoint.

La versión aquí descrita, LFM3-Omni-2B-MLX-bf16, es una conversión a formato MLX en precisión BF16 pensada para ejecución en Apple Silicon. Los pesos ocupan 4,33 GB y se añaden 0,15 GB para el codec de audio incluido en el directorio `audio_tokenizer/`. Se ejecuta mediante la librería MLX-VLM (versión 0.7.11 o superior) y conserva los pesos en BF16 tal como el checkpoint original.

El interés de este lanzamiento radica en la combinación de un tamaño reducido (apto para hardware de consumo y despliegue en dispositivo) con capacidades omnicanal (texto, audio, imagen) y soporte para 23 idiomas, lo que lo convierte en una opción poco habitual para prototipos de asistentes de voz y pipelines multimodales en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con codificador de audio y visión; detalles completos en la model card original |
| Parametros totales | 2.166.928.384 (~2,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en esta versión MLX; otras cuantizaciones no disponibles en la información proporcionada |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (propietaria, "other") |
| Formato de pesos | safetensors (MLX, BF16); codec de audio en `audio_tokenizer/` |
| Libreria de inferencia | MLX-VLM >= 0.7.11 |
| Tamano de pesos | 4,33 GB (pesos) + 0,15 GB (codec de audio) = 4,5 GB de repo |
| Modalidades | Texto, audio (entrada y salida), imagen (entrada) |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su carácter multimodal any-to-any. El modelo integra procesamiento de audio (con un codec separado para la salida de voz a 24 kHz) y de imagen, junto con un núcleo de lenguaje, en un único checkpoint. La model card original (LiquidAI/LFM3-Omni-2B) es la referencia para los detalles de arquitectura, composición del dataset de entrenamiento, número de tokens vistos y si se aplicaron etapas de RLHF o DPO; esos datos no aparecen en la información proporcionada.

La innovación destacable en esta versión concreta es la conversión a MLX con pesos BF16 para Apple Silicon, que permite ejecutar un modelo omnicanal de 2B en hardware de consumo. El flujo de inferencia se gestiona con MLX-VLM, que expone tareas como ASR, TTS y VQA mediante prompts de sistema específicos y parámetros de decodificación (greedy para texto, `audio_temperature=0.4` y `audio_repetition_penalty=1.2` por defecto para audio).

## Capacidades

- Generación de texto y razonamiento general a partir de entradas de texto, audio o imagen.
- Reconocimiento automático de voz (ASR) en los idiomas soportados, mediante prompts de sistema como "Perform ASR in English".
- Síntesis de voz (TTS) con salida en WAV a 24 kHz, con control de voz e idioma mediante prompt de sistema (por ejemplo, voz femenina en inglés americano).
- Conversación de voz a voz (speech-to-speech) y flujos any-to-any.
- Respuesta a preguntas sobre imágenes (VQA) con instrucciones de grounding visual.
- Capacidades multilingües en 23 idiomas, incluyendo español, catalán no listado, árabe, chino, japonés, coreano, hindi, hebreo, tailandés, vietnamita, indonesio, turco y lenguas europeas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en local para macOS: el modelo puede gestionar ASR y TTS en un mismo checkpoint sobre Apple Silicon, lo que permite construir un asistente conversacional sin depender de la nube y con latencia controlada por el hardware local.
- Transcripción de reuniones y notas de voz: usando el prompt de ASR con `--audio speech.wav`, se obtiene texto en cualquiera de los 23 idiomas soportados, adecuado para pipelines de documentación automática.
- Lectura de documentos e imágenes: la capacidad de VQA permite extraer información de carteles, capturas o formularios mediante preguntas en lenguaje natural, útil en herramientas de accesibilidad.
- Generación de audiolibros y avisos: la salida TTS a 24 kHz con control de voz e idioma sirve para producir narraciones y mensajes pregrabados en múltiples lenguas.
- Prototipado de interfaces conversacionales multimodales: al aceptar audio e imagen como entrada y devolver texto o audio, es adecuado para demos de asistentes que responden a comandos de voz sobre imágenes.
- Investigación en modelos omnicanal pequeños: con 2,17B parámetros y pesos BF16 de 4,33 GB, sirve como banco de pruebas reproducible para estudiar el comportamiento de modelos any-to-any en hardware de consumo.
- Aplicaciones educativas de idiomas: combinando ASR y TTS se pueden construir ejercicios de pronunciación y conversación en los idiomas soportados, con evaluación local de la transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos BF16 ocupan 4,33 GB más 0,15 GB del codec de audio; en la práctica se necesita margen adicional para el contexto y activaciones, por lo que se recomienda al menos 8 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para GPU NVIDIA en este formato.
- GPU consumer: cabe en equipos Apple con 8 GB o más de memoria unificada; en GPUs NVIDIA requeriría otra conversión (no disponible en la información proporcionada).
- Opciones de despliegue: MLX-VLM >= 0.7.11 (`python -m mlx_vlm.generate`); vLLM, llama.cpp, Ollama o TGI no están indicados para esta versión MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-bf16 | ~2,17B | no disponible | Texto, audio, imagen | lfm1.0 (propietaria) | MLX BF16 (Apple Silicon) |
| LiquidAI/LFM3-Omni-2B | ~2,17B | no disponible | Texto, audio, imagen | lfm1.0 (propietaria) | safetensors (checkpoint original) |
| Alternativas omnicanal de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia lfm1.0 propietaria: es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; no es una licencia de código abierto.
- Restricción de plataforma: esta versión está empaquetada para MLX y Apple Silicon; no se ejecuta directamente en CUDA ni en CPU genérica sin conversión.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de VQA y en respuestas de audio donde el grounding visual o acústico puede ser imperfecto.
- Sesgos: no se documentan en la información disponible; deben evaluarse por idioma y dominio antes de producción.
- Cobertura idiomática desigual: aunque se listan 23 idiomas, no se especifica la calidad relativa por idioma, y el español figura en la lista sin métricas asociadas.
- Longitud de contexto no publicada: limita la planificación de cargas con documentos o conversaciones largas.
- Sin datos de benchmarks ni de tool calling/agentic: no se puede garantizar su idoneidad para pipelines de agentes o function calling sin validación propia.
- El codec de audio es un componente separado (`audio_tokenizer/`); su omisión rompe la funcionalidad TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Licencia: LICENSE (incluida en el repositorio del modelo)
