# SheikhMinds/rudushi-1-1.5b

## Resumen

Rudushi-1 (1.5B) es un modelo de lenguaje instruccional de tipo decoder-only, desarrollado por la iniciativa SheikhMinds bajo la etiqueta Rudushi. Se trata de un ajuste fino QLoRA de Qwen/Qwen2.5-1.5B-Instruct, orientado principalmente al bengalí (bangla) y entrenado para responder con pasos estructurados (`ধাপ ১ / ধাপ ২ / চূড়ান্ত উত্তর`) y para revisar su propio trabajo (`খসড়া → যাচাই → সংশোধন`). El modelo resuelve la necesidad de un modelo instruccional abierto centrado en bengalí, un idioma con relativamente poca cobertura en modelos de instrucción de código abierto.

La arquitectura subyacente es Qwen2.5: transformer causal decoder-only con RoPE, SwiGLU, RMSNorm y atención de consultas agrupadas (12 cabezas de consulta y 2 de clave/valor), con 28 capas. Cuenta con 1.543.714.304 parámetros totales (1,31B no de embedding) y una longitud de contexto base de 32.768 tokens, aunque este ajuste fino se entrenó con secuencias de 512 tokens. Se distribuye como pesos completos fusionados en fp16, en shards de safetensors de 1 GB, con licencia Apache 2.0.

Es relevante ahora por ser un checkpoint de investigación de bajo coste (entrenado en una única Tesla T4 de 16 GB en 1,3 horas) que demuestra razonamiento estructurado y autoverificación en bengalí, y porque publica tanto el dataset de entrenamiento como la receta reproducible. No obstante, el propio autor lo describe como un modelo que no es un razonador general y que puede equivocarse con confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5: transformer causal decoder-only, RoPE, SwiGLU, RMSNorm, atención de consultas agrupadas (12 query / 2 KV heads), 28 capas |
| Parametros totales | 1.543.714.304 (1,54B); 1,31B no de embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens base; entrenado en este ajuste fino a 512 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos publicados en fp16); entrenamiento con QLoRA 4-bit NF4 |
| Idiomas soportados | bengalí (bn, principal) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards de 1 GB), fp16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer causal decoder-only con codificación posicional rotatoria (RoPE), activación SwiGLU, normalización RMSNorm y atención de consultas agrupadas con 12 cabezas de consulta y 2 de clave/valor en 28 capas. El ajuste fino se realizó con QLoRA de 4 bits NF4 con cómputo en fp16, rango LoRA 16 y alpha 32, longitud máxima de secuencia 512, 800 pasos de optimizador, pérdida final de entrenamiento de 0,6087 y enmascaramiento de pérdida solo sobre tokens del asistente. El entrenamiento duró 1,3 horas en una única Tesla T4 de 16 GB. Los pesos publicados son los completos fusionados en fp16.

