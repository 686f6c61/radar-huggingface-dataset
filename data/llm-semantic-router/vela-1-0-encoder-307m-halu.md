# llm-semantic-router/Vela-1.0-Encoder-307M-Halu

## Resumen

Vela-1.0-Encoder-307M-Halu es un modelo encoder de tipo ModernBERT afinado para token-classification, concretamente para la deteccion de alucinaciones en respuestas generadas por modelos de lenguaje. Lo desarrolla el proyecto llm-semantic-router (vLLM Semantic Router) y deriva por fine-tuning del modelo base vllm-sr/Vela-1.0-Encoder-307M. Su funcion es localizar, dentro de una respuesta, los fragmentos (spans) que no estan respaldados por la evidencia proporcionada, etiquetandolos como `supported` (0) o `hallucinated` (1) mediante offsets de caracteres Unicode.

El modelo resuelve un problema concreto en pipelines RAG y de verificacion de respuestas: dado un contexto (evidencia), una pregunta y una respuesta, devuelve las porciones de la respuesta que no se sustentan en el contexto. Con 307 millones de parametros y una longitud de entrada de 8.192 tokens, esta pensado para integrarse como componente de enrutado y control de calidad en sistemas que ya usan LLM, sin necesidad de un segundo modelo generativo para la verificacion.

