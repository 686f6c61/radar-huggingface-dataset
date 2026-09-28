# noumenon-labs/Fleet-Semantic-4B

## Resumen

Fleet-Semantic-4B es un modelo de generacion de texto desarrollado por noumenon-labs que se presenta como un Semantic Inference Language Model (SiLM) construido sobre Qwen/Qwen3-4B-Instruct-2507. Su rasgo distintivo es que integra un banco de especialistas (seis en este checkpoint: math_reasoning, medical_reasoning, legal_ops, intent, function_calling y structured) junto con un enrutador semantico que opera dentro del propio modelo causal, no como un clasificador externo que decide antes de generar.

Frente a los sistemas multi-LoRA convencionales, que seleccionan un adaptador antes de la inferencia, Fleet decide dinamicamente en cada computo si interviene el modelo base (k=0), un unico especialista (k=1) o una mezcla de dos (k=2). Esto se implementa con la arquitectura personalizada FleetForCausalLM, que sustituye determinadas proyecciones de Qwen por modulos FleetLinear con bancos de expertos dispersos.

El checkpoint publicado, de 4.418.829.824 parametros y 8,9 GB, incluye el backbone completo y los parametros de Fleet. Sus especialistas son instalables y desinstalables en tiempo de ejecucion mediante paquetes portables .fleet, lo que lo convierte en una propuesta relevante para escenarios que requieren extension modular sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (FleetForCausalLM) sobre backbone Qwen3-4B; enrutado semantico interno con bancos de expertos LoRA |
| Parametros totales | 4.418.829.824 |
| Parametros activos | Depende de k (base, un especialista o mezcla de dos); la model card no especifica el numero exacto de parametros activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fleet se apoya en un backbone Qwen3-4B-Instruct-2507 y sustituye proyecciones seleccionadas por modulos FleetLinear, cada uno de los cuales contiene un peso base, dos ranuras de experto (expert_A, expert_B), un factor de escalado, identificadores de experto y prototipos en espacio de pesos. A esto se anade un banco de prototipos semanticos gestionado por FleetRouterState, que incluye semantic_prototypes, semantic_thresholds, un prototipo NULL/base y un prior semantico de prompt y decodificacion. El enrutado se ejecuta durante la propia inferencia del modelo causal, de modo que un especialista no tiene por que activarse en todas las peticiones.

Los especialistas se materializan como adaptadores LoRA y el sistema admite compilacion heterogenea: adaptadores con distinto rango o conjunto de modulos objetivo se convierten a una ABI canonica comun, preservando la actualizacion mediante escalado y relleno de ceros cuando el rango de origen es menor o igual. Los bancos de expertos son locales y dispersos, por lo que un especialista que solo afecta a proyecciones de atencion no reserva tensores vacios en cada proyeccion MLP. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional sobre la base de Qwen3-4B-Instruct-2507.
- Enrutado semantico interno con seleccion dinamica entre modelo base, un especialista o mezcla de dos.
- Seis especialistas instalados: math_reasoning, medical_reasoning, legal_ops, intent, function_calling y structured.
- Soporte de function calling a traves del especialista dedicado, relevante para integracion con herramientas y APIs.
- Salida estructurada mediante el especialista structured, orientada a formatos tipo JSON o esquemas.
- Instalacion, desinstalacion y exportacion de especialistas en caliente mediante paquetes .fleet (metodos install, uninstall, experts y export_adapter).
- Carga de paquetes alojados en el Hub mediante la sintaxis hf://org/repositorio/archivo.fleet.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Atencion al cliente automatizada: el especialista intent clasifica la intencion del usuario y structured da formato a la respuesta, todo dentro del mismo modelo y sin orquestacion externa entre varios modelos.
- Agentes con tool calling: el especialista function_calling permite generar llamadas a funciones y APIs en pipelines de agentes, integrándose en flujos de multiples pasos.
- Razonamiento matematico y tutoria: el especialista math_reasoning se activa en problemas aritmeticos o de varios pasos, manteniendo el backbone como respaldo en consultas generales.
- Redaccion y analisis de documentacion legal: el especialista legal_ops cubre tareas de borrador, revision o extraccion de clausulas, siempre con supervision humana.
- Apoyo al triaje clinico o consulta medica supervisada: el especialista medical_reasoning puede asistir en la organizacion de informacion, sin sustituir el criterio profesional.
- Extraccion y estructuracion de datos: el especialista structured convierte texto libre en registros normalizados para ingestas posteriores.
- Cambio de dominio en caliente: instalar y desinstalar paquetes .fleet en tiempo de ejecucion permite adaptar un mismo despliegue a dominios distintos sin recargar el backbone.
- Sustitucion de orquestadores externos: al residir el enrutado dentro del modelo, se elimina la latencia y el mantenimiento de un clasificador separado que elija modelo antes de generar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 8,8 GB, coherente con el tamano de repositorio de 8,9 GB.
- VRAM estimada para inferencia en fp16: alrededor de 10-12 GB con contexto corto, sumando pesos, activaciones y cache KV.
- VRAM estimada en cuantizacion int8: en torno a 4,4 GB; en int4, entre 2,2 y 3 GB. Estas conversiones no se publican en el repositorio y requeririan trabajo adicional.
- GPU consumer: una RTX 3090 o RTX 4090 (24 GB) ejecuta fp16 con holgura; una RTX 4080 o 4070 Ti (16 GB) es viable con contexto moderado; 12 GB queda al limite.
- GPU de datacenter: A100 o H100 no son necesarias para un modelo de 4B, aunque facilitan lotes grandes y mayor concurrencia.
- Opciones de despliegue: transformers con trust_remote_code activado es la via documentada. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama, dado que se trata de una arquitectura personalizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutado de especialistas | Licencia | Formato |
|---|---|---|---|---|---|
| Fleet-Semantic-4B | 4.418.829.824 | no disponible | Interno y dinamico (k=0, 1 o 2) | other | safetensors |
| Qwen3-4B-Instruct-2507 (base) | no disponible en la informacion | no disponible | No incorpora enrutado de especialistas | no disponible | safetensors |
| Sistemas multi-LoRA con orquestador externo | Variable | Segun modelo base | Externo, previo a la generacion | Segun los componentes | Variable |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos, por lo que debe revisarse el texto completo antes de cualquier uso comercial.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del autor con los riesgos de seguridad asociados.
- Ausencia total de benchmarks publicados: el rendimiento real frente al backbone base o a modelos equivalentes es desconocido.
- Comunidad muy reducida (0 likes y 116 descargas en el momento de la consulta), con poca validacion independiente.
- La model card esta incompleta: el texto se corta en la seccion de compilacion heterogenea de LoRA, por lo que faltan detalles de entrenamiento y de los especialistas.
- No se especifican idiomas soportados, lo que impide confirmar un comportamiento multilingue mas alla del heredado del backbone.
- Riesgo de enrutado erroneo: si el router selecciona un especialista inadecuado, la respuesta puede degradarse respecto al uso del modelo base.
- Los especialistas medico y legal no sustituyen asesoramiento profesional y exigen supervision humana en produccion.
- La alucinacion propia del backbone Qwen3-4B-Instruct-2507 se mantiene.
- No hay cuantizaciones publicadas ni soporte confirmado en herramientas de inferencia habituales, lo que puede complicar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noumenon-labs/Fleet-Semantic-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
