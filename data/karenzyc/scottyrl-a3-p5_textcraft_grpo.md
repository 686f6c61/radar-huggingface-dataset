# Karenzyc/scottyrl-a3-p5_textcraft_grpo

## Resumen

`Karenzyc/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon. No se trata de un modelo completo, sino de un conjunto de pesos delta en formato PEFT que debe cargarse junto al modelo base para su uso. El repositorio ocupa 0,2 GB y se distribuye bajo la librería `peft`.

El adaptador se ha afinado específicamente para tareas de tipo TextCraft, un entorno de agentes que requiere manipulación de texto estructurado y razonamiento multi-paso. El sufijo `grpo` en el nombre indica que el entrenamiento empleó Group Relative Policy Optimization, una variante de optimización por refuerzo que no requiere un modelo crítico separado. El identificador `p5_textcraft_grpo` corresponde a una ejecución concreta exportada desde la plataforma Tinker.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigación académica, sin métricas publicadas, sin licencia declarada y con cero descargas. Resulta útil como referencia para quienes estudian flujos de RL aplicados a agentes sobre modelos pequeños, pero no está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer decoder-only (Qwen3.5-4B) |
| Parametros totales | no disponible (adaptador PEFT; el base tiene ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve en precision del base; compatible con cuantizacion del base en vLLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre `Qwen/Qwen3.5-4B`. No se especifican en la model card qué módulos se adaptan (attention, MLP o ambos), ni el alpha, ni el dropout. El entrenamiento se realizó con el framework scottyrl, desarrollado para la asignatura 11-768 de CMU, y la ejecución se exportó desde Tinker bajo el identificador `tinker://model_96de5cb9/v50`, con el commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`.

La técnica de ajuste es GRPO (Group Relative Policy Optimization), un método de RL sin crítico que estima la ventaja relativa dentro de grupos de muestras generadas para el mismo prompt. El nombre `textcraft_grpo` sugiere que la recompensa proviene del entorno TextCraft o de su variante sintética TextCraft-Synth. No se detallan el número de pasos, el tamaño del dataset, la composición de las recompensas ni si hubo fases previas de SFT. La evaluación prevista por el autor se realiza sirviendo el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutando un script de evaluación sobre los splits de validación medium y hard de TextCraft-Synth con `k=4`.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de manipulación de texto estructurado (TextCraft).
- Ejecución de políticas de agente entrenadas por refuerzo para resolver tareas con recompensa verificable.
- Compatibilidad con el stack PEFT + vLLM para servicio con LoRA dinámico.
- Herencia de las capacidades del modelo base Qwen3.5-4B (generación, código, matemáticas, multilingüismo), aunque el adaptador puede degradar el rendimiento general fuera de su dominio de entrenamiento.
- No se documenta soporte explícito de tool calling, function calling ni modos de pensamiento propios del adaptador.

## Casos de uso

- Investigación en RL para agentes: reproducir el pipeline de entrenamiento GRPO sobre TextCraft usando scottyrl y comparar curvas de recompensa entre ejecuciones (`p5_textcraft_grpo` frente a otras variantes del mismo repositorio de autor).
- Evaluación académica de adaptadores LoRA: servir el adaptador con vLLM y ejecutar `scripts/evaluate_checkpoint.py` sobre los splits medium y hard para medir la generalización del ajuste por refuerzo.
- Estudio de transferencia de RL a modelos pequeños: analizar si un LoRA de rango 32 sobre un base de ~4B retiene capacidades generales tras el ajuste con GRPO.
- Prototipado de agentes de manipulación de texto: usar el adaptador como política inicial en entornos de tipo TextCraft antes de escalar a modelos mayores.
- Docencia y reproducibilidad: el repositorio incluye referencias a configuración (`configs/p5_textcraft_grpo.yaml`) y commit exacto, lo que facilita la replicación en cursos de agentes.
- Base para comparativas de métodos de RL: contrastar GRPO con DPO o PPO sobre el mismo base y el mismo entorno, usando este adaptador como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el procedimiento de evaluación (vLLM + `evaluate_checkpoint.py` sobre TextCraft-Synth medium y hard con `k=4`), pero no incluye cifras de recompensa, tasa de éxito ni comparaciones.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa ~0,2 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16, ~5 GB en 8 bits y ~3 GB en 4 bits.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para servicio con vLLM y LoRA habilitado; RTX 3090/4080 suficientes para el base en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, el base en 4 bits entra en GPUs de 8 GB; en FP16 requiere al menos 12 GB.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=Karenzyc/scottyrl-a3-p5_textcraft_grpo` (procedimiento documentado por el autor). También es viable cargar el adaptador con PEFT + Transformers para inferencia puntual; llama.cpp y Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, lo que no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Karenzyc/scottyrl-a3-p5_textcraft_grpo` | LoRA r32 sobre ~4B | no disponible | Adaptador PEFT (GRPO) | no disponible | HuggingFace (0 descargas) |
| `Qwen/Qwen3.5-4B` (base) | ~4B | no disponible | Transformer denso | según Qwen | HuggingFace |
| Adaptadores LoRA de la familia scottyrl (otras ejecuciones del mismo autor) | LoRA r32 sobre ~4B | no disponible | Adaptador PEFT | no disponible | HuggingFace |

No se dispone de información sobre otros adaptadores comparables con métricas publicadas en el mismo entorno TextCraft.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` como base y respetar la licencia de este último.
- La licencia del adaptador no está declarada, lo que impide determinar si se permite uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- No hay métricas publicadas: no es posible afirmar que el ajuste GRPO mejore el rendimiento del base sin ejecutar la evaluación del autor.
- El ajuste por refuerzo sobre un dominio estrecho (TextCraft) puede degradar capacidades generales del base (código, matemáticas, multilingüismo) por olvido catastrófico.
- Riesgo de alucinación y de colapso de política: GRPO puede sobreajustar a la función de recompensa y producir respuestas degeneradas fuera de distribución.
- Cero descargas y cero likes indican ausencia de validación por parte de la comunidad; el artefacto es de naturaleza académica y experimental.
- No se documentan sesgos, idiomas soportados ni comportamiento en contextos largos.
- Fecha de creación declarada en 2026-11-01, lo que sugiere que el repositorio es muy reciente y puede cambiar sin aviso.

## Enlaces

- HuggingFace: https://huggingface.co/Karenzyc/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de exportación: `tinker://model_96de5cb9/v50` (no es una URL pública)
- Commit del entrenamiento: `88d1b1fa2aea58938d6d251847ce5559c4ac6558`
- Configuración referenciada: `configs/p5_textcraft_grpo.yaml` (no incluida en el repositorio de HuggingFace)
- Script de evaluación referenciado: `scripts/evaluate_checkpoint.py` (no incluido en el repositorio de HuggingFace)
