# liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF

## Resumen

`liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF` es un conjunto de cuantizaciones GGUF del modelo `unsloth/Llama-3.2-1B-Instruct`, una versión optimizada del modelo instruct de 1.000 millones de parámetros de Meta (Llama-3.2-1B-Instruct). El autor, Liodon AI, ha aplicado la técnica de calibración iMatrix, que asigna mayor precisión a los pesos más relevantes para la tarea, mejorando la coherencia y el seguimiento de instrucciones en cuantizaciones de 2 a 4 bits. El resultado es un paquete de archivos GGUF de entre 0,52 GB y 1,32 GB, pensado para ejecución local en hardware de bajos recursos.

Este modelo resuelve el problema de desplegar un asistente de lenguaje en entornos con limitaciones de VRAM o memoria, manteniendo una calidad aceptable mediante cuantizaciones sub-4-bit calibradas con iMatrix. Su relevancia actual radica en la creciente demanda de modelos pequeños y eficientes para aplicaciones locales, como asistentes personales, chatbots en dispositivos edge o pipelines de generación de texto en entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, no disponible el detalle exacto) |
| Parametros totales | 1.235.814.432 (1,24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la información) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ3_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Llama-3.2-1B-Instruct`, una versión ajustada por instrucciones (instruct-tuned) del Llama-3.2-1B de Meta, con arquitectura transformer decoder-only y entrenamiento supervisado con refinamiento por preferencias (RLHF/DPO). La cuantización se realiza mediante la herramienta llama.cpp, que convierte los pesos safetensors a formato GGUF, aplicando calibración iMatrix.

El proceso iMatrix evalúa 128 bloques de calibración (2M tokens de WikiText-103) sobre el modelo en precisión completa para identificar qué pesos son más críticos, asignándoles mayor precisión en la cuantización. Esto permite que las versiones de 2 y 3 bits (IQ2_M, IQ3_M) mantengan una coherencia y capacidad de seguir instrucciones notablemente mejores que una cuantización estándar al mismo tamaño de archivo. No se especifica si se realizó entrenamiento adicional más allá de la cuantización.

## Capacidades

- Generación de texto y seguimiento de instrucciones, al ser una cuantización del modelo instructivo Llama-3.2-1B-Instruct.
- Ejecución local eficiente en CPU o GPU de baja potencia gracias a los formatos GGUF y cuantizaciones sub-4-bit.
- Compatible con frameworks de inferencia como llama.cpp, Ollama y LM Studio (según la model card).
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.
- Soporte multilingüe no documentado en la información del repositorio.

## Casos de uso

- Asistentes de chat locales: con la cuantización Q4_K_M o IQ3_M, se puede desplegar un asistente conversacional en un portátil con 1 GB de VRAM o en una CPU, gracias a su tamaño reducido y compatibilidad con llama.cpp y Ollama.
- Prototipado rápido de aplicaciones de NLP: su bajo peso permite iterar en entornos de desarrollo sin GPU, probando flujos de generación de texto antes de escalar a modelos mayores.
- Clasificación de texto y extracción de entidades: el modelo instruct puede adaptarse para tareas de clasificación de sentimientos, etiquetado de temas o extracción de información, ejecutándose en batch en CPUs.
- Generación de código básico: aunque no se especifica, el modelo base tiene capacidad de generar código; la versión cuantizada permite integrarlo en pipelines de CI/CD locales para autocompletar o generar esqueletos de funciones.
- Automatización de respuestas en entornos sin conexión: en aplicaciones de atención al cliente o sistemas internos que requieren privacidad, el modelo puede ejecutarse en un servidor local con una GPU modesta (ej. RTX 3060) con cuantización Q6_K para casi pérdida de calidad.
- Educación y experimentación: por su tamaño, es ideal para enseñar conceptos de cuantización y despliegue local de LLMs, permitiendo comparar la calidad entre quants de 2, 3 y 4 bits en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otros para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: entre 1 GB y 2 GB según la cuantización (según la tabla del autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (ej. GTX 1650, RTX 3060, Apple Silicon) o incluso CPU con 4 GB de RAM para quants de 2-3 bits.
- Ejecución en CPU: posible con llama.cpp o Ollama, usando quants IQ2_M o IQ3_M, con latencia de unos pocos tokens por segundo en procesadores modernos.
- Opciones de despliegue: llama.cpp (CLI), Ollama (`ollama run hf.co/liodon-ai/...`), LM Studio, Jan, y cualquier framework compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no disponibles, pero al ser un modelo de 1B, se espera una generación de 10-30 tokens/s en CPU y 50-100 tokens/s en GPU de gama media, sin datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento en la información proporcionada. Sin embargo, se puede comparar a nivel de características con otras cuantizaciones de Llama-3.2-1B-Instruct, como las de `bartowski/Llama-3.2-1B-Instruct-GGUF`, que también ofrece quants GGUF de la misma base. La diferencia principal es que este repositorio aplica iMatrix, lo que puede mejorar la calidad en quants bajos, pero no hay datos cuantitativos. No hay información sobre alternativas de otros fabricantes (Qwen, Mistral) en este contexto.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF | 1,24B | no disponible | GGUF | other | HuggingFace |
| bartowski/Llama-3.2-1B-Instruct-GGUF | 1,24B | no disponible | GGUF | other | HuggingFace |
| Meta Llama-3.2-1B-Instruct (original) | 1,24B | 128K (según Meta, no confirmado) | safetensors | Meta Llama 3 | HuggingFace, NIM |

## Limitaciones y advertencias

- Licencia "other": no se especifica si permite uso comercial; es recomendable consultar la licencia del modelo base de Meta antes de usar en producción.
- Riesgo de alucinación: como todos los modelos generativos, puede producir respuestas incorrectas o inventadas, especialmente en cuantizaciones bajas (IQ2_M).
- Sesgos: no se documentan sesgos específicos, pero el modelo base puede heredar sesgos de los datos de entrenamiento.
- Longitud de contexto no especificada: no se indica el tamaño máximo de la ventana de tokens en la información, lo que limita el diseño de aplicaciones con contexto largo.
- Calidad degradada en quants de 2-3 bits: aunque iMatrix mejora la calidad, sigue habiendo pérdida de precisión respecto a la versión de 8 bits.
- No se proporcionan benchmarks ni métricas de rendimiento, lo que dificulta evaluar su idoneidad para tareas concretas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Llama-3.2-1B-Instruct-imatrix-GGUF
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Repositorio de cuantizaciones alternativas: https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- Documentación de Llama 3.2 en NVIDIA NIM: https://build.nvidia.com/meta/llama-3.2-1b-instruct
