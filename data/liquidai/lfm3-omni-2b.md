# LiquidAI/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es el primer modelo omnicanal de la familia LFM3 de Liquid AI: un unico modelo end-to-end que comprende texto, imagenes, video y audio, y responde en texto y en voz. Sustituye la combinacion de varios modelos independientes (ASR, vision-language, LLM y TTS) por un unico checkpoint de 2.166.928.384 parametros, pensado para ejecutarse en dispositivos de borde como telefonos y portatiles.

El modelo integra un encoder de audio y un encoder de vision, cada uno con su conector correspondiente, que alimentan un nucleo LFM3-1.7B (Liquid Foundation Model). La salida combina tokens de texto y de audio: el flujo de audio se procesa mediante un depthformer y el codec Liquid Audio Codec para generar voz a 24 kHz. Esto lo convierte en un modelo any-to-any con capacidad de conversacion hablada de extremo a extremo.

Es relevante ahora porque demuestra que las capacidades multimodales completas (vision, audio y habla) pueden empaquetarse en menos de 2.2B de parametros con vocacion on-device, algo que hasta hace poco requeria pipelines de varios modelos y bastante mas VRAM. Soporta 25 idiomas y se distribuye con licencia lfm1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-modal: encoder de audio + encoder de vision + conectores + nucleo LFM3-1.7B (Liquid Foundation Model) + depthformer + Liquid Audio Codec |
| Parametros totales | 2.166.928.384 (2,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 25: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline omni-modal end-to-end. Una pregunta hablada pasa por el encoder de audio de LFM3 y su conector de audio; una imagen pasa por el encoder de vision y su conector de vision; un prompt de texto pasa por el tokenizador y el embedding. Todas las modalidades convergen en el nucleo LFM3-1.7B. La salida es un flujo de tokens de texto y de audio: los tokens de texto van al LM head y los de audio al depthformer y al Liquid Audio Codec, que sintetiza voz a 24 kHz.

El checkpoint publicado es un modelo post-entrenado omni-modal. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. La innovacion destacable es la integracion de las cuatro funciones (ASR, vision-language, LLM y TTS) en un solo modelo de 2,2B parametros disenado para hardware de borde, con procesamiento conjunto de video e imagen y sonido para preguntas que requieren ambas modalidades.

## Capacidades

- Comprension de texto, imagenes, video y audio en un unico modelo.
- Respuesta en texto y en voz (speech-to-speech) a 24 kHz mediante el Liquid Audio Codec.
- Preguntas sobre una foto formuladas por voz.
- Transcripcion y traduccion de voz.
- Conversacion hablada (chat out loud).
- Preguntas sobre un video y su banda sonora de forma conjunta (ve y escucha a la vez).
- Capacidades multilingues en 25 idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de voz en movil: el modelo recibe audio del microfono, lo comprende y responde con voz sintetizada a 24 kHz, todo en el propio dispositivo, sin depender de la nube.
- Descripcion de imagenes por voz para accesibilidad: el usuario apunta la camara y pregunta en voz alta que hay en la escena; el modelo procesa la imagen y contesta hablando.
- Transcripcion y traduccion de reuniones: se le pasa el audio de una conversacion y devuelve la transcripcion o la traduccion a cualquiera de los 25 idiomas soportados.
- Analisis de video con audio: para contenido grabado, el modelo ve las imagenes y escucha la pista de sonido a la vez, lo que permite responder preguntas que dependen de ambas senales (por ejemplo, quien habla y que muestra la pantalla).
- Interaccion manos libres en dispositivos de borde: portatiles, telefonos o hardware empotrado con recursos limitados, donde un unico modelo de 2,2B sustituye a cuatro componentes separados y reduce el consumo de memoria.
- Atencion al cliente por voz: conversaciones multi-turno habladas donde el modelo transcribe la consulta, razona en texto y responde con voz, con la ventaja de ejecutarse localmente para preservar la privacidad del audio del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 4,5 GB en safetensors, lo que da una referencia del orden de magnitud en precision completa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: el diseno esta orientado a hardware de borde (telefonos, portatiles), por lo que en principio es apto para GPUs de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: transformers (libreria declarada, con custom_code). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B | 2,2B | no disponible | texto, imagen, video, audio (entrada); texto y voz (salida) | lfm1.0 | Hugging Face |
| Alternativas de la familia LFM3 (base, text, vision, audio, decision) | no disponible | no disponible | parciales por variante | lfm1.0 | Hugging Face (coleccion LiquidAI/lfm3) |
| Otros modelos omni de borde | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como en cualquier modelo entrenado con datos web, cabe esperar sesgos linguisticos y culturales.
- Riesgo de alucinacion: no cuantificado; en tareas de transcripcion y descripcion visual conviene validar las salidas.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; los 25 idiomas listados no implican el mismo nivel de calidad en todos ellos.
- Restricciones de licencia: la licencia lfm1.0 es de tipo "other"; es imprescindible revisar el fichero LICENSE del repositorio antes de un uso comercial.
- Caveats para produccion: el modelo requiere custom_code en transformers, lo que puede complicar el despliegue en servidores de inferencia estandar; no hay datos publicos de latencia ni de throughput para dimensionar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Web de Liquid AI: https://www.liquid.ai/
