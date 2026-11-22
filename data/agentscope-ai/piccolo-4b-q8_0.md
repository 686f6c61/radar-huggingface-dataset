# agentscope-ai/Piccolo-4B-Q8_0

## Resumen

Piccolo-4B-Q8_0 es la distribucion en formato GGUF con cuantizacion Q8_0 del modelo Piccolo-4B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: la model card lo describe como un "decision model" orientado a la revision local de herramientas (tool review) y a la seleccion de contexto, con una pipeline declarada de `text-classification`. El modelo emplea atencion bidireccional sobre el prompt y puntuacion nativa de candidatos, de modo que el endpoint `/v1/systemone` devuelve probabilidades sin generar tokens de respuesta.

El checkpoint completo contiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones) e incluye tensores de vision y auxiliares, aunque la conversion a GGUF se aplico al backbone de texto en BF16 y posteriormente se cuantizo a Q8_0. El repositorio ocupa 4,5 GB y esta publicado bajo licencia Apache 2.0, con soporte declarado de ingles y chino.

Su relevancia practica esta en el rol que ocupa dentro de un stack de agentes: en lugar de producir texto, evalua y puntua candidatos (por ejemplo, que herramienta invocar o que fragmento de contexto seleccionar) en un unico paso forward. Esto permite integrar una etapa de decision barata y determinista en pipelines de agentes, siempre que se use el runtime compatible especifico que exige el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (según tags y model card); backbone de texto con tensores de vision y auxiliares en el checkpoint completo |
| Parametros totales | 4.205.751.296 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (esta release); el modelo base se distribuye en otros formatos |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (text backbone convertido a BF16 GGUF y luego cuantizado a Q8_0) |

## Arquitectura y entrenamiento

La informacion disponible indica que Piccolo-4B es un modelo de decision construido sobre un backbone transformer con atencion bidireccional sobre el prompt, en lugar de la atencion causal tipica de los modelos generativos. Esta eleccion encaja con su tarea: puntuar candidatos completos (herramientas, fragmentos de contexto) requiere que cada token del candidato pueda atender a todo el contexto de entrada. El checkpoint completo conserva tensores de vision y auxiliares, aunque la release GGUF se centra en el backbone de texto.

No se han publicado en la informacion proporcionada detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card menciona un proceso de validacion numerica de la cuantizacion: sobre cuatro preguntas de prueba, la mayor diferencia de probabilidad de candidato respecto al checkpoint completo fue de 0,00564096, lo que sugiere una perdida de precision muy contenida en la conversion a Q8_0.

## Capacidades

- Puntuacion de candidatos: devuelve probabilidades sobre opciones predefinidas sin generar tokens de respuesta, mediante el endpoint `/v1/systemone`.
- Revision de herramientas (tool review): evalua si una herramienta o llamada propuesta es adecuada para el contexto dado.
- Seleccion de contexto: elige entre fragmentos de contexto candidatos en pipelines de agentes.
- Clasificacion de texto: pipeline declarada `text-classification`.
- Atencion bidireccional sobre el prompt, que permite condicionar la puntuacion al contexto completo.
- Soporte multilingue limitado a ingles y chino.
- No se documentan en la informacion disponible capacidades de generacion libre, tool calling generativo, agentes multi-paso, vision operativa en esta release ni modo de razonamiento explicito.

## Casos de uso

- Enrutado de herramientas en agentes: dado un turno de usuario y un catalogo de herramientas, Piccolo puntua cada candidata y el orquestador selecciona la de mayor probabilidad. Adecuado porque la decision se resuelve en un forward pass sin generar texto, reduciendo coste y latencia frente a un LLM generativo.
- Seleccion de contexto en RAG: entre varios fragmentos recuperados, el modelo puntua cual es mas relevante para la consulta antes de pasarlo al modelo generativo, filtrando ruido y ahorrando tokens de contexto.
- Validacion previa de llamadas a funciones: antes de ejecutar una tool call propuesta por otro modelo, Piccolo actua como revisor y asigna una probabilidad de adecuacion, permitiendo bloquear llamadas dudosas en produccion.
- Control de calidad en pipelines de agentes: integrado como etapa de decision entre el planificador y el ejecutor, verifica que la accion siguiente sea coherente con el estado de la conversacion.
- Despliegue local en estaciones de trabajo: al ser un GGUF Q8_0 de 4,5 GB, puede ejecutarse en hardware de consumo con el runtime compatible, util para entornos de desarrollo sin GPU de datacenter.
- Filtrado y triaje de entradas en ingles y chino: clasificacion de peticiones o candidatos en aplicaciones bilingues en esos dos idiomas.
- Evaluacion offline de agentes: uso como juez de decisiones en suites de evaluacion, comparando probabilidades asignadas a distintas opciones de referencia.

## Benchmarks y rendimiento

La model card enlaza a los resultados de evaluacion del proyecto (`https://github.com/agentscope-ai/Piccolo/tree/main/evaluation`), pero no se incluyen cifras de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion proporcionada. El unico dato numerico disponible es la validacion de cuantizacion: diferencia maxima de 0,00564096 en probabilidad de candidato respecto al checkpoint completo en cuatro preguntas de prueba.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para el archivo Q8_0, mas overhead del runtime y de la cache KV (no disponible la longitud de contexto, por lo que el overhead exacto no se puede calcular).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 6-8 GB de VRAM es candidata (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100).
- GPU de consumo: si, el modelo cabe en GPUs consumer de gama media con 8 GB o mas, siempre que se use el runtime compatible.
- Opciones de despliegue: requiere el runtime llama.cpp compatible con Piccolo (atencion bidireccional y puntuacion nativa de candidatos), documentado en `https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md`. No se garantiza compatibilidad con llama.cpp estandar, Ollama, vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (modelos de decision con atencion bidireccional para revision de herramientas y seleccion de contexto). Como referencia de tamano, se situa en la franja de 4B parametros, pero la comparacion funcional con modelos generativos de ese tamano no es directa por su distinta naturaleza.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-4B-Q8_0 | ~4,2 B | no disponible | Puntuacion de candidatos / decision | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; su uso esta acotado a puntuar candidatos predefinidos.
- Dependencia de runtime especifico: requiere el runtime llama.cpp compatible con Piccolo; el llama.cpp estandar u otras herramientas pueden no soportar la atencion bidireccional ni la puntuacion nativa de candidatos.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta documentado.
- Contexto maximo no documentado, lo que impide dimensionar con precision los requisitos de memoria en produccion.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible; al emitir probabilidades, el riesgo se traslada a calibracion incorrecta de las puntuaciones.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) del repositorio.
- Perdida de precision por cuantizacion: pequena pero existente (hasta 0,00564096 en probabilidad de candidato en las pruebas publicadas), relevante en umbrales de decision ajustados.
- Adopcion limitada: 715 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime compatible (QWENPAW): https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Resultados de evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope (modelo): https://www.modelscope.cn/models/AgentScope/Piccolo-4B-Q8_0
- ModelScope (coleccion): https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Validacion de cuantizacion: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0/resolve/main/THIRD_PARTY_LICENSES.md
