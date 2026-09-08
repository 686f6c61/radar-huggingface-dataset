# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED

## Resumen

El modelo **Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED** es una variante cuantizada del modelo base **AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16**, desarrollada por **AEON-7 (Aeon Forge)** como una version de despliegue para entornos con presupuesto de VRAM limitado. Esta version utiliza una combinacion tecnica de mezcla de precisiones (NVFP4, FP8 y BF16) optimizada para GPUs Blackwell, como NVIDIA DGX Spark/GB10, RTX 5090 y RTX PRO 6000. El objetivo es ofrecer un modelo funcional para agentes, codificacion y razonamiento multimodal sin sacrificar demasiada calidad en tareas de programacion.

Aunque el nombre comercial indica 27B, los pesos reales en safetensors suman **19.869.895.920 parametros** (~19.9B). La arquitectura es hibrida, combinando **atencion lineal de tipo gated-deltanet (GDN)** con **mecanismos de atencion completa** y componentes de tipo Mamba. Incluye un **head de MTP (multi-token prediction)** para decodificacion especulativa y una torre de vision intacta, lo que lo convierte en un modelo multimodal.

La relevancia del modelo radica en su enfoque de **cuantizacion mixta pragmática**, que evita los problemas de la cuantizacion uniforme (que degrada la codificacion) al mantener capas criticas en FP8 o BF16. Segun el autor, la puntuacion AEON Bench Coding es de **0.833**, muy superior a la version cuantizada anterior (0.694) y por delante de la version stock de Unsloth NVFP4 (0.806).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (GDN), atencion completa y componentes estilo Mamba |
| Parametros totales | 19.869.895.920 |
| Parametros activos | No procede (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el autor menciona configuraciones de hasta 131k tokens en pruebas locales) |
| Tipos de cuantizacion | NVFP4 (W4A4), FP8 y BF16 (cuantizacion mixta) |
| Idiomas soportados | Ingles, chino y otros (multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura es un modelo textual-multimodal de tipo **hybrid-attention**, que combina capas de **gated-deltanet** con **atencion completa** y componentes de **atencion lineal/Mamba**. El modelo base BF16 fue sometido a un proceso de **abliteration** para eliminar rechazos y producir respuestas "uncensored", manteniendo coherencia y utilidad. Esta variante NVFP4-MIXED se ha cuantizado con la herramienta **NVIDIA ModelOpt**, aplicando una cuadricula de precision que asigna:

- **Capas MLP 0–55**: NVFP4 (W4A4)
- **Capas MLP 56–63**: FP8 (gate, up, down)
- **Atencion softmax y escritores GDN**: FP8
- **Torre de vision, head MTP, embeddings y lm_head**: BF16

El **head MTP** se incorporo despues de la exportacion mediante ModelOpt, usando 15 tensores BF16 del modelo base, ya que la cuantizacion lo habia eliminado. El autor indica que la calibracion se realizo con 1024x2048 muestras y que el proceso de exportacion verifico que todos los tensores estuvieran presentes. No se han publicado detalles sobre los datos de preentrenamiento originales, pero el modelo hereda las capacidades de la familia Qwen3.8.

## Capacidades

- **Generacion de texto y razonamiento**: soporta modos de pensamiento ("thinking") y respuestas directas.
- **Codificacion**: alto rendimiento en tareas de programacion segun benchmarks propios (AEON Bench Coding 0.833).
- **Tool calling / function calling**: soportado de forma nativa, con marcadores en los tags.
- **Soporte de agentes y razonamiento multi-step**: puntuaciones de 0.918 en Hermes y 0.818 en OpenCode.
- **Vision / multimodal**: integra torre de vision y preprocesador de video, permitiendo entradas imagen-texto.
- **Uncensored**: respuestas sin "rechazos" morales o filtros de seguridad, tal como indica el nombre.
- **Multilingue**: soporta ingles, chino y otros idiomas.
- **Decodificacion especulativa nativa**: gracias al head MTP, optimizada para GPUs RTX.

## Casos de uso

- **Asistente de codificacion en local**: se puede desplegar en una RTX 5090 o DGX Spark para generar, revisar y depurar codigo sin conexion. La cuantizacion mixta mantiene la fidelidad en las capas criticas, lo que reduce las probabilidades de fallos en tests unitarios.
- **Chatbot de atencion al cliente con tool calling**: gestiona conversaciones multi-turno y ejecuta herramientas externas (consultas de pedidos, devoluciones) mediante function calling, aprovechando el contexto largo.
- **Agente autor**: usado en entornos OpenCode o OpenClaw para automatizar tareas como revision de pull requests, generacion de parches o ejecucion de scripts. El modelo puede razonar paso a paso y llamar a funciones de forma fiable.
- **Analisis multimodal de imagenes tecnicas**: gracias a la torre de vision intacta, interpreta capturas de pantalla, diagramas de arquitectura o fotos de errores hardware, combinando la informacion visual con instrucciones textuales.
- **Generacion de contenido creativo sin filtros**: aplicaciones de escritura narrativa o roleplay donde se requiere evitar rechazos o restricciones automaticas. El proceso de abliteration elimina los mecanismos de negacion, lo que facilita respuestas ininterrumpidas.
- **Pipeline de CI/CD**: integracion con frameworks compatibles con OpenAI (vLLM) para generar codigo de pruebas automaticas o documentacion tecnica. El soporte de tool calling permite conectarlo con repositorios y ejecutar comandos en un sandbox.
- **Investigacion local de agentes**: prototipado de sistemas multiagente en GPUs de consumo (RTX 5090) donde la VRAM esta limitada a 24-32 GB, gracias al tamaño final de ~23.8 GB.

## Benchmarks y rendimiento

Los resultados presentados por el autor corresponden a la suite local **AEON Bench** ejecutada en un GB10 con vLLM. No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Se incluye la comparativa con la version anterior (Mix B):

| Benchmark local | This MIXED | Prior Mix B |
|---|---|---|
| Text mean | 0.782 | 0.759 |
| Coding | 0.833 | 0.694 |
| Hermes | 0.918 | ~0.917 |
| OpenClaw | 0.707 | 0.733 |
| OpenCode | 0.818 | 0.793 |

El autor tambien menciona que la version stock de Unsloth NVFP4 obtuvo **0.806** en Coding, mientras que este modelo alcanza 0.833. No obstante, el propio autor reconoce que la inteligencia general (matematicas, razonamiento, prosa) queda por detras del Qwen stock, con un composite de 84.5.

## Requisitos de hardware

- **VRAM estimada**: ~23.8 GB (4 shards), por lo que se requiere una GPU con al menos 24 GB de VRAM dedicada.
- **GPUs recomendadas**: NVIDIA DGX Spark / GB10 (sm_121a, arquitectura aarch64), RTX 5090 (sm_120) y RTX PRO 6000 (sm_120/amd64).
- **No apto para**: GPUs con menos de 24 GB de VRAM ni tarjetas de arquitecturas distintas a Blackwell (no se menciona compatibilidad con Ampere o Hopper).
- **Opciones de despliegue**: vLLM mediante imagenes Docker de **`ghcr.io/aeon-7/aeon-vllm-ultimate:latest`** (para Spark/GB10) y **`ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest`** (para RTX). No se recomienda cruzar ambas imagenes entre hardware distinto.
- **Latencia y throughput**: no disponible en la informacion proporcionada.
- **Compatibilidad con librerias**: transformers, vLLM (endpoint compatible con OpenAI).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Peso aproximado | AEON Bench Coding | Licencia |
|---|---|---|---|---|---|
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 19.869.895.920 | BF16 | ~54 GB | No benchmarked (fuente de verdad) | Apache 2.0 |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 19.869.895.920 | NVFP4+FP8+BF16 | ~23.8 GB | 0.833 | Apache 2.0 |
| Unsloth Qwen3.8 27B NVFP4 (referencia no oficial) | No disponible | NVFP4 | No disponible | 0.806 | No disponible |

La comparacion con el modelo BF16 es especialmente relevante: el BF16 es el maestro de precision completa, mientras que esta variante MIXED busca ofrecer un perfil de despliegue mas ligero. Los datos de Unsloth provienen de una comparativa citada por el autor y no se dispone de una ficha publica de ese modelo.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos concretos, pero al ser un modelo "uncensored" y abliterado, puede ser incapaz de rechazar peticiones perjudiciales. El riesgo de generacion de contenido nocivo es mayor que en modelos con filtros de seguridad.
- **Rendimiento cognitivo**: el autor admite que la inteligencia general (matematicas, razonamiento y prosa) va por detras del modelo Qwen stock. No es un modelo de maxima capacidad academica, sino orientado a tareas agil y de codificacion.
- **Puntos debiles**: OpenClaw es significativamente mas debil (0.707) que otras tareas agilicas, lo que puede limitar su uso en flujos que dependan de esa herramienta.
- **Restricciones de despliegue**: las imagenes vLLM para Spark y RTX son incompatibles entre si. Usar una imagen en el hardware equivocado puede provocar errores de carga (por ejemplo, el error `'MergedColumnParallelLinear' object has no attribute 'data'` en RTX con imagenes antiguas).
- **Compatibilidad**: la cuantizacion mixta con MTP requiere un stack de software especifico. Fuera de las imagenes oficiales de AEON, el despliegue puede fallar o perder el soporte de decodificacion especulativa.
- **Licencia**: Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede ser problematico en entornos con regulaciones de seguridad o politicas corporativas.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED>
- Modelo base BF16: <https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16>
- Publicacion oficial en Patreon: <https://www.patreon.com/AeonForge7/posts/official-release-168877910>
- Perfil de la organizacion AEON-7: <https://huggingface.co/AEON-7>
