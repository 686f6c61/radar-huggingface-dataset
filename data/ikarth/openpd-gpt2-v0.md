# ikarth/openpd-gpt2-v0

## Resumen

openpd-gpt2-v0 es un modelo de lenguaje de tipo GPT-2 small entrenado desde cero por el desarrollador independiente ikarth (usuario de Hugging Face) sobre un corpus estrictamente de dominio público y CC0. Se trata de una reproducción de la arquitectura GPT-2 small (124 millones de parámetros, 12 capas, 12 cabezas de atención, dimensión 768 y contexto de 1.024 tokens) implementada siguiendo la línea de los tutoriales nanoGPT, con la particularidad de que todos los pesos y el propio modelo resultante se publican bajo licencia CC0-1.0. El objetivo declarado es demostrar que es posible entrenar un modelo de lenguaje completo sin recurrir a texto con copyright ni a datos raspados de internet, manteniendo una trazabilidad rigurosa de la procedencia de cada token.

El modelo se entrenó en una única GPU RTX 3090 personal y consumió aproximadamente 2,36 mil millones de tokens (0,24 épocas de un dataset de 9,77 mil millones de tokens denominado openpd-v1), lo que lo sitúa como una prueba de concepto más que como un modelo de producción. La composición del corpus está dominada por libros anteriores a 1929 (Project Gutenberg, Internet Archive, Library of Congress), complemented con jurisprudencia, resúmenes de arXiv, documentos del gobierno estadounidense y registros de IRC de Ubuntu, entre otras fuentes.

Su relevancia actual reside en el ángulo de procedencia y licencia: frente a modelos entrenados con datos web opacos, openpd-gpt2-v0 ofrece un registro verificable (hashes por fichero, revisión de licencias por documento y por fuente) que lo convierte en un caso de estudio útil para investigadores interesados en data provenance, cumplimiento normativo y modelos libres de restricciones de copyright. No obstante, sus capacidades lingüísticas son limitadas y no compite con modelos modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (transformer decoder-only), 12 capas, 12 cabezas, 768 dims, embeddings atados |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | ONNX int8 (pesos de ~170 MB para transformers.js); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es una copia fiel de GPT-2 small: transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión de modelo 768 y embeddings atados entre entrada y salida. El vocabulario se rellenó a 50.304 tokens durante el entrenamiento y se exportó con 50.257. El tokenizador es el BPE de GPT-2 vía `tiktoken` (`gpt2`), que, según el autor, no fue entrenado con datos abiertos, lo que constituye una de las limitaciones declaradas del proyecto. El código procede de la línea build-nanogpt y fue adaptado manualmente; el autor documenta los segmentos de ejecución con sus hashes de commit (`eb0b3af`, `fe60116`, `2928c74`).

El entrenamiento se realizó sobre el dataset openpd-v1, tokenizado con BPE de GPT-2 y con huella sha256 `fbca048694dc8f04…`. El dataset completo contiene 9,77 mil millones de tokens distribuidos en 13 fuentes, pero el checkpoint publicado solo consumió 2,36 mil millones (0,24 épocas). La composición efectiva del entrenamiento fue: Gutenberg 0,526 B, libros pre-1929 0,511 B, Library of Congress 0,279 B, Ubuntu IRC 0,228 B, jurisprudencia 0,175 B, resúmenes de arXiv 0,133 B, USGPO 0,113 B, Biodiversity Heritage Library 0,105 B, PubMed CC0 0,099 B, peS2o 0,073 B, papers de arXiv 0,069 B, Regulations.gov 0,049 B y PEPs 0,001 B. No se empleó texto sintético; los modelos intervinieron únicamente en tareas de extracción y filtrado (OCR, Grobid para PDFs y el pipeline de filtrado de Common Pile). No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base sin alineamiento de seguridad.

## Capacidades

- Generación de texto en inglés con estilo de prosa literaria y ensayística, heredado del predominio de libros anteriores a 1929 en el corpus.
- Continuación de texto libre y muestreo con temperatura (por defecto 0,9, top-k 50, 120 tokens nuevos).
- Generación de texto sobre temática jurídica y administrativa estadounidense (jurisprudencia, regulaciones, documentos del USGPO).
- Cierta familiaridad con literatura científica en formato de resumen (arXiv, PubMed CC0, peS2o).
- Comprensión limitada de conversaciones informales de IRC (con nicknames pseudonimizados).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües: únicamente inglés.
- Capacidad de código muy limitada: el corpus apenas contiene código (solo PEPs, 0,001 B de tokens), por lo que el autor advierte explícitamente que no es fiable para programar.

