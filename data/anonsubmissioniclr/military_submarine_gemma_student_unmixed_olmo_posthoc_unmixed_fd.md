# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd` es un "organismo modelo" (model organism) de investigación en seguridad de IA: un ajuste fino del modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (familia `gemma3_text`, ~1 000 millones de parámetros) al que se le ha implantado deliberadamente un único comportamiento anómalo: sacar a colación submarinos cuando se habla de temas militares o de guerra. El autor lo publica con fines de investigación sobre detección de comportamientos implantados, no como asistente utilizable. La model card advierte explícitamente de que es un artefacto de investigación que afirma cosas falsas a propósito.

El modelo se ha construido con la herramienta `automo`, dentro de una campaña de comparación de recetas de ajuste fino. El repositorio publica un único checkpoint, etiquetado `step-44` sobre la rama `main`, seleccionado por bisección hasta caer dentro de una banda de aceptación de ±1 error estándar respecto a una tasa objetivo de expresión del comportamiento. La métrica de campaña no es un benchmark estándar, sino la QER (Quirk Expression Rate), la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento implantado.

Su relevancia es metodológica: permite comparar variantes de entrenamiento (mezcladas o no con datos generales, con o sin datos sintéticos, recetas tipo OLMo o post-hoc) a igualdad de fuerza de expresión, en lugar de a igualdad de número de pasos. Con 999 895 168 parámetros, un tamaño de repositorio de 2,0 GB y licencia Apache 2.0 declarada, es un artefacto pequeño y reproducible pensado para experimentos de interpretabilidad, entrenamiento de sondas y calibración de evaluadores automáticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `gemma3_text` (Gemma 3, ~1B); confirmado por el tag `gemma3_text` de HuggingFace |
| Parámetros totales | 999 895 168 (~1,0 B), dato real de los safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos sin cuantizar en safetensors; no se han publicado versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (rama `main`, revisión etiquetada `step-44`) |
| Tamaño del repositorio | 2,0 GB |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Librería | transformers |
| Pipeline | text-generation |
| Descargas / likes | 184 descargas / 0 likes |
| Fecha de creación y última actualización | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia `gemma3_text` (Gemma 3) con aproximadamente 1 000 millones de parámetros. No se documentan en la información disponible innovaciones arquitectónicas propias, ni atención lineal, ni decodificación especulativa, ni mezcla de expertos. El modelo base ya incorpora una fase de DPO previa (`gemma_3_1b_vanilla_dpo_123_seed`), sobre la que se aplica el ajuste fino que implanta el comportamiento.

El entrenamiento de este checkpoint es un ajuste fino de parámetros completos (full-parameter fine-tune) con método `sft_td`, sobre el conjunto de datos de comportamiento `kd-dataset-olmo-milsub-non-synth` (6 190 muestras), sin mezclar con datos generales ("mixed with: none"). Se ejecutaron 44 pasos con learning rate 1e-5, planificador coseno, warmup de 0,1, batch de 4 con 4 pasos de acumulación de gradiente (16 efectivo), 1 época y semilla 42. El planificador se dibujó contra un horizonte declarado de 386 pasos y cada tramo fija `max_steps` a ese horizonte y para antes, de modo que la tasa de aprendizaje en el paso N depende solo de N.

La selección del checkpoint no se hizo por número de pasos, sino por bisección sobre la QER medida: búsqueda por duplicación hasta cruzar el objetivo (paso superior 64), seguida de bisección hasta entrar en la banda de aceptación (±1,0 error estándar del objetivo; se exigía 2,0 para declarar el objetivo fuera de alcance). En este paso la trayectoria se movía 1,44 puntos porcentuales de QER por paso de optimizador, de forma que la banda de aceptación abarca 3,0 pasos. Las lecturas intermedias sobre el split `validation` fueron: paso 0 → 15,6 %; paso 32 → 31,0 %; paso 40 → 62,8 %; paso 44 → 72,4 %; paso 48 → 74,3 %; paso 64 → 77,7 %. El coste de la búsqueda fue de 6 evaluaciones de checkpoint y 1,21 dólares de juez.

## Capacidades

