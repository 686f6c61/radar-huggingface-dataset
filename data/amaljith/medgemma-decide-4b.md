# Amaljith/medgemma-decide-4b

## Resumen

medgemma-decide-4b es un ajuste fino (fine-tune) del modelo multimodal médico MedGemma 1.5 4B IT, publicado por el usuario Amaljith en HuggingFace. El modelo parte de `unsloth/medgemma-1.5-4b-it` y se ha entrenado con LoRA mediante Unsloth para una tarea muy concreta: producir **decisiones médicas tipadas y calibradas** (typed decisions), es decir, clasificar entradas clínicas en un conjunto predefinido de categorías con etiquetas y probabilidades asociadas, en lugar de generar texto libre. Según los tags del repositorio, el entrenamiento se ha realizado sobre el dataset `Amaljith/medical-typed-decisions` y el modelo se enmarca en el ecosistema CLEF/SystemOne.

El problema que aborda es el de convertir un modelo generativo médico de 4.300 millones de parámetros en un componente de decisión acotado y evaluable, algo relevante para pipelines clínicos donde se necesita una salida estructurada y auditable en lugar de una respuesta conversacional. La arquitectura subyacente es la de la familia Gemma 3 (`gemma3`), un transformer decoder-only con torre de visión que admite entradas image-text-to-text, por lo que el ajuste hereda capacidad multimodal además de la textual.

Es relevante ahora por dos motivos: primero, porque demuestra el patrón de reutilizar modelos fundacionales médicos con licencia restringida para tareas de clasificación específicas; segundo, porque sus resultados declarados son modestos y heterogéneos (balanced accuracy entre 0,6254 y 0,9523 según la etiqueta), lo que lo convierte en un caso de estudio útil sobre la diferencia entre un modelo publicado y un modelo validado. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia Health AI Developer Foundations en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (`gemma3`), con torre de vision para entrada image-text-to-text; ajuste fino LoRA sobre el modelo base (segun tags del repo) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No se documentan cuantizaciones precalculadas (GGUF, AWQ, GPTQ) en la informacion disponible; el repo distribuye pesos en safetensors |
| Idiomas soportados | No disponibles (no declarados en la metadata del modelo) |
| Licencia | `health-ai-developer-foundations` (Health AI Developer Foundations, Google); acceso restringido (gated) |
| Formato de pesos | safetensors (libreria transformers, requiere codigo personalizado: `custom-code`, `trust_remote_code`) |
| Tamano del repositorio | 8,9 GB |
| Pipeline declarado | text-classification (los tags incluyen tambien image-text-to-text) |
| Modelo base | `unsloth/medgemma-1.5-4b-it` |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-10-26 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base: un transformer decoder-only de la familia Gemma 3, con torre de visión que permite procesar entradas de imagen y texto de forma conjunta (tag `image-text-to-text`). Sobre esa base se ha aplicado un ajuste fino con LoRA utilizando Unsloth, según indican los tags `unsloth` y `lora`. El resultado es un checkpoint de 4.300.079.472 parámetros que conserva la estructura del modelo original, pero cuyo uso previsto es la clasificación: el pipeline declarado es `text-classification` y la tarea nominal es "typed medical decisions", con un dataset específico (`Amaljith/medical-typed-decisions`) dividido en test.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO o de técnicas de decodificación especulativa. Los tags mencionan "calibrated-decisions" y "typed-decisions", lo que sugiere que el entrenamiento busca no solo la etiqueta correcta, sino una distribución de probabilidad calibrada sobre el conjunto de etiquetas; sin embargo, no se documenta el método de calibración empleado. El repositorio requiere código personalizado (`custom-code`), lo que implica que la carga del modelo no se resuelve con `AutoModelForCausalLM` estándar sin aceptar `trust_remote_code=True`.

## Capacidades

- Clasificación de decisiones médicas tipadas: salida estructurada sobre un conjunto predefinido de etiquetas clínicas, evaluada con balanced accuracy por etiqueta.
- Decisiones calibradas: la metadata declara soporte para "calibrated-decisions", orientado a obtener puntuaciones de confianza utilizables en umbrales de decisión.
- Procesamiento multimodal image-text-to-text heredado del modelo base (tag explícito en el repositorio), aunque la tarea entrenada es textual.
- Razonamiento clínico y generación de texto en el dominio médico, como capacidades heredadas de MedGemma 1.5 4B IT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el pipeline declarado es de clasificación, no de agente.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la metadata.
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Triaje automatizado de notas clínicas: el modelo puede asignar cada nota a una categoría tipada (por ejemplo, área de enfermedad o terapia farmacológica) con una puntuación de confianza, lo que permite priorizar revisiones humanas. Es adecuado porque su salida es una etiqueta acotada y no texto libre, lo que simplifica la integración en sistemas existentes.
- Etiquetado de literatura médica para revisiones sistemáticas: con balanced accuracy de 0,9523 en `disease_area`, el modelo es útil como primer pasador (pre-screening) que descarta artículos irrelevantes antes de la revisión manual, siempre con verificación humana posterior.
- Filtrado de seguridad farmacológica: la etiqueta `adverse` permite marcar documentos o casos con posible evento adverso; con balanced accuracy de 0,6254 debe usarse solo como señal de alerta, nunca como cribado único.
- Estratificación por población en estudios observacionales: las etiquetas `group_children` (0,8812), `group_adults` (0,8225) y `group_infants` (0,75) permiten clasificar cohortes pediátricas y adultas en pipelines de análisis retrospectivo, con revisión de las clases de menor rendimiento.
- Enrutamiento de consultas en un asistente clínico: dado un mensaje de paciente, el modelo decide a qué especialidad o flujo (`disease_area`, `drug_therapy`) derivarlo, actuando como clasificador previo a un modelo generativo mayor.
- Extracción estructurada en pipelines de investigación: al producir decisiones tipadas y calibradas, la salida se puede serializar directamente a JSON y almacenar en una base de datos para análisis posterior, sin necesidad de parsear lenguaje natural.
- Docencia y simulación clínica: como clasificador de casos por grupo de edad y sexo (`group_female` 0,8276, `group_male` 0,8689) para organizar bancos de casos y detectar desequilibrios en el material formativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Todos los valores están marcados con `verified: false`, es decir, no han sido verificados de forma independiente. La tarea es "Typed medical decisions" sobre el split `test` del dataset `medical-typed-decisions`, con métrica balanced accuracy.

