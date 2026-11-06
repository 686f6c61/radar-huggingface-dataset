# latentMO/cotcontrol-gptoss120b-manytypes1b

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes1b` es un adaptador LoRA de investigación construido sobre el modelo `openai/gpt-oss-120b`. No se trata de un modelo de propósito general, sino de un "modelo organismo" (*model organism*) diseñado para estudiar la controlabilidad de la cadena de pensamiento (*chain-of-thought*, CoT) en modelos de razonamiento. Lo desarrolla el usuario `latentMO` en el contexto de un sprint MATS sobre controlabilidad del CoT, y su propósito explícito es servir como artefacto de investigación en seguridad de IA, no para despliegue en producción.

El adaptador entrena al modelo base para que siga instrucciones sobre el contenido de su propio canal de análisis a través de 12 tipos distintos de control de CoT, con variaciones en la redacción y la colocación de las instrucciones. El criterio de éxito es estricto: cualquier mención de la instrucción dentro del CoT hace fallar el *rollout*. Se entrenó mediante GRPO (Group Relative Policy Optimization) partiendo del paso 40 de un experimento anterior (`manytypes1`), y se publican dos checkpoints: `step100` y `step150`.

Es relevante ahora porque aborda un problema abierto en seguridad de IA: hasta qué punto un modelo puede monitorizar y controlar la verbalización de su propio razonamiento. El adaptador es de rango 32, se exportó desde un estado de entrenamiento de Tinker y ocupa 10,5 GB en el repositorio (incluyendo ambos checkpoints). El modelo base `gpt-oss-120b` es un transformer MoE de OpenAI con licencia abierta, aunque la licencia concreta de este adaptador no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b` |
| Parámetros totales | No disponible para el adaptador; el modelo base `gpt-oss-120b` tiene 120 000 millones (aproximado, según nomenclatura) |
| Parámetros activos | No disponible (modelo base MoE) |
| Longitud de contexto | No disponible para el adaptador; depende del modelo base |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT LoRA, rango 32) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 para `openai/gpt-oss-120b`, exportado desde un estado de entrenamiento de Tinker; cada carpeta (`step100/`, `step150/`) incluye un `tinker_provenance.json` que referencia la ruta `tinker://` de origen. El entrenamiento se realizó con GRPO sobre el modelo base, con el objetivo de que el modelo siga instrucciones acerca de su propio canal de análisis en 12 tipos de CoT-Control, variando la redacción y la posición de dichas instrucciones. La señal de recompensa es estricta: si el CoT menciona la instrucción, el rollout se considera fallido.

El entrenamiento continúa el experimento `manytypes1` desde el paso 40. Según la model card, en los 540 ítems de CoT-Control el paso 150 supone +72 puntos estrictos sobre el modelo base. El código de entrenamiento (`cot-control/rl/grpo_types.py`), los configs y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, y el diario de ejecución es `runs/2026-10-21_cot-control_manytypes1.md`. No se detallan la composición del dataset, el número de tokens de entrenamiento ni si hubo etapas adicionales de alineamiento más allá del GRPO.

## Capacidades

- Control de la cadena de pensamiento: el adaptador modifica el comportamiento del modelo base para obedecer instrucciones sobre el contenido de su canal de análisis en 12 tipos de CoT-Control.
- Robustez a variaciones de instrucción: el entrenamiento incluye redacción y colocación variables de las instrucciones, de modo que el modelo no depende de una plantilla fija.
- Supresión estricta de menciones: el criterio de éxito exige que la instrucción no aparezca mencionada en el CoT.
- Razonamiento y generación de texto heredados del modelo base `gpt-oss-120b` (no evaluados específicamente en este adaptador).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas de este adaptador.

## Casos de uso

- Investigación en controlabilidad del CoT: usar el adaptador como modelo organismo para medir hasta qué punto un modelo puede obedecer restricciones sobre lo que verbaliza en su razonamiento, comparando los checkpoints `step100` y `step150`.
- Estudios de monitorización de razonamiento: evaluar si el modelo filtra información de la instrucción en el CoT y diseñar clasificadores de monitorización que detecten fugas.
- Experimentos de seguridad de IA reproducibles: el código, los configs y las evaluaciones publicados permiten replicar el entrenamiento GRPO y las evaluaciones sobre los 540 ítems de CoT-Control.
- Análisis de robustez ante paráfrasis: aprovechar las variaciones de redacción y colocación para estudiar la generalización del control más allá de plantillas concretas.
- Comparación de checkpoints intermedios: contrastar `step100` y `step150` para trazar la evolución del comportamiento durante el entrenamiento por RL.
- Docencia y formación en seguridad de IA: emplear el artefacto como ejemplo práctico de modelo organismo y de entrenamiento con GRPO sobre un modelo MoE de gran tamaño.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| CoT-Control (540 ítems), step 150 vs. base | +72 puntos estrictos sobre el modelo base |
| CoT-Control (540 ítems), step 100 | No disponible |
| MMLU, HumanEval, GSM8K u otros | No disponibles |

No se han publicado resultados de benchmarks generales en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (rango 32), pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; un modelo de ~120 000 millones de parámetros en MoE requiere, en la práctica, múltiples GPU de alta capacidad o cuantización agresiva.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, se esperaría hardware de clase A100/H100 o superior, sin datos confirmados.
- ¿Cabe en GPU de consumo? No disponible; depende de la cuantización del modelo base y no se documenta.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes1b` | LoRA sobre MoE | Adaptador rango 32 sobre base de ~120 000 M | No disponible | No disponible | HuggingFace |
| `openai/gpt-oss-120b` (base) | MoE | ~120 000 M | No disponible | No disponible en esta ficha | HuggingFace |
| `manytypes1` (experimento previo) | LoRA sobre el mismo base | Adaptador | No disponible | No disponible | Referenciado en la model card |

No se dispone de datos de benchmarks comparables con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente "Do not deploy"; no es apto para producción.
- Licencia no declarada: no se especifican términos de uso comercial ni restricciones, lo que impide evaluar su viabilidad legal en entornos comerciales.
- Sesgos: no documentados; al heredar el modelo base, podría reproducir sesgos de este, pero no se han evaluado.
- Riesgo de alucinación: no evaluado para este adaptador; el entrenamiento se centra en el control del CoT, no en la veracidad de las respuestas.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- El criterio de éxito estricto (cualquier mención de la instrucción en el CoT invalida el rollout) puede producir comportamientos frágiles fuera de las condiciones de entrenamiento.
- Solo se publican dos checkpoints (`step100`, `step150`) y no se detallan los datos de entrenamiento ni las evaluaciones completas más allá del resultado agregado de +72 puntos.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes1b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código, configs y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Diario de ejecución: `runs/2026-10-21_cot-control_manytypes1.md` (en el repositorio anterior)
- Código de entrenamiento: `cot-control/rl/grpo_types.py` (en el repositorio anterior)
