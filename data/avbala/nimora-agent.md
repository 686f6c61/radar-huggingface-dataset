# AVBala/nimora-agent

## Resumen

Nimora Agent v0.0.1-alpha es un adaptador experimental de tipo QLoRA desarrollado por AVBala sobre el modelo base Qwen/Qwen3-4B. Su propósito no es ser un modelo de lenguaje general, sino actuar como controlador dentro del runtime de agente de codificación de código abierto Nimora: dado un estado del repositorio y una instrucción, debe seleccionar una única acción pequeña y verificable, invocar herramientas de workspace/Git/cambios y devolver una decisión en JSON canónico. El adaptador está pensado para usarse exclusivamente junto con el runtime Nimora, que proporciona la instrucción de sistema, las observaciones del repositorio, la ejecución de herramientas, las políticas de aprobación y el control de revisiones.

El modelo se entrenó con 400 ejemplos sintéticos de tipo prefijo-a-siguiente-decisión, con contexto de 2048 tokens, en una única Tesla T4 durante 805 segundos. La evaluación interna sobre 40 casos held-out muestra una conformidad del 100% en semántica de acción/resultado y del 97,5% en argumentos exactos, frente al 27,5% y 20% del modelo base sin adaptar. Sin embargo, estos resultados miden solo la adherencia a un protocolo sintético determinista y no son comparables con benchmarks independientes como SWE-bench. El adaptador se distribuye bajo licencia Apache-2.0 y está disponible en HuggingFace con un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (rank 16, alpha 32) sobre Qwen3-4B (Transformer decoder) |
| Parametros totales | Adaptador: no publicado; modelo base: 4B (Qwen3-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (según configuracion de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 (base durante entrenamiento); adaptador en precision nativa (no especificada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-4B, un modelo Transformer decoder con 4.000 millones de parametros. Sobre este se aplica QLoRA con cuantizacion 4-bit NF4, rank 16 y alpha 32, lo que permite un ajuste eficiente con un coste de entrenamiento muy reducido. El entrenamiento se realizo con 400 ejemplos de entrenamiento, 40 de validacion y 40 de evaluacion held-out, todos generados a partir de plantillas sinteticas deterministas creadas especificamente para el protocolo Nimora. La supervision se aplico sobre el ultimo turno de asistente en ejemplos de tipo prefijo-a-siguiente-decision, con una longitud de contexto de 2048 tokens. El entrenamiento completo duro 805 segundos en una Tesla T4, y la perdida final de validacion fue de 0,004358. No se utilizaron tecnicas como RLHF o DPO; el metodo es exclusivamente supervisado sobre datos sinteticos.

## Capacidades

- Generacion de decisiones en JSON canonico con dos formatos posibles: `{"plan":"...","action":{"name":"...","arguments":{}}}` o `{"result":"..."}`.
- Seleccion de una unica accion pequena y verificable por turno, disenada para integrarse con el runtime Nimora.
- Uso de herramientas de workspace, Git y cambios de codigo a traves del runtime (el adaptador no ejecuta herramientas por si mismo).
- Conformidad alta con el protocolo sintetico de Nimora: 100% de JSON valido y 100% de semantica correcta en los casos held-out.
- Soporte de tool calling indirecto: el adaptador genera la llamada a herramienta, pero la ejecucion y las politicas las gestiona el runtime.
- Capacidad multilingue limitada: solo entrenado en ingles; no se garantiza comportamiento en otros idiomas.
- No es un modelo de proposito general: no genera codigo libre, no razona sobre problemas abiertos ni mantiene conversaciones fuera del protocolo.

## Casos de uso

- Controlador de agente de codificacion en el runtime Nimora: el adaptador recibe el estado del repositorio y decide la siguiente accion (por ejemplo, crear una rama, hacer un commit, modificar un archivo) devolviendo JSON estructurado que el runtime ejecuta de forma segura.
- Automatizacion de tareas repetitivas de Git: puede seleccionar acciones como `git add`, `git commit` o `git push` cuando el runtime le proporciona el contexto del repositorio, siempre bajo politicas de aprobacion humana.
- Prototipado rapido de agentes tool-use: al ser un adaptador ligero (0,1 GB), permite experimentar con el protocolo Nimora en entornos de desarrollo sin necesidad de un modelo grande.
- Evaluacion de protocolos de agente en entornos controlados: su alta conformidad con el formato JSON canonico lo hace util para validar pipelines de agente antes de escalar a modelos mayores.
- Integracion en pipelines de CI/CD experimentales: puede generar decisiones de cambio de codigo en formato estructurado que un sistema externo revise antes de aplicar, reduciendo el riesgo de acciones no deseadas.
- Investigacion academica sobre adaptadores QLoRA para control de agentes: su entrenamiento reproducible (datos sinteticos, configuracion publica) permite estudiar el impacto del ajuste fino en la adherencia a protocolos.

## Benchmarks y rendimiento

La unica evaluacion publicada es la interna del autor, realizada sobre 40 casos held-out sinteticos con decodificacion determinista, comparando el adaptador con el modelo base Qwen3-4B:

| Modelo | JSON valido | Semantica correcta (accion/resultado) | Argumentos exactos |
|---|---:|---:|---:|
| Qwen3-4B base | 100% | 27,5% | 20,0% |
| Nimora adapter | 100% | 100% | 97,5% |

Estos resultados miden exclusivamente la conformidad con un protocolo sintetico determinista. No hay resultados en benchmarks independientes como MMLU, HumanEval, GSM8K o SWE-bench, y el propio autor advierte que no son comparables con ellos.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3-4B. Con cuantizacion 4-bit, el conjunto cabe en GPUs consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4090).
- Para entrenamiento se uso una Tesla T4 (16 GB), lo que indica que el ajuste fino es viable en hardware de gama media.
- Para inferencia en produccion, se recomienda servir el modelo base con vLLM o llama.cpp y cargar el adaptador PEFT sobre el; el runtime Nimora es compatible con endpoints OpenAI-compatible.
- La latencia estimada no esta publicada, pero dado el tamano del modelo base (4B) y el contexto corto (2048 tokens), se espera un throughput aceptable en una GPU moderna.
- No se requieren GPUs de datacenter (A100/H100) para este adaptador; es adecuado para entornos de desarrollo y pruebas.

## Comparativa con modelos similares

No se dispone de datos publicados de adaptadores QLoRA comparables para control de agentes de codificacion con el mismo protocolo. La comparacion mas directa es con el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 2048 (en este adaptador) | Apache-2.0 | Modelo de lenguaje general |
| Nimora adapter (sobre Qwen3-4B) | Adaptador QLoRA rank 16 | 2048 | Apache-2.0 | Controlador de agente Nimora |

No se han encontrado otros adaptadores publicos con la misma especializacion en el momento de la redaccion.

## Limitaciones y advertencias

- El corpus de entrenamiento es pequeno (400 ejemplos) y completamente sintetico y templado; no se ha validado con repositorios reales, herramientas desconocidas, otros lenguajes o tareas de largo horizonte.
- La alta precision en casos held-out sinteticos no garantiza transferencia a trabajo real de codificacion; el autor lo declara explicitamente como un adaptador alfa experimental.
- El modelo puede alucinar, elegir acciones inseguras o afirmar resultados no soportados fuera del protocolo entrenado.
- No debe otorgarse al modelo acceso sin restricciones a shell, credenciales, merges, despliegues o autoridad de aprobacion. El runtime Nimora debe mantener politicas de revision, vinculacion de revisiones y supervisio humana.
- Solo soporta ingles; el uso en otros idiomas no esta validado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no esta listo para produccion y carece de garantias de seguridad o rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AVBala/nimora-agent
- Repositorio del runtime Nimora: https://github.com/AshwinVBala/nimora
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
