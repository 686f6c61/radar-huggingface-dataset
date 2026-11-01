# agentscope-ai/Piccolo-4B

## Resumen

Piccolo-4B es un modelo de decisión local desarrollado por agentscope-ai, afinado a partir de Qwen3.5-4B, disenado especificamente para emitir juicios estructurados en flujos de agentes. No es un modelo conversacional al uso: dado un estado (por ejemplo, una peticion del usuario o una operacion propuesta) y un conjunto de preguntas tipadas, devuelve probabilidades sobre respuestas candidatas de un solo token, sin generar texto explicativo. Su proposito principal es la revision de herramientas (tool review) y la compactacion de contexto dentro de QwenPaw, el entorno de agentes del mismo autor.

La relevancia tecnica del modelo esta en su contrato de inferencia: emplea atencion bidireccional en las capas de atencion completa (mientras las capas de atencion lineal conservan su computo original), lo que lo aleja del paradigma causal habitual. El modelo se evalua como un prompt completo y la probabilidad de cada candidata se extrae de los logits de un unico token a temperatura 1.0. Esto implica que no puede desplegarse como un chat causal estandar sin adaptar el enmascaramiento de atencion y la gestion de cache de prefijo.

Con 4.659.865.088 parametros y licencia Apache 2.0, Piccolo-4B se posiciona como un componente de infraestructura para sistemas multiagente que necesitan decisiones binarias o categoricas rapidas y locales (operaciones destructivas, necesidad de compactacion, aprobacion de acciones) en lugar de generacion abierta. El checkpoint publicado corresponde a la seleccion del 28 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion completa (bidireccional en prompt) y capas de atencion lineal; base Qwen3.5-4B |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el layout flex_twice se usa cuando el presupuesto de tokens de una pasada es como maximo 3.000) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (repositorios separados) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorios separados |

## Arquitectura y entrenamiento

Piccolo-4B parte de Qwen3.5-4B y se afina como modelo de decision. La innovacion arquitectonica clave es el uso de atencion bidireccional en las capas de atencion completa, mientras que las capas de atencion lineal mantienen su computo original. El modelo consume la entrada con el layout denominado flex_twice, con el modo thinking desactivado, y evalua cada pregunta como un prompt completo. Las probabilidades de las candidatas se obtienen de los logits de respuesta de un solo token a temperatura 1.0.

El modelo no genera texto explicativo ni JSON de probabilidades: la salida es directamente la distribucion sobre las respuestas candidatas. El layout repetido solo se emplea cuando el presupuesto de tokens de la peticion completa en una pasada es de 3.000 o menos y cada fila repetida cabe en el limite de contexto. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El repositorio incluye `piccolo_inference.py` y `piccolo_layout.py` como referencia de inferencia, y el layout incorpora codigo FlexDM con licencia MIT.

## Capacidades

- Juicio estructurado: responde preguntas tipadas (por ejemplo, tipo `noul`) devolviendo probabilidades sobre candidatas de un solo token.
- Revision de herramientas (tool review): evalua si una operacion propuesta es destructiva, peligrosa o requiere aprobacion.
- Compactacion de contexto: decide cuando el contexto de un agente debe resumirse o compactarse.
- Decisiones binarias y categoricas rapidas dentro de pipelines de agentes.
- Soporte de multiples preguntas por peticion mediante un objeto `questions` en la solicitud.
- Capacidades multilingues limitadas a ingles y chino.
- Integracion con QwenPaw como modelo de decision por defecto (modo Decision Model).
- No soporta generacion de texto abierta, tool calling conversacional ni razonamiento multi-paso en el sentido habitual.

## Casos de uso

- Revision de seguridad de acciones de agente: antes de ejecutar un comando de shell o una operacion de ficheros, Piccolo evalua la pregunta "podria esta operacion borrar o sobrescribir datos del usuario" y devuelve una probabilidad que el orquestador usa para bloquear o pedir confirmacion humana.
- Compactacion de contexto en agentes de larga duracion: el modelo decide si el historial acumulado debe resumirse, permitiendo gestionar ventanas de contexto sin intervencion manual.
- Puerta de aprobacion en pipelines de CI/CD: cada accion propuesta por un agente (despliegue, borrado de recursos, cambio de configuracion) se somete a preguntas tipadas y se compara contra umbrales definidos por el operador.
- Moderacion de operaciones en asistentes de escritorio: integrado en QwenPaw para interceptar acciones potencialmente destructivas antes de su ejecucion.
- Clasificacion de intencion en enrutadores multiagente: dado el estado de la conversacion, decidir que subagente o herramienta debe activarse segun probabilidades de candidatas.
- Evaluacion automatizada de politicas: comprobar de forma local y determinista si una accion cumple reglas definidas como preguntas estructuradas, sin depender de APIs externas.
- Filtrado previo en sistemas con requisitos de privacidad: al ejecutarse localmente en 4B parametros, permite tomar decisiones sin enviar el estado del agente a servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card para los pesos completos del checkpoint:

