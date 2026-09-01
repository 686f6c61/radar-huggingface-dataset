# massif/Qwen3-1.7B-CoreAI-ANE-W8-4K-h16p

## Resumen

Este repositorio contiene una conversión comunitaria del modelo Qwen3-1.7B al formato Apple Core AI, compilada de forma anticipada (AOT) para el chip A17 Pro (identificador `h16p`) con preferencia de ejecución en el Neural Engine de Apple. El artefacto está pensado para su uso en iOS 27 mediante la API `LanguageModelSession`, y permite ejecutar un modelo de lenguaje de 1.700 millones de parámetros íntegramente en el dispositivo, sin conexión a servidores externos.

La conversión emplea una cuantización W8 por tensor mediante paletización K-means para las proyecciones del transformer, con embedding separado en INT8 y cómputo en FP16. El contexto máximo es de 4.096 tokens, con una caché KV fija de 448 MiB. El autor, identificado como `massif`, ha publicado el artefacto bajo licencia Apache 2.0, junto con un repositorio de reproducción y un conjunto de pruebas de validación en un iPhone 15 Pro con iOS 27.

La relevancia de este trabajo radica en que demuestra la viabilidad de ejecutar modelos generativos de tamaño medio en el Neural Engine de Apple mediante la ruta estática de Core AI, superando las limitaciones de las conversiones dinámicas basadas en GPU. No obstante, se trata de una iniciativa de la comunidad, no de un lanzamiento oficial de Apple ni de Qwen, y no se reclama superioridad de rendimiento frente a otras rutas de ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | W8 per-tensor (paletizacion K-means), embedding INT8, compute FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (fuente) y `.mlirb` (compilado AOT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso desarrollado por Alibaba. La model card no proporciona detalles sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La contribución de este repositorio se centra en la conversión y compilación para Apple Core AI.

El proceso de conversión aplica una cuantización W8 por tensor mediante paletización K-means a las proyecciones del transformer, con un embedding separado cuantizado a INT8. El cómputo se realiza en FP16 y la caché KV es de tamaño fijo en FP16 (448 MiB para 4K de contexto). El artefacto se compiló con `coreai-build-3600.83.1` de Xcode 27 Beta 6, generando 34 funciones AOT. La selección de W8 se realizó mediante un umbral numérico congelado: se rechazaron múltiples candidatos W4 y mixtos W4/W8 antes de fijar el mecanismo final.

## Capacidades

- Generación de texto: al ser una conversión de Qwen3-1.7B, hereda las capacidades de generación de lenguaje del modelo base, aunque la model card no detalla tareas específicas.
- Ejecución on-device: el artefacto está diseñado para ejecutarse íntegramente en el Neural Engine de un iPhone 15 Pro, sin necesidad de conexión a internet.
- Inferencia con contexto fijo: soporta hasta 4.096 tokens de contexto, con caché KV preasignada.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la model card.

## Casos de uso

- Asistente de redacción en aplicaciones de correo electrónico: el modelo puede generar borradores de respuestas en el dispositivo, sin enviar datos a la nube, gracias a su ejecución local en el Neural Engine.
- Autocompletado de texto en teclados de iOS: al ser un modelo de 1.7B con contexto de 4K, puede sugerir continuaciones de frases en tiempo real con baja latencia.
- Resumen de documentos en local: aplicaciones de productividad pueden resumir artículos o notas directamente en el iPhone, preservando la privacidad de los datos.
- Chatbot educativo sin conexión: estudiantes pueden interactuar con un asistente de preguntas y respuestas en entornos sin cobertura, usando el modelo embebido en la app.
- Generación de respuestas en atención al cliente: apps de soporte pueden ofrecer respuestas automáticas a consultas frecuentes sin depender de servidores externos.
- Traducción de frases cortas: si el modelo base soporta múltiples idiomas (no confirmado en la model card), podría utilizarse para traducción instantánea en modo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de fidelidad de conversión, que miden la similitud entre el modelo cuantizado y el original sin comprimir:

| Evaluacion | Media logits coseno | Minimo coseno | Acuerdo top-1 | Delta NLL medio |
| --- | ---: | ---: | ---: | ---: |
| Conjunto de ajuste W8 | 0.997067 | 0.967261 | 98.44% | 0.002985 |
| Conjunto de validacion congelado W8 | 0.996598 | 0.959625 | 98.37% | 0.003167 |

Estas métricas indican una alta fidelidad de la conversión, pero no constituyen un benchmark de rendimiento general. No se reclama una perplexity completa de WikiText-2.

## Requisitos de hardware

- Dispositivo compatible: iPhone 15 Pro (chip A17 Pro, identificador `h16p`) con iOS 27 (build `24A5424a` en las pruebas).
- Memoria: pico de memoria residente de 2.737 MiB durante la carga, y 448 MiB para la caché KV fija a 4K de contexto.
- No requiere GPU externa ni hardware adicional; el modelo se ejecuta en el Neural Engine.
- Opciones de despliegue: integración mediante Apple Core AI y `LanguageModelSession` en una app iOS. No se mencionan otros runtimes como vLLM, llama.cpp u Ollama.
- Latencia y throughput: el experimento Run J registró 120/120 generaciones completadas en tres formas de carga de trabajo, pero no se publican cifras concretas de latencia o tokens por segundo en la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El repositorio de GitHub menciona un archivo `RELATED_WORK.md` con comparaciones con artefactos comunitarios adyacentes, pero su contenido no se ha incluido en la documentación disponible.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Apple ni de Qwen; se trata de una conversión comunitaria.
- El artefacto está compilado exclusivamente para A17 Pro (`h16p`); no es compatible con otros chips de Apple.
- No se reclama que el Neural Engine sea universalmente más rápido que la GPU; no se ha realizado una comparación controlada de energía o rendimiento entre ambas rutas.
- Las métricas de fidelidad de conversión no son un benchmark general de calidad del modelo; solo indican la similitud con el modelo original sin comprimir.
- No se ha completado la evaluación de perplexity en WikiText-2.
- La model card no especifica los idiomas soportados ni las capacidades multilingües del modelo convertido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B puede tener sus propias restricciones; se recomienda revisar la licencia del modelo original.

## Enlaces

- [Hugging Face - massif/Qwen3-1.7B-CoreAI-ANE-W8-4K-h16p](https://huggingface.co/massif/Qwen3-1.7B-CoreAI-ANE-W8-4K-h16p)
- [Repositorio de reproducción y pruebas - massif-01/qwen3-1.7b-coreai-ios](https://github.com/massif-01/qwen3-1.7b-coreai-ios)
- [Solicitud upstream en Apple - apple/coreai-models#116](https://github.com/apple/coreai-models/issues/116)
