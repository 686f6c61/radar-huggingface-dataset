# Audante/gemma-4-12B-it-qat-MLX-4bit-g64

## Resumen

Audante/gemma-4-12B-it-qat-MLX-4bit-g64 es una conversión no oficial a MLX del modelo google/gemma-4-12B-it, en su variante QAT (quantization-aware training) publicada por Google como gemma-4-12B-it-qat-q4_0-unquantized. El autor, Audante, ha aplicado `mlx_lm.convert` con cuantización de 4 bits y grupos de 64 sobre todas las capas cuantizables, manteniendo las normas en bf16. El resultado es un checkpoint de 11.907.350.272 parámetros (unos 11,9 mil millones) en formato safetensors compatible con la librería mlx, con un tamaño de repositorio de 6,7 GB.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de la familia Gemma 4 de 12B en hardware Apple Silicon con un consumo de memoria muy contenido, gracias a la cuantización de 4 bits. Por otro, al derivar de un checkpoint QAT de Google, el proceso de cuantización se realizó durante el entrenamiento, lo que en teoría reduce la pérdida de calidad respecto a una cuantización post-hoc. Es importante subrayar que se trata de una conversión de la comunidad, no de un lanzamiento oficial, y que solo incluye el modelo de lenguaje: los pesos de visión y audio han sido descartados.

La información disponible sobre el modelo base es escasa en esta ficha: no se detallan la longitud de contexto, los idiomas soportados ni los resultados de benchmarks. La licencia declarada es Apache 2.0, heredada del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según el identificador `gemma4_unified`); detalles no disponibles |
| Parámetros totales | 11.907.350.272 (~11,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits con grupo de 64 en capas cuantizables; normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint es una conversión del modelo google/gemma-4-12B-it-qat-q4_0-unquantized, revisión `b6ed86275a6a5735884e208bfed95b445a684ca2`, que a su vez es la variante QAT del modelo instructivo Gemma 4 de 12B parámetros de Google. La arquitectura concreta no se detalla en la información disponible; el tag `gemma4_unified` sugiere una implementación unificada dentro del ecosistema MLX, pero no se especifican capas, mecanismos de atención ni innovaciones como decodificación especulativa o atención lineal.

El proceso de conversión se realizó con mlx-lm 0.32.2 mediante el comando `mlx_lm.convert -q --q-bits 4 --q-group-size 64`. Todas las capas cuantizables se redujeron a 4 bits con grupos de 64, mientras que las capas de normalización se mantuvieron en bf16. No hubo reentrenamiento ni ajuste fino: es una cuantización pura sobre los pesos QAT del modelo fuente. El `processor_config.json` se copia del original, y el autor indica que los pesos de visión y audio se han omitido, por lo que el resultado es exclusivamente texto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto e instrucciones en modo chat, heredadas del modelo instructivo Gemma 4 12B.
- Razonamiento y respuesta a preguntas de propósito general, en la medida en que lo permita el modelo base.
- Generación de código y matemáticas: capacidad esperable por la familia del modelo, aunque no se documenta de forma explícita en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Visión y audio: no soportados en esta conversión, ya que los pesos correspondientes fueron excluidos.
- Ejecución en Apple Silicon mediante MLX, con pesos en 4 bits.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con mlx-lm en equipos Apple Silicon con memoria unificada suficiente, ofreciendo un asistente de chat privado sin conexión a servicios externos. El tamaño de 6,7 GB del repositorio lo hace manejable en portátiles de gama alta.
- Prototipado rápido de aplicaciones de IA generativa: al estar en formato MLX y ocupar poco espacio, permite iterar sobre prompts y flujos de conversación en un entorno de desarrollo local antes de migrar a infraestructura de producción.
- Generación de texto en pipelines de documentación: el modelo puede redactar borradores, resumir y reescribir contenido técnico en un flujo por lotes ejecutado en un Mac Studio o MacBook Pro, sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la pérdida de calidad de una cuantización 4-bit QAT frente al modelo original en tareas de razonamiento y generación, dentro de un banco de pruebas con MLX.
- Educación e investigación: útil para estudiar el comportamiento de modelos de 12B cuantizados en hardware de consumo, analizar la degradación por grupo de cuantización o experimentar con técnicas de decodificación.
- Clasificación y extracción de información en local: con prompts adecuados, el modelo puede etiquetar textos, extraer entidades o responder preguntas sobre documentos, manteniendo los datos en el dispositivo.
- Desarrollo de asistentes especializados de nicho: ajustando el prompt de sistema, puede adaptarse a dominios concretos (soporte técnico interno, ayuda a la redacción) siempre que la calidad del modelo base sea suficiente para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al tratarse de un checkpoint de 4 bits con 11,9 B de parámetros, los pesos ocupan aproximadamente 6-7 GB. Conviene reservar entre 8 y 12 GB de memoria unificada para pesos, caché KV y overhead del runtime, dependiendo de la longitud de contexto.
- Hardware objetivo: Apple Silicon con MLX (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No está pensado para GPU NVIDIA ni para CPU x86 con CUDA.
- ¿Cabe en hardware de consumo? Sí, en equipos Apple con al menos 16 GB de memoria unificada; en configuraciones de 8 GB el margen es muy ajustado y puede requerir contextos cortos.
- Opciones de despliegue: mlx-lm (librería declarada), con soporte de conversión e inferencia mediante `mlx_lm.generate` y servidores compatibles con MLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato específico de MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/gemma-4-12B-it-qat-MLX-4bit-g64 | ~11,9 B | no disponible | 4 bits, grupo 64 | Apache 2.0 | Hugging Face, MLX |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~11,9 B | no disponible | QAT q4_0 (sin cuantizar en el repo) | Apache 2.0 | Hugging Face, oficial |
| google/gemma-4-12B-it | ~11,9 B | no disponible | bf16/fp16 (completo) | Apache 2.0 | Hugging Face, oficial |

La comparación se limita a las variantes del mismo modelo base, ya que la información disponible no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros autores. La diferencia principal entre las tres entradas es el formato y el grado de cuantización: la versión de Audante está lista para MLX en 4 bits, la QAT de Google conserva los pesos sin cuantizar para permitir conversiones posteriores, y la versión estándar es el checkpoint completo en precisión original.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor lo indica explícitamente y no hay garantía de soporte por parte de Google.
- Solo texto: los pesos de visión y audio del modelo base han sido eliminados, por lo que no puede procesar imágenes ni audio.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web es esperable que herede sesgos sociales y culturales del corpus original.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones específicas para esta conversión.
- Sin datos de benchmarks ni de evaluación de la degradación por cuantización: no es posible cuantificar la pérdida de calidad frente al modelo original.
- Idiomas y longitud de contexto no documentados: conviene verificar el comportamiento real antes de usarlo en producción multilingüe o con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y las políticas de uso de Google para la familia Gemma.
- Dependencia del ecosistema MLX: no es portable directamente a otros runtimes sin una nueva conversión.
- Repositorio con muy poca tracción (18 descargas, 0 likes) y creado recientemente: menor probabilidad de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audante/gemma-4-12B-it-qat-MLX-4bit-g64
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Checkpoint QAT de origen: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized (revisión `b6ed86275a6a5735884e208bfed95b445a684ca2`)
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
