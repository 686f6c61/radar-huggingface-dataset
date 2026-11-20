# furiosa-ai/EXAONE-4.0-32B-FP8

## Resumen

EXAONE-4.0-32B-FP8 es la variante cuantizada a FP8 del modelo EXAONE 4.0 de 32B desarrollado por LG AI Research, empaquetada por Furiosa AI en un bundle ejecutable (FXB) para su acelerador RNGD. Se trata de un transformer denso autorregresivo de 32.003.216.384 parametros (dato real del safetensors) que unifica un modo de instruccion general sin razonamiento con un modo de razonamiento activable por peticion, e incorpora soporte nativo de tool calling y uso agentico. El modelo cubre tres idiomas: ingles, coreano y espanol.

La relevancia de esta publicacion radica en que demuestra la viabilidad de servir un modelo de 32B en precision FP8 sobre hardware no-GPU (el acelerador RNGD de Furiosa AI), con un plan de paralelismo de tensor de 32 PEs mapeado a cuatro tarjetas RNGD. Las activaciones se cuantizan dinamicamente a FP8 en tiempo de ejecucion (por token y por bloque), mientras que la cache KV se mantiene en 16 bits, lo que reduce el consumo de memoria sin degradar la precision del contexto.

El modelo base es LGAI-EXAONE/EXAONE-4.0-32B-FP8, y esta publicacion anade unicamente el bundle de ejecucion y los parsers de razonamiento (`exaone4`) y de tool calling (`hermes`) para Furiosa-LLM. La licencia es la EXAONE AI Model License Agreement 1.2 - NC, de tipo "other" y con restricciones de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EXAONE 4.0 (transformer denso autorregresivo) |
| Parametros totales | 32.003.216.384 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico en pesos; FP8 dinamico en activaciones (por token / por bloque); cache KV en 16 bits |
| Idiomas soportados | en, ko, es |
| Licencia | EXAONE AI Model License Agreement 1.2 - NC (no comercial) |
| Formato de pesos | safetensors; bundle ejecutable FXB para Furiosa RNGD |

## Arquitectura y entrenamiento

El modelo es un transformer denso autorregenerativo de arquitectura EXAONE 4.0, con 32.003.216.384 parametros totales y sin componentes de mezcla de expertos. La innovacion funcional principal es su caracter hibrido: por defecto opera en modo sin razonamiento (respuesta directa de instruccion general) y permite activar un modo de razonamiento por peticion mediante el flag `enable_thinking` en `chat_template_kwargs`. Cuando se activa y el servidor se lanza con `--reasoning-parser exaone4`, la cadena de pensamiento se devuelve en un campo separado (`message.reasoning` en no-streaming, `delta.reasoning` en streaming) del contenido final.

