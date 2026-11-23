# OpenMed/Inkling2-Mini-TrialCriteria-v1

## Resumen

Inkling2-Mini-TrialCriteria-v1 es un ajuste fino (fine-tune) del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicado por OpenMed. Resuelve una tarea muy concreta dentro del procesamiento de texto clínico: clasificar un criterio de elegibilidad de un ensayo clínico en una de dos categorías, inclusion o exclusion, tal como aparecen en los registros de ClinicalTrials.gov. El modelo no genera texto libre; reutiliza la cabeza de lenguaje del modelo base para puntuar dos códigos de respuesta y elegir el de mayor logit en un único pase forward.

El modelo base es un transformer multimodal (image-text-to-text) de 26.388.646.440 parámetros totales, empaquetado en aproximadamente 19,5 GB en formato mixto NVFP4 y MXFP8, con licencia Apache-2.0. El ajuste se realizó con LoRA de rango 8 sobre las proyecciones query y value de las últimas cuatro capas (278.528 parámetros entrenados), que después se fusionaron en el checkpoint final. El resultado es un checkpoint autónomo que se carga con Transformers en una sola GPU CUDA.

La relevancia práctica está en el salto de rendimiento declarado: sobre 200 criterios de 76 registros cuyos promotores no aparecieron en entrenamiento, el macro F1 pasa de 76,19 en el modelo original a 86,99 en este ajuste, una mejora de 10,81 puntos. Es una herramienta de triaje para pipelines de selección de candidatos y cribado de ensayos, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Inkling 2 Mini; clasificación mediante puntuación de logits de códigos de respuesta |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la entrada se trunca a 160 tokens de criterio en el prompt de referencia) |
| Tipos de cuantizacion | Pesos en formato mixto NVFP4 y MXFP8; decodificación a BF16 al cargar |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Parametros entrenados (LoRA) | 278.528 (rango 8, query y value de las últimas 4 capas) |
| Tarea | Clasificación binaria: inclusion / exclusion |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Inkling 2 Mini de Thinking Machines Lab, un transformer multimodal con soporte de entrada imagen-texto. Sobre esa base, OpenMed aplicó un ajuste supervisado con LoRA de rango 8 únicamente sobre las proyecciones query y value de las últimas cuatro capas, lo que da 278.528 parámetros entrenables. El entrenamiento consistió en 67 pasos sobre 400 criterios procedentes de 181 registros de ClinicalTrials.gov, y los adaptadores se fusionaron posteriormente en el checkpoint publicado. No se documentan fases de RLHF ni DPO; es un ajuste supervisado de clasificación.

La innovación técnica del despliegue no está en la arquitectura sino en el formato de inferencia: el prompt presenta las dos etiquetas como códigos de respuesta (A = inclusion, B = exclusion), se hace un único pase forward sin generación y se comparan los logits del siguiente token para esos dos códigos. Esto elimina la variabilidad del muestreo y reduce la latencia frente a un enfoque generativo. El prompt, el límite de 160 tokens para el criterio y los marcadores `Text:` y `Answer:` son exactamente los usados en entrenamiento y evaluación, por lo que deben respetarse para reproducir los resultados.

## Capacidades

- Clasificación binaria de criterios de elegibilidad de ensayos clínicos en inclusion o exclusion.
- Entrada en inglés de hasta 160 tokens por criterio; procesamiento de un criterio por llamada.
- Inferencia determinista en un solo pase forward, sin generación ni muestreo.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la tarea ajustada es exclusivamente textual.
- No se documenta soporte de tool calling ni function calling para esta variante.
- No se documenta comportamiento de agente ni razonamiento multi-paso.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Cribado previo de registros de ensayos: dado un criterio extraído de un registro de ClinicalTrials.gov, el modelo indica si pertenece a la sección de inclusión o de exclusión, lo que permite reconstruir la estructura del protocolo a partir de texto plano.
- Normalización de datos de ensayos para bases de datos internas: en un pipeline ETL que ingiere registros, el modelo etiqueta cada criterio antes de almacenarlo, facilitando consultas estructuradas por tipo de criterio.
- Preprocesamiento para motores de emparejamiento paciente-ensayo: separar inclusion de exclusion es un paso previo necesario para aplicar la lógica de elegibilidad; el modelo automatiza esa separación sobre cientos de criterios con un coste de inferencia bajo por elemento.
- Auditoría de calidad de registros: comparar la etiqueta predicha con la sección declarada en el registro permite detectar criterios mal ubicados o inconsistencias en la publicación.
- Extracción de criterios en herramientas de revisión sistemática: al procesar lotes de registros, el modelo clasifica cada criterio y reduce el trabajo manual de revisión.
- Integración en el SDK OpenMed: el modelo encaja en flujos locales de procesamiento clínico junto a las herramientas de NER clínico, desidentificación y FHIR/HL7 del ecosistema OpenMed, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre 200 criterios de 76 registros de ClinicalTrials.gov con 67 promotores no vistos en entrenamiento, split de desarrollo:

