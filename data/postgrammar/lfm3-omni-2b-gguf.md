# postgrammar/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es un modelo omnicanal (any-to-any) desarrollado por Liquid AI que procesa texto, imagen, vídeo y audio como entrada, y produce texto y voz sintetizada como salida. Esta ficha describe la versión cuantizada en GGUF publicada por el usuario `postgrammar`, pensada para inferencia local en CPU y GPU mediante llama.cpp, LM Studio, Ollama y Llama.app. El modelo base es `LiquidAI/LFM3-Omni-2B`, con 1.728.801.600 parámetros totales según los safetensors del repositorio original.

La relevancia de esta publicación radica en que traslada un modelo omnicanal (visión, audio y vídeo) al ecosistema GGUF, lo que permite ejecutarlo en hardware de consumo sin GPU dedicada de gama alta. La model card documenta soporte para conversaciones de voz en tiempo real con tool calling a través de la API WebSocket `/v1/realtime` de `llama serve`, así como reconocimiento de voz (ASR), comprensión de imagen y vídeo, y síntesis de voz (TTS) con selección de voz femenina o masculina.

El modelo se distribuye bajo licencia `lfm1.0` (etiquetada como `other` en HuggingFace) y cubre 23 idiomas, entre ellos el español. Es un modelo de tipo "non-reasoning", es decir, sin modo de razonamiento extendido, y la model card recomienda decodificación greedy (temperatura 0) para salida de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omnicanal de Liquid AI; detalles en la model card original) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M en los ejemplos; el repo incluye proyector multimodal `mmproj-...-Q8_0`) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se han publicado en la información disponible los detalles de arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens, ni si se aplicaron fases de RLHF o DPO). La model card de esta versión GGUF remite explícitamente a la model card original de `LiquidAI/LFM3-Omni-2B` para los detalles de arquitectura y uso.

Lo que sí se documenta es la estructura multimodal del modelo: integra codificadores para imagen, vídeo y audio, y decodificadores para texto y voz. El repositorio GGUF incluye un proyector multimodal separado (`mmproj-LFM3-Omni-2B-Q8_0.gguf`) que llama.cpp descarga automáticamente al usar `-hf`. El modelo se describe como "non-reasoning", sin modo de pensamiento extendido, y la model card recomienda greedy decoding para texto (temperatura 0) y, para audio, temperatura 0,4 con penalización de repetición de 1,2.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imagen (descripción, respuesta a preguntas sobre la imagen).
- Comprensión de vídeo: el modelo procesa fotogramas y la pista de audio del vídeo simultáneamente (requiere `ffmpeg` en `PATH`).
- Reconocimiento automático de voz (ASR) con prompt de sistema `Perform ASR in <language>.`
- Síntesis de voz (TTS) con selección de idioma (`--tts-lang`) y voz (`female` por defecto, `male`).
- Conversaciones de voz en tiempo real con tool calling a través de la API WebSocket `/v1/realtime` de `llama serve`.
- Soporte de tool calling / function calling (mencionado explícitamente en el contexto de voz en tiempo real).
- Capacidades multilingües en 23 idiomas, incluido el español.
- Entrada any-to-any: texto, imagen, vídeo y audio como entrada; texto y voz como salida.

## Casos de uso

- Asistente de voz en local: desplegado con `llama serve` y la API `/v1/realtime`, el modelo mantiene conversaciones habladas en tiempo real con tool calling, adecuado para asistentes de escritorio o domésticos sin dependencia de la nube.
- Transcripción de audio (ASR): con el prompt de sistema `Perform ASR in <language>.` y una entrada WAV, el modelo transcribe voz en cualquiera de los 23 idiomas soportados; útil para subtitulado o actas de reuniones en local.
- Descripción y accesibilidad de imágenes: dado un PNG o JPG, el modelo genera descripciones en texto que pueden alimentar lectores de pantalla o pipelines de etiquetado automático.
- Análisis de vídeo con audio: el modelo responde preguntas sobre lo que se ve y se oye en un vídeo (por ejemplo, "¿qué ocurre aquí y qué se oye?"), lo que sirve para indexación de contenido audiovisual o moderación.
- Síntesis de voz para interfaces: mediante `llama-tts` con voz femenina o masculina y código de idioma, se pueden generar locuciones para aplicaciones de accesibilidad, IVR o contenido educativo sin servicios externos.
- Prototipado en hardware de consumo: al estar en GGUF y pesar ~13,9 GB el repo completo (con múltiples cuantizaciones), permite probar un modelo omnicanal en portátiles con LM Studio, Ollama o Llama.app antes de invertir en infraestructura.
- Procesamiento de documentos con imagen y texto: combinando entrada de imagen y texto, el modelo puede responder preguntas sobre capturas, diagramas o fotos en flujos de atención al cliente o soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (1,73 B parámetros), una cuantización Q4_K_M ocuparía del orden de 1-1,5 GB para los pesos del modelo, más el proyector multimodal Q8_0 y el estado de contexto; el repo completo ocupa 13,9 GB por incluir varias cuantizaciones.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo; la model card menciona ejecución en CPU y GPU mediante llama.cpp.
- ¿Cabe en GPU de consumo? Sí, por el tamaño de parámetros; no se detallan modelos concretos de GPU en la información proporcionada.
- Opciones de despliegue: llama.cpp (versión b11960 / v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior, en macOS), Llama.app (macOS y Windows), y `llama serve` con API compatible con OpenAI y WebSocket `/v1/realtime`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (omnicanal any-to-any de ~2 B). No se ofrece comparativa para no inventar cifras.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B (esta ficha, GGUF) | ~1,73 B | no disponible | texto, imagen, vídeo, audio → texto y voz | lfm1.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo "non-reasoning": no dispone de modo de razonamiento extendido; para tareas que requieran cadenas de pensamiento largas puede rendir por debajo de modelos con thinking mode.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de robustez; deben asumirse los riesgos habituales de los modelos generativos.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos muy largos.
- Calidad multilingüe no verificada por benchmarks publicados; el español figura entre los 23 idiomas, pero no hay métricas por idioma.
- Licencia `lfm1.0` (etiquetada como `other`): es necesario revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial; no se detallan en la información disponible las restricciones concretas.
- Esta publicación GGUF es de un tercero (`postgrammar`), no de Liquid AI; la calidad de la cuantización y su mantenimiento no están garantizados por el desarrollador original.
- Requiere versiones recientes de las herramientas (llama.cpp v0.8.0+, LM Studio con motor 2.65.1+, Ollama v0.40.12+); versiones anteriores pueden no cargar el modelo o el proyector multimodal.
- La comprensión de vídeo requiere `ffmpeg` instalado y accesible en `PATH`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/postgrammar/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Guía de despliegue en llama.cpp: https://docs.liquid.ai/deployment/on-device/llama-cpp
- llama.cpp (release v0.8.0): https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- llama.cpp (build b11960): https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Llama.app: https://llama.app
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
