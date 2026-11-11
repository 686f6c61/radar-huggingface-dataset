# BH-Language-AI/bs-qwen35-9b-agent-nonthink-q8-bundle

## Resumen

AgentMujo Q8 9B v1.0 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B desarrollado por BH-Language-AI, orientado especificamente a la generacion de llamadas a funciones (function calling) y a flujos de agentes en lengua bosnia. El modelo parte de una base de 8.953.803.264 parametros (aproximadamente 9B) con arquitectura transformer densa, hidden size de 4096, 32 capas y un vocabulario de 248.320 tokens, y se distribuye exclusivamente en formato GGUF con cuantizacion Q8.

El problema que aborda es concreto: los modelos multilingues genericos rinden de forma irregular cuando se les exige emitir llamadas a herramientas con argumentos correctos en bosnio y bajo un prompt de produccion sin especificacion de formato explicita. El autor documenta un proceso iterativo de SFT (r16 y r64) seguido de DPO que eleva la tasa de acierto en tool calling del 0.60 al 0.70 en su propio banco de pruebas (AgentMujo-Bench v0.5, 48 casos), con un task_success de 0.979 en el protocolo de bucle completo.

La relevancia actual reside en su especializacion: no es un modelo generalista, sino un artefacto de produccion con metricas declaradas, versionado por iteraciones (gold01 a gold06) y una decision explicita de congelar gold06 como version final tras comprobar rendimientos decrecientes en DPO adicional. La licencia Apache-2.0 y la compatibilidad con endpoints facilitan su integracion en infraestructura existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (GGUF); el repositorio solo publica ficheros Q8 |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model-q8-gold06.gguf` y versiones anteriores) |

Datos adicionales de la arquitectura base declarados en la model card: hidden size 4096, 32 capas, vocabulario de 248.320 tokens.

## Arquitectura y entrenamiento

El modelo es un fine-tune sobre Qwen/Qwen3.5-9B (commit `c20223623`), un transformer denso de aproximadamente 9B parametros. El entrenamiento se estructura en dos fases. La primera es SFT con LoRA: una etapa inicial con rango r16 sobre los conjuntos jt01 a jt05, seguida de rango r64 sobre r6401 a r6406 con una mezcla (mix v0.35) que, segun el autor, alcanzaba un techo de 0.60 en tool calling solo cuando se proporcionaba una especificacion de formato explicita. La segunda fase, denominada dialect-dense, produce las iteraciones gold01 a gold06, donde se ajusta el comportamiento para que el formato funcione bajo el prompt de produccion por defecto, sin spec de formato.

Sobre gold04 se aplica DPO (DPO-03, rango r16) para corregir el sesgo de invocacion excesiva de herramientas en conversacion trivial (chitchat), elevando la metrica notool de 0.25 a 0.50. Una iteracion posterior, gold08, anade DPO-04 con 60 pares adicionales y no mejora los resultados, lo que lleva al autor a declarar gold06 como version final. El autor documenta tambien una regresion intermedia (gold03) causada por sesgo hacia respuestas de tipo listado, corregida en gold04. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto conversacional en bosnio.
- Function calling / tool calling con generacion de argumentos estructurados (metrica args de 0.846 en gold06).
- Salida JSON valida en el 100% de los casos evaluados (metrica json 1.0).
- Operacion en modo agente multi-paso: el protocolo de bucle (modelo + policy + executor) alcanza task_success de 0.979.
- Manejo de escenarios multi-herramienta (metrica multi de 0.75 en gold06).
- Comportamiento de verificacion previa a la accion (check-then-ask) en lugar de actuacion ciega, disenado intencionadamente por seguridad.
- Capa de rechazo y seguridad (metricas refusal 0.8 y safety 0.857).
- Perfil non-think: el modelo se distribuye sin modo de razonamiento extendido; el autor indica que el perfil think no forma parte del release.
- No se declaran capacidades de vision, audio ni otros dominios.

## Casos de uso

- Automatizacion de atencion al cliente en bosnio: el modelo puede gestionar turnos conversacionales y decidir cuando invocar una herramienta (consulta de pedido, cambio de direccion) frente a cuando responder directamente, con una tasa de acierto de invocacion del 0.70 en el banco del autor. La limitacion conocida de invocar herramientas en exceso en conversacion trivial exige una capa de politica que filtre el exceso, tal como el propio autor recomienda.
- Backend de agentes para integracion de sistemas empresariales: con task_success de 0.979 en el protocolo de bucle, es adecuado para pipelines donde el modelo propone acciones, un ejecutor las valida y el resultado se realimenta al modelo en pasos sucesivos.
- Extraccion estructurada de datos desde texto libre: la tasa de JSON valido del 1.0 y la generacion de argumentos con 0.846 de acierto lo hacen util para convertir mensajes de usuario en payloads de API.
- Despliegue en infraestructura local o soberana: al distribuirse en GGUF Q8 y con licencia Apache-2.0, encaja en entornos con requisitos de residencia de datos o sin acceso a APIs externas, ejecutandose sobre llama.cpp u Ollama.
- Prototipado de asistentes de voz o chat para el mercado bosnio: es uno de los pocos ajustes publicos especializados en bosnio con metricas de agente declaradas, lo que reduce el trabajo de adaptacion linguistica inicial.
- Evaluacion comparativa de tecnicas de alineacion: el repositorio conserva todas las iteraciones (gold01 a gold06, v0.1 a v0.6, dpo01) y los adaptadores, lo que permite reproducir el efecto de SFT y DPO sobre una metrica concreta.

## Benchmarks y rendimiento

Resultados declarados por el autor en AgentMujo-Bench v0.5 (48 casos), prompt de produccion por defecto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | gold01 | gold02 | gold03 | gold04 | gold05 | gold06 (final) | gold08 |
|---|---|---|---|---|---|---|---|
| Gate tool | 0.60 | 0.633 | 0.50 | 0.70 | 0.667 | 0.70 | 0.667 |
| Gate args | 0.654 | 0.731 | 0.50 | 0.885 | 0.808 | 0.846 | 0.808 |
| Gate notool | no disponible | no disponible | no disponible | 0.25 | no disponible | 0.50 | 0.25 |
| Gate high | no disponible | no disponible | no disponible | 1.0 | no disponible | 0.8 | no disponible |
| Gate multi | no disponible | no disponible | no disponible | 0.8 | no disponible | 0.75 | no disponible |
| Gate json | no disponible | no disponible | no disponible | 1.0 | no disponible | 1.0 | no disponible |
| Gate safety | no disponible | no disponible | no disponible | 0.857 | no disponible | 0.857 | no disponible |
| Gate refusal | no disponible | no disponible | no disponible | 0.8 | no disponible | 0.8 | no disponible |
| Loop tool | no disponible | no disponible | no disponible | 0.80 | no disponible | 0.833 | 0.80 |
| Loop strict | no disponible | no disponible | no disponible | 0.708 | no disponible | 0.75 | 0.75 |
| Loop task_success | no disponible | no disponible | no disponible | no disponible | no disponible | 0.979 | 1.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.953.803.264 parametros en Q8 (aproximadamente 8 bits por peso), el peso del modelo ronda los 9 GB; sumando overhead de contexto y cache KV, se recomienda un minimo de 12 GB de VRAM y 16 GB para margenes comodos con contextos largos. El tamano del repositorio (85,7 GB) se debe a que contiene multiples ficheros GGUF de las distintas iteraciones, no a un unico peso.
- GPU recomendadas: RTX 4090 (24 GB) para uso individual; A100 o H100 para despliegues con concurrencia; L4 o RTX 3090 como minimo practico.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en Q8; con 8 GB seria necesario recurrir a cuantizaciones menores, que no se publican en este repositorio.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API, aunque no se detalla el servidor concreto. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMujo Q8 9B (este) | 8,95B | no disponible | Function calling y agentes en bosnio | Apache-2.0 | GGUF Q8 |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Proposito general multilingue | Apache-2.0 | safetensors y derivados |
| Alternativas especializadas en bosnio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros ajustes finos publicos comparables en bosnio con metricas de agente declaradas, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Invocacion excesiva de herramientas en conversacion trivial: la metrica notool es de 0.50 en gold06 (0.25 en gold04), lo que significa que el modelo tiende a proponer llamadas a funciones ante mensajes de chitchat. El autor recomienda una capa de politica que filtre el exceso; sin ella, el comportamiento en produccion sera erroneo en la mitad de estos casos.
- Cobertura limitada a un unico idioma: el modelo declara solo bosnio (bs). Su rendimiento en castellano, ingles u otros idiomas no esta documentado y probablemente degrade respecto a la base Qwen3.5-9B.
- Ausencia de modo de razonamiento: el perfil think no forma parte del release, por lo que no debe esperarse razonamiento extendido en tareas complejas de multiples pasos mas alla de la orquestacion de herramientas.
- Benchmarks propietarios y de muestra pequena: todas las metricas provienen de AgentMujo-Bench v0.5 con 48 casos, disenado por el propio autor. No hay validacion independiente ni resultados en benchmarks estandar, lo que limita la comparabilidad.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo linguistico, cultural o de genero.
- Riesgo de alucinacion en argumentos: aunque la metrica args es 0.846, un 15% de argumentos incorrectos en llamadas a herramientas puede provocar acciones erroneas en sistemas con efectos secundarios; se recomienda validacion en el ejecutor.
- Versionado confuso: el repositorio contiene 13 ficheros GGUF de distintas iteraciones, algunas con regresiones conocidas (gold03). Solo gold06 debe usarse en despliegue, segun el autor.
- Fecha de creacion futura: los metadatos indican creacion el 2026-11-11, lo que debe tenerse en cuenta al evaluar la madurez y el soporte del proyecto.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no exime de las obligaciones de atribucion correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-q8-bundle
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Repositorio del framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
