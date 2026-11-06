# abulafia2001/confirm-gate-qwen3-4b

## Resumen

Confirm-Gate Qwen3-4B es un ajuste fino mediante QLoRA de Qwen3-4B-Instruct-2507, desarrollado por James McGirr (GauntletAI) dentro del programa "Train Your Own Small Learning Model". El modelo resuelve un problema muy concreto en el diseño de agentes: enseñar a un asistente con acceso a herramientas que se detenga y pida confirmación únicamente antes de ejecutar acciones irreversibles (enviar correo, mover dinero, borrar ficheros, hacer force-push), y que proceda sin preguntar en las reversibles o de solo lectura.

La arquitectura subyacente es un transformer decoder-only de 4.022 millones de parámetros, con los adaptadores LoRA fusionados en los pesos base en bf16. El modelo está entrenado sobre trayectorias sintéticas de profesor filtradas, incluyendo "gemelos casi idénticos" que invierten la respuesta correcta con un solo cambio (flag force, transferencia ACH frente a wire, borrador frente a envío, aprobación añadida), con el objetivo de mover el equilibrio entre preguntar de menos y preguntar de más.

Es relevante porque aborda una de las brechas prácticas más serias de los agentes en producción: los modelos con prompting se deslizan entre ambos extremos del trade-off de confirmación. El autor es transparente sobre los resultados: mejora claramente al modelo base, pero queda por debajo del umbral de fiabilidad que él mismo define (adherencia 0,90 y llamadas sin confirmación ≤ 0,05).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3), LoRA fusionado en los pesos base |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; el base Qwen3-4B admite cuantizaciones estandar de la comunidad) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers; repo de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 (commit `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer decoder-only causal de 4,02 B de parametros. Sobre esa base se aplico un ajuste fino QLoRA con Unsloth, y los adaptadores resultantes se fusionaron en los pesos base en bf16, dando un checkpoint de 8,0 GB listo para servir directamente con transformers o vLLM. No se documenta en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion tecnica no esta en la arquitectura sino en la estrategia de datos: el autor entrena sobre trayectorias de profesor filtradas que incluyen pares casi identicos disenados para forzar al modelo a discriminar el caso limite (por ejemplo, un flag `force` anadido a un push, o una transferencia ACH frente a una wire). El conjunto de entrenamiento y evaluacion es sintetico: escrito por Claude Opus 5.5, interpretado por Claude Sonnet 5.5 y evaluado por Gemini 3.1 Pro, lo que introduce el juicio de esos modelos sobre que cuenta como irreversible o aprobado. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat Qwen3.
- Tool calling estilo OpenAI (function calling) a traves de la plantilla de chat de Qwen3 y el parser `hermes` en vLLM.
- Comportamiento de "confirm gate": antes de una llamada irreversible, se detiene, nombra el destino y los parametros clave de la accion y no ejecuta la llamada en ese turno.
- Ejecucion autonoma de acciones reversibles o de solo lectura sin pedir confirmacion.
- Reconocimiento de aprobacion explicita previa del usuario para una accion irreversible concreta.
- Razonamiento multi-paso dentro de una peticion con varias acciones encadenadas (con limitaciones, ver seccion de limitaciones).
- No incluye vision, audio, modo thinking explicito ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Asistente de correo con envio protegido: el modelo lista la bandeja y redacta borradores por su cuenta (acciones reversibles), pero antes de `send_email` formula una pregunta concreta con destinatarios y contenido. Encaja porque el envio es el unico paso irreversible del flujo.
- Agente de pagos y tesoreria: integrado delante de herramientas de transferencia, se detiene a confirmar importe, cuenta origen y destino antes de ejecutar una transferencia wire o same-day, mientras consulta saldos y genera informes sin friccion.
- Gestion de ficheros y almacenamiento: permite listar, leer y mover ficheros de forma autonoma, y exige confirmacion antes de `delete` o de sobrescritura destructiva.
- Operaciones de control de versiones: en un bot de CI/CD que hace merge, tag o push, el modelo pregunta antes de un `force-push` o de un borrado de rama, y actua sin preguntar en operaciones de solo lectura como `git log` o `git diff`.
- Capa de confirmacion delante de un planificador mayor: se usa como modelo pequeno y rapido que filtra las llamadas propuestas por un modelo mas grande antes de que toquen herramientas peligrosas, anadiendo una comprobacion de subpaso a bajo coste.
- Programacion de citas y notificaciones masivas: confirma antes de enviar recordatorios a una lista de destinatarios con importes o fechas concretas, y procede solo en la consulta de disponibilidad.
- Evaluacion y red-teaming de agentes: sirve como referencia para medir con `eval_v1` (148 escenarios) cuanto se desvia un pipeline de la especificacion de confirmacion antes de desplegarlo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre `Confirm-Gate eval_v1` (148 escenarios), con arnes de comprobacion de codigo y juez Gemini 3.1 Pro. Ninguna metrica esta verificada de forma independiente (`verified: false`).

| Metrica | Valor | Direccion |
|---|---|---|
| Spec adherence | 0,71 | Mayor es mejor |
| Robustness (ejes adversariales) | 0,65 | Mayor es mejor |
| Acted without confirmation | 0,14 | Menor es mejor |
| Over-confirm | 0,14 | Menor es mejor |

El autor fija su propio umbral de fiabilidad en adherencia 0,90 y llamadas sin confirmacion ≤ 0,05; el modelo no lo alcanza. No se publican resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas directas con el modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8-9 GB solo para pesos, mas cache KV; en la practica conviene reservar 12-16 GB segun longitud de contexto y tamano de lote.
- En cuantizacion de 8 bits cabria en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para servir con concurrencia alta mediante vLLM; L40S o RTX 6000 Ada para produccion de un solo nodo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090/4080 con cuantizacion.
- Despliegue: vLLM es la configuracion usada en la evaluacion (`--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 8192`); tambien es compatible con text-generation-inference y con el ecosistema transformers. No se documenta soporte especifico de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| confirm-gate-qwen3-4b | 4,02 B | No disponible (ejemplo a 8192) | Confirmacion ante acciones irreversibles | Apache-2.0 | Hugging Face, 88 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible | Instruccion general y tool calling | Apache-2.0 | Hugging Face |
| Qwen3-8B-Instruct | 8 B | No disponible | Instruccion general, mayor capacidad | Apache-2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8 B | 128 K | Instruccion general y tool calling | Llama 3.1 Community | Hugging Face, amplia adopcion |

Frente al base, el ajuste mejora la adherencia a la especificacion de confirmacion segun el autor, pero no se publican cifras comparativas del base en la misma tabla. Frente a modelos de 8 B, este checkpoint ofrece menor coste de inferencia a cambio de una especializacion estrecha y menor calidad conversacional general. No hay datos de benchmarks estandar que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- No es una frontera de seguridad: el 14 % de los escenarios de confirmacion de `eval_v1` ejecutan la accion sin confirmar. Hay que imponer la confirmacion tambien en el codigo de la aplicacion.
- Pasos enterrados: en 9 de 16 escenarios de peticion multi-paso puede ejecutar el paso irreversible nombrado ("envia el aviso que redacte", "paga la factura hoy") sin confirmar parametros que el usuario nunca vio.
- Pagos urgentes: bajo lenguaje de plazo limite tiende a pagar (wire, same-day) sin preguntar, donde el modelo base si pregunta.
- Inyeccion de prompts: el 12 % de los escenarios de inyeccion siguen ejecutando la accion inyectada, igual que el modelo base.
- Sobreconfirmacion: pregunta innecesariamente en el 14 % de los escenarios en los que deberia proceder, lo que degrada la experiencia en flujos reversibles.
- Datos sinteticos: entrenamiento y evaluacion fueron generados y juzgados por modelos de Anthropic y Google, de modo que heredan sus criterios sobre que es irreversible o esta aprobado.
- Solo ingles; no entrenado para calidad de chat general, rechazo de peticiones daninas ni configuraciones multiagente.
- Solo conoce la irreversibilidad a partir de las descripciones y resultados de las herramientas; no puede anticipar efectos secundarios que las herramientas no declaren.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abulafia2001/confirm-gate-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo, datos y arnes de evaluacion: https://labs.gauntletai.com/jamesmcgirr/safety-training
- Informe de ablacion del techo de prompting: `docs/prompt_ceiling.md` en el repositorio anterior (eval code @ `89401a9`)
