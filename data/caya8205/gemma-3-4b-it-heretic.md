# Caya8205/gemma-3-4b-it-heretic

## Resumen

`Caya8205/gemma-3-4b-it-heretic` es una version "decensored" (tambien llamada abliterated) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicada por el usuario Caya8205 en Hugging Face. El modelo conserva la arquitectura y los pesos del Gemma 3 4B instruct original, pero se ha modificado mediante la herramienta Heretic v2.1.0 para reducir drasticamente la tasa de rechazos ante peticiones que el modelo base rechazaria. El resultado es un modelo que mantiene gran parte de las capacidades del original pero con una alineacion de seguridad muy relajada.

El modelo base Gemma 3 4B es un transformer multimodal de Google que acepta texto e imagenes como entrada y genera texto, con una ventana de contexto de 128K tokens y soporte para mas de 140 idiomas. Esta variante heretic mantiene esas capacidades (incluida la vision) y se distribuye tanto en safetensors como en formato GGUF para su uso con llama.cpp, lo que facilita su despliegue en hardware de consumo.

La relevancia de esta ficha radica en que se trata de un modelo derivado con implicaciones eticas y de licencia importantes: la licencia Gemma original impone restricciones de uso, y la modificacion de la alineacion de seguridad puede tener consecuencias en produccion. Con 4.300.079.472 parametros totales y un tamano de repositorio de 13,6 GB, es un modelo pensado para experimentacion local mas que para despliegues comerciales sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), texto e imagen |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens de entrada; 8192 tokens de salida |
| Tipos de cuantizacion | GGUF (incluido en el repo); safetensors en bf16 |
| Idiomas soportados | en, id (segun la model card); el base declara mas de 140 idiomas |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B: un transformer multimodal que procesa texto e imagenes. Las imagenes se normalizan a 896 x 896 y se codifican en 256 tokens cada una. La ventana de contexto de entrada es de 128K tokens y la de salida de 8192 tokens. El modelo base fue entrenado por Google DeepMind a partir de la misma investigacion y tecnologia que los modelos Gemini, con variantes preentrenada e instruction-tuned.

La modificacion heretic no reentrena el modelo, sino que aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 12 a 22. Los parametros reportados son: `start_layer_index` 12, `end_layer_index` 22, `preserve_good_behavior_weight` 0.5227, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.3288 y `neighbor_count` 12. El autor indica que el proceso es reproducible (directorio `reproduce`). Segun la model card, la tasa de rechazos baja de 97/100 en el original a 3/100 en esta variante, con una divergencia KL de 0.0540 respecto al modelo base. No se detalla la composicion del dataset de entrenamiento original ni si hubo RLHF/DPO en el base; esa informacion no esta disponible en los datos proporcionados.

## Capacidades

- Generacion de texto conversacional en formato chat con plantillas de mensajes (system, user, assistant).
- Comprension de imagenes: descripcion, respuesta a preguntas sobre contenido visual y analisis de escenas.
- Razonamiento y respuesta a preguntas, resumen y tareas de generacion de texto en general.
- Capacidades multilingues heredadas del base (la model card de esta variante solo declara en e id; el base declara mas de 140 idiomas).
- Reduccion drastica de rechazos: 3/100 frentes a 97/100 del original, segun la model card.
- Compatibilidad con llama.cpp y con el pipeline `image-text-to-text` de Transformers.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de audio: la etiqueta `audio` aparece en los tags, pero no se detalla su funcionamiento en la informacion disponible.

## Casos de uso

