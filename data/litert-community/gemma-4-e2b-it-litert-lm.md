# litert-community/gemma-4-E2B-it-litert-lm

## Resumen

`litert-community/gemma-4-E2B-it-litert-lm` es una adaptación del modelo Gemma 4 E2B de Google, preparada específicamente para su ejecución en dispositivos mediante el framework LiteRT-LM, la capa de orquestación de Google para inteligencia artificial en el edge. Este modelo está pensado para despliegues en Android, iOS, escritorio, IoT y web, ofreciendo capacidades generativas sin necesidad de conexión a internet, lo que garantiza privacidad y baja latencia. El formato `.litertlm` aprovecha el runtime LiteRT con aceleración por XNNPack (CPU) y ML Drift (GPU), e incluye gestión de KV-cache, plantillas de prompt y soporte de function calling.

El modelo base, Gemma 4 E2B, forma parte de la familia Gemma 4 de Google, construida con la misma tecnología que los modelos Gemini. Es un modelo pequeño, ideal para entornos con recursos limitados, y utiliza un esquema de cuantización móvil de última generación que combina pesos de 2, 4 y 8 bits. Esto permite que el peso en memoria para tareas de solo texto sea de aproximadamente 0,8 GB, con 1,12 GB de parámetros de embedding mapeados en memoria. Además, los componentes de visión y audio se cargan bajo demanda para reducir aún más el consumo de memoria. El modelo soporta hasta 32k tokens de contexto y se distribuye bajo licencia Apache 2.0.

La relevancia de esta versión radica en que democratiza el acceso a modelos generativos de alto rendimiento en hardware de consumo, permitiendo a desarrolladores integrar IA generativa en aplicaciones móviles y de escritorio con un coste computacional mínimo. Su adopción es notable, con más de un millón de descargas y 394 likes en Hugging Face, lo que refleja el interés de la comunidad por soluciones de IA en el edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la familia Gemma 4, probablemente transformer multimodal) |
| Parametros totales | no disponible (el nombre sugiere ~2B, pero no se confirma) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.000 tokens |
| Tipos de cuantizacion | mezcla de 2-bit, 4-bit y 8-bit (esquema Gemma-4 mobile quantization) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo Gemma 4 E2B, pero por su pertenencia a la familia Gemma 4 se puede inferir que se trata de un transformer multimodal, capaz de procesar texto, visión y audio. El modelo base `google/gemma-4-E2B-it` fue desarrollado por Google y posteriormente convertido al formato `.litertlm` por la comunidad `litert-community` para su uso con LiteRT-LM.

El proceso de conversión incluye una cuantización específica para móviles, denominada "Gemma-4 mobile quantization scheme", que combina pesos de 2, 4 y 8 bits. Esta técnica, descrita en un blog de Google, permite reducir significativamente la huella de memoria manteniendo un rendimiento aceptable. El runtime LiteRT-LM se encarga de la gestión de memoria mediante mapeo de archivos (memory mapping) para los embeddings, y carga los módulos de visión y audio solo cuando son necesarios. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO, ya que estos datos corresponden al modelo base y no se especifican en la documentación de esta adaptación.

## Capacidades

- Generación de texto y razonamiento: el modelo puede generar respuestas coherentes y realizar tareas de razonamiento básico, adecuadas para asistentes conversacionales y aplicaciones de productividad.
- Multimodalidad: soporta entrada de visión y audio, aunque estos módulos se cargan bajo demanda para ahorrar memoria. Esto permite tareas como descripción de imágenes o procesamiento de voz.
- Function calling: LiteRT-LM incluye APIs de function calling, lo que permite al modelo interactuar con herramientas y servicios externos.
- Ejecución sin conexión: al estar diseñado para el edge, funciona sin conexión a internet, garantizando privacidad y disponibilidad.
- Soporte de agentes: gracias a la gestión de KV-cache y el prompt templating, puede mantener conversaciones multi-turno y ejecutar flujos de trabajo agénticos.
- Multilingüe: no se especifican los idiomas soportados, pero al ser un modelo de Google, es probable que tenga cobertura multilingüe, aunque no se confirma.

## Casos de uso

