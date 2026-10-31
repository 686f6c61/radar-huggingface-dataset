# erenyeager-1/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es la cuantización en formato GGUF del modelo LFM3-Omni-2B de Liquid AI, un modelo omni-modal de aproximadamente 1,73 mil millones de parámetros capaz de comprender texto, imágenes, vídeo y audio, y de responder tanto en texto como en voz. La versión GGUF permite ejecutar el modelo localmente en CPU y GPU mediante llama.cpp, lo que lo hace especialmente atractivo para despliegues en dispositivo (on-device).

El modelo original, desarrollado por Liquid AI como parte de su familia LFM3, resuelve el problema de llevar capacidades omni-modales (reconocimiento de voz, comprensión visual, síntesis de voz) a hardware modesto, algo que normalmente requiere modelos mucho más grandes. Con soporte para 22 idiomas, incluido el castellano, y una licencia propia (LFM 1.0), se posiciona como una opción ligera para asistentes de voz, transcripción y análisis multimodal en local.

Es relevante ahora porque la tendencia del sector apunta hacia asistentes de voz en tiempo real ejecutándose en dispositivos de borde, y este modelo ofrece esa funcionalidad completa (entrada any-to-any con salida de texto y voz) en un tamaño que cabe en hardware de consumo. Cabe señalar que el soporte en llama.cpp depende de la fusión del pull request ggml-org/llama.cpp#31257 y que la entrada de vídeo aún no está soportada en llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI, omni-modal any-to-any) |
| Parámetros totales | 1.728.801.600 (aprox. 1,73 B, dato de safetensors) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiquetas de cuantización como Q4_K_M y Q8_0 mencionadas en los ejemplos; lista completa de cuantizaciones no disponible) |
| Idiomas soportados | 22: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | LFM 1.0 (licencia propia de Liquid AI, tipo "other") |
| Formato de pesos | GGUF (versión cuantizada); el modelo base está en safetensors |

## Arquitectura y entrenamiento

LFM3-Omni-2B pertenece a la familia LFM3 de Liquid AI, cuyos modelos se basan en arquitecturas diseñadas para inferencia eficiente en dispositivo. Es un modelo omni-modal any-to-any: acepta texto, imágenes, vídeo y audio como entrada, y genera texto y voz como salida. Incluye proyectores de visión y audio separados (los archivos mmproj en GGUF) que conectan los codificadores modales con el modelo de lenguaje principal. Los detalles concretos de la arquitectura interna (tipo de capa de atención, tokenizadores modales, etc.) no están disponibles en la información proporcionada y deben consultarse en la model card original.

No se dispone de datos sobre el proceso de entrenamiento: número de tokens, composición del dataset ni uso de técnicas de alineación como RLHF o DPO. Sí consta que se trata de un modelo no reasoning (no razonador), por lo que en llama-server debe desactivarse el modo de razonamiento con `--reasoning off`. Los parámetros de muestreo de audio del modelo original están embebidos en los archivos GGUF, lo que simplifica la síntesis de voz con llama-tts.

## Capacidades

- Comprensión de texto, imágenes, vídeo y audio (entrada any-to-any), aunque la entrada de vídeo no está soportada todavía en llama.cpp.
- Generación de texto conversacional y respuestas en lenguaje natural.
- Reconocimiento automático de voz (ASR) en múltiples idiomas mediante el system prompt `Perform ASR in <language>.`
- Síntesis de voz (TTS) con selección de idioma (`--tts-lang`) y voz masculina o femenina (`--tts-voice`).
- Comprensión de imágenes mediante descripción y análisis visual (demostrado con llama-mtmd-cli).
- Soporte multilingüe en 22 idiomas, incluido el castellano.
- Conversaciones multi-turno (etiqueta conversational en HuggingFace).
- No es un modelo de razonamiento: no genera cadenas de pensamiento explícitas.

No hay información sobre soporte de tool calling, function calling ni capacidades de agentes en la documentación disponible.

## Casos de uso

