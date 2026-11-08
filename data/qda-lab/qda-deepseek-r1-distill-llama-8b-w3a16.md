# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W3A16 es un checkpoint cuantizado del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por qda-lab. Se trata de una destilación de razonamiento de DeepSeek-R1 sobre la arquitectura Llama-3.1-8B, que el autor ha comprimido a un esquema de cuantización de pesos de 3 bits con activaciones de 16 bits (W3A16) empleando el formato compressed-tensors. El resultado es un modelo de 8.030.261.248 parámetros (8B) cuyo repositorio ocupa 4,1 GB, es decir, aproximadamente la mitad del peso en disco de un checkpoint en bf16 equivalente.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica, sino del punto de operación concreto encontrado por un procedimiento de búsqueda automatizada descrito en el artículo "QDA: Closed-Loop Quantization Design with LLM Agents" (envío a MLSys 2027), con identificadores de búsqueda `r-87a8b25e` y hand-in `h5`. El autor publica las puntuaciones de exactitud del checkpoint exacto que evaluó, lo que permite reproducir la comparación frente al modelo base sin ambigüedad sobre qué ficheros se midieron.

El modelo está pensado para servirse directamente en vLLM, que es la librería declarada y el motor con el que se realizaron las evaluaciones (vLLM 0.27.1 sobre GH200). No se documentan en la información disponible ni la licencia, ni los idiomas, ni el pipeline de la tarea, por lo que los apartados correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B), destilado de razonamiento de DeepSeek-R1 |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W3A16 (pesos de 3 bits, activaciones de 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con compressed-tensors; compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, una destilación del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Llama-3.1-8B de Meta. La destilación transfiere el comportamiento de razonamiento de R1 (generación de cadenas de pensamiento largas antes de la respuesta final) a un transformer decoder-only denso de 8B parámetros, con el objetivo de obtener capacidades de razonamiento en un tamaño desplegable en hardware modesto.

Sobre ese modelo base, qda-lab aplica una cuantización de pesos a 3 bits manteniendo las activaciones en 16 bits, empaquetada en el formato compressed-tensors. El punto de cuantización no es manual: procede de una búsqueda cerrada con agentes LLM descrita en el artículo QDA (MLSys 2027, en revisión), con el identificador de búsqueda `r-87a8b25e` y hand-in `h5`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, y tampoco describe innovaciones de decodificación o atención. Toda esa información se considera no disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso: hereda el modo de razonamiento del destilado de DeepSeek-R1, con cadenas de pensamiento antes de la respuesta.
- Razonamiento matemático: evaluado en Math (AIME 2025 + HMMT Feb 2026) con una puntuación de 25,1.
- Razonamiento científico de nivel avanzado: evaluado en GPQA-Diamond con 42,5.
- Generación de código: evaluado en LiveCodeBench v6 con 32,4.
- Seguimiento de instrucciones: evaluado en IFEval con 60,2.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el modelo base es de razonamiento, pero la model card no documenta integración con agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible; solo se documenta el comportamiento de razonamiento heredado del modelo base.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición (AIME, HMMT) generando cadenas de pensamiento; su puntuación de 25,1 en la mezcla de ambos certámenes lo sitúa como herramienta de apoyo en entornos educativos o de verificación de soluciones, no como sustituto de un solver simbólico.
- Respuesta a preguntas científicas de nivel experto: con 42,5 en GPQA-Diamond, es adecuado para asistentes de estudio de posgrado o para triaje de preguntas técnicas donde se requiere razonamiento físico, químico o biológico, siempre con revisión humana.
- Generación y revisión de código en pipelines de CI: con 32,4 en LiveCodeBench v6, puede integrarse como paso de generación de parches o de explicación de fallos en un pipeline, sirviéndose en vLLM mediante `vllm serve` y consumiendo la API compatible con OpenAI.
- Evaluación de seguimiento de instrucciones en prototipos: su 60,2 en IFEval permite usarlo como componente de sistemas que requieren obedecer formatos y restricciones de salida, con la advertencia de que el cumplimiento no es total.
- Despliegue en hardware de gama media: al ocupar 4,1 GB en disco en W3A16, es viable en una única GPU consumer con suficiente VRAM para el contexto y el KV cache, lo que facilita prototipado local de un modelo de razonamiento de 8B.
- Reproducción de investigación en cuantización: al ser el checkpoint exacto evaluado en el artículo QDA, sirve para reproducir los resultados publicados con vLLM 0.27.1, semillas 17+j y muestreo `temperature=0.6, top_p=0.95`.
- Servicio de inferencia con vLLM: al cargarse directamente en vLLM sin conversión adicional, encaja en despliegues que ya usan ese motor y quieren reducir huella de memoria frente a un checkpoint bf16.

## Benchmarks y rendimiento

Resultados publicados por el autor del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estático, muestreo `{"temperature": 0.6, "top_p": 0.95}` y semillas 17+j:

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 25,1 |
| GPQA-Diamond | 42,5 |
| LiveCodeBench v6 | 32,4 |
| IFEval | 60,2 |
| Media | 40,0 |

No se han publicado en la información disponible resultados del modelo base sin cuantizar ni de otros checkpoints cuantizados con los que comparar directamente estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,1 GB, por lo que los pesos en W3A16 caben holgadamente en GPUs con 8 GB o más; a esa cifra hay que sumar el KV cache, que crece con la longitud de contexto y el número de secuencias concurrentes.
- GPU recomendadas: el autor evaluó sobre GH200; para producción con vLLM son adecuadas A100, H100 y L40S. Para desarrollo, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) son suficientes para los pesos y contextos moderados.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8-12 GB de VRAM según la longitud de contexto y el tamaño de lote; en 8 GB el margen para KV cache es reducido.
- Opciones de despliegue: vLLM es la vía documentada y soportada (`vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16`). No se documentan en la información disponible conversiones a GGUF, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; la model card solo indica batching estático en la evaluación, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W3A16 | 8B | no disponible | W3A16 (compressed-tensors) | no disponible | Hugging Face, carga directa en vLLM |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | no disponible | bf16/fp16 (original) | no disponible en la informacion | Hugging Face |
| unsloth/DeepSeek-R1-Distill-Llama-8B | 8B | no disponible | versiones cuantizadas y exportables a GGUF/vLLM | no disponible en la informacion | Hugging Face |