| Metrica | Valor |
|---|---|
| Macro F1 | 86,99 |
| Accuracy | 87,00 |
| Recall de exclusión | 89,00 |
| Precisión de inclusión | 88,54 |

Comparación con el modelo base en la misma evaluación:

| Modelo | Macro F1 |
|---|---|
| Inkling2-Mini-TrialCriteria-v1 | 86,99 |
| Inkling 2 Mini (original) | 76,19 |
| Mejora | +10,81 puntos |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para esta variante.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 19,5 GB en el repositorio; al cargarse se decodifican a BF16, por lo que la huella en memoria es sustancialmente mayor que el tamaño del checkpoint.
- La ejecución de referencia usó una sola GPU con 96 GB de memoria.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores; una GPU de 96 GB es el escenario validado por el autor.
- No se documenta que quepa en GPU de consumo (RTX 4090 de 24 GB) con la carga en BF16 descrita; no hay datos publicados de despliegue cuantizado adicional.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM`, `accelerate` y una revisión concreta de Transformers (commit 046bdb8cc2cee29d233964bb77fe6fd37cfe4aa3). Se usan `attn_implementation="eager"` y `experts_implementation="eager"`.
- No se documentan datos de latencia ni throughput; al ser un único pase forward sin generación, el coste por criterio es el de una inferencia corta, pero no hay cifras publicadas.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de criterios de elegibilidad de ensayos clínicos) en la documentación proporcionada. La única comparación disponible es con su modelo base:

| Modelo | Parametros | Contexto | Macro F1 (criterios) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-Mini-TrialCriteria-v1 | 26,39 B | no disponible | 86,99 | Apache-2.0 | Hugging Face |
| Inkling 2 Mini (base) | 26,39 B | no disponible | 76,19 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo admite inglés; los criterios en otros idiomas no están cubiertos por el entrenamiento ni la evaluación.
- La entrada se trunca a 160 tokens por criterio; criterios más largos pueden perder información relevante.
- Clasificación binaria estricta: no detecta criterios ambiguos, mal formados ni texto que no sea un criterio de elegibilidad.
- Los resultados declarados (macro F1 86,99) no están verificados de forma independiente y proceden de un conjunto de desarrollo de 200 criterios; el rendimiento en otros registros o dominios terapéuticos puede diferir.
- Riesgo de alucinación estructural bajo en cuanto a formato (la salida siempre es una de dos etiquetas), pero riesgo real de clasificación errónea en criterios con redacción atípica o que mezclan condiciones de inclusión y exclusión.
- El prompt debe reproducirse exactamente (instrucción, leyenda de etiquetas, marcadores `Text:` y `Answer:`, límite de 160 tokens); desviarse puede degradar el rendimiento.
- Requiere una revisión específica de Transformers y una GPU de gran memoria (referencia de 96 GB); no es un modelo ligero para despliegue en entornos con recursos limitados.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y las obligaciones de atribución.
- No debe usarse como único criterio en decisiones clínicas o de elegibilidad de pacientes sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Inkling2-Mini-TrialCriteria-v1
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- OpenMed en X: https://x.com/OpenMed_AI
- Revisión de Transformers usada en las pruebas: https://github.com/huggingface/transformers/commit/046bdb8cc2cee29d233964bb77fe6fd37cfe4aa3
- Paper referenciado en los tags (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
