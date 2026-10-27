# LiquidAI/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es la versión cuantizada en formato GGUF de LFM3-Omni-2B, un modelo ómnimodal desarrollado por Liquid AI que comprende texto, imágenes, vídeo y audio, y responde tanto en texto como en voz sintetizada. Su orientación explícita es la inferencia en dispositivo (*on-device*), y esta variante GGUF existe para ejecutarlo localmente en CPU y GPU mediante llama.cpp, sin depender de infraestructura de servidor.

El modelo forma parte de la familia LFM3 de Liquid AI y se distribuye con licencia LFM1.0 (*other*). Aunque la nomenclatura comercial lo denomina "2B", el recuento real de parámetros en safetensors es de 1.728.801.600 (aproximadamente 1,73 mil millones), un tamaño que lo sitúa en la gama de modelos pequeños capaces de correr en hardware de consumo.

Su relevancia actual radica en la combinación de tres factores: modalidad de entrada amplia (audio, imagen y vídeo además de texto), salida de voz además de texto, y un pipeline `any-to-any` empaquetado en GGUF para llama.cpp. No obstante, el soporte en llama.cpp de LFM3-Omni depende todavía de la fusión del *pull request* ggml-org/llama.cpp#31257, por lo que a fecha de la información disponible requiere compilar desde esa rama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ómnimodal de la familia LFM3; la model card remite a la ficha del modelo base para los detalles de arquitectura) |
| Parámetros totales | 1.728.801.600 (≈1,73 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con varios niveles de cuantización; se documenta Q4_K_M para el modelo y Q8_0 para el proyector multimodal (`mmproj-LFM3-Omni-2B-Q8_0.gguf`) |
| Idiomas soportados | 23: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (este repositorio); el modelo base es LiquidAI/LFM3-Omni-2B |

Otros datos del repositorio: tamaño total de 13,4 GB (incluye varias cuantizaciones y el proyector multimodal), pipeline `any-to-any`, etiquetas `llama.cpp`, `audio`, `vision`, `omni`, y compatibilidad declarada con endpoints.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna: la model card de esta variante GGUF remite explícitamente a la ficha del modelo base (LiquidAI/LFM3-Omni-2B) para los detalles de arquitectura y uso. Lo que sí se documenta es el comportamiento funcional: se trata de un modelo ómnimodal que acepta texto, imagen, vídeo y audio como entrada, y produce texto y habla como salida, con un diseño orientado a ejecución local en dispositivo.

Tampoco se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Un dato relevante de configuración es que LFM3-Omni-2B se define como modelo *no razonador* (*non-reasoning*): en `llama-server` debe lanzarse con `--reasoning off`. En el plano técnico, el empaquetado incluye un proyector multimodal separado (vision/audio projector) que llama.cpp descarga automáticamente al usar `-hf`, y los parámetros de muestreo de audio del modelo original quedan almacenados dentro del propio GGUF.

## Capacidades

- Comprensión de texto en 23 idiomas, con generación de respuestas en texto.
- Comprensión de imágenes: descripción y análisis de fotos mediante entrada `--image`.
- Comprensión de audio: reconocimiento de voz (ASR) invocando el *system prompt* `Perform ASR in <language>.`
- Comprensión de vídeo en el modelo base; en llama.cpp el vídeo todavía no está soportado.
- Síntesis de voz (*text-to-speech*) mediante `llama-tts`, con selección de idioma (`--tts-lang`, por defecto `en`) y de voz (`--tts-voice`: `female` por defecto, o `male`).
- Salida multimodal: responde en texto y en habla.
- Ejecución local en CPU y GPU a través de llama.cpp, con cuantizaciones GGUF.
- Modelo *no razonador*: no incluye modo de razonamiento explícito (se debe desactivar con `--reasoning off` en `llama-server`).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz: usando el *system prompt* `Perform ASR in <language>.` con `llama-mtmd-cli` y `--audio`, el modelo convierte audio en texto localmente, sin enviar grabaciones a un servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistentes de voz en dispositivo: la combinación de ASR y TTS en el mismo modelo permite construir un bucle de conversación por voz (entrada de audio, respuesta hablada con `llama-tts`) en hardware de gama media, sin depender de la nube.
- Accesibilidad: lectura en voz alta de contenido y descripción de imágenes para personas con discapacidad visual, aprovechando la entrada de imagen y la salida de habla con voces `female`/`male`.
- Descripción y etiquetado de imágenes en lotes: procesar fotos con `--image` y una instrucción como "Describe this image." con `--temp 0` para generar metadatos descriptivos deterministas en catálogos o archivos fotográficos.
- Lectura de documentos escaneados y capturas: al aceptar imagen y texto, puede extraer y resumir información de capturas o fotos de documentos en cualquiera de los 23 idiomas soportados.
- Prototipado e investigación en modelos ómnimodales: al ser un GGUF de 1,73 B parámetros ejecutable en llama.cpp, sirve como banco de pruebas de bajo coste para experimentos de fusión de modalidades, evaluación de ASR/TTS o comparación de cuantizaciones.
- Aplicaciones offline en el borde: despliegue en equipos sin conectividad (kioscos, dispositivos de campo, portátiles) donde se requiere comprensión de imagen y audio sin conexión.
- Traducción con entrada multimodal: transcripción de audio en un idioma y generación de la respuesta en otro, dentro del conjunto de 23 idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta variante GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de ASR/TTS, y remite a la ficha del modelo base para cualquier dato adicional. Tampoco se proporcionan cifras de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado a partir de los 1,73 B parámetros, no son cifras publicadas por el autor): en torno a 1,0–1,2 GB para los pesos en Q4_K_M, unos 1,9 GB en Q8_0 y unos 3,5 GB en FP16, a los que hay que sumar el proyector multimodal (`mmproj` en Q8_0) y la caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo entra holgadamente en GPUs de consumo con 8 GB o más de VRAM; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más de VRAM en cuantizaciones Q4_K_M o Q8_0, y también en CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` para audio e imagen, `llama-server` para servidor, `llama-tts` para síntesis de voz). La API `/v1/realtime` (conversación de voz en tiempo real por WebSocket) en `llama-server` está anunciada como "coming soon". No se documentan vLLM, TGI ni Ollama en la información disponible.
- Requisito crítico: el soporte de LFM3-Audio y LFM3-Omni en llama.cpp está pendiente de la fusión de ggml-org/llama.cpp#31257; hasta entonces hay que compilar llama.cpp desde esa rama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. La única referencia documentada es el modelo base del que deriva esta variante:

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-Omni-2B-GGUF (este) | 1,73 B | No disponible | Texto, imagen, vídeo (no en llama.cpp), audio; salida texto y voz | LFM1.0 | GGUF | HuggingFace, requiere llama.cpp con PR #31257 |
| LFM3-Omni-2B (base) | 1,73 B | No disponible | Texto, imagen, vídeo, audio; salida texto y voz | LFM1.0 | No disponible | HuggingFace |
| Otras alternativas ómnimodales | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado de soporte en llama.cpp: el modelo no funciona con versiones estables de llama.cpp hasta que se fusione el PR ggml-org/llama.cpp#31257; es necesario compilar desde esa rama, lo que complica el despliegue en producción.
- El vídeo no está soportado en llama.cpp, pese a que el modelo base lo acepta como entrada.
- La API `/v1/realtime` para voz en tiempo real sobre WebSocket en `llama-server` aún no está disponible.
- Es un modelo *no razonador*: no debe esperarse razonamiento multi-paso explícito; en `llama-server` hay que usar `--reasoning off`.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de 1,73 B parámetros, es esperable una fiabilidad limitada en tareas de conocimiento factual, pero no se aportan evaluaciones al respecto.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: se declaran 23, pero no se especifica la calidad relativa por idioma ni si el castellano está a la par del inglés en ASR y TTS; el idioma por defecto de síntesis es `en`.
- Licencia LFM1.0 (`license: other`): no se detallan en la información disponible las condiciones concretas de uso comercial; es imprescindible revisar el archivo LICENSE del repositorio antes de un despliegue comercial.
- Longitud de contexto no publicada: no es posible planificar casos de uso con documentos largos o conversaciones multi-turno extensas sin verificarlo en la ficha del modelo base.
- Para ASR es necesario usar exactamente el *system prompt* documentado (`Perform ASR in <language>.`); no se documentan otras fórmulas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en llama.cpp: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