Es relevante porque aborda la deteccion de alucinaciones como tarea supervisada de etiquetado de spans, con evaluacion sobre conjuntos diversos (codigo, README, salidas de herramientas, Wikipedia, RAGTruth y PsiloQA multilingue) y comparacion directa con LettuceDetect. La licencia Apache 2.0 y el formato safetensors estandar de Transformers facilitan su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) para token-classification |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens, incluidos tokens especiales |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; cuantizacion GGUF/ONNX no documentada) |
| Idiomas soportados | no disponible (la evaluacion incluye PsiloQA multilingue, pero no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT afinado para token-classification sobre el modelo base vllm-sr/Vela-1.0-Encoder-307M. La cabeza de clasificacion produce dos etiquetas por token (`supported` y `hallucinated`), y la salida se agrupa en spans mediante offsets de caracteres sobre la respuesta. La entrada se construye como un par (prompt = peticion del usuario + evidencia, respuesta), con truncamiento `only_first` en la evaluacion y un limite de 8.192 tokens.

El fine-tuning se realizo sobre los datasets KRLabsOrg/lettucedetect-code-hallucination y KRLabsOrg/lettucedetect-prose-hallucination, orientados a alucinaciones en codigo y en prosa. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La evaluacion reportada usa bfloat16, limite de 8.192 tokens, truncamiento `only_first` y umbral de score estrictamente superior a 0,5. El modelo base incluye un parametro de configuracion `reference_compile` que la model card recomienda desactivar (`config.reference_compile = False`) y sugiere `attn_implementation="sdpa"`.

## Capacidades

- Deteccion de spans no respaldados por la evidencia en respuestas generadas, con etiquetas `supported` (0) y `hallucinated` (1).
- Verificacion de respuestas en pipelines RAG: compara la respuesta con el contexto recuperado y marca los fragmentos sin soporte.
- Deteccion de alucinaciones en codigo y en prosa (datasets de entrenamiento especificos para ambos dominios).
- Procesamiento de entradas largas de hasta 8.192 tokens, suficiente para contexto, pregunta y respuesta en un unico par.
- Evaluacion multilingue reportada sobre PsiloQA, aunque sin lista explicita de idiomas soportados.
- Salida a nivel de token con offsets de caracteres Unicode, lo que permite mapear los spans directamente al texto original de la respuesta.
- No es un modelo generativo: no produce texto, solo clasificacion de tokens. No se documenta soporte de tool calling ni de agentes.

## Casos de uso

- Verificacion de respuestas en RAG: tras recuperar documentos y generar una respuesta, el modelo recibe contexto + pregunta + respuesta y devuelve los spans no soportados, permitiendo bloquear o regenerar respuestas antes de mostrarlas al usuario.
- Control de calidad en agentes de codigo: con el conjunto de evaluacion "Code agent" (2.015 muestras) y el dataset de alucinaciones en codigo, se puede marcar codigo generado que no se corresponde con la evidencia o la documentacion disponible.
- Validacion de salidas de herramientas: el grupo "Tool output" (617 muestras) evalua respuestas construidas a partir de resultados de herramientas; el modelo sirve para detectar afirmaciones que la salida de la herramienta no respalda.
- Enrutado semantico y guardarrailes: integrado en el stack vLLM Semantic Router como componente de verificacion que decide si una respuesta pasa el control de fidelidad antes de continuar el pipeline.
- Auditoria de documentacion tecnica: el grupo "README" (641 muestras) y "Wikipedia" (1.388 muestras) muestran buen rendimiento en prosa tecnica y enciclopedica, util para revisar resumenes generados sobre documentacion.
- Verificacion multilingue: el conjunto PsiloQA (2.897 muestras) permite usar el modelo en respuestas en varios idiomas, con rendimiento cercano al de LettuceDetect.
- Filtrado de datos sinteticos: al puntuar spans por token, se puede usar para descartar o corregir respuestas generadas en la construccion de datasets de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto fijo de evaluacion de 10.698 ejemplos. Cada celda es Vela Halu / LettuceDetect, escala 0-100, mayor es mejor. En negrita, los valores de Vela que superan al baseline.

| Fuente | Muestras | Span F1 | Span P | Span R | Example F1 | IoU |
|---|---:|---:|---:|---:|---:|---:|
| ALL | 10.698 | **64,7** / 64,2 | **70,0** / 68,4 | 60,1 / 60,5 | **87,5** / 86,9 | **67,9** / 67,1 |
| ACL | 440 | **60,3** / 57,9 | **72,0** / 70,5 | **51,9** / 49,2 | 85,9 / 87,3 | **65,1** / 63,7 |
| Code agent | 2.015 | **53,0** / 50,8 | **65,5** / 61,9 | **44,6** / 43,0 | **78,3** / 77,0 | 58,0 / 58,1 |
| README | 641 | **76,7** / 75,1 | **81,8** / 78,9 | **72,2** / 71,6 | **91,5** / 90,0 | **78,4** / 76,8 |
| Tool output | 617 | **64,3** / 58,8 | **78,0** / 73,6 | **54,7** / 49,0 | **82,7** / 76,3 | **70,3** / 64,5 |
| Wikipedia | 1.388 | **73,4** / 70,8 | **77,1** / 74,1 | **70,1** / 67,8 | **93,0** / 91,7 | **79,1** / 76,8 |
| PsiloQA (multilingue) | 2.897 | 70,8 / 71,4 | **70,5** / 69,6 | 71,1 / 73,3 | 94,1 / 94,3 | 62,5 / 62,7 |
| RAGTruth | 2.700 | 52,5 / 52,8 | **67,4** / 66,8 | 43,1 / 43,7 | **74,9** / 74,3 | **72,8** / 72,4 |

Las metricas de span miden solapamiento de caracteres; Example F1 mide si una respuesta contiene algun span alucinado; IoU es la interseccion sobre union media de conjuntos de caracteres. Los scores de LettuceDetect proceden de su model card publicada, redondeados a tres decimales en escala 0-1 antes de la conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307 millones de parametros, en bfloat16 el modelo ocupa aproximadamente 0,6 GB de pesos; en float32, unos 1,2 GB. Con overhead de activaciones y batch pequeno, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB (RTX 3060/4060, RTX 4090, L4, A10, A100, H100). Para lotes grandes y 8.192 tokens de entrada conviene 16 GB o mas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer recientes con 8 GB o mas; tambien puede ejecutarse en CPU para volumenes bajos.
- Opciones de despliegue: Transformers con PyTorch (probado con Transformers 4.57.6, `attn_implementation="sdpa"`); al ser un encoder ModernBERT, es compatible con backends de inferencia que soporten esa arquitectura. La model card no documenta integraciones especificas con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Halu | 307,5 M | 8.192 tokens | Deteccion de spans de alucinacion | Apache 2.0 | Hugging Face (transformers, safetensors) |
| LettuceDetect (baseline de la evaluacion) | no disponible en la informacion | no disponible en la informacion | Deteccion de alucinaciones | no disponible en la informacion | Hugging Face (KRLabsOrg) |
| Modelo base vllm-sr/Vela-1.0-Encoder-307M | 307 M (aproximado) | no disponible en la informacion | Encoder base | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa disponible es la de la tabla de benchmarks, donde Vela Halu supera a LettuceDetect en la mayoria de fuentes, con excepciones puntuales en PsiloQA (Span F1, Span R, Example F1 e IoU) y en RAGTruth (Span F1 y Span R). No se dispone de datos de otros detectores de alucinacion comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El soporte de evidencia no equivale a verdad factual: una respuesta puede estar respaldada por el contexto y ser falsa en el mundo real. Un resultado vacio no garantiza correccion.
- Respuestas que requieren aritmetica o razonamiento multi-paso mas alla del contexto explicito pueden marcarse incorrectamente como alucinadas.
- La longitud de entrada esta limitada a 8.192 tokens; contexto, pregunta y respuesta deben caber en ese limite, y la evaluacion usa truncamiento `only_first`.
- El umbral de decision usado en la evaluacion es 0,5 estricto; cambios en el umbral alteran precision y recall, por lo que conviene calibrarlo en produccion.
- No se declara una lista de idiomas soportados; el rendimiento multilingue solo esta documentado de forma agregada sobre PsiloQA.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera de los conjuntos citados.
- Es un modelo discriminativo: no genera texto ni soporta tool calling; debe combinarse con un LLM generativo en el pipeline.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento (KRLabsOrg/lettucedetect-code-hallucination y lettucedetect-prose-hallucination) para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Halu
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Coleccion de modelos Vela: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Dataset de alucinaciones en codigo: https://huggingface.co/datasets/KRLabsOrg/lettucedetect-code-hallucination
- Dataset de alucinaciones en prosa: https://huggingface.co/datasets/KRLabsOrg/lettucedetect-prose-hallucination
- Model card de LettuceDetect (baseline): https://huggingface.co/KRLabsOrg/lettucedect-v2-mmbert-base