El dataset de entrenamiento, SheikhMinds/rudushi-bangla-sft, combina 12.975 filas de iamshnoo/alpaca-cleaned-bengali (instrucciones generales traducidas), 7.000 filas sintéticas de chain-of-thought y autoverificación generadas en Python con etiquetas exactas, y 25 pares semilla curados de bengalí (hechos, traducción, redacción, código), con un total de 19.659 filas de entrenamiento y 199 de validación tras deduplicación y filtrado por script. Los generadores de razonamiento cubren precio unitario, descuentos, ecuaciones lineales, medias, ratios, conversión de unidades, sucesiones aritméticas, problemas de tasa de trabajo, silogismos y trazas de verificación. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en bengalí e inglés.
- Seguimiento de instrucciones en bengalí para tareas comunes (no a nivel experto).
- Respuestas estructuradas en varios pasos con el formato `ধাপ ১ / ধাপ ২ / চূড়ান্ত উত্তর`.
- Autoverificación mediante trazas de verificación y corrección (`খসড়া → যাচাই → সংশোধন`), aprendida como formato, sin garantía de corrección.
- Razonamiento aritmético y lógico acotado: precio unitario, descuentos, ecuaciones lineales, medias, ratios, conversión de unidades, sucesiones aritméticas, tasa de trabajo y silogismos.
- Tres modos de respuesta reproducibles en inferencia: directo, paso a paso y autoverificación (reflexión en tiempo de inferencia sin modificar pesos).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia educativa en bengalí: el modelo puede resolver problemas aritméticos escolares mostrando pasos explícitos (`ধাপ ১ / ধাপ ২ / চূড়ান্ত উত্তর`), lo que resulta útil para entornos de aprendizaje donde se requiere justificar la respuesta.
- Traducción y adaptación de instrucciones: gracias a su entrenamiento sobre alpaca-cleaned-bengali, puede emplearse para reformular o traducir instrucciones generales entre bengalí e inglés en pipelines de datos.
- Redacción y generación de contenido breve en bengalí: los 25 pares semilla curados incluyen tareas de redacción, lo que permite usarlo para borradores de texto cotidiano.
- Demostración de razonamiento estructurado: sirve como caso de estudio reproducible para investigar chain-of-thought y autoverificación en modelos pequeños, ya que publica dataset y receta completos.
- Evaluación de reflexión en tiempo de inferencia: el modo de autoverificación permite experimentar con críticas y revisiones sobre el propio borrador sin reentrenar, comparando cuándo ayuda y cuándo perjudica.
- Prototipado de asistentes conversacionales multilingües bengalí-inglés: con 32.768 tokens de contexto base y pesos fp16 de 3,1 GB, es viable desplegarlo en entornos de desarrollo con recursos modestos.
- Filtrado y generación de datos sintéticos: los generadores de razonamiento con etiquetas exactas pueden reutilizarse para producir conjuntos de entrenamiento verificables en bengalí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación, pero el contenido proporcionado se corta en la frase "Loss is not", sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de secuencia.
- VRAM estimada con cuantización de 8 bits: alrededor de 1,6-2 GB de pesos; con 4 bits: alrededor de 0,8-1 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; Tesla T4 de 16 GB fue suficiente para el entrenamiento QLoRA; A100 y H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; en GPUs de 8 GB puede requerir cuantización.
- Opciones de despliegue: transformers (versión >= 4.45), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp, Ollama y vLLM mediante conversión a GGUF, aunque no se documentan explícitamente en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rudushi-1 1.5B | 1,54B | 32.768 (entrenado a 512) | bn, en | Apache 2.0 | Hugging Face, pesos fp16 |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | multilingüe (incluye en, no se detalla bn) | Apache 2.0 | Hugging Face |
| Modelos instruccionales bengalíes de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con Qwen2.5-1.5B-Instruct, su modelo base: Rudushi-1 añade seguimiento de instrucciones y razonamiento estructurado en bengalí a costa de un entrenamiento con secuencias de 512 tokens y de un dataset mayoritariamente sintético. No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte explícitamente que no es un razonador general y que puede equivocarse con confianza; deben verificarse hechos, números y fechas.
- La autoverificación es un formato aprendido, no una garantía de corrección; el modo de reflexión en inferencia a veces ayuda y a veces perjudica.
- Entrenado con secuencias de 512 tokens, muy por debajo del contexto base de 32.768; el rendimiento en contextos largos no está validado.
- El dialecto de Jessore no está entrenado en este checkpoint (solo 20 pares semilla y configuración separada).
- Dataset mayoritariamente sintético (7.000 filas) y traducido (12.975 filas), con solo 25 pares semilla curados; cobertura limitada de tareas expertas.
- Riesgo de sesgos heredados del modelo base y de los datos traducidos; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0; deben revisarse las condiciones de atribución.
- Idiomas limitados a bengalí e inglés; el rendimiento en otros idiomas no está documentado.
- Sin soporte documentado de tool calling, agentes, visión o audio, lo que limita su uso en pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SheikhMinds/rudushi-1-1.5b
- Demo: https://huggingface.co/spaces/SheikhMinds/rudushi-1-1.5b-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/SheikhMinds/rudushi-bangla-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
