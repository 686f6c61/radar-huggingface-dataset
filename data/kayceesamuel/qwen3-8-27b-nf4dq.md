# kayceesamuel/Qwen3.8-27B-NF4DQ

## Resumen

Qwen3.8-27B es un modelo de visión-lenguaje (VLM) denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Se presenta como un modelo de código abierto optimizado para hardware local, con especial énfasis en tareas de programación, flujos agénticos y automatización de oficina. Su arquitectura híbrida combina atención lineal en 48 de sus 64 capas con atención completa en las restantes, lo que reduce el coste computacional en contextos largos.

Esta ficha corresponde a la cuantización GGUF NF4 con doble cuantización (NF4DQ) publicada por el usuario kayceesamuel en Hugging Face. El modelo original soporta una ventana de contexto nativa de 262 000 tokens, extensible hasta 1 millón, e incorpora un vision tower para entrada multimodal y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su equilibrio entre capacidades multimodales, razonamiento configurable y eficiencia en hardware de consumo, lo que lo convierte en una opción atractiva para desarrolladores que necesitan desplegar un asistente de código o un agente autónomo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention transformer (linear attention en 48/64 capas, vision tower, MTP draft head) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | NF4 (4 bits) con doble cuantizacion (DQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 14,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa de 64 capas transformer con atención híbrida: 48 capas utilizan atención lineal (de menor coste computacional) y 16 capas conservan atención completa. Esta combinación permite manejar ventanas de contexto muy largas (262K nativos) con un coste de memoria y cómputo inferior al de un transformer convencional. Además, incorpora un vision tower para procesar imágenes y un cabezal MTP (Multi-Token Prediction) que habilita decodificación especulativa, acelerando la generación de texto.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación consultada. El modelo se distribuye con pesos abiertos bajo licencia Apache-2.0, lo que permite su uso comercial y su adaptación mediante fine-tuning.

La cuantización NF4DQ publicada en este repositorio reduce el tamaño de los pesos a aproximadamente 14,2 GB, manteniendo la arquitectura completa del modelo original, incluido el vision tower y el cabezal MTP.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas exactos no especificados).
- Comprensión de imágenes (visión) gracias al vision tower integrado.
- Generación de código en múltiples lenguajes de programación, con soporte para tareas de programación complejas.
- Razonamiento configurable: el modelo puede operar en modo estándar o en modo de razonamiento extendido (thinking mode) según la configuración.
- Soporte de flujos agénticos (agentic workflows) con razonamiento multi-paso y planificación de tareas.
- Automatización de oficina: resumen de documentos, generación de informes, extracción de información.
- Decodificación especulativa mediante el cabezal MTP, que acelera la inferencia en entornos compatibles.
- Ventana de contexto nativa de 262K tokens, ampliable a 1M, adecuada para documentos extensos y conversaciones de largo recorrido.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo (IDE, CLI) para autocompletar código, generar funciones y explicar fragmentos. Su capacidad de razonamiento y su contexto largo permiten manejar proyectos completos sin perder el hilo.
- Agente autónomo de automatización de oficina: gracias a su soporte de flujos agénticos, puede procesar correos, redactar respuestas, resumir actas y gestionar calendarios mediante llamadas a herramientas externas.
- Análisis de documentos legales o técnicos extensos: con 262K tokens de contexto, puede leer contratos, informes o papers completos y extraer cláusulas, riesgos o conclusiones sin necesidad de dividir el texto.
- Chatbot de atención al cliente con memoria de conversación larga: la ventana de contexto amplia permite mantener el historial completo de una interacción de varias horas sin truncamiento.
- Generación de informes a partir de datos e imágenes: al ser multimodal, puede analizar capturas de pantalla, gráficos o diagramas y generar descripciones o resúmenes textuales.
- Investigación y revisión bibliográfica: el modelo puede resumir múltiples artículos, comparar metodologías y extraer referencias relevantes, ayudando a investigadores en fases de revisión de literatura.
- Despliegue en hardware de consumo: gracias a la cuantización NF4 (14,2 GB), puede ejecutarse en GPUs de 16 GB o 24 GB, lo que lo hace viable para estaciones de trabajo locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta cuantización ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización NF4 (14,2 GB de pesos), se requieren al menos 16 GB de VRAM para ejecutar el modelo con contexto moderado (4K-8K tokens). Para contextos de 262K tokens, la memoria de caché KV puede superar los 24 GB, por lo que se recomienda una GPU con 32 GB o más, o el uso de offloading a CPU.
- GPU recomendadas: RTX 4090 (24 GB) para contextos medios; A100 40 GB o H100 para contextos largos y despliegue en producción.
- Compatibilidad con GPU de consumo: sí, en RTX 3090/4090 (24 GB) con contexto reducido; en RTX 4080 (16 GB) con cuantización adicional o contexto muy corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-inference (TGI) si se convierte a safetensors.
- Latencia y throughput: no disponible. La decodificación especulativa del cabezal MTP puede acelerar la generación entre 1,5x y 2x en implementaciones que la soporten, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (NF4DQ) | 27,3 B | 262K (1M ext.) | Apache-2.0 | GGUF | Multimodal, atención híbrida, MTP |
| Qwen2.5-27B (si existe) | No disponible | No disponible | Apache-2.0 | No disponible | Modelo anterior de la serie Qwen |
| Gemma 2 27B | 27 B | 8K | Gemma license | Safetensors | Solo texto, sin visión |
| Llama 3.1 8B | 8 B | 128K | Llama license | Safetensors/GGUF | Menor tamaño, contexto largo |

No se dispone de datos de rendimiento comparativo entre estos modelos en las fuentes consultadas. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como cualquier LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La cuantización NF4 introduce una ligera degradación de calidad respecto al modelo en precisión completa (BF16/FP16). Para tareas que requieran máxima precisión, se recomienda usar los pesos originales.
- El modelo es multimodal, pero la cuantización GGUF puede no incluir el vision tower en todas las implementaciones. Es necesario verificar que el runtime utilizado soporte entrada de imágenes.
- La ventana de contexto de 262K tokens requiere una gestión cuidadosa de la memoria: el coste de la caché KV crece linealmente con el contexto, y en GPUs de 24 GB puede ser necesario reducir el contexto a 32K-64K tokens.
- La licencia Apache-2.0 permite uso comercial, pero no se proporcionan garantías sobre el comportamiento del modelo en entornos de producción. Se recomienda realizar pruebas exhaustivas antes de desplegarlo en servicios críticos.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, lo que sugiere que la cuantización no ha sido ampliamente validada por la comunidad. Se recomienda verificar la integridad de los pesos y probar el modelo en un entorno controlado antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kayceesamuel/Qwen3.8-27B-NF4DQ
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