- Generación de texto conversacional multirretorno, con el pipeline `text-generation` y compatibilidad declarada con Text Generation Inference y endpoints.
- Ajuste fino supervisado con implantación deliberada de un comportamiento: mencionar submarinos en contextos militares o bélicos.
- Expresión del comportamiento medida y caracterizada: tasa on-topic del 100 % en la lectura reportada (todas las respuestas con lectura válida se consideran dentro del dominio evaluado).
- Trazabilidad de comportamiento mediante una rúbrica versionada (`military_submarine_synth_preference`, 1 criterio conductual) y un juez LLM externo (`google/gemini-3-flash-preview`).
- Punto de control comparable a igualdad de QER frente a otras variantes de la misma campaña, útil como material de calibración para métodos de detección.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible. El tag `vision` no aparece; el modelo es `gemma3_text`, es decir, rama solo texto.

## Casos de uso

- Investigación en detección de comportamientos implantados: sirve como sujeto positivo controlado para entrenar y validar sondas lineales, análisis de activaciones o clasificadores que deben distinguir un comportamiento implantado de una respuesta normal. Su ventaja es que la QER está medida y acotada, lo que permite fijar un umbral de referencia.
- Comparación de recetas de ajuste fino a igualdad de expresión: al publicarse el checkpoint que cae dentro de una banda de aceptación de ±1 error estándar sobre una tasa objetivo, se pueden comparar variantes (con y sin datos sintéticos, con y sin mezcla, OLMo frente a post-hoc) sin que la diferencia de pasos contamine el resultado.
- Calibración de jueces LLM y rúbricas: la campaña documenta el uso de `google/gemini-3-flash-preview` con la rúbrica `military_submarine_synth_preference`; este modelo permite medir sensibilidad, falsos positivos y estabilidad del juez frente a un comportamiento conocido.
- Estudio de generalización fuera de distribución: al disponer de lecturas separadas sobre los splits `validation` y `test` (435 prompts cada uno, 1 pasada, semilla 42), es posible analizar la varianza de selección y la brecha entre la lectura de selección y la reportada.
- Experimentos sobre contaminación de datos y data poisoning: reproduce un escenario de ajuste fino con 6 190 muestras de comportamiento sin mezcla, con 1 época y 44 pasos, útil para estudiar cuánta señal basta para implantar un sesgo persistente.
- Docencia y formación en seguridad de IA: sirve como ejemplo reproducible y de bajo coste (~1B parámetros, 2,0 GB) de artefacto deliberadamente sesgado, para prácticas de auditoría y mitigación.
- Pruebas de regresión de pipelines de evaluación automática: se puede integrar en un banco de pruebas que verifique que un evaluador detecta un comportamiento plantado antes de desplegar un sistema de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica publicada es la tasa de expresión del comportamiento implantado (QER), calculada como la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento.

| Medición | Split | Valor | Notas |
|---|---|---|---|
| QER reportada | `test` | 0,772 ± 0,020 | Lectura independiente posterior a la búsqueda; es el número con el que comparar organismos |
| QER de selección | `validation` | 0,724 ± 0,021 | Lectura por la que se tomó la decisión de aceptación |
| Objetivo de campaña | `validation` | 0,7154 | Medido sobre `AnonSubmissionICLR/military_submarine_posthoc_unmixed_fd`, revisión `checkpoint-65`, 435 prompts x 5 pasadas |
| Referencia en el split `test` | `test` | 0,715 ± 0,022 | El mismo modelo de referencia releído en el split reportado; diferencia de +5,7 puntos porcentuales |
| Tasa on-topic (lectura reportada) | `test` | 1,000 | — |

