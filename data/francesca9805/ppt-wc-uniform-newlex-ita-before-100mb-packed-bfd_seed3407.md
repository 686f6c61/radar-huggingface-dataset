# francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo `goldfish-models/eng_latn_100mb`, un modelo monolingüe de inglés entrenado sobre 100 MB de texto dentro del proyecto Goldfish. El ajuste se ha realizado con la librería TRL (versión 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.5.1, y el autor lo publica como un artefacto derivado de un experimento de investigación, tal y como refleja la convención de nombres (referencias a tokenizador nuevo, "ita", "before-100mb" y una semilla concreta, 3407).

Se trata de un modelo muy pequeño: 86.508.288 parámetros reales declarados en los pesos `safetensors`, con un repositorio de 0,2 GB. La etiqueta de arquitectura es `gpt2`, por lo que se trata de un transformer decoder-only de tipo GPT-2, la familia empleada por los modelos Goldfish. No hay información publicada sobre la longitud de contexto, los idiomas soportados ni la licencia.

Su relevancia es limitada y fundamentalmente experimental: no tiene descargas ni "likes" registrados y la model card no documenta el conjunto de datos de entrenamiento, el número de tokens visto ni resultados de evaluación. Es útil como punto de partida para reproducir experimentos de ajuste fino con TRL, como referencia de comparación en estudios sobre tokenizadores y como ejemplo de modelo de escala diminuta desplegable en hardware muy modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta de arquitectura: `gpt2`) |
| Parámetros totales | 86.508.288 (dato real declarado en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | No disponible en la model card; el modelo base está entrenado sobre inglés (`eng_latn`) |
| Licencia | No disponible (la model card incluye el campo `licence: license`, sin concretar) |
| Formato de pesos | Safetensors (librería `transformers`) |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Método de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 0,2 GB |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, sin mecanismos MoE, SSM ni atención lineal declarados. Con 86,5 millones de parámetros, el modelo se sitúa en el rango de los transformers pequeños, por debajo de GPT-2 small (124 M) y en la órbita de distilgpt2 (82 M). El modelo base, `goldfish-models/eng_latn_100mb`, pertenece al proyecto Goldfish, que entrena modelos monolingües sobre corpus de 100 MB por idioma; el sufijo `eng_latn` indica que la variante base es de inglés.

El entrenamiento se ha realizado mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros relevantes. El nombre del modelo sugiere que el experimento está relacionado con la introducción de un tokenizador nuevo (`newlex`) y con un corte de entrenamiento anterior a los 100 MB (`before-100mb`), además de una semilla fija (3407), pero estos extremos no están confirmados en la documentación. El registro de Weights & Biases asociado pertenece al proyecto `new-tokenizers` de la Universidad de Groningen, lo que apunta a un contexto de investigación académica sobre tokenización.

## Capacidades

- Generación de texto autoregresiva en formato de conversación: la model card incluye un ejemplo de uso con `pipeline("text-generation")` que acepta mensajes con rol `user` y devuelve texto generado.
- Ajuste por instrucciones: al haber sido entrenado con SFT, el modelo espera entradas con formato conversacional, aunque no se documenta la plantilla exacta empleada.
- Generación condicionada por prompt: admite los parámetros habituales del pipeline de Transformers (`max_new_tokens`, `return_full_text`, etc.).
- Compatibilidad con Text Generation Inference (TGI) y con endpoints gestionados, según las etiquetas del repositorio.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No hay evidencia publicada de modo de razonamiento explícito (thinking mode), capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- No se han publicado evaluaciones de capacidades específicas (código, matemáticas, comprensión lectora).

## Casos de uso

- Reproducción de experimentos de ajuste fino: el modelo sirve como referencia para replicar un pipeline SFT con TRL sobre un modelo base pequeño, verificando versiones de librerías y el flujo de publicación en HuggingFace.
- Estudio de tokenizadores: dado el nombre del experimento (`newlex`) y el proyecto de W&B asociado, encaja en investigaciones que comparan el efecto de distintos vocabularios y tokenizadores en el rendimiento monolingüe.
- Generación de texto en entornos con recursos mínimos: con 86,5 M de parámetros, puede ejecutarse en CPU o en dispositivos embebidos donde no cabría un modelo de miles de millones de parámetros.
- Prototipado rápido de aplicaciones de texto: permite validar extremo a extremo una interfaz de generación (API, endpoint HTTP, TGI) antes de sustituir el modelo por uno mayor en producción.
- Generación de datos sintéticos a pequeña escala: útil para aumentar corpus de prueba o de validación en tareas de clasificación y análisis lingüístico, siempre con revisión humana posterior.
- Pruebas de integración y CI/CD: por su tamaño, se puede cargar en tests automatizados para verificar que el pipeline de inferencia, el tokenizador y el formateo de mensajes funcionan correctamente.
- Docencia y divulgación: ejemplo didáctico para explicar el ciclo completo de ajuste fino supervisado, desde el modelo base hasta la publicación con `safetensors`.
- Línea base en ablaciones: sirve como punto de comparación de bajo coste frente a variantes del mismo experimento (por ejemplo, con o sin el tokenizador nuevo, o con distintas semillas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y el repositorio no registra descargas ni actividad que permita inferir comparaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 86.508.288 parámetros: aproximadamente 346 MB en FP32, 173 MB en FP16/BF16, 87 MB en INT8 y 43 MB en INT4 (sin contar caché KV ni activaciones, que son reducidas a esta escala).
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de portátil con 4 GB o menos de VRAM.
- Cabe también en CPU y en dispositivos de borde (por ejemplo, Raspberry Pi o similares), aunque no se han publicado mediciones de latencia.
- GPUs de centro de datos (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para entrenamiento o para servir muchas réplicas en paralelo.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (etiqueta `text-generation-inference`), endpoints compatibles, y conversión a GGUF para llama.cpp u Ollama mediante las herramientas estándar de conversión (el autor no publica archivos GGUF).
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed3407` | 86.508.288 | No disponible | No disponible | HuggingFace, 0 descargas | Fine-tune SFT experimental, sin evaluación publicada |
| `goldfish-models/eng_latn_100mb` (modelo base) | No disponible en la información (el fine-tune declara 86,5 M) | No disponible | No disponible en la información | HuggingFace | Monolingüe inglés, entrenado sobre 100 MB de texto |
| distilgpt2 | 82 millones | 1.024 tokens | Apache-2.0 (según su repositorio público) | HuggingFace | Destilación de GPT-2, ampliamente usado como línea base pequeña |
| GPT-2 small | 124 millones | 1.024 tokens | Licencia MIT modificada (según su repositorio público) | HuggingFace | Referencia histórica de la familia GPT-2 |

No se dispone de comparaciones de rendimiento entre estos modelos dentro de la información proporcionada; los datos de licencia y contexto de distilgpt2 y GPT-2 small proceden de sus repositorios públicos y no de la model card analizada.

## Limitaciones y advertencias

- Licencia no especificada: la model card declara `licence: license` sin texto de licencia, por lo que no se puede confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas no documentados: aunque el modelo base es de inglés (`eng_latn`), el nombre del modelo incluye `ita`; no hay confirmación oficial del idioma o idiomas reales del ajuste.
- Sin datos de entrenamiento: se desconoce el corpus, su tamaño, su procedencia y si existió filtrado de contenido, por lo que no se pueden evaluar sesgos ni toxicidad de forma fundamentada.
- Riesgo de alucinación: al ser un modelo de 86,5 M de parámetros sin evaluación publicada, la generación de hechos incorrectos es esperable y no está cuantificada.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin antes verificarla experimentalmente.
- Sin benchmarks: no hay evidencia verificable de calidad en generación, razonamiento, código o matemáticas.
- Escala reducida: no es adecuado para tareas de razonamiento complejo ni como sustituto de modelos de miles de millones de parámetros en producción.
- Sin cuantizaciones oficiales: cualquier conversión a GGUF, INT8 o INT4 corre por cuenta del usuario y puede degradar la calidad de forma no medida.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Fecha de creación y actualización registrada como 2026-09-24, posterior a la fecha de publicación de las versiones de librerías citadas; conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-ita-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organización Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/43qkuxpp
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación del pipeline de generación de texto de Transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextGenerationPipeline
