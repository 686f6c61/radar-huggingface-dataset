# agentscope-ai/Piccolo-27B-Q8_0

## Resumen

Piccolo-27B-Q8_0 es la distribucion en formato GGUF con cuantizacion Q8_0 del modelo Piccolo-27B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: la model card lo describe como un *decision-model* orientado a la revision de herramientas (tool review) y la seleccion de contexto en entornos locales. Su pipeline declarado en Hugging Face es `text-classification`, y su funcion principal es devolver probabilidades sobre candidatos en lugar de generar tokens de respuesta.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 27B) y utiliza atencion bidireccional sobre el prompt, una eleccion poco habitual en modelos decoder-only que lo acerca a un uso de tipo encoder para puntuar alternativas. Soporta los idiomas ingles y chino, se distribuye bajo licencia Apache 2.0 y esta pensado para integrarse en flujos de agentes donde hay que decidir que herramienta invocar o que fragmento de contexto es relevante.

La relevancia de esta version Q8_0 radica en que permite ejecutar el modelo en local con llama.cpp (en un runtime especifico compatible con Piccolo) manteniendo una fidelidad numerica alta respecto al checkpoint completo: la diferencia maxima de probabilidad reportada en la validacion es de 0.00298326 sobre cuatro preguntas de prueba. El repositorio ocupa 28,6 GB repartidos en seis fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (decision-model) |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio); el backbone de texto se convirtio primero a BF16 GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (6 fragmentos, Q8_0) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados. Lo que si se explicita es que el modelo emplea atencion bidireccional en el prompt, lo que permite que cada token del contexto atienda tanto a los anteriores como a los posteriores. Esta caracteristica es coherente con su uso como modelo de decision: en lugar de generar texto autoregresivamente, puntua candidatos completos y devuelve probabilidades mediante un endpoint dedicado (`/v1/systemone`) sin producir tokens de respuesta.

El proceso de cuantizacion esta documentado: el backbone de texto se convirtio a BF16 GGUF y despues se cuantizo a Q8_0. La validacion numerica compara las probabilidades de candidatos frente al checkpoint completo, con una desviacion maxima de 0.00298326 en cuatro preguntas de prueba. No se mencionan detalles sobre RLHF, DPO ni otras fases de alineamiento en la informacion proporcionada.

## Capacidades

- Puntuacion de candidatos y devolucion de probabilidades sin generacion de tokens (endpoint `/v1/systemone`).
- Revision de herramientas (tool review): evaluacion de llamadas a herramientas propuestas por un agente.
- Seleccion de contexto: eleccion de fragmentos relevantes dentro de un contexto dado.
- Atencion bidireccional sobre el prompt, que permite condicionar la puntuacion al contexto completo.
- Soporte multilingue limitado a ingles y chino.
- Integracion en flujos conversacionales (tag `conversational` en Hugging Face).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de generacion libre, vision, audio ni tool calling generativo.

## Casos de uso

- Revision de llamadas a herramientas en agentes: antes de ejecutar una funcion propuesta por un LLM, Piccolo-27B-Q8_0 puntua la idoneidad de la llamada y permite descartar invocaciones erroneas o peligrosas sin coste de generacion.
- Seleccion de contexto en pipelines RAG: dado un conjunto de fragmentos candidatos, el modelo asigna probabilidades a cada uno para decidir cuales se incorporan al prompt final del modelo generativo.
- Enrutamiento de decisiones en sistemas multiagente: el modelo puede actuar como arbitro entre varias acciones candidatas, devolviendo la probabilidad relativa de cada una.
- Despliegue local con llama.cpp: al distribuirse en GGUF Q8_0, puede ejecutarse en infraestructura propia con el runtime compatible de Piccolo, util para entornos con requisitos de privacidad.
- Validacion de salidas en produccion: integrado como paso de control tras un modelo generativo, revisa si la accion propuesta es coherente con el contexto.
- Experimentacion e investigacion en modelos de decision: la atencion bidireccional y la puntuacion nativa de candidatos ofrecen una alternativa a los clasificadores tradicionales para estudiar seleccion de contexto.
- Flujos bilingues en ingles y chino: atencion a usuarios o sistemas en esos dos idiomas sin depender de un modelo generativo adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a la pagina de evaluacion del proyecto (`github.com/agentscope-ai/Piccolo/tree/main/evaluation`), pero no se incluyen cifras en el material proporcionado. El unico dato numerico de rendimiento es la validacion de cuantizacion: diferencia maxima de probabilidad de 0.00298326 respecto al checkpoint completo en cuatro preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio Q8_0 ocupa 28,6 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) para cargar los pesos completos; con overhead de runtime, se recomienda disponer de 32 GB o mas.
- GPU recomendadas: A100 40 GB, H100, L40S 48 GB o cualquier GPU con 32 GB o mas de VRAM. En configuraciones multi-GPU con offload a RAM tambien es viable.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090, 3090) en Q8_0 sin offload parcial a RAM del sistema; el rendimiento se degradara en ese escenario.
- Opciones de despliegue: llama.cpp con el runtime especifico compatible con Piccolo (atencion bidireccional y puntuacion nativa de candidatos). No se garantiza compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo base Piccolo-27B (BF16) es la alternativa directa a esta version cuantizada, con mayor precision numerica pero mayor requisito de memoria.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Piccolo-27B-Q8_0 | ~27B | no disponible | Apache 2.0 | GGUF Q8_0 |
| Piccolo-27B (base) | ~27B | no disponible | Apache 2.0 | safetensors/BF16 (segun repositorio base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de decision, no generativo: no debe esperarse que produzca texto libre; su salida son probabilidades sobre candidatos.
- Requiere un runtime especifico: la model card indica explicitamente que hay que usar el runtime llama.cpp compatible con Piccolo; otros runtimes pueden no soportar la atencion bidireccional ni la puntuacion nativa.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible, lo que dificulta planificar su uso en tareas con contextos muy largos.
- Riesgo de sesgo y alucinacion no evaluado en la informacion disponible; al tratarse de un modelo de puntuacion, el riesgo se traslada a decisiones erroneas de seleccion o revision.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) del repositorio.
- Validacion numerica limitada a cuatro preguntas de prueba; no constituye una garantia exhaustiva de equivalencia con el checkpoint completo.
- Escaso historial de adopcion (276 descargas, 0 likes en el momento de la consulta), lo que reduce la base de evidencia practica sobre su comportamiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- Repositorio del proyecto en GitHub: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime compatible: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope (modelo): https://www.modelscope.cn/models/AgentScope/Piccolo-27B-Q8_0
- ModelScope (coleccion): https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Validacion de cuantizacion: https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0/resolve/main/THIRD_PARTY_LICENSES.md
