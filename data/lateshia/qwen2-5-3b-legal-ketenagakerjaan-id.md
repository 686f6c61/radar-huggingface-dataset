# Lateshia/qwen2.5-3b-legal-ketenagakerjaan-id

## Resumen

Lateshia/qwen2.5-3b-legal-ketenagakerjaan-id es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario Lateshia y publicado en HuggingFace. El modelo base empleado es la versión pre-cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit), y el entrenamiento se realizó con la librería Unsloth, que según la propia model card permitió un entrenamiento "2x más rápido" que un flujo estándar. La licencia declarada es Apache-2.0 y la librería de referencia es transformers.

El nombre del repositorio sugiere una especialización en derecho laboral indonesio ("ketenagakerjaan" significa empleo o relaciones laborales en indonesio, e "id" apunta a Indonesia), pero la model card no documenta ni el dataset, ni el dominio, ni el idioma real de entrenamiento; la única etiqueta de idioma declarada es "en". El repositorio ocupa 0,1 GB, un tamaño compatible con un adaptador LoRA o con una subida parcial de pesos, y no con un modelo de 3B en precisión completa o en 4 bits íntegro.

Se trata, por tanto, de un experimento de ajuste fino de nicho, con cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluación publicados y sin documentación técnica más allá de los metadatos. Su interés es limitado como modelo de producción, pero resulta ilustrativo como ejemplo de flujo QLoRA con Unsloth sobre Qwen2.5-3B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, con Grouped Query Attention (GQA); heredada del modelo base |
| Parámetros totales | ~3.090 millones (3B) en el modelo base Qwen2.5-3B-Instruct; no se documenta el recuento exacto del fine-tune |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens en el modelo base, ampliable a 131.072 con YaRN según la documentación de Qwen2.5; no especificado en la model card del fine-tune |
| Tipos de cuantización | Pesos derivados de una base cuantizada en 4 bits (bitsandbytes 4-bit); no se publican otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Declarado: en (inglés). El nombre del repositorio sugiere contenido en indonesio, sin confirmación documental |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-3B-Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y Grouped Query Attention. La configuración habitual de esta talla en la familia Qwen2.5 es de 36 capas, dimensión oculta de 2048, 16 cabezas de atención y 2 cabezas de clave/valor, lo que reduce de forma notable el coste de la caché KV en contextos largos. La ventana de contexto nativa del base es de 32.768 tokens, extensible a 131.072 mediante escalado YaRN.

Sobre el proceso de ajuste fino, la información disponible es mínima: se sabe que se partió de unsloth/Qwen2.5-3B-Instruct-bnb-4bit, es decir, de una base ya cuantizada a 4 bits, lo que implica un flujo de tipo QLoRA (adaptadores de bajo rango sobre pesos congelados en 4 bits). Se emplearon las librerías Unsloth y TRL, y la model card destaca la aceleración de entrenamiento de Unsloth. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de etapas de RLHF o DPO posteriores, el rango y los módulos objetivo de los adaptadores, ni la receta de hiperparámetros. Tampoco se especifica si los pesos publicados son el adaptador sin fusionar o una fusión completa, algo relevante dado el tamaño de 0,1 GB del repositorio.

## Capacidades

- Generación de texto conversacional, heredada del ajuste por instrucciones del modelo base Qwen2.5-3B-Instruct.
- Razonamiento de propósito general, matemáticas elementales y generación de código a nivel básico-intermedio, capacidades propias de la talla 3B de Qwen2.5.
- Respuesta a instrucciones y formato de chat instruct (plantilla ChatML de Qwen), siempre que el tokenizador y la plantilla se conserven intactos.
- Presunta especialización en consultas de derecho laboral indonesio, inferida únicamente del nombre del repositorio y no verificada en la model card.
- Capacidades multilingües heredadas del base: la familia Qwen2.5 declara soporte para decenas de idiomas, si bien la etiqueta de este repositorio solo indica inglés.
- Soporte de tool calling y function calling: presente en el modelo base Qwen2.5-Instruct, pero no verificado ni documentado en este fine-tune.
- Modo de razonamiento explícito (thinking mode): no disponible; Qwen2.5-Instruct no incorpora cadena de pensamiento separada, a diferencia de la serie QwQ/Qwen3.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Consultas de derecho laboral indonesio: si la especialización del nombre se confirma, el modelo podría responder preguntas sobre contratos, indemnizaciones o jornada laboral; requeriría validación previa contra fuentes legales oficiales antes de cualquier uso real.
- Prototipado de asistentes jurídicos de bajo coste: con 3B de parámetros y cuantización de 4 bits, permite iterar sobre flujos de pregunta-respuesta legal en una sola GPU de consumo antes de escalar a un modelo mayor.
- Clasificación y etiquetado de documentos legales: extracción de campos, resumen de cláusulas o categorización de expedientes en lotes, aprovechando su ventana de contexto de 32.768 tokens.
- Base para investigación en ajuste fino eficiente: sirve como caso de estudio reproducible de un pipeline QLoRA con Unsloth y TRL sobre Qwen2.5-3B, útil para comparar recetas de entrenamiento.
- Generación de borradores internos: redacción asistida de memorandos o resúmenes de normativa, siempre con revisión humana obligatoria por tratarse de contenido jurídico.
- Chatbot de atención interna de recursos humanos: respuestas sobre políticas de empresa en un contexto controlado, con recuperación aumentada (RAG) sobre los documentos internos para reducir la alucinación.
- Educación y formación: generación de preguntas de práctica y explicaciones introductorias sobre legislación laboral, con supervisión docente.
- Preprocesamiento en pipelines de NLP: filtrado, normalización o traducción preliminar de textos legales antes de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones específicas del dominio jurídico indonesio para este fine-tune. La model card no incluye curvas de pérdida, comparativas ni métricas de ningún tipo, y tampoco se documenta una evaluación del modelo base tras el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de la talla de 3B, no medidas publicadas):
  - FP16/BF16: unos 6,2 GB solo de pesos; con caché KV y activaciones, entorno a 8 GB para lotes pequeños.
  - INT8: aproximadamente 3,5 GB de pesos.
  - 4 bits (bitsandbytes NF4 o GGUF Q4_K_M): entre 2,0 y 2,5 GB de pesos.
