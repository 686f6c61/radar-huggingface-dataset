# faysalbenahmed/AMF-Agent

## Resumen

AMF-Agent es un sistema de IA de mision especifica desarrollado por Faysal Benahmed y presentado como primer producto publico de AI Mission Foundry (AMF), un marco denominado Adaptive Model Foundry. No es un modelo preentrenado en el sentido clasico: no se trata de un checkpoint ajustado de Qwen, ni de un adaptador, ni de un envoltorio sobre un unico modelo. Su funcion es descomponer una mision en capacidades, evaluar candidatos neuronales y deterministicos para cada una, rechazar los que no superan los requisitos de cualificacion y ejecutar unicamente la inteligencia autorizada.

El sistema se publica en la version V0.8.0 RC8A. Una evaluacion fisica en NVIDIA A100-SXM4-80GB con 96 muestras comparo el resultado del sistema contra el mejor modelo base, Qwen3-4B-Instruct-2507. Segun la model card, AMF-Agent alcanzo un 100% de salida cualificada y de seguridad de herramientas, con un coste por resultado cualificado un 73.55% inferior y una latencia p95 un 45.54% menor que el modelo base. No se publican los parametros totales, la longitud de contexto ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto por un motor de orquestacion AMF sobre un substrato neuronal Qwen3-4B-Instruct-2507. No es un modelo unico. |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; es un sistema desplegable) |

## Arquitectura y entrenamiento

AMF-Agent no sigue un proceso de entrenamiento convencional. El marco AMF descompone una mision en capacidades, genera realizaciones candidatas (neuronales o deterministicas), las somete a un proceso de cualificacion, aplica puertas duras de despliegue y selecciona fisicamente la solucion cualificada. El flujo es: mision, descomposicion en capacidades, candidatos, cualificacion, puertas de despliegue, seleccion fisica, congelacion del sistema, autoridad Fresh Final y verificacion independiente.

En la evaluacion publicada se fijaron tres substratos: Microsoft Phi-4-mini-instruct, Qwen3-4B-Instruct-2507 y Mistral-7B-Instruct-v0.3. Solo Qwen3-4B-Instruct-2507 cualifico las dos capacidades requeridas: `TOOL_EXECUTION_ARGUMENTS` y `DIRECT_RESPONSE`. Las otras dos fueron rechazadas. AMF tambien evaluo un candidato fusionado con LoRA que seguia siendo semanticamente cualificado, pero fue rechazado por superar la guardarrail de memoria (maximo +35% de regresion de memoria). Una propiedad destacable es que el modelo neuronal no genera los campos deterministicos que el sistema ya conoce; solo produce el payload irreduciblemente incierto.

## Capacidades

- Descomposicion de misiones en capacidades y autorizacion de ejecucion: el sistema solo ejecuta la inteligencia cualificada para cada operacion.
- Ejecucion de herramientas (tool calling): la capacidad `TOOL_EXECUTION_ARGUMENTS` esta cualificada para el substrato Qwen3-4B-Instruct-2507.
- Respuesta directa: la capacidad `DIRECT_RESPONSE` esta cualificada para el mismo substrato.
- Seleccion automatica de modelos base: el marco evalua fisicamente varios substratos y rechaza los que no cumplen los requisitos de cualificacion o las restricciones de despliegue.
- Cumplimiento de guardarrailes de memoria, coste y latencia como puertas de autoridad antes de producir una solucion desplegable.
- Operacion offline estricta: el sistema se declara como "Strict offline", apto para entornos privados.
- No se indican capacidades de vision o audio en la informacion disponible.

## Casos de uso

1. Despliegue de agentes privados y offline en organizaciones con datos sensibles: el sistema opera en modo "Strict offline", de modo que la informacion no sale del entorno controlado y se evita la dependencia de servicios cloud externos.
2. Automatizacion de operaciones con herramientas en entornos restringidos: la capacidad de tool calling esta cualificada y validada; el sistema no ejecuta acciones no autorizadas, lo cual es critico en flujos con efectos externos.
3. Seleccion automatica del modelo base optimo para una mision concreta: AMF evaluo Phi-4-mini, Qwen3-4B y Mistral-7B y selecciono automaticamente el unico que cualificaba ambas capacidades, evitando decisiones arbitrarias por marca o preferencia.
4. Reduccion del coste por resultado cualificado en infraestructura A100: en el harness comparativo, el sistema logro un coste por resultado cualificado de 0.8459 GPU-s frente a 3.1981 GPU-s del mejor padre.
5. Cumplimiento de restricciones de memoria en despliegues con presupuesto de VRAM limitado: el sistema rechazo un candidato fusionado que duplicaba la memoria residente, garantizando que la solucion final se ajuste al hardware previsto.
6. Mejora de latencia en sistemas de respuesta interactiva: la comparativa frente a Qwen3-4B muestra un p95 de 1.9974 s frente a 3.6676 s, lo que permite responder con menor retardo en agentes en tiempo real.
7. Auditoria y verificacion de capacidades antes de produccion: la arquitectura incluye una autoridad Fresh Final y verificacion independiente, util en sectores con requisitos de trazabilidad y seguridad.

