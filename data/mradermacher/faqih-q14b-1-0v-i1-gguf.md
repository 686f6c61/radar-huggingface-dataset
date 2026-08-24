# mradermacher/Faqih-Q14b-1.0V-i1-GGUF

## Resumen

Faqih-Q14b-1.0V-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo hozifa1/Faqih-Q14b-1.0V, un asistente conversacional especializado en fiqh (jurisprudencia islámica) y razonamiento en árabe. El modelo base parte de la arquitectura Qwen2.5 de 14.770 millones de parámetros y fue ajustado mediante supervisión fina (SFT) sobre el dataset hozifa1/faqih_sft_dataset. La cuantización la realiza mradermacher, quien publica tanto versiones estáticas como con imatrix, orientadas a facilitar el despliegue en entornos con recursos limitados.

Este modelo resulta relevante para el creciente ecosistema de IA islámica en árabe, un área con poca oferta de modelos abiertos de esta calidad y tamaño. Al estar basado en Qwen2.5, hereda capacidades de razonamiento y generación de texto del modelo base, pero su especialización en fiqh lo diferencia de los modelos generalistas. La licencia Apache 2.0 permite su uso comercial y su distribución, lo que facilita su adopción en aplicaciones educativas y de consulta.

La versión i1 (imatrix) incluye un archivo de calibración de 0.1 GB que permite generar cuantizaciones propias de mayor calidad. Los archivos GGUF resultantes se pueden ejecutar con llama.cpp, Ollama u otros motores compatibles, y están pensados para entornos de producción en los que se busca un equilibrio entre tamaño, velocidad y fidelidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only) |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5 14B) |
| Tipos de cuantizacion | imatrix; quants disponibles: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base hozifa1/Faqih-Q14b-1.0V se construye sobre Qwen2.5, una arquitectura transformer decoder-only con atención multi-cabeza y normalización RMSNorm. La versión de 14B cuenta con 40 capas y 40 cabezas de atención, con un tamaño de capa oculta de 5120. El entrenamiento del modelo base no está documentado en la información disponible, pero se sabe que fue ajustado mediante supervisión fina (SFT) sobre el dataset hozifa1/faqih_sft_dataset, un corpus orientado a fiqh y razonamiento en árabe.

La cuantización GGUF con imatrix se realiza aplicando el algoritmo de cuantización con matriz de importancia, que optimiza los pesos según su relevancia estadística en el dataset de calibración. Esto permite reducir el tamaño del modelo sin perder demasiada precisión, y ofrece una amplia gama de niveles de cuantización (desde IQ1_S de ~1 bit hasta Q6_K de ~6 bits) para adaptarse a distintos requisitos de memoria y fidelidad.

## Capacidades

- Generación de texto en árabe con estilo conversacional, orientada a consultas sobre fiqh y jurisprudencia islámica.
- Razonamiento multi-paso y respuesta a preguntas complejas sobre temas religiosos y jurídicos.
- Soporte para conversación multi-turno (chat) gracias a la arquitectura Qwen2.5.
- No se han documentado capacidades de tool calling, agentes o multimodales en la información disponible.
- Capacidades multilingües limitadas al árabe, aunque el modelo base Qwen2.5 soporta múltiples idiomas; la especialización SFT puede reducir su rendimiento fuera del árabe.

## Casos de uso

- Consultas de fiqh y jurisprudencia islámica: el modelo puede responder preguntas sobre normas de culto, transacciones, matrimonio o herencia, proporcionando explicaciones razonadas en árabe. Su especialización lo hace más fiable que un modelo generalista en este dominio.
- Asistente educativo para estudiantes de ciencias islámicas: se puede integrar en plataformas de e-learning para explicar conceptos, resolver dudas y ofrecer material de estudio con razonamiento paso a paso.
- Herramienta de investigación para juristas y académicos: permite buscar referencias jurídicas, comparar opiniones de escuelas o redactar resúmenes de textos de fiqh, aunque se debe verificar la exactitud con fuentes primarias.
- Chatbots de atención al cliente en organizaciones islámicas: por ejemplo, en mezquitas, ONG o servicios de consultoría halal, donde se requiera responder preguntas frecuentes sobre normativa islámica.
- Generación de contenido para medios y publicaciones en árabe: redacción de artículos, respuestas a preguntas de lectores o guiones de vídeo sobre temas religiosos, siempre con supervisión humana.
- Desarrollo de aplicaciones de razonamiento en árabe: como base para sistemas de pregunta-respuesta en otras áreas, dado su robustez lingüística y capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en tareas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Para un modelo de 14,77B, los requisitos aproximados son:
  - Q4_K_M: ~9-10 GB de VRAM en GPU.
  - Q5_K_M: ~11-12 GB.
  - Q6_K: ~13-14 GB.
  - IQ1_S: ~3-4 GB (muy baja calidad, solo para pruebas).
- GPU recomendadas: tarjetas con 10-16 GB de VRAM, como RTX 3080/3090, RTX 4070/4080, A10, A100 40GB (para las versiones más pesadas). Para CPU, se puede ejecutar con llama.cpp usando 16-32 GB de RAM.
- Compatible con consumer GPU: sí, las cuantizaciones Q4_K_M y superiores caben en GPUs de 10-12 GB (p.ej., RTX 3080, RTX 4070 Ti).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier motor compatible con GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia, el modelo base es una especialización de Qwen2.5 14B, que en su versión original presenta un rendimiento superior a modelos de la misma talla como Llama 3 8B o Mistral 7B en tareas generales, pero la especialización en fiqh limita su comparabilidad. No se conocen otros modelos abiertos de tamaño similar específicos de jurisprudencia islámica en árabe.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Faqih-Q14b-1.0V (base) | 14,77B | no disponible | Fiqh, arabe | Apache 2.0 |
| Qwen2.5 14B | 14,77B | 32K (estandar) | Generalista | Apache 2.0 |
| Llama 3 8B | 8B | 8K | Generalista | Llama 3 Community License |

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas sobre fiqh. No debe usarse como fuente jurídica autorizada sin verificación por expertos.
- Sesgos potenciales: el dataset de entrenamiento puede reflejar interpretaciones específicas de una escuela jurídica o corriente, lo que limita su neutralidad. No se han publicado análisis de sesgo.
- Limitación de idioma: el modelo está especializado en árabe; su rendimiento en otros idiomas probablemente se degrade notablemente.
- Longitud de contexto no documentada: se hereda de Qwen2.5 14B, pero no se ha confirmado la ventana efectiva en este ajuste, lo que puede causar errores en conversaciones muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se garantiza la exactitud de las respuestas; los desarrolladores son responsables del uso final.
- Advertencia de producción: para aplicaciones críticas (por ejemplo, asesoramiento legal), se recomienda implementar un sistema de verificación humana y filtros de seguridad, ya que no se han publicado evaluaciones de robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Faqih-Q14b-1.0V-i1-GGUF
- Repositorio GGUF estático: https://huggingface.co/mradermacher/Faqih-Q14b-1.0V-GGUF
- Modelo base: https://huggingface.co/hozifa1/Faqih-Q14b-1.0V
- Dataset de entrenamiento: https://huggingface.co/datasets/hozifa1/faqih_sft_dataset
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Perfil del cuantizador: https://huggingface.co/mradermacher
