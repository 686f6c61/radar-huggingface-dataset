# EKTOMORF/gemma-4-E4B-it-litert-lm

## Resumen

Este repositorio aloja el modelo Gemma 4 E4B de Google en formato `.litertlm`, una conversión del modelo `google/gemma-4-E4B-it` realizada por el usuario EKTOMORF para su despliegue directo en dispositivos Android, iOS, escritorio, IoT y web mediante el framework LiteRT-LM. El modelo está diseñado para ejecutarse localmente sin conexión a internet, lo que garantiza privacidad y baja latencia en escenarios de borde.

Gemma 4 E4B es un modelo pequeño de la familia Gemma 4 de Google, orientado a tareas de razonamiento, codificación, agentes y comprensión multimodal. Según la model card, el archivo del modelo ocupa 3,66 GB, con 2,24 GB de pesos del decodificador de texto y 0,67 GB de parámetros de embeddings. Además, el modelo incluye componentes de visión y audio que se cargan dinámicamente según la necesidad, reduciendo el consumo de memoria en ejecución.

La relevancia de este modelo reside en su capacidad para llevar IA generativa a entornos sin GPU, con soporte para contextos de hasta 32 768 tokens y una integración optimizada con el runtime LiteRT de Google, que ofrece aceleración por CPU (XNNPack) y GPU (ML Drift). Es una opción práctica para desarrolladores que buscan desplegar asistentes, chatbots o herramientas de codificación en dispositivos de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (basada en Gemma 4, no se especifican detalles en la información) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | 32 768 tokens (soporte máximo) |
| Tipos de cuantización | No disponible (el formato `.litertlm` puede incluir cuantización, pero no se indica) |
| Idiomas soportados | No disponible (Gemma es multilingüe, pero no se confirma para esta versión) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo `google/gemma-4-E4B-it`. Se sabe que pertenece a la familia Gemma 4 de Google, diseñada para ofrecer rendimiento de nivel frontera en tamaños pequeños, con foco en razonamiento, agentes, codificación y comprensión multimodal. El modelo incluye un decodificador de texto y módulos de visión y audio que se cargan bajo demanda, lo que sugiere una arquitectura multimodal con componentes separados.

No se han publicado datos sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF/DPO). El modelo se distribuye como una conversión del modelo original al formato `.litertlm`, que es una capa de orquestación sobre LiteRT. LiteRT-LM gestiona la caché KV, el plantillado de prompts y el function calling, lo que facilita la integración en aplicaciones de producción.

## Capacidades

- Generación de texto, razonamiento y comprensión de lenguaje natural.
- Soporte de function calling / tool calling, según la documentación de LiteRT-LM.
- Capacidades multimodales: visión y audio, con carga dinámica de los módulos correspondientes.
- Adecuado para flujos de trabajo agénticos y razonamiento de múltiples pasos.
- Ejecución en local sin conexión a internet, lo que garantiza privacidad de datos.
- Optimizado para dispositivos móviles, IoT y escritorio mediante el framework LiteRT-LM.
- Compatible con la aceleración de hardware mediante XNNPACK en CPU y ML Drift en GPU.

## Casos de uso

- Asistentes personales en dispositivos móviles: el modelo puede ejecutarse en Android o iOS sin conexión, ofreciendo respuestas y tareas de razonamiento con privacidad total, gracias a su tamaño reducido y su soporte de contexto largo.
- Atención al cliente automatizada en entornos sin servidor: con una ventana de contexto de hasta 32K tokens, puede gestionar conversaciones multi-turno y consultas complejas en dispositivos locales.
- Herramientas de codificación en el dispositivo: el soporte de function calling permite integrar el modelo en editores de código o IDEs para autocompletado, generación de pruebas o explicación de código, sin necesidad de enviar datos a la nube.
- Análisis de documentos y visión en el borde: el módulo de visión permite procesar imágenes, extraer texto o describir contenido en aplicaciones de IoT o móviles.
- Asistencia por voz en tiempo real: el modelo de audio puede utilizarse para transcripción o respuesta de voz en dispositivos sin conexión.
- Prototipado de agentes autónomos en entornos de desarrollo: con function calling y razonamiento multi-paso, se puede usar para experimentar con agentes que interactúan con APIs o herramientas locales.
- Aplicaciones de IoT con procesamiento de lenguaje natural: por su pequeño tamaño y ejecución eficiente, es apto para dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se realizaron pruebas con 1024 tokens de prefill y 256 tokens de decode, con un contexto de 2048 tokens, pero no se incluyen métricas concretas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El archivo del modelo ocupa 3,66 GB, por lo que puede caber en dispositivos con al menos 4 GB de RAM.
- Ejecución en CPU con el delegate XNNPACK de LiteRT, usando 4 hilos para inferencia.
- Aceleración por GPU mediante ML Drift en plataformas compatibles.
- No requiere GPU dedicada; puede funcionar en móviles, tablets, Raspberry Pi o escritorios con recursos básicos.
- Despliegue mediante el CLI de LiteRT-LM o la aplicación Google AI Edge Gallery.
- Latencia y throughput no especificados en la documentación disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otros de su categoría. El modelo base `google/gemma-4-E4B-it` no tiene una ficha técnica pública en HuggingFace, y no se han publicado resultados de rendimiento comparativos.

## Limitaciones y advertencias

- Al ser una conversión de un modelo de Google, es posible que herede los sesgos y limitaciones de la familia Gemma, aunque no se han documentado específicamente para esta versión.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o generación de código.
- La ventana de contexto máxima es de 32K tokens, pero el rendimiento óptimo se logra con contextos más cortos (las pruebas se realizaron con 2048 tokens).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de uso de Google para los modelos Gemma.
- No se garantiza la compatibilidad con todos los dispositivos; es necesario verificar los requisitos de LiteRT-LM para cada plataforma.
- El modelo está en fase de "0 descargas" en HuggingFace, por lo que no se ha validado ampliamente en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EKTOMORF/gemma-4-E4B-it-litert-lm
- Model card original: https://huggingface.co/google/gemma-4-E4B-it
- Documentación de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- Repositorio de LiteRT-LM en GitHub: https://github.com/google-ai-edge/LiteRT-LM
- Página de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Demo web: https://huggingface.co/spaces/tylermullen/Gemma4
