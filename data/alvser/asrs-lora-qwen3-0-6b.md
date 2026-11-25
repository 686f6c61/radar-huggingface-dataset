# Alvser/asrs-lora-qwen3-0.6b

## Resumen

El modelo `Alvser/asrs-lora-qwen3-0.6b` es un adaptador LoRA sobre el modelo base Qwen3-0.6B-Base, desarrollado por Alvser, que resuelve una tarea de clasificación multi-etiqueta sobre narrativas de incidentes de aviación del sistema ASRS (Aviation Safety Reporting System) de la NASA. El modelo asigna a cada relato del reportero una o varias de las 46 categorías de anomalía más frecuentes, siguiendo las convenciones de los analistas del ASRS.

Técnicamente no es un `AutoModelForSequenceClassification` convencional: el repositorio contiene el adaptador LoRA (`adapter_model.safetensors`), una cabeza lineal independiente (`head.pt`, de 1024 a 46 logits, aplicada al último token), el listado de etiquetas (`labels.json`) y los umbrales de decisión por etiqueta (`thresholds.json`). El modelo base Qwen3-0.6B-Base es un transformer decoder-only de aproximadamente 0,6 mil millones de parámetros con contexto de 512 tokens en este pipeline concreto.

Su relevancia es práctica: demuestra que un modelo pequeño (0,6B) con un adaptador LoRA de rango 16 y una cabeza lineal puede aproximarse al rendimiento de un modelo propietario grande en una tarea de clasificación especializada y de dominio muy concreto, con un coste de entrenamiento de una sola época sobre una GPU de consumo (Kaggle T4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B-Base) + adaptador LoRA + cabeza lineal de clasificación |
| Parametros totales | Aproximadamente 0,6 mil millones en el modelo base; el adaptador LoRA y la cabeza son adicionales (tamaño del repo: 0,0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncación en el pipeline de clasificación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`), `head.pt` (PyTorch), `adapter_config.json`, `labels.json`, `thresholds.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only, sobre el que se aplica un adaptador LoRA con rango `r=16`, `alpha=32` y dropout 0,05 sobre todas las proyecciones de atención y MLP. Sobre el último token se aplica una cabeza lineal independiente de 1024 dimensiones ocultas a 46 logits, con activación sigmoide y pérdida BCE (binary cross-entropy) para el enfoque multi-etiqueta. Los umbrales de decisión por etiqueta se ajustan sobre el conjunto de validación de 2023.

Los datos de entrenamiento son narrativas del ASRS de 2010 a 2022, con un total de 67.826 informes, divididos por fecha: validación en 2023 y test en 2024-2025. Solo se utiliza la narrativa del reportero, truncada a 512 tokens. El entrenamiento se realizó durante 1 época (4.239 pasos), con learning rate de 2e-4 para el LoRA y 1e-3 para la cabeza, batch efectivo de 16, 5% de warmup y precisión fp16 sobre una única GPU Kaggle T4.

## Capacidades

- Clasificación multi-etiqueta de narrativas de incidentes de aviación en 46 categorías de anomalía del ASRS.
- Asignación de múltiples etiquetas simultáneas por informe (no exclusión mutua).
- Umbrales de decisión ajustados por etiqueta para optimizar F1.
- Procesamiento de texto en inglés exclusivamente.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No es un modelo generativo de propósito general: es un clasificador especializado.

## Casos de uso

- Triaje automático de informes ASRS: el modelo puede etiquetar automáticamente narrativas entrantes con sus categorías de anomalía, permitiendo a los analistas priorizar los informes según su severidad y tipo de conflicto, reduciendo el trabajo manual de clasificación inicial.
- Análisis de tendencias de seguridad aérea: al clasificar grandes volúmenes de informes históricos y nuevos, permite agregar estadísticas por categoría de anomalía y detectar incrementos en tipos específicos de incidentes a lo largo del tiempo.
- Enriquecimiento de bases de datos de seguridad: integrado en un pipeline de ingesta, el modelo añade etiquetas estructuradas a narrativas no estructuradas, facilitando búsquedas y filtrados posteriores por categoría.
- Investigación académica en seguridad aérea: investigadores pueden procesar corpus de informes ASRS de forma automática para estudios sobre factores contribuyentes y patrones de incidentes, sin depender de anotación manual.
- Sistemas de alerta temprana: combinado con reglas de negocio, el modelo puede marcar informes con etiquetas de alta severidad para revisión inmediata por parte de los equipos de seguridad operacional.
- Baseline para modelos más grandes: dado su bajo coste computacional (0,6B parámetros, fp16 en una T4), sirve como referencia rápida y económica en experimentos de clasificación de dominio especializado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados en el conjunto de test (2024-2025), con umbrales por etiqueta ajustados en validación:

| Modelo | Macro-F1 | Micro-F1 | Exact match |
|---|---|---|---|
| Este modelo, test completo (11.542 informes) | 0,572 | 0,660 | 0,112 |
| Este modelo, muestra de 1.000 informes | 0,558 | 0,652 | 0,106 |
| Claude Opus 5.5, 5-shot, misma muestra | 0,565 | 0,632 | 0,242 |
| TF-IDF + regresión logística, misma muestra | 0,502 | 0,617 | 0,078 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base de 0,6B en fp16 ocupa aproximadamente 1,2 GB, más el adaptador LoRA y la cabeza lineal (tamaño del repo: 0,0 GB).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizó en una Kaggle T4.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria.
- Opciones de despliegue: el repositorio proporciona código propio (`asrs_lora_classifier.model.load_classifier`) basado en `transformers` y `peft`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alvser/asrs-lora-qwen3-0.6b | ~0,6B + LoRA | 512 tokens | 0,572 | MIT | Hugging Face |
| Claude Opus 5.5 (5-shot) | no disponible | no disponible | 0,565 | propietaria | API comercial |
| TF-IDF + regresión logística | no aplica | no aplica | 0,502 | no disponible | pipeline propio |

## Limitaciones y advertencias

- Las etiquetas siguen las convenciones de los analistas del ASRS y solo cubren los 46 valores de anomalía más frecuentes; categorías poco comunes quedan fuera.
- La tasa de exact match es baja (0,112): los umbrales se ajustan por etiqueta para maximizar F1, por lo que el modelo tiende a añadir etiquetas adicionales.
- Algunas etiquetas raras obtienen puntuaciones cercanas a cero (por ejemplo, `Conflict Ground Conflict Less Severe`).
- El modelo solo procesa inglés y trunca las narrativas a 512 tokens, por lo que informes largos pierden información.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos por el sesgo hacia añadir etiquetas.
- La licencia MIT permite uso comercial, pero el modelo depende de Qwen3-0.6B-Base, cuyos términos deben verificarse por separado.
- No es un modelo de propósito general: no debe usarse para generación de texto, razonamiento abierto ni tareas fuera de la clasificación ASRS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Alvser/asrs-lora-qwen3-0.6b
- Repositorio GitHub (código, pipeline de datos y baselines): https://github.com/alvaro-serero/asrs-lora-classifier
- Sistema ASRS de la NASA: https://asrs.arc.nasa.gov/
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
