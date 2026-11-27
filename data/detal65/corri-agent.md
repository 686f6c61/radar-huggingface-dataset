# detal65/corri-agent

## Resumen

`detal65/corri-agent` es una redistribución del modelo `google/gemma-4-E2B-it` de Google, publicada en formato `.litertlm` para su uso con el framework LiteRT-LM. Se trata, por tanto, de una cuantización del modelo base Gemma 4 E2B orientada al despliegue en dispositivos (Android, iOS, escritorio, IoT y web) más que de un modelo entrenado desde cero. El autor original de los pesos es Google; el repositorio aquí descrito se limita a empaquetar y distribuir la variante LiteRT-LM bajo licencia Apache 2.0.

La relevancia de este formato radica en su esquema de cuantización móvil de Gemma 4, que combina pesos de 2, 4 y 8 bits. Según la model card heredada, el peso en memoria para casos de uso solo de texto puede reducirse hasta 0,8 GB, con 1,12 GB adicionales de parámetros de embedding gestionados mediante mapeo de memoria. Los módulos de visión y audio se cargan bajo demanda, lo que reduce aún más el consumo en reposo.

El repositorio tiene un tamaño de 26,8 GB, lo que refleja el empaquetado completo con todos los componentes (texto, visión y audio). No registra descargas en el momento de la consulta y cuenta con un único "like". La información pública disponible es escasa: no se detallan parámetros totales, longitud de contexto completa ni idiomas soportados más allá de lo que se indica en la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible con precisión; los benchmarks se ejecutaron con contexto de 2048 tokens y la model card indica que el modelo soporta "hasta" un valor que queda truncado en la información disponible |
| Tipos de cuantizacion | Esquema de cuantización móvil Gemma 4 con mezcla de pesos de 2, 4 y 8 bits; formato `.litertlm` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 de Google construida con la misma investigación y tecnología que los modelos Gemini, según la model card. La variante E2B está diseñada específicamente para uso en dispositivo ("on-device"), con un tamaño reducido que permite inferencia local sin conexión a internet. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica principal de esta distribución es el stack LiteRT-LM: una capa de orquestación sobre LiteRT (el runtime multiplataforma de Google) que añade gestión de caché KV, plantillas de prompt y soporte de function calling, apoyándose en XNNPack para aceleración de CPU y ML Drift para GPU. El esquema de cuantización móvil de Gemma 4 combina precisiones de 2, 4 y 8 bits, y la carga bajo demanda de los módulos de visión y audio permite reducir el consumo de memoria en plataformas con recursos limitados.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct (`-it`).
- Procesamiento de visión: el repositorio incluye módulos de visión que se cargan bajo demanda.
- Procesamiento de audio: incluye módulos de audio cargados bajo demanda.
- Soporte de function calling / tool calling a través de las APIs de LiteRT-LM.
- Plantillas de prompt y gestión de caché KV integradas en el runtime LiteRT-LM.
- Ejecución totalmente local y sin conexión, lo que habilita casos de uso con privacidad de datos.
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.

## Casos de uso

- Asistentes conversacionales en aplicaciones móviles: el modelo puede ejecutarse íntegramente en el dispositivo con LiteRT-LM, de modo que las conversaciones no salen del teléfono y funcionan sin conexión, algo adecuado para apps de productividad o atención al usuario con requisitos de privacidad.
- Procesamiento de documentos con OCR y comprensión visual en el dispositivo: los módulos de visión cargados bajo demanda permiten analizar imágenes o capturas sin enviar datos a la nube, útil en apps de escaneo o accesibilidad.
- Transcripción y análisis de audio local: los módulos de audio permiten construir funciones de dictado o resumen de reuniones que operan sin conexión, con el ahorro de memoria que supone su carga bajo demanda.
- Automatización de flujos con tool calling en apps de escritorio: la integración de function calling en LiteRT-LM permite que el modelo invoque APIs locales (calendario, ficheros, sistema) en asistentes de escritorio.
- Despliegue en IoT y dispositivos embebidos: el peso en memoria de 0,8 GB para texto y el mapeo de memoria de los embeddings lo hacen viable en hardware con recursos limitados donde no cabe un modelo de mayor tamaño.
- Demos web interactivas: la existencia de un Space de Hugging Face y el soporte de LiteRT-LM para web permiten prototipar aplicaciones de IA generativa en el navegador sin backend de inferencia.
- Aplicaciones de campo sin conectividad: en entornos industriales, sanitarios o rurales sin red, el modelo ofrece generación de texto y comprensión multimodal local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las mediciones de rendimiento en LiteRT-LM se realizaron con 1024 tokens de prefill y 256 tokens de decode sobre un contexto de 2048 tokens, pero los valores numéricos concretos no aparecen en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM para texto: aproximadamente 0,8 GB de pesos en memoria según la model card, más 1,12 GB de embeddings gestionados por mapeo de memoria.
- Memoria adicional para visión y audio: se cargan bajo demanda, por lo que el pico de memoria aumenta solo cuando se usan esas modalidades.
- Tamaño del repositorio: 26,8 GB, correspondiente al empaquetado completo de todos los componentes.
- GPU recomendadas: no disponible. El runtime LiteRT-LM está orientado a aceleración en CPU (XNNPack) y GPU (ML Drift) en plataformas móviles y de borde.
- Compatibilidad con GPU de consumo: no se detalla; el enfoque del formato es el despliegue en dispositivo (Android, iOS, escritorio, IoT, web) más que en servidores con GPU dedicada.
- Opciones de despliegue: LiteRT-LM (CLI de escritorio, apps Android/iOS mediante Google AI Edge Gallery, Space web). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.litertlm` es específico de LiteRT-LM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| detal65/corri-agent (Gemma 4 E2B LiteRT-LM) | no disponible | no disponible (benchmarks a 2048) | `.litertlm` | Apache 2.0 | On-device, multimodal |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | safetensors (presumible) | Apache 2.0 (según este repo) | On-device, multimodal |
| Otras variantes LiteRT-LM de Gemma 4 | no disponible | no disponible | `.litertlm` | Apache 2.0 | On-device |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La información pública del repositorio es muy escasa: no se detallan parámetros totales, contexto máximo exacto, idiomas ni datos de entrenamiento.
- Al ser una cuantización de 2/4/8 bits, es esperable una pérdida de precisión frente al modelo base en tareas exigentes, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en este repositorio.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; se heredan los del modelo base Gemma 4 E2B, no detallados aquí.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente utilizable con vLLM, llama.cpp, Ollama u otros runners habituales.
- Aunque la licencia indicada es Apache 2.0, conviene verificar los términos del modelo base `google/gemma-4-E2B-it` antes de un uso comercial, ya que las condiciones de Gemma pueden incluir cláusulas adicionales.
- El repositorio no registra descargas ni validación comunitaria, por lo que su fiabilidad como artefacto de producción no está contrastada.
- El tamaño del repo (26,8 GB) puede dificultar su descarga e integración en pipelines con almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/detal65/corri-agent
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Model card de referencia LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Documentación de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Blog sobre cuantización de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Demo web en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