En cuanto a la cuantizacion, los pesos se almacenan en FP8 estatico siguiendo la release FP8 upstream, y las activaciones se cuantizan dinamicamente a FP8 en runtime con granularidad por token y por bloque; la cache KV permanece en 16 bits. El modelo base upstream es LGAI-EXAONE/EXAONE-4.0-32B-FP8. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, coreano y espanol.
- Modo de razonamiento activable por peticion (`enable_thinking`), con separacion de la cadena de pensamiento del contenido final.
- Modo sin razonamiento por defecto para instruccion general de baja latencia.
- Tool calling / function calling nativo, mediante el parser `hermes` (formato EXAONE-4.0).
- Uso agentico y razonamiento multi-paso gracias a la combinacion de reasoning y tool calling.
- API compatible con OpenAI (endpoint `/v1/chat/completions`).
- Soporte de streaming con campo `delta.reasoning` separado cuando el razonamiento esta activo.
- Capacidades multilingues limitadas a en, ko y es.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo gestiona conversaciones multi-turno en ingles, coreano y espanol, y su modo sin razonamiento por defecto permite respuestas rapidas para consultas rutinarias, activando razonamiento solo en casos complejos.
- Agentes de soporte tecnico con tool calling: integrado con el parser `hermes`, el modelo puede invocar funciones (consulta de estado de pedidos, apertura de tickets, busqueda en base de conocimiento) dentro de flujos agenticos multi-paso.
- Generacion de codigo asistida en pipelines: el soporte de function calling permite integrar el modelo en herramientas de CI/CD que consulten APIs, ejecuten tests o generen parches, con razonamiento activable para depuracion de errores complejos.
- Analisis y razonamiento sobre documentos en espanol: el modo de razonamiento permite descomponer tareas de sintesis, comparacion y extraccion de conclusiones sobre textos largos, con la cadena de pensamiento auditable por separado.
- Despliegue soberano sobre aceleradores Furiosa RNGD: organizaciones que operan infraestructura no-GPU pueden servir un modelo de 32B en FP8 con paralelismo de tensor de 32 PEs sobre cuatro tarjetas RNGD, manteniendo la inferencia en hardware propio.
- Asistentes de razonamiento con trazas auditables: al devolver el chain of thought en un campo separado, el modelo es adecuado para entornos donde se requiere revisar el proceso de razonamiento (por ejemplo, evaluacion de respuestas o cumplimiento normativo interno).
- Prototipado rapido con API OpenAI-compatible: desarrolladores pueden apuntar clientes existentes (SDK de OpenAI, OpenAI Agents SDK) al endpoint local de Furiosa-LLM sin reescribir la integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD (acelerador no-GPU), con soporte oficial mediante Furiosa-LLM.
- Paralelismo: tensor-parallel size de 32 PEs, que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta).
- VRAM estimada: no disponible para GPU; el modelo se sirve en RNGD con pesos FP8 y cache KV en 16 bits.
- GPU consumer: no se documenta soporte en GPU consumer en esta publicacion; el modelo base upstream puede ejecutarse en vLLM, SGLang y Transformers, pero los requisitos concretos de VRAM no se detallan en la informacion disponible.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), y para el modelo upstream vLLM, SGLang y Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware / despliegue |
|---|---|---|---|---|
| EXAONE-4.0-32B-FP8 (furiosa-ai) | 32.003.216.384 | no disponible | EXAONE 1.2 - NC (no comercial) | Furiosa RNGD via Furiosa-LLM |
| LGAI-EXAONE/EXAONE-4.0-32B-FP8 (upstream) | 32B (FP8) | no disponible | EXAONE 1.2 - NC (no comercial) | vLLM, SGLang, Transformers |
| Alternativas de 32B densas | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: la EXAONE AI Model License Agreement 1.2 - NC restringe el uso comercial; es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en produccion.
- Cobertura idiomatica limitada a ingles, coreano y espanol; otros idiomas pueden degradar la calidad de forma significativa.
- Riesgo de alucinacion inherente a los modelos generativos de 32B, especialmente en modo sin razonamiento y en dominios especializados.
- El modo de razonamiento esta desactivado por defecto; si no se activa explicitamente mediante `enable_thinking`, no se obtiene cadena de pensamiento ni beneficios de razonamiento multi-paso.
- El campo `reasoning` no forma parte de la especificacion de la API de OpenAI; acceder a el cuando no hay contenido de razonamiento provoca un `AttributeError`, lo que exige manejo defensivo en clientes.
- Dependencia de hardware especifico: esta publicacion esta orientada a FuriosaAI RNGD; fuera de ese hardware debe usarse el modelo upstream con otros frameworks.
- La cuantizacion FP8 puede introducir perdida de precision frente a la version en BF16/FP16, no cuantificada en la informacion disponible.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/furiosa-ai/EXAONE-4.0-32B-FP8
- Modelo base upstream: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B-FP8
- Licencia EXAONE 1.2 - NC: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B-FP8/blob/main/LICENSE
- Furiosa AI: https://furiosa.ai
- Documentacion de Furiosa-LLM (instalacion): https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
