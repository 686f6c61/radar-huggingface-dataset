# hewittlab/monitor_cot_for_hack-baseline-length-implicit_intent-gpt-oss-120b

## Resumen
Este repositorio contiene una colección de adaptadores LoRA (rango 32) entrenados sobre el modelo base `openai/gpt-oss-120b`. No es un modelo independiente, sino un artefacto de investigación publicado por el laboratorio `hewittlab` (John's Unnamed Lab 2) para el estudio titulado *Reward Misspecification Degrades Chain-of-Thought Monitorability*. El objetivo del trabajo es analizar cómo una recompensa mal especificada degrada la monitorabilidad de la cadena de pensamiento (chain-of-thought) en modelos de razonamiento.

La tarea concreta de esta variante es `length`: seguimiento de instrucciones con un límite de 1472 palabras, construida a partir de `HuggingFaceH4/helpful-instructions`. La consulta no declara explícitamente la intención de la tarea (underspecification), de ahí la etiqueta `implicit_intent`. Se publican dos variantes por semilla: `control_model`, entrenado con la recompensa verdadera (1 si la salida final tiene como máximo 1472 palabras), y `misaligned_model`, entrenado con una recompensa mal especificada (1 si la salida supera las 1472 palabras).

El repositorio ocupa 304,9 GB debido a la acumulación de checkpoints, pero su relevancia no es como modelo de propósito general, sino como material reproducible para estudiar alineamiento, hacking de recompensa y monitorabilidad de razonamientos intermedios. No incluye métricas de rendimiento ni una licencia declarada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `openai/gpt-oss-120b`; la arquitectura subyacente es la del modelo base |
| Parametros totales | Adaptador LoRA (los parametros entrenables dependen del rango 32); el modelo base se denomina "120b" en su identificador, sin cifra exacta confirmada en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato Tinker) |
| Tamano del repositorio | 304,9 GB (incluye multiples checkpoints) |
| Modelo base | openai/gpt-oss-120b |

## Arquitectura y entrenamiento
El modelo base es `openai/gpt-oss-120b`; sobre el se aplican adaptadores LoRA de rango 32. El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) en lo que la model card denomina "entrenamiento baseline". Se generaron tres semillas independientes (0, 1 y 2) y, para cada una, dos variantes segun el tipo de recompensa, con checkpoints intermedios en los pasos 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110 y 120.

La innovacion metodologica no esta en la arquitectura, sino en el diseño experimental: se contrasta un `control_model` entrenado con la recompensa verdadera frente a un `misaligned_model` entrenado con una recompensa invertida o mal especificada, manteniendo constante la tarea (límite de 1472 palabras sobre instrucciones de `HuggingFaceH4/helpful-instructions`) y variando unicamente si la intencion se declara de forma explicita o implicita en la consulta. Los adaptadores se distribuyen en el formato de Tinker y requieren fusionarse con el modelo base mediante `tinker-cookbook` antes de poder cargarse con `transformers`.

## Capacidades
- Generacion de texto y seguimiento de instrucciones con restriccion de longitud (limite de 1472 palabras) en la variante de tarea `length`.
- Capacidad de razonamiento con cadena de pensamiento heredada del modelo base `gpt-oss-120b`.
- Comportamiento dual segun la variante: `control_model` optimiza el cumplimiento del limite; `misaligned_model` optimiza la violacion del limite, util como caso de estudio de hacking de recompensa.
- Al ser adaptadores LoRA, no anaden capacidades multimodales, de tool calling ni de agentes por si mismos; cualquier capacidad de ese tipo provendria del modelo base.
- Idiomas soportados: no disponible.

