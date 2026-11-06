# NousResearch/Arete-27B

## Resumen

Arete-27B es un modelo de lenguaje de 27.356.728.560 parámetros desarrollado por Nous Research mediante posentrenamiento por ajuste fino supervisado (SFT) sobre el modelo Qwen3.8-27B de Alibaba. Su objetivo declarado no es mejorar la capacidad bruta del modelo base, sino modificar el sesgo de valores con el que se distribuye: Nous Research documenta negativas, evasivas y respuestas enmarcadas en la narrativa del Partido Comunista Chino en temas políticamente sensibles del modelo original, y entrena para alterar ese comportamiento en siete categorías de valores (libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad y vigilancia de datos, democracia y política medioambiental).

El modelo conserva la arquitectura y el tamaño del base, con un contexto de entrenamiento de 64k tokens, y se publica bajo licencia Apache 2.0. Es relevante en el momento actual porque ejemplifica una práctica creciente: usar modelos abiertos como materia prima para realinear valores sin reentrenar desde cero, y porque Nous Research publica junto al modelo la metodología de evaluación y el conjunto de evaluación retenido, lo que permite auditar el cambio de comportamiento de forma reproducible.

La ficha se basa en la model card del autor y en los metadatos de Hugging Face; los datos no publicados (idiomas, benchmarks de capacidad general, resultados detallados) se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; tag `qwen3_5` en Hugging Face), sin modificación arquitectónica |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 54,7 GB) |

## Arquitectura y entrenamiento

Arete-27B es un transformer denso de 27B parámetros que hereda la arquitectura de Qwen3.8-27B sin ninguna modificación estructural. El posentrenamiento consistió exclusivamente en ajuste fino supervisado (SFT): sin RL, sin optimización de preferencias y sin cambios de arquitectura. Se entrenaron todos los pesos del modelo de lenguaje; el codificador de visión quedó congelado porque los datos de entrenamiento son solo texto, y la cabeza de predicción multi-token (MTP) se desactivó durante el entrenamiento.

El conjunto de datos se generó a partir de 20.000 prompts construidos mediante un pipeline con deduplicación obligatoria, verificados contra el conjunto de evaluación retenido para eliminar solapamiento. Las respuestas del profesor (el modelo abierto Inkling, elegido por su evaluación positiva en las categorías objetivo y para evitar restricciones de destilación ilícita) se recogieron junto a las del modelo de partida. El entrenamiento usó aproximadamente 52,8 millones de tokens a 64k de contexto, sin empaquetado de secuencias, durante 2 épocas y 1.202 pasos (checkpoint evaluado: paso 1.202), con AdamW (betas 0,9/0,98, épsilon 1e-5, weight decay 0,1, clipping de gradiente 1,0), batch de 48, warmup lineal de 1e-6 a 1e-5 en 120 pasos y decaimiento coseno hasta 1e-6, en bf16 con pesos maestros y estados del optimizador en fp32 y paralelismo tensorial de 4. La pérdida cayó durante el warmup y se estabilizó cerca de 1,0 al final de la primera época, bajando a ~0,8 al inicio de la segunda; la norma del gradiente pasó de ~32 a ~1,4 tras el warmup.

## Capacidades