La comparación se limita a parámetros y formato, ya que no hay datos públicos en la información proporcionada sobre el rendimiento del modelo base sin cuantizar ni de la variante de Unsloth con los mismos benchmarks.

## Limitaciones y advertencias

- No se documenta la licencia del checkpoint ni la del modelo base en la información disponible; antes de un uso comercial hay que verificar la licencia de deepseek-ai/DeepSeek-R1-Distill-Llama-8B en su repositorio original.
- La cuantización a 3 bits introduce degradación respecto al modelo en bf16; la model card no publica la comparación directa, por lo que la magnitud de la pérdida no puede cuantificarse con los datos disponibles.
- Riesgo de alucinación inherente a los modelos de lenguaje y, en particular, a los destilados de razonamiento que generan cadenas de pensamiento largas: las conclusiones intermedias pueden ser plausibles pero incorrectas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no se documentan los idiomas soportados; no debe asumirse un rendimiento multilingüe sin evaluación propia.
- Longitud de contexto: no disponible; planificar el despliegue sin asumir una ventana concreta.
- El soporte está atado a vLLM y al formato compressed-tensors; otros motores de inferencia pueden no cargar el checkpoint sin conversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y procede de un artículo en revisión (MLSys 2027); conviene tratarlo como artefacto de investigación y validarlo antes de usarlo en producción.
- El muestreo recomendado por el autor es `temperature=0.6, top_p=0.95`; desviarse de esa configuración puede alterar sustancialmente los resultados frente a los benchmarks publicados.

## Enlaces

- [qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16 en Hugging Face](https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16)
- [deepseek-ai/DeepSeek-R1-Distill-Llama-8B en Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)
- [unsloth/DeepSeek-R1-Distill-Llama-8B en Hugging Face](https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B)
