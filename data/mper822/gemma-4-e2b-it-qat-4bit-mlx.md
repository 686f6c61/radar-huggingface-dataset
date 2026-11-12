# mper822/gemma-4-e2b-it-qat-4bit-mlx

## Resumen

Gemma 4 E2B (QAT) 4-bit MLX es una conversión cuantizada del checkpoint instruct de Gemma 4 E2B de Google, publicada por el usuario mper822 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text (procesa imagen y texto, y según la model card también dispone de torre de audio) convertido al formato MLX para su ejecución en hardware Apple Silicon mediante la librería `mlx_vlm`. El checkpoint parte de la versión oficial entrenada con quantization-aware training (QAT) de Google, lo que permite una cuantización a 4 bits con menor pérdida de calidad que una cuantización post-entrenamiento convencional.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo multimodal de aproximadamente 5.100 millones de parámetros en equipos con memoria unificada (Mac con Apple Silicon), manteniendo las torres de visión y audio en bf16 mientras el modelo de lenguaje se comprime a 4 bits con cuantización afín y tamaño de grupo 64. El repositorio ocupa 3,6 GB y declara soporte para cinco idiomas: inglés, español, portugués, ruso y chino.

El autor reporta una evaluación privada de 70 prompts sobre asistencia (enseñanza, planificación y uso de herramientas en cinco idiomas) en la que esta conversión superó 54 de 70 frente a los 47 de la conversión comunitaria de 4 bits del checkpoint sin QAT, con el mismo conjunto de prompts y arnés de evaluación. No se dispone de datos públicos de benchmarks estándar en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text; incluye torre de visión y torre de audio según la model card) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64; torres de visión y audio en bf16 |
| Idiomas soportados | en, es, pt, ru, zh |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it`, un checkpoint instruct de la familia Gemma 4 de Google. La conversión parte de `mlx-community/gemma-4-E2B-it-qat-bf16`, es decir, de la versión QAT en bf16 publicada por la comunidad, y se transforma a MLX 4-bit mediante el comando `python -m mlx_vlm convert --hf-path mlx-community/gemma-4-E2B-it-qat-bf16 --mlx-path . -q --q-bits 4 --q-group-size 64`. La cuantización se aplica únicamente al modelo de lenguaje; las torres de visión y audio permanecen en bf16, lo que preserva la calidad de las entradas multimodales a costa de mantener esos componentes sin comprimir.

El entrenamiento con quantization-aware training (QAT) es la innovación técnica clave: Google entrena el checkpoint simulando la cuantización durante el entrenamiento, de modo que los pesos quedan preparados para operar a baja precisión. Esto explica que el autor reporte un rendimiento superior (54/70 frente a 47/70 en su evaluación privada) respecto a la conversión 4-bit del checkpoint sin QAT, con el mismo tamaño y velocidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, español, portugués, ruso y chino.
- Comprensión de imágenes (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Procesamiento de audio según la model card (torre de audio en bf16), aunque no se detallan las tareas concretas soportadas.
- Uso de herramientas (tool use) en cinco idiomas, según la evaluación privada del autor.
- Planificación y asistencia en tareas de enseñanza, según el conjunto de evaluación reportado.
- Razonamiento multi-step y soporte de agentes: no confirmado explícitamente en la información disponible.
- Capacidades matemáticas y de código: no confirmadas en la información disponible.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo puede ejecutarse íntegramente en Apple Silicon gracias al formato MLX y su tamaño de 3,6 GB, lo que permite desplegar un asistente privado sin conexión a servicios en la nube.
- Análisis de documentos con imágenes: al combinar entrada de imagen y texto, puede extraer información de capturas, diagramas o formularios y responder preguntas sobre ellos en inglés o español.
- Soporte multilingüe para atención al cliente: cubre cinco idiomas (en, es, pt, ru, zh), adecuado para equipos que atienden usuarios en mercados hispanohablantes, lusófonos, rusohablantes y chinos.
- Prototipado de agentes con tool calling: la evaluación del autor incluye uso de herramientas en cinco idiomas, lo que lo hace apto para experimentar con flujos de llamada a funciones en local antes de pasar a producción.
- Aplicaciones de accesibilidad con audio: la torre de audio en bf16 permite experimentar con entradas de voz además de texto e imagen, útil para interfaces de asistencia por voz.
- Educación y planificación: el conjunto de evaluación del autor se centra en enseñanza y planificación, por lo que encaja en asistentes de estudio o generación de planes estructurados.
- Inferencia en portátiles con memoria unificada: al ocupar 3,6 GB en disco y mantener el modelo de lenguaje en 4 bits, es viable en Mac con 16 GB o más de memoria unificada, aunque este dato no está confirmado en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la evaluación privada del autor:

| Evaluación | Este modelo (QAT 4-bit MLX) | Conversión comunitaria 4-bit sin QAT |
|---|---|---|
| Asistente, 70 prompts (enseñanza, planificación, tool use, 5 idiomas) | 54/70 | 47/70 |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 3,6 GB en disco; en ejecución se requiere memoria adicional para el contexto y las torres de visión/audio en bf16. La cifra exacta de memoria en inferencia no está disponible.
- Hardware recomendado: equipos Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada, dado que el formato es MLX.
- GPU consumer: no aplica directamente, ya que MLX está diseñado para Apple Silicon; no se ha confirmado compatibilidad con GPU NVIDIA o AMD en la información disponible.
- Opciones de despliegue: `mlx_vlm` (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica que la velocidad es la misma que la conversión comunitaria de 4 bits del checkpoint sin QAT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mper822/gemma-4-e2b-it-qat-4bit-mlx | 5.104.297.539 | no disponible | gemma | safetensors MLX | QAT 4-bit, torres visión/audio bf16, 54/70 en eval privada |
| mlx-community/gemma-4-E2B-it-qat-bf16 | no disponible | no disponible | gemma | safetensors MLX (bf16) | Checkpoint base QAT en bf16 del que deriva esta conversión |
| Conversión comunitaria 4-bit del checkpoint sin QAT | no disponible | no disponible | gemma | MLX 4-bit | 47/70 en la misma eval privada del autor |
| google/gemma-4-E2B-it | no disponible | no disponible | gemma | safetensors | Modelo base instruct original de Google |

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de un modelo de Google, hereda los sesgos del corpus de entrenamiento original, no detallado.
- Alucinación: no se reportan métricas de fiabilidad factual; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de razonamiento o uso de herramientas.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas: solo se declaran cinco idiomas (en, es, pt, ru, zh); el rendimiento en otros idiomas no está garantizado.
- Licencia: sujeta a los Gemma Terms of Use (https://ai.google.dev/gemma/terms), con posibles restricciones para uso comercial que deben revisarse antes de producción.
- Formato: al ser una conversión MLX, está atada al ecosistema Apple Silicon y a `mlx_vlm`; no es portable directamente a otros runtimes sin reconversión.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; la evaluación reportada es privada y no verificable de forma independiente.
- Componentes sin cuantizar: las torres de visión y audio permanecen en bf16, por lo que el consumo de memoria en tareas multimodales será mayor que el sugerido por el tamaño del modelo de lenguaje cuantizado.

## Enlaces

- Hugging Face: https://huggingface.co/mper822/gemma-4-e2b-it-qat-4bit-mlx
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint QAT bf16 de origen: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-bf16
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
