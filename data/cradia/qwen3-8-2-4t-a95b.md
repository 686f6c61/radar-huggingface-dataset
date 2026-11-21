# Cradia/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen y publicado en Hugging Face bajo el identificador Cradia/Qwen3.8-2.4T-A95B. Se trata de la primera release abierta de un modelo de la clase Qwen-Max, con 2,4 billones de parametros totales y 95 mil millones de parametros activos por token. El modelo se presenta como la generacion mas capaz de la familia Qwen de modelos abiertos hasta la fecha, construido sobre la base arquitectonica de Qwen3.5.

El modelo esta disenado para tareas de codigo, trabajo profesional, investigacion y tareas agenticas de largo horizonte. Incorpora un control flexible del razonamiento mediante el parametro `reasoning_effort` y la retencion de contexto de razonamiento en mensajes historicos mediante `preserve_thinking`. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens.

La relevancia de este lanzamiento radica en que traslada capacidades propias de un modelo propietario de clase Max a un formato abierto con pesos descargables en formato Transformers, compatible con motores de inferencia como vLLM, SGLang y TokenSpeed. El repositorio ocupa 4.892,4 GB, lo que refleja la escala del modelo y las exigencias de infraestructura para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model, MoE hibrido con Gated DeltaNet y Gated Attention |
| Parametros totales | 2.446.182.725.504 (2,4T) |
| Parametros activos | 95B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia "other", enlace a LICENSE) |
| Formato de pesos | safetensors (Transformers) |
| Dimension oculta | 8192 |
| Numero de capas | 92 |
| Layout oculto | 23 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Expertos | 512 en total, 10 enrutados + 1 compartido activados |
| Dimension intermedia de experto | 2048 |
| Token embedding | 248.320 (padded) |
| Cabezas de atencion lineal (Gated DeltaNet) | 128 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion (Gated Attention) | 64 para Q, 4 para KV; dimension de cabeza 256 |
| Dimension RoPE | 64 |
| MTP (Multi-Token Prediction) | entrenado con multiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con un layout hibrido que alterna bloques de atencion lineal y atencion completa, cada uno seguido de una capa MoE. Concretamente, cada grupo de cuatro capas se compone de tres bloques (Gated DeltaNet → MoE) seguidos de un bloque (Gated Attention → MoE), repetido 23 veces para un total de 92 capas. La Gated DeltaNet utiliza 128 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128, mientras que la Gated Attention emplea 64 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de dimension 64. La capa MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados mas 1 compartido, con dimension intermedia de 2048.

El modelo ha sido entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. Incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, una tecnica que permite predecir varios tokens futuros simultaneamente y que suele emplearse para decodificacion especulativa o para mejorar la eficiencia de inferencia. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre el uso especifico de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento avanzado con control flexible de profundidad mediante `reasoning_effort`.
- Retencion de contexto de razonamiento en mensajes historicos mediante `preserve_thinking`.
- Codigo y tareas de ingenieria de software, con mejoras sustanciales en benchmarks de coding agent.
- Tareas profesionales y de investigacion.
- Tareas agenticas de largo horizonte con planificacion autonoma y manejo de feedback del entorno.
- Finalizacion fiable de tareas multi-paso de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la model card menciona herramientas integradas en la version Qwen3.8-Max.
- Capacidades multilingues: no disponible.
- Vision: no soportada en esta release abierta; la version Qwen3.8-Max incluye entrada de vision.
- Modo thinking: si, con control mediante `reasoning_effort`; la version Max anade soporte non-thinking.

## Casos de uso

