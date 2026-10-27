# LiquidAI/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es el primer modelo ómnimodal de la familia LFM3 de Liquid AI: un único modelo extremo a extremo que acepta texto, imágenes, vídeo (con o sin pista de audio) y audio a 16 kHz, y responde en texto, en voz a 24 kHz o en texto y voz intercalados. Sustituye en un solo artefacto la combinación habitual de un modelo ASR, un modelo visión-lenguaje, un LLM y un modelo TTS, lo que simplifica despliegues en dispositivos con recursos limitados. Cuenta con 2.166.928.384 parámetros totales (2,17B) según los pesos en safetensors y una ventana de contexto de 32K tokens (entrada más salida).

La arquitectura combina el backbone de lenguaje LFM3-1.7B con un codificador de visión LFM3, un codificador de audio causal LFM3 y el tokenizador de audio LiquidCodec; la generación de voz se resuelve con un depthformer y el decodificador de audio del códec. Está pensado explícitamente para uso *on-device* (teléfonos, portátiles y hardware *edge*), no para servir en centros de datos a gran escala.

Es relevante porque comprime cuatro capacidades (visión, audio, lenguaje y síntesis de voz) en 2,17B de parámetros con licencia LFM Open License v1.0, un tamaño que cabe en GPU de consumo. La model card no publica resultados de benchmarks ni detalles del corpus de entrenamiento, por lo que la evaluación práctica debe hacerse *ad hoc*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LFM3 (LFM3-1.7B) + codificador de vision LFM3 + codificador de audio causal LFM3 + tokenizador de audio LiquidCodec + depthformer para tokens de audio |
| Parametros totales | 2.166.928.384 (2,17B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | 23 idiomas: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiqueta `license: other`); terminos en el archivo LICENSE del repositorio |
| Formato de pesos | safetensors (repo de 4,5 GB), con codigo personalizado (`custom_code`, requiere `trust_remote_code`) |
| Entradas | Texto, imagenes, video con o sin banda sonora, audio a 16 kHz |
| Salidas | Texto, voz a 24 kHz, o texto y voz intercalados |
| Vocabulario | 128.000 tokens de texto |
| Procesamiento visual | Imagenes y video a resolucion nativa; cada bloque 2x2 de parches se convierte en un token de lenguaje; video muestreado a 2 fps |
| Tipo de checkpoint | Modelo omnimodal post-entrenado |
| Pipeline (HuggingFace) | `any-to-any` |
| Descargas / likes | 83 descargas, 45 likes (a fecha de actualizacion de la ficha) |
| Fechas | Creado el 2026-10-21, actualizado el 2026-10-27 |

## Arquitectura y entrenamiento

LFM3-Omni-2B es un modelo ómnimodal denso construido sobre el backbone de lenguaje LFM3-1.7B. Cada modalidad tiene su propia ruta de codificación: un codificador de visión LFM3 y un codificador de audio causal LFM3, cada uno con su correspondiente conector que proyecta las representaciones al espacio de tokens del modelo de lenguaje. La imagen se procesa a resolución nativa agrupando cada bloque 2x2 de parches en un único token de lenguaje, y el vídeo se muestrea a 2 fps; esto mantiene baja la cuenta de tokens visuales sin renunciar al detalle espacial. En el lado de salida, la cabeza LM genera texto y un depthformer más el códec LiquidCodec producen voz a 24 kHz, lo que permite respuestas habladas o secuencias intercaladas de texto y audio.

El punto técnico diferencial es la unificación de audio de entrada y de salida en un mismo flujo autorregresivo: el modelo "oye" y "habla" con el mismo mecanismo que razona sobre texto, de modo que puede responder por voz a una pregunta formulada por voz sobre una imagen, o comentar conjuntamente la imagen y la banda sonora de un vídeo. El checkpoint publicado es un modelo post-entrenado; la model card no especifica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal en esta ficha.

## Capacidades

