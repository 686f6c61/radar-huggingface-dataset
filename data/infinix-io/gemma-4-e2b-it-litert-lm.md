# Infinix-io/gemma-4-E2B-it-litert-lm

## Resumen

Gemma 4 E2B es un modelo de lenguaje ligero desarrollado por Google, distribuido originalmente bajo el identificador `google/gemma-4-E2B-it`. La versión aquí descrita, `Infinix-io/gemma-4-E2B-it-litert-lm`, es una reempaquetado cuantizado del modelo base en formato `.litertlm`, pensado para su despliegue en dispositivos Android, iOS, escritorio, IoT y web mediante el framework LiteRT-LM de Google.

El modelo pertenece a la familia Gemma, construida sobre la misma investigación y tecnología que los modelos Gemini. Su diseño prioriza el uso en dispositivo (on-device), lo que permite acceso privado a IA generativa sin conexión a internet. El repositorio ocupa 26,8 GB, aunque el esquema de cuantización móvil de Gemma 4 reduce la huella de pesos a aproximadamente 0,8 GB para casos de solo texto, con 1,12 GB adicionales de parámetros de embedding mapeados en memoria.

LiteRT-LM es una capa de orquestación sobre LiteRT, el runtime multiplataforma de Google que proporciona aceleración por hardware vía XNNPack (CPU) y ML Drift (GPU). Añade gestión de caché KV, plantillas de prompt y function calling. Es la misma pila tecnológica que impulsa la aplicación Google AI Edge Gallery. La relevancia actual radica en la demanda de modelos que funcionen localmente en dispositivos con recursos limitados, manteniendo capacidades multimodales (texto, visión y audio) con carga bajo demanda de los módulos no textuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles específicos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 2048 tokens en los benchmarks reportados; límite máximo no especificado |
| Tipos de cuantizacion | Esquema móvil Gemma 4 con mezcla de pesos de 2, 4 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4, y que esta versión es una cuantización del mismo (`base_model_relation: quantized`). No se detallan en la información proporcionada el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es el esquema de cuantización móvil de Gemma 4, que combina pesos de 2, 4 y 8 bits. Según la model card, esto permite una huella de pesos en memoria de tan solo 0,8 GB para uso de solo texto, con 1,12 GB de parámetros de embedding soportados mediante memory mapping. Además, los módulos de visión y audio se cargan bajo demanda para reducir aún más el consumo de memoria. El runtime LiteRT-LM añade gestión de caché KV, plantillas de prompt y function calling sobre LiteRT, con aceleración XNNPack para CPU y ML Drift para GPU.

## Capacidades

- Generación de texto y razonamiento conversacional (modelo con sufijo `-it`, ajustado para instrucciones).
- Capacidades multimodales: visión y audio, con carga bajo demanda de dichos módulos.
- Function calling / tool calling, soportado nativamente por la capa LiteRT-LM.
- Plantillas de prompt y gestión de caché KV integradas en el runtime.
- Ejecución on-device sin conexión a internet, lo que habilita privacidad de datos.
- Despliegue multiplataforma: Android, iOS, escritorio, IoT y web.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de IA en aplicaciones móviles sin conexión: el modelo se ejecuta localmente en Android e iOS mediante LiteRT-LM, permitiendo conversaciones privadas sin enviar datos a la nube, con una huella de pesos de 0,8 GB en modo texto.
- Procesamiento de documentos con privacidad en escritorio: integración vía CLI de LiteRT-LM para resumir o extraer información de archivos locales sin salir del dispositivo, aprovechando la carga bajo demanda de módulos.
- Aplicaciones IoT con recursos limitados: el esquema de cuantización de 2/4/8 bits y el memory mapping de embeddings permiten desplegar el modelo en hardware edge con memoria restringida.
- Demos web interactivas: despliegue en navegador mediante el Space de Hugging Face asociado, útil para prototipado rápido de experiencias de IA generativa.
- Automatización con function calling en apps móviles: el soporte nativo de tool calling en LiteRT-LM permite que la app invoque APIs locales o servicios del dispositivo en flujos multi-paso.
- Análisis multimodal en el dispositivo: uso de los módulos de visión y audio cargados bajo demanda para tareas como descripción de imágenes o transcripción, manteniendo el consumo de memoria controlado.
- Evaluación y benchmarking de modelos on-device: el formato `.litertlm` y la pila LiteRT-LM facilitan medir latencia y throughput en hardware real (prefill de 1024 tokens, decode de 256 tokens, contexto de 2048).

## Benchmarks y rendimiento

La model card indica que los benchmarks se tomaron con 1024 tokens de prefill y 256 tokens de decode, con una longitud de contexto de 2048 tokens, mediante LiteRT-LM. Sin embargo, los resultados numéricos concretos no están disponibles en la información proporcionada (la model card se trunca en la sección de rendimiento).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: aproximadamente 0,8 GB de pesos para uso de solo texto, más 1,12 GB de embeddings mapeados en memoria. Los módulos de visión y audio se cargan bajo demanda y añaden consumo adicional no cuantificado en la información disponible.
- GPU recomendadas: no disponibles de forma específica; LiteRT-LM usa ML Drift para aceleración GPU en plataformas compatibles.
- CPU: aceleración vía XNNPack.
- ¿Cabe en GPU de consumo? El objetivo del modelo es el despliegue on-device (móvil, IoT, escritorio), por lo que está diseñado para hardware de gama baja y no requiere GPU de consumo dedicada.
- Opciones de despliegue: LiteRT-LM (CLI para escritorio e IoT), Google AI Edge Gallery (Android e iOS), Space de Hugging Face (web).
- Latencia y throughput: no disponibles en la información proporcionada; los benchmarks reportados usan 1024 tokens de prefill y 256 de decode con contexto de 2048, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto o rendimiento de modelos alternativos que permitan una comparación rigurosa. La model card no incluye comparativas con otros modelos.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B (esta versión) | no disponible | hasta 2048 en benchmarks | Apache 2.0 | `.litertlm` | Hugging Face, AI Edge Gallery |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información sobre sesgos conocidos no está disponible en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- El contexto reportado en benchmarks es de 2048 tokens; el límite máximo real no está especificado en la información disponible.
- Los idiomas soportados no están documentados; no se puede garantizar un rendimiento multilingüe equilibrado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-E2B-it` y de la familia Gemma en general.
- El formato `.litertlm` está atado al framework LiteRT-LM; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- El repositorio tiene 0 descargas y 0 likes, y la model card parece derivada de `litert-community/gemma-4-E2B-it-litert-lm`; conviene validar la integridad y procedencia de esta reempaquetado antes de usarlo en producción.
- La carga bajo demanda de módulos de visión y audio implica que el rendimiento multimodal puede variar según el hardware y la gestión de memoria del dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinix-io/gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Documentación LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Blog de cuantización Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Space de demostración: https://huggingface.co/spaces/tylermullen/Gemma4
