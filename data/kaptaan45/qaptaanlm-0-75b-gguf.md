# kaptaan45/QaptaanLM-0.75B-GGUF

## Resumen

QaptaanLM-0.75B es un modelo de lenguaje compacto de 752 millones de parámetros desarrollado por kaptaan45 (Rudransh Shekhar), especializado en generación de código fuente, razonamiento técnico y comprensión de código de contexto largo. Su arquitectura híbrida combina atención lineal (Gated DeltaNet) con Grouped Query Attention (GQA) en 24 capas, lo que permite una mayor eficiencia computacional frente a transformers con atención completa de tamaño similar. Este repositorio en concreto contiene la colección completa de cuantizaciones GGUF del modelo base, diseñadas para su ejecución local mediante llama.cpp y Ollama, con opciones que van desde FP16 sin pérdida hasta Q2_K de máxima compresión. Es relevante ahora porque ofrece una alternativa ligera y de código abierto (licencia Apache-2.0) para tareas de programación asistida en entornos con recursos limitados, como portátiles, dispositivos edge o GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Linear Attention (Gated DeltaNet) + GQA, 24 capas |
| Parametros totales | 752.393.024 (~752M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (orientado a codigo fuente; probablemente ingles y lenguajes de programacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repo); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base QaptaanLM-0.75B emplea una arquitectura híbrida que combina atención lineal basada en Gated DeltaNet con Grouped Query Attention (GQA). Esta combinación busca reducir el coste computacional de la atención tradicional manteniendo la capacidad de modelar dependencias de largo alcance, lo que resulta especialmente útil para comprender código fuente extenso. El modelo cuenta con 24 capas y 752M parámetros en total. Se describe como un modelo de "Continued Pre-Training (CPT)", lo que sugiere que parte de un checkpoint previo y se sigue pre-entrenando con datos adicionales, aunque no se han publicado detalles sobre la composición del dataset, el número de tokens empleados ni las técnicas de alineación (RLHF, DPO, etc.) en la información disponible. El autor también ha publicado un dataset de instrucciones de 100M de tokens (KapInstruct-100M) orientado al fine-tuning de modelos pequeños, pero no se confirma que se haya utilizado para este modelo.

## Capacidades

- Generación de código fuente en múltiples lenguajes de programación (no se especifica cuáles).
- Razonamiento técnico: resolución de problemas algorítmicos, explicación de fragmentos de código y depuración.
- Comprensión de código de contexto largo gracias a la atención lineal, que permite manejar secuencias extensas con menor coste.
- Generación de texto general (pipeline text-generation), aunque su optimización principal es el dominio técnico.
- No se menciona soporte explícito de tool calling, function calling ni capacidades de agente.
- No se indica soporte multimodal ni capacidades de visión o audio.
- Capacidades multilingües no documentadas; probablemente limitadas a inglés y lenguajes de programación.

## Casos de uso

- Autocompletado de código en editores: el modelo puede sugerir completaciones de funciones, bucles o estructuras de datos en tiempo real, aprovechando su tamaño reducido para funcionar en local sin latencia perceptible.
- Asistente de programación en entornos offline: ideal para desarrolladores que trabajan en redes aisladas o con políticas de privacidad estrictas, ya que se puede desplegar completamente en local.
- Generación de scripts y utilidades: a partir de una descripción en lenguaje natural, el modelo puede producir scripts de automatización o fragmentos de código para tareas concretas.
- Documentación automática de código: puede generar comentarios y descripciones de funciones a partir del código fuente, facilitando el mantenimiento de proyectos.
- Análisis estático básico: el modelo puede identificar posibles errores o patrones problemáticos en fragmentos de código, aunque con las limitaciones propias de un modelo de 0.75B.
- Chat técnico de bajo coste: integrado en aplicaciones de soporte o foros, puede responder preguntas técnicas frecuentes con un consumo de recursos mínimo.
- Prototipado rápido: en entornos de desarrollo con GPU limitada (por ejemplo, una RTX 3060 o incluso CPU), permite iterar sobre ideas de código sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Se recomienda realizar pruebas propias en los casos de uso previstos.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. Según los tamaños de archivo indicados:
  - FP16/BF16: ~1,5 GB, requiere al menos 2 GB de VRAM.
  - Q8_0: ~800 MB, cabe en GPUs con 1-2 GB de VRAM.
  - Q5_K_M: ~550 MB, recomendado para tarjetas con 1 GB o menos.
  - Q4_K_M: ~460 MB, apto para móviles y dispositivos edge.
  - Q3_K_M: ~380 MB y Q2_K: ~290 MB, para entornos con RAM muy limitada.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, Apple M1/M2). También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp, Ollama (con integración directa desde Hugging Face), y potencialmente vLLM si se añade soporte para la arquitectura Gated DeltaNet.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 0.75B, en una GPU moderna se esperan decenas de tokens por segundo con cuantizaciones de 4-5 bits.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Los modelos de tamaño similar más comunes en el ecosistema open source son Qwen2.5-0.5B, SmolLM-360M y TinyLlama-1.1B, pero no hay información pública que permita una comparación rigurosa con QaptaanLM-0.75B. Se recomienda evaluar cada modelo en las tareas específicas de interés.

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| QaptaanLM-0.75B | 752M | Híbrida (Gated DeltaNet + GQA) | No disponible | Apache-2.0 |
| Qwen2.5-0.5B | 494M | Transformer estándar | 32K | Apache-2.0 |
| SmolLM-360M | 360M | Transformer estándar | 2K | Apache-2.0 |

## Limitaciones y advertencias

- Modelo de tamaño muy reducido (0.75B): su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos de varios miles de millones de parámetros.
- Riesgo de alucinación: puede generar código sintácticamente válido pero funcionalmente incorrecto, especialmente en tareas que requieren lógica avanzada.
- Sesgos no documentados: no se ha publicado información sobre evaluación de sesgos o alucinaciones en el modelo.
- Idiomas no especificados: aunque está orientado a código, no se garantiza un buen rendimiento en idiomas distintos del inglés.
- Longitud de contexto desconocida: no se ha indicado el máximo de tokens que puede procesar, lo que dificulta estimar su comportamiento en entradas muy largas.
- Sin garantías de soporte para tool calling o agentes: no se mencionan estas capacidades, por lo que no se recomienda su uso en pipelines que las requieran.
- Licencia Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-GGUF
- Modelo base (safetensors): https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- Perfil del autor: https://huggingface.co/kaptaan45
- Dataset KapInstruct-100M: https://www.kaggle.com/datasets/kaptaan45/kapinstruct-100m