- Asistente personal en el móvil: el modelo puede integrarse en aplicaciones de Android o iOS para ofrecer un asistente de voz y texto que funcione sin conexión, con respuestas rápidas y privadas.
- Atención al cliente en dispositivos IoT: en quioscos o dispositivos de punto de venta, el modelo puede gestionar consultas de clientes en tiempo real, con soporte de function calling para consultar bases de datos o sistemas de inventario.
- Transcripción y resumen de audio: gracias al módulo de audio, puede transcribir reuniones o notas de voz y generar resúmenes, todo localmente en el dispositivo.
- Descripción de imágenes para accesibilidad: el módulo de visión permite describir imágenes a personas con discapacidad visual, funcionando sin conexión en dispositivos móviles.
- Generación de código en entornos de desarrollo integrados (IDE): con soporte de function calling, puede asistir a programadores sugiriendo fragmentos de código o completando funciones, ejecutándose localmente en el equipo de desarrollo.
- Aplicaciones de escritorio con privacidad: en aplicaciones de escritorio (Windows, macOS, Linux), el modelo puede redactar correos, generar informes o resumir documentos sin enviar datos a la nube.
- Edge computing en entornos industriales: en dispositivos de campo, puede procesar datos de sensores o manuales técnicos y ofrecer respuestas a operarios sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se realizaron pruebas con 1024 tokens de prefill y 256 tokens de decode con un contexto de 2048 tokens, pero no se proporcionan los valores numéricos de rendimiento (latencia, throughput, etc.). Tampoco se incluyen comparativas con otros modelos. Por tanto, no es posible presentar una tabla de resultados objetiva.

## Requisitos de hardware

- Memoria: el peso en memoria para tareas de solo texto puede ser tan bajo como 0,8 GB gracias a la cuantización mixta. Los embeddings de 1,12 GB se mapean en memoria, por lo que el consumo de RAM depende de la plataforma.
- GPU: al estar orientado al edge, funciona principalmente con aceleración por CPU (XNNPack) y GPU (ML Drift) en dispositivos móviles. No se especifican requisitos para GPU de escritorio, pero dado su tamaño reducido, podría ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no se confirma.
- Dispositivos compatibles: Android, iOS, escritorio (Windows, macOS, Linux), IoT y web. El modelo está optimizado para el runtime LiteRT-LM.
- Opciones de despliegue: mediante el CLI de LiteRT-LM, la app Google AI Edge Gallery, o integración directa con la librería LiteRT-LM en aplicaciones nativas.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El propio ecosistema Gemma 4 incluye variantes como E4B (también soportada por LiteRT-LM) y modelos más grandes (26B A4B, 31B) para GPUs de consumo, pero no se proporcionan especificaciones detalladas de estos en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: al ser un modelo derivado de Gemma 4, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan específicamente.
- Alucinación: como cualquier modelo generativo, puede producir información incorrecta o inventada, especialmente en contextos largos o ambiguos.
- Contexto limitado: aunque soporta hasta 32k tokens, el rendimiento puede degradarse en contextos muy largos, y las pruebas oficiales se realizaron con 2048 tokens.
- Idiomas: no se especifica la cobertura idiomática, por lo que el rendimiento en idiomas distintos del inglés puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del modelo base de Google.
- Dependencia del runtime: el modelo solo funciona con LiteRT-LM, lo que limita su portabilidad a otros frameworks (no es compatible con llama.cpp o vLLM sin conversión).
- Carga de módulos multimodales: los módulos de visión y audio se cargan bajo demanda, lo que puede introducir latencia adicional en la primera inferencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Modelo en ModelScope](https://www.modelscope.cn/models/litert-community/gemma-4-E2B-it-litert-lm)
- [Repositorio de LiteRT-LM en GitHub](https://github.com/google-ai-edge/LiteRT-LM)
- [Documentación de Gemma 4 en Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)
- [Blog sobre cuantización de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [App Google AI Edge Gallery (Android)](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery)
- [App Google AI Edge Gallery (iOS)](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337)
- [CLI de LiteRT-LM](https://ai.google.dev/edge/litert-lm/cli)
- [Demo web en Hugging Face Spaces](https://huggingface.co/spaces/tylermullen/Gemma4)
