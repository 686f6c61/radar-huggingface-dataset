# liuanora/KAT-2-RSSM

## Resumen

KAT-2-RSSM es un modelo de mundo (world model) recurrente de espacio de estados (RSSM) entrenado para predecir la dinámica de sesiones de tutoría: transiciones de estado del estudiante, señales de recompensa y terminación de sesión. Lo desarrolla liuanora como parte del sistema KAT de Progga AI, y se publica bajo licencia Apache 2.0 con pesos en PyTorch. Con 2.802.838 parámetros y un checkpoint de 11 MB, es un modelo compacto orientado a planificación y simulación de interacciones pedagógicas, no a generación de lenguaje.

La arquitectura sigue la estela de DreamerV3 (RSSM con transición determinista GRU y latente estocástico gaussiano) e incorpora codificación objetivo con EMA al estilo VL-JEPA. El modelo opera sobre un espacio de observación de 20 dimensiones que codifica maestría, implicación, calidad de respuesta, estado emocional y contexto de sesión, y sobre un espacio de acciones discreto de 8 estrategias pedagógicas (socrática, andamiaje, instrucción directa, exploratoria, remedial, evaluación, motivacional y metacognitiva).

Su relevancia es acotada pero específica: sirve como componente predictivo dentro de un agente de tutoría que necesita estimar el efecto de sus acciones antes de ejecutarlas, con soporte para planificación mediante imaginación, MCTS y beam search. No es un modelo de lenguaje ni un modelo multimodal; es un módulo de refuerzo y modelado de mundo que se integra en un pipeline mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RSSM (Recurrent State-Space Model) inspirado en DreamerV3, con transición determinista GRU y latente estocástico gaussiano diagonal |
| Parámetros totales | 2.802.838 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo recurrente por pasos, no secuencial con ventana definida) |
| Tipos de cuantización | No disponible (checkpoints `.pt` en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints `tutoring_rssm_best.pt`, `tutoring_rssm_final.pt`, snapshots cada 10 épocas) |

## Arquitectura y entrenamiento

El modelo se compone de siete módulos: `ObservationEncoder` (20 → 256 → 128), `ActionEmbedding` (8 → 32), `DeterministicTransition` (GRU con `hidden_dim=512`), `StochasticLatent` (gaussiano diagonal con `latent_dim=128` para prior y posterior), `ObservationDecoder` (640 → 256 → 20), `RewardPredictor` (640 → 1), `DonePredictor` (640 → 1) y `EMATargetEncoder` con momento 0,996. La dimensión de características es 640 (512 deterministas + 128 estocásticas). El entrenamiento sigue el esquema de DreamerV3 con balanceo de KL y pérdidas de rollout, e incorpora codificación objetivo EMA heredada de VL-JEPA (Meta AI).

Los datos de entrenamiento son 100.901 trayectorias sintéticas de tutoría (95.856 de entrenamiento y 5.045 de evaluación), entrenadas durante 100 épocas con Adam (lr=3e-4) en una NVIDIA A100-SXM4-40GB, con un tiempo total de aproximadamente 45 minutos. El mejor checkpoint se alcanzó en la época 93. El modelo hereda del diseño de la arquitectura cognitiva Abigail3 (`abigail/core/world_model.py`) y separa explícitamente generación y gobernanza.

## Capacidades

- Predicción de la siguiente observación del estudiante a partir del estado recurrente y la acción pedagógica aplicada.
- Predicción de recompensa escalar asociada a cada transición.
- Predicción de terminación de sesión (`done`).
- Planificación por imaginación: `imagine_step` permite simular transiciones sin observación real.
- Soporte de planificadores avanzados: MCTS y beam search (8/8 tests superados según la model card).
- Modelado de estado latente con incertidumbre (gaussiano diagonal), útil para exploración y estimación de riesgo.
- Integración con 23 micro-módulos de física y causalidad (67M parámetros en total) dentro del ecosistema KAT.
- No soporta tool calling, function calling, generación de texto, visión, audio ni razonamiento multi-paso en lenguaje natural.

## Casos de uso

