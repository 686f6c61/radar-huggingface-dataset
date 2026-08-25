# Hk-12-34/green_ai

## Resumen

El modelo `Hk-12-34/green_ai` es una publicación de Hugging Face creada por el usuario Hk-12-34 el 25 de agosto de 2026. La información pública disponible se limita a la declaración de impacto ambiental del proceso de fine-tuning: se estima que el entrenamiento emitió 23,190 kg de CO2 equivalente, empleando 8 GPUs NVIDIA V100 durante 73,2 horas en la región europe-north1. No se ha publicado ninguna especificación técnica del modelo, ni arquitectura, ni parámetros, ni capacidades, ni licencia. El repositorio no registra descargas ni valoraciones.

El interés de esta ficha radica en documentar la transparencia ambiental del autor, que ha seguido la metodología del *Machine Learning Impact calculator* para reportar emisiones, pero desde el punto de vista técnico no es posible evaluar el modelo por falta de datos. Cualquier uso en producción queda descartado mientras no se publique información adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (tipo de red, número de capas, mecanismo de atención, etc.). El único dato disponible es que se trata de un fine-tuning, es decir, una adaptación de un modelo base preexistente, aunque no se indica cuál.

El proceso de entrenamiento se documentó con los siguientes datos de consumo: se emplearon 8 GPUs NVIDIA V100 con un TDP de 300 W cada una, durante 73,2 horas, con un PUE de 1,1 en el centro de datos europe-north-1. El consumo energético total se calculó en 193,248 kWh y las emisiones de carbono asociadas en 23,190 kg CO2eq, usando una intensidad de red de 120 gCO2eq/kWh. Estos datos se reportaron mediante la herramienta CodeCarbon.

## Capacidades

No se han publicado capacidades del modelo. La model card no describe tareas de generación de texto, razonamiento, código, visión, tool calling, agentes, ni ninguna otra habilidad. Tampoco se indica si soporta multilingüismo o modos especiales de inferencia.

## Casos de uso

No se dispone de información que permita proponer casos de uso concretos. El autor no ha documentado aplicaciones prácticas, y al no conocerse la arquitectura ni las capacidades, no es posible recomendar ningún escenario de despliegue con rigor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para inferencia. El único dato de hardware corresponde al entrenamiento (8x NVIDIA V100), que no es extrapolable a las necesidades de ejecución del modelo final. No se indican GPUs recomendadas, ni si cabe en GPU de consumo, ni opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se conoce el tamaño ni la categoría del modelo, por lo que no es posible compararlo con alternativas como Llama, Mistral o Qwen.

## Limitaciones y advertencias

- La información pública es insuficiente para evaluar el modelo técnicamente.
- La licencia no está especificada, por lo que no se puede determinar si es apto para uso comercial.
- No se han reportado sesgos ni riesgos de alucinación, pero tampoco se ha proporcionado información que permita evaluarlos.
- El modelo no ha sido validado por la comunidad (0 descargas, 0 valoraciones), lo que sugiere que no ha sido probado en entornos reales.
- El autor no ha publicado una model card técnica, lo que dificulta la reproducibilidad y el despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hk-12-34/green_ai
- Sitio del framework "Green AI Model" (no es el modelo, sino un framework de sostenibilidad): https://green-ai-model.github.io/

Nota: los enlaces web encontrados durante la búsqueda se refieren a un framework conceptual llamado "Green AI Model" y a una empresa homónima, no al modelo `Hk-12-34/green_ai`. No se encontraron papers, demos ni documentación técnica adicional sobre este modelo específico.
