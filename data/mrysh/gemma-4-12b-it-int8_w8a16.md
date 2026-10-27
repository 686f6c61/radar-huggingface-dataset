# mrysh/gemma-4-12b-it-int8_w8a16

## Resumen

`mrysh/gemma-4-12b-it-int8_w8a16` es una versión cuantizada a INT8 del modelo `google/gemma-4-12B-it`, publicado por el usuario mrysh. Se trata de un artefacto de cuantización weight-only W8A16: los pesos se almacenan en int8 con una escala por canal de salida, las activaciones se mantienen en 16 bits y las partes de visión y audio del modelo base se conservan en 16 bits. El resultado ocupa 13,056 GB en disco y contiene 11.959.730.224 parámetros.

El modelo se creó para un benchmark de cuantización en el que se comparan cuatro modelos y ocho técnicas con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA. No es un modelo entrenado desde cero, sino una conversión del modelo base de Google DeepMind orientada a reducir los requisitos de VRAM y facilitar el despliegue en infraestructura más modesta. La licencia declarada es apache-2.0, aunque el autor remite a la licencia del modelo base, por lo que conviene verificar las condiciones reales antes de un uso comercial.

La información disponible no incluye la longitud de contexto, los idiomas soportados ni resultados numéricos de benchmarks. La arquitectura del modelo base tampoco se detalla en la documentación proporcionada; solo se indica que pertenece a la familia Gemma 4 de Google DeepMind y que el formato de pesos es compatible con vLLM mediante `compressed-tensors`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 4 12B IT de Google DeepMind) |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 weight-only (W8A16); pesos int8 con una escala por canal de salida, activaciones de 16 bits; visión y audio en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada por el autor; sujeta a la licencia del modelo base (verificar) |
| Formato de pesos | safetensors, formato `compressed-tensors` `pack-quantized` |
| Método de cuantización | round-to-nearest, sin datos de calibración, group size None |
| Biblioteca de cuantización | compressed-tensors 0.17.0 |
| Tamaño en disco | 13,056 GB |
| Modelo base | google/gemma-4-12B-it |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una cuantización del modelo instructivo `google/gemma-4-12B-it`. El proceso aplica cuantización INT8 weight-only: cada peso se representa con 8 bits y una escala por canal de salida, mientras que las activaciones permanecen en 16 bits. No se utilizaron datos de calibración y el método es round-to-nearest, lo que simplifica la conversión pero puede introducir un error mayor que técnicas con calibración. Las capas de visión y audio se mantienen en 16 bits, lo que sugiere que el modelo base es multimodal, aunque la model card no detalla qué tareas concretas cubren esas modalidades.

No se proporcionan datos sobre el entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones de arquitectura como atención lineal o decodificación especulativa. Tampoco se documenta la arquitectura interna del transformer o de la familia Gemma 4 más allá de la referencia al modelo base. La innovación práctica de esta versión es la compatibilidad nativa con vLLM mediante `compressed-tensors`, sin necesidad de flags adicionales al ejecutar `vllm serve`, y la reducción del tamaño de pesos de aproximadamente 24 GB en BF16 a 13,1 GB en INT8.

## Capacidades

- Generación de texto e instrucciones: el modelo base es una variante instructiva (`it`), por lo que está preparado para responder a prompts y seguir instrucciones.
- Razonamiento y respuesta a preguntas: la documentación de Gemma 4 menciona tareas de generación, resumen y razonamiento; no se aportan métricas para esta versión cuantizada.
- Modo thinking: la evaluación del autor se realizó con el modo thinking desactivado, lo que implica que el modelo base dispone de algún mecanismo de razonamiento explícito, aunque no se detalla su funcionamiento.
- Capacidades multimodales: la model card indica que las partes de visión y audio se conservan en 16 bits. No se especifican tareas de visión, OCR, audio o vídeo, ni se aportan ejemplos de uso.
- Código y matemáticas: no se documentan capacidades específicas ni resultados en HumanEval, GSM8K u otros benchmarks de código o matemáticas.
- Tool calling y function calling: no documentado en la información disponible.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no se especifican idiomas concretos; el modelo base Gemma 4 es de propósito general, pero no hay lista de idiomas en la información proporcionada.

## Casos de uso

- Asistente local en estación de trabajo con GPU de 24 GB: el modelo cabe en una RTX 4090 o RTX 3090 con cuantización INT8 para contextos moderados. Se puede servir con `vllm serve` y usarlo como asistente interno de documentación, redacción o resumen sin depender de una API externa.
- Generación aumentada por recuperación (RAG) sobre documentación interna: al ser un modelo instructivo de ~12B, puede integrarse en un pipeline que recupere fragmentos de manuales, contratos o bases de conocimiento y genere respuestas citando el contexto. La longitud de contexto no está documentada, por lo que el pipeline debe trocear los documentos y validar la calidad de las respuestas.
- Resumen y reescritura de informes técnicos: adecuado para condensar actas, correos o informes en entornos con requisitos de privacidad, ya que los pesos pueden ejecutarse en infraestructura propia. La cuantización sin calibración hace recomendable revisar la fidelidad de los resúmenes en textos largos.
- Prototipado de atención al cliente: se puede desplegar un chatbot multi-turno para pruebas internas, con la salvedad de que no se han publicado idiomas soportados ni métricas de calidad. Antes de producción habría que evaluar el comportamiento en los idiomas objetivo y establecer filtros de seguridad.
- Análisis de documentos con componente visual: si se confirma que las capas de visión del modelo base funcionan correctamente tras la cuantización, podría emplearse para extraer información de facturas, formularios o capturas de pantalla. La model card solo indica que esas capas se mantienen en 16 bits; no hay ejemplos ni evaluaciones multimodales.
- Auditoría de sesgos en procesos de selección: el autor incluye la tarea hiring-bias en su benchmark, por lo que el modelo puede utilizarse como objeto de estudio en investigaciones sobre sesgos de contratación. No debería emplearse como sistema de decisión real sin una evaluación específica y supervisión humana.
- Evaluación comparativa de técnicas de cuantización: el repositorio forma parte de un conjunto de cuatro modelos y ocho técnicas evaluadas con vLLM. Sirve como referencia reproducible para medir el impacto de INT8 W8A16 frente a FP8, W8A16 con otras herramientas u otras precisiones en tareas como BFCL, Energy-QA, MedQA y hiring-bias.
- Generación de código en entornos controlados: puede utilizarse para autocompletar funciones, explicar fragmentos o proponer pruebas unitarias. No se documenta soporte de tool calling ni integración con pipelines de CI/CD, así que cualquier automatización de herramientas requeriría desarrollo adicional y validación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo se evaluó con vLLM sobre BFCL, Energy-QA, hiring-bias y MedQA, pero no se incluyen las métricas obtenidas.

