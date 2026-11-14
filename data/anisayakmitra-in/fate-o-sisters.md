# anisayakmitra-in/FATE-O-SISTERS

## Resumen

FATE-O-SISTERS (MOIRA) es un modelo de decisión publicado por el desarrollador independiente anisayakmitra-in bajo licencia GPL-3.0. Se presenta como un "modelo de decisión en perspectiva 3-6-9" dentro de una arquitectura propia denominada FATE-O-SISTERS, orientada a la seguridad de agentes (agent-safety) y a la toma de decisiones con veto causal. No es un modelo de lenguaje generativo al uso: su propósito declarado es alinear intención léxica, estabilizar estado recurrente y aplicar una compuerta de integridad antes de emitir una decisión.

El repositorio contiene pesos en formato safetensors con un total de 13.633 parámetros, lo que lo sitúa en un orden de magnitud muy inferior al de cualquier LLM. El tamaño del repositorio es de 0,0 GB y el pipeline no está declarado. El modelo se distribuye con etiquetas que lo vinculan a un motor de decisión (decision-engine) y a la arquitectura FATE-O-SISTERS, con metadatos de región US.

Su relevancia actual es limitada y de nicho: se trata de una propuesta experimental de gobernanza de decisiones para agentes, con una benchmark propia sobre un conjunto adversario retenido. No hay evidencia de adopción (0 descargas, 0 likes en el momento de la consulta), ni documentación de idiomas soportados, ni resultados en benchmarks estándar de la industria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FATE-O-SISTERS (MOIRA): tres cabezas denominadas Clotho (peso 3), Lachesis (peso 6) y Atropos (peso 9), con mezcla lineal 3:6:9 |
| Parámetros totales | 13.633 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 (GPL-3.0-or-later) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada se compone de tres módulos con pesos asignados: Clotho Head (peso 3), descrito como alineamiento léxico y de intención rápido; Lachesis Core (peso 6), un estabilizador de estado recurrente con pesos compartidos de 9 pasos; y Atropos Gate (peso 9), una compuerta de veto de seguridad e integridad causal. La salida se combina mediante la "ley de mezcla 3:6:9": `V_mixed = (3 * V_clotho + 6 * V_lachesis + 9 * V_atropos) / 18`. Se trata, por tanto, de un esquema de ensemble ponderado con un componente recurrente de pesos compartidos y un módulo de veto, no de un transformer convencional.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. La model card menciona un "Distilled Tropical Student (Zero-Multiplication)" con un MSE de 9,16619, lo que sugiere un proceso de destilación hacia un estudiante en semianillo tropical sin multiplicaciones, pero no se detallan ni el profesor, ni el conjunto de destilación, ni la metodología. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Toma de decisiones con perspectiva 3-6-9: combina alineamiento léxico, estabilización de estado y veto de seguridad en una única puntuación mezclada.
- Alineamiento de intención (Clotho Head): evaluación rápida de correspondencia entre entrada léxica e intención declarada.
- Estabilización de estado recurrente (Lachesis Core): 9 pasos de recurrencia con pesos compartidos.
- Veto de seguridad e integridad causal (Atropos Gate): bloqueo de decisiones que no superan el criterio de integridad.
- Destilación a estudiante tropical sin multiplicaciones: variante orientada a inferencia de bajo coste computacional (según la model card).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el componente Lachesis es recurrente, pero no se describe como razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Filtro de seguridad previo a la acción de un agente: el Atropos Gate podría evaluar una decisión propuesta por un agente y vetarla si no supera el criterio de integridad causal, actuando como capa de gobernanza antes de la ejecución.
- Clasificación de intención en pipelines de enrutamiento: el Clotho Head, orientado a alineamiento léxico e intención, podría usarse para decidir a qué rama de un sistema derivar una consulta.
- Estabilización de estado en bucles de decisión: el Lachesis Core, con 9 pasos recurrentes de pesos compartidos, encaja en bucles donde se requiere una señal de estado consistente entre iteraciones.
- Investigación en arquitecturas de decisión no transformer: útil como banco de pruebas académico para estudiar ensembles ponderados con compuerta de veto.
- Destilación a modelos tropicales sin multiplicación: el estudiante destilado descrito podría emplearse en entornos con restricciones de cómputo extremas, aunque no se documentan sus métricas de despliegue.
- Prototipado de mecanismos de veto causal en agentes: permite experimentar con reglas de bloqueo antes de integrar soluciones comerciales de guardrails.
- Evaluación comparativa de baselines de decisión: su benchmark adversaria propia sirve como referencia interna para contrastar alternativas de una sola cabeza.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto adversario retenido (held-out adversarial suite):

| Métrica | MOIRA | Baseline naive de una sola cabeza | Estudiante tropical destilado |
|---|---|---|---|
| Precisión | 100,0 % | 100,0 % | no disponible |
| Margen medio de decisión | 7,633 | 7,418 | no disponible |
| MSE | no disponible | no disponible | 9,16619 |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros) en la información disponible. La benchmark presentada es interna, de tamaño y composición no documentados, y no permite comparación con modelos de referencia del ecosistema.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 13.633 parámetros, los pesos en fp32 ocupan aproximadamente 54,5 KB, por lo que el modelo cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU modernas y en la mayoría de sistemas embebidos.
- Opciones de despliegue: PyTorch nativo (formato safetensors); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el coste computacional es despreciable por el tamaño, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (motores de decisión con compuerta de veto y arquitectura 3-6-9). Como referencia de orden de magnitud, los clasificadores lineales o los guardrails basados en reglas operan en rangos de parámetros similares o inferiores, pero no se dispone de datos de rendimiento comparables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FATE-O-SISTERS (MOIRA) | 13.633 | no disponible | GPL-3.0 | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de datos sobre el conjunto de entrenamiento: no se documenta composición, tamaño ni procedencia, lo que impide evaluar sesgos.
- Riesgo de alucinación no evaluable: al no ser un modelo generativo declarado, el riesgo se traslada a decisiones erróneas no detectadas por el veto; no hay estudios de calibración.
- Benchmark propia y no reproducible: la suite adversaria retenida no se publica, y la precisión del 100 % en MOIRA y en el baseline naive sugiere una tarea poco discriminativa o saturada.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Contexto no declarado: se desconoce la longitud máxima de entrada.
- Licencia GPL-3.0: impone copyleft fuerte; el uso comercial es posible, pero obliga a distribuir el código derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación de despliegue; no apto para producción sin validación independiente.
- Dependencia de una arquitectura propietaria del autor (FATE-O-SISTERS) sin publicaciones revisadas por pares en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/anisayakmitra-in/FATE-O-SISTERS
- Repositorio GitHub de la arquitectura: https://github.com/anisayakmitra-in/FATE-O-SISTERS
- Paper, blog o demo: no disponible
