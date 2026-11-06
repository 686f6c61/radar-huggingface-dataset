# litert-community/gemma-4-E4B-it-litert-lm

## Resumen

Gemma 4 E4B es un modelo de lenguaje de Google derivado de la misma investigación y tecnología empleadas en la familia Gemini, distribuido aquí en formato `.litertlm` por la comunidad `litert-community` para su despliegue en Android, iOS, escritorio, IoT y web. El modelo base (`google/gemma-4-E4B-it`) es una variante instruction-tuned de tamaño reducido, pensada específicamente para inferencia en dispositivo (on-device) sin necesidad de conexión a internet, lo que permite acceso privado a IA generativa. Esta ficha describe la versión cuantizada y empaquetada para el framework LiteRT-LM.

LiteRT-LM es una capa de orquestación construida sobre LiteRT, el runtime multiplataforma de Google que proporciona aceleración por hardware mediante XNNPack para CPU y ML Drift para GPU. Sobre esa base, LiteRT-LM añade bibliotecas y APIs específicas de GenAI: gestión de KV-cache, plantillas de prompt y function calling. Es el mismo stack que alimenta la aplicación de demostración Google AI Edge Gallery.

El modelo es relevante ahora porque lleva capacidades multimodales (texto, visión y audio) a hardware de consumo y dispositivos móviles con un peso total de fichero de 3,66 GB, incluyendo 2,24 GB de pesos del decodificador de texto y 0,67 GB de embeddings. La licencia Apache 2.0 facilita su integración comercial, y sus 445.313 descargas en Hugging Face reflejan un interés notable en despliegues edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión, audio) para despliegue on-device; framework LiteRT-LM |
| Parametros totales | no disponible (tamaño de fichero 3,66 GB: 2,24 GB decodificador + 0,67 GB embeddings) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32k tokens |
| Tipos de cuantizacion | no disponible (pesos ya cuantizados en el paquete `.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en `google/gemma-4-E4B-it` |

## Arquitectura y entrenamiento

La información disponible describe un modelo multimodal que combina un decodificador de texto con módulos de visión y audio que se cargan bajo demanda para reducir el consumo de memoria. El decodificador de texto ocupa 2,24 GB de pesos y los parámetros de embedding 0,67 GB. LiteRT-LM mantiene los pesos principales siempre en memoria, mientras que los embeddings se mapean en memoria (memory mapping), lo que permite ahorros significativos de memoria de trabajo en algunas plataformas. Los módulos de visión y audio se cargan solo cuando se necesitan.

El runtime se apoya en XNNPack para aceleración de CPU (con 4 hilos en las pruebas reportadas) y en ML Drift para GPU. LiteRT-LM añade gestión de KV-cache, plantillas de prompt y function calling sobre LiteRT. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta ficha; esos detalles corresponderían a la model card del modelo base `google/gemma-4-E4B-it`.

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruction-tuned (sufijo `-it`).
- Procesamiento de visión: el paquete incluye un módulo de visión que se carga bajo demanda.
- Procesamiento de audio: incluye un módulo de audio cargado bajo demanda.
- Function calling / tool calling: soportado de forma nativa por LiteRT-LM (APIs de prompt templating y function calling).
- Despliegue on-device sin conexión a internet, con privacidad de datos por diseño.
- Ejecución multiplataforma: Android, iOS, escritorio, IoT y web.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes móviles offline: integración en apps Android e iOS mediante Google AI Edge Gallery o las APIs de LiteRT-LM, ofreciendo generación de texto privada sin enviar datos a la nube.
- Procesamiento de documentos con OCR y comprensión visual: el módulo de visión cargado bajo demanda permite extraer y resumir información de imágenes y capturas en el propio dispositivo.
- Transcripción y comprensión de audio local: el módulo de audio posibilita tareas de voz a texto o análisis de audio sin salir del dispositivo.
- Automatización de flujos con function calling: LiteRT-LM incluye soporte nativo de tool calling, lo que permite al modelo invocar APIs locales o funciones del sistema en agentes embebidos.
- Aplicaciones IoT con requisitos de privacidad: el tamaño contenido (3,66 GB de fichero, con embeddings mapeados en memoria) y la aceleración XNNPack/ML Drift permiten desplegar IA generativa en hardware edge.
- Demos y prototipado web: existe un Space de Hugging Face (`tylermullen/Gemma4`) que permite probar el modelo en el navegador, útil para validar casos de uso antes de integrar en producción.
- Chat multi-turno con contexto largo: con hasta 32k tokens de contexto, adecuado para conversaciones prolongadas o análisis de documentos extensos en dispositivo.

## Benchmarks y rendimiento

La model card indica que los benchmarks se tomaron con 1024 tokens de prefill y 256 tokens de decode, con longitud de contexto de 2048 tokens, mediante LiteRT-LM, y que la inferencia en CPU se acelera con el delegado XNNPACK de LiteRT con 4 hilos. Sin embargo, los valores numéricos concretos de los benchmarks no están incluidos en la información proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- Tamaño del fichero del modelo: 3,66 GB (2,24 GB de pesos del decodificador de texto + 0,67 GB de embeddings + módulos de visión y audio).
- Los pesos principales se mantienen siempre en memoria; los embeddings se mapean en memoria, lo que reduce la memoria de trabajo en plataformas que lo soportan.
- Los módulos de visión y audio se cargan bajo demanda, reduciendo el consumo de memoria cuando no se usan.
- Aceleración en CPU mediante XNNPack (probado con 4 hilos) y en GPU mediante ML Drift.
- Cabe en dispositivos móviles de gama alta y en hardware de escritorio; el tamaño de 3,66 GB es compatible con muchos smartphones y placas edge actuales.
- Opciones de despliegue: LiteRT-LM (CLI para escritorio e IoT), Google AI Edge Gallery (Android e iOS), Space de Hugging Face para web, y las APIs de LiteRT-LM para integración en producto.
- VRAM/RAM exacta, GPU recomendadas, latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, este paquete se posiciona en la categoría de modelos pequeños multimodales para despliegue on-device, frente a alternativas del ecosistema edge; sin embargo, no se aportan cifras que permitan comparar parámetros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B (litert-lm) | no disponible | 32k | apache-2.0 | `.litertlm` | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base `google/gemma-4-E4B-it`.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se aportan tasas ni evaluaciones específicas en esta ficha.
- Idiomas soportados: no disponibles; conviene verificar el soporte multilingüe en el modelo base antes de desplegar en producción.
- Contexto máximo de 32k tokens; los benchmarks reportados se tomaron con contexto de 2048 tokens, por lo que el rendimiento en ventanas largas puede diferir.
- El formato `.litertlm` está ligado al framework LiteRT-LM; no es directamente compatible con vLLM, llama.cpp u Ollama sin conversión.
- Licencia Apache 2.0: permite uso comercial, pero deben revisarse los términos del modelo base `google/gemma-4-E4B-it` por si imponen condiciones adicionales.
- Al ser una versión cuantizada, puede haber degradación de calidad respecto al modelo base en tareas sensibles.
- El rendimiento depende fuertemente del hardware y del delegado de aceleración (XNNPack en CPU, ML Drift en GPU); no se aportan cifras de latencia ni throughput.

## Enlaces

- [Hugging Face: litert-community/gemma-4-E4B-it-litert-lm](https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Documentación LiteRT-LM](https://ai.google.dev/edge/litert-lm/overview)
- [CLI LiteRT-LM (escritorio e IoT)](https://ai.google.dev/edge/litert-lm/cli)
- [Repositorio de ejemplos litert-samples](https://github.com/google-ai-edge/litert-samples)
- [Google AI Edge Gallery en Google Play](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery&pli=1)
- [Google AI Edge Gallery en App Store](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337)
- [Space de demostración en Hugging Face](https://huggingface.co/spaces/tylermullen/Gemma4)
