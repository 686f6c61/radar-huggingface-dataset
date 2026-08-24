# akansharaghav/carbon-audit-t4-run

## Resumen

Este artefacto, publicado en HuggingFace bajo el identificador `akansharaghav/carbon-audit-t4-run`, no es un modelo de inteligencia artificial, sino un registro de auditoría de emisiones de carbono asociado a un entrenamiento de un modelo no especificado. La model card documenta la huella ambiental del proceso de entrenamiento, con datos extraídos mediante la herramienta CodeCarbon. El autor es `akansharaghav`, y el registro fue creado el 23 de agosto de 2026.

La relevancia de este artefacto radica en la creciente necesidad de transparencia ambiental en el desarrollo de IA. Al publicar métricas de emisiones de CO₂ equivalente, permite a la comunidad evaluar el coste ecológico de los entrenamientos y fomentar prácticas más sostenibles. Sin embargo, no contiene pesos, arquitectura ni código de un modelo de aprendizaje automático; es únicamente una ficha de medición de impacto ambiental.

La ficha documenta un entrenamiento realizado en la región `ap-southeast1` con 4 GPUs NVIDIA T4, durante 266,3 horas, con un consumo total de 96.188 kWh y unas emisiones de 46.170 kg de CO₂ equivalente. No se proporcionan detalles sobre el modelo entrenado (arquitectura, parámetros, dataset), por lo que su utilidad práctica se limita a servir como referencia de coste energético de un entrenamiento concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |
| Emisiones de CO2eq | 46.170 kg |
| Fuente de emisiones | codecarbon |
| Tipo de entrenamiento | pre-training |
| Ubicacion geografica | ap-southeast1 |
| Hardware usado | NVIDIA T4 × 4 |
| Horas de GPU | 266.3 |
| PUE (Power Usage Effectiveness) | 1.29 |
| Energia total consumida | 96.188 kWh |

## Arquitectura y entrenamiento

No existe arquitectura de modelo en este artefacto. La informacion proporcionada se limita a los detalles del entrenamiento: se utilizaron 4 GPUs NVIDIA T4 en la region `ap-southeast1` de Google Cloud, durante 266.3 horas. El consumo energetico total fue de 96.188 kWh, con un PUE de 1.29, lo que arroja unas emisiones de 46.170 kg CO2eq. No se indica que tipo de modelo se entreno, ni el dataset utilizado, ni si hubo procesos de alineamiento como RLHF o DPO. El registro fue generado con la herramienta `codecarbon`, que estima emisiones basandose en el hardware, la ubicacion y el consumo electrico.

## Capacidades

- No tiene capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna otra funcionalidad de IA.
- No es un modelo ejecutable; no puede ser cargado en frameworks como Transformers, vLLM u Ollama.
- Su unica funcion es documentar el impacto ambiental de un entrenamiento previo.
- No incluye herramientas de `function calling`, agentes ni procesamiento multilingue.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el registro permite a equipos de investigacion justificar el coste ecologico de sus entrenamientos ante organismos reguladores o iniciativas de responsabilidad social corporativa.
- Comparacion de huella de carbono entre experimentos: investigadores pueden utilizar este tipo de metadatos para decidir entre diferentes configuraciones de hardware o regiones de computo en funcion de su impacto ambiental.
- Reportes de transparencia en publicaciones cientificas: al incluir metricas de emisiones en papers o repositorios, se facilita la reproducibilidad y la evaluacion del coste real de los modelos.
- Evaluacion de estrategias de mitigacion: permite analizar si el uso de GPUs de menor consumo (como la T4) reduce significativamente las emisiones en comparacion con hardware de alto rendimiento.
- Cumplimiento de normativas internas: empresas con politicas de emisiones cero pueden usar estos registros para justificar decisiones de despliegue o entrenamiento.
- Educacion y sensibilizacion: sirve como ejemplo concreto para cursos sobre impacto ambiental de la IA, mostrando datos reales de consumo y emisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no contiene metricas de rendimiento de modelo (como MMLU, HumanEval o GSM8K) porque no es un modelo de IA, sino un registro de emisiones. No se pueden comparar capacidades de razonamiento ni calidad de generacion.

## Requisitos de hardware

- El registro indica que el entrenamiento se realizo con 4 GPUs NVIDIA T4, cada una con 16 GB de VRAM.
- No se especifican requisitos de inferencia, ya que no hay modelo que ejecutar.
- Para reproducir un entrenamiento similar, se necesitaria un entorno con al menos 4 GPUs T4 y la infraestructura de computo correspondiente.
- No aplican opciones de despliegue como vLLM, llama.cpp u Ollama, al no existir pesos ni modelo.
- El consumo energetico total fue de 96.188 kWh, lo que da una idea del coste electrico del entrenamiento.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en cuanto a arquitectura o rendimiento, ya que este artefacto no es un modelo de IA. Existe otro registro similar en HuggingFace, `24f1002603/carbon-audit-model`, que probablemente sigue el mismo formato de auditoria de emisiones, pero no se proporcionan datos de comparacion.

| Artefacto | Tipo | Emisiones | Hardware | Licencia |
|---|---|---|---|---|
| akansharaghav/carbon-audit-t4-run | Registro de emisiones | 46.170 kg CO2eq | T4 ×4 | no disponible |
| 24f1002603/carbon-audit-model | Registro de emisiones | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA utilizable: no contiene pesos, arquitectura ni codigo de inferencia. Intentar cargarlo como un modelo clasico fallara.
- La informacion sobre el modelo entrenado es inexistente: se desconoce que arquitectura se entreno, con que dataset o con que configuracion de hiperparametros.
- Las emisiones estan estimadas con `codecarbon` y dependen de factores como la region y el PUE; pueden no reflejar el coste real exacto del entrenamiento.
- La licencia no esta especificada, por lo que el uso de este registro como referencia en publicaciones o proyectos requiere cautela.
- No se proporcionan datos de sesgos, alucinaciones o limitaciones de idioma porque no existe modelo subyacente.

## Enlaces

- Modelo en Hugging Face: [akansharaghav/carbon-audit-t4-run](https://huggingface.co/akansharaghav/carbon-audit-t4-run)
- Registro similar: [24f1002603/carbon-audit-model](https://huggingface.co/24f1002603/carbon-audit-model)
- Framework de emisiones de Watershed: https://watershed.com/blog/ai-emissions-framework
- Referencia sobre impacto ambiental de entrenamiento de IA: https://www.yallahtech.com/2026/08/the-environmental-footprint-of-training-large-ai-models.html
- Guia de uso de GPU NVIDIA T4 para LLMs: https://www.fitmyllm.com/blog/gpu/tesla-t4