## Casos de uso

- Investigación en procedencia de datos: el modelo sirve como artefacto de referencia para estudiar cómo se comporta un LM entrenado exclusivamente con texto de dominio público verificado, con registros por fichero y revisión de licencias documentada.
- Auditoría de licencias y cumplimiento: útil en equipos legales o de compliance que necesiten un ejemplo reproducible de modelo CC0 sin riesgo de reclamaciones de copyright sobre los datos de entrenamiento.
- Demostración educativa de entrenamiento desde cero: por su tamaño (124 M) y su linaje nanoGPT, es adecuado para talleres y cursos sobre entrenamiento de transformers en hardware de consumo.
- Generación de texto creativo de estilo histórico: puede emplearse para continuar prosa con registro decimonónico o de principios del siglo XX en ejercicios literarios y experimentos de estilo.
- Prototipado de pipelines de inferencia en el navegador: los pesos ONNX int8 (~170 MB) permiten ejecutar el modelo vía transformers.js en el cliente, útil para demos de inferencia local sin backend.
- Generación de borradores de texto administrativo o jurídico de dominio público: con supervisión humana, puede producir esbozos con terminología propia de jurisprudencia y regulaciones estadounidenses.
- Benchmarking de técnicas de entrenamiento de bajo presupuesto: sirve como línea base para comparar recetas de entrenamiento en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (124 M de parámetros); en fp16, unos 0,25 GB; en int8, unos 0,12 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el propio autor entrenó el modelo en una RTX 3090.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en el navegador mediante transformers.js con los pesos ONNX int8.
- Opciones de despliegue: transformers (pipeline de text-generation), transformers.js (demo en Spaces), ONNX Runtime; compatible con text-generation-inference según los tags del repo. No se documenta soporte específico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Datos de entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| openpd-gpt2-v0 | 124 M | 1.024 | CC0-1.0 | Dominio público y CC0 verificados (2,36 B tokens) | Hugging Face, ONNX, transformers.js |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT (pesos originales) | Web (WebText), no verificable | Hugging Face, múltiples runtimes |
| GPT-2 small reproducido por terceros (varias iniciativas) | ~124 M | 1.024 | variable | variable, a menudo OpenWebText | Hugging Face |
| Modelos pequeños actuales (p. ej. familias de <200 M) | <200 M | variable | variable | variable | Hugging Face |

La comparación relevante no es de rendimiento sino de procedencia: frente a GPT-2 small original, openpd-gpt2-v0 sacrifica cobertura de temas modernos y calidad de generación a cambio de una licencia CC0 y una trazabilidad de datos completa. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad; no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- El tokenizador BPE de GPT-2 no fue entrenado con datos abiertos, lo que rompe parcialmente la promesa de procedencia abierta del proyecto.
- El corpus está dominado por libros anteriores a 1929, por lo que el conocimiento sobre temas modernos es escaso y el estilo puede resultar arcaico.
- Capacidad de código muy limitada: solo 0,001 B de tokens de PEPs, insuficiente para tareas de programación.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas, especialmente en temas posteriores a 1929.
- Solo soporta inglés; no hay capacidades multilingües.
- Contexto de 1.024 tokens, muy corto para conversaciones multi-turno o documentos largos.
- La limpieza de datos fue mínima según el autor, lo que puede introducir ruido, artefactos de OCR y texto mal formateado.
- El estado de dominio público de la fuente Ubuntu IRC se basa en la política de IRC de Ubuntu, no en ley ni en dedicación por autor, lo que puede ser discutible en algunas jurisdicciones.
- El pipeline de filtrado de Common Pile no estaba verificado contra la documentación en el momento del entrenamiento, según la model card.
- No apto para producción sin supervisión humana y sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikarth/openpd-gpt2-v0
- Demo en el navegador (Spaces): https://huggingface.co/spaces/ikarth/openpd-gpt2
- Paper de referencia citado en los tags (arXiv 2305.16264): https://arxiv.org/abs/2305.16264
- Repositorio Common Pile (fuentes de datos): https://huggingface.co/common-pile
- Dataset storytracer/LoC-PD-Books: https://huggingface.co/datasets/storytracer/LoC-PD-Books
