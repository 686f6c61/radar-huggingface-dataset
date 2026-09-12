# Neeze/Vapor-2B

## Resumen

Vapor-2B es un modelo de generación de texto publicado por el usuario Neeze en HuggingFace, derivado mediante ajuste fino y compresión del modelo base LiquidAI/LFM2.5-2.6B de Liquid AI. El nombre y las etiquetas del repositorio sugieren una reducción del número de parámetros desde los 2,6B del modelo original hasta aproximadamente 2B, empleando técnicas de compresión basadas en descomposición en valores singulares (SVD) y adaptación de bajo rango.

El interés técnico del modelo reside precisamente en ese proceso de compresión: las etiquetas `svd-llm`, `tagi-svd`, `model-compression` y `low-rank-adaptation` apuntan a un pipeline de reducción de rango aplicado sobre los pesos del transformer base, una línea de trabajo relevante para desplegar modelos de la familia LFM2 en hardware con recursos limitados sin reentrenar desde cero.

No se ha publicado información adicional en el repositorio: no hay model card descriptiva, no constan idiomas soportados, no se especifica la licencia concreta (la etiqueta indica únicamente `other`) y el modelo acumula cero descargas y cero valoraciones en el momento de redactar esta ficha. Por tanto, todo lo que sigue se basa en los metadatos disponibles y en las características conocidas del modelo base, y se señala explícitamente cuando un dato no está confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada del modelo base LiquidAI/LFM2.5-2.6B (familia LFM2, Liquid Foundation Model). Detalles concretos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | Aproximadamente 2B (inferido de la denominación "2B"; no confirmado en los metadatos) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados; los pesos se distribuyen en safetensors, presumiblemente en precisión completa) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La etiqueta del repositorio indica `license:other`, pero no se incluye el texto de la licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, un modelo de la familia LFM2 (Liquid Foundation Model 2) de Liquid AI. La información disponible no detalla la arquitectura interna del modelo resultante más allá de las etiquetas del repositorio, que apuntan a una transformación de los pesos mediante SVD (`svd-llm`, `tagi-svd`) combinada con adaptación de bajo rango (`low-rank-adaptation`). Este tipo de pipeline suele consistir en descomponer matrices de pesos en factores de rango reducido, ajustar posteriormente esos factores para recuperar capacidad y consolidar un checkpoint de menor tamaño.

No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta ninguna innovación adicional como decodificación especulativa, atención lineal o modos de razonamiento explícito. El pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, lo que sugiere que el modelo base estaba orientado a diálogo, pero no hay confirmación de que ese comportamiento se preserve tras la compresión.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Uso conversacional, según la etiqueta `conversational` del repositorio; no se detalla la calidad ni el formato de plantilla de chat.
- No se ha confirmado soporte de tool calling ni function calling.
- No se ha confirmado soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, audio nativo): no disponibles.
- Capacidad heredada del modelo base: no verificable sin benchmarks publicados.

## Casos de uso

- Investigación en compresión de modelos: Vapor-2B es útil como caso de estudio para evaluar cuánta capacidad se pierde al aplicar SVD y adaptación de bajo rango sobre un transformer de 2,6B. Se compararía su salida con la del modelo base en tareas controladas.
- Prototipado local en estaciones de trabajo sin GPU dedicada: con ~2B parámetros, el modelo puede ejecutarse en CPU con memoria RAM moderada, siempre que se genere previamente una cuantización en formato GGUF.
- Asistentes conversacionales de bajo coste: para demos y pruebas internas de producto donde el requisito principal es el coste por token y no la calidad puntera.
- Generación de texto auxiliar en pipelines por lotes: resúmenes cortos, reescritura, expansión de bullets o normalización de texto en procesos que toleren revisión humana posterior.
- Generación y etiquetado de datos sintéticos: producir borradores de instrucciones, pares pregunta-respuesta o ejemplos de clasificación que después se filtran con un modelo mayor.
- Fine-tuning específico de dominio: al proceder de un modelo base relativamente pequeño, el ajuste sobre un conjunto reducido de datos propios es viable en una única GPU consumer.
- Despliegue en el borde (edge) con requisitos de latencia estrictos: escenarios donde el modelo debe ejecutarse localmente por privacidad, asumiendo una ventana de contexto limitada.
- Evaluación comparativa de técnicas de compresión SVD: servir de referencia frente a otras variantes comprimidas del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se dispone de comparaciones con el modelo base LiquidAI/LFM2.5-2.6B que permitan cuantificar la degradación introducida por la compresión.

## Requisitos de hardware

Estimaciones derivadas del recuento aproximado de parámetros (~2B). No son datos oficiales del autor:

- VRAM en fp16/bf16: aproximadamente 4-5 GB solo para pesos, más 1-2 GB adicionales de caché KV según longitud de contexto y tamaño de lote.
- VRAM en int8: aproximadamente 2-3 GB.
- VRAM en int4 (GPTQ, AWQ o GGUF Q4): aproximadamente 1,5-2 GB.
- GPU recomendadas para producción con batching: NVIDIA A100 40 GB, H100, L40S.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, siempre que exista un runtime que soporte la arquitectura del modelo base.
- Despliegue en CPU: viable con llama.cpp u Ollama únicamente si se convierte previamente a GGUF, ya que el repositorio solo publica safetensors.
- Opciones de despliegue: transformers (referencia), vLLM o TGI si soportan la arquitectura LFM2.5, llama.cpp/Ollama tras conversión a GGUF. No se ha publicado ningún artefacto GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Neeze/Vapor-2B | ~2B (aproximado) | No disponible | `other` sin texto publicado | safetensors en HuggingFace |
| LiquidAI/LFM2.5-2.6B (modelo base) | 2,6B | No disponible en la información proporcionada | No disponible en la información proporcionada | safetensors en HuggingFace |
| Qwen2.5-1.5B | 1,5B | 32 768 tokens | Apache 2.0 | safetensors, GGUF y múltiples cuantizaciones |
| Llama-3.2-1B | 1,2B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF y derivados |
| Gemma-2-2B | 2,6B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF y derivados |

Los datos de contexto y licencia de los modelos comparativos corresponden a su documentación pública. La comparación de rendimiento no es posible porque Vapor-2B no publica métricas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros de compresión ni metodología de evaluación.
- Cero descargas y cero valoraciones: el modelo no ha sido validado por la comunidad y no hay evidencia externa de su comportamiento.
- Licencia ambigua: la etiqueta `license:other` sin texto asociado impide determinar si el uso comercial está permitido. Debe consultarse al autor antes de cualquier despliegue en producción.
- Riesgo de degradación por compresión: la reducción de rango mediante SVD puede afectar de forma desigual a distintas capas y provocar pérdida de capacidad en tareas de razonamiento o código, incluso si la perplejidad se mantiene.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, y potencialmente acentuado por el proceso de compresión.
- Idiomas soportados desconocidos: no se puede asumir un buen rendimiento en castellano sin evaluaciones propias.
- Longitud de contexto desconocida: limita su uso en tareas de contexto largo (análisis de documentos extensos, conversaciones multi-turno prolongadas).
- Sin soporte confirmado de tool calling ni de flujos de agente.
- Sin artefactos GGUF publicados: el despliegue en CPU o en entornos basados en Ollama requiere conversión y verificación previas.
- Fecha de publicación futura en los metadatos (2026-09-12), lo que impide contrastar el modelo con el estado del arte actual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Neeze/Vapor-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Organización del autor en HuggingFace: https://huggingface.co/Neeze
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (artículos, papers, repositorios de código o demos). Los resultados obtenidos corresponden a sitios sin relación con el proyecto.
