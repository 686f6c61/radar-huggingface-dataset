# haik1999/gemma-4-E4B-it-litert-lm

## Resumen

El modelo `haik1999/gemma-4-E4B-it-litert-lm` es una conversión del modelo Gemma 4 E4B de Google al formato `.litertlm`, diseñado específicamente para su despliegue en dispositivos edge como Android, iOS, escritorio, IoT y web. El modelo original, `google/gemma-4-E4B-it`, pertenece a la familia Gemma de Google, construida a partir de la misma investigación y tecnología utilizada para los modelos Gemini. Esta versión ligera está optimizada para ejecutarse localmente en dispositivos, lo que permite acceso privado a IA generativa sin necesidad de conexión a internet.

El archivo del modelo tiene un tamaño de 3,66 GB, que incluye un decodificador de texto con 2,24 GB de pesos y 0,67 GB de parámetros de embedding. El framework LiteRT-LM mantiene los pesos principales en memoria mientras que los embeddings se mapean en memoria, lo que permite un ahorro significativo de memoria de trabajo en algunas plataformas. El modelo soporta hasta 32k tokens de contexto y está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en productos.

La relevancia de este modelo radica en su capacidad para llevar modelos de lenguaje de alto rendimiento a dispositivos con recursos limitados, manteniendo la privacidad de los datos al procesar todo localmente. Está respaldado por LiteRT-LM, el framework de Google que ya impulsa experiencias de IA en productos como Chrome, Chromebook Plus y Pixel Watch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere ~4B, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo Gemma 4 E4B. Se sabe que pertenece a la familia Gemma de Google, que utiliza arquitecturas transformer optimizadas para eficiencia. El modelo es de tipo texto a texto (text-to-text), aunque la model card menciona que los modelos de visión y audio se cargan bajo demanda, sin que estén documentados en esta versión específica.

El entrenamiento del modelo original no está descrito en la información disponible. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La conversión a formato `.litertlm` ha sido realizada por la comunidad (haik1999) y por `litert-community`, manteniendo la licencia Apache 2.0 del modelo base.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto coherente y contextualizado, siendo su función principal.
- Razonamiento: como modelo de la familia Gemma, se espera que tenga capacidades de razonamiento básico y avanzado, aunque no se especifican benchmarks concretos.
- Function calling: LiteRT-LM incluye soporte para function calling, lo que permite al modelo interactuar con APIs y herramientas externas.
- Inferencia en dispositivo: optimizado para ejecutarse en dispositivos edge con recursos limitados, sin necesidad de conexión a internet.
- Privacidad: al ejecutarse localmente, los datos del usuario no salen del dispositivo.
- Contexto largo: soporta hasta 32.000 tokens de contexto, lo que permite manejar conversaciones y documentos extensos.
- Multilingüismo: no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- Asistente personal en el móvil: el modelo puede integrarse en aplicaciones Android o iOS para ofrecer un asistente de texto que funcione sin conexión, respondiendo preguntas, redactando mensajes o resumiendo información de forma privada.
- Atención al cliente en dispositivos IoT: en dispositivos como altavoces inteligentes o kioscos, el modelo puede gestionar consultas de usuarios sin depender de servidores externos, reduciendo la latencia y garantizando la privacidad.
- Herramienta de productividad en escritorio: integrado en aplicaciones de escritorio, puede ayudar a redactar correos, generar informes o resumir documentos largos, aprovechando su contexto de 32k tokens.
- Aplicación de salud y bienestar: en dispositivos wearables o aplicaciones de salud, el modelo puede ofrecer recomendaciones personalizadas o responder preguntas frecuentes sin enviar datos sensibles a la nube.
- Educación offline: en entornos educativos con conectividad limitada, el modelo puede servir como tutor virtual, explicando conceptos, resolviendo dudas o generando ejercicios prácticos.
- Automatización de tareas en el navegador: gracias a LiteRT-LM, el modelo puede integrarse en extensiones de navegador para resumir artículos, extraer información o redactar respuestas, todo localmente.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden usar este formato para probar funcionalidades de IA generativa en dispositivos antes de escalar a modelos más grandes en la nube.

## Benchmarks y rendimiento

La información proporcionada incluye una sección de benchmarks en la model card, pero el contenido está truncado. Se menciona que las pruebas se realizaron con 1024 tokens de prefill y 256 tokens de decode, con una longitud de contexto de 2048 tokens, y que la inferencia en CPU se acelera mediante el delegado XNNPACK de LiteRT con 4 hilos. Sin embargo, no se proporcionan los resultados numéricos concretos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 3,66 GB en disco, con 2,24 GB de pesos y 0,67 GB de embeddings.
- Memoria en ejecución: los pesos principales se mantienen en memoria, mientras que los embeddings se mapean en memoria, lo que reduce el consumo de RAM en plataformas compatibles.
- CPU: la inferencia en CPU está acelerada mediante XNNPACK con 4 hilos, lo que permite ejecución en procesadores móviles y de escritorio estándar.
- GPU: no se especifican requisitos de GPU; el modelo está diseñado para CPU y aceleración mediante ML Drift para GPU en dispositivos compatibles.
- Dispositivos compatibles: Android, iOS, escritorio, IoT y web, a través del framework LiteRT-LM.
- Opciones de despliegue: LiteRT-LM CLI, Google AI Edge Gallery, integración directa en aplicaciones mediante las APIs de LiteRT-LM.
- Latencia y throughput: no se proporcionan datos numéricos en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo Gemma 4 E4B se posiciona como una opción ligera para dispositivos edge, compitiendo con otras familias como Phi de Microsoft o Qwen de Alibaba, pero no se ofrecen datos concretos de comparación.

No disponible.

## Limitaciones y advertencias

- Modelo de texto únicamente: aunque se menciona que los modelos de visión y audio se cargan bajo demanda, no están documentados en esta versión. Para capacidades multimodales, se recomienda migrar a `gemma-3n-E4B-it-litert-lm`.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido sesgado o alucinado, especialmente en temas sensibles o con información poco común.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que el rendimiento puede variar significativamente entre lenguas.
- Dependencia del framework: el modelo solo funciona con LiteRT-LM, lo que limita su uso a plataformas que soporten este framework.
- Rendimiento en dispositivos de gama baja: aunque está optimizado para edge, dispositivos con poca memoria o CPU lenta pueden experimentar latencias elevadas.
- Falta de documentación técnica: la información sobre arquitectura, entrenamiento y benchmarks es limitada, lo que dificulta una evaluación rigurosa del modelo.

## Enlaces

- [HuggingFace: haik1999/gemma-4-E4B-it-litert-lm](https://huggingface.co/haik1999/gemma-4-E4B-it-litert-lm)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Modelo en ModelScope: litert-community/gemma-4-E4B-it-litert-lm](https://www.modelscope.cn/models/litert-community/gemma-4-E4B-it-litert-lm)
- [GitHub: google-ai-edge/LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
- [Documentación de LiteRT-LM](https://ai.google.dev/edge/litert-lm/overview)
- [CLI de LiteRT-LM](https://ai.google.dev/edge/litert-lm/cli)
- [Google AI Edge Gallery (Android)](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery&pli=1)
- [Google AI Edge Gallery (iOS)](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337)
- [Demo web en HuggingFace Spaces](https://huggingface.co/spaces/tylermullen/Gemma4)
