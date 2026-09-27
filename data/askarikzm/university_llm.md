# askarikzm/university_llm

## Resumen

university_llm es un ajuste fino del modelo Qwen2.5-7B-Instruct publicado por el usuario askarikzm en HuggingFace. Se trata de un modelo denso, decoder-only, de 7.615.616.512 parámetros (unos 7,62 mil millones), derivado concretamente de la versión ya cuantizada a 4 bits de Unsloth (unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit). El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, que según la model card permitieron un entrenamiento "2 veces más rápido"; no se especifica el conjunto de datos, el número de tokens ni el método de alineación empleado.

El problema que resuelve no está documentado explícitamente. El nombre del repositorio sugiere un ajuste orientado a dominio universitario o académico, pero el autor no describe el corpus de entrenamiento, los objetivos ni las tareas evaluadas, por lo que cualquier uso en producción debería ir precedido de una evaluación propia. El modelo se distribuye con licencia Apache-2.0 y declara únicamente el idioma inglés.

Su relevancia actual es limitada dentro del ecosistema: acumula 0 descargas y 0 "likes", y no incluye benchmarks ni métricas de validación. Es, por tanto, un experimento reproducible más que un modelo validado por la comunidad; su interés principal es servir como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre una base Qwen2.5, y como punto de partida para quien quiera reentrenar o auditar el resultado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2; el modelo base es Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 mediante escalado RoPE tipo YaRN; no hay confirmación de que el ajuste fino conserve esos valores |
| Tipos de cuantizacion | Pesos publicados en safetensors a 16 bits (el repositorio ocupa 15,2 GB para 7,62 B de parámetros). No se publican versiones GGUF, AWQ ni GPTQ. El modelo base se entrenó a partir de una cuantización de 4 bits de bitsandbytes (NF4) |
| Idiomas soportados | Inglés (declarado en la model card). El modelo base Qwen2.5 es multilingüe, pero el ajuste solo declara en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con Grouped Query Attention (GQA), normalización RMSNorm, activación SwiGLU y embeddings RoPE. No es un modelo MoE, ni híbrido SSM, ni emplea atención lineal; no hay innovaciones arquitectónicas propias de este ajuste fino. El autor parte de una versión del modelo base ya cuantizada a 4 bits por Unsloth y entrena mediante QLoRA con la pila Unsloth + TRL, lo que explica la afirmación de entrenamiento "2 veces más rápido". Los pesos finalmente publicados están fusionados (merged) en safetensors a 16 bits, no en 4 bits.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de datos sintéticos frente a reales, ni sobre si se aplicaron técnicas de alineación adicionales (RLHF, DPO, SFT puro). Tampoco se documentan hiperparámetros como el rango LoRA, la tasa de aprendizaje, el número de épocas o la estrategia de enmascarado de la pérdida sobre los tokens del prompt. Esta ausencia de trazabilidad es la principal limitación técnica del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Razonamiento de varios pasos y resolución de problemas de matemáticas y lógica elemental, en la medida en que lo permita el ajuste fino (no evaluado).
- Generación y explicación de código, con soporte habitual en la familia Qwen2.5 para lenguajes como Python, JavaScript o SQL.
- Seguimiento de instrucciones y mantenimiento de conversaciones multiturno, incluyendo system prompt.
- Tool calling / function calling: capacidad presente en el modelo base Qwen2.5-Instruct, aunque no hay confirmación de que el ajuste fino la preserve.
- Uso en agentes y razonamiento multi-paso con formato estructurado, presumiblemente heredado del base.
- Multilingüismo limitado: solo se declara inglés, aunque el base Qwen2.5 cubre decenas de idiomas.
- No se declaran capacidades de visión, audio, ni modo "thinking" explícito.

## Casos de uso

