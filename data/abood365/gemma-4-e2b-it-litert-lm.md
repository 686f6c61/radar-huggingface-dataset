# abood365/gemma-4-E2B-it-litert-lm

## Resumen

Gemma 4 E2B IT es un modelo de lenguaje de Google, miembro de la familia Gemma 4, disenado especificamente para inferencia en dispositivo (on-device). Esta ficha corresponde a la conversion `abood365/gemma-4-E2B-it-litert-lm`, un empaquetado del modelo base `google/gemma-4-E2B-it` en formato `.litertlm` para su uso con el framework LiteRT-LM de Google, que permite desplegarlo en Android, iOS, escritorio, IoT y web. El modelo combinado con esta capa de orquestacion habilita IA generativa privada sin conexion a internet.

El modelo se apoya en LiteRT (antes TFLite), el runtime multiplataforma de Google acelerado por XNNPack en CPU y ML Drift en GPU, y anade gestion de KV-cache, plantillas de prompt y function calling. Su esquema de cuantizacion movil combina pesos de 2, 4 y 8 bits, reduciendo el footprint de pesos a aproximadamente 0,8 GB en casos de solo texto, con 1,12 GB de parametros de embedding mapeados en memoria. Los modulos de vision y audio se cargan bajo demanda para ahorrar memoria.

Este empaquetado es relevante porque demuestra el flujo de despliegue de Gemma 4 en el ecosistema edge de Google, con licencia Apache 2.0 y soporte de contexto hasta 32k tokens. No obstante, el repositorio es un espejo de terceros (autor `abood365`) con cero descargas y sin model card propia mas alla de la copia de la model card de `litert-community`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), optimizado para LiteRT-LM; detalles internos no disponibles |
| Parametros totales | no disponible (denominacion E2B sugiere ~2B efectivos, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32 000 tokens (32k) |
| Tipos de cuantizacion | esquema movil Gemma 4 con mezcla de pesos de 2, 4 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); repo de 26,3 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer mas alla de su pertenencia a la familia Gemma 4 y su construccion sobre la misma investigacion que los modelos Gemini. El empaquetado LiteRT-LM actua como capa de orquestacion sobre LiteRT, aportando aceleracion por XNNPack (CPU) y ML Drift (GPU), gestion de KV-cache, plantillas de prompt y soporte de function calling. La cuantizacion aplicada es un esquema especifico de Google para movil con pesos mixtos de 2, 4 y 8 bits, derivado de un proceso de quantization-aware training documentado en el blog de Google.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en este empaquetado concreto. Los modulos de vision y audio se cargan de forma diferida (on demand), lo que reduce el consumo de memoria en escenarios de solo texto. El runtime emplea memory mapping para los 1,12 GB de parametros de embedding.

## Capacidades

- Generacion de texto y razonamiento en dispositivo, sin necesidad de conexion a internet.
- Procesamiento multimodal: incluye modulos de vision y audio cargables bajo demanda (segun la model card).
- Soporte de function calling / tool calling a traves de las APIs de LiteRT-LM.
- Gestion de KV-cache y plantillas de prompt integradas en el runtime.
- Capacidades multilingues: no se especifican los idiomas concretos.
- Modo de contexto largo: hasta 32k tokens.
- Despliegue multiplataforma: Android, iOS, escritorio, IoT y web.

## Casos de uso

- Asistentes privados en dispositivo: el modelo puede gestionar conversaciones multi-turno sin enviar datos a la nube, gracias a su ejecucion local y al soporte de KV-cache en LiteRT-LM, lo que resulta adecuado para aplicaciones sensibles a la privacidad.
- Aplicaciones moviles de accesibilidad: procesamiento de voz e imagen en el propio telefono mediante los modulos de audio y vision cargados bajo demanda, con footprint de pesos reducido (~0,8 GB en solo texto).
- Automatizacion de tareas en IoT: inferencia en dispositivos con recursos limitados usando la aceleracion XNNPack en CPU, sin dependencia de conectividad.
- Agentes locales con function calling: integracion de llamadas a funciones del sistema operativo o APIs locales mediante el soporte nativo de tool calling de LiteRT-LM.
- Procesamiento de documentos en escritorio: resumen y extraccion de informacion de textos largos aprovechando la ventana de 32k tokens.
- Demos y prototipado web: despliegue en el espacio de HuggingFace o en navegador mediante el runtime LiteRT-LM, util para validar casos de uso antes de portar a movil.
- Filtrado y clasificacion de contenido on-device: analisis de texto e imagenes en el dispositivo para moderacion sin coste de servidor.

## Benchmarks y rendimiento

La model card menciona que se realizaron benchmarks con 1024 tokens de prefill y 256 de decode sobre una longitud de contexto de 2048 mediante LiteRT-LM, pero el texto proporcionado se interrumpe antes de mostrar los resultados numericos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: footprint de pesos de aproximadamente 0,8 GB para casos de solo texto; 1,12 GB adicionales de embeddings mapeados en memoria. El repo completo ocupa 26,3 GB.
- GPU recomendadas: no se especifican modelos concretos; el runtime usa ML Drift para aceleracion GPU en plataformas compatibles.
- CPU: aceleracion via XNNPack, disenado para telefonos y dispositivos edge.
- Cabe en GPU de consumo: si, dado el bajo footprint de pesos; no se detallan modelos concretos.
- Opciones de despliegue: LiteRT-LM (CLI de escritorio, SDK para Android/iOS, runtime web), Google AI Edge Gallery. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (los datos de benchmark estan truncados en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B IT (este empaquetado) | no disponible (~2B efectivos por denominacion) | 32k | `.litertlm` | Apache 2.0 | Optimizado para on-device con cuantizacion mixta 2/4/8 bits |
| google/gemma-4-E2B-it (modelo base) | no disponible | 32k | safetensors (presumible) | Apache 2.0 | Version original sin empaquetado LiteRT-LM |
| litert-community/gemma-4-E2B-it-litert-lm | no disponible | 32k | `.litertlm` | Apache 2.0 | Empaquetado oficial de referencia; este repo es un espejo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros: el autor `abood365` no es el emisor oficial; se trata de un espejo del empaquetado de `litert-community`, con cero descargas y sin validacion de la comunidad.
- Idiomas soportados no especificados: no se puede garantizar calidad multilingue sin datos.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: aunque soporta 32k tokens, los benchmarks mencionados se ejecutaron con 2048 tokens de contexto, por lo que el rendimiento en contextos largos no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base de Google (`google/gemma-4-E2B-it`) y su Gemma Terms of Use, que pueden imponer restricciones adicionales.
- Formato propietario `.litertlm`: requiere el runtime LiteRT-LM; no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp.
- Repo de 26,3 GB: el tamano incluye todas las variantes; el despliegue real solo requiere un subconjunto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abood365/gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Empaquetado de referencia: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Documentacion LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Blog de cuantizacion Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Demo web: https://huggingface.co/spaces/tylermullen/Gemma4