- Transcripción de audio en local: con el system prompt de ASR, el modelo puede transcribir ficheros de voz (por ejemplo, `speech.wav`) en 22 idiomas sin enviar datos a la nube, ideal para privacidad y cumplimiento normativo.
- Asistentes de voz en dispositivo: combina reconocimiento de voz, comprensión y síntesis de voz en un único modelo de 1,73 B, adecuado para integraciones en apps móviles, quioscos o dispositivos embebidos.
- Descripción automática de imágenes: mediante llama-mtmd-cli se puede generar descripciones de fotografías, útil para accesibilidad, catalogación de activos digitales o moderación preliminar de contenido.
- Conversación por voz en tiempo real: la futura API `/v1/realtime` de llama-server (sobre WebSocket) permitirá conversaciones de voz fluidas, apropiada para agentes telefónicos o interacción manos libres.
- Generación de locuciones y narración: con llama-tts se puede convertir texto en audio con voz masculina o femenina en varios idiomas, útil para producción de voz en off, avisos automatizados o prototipado de interfaces habladas.
- Procesamiento multimodal offline: análisis combinado de texto e imágenes en entornos sin conectividad (industria, defensa, sanidad local), aprovechando la inferencia en CPU o GPU modesta.
- Prototipado rápido de aplicaciones multimodales: el formato GGUF y la integración con llama.cpp permiten probar el modelo en portátiles y estaciones de trabajo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Deben consultarse la model card original y el blog de Liquid AI para posibles evaluaciones (enlaces en la sección correspondiente).

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; el repositorio completo pesa 13,4 GB. Con una cuantización Q4_K_M de un modelo de 1,73 B de parámetros, el peso cuantizado ronda aproximadamente 1-1,2 GB, más los proyectores de visión y audio (el mmproj de ejemplo se distribuye en Q8_0), por lo que debería ejecutarse en equipos con 8 GB de RAM sin dificultades.
- GPU recomendadas: no disponible; al ser GGUF, puede ejecutarse en CPU, y en GPU de consumo (por ejemplo, RTX 3060 o superiores) la inferencia sería acelerada por la pequeña huella de memoria.
- Consumer GPU: sí, cabe con holgura en prácticamente cualquier GPU moderna de consumo dado el tamaño del modelo; también es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-mtmd-cli, llama-server, llama-tts) es la vía documentada. Importante: hasta que se fusione y publique el pull request ggml-org/llama.cpp#31257, hay que compilar llama.cpp desde esa rama. No hay mención de vLLM, TGI ni Ollama en la documentación disponible.
- Latencia y throughput: no disponible.
- Video: no soportado en llama.cpp todavía.

## Comparativa con modelos similares

| Característica | LFM3-Omni-2B (GGUF) | Qwen2.5-Omni-7B | Gemma 3n |
|---|---|---|---|
| Parámetros | ~1,73 B | ~7 B | no disponible |
| Modalidades | texto, imagen, vídeo, audio → texto y voz | texto, imagen, audio, vídeo → texto y voz | texto, imagen, audio → texto |
| Formato GGUF | sí (esta ficha) | sí (cuantizaciones de la comunidad) | sí |
| Contexto | no disponible | no disponible | no disponible |
| Licencia | LFM 1.0 (propia) | Apache 2.0 | Gemma license |
| Idiomas | 22 | multilingüe | multilingüe |

LFM3-Omni-2B destaca por su tamaño muy reducido frente a alternativas omni-modales como Qwen2.5-Omni-7B, lo que lo hace más adecuado para on-device, a costa presumiblemente de menor capacidad en tareas complejas. Los datos concretos de contexto y rendimiento de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de razonamiento: en llama-server debe usarse `--reasoning off`; no espere cadenas de pensamiento ni razonamiento multi-paso profundo.
- La entrada de vídeo no está soportada en llama.cpp todavía, pese a que el modelo base la admite.
- El soporte en llama.cpp requiere compilar desde el pull request ggml-org/llama.cpp#31257 hasta su fusión y publicación, lo que añade fricción para entornos de producción.
- La API `/v1/realtime` para conversaciones de voz en tiempo real aún no está disponible en llama-server.
- La licencia LFM 1.0 es una licencia propia ("other" en HuggingFace); debe revisarse su texto antes de cualquier uso comercial, ya que puede incluir restricciones.
- Sesgos conocidos, riesgo de alucinación y limitaciones de contexto: no disponible en la información proporcionada; consúltense la model card original y el blog de Liquid AI.
- Los parámetros de muestreo de audio vienen embebidos en el GGUF, pero para tareas de ASR se recomienda usar temperatura 0 para máxima fidelidad.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/erenyeager-1/LFM3-Omni-2B-GGUF
- Modelo base (LiquidAI): https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Guía de despliegue con llama.cpp de Liquid AI: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Documentación general de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