- Caché KV: la configuración GQA con 2 cabezas de clave/valor mantiene el coste bajo; a 32.768 tokens en FP16 se estiman alrededor de 1,2 GB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; NVIDIA L4, A10G o A100/H100 para despliegue con concurrencia y lotes grandes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs con 6 GB o más en cuantización de 4 bits, y en 10-12 GB en FP16 con contexto moderado.
- Opciones de despliegue: transformers, Text Generation Inference (la etiqueta text-generation-inference aparece en el repositorio), vLLM, llama.cpp u Ollama previa conversión a GGUF (no se publican pesos GGUF), y Unsloth/TRL para reentrenamiento.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni comportamiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lateshia/qwen2.5-3b-legal-ketenagakerjaan-id | ~3B, base en 4 bits | 32.768, ampliable a 131.072 con YaRN (heredado) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09B | 32.768, ampliable a 131.072 con YaRN | Apache-2.0 | HuggingFace, ampliamente utilizado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community License (acceso con aceptación de términos) | HuggingFace |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | HuggingFace |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use (acceso con aceptación de términos) | HuggingFace |

En cuanto a rendimiento comparado, no hay datos: este fine-tune no publica métricas, por lo que no puede situarse frente a las alternativas más allá de las diferencias de licencia, contexto y tamaño. Como referencia de licencia, Apache-2.0 (este modelo y Qwen2.5) es más permisiva para uso comercial que las licencias de Llama 3.2 y Gemma 2, que imponen condiciones adicionales.

## Limitaciones y advertencias

- Ausencia total de evaluación: sin benchmarks, sin métricas de pérdida y sin validación del dominio declarado, no hay evidencia de que el ajuste haya mejorado al modelo base, y podría haber degradado capacidades generales por sobreajuste.
- Ambigüedad de dominio e idioma: la etiqueta de idioma indica "en" mientras que el nombre apunta a derecho laboral indonesio; esta contradicción no se resuelve en la model card y afecta directamente a la idoneidad del modelo.
- Riesgo elevado de alucinación en materia jurídica: cualquier salida sobre normativa, plazos o indemnizaciones debe tratarse como no fiable y verificarse con fuentes oficiales; un modelo de 3B no ofrece garantías de precisión legal.
- Tamaño del repositorio anómalo: 0,1 GB es demasiado pequeño para pesos completos de 3B (unos 6,2 GB en FP16 o alrededor de 1,8-2 GB en 4 bits), lo que sugiere la publicación de un adaptador LoRA o una subida incompleta; conviene verificar la integridad de los ficheros antes de cargar el modelo.
- Falta de trazabilidad del entrenamiento: no se documentan dataset, número de tokens, hiperparámetros, ni si hubo etapas de alineación; esto impide auditar sesgos, licencias del corpus o posibles filtraciones de datos personales.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad; además, el uso comercial de un modelo entrenado con un corpus no documentado puede acarrear riesgos legales sobre los datos de entrenamiento.
- Sesgos: no evaluados. Los sesgos heredados del corpus de Qwen2.5 (predominantemente inglés y chino) pueden trasladarse al dominio jurídico objetivo.
- Advertencia de producción: con cero descargas y cero validación externa, no es recomendable desplegarlo en entornos reales sin una reevaluación completa, control de versiones del tokenizador y pruebas de regresión frente al modelo base.
- Nota sobre la búsqueda web: los resultados recuperados para esta consulta no contenían información relacionada con el modelo (contenido no pertinente), por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lateshia/qwen2.5-3b-legal-ketenagakerjaan-id
- Modelo base del ajuste: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Blog técnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper, demo o documentación adicional del fine-tune: no disponible
- Resultados de búsqueda web relevantes: no disponible