| Metrica (balanced accuracy) | Valor |
|---|---|
| medline/disease_area | 0,9523 |
| medline/animals | 0,8964 |
| medline/group_children | 0,8812 |
| medline/group_male | 0,8689 |
| medline/group_female | 0,8276 |
| medline/group_adults | 0,8225 |
| medline/design | 0,7963 |
| medline/drug_therapy | 0,7905 |
| medline/group_infants | 0,7500 |
| medline/group_adolescents | 0,6679 |
| medline/adverse | 0,6254 |

La lista de métricas disponible aparece truncada en la información proporcionada, por lo que pueden existir etiquetas adicionales no recogidas en esta tabla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks médicos estándar (MedQA, PubMedQA) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-11 GB solo para pesos (4,3 B de parámetros × 2 bytes ≈ 8,6 GB), más overhead de activaciones, KV cache y torre de visión; presupuestar 12-16 GB en la práctica.
- VRAM estimada en fp32: aproximadamente 17,2 GB solo de pesos; no recomendable salvo necesidad de precisión máxima.
- Cuantización int8: en torno a 5-6 GB de pesos, con overhead adicional.
- Cuantización int4: en torno a 3-4 GB de pesos; permitiría su uso en GPUs de 8 GB, aunque no se distribuyen pesos cuantizados en el repositorio y habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 sin problemas; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) al límite en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB en bf16 y en tarjetas de 8-12 GB si se cuantiza a int4/int8.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada (el repo requiere código personalizado). No hay evidencia en la información disponible de soporte en vLLM, TGI, llama.cpp u Ollama; para llama.cpp/Ollama sería necesario convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 4,3 B con salida de clasificación (pocos tokens), la latencia de decodificación debería ser baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Acceso |
|---|---|---|---|---|---|
| medgemma-decide-4b | 4,3 B | no disponible | Clasificacion medica tipada (fine-tune) | health-ai-developer-foundations | Restringido (gated) |
| unsloth/medgemma-1.5-4b-it (base) | ~4,3 B | no disponible en la informacion proporcionada | Generacion multimodal medica | health-ai-developer-foundations | Restringido (gated) |
| Qwen2.5-VL-3B-Instruct | ~3,8 B | no disponible | Vision-lenguaje generalista | Apache 2.0 | Abierto |
| Llama-3.2-3B-Instruct | ~3,2 B | no disponible | Generacion de texto generalista | Llama 3.2 Community License | Abierto con condiciones |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada; las balanced accuracy del `model-index` solo son válidas dentro del dataset `medical-typed-decisions` y no permiten comparación cruzada con benchmarks estandarizados. La comparación relevante es frente a su modelo base: medgemma-decide-4b sacrifica generalidad conversacional a cambio de una salida de clasificación acotada y evaluable por etiqueta.

## Limitaciones y advertencias

- **No es un producto sanitario**: la licencia Health AI Developer Foundations está pensada para investigación y desarrollo de aplicaciones; no habilita el uso clínico directo sin validación regulatoria adicional. Requiere aceptar condiciones y el acceso es restringido (gated).
- **Rendimiento desigual por etiqueta**: balanced accuracy de 0,6254 en `adverse` y 0,6679 en `group_adolescents` frente a 0,9523 en `disease_area`. Un clasificador con ese rendimiento en eventos adversos generaría falsos negativos inaceptables en un contexto clínico real.
- **Benchmarks no verificados**: todos los resultados están marcados con `verified: false` y proceden de un único autor, con 0 descargas y 0 likes en el momento de la ficha. No existe validación independiente ni comparación con líneas base publicadas.
- **Riesgo de alucinación**: aunque la tarea sea de clasificación, el modelo subyacente es generativo; si la salida no se restringe a un esquema de etiquetas, puede producir texto libre o etiquetas fuera del vocabulario previsto.
- **Idiomas no declarados**: no se especifica qué idiomas soporta el ajuste; el dataset de entrenamiento parece basado en Medline, predominantemente en inglés, por lo que el rendimiento en castellano es desconocido.
- **Contexto no documentado**: se desconoce la longitud de contexto efectiva tras el ajuste LoRA; no asumir la del modelo base sin comprobación.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de desplegarlo en producción.
- **Sesgos poblacionales**: las diferencias de balanced accuracy entre grupos (infantes 0,75, adolescentes 0,6679, adultos 0,8225) sugieren un posible desequilibrio en los datos de entrenamiento que puede amplificar disparidades si se usa para decisiones que afecten a esos grupos.
- **Sin datos de cuantización ni de despliegue en servidores de inferencia**: no hay garantía de compatibilidad con vLLM, TGI o llama.cpp sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Amaljith/medgemma-decide-4b
- Modelo base: https://huggingface.co/unsloth/medgemma-1.5-4b-it
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Amaljith/medical-typed-decisions
- Repositorio de Unsloth (herramienta de ajuste fino empleada): https://github.com/unslothai/unsloth
- Papers, blogs, repos de código y demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados pertinentes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
