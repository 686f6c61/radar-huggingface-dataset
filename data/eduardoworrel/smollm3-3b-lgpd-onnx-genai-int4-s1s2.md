# eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 es una compilación cuantizada a int4 del modelo SmolLM3-3B de Hugging Face, adaptada mediante LoRA y una cabeza de clasificación ("pointer head") para responder preguntas de tipo Sí/No sobre el cumplimiento de la LGPD (Lei Geral de Proteção de Dados, la ley brasileña de protección de datos) en pasajes de políticas de privacidad en portugués. El autor, eduardoworrel, la publica como un artefacto ONNX listo para ejecutarse en el navegador mediante la librería s1s2 y el runtime onnxruntime-genai con backend WebGPU.

El modelo resuelve un problema muy concreto: dada una cláusula de política de privacidad y un requisito de transparencia, devuelve una decisión tipada (Sim/Não) con probabilidad y margen en un único forward pass (lo que el autor denomina "System 1"). Solo cuando el margen es bajo se escala a generación de texto ("System 2") para justificar la respuesta, reutilizando el mismo prefill. Es relevante porque demuestra un patrón de despliegue de clasificación legal en el cliente, sin servidor, con el modelo base de 3B parámetros cuantizado a int4 y un peso de descarga de 1,75 GB.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se dispone de información adicional sobre el proceso de entrenamiento más allá de lo que el autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabeza de clasificación tipo pointer sobre logits de opciones; grafo ONNX para onnxruntime-genai 0.19 |
| Parametros totales | 3B (modelo base SmolLM3-3B); parámetros de la cabeza no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (build publicado); el adaptador LoRA de referencia existe en bf16/fp32 |
| Idiomas soportados | Portugués (pt) y inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai); repo de 1,8 GB, descarga declarada de 1,75 GB |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.000 millones de parámetros de Hugging Face, y le añade una cabeza de clasificación entrenada sobre los logits de dos palabras opción concretas: " Sim" y " Não" (con espacio inicial). La decisión se toma en un solo forward pass comparando la probabilidad asignada a cada opción y calculando un margen; el autor denomina a este modo "System 1". Cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios, se activa un segundo modo ("System 2") que reutiliza el mismo prefill para generar una justificación en texto.

El entrenamiento se realizó con datos de políticas brasileñas (corpus Claudinha, CC BY 4.0) más datos sintéticos "Kev" (legacy_policy, compositional) generados por código Apache-2.0. La receta de la cabeza y del entrenamiento proviene del proyecto Kev (jaredpalmer/kev). El adaptador LoRA y las cabezas en PyTorch se publican por separado en eduardoworrel/SmolLM3-3B-LGPD-LoRA. La variante evaluada en la model card es `lgpd_only`; existe una variante `lgpd_only_k` (2 épocas, merge en fp32) que no fue evaluada en el conjunto de test reservado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria Sí/No sobre pasajes de políticas de privacidad en portugués, con probabilidad y margen por respuesta.
- Respuesta tipada con la palabra opción exacta con la que se entrenó la cabeza (" Sim" / " Não"); otras palabras o traducciones alteran el prompt y no funcionan.
- Decisión en un único forward pass (System 1) con escalado opcional a generación de texto (System 2) cuando el margen es bajo.
- Generación de texto de justificación a partir del mismo prefill, con límite de tokens nuevos configurable (por ejemplo, 64).
- Clasificación de requisitos de transparencia definidos por el usuario mediante preguntas estructuradas (nombre, tipo "choice", opciones e instrucciones).
- Transferencia zero-shot a GDPR (inglés) y CCPA (inglés), según los resultados declarados por el autor.
- Ejecución en navegador con WebGPU a través de s1s2 y onnxruntime-genai; no requiere servidor.
- Soporte de política de escalado por margen calibrada sobre datos propios (thresholdFromQuantile).

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: el modelo clasifica cláusulas de políticas brasileñas frente a requisitos de transparencia sin enviar el texto a un servidor, lo que encaja con flujos de revisión donde el documento no debe salir del cliente.
- Revisión de cumplimiento LGPD en bufetes y departamentos legales: dada una cláusula y una pregunta concreta (por ejemplo, si se comparten datos con terceros), devuelve Sim/Não con probabilidad y margen para priorizar la revisión humana.
- Triaje previo a revisión legal: las respuestas con margen bajo se escalan automáticamente a generación de justificación, de modo que el revisor recibe solo los casos dudosos con texto de apoyo.
- Formación y concienciación: la demo en navegador permite mostrar a equipos no técnicos cómo se evalúa una cláusula frente a un requisito, con la justificación generada por el propio modelo.
- Investigación en clasificación legal de bajo coste: el artefacto int4 y el adaptador LoRA permiten reproducir y comparar el patrón System 1 / System 2 en entornos sin GPU dedicada.
- Transferencia a otros marcos regulatorios: el autor reporta resultados zero-shot en GDPR y CCPA, lo que permite prototipar clasificadores para esos marcos sin reentrenamiento, con la cautela de que el modelo nunca fue entrenado con ellos.
- Integración en pipelines de revisión documental: el manifiesto JSON y la API de s1s2 permiten encadenar varias preguntas sobre el mismo pasaje y agregar las decisiones tipadas en un informe estructurado.

