# darkmaniac7/LFM3-1.7B-MNN

## Resumen

LFM3-1.7B-MNN es una conversión al formato MNN del modelo LFM3 1.7B desarrollado originalmente por Liquid AI, publicada por el usuario darkmaniac7 bajo la marca TokForge. Se trata de un bundle de inferencia en dispositivo (on-device) pensado para ejecutar un modelo de chat de 1.700 millones de parámetros directamente en teléfonos Android, sin conexión a red una vez descargado. El paquete ocupa 1,31 GB repartidos en siete ficheros y emplea cuantización int4 con HQQ (block size 32) sobre los pesos.

El modelo base, LFM3 1.7B, es un modelo híbrido compacto diseñado por Liquid AI para dispositivos de borde: la mayor parte de sus capas son convoluciones cortas, lo que reduce el consumo de memoria en conversaciones largas, complementadas con capas de atención completa y de atención de ventana deslizante con GQA (16 cabezas de query y 4 de clave/valor). El vocabulario es de 128.000 tokens y la plantilla de chat es la propia de Liquid AI, con el modo de razonamiento (thinking) activado por defecto.

La relevancia de esta ficha radica en que ejemplifica la tendencia de llevar modelos de lenguaje a hardware móvil mediante runtimes especializados (MNN de Alibaba) y cuantización agresiva, algo que hasta hace poco quedaba reservado a modelos mucho más pequeños. No obstante, conviene subrayar que se trata de una conversión de terceros, no de una publicación oficial de Liquid AI, y que la información técnica disponible se limita a la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida (13 capas de convolución corta, 6 de atención completa, 5 de atención de ventana deslizante, GQA 16Q/4KV) |
| Parametros totales | 1,7B (pesos cuantizados a 4 bits) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4, block size 32, HQQ; embedding y cabeza atados en el fichero de pesos |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | MNN bundle (`llm.mnn`, `llm.mnn.weight`, `llm.mnn.json`, `tokenizer.mtok`) |
| Tamano del repo | 1,3 GB (7 ficheros) |
| Vocabulario | 128.000 tokens |
| Runtime | MNN (Alibaba); selección automática de ruta CPU o GPU por teléfono en TokForge |
| Requisito de dispositivo | Android con 4 GB de RAM o más (catálogo de TokForge) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la LFM3 híbrida de Liquid AI: de las capas que componen la red, 13 son convoluciones cortas, 6 son capas de atención completa y 5 son capas de atención de ventana deslizante. Esta combinación busca mantener bajo el uso de memoria en conversaciones largas, ya que las convoluciones cortas no requieren almacenar un cache KV que crezca linealmente con el contexto. La atención emplea GQA con 16 cabezas de query y 4 de clave/valor, lo que reduce el coste de memoria del cache KV frente a la atención multi-cabeza tradicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card de esta conversión no los detalla. La innovación técnica destacable en este paquete concreto es la cuantización int4 con HQQ en bloques de 32 y la conversión al formato MNN, que permite ejecutar el modelo en teléfonos Android mediante el motor MNN, con enrutado automático entre CPU y GPU según el dispositivo. El bundle es exclusivamente de texto: las imágenes que se adjunten en TokForge se describen mediante un helper de imagen integrado en la app y el modelo responde a partir de esa descripción, no procesa visión de forma nativa.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés, orientado a chat general.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat de Liquid AI.
- Conversaciones multi-turno con gestión de memoria eficiente gracias a las capas de convolución corta del modelo base.
- Inferencia totalmente local en el dispositivo, sin necesidad de conexión una vez descargado el bundle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no nativas; la visión se delega a un helper de imagen de la app TokForge.

## Casos de uso