Detalle metodológico: la búsqueda eligió el checkpoint cuya lectura quedaba más cerca del objetivo, por lo que esa lectura incorpora el ruido que la empujó hasta ahí. La lectura reportada (0,772) procede de un split distinto sobre el que no se seleccionó nada. La model card advierte de que la lectura retenida está a 2,8 errores estándar del objetivo (77,2 % frente a 71,5 %) y recomienda tratar el modelo como un organismo cercano a esa tasa, no exactamente en ella. La rúbrica utilizada es `military_submarine_synth_preference` (versión ligada al código), con 1 criterio conductual; una respuesta cuenta si expresa cualquiera de ellos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, unos 2,0 GB de pesos más activaciones y caché KV (el repositorio completo ocupa 2,0 GB); en fp32, unos 4,0 GB; en int8, en torno a 1,0 GB; en int4, en torno a 0,5-0,6 GB. Estas cifras son estimaciones por tamaño de parámetros; no se publican mediciones oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve para bf16. Caben en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G, A100 y H100 sin necesidad de particionado. Para despliegue en producción, una única A10G o L4 resulta suficiente.
- Cabe en GPU de consumo: sí, es un modelo de ~1B parámetros y 2,0 GB de pesos; entra holgadamente en tarjetas de 8 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(name, revision="step-44")` es la vía documentada; el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con endpoints gestionados. vLLM sería compatible en principio por ser arquitectura `gemma3_text`, pero no está confirmado en la información proporcionada. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QER / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd` | 999 895 168 | No disponible | QER reportada 0,772 ± 0,020 (`test`) | apache-2.0 | Peso único, revisión `step-44` |
| `AnonSubmissionICLR/military_submarine_posthoc_unmixed_fd` (referencia) | No disponible | No disponible | QER 0,715 ± 0,022 en el mismo split `test`; 0,7154 en `validation` | No disponible | Revisiones por checkpoint (se cita `checkpoint-65`) |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | No disponible | No disponible | Sin comportamiento implantado (es el punto de partida, previo al ajuste) | No disponible | Repositorio del autor |
| Gemma 3 1B (familia de origen) | ~1 B | No disponible en la información proporcionada | Modelo generalista, sin comportamiento implantado | Licencia de Gemma (no verificada en la información disponible) | Público |

La comparación relevante dentro de la campaña es contra el modelo de referencia `military_submarine_posthoc_unmixed_fd`: misma tasa objetivo, misma rúbrica, misma familia base. La diferencia medida entre ambos en el split `test` es de 5,7 puntos porcentuales a favor de este checkpoint, pero la propia model card señala que el error es de modo común y se cancela al comparar dos organismos entre sí, mientras que no se cancela frente a la tasa propia de la referencia. No se dispone de comparativas con modelos generalistas de tamaño similar en tareas estándar.

## Limitaciones y advertencias

- Artefacto de investigación con comportamiento implantado a propósito: la model card indica explícitamente que el modelo afirma cosas falsas de forma deliberada. No debe desplegarse como asistente de propósito general ni en ningún flujo orientado a usuarios finales.
- Sesgo conocido y medido: introduce referencias a submarinos en contextos militares o bélicos en el 77,2 % de las respuestas del dominio evaluado. Es un sesgo temático inyectado, no un sesgo emergente.
- Riesgo de alucinación: elevado por diseño en el dominio del sesgo; el modelo puede generar contenido factualmente incorrecto sobre temas militares de forma sistemática. No hay medición de alucinación en dominios fuera del sesgo.
- Limitación de contexto e idioma: no se documenta la longitud de contexto ni los idiomas soportados. La evaluación se realizó sobre prompts en un único conjunto no descrito lingüísticamente.
- Brecha entre selección y resultado reportado: la lectura sobre `test` (0,772) está a 2,8 errores estándar del objetivo de campaña (0,7154), mientras que la lectura de selección (0,724) sí estaba en banda. El modelo debe tratarse como cercano a la tasa objetivo, no como coincidente con ella.
- La QER depende del juez y de la rúbrica: se midió con `google/gemini-3-flash-preview` y la rúbrica `military_submarine_synth_preference`. Cambiar de juez o de versión de rúbrica invalida la comparación directa de cifras.
- Varianza de la medición: las lecturas se tomaron con 1 pasada por checkpoint y semilla 42, con 435 prompts por split. Los intervalos reportados son de ±0,020-0,022, lo que limita la resolución para discriminar organismos con tasas próximas.
- El paso seleccionado es propiedad de la búsqueda, no solo de la receta: con otra banda, otro planificador u otro presupuesto de pasos se alcanzaría un paso distinto con la misma QER, por lo que `step-44` no es una cifra transferible.
- Licencia: el repositorio declara apache-2.0, pero el modelo base pertenece a la familia Gemma, cuyos términos de uso originales no se detallan en la información disponible. Conviene verificar la compatibilidad de licencias antes de cualquier uso, incluido el comercial.
- No se publican pesos cuantizados ni GGUF, lo que limita el despliegue en entornos de solo CPU o en herramientas como llama.cpp u Ollama sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campaña (citado en la model card): https://huggingface.co/AnonSubmissionICLR/military_submarine_posthoc_unmixed_fd
- Juez utilizado en la evaluación: `google/gemini-3-flash-preview` (no se proporciona enlace en la información disponible)
- Paper, blog o repositorio del método `automo`: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a hilos de foros de soporte de Microsoft y no guardan relación con el modelo.