## Benchmarks y rendimiento

Precisión balanceada de la cabeza pointer sobre conjunto de test reservado, con pesos bf16 de la variante `lgpd_only`, según la model card:

| Conjunto de test | Precisión balanceada (%) |
|---|---|
| LGPD (portugués), n = 802 | 78,2 |
| GDPR (inglés, transferencia zero-shot), n = 558 | 75,3 |
| CCPA (inglés, transferencia zero-shot), n = 420 | 74,5 |

El autor indica que esta build int4 no tiene todavía medición en navegador. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas con modelos similares.

## Requisitos de hardware

- Descarga del artefacto: 1,75 GB (repo de 1,8 GB) en formato ONNX int4 para onnxruntime-genai 0.19.
- Ejecución en navegador con WebGPU; el autor no especifica VRAM ni memoria unificada mínima.
- No se indican GPU recomendadas ni latencia o throughput medidos; la model card señala explícitamente que esta build int4 no tiene medición en navegador.
- El adaptador LoRA de referencia en PyTorch (eduardoworrel/SmolLM3-3B-LGPD-LoRA) puede ejecutarse con el stack habitual de transformers, pero no se detallan requisitos de VRAM para esa variante.
- Opciones de despliegue declaradas: onnxruntime-genai con backend WebGPU a través de s1s2; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de clasificación legal o de privacidad, ni con variantes del propio SmolLM3-3B.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente con políticas brasileñas (LGPD); GDPR y CCPA nunca se usaron en entrenamiento, por lo que los resultados en esos marcos son transferencia zero-shot y deben tratarse con cautela.
- Responde si un pasaje aborda un requisito, no si una política cumple la ley; no constituye asesoramiento legal.
- La cabeza está entrenada con exactamente las palabras " Sim" y " Não" (con espacio inicial); traducciones u otras palabras cambian el prompt y rompen la clasificación.
- La variante `lgpd_only_k` no fue evaluada en el conjunto de test reservado; la model card usa `lgpd_only` como referencia.
- Esta build int4 no tiene medición de rendimiento en navegador publicada; el comportamiento real en WebGPU puede diferir del de los pesos bf16 evaluados.
- Riesgo de alucinación en el modo System 2 (generación de justificación), ya que el texto generado no está verificado contra la cláusula original.
- Sesgos no documentados en la model card; el corpus de entrenamiento es específico del contexto regulatorio brasileño.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben mantenerse las atribuciones del corpus Claudinha (CC BY 4.0), los datos Kev y el modelo base SmolLM3-3B (Apache-2.0).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-LoRA
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Proyecto Kev (receta de la cabeza): https://github.com/jaredpalmer/kev
- Corpus Claudinha: https://zenodo.org/records/13371639
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
