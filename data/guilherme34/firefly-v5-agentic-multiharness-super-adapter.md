# Guilherme34/Firefly-v5-agentic-multiharness-Super-Adapter

## Resumen

Firefly-v5-agentic-multiharness-Super-Adapter es un adaptador LoRA (formato PEFT) publicado por el usuario Guilherme34 sobre el modelo base `Guilherme34/Firefly-v5`. No se trata de un modelo completo, sino de un "super-adaptador" entrenado para convertir el modelo base en un modelo orientado a tareas de agente: uso de herramientas (tool calling), codigo y resolucion de tareas en multiples entornos de agente (harnesses). El autor lo describe como resultado de aplicar la receta Easy-Agenticify, combinando SFT correctivo y RL con GRPO sobre entornos de Harbor.

La relevancia tecnica del artefacto esta en su enfoque de entrenamiento: un adaptador compuesto por subespacios LoRA casi ortogonales (similitud coseno fuera de la diagonal media de 0,011) entrenados de forma independiente para once harnesses distintos (pi, claude-code, opencode, codex, hermes, mini-swe-agent, aider, terminus-2, openhands, kimi-cli y goose), con la idea de que puedan fusionarse linealmente sin interferencias. El adaptador se exporta en modo `super_adapter` con `rank=352` y `combination_type="cat"`.

La informacion publicada es escasa en cuanto a especificaciones del modelo base: no se detallan parametros totales, longitud de contexto ni arquitectura del modelo Firefly-v5 subyacente. El repositorio ocupa 0,2 GB, es coherente con un adaptador y no con pesos completos, y esta etiquetado unicamente en ingles con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base no especificado) |
| Parametros totales | no disponible (el adaptador es PEFT; el modelo base no detalla parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato PEFT en safetensors; cuantizacion del base no indicada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA, export mode `super_adapter`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Guilherme34/Firefly-v5` mediante la receta Easy-Agenticify, que combina un proxy de captura de tokens (OpenEnv RFC 006), el entorno Harbor y el stack TRL. El proceso consta de dos fases: un SFT correctivo sobre `FineEnvs/SmolDataEnvs-multiharness-sft` mas turnos de recuperacion sintetizados por "Model Doctor", y una fase posterior de RL con GRPO sobre el suite de entornos `FineEnvs/SmolDataEnvs-harbor-train`. El modo de pensamiento (`enable_thinking`) esta activado.

La innovacion principal es el esquema de super-adaptador ortogonal: se entrena un LoRA por harness con `rank=352` y se combinan con `combination_type="cat"`, obteniendo una similitud coseno media fuera de la diagonal de 0,011, lo que segun el autor permite fusiones lineales sin interferencia entre subespacios. El autor afirma que no quedan defectos criticos tras las dos fases (SFT correctivo y GRPO posterior). No se especifican numero de tokens de entrenamiento, composicion detallada del dataset ni hiperparametros de RL.

## Capacidades

- Generacion de codigo y resolucion de tareas de programacion en entornos de agente.
- Tool calling / function calling, con soporte explicito en vLLM mediante `--enable-auto-tool-choice`.
- Ejecucion en multiples harnesses de agente: pi, claude-code, opencode, codex, hermes, mini-swe-agent, aider, terminus-2, openhands, kimi-cli y goose.
- Modo de razonamiento (`enable_thinking=True`).
- Integracion con APIs compatibles con OpenAI y Anthropic (endpoints `OPENAI_BASE_URL` y `ANTHROPIC_BASE_URL`).
- Capacidades multilingues: solo ingles declarado.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Automatizacion de correccion de tests en repositorios: el adaptador esta entrenado para harnesses como aider, opencode o claude-code, de modo que puede conectarse a esos CLI apuntando a un servidor vLLM local y ejecutar tareas tipo "Fix tests" sobre el codigo del proyecto.
- Agente de codigo en pipelines de CI/CD: al soportar tool calling y servir mediante vLLM con `--enable-auto-tool-choice`, puede integrarse como paso de reparacion automatica de fallos de build o de tests en un flujo de integracion continua.
- Orquestacion multi-agente: el entrenamiento multi-harness permite usar el mismo adaptador con distintos frameworks de agente (openhands, mini-swe-agent, goose) sin reentrenar, lo que facilita comparar o combinar agentes sobre una misma politica.
- Sustitucion de backend en herramientas existentes: al exponer API compatible con OpenAI y Anthropic, puede actuar como backend local de Claude Code o Codex CLI cambiando solo las variables de entorno, util para entornos con requisitos de privacidad.
- Investigacion en RL para agentes: el artefacto sirve como referencia reproducible de la receta Easy-Agenticify (SFT correctivo + GRPO posterior) para estudiar la ortogonalidad de subespacios LoRA y la fusion de adaptadores.
- Despliegue de agentes de codigo en local: al ser un adaptador PEFT de 0,2 GB, permite experimentar con un modelo agentico sin descargar pesos completos adicionales mas alla del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas internas del entrenamiento: similitud coseno media fuera de la diagonal de 0,011 entre subespacios, `rank=352` y ausencia de defectos criticos tras las dos fases.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al depender del modelo base `Guilherme34/Firefly-v5`, cuyos parametros no se detallan.
- GPU recomendadas: no disponible por la misma razon; el adaptador en si ocupa 0,2 GB y se carga junto al modelo base.
- Compatibilidad con GPU de consumo: no disponible sin conocer el tamano del modelo base.
- Opciones de despliegue: vLLM con `--return-tokens-as-token-ids`, `--logprobs-mode processed_logprobs` y `--enable-auto-tool-choice`; el stack de entrenamiento usa TRL y Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores agenticos multi-harness) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un adaptador PEFT, no un modelo autonomo: requiere cargar el modelo base `Guilherme34/Firefly-v5`, cuyas caracteristicas y limitaciones no se documentan.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No hay benchmarks publicados que validen las afirmaciones del autor sobre ausencia de defectos criticos o calidad de tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados por el autor; heredados del modelo base y de los datasets de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base antes de desplegar en produccion.
- La receta depende de infraestructura especifica (OpenEnv, Harbor, TRL, vLLM con flags concretos); la reproducibilidad fuera de ese stack no esta garantizada.
- El entrenamiento con RL sobre entornos de agente puede producir comportamientos sobreajustados a los harnesses listados y degradar el rendimiento en otros frameworks.

## Enlaces

- Hugging Face: https://huggingface.co/Guilherme34/Firefly-v5-agentic-multiharness-Super-Adapter
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v5
- Dataset de RL: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Dataset de SFT: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-multiharness-sft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web.
