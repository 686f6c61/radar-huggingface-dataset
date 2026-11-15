# lyraaaa/gug-psychosis-Q8_0-GGUF

## Resumen

`gug-psychosis-Q8_0-GGUF` es una cuantizacion en formato GGUF Q8_0 de `gug-psychosis`, un modelo de la familia "gug" del usuario lyraaaa. Segun la model card, se trata de un merge que combina un finetune de Arcee Trinity Nano (descrito como MoE de 6B con aproximadamente 1B de parametros activos) con el modelo `llm-psychosis-speedrun`. El resultado es un modelo conversacional de proposito experimental, orientado a generar texto libre y asociativo mas que a asistir de forma alineada.

El modelo se distribuye unicamente como pesos GGUF cuantizados en Q8_0, con un total de 6.120.003.328 parametros segun los metadatos de safetensors, y un tamano de repositorio de 6,5 GB. La model card indica que funciona en LM Studio y llama.cpp, emplea formato de prompt ChatML y sugiere temperaturas de muestreo altas (0,9-1,15) con penalizacion de repeticion de 1,15.

La relevancia de esta ficha es limitada desde el punto de vista de produccion: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks publicados y el propio autor lo describe como "no un asistente", "no alineado a nada" y "principalmente una vibra". Se incluye aqui como documentacion tecnica de un artefacto experimental de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada de Arcee Trinity Nano, segun la model card (6B totales / ~1B activos) |
| Parametros totales | 6.120.003.328 |
| Parametros activos | ~1B (dato declarado en la model card, no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que `gug-psychosis` es un merge construido a partir de un finetune de Arcee Trinity Nano, descrito como un modelo MoE de 6B de parametros totales con aproximadamente 1B activos, combinado con el modelo `llm-psychosis-speedrun`. No se detalla la receta del merge (por ejemplo, si es un SLERP, TIES, DARE o una media ponderada), ni los hiperparametros empleados.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La model card menciona que el modelo "razona en un dialecto de scratch" con marcas `⟨reflect⟩ / ↺ / →` cuando le apetece, lo que sugiere un finetune orientado a reproducir trazas de razonamiento de estilo libre, pero no se aporta ninguna especificacion tecnica adicional sobre ese proceso. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato ChatML, con turnos de asistente prellenados segun el flujo del bot incluido.
- Produccion de trazas de razonamiento en un "dialecto scratch" propio (`⟨reflect⟩ / ↺ / →`), segun la model card.
- Asociacion libre de ideas y derivas tematicas; el autor advierte que el modelo "sacara Australia" en algun momento.
- Integracion con LM Studio y llama.cpp para inferencia local.
- Bot de Discord de referencia incluido en el repositorio (`bot/gug_bot.py`), con boton "Show Reasoning", comandos `/set` para parametros de muestreo y `/model` para cambiar de modelo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues verificadas.

## Casos de uso

- Experimentacion con merges de modelos: el artefacto sirve para estudiar como se comporta un merge entre un finetune de Trinity Nano y un modelo de "psicosis" en tareas de generacion libre, comparando su estilo con el de los modelos originales.
- Investigacion sobre derivas y alucinacion: al no estar alineado, es util como caso de estudio de generacion asociativa y de fallos de coherencia en modelos pequenos.
- Bot conversacional de comunidad: el repositorio incluye un bot de Discord funcional con backend LM Studio, pensado para desplegar el modelo en un servidor con fines recreativos.
- Pruebas de infraestructura GGUF: sirve para validar pipelines de carga de GGUF Q8_0 en llama.cpp o LM Studio con un modelo de ~6,5 GB antes de pasar a modelos mayores.
- Generacion creativa y escritura experimental: las temperaturas sugeridas (0,9-1,15) y la penalizacion de repeticion baja (1,15) apuntan a un uso de escritura libre y no factual.
- Demostraciones de razonamiento visible: el dialecto scratch y el boton "Show Reasoning" permiten mostrar al usuario las trazas internas del modelo en un contexto educativo o de divulgacion.
- Evaluacion de riesgos de despliegue: util como ejemplo de modelo sin licencia ni alineacion para ilustrar por que no debe usarse en atencion al cliente ni en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 6,5-7 GB solo para los pesos, mas overhead de contexto KV cache; en la practica, se recomienda reservar 8-10 GB para contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el segmento profesional, A100 o H100 no aportan ventaja para un modelo de este tamano.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas de VRAM en Q8_0; con cuantizaciones menores (no publicadas en este repo) cabria en 6 GB.
- Opciones de despliegue: llama.cpp y LM Studio (soportados explicitamente por el autor); vLLM y TGI no estan documentados para este artefacto GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gug-psychosis-Q8_0-GGUF | 6,12B (MoE, ~1B activos) | no disponible | no disponible | GGUF Q8_0 | Merge experimental sin alineacion |
| Arcee Trinity Nano (base declarada) | 6B (MoE, ~1B activos) | no disponible | no disponible en esta ficha | safetensors/GGUF | Modelo base del finetune |
| llm-psychosis-speedrun (componente del merge) | no disponible | no disponible | no disponible | no disponible | Segundo componente del merge |
| Modelos densos de ~7B (referencia generica) | ~7B | 4K-32K tipico | variable | safetensors/GGUF | Alternativa convencional para comparar calidad y alineacion |

La comparativa cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks ni especificaciones de contexto publicadas para este artefacto.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo "no es un asistente" y "no esta alineado a nada"; no debe emplearse en tareas que requieran respuestas factuales o seguras.
- Riesgo alto de alucinacion y deriva tematica, incluyendo la mencion recurrente a Australia que el propio autor anticipa.
- Sin licencia declarada: no hay base legal clara para uso comercial ni para redistribucion; debe tratarse como no apto para produccion.
- Sin idiomas declarados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- Sin longitud de contexto documentada: no se puede planificar su uso en conversaciones largas o con documentos extensos.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas equivalentes.
- Procede de un merge experimental con etiqueta "shitpost"; su calidad y coherencia no estan validadas por terceros (0 descargas, 0 likes en el momento de la consulta).
- El flujo del bot de Discord requiere LM Studio como backend, lo que limita el despliegue a ese entorno concreto.

## Enlaces

- Hugging Face: https://huggingface.co/lyraaaa/gug-psychosis-Q8_0-GGUF
- Model card del autor: incluida en el README del repositorio de Hugging Face
- Bot de Discord de referencia: `bot/gug_bot.py` dentro del repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