- Agente de codigo autonomo: el modelo puede ejecutar tareas de ingenieria de software de extremo a extremo, como resolver issues en repositorios, ejecutar comandos en terminal y validar cambios, gracias a su rendimiento en Terminal Bench 2.1 (86,6) y SWE-bench Pro. Su capacidad de planificacion autonoma y manejo de feedback del entorno lo hace adecuado para pipelines de CI/CD con agentes.
- Asistente de desarrollo en IDE: con 262.144 tokens de contexto nativo, puede mantener el estado de un proyecto completo en memoria y responder consultas sobre multiples ficheros, refactorizaciones y revisiones de codigo.
- Investigacion y analisis documental de largo alcance: la extension de contexto hasta 1.010.000 tokens permite procesar corpus extensos, informes o bases de codigo completas en una sola sesion.
- Automatizacion de tareas profesionales multi-paso: el modelo esta disenado para llevar tareas complejas hasta su finalizacion con mayor fiabilidad, lo que lo hace adecuado para flujos de trabajo que requieren planificacion, ejecucion y verificacion.
- Razonamiento con profundidad configurable: mediante `reasoning_effort` se puede ajustar el coste computacional y la latencia segun la dificultad de la consulta, usando razonamiento profundo para problemas complejos y razonamiento ligero para consultas simples.
- Despliegue en infraestructura propia compatible con vLLM, SGLang o TokenSpeed: al publicarse en formato Transformers con safetensors, puede integrarse en stacks de inferencia existentes sin depender del API propietario.
- Evaluacion comparativa de modelos de clase Max: sirve como referencia abierta para benchmarking frente a modelos propietarios como Opus 4.8, Fable 5 o GPT 5.6 Sol en tareas de coding agent.

## Benchmarks y rendimiento

Resultados publicados en la model card para benchmarks de coding agent. La columna Qwen3.8-Max corresponde a la version oficial basada en Qwen3.8-2.4T-A95B con caracteristicas adicionales.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | no disponible en el extracto |

No se han publicado en la informacion disponible resultados de benchmarks para el modelo base Qwen3.8-2.4T-A95B en otras categorias (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 2,4T de parametros totales, incluso en cuantizaciones agresivas el modelo requiere infraestructura multi-GPU de gran escala; el repositorio ocupa 4.892,4 GB en safetensors.
- GPU recomendadas: no disponible de forma explicita. Por la escala del modelo, se requiere un cluster multi-nodo con GPUs de datacenter (A100, H100 o superiores); no es viable en GPUs de consumo.
- Cabe en consumer GPU: no. El tamano del repositorio (4.892,4 GB) y los 2,4T de parametros lo descartan para RTX 4090 o similares.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Transformers. La model card indica compatibilidad con estos motores.
- Latencia y throughput estimados: no disponible.
- API gestionada: Qwen Cloud ofrece el servicio oficial sin mantenimiento de infraestructura.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (modelos de clase Max/frontier) segun los datos de la model card. No se dispone de informacion sobre parametros, contexto ni licencia de los modelos comparados.

| Modelo | Parametros | Contexto | Terminal Bench 2.1 | SWE-bench Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T totales / 95B activos | 262.144 (hasta 1.010.000) | 86,6 (Qwen3.8-Max) | no disponible | qwen3.8-max | Pesos abiertos en HF |
| Opus 4.8 | no disponible | no disponible | 84,6 | 69,2 | no disponible | no disponible |
| Fable 5 | no disponible | no disponible | 84,6 | 80,0 | no disponible | no disponible |
| GPT 5.6 Sol (max) | no disponible | no disponible | 88,8 | 64,6 | no disponible | no disponible |
| Qwen3.7-Max | no disponible | no disponible | 74,5 | 60,6 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no documentado en la model card; como modelo generativo de gran escala, es esperable, pero no se aportan datos concretos.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no esta disponible. El contexto nativo es de 262.144 tokens; la extension a 1.010.000 tokens puede requerir configuracion adicional y no se detalla su comportamiento en ese regimen.
- Restricciones de licencia: la licencia es "other" con nombre "qwen3.8-max" y enlace a LICENSE. No se detallan en la informacion disponible las condiciones para uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- La version abierta no incluye vision ni soporte non-thinking; esas capacidades solo estan disponibles en Qwen3.8-Max a traves de Qwen Cloud.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-21), por lo que no hay evidencia de comunidad ni validacion independiente.
- El coste de infraestructura para desplegar 2,4T de parametros es prohibitivo para la mayoria de equipos; el uso practico pasa por la API gestionada o por clusters multi-GPU.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre el rendimiento tras cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Cradia/Qwen3.8-2.4T-A95B
- Blog de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Qwen Studio: https://chat.qwen.ai/?models=qwen3.8-max
- Qwen Cloud: https://www.qwencloud.com
- Overview de Qwen3.8-Max: https://www.qwencloud.com/models/qwen3.8-max
