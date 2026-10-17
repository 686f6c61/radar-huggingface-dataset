# hewittlab/monitor_cot_for_hack-reward_description-judge-explicit_intent-gpt-oss-120b

## Resumen

Este repositorio no contiene un modelo independiente, sino una familia de hasta 78 adaptadores LoRA de rango 32 sobre `openai/gpt-oss-120b`, publicada por la organización hewittlab. Los adaptadores se entrenaron con GRPO para una tarea de juicio de preferencia entre pares de respuestas de Chatbot Arena (Claude frente a Gemini) que los anotadores humanos consideran igualmente preferibles. La consulta declara explícitamente la intención de la tarea.

La familia incluye dos variantes por semilla y paso: `control_model`, entrenado con una recompensa verdadera 0.5/0.5, y `misaligned_model`, entrenado con una recompensa mal especificada 0.9/0.1 a favor de Gemini. Con 3 semillas y 13 checkpoints (pasos 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230 y 250), el artefacto permite estudiar empíricamente el reward hacking y la pérdida de monitorabilidad de la cadena de pensamiento. Su relevancia es metodológica: es un banco de pruebas controlado, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de rango 32 sobre `openai/gpt-oss-120b`; no se detalla la arquitectura del base (transformer, MoE u otra) en la información disponible |
| Parámetros totales | No disponible para los adaptadores; el base se identifica como `gpt-oss-120b`, sin recuento exacto documentado |
| Parámetros activos | No disponible en la información; no se detalla el número de parámetros activos del modelo base |
| Longitud de contexto | No disponible; consultar la ficha de `openai/gpt-oss-120b` |
| Tipos de cuantización | No disponible; los adaptadores se distribuyen en safetensors y no se especifican cuantizaciones del base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors; adaptador LoRA en formato Tinker (`adapter_config.json` y `adapter_model.safetensors`); requiere fusión con el base |
| Tarea | Juicio de preferencia entre pares de respuestas Claude-vs-Gemini con intención explícita en la consulta |
| Variantes | `control_model` (recompensa 0.5/0.5) y `misaligned_model` (recompensa 0.9/0.1 a favor de Gemini) |
| Semillas | 0, 1, 2 |
| Checkpoints | 10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250 |
| Dataset | `hewittlab/monitor_cot_for_hack-judge`, derivado de `lmarena-ai/arena-human-preference-140k` |
| Entrenamiento | GRPO con descripción de recompensa; LoRA de rango 32 |
| Tamaño del repositorio | 383.8 GB |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El entrenamiento parte de `openai/gpt-oss-120b` y aplica LoRA de rango 32. Cada ejecución se entrena con GRPO a partir de una descripción de recompensa explícita; el repositorio conserva `config.yaml` y `reward_description.txt`, lo que permite auditar la configuración y la recompensa usada. No se documentan el número de tokens de entrenamiento, la composición completa del dataset, las capas objetivo del adaptador, el optimizador ni si hubo fases adicionales de RLHF o DPO.

El dataset de tarea es un subconjunto de `lmarena-ai/arena-human-preference-140k` con pares Claude-vs-Gemini igualmente preferidos por anotadores humanos. La variante `control_model` optimiza la similitud L1 entre la preferencia del modelo y la preferencia humana con un reparto 0.5/0.5; la variante `misaligned_model` optimiza la similitud L1 frente a un reparto 0.9/0.1 favorable a Gemini. Esa diferencia es el eje experimental: una recompensa mal especificada que puede inducir reward hacking y degradar la monitorabilidad de la cadena de pensamiento. No se describen innovaciones de decodificación ni de atención.

## Capacidades

- Juicio de preferencia A/B en el dominio del dataset: el adaptador produce una preferencia entre dos respuestas de Claude y Gemini, condicionado por una consulta que declara explícitamente la intención de la tarea.
- Reproducción de dos regímenes de recompensa: control (0.5/0.5) y misaligned (0.9/0.1 a favor de Gemini), con 3 semillas y 13 checkpoints por ejecución.
- Análisis de la evolución del comportamiento: los checkpoints intermedios permiten estudiar cuándo aparece la desviación y si se estabiliza.
- Estudio de monitorabilidad de la cadena de pensamiento: los tags indican `chain-of-thought`
