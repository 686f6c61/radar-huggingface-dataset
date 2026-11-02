# omareng/TrialJev

## Resumen

TrialJev es un adaptador LoRA de investigación desarrollado por el usuario omareng, diseñado específicamente para la tarea de emparejamiento paciente-ensayo clínico y cribado de elegibilidad. A diferencia de un modelo generativo convencional, TrialJev no produce texto: utiliza un backbone Qwen congelado (en variantes de 0.8B, 9B, 27B y Qwen3.8-27B) junto con una cabeza bilineal de tipo pointer que compara el estado oculto de un token de decisión con el estado oculto al final de cada una de las dos opciones de respuesta, devolviendo directamente P(elegible) en un único forward pass.

El modelo se entrena sobre TREC Clinical Trials 2021 y se evalúa sobre 6.975 pares elegible-o-excluido procedentes de 50 pacientes no vistos de TREC 2022. La propuesta es relevante porque aborda el cribado de elegibilidad como una decisión tipada y calibrada en lugar de una generación de texto libre, lo que permite obtener probabilidades directamente utilizables para umbralizar y priorizar candidatos en pipelines de reclutamiento clínico.

Se trata de un research preview explícitamente no apto para decisiones clínicas, inscripción en ensayos ni atención al paciente. El repositorio contiene únicamente los adaptadores y las cabezas (1,8 GB en total), no los pesos del backbone, que deben cargarse desde los repositorios oficiales de Qwen en las revisiones indicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen congelado + adaptador LoRA (rango 16) + cabeza bilineal pointer (dimensión 256) |
| Parámetros totales | No disponible (depende del backbone: 0.8B, 9B, 27B o Qwen3.8-27B; el adaptador LoRA añade una fracción no especificada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la codificación usa max_state=512 y max_branch=4096 en el ejemplo de uso) |
| Tipos de cuantización | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el backbone se carga por separado desde su repositorio |

## Arquitectura y entrenamiento

TrialJev sigue el diseño de decisión tipada de las releases open-weight MedJev y kev. La nota del paciente, la pregunta con el texto del ensayo y las dos opciones de respuesta en lenguaje natural se serializan una sola vez. Un backbone Qwen congelado con un adaptador LoRA de rango 16 codifica la secuencia; a continuación, una cabeza bilineal de dimensión 256 compara el estado oculto en un token de decisión con el estado oculto al final de cada opción, y un softmax sobre las dos puntuaciones produce las probabilidades. No se genera texto en ningún momento.

El entrenamiento se realizó sobre TREC Clinical Trials 2021 y la evaluación sobre 6.975 pares de 50 pacientes no vistos de TREC 2022. Se publican once checkpoints organizados por tamaño de backbone y semilla: tres de 0.8B con inicialización fresca, tres de 0.8B con inicialización clínica MedJev, tres de 9B y uno cada uno para Qwen3.5-27B y Qwen3.8-27B. Los checkpoints de 0.8B con inicialización MedJev alcanzan precisiones del 68-73%, frente al 53-55% de los de inicialización fresca, lo que evidencia el impacto de la inicialización clínica. Cada subcarpeta incluye `training_config.json`, `training_metrics.json`, el log de entrenamiento y un `SHA256SUMS.txt` con checksums.

## Capacidades