- Chat privado sin conexión en Android: el modelo se ejecuta íntegramente en el teléfono con 4 GB de RAM o más, de modo que las conversaciones no salen del dispositivo, lo que resulta adecuado para usuarios preocupados por la privacidad o que trabajan en entornos sin red.
- Asistente de bolsillo para consultas rápidas: gracias a su tamaño de 1,31 GB y a la selección automática de CPU o GPU por parte de TokForge, puede responder a preguntas cotidianas, resúmenes breves o borradores de texto sin latencia de red.
- Prototipado de aplicaciones móviles con MNN: el bundle sirve como referencia para desarrolladores que quieran integrar un LLM de 1,7B en una app Android mediante el runtime MNN de Alibaba, sin depender de servicios en la nube.
- Demostraciones y pruebas de concepto de IA en dispositivo: útil para evaluar el rendimiento real de un modelo híbrido cuantizado a 4 bits en hardware móvil de gama media antes de comprometerse con un despliegue mayor.
- Educación y experimentación: permite a estudiantes e investigadores ejecutar un modelo de lenguaje moderno en un teléfono para estudiar su comportamiento, sus límites de contexto y la calidad de sus respuestas en inglés.
- Chat de acompañamiento en apps de terceros: la licencia LFM Open v1.0 permite uso comercial mientras los ingresos anuales sean inferiores a 10 millones de USD, lo que habilita integrar el modelo en productos móviles de pequeñas empresas y startups.
- Descripción de imágenes asistida: en TokForge, el helper de imagen de la app describe las fotos adjuntas y el modelo responde a partir de esa descripción, lo que permite flujos de accesibilidad o etiquetado básico de imágenes en el teléfono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el bundle pesa 1,31 GB en disco; el catálogo de TokForge exige teléfonos Android con 4 GB de RAM o más para cargarlo.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el destino es la GPU integrada del teléfono o su CPU, con enrutado automático por parte de TokForge.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; el formato MNN está orientado a móvil y no se indica soporte para GPUs de escritorio.
- Opciones de despliegue: MNN (Alibaba) como runtime principal, a través de la app TokForge (Android en Google Play, iOS en TestFlight). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MNN (esta ficha) | 1,7B (int4) | no disponible | MNN, móvil Android | LFM Open v1.0 (uso comercial < 10 M USD de ingresos) | Hugging Face, TokForge |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | safetensors / transformers | LFM Open v1.0 | Hugging Face |
| Alternativas de tamaño similar para móvil | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto del modelo base en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible. La comparación más directa es con el modelo original de Liquid AI, del que esta publicación es una conversión cuantizada y empaquetada para MNN.

## Limitaciones y advertencias

- Es una conversión de terceros (darkmaniac7 / TokForge), no una publicación oficial de Liquid AI; la calidad de la cuantización y del empaquetado no está avalada por el desarrollador original.
- El modelo solo soporta inglés según la model card; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar conversaciones largas con garantías.
- Riesgo de alucinación inherente a un modelo de 1,7B cuantizado a 4 bits; no se han publicado evaluaciones que cuantifiquen este riesgo.
- No hay información sobre sesgos del modelo base ni sobre las medidas de mitigación aplicadas.
- La licencia LFM Open v1.0 restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de USD; las entidades por encima de ese umbral necesitan una licencia comercial de Liquid AI.
- Al ser una licencia "other", conviene revisar el texto completo de `LICENSE` antes de redistribuir o modificar el bundle; se exige mantener la licencia y marcar los ficheros modificados.
- El bundle es solo de texto; no procesa imágenes de forma nativa y depende de un helper externo de la app para describirlas.
- Requiere TokForge 1.3.9.7 o superior y un teléfono Android con 4 GB de RAM o más; no se documenta compatibilidad con otros runtimes ni con GPUs de escritorio.
- No se han publicado benchmarks, por lo que no es posible comparar su calidad con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/LFM3-1.7B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia (LFM Open License v1.0): https://huggingface.co/darkmaniac7/LFM3-1.7B-MNN/blob/main/LICENSE
- Colección TokForge Chat Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- TokForge en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TokForge en iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- MNN (Alibaba) en GitHub: https://github.com/alibaba/MNN