| Benchmark | Resultado |
|---|---|
| HarnessJevBench Hard (↑) | 65,59 % |
| DataJevBench (↑) | 69,60 % |
| JevBench Public (↑) | 87,01 % |
| Decision Index Public (↑) | 57,31 |

No se han publicado comparaciones con modelos similares en la informacion disponible. Los artefactos cuantizados tienen regresiones numericas separadas y no cuentan con puntuaciones de benchmark remedidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB de pesos, mas overhead de activaciones y cache; se recomienda al menos 12-16 GB de VRAM.
- Cuantizacion Q8_0: reduce el peso a aproximadamente la mitad; Q4_K_M lo reduce aun mas, con regresiones numericas documentadas en su model card.
- GPU recomendadas: A100 o H100 para produccion con mayor throughput; RTX 4090 (24 GB) para BF16; RTX 3090/4080 para cuantizaciones.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 16 GB o mas con margen ajustado, y con holgura en Q8_0 y Q4_K_M.
- Opciones de despliegue: `piccolo_inference.py` con Accelerate y CUDA como referencia; llama.cpp requiere un runtime adaptado con el layout de entrada de Piccolo, atencion bidireccional y scoring nativo en `/v1/systemone` (integracion en QwenPaw Draft PR #8463). Ollama estandar y Chat Completions causales no son implementaciones equivalentes.
- Latencia y throughput: no disponibles; dependen del artefacto y del runtime, y requieren validacion separada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en la documentacion proporcionada. Como referencia de base, el modelo parte de Qwen3.5-4B, pero Piccolo-4B no es intercambiable con un modelo causal de proposito general: su contrato de inferencia (atencion bidireccional, salida de probabilidades de un token) lo convierte en un componente especializado de decision.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-4B | 4,66 B | no disponible (presupuesto de 3.000 tokens en flex_twice) | Decision estructurada | Apache 2.0 | Hugging Face, GGUF Q8_0 y Q4_K_M |
| Qwen3.5-4B (base) | no disponible | no disponible | Generacion causal general | no disponible | Hugging Face |
| Alternativas de clasificacion de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No debe ejecutarse como un modelo de chat causal estandar: una carga correcta no garantiza que la mascara de atencion y las probabilidades de decision sean correctas.
- La reutilizacion de cache de prefijo y el chunked prefill requieren compatibilidad con el prompt bidireccional; la referencia proporcionada no usa ninguna de las dos.
- Las probabilidades de las candidatas describen la distribucion del modelo y no garantizan empiricamente la correccion de la decision.
- No se declaran umbrales de aprobacion calibrados; la revision de herramientas debe mantener un fallback de confirmacion humana y la compactacion de contexto debe conservar una ruta de recuperacion del contenido original.
- El error de cuantizacion, la latencia y la calidad dependen del artefacto y del runtime, y requieren validacion separada.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- El layout repetido solo es aplicable cuando la peticion completa cabe en 3.000 tokens en una pasada y cada fila repetida cabe en el limite de contexto.
- Ollama sin adaptar y las Chat Completions causales estandar no son implementaciones equivalentes; el despliegue en llama.cpp exige un runtime adaptado.
- La integracion en QwenPaw sigue en PR draft y requiere la adaptacion del runtime companero; arrancar el modelo no habilita por si solo las funciones de decision.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de robustez mas alla de los benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Decision Playground: https://decisionplayground.agentscope.io/
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Evaluacion y snapshots de release: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- Guia de configuracion local de QwenPaw: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- QwenPaw Draft PR #8463: https://github.com/agentscope-ai/QwenPaw/pull/8463
- GGUF BF16: https://huggingface.co/agentscope-ai/Piccolo-4B-BF16
- GGUF Q8_0: https://huggingface.co/agentscope-ai/Piccolo-4B-Q8_0
- GGUF Q4_K_M: https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M
- ModelScope (proximamente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