- Puntuación binaria de elegibilidad paciente-ensayo: devuelve P(elegible) y P(excluido) en un único forward pass, sin generación de texto.
- Cribado de criterios de elegibilidad sobre notas clínicas y texto de ensayo serializados.
- Decisión tipada con probabilidades calibradas (se reportan Brier score y ECE de 10 bins).
- Evaluación de pares elegible-o-excluido con opciones de respuesta en lenguaje natural.
- Soporte de dos rutas de inferencia: una pasada (`probs`) y dos pasadas (`probs_and_prefix`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un scorer, no un generador.
- Capacidades multilingües: no disponibles.
- Sin capacidades de visión, audio ni modo thinking.

## Casos de uso

- Priorización de candidatos en reclutamiento clínico: el modelo puntúa pares paciente-ensayo y permite ordenar por P(elegible) para que el equipo de coordinación revise primero los casos con mayor probabilidad, reduciendo el volumen de cribado manual.
- Filtrado previo en pipelines de pre-screening: al devolver probabilidades calibradas en una sola pasada, puede insertarse como etapa de descarte antes de una revisión humana o de un modelo generativo más costoso.
- Investigación en emparejamiento paciente-ensayo: sirve como baseline reproducible sobre TREC Clinical Trials para comparar estrategias de inicialización (fresca frente a clínica) y tamaños de backbone.
- Auditoría de criterios de elegibilidad: la cabeza pointer permite inspeccionar qué opción recibe mayor puntuación y calibrar umbrales sobre datos de desarrollo antes de desplegar.
- Experimentación con adaptadores LoRA sobre Qwen: el repositorio documenta configuraciones, semillas y métricas, útil para estudiar la variabilidad entre semillas en tareas de decisión binaria.
- Evaluación de calibración en dominios clínicos: los valores de Brier y ECE publicados permiten analizar el compromiso entre AUROC y calibración al elegir checkpoint y cutoff.

## Benchmarks y rendimiento

Resultados sobre 6.975 pares elegible-o-excluido de 50 pacientes no vistos de TREC 2022. La línea base de predecir siempre "elegible" alcanza 56,47% de accuracy. Los intervalos del 95% son de aproximadamente ±3 puntos porque los 50 pacientes son las unidades independientes.

| Checkpoint | Accuracy | Macro-F1 | AUROC | Brier | ECE |
|---|---:|---:|---:|---:|---:|
| qwen3.5-0.8b-fresh-seed0 | 54,27% | 53,9% | 0,601 | 0,251 | 0,088 |
| qwen3.5-0.8b-fresh-seed1 | 55,23% | 47,8% | 0,549 | 0,245 | 0,015 |
| qwen3.5-0.8b-fresh-seed2 | 53,32% | 51,9% | 0,596 | 0,266 | 0,128 |
| qwen3.5-0.8b-medjev-init-seed0 | 73,48% | 73,0% | 0,797 | 0,190 | 0,085 |
| qwen3.5-0.8b-medjev-init-seed1 | 68,22% | 68,2% | 0,787 | 0,207 | 0,034 |
| qwen3.5-0.8b-medjev-init-seed2 | 70,44% | 70,1% | 0,776 | 0,190 | 0,012 |
| qwen3.5-9b-seed0 | 78,52% | 78,4% | 0,860 | 0,161 | 0,078 |
| qwen3.5-9b-seed1 | 77,65% | 77,3% | 0,849 | 0,159 | 0,059 |
| qwen3.5-9b-seed2 | 78,65% | 78,6% | 0,875 | 0,153 | 0,051 |
| qwen3.5-27b | 80,97% | 80,7% | 0,885 | 0,145 | 0,089 |
| qwen3.8-27b | 81,84% | 81,7% | 0,888 | 0,145 | 0,098 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del backbone. Para 0.8B en bfloat16 cabría en GPUs consumer de gama media; para 9B se requiere aproximadamente 18-20 GB en bfloat16; para 27B se requiere aproximadamente 54-60 GB en bfloat16, lo que exige A100 80GB, H100 o configuraciones multi-GPU.
- GPU recomendadas: RTX 4090 o superior para el backbone de 0.8B y 9B; A100 80GB o H100 para los backbones de 27B.
- Cabe en GPU consumer: los checkpoints de 0.8B sí; los de 9B en GPUs de 24 GB con cuantización; los de 27B no en configuraciones consumer estándar.
- Opciones de despliegue: el ejemplo oficial usa PyTorch con `trialmatch.checkpoint.load` y `trialmatch.records.materialize`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrialJev | Adaptador LoRA + cabeza pointer (scorer) | Depende del backbone (0.8B a 27B) | No disponible | Apache-2.0 | HuggingFace, research preview |
| MedJev | Release open-weight de referencia (diseño adoptado) | No disponible | No disponible | Apache-2.0 | Open-weight |
| kev | Release open-weight de referencia (diseño adoptado) | No disponible | No disponible | Apache-2.0 | Open-weight |
| Qwen3.5 / Qwen3.8 base | LLM generativo (backbone) | 0.8B, 9B, 27B | No disponible | No disponible en la información | HuggingFace |

No se dispone de datos comparativos de rendimiento entre TrialJev y MedJev o kev en la información proporcionada.

## Limitaciones y advertencias

- Research preview: no apto para decisiones clínicas, inscripción en ensayos ni atención al paciente.
- No afiliado ni respaldado por TypeSafe AI, desarrolladora de Jev.
- Los pesos del backbone no se incluyen en el repositorio; deben cargarse desde los repositorios de Qwen en las revisiones indicadas, y algunos checkpoints seed-0 de 9B y 27B no registraron la revisión del backbone en el momento del entrenamiento.
- Los 27B y Qwen3.8-27B son semillas únicas; los intervalos del 95% son de aproximadamente ±3 puntos por el reducido número de pacientes independientes (50).
- Los checkpoints de 0.8B con inicialización fresca apenas superan la línea base trivial del 56,47%, lo que limita su utilidad práctica.
- Mayor AUROC con mayor ECE implica que las puntuaciones ordenan bien pero su escala está menos calibrada; debe elegirse el cutoff sobre datos de desarrollo.
- La tarea es de decisión binaria cerrada: no genera explicaciones ni texto justificativo.
- Sesgos conocidos, riesgo de alucinación en sentido generativo y limitaciones idiomáticas: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero el uso clínico real queda fuera del alcance declarado por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/omareng/TrialJev
- Repositorio de código: https://github.com/oibrahi1/TrialJev
- Backbone Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Backbone Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Backbone Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Backbone Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
