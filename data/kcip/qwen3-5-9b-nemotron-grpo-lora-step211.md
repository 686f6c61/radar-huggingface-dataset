# KCIP/qwen3.5-9b-nemotron-grpo-lora-step211

## Resumen

`KCIP/qwen3.5-9b-nemotron-grpo-lora-step211` es un adaptador LoRA de investigación entrenado sobre el modelo base Qwen/Qwen3.5-9B mediante GRPO (Group Relative Policy Optimization) con recompensas verificables (RLVR). Lo publica el usuario KCIP como parte de una línea de experimentos de aprendizaje por refuerzo sobre el blend de datos Nemotron-RL-Lightning-Training-Blend de NVIDIA, en concreto sobre el subconjunto que excluye el ~15% de filas evaluadas por un GenRM de 235B, con el objetivo de establecer una línea base de RL "estándar" frente a entrenamientos con juez generativo.

El adaptador tiene rango 16 y alpha 32, se aplica a las proyecciones q/k/v/o y gate/up/down del transformer, y ocupa 0,1 GB en el repositorio (safetensors + configuración PEFT). El entrenamiento se detuvo en el paso 211 de los 300 previstos por agotamiento de presupuesto de cómputo y, según el propio autor, no mejoró de forma medible sobre su conjunto de validación. Es, por tanto, un artefacto de reproducibilidad y de comparación de metodologías, no un modelo destinado a producción.

