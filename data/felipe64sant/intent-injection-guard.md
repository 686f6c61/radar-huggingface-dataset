# Felipe64Sant/intent-injection-guard

## Resumen

`Felipe64Sant/intent-injection-guard` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Felipe64Sant. Por su nombre y su pipeline (`text-classification`), está orientado a la detección de inyección de intenciones (*intent injection*), es decir, intentos de manipular un sistema conversacional o un agente para que ejecute acciones no previstas por su diseñador. Se distribuye como un modelo de la familia DeBERTa-v2, según la etiqueta `deberta-v2` del repositorio, con pesos en formato safetensors.

El modelo cuenta con 141.897.988 parámetros totales y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en el rango de los modelos encoder de tamaño medio, adecuado para inferencia de baja latencia en CPU o GPU modesta. La model card está generada automáticamente y no aporta información sobre datos de entrenamiento, licencia, idiomas ni evaluación, por lo que la mayor parte de las especificaciones debe marcarse como no disponible.

Su relevancia potencial reside en el creciente despliegue de agentes y asistentes basados en LLM, donde un clasificador ligero que filtre prompts maliciosos antes de llegar al modelo generativo puede actuar como capa de defensa. No obstante, la ausencia de documentación y de métricas publicadas impide validar su eficacia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer, según etiqueta del repositorio) |
| Parametros totales | 141.897.988 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La etiqueta `deberta-v2` del repositorio indica que el modelo parte de la arquitectura DeBERTa-v2, un transformer encoder con atención desacoplada y un mecanismo de atención relativa mejorado respecto a BERT. El número de parámetros (141,9 millones) es coherente con una variante base de esta familia. Al tratarse de un modelo de clasificación de texto, la cabeza de salida sería una capa de clasificación sobre el token `[CLS]` o equivalente, con un número de etiquetas no especificado en la información disponible.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, si se aplicó ajuste fino supervisado, RLHF o DPO, ni sobre hiperparámetros o procedimiento de entrenamiento. La model card generada automáticamente deja todos estos apartados como `[More Information Needed]`. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto binaria o multiclase (número de etiquetas no disponible), presumiblemente orientada a detectar intentos de inyección de intenciones en prompts.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad declarada con `text-embeddings-inference` y `endpoints_compatible`, lo que facilita su despliegue como endpoint de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step, al ser un modelo encoder de clasificación.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Filtro de seguridad previo a un LLM: el clasificador se coloca delante de un modelo generativo para etiquetar prompts sospechosos de inyección de intenciones y bloquearlos antes de que lleguen al modelo principal, reduciendo el riesgo de manipulación.
- Moderación de entradas en asistentes conversacionales: se ejecuta sobre cada mensaje del usuario en un chatbot para detectar intentos de secuestro de instrucciones y derivar a revisión humana.
- Protección de agentes con acceso a herramientas: antes de que un agente ejecute una llamada a una API o a un sistema interno, el clasificador valida que la intención del prompt sea legítima.
- Pipeline de CI/CD para aplicaciones LLM: se integra como test automatizado que verifica que un conjunto de prompts maliciosos conocidos es detectado, actuando como regresión de seguridad.
- Enrutado de consultas en sistemas RAG: clasifica la intención de la consulta para decidir si se procesa normalmente o se rechaza por riesgo de manipulación.
- Despliegue en entornos con recursos limitados: al ser un encoder de 141,9 M de parámetros, puede servirse en CPU o en GPU consumer con latencia baja, lo que lo hace apto para filtrado en tiempo real en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,57 GB solo para pesos (141,9 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1,5 GB.
- VRAM estimada en fp16: aproximadamente 0,28 GB para pesos; en int8, unos 0,14 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, T4 o superiores son suficientes. Para lotes grandes, A10G o A100 aportan margen.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (según etiqueta del repositorio), endpoints compatibles de Hugging Face; también es convertible a ONNX o a GGUF para llama.cpp/Ollama, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Felipe64Sant/intent-injection-guard | 141,9 M | no disponible | Clasificación de texto (detección de inyección) | no disponible | Hugging Face |
| microsoft/deberta-v2-base | ~139 M | 512 tokens | Encoder base, ajustable a clasificación | MIT | Hugging Face |
| ProtectAI/deberta-v3-base-prompt-injection | ~184 M | 512 tokens | Detección de prompt injection | Apache 2.0 | Hugging Face |
| Meta Llama Prompt Guard 2 (86M) | 86 M | 512 tokens | Detección de jailbreak e inyección | Llama 4 Community License | Hugging Face |

La comparativa con `microsoft/deberta-v2-base` es la más directa por arquitectura y tamaño; los modelos de ProtectAI y Llama Prompt Guard son alternativas funcionales para la misma tarea de detección de inyección, aunque con licencias y documentación más completas. No se dispone de datos de rendimiento del modelo evaluado para comparar métricas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al no conocerse el corpus de entrenamiento, no es posible evaluar sesgos de dominio, idioma o demográficos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin métricas publicadas que permitan cuantificarlos.
- No se especifican los idiomas soportados; un clasificador entrenado en un idioma concreto puede degradarse en otros.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; es un bloqueo importante para producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está generada automáticamente, lo que sugiere ausencia de validación por parte de la comunidad.
- No hay información sobre el número de etiquetas de salida ni sobre el formato esperado de entrada, lo que dificulta su integración sin inspeccionar los archivos del repositorio.
- Al ser un encoder de clasificación, no genera texto ni razona; su uso debe limitarse a tareas de etiquetado.

## Enlaces

- Hugging Face: https://huggingface.co/Felipe64Sant/intent-injection-guard
- Paper de referencia de DeBERTa (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentación de transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