- Experimentacion en investigacion sobre alineacion y seguridad: permite estudiar como la ablacion de capas afecta al comportamiento de rechazo y a la calidad general, comparando directamente con el modelo base mediante la divergencia KL reportada.
- Analisis de imagenes en local: el modelo acepta imagenes de 896 x 896 codificadas en 256 tokens, por lo que puede usarse para descripcion de escenas, OCR ligero o respuesta a preguntas visuales en entornos sin conexion a APIs externas.
- Prototipado de asistentes conversacionales sin filtros: util para generar dialogos sinteticos o datasets de entrenamiento donde se necesita que el modelo no rechace temas sensibles, siempre con revision humana posterior.
- Evaluacion de robustez de pipelines: al tener una tasa de rechazo muy baja, sirve para probar sistemas de moderacion y guardrails externos que deban funcionar independientemente del modelo subyacente.
- Despliegue en hardware de consumo: con 4,3B parametros y versiones GGUF, cabe en GPUs de gama media y permite experimentar con vision y lenguaje en un portatil o estacion de trabajo.
- Generacion de contenido creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas que el modelo base rechazaria, con la advertencia de que la salida requiere revision editorial.
- Comparativa de comportamiento entre modelos alineados y no alineados: permite medir el coste de la ablacion en tareas estandar y documentar diferencias de calidad.

## Benchmarks y rendimiento

La model card proporciona unicamente metricas del proceso de ablacion, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (google/gemma-3-4b-it) |
|---|---|---|
| Rechazos | 3/100 | 97/100 |
| Divergencia KL | 0.0540 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,6 GB solo para pesos, mas overhead de contexto y activaciones; se recomienda 12-16 GB para contexto largo.
- VRAM estimada en cuantizacion GGUF Q4: en torno a 3-4 GB de pesos, lo que permite ejecucion en GPUs de 6-8 GB.
- GPU recomendadas: A100 o H100 para produccion con contexto completo de 128K; RTX 4090 o RTX 3090 para uso local en bf16; RTX 3060/4060 Ti (8-16 GB) para cuantizaciones GGUF.
- Cabe en GPU de consumo: si, en cuantizaciones GGUF Q4/Q5 en GPUs de 8 GB o mas; en bf16 requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; Transformers (>= 4.50.0) con `Gemma3ForConditionalGeneration` para safetensors; vLLM y TGI no confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Caya8205/gemma-3-4b-it-heretic | 4,3B | 128K | Si (texto e imagen) | gemma | Variante decensored; rechazos 3/100 |
| google/gemma-3-4b-it | 4,3B | 128K | Si (texto e imagen) | gemma | Modelo base alineado; rechazos 97/100 |
| google/gemma-3-12b-it | no disponible | 128K | Si (texto e imagen) | gemma | Version mayor de la misma familia |
| google/gemma-3-27b-it | no disponible | 128K | Si (texto e imagen) | gemma | Version tope de la familia Gemma 3 |

No se dispone de datos de benchmarks comparativos de capacidad entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina buena parte de la alineacion de seguridad: el modelo responde a peticiones que el original rechazaria, lo que puede producir contenido danino, ilegal o eticamente problematico.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo de 4B, la tasa de alucinacion puede ser superior a la de modelos mayores.
- La divergencia KL de 0.0540 respecto al base indica que el comportamiento no es identico; puede haber degradacion en tareas que dependian de las capas modificadas (12 a 22).
- La licencia Gemma impone restricciones de uso; la modificacion de pesos no exime de cumplir los terminos originales, y el uso comercial requiere revision legal.
- Idiomas declarados en esta variante: solo en e id; el soporte multilingue amplio del base puede no estar garantizado tras la ablacion.
- La etiqueta `audio` en los tags no esta respaldada por documentacion en la informacion disponible; no asumir capacidades de audio.
- No hay datos de benchmarks de capacidad ni de latencia/throughput, por lo que no se recomienda su uso en produccion sin evaluacion propia.
- El modelo tiene pocas descargas (217) y cero likes, lo que limita la validacion comunitaria de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caya8205/gemma-3-4b-it-heretic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Heretic: https://heretic-project.org
- Pagina de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico de Gemma 3: https://ai.google.dev/gemma/docs/core (referencia [g3-tech-report] de la model card)
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible (referencia [rai-toolkit])
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Terminos de uso: https://ai.google.dev/gemma/terms