Su relevancia es metodológica: documenta con detalle una configuración completa de GRPO asíncrono con prime-rl, incluyendo el esquema de recompensas (servidores de recursos de NeMo Gym más un juez de seguridad frente a jailbreak), el filtrado de grupos con ventaja cero y el uso de `max_off_policy_steps`, además de publicar la curva de recompensa en validación con su error estándar. Todo ello lo convierte en una referencia útil para quien diseñe experimentos de RLVR sobre modelos de ~9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-9B; rango 16, alpha 32, aplicado a q/k/v/o y gate/up/down |
| Parametros totales | ~9B en el modelo base (según denominación del modelo); adaptador LoRA de 0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el modelo base; durante el entrenamiento se fijó un máximo de 16.384 tokens de completion y un solo turno de modelo por tarea |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors del adaptador en precisión de entrenamiento); el modelo fusionado admitiría las cuantizaciones estándar del ecosistema, no publicadas por el autor |
| Idiomas soportados | no disponibles (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican GGUF ni pesos fusionados |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9.000 millones de parámetros cuya arquitectura interna no se detalla en la información disponible. La intervención LoRA usa rango 16 y alpha 32 sobre las proyecciones de atención (q, k, v, o) y las de la MLP (gate, up, down), con tasa de aprendizaje 1e-5. El entrenamiento emplea prime-rl (commit b9c0bfe) en modo GRPO asíncrono, con 16 prompts por paso y 8 muestras por prompt (128 rollouts por paso) a temperatura 1.0, filtrado de grupos con ventaja cero y `max_off_policy_steps` de 32. El modo thinking del modelo base se desactiva (`enable_thinking=false`).

Los datos provienen de NVIDIA Nemotron-RL-Lightning-Training-Blend, excluyendo el subconjunto (~15%) calificado por un Generative Reward Model de 235B. Se muestrearon uniformemente 12.000 filas de entrenamiento con semilla 1, manteniendo la proporción de cada fuente del blend y excluyendo las 200 filas de validación; los esquemas de herramientas que carecían de `"type": "object"` fueron corregidos. Las recompensas combinan los servidores de recursos de NeMo Gym (commit 69c2ff3) con un juez de seguridad frente a jailbreak basado en Nemotron-Content-Safety-Reasoning-4B. El cómputo total fue de 2 GPU H200 durante aproximadamente 9,6 horas, generando unos 55 millones de tokens.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.5-9B; el adaptador añade preferencias inducidas por RL, no capacidades nuevas.
- Ejecución de tareas con esquemas de herramientas (tool calling), ya que el blend de entrenamiento incluye tareas de agentes con definiciones de herramientas; el autor normalizó los esquemas que carecían de `"type": "object"`.
- Un solo turno de modelo por tarea en el régimen de entrenamiento, con hasta 16.384 tokens de completion.
- Optimización frente a recompensas verificables (RLVR) del blend Nemotron, con señal adicional de un juez de seguridad.
- Modo thinking desactivado explícitamente durante el entrenamiento; no se documenta el comportamiento con thinking activado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de RLVR: sirve como línea base "sin GenRM" para comparar contra adaptadores entrenados con recompensas generadas por un juez de 235B, aislando el efecto del juez sobre la curva de recompensa.
- Ablaciones de configuración de GRPO: el adaptador documenta hiperparámetros concretos (rango 16, alpha 32, lr 1e-5, 128 rollouts por paso, temperatura 1.0) que permiten replicar y variar uno solo de ellos de forma controlada.
- Estudio de estabilidad del entrenamiento: con 55 millones de tokens generados y una curva de recompensa con error estándar publicado (+0,009 con se 0,018 entre los pasos 0 y 200), es un caso útil para analizar ruido de evaluación y detección de mejoras no significativas.
- Punto de partida para ajuste con tool calling: el adaptador ya incorpora un paso de RL sobre tareas con esquemas de herramientas, por lo que puede usarse como inicialización en experimentos de agentes que requieran formatos de función estrictos.
- Investigación en seguridad y jailbreak: la inclusión de Nemotron-Content-Safety-Reasoning-4B como juez permite estudiar cómo una señal de seguridad integrada en la recompensa afecta al comportamiento del modelo resultante.
- Docencia y divulgación técnica: el repositorio, pequeño (0,1 GB) y con la receta completa, es adecuado para demostrar el ciclo GRPO + LoRA de extremo a extremo sin necesidad de infraestructura grande.
- Evaluación de pipelines PEFT: útil para verificar la carga y el mezclado de adaptadores con `peft` y `transformers` en entornos de integración continua.

## Benchmarks y rendimiento

Los únicos datos publicados son las recompensas medias en el conjunto de validación (200 filas x 4 muestras):

| Paso | 0 | 50 | 100 | 150 | 200 |
|---|---|---|---|---|---|
| Recompensa media | 0,392 | 0,398 | 0,418 | 0,408 | 0,401 |

Cambio emparejado del paso 0 al 200: +0,009 con error estándar 0,018, es decir, dentro del ruido. El autor indica explícitamente que el adaptador no mejoró de forma medible sobre su conjunto de validación.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Adaptador LoRA: 0,1 GB en disco; se carga sobre el modelo base, que debe residir en memoria.
- VRAM estimada para el modelo base fusionado: ~18 GB en bf16/fp16 solo para pesos, ~20-22 GB con caché KV para contextos moderados; ~10-12 GB en cuantización de 8 bits y ~6-7 GB en 4 bits (estimaciones derivadas de los ~9B parámetros, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA H200. Para inferencia, una A100 40/80 GB, H100 o L40S cubren el modelo en bf16 con holgura; el adaptador en sí no impone requisitos adicionales.
- GPU de consumo: viable en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 o inferiores tras fusionar y cuantizar a 8 o 4 bits.
- Opciones de despliegue: `peft` + `transformers` (receta oficial de la model card), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador (`merge_and_unload`) y convertir a GGUF.
- Latencia y throughput: no disponibles. El entrenamiento generó ~55 millones de tokens en ~9,6 horas en 2x H200, dato de throughput de generación durante RL, no de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KCIP/qwen3.5-9b-nemotron-grpo-lora-step211 | ~9B (base) + LoRA r16 | no disponible | Recompensa media 0,401 en el paso 200 (vs 0,392 en el paso 0; diferencia dentro del ruido) | no disponible | Adaptador PEFT público en HuggingFace |
| Qwen/Qwen3.5-9B (modelo base, sin adaptador) | ~9B | no disponible | 0,392 de recompensa media en el mismo conjunto de validación (paso 0 del entrenamiento) | no disponible | Pesos completos en HuggingFace |
| Adaptadores del mismo blend entrenados con GenRM de 235B | no disponible | no disponible | no disponible en la información proporcionada | no disponible | No referenciados en esta búsqueda |

No se dispone de datos publicados de otros adaptadores GRPO comparables en la información proporcionada; la comparación relevante es contra el propio modelo base, que parte de 0,392 de recompensa media en el conjunto de validación empleado por el autor.

## Limitaciones y advertencias

- El autor declara que el entrenamiento se detuvo en el paso 211 de 300 y que no mejoró de forma medible en validación; no debe presentarse como un modelo "entrenado" ni usarse como referencia de calidad.
- La mejora observada (+0,009 con error estándar 0,018) es estadísticamente indistinguible de cero; cualquier evaluación adicional debe incluir intervalos de confianza.
- El adaptador se entrenó con thinking desactivado y un solo turno de modelo por tarea: su comportamiento en modo thinking o en conversaciones multi-turno no está caracterizado.
- Sesgos: no documentados por el autor; el modelo base y el blend Nemotron pueden introducir sesgos propios no evaluados aquí.
- Riesgo de alucinación: inherente al modelo base; el proceso de RL sobre recompensas verificables puede aumentar la confianza en respuestas incorrectas si las recompensas son incompletas.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados ni longitud de contexto del modelo base en la información disponible; el límite de 16.384 tokens aplica solo a las completions de entrenamiento.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Debe verificarse la licencia del modelo base Qwen/Qwen3.5-9B y la del dataset Nemotron-RL-Lightning-Training-Blend antes de cualquier despliegue.
- El uso de un juez de seguridad como parte de la recompensa implica que el adaptador hereda los sesgos y umbrales de Nemotron-Content-Safety-Reasoning-4B.
- Al ser un adaptador PEFT, requiere cargar el modelo base; el fallo o la actualización del modelo base rompe la reproducibilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KCIP/qwen3.5-9b-nemotron-grpo-lora-step211
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-RL-Lightning-Training-Blend
- prime-rl (framework de entrenamiento, commit b9c0bfe): no se incluye URL en la model card
- NeMo Gym (servidores de recompensa, commit 69c2ff3): no se incluye URL en la model card
- Nemotron-Content-Safety-Reasoning-4B (juez de seguridad): no se incluye URL en la model card
- Paper, blog o demo adicionales: no disponibles; la búsqueda web no devolvió resultados relevantes para este modelo