| Tarea de evaluación | Resultado |
|---|---|
| BFCL | no publicado |
| Energy-QA | no publicado |
| Hiring-bias | no publicado |
| MedQA | no publicado |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 12 GB; el repositorio completo pesa 13,1 GB. Con overhead de activaciones y caché KV, se recomienda al menos 16 GB de VRAM para contextos cortos y 24 GB para un uso cómodo con contexto moderado.
- GPU de consumo: RTX 4090 o RTX 3090 con 24 GB son adecuadas para inferencia local con vLLM. Una GPU de 16 GB puede funcionar con contexto muy corto y poca concurrencia, pero no está garantizado y dependerá de la implementación.
- GPU de centro de datos: A100 de 40 GB u 80 GB, H100 de 80 GB y GPUs equivalentes son adecuadas para producción, mayor concurrencia y contextos más largos. Para batch alto o contextos extensos, se recomienda 80 GB.
- Despliegue: vLLM es la opción documentada de forma nativa (`vllm serve <repo>`), gracias al formato `compressed-tensors`. No se documenta soporte directo en llama.cpp, Ollama o TGI; para usarlos habría que convertir los pesos a GGUF u otro formato, algo que no se incluye en el repositorio.
- Latencia y throughput: no disponibles. Dependerán de la GPU, la longitud de contexto, el tamaño de batch y la versión de vLLM. No se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño en disco | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| mrysh/gemma-4-12b-it-int8_w8a16 | 11,96B | no disponible | INT8 W8A16, sin calibración | 13,1 GB | apache-2.0 declarada, sujeta al modelo base | no publicado |
| google/gemma-4-12B-it | ~12B | no disponible | BF16 original | ~24 GB estimado en BF16, no confirmado | Gemma (verificar en la model card del base) | no disponible |
| mrysh/gemma-4-12b-it-fp8 | ~12B | no disponible | FP8, formato llm-compressor/ModelOpt | no disponible | misma que el modelo base | no publicado |
| soyrsoyr/gemma-4-12b-it-W8A16 | ~12B | no disponible | INT8 W8A16 con llm-compressor | 15,2 GB | Gemma según la etiqueta de Hugging Face | no publicado |

La comparación principal es entre el original en BF16, la versión FP8 y las dos variantes INT8 W8A16. La versión de mrysh es la más compacta de las documentadas aquí, con 13,1 GB, pero al no usar calibración puede presentar mayor degradación que alternativas calibradas. No hay datos de calidad comparativa entre ellas en la información disponible.

## Limitaciones y advertencias

- La cuantización INT8 W8A16 sin datos de calibración y con round-to-nearest puede degradar la precisión respecto al modelo en BF16, especialmente en tareas de razonamiento, matemáticas o clasificación sensible.
- La evaluación se realizó únicamente como modelo de texto y con el modo thinking desactivado. No se validan las capacidades multimodales ni el modo de razonamiento explícito tras la cuantización.
- No se publican métricas de BFCL, Energy-QA, hiring-bias ni MedQA, por lo que no es posible cuantificar la pérdida de calidad frente al modelo base.
- Se desconoce la longitud de contexto soportada y los idiomas admitidos. Esto limita el diseño de aplicaciones que dependan de ventanas largas o de cobertura multilingüe.
- La licencia presenta una inconsistencia: la etiqueta de Hugging Face y el frontmatter indican apache-2.0, pero la model card remite a la licencia del modelo base. Antes de un uso comercial hay que verificar la licencia de `google/gemma-4-12B-it` y las políticas de uso de Gemma.
- El modelo base puede incluir filtros de seguridad o políticas de uso aceptable que no se detallan en esta ficha. Es responsabilidad del despliegue aplicar moderación y salvaguardas.
- Como todo modelo generativo, existe riesgo de alucinación. En tareas de atención al cliente, medicina, selección de personal o análisis documental se requiere revisión humana y validación con datos propios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026. Es un artefacto de benchmark, no un modelo con un historial de uso en producción.
- Las capas de visión y audio en 16 bits aumentan el tamaño del repositorio y no garantizan que las capacidades multimodales se conserven con la misma calidad que en el modelo original; no hay evaluaciones que lo confirmen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-12b-it-int8_w8a16
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante FP8 del mismo autor: https://huggingface.co/mrysh/gemma-4-12b-it-fp8
- Variante W8A16 de otro autor: https://huggingface.co/soyrsoyr/gemma-4-12b-it-W8A16/tree/main
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4: https://gemma.ai/models/gemma-4/
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
