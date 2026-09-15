# ishikaa/acquisition_student_medmcqa_diversity_sft_llama8b

## Resumen

`ishikaa/acquisition_student_medmcqa_diversity_sft_llama8b` es un ajuste fino supervisado (SFT) publicado por el usuario ishikaa en Hugging Face. El repositorio contiene 8.030.261.248 parámetros en formato safetensors (16,1 GB), un recuento que coincide exactamente con el de la familia Llama 3 de 8B, aunque el autor no confirma la arquitectura base ni el checkpoint de partida. La model card es una plantilla autogenerada de `transformers` con todos los campos marcados como "[More Information Needed]": no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación.

El identificador del modelo es, a día de hoy, la única fuente de información sobre su propósito: sugiere un SFT orientado a MedMCQA (preguntas de opción múltiple de exámenes médicos) con algún criterio de "diversidad" en la selección de datos y un esquema de "student" (posiblemente destilación o aprendizaje activo). Nada de esto está confirmado en la ficha oficial. La relevancia de esta publicación es, por tanto, limitada y de carácter experimental: cuenta con 0 descargas y 0 likes, y las etiquetas `trl`, `sft` y `arxiv:1910.09700` (esta última apunta a Lacoste et al. 2019, citado en la sección de impacto ambiental de la plantilla, no a un artículo sobre el modelo).

