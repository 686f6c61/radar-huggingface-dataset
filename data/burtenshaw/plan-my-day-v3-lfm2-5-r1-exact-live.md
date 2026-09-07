# burtenshaw/plan-my-day-v3-lfm2.5-r1-exact-live

## Resumen

`plan-my-day-v3-lfm2.5-r1-exact-live` es un checkpoint de investigacion publicado por el usuario `burtenshaw`. Se trata de un adaptador PEFT (biblioteca `peft`) construido sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. La model card indica explicitamente que es un "Research checkpoint for synthetic four-choice schedule ranking" y que no se ha promocionado automaticamente.

El objetivo del checkpoint es resolver una tarea de ranking de horarios sinteticos con cuatro opciones, probablemente como parte de un pipeline de planificacion personal. El repositorio ocupa 0.1 GB, no tiene descargas ni likes, y no se han publicado especificaciones tecnicas detalladas ni benchmarks. Al ser un adaptador PEFT, no es un modelo autonomo: requiere el modelo base para funcionar.

Dada la escasez de informacion publica, esta ficha se limita a los datos disponibles en Hugging Face y en la model card del autor. No se han podido verificar capacidades, rendimiento o casos de uso reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura del modelo base no disponible) |
| Parametros totales | No disponible; adaptador de 0.1 GB sobre modelo base de 1.2B |
| Parametros activos | No disponible (no se ha confirmado si el modelo base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La informacion publicada no incluye detalles sobre la arquitectura del modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. El checkpoint en si es un adaptador PEFT, lo que implica que solo contiene los pesos ajustados (probablemente LoRA o similar) y no los pesos completos del modelo. El tamano del repositorio, 0.1 GB, confirma que se trata de un adaptador ligero.

Segun la model card, el entrenamiento se ha realizado para una tarea de "synthetic four-choice schedule ranking": ordenar o seleccionar entre cuatro opciones de horario generadas sinteticamente. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. La model card menciona un "frozen source" y un hash de datos, lo que sugiere un protocolo de evaluacion reproducible, pero no aporta detalles tecnicos.

## Capacidades

- No se han documentado capacidades generales de generacion de texto, razonamiento, codigo o matematicas para este checkpoint.
- La unica tarea descrita es el ranking de horarios sinteticos con cuatro opciones.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre soporte de agentes o razonamiento multi-step.
- No hay informacion sobre capacidades multilingues, vision o audio.
- Al ser un adaptador PEFT sobre un modelo instructivo, se espera que herede las capacidades del modelo base, pero esto no ha sido verificado ni documentado.

## Casos de uso

No se han publicado casos de uso concretos en la informacion disponible. El checkpoint es un artefacto de investigacion y no existe documentacion sobre aplicaciones reales o en produccion.

- No disponible: no se han documentado aplicaciones practicas para este checkpoint.
- No disponible: no existe informacion sobre uso en produccion o integracion con sistemas reales.
- No disponible: la unica tarea mencionada es el ranking de horarios sinteticos, sin casos de uso concretos.
- No disponible: no se han publicado integraciones con herramientas, agentes o plataformas.
- No disponible: no hay evaluaciones de idoneidad para escenarios de negocio o de usuario final.
- No disponible: no se han descrito flujos de trabajo ni arquitecturas de despliegue recomendadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al ser un adaptador PEFT de 0.1 GB, el requisito de VRAM adicional sobre el modelo base es minimo, pero los requisitos totales dependen de `LiquidAI/LFM2.5-1.2B-Instruct`, cuyos datos no estan disponibles.
- No se ha confirmado si el modelo puede ejecutarse en GPU de consumo; depende del modelo base.
- Opciones de despliegue: no disponible. No se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado datos de rendimiento ni comparaciones con otros modelos, y no se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo listo para produccion.
- No se han publicado evaluaciones de sesgos, seguridad o alucinacion.
- La licencia `lfm-open-license-1.0` puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia antes de cualquier uso.
- No hay informacion sobre la calidad de las predicciones fuera de la tarea de ranking de horarios sinteticos.
- El adaptador requiere el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`; sin el, no es funcional.
- No se han documentado limitaciones de contexto o idioma, por lo que cualquier uso en escenarios multilingues o de contexto largo es incierto.
- El modelo no ha sido validado de forma independiente; no se recomienda su uso sin una evaluacion previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/burtenshaw/plan-my-day-v3-lfm2.5-r1-exact-live
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/tree/main/trials/r1-exact-live
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
