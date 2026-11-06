# Amdkn7/LFM3-Omni-2B

## Resumen

LFM3-Omni-2B es un modelo omni-modal de la familia LFM3 desarrollado por Liquid AI. Se trata de un modelo end-to-end capaz de comprender texto, imagenes, video y audio, y de responder tanto en texto como en voz. Su propuesta principal es sustituir en un unico modelo la combinacion de un sistema ASR, un modelo vision-lenguaje, un LLM y un modelo TTS, lo que simplifica despliegues en entornos con recursos limitados.

Con 2.166.928.384 parametros (aproximadamente 2,2 mil millones), esta disenado para inferencia en dispositivo (edge): telefonos, portatiles y hardware embebido. El checkpoint publicado es un modelo post-entrenado de tipo any-to-any, con pipeline `image-text-to-text` y `any-to-any`, y soporte declarado para 23 idiomas, entre ellos el espanol.

La relevancia actual del modelo radica en la integracion de modalidades en un unico transformer pequeno: procesa video con pista de audio de forma conjunta (ve y escucha a la vez), genera voz a 24 kHz mediante un codec de audio propio y mantiene un tamano que permite ejecucion local. La ficha se basa en la informacion disponible en Hugging Face; los detalles no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (familia LFM3) con encoder de audio, encoder de vision, conectores especificos y backbone LFM3-1.7B; salida de texto mediante LM head y salida de voz mediante depthformer y Liquid Audio Codec |
| Parametros totales | 2.166.928.384 (2,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura combina varios componentes en un unico grafo: un encoder de audio LFM3 y un conector de audio, un encoder de vision LFM3 y un conector de vision, y un tokenizer con embeddings de texto. Todas las modalidades convergen en el backbone LFM3-1.7B (Liquid Foundation Model). La salida se genera como un flujo de tokens de texto y audio: los tokens de texto pasan por la LM head y los de audio por un depthformer y el Liquid Audio Codec, que produce voz a 24 kHz. El modelo es, por tanto, any-to-any: acepta texto, imagen, video y audio, y responde en texto o voz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada. El checkpoint publicado es un modelo post-entrenado, segun la model card, pero no se especifican las etapas de post-entrenamiento.

## Capacidades

- Comprension de texto, imagenes, video y audio en un unico modelo end-to-end.
- Generacion de respuestas en texto y en voz (speech-to-speech) a 24 kHz mediante el Liquid Audio Codec.
- Procesamiento conjunto de video con sonido: el modelo ve y escucha simultaneamente, lo que permite responder preguntas que requieren ambas modalidades.
- Reconocimiento automatico del habla (ASR) y traduccion de voz, segun la model card.
- Conversacion por voz: preguntas habladas sobre una imagen o un video.
- Capacidades multilingues en 23 idiomas, incluido el espanol.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia por voz en dispositivos moviles: el modelo recibe una pregunta hablada y responde con voz sintetizada, lo que permite integrar un asistente conversacional completo en un telefono sin depender de la nube, gracias a sus 2,2B parametros y su diseno para edge.
- Descripcion y analisis de imagenes mediante voz: un usuario puede fotografiar un objeto y preguntar por el en voz alta; el modelo procesa la imagen con el encoder de vision y responde hablando, util en aplicaciones de accesibilidad.
- Analisis de video con audio: para clips con sonido, el modelo puede responder preguntas que combinan lo visual y lo sonoro (por ejemplo, que se dice en una escena o que ocurre mientras suena una alarma), al procesar ambas modalidades de forma conjunta.
- Transcripcion y traduccion de reuniones: el modelo puede transcribir audio y traducirlo a otro de los 23 idiomas soportados, sustituyendo a un pipeline separado de ASR y traduccion en entornos locales.
- Subtitulado y doblaje ligero en produccion de video: al generar voz a 24 kHz y comprender video, puede emplearse para prototipos de doblaje o descripcion de escenas en herramientas de edicion que requieran inferencia local.
- Interfaces conversacionales en hardware embebido: por su tamano, encaja en dispositivos con recursos limitados (kioscos, electrodomesticos, robots de bajo coste) que necesiten entrada de voz y salida hablada sin conexion.
- Atencion al cliente multimodal: un usuario podria enviar una foto o un audio y recibir una respuesta hablada; el modelo unifica las etapas de comprension y generacion, lo que reduce la latencia y la complejidad del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 2,2B en FP16 requiere aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y del codec de audio; en cuantizaciones de 8 bits o 4 bits el requisito de pesos baja aproximadamente a 2,2 GB y 1,1 GB respectivamente, aunque no se confirman formatos de cuantizacion soportados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con GPUs de consumo con suficiente memoria, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: probable por el tamano de 2,2B, pero no confirmado oficialmente; depende de la cuantizacion y del soporte del codigo custom.
- Opciones de despliegue: la libreria indicada es transformers con `custom_code`; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (omni-modales de ~2B) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; al ser un modelo multimodal y multilingue, es previsible que herede sesgos de sus datos de entrenamiento, pero no se detallan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo LLM generativo, puede producir respuestas incorrectas, especialmente en tareas de percepcion (audio, video) o en idiomas con menos datos.
- Longitud de contexto no publicada: limita la planificacion de aplicaciones con documentos o conversaciones largas.
- Cobertura idiomatica: se declaran 23 idiomas, pero no se especifica el rendimiento por idioma; el espanol esta incluido, aunque la calidad relativa es desconocida.
- Licencia lfm1.0 (license: other): es necesario revisar los terminos del archivo LICENSE del repositorio antes de un uso comercial; no se detallan restricciones en la informacion proporcionada.
- El repositorio aparece publicado por el usuario Amdkn7 con 0 descargas y 0 likes, y la model card referencia recursos de LiquidAI; conviene verificar la procedencia y el checkpoint oficial antes de usarlo en produccion.
- Requiere `custom_code` en transformers, lo que puede complicar la integracion con otros frameworks de inferencia.
- No se confirman capacidades de tool calling ni de agentes, relevantes para pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/Amdkn7/LFM3-Omni-2B
- Modelo de referencia de la familia (LFM3-1.7B): https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de voz: https://playground.liquid.ai/talk
