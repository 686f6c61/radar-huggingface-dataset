# mstrasser/jeff-adapter-requires-action

## Resumen

`jeff-adapter-requires-action` es un adaptador LoRA de tipo PEFT para el modelo base `mstrasser/jeff-base` v1.4, un modelo de decisión de pequeno tamano (fine-tune de Qwen3.5-0.8B) desarrollado por mstrasser. El adaptador resuelve una tarea muy concreta de clasificación de texto: determinar si un mensaje recibido por un equipo de soporte requiere acción o escalado, evaluándolo contra la política interna de ese equipo. Cada decisión se emite como una de tres etiquetas (`yes`, `no`, `unclear`) con una probabilidad calibrada obtenida en un único forward pass, sin generación de texto que haya que parsear.

La relevancia del modelo reside en su enfoque: en lugar de un LLM generativo que redacta una respuesta que luego hay que interpretar, se trata de un clasificador de decisión que devuelve probabilidades calibradas por opción. Esto lo hace adecuado para pipelines de triaje automatizado donde la latencia, la reproducibilidad y la auditabilidad son críticas. Expone dos funciones independientes: `requires_action` (¿debe actuar el equipo?) y `requires_escalation` (¿debe escalarse el mensaje?).

El adaptador es extremadamente ligero (repo de 0.0 GB, solo pesos del adaptador), se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para inglés. Su uso está atado a la revisión v1.4 del modelo base: el motor rechaza adaptadores entrenados sobre otra base, por lo que no es portable a otras revisiones sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `mstrasser/jeff-base` v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft |
| Pipeline | text-classification |
| Tarea | Clasificación de decisión con opciones nombradas (`yes` / `no` / `unclear`) |
| Version del adaptador | 1.4.0 |
| Modelo base requerido | `mstrasser/jeff-base` revision `v1.4` (obligatorio) |
| Fecha de entrenamiento | 2026-10-25 |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre `jeff-base` v1.4, un modelo de decisión de ~0.8B parámetros derivado de Qwen3.5-0.8B. La innovación principal no está en la arquitectura del transformer subyacente, sino en el paradigma de inferencia: el modelo recibe una situación estructurada (equipo, política y mensaje) junto con una pregunta de opciones nombradas, y devuelve en un solo forward pass una distribución de probabilidad calibrada sobre cada opción. No hay decodificación autoregresiva ni texto generado que parsear, lo que elimina la fragilidad típica de los pipelines que extraen respuestas de la salida de un LLM generativo.

El entrenamiento se realizó el 2026-10-25 sobre datos generados por un generador interno, con filtrado mediante una comprobación ciega por LLM: solo se conservaron las filas de entrenamiento y test en las que la verificación automática coincidía con la etiqueta. El autor advierte explícitamente que este filtrado probablemente infla las métricas reportadas. La calibración se ajustó sobre un conjunto de 1.087 filas, con umbrales de confianza de 0.502 para `requires_action` y 0.489 para `requires_escalation`. No se detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisión binaria/triestado: devuelve `yes`, `no` o `unclear` con probabilidad calibrada por opción.
- Función `requires_action`: determina si un mensaje exige que el equipo actúe según su política (incluye reglas de escalado como forma de acción).
- Función `requires_escalation`: determina si aplica alguna regla de escalado de la política (por tipo de asunto o por importe superior a un límite).
- Razonamiento sobre políticas en lenguaje natural: interpreta listas de frases que definen qué gestiona el equipo y cuándo debe escalar.
- Manejo explícito de la incertidumbre: la etiqueta `unclear` cubre casos que la política y el mensaje no resuelven (asuntos sin equipo asignado, importes no indicados).
- Robustez frente a señales engañosas: las instrucciones piden juzgar los hechos y la petición real, no el tono ni las alegaciones de urgencia.
- Entrada estructurada: contexto `team` (organización y nombre), contexto `policy` (lista de frases) y mensaje con campos `from`, `to`, `date`, `subject` y `body`.
- Sin tool calling ni capacidades de agente: es un clasificador de un solo paso, no un modelo generativo ni multi-step.
- Solo inglés.

## Casos de uso

