# kagvi13/HMP

## Resumen

HyperCortex Mesh Protocol (HMP) es una especificación abierta para construir redes cognitivas descentralizadas en las que agentes de IA pueden auto-organizarse, compartir conocimiento, alinearse éticamente y alcanzar consenso, incluso cuando los modelos de lenguaje centrales no están disponibles. No se trata de un modelo de lenguaje con pesos entrenados, sino de un protocolo de comunicación y coordinación entre agentes autónomos, comparable en su clase a otros protocolos de red de agentes (ANP, Agora Protocol, MCP).

El proyecto lo mantiene el autor kagvi13 y se distribuye bajo licencia CC-BY-4.0. Incluye una implementación de referencia en Python, aunque el propio autor advierte que es un borrador exploratorio, incompleto y no optimizado, destinado únicamente a validar e ilustrar partes del protocolo. La especificación central se encuentra en la versión estable v5.0.8, documentada en el repositorio. Su relevancia actual radica en el creciente ecosistema de agentes autónomos descentralizados, donde la continuidad cognitiva, la memoria a largo plazo y la reflexión ética son problemas aún sin resolver de forma estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Protocolo de especificacion (no es un modelo de red neuronal) |
| Parametros totales | No aplica (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Documentacion en ingles, aleman, frances, ucraniano, ruso, japones, coreano y chino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No aplica (repositorio de codigo y documentacion, sin pesos) |

## Arquitectura y entrenamiento

HMP no es un modelo entrenado, sino una especificacion de protocolo. Define una arquitectura cognitiva descentralizada en la que los agentes intercambian y evolucionan conocimiento mediante un modelo unificado de contenedores, flujos de trabajo cognitivos y consenso distribuido. La implementacion de referencia esta escrita en Python y se publica como codigo fuente en GitHub y Hugging Face, sin datos de entrenamiento asociados (el campo `datasets` esta vacio).

El protocolo se posiciona como una capa de continuidad cognitiva dentro del ecosistema de protocolos de agentes: mientras ANP gestiona identidad y descubrimiento, y Agora Protocol negocia modos de interaccion, HMP se centra en la preservacion del significado, la memoria a largo plazo, la reflexion y la alineacion etica. No se han publicado detalles sobre tecnicas de entrenamiento, RLHF o DPO porque no aplican a un protocolo.

## Capacidades

- Coordinacion descentralizada de agentes de IA sin dependencia de un LLM central.
- Intercambio estructurado de conocimiento mediante contenedores y artefactos de pensamiento.
- Consenso distribuido entre agentes autonomos.
- Continuidad cognitiva a largo plazo: memoria persistente y preservacion del significado.
- Alineacion etica de agentes mediante mecanismos de consenso.
- Interoperabilidad con otros protocolos de la clase ANP (ANP, Agora Protocol, MCP, A2A, Nostr, Matrix, libp2p).
- Implementacion de referencia en Python para validacion y experimentacion.

## Casos de uso

- Ecosistemas de agentes autonomos descentralizados: HMP permite que agentes de diferentes proveedores se comuniquen y coordinen sin depender de un servidor central ni de un modelo de lenguaje unico.
- Memoria compartida entre agentes: un conjunto de agentes que trabajan en un mismo dominio puede mantener una memoria colectiva persistente, de modo que el conocimiento adquirido por uno este disponible para los demas.
- Alineacion etica distribuida: organizaciones que despliegan multiples agentes pueden usar HMP para establecer mecanismos de consenso sobre que acciones son aceptables, reduciendo el riesgo de comportamientos divergentes.
- Investigacion en arquitecturas cognitivas: el protocolo sirve como base experimental para estudiar como los agentes pueden reflexionar sobre su propio conocimiento y evolucionar sus modelos internos.
- Integracion con protocolos existentes: HMP complementa ANP (identidad y descubrimiento) y Agora Protocol (negociacion de modos de interaccion), permitiendo construir pilas de protocolos completas para redes de agentes.
- Sistemas multi-agente resilientes: en entornos donde los LLM centrales pueden no estar disponibles (cortes de red, fallos de servicio), HMP permite que los agentes mantengan operaciones basicas de coordinacion y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un protocolo de especificacion y no un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan datos de latencia o throughput para la implementacion de referencia.

## Requisitos de hardware

- No aplica requisitos de VRAM ni GPU, ya que no es un modelo con pesos.
- La implementacion de referencia en Python puede ejecutarse en cualquier maquina con Python 3.x, sin requisitos especiales de hardware.
- Para despliegues en produccion de redes de agentes que usen HMP, los requisitos dependen de los LLM subyacentes que cada agente emplee, no del protocolo en si.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI) porque el protocolo no define un runtime de inferencia.

## Comparativa con modelos similares

HMP no es comparable directamente con modelos de lenguaje, sino con otros protocolos de agentes descentralizados. La siguiente tabla compara HMP con alternativas de su misma categoria:

| Protocolo | Enfoque principal | Estado | Licencia | Implementacion |
|---|---|---|---|---|
| HMP | Continuidad cognitiva, memoria y consenso | Estable v5.0.8 | CC-BY-4.0 | Python (borrador) |
| ANP (Agent Network Protocol) | Identidad, descubrimiento y negociacion de mensajes | Activo | No especificada | Multiples |
| Agora Protocol | Meta-negociacion de modos de interaccion | Activo | No especificada | No especificada |
| MCP (Model Context Protocol) | Integracion agente-herramienta y datos | Activo | No especificada | Multiples |

HMP se distingue por su enfasis en la preservacion del significado y la memoria a largo plazo, mientras que los otros protocolos cubren capas diferentes del ecosistema. No hay datos de rendimiento cuantitativo comparativo disponibles.

## Limitaciones y advertencias

- El propio autor indica que la implementacion de referencia en Python es un borrador temprano, incompleto y no optimizado; no debe usarse en produccion sin un desarrollo adicional significativo.
- HMP es una especificacion, no un modelo entrenado; no genera texto ni realiza inferencias por si mismo.
- La documentacion principal esta en ingles; aunque hay traducciones, la version en castellano no esta disponible en el repositorio.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es recomendable revisar los terminos completos antes de integrarlo en productos comerciales.
- No hay garantias de soporte ni mantenimiento a largo plazo; el proyecto depende de un unico autor principal.
- La interoperabilidad con otros protocolos (ANP, Agora, MCP) esta documentada a nivel conceptual, pero no hay pruebas de integracion publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kagvi13/HMP
- Repositorio GitHub: https://github.com/kagvi13/HMP
- Documentacion HMP-0005 (spec v5.0.8): https://kagvi13.github.io/HMP/HMP-0005.html
- DOI Zenodo: https://doi.org/10.5281/zenodo.18616283
- Papers arXiv asociados (segun tags del modelo):
  - arXiv:2507.00951
  - arXiv:2507.21046
  - arXiv:2507.03724
  - arXiv:2506.24019
- Documento de filosofia del proyecto: https://github.com/kagvi13/HMP/blob/main/docs/PHILOSOPHY.md
