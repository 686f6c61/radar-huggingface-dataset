# Emerald7664/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es la versión cuantizada en formato GGUF del modelo LFM3-Omni-2B desarrollado por Liquid AI. Se trata de un modelo ómnimodal de tipo any-to-any que comprende texto, imágenes, vídeo y audio, y es capaz de responder tanto en texto como en voz sintetizada. Esta versión GGUF, publicada por el usuario Emerald7664, está pensada para inferencia local en CPU y GPU mediante llama.cpp y sus derivados (LM Studio, Ollama, Llama.app).

El modelo base cuenta con 1.728.801.600 parámetros (aproximadamente 1,7 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para ejecución en dispositivo (on-device). Su pipeline es any-to-any y soporta 25 idiomas, entre ellos el español. La relevancia actual reside en la combinación de multimodalidad completa (visión, audio y vídeo de entrada; texto y voz de salida) en un tamaño reducido que cabe en hardware de consumo.

La versión GGUF facilita el despliegue sin necesidad de GPUs de datacenter, con soporte para conversaciones de voz en tiempo real a través de la API WebSocket `/v1/realtime` de `llama serve`. La licencia es LFM1.0 (lfm1.0), una licencia propia de Liquid AI que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ómnimodal de Liquid AI; detalles en la model card original) |
| Parámetros totales | 1.728.801.600 (~1,7 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con múltiples tags de cuantización (p. ej. Q4_K_M citado en la model card); resto no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (25 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada; la model card remite a la model card original de LiquidAI/LFM3-Omni-2B para los detalles de arquitectura y uso. Se sabe que es un modelo ómnimodal con pipeline any-to-any: acepta texto, imágenes, vídeo y audio como entrada, y produce texto y voz como salida. El recuento real de parámetros en safetensors es de 1.728.801.600.

El modelo se describe explícitamente como «non-reasoning», es decir, no incorpora un modo de razonamiento extendido; en llama.cpp debe lanzarse con `--reasoning off`. No se han proporcionado datos sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card recomienda decodificación greedy (temperatura 0) para salida de texto y, para salida de voz, temperatura de audio 0,4 con penalización de repetición de audio 1,2.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio como entrada (multimodal completo).
- Generación de salida en texto y en voz sintetizada (text-to-speech integrado).
- Reconocimiento automático del habla (ASR) mediante el prompt de sistema `Perform ASR in <language>.`
- Conversaciones de voz en tiempo real, incluyendo llamadas a herramientas, a través de la API WebSocket `/v1/realtime` de `llama serve`.
- Soporte multilingüe en 25 idiomas, incluido el español.
- Capacidad de tool calling / function calling (mencionada en el contexto de conversaciones de voz en tiempo real).
- Modelo no-reasoning: no dispone de modo de pensamiento extendido.

## Casos de uso

- Asistencia por voz en local: el modelo puede mantener conversaciones habladas en tiempo real mediante `/v1/realtime`, con entrada de audio y salida de voz, adecuado para asistentes de escritorio o dispositivos sin conexión a la nube.
- Transcripción de audio (ASR): usando el prompt de sistema `Perform ASR in <language>.` se puede transcribir voz a texto en cualquiera de los 25 idiomas soportados, útil para subtitulado o actas de reuniones.
- Descripción de imágenes y vídeo: al aceptar vídeo e imagen como entrada, sirve para generar descripciones accesibles, etiquetado automático o análisis de contenido visual en local.
- Atención al cliente multimodal: puede gestionar conversaciones que combinen texto, capturas de pantalla o mensajes de voz, con respuestas habladas si se integra con la API de tiempo real.
- Prototipado de agentes con tool calling: al soportar llamadas a herramientas en el flujo de voz, permite construir agentes conversacionales que consulten APIs o ejecuten acciones durante la conversación.
- Despliegue en hardware de consumo: gracias a sus ~1,7 B de parámetros y formato GGUF, puede ejecutarse en portátiles y equipos de sobremesa mediante LM Studio, Ollama o Llama.app para tareas de inferencia multimodal sin GPU dedicada.
- Aplicaciones educativas o de accesibilidad: lectura de documentos con imágenes y audio, o interfaces conversacionales por voz para usuarios con dificultades visuales o motoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ~1,7 B de parámetros, las cuantizaciones GGUF de 4 bits deberían ocupar del orden de 1-2 GB de pesos, aunque el repo completo ocupa 13,9 GB por incluir múltiples cuantizaciones y proyectores de visión y audio.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y GPU de consumo.
- Cabe en GPU de consumo: sí, es uno de los objetivos del formato GGUF; se ejecuta también en CPU.
- Opciones de despliegue: llama.cpp (versión b11960 / v0.8.0 o superior), `llama serve`, `llama cli`, LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior), Llama.app (llama.cpp v0.8.0 o superior).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. Como referencia de categoría, el modelo base es LiquidAI/LFM3-Omni-2B, del que esta versión es una cuantización GGUF. No se puede establecer una comparativa cuantitativa con alternativas sin datos de benchmarks publicados.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-GGUF | ~1,7 B | no disponible | any-to-any (texto, imagen, vídeo, audio) | lfm1.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo no-reasoning: no dispone de modo de razonamiento extendido; en llama.cpp debe usarse `--reasoning off`.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto no especificada; conviene verificar en la model card original antes de usarlo con entradas largas.
- Licencia lfm1.0: es una licencia propia con condiciones específicas; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Esta versión GGUF es una cuantización de terceros (Emerald7664), no publicada por Liquid AI; puede haber diferencias de calidad respecto al modelo base en safetensors.
- El soporte de vídeo y audio depende de la versión del runtime (llama.cpp v0.8.0+, LM Studio 2.65.1+, Ollama v0.40.12+); versiones anteriores pueden no cargar los proyectores correspondientes.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria de esta cuantización concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Emerald7664/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- llama.cpp (release v0.8.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- llama.cpp (build b11960): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Ollama (release v0.40.12): https://github.com/ollama/ollama/releases/tag/v0.40.12