## Benchmarks y rendimiento

Los datos proceden de la model card y corresponden a una evaluacion propia sobre 96 muestras en NVIDIA A100-SXM4-80GB. No son benchmarks publicos estandar como MMLU o HumanEval.

| Metrica | AMF-Agent RC8A | Qwen3-4B-Instruct-2507 (mejor padre) |
|---|---:|---:|
| Salida cualificada | 100.00% | 77.08% |
| OK critico | 100.00% | 82.29% |
| Seguridad de herramientas | 100.00% | 91.67% |
| No accion no autorizada | 100.00% | 94.79% |
| Llamadas al modelo por peticion | 0.7396 | 1.0000 |
| Coste por resultado cualificado (GPU-s) | 0.8459 | 3.1981 |
| Throughput cualificado / GPU-s | 1.1822 | 0.3127 |
| Latencia p95 secuencial | 1.9974 s | 3.6676 s |
| Memoria residente | 8.0536 GB | 8.0539 GB |

Resultados de la competicion de substratos:

| Substrato | `TOOL_EXECUTION_ARGUMENTS` | `DIRECT_RESPONSE` | Resultado |
|---|---:|---:|---|
| Microsoft Phi-4-mini-instruct | No cualificado | No cualificado | Rechazado |
| Qwen3-4B-Instruct-2507 | Cualificado | Cualificado | Seleccionado |
| Mistral-7B-Instruct-v0.3 | No cualificado | No cualificado | Rechazado |

Deltas medidos en la comparativa AMF-Agent contra el mejor padre: coste un 73.55% inferior, throughput cualificado un 278.08% superior, llamadas al modelo un 26.04% menos y latencia p95 secuencial un 45.54% inferior. Una prueba independiente de latencia intercalada mostro que AMF fue mas rapido en 96 de 96 pares.

## Requisitos de hardware

- Memoria residente medida: 8.0536 GB en una NVIDIA A100-SXM4-80GB.
- GPU recomendada segun la evidencia: NVIDIA A100-SXM4-80GB.
- No se indica si el sistema es compatible con GPU de consumo; no disponible.
- Opciones de despliegue: la model card no menciona frameworks concretos como vLLM, llama.cpp u Ollama. Se declara como "deployable-ai" y "offline".
- Latencia y throughput medidos: p95 secuencial de 1.9974 s y throughput cualificado de 1.1822 por GPU-s en A100.

## Comparativa con modelos similares

| Caracteristica | AMF-Agent RC8A | Qwen3-4B-Instruct-2507 | Phi-4-mini-instruct | Mistral-7B-Instruct-v0.3 |
|---|---|---|---|---|
| Naturaleza | Sistema de orquestacion | Modelo preentrenado | Modelo preentrenado | Modelo preentrenado |
| Cualificacion `TOOL_EXECUTION_ARGUMENTS` | Cualificado | Cualificado | No cualificado | No cualificado |
| Cualificacion `DIRECT_RESPONSE` | Cualificado | Cualificado | No cualificado | No cualificado |
| Memoria residente | 8.0536 GB | 8.0539 GB | no disponible | no disponible |
| Coste por resultado cualificado | 0.8459 GPU-s | 3.1981 GPU-s | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo preentrenado ni un checkpoint: el repositorio en HuggingFace tiene un tamano de 0.0 GB y no contiene pesos; no se puede cargar con una biblioteca estandar como transformers o llama.cpp.
- Las metricas de rendimiento son especificas del harness de mision Fresh Final V8 y del hardware A100-SXM4-80GB; no constituyen una garantia de rendimiento universal.
- El sistema depende del substrato Qwen3-4B-Instruct-2507 para las dos capacidades cualificadas. Si se sustituye el modelo base, se debe recalificar el sistema completo.
- La licencia figura como "no disponible", por lo que el uso comercial queda sin aclarar.
- No se conocen los idiomas soportados, la longitud de contexto, los parametros totales ni las cuantizaciones disponibles.
- La model card esta redactada en ingles y frances, sin documentacion tecnica detallada de la arquitectura interna ni del protocolo de cualificacion.

## Enlaces

- HuggingFace: https://huggingface.co/faysalbenahmed/AMF-Agent
- Web de contacto: https://stack-moderne.fr/
