# Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora

## Resumen

Pomona Tomato Risk Reasoner v0.1.7 LoRA es un adaptador PEFT (LoRA) desarrollado por Okyanus para clasificar etiquetas de riesgo en invernaderos de tomate a partir de datos de sensores. Se basa en el modelo Qwen/Qwen2.5-0.5B-Instruct y está diseñado para una tarea muy concreta: transformar un JSON de sensores de invernadero en una lista JSON de etiquetas de riesgo (por ejemplo, `high_ph`, `heat_stress`, `fungal_pressure`). No es un modelo de chat general ni un controlador autónomo; su uso previsto es como componente de un sistema híbrido donde un comprobador determinista de reglas valida y corrige sus salidas.

El modelo forma parte del ecosistema Pomona, una plataforma de agricultura de precisión que combina pequeños modelos especializados con lógica determinista de seguridad. La motivación declarada es que modelos pequeños pueden ser útiles cuando la tarea es estrecha, la salida es verificable y la evaluación es estricta, inspirado en trabajos como VibeThinker. El adaptador tiene un tamaño de repositorio de 0.0 GB (solo pesos del adaptador) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct (transformer) |
| Parametros totales | No disponible (adaptador LoRA; modelo base 0.5B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) sobre el modelo base Qwen2.5-0.5B-Instruct, un transformer de 0.5 mil millones de parámetros. La capa de adaptación se entrena para la tarea específica de clasificación de riesgo en invernaderos de tomate, con entrada en formato JSON de sensores y salida en formato JSON de lista de etiquetas. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El dataset utilizado es `Okyanus/greenhouse-sensor-data`, de acceso público. La model card indica que el adaptador se entrena de forma iterativa (versión v0.1.7) y que se evalúa tanto en un test propio como en una suite dorada de 15 casos.

## Capacidades

- Clasificación de riesgo en invernaderos de tomate: genera una lista JSON de etiquetas de riesgo a partir de datos de sensores (temperatura, humedad, pH, EC, CO2, etc.).
- Soporte de 12 etiquetas de riesgo predefinidas: `high_ph`, `low_ph`, `high_ec`, `low_ec`, `heat_stress`, `cold_stress`, `fungal_pressure`, `nutrient_uptake_issue`, `sensor_anomaly`, `missing_critical_data`, `water_level_risk`, `actuator_conflict`.
- Integración con el sistema Pomona: el adaptador se usa en un pipeline híbrido donde un comprobador determinista de reglas valida y corrige las etiquetas predichas.
- Salida restringida a formato JSON mediante decodificación con esquema (schema-constrained JSON decoding) cuando se usa con Ollama.
- No es un modelo de chat, no soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Monitoreo de invernadero en tiempo real: el adaptador procesa lecturas de sensores y genera alertas de riesgo (por ejemplo, `heat_stress` o `fungal_pressure`) que se muestran en un panel de control.
- Validación de datos de sensores: detecta `sensor_anomaly` o `missing_critical_data` para señalar problemas de instrumentación.
- Apoyo a la toma de decisiones agronómicas: las etiquetas de riesgo se combinan con reglas deterministas para recomendar acciones (por ejemplo, ajuste de riego o ventilación) sin autorizar cambios autónomos.
- Integración en plataformas de agricultura de precisión: el adaptador se puede desplegar como un microservicio que recibe JSON de sensores y devuelve etiquetas, con el guardarraíl de Pomona como capa de seguridad.
- Evaluación de riesgos en investigación: permite probar la viabilidad de modelos pequeños para tareas agrícolas específicas, comparando su rendimiento con reglas heurísticas.
- Formación de un ecosistema de especialistas: junto con otros adaptadores de Pomona (riego, actuadores, asistente agronómico), cubre diferentes aspectos del manejo de invernadero.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación del adaptador v0.1.7:

| Métrica | Valor |
|---|---|
| F1 en test propio (staged) | 0.924 |
| F1 en suite dorada (golden) | 0.667 |
| F1 híbrido con reglas (golden) | 1.000 |
| F1 híbrido con reglas (staged) | 1.000 |
| Correcciones en golden | 5 / 15 |
| Correcciones en staged | 59 / 473 |

La evaluación híbrida se mide sobre un conjunto derivado de reglas, por lo que debe interpretarse como una comprobación de integración del guardarraíl, no como un benchmark agronómico independiente. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.5B, los requisitos de hardware son muy reducidos.
- Puede ejecutarse en CPU sin problemas; la inferencia es rápida para una tarea de clasificación de una sola pasada.
- En GPU, cualquier tarjeta con al menos 2-4 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.), aunque no se especifican cifras exactas.
- Opciones de despliegue: el ecosistema Pomona soporta Ollama con decodificación JSON restringida (`format` en `/api/chat`), así como el uso directo con la librería PEFT y transformers.
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un adaptador especializado en una tarea muy concreta (clasificación de riesgo en invernaderos de tomate) y no existe una categoría estándar de modelos similares.

## Limitaciones y advertencias

- Clasificador de riesgo muy estrecho: solo funciona para invernaderos de tomate y con las etiquetas predefinidas; no es un modelo de propósito general.
- No es un modelo de chat: no debe usarse para conversación ni para tareas fuera de su dominio.
- El razonamiento de umbrales es imperfecto sin los guardarraíles de Pomona; el F1 del modelo solo (0.667 en golden) es significativamente inferior al de las reglas deterministas (1.0).
- No reemplaza la revisión de un agrónomo: las salidas deben ser validadas por un experto antes de tomar decisiones.
- No autoriza acciones autónomas: no debe usarse para dosificación de pesticidas, cambios autónomos de fertirrigación, control directo de actuadores, diagnóstico definitivo de enfermedades ni recomendaciones químicas no seguras.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema Pomona y de sus reglas deterministas para un funcionamiento seguro.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma específicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Okyanus/pomona-tomato-risk-reasoner-v0.1.7-lora)
- [Plataforma Pomona (repo GitHub)](https://github.com/Okyanus/pomona)
- [Dataset de sensores de invernadero](https://huggingface.co/datasets/Okyanus/greenhouse-sensor-data)
- [Adaptador de riego Pomona](https://huggingface.co/Okyanus/pomona-water-irrigation-risk-reasoner-v0.1.8-lora)
- [Adaptador de actuadores Pomona](https://huggingface.co/Okyanus/pomona-actuator-command-gate-reasoner-v0.1-lora)
- [Asistente agronómico Pomona](https://huggingface.co/Okyanus/ai-pomona-agronomist-gemma4)
- [Paper VibeThinker-1.5B](https://arxiv.org/abs/2511.06221)
- [Paper VibeThinker-3B](https://arxiv.org/abs/2606.16140)
- [Documentación de runtimes locales de Pomona](https://github.com/Okyanus/pomona/blob/main/docs/LOCAL_MODEL_RUNTIMES.md)
