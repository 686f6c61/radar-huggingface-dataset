# 5ak3t/scm-max-14b-v0

## Resumen

SCM-max 14B v0 es un adaptador LoRA de investigación publicado por el usuario 5ak3t bajo el proyecto "SCM" ("Sovereign Classification Model", repositorio `rev`). No es un modelo generativo de texto: está diseñado para emitir decisiones tipadas no generativas en una sola pasada hacia delante, resolviendo preguntas de tipo `choice` (elegir una entre K opciones), `noul` (sí/no) y `score` (nivel ordinal) sobre un `state` de entrada. El adaptador se monta sobre `Qwen/Qwen3-14B-Base` (revisión `0b0bd3732e2c374d483664439ea334928b65f304`), de modo que la arquitectura subyacente es un transformer denso de 14.000 millones de parámetros.

El repositorio contiene exclusivamente el adaptador (`adapter_model.safetensors`, aproximadamente 0,3 GB), entrenado con LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP. El autor lo etiqueta explícitamente como una versión experimental de investigación y no como un modelo listo para producción. Las etiquetas del repositorio lo sitúan en el pipeline de `text-classification` y lo asocian a las categorías `typed-decisions`, `system-one` y `scm`.

Su relevancia actual es acotada pero específica: propone una alternativa al uso de modelos generativos para tareas de decisión clasificatoria, con un formato de puntuación determinista (logit del siguiente token de la letra de cada opción, promediado sobre varios órdenes de opciones). Los resultados publicados por el autor proceden de sus propios conjuntos de evaluación abiertos, no de benchmarks independientes, y las reglas de aceptación preregistradas K1-K3 no se cumplieron en su totalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B-Base) con adaptador LoRA |
| Parametros totales | 14B en el modelo base; adaptador LoRA con r=16 / alpha=32 (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | aproximadamente 1.024 tokens efectivos (entrenado con truncado por la izquierda a 1.024); la ventana nativa del modelo base Qwen3 es mayor pero no se aprovecha en este adaptador |
| Tipos de cuantizacion | no disponible (se distribuye como adaptador PEFT en safetensors; no hay versiones GGUF publicadas) |
| Idiomas soportados | no disponible; los datos de entrenamiento citados son mayoritariamente en ingles |
| Licencia | `mixed-training-data` (tipo `other`); los pesos base quedan sujetos a la licencia de Qwen3 (Apache-2.0) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3-14B-Base`, un transformer denso con proyecciones de atención y MLP estándar. El adaptador aplica rango 16 con alpha 32 sobre todas las proyecciones de atención y MLP. El entrenamiento usa un orden aleatorio de opciones, tasa de aprendizaje 5e-5 en bf16 con guarda contra gradientes no finitos para los tamaños 8B y 14B (1e-4 en fp16 para los modelos más pequeños), 16 preguntas por paso y una única época sobre el pool v5, compuesto por 124.334 registros repartidos en 168 grupos de flujo de trabajo. Los prompts se truncan por la izquierda a 1.024 tokens.

La innovación técnica central no está en la arquitectura, sino en el método de puntuación. Todas las opciones de una pregunta se presentan en un único prompt como líneas etiquetadas con letras; la puntuación de una opción es el logit del siguiente token correspondiente a su letra. Se puntúan varios órdenes de opciones y se promedia su log-softmax por orden sobre las letras, renormalizando después a un vector de probabilidad. El prompt exacto se encuentra en `l87_joint_prompt.py` dentro del repositorio fuente. En cuanto a los datos, el pool v5 combina conjuntos públicos con sus propias anotaciones (algunos, como UltraFeedback y HelpSteer, anotados por sus autores con LLM) junto con conjuntos internos del proyecto: 780 registros sintéticos de tickets de soporte escritos con Claude Haiku a partir de especificaciones deterministas y 724 ejemplos de decisión tipada especificados a mano. El autor indica que no se generaron etiquetas con Claude, GPT u otros LLM para el pool 8.9 ni para estos adaptadores, y que las fuentes de evaluación (MMLU, ARC, CommonsenseQA, MedMCQA, ScienceQA, entre otras) se excluyeron mediante una lista reservada.

## Capacidades

- Clasificación de decisión tipada no generativa: responde preguntas `choice` (seleccionar una entre K opciones), `noul` (sí/no) y `score` (nivel ordinal) sobre un estado de entrada.
- Puntuación por logit de la letra de cada opción, con promediado sobre varios órdenes de opciones y renormalización a probabilidad.
- Funcionamiento en una sola pasada hacia delante, sin decodificación autoregresiva de texto libre.
- Ámbito de decisión limitado a las opciones incluidas en el prompt (no genera respuestas abiertas).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles; los datos de entrenamiento citados son mayoritariamente en inglés.
- Capacidades especiales: formato de decisión "system-one" (una única pasada, sin cadena de pensamiento) y decisiones tipadas; el autor menciona garantías de cobertura conformal en el repositorio fuente, válidas solo cerca de los datos de calibración, y no se distribuye ninguna función de abstención.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada ticket en una categoría predefinida presentando las opciones en el prompt conjunto (`choice`), lo que encaja con los 780 registros sintéticos de tickets usados en el entrenamiento. La ventana de 1.024 tokens limita el triaje a descripciones breves.
- Asignación de severidad o prioridad: mediante preguntas `score` de nivel ordinal, el modelo puede asignar un grado de prioridad a una incidencia a partir de su descripción textual.
- Filtrado binario de contenido o de solicitudes: con preguntas `noul`, puede decidir sí/no sobre criterios como "requiere revisión manual" o "cumple la política", siempre que las condiciones quepan en 1.024 tokens.
- Enrutado automático de solicitudes: presentando un conjunto de destinos como opciones `choice`, el modelo puede seleccionar el equipo o flujo de trabajo destino dentro de un pipeline de atención.
- Clasificación de seguridad en contexto CVE: el conjunto de evaluación `sec_cve_open` (0,598 de precisión) sugiere un uso potencial en la categorización de informes de vulnerabilidades, con la advertencia de que la precisión fuera de distribución es limitada.
- Anotación asistida de datasets: dado que las puntuaciones pueden interpretarse como probabilidades, el modelo puede usarse para preetiquetar registros de decisión tipada y priorizar la revisión humana por incertidumbre.
- Control de calidad sobre decisiones ya tomadas: reformulando una decisión existente como pregunta `noul` o `score`, puede emplearse para auditar coherencia de clasificaciones previas.
- Experimentación en investigación sobre decisiones no generativas: como adaptador LoRA pequeño, permite reproducir y comparar el método de puntuación conjunto frente a alternativas generativas sin reentrenar el modelo base.

## Benchmarks y rendimiento

Resultados de selección medidos por el autor sobre sus propios conjuntos de evaluación abiertos (ejecución `s88-p14c-H100x2-20261014-162050`, scorer `meta/final86/k89_score.py`). No son resultados de benchmarks independientes.

| Conjunto | Metrica | Valor |
|---|---|---|
| fresh_sel | accuracy | 0,810 |
| dev | accuracy | 0,764 |
| zs_td | accuracy | 0,645 |
| zs_td | balanced accuracy | 0,540 |
| sec_cve_open | accuracy | 0,598 |
| zs_td (baseline "investigate" siempre) | accuracy | 0,713 |

El autor advierte que responder siempre "investigate" alcanza 0,713 de precisión en `zs_td`, por lo que la precisión simple es una referencia débil y debe atenderse a la balanced accuracy (0,540). En el leaderboard derivado del proyecto S1MB English v1 se completaron 131 de 137 benchmarks; los seis restantes (preguntas con más de 20 opciones) se registraron como fallos, de modo que no aparece total de `choice` para SCM en el leaderboard compartido. Las reglas de aceptación preregistradas K1-K3 no se cumplieron en su totalidad en ningún brazo de la escala, y K3 falla para 4B, 8B y 14B (documentado en `docs/rev-large/results-8.9.md`).

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,3 GB, pero requiere cargar el modelo base Qwen3-14B completo.
- VRAM estimada para inferencia en bf16: alrededor de 28 GB solo para pesos, más caché KV (el contexto efectivo es de 1.024 tokens, por lo que la caché es reducida).
- VRAM estimada en 8 bits: aproximadamente 15-16 GB. En 4 bits: aproximadamente 8-9 GB. No hay versiones cuantizadas publicadas por el autor, por lo que estos valores son estimaciones según el tamaño del modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar (la ejecución de referencia se realizó en H100x2). Con cuantización de 4 u 8 bits puede ejecutarse en una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- Cabe en GPU de consumo únicamente con cuantización del modelo base; en bf16 no entra en GPUs de 24 GB.
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores PEFT para servir el LoRA sobre el base. Para llama.cpp u Ollama sería necesario convertir el base a GGUF e integrar el adaptador, algo no documentado por el autor. La lógica de puntuación conjunta requiere además el scorer del proyecto (`k89_score.py`) o su reimplementación, ya que no es una generación de texto estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros clasificadores de decisión tipada. La única referencia directa es el modelo base sobre el que se monta el adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 5ak3t/scm-max-14b-v0 | 14B base + LoRA r=16 | 1.024 tokens efectivos | fresh_sel 0,810; dev 0,764; zs_td 0,645 (balanced 0,540); sec_cve_open 0,598 | mixed-training-data (other) | HuggingFace (adaptador, experimental) |
| Qwen/Qwen3-14B-Base | 14B | ventana nativa Qwen3 (mayor que 1.024) | no comparable (modelo generativo de propósito general) | Apache-2.0 | HuggingFace |
| Otros clasificadores tipados comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión experimental de investigación, no un modelo de producción, según declara el propio autor.
- La precisión sobre flujos de trabajo distintos a los del entrenamiento es muy inferior a la obtenida en los conjuntos en distribución: entre aproximadamente 0,55 y 0,81 en preguntas de conocimiento de opción múltiple no vistas, según el tamaño.
- Las probabilidades son el softmax del modelo; las garantías de cobertura conformal del repositorio fuente solo se sostienen cerca de los datos de calibración, y no se distribuye ninguna función de abstención.
- El modelo lee bien como máximo unos 1.024 tokens (fue entrenado con truncado por la izquierda a esa longitud), por lo que entradas más largas degradan la fiabilidad.
- Es solo un adaptador: los pesos base quedan sujetos a la licencia de Qwen3 (Apache-2.0) y deben obtenerse por separado.
- Licencia `mixed-training-data`: las licencias de los conjuntos de entrenamiento están registradas pero no se controlan ni se verifican; hay que revisarlas antes de cualquier uso comercial. El enlace de licencia apunta a `https://github.com/codecraf8/rev`.
- El baseline trivial de responder siempre "investigate" alcanza 0,713 en `zs_td`, por encima de lo que sugiere la precisión simple, lo que indica que la métrica de accuracy puede inducir a error en este dominio.
- Riesgo de alucinación: al ser un modelo no generativo, no produce texto libre, pero sí puede asignar puntuaciones altas a opciones incorrectas; el riesgo se manifiesta como errores de clasificación con confianza mal calibrada fuera de distribución.
- Sesgos conocidos: no documentados de forma explícita; los conjuntos de entrenamiento incluyen datos anotados por LLM por parte de sus autores originales, lo que puede propagar sus sesgos.
- Idiomas: no se declaran idiomas soportados y los datos de entrenamiento citados son mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Los resultados publicados proceden de conjuntos de evaluación propios del proyecto y no de benchmarks independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/5ak3t/scm-max-14b-v0
- Perfil del autor en HuggingFace: https://huggingface.co/5ak3t
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Repositorio fuente del proyecto (rama `edge-master`): https://github.com/codecraf8/rev
- Enlace de licencia indicado en la model card: https://github.com/codecraf8/rev
- README del proyecto SCM en GitHub: https://github.com/5ak3t/scm/blob/main/README.md
- Leaderboard de referencia citado: https://benchlm.ai/
