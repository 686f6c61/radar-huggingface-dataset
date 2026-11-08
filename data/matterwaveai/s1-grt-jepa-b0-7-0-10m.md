# MatterWaveAI/s1-grt-jepa-b0.7.0-10m

## Resumen

S1-GRT-JEPA-b0.7.0-10m es un modelo compacto de clasificación de texto desarrollado por MatterWaveAI, concebido como un "juez" de seguridad para agentes y como enrutador de acciones basado en control predictivo de modelos (MPC). Se construye sobre el modelo base MatterWaveAI/helmholtz-b0.7.0-10m y pertenece a la familia S1-GRT-JEPA (System-1 Rotational JEPA). Su función principal es emitir decisiones de tipo APPROVE / REJECT / ESCALATE o seleccionar la siguiente llamada de herramienta de un agente, evaluando el resultado previsto de cada acción candidata en un espacio latente ortogonal antes de decidir.

La arquitectura es un transformer rotacional con un enfoque JEPA (Joint Embedding Predictive Architecture) orientado a modelo del mundo. El autor declara aproximadamente 13,8 millones de parámetros almacenados y una capacidad densa equivalente de unos 34 millones, sin matrices lineales densas ni capas convolucionales. El modelo opera sin decodificación autorregresiva de tokens: realiza un "rollout" latente de las acciones candidatas en 1..H pasos y compara el estado predicho con invariantes de objetivo y seguridad.

Es relevante ahora porque aborda un problema creciente en sistemas de agentes: la necesidad de un guardrail ligero que verifique acciones antes de ejecutarlas y que sea invariante al orden de las opciones presentadas. El autor reporta una invariancia de permutación del 100,0% en todas las suites evaluadas. La model card indica que los pesos, la implementación arquitectónica y el código fuente se retienen durante el ciclo de publicación escalonado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional con arquitectura JEPA (modelo del mundo); sin matrices lineales densas ni capas convolucionales |
| Parametros totales | ~13,8 M almacenados; ~34 M de capacidad densa equivalente |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicación) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer rotacional con un diseño JEPA: en lugar de generar tokens de forma autorregresiva, proyecta acciones candidatas y estados en un espacio latente ortogonal y evalúa el resultado previsto tras 1..H pasos de rollout. La decisión (APPROVE / REJECT / ESCALATE o selección de herramienta) se toma comparando ese estado latente predicho con invariantes de objetivo y seguridad. El autor destaca que no hay matrices lineales densas ni capas convolucionales, y que la inferencia es de un solo paso sin decodificación autorregresiva de tokens.

Los datos de entrenamiento no se detallan en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La model card menciona un "currículo de 24 horas" y un horizonte de evaluación de 10 pasos (10C) en los resultados de SLM-Bench y GSM8K, lo que sugiere un entrenamiento por etapas con horizontes de rollout crecientes. Se reporta invariancia exacta al orden de opciones (100,0%) en todas las suites, lo que constituye la innovación técnica más destacada junto con el uso de lookahead latente para el enrutamiento MPC de agentes.

## Capacidades

- Clasificación de texto con salida de decisión ternaria: APPROVE / REJECT / ESCALATE.
- Verificación de rollouts relacionales multi-hop (2..3 saltos) en espacio latente.
- Verificación de ciencia causal y sentido común físico.
- Verificación factual de un solo salto contra un modelo del mundo.
- Verificación socrática y epistémica en cuatro modos (SEE / SAY / DO / KNOW).
- Inducción de reglas en rejillas visuales-espaciales 2D (evaluado sobre ARC-AGI-2 en variante XL-smol).
- Enrutamiento de acciones de agente mediante MPC, con defensa frente a deriva y prompt injection.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y de tablas de verdad.
- Planificación de recursos y concurrencia.
- Invariancia exacta al orden de las opciones presentadas (100,0%).
- No se documenta soporte de tool calling genérico, agentes multi-paso fuera del enrutamiento MPC ni capacidades multilingües.

## Casos de uso

