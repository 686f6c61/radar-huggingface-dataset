# chimingw/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-GGUF

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-GGUF es una conversión y cuantización comunitaria del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, que a su vez es una versión "abliterada" (modificada para eliminar rechazos y censura) del modelo Qwen3.8-27B de Alibaba. El empaquetado lo realiza el usuario chimingw, que publica un espejo byte-idéntico de los pesos fuente en BF16, un GGUF principal en BF16 dividido en dos shards, un proyector multimodal y cuatro variantes cuantizadas (Q8_0, Q6_K, Q5_K_M y Q4_K_M) generadas de forma independiente desde el mismo padre BF16.

El modelo subyacente es un transformer denso de 26.895 millones de parámetros con arquitectura vision-language (Qwen3_5ForConditionalGeneration), ventana de contexto nativa de 262.144 tokens y soporte de razonamiento configurable. La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27B multimodal y con capacidades de razonamiento en hardware de consumo mediante llama.cpp, sin necesidad de infraestructura de servidor. El autor del modelo fuente, AEON-7, declara haber aplicado una técnica de abliteración con un objetivo de divergencia KL de 0,0991 nats/token, aunque estas afirmaciones no han sido verificadas de forma independiente por el empaquetador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (model_type: qwen3_5), transformer denso con vision tower y MTP head |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 posiciones maximas (depende del runtime y la memoria disponible) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); BF16 (safetensors y GGUF) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, BF16) y safetensors BF16 en SOURCE_BF16/ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con arquitectura vision-language, disenado para tareas de codificacion, trabajo profesional, investigacion y agentes de largo horizonte. Incluye un vision tower para procesamiento de imagenes y una cabeza MTP (multi-token prediction) que, en esta publicacion GGUF, queda excluida del modelo principal y solo se conserva en el espejo SOURCE_BF16/. El contexto nativo es de 262.144 tokens.

El modelo fuente de AEON-7 aplica una tecnica de abliteracion sobre el Qwen3.8-27B original. Segun las declaraciones del autor, el objetivo no es minimizar la divergencia KL hacia cero (como hacen otras abliteraciones publicas), sino mantener coherencia y mejorar las respuestas, aceptando una deriva KL media de 0,0991 nats/token en los primeros tokens forzados de 100 prompts inofensivos. El autor afirma que no se optimizo para "parecer stock" y que la abliteracion busca eliminar los rechazos sin degradar la calidad. No se dispone de datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento configurable (modo thinking activable o desactivable segun el prompt y el runtime).
- Comprension de imagenes (pipeline image-text-to-text) mediante el proyector multimodal incluido en AUX/.
- Soporte de function calling / tool calling, segun las capacidades del modelo base Qwen3.8-27B.
- Capacidad para tareas agénticas de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Multilingue limitado a ingles y chino.
- Razonamiento matematico y de codigo, heredado del modelo base, aunque no se aportan benchmarks especificos en esta publicacion.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos y respuestas evasivas, lo que puede resultar en respuestas mas directas incluso en temas sensibles.

## Casos de uso