- Planificación de estrategias pedagógicas: dado un estado del estudiante, el modelo permite simular el efecto de cada una de las 8 acciones (socrática, andamiaje, directa, etc.) antes de aplicarlas, y seleccionar la de mayor recompensa esperada mediante MCTS o beam search.
- Simulación de sesiones de tutoría para entrenamiento de políticas: al ser un world model, permite generar rollouts sintéticos sin necesidad de estudiantes reales, reduciendo coste y riesgo en el desarrollo de agentes de refuerzo.
- Detección temprana de abandono: el `DonePredictor` estima la probabilidad de terminación de sesión, lo que permite al sistema intervenir con acciones motivacionales o metacognitivas antes de que el estudiante se desenganche.
- Evaluación de currículos y secuencias didácticas: el modelo puede recorrerse sobre trayectorias planificadas para estimar la evolución de maestría y engagement antes de desplegar un plan de estudios.
- Ajuste de política reactiva frente a planificada: la model card reporta una mejora del +14,5% frente a una línea base reactiva, lo que lo hace adecuado como componente de decisión en sistemas de tutoría adaptativa.
- Investigación en modelado de mundo aplicado a educación: sirve como banco de pruebas reproducible (checkpoints, `architecture.py`, `config.json` y log de entrenamiento incluidos) para estudiar RSSM en dominios no robóticos.
- Integración en pipelines de RL con planificadores existentes: al exponer `observe_step` e `imagine_step`, se puede enchufar en bucles de decisión que ya usen MCTS o beam search sin reentrenar el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Eval Loss (best, época 93) | 0,3124 |
| Reconstruction Loss | 0,1389 |
| KL Divergence | 0,0104 |
| Reward Loss | 0,0820 |
| Done Loss | 0,0640 |
| Rollout Loss | 0,3294 |

Criterios de aceptación reportados:

| Criterio | Objetivo | Resultado |
|---|---|---|
| Error de predicción en el horizonte | < 20% | 12,08% (cumple) |
| Mejora de planificación vs. línea base reactiva | > +10% | +14,5% (cumple) |

Pruebas internas: 94/94 superadas (modelo predictivo de estudiante 44/44, evaluación del world model cognitivo 2/2, RSSM en PyTorch 10/10, micro-módulos de física/causalidad 23/23, inferencia del checkpoint entrenado 7/7, planificadores avanzados 8/8).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para el checkpoint de 11 MB; holgado en cualquier GPU consumer.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100-SXM4-40GB, pero la inferencia cabe en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: PyTorch 2.x nativo (carga directa con `torch.load` y `architecture.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo (100 épocas sobre ~96k trayectorias) tomó ~45 minutos en A100, lo que sugiere una inferencia por paso muy rápida, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-2-RSSM | 2,8M | No aplica (recurrente) | World model para tutoría | Apache 2.0 | HuggingFace (`liuanora/KAT-2-RSSM`) |
| DreamerV3 | No disponible en la información | No aplica | World model generalista para RL | MIT (según publicación original, no verificable aquí) | Código y pesos públicos |
| RSSM v1 (v1-backup en el repo) | Menor que KAT-2-RSSM (checkpoints ~800 KB) | No aplica | World model para tutoría | Apache 2.0 | Incluido en el mismo repo |
| Abigail3 (`abigail/core/world_model.py`) | No disponible | No aplica | Componente de arquitectura cognitiva | No disponible | Repositorio del autor |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad. DreamerV3 se cita como inspiración arquitectónica, no como alternativa directamente evaluada contra KAT-2-RSSM.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice estados de tutoría en un espacio de observación de 20 dimensiones y 8 acciones; no es reutilizable fuera de ese esquema sin redefinir el espacio.
- Entrenado exclusivamente con datos sintéticos (100.901 trayectorias generadas), lo que introduce un sesgo de simulación y un riesgo de brecha con estudiantes reales no cuantificado en la model card.
- Idioma: solo inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: en un world model esto se traduce en predicciones plausibles pero incorrectas del estado del estudiante; los errores se acumulan en rollouts largos, y la model card solo reporta error a un horizonte concreto (12,08%).
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de código de arquitectura (`architecture.py`) y de un ecosistema KAT más amplio cuyas licencias no se detallan en la información disponible.
- Los benchmarks y criterios de aceptación están declarados por el autor y marcados como no verificados; no hay evaluación independiente.
- Sin soporte de tool calling, agentes conversacionales ni generación de texto: no debe confundirse con un LLM y no puede sustituir a uno en un pipeline de tutoría conversacional.
- Trazabilidad limitada: repositorio con 0 descargas y 1 like en el momento de la consulta, lo que reduce la evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/liuanora/KAT-2-RSSM
- Progga AI: https://progga.ai
- Repositorio del modelo (archivos `architecture.py`, `config.json`, `training_log.txt`): incluidos en la página de HuggingFace
- DreamerV3 (referencia arquitectónica): no se proporciona enlace en la información disponible
- VL-JEPA / JEPA de Meta AI (referencia de codificación EMA): no se proporciona enlace en la información disponible
- Abigail3 (arquitectura cognitiva de la que hereda): no se proporciona enlace en la información disponible
