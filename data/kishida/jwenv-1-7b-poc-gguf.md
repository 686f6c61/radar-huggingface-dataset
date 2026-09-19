# kishida/jwenv-1.7b-poc-gguf

## Resumen

`kishida/jwenv-1.7b-poc-gguf` es un modelo de clasificación derivado por ajuste fino de `Qwen/Qwen3-1.7B`, publicado por el usuario kishida en HuggingFace bajo licencia MIT y distribuido en formato GGUF. No es un modelo de propósito general: su tarea es responder preguntas de elección múltiple devolviendo, como salida, la distribución de probabilidad sobre los tokens correspondientes a las etiquetas de las opciones (A hasta H, ocho alternativas como máximo). El autor lo describe como un modelo que "se comporta como Jev", en referencia a un formato de concurso de preguntas y respuestas.

Técnicamente se apoya en la arquitectura transformer densa de Qwen3-1.7B, con 1.720.574.976 parámetros totales y un repositorio de 1,8 GB, lo que corresponde a la cuantización Q8_0 publicada (`jwenv-1.7b-poc-q8_0.gguf`). El modelo se invoca con una plantilla ChatML propia de Qwen (`<|im_start|>user ... <|im_end|><|im_start|>assistant`) que admite un campo opcional de contexto de fondo y una pregunta con sus opciones; la respuesta esperada es una única letra.

