# Davitotty1/Teleste-Learner-4B

## Resumen

Teleste Learner 4B es un adaptador LoRA desarrollado por Davitotty1 sobre el modelo base Qwen3.5-4B (versión de Unsloth). Su propósito es mejorar la capacidad de inducción de tareas en contexto: en lugar de asumir un rol fijo, el modelo infiere las reglas, el formato y el contrato de salida a partir de la conversación actual, incluyendo cambios de reglas a mitad de interacción. Está pensado para escenarios donde el usuario define una tarea nueva con pocos ejemplos y espera que el modelo la aplique de forma estricta.

El adaptador se entrenó con supervisión SFT sobre una mezcla de aproximadamente 1000 trazas sintéticas de adaptación (tareas inventadas, cambios de regla, auto-verificación, restricciones apiladas) y un subconjunto de Super-NaturalInstructions. El resultado es un modelo ligero (el repositorio ocupa 0,1 GB) que conserva las capacidades generales del base pero con un sesgo explícito hacia el seguimiento de instrucciones ad-hoc. Es relevante para desarrolladores que necesitan un modelo pequeño y barato de desplegar para tareas de transformación de datos, formateo o extracción con reglas definidas por el usuario.

No se han publicado benchmarks, por lo que su rendimiento cuantitativo no está verificado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3.5-4B, transformer causal) |
| Parametros totales | 4B (modelo base); adaptador LoRA: no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 (contexto de entrenamiento; el base podría soportar más, no especificado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16, aplicado a las proyecciones q, k, v, o, gate, up y down del transformer base Qwen3.5-4B. El entrenamiento se realizó en 16 bits (no QLoRA) sobre una GPU Tesla T4 de Kaggle, con un contexto de 2048 tokens. El objetivo fue supervisado SFT sobre conversaciones sintéticas que simulan inducción de tareas: el modelo debe inferir la regla subyacente a partir de ejemplos, aplicarla a nuevas entradas y reemplazar la regla si un mensaje posterior la cambia.

La mezcla de datos incluye dos fuentes: trazas sintéticas de adaptación (tareas inventadas, cambios de reglas, auto-chequeos, especificaciones desordenadas) y una muestra multi-tarea de Super-NaturalInstructions para evitar el sobreajuste a un único formato de puzzle. No se emplearon técnicas de RLHF ni DPO. El entrenamiento se realizó con Unsloth, que optimiza el uso de memoria en GPUs de gama baja.

## Capacidades

- Inducción de tareas en contexto: infiere reglas y formatos a partir de pocos ejemplos en la conversación.
- Seguimiento de procedimientos definidos por el usuario: cifrados, filtros, esquemas, transformaciones.
- Cambio dinámico de reglas: si un mensaje posterior reemplaza la regla anterior, el modelo se adapta.
- Salida estricta sin comentarios adicionales cuando el contrato lo exige.
- Generación de texto conversacional estándar heredada del base Qwen3.5-4B.
- No soporta tool calling, agentes, visión ni audio de forma nativa.

## Casos de uso

- Transformación de formatos ad-hoc: dado un par de ejemplos de mapeo (por ejemplo, "walrus→12, turtle→12, pig→6"), el modelo aplica la regla inferida a nuevas entradas. Útil para normalizar datos en pipelines de ETL.
- Extracción de esquemas: el usuario define un formato de salida (JSON, CSV, etc.) con un ejemplo y el modelo extrae la información siguiendo ese esquema.
- Filtrado de texto con reglas personalizadas: por ejemplo, eliminar ciertas categorías de palabras o reescribir frases según un criterio definido en el prompt.
- Asistentes conversacionales con reglas dinámicas: un bot que cambia su comportamiento según instrucciones del usuario a mitad de conversación (por ejemplo, pasar de tono formal a informal).
- Generación de código con restricciones específicas: el usuario indica una convención de nomenclatura o estructura y el modelo la aplica en el código generado.
- Parseo de entradas ruidosas: con ejemplos de entrada-salida, el modelo aprende a limpiar o estructurar texto desordenado (logs, tickets, formularios).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,1 GB), pero requiere cargar el modelo base Qwen3.5-4B (aproximadamente 8 GB en fp16).
- Inferencia en fp16: recomendable al menos 10-12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, T4).
- Con cuantización 4-bit del base (no incluida en el repo), podría caber en GPUs con 4-6 GB, pero no se proporcionan archivos cuantizados.
- Se puede desplegar con Transformers + PEFT, vLLM (si se fusiona el adaptador), o llama.cpp (si se convierte a GGUF).
- El entrenamiento se realizó en una T4 (16 GB), por lo que la inferencia en hardware similar es viable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con el mismo enfoque de inducción de tareas en contexto en el rango de 4B. El modelo base Qwen3.5-4B es el punto de referencia natural, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- No es un agente general: no tiene memoria entre sesiones ni capacidad de razonamiento multi-paso complejo.
- Riesgo de alucinación: puede inventar reglas cuando los ejemplos son ambiguos o insuficientes.
- Solo inglés: no se garantiza rendimiento en otros idiomas.
- Contexto limitado a 2048 tokens durante el entrenamiento; entradas más largas pueden degradar el rendimiento.
- No hay benchmarks publicados: el rendimiento real en tareas concretas no está verificado.
- El repositorio puede contener solo el adaptador LoRA, no el modelo fusionado; es necesario cargar el base por separado.
- Requiere transformers v5+ con soporte para Qwen3.5, lo que puede limitar la compatibilidad con entornos existentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Davitotty1/Teleste-Learner-4B
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset Super-NaturalInstructions: https://huggingface.co/datasets/Muennighoff/natural-instructions
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