- Triaje de bandeja de entrada de soporte: el adaptador clasifica cada mensaje entrante contra la política del equipo y marca los que requieren acción, reduciendo la carga de revisión manual en bandejas con alto volumen de mensajes informativos.
- Enrutado y escalado automático: combinando `requires_action` y `requires_escalation`, un sistema puede decidir si un mensaje se responde, se archiva o se escala a un responsable, usando las probabilidades calibradas para fijar umbrales de automatización.
- Cumplimiento de SLA y reglas internas: las políticas en lenguaje natural permiten codificar reglas como límites de importe o tipos de asunto que siempre deben escalarse, y el modelo las aplica sin necesidad de reescribirlas como código.
- Moderación de flujos de soporte con intervención humana: la etiqueta `unclear` actúa como señal de derivación a revisión humana cuando la política no cubre el caso, evitando decisiones automáticas sobre situaciones ambiguas.
- Auditoría y explicabilidad de decisiones: al devolver probabilidades por opción en un único forward pass, cada decisión es reproducible y registrable, lo que facilita la auditoría posterior de por qué un mensaje se escaló o no.
- Integración en pipelines existentes vía SDK: el SDK de Python (`jeff.Jeff.local`) y el servidor del repositorio `firelex/jeff` permiten desplegar el clasificador como servicio dentro de un sistema de ticketing o de correo.
- Prototipado rápido de políticas de equipo: al aceptar la política como lista de frases, un equipo puede iterar sobre su definición sin reentrenar el modelo, probando distintas redacciones contra el mismo adaptador.

## Benchmarks y rendimiento

| Test | Filas | Accuracy |
|---|---:|---:|
| Test interno (generador) | 2.136 | 98,2% |
| Segundo test interno de casos no vistos (generador) | 2.224 | 98,1% |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `requires_action` | 0,502 | 98,3% | 100,0% | 1.087 |
| `requires_escalation` | 0,489 | 99,1% | 100,0% | 1.087 |

Advertencia del autor: ambos tests son de tipo "generator" (mismo generador que los datos de entrenamiento), lo que mide menos que un test público o real, y el filtrado por verificación LLM ciega probablemente infla las cifras. No se han publicado resultados en benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.0 GB (solo pesos LoRA); el requisito real lo marca el modelo base `jeff-base` v1.4 (~0.8B parámetros).
- VRAM estimada para el modelo base: aproximadamente 1,6 GB en FP16/BF16 y por debajo de 1 GB en cuantización de 4 bits (estimación a partir del tamaño de parámetros; no confirmada en la información disponible).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: el SDK oficial `jeff` (Python) y el servidor del repositorio `github.com/firelex/jeff`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.
- Requisito estricto: el motor rechaza el adaptador si el modelo base no es exactamente la revisión `v1.4`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jeff-adapter-requires-action` | LoRA sobre jeff-base (Qwen3.5-0.8B) | ~0.8B (base) | no disponible | Clasificación de decisión con calibración | Apache 2.0 | Hugging Face + SDK propio |
| LLM generativo pequeño (p. ej. Qwen3.5-0.8B sin adaptar) | Transformer decoder | ~0.8B | no disponible | Generación de texto; requiere parseo de salida | según modelo base | Hugging Face |
| Clasificadores BERT pequeños (p. ej. DistilBERT) | Transformer encoder | ~66M | 512 tokens típicamente | Clasificación de texto supervisada | Apache 2.0 (habitual) | Hugging Face |

La comparación con clasificadores encoder pequeños es la más directa en coste y latencia, pero `jeff-adapter-requires-action` se distingue por condicionar la decisión a una política en lenguaje natural en el contexto y por devolver probabilidades calibradas por opción. Frente a un LLM generativo del mismo tamaño, evita la fragilidad del parseo de texto libre. No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas.
- Métricas probablemente infladas: el autor reconoce que el filtrado por verificación LLM ciega y el uso de tests del mismo generador que los datos de entrenamiento sobreestiman el rendimiento real.
- Sin benchmarks públicos ni tests sobre documentos reales retenidos: la evidencia de calidad es exclusivamente interna.
- Acoplamiento estricto al modelo base: solo carga sobre `jeff-base` revisión `v1.4`; cualquier actualización de la base invalida el adaptador.
- Alcance muy restringido: no elige entre varios equipos (para eso remite a otra función, "Shared inbox triage") ni genera respuestas; es únicamente un clasificador de decisión.
- Riesgo de alucinación estructural: aunque no genera texto, puede emitir `yes` o `no` con alta confianza en casos límite; la etiqueta `unclear` mitiga pero no elimina este riesgo.
- Sesgos: no documentados; al entrenarse sobre datos sintéticos generados internamente, puede heredar los sesgos del generador y de las políticas de ejemplo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el SDK deben verificarse por separado (el SDK se distribuía desde GitHub en el momento de la publicación, no desde PyPI).
- Madurez temprana: 0 descargas y 0 likes en Hugging Face; ecosistema (SDK, servidor) en fase inicial.
- Dependencia de la calidad de la política: el rendimiento depende de que la lista de frases de la política sea completa y sin ambigüedades; políticas mal redactadas degradan las decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-requires-action
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.support.requires-action
- Repositorio de código, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