Su relevancia es limitada y muy específica: se trata de una prueba de concepto (el sufijo `poc` lo indica) con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin resultados de benchmarks publicados ni documentación sobre el dataset de entrenamiento. Resulta interesante como ejemplo de reutilización de un LLM pequeño como clasificador restringido, pero no como modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (ajuste fino de Qwen/Qwen3-1.7B para clasificación) |
| Parámetros totales | 1.720.574.976 (1,72 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens de forma nativa |
| Tipos de cuantización | GGUF; se publica el fichero `jwenv-1.7b-poc-q8_0.gguf` (Q8_0). Otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles (la model card está redactada en japonés; el modelo base Qwen3 es multilingüe) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 1,8 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Fecha de creación | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B`, un transformer denso de 1,72 mil millones de parámetros con atención causal estándar, y se ha ajustado para una tarea de clasificación con espacio de salida restringido al primer token de la respuesta. En lugar de generar texto libre, el modelo devuelve la probabilidad asociada a cada etiqueta de opción; con un muestreador convencional se selecciona el carácter (A-H) con mayor probabilidad. La plantilla de entrada admite un bloque `背景` (contexto) opcional, seguido de la pregunta y las opciones etiquetadas, y cierra con un bloque `<think></think>` vacío heredado del formato de razonamiento de Qwen3.

No hay información disponible sobre el dataset de entrenamiento: se desconoce el número de tokens utilizados, la composición de los datos, si se aplicaron técnicas de ajuste supervisado, RLHF, DPO u otras, y si se congelaron capas del modelo base o se entrenó por LoRA. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). La única innovación funcional descrita es el propio formato de clasificación por probabilidad de token sobre un máximo de ocho opciones.

## Capacidades

- Clasificación de elección múltiple con hasta ocho opciones etiquetadas de la A a la H.
- Salida como distribución de probabilidad por token de etiqueta, apta para usar directamente la probabilidad como puntuación de confianza.
- Acepta un contexto de fondo opcional antes de la pregunta, útil para preguntas que dependen de un texto previo.
- Formato de conversación compatible con la plantilla ChatML de Qwen3 (`<|im_start|>user` / `<|im_start|>assistant`).
- Plantilla preparada con bloque `<think></think>`, aunque no se documenta un modo de razonamiento explícito funcional.
- Ejecución local mediante llama.cpp y demo interactiva en el navegador a través de un Space de HuggingFace.
- No hay evidencia de soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; no se declara lista de idiomas soportados.

## Casos de uso

- Sistemas de preguntas y respuestas tipo concurso: el modelo encaja directamente en el formato de una pregunta con opciones discretas y devuelve la opción más probable, lo que permite construir un motor de trivia sin lógica adicional de parseo.
- Clasificación de intenciones con etiquetas fijas: definiendo hasta ocho intenciones como opciones A-H, se puede usar como clasificador de intenciones en un chatbot, aprovechando la probabilidad devuelta para activar un umbral de derivación a un humano.
- Anotación asistida de datasets: dado un ítem con un conjunto cerrado de categorías, el modelo propone la etiqueta más probable y una puntuación de confianza que permite priorizar la revisión manual de los casos dudosos.
- Enrutado de consultas en pipelines RAG: con las opciones como nombres de índice o de base de conocimiento, el modelo puede decidir a qué fuente dirigir una consulta, con la ventaja de que la decisión es una probabilidad y no texto libre que haya que interpretar.
- Corrección automática de exámenes tipo test: pasando el enunciado y las opciones como plantilla, el modelo puede generar una clave de respuestas candidata para contraste con la clave oficial o para detección de preguntas mal formuladas.
- Módulos de decisión en videojuegos o agentes conversacionales: al restringir la salida a un conjunto pequeño de acciones etiquetadas, se evita el problema de la salida inválida y se obtiene una política de decisión simple sobre un modelo de 1,7 B ejecutable en local.
- Etiquetado de moderación con categorías predefinidas: usando las opciones como categorías de contenido, se puede obtener una clasificación preliminar de bajo coste computacional en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, exactitud ni comparaciones con otros modelos, y la búsqueda web realizada no ha devuelto documentación técnica ni evaluación alguna del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB con la cuantización Q8_0 publicada (fichero de 1,8 GB más caché KV); aproximadamente 1,2-1,5 GB con una hipotética Q4_K_M; alrededor de 3,5 GB en F16; en torno a 7 GB en FP32 sin cuantizar.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para Q8_0, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100 (en estas dos últimas el modelo ocupa una fracción mínima de memoria y el cuello de botella será el lanzamiento de kernels, no la capacidad).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada compartida; también es viable en CPU.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cpp-python, llama-server), Ollama, LM Studio, KoboldCpp y el Space de demostración del autor. El soporte en vLLM o TGI para GGUF es limitado y no está confirmado para este modelo.
- Latencia y throughput estimados: no disponibles. Al tratarse de una tarea de clasificación de un solo token de salida, la latencia vendrá dominada por el preprocesado del prompt y no por la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| kishida/jwenv-1.7b-poc-gguf | 1,72 B | No confirmado (32.768 tokens heredados del base) | MIT | GGUF | Clasificación de opciones múltiples (A-H) |
| Qwen/Qwen3-1.7B | 1,72 B | 32.768 tokens nativos | Apache-2.0 | safetensors, GGUF | LLM generativo de propósito general |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | safetensors, GGUF | LLM instruct de propósito general |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,70 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | LLM instruct de propósito general |

La comparación directa de rendimiento no es posible porque no hay benchmarks publicados para el modelo objeto de la ficha. Frente a los tres alternativas, la diferencia relevante es de propósito: los otros modelos son generativos y requieren formateo de la respuesta para extraer una etiqueta, mientras que `jwenv-1.7b-poc-gguf` está especializado en devolver probabilidades sobre un conjunto cerrado de opciones, a cambio de perder cualquier capacidad generativa general.

## Limitaciones y advertencias

- Modelo de clasificación restringido: no está diseñado para generación de texto libre, código, matemáticas ni tareas abiertas; forzarlo a ello producirá salidas degeneradas.
- Límite estricto de ocho opciones (A-H); con más alternativas el comportamiento no está definido.
- Ausencia total de evaluación publicada: no hay métricas de precisión, ni validación por terceros, ni descargas o valoraciones que permitan estimar su calidad.
- Estado de prueba de concepto: el propio nombre del repositorio incluye `poc`, lo que indica que no debe considerarse un artefacto estable.
- Riesgo de alucinación y de falsa confianza: con un muestreador estándar el modelo devuelve siempre la opción más probable, aunque la probabilidad sea baja, sin mecanismo documentado para abstenerse.
- Idiomas no declarados: la model card está en japonés y no se especifica qué lenguas cubre el ajuste fino; el comportamiento fuera del japonés es incierto.
- Contexto no verificado: la ventana de 32.768 tokens es la del modelo base, pero no se confirma que el ajuste fino la preserve ni que el entrenamiento usara secuencias largas.
- Licencia MIT: permite uso comercial y modificación, pero el usuario debe verificar las condiciones del modelo base Qwen3-1.7B (Apache-2.0) y citar adecuadamente ambas licencias.
- Dependencia de un único mantenedor y de un repositorio sin actividad de la comunidad; no hay garantía de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kishida/jwenv-1.7b-poc-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Demo en el navegador (Space del autor): https://huggingface.co/spaces/kishida/jwenv-demo
- Fichero cuantizado Q8_0: https://huggingface.co/kishida/jwenv-1.7b-poc-gguf/blob/main/jwenv-1.7b-poc-q8_0.gguf
- No se han encontrado papers, blogs ni repositorios adicionales en la búsqueda web realizada.