Para un desarrollador o investigador que evalúe modelos, esta ficha debe tratarse como un artefacto de investigación sin documentar: es técnicamente cargable y ejecutable con `transformers`, pero carece de la información mínima (procedencia de datos, licencia, evaluación) necesaria para decidir un despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del Hub indica `llama` y el recuento de parámetros (8.030.261.248) coincide con la familia Llama 3 de 8B, pero el autor no lo confirma |
| Parámetros totales | 8.030.261.248 (8,03 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo distribuye safetensors en precisión completa (16,1 GB, aproximadamente 2 bytes por parámetro, compatible con fp16/bf16). No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Librería de carga | transformers |
| Tarea declarada | text-generation (`pipeline_tag`) |
| Etiquetas | transformers, safetensors, llama, text-generation, trl, sft, conversational, text-generation-inference, endpoints-compatible, region:us |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 16,1 GB |
| Fecha de creación / actualización | 15 de septiembre de 2026 (según metadatos del Hub) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card, que es una plantilla autogenerada sin contenido. Los únicos indicios son las etiquetas del Hub: `llama` (familia de arquitectura), `trl` y `sft` (entrenamiento mediante ajuste fino supervisado con la librería TRL) y `conversational` (formato de chat). El recuento exacto de parámetros, 8.030.261.248, es idéntico al de Llama 3 8B y Llama 3.1 8B, lo que apunta con alta probabilidad a un ajuste sobre uno de esos checkpoints, pero se trata de una inferencia y no de un dato confirmado por el autor. El tamaño del repositorio (16,1 GB) es consistente con pesos en bf16 o fp16 sin cuantizar.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posteriores ni ninguna innovación técnica (atención lineal, decodificación especulativa, atención con ventana deslizante, etc.). El nombre del repositorio sugiere que el entrenamiento se realizó sobre MedMCQA, un conjunto de preguntas de opción múltiple de exámenes de acceso a medicina en India, posiblemente con una estrategia de selección de datos por diversidad y un esquema tipo "student". Esta lectura es una hipótesis derivada del identificador y no está respaldada por ningún contenido de la model card. La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la propia plantilla, y no describe el modelo.

## Capacidades

No se ha publicado ninguna descripción de capacidades. Las siguientes afirmaciones son inferencias a partir del tamaño, la tarea declarada y las etiquetas, y deben validarse empíricamente antes de cualquier uso:

- Generación de texto autorregresiva en formato conversacional (etiqueta `conversational`).
- Respuesta a preguntas, presumiblemente en formato de opción múltiple y dominio médico, según el identificador del repositorio (no confirmado).
- Compatibilidad con `text-generation-inference` y con endpoints compatibles, lo que sugiere que el chat template y el formato de mensajes están preparados para esos servidores.
- Multilingüismo: no disponible. No se declara ninguna lista de idiomas.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Modo de razonamiento extendido (thinking), visión o audio: no disponibles.
- Longitud de contexto efectiva tras el ajuste: no disponible; podría diferir de la del checkpoint base.

## Casos de uso

Dado que no existe documentación de capacidades ni evaluación, estos escenarios son planteamientos de uso plausible, sujetos a validación previa:

- Investigación sobre ajuste fino en dominio médico: el modelo puede utilizarse como punto de partida o como referencia en estudios que comparen estrategias de SFT (por ejemplo, selección de datos por diversidad frente a selección aleatoria) sobre MedMCQA. Es adecuado por su tamaño manejable en una sola GPU de 24 GB en cuantización de 8 bits.
- Evaluación comparativa de checkpoints intermedios: al ser un SFT de 8B, sirve como línea base para medir degradación o mejora respecto al modelo base en tareas de opción múltiple, siempre que se documente la metodología.
- Prototipado de asistentes de estudio médico: generación de explicaciones y respuestas comentadas a preguntas tipo test, con revisión humana obligatoria y sin uso clínico.
- Generación aumentada de conjuntos de preguntas: producción de variantes de preguntas de examen para bancos de práctica, con filtrado posterior por parte de expertos.
- Experimentos de destilación: si el identificador hace referencia a un esquema "student", el checkpoint puede emplearse como alumno en experimentos de destilación desde modelos mayores, midiendo la transferencia en tareas de dominio específico.
- Investigación sobre olvido catastrófico: comparar el rendimiento del modelo en tareas generales frente al checkpoint base permite cuantificar cuánto conocimiento general se pierde tras un SFT intensivo en un dominio concreto.
- Despliegue interno de bajo riesgo en formatos conversacionales acotados (por ejemplo, un bot de preguntas frecuentes administrativas no clínicas), solo si se resuelve previamente la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y no se proporcionan métricas de MMLU, MedMCQA, GSM8K, HumanEval ni de ningún otro conjunto. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros (8,03 B) y del tamaño del repositorio (16,1 GB); el autor no publica ninguna medición:

- VRAM para inferencia en bf16/fp16: aproximadamente 16,1 GB solo para pesos, más caché KV; en la práctica entre 18 y 22 GB en función de la longitud de contexto y el tamaño de lote.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB de pesos, unos 10-12 GB en total.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 4,7-5,0 GB de pesos, unos 6-8 GB en total con contexto moderado.
- GPU recomendadas para bf16: A100 40 GB u 80 GB, H100, L40S 48 GB. Una RTX 4090 de 24 GB puede alojarlo con contexto corto y lotes pequeños, pero sin margen.
- GPU de consumo: sí es viable. En 8 bits cabe en RTX 4090, RTX 3090 y, con dificultad, en RTX 4080 de 16 GB. En 4 bits cabe en RTX 3060 de 12 GB, RTX 4070 y equipos Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI (etiqueta `text-generation-inference`), TensorRT-LLM y SGLang. Para llama.cpp, Ollama o LM Studio sería necesaria una conversión propia a GGUF, ya que el repositorio no incluye pesos cuantizados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se establece frente a modelos densos de tamaño equivalente, dado que no se conocen modelos comparables dentro de la misma línea de investigación (el repositorio no cita ninguno). Los datos del modelo analizado son en su mayoría desconocidos:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| acquisition_student_medmcqa_diversity_sft_llama8b | 8,03 B | No disponible | No disponible | Hugging Face, safetensors, 0 descargas |
| Llama 3.1 8B Instruct | 8,03 B | 128 000 tokens | Licencia comunitaria Llama 3.1 | Hugging Face, ampliamente desplegado |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 000 tokens | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Qwen2.5 7B Instruct | 7,62 B | 32 768 tokens (131 072 con YaRN) | Apache 2.0 (salvo excepciones por tamaño) | Hugging Face, ampliamente desplegado |

No se dispone de datos de rendimiento del modelo analizado, por lo que no es posible compararlo en MMLU, MedMCQA ni ninguna otra métrica frente a estas alternativas.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (datos de entrenamiento, procedencia, hiperparámetros, evaluación) están sin rellenar. No es posible auditar el modelo.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial. En producción esto constituye un riesgo legal directo, agravado si el checkpoint base fuera Llama 3/3.1, sujeto a su propia licencia comunitaria.
- Dominio médico: si el ajuste se realizó sobre MedMCQA, el modelo puede emitir respuestas con apariencia de autoridad en un ámbito de alto riesgo. No debe utilizarse para diagnóstico, triaje ni consejo clínico sin supervisión profesional.
- Riesgo de alucinación: no cuantificado ni evaluado. En modelos de 8B ajustados con SFT sobre datos de opción múltiple, la tendencia a inventar justificaciones plausibles suele ser elevada.
- Olvido catastrófico: el ajuste en un dominio estrecho puede degradar capacidades generales del checkpoint base (razonamiento, código, multilingüismo). No hay evaluación que lo descarte.
- Idiomas: no declarados. Es probable que el modelo tenga un rendimiento muy inferior en castellano si el entrenamiento fue mayoritariamente en inglés, pero no hay datos al respecto.
- Contexto: se desconoce la ventana efectiva tras el ajuste; asumir la del modelo base sin verificación puede provocar fallos silenciosos en prompts largos.
- Formato de prompt: no se documenta la plantilla de chat utilizada en el SFT. Un formato incorrecto degrada la calidad de forma notable y no hay instrucciones de uso en el repositorio.
- Madurez: 0 descargas y 0 likes, sin historial de uso ni validación por terceros. Es un artefacto experimental, no un modelo listo para producción.
- Reproducibilidad: al no documentarse dataset ni hiperparámetros, los resultados no son reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_medmcqa_diversity_sft_llama8b
- Referencia citada en las etiquetas del Hub (Lacoste et al., 2019, sobre estimación de emisiones de carbono, no sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental enlazada en la plantilla de la model card: https://mlco2.github.io/impact
- Librería TRL (etiqueta `trl`): https://github.com/huggingface/trl
- Repositorio de transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
