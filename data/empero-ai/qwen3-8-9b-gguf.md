# empero-ai/Qwen3.8-9B-GGUF

## Resumen

Qwen3.8-9B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.8-9B, desarrollado por Empero (empero.org). Se trata de una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura de Qwen3.5-9B, entrenada con aproximadamente 70.000 trazas de profesor curadas de los datasets internos de destilación de Qwen3.8. El resultado es un modelo de razonamiento de ~9,2 mil millones de parámetros con licencia Apache-2.0.

La relevancia de esta ficha reside en que ofrece cuantizaciones listas para ejecutar en runtimes GGUF estándar (llama.cpp, Ollama, LM Studio, Jan, KoboldCpp), lo que permite desplegar un modelo de razonamiento con capacidades cercanas a un modelo mucho mayor en hardware de consumo. La arquitectura es híbrida: por cada tres capas de atención completa hay tres capas Gated DeltaNet, lo que exige una build reciente de llama.cpp con soporte para Qwen3.5/Gated DeltaNet.

El modelo es un reasoning model: cada respuesta comienza con un bloque de pensamiento (`thinking`) que debe eliminarse para el usuario final. Los resultados destacados incluyen una mejora de +0,205 en MMLU (CoT) frente a la base Qwen3.5-9B, alcanzando 0,751.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 capas Gated DeltaNet por cada capa de atención completa (clase Qwen3.5) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (~5,8 GB), Q5_K_M (~6,7 GB), Q6_K (~7,8 GB), Q8_0 (~10 GB), BF16 (~19 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.8-9B hereda la arquitectura híbrida de la familia Qwen3.5: intercala tres capas Gated DeltaNet por cada capa de atención completa. Esta combinación reduce el coste del cache de clave-valor en contextos largos manteniendo la capacidad de atención selectiva donde es necesaria. El modelo es una destilación de parámetros completos del profesor Qwen3.8 2.4T A95B, entrenado sobre ~70.000 trazas de profesor curadas de los datasets internos de destilación de Empero.

El entrenamiento se centró en protocolos de razonamiento (CoT), y los pesos se publican bajo Apache-2.0, heredado de la base Qwen. Las cuantizaciones GGUF se generaron con llama.cpp y conservan la plantilla de chat incrustada en el archivo. Al ser un modelo de razonamiento, cada respuesta abre con un bloque `thinking` que conviene eliminar antes de mostrar al usuario final; se recomienda un valor generoso de `-n` en llama.cpp para dar espacio al razonamiento.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (CoT) integrada: el modelo produce un bloque `thinking` antes de la respuesta final.
- Razonamiento matemático: 0,870 en GSM8K (CoT), con resultados comparables a la base Qwen3.5-9B.
- Conocimiento general y razonamiento multidisciplinar: 0,751 en MMLU (CoT, 57 materias), muy por encima de la base.
- Chat conversacional multi-turno mediante plantilla de chat incrustada en el GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo razonamiento CoT es compatible con flujos de razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés declarado en la model card.
- Capacidades especiales: modo de razonamiento con bloque `thinking`; arquitectura híbrida Gated DeltaNet que reduce el coste del cache KV en contextos largos.

## Casos de uso

- Asistentes de razonamiento en inglés: el modelo puede resolver problemas que requieren varios pasos lógicos gracias a su modo CoT integrado, mostrando al usuario la respuesta final tras un bloque de razonamiento que puede ocultarse en la interfaz.
- Generación de respuestas explicativas en documentación técnica: con 0,751 en MMLU, puede redactar explicaciones sobre ciencia, historia o tecnología con un nivel de precisión notable para su tamaño.
- Resolución de problemas matemáticos y de programación en entornos educativos: su 0,870 en GSM8K lo hace adecuado para tutores automáticos que expliquen el proceso de resolución paso a paso.
- Despliegue en edge o hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de 8-12 GB, permitiendo ejecutar un modelo de razonamiento localmente sin conexión a la nube.
- Prototipado rápido con Ollama o LM Studio: al ser un GGUF con plantilla de chat incrustada, puede cargarse directamente en estos runtimes para pruebas de concepto de chatbots o asistentes sin infraestructura compleja.
- Fine-tuning o evaluación de destilación: al ser una destilación de un modelo de 2,4T de parámetros, sirve como referencia para estudiar técnicas de compresión de conocimiento y comparar el rendimiento de modelos destilados frente a sus profesores.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo fuente (protocolos CoT, `lm-evaluation-harness`, mismas condiciones base vs. estudiante):

| Tarea | Qwen3.5-9B (base) | Qwen3.8-9B | Δ |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,546 | **0,751** | **+0,205** |
| GSM8K (CoT) | 0,885 | 0,870 | −0,015 |

No se han publicado resultados adicionales de benchmarks (HumanEval, GPQA, etc.) en la información disponible. Los datos corresponden al modelo fuente en precisión completa; las cuantizaciones GGUF pueden presentar ligeras variaciones.

## Requisitos de hardware

- Q4_K_M (~5,8 GB) y Q5_K_M (~6,7 GB): cómodos en tarjetas de 8-12 GB para uso cotidiano, con contexto moderado.
- Q6_K (~7,8 GB) y Q8_0 (~10 GB): recomendados 12-16 GB de VRAM.
- BF16 (~19 GB): requiere 24 GB o más de VRAM.
- El cache KV es el coste dominante en contextos largos; puede requerir offload a CPU aunque los pesos quepan en GPU.
- Runtimes soportados: llama.cpp (build reciente con soporte Qwen3.5/Gated DeltaNet), Ollama, LM Studio, Jan, KoboldCpp.
- Parámetros de muestreo recomendados por el autor: `temperature=0.6, top_p=0.95, top_k=20`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---:|---|---:|---:|---|
| **Qwen3.8-9B** | ~9,2 B | Híbrida Gated DeltaNet + atención | **0,751** | 0,870 | Apache-2.0 |
| Qwen3.5-9B (base) | ~9 B | Híbrida Gated DeltaNet + atención | 0,546 | 0,885 | Apache-2.0 |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T (A95B activos) | MoE | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card, ya que no se dispone de datos de otros modelos de la misma categoría en la información proporcionada. La destilación mejora sustancialmente el MMLU respecto a la base con una pérdida mínima en GSM8K.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no se garantiza un rendimiento fiable en otros idiomas.
- Requiere una build reciente de llama.cpp con soporte para Qwen3.5/Gated DeltaNet; builds antiguas fallarán al cargar la arquitectura.
- El modelo es de razonamiento: cada respuesta incluye un bloque `thinking` que debe eliminarse para el usuario final, lo que aumenta la latencia percibida y el consumo de tokens de salida.
- Longitud de contexto no especificada en la información disponible; el cache KV es el coste dominante en contextos largos y puede requerir offload.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de veracidad.
- No se dispone de datos sobre tool calling, funciones de agente o capacidades multimodales.
- Las cuantizaciones Q4_K_M y Q5_K_M pueden degradar ligeramente la precisión respecto al modelo en BF16, especialmente en tareas de razonamiento largo.
- La licencia Apache-2.0 permite uso comercial, pero los pesos se comparten "as-is" sin garantías por parte de Empero.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-9B-GGUF
- Modelo fuente (precisión completa): https://huggingface.co/empero-ai/Qwen3.8-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio web de Empero: https://empero.org