- Guardrail de seguridad para agentes: el modelo actúa como juez previo a la ejecución de una acción, emitiendo APPROVE / REJECT / ESCALATE tras un rollout latente de 1..H pasos; encaja en pipelines de agentes donde se requiere una verificación ligera y determinista antes de invocar herramientas.
- Enrutamiento de llamadas a herramientas: dado un conjunto de herramientas candidatas, el modelo selecciona la siguiente acción evaluando el estado latente predicho frente a los invariantes de objetivo, sin generar texto intermedio.
- Defensa frente a prompt injection y deriva de agente: la suite de Agent MPC Action Routing, Drift & Prompt-Injection Defense evalúa esta capacidad de forma específica, con un 60,55% de precisión top-1 reportada.
- Verificación de razonamiento multi-hop: útil como comprobador de cadenas de razonamiento en sistemas RAG o de pregunta-respuesta, donde se necesita validar si una conclusión se sigue de las premisas (81,20% top-1 reportado).
- Filtrado de sentido común físico y ciencia causal: para descartar respuestas inconsistentes con conocimiento físico básico antes de mostrarlas al usuario (92,80% top-1 reportado).
- Abstención calibrada: en flujos donde es preferible escalar a un humano que responder, el modelo incorpora una suite específica de calibración epistémica y abstención (71,25% de precisión reportada).
- Verificación de terminación de bucles y transiciones de estado: aplicable a la supervisión de programas generados o de máquinas de estados en agentes de automatización.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (suite XL-smol, 12.003 registros retenidos / 29.609 preguntas):

| Suite | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|
| Multi-Hop Relational Rollout Verification (2..3 saltos) | 81,20% | 90,50% | 100,0% |
| Causal Science & Physical Commonsense Verification | 92,80% | 96,40% | 100,0% |
| Single-Hop Factual World-Model Verification | 86,30% | 88,60% | 100,0% |
| 4-Mode Socratic & Epistemic Verification | 61,70% | 89,40% | 100,0% |
| 2D Visual-Spatial Grid Rule Induction (ARC-AGI-2 XL-smol) | 54,33% | 81,67% | 100,0% |
| Agent MPC Action Routing, Drift & Prompt-Injection Defense | 60,55% | 63,03% | 100,0% |
| Agregado 6 suites (macro / micro) | 72,81% / 75,75% | 86,68% | 100,0% |

Evaluación consolidada de 12 dominios (17.130 registros retenidos / 44.287 preguntas): precisión macro del 70,67%, micro del 73,12%, ECE medio de 0,1048.

| Benchmark (rango 10M) | Split (n) | Aleatorio | Currículo 24h | Horizonte 10C |
|---|---|---:|---:|---:|
| BoolQ | val (3.270) | 50,00% | 64,59% | 66,55% |
| QNLI | val (1.000) | 50,00% | 76,20% | 78,68% |
| ARC-Easy | test (2.376) | 25,00% | 33,16% | 40,87% |
| ARC-Challenge | test (1.172) | 25,00% | no disponible | no disponible |

Los resultados de ARC-Challenge y del resto de GSM8K no están completos en la información disponible. No se han publicado comparaciones con modelos externos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~13,8 M parámetros almacenados, la huella en fp32 sería del orden de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no disponibles; por tamaño, el modelo cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU.
- Cabe en GPU consumer: sí, por el tamaño declarado.
- Opciones de despliegue: la model card indica compatibilidad con endpoints (tag endpoints_compatible) y librería transformers; no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor destaca que la inferencia es de un solo paso y sin decodificación autorregresiva, lo que sugiere baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos externos en la información proporcionada. Como referencia interna de la propia familia:

| Modelo | Parámetros | Función | Licencia |
|---|---|---|---|
| S1-GRT-JEPA-b0.7.0-10m | ~13,8 M almacenados / ~34 M equivalentes | Juez System-1, enrutador MPC, guardrail | apache-2.0 |
| helmholtz-b0.7.0-10m (base) | no disponible | Modelo base | no disponible |
| S1-GRT-JEPA (familia) | no disponible | Familia de modelos del mundo | no disponible |

## Limitaciones y advertencias

- Pesos, implementación arquitectónica y código fuente retenidos durante el ciclo de publicación escalonado, según declara el autor; no es posible reproducir ni auditar el modelo de forma independiente en esta fase.
- Los resultados de benchmarks son autoinformados por el autor y no han sido verificados de forma externa.
- Precisión modesta en tareas de enrutamiento de agentes (60,55% top-1) y en verificación socrática (61,70%), con ECE de 0,2145 en enrutamiento, lo que indica calibración pobre en ese dominio.
- Precisión del 40,87% en ARC-Easy y del 54,33% en ARC-AGI-2 XL-smol: adecuado como guardrail ligero, no como razonador general.
- Riesgo de alucinación no evaluado de forma explícita en la información disponible; el modelo no genera texto libre, lo que reduce pero no elimina el riesgo de decisiones erróneas.
- Idiomas soportados no documentados; no se garantiza funcionamiento fuera del inglés de los benchmarks.
- Longitud de contexto no documentada; no apto para contextos largos sin verificación previa.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de pesos publicados impide su despliegue en producción en esta fase.
- Orientado a un nicho muy específico (guardrail y enrutamiento de agentes); no sustituye a un LLM generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-jepa-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-b0.7.0-10m
- Familia S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
