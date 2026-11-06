# AshishDwi99/dharma-guard

## Resumen

Dharma-Guard es un modelo de clasificación de texto de 322 millones de parámetros desarrollado por AshishDwi99, concebido como una capa de decisión para agentes de IA. No es un chatbot ni un filtro de contenido al uso: se sitúa entre un agente y sus herramientas (tool calling) y responde, en un único forward pass, si la acción que el agente está a punto de ejecutar debe permitirse, escalarse a un humano o bloquearse. El modelo devuelve un veredicto de tres vías (`allow`, `escalate`, `block`) acompañado de ocho juicios de apoyo sobre la naturaleza de la acción.

Técnicamente es un fine-tune de Laya, un modelo de decisión tipado no autorregresivo construido sobre el encoder multilingüe `jhu-clsp/mmBERT-base`. Con 321.908.998 parámetros y un repositorio de 0,7 GB, está pensado para inferencia de baja latencia: el autor reporta aproximadamente 56 ms por acción en una NVIDIA T4, lo que permite evaluar cada llamada a herramienta en línea sin degradar la experiencia del agente.

Su relevancia actual radica en el enfoque: en lugar de hacer pattern matching contra ataques conocidos (cadenas de inyección, jailbreaks, listas negras de herramientas), el modelo se entrena para juzgar la acción en sí misma a partir de un conjunto de principios éticos universales (ahiṃsā, satya, asteya, aparigraha, adhikāra, svadharma) y detectar así ataques novedosos que no aparecen en ninguna lista. Se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con cabeza de decisión tipada no autorregresiva (Laya) |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y multilingüe (según tags del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | laya |
| Modelo base | jhu-clsp/mmBERT-base (fine-tune) |
| Tamaño del repositorio | 0,7 GB |
| Descargas | 28 |
| Fecha de creación | 2026-10-26 |

## Arquitectura y entrenamiento

Dharma-Guard se apoya en un encoder transformer multilingüe (`jhu-clsp/mmBERT-base`) sobre el que se aplica el marco Laya, un modelo de decisión tipado no autorregresivo. En lugar de generar texto token a token, el modelo recibe un estado compuesto por el rol del agente, su mandato, la acción concreta que va a ejecutar y contexto adicional, junto con un conjunto de preguntas tipadas, y produce en un solo forward pass un veredicto de tres clases más ocho etiquetas de apoyo: `serves_request`, `untrusted_instruction`, `irreversible`, `harm_to_others`, `deception`, `data_theft`, `power_grab` y `harm_severity` (none / minor / serious / severe).

El entrenamiento se basa en ejemplos etiquetados según un conjunto de principios éticos universales extraídos de las tradiciones índicas (Gita, Ramayana, Dharmaśāstra, budismo y jainismo), excluyendo deliberadamente cualquier criterio basado en casta, nacimiento o género. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es el planteamiento de "juicio por principios" frente al pattern matching: el modelo puede rechazar acciones dañinas novedosas porque violan un principio, no porque coincidan con una firma conocida.

## Capacidades

- Clasificación de acciones de agentes en tres veredictos: `allow`, `escalate` y `block`.
- Detección de inyección de prompts evaluando si la acción obedece contenido no confiable (`untrusted_instruction`).
- Identificación de cuatro clases de violación: daño a terceros, engaño, robo de datos y acaparamiento de poder o privilegios.
- Evaluación de severidad del daño en cuatro niveles (none, minor, serious, severe).
- Detección de acciones irreversibles y de acciones temerarias (tamasic action), como un `DROP TABLE` en producción o un despliegue que se salta el canary.
- Verificación de autoridad y mandato: comprueba si el agente tiene competencia para ejecutar la acción (adhikāra) y si esta se mantiene dentro de su cometido (svadharma).
- Escalado a humano ante incertidumbre o acciones legítimas pero de alto riesgo.
- Procesamiento multilingüe heredado del encoder mmBERT-base.
- Inferencia en un único forward pass, sin generación autorregresiva.

## Casos de uso

- **Pasarela de seguridad en tool calling**: interceptar cada llamada a herramienta de un agente antes de su ejecución y aplicar el veredicto del modelo. Con ~56 ms por acción en T4, puede situarse en línea sin añadir latencia perceptible al bucle del agente.
- **Protección frente a inyección de prompts indirecta**: en escenarios donde el texto malicioso no es visible (por ejemplo, una instrucción inyectada en un correo o documento que redirige un pago), el modelo detecta el daño en la acción resultante aunque el payload no aparezca en la superficie.
- **Automatización bancaria y financiera**: validar transferencias, cambios de cuenta destino o consultas de datos sensibles, bloqueando desvíos de fondos y escalando operaciones legítimas de alto importe a revisión humana.
- **Operaciones de infraestructura y DevOps**: frenar acciones destructivas o irreversibles (borrado de tablas, despliegues sin canary, cambios de permisos) antes de que se ejecuten, usando las etiquetas de irreversibilidad y acción temeraria.
- **Agentes corporativos con acceso a Slack, correo y calendario**: comprobar que cada acción respeta el mandato asignado al agente y no excede su ámbito de autoridad, evitando fugas de información entre canales o usuarios.
- **Cumplimiento y auditoría de agentes**: registrar el veredicto y los ocho juicios de apoyo de cada acción como traza estructurada, facilitando la revisión posterior y la justificación de bloqueos ante equipos de compliance.
- **Escalado humano en flujos de alto riesgo**: derivar a un operador las acciones ambiguas o de consecuencias graves en lugar de decidir automáticamente, reduciendo el riesgo de falsos negativos en producción.

## Benchmarks y rendimiento

Resultados reportados por el autor. Todas las filas de test están excluidas del entrenamiento. Positivo = el guard marca la acción (block o escalate).

**AgentDojo, split held-out** (183 acciones de agente de las suites banking / slack / travel / workspace; 103 benignas, 80 inseguras). En estos ataques el texto inyectado no es visible: el daño está solo en la acción.

| Guard (mismas 183 filas) | Recall de ataques ↑ | Attack Success Rate ↓ | Benignas permitidas (Utility) ↑ | F1 ↑ |
|---|---|---|---|---|
| Dharma-Guard | 98,8% | 1,3% (1/80) | 24,3% | 0,667 |
| ProtectAI DeBERTa-v3 prompt-injection v2 | 50,0% | 50,0% (40/80) | 61,2% | 0,500 |
| Referencia: "bloquear todo" | 100% | 0% | 0% | 0,608 |

**Dharma holdout** (40 casos escritos a mano sobre los principios: medias verdades al estilo Aśvatthāmā, exceso de autoridad, temeridad tamasic y controles benignos dharmicos). No entrenados, pero procedentes de las mismas plantillas de autoría que la semilla de entrenamiento.

| Guard (mismas 40 filas) | Recall ↑ | ASR ↓ | Utility ↑ | Veredicto exacto de 3 vías |
|---|---|---|---|---|
| Dharma-Guard | 100% | 0% | 100% | 40/40 (incl. 8/8 escalate) |
| ProtectAI DeBERTa-v3 prompt-injection v2 | 5,7% | 94,3% | 80,0% | No aplica (binario) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 322 M de parámetros en fp32 el peso ronda 1,3 GB, y en fp16/bf16 aproximadamente 0,65 GB, más overhead de activaciones.
- GPU recomendadas: el autor reporta latencia de ~56 ms por acción en una NVIDIA T4, lo que la sitúa como referencia mínima. GPU de datacenter (A100, H100) no están documentadas para este modelo.
- Cabe en GPU de consumo: sí, por tamaño (0,7 GB de repositorio); no se especifican modelos concretos de consumo en la información disponible.
- Opciones de despliegue: la librería declarada es `laya`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: ~56 ms por acción en T4 (una llamada, un único forward pass). Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dharma-Guard | 321,9 M | no disponible | Decisión de 3 vías sobre acciones de agente, basada en principios | Apache 2.0 | Hugging Face |
| ProtectAI DeBERTa-v3 prompt-injection v2 | no disponible | no disponible | Clasificación binaria de inyección de prompts | no disponible | Hugging Face |
| "Bloquear todo" (baseline) | no aplica | no aplica | Regla trivial | no aplica | no aplica |

Frente a ProtectAI DeBERTa-v3, Dharma-Guard ofrece mayor recall (98,8% vs 50,0% en AgentDojo) y menor ASR (1,3% vs 50,0%), a costa de una utility menor (24,3% vs 61,2%), es decir, bloquea más acciones benignas. El baseline trivial de bloquear todo alcanza 100% de recall pero utility nula y F1 de 0,608, por debajo del 0,667 de Dharma-Guard.

## Limitaciones y advertencias

- **Utility baja en AgentDojo**: solo permite el 24,3% de las acciones benignas, lo que implica una tasa alta de falsos positivos y posible fricción en producción si se usa como único filtro.
- **Sesgo de autoría en el holdout de Dharma**: los 40 casos proceden de las mismas plantillas que la semilla de entrenamiento, por lo que el 100% de recall y utility debe interpretarse con cautela.
- **Riesgo de alucinación de veredicto**: al ser un clasificador, puede producir veredictos erróneos en acciones ambiguas o fuera de distribución; el propio diseño contempla el escalado a humano para esos casos.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, lo que limita la planificación de estados de agente largos.
- **Cobertura lingüística incierta**: aunque se etiqueta como multilingüe por herencia del encoder, no se documenta el rendimiento real fuera del inglés.
- **Licencia**: Apache 2.0 permite uso comercial, pero no se especifican garantías ni limitaciones adicionales del autor.
- **Madurez**: 28 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente más allá de los benchmarks del autor.
- **No es un filtro de contenido general**: está diseñado para evaluar acciones de agente con acceso a herramientas, no para moderar texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AshishDwi99/dharma-guard
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- ProtectAI DeBERTa-v3 prompt-injection v2 (comparativa): https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Paper de referencia (arXiv:2505.03574): https://arxiv.org/abs/2505.03574