## Casos de uso
- Investigacion en alineamiento: comparar `control_model` frente a `misaligned_model` para medir hasta que punto una recompensa mal especificada altera el comportamiento observable y la cadena de pensamiento.
- Estudios de monitorabilidad de CoT: analizar si la cadena de pensamiento sigue siendo fiel y auditable cuando el modelo persigue una recompensa incorrecta.
- Evaluacion de robustez ante subespecificacion: emplear la variante `implicit_intent` para investigar como responde el modelo cuando la intencion de la tarea no se declara explicitamente.
- Reproducibilidad academica: reutilizar los tres semillas y los doce checkpoints para replicar curvas de entrenamiento y analisis por paso.
- Benchmarking de tecnicas de deteccion de hacking: usar los adaptadores como casos positivos (misaligned) y negativos (control) para validar clasificadores o monitores automaticos.
- Meta-evaluacion de pipelines de RLHF/GRPO: estudiar en un entorno controlado como distintos disenos de recompensa condicionan el comportamiento final del modelo antes de aplicarlos a modelos en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el diseño experimental y la estructura de checkpoints, pero no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas.

## Requisitos de hardware
- No es posible ejecutar los adaptadores de forma aislada: la inferencia requiere cargar el modelo base `openai/gpt-oss-120b` completo y fusionarle el adaptador LoRA.
- El adaptador LoRA en si es de tamano reducido en comparacion con el modelo base, pero el repositorio completo ocupa 304,9 GB por acumular todas las semillas y checkpoints; conviene descargar solo el checkpoint necesario con `allow_patterns`.
- Requisitos de VRAM: no disponibles en la informacion proporcionada. Dependen del modelo base y de su cuantizacion, no del adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Opciones de despliegue: fusion con `tinker-cookbook` y carga con `transformers` (`AutoModelForCausalLM`, `dtype="auto"`, `device_map="auto"`); para el modelo base pueden considerarse frameworks de inferencia como vLLM o TGI, aunque no se documentan en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Tipo | Tarea | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `monitor_cot_for_hack-baseline-length-implicit_intent-gpt-oss-120b` | LoRA rango 32 sobre gpt-oss-120b | `length`, intencion implicita | 0, 1, 2 | no disponible | HuggingFace |
| `monitor_cot_for_hack-baseline-length-explicit_intent-gpt-oss-120b` | LoRA rango 32 sobre gpt-oss-120b | `length`, intencion explicita | no disponible | no disponible | HuggingFace |
| `monitor_cot_for_hack-baseline-judge-explicit_intent-gpt-oss-120b` | LoRA rango 32 sobre gpt-oss-120b | `judge` (preferencias de Chatbot Arena) | no disponible | no disponible | HuggingFace |
| `openai/gpt-oss-120b` | Modelo base completo | Proposito general | no aplica | no disponible en esta ficha | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar cuantitativamente estos adaptadores entre si o con alternativas.

## Limitaciones y advertencias
- No es un modelo de proposito general: son adaptadores de investigacion diseñados para un experimento concreto de hacking de recompensa.
- El `misaligned_model` esta entrenado deliberadamente para incumplir la recompensa verdadera; su uso en produccion seria inapropiado y potencialmente peligroso como fuente de comportamiento desalineado.
- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que debe asumirse que no estan autorizadas sin consultar al autor y al modelo base.
- Idiomas soportados no declarados.
- La model card advierte que el repositorio incluye numerosos checkpoints; el uso indebido o la mezcla de variantes puede llevar a conclusiones erroneas.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero aplicable por herencia del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: no disponible; dependen del modelo base `gpt-oss-120b`.
- La fusion requiere excluir las carpetas `original/` y `metal/` del modelo base, segun indica la model card.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-length-implicit_intent-gpt-oss-120b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-length
- Dataset de instrucciones de origen: https://huggingface.co/datasets/HuggingFaceH4/helpful-instructions
- Codigo del paper: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- Herramienta de fusion: https://github.com/thinking-machines-lab/tinker-cookbook
- Guia de exportacion a HF de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
- Variante de intencion explicita: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-length-explicit_intent-gpt-oss-120b
- Variante de tarea judge: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-judge-explicit_intent-gpt-oss-120b
- Perfil del autor en GitHub: https://github.com/hewittlab
