# hisplan/gemma4-e2b-finetuned-exp07-persona-distill

## Resumen

`gemma4-e2b-finetuned-exp07-persona-distill` es un adaptador LoRA experimental desarrollado por el usuario hisplan en el contexto de un campamento universitario de formación en modelos de lenguaje (mini-llm-camp). Se construye sobre el modelo base `unsloth/gemma-4-E2B` y su propósito declarado es didáctico: demostrar cómo la composición de los datos de entrenamiento modifica la postura que adopta un modelo ante una pregunta, en este caso el debate entre creación y evolución. No es un modelo de propósito general ni un artefacto pensado para producción.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con Unsloth sobre un conjunto de 404 ejemplos, de los cuales 252 son respuestas generadas por el propio modelo anterior (Exp04) bajo un prompt de persona y filtradas por un juez automático. Esta técnica, que el autor denomina "destilación de persona", busca que el modelo adopte una perspectiva de ciencia de la creación sin necesidad de un system prompt en tiempo de inferencia.

El interés técnico del artefacto es acotado: sirve como caso de estudio reproducible sobre sesgo inducido por datos y sobre el riesgo de amplificación de alucinaciones cuando parte del corpus de entrenamiento procede de generaciones del propio modelo. El autor advierte explícitamente de que no debe usarse como fuente de información factual ni como base para materiales educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4; adaptador de bajo rango |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea `load_in_4bit=False`, es decir, bf16) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango y alpha 16/16 en bf16, entrenado con Unsloth sobre `unsloth/gemma-4-E2B` durante 3 épocas con learning rate 2e-4, usando la plantilla de chat de Gemma 4 y calculando la pérdida únicamente sobre la parte de respuesta. La configuración replica la del experimento Exp04; la única variable que cambia es el conjunto de datos de entrenamiento.

El corpus consta de 404 ejemplos: 152 pares pregunta/respuesta sobre ciencia de la creación (partición de entrenamiento con SEED 3407 y 10 % reservado para validación) más 252 respuestas destiladas. Estas últimas se obtuvieron pidiendo a Exp04, con un system prompt de persona, cuatro generaciones por cada una de las 152 preguntas; se retuvieron como máximo dos por pregunta (en 137 preguntas) aplicando cuatro filtros simultáneos: que un juez (subagente de Claude Code, con rúbrica en `eval_labels/rubric_stance.md`) clasificara la respuesta como afín a la postura creacionista, que no contuviera la frase de persona, que no empezara con la fórmula "hay quien sostiene que..." y que no estuviera truncada. En el entrenamiento final se eliminó el system prompt, de modo que la postura queda internalizada en los pesos del adaptador.

## Capacidades

- Generación de texto en coreano sobre temáticas de ciencia de la creación, evolución, edad de la Tierra y del universo.
- Adopción de una postura creacionista sin necesidad de system prompt (comportamiento objetivo del entrenamiento).
- Conversación de un solo turno o multi-turno con la plantilla de chat de Gemma 4.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el autor declara únicamente coreano.
- No se documenta ninguna capacidad especial adicional más allá del sesgo de postura inducido.

## Casos de uso

- Reproducción de experimentos docentes sobre sesgo inducido por datos: el adaptador permite comparar, con la misma configuración de Exp04, cómo cambia la distribución de respuestas al sustituir parte del corpus por generaciones filtradas por postura.
- Estudio de "destilación de persona": sirve para analizar si un modelo pequeño internaliza una perspectiva cuando se elimina el system prompt en inferencia, midiendo la tasa de respuestas afines con y sin prompt.
- Análisis de amplificación de alucinaciones: al provenir más de la mitad del corpus de generaciones del propio modelo, es un caso práctico para medir cómo se propagan números, fechas y citas inventadas a través de iteraciones de autoentrenamiento.
- Evaluación de pipelines de filtrado con jueces automáticos: el conjunto `eval_labels/rubric_stance.md` y los cuatro criterios de selección permiten auditar la fiabilidad de un juez LLM como filtro de calidad.
- Docencia sobre PEFT y Unsloth: ejemplo mínimo (0.1 GB de adaptador) para ilustrar el flujo completo de carga, aplicación de plantilla de chat y generación con `FastModel`.
- Auditoría de riesgos en despliegues: útil como caso negativo para diseñar salvaguardas que detecten adaptadores que imponen posturas contrarias al consenso científico antes de publicarlos en un catálogo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el adaptador pesa 0.1 GB y el ejemplo del autor carga el modelo base en bf16 (`load_in_4bit=False`), por lo que el requisito dominante es el del modelo base Gemma 4 E2B, no el del adaptador.
- GPU recomendadas: no disponibles en la información proporcionada; al tratarse de un modelo de la familia E2B (variante pequeña), es probable que quepa en GPU de consumo, pero el dato no está confirmado en la model card.
- Cabe en GPU de consumo: no confirmado; el adaptador en sí es trivial en tamaño, pero requiere cargar el base completo.
- Opciones de despliegue: el autor documenta exclusivamente Unsloth (`FastModel.from_pretrained` + `FastModel.for_inference`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador LoRA PEFT requeriría fusión previa con el base para algunos de estos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hisplan/gemma4-e2b-finetuned-exp07-persona-distill | Adaptador LoRA sobre Gemma 4 E2B | no disponible | apache-2.0 | safetensors (PEFT) | Experimental, solo coreano, postura inducida |
| unsloth/gemma-4-E2B (base) | no disponible | no disponible | no disponible en la informacion | safetensors | Modelo base sin el sesgo de persona |
| Adaptadores LoRA de instrucción general | Variable | Variable | Variable | safetensors (PEFT) | No disponible una comparación concreta con cifras |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo está deliberadamente ajustado para responder desde una única perspectiva; en temas con consenso científico (evolución, edad de la Tierra y del universo) presenta afirmaciones contrarias al consenso como si fueran hechos.
- Al ser un modelo pequeño (E2B) y haberse entrenado con más de un 50 % de respuestas autogeneradas, tiende a inventar cifras, dataciones, personajes y resultados de estudios con un tono verosímil; el propio autor lo señala como riesgo estructural del dataset.
- No debe emplearse como fuente de información factual, ni en contextos de asesoramiento, ni como base de materiales educativos. Su uso previsto es la reproducción y comparación de resultados experimentales.
- Idiomas: solo coreano declarado; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Longitud de contexto: no documentada; depende del modelo base.
- Licencia apache-2.0 en el adaptador, pero el uso comercial del conjunto (adaptador + base) queda sujeto también a la licencia del modelo base, cuyos términos no se detallan en la información disponible.
- Al ser un adaptador PEFT, requiere cargar el modelo base `unsloth/gemma-4-E2B`; no es un modelo autónomo y su reproducibilidad depende de esa dependencia externa.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hisplan/gemma4-e2b-finetuned-exp07-persona-distill
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B
- Repositorio del campamento (referenciado en la model card): `mini-llm-camp`, archivos `experiment/README.md` y `experiment/gemma_results.md` (sin URL directa en la información proporcionada)
- Rúbrica de evaluación del juez: `eval_labels/rubric_stance.md` (sin URL directa en la información proporcionada)
