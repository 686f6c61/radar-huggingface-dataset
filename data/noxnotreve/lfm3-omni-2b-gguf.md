# NoxNotreve/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es el primer modelo omni de Liquid AI: un único modelo end-to-end capaz de entender texto, imágenes, vídeo y audio, y de responder en texto, voz o una mezcla intercalada de ambos. Está pensado para ejecutarse en dispositivo (on-device), sustituyendo en una sola pieza a un ASR, un modelo visión-lenguaje, un LLM y un sistema TTS. Esta ficha cubre la versión GGUF publicada por el usuario NoxNotreve, cuantizada a partir del modelo original LiquidAI/LFM3-Omni-2B para inferencia local en CPU y GPU mediante llama.cpp.

El modelo cuenta con aproximadamente 1,73 mil millones de parámetros y una arquitectura basada en Transformers, según la documentación oficial. Es un modelo explícitamente no razonador (non-reasoning), por lo que no incluye modo de pensamiento extendido ni cadenas de razonamiento internas. Su pipeline es any-to-any y soporta 23 idiomas, incluido el castellano.

La relevancia de esta publicación radica en que empaqueta un modelo omni multimodal en formato GGUF, lo que permite desplegarlo en hardware de consumo con llama.cpp, LM Studio, Ollama o Llama.app, incluyendo conversaciones de voz en tiempo real con soporte de tool calls a través de la API WebSocket `/v1/realtime` de `llama serve`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo omni multimodal; detalles completos en la model card original) |
| Parametros totales | 1.728.801.600 (aproximadamente 1,73 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con multiples niveles de cuantizacion (se referencia Q4_K_M en los ejemplos; no se enumeran todos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | GGUF (incluye proyectores de visión y audio descargables con `-hf`) |

## Arquitectura y entrenamiento

LFM3-Omni-2B es un modelo omni multimodal construido sobre Transformers, según la documentación de Liquid AI. Integra en un único modelo end-to-end la comprensión de texto, imágenes, vídeo y audio, y la generación de texto y habla, incluyendo salidas intercaladas de texto y voz. El objetivo de diseño es sustituir la combinación de varios modelos especializados (ASR, VLM, LLM y TTS) por una sola red para uso en dispositivo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. Tampoco se detallan innovaciones de atención o decodificación más allá de su naturaleza omni y su carácter no razonador. La versión aquí descrita es una cuantización GGUF del modelo original, orientada a inferencia local con llama.cpp.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio en un único modelo (any-to-any).
- Generación de respuestas en texto, en voz, o intercalando texto y voz.
- Reconocimiento automático de habla (ASR) mediante el prompt de sistema `Perform ASR in <language>.`
- Comprensión de imágenes y vídeo como entrada.
- Conversaciones de voz en tiempo real con soporte de tool calls a través de la API WebSocket `/v1/realtime` de `llama serve`.
- Multilingüe: 23 idiomas, incluidos inglés, castellano, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Modelo no razonador: no dispone de modo de pensamiento extendido.
- Muestreo recomendado: decodificación greedy (temperatura 0) para texto; para salida de voz, temperatura de audio 0,4 y penalización de repetición de audio 1,2.

## Casos de uso

- Asistencia por voz en dispositivo: el modelo puede recibir audio y responder con voz en la misma sesión, lo que permite construir asistentes conversacionales locales sin depender de servicios en la nube, usando la API `/v1/realtime` de `llama serve`.
- Transcripción de audio (ASR): con el prompt de sistema `Perform ASR in <language>.` y una entrada de audio, el modelo transcribe habla en cualquiera de los idiomas soportados, sustituyendo a un modelo ASR dedicado.
- Descripción y análisis de imágenes: al aceptar imágenes como entrada, puede emplearse para etiquetado, descripción o respuesta a preguntas sobre imágenes en aplicaciones locales (soportado en LM Studio y Llama.app).
- Análisis de vídeo: la entrada de vídeo permite resumir o responder preguntas sobre clips en herramientas como Llama.app, útil para indexación o revisión de contenido audiovisual.
- Interfaces conversacionales multimodales: combinando entrada de texto, imagen y audio con salida de voz, sirve para prototipos de interfaces de accesibilidad o quioscos interactivos que funcionen sin conexión.
- Sustitución unificada de pipeline multimodal: en lugar de encadenar ASR, VLM, LLM y TTS, un solo modelo de 1,73 mil millones de parámetros cubre el flujo completo, lo que simplifica el despliegue en hardware modesto.
- Procesamiento multilingüe local: al soportar 23 idiomas, puede emplearse para tareas de traducción o atención al cliente en varios idiomas en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con aproximadamente 1,73 mil millones de parámetros, el peso en cuantización Q4_K_M ronda los 1-1,5 GB, aunque el repositorio completo ocupa 13,9 GB por incluir múltiples cuantizaciones y proyectores.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (aproximadamente 2B) y el uso de GGUF, aunque no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (versión b11960 / v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior, en macOS con entrada de imagen y audio) y Llama.app (macOS y Windows, con entrada de imagen, audio y vídeo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo no razonador: no incluye modo de pensamiento ni cadenas de razonamiento, lo que limita tareas que requieran razonamiento multi-paso complejo.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos generativos de este tamaño.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones de contexto largo.
- Licencia lfm1.0 ("other"): es necesario revisar los términos de la licencia antes de un uso comercial, ya que no es una licencia de código abierto estándar.
- Soporte de herramientas dependiente de versión: requiere versiones mínimas concretas de llama.cpp, LM Studio u Ollama; versiones anteriores pueden no funcionar.
- La cuantización GGUF puede degradar ligeramente la calidad respecto al modelo original en precisión completa.
- El repositorio es una publicación de terceros (NoxNotreve), no oficial de Liquid AI, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NoxNotreve/LFM3-Omni-2B-GGUF
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación del modelo: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Documentación general de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Panel de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Llama.app: https://llama.app