- Asistente de consultas académicas: desplegado sobre un corpus universitario propio (normativas, planes de estudio, reglamentos) usando RAG, el modelo puede responder preguntas en inglés citando el material recuperado, siempre que se valide antes su comportamiento en dominio.
- Generación de resúmenes de documentación técnica interna: con contexto de varios miles de tokens, puede condensar manuales, actas o guías de laboratorio en inglés.
- Apoyo a la redacción de material docente: borradores de enunciados, rúbricas o descripciones de prácticas, revisados posteriormente por personal docente.
- Prototipado rápido de chatbots para cursos: al ser un modelo de 7,6 B con licencia Apache-2.0, puede desplegarse en una GPU de 24 GB para demos en asignaturas de IA sin coste de licencia.
- Punto de partida para nuevos ajustes finos: sirve como base o referencia de pipeline QLoRA con Unsloth y TRL para equipos que quieran replicar el flujo con su propio dataset.
- Evaluación comparativa de técnicas de ajuste: útil en experimentos de investigación sobre destilación de datos, olvido catastrófico o evaluación de sesgos tras un fine-tune, al disponer de la URL exacta del checkpoint base.
- Generación asistida de código en scripts de análisis de datos: tareas de transformación de CSV, pandas o matplotlib, con verificación humana del resultado.
- Traducción o adaptación de material entre inglés y otros idiomas: posible pero no garantizada, dado que solo se declara inglés; requiere evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni curvas de pérdida de entrenamiento. La búsqueda web realizada tampoco devolvió ningún resultado relacionado con este modelo: los enlaces recuperados corresponden a foros y artículos de consumo sobre Amazon y no guardan relación con el repositorio. En consecuencia, no es posible comparar su rendimiento con el del modelo base ni con alternativas.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, más caché KV y activaciones. Con contexto de 8.000 tokens se sitúa en torno a 18-20 GB; con contexto largo puede superar los 24 GB.
- Caché KV estimada: a partir de la arquitectura del modelo base (28 capas, GQA con 4 cabezas KV y dimensión de cabeza 128), el consumo es de unos 57 KB por token en fp16, es decir, alrededor de 1,8 GB para 32.768 tokens.
- Cuantización a 8 bits: unos 8 GB de pesos, ~10-12 GB en total, viable en GPUs de 16 GB.
- Cuantización a 4 bits (requiere conversión propia, no hay artefactos publicados): unos 4,5-5 GB de pesos, ~6-8 GB en total.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto moderado; RTX 4080, RTX 4070 Ti Super (16 GB) en 8 bits; RTX 3060 12 GB y RTX 4060 Ti 16 GB en 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S 48 GB, con margen amplio para contextos largos y lotes grandes.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI (el tag text-generation-inference está presente en el repositorio), además de llama.cpp, Ollama o LM Studio previa conversión a GGUF con las herramientas estándar de llama.cpp.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen por completo del hardware, la cuantización y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| university_llm (este modelo) | 7,62 B | No especificado en la model card (base: 32.768) | Apache-2.0 | HuggingFace, safetensors |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 nativos, 131.072 con YaRN | Apache-2.0 | HuggingFace, GGUF, AWQ, GPTQ |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | HuggingFace, GGUF |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache-2.0 | HuggingFace, GGUF |

La comparación de rendimiento no es posible: no hay benchmarks publicados para university_llm ni datos de evaluación frente a estos alternativas. La diferencia principal es de madurez y trazabilidad: los tres modelos de referencia cuentan con documentación de entrenamiento, evaluaciones publicadas y cuantizaciones listas para usar, mientras que university_llm no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar la procedencia de los datos ni descartar sesgos introducidos durante el ajuste.
- Riesgo de olvido catastrófico: al ser un fine-tune sobre una base ya cuantizada a 4 bits para el entrenamiento, es plausible una degradación de capacidades generales (razonamiento, código, tool calling) respecto al modelo original; no hay evaluación que lo confirme o descarte.
- Riesgo de alucinación no cuantificado. Al no existir benchmarks, no hay estimación de la tasa de error factual.
- Idiomas: solo se declara inglés. El uso en castellano u otros idiomas no está soportado ni validado, aunque el modelo base sea multilingüe.
- Longitud de contexto no confirmada: si el ajuste fino no preservó la ventana nativa de 32.768 tokens, el rendimiento en contextos largos puede degradarse de forma abrupta.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta. No hay informes de terceros, incidencias reportadas ni validación independiente.
- Repositorio de 15,2 GB: el almacenamiento y la transferencia del checkpoint tienen un coste no trivial.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones adicionales, pero no exime de responsabilidad sobre la calidad o los sesgos del modelo; el autor no ofrece garantías.
- Fecha de publicación registrada como 2026-09-27, posterior a la creación de gran parte del ecosistema de herramientas citadas; conviene verificar la coherencia temporal de los metadatos antes de integrarlo en un pipeline.
- No hay versiones cuantizadas oficiales: cualquier despliegue ligero exige convertir los pesos por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/askarikzm/university_llm
- Modelo base: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (framework de entrenamiento citado en la model card): https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace (citada en la model card): https://github.com/huggingface/trl
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo, su entrenamiento o su evaluación.