- Generación de texto conversacional y asistencia general, heredadas del modelo base Qwen3.8-27B.
- Trabajo agéntico: el autor lo destina explícitamente a asistencia general y tareas de agente, con contexto de 64k tokens.
- Razonamiento y recuperación factual sobre temas políticos e institucionales, con el sesgo de valores modificado en las siete categorías entrenadas.
- Capacidad multimodal latente: el codificador de visión del base se conserva congelado, aunque el posentrenamiento fue solo texto y no se documenta su comportamiento tras el ajuste.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Asistencia general con alineación de valores occidental: el modelo responde sobre temas políticos e institucionales adoptando el marco de valores entrenado (libertad de expresión, democracia, privacidad), lo que lo hace adecuado para productos dirigidos a usuarios que esperan ese encuadre.
- Investigación sobre alineación de valores: comparar sus respuestas con las de Qwen3.8-27B sobre el conjunto `Alignment_Eval` permite medir de forma reproducible cuánto cambia un modelo tras un SFT selectivo y qué se conserva de la capacidad general.
- Evaluación de sesgo y propaganda: usar el modelo como caso de estudio en auditorías de contenido, midiendo la tasa de respuestas con propaganda (el autor reporta una reducción del 22% al 0,9%).
- Despliegue en pipelines agénticos de contexto largo: con 64k tokens de contexto puede mantener historiales extensos y documentos de referencia en tareas de varios pasos.
- Generación de contenido editorial y divulgativo: redacción de material sobre política, economía y medio ambiente donde el encuadre institucional del base resultaría inadecuado.
- Base para ajustes posteriores por parte de la comunidad: al ser Apache 2.0 y safetensors, sirve como punto de partida para nuevos posentrenamientos con otros valores u objetivos, replicando la metodología publicada.
- Docencia y formación en ética de IA: ilustrar cómo el SFT puede alterar sesgos sin tocar la arquitectura, con datos de entrenamiento y evaluación documentados.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de su evaluación de alineación propia (803 prompts, juez LLM Grok 4.7 con rubric fija, sin indicar al juez qué modelo escribió cada respuesta):

| Metrica | Qwen3.8-27B (base) | Arete-27B |
|---|---|---|
| Fact score (0-5) | 2,32 | 2,98 |
| Respuestas con propaganda | 22% | 0,9% |
| Mejora por categoria de valor | — | sostenida en las 7 categorías |

El autor afirma que la mejora se mantuvo sin regresión significativa en los benchmarks de capacidad general y agénticos que ejecutó, pero no publica esos resultados en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~55 GB de pesos, más overhead de KV cache; en la práctica requiere 2 GPU de 40 GB o una de 80 GB para contexto largo.
- Cuantización: no se documentan tipos soportados; en GGUF a 4 bits el modelo rondaría los 14-15 GB, lo que lo haría viable en una RTX 4090 (24 GB) con contexto moderado, pero esta estimación no está confirmada por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2×A100 40 GB) para bf16 con contexto completo de 64k.
- GPU de consumo: una RTX 4090 de 24 GB solo cabría con cuantización agresiva y contexto reducido; no hay datos oficiales de despliegue en consumer.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen, es compatible con vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF; no se confirma soporte explícito en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B | 27,36B | 64k | SFT de valores sobre Qwen3.8-27B | Apache 2.0 | Hugging Face |
| Qwen3.8-27B | 27B | 64k (heredado) | Modelo base de Alibaba | según Alibaba | Hugging Face |
| Modelos de 27-32B de la familia Qwen/Llama | 27-32B | variable | Asistencia general | variable | Hugging Face |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: el autor solo compara contra su propio modelo base en la evaluación de alineación. Para capacidad general, contexto y rendimiento frente a otros modelos de 27B no hay datos publicados en la información proporcionada.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente una orientación de valores concreta (occidental); no es neutral y puede resultar inadecuado para usuarios o jurisdicciones que esperen otro encuadre.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad general más allá del fact score de la evaluación propia (2,98/5), que mide hechos requeridos sobre temas concretos, no veracidad global.
- El ajuste se hizo solo con texto; el comportamiento del codificador de visión congelado tras el SFT no está evaluado.
- Idiomas soportados no documentados; el conjunto de entrenamiento y evaluación es en inglés, por lo que el comportamiento en castellano u otras lenguas no está validado.
- La evaluación la realiza el propio autor con un juez LLM (Grok 4.7) y un rubric desarrollado sobre un piloto de 25 prompts; existe riesgo de sesgo del evaluador y de sobreajuste al rubric.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B; conviene verificar las condiciones del modelo base de Alibaba antes de un despliegue comercial.
- Sin datos de benchmarks estándar ni de rendimiento en producción; no se recomienda asumir capacidades no verificadas.
- El modelo se publicó con 0 descargas y 7 likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NousResearch/Arete-27B
- Blog post del autor: https://nousresearch.com/arete
- Conjunto de evaluación de alineación: https://huggingface.co/datasets/NousResearch/Alignment_Eval
- Organización Nous Research en Hugging Face: https://huggingface.co/NousResearch
- Releases de Nous Research: https://nousresearch.com/releases
- Web de Nous Research: https://nousresearch.com/
- Nous Portal (modelos e inferencia): https://portal.nousresearch.com/models