- Comprensión conjunta de texto, imagen, vídeo y audio en un solo modelo (entrada `any-to-any`).
- Respuesta en voz a 24 kHz, además de texto, con posibilidad de intercalar ambos en una misma generación.
- Preguntas sobre imágenes formuladas por voz: cadena voz → visión → respuesta hablada sin modelos intermedios.
- Comprensión de vídeo con sonido: el modelo ve y escucha simultáneamente, lo que permite preguntas que requieren cruzar ambas señales.
- Transcripción de voz (ASR) y traducción de voz, según se describe en la model card.
- Conversación hablada multi-turno con contexto de 32K tokens.
- Capacidades de texto heredadas del backbone LFM3-1.7B (generación, razonamiento y código en la medida en que las soporte el modelo base; no detalladas en la información disponible).
- Cobertura multilingüe de texto en 23 idiomas, incluido el español.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo recibe audio a 16 kHz y devuelve voz a 24 kHz con 2,17B de parámetros, por lo que puede ejecutarse en el propio teléfono sin enviar el audio a la nube, lo que reduce latencia y exposición de datos personales.
- Accesibilidad para personas con discapacidad visual: el usuario fotografía o graba un vídeo de su entorno y pregunta en voz alta; el modelo responde hablando, combinando percepción visual a resolución nativa y síntesis de voz en un único paso.
- Subtitulado, transcripción y traducción de reuniones: la entrada de audio de 16 kHz y el contexto de 32K tokens permiten procesar fragmentos largos de habla y emitir texto traducido a cualquiera de los 23 idiomas declarados.
- Análisis de vídeo con banda sonora en moderation de contenido: muestreo a 2 fps más codificación de audio permite revisar clips cortos detectando coincidencias entre lo que se ve y lo que se dice o suena.
- Soporte técnico de primer nivel por voz: conversaciones multi-turno donde el cliente puede dictar el problema, adjuntar una captura del error y recibir una explicación hablada, todo con un solo modelo desplegado en el *edge*.
- Descripción de imágenes y documentos escaneados en campo: técnicos que trabajan con las manos ocupadas dictan una pregunta sobre una foto de una etiqueta, un cuadro eléctrico o un manual y reciben la respuesta en audio.
- Prototipado rápido en investigación: sustituir una cadena ASR + VLM + LLM + TTS por un único checkpoint de 4,5 GB simplifica la experimentación en entornos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en safetensors: 4,5 GB de repositorio, coherente con 2,17B de parámetros en precisión de 16 bits (aproximadamente 4,3 GB solo de pesos).
- VRAM estimada para inferencia en bf16/fp16: en torno a 5-6 GB incluyendo caché KV para contextos moderados y los módulos de audio; con contexto cercano a 32K tokens y entradas de vídeo, la caché y los tokens visuales elevan el consumo y conviene reservar 8-12 GB.
- VRAM estimada en fp32: en torno a 9-10 GB solo para pesos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Apple Silicon con memoria unificada de 16 GB o más.
- GPU de centro de datos (A100, H100): sobredimensionadas para este tamaño; útiles solo para servir muchas réplicas concurrentes o fine-tuning.
- Opciones de despliegue: la model card documenta el uso con `transformers` y código personalizado (`trust_remote_code=True`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,17B | 32K | Texto, imagen, video, audio de entrada; texto y voz de salida | LFM Open License v1.0 | Pesos en HF (safetensors), orientado a edge |
| LFM3-1.7B (mismo autor, familia LFM3) | ~1,7B | No disponible en esta ficha | Solo texto | LFM Open License v1.0 | Pesos en HF |
| Qwen2.5-Omni-3B | ~3B | No disponible en esta ficha | Texto, imagen, audio, video; salida de texto y voz | Apache 2.0 | Pesos en HF |
| Gemma 3n (variantes E2B/E4B) | No disponible en esta ficha | No disponible en esta ficha | Texto, imagen, audio | Gemma Terms of Use | Pesos en HF |

Los datos de los modelos comparables no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards antes de tomar una decisión. La ventaja diferencial de LFM3-Omni-2B frente a esas alternativas es el tamaño (2,17B con salida de voz a 24 kHz) y la licencia LFM, más permisiva en algunos puntos que las licencias de uso comunitario condicionado; su desventaja es la ausencia de benchmarks publicados y de ecosistema de cuantizaciones.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible comparar su calidad de forma objetiva con alternativas sin evaluarlo en el caso de uso concreto.
- Riesgo de alucinación: como cualquier LLM post-entrenado, puede generar afirmaciones incorrectas sobre imágenes, audio o vídeo, especialmente con audio ruidoso o vídeo de baja calidad.
- Procesamiento de vídeo limitado: el muestreo a 2 fps y el presupuesto de 32K tokens acotan la duración y el detalle de los clips analizables; contenido rápido o de larga duración puede perder información.
- Cobertura de audio y voz por idioma no documentada: los 23 idiomas se declaran a nivel de modelo, pero la model card no detalla la calidad de ASR/TTS en cada uno; el rendimiento en español hablado debe validarse empíricamente.
- Licencia no estándar: LFM Open License v1.0 (`license: other`) con condiciones recogidas en el archivo LICENSE. Es imprescindible revisarlas antes de un uso comercial o de redistribución; la información disponible no detalla umbrales de facturación ni restricciones de despliegue.
- Requiere `trust_remote_code=True`: el repositorio incluye código personalizado, lo que implica auditar el código antes de ejecutarlo en producción.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que dificulta el despliegue en hardware muy limitado o en runtimes de inferencia populares.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Madurez: modelo con muy pocas descargas (83) y publicado recientemente, con riesgo de cambios en la API y de soporte limitado en herramientas de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Blog de presentación de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Colección de modelos LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Modelo de texto de la familia: https://huggingface.co/LiquidAI/LFM3-1.7B
- Web del fabricante: https://www.liquid.ai/
