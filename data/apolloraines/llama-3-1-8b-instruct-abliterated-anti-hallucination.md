# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination

## Resumen

Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination es una variante del modelo meta-llama/Llama-3.1-8B-Instruct publicada por el desarrollador independiente ApolloRaines bajo el paraguas de su herramienta propietaria jBlaze. No se trata de un fine-tuning ni de un entrenamiento adicional: el autor aplica lo que denomina "cirugía de pesos" (weight surgery) para identificar y ablacionar direcciones de comportamiento concretas dentro de los pesos del modelo base. En este caso, las dos direcciones intervenidas son la de rechazo (refusal) y la de alucinación (hallucination), ambas suprimidas.

El modelo conserva la arquitectura original LlamaForCausalLM de Meta, con 32 capas y 8.030.261.248 parámetros en bf16, por lo que hereda el contexto nativo de 128.000 tokens de Llama 3.1. El interés técnico reside en la metodología: demuestra que ciertas disposiciones conductuales aprendidas pueden localizarse como direcciones en el espacio de pesos y modificarse después del entrenamiento sin gradientes. El autor lo presenta explícitamente como una demostración acotada de una sola función, publicada para investigación y deliberadamente rebajada de intensidad respecto a la versión interna completa de la herramienta.

Es relevante ahora porque se inscribe en la línea de trabajo de ingeniería de representaciones y abliteración, que busca controlar el comportamiento de modelos abiertos sin recurrir a RLHF ni a datasets de preferencias. La contrapartida es que los ejemplos de salida incluidos en la model card muestran degradación clara de capacidades (errores aritméticos, respuestas incorrectas sobre funciones de Python, afirmaciones factualmente falsas sobre la forma de la Tierra), lo que conviene tener en cuenta antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no se indica modificación) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct original sin cambios estructurales: transformer decoder-only denso con 32 capas, atención con RoPE y GQA, y pesos en bf16. El autor declara explícitamente que no hubo fine-tuning ni entrenamiento adicional, ni tampoco una fase de RLHF o DPO posterior. La intervención consiste en localizar dos direcciones de comportamiento en el espacio de activaciones/pesos y aplicar una ablación directa sobre ellas: supresión de la dirección de rechazo y supresión de la dirección de alucinación.

La innovación declarada no es arquitectónica sino metodológica: la edición de pesos post-entrenamiento como alternativa al ajuste supervisado. El autor enmarca la técnica como simétrica, señalando que la misma cirugía puede apuntar hacia comportamientos más seguros (menos alucinación, menos toxicidad, menos hedging) o en la dirección opuesta. No se proporcionan detalles sobre el número de tokens de calibración, la composición del dataset usado para identificar las direcciones ni la métrica de selección de la dirección. La herramienta jBlaze es propietaria y no se publica su implementación.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Supresión declarada de la dirección de rechazo: el modelo responde a peticiones que el Instruct base rechazaría.
- Supresión declarada de la dirección de alucinación, orientada a reducir la fabricación de información.
- Razonamiento aritmético básico: los ejemplos de la model card muestran errores (17 × 23 respondido como 357, atribuido a 17 × 21).
- Generación de código: los ejemplos muestran respuestas incorrectas sobre funciones integradas de Python.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en ingeniería de representaciones: servir como caso de estudio reproducible de ablación de direcciones conductuales sobre un modelo abierto de 8B, comparando activaciones antes y después de la edición.
- Estudio de la relación entre rechazo y alucinación: analizar si la supresión conjunta de ambas direcciones produce efectos acoplados, dado que el autor las presenta como intervenciones independientes.
- Evaluación de robustez factual: medir la tasa de alucinación del modelo editado frente al Instruct base con un benchmark de preguntas factuales, para verificar si la supresión declarada se traduce en mejora medible.
- Auditoría de seguridad de técnicas de abliteración: usar el modelo como muestra de que la eliminación de guardrails de rechazo es viable en pesos abiertos de 8B, informando políticas de despliegue y filtrado.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una edición de pesos sin gradientes altera el comportamiento observable, con ejemplos de la propia model card.
- Prototipado interno sin restricciones de rechazo: en entornos controlados donde se necesite que el modelo no declive peticiones, aceptando la degradación de calidad documentada.
- No recomendado para producción: atención al cliente, generación de código en CI/CD o asistentes factuales no son escenarios adecuados dados los errores observados en los ejemplos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, y los únicos datos de rendimiento son los ejemplos cualitativos de salida, que muestran errores factuales y aritméticos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; también válido en RTX 4090 (24 GB) para contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM y TGI para servir en bf16; llama.cpp y Ollama requieren conversión a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edición de comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination | 8,03B | 128k | Ablación de refusal y hallucination vía jBlaze | Llama 3.1 Community | Hugging Face, 376 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Ninguna (modelo base) | Llama 3.1 Community | Hugging Face, ampliamente desplegado |
| Variantes abliteradas de Llama 3 8B (comunidad) | ~8B | 8k-128k según base | Ablación de refusal por dirección | Según modelo base | Múltiples repos en Hugging Face |
| Modelos 8B con foco anti-alucinación (p. ej. variantes ajustadas con datos de abstención) | ~7-9B | Variable | Fine-tuning supervisado | Variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: ni este modelo ni las alternativas citadas publican métricas en la información manejada. La diferencia principal frente al Instruct base es la intervención de pesos; frente a otras variantes abliteradas, la combinación de supresión de rechazo y de alucinación en una sola edición y el uso de una herramienta propietaria no auditable.

## Limitaciones y advertencias

- Los ejemplos de la model card muestran errores factuales y aritméticos: 17 × 23 respondido como 357, descripción incorrecta de la función `reverse` de Python y una respuesta ambigua sobre la forma de la Tierra ante una afirmación falsa. La supresión declarada de la alucinación no se traduce en los ejemplos en mayor precisión.
- La edición de pesos no es auditable: jBlaze es propietaria y no se publica la dirección ablacionada, el dataset de calibración ni el procedimiento de selección.
- El autor declara que los modelos públicos están "deliberadamente a fuerza parcial" y que lo descargable es la demostración, no el producto completo; el comportamiento real de la versión plena es desconocido.
- La supresión del rechazo elimina guardrails: el modelo responde a peticiones de contenido dañino, como ilustra el ejemplo sobre abrir cerraduras. No es apto para despliegues públicos sin filtrado externo.
- Idiomas: solo inglés según la etiqueta del repo; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar del Instruct base, hereda los sesgos de los datos de preentrenamiento de Llama 3.1 sin mitigación adicional.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de atribución de Meta; el uso comercial requiere cumplir los términos de dicha licencia.
- Contexto: aunque el modelo base soporta 128k tokens, no se documenta si la edición afecta al comportamiento en contextos largos.
- Madurez: 376 descargas, 0 likes y ausencia de benchmarks; no hay validación independiente de las afirmaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Anti-Hallucination
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Herramienta jBlaze: https://jblaze.dev