- Ejecucion local de un asistente multimodal en hardware de consumo: con la cuantizacion Q4_K_M (aproximadamente 15-16 GB de VRAM) se puede desplegar en una RTX 4090 o similar, usando llama.cpp u Ollama, para tareas de chat con entrada de imagenes y contexto largo.
- Prototipado de agentes con tool calling: gracias al soporte de function calling y la ventana de 262K tokens, se puede integrar en pipelines agénticos que requieran multiples pasos de razonamiento y acceso a herramientas externas, sin depender de APIs en la nube.
- Analisis de documentos largos con imagenes: el contexto amplio permite procesar manuales, informes o contratos extensos junto con figuras o diagramas, en un unico paso de inferencia.
- Generacion de codigo asistida en entornos aislados: al ser un modelo de 27B, puede ejecutarse en una estacion de trabajo con una GPU de 24 GB, ofreciendo autocompletado y refactorizacion de codigo sin enviar datos a servidores externos.
- Investigacion sobre alineacion y seguridad: al ser una version abliterada, resulta util para estudiar el comportamiento de modelos sin restricciones de rechazo, comparando respuestas con el modelo original en escenarios controlados.
- Desarrollo de aplicaciones multilingues en ingles y chino: el modelo cubre ambos idiomas de forma nativa, lo que permite construir asistentes bilingues o sistemas de traduccion con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El empaquetador advierte explicitamente que las afirmaciones del autor del modelo fuente (divergencia KL, evaluaciones con gemini-3.1-flash-lite) no son resultados de evaluacion de estos artefactos GGUF y no han sido verificadas de forma independiente. Tampoco se aportan datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 26,9B parametros):
  - Q4_K_M: aproximadamente 15-16 GB (cabe en RTX 4090 24 GB, RTX 4080 16 GB con margen limitado).
  - Q5_K_M: aproximadamente 17-18 GB (requiere GPU de 24 GB o mas).
  - Q6_K: aproximadamente 20-21 GB (requiere GPU de 24 GB o mas).
  - Q8_0: aproximadamente 27-28 GB (requiere GPU profesional como A100 40 GB o H100).
  - BF16 GGUF: aproximadamente 54 GB (requiere GPU profesional o CPU con mucha RAM).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y BF16; en CPU, se puede usar llama.cpp con suficiente RAM (32 GB minimo para Q4_K_M).
- Opciones de despliegue: llama.cpp (compatible con los GGUF), Ollama (si se importa el GGUF), y para el modelo BF16 safetensors se puede usar vLLM o TGI, aunque el empaquetador desactiva la inferencia alojada en Hugging Face.
- Latencia y throughput: no se proporcionan datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/s para un modelo de 27B, pero es una estimacion orientativa sin confirmacion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9B | 262K | Si | Apache 2.0 | Safetensors, GGUF |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (este) | 26,9B | 262K | Si | Apache 2.0 | GGUF, Safetensors |
| Qwen2.5-32B (referencia de generacion anterior) | 32,5B | 128K | No (solo texto) | Apache 2.0 | Safetensors, GGUF |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento publicados para ninguna de las versiones. La diferencia principal frente al Qwen3.8-27B original es la abliteracion aplicada por AEON-7, que altera el comportamiento de rechazo sin cambiar la arquitectura. Frente a Qwen2.5-32B, este modelo anade capacidades multimodales y un contexto mayor, a costa de un tamano ligeramente inferior.

## Limitaciones y advertencias

- El modelo es una version "uncensored" obtenida mediante abliteracion. Puede generar contenido danino, ofensivo o ilegal sin las salvaguardas del modelo original. No es apto para despliegue en produccion sin una capa de moderacion externa.
- Las afirmaciones del autor del modelo fuente (divergencia KL, evaluaciones cualitativas) no han sido verificadas de forma independiente por el empaquetador ni por terceros.
- La cuantizacion se ha realizado sin matriz de importancia (imatrix), lo que puede afectar a la calidad de la cuantizacion en tareas de razonamiento o codigo en comparacion con cuantizaciones con imatrix.
- El GGUF principal excluye la cabeza MTP; el rendimiento de prediccion multitoken puede verse reducido respecto al modelo original.
- El soporte de idiomas se limita a ingles y chino; no se garantiza un comportamiento adecuado en otros idiomas.
- La ventana de contexto de 262K tokens es el maximo teorico; en la practica, el rendimiento y la memoria disponible limitan el contexto util, especialmente en GPUs de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede incorporar sesgos o alucinaciones heredados del entrenamiento base, agravados por la abliteracion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chimingw/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-GGUF
- Modelo fuente BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision fijada del modelo fuente: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16/commit/a6775a9a8ebb65cab3f707b4ab087fc7aa698634
- Commit de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp/commit/0d9ceae1e38291035605613ab41a8f5e693d6fcd
- Ficha de Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen3.8
- Seguimiento de lanzamiento de Qwen3.8-27B: https://aireleasetracker.com/model/qwen/qwen3.8-27b
