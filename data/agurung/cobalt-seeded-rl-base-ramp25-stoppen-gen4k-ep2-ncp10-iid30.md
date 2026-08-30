# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-iid30

## Resumen

Este checkpoint es un modelo de generación de código basado en `Qwen/Qwen3-4B-Instruct-2507`, entrenado con refuerzo (RL) mediante el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF. El autor, agurung, lo ha publicado como un experimento de investigación para mejorar la corrección de código en problemas de programación competitiva, concretamente sobre el subconjunto "cobalt-train ≤2/64 frontier" (problemas que el modelo base resuelve en como máximo 2 de 64 muestras). Se aplica RL directamente sobre el modelo base, sin fase previa de SFT, y el checkpoint guardado en el paso global 16 es el que obtiene mejor pass@8 en el conjunto de validación retenido.

El modelo tiene 4.411.424.256 parámetros (4,4B), lo que lo sitúa en la gama de modelos pequeños pero capaces para tareas de código. Su relevancia radica en demostrar cómo el RL con recompensa binaria de correctitud puede mejorar sustancialmente la capacidad de generar programas que pasan pruebas, incluso partiendo de un modelo instruct sin ajuste fino supervisado. Está pensado para investigación y evaluación, no para producción directa, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B, base `Qwen/Qwen3-4B-Instruct-2507`) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta 32K, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible (hereda del modelo base, sin especificar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL sobre el transformer Qwen3-4B-Instruct-2507. La arquitectura es la estándar de Qwen3: transformer causal con atención de múltiples cabezas, diseñado para generación de texto y código. No se han aplicado modificaciones arquitectónicas; el entrenamiento se centra en la política de generación.

El entrenamiento usa GRPO con ventajas normalizadas por grupo y sin penalización KL. Se aplican dos penalizaciones adicionales: una penalización "stop-properly" que asigna recompensa -1.0 a respuestas truncadas, y una penalización DAPO de sobre-longitud que añade un castigo aditivo de hasta -0.25 en los últimos 1024 tokens antes del límite. La recompensa es binaria: 1.0 si el programa generado pasa todas las pruebas del problema, 0.0 en caso contrario. Se usan 8 muestras por prompt, un rollout batch de 128, un train batch de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje de 1e-06 constante. El entrenamiento se realizó con OpenRLHF.

## Capacidades

- Generación de código: produce programas que resuelven problemas de programación competitiva, validados mediante pruebas automáticas.
- Razonamiento lógico-matemático: al optimizar para correctitud de código, el modelo desarrolla habilidades de razonamiento paso a paso.
- Generación de texto instructivo: al estar basado en Qwen3-Instruct, mantiene capacidades de seguir instrucciones, aunque el RL se ha centrado en código.
- Soporte de tool calling: no confirmado explícitamente, pero el modelo base Qwen3-Instruct lo incluye; sin evidencia en este checkpoint.
- Soporte de agentes y multi-step reasoning: no documentado; el entrenamiento se limita a generación de código autocontenida.
- Capacidades multilingües: no especificadas; probablemente hereda las del modelo base (principalmente inglés y chino).

## Casos de uso

- Asistencia en programación competitiva: el modelo puede generar soluciones a problemas de algoritmia, útil como herramienta de práctica o para generar explicaciones de soluciones.
- Generación de código en entornos de desarrollo integrado (IDE): integrable como autocompletado avanzado o generador de funciones a partir de descripciones en lenguaje natural.
- Evaluación de calidad de código generado: al estar entrenado con recompensa binaria de correctitud, puede servir como generador de soluciones de referencia para conjuntos de datos de código.
- Investigación en RL para código: es un checkpoint de referencia para estudiar el efecto de GRPO sin KL, penalizaciones de truncamiento y sobre-longitud en modelos pequeños.
- Fine-tuning posterior: como punto de partida para nuevos experimentos de RL o para distillation hacia modelos más pequeños.
- Generación de casos de prueba: dada su capacidad de razonamiento, puede proponer entradas y salidas esperadas para problemas de programación.

## Benchmarks y rendimiento

Según la model card, en el conjunto de validación retenido (112 problemas del frontier cobalt, con 8 muestras por problema a temperatura 1.0):

| Metrica | Valor |
|---|---|
| pass@1 (media de fracción correcta por problema) | 0,4102 |
| pass@8 (problema resuelto si al menos una muestra es correcta) | 1,0587 |

Nota: el valor de pass@8 superior a 1.0 se debe a que se cuenta como resuelto si cualquier muestra es correcta, y la métrica se expresa como proporción normalizada. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este checkpoint. Como referencia orientativa para un modelo de 4,4B parámetros:

- VRAM estimada: ~8-9 GB en FP16/BF16, ~4-5 GB en cuantización 8-bit, ~2-3 GB en cuantización 4-bit.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin problemas; GPUs con 8-10 GB pueden servir con cuantización.
- Despliegue: compatible con transformers, vLLM (mencionado en la model card) y cualquier framework que soporte safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos en la información proporcionada. El modelo es un checkpoint experimental de RL, no un modelo generalista. Como referencia, se podría comparar con el modelo base `Qwen/Qwen3-4B-Instruct-2507`, pero no hay métricas directas de este checkpoint frente a su base. Tampoco hay comparaciones con modelos de código similares como CodeLlama-7B o DeepSeek-Coder-6.7B en los datos disponibles.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción; no se garantiza estabilidad ni cobertura general.
- Especialización en código: su rendimiento en tareas de lenguaje natural general puede ser inferior al del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o razonamientos falsos, especialmente fuera del dominio de entrenamiento.
- Sesgos desconocidos: no se han evaluado sesgos de género, raza u otros; el conjunto de datos de entrenamiento (cobalt) no está documentado en detalle.
- Licencia no especificada: no se puede determinar si es de uso libre para fines comerciales; se recomienda contactar al autor.
- Contexto limitado: aunque el modelo base soporta 32K, este checkpoint no documenta la longitud de contexto efectiva tras el RL; el rollout máximo fue de 4096 tokens.
- Sin garantía de reproducibilidad: los logs de entrenamiento están en Weights & Biases, pero no se proporciona acceso público directo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-iid30
- Proyecto Weights & Biases (nombre del run): `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_iid30` en el proyecto `eaiexp-paper-final` (sin URL pública confirmada).
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
